import { KaryawanItem } from './types';

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

/**
 * Clears any legacy localStorage keys for member accounts or login sessions.
 * Accounts & sessions must NEVER be stored in localStorage.
 */
export function clearLegacyAuthLocalStorage(): void {
  try {
    localStorage.removeItem('sapa_karyawan_data_v1');
    localStorage.removeItem('sapa_current_login_user');
    localStorage.removeItem('sapa_current_login_divisi');
    localStorage.removeItem('erp_cloud_cache_karyawan');
    localStorage.removeItem('erp_cloud_cache_member_accounts');
  } catch {
    // Ignore storage access restrictions
  }
}

export function loadKaryawan(): KaryawanItem[] {
  clearLegacyAuthLocalStorage();
  return INITIAL_KARYAWAN;
}

export function saveKaryawan(_items: KaryawanItem[]): void {
  // No-op: Member accounts are stored strictly in Cloud Firestore (never in localStorage).
  clearLegacyAuthLocalStorage();
}
