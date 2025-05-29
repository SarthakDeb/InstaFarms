import React from 'react';

const Input = ({ type = 'text', placeholder, value, onChange, name, id, className = '', error, ...props }) => {
  const baseClass = "input-field"; // Defined in index.css
  const errorClass = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary-light focus:ring-primary dark:focus:ring-primary-light';

  return (
    <div className="w-full">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        id={id || name}
        className={`${baseClass} ${errorClass} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Input;