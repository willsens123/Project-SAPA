import React from 'react';

export const AvatarMascot: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => {
  return (
    <div className={`relative flex-shrink-0 select-none ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-sm overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Yellow circle background */}
        <circle cx="50" cy="50" r="44" fill="#FBC227" stroke="#231F20" strokeWidth="3" />

        {/* Character Hair Back */}
        <path
          d="M 12 46 C 4 36 8 24 20 22 C 22 14 32 8 46 8 C 62 8 76 16 82 26 C 94 28 98 40 92 52 C 86 64 80 66 80 66 L 76 76 L 24 76 L 18 64 C 18 64 12 56 12 46 Z"
          fill="#6B3A19"
          stroke="#231F20"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Hair spikes details */}
        <path
          d="M 6 36 Q 16 32 24 36 Q 22 20 36 20 Q 42 6 56 10 Q 72 6 78 22 Q 92 18 94 34 Q 99 44 90 56 Q 84 66 78 70"
          fill="#5B3014"
          stroke="#231F20"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Face shape */}
        <path
          d="M 28 42 C 28 36 34 34 50 34 C 66 34 72 36 72 42 C 72 58 68 74 50 75 C 32 74 28 58 28 42 Z"
          fill="#FFDFB8"
          stroke="#231F20"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Ears */}
        <path
          d="M 24 45 C 20 45 20 54 26 56"
          fill="#FFD2A0"
          stroke="#231F20"
          strokeWidth="2"
        />
        <path
          d="M 76 45 C 80 45 80 54 74 56"
          fill="#FFD2A0"
          stroke="#231F20"
          strokeWidth="2"
        />

        {/* Front Hair Bangs */}
        <path
          d="M 24 36 C 30 42 36 46 36 46 C 36 46 40 38 46 44 C 50 48 54 44 58 40 C 62 45 68 46 72 38 C 76 34 70 28 62 26 C 52 24 40 25 30 30 C 26 32 22 34 24 36 Z"
          fill="#7C431E"
          stroke="#231F20"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M 38 32 L 44 42 L 48 34"
          fill="#6B3A19"
          stroke="#231F20"
          strokeWidth="2"
        />

        {/* Eyebrows - Determined / cheeky angle */}
        <path
          d="M 34 44 L 46 46"
          stroke="#231F20"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <path
          d="M 66 43 L 54 46"
          stroke="#231F20"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Eyes */}
        {/* Right eye (wink or grinning squint) */}
        <path
          d="M 34 50 C 37 54 43 54 45 50"
          stroke="#231F20"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="40" cy="51" r="1.5" fill="#231F20" />

        {/* Left eye (big playful anime eye) */}
        <ellipse cx="59" cy="50" rx="4.5" ry="5.5" fill="#231F20" />
        <circle cx="58" cy="48" r="1.8" fill="#FFFFFF" />
        <circle cx="61" cy="52" r="0.8" fill="#FFFFFF" />

        {/* Nose */}
        <circle cx="49" cy="53" r="1" fill="#231F20" />

        {/* Grinning Mouth with teeth */}
        <path
          d="M 40 57 C 40 57 48 68 60 59 C 61 57 58 56 40 57 Z"
          fill="#A82828"
          stroke="#231F20"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {/* Upper teeth white bar */}
        <path
          d="M 43 57.5 Q 49 61 57 58.5 L 56 57 Q 49 57 43 57.5 Z"
          fill="#FFFFFF"
        />

        {/* Cheek marks / blush */}
        <path d="M 30 54 L 34 55 M 31 57 L 35 58" stroke="#F08080" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 65 54 L 69 55 M 66 57 L 70 58" stroke="#F08080" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
};
