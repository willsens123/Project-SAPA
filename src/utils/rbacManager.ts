import {
  AppView,
  DivisionAccessRule,
  KaryawanItem,
  PermissionKey,
  ProjectItem,
  RbacPolicyConfig,
  UserRole,
} from '../types';

export interface RoleMetadata {
  role: UserRole;
  label: string;
  shortLabel: string;
  description: string;
  badgeClass: string;
}

export const ROLE_METADATA: Record<UserRole, RoleMetadata> = {
  super_admin: {
    role: 'super_admin',
    label: 'Super Admin',
    shortLabel: 'Super Admin',
    description:
      'Akses penuh ke seluruh modul, pengaturan hak akses role & divisi, merge & rollback profil, audit log, dan manajemen akun.',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
  },
  kepala_divisi: {
    role: 'kepala_divisi',
    label: 'Kepala Divisi',
    shortLabel: 'Kadiv',
    description:
      'Kelola proyek & tugas divisi, identitas & smart merge (termasuk rollback), pelaporan operasional, serta investigasi audit.',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
  },
  admin_operasional: {
    role: 'admin_operasional',
    label: 'Admin Operasional',
    shortLabel: 'Admin Ops',
    description:
      'Input & edit profil identitas, proyek SAPA, To-Do List, transaksi S-Salur, Donasi, A-AJAR, dan Merge Duplikat.',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
  },
  finance_audit: {
    role: 'finance_audit',
    label: 'Finance & Audit',
    shortLabel: 'Finance/Audit',
    description:
      'Fokus pada keuangan, mutasi, COA, ekspor CSV audit log, investigasi anomali, serta rollback merge jika diperlukan.',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  },
  viewer: {
    role: 'viewer',
    label: 'Viewer (Read-Only)',
    shortLabel: 'Viewer',
    description:
      'Akses lihat saja ke ringkasan dashboard, daftar identitas, proyek, dan laporan tanpa izin ubah, hapus, atau merge.',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
};

export const ALL_ROLES: UserRole[] = [
  'super_admin',
  'kepala_divisi',
  'admin_operasional',
  'finance_audit',
  'viewer',
];

export interface PermissionMeta {
  key: PermissionKey;
  label: string;
  description: string;
  category: 'Umum' | 'Identitas & Merge' | 'Audit & Keamanan' | 'Keuangan & Proyek' | 'Administrasi';
}

export const PERMISSION_CATALOG: PermissionMeta[] = [
  {
    key: 'viewHome',
    label: 'Lihat Dashboard Utama',
    description: 'Mengakses beranda utama dan statistik ringkas SAPA ERP.',
    category: 'Umum',
  },
  {
    key: 'viewIdentitas',
    label: 'Lihat Identitas & Relasi',
    description: 'Melihat daftar identitas, organisasi, DPR, dan database relawan.',
    category: 'Identitas & Merge',
  },
  {
    key: 'editIdentitas',
    label: 'Tambah & Edit Identitas',
    description: 'Menambah profil identitas baru dan mengubah data kontak/alamat.',
    category: 'Identitas & Merge',
  },
  {
    key: 'mergeDuplicates',
    label: 'Smart Merge Duplikat',
    description: 'Menjalankan penggabungan profil duplikat dan migrasi transaksi.',
    category: 'Identitas & Merge',
  },
  {
    key: 'undoMerge',
    label: 'Rollback / Undo Merge',
    description: 'Membatalkan sesi merge dan memulihkan profil beserta transaksi terkait.',
    category: 'Identitas & Merge',
  },
  {
    key: 'deleteData',
    label: 'Hapus Data Master & Transaksi',
    description: 'Menghapus proyek, identitas, organisasi, atau riwayat audit.',
    category: 'Administrasi',
  },
  {
    key: 'viewAuditLog',
    label: 'Akses Audit Log Pusat',
    description: 'Melihat histori perubahan terpadu lintas modul.',
    category: 'Audit & Keamanan',
  },
  {
    key: 'manageAnomalies',
    label: 'Kelola Anomali Audit',
    description: 'Memicu pemindaian anomali dan menandai investigasi/abaikan.',
    category: 'Audit & Keamanan',
  },
  {
    key: 'exportAuditCsv',
    label: 'Ekspor CSV Audit Log',
    description: 'Mengunduh data audit log terfilter dalam format CSV.',
    category: 'Audit & Keamanan',
  },
  {
    key: 'viewFinance',
    label: 'Akses Keuangan & Transaksi',
    description: 'Melihat dan mengelola S-Salur, Donasi, A-AJAR, Pengeluaran, Mutasi, & COA.',
    category: 'Keuangan & Proyek',
  },
  {
    key: 'manageProjects',
    label: 'Kelola Proyek SAPA & To-Do',
    description: 'Membuat, memperbarui, dan mengatur status proyek serta To-Do List.',
    category: 'Keuangan & Proyek',
  },
  {
    key: 'manageAccountsAndRoles',
    label: 'Kelola Akun & Hak Akses RBAC',
    description: 'Mengubah peran admin, aturan divisi, serta status akun anggota.',
    category: 'Administrasi',
  },
];

export const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSION_CATALOG.map((p) => p.key);

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Record<PermissionKey, boolean>> = {
  super_admin: {
    viewHome: true,
    viewIdentitas: true,
    editIdentitas: true,
    mergeDuplicates: true,
    undoMerge: true,
    deleteData: true,
    viewAuditLog: true,
    manageAnomalies: true,
    exportAuditCsv: true,
    viewFinance: true,
    manageProjects: true,
    manageAccountsAndRoles: true,
  },
  kepala_divisi: {
    viewHome: true,
    viewIdentitas: true,
    editIdentitas: true,
    mergeDuplicates: true,
    undoMerge: true,
    deleteData: false,
    viewAuditLog: true,
    manageAnomalies: true,
    exportAuditCsv: true,
    viewFinance: true,
    manageProjects: true,
    manageAccountsAndRoles: false,
  },
  admin_operasional: {
    viewHome: true,
    viewIdentitas: true,
    editIdentitas: true,
    mergeDuplicates: true,
    undoMerge: false,
    deleteData: false,
    viewAuditLog: true,
    manageAnomalies: false,
    exportAuditCsv: false,
    viewFinance: true,
    manageProjects: true,
    manageAccountsAndRoles: false,
  },
  finance_audit: {
    viewHome: true,
    viewIdentitas: true,
    editIdentitas: false,
    mergeDuplicates: false,
    undoMerge: true,
    deleteData: false,
    viewAuditLog: true,
    manageAnomalies: true,
    exportAuditCsv: true,
    viewFinance: true,
    manageProjects: false,
    manageAccountsAndRoles: false,
  },
  viewer: {
    viewHome: true,
    viewIdentitas: true,
    editIdentitas: false,
    mergeDuplicates: false,
    undoMerge: false,
    deleteData: false,
    viewAuditLog: true,
    manageAnomalies: false,
    exportAuditCsv: false,
    viewFinance: false,
    manageProjects: false,
    manageAccountsAndRoles: false,
  },
};

export const DEFAULT_DIVISION_RULES: Record<string, DivisionAccessRule> = {
  UMM: {
    divisiKode: 'UMM',
    label: 'Umum & Sekretariat',
    allowedModules: [...ALL_PERMISSION_KEYS],
    restrictToOwnDivisionProjects: false,
  },
  OPS: {
    divisiKode: 'OPS',
    label: 'Operasional & Penyaluran',
    allowedModules: [
      'viewHome',
      'viewIdentitas',
      'editIdentitas',
      'mergeDuplicates',
      'viewAuditLog',
      'viewFinance',
      'manageProjects',
    ],
    restrictToOwnDivisionProjects: false,
  },
  FUN: {
    divisiKode: 'FUN',
    label: 'Fundraising & Dharma Patron',
    allowedModules: [
      'viewHome',
      'viewIdentitas',
      'editIdentitas',
      'mergeDuplicates',
      'viewAuditLog',
      'exportAuditCsv',
      'viewFinance',
      'manageProjects',
    ],
    restrictToOwnDivisionProjects: false,
  },
  PNB: {
    divisiKode: 'PNB',
    label: 'Penerbitan & Buku',
    allowedModules: [
      'viewHome',
      'viewIdentitas',
      'editIdentitas',
      'viewAuditLog',
      'viewFinance',
      'manageProjects',
    ],
    restrictToOwnDivisionProjects: false,
  },
  MED: {
    divisiKode: 'MED',
    label: 'Media & Promosi',
    allowedModules: ['viewHome', 'viewIdentitas', 'editIdentitas', 'viewAuditLog', 'manageProjects'],
    restrictToOwnDivisionProjects: false,
  },
  PRO: {
    divisiKode: 'PRO',
    label: 'Program & A-AJAR',
    allowedModules: [
      'viewHome',
      'viewIdentitas',
      'editIdentitas',
      'viewAuditLog',
      'viewFinance',
      'manageProjects',
    ],
    restrictToOwnDivisionProjects: false,
  },
};

export function createDefaultRbacConfig(): RbacPolicyConfig {
  return {
    id: 'rbac_permissions',
    updatedAt: new Date().toISOString(),
    updatedBy: 'System',
    rolePermissions: {
      super_admin: { ...DEFAULT_ROLE_PERMISSIONS.super_admin },
      kepala_divisi: { ...DEFAULT_ROLE_PERMISSIONS.kepala_divisi },
      admin_operasional: { ...DEFAULT_ROLE_PERMISSIONS.admin_operasional },
      finance_audit: { ...DEFAULT_ROLE_PERMISSIONS.finance_audit },
      viewer: { ...DEFAULT_ROLE_PERMISSIONS.viewer },
    },
    divisionRules: Object.fromEntries(
      Object.entries(DEFAULT_DIVISION_RULES).map(([k, v]) => [
        k,
        { ...v, allowedModules: [...v.allowedModules] },
      ])
    ),
  };
}

export function normalizeRbacConfig(raw?: Partial<RbacPolicyConfig> | null): RbacPolicyConfig {
  const defaults = createDefaultRbacConfig();
  if (!raw || typeof raw !== 'object') return defaults;

  const mergedRoles = { ...defaults.rolePermissions };
  ALL_ROLES.forEach((role) => {
    mergedRoles[role] = {
      ...defaults.rolePermissions[role],
      ...(raw.rolePermissions?.[role] || {}),
    };
  });
  // Safeguard: Super Admin always retains role & dashboard administration so system cannot be locked out
  mergedRoles.super_admin.viewHome = true;
  mergedRoles.super_admin.manageAccountsAndRoles = true;

  const mergedDivs: Record<string, DivisionAccessRule> = { ...defaults.divisionRules };
  if (raw.divisionRules && typeof raw.divisionRules === 'object') {
    Object.entries(raw.divisionRules).forEach(([kode, rule]) => {
      if (rule && Array.isArray(rule.allowedModules)) {
        mergedDivs[kode] = {
          divisiKode: kode,
          label: rule.label || mergedDivs[kode]?.label || kode,
          allowedModules: rule.allowedModules,
          restrictToOwnDivisionProjects: Boolean(rule.restrictToOwnDivisionProjects),
        };
      }
    });
  }

  return {
    id: 'rbac_permissions',
    updatedAt: raw.updatedAt || defaults.updatedAt,
    updatedBy: raw.updatedBy || defaults.updatedBy,
    rolePermissions: mergedRoles,
    divisionRules: mergedDivs,
  };
}

export function resolveEffectiveRole(user: KaryawanItem | null | undefined): UserRole {
  if (!user) return 'viewer';
  if (user.role && ALL_ROLES.includes(user.role)) {
    return user.role;
  }
  // Safe fallback for legacy records without explicit `role`
  if (user.id === 'karyawan-1' || user.kodeKaryawan === '00031') {
    return 'super_admin';
  }
  return 'admin_operasional';
}

export function getEffectivePermissions(
  user: KaryawanItem | null | undefined,
  config?: RbacPolicyConfig | null
): Record<PermissionKey, boolean> {
  const policy = normalizeRbacConfig(config);
  const role = resolveEffectiveRole(user);
  const roleBase = { ...policy.rolePermissions[role] };

  if (!user) {
    return { ...policy.rolePermissions.viewer };
  }

  // Super Admin bypasses division module caps so system admin retains full recovery access
  if (role !== 'super_admin') {
    const divKey = (user.divisi || '').trim().toUpperCase();
    const divRule = policy.divisionRules[divKey];
    if (divRule && Array.isArray(divRule.allowedModules)) {
      ALL_PERMISSION_KEYS.forEach((perm) => {
        if (!divRule.allowedModules.includes(perm)) {
          roleBase[perm] = false;
        }
      });
    }
  }

  // User-level custom permission overrides (if configured by Super Admin)
  if (user.customPermissions) {
    ALL_PERMISSION_KEYS.forEach((perm) => {
      if (typeof user.customPermissions?.[perm] === 'boolean') {
        roleBase[perm] = Boolean(user.customPermissions[perm]);
      }
    });
  }

  return roleBase;
}

export function hasPermission(
  user: KaryawanItem | null | undefined,
  permission: PermissionKey,
  config?: RbacPolicyConfig | null
): boolean {
  if (!user) return false;
  const perms = getEffectivePermissions(user, config);
  return Boolean(perms[permission]);
}

const VIEW_PERMISSION_MAP: Partial<Record<AppView, PermissionKey>> = {
  home: 'viewHome',
  identitas: 'viewIdentitas',
  formIdentitas: 'editIdentitas',
  editIdentitas: 'viewIdentitas',
  mergeDuplicates: 'mergeDuplicates',
  organisasi: 'viewIdentitas',
  formOrganisasi: 'editIdentitas',
  editOrganisasi: 'viewIdentitas',
  jenisPanggilan: 'viewIdentitas',
  triyana: 'viewIdentitas',
  pekerjaan: 'viewIdentitas',
  mengenalYppln: 'viewIdentitas',
  divisi: 'manageAccountsAndRoles',
  listDharmaPatronRutin: 'viewIdentitas',
  formListDharmaPatronRutin: 'editIdentitas',
  jenisPerubahanDharmaPatron: 'editIdentitas',
  listDatabaseAAjakAll: 'viewIdentitas',
  listDatabaseAAjakItemSSebar: 'viewIdentitas',
  formListDatabaseAAjakItemSSebar: 'editIdentitas',
  listDatabaseAAjakAJar: 'viewIdentitas',
  formListDatabaseAAjakAJar: 'editIdentitas',
  jobAdvanceFormListDatabaseAAjakItemSSebar: 'editIdentitas',
  statusJobAdvanceFormListDatabaseAAjakItemSSebar: 'editIdentitas',

  auditLog: 'viewAuditLog',

  table: 'manageProjects',
  form: 'manageProjects',
  jenisProyek: 'manageProjects',
  todoList: 'manageProjects',
  formTodoList: 'manageProjects',
  calendarTodoList: 'manageProjects',
  hariKhususCalendarTodoList: 'manageProjects',
  jenisNonProyekTodoList: 'manageProjects',
  timelineProyekSapa: 'manageProjects',

  karyawan: 'manageAccountsAndRoles',
  formCutiKaryawan: 'manageProjects',
  rekapAbsensiKaryawan: 'manageAccountsAndRoles',
  listAccount: 'manageAccountsAndRoles',
  formListAccount: 'manageAccountsAndRoles',

  transaksiSalur: 'viewFinance',
  posKasirTransaksiSalur: 'viewFinance',
  formTransaksiSalur: 'viewFinance',
  formTransaksiSalurHadiah: 'viewFinance',
  resi: 'viewFinance',
  agenResi: 'viewFinance',
  listPromoSSalur: 'viewFinance',
  formListPromoSSalur: 'viewFinance',
  viaTransaksiSalur: 'viewFinance',
  jenisViaTransaksiSalur: 'viewFinance',
  itemSalur: 'viewFinance',
  ongoingCreateItemSalur: 'viewFinance',
  modalItemSalur: 'viewFinance',
  stokItemSalur: 'viewFinance',
  lokasiStokItemSalur: 'viewFinance',
  stockInOutSalur: 'viewFinance',
  formStockInOutSalur: 'viewFinance',
  jenisPerubahanStockSalur: 'viewFinance',
  namaPercetakanStockSalur: 'viewFinance',
  formItemSalur: 'viewFinance',
  jenisItemSalur: 'viewFinance',
  subJenisItemSalur: 'viewFinance',
  kategoriItemSalur: 'viewFinance',
  jenisKategoriItemSalur: 'viewFinance',
  report: 'viewFinance',
  reportCustomerSalur: 'viewFinance',
  reportBepSalur: 'viewFinance',

  transaksiDonasi: 'viewFinance',
  formTransaksiDonasi: 'viewFinance',
  reportNamaPelimpahanJasaDonasi: 'viewFinance',
  itemDonasi: 'viewFinance',
  formItemDonasi: 'viewFinance',
  subJenisItemDonasi: 'viewFinance',
  alokasiDonasiSalur: 'viewFinance',
  viaTransaksiDonasi: 'viewFinance',
  jenisViaTransaksiDonasi: 'viewFinance',

  transaksiAjar: 'viewFinance',
  formTransaksiAjar: 'viewFinance',
  itemAjar: 'viewFinance',
  formItemAjar: 'viewFinance',
  subJenisItemAjar: 'viewFinance',
  jenisAcaraItemAjar: 'viewFinance',
  pengisiAcaraItemAjar: 'viewFinance',
  viaTransaksiAjar: 'viewFinance',
  jenisViaTransaksiAjar: 'viewFinance',

  rekening: 'viewFinance',
  mutasi: 'viewFinance',
  rincianMutasi: 'viewFinance',
  posKeuangan: 'viewFinance',
  posPemasukan: 'viewFinance',
  posPemasukanSubJenis: 'viewFinance',
  posPengeluaran: 'viewFinance',
  kelompokBiayaCoa: 'viewFinance',
  kebutuhanPengeluaran: 'viewFinance',
  pengeluaran: 'viewFinance',
  formPengeluaran: 'viewFinance',
  kumpulanRekening: 'viewFinance',
  laporanKeuangan: 'viewFinance',
  jurnalUmum: 'viewFinance',
  coa: 'viewFinance',
};

export function getRequiredPermissionForView(view: AppView): PermissionKey {
  return VIEW_PERMISSION_MAP[view] || 'viewHome';
}

export function canAccessView(
  user: KaryawanItem | null | undefined,
  view: AppView,
  config?: RbacPolicyConfig | null
): boolean {
  if (!user) return false;
  // Special case: Karyawan view should be accessible to manageAccountsAndRoles
  const req = getRequiredPermissionForView(view);
  return hasPermission(user, req, config);
}

export function shouldRestrictProjectsToDivision(
  user: KaryawanItem | null | undefined,
  config?: RbacPolicyConfig | null
): boolean {
  if (!user) return false;
  const role = resolveEffectiveRole(user);
  if (role === 'super_admin') return false;
  const policy = normalizeRbacConfig(config);
  const divKey = (user.divisi || '').trim().toUpperCase();
  if (!divKey) return false;
  return Boolean(policy.divisionRules[divKey]?.restrictToOwnDivisionProjects);
}

export function filterProjectsForUser(
  projects: ProjectItem[],
  user: KaryawanItem | null | undefined,
  config?: RbacPolicyConfig | null
): ProjectItem[] {
  if (!shouldRestrictProjectsToDivision(user, config)) return projects;
  const userDiv = (user?.divisi || '').trim().toUpperCase();
  if (!userDiv) return projects;
  return projects.filter((p) => (p.divisi || '').trim().toUpperCase() === userDiv);
}

export function formatAuditActorName(
  user: KaryawanItem | null | undefined,
  fallback = 'Sistem SAPA'
): string {
  if (!user || !user.namaLengkap) return fallback;
  const div = (user.divisi || '').trim().toUpperCase();
  return div ? `${user.namaLengkap} (${div})` : user.namaLengkap;
}

