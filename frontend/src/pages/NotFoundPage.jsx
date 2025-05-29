import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center p-4"
    >
      <AlertTriangle size={80} className="text-secondary mb-6 animate-pulse" />
      <h1 className="text-6xl font-bold text-text-light dark:text-text-dark mb-4">404</h1>
      <p className="text-2xl text-text-muted-light dark:text-text-muted-dark mb-8">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Button onClick={() => window.history.back()} variant="outline" className="mr-4">
        Go Back
      </Button>
      <Link to="/society">
        <Button variant="primary">Go to Society Page</Button>
      </Link>
    </motion.div>
  );
};

export default NotFoundPage;