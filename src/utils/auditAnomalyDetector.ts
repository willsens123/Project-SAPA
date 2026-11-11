import { CentralAuditLogEntry, SuspiciousAuditFlag, SuspiciousStatus, AuditAnomalyJobReport } from '../types';
import { dispatchAuditEvent, formatAuditTimestamp } from './auditEventBus';

export const ANOMALY_STATUS_STORAGE_KEY = 'yppln_audit_anomaly_overrides_v1';
export const AUDIT_ANOMALY_EVENT_NAME = 'yppln_audit_anomalies_updated';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Normalizes field names for consistent grouping (e.g., "Nomor HandPhone", "nomorHandPhone", "No. HP" -> "nomorhandphone")
 */
export function normalizeFieldKey(field: string = ''): string {
  const cleaned = field
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  if (cleaned.includes('handphone') || cleaned.includes('nohp') || cleaned.includes('phone') || cleaned.includes('telepon')) {
    return 'nomorhandphone';
  }
  if (cleaned.includes('email') || cleaned.includes('surel')) {
    return 'email';
  }
  if (cleaned.includes('rekening') || cleaned.includes('norek') || cleaned.includes('bank')) {
    return 'rekening';
  }
  if (cleaned.includes('organisasi')) {
    return 'organisasi';
  }
  if (cleaned.includes('status')) {
    return 'status';
  }
  if (cleaned.includes('alamat') || cleaned.includes('kota')) {
    return 'alamat';
  }
  if (cleaned.includes('nama')) {
    return 'nama';
  }
  return cleaned || 'umum';
}

/**
 * Indonesian month translation map for robust date parsing
 */
const INDO_MONTH_MAP: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  mei: 4,
  may: 4,
  jun: 5,
  jul: 6,
  agu: 7,
  aug: 7,
  sep: 8,
  okt: 9,
  oct: 9,
  nov: 10,
  des: 11,
  dec: 11,
};

/**
 * Parses timestamp string into millisecond epoch
 */
export function parseLogTimestamp(ts?: string): number {
  if (!ts) return 0;
  const isoTry = Date.parse(ts);
  if (!isNaN(isoTry) && isoTry > 0) return isoTry;

  const lower = ts.toLowerCase();
  const match = lower.match(/(\d{1,2})\s+([a-z]{3,4})\s+(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (match) {
    const day = parseInt(match[1], 10);
    const mStr = match[2].slice(0, 3);
    const month = INDO_MONTH_MAP[mStr] ?? 0;
    const year = parseInt(match[3], 10);
    const hour = match[4] ? parseInt(match[4], 10) : 0;
    const min = match[5] ? parseInt(match[5], 10) : 0;
    return new Date(year, month, day, hour, min).getTime();
  }

  return 0;
}

/**
 * Returns epoch in ms for an audit log entry
 */
export function getLogEpoch(entry: CentralAuditLogEntry): number {
  if (entry.isoTimestamp) {
    const parsed = Date.parse(entry.isoTimestamp);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  if (entry.timestamp) {
    return parseLogTimestamp(entry.timestamp);
  }
  return 0;
}

/**
 * Loads user/admin overrides for anomaly flags (e.g. marked INVESTIGATED or DISMISSED)
 */
export function loadAnomalyStatusOverrides(): Record<string, { status: SuspiciousStatus; notes?: string; investigatedAt?: string; investigatedBy?: string }> {
  try {
    const raw = localStorage.getItem(ANOMALY_STATUS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load anomaly status overrides', e);
  }
  return {};
}

/**
 * Saves an anomaly status override to localStorage
 */
export function saveAnomalyStatusOverride(
  flagId: string,
  status: SuspiciousStatus,
  notes?: string,
  investigatedBy: string = 'Admin'
): void {
  try {
    const overrides = loadAnomalyStatusOverrides();
    overrides[flagId] = {
      status,
      notes,
      investigatedAt: formatAuditTimestamp(new Date()),
      investigatedBy,
    };
    localStorage.setItem(ANOMALY_STATUS_STORAGE_KEY, JSON.stringify(overrides));
  } catch (e) {
    console.error('Failed to save anomaly status override', e);
  }
}

/**
 * Core Detection Engine:
 * Flags 'Identitas' changes where the same field has been modified MORE THAN 3 TIMES within a month (30-day window).
 */
export function scanIdentitasAuditAnomalies(logs: CentralAuditLogEntry[]): SuspiciousAuditFlag[] {
  // 1. Filter only IDENTITAS module logs that represent field modifications
  const identitasLogs = logs.filter((l) => {
    if (l.module !== 'IDENTITAS') return false;
    const isChangeAction =
      l.actionType === 'Ubah' ||
      l.actionType === 'UPDATE' ||
      (l.oldValue && l.newValue && l.oldValue !== l.newValue && l.oldValue !== '-');
    return isChangeAction && !!l.field;
  });

  // 2. Group by Identity (recordId or metadata.codeId or recordTitle) + normalizedField
  const groups = new Map<string, {
    recordId: string;
    recordTitle: string;
    fieldLabel: string;
    normalizedField: string;
    entries: CentralAuditLogEntry[];
  }>();

  identitasLogs.forEach((log) => {
    const recId = log.recordId || log.metadata?.codeId || log.recordTitle || 'unknown';
    const normField = normalizeFieldKey(log.field);
    const groupKey = `${recId}:::${normField}`;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        recordId: recId,
        recordTitle: log.recordTitle || `ID ${recId}`,
        fieldLabel: log.field,
        normalizedField: normField,
        entries: [],
      });
    }

    groups.get(groupKey)!.entries.push(log);
  });

  const overrides = loadAnomalyStatusOverrides();
  const flags: SuspiciousAuditFlag[] = [];

  // 3. For each group, search for any sliding 30-day window containing > 3 changes
  groups.forEach((group) => {
    const rawEntries = group.entries;
    if (rawEntries.length <= 3) return; // Must be strictly MORE THAN 3 times (> 3, so 4 or more)

    // Sort entries chronologically
    const sorted = [...rawEntries].sort((a, b) => getLogEpoch(a) - getLogEpoch(b));

    // Sliding window evaluation
    let maxWindow: CentralAuditLogEntry[] = [];
    let bestStartIndex = 0;

    for (let i = 0; i < sorted.length; i++) {
      const startEpoch = getLogEpoch(sorted[i]);

      if (startEpoch > 0) {
        const windowMembers = sorted.filter((entry) => {
          const ep = getLogEpoch(entry);
          return ep >= startEpoch && ep <= startEpoch + THIRTY_DAYS_MS;
        });

        if (windowMembers.length > maxWindow.length) {
          maxWindow = windowMembers;
          bestStartIndex = i;
        }
      }
    }

    // Fallback: If timestamps couldn't be parsed into valid epochs, evaluate if entries share same month/year or total count > 3
    if (maxWindow.length <= 3 && sorted.length > 3) {
      const monthGroups = new Map<string, CentralAuditLogEntry[]>();
      sorted.forEach((e) => {
        const m = (e.timestamp || '').match(/([a-zA-Z]{3,4}\s+\d{4})/);
        const mKey = m ? m[1].toLowerCase() : 'all';
        if (!monthGroups.has(mKey)) monthGroups.set(mKey, []);
        monthGroups.get(mKey)!.push(e);
      });

      monthGroups.forEach((mList) => {
        if (mList.length > 3 && mList.length > maxWindow.length) {
          maxWindow = mList;
        }
      });

      if (maxWindow.length <= 3) {
        // As a final safety net for simulated/recent logs without distinct dates
        maxWindow = sorted;
      }
    }

    // Condition: MORE THAN 3 modifications within a month
    if (maxWindow.length > 3) {
      const flagId = `flag-${group.recordId}-${group.normalizedField}`;
      const changeCount = maxWindow.length;
      const firstEntry = maxWindow[0];
      const lastEntry = maxWindow[maxWindow.length - 1];

      const firstEpoch = getLogEpoch(firstEntry);
      const lastEpoch = getLogEpoch(lastEntry);
      const windowDays =
        firstEpoch > 0 && lastEpoch > 0
          ? Math.max(1, Math.round((lastEpoch - firstEpoch) / (24 * 60 * 60 * 1000)))
          : 30;

      const windowStart = firstEntry.timestamp || 'Awal Bulan';
      const windowEnd = lastEntry.timestamp || 'Akhir Bulan';

      const override = overrides[flagId];
      const status: SuspiciousStatus = override ? override.status : 'ACTIVE';
      const severity = changeCount >= 6 ? 'CRITICAL' : 'HIGH';

      flags.push({
        id: flagId,
        recordId: group.recordId,
        recordTitle: group.recordTitle,
        field: group.fieldLabel,
        normalizedField: group.normalizedField,
        changeCount,
        windowStart,
        windowEnd,
        windowDays,
        severity,
        status,
        reason: `Field '${group.fieldLabel}' pada identitas ${group.recordTitle} telah diubah sebanyak ${changeCount} kali dalam kurun waktu ${windowDays} hari (${windowStart} s/d ${windowEnd}). Modifikasi berulang yang tidak wajar dapat mengindikasikan penyalahgunaan akun, kesalahan entri berulang, atau manipulasi profil donatur.`,
        matchingLogs: maxWindow,
        detectedAt: formatAuditTimestamp(new Date()),
        investigatedAt: override?.investigatedAt,
        investigatedBy: override?.investigatedBy,
        notes: override?.notes,
      });
    }
  });

  // Sort flags with ACTIVE and highest changeCount first
  flags.sort((a, b) => {
    if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
    if (a.status !== 'ACTIVE' && b.status === 'ACTIVE') return 1;
    return b.changeCount - a.changeCount;
  });

  return flags;
}

/**
 * Singleton State & Runner for the Recurring Background Job
 */
class AuditAnomalyBackgroundWorker {
  private timer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private runCount: number = 0;
  private lastRunAt: string | null = null;
  private intervalSeconds: number = 30;
  private latestFlags: SuspiciousAuditFlag[] = [];
  private listeners: Set<(report: AuditAnomalyJobReport) => void> = new Set();
  private getLogsFn: () => CentralAuditLogEntry[] = () => [];
  private boundWindowListener: (() => void) | null = null;

  public start(
    getLogs: () => CentralAuditLogEntry[],
    onUpdate?: (report: AuditAnomalyJobReport) => void,
    intervalSeconds: number = 30
  ): () => void {
    this.getLogsFn = getLogs;
    this.intervalSeconds = intervalSeconds;
    this.isRunning = true;

    if (onUpdate) {
      this.listeners.add(onUpdate);
    }

    // Run initial scan immediately
    this.runScan();

    // Setup periodic interval
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.runScan();
    }, this.intervalSeconds * 1000);

    // Also trigger instant scan whenever a new audit event is dispatched in the application
    if (typeof window !== 'undefined' && !this.boundWindowListener) {
      this.boundWindowListener = () => {
        // Small delay to allow state to settle
        setTimeout(() => this.runScan(), 100);
      };
      window.addEventListener('yppln_audit_event', this.boundWindowListener);
    }

    return () => {
      this.stop();
      if (onUpdate) {
        this.listeners.delete(onUpdate);
      }
    };
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (typeof window !== 'undefined' && this.boundWindowListener) {
      window.removeEventListener('yppln_audit_event', this.boundWindowListener);
      this.boundWindowListener = null;
    }
    this.isRunning = false;
  }

  public runScan(): AuditAnomalyJobReport {
    this.runCount++;
    this.lastRunAt = formatAuditTimestamp(new Date());

    const logs = this.getLogsFn();
    this.latestFlags = scanIdentitasAuditAnomalies(logs);

    const report = this.getReport(logs);

    // Notify listeners
    this.listeners.forEach((listener) => {
      try {
        listener(report);
      } catch (err) {
        console.error('Error notifying audit anomaly listener', err);
      }
    });

    // Also dispatch custom DOM event for any cross-component listeners
    if (typeof window !== 'undefined') {
      try {
        const ev = new CustomEvent(AUDIT_ANOMALY_EVENT_NAME, { detail: report });
        window.dispatchEvent(ev);
      } catch (e) {
        console.error(e);
      }
    }

    return report;
  }

  public getReport(currentLogs?: CentralAuditLogEntry[]): AuditAnomalyJobReport {
    const logs = currentLogs || this.getLogsFn();
    const identitasLogs = logs.filter((l) => l.module === 'IDENTITAS');
    const uniqueIdentitas = new Set(identitasLogs.map((l) => l.recordId || l.recordTitle));

    const activeFlags = this.latestFlags.filter((f) => f.status === 'ACTIVE');

    return {
      lastRunAt: this.lastRunAt,
      runCount: this.runCount,
      scannedLogsCount: logs.length,
      scannedIdentitasCount: uniqueIdentitas.size,
      activeFlagsCount: activeFlags.length,
      flags: this.latestFlags,
      isJobRunning: this.isRunning,
      intervalSeconds: this.intervalSeconds,
    };
  }

  public addListener(listener: (report: AuditAnomalyJobReport) => void): () => void {
    this.listeners.add(listener);
    // Emit current state immediately
    listener(this.getReport());
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const auditAnomalyWorker = new AuditAnomalyBackgroundWorker();

/**
 * Convenience helper to simulate 4 rapid updates to a field of an identity
 * for instant live testing of the background anomaly detector.
 */
export function simulateSuspiciousIdentitasUpdates(
  codeId: string = '00031',
  recordTitle: string = 'Agustino Ong',
  field: string = 'Nomor HandPhone'
): void {
  const values = [
    { old: '+6281234567890', new: '081299990001', reason: 'Uji coba ganti kontak 1' },
    { old: '081299990001', new: '081299990002', reason: 'Uji coba ganti kontak 2' },
    { old: '081299990002', new: '081299990003', reason: 'Uji coba ganti kontak 3' },
    { old: '081299990003', new: '081299990004', reason: 'Uji coba ganti kontak 4 (Memicu Peringatan Anomali > 3x)' },
  ];

  const now = new Date();

  values.forEach((v, idx) => {
    const logDate = new Date(now.getTime() - (4 - idx) * 60 * 1000);
    dispatchAuditEvent({
      module: 'IDENTITAS',
      actionType: 'Ubah',
      recordId: codeId,
      recordTitle,
      field,
      oldValue: v.old,
      newValue: v.new,
      alasan: v.reason,
      author: 'Tester Keamanan',
      timestamp: formatAuditTimestamp(logDate),
      isoTimestamp: logDate.toISOString(),
      metadata: {
        codeId,
        isSimulatedAnomaly: true,
      },
    });
  });

  // Force scan immediately
  auditAnomalyWorker.runScan();
}
