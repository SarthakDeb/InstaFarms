import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/auth/AuthForm';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signUp, currentUser, loading, authError, setAuthError } = useAuth();

  useEffect(() => {
  if (currentUser) { // If signup successful and user is set
    navigate('/profile', { replace: true }); // Navigate to profile to complete details
  }
  setAuthError(null); // Clear errors on mount
}, [currentUser, navigate, setAuthError]);

  const handleSignup = async ({ email, password }) => {
    await signUp(email, password);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background-light to-secondary/10 dark:from-primary/20 dark:via-background-dark dark:to-secondary/20 p-4"
    >
      <AuthForm
        formType="signup"
        onSubmit={handleSignup}
        isLoading={loading}
        error={authError}
      />
    </motion.div>
  );
};

export default SignupPage;