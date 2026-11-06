import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Plus,
  EyeOff,
  Eye,
  MoreVertical,
  Copy,
  Pencil,
  Trash2,
  X,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { QuickReplyItem } from '../quickReplyData';

interface QuickReplyViewProps {
  items: QuickReplyItem[];
  onAddClick: () => void;
  onEditClick: (item: QuickReplyItem) => void;
  onDeleteClick: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const QuickReplyView: React.FC<QuickReplyViewProps> = ({
  items,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedTentang, setSelectedTentang] = useState<string>('ALL');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filterRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterDropdown(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tentangOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.tentang) set.add(item.tentang);
    });
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchTentang =
        selectedTentang === 'ALL' || item.tentang === selectedTentang;
      const matchSearch =
        !searchQuery.trim() ||
        item.quickReply.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.isiTeks.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tentang.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTentang && matchSearch;
    });
  }, [items, selectedTentang, searchQuery]);

  const handleCopyText = (item: QuickReplyItem) => {
    navigator.clipboard.writeText(item.isiTeks);
    setCopiedId(item.id);
    onShowToast(`Teks "${item.quickReply}" disalin ke clipboard`);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
    setOpenMenuId(null);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-100 min-h-[580px] flex flex-col justify-between transition-all font-['Plus_Jakarta_Sans',sans-serif]">
      <div>
        {/* Top Action Toolbar matching Image 1 */}
        <div className="flex items-center justify-end gap-3 mb-6 relative">
          {showSearchInput && (
            <div className="relative animate-in fade-in slide-in-from-right-3 duration-200">
              <input
                type="text"
                autoFocus
                placeholder="Cari Quick Reply..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs sm:text-sm rounded-xl px-3 py-1.5 w-44 sm:w-60 outline-none focus:border-[#008d91] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Eye Off / Show Toggle */}
          <button
            type="button"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            title="Toggle Sensor / Hidden"
          >
            <EyeOff className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Search Button */}
          <button
            type="button"
            onClick={() => setShowSearchInput(!showSearchInput)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              showSearchInput
                ? 'text-[#008d91] bg-teal-50'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title="Cari"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Filter / Sliders Button */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                showFilterDropdown || selectedTentang !== 'ALL'
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              title="Filter Tentang"
            >
              <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  Filter Tentang
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTentang('ALL');
                    setShowFilterDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium cursor-pointer flex items-center justify-between ${
                    selectedTentang === 'ALL'
                      ? 'text-[#008d91] bg-teal-50 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Semua Kategori</span>
                  {selectedTentang === 'ALL' && (
                    <Check className="w-3.5 h-3.5 text-[#008d91]" />
                  )}
                </button>
                {tentangOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setSelectedTentang(opt);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium cursor-pointer flex items-center justify-between ${
                      selectedTentang === opt
                        ? 'text-[#008d91] bg-teal-50 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt}</span>
                    {selectedTentang === opt && (
                      <Check className="w-3.5 h-3.5 text-[#008d91]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* + Add Button */}
          <button
            type="button"
            onClick={onAddClick}
            className="px-5 py-2 bg-[#008d91] hover:bg-[#007a7e] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs shadow-[#008d91]/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>

        {/* Table Content matching Image 1 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/90 text-slate-800 text-xs sm:text-sm font-semibold tracking-wide">
                <th className="py-4 pl-2 pr-6 w-1/4 min-w-[180px] font-semibold text-slate-800">
                  Quick Reply
                </th>
                <th className="py-4 px-4 w-28 sm:w-36 text-center font-semibold text-slate-800">
                  Gambar
                </th>
                <th className="py-4 px-6 font-semibold text-slate-800">
                  Isi Teks
                </th>
                <th className="py-4 pr-2 w-10 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-slate-400 text-xs sm:text-sm"
                  >
                    Tidak ada data Quick Reply yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 transition-colors group align-top"
                  >
                    {/* Column 1: Quick Reply */}
                    <td className="py-5 pl-2 pr-6">
                      <div className="text-xs sm:text-sm text-slate-800 font-medium">
                        {item.quickReply}
                      </div>
                      {item.tentang && (
                        <div className="text-[11px] text-slate-400 mt-1">
                          {item.tentang}
                        </div>
                      )}
                    </td>

                    {/* Column 2: Gambar */}
                    <td className="py-5 px-4 text-center">
                      {item.gambar ? (
                        <div
                          onClick={() => setPreviewImage(item.gambar || null)}
                          className="inline-block relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 cursor-pointer shadow-xs hover:opacity-90 transition-opacity"
                        >
                          <img
                            src={item.gambar}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* Column 3: Isi Teks */}
                    <td className="py-5 px-6">
                      <div className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed whitespace-pre-wrap max-w-3xl">
                        {item.isiTeks}
                      </div>
                    </td>

                    {/* Column 4: 3-dots Menu */}
                    <td className="py-5 pr-2 text-right relative">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === item.id ? null : item.id
                            )
                          }
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuId === item.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 mt-1 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
                          >
                            <button
                              type="button"
                              onClick={() => handleCopyText(item)}
                              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-400" />
                              <span>Salin Teks</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                onEditClick(item);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5 text-slate-400" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                onDeleteClick(item.id);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lightbox / Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-4 max-w-lg w-full relative shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="mt-2 text-center">
              <img
                src={previewImage}
                alt="Gambar Quick Reply"
                className="max-h-[75vh] w-auto mx-auto rounded-2xl object-contain shadow-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
