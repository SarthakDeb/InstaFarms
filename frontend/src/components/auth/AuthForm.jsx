import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AuthForm = ({ formType, onSubmit, isLoading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // For signup
  const [formError, setFormError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (formType === 'signup' && password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (!email || !password) {
      setFormError("Email and password are required.");
      return;
    }
    onSubmit({ email, password });
  };

  const isSignup = formType === 'signup';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md p-8 space-y-6 bg-card-light dark:bg-card-dark rounded-xl shadow-2xl"
    >
      <h2 className="text-3xl font-bold text-center text-primary dark:text-primary-light">
        {isSignup ? 'Create Account' : 'Welcome Back!'}
      </h2>
      {error && <p className="text-sm text-center text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300 p-3 rounded-md">{error}</p>}
      {formError && <p className="text-sm text-center text-red-500 bg-red-100 dark:bg-red-900 dark:text-red-300 p-3 rounded-md">{formError}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="email"
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          name="password"
          required
        />
        {isSignup && (
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            name="confirmPassword"
            required
          />
        )}
        <Button type="submit" variant="primary" className="w-full py-3" isLoading={isLoading} disabled={isLoading}>
          {isSignup ? 'Sign Up' : 'Log In'}
        </Button>
      </form>
      <div className="text-sm text-center text-text-muted-light dark:text-text-muted-dark">
        {isSignup ? (
          <>
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline dark:text-primary-light">
              Log in
            </Link>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:underline dark:text-primary-light">
              Sign up
            </Link>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default AuthForm;