export interface KebutuhanPengeluaranItem {
  id: string;
  kebutuhan: string; // e.g. "Gaji"
  posPengeluaran: string; // e.g. "Pengeluaran YPPLN"
  posPengeluaranId?: string;
  kelompokBiaya: string; // e.g. "Biaya Operasional"
  rangeCoa?: string; // e.g. "60100-60199"
  noAkunCoa?: string; // e.g. "60100"
  namaAkunCoa?: string; // e.g. "Gaji"
  keterangan?: string;
}

export const initialKebutuhanPengeluaranList: KebutuhanPengeluaranItem[] = [
  {
    id: 'keb-1',
    kebutuhan: 'Gaji',
    posPengeluaran: 'Pengeluaran YPPLN',
    posPengeluaranId: 'pengeluaran-1',
    kelompokBiaya: 'Biaya Operasional',
    rangeCoa: '60100-60199',
    noAkunCoa: '60100',
    namaAkunCoa: 'Gaji',
    keterangan: 'Gaji dan honorarium tim & relawan',
  },
  {
    id: 'keb-2',
    kebutuhan: 'Operasional Kantor',
    posPengeluaran: 'Pengeluaran YPPLN',
    posPengeluaranId: 'pengeluaran-1',
    kelompokBiaya: 'Biaya Operasional',
    rangeCoa: '60100-60199',
    noAkunCoa: '60101',
    namaAkunCoa: 'Operasional Kantor',
    keterangan: 'Biaya rutin bulanan kantor',
  },
  {
    id: 'keb-3',
    kebutuhan: 'Air PDAM & Internet',
    posPengeluaran: 'Pengeluaran YPPLN',
    posPengeluaranId: 'pengeluaran-1',
    kelompokBiaya: 'Biaya Utilitas & Kantor',
    rangeCoa: '60200-60299',
    noAkunCoa: '60200',
    namaAkunCoa: 'Air PDAM & Internet',
    keterangan: 'Langganan internet kantor dan PDAM',
  },
  {
    id: 'keb-4',
    kebutuhan: 'Biaya Boost Iklan',
    posPengeluaran: 'Pengeluaran YPPLN',
    posPengeluaranId: 'pengeluaran-1',
    kelompokBiaya: 'Biaya Promosi & Publikasi',
    rangeCoa: '60500-60599',
    noAkunCoa: '60500',
    namaAkunCoa: 'Biaya Boost Iklan',
    keterangan: 'Iklan promosi media sosial & giveaway',
  },
  {
    id: 'keb-5',
    kebutuhan: 'Perlengkapan Pengiriman Buku Berbayar',
    posPengeluaran: 'Pengeluaran Khusus Penerbitan',
    posPengeluaranId: 'pengeluaran-3',
    kelompokBiaya: 'Biaya Perlengkapan & ATK',
    rangeCoa: '60700-60799',
    noAkunCoa: '60700',
    namaAkunCoa: 'Perlengkapan Pengiriman Buku Berbayar',
    keterangan: 'Lakban, kardus packing pengiriman buku',
  },
  {
    id: 'keb-6',
    kebutuhan: 'Cetak Buku Dharma',
    posPengeluaran: 'Pengeluaran Khusus Penerbitan',
    posPengeluaranId: 'pengeluaran-3',
    kelompokBiaya: 'Biaya Cetak & Penerbitan Buku',
    rangeCoa: '50100-50199',
    noAkunCoa: '50100',
    namaAkunCoa: 'Cetak Buku Dharma',
    keterangan: 'Biaya percetakan judul buku Dharma',
  },
  {
    id: 'keb-7',
    kebutuhan: 'Biaya Event & Retret',
    posPengeluaran: 'Pengeluaran YPPLN',
    posPengeluaranId: 'pengeluaran-1',
    kelompokBiaya: 'Biaya Event & Edukasi',
    rangeCoa: '50300-50399',
    noAkunCoa: '50300',
    namaAkunCoa: 'Biaya Event & Retret',
    keterangan: 'Konsumsi, sewa tempat, perlengkapan acara',
  },
  {
    id: 'keb-8',
    kebutuhan: 'Ekspedisi & Distribusi',
    posPengeluaran: 'Pengeluaran Khusus Penerbitan',
    posPengeluaranId: 'pengeluaran-3',
    kelompokBiaya: 'Biaya Ekspedisi & Logistik',
    rangeCoa: '60600-60699',
    noAkunCoa: '60600',
    namaAkunCoa: 'Ekspedisi & Distribusi',
    keterangan: 'Ongkos kirim ekspedisi kurir',
  },
];

const STORAGE_KEY = 'yppln_kebutuhan_pengeluaran_items_v2';

export function getKebutuhanPengeluaranFromStorage(): KebutuhanPengeluaranItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('yppln_kebutuhan_pengeluaran_items_v1');
    if (!data) return initialKebutuhanPengeluaranList;
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) return initialKebutuhanPengeluaranList;

    // Merge missing initial items and ensure noAkunCoa is populated
    const initialMap = new Map(initialKebutuhanPengeluaranList.map((i) => [i.id, i]));
    return parsed.map((item: any) => {
      const init = initialMap.get(item.id) || initialKebutuhanPengeluaranList.find(
        (i) => i.kebutuhan.toLowerCase().trim() === (item.kebutuhan || '').toLowerCase().trim()
      );
      return {
        ...item,
        noAkunCoa: item.noAkunCoa || init?.noAkunCoa,
        namaAkunCoa: item.namaAkunCoa || item.kebutuhan || init?.namaAkunCoa,
      };
    });
  } catch (err) {
    console.error('Failed to load kebutuhan pengeluaran from storage:', err);
    return initialKebutuhanPengeluaranList;
  }
}

export function saveKebutuhanPengeluaranToStorage(items: KebutuhanPengeluaranItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save kebutuhan pengeluaran to storage:', err);
  }
}
