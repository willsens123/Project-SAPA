import React from 'react';

interface PersonWithGlassesIconProps {
  className?: string;
}

export const PersonWithGlassesIcon: React.FC<PersonWithGlassesIconProps> = ({ className = 'w-5 h-5' }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      title="List Dharma Patron Rutin"
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
        {/* Head outline */}
        <circle cx="12" cy="7.5" r="4.2" />

        {/* Glasses: Left round lens */}
        <circle cx="10" cy="7.5" r="1.4" />
        {/* Right round lens */}
        <circle cx="14" cy="7.5" r="1.4" />
        {/* Bridge */}
        <path d="M11.4 7.5h1.2" />
        {/* Left temple / arm */}
        <path d="M8.6 7.5h-.7" />
        {/* Right temple / arm */}
        <path d="M15.4 7.5h.7" />

        {/* Shoulders / Upper Body */}
        <path d="M5.5 20.5a6.5 6.5 0 0 1 13 0" />
      </svg>
    </div>
  );
};
