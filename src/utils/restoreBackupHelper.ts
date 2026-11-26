import { AllApplicationData } from './exportAllDataHelper';

export type RestoreMode = 'merge' | 'overwrite';

export type BackupModuleKey =
  | 'projects'
  | 'jenisProyek'
  | 'identitas'
  | 'identitasChangeLogs'
  | 'organisasi'
  | 'mutasiBank'
  | 'transaksiSalur'
  | 'salurItems'
  | 'stokSalurItems'
  | 'gudangSalurData'
  | 'stockInOutSalur'
  | 'lokasiStokSalur'
  | 'jenisPerubahanSalur'
  | 'transaksiDonasi'
  | 'dharmaPatronRutin'
  | 'transaksiAjar'
  | 'pengeluaran'
  | 'posKeuangan'
  | 'coaAccounts'
  | 'kumpulanRekening'
  | 'rekeningList'
  | 'kebutuhanPengeluaran'
  | 'posPengeluaran'
  | 'posPemasukan'
  | 'todoTasks'
  | 'complaints'
  | 'quickReplies'
  | 'faqs'
  | 'listPM'
  | 'volunteersSSebar'
  | 'volunteersAJar'
  | 'cutiKaryawan'
  | 'karyawan';

export interface BackupModuleDefinition {
  key: BackupModuleKey;
  label: string;
  category: 'Proyek & Tugas' | 'Relawan & HR' | 'Keuangan & Akuntansi' | 'S-SALUR & Gudang' | 'Layanan & PM';
  isTodoMap?: boolean;
  isSensitiveAccount?: boolean;
}

export const BACKUP_MODULE_DEFINITIONS: BackupModuleDefinition[] = [
  { key: 'projects', label: 'Proyek SAPA', category: 'Proyek & Tugas' },
  { key: 'jenisProyek', label: 'Master Jenis Proyek', category: 'Proyek & Tugas' },
  { key: 'todoTasks', label: 'To-Do List Proyek', category: 'Proyek & Tugas', isTodoMap: true },

  { key: 'identitas', label: 'Relawan & Donatur (Identitas)', category: 'Relawan & HR' },
  { key: 'identitasChangeLogs', label: 'Log Perubahan Identitas', category: 'Relawan & HR' },
  { key: 'organisasi', label: 'Organisasi Mitra', category: 'Relawan & HR' },
  { key: 'volunteersSSebar', label: 'Volunteer Item S-SEBAR', category: 'Relawan & HR' },
  { key: 'volunteersAJar', label: 'Volunteer A-JAR', category: 'Relawan & HR' },
  { key: 'cutiKaryawan', label: 'Cuti Karyawan', category: 'Relawan & HR' },
  { key: 'karyawan', label: 'Akun & Karyawan Yayasan', category: 'Relawan & HR', isSensitiveAccount: true },

  { key: 'mutasiBank', label: 'Mutasi Rekening Bank', category: 'Keuangan & Akuntansi' },
  { key: 'transaksiDonasi', label: 'Transaksi D-DONASI', category: 'Keuangan & Akuntansi' },
  { key: 'dharmaPatronRutin', label: 'Dharma Patron Rutin', category: 'Keuangan & Akuntansi' },
  { key: 'transaksiAjar', label: 'Transaksi A-AJAR', category: 'Keuangan & Akuntansi' },
  { key: 'pengeluaran', label: 'Pengeluaran Kas', category: 'Keuangan & Akuntansi' },
  { key: 'posKeuangan', label: 'Pos Keuangan', category: 'Keuangan & Akuntansi' },
  { key: 'coaAccounts', label: 'Chart of Accounts (COA)', category: 'Keuangan & Akuntansi' },
  { key: 'kumpulanRekening', label: 'Kumpulan Rekening Donatur', category: 'Keuangan & Akuntansi' },
  { key: 'rekeningList', label: 'Daftar Rekening Bank', category: 'Keuangan & Akuntansi' },
  { key: 'kebutuhanPengeluaran', label: 'Kebutuhan Pengeluaran', category: 'Keuangan & Akuntansi' },
  { key: 'posPengeluaran', label: 'Pos Pengeluaran', category: 'Keuangan & Akuntansi' },
  { key: 'posPemasukan', label: 'Pos Pemasukan', category: 'Keuangan & Akuntansi' },

  { key: 'transaksiSalur', label: 'Transaksi S-SALUR', category: 'S-SALUR & Gudang' },
  { key: 'salurItems', label: 'Katalog Item S-SALUR', category: 'S-SALUR & Gudang' },
  { key: 'stokSalurItems', label: 'Stok Item S-SALUR', category: 'S-SALUR & Gudang' },
  { key: 'gudangSalurData', label: 'Gudang & Kontainer S-SALUR', category: 'S-SALUR & Gudang' },
  { key: 'stockInOutSalur', label: 'Log Stock In-Out S-SALUR', category: 'S-SALUR & Gudang' },
  { key: 'lokasiStokSalur', label: 'Master Lokasi Stok S-SALUR', category: 'S-SALUR & Gudang' },
  { key: 'jenisPerubahanSalur', label: 'Jenis Perubahan Stok S-SALUR', category: 'S-SALUR & Gudang' },

  { key: 'listPM', label: 'List PM (Pesan Masuk/Keluar)', category: 'Layanan & PM' },
  { key: 'complaints', label: 'Komplain / Keluhan', category: 'Layanan & PM' },
  { key: 'quickReplies', label: 'Quick Reply CS', category: 'Layanan & PM' },
  { key: 'faqs', label: 'Daftar FAQ', category: 'Layanan & PM' },
];

export interface ModuleBackupPreviewItem {
  key: BackupModuleKey;
  label: string;
  category: BackupModuleDefinition['category'];
  presentInFile: boolean;
  backupCount: number;
  currentCount: number;
  newInMergeCount: number;
  updatedInMergeCount: number;
  isSensitiveAccount?: boolean;
}

export interface ParsedBackupPreviewResult {
  valid: boolean;
  error?: string;
  fileName: string;
  metadata: {
    appName: string;
    version: string;
    exportedAtFormatted: string;
    exportedBy: string;
    totalBackupRecords: number;
  };
  parsedData?: Partial<AllApplicationData>;
  modules: ModuleBackupPreviewItem[];
}

export interface RestoreBackupRequest {
  fileName: string;
  mode: RestoreMode;
  selectedModules: BackupModuleKey[];
  parsedData: Partial<AllApplicationData>;
}

export interface RestoreBackupExecutionResult {
  success: boolean;
  autoBackupFilename: string;
  restoredModuleCount: number;
  totalRestoredRecords: number;
  cloudSynced: boolean;
  mode: RestoreMode;
  restoredLabels: string[];
  error?: string;
}

function resolveItemUniqueKey(key: BackupModuleKey, item: any): string {
  if (!item || typeof item !== 'object') return '';
  if (key === 'coaAccounts') {
    return String(item.noAkun || item.id || '').trim();
  }
  const primary =
    item.id ||
    item.codeId ||
    item.noDonatur ||
    item.orderNumber ||
    item.kode ||
    item.no ||
    item.namaLokasi;
  return primary ? String(primary).trim() : '';
}

function countTodoTasks(mapVal: unknown): number {
  if (!mapVal || typeof mapVal !== 'object' || Array.isArray(mapVal)) return 0;
  return Object.values(mapVal as Record<string, any[]>).reduce(
    (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
    0
  );
}

export function mergeModuleArrays<T>(
  key: BackupModuleKey,
  currentArr: T[],
  backupArr: T[]
): { merged: T[]; addedCount: number; updatedCount: number } {
  const safeCurrent = Array.isArray(currentArr) ? currentArr : [];
  const safeBackup = Array.isArray(backupArr) ? backupArr : [];

  const result: T[] = [...safeCurrent];
  const indexByKey = new Map<string, number>();
  const rawSet = new Set<string>();

  safeCurrent.forEach((item, idx) => {
    const k = resolveItemUniqueKey(key, item);
    if (k) {
      indexByKey.set(k, idx);
    } else {
      try {
        rawSet.add(JSON.stringify(item));
      } catch {
        // ignore serialization fallback
      }
    }
  });

  let addedCount = 0;
  let updatedCount = 0;

  safeBackup.forEach((incoming) => {
    if (!incoming || typeof incoming !== 'object') return;
    const k = resolveItemUniqueKey(key, incoming);
    if (k) {
      const existingIdx = indexByKey.get(k);
      if (existingIdx !== undefined) {
        result[existingIdx] = {
          ...(result[existingIdx] as Record<string, any>),
          ...(incoming as Record<string, any>),
        } as T;
        updatedCount++;
      } else {
        indexByKey.set(k, result.length);
        result.push(incoming);
        addedCount++;
      }
    } else {
      let serialized = '';
      try {
        serialized = JSON.stringify(incoming);
      } catch {
        serialized = '';
      }
      if (!serialized || !rawSet.has(serialized)) {
        if (serialized) rawSet.add(serialized);
        result.push(incoming);
        addedCount++;
      }
    }
  });

  return { merged: result, addedCount, updatedCount };
}

export function mergeTodoTaskMaps(
  currentMap: Record<string, any[]>,
  backupMap: Record<string, any[]>
): { merged: Record<string, any[]>; addedCount: number; updatedCount: number } {
  const next: Record<string, any[]> = { ...(currentMap || {}) };
  let addedCount = 0;
  let updatedCount = 0;

  Object.entries(backupMap || {}).forEach(([projectId, incomingTasks]) => {
    if (!Array.isArray(incomingTasks)) return;
    const existingTasks = Array.isArray(next[projectId]) ? next[projectId] : [];
    const { merged, addedCount: a, updatedCount: u } = mergeModuleArrays(
      'todoTasks',
      existingTasks,
      incomingTasks
    );
    next[projectId] = merged;
    addedCount += a;
    updatedCount += u;
  });

  return { merged: next, addedCount, updatedCount };
}

export function parseBackupJsonAndPreview(
  rawText: string,
  fileName: string,
  currentData: AllApplicationData
): ParsedBackupPreviewResult {
  if (!rawText || !rawText.trim()) {
    return {
      valid: false,
      error: 'File JSON kosong dan tidak berisi data.',
      fileName,
      metadata: {
        appName: '-',
        version: '-',
        exportedAtFormatted: '-',
        exportedBy: '-',
        totalBackupRecords: 0,
      },
      modules: [],
    };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return {
      valid: false,
      error: 'Format JSON tidak valid. Pastikan file merupakan hasil ekspor JSON dari sistem YPPLN.',
      fileName,
      metadata: {
        appName: '-',
        version: '-',
        exportedAtFormatted: '-',
        exportedBy: '-',
        totalBackupRecords: 0,
      },
      modules: [],
    };
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      valid: false,
      error: 'Struktur file JSON tidak dikenali sebagai cadangan data ERP YPPLN.',
      fileName,
      metadata: {
        appName: '-',
        version: '-',
        exportedAtFormatted: '-',
        exportedBy: '-',
        totalBackupRecords: 0,
      },
      modules: [],
    };
  }

  const modules: ModuleBackupPreviewItem[] = [];
  let hasAnyRecognizedModule = false;
  let totalBackupRecords = 0;

  BACKUP_MODULE_DEFINITIONS.forEach((def) => {
    const rawBackupVal = parsed[def.key];
    const rawCurrentVal = (currentData as any)[def.key];

    let presentInFile = false;
    let backupCount = 0;
    let currentCount = 0;
    let newInMergeCount = 0;
    let updatedInMergeCount = 0;

    if (def.isTodoMap) {
      presentInFile =
        rawBackupVal !== undefined &&
        rawBackupVal !== null &&
        typeof rawBackupVal === 'object' &&
        !Array.isArray(rawBackupVal);
      backupCount = presentInFile ? countTodoTasks(rawBackupVal) : 0;
      currentCount = countTodoTasks(rawCurrentVal);
      if (presentInFile) {
        hasAnyRecognizedModule = true;
        const mergeCheck = mergeTodoTaskMaps(rawCurrentVal || {}, rawBackupVal);
        newInMergeCount = mergeCheck.addedCount;
        updatedInMergeCount = mergeCheck.updatedCount;
      }
    } else {
      presentInFile = Array.isArray(rawBackupVal);
      backupCount = presentInFile ? rawBackupVal.length : 0;
      currentCount = Array.isArray(rawCurrentVal) ? rawCurrentVal.length : 0;
      if (presentInFile) {
        hasAnyRecognizedModule = true;
        const mergeCheck = mergeModuleArrays(def.key, rawCurrentVal || [], rawBackupVal);
        newInMergeCount = mergeCheck.addedCount;
        updatedInMergeCount = mergeCheck.updatedCount;
      }
    }

    totalBackupRecords += backupCount;

    if (presentInFile) {
      modules.push({
        key: def.key,
        label: def.label,
        category: def.category,
        presentInFile,
        backupCount,
        currentCount,
        newInMergeCount,
        updatedInMergeCount,
        isSensitiveAccount: def.isSensitiveAccount,
      });
    }
  });

  if (!hasAnyRecognizedModule) {
    return {
      valid: false,
      error: 'Tidak ditemukan modul data ERP yang dikenali di dalam file JSON ini.',
      fileName,
      metadata: {
        appName: '-',
        version: '-',
        exportedAtFormatted: '-',
        exportedBy: '-',
        totalBackupRecords: 0,
      },
      modules: [],
    };
  }

  const meta = parsed.metadata && typeof parsed.metadata === 'object' ? parsed.metadata : {};

  return {
    valid: true,
    fileName,
    metadata: {
      appName: String(meta.appName || 'Backup ERP YPPLN'),
      version: String(meta.version || '-'),
      exportedAtFormatted: String(meta.exportedAtFormatted || meta.exportedAt || '-'),
      exportedBy: String(meta.exportedBy || '-'),
      totalBackupRecords,
    },
    parsedData: parsed as Partial<AllApplicationData>,
    modules,
  };
}
