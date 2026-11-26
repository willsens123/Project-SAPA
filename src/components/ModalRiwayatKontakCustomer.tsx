import React from 'react';
import {
  X,
  MessageCircle,
  Clock,
  User,
  Phone,
  Receipt,
  Truck,
  HeartHandshake,
  MessageSquare,
  History,
} from 'lucide-react';
import { ResolvedLastContactedSummary, ContactTimelineEvent } from '../utils/lastContactedHelper';

interface ModalRiwayatKontakCustomerProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  customerPanggilan?: string;
  customerCode?: string;
  phone?: string;
  avatarInitial?: string;
  avatarBg?: string;
  summary: ResolvedLastContactedSummary;
  onSendWhatsappNow: () => void;
}

function renderEventIcon(channel: ContactTimelineEvent['channel']) {
  switch (channel) {
    case 'kwitansi_donasi':
      return <Receipt className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    case 'resi_salur':
      return <Truck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />;
    case 'tagihan_patron':
      return <HeartHandshake className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    case 'list_pm':
      return <MessageSquare className="w-3.5 h-3.5 text-[#05828e]" />;
    case 'customer_direct':
      return <MessageCircle className="w-3.5 h-3.5 text-[#05828e]" />;
    default:
      return <History className="w-3.5 h-3.5 text-slate-400" />;
  }
}

export const ModalRiwayatKontakCustomer: React.FC<ModalRiwayatKontakCustomerProps> = ({
  isOpen,
  onClose,
  customerName,
  customerPanggilan,
  customerCode,
  phone,
  avatarInitial,
  avatarBg = 'bg-[#05828e]',
  summary,
  onSendWhatsappNow,
}) => {
  if (!isOpen) return null;

  const isHexBg = avatarBg.startsWith('#');
  const displayInitial = avatarInitial || (customerName || 'C').charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-900">
          <div className="flex items-center gap-3 min-w-0">
            <div
              style={isHexBg ? { backgroundColor: avatarBg } : undefined}
              className={`w-10 h-10 rounded-full text-white font-bold text-sm flex items-center justify-center shrink-0 ${
                isHexBg ? '' : avatarBg
              }`}
            >
              {displayInitial}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {customerCode ? `${customerCode} · ` : ''}
                {customerName}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
                {customerPanggilan && customerPanggilan !== '-' && (
                  <span>{customerPanggilan}</span>
                )}
                {customerPanggilan && customerPanggilan !== '-' && phone && phone !== '-' && (
                  <span aria-hidden="true">·</span>
                )}
                {phone && phone !== '-' && (
                  <span className="font-mono tabular-nums flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Tutup riwayat kontak"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Last Contacted Highlight Strip */}
        <div className="px-5 py-3.5 bg-teal-50/60 dark:bg-teal-950/30 border-b border-teal-100 dark:border-teal-900/50 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Terakhir Dihubungi
            </div>
            {summary.hasContactHistory ? (
              <div className="mt-0.5">
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {summary.displayDate}
                  {summary.relativeLabel && (
                    <span className="ml-2 text-xs font-semibold text-[#05828e] dark:text-teal-300">
                      ({summary.relativeLabel})
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {summary.channelLabel}
                  {summary.actor ? ` · oleh ${summary.actor}` : ''}
                </div>
              </div>
            ) : (
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Belum pernah ada riwayat kontak tercatat
              </div>
            )}
          </div>

          <Clock className="w-5 h-5 text-[#05828e] dark:text-teal-400 shrink-0 opacity-80" />
        </div>

        {/* Cross-Module Timeline */}
        <div className="p-5 overflow-y-auto flex-1 space-y-2.5">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between">
            <span>Timeline Kontak Lintas Modul</span>
            <span className="text-[11px] text-slate-400 tabular-nums">
              {summary.events.length} aktivitas
            </span>
          </div>

          {summary.events.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              Belum ada aktivitas WhatsApp atau List PM untuk customer ini.
            </div>
          ) : (
            <div className="space-y-2">
              {summary.events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100">
                      {renderEventIcon(ev.channel)}
                      <span>{ev.channelLabel}</span>
                    </div>
                    <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {ev.displayDate}
                    </span>
                  </div>

                  {(ev.detail || ev.actor || ev.phone) && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      {ev.detail && <span>{ev.detail}</span>}
                      {ev.phone && ev.phone !== '-' && (
                        <>
                          {ev.detail && <span aria-hidden="true">·</span>}
                          <span className="font-mono tabular-nums">{ev.phone}</span>
                        </>
                      )}
                      {ev.actor && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {ev.actor}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {ev.messagePreview && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 whitespace-pre-line">
                      {ev.messagePreview}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onSendWhatsappNow();
            }}
            className="px-4 py-2 rounded-xl bg-[#05828e] hover:bg-[#046c76] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Kirim WhatsApp Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
