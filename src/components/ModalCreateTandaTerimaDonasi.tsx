import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
  Plus,
  ImageIcon,
  MessageSquare,
  Eye,
  Check,
  RotateCcw,
} from 'lucide-react';
import { ItemDonasiEvent, ItemDonasiChild } from '../itemDonasiData';
import { TemplatePMItem, ImageOverlayField } from '../types';

interface ModalCreateTandaTerimaDonasiProps {
  isOpen: boolean;
  onClose: () => void;
  item: ItemDonasiEvent | null;
  childItem?: ItemDonasiChild | null;
  templatePMList: TemplatePMItem[];
  onSaveTandaTerima: (
    itemId: string,
    templateId: string | null,
    templateName?: string
  ) => void;
  onNavigateToFormTemplatePM?: (initialData?: Partial<TemplatePMItem>) => void;
  onShowToast?: (msg: string) => void;
}

export const ModalCreateTandaTerimaDonasi: React.FC<ModalCreateTandaTerimaDonasiProps> = ({
  isOpen,
  onClose,
  item,
  childItem,
  templatePMList,
  onSaveTandaTerima,
  onNavigateToFormTemplatePM,
  onShowToast = (_msg: string) => {},
}) => {
  // Determine Proyek SAPA of the item
  const itemProyekSapa = (item?.proyekSapa || item?.subtitle || '').trim();

  // Selected template state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    item?.tandaTerimaTemplateId || null
  );

  // Filter mode: 'proyek' (only same Proyek SAPA) or 'all' (all templates)
  const [filterMode, setFilterMode] = useState<'proyek' | 'all'>('proyek');

  // Search query within the templates list
  const [searchQuery, setSearchQuery] = useState('');

  // Active tab in the preview panel
  const [previewTab, setPreviewTab] = useState<'receipt' | 'message'>('receipt');

  // Reset or sync state when item changes or modal opens
  useEffect(() => {
    setSelectedTemplateId(item?.tandaTerimaTemplateId || null);
    setFilterMode('proyek');
    setSearchQuery('');
  }, [item?.id, isOpen]);

  // Match logic: Templates with same Proyek SAPA
  const sameProyekTemplates = useMemo(() => {
    if (!itemProyekSapa) return [];
    const itemNorm = itemProyekSapa.toLowerCase().replace(/\s+/g, ' ');
    const itemName = item?.name || '';
    return templatePMList.filter((t) => {
      const tNorm = (t.proyekSapa || '').toLowerCase().replace(/\s+/g, ' ');
      if (!tNorm) return false;
      return (
        tNorm === itemNorm ||
        tNorm.includes(itemNorm) ||
        itemNorm.includes(tNorm) ||
        (t.kegiatan && itemName && t.kegiatan.toLowerCase().includes(itemName.toLowerCase())) ||
        (t.itemTerkait && itemName && t.itemTerkait.toLowerCase().includes(itemName.toLowerCase()))
      );
    });
  }, [templatePMList, itemProyekSapa, item?.name]);

  // Filtered templates based on mode & search query
  const displayedTemplates = useMemo(() => {
    let list = filterMode === 'proyek' ? sameProyekTemplates : templatePMList;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.namaTemplate.toLowerCase().includes(q) ||
          (t.proyekSapa && t.proyekSapa.toLowerCase().includes(q)) ||
          (t.kegiatan && t.kegiatan.toLowerCase().includes(q)) ||
          (t.isiPesan && t.isiPesan.toLowerCase().includes(q))
      );
    }
    return list;
  }, [filterMode, sameProyekTemplates, templatePMList, searchQuery]);

  // Currently selected template object
  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId) return null;
    return templatePMList.find((t) => t.id === selectedTemplateId) || null;
  }, [selectedTemplateId, templatePMList]);

  if (!isOpen || !item) return null;

  // Handler: Save
  const handleSave = () => {
    if (!selectedTemplateId) {
      // Unlink
      onSaveTandaTerima(item.id, null, undefined);
      onShowToast(`Tanda Terima untuk "${item.name}" berhasil dihapus`);
    } else {
      const tpl = templatePMList.find((t) => t.id === selectedTemplateId);
      onSaveTandaTerima(item.id, selectedTemplateId, tpl?.namaTemplate);
      onShowToast(
        `Template PM "${tpl?.namaTemplate}" berhasil diatur sebagai Tanda Terima untuk "${item.name}"`
      );
    }
    onClose();
  };

  // Handler: Quick create new template PM with item's Proyek SAPA
  const handleCreateNewTemplateForProject = () => {
    if (onNavigateToFormTemplatePM) {
      onNavigateToFormTemplatePM({
        namaTemplate: `Tanda Terima ${item.name}`,
        proyekSapa: itemProyekSapa || item.name,
        kegiatan: item.name,
        itemTerkait: childItem ? childItem.name : item.name,
        avatarInitial: item.badgeLetter || 'T',
        avatarBg: item.badgeColor || 'bg-[#008d91]',
        hasImage: true,
        isiPesan: `Namo Buddhaya [Nama Lengkap],\n\nTerima kasih dan turut bermudita atas partisipasi donasi Anda sebesar [Jumlah] untuk program ${item.name}.\nBerikut terlampir e-Tanda Terima resmi donasi Anda.\n\nSemoga kebajikan ini membawa kedamaian, kebahagiaan, dan kemajuan batin bagi Anda sekeluarga. 🙏✨`,
      });
      onClose();
      onShowToast(`Membuka Form Template PM baru untuk Proyek "${itemProyekSapa}"`);
    }
  };

  // Sample values for receipt overlay preview
  const sampleValues: Record<string, string> = {
    '[Nama Lengkap]': 'Enni Megawati',
    '[Jumlah]': childItem ? childItem.price : 'Rp100.777',
    '[Tanggal Terima]': '10 Januari 2025',
    '[Bulan Donasi]': 'Januari 2025',
    '[No Resi]': 'SAPA-DPR-2025-081',
    '[Proyek]': itemProyekSapa || item.name,
    '[Kegiatan]': item.name,
    '[Admin]': 'Admin SAPA',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-4xl w-full my-auto overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-[#f0f9f9] border-b border-slate-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#008d91] text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  Setting Tanda Terima Item D-DONASI
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-teal-100 text-[#008d91] px-2 py-0.5 rounded-full">
                  Template PM
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih Template PM yang memiliki <strong className="text-slate-700">Proyek SAPA yang sama</strong> untuk dijadikan e-Tanda Terima otomatis.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Section 1: Info Item D-DONASI */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl ${item.badgeColor || 'bg-[#008d91]'} text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-xs select-none`}
              >
                {item.badgeLetter || 'D'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-800 text-sm sm:text-base">
                    {item.name}
                  </span>
                  {childItem && (
                    <span className="text-xs font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      Paket: {childItem.name}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.status.toLowerCase() === 'ongoing'
                        ? 'bg-teal-50 text-[#008d91] border border-teal-200'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1.5 flex-wrap text-xs">
                  <span className="text-slate-500 font-medium">Proyek SAPA Terkait:</span>
                  <span className="font-bold text-[#008d91] bg-teal-50/80 px-2.5 py-0.5 rounded-lg border border-teal-200/60 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#008d91]" />
                    {itemProyekSapa || 'Tidak Ada Proyek'}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Status Badge */}
            <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
              <div className="text-[11px] text-slate-400 font-medium">Status Tanda Terima:</div>
              {item.tandaTerimaTemplateId ? (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{item.tandaTerimaTemplateName || 'Template Terpasang'}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl mt-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Belum Diatur</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Pemilihan Template PM */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>Pilih Template PM sebagai Tanda Terima</span>
                  <span className="text-xs font-normal text-slate-500">
                    ({displayedTemplates.length} template tersedia)
                  </span>
                </label>
                <p className="text-xs text-slate-500">
                  Secara default memfilter Template PM yang memiliki Proyek SAPA sama dengan Item D-DONASI.
                </p>
              </div>

              {/* Filter mode toggles */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setFilterMode('proyek')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterMode === 'proyek'
                      ? 'bg-white text-[#008d91] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Proyek SAPA Sama ({sameProyekTemplates.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterMode === 'all'
                      ? 'bg-white text-[#008d91] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({templatePMList.length})
                </button>
              </div>
            </div>

            {/* List of matching templates */}
            {displayedTemplates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                {displayedTemplates.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  const isSameProyek =
                    (tpl.proyekSapa || '').toLowerCase().trim() ===
                    itemProyekSapa.toLowerCase().trim();

                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer text-left flex items-start gap-3 select-none ${
                        isSelected
                          ? 'bg-[#f0f9f9] border-[#008d91] shadow-xs ring-2 ring-[#008d91]/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Radio Selection Indicator */}
                      <div className="pt-0.5 shrink-0">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-[#008d91] bg-[#008d91] text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Thumbnail or Avatar */}
                      <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-200/80 bg-slate-100 flex items-center justify-center">
                        {tpl.hasImage && tpl.imageUrl ? (
                          <img
                            src={tpl.imageUrl}
                            alt={tpl.namaTemplate}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className={`w-full h-full ${
                              tpl.avatarBg || 'bg-[#008d91]'
                            } text-white font-bold text-base flex items-center justify-center`}
                          >
                            {tpl.avatarInitial || tpl.namaTemplate[0] || 'T'}
                          </div>
                        )}
                      </div>

                      {/* Template Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-slate-800 text-xs sm:text-sm truncate">
                            {tpl.namaTemplate}
                          </span>
                          {isSameProyek && (
                            <span className="text-[9px] font-bold bg-teal-100 text-[#008d91] px-1.5 py-0.5 rounded shrink-0">
                              Cocok
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>Proyek: <strong className="text-slate-700">{tpl.proyekSapa || '-'}</strong></span>
                        </div>

                        {/* Badges: Image & Custom Fields */}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {tpl.hasImage && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200/60">
                              <ImageIcon className="w-2.5 h-2.5" />
                              Lampiran Gambar
                            </span>
                          )}
                          {tpl.imageOverlayFields && tpl.imageOverlayFields.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200/60">
                              <Sparkles className="w-2.5 h-2.5" />
                              {tpl.imageOverlayFields.length} Field Custom
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty state for Proyek Filter */
              <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Belum Ada Template PM untuk Proyek "{itemProyekSapa}"
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Anda dapat beralih ke tombol <strong>"Semua"</strong> untuk memilih template lain, atau langsung membuat Template PM baru dengan Proyek SAPA ini.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Tampilkan Semua Template ({templatePMList.length})
                  </button>
                  {onNavigateToFormTemplatePM && (
                    <button
                      type="button"
                      onClick={handleCreateNewTemplateForProject}
                      className="px-3.5 py-1.5 rounded-xl bg-[#008d91] hover:bg-[#05828e] text-white text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buat Template PM untuk Proyek Ini</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Live Preview of Selected Template PM */}
          {selectedTemplate && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#008d91]" />
                  <span className="text-xs font-bold text-slate-800">
                    Pratinjau e-Tanda Terima: {selectedTemplate.namaTemplate}
                  </span>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPreviewTab('receipt')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      previewTab === 'receipt'
                        ? 'bg-white text-[#008d91] shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Visual Tanda Terima
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTab('message')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      previewTab === 'message'
                        ? 'bg-white text-[#008d91] shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Teks Pesan WhatsApp
                  </button>
                </div>
              </div>

              {/* Tab 1: Visual Receipt */}
              {previewTab === 'receipt' && (
                <div className="space-y-3">
                  {selectedTemplate.hasImage && selectedTemplate.imageUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 max-w-lg mx-auto shadow-xs">
                      {/* Base Image */}
                      <img
                        src={selectedTemplate.imageUrl}
                        alt="Preview Tanda Terima"
                        className="w-full h-auto object-contain block"
                      />

                      {/* Rendered Overlay Fields with Sample Data */}
                      {selectedTemplate.imageOverlayFields &&
                        selectedTemplate.imageOverlayFields.map((field) => {
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
                                fontStyle: field.fontStyle || 'normal',
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
                    <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-600 font-medium">
                        Template ini menggunakan format pesan teks tanpa lampiran gambar e-tanda terima.
                      </p>
                    </div>
                  )}

                  {/* List of Custom Tags active */}
                  {selectedTemplate.imageOverlayFields &&
                    selectedTemplate.imageOverlayFields.length > 0 && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                        <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-[#008d91]" />
                          <span>Field Dinamis yang Tercetak Otomatis pada Tanda Terima:</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {selectedTemplate.imageOverlayFields.map((f) => (
                            <span
                              key={f.id}
                              className="text-[10px] font-mono bg-white text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 font-semibold"
                            >
                              {f.label}: <span className="text-[#008d91]">{f.tag}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Tab 2: WhatsApp Text Draft */}
              {previewTab === 'message' && (
                <div className="bg-[#eef8f5] rounded-xl p-3.5 border border-[#c4e5dc] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Draf Isi Pesan Pengiriman Tanda Terima:</span>
                  </div>
                  <pre className="text-xs text-slate-800 font-sans whitespace-pre-wrap leading-relaxed bg-white/80 p-3 rounded-lg border border-emerald-100">
                    {selectedTemplate.isiPesan}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 gap-3">
          <div>
            {item.tandaTerimaTemplateId && (
              <button
                type="button"
                onClick={() => setSelectedTemplateId(null)}
                className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Hapus Tanda Terima dari Item ini</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#008d91] hover:bg-[#05828e] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Simpan sebagai Tanda Terima</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
