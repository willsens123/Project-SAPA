import React from 'react';

interface PosterThumbnailProps {
  title?: string;
  imageUrl?: string;
  className?: string;
}

export const PosterThumbnail: React.FC<PosterThumbnailProps> = ({
  title = 'Poster A',
  imageUrl,
  className = '',
}) => {
  if (imageUrl) {
    return (
      <div className={`relative rounded-xl overflow-hidden shrink-0 shadow-xs border border-slate-200 ${className}`}>
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`relative w-14 h-16 sm:w-16 sm:h-18 rounded-xl overflow-hidden shrink-0 shadow-xs border border-amber-300/70 bg-gradient-to-br from-[#0c4a60] via-[#10707f] to-[#e67e22] text-white flex flex-col justify-between p-1.5 select-none ${className}`}
    >
      {/* Top Banner Text */}
      <div className="bg-amber-400 text-slate-900 font-extrabold text-[5.5px] sm:text-[6.5px] px-1 py-0.5 rounded-sm tracking-tight text-center uppercase leading-none shadow-2xs">
        Kalau Orang Dewasa
        <span className="block text-red-600 font-black text-[5px] sm:text-[5.5px]">Baca Buku Anak...</span>
      </div>

      {/* Middle Illustration Icon */}
      <div className="flex-1 flex items-center justify-center relative my-0.5">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100/90 border border-amber-300 flex items-center justify-center shadow-xs">
          <span className="text-base sm:text-lg">🧒📖</span>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="bg-slate-900/80 backdrop-blur-2xs rounded px-1 py-0.5 text-center">
        <span className="text-[5px] sm:text-[5.5px] font-bold text-amber-300 block leading-tight">
          JADI APA YA?
        </span>
      </div>
    </div>
  );
};
