export interface PosPemasukanSubJenisMapping {
  id: string;
  sourceModule: 'S-SALUR' | 'A-AJAR' | 'D-DONASI' | 'OTHER';
  subJenisId: string;
  namaSubJenis: string;
  subTitleSubJenis?: string;
  iconLetterSubJenis: string;
  iconBgSubJenis: string;

  posPemasukanId?: string;
  namaPosPemasukan: string;
  subTitlePosPemasukan?: string;
  iconLetterPosPemasukan: string;
  iconBgPosPemasukan: string;

  keterangan?: string;
}

export const initialPosPemasukanSubJenisList: PosPemasukanSubJenisMapping[] = [
  {
    id: 'psj-1',
    sourceModule: 'S-SALUR',
    subJenisId: 'sjis-1',
    namaSubJenis: 'Buku Berbayar',
    subTitleSubJenis: 'Sub-Jenis Item',
    iconLetterSubJenis: 'B',
    iconBgSubJenis: '#008d91',
    namaPosPemasukan: 'Pemasukan YPPLN',
    subTitlePosPemasukan: 'Pos Pemasukan',
    iconLetterPosPemasukan: 'P',
    iconBgPosPemasukan: '#2D3748',
    keterangan: '-',
  },
  {
    id: 'psj-2',
    sourceModule: 'S-SALUR',
    subJenisId: 'sjis-2',
    namaSubJenis: 'Buku Tidak Berbayar',
    subTitleSubJenis: 'Sub-Jenis Item',
    iconLetterSubJenis: 'B',
    iconBgSubJenis: '#008d91',
    namaPosPemasukan: 'Pemasukan YPPLN',
    subTitlePosPemasukan: 'Pos Pemasukan',
    iconLetterPosPemasukan: 'P',
    iconBgPosPemasukan: '#2D3748',
    keterangan: '-',
  },
  {
    id: 'psj-3',
    sourceModule: 'S-SALUR',
    subJenisId: 'sjis-3',
    namaSubJenis: 'Buku Non-YPPLN',
    subTitleSubJenis: 'Sub-Jenis Item',
    iconLetterSubJenis: 'B',
    iconBgSubJenis: '#008d91',
    namaPosPemasukan: 'Pemasukan Khusus Operasional',
    subTitlePosPemasukan: 'Pos Pemasukan',
    iconLetterPosPemasukan: 'P',
    iconBgPosPemasukan: '#2D3748',
    keterangan: '-',
  },
  {
    id: 'psj-4',
    sourceModule: 'S-SALUR',
    subJenisId: 'sjis-5',
    namaSubJenis: 'T-Shirt',
    subTitleSubJenis: 'Sub-Jenis Item',
    iconLetterSubJenis: 'T',
    iconBgSubJenis: '#ec4899',
    namaPosPemasukan: 'Pemasukan Khusus Operasional',
    subTitlePosPemasukan: 'Pos Pemasukan',
    iconLetterPosPemasukan: 'P',
    iconBgPosPemasukan: '#2D3748',
    keterangan: '-',
  },
  {
    id: 'psj-5',
    sourceModule: 'S-SALUR',
    subJenisId: 'sjis-6',
    namaSubJenis: 'Note Book',
    subTitleSubJenis: 'Sub-Jenis Item',
    iconLetterSubJenis: 'N',
    iconBgSubJenis: '#7c3aed',
    namaPosPemasukan: 'Pemasukan Khusus Operasional',
    subTitlePosPemasukan: 'Pos Pemasukan',
    iconLetterPosPemasukan: 'P',
    iconBgPosPemasukan: '#2D3748',
    keterangan: '-',
  },
  {
    id: 'psj-6',
    sourceModule: 'S-SALUR',
    subJenisId: 'sjis-7',
    namaSubJenis: 'Lain-lain Non-YPPLN',
    subTitleSubJenis: 'Sub-Jenis Item',
    iconLetterSubJenis: 'L',
    iconBgSubJenis: '#c0392b',
    namaPosPemasukan: 'Pemasukan Khusus Operasional',
    subTitlePosPemasukan: 'Pos Pemasukan',
    iconLetterPosPemasukan: 'P',
    iconBgPosPemasukan: '#2D3748',
    keterangan: '-',
  },
  {
    id: 'psj-7',
    sourceModule: 'D-DONASI',
    subJenisId: 'sjd-1',
    namaSubJenis: 'Dharma Patron Rutin',
    subTitleSubJenis: 'Sub-Jenis Item',
    iconLetterSubJenis: 'D',
    iconBgSubJenis: '#f59e0b',
    namaPosPemasukan: 'Pemasukan YPPLN',
    subTitlePosPemasukan: 'Pos Pemasukan',
    iconLetterPosPemasukan: 'P',
    iconBgPosPemasukan: '#2D3748',
    keterangan: 'COA 49997 Pendapatan Dana Dharma Patron',
  },
  {
    id: 'psj-8',
    sourceModule: 'D-DONASI',
    subJenisId: 'sjd-2',
    namaSubJenis: 'Dharma Patron Non-Rutin',
    subTitleSubJenis: 'Sub-Jenis Item',
    iconLetterSubJenis: 'D',
    iconBgSubJenis: '#f59e0b',
    namaPosPemasukan: 'Pemasukan YPPLN',
    subTitlePosPemasukan: 'Pos Pemasukan',
    iconLetterPosPemasukan: 'P',
    iconBgPosPemasukan: '#2D3748',
    keterangan: '-',
  },
  {
    id: 'psj-9',
    sourceModule: 'D-DONASI',
    subJenisId: 'sjd-3',
    namaSubJenis: 'Donasi Buku Berbayar',
    subTitleSubJenis: 'Sub-Jenis Item',
    iconLetterSubJenis: 'D',
    iconBgSubJenis: '#f59e0b',
    namaPosPemasukan: 'Donasi Buku Berbayar',
    subTitlePosPemasukan: 'Sub-Jenis Item',
    iconLetterPosPemasukan: 'D',
    iconBgPosPemasukan: '#f59e0b',
    keterangan: '-',
  },
  {
    id: 'psj-10',
    sourceModule: 'D-DONASI',
    subJenisId: 'sjd-4',
    namaSubJenis: 'Donasi Operasional',
    subTitleSubJenis: 'Sub-Jenis Item',
    iconLetterSubJenis: 'D',
    iconBgSubJenis: '#f59e0b',
    namaPosPemasukan: 'Pemasukan Khusus Operasional',
    subTitlePosPemasukan: 'Pos Pemasukan',
    iconLetterPosPemasukan: 'P',
    iconBgPosPemasukan: '#2D3748',
    keterangan: '-',
  },
  {
    id: 'psj-11',
    sourceModule: 'D-DONASI',
    subJenisId: 'sjd-5',
    namaSubJenis: 'Donasi Penerbitan Buku',
    subTitleSubJenis: 'Sub-Jenis Item',
    iconLetterSubJenis: 'D',
    iconBgSubJenis: '#f59e0b',
    namaPosPemasukan: 'Pemasukan Khusus Penerbitan',
    subTitlePosPemasukan: 'Pos Pemasukan',
    iconLetterPosPemasukan: 'P',
    iconBgPosPemasukan: '#2D3748',
    keterangan: '-',
  },
  {
    id: 'psj-12',
    sourceModule: 'A-AJAR',
    subJenisId: 'sja-2',
    namaSubJenis: 'ILR',
    subTitleSubJenis: 'Sub-Jenis Item',
    iconLetterSubJenis: 'I',
    iconBgSubJenis: '#0ea5e9',
    namaPosPemasukan: 'Pemasukan YPPLN',
    subTitlePosPemasukan: 'Pos Pemasukan',
    iconLetterPosPemasukan: 'P',
    iconBgPosPemasukan: '#2D3748',
    keterangan: '-',
  },
  {
    id: 'psj-13',
    sourceModule: 'A-AJAR',
    subJenisId: 'sja-4',
    namaSubJenis: 'Lam-Talk',
    subTitleSubJenis: 'Sub-Jenis Item',
    iconLetterSubJenis: 'L',
    iconBgSubJenis: '#dc2626',
    namaPosPemasukan: 'Lam-Talk',
    subTitlePosPemasukan: 'Sub-Jenis Item',
    iconLetterPosPemasukan: 'L',
    iconBgPosPemasukan: '#dc2626',
    keterangan: '-',
  },
  {
    id: 'psj-salur-ongkir',
    sourceModule: 'S-SALUR',
    subJenisId: 'sjis-ongkir',
    namaSubJenis: 'Ongkos Kirim',
    subTitleSubJenis: 'Sub-Jenis Item',
    iconLetterSubJenis: 'O',
    iconBgSubJenis: '#008d91',
    namaPosPemasukan: 'Pemasukan Khusus Penerbitan',
    subTitlePosPemasukan: 'Pos Pemasukan',
    iconLetterPosPemasukan: 'P',
    iconBgPosPemasukan: '#2D3748',
    keterangan: 'COA 60600 Biaya Pengiriman',
  },
  {
    id: 'psj-salur-donasi',
    sourceModule: 'S-SALUR',
    subJenisId: 'sjis-donasi',
    namaSubJenis: 'Donasi & Kode Unik',
    subTitleSubJenis: 'Sub-Jenis Item',
    iconLetterSubJenis: 'D',
    iconBgSubJenis: '#f59e0b',
    namaPosPemasukan: 'Pemasukan YPPLN',
    subTitlePosPemasukan: 'Pos Pemasukan',
    iconLetterPosPemasukan: 'P',
    iconBgPosPemasukan: '#2D3748',
    keterangan: 'COA 49998 Pendapatan Donasi (Donasi Non-Rutin)',
  },
];

const STORAGE_KEY = 'yppln_pos_pemasukan_sub_jenis';

export function getPosPemasukanSubJenisFromStorage(): PosPemasukanSubJenisMapping[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return initialPosPemasukanSubJenisList;
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure required mappings like Ongkos Kirim & Donasi are present
      const existingIds = new Set(parsed.map((p: PosPemasukanSubJenisMapping) => p.id));
      let hasAdded = false;
      initialPosPemasukanSubJenisList.forEach((req) => {
        if (!existingIds.has(req.id)) {
          parsed.push(req);
          hasAdded = true;
        }
      });
      // Migrate psj-7 to COA 49997 if not yet set
      const psj7 = parsed.find((p: PosPemasukanSubJenisMapping) => p.id === 'psj-7');
      if (psj7 && (psj7.keterangan === '-' || !psj7.keterangan)) {
        psj7.keterangan = 'COA 49997 Pendapatan Dana Dharma Patron';
        hasAdded = true;
      }
      if (hasAdded) {
        savePosPemasukanSubJenisToStorage(parsed);
      }
      return parsed;
    }
    return initialPosPemasukanSubJenisList;
  } catch (err) {
    console.error('Failed to load pos pemasukan per sub jenis from storage:', err);
    return initialPosPemasukanSubJenisList;
  }
}

export function savePosPemasukanSubJenisToStorage(items: PosPemasukanSubJenisMapping[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save pos pemasukan per sub jenis to storage:', err);
  }
}
