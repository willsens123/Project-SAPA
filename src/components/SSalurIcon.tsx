import React from 'react';

interface SSalurIconProps {
  className?: string;
}

export const SSalurIcon: React.FC<SSalurIconProps> = ({ className = 'w-5 h-5' }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} title="Transaksi S-SALUR">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        stroke="currentColor"
      >
        {/* Basket handles arched upward */}
        <path
          d="M6 8.5L9.5 2.5M18 8.5L14.5 2.5"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Basket body / rim */}
        <path
          d="M2.5 8.5H21.5L19.4 19.5C19.2 20.6 18.2 21.5 17.1 21.5H6.9C5.8 21.5 4.8 20.6 4.6 19.5L2.5 8.5Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Stylized 'S' Symbol centered inside the basket */}
        <path
          d="M14.5 12.2C14.1 11.5 13.3 11 12 11C10.7 11 9.8 11.6 9.8 12.6C9.8 13.7 10.8 14.2 12.3 14.6C13.8 15 14.8 15.6 14.8 16.9C14.8 18.1 13.7 19 12 19C10.4 19 9.5 18.2 9.1 17.3"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
