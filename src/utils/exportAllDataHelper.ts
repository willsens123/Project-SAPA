/**
 * Helper utility to export all application state into a single, downloadable
 * JSON or CSV archive file for data backup and disaster recovery.
 */

export interface ExportMetadata {
  appName: string;
  appDescription: string;
  version: string;
  exportedAt: string;
  exportedAtFormatted: string;
  exportedBy: string;
  environment: string;
  counts: Record<string, number>;
  totalRecords: number;
}

export interface AllApplicationData {
  metadata: ExportMetadata;
  projects: any[];
  jenisProyek: any[];
  identitas: any[];
  identitasChangeLogs: any[];
  organisasi: any[];
  mutasiBank: any[];
  transaksiSalur: any[];
  salurItems: any[];
  transaksiDonasi: any[];
  transaksiAjar: any[];
  pengeluaran: any[];
  posKeuangan: any[];
  coaAccounts: any[];
  dharmaPatronRutin: any[];
  karyawan: any[];
  cutiKaryawan: any[];
  kumpulanRekening: any[];
  rekeningList: any[];
  kebutuhanPengeluaran: any[];
  posPengeluaran: any[];
  posPemasukan: any[];
  todoTasks: Record<string, any[]>;
  complaints: any[];
  quickReplies: any[];
  faqs: any[];
  listPM: any[];
  volunteersSSebar: any[];
  volunteersAJar: any[];
}

export interface BuildAllDataParams {
  currentUser?: { namaLengkap?: string; email?: string } | null;
  projects?: any[];
  jenisProyekList?: any[];
  identitasList?: any[];
  changeLogs?: any[];
  organisasiList?: any[];
  mutasiItems?: any[];
  salurOrders?: any[];
  salurItems?: any[];
  donasiOrders?: any[];
  transaksiAjarList?: any[];
  pengeluaranList?: any[];
  posKeuanganList?: any[];
  coaList?: any[];
  dharmaPatronList?: any[];
  karyawanList?: any[];
  cutiKaryawanList?: any[];
  kumpulanRekeningList?: any[];
  rekeningList?: any[];
  kebutuhanPengeluaranList?: any[];
  posPengeluaranList?: any[];
  posPemasukanList?: any[];
  todoTasks?: Record<string, any[]>;
  complaints?: any[];
  quickReplyList?: any[];
  faqList?: any[];
  listPMList?: any[];
  volunteerSSebarList?: any[];
  volunteerAJarList?: any[];
}

/**
 * Builds the unified application state backup object
 */
export function buildAllApplicationData(params: BuildAllDataParams): AllApplicationData {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const formattedDate = `${now.getDate()} ${
    ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][now.getMonth()]
  } ${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} WIB`;

  const counts: Record<string, number> = {
    projects: params.projects?.length || 0,
    jenisProyek: params.jenisProyekList?.length || 0,
    identitas: params.identitasList?.length || 0,
    organisasi: params.organisasiList?.length || 0,
    mutasiBank: params.mutasiItems?.length || 0,
    transaksiSalur: params.salurOrders?.length || 0,
    salurItems: params.salurItems?.length || 0,
    transaksiDonasi: params.donasiOrders?.length || 0,
    transaksiAjar: params.transaksiAjarList?.length || 0,
    pengeluaran: params.pengeluaranList?.length || 0,
    posKeuangan: params.posKeuanganList?.length || 0,
    coaAccounts: params.coaList?.length || 0,
    dharmaPatronRutin: params.dharmaPatronList?.length || 0,
    karyawan: params.karyawanList?.length || 0,
    cutiKaryawan: params.cutiKaryawanList?.length || 0,
    kumpulanRekening: params.kumpulanRekeningList?.length || 0,
    rekeningList: params.rekeningList?.length || 0,
    todoTasks: Object.values(params.todoTasks || {}).reduce((acc, tasks) => acc + (tasks?.length || 0), 0),
    complaints: params.complaints?.length || 0,
    quickReplies: params.quickReplyList?.length || 0,
    faqs: params.faqList?.length || 0,
    listPM: params.listPMList?.length || 0,
  };

  const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);

  const metadata: ExportMetadata = {
    appName: 'Remix Proyek SAPA - ERP YPPLN',
    appDescription: 'Sistem Manajemen Proyek SAPA, Keuangan, Mutasi Bank, dan Operasional Yayasan',
    version: '2.5.0-cloud-sync',
    exportedAt: now.toISOString(),
    exportedAtFormatted: formattedDate,
    exportedBy: params.currentUser?.namaLengkap || 'Admin YPPLN',
    environment: typeof window !== 'undefined' ? window.location.hostname : 'production',
    counts,
    totalRecords,
  };

  return {
    metadata,
    projects: params.projects || [],
    jenisProyek: params.jenisProyekList || [],
    identitas: params.identitasList || [],
    identitasChangeLogs: params.changeLogs || [],
    organisasi: params.organisasiList || [],
    mutasiBank: params.mutasiItems || [],
    transaksiSalur: params.salurOrders || [],
    salurItems: params.salurItems || [],
    transaksiDonasi: params.donasiOrders || [],
    transaksiAjar: params.transaksiAjarList || [],
    pengeluaran: params.pengeluaranList || [],
    posKeuangan: params.posKeuanganList || [],
    coaAccounts: params.coaList || [],
    dharmaPatronRutin: params.dharmaPatronList || [],
    karyawan: params.karyawanList || [],
    cutiKaryawan: params.cutiKaryawanList || [],
    kumpulanRekening: params.kumpulanRekeningList || [],
    rekeningList: params.rekeningList || [],
    kebutuhanPengeluaran: params.kebutuhanPengeluaranList || [],
    posPengeluaran: params.posPengeluaranList || [],
    posPemasukan: params.posPemasukanList || [],
    todoTasks: params.todoTasks || {},
    complaints: params.complaints || [],
    quickReplies: params.quickReplyList || [],
    faqs: params.faqList || [],
    listPM: params.listPMList || [],
    volunteersSSebar: params.volunteerSSebarList || [],
    volunteersAJar: params.volunteerAJarList || [],
  };
}

/**
 * Escape cell value for CSV formatting
 */
function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  if (typeof val === 'object') {
    val = JSON.stringify(val);
  }
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Generates structured, consolidated CSV archive containing all core tables
 */
export function generateConsolidatedCsv(backup: AllApplicationData): string {
  const lines: string[] = [];

  // UTF-8 BOM for Microsoft Excel / Google Sheets compatibility
  lines.push('\uFEFF');

  // 1. Header Metadata Section
  lines.push('=== METADATA CADANGAN DATA YPPLN ERP ===');
  lines.push(`Aplikasi,${escapeCsv(backup.metadata.appName)}`);
  lines.push(`Waktu Ekspor,${escapeCsv(backup.metadata.exportedAtFormatted)}`);
  lines.push(`Waktu ISO,${escapeCsv(backup.metadata.exportedAt)}`);
  lines.push(`Diekspor Oleh,${escapeCsv(backup.metadata.exportedBy)}`);
  lines.push(`Total Semua Entri,${backup.metadata.totalRecords}`);
  lines.push('');

  // Helper to append a table section
  const appendSection = (title: string, headers: string[], rows: (string | number)[][]) => {
    lines.push(`=== ${title} (Total: ${rows.length}) ===`);
    lines.push(headers.map(escapeCsv).join(','));
    rows.forEach((r) => {
      lines.push(r.map(escapeCsv).join(','));
    });
    lines.push('');
  };

  // 2. Proyek SAPA
  appendSection(
    'TABEL PROYEK SAPA',
    ['ID', 'Tanggal', 'Date Range', 'Nama Kegiatan', 'Jenis Proyek', 'Divisi', 'Lokasi', 'Status', 'Catatan'],
    (backup.projects || []).map((p) => [
      p.id || '',
      p.tanggal || '',
      p.dateRangePersiapan || '',
      p.namaKegiatan || '',
      p.jenisProyek || '',
      p.divisi || '',
      p.lokasi || '',
      p.status || '',
      p.catatan || '',
    ])
  );

  // 3. Identitas Relawan & Donatur
  appendSection(
    'TABEL IDENTITAS RELAWAN & DONATUR',
    ['ID', 'Code ID', 'Nama Lengkap', 'Nama Panggilan', 'Gender', 'No HP', 'Email', 'Kota', 'Provinsi', 'Organisasi', 'Status', 'PIC', 'Agama'],
    (backup.identitas || []).map((i) => [
      i.id || '',
      i.codeId || '',
      i.namaLengkap || '',
      i.namaPanggilan || '',
      i.jenisKelamin || '',
      i.nomorHandPhone || '',
      i.email || '',
      i.kota || '',
      i.provinsi || '',
      i.organisasi || '',
      i.status || '',
      i.pic || '',
      i.agama || '',
    ])
  );

  // 4. Mutasi Bank
  appendSection(
    'TABEL MUTASI BANK',
    ['ID Mutasi', 'Tanggal', 'Keterangan Bank', 'Tipe (CR/DB)', 'Nominal (Rp)', 'Akun Bank', 'Saldo (Rp)', 'Status Rekonsiliasi'],
    (backup.mutasiBank || []).map((m) => [
      m.id || '',
      m.date || '',
      m.keteranganBank || '',
      m.type || '',
      m.amount || 0,
      m.bankAccount || '',
      m.balance || 0,
      m.statusReconciled ? 'Reconciled' : 'Pending',
    ])
  );

  // 5. Transaksi S-SALUR
  appendSection(
    'TABEL TRANSAKSI S-SALUR',
    ['ID Order', 'No Order', 'Tanggal', 'Customer / ID', 'Penerima', 'Alamat Lengkap', 'Kota', 'Total Dana (Rp)', 'Via', 'Status Order'],
    (backup.transaksiSalur || []).map((s) => [
      s.id || '',
      s.orderNumber || '',
      s.date || '',
      `${s.customerId || ''} - ${s.customerName || ''}`,
      s.alamat?.namaPenerima || '',
      s.alamat?.alamat || '',
      s.alamat?.kotaKabupaten || '',
      s.totalDana || '',
      s.via || '',
      s.statusTransaksi || s.statusBadge || 'Done',
    ])
  );

  // 6. Transaksi D-DONASI
  appendSection(
    'TABEL TRANSAKSI D-DONASI',
    ['ID Order', 'No Order', 'Tanggal', 'Donatur', 'Keterangan / Program', 'Total Dana (Rp)', 'Via', 'Status'],
    (backup.transaksiDonasi || []).map((d) => [
      d.id || '',
      d.orderNumber || '',
      d.date || '',
      `${d.customerId || ''} - ${d.customerName || ''}`,
      d.keterangan?.title || '',
      d.totalDana || '',
      d.via || '',
      d.statusTransaksi || 'Done',
    ])
  );

  // 7. Transaksi A-AJAR
  appendSection(
    'TABEL TRANSAKSI A-AJAR',
    ['ID Transaksi', 'Kode', 'Tanggal', 'Nama Peserta', 'No HP', 'Acara / Event', 'Item / Tiket', 'Total Dana (Rp)', 'Status'],
    (backup.transaksiAjar || []).map((a) => [
      a.id || '',
      a.kodeTransaksi || '',
      a.date || a.tanggal || '',
      a.nama || '',
      a.noHp || '',
      a.eventName || '',
      a.itemName || '',
      a.totalDana || a.nominal || 0,
      a.statusBayar || 'Lunas',
    ])
  );

  // 8. Pengeluaran Kas
  appendSection(
    'TABEL PENGELUARAN KAS',
    ['ID', 'No Pengeluaran', 'Tanggal', 'Divisi', 'Kebutuhan', 'Keterangan', 'Nominal (Rp)', 'Pos Keluar / Rekening', 'Proyek SAPA'],
    (backup.pengeluaran || []).map((p) => [
      p.id || '',
      p.no || '',
      p.tanggal || '',
      p.divisi || '',
      p.kebutuhan || '',
      p.keterangan || '',
      p.nominal || 0,
      p.posKeluar || '',
      p.proyekSapa || '',
    ])
  );

  // 9. Pos Keuangan
  appendSection(
    'TABEL POS KEUANGAN & SALDO KAS/BANK',
    ['ID Pos', 'Nama Pos', 'Sub Title', 'Tipe', 'Saldo Awal (Rp)', 'Total Masuk (Rp)', 'Total Keluar (Rp)', 'Saldo Akhir (Rp)', 'No Akun COA', 'Nama Akun COA'],
    (backup.posKeuangan || []).map((pk) => [
      pk.id || '',
      pk.namaPos || '',
      pk.subTitle || '',
      pk.tipe || '',
      pk.saldoAwal || 0,
      pk.totalMasuk || 0,
      pk.totalKeluar || 0,
      pk.saldo || 0,
      pk.coaNoAkun || '',
      pk.coaNamaAkun || '',
    ])
  );

  // 10. Chart of Accounts (COA)
  appendSection(
    'TABEL CHART OF ACCOUNTS (COA 10000 - 69999)',
    ['No Akun', 'Nama Akun', 'Pos (D/K)', 'Kelompok', 'Header?', 'Saldo Awal Debet (Rp)', 'Saldo Awal Kredit (Rp)'],
    (backup.coaAccounts || []).map((c) => [
      c.noAkun || '',
      c.namaAkun || '',
      c.pos || '',
      c.kelompok || '',
      c.isHeader ? 'Header' : 'Detail',
      c.saldoAwalDebet || 0,
      c.saldoAwalKredit || 0,
    ])
  );

  // 11. Organisasi
  appendSection(
    'TABEL ORGANISASI MITRA',
    ['ID', 'Code ID', 'Nama Organisasi', 'Jenis Organisasi', 'No HP', 'Email', 'Kota', 'Alamat', 'PIC'],
    (backup.organisasi || []).map((o) => [
      o.id || '',
      o.codeId || '',
      o.namaOrganisasi || '',
      o.jenisOrganisasi || '',
      o.nomorHandPhone || '',
      o.email || '',
      o.kota || '',
      o.alamat || '',
      o.pic || '',
    ])
  );

  // 12. Karyawan
  appendSection(
    'TABEL KARYAWAN',
    ['ID', 'ID Karyawan', 'Nama Lengkap', 'Divisi', 'Jabatan', 'No HP', 'Status Kerja'],
    (backup.karyawan || []).map((k) => [
      k.id || '',
      k.idKaryawan || '',
      k.namaLengkap || '',
      k.divisi || '',
      k.jabatan || '',
      k.nomorHandPhone || '',
      k.statusKerja || '',
    ])
  );

  return lines.join('\n');
}

/**
 * Downloads a string content as a file via browser Blob URL
 */
export function triggerBrowserDownload(
  content: string,
  filename: string,
  mimeType: string = 'application/json'
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Convenience function to download all data as a formatted JSON file
 */
export function downloadAllDataAsJson(backup: AllApplicationData): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
  const filename = `YPPLN_ERP_Backup_All_Data_${dateStr}_${timeStr}.json`;

  const jsonString = JSON.stringify(backup, null, 2);
  triggerBrowserDownload(jsonString, filename, 'application/json;charset=utf-8');
  return filename;
}

/**
 * Convenience function to download all data as a consolidated CSV file
 */
export function downloadAllDataAsCsv(backup: AllApplicationData): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
  const filename = `YPPLN_ERP_Backup_All_Data_${dateStr}_${timeStr}.csv`;

  const csvContent = generateConsolidatedCsv(backup);
  triggerBrowserDownload(csvContent, filename, 'text/csv;charset=utf-8');
  return filename;
}
