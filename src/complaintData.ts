import { ComplaintItem } from './types';

export const COMPLAINT_STORAGE_KEY = 'proyek_sapa_complaints_v1';

export const JENIS_KOMPLAIN_OPTIONS = [
  'Medsos',
  'Event',
  'Pelayanan',
  'Buku/Umum',
  'Pengiriman / Ekspedisi',
  'Donasi & Administrasi',
  'Lainnya',
];

export const INITIAL_COMPLAINT_ITEMS: ComplaintItem[] = [
  {
    id: 'complaint-1',
    tanggal: '01 Jan 2021',
    nama: '00031 Agustino Ong',
    kodeDonatur: '00031',
    subNama: 'Ko Agus',
    avatarLetter: 'A',
    avatarBg: '#00a896',
    jenisKomplain: 'Medsos',
    komplain: 'XXX',
    status: 'Open',
    identitasId: '00031',
  },
  {
    id: 'complaint-2',
    tanggal: '21 Jan 2021',
    nama: '00019 Cindy Budiman',
    kodeDonatur: '00019',
    subNama: 'Ci Pao',
    avatarLetter: 'C',
    avatarBg: '#eab308',
    jenisKomplain: 'Event',
    komplain: 'XXX',
    status: 'Diproses',
    identitasId: '00019',
  },
  {
    id: 'complaint-3',
    tanggal: '14 Nov 2021',
    nama: '00018 Silvia Fukada',
    kodeDonatur: '00018',
    subNama: 'Ci Silvia',
    avatarLetter: 'S',
    avatarBg: '#64748b',
    jenisKomplain: 'Pelayanan',
    komplain: 'XXX',
    status: 'Open',
    identitasId: '00018',
  },
  {
    id: 'complaint-4',
    tanggal: '15 Nov 2021',
    nama: '00800 Bhadra Ksanti',
    kodeDonatur: '00800',
    subNama: 'Sucek Shi Xian Jen',
    avatarLetter: 'B',
    avatarBg: '#0f766e',
    jenisKomplain: 'Buku/Umum',
    komplain: 'XXX',
    status: 'Open',
    identitasId: '00800',
  },
  {
    id: 'complaint-5',
    tanggal: '15 Nov 2021',
    nama: '00034 Melyana Tan',
    kodeDonatur: '00034',
    subNama: 'Ci Mel',
    avatarLetter: 'M',
    avatarBg: '#8b5cf6',
    jenisKomplain: 'Medsos',
    komplain: 'XXX',
    status: 'Selesai',
    identitasId: '00034',
  },
  {
    id: 'complaint-6',
    tanggal: '15 Nov 2021',
    nama: '00035 Stanley Khu',
    kodeDonatur: '00035',
    subNama: 'Ko Stanley',
    avatarLetter: 'S',
    avatarBg: '#0284c7',
    jenisKomplain: 'Pelayanan',
    komplain: 'XXX',
    status: 'Diproses',
    identitasId: '00035',
  },
];

export function getComplaintsFromStorage(): ComplaintItem[] {
  try {
    const raw = localStorage.getItem(COMPLAINT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load complaints from storage', err);
  }
  return INITIAL_COMPLAINT_ITEMS;
}

export function saveComplaintsToStorage(items: ComplaintItem[]): void {
  try {
    localStorage.setItem(COMPLAINT_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save complaints to storage', err);
  }
}
