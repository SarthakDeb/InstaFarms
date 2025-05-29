import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createUser } from '../api/userService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import UserAvatar from '../components/user/UserAvatar'; // For potential preview
import { uploadImage } from '../firebase/storageService';
import { Camera } from 'lucide-react';
import { motion } from 'framer-motion';

const CompleteProfilePage = () => {
  const navigate = useNavigate();
  const { firebaseUser, currentUser, setCurrentUser, loading: authLoading, refreshBackendUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date_of_birth: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!firebaseUser || currentUser)) {
      // If not logged into Firebase, or if backend profile already exists, redirect
      navigate(currentUser ? '/society' : '/login', { replace: true });
    }
  }, [firebaseUser, currentUser, authLoading, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size should be less than 5MB.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firebaseUser) {
      setError("Authentication error. Please try logging in again.");
      return;
    }
    if (!formData.name || !formData.date_of_birth) {
      setError("Full name and date of birth are required.");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let profileImageUrl = null;
      if (imageFile) {
        profileImageUrl = await uploadImage(imageFile, firebaseUser.uid, `profile-${Date.now()}`);
      }

      const profileData = {
        ...formData,
        email: firebaseUser.email, // Email from Firebase auth
        profile_image_url: profileImageUrl,
        // We might need to send firebase_uid to the backend if the table has it
      };

      const newBackendUser = await createUser(profileData);
      setCurrentUser(newBackendUser); // Update AuthContext
      await refreshBackendUser(newBackendUser.id); // Ensure full context is up-to-date
      navigate('/society', { replace: true });
    } catch (err) {
      console.error("Error completing profile:", err);
      setError(err.response?.data?.error || err.message || "Failed to create profile. Email might already be in use with another profile or server error.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><p>Loading authentication state...</p></div>;
  if (!firebaseUser) return null; // Should be redirected by useEffect

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background-light to-secondary/10 dark:from-primary/20 dark:via-background-dark dark:to-secondary/20 p-4"
    >
      <div className="w-full max-w-lg p-8 space-y-6 bg-card-light dark:bg-card-dark rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-primary dark:text-primary-light">Complete Your Profile</h2>
        <p className="text-center text-text-muted-light dark:text-text-muted-dark">
          Welcome! Just a few more details to get you started.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative group">
              <UserAvatar src={imagePreview} name={formData.name} size="xl" />
              <label htmlFor="profileImageUpload" className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity duration-300">
                <Camera size={32} className="text-white" />
              </label>
            </div>
            <input type="file" id="profileImageUpload" accept="image/*" onChange={handleImageChange} className="hidden" />
            <Button type="button" variant="ghost" onClick={() => document.getElementById('profileImageUpload').click()} className="text-sm">
              Upload Profile Photo (Optional)
            </Button>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-muted-light dark:text-text-muted-dark mb-1">Full Name <span className="text-red-500">*</span></label>
            <Input name="name" id="name" value={formData.name} onChange={handleChange} required placeholder="Your full name"/>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-muted-light dark:text-text-muted-dark mb-1">Email Address</label>
            <Input name="email" id="email" type="email" value={firebaseUser.email || ''} disabled readOnly 
                   className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-muted-light dark:text-text-muted-dark mb-1">Phone Number</label>
            <Input name="phone" id="phone" value={formData.phone} onChange={handleChange} placeholder="Your phone number (optional)"/>
          </div>
          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-text-muted-light dark:text-text-muted-dark mb-1">Date of Birth <span className="text-red-500">*</span></label>
            <Input name="date_of_birth" id="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} required />
          </div>

          {error && <p className="text-sm text-red-500 text-center bg-red-100 dark:bg-red-900 dark:text-red-300 p-2 rounded-md animate-fadeIn">{error}</p>}

          <Button type="submit" variant="primary" className="w-full py-3" isLoading={isLoading} disabled={isLoading}>
            Save Profile & Continue
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default CompleteProfilePage;