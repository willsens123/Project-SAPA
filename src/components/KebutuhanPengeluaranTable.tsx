import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  ListChecks,
  Hash,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { KebutuhanPengeluaranItem } from '../kebutuhanPengeluaranData';
import { PosPengeluaranGroup } from '../posPengeluaranData';
import { KelompokBiayaCoaItem } from '../kelompokBiayaCoaData';
import { CoaAccount } from '../accountingData';
import { AddEditKebutuhanPengeluaranModal } from './AddEditKebutuhanPengeluaranModal';

interface KebutuhanPengeluaranTableProps {
  items: KebutuhanPengeluaranItem[];
  posPengeluaranList?: PosPengeluaranGroup[];
  kelompokBiayaList?: KelompokBiayaCoaItem[];
  coaList?: CoaAccount[];
  onSaveItem?: (item: KebutuhanPengeluaranItem) => void;
  onDeleteItem?: (id: string) => void;
  onShowToast?: (msg: string) => void;
  onAddClick?: () => void;
  onEditItem?: (item: KebutuhanPengeluaranItem) => void;
}

export const KebutuhanPengeluaranTable: React.FC<KebutuhanPengeluaranTableProps> = ({
  items,
  posPengeluaranList = [],
  kelompokBiayaList = [],
  coaList = [],
  onSaveItem,
  onDeleteItem,
  onShowToast,
  onAddClick,
  onEditItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Internal modal management if onSaveItem is supplied
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemState, setEditingItemState] = useState<KebutuhanPengeluaranItem | null>(null);

  React.useEffect(() => {
    const handleOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  const handleOpenAdd = () => {
    if (onAddClick) {
      onAddClick();
    } else {
      setEditingItemState(null);
      setIsModalOpen(true);
    }
  };

  const handleOpenEdit = (item: KebutuhanPengeluaranItem) => {
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

  const handleSaveFromModal = (savedItem: KebutuhanPengeluaranItem) => {
    if (onSaveItem) {
      onSaveItem(savedItem);
    }
    setIsModalOpen(false);
    setEditingItemState(null);
  };

  const filteredItems = items.filter((it) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      it.kebutuhan.toLowerCase().includes(q) ||
      (it.noAkunCoa && it.noAkunCoa.toLowerCase().includes(q)) ||
      (it.namaAkunCoa && it.namaAkunCoa.toLowerCase().includes(q)) ||
      it.posPengeluaran.toLowerCase().includes(q) ||
      it.kelompokBiaya.toLowerCase().includes(q) ||
      (it.rangeCoa && it.rangeCoa.toLowerCase().includes(q)) ||
      (it.keterangan && it.keterangan.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full space-y-4">
      {/* Top Header Card */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Stat badge */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 px-4 py-3 flex items-center justify-between min-w-[210px] w-fit">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Kebutuhan Pengeluaran
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5 leading-none">
                {items.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#008d91] text-white flex items-center justify-center shrink-0 shadow-xs ml-4">
              <ListChecks className="w-5 h-5 stroke-[2]" />
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-800">
            <CheckCircle2 className="w-4 h-4 text-[#008d91]" />
            <span>Setiap Kebutuhan otomatis memiliki No & Nama Akun COA tersendiri.</span>
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
                placeholder="Cari Kebutuhan / No COA / Pos / Kelompok..."
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
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">No.</th>
                <th className="py-3 px-4">Kebutuhan</th>
                <th className="py-3 px-4">Akun COA Terkait</th>
                <th className="py-3 px-4">Pos Pengeluaran</th>
                <th className="py-3 px-4">Kelompok Biaya COA</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 w-16 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ListChecks className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Belum ada data Kebutuhan Pengeluaran. Klik <strong>+ Add</strong> untuk menambahkan.
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
                      <span className="font-bold text-slate-900 text-sm block">
                        {item.kebutuhan}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-[#e6f4f5] text-[#008d91] border border-[#bce2e5]">
                            <Hash className="w-3 h-3" />
                            {item.noAkunCoa || 'Otomatis'}
                          </span>
                          <span className="font-semibold text-slate-800 text-xs">
                            {item.namaAkunCoa || item.kebutuhan}
                          </span>
                        </div>
                        <span className="text-[10px] text-teal-700 font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                          Terkoneksi Master COA
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.posPengeluaran}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-800">
                          {item.kelompokBiaya}
                        </span>
                        {item.rangeCoa && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Range: {item.rangeCoa}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs max-w-xs truncate">
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

      {/* Internal Modal */}
      {isModalOpen && (
        <AddEditKebutuhanPengeluaranModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItemState(null);
          }}
          onSave={handleSaveFromModal}
          editingItem={editingItemState}
          posPengeluaranList={posPengeluaranList}
          kelompokBiayaList={kelompokBiayaList}
          existingKebutuhanList={items}
          coaList={coaList}
        />
      )}
    </div>
  );
};
