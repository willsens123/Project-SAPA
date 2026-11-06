import React, { useState, useRef, useEffect } from 'react';
import {
  EyeOff,
  Eye,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  Copy,
} from 'lucide-react';
import { JobAdvanceMasterItem } from '../types';

interface JobAdvanceTableProps {
  items: JobAdvanceMasterItem[];
  onSaveItem: (item: JobAdvanceMasterItem) => void;
  onDeleteItem: (id: string) => void;
  onDuplicateItem?: (item: JobAdvanceMasterItem) => void;
  onShowToast?: (msg: string) => void;
}

export const JobAdvanceFormListDatabaseAAjakItemSSebarTable: React.FC<JobAdvanceTableProps> = ({
  items,
  onSaveItem,
  onDeleteItem,
  onDuplicateItem,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isEyeOff, setIsEyeOff] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [keteranganFilter, setKeteranganFilter] = useState<'all' | 'Gambar' | 'Tulisan'>('all');

  // Menu popover state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Modal Add / Edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JobAdvanceMasterItem | null>(null);
  const [modalNama, setModalNama] = useState('');
  const [modalStatus, setModalStatus] = useState('-. Beginner, Intermediate, Advanced');
  const [modalKeterangan, setModalKeterangan] = useState<'Gambar' | 'Tulisan' | string>('Tulisan');
  const [modalError, setModalError] = useState('');

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setModalNama('');
    setModalStatus('-. Beginner, Intermediate, Advanced');
    setModalKeterangan('Tulisan');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: JobAdvanceMasterItem) => {
    setEditingItem(item);
    setModalNama(item.nama);
    setModalStatus(item.statusJobAdvance);
    setModalKeterangan(item.keterangan);
    setModalError('');
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = (id: string, nama: string) => {
    onDeleteItem(id);
    setActiveMenuId(null);
    if (onShowToast) {
      onShowToast(`Job Advance "${nama}" berhasil dihapus`);
    }
  };

  const handleDuplicate = (item: JobAdvanceMasterItem) => {
    const copyItem: JobAdvanceMasterItem = {
      id: `ja-${Date.now()}`,
      key: `ja_${Date.now()}`,
      nama: `${item.nama} (Copy)`,
      statusJobAdvance: item.statusJobAdvance,
      keterangan: item.keterangan,
      createdAt: new Date().toISOString(),
    };
    onSaveItem(copyItem);
    setActiveMenuId(null);
    if (onShowToast) {
      onShowToast(`Job Advance "${item.nama}" berhasil diduplikasi`);
    }
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalNama.trim()) {
      setModalError('Nama Job Advance tidak boleh kosong');
      return;
    }

    const saved: JobAdvanceMasterItem = {
      id: editingItem ? editingItem.id : `ja-${Date.now()}`,
      key: editingItem ? editingItem.key : modalNama.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''),
      nama: modalNama.trim(),
      statusJobAdvance: modalStatus.trim() || '-. Beginner, Intermediate, Advanced',
      keterangan: modalKeterangan,
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
    };

    onSaveItem(saved);
    setIsModalOpen(false);
    if (onShowToast) {
      onShowToast(
        editingItem
          ? `Job Advance "${saved.nama}" berhasil diperbarui`
          : `Job Advance "${saved.nama}" berhasil ditambahkan`
      );
    }
  };

  // Filtered rows
  const filteredItems = items.filter((item) => {
    if (keteranganFilter !== 'all' && item.keterangan !== keteranganFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.nama.toLowerCase().includes(q) ||
        item.statusJobAdvance.toLowerCase().includes(q) ||
        item.keterangan.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200">
      {/* Outer Card Container matching image 1 */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-100 min-h-[500px]">
        {/* Top Right Action Bar (EyeOff, Search, Filter, + Add) */}
        <div className="flex items-center justify-end gap-3 mb-6">
          {/* Privacy Mask / EyeOff */}
          <button
            type="button"
            onClick={() => setIsEyeOff(!isEyeOff)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            title={isEyeOff ? 'Tampilkan' : 'Sembunyikan'}
          >
            {isEyeOff ? (
              <Eye className="w-5 h-5 stroke-[1.8] text-[#008d91]" />
            ) : (
              <EyeOff className="w-5 h-5 stroke-[1.8]" />
            )}
          </button>

          {/* Search Icon / Input */}
          <div className="relative">
            {isSearchOpen ? (
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs animate-in fade-in duration-150">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Job Advance..."
                  autoFocus
                  className="text-xs sm:text-sm text-slate-700 outline-none w-36 sm:w-56"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                title="Pencarian"
              >
                <Search className="w-5 h-5 stroke-[1.8]" />
              </button>
            )}
          </div>

          {/* Filter / SlidersHorizontal */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isFilterOpen || keteranganFilter !== 'all'
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Filter Keterangan"
            >
              <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-10 z-30 bg-white border border-slate-100 rounded-2xl shadow-xl p-3 w-48 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-xs font-bold text-slate-700 mb-2">Filter Keterangan</div>
                <div className="space-y-1">
                  {(['all', 'Gambar', 'Tulisan'] as const).map((kat) => (
                    <button
                      key={kat}
                      type="button"
                      onClick={() => {
                        setKeteranganFilter(kat);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        keteranganFilter === kat
                          ? 'bg-[#008d91]/10 text-[#008d91] font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {kat === 'all' ? 'Semua Keterangan' : kat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* + Add Button matching image 1 */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] active:bg-[#046c76] text-white px-5 py-2 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer ml-1"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>

        {/* Table matching exact layout from Image 1 */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700 text-sm sm:text-base font-semibold">
                <th className="py-4 px-6 text-center w-1/3">Job Advance</th>
                <th className="py-4 px-6 text-center w-1/3">Status Job Advance</th>
                <th className="py-4 px-6 text-center w-1/4">Keterangan</th>
                <th className="py-4 px-4 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 text-sm">
                    Tidak ada data Job Advance ditemukan
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group text-sm sm:text-[15px] text-slate-700"
                  >
                    {/* Job Advance Name */}
                    <td className="py-4 px-6 font-normal text-slate-700">
                      {isEyeOff ? '••••••••' : item.nama}
                    </td>

                    {/* Status Job Advance */}
                    <td className="py-4 px-6 text-center text-slate-600 font-normal">
                      {isEyeOff ? '••••••••' : item.statusJobAdvance}
                    </td>

                    {/* Keterangan */}
                    <td className="py-4 px-6 text-center text-slate-600 font-normal">
                      {isEyeOff ? '••••' : item.keterangan}
                    </td>

                    {/* Action Menu (⋮) */}
                    <td className="py-4 px-4 text-center relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === item.id ? null : item.id);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                        title="Opsi"
                      >
                        <MoreVertical className="w-4 h-4 stroke-[1.8]" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === item.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-4 top-10 z-30 bg-white border border-slate-100 rounded-2xl shadow-xl py-1.5 w-36 text-xs text-left animate-in fade-in zoom-in-95 duration-150"
                        >
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(item)}
                            className="w-full px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Duplikasi</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id, item.nama)}
                            className="w-full px-3.5 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                {editingItem ? 'Edit Job Advance' : 'Tambah Job Advance'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="mt-5 space-y-4">
              {modalError && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Nama Job Advance
                </label>
                <input
                  type="text"
                  value={modalNama}
                  onChange={(e) => setModalNama(e.target.value)}
                  placeholder="Contoh: Lay-Out, Animator, dsb."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#008d91] focus:bg-white transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Status Job Advance
                </label>
                <input
                  type="text"
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  placeholder="-. Beginner, Intermediate, Advanced"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#008d91] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Keterangan
                </label>
                <div className="flex items-center gap-6 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                    <input
                      type="radio"
                      name="keteranganType"
                      value="Gambar"
                      checked={modalKeterangan === 'Gambar'}
                      onChange={() => setModalKeterangan('Gambar')}
                      className="accent-[#008d91]"
                    />
                    <span>Gambar</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                    <input
                      type="radio"
                      name="keteranganType"
                      value="Tulisan"
                      checked={modalKeterangan === 'Tulisan'}
                      onChange={() => setModalKeterangan('Tulisan')}
                      className="accent-[#008d91]"
                    />
                    <span>Tulisan</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#008d91] hover:bg-[#05828e] text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
