import React, { useState } from 'react';
import {
  MessageSquareText,
  Plus,
  Search,
  SlidersHorizontal,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Edit2,
  Trash2,
  Play,
  RotateCcw,
  Sparkles,
  Send,
  Eye,
  Info,
  Check,
  X,
  Layers,
  Calendar,
  Smartphone,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  ChatAutoRule,
  ChatAutoLogItem,
  loadChatAutoRules,
  saveChatAutoRules,
  loadChatAutoLogs,
  saveChatAutoLogs,
  renderTemplateMessage,
  formatDelayText,
  detectViaFromKode,
  isViaAllowedByRule,
  syncChatAutoRulesToListPM,
} from '../chatAutoSalurData';
import { TemplatePMItem, AppView } from '../types';
import { loadTemplatePM } from '../templatePMData';
import { INITIAL_VIA_TRANSAKSI_SALUR, ViaTransaksiSalurItem } from '../viaSalurData';
import { loadResiItems, ResiItem } from '../resiData';
import { SalurOrder } from '../salurData';
import { AddEditChatAutoRuleModal } from './AddEditChatAutoRuleModal';

interface ChatAutoKhususSSalurViewProps {
  onShowToast: (msg: string) => void;
  salurOrders?: SalurOrder[];
  onNavigateToResi?: () => void;
  onNavigateToTemplatePM?: () => void;
  onNavigateToTransaksiSalur?: () => void;
  onNavigateToListPM?: () => void;
}

export const ChatAutoKhususSSalurView: React.FC<ChatAutoKhususSSalurViewProps> = ({
  onShowToast,
  salurOrders = [],
  onNavigateToResi,
  onNavigateToTemplatePM,
  onNavigateToTransaksiSalur,
  onNavigateToListPM,
}) => {
  // Master Data
  const [rules, setRules] = useState<ChatAutoRule[]>(() => loadChatAutoRules());
  const [logs, setLogs] = useState<ChatAutoLogItem[]>(() => loadChatAutoLogs());
  const [templates] = useState<TemplatePMItem[]>(() => loadTemplatePM());
  const [viaList] = useState<ViaTransaksiSalurItem[]>(INITIAL_VIA_TRANSAKSI_SALUR);
  const [resiList] = useState<ResiItem[]>(() => loadResiItems());

  // Automatically sync to List PM on component mount
  React.useEffect(() => {
    syncChatAutoRulesToListPM(rules, resiList);
  }, []);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'rules' | 'simulator' | 'logs'>('rules');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrigger, setFilterTrigger] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ChatAutoRule | null>(null);

  // Simulator State
  const [selectedResiId, setSelectedResiId] = useState<string>(resiList[0]?.id || 'resi-2');
  const [simulatedRecipientName, setSimulatedRecipientName] = useState<string>('');
  const [simulatedPhone, setSimulatedPhone] = useState<string>('+62 812-9901-2245');

  // Selected Resi for Simulator
  const currentResi = resiList.find((r) => r.id === selectedResiId) || resiList[0];
  const detectedVia = detectViaFromKode(currentResi?.kode, viaList);

  // Summary Counts
  const totalRules = rules.length;
  const activeRulesCount = rules.filter((r) => r.aktif).length;
  const totalSentCount = rules.reduce((acc, r) => acc + (r.totalTerkirim || 0), 0);
  const totalPendingCount = rules.reduce((acc, r) => acc + (r.totalTertunda || 0), 0);

  // Filtered Rules
  const filteredRules = rules.filter((r) => {
    if (filterTrigger !== 'all' && r.pemicu !== filterTrigger) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.namaAturan.toLowerCase().includes(q);
      const matchDesc = r.deskripsi.toLowerCase().includes(q);
      const matchTemplate = r.templatePmName.toLowerCase().includes(q);
      return matchName || matchDesc || matchTemplate;
    }
    return true;
  });

  // Toggle Rule Status
  const handleToggleRule = (ruleId: string) => {
    const updated = rules.map((r) =>
      r.id === ruleId ? { ...r, aktif: !r.aktif, updatedAt: '10 Nov 2021' } : r
    );
    setRules(updated);
    saveChatAutoRules(updated);
    syncChatAutoRulesToListPM(updated, resiList);
    const rule = rules.find((r) => r.id === ruleId);
    if (rule) {
      onShowToast(
        `Aturan "${rule.namaAturan}" sekarang ${!rule.aktif ? 'AKTIF' : 'NONAKTIF'} (Sinkron ke List PM)`
      );
    }
  };

  // Delete Rule
  const handleDeleteRule = (ruleId: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    const updated = rules.filter((r) => r.id !== ruleId);
    setRules(updated);
    saveChatAutoRules(updated);
    syncChatAutoRulesToListPM(updated, resiList);
    onShowToast(`Aturan "${rule?.namaAturan}" berhasil dihapus dari Chat Auto & List PM`);
  };

  // Save Rule from Modal
  const handleSaveRule = (savedRule: ChatAutoRule) => {
    let updated: ChatAutoRule[];
    if (rules.some((r) => r.id === savedRule.id)) {
      updated = rules.map((r) => (r.id === savedRule.id ? savedRule : r));
      onShowToast(`Aturan "${savedRule.namaAturan}" berhasil diperbarui & disinkronkan ke List PM`);
    } else {
      updated = [savedRule, ...rules];
      onShowToast(`Aturan baru "${savedRule.namaAturan}" berhasil dibuat & otomatis masuk ke List PM`);
    }
    setRules(updated);
    saveChatAutoRules(updated);
    syncChatAutoRulesToListPM(updated, resiList);
  };

  // Test Run Rule from Simulator
  const handleSimulateSend = (rule: ChatAutoRule) => {
    const recipientName = simulatedRecipientName || currentResi?.nama || 'Pelanggan';
    const isAllowed = isViaAllowedByRule(rule, detectedVia);

    const template = templates.find((t) => t.id === rule.templatePmId) || templates[0];
    const preview = renderTemplateMessage(template?.isiPesan || '', {
      nama: recipientName,
      resi: currentResi?.resi || '11LP1636545251274',
      ekspedisi: currentResi?.ekspedisi || 'LION',
      kode: currentResi?.kode || '2021 CC 4451003223',
      tujuan: currentResi?.tujuan || 'Mataram, Lombok',
      tanggal: currentResi?.tanggal || '10 Nov 2021',
    });

    const newLog: ChatAutoLogItem = {
      id: `log-${Date.now()}`,
      ruleId: rule.id,
      ruleNama: rule.namaAturan,
      resi: currentResi?.resi || '-',
      namaPenerima: recipientName,
      nomorHp: simulatedPhone,
      ekspedisi: currentResi?.ekspedisi || '-',
      kodeTransaksi: currentResi?.kode || '-',
      viaNama: detectedVia.namaVia,
      templatePmId: rule.templatePmId,
      templatePmName: rule.templatePmName,
      isiPesan: preview,
      tanggalInputResi: currentResi?.tanggal || '10 Nov 2021',
      jadwalKirim:
        rule.pemicu === 'saat_input_resi'
          ? 'Langsung (Terkirim Sekarang)'
          : `${formatDelayText(rule.delayValue, rule.delayUnit)} setelah resi`,
      status: isAllowed ? (rule.pemicu === 'saat_input_resi' ? 'Terkirim' : 'Terjadwal') : 'Dilewati',
      alasanStatus: isAllowed
        ? `Terkirim via WhatsApp untuk ${detectedVia.namaVia}`
        : `Dilewati karena transaksi via ${detectedVia.namaVia} dinonaktifkan pada aturan ini`,
      timestamp: 'Baru saja',
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveChatAutoLogs(updatedLogs);

    if (isAllowed) {
      onShowToast(
        `✓ [Simulasi Sukses] Pesan "${rule.namaAturan}" dikirim ke ${recipientName} (${detectedVia.namaVia})`
      );
    } else {
      onShowToast(
        `ℹ️ [Dilewati] Transaksi via ${detectedVia.namaVia} tidak dikirimkan pesan sesuai pengaturan aturan.`
      );
    }
  };

  return (
    <div className="w-full font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200 space-y-6">
      {/* Top Banner / Header Container */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Title and subtitle */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#008d91]/10 text-[#008d91] flex items-center justify-center font-bold shadow-2xs">
                <MessageSquareText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                    Chat Auto Khusus S-SALUR
                  </h1>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-[#008d91] border border-[#008d91]/20">
                    Otomasi Resi & Testimoni
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500">
                  Kirim pesan otomatis saat resi diinput & ajakan testimoni setelah jeda waktu (filter via CC, Tokopedia, dll.)
                </p>
              </div>
            </div>
          </div>

          {/* Quick Navigation Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
            {onNavigateToResi && (
              <button
                type="button"
                onClick={onNavigateToResi}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Truck className="w-4 h-4 text-slate-500" />
                Buka Data Resi
              </button>
            )}
            {onNavigateToTemplatePM && (
              <button
                type="button"
                onClick={onNavigateToTemplatePM}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Layers className="w-4 h-4 text-slate-500" />
                Template PM
              </button>
            )}
            {onNavigateToListPM && (
              <button
                type="button"
                onClick={onNavigateToListPM}
                className="px-3.5 py-2 rounded-xl border border-teal-200 bg-teal-50 text-xs font-semibold text-[#008d91] hover:bg-teal-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Buka data di List PM"
              >
                <Send className="w-4 h-4 text-[#008d91]" />
                Lihat di List PM
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setEditingRule(null);
                setIsModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#008d91] text-white text-xs font-bold hover:bg-[#007a7e] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              + Tambah Aturan Auto
            </button>
          </div>
        </div>

        {/* 4 Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          {/* Card 1: Total Rules */}
          <div className="bg-[#f8fafc] rounded-2xl p-4 border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Aturan Otomasi
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-800">{totalRules}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                {activeRulesCount} Aktif
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Total konfigurasi aturan aktif</p>
          </div>

          {/* Card 2: Pemberitahuan Resi */}
          <div className="bg-[#f8fafc] rounded-2xl p-4 border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Pemberitahuan Resi
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#008d91]">Saat Input</span>
              <span className="text-xs font-bold text-[#008d91] bg-teal-50 px-2 py-0.5 rounded-md">
                CC Ya · Toko Tidak
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Langsung dikirim ke pelanggan CC</p>
          </div>

          {/* Card 3: Ajakan Testimoni */}
          <div className="bg-[#f8fafc] rounded-2xl p-4 border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Ajakan Testimoni
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-amber-700">1 Bulan</span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                {totalPendingCount} Terjadwal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Jeda waktu setelah resi diinput</p>
          </div>

          {/* Card 4: Total Sent */}
          <div className="bg-[#f8fafc] rounded-2xl p-4 border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Pesan Terkirim Auto
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-800">{totalSentCount}</span>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                WhatsApp
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Akumulasi pengiriman otomatis</p>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-[#008d91] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            📋 Daftar Aturan Otomasi ({rules.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-[#008d91] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            📱 Simulasi & Uji Resi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-[#008d91] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            📜 Antrean & Riwayat Log ({logs.length})
          </button>
        </div>

        {/* Tab 1 Quick Filter & Search */}
        {activeTab === 'rules' && (
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari aturan..."
                className="text-xs text-slate-700 outline-hidden w-36"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <select
              value={filterTrigger}
              onChange={(e) => setFilterTrigger(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 outline-hidden"
            >
              <option value="all">Semua Pemicu</option>
              <option value="saat_input_resi">Saat Input Resi</option>
              <option value="setelah_resi_diinput">Setelah Input Resi (Jeda)</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: RULES LIST */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {/* Explanation Info Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-emerald-950">Cara Kerja & Integrasi Otomatis ke List PM:</span>
              <p className="text-[11px] leading-relaxed text-emerald-800">
                1. <b>Auto Masuk ke "List PM"</b>: Semua aturan yang di-set pada "Chat Auto Khusus S-SALUR" secara otomatis disinkronkan dan masuk ke menu <b>"List PM"</b> dengan rincian penerima resi, target status, deadline, dan badge khusus.<br />
                2. <b>Pemberitahuan Resi Saat Diinput</b>: Saat nomor resi diinput pada sistem, sistem mengecek via transaksi S-SALUR. Jika via <b>Call Center (CC)</b>, pesan resi otomatis disiapkan dan dikirim menggunakan template yang dipilih. Jika via <b>Tokopedia</b> atau <b>Shopee</b>, otomatis dilewati.<br />
                3. <b>Ajakan Testimoni (1 Bulan / Waktu Kustom)</b>: Setelah 1 bulan sejak nomor resi diinput, sistem otomatis mengirimkan ajakan testimoni & ulasan pengalaman membaca buku kepada pembeli.<br />
                4. <b>Fleksibilitas</b>: Anda dapat mengedit, menambah aturan baru, atau menonaktifkan aturan kapan saja dan statusnya akan langsung disinkronkan ke List PM.
              </p>
            </div>
          </div>

          {/* Rules Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredRules.map((rule) => {
              const ruleTemplate = templates.find((t) => t.id === rule.templatePmId);
              const isImmediate = rule.pemicu === 'saat_input_resi';

              // Get list of enabled vias
              const enabledVias = viaList.filter((v) => rule.viaIds.includes(v.id));
              const ccEnabled = enabledVias.some(
                (v) => v.id === 'vts-1' || v.namaVia.toLowerCase().includes('call center')
              );
              const tokopediaEnabled = enabledVias.some((v) =>
                v.namaVia.toLowerCase().includes('tokopedia')
              );

              return (
                <div
                  key={rule.id}
                  className={`bg-white rounded-3xl border transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-2xs ${
                    rule.aktif
                      ? 'border-slate-200 hover:border-slate-300'
                      : 'border-slate-200/70 bg-slate-50/50 opacity-80'
                  }`}
                >
                  {/* Card Top: Title, Trigger badge & toggle */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-slate-800">
                            {rule.namaAturan}
                          </h3>
                          {isImmediate ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              ⚡ Saat Resi Diinput (Langsung)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDelayText(rule.delayValue, rule.delayUnit)} Setelah Resi
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {rule.deskripsi}
                        </p>
                      </div>

                      {/* Active toggle switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleRule(rule.id)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                          rule.aktif
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Klik untuk aktif/nonaktifkan aturan"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            rule.aktif ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                          }`}
                        />
                        {rule.aktif ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </div>

                    {/* Template PM Used */}
                    <div className="bg-[#f8fafc] rounded-2xl p-3 border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium flex items-center gap-1.5">
                          <MessageSquareText className="w-3.5 h-3.5 text-[#008d91]" />
                          Template PM yang Dipakai:
                        </span>
                        <span className="font-bold text-[#008d91]">
                          {rule.templatePmName || ruleTemplate?.namaTemplate || 'Pemberitahuan Resi'}
                        </span>
                      </div>
                      {ruleTemplate && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 italic bg-white p-2 rounded-lg border border-slate-200/60">
                          "{ruleTemplate.isiPesan}"
                        </p>
                      )}
                    </div>

                    {/* Via Transaksi S-SALUR Filter Display */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-slate-400" />
                          Via Transaksi S-SALUR yang Dikirim:
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {enabledVias.length} via aktif
                        </span>
                      </div>

                      {/* Badges of enabled and disabled vias */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {ccEnabled ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                            ✓ Call Center (CC)
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-400">
                            ✕ Call Center
                          </span>
                        )}

                        {tokopediaEnabled ? (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                            ✓ Tokopedia
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200" title="Sesuai contoh: transaksi Tokopedia dilewati">
                            ✕ Tokopedia (Dilewati)
                          </span>
                        )}

                        {enabledVias
                          .filter((v) => !v.namaVia.toLowerCase().includes('call center') && !v.namaVia.toLowerCase().includes('tokopedia'))
                          .slice(0, 3)
                          .map((v) => (
                            <span
                              key={v.id}
                              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200"
                            >
                              ✓ {v.namaVia}
                            </span>
                          ))}

                        {enabledVias.length > 5 && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            +{enabledVias.length - 5} lainnya
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                      <span>Target: {rule.targetPenerima === 'keduanya' ? 'Pembeli & Penerima' : rule.targetPenerima === 'pembeli' ? 'Pembeli Saja' : 'Penerima Saja'}</span>
                      <span>Total Terkirim: <b>{rule.totalTerkirim || 0} pesan</b></span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedResiId(resiList[0]?.id || 'resi-2');
                          setActiveTab('simulator');
                        }}
                        className="text-xs font-semibold text-[#008d91] hover:text-[#007a7e] flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Uji Coba
                      </button>
                      {onNavigateToListPM && (
                        <button
                          type="button"
                          onClick={onNavigateToListPM}
                          className="text-xs font-semibold text-slate-600 hover:text-[#008d91] flex items-center gap-1 cursor-pointer"
                          title="Lihat antrean pesan ini di List PM"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Buka di List PM
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingRule(rule);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit Aturan"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus Aturan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SIMULATOR & TEST */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Select Resi & Parameters */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-100 p-6 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#008d91]" />
                <h3 className="text-base font-bold text-slate-800">
                  Simulasi Pengujian Pesan Berdasarkan Resi
                </h3>
              </div>
              <span className="text-xs text-slate-400">Pilih Data Resi Nyata</span>
            </div>

            <p className="text-xs text-slate-500">
              Uji bagaimana aturan otomasi memproses nomor resi yang diinput berdasarkan Via Transaksinya (Call Center, Tokopedia, dll.).
            </p>

            {/* Select Resi */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Pilih Nomor Resi Pengiriman:</label>
              <select
                value={selectedResiId}
                onChange={(e) => setSelectedResiId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:border-[#008d91] bg-white shadow-2xs"
              >
                {resiList.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.resi} — {r.nama} ({r.kode || 'No Code'} - {r.ekspedisi})
                  </option>
                ))}
              </select>
            </div>

            {/* Details of Selected Resi */}
            {currentResi && (
              <div className="p-4 bg-[#f8fafc] rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nomor Resi:</span>
                    <span className="font-bold text-slate-800 font-mono text-xs">{currentResi.resi}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Penerima:</span>
                    <span className="font-bold text-slate-800">{currentResi.nama}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Ekspedisi:</span>
                    <span className="font-semibold text-slate-700">{currentResi.ekspedisi}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Kode Transaksi S-SALUR:</span>
                    <span className="font-bold text-slate-800 font-mono text-xs">{currentResi.kode || '-'}</span>
                  </div>
                </div>

                {/* Detected Via Status Banner */}
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Terdeteksi Via Transaksi:</span>
                    <span className="font-bold px-2 py-0.5 rounded-md bg-teal-50 text-[#008d91] border border-teal-200">
                      {detectedVia.namaVia} ({detectedVia.tipe})
                    </span>
                  </div>
                  {detectedVia.namaVia.toLowerCase().includes('tokopedia') ? (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                      ⚠️ Tokopedia (Akan dilewati)
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      ✓ CC / Store (Akan dikirim)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Custom Input override */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Nama Penerima / Pembeli</label>
                <input
                  type="text"
                  value={simulatedRecipientName}
                  onChange={(e) => setSimulatedRecipientName(e.target.value)}
                  placeholder={currentResi?.nama || 'Suparman'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Nomor WhatsApp Tujuan</label>
                <input
                  type="text"
                  value={simulatedPhone}
                  onChange={(e) => setSimulatedPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            {/* Test rules buttons */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-700 block">
                Pilih Aturan untuk Diuji Coba:
              </label>
              <div className="space-y-2">
                {rules.map((rule) => {
                  const isAllowed = isViaAllowedByRule(rule, detectedVia);

                  return (
                    <div
                      key={rule.id}
                      className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{rule.namaAturan}</span>
                          {isAllowed ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                              ✓ Diizinkan untuk {detectedVia.namaVia}
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-md">
                              ✕ Dilewati untuk {detectedVia.namaVia}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Template: {rule.templatePmName}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSimulateSend(rule)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                          isAllowed
                            ? 'bg-[#008d91] text-white hover:bg-[#007a7e]'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        {isAllowed ? 'Uji Kirim' : 'Uji (Dilewati)'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Phone Screen Real Preview */}
          <div className="lg:col-span-6 flex flex-col justify-start items-center">
            <div className="w-full max-w-md bg-[#111b21] rounded-3xl p-3 shadow-xl border-4 border-slate-800">
              {/* Phone Status Bar */}
              <div className="flex items-center justify-between px-3 py-1 text-slate-400 text-[10px]">
                <span>14:20</span>
                <span className="font-semibold">WhatsApp Business</span>
                <span>📶 100%</span>
              </div>

              {/* Chat Header */}
              <div className="bg-[#202c33] p-3 rounded-2xl flex items-center justify-between text-white">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#008d91] flex items-center justify-center font-bold text-xs">
                    S
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-slate-100">
                      SAPA Customer Care (S-SALUR)
                    </span>
                    <span className="text-[10px] text-emerald-400 block">Akun Resmi Terverifikasi</span>
                  </div>
                </div>
                <div className="text-slate-400 text-xs">⋮</div>
              </div>

              {/* Chat Bubble Area */}
              <div className="bg-[#0b141a] p-4 min-h-[360px] rounded-b-2xl flex flex-col justify-end space-y-3">
                {/* Bubble 1: Resi Message */}
                <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-xs text-xs space-y-2 max-w-[92%] self-end shadow-md">
                  <div className="text-[10px] text-emerald-200 font-semibold border-b border-emerald-600/40 pb-1">
                    📦 PEMBERITAHUAN RESI PENGIRIMAN
                  </div>
                  <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-100">
                    {renderTemplateMessage(
                      templates.find((t) => t.id === 'tpm-resi-salur')?.isiPesan ||
                        'Namo Buddhaya [Nama Lengkap], pesanan dengan No. Resi [No Resi] telah dikirimkan via [Ekspedisi].',
                      {
                        nama: simulatedRecipientName || currentResi?.nama || 'Suparman',
                        resi: currentResi?.resi || '11LP1636545251274',
                        ekspedisi: currentResi?.ekspedisi || 'LION',
                        kode: currentResi?.kode || '2021 CC 4451003223',
                        tujuan: currentResi?.tujuan || 'Mataram, Lombok',
                        tanggal: currentResi?.tanggal || '10 Nov 2021',
                      }
                    )}
                  </p>
                  <div className="flex justify-end items-center gap-1 text-[9px] text-emerald-200 pt-0.5">
                    <span>14:20</span>
                    <span>✓✓</span>
                  </div>
                </div>

                {/* Bubble 2: 1 Month Testimonial Invitation Message */}
                <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-xs text-xs space-y-2 max-w-[92%] self-end shadow-md">
                  <div className="text-[10px] text-amber-300 font-semibold border-b border-emerald-600/40 pb-1 flex items-center justify-between">
                    <span>🌟 AJAKAN TESTIMONI (1 BULAN)</span>
                    <span className="text-[9px] bg-amber-400/20 text-amber-200 px-1.5 py-0.2 rounded-md">
                      Auto 1 Bulan
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-slate-100">
                    {renderTemplateMessage(
                      templates.find((t) => t.id === 'tpm-testimoni-salur')?.isiPesan ||
                        'Namo Buddhaya [Nama Lengkap], kami ingin mendengar kesan membaca Anda setelah 1 bulan menerima buku Dharma.',
                      {
                        nama: simulatedRecipientName || currentResi?.nama || 'Suparman',
                        resi: currentResi?.resi || '11LP1636545251274',
                        ekspedisi: currentResi?.ekspedisi || 'LION',
                      }
                    )}
                  </p>
                  <div className="flex justify-end items-center gap-1 text-[9px] text-emerald-200 pt-0.5">
                    <span>10 Des 2021 10:00</span>
                    <span>✓✓</span>
                  </div>
                </div>
              </div>

              {/* Chat Input simulator */}
              <div className="bg-[#202c33] p-2 rounded-xl flex items-center justify-between text-slate-400 text-xs mt-1">
                <span className="text-[11px] text-slate-500 pl-2">Ketik pesan...</span>
                <div className="w-7 h-7 rounded-full bg-[#00a884] text-white flex items-center justify-center">
                  <Send className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOGS & QUEUE */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Riwayat & Antrean Chat Otomatis S-SALUR
              </h3>
              <p className="text-xs text-slate-500">
                Log eksekusi pengiriman pesan resi saat diinput & jadwal ajakan testimoni 1 bulan
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setLogs(loadChatAutoLogs());
                  onShowToast('Data log berhasil diperbarui');
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Refresh Log
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-[#f8fafc] text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Penerima & Resi</th>
                  <th className="py-3 px-4">Via Transaksi S-SALUR</th>
                  <th className="py-3 px-4">Aturan & Template PM</th>
                  <th className="py-3 px-4">Jadwal Kirim</th>
                  <th className="py-3 px-4">Status Pengiriman</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const isTokopedia = log.viaNama.toLowerCase().includes('tokopedia');
                  const isSent = log.status === 'Terkirim';
                  const isScheduled = log.status === 'Terjadwal';
                  const isSkipped = log.status === 'Dilewati';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{log.namaPenerima}</div>
                        <div className="text-[11px] font-mono text-slate-500">{log.resi} ({log.ekspedisi})</div>
                        <div className="text-[10px] text-slate-400">{log.nomorHp}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-md text-[11px] inline-block ${
                            isTokopedia
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-teal-50 text-[#008d91] border border-teal-200'
                          }`}
                        >
                          {log.viaNama}
                        </span>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">{log.kodeTransaksi}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{log.ruleNama}</div>
                        <div className="text-[11px] text-[#008d91]">{log.templatePmName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-700">{log.jadwalKirim}</div>
                        <div className="text-[10px] text-slate-400">Resi masuk: {log.tanggalInputResi}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {isSent && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Terkirim
                          </span>
                        )}
                        {isScheduled && (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Terjadwal (1 Bulan)
                          </span>
                        )}
                        {isSkipped && (
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <X className="w-3 h-3" />
                            Dilewati ({log.viaNama})
                          </span>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1 max-w-xs">{log.alasanStatus}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(log.isiPesan);
                              onShowToast('Isi pesan disalin ke clipboard');
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                            title="Salin Pesan"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {log.nomorHp && (
                            <a
                              href={`https://wa.me/${log.nomorHp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(log.isiPesan)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-700 flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              WhatsApp
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Rule */}
      <AddEditChatAutoRuleModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRule(null);
        }}
        onSave={handleSaveRule}
        ruleToEdit={editingRule}
        templates={templates}
        viaList={viaList}
        onShowToast={onShowToast}
      />
    </div>
  );
};
