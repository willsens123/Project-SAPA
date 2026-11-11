import { CentralAuditLogEntry, AuditModule } from '../types';
import { SalurOrder } from '../salurData';
import { DonasiOrder } from '../donasiData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { INITIAL_CHANGE_LOGS } from '../identitasData';

export const CENTRAL_AUDIT_LOGS_STORAGE_KEY = 'central_audit_logs_v1';
export const AUDIT_LOG_EVENT_NAME = 'app:audit-log';

/**
 * Format timestamp in clean Indonesian format
 */
export function formatAuditTimestamp(date: Date = new Date()): string {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Initial baseline seed audit logs representing crucial past transactions
 */
export const INITIAL_CENTRAL_AUDIT_LOGS: CentralAuditLogEntry[] = [
  // 1. S-SALUR Crucial Events
  {
    id: 'audit-salur-1',
    timestamp: 'Senin, 15 Nov 2021 10:45',
    isoTimestamp: '2021-11-15T10:45:00.000Z',
    module: 'S-SALUR',
    recordId: 'CC 211114001',
    recordTitle: 'Agustino Ong (Jalan Menuju Kemahatahuan)',
    actionType: 'Status Bayar',
    field: 'Status Pembayaran',
    oldValue: 'Belum Bayar',
    newValue: 'Paid (Lunas)',
    alasan: 'Verifikasi mutasi rekening BCA 888 Rp145.000',
    author: 'Finance Admin',
  },
  {
    id: 'audit-salur-2',
    timestamp: 'Senin, 15 Nov 2021 11:15',
    isoTimestamp: '2021-11-15T11:15:00.000Z',
    module: 'S-SALUR',
    recordId: 'CC 211114001',
    recordTitle: 'Agustino Ong',
    actionType: 'Pengiriman',
    field: 'Nomor Resi / Ekspedisi',
    oldValue: 'Belum dikirim (-)',
    newValue: 'TIKI ONS 001234988 (Sudah Dikirim)',
    alasan: 'Paket diserahkan ke kurir TIKI',
    author: 'Koordinator Salur',
  },
  {
    id: 'audit-salur-3',
    timestamp: 'Minggu, 14 Nov 2021 15:30',
    isoTimestamp: '2021-11-14T15:30:00.000Z',
    module: 'S-SALUR',
    recordId: 'POS 211114002',
    recordTitle: 'Cindy Budiman (Buku Menjadi Buddha)',
    actionType: 'Tambah',
    field: 'Transaksi Pesanan',
    oldValue: '-',
    newValue: '2 Buku Menjadi Buddha (Rp200.000)',
    alasan: 'Input pesanan via POS Kasir Stand Waisak',
    author: 'Kasir Salur',
  },

  // 2. D-DONASI Crucial Events
  {
    id: 'audit-donasi-1',
    timestamp: 'Senin, 15 Nov 2021 09:10',
    isoTimestamp: '2021-11-15T09:10:00.000Z',
    module: 'DONASI',
    recordId: 'DP 211115001',
    recordTitle: 'Agustino Ong (Dharma Patron Rutin)',
    actionType: 'Status Bayar',
    field: 'Status Pembayaran Donasi',
    oldValue: 'Belum Bayar',
    newValue: 'Paid (Rp100.000)',
    alasan: 'Konfirmasi transfer autodebet BCA 888',
    author: 'Call Center Donasi',
  },
  {
    id: 'audit-donasi-2',
    timestamp: 'Minggu, 14 Nov 2021 14:00',
    isoTimestamp: '2021-11-14T14:00:00.000Z',
    module: 'DONASI',
    recordId: 'DN 211114008',
    recordTitle: 'Bhadra Ksanti (Dana Retret Meditasi Lamrim)',
    actionType: 'Tambah',
    field: 'Donasi Program Terikat',
    oldValue: '-',
    newValue: 'Dana Retret Rp1.500.000',
    alasan: 'Penerimaan donasi sponsorship peserta retret',
    author: 'Fundraising Coordinator',
  },
  {
    id: 'audit-donasi-3',
    timestamp: 'Jumat, 12 Nov 2021 16:20',
    isoTimestamp: '2021-11-12T16:20:00.000Z',
    module: 'DONASI',
    recordId: 'DN 211112003',
    recordTitle: 'Siti Rahmawati',
    actionType: 'Ubah',
    field: 'Pelimpahan Jasa Donatur',
    oldValue: 'Leluhur Keluarga',
    newValue: 'Alm. Bapak H. Rahmad & Keluarga',
    alasan: 'Koreksi penulisan nama pelimpahan jasa sesuai permohonan donatur',
    author: 'Admin Sekretariat',
  },

  // 3. A-AJAR Crucial Events
  {
    id: 'audit-ajar-1',
    timestamp: 'Senin, 15 Nov 2021 08:30',
    isoTimestamp: '2021-11-15T08:30:00.000Z',
    module: 'AJAR',
    recordId: 'AJAR-2111-001',
    recordTitle: 'Lilo (Kelas Lamrim Dasar Angkatan 12)',
    actionType: 'Status Bayar',
    field: 'Status Pembayaran Kursus',
    oldValue: 'Pending (Belum Lunas)',
    newValue: 'Lunas (Rp150.000)',
    alasan: 'Konfirmasi pembayaran via QRIS Mandiri',
    author: 'Admin Edukasi',
  },
  {
    id: 'audit-ajar-2',
    timestamp: 'Sabtu, 13 Nov 2021 13:45',
    isoTimestamp: '2021-11-13T13:45:00.000Z',
    module: 'AJAR',
    recordId: 'AJAR-2111-002',
    recordTitle: 'Sucek Shi Xian Jen (Pelatihan Penerjemah Sastra)',
    actionType: 'Tambah',
    field: 'Pendaftaran Peserta Ajar',
    oldValue: '-',
    newValue: 'Peserta Reguler (Bebas Biaya Relawan)',
    alasan: 'Pemberian beasiswa relawan penerjemah naskah',
    author: 'Divisi Ajar',
  },

  // 4. IDENTITAS Baseline Events (Mapped from INITIAL_CHANGE_LOGS)
  ...INITIAL_CHANGE_LOGS.map((log) => ({
    id: `audit-identitas-${log.id}`,
    timestamp: log.timestamp,
    isoTimestamp: '2021-11-15T09:30:00.000Z',
    module: 'IDENTITAS' as AuditModule,
    recordId: log.codeId || log.identitasId,
    recordTitle: log.namaLengkap,
    actionType: log.actionType,
    field: log.field,
    oldValue: log.oldValue,
    newValue: log.newValue,
    alasan: log.alasan,
    author: 'Admin Identitas',
  })),

  // 5. Suspicious Baseline Cluster for 00031 (Agustino Ong): Field 'Nomor HandPhone' modified 4x within 10 days
  {
    id: 'audit-identitas-suspicious-1',
    timestamp: 'Jumat, 05 Nov 2021 14:10',
    isoTimestamp: '2021-11-05T14:10:00.000Z',
    module: 'IDENTITAS',
    recordId: '00031',
    recordTitle: 'Agustino Ong',
    actionType: 'Ubah',
    field: 'Nomor HandPhone',
    oldValue: '08111222333',
    newValue: '08123456701',
    alasan: 'Ganti nomor kontak WhatsApp darurat',
    author: 'Admin Identitas',
  },
  {
    id: 'audit-identitas-suspicious-2',
    timestamp: 'Selasa, 09 Nov 2021 11:20',
    isoTimestamp: '2021-11-09T11:20:00.000Z',
    module: 'IDENTITAS',
    recordId: '00031',
    recordTitle: 'Agustino Ong',
    actionType: 'Ubah',
    field: 'Nomor HandPhone',
    oldValue: '08123456701',
    newValue: '08123456755',
    alasan: 'Update nomor SIM card utama',
    author: 'Admin Identitas',
  },
  {
    id: 'audit-identitas-suspicious-3',
    timestamp: 'Jumat, 12 Nov 2021 16:45',
    isoTimestamp: '2021-11-12T16:45:00.000Z',
    module: 'IDENTITAS',
    recordId: '00031',
    recordTitle: 'Agustino Ong',
    actionType: 'Ubah',
    field: 'Nomor HandPhone',
    oldValue: '08123456755',
    newValue: '08123456780',
    alasan: 'Koreksi salah input digit akhir nomor HP',
    author: 'Admin Identitas',
  },

  // 6. Multi-Month Historical Seeds for Trend Analysis (Nov 2025 - Nov 2026)
  // Des 2025: Akhir Tahun & Penyaluran Kalender (16 mutasi)
  {
    id: 'audit-hist-2512-1',
    timestamp: 'Senin, 15 Des 2025 10:00',
    isoTimestamp: '2025-12-15T10:00:00.000Z',
    module: 'DONASI',
    recordId: 'DN 251215001',
    recordTitle: 'Hendri Wijaya (Dana Akhir Tahun)',
    actionType: 'Status Bayar',
    field: 'Status Pembayaran Donasi',
    oldValue: 'Belum Bayar',
    newValue: 'Paid (Rp5.000.000)',
    alasan: 'Donasi tutup buku akhir tahun',
    author: 'Finance Admin',
  },
  {
    id: 'audit-hist-2512-2',
    timestamp: 'Rabu, 17 Des 2025 14:30',
    isoTimestamp: '2025-12-17T14:30:00.000Z',
    module: 'S-SALUR',
    recordId: 'CC 251217001',
    recordTitle: 'Budi Hartono (Kalender Dharma 2026)',
    actionType: 'Pengiriman',
    field: 'Nomor Resi / Ekspedisi',
    oldValue: '-',
    newValue: 'JNE REG 88123019',
    alasan: 'Penyaluran kalender tahun baru',
    author: 'Admin Salur',
  },
  {
    id: 'audit-hist-2512-3',
    timestamp: 'Sabtu, 20 Des 2025 11:15',
    isoTimestamp: '2025-12-20T11:15:00.000Z',
    module: 'AJAR',
    recordId: 'AJAR-2512-005',
    recordTitle: 'Meiliana (Ujian Akhir Semester Lamrim)',
    actionType: 'Ubah',
    field: 'Kelulusan Kelas',
    oldValue: 'Proses Evaluasi',
    newValue: 'Lulus Dengan Pujian',
    alasan: 'Input nilai kelulusan angkatan 18',
    author: 'Tim Kurikulum Ajar',
  },
  {
    id: 'audit-hist-2512-4',
    timestamp: 'Senin, 22 Des 2025 09:20',
    isoTimestamp: '2025-12-22T09:20:00.000Z',
    module: 'IDENTITAS',
    recordId: '00019',
    recordTitle: 'Cindy Budiman',
    actionType: 'Ubah',
    field: 'Alamat Surat',
    oldValue: 'Jl. Surya Barat No. 12',
    newValue: 'Jl. Surya Kencana No. 45 Jakarta Barat',
    alasan: 'Pindah domisili pengiriman paket buku',
    author: 'Sekretariat',
  },

  // Jan 2026: Awal Tahun & Sinkronisasi Patron Rutin (24 mutasi)
  {
    id: 'audit-hist-2601-1',
    timestamp: 'Senin, 05 Jan 2026 09:00',
    isoTimestamp: '2026-01-05T09:00:00.000Z',
    module: 'DONASI',
    recordId: 'DP 260105001',
    recordTitle: 'Agustino Ong (Dharma Patron 2026)',
    actionType: 'Status Bayar',
    field: 'Komitmen Tahunan',
    oldValue: 'Rp100.000/bln',
    newValue: 'Rp250.000/bln (Naik Kelas Patron)',
    alasan: 'Pembaruan komitmen autodebet tahun baru',
    author: 'Divisi Fundraising',
  },
  {
    id: 'audit-hist-2601-2',
    timestamp: 'Kamis, 08 Jan 2026 14:00',
    isoTimestamp: '2026-01-08T14:00:00.000Z',
    module: 'S-SALUR',
    recordId: 'POS 260108003',
    recordTitle: 'David Tan (Buku Lamrim Chenmo Vol 1)',
    actionType: 'Tambah',
    field: 'Pesanan Awal Tahun',
    oldValue: '-',
    newValue: '1 Paket Lamrim Chenmo 3 Jilid',
    alasan: 'Pengadaan literatur perpustakaan vihara',
    author: 'Kasir Salur',
  },
  {
    id: 'audit-hist-2601-3',
    timestamp: 'Rabu, 14 Jan 2026 16:30',
    isoTimestamp: '2026-01-14T16:30:00.000Z',
    module: 'AJAR',
    recordId: 'AJAR-2601-012',
    recordTitle: 'Kelas Lamrim Menengah Angkatan 7',
    actionType: 'Tambah',
    field: 'Registrasi Batch Baru',
    oldValue: '-',
    newValue: '45 Peserta Terdaftar',
    alasan: 'Pembukaan kelas studi semester ganjil',
    author: 'Admin Edukasi',
  },
  {
    id: 'audit-hist-2601-4',
    timestamp: 'Jumat, 23 Jan 2026 10:45',
    isoTimestamp: '2026-01-23T10:45:00.000Z',
    module: 'IDENTITAS',
    recordId: '00008',
    recordTitle: 'Bhadra Ksanti',
    actionType: 'Ubah',
    field: 'Status Keanggotaan',
    oldValue: 'Simpatisan',
    newValue: 'Relawan Senior / Fasilitator',
    alasan: 'Pengangkatan fasilitator studi Dharma',
    author: 'HR & Relawan',
  },

  // Feb 2026: Persiapan Tahun Baru Imlek & Logistik (19 mutasi)
  {
    id: 'audit-hist-2602-1',
    timestamp: 'Senin, 02 Feb 2026 10:15',
    isoTimestamp: '2026-02-02T10:15:00.000Z',
    module: 'S-SALUR',
    recordId: 'CC 260202008',
    recordTitle: 'Vihara Bodhi Dharma (Paket Buku Doa)',
    actionType: 'Status Bayar',
    field: 'Status Pembayaran',
    oldValue: 'Pending',
    newValue: 'Lunas (Transfer BCA Rp1.800.000)',
    alasan: 'Pelunasan donasi buku kebaktian',
    author: 'Finance Salur',
  },
  {
    id: 'audit-hist-2602-2',
    timestamp: 'Kamis, 12 Feb 2026 15:40',
    isoTimestamp: '2026-02-12T15:40:00.000Z',
    module: 'DONASI',
    recordId: 'DN 260212004',
    recordTitle: 'Keluarga Salim (Dana Pelita Imlek)',
    actionType: 'Tambah',
    field: 'Donasi Program Terikat',
    oldValue: '-',
    newValue: 'Pelita Keberkahan Imlek Rp2.888.000',
    alasan: 'Pemasangan pelita tahunan',
    author: 'Sekretariat Donasi',
  },
  {
    id: 'audit-hist-2602-3',
    timestamp: 'Selasa, 17 Feb 2026 11:20',
    isoTimestamp: '2026-02-17T11:20:00.000Z',
    module: 'AJAR',
    recordId: 'AJAR-2602-003',
    recordTitle: 'Pelatihan Guru Sekolah Minggu',
    actionType: 'Ubah',
    field: 'Jadwal Kursus',
    oldValue: 'Sabtu Pagi',
    newValue: 'Minggu Siang (Hybrid Zoom & Vihara)',
    alasan: 'Penyesuaian jam mengajar relawan',
    author: 'Koordinator Ajar',
  },

  // Mar 2026: LONJAKAN AKTIVITAS TERTINGGI (PEAK SPIKE - 48 mutasi)
  // Kampanye Akbar Salur 10.000 Buku & Pemutakhiran Database Donatur
  {
    id: 'audit-hist-2603-1',
    timestamp: 'Senin, 02 Mar 2026 08:30',
    isoTimestamp: '2026-03-02T08:30:00.000Z',
    module: 'S-SALUR',
    recordId: 'CC 260302001',
    recordTitle: 'Kampanye Akbar Salur 10.000 Buku',
    actionType: 'Tambah',
    field: 'Penerbitan Surat Tugas Salur',
    oldValue: '-',
    newValue: 'Batch 1 Diluncurkan (1.200 Paket)',
    alasan: 'Pembukaan kampanye nasional distribusi Lamrim',
    author: 'Ketua Tim Salur',
  },
  {
    id: 'audit-hist-2603-2',
    timestamp: 'Rabu, 04 Mar 2026 11:15',
    isoTimestamp: '2026-03-04T11:15:00.000Z',
    module: 'S-SALUR',
    recordId: 'CC 260304015',
    recordTitle: 'Distribusi Wilayah Medan & Batam',
    actionType: 'Pengiriman',
    field: 'Ekspedisi Massal',
    oldValue: 'Siap Kirim',
    newValue: 'Kargo Udara Lion 540 Koli',
    alasan: 'Pengiriman batch literatur ke Sumatera',
    author: 'Logistik Pusat',
  },
  {
    id: 'audit-hist-2603-3',
    timestamp: 'Sabtu, 07 Mar 2026 14:00',
    isoTimestamp: '2026-03-07T14:00:00.000Z',
    module: 'DONASI',
    recordId: 'DN 260307089',
    recordTitle: 'Sponsor Cetak Buku Lamrim Chenmo',
    actionType: 'Status Bayar',
    field: 'Penerimaan Dana Sponsorship',
    oldValue: 'Pledge (Komitmen)',
    newValue: 'Penerimaan Bank Mandiri Rp75.000.000',
    alasan: 'Dana cetak dari kelompok donatur Surabaya',
    author: 'Bendahara Yayasan',
  },
  {
    id: 'audit-hist-2603-4',
    timestamp: 'Selasa, 10 Mar 2026 09:40',
    isoTimestamp: '2026-03-10T09:40:00.000Z',
    module: 'IDENTITAS',
    recordId: '00031',
    recordTitle: 'Agustino Ong',
    actionType: 'Ubah',
    field: 'Alamat Kantor Pengiriman',
    oldValue: 'Komp. Ruko Roxy Mas Blok D',
    newValue: 'Komp. Ruko Roxy Mas Blok E No. 12',
    alasan: 'Penyesuaian alamat kirim pesanan kampanye',
    author: 'Admin Identitas',
  },
  {
    id: 'audit-hist-2603-5',
    timestamp: 'Kamis, 12 Mar 2026 16:50',
    isoTimestamp: '2026-03-12T16:50:00.000Z',
    module: 'IDENTITAS',
    recordId: '00045',
    recordTitle: 'Sucek Shi Xian Jen',
    actionType: 'Ubah',
    field: 'Email Korespondensi',
    oldValue: 'sucek@gmail.com',
    newValue: 'shixianjen@lamrim.or.id',
    alasan: 'Migrasi ke email resmi yayasan',
    author: 'Admin Identitas',
  },
  {
    id: 'audit-hist-2603-6',
    timestamp: 'Senin, 16 Mar 2026 13:20',
    isoTimestamp: '2026-03-16T13:20:00.000Z',
    module: 'AJAR',
    recordId: 'AJAR-2603-044',
    recordTitle: 'Workshop Intensif Penyaluran Dharma',
    actionType: 'Tambah',
    field: 'Modul Pelatihan Khusus',
    oldValue: '-',
    newValue: 'Sertifikasi 60 Duta Salur',
    alasan: 'Pelatihan duta literatur daerah',
    author: 'Kepala Divisi Ajar',
  },
  {
    id: 'audit-hist-2603-7',
    timestamp: 'Jumat, 20 Mar 2026 17:00',
    isoTimestamp: '2026-03-20T17:00:00.000Z',
    module: 'DONASI',
    recordId: 'DN 260320112',
    recordTitle: 'Dana Operasional Truk Ekspedisi',
    actionType: 'Status Bayar',
    field: 'Pembayaran Vendor Ekspedisi',
    oldValue: 'Tagihan Masuk',
    newValue: 'Lunas Giro BCA Rp18.500.000',
    alasan: 'Biaya logistik 12 kota di Pulau Jawa',
    author: 'Finance Admin',
  },
  {
    id: 'audit-hist-2603-8',
    timestamp: 'Selasa, 24 Mar 2026 11:30',
    isoTimestamp: '2026-03-24T11:30:00.000Z',
    module: 'S-SALUR',
    recordId: 'CC 260324098',
    recordTitle: 'Pusat Meditasi Bali',
    actionType: 'Resi',
    field: 'Resi Ekspedisi Cargo',
    oldValue: 'Menunggu Muatan',
    newValue: 'Dakota Cargo DKT-8891002 (30 Karton)',
    alasan: 'Pengiriman buku panduan retret',
    author: 'Admin Salur',
  },

  // Apr 2026: Rekonsiliasi & Stabilisasi (18 mutasi)
  {
    id: 'audit-hist-2604-1',
    timestamp: 'Senin, 06 Apr 2026 10:00',
    isoTimestamp: '2026-04-06T10:00:00.000Z',
    module: 'S-SALUR',
    recordId: 'CC 260406002',
    recordTitle: 'Rekonsiliasi Sisa Stok Kampanye',
    actionType: 'Ubah',
    field: 'Status Inventaris',
    oldValue: 'Distribusi Berjalan',
    newValue: 'Tutup Buku Salur (Sisa 120 Eksemplar)',
    alasan: 'Opname fisik inventaris gudang',
    author: 'Kepala Gudang',
  },
  {
    id: 'audit-hist-2604-2',
    timestamp: 'Kamis, 16 Apr 2026 14:15',
    isoTimestamp: '2026-04-16T14:15:00.000Z',
    module: 'DONASI',
    recordId: 'DN 260416009',
    recordTitle: 'Laporan Donatur Kampanye',
    actionType: 'Ubah',
    field: 'Laporan Pertanggungjawaban',
    oldValue: 'Draft',
    newValue: 'Selesai & Dikirim ke 180 Donatur',
    alasan: 'Pelaporan transparansi dana donatur',
    author: 'CRM Donasi',
  },

  // Mei 2026: LONJAKAN SEKUNDER (WAISAK & RETRET - 35 mutasi)
  {
    id: 'audit-hist-2605-1',
    timestamp: 'Senin, 04 Mei 2026 09:15',
    isoTimestamp: '2026-05-04T09:15:00.000Z',
    module: 'DONASI',
    recordId: 'DN 260504001',
    recordTitle: 'Dana Perayaan Trisuci Waisak 2570',
    actionType: 'Tambah',
    field: 'Donasi Program Terikat',
    oldValue: '-',
    newValue: 'Penerimaan Donasi Rp32.000.000',
    alasan: 'Penerimaan dana perayaan Waisak bersama',
    author: 'Panitia Waisak',
  },
  {
    id: 'audit-hist-2605-2',
    timestamp: 'Jumat, 08 Mei 2026 15:30',
    isoTimestamp: '2026-05-08T15:30:00.000Z',
    module: 'S-SALUR',
    recordId: 'POS 260508090',
    recordTitle: 'Stand Bazar Waisak JIExpo',
    actionType: 'Tambah',
    field: 'Penyaluran Buku Cenderamata',
    oldValue: '-',
    newValue: '350 Buku Terdistribusi',
    alasan: 'Stand penyaluran buku di arena perayaan Waisak',
    author: 'Koordinator Stand',
  },
  {
    id: 'audit-hist-2605-3',
    timestamp: 'Rabu, 13 Mei 2026 11:00',
    isoTimestamp: '2026-05-13T11:00:00.000Z',
    module: 'AJAR',
    recordId: 'AJAR-2605-020',
    recordTitle: 'Retret Meditasi Vipassana Waisak',
    actionType: 'Status Bayar',
    field: 'Biaya Partisipasi Retret',
    oldValue: 'Pending',
    newValue: 'Lunas 75 Peserta',
    alasan: 'Verifikasi pelunasan retret 4 hari 3 malam',
    author: 'Registrasi Retret',
  },
  {
    id: 'audit-hist-2605-4',
    timestamp: 'Selasa, 19 Mei 2026 16:40',
    isoTimestamp: '2026-05-19T16:40:00.000Z',
    module: 'IDENTITAS',
    recordId: '00052',
    recordTitle: 'Rina Wijaya',
    actionType: 'Tambah',
    field: 'Pendaftaran Relawan Baru',
    oldValue: '-',
    newValue: 'Relawan Meditasi & Konseling',
    alasan: 'Perekrutan alumni retret Waisak',
    author: 'Admin Relawan',
  },

  // Jun 2026 - Okt 2026: Aktivitas Operasional Reguler
  {
    id: 'audit-hist-2606-1',
    timestamp: 'Senin, 15 Jun 2026 10:30',
    isoTimestamp: '2026-06-15T10:30:00.000Z',
    module: 'AJAR',
    recordId: 'AJAR-2606-004',
    recordTitle: 'Wisuda Kelas Dharma Angkatan 18',
    actionType: 'Ubah',
    field: 'Status Kelulusan',
    oldValue: 'Ujian Akhir',
    newValue: 'Yudisium 40 Wisudawan',
    alasan: 'Pelaksanaan wisuda semester genap',
    author: 'Sekretariat Akademik',
  },
  {
    id: 'audit-hist-2607-1',
    timestamp: 'Selasa, 14 Jul 2026 09:20',
    isoTimestamp: '2026-07-14T09:20:00.000Z',
    module: 'DONASI',
    recordId: 'DP 260714002',
    recordTitle: 'Perpanjangan Paket Patron 2026/2027',
    actionType: 'Status Bayar',
    field: 'Perpanjangan Mandiri',
    oldValue: 'Masa Aktif Berakhir',
    newValue: 'Diperpanjang 12 Bulan (Rp3.000.000)',
    alasan: 'Renewal autodebet donatur tetap',
    author: 'CRM Patron',
  },
  {
    id: 'audit-hist-2608-1',
    timestamp: 'Kamis, 20 Agu 2026 14:10',
    isoTimestamp: '2026-08-20T14:10:00.000Z',
    module: 'DONASI',
    recordId: 'DN 260820018',
    recordTitle: 'Pelimpahan Jasa Bulan Ulambana',
    actionType: 'Tambah',
    field: 'Donasi Pattidana',
    oldValue: '-',
    newValue: 'Penerimaan Donasi Rp16.500.000',
    alasan: 'Pelimpahan jasa leluhur festival hantu lapar',
    author: 'Sekretariat Vihara',
  },
  {
    id: 'audit-hist-2609-1',
    timestamp: 'Jumat, 11 Sep 2026 11:45',
    isoTimestamp: '2026-09-11T11:45:00.000Z',
    module: 'S-SALUR',
    recordId: 'CC 260911005',
    recordTitle: 'Pengiriman Cetakan Baru Lamrim Ringkas',
    actionType: 'Pengiriman',
    field: 'Resi SiCepat Cargo',
    oldValue: 'Proses Cetak',
    newValue: 'SC-9900124 (250 Buku)',
    alasan: 'Restock buku saku ke Surabaya',
    author: 'Admin Salur',
  },
  {
    id: 'audit-hist-2610-1',
    timestamp: 'Senin, 19 Okt 2026 10:15',
    isoTimestamp: '2026-10-19T10:15:00.000Z',
    module: 'DONASI',
    recordId: 'DN 261019033',
    recordTitle: 'Dana Jubah Sangha Masa Kathina',
    actionType: 'Status Bayar',
    field: 'Persembahan Kathina',
    oldValue: 'Belum Bayar',
    newValue: 'Lunas BCA Rp25.000.000',
    alasan: 'Persembahan dana jubah 4 vihara binaan',
    author: 'Bendahara Kathina',
  },

  // Nov 2026: Bulan Berjalan (Termasuk Kasus Anomali Identitas Terdeteksi)
  {
    id: 'audit-hist-2611-1',
    timestamp: 'Senin, 02 Nov 2026 09:30',
    isoTimestamp: '2026-11-02T09:30:00.000Z',
    module: 'S-SALUR',
    recordId: 'CC 261102001',
    recordTitle: 'Pemesanan Kalender & Buku 2027',
    actionType: 'Tambah',
    field: 'Pre-Order Cetak',
    oldValue: '-',
    newValue: 'PO 5.000 Eksemplar Kalender Meja',
    alasan: 'Pengajuan cetak cenderamata akhir tahun',
    author: 'Produksi Salur',
  },
  {
    id: 'audit-hist-2611-2',
    timestamp: 'Rabu, 04 Nov 2026 14:00',
    isoTimestamp: '2026-11-04T14:00:00.000Z',
    module: 'AJAR',
    recordId: 'AJAR-2611-008',
    recordTitle: 'Persiapan Ujian Evaluasi Akhir 2026',
    actionType: 'Ubah',
    field: 'Jadwal Ujian',
    oldValue: 'Desember Minggu 1',
    newValue: 'Desember Minggu 2 (Serentak Online)',
    alasan: 'Sinkronisasi libur nasional',
    author: 'Tim Akademik',
  },
  {
    id: 'audit-hist-2611-3',
    timestamp: 'Jumat, 06 Nov 2026 11:20',
    isoTimestamp: '2026-11-06T11:20:00.000Z',
    module: 'DONASI',
    recordId: 'DP 261106004',
    recordTitle: 'Dharma Patron Rutin November',
    actionType: 'Status Bayar',
    field: 'Debet Bulanan BCA',
    oldValue: 'Scheduled',
    newValue: 'Success Debit Rp500.000',
    alasan: 'Laporan autodebet berkala bank',
    author: 'Sistem Autodebet',
  },
];

/**
 * Load central audit logs from localStorage or fallback to initial preset logs
 */
export function loadCentralAuditLogs(): CentralAuditLogEntry[] {
  try {
    const saved = localStorage.getItem(CENTRAL_AUDIT_LOGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge missing initial baseline seeds if any
        const existingIds = new Set(parsed.map((p: any) => p.id));
        const missing = INITIAL_CENTRAL_AUDIT_LOGS.filter((init) => !existingIds.has(init.id));
        if (missing.length > 0) {
          return [...parsed, ...missing];
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load central audit logs from localStorage', e);
  }
  return INITIAL_CENTRAL_AUDIT_LOGS;
}

/**
 * Save central audit logs to localStorage
 */
export function saveCentralAuditLogs(logs: CentralAuditLogEntry[]): void {
  try {
    localStorage.setItem(CENTRAL_AUDIT_LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save central audit logs to localStorage', e);
  }
}

export type AuditEventPayload = Omit<CentralAuditLogEntry, 'id' | 'timestamp' | 'isoTimestamp'> & {
  id?: string;
  timestamp?: string;
  isoTimestamp?: string;
};

/**
 * Dispatches an audit event to all registered listeners across the app
 */
export function dispatchAuditEvent(payload: AuditEventPayload): CentralAuditLogEntry {
  const now = new Date();
  const entry: CentralAuditLogEntry = {
    id: payload.id || `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: payload.timestamp || formatAuditTimestamp(now),
    isoTimestamp: payload.isoTimestamp || now.toISOString(),
    module: payload.module,
    recordId: payload.recordId || '-',
    recordTitle: payload.recordTitle || 'Record',
    actionType: payload.actionType || 'Ubah',
    field: payload.field || 'General',
    oldValue: payload.oldValue || '-',
    newValue: payload.newValue || '-',
    alasan: payload.alasan || 'Pencatatan otomatis oleh sistem',
    author: payload.author || 'Admin / Sistem',
    badgeColor: payload.badgeColor,
    metadata: payload.metadata,
  };

  // Dispatch custom window event
  try {
    if (typeof window !== 'undefined') {
      const customEvent = new CustomEvent(AUDIT_LOG_EVENT_NAME, {
        detail: entry,
      });
      window.dispatchEvent(customEvent);
    }
  } catch (e) {
    console.error('Failed to dispatch audit event', e);
  }

  // Also auto-append to localStorage for resilience
  try {
    const current = loadCentralAuditLogs();
    const updated = [entry, ...current.filter((c) => c.id !== entry.id)];
    saveCentralAuditLogs(updated);
  } catch (e) {
    console.error('Failed to auto-save audit event to storage', e);
  }

  return entry;
}

/**
 * Subscribes to audit events dispatched throughout the app
 */
export function subscribeAuditEvent(
  handler: (entry: CentralAuditLogEntry) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<CentralAuditLogEntry>;
    if (customEvent.detail) {
      handler(customEvent.detail);
    }
  };

  window.addEventListener(AUDIT_LOG_EVENT_NAME, listener);
  return () => {
    window.removeEventListener(AUDIT_LOG_EVENT_NAME, listener);
  };
}

/**
 * Automated deep-diff detector for S-SALUR orders
 */
export function auditDiffSalurOrders(
  oldOrders: SalurOrder[],
  newOrders: SalurOrder[],
  author: string = 'Admin Salur'
): CentralAuditLogEntry[] {
  const generated: CentralAuditLogEntry[] = [];
  const oldMap = new Map(oldOrders.map((o) => [o.id || o.orderNumber, o]));
  const newMap = new Map(newOrders.map((o) => [o.id || o.orderNumber, o]));

  // Check new orders
  newOrders.forEach((newOrd) => {
    const key = newOrd.id || newOrd.orderNumber;
    const oldOrd = oldMap.get(key);

    if (!oldOrd) {
      // New order created
      const title = `${newOrd.customerId || 'Customer'} - ${newOrd.items?.[0]?.title || 'Order'}`;
      const ev = dispatchAuditEvent({
        module: 'S-SALUR',
        recordId: newOrd.orderNumber || newOrd.id,
        recordTitle: title,
        actionType: 'Tambah',
        field: 'Transaksi Pesanan Baru',
        oldValue: '-',
        newValue: `${newOrd.items?.length || 0} item (${newOrd.totalDana || 'Rp0'})`,
        alasan: 'Input transaksi pesanan baru S-SALUR',
        author,
      });
      generated.push(ev);
    } else {
      // Check crucial field modifications
      const title = `${newOrd.customerId || oldOrd.customerId || 'Customer'}`;

      // 1. Payment status changed
      if (oldOrd.paymentStatus !== newOrd.paymentStatus) {
        const ev = dispatchAuditEvent({
          module: 'S-SALUR',
          recordId: newOrd.orderNumber,
          recordTitle: title,
          actionType: 'Status Bayar',
          field: 'Status Pembayaran',
          oldValue: oldOrd.paymentStatus || 'Belum Bayar',
          newValue: newOrd.paymentStatus || 'Paid',
          alasan: `Perubahan status bayar pesanan #${newOrd.orderNumber}`,
          author,
        });
        generated.push(ev);
      }

      // 2. Shipping status or tracking resi changed
      const oldResi = oldOrd.ekspedisi?.noResi || '-';
      const newResi = newOrd.ekspedisi?.noResi || '-';
      if (oldOrd.shippingStatus !== newOrd.shippingStatus || oldResi !== newResi) {
        const ev = dispatchAuditEvent({
          module: 'S-SALUR',
          recordId: newOrd.orderNumber,
          recordTitle: title,
          actionType: 'Pengiriman',
          field: 'Status & Resi Pengiriman',
          oldValue: `${oldOrd.shippingStatus || 'Belum dikirim'} (${oldResi})`,
          newValue: `${newOrd.shippingStatus || 'Sudah Dikirim'} (${newResi})`,
          alasan: `Update logistik pengiriman #${newOrd.orderNumber}`,
          author,
        });
        generated.push(ev);
      }

      // 3. Dana or items changed
      if (oldOrd.totalDana !== newOrd.totalDana && oldOrd.totalDana && newOrd.totalDana) {
        const ev = dispatchAuditEvent({
          module: 'S-SALUR',
          recordId: newOrd.orderNumber,
          recordTitle: title,
          actionType: 'Ubah',
          field: 'Total Nominal Pesanan',
          oldValue: oldOrd.totalDana,
          newValue: newOrd.totalDana,
          alasan: `Penyesuaian nilai transaksi pesanan #${newOrd.orderNumber}`,
          author,
        });
        generated.push(ev);
      }
    }
  });

  // Check deleted orders
  oldOrders.forEach((oldOrd) => {
    const key = oldOrd.id || oldOrd.orderNumber;
    if (!newMap.has(key)) {
      const ev = dispatchAuditEvent({
        module: 'S-SALUR',
        recordId: oldOrd.orderNumber || oldOrd.id,
        recordTitle: `${oldOrd.customerId || 'Customer'}`,
        actionType: 'Hapus',
        field: 'Transaksi Pesanan',
        oldValue: `Order #${oldOrd.orderNumber} (${oldOrd.totalDana || 'Rp0'})`,
        newValue: '(Dihapus / Dibatalkan)',
        alasan: 'Penghapusan data transaksi pesanan S-SALUR',
        author,
      });
      generated.push(ev);
    }
  });

  return generated;
}

/**
 * Automated deep-diff detector for D-DONASI orders
 */
export function auditDiffDonasiOrders(
  oldOrders: DonasiOrder[],
  newOrders: DonasiOrder[],
  author: string = 'Admin Donasi'
): CentralAuditLogEntry[] {
  const generated: CentralAuditLogEntry[] = [];
  const oldMap = new Map(oldOrders.map((o) => [o.id || o.orderNumber, o]));
  const newMap = new Map(newOrders.map((o) => [o.id || o.orderNumber, o]));

  newOrders.forEach((newOrd) => {
    const key = newOrd.id || newOrd.orderNumber;
    const oldOrd = oldMap.get(key);
    const donorName = newOrd.namaDonatur?.name || newOrd.customerId || 'Donatur';

    if (!oldOrd) {
      const itemDesc = newOrd.items?.[0]?.name || newOrd.keterangan?.title || 'Donasi';
      const ev = dispatchAuditEvent({
        module: 'DONASI',
        recordId: newOrd.orderNumber || newOrd.id,
        recordTitle: `${donorName} (${itemDesc})`,
        actionType: 'Tambah',
        field: 'Pencatatan Donasi Baru',
        oldValue: '-',
        newValue: `${newOrd.items?.[0]?.qtyPrice || 'Donasi Terdaftar'}`,
        alasan: 'Pencatatan transaksi donasi baru ke sistem',
        author,
      });
      generated.push(ev);
    } else {
      // Check status bayar
      const oldStatus = oldOrd.statusBadges?.[0] || 'Paid';
      const newStatus = newOrd.statusBadges?.[0] || 'Paid';
      if (oldStatus !== newStatus) {
        const ev = dispatchAuditEvent({
          module: 'DONASI',
          recordId: newOrd.orderNumber || newOrd.id,
          recordTitle: donorName,
          actionType: 'Status Bayar',
          field: 'Status Pembayaran Donasi',
          oldValue: oldStatus,
          newValue: newStatus,
          alasan: `Perubahan status penerimaan donasi #${newOrd.orderNumber}`,
          author,
        });
        generated.push(ev);
      }

      // Check item / nominal
      const oldPrice = oldOrd.items?.[0]?.qtyPrice;
      const newPrice = newOrd.items?.[0]?.qtyPrice;
      if (oldPrice && newPrice && oldPrice !== newPrice) {
        const ev = dispatchAuditEvent({
          module: 'DONASI',
          recordId: newOrd.orderNumber || newOrd.id,
          recordTitle: donorName,
          actionType: 'Ubah',
          field: 'Nominal Donasi',
          oldValue: oldPrice,
          newValue: newPrice,
          alasan: `Penyesuaian nilai donasi #${newOrd.orderNumber}`,
          author,
        });
        generated.push(ev);
      }
    }
  });

  oldOrders.forEach((oldOrd) => {
    const key = oldOrd.id || oldOrd.orderNumber;
    if (!newMap.has(key)) {
      const donorName = oldOrd.namaDonatur?.name || oldOrd.customerId || 'Donatur';
      const ev = dispatchAuditEvent({
        module: 'DONASI',
        recordId: oldOrd.orderNumber || oldOrd.id,
        recordTitle: donorName,
        actionType: 'Hapus',
        field: 'Transaksi Donasi',
        oldValue: `Donasi #${oldOrd.orderNumber}`,
        newValue: '(Dihapus)',
        alasan: 'Penghapusan transaksi donasi',
        author,
      });
      generated.push(ev);
    }
  });

  return generated;
}

/**
 * Automated deep-diff detector for A-AJAR transactions
 */
export function auditDiffTransaksiAjar(
  oldItems: TransaksiAjarItem[],
  newItems: TransaksiAjarItem[],
  author: string = 'Admin Ajar'
): CentralAuditLogEntry[] {
  const generated: CentralAuditLogEntry[] = [];
  const oldMap = new Map(oldItems.map((a) => [a.id || a.orderNumber, a]));
  const newMap = new Map(newItems.map((a) => [a.id || a.orderNumber, a]));

  newItems.forEach((newIt) => {
    const key = newIt.id || newIt.orderNumber;
    const oldIt = oldMap.get(key);
    const participant = newIt.customerId || newIt.recipients?.[0] || 'Peserta';
    const txId = newIt.orderNumber || newIt.kodeTransaksi || newIt.id;

    if (!oldIt) {
      const ev = dispatchAuditEvent({
        module: 'AJAR',
        recordId: txId,
        recordTitle: `${participant} (${newIt.eventName || 'A-AJAR'})`,
        actionType: 'Tambah',
        field: 'Pendaftaran Peserta Baru',
        oldValue: '-',
        newValue: `${newIt.itemName || 'Program Ajar'} (${newIt.totalDana || 'Rp0'})`,
        alasan: 'Pendaftaran dan input transaksi A-AJAR baru',
        author,
      });
      generated.push(ev);
    } else {
      // Check status bayar
      const oldStatus = oldIt.statusBadges?.[0] || 'Paid';
      const newStatus = newIt.statusBadges?.[0] || 'Paid';
      if (oldStatus !== newStatus) {
        const ev = dispatchAuditEvent({
          module: 'AJAR',
          recordId: txId,
          recordTitle: participant,
          actionType: 'Status Bayar',
          field: 'Status Pembayaran Kursus',
          oldValue: oldStatus,
          newValue: newStatus,
          alasan: `Perubahan status bayar transaksi A-AJAR #${txId}`,
          author,
        });
        generated.push(ev);
      }

      // Check totalDana
      if (oldIt.totalDana !== newIt.totalDana && oldIt.totalDana && newIt.totalDana) {
        const ev = dispatchAuditEvent({
          module: 'AJAR',
          recordId: txId,
          recordTitle: participant,
          actionType: 'Ubah',
          field: 'Total Dana / Biaya A-AJAR',
          oldValue: String(oldIt.totalDana),
          newValue: String(newIt.totalDana),
          alasan: `Penyesuaian biaya transaksi #${txId}`,
          author,
        });
        generated.push(ev);
      }

      // Check eventName
      if (oldIt.eventName !== newIt.eventName && newIt.eventName) {
        const ev = dispatchAuditEvent({
          module: 'AJAR',
          recordId: txId,
          recordTitle: participant,
          actionType: 'Ubah',
          field: 'Program / Acara Ajar',
          oldValue: oldIt.eventName || '-',
          newValue: newIt.eventName,
          alasan: `Pindah kelas/program acara #${txId}`,
          author,
        });
        generated.push(ev);
      }
    }
  });

  oldItems.forEach((oldIt) => {
    const key = oldIt.id || oldIt.orderNumber;
    if (!newMap.has(key)) {
      const participant = oldIt.customerId || oldIt.recipients?.[0] || 'Peserta';
      const txId = oldIt.orderNumber || oldIt.kodeTransaksi || oldIt.id;
      const ev = dispatchAuditEvent({
        module: 'AJAR',
        recordId: txId,
        recordTitle: participant,
        actionType: 'Hapus',
        field: 'Transaksi Ajar',
        oldValue: `Transaksi #${txId}`,
        newValue: '(Dihapus)',
        alasan: 'Penghapusan transaksi A-AJAR',
        author,
      });
      generated.push(ev);
    }
  });

  return generated;
}
