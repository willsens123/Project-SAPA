import { DharmaPatronRutinItem } from './types';

export interface YearPatronStat {
  year: string;
  count: number;
  iconType: 'cart' | 'globe';
}

export const DHARMA_PATRON_YEAR_STATS: YearPatronStat[] = [
  { year: '2021', count: 600, iconType: 'cart' },
  { year: '2020', count: 300, iconType: 'globe' },
  { year: '2019', count: 300, iconType: 'globe' },
  { year: '2018', count: 300, iconType: 'globe' },
  { year: '2017', count: 250, iconType: 'globe' },
];

export const INITIAL_DHARMA_PATRON_LIST: DharmaPatronRutinItem[] = [
  {
    id: 'dpr-1',
    noDonatur: '00031',
    identitasId: '00031',
    namaDonatur: 'Agustino Ong',
    panggilan: 'Ko Agus',
    avatarLetter: 'A',
    avatarBg: '#00a896',
    sumber: 'Brosur DP 1',
    groupJarkom: 'All DPR 1',
    namaRekening: 'Agustino',
    donasiPerbulan: 100000,
    tanggalBergabung: '12 Jan 2019',
    namaPendek: 'Agustino',
    keterangan: '-',
    afiliasiKci: 'MAH',
    piutang: -100000,
    bulanPiutang: 'Oktober',
    reminder: 'All',
    pelimpahanJasa: ['Agustino Ong', 'Suhu Bhadra Ruci'],
  },
  {
    id: 'dpr-6',
    noDonatur: '00036',
    identitasId: '00036',
    namaDonatur: 'Sherly Ong (Keluarga Agustino)',
    panggilan: 'Sherly',
    avatarLetter: 'S',
    avatarBg: '#0d9488',
    sumber: 'Keluarga Ko Agus',
    groupJarkom: 'All DPR 1',
    namaRekening: 'Sherly Ong',
    donasiPerbulan: 200000,
    tanggalBergabung: '15 Jan 2021',
    namaPendek: 'Sherly',
    keterangan: 'Keluarga Agustino Ong',
    afiliasiKci: 'MAH',
    piutang: 0,
    bulanPiutang: '-',
    reminder: 'All',
    pelimpahanJasa: ['Sherly Ong', 'Ko Agus Ong'],
  },
  {
    id: 'dpr-2',
    noDonatur: '00032',
    identitasId: '00032',
    namaDonatur: 'Karunika Dewi',
    panggilan: 'Ci Karun',
    avatarLetter: 'K',
    avatarBg: '#00a896',
    sumber: 'Sosial Media IG',
    groupJarkom: 'All DPR 1',
    namaRekening: 'Karunika',
    donasiPerbulan: 250000,
    tanggalBergabung: '15 Mar 2019',
    namaPendek: 'Karunika',
    keterangan: 'Transfer via BCA',
    afiliasiKci: 'JKT',
    piutang: 0,
    bulanPiutang: '-',
    reminder: 'All',
    pelimpahanJasa: ['Karunika Dewi', 'Lianawati'],
  },
  {
    id: 'dpr-3',
    noDonatur: '00033',
    identitasId: '00033',
    namaDonatur: 'Vioni Hartono',
    panggilan: 'Vioni',
    avatarLetter: 'V',
    avatarBg: '#00a896',
    sumber: 'Website Lamrim',
    groupJarkom: 'All DPR 2',
    namaRekening: 'Vioni H',
    donasiPerbulan: 150000,
    tanggalBergabung: '04 Jun 2020',
    namaPendek: 'Vioni',
    keterangan: 'Auto-debit Mandiri',
    afiliasiKci: 'BDG',
    piutang: -150000,
    bulanPiutang: 'November',
    reminder: 'All',
    pelimpahanJasa: ['Vioni Hartono'],
  },
  {
    id: 'dpr-4',
    noDonatur: '00034',
    identitasId: '00034',
    namaDonatur: 'Melyana Tan',
    panggilan: 'Mely',
    avatarLetter: 'M',
    avatarBg: '#00a896',
    sumber: 'Brosur DP 2',
    groupJarkom: 'All DPR 1',
    namaRekening: 'Melyana',
    donasiPerbulan: 200000,
    tanggalBergabung: '20 Agu 2020',
    namaPendek: 'Melyana',
    keterangan: '-',
    afiliasiKci: 'MAH',
    piutang: 0,
    bulanPiutang: '-',
    reminder: 'No',
    pelimpahanJasa: ['Melyana Tan'],
  },
  {
    id: 'dpr-5',
    noDonatur: '00035',
    identitasId: '00035',
    namaDonatur: 'Stanley Khu',
    panggilan: 'Pak Stanley',
    avatarLetter: 'S',
    avatarBg: '#00a896',
    sumber: 'Bedah Buku Online',
    groupJarkom: 'All DPR 3',
    namaRekening: 'Stanley Khu',
    donasiPerbulan: 500000,
    tanggalBergabung: '10 Jan 2021',
    namaPendek: 'Stanley',
    keterangan: 'Donatur VIP Patron',
    afiliasiKci: 'JKT',
    piutang: 0,
    bulanPiutang: '-',
    reminder: 'All',
    pelimpahanJasa: ['Stanley Khu', 'Keluarga Khu'],
  },
  {
    id: 'dpr-7',
    noDonatur: '00037',
    identitasId: 'org-2',
    namaDonatur: 'Kadam Choeling Indonesia',
    panggilan: 'KCI',
    avatarLetter: 'K',
    avatarBg: '#e05244',
    sumber: 'Dharma Center',
    groupJarkom: 'All DPR 1',
    namaRekening: 'Kadam Choeling Indonesia',
    donasiPerbulan: 1000000,
    tanggalBergabung: '01 Jan 2019',
    namaPendek: 'KCI',
    keterangan: 'Donasi Organisasi / Center',
    afiliasiKci: 'BDG',
    piutang: 0,
    bulanPiutang: '-',
    reminder: 'All',
    pelimpahanJasa: ['Semua Makhluk', 'Guru Pembimbing'],
  },
];

const STORAGE_KEY = 'yppln_dharma_patron_rutin_list_v1';

export function getDharmaPatronFromStorage(): DharmaPatronRutinItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item: DharmaPatronRutinItem) => {
          // Normalize identitasId and pelimpahanJasa if missing
          const matchedInitial = INITIAL_DHARMA_PATRON_LIST.find(
            (init) =>
              init.id === item.id ||
              init.noDonatur === item.noDonatur ||
              init.namaDonatur.toLowerCase().trim() === item.namaDonatur.toLowerCase().trim()
          );
          return {
            ...item,
            identitasId: item.identitasId || matchedInitial?.identitasId || item.noDonatur,
            pelimpahanJasa:
              item.pelimpahanJasa && item.pelimpahanJasa.length > 0
                ? item.pelimpahanJasa
                : matchedInitial?.pelimpahanJasa || (item.namaDonatur ? [item.namaDonatur] : ['Suhu Bhadra Ruci']),
          };
        });
      }
    }
  } catch (err) {
    console.error('Failed to load dharma patron from storage:', err);
  }
  return INITIAL_DHARMA_PATRON_LIST;
}

export function saveDharmaPatronToStorage(list: DharmaPatronRutinItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save dharma patron to storage:', err);
  }
}
