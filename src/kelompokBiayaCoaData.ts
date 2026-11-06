export interface KelompokBiayaCoaItem {
  id: string;
  rangeCoa: string;
  kelompokBiaya: string;
  keterangan?: string;
}

export const initialKelompokBiayaCoaList: KelompokBiayaCoaItem[] = [
  {
    id: 'kbc-1',
    rangeCoa: '60100-60199',
    kelompokBiaya: 'Biaya Operasional',
    keterangan: 'Gaji, honor SDM, operasional kantor',
  },
  {
    id: 'kbc-2',
    rangeCoa: '60200-60299',
    kelompokBiaya: 'Biaya Utilitas & Kantor',
    keterangan: 'Internet, PDAM, listrik, fasilitas',
  },
  {
    id: 'kbc-3',
    rangeCoa: '60300-60399',
    kelompokBiaya: 'Biaya Transport & Akomodasi',
    keterangan: 'Transport antar paket, operasional dinas',
  },
  {
    id: 'kbc-4',
    rangeCoa: '60500-60599',
    kelompokBiaya: 'Biaya Promosi & Publikasi',
    keterangan: 'Cetak brosur, iklan digital, boost postingan',
  },
  {
    id: 'kbc-5',
    rangeCoa: '60600-60699',
    kelompokBiaya: 'Biaya Ekspedisi & Logistik',
    keterangan: 'Biaya pengiriman paket ekspedisi',
  },
  {
    id: 'kbc-6',
    rangeCoa: '60700-60799',
    kelompokBiaya: 'Biaya Perlengkapan & ATK',
    keterangan: 'Lakban, kardus, alat tulis kantor',
  },
  {
    id: 'kbc-7',
    rangeCoa: '50100-50199',
    kelompokBiaya: 'Biaya Cetak & Penerbitan Buku',
    keterangan: 'Biaya percetakan & layout buku Dharma',
  },
  {
    id: 'kbc-8',
    rangeCoa: '50200-50299',
    kelompokBiaya: 'Biaya Transkrip & Teks Dharma',
    keterangan: 'Transkrip ceramah, penyusunan naskah',
  },
  {
    id: 'kbc-9',
    rangeCoa: '50300-50399',
    kelompokBiaya: 'Biaya Event & Edukasi',
    keterangan: 'Retret, workshop, kegiatan ajar',
  },
  {
    id: 'kbc-10',
    rangeCoa: '69900-69999',
    kelompokBiaya: 'Biaya Lain-Lain & Bank',
    keterangan: 'Charge bank, merchant fee, biaya lainnya',
  },
];

const STORAGE_KEY = 'yppln_kelompok_biaya_coa_items_v1';

export function getKelompokBiayaCoaFromStorage(): KelompokBiayaCoaItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return initialKelompokBiayaCoaList;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialKelompokBiayaCoaList;
  } catch (err) {
    console.error('Failed to load kelompok biaya COA from storage:', err);
    return initialKelompokBiayaCoaList;
  }
}

export function saveKelompokBiayaCoaToStorage(items: KelompokBiayaCoaItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save kelompok biaya COA to storage:', err);
  }
}
