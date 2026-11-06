import React, { useState } from 'react';
import {
  Plus,
  MoreVertical,
  Trash2,
  Edit2,
  Check,
  X,
  Building2,
  ArrowDownRight,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { MutasiItem, MutasiLinkedTransaction } from '../types';
import { SalurOrder } from '../salurData';

interface KoneksiMutasiTransaksiTableProps {
  mutasiItems: MutasiItem[];
  orders: SalurOrder[];
  onUpdateMutasiItems: (updatedItems: MutasiItem[]) => void;
  onShowToast: (msg: string) => void;
  onOpenConnectModalForOrder?: (order: SalurOrder) => void;
}

export const KoneksiMutasiTransaksiTable: React.FC<KoneksiMutasiTransaksiTableProps> = ({
  mutasiItems,
  orders,
  onUpdateMutasiItems,
  onShowToast,
  onOpenConnectModalForOrder,
}) => {
  // State for which mutasi row is adding a transaction
  const [addingToMutasiId, setAddingToMutasiId] = useState<string | null>(null);
  const [selectedOrderCode, setSelectedOrderCode] = useState('');
  const [customKode, setCustomKode] = useState('');
  const [newDbCr, setNewDbCr] = useState<'CR' | 'DB'>('CR');
  const [newNominal, setNewNominal] = useState('');

  // Dropdown menu state for sub-rows
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filter bank tab
  const [selectedBank, setSelectedBank] = useState<string>('BCA 888');

  // Format currency with two decimal places matching image (e.g. 1,072,261.00)
  const formatAmount = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Filter mutasi by bank and by rule:
  // "Mutasi yang akan dimunculkan hanya mutasi yang sudah dikonekan dengan transaksi dan mutasi yang masih bisa dipilih."
  const filteredMutasi = mutasiItems.filter((m) => {
    if (selectedBank !== 'ALL' && m.bankAccount !== selectedBank) {
      return false;
    }
    const hasConnected = !!(m.linkedTransactions && m.linkedTransactions.length > 0);
    // calculate remaining
    const allocated = m.linkedTransactions?.reduce((acc, it) => {
      if (it.dbCr === 'CR') return acc + Math.abs(it.nominalAkhir);
      if (it.dbCr === 'DB') return acc - Math.abs(it.nominalAkhir);
      return acc + it.nominalAkhir;
    }, 0) || 0;
    const canStillBeChosen = (m.amount - allocated) > 0.01;

    return hasConnected || canStillBeChosen;
  });

  const handleStartAddTransaksi = (mutasi: MutasiItem) => {
    setAddingToMutasiId(mutasi.id);
    setSelectedOrderCode(orders[0]?.orderNumber || '');
    setCustomKode(orders[0]?.orderNumber || '');
    setNewDbCr('CR');
    setNewNominal('');
  };

  const handleSaveNewTransaksi = (mutasiId: string) => {
    const nominalNum = parseFloat(newNominal);
    if (isNaN(nominalNum) || nominalNum <= 0) {
      onShowToast('Nominal harus lebih dari 0');
      return;
    }

    const kodeToSave = (customKode || selectedOrderCode || 'CC 123456789').trim();
    const matchedOrder = orders.find((o) => o.orderNumber === kodeToSave);

    const newLink: MutasiLinkedTransaction = {
      id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId: matchedOrder?.id,
      kode: kodeToSave,
      dbCr: newDbCr,
      nominalAkhir: newDbCr === 'DB' ? -Math.abs(nominalNum) : Math.abs(nominalNum),
      createdAt: new Date().toISOString(),
    };

    const updated = mutasiItems.map((m) => {
      if (m.id === mutasiId) {
        return {
          ...m,
          linkedTransactions: [...(m.linkedTransactions || []), newLink],
        };
      }
      return m;
    });

    onUpdateMutasiItems(updated);
    setAddingToMutasiId(null);
    onShowToast(`Transaksi "${kodeToSave}" berhasil ditambahkan ke mutasi`);
  };

  const handleDeleteTransaksi = (mutasiId: string, linkId: string, kode: string) => {
    const updated = mutasiItems.map((m) => {
      if (m.id === mutasiId && m.linkedTransactions) {
        return {
          ...m,
          linkedTransactions: m.linkedTransactions.filter((l) => l.id !== linkId),
        };
      }
      return m;
    });

    onUpdateMutasiItems(updated);
    setActiveMenuId(null);
    onShowToast(`Koneksi transaksi "${kode}" dihapus`);
  };

  return (
    <div className="mt-8 bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
      {/* Top Header of the Mutasi Table */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
            <span>Koneksi Mutasi Bank & Transaksi</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#008d91]/10 text-[#008d91] font-semibold">
              S-SALUR
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Satu mutasi bisa digunakan untuk beberapa transaksi, dan satu transaksi bisa menggunakan beberapa mutasi.
          </p>
        </div>

        {/* Bank Tabs Filter */}
        <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-xl">
          {['BCA 888', 'BCA 388', 'Mandiri', 'ALL'].map((bank) => (
            <button
              key={bank}
              type="button"
              onClick={() => setSelectedBank(bank)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedBank === bank
                  ? 'bg-white text-slate-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {bank === 'ALL' ? 'Semua' : bank}
            </button>
          ))}
        </div>
      </div>

      {/* The Main Table exactly matching the image */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-3 px-3 w-20 text-center">Date</th>
              <th className="py-3 px-4 min-w-[280px]">Keterangan Bank</th>
              <th className="py-3 px-4 w-32 text-right">Amount</th>
              <th className="py-3 px-3 w-16 text-center">CB/CR</th>
              <th className="py-3 px-3 w-16 text-center">DB/CR</th>
              <th className="py-3 px-4 min-w-[220px]">Kode</th>
              <th className="py-3 px-4 w-32 text-right">Nominal akhir</th>
              <th className="py-3 px-3 w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 font-sans">
            {filteredMutasi.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                  Tidak ada data mutasi yang memenuhi syarat untuk ditampilkan.
                </td>
              </tr>
            ) : (
              filteredMutasi.map((mutasi) => {
                const links = mutasi.linkedTransactions || [];
                const isAdding = addingToMutasiId === mutasi.id;

                return (
                  <React.Fragment key={mutasi.id}>
                    {/* Main Mutasi Row */}
                    <tr className="bg-white hover:bg-slate-50/50 transition-colors border-t border-slate-200">
                      {/* Date */}
                      <td className="py-3 px-3 text-center align-top font-medium text-slate-700">
                        {mutasi.date}
                      </td>

                      {/* Keterangan Bank */}
                      <td className="py-3 px-4 align-top text-slate-700 font-mono text-[11.5px] leading-relaxed">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                            {mutasi.bankAccount}
                          </span>
                        </div>
                        {mutasi.keteranganBank}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right align-top font-semibold text-slate-800">
                        {formatAmount(mutasi.amount)}
                      </td>

                      {/* CB/CR */}
                      <td className="py-3 px-3 text-center align-top font-bold text-slate-700">
                        {mutasi.type}
                      </td>

                      {/* First sub-row if exists, otherwise empty cells */}
                      {links.length > 0 ? (
                        <>
                          <td className="py-3 px-3 text-center align-top font-semibold text-slate-700">
                            {links[0].dbCr}
                          </td>
                          <td className="py-3 px-4 align-top font-medium text-slate-800">
                            {links[0].kode}
                          </td>
                          <td
                            className={`py-3 px-4 text-right align-top font-semibold ${
                              links[0].nominalAkhir < 0 ? 'text-rose-600' : 'text-slate-800'
                            }`}
                          >
                            {formatAmount(links[0].nominalAkhir)}
                          </td>
                          <td className="py-3 px-3 text-center align-top relative">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveMenuId(activeMenuId === links[0].id ? null : links[0].id)
                              }
                              className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                            {activeMenuId === links[0].id && (
                              <div className="absolute right-3 top-8 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 w-32 animate-in fade-in zoom-in-95">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteTransaksi(mutasi.id, links[0].id, links[0].kode)
                                  }
                                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Hapus</span>
                                </button>
                              </div>
                            )}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-3 text-center align-top text-slate-300">-</td>
                          <td className="py-3 px-4 align-top text-slate-400 italic">Belum ada transaksi</td>
                          <td className="py-3 px-4 text-right align-top text-slate-300">-</td>
                          <td className="py-3 px-3 text-center align-top"></td>
                        </>
                      )}
                    </tr>

                    {/* Subsequent linked transactions sub-rows */}
                    {links.slice(1).map((link) => (
                      <tr key={link.id} className="bg-slate-50/25 hover:bg-slate-50 transition-colors">
                        {/* Empty left 4 columns spanned or blank to align with mutasi parent */}
                        <td className="py-2 px-3"></td>
                        <td className="py-2 px-4"></td>
                        <td className="py-2 px-4"></td>
                        <td className="py-2 px-3"></td>

                        {/* Sub-row columns */}
                        <td className="py-2 px-3 text-center align-middle font-semibold text-slate-700 border-t border-slate-100">
                          {link.dbCr}
                        </td>
                        <td className="py-2 px-4 align-middle font-medium text-slate-800 border-t border-slate-100">
                          {link.kode}
                        </td>
                        <td
                          className={`py-2 px-4 text-right align-middle font-semibold border-t border-slate-100 ${
                            link.nominalAkhir < 0 ? 'text-rose-600' : 'text-slate-800'
                          }`}
                        >
                          {formatAmount(link.nominalAkhir)}
                        </td>
                        <td className="py-2 px-3 text-center align-middle relative border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId(activeMenuId === link.id ? null : link.id)
                            }
                            className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                          {activeMenuId === link.id && (
                            <div className="absolute right-3 top-7 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 w-32 animate-in fade-in zoom-in-95">
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteTransaksi(mutasi.id, link.id, link.kode)
                                }
                                className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Hapus</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}

                    {/* Inline form when adding transaction */}
                    {isAdding && (
                      <tr className="bg-teal-50/40 border-t border-teal-200">
                        <td className="py-3 px-3"></td>
                        <td className="py-3 px-4 text-xs font-semibold text-[#008d91]">
                          Tambahkan Transaksi ke Mutasi:
                        </td>
                        <td className="py-3 px-4"></td>
                        <td className="py-3 px-3"></td>

                        {/* DB/CR selection */}
                        <td className="py-3 px-3 text-center align-middle">
                          <select
                            value={newDbCr}
                            onChange={(e) => setNewDbCr(e.target.value as 'CR' | 'DB')}
                            className="px-1.5 py-1 text-xs font-bold bg-white border border-slate-300 rounded focus:ring-1 focus:ring-[#008d91]"
                          >
                            <option value="CR">CR</option>
                            <option value="DB">DB</option>
                          </select>
                        </td>

                        {/* Kode input / select */}
                        <td className="py-3 px-4 align-middle">
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={customKode}
                              onChange={(e) => setCustomKode(e.target.value)}
                              placeholder="Ketik kode (e.g. CC 123456789)"
                              className="w-full px-2 py-1 text-xs bg-white border border-slate-300 rounded font-semibold focus:ring-1 focus:ring-[#008d91]"
                            />
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 overflow-x-auto py-0.5">
                              <span>Pilih:</span>
                              {orders.slice(0, 3).map((o) => (
                                <button
                                  key={o.id}
                                  type="button"
                                  onClick={() => setCustomKode(o.orderNumber)}
                                  className="underline text-[#008d91] hover:text-[#00787c] cursor-pointer whitespace-nowrap"
                                >
                                  {o.orderNumber}
                                </button>
                              ))}
                            </div>
                          </div>
                        </td>

                        {/* Nominal akhir input */}
                        <td className="py-3 px-4 text-right align-middle">
                          <input
                            type="number"
                            value={newNominal}
                            onChange={(e) => setNewNominal(e.target.value)}
                            placeholder="Nominal"
                            className="w-28 px-2 py-1 text-xs text-right bg-white border border-slate-300 rounded font-semibold focus:ring-1 focus:ring-[#008d91]"
                          />
                        </td>

                        {/* Action buttons */}
                        <td className="py-3 px-3 text-center align-middle">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSaveNewTransaksi(mutasi.id)}
                              className="p-1 bg-[#008d91] hover:bg-[#00787c] text-white rounded cursor-pointer"
                              title="Simpan"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddingToMutasiId(null)}
                              className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded cursor-pointer"
                              title="Batal"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* "+ Add Transaksi" button row */}
                    {!isAdding && (
                      <tr className="bg-slate-50/20">
                        <td className="py-2.5 px-3"></td>
                        <td className="py-2.5 px-4"></td>
                        <td className="py-2.5 px-4"></td>
                        <td className="py-2.5 px-3"></td>
                        <td colSpan={4} className="py-2.5 px-3">
                          <button
                            type="button"
                            onClick={() => handleStartAddTransaksi(mutasi)}
                            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-md bg-[#008d91] hover:bg-[#00787c] text-white transition-colors cursor-pointer shadow-2xs"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Transaksi</span>
                          </button>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
