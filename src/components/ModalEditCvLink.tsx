import React, { useState, useEffect } from 'react';
import { X, FileText, ExternalLink, Link as LinkIcon, Check, Trash2, Clipboard } from 'lucide-react';

interface ModalEditCvLinkProps {
  isOpen: boolean;
  onClose: () => void;
  personName: string;
  personCode?: string;
  initialUrl?: string;
  onSave: (url: string) => void;
}

export const ModalEditCvLink: React.FC<ModalEditCvLinkProps> = ({
  isOpen,
  onClose,
  personName,
  personCode,
  initialUrl = '',
  onSave,
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl || '');
      setError('');
    }
  }, [isOpen, initialUrl]);

  if (!isOpen) return null;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setError('');
      }
    } catch {
      // ignore clipboard error
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setError('URL CV harus diawali dengan http:// atau https:// (contoh: https://drive.google.com/...)');
      return;
    }
    onSave(trimmed);
    onClose();
  };

  const handleClear = () => {
    setUrl('');
    setError('');
  };

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 w-full max-w-lg animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008d91] shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {initialUrl ? 'Ubah Link CV' : 'Tambah Link CV'}
              </h3>
              <p className="text-xs text-slate-500">
                {personCode ? `${personCode} • ` : ''}{personName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              URL Link Dokumen / Portofolio CV
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-slate-400">
                <LinkIcon className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError('');
                }}
                placeholder="https://drive.google.com/file/d/... atau https://..."
                className="w-full bg-slate-50/70 border border-slate-200 rounded-2xl pl-10 pr-24 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#008d91] transition-all"
                autoFocus
              />
              <div className="absolute right-2 flex items-center gap-1">
                {url ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    title="Kosongkan"
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePaste}
                    title="Paste dari clipboard"
                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-colors"
                  >
                    <Clipboard className="w-3 h-3" />
                    <span>Paste</span>
                  </button>
                )}
                {url && (url.startsWith('http://') || url.startsWith('https://')) && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Buka link di tab baru"
                    className="p-1 text-[#008d91] hover:bg-teal-50 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
            {error && (
              <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>
            )}
            <p className="text-[11px] text-slate-400 mt-2">
              Bisa berupa tautan Google Drive publik, Dropbox, LinkedIn, resume PDF, atau website portofolio.
            </p>
          </div>

          {/* Quick preset suggestions */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Format Tautan Populer:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-slate-600">
                Google Drive
              </span>
              <span className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-slate-600">
                LinkedIn
              </span>
              <span className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-slate-600">
                Dropbox
              </span>
              <span className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-slate-600">
                PDF Cloud Link
              </span>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {initialUrl ? (
              <button
                type="button"
                onClick={() => {
                  onSave('');
                  onClose();
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Link CV</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#008d91] hover:bg-[#00787c] text-white shadow-2xs flex items-center gap-1.5 transition-colors"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Simpan Link</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
