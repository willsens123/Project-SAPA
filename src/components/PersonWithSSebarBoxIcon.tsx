import React from 'react';

interface PersonWithSSebarBoxIconProps {
  className?: string;
}

export const PersonWithSSebarBoxIcon: React.FC<PersonWithSSebarBoxIconProps> = ({ className = 'w-5 h-5' }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      title="List Database A-AJAK Item S-SEBAR"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Person Head */}
        <circle cx="9" cy="6.5" r="3.3" />

        {/* Person Body / Shoulders */}
        <path d="M3 20a6 6 0 0 1 8.5-4.8" />
        <path d="M5.5 14.5a6 6 0 0 1 5-2.2" />

        {/* Box in front of person */}
        <rect x="11" y="10.5" width="11" height="11" rx="2" strokeWidth="1.8" />

        {/* Top tape / fold line on box */}
        <path d="M14 10.5v1.5M19 10.5v1.5" strokeWidth="1.4" opacity="0.6" />

        {/* Letter 'S' inside the box */}
        <path
          d="M18 13.6c-.3-.4-.8-.7-1.4-.7-.9 0-1.5.5-1.5 1.3 0 1.4 2.3 1 2.3 2.3 0 .8-.7 1.4-1.6 1.4-.8 0-1.4-.4-1.7-.8"
          strokeWidth="1.7"
        />
      </svg>
    </div>
  );
};
