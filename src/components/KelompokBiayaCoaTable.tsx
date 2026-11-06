import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  Tag,
  Hash,
} from 'lucide-react';
import { KelompokBiayaCoaItem } from '../kelompokBiayaCoaData';
import { AddEditKelompokBiayaCoaModal } from './AddEditKelompokBiayaCoaModal';

interface KelompokBiayaCoaTableProps {
  items: KelompokBiayaCoaItem[];
  onSaveItem?: (item: KelompokBiayaCoaItem) => void;
  onDeleteItem?: (id: string) => void;
  onShowToast?: (msg: string) => void;
  onAddClick?: () => void;
  onEditItem?: (item: KelompokBiayaCoaItem) => void;
}

export const KelompokBiayaCoaTable: React.FC<KelompokBiayaCoaTableProps> = ({
  items,
  onSaveItem,
  onDeleteItem,
  onShowToast,
  onAddClick,
  onEditItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemState, setEditingItemState] = useState<KelompokBiayaCoaItem | null>(null);

  const handleOpenAdd = () => {
    if (onAddClick) {
      onAddClick();
    } else {
      setEditingItemState(null);
      setIsModalOpen(true);
    }
  };

  const handleOpenEdit = (item: KelompokBiayaCoaItem) => {
    if (onEditItem) {
      onEditItem(item);
    } else {
      setEditingItemState(item);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    if (onDeleteItem) {
      onDeleteItem(id);
    }
  };

  const handleSaveFromModal = (savedItem: KelompokBiayaCoaItem) => {
    if (onSaveItem) {
      onSaveItem(savedItem);
    }
    setIsModalOpen(false);
    setEditingItemState(null);
  };

  React.useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const filteredItems = items.filter((it) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      it.rangeCoa.toLowerCase().includes(q) ||
      it.kelompokBiaya.toLowerCase().includes(q) ||
      (it.keterangan && it.keterangan.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full space-y-4">
      {/* Top Header Card */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Stat badge */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 px-4 py-3 flex items-center justify-between min-w-[210px] w-fit">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Kelompok Biaya COA
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5 leading-none">
              {items.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#008d91] text-white flex items-center justify-center shrink-0 shadow-xs ml-4">
            <Tag className="w-5 h-5 stroke-[2]" />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isSearchOpen ? (
            <div className="relative flex items-center">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Range COA / Kelompok Biaya..."
                className="w-56 sm:w-72 h-10 pl-9 pr-8 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-[#008d91] shadow-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-xs cursor-pointer"
              title="Cari"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            className="w-10 h-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-colors shadow-xs cursor-pointer"
            title="Filter"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-10 px-4 bg-[#008d91] hover:bg-[#007b7e] active:scale-95 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No.</th>
                <th className="py-3 px-4 w-44">Range COA</th>
                <th className="py-3 px-4">Kelompok Biaya</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 w-16 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Tag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Belum ada data Kelompok Biaya COA. Klik <strong>+ Add</strong> untuk menambahkan.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 transition-colors font-medium text-slate-800"
                  >
                    <td className="py-3 px-4 text-center text-slate-400 font-mono text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#e6f4f5] text-[#05828e] border border-[#bce2e5]">
                        <Hash className="w-3 h-3" />
                        {item.rangeCoa}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900">
                        {item.kelompokBiaya}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {item.keterangan || '-'}
                    </td>
                    <td className="py-3 px-4 text-center relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === item.id ? null : item.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === item.id && (
                        <div
                          className="absolute right-4 top-10 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs text-left"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              handleOpenEdit(item);
                            }}
                            className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              handleDelete(item.id);
                            }}
                            className="w-full px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
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

      {isModalOpen && (
        <AddEditKelompokBiayaCoaModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItemState(null);
          }}
          onSave={handleSaveFromModal}
          editingItem={editingItemState}
        />
      )}
    </div>
  );
};
