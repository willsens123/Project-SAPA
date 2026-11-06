import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  EyeOff,
  Eye,
  Search,
  SlidersHorizontal,
  Plus,
  ChevronDown,
  X,
  Check,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { QuickReplyItem, TENTANG_OPTIONS } from '../quickReplyData';

interface FormQuickReplyProps {
  onCancel: () => void;
  onSave: (item: QuickReplyItem) => void;
  editingItem?: QuickReplyItem | null;
  onShowToast?: (msg: string) => void;
}

export const FormQuickReply: React.FC<FormQuickReplyProps> = ({
  onCancel,
  onSave,
  editingItem,
  onShowToast = (_msg: string) => {},
}) => {
  const [tentang, setTentang] = useState('');
  const [tentangSearch, setTentangSearch] = useState('');
  const [tentangDropdownOpen, setTentangDropdownOpen] = useState(false);
  const tentangRef = useRef<HTMLDivElement | null>(null);

  const [quickReply, setQuickReply] = useState('');
  const [gambar, setGambar] = useState<string>('');
  const [isiTeks, setIsiTeks] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (tentangRef.current && !tentangRef.current.contains(e.target as Node)) {
        setTentangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    if (editingItem) {
      setTentang(editingItem.tentang || '');
      setTentangSearch(editingItem.tentang || '');
      setQuickReply(editingItem.quickReply || '');
      setGambar(editingItem.gambar || '');
      setIsiTeks(editingItem.isiTeks || '');
    } else {
      setTentang('');
      setTentangSearch('');
      setQuickReply('');
      setGambar('');
      setIsiTeks('');
    }
    setError('');
  }, [editingItem]);

  const filteredTentang = useMemo(() => {
    if (!tentangSearch.trim()) return TENTANG_OPTIONS;
    return TENTANG_OPTIONS.filter((opt) =>
      opt.toLowerCase().includes(tentangSearch.toLowerCase())
    );
  }, [tentangSearch]);

  const handleSelectTentang = (val: string) => {
    setTentang(val);
    setTentangSearch(val);
    setTentangDropdownOpen(false);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setGambar(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!quickReply.trim()) {
      setError('Quick Reply wajib diisi (contoh: /STOREorder)');
      return;
    }

    if (!isiTeks.trim()) {
      setError('Isi Teks wajib diisi');
      return;
    }

    const itemToSave: QuickReplyItem = {
      id: editingItem ? editingItem.id : `qr-${Date.now()}`,
      tentang: tentang.trim() || 'STORE',
      quickReply: quickReply.trim(),
      gambar: gambar.trim() || undefined,
      isiTeks: isiTeks.trim(),
      createdAt: editingItem?.createdAt || '15 Nov 2021',
    };

    onSave(itemToSave);
    onShowToast(
      `Quick Reply "${itemToSave.quickReply}" berhasil ${
        editingItem ? 'diperbarui' : 'disimpan'
      }`
    );
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-100 min-h-[580px] flex flex-col justify-between transition-all font-['Plus_Jakarta_Sans',sans-serif]">
      <div>
        {/* Top Action Toolbar matching Image 2 */}
        <div className="flex items-center justify-end gap-3 mb-8">
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            title="Sembunyikan / Tampilkan"
          >
            <EyeOff className="w-5 h-5 stroke-[1.8]" />
          </button>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('form-quick-reply-input');
              if (el) el.focus();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            title="Fokus Input"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>

          <button
            type="button"
            onClick={() => setTentangDropdownOpen(!tentangDropdownOpen)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              tentangDropdownOpen
                ? 'text-[#008d91] bg-teal-50'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title="Pilih Tentang"
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>

          <button
            type="button"
            onClick={() => handleSubmit()}
            className="px-5 py-2 bg-[#008d91] hover:bg-[#007a7e] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs shadow-[#008d91]/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-600 animate-in fade-in max-w-xl">
            {error}
          </div>
        )}

        {/* Form Body matching Image 2 exactly */}
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
          {/* 1. Tentang */}
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2 sm:gap-4">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Tentang
            </label>
            <div className="relative" ref={tentangRef}>
              <div
                onClick={() => setTentangDropdownOpen(!tentangDropdownOpen)}
                className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-all shadow-2xs"
              >
                <input
                  type="text"
                  value={tentangDropdownOpen ? tentangSearch : tentang || ''}
                  onChange={(e) => {
                    setTentangSearch(e.target.value);
                    setTentang(e.target.value);
                  }}
                  onFocus={() => setTentangDropdownOpen(true)}
                  placeholder="Search..."
                  className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent cursor-pointer"
                />
                <div className="w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 ml-2 shadow-xs">
                  <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>

              {tentangDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 max-h-48 overflow-y-auto">
                  {filteredTentang.length === 0 ? (
                    <div
                      className="px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-xl cursor-pointer"
                      onClick={() => handleSelectTentang(tentangSearch)}
                    >
                      Gunakan: "{tentangSearch}"
                    </div>
                  ) : (
                    filteredTentang.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectTentang(opt)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                          tentang === opt
                            ? 'text-[#008d91] bg-teal-50'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt}</span>
                        {tentang === opt && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 2. Quick Reply */}
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2 sm:gap-4">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Quick Reply
            </label>
            <input
              id="form-quick-reply-input"
              type="text"
              value={quickReply}
              onChange={(e) => setQuickReply(e.target.value)}
              placeholder="Input Text..."
              className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] transition-all shadow-2xs"
            />
          </div>

          {/* 3. Gambar */}
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-start gap-2 sm:gap-4 pt-1">
            <label className="text-xs sm:text-sm font-medium text-slate-700 pt-2">
              Gambar
            </label>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              {!gambar ? (
                /* Add Image(s) button matching Image 2 */
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2.5 text-[#008d91] hover:text-[#007a7e] font-semibold text-xs sm:text-sm cursor-pointer transition-colors py-1.5 group select-none"
                >
                  {/* Custom icon matching Image 2: Image box with plus in corner */}
                  <div className="relative flex items-center justify-center">
                    <svg
                      className="w-6 h-6 stroke-current fill-none stroke-[1.8]"
                      viewBox="0 0 24 24"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="3"
                        ry="3"
                        stroke="currentColor"
                      />
                      <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" />
                      <polyline points="21 15 16 10 5 21" stroke="currentColor" />
                    </svg>
                    <div className="absolute -bottom-1 -left-1 bg-[#008d91] text-white rounded-full w-3.5 h-3.5 flex items-center justify-center border-2 border-white shadow-xs">
                      <Plus className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  </div>
                  <span>Add Image(s)</span>
                </button>
              ) : (
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 max-w-sm">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0">
                    <img
                      src={gambar}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-700 truncate">
                      Gambar dipilih
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] text-[#008d91] hover:underline font-medium"
                    >
                      Ganti Gambar
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGambar('')}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Gambar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 4. Isi Teks */}
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-start gap-2 sm:gap-4 pt-1">
            <label className="text-xs sm:text-sm font-medium text-slate-700 pt-2">
              Isi Teks
            </label>
            <textarea
              rows={6}
              value={isiTeks}
              onChange={(e) => setIsiTeks(e.target.value)}
              placeholder="Input Text..."
              className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] transition-all shadow-2xs resize-y min-h-[140px]"
            />
          </div>
        </form>
      </div>

      {/* Bottom Action Buttons */}
      <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-start gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-6 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => handleSubmit()}
          className="rounded-full px-7 py-2 bg-[#008d91] hover:bg-[#007a7e] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
        >
          {editingItem ? 'Simpan Perubahan' : 'Simpan Data'}
        </button>
      </div>
    </div>
  );
};
