import React, { useState } from 'react';
import {
  X,
  Search,
  Check,
  ShoppingBag,
  GraduationCap,
  Heart,
  TrendingDown,
  Percent,
  Plus,
  Building2,
} from 'lucide-react';
import { MutasiItem, MutasiLinkedTransaction, PengeluaranItem } from '../types';
import { SalurOrder } from '../salurData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { DonasiOrder } from '../donasiData';

interface ModalHubungkanMutasiProps {
  isOpen: boolean;
  onClose: () => void;
  mutasi: MutasiItem | null;
  salurOrders: SalurOrder[];
  transaksiAjarList: TransaksiAjarItem[];
  donasiOrders: DonasiOrder[];
  pengeluaranList: PengeluaranItem[];
  onSaveLink: (mutasiId: string, link: MutasiLinkedTransaction) => void;
  onShowToast?: (msg: string) => void;
}

type TabType = 'salur' | 'ajar' | 'donasi' | 'pengeluaran' | 'fee' | 'custom';

// Helper to extract clean numeric value from string like "Rp 95.000" or "95000"
function parseMoney(val: string | number | undefined): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const num = val.replace(/[^\d]/g, '');
  return parseInt(num, 10) || 0;
}

export const ModalHubungkanMutasi: React.FC<ModalHubungkanMutasiProps> = ({
  isOpen,
  onClose,
  mutasi,
  salurOrders = [],
  transaksiAjarList = [],
  donasiOrders = [],
  pengeluaranList = [],
  onSaveLink,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('salur');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [kode, setKode] = useState('');
  const [dbCr, setDbCr] = useState<'CR' | 'DB'>('CR');
  const [nominalAkhir, setNominalAkhir] = useState<number | ''>('');
  const [keterangan, setKeterangan] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState<string | undefined>(undefined);

  // Reset form when modal opens or mutasi changes
  React.useEffect(() => {
    if (isOpen && mutasi) {
      setKode('');
      setDbCr(mutasi.type === 'DB' ? 'DB' : 'CR');
      setNominalAkhir(mutasi.amount || '');
      setKeterangan('');
      setSelectedSourceId(undefined);
      setSearchQuery('');
      // Default to pengeluaran tab if mutasi is DB, else salur
      setActiveTab(mutasi.type === 'DB' ? 'pengeluaran' : 'salur');
    }
  }, [isOpen, mutasi]);

  if (!isOpen || !mutasi) return null;

  // Calculate existing allocation
  const currentAllocated = (mutasi.linkedTransactions || []).reduce((acc, it) => {
    return acc + it.nominalAkhir;
  }, 0);
  const remaining = mutasi.amount - currentAllocated;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleSelectSalurOrder = (order: SalurOrder) => {
    const code = order.orderNumber || order.id;
    const amount = parseMoney(order.totalDana);
    setKode(code);
    setDbCr('CR');
    setNominalAkhir(amount);
    setKeterangan(
      `Pesanan S-SALUR: ${order.alamat?.recipientName || order.customerId || 'Customer'} - ${
        order.items?.map((i) => i.title).join(', ') || ''
      }`
    );
    setSelectedSourceId(order.id);
  };

  const handleSelectAjarItem = (item: TransaksiAjarItem) => {
    const code = item.orderNumber || item.id;
    const amount = parseMoney(item.totalDana);
    setKode(`${code} - ${item.customerId}`);
    setDbCr('CR');
    setNominalAkhir(amount);
    setKeterangan(`Kelas A-AJAR: ${item.eventName || item.itemName} (${item.customerId})`);
    setSelectedSourceId(item.id);
  };

  const handleSelectDonasiOrder = (order: DonasiOrder) => {
    const code = order.orderNumber || order.id;
    const amount = parseMoney(order.totalDana);
    const donorName = order.namaDonatur?.name || order.customerId;
    setKode(`${code} - ${donorName}`);
    setDbCr('CR');
    setNominalAkhir(amount);
    setKeterangan(`Donasi D-DONASI: ${order.keterangan?.title || 'Program'} (${donorName})`);
    setSelectedSourceId(order.id);
  };

  const handleSelectPengeluaran = (item: PengeluaranItem) => {
    setKode(`No. ${item.no} - ${item.keterangan || item.kebutuhan}`);
    setDbCr('DB');
    setNominalAkhir(item.nominal || 0);
    setKeterangan(`Pengeluaran [${item.divisi}]: ${item.kebutuhan} - ${item.keterangan}`);
    setSelectedSourceId(item.id);
  };

  const handleSelectFeePreset = (presetName: string, defaultDbCr: 'CR' | 'DB' = 'DB', amountEstimate: number = 0) => {
    setKode(presetName);
    setDbCr(defaultDbCr);
    if (amountEstimate > 0) {
      setNominalAkhir(amountEstimate);
    }
    setKeterangan(`Biaya marketplace / operasional potongan bank: ${presetName}`);
    setSelectedSourceId(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kode.trim()) {
      if (onShowToast) onShowToast('Kode atau nama transaksi wajib diisi');
      return;
    }
    if (nominalAkhir === '' || Number(nominalAkhir) <= 0) {
      if (onShowToast) onShowToast('Nominal harus lebih dari 0');
      return;
    }

    const absNominal = Math.abs(Number(nominalAkhir));
    const finalNominal = dbCr === 'DB' ? -absNominal : absNominal;

    const newLink: MutasiLinkedTransaction = {
      id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sourceType: activeTab,
      sourceId: selectedSourceId,
      kode: kode.trim(),
      dbCr,
      nominalAkhir: finalNominal,
      keterangan: keterangan.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSaveLink(mutasi.id, newLink);
    if (onShowToast) onShowToast(`Berhasil menghubungkan "${kode.trim()}" ke mutasi ${mutasi.bankAccount}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#008d91] text-white">
                {mutasi.bankAccount}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                Hubungkan Mutasi dengan Transaksi
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-2xl">
              <span className="font-semibold text-slate-700">{mutasi.date}</span> &bull; {mutasi.keteranganBank}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bank & Balance Summary Banner */}
        <div className="px-6 py-3.5 bg-gradient-to-r from-teal-50/80 to-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-5">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Amount Bank</span>
              <span className="font-bold text-slate-800 text-sm">
                Rp {formatCurrency(mutasi.amount)} ({mutasi.type})
              </span>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Sudah Terkoneksi</span>
              <span className="font-semibold text-[#008d91] text-sm">
                Rp {formatCurrency(Math.abs(currentAllocated))}
              </span>
            </div>
            <div className="h-7 w-px bg-slate-200" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Sisa Saldo</span>
              <span className={`font-semibold text-sm ${Math.abs(remaining) < 1 ? 'text-emerald-600' : 'text-amber-600'}`}>
                Rp {formatCurrency(remaining)}
              </span>
            </div>
          </div>
          <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Balance: {formatCurrency(mutasi.balance)}</span>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Left Column: Transaction Source Picker */}
          <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col space-y-4">
            {/* Tabs */}
            <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100/80 rounded-2xl">
              <button
                type="button"
                onClick={() => { setActiveTab('salur'); setSearchQuery(''); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'salur'
                    ? 'bg-white text-[#008d91] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>S-SALUR</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('ajar'); setSearchQuery(''); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'ajar'
                    ? 'bg-white text-[#008d91] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>A-AJAR</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('donasi'); setSearchQuery(''); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'donasi'
                    ? 'bg-white text-[#008d91] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>D-DONASI</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('pengeluaran'); setSearchQuery(''); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'pengeluaran'
                    ? 'bg-white text-[#008d91] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Pengeluaran</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('fee'); setSearchQuery(''); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'fee'
                    ? 'bg-white text-[#008d91] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>Fee & Potongan</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('custom'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'custom'
                    ? 'bg-white text-[#008d91] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manual</span>
              </button>
            </div>

            {/* Search Input for items */}
            {activeTab !== 'fee' && activeTab !== 'custom' && (
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Cari data ${activeTab.toUpperCase()}...`}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 outline-none focus:border-[#008d91] transition-all"
                />
              </div>
            )}

            {/* List container */}
            <div className="flex-1 min-h-[260px] max-h-[340px] overflow-y-auto space-y-2 pr-1">
              {/* TAB 1: S-SALUR ORDERS */}
              {activeTab === 'salur' && (
                salurOrders
                  .filter((o) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
                      (o.customerId && o.customerId.toLowerCase().includes(q)) ||
                      (o.alamat?.recipientName && o.alamat.recipientName.toLowerCase().includes(q)) ||
                      (o.totalDana && o.totalDana.toLowerCase().includes(q))
                    );
                  })
                  .slice(0, 30)
                  .map((order) => {
                    const isSelected = selectedSourceId === order.id || kode === order.orderNumber;
                    const amount = parseMoney(order.totalDana);
                    return (
                      <div
                        key={order.id}
                        onClick={() => handleSelectSalurOrder(order)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-teal-50/80 border-[#008d91] ring-1 ring-[#008d91]'
                            : 'bg-white border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-800">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-semibold">
                              S-SALUR
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 truncate mt-0.5">
                            {order.alamat?.recipientName || order.customerId} &bull; {order.items?.[0]?.title || 'Buku'}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {order.date || '1 Nov 2021'}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-xs text-[#008d91] block">
                            Rp {formatCurrency(amount)}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-medium">CR (Masuk)</span>
                        </div>
                      </div>
                    );
                  })
              )}

              {/* TAB 2: A-AJAR TRANSAKSI */}
              {activeTab === 'ajar' && (
                transaksiAjarList
                  .filter((a) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      (a.orderNumber && a.orderNumber.toLowerCase().includes(q)) ||
                      (a.customerId && a.customerId.toLowerCase().includes(q)) ||
                      (a.eventName && a.eventName.toLowerCase().includes(q)) ||
                      (a.itemName && a.itemName.toLowerCase().includes(q)) ||
                      (a.totalDana && a.totalDana.toLowerCase().includes(q))
                    );
                  })
                  .slice(0, 30)
                  .map((item) => {
                    const isSelected = selectedSourceId === item.id;
                    const amount = parseMoney(item.totalDana);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectAjarItem(item)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-teal-50/80 border-[#008d91] ring-1 ring-[#008d91]'
                            : 'bg-white border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-800">
                              {item.orderNumber}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-semibold">
                              A-AJAR
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 truncate mt-0.5">
                            {item.customerId} &bull; {item.eventName || item.itemName}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {item.date || '1 Nov 2021'}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-xs text-purple-700 block">
                            Rp {formatCurrency(amount)}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-medium">CR (Masuk)</span>
                        </div>
                      </div>
                    );
                  })
              )}

              {/* TAB 3: D-DONASI ORDERS */}
              {activeTab === 'donasi' && (
                donasiOrders
                  .filter((d) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      (d.orderNumber && d.orderNumber.toLowerCase().includes(q)) ||
                      (d.customerId && d.customerId.toLowerCase().includes(q)) ||
                      (d.namaDonatur?.name && d.namaDonatur.name.toLowerCase().includes(q)) ||
                      (d.keterangan?.title && d.keterangan.title.toLowerCase().includes(q)) ||
                      (d.totalDana && d.totalDana.toLowerCase().includes(q))
                    );
                  })
                  .slice(0, 30)
                  .map((order) => {
                    const isSelected = selectedSourceId === order.id;
                    const amount = parseMoney(order.totalDana);
                    const donorName = order.namaDonatur?.name || order.customerId;
                    return (
                      <div
                        key={order.id}
                        onClick={() => handleSelectDonasiOrder(order)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-teal-50/80 border-[#008d91] ring-1 ring-[#008d91]'
                            : 'bg-white border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-800">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold">
                              D-DONASI
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 truncate mt-0.5">
                            {donorName} &bull; {order.keterangan?.title || 'Program Donasi'}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {order.date || '1 Nov 2021'}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-xs text-amber-700 block">
                            Rp {formatCurrency(amount)}
                          </span>
                          <span className="text-[10px] text-emerald-600 font-medium">CR (Masuk)</span>
                        </div>
                      </div>
                    );
                  })
              )}

              {/* TAB 4: PENGELUARAN */}
              {activeTab === 'pengeluaran' && (
                pengeluaranList
                  .filter((p) => {
                    if (!searchQuery) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      p.no.toLowerCase().includes(q) ||
                      p.kebutuhan.toLowerCase().includes(q) ||
                      p.keterangan.toLowerCase().includes(q) ||
                      p.divisi.toLowerCase().includes(q) ||
                      p.nominal.toString().includes(q)
                    );
                  })
                  .slice(0, 30)
                  .map((item) => {
                    const isSelected = selectedSourceId === item.id || kode.includes(`No. ${item.no}`);
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectPengeluaran(item)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-rose-50/80 border-rose-400 ring-1 ring-rose-400'
                            : 'bg-white border-slate-200/80 hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-800">
                              No. {item.no} &bull; {item.kebutuhan}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-semibold">
                              {item.divisi}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 truncate mt-0.5">
                            {item.keterangan}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {item.tanggal} &bull; Dikeluarkan: {item.dikeluarkan}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-xs text-rose-600 block">
                            Rp {formatCurrency(item.nominal)}
                          </span>
                          <span className="text-[10px] text-rose-500 font-medium">DB (Keluar)</span>
                        </div>
                      </div>
                    );
                  })
              )}

              {/* TAB 5: BIAYA & FEE PRESETS */}
              {activeTab === 'fee' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 mb-2">
                    Pilih potongan biaya marketplace atau bank untuk merekonsiliasi selisih dana bersih:
                  </p>
                  {[
                    { name: "Tokopedia's Power Merchant Service Fee", dbCr: 'DB' as const, desc: 'Potongan biaya layanan power merchant' },
                    { name: "Tokopedia's Bebas Ongkir Fee", dbCr: 'DB' as const, desc: 'Potongan program bebas ongkir' },
                    { name: 'Shopee Biaya Layanan & Administrasi', dbCr: 'DB' as const, desc: 'Potongan komisi Shopee' },
                    { name: 'Biaya Administrasi Bank Bulanan', dbCr: 'DB' as const, desc: 'Biaya admin bulanan rekening bank' },
                    { name: 'Biaya Transfer Antar Bank (BI-FAST / Realtime)', dbCr: 'DB' as const, desc: 'Biaya kliring / transfer bank' },
                    { name: 'Bunga Rekening Bank', dbCr: 'CR' as const, desc: 'Pendapatan bunga giro / tabungan' },
                    { name: 'Pajak Bunga Bank', dbCr: 'DB' as const, desc: 'Potongan PPh atas bunga bank' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectFeePreset(preset.name, preset.dbCr)}
                      className="w-full text-left p-3 rounded-2xl border border-slate-200 bg-white hover:bg-teal-50/50 hover:border-[#008d91]/50 transition-all flex items-center justify-between cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-xs text-slate-800 block">
                          {preset.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {preset.desc}
                        </span>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        preset.dbCr === 'DB' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {preset.dbCr}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* TAB 6: MANUAL CUSTOM */}
              {activeTab === 'custom' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                  <p className="text-xs text-slate-600 mb-2">
                    Isi rincian transaksi langsung pada formulir di sebelah kanan jika tidak terdapat pada master data.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setKode(`Koneksi Manual - ${mutasi.date}`);
                      setNominalAkhir(remaining > 0 ? remaining : mutasi.amount);
                      setDbCr(mutasi.type === 'DB' ? 'DB' : 'CR');
                    }}
                    className="text-xs font-semibold text-[#008d91] bg-teal-50 px-3.5 py-1.5 rounded-xl hover:bg-teal-100 transition-colors cursor-pointer"
                  >
                    Gunakan Sisa Saldo Mutasi
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Connection Confirmation Form */}
          <div className="lg:col-span-5 p-5 sm:p-6 bg-slate-50/30 flex flex-col justify-between">
            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Rincian Alokasi Mutasi
              </h4>

              {/* Kode / Nama Transaksi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode / Nama Transaksi Terkoneksi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={kode}
                  onChange={(e) => setKode(e.target.value)}
                  placeholder="Contoh: 2021 CC 4449002643 / Tokopedia Fee"
                  required
                  className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91]"
                />
              </div>

              {/* DB / CR Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipe Transaksi (DB / CR) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDbCr('CR')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                      dbCr === 'CR'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${dbCr === 'CR' ? 'opacity-100' : 'opacity-0'}`} />
                    <span>CR (Kredit / Masuk)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDbCr('DB')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                      dbCr === 'DB'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${dbCr === 'DB' ? 'opacity-100' : 'opacity-0'}`} />
                    <span>DB (Debit / Keluar)</span>
                  </button>
                </div>
              </div>

              {/* Nominal Akhir */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Nominal Akhir (Rp) <span className="text-red-500">*</span></span>
                  {remaining > 0 && (
                    <button
                      type="button"
                      onClick={() => setNominalAkhir(remaining)}
                      className="text-[11px] text-[#008d91] hover:underline"
                    >
                      Isi sisa: {formatCurrency(remaining)}
                    </button>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={nominalAkhir}
                    onChange={(e) => setNominalAkhir(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Contoh: 95000"
                    required
                    className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {dbCr === 'DB' ? 'Nilai akan dicatat negatif (-)' : 'Nilai dicatat positif (+)'}
                </p>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Catatan Tambahan (Opsional)
                </label>
                <textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Catatan rekonsiliasi..."
                  rows={2}
                  className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 outline-none focus:border-[#008d91] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200/80 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#008d91] hover:bg-[#007b7e] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan & Hubungkan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
