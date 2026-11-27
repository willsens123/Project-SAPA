import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { BlacklistMatchEntry } from '../utils/identitasCrossModuleHelper';

interface BlacklistWarningBannerProps {
  matches: BlacklistMatchEntry[];
  contextLabel?: string;
  compact?: boolean;
  className?: string;
}

export const BlacklistWarningBanner: React.FC<BlacklistWarningBannerProps> = ({
  matches,
  contextLabel = 'transaksi atau pesan menyapa',
  compact = false,
  className = '',
}) => {
  if (!matches || matches.length === 0) return null;

  const isSingle = matches.length === 1;
  const first = matches[0];

  return (
    <div
      role="alert"
      className={`rounded-xl border border-rose-200 dark:border-rose-800/80 bg-rose-50/85 dark:bg-rose-950/35 text-rose-900 dark:text-rose-100 ${
        compact ? 'px-3.5 py-2.5' : 'px-4 py-3.5'
      } ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="text-xs font-bold text-rose-900 dark:text-rose-100">
            {isSingle
              ? 'Peringatan: Data Berstatus Blacklist Dipilih'
              : `Peringatan: ${matches.length} Data Berstatus Blacklist Terdeteksi`}
          </div>

          <div className="space-y-0.5 text-xs text-rose-800 dark:text-rose-200">
            {matches.slice(0, 4).map((m, idx) => (
              <div key={`${m.id}-${m.roleLabel || idx}`} className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                {m.roleLabel && (
                  <>
                    <span className="font-semibold text-rose-900 dark:text-rose-100">{m.roleLabel}:</span>
                  </>
                )}
                <span className="font-semibold">{m.name}</span>
                {m.code && (
                  <>
                    <span className="text-rose-400 dark:text-rose-600">·</span>
                    <span className="font-mono tabular-nums text-[11px]">{m.code}</span>
                  </>
                )}
                <span className="text-rose-400 dark:text-rose-600">·</span>
                <span className="text-[11px]">{m.entityType}</span>
                {m.pic && (
                  <>
                    <span className="text-rose-400 dark:text-rose-600">·</span>
                    <span className="text-[11px]">PIC: {m.pic}</span>
                  </>
                )}
                {m.keterangan && (
                  <>
                    <span className="text-rose-400 dark:text-rose-600">·</span>
                    <span className="text-[11px] italic truncate max-w-[300px]">
                      Catatan: {m.keterangan}
                    </span>
                  </>
                )}
              </div>
            ))}
            {matches.length > 4 && (
              <div className="text-[11px] font-medium text-rose-700 dark:text-rose-300 tabular-nums">
                + {matches.length - 4} anggota Blacklist lainnya dalam pilihan ini
              </div>
            )}
          </div>

          <p className="text-[11px] text-rose-700 dark:text-rose-300 leading-relaxed">
            Harap tinjau riwayat komplain atau catatan sebelum melanjutkan {contextLabel}. Sistem tidak memblokir input, sehingga Anda tetap dapat menyimpan bila sudah disetujui tim terkait.
          </p>
          {first && !isSingle && null}
        </div>
      </div>
    </div>
  );
};
