import React from 'react';

interface ItemAAjarIconProps {
  className?: string;
}

export const ItemAAjarIcon: React.FC<ItemAAjarIconProps> = ({ className = 'w-5 h-5' }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      title="Item A-AJAR"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        stroke="currentColor"
      >
        {/* Box body / Package outline */}
        <path
          d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Top folds / flaps */}
        <path
          d="M3.3 7L12 12L20.7 7"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Box vertical division at bottom */}
        <path
          d="M12 21.5V19.8"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Stylized letter 'A' inside the box */}
        <path
          d="M9.2 19.5L12 12.5L14.8 19.5M10.1 17.2h3.8"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
