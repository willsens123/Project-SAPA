import React, { useState, useMemo, useEffect } from 'react';
import {
  Home,
  Flower2,
  Tags,
  BarChart3,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Layers,
  Sparkles,
  User,
  Building2,
  MessageSquareQuote,
  Compass,
  Briefcase,
  Award,
  Share2,
  Boxes,
  MapPin,
  GitFork,
  Tag,
  BadgePercent,
  BookmarkCheck,
  CreditCard,
  ArrowLeftRight,
  Route,
  Waypoints,
  Calendar,
  Wallet,
  Coins,
  Receipt,
  Truck,
  SlidersHorizontal,
  Send,
  Users,
  TrendingUp,
  MessageSquareText,
  Kanban,
  ListTodo,
  CalendarDays,
  CalendarCheck,
  CalendarOff,
  UserCheck,
  KeyRound,
  MessageSquareReply,
  HelpCircle,
  MessageSquareWarning,
  Milestone,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Pencil,
  Printer,
  FileSpreadsheet,
  BookOpen,
  ArrowUpRight,
  FolderTree,
  ClipboardList,
  Search,
  Folder,
  CircleDot,
  CheckCircle2,
} from 'lucide-react';
import { ProjectItem, AppView } from '../types';
import { SSalurIcon } from './SSalurIcon';
import { ItemSSalurIcon } from './ItemSSalurIcon';
import { DDonasiIcon } from './DDonasiIcon';
import { ItemDDonasiIcon } from './ItemDDonasiIcon';
import { ItemAAjarIcon } from './ItemAAjarIcon';
import { AAjarIcon } from './AAjarIcon';
import { PersonWithGlassesIcon } from './PersonWithGlassesIcon';
import { PersonWithSSebarBoxIcon } from './PersonWithSSebarBoxIcon';
import {
  MenuArrangementConfig,
  loadMenuArrangementConfig,
  saveMenuArrangementConfig,
  resetMenuArrangementConfig,
} from '../menuConfigData';
import { EditMenuArrangementModal } from './EditMenuArrangementModal';

interface SidebarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  projects?: ProjectItem[];
  identitasCount?: number;
  organisasiCount?: number;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export interface NavItemDef {
  id: string;
  title: string;
  subtitle: string;
  view: AppView;
  icon: any;
  badge?: number;
  isLotus?: boolean;
  isSSalur?: boolean;
  isIdentitas?: boolean;
}

interface MenuCategoryDef {
  id: string;
  title: string;
  shortTitle: string;
  icon: any;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  itemIds: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  projects = [],
  identitasCount,
  organisasiCount,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatusLegend, setShowStatusLegend] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [menuConfig, setMenuConfig] = useState<MenuArrangementConfig>(() =>
    loadMenuArrangementConfig()
  );

  // Status counts for quick dashboard summary
  const waitingCount = projects.filter((p) => {
    const s = (p.status || '').toLowerCase();
    return s.includes('waiting');
  }).length;

  const ongoingCount = projects.filter((p) => {
    const s = (p.status || '').toLowerCase();
    return s.includes('ongoing');
  }).length;

  const doneCount = projects.filter((p) => {
    const s = (p.status || '').toLowerCase();
    return s.includes('done');
  }).length;

  // Complete List of All Navigation Items
  const navItems: NavItemDef[] = useMemo(
    () => [
      {
        id: 'nav-home',
        title: 'Home',
        subtitle: 'Dashboard Personal & Divisi',
        view: 'home',
        icon: Home,
      },
      {
        id: 'nav-identitas',
        title: 'Identitas',
        subtitle: 'Data Relawan & Donatur',
        view: 'identitas',
        icon: User,
        badge: identitasCount,
        isIdentitas: true,
      },
      {
        id: 'nav-organisasi',
        title: 'Organisasi',
        subtitle: 'Data Mitra & Perusahaan',
        view: 'organisasi',
        icon: Building2,
        badge: organisasiCount,
      },
      {
        id: 'nav-todo-list',
        title: 'To-Do List',
        subtitle: 'Daftar Tugas & Sub-Task',
        view: 'todoList',
        icon: ListTodo,
      },
      {
        id: 'nav-jenis-non-proyek-todo-list',
        title: 'Jenis Non-Proyek To-do List',
        subtitle: 'Master Jenis & Warna Kartu',
        view: 'jenisNonProyekTodoList',
        icon: Tag,
      },
      {
        id: 'nav-calendar-todo-list',
        title: 'Calendar To-Do List',
        subtitle: 'Kalender Bulanan & Post',
        view: 'calendarTodoList',
        icon: CalendarDays,
      },
      {
        id: 'nav-hari-khusus-calendar-todo-list',
        title: 'Hari Khusus Calendar To-do List',
        subtitle: 'Hari Besar Nasional & Libur',
        view: 'hariKhususCalendarTodoList',
        icon: CalendarCheck,
      },
      {
        id: 'nav-jenis-panggilan',
        title: 'Jenis Panggilan',
        subtitle: 'Master Panggilan',
        view: 'jenisPanggilan',
        icon: MessageSquareQuote,
      },
      {
        id: 'nav-triyana',
        title: 'Triyana',
        subtitle: 'Master Aliran',
        view: 'triyana',
        icon: Compass,
      },
      {
        id: 'nav-pekerjaan',
        title: 'Pekerjaan',
        subtitle: 'Master Profesi',
        view: 'pekerjaan',
        icon: Briefcase,
      },
      {
        id: 'nav-mengenal-yppln',
        title: 'Mengenal YPPLN',
        subtitle: 'Master Sumber',
        view: 'mengenalYppln',
        icon: Share2,
      },
      {
        id: 'nav-divisi',
        title: 'Divisi',
        subtitle: 'Master Divisi',
        view: 'divisi',
        icon: Layers,
      },
      {
        id: 'nav-proyek-sapa',
        title: 'Proyek SAPA',
        subtitle: 'Tabel Utama Kegiatan',
        view: 'table',
        icon: Flower2,
        badge: projects.length > 0 ? projects.length : undefined,
        isLotus: true,
      },
      {
        id: 'nav-timeline-proyek-sapa',
        title: 'Timeline Proyek SAPA',
        subtitle: 'Timeline Tahunan & To-Do',
        view: 'timelineProyekSapa',
        icon: CalendarDays,
        isLotus: true,
      },
      {
        id: 'nav-transaksi-salur',
        title: 'Transaksi S-SALUR',
        subtitle: 'Daftar Pesanan & Order',
        view: 'transaksiSalur',
        icon: SSalurIcon,
        isSSalur: true,
      },
      {
        id: 'nav-pos-kasir-salur',
        title: 'POS Kasir Form Transaksi S-SALUR',
        subtitle: 'Kasir Cepat Transaksi',
        view: 'posKasirTransaksiSalur',
        icon: Receipt,
        isSSalur: true,
      },
      {
        id: 'nav-list-promo-salur',
        title: 'List Promo S-SALUR',
        subtitle: 'Daftar Promo S-SALUR',
        view: 'listPromoSSalur',
        icon: BadgePercent,
        isSSalur: true,
      },
      {
        id: 'nav-resi-salur',
        title: 'Resi',
        subtitle: 'Daftar Resi Pengiriman',
        view: 'resi',
        icon: Truck,
        isSSalur: true,
      },
      {
        id: 'nav-agen-resi',
        title: 'Agen Resi',
        subtitle: 'Daftar Mitra Agen Resi',
        view: 'agenResi',
        icon: Truck,
        isSSalur: true,
      },
      {
        id: 'nav-list-group-funneling',
        title: 'List Group Funneling',
        subtitle: 'Funneling Donasi & Group',
        view: 'listGroupFunneling',
        icon: Users,
        isSSalur: true,
      },
      {
        id: 'nav-list-nama-group-funneling',
        title: 'List Nama Group Funneling',
        subtitle: 'Daftar Nama Group',
        view: 'listNamaGroupFunneling',
        icon: Layers,
        isSSalur: true,
      },
      {
        id: 'nav-item-salur',
        title: 'Item S-SALUR',
        subtitle: 'Katalog & Stok',
        view: 'itemSalur',
        icon: ItemSSalurIcon,
        isSSalur: true,
      },
      {
        id: 'nav-ongoing-create-item-salur',
        title: 'Ongoing Create Item S-SALUR',
        subtitle: 'Papan Trello & Track PNB',
        view: 'ongoingCreateItemSalur',
        icon: Kanban,
        isSSalur: true,
      },
      {
        id: 'nav-modal-item-salur',
        title: 'Modal Item S-SALUR',
        subtitle: 'Modal & Royalti',
        view: 'modalItemSalur',
        icon: ItemSSalurIcon,
        isSSalur: true,
      },
      {
        id: 'nav-report-bep-salur',
        title: 'Report BEP Item S-SALUR',
        subtitle: 'Break Even Point',
        view: 'reportBepSalur',
        icon: TrendingUp,
        isSSalur: true,
      },
      {
        id: 'nav-stok-item-salur',
        title: 'Stok Item S-SALUR',
        subtitle: 'Stok Item & Gudang',
        view: 'stokItemSalur',
        icon: Boxes,
        isSSalur: true,
      },
      {
        id: 'nav-lokasi-stok-item-salur',
        title: 'Lokasi Stok Item S-SALUR',
        subtitle: 'Master Lokasi & Gudang',
        view: 'lokasiStokItemSalur',
        icon: MapPin,
        isSSalur: true,
      },
      {
        id: 'nav-stock-in-out-salur',
        title: 'Stock In/Out S-SALUR',
        subtitle: 'Mutasi Stok & Gudang',
        view: 'stockInOutSalur',
        icon: ArrowLeftRight,
        isSSalur: true,
      },
      {
        id: 'nav-jenis-perubahan-stock-salur',
        title: 'Jenis Perubahan Mutasi',
        subtitle: 'Klasifikasi Stock In/Out',
        view: 'jenisPerubahanStockSalur',
        icon: Tag,
        isSSalur: true,
      },
      {
        id: 'nav-nama-percetakan-stock-salur',
        title: 'Nama Percetakan S-SALUR',
        subtitle: 'Master Percetakan & Mitra',
        view: 'namaPercetakanStockSalur',
        icon: Printer,
        isSSalur: true,
      },
      {
        id: 'nav-transaksi-donasi',
        title: 'Transaksi D-DONASI',
        subtitle: 'Daftar Pesanan Donasi',
        view: 'transaksiDonasi',
        icon: DDonasiIcon,
        isSSalur: true,
      },
      {
        id: 'nav-report-nama-pelimpahan-jasa-donasi',
        title: 'Report Nama Pelimpahan Jasa D-DONASI',
        subtitle: 'Rekap Pelimpahan Jasa',
        view: 'reportNamaPelimpahanJasaDonasi',
        icon: DDonasiIcon,
        isSSalur: true,
      },
      {
        id: 'nav-item-donasi',
        title: 'Item D-DONASI',
        subtitle: 'Master Item Donasi',
        view: 'itemDonasi',
        icon: ItemDDonasiIcon,
        isSSalur: true,
      },
      {
        id: 'nav-template-tanda-terima-donasi',
        title: 'Template Tanda Terima D-DONASI',
        subtitle: 'Setting Proyek SAPA & Template PM',
        view: 'templateTandaTerimaDonasi',
        icon: Receipt,
        isSSalur: true,
      },
      {
        id: 'nav-list-dharma-patron-rutin',
        title: 'List Dharma Patron Rutin',
        subtitle: 'Donatur Rutin & Patron',
        view: 'listDharmaPatronRutin',
        icon: PersonWithGlassesIcon,
        isSSalur: true,
      },
      {
        id: 'nav-list-database-aajak-all',
        title: 'List Database A-AJAK All',
        subtitle: 'Database Volunteer A-AJAK All',
        view: 'listDatabaseAAjakAll',
        icon: Users,
        isSSalur: true,
      },
      {
        id: 'nav-list-database-aajak-item-ssebar',
        title: 'List Database A-AJAK Item S-SEBAR',
        subtitle: 'Database Volunteer Item S-SEBAR',
        view: 'listDatabaseAAjakItemSSebar',
        icon: PersonWithSSebarBoxIcon,
        isSSalur: true,
      },
      {
        id: 'nav-list-database-aajak-ajar',
        title: 'List Database A-AJAK A-JAR',
        subtitle: 'Database Volunteer A-AJAK A-JAR',
        view: 'listDatabaseAAjakAJar',
        icon: AAjarIcon,
        isSSalur: true,
      },
      {
        id: 'nav-job-advance-ssebar',
        title: 'Job Advance Database S-Sebar',
        subtitle: 'Master Job Advance',
        view: 'jobAdvanceFormListDatabaseAAjakItemSSebar',
        icon: Briefcase,
        isSSalur: true,
      },
      {
        id: 'nav-status-job-advance-ssebar',
        title: 'Status Job Advance S-Sebar',
        subtitle: 'Master Status Job Advance',
        view: 'statusJobAdvanceFormListDatabaseAAjakItemSSebar',
        icon: Award,
        isSSalur: true,
      },
      {
        id: 'nav-jenis-perubahan-dpr',
        title: 'Jenis Perubahan Donasi Patron',
        subtitle: 'Master Jenis Perubahan',
        view: 'jenisPerubahanDharmaPatron',
        icon: SlidersHorizontal,
        isSSalur: true,
      },
      {
        id: 'nav-transaksi-ajar',
        title: 'Transaksi A-AJAR',
        subtitle: 'Daftar Pesanan',
        view: 'transaksiAjar',
        icon: AAjarIcon,
        isSSalur: true,
      },
      {
        id: 'nav-item-ajar',
        title: 'Item A-AJAR',
        subtitle: 'Master Item Ajar',
        view: 'itemAjar',
        icon: ItemAAjarIcon,
        isSSalur: true,
      },
      {
        id: 'nav-sub-jenis-item-ajar',
        title: 'Sub-Jenis Item A-AJAR',
        subtitle: 'Master Sub-Jenis A-AJAR',
        view: 'subJenisItemAjar',
        icon: GitFork,
        isSSalur: true,
      },
      {
        id: 'nav-jenis-acara-item-ajar',
        title: 'Jenis Acara Item A-AJAR',
        subtitle: 'Master Jenis Acara A-AJAR',
        view: 'jenisAcaraItemAjar',
        icon: Calendar,
        isSSalur: true,
      },
      {
        id: 'nav-pengisi-acara-item-ajar',
        title: 'Pengisi Acara Item A-AJAR',
        subtitle: 'Master Pengisi Acara A-AJAR',
        view: 'pengisiAcaraItemAjar',
        icon: UserCheck,
        isSSalur: true,
      },
      {
        id: 'nav-sub-jenis-item-donasi',
        title: 'Sub-Jenis Item D-DONASI',
        subtitle: 'Master Sub-Jenis Donasi',
        view: 'subJenisItemDonasi',
        icon: GitFork,
        isSSalur: true,
      },
      {
        id: 'nav-jenis-item-salur',
        title: 'Jenis Item S-SALUR',
        subtitle: 'Master Jenis',
        view: 'jenisItemSalur',
        icon: Boxes,
        isSSalur: true,
      },
      {
        id: 'nav-sub-jenis-item-salur',
        title: 'Sub-Jenis Item S-SALUR',
        subtitle: 'Master Sub-Jenis',
        view: 'subJenisItemSalur',
        icon: GitFork,
        isSSalur: true,
      },
      {
        id: 'nav-kategori-item-salur',
        title: 'Kategori Item S-SALUR',
        subtitle: 'Master Kategori',
        view: 'kategoriItemSalur',
        icon: Tag,
        isSSalur: true,
      },
      {
        id: 'nav-jenis-kategori-salur',
        title: 'Jenis Kategori Item',
        subtitle: 'Master Klasifikasi',
        view: 'jenisKategoriItemSalur',
        icon: BookmarkCheck,
        isSSalur: true,
      },
      {
        id: 'nav-via-transaksi-salur',
        title: 'Via Transaksi S-SALUR',
        subtitle: 'Master Via',
        view: 'viaTransaksiSalur',
        icon: Route,
        isSSalur: true,
      },
      {
        id: 'nav-jenis-via-transaksi-salur',
        title: 'Jenis Via Transaksi S-SALUR',
        subtitle: 'Master Jenis Via',
        view: 'jenisViaTransaksiSalur',
        icon: Waypoints,
        isSSalur: true,
      },
      {
        id: 'nav-via-transaksi-donasi',
        title: 'Via Transaksi D-DONASI',
        subtitle: 'Master Via Donasi',
        view: 'viaTransaksiDonasi',
        icon: Route,
        isSSalur: true,
      },
      {
        id: 'nav-jenis-via-transaksi-donasi',
        title: 'Jenis Via Transaksi D-DONASI',
        subtitle: 'Master Jenis Via Donasi',
        view: 'jenisViaTransaksiDonasi',
        icon: Waypoints,
        isSSalur: true,
      },
      {
        id: 'nav-via-transaksi-ajar',
        title: 'Via Transaksi A-AJAR',
        subtitle: 'Master Via Ajar',
        view: 'viaTransaksiAjar',
        icon: Route,
        isSSalur: true,
      },
      {
        id: 'nav-jenis-via-transaksi-ajar',
        title: 'Jenis Via Transaksi A-AJAR',
        subtitle: 'Master Jenis Via Ajar',
        view: 'jenisViaTransaksiAjar',
        icon: Waypoints,
        isSSalur: true,
      },
      {
        id: 'nav-jenis-group-funneling',
        title: 'Jenis Group Funneling',
        subtitle: 'Master Jenis Group',
        view: 'jenisGroupFunneling',
        icon: Waypoints,
        isSSalur: true,
      },
      {
        id: 'nav-tambah-proyek',
        title: 'Tambah Proyek',
        subtitle: 'Form Kegiatan Baru',
        view: 'form',
        icon: PlusCircle,
      },
      {
        id: 'nav-jenis-proyek',
        title: 'Jenis Proyek',
        subtitle: 'Kategori Kegiatan',
        view: 'jenisProyek',
        icon: Tags,
      },
      {
        id: 'nav-report-proyek',
        title: 'Report Proyek',
        subtitle: 'Statistik & Realisasi SAPA',
        view: 'report',
        icon: BarChart3,
      },
      {
        id: 'nav-report-customer-salur',
        title: 'Report Customer S-SALUR',
        subtitle: 'Report Sub-Jenis & Item',
        view: 'reportCustomerSalur',
        icon: Users,
      },
      {
        id: 'nav-report-bep-salur-report',
        title: 'Report BEP Item S-SALUR',
        subtitle: 'Break Even Point & Diagram',
        view: 'reportBepSalur',
        icon: TrendingUp,
      },
      {
        id: 'nav-konten-promosi',
        title: 'Konten Promosi',
        subtitle: 'Tracking Konten & Transaksi',
        view: 'kontenPromosi',
        icon: Share2,
      },
      {
        id: 'nav-list-pm',
        title: 'List PM',
        subtitle: 'Broadcast Chat & Template PM',
        view: 'listPM',
        icon: Send,
      },
      {
        id: 'nav-rincian-list-pm',
        title: 'Rincian List PM',
        subtitle: 'Detail Broadcast Chat & Proyek SAPA',
        view: 'rincianListPM',
        icon: BookOpen,
      },
      {
        id: 'nav-pipeline-list-pm',
        title: 'Pipeline List PM',
        subtitle: 'Tahapan Alur & PM Mendatang',
        view: 'pipelinePM',
        icon: Kanban,
      },
      {
        id: 'nav-auto-input-salur-pm',
        title: 'Auto Input List PM S-SALUR',
        subtitle: 'Automasi Resi & Follow-Up S-SALUR',
        view: 'autoInputListPMKhususSalur',
        icon: Sparkles,
        isSSalur: true,
      },
      {
        id: 'nav-template-pm',
        title: 'Template PM',
        subtitle: 'Master Template PM',
        view: 'templatePM',
        icon: MessageSquareText,
      },
      {
        id: 'nav-timeline-pm',
        title: 'Timeline PM',
        subtitle: 'Perjalanan PM & Transaksi',
        view: 'timelinePM',
        icon: Milestone,
      },
      {
        id: 'nav-rekening',
        title: 'Rekening',
        subtitle: 'Master Rekening Bank',
        view: 'rekening',
        icon: CreditCard,
      },
      {
        id: 'nav-mutasi',
        title: 'Mutasi Bank',
        subtitle: 'Mutasi Rekening Bank',
        view: 'mutasi',
        icon: ArrowLeftRight,
      },
      {
        id: 'nav-rincian-mutasi',
        title: 'Rincian Mutasi',
        subtitle: 'Koneksi Transaksi & Pengeluaran',
        view: 'rincianMutasi',
        icon: Receipt,
      },
      {
        id: 'nav-laporan-keuangan',
        title: 'Laporan Keuangan',
        subtitle: 'Rincian Mutasi Harian & Arus Kas',
        view: 'laporanKeuangan',
        icon: FileSpreadsheet,
      },
      {
        id: 'nav-jurnal-umum',
        title: 'Jurnal Umum',
        subtitle: 'Jurnal Berpasangan Otomatis Mutasi',
        view: 'jurnalUmum',
        icon: Receipt,
      },
      {
        id: 'nav-coa',
        title: 'COA (Bagan Akun)',
        subtitle: 'Chart of Accounts & Daftar Akun',
        view: 'coa',
        icon: BookOpen,
      },
      {
        id: 'nav-pos-keuangan',
        title: 'Pos Keuangan',
        subtitle: 'Master Pos Keuangan',
        view: 'posKeuangan',
        icon: Wallet,
      },
      {
        id: 'nav-pos-pemasukan',
        title: 'Pos Pemasukan',
        subtitle: 'Alokasi Pos Pemasukan',
        view: 'posPemasukan',
        icon: Coins,
      },
      {
        id: 'nav-pos-pemasukan-sub-jenis',
        title: 'Pos Pemasukan Sub-Jenis',
        subtitle: 'Navigasi Sub-Jenis ke Pos',
        view: 'posPemasukanSubJenis',
        icon: Layers,
      },
      {
        id: 'nav-pos-pengeluaran',
        title: 'Pos Pengeluaran',
        subtitle: 'Alokasi Pos Pengeluaran',
        view: 'posPengeluaran',
        icon: ArrowUpRight,
      },
      {
        id: 'nav-kelompok-biaya-coa',
        title: 'Kelompok Biaya COA',
        subtitle: 'Range COA & Kelompok Biaya',
        view: 'kelompokBiayaCoa',
        icon: FolderTree,
      },
      {
        id: 'nav-kebutuhan-pengeluaran',
        title: 'Kebutuhan Pengeluaran',
        subtitle: 'Kebutuhan, Pos & Kelompok',
        view: 'kebutuhanPengeluaran',
        icon: ClipboardList,
      },
      {
        id: 'nav-kumpulan-rekening',
        title: 'Kumpulan Rekening',
        subtitle: 'Daftar Rekening Bank & Identitas',
        view: 'kumpulanRekening',
        icon: CreditCard,
      },
      {
        id: 'nav-pengeluaran',
        title: 'Pengeluaran',
        subtitle: 'Catatan & Buku Pengeluaran',
        view: 'pengeluaran',
        icon: Receipt,
      },
      {
        id: 'nav-karyawan',
        title: 'Karyawan',
        subtitle: 'List Karyawan & Akses Login',
        view: 'karyawan',
        icon: Users,
      },
      {
        id: 'nav-form-cuti-karyawan',
        title: 'Form Cuti Karyawan',
        subtitle: 'Pengajuan & Rekap Cuti Karyawan',
        view: 'formCutiKaryawan',
        icon: CalendarOff,
      },
      {
        id: 'nav-rekap-absensi-karyawan',
        title: 'Rekap Absensi Karyawan',
        subtitle: 'Rekap Cuti & Absensi',
        view: 'rekapAbsensiKaryawan',
        icon: UserCheck,
      },
      {
        id: 'nav-list-account',
        title: 'List Account',
        subtitle: 'Master Akun, Akses & Password',
        view: 'listAccount',
        icon: KeyRound,
      },
      {
        id: 'nav-quick-reply',
        title: 'Quick Reply',
        subtitle: 'Template Balasan Cepat Pesan',
        view: 'quickReply',
        icon: MessageSquareReply,
      },
      {
        id: 'nav-list-faq',
        title: 'List FAQ',
        subtitle: 'FAQ & Tanya Jawab Proyek SAPA',
        view: 'listFaq',
        icon: HelpCircle,
      },
      {
        id: 'nav-tentang-list-faq',
        title: 'Tentang List FAQ',
        subtitle: 'Kategori Topik Tentang FAQ',
        view: 'tentangListFaq',
        icon: HelpCircle,
      },
      {
        id: 'nav-complaint',
        title: 'Complaint',
        subtitle: 'Daftar & Penanganan Komplain',
        view: 'complaint',
        icon: MessageSquareWarning,
      },
    ],
    [projects.length, identitasCount, organisasiCount]
  );

  const checkIsItemActive = (itemView: AppView, curView: AppView): boolean => {
    return (
      curView === itemView ||
      (itemView === 'table' && curView === 'form') ||
      (itemView === 'complaint' && curView === 'formComplaint') ||
      (itemView === 'listPromoSSalur' && curView === 'formListPromoSSalur') ||
      (itemView === 'transaksiSalur' && curView === 'formTransaksiSalur') ||
      (itemView === 'transaksiDonasi' && curView === 'formTransaksiDonasi') ||
      (itemView === 'itemDonasi' && curView === 'formItemDonasi') ||
      (itemView === 'itemAjar' && curView === 'formItemAjar') ||
      (itemView === 'organisasi' &&
        (curView === 'formOrganisasi' || curView === 'editOrganisasi')) ||
      (itemView === 'identitas' &&
        (curView === 'formIdentitas' ||
          curView === 'editIdentitas' ||
          curView === 'mergeDuplicates')) ||
      (itemView === 'listDharmaPatronRutin' &&
        curView === 'formListDharmaPatronRutin') ||
      (itemView === 'listAccount' && curView === 'formListAccount') ||
      (itemView === 'quickReply' && curView === 'formQuickReply') ||
      (itemView === 'listFaq' && curView === 'formListFaq') ||
      (itemView === 'pengeluaran' && curView === 'formPengeluaran') ||
      (itemView === 'listDatabaseAAjakItemSSebar' &&
        curView === 'formListDatabaseAAjakItemSSebar')
    );
  };

  const navItemsMap = useMemo(() => {
    const map = new Map<string, NavItemDef>();
    navItems.forEach((item) => map.set(item.id, item));
    return map;
  }, [navItems]);

  // Logical condensed categories grouping all items cleanly
  const categories: MenuCategoryDef[] = useMemo(
    () => [
      {
        id: 'cat-utama',
        title: 'Menu Utama',
        shortTitle: 'Utama',
        icon: Home,
        accentColor: '#05828e',
        badgeBg: 'bg-teal-50',
        badgeText: 'text-[#05828e]',
        itemIds: [
          'nav-home',
          'nav-identitas',
          'nav-organisasi',
          'nav-todo-list',
          'nav-calendar-todo-list',
          'nav-hari-khusus-calendar-todo-list',
          'nav-jenis-non-proyek-todo-list',
        ],
      },
      {
        id: 'cat-sapa',
        title: 'Proyek SAPA & PM',
        shortTitle: 'SAPA & PM',
        icon: Flower2,
        accentColor: '#0284c7',
        badgeBg: 'bg-sky-50',
        badgeText: 'text-sky-700',
        itemIds: [
          'nav-proyek-sapa',
          'nav-tambah-proyek',
          'nav-timeline-proyek-sapa',
          'nav-report-proyek',
          'nav-jenis-proyek',
          'nav-list-pm',
          'nav-rincian-list-pm',
          'nav-pipeline-list-pm',
          'nav-template-pm',
          'nav-timeline-pm',
          'nav-auto-input-salur-pm',
        ],
      },
      {
        id: 'cat-salur',
        title: 'S - SALUR',
        shortTitle: 'S-SALUR',
        icon: SSalurIcon,
        accentColor: '#05828e',
        badgeBg: 'bg-teal-50',
        badgeText: 'text-[#05828e]',
        itemIds: [
          'nav-transaksi-salur',
          'nav-pos-kasir-salur',
          'nav-list-promo-salur',
          'nav-resi-salur',
          'nav-agen-resi',
          'nav-item-salur',
          'nav-ongoing-create-item-salur',
          'nav-modal-item-salur',
          'nav-report-bep-salur',
          'nav-stok-item-salur',
          'nav-lokasi-stok-item-salur',
          'nav-stock-in-out-salur',
          'nav-jenis-perubahan-stock-salur',
          'nav-nama-percetakan-stock-salur',
          'nav-report-customer-salur',
          'nav-jenis-item-salur',
          'nav-sub-jenis-item-salur',
          'nav-kategori-item-salur',
          'nav-jenis-kategori-salur',
          'nav-via-transaksi-salur',
          'nav-jenis-via-transaksi-salur',
        ],
      },
      {
        id: 'cat-donasi',
        title: 'D - DONASI',
        shortTitle: 'D-DONASI',
        icon: DDonasiIcon,
        accentColor: '#f59e0b',
        badgeBg: 'bg-amber-50',
        badgeText: 'text-amber-700',
        itemIds: [
          'nav-transaksi-donasi',
          'nav-report-nama-pelimpahan-jasa-donasi',
          'nav-list-dharma-patron-rutin',
          'nav-jenis-perubahan-dpr',
          'nav-item-donasi',
          'nav-template-tanda-terima-donasi',
          'nav-sub-jenis-item-donasi',
          'nav-via-transaksi-donasi',
          'nav-jenis-via-transaksi-donasi',
        ],
      },
      {
        id: 'cat-ajak',
        title: 'A - AJAK & A-JAR',
        shortTitle: 'A-AJAK',
        icon: AAjarIcon,
        accentColor: '#8b5cf6',
        badgeBg: 'bg-purple-50',
        badgeText: 'text-purple-700',
        itemIds: [
          'nav-transaksi-ajar',
          'nav-item-ajar',
          'nav-sub-jenis-item-ajar',
          'nav-jenis-acara-item-ajar',
          'nav-pengisi-acara-item-ajar',
          'nav-via-transaksi-ajar',
          'nav-jenis-via-transaksi-ajar',
          'nav-list-database-aajak-all',
          'nav-list-database-aajak-item-ssebar',
          'nav-list-database-aajak-ajar',
          'nav-job-advance-ssebar',
          'nav-status-job-advance-ssebar',
        ],
      },
      {
        id: 'cat-keuangan',
        title: 'Keuangan & COA',
        shortTitle: 'Keuangan',
        icon: Wallet,
        accentColor: '#10b981',
        badgeBg: 'bg-emerald-50',
        badgeText: 'text-emerald-700',
        itemIds: [
          'nav-laporan-keuangan',
          'nav-jurnal-umum',
          'nav-mutasi',
          'nav-rincian-mutasi',
          'nav-pengeluaran',
          'nav-coa',
          'nav-pos-keuangan',
          'nav-pos-pemasukan',
          'nav-pos-pemasukan-sub-jenis',
          'nav-pos-pengeluaran',
          'nav-kelompok-biaya-coa',
          'nav-kebutuhan-pengeluaran',
          'nav-kumpulan-rekening',
          'nav-rekening',
        ],
      },
      {
        id: 'cat-operasional',
        title: 'Operasional & Master',
        shortTitle: 'Master & HR',
        icon: SlidersHorizontal,
        accentColor: '#64748b',
        badgeBg: 'bg-slate-100',
        badgeText: 'text-slate-700',
        itemIds: [
          'nav-karyawan',
          'nav-form-cuti-karyawan',
          'nav-rekap-absensi-karyawan',
          'nav-list-account',
          'nav-quick-reply',
          'nav-list-faq',
          'nav-tentang-list-faq',
          'nav-complaint',
          'nav-list-group-funneling',
          'nav-list-nama-group-funneling',
          'nav-jenis-group-funneling',
          'nav-konten-promosi',
          'nav-divisi',
          'nav-pekerjaan',
          'nav-triyana',
          'nav-mengenal-yppln',
          'nav-jenis-panggilan',
        ],
      },
    ],
    []
  );

  // Determine which category holds the current view
  const activeCategoryId = useMemo(() => {
    for (const cat of categories) {
      for (const itemId of cat.itemIds) {
        const item = navItemsMap.get(itemId);
        if (item && checkIsItemActive(item.view, currentView)) {
          return cat.id;
        }
      }
    }
    return 'cat-utama';
  }, [categories, navItemsMap, currentView]);

  // Track expanded categories (accordion). Default: expand active category
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => ({
    [activeCategoryId]: true,
  }));

  // Auto-expand the category when user switches view
  useEffect(() => {
    if (activeCategoryId) {
      setExpandedCategories((prev) => ({
        ...prev,
        [activeCategoryId]: true,
      }));
    }
  }, [activeCategoryId]);

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    categories.forEach((cat) => {
      allExpanded[cat.id] = true;
    });
    setExpandedCategories(allExpanded);
  };

  const handleCollapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    if (activeCategoryId) {
      allCollapsed[activeCategoryId] = true; // keep current active open
    }
    setExpandedCategories(allCollapsed);
  };

  // Search filtering logic
  const isSearching = searchQuery.trim().length > 0;
  const filteredNavItems = useMemo(() => {
    if (!isSearching) return [];
    const query = searchQuery.toLowerCase().trim();
    return navItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query)
    );
  }, [isSearching, searchQuery, navItems]);

  const renderNavButton = (item: NavItemDef, isCompact = true) => {
    const Icon = item.icon;
    const isActive = checkIsItemActive(item.view, currentView);

    return (
      <button
        key={item.id}
        id={item.id}
        type="button"
        onClick={() => {
          onSelectView(item.view);
          if (onMobileClose) onMobileClose();
        }}
        title={`${item.title} — ${item.subtitle}`}
        className={`group relative w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer text-left ${
          isActive
            ? 'bg-[#05828e] text-white shadow-xs font-semibold'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
        } ${isCollapsed ? 'justify-center px-1 py-2' : ''}`}
      >
        {/* Active left indicator bar */}
        {isActive && !isCollapsed && (
          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white/70 rounded-r" />
        )}

        {/* Icon */}
        <div
          className={`flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
            item.isLotus || item.isSSalur
              ? isActive
                ? 'text-white'
                : 'text-[#05828e]'
              : isActive
              ? 'text-white'
              : 'text-slate-500'
          }`}
        >
          <Icon
            className={`w-4 h-4 stroke-[2.1] ${
              item.isLotus ? 'text-amber-400 drop-shadow-2xs' : ''
            }`}
          />
        </div>

        {/* Label & Subtitle in compact single line */}
        {!isCollapsed && (
          <div className="flex items-center justify-between w-full min-w-0 overflow-hidden">
            <span className="text-[12.5px] leading-tight truncate tracking-tight">
              {item.title}
            </span>

            {item.badge !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1.5 shrink-0 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/70 text-slate-700'
                }`}
              >
                {item.badge}
              </span>
            )}
          </div>
        )}

        {/* Tooltip when collapsed */}
        {isCollapsed && (
          <div className="hidden group-hover:flex absolute left-full ml-2 z-50 bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl items-center gap-1.5 pointer-events-none">
            <span>{item.title}</span>
            {item.badge !== undefined && (
              <span className="bg-white/20 px-1 rounded text-[10px] font-bold">
                {item.badge}
              </span>
            )}
          </div>
        )}
      </button>
    );
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-white select-none">
      {/* Top Header & Brand */}
      <div className="flex flex-col">
        {/* Brand Section */}
        <div className="p-3.5 sm:p-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              id="sidebar-lotus-logo"
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#05828e] to-[#01b5a2] text-white flex items-center justify-center shadow-xs shrink-0 cursor-pointer hover:opacity-95"
              onClick={() => onSelectView('home')}
              title="Dashboard Utama Proyek SAPA"
            >
              <Flower2 className="w-5 h-5 stroke-[2.2]" />
            </div>

            {!isCollapsed && (
              <div
                className="flex flex-col min-w-0 cursor-pointer"
                onClick={() => onSelectView('home')}
              >
                <span className="font-bold text-slate-800 text-[15px] tracking-tight leading-none">
                  Proyek SAPA
                </span>
                <span className="text-[10.5px] font-medium text-slate-400 mt-1">
                  YPPLN Portal
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            id="btn-sidebar-collapse-toggle"
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Perluas Menu' : 'Perkecil Menu'}
            aria-label={isCollapsed ? 'Perluas Menu' : 'Perkecil Menu'}
            className="hidden md:flex w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 items-center justify-center transition-colors cursor-pointer"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>

          {/* Mobile close button */}
          {onMobileClose && (
            <button
              id="btn-sidebar-mobile-close"
              type="button"
              onClick={onMobileClose}
              title="Tutup Menu"
              aria-label="Tutup Menu"
              className="md:hidden w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Compact Quick Search Bar */}
        {!isCollapsed && (
          <div className="px-3 pt-2.5 pb-1.5">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari menu..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#05828e] focus:border-[#05828e] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Controls: Category Accordion Header */}
        {!isCollapsed && !isSearching && (
          <div className="px-3 py-1 flex items-center justify-between text-[10.5px] font-semibold text-slate-400 border-b border-slate-100/60 pb-1.5">
            <span>Kategori Menu</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCollapseAll}
                className="text-slate-400 hover:text-slate-700 transition-colors"
                title="Ringkas semua kategori"
              >
                Ringkas
              </button>
              <span className="text-slate-200">|</span>
              <button
                type="button"
                onClick={handleExpandAll}
                className="text-slate-400 hover:text-slate-700 transition-colors"
                title="Buka semua kategori"
              >
                Buka
              </button>
              <span className="text-slate-200">|</span>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="text-[#05828e] hover:underline flex items-center gap-0.5"
                title="Atur Susunan Menu"
              >
                <SlidersHorizontal className="w-2.5 h-2.5" />
                <span>Atur</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Scrollable Body (Max Height with Smooth Thin Scrollbar) */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
        {/* Case 1: Search Results */}
        {isSearching ? (
          <div className="flex flex-col gap-1">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-500">
              Hasil Pencarian ({filteredNavItems.length}):
            </div>
            {filteredNavItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Menu "{searchQuery}" tidak ditemukan
              </div>
            ) : (
              filteredNavItems.map((item) => renderNavButton(item))
            )}
          </div>
        ) : isCollapsed ? (
          /* Case 2: Collapsed Icon-Only Mode */
          <div className="flex flex-col gap-1.5 py-1">
            {categories.map((cat) => {
              const CatIcon = cat.icon;
              const isCategoryActive = cat.id === activeCategoryId;
              return (
                <div key={cat.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCollapsed(false);
                      setExpandedCategories({ [cat.id]: true });
                    }}
                    className={`w-full h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isCategoryActive
                        ? 'bg-[#05828e] text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title={cat.title}
                  >
                    <CatIcon className="w-4 h-4" />
                    {isCategoryActive && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-300 ring-2 ring-white" />
                    )}
                  </button>

                  {/* Flyout on hover for collapsed mode */}
                  <div className="hidden group-hover:flex flex-col absolute left-full top-0 ml-2 z-50 w-56 bg-white rounded-xl shadow-xl border border-slate-200 p-2 pointer-events-auto">
                    <div className="px-2 py-1 text-xs font-bold text-slate-700 border-b border-slate-100 mb-1 flex items-center justify-between">
                      <span>{cat.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {cat.itemIds.length} menu
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto">
                      {cat.itemIds.map((itemId) => {
                        const item = navItemsMap.get(itemId);
                        if (!item) return null;
                        const isActive = checkIsItemActive(item.view, currentView);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              onSelectView(item.view);
                              if (onMobileClose) onMobileClose();
                            }}
                            className={`flex items-center gap-2 px-2 py-1 rounded text-xs text-left cursor-pointer ${
                              isActive
                                ? 'bg-[#05828e] text-white font-semibold'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="truncate">{item.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Case 3: Expanded Categorized Accordion (Compact, Summarized Sidebar) */
          categories.map((cat) => {
            const CatIcon = cat.icon;
            const isCategoryActive = cat.id === activeCategoryId;
            const isExpanded = !!expandedCategories[cat.id];
            const activeInside = cat.itemIds.some((id) => {
              const item = navItemsMap.get(id);
              return item && checkIsItemActive(item.view, currentView);
            });

            return (
              <div
                key={cat.id}
                className={`rounded-xl transition-all border ${
                  activeInside
                    ? 'border-teal-200/80 bg-teal-50/20 shadow-2xs'
                    : 'border-transparent hover:border-slate-100'
                }`}
              >
                {/* Accordion Category Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer text-left select-none ${
                    activeInside
                      ? 'bg-teal-50/90 text-[#046c76] font-semibold'
                      : 'text-slate-700 hover:bg-slate-100/80 font-medium'
                  }`}
                  title={`Klik untuk buka/tutup kategori ${cat.title}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        activeInside
                          ? 'bg-[#05828e] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <CatIcon className="w-3.5 h-3.5" />
                    </div>

                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-[13px] tracking-tight font-medium">
                        {cat.title}
                      </span>
                      {activeInside && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#05828e] shrink-0"
                          title="Menu aktif ada di kategori ini"
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        activeInside
                          ? 'bg-teal-100 text-[#05828e]'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {cat.itemIds.length}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Collapsible Items List */}
                {isExpanded && (
                  <div className="px-1 pt-1 pb-1.5 flex flex-col gap-0.5 animate-in fade-in duration-150">
                    {cat.itemIds.map((itemId) => {
                      const item = navItemsMap.get(itemId);
                      if (!item) return null;
                      return renderNavButton(item, true);
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Compact Footer: Status Indicator & User Profile */}
      <div className="p-2.5 border-t border-slate-100 flex flex-col gap-2 shrink-0">
        {!isCollapsed ? (
          <>
            {/* Collapsible Status Legend to keep sidebar height small */}
            <div className="bg-slate-50/90 rounded-xl border border-slate-100 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowStatusLegend(!showStatusLegend)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#05828e]" />
                  <span>Ringkasan Proyek</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <span className="font-bold text-slate-700">
                    {waitingCount + ongoingCount + doneCount}
                  </span>
                  {showStatusLegend ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </div>
              </button>

              {showStatusLegend && (
                <div className="px-2.5 pb-2 pt-1 border-t border-slate-100/80 flex flex-col gap-1 text-[11px] animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#05828e]" />
                      <span>Waiting Acc</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#05828e]/10 text-[#05828e]">
                      {waitingCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#fbc02d]" />
                      <span>Ongoing</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {ongoingCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300" />
                      <span>Done</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200/80 text-slate-700">
                      {doneCount}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Bar */}
            <div className="flex items-center justify-between p-1.5 px-2 rounded-xl bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-teal-100 text-[#05828e] flex items-center justify-center font-bold text-xs">
                  S
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    SAPA Admin
                  </div>
                  <div className="text-[10px] text-slate-400">YPPLN Online</div>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
            </div>
          </>
        ) : (
          <div className="flex justify-center py-1">
            <span
              className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100"
              title="Online"
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        id="desktop-left-sidebar"
        className={`hidden md:block shrink-0 bg-white border-r border-slate-200/80 h-screen sticky top-0 transition-all duration-300 z-30 shadow-xs ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          id="mobile-sidebar-backdrop"
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 animate-in fade-in duration-200"
          onClick={onMobileClose}
        >
          {/* Mobile Drawer */}
          <div
            id="mobile-left-sidebar"
            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-2xl z-50 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Modal Susun Menu & More Menu */}
      <EditMenuArrangementModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        allNavItems={navItems}
        currentConfig={menuConfig}
        onSave={(newConfig) => {
          setMenuConfig(newConfig);
          saveMenuArrangementConfig(newConfig);
        }}
        onReset={() => {
          const defaultConfig = resetMenuArrangementConfig();
          setMenuConfig(defaultConfig);
        }}
      />
    </>
  );
};
