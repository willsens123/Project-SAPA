export interface JenisViaSalurItem {
  id: string;
  namaJenisVia: string;
  keterangan?: string;
}

export interface ViaTransaksiSalurItem {
  id: string;
  namaVia: string;
  jenisVia: string;
  tipe: 'Online' | 'Offline';
  keterangan?: string;
}

export const INITIAL_JENIS_VIA_SALUR: JenisViaSalurItem[] = [
  { id: 'jvs-1', namaJenisVia: 'Call Center' },
  { id: 'jvs-2', namaJenisVia: 'Market Place' },
  { id: 'jvs-3', namaJenisVia: 'Agen Purna' },
  { id: 'jvs-4', namaJenisVia: 'Website' },
  { id: 'jvs-5', namaJenisVia: 'Form' },
  { id: 'jvs-6', namaJenisVia: 'Media Social' },
  { id: 'jvs-7', namaJenisVia: 'Stand' },
  { id: 'jvs-8', namaJenisVia: 'YPPLN' },
];

export const INITIAL_VIA_TRANSAKSI_SALUR: ViaTransaksiSalurItem[] = [
  { id: 'vts-1', namaVia: 'Call Center', jenisVia: 'Call Center', tipe: 'Online' },
  { id: 'vts-2', namaVia: 'Tokopedia', jenisVia: 'Market Place', tipe: 'Online' },
  { id: 'vts-3', namaVia: 'Shopee', jenisVia: 'Market Place', tipe: 'Online' },
  { id: 'vts-4', namaVia: 'Kezya', jenisVia: 'Agen Purna', tipe: 'Offline' },
  { id: 'vts-5', namaVia: 'Vihara Vipassana Graha', jenisVia: 'Agen Purna', tipe: 'Offline' },
  { id: 'vts-6', namaVia: 'Website Store', jenisVia: 'Website', tipe: 'Online' },
  { id: 'vts-7', namaVia: 'Form Buku Tidak Berbayar', jenisVia: 'Form', tipe: 'Online' },
  { id: 'vts-8', namaVia: 'Facebook', jenisVia: 'Media Social', tipe: 'Online' },
  { id: 'vts-9', namaVia: 'Instagram', jenisVia: 'Media Social', tipe: 'Online' },
  { id: 'vts-10', namaVia: 'Tiktok', jenisVia: 'Media Social', tipe: 'Online' },
  { id: 'vts-11', namaVia: 'Stand', jenisVia: 'Stand', tipe: 'Offline' },
  { id: 'vts-12', namaVia: 'Stand Online', jenisVia: 'Stand', tipe: 'Online' },
  { id: 'vts-13', namaVia: 'Syariv', jenisVia: 'YPPLN', tipe: 'Online' },
];
