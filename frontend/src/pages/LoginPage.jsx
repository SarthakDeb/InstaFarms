import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthForm from '../components/auth/AuthForm';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, currentUser, loading, authError, setAuthError } = useAuth();

  const from = location.state?.from?.pathname || "/society"; // Default redirect to society

  useEffect(() => {
  if (currentUser) { // If already logged in with our custom auth
    navigate(from, { replace: true });
  }
  setAuthError(null); // Clear errors on mount
}, [currentUser, navigate, from, setAuthError]);

  const handleLogin = async ({ email, password }) => {
    await signIn(email, password);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-background-light to-secondary/10 dark:from-primary/20 dark:via-background-dark dark:to-secondary/20 p-4"
    >
      <AuthForm
        formType="login"
        onSubmit={handleLogin}
        isLoading={loading}
        error={authError}
      />
    </motion.div>
  );
};

export default LoginPage;