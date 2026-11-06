import React from 'react';

interface AAjarIconProps {
  className?: string;
}

export const AAjarIcon: React.FC<AAjarIconProps> = ({ className = 'w-5 h-5' }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      title="Transaksi A-AJAR"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        stroke="currentColor"
      >
        {/* Open Book / Lecture scroll background */}
        <path
          d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stylized letter 'A' inside the book */}
        <path
          d="M9.8 14.5L12 8.5L14.2 14.5M10.4 12.8h3.2"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
