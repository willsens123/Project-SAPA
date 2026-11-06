import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  EyeOff,
  Eye,
  Plus,
  X,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { CoaAccount, INITIAL_COA_LIST, JournalEntry, generateJournalsFromMutasi } from '../accountingData';
import { MutasiItem, PengeluaranItem, ProjectItem, JenisProyekItem } from '../types';
import { SalurOrder } from '../salurData';
import { DonasiOrder } from '../donasiData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { KebutuhanPengeluaranItem } from '../kebutuhanPengeluaranData';
import { PosPengeluaranGroup } from '../posPengeluaranData';

interface CoaManagementViewProps {
  coaList: CoaAccount[];
  onUpdateCoaList: (items: CoaAccount[]) => void;
  mutasiItems?: MutasiItem[];
  pengeluaranList?: PengeluaranItem[];
  salurOrders?: SalurOrder[];
  donasiOrders?: DonasiOrder[];
  transaksiAjarList?: TransaksiAjarItem[];
  kebutuhanPengeluaranList?: KebutuhanPengeluaranItem[];
  posPengeluaranList?: PosPengeluaranGroup[];
  projects?: ProjectItem[];
  jenisProyekList?: JenisProyekItem[];
  onNavigateToView?: (view: string) => void;
  onShowToast?: (msg: string) => void;
}

export const CoaManagementView: React.FC<CoaManagementViewProps> = ({
  coaList,
  onUpdateCoaList,
  mutasiItems = [],
  pengeluaranList = [],
  salurOrders = [],
  donasiOrders = [],
  transaksiAjarList = [],
  kebutuhanPengeluaranList = [],
  posPengeluaranList = [],
  projects = [],
  jenisProyekList = [],
  onNavigateToView,
  onShowToast,
}) => {
  // Search & privacy states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPrivacyMasked, setIsPrivacyMasked] = useState(false);

  // Group filter
  const [selectedKelompokFilter, setSelectedKelompokFilter] = useState<string>('ALL');
  const [selectedPosFilter, setSelectedPosFilter] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CoaAccount | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<CoaAccount | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Toast
  const [localToast, setLocalToast] = useState<string | null>(null);
  const notify = (msg: string) => {
    if (onShowToast) onShowToast(msg);
    setLocalToast(msg);
    setTimeout(() => setLocalToast(null), 3000);
  };

  // Compute live journal movements from mutasi to display active debit/kredit per account
  const activeJournals = useMemo(() => {
    return generateJournalsFromMutasi(
      mutasiItems,
      pengeluaranList,
      [],
      coaList,
      salurOrders,
      donasiOrders,
      kebutuhanPengeluaranList,
      posPengeluaranList,
      projects,
      jenisProyekList,
      transaksiAjarList
    );
  }, [
    mutasiItems,
    pengeluaranList,
    coaList,
    salurOrders,
    donasiOrders,
    kebutuhanPengeluaranList,
    posPengeluaranList,
    projects,
    jenisProyekList,
    transaksiAjarList,
  ]);

  const accountMovements = useMemo(() => {
    const movements: Record<string, { debet: number; kredit: number }> = {};
    activeJournals.forEach((j) => {
      j.lines.forEach((l) => {
        if (l.kodeAkunDb) {
          if (!movements[l.kodeAkunDb]) movements[l.kodeAkunDb] = { debet: 0, kredit: 0 };
          movements[l.kodeAkunDb].debet += l.nominalDebet;
        }
        if (l.kodeAkunKr) {
          if (!movements[l.kodeAkunKr]) movements[l.kodeAkunKr] = { debet: 0, kredit: 0 };
          movements[l.kodeAkunKr].kredit += l.nominalKredit;
        }
      });
    });
    return movements;
  }, [activeJournals]);

  // Form states for Add / Edit
  const [formData, setFormData] = useState<Partial<CoaAccount>>({
    noAkun: '',
    namaAkun: '',
    pos: 'D',
    kelompok: 'AKTIVA',
    saldoAwalDebet: 0,
    saldoAwalKredit: 0,
  });

  const handleOpenAddModal = (defaultKelompok?: CoaAccount['kelompok']) => {
    // Determine suggested account number
    let suggestedNo = '';
    const group = defaultKelompok || 'AKTIVA';
    const prefixMap: Record<string, string> = {
      'AKTIVA': '10',
      'KEWAJIBAN': '20',
      'EKUITAS': '30',
      'PENDAPATAN': '40',
      'BIAYA PROGRAM': '50',
      'BIAYA OPERASIONAL': '60',
    };
    const pfx = prefixMap[group] || '10';
    const existingInGroup = coaList
      .filter((c) => c.noAkun.startsWith(pfx) && !c.isHeader)
      .map((c) => parseInt(c.noAkun, 10))
      .filter((n) => !isNaN(n));
    const nextNum = existingInGroup.length > 0 ? Math.max(...existingInGroup) + 1 : parseInt(`${pfx}101`, 10);
    suggestedNo = String(nextNum);

    setFormData({
      noAkun: suggestedNo,
      namaAkun: '',
      pos: group === 'KEWAJIBAN' || group === 'EKUITAS' || group === 'PENDAPATAN' ? 'K' : 'D',
      kelompok: group,
      saldoAwalDebet: 0,
      saldoAwalKredit: 0,
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (acc: CoaAccount) => {
    setEditingAccount(acc);
    setFormData({
      noAkun: acc.noAkun,
      namaAkun: acc.namaAkun,
      pos: acc.pos,
      kelompok: acc.kelompok,
      saldoAwalDebet: acc.saldoAwalDebet,
      saldoAwalKredit: acc.saldoAwalKredit,
    });
  };

  const handleSaveAdd = () => {
    if (!formData.noAkun?.trim() || !formData.namaAkun?.trim()) {
      notify('Nomor Akun dan Nama Akun wajib diisi!');
      return;
    }
    const cleanNo = formData.noAkun.trim();
    if (coaList.some((c) => c.noAkun === cleanNo)) {
      notify(`Nomor Akun ${cleanNo} sudah terdaftar! Gunakan nomor lain.`);
      return;
    }

    const newAcc: CoaAccount = {
      noAkun: cleanNo,
      namaAkun: formData.namaAkun.trim(),
      pos: (formData.pos as 'D' | 'K') || 'D',
      kelompok: formData.kelompok as any,
      saldoAwalDebet: Number(formData.saldoAwalDebet) || 0,
      saldoAwalKredit: Number(formData.saldoAwalKredit) || 0,
      isHeader: false,
    };

    const updated = [...coaList, newAcc].sort((a, b) => a.noAkun.localeCompare(b.noAkun));
    onUpdateCoaList(updated);
    setIsAddModalOpen(false);
    notify(`Akun ${newAcc.noAkun} - ${newAcc.namaAkun} berhasil ditambahkan dan terkoneksi!`);
  };

  const handleSaveEdit = () => {
    if (!editingAccount) return;
    if (!formData.noAkun?.trim() || !formData.namaAkun?.trim()) {
      notify('Nomor Akun dan Nama Akun wajib diisi!');
      return;
    }
    const cleanNo = formData.noAkun.trim();
    if (cleanNo !== editingAccount.noAkun && coaList.some((c) => c.noAkun === cleanNo)) {
      notify(`Nomor Akun ${cleanNo} sudah terdaftar pada akun lain!`);
      return;
    }

    const updated = coaList.map((acc) => {
      if (acc.noAkun === editingAccount.noAkun) {
        return {
          ...acc,
          noAkun: cleanNo,
          namaAkun: formData.namaAkun!.trim(),
          pos: (formData.pos as 'D' | 'K') || acc.pos,
          kelompok: (formData.kelompok as any) || acc.kelompok,
          saldoAwalDebet: Number(formData.saldoAwalDebet) || 0,
          saldoAwalKredit: Number(formData.saldoAwalKredit) || 0,
        };
      }
      return acc;
    }).sort((a, b) => a.noAkun.localeCompare(b.noAkun));

    onUpdateCoaList(updated);
    setEditingAccount(null);
    notify(`Akun COA ${cleanNo} berhasil diperbarui! Perubahan langsung sinkron ke Laporan Keuangan.`);
  };

  const handleDeleteAccount = () => {
    if (!accountToDelete) return;
    if (accountToDelete.isHeader) {
      notify('Akun Header Kelompok tidak boleh dihapus!');
      setAccountToDelete(null);
      return;
    }

    const updated = coaList.filter((c) => c.noAkun !== accountToDelete.noAkun);
    onUpdateCoaList(updated);
    notify(`Akun ${accountToDelete.noAkun} - ${accountToDelete.namaAkun} berhasil dihapus dari COA.`);
    setAccountToDelete(null);
  };

  const handleResetToDefault = () => {
    onUpdateCoaList(INITIAL_COA_LIST);
    setIsResetConfirmOpen(false);
    notify('Daftar Akun COA telah dikembalikan ke standar awal.');
  };

  // Filter accounts
  const filteredAccounts = useMemo(() => {
    return coaList.filter((acc) => {
      // Kelompok filter
      if (selectedKelompokFilter !== 'ALL' && acc.kelompok !== selectedKelompokFilter) {
        return false;
      }
      // Pos filter
      if (selectedPosFilter !== 'ALL' && acc.pos !== selectedPosFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNo = acc.noAkun.toLowerCase().includes(q);
        const matchesName = acc.namaAkun.toLowerCase().includes(q);
        const matchesGroup = acc.kelompok.toLowerCase().includes(q);
        if (!matchesNo && !matchesName && !matchesGroup) return false;
      }
      return true;
    });
  }, [coaList, selectedKelompokFilter, selectedPosFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    let totDebetAwal = 0;
    let totKreditAwal = 0;
    let countTotal = 0;
    let countAktiva = 0;
    let countKewajiban = 0;
    let countEkuitas = 0;
    let countPendapatan = 0;
    let countBiaya = 0;

    coaList.forEach((acc) => {
      if (!acc.isHeader) {
        countTotal++;
        totDebetAwal += acc.saldoAwalDebet || 0;
        totKreditAwal += acc.saldoAwalKredit || 0;
        if (acc.kelompok === 'AKTIVA') countAktiva++;
        else if (acc.kelompok === 'KEWAJIBAN') countKewajiban++;
        else if (acc.kelompok === 'EKUITAS') countEkuitas++;
        else if (acc.kelompok === 'PENDAPATAN') countPendapatan++;
        else countBiaya++;
      }
    });

    return {
      totDebetAwal,
      totKreditAwal,
      selisih: Math.abs(totDebetAwal - totKreditAwal),
      countTotal,
      countAktiva,
      countKewajiban,
      countEkuitas,
      countPendapatan,
      countBiaya,
    };
  }, [coaList]);

  // Format rupiah helper
  const formatRupiah = (val: number): string => {
    if (val === undefined || val === null || isNaN(val)) return 'Rp 0';
    if (val < 0) return `(Rp ${Math.abs(val).toLocaleString('id-ID')})`;
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const formatTableCell = (val: number): string => {
    if (val === 0) return '-';
    if (val < 0) return `(${Math.abs(val).toLocaleString('id-ID')})`;
    return val.toLocaleString('id-ID');
  };

  return (
    <div className="w-full">
      {/* Toast Alert */}
      {localToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{localToast}</span>
        </div>
      )}

      {/* Top Toolbar matching Identitas UI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#05828e]" />
              <span>COA (Chart of Accounts)</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#05828e]/10 text-[#05828e]">
              Master Akun
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar Nomor Akun, Nama Akun, dan Pos Debet/Kredit yang terkoneksi langsung dengan Laporan Keuangan & Mutasi
          </p>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Toggle Search Bar */}
          {isSearchOpen ? (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-xs animate-in fade-in duration-150">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kode akun, nama akun, pos..."
                autoFocus
                className="text-xs text-slate-700 outline-none w-44 sm:w-60"
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
                onClick={() => setIsSearchOpen(false)}
                className="text-slate-400 hover:text-slate-600 ml-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              title="Cari Akun"
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Privacy Mask Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsPrivacyMasked(!isPrivacyMasked);
              notify(isPrivacyMasked ? 'Nominal ditampilkan' : 'Nominal disamarkan (Mode Privasi)');
            }}
            title={isPrivacyMasked ? 'Tampilkan Saldo' : 'Samarkan Saldo'}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer shadow-2xs ${
              isPrivacyMasked
                ? 'bg-amber-50 border-amber-300 text-amber-700 font-medium'
                : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {isPrivacyMasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Filter Dropdown Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              title="Filter Akun"
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer shadow-2xs ${
                selectedKelompokFilter !== 'ALL' || selectedPosFilter !== 'ALL'
                  ? 'bg-teal-50 border-teal-300 text-[#05828e] font-semibold'
                  : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-30 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Filter Master Akun COA</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedKelompokFilter('ALL');
                      setSelectedPosFilter('ALL');
                    }}
                    className="text-[11px] text-[#05828e] hover:underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>

                {/* Filter Kelompok */}
                <div className="mb-3">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Kelompok Akun
                  </label>
                  <select
                    value={selectedKelompokFilter}
                    onChange={(e) => setSelectedKelompokFilter(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg p-1.5 text-slate-700 focus:outline-none focus:border-[#05828e]"
                  >
                    <option value="ALL">Semua Kelompok</option>
                    <option value="AKTIVA">AKTIVA (10000)</option>
                    <option value="KEWAJIBAN">KEWAJIBAN (20000)</option>
                    <option value="EKUITAS">EKUITAS (30000)</option>
                    <option value="PENDAPATAN">PENDAPATAN (40000)</option>
                    <option value="BIAYA PROGRAM">BIAYA PROGRAM (50000)</option>
                    <option value="BIAYA OPERASIONAL">BIAYA OPERASIONAL (60000)</option>
                  </select>
                </div>

                {/* Filter POS */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Pos Akun (Normal Balance)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['ALL', 'D', 'K'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSelectedPosFilter(p)}
                        className={`text-xs py-1 rounded-md text-center transition-colors cursor-pointer ${
                          selectedPosFilter === p
                            ? 'bg-[#05828e] text-white font-semibold'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {p === 'ALL' ? 'Semua' : p === 'D' ? 'Debet (D)' : 'Kredit (K)'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Shortcut to Laporan Keuangan */}
          {onNavigateToView && (
            <button
              type="button"
              onClick={() => onNavigateToView('laporanKeuangan')}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#05828e]" />
              <span className="hidden sm:inline">Laporan Keuangan</span>
            </button>
          )}

          {/* Add Account Button */}
          <button
            type="button"
            onClick={() => handleOpenAddModal()}
            className="bg-[#05828e] hover:bg-[#046e78] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Akun</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <p className="text-[11px] font-medium text-slate-500">Total Akun Terdaftar</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-slate-900">{stats.countTotal}</span>
            <span className="text-[10px] text-slate-400">Akun Detail</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Aktiva: {stats.countAktiva} • Kewajiban: {stats.countKewajiban} • Pendapatan: {stats.countPendapatan}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <p className="text-[11px] font-medium text-slate-500">Saldo Awal Debet</p>
          <p className="text-lg font-bold text-emerald-600 mt-0.5 font-mono">
            {isPrivacyMasked ? '••••••••' : formatRupiah(stats.totDebetAwal)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Kas, Bank, Piutang, Perlengkapan</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <p className="text-[11px] font-medium text-slate-500">Saldo Awal Kredit</p>
          <p className="text-lg font-bold text-slate-800 mt-0.5 font-mono">
            {isPrivacyMasked ? '••••••••' : formatRupiah(stats.totKreditAwal)}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Hutang, Modal, & Saldo Dana</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-500">Status Neraca Saldo</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-bold text-emerald-700">Seimbang (Debet = Kredit)</span>
            </div>
          </div>
          <p className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 inline-block w-fit mt-1">
            ✓ Terhubung Laporan Keuangan
          </p>
        </div>
      </div>

      {/* Group Quick Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-4 scrollbar-none">
        {[
          { key: 'ALL', label: 'Semua Akun' },
          { key: 'AKTIVA', label: '10000 AKTIVA' },
          { key: 'KEWAJIBAN', label: '20000 KEWAJIBAN' },
          { key: 'EKUITAS', label: '30000 EKUITAS' },
          { key: 'PENDAPATAN', label: '40000 PENDAPATAN' },
          { key: 'BIAYA PROGRAM', label: '50000 BIAYA PROGRAM' },
          { key: 'BIAYA OPERASIONAL', label: '60000 BIAYA OPERASIONAL' },
        ].map((item) => {
          const isActive = selectedKelompokFilter === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedKelompokFilter(item.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                isActive
                  ? 'bg-[#05828e] border-[#05828e] text-white shadow-xs font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Main COA Table Container matching screenshot image_d574fecf.png */}
      <div className="bg-white border border-slate-300 rounded-lg shadow-xs overflow-hidden">
        {/* Table Title Bar */}
        <div className="py-2.5 px-4 flex items-center justify-between font-bold text-sm tracking-wide text-slate-900 bg-slate-100/90 border-b border-slate-300">
          <span className="uppercase">DAFTAR AKUN (CHART OF ACCOUNTS)</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-normal text-slate-500">
              Menampilkan {filteredAccounts.length} akun
            </span>
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="text-[11px] font-medium text-slate-500 hover:text-rose-600 flex items-center gap-1 hover:underline cursor-pointer ml-3"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Standar</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-300 text-slate-800 font-bold uppercase text-[11px]">
                <th className="py-2.5 px-3 border-r border-slate-300 w-24">NO AKUN</th>
                <th className="py-2.5 px-4 border-r border-slate-300 min-w-[240px]">NAMA AKUN</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center w-14">POS</th>
                <th className="py-2.5 px-3 border-r border-slate-300 min-w-[130px]">KELOMPOK</th>
                <th className="py-2.5 px-4 border-r border-slate-300 text-right min-w-[120px]">SALDO AWAL (D)</th>
                <th className="py-2.5 px-4 border-r border-slate-300 text-right min-w-[120px]">SALDO AWAL (K)</th>
                <th className="py-2.5 px-4 border-r border-slate-300 text-right min-w-[110px]">MUTASI (MUTASI BANK)</th>
                <th className="py-2.5 px-4 border-r border-slate-300 text-right min-w-[120px]">SALDO AKHIR</th>
                <th className="py-2.5 px-3 text-center w-24">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAccounts.map((acc) => {
                if (acc.isHeader) {
                  // Category Header row (e.g. 10000 AKTIVA)
                  return (
                    <tr
                      key={acc.noAkun}
                      className="bg-slate-100/90 font-extrabold text-slate-900 hover:bg-slate-200/70 transition-colors"
                    >
                      <td className="py-2.5 px-3 border-r border-slate-300 tracking-wider font-mono">
                        {acc.noAkun}
                      </td>
                      <td className="py-2.5 px-4 border-r border-slate-300 font-black tracking-wide" colSpan={3}>
                        {acc.namaAkun}
                      </td>
                      <td className="py-2.5 px-4 border-r border-slate-300 text-right text-slate-400 font-normal">
                        -
                      </td>
                      <td className="py-2.5 px-4 border-r border-slate-300 text-right text-slate-400 font-normal">
                        -
                      </td>
                      <td className="py-2.5 px-4 border-r border-slate-300 text-right text-slate-400 font-normal">
                        -
                      </td>
                      <td className="py-2.5 px-4 border-r border-slate-300 text-right text-slate-400 font-normal">
                        -
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenAddModal(acc.kelompok)}
                          title={`Tambah akun baru di kelompok ${acc.namaAkun}`}
                          className="text-[10px] bg-white border border-slate-300 hover:border-[#05828e] text-slate-700 hover:text-[#05828e] px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer shadow-2xs"
                        >
                          + Tambah
                        </button>
                      </td>
                    </tr>
                  );
                }

                // Regular account row
                const mv = accountMovements[acc.noAkun] || { debet: 0, kredit: 0 };
                const mutasiNet = mv.debet - mv.kredit;

                // Calculate ending balance according to normal position (D or K)
                let saldoAkhir = 0;
                if (acc.pos === 'D') {
                  saldoAkhir = (acc.saldoAwalDebet || 0) + mv.debet - mv.kredit;
                } else {
                  saldoAkhir = (acc.saldoAwalKredit || 0) + mv.kredit - mv.debet;
                }

                return (
                  <tr
                    key={acc.noAkun}
                    className="hover:bg-teal-50/40 transition-colors group"
                  >
                    <td className="py-2 px-3 border-r border-slate-200 font-mono text-slate-700 font-medium">
                      {acc.noAkun}
                    </td>
                    <td className="py-2 px-4 border-r border-slate-200 text-slate-900 font-medium">
                      <div className="flex items-center gap-2">
                        <span>{acc.namaAkun}</span>
                        {Number(acc.noAkun) >= 40002 && Number(acc.noAkun) <= 49990 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-teal-50 text-teal-700 border border-teal-200 font-semibold shrink-0">
                            Item S-SALUR
                          </span>
                        )}
                        {['10001', '10002', '10003', '10004'].includes(acc.noAkun) && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-sky-50 text-sky-700 border border-sky-200 font-semibold shrink-0">
                            Pos Keuangan
                          </span>
                        )}
                        {Number(acc.noAkun) >= 10101 && Number(acc.noAkun) <= 10299 && !['10205'].includes(acc.noAkun) && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 border border-amber-200 font-semibold shrink-0">
                            Jenis Proyek
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-bold">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                          acc.pos === 'D'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {acc.pos}
                      </span>
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-slate-600 text-[11px]">
                      {acc.kelompok}
                    </td>
                    <td className="py-2 px-4 border-r border-slate-200 text-right font-mono text-slate-700">
                      {isPrivacyMasked ? '••••' : formatTableCell(acc.saldoAwalDebet)}
                    </td>
                    <td className="py-2 px-4 border-r border-slate-200 text-right font-mono text-slate-700">
                      {isPrivacyMasked ? '••••' : formatTableCell(acc.saldoAwalKredit)}
                    </td>
                    <td className="py-2 px-4 border-r border-slate-200 text-right font-mono text-[11px]">
                      {isPrivacyMasked ? (
                        '••••'
                      ) : mv.debet > 0 || mv.kredit > 0 ? (
                        <div>
                          {mv.debet > 0 && <span className="text-blue-600 block">+{formatTableCell(mv.debet)}</span>}
                          {mv.kredit > 0 && <span className="text-rose-600 block">-{formatTableCell(mv.kredit)}</span>}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-r border-slate-200 text-right font-mono font-semibold text-slate-900">
                      {isPrivacyMasked ? '••••' : formatTableCell(saldoAkhir)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(acc)}
                          title="Edit Akun"
                          className="p-1 text-slate-400 hover:text-[#05828e] hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setAccountToDelete(acc)}
                          title="Hapus Akun"
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Notice about live connection */}
      <div className="mt-4 bg-teal-50/60 border border-teal-200 rounded-xl p-3.5 text-xs text-teal-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#05828e] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-slate-900">
              Integrasi Penuh dengan Laporan Keuangan & Mutasi
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Setiap perubahan Nomor Akun, Nama Akun, dan Pos COA di halaman ini secara otomatis terhubung dengan tab <strong>COA</strong>, transaksi <strong>Jurnal Umum</strong> dari Mutasi, neraca <strong>MANAJEMEN</strong>, dan ringkasan <strong>SUMMARY</strong> di Laporan Keuangan.
            </p>
          </div>
        </div>
        {onNavigateToView && (
          <button
            type="button"
            onClick={() => onNavigateToView('laporanKeuangan')}
            className="bg-[#05828e] hover:bg-[#046e78] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Buka Laporan Keuangan</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL: Tambah Akun COA Baru */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#05828e]" />
                <h3 className="font-bold text-sm">Tambah Akun COA Baru</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nomor Akun <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.noAkun || ''}
                    onChange={(e) => setFormData({ ...formData, noAkun: e.target.value })}
                    placeholder="Contoh: 10207"
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:border-[#05828e] focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Kode unik 5 digit</p>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kelompok Akun
                  </label>
                  <select
                    value={formData.kelompok || 'AKTIVA'}
                    onChange={(e) => {
                      const grp = e.target.value as any;
                      const isCredit = grp === 'KEWAJIBAN' || grp === 'EKUITAS' || grp === 'PENDAPATAN';
                      setFormData({
                        ...formData,
                        kelompok: grp,
                        pos: isCredit ? 'K' : 'D',
                      });
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:border-[#05828e] focus:outline-none"
                  >
                    <option value="AKTIVA">AKTIVA (10000)</option>
                    <option value="KEWAJIBAN">KEWAJIBAN (20000)</option>
                    <option value="EKUITAS">EKUITAS (30000)</option>
                    <option value="PENDAPATAN">PENDAPATAN (40000)</option>
                    <option value="BIAYA PROGRAM">BIAYA PROGRAM (50000)</option>
                    <option value="BIAYA OPERASIONAL">BIAYA OPERASIONAL (60000)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Akun <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.namaAkun || ''}
                  onChange={(e) => setFormData({ ...formData, namaAkun: e.target.value })}
                  placeholder="Contoh: Kas BCA Cadangan Proyek"
                  className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:border-[#05828e] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Pos Normal (Saldo Normal)
                  </label>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1.5 p-2 border border-slate-200 rounded-lg cursor-pointer flex-1 justify-center hover:bg-slate-50">
                      <input
                        type="radio"
                        name="posAkun"
                        checked={formData.pos === 'D'}
                        onChange={() => setFormData({ ...formData, pos: 'D' })}
                      />
                      <span className="font-bold text-slate-800">Debet (D)</span>
                    </label>
                    <label className="flex items-center gap-1.5 p-2 border border-slate-200 rounded-lg cursor-pointer flex-1 justify-center hover:bg-slate-50">
                      <input
                        type="radio"
                        name="posAkun"
                        checked={formData.pos === 'K'}
                        onChange={() => setFormData({ ...formData, pos: 'K' })}
                      />
                      <span className="font-bold text-slate-800">Kredit (K)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Saldo Awal (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.pos === 'D' ? formData.saldoAwalDebet || 0 : formData.saldoAwalKredit || 0}
                    onChange={(e) => {
                      const num = Number(e.target.value) || 0;
                      if (formData.pos === 'D') {
                        setFormData({ ...formData, saldoAwalDebet: num, saldoAwalKredit: 0 });
                      } else {
                        setFormData({ ...formData, saldoAwalDebet: 0, saldoAwalKredit: num });
                      }
                    }}
                    placeholder="0"
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:border-[#05828e] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveAdd}
                  className="px-4 py-1.5 rounded-lg bg-[#05828e] hover:bg-[#046e78] text-white font-semibold cursor-pointer shadow-xs"
                >
                  Simpan Akun
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Edit Akun COA */}
      {/* ============================================================== */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#05828e]" />
                <h3 className="font-bold text-sm">Edit Akun COA: {editingAccount.noAkun}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nomor Akun <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.noAkun || ''}
                    onChange={(e) => setFormData({ ...formData, noAkun: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:border-[#05828e] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kelompok Akun
                  </label>
                  <select
                    value={formData.kelompok || 'AKTIVA'}
                    onChange={(e) => setFormData({ ...formData, kelompok: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:border-[#05828e] focus:outline-none"
                  >
                    <option value="AKTIVA">AKTIVA (10000)</option>
                    <option value="KEWAJIBAN">KEWAJIBAN (20000)</option>
                    <option value="EKUITAS">EKUITAS (30000)</option>
                    <option value="PENDAPATAN">PENDAPATAN (40000)</option>
                    <option value="BIAYA PROGRAM">BIAYA PROGRAM (50000)</option>
                    <option value="BIAYA OPERASIONAL">BIAYA OPERASIONAL (60000)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Akun <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.namaAkun || ''}
                  onChange={(e) => setFormData({ ...formData, namaAkun: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 text-slate-900 focus:border-[#05828e] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Pos Normal (Saldo Normal)
                  </label>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1.5 p-2 border border-slate-200 rounded-lg cursor-pointer flex-1 justify-center hover:bg-slate-50">
                      <input
                        type="radio"
                        name="posAkunEdit"
                        checked={formData.pos === 'D'}
                        onChange={() => setFormData({ ...formData, pos: 'D' })}
                      />
                      <span className="font-bold text-slate-800">Debet (D)</span>
                    </label>
                    <label className="flex items-center gap-1.5 p-2 border border-slate-200 rounded-lg cursor-pointer flex-1 justify-center hover:bg-slate-50">
                      <input
                        type="radio"
                        name="posAkunEdit"
                        checked={formData.pos === 'K'}
                        onChange={() => setFormData({ ...formData, pos: 'K' })}
                      />
                      <span className="font-bold text-slate-800">Kredit (K)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Saldo Awal (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.pos === 'D' ? formData.saldoAwalDebet || 0 : formData.saldoAwalKredit || 0}
                    onChange={(e) => {
                      const num = Number(e.target.value) || 0;
                      if (formData.pos === 'D') {
                        setFormData({ ...formData, saldoAwalDebet: num, saldoAwalKredit: 0 });
                      } else {
                        setFormData({ ...formData, saldoAwalDebet: 0, saldoAwalKredit: num });
                      }
                    }}
                    className="w-full border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:border-[#05828e] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-4 py-1.5 rounded-lg bg-[#05828e] hover:bg-[#046e78] text-white font-semibold cursor-pointer shadow-xs"
                >
                  Perbarui Akun
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Konfirmasi Hapus Akun */}
      {/* ============================================================== */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 text-xs text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Hapus Akun COA?</h4>
            <p className="text-slate-600 mt-1.5">
              Apakah Anda yakin ingin menghapus akun <strong>{accountToDelete.noAkun} - {accountToDelete.namaAkun}</strong>?
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[11px] text-amber-800 text-left mt-3">
              Perhatian: Menghapus akun ini juga akan memperbarui tampilan COA di Laporan Keuangan.
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer shadow-xs"
              >
                Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: Konfirmasi Reset Standar COA */}
      {/* ============================================================== */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 text-xs text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Reset ke Standar Awal?</h4>
            <p className="text-slate-600 mt-1.5">
              Daftar akun COA akan dikembalikan ke bagan akun standar yayasan. Seluruh nomor dan nama akun kustom akan diatur ulang.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold cursor-pointer shadow-xs"
              >
                Ya, Reset Standar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
