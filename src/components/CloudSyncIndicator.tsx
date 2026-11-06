import React from 'react';
import { Cloud, CloudCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { SyncStatus } from '../firebase/syncService';

interface CloudSyncIndicatorProps {
  status: SyncStatus;
  lastSyncedAt?: Date | null;
  onManualSync?: () => void;
}

export const CloudSyncIndicator: React.FC<CloudSyncIndicatorProps> = ({
  status,
  lastSyncedAt,
  onManualSync,
}) => {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all shadow-2xs border"
      style={{
        backgroundColor:
          status === 'synced'
            ? '#ecfdf5'
            : status === 'syncing' || status === 'connecting'
            ? '#f0fdfa'
            : '#fffbeb',
        borderColor:
          status === 'synced'
            ? '#a7f3d0'
            : status === 'syncing' || status === 'connecting'
            ? '#99f6e4'
            : '#fde68a',
        color:
          status === 'synced'
            ? '#047857'
            : status === 'syncing' || status === 'connecting'
            ? '#0d9488'
            : '#b45309',
      }}
      title="Status Sinkronisasi Real-Time Firebase Cloud Firestore (Semua Link Vercel Terhubung)"
    >
      {status === 'synced' && <CloudCheck className="w-3.5 h-3.5 text-emerald-600 animate-in fade-in" />}
      {(status === 'syncing' || status === 'connecting') && (
        <RefreshCw className="w-3.5 h-3.5 text-teal-600 animate-spin" />
      )}
      {status === 'offline' && <Cloud className="w-3.5 h-3.5 text-amber-600" />}
      {status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}

      <span className="hidden sm:inline">
        {status === 'synced' && 'Cloud Sync: Aktif'}
        {status === 'syncing' && 'Menyinkronkan...'}
        {status === 'connecting' && 'Menghubungkan ke Cloud...'}
        {status === 'offline' && 'Mode Offline (Cache)'}
        {status === 'error' && 'Gagal Sinkronisasi'}
      </span>
      <span className="sm:hidden">
        {status === 'synced' && 'Sync'}
        {status === 'syncing' && 'Syncing'}
        {status === 'connecting' && 'Connecting'}
        {status === 'offline' && 'Offline'}
        {status === 'error' && 'Err'}
      </span>

      {onManualSync && (
        <button
          onClick={onManualSync}
          type="button"
          title="Sinkronkan ulang sekarang"
          className="hover:opacity-75 cursor-pointer ml-0.5 p-0.5 rounded transition-opacity"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
