export interface AccountItem {
  id: string;
  divisi: string;
  linkLogin?: string;
  namaAccount: string;
  password: string;
  jenisAccount: string;
  pemegang: string;
  jenisAdmin: string;
  aktif: boolean;
  alasanTidakAktif?: string;
  createdAt?: string;
}

export const INITIAL_ACCOUNT_LIST: AccountItem[] = [
  {
    id: 'acc-1',
    divisi: 'EVE',
    jenisAccount: 'Email Retreat',
    namaAccount: 'retret@kadamchoeling.or.id',
    password: 'password123',
    pemegang: 'Panitia Retret/MPP',
    jenisAdmin: 'Bisa dibuka lebih dari 1 orang dalam waktu yang sama',
    linkLogin: 'https://mail.google.com',
    aktif: true,
    createdAt: '15 Nov 2021',
  },
  {
    id: 'acc-2',
    divisi: 'EVE',
    jenisAccount: 'Email Public Teaching',
    namaAccount: 'publicteaching@kadamchoeling.or.id',
    password: 'password123',
    pemegang: 'Panitia Public Teaching Jakarta',
    jenisAdmin: 'Bisa dibuka lebih dari 1 orang dalam waktu yang sama',
    linkLogin: 'https://mail.google.com',
    aktif: false,
    alasanTidakAktif: 'Event Public Teaching telah selesai dilaksanakan',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'acc-3',
    divisi: 'UMM',
    jenisAccount: 'Google Workspace Admin',
    namaAccount: 'admin@yppln.or.id',
    password: 'password123',
    pemegang: 'Agustino Ong (Ko Agus)',
    jenisAdmin: 'Super Admin - Hanya 1 perangkat aktif',
    linkLogin: 'https://admin.google.com',
    aktif: true,
    createdAt: '10 Nov 2021',
  },
  {
    id: 'acc-4',
    divisi: 'FUN',
    jenisAccount: 'Instagram Official',
    namaAccount: '@yppln_official',
    password: 'password123',
    pemegang: 'Cindy Budiman (Ci Pao)',
    jenisAdmin: 'Bisa dibuka lebih dari 1 orang dalam waktu yang sama',
    linkLogin: 'https://instagram.com',
    aktif: true,
    createdAt: '10 Nov 2021',
  },
  {
    id: 'acc-5',
    divisi: 'PNB',
    jenisAccount: 'Penerbitan & ISBN Perpusnas',
    namaAccount: 'isbn@yppln.or.id',
    password: 'password123',
    pemegang: 'Silvia Fukada (Ci Silvia)',
    jenisAdmin: 'Hanya PIC Terdaftar',
    linkLogin: 'https://isbn.perpusnas.go.id',
    aktif: true,
    createdAt: '05 Nov 2021',
  },
];

const ACCOUNT_STORAGE_KEY = 'sapa_list_account_data_v1';

export function loadAccountList(): AccountItem[] {
  try {
    const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY);
    if (!raw) {
      saveAccountList(INITIAL_ACCOUNT_LIST);
      return INITIAL_ACCOUNT_LIST;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_ACCOUNT_LIST;
  } catch (e) {
    console.error('Failed to load account list from storage', e);
    return INITIAL_ACCOUNT_LIST;
  }
}

export function saveAccountList(items: AccountItem[]): void {
  try {
    localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save account list to storage', e);
  }
}
