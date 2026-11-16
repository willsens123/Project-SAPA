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
  const statusClasses =
    status === 'synced'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800/80 dark:text-emerald-300'
      : status === 'syncing' || status === 'connecting'
      ? 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-950/60 dark:border-teal-800/80 dark:text-teal-300'
      : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/60 dark:border-amber-800/80 dark:text-amber-300';

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all shadow-2xs border ${statusClasses}`}
      title="Status Sinkronisasi Real-Time Firebase Cloud Firestore (Semua Link Vercel Terhubung)"
    >
      {status === 'synced' && <CloudCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-in fade-in" />}
      {(status === 'syncing' || status === 'connecting') && (
        <RefreshCw className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 animate-spin" />
      )}
      {status === 'offline' && <Cloud className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
      {status === 'error' && <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />}

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
