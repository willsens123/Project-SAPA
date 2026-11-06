import { KaryawanItem } from './types';

const STORAGE_KEY = 'sapa_karyawan_data_v1';

export const INITIAL_KARYAWAN: KaryawanItem[] = [
  {
    id: 'karyawan-1',
    kodeKaryawan: '00031',
    namaLengkap: 'Agustino Ong',
    namaPanggilan: 'Ko Agus',
    divisi: 'UMM',
    emailLogin: 'agustino@gmail.com',
    password: 'password123',
    avatarInitial: 'A',
    avatarBg: 'bg-[#14b8a6]',
    aktif: true,
    tanggalBergabung: '01/01/2020',
  },
  {
    id: 'karyawan-2',
    kodeKaryawan: '00019',
    namaLengkap: 'Cindy Budiman',
    namaPanggilan: 'Ci Pao',
    divisi: 'FUN',
    emailLogin: 'cindybudiman@gmail.com',
    password: 'password123',
    avatarInitial: 'C',
    avatarBg: 'bg-[#eab308]',
    aktif: true,
    tanggalBergabung: '15/03/2020',
  },
  {
    id: 'karyawan-3',
    kodeKaryawan: '00018',
    namaLengkap: 'Silvia Fukada',
    namaPanggilan: 'Ci Silvia',
    divisi: 'PNB',
    emailLogin: 'silvia@gmail.com',
    password: 'password123',
    avatarInitial: 'S',
    avatarBg: 'bg-[#64748b]',
    aktif: true,
    tanggalBergabung: '01/06/2020',
  },
  {
    id: 'karyawan-4',
    kodeKaryawan: '00015',
    namaLengkap: 'Ariel',
    namaPanggilan: 'Ariel',
    divisi: 'OPS',
    emailLogin: 'ariel@gmail.com',
    password: 'password123',
    avatarInitial: 'A',
    avatarBg: 'bg-[#008d91]',
    aktif: true,
    tanggalBergabung: '10/08/2020',
  },
  {
    id: 'karyawan-5',
    kodeKaryawan: '00016',
    namaLengkap: 'Bhadra',
    namaPanggilan: 'Bhadra',
    divisi: 'PRO',
    emailLogin: 'bhadra@gmail.com',
    password: 'password123',
    avatarInitial: 'B',
    avatarBg: 'bg-[#ea580c]',
    aktif: true,
    tanggalBergabung: '01/11/2020',
  },
  {
    id: 'karyawan-6',
    kodeKaryawan: '00017',
    namaLengkap: 'Denny',
    namaPanggilan: 'Denny',
    divisi: 'MED',
    emailLogin: 'denny@gmail.com',
    password: 'password123',
    avatarInitial: 'D',
    avatarBg: 'bg-[#f99500]',
    aktif: true,
    tanggalBergabung: '15/01/2021',
  },
  {
    id: 'karyawan-7',
    kodeKaryawan: '00020',
    namaLengkap: 'Lani',
    namaPanggilan: 'Ci Lani',
    divisi: 'UMM',
    emailLogin: 'lani@gmail.com',
    password: 'password123',
    avatarInitial: 'L',
    avatarBg: 'bg-[#9333ea]',
    aktif: true,
    tanggalBergabung: '01/02/2021',
  },
  {
    id: 'karyawan-8',
    kodeKaryawan: '00010',
    namaLengkap: 'Kevin Sanjaya',
    namaPanggilan: 'Kevin',
    divisi: 'OPS',
    emailLogin: 'kevin@gmail.com',
    password: 'password123',
    avatarInitial: 'K',
    avatarBg: 'bg-[#64748b]',
    aktif: false,
    tanggalBergabung: '01/02/2019',
    tanggalBerhenti: '30/12/2020',
  },
  {
    id: 'karyawan-9',
    kodeKaryawan: '00012',
    namaLengkap: 'Maya Anggraini',
    namaPanggilan: 'Maya',
    divisi: 'MED',
    emailLogin: 'maya@gmail.com',
    password: 'password123',
    avatarInitial: 'M',
    avatarBg: 'bg-[#ea580c]',
    aktif: false,
    tanggalBergabung: '15/06/2019',
    tanggalBerhenti: '15/03/2021',
  },
];

export function loadKaryawan(): KaryawanItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveKaryawan(INITIAL_KARYAWAN);
      return INITIAL_KARYAWAN;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Migrate existing items if tanggalBergabung is missing
      const migrated = parsed.map((item: KaryawanItem, idx: number) => {
        const fallback = INITIAL_KARYAWAN.find((init) => init.id === item.id);
        return {
          ...item,
          tanggalBergabung:
            item.tanggalBergabung ||
            fallback?.tanggalBergabung ||
            `01/01/202${(idx % 3) + 1}`,
          tanggalBerhenti: item.tanggalBerhenti || fallback?.tanggalBerhenti || undefined,
          aktif:
            item.aktif !== undefined
              ? item.aktif
              : item.tanggalBerhenti
              ? false
              : true,
        };
      });
      return migrated;
    }
    return INITIAL_KARYAWAN;
  } catch (err) {
    console.warn('Error loading Karyawan from localStorage:', err);
    return INITIAL_KARYAWAN;
  }
}

export function saveKaryawan(items: KaryawanItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Error saving Karyawan to localStorage:', err);
  }
}
