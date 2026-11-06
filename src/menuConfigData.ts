export interface MenuArrangementConfig {
  mainMenuIds: string[];
  moreMenuIds: string[];
}

export const STORAGE_KEY_MENU_CONFIG = 'proyek_sapa_menu_config_v1';

export const ALL_MENU_IDS = [
  'nav-home',
  'nav-identitas',
  'nav-organisasi',
  'nav-todo-list',
  'nav-jenis-non-proyek-todo-list',
  'nav-calendar-todo-list',
  'nav-hari-khusus-calendar-todo-list',
  'nav-jenis-panggilan',
  'nav-triyana',
  'nav-pekerjaan',
  'nav-mengenal-yppln',
  'nav-divisi',
  'nav-proyek-sapa',
  'nav-timeline-proyek-sapa',
  'nav-transaksi-salur',
  'nav-pos-kasir-salur',
  'nav-list-promo-salur',
  'nav-resi-salur',
  'nav-agen-resi',
  'nav-list-group-funneling',
  'nav-list-nama-group-funneling',
  'nav-item-salur',
  'nav-ongoing-create-item-salur',
  'nav-modal-item-salur',
  'nav-report-bep-salur',
  'nav-stok-item-salur',
  'nav-lokasi-stok-item-salur',
  'nav-stock-in-out-salur',
  'nav-jenis-perubahan-stock-salur',
  'nav-nama-percetakan-stock-salur',
  'nav-transaksi-donasi',
  'nav-report-nama-pelimpahan-jasa-donasi',
  'nav-item-donasi',
  'nav-template-tanda-terima-donasi',
  'nav-list-dharma-patron-rutin',
  'nav-list-database-aajak-all',
  'nav-list-database-aajak-item-ssebar',
  'nav-job-advance-ssebar',
  'nav-status-job-advance-ssebar',
  'nav-jenis-perubahan-dpr',
  'nav-transaksi-ajar',
  'nav-item-ajar',
  'nav-sub-jenis-item-ajar',
  'nav-jenis-acara-item-ajar',
  'nav-sub-jenis-item-donasi',
  'nav-jenis-item-salur',
  'nav-sub-jenis-item-salur',
  'nav-kategori-item-salur',
  'nav-jenis-kategori-salur',
  'nav-via-transaksi-salur',
  'nav-jenis-via-transaksi-salur',
  'nav-via-transaksi-donasi',
  'nav-jenis-via-transaksi-donasi',
  'nav-via-transaksi-ajar',
  'nav-jenis-via-transaksi-ajar',
  'nav-jenis-group-funneling',
  'nav-tambah-proyek',
  'nav-jenis-proyek',
  'nav-report-proyek',
  'nav-report-customer-salur',
  'nav-report-bep-salur-report',
  'nav-konten-promosi',
  'nav-list-pm',
  'nav-rincian-list-pm',
  'nav-auto-input-salur-pm',
  'nav-template-pm',
  'nav-timeline-pm',
  'nav-rekening',
  'nav-mutasi',
  'nav-rincian-mutasi',
  'nav-laporan-keuangan',
  'nav-jurnal-umum',
  'nav-pos-keuangan',
  'nav-pos-pemasukan',
  'nav-pos-pemasukan-sub-jenis',
  'nav-pos-pengeluaran',
  'nav-kelompok-biaya-coa',
  'nav-kebutuhan-pengeluaran',
  'nav-kumpulan-rekening',
  'nav-pengeluaran',
  'nav-karyawan',
  'nav-form-cuti-karyawan',
  'nav-rekap-absensi-karyawan',
  'nav-list-account',
  'nav-quick-reply',
  'nav-list-faq',
  'nav-tentang-list-faq',
  'nav-complaint',
];

export const DEFAULT_MAIN_MENU_IDS: string[] = [
  'nav-home',
  'nav-identitas',
  'nav-organisasi',
  'nav-todo-list',
  'nav-jenis-non-proyek-todo-list',
  'nav-calendar-todo-list',
  'nav-proyek-sapa',
  'nav-timeline-proyek-sapa',
  'nav-transaksi-salur',
  'nav-pos-kasir-salur',
  'nav-list-promo-salur',
  'nav-resi-salur',
  'nav-agen-resi',
  'nav-list-group-funneling',
  'nav-item-salur',
  'nav-ongoing-create-item-salur',
  'nav-transaksi-donasi',
  'nav-list-dharma-patron-rutin',
  'nav-transaksi-ajar',
  'nav-list-pm',
  'nav-rincian-list-pm',
  'nav-auto-input-salur-pm',
  'nav-template-pm',
  'nav-rekening',
  'nav-mutasi',
  'nav-rincian-mutasi',
  'nav-laporan-keuangan',
  'nav-pos-keuangan',
  'nav-pos-pengeluaran',
  'nav-kelompok-biaya-coa',
  'nav-kebutuhan-pengeluaran',
  'nav-kumpulan-rekening',
  'nav-pengeluaran',
  'nav-karyawan',
  'nav-list-account',
  'nav-quick-reply',
  'nav-list-faq',
  'nav-complaint',
];

export const DEFAULT_MORE_MENU_IDS: string[] = ALL_MENU_IDS.filter(
  (id) => !DEFAULT_MAIN_MENU_IDS.includes(id)
);

export function loadMenuArrangementConfig(): MenuArrangementConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MENU_CONFIG);
    if (!raw) {
      return {
        mainMenuIds: [...DEFAULT_MAIN_MENU_IDS],
        moreMenuIds: [...DEFAULT_MORE_MENU_IDS],
      };
    }
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      Array.isArray(parsed.mainMenuIds) &&
      Array.isArray(parsed.moreMenuIds)
    ) {
      // Ensure all known menu items exist in either mainMenuIds or moreMenuIds
      const currentConfigIds = new Set([
        ...parsed.mainMenuIds,
        ...parsed.moreMenuIds,
      ]);
      const missingIds = ALL_MENU_IDS.filter((id) => !currentConfigIds.has(id));

      const mainMenuFiltered = parsed.mainMenuIds.filter((id: string) =>
        ALL_MENU_IDS.includes(id)
      );

      // If nav-home is newly introduced, put it at the very top of main menu
      if (!currentConfigIds.has('nav-home') && !mainMenuFiltered.includes('nav-home')) {
        mainMenuFiltered.unshift('nav-home');
      }

      // If nav-rincian-mutasi is newly introduced, put it directly in main menu right after nav-mutasi
      if (!currentConfigIds.has('nav-rincian-mutasi') && !mainMenuFiltered.includes('nav-rincian-mutasi')) {
        const mutasiIdx = mainMenuFiltered.indexOf('nav-mutasi');
        if (mutasiIdx !== -1) {
          mainMenuFiltered.splice(mutasiIdx + 1, 0, 'nav-rincian-mutasi');
        } else {
          mainMenuFiltered.push('nav-rincian-mutasi');
        }
      }

      // If nav-laporan-keuangan is newly introduced, put it directly in main menu after nav-mutasi
      if (!currentConfigIds.has('nav-laporan-keuangan') && !mainMenuFiltered.includes('nav-laporan-keuangan')) {
        const mutasiIdx = mainMenuFiltered.indexOf('nav-mutasi');
        if (mutasiIdx !== -1) {
          mainMenuFiltered.splice(mutasiIdx + 1, 0, 'nav-laporan-keuangan');
        } else {
          mainMenuFiltered.push('nav-laporan-keuangan');
        }
      }

      // If nav-agen-resi is newly introduced, put it directly in main menu after nav-resi-salur
      if (!currentConfigIds.has('nav-agen-resi') && !mainMenuFiltered.includes('nav-agen-resi')) {
        const resiIdx = mainMenuFiltered.indexOf('nav-resi-salur');
        if (resiIdx !== -1) {
          mainMenuFiltered.splice(resiIdx + 1, 0, 'nav-agen-resi');
        } else {
          mainMenuFiltered.push('nav-agen-resi');
        }
      }

      // If nav-complaint is newly introduced, put it in main menu
      if (!currentConfigIds.has('nav-complaint') && !mainMenuFiltered.includes('nav-complaint')) {
        mainMenuFiltered.push('nav-complaint');
      }

      // Always ensure nav-jenis-non-proyek-todo-list is in mainMenuIds directly below nav-todo-list
      const jenisNonProyekIdx = mainMenuFiltered.indexOf('nav-jenis-non-proyek-todo-list');
      if (jenisNonProyekIdx !== -1) {
        mainMenuFiltered.splice(jenisNonProyekIdx, 1);
      }
      const todoIdx = mainMenuFiltered.indexOf('nav-todo-list');
      if (todoIdx !== -1) {
        mainMenuFiltered.splice(todoIdx + 1, 0, 'nav-jenis-non-proyek-todo-list');
      } else {
        mainMenuFiltered.push('nav-jenis-non-proyek-todo-list');
      }

      // Always ensure nav-ongoing-create-item-salur is in mainMenuIds directly below nav-item-salur
      const ongoingIdx = mainMenuFiltered.indexOf('nav-ongoing-create-item-salur');
      if (ongoingIdx !== -1) {
        mainMenuFiltered.splice(ongoingIdx, 1);
      }
      const salurIdx = mainMenuFiltered.indexOf('nav-item-salur');
      if (salurIdx !== -1) {
        mainMenuFiltered.splice(salurIdx + 1, 0, 'nav-ongoing-create-item-salur');
      } else {
        mainMenuFiltered.push('nav-ongoing-create-item-salur');
      }

      // Always ensure nav-rincian-list-pm is in mainMenuIds directly below nav-list-pm
      const rincianPMIdx = mainMenuFiltered.indexOf('nav-rincian-list-pm');
      if (rincianPMIdx !== -1) {
        mainMenuFiltered.splice(rincianPMIdx, 1);
      }
      const listPMIdx = mainMenuFiltered.indexOf('nav-list-pm');
      if (listPMIdx !== -1) {
        mainMenuFiltered.splice(listPMIdx + 1, 0, 'nav-rincian-list-pm');
      } else {
        mainMenuFiltered.push('nav-rincian-list-pm');
      }

      // If nav-pos-pengeluaran is newly introduced, put it right before nav-pengeluaran
      if (!currentConfigIds.has('nav-pos-pengeluaran') && !mainMenuFiltered.includes('nav-pos-pengeluaran')) {
        const pengeluaranIdx = mainMenuFiltered.indexOf('nav-pengeluaran');
        const newItems = ['nav-pos-pengeluaran', 'nav-kelompok-biaya-coa', 'nav-kebutuhan-pengeluaran', 'nav-kumpulan-rekening'];
        if (pengeluaranIdx !== -1) {
          mainMenuFiltered.splice(pengeluaranIdx, 0, ...newItems);
        } else {
          mainMenuFiltered.push(...newItems);
        }
      }

      const moreMenuFiltered = [
        ...parsed.moreMenuIds.filter((id: string) => ALL_MENU_IDS.includes(id) && id !== 'nav-ongoing-create-item-salur' && id !== 'nav-rincian-list-pm' && id !== 'nav-jenis-non-proyek-todo-list' && id !== 'nav-complaint' && id !== 'nav-pos-pengeluaran' && id !== 'nav-kelompok-biaya-coa' && id !== 'nav-kebutuhan-pengeluaran' && id !== 'nav-kumpulan-rekening'),
        ...missingIds.filter((id) => id !== 'nav-home' && id !== 'nav-laporan-keuangan' && id !== 'nav-agen-resi' && id !== 'nav-ongoing-create-item-salur' && id !== 'nav-rincian-list-pm' && id !== 'nav-jenis-non-proyek-todo-list' && id !== 'nav-complaint' && id !== 'nav-pos-pengeluaran' && id !== 'nav-kelompok-biaya-coa' && id !== 'nav-kebutuhan-pengeluaran' && id !== 'nav-kumpulan-rekening'),
      ];

      return {
        mainMenuIds: mainMenuFiltered,
        moreMenuIds: moreMenuFiltered,
      };
    }
  } catch (err) {
    console.warn('Failed to load menu arrangement from localStorage:', err);
  }
  return {
    mainMenuIds: [...DEFAULT_MAIN_MENU_IDS],
    moreMenuIds: [...DEFAULT_MORE_MENU_IDS],
  };
}

export function saveMenuArrangementConfig(config: MenuArrangementConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_MENU_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save menu arrangement to localStorage:', err);
  }
}

export function resetMenuArrangementConfig(): MenuArrangementConfig {
  const defaultConfig: MenuArrangementConfig = {
    mainMenuIds: [...DEFAULT_MAIN_MENU_IDS],
    moreMenuIds: [...DEFAULT_MORE_MENU_IDS],
  };
  saveMenuArrangementConfig(defaultConfig);
  return defaultConfig;
}
