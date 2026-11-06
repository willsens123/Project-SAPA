export interface ResiItem {
  id: string;
  tanggal: string; // e.g. "10 Nov 2021"
  nama: string; // e.g. "Suparman"
  ekspedisi: string; // e.g. "LION"
  resi: string; // e.g. "11LP1636545251274"
  tujuan: string; // Address in uppercase as in design
  berat: number; // e.g. 5.6
  tarif: number; // e.g. 181500
  kode?: string; // Kode Transaksi S-SALUR e.g. "2021 Store 4451003216"
  dropPoint?: string; // e.g. "LION Jurang"
}

export const INITIAL_RESI_LIST: ResiItem[] = [
  {
    id: 'resi-1',
    tanggal: '10 Nov 2021',
    nama: 'Suparman',
    ekspedisi: 'LION',
    resi: '11LP1636545251274',
    tujuan: 'DUSUN OTAK LENDAK DESA AKAR AKAR KEC BAYAN LOMBOK UTARA',
    berat: 5.6,
    tarif: 181500,
    kode: '2021 Store 4451003216',
    dropPoint: 'LION Jurang',
  },
  {
    id: 'resi-2',
    tanggal: '10 Nov 2021',
    nama: 'Agus Jaya Putra',
    ekspedisi: 'LION',
    resi: '11LP1636545419847',
    tujuan: 'MORES DUSUN GERENGGENG DESA SAMAGUNA KEC TANJUNG LOMBOK UTARA',
    berat: 5.63,
    tarif: 198000,
    kode: '2021 CC 4451003223',
    dropPoint: 'LION Jurang',
  },
  {
    id: 'resi-3',
    tanggal: '10 Nov 2021',
    nama: 'Ardi',
    ekspedisi: 'LION',
    resi: '11LP1636545527888',
    tujuan: 'JL LINGKAR TEGAL MAJA DUSUN MEDIAN DESA TEGAL MAJA KEC TANJUNG LOMBOK UTARA',
    berat: 5.6,
    tarif: 198000,
    kode: '2021 Store 4451003217',
    dropPoint: 'LION Jurang',
  },
  {
    id: 'resi-4',
    tanggal: '10 Nov 2021',
    nama: 'Ayadi',
    ekspedisi: 'LION',
    resi: '11LP1636545612169',
    tujuan: 'DUSUN SUMUR DUYUNG DESA TEGAL MAJA KEC TANJUNG LOMBOK UTARA',
    berat: 5.6,
    tarif: 198000,
    kode: '2021 CC 4451003214',
    dropPoint: 'LION Jurang',
  },
  {
    id: 'resi-5',
    tanggal: '10 Nov 2021',
    nama: 'Kardianto',
    ekspedisi: 'LION',
    resi: '11LP1636545734878',
    tujuan: 'BERIRI DUSUN GERENGGENG DESA SAMAGUNA KEC TANJUNG LOMBOK UTARA',
    berat: 5.25,
    tarif: 180000,
    kode: '2021 CC 4451003221',
    dropPoint: 'LION Jurang',
  },
  {
    id: 'resi-6',
    tanggal: '10 Nov 2021',
    nama: 'Rudianto',
    ekspedisi: 'LION',
    resi: '11LP1636545819010',
    tujuan: 'PANASAN DAYA DESA TEGAL MAJA KEC TANJUNG LOMBOK UTARA',
    berat: 5.6,
    tarif: 198000,
    kode: '2021 CC 4451003220',
    dropPoint: 'LION Jurang',
  },
  {
    id: 'resi-7',
    tanggal: '10 Nov 2021',
    nama: 'Denny Andinata',
    ekspedisi: 'LION',
    resi: '11LP1636546178614',
    tujuan: 'JL MANGGIS , KEC DEPOK , KAB SLEMAN JOGYA 55281',
    berat: 1,
    tarif: 10000,
    kode: '2021 CC 4451003235',
    dropPoint: 'LION Jurang',
  },
  {
    id: 'resi-8',
    tanggal: '10 Nov 2021',
    nama: 'Jessica Chandra',
    ekspedisi: 'LION',
    resi: '11LP1636546305271',
    tujuan: 'JL ABADI NO 1 , KEL TALANG BAKUNG , KEC JAMBI SELATAN , MASUK GANG GAPURA BIRU SEBELAH AKBID BUNDA TALANG BAKUNG , KOTA JAMBI , 36135',
    berat: 1,
    tarif: 10000,
    kode: '', // Unlinked - shows "+ Add Transaksi" button
    dropPoint: 'LION Jurang',
  },
  {
    id: 'resi-9',
    tanggal: '10 Nov 2021',
    nama: 'Lawrence Anzela',
    ekspedisi: 'LION',
    resi: '11LP1636546331760',
    tujuan: 'PERUMAHAN VILLA CITRA 2 BLOK G1 NO 1B JAGABAYA III KEC WAY HALIM LAMPUNG',
    berat: 1,
    tarif: 10000,
    kode: '2021 CC 4451003240',
    dropPoint: 'LION Jurang',
  },
];

const RESI_STORAGE_KEY = 'sapa_resi_items_v1';

export function loadResiItems(): ResiItem[] {
  try {
    const saved = localStorage.getItem(RESI_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse resi items from localStorage', e);
  }
  return INITIAL_RESI_LIST;
}

export function saveResiItems(items: ResiItem[]): void {
  try {
    localStorage.setItem(RESI_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save resi items to localStorage', e);
  }
}

export function formatRupiahTarif(amount: number): string {
  return `Rp${amount.toLocaleString('id-ID')}`;
}
