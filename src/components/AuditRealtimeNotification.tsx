import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  History,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { LiveAuditNotification } from '../utils/auditNotificationHelper';

interface HomeAuditRealtimeBannerProps {
  alerts: LiveAuditNotification[];
  onOpenAuditLog: (dismissAlertId?: string) => void;
  onDismissAlert: (alertId: string) => void;
  onDismissAll: () => void;
}

/**
 * Compact real-time notification banner on the main dashboard (`HomeView`)
 * that appears automatically whenever an important change is recorded in the Central Audit Log.
 */
export const HomeAuditRealtimeBanner: React.FC<HomeAuditRealtimeBannerProps> = ({
  alerts,
  onOpenAuditLog,
  onDismissAlert,
  onDismissAll,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [alerts.length]);

  if (!alerts || alerts.length === 0) return null;

  const safeIndex = Math.min(activeIndex, alerts.length - 1);
  const current = alerts[safeIndex];
  const isCritical = current.severity === 'critical';

  return (
    <section
      role="status"
      aria-live="polite"
      aria-label="Notifikasi real-time log audit pusat"
      className={`w-full rounded-2xl border px-4 py-3 sm:px-5 sm:py-3.5 shadow-2xs transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
        isCritical
          ? 'bg-rose-50/45 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-800/70'
          : 'bg-teal-50/40 dark:bg-teal-950/20 border-teal-200/80 dark:border-teal-800/70'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isCritical
                ? 'bg-rose-600 text-white'
                : 'bg-[#05828e] text-white'
            }`}
          >
            {isCritical ? (
              <ShieldAlert className="w-4 h-4" />
            ) : (
              <History className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0 space-y-0.5">
            {/* Unboxed clean metadata line separated by middots */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span
                className={`font-semibold ${
                  isCritical
                    ? 'text-rose-700 dark:text-rose-300'
                    : 'text-[#05828e] dark:text-[#2dd4bf]'
                }`}
              >
                Pembaruan Real-Time Audit Pusat
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {current.entry.module}
              </span>
              <span aria-hidden="true">·</span>
              <span>{current.entry.actionType}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{current.entry.timestamp}</span>
              {current.entry.author && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Oleh {current.entry.author}</span>
                </>
              )}
            </div>

            {/* Headline & field summary */}
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs sm:text-sm">
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {current.headline}
              </span>
              <span className="text-slate-400 dark:text-slate-600 hidden sm:inline" aria-hidden="true">
                —
              </span>
              <span className="text-slate-600 dark:text-slate-300 font-mono text-xs truncate max-w-full sm:max-w-xl">
                {current.summary}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-center">
          {alerts.length > 1 && (
            <div className="flex items-center gap-1 pr-1 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) => (prev - 1 + alerts.length) % alerts.length)
                }
                aria-label="Notifikasi audit sebelumnya"
                className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-1">
                {safeIndex + 1}/{alerts.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => (prev + 1) % alerts.length)}
                aria-label="Notifikasi audit berikutnya"
                className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => onOpenAuditLog(current.id)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#05828e] dark:hover:border-[#2dd4bf] text-xs font-semibold text-[#05828e] dark:text-[#2dd4bf] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
          >
            <span>Lihat Audit Log</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {alerts.length > 1 && (
            <button
              type="button"
              onClick={onDismissAll}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              Tandai Semua
            </button>
          )}

          <button
            type="button"
            onClick={() => onDismissAlert(current.id)}
            aria-label="Tutup notifikasi audit"
            title="Tutup notifikasi"
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

interface AuditRealtimeToastProps {
  notification: LiveAuditNotification | null;
  hasSecondaryToastAbove?: boolean;
  onOpenAuditLog: (alertId: string) => void;
  onClose: () => void;
  onPauseHover?: (paused: boolean) => void;
}

/**
 * Floating real-time toast card surfaced immediately when an important Central Audit Log
 * event is captured.
 */
export const AuditRealtimeToast: React.FC<AuditRealtimeToastProps> = ({
  notification,
  hasSecondaryToastAbove = false,
  onOpenAuditLog,
  onClose,
  onPauseHover,
}) => {
  if (!notification) return null;

  const isCritical = notification.severity === 'critical';

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => onPauseHover?.(true)}
      onMouseLeave={() => onPauseHover?.(false)}
      className={`fixed right-5 z-50 w-[calc(100vw-2.5rem)] max-w-md rounded-2xl bg-white dark:bg-slate-900 border shadow-xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-200 transition-all ${
        hasSecondaryToastAbove ? 'bottom-20' : 'bottom-6'
      } ${
        isCritical
          ? 'border-rose-200 dark:border-rose-800/80'
          : 'border-slate-200 dark:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isCritical ? 'bg-rose-600 text-white' : 'bg-[#05828e] text-white'
          }`}
        >
          {isCritical ? (
            <ShieldAlert className="w-4 h-4" />
          ) : (
            <History className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
              <span
                className={`font-semibold ${
                  isCritical
                    ? 'text-rose-700 dark:text-rose-300'
                    : 'text-[#05828e] dark:text-[#2dd4bf]'
                }`}
              >
                Audit Log Pusat
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {notification.entry.module}
              </span>
              <span aria-hidden="true">·</span>
              <span>{notification.entry.actionType}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup toast audit"
              className="w-7 h-7 -mt-1 -mr-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
            {notification.headline}
          </div>

          <div className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate">
            {notification.summary}
          </div>

          <div className="flex items-center justify-between gap-2 pt-1.5">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              Oleh {notification.entry.author || 'Sistem'} · {notification.entry.timestamp}
            </span>

            <button
              type="button"
              onClick={() => onOpenAuditLog(notification.id)}
              className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-[#05828e] dark:text-[#2dd4bf] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              <span>Buka Audit Log</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
