import React, { useMemo, useState } from 'react';
import {
  Laptop,
  LogOut,
  Search,
  ShieldAlert,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  KeyRound,
} from 'lucide-react';
import { LoginActivityRecord } from '../types';
import { ROLE_METADATA } from '../utils/rbacManager';
import { formatLoginTimestamp } from '../utils/loginActivityHelper';

interface LoginActivitySessionPanelProps {
  records: LoginActivityRecord[];
  currentSessionId: string;
  canManageSessions: boolean;
  onRevokeSession: (sessionRecord: LoginActivityRecord) => void;
}

const AUTH_METHOD_LABELS: Record<LoginActivityRecord['authMethod'], string> = {
  google_firebase: 'Google Firebase Auth',
  member_credentials: 'Akun Anggota Divisi',
  session_restore: 'Pemulihan Sesi',
};

export const LoginActivitySessionPanel: React.FC<LoginActivitySessionPanelProps> = ({
  records,
  currentSessionId,
  canManageSessions,
  onRevokeSession,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'logged_out' | 'revoked'>('all');

  const stats = useMemo(() => {
    const active = records.filter((r) => r.status === 'active').length;
    const credentialCount = records.filter((r) => r.authMethod === 'member_credentials').length;
    const revokedCount = records.filter((r) => r.status === 'revoked').length;
    const uniqueDevices = new Set(records.map((r) => r.deviceLabel)).size;
    return {
      total: records.length,
      active,
      credentialCount,
      revokedCount,
      uniqueDevices,
    };
  }, [records]);

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!q) return true;
      return (
        item.namaLengkap.toLowerCase().includes(q) ||
        item.kodeKaryawan.toLowerCase().includes(q) ||
        item.divisi.toLowerCase().includes(q) ||
        item.deviceLabel.toLowerCase().includes(q) ||
        (item.firebaseEmail || '').toLowerCase().includes(q) ||
        AUTH_METHOD_LABELS[item.authMethod].toLowerCase().includes(q)
      );
    });
  }, [records, searchQuery, statusFilter]);

  return (
    <div className="space-y-5">
      {/* Top Summary Strip — Clean Hairline Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border border-slate-200/80 dark:border-slate-800 rounded-2xl divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="p-4">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
            Sesi Aktif Lintas Perangkat
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {stats.active}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">perangkat aktif</span>
          </div>
        </div>

        <div className="p-4">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
            Total Riwayat Login
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
              {stats.total}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              di <span className="font-mono tabular-nums">{stats.uniqueDevices}</span> perangkat
            </span>
          </div>
        </div>

        <div className="p-4">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
            Login Akun Anggota
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#05828e] dark:text-teal-400 font-mono tabular-nums">
              {stats.credentialCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">autentikasi kredensial</span>
          </div>
        </div>

        <div className="p-4">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
            Sesi Dihentikan Admin
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
              {stats.revokedCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">pencabutan akses</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700">
          {(
            [
              { id: 'all', label: 'Semua' },
              { id: 'active', label: 'Sesi Aktif' },
              { id: 'logged_out', label: 'Logout Normal' },
              { id: 'revoked', label: 'Dihentikan Admin' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari admin, divisi, email, perangkat..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#05828e]"
          />
        </div>
      </div>

      {/* Session Table */}
      <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
        {filteredRecords.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Laptop className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2.5" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Belum ada catatan aktivitas login yang cocok
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Setiap proses login dan pencabutan sesi perangkat akan disinkronkan secara otomatis ke Firestore.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[820px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3 px-4">Anggota &amp; Role</th>
                  <th className="py-3 px-4">Perangkat &amp; Metode Autentikasi</th>
                  <th className="py-3 px-4">Waktu Login</th>
                  <th className="py-3 px-4">Status Sesi</th>
                  <th className="py-3 px-4 text-right">Kontrol Sesi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredRecords.map((rec) => {
                  const isCurrentDevice = rec.sessionId === currentSessionId;
                  const roleMeta = ROLE_METADATA[rec.role] || ROLE_METADATA.admin_operasional;

                  return (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <span>{rec.namaLengkap}</span>
                          {isCurrentDevice && (
                            <span className="text-[10px] font-bold text-[#05828e] dark:text-teal-400">
                              (Perangkat Ini)
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-mono tabular-nums">
                          <span>{rec.kodeKaryawan}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-sans font-semibold text-slate-600 dark:text-slate-300">
                            Divisi {rec.divisi}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-sans">{roleMeta.shortLabel}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                          <Laptop className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                          <span>{rec.deviceLabel}</span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[#05828e] dark:text-teal-400 font-medium">
                            {rec.authMethod === 'google_firebase' ? (
                              <ShieldCheck className="w-3 h-3" />
                            ) : (
                              <KeyRound className="w-3 h-3" />
                            )}
                            {AUTH_METHOD_LABELS[rec.authMethod]}
                          </span>
                          {rec.firebaseEmail && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono">{rec.firebaseEmail}</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 align-top font-mono tabular-nums text-[11px] text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{formatLoginTimestamp(rec.loginAt)}</span>
                        </div>
                        {rec.logoutAt ? (
                          <div className="mt-0.5 text-slate-400 dark:text-slate-500">
                            Berakhir: {formatLoginTimestamp(rec.logoutAt)}
                          </div>
                        ) : (
                          <div className="mt-0.5 text-slate-400 dark:text-slate-500">
                            Aktif terakhir: {formatLoginTimestamp(rec.lastActiveAt)}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top">
                        {rec.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Sesi Aktif</span>
                          </span>
                        ) : rec.status === 'revoked' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Dihentikan</span>
                            </span>
                            {rec.revokedBy && (
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                Oleh {rec.revokedBy}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Logout Normal</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 align-top text-right">
                        {rec.status === 'active' && canManageSessions ? (
                          <button
                            type="button"
                            onClick={() => onRevokeSession(rec)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-800/80 bg-rose-50/70 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>{isCurrentDevice ? 'Logout Sesi Ini' : 'Putus Sesi'}</span>
                          </button>
                        ) : rec.status === 'active' ? (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 inline-flex items-center gap-1">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Khusus Super Admin</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
