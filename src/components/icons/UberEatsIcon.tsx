import React from 'react';

const UberEatsIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <rect width="24" height="24" rx="4" fill="currentColor"/>
      <path d="M5 8h2v5c0 1.1.9 2 2 2s2-.9 2-2V8h2v5c0 2.2-1.8 4-4 4s-4-1.8-4-4V8zm9 0h5v2h-3v2h3v2h-3v2h3v2h-5V8z" fill="#06C167"/>
    </svg>
  );
};

export default UberEatsIcon;
