import React from 'react';
import { FolderPlus, FolderInput, MessageSquare, X } from 'lucide-react';

interface FunnelingActionBarProps {
  selectedCount: number;
  itemLabel?: string;
  onClearSelection: () => void;
  onCreateGroupFunneling: () => void;
  onTambahKeGroupExisting: () => void;
  onKirimPM?: () => void;
}

export const FunnelingActionBar: React.FC<FunnelingActionBarProps> = ({
  selectedCount,
  itemLabel = 'data',
  onClearSelection,
  onCreateGroupFunneling,
  onTambahKeGroupExisting,
  onKirimPM,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky bottom-4 z-40 bg-slate-900/90 text-white backdrop-blur-md px-4 sm:px-6 py-3 rounded-2xl sm:rounded-full shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 mt-4 border border-slate-700/50">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#008d91] animate-pulse" />
        <span className="text-xs sm:text-sm font-semibold tracking-wide">
          {selectedCount} {itemLabel} dipilih
        </span>
      </div>

      <div className="flex items-center flex-wrap gap-2">
        {/* Create Group Funneling */}
        <button
          type="button"
          onClick={onCreateGroupFunneling}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#008d91] hover:bg-[#00787c] active:bg-[#006568] text-white text-xs font-semibold rounded-full cursor-pointer transition-all shadow-xs hover:shadow-teal-900/20"
          title="Buat Group Funneling baru dengan data terpilih"
        >
          <FolderPlus className="w-3.5 h-3.5" />
          <span>Create Group Funneling</span>
        </button>

        {/* Tambah ke Group Funneling Existing */}
        <button
          type="button"
          onClick={onTambahKeGroupExisting}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white border border-slate-600/80 text-xs font-semibold rounded-full cursor-pointer transition-all shadow-xs"
          title="Masukkan data terpilih ke Group Funneling yang sudah ada"
        >
          <FolderInput className="w-3.5 h-3.5 text-teal-400" />
          <span>Tambah ke Group Funneling Existing</span>
        </button>

        {/* Kirim PM */}
        {onKirimPM && (
          <button
            type="button"
            onClick={onKirimPM}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-white border border-slate-600/80 text-xs font-semibold rounded-full cursor-pointer transition-all shadow-xs"
            title="Kirim Private Message ke data terpilih"
          >
            <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
            <span>Kirim PM</span>
          </button>
        )}

        {/* Cancel Selection */}
        <button
          type="button"
          onClick={onClearSelection}
          className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer ml-1"
          title="Batal pilih semua"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
