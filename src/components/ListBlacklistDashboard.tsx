import React, { useMemo, useState } from 'react';
import {
  Search,
  X,
  MessageCircle,
  Edit2,
  RotateCcw,
  ArrowUpDown,
  ShieldAlert,
  Users,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { DonasiOrder } from '../donasiData';
import { IdentitasItem } from '../identitasData';
import { SalurOrder } from '../salurData';
import {
  DharmaPatronRutinItem,
  ListPMItem,
  OrganisasiItem,
  WhatsappDispatchLog,
} from '../types';
import {
  ResolvedLastContactedSummary,
  resolveLastContactedForIdentitas,
  resolveLastContactedForOrganisasi,
} from '../utils/lastContactedHelper';
import {
  CustomerDirectTargetInput,
  ModalKirimWhatsappOtomatis,
} from './ModalKirimWhatsappOtomatis';
import { ModalRiwayatKontakCustomer } from './ModalRiwayatKontakCustomer';

interface BlacklistUnifiedEntry {
  key: string;
  entityType: 'identitas' | 'organisasi';
  id: string;
  codeId?: string;
  nama: string;
  subtitle: string;
  avatarInitial: string;
  avatarBg: string;
  phone: string;
  lokasiOrOrg: string;
  pic: string;
  catatan: string;
  summary: ResolvedLastContactedSummary;
  identitasItem?: IdentitasItem;
  organisasiItem?: OrganisasiItem;
}

interface ListBlacklistDashboardProps {
  identitasList: IdentitasItem[];
  organisasiList: OrganisasiItem[];
  listPMList?: ListPMItem[];
  donasiOrders?: DonasiOrder[];
  salurOrders?: SalurOrder[];
  dharmaPatronList?: DharmaPatronRutinItem[];
  currentActorName?: string;
  onContactDispatchCompleted?: (payload: {
    logEntry: WhatsappDispatchLog;
    listPMItem: ListPMItem | null;
    identitasId?: string;
    organisasiId?: string;
    codeId?: string;
  }) => void;
  onRestoreStatus?: (entityType: 'identitas' | 'organisasi', id: string) => void;
  onEditIdentitas?: (item: IdentitasItem) => void;
  onEditOrganisasi?: (item: OrganisasiItem) => void;
  onNavigateToIdentitas?: () => void;
  onNavigateToOrganisasi?: () => void;
  onShowToast?: (msg: string) => void;
}

export const ListBlacklistDashboard: React.FC<ListBlacklistDashboardProps> = ({
  identitasList,
  organisasiList,
  listPMList = [],
  donasiOrders = [],
  salurOrders = [],
  dharmaPatronList = [],
  currentActorName = 'Admin YPPLN',
  onContactDispatchCompleted,
  onRestoreStatus,
  onEditIdentitas,
  onEditOrganisasi,
  onNavigateToIdentitas,
  onNavigateToOrganisasi,
  onShowToast = () => {},
}) => {
  const [typeFilter, setTypeFilter] = useState<'all' | 'identitas' | 'organisasi'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastContactedSort, setLastContactedSort] = useState<'none' | 'desc' | 'asc'>('none');
  const [waTargetEntry, setWaTargetEntry] = useState<BlacklistUnifiedEntry | null>(null);
  const [historyTargetEntry, setHistoryTargetEntry] = useState<BlacklistUnifiedEntry | null>(null);
  const [confirmRestoreEntry, setConfirmRestoreEntry] = useState<BlacklistUnifiedEntry | null>(null);

  const blacklistEntries = useMemo<BlacklistUnifiedEntry[]>(() => {
    const sources = {
      listPMList,
      donasiOrders,
      salurOrders,
      dharmaPatronList,
    };

    const identEntries: BlacklistUnifiedEntry[] = identitasList
      .filter((it) => (it.status || '').trim().toLowerCase() === 'blacklist')
      .map((it) => {
        const summary = resolveLastContactedForIdentitas(it, sources);
        const bestPhone =
          (it.nomorHandPhone && it.nomorHandPhone !== '-' ? it.nomorHandPhone : '') ||
          it.alamatList?.find((a) => a.nomorHp && a.nomorHp !== '-')?.nomorHp ||
          summary.phone ||
          '-';
        const addrCity = it.alamatList?.find((a) => a.kota && a.kota !== '-')?.kota;
        return {
          key: `identitas-${it.id}`,
          entityType: 'identitas',
          id: it.id,
          codeId: it.codeId,
          nama: it.namaLengkap,
          subtitle:
            it.namaPanggilan && it.namaPanggilan !== '-'
              ? `${it.namaPanggilan} · ${it.bhanteLay || 'Lay'}`
              : it.bhanteLay || 'Identitas',
          avatarInitial: it.avatarInitial || it.namaLengkap.charAt(0).toUpperCase(),
          avatarBg: it.avatarBg || 'bg-rose-600',
          phone: bestPhone,
          lokasiOrOrg:
            [it.organisasi !== '-' ? it.organisasi : '', addrCity].filter(Boolean).join(' · ') ||
            '-',
          pic: it.pic || '-',
          catatan: it.lastContactedNote || it.custDuration || '-',
          summary,
          identitasItem: it,
        };
      });

    const orgEntries: BlacklistUnifiedEntry[] = organisasiList
      .filter((org) => (org.status || '').trim().toLowerCase() === 'blacklist')
      .map((org) => {
        const summary = resolveLastContactedForOrganisasi(org, identitasList, sources);
        const bestPhone =
          (org.hp && org.hp !== '-' ? org.hp : '') ||
          (org.picOrgHp && org.picOrgHp !== '-' ? org.picOrgHp : '') ||
          summary.phone ||
          '-';
        const locParts = [org.kota, org.provinsi].filter((x) => x && x !== '-');
        return {
          key: `organisasi-${org.id}`,
          entityType: 'organisasi',
          id: org.id,
          codeId: org.picOrgCode,
          nama: org.namaOrg,
          subtitle: `${org.jenisOrg}${org.picOrgNama ? ` · PIC: ${org.picOrgNama}` : ''}`,
          avatarInitial: org.avatarInitial || org.namaOrg.charAt(0).toUpperCase(),
          avatarBg: org.avatarBg || 'bg-slate-600',
          phone: bestPhone,
          lokasiOrOrg: locParts.length > 0 ? locParts.join(', ') : org.subOrg || '-',
          pic: org.picYppln || org.pic || '-',
          catatan: org.catatan || org.lastContactedNote || '-',
          summary,
          organisasiItem: org,
        };
      });

    return [...identEntries, ...orgEntries];
  }, [identitasList, organisasiList, listPMList, donasiOrders, salurOrders, dharmaPatronList]);

  const identitasBlacklistCount = useMemo(
    () => blacklistEntries.filter((e) => e.entityType === 'identitas').length,
    [blacklistEntries]
  );
  const organisasiBlacklistCount = useMemo(
    () => blacklistEntries.filter((e) => e.entityType === 'organisasi').length,
    [blacklistEntries]
  );
  const pernahDikontakCount = useMemo(
    () => blacklistEntries.filter((e) => e.summary.hasContactHistory).length,
    [blacklistEntries]
  );

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const base = blacklistEntries.filter((entry) => {
      if (typeFilter !== 'all' && entry.entityType !== typeFilter) return false;
      if (!q) return true;
      return (
        entry.nama.toLowerCase().includes(q) ||
        (entry.codeId && entry.codeId.toLowerCase().includes(q)) ||
        entry.subtitle.toLowerCase().includes(q) ||
        entry.phone.toLowerCase().includes(q) ||
        entry.lokasiOrOrg.toLowerCase().includes(q) ||
        entry.pic.toLowerCase().includes(q) ||
        entry.catatan.toLowerCase().includes(q)
      );
    });

    if (lastContactedSort === 'none') return base;
    return [...base].sort((a, b) => {
      const tsA = a.summary.latestTimestampMs || 0;
      const tsB = b.summary.latestTimestampMs || 0;
      return lastContactedSort === 'desc' ? tsB - tsA : tsA - tsB;
    });
  }, [blacklistEntries, typeFilter, searchQuery, lastContactedSort]);

  const buildWaTarget = (entry: BlacklistUnifiedEntry): CustomerDirectTargetInput => {
    return {
      identitasId: entry.identitasItem?.id || entry.organisasiItem?.picOrgId,
      organisasiId: entry.organisasiItem?.id,
      codeId: entry.codeId,
      nama: entry.nama,
      panggilan:
        entry.identitasItem?.namaPanggilan && entry.identitasItem.namaPanggilan !== '-'
          ? entry.identitasItem.namaPanggilan
          : entry.subtitle,
      phone: entry.phone !== '-' ? entry.phone : '',
      status: 'Blacklist',
      lastContactedDisplay: entry.summary.hasContactHistory ? entry.summary.displayDate : undefined,
      existingHistory:
        entry.identitasItem?.whatsappContactHistory ||
        entry.organisasiItem?.whatsappContactHistory ||
        [],
    };
  };

  return (
    <div className="w-full space-y-5">
      {/* Top Warning Context + Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total List Blacklist
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-700 dark:text-rose-400 tabular-nums">
              {blacklistEntries.length}
            </span>
            <span className="text-xs text-slate-500">Individu & Organisasi</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Blacklist Identitas
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {identitasBlacklistCount}
            </span>
            <span className="text-xs text-slate-500">Data perorangan</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Blacklist Organisasi
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
              {organisasiBlacklistCount}
            </span>
            <span className="text-xs text-slate-500">Lembaga & mitra</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Memiliki Riwayat Kontak
          </div>
          <div className="mt-1.5 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-[#05828e] dark:text-teal-400 tabular-nums">
              {pernahDikontakCount}
            </span>
            <span className="text-xs text-slate-500">Tercatat lintas modul</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700"
          role="tablist"
          aria-label="Filter tipe daftar blacklist"
        >
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
              typeFilter === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Semua ({blacklistEntries.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('identitas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
              typeFilter === 'identitas'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Identitas ({identitasBlacklistCount})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('organisasi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
              typeFilter === 'organisasi'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Organisasi ({organisasiBlacklistCount})
          </button>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap ml-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, ID, nomor HP, lokasi..."
              className="pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 w-64 sm:w-72 focus:outline-none focus:ring-2 focus:ring-[#05828e]/30 focus:border-[#05828e]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        {filteredEntries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-900">
                  <th className="py-3.5 px-4 w-[110px]">Tipe</th>
                  <th className="py-3.5 px-4 w-[280px]">Nama & ID</th>
                  <th className="py-3.5 px-4">HP</th>
                  <th className="py-3.5 px-4">Organisasi / Lokasi</th>
                  <th className="py-3.5 px-4">PIC YPPLN</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() =>
                        setLastContactedSort((prev) =>
                          prev === 'none' ? 'desc' : prev === 'desc' ? 'asc' : 'none'
                        )
                      }
                      className="inline-flex items-center gap-1 hover:text-[#05828e] transition-colors cursor-pointer"
                      title="Urutkan berdasarkan kontak terakhir"
                    >
                      <span>Last Contacted?</span>
                      <ArrowUpDown
                        className={`w-3.5 h-3.5 ${
                          lastContactedSort !== 'none' ? 'text-[#05828e]' : 'text-slate-400'
                        }`}
                      />
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[13px] text-slate-700 dark:text-slate-200">
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.key}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Tipe */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                        {entry.entityType === 'identitas' ? 'Identitas' : 'Organisasi'}
                      </span>
                    </td>

                    {/* Nama & ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full ${entry.avatarBg} text-white flex items-center justify-center font-bold text-sm shrink-0`}
                        >
                          {entry.avatarInitial}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-slate-100 leading-snug">
                            {entry.codeId ? `${entry.codeId} · ` : ''}
                            {entry.nama}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {entry.subtitle}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* HP */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300">
                      {entry.phone}
                    </td>

                    {/* Organisasi / Lokasi */}
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {entry.lokasiOrOrg}
                    </td>

                    {/* PIC */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs font-medium text-slate-700 dark:text-slate-300">
                      {entry.pic}
                    </td>

                    {/* Last Contacted? */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setHistoryTargetEntry(entry)}
                        className="text-left group/lc cursor-pointer rounded-lg px-2 py-1 -mx-2 hover:bg-teal-50/70 dark:hover:bg-teal-950/30 transition-colors"
                        title="Klik untuk melihat timeline kontak & kirim WhatsApp"
                      >
                        <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100 group-hover/lc:text-[#05828e] tabular-nums leading-tight">
                          {entry.summary.displayDate}
                        </div>
                        <div className="text-[11px] leading-tight mt-0.5 text-slate-500 dark:text-slate-400">
                          {entry.summary.hasContactHistory ? (
                            <>
                              {entry.summary.relativeLabel && (
                                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                  {entry.summary.relativeLabel}
                                  {' · '}
                                </span>
                              )}
                              <span>{entry.summary.channelLabel}</span>
                            </>
                          ) : (
                            <span className="text-slate-400">Belum dikontak</span>
                          )}
                        </div>
                      </button>
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setWaTargetEntry(entry)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#05828e] hover:bg-teal-50 dark:hover:bg-teal-950/40 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Kirim WhatsApp (dengan peringatan status Blacklist)"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WA</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (entry.entityType === 'identitas' && entry.identitasItem) {
                              onEditIdentitas?.(entry.identitasItem);
                            } else if (entry.entityType === 'organisasi' && entry.organisasiItem) {
                              onEditOrganisasi?.(entry.organisasiItem);
                            }
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Buka profil / ubah status"
                          aria-label={`Edit ${entry.nama}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {onRestoreStatus && (
                          <button
                            type="button"
                            onClick={() => setConfirmRestoreEntry(entry)}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                            title="Pulihkan status dari Blacklist menjadi normal (-)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Pulihkan</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-14 px-6 text-center space-y-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {blacklistEntries.length === 0
                ? 'Belum ada data Identitas maupun Organisasi dengan status Blacklist'
                : 'Tidak ada data Blacklist yang cocok dengan filter atau pencarian'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              {blacklistEntries.length === 0
                ? 'Setiap data Identitas atau Organisasi yang statusnya diubah menjadi Blacklist akan otomatis terkumpul di halaman ini beserta riwayat Last Contacted.'
                : 'Coba reset filter tipe atau gunakan kata kunci pencarian lain.'}
            </p>
            {blacklistEntries.length === 0 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                {onNavigateToIdentitas && (
                  <button
                    type="button"
                    onClick={onNavigateToIdentitas}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Users className="w-3.5 h-3.5 text-[#05828e]" />
                    <span>Buka Identitas</span>
                  </button>
                )}
                {onNavigateToOrganisasi && (
                  <button
                    type="button"
                    onClick={onNavigateToOrganisasi}
                    className="px-3.5 py-2 rounded-xl bg-[#05828e] hover:bg-[#046c76] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Buka Organisasi</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirm Restore Status Modal */}
      {confirmRestoreEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Pulihkan Status dari Blacklist?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Status{' '}
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {confirmRestoreEntry.nama}
                  </span>{' '}
                  ({confirmRestoreEntry.entityType === 'identitas' ? 'Identitas' : 'Organisasi'})
                  akan dikembalikan ke status normal (<span className="font-mono">-</span>) dan
                  dikeluarkan dari daftar Blacklist.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmRestoreEntry(null)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = confirmRestoreEntry;
                  setConfirmRestoreEntry(null);
                  onRestoreStatus?.(target.entityType, target.id);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#05828e] hover:bg-[#046c76] text-white text-xs font-semibold cursor-pointer"
              >
                Ya, Pulihkan Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Timeline Kontak Cross-Module */}
      {historyTargetEntry && (
        <ModalRiwayatKontakCustomer
          isOpen={!!historyTargetEntry}
          onClose={() => setHistoryTargetEntry(null)}
          customerName={historyTargetEntry.nama}
          customerPanggilan={historyTargetEntry.subtitle}
          customerCode={historyTargetEntry.codeId}
          customerStatus="Blacklist"
          phone={historyTargetEntry.phone}
          avatarInitial={historyTargetEntry.avatarInitial}
          avatarBg={historyTargetEntry.avatarBg}
          summary={historyTargetEntry.summary}
          onSendWhatsappNow={() => setWaTargetEntry(historyTargetEntry)}
        />
      )}

      {/* Modal Kirim WhatsApp */}
      <ModalKirimWhatsappOtomatis
        isOpen={!!waTargetEntry}
        onClose={() => setWaTargetEntry(null)}
        kind="customer_direct"
        identitasItem={waTargetEntry?.identitasItem || null}
        customerTarget={waTargetEntry ? buildWaTarget(waTargetEntry) : null}
        identitasList={identitasList}
        organisasiList={organisasiList}
        currentActorName={currentActorName}
        onDispatchCompleted={(payload) => {
          onContactDispatchCompleted?.({
            logEntry: payload.logEntry,
            listPMItem: payload.listPMItem,
            identitasId: payload.identitasId || waTargetEntry?.identitasItem?.id,
            organisasiId: payload.organisasiId || waTargetEntry?.organisasiItem?.id,
            codeId: payload.codeId || waTargetEntry?.codeId,
          });
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
