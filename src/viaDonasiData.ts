export interface JenisViaDonasiItem {
  id: string;
  namaJenisVia: string;
  keterangan?: string;
  createdAt?: string;
}

export interface ViaTransaksiDonasiItem {
  id: string;
  namaVia: string;
  jenisVia: string;
  onlineOffline: 'Online' | 'Offline';
  kirimResi?: boolean;
  keterangan?: string;
  createdAt?: string;
}

export const INITIAL_JENIS_VIA_DONASI: JenisViaDonasiItem[] = [
  {
    id: 'jvd-1',
    namaJenisVia: 'Call Center',
    keterangan: 'Layanan panggilan telepon dan customer hotline',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'jvd-2',
    namaJenisVia: 'Patron Hunter',
    keterangan: 'Kanal donatur tetap dan patron khusus',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'jvd-3',
    namaJenisVia: 'Website',
    keterangan: 'Portal donasi online website resmi',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'jvd-4',
    namaJenisVia: 'Media Social',
    keterangan: 'Kanal jejaring sosial digital yayasan',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'jvd-5',
    namaJenisVia: 'Stand',
    keterangan: 'Stan pameran, event offline, dan booth fisik',
    createdAt: '15 Nov 2021',
  },
];

export const INITIAL_VIA_TRANSAKSI_DONASI: ViaTransaksiDonasiItem[] = [
  {
    id: 'vtd-1',
    namaVia: 'Call Center',
    jenisVia: 'Call Center',
    onlineOffline: 'Online',
    kirimResi: true,
    keterangan: 'Hotline CS Pusat Donasi',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'vtd-2',
    namaVia: 'Martin Peng',
    jenisVia: 'Patron Hunter',
    onlineOffline: 'Online',
    kirimResi: true,
    keterangan: 'Koordinator Patron Hunter Martin Peng',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'vtd-3',
    namaVia: 'Facebook',
    jenisVia: 'Media Social',
    onlineOffline: 'Online',
    kirimResi: false,
    keterangan: 'Halaman Facebook Official Yayasan',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'vtd-4',
    namaVia: 'Instagram',
    jenisVia: 'Media Social',
    onlineOffline: 'Online',
    kirimResi: true,
    keterangan: 'Akun Instagram Resmi @yppln',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'vtd-5',
    namaVia: 'Tiktok',
    jenisVia: 'Media Social',
    onlineOffline: 'Online',
    kirimResi: false,
    keterangan: 'Kanal Video Pendek TikTok Donasi',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'vtd-6',
    namaVia: 'Stand',
    jenisVia: 'Stand',
    onlineOffline: 'Offline',
    kirimResi: true,
    keterangan: 'Booth stand fisik di lokasi kegiatan/vihara',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'vtd-7',
    namaVia: 'Online Event External',
    jenisVia: 'Stand',
    onlineOffline: 'Online',
    kirimResi: false,
    keterangan: 'Bazar, seminar online, dan event eksternal',
    createdAt: '15 Nov 2021',
  },
];
