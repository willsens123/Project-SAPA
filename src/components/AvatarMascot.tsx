import React from 'react';

export const AvatarMascot: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => {
  return (
    <div
      className={`relative flex-shrink-0 select-none rounded-full overflow-hidden drop-shadow-sm ${className}`}
    >
      <img
        src="/assets/aistudio/image_803fe2ef.png"
        alt="Maskot Proyek SAPA"
        className="w-full h-full object-cover scale-[1.03] select-none pointer-events-none"
        draggable={false}
      />
    </div>
  );
};
