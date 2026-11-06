import { PengeluaranItem } from './types';
import { getPresetReceipt } from './utils/receiptGenerator';

export const INITIAL_PENGELUARAN_LIST: PengeluaranItem[] = [
  {
    id: 'pengeluaran-185',
    tanggal: '1 Nov 2021',
    divisi: 'UMM',
    posKeluar: 'Pengeluaran YPPLN',
    kebutuhan: 'Operasional Kantor',
    keterangan: 'Air PDAM',
    nominal: 48800,
    jenis: 'ALL',
    no: '185',
    noBadgeColor: 'teal', // Buletan tosca: sudah upload bukti bon & sudah link mutasi
    dikeluarkan: 'Agustino',
    buktiBonUrl: getPresetReceipt('185', 'Air PDAM', 48800, '1 Nov 2021', 'Agustino'),
    buktiBonFileName: 'struk-pdam-tirta-raharja-185.png',
    mutasiId: 'mutasi-bca888-2',
    mutasiKode: 'BCA 888 - 1/Nov',
    mutasiKeterangan: 'TRSF E-BANKING CR 10/31 95031 ATTHA SHINTA OKTAVIANI',
    mutasiDate: '1/Nov',
    mutasiAmount: 62300,
  },
  {
    id: 'pengeluaran-186',
    tanggal: '30 Okt 2021',
    divisi: 'UMM',
    posKeluar: 'Pengeluaran YPPLN',
    kebutuhan: 'Operasional Kantor',
    keterangan: 'Biaya Internet Megavision',
    nominal: 253400,
    jenis: 'ALL',
    no: '186',
    noBadgeColor: 'teal', // Buletan tosca: sudah upload bukti bon & sudah link mutasi
    dikeluarkan: 'Agustino',
    buktiBonUrl: getPresetReceipt('186', 'Biaya Internet Megavision', 253400, '30 Okt 2021', 'Agustino'),
    buktiBonFileName: 'invoice-megavision-okt2021-186.png',
    mutasiId: 'mutasi-bca888-4',
    mutasiKode: 'BCA 888 - 1/Nov',
    mutasiKeterangan: 'TRSF E-BANKING CR 0111/FTSCY/WS95011 178000.00 SILVIA',
    mutasiDate: '1/Nov',
    mutasiAmount: 178000,
  },
  {
    id: 'pengeluaran-187',
    tanggal: '29 Okt 2021',
    divisi: 'CAM',
    posKeluar: 'Pengeluaran Khusus Penerbitan',
    kebutuhan: 'Biaya Boost Iklan',
    keterangan: 'Giveaway promosi kabar dharma',
    nominal: 463000,
    jenis: 'ALL',
    no: '187',
    noBadgeColor: 'teal', // Buletan tosca: sudah upload bukti bon & sudah link mutasi
    dikeluarkan: 'Agustino',
    proyekSapa: 'Promo 11.11',
    buktiBonUrl: getPresetReceipt('187', 'Giveaway promosi kabar dharma', 463000, '29 Okt 2021', 'Agustino'),
    buktiBonFileName: 'fb-ads-receipt-giveaway-187.png',
    mutasiId: 'mutasi-bca888-6',
    mutasiKode: 'BCA 888 - 1/Nov',
    mutasiKeterangan: 'TRSF E-BANKING CR 0111/FTSCY/WS95011 463000.00 PROMOSI',
    mutasiDate: '1/Nov',
    mutasiAmount: 463000,
  },
  {
    id: 'pengeluaran-188',
    tanggal: '21 Okt 2021',
    divisi: 'MAD',
    posKeluar: 'Pengeluaran Khusus Operasional',
    kebutuhan: 'Perlengkapan Pengiriman Buku Berbayar',
    keterangan: 'Lakban Bening 1 inch (2 x 12 buah)',
    nominal: 151700,
    jenis: 'ALL',
    no: '188',
    noBadgeColor: 'red', // Buletan merah: sudah upload bukti bon tapi belum dilink ke mutasi
    dikeluarkan: 'Karunika',
    proyekSapa: 'Stand Vihara Buddhayana',
    buktiBonUrl: getPresetReceipt('188', 'Lakban Bening 1 inch (2 x 12 buah)', 151700, '21 Okt 2021', 'Karunika'),
    buktiBonFileName: 'nota-atk-lakban-bening-188.png',
    // Belum dilink ke mutasi!
  },
  {
    id: 'pengeluaran-189',
    tanggal: '28 Okt 2021',
    divisi: 'MAD',
    posKeluar: 'Pengeluaran Khusus Operasional',
    kebutuhan: 'Perlengkapan Pengiriman Buku Berbayar',
    keterangan: 'Lakban Bening 2 inch (10 buah)',
    nominal: 78400,
    jenis: 'ALL',
    no: '189',
    noBadgeColor: 'plain', // Tanpa buletan: belum di upload gambar bukti bon
    dikeluarkan: 'Karunika',
    proyekSapa: 'Promo Buku 88',
  },
  {
    id: 'pengeluaran-190',
    tanggal: '4 Nov 2021',
    divisi: 'CAM',
    posKeluar: 'Pengeluaran YPPLN',
    kebutuhan: 'Biaya Boost Iklan',
    keterangan: 'Ads Lamstore Nov',
    nominal: 220000,
    jenis: 'ALL',
    no: '190',
    noBadgeColor: 'teal', // Buletan tosca: sudah upload bukti bon & sudah link mutasi
    dikeluarkan: 'Vioni',
    buktiBonUrl: getPresetReceipt('190', 'Ads Lamstore Nov', 220000, '4 Nov 2021', 'Vioni'),
    buktiBonFileName: 'bukti-ads-lamstore-190.png',
    mutasiId: 'mutasi-bca888-5',
    mutasiKode: 'BCA 888 - 1/Nov',
    mutasiKeterangan: 'TRSF E-BANKING CR 11/01 95031 BUKU DKSM LISA FEBRIANTI',
    mutasiDate: '1/Nov',
    mutasiAmount: 120000,
  },
  {
    id: 'pengeluaran-191',
    tanggal: '1 Nov 2021',
    divisi: 'EVE',
    posKeluar: 'Pengeluaran YPPLN',
    kebutuhan: 'Biaya apresiasi pembicara/moderator',
    keterangan: 'Apresiasi Buku Harta Tahta Wanita untuk Pak Agus Hartono',
    nominal: 74300,
    jenis: 'ALL',
    no: '191',
    noBadgeColor: 'teal', // Buletan tosca: sudah upload bukti bon & sudah link mutasi
    dikeluarkan: 'Agustino',
    buktiBonUrl: getPresetReceipt('191', 'Apresiasi Buku Harta Tahta Wanita untuk Pak Agus Hartono', 74300, '1 Nov 2021', 'Agustino'),
    buktiBonFileName: 'tanda-terima-narasumber-191.png',
    mutasiId: 'mutasi-bca888-3',
    mutasiKode: 'BCA 888 - 1/Nov',
    mutasiKeterangan: 'TRSF E-BANKING CR 11/01 95031 191,192,193 AGUSTINO',
    mutasiDate: '1/Nov',
    mutasiAmount: 212900,
  },
  {
    id: 'pengeluaran-192',
    tanggal: '1 Nov 2021',
    divisi: 'EVE',
    posKeluar: 'Pengeluaran YPPLN',
    kebutuhan: 'Biaya apresiasi pembicara/moderator',
    keterangan: 'Apresiasi Buku Harta Tahta Wanita untuk Pak Stanley Khu',
    nominal: 69300,
    jenis: 'ALL',
    no: '192',
    noBadgeColor: 'teal', // Buletan tosca: sudah upload bukti bon & sudah link mutasi
    dikeluarkan: 'Agustino',
    buktiBonUrl: getPresetReceipt('192', 'Apresiasi Buku Harta Tahta Wanita untuk Pak Stanley Khu', 69300, '1 Nov 2021', 'Agustino'),
    buktiBonFileName: 'tanda-terima-narasumber-192.png',
    mutasiId: 'mutasi-bca888-3',
    mutasiKode: 'BCA 888 - 1/Nov',
    mutasiKeterangan: 'TRSF E-BANKING CR 11/01 95031 191,192,193 AGUSTINO',
    mutasiDate: '1/Nov',
    mutasiAmount: 212900,
  },
  {
    id: 'pengeluaran-193',
    tanggal: '1 Nov 2021',
    divisi: 'EVE',
    posKeluar: 'Pengeluaran YPPLN',
    kebutuhan: 'Biaya apresiasi pembicara/moderator',
    keterangan: 'Apresiasi Buku Harta Tahta Wanita untuk Ci Karina',
    nominal: 69300,
    jenis: 'ALL',
    no: '193',
    noBadgeColor: 'teal', // Buletan tosca: sudah upload bukti bon & sudah link mutasi
    dikeluarkan: 'Agustino',
    buktiBonUrl: getPresetReceipt('193', 'Apresiasi Buku Harta Tahta Wanita untuk Ci Karina', 69300, '1 Nov 2021', 'Agustino'),
    buktiBonFileName: 'tanda-terima-narasumber-193.png',
    mutasiId: 'mutasi-bca888-3',
    mutasiKode: 'BCA 888 - 1/Nov',
    mutasiKeterangan: 'TRSF E-BANKING CR 11/01 95031 191,192,193 AGUSTINO',
    mutasiDate: '1/Nov',
    mutasiAmount: 212900,
  },
  {
    id: 'pengeluaran-194',
    tanggal: '1 Nov 2021',
    divisi: 'CAM',
    posKeluar: 'Pengeluaran YPPLN',
    kebutuhan: 'Biaya Boost Iklan',
    keterangan: 'Ads Lamrimnesia Nov',
    nominal: 200000,
    jenis: 'ALL',
    no: '194',
    noBadgeColor: 'plain', // Tanpa buletan: belum di upload gambar bukti bon
    dikeluarkan: 'Melyana',
  },
  {
    id: 'pengeluaran-195',
    tanggal: '24 Nov2021',
    divisi: 'MAD',
    posKeluar: 'Pengeluaran YPPLN',
    kebutuhan: 'Perlengkapan Pengiriman Buku Berbayar',
    keterangan: 'Amplop Coklat Seal 1/2 Folio Neuro (4 x 100 pcs)',
    nominal: 110220,
    jenis: 'ALL',
    no: '195',
    noBadgeColor: 'red', // Buletan merah: sudah upload bukti bon tapi belum dilink ke mutasi
    dikeluarkan: 'Karunika',
    proyekSapa: 'Stand Vihara Buddhayana',
    buktiBonUrl: getPresetReceipt('195', 'Amplop Coklat Seal 1/2 Folio Neuro (4 x 100 pcs)', 110220, '24 Nov 2021', 'Karunika'),
    buktiBonFileName: 'nota-amplop-packing-195.png',
    // Belum dilink ke mutasi!
  },
  {
    id: 'pengeluaran-hist-2020-1',
    tanggal: '10 Des 2020',
    divisi: 'MAD',
    posKeluar: 'Pengeluaran Khusus Operasional',
    kebutuhan: 'Logistik & Ekspedisi Pengiriman',
    keterangan: 'Biaya ekspedisi & packing 2020',
    nominal: 380000,
    jenis: 'ALL',
    no: '170',
    noBadgeColor: 'teal',
    dikeluarkan: 'Karunika',
  },
  {
    id: 'pengeluaran-hist-2019-1',
    tanggal: '15 Nov 2019',
    divisi: 'CAM',
    posKeluar: 'Pengeluaran Khusus Penerbitan',
    kebutuhan: 'Royalti Cetak Buku',
    keterangan: 'Pembayaran royalti penerbitan 2019',
    nominal: 1800000,
    jenis: 'ALL',
    no: '160',
    noBadgeColor: 'teal',
    dikeluarkan: 'Agustino',
  },
  {
    id: 'pengeluaran-hist-2019-2',
    tanggal: '10 Des 2019',
    divisi: 'UMM',
    posKeluar: 'Pengeluaran YPPLN',
    kebutuhan: 'Operasional Kantor',
    keterangan: 'Biaya operasional kantor 2019',
    nominal: 450000,
    jenis: 'ALL',
    no: '161',
    noBadgeColor: 'teal',
    dikeluarkan: 'Agustino',
  },
  {
    id: 'pengeluaran-hist-2018-1',
    tanggal: '15 Nov 2018',
    divisi: 'CAM',
    posKeluar: 'Pengeluaran Khusus Penerbitan',
    kebutuhan: 'Royalti Cetak Buku',
    keterangan: 'Pembayaran royalti penerbitan 2018',
    nominal: 1500000,
    jenis: 'ALL',
    no: '150',
    noBadgeColor: 'teal',
    dikeluarkan: 'Agustino',
  },
  {
    id: 'pengeluaran-hist-2018-2',
    tanggal: '20 Nov 2018',
    divisi: 'EVE',
    posKeluar: 'Pengeluaran YPPLN',
    kebutuhan: 'Konsumsi Fasilitator Retret',
    keterangan: 'Konsumsi fasilitator dan akomodasi ILR 2018',
    nominal: 650000,
    jenis: 'ALL',
    no: '151',
    noBadgeColor: 'teal',
    dikeluarkan: 'Vioni',
  },
  {
    id: 'pengeluaran-hist-2017-1',
    tanggal: '15 Nov 2017',
    divisi: 'CAM',
    posKeluar: 'Pengeluaran Khusus Penerbitan',
    kebutuhan: 'Royalti Cetak Buku',
    keterangan: 'Pembayaran royalti penerbitan 2017',
    nominal: 1200000,
    jenis: 'ALL',
    no: '140',
    noBadgeColor: 'teal',
    dikeluarkan: 'Agustino',
  },
  {
    id: 'pengeluaran-hist-2017-2',
    tanggal: '10 Des 2017',
    divisi: 'UMM',
    posKeluar: 'Pengeluaran YPPLN',
    kebutuhan: 'Operasional Kantor',
    keterangan: 'Biaya internet dan listrik 2017',
    nominal: 350000,
    jenis: 'ALL',
    no: '141',
    noBadgeColor: 'teal',
    dikeluarkan: 'Agustino',
  },
];

const STORAGE_KEY = 'yppln_pengeluaran_list_v2';

export function getPengeluaranFromStorage(): PengeluaranItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((it: any) => it.id));
        const missingInitials = INITIAL_PENGELUARAN_LIST.filter((it) => !existingIds.has(it.id));
        const combined = [...parsed, ...missingInitials];
        const posMapping: Record<string, string> = {
          'Ops Dharma': 'Pengeluaran YPPLN',
          'Kegiatan Dharma': 'Pengeluaran YPPLN',
          'Ops Non-Dharma': 'Pengeluaran Khusus Operasional',
          'Teks Dharma': 'Pengeluaran Khusus Penerbitan',
          'Penerbitan': 'Pengeluaran Khusus Penerbitan',
        };
        const initialMap = new Map(INITIAL_PENGELUARAN_LIST.map((it) => [it.id, it.proyekSapa]));
        return combined.map((item: PengeluaranItem) => {
          let updatedPos = item.posKeluar;
          if (posMapping[item.posKeluar]) {
            updatedPos = posMapping[item.posKeluar];
          }
          return {
            ...item,
            posKeluar: updatedPos,
            proyekSapa: !item.proyekSapa && initialMap.has(item.id) ? initialMap.get(item.id) : item.proyekSapa,
          };
        });
      }
    }
  } catch (err) {
    console.error('Failed to load pengeluaran from storage:', err);
  }
  return INITIAL_PENGELUARAN_LIST;
}

export function savePengeluaranToStorage(list: PengeluaranItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save pengeluaran to storage:', err);
  }
}
