import React from 'react';

const IDBIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5zm0 2.18l7 3.91v5.41c0 4.36-2.88 8.42-7 9.72-4.12-1.3-7-5.36-7-9.72V8.09l7-3.91zM10 10v6h1.5v-6H10zm2.5 0v6H14v-6h-1.5zM8 11v4h1v-4H8z" />
    </svg>
  );
};

export default IDBIcon;
