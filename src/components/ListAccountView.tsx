import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Eye,
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  X,
  Check,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { AccountItem } from '../accountData';

interface ListAccountViewProps {
  items: AccountItem[];
  onAddClick: () => void;
  onEditClick: (item: AccountItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleStatus: (item: AccountItem) => void;
  onShowToast?: (msg: string) => void;
}

export const ListAccountView: React.FC<ListAccountViewProps> = ({
  items,
  onAddClick,
  onEditClick,
  onDeleteItem,
  onToggleStatus,
  onShowToast = (_msg: string) => {},
}) => {
  // Privacy toggle (masks / reveals passwords)
  const [hidePasswords, setHidePasswords] = useState(true);

  // Search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Divisi & Status
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDivisi, setSelectedDivisi] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL'); // 'ALL' | 'aktif' | 'tidak_aktif'
  const filterRef = useRef<HTMLDivElement | null>(null);

  // Popover action menu
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Divisions available
  const availableDivisions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((it) => {
      if (it.divisi) set.add(it.divisi.toUpperCase());
    });
    return Array.from(set);
  }, [items]);

  // Filtered accounts
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDivisi = item.divisi.toLowerCase().includes(q);
        const matchJenis = item.jenisAccount.toLowerCase().includes(q);
        const matchNama = item.namaAccount.toLowerCase().includes(q);
        const matchPemegang = item.pemegang.toLowerCase().includes(q);
        const matchAdmin = item.jenisAdmin.toLowerCase().includes(q);
        if (!matchDivisi && !matchJenis && !matchNama && !matchPemegang && !matchAdmin) {
          return false;
        }
      }

      // Filter Divisi
      if (selectedDivisi !== 'ALL') {
        if (item.divisi.toUpperCase() !== selectedDivisi) return false;
      }

      // Filter Status
      if (selectedStatus === 'aktif' && !item.aktif) return false;
      if (selectedStatus === 'tidak_aktif' && item.aktif) return false;

      return true;
    });
  }, [items, searchQuery, selectedDivisi, selectedStatus]);

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onShowToast(`${label} berhasil disalin ke clipboard`);
    setActiveMenuId(null);
  };

  const handleDelete = (item: AccountItem) => {
    onDeleteItem(item.id);
    onShowToast(`Akun "${item.namaAccount}" berhasil dihapus`);
    setActiveMenuId(null);
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-100 min-h-[580px] flex flex-col justify-between transition-all font-['Plus_Jakarta_Sans',sans-serif]">
      <div>
        {/* Top Action Toolbar matching screenshot */}
        <div className="flex items-center justify-end gap-3 mb-6">
          {/* Privacy Toggle Button */}
          <button
            type="button"
            onClick={() => setHidePasswords(!hidePasswords)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            title={hidePasswords ? 'Tampilkan Password' : 'Sembunyikan Password'}
          >
            {hidePasswords ? (
              <EyeOff className="w-5 h-5 stroke-[1.8]" />
            ) : (
              <Eye className="w-5 h-5 stroke-[1.8]" />
            )}
          </button>

          {/* Search Toggle Button */}
          {searchOpen ? (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs animate-in fade-in duration-150">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Divisi / Akun / Pemegang..."
                autoFocus
                className="text-xs sm:text-sm text-slate-700 outline-none w-48 sm:w-64"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-slate-400 hover:text-slate-600 ml-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                searchQuery
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              title="Pencarian Akun"
            >
              <Search className="w-5 h-5 stroke-[1.8]" />
            </button>
          )}

          {/* Filter Toggle Button */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen(!filterOpen)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                selectedDivisi !== 'ALL' || selectedStatus !== 'ALL'
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
              title="Filter Akun"
            >
              <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 p-2.5 z-30 animate-in fade-in zoom-in-95 duration-100 space-y-2">
                <div className="text-[11px] font-bold text-slate-400 px-2 py-1 uppercase tracking-wider flex items-center justify-between">
                  <span>Filter Akun</span>
                  {(selectedDivisi !== 'ALL' || selectedStatus !== 'ALL') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDivisi('ALL');
                        setSelectedStatus('ALL');
                      }}
                      className="text-[11px] text-[#008d91] hover:underline cursor-pointer lowercase"
                    >
                      reset
                    </button>
                  )}
                </div>

                {/* Status Filter */}
                <div>
                  <span className="block text-[11px] font-semibold text-slate-500 px-2 mb-1">
                    Status:
                  </span>
                  <div className="space-y-0.5">
                    {[
                      { key: 'ALL', label: 'Semua Status' },
                      { key: 'aktif', label: 'Aktif' },
                      { key: 'tidak_aktif', label: 'Tidak Aktif' },
                    ].map((st) => (
                      <button
                        key={st.key}
                        type="button"
                        onClick={() => setSelectedStatus(st.key)}
                        className={`w-full text-left px-2.5 py-1 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                          selectedStatus === st.key
                            ? 'text-[#008d91] bg-teal-50'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{st.label}</span>
                        {selectedStatus === st.key && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Divisi Filter */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="block text-[11px] font-semibold text-slate-500 px-2 mb-1">
                    Divisi:
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-0.5">
                    <button
                      type="button"
                      onClick={() => setSelectedDivisi('ALL')}
                      className={`w-full text-left px-2.5 py-1 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                        selectedDivisi === 'ALL'
                          ? 'text-[#008d91] bg-teal-50'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>Semua Divisi</span>
                      {selectedDivisi === 'ALL' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    {availableDivisions.map((div) => (
                      <button
                        key={div}
                        type="button"
                        onClick={() => setSelectedDivisi(div)}
                        className={`w-full text-left px-2.5 py-1 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                          selectedDivisi === div
                            ? 'text-[#008d91] bg-teal-50'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>Divisi {div}</span>
                        {selectedDivisi === div && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* + Add Button matching screenshot */}
          <button
            type="button"
            onClick={onAddClick}
            className="px-5 py-2 bg-[#008d91] hover:bg-[#007a7e] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs shadow-[#008d91]/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>

        {/* Table matching Image 1 */}
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs sm:text-sm font-bold text-slate-800">
                <th className="py-3 px-4 min-w-[70px]">Divisi</th>
                <th className="py-3 px-4 min-w-[140px]">Jenis Account</th>
                <th className="py-3 px-4 min-w-[200px]">Nama Account</th>
                <th className="py-3 px-4 min-w-[110px]">Password</th>
                <th className="py-3 px-4 min-w-[170px]">Pemegang</th>
                <th className="py-3 px-4 min-w-[220px]">Jenis Admin</th>
                <th className="py-3 px-4 min-w-[100px] text-center">Aktif?</th>
                <th className="py-3 px-3 w-10 text-center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <KeyRound className="w-10 h-10 text-slate-300 stroke-[1.5] mb-2" />
                      <p className="font-semibold text-slate-500">
                        Tidak ada data akun yang ditemukan
                      </p>
                      <button
                        type="button"
                        onClick={onAddClick}
                        className="mt-3 px-4 py-1.5 text-xs font-bold text-[#008d91] bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer"
                      >
                        + Tambah Akun Baru
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Divisi */}
                    <td className="py-4 px-4 font-semibold text-slate-800 whitespace-nowrap">
                      {item.divisi}
                    </td>

                    {/* Jenis Account */}
                    <td className="py-4 px-4 text-slate-700 whitespace-nowrap font-medium">
                      {item.jenisAccount}
                    </td>

                    {/* Nama Account */}
                    <td className="py-4 px-4 font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span>{item.namaAccount}</span>
                        {item.linkLogin && (
                          <a
                            href={item.linkLogin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-[#008d91] transition-colors"
                            title={`Buka ${item.linkLogin}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Password */}
                    <td className="py-4 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {hidePasswords ? 'XXXXX' : item.password}
                    </td>

                    {/* Pemegang */}
                    <td className="py-4 px-4 text-slate-700 font-medium">
                      {item.pemegang}
                    </td>

                    {/* Jenis Admin */}
                    <td className="py-4 px-4 text-slate-600 text-xs sm:text-sm">
                      {item.jenisAdmin}
                    </td>

                    {/* Aktif? (Pill button exactly matching screenshot) */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(item)}
                        className={`inline-block px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
                          item.aktif
                            ? 'bg-[#008d91] hover:bg-[#007a7e] text-white'
                            : 'bg-[#ef4444] hover:bg-[#dc2626] text-white'
                        }`}
                        title={
                          item.aktif
                            ? 'Klik untuk ubah ke Tidak Aktif'
                            : `Tidak Aktif${
                                item.alasanTidakAktif
                                  ? `: ${item.alasanTidakAktif}`
                                  : ''
                              } (Klik untuk Aktifkan)`
                        }
                      >
                        {item.aktif ? 'Aktif' : 'Tidak Aktif'}
                      </button>
                    </td>

                    {/* Three dots vertical menu */}
                    <td className="py-4 px-3 text-center whitespace-nowrap">
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(
                              activeMenuId === item.id ? null : item.id
                            );
                          }}
                          className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === item.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 text-left"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onEditClick(item);
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                              <span>Edit Data</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleCopyText(item.namaAccount, 'Nama Account');
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Salin Akun</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleCopyText(item.password, 'Password');
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5 text-amber-500" />
                              <span>Salin Password</span>
                            </button>

                            {item.linkLogin && (
                              <a
                                href={item.linkLogin}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setActiveMenuId(null)}
                                className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-teal-700 hover:bg-teal-50 flex items-center gap-2"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-[#008d91]" />
                                <span>Buka Link Login</span>
                              </a>
                            )}

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              <span>Hapus Akun</span>
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

      {/* Footer Info */}
      <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <div>
          Menampilkan <span className="font-bold text-slate-600">{filteredItems.length}</span> dari{' '}
          <span className="font-bold text-slate-600">{items.length}</span> total akun
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008d91]" />
            <span>Aktif ({items.filter((i) => i.aktif).length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
            <span>Tidak Aktif ({items.filter((i) => !i.aktif).length})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
