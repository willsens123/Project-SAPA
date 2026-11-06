export type JenisCuti =
  | 'Ijin Cuti Full'
  | 'Ijin Cuti Setengah Hari'
  | 'Ijin Sakit'
  | 'Ijin Duka'
  | 'Ijin Menikah'
  | 'Ijin Melahirkan'
  | 'Ijin Spiritual';

export type CutiStatus = 'Disetujui' | 'Menunggu Acc' | 'Ditolak';

export interface CutiKaryawanItem {
  id: string;
  nomorPengajuan: string; // e.g. "CT-001"
  karyawanId: string; // Connected to KaryawanItem.id e.g. "karyawan-1"
  kodeKaryawan: string; // Connected to KaryawanItem.kodeKaryawan e.g. "00031"
  namaKaryawan: string; // e.g. "Agustino Ong"
  namaPanggilan?: string; // e.g. "Ko Agus"
  divisi: string; // e.g. "UMM"
  avatarInitial?: string;
  avatarBg?: string;
  jenisCuti: JenisCuti;
  tanggalMulai: string; // ISO "YYYY-MM-DD" e.g. "2021-11-15"
  tanggalSelesai: string; // ISO "YYYY-MM-DD" e.g. "2021-11-17"
  durasiHari: number; // e.g. 3, or 0.5 for Setengah Hari
  keterangan: string; // Alasan cuti
  status: CutiStatus;
  tanggalPengajuan: string; // ISO "YYYY-MM-DD"
  disetujuiOleh?: string;
}

export const JENIS_CUTI_OPTIONS: {
  value: JenisCuti;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
}[] = [
  {
    value: 'Ijin Cuti Full',
    label: 'Ijin Cuti Full',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  {
    value: 'Ijin Cuti Setengah Hari',
    label: 'Ijin Cuti Setengah Hari',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-[#008d91]',
    badgeBorder: 'border-teal-200',
    dotColor: 'bg-[#008d91]',
  },
  {
    value: 'Ijin Sakit',
    label: 'Ijin Sakit',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    dotColor: 'bg-amber-500',
  },
  {
    value: 'Ijin Duka',
    label: 'Ijin Duka',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-300',
    dotColor: 'bg-slate-500',
  },
  {
    value: 'Ijin Menikah',
    label: 'Ijin Menikah',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
    dotColor: 'bg-rose-500',
  },
  {
    value: 'Ijin Melahirkan',
    label: 'Ijin Melahirkan',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    dotColor: 'bg-purple-500',
  },
  {
    value: 'Ijin Spiritual',
    label: 'Ijin Spiritual',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    dotColor: 'bg-indigo-500',
  },
];

export const CUTI_STATUS_OPTIONS: {
  value: CutiStatus;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}[] = [
  {
    value: 'Disetujui',
    label: 'Disetujui',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
  {
    value: 'Menunggu Acc',
    label: 'Menunggu Acc',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
  },
  {
    value: 'Ditolak',
    label: 'Ditolak',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
  },
];

export const INITIAL_CUTI_KARYAWAN: CutiKaryawanItem[] = [
  // Agustino Ong (00031) - Matches screenshot exactly
  {
    id: 'cuti-agus-duka-1',
    nomorPengajuan: 'CT-001',
    karyawanId: 'karyawan-1',
    kodeKaryawan: '00031',
    namaKaryawan: 'Agustino Ong',
    namaPanggilan: 'Ko Agus',
    divisi: 'UMM',
    avatarInitial: 'A',
    avatarBg: 'bg-[#14b8a6]',
    jenisCuti: 'Ijin Duka',
    tanggalMulai: '2021-11-01',
    tanggalSelesai: '2021-11-01',
    durasiHari: 1,
    keterangan: 'Ijin Duka keluarga',
    status: 'Disetujui',
    tanggalPengajuan: '2021-10-31',
    disetujuiOleh: 'Manager Operasional',
  },
  {
    id: 'cuti-agus-duka-2',
    nomorPengajuan: 'CT-002',
    karyawanId: 'karyawan-1',
    kodeKaryawan: '00031',
    namaKaryawan: 'Agustino Ong',
    namaPanggilan: 'Ko Agus',
    divisi: 'UMM',
    avatarInitial: 'A',
    avatarBg: 'bg-[#14b8a6]',
    jenisCuti: 'Ijin Duka',
    tanggalMulai: '2021-08-10',
    tanggalSelesai: '2021-08-10',
    durasiHari: 1,
    keterangan: 'Ijin Duka kerabat',
    status: 'Disetujui',
    tanggalPengajuan: '2021-08-09',
    disetujuiOleh: 'Manager Operasional',
  },
  {
    id: 'cuti-agus-full-1',
    nomorPengajuan: 'CT-003',
    karyawanId: 'karyawan-1',
    kodeKaryawan: '00031',
    namaKaryawan: 'Agustino Ong',
    namaPanggilan: 'Ko Agus',
    divisi: 'UMM',
    avatarInitial: 'A',
    avatarBg: 'bg-[#14b8a6]',
    jenisCuti: 'Ijin Cuti Full',
    tanggalMulai: '2021-11-02',
    tanggalSelesai: '2021-11-02',
    durasiHari: 1,
    keterangan: 'Cuti Urusan Pribadi',
    status: 'Disetujui',
    tanggalPengajuan: '2021-10-30',
    disetujuiOleh: 'Manager Operasional',
  },
  {
    id: 'cuti-agus-full-2',
    nomorPengajuan: 'CT-004',
    karyawanId: 'karyawan-1',
    kodeKaryawan: '00031',
    namaKaryawan: 'Agustino Ong',
    namaPanggilan: 'Ko Agus',
    divisi: 'UMM',
    avatarInitial: 'A',
    avatarBg: 'bg-[#14b8a6]',
    jenisCuti: 'Ijin Cuti Full',
    tanggalMulai: '2021-11-15',
    tanggalSelesai: '2021-11-19',
    durasiHari: 5,
    keterangan: 'Liburan bersama keluarga (5 hari kerja)',
    status: 'Disetujui',
    tanggalPengajuan: '2021-11-05',
    disetujuiOleh: 'Manager Operasional',
  },
  {
    id: 'cuti-agus-sakit-1',
    nomorPengajuan: 'CT-005',
    karyawanId: 'karyawan-1',
    kodeKaryawan: '00031',
    namaKaryawan: 'Agustino Ong',
    namaPanggilan: 'Ko Agus',
    divisi: 'UMM',
    avatarInitial: 'A',
    avatarBg: 'bg-[#14b8a6]',
    jenisCuti: 'Ijin Sakit',
    tanggalMulai: '2021-06-14',
    tanggalSelesai: '2021-06-14',
    durasiHari: 1,
    keterangan: 'Demam dan konsultasi dokter',
    status: 'Disetujui',
    tanggalPengajuan: '2021-06-14',
  },
  {
    id: 'cuti-agus-nikah-1',
    nomorPengajuan: 'CT-006',
    karyawanId: 'karyawan-1',
    kodeKaryawan: '00031',
    namaKaryawan: 'Agustino Ong',
    namaPanggilan: 'Ko Agus',
    divisi: 'UMM',
    avatarInitial: 'A',
    avatarBg: 'bg-[#14b8a6]',
    jenisCuti: 'Ijin Menikah',
    tanggalMulai: '2021-07-21',
    tanggalSelesai: '2021-07-23',
    durasiHari: 3,
    keterangan: 'Acara pernikahan keluarga kandung',
    status: 'Disetujui',
    tanggalPengajuan: '2021-07-10',
  },
  {
    id: 'cuti-agus-lahir-1',
    nomorPengajuan: 'CT-007',
    karyawanId: 'karyawan-1',
    kodeKaryawan: '00031',
    namaKaryawan: 'Agustino Ong',
    namaPanggilan: 'Ko Agus',
    divisi: 'UMM',
    avatarInitial: 'A',
    avatarBg: 'bg-[#14b8a6]',
    jenisCuti: 'Ijin Melahirkan',
    tanggalMulai: '2021-05-10',
    tanggalSelesai: '2021-05-10',
    durasiHari: 1,
    keterangan: 'Mendampingi persalinan',
    status: 'Disetujui',
    tanggalPengajuan: '2021-05-09',
  },
  {
    id: 'cuti-agus-spirit-1',
    nomorPengajuan: 'CT-008',
    karyawanId: 'karyawan-1',
    kodeKaryawan: '00031',
    namaKaryawan: 'Agustino Ong',
    namaPanggilan: 'Ko Agus',
    divisi: 'UMM',
    avatarInitial: 'A',
    avatarBg: 'bg-[#14b8a6]',
    jenisCuti: 'Ijin Spiritual',
    tanggalMulai: '2021-04-12',
    tanggalSelesai: '2021-04-23',
    durasiHari: 10,
    keterangan: 'Kegiatan retret spiritual & meditasi tahunan (10 hari kerja)',
    status: 'Disetujui',
    tanggalPengajuan: '2021-04-01',
  },
  {
    id: 'cuti-2',
    nomorPengajuan: 'CT-009',
    karyawanId: 'karyawan-2',
    kodeKaryawan: '00019',
    namaKaryawan: 'Cindy Budiman',
    namaPanggilan: 'Ci Pao',
    divisi: 'FUN',
    avatarInitial: 'C',
    avatarBg: 'bg-[#eab308]',
    jenisCuti: 'Ijin Sakit',
    tanggalMulai: '2021-11-08',
    tanggalSelesai: '2021-11-09',
    durasiHari: 2,
    keterangan: 'Demam & flu, istirahat atas petunjuk dokter klinik',
    status: 'Disetujui',
    tanggalPengajuan: '2021-11-08',
    disetujuiOleh: 'Ko Agus (UMM)',
  },
  {
    id: 'cuti-3',
    nomorPengajuan: 'CT-010',
    karyawanId: 'karyawan-3',
    kodeKaryawan: '00018',
    namaKaryawan: 'Silvia Fukada',
    namaPanggilan: 'Ci Silvia',
    divisi: 'PNB',
    avatarInitial: 'S',
    avatarBg: 'bg-[#64748b]',
    jenisCuti: 'Ijin Spiritual',
    tanggalMulai: '2021-11-20',
    tanggalSelesai: '2021-11-21',
    durasiHari: 2,
    keterangan: 'Mengikuti retret meditasi dan kebaktian khusus di vihara',
    status: 'Menunggu Acc',
    tanggalPengajuan: '2021-11-12',
  },
  {
    id: 'cuti-4',
    nomorPengajuan: 'CT-011',
    karyawanId: 'karyawan-5',
    kodeKaryawan: '00016',
    namaKaryawan: 'Bhadra',
    namaPanggilan: 'Bhadra',
    divisi: 'PRO',
    avatarInitial: 'B',
    avatarBg: 'bg-[#ea580c]',
    jenisCuti: 'Ijin Cuti Setengah Hari',
    tanggalMulai: '2021-11-25',
    tanggalSelesai: '2021-11-25',
    durasiHari: 0.5,
    keterangan: 'Urusan perpanjangan dokumen kependudukan & SIM di samsat (siang)',
    status: 'Disetujui',
    tanggalPengajuan: '2021-11-23',
    disetujuiOleh: 'Ko Agus (UMM)',
  },
  {
    id: 'cuti-5',
    nomorPengajuan: 'CT-012',
    karyawanId: 'karyawan-6',
    kodeKaryawan: '00017',
    namaKaryawan: 'Denny',
    namaPanggilan: 'Denny',
    divisi: 'MED',
    avatarInitial: 'D',
    avatarBg: 'bg-[#f99500]',
    jenisCuti: 'Ijin Menikah',
    tanggalMulai: '2021-12-01',
    tanggalSelesai: '2021-12-04',
    durasiHari: 4,
    keterangan: 'Upacara pernikahan keluarga kandung di luar kota',
    status: 'Menunggu Acc',
    tanggalPengajuan: '2021-11-18',
  },
];

const CUTI_STORAGE_KEY = 'sapa_cuti_karyawan_data_v1';

export function loadCutiKaryawanList(): CutiKaryawanItem[] {
  try {
    const raw = localStorage.getItem(CUTI_STORAGE_KEY);
    if (!raw) {
      saveCutiKaryawanList(INITIAL_CUTI_KARYAWAN);
      return INITIAL_CUTI_KARYAWAN;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_CUTI_KARYAWAN;
  } catch (e) {
    console.error('Failed to load cuti karyawan list from storage', e);
    return INITIAL_CUTI_KARYAWAN;
  }
}

export function saveCutiKaryawanList(items: CutiKaryawanItem[]): void {
  try {
    localStorage.setItem(CUTI_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save cuti karyawan list to storage', e);
  }
}

/**
 * Calculates duration in days between two YYYY-MM-DD dates inclusive.
 * If jenis is 'Ijin Cuti Setengah Hari', returns 0.5.
 */
export function calculateCutiDuration(
  jenisCuti: JenisCuti | string,
  tanggalMulai: string,
  tanggalSelesai: string
): number {
  if (jenisCuti === 'Ijin Cuti Setengah Hari') {
    return 0.5;
  }
  if (!tanggalMulai || !tanggalSelesai) {
    return 1;
  }
  try {
    const start = new Date(tanggalMulai);
    const end = new Date(tanggalSelesai);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  } catch {
    return 1;
  }
}

const BULAN_INDONESIA = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export function formatIndoDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    // If format is YYYY-MM-DD
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(day) && monthIdx >= 0 && monthIdx < 12) {
        return `${day} ${BULAN_INDONESIA[monthIdx]} ${year}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()} ${BULAN_INDONESIA[d.getMonth()]} ${d.getFullYear()}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}
