import React, { useState } from 'react';
import {
  X,
  Check,
  Clock,
  MessageSquareText,
  Truck,
  Sparkles,
  Info,
  ShieldCheck,
  Send,
  Eye,
} from 'lucide-react';
import {
  ChatAutoRule,
  ChatAutoTriggerType,
  ChatAutoDelayUnit,
  ChatAutoTargetType,
  renderTemplateMessage,
  formatDelayText,
} from '../chatAutoSalurData';
import { TemplatePMItem } from '../types';
import { ViaTransaksiSalurItem } from '../viaSalurData';

interface AddEditChatAutoRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: ChatAutoRule) => void;
  ruleToEdit?: ChatAutoRule | null;
  templates: TemplatePMItem[];
  viaList: ViaTransaksiSalurItem[];
  onShowToast: (msg: string) => void;
}

export const AddEditChatAutoRuleModal: React.FC<AddEditChatAutoRuleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  ruleToEdit,
  templates,
  viaList,
  onShowToast,
}) => {
  if (!isOpen) return null;

  const isEditing = !!ruleToEdit;

  // Form State
  const [namaAturan, setNamaAturan] = useState(
    ruleToEdit ? ruleToEdit.namaAturan : 'Pemberitahuan Resi S-SALUR Baru'
  );
  const [deskripsi, setDeskripsi] = useState(
    ruleToEdit ? ruleToEdit.deskripsi : 'Kirim pesan otomatis saat resi pengiriman diinput'
  );
  const [pemicu, setPemicu] = useState<ChatAutoTriggerType>(
    ruleToEdit ? ruleToEdit.pemicu : 'saat_input_resi'
  );
  const [delayValue, setDelayValue] = useState<number>(
    ruleToEdit ? ruleToEdit.delayValue : 0
  );
  const [delayUnit, setDelayUnit] = useState<ChatAutoDelayUnit>(
    ruleToEdit ? ruleToEdit.delayUnit : 'bulan'
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    ruleToEdit ? ruleToEdit.templatePmId : (templates[0]?.id || 'tpm-resi-salur')
  );
  const [semuaVia, setSemuaVia] = useState<boolean>(
    ruleToEdit ? ruleToEdit.semuaVia : false
  );
  // Default: CC, Store, Form, Sosmed aktif. Tokopedia & Shopee tidak perlu.
  const [selectedViaIds, setSelectedViaIds] = useState<string[]>(
    ruleToEdit
      ? ruleToEdit.viaIds
      : ['vts-1', 'vts-4', 'vts-6', 'vts-7', 'vts-8', 'vts-9', 'vts-10']
  );
  const [targetPenerima, setTargetPenerima] = useState<ChatAutoTargetType>(
    ruleToEdit ? ruleToEdit.targetPenerima : 'keduanya'
  );
  const [aktif, setAktif] = useState<boolean>(
    ruleToEdit ? ruleToEdit.aktif : true
  );

  // Selected template object
  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Helper toggle via
  const toggleVia = (viaId: string) => {
    setSelectedViaIds((prev) =>
      prev.includes(viaId) ? prev.filter((id) => id !== viaId) : [...prev, viaId]
    );
  };

  // Preset actions
  const applyPresetVia = (type: 'all' | 'none' | 'cc_only' | 'standard_no_marketplace') => {
    if (type === 'all') {
      setSelectedViaIds(viaList.map((v) => v.id));
      setSemuaVia(false);
    } else if (type === 'none') {
      setSelectedViaIds([]);
      setSemuaVia(false);
    } else if (type === 'cc_only') {
      const cc = viaList.find((v) => v.id === 'vts-1' || v.namaVia.toLowerCase().includes('call center'));
      setSelectedViaIds(cc ? [cc.id] : []);
      setSemuaVia(false);
    } else if (type === 'standard_no_marketplace') {
      // Exclude marketplace (Tokopedia, Shopee)
      const allowed = viaList
        .filter((v) => !v.namaVia.toLowerCase().includes('tokopedia') && !v.namaVia.toLowerCase().includes('shopee'))
        .map((v) => v.id);
      setSelectedViaIds(allowed);
      setSemuaVia(false);
    }
  };

  // Set delay preset
  const setDelayPreset = (val: number, unit: ChatAutoDelayUnit, trigger: ChatAutoTriggerType = 'setelah_resi_diinput') => {
    setPemicu(trigger);
    setDelayValue(val);
    setDelayUnit(unit);
  };

  // Live preview message
  const previewMessage = renderTemplateMessage(currentTemplate?.isiPesan || '', {
    nama: 'Suparman',
    resi: '11LP1636545251274',
    ekspedisi: 'LION',
    kode: '2021 CC 4451003223',
    tujuan: 'DUSUN OTAK LENDAK DESA AKAR AKAR KEC BAYAN LOMBOK UTARA',
    tanggal: '10 Nov 2021',
  });

  const handleSave = () => {
    if (!namaAturan.trim()) {
      onShowToast('Nama aturan tidak boleh kosong');
      return;
    }

    if (!semuaVia && selectedViaIds.length === 0) {
      onShowToast('Pilih minimal satu Via Transaksi S-SALUR atau aktifkan semua via');
      return;
    }

    const newRule: ChatAutoRule = {
      id: ruleToEdit ? ruleToEdit.id : `rule-${Date.now()}`,
      namaAturan: namaAturan.trim(),
      deskripsi: deskripsi.trim(),
      pemicu,
      delayValue: pemicu === 'saat_input_resi' ? 0 : Number(delayValue) || 0,
      delayUnit,
      templatePmId: currentTemplate?.id || 'tpm-resi-salur',
      templatePmName: currentTemplate?.namaTemplate || 'Pemberitahuan Resi S-SALUR',
      semuaVia,
      viaIds: semuaVia ? viaList.map((v) => v.id) : selectedViaIds,
      targetPenerima,
      aktif,
      totalTerkirim: ruleToEdit ? ruleToEdit.totalTerkirim : 0,
      totalTertunda: ruleToEdit ? ruleToEdit.totalTertunda : 0,
      createdAt: ruleToEdit ? ruleToEdit.createdAt : '10 Nov 2021',
      updatedAt: '10 Nov 2021',
    };

    onSave(newRule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-[#f8fafc]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#008d91]/10 text-[#008d91] flex items-center justify-center font-bold">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800">
                {isEditing ? 'Edit Aturan Chat Auto S-SALUR' : 'Tambah Aturan Chat Auto Khusus S-SALUR'}
              </h2>
              <p className="text-xs text-slate-500">
                Konfigurasi pesan otomatis berdasarkan nomor resi & filter Via Transaksi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content with 2-column layout on desktop */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 font-['Plus_Jakarta_Sans',sans-serif]">
          {/* Section 1: Basic Info & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Nama Aturan Chat Auto *</label>
              <input
                type="text"
                value={namaAturan}
                onChange={(e) => setNamaAturan(e.target.value)}
                placeholder="Contoh: Pemberitahuan Resi Saat Diinput / Ajakan Testimoni 1 Bulan"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Status Aturan</label>
              <button
                type="button"
                onClick={() => setAktif(!aktif)}
                className={`w-full py-2.5 px-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                  aktif
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-50 text-slate-500'
                }`}
              >
                <span className="text-xs font-semibold">
                  {aktif ? '● Aktif (Auto Send)' : '○ Nonaktif (Pause)'}
                </span>
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white ${
                    aktif ? 'bg-emerald-600' : 'bg-slate-400'
                  }`}
                >
                  {aktif ? '✓' : ''}
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">Deskripsi / Catatan Aturan</label>
            <input
              type="text"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan tujuan pesan otomasi ini..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:border-[#008d91]"
            />
          </div>

          {/* Section 2: Pemicu / Trigger & Waktu Jeda (Berapa lama baru dihubungi) */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#008d91]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pemicu & Waktu Kirim Pesan
              </h3>
            </div>

            {/* Trigger Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => {
                  setPemicu('saat_input_resi');
                  setDelayValue(0);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  pemicu === 'saat_input_resi'
                    ? 'border-[#008d91] bg-teal-50/30 ring-1 ring-[#008d91]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">1. Saat Nomor Resi Diinput</span>
                  <input
                    type="radio"
                    checked={pemicu === 'saat_input_resi'}
                    onChange={() => {}}
                    className="accent-[#008d91]"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Langsung dikirimkan otomatis saat staf menginput nomor resi baru ke sistem.
                </p>
              </div>

              <div
                onClick={() => {
                  setPemicu('setelah_resi_diinput');
                  if (delayValue === 0) setDelayValue(1);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  pemicu === 'setelah_resi_diinput'
                    ? 'border-[#008d91] bg-teal-50/30 ring-1 ring-[#008d91]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    2. Setelah Nomor Resi Diinput (Jeda Waktu)
                  </span>
                  <input
                    type="radio"
                    checked={pemicu === 'setelah_resi_diinput'}
                    onChange={() => {}}
                    className="accent-[#008d91]"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Dihubungi setelah jeda waktu tertentu (Contoh: 1 bulan baru dihubungi untuk ajakan testimoni).
                </p>
              </div>
            </div>

            {/* Delay Settings (Jika setelah resi diinput) */}
            {pemicu === 'setelah_resi_diinput' && (
              <div className="mt-3 p-3.5 bg-white rounded-xl border border-slate-200/80 space-y-3 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Berapa lama baru dihubungi setelah nomor resi diinput?
                  </label>
                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setDelayPreset(1, 'bulan')}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                        delayValue === 1 && delayUnit === 'bulan'
                          ? 'bg-[#008d91] text-white border-[#008d91]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      1 Bulan (Testimoni)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDelayPreset(14, 'hari')}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                        delayValue === 14 && delayUnit === 'hari'
                          ? 'bg-[#008d91] text-white border-[#008d91]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      14 Hari
                    </button>
                    <button
                      type="button"
                      onClick={() => setDelayPreset(7, 'hari')}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                        delayValue === 7 && delayUnit === 'hari'
                          ? 'bg-[#008d91] text-white border-[#008d91]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      7 Hari (Konfirmasi)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDelayPreset(3, 'bulan')}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                        delayValue === 3 && delayUnit === 'bulan'
                          ? 'bg-[#008d91] text-white border-[#008d91]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      3 Bulan
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 max-w-sm">
                  <div className="flex-1">
                    <input
                      type="number"
                      min={1}
                      value={delayValue}
                      onChange={(e) => setDelayValue(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-hidden focus:border-[#008d91]"
                    />
                  </div>
                  <div className="w-36">
                    <select
                      value={delayUnit}
                      onChange={(e) => setDelayUnit(e.target.value as ChatAutoDelayUnit)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-hidden focus:border-[#008d91] bg-white"
                    >
                      <option value="hari">Hari</option>
                      <option value="minggu">Minggu</option>
                      <option value="bulan">Bulan</option>
                      <option value="jam">Jam</option>
                    </select>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  💡 Aturan ini akan otomatis mengirim pesan {formatDelayText(delayValue, delayUnit)} setelah nomor resi diinput.
                </p>
              </div>
            )}
          </div>

          {/* Section 3: Pilihan Template PM */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquareText className="w-4 h-4 text-[#008d91]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Template PM yang Digunakan
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                Total {templates.length} template tersedia
              </span>
            </div>

            <div className="space-y-2">
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-hidden focus:border-[#008d91] bg-white shadow-2xs"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.namaTemplate} ({tpl.kegiatan || tpl.proyekSapa || 'Umum'})
                  </option>
                ))}
              </select>

              {/* Template preview snippet */}
              {currentTemplate && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-700">
                    <span>Pratinjau Isi Pesan Template:</span>
                    <span className="text-[10px] text-[#008d91] bg-teal-50 px-2 py-0.5 rounded-md">
                      Variabel [Nama], [No Resi], [Ekspedisi], [Kode Transaksi] didukung
                    </span>
                  </div>
                  <p className="line-clamp-3 whitespace-pre-wrap text-slate-500 italic">
                    {currentTemplate.isiPesan}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Filter Via Transaksi S-SALUR yang Dikirim (Crucial User Requirement!) */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#008d91]" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Filter Via Transaksi S-SALUR yang Dikirim
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pilih via transaksi mana saja yang perlu dikirimkan pesan ini
                  </p>
                </div>
              </div>

              {/* Quick actions for Via selection */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => applyPresetVia('standard_no_marketplace')}
                  className="text-[11px] px-2.5 py-1 rounded-lg border border-[#008d91]/30 bg-teal-50 text-[#008d91] font-semibold hover:bg-teal-100 transition-colors"
                  title="Call Center, Store, Form, Sosmed AKTIF. Marketplace (Tokopedia & Shopee) dilewati."
                >
                  ⭐ Standar (CC Ya, Tokopedia Tidak)
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetVia('cc_only')}
                  className="text-[11px] px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Hanya CC
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetVia('all')}
                  className="text-[11px] px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Pilih Semua
                </button>
              </div>
            </div>

            {/* Instruction callout as requested */}
            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Contoh Skenario Penggunaan:</span>
                <p className="text-[11px] mt-0.5 text-amber-800 leading-relaxed">
                  Jika pesanan melalui <b>Call Center (CC)</b>, aktifkan centang agar pelanggan mendapatkan pesan resi / ajakan testimoni. Namun jika pesanan dari <b>Tokopedia</b> atau <b>Shopee</b>, tidak perlu dicentang karena pihak marketplace telah mengirimkan pemberitahuan resi otomatis kepada pembeli.
                </p>
              </div>
            </div>

            {/* Via Checkboxes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {viaList.map((via) => {
                const isSelected = selectedViaIds.includes(via.id);
                const isMarketplace = via.namaVia.toLowerCase().includes('tokopedia') || via.namaVia.toLowerCase().includes('shopee');
                const isCC = via.id === 'vts-1' || via.namaVia.toLowerCase().includes('call center');

                return (
                  <div
                    key={via.id}
                    onClick={() => toggleVia(via.id)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'border-emerald-200 bg-emerald-50/40 text-slate-800 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#008d91] border-[#008d91] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="truncate">
                        <span className={`text-xs font-semibold block truncate ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}>
                          {via.namaVia}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {via.jenisVia} · {via.tipe}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isSelected ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                          {isCC ? '✓ Kirim (CC)' : '✓ Kirim'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                          {isMarketplace ? '✕ Dilewati' : '✕ Tidak'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                Total <b>{selectedViaIds.length}</b> dari {viaList.length} via transaksi diaktifkan
              </span>
              {selectedViaIds.includes('vts-2') ? (
                <span className="text-amber-600 text-[11px] font-medium">
                  ⚠️ Tokopedia ikut tercentang
                </span>
              ) : (
                <span className="text-emerald-600 text-[11px] font-medium">
                  ✓ Tokopedia dilewati (sesuai rekomendasi)
                </span>
              )}
            </div>
          </div>

          {/* Section 5: Target Penerima Pesan */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Target Kontak Penerima Pesan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'keduanya', label: 'Pembeli & Penerima', sub: 'Kirim ke kedua nomor kontak' },
                { id: 'penerima', label: 'Hanya Penerima Paket', sub: 'Kirim ke alamat tujuan' },
                { id: 'pembeli', label: 'Hanya Pembeli (Pemesan)', sub: 'Kirim ke kontak akun pemesan' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setTargetPenerima(opt.id as ChatAutoTargetType)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    targetPenerima === opt.id
                      ? 'border-[#008d91] bg-teal-50/40 ring-1 ring-[#008d91]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{opt.label}</span>
                    <input
                      type="radio"
                      checked={targetPenerima === opt.id}
                      onChange={() => {}}
                      className="accent-[#008d91]"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 6: Live Message Preview in Phone View */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#008d91]" />
                <h4 className="text-xs font-bold text-slate-700">
                  Simulasi Tampilan Pesan WhatsApp (Real-time Preview)
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">
                Pemicu: {pemicu === 'saat_input_resi' ? 'Langsung' : formatDelayText(delayValue, delayUnit)}
              </span>
            </div>

            <div className="bg-[#eef2f5] p-3.5 rounded-2xl border border-slate-200/80">
              <div className="max-w-md bg-white rounded-2xl p-3 shadow-xs border border-slate-200/60 text-xs text-slate-800 space-y-1 relative">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
                  <span className="font-bold text-[#008d91] flex items-center gap-1.5 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    SAPA Lamrimnesia Customer Care
                  </span>
                  <span className="text-[10px] text-slate-400">Hari ini</span>
                </div>
                <p className="whitespace-pre-wrap leading-relaxed text-[11px] text-slate-700">
                  {previewMessage}
                </p>
                <div className="flex justify-end pt-1">
                  <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                    14:20 ✓✓
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-[#f8fafc]">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Otomatis masuk dan disinkronkan ke menu <b>"List PM"</b></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#008d91] hover:bg-[#007a7e] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {isEditing ? 'Simpan & Sinkron ke List PM' : 'Buat Aturan & Masuk ke List PM'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
