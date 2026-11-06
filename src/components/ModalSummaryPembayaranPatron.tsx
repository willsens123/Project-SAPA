import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Filter,
  Search,
  ArrowUpDown,
  Tag,
  ShieldCheck,
  UserCheck,
  Ban,
  Receipt,
  Download,
} from 'lucide-react';
import { DharmaPatronRutinItem, MutasiItem } from '../types';
import { DonasiOrder } from '../donasiData';
import {
  isOrderMatchingPatron,
  isDonasiOrderLunas,
  isDonasiOrderLunasDanKonekMutasi,
  extractPatronDonationDetails,
  calculateRealtimePatronReport,
} from '../utils/dharmaPatronPiutangHelper';

export interface SummaryRowItem {
  id: string;
  tanggal: string;
  timestamp: number;
  kategori: 'Tanggal Bergabung' | 'Transaksi D-DONASI' | 'Pemutihan Donasi' | 'Ganti Nominal' | 'Berhenti Donasi';
  kodeTransaksi: string;
  bulanPeriode: string;
  nominal: number | string;
  status: 'Lunas' | 'Diputihkan' | 'Terdaftar' | 'Belum Bayar' | 'Selesai' | 'Tidak Aktif';
  statusColor: string;
  keterangan: string;
  orderRef?: DonasiOrder;
}

interface ModalSummaryPembayaranPatronProps {
  isOpen: boolean;
  onClose: () => void;
  patron: DharmaPatronRutinItem | null;
  donasiOrders: DonasiOrder[];
  mutasiItems?: MutasiItem[];
  onShowToast?: (msg: string) => void;
}

export const ModalSummaryPembayaranPatron: React.FC<ModalSummaryPembayaranPatronProps> = ({
  isOpen,
  onClose,
  patron,
  donasiOrders,
  mutasiItems = [],
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'Semua' | 'Transaksi' | 'Pemutihan' | 'Perubahan'>('Semua');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Parse flexible date to timestamp for chronological ordering
  const parseDateToTimestamp = (dateStr?: string): number => {
    if (!dateStr) return 0;
    const monthMap: Record<string, number> = {
      jan: 0, januari: 0,
      feb: 1, februari: 1,
      mar: 2, maret: 2,
      apr: 3, april: 3,
      mei: 4, may: 4,
      jun: 5, juni: 5,
      jul: 6, juli: 6,
      agu: 7, agt: 7, agustus: 7,
      sep: 8, september: 8,
      okt: 9, oktober: 9,
      nov: 10, november: 10,
      des: 11, desember: 11,
    };

    const parts = dateStr.trim().split(/[\s,/\-_]+/);
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10) || 1;
      const mStr = parts[1].toLowerCase().slice(0, 3);
      const m = monthMap[mStr] !== undefined ? monthMap[mStr] : 0;
      let yr = parseInt(parts[2], 10) || 2021;
      if (yr < 100) yr += 2000;
      return new Date(yr, m, day).getTime();
    }
    return 0;
  };

  // Build the complete historical summary rows
  const summaryRows = useMemo<SummaryRowItem[]>(() => {
    if (!patron) return [];

    const rows: SummaryRowItem[] = [];
    const donasiPerbulan = patron.donasiPerbulan || 100000;

    // 1. Tanggal Bergabung
    const joinDate = patron.tanggalBergabung || patron.bulanMulaiDonasi || '01 Jan 2021';
    rows.push({
      id: `join-${patron.id}`,
      tanggal: joinDate,
      timestamp: parseDateToTimestamp(joinDate),
      kategori: 'Tanggal Bergabung',
      kodeTransaksi: `DPR-${patron.noDonatur}`,
      bulanPeriode: `Mulai ${patron.bulanMulaiDonasi || joinDate}`,
      nominal: patron.donasiPerbulan,
      status: 'Terdaftar',
      statusColor: 'bg-teal-50 text-[#008d91] border-teal-200',
      keterangan: `Terdaftar sebagai Dharma Patron Rutin | Sumber: ${patron.sumber || '-'} | Group: ${patron.groupJarkom || '-'}`,
    });

    // 2. Transaksi D-DONASI: Sesuai aturan, HANYA merekap transaksi yang sudah lunas yang terkoneksi dengan mutasi
    donasiOrders.forEach((order) => {
      if (!isOrderMatchingPatron(order, patron)) return;

      const isLunasDanKonekMutasi = isDonasiOrderLunasDanKonekMutasi(order, mutasiItems);
      // Lewati transaksi yang belum lunas atau belum terkoneksi dengan mutasi
      if (!isLunasDanKonekMutasi) return;

      const details = extractPatronDonationDetails(order, donasiPerbulan);
      const txNominal = details.nominal > 0 ? details.nominal : order.totalDana || donasiPerbulan;
      const monthsStr = details.monthsCovered.length > 0 ? details.monthsCovered.join(', ') : (order.date.split(' ')[1] || '-');

      // Ambil rincian mutasi bank terkait
      const matchedMutasi = mutasiItems.find((m) =>
        m.linkedTransactions?.some((l) => l.orderId === order.id || (order.orderNumber && l.kode === order.orderNumber))
      );
      const bankKet = matchedMutasi
        ? `Terkoneksi ${matchedMutasi.bankAccount} (${matchedMutasi.date})`
        : 'Terkoneksi Mutasi Bank';

      rows.push({
        id: `tx-${order.id}`,
        tanggal: order.date || '14 Nov 2021',
        timestamp: parseDateToTimestamp(order.date),
        kategori: 'Transaksi D-DONASI',
        kodeTransaksi: order.orderNumber,
        bulanPeriode: monthsStr,
        nominal: txNominal,
        status: 'Lunas',
        statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        keterangan: `Via ${order.via || 'Call Center'} | ${order.keterangan?.title || 'Dharma Patron'} | ${bankKet} | Pelimpahan: ${order.pelimpahanJasa?.name || '-'}`,
        orderRef: order,
      });
    });

    // 3. Bulan-Bulan Diputihkan (dari Edit Donasi/Rutin)
    if (patron.bulanDiputihkan && patron.bulanDiputihkan.length > 0) {
      patron.bulanDiputihkan.forEach((bulan, idx) => {
        const pDate = patron.bulanMulaiPerubahanDonasi || patron.tanggalBergabung || '01 Okt 2021';
        rows.push({
          id: `pemutihan-${patron.id}-${idx}`,
          tanggal: pDate,
          timestamp: parseDateToTimestamp(pDate) + 1000,
          kategori: 'Pemutihan Donasi',
          kodeTransaksi: `PMT-${patron.noDonatur}-${idx + 1}`,
          bulanPeriode: bulan,
          nominal: donasiPerbulan,
          status: 'Diputihkan',
          statusColor: 'bg-amber-50 text-amber-800 border-amber-200',
          keterangan: `Pembebasan tunggakan donasi bulan ${bulan} melalui menu Edit Donasi/Rutin`,
        });
      });
    } else if (
      patron.jenisPerubahanDonasi &&
      patron.jenisPerubahanDonasi.toLowerCase().includes('pemutihan')
    ) {
      const pDate = patron.bulanMulaiPerubahanDonasi || '01 Okt 2021';
      rows.push({
        id: `pemutihan-active-${patron.id}`,
        tanggal: pDate,
        timestamp: parseDateToTimestamp(pDate) + 1000,
        kategori: 'Pemutihan Donasi',
        kodeTransaksi: `PMT-${patron.noDonatur}`,
        bulanPeriode: patron.bulanMulaiPerubahanDonasi || 'Oktober 2021',
        nominal: donasiPerbulan,
        status: 'Diputihkan',
        statusColor: 'bg-amber-50 text-amber-800 border-amber-200',
        keterangan: `Penghapusan tunggakan donasi dari Edit Donasi/Rutin (${patron.bulanMulaiPerubahanDonasi || 'Tunggakan'})`,
      });
    }

    // 4. Perubahan Nominal
    if (
      patron.jenisPerubahanDonasi &&
      patron.jenisPerubahanDonasi.toLowerCase().includes('nominal')
    ) {
      const changeDate = patron.bulanMulaiPerubahanDonasi || patron.tanggalBergabung || '01 Nov 2021';
      rows.push({
        id: `ubah-nominal-${patron.id}`,
        tanggal: changeDate,
        timestamp: parseDateToTimestamp(changeDate) + 2000,
        kategori: 'Ganti Nominal',
        kodeTransaksi: `NOM-${patron.noDonatur}`,
        bulanPeriode: `Mulai ${patron.bulanMulaiPerubahanDonasi || '-'}`,
        nominal: patron.donasiPerbulan,
        status: 'Selesai',
        statusColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        keterangan: `Penyesuaian nominal donasi rutin menjadi Rp${patron.donasiPerbulan.toLocaleString('id-ID')}/bulan`,
      });
    }

    // 5. Berhenti Donasi
    if (
      patron.statusAktif === 'Tidak Aktif' ||
      (patron.jenisPerubahanDonasi && patron.jenisPerubahanDonasi.toLowerCase().includes('berhenti'))
    ) {
      const stopDate = patron.tanggalBerhenti || patron.bulanMulaiPerubahanDonasi || '01 Nov 2021';
      rows.push({
        id: `stop-${patron.id}`,
        tanggal: stopDate,
        timestamp: parseDateToTimestamp(stopDate) + 3000,
        kategori: 'Berhenti Donasi',
        kodeTransaksi: `STP-${patron.noDonatur}`,
        bulanPeriode: `Berhenti sejak ${stopDate}`,
        nominal: '-',
        status: 'Tidak Aktif',
        statusColor: 'bg-rose-50 text-rose-700 border-rose-200',
        keterangan: 'Donatur menonaktifkan atau berhenti dari komitmen donasi rutin',
      });
    }

    return rows;
  }, [patron, donasiOrders, mutasiItems]);

  // Calculate live report stats
  const realtimeReport = useMemo(() => {
    if (!patron) return null;
    return calculateRealtimePatronReport(patron, donasiOrders, mutasiItems);
  }, [patron, donasiOrders, mutasiItems]);

  // Filtered and sorted rows
  const displayRows = useMemo(() => {
    let result = [...summaryRows];

    // Filter by category chip
    if (selectedFilter === 'Transaksi') {
      result = result.filter((r) => r.kategori === 'Transaksi D-DONASI');
    } else if (selectedFilter === 'Pemutihan') {
      result = result.filter((r) => r.kategori === 'Pemutihan Donasi');
    } else if (selectedFilter === 'Perubahan') {
      result = result.filter(
        (r) =>
          r.kategori === 'Ganti Nominal' ||
          r.kategori === 'Berhenti Donasi' ||
          r.kategori === 'Tanggal Bergabung'
      );
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.tanggal.toLowerCase().includes(q) ||
          r.kodeTransaksi.toLowerCase().includes(q) ||
          r.bulanPeriode.toLowerCase().includes(q) ||
          r.kategori.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q) ||
          r.keterangan.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.timestamp - a.timestamp;
      }
      return a.timestamp - b.timestamp;
    });

    return result;
  }, [summaryRows, selectedFilter, searchQuery, sortOrder]);

  if (!isOpen || !patron) return null;

  const formatRupiah = (val: number | string) => {
    if (typeof val === 'string') return val;
    if (val === 0) return 'Rp0';
    const isNeg = val < 0;
    const absVal = Math.abs(val);
    const formatted = new Intl.NumberFormat('id-ID').format(absVal);
    return isNeg ? `-Rp${formatted}` : `Rp${formatted}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Header Section */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-teal-50/40 via-white to-white shrink-0">
          <div className="flex items-center gap-4">
            {/* Patron Avatar */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xs shrink-0"
              style={{ backgroundColor: patron.avatarBg || '#008d91' }}
            >
              {patron.avatarLetter || patron.namaDonatur.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  Summary Pembayaran & Riwayat
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-teal-50 text-[#008d91] border border-teal-200">
                  No. {patron.noDonatur}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
                  {patron.afiliasiKci}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Donatur: <strong className="text-slate-800">{patron.namaDonatur}</strong> ({patron.panggilan || patron.namaPendek || '-'}) • Rek: {patron.namaRekening}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-2"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Stat Cards */}
        <div className="px-6 py-4 bg-slate-50/60 border-b border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          {/* 1. Komitmen Bulanan */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/70 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Komitmen Donasi
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-800 mt-0.5 block">
              Rp{(patron.donasiPerbulan || 0).toLocaleString('id-ID')}
              <span className="text-xs font-normal text-slate-400 ml-1">/bulan</span>
            </span>
          </div>

          {/* 2. Total Transaksi Lunas */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/70 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              D-DONASI Lunas & Mutasi
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm sm:text-base font-bold text-emerald-600">
                {realtimeReport?.matchingLunasOrders.length || 0} Transaksi
              </span>
              <span className="text-xs text-slate-400">
                (Rp{(realtimeReport?.totalLunasNominal || 0).toLocaleString('id-ID')})
              </span>
            </div>
          </div>

          {/* 3. Piutang Saat Ini */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/70 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Piutang Saat Ini
            </span>
            <span
              className={`text-sm sm:text-base font-bold mt-0.5 block ${
                (realtimeReport?.piutang || 0) < 0 ? 'text-rose-600' : 'text-[#008d91]'
              }`}
            >
              {formatRupiah(realtimeReport?.piutang || 0)}
            </span>
          </div>

          {/* 4. Bulan Piutang */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/70 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Bulan Piutang
            </span>
            <span
              className={`text-sm sm:text-base font-bold mt-0.5 block truncate ${
                realtimeReport?.bulanPiutang && realtimeReport.bulanPiutang !== '-'
                  ? 'text-rose-600'
                  : 'text-slate-500 font-medium'
              }`}
            >
              {realtimeReport?.bulanPiutang || '-'}
            </span>
          </div>
        </div>

        {/* Toolbar: Category Chips, Search, Sort */}
        <div className="px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-white">
          {/* Left Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(['Semua', 'Transaksi', 'Pemutihan', 'Perubahan'] as const).map((chip) => {
              const active = selectedFilter === chip;
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setSelectedFilter(chip)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#008d91] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {chip === 'Semua' && `Semua (${summaryRows.length})`}
                  {chip === 'Transaksi' && `Transaksi Lunas & Mutasi (${summaryRows.filter((r) => r.kategori === 'Transaksi D-DONASI').length})`}
                  {chip === 'Pemutihan' && `Pemutihan (${summaryRows.filter((r) => r.kategori === 'Pemutihan Donasi').length})`}
                  {chip === 'Perubahan' && `Perubahan & Status (${summaryRows.filter((r) => r.kategori !== 'Transaksi D-DONASI' && r.kategori !== 'Pemutihan Donasi').length})`}
                </button>
              );
            })}
          </div>

          {/* Right Search & Sort Button */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari transaksi / kode..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#008d91] focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors cursor-pointer shrink-0"
              title={`Urutkan: ${sortOrder === 'desc' ? 'Terbaru ke Terlama' : 'Terlama ke Terbaru'}`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>{sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
            </button>
          </div>
        </div>

        {/* Table Content Section */}
        <div className="flex-1 overflow-y-auto min-h-[300px] p-6">
          {displayRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Tidak ada data riwayat yang cocok</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Tidak ditemukan catatan transaksi atau perubahan dengan kata kunci pencarian tersebut.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs bg-white">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-xs">
                    <th className="py-3 px-4 whitespace-nowrap">Tanggal</th>
                    <th className="py-3 px-4 whitespace-nowrap">Jenis / Kategori</th>
                    <th className="py-3 px-4 whitespace-nowrap">Kode Transaksi / Ref</th>
                    <th className="py-3 px-4 whitespace-nowrap">Bulan / Periode</th>
                    <th className="py-3 px-4 whitespace-nowrap text-right">Nominal</th>
                    <th className="py-3 px-4 whitespace-nowrap text-center">Status</th>
                    <th className="py-3 px-4">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Tanggal */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{row.tanggal}</span>
                        </div>
                      </td>

                      {/* Jenis / Kategori */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            row.kategori === 'Transaksi D-DONASI'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : row.kategori === 'Pemutihan Donasi'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : row.kategori === 'Tanggal Bergabung'
                              ? 'bg-teal-50 text-[#008d91] border border-teal-200'
                              : row.kategori === 'Ganti Nominal'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {row.kategori === 'Transaksi D-DONASI' && <Receipt className="w-3 h-3" />}
                          {row.kategori === 'Pemutihan Donasi' && <ShieldCheck className="w-3 h-3" />}
                          {row.kategori === 'Tanggal Bergabung' && <UserCheck className="w-3 h-3" />}
                          {row.kategori === 'Ganti Nominal' && <DollarSign className="w-3 h-3" />}
                          {row.kategori === 'Berhenti Donasi' && <Ban className="w-3 h-3" />}
                          <span>{row.kategori}</span>
                        </span>
                      </td>

                      {/* Kode Transaksi */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg text-xs">
                          {row.kodeTransaksi}
                        </span>
                      </td>

                      {/* Bulan / Periode */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                        {row.bulanPeriode}
                      </td>

                      {/* Nominal */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right font-bold text-slate-800">
                        {formatRupiah(row.nominal)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-0.5 rounded-full text-xs font-semibold border ${row.statusColor}`}
                        >
                          {row.status}
                        </span>
                      </td>

                      {/* Keterangan */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 min-w-[200px]">
                        {row.keterangan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Section */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="text-xs text-slate-500">
            Total {displayRows.length} entri riwayat dicatat
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (onShowToast) {
                  onShowToast(`Summary pembayaran untuk ${patron.namaDonatur} siap diunduh`);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Unduh Summary</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-[#008d91] hover:bg-[#00797d] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
