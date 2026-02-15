
import React from 'react';

const Loader = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8 border-4',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-5',
    xl: 'w-20 h-20 border-6',
  };

  const colors = {
    primary: 'border-t-[var(--color-primary)] border-[var(--color-primary-light)]',
    white: 'border-t-white border-gray-200/30',
    gray: 'border-t-gray-600 border-gray-200',
  };

  const selectedSize = sizes[size] || sizes.md;
  const selectedColor = colors[color] || colors.primary;

  return (
    <div
      className={`
        ${selectedSize}
        ${selectedColor}
        rounded-full
        animate-spin
        transition-all
        ${className}
      `}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loader;