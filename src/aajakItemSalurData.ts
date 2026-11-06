export interface AAjakHelperRow {
  id: string;
  identitasId: string;
  jobAdvance: string;
  tanggalMulai?: string;
  tanggalSelesai?: string; // empty string, undefined, or '-' means still active (belum selesai)
  cvUrl?: string; // Link URL untuk CV personil A-AJAK
}

export interface AAjakItemSalurRecord {
  itemId: string;
  itemTitle: string;
  tanggalMulaiBekerja: string;
  helpers: AAjakHelperRow[];
  updatedAt?: string;
}

const STORAGE_KEY = 'sapa_aajak_item_salur_records_v2';

export const isHelperActive = (helper: AAjakHelperRow): boolean => {
  if (!helper.tanggalSelesai) return true;
  const trimmed = helper.tanggalSelesai.trim();
  return trimmed === '' || trimmed === '-';
};

export const INITIAL_AAJAK_ITEM_SALUR_RECORDS: Record<string, AAjakItemSalurRecord> = {
  'book-2': {
    itemId: 'book-2',
    itemTitle: 'Demi Kepentingan Semua Makhluk',
    tanggalMulaiBekerja: '18 Jan 2021',
    helpers: [
      {
        id: 'helper-1',
        identitasId: 'id-1', // 00031 Agustino Ong (Ko Agus)
        jobAdvance: 'Layout',
        tanggalMulai: '18 Jan 2021',
        tanggalSelesai: '18 Jan 2021',
        cvUrl: 'https://drive.google.com/file/d/1agustino-ong-cv/view',
      },
      {
        id: 'helper-2',
        identitasId: 'id-3', // 00019 Cindy Budiman (Ci Pao)
        jobAdvance: 'Design Cover',
        tanggalMulai: '18 Jan 2021',
        tanggalSelesai: '20 Jan 2021',
        cvUrl: 'https://drive.google.com/file/d/1cindy-budiman-cv/view',
      },
      {
        id: 'helper-3',
        identitasId: 'id-5', // 00018 Silvia Fukada (Ci Silvia)
        jobAdvance: 'Penulis Artikel',
        tanggalMulai: '18 Jan 2021',
        tanggalSelesai: '18 Jan 2021',
        cvUrl: 'https://drive.google.com/file/d/1silvia-fukada-cv/view',
      },
      {
        id: 'helper-4',
        identitasId: 'id-4', // 00800 Bhadra Ksanti (Sucek Shi Xian Jen)
        jobAdvance: 'Penulis Artikel',
        tanggalMulai: '18 Jan 2021',
        tanggalSelesai: '', // Aktif (belum selesai/belum ada tanggal selesai)
        cvUrl: '',
      },
    ],
    updatedAt: new Date().toISOString(),
  },
  'book-1': {
    itemId: 'book-1',
    itemTitle: 'Menjadi Buddha',
    tanggalMulaiBekerja: '10 Mei 2021',
    helpers: [
      {
        id: 'helper-b1-1',
        identitasId: 'id-1', // Agustino Ong (00031)
        jobAdvance: 'Cover Design',
        tanggalMulai: '10 Mei 2021',
        tanggalSelesai: '25 Mei 2021',
      },
      {
        id: 'helper-b1-2',
        identitasId: 'id-5', // Silvia Fukada
        jobAdvance: 'Penyunting Junior',
        tanggalMulai: '10 Mei 2021',
        tanggalSelesai: '', // Aktif
      },
    ],
    updatedAt: new Date().toISOString(),
  },
};

export const loadAAjakItemSalurRecord = (
  itemId: string,
  itemTitle: string = ''
): AAjakItemSalurRecord => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: Record<string, AAjakItemSalurRecord> = JSON.parse(raw);
      if (parsed[itemId]) {
        return parsed[itemId];
      }
    }
  } catch (err) {
    console.error('Error reading aajak item salur records:', err);
  }

  if (INITIAL_AAJAK_ITEM_SALUR_RECORDS[itemId]) {
    return INITIAL_AAJAK_ITEM_SALUR_RECORDS[itemId];
  }

  // Fallback empty record
  return {
    itemId,
    itemTitle,
    tanggalMulaiBekerja: '',
    helpers: [
      {
        id: `helper-${Date.now()}-1`,
        identitasId: '',
        jobAdvance: '',
      },
    ],
  };
};

export const saveAAjakItemSalurRecord = (record: AAjakItemSalurRecord) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let map: Record<string, AAjakItemSalurRecord> = {};
    if (raw) {
      map = JSON.parse(raw);
    } else {
      map = { ...INITIAL_AAJAK_ITEM_SALUR_RECORDS };
    }
    map[record.itemId] = {
      ...record,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (err) {
    console.error('Error saving aajak item salur record:', err);
  }
};
