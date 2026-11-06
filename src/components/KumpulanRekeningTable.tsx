import React, { useState } from 'react';
import { Search, Plus, X, Edit2, Trash2, Copy, Check, CreditCard, Building2, User, Eye, EyeOff } from 'lucide-react';
import { KumpulanRekeningItem } from '../kumpulanRekeningData';

import { IdentitasItem } from '../identitasData';
import { OrganisasiItem } from '../types';

interface KumpulanRekeningTableProps {
  items: KumpulanRekeningItem[];
  onAddClick: () => void;
  onEditItem: (item: KumpulanRekeningItem) => void;
  onDeleteItem: (id: string) => void;
  onShowToast?: (msg: string) => void;
  identitasList?: IdentitasItem[];
  organisasiList?: OrganisasiItem[];
}

export const KumpulanRekeningTable: React.FC<KumpulanRekeningTableProps> = ({
  items,
  onAddClick,
  onEditItem,
  onDeleteItem,
  onShowToast,
  identitasList = [],
  organisasiList = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPrivacyMasked, setIsPrivacyMasked] = useState(false);

  const filteredItems = items.filter((it) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      it.idIdentitas.toLowerCase().includes(q) ||
      (it.namaIdentitas && it.namaIdentitas.toLowerCase().includes(q)) ||
      it.bank.toLowerCase().includes(q) ||
      it.nomorRekening.toLowerCase().includes(q) ||
      it.atasNama.toLowerCase().includes(q) ||
      it.keterangan.toLowerCase().includes(q)
    );
  });

  const handleCopyRekening = (noRek: string, id: string) => {
    navigator.clipboard.writeText(noRek);
    setCopiedId(id);
    if (onShowToast) {
      onShowToast(`Nomor Rekening ${noRek} disalin ke clipboard`);
    }
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getBankBadgeStyle = (bankName: string) => {
    const b = bankName.toUpperCase();
    if (b.includes('BCA')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (b.includes('MANDIRI')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (b.includes('BNI')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (b.includes('BRI')) return 'bg-sky-50 text-sky-700 border-sky-200';
    if (b.includes('BSI')) return 'bg-teal-50 text-teal-700 border-teal-200';
    if (b.includes('JAGO')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-4">
      {/* Top Bar with Search & Action Buttons */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center text-[#008d91]">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800">
              Kumpulan Rekening
            </h3>
            <p className="text-xs text-slate-400">
              Total {items.length} rekening terdaftar untuk pengeluaran
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Privacy Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsPrivacyMasked(!isPrivacyMasked);
              if (onShowToast) {
                onShowToast(isPrivacyMasked ? 'Nomor rekening ditampilkan' : 'Nomor rekening disamarkan');
              }
            }}
            title={isPrivacyMasked ? 'Tampilkan Nomor Rekening' : 'Samarkan Nomor Rekening'}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {isPrivacyMasked ? (
              <Eye className="w-4 h-4 text-[#008d91]" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>

          {/* Search Bar */}
          {isSearchOpen ? (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 animate-in fade-in duration-150">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ID, bank, rekening, nama..."
                autoFocus
                className="bg-transparent border-none outline-none text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 w-36 sm:w-56"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
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
              title="Cari Rekening"
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Add Button */}
          <button
            type="button"
            onClick={onAddClick}
            className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#007b7f] text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-600 text-xs font-semibold">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">ID Identitas</th>
                <th className="py-3 px-4">Bank</th>
                <th className="py-3 px-4">Nomor Rekening</th>
                <th className="py-3 px-4">Atas Nama</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                    <p className="font-medium text-xs sm:text-sm">Tidak ada data kumpulan rekening</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery ? 'Coba ubah kata kunci pencarian Anda' : 'Klik tombol "+ Add" untuk menambahkan'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[7px] bg-[#e6fbf7] border border-[#a1e7de] text-[#008d91] font-bold text-xs shrink-0 tracking-wide font-mono">
                          {item.idIdentitas}
                        </span>
                        <span className="text-slate-800 text-xs sm:text-sm font-normal leading-snug">
                          {item.namaIdentitas || item.atasNama}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg border font-semibold text-xs ${getBankBadgeStyle(item.bank)}`}>
                        {item.bank}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span>
                          {isPrivacyMasked
                            ? item.nomorRekening.slice(0, 3) + '••••' + item.nomorRekening.slice(-3)
                            : item.nomorRekening}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyRekening(item.nomorRekening, item.id)}
                          title="Salin Nomor Rekening"
                          className="p-1 text-slate-300 hover:text-[#008d91] transition-colors rounded cursor-pointer"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {item.atasNama}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs max-w-xs truncate">
                      {item.keterangan || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditItem(item)}
                          title="Edit Rekening"
                          className="p-1.5 text-slate-400 hover:text-[#008d91] hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Hapus rekening "${item.bank} - ${item.nomorRekening} (${item.atasNama})"?`)) {
                              onDeleteItem(item.id);
                            }
                          }}
                          title="Hapus Rekening"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
