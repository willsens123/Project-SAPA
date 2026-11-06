import React from 'react';

interface ItemSSalurIconProps {
  className?: string;
}

export const ItemSSalurIcon: React.FC<ItemSSalurIconProps> = ({ className = 'w-5 h-5' }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      title="Item S-SALUR"
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

        {/* Box vertical division at bottom & top */}
        <path
          d="M12 21.5V19.5M12 12V12.5"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Stylized letter 'S' in front of the box */}
        <path
          d="M14.5 13.5C14.1 12.8 13.3 12.3 12 12.3C10.7 12.3 9.8 12.9 9.8 13.9C9.8 15 10.9 15.4 12.3 15.8C13.8 16.2 14.8 16.7 14.8 18C14.8 19.2 13.7 20 12 20C10.4 20 9.5 19.2 9.1 18.3"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
