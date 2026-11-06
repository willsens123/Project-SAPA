import React, { useEffect, useRef, useState } from 'react';
import { subscribeToCloudCollection, saveCollectionToCloud, SyncStatus } from './syncService';
import { IdentitasItem } from '../identitasData';
import { MutasiItem } from '../types';
import { SalurOrder } from '../salurData';
import { DonasiOrder } from '../donasiData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { PengeluaranItem } from '../types';
import { PosKeuanganItem } from '../posKeuanganData';
import { CoaAccount } from '../accountingData';
import { ProjectItem } from '../types';
import { OrganisasiItem } from '../organisasiData';

export interface CloudSyncManagerProps {
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
}

export function useCloudSyncManager(props: CloudSyncManagerProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connecting');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Track if state update originated from Firestore snapshot to prevent loop
  const isIncomingFromCloud = useRef<Record<string, boolean>>({});
  // Track if initial snapshot has been received for each collection
  const hasInitialized = useRef<Record<string, boolean>>({});

  // 1. Setup real-time listeners for all 10 ERP core collections
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    const handleStatus = (status: SyncStatus) => {
      setSyncStatus(status);
      if (status === 'synced') {
        setLastSyncedAt(new Date());
      }
    };

    // Helper to register subscription
    const register = <T>(
      key: string,
      initialFallback: T[],
      setter: React.Dispatch<React.SetStateAction<T[]>>
    ) => {
      const unsub = subscribeToCloudCollection<T>(
        key,
        initialFallback,
        (cloudItems) => {
          isIncomingFromCloud.current[key] = true;
          setter(cloudItems);
          hasInitialized.current[key] = true;
          setLastSyncedAt(new Date());
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

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, []); // Run once on mount

  // 2. Sync local user modifications to Firestore (with loop guards)
  const syncToCloud = (key: string, items: any[]) => {
    if (!hasInitialized.current[key]) {
      // Don't push before the first snapshot or seeding is complete
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

  const forceManualSync = () => {
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
