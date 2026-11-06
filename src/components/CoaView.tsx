import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Plus,
  X,
  Printer,
  Check,
  Edit2,
  Trash2,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Layers,
  Scale,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { CoaAccount } from '../accountingData';
import { MutasiItem, PengeluaranItem, ProjectItem, JenisProyekItem } from '../types';
import { generateJournalsFromMutasi, loadReversalJournals } from '../accountingData';
import { SalurOrder } from '../salurData';
import { DonasiOrder } from '../donasiData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { KebutuhanPengeluaranItem } from '../kebutuhanPengeluaranData';
import { PosPengeluaranGroup } from '../posPengeluaranData';

interface CoaViewProps {
  coaList: CoaAccount[];
  onUpdateCoaList: (updated: CoaAccount[]) => void;
  mutasiItems?: MutasiItem[];
  pengeluaranList?: PengeluaranItem[];
  salurOrders?: SalurOrder[];
  donasiOrders?: DonasiOrder[];
  transaksiAjarList?: TransaksiAjarItem[];
  kebutuhanPengeluaranList?: KebutuhanPengeluaranItem[];
  posPengeluaranList?: PosPengeluaranGroup[];
  projects?: ProjectItem[];
  jenisProyekList?: JenisProyekItem[];
  onNavigateToLaporanKeuangan?: () => void;
  onShowToast?: (msg: string) => void;
}

export const CoaView: React.FC<CoaViewProps> = ({
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
  onNavigateToLaporanKeuangan,
  onShowToast = (_msg: string) => {},
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedKelompokFilter, setSelectedKelompokFilter] = useState<string>('ALL');
  const [selectedPosFilter, setSelectedPosFilter] = useState<string>('ALL');
  const [isPrivacyMasked, setIsPrivacyMasked] = useState(false);

  // Modal Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CoaAccount | null>(null);
  const [formData, setFormData] = useState<Partial<CoaAccount>>({
    noAkun: '',
    namaAkun: '',
    pos: 'D',
    kelompok: 'AKTIVA',
    saldoAwalDebet: 0,
    saldoAwalKredit: 0,
  });

  // Calculate dynamic balances from mutasi journals to show connected real-time balances!
  const computedCoaList = useMemo(() => {
    const reversals = loadReversalJournals();
    const journals = generateJournalsFromMutasi(
      mutasiItems,
      pengeluaranList,
      reversals,
      coaList,
      salurOrders,
      donasiOrders,
      kebutuhanPengeluaranList,
      posPengeluaranList,
      projects,
      jenisProyekList,
      transaksiAjarList
    );

    const debetMap: Record<string, number> = {};
    const kreditMap: Record<string, number> = {};

    journals.forEach((entry) => {
      entry.lines.forEach((line) => {
        if (line.kodeAkunDb) {
          debetMap[line.kodeAkunDb] = (debetMap[line.kodeAkunDb] || 0) + (line.nominalDebet || 0);
        }
        if (line.kodeAkunKr) {
          kreditMap[line.kodeAkunKr] = (kreditMap[line.kodeAkunKr] || 0) + (line.nominalKredit || 0);
        }
      });
    });

    return coaList.map((acc) => {
      if (acc.isHeader) return acc;
      const additionalDebet = debetMap[acc.noAkun] || 0;
      const additionalKredit = kreditMap[acc.noAkun] || 0;

      let currentDebet = acc.saldoAwalDebet;
      let currentKredit = acc.saldoAwalKredit;

      if (acc.pos === 'D') {
        currentDebet = acc.saldoAwalDebet + additionalDebet - additionalKredit;
      } else {
        currentKredit = acc.saldoAwalKredit + additionalKredit - additionalDebet;
      }

      return {
        ...acc,
        currentDebet,
        currentKredit,
        mutasiDebet: additionalDebet,
        mutasiKredit: additionalKredit,
      };
    });
  }, [coaList, mutasiItems, pengeluaranList, salurOrders, donasiOrders, transaksiAjarList, kebutuhanPengeluaranList, posPengeluaranList, projects, jenisProyekList]);

  // Filtered COA
  const filteredAccounts = useMemo(() => {
    return computedCoaList.filter((acc) => {
      if (selectedKelompokFilter !== 'ALL' && acc.kelompok !== selectedKelompokFilter) {
        return false;
      }
      if (selectedPosFilter !== 'ALL' && acc.pos !== selectedPosFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          acc.noAkun.toLowerCase().includes(q) ||
          acc.namaAkun.toLowerCase().includes(q) ||
          acc.kelompok.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [computedCoaList, selectedKelompokFilter, selectedPosFilter, searchQuery]);

  // Format currency helpers matching screenshot
  const formatTableCellAmount = (val: number): string => {
    if (val === 0) return '-';
    if (val < 0) {
      return `(${Math.abs(val).toLocaleString('id-ID')})`;
    }
    return val.toLocaleString('id-ID');
  };

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setFormData({
      noAkun: '',
      namaAkun: '',
      pos: 'D',
      kelompok: 'AKTIVA',
      saldoAwalDebet: 0,
      saldoAwalKredit: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (acc: CoaAccount) => {
    setEditingAccount(acc);
    setFormData({
      noAkun: acc.noAkun,
      namaAkun: acc.namaAkun,
      pos: acc.pos,
      kelompok: acc.kelompok,
      saldoAwalDebet: acc.saldoAwalDebet,
      saldoAwalKredit: acc.saldoAwalKredit,
    });
    setIsModalOpen(true);
  };

  const handleSaveAccount = () => {
    if (!formData.noAkun?.trim() || !formData.namaAkun?.trim()) {
      onShowToast('Nomor Akun dan Nama Akun wajib diisi');
      return;
    }

    const noAkunClean = formData.noAkun.trim();
    const namaAkunClean = formData.namaAkun.trim();

    if (editingAccount) {
      // Check if changing to an already existing account number
      if (
        editingAccount.noAkun !== noAkunClean &&
        coaList.some((c) => c.noAkun === noAkunClean)
      ) {
        onShowToast(`Nomor Akun ${noAkunClean} sudah digunakan!`);
        return;
      }

      const updated = coaList.map((c) => {
        if (c.noAkun === editingAccount.noAkun) {
          return {
            ...c,
            noAkun: noAkunClean,
            namaAkun: namaAkunClean,
            pos: formData.pos as 'D' | 'K',
            kelompok: formData.kelompok as any,
            saldoAwalDebet: formData.pos === 'D' ? Number(formData.saldoAwalDebet) || 0 : 0,
            saldoAwalKredit: formData.pos === 'K' ? Number(formData.saldoAwalKredit) || 0 : 0,
          };
        }
        return c;
      });

      onUpdateCoaList(updated);
      setIsModalOpen(false);
      onShowToast(`Akun ${noAkunClean} - ${namaAkunClean} berhasil diperbarui`);
    } else {
      // Add new
      if (coaList.some((c) => c.noAkun === noAkunClean)) {
        onShowToast(`Nomor Akun ${noAkunClean} sudah ada!`);
        return;
      }

      const newAcc: CoaAccount = {
        noAkun: noAkunClean,
        namaAkun: namaAkunClean,
        pos: (formData.pos as 'D' | 'K') || 'D',
        kelompok: formData.kelompok as any,
        saldoAwalDebet: formData.pos === 'D' ? Number(formData.saldoAwalDebet) || 0 : 0,
        saldoAwalKredit: formData.pos === 'K' ? Number(formData.saldoAwalKredit) || 0 : 0,
      };

      const updated = [...coaList, newAcc].sort((a, b) => a.noAkun.localeCompare(b.noAkun));
      onUpdateCoaList(updated);
      setIsModalOpen(false);
      onShowToast(`Akun baru ${noAkunClean} - ${namaAkunClean} berhasil ditambahkan dan terkoneksi ke Laporan Keuangan`);
    }
  };

  const handleDeleteAccount = (noAkun: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus akun ${noAkun} - ${nama}?`)) {
      const updated = coaList.filter((c) => c.noAkun !== noAkun);
      onUpdateCoaList(updated);
      onShowToast(`Akun ${noAkun} berhasil dihapus`);
    }
  };

  return (
    <div className="w-full">
      {/* Top Toolbar matching Identitas & Laporan Keuangan UI */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              Chart of Accounts (COA)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#05828e]/10 text-[#05828e] border border-[#05828e]/20 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              Terkoneksi ke Laporan Keuangan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Master Nomor Akun, Nama Akun, Pos Debet/Kredit, dan Kelompok Akun Standar Yayasan
          </p>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Search Toggle */}
          {isSearchOpen ? (
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-xs animate-in fade-in duration-150">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari no akun, nama akun..."
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
              title="Cari Data Akun"
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {/* Privacy Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsPrivacyMasked(!isPrivacyMasked);
              onShowToast(isPrivacyMasked ? 'Nominal saldo ditampilkan' : 'Nominal saldo disamarkan');
            }}
            title={isPrivacyMasked ? 'Tampilkan Nominal' : 'Samarkan Nominal'}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer shadow-2xs ${
              isPrivacyMasked
                ? 'bg-amber-50 border-amber-300 text-amber-700 font-medium'
                : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {isPrivacyMasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Sliders / Filter Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              title="Filter Akun"
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5 ${
                isFilterOpen || selectedKelompokFilter !== 'ALL' || selectedPosFilter !== 'ALL'
                  ? 'bg-[#05828e] border-[#05828e] text-white'
                  : 'border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-40 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Filter Master COA</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedKelompokFilter('ALL');
                      setSelectedPosFilter('ALL');
                    }}
                    className="text-[11px] text-[#05828e] hover:underline font-medium cursor-pointer"
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
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 focus:bg-white outline-none"
                  >
                    <option value="ALL">Semua Kelompok</option>
                    <option value="AKTIVA">10000 AKTIVA</option>
                    <option value="KEWAJIBAN">20000 KEWAJIBAN</option>
                    <option value="EKUITAS">30000 EKUITAS</option>
                    <option value="PENDAPATAN">40000 PENDAPATAN</option>
                    <option value="BIAYA PROGRAM">50000 BIAYA PROGRAM</option>
                    <option value="BIAYA OPERASIONAL">60000 BIAYA OPERASIONAL</option>
                  </select>
                </div>

                {/* Filter Pos */}
                <div className="mb-2">
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Pos Saldo Normal
                  </label>
                  <div className="flex gap-2">
                    {['ALL', 'D', 'K'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSelectedPosFilter(p)}
                        className={`text-xs px-3 py-1 rounded-md transition-colors cursor-pointer ${
                          selectedPosFilter === p
                            ? 'bg-[#05828e] text-white font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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

          {/* Quick Jump to Laporan Keuangan */}
          {onNavigateToLaporanKeuangan && (
            <button
              type="button"
              onClick={onNavigateToLaporanKeuangan}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#05828e]" />
              <span className="hidden sm:inline">Laporan Keuangan</span>
            </button>
          )}

          {/* Print */}
          <button
            type="button"
            onClick={() => window.print()}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Cetak</span>
          </button>

          {/* Add Account Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="bg-[#05828e] hover:bg-[#046e78] text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Akun</span>
          </button>
        </div>
      </div>

      {/* Info Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5 mb-5">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Akun COA
          </span>
          <span className="text-xl font-bold text-slate-800 mt-0.5 block">
            {coaList.filter((c) => !c.isHeader).length} Akun
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Tersimpan di Master Database
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Akun Pos Debet (D)
          </span>
          <span className="text-xl font-bold text-emerald-700 mt-0.5 block">
            {coaList.filter((c) => !c.isHeader && c.pos === 'D').length} Akun
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Aktiva, Beban Program & Operasional
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Akun Pos Kredit (K)
          </span>
          <span className="text-xl font-bold text-blue-700 mt-0.5 block">
            {coaList.filter((c) => !c.isHeader && c.pos === 'K').length} Akun
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Kewajiban, Ekuitas & Pendapatan
          </span>
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold text-[#05828e] uppercase tracking-wider block flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Sinkronisasi Laporan
          </span>
          <span className="text-sm font-bold text-teal-950 mt-1 block">
            Terkoneksi Otomatis
          </span>
          <span className="text-[11px] text-teal-800 mt-0.5 block">
            Setiap edit langsung memperbarui Tab COA & Jurnal
          </span>
        </div>
      </div>

      {/* Main Table: DAFTAR AKUN matching screenshot image_d574fecf.png */}
      <div className="bg-white border border-slate-300 rounded-lg shadow-xs overflow-hidden">
        {/* Sheet Title matching exact screenshot */}
        <div className="py-2.5 text-center font-bold text-sm tracking-wide text-slate-900 bg-slate-100/90 border-b border-slate-300 uppercase flex items-center justify-center gap-2">
          <span>DAFTAR AKUN</span>
          <span className="text-[11px] font-normal text-slate-500">(Chart of Accounts)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-300 text-slate-800 font-bold uppercase text-[11px]">
                <th className="py-2.5 px-3 border-r border-slate-300 w-24">NO AKUN</th>
                <th className="py-2.5 px-4 border-r border-slate-300 min-w-[260px]">NAMA AKUN</th>
                <th className="py-2.5 px-3 border-r border-slate-300 text-center w-14">POS</th>
                <th className="py-2.5 px-3 border-r border-slate-300 min-w-[130px]">KELOMPOK</th>
                <th className="py-2.5 px-4 border-r border-slate-300 text-right min-w-[130px]">DEBET</th>
                <th className="py-2.5 px-4 border-r border-slate-300 text-right min-w-[130px]">KREDIT</th>
                <th className="py-2.5 px-3 text-center w-24">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAccounts.map((acc) => {
                if (acc.isHeader) {
                  return (
                    <tr
                      key={acc.noAkun}
                      className="bg-slate-100 font-extrabold text-slate-900 hover:bg-slate-150 transition-colors"
                    >
                      <td className="py-2 px-3 border-r border-slate-300 tracking-wider">
                        {acc.noAkun}
                      </td>
                      <td className="py-2 px-4 border-r border-slate-300 font-black tracking-wide" colSpan={3}>
                        {acc.namaAkun}
                      </td>
                      <td className="py-2 px-4 border-r border-slate-300 text-right text-slate-400 font-normal">
                        -
                      </td>
                      <td className="py-2 px-4 border-r border-slate-300 text-right text-slate-400 font-normal">
                        -
                      </td>
                      <td className="py-2 px-3 text-center text-slate-300 text-[10px]">
                        Header
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={acc.noAkun}
                    className="hover:bg-teal-50/40 transition-colors group"
                  >
                    {/* NO AKUN */}
                    <td className="py-2 px-3 border-r border-slate-200 font-mono font-bold text-slate-700">
                      {acc.noAkun}
                    </td>

                    {/* NAMA AKUN */}
                    <td className="py-2 px-4 border-r border-slate-200 text-slate-800 font-medium">
                      {acc.namaAkun}
                    </td>

                    {/* POS */}
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-bold">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          acc.pos === 'D'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {acc.pos}
                      </span>
                    </td>

                    {/* KELOMPOK */}
                    <td className="py-2 px-3 border-r border-slate-200 text-slate-600 text-[11px]">
                      {acc.kelompok}
                    </td>

                    {/* DEBET */}
                    <td className="py-2 px-4 border-r border-slate-200 text-right font-mono text-slate-800">
                      {isPrivacyMasked
                        ? '••••'
                        : formatTableCellAmount(acc.saldoAwalDebet)}
                    </td>

                    {/* KREDIT */}
                    <td className="py-2 px-4 border-r border-slate-200 text-right font-mono text-slate-800">
                      {isPrivacyMasked
                        ? '••••'
                        : formatTableCellAmount(acc.saldoAwalKredit)}
                    </td>

                    {/* AKSI */}
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(acc)}
                          title="Edit Akun"
                          className="p-1 rounded text-slate-500 hover:text-[#05828e] hover:bg-teal-50 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAccount(acc.noAkun, acc.namaAkun)}
                          title="Hapus Akun"
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
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

      {/* Modal Add / Edit Account */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#05828e] text-white flex items-center justify-center font-bold">
                  {editingAccount ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {editingAccount ? 'Edit Akun COA' : 'Tambah Akun COA Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Perubahan langsung terkoneksi ke Laporan Keuangan
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nomor Akun (Kode COA) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.noAkun}
                  onChange={(e) => setFormData({ ...formData, noAkun: e.target.value })}
                  placeholder="Contoh: 10207 / 60900"
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 font-mono text-slate-800 outline-none focus:border-[#05828e]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Akun <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.namaAkun}
                  onChange={(e) => setFormData({ ...formData, namaAkun: e.target.value })}
                  placeholder="Contoh: Kas Bank Operasional Tambahan"
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 outline-none focus:border-[#05828e]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Pos Saldo Normal
                  </label>
                  <select
                    value={formData.pos}
                    onChange={(e) => setFormData({ ...formData, pos: e.target.value as 'D' | 'K' })}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 font-bold outline-none focus:border-[#05828e]"
                  >
                    <option value="D">D (Debet)</option>
                    <option value="K">K (Kredit)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kelompok Akun
                  </label>
                  <select
                    value={formData.kelompok}
                    onChange={(e) => setFormData({ ...formData, kelompok: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 bg-slate-50 outline-none focus:border-[#05828e]"
                  >
                    <option value="AKTIVA">AKTIVA</option>
                    <option value="KEWAJIBAN">KEWAJIBAN</option>
                    <option value="EKUITAS">EKUITAS</option>
                    <option value="PENDAPATAN">PENDAPATAN</option>
                    <option value="BIAYA PROGRAM">BIAYA PROGRAM</option>
                    <option value="BIAYA OPERASIONAL">BIAYA OPERASIONAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Saldo Awal ({formData.pos === 'D' ? 'Debet' : 'Kredit'})
                </label>
                <input
                  type="number"
                  value={
                    formData.pos === 'D'
                      ? formData.saldoAwalDebet || ''
                      : formData.saldoAwalKredit || ''
                  }
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    if (formData.pos === 'D') {
                      setFormData({ ...formData, saldoAwalDebet: val, saldoAwalKredit: 0 });
                    } else {
                      setFormData({ ...formData, saldoAwalKredit: val, saldoAwalDebet: 0 });
                    }
                  }}
                  placeholder="0"
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 font-mono text-slate-800 outline-none focus:border-[#05828e]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveAccount}
                className="px-4 py-1.5 rounded-lg bg-[#05828e] hover:bg-[#046e78] text-white text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
