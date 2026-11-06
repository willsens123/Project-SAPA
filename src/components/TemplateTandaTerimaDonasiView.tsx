import React, { useState, useMemo, useEffect } from 'react';
import {
  FileText,
  Search,
  Plus,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Eye,
  Trash2,
  Edit2,
  ArrowRight,
  ExternalLink,
  ImageIcon,
  MessageSquare,
  Check,
  RotateCcw,
  RefreshCw,
  FolderKanban,
  Receipt,
  X,
} from 'lucide-react';
import { TemplatePMItem, ProjectItem, AppView } from '../types';
import { ItemDonasiEvent, INITIAL_ITEM_DONASI_EVENTS } from '../itemDonasiData';
import { loadTemplatePM } from '../templatePMData';

export interface ProyekTemplateMapping {
  id: string;
  proyekSapa: string;
  itemDonasiName?: string;
  itemDonasiId?: string;
  templatePMId: string | null;
  templatePMName?: string;
  updatedAt?: string;
}

const STORAGE_KEY_MAPPING = 'yppln_proyek_template_pm_mapping';

interface TemplateTandaTerimaDonasiViewProps {
  templatePMList?: TemplatePMItem[];
  projects?: ProjectItem[];
  onNavigateView?: (view: AppView) => void;
  onNavigateToFormTemplatePM?: (initialData?: Partial<TemplatePMItem>) => void;
  onShowToast?: (msg: string) => void;
}

export const TemplateTandaTerimaDonasiView: React.FC<TemplateTandaTerimaDonasiViewProps> = ({
  templatePMList: propTemplatePMList,
  projects = [],
  onNavigateView,
  onNavigateToFormTemplatePM,
  onShowToast = (_msg: string) => {},
}) => {
  // Load templates
  const templatePMList = useMemo(() => {
    if (propTemplatePMList && propTemplatePMList.length > 0) {
      return propTemplatePMList;
    }
    return loadTemplatePM();
  }, [propTemplatePMList]);

  // Load Item D-DONASI events to synchronize
  const [donasiEvents, setDonasiEvents] = useState<ItemDonasiEvent[]>(() => {
    try {
      const saved = localStorage.getItem('yppln_item_donasi_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_ITEM_DONASI_EVENTS;
  });

  // Load / initialize mappings
  const [mappings, setMappings] = useState<ProyekTemplateMapping[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MAPPING);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn(e);
    }

    // Default seed from donasi events & projects
    return [
      {
        id: 'map-1',
        proyekSapa: 'Kathina Dana - MAD',
        itemDonasiName: 'Kathina 2021',
        itemDonasiId: 'item-donasi-1',
        templatePMId: 'tpm-kathina-2021',
        templatePMName: 'Tanda Terima Kathina Dana 2021',
        updatedAt: '17 Sep 2026',
      },
      {
        id: 'map-2',
        proyekSapa: 'Dharma Patron Non-Rutin - FUN',
        itemDonasiName: 'Empat Segel Agung',
        itemDonasiId: 'item-donasi-2',
        templatePMId: 'tpm-dharma-patron',
        templatePMName: 'Tanda Terima Dharma Patron',
        updatedAt: '17 Sep 2026',
      },
      {
        id: 'map-3',
        proyekSapa: 'Event - EVE',
        itemDonasiName: 'Event XXX',
        itemDonasiId: 'item-donasi-3',
        templatePMId: null,
        templatePMName: undefined,
        updatedAt: '17 Sep 2026',
      },
      {
        id: 'map-4',
        proyekSapa: 'Penyaluran Buku & Kegiatan Dharma',
        itemDonasiName: 'Penyaluran Buku Dharma',
        templatePMId: 'tpm-dharma-patron',
        templatePMName: 'Tanda Terima Dharma Patron',
        updatedAt: '17 Sep 2026',
      },
    ];
  });

  // Save mappings to localStorage & sync back to ItemDonasi events
  const saveMappings = (newMappings: ProyekTemplateMapping[]) => {
    setMappings(newMappings);
    try {
      localStorage.setItem(STORAGE_KEY_MAPPING, JSON.stringify(newMappings));
    } catch (e) {
      console.warn(e);
    }

    // Sync to ItemDonasiEvent storage
    try {
      const updatedEvents = donasiEvents.map((evt) => {
        const evtProyek = (evt.proyekSapa || evt.subtitle || '').toLowerCase().trim();
        const found = newMappings.find(
          (m) =>
            m.itemDonasiId === evt.id ||
            m.proyekSapa.toLowerCase().trim() === evtProyek
        );
        if (found) {
          return {
            ...evt,
            tandaTerimaTemplateId: found.templatePMId || undefined,
            tandaTerimaTemplateName: found.templatePMName || undefined,
          };
        }
        return evt;
      });
      setDonasiEvents(updatedEvents);
      localStorage.setItem(
        'yppln_item_donasi_events',
        JSON.stringify(updatedEvents)
      );
    } catch (e) {
      console.warn(e);
    }
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'mapped' | 'unmapped'>('all');

  // Preview Modal state
  const [previewTemplate, setPreviewTemplate] = useState<TemplatePMItem | null>(null);

  // Edit / Add mapping modal state
  const [editingMapping, setEditingMapping] = useState<ProyekTemplateMapping | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalProyekSapa, setModalProyekSapa] = useState('');
  const [modalItemDonasiName, setModalItemDonasiName] = useState('');
  const [modalSelectedTemplateId, setModalSelectedTemplateId] = useState<string>('');

  // Filtered mappings list
  const filteredMappings = useMemo(() => {
    return mappings.filter((m) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          m.proyekSapa.toLowerCase().includes(q) ||
          (m.itemDonasiName && m.itemDonasiName.toLowerCase().includes(q)) ||
          (m.templatePMName && m.templatePMName.toLowerCase().includes(q));
        if (!matches) return false;
      }
      // Status filter
      if (filterStatus === 'mapped') return Boolean(m.templatePMId);
      if (filterStatus === 'unmapped') return !m.templatePMId;
      return true;
    });
  }, [mappings, searchQuery, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = mappings.length;
    const mapped = mappings.filter((m) => m.templatePMId).length;
    const unmapped = total - mapped;
    return { total, mapped, unmapped };
  }, [mappings]);

  // Handle inline template change
  const handleInlineChangeTemplate = (
    mappingId: string,
    newTemplateId: string
  ) => {
    const targetTpl = templatePMList.find((t) => t.id === newTemplateId);
    const updated = mappings.map((m) => {
      if (m.id === mappingId) {
        return {
          ...m,
          templatePMId: newTemplateId ? newTemplateId : null,
          templatePMName: targetTpl ? targetTpl.namaTemplate : undefined,
          updatedAt: 'Baru saja',
        };
      }
      return m;
    });
    saveMappings(updated);

    if (newTemplateId && targetTpl) {
      onShowToast(`Proyek berhasil dihubungkan ke Template: "${targetTpl.namaTemplate}"`);
    } else {
      onShowToast(`Template PM berhasil dilepas dari proyek.`);
    }
  };

  // Open modal to add or edit
  const handleOpenAddModal = () => {
    setEditingMapping(null);
    setModalProyekSapa('');
    setModalItemDonasiName('');
    setModalSelectedTemplateId('');
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (m: ProyekTemplateMapping) => {
    setEditingMapping(m);
    setModalProyekSapa(m.proyekSapa);
    setModalItemDonasiName(m.itemDonasiName || '');
    setModalSelectedTemplateId(m.templatePMId || '');
    setIsEditModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalProyekSapa.trim()) {
      onShowToast('Nama Proyek SAPA wajib diisi');
      return;
    }

    const tpl = templatePMList.find((t) => t.id === modalSelectedTemplateId);

    if (editingMapping) {
      // Update
      const updated = mappings.map((m) => {
        if (m.id === editingMapping.id) {
          return {
            ...m,
            proyekSapa: modalProyekSapa.trim(),
            itemDonasiName: modalItemDonasiName.trim() || undefined,
            templatePMId: modalSelectedTemplateId || null,
            templatePMName: tpl ? tpl.namaTemplate : undefined,
            updatedAt: 'Baru saja',
          };
        }
        return m;
      });
      saveMappings(updated);
      onShowToast('Pengaturan Template Tanda Terima berhasil diperbarui');
    } else {
      // Create new
      const newMap: ProyekTemplateMapping = {
        id: `map-${Date.now()}`,
        proyekSapa: modalProyekSapa.trim(),
        itemDonasiName: modalItemDonasiName.trim() || undefined,
        templatePMId: modalSelectedTemplateId || null,
        templatePMName: tpl ? tpl.namaTemplate : undefined,
        updatedAt: 'Baru saja',
      };
      saveMappings([newMap, ...mappings]);
      onShowToast('Pemetaan Proyek SAPA baru berhasil ditambahkan');
    }

    setIsEditModalOpen(false);
  };

  const handleDeleteMapping = (id: string, name: string) => {
    const updated = mappings.filter((m) => m.id !== id);
    saveMappings(updated);
    onShowToast(`Pemetaan "${name}" berhasil dihapus`);
  };

  // Sample values for receipt preview
  const sampleValues: Record<string, string> = {
    '[Nama Lengkap]': 'Enni Megawati',
    '[Jumlah]': 'Rp100.777',
    '[Tanggal Terima]': '10 Januari 2025',
    '[Bulan Donasi]': 'Januari 2025',
    '[No Resi]': 'SAPA-DPR-2025-081',
    '[Proyek]': 'Kathina Dana - MAD',
    '[Kegiatan]': 'Kathina 2021',
    '[Admin]': 'Admin SAPA',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#008d91] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                Template Tanda Terima D-DONASI
              </h1>
              <span className="text-xs font-semibold bg-teal-50 text-[#008d91] border border-teal-200/80 px-2.5 py-0.5 rounded-full">
                Pemetaan Proyek SAPA & Template PM
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Atur dan pasangkan setiap <strong className="text-slate-700">Proyek SAPA</strong> dengan{' '}
              <strong className="text-slate-700">Template PM</strong> yang sesuai untuk penerbitan e-Tanda Terima otomatis saat donasi tercatat.
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {onNavigateView && (
            <button
              type="button"
              onClick={() => onNavigateView('itemDonasi')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Buka Item D-DONASI</span>
            </button>
          )}

          {onNavigateToFormTemplatePM && (
            <button
              type="button"
              onClick={() =>
                onNavigateToFormTemplatePM({
                  namaTemplate: 'Tanda Terima Donasi Baru',
                  subTitle: 'Template',
                  hasImage: true,
                })
              }
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#008d91] hover:bg-teal-50 border border-teal-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>+ Buat Template PM</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#008d91] hover:bg-[#05828e] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Pemetaan</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Proyek Terdaftar</div>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{stats.total}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Sudah Memiliki Template PM</div>
            <div className="text-xl font-bold text-emerald-600 mt-0.5">{stats.mapped}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Belum Diatur (Pending)</div>
            <div className="text-xl font-bold text-amber-600 mt-0.5">{stats.unmapped}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari Proyek SAPA atau Template PM..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-200 focus:outline-hidden focus:border-[#008d91] focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto self-end sm:self-auto justify-center">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-white text-[#008d91] shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({mappings.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('mapped')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'mapped'
                ? 'bg-white text-emerald-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Terhubung ({stats.mapped})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('unmapped')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterStatus === 'unmapped'
                ? 'bg-white text-amber-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Belum Diatur ({stats.unmapped})
          </button>
        </div>
      </div>

      {/* Main Table / Grid of Mappings */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Proyek SAPA</th>
                <th className="py-3.5 px-5">Item D-DONASI Terkait</th>
                <th className="py-3.5 px-5">Template PM (Tanda Terima)</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredMappings.map((row) => {
                const currentTemplate = templatePMList.find(
                  (t) => t.id === row.templatePMId
                );

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Proyek SAPA */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#008d91] font-bold flex items-center justify-center shrink-0 border border-teal-100">
                          <FolderKanban className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">
                            {row.proyekSapa}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Terakhir diupdate: {row.updatedAt || '-'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Item D-DONASI */}
                    <td className="py-4 px-5">
                      {row.itemDonasiName ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/60">
                          {row.itemDonasiName}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">
                          Semua item proyek
                        </span>
                      )}
                    </td>

                    {/* Template PM Mapping Selector */}
                    <td className="py-4 px-5">
                      <div className="space-y-2 max-w-sm">
                        <select
                          value={row.templatePMId || ''}
                          onChange={(e) =>
                            handleInlineChangeTemplate(row.id, e.target.value)
                          }
                          className={`w-full py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors outline-hidden cursor-pointer ${
                            row.templatePMId
                              ? 'bg-[#f0f9f9] border-teal-300 text-slate-800 font-semibold'
                              : 'bg-slate-50 border-slate-300 text-slate-500'
                          }`}
                        >
                          <option value="">-- Pilih / Pasangkan Template PM --</option>
                          {templatePMList.map((tpl) => (
                            <option key={tpl.id} value={tpl.id}>
                              {tpl.namaTemplate} (Proyek: {tpl.proyekSapa || '-'})
                            </option>
                          ))}
                        </select>

                        {/* Details chip of chosen template */}
                        {currentTemplate && (
                          <div className="flex items-center gap-2 flex-wrap text-[11px]">
                            {currentTemplate.hasImage && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
                                <ImageIcon className="w-2.5 h-2.5" />
                                Format Bergambar
                              </span>
                            )}
                            {currentTemplate.imageOverlayFields &&
                              currentTemplate.imageOverlayFields.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  {currentTemplate.imageOverlayFields.length} Field
                                </span>
                              )}
                            <button
                              type="button"
                              onClick={() => setPreviewTemplate(currentTemplate)}
                              className="text-[#008d91] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Pratinjau</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-5 text-center">
                      {row.templatePMId ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Terhubung
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Belum Diatur
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(row)}
                          title="Edit Pemetaan"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteMapping(row.id, row.proyekSapa)
                          }
                          title="Hapus Pemetaan"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredMappings.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <FolderKanban className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    Tidak ada pemetaan proyek yang sesuai kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah / Edit Pemetaan */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-[#008d91]" />
                <h3 className="font-bold text-slate-800 text-base">
                  {editingMapping ? 'Edit Pemetaan Tanda Terima' : 'Tambah Pemetaan Proyek SAPA'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nama Proyek SAPA <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={modalProyekSapa}
                  onChange={(e) => setModalProyekSapa(e.target.value)}
                  placeholder="Contoh: Kathina Dana - MAD, Penyaluran Buku..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] outline-hidden text-sm"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Nama Proyek SAPA yang terhubung pada sistem D-DONASI.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Item D-DONASI Terkait (Opsional)
                </label>
                <input
                  type="text"
                  value={modalItemDonasiName}
                  onChange={(e) => setModalItemDonasiName(e.target.value)}
                  placeholder="Contoh: Kathina 2021, Empat Segel Agung..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] outline-hidden text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pilih Template PM sebagai Tanda Terima
                </label>
                <select
                  value={modalSelectedTemplateId}
                  onChange={(e) => setModalSelectedTemplateId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] outline-hidden text-sm cursor-pointer"
                >
                  <option value="">-- Pilih Template PM --</option>
                  {templatePMList.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.namaTemplate} (Proyek: {tpl.proyekSapa || '-'})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Template PM ini akan otomatis digunakan saat mencetak e-Tanda Terima untuk proyek ini.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#008d91] hover:bg-[#05828e] shadow-xs cursor-pointer"
                >
                  Simpan Pemetaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Pratinjau Visual Tanda Terima */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Eye className="w-5 h-5 text-[#008d91]" />
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                    Pratinjau e-Tanda Terima
                  </h3>
                  <p className="text-xs text-slate-500">{previewTemplate.namaTemplate}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              {previewTemplate.hasImage && previewTemplate.imageUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-w-md mx-auto shadow-sm">
                  <img
                    src={previewTemplate.imageUrl}
                    alt={previewTemplate.namaTemplate}
                    className="w-full h-auto block"
                  />
                  {previewTemplate.imageOverlayFields &&
                    previewTemplate.imageOverlayFields.map((field) => {
                      const displayVal =
                        sampleValues[field.tag] || field.value || field.label;
                      return (
                        <div
                          key={field.id}
                          style={{
                            position: 'absolute',
                            left: `${field.xPercent}%`,
                            top: `${field.yPercent}%`,
                            transform:
                              field.align === 'center'
                                ? 'translate(-50%, -50%)'
                                : field.align === 'right'
                                ? 'translate(-100%, -50%)'
                                : 'translate(0%, -50%)',
                            color: field.color || '#e53935',
                            fontSize: `clamp(9px, 2.2vw, ${field.fontSize || 14}px)`,
                            fontFamily:
                              field.fontFamily === 'cursive'
                                ? "'Dancing Script', 'Brush Script MT', cursive"
                                : field.fontFamily === 'serif'
                                ? 'Georgia, serif'
                                : 'sans-serif',
                            fontWeight: field.fontWeight || 'bold',
                            textAlign: field.align || 'center',
                            textShadow:
                              '0px 1px 2px rgba(255,255,255,0.85), 0px 0px 4px rgba(255,255,255,0.9)',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                          }}
                        >
                          {displayVal}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">
                    Template PM Berformat Pesan WhatsApp
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Template ini tidak memiliki lampiran e-tanda terima bergambar dan mengirimkan konfirmasi tanda terima via teks.
                  </p>
                </div>
              )}

              {/* Message Draft */}
              <div className="bg-[#eef8f5] rounded-2xl p-4 border border-[#c4e5dc]">
                <div className="text-xs font-bold text-emerald-800 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Draf Pesan WhatsApp:</span>
                </div>
                <pre className="text-xs text-slate-700 font-sans whitespace-pre-wrap leading-relaxed bg-white/80 p-3 rounded-xl border border-emerald-100">
                  {previewTemplate.isiPesan}
                </pre>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#008d91] hover:bg-[#05828e] cursor-pointer"
              >
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
