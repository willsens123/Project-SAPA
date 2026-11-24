import { KaryawanItem, LoginActivityRecord, LoginAuthMethod, UserRole } from '../types';
import { resolveEffectiveRole } from './rbacManager';

const SESSION_ID_STORAGE_KEY = 'sapa_erp_device_session_id_v1';
const LOGIN_ACTIVITY_LOCAL_KEY = 'sapa_erp_login_activity_logs_v1';
export const MAX_LOGIN_ACTIVITY_RECORDS = 200;

export function getOrCreateDeviceSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_ID_STORAGE_KEY);
    if (existing && existing.trim()) return existing.trim();
    const generated = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(SESSION_ID_STORAGE_KEY, generated);
    return generated;
  } catch {
    return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

export function resetDeviceSessionId(): string {
  const next = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    sessionStorage.setItem(SESSION_ID_STORAGE_KEY, next);
  } catch {
    // Ignore storage restrictions
  }
  return next;
}

export function getDeviceFingerprintLabel(): { deviceLabel: string; userAgentShort: string } {
  if (typeof navigator === 'undefined') {
    return { deviceLabel: 'Web Browser', userAgentShort: 'Server / Unknown' };
  }

  const ua = navigator.userAgent || '';
  let browser = 'Browser Lainnya';
  if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = 'Google Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Apple Safari';

  let os = 'OS Lainnya';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  const formFactor = /Mobi|Android|iPhone/i.test(ua) ? 'Mobile' : 'Desktop';
  const resolution =
    typeof window !== 'undefined' && window.screen
      ? `${window.screen.width}x${window.screen.height}`
      : '';

  const deviceLabel = `${browser} · ${os} (${formFactor})`;
  const userAgentShort = resolution ? `${browser} / ${os} · ${resolution}` : `${browser} / ${os}`;
  return { deviceLabel, userAgentShort };
}

export function createLoginActivityEntry(params: {
  user: KaryawanItem;
  sessionId: string;
  authMethod: LoginAuthMethod;
  firebaseUid?: string;
  firebaseEmail?: string;
}): LoginActivityRecord {
  const nowIso = new Date().toISOString();
  const { deviceLabel, userAgentShort } = getDeviceFingerprintLabel();
  const role: UserRole = resolveEffectiveRole(params.user);

  return {
    id: `login-${params.sessionId}-${Date.now()}`,
    sessionId: params.sessionId,
    userId: params.user.id,
    kodeKaryawan: params.user.kodeKaryawan || '-',
    namaLengkap: params.user.namaLengkap,
    role,
    divisi: (params.user.divisi || 'UMM').toUpperCase(),
    authMethod: params.authMethod,
    ...(params.firebaseUid ? { firebaseUid: params.firebaseUid } : {}),
    ...(params.firebaseEmail ? { firebaseEmail: params.firebaseEmail } : {}),
    deviceLabel,
    userAgentShort,
    loginAt: nowIso,
    lastActiveAt: nowIso,
    status: 'active',
  };
}

export function upsertLoginSessionRecord(
  list: LoginActivityRecord[],
  entry: LoginActivityRecord
): LoginActivityRecord[] {
  const existingIdx = list.findIndex((item) => item.sessionId === entry.sessionId);
  let next: LoginActivityRecord[];
  if (existingIdx >= 0) {
    next = list.map((item, idx) =>
      idx === existingIdx
        ? {
            ...item,
            ...entry,
            id: item.id,
            loginAt: item.loginAt,
            status: item.status === 'revoked' ? 'revoked' : 'active',
          }
        : item
    );
  } else {
    next = [entry, ...list];
  }
  return next.slice(0, MAX_LOGIN_ACTIVITY_RECORDS);
}

export function markSessionLoggedOut(
  list: LoginActivityRecord[],
  sessionId: string
): LoginActivityRecord[] {
  const nowIso = new Date().toISOString();
  return list.map((item) =>
    item.sessionId === sessionId && item.status === 'active'
      ? {
          ...item,
          status: 'logged_out',
          logoutAt: nowIso,
          lastActiveAt: nowIso,
        }
      : item
  );
}

export function revokeSessionRecord(
  list: LoginActivityRecord[],
  targetIdOrSessionId: string,
  revokedBy: string
): LoginActivityRecord[] {
  const nowIso = new Date().toISOString();
  return list.map((item) =>
    (item.id === targetIdOrSessionId || item.sessionId === targetIdOrSessionId) &&
    item.status === 'active'
      ? {
          ...item,
          status: 'revoked',
          logoutAt: nowIso,
          lastActiveAt: nowIso,
          revokedBy,
        }
      : item
  );
}

export function loadLocalLoginActivityLogs(): LoginActivityRecord[] {
  try {
    const raw = localStorage.getItem(LOGIN_ACTIVITY_LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LoginActivityRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalLoginActivityLogs(list: LoginActivityRecord[]): void {
  try {
    localStorage.setItem(
      LOGIN_ACTIVITY_LOCAL_KEY,
      JSON.stringify(list.slice(0, MAX_LOGIN_ACTIVITY_RECORDS))
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function formatLoginTimestamp(iso?: string): string {
  if (!iso) return '-';
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return iso;
  return dt.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
