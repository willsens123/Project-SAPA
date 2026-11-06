import React from 'react';

interface AAjakSSalurLogoProps {
  className?: string;
  variant?: 'basket' | 'box' | 'badge';
  customUrl?: string | null;
}

export const AAjakSSalurLogo: React.FC<AAjakSSalurLogoProps> = ({
  className = 'w-5 h-5',
  variant = 'basket',
  customUrl,
}) => {
  if (customUrl) {
    return (
      <img
        src={customUrl}
        alt="Logo A-AJAK S-SALUR"
        className={`object-cover rounded-md ${className}`}
      />
    );
  }

  if (variant === 'box') {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
        title="Logo A-AJAK S-SALUR (Box)"
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
          <circle cx="8" cy="6" r="3" />
          {/* Person Body */}
          <path d="M2.5 19.5a5.5 5.5 0 0 1 8-4.5" />
          {/* Box Package */}
          <rect x="11.5" y="10" width="10.5" height="10.5" rx="1.5" strokeWidth="1.8" />
          {/* Top tape */}
          <path d="M14.5 10v1.5M19 10v1.5" strokeWidth="1.3" opacity="0.7" />
          {/* Letter S inside Box */}
          <path
            d="M18.5 13.5c-.3-.4-.8-.7-1.4-.7-.9 0-1.4.5-1.4 1.2 0 1.3 2.1 1 2.1 2.2 0 .8-.7 1.3-1.5 1.3-.8 0-1.3-.4-1.6-.8"
            strokeWidth="1.6"
          />
        </svg>
      </div>
    );
  }

  // Default: Person (A-AJAK) with S-SALUR Basket
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      title="Logo A-AJAK S-SALUR"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        stroke="currentColor"
      >
        {/* Person Head (A-AJAK volunteer) */}
        <circle cx="7.5" cy="5.5" r="2.8" strokeWidth="1.8" />
        {/* Person Torso */}
        <path
          d="M2 19c0-3 2.4-5 5.5-5 .8 0 1.6.2 2.2.5"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* S-SALUR Basket */}
        {/* Basket handles */}
        <path d="M13.5 10.5l2-3.2M21 10.5l-2-3.2" strokeWidth="1.6" strokeLinecap="round" />
        {/* Basket body */}
        <path
          d="M11.5 10.5h10.5l-1.3 8.3c-.1.7-.7 1.2-1.4 1.2h-6.5c-.7 0-1.3-.5-1.4-1.2L11.5 10.5z"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Stylized 'S' inside the basket */}
        <path
          d="M18.2 13.3c-.2-.4-.6-.7-1.2-.7-.7 0-1.1.4-1.1 1 0 1.1 1.7.8 1.7 1.9 0 .7-.6 1.1-1.3 1.1-.7 0-1.1-.3-1.3-.7"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
