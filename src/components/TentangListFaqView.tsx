import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Plus,
  EyeOff,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { TentangFaqItem } from '../faqData';

interface TentangListFaqViewProps {
  items: TentangFaqItem[];
  onBack: () => void;
  onSaveItem: (item: TentangFaqItem) => void;
  onDeleteItem: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const TentangListFaqView: React.FC<TentangListFaqViewProps> = ({
  items,
  onBack,
  onSaveItem,
  onDeleteItem,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TentangFaqItem | null>(null);

  const [formTentang, setFormTentang] = useState('');
  const [formKeterangan, setFormKeterangan] = useState('-');
  const [error, setError] = useState('');

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = items.filter(
    (it) =>
      !searchQuery.trim() ||
      it.tentang.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (it.keterangan &&
        it.keterangan.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormTentang('');
    setFormKeterangan('-');
    setError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (it: TentangFaqItem) => {
    setEditingItem(it);
    setFormTentang(it.tentang);
    setFormKeterangan(it.keterangan || '-');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmitModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTentang.trim()) {
      setError('Tentang wajib diisi');
      return;
    }

    const itemToSave: TentangFaqItem = {
      id: editingItem ? editingItem.id : `tf-${Date.now()}`,
      tentang: formTentang.trim().toUpperCase(),
      keterangan: formKeterangan.trim() || '-',
    };

    onSaveItem(itemToSave);
    onShowToast(
      `Tentang FAQ "${itemToSave.tentang}" berhasil ${
        editingItem ? 'diperbarui' : 'ditambahkan'
      }`
    );
    setIsModalOpen(false);
  };

  return (
    <div className="w-full flex flex-col gap-5 text-slate-800 animate-in fade-in duration-200">
      {/* Top Action Toolbar matching Transaksi S-SALUR and Identitas */}
      <div className="flex items-center justify-end gap-3 relative">
        {showSearchInput && (
          <div className="relative animate-in fade-in slide-in-from-right-3 duration-200">
            <input
              type="text"
              autoFocus
              placeholder="Cari Tentang FAQ..."
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

        <button
          type="button"
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Sensor / Visibility"
        >
          <EyeOff className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          type="button"
          onClick={() => setShowSearchInput(!showSearchInput)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            showSearchInput
              ? 'text-[#008d91] bg-teal-50'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
          title="Cari"
        >
          <Search className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          type="button"
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Filter"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-sm px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Main Card Container matching Transaksi S-SALUR and Identitas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col p-4 sm:p-6 min-h-[520px] justify-between">
        <div>

        {/* Table matching Image 2 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse max-w-2xl">
            <thead>
              <tr className="border-b border-slate-200/90 text-slate-800 text-xs sm:text-sm font-semibold tracking-wide">
                <th className="py-4 pl-2 pr-6 w-1/2 font-semibold text-slate-800">
                  Tentang
                </th>
                <th className="py-4 px-6 w-1/2 font-semibold text-slate-800">
                  Keterangan
                </th>
                <th className="py-4 pr-2 w-10 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-12 text-center text-slate-400 text-xs sm:text-sm"
                  >
                    Tidak ada kategori Tentang FAQ yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredItems.map((it) => (
                  <tr
                    key={it.id}
                    className="hover:bg-slate-50/60 transition-colors group align-middle"
                  >
                    {/* Column 1: Tentang */}
                    <td className="py-4 pl-2 pr-6 text-xs sm:text-sm text-slate-800 font-medium">
                      {it.tentang}
                    </td>

                    {/* Column 2: Keterangan */}
                    <td className="py-4 px-6 text-xs sm:text-sm text-slate-700">
                      {it.keterangan || '-'}
                    </td>

                    {/* Column 3: 3-dots Menu */}
                    <td className="py-4 pr-2 text-right relative">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId(openMenuId === it.id ? null : it.id)
                          }
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openMenuId === it.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 mt-1 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                handleOpenEdit(it);
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
                                onDeleteItem(it.id);
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

      {/* Modal Add / Edit Tentang */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {editingItem ? 'Edit Tentang FAQ' : 'Tambah Tentang FAQ'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitModal} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tentang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTentang}
                  onChange={(e) => setFormTentang(e.target.value)}
                  placeholder="Contoh: LAMRIM, YPPLN..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#008d91]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Keterangan
                </label>
                <input
                  type="text"
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  placeholder="Keterangan..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#008d91]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full text-xs font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#008d91] hover:bg-[#007a7e] text-white rounded-full text-xs font-bold cursor-pointer shadow-xs"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
