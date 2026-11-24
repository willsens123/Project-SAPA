import React, { useEffect, useRef, useState } from 'react';
import { subscribeToCloudCollection, saveCollectionToCloud, SyncStatus } from './syncService';
import { IdentitasItem } from '../identitasData';
import {
  CentralAuditLogEntry,
  DharmaPatronRutinItem,
  IdentitasChangeLog,
  LoginActivityRecord,
  MergeSessionRecord,
  MutasiItem,
  PengeluaranItem,
  ProjectItem,
  RbacPolicyConfig,
} from '../types';
import { SalurOrder } from '../salurData';
import { DonasiOrder } from '../donasiData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { PosKeuanganItem } from '../posKeuanganData';
import { CoaAccount } from '../accountingData';
import { OrganisasiItem } from '../organisasiData';
import { CutiKaryawanItem, saveCutiKaryawanList } from '../cutiKaryawanData';
import {
  STOK_SALUR_CLOUD_PUSH_EVENT,
  StokSalurCloudDocKey,
  applyCloudStokSalurSnapshot,
  getStoredStokSalurItems,
  getStoredGudangSalurData,
  getStoredStockInOutSalur,
  getStoredLokasiStokSalur,
  getStoredJenisPerubahanSalur,
} from '../stokSalurData';
import { createDefaultRbacConfig, normalizeRbacConfig } from '../utils/rbacManager';
import { MAX_LOGIN_ACTIVITY_RECORDS } from '../utils/loginActivityHelper';

export interface CloudSyncManagerProps {
  isAuthenticated: boolean;

  // State getters
  identitasList: IdentitasItem[];
  mutasiItems: MutasiItem[];
  salurOrders: SalurOrder[];
  donasiOrders: DonasiOrder[];
  transaksiAjarList: TransaksiAjarItem[];
  pengeluaranList: PengeluaranItem[];
  posKeuanganList: PosKeuanganItem[];
  coaList: CoaAccount[];
  projects: ProjectItem[];
  organisasiList: OrganisasiItem[];
  dharmaPatronList: DharmaPatronRutinItem[];
  cutiKaryawanList: CutiKaryawanItem[];
  centralAuditLogs: CentralAuditLogEntry[];
  mergeSessionRecords: MergeSessionRecord[];
  changeLogs: IdentitasChangeLog[];
  rbacConfig: RbacPolicyConfig;
  loginActivityLogs: LoginActivityRecord[];

  // State setters
  setIdentitasList: React.Dispatch<React.SetStateAction<IdentitasItem[]>>;
  setMutasiItems: React.Dispatch<React.SetStateAction<MutasiItem[]>>;
  setSalurOrders: React.Dispatch<React.SetStateAction<SalurOrder[]>>;
  setDonasiOrders: React.Dispatch<React.SetStateAction<DonasiOrder[]>>;
  setTransaksiAjarList: React.Dispatch<React.SetStateAction<TransaksiAjarItem[]>>;
  setPengeluaranList: React.Dispatch<React.SetStateAction<PengeluaranItem[]>>;
  setPosKeuanganList: React.Dispatch<React.SetStateAction<PosKeuanganItem[]>>;
  setCoaList: React.Dispatch<React.SetStateAction<CoaAccount[]>>;
  setProjects: React.Dispatch<React.SetStateAction<ProjectItem[]>>;
  setOrganisasiList: React.Dispatch<React.SetStateAction<OrganisasiItem[]>>;
  setDharmaPatronList: React.Dispatch<React.SetStateAction<DharmaPatronRutinItem[]>>;
  setCutiKaryawanList: React.Dispatch<React.SetStateAction<CutiKaryawanItem[]>>;
  setCentralAuditLogs: React.Dispatch<React.SetStateAction<CentralAuditLogEntry[]>>;
  setMergeSessionRecords: React.Dispatch<React.SetStateAction<MergeSessionRecord[]>>;
  setChangeLogs: React.Dispatch<React.SetStateAction<IdentitasChangeLog[]>>;
  setRbacConfig: React.Dispatch<React.SetStateAction<RbacPolicyConfig>>;
  setLoginActivityLogs: React.Dispatch<React.SetStateAction<LoginActivityRecord[]>>;

  // Remote audit arrival notification hook (skips initial hydration)
  onRemoteAuditEntries?: (newEntries: CentralAuditLogEntry[]) => void;
}

const MAX_CLOUD_AUDIT_LOGS = 500;
const MAX_CLOUD_CHANGE_LOGS = 500;
const MAX_CLOUD_MERGE_RECORDS = 80;

export function useCloudSyncManager(props: CloudSyncManagerProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    props.isAuthenticated ? 'connecting' : 'offline'
  );
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Track if state update originated from Firestore snapshot to prevent loop
  const isIncomingFromCloud = useRef<Record<string, boolean>>({});
  // Track if initial snapshot has been received for each collection
  const hasInitialized = useRef<Record<string, boolean>>({});
  // Track known audit log IDs so remote cross-device entries trigger real-time banners
  const seenRemoteAuditIds = useRef<Set<string>>(new Set());
  const onRemoteAuditEntriesRef = useRef(props.onRemoteAuditEntries);
  onRemoteAuditEntriesRef.current = props.onRemoteAuditEntries;

  // Keep seenRemoteAuditIds seeded with initial local IDs
  useEffect(() => {
    props.centralAuditLogs.forEach((entry) => seenRemoteAuditIds.current.add(entry.id));
  }, [props.centralAuditLogs]);

  // 1. Setup real-time listeners once member session is authenticated
  useEffect(() => {
    if (!props.isAuthenticated) {
      hasInitialized.current = {};
      isIncomingFromCloud.current = {};
      setSyncStatus('offline');
      return;
    }

    const unsubs: (() => void)[] = [];

    const handleStatus = (status: SyncStatus) => {
      setSyncStatus(status);
      if (status === 'synced') {
        setLastSyncedAt(new Date());
      }
    };

    const register = <T,>(
      key: string,
      initialFallback: T[],
      setter: React.Dispatch<React.SetStateAction<T[]>>,
      onAfterSnapshot?: (cloudItems: T[], wasInitialized: boolean) => void
    ) => {
      const unsub = subscribeToCloudCollection<T>(
        key,
        initialFallback,
        (cloudItems) => {
          const wasInit = Boolean(hasInitialized.current[key]);
          isIncomingFromCloud.current[key] = true;
          setter(cloudItems);
          hasInitialized.current[key] = true;
          setLastSyncedAt(new Date());
          onAfterSnapshot?.(cloudItems, wasInit);
        },
        handleStatus
      );
      unsubs.push(unsub);
    };

    register('identitas', props.identitasList, props.setIdentitasList);
    register('mutasi', props.mutasiItems, props.setMutasiItems);
    register('salur_orders', props.salurOrders, props.setSalurOrders);
    register('donasi_orders', props.donasiOrders, props.setDonasiOrders);
    register('transaksi_ajar', props.transaksiAjarList, props.setTransaksiAjarList);
    register('pengeluaran', props.pengeluaranList, props.setPengeluaranList);
    register('pos_keuangan', props.posKeuanganList, props.setPosKeuanganList);
    register('coa_accounts', props.coaList, props.setCoaList);
    register('projects', props.projects, props.setProjects);
    register('organisasi', props.organisasiList, props.setOrganisasiList);
    register('dharma_patron_rutin', props.dharmaPatronList, props.setDharmaPatronList);
    register<CutiKaryawanItem>(
      'cuti_karyawan',
      props.cutiKaryawanList,
      props.setCutiKaryawanList,
      (cloudItems) => {
        saveCutiKaryawanList(cloudItems);
      }
    );
    register('identitas_change_logs', props.changeLogs, props.setChangeLogs);
    register('merge_session_records', props.mergeSessionRecords, props.setMergeSessionRecords);
    register('login_activity_logs', props.loginActivityLogs, props.setLoginActivityLogs);

    register<CentralAuditLogEntry>(
      'central_audit_logs',
      props.centralAuditLogs,
      props.setCentralAuditLogs,
      (cloudItems, wasInit) => {
        if (!wasInit) {
          cloudItems.forEach((item) => seenRemoteAuditIds.current.add(item.id));
          return;
        }
        const incomingNew = cloudItems.filter((item) => !seenRemoteAuditIds.current.has(item.id));
        cloudItems.forEach((item) => seenRemoteAuditIds.current.add(item.id));
        if (incomingNew.length > 0 && onRemoteAuditEntriesRef.current) {
          onRemoteAuditEntriesRef.current(incomingNew);
        }
      }
    );

    // Sync RBAC policy document (wrapped inside single-element array on erp_state/rbac_permissions)
    const rbacUnsub = subscribeToCloudCollection<RbacPolicyConfig>(
      'rbac_permissions',
      [props.rbacConfig || createDefaultRbacConfig()],
      (cloudItems) => {
        isIncomingFromCloud.current['rbac_permissions'] = true;
        if (Array.isArray(cloudItems) && cloudItems[0]) {
          props.setRbacConfig(normalizeRbacConfig(cloudItems[0]));
        }
        hasInitialized.current['rbac_permissions'] = true;
        setLastSyncedAt(new Date());
      },
      handleStatus
    );
    unsubs.push(rbacUnsub);

    // Register Stok S-SALUR cloud collections (stored via stokSalurData.ts localStorage bridge)
    const registerStokSalurCollection = <T,>(
      key: StokSalurCloudDocKey,
      getInitialFallback: () => T[]
    ) => {
      const unsub = subscribeToCloudCollection<T>(
        key,
        getInitialFallback(),
        (cloudItems) => {
          applyCloudStokSalurSnapshot(key, cloudItems);
          hasInitialized.current[key] = true;
          setLastSyncedAt(new Date());
        },
        handleStatus
      );
      unsubs.push(unsub);
    };

    registerStokSalurCollection('stok_salur_items', () => getStoredStokSalurItems());
    registerStokSalurCollection('gudang_salur_data', () => getStoredGudangSalurData());
    registerStokSalurCollection('stock_in_out_salur', () => getStoredStockInOutSalur());
    registerStokSalurCollection('lokasi_stok_salur', () => getStoredLokasiStokSalur());
    registerStokSalurCollection('jenis_perubahan_salur', () => getStoredJenisPerubahanSalur());

    // Push local Stok S-SALUR mutations triggered via stokSalurData save helpers
    const handleLocalStokSalurMutation = (event: Event) => {
      const customEvent = event as CustomEvent<{
        key?: StokSalurCloudDocKey;
        items?: unknown[];
      }>;
      const docKey = customEvent.detail?.key;
      const items = customEvent.detail?.items;
      if (!docKey || !Array.isArray(items) || !hasInitialized.current[docKey]) {
        return;
      }
      setSyncStatus('syncing');
      saveCollectionToCloud(docKey, items)
        .then(() => {
          setSyncStatus('synced');
          setLastSyncedAt(new Date());
        })
        .catch((e) => {
          console.warn(`Error auto-saving ${docKey} to cloud:`, e);
          setSyncStatus('error');
        });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener(STOK_SALUR_CLOUD_PUSH_EVENT, handleLocalStokSalurMutation);
      unsubs.push(() =>
        window.removeEventListener(STOK_SALUR_CLOUD_PUSH_EVENT, handleLocalStokSalurMutation)
      );
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [props.isAuthenticated]);

  // 2. Sync local user modifications to Firestore (with loop guards & auth guard)
  const syncToCloud = (key: string, items: any[]) => {
    if (!props.isAuthenticated || !hasInitialized.current[key]) {
      return;
    }
    if (isIncomingFromCloud.current[key]) {
      isIncomingFromCloud.current[key] = false;
      return;
    }
    setSyncStatus('syncing');
    saveCollectionToCloud(key, items)
      .then(() => {
        setSyncStatus('synced');
        setLastSyncedAt(new Date());
      })
      .catch((e) => {
        console.warn(`Error auto-saving ${key} to cloud:`, e);
        setSyncStatus('error');
      });
  };

  useEffect(() => {
    syncToCloud('identitas', props.identitasList);
  }, [props.identitasList]);

  useEffect(() => {
    syncToCloud('mutasi', props.mutasiItems);
  }, [props.mutasiItems]);

  useEffect(() => {
    syncToCloud('salur_orders', props.salurOrders);
  }, [props.salurOrders]);

  useEffect(() => {
    syncToCloud('donasi_orders', props.donasiOrders);
  }, [props.donasiOrders]);

  useEffect(() => {
    syncToCloud('transaksi_ajar', props.transaksiAjarList);
  }, [props.transaksiAjarList]);

  useEffect(() => {
    syncToCloud('pengeluaran', props.pengeluaranList);
  }, [props.pengeluaranList]);

  useEffect(() => {
    syncToCloud('pos_keuangan', props.posKeuanganList);
  }, [props.posKeuanganList]);

  useEffect(() => {
    syncToCloud('coa_accounts', props.coaList);
  }, [props.coaList]);

  useEffect(() => {
    syncToCloud('projects', props.projects);
  }, [props.projects]);

  useEffect(() => {
    syncToCloud('organisasi', props.organisasiList);
  }, [props.organisasiList]);

  useEffect(() => {
    syncToCloud('dharma_patron_rutin', props.dharmaPatronList);
  }, [props.dharmaPatronList]);

  useEffect(() => {
    syncToCloud('cuti_karyawan', props.cutiKaryawanList);
  }, [props.cutiKaryawanList]);

  useEffect(() => {
    syncToCloud('central_audit_logs', props.centralAuditLogs.slice(0, MAX_CLOUD_AUDIT_LOGS));
  }, [props.centralAuditLogs]);

  useEffect(() => {
    syncToCloud('identitas_change_logs', props.changeLogs.slice(0, MAX_CLOUD_CHANGE_LOGS));
  }, [props.changeLogs]);

  useEffect(() => {
    syncToCloud(
      'merge_session_records',
      props.mergeSessionRecords.slice(0, MAX_CLOUD_MERGE_RECORDS)
    );
  }, [props.mergeSessionRecords]);

  useEffect(() => {
    syncToCloud('rbac_permissions', [props.rbacConfig]);
  }, [props.rbacConfig]);

  useEffect(() => {
    syncToCloud(
      'login_activity_logs',
      props.loginActivityLogs.slice(0, MAX_LOGIN_ACTIVITY_RECORDS)
    );
  }, [props.loginActivityLogs]);

  const forceManualSync = () => {
    if (!props.isAuthenticated) return;
    setSyncStatus('syncing');
    Promise.all([
      saveCollectionToCloud('identitas', props.identitasList, 0),
      saveCollectionToCloud('mutasi', props.mutasiItems, 0),
      saveCollectionToCloud('salur_orders', props.salurOrders, 0),
      saveCollectionToCloud('donasi_orders', props.donasiOrders, 0),
      saveCollectionToCloud('transaksi_ajar', props.transaksiAjarList, 0),
      saveCollectionToCloud('pengeluaran', props.pengeluaranList, 0),
      saveCollectionToCloud('pos_keuangan', props.posKeuanganList, 0),
      saveCollectionToCloud('coa_accounts', props.coaList, 0),
      saveCollectionToCloud('projects', props.projects, 0),
      saveCollectionToCloud('organisasi', props.organisasiList, 0),
      saveCollectionToCloud('dharma_patron_rutin', props.dharmaPatronList, 0),
      saveCollectionToCloud('cuti_karyawan', props.cutiKaryawanList, 0),
      saveCollectionToCloud('stok_salur_items', getStoredStokSalurItems(), 0),
      saveCollectionToCloud('gudang_salur_data', getStoredGudangSalurData(), 0),
      saveCollectionToCloud('stock_in_out_salur', getStoredStockInOutSalur(), 0),
      saveCollectionToCloud('lokasi_stok_salur', getStoredLokasiStokSalur(), 0),
      saveCollectionToCloud('jenis_perubahan_salur', getStoredJenisPerubahanSalur(), 0),
      saveCollectionToCloud(
        'central_audit_logs',
        props.centralAuditLogs.slice(0, MAX_CLOUD_AUDIT_LOGS),
        0
      ),
      saveCollectionToCloud(
        'identitas_change_logs',
        props.changeLogs.slice(0, MAX_CLOUD_CHANGE_LOGS),
        0
      ),
      saveCollectionToCloud(
        'merge_session_records',
        props.mergeSessionRecords.slice(0, MAX_CLOUD_MERGE_RECORDS),
        0
      ),
      saveCollectionToCloud('rbac_permissions', [props.rbacConfig], 0),
      saveCollectionToCloud(
        'login_activity_logs',
        props.loginActivityLogs.slice(0, MAX_LOGIN_ACTIVITY_RECORDS),
        0
      ),
    ])
      .then(() => {
        setSyncStatus('synced');
        setLastSyncedAt(new Date());
      })
      .catch(() => setSyncStatus('error'));
  };

  return {
    syncStatus,
    lastSyncedAt,
    forceManualSync,
  };
}
