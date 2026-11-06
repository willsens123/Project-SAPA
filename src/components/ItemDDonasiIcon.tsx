import React from 'react';

interface ItemDDonasiIconProps {
  className?: string;
}

export const ItemDDonasiIcon: React.FC<ItemDDonasiIconProps> = ({ className = 'w-5 h-5' }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      title="Item D-DONASI"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        stroke="currentColor"
      >
        {/* Kotak / Package Box body */}
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
          d="M12 21.5V19.5"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Stylized letter 'D' centered inside the box */}
        <path
          d="M9.5 12.8v6.2h2.8a3.1 3.1 0 0 0 0-6.2H9.5Z"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
