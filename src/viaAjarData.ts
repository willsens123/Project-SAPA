export interface JenisViaAjarItem {
  id: string;
  namaJenisVia: string;
  keterangan?: string;
  createdAt?: string;
}

export interface ViaTransaksiAjarItem {
  id: string;
  namaVia: string;
  jenisVia: string;
  onlineOffline: 'Online' | 'Offline';
  keterangan?: string;
  createdAt?: string;
}

export const INITIAL_JENIS_VIA_AJAR: JenisViaAjarItem[] = [
  {
    id: 'jva-1',
    namaJenisVia: 'Call Center',
    keterangan: 'Layanan panggilan telepon dan hotline pendaftaran',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'jva-2',
    namaJenisVia: 'Website',
    keterangan: 'Portal online website registrasi acara',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'jva-3',
    namaJenisVia: 'Form',
    keterangan: 'Formulir online dan Google Forms pendaftaran',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'jva-4',
    namaJenisVia: 'Media Social',
    keterangan: 'Kanal jejaring media sosial resmi yayasan',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'jva-5',
    namaJenisVia: 'Stand',
    keterangan: 'Stan pameran, booth fisik vihara, maupun stand online',
    createdAt: '15 Nov 2021',
  },
];

export const INITIAL_VIA_TRANSAKSI_AJAR: ViaTransaksiAjarItem[] = [
  {
    id: 'vta-1',
    namaVia: 'Call Center',
    jenisVia: 'Call Center',
    onlineOffline: 'Online',
    keterangan: 'Hotline resmi Call Center',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'vta-2',
    namaVia: 'Website Retret',
    jenisVia: 'Website',
    onlineOffline: 'Online',
    keterangan: 'Portal registrasi website Indonesia Lamrim Retreat',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'vta-3',
    namaVia: 'Form',
    jenisVia: 'Form',
    onlineOffline: 'Online',
    keterangan: 'Google Forms dan formulir registrasi peserta',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'vta-4',
    namaVia: 'Facebook',
    jenisVia: 'Media Social',
    onlineOffline: 'Online',
    keterangan: 'Akun & Page Facebook Yayasan Pelestarian Lamrim',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'vta-5',
    namaVia: 'Instagram',
    jenisVia: 'Media Social',
    onlineOffline: 'Online',
    keterangan: 'Akun Instagram Resmi @yppln',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'vta-6',
    namaVia: 'Tiktok',
    jenisVia: 'Media Social',
    onlineOffline: 'Online',
    keterangan: 'Kanal Video TikTok Edukasi A-AJAR',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'vta-7',
    namaVia: 'Stand',
    jenisVia: 'Stand',
    onlineOffline: 'Offline',
    keterangan: 'Booth registrasi fisik di vihara/lokasi retret',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'vta-8',
    namaVia: 'Stand Online',
    jenisVia: 'Stand',
    onlineOffline: 'Online',
    keterangan: 'Meja info virtual dan helpdesk Zoom stand online',
    createdAt: '15 Nov 2021',
  },
];

const STORAGE_KEY_VIA_AJAR = 'yppln_via_transaksi_ajar';
const STORAGE_KEY_JENIS_VIA_AJAR = 'yppln_jenis_via_transaksi_ajar';

export function getViaAjarFromStorage(): ViaTransaksiAjarItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_VIA_AJAR);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load via ajar from storage', err);
  }
  return INITIAL_VIA_TRANSAKSI_AJAR;
}

export function saveViaAjarToStorage(items: ViaTransaksiAjarItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_VIA_AJAR, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save via ajar to storage', err);
  }
}

export function getJenisViaAjarFromStorage(): JenisViaAjarItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_JENIS_VIA_AJAR);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.error('Failed to load jenis via ajar from storage', err);
  }
  return INITIAL_JENIS_VIA_AJAR;
}

export function saveJenisViaAjarToStorage(items: JenisViaAjarItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_JENIS_VIA_AJAR, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to save jenis via ajar to storage', err);
  }
}
