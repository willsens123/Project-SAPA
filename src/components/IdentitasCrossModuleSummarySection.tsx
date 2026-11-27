import React, { useMemo, useState } from 'react';
import {
  ArrowDownUp,
  BookOpen,
  Building2,
  Coins,
  GraduationCap,
  HeartHandshake,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquareWarning,
  Phone,
  Search,
  Send,
  UserCheck,
  X,
} from 'lucide-react';
import { IdentitasItem } from '../identitasData';
import {
  CrossModuleTimelineCategory,
  formatRupiahAmount,
  IdentitasCrossModuleSummary,
} from '../utils/identitasCrossModuleHelper';
import { BlacklistWarningBanner } from './BlacklistWarningBanner';

interface IdentitasCrossModuleSummarySectionProps {
  identity: IdentitasItem;
  summary: IdentitasCrossModuleSummary;
  onOpenContactHistory?: () => void;
  onSendWhatsappNow?: () => void;
  onNavigateToComplaints?: () => void;
  onNavigateToListPM?: () => void;
}

type TimelineFilterTab = 'all' | CrossModuleTimelineCategory;

export const IdentitasCrossModuleSummarySection: React.FC<
  IdentitasCrossModuleSummarySectionProps
> = ({
  identity,
  summary,
  onOpenContactHistory,
  onSendWhatsappNow,
  onNavigateToComplaints,
  onNavigateToListPM,
}) => {
  const [timelineTab, setTimelineTab] = useState<TimelineFilterTab>('all');
  const [timelineQuery, setTimelineQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const isBlacklist = identity.status === 'Blacklist';

  const countsByCategory = useMemo(() => {
    const counts = { all: summary.timeline.length, pm: 0, komplain: 0, transaksi: 0, wa: 0 };
    summary.timeline.forEach((item) => {
      counts[item.category] += 1;
    });
    return counts;
  }, [summary.timeline]);

  const filteredTimeline = useMemo(() => {
    const q = timelineQuery.trim().toLowerCase();
    const list = summary.timeline.filter((item) => {
      if (timelineTab !== 'all' && item.category !== timelineTab) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.moduleLabel.toLowerCase().includes(q) ||
        item.statusLabel.toLowerCase().includes(q) ||
        (item.detail && item.detail.toLowerCase().includes(q)) ||
        (item.actor && item.actor.toLowerCase().includes(q))
      );
    });
    return sortOrder === 'desc' ? list : [...list].reverse();
  }, [summary.timeline, timelineTab, timelineQuery, sortOrder]);

  const filterTabs: Array<{ id: TimelineFilterTab; label: string; count: number }> = [
    { id: 'all', label: 'Semua', count: countsByCategory.all },
    { id: 'pm', label: 'List PM', count: countsByCategory.pm },
    { id: 'komplain', label: 'Komplain', count: countsByCategory.komplain },
    { id: 'transaksi', label: 'Transaksi', count: countsByCategory.transaksi },
    { id: 'wa', label: 'Kontak WA', count: countsByCategory.wa },
  ];

  const getCategoryIcon = (cat: CrossModuleTimelineCategory, moduleLabel: string) => {
    if (cat === 'pm') return <Send className="w-3.5 h-3.5 text-[#05828e] dark:text-[#2dd4bf]" />;
    if (cat === 'komplain')
      return <MessageSquareWarning className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
    if (cat === 'wa')
      return <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    if (moduleLabel.includes('S-SALUR'))
      return <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />;
    if (moduleLabel.includes('A-AJAR'))
      return <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
    return <HeartHandshake className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
  };

  const getStatusClass = (tone: 'teal' | 'amber' | 'rose' | 'slate') => {
    if (tone === 'rose') return 'text-rose-700 dark:text-rose-400 font-semibold';
    if (tone === 'amber') return 'text-amber-700 dark:text-amber-400 font-semibold';
    if (tone === 'teal') return 'text-[#05828e] dark:text-[#2dd4bf] font-semibold';
    return 'text-slate-600 dark:text-slate-400 font-medium';
  };

  return (
    <div className="space-y-4">
      {/* Blacklist banner at top of profile */}
      {isBlacklist && (
        <BlacklistWarningBanner
          matches={[
            {
              id: identity.id,
              entityType: 'Identitas',
              code: identity.codeId,
              name: identity.namaLengkap,
              pic: identity.pic && identity.pic !== '-' ? identity.pic : undefined,
              keterangan:
                identity.keterangan && identity.keterangan !== '-'
                  ? identity.keterangan
                  : undefined,
            },
          ]}
          contextLabel="transaksi atau penjadwalan List PM untuk profil ini"
        />
      )}

      {/* 4-Card KPI Strip: Total Kontribusi Lintas Modul */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {/* Card 1: Total Kontribusi Gabungan */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Total Kontribusi Lintas Modul</span>
            <Coins className="w-4 h-4 text-[#05828e] dark:text-[#2dd4bf]" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatRupiahAmount(summary.grandTotalNominal)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
              {summary.totalTransaksiCount} transaksi lintas D-DONASI, S-SALUR, A-AJAR
            </div>
          </div>
        </div>

        {/* Card 2: D-DONASI & Dharma Patron */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>D-DONASI &amp; Dharma Patron</span>
            <HeartHandshake className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatRupiahAmount(summary.donasi.totalNominal)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
              {summary.donasi.count} donasi
              {' · '}
              {summary.patron.activeCount > 0 ? (
                <span className="text-[#05828e] dark:text-[#2dd4bf] font-semibold">
                  Patron Aktif ({formatRupiahAmount(summary.patron.totalBulanan)}/bln)
                </span>
              ) : summary.patron.pausedCount > 0 ? (
                <span className="text-amber-700 dark:text-amber-400 font-medium">
                  Patron Nonaktif ({summary.patron.pausedCount})
                </span>
              ) : (
                <span>Bukan Patron Rutin</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: S-SALUR & A-AJAR */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>S-SALUR &amp; A-AJAR</span>
            <BookOpen className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatRupiahAmount(summary.salur.totalNominal + summary.ajar.totalNominal)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
              S-SALUR {summary.salur.count}x ({summary.salur.totalQty} item
              {summary.salur.hadiahCount > 0 ? `, ${summary.salur.hadiahCount} hadiah` : ''})
              {' · '}
              A-AJAR {summary.ajar.count}x
            </div>
          </div>
        </div>

        {/* Card 4: Aktivitas PM & Komplain */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>List PM &amp; Komplain</span>
            <MessageSquareWarning
              className={`w-4 h-4 ${
                summary.komplain.openCount + summary.komplain.diprosesCount > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 tabular-nums flex items-baseline gap-2">
              <span>{summary.pm.totalEntries} PM</span>
              <span className="text-slate-300 dark:text-slate-700 text-sm">/</span>
              <span
                className={
                  summary.komplain.openCount + summary.komplain.diprosesCount > 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : ''
                }
              >
                {summary.komplain.totalCount} Komplain
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
              {summary.pm.sentCount} terkirim, {summary.pm.scheduledCount} terjadwal
              {' · '}
              {summary.komplain.openCount + summary.komplain.diprosesCount > 0 ? (
                <span className="text-rose-600 dark:text-rose-400 font-semibold">
                  {summary.komplain.openCount + summary.komplain.diprosesCount} komplain aktif
                </span>
              ) : (
                <span>Tidak ada komplain aktif</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ringkasan Profil & Timeline Terpadu (Single-elevation bordered panel) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Top Metadata + Module Breakdown Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800">
          {/* Left: Identitas Quick Info & Organisasi Terkait */}
          <div className="lg:col-span-5 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Ringkasan Kontak &amp; Keterkaitan
              </h3>
              {onSendWhatsappNow && (
                <button
                  type="button"
                  onClick={onSendWhatsappNow}
                  className="text-xs font-semibold text-[#05828e] dark:text-[#2dd4bf] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Hubungi WA</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 min-w-0">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono tabular-nums truncate">
                  {identity.nomorHandPhone && identity.nomorHandPhone !== '-'
                    ? identity.nomorHandPhone
                    : 'No HP belum diisi'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 min-w-0">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {identity.email && identity.email !== '-' ? identity.email : '-'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {identity.kota && identity.kota !== '-' ? identity.kota : 'Kota belum diisi'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 min-w-0">
                <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  PIC: {identity.pic && identity.pic !== '-' ? identity.pic : '-'}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 min-w-0">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-500 dark:text-slate-400">Organisasi:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                  {summary.linkedOrganisasi.length > 0
                    ? summary.linkedOrganisasi.map((o) => o.namaOrg).join(', ')
                    : identity.organisasi && identity.organisasi !== '-'
                    ? identity.organisasi
                    : '-'}
                </span>
              </div>

              {onOpenContactHistory && (
                <button
                  type="button"
                  onClick={onOpenContactHistory}
                  className="text-xs text-slate-600 dark:text-slate-300 hover:text-[#05828e] dark:hover:text-[#2dd4bf] font-medium cursor-pointer tabular-nums"
                >
                  Last Contacted:{' '}
                  <strong className="font-semibold text-slate-900 dark:text-slate-100">
                    {summary.lastContacted.displayDate}
                  </strong>
                  {summary.lastContacted.hasContactHistory &&
                    summary.lastContacted.channelLabel && (
                      <span className="text-slate-500 dark:text-slate-400">
                        {' '}
                        · {summary.lastContacted.channelLabel}
                      </span>
                    )}
                </button>
              )}
            </div>
          </div>

          {/* Right: Breakdown Kontribusi Per Modul */}
          <div className="lg:col-span-7 p-4 sm:p-5 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Rincian Kontribusi &amp; Piutang Per Modul
              </h3>
              <div className="flex items-center gap-3 text-xs">
                {onNavigateToListPM && (
                  <button
                    type="button"
                    onClick={onNavigateToListPM}
                    className="text-[#05828e] dark:text-[#2dd4bf] hover:underline font-medium cursor-pointer"
                  >
                    Buka List PM
                  </button>
                )}
                {onNavigateToComplaints && (
                  <button
                    type="button"
                    onClick={onNavigateToComplaints}
                    className="text-[#05828e] dark:text-[#2dd4bf] hover:underline font-medium cursor-pointer"
                  >
                    Buka Komplain
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <div className="py-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                  <HeartHandshake className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>D-DONASI</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                    {summary.donasi.count} transaksi
                  </span>
                  {summary.donasi.unpaidNominal > 0 && (
                    <>
                      <span className="text-slate-400">·</span>
                      <span className="text-amber-700 dark:text-amber-400 font-medium tabular-nums">
                        Belum lunas {formatRupiahAmount(summary.donasi.unpaidNominal)}
                      </span>
                    </>
                  )}
                </div>
                <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                  {formatRupiahAmount(summary.donasi.totalNominal)}
                </span>
              </div>

              <div className="py-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                  <BookOpen className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>S-SALUR</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                    {summary.salur.count} pesanan ({summary.salur.totalQty} item)
                  </span>
                  {summary.salur.unpaidNominal > 0 && (
                    <>
                      <span className="text-slate-400">·</span>
                      <span className="text-amber-700 dark:text-amber-400 font-medium tabular-nums">
                        Piutang {formatRupiahAmount(summary.salur.unpaidNominal)}
                      </span>
                    </>
                  )}
                </div>
                <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                  {formatRupiahAmount(summary.salur.totalNominal)}
                </span>
              </div>

              <div className="py-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>A-AJAR</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                    {summary.ajar.count} keikutsertaan
                  </span>
                </div>
                <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                  {formatRupiahAmount(summary.ajar.totalNominal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Unified Timeline PM, Komplain, Transaksi & WA */}
        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Timeline PM, Komplain &amp; Aktivitas Lintas Modul
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Kronologi pesan menyapa (List PM), komplain pelanggan, transaksi donasi/salur/ajar, dan kontak WhatsApp.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={timelineQuery}
                  onChange={(e) => setTimelineQuery(e.target.value)}
                  placeholder="Cari timeline..."
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e]"
                />
                {timelineQuery && (
                  <button
                    type="button"
                    onClick={() => setTimelineQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowDownUp className="w-3.5 h-3.5 text-slate-400" />
                <span>{sortOrder === 'desc' ? 'Terbaru' : 'Terlama'}</span>
              </button>
            </div>
          </div>

          {/* Segmented Interactive Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {filterTabs.map((tab) => {
              const active = timelineTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTimelineTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer tabular-nums ${
                    active
                      ? 'bg-[#05828e] text-white font-semibold'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              );
            })}
          </div>

          {/* Timeline List */}
          {filteredTimeline.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              Belum ada aktivitas pada kategori ini untuk {identity.namaLengkap}.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[380px] overflow-y-auto pr-1">
              {filteredTimeline.map((entry) => (
                <div
                  key={entry.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-start justify-between gap-2.5"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      {getCategoryIcon(entry.category, entry.moduleLabel)}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {entry.moduleLabel}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span className={getStatusClass(entry.statusTone)}>
                          {entry.statusLabel}
                        </span>
                        {entry.actor && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">·</span>
                            <span className="text-slate-500 dark:text-slate-400">
                              Oleh {entry.actor}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100">
                        {entry.title}
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                        {entry.subtitle}
                      </div>

                      {entry.detail && entry.detail !== entry.subtitle && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-2">
                          {entry.detail}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-1 pl-10 sm:pl-0">
                    <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {entry.displayDate}
                    </span>
                    {entry.amountFormatted && (
                      <span className="text-xs font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
                        {entry.amountFormatted}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
