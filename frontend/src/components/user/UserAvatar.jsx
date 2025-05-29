import React from 'react';

const UserAvatar = ({ src, name, size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-12 w-12 text-lg',
    lg: 'h-20 w-20 text-2xl',
    xl: 'h-32 w-32 text-4xl',
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center bg-gray-300 dark:bg-gray-600 text-text-light dark:text-text-dark font-semibold overflow-hidden ${sizeClasses[size]} ${className}`}
      title={name}
    >
      {src ? (
        <img src={src} alt={name || 'User Avatar'} className="object-cover w-full h-full" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

export default UserAvatar;