import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose} // Close on overlay click
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`bg-card-light dark:bg-card-dark rounded-lg shadow-xl p-6 w-full ${sizeClasses[size]} relative overflow-y-auto max-h-[90vh]`}
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside modal content
          >
            <div className="flex items-center justify-between mb-4">
              {title && <h3 className="text-xl font-semibold text-text-light dark:text-text-dark">{title}</h3>}
              <button
                onClick={onClose}
                className="p-1 rounded-full text-text-muted-light hover:text-text-light dark:text-text-muted-dark dark:hover:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            <div className="text-text-light dark:text-text-dark">
                {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.getElementById('modal-root') // Make sure you have <div id="modal-root"></div> in your public/index.html
  );
};

export default Modal;