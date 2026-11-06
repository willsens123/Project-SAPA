import React from 'react';

interface BookCoverProps {
  coverKey?: 'demi-kepentingan' | 'menjadi-buddha' | 'jalan-menuju' | 'lakon-hidup' | 'intisari-amerta' | 'leaders-way';
  imageUrl?: string;
  title?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BookCover: React.FC<BookCoverProps> = ({
  coverKey = 'demi-kepentingan',
  imageUrl,
  title,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-10 h-13 text-[6px]',
    md: 'w-13 h-17 sm:w-14 sm:h-18 text-[7px]',
    lg: 'w-20 h-24 sm:w-24 sm:h-28 text-[9px]',
  }[size];

  if (imageUrl) {
    return (
      <div className={`relative rounded-lg overflow-hidden shrink-0 shadow-xs border border-slate-200 bg-slate-100 ${sizeClasses} ${className}`}>
        <img src={imageUrl} alt={title || 'Book Cover'} className="w-full h-full object-cover" />
      </div>
    );
  }

  if (coverKey === 'jalan-menuju') {
    return (
      <div
        className={`relative rounded-lg overflow-hidden shrink-0 shadow-xs border border-sky-200 bg-gradient-to-b from-[#bde0f5] via-[#a8d3ee] to-[#7bb9db] text-slate-800 flex flex-col justify-between p-1 select-none ${sizeClasses} ${className}`}
      >
        <div className="text-center font-bold tracking-tight text-[6.5px] sm:text-[7.5px] leading-tight text-slate-800 pt-0.5">
          Jalan Menuju
          <span className="block text-[6px] sm:text-[7px] font-semibold text-sky-900">Kemahatahuan</span>
        </div>
        <div className="flex-1 flex items-center justify-center my-0.5">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/70 backdrop-blur-2xs flex items-center justify-center border border-sky-300/60 shadow-2xs">
            <span className="text-amber-500 text-xs sm:text-sm">🏛️</span>
          </div>
        </div>
        <div className="text-[5px] sm:text-[6px] text-sky-950 text-center font-serif leading-tight">
          Panchen Losang
        </div>
      </div>
    );
  }

  if (coverKey === 'demi-kepentingan') {
    return (
      <div
        className={`relative rounded-lg overflow-hidden shrink-0 shadow-xs border border-amber-300/80 bg-gradient-to-b from-[#e8c17b] via-[#d6a54f] to-[#456b68] text-white flex flex-col justify-between p-1 select-none ${sizeClasses} ${className}`}
      >
        <div className="text-center font-bold tracking-tight text-[6.5px] sm:text-[7.5px] leading-tight text-amber-950 pt-0.5 drop-shadow-2xs">
          Demi Kepentingan
          <span className="block text-[6px] sm:text-[7px] font-semibold text-amber-900">Semua Makhluk</span>
        </div>
        <div className="flex-1 flex items-center justify-center my-0.5">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-100/90 flex items-center justify-center border border-amber-400 shadow-2xs">
            <span className="text-amber-600 text-xs sm:text-sm">🧘</span>
          </div>
        </div>
        <div className="text-[5px] sm:text-[6px] text-amber-100 text-center font-serif leading-tight drop-shadow-2xs">
          Dalai Lama XIV
        </div>
      </div>
    );
  }

  if (coverKey === 'menjadi-buddha') {
    return (
      <div
        className={`relative rounded-lg overflow-hidden shrink-0 shadow-xs border border-amber-300 bg-gradient-to-b from-[#fcd34d] via-[#f59e0b] to-[#d97706] text-white flex flex-col justify-between p-1 select-none ${sizeClasses} ${className}`}
      >
        <div className="text-center font-bold tracking-tight text-[6.5px] sm:text-[7.5px] leading-tight text-amber-950 pt-0.5">
          Menjadi Buddha
          <span className="block text-[6px] sm:text-[7px] font-medium text-amber-900">di Tempat Kerja</span>
        </div>
        <div className="flex-1 flex items-center justify-center my-0.5">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/80 flex items-center justify-center border border-amber-400 shadow-2xs">
            <span className="text-amber-700 text-xs sm:text-sm">🏢</span>
          </div>
        </div>
        <div className="text-[5px] sm:text-[6px] text-amber-950 text-center font-sans leading-tight">
          Metcalf & Gallagher
        </div>
      </div>
    );
  }

  if (coverKey === 'jalan-menuju') {
    return (
      <div
        className={`relative rounded-lg overflow-hidden shrink-0 shadow-xs border border-teal-300/60 bg-gradient-to-b from-[#285e61] via-[#234e52] to-[#1d4044] text-white flex flex-col justify-between p-1.5 select-none ${sizeClasses} ${className}`}
      >
        <div className="text-center font-bold tracking-tight text-[7px] sm:text-[8px] leading-tight text-teal-100 drop-shadow-xs">
          Jalan Menuju
          <span className="block text-[6px] sm:text-[7px] font-medium text-emerald-200">Kemahatahuan</span>
        </div>
        <div className="flex-1 flex items-center justify-center my-0.5">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-teal-300/20 flex items-center justify-center border border-teal-200/40">
            <span className="text-teal-100 text-xs sm:text-sm">🏛️</span>
          </div>
        </div>
        <div className="text-[5.5px] sm:text-[6.5px] text-teal-200/90 text-center font-sans">
          Tuntunan Dhamma
        </div>
      </div>
    );
  }

  if (coverKey === 'lakon-hidup') {
    return (
      <div
        className={`relative rounded-lg overflow-hidden shrink-0 shadow-xs border border-orange-200 bg-gradient-to-b from-[#ffedd5] via-[#fed7aa] to-[#fb923c] text-slate-800 flex flex-col justify-between p-1.5 select-none ${sizeClasses} ${className}`}
      >
        <div className="text-center font-bold tracking-tight text-[7px] sm:text-[8px] leading-tight text-orange-950">
          Lakon Hidup
          <span className="block text-[6px] sm:text-[7px] font-semibold text-orange-800">Sang Penerang</span>
        </div>
        <div className="flex-1 flex items-center justify-center my-0.5">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/70 flex items-center justify-center border border-orange-300/60 shadow-xs">
            <span className="text-orange-600 text-xs sm:text-sm">🔆</span>
          </div>
        </div>
        <div className="text-[5.5px] sm:text-[6.5px] text-orange-900 text-center font-medium">
          Biografi Suci
        </div>
      </div>
    );
  }

  if (coverKey === 'intisari-amerta') {
    return (
      <div
        className={`relative rounded-lg overflow-hidden shrink-0 shadow-xs border border-cyan-300 bg-gradient-to-b from-[#e0f2fe] via-[#bae6fd] to-[#38bdf8] text-slate-800 flex flex-col justify-between p-1.5 select-none ${sizeClasses} ${className}`}
      >
        <div className="text-center font-bold tracking-tight text-[7px] sm:text-[8px] leading-tight text-sky-950">
          Intisari
          <span className="block text-[6px] sm:text-[7px] font-semibold text-sky-800">Amerta</span>
        </div>
        <div className="flex-1 flex items-center justify-center my-0.5">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/80 flex items-center justify-center border border-sky-300 shadow-xs">
            <span className="text-sky-600 text-xs sm:text-sm">☸️</span>
          </div>
        </div>
        <div className="text-[5.5px] sm:text-[6.5px] text-sky-900 text-center font-medium">
          Dharma Karsa
        </div>
      </div>
    );
  }

  // default 'leaders-way'
  return (
    <div
      className={`relative rounded-lg overflow-hidden shrink-0 shadow-xs border border-amber-300 bg-gradient-to-b from-[#fef3c7] via-[#fde68a] to-[#f59e0b] text-slate-900 flex flex-col justify-between p-1.5 select-none ${sizeClasses} ${className}`}
    >
      <div className="text-center font-bold tracking-tight text-[7px] sm:text-[8px] leading-tight text-amber-950">
        The Leader's
        <span className="block text-[6px] sm:text-[7px] font-semibold text-amber-900">Way</span>
      </div>
      <div className="flex-1 flex items-center justify-center my-0.5">
        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/80 flex items-center justify-center border border-amber-300 shadow-xs">
          <span className="text-amber-700 text-xs sm:text-sm">👑</span>
        </div>
      </div>
      <div className="text-[5.5px] sm:text-[6.5px] text-amber-950 text-center font-medium">
        Kepemimpinan
      </div>
    </div>
  );
};
