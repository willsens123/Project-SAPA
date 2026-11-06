export interface KumpulanRekeningItem {
  id: string;
  idIdentitas: string; // e.g. "10001" or "00031"
  namaIdentitas?: string;
  tipeIdentitas?: 'identitas' | 'organisasi';
  subtitleIdentitas?: string; // e.g. "Ko Agus", "Yayasan", "0812..."
  avatarInitial?: string;
  avatarBg?: string;
  bank: string; // e.g. "BCA", "Mandiri", "BNI", "BRI"
  nomorRekening: string;
  atasNama: string;
  keterangan: string;
  createdAt?: string;
}

export const STORAGE_KEY_KUMPULAN_REKENING = 'yppln_kumpulan_rekening_list_v1';

export const INITIAL_KUMPULAN_REKENING_LIST: KumpulanRekeningItem[] = [
  {
    id: 'rek-1',
    idIdentitas: '10001',
    namaIdentitas: 'Agustino',
    tipeIdentitas: 'identitas',
    subtitleIdentitas: 'Ko Agus',
    avatarInitial: 'A',
    avatarBg: 'bg-[#10b981]',
    bank: 'BCA',
    nomorRekening: '8880123456',
    atasNama: 'Agustino',
    keterangan: 'Rekening Operasional & Pengeluaran Kantor',
    createdAt: '2021-11-01T08:00:00Z',
  },
  {
    id: 'rek-2',
    idIdentitas: '10002',
    namaIdentitas: 'Yayasan Penerbit Pelita Nusantara',
    tipeIdentitas: 'organisasi',
    subtitleIdentitas: 'Yayasan',
    avatarInitial: 'Y',
    avatarBg: 'bg-[#008d91]',
    bank: 'BCA',
    nomorRekening: '0088899911',
    atasNama: 'Yayasan Penerbit Pelita Nusantara',
    keterangan: 'Rekening Utama Yayasan',
    createdAt: '2021-11-01T08:00:00Z',
  },
  {
    id: 'rek-3',
    idIdentitas: '10003',
    namaIdentitas: 'Dewi Lestari',
    tipeIdentitas: 'identitas',
    subtitleIdentitas: 'Dewi',
    avatarInitial: 'D',
    avatarBg: 'bg-[#e05244]',
    bank: 'Mandiri',
    nomorRekening: '1310098765432',
    atasNama: 'Dewi Lestari',
    keterangan: 'Kasbon Operasional Kegiatan Dharma',
    createdAt: '2021-11-02T09:00:00Z',
  },
  {
    id: 'rek-4',
    idIdentitas: '10004',
    namaIdentitas: 'Budi Santoso',
    tipeIdentitas: 'identitas',
    subtitleIdentitas: 'Pak Budi',
    avatarInitial: 'B',
    avatarBg: 'bg-[#0d9488]',
    bank: 'BNI',
    nomorRekening: '0234567891',
    atasNama: 'Budi Santoso',
    keterangan: 'Pengeluaran Logistik & Penerbitan',
    createdAt: '2021-11-05T10:00:00Z',
  },
  {
    id: 'rek-5',
    idIdentitas: '10005',
    namaIdentitas: 'Siti Rahmawati',
    tipeIdentitas: 'identitas',
    subtitleIdentitas: 'Ibu Siti',
    avatarInitial: 'S',
    avatarBg: 'bg-[#64748b]',
    bank: 'BRI',
    nomorRekening: '011201002345501',
    atasNama: 'Siti Rahmawati',
    keterangan: 'Reimburse Transport & Konsumsi Acara',
    createdAt: '2021-11-10T11:00:00Z',
  },
];

export function getKumpulanRekeningFromStorage(): KumpulanRekeningItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_KUMPULAN_REKENING);
    if (!raw) return INITIAL_KUMPULAN_REKENING_LIST;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((it) => {
        const found = INITIAL_KUMPULAN_REKENING_LIST.find(
          (init) => init.id === it.id || init.idIdentitas === it.idIdentitas
        );
        return {
          ...found,
          ...it,
          namaIdentitas: it.namaIdentitas || found?.namaIdentitas || it.atasNama,
          subtitleIdentitas: it.subtitleIdentitas || found?.subtitleIdentitas,
          avatarInitial: it.avatarInitial || found?.avatarInitial || (it.namaIdentitas || it.atasNama || 'A').charAt(0).toUpperCase(),
          avatarBg: it.avatarBg || found?.avatarBg || 'bg-[#10b981]',
        };
      });
    }
  } catch (e) {
    console.error('Failed to load kumpulan rekening from storage:', e);
  }
  return INITIAL_KUMPULAN_REKENING_LIST;
}

export function saveKumpulanRekeningToStorage(items: KumpulanRekeningItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_KUMPULAN_REKENING, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save kumpulan rekening to storage:', e);
  }
}
