import React, { useState, useMemo } from 'react';
import {
  Kanban,
  Search,
  Plus,
  Table,
  Phone,
  CheckCircle,
  Clock,
  ChevronRight,
  Calendar,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { ListPMItem } from '../types';
import { IdentitasItem } from '../identitasData';
import { SalurOrder } from '../salurData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { DonasiOrder } from '../donasiData';

interface PipelineListPMViewProps {
  items: ListPMItem[];
  identitasList?: IdentitasItem[];
  salurOrders?: SalurOrder[];
  transaksiAjarList?: TransaksiAjarItem[];
  donasiOrders?: DonasiOrder[];
  onSaveItem: (item: ListPMItem) => void;
  onDeleteItem: (id: string) => void;
  onShowToast?: (msg: string) => void;
  onAddNew?: () => void;
  onNavigateToTableView?: () => void;
  onNavigateToAutoInputSalur?: () => void;
  onNavigateToFormPMWithProject?: (project: ListPMItem) => void;
}

interface PipelineColumn {
  id: string;
  title: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  icon: React.ElementType;
}

const COLUMNS: PipelineColumn[] = [
  {
    id: 'belum',
    title: 'Belum Dihubungi',
    color: 'border-amber-300',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    icon: Clock,
  },
  {
    id: 'sudah_dihubungi',
    title: 'Sudah Dihubungi',
    color: 'border-blue-300',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    icon: Phone,
  },
  {
    id: 'sudah',
    title: 'Sudah Salur / Selesai',
    color: 'border-teal-300',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-[#008d91]',
    icon: CheckCircle,
  },
];

export const PipelineListPMView: React.FC<PipelineListPMViewProps> = ({
  items,
  onSaveItem,
  onShowToast,
  onAddNew,
  onNavigateToTableView,
  onNavigateToAutoInputSalur,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProyekFilter, setSelectedProyekFilter] = useState('ALL');

  // Filter items by search and proyek
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedProyekFilter !== 'ALL' && item.proyekSapa !== selectedProyekFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const targetName = (item.singleTarget?.nama || item.targetSourceName || item.itemTitle || '').toLowerCase();
        const matchProyek = (item.proyekSapa || '').toLowerCase();
        const matchPhone = (item.singleTarget?.nomorHp || item.targetPhone || '').toLowerCase();
        if (!targetName.includes(q) && !matchProyek.includes(q) && !matchPhone.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [items, searchQuery, selectedProyekFilter]);

  // Unique Proyek list for filtering
  const proyekList = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.proyekSapa) set.add(i.proyekSapa);
    });
    return Array.from(set);
  }, [items]);

  // Move item to next pipeline stage
  const handleAdvanceStage = (item: ListPMItem, nextStatus: 'belum' | 'sudah_dihubungi' | 'sudah') => {
    const updated: ListPMItem = {
      ...item,
      statusBisaPM: nextStatus,
    };
    onSaveItem(updated);
    const label = item.singleTarget?.nama || item.targetSourceName || item.proyekSapa;
    onShowToast?.(`Status "${label}" dipindahkan ke "${nextStatus.replace('_', ' ')}"`);
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#008d91] flex items-center justify-center">
              <Kanban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-800">Pipeline List PM</h1>
              <p className="text-xs text-slate-500">Tahapan Alur, Hubungi & Penyaluran Penerima Manfaat</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {onNavigateToTableView && (
            <button
              type="button"
              onClick={onNavigateToTableView}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Table className="w-4 h-4 text-slate-500" />
              <span>Tabel List PM</span>
            </button>
          )}

          {onNavigateToAutoInputSalur && (
            <button
              type="button"
              onClick={onNavigateToAutoInputSalur}
              className="px-3.5 py-2 text-xs font-semibold text-[#008d91] bg-teal-50 hover:bg-teal-100 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Auto Input Salur</span>
            </button>
          )}

          {onAddNew && (
            <button
              type="button"
              onClick={onAddNew}
              className="px-4 py-2 text-xs font-bold text-white bg-[#008d91] hover:bg-[#007b7e] rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah PM</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3.5 shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari penerima manfaat, proyek, nomor hp..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#008d91] focus:border-[#008d91]"
          />
        </div>

        {/* Proyek Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedProyekFilter}
            onChange={(e) => setSelectedProyekFilter(e.target.value)}
            className="w-full sm:w-56 px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#008d91]"
          >
            <option value="ALL">Semua Proyek SAPA</option>
            {proyekList.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const colItems = filteredItems.filter((i) => {
            const st = (i.statusBisaPM || 'belum').toLowerCase();
            if (col.id === 'belum') return st === 'belum';
            if (col.id === 'sudah_dihubungi') return st === 'sudah_dihubungi';
            if (col.id === 'sudah') return st === 'sudah';
            return false;
          });

          const IconComp = col.icon;

          return (
            <div
              key={col.id}
              className={`bg-slate-50/70 border-t-4 ${col.color} border border-slate-200/80 rounded-2xl p-3.5 flex flex-col min-h-[500px] shadow-2xs`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <IconComp className="w-4 h-4 text-slate-600" />
                  <h3 className="font-bold text-slate-800 text-sm">{col.title}</h3>
                </div>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${col.badgeBg} ${col.badgeText}`}>
                  {colItems.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
                {colItems.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Tidak ada data pada tahapan ini.
                  </div>
                ) : (
                  colItems.map((item) => {
                    const targetName =
                      item.singleTarget?.nama ||
                      item.targetSourceName ||
                      (item.targetType === 'multiple' ? `${item.targetCount || item.recipients?.length || 0} Penerima Manfaat` : 'Penerima Manfaat');
                    const targetPhone = item.singleTarget?.nomorHp || item.targetPhone;

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200/90 hover:shadow-md hover:border-[#008d91]/50 transition-all space-y-2.5"
                      >
                        {/* Title & Proyek */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm leading-tight">
                              {targetName}
                            </h4>
                            {item.proyekKode && (
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                                {item.proyekKode}
                              </span>
                            )}
                          </div>
                          {item.deadline && (
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                              {item.deadline}
                            </span>
                          )}
                        </div>

                        {/* Proyek SAPA */}
                        {item.proyekSapa && (
                          <div className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 flex items-center gap-1.5 truncate">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{item.proyekSapa}</span>
                          </div>
                        )}

                        {/* Info Details */}
                        <div className="space-y-1 text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          {targetPhone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{targetPhone}</span>
                            </div>
                          )}
                          {item.tanggalMulaiPM && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>Mulai: {item.tanggalMulaiPM}</span>
                            </div>
                          )}
                        </div>

                        {/* Move Stage Buttons */}
                        <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-100 text-xs">
                          {col.id === 'belum' && (
                            <button
                              type="button"
                              onClick={() => handleAdvanceStage(item, 'sudah_dihubungi')}
                              className="w-full py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg text-center flex items-center justify-center gap-1 transition-colors"
                            >
                              <span>Ke Sudah Dihubungi</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {col.id === 'sudah_dihubungi' && (
                            <div className="w-full flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleAdvanceStage(item, 'belum')}
                                className="py-1 px-2 text-slate-500 hover:bg-slate-100 rounded-lg text-[11px]"
                              >
                                Kembali
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAdvanceStage(item, 'sudah')}
                                className="flex-1 py-1.5 px-2 bg-teal-50 hover:bg-teal-100 text-[#008d91] font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors text-[11px]"
                              >
                                <span>Ke Sudah Salur</span>
                                <CheckCircle className="w-3 h-3" />
                              </button>
                            </div>
                          )}

                          {col.id === 'sudah' && (
                            <button
                              type="button"
                              onClick={() => handleAdvanceStage(item, 'sudah_dihubungi')}
                              className="text-slate-400 hover:text-slate-600 text-[11px] py-1"
                            >
                              Ubah ke Sudah Dihubungi
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
