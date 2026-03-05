import React from "react";

const Loader = ({
  size = "md",
  color = "primary",
  text = "Loading...",
  fullScreen = false,
  className = "",
}) => {
  const sizes = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-4",
    lg: "w-14 h-14 border-4",
    xl: "w-20 h-20 border-[5px]",
  };

  const colors = {
    primary:
      "border-t-[var(--color-primary)] border-r-[var(--color-primary-light)] border-b-[var(--color-primary-light)] border-l-[var(--color-primary-light)]",
    white:
      "border-t-white border-r-white/30 border-b-white/30 border-l-white/30",
    gray:
      "border-t-gray-600 border-r-gray-200 border-b-gray-200 border-l-gray-200",
  };

  const selectedSize = sizes[size] || sizes.md;
  const selectedColor = colors[color] || colors.primary;

  const content = (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Spinner */}
      <div
        className={`
          ${selectedSize}
          ${selectedColor}
          rounded-full
          animate-spin
          ease-linear
        `}
        role="status"
        aria-label="Loading"
      />

      {/* Optional Text */}
      {text && (
        <p className="text-sm font-medium text-gray-500 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;