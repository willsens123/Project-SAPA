import React from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  User,
  Heart,
  Edit2,
  ArrowRight,
} from 'lucide-react';
import { DharmaPatronRutinItem } from '../types';

interface PeriodeKeaktifanModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DharmaPatronRutinItem | null;
  onEditDonasi?: (item: DharmaPatronRutinItem) => void;
}

// Helper to determine active status
export const isDharmaPatronAktif = (item: DharmaPatronRutinItem): boolean => {
  if (item.statusAktif === 'Tidak Aktif') return false;
  if (item.statusAktif === 'Aktif') return true;
  if (item.jenisPerubahanDonasi && item.jenisPerubahanDonasi.trim().toLowerCase() === 'berhenti') {
    return false;
  }
  return true;
};

// Helper to get patron starting join year
export function getItemStartYear(item: DharmaPatronRutinItem): number {
  if (item.tanggalBergabung) {
    const match = item.tanggalBergabung.match(/\b(19\d\d|20\d\d)\b/);
    if (match) return parseInt(match[1], 10);
  }
  if (item.createdAt) {
    const match = item.createdAt.match(/\b(19\d\d|20\d\d)\b/);
    if (match) return parseInt(match[1], 10);
  }
  return 2019;
}

// Helper to get patron stop year if inactive
export function getItemEndYear(item: DharmaPatronRutinItem): number | null {
  if (isDharmaPatronAktif(item)) {
    return null;
  }
  if (item.tanggalBerhenti) {
    const match = item.tanggalBerhenti.match(/\b(19\d\d|20\d\d)\b/);
    if (match) return parseInt(match[1], 10);
  }
  if (item.bulanMulaiPerubahanDonasi) {
    const match = item.bulanMulaiPerubahanDonasi.match(/\b(19\d\d|20\d\d)\b/);
    if (match) return parseInt(match[1], 10);
  }
  return new Date().getFullYear();
}

// Helper to check if patron is active in a given year in real time
export const isPatronAktifInYear = (item: DharmaPatronRutinItem, year: string | number): boolean => {
  const targetYear = typeof year === 'string' ? parseInt(year, 10) : year;
  if (isNaN(targetYear)) return false;

  const startYear = getItemStartYear(item);
  if (targetYear < startYear) {
    return false;
  }

  const isAktif = isDharmaPatronAktif(item);
  if (isAktif) {
    return true;
  }

  const endYear = getItemEndYear(item);
  if (endYear !== null) {
    if (targetYear < endYear) {
      return true;
    }
    return false;
  }

  return false;
};

// Month name lookup
const MONTH_MAP: Record<string, number> = {
  jan: 0, januari: 0, january: 0,
  feb: 1, februari: 1, february: 1,
  mar: 2, maret: 2, march: 2,
  apr: 3, april: 3,
  mei: 4, may: 4,
  jun: 5, juni: 5, june: 5,
  jul: 6, juli: 6, july: 6,
  agu: 7, agustus: 7, aug: 7, august: 7,
  sep: 8, september: 8,
  okt: 9, oktober: 9, oct: 9, october: 9,
  nov: 10, november: 10,
  des: 11, desember: 11, dec: 11, december: 11,
};

// Parse date string into Date object
function parseDateFlexible(dateStr?: string): Date | null {
  if (!dateStr || !dateStr.trim()) return null;
  const str = dateStr.trim();

  // Pattern: "12 Jan 2019" or "Jan 2021"
  const parts = str.split(/\s+/);
  if (parts.length >= 2) {
    let day = 1;
    let mStr = '';
    let year = 2021;

    if (parts.length === 3) {
      day = parseInt(parts[0], 10) || 1;
      mStr = parts[1].toLowerCase();
      year = parseInt(parts[2], 10) || 2021;
    } else if (parts.length === 2) {
      mStr = parts[0].toLowerCase();
      year = parseInt(parts[1], 10) || 2021;
    }

    if (MONTH_MAP[mStr] !== undefined) {
      return new Date(year, MONTH_MAP[mStr], day);
    }
  }

  // Pattern: YYYY-MM-DD
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
  }

  return null;
}

// Calculate duration string (e.g. "2 Tahun 5 Bulan")
function calculateDurationText(startDateStr?: string, endDateStr?: string, isAktif = true): string {
  const startDate = parseDateFlexible(startDateStr) || new Date(2019, 0, 1);
  const endDate = isAktif ? new Date() : (parseDateFlexible(endDateStr) || new Date());

  let totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
  if (totalMonths < 0) totalMonths = 0;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (years === 0 && months === 0) {
    return 'Kurang dari 1 bulan';
  }

  const parts = [];
  if (years > 0) parts.push(`${years} Tahun`);
  if (months > 0) parts.push(`${months} Bulan`);
  return `${parts.join(' ')} (${totalMonths} Bulan)`;
}

export const PeriodeKeaktifanModal: React.FC<PeriodeKeaktifanModalProps> = ({
  isOpen,
  onClose,
  item,
  onEditDonasi,
}) => {
  if (!isOpen || !item) return null;

  const aktif = isDharmaPatronAktif(item);
  const tglMulai = item.tanggalBergabung || item.bulanMulaiDonasi || '12 Jan 2019';
  const tglSelesai = aktif
    ? 'Sekarang (Masih Aktif Berdonasi)'
    : item.tanggalBerhenti || item.bulanMulaiPerubahanDonasi || 'Oktober 2026';

  const durasiText = calculateDurationText(tglMulai, tglSelesai, aktif);

  const formatRupiah = (val: number) => {
    return 'Rp ' + (val || 0).toLocaleString('id-ID');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-2xs ${
                aktif ? 'bg-[#008d91]' : 'bg-rose-600'
              }`}
            >
              {aktif ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Periode Keaktifan Dharma Patron Rutin
              </h3>
              <p className="text-xs text-slate-500">
                Detail masa aktif donatur rutin dan riwayat status
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Donatur Profile Info */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-xs"
              style={{ backgroundColor: item.avatarBg || '#00a896' }}
            >
              {item.avatarLetter || item.namaDonatur.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate">
                  {item.namaDonatur}
                </h4>
                {item.panggilan && (
                  <span className="text-xs text-slate-500 font-medium">
                    ({item.panggilan})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>No Donatur: <strong className="text-slate-700">{item.noDonatur}</strong></span>
                {item.identitasId && (
                  <span>ID: <strong className="text-slate-700">{item.identitasId}</strong></span>
                )}
                <span>Donasi: <strong className="text-[#008d91] font-bold">{formatRupiah(item.donasiPerbulan)}/bln</strong></span>
              </div>
            </div>
          </div>

          {/* Status Keaktifan Badge Box */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              aktif
                ? 'bg-teal-50/70 border-teal-200/80 text-teal-900'
                : 'bg-rose-50/70 border-rose-200/80 text-rose-900'
            }`}
          >
            <div>
              <p className="text-xs font-semibold opacity-75 uppercase tracking-wider">
                Status Saat Ini
              </p>
              <p className="text-lg font-extrabold mt-0.5 flex items-center gap-1.5">
                {aktif ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-[#008d91]" />
                    <span>Aktif Berdonasi Rutin</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>Tidak Aktif (Berhenti)</span>
                  </>
                )}
              </p>
            </div>

            <span
              className={`px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-2xs ${
                aktif ? 'bg-[#008d91]' : 'bg-rose-600'
              }`}
            >
              {aktif ? 'Aktif' : 'Tidak Aktif'}
            </span>
          </div>

          {/* Timeline: Aktif dari kapan sampai kapan */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#008d91]" />
              <span>Rincian Masa Keaktifan</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Mulai Aktif */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Aktif Mulai Dari:
                </span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">
                  {tglMulai}
                </span>
                <span className="text-[10.5px] text-slate-400 mt-0.5 block">
                  Tanggal bergabung / mulai donasi
                </span>
              </div>

              {/* Sampai Kapan */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Sampai Dengan:
                </span>
                <span
                  className={`text-sm font-bold mt-1 block ${
                    aktif ? 'text-[#008d91]' : 'text-rose-600'
                  }`}
                >
                  {tglSelesai}
                </span>
                <span className="text-[10.5px] text-slate-400 mt-0.5 block">
                  {aktif ? 'Masih rutin berjalan saat ini' : 'Bulan mulai berhenti donasi'}
                </span>
              </div>
            </div>

            {/* Total Durasi */}
            <div className="p-3 bg-[#008d91]/5 border border-[#008d91]/20 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#008d91]" />
                <span className="text-xs font-medium text-slate-700">Total Durasi Aktif:</span>
              </div>
              <span className="text-xs font-bold text-[#008d91] bg-white px-2.5 py-1 rounded-lg border border-[#008d91]/20 shadow-2xs">
                {durasiText}
              </span>
            </div>
          </div>

          {/* Keterangan & Riwayat Perubahan Donasi */}
          <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Jenis Perubahan Donasi:</span>
              <span className="font-semibold text-slate-800">
                {item.jenisPerubahanDonasi || (aktif ? 'Aktif Normal' : 'Berhenti')}
              </span>
            </div>
            {item.bulanMulaiPerubahanDonasi && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Bulan Perubahan:</span>
                <span className="font-medium text-slate-800">{item.bulanMulaiPerubahanDonasi}</span>
              </div>
            )}
            {item.keterangan && item.keterangan !== '-' && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Keterangan:</span>
                <span className="font-medium text-slate-800 truncate max-w-xs">{item.keterangan}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
          >
            Tutup
          </button>

          {onEditDonasi && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditDonasi(item);
              }}
              className="px-5 py-2 text-xs sm:text-sm font-semibold bg-[#008d91] text-white hover:bg-[#007b7f] rounded-full shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Donasi/Rutin</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
