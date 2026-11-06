import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Check,
  X,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Truck,
  Send,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Search,
} from 'lucide-react';
import {
  AutoInputSalurRule,
  AutoInputSalurLog,
  loadAutoInputSalurRules,
  saveAutoInputSalurRules,
  loadAutoInputSalurLogs,
  saveAutoInputSalurLogs,
  executeAutoInputSalurRules,
  calculateTargetDate,
  formatIndonesianDate,
} from '../autoInputSalurRulesData';
import { SalurOrder } from '../salurData';
import { TemplatePMItem, ListPMItem } from '../types';
import { INITIAL_VIA_TRANSAKSI_SALUR } from '../viaSalurData';

interface AutoInputListPMSalurViewProps {
  templatePMList: TemplatePMItem[];
  salurOrders: SalurOrder[];
  onAddListPMItems: (newItems: ListPMItem[]) => void;
  onShowToast: (msg: string) => void;
  onNavigateToListPM?: () => void;
}

export const AutoInputListPMSalurView: React.FC<AutoInputListPMSalurViewProps> = ({
  templatePMList,
  salurOrders,
  onAddListPMItems,
  onShowToast,
  onNavigateToListPM,
}) => {
  const [rules, setRules] = useState<AutoInputSalurRule[]>(() => loadAutoInputSalurRules());
  const [logs, setLogs] = useState<AutoInputSalurLog[]>(() => loadAutoInputSalurLogs());
  const [activeTab, setActiveTab] = useState<'rules' | 'simulation' | 'logs'>('rules');

  // Modal Add / Edit Rule State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutoInputSalurRule | null>(null);

  // Form State for Rule
  const [namaAturan, setNamaAturan] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [targetTab, setTargetTab] = useState<'sudah' | 'belum'>('sudah');
  const [delayType, setDelayType] = useState<'langsung' | 'custom_delay'>('langsung');
  const [delayAmount, setDelayAmount] = useState<number>(1);
  const [delayUnit, setDelayUnit] = useState<'hari' | 'minggu' | 'bulan' | 'tahun'>('bulan');
  const [applyToAllVia, setApplyToAllVia] = useState<boolean>(false);
  const [selectedViaList, setSelectedViaList] = useState<string[]>(['Call Center']);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpm-2');
  const [proyekSapa, setProyekSapa] = useState('Kirim Resi');
  const [proyekKode, setProyekKode] = useState('MAD');
  const [dihubungiOleh, setDihubungiOleh] = useState('Call Center SAPA');

  // Simulation State
  const [selectedSimOrderId, setSelectedSimOrderId] = useState<string>(
    salurOrders[0]?.id || ''
  );
  const [simResi, setSimResi] = useState('LP88' + Math.floor(10000000 + Math.random() * 90000000));
  const [simResults, setSimResults] = useState<{ items: ListPMItem[]; logs: AutoInputSalurLog[] } | null>(null);

  // Available via options
  const allViaOptions = INITIAL_VIA_TRANSAKSI_SALUR.map((v) => v.namaVia);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingRule(null);
    setNamaAturan('');
    setKeterangan('');
    setTargetTab('sudah');
    setDelayType('langsung');
    setDelayAmount(1);
    setDelayUnit('bulan');
    setApplyToAllVia(false);
    setSelectedViaList(['Call Center', 'Website Store', 'Form Buku Tidak Berbayar']);
    setSelectedTemplateId(templatePMList[0]?.id || 'tpm-2');
    setProyekSapa('Kirim Resi');
    setProyekKode('MAD');
    setDihubungiOleh('Call Center SAPA');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (rule: AutoInputSalurRule) => {
    setEditingRule(rule);
    setNamaAturan(rule.namaAturan);
    setKeterangan(rule.keterangan || '');
    setTargetTab(rule.targetTab);
    setDelayType(rule.delayType);
    setDelayAmount(rule.delayAmount || 1);
    setDelayUnit(rule.delayUnit || 'bulan');
    setApplyToAllVia(rule.applyToAllVia);
    setSelectedViaList(rule.viaTransaksiSalur || []);
    setSelectedTemplateId(rule.templatePMId);
    setProyekSapa(rule.proyekSapa);
    setProyekKode(rule.proyekKode);
    setDihubungiOleh(rule.dihubungiOleh);
    setIsModalOpen(true);
  };

  // Toggle active rule
  const handleToggleAktif = (ruleId: string) => {
    const updated = rules.map((r) =>
      r.id === ruleId ? { ...r, aktif: !r.aktif } : r
    );
    setRules(updated);
    saveAutoInputSalurRules(updated);
    const target = updated.find((r) => r.id === ruleId);
    onShowToast(`Aturan "${target?.namaAturan}" ${target?.aktif ? 'diaktifkan' : 'dinonaktifkan'}`);
  };

  // Delete rule
  const handleDeleteRule = (ruleId: string) => {
    const target = rules.find((r) => r.id === ruleId);
    const updated = rules.filter((r) => r.id !== ruleId);
    setRules(updated);
    saveAutoInputSalurRules(updated);
    onShowToast(`Aturan "${target?.namaAturan}" berhasil dihapus`);
  };

  // Save Rule from Modal
  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaAturan.trim()) {
      onShowToast('Nama aturan wajib diisi');
      return;
    }

    if (editingRule) {
      const updated: AutoInputSalurRule[] = rules.map((r) =>
        r.id === editingRule.id
          ? {
              ...r,
              namaAturan: namaAturan.trim(),
              keterangan: keterangan.trim(),
              targetTab,
              delayType,
              delayAmount: delayType === 'langsung' ? 0 : Number(delayAmount) || 1,
              delayUnit,
              applyToAllVia,
              viaTransaksiSalur: applyToAllVia ? [] : selectedViaList,
              templatePMId: selectedTemplateId,
              proyekSapa,
              proyekKode,
              dihubungiOleh,
            }
          : r
      );
      setRules(updated);
      saveAutoInputSalurRules(updated);
      onShowToast(`Aturan "${namaAturan}" berhasil diperbarui`);
    } else {
      const newRule: AutoInputSalurRule = {
        id: `rule-${Date.now()}`,
        namaAturan: namaAturan.trim(),
        keterangan: keterangan.trim(),
        aktif: true,
        triggerEvent: 'input_no_resi',
        targetTab,
        delayType,
        delayAmount: delayType === 'langsung' ? 0 : Number(delayAmount) || 1,
        delayUnit,
        applyToAllVia,
        viaTransaksiSalur: applyToAllVia ? [] : selectedViaList,
        templatePMId: selectedTemplateId,
        proyekSapa,
        proyekKode,
        dihubungiOleh,
        dihubungiOlehType: 'call_center',
        createdAt: formatIndonesianDate(new Date()),
      };
      const updated = [newRule, ...rules];
      setRules(updated);
      saveAutoInputSalurRules(updated);
      onShowToast(`Aturan baru "${namaAturan}" berhasil ditambahkan`);
    }

    setIsModalOpen(false);
  };

  // Toggle Via checkbox
  const handleToggleVia = (viaName: string) => {
    if (selectedViaList.includes(viaName)) {
      setSelectedViaList(selectedViaList.filter((v) => v !== viaName));
    } else {
      setSelectedViaList([...selectedViaList, viaName]);
    }
  };

  // Run Simulation
  const handleRunSimulation = () => {
    const targetOrder = salurOrders.find((o) => o.id === selectedSimOrderId);
    if (!targetOrder) {
      onShowToast('Pilih pesanan terlebih dahulu');
      return;
    }
    const result = executeAutoInputSalurRules(
      targetOrder,
      simResi.trim() || '11LP1636545419847',
      rules,
      templatePMList,
      new Date()
    );
    setSimResults(result);
    if (result.items.length === 0) {
      onShowToast('Tidak ada aturan aktif yang cocok dengan Via pesanan ini');
    } else {
      onShowToast(`Berhasil mencocokkan ${result.items.length} aturan automasi!`);
    }
  };

  // Apply Simulation to Real List PM
  const handleApplySimulationToListPM = () => {
    if (!simResults || simResults.items.length === 0) return;
    onAddListPMItems(simResults.items);

    const updatedLogs = [...simResults.logs, ...logs];
    setLogs(updatedLogs);
    saveAutoInputSalurLogs(updatedLogs);

    onShowToast(`${simResults.items.length} pesan berhasil dimasukkan ke List PM!`);
  };

  // Clear Logs
  const handleClearLogs = () => {
    setLogs([]);
    saveAutoInputSalurLogs([]);
    onShowToast('Riwayat log berhasil dibersihkan');
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-100 min-h-[580px] flex flex-col justify-between transition-all">
      <div>
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#00897b] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                Auto Input List PM Khusus S-SALUR
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-100/80 text-[#00796b]">
                S-SALUR
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Atur pesan broadcast otomatis yang langsung masuk ke <strong>List PM</strong> saat nomor resi diinput.
              Atur via pengiriman yang dikirim (misal: Call Center dikirim, Tokopedia tidak dikirim), jeda waktu hubungi (contoh: 1 bulan untuk testimoni), serta tab target ("Sudah bisa di-PM" vs "Belum bisa di-PM").
            </p>
          </div>

          {/* Action buttons on top */}
          <div className="flex items-center gap-2.5 shrink-0">
            {onNavigateToListPM && (
              <button
                type="button"
                onClick={onNavigateToListPM}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#00897b]" />
                <span>Buka List PM</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="bg-[#00897b] hover:bg-[#00796b] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Aturan Baru</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 pt-5 pb-6">
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs flex items-center gap-2 ${
              activeTab === 'rules'
                ? 'bg-[#00897b] text-white'
                : 'bg-[#a0a8ad] text-white hover:bg-[#929a9f]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Aturan Automasi ({rules.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('simulation')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs flex items-center gap-2 ${
              activeTab === 'simulation'
                ? 'bg-[#00897b] text-white'
                : 'bg-[#a0a8ad] text-white hover:bg-[#929a9f]'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Simulasi & Test Trigger</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'bg-[#00897b] text-white'
                : 'bg-[#a0a8ad] text-white hover:bg-[#929a9f]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Riwayat Eksekusi ({logs.length})</span>
          </button>
        </div>

        {/* TAB 1: RULES LIST */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            {rules.map((rule, idx) => {
              const matchedTemplate = templatePMList.find((t) => t.id === rule.templatePMId);
              const previewDate = calculateTargetDate(
                new Date(),
                rule.delayType,
                rule.delayAmount,
                rule.delayUnit
              );

              return (
                <div
                  key={rule.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    rule.aktif
                      ? 'bg-white border-slate-200 shadow-2xs hover:border-[#00897b]/40'
                      : 'bg-slate-50/70 border-slate-200/60 opacity-80'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left: Info & Badges */}
                    <div className="space-y-2.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-teal-50 text-[#00897b] font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h3 className="font-bold text-slate-800 text-base">
                          {rule.namaAturan}
                        </h3>

                        {/* Status Aktif Switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleAktif(rule.id)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            rule.aktif
                              ? 'bg-teal-50 text-[#00897b] hover:bg-teal-100'
                              : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${rule.aktif ? 'bg-[#00897b]' : 'bg-slate-400'}`} />
                          <span>{rule.aktif ? 'Aktif' : 'Non-aktif'}</span>
                        </button>

                        {/* Target Tab Badge */}
                        {rule.targetTab === 'sudah' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Tab: Sudah bisa di-PM</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Tab: Belum bisa di-PM</span>
                          </span>
                        )}

                        {/* Delay Pill */}
                        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                          {rule.delayType === 'langsung'
                            ? '⚡ Langsung Hari Ini'
                            : `⏳ Jeda: ${rule.delayAmount} ${rule.delayUnit} (${formatIndonesianDate(previewDate)})`}
                        </span>
                      </div>

                      {rule.keterangan && (
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {rule.keterangan}
                        </p>
                      )}

                      {/* Via Transaksi Filter */}
                      <div className="pt-1">
                        <div className="text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-[#00897b]" />
                          <span>Via Transaksi S-SALUR Yang Dikirim:</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {rule.applyToAllVia ? (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-[#00897b]">
                              Semua Via Transaksi S-SALUR
                            </span>
                          ) : (
                            <>
                              {rule.viaTransaksiSalur.map((via) => (
                                <span
                                  key={via}
                                  className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60"
                                >
                                  ✓ {via}
                                </span>
                              ))}
                              {/* Highlight Tokopedia & Shopee if excluded */}
                              {!rule.viaTransaksiSalur.includes('Tokopedia') && (
                                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                                  ✕ Tokopedia (Dikecualikan)
                                </span>
                              )}
                              {!rule.viaTransaksiSalur.includes('Shopee') && (
                                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                                  ✕ Shopee (Dikecualikan)
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Template Info Preview */}
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-semibold text-slate-700">
                            Template PM: {matchedTemplate?.namaTemplate || rule.templatePMId}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Proyek: {rule.proyekSapa} ({rule.proyekKode})
                          </span>
                        </div>
                        <p className="text-slate-500 line-clamp-2 italic">
                          "{matchedTemplate?.isiPesan || 'Format pesan...'}"
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex lg:flex-col items-center gap-2 pt-2 lg:pt-0 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(rule)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Edit Aturan"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-xs font-semibold text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Hapus Aturan"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: SIMULASI / TEST TRIGGER */}
        {activeTab === 'simulation' && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Play className="w-4 h-4 text-[#00897b]" />
                <span>Uji Coba Otomatisasi Input Nomor Resi</span>
              </h3>
              <p className="text-xs text-slate-600">
                Pilih salah satu transaksi S-SALUR untuk menguji aturan automasi mana saja yang cocok dengan Via Transaksinya dan bagaimana data pesan akan masuk ke List PM.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Transaksi S-SALUR
                  </label>
                  <select
                    value={selectedSimOrderId}
                    onChange={(e) => setSelectedSimOrderId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#00897b]"
                  >
                    {salurOrders.map((ord) => (
                      <option key={ord.id} value={ord.id}>
                        {ord.orderNumber} - {ord.alamat?.recipientName} ({ord.via || 'Via CC'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Simulasi No Resi Diinput
                  </label>
                  <input
                    type="text"
                    value={simResi}
                    onChange={(e) => setSimResi(e.target.value)}
                    placeholder="Contoh: 11LP1636545419847"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#00897b] font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleRunSimulation}
                  className="bg-[#00897b] hover:bg-[#00796b] text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Jalankan Simulasi</span>
                </button>

                {simResults && simResults.items.length > 0 && (
                  <button
                    type="button"
                    onClick={handleApplySimulationToListPM}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Kirim Hasil ke List PM ({simResults.items.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Simulation Results Preview */}
            {simResults && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Hasil Simulasi ({simResults.items.length} Pesan Terbentuk)
                </h4>
                {simResults.items.length === 0 ? (
                  <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center text-xs text-amber-800">
                    Tidak ada aturan yang cocok untuk pesanan ini. Pastikan Via Transaksi pesanan dicentang pada aturan automasi.
                  </div>
                ) : (
                  simResults.items.map((item, i) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">
                          {i + 1}. {item.proyekSapa}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              item.statusBisaPM === 'sudah'
                                ? 'bg-teal-50 text-[#00897b]'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            Masuk Tab: {item.statusBisaPM === 'sudah' ? 'Sudah bisa di-PM' : 'Belum bisa di-PM'}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                            Tanggal PM: {item.tanggalMulaiPM}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-600">
                        <strong>Penerima:</strong> {item.singleTarget?.nama} ({item.singleTarget?.nomorHp})
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs font-mono whitespace-pre-line text-slate-700">
                        {item.templatePesan}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LOGS / HISTORY */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                Menampilkan {logs.length} riwayat automasi nomor resi yang telah masuk ke List PM
              </span>
              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="text-xs text-rose-600 hover:underline cursor-pointer"
                >
                  Bersihkan Riwayat Log
                </button>
              )}
            </div>

            {logs.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs sm:text-sm">
                Belum ada riwayat automasi resi. Saat nomor resi diinput pada transaksi S-SALUR, riwayat akan otomatis tercatat di sini.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Tanggal Input</th>
                      <th className="py-3 px-4">No. Pesanan & Via</th>
                      <th className="py-3 px-4">Penerima</th>
                      <th className="py-3 px-4">No. Resi</th>
                      <th className="py-3 px-4">Aturan Terpicu</th>
                      <th className="py-3 px-4">Target Tab</th>
                      <th className="py-3 px-4">Tanggal Hubungi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-medium text-slate-600">
                          {log.tanggalInput}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{log.orderNumber}</div>
                          <div className="text-[11px] text-slate-400">{log.orderVia}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{log.penerimaNama}</div>
                          <div className="text-[11px] text-slate-400">{log.penerimaHp}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-[#00897b]">
                          {log.noResi}
                          <div className="text-[11px] font-sans text-slate-400 font-normal">
                            {log.ekspedisi}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium">
                          {log.ruleNama}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              log.targetTab === 'sudah'
                                ? 'bg-teal-50 text-[#00897b]'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {log.targetTab === 'sudah' ? 'Sudah bisa di-PM' : 'Belum bisa di-PM'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {log.tanggalMulaiPM}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL: Tambah / Edit Aturan Automasi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#00897b] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <h3 className="text-base font-bold">
                  {editingRule ? 'Edit Aturan Automasi S-SALUR' : 'Tambah Aturan Automasi S-SALUR'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveRule} className="p-6 overflow-y-auto space-y-4">
              {/* Nama Aturan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Aturan Automasi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemberitahuan Nomor Resi Pengiriman"
                  value={namaAturan}
                  onChange={(e) => setNamaAturan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#00897b]"
                />
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan / Deskripsi
                </label>
                <input
                  type="text"
                  placeholder="Deskripsi singkat tujuan automasi ini"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#00897b]"
                />
              </div>

              {/* Target Tab di List PM */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Target Tab di "List PM"
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      targetTab === 'sudah'
                        ? 'bg-teal-50/70 border-[#00897b] text-[#00897b]'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="modalTargetTab"
                      checked={targetTab === 'sudah'}
                      onChange={() => setTargetTab('sudah')}
                      className="mt-0.5 text-[#00897b]"
                    />
                    <div>
                      <div className="text-xs font-bold">Tab "Sudah bisa di-PM"</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Cocok untuk pesan langsung seperti pemberitahuan no resi yang segera dikirimkan.
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      targetTab === 'belum'
                        ? 'bg-rose-50/70 border-rose-500 text-rose-700'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="modalTargetTab"
                      checked={targetTab === 'belum'}
                      onChange={() => setTargetTab('belum')}
                      className="mt-0.5 text-rose-600"
                    />
                    <div>
                      <div className="text-xs font-bold">Tab "Belum bisa di-PM"</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Cocok untuk follow-up seperti ajakan testimoni 1 bulan dari no resi diinput.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Jeda Waktu / Delay */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
                <label className="block text-xs font-bold text-slate-700">
                  Waktu Mulai Dihubungi (Delay dari Input Resi)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      delayType === 'langsung'
                        ? 'bg-white border-[#00897b] text-[#00897b] font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="modalDelayType"
                      checked={delayType === 'langsung'}
                      onChange={() => setDelayType('langsung')}
                      className="text-[#00897b]"
                    />
                    <span className="text-xs">Langsung Hari Ini (0 Jeda)</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      delayType === 'custom_delay'
                        ? 'bg-white border-[#00897b] text-[#00897b] font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="modalDelayType"
                      checked={delayType === 'custom_delay'}
                      onChange={() => setDelayType('custom_delay')}
                      className="text-[#00897b]"
                    />
                    <span className="text-xs">Jeda Waktu Tertentu</span>
                  </label>
                </div>

                {delayType === 'custom_delay' && (
                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-28">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={delayAmount}
                        onChange={(e) => setDelayAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 text-center"
                      />
                    </div>
                    <div className="w-36">
                      <select
                        value={delayUnit}
                        onChange={(e) => setDelayUnit(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                      >
                        <option value="hari">Hari</option>
                        <option value="minggu">Minggu</option>
                        <option value="bulan">Bulan</option>
                        <option value="tahun">Tahun</option>
                      </select>
                    </div>
                    <span className="text-xs text-slate-500">
                      setelah nomor resi diinput
                    </span>
                  </div>
                )}
              </div>

              {/* Filter Via Transaksi S-SALUR */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Filter Via Transaksi S-SALUR
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyToAllVia}
                      onChange={(e) => setApplyToAllVia(e.target.checked)}
                      className="rounded-sm text-[#00897b]"
                    />
                    <span>Kirim ke semua via</span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">
                  Centang via transaksi yang diizinkan untuk mengirim pesan ini. Contoh: jika Call Center (CC) dicentang dan Tokopedia tidak dicentang, maka transaksi Tokopedia tidak akan mengirim pesan ini.
                </p>

                {!applyToAllVia && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-36 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200/60">
                    {allViaOptions.map((via) => {
                      const isChecked = selectedViaList.includes(via);
                      return (
                        <label
                          key={via}
                          className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                            isChecked ? 'bg-teal-50 text-[#00897b] font-semibold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleVia(via)}
                            className="rounded-sm text-[#00897b]"
                          />
                          <span className="truncate">{via}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Template PM Terkait */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Template PM yang Digunakan
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-[#00897b]"
                >
                  {templatePMList.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.namaTemplate} ({tpl.kegiatan || 'Template'})
                    </option>
                  ))}
                </select>
                {(() => {
                  const currTemplate = templatePMList.find((t) => t.id === selectedTemplateId);
                  if (!currTemplate) return null;
                  return (
                    <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 italic whitespace-pre-line max-h-24 overflow-y-auto">
                      {currTemplate.isiPesan}
                    </div>
                  );
                })()}
              </div>

              {/* Proyek SAPA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Proyek SAPA
                  </label>
                  <input
                    type="text"
                    value={proyekSapa}
                    onChange={(e) => setProyekSapa(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dihubungi Oleh
                  </label>
                  <input
                    type="text"
                    value={dihubungiOleh}
                    onChange={(e) => setDihubungiOleh(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#00897b] hover:bg-[#00796b] rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingRule ? 'Simpan Perubahan' : 'Tambahkan Aturan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
