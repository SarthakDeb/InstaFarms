import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import UserAvatar from './UserAvatar';
import { useAuth } from '../../hooks/useAuth';
import { updateUser as apiUpdateUser } from '../../api/userService'; // Renamed to avoid conflict if needed
import { getS3PresignedUrl, uploadFileToS3 } from '../../services/s3UploadService'; // Your new S3 service
import { Camera } from 'lucide-react';

const ProfileEditModal = ({ isOpen, onClose }) => {
  const { currentUser, refreshBackendUser, setCurrentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '', // Will be read-only
    phone: '',
    date_of_birth: '',
  });
  const [imageFile, setImageFile] = useState(null); 
  const [imagePreview, setImagePreview] = useState(''); 
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        date_of_birth: currentUser.date_of_birth ? new Date(currentUser.date_of_birth).toISOString().split('T')[0] : '',
      });
      setImagePreview(currentUser.profile_image_url || '');
    }
    setImageFile(null); 
    setError('');
    setSuccessMessage('');
  }, [currentUser, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image size should be less than 5MB.");
        setImageFile(null);
        setImagePreview(currentUser?.profile_image_url || ''); 
        return;
      }
      setImageFile(file); 
      setImagePreview(URL.createObjectURL(file)); // Show local preview
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    if (!currentUser) {
      setError("User not authenticated. Please log in again.");
      setIsLoading(false);
      return;
    }

    let finalImageUrl = currentUser.profile_image_url; // Default to existing image

    try {
      if (imageFile) {
        const s3Data = await getS3PresignedUrl(imageFile.name, imageFile.type, currentUser.id);
        await uploadFileToS3(s3Data.uploadUrl, imageFile);
        finalImageUrl = s3Data.objectUrl; 
      }

      const dataToUpdate = {
        name: formData.name,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth || null,
        profile_image_url: finalImageUrl, // This will be the new S3 URL or the existing one
      };
      
      const updatedUserFromBackend = await apiUpdateUser(currentUser.id, dataToUpdate);
      
      setCurrentUser(updatedUserFromBackend); 
      
      setSuccessMessage("Profile updated successfully!");
      setImageFile(null); 
      
      setTimeout(() => {
        onClose(); // Close modal
        setSuccessMessage(''); // Clear success message
      }, 1500);

    } catch (err) {
      console.error("Profile update error:", err);
      const apiError = (err.response && err.response.data && err.response.data.error) 
                       ? err.response.data.error 
                       : err.message || "Failed to update profile. Please try again.";
      setError(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Profile" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
        <div className="flex flex-col items-center space-y-3">
          <div className="relative group">
            <UserAvatar src={imagePreview} name={formData.name || currentUser?.name} size="xl" />
            <label 
              htmlFor="profileImageUploadS3" 
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity duration-300"
              title="Change profile photo"
            >
              <Camera size={32} className="text-white" />
            </label>
          </div>
          <input 
            type="file" 
            id="profileImageUploadS3" 
            accept="image/jpeg, image/png, image/gif, image/webp" 
            onChange={handleImageChange} 
            className="hidden" 
          />
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => document.getElementById('profileImageUploadS3').click()} 
            className="text-sm"
          >
            Change Profile Photo
          </Button>
        </div>

        <div>
          <label htmlFor="name_edit_profile" className="block text-sm font-medium text-text-muted-light dark:text-text-muted-dark mb-1">Full Name</label>
          <Input name="name" id="name_edit_profile" value={formData.name} onChange={handleChange} required placeholder="Your full name"/>
        </div>
        <div>
          <label htmlFor="email_edit_profile" className="block text-sm font-medium text-text-muted-light dark:text-text-muted-dark mb-1">Email Address (read-only)</label>
          <Input name="email" id="email_edit_profile" type="email" value={formData.email} disabled readOnly 
                 className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed" 
                 title="Email cannot be changed here."
          />
        </div>
        <div>
          <label htmlFor="phone_edit_profile" className="block text-sm font-medium text-text-muted-light dark:text-text-muted-dark mb-1">Phone Number</label>
          <Input name="phone" id="phone_edit_profile" value={formData.phone} onChange={handleChange} placeholder="Your phone number (optional)"/>
        </div>
        <div>
          <label htmlFor="date_of_birth_edit_profile" className="block text-sm font-medium text-text-muted-light dark:text-text-muted-dark mb-1">Date of Birth</label>
          <Input name="date_of_birth" id="date_of_birth_edit_profile" type="date" value={formData.date_of_birth} onChange={handleChange} />
        </div>
        
        {error && <p className="text-sm text-red-500 text-center bg-red-100 dark:bg-red-900 dark:text-red-300 p-2 rounded-md animate-fadeIn">{error}</p>}
        {successMessage && <p className="text-sm text-green-600 text-center bg-green-100 dark:bg-green-900 dark:text-green-300 p-2 rounded-md animate-fadeIn">{successMessage}</p>}

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">Cancel</Button>
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading} className="w-full sm:w-auto">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProfileEditModal;