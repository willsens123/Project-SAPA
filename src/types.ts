import { IdentitasItem } from './identitasData';

export interface ProjectItem {
  id: string;
  tanggal: string;
  dateRangePersiapan: string;
  namaKegiatan: string;
  isNamaBadge?: boolean;
  jenisProyek: string;
  divisi: string;
  lokasi: string;
  status: 'Done' | 'Waiting Acc' | 'Ongoing' | string;
  catatan?: string;
  // Detailed form fields
  isOnline?: boolean;
  tanggalStart?: string;
  tanggalEnd?: string;
  persiapanStart?: string;
  persiapanEnd?: string;
  platform?: string;
  lokasiKegiatan?: string;
  kotaKabupaten?: string;
  provinsi?: string;
  keterangan?: string;
  linkFoto?: string[];
  linkLaporan?: string;
  target?: string[];
  warnaKartu?: string;
  kategori?: string;
  deadline?: string;
  deskripsi?: string;
  progress?: number;
}

export type Project = ProjectItem;

export type StatusType = 'Done' | 'Waiting Acc' | 'Ongoing';

export type AppView =
  | 'home'
  | 'identitas'
  | 'formIdentitas'
  | 'editIdentitas'
  | 'mergeDuplicates'
  | 'organisasi'
  | 'formOrganisasi'
  | 'editOrganisasi'
  | 'jenisPanggilan'
  | 'triyana'
  | 'pekerjaan'
  | 'mengenalYppln'
  | 'divisi'
  | 'table'
  | 'form'
  | 'jenisProyek'
  | 'report'
  | 'reportCustomerSalur'
  | 'reportBepSalur'
  | 'transaksiSalur'
  | 'posKasirTransaksiSalur'
  | 'listPromoSSalur'
  | 'formListPromoSSalur'
  | 'resi'
  | 'agenResi'
  | 'formTransaksiSalur'
  | 'formTransaksiSalurHadiah'
  | 'viaTransaksiSalur'
  | 'jenisViaTransaksiSalur'
  | 'viaTransaksiDonasi'
  | 'jenisViaTransaksiDonasi'
  | 'viaTransaksiAjar'
  | 'jenisViaTransaksiAjar'
  | 'itemSalur'
  | 'ongoingCreateItemSalur'
  | 'modalItemSalur'
  | 'stokItemSalur'
  | 'lokasiStokItemSalur'
  | 'stockInOutSalur'
  | 'formStockInOutSalur'
  | 'jenisPerubahanStockSalur'
  | 'namaPercetakanStockSalur'
  | 'transaksiDonasi'
  | 'reportNamaPelimpahanJasaDonasi'
  | 'itemDonasi'
  | 'alokasiDonasiSalur'
  | 'transaksiAjar'
  | 'formTransaksiAjar'
  | 'itemAjar'
  | 'formItemAjar'
  | 'subJenisItemAjar'
  | 'jenisAcaraItemAjar'
  | 'pengisiAcaraItemAjar'
  | 'formItemDonasi'
  | 'subJenisItemDonasi'
  | 'formTransaksiDonasi'
  | 'formItemSalur'
  | 'jenisItemSalur'
  | 'subJenisItemSalur'
  | 'kategoriItemSalur'
  | 'jenisKategoriItemSalur'
  | 'rekening'
  | 'mutasi'
  | 'rincianMutasi'
  | 'posKeuangan'
  | 'posPemasukan'
  | 'posPemasukanSubJenis'
  | 'posPengeluaran'
  | 'kelompokBiayaCoa'
  | 'kebutuhanPengeluaran'
  | 'pengeluaran'
  | 'formPengeluaran'
  | 'kumpulanRekening'
  | 'laporanKeuangan'
  | 'jurnalUmum'
  | 'coa'
  | 'karyawan'
  | 'formCutiKaryawan'
  | 'rekapAbsensiKaryawan'
  | 'listAccount'
  | 'formListAccount'
  | 'quickReply'
  | 'formQuickReply'
  | 'listFaq'
  | 'formListFaq'
  | 'tentangListFaq'
  | 'listDharmaPatronRutin'
  | 'formListDharmaPatronRutin'
  | 'jenisPerubahanDharmaPatron'
  | 'listDatabaseAAjakAll'
  | 'listDatabaseAAjakItemSSebar'
  | 'formListDatabaseAAjakItemSSebar'
  | 'listDatabaseAAjakAJar'
  | 'formListDatabaseAAjakAJar'
  | 'jobAdvanceFormListDatabaseAAjakItemSSebar'
  | 'statusJobAdvanceFormListDatabaseAAjakItemSSebar'
  | 'kontenPromosi'
  | 'listPM'
  | 'rincianListPM'
  | 'autoInputListPMKhususSalur'
  | 'formListPM'
  | 'templatePM'
  | 'formTemplatePM'
  | 'templateTandaTerimaDonasi'
  | 'timelinePM'
  | 'pipelinePM'
  | 'detailListPM'
  | 'listGroupFunneling'
  | 'listNamaGroupFunneling'
  | 'formListGroupFunneling'
  | 'jenisGroupFunneling'
  | 'todoList'
  | 'formTodoList'
  | 'calendarTodoList'
  | 'hariKhususCalendarTodoList'
  | 'jenisNonProyekTodoList'
  | 'timelineProyekSapa'
  | 'complaint'
  | 'formComplaint'
  | 'auditLog';

export interface ComplaintItem {
  id: string;
  tanggal: string;
  nama: string;
  kodeDonatur?: string;
  subNama?: string;
  avatarLetter: string;
  avatarBg: string;
  jenisKomplain: string;
  komplain: string;
  status?: 'Open' | 'Diproses' | 'Selesai';
  identitasId?: string;
}

export interface JenisNonProyekItem {
  id: string;
  nama: string;
  warnaKartu: string;
  keterangan?: string;
}

export interface TodoRutinConfig {
  isRutin: boolean;
  berkalaMode: 'setiap' | 'setiap_hari' | 'setiap_tanggal';
  setiapHariValue?: string; // 1, 2, 3, 4, ... hari
  setiapHariPilihan?: string; // Senin, Selasa, ... Minggu
  setiapTanggalPilihan?: string; // 1 s/d 31
  tanggalBerakhir?: string; // YYYY-MM-DD
  siklusKe?: number;
  parentRutinTaskId?: string;
  tanggalMulai?: string;
}

export interface PrerequisiteSubTaskCondition {
  id?: string;
  subTaskId: string;
  subTaskTitle: string;
  requiredStatus: 'Sedang Dikerjakan' | 'Selesai';
}

export interface TodoSubTaskItem {
  id: string;
  title: string;
  idKaryawanAssignJob?: string;
  deadline?: string;
  deskripsi?: string;
  completed?: boolean;
  status?: 'not_started' | 'ongoing' | 'completed';
  statusPengerjaan?: 'belum_mulai' | 'ongoing' | 'selesai' | 'pending';
  scheduledDate?: string;
  catatan?: string;
  dependsOnSubTask?: boolean;
  prerequisiteSubTaskId?: string;
  prerequisiteSubTaskTitle?: string;
  prerequisiteStatus?: 'Sedang Dikerjakan' | 'Selesai';
  prerequisites?: PrerequisiteSubTaskCondition[];
  isNonProyek?: boolean;
  jenisNonProyekId?: string;
  jenisNonProyekNama?: string;
  warnaKartu?: string;
  isRutin?: boolean;
  rutinConfig?: TodoRutinConfig;
  divisi?: string;
}

export interface TodoTaskItem {
  id: string;
  task: string;
  isPost?: boolean;
  idKaryawanAssignJob?: string;
  deadline?: string;
  deskripsi?: string;
  completed?: boolean;
  status?: 'not_started' | 'ongoing' | 'completed';
  statusPengerjaan?: 'belum_mulai' | 'ongoing' | 'selesai' | 'pending';
  subTasks: TodoSubTaskItem[];
  scheduledDate?: string;
  catatan?: string;
  dependsOnSubTask?: boolean;
  prerequisiteSubTaskId?: string;
  prerequisiteSubTaskTitle?: string;
  prerequisiteStatus?: 'Sedang Dikerjakan' | 'Selesai';
  prerequisites?: PrerequisiteSubTaskCondition[];
  isNonProyek?: boolean;
  jenisNonProyekId?: string;
  jenisNonProyekNama?: string;
  warnaKartu?: string;
  isRutin?: boolean;
  rutinConfig?: TodoRutinConfig;
  divisi?: string;
}

export interface ImageOverlayField {
  id: string;
  label: string;
  tag: string;
  value: string;
  posX: number; // percentage (0 - 100)
  posY: number; // percentage (0 - 100)
  fontSize: number; // px size
  fontFamily: 'cursive' | 'sans' | 'serif';
  color: string;
  isBold?: boolean;
  isItalic?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface TemplatePMItem {
  id: string;
  namaTemplate: string;
  subTitle?: string;
  kegiatan: string;
  proyekSapa?: string;
  itemTerkait?: string;
  avatarInitial: string;
  avatarBg: string;
  aktif: boolean;
  isiPesan: string;
  hasImage?: boolean;
  imageUrl?: string;
  imageOverlayFields?: ImageOverlayField[];
  baseSentCount?: number;
  baseRatePercent?: number;
}

export interface KaryawanItem {
  id: string;
  kodeKaryawan: string;
  namaLengkap: string;
  namaPanggilan?: string;
  divisi: string;
  emailLogin: string;
  password: string;
  avatarInitial?: string;
  avatarBg?: string;
  aktif?: boolean;
  tanggalBergabung?: string;
  tanggalBerhenti?: string;
}

export interface JenisGroupFunnelingItem {
  id: string;
  namaJenisGroup: string;
  aktif: boolean; // true = Yes / Aktif, false = No / Tidak Aktif
  uniqueId: boolean; // true = Yes, false = No
  keterangan?: string;
}

export interface ListPMDetailRow {
  id: string;
  deadline: string; // e.g. "16 Nov 2021"
  identitasId?: string;
  codeId?: string; // e.g. "00031"
  nama: string; // e.g. "Agustino Ong"
  nomorHp: string; // e.g. "081234567898"
  avatarInitial?: string; // e.g. "A"
  avatarBg?: string; // e.g. "bg-[#00a89d]"
  proyekSapa?: string; // e.g. "Tanda Terima Dharma Patron" or "Kirim Resi"
  proyekKode?: string; // e.g. "MAD"
  templateName: string; // e.g. "Template A"
  templateContent?: string;
  itemTitle: string; // e.g. "Jalan Menuju Kemahatahuan"
  itemSubtitle: string; // e.g. "Buku Berbayar, BJM - 2021"
  itemStock?: string; // e.g. "Stok: 100"
  itemImageUrl?: string;
  status: 'done_teal' | 'menolak' | 'done_gray' | 'pending';
  sentAt?: string;
  isManualStatus?: boolean;
  matchedTransaction?: {
    source: string;
    orderId: string;
    orderNumber: string;
    txDate: string;
    matchedItem: string;
    matchedCustomer: string;
    daysAfterPM: number;
  };
}

export interface ListPMRecipient {
  id: string;
  identitasId?: string;
  codeId?: string;
  nama: string;
  nomorHp: string;
  isSent: boolean;
  sentAt?: string;
}

export interface ListPMItem {
  id: string;
  proyekSapa: string; // e.g. "Kirim Resi", "Ajakan Event", "Ajakan Donasi", "Ajakan Penyaluran"
  proyekKode: string; // e.g. "MAD", "EVE", "FUN", "MAD"
  iconType: 'package' | 'rocket' | 'creditCard' | 'shoppingCart' | string;
  targetType: 'multiple' | 'single';
  targetCount?: number;
  targetAvatars?: Array<{
    initial: string;
    bg: string;
  }>;
  singleTarget?: {
    identitasId?: string;
    codeId?: string;
    nama: string;
    nomorHp: string;
    avatarInitial: string;
    avatarBg?: string;
  };
  deadline: string; // "-" or "16 Nov 2021" or "26 Nov 2021"
  deadlineColor?: 'teal' | 'red' | 'amber';
  templatePesan: string;
  progressPercent: number; // 0 to 100
  recipients?: ListPMRecipient[];
  detailBadge?: {
    label: string; // e.g. "Kirim Resi"
    countText: string; // e.g. "10 buah"
  };
  detailRows?: ListPMDetailRow[];
  createdAt?: string;
  tabType?: 'non-rutin' | 'rutin';
  berkalaMode?: 'setiap' | 'setiap_hari' | 'setiap_tanggal';
  berkalaValue?: string;
  tanggalBerakhir?: string;
  tanggalMulaiDihubungi?: string;
  tanggalMulaiPM?: string;
  statusBisaPM?: 'sudah' | 'belum' | 'sudah_dihubungi';
  durasiLabel?: string;
  itemTitle?: string;
  dihubungiOleh?: string;
  dihubungiOlehType?: 'call_center' | 'pic_yppln' | 'karyawan';
  targetSourceType?: 'identitas' | 'organisasi' | 'funneling';
  targetSourceName?: string;
  targetPhone?: string;
  isWaitingJeda?: boolean;
  jedaUnit?: 'hari' | 'bulan';
  jedaValue?: number;
  availableDate?: string;
  parentPmId?: string;
  isChatAutoSalur?: boolean;
  sourceRuleId?: string;
  autoResiTrigger?: string;
  pmLanjutanList?: Array<{
    id: string;
    jedaUnit: 'hari' | 'bulan';
    jedaValue: number;
    templateId?: string;
    templateName?: string;
    itemTitle?: string;
    availableDate?: string;
  }>;
}

export interface JobAdvanceMasterItem {
  id: string;
  key: string;
  nama: string; // e.g. "Lay-Out", "Cover Design", etc.
  statusJobAdvance: string; // e.g. "-. Beginner, Intermediate, Advanced"
  keterangan: 'Gambar' | 'Tulisan' | string;
  createdAt?: string;
}

export interface StatusJobAdvanceMasterItem {
  id: string;
  nama: string; // e.g. "-", "Beginner", "Intermediate", "Advanced"
  createdAt?: string;
}

export interface VolunteerSkillRole {
  key: string;
  label: string;
  category?: 'Desain' | 'Kepengarangan' | 'Penerjemahan & Penyuntingan';
}

export interface VolunteerSSebarItem {
  id: string;
  identitasId?: string;
  kode: string; // e.g. "00031"
  nama: string; // e.g. "Agustino Ong"
  panggilan: string; // e.g. "Ko Agus"
  avatarLetter?: string; // e.g. "A"
  avatarBg?: string; // e.g. "#008d91"
  status: 'Volunteer' | 'Freelancer' | string;
  isAktif: boolean;
  periodeAktif?: string; // e.g. "1 Jan 2021 - 15 Nov 2021"
  noHp?: string;
  email?: string;
  skills: Record<string, string>; // maps skill key to level, e.g. { layout: 'Beginner', coverDesign: 'Advanced' }
  catatan?: string;
  cvUrl?: string; // Link URL untuk CV volunteer / personil
  createdAt?: string;
}

export type VolunteerAJarItem = VolunteerSSebarItem;

export interface JenisPerubahanDharmaPatronItem {
  id: string;
  nama: string;
  createdAt?: string;
}

export interface DharmaPatronRutinItem {
  id: string;
  noDonatur: string; // e.g. "00031"
  namaDonatur: string; // e.g. "Agustino Ong"
  panggilan: string; // e.g. "Ko Agus"
  avatarLetter?: string; // e.g. "A"
  avatarBg?: string; // e.g. "#00a896"
  sumber: string; // e.g. "Brosur DP 1"
  groupJarkom: string; // e.g. "All DPR 1"
  namaRekening: string; // e.g. "Agustino"
  donasiPerbulan: number; // e.g. 100000
  tanggalBergabung: string; // e.g. "12 Jan 2019"
  namaPendek: string; // e.g. "Agustino"
  keterangan: string; // e.g. "-"
  afiliasiKci: string; // e.g. "MAH"
  piutang: number; // e.g. -100000 or 0
  bulanPiutang: string; // e.g. "Oktober"
  reminder: string; // e.g. "All"
  identitasId?: string;
  nomorHp?: string;
  email?: string;
  tanggalLahir?: string;
  pekerjaan?: string;
  pelimpahanJasa?: string[];
  bulanMulaiDonasi?: string;
  penerimaBukuGratis?: boolean;
  idAlamat?: string;
  jenisPerubahanDonasi?: string;
  bulanMulaiPerubahanDonasi?: string;
  bulanDiputihkan?: string[];
  statusAktif?: 'Aktif' | 'Tidak Aktif';
  tanggalBerhenti?: string;
  createdAt?: string;
}

export interface PengeluaranItem {
  id: string;
  tanggal: string;
  divisi: string;
  posKeluar: string;
  kebutuhan: string;
  keterangan: string;
  nominal: number;
  jenis: string;
  no: string;
  noBadgeColor?: 'teal' | 'red' | 'plain'; // 'teal' = ada bukti bon & linked ke mutasi; 'red' = ada bukti bon & belum linked mutasi; 'plain' = belum upload bukti bon
  dikeluarkan: string;
  createdAt?: string;
  proyekSapa?: string;
  rincianProyekSapa?: string; // Rincian Proyek SAPA
  // Bukti bon (upload gambar struk / nota / bon)
  buktiBonUrl?: string;
  buktiBonFileName?: string;
  buktiBonUploadedAt?: string;
  // Keterhubungan ke Mutasi
  mutasiId?: string;
  mutasiKode?: string;
  mutasiKeterangan?: string;
  mutasiDate?: string;
  mutasiAmount?: number;
}

export interface AlamatOrgItem {
  id: string;
  namaPenerima: string;
  nomorHp: string;
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kotaKabupaten: string;
  kodePos: string;
  notePengiriman: string;
  isPrimary: boolean;
}

export interface TanggalPentingItem {
  id: string;
  date: string;
  label: string;
}

export interface PicOrgEntry {
  id: string;
  role: string; // e.g. Call Center, Direktur, Sales, Ketua
  identitasId: string;
  identitasCode?: string;
  identitasNama?: string;
  identitasHp?: string;
}

export interface OrganisasiItem {
  id: string;
  namaOrg: string;
  jenisOrg: string;
  avatarInitial?: string;
  avatarBg?: string;
  subOrg?: string;
  subOrgList?: string[];
  triyana?: string;
  mediaPartner: boolean;
  picOrgEntries?: PicOrgEntry[];
  picOrgId?: string; // Connected to IdentitasItem.id or codeId
  picOrgCode?: string;
  picOrgNama?: string;
  picOrgPanggilan?: string;
  picOrgRole?: string;
  picOrgHp?: string;
  hp: string;
  email?: string;
  instagram?: string;
  alamatList?: AlamatOrgItem[];
  alamat?: string;
  kota?: string;
  provinsi?: string;
  tanggalPentingList?: TanggalPentingItem[];
  status: 'VIP' | 'Blacklist' | '-' | string;
  isCust: boolean;
  isStarred?: boolean;
  pic: string;
  picYppln?: string;
  catatan?: string;
}

export interface IdentitasChangeLog {
  id: string;
  identitasId: string;
  codeId: string;
  namaLengkap: string;
  timestamp: string;
  field: string;
  oldValue: string;
  newValue: string;
  alasan: string;
  actionType: 'Ubah' | 'Hapus' | 'Merge';
}

export type AuditModule =
  | 'S-SALUR'
  | 'DONASI'
  | 'AJAR'
  | 'IDENTITAS'
  | 'PROYEK'
  | 'PENGELUARAN'
  | 'MUTASI';

export interface CentralAuditLogEntry {
  id: string;
  timestamp: string;
  isoTimestamp?: string;
  module: AuditModule;
  recordId: string;
  recordTitle: string;
  actionType: 'Tambah' | 'Ubah' | 'Hapus' | 'Status Bayar' | 'Pengiriman' | 'Resi' | 'Merge' | string;
  field: string;
  oldValue: string;
  newValue: string;
  alasan?: string;
  author?: string;
  badgeColor?: string;
  metadata?: Record<string, any>;
}

export interface DuplicatePair {
  id: string;
  item1: IdentitasItem;
  item2: IdentitasItem;
  reason: string;
}

export interface JenisPanggilanItem {
  id: string;
  jenisPanggilan: string;
  lengkap: string;
  singkat: string;
  isPrimary?: boolean;
}

export interface TriyanaItem {
  id: string;
  triyana: string;
  keterangan: string;
}

export interface PekerjaanItem {
  id: string;
  namaPekerjaan: string;
  keterangan: string;
}

export interface MengenalYpplnItem {
  id: string;
  mengenalYppln: string;
  keterangan: string;
}

export interface DivisiItem {
  id: string;
  namaDivisi: string;
  keterangan: string;
}

export interface JenisProyekTemplateTask {
  id: string;
  task: string;
  deskripsi?: string;
}

export interface JenisProyekItem {
  id: string;
  jenisKegiatan: string;
  keterangan: string;
  templateTodoList?: JenisProyekTemplateTask[];
  isCoa?: boolean;
  coaCode?: string;
  coaName?: string;
}

export interface ColumnVisibility {
  tanggal: boolean;
  dateRangePersiapan: boolean;
  namaKegiatan: boolean;
  jenisProyek: boolean;
  divisi: boolean;
  lokasi: boolean;
  status: boolean;
  projectedRevenue?: boolean;
}

export interface JenisItemSalurItem {
  id: string;
  namaJenis: string;
  kode: string;
  iconLetter: string;
  iconBg: string;
  keterangan?: string;
}

export interface SubJenisItemSalurItem {
  id: string;
  namaSubJenis: string;
  namaJenis: string;
  kode: string;
  iconLetter: string;
  iconBg: string;
  iconType?: string;
  logoUrl?: string;
  keterangan?: string;
}

export interface SubJenisItemDonasiItem {
  id: string;
  namaSubJenis: string;
  kode: string;
  pos?: string;
  iconLetter?: string;
  iconBg?: string;
  keterangan?: string;
}

export interface JenisKategoriItemSalurItem {
  id: string;
  namaJenisKategori: string;
  isPrimary: boolean;
  keterangan?: string;
}

export interface KategoriItemSalurItem {
  id: string;
  namaKategori: string;
  namaJenisKategori: string;
  kode?: string;
  isPrimary?: boolean;
  keterangan?: string;
}

export interface MutasiLinkedTransaction {
  id: string;
  orderId?: string;
  sourceType?: 'salur' | 'ajar' | 'donasi' | 'pengeluaran' | 'fee' | 'lainnya';
  sourceId?: string;
  kode: string;
  dbCr: 'CR' | 'DB';
  nominalAkhir: number;
  keterangan?: string;
  createdAt?: string;
}

export interface MutasiItem {
  id: string;
  bankAccount: string; // 'BCA 888' | 'BCA 388' | 'Mandiri'
  date: string;
  keteranganBank: string;
  branch: string | number;
  amount: number;
  type: 'CR' | 'DB';
  balance: number;
  catatan?: string;
  linkedTransactions?: MutasiLinkedTransaction[];
}

export interface RekeningItem {
  id: string;
  nama: string; // e.g. "BCA 888", "BCA 388", "Mandiri"
  tipe: string; // e.g. "Rekening"
  nomorRekening?: string; // e.g. "0077119888"
  atasNama?: string; // e.g. "Yayasan Pelestarian dan Pengembangan Lamrim Nusantara"
  keteranganLengkap: string; // e.g. "BCA 0077119888 an Yayasan Pelestarian dan Pengembangan Lamrim Nusantara"
  bankCode?: string; // "BCA", "Mandiri", etc.
  avatarLetter: string; // "B", "M", etc.
  bgColor: string; // hex or tailwind color e.g. "#0f827e", "#8c52ad"
}

export interface SayPaidRecord {
  id: string;
  buktiFotoUrls?: string[];
  rekening: string;
  tanggalPembayaran: string;
  nominal: number | string;
}

export type { JenisViaSalurItem, ViaTransaksiSalurItem } from './viaSalurData';
export type { JenisViaDonasiItem, ViaTransaksiDonasiItem } from './viaDonasiData';
export type { JenisViaAjarItem, ViaTransaksiAjarItem } from './viaAjarData';
export type { IdentitasItem } from './identitasData';
export type { FunnelingGroupCard, FunnelingMemberItem } from './funnelingData';
export type {
  PromoSalurItem,
  PromoChannelEntry,
  PromoTargetEntry,
  PromoDiscountEntry,
  PromoBundleEntry,
} from './promoSalurData';

export interface SocialMetric {
  tanggal: string; // e.g. "11 Nov 21"
  jam: string; // e.g. "11:00"
  like: number;
  comment: number;
  share: number;
  saved: number;
  reach: number;
}

export interface JarkomMetric {
  tanggal: string; // e.g. "11 Nov 21"
  jam: string; // e.g. "11:00"
  reach: number;
}

export interface TargetPromotedItem {
  id: string;
  title: string;
  coverKey?: 'demi-kepentingan' | 'menjadi-buddha' | 'jalan-menuju' | 'lakon-hidup' | 'intisari-amerta' | 'leaders-way';
  imageUrl?: string;
}

export interface KontenPromosiItem {
  id: string;
  judul: string; // e.g. "Poster A"
  format: string; // e.g. "Carousel"
  thumbnailUrl?: string;
  itemSummary: string; // e.g. "Buku Menjadi Buddha, + 1 more item"
  targetItems: TargetPromotedItem[];
  ig: SocialMetric;
  tiktok: SocialMetric;
  jarkom: JarkomMetric;
  tanggalDisebar: string; // e.g. "11 Nov 2021" or ISO string
  durasiHariCekTransaksi?: number; // 5 hari
  setWaktuHari?: number; // Mau berapa hari pengecekan
  transaksiCount?: number;
}

export interface TimelinePMTransaction {
  id: string;
  orderNumber?: string;
  nominal?: string;
  item?: string;
  date?: string;
  pembeli?: string;
  status?: string;
}

export interface TimelinePMSubStep {
  id: string;
  icon: 'rocket' | 'cart' | 'document' | 'user' | 'chat';
  label?: string;
  subtitle?: string;
  isTransaction?: boolean;
  transactionData?: TimelinePMTransaction;
}

export interface TimelinePMBranch {
  id: string;
  letter: string; // 'A' | 'B'
  title?: string;
  subSteps: TimelinePMSubStep[];
}

export interface TimelinePMNode {
  id: string;
  type: 'chat' | 'event' | 'buku' | 'dana' | 'custom';
  icon: 'chat' | 'rocket' | 'cart' | 'user' | 'document';
  title: string; // e.g. "Chat A", "Promosi Event", "Promosi Buku", "Promosi Dana"
  subtitle: string; // e.g. "Ajakan A", "Bedah Buku A", "Buku Hidup Bahagia", "Dana Banjir"
  durationAfter?: string; // e.g. "2 Bulan", "3 Bulan"
  month?: string; // e.g. "Nov"
  branch?: TimelinePMBranch;
  hasTransaction?: boolean;
  midBranchTransaction?: TimelinePMBranch; // Branch halfway to next step as seen in image (Branch A with cart, doc, user)
}

export interface TimelinePMJourney {
  id: string;
  targetType: 'groupFunneling' | 'identitas' | 'organisasi';
  targetId: string;
  targetName: string; // e.g. "Group A"
  audienceCount: number; // e.g. 202
  audienceLabel: string; // e.g. "202 orang"
  avatarCluster: { initial: string; bg: string }[];
  nodes: TimelinePMNode[];
}

export type {
  ModalSalurItem,
  ModalSalurYearGroup,
  ModalSalurVariant,
} from './modalSalurData';

export type { HariKhususItem } from './hariKhususData';
export type { CutiKaryawanItem, JenisCuti, CutiStatus } from './cutiKaryawanData';
export type { AccountItem } from './accountData';




