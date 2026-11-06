export interface HariKhususItem {
  id: string;
  tanggal: string; // Format 'YYYY-MM-DD', contoh '2021-11-10'
  nama: string; // Contoh: 'Hari Pahlawan'
  kategori: 'Hari Besar Nasional' | 'Hari Peringatan' | 'Hari Keagamaan' | 'Cuti Bersama' | string;
  isLibur: boolean; // True jika tanggal merah / libur (Semua Hari Besar Nasional dibuat merah & libur)
  keterangan?: string;
  createdAt?: string;
}

export const HARI_KHUSUS_MASTER_STORAGE_KEY = 'sapa_calendar_hari_khusus_master_v1';
export const LEGACY_HARI_KHUSUS_STORAGE_KEY = 'sapa_calendar_hari_khusus_v1';

// Initial data hari khusus terkoneksi dengan Calendar To-Do List
export const INITIAL_HARI_KHUSUS_LIST: HariKhususItem[] = [
  // November 2021 (Default tampilan Calendar To-Do List)
  {
    id: 'hk-2021-11-10',
    tanggal: '2021-11-10',
    nama: 'Hari Pahlawan',
    kategori: 'Hari Besar Nasional',
    isLibur: true,
    keterangan: 'Peringatan Hari Pahlawan Nasional Republik Indonesia',
    createdAt: '01 Nov 2021',
  },
  {
    id: 'hk-2021-11-12',
    tanggal: '2021-11-12',
    nama: 'Hari Ayah Nasional',
    kategori: 'Hari Peringatan',
    isLibur: false,
    keterangan: 'Peringatan Hari Ayah Nasional',
    createdAt: '01 Nov 2021',
  },
  {
    id: 'hk-2021-11-25',
    tanggal: '2021-11-25',
    nama: 'Hari Guru Nasional',
    kategori: 'Hari Besar Nasional',
    isLibur: true,
    keterangan: 'Hari Guru Nasional & HUT PGRI',
    createdAt: '01 Nov 2021',
  },
  {
    id: 'hk-2021-11-28',
    tanggal: '2021-11-28',
    nama: 'Hari Menanam Pohon',
    kategori: 'Hari Peringatan',
    isLibur: false,
    keterangan: 'Hari Menanam Pohon Indonesia (HMPI)',
    createdAt: '01 Nov 2021',
  },

  // Hari Besar Nasional Indonesia Lainnya di 2021
  {
    id: 'hk-2021-01-01',
    tanggal: '2021-01-01',
    nama: 'Tahun Baru 2021 Masehi',
    kategori: 'Hari Besar Nasional',
    isLibur: true,
    keterangan: 'Libur Nasional Tahun Baru Masehi',
    createdAt: '01 Jan 2021',
  },
  {
    id: 'hk-2021-02-12',
    tanggal: '2021-02-12',
    nama: 'Tahun Baru Imlek 2572',
    kategori: 'Hari Besar Nasional',
    isLibur: true,
    keterangan: 'Tahun Baru Imlek 2572 Kongzili',
    createdAt: '01 Jan 2021',
  },
  {
    id: 'hk-2021-03-11',
    tanggal: '2021-03-11',
    nama: 'Isra Miraj Nabi Muhammad SAW',
    kategori: 'Hari Besar Nasional',
    isLibur: true,
    keterangan: 'Libur Nasional Keagamaan',
    createdAt: '01 Jan 2021',
  },
  {
    id: 'hk-2021-03-14',
    tanggal: '2021-03-14',
    nama: 'Hari Suci Nyepi Tahun Baru Saka 1943',
    kategori: 'Hari Besar Nasional',
    isLibur: true,
    keterangan: 'Hari Suci Nyepi',
    createdAt: '01 Jan 2021',
  },
  {
    id: 'hk-2021-04-02',
    tanggal: '2021-04-02',
    nama: 'Wafat Isa Almasih',
    kategori: 'Hari Besar Nasional',
    isLibur: true,
    keterangan: 'Jumat Agung',
    createdAt: '01 Jan 2021',
  },
  {
    id: 'hk-2021-05-01',
    tanggal: '2021-05-01',
    nama: 'Hari Buruh Internasional',
    kategori: 'Hari Besar Nasional',
    isLibur: true,
    keterangan: 'May Day',
    createdAt: '01 Jan 2021',
  },
  {
    id: 'hk-2021-05-13',
    tanggal: '2021-05-13',
    nama: 'Hari Raya Idul Fitri 1442 H',
    kategori: 'Hari Besar Nasional',
    isLibur: true,
    keterangan: 'Libur Nasional Idul Fitri Hari Pertama',
    createdAt: '01 Jan 2021',
  },
  {
    id: 'hk-2021-05-14',
    tanggal: '2021-05-14',
    nama: 'Hari Raya Idul Fitri 1442 H',
    kategori: 'Hari Besar Nasional',
    isLibur: true,
    keterangan: 'Libur Nasional Idul Fitri Hari Kedua',
    createdAt: '01 Jan 2021',
  },
  {
    id: 'hk-2021-05-26',
    tanggal: '2021-05-26',
    nama: 'Hari Raya Waisak 2565',
    kategori: 'Hari Besar Nasional',
    isLibur: true,
    keterangan: 'Peringatan Trisuci Waisak',
    createdAt: '01 Jan 2021',
  },
  {
    id: 'hk-2021-06-01',
    tanggal: '2021-06-01',
    nama: 'Hari Lahir Pancasila',
    kategori: 'Hari Besar Nasional',
    isLibur: true,
    keterangan: 'Peringatan Hari Lahir Pancasila',
    createdAt: '01 Jan 2021',
  },
  {
    id: 'hk-2021-07-20',
    tanggal: '2021-07-20',
    nama: 'Hari Raya Idul Adha 1442 H',
    kategori: 'Hari Besar Nasional',
    isLibur: true,
    keterangan: 'Hari Raya Kurban',
    createdAt: '01 Jan 2021',
  },
  {
    id: 'hk-2021-08-10',
    tanggal: '2021-08-10',
    nama: 'Tahun Baru Islam 1443 H',
    kategori: 'Hari Besar Nasional',
    isLibur: true,
    keterangan: '1 Muharram 1443 Hijriah',
    createdAt: '01 Jan 2021',
  },
  {
    id: 'hk-2021-08-17',
    tanggal: '2021-08-17',
    nama: 'Hari Kemerdekaan RI Ke-76',
    kategori: 'Hari Besar Nasional',
    isLibur: true,
    keterangan: 'HUT Proklamasi Kemerdekaan Republik Indonesia',
    createdAt: '01 Jan 2021',
  },
  {
    id: 'hk-2021-10-19',
    tanggal: '2021-10-19',
    nama: 'Maulid Nabi Muhammad SAW',
    kategori: 'Hari Besar Nasional',
    isLibur: true,
    keterangan: 'Peringatan Maulid Nabi',
    createdAt: '01 Jan 2021',
  },
  {
    id: 'hk-2021-12-25',
    tanggal: '2021-12-25',
    nama: 'Hari Raya Natal',
    kategori: 'Hari Besar Nasional',
    isLibur: true,
    keterangan: 'Kelahiran Yesus Kristus',
    createdAt: '01 Jan 2021',
  },
];

export const KATEGORI_HARI_KHUSUS_OPTIONS = [
  'Hari Besar Nasional',
  'Hari Peringatan',
  'Hari Keagamaan',
  'Cuti Bersama',
  'Lainnya',
] as const;

/**
 * Load Hari Khusus list from localStorage
 */
export function loadHariKhususList(): HariKhususItem[] {
  try {
    const saved = localStorage.getItem(HARI_KHUSUS_MASTER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Check if legacy storage exists and merge
    const legacy = localStorage.getItem(LEGACY_HARI_KHUSUS_STORAGE_KEY);
    if (legacy) {
      const legacyMap = JSON.parse(legacy);
      const merged = [...INITIAL_HARI_KHUSUS_LIST];
      Object.entries(legacyMap).forEach(([dateStr, text]) => {
        const textStr = String(text);
        const exists = merged.some((item) => item.tanggal === dateStr);
        if (!exists && textStr.trim()) {
          const isBesar =
            textStr.toLowerCase().includes('pahlawan') ||
            textStr.toLowerCase().includes('nasional') ||
            textStr.toLowerCase().includes('hari raya') ||
            textStr.toLowerCase().includes('kemerdekaan');
          merged.push({
            id: `hk-${dateStr}`,
            tanggal: dateStr,
            nama: textStr,
            kategori: isBesar ? 'Hari Besar Nasional' : 'Hari Peringatan',
            isLibur: isBesar,
            createdAt: '15 Nov 2021',
          });
        }
      });
      saveHariKhususList(merged);
      return merged;
    }
  } catch (e) {
    console.error('Error loading hari khusus list:', e);
  }

  // Fallback to initial
  return INITIAL_HARI_KHUSUS_LIST;
}

/**
 * Save Hari Khusus list to localStorage and sync legacy map
 */
export function saveHariKhususList(items: HariKhususItem[]): void {
  try {
    localStorage.setItem(HARI_KHUSUS_MASTER_STORAGE_KEY, JSON.stringify(items));

    // Sync legacy map for compatibility with older code
    const legacyMap: Record<string, string> = {};
    items.forEach((item) => {
      legacyMap[item.tanggal] = item.nama;
    });
    localStorage.setItem(LEGACY_HARI_KHUSUS_STORAGE_KEY, JSON.stringify(legacyMap));

    // Dispatch custom event for cross-component reactive updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('hari_khusus_updated', { detail: items }));
    }
  } catch (e) {
    console.error('Error saving hari khusus list:', e);
  }
}

/**
 * Format tanggal Indonesia, e.g. "10 Nov 2021"
 */
export function formatIndonesianDateStr(dateStr?: string | null): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const monthNames = [
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

  return `${day} ${monthNames[monthIdx] || parts[1]} ${year}`;
}

/**
 * Mendapatkan nama hari dari YYYY-MM-DD
 */
export function getNamaHariIndonesia(dateStr?: string | null): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  const date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return dayNames[date.getDay()] || '';
}

/**
 * Helper to check if a date is considered a Hari Besar Nasional (or Libur Nasional)
 */
export function isHariBesarNasional(
  dateStr: string,
  items: HariKhususItem[]
): { isBesar: boolean; item?: HariKhususItem } {
  const match = items.find((it) => it.tanggal === dateStr);
  if (!match) return { isBesar: false };
  const isBesar =
    match.kategori === 'Hari Besar Nasional' ||
    match.isLibur === true ||
    match.nama.toLowerCase().includes('hari besar') ||
    match.nama.toLowerCase().includes('libur nasional');
  return { isBesar, item: match };
}
