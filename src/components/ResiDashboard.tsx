import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Plus,
  MoreVertical,
  Copy,
  Edit2,
  Trash2,
  Link2,
  X,
  Truck,
  Check,
  MessageSquareText,
} from 'lucide-react';
import {
  ResiItem,
  loadResiItems,
  saveResiItems,
  formatRupiahTarif,
} from '../resiData';
import { AgenResiItem, loadAgenResiItems } from '../agenResiData';
import { SalurOrder } from '../salurData';
import {
  detectViaFromKode,
  isViaAllowedByRule,
  loadChatAutoRules,
  loadChatAutoLogs,
  saveChatAutoLogs,
  renderTemplateMessage,
  syncChatAutoRulesToListPM,
  ChatAutoLogItem,
} from '../chatAutoSalurData';
import { loadTemplatePM } from '../templatePMData';

interface ResiDashboardProps {
  salurOrders?: SalurOrder[];
  agenResiList?: AgenResiItem[];
  onShowToast: (msg: string) => void;
  onNavigateToTransaksiSalur?: () => void;
  onNavigateToChatAutoSalur?: () => void;
}

export const ResiDashboard: React.FC<ResiDashboardProps> = ({
  salurOrders = [],
  agenResiList,
  onShowToast,
  onNavigateToTransaksiSalur,
  onNavigateToChatAutoSalur,
}) => {
  const agens = agenResiList && agenResiList.length > 0 ? agenResiList : loadAgenResiItems();
  const [resiList, setResiList] = useState<ResiItem[]>(() => loadResiItems());
  const [activePill, setActivePill] = useState<string>(() => {
    const initialAgens = loadAgenResiItems();
    return initialAgens[0]?.id || 'all';
  });
  const [isMasked, setIsMasked] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Link Transaksi S-SALUR Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedResiForLink, setSelectedResiForLink] = useState<ResiItem | null>(null);
  const [inputKodeTransaksi, setInputKodeTransaksi] = useState('');

  // Add / Edit Resi Modal State
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingResi, setEditingResi] = useState<ResiItem | null>(null);
  const [formData, setFormData] = useState({
    tanggal: '10 Nov 2021',
    nama: '',
    ekspedisi: 'LION',
    resi: '',
    tujuan: '',
    berat: 1,
    tarif: 10000,
    kode: '',
    dropPoint: 'LION Jurang',
  });

  // Selected Agen Resi for filtering
  const selectedAgen =
    activePill === 'all'
      ? null
      : agens.find(
          (a) => a.id === activePill || a.namaAgen.toLowerCase() === activePill.toLowerCase()
        );

  // Filtered resi items
  const filteredList = resiList.filter((item) => {
    if (selectedAgen) {
      const agenNameNorm = selectedAgen.namaAgen.trim().toLowerCase();
      const itemDropNorm = (item.dropPoint || '').trim().toLowerCase();
      const matchDropPoint =
        itemDropNorm === agenNameNorm ||
        (itemDropNorm && (itemDropNorm.includes(agenNameNorm) || agenNameNorm.includes(itemDropNorm)));

      if (!matchDropPoint) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNama = item.nama.toLowerCase().includes(q);
      const matchResi = item.resi.toLowerCase().includes(q);
      const matchTujuan = item.tujuan.toLowerCase().includes(q);
      const matchEkspedisi = item.ekspedisi.toLowerCase().includes(q);
      const matchKode = (item.kode || '').toLowerCase().includes(q);
      return matchNama || matchResi || matchTujuan || matchEkspedisi || matchKode;
    }
    return true;
  });

  // Open Link Transaksi modal
  const handleOpenLinkModal = (item: ResiItem) => {
    setSelectedResiForLink(item);
    setInputKodeTransaksi(item.kode || '');
    setIsLinkModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSaveLinkTransaksi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResiForLink) return;
    const kodeToSave = inputKodeTransaksi.trim();

    const updated = resiList.map((r) =>
      r.id === selectedResiForLink.id ? { ...r, kode: kodeToSave } : r
    );
    setResiList(updated);
    saveResiItems(updated);
    setIsLinkModalOpen(false);
    setSelectedResiForLink(null);
    onShowToast(
      kodeToSave
        ? `Kode Transaksi S-SALUR "${kodeToSave}" berhasil dihubungkan`
        : 'Kode Transaksi S-SALUR dihapus'
    );
  };

  // Open Add modal
  const handleOpenAddModal = () => {
    setEditingResi(null);
    const currentActiveAgen = agens.find(
      (a) => a.id === activePill || a.namaAgen.toLowerCase() === activePill.toLowerCase()
    );
    const dropPointPrefill = currentActiveAgen ? currentActiveAgen.namaAgen : (agens[0]?.namaAgen || 'LION Jurang');
    setFormData({
      tanggal: '10 Nov 2021',
      nama: '',
      ekspedisi: 'LION',
      resi: `11LP${Date.now().toString().slice(-8)}`,
      tujuan: '',
      berat: 1,
      tarif: 10000,
      kode: '',
      dropPoint: dropPointPrefill,
    });
    setIsAddEditModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEditModal = (item: ResiItem) => {
    setEditingResi(item);
    setFormData({
      tanggal: item.tanggal,
      nama: item.nama,
      ekspedisi: item.ekspedisi,
      resi: item.resi,
      tujuan: item.tujuan,
      berat: item.berat,
      tarif: item.tarif,
      kode: item.kode || '',
      dropPoint: item.dropPoint || agens[0]?.namaAgen || 'LION Jurang',
    });
    setIsAddEditModalOpen(true);
    setOpenMenuId(null);
  };

  // Save Add/Edit
  const handleSaveAddEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.resi.trim()) {
      onShowToast('Nama dan Nomor Resi wajib diisi');
      return;
    }

    if (editingResi) {
      const updated = resiList.map((r) =>
        r.id === editingResi.id
          ? {
              ...r,
              ...formData,
              berat: Number(formData.berat) || 1,
              tarif: Number(formData.tarif) || 0,
            }
          : r
      );
      setResiList(updated);
      saveResiItems(updated);
      onShowToast(`Resi ${formData.resi} berhasil diperbarui`);
    } else {
      const newItem: ResiItem = {
        id: `resi-${Date.now()}`,
        ...formData,
        berat: Number(formData.berat) || 1,
        tarif: Number(formData.tarif) || 0,
      };
      const updated = [newItem, ...resiList];
      setResiList(updated);
      saveResiItems(updated);
      onShowToast(`Resi ${formData.resi} berhasil ditambahkan`);

      // Evaluate Chat Auto Khusus S-SALUR rules
      try {
        const rules = loadChatAutoRules();
        const detectedVia = detectViaFromKode(newItem.kode);
        const templates = loadTemplatePM();
        const existingLogs = loadChatAutoLogs();
        const newLogsToAdd: ChatAutoLogItem[] = [];

        // 1. Check rule for 'saat_input_resi' (Pemberitahuan Resi saat diinput)
        const resiInputRule = rules.find((r) => r.pemicu === 'saat_input_resi' && r.aktif);
        if (resiInputRule) {
          const isAllowed = isViaAllowedByRule(resiInputRule, detectedVia);
          const tpl = templates.find((t) => t.id === resiInputRule.templatePmId) || templates[0];
          const msg = renderTemplateMessage(tpl?.isiPesan || '', {
            nama: newItem.nama,
            resi: newItem.resi,
            ekspedisi: newItem.ekspedisi,
            kode: newItem.kode,
            tujuan: newItem.tujuan,
            tanggal: newItem.tanggal,
          });

          newLogsToAdd.push({
            id: `log-${Date.now()}-resi`,
            ruleId: resiInputRule.id,
            ruleNama: resiInputRule.namaAturan,
            resi: newItem.resi,
            namaPenerima: newItem.nama,
            nomorHp: '+62 812-xxxx-xxxx',
            ekspedisi: newItem.ekspedisi,
            kodeTransaksi: newItem.kode || '-',
            viaNama: detectedVia.namaVia,
            templatePmId: resiInputRule.templatePmId,
            templatePmName: resiInputRule.templatePmName,
            isiPesan: msg,
            tanggalInputResi: newItem.tanggal,
            jadwalKirim: 'Langsung saat diinput',
            status: isAllowed ? 'Terkirim' : 'Dilewati',
            alasanStatus: isAllowed
              ? `Otomatis dikirim via WhatsApp (Via ${detectedVia.namaVia} aktif)`
              : `Dilewati sesuai aturan: transaksi via ${detectedVia.namaVia} tidak dikirimkan pemberitahuan resi`,
            timestamp: 'Baru saja',
          });

          if (isAllowed) {
            setTimeout(() => {
              onShowToast(`🚀 Chat Auto: Pemberitahuan Resi ${newItem.resi} terkirim ke ${newItem.nama} (${detectedVia.namaVia})`);
            }, 600);
          } else {
            setTimeout(() => {
              onShowToast(`ℹ️ Chat Auto: Pemberitahuan resi dilewati untuk transaksi via ${detectedVia.namaVia} (sesuai aturan)`);
            }, 600);
          }
        }

        // 2. Check rule for 'setelah_resi_diinput' (Ajakan Testimoni 1 Bulan)
        const testimoniRule = rules.find((r) => r.pemicu === 'setelah_resi_diinput' && r.aktif);
        if (testimoniRule) {
          const isAllowed = isViaAllowedByRule(testimoniRule, detectedVia);
          const tpl = templates.find((t) => t.id === testimoniRule.templatePmId) || templates[0];
          const msg = renderTemplateMessage(tpl?.isiPesan || '', {
            nama: newItem.nama,
            resi: newItem.resi,
            ekspedisi: newItem.ekspedisi,
            kode: newItem.kode,
            tujuan: newItem.tujuan,
            tanggal: newItem.tanggal,
          });

          newLogsToAdd.push({
            id: `log-${Date.now()}-testimoni`,
            ruleId: testimoniRule.id,
            ruleNama: testimoniRule.namaAturan,
            resi: newItem.resi,
            namaPenerima: newItem.nama,
            nomorHp: '+62 812-xxxx-xxxx',
            ekspedisi: newItem.ekspedisi,
            kodeTransaksi: newItem.kode || '-',
            viaNama: detectedVia.namaVia,
            templatePmId: testimoniRule.templatePmId,
            templatePmName: testimoniRule.templatePmName,
            isiPesan: msg,
            tanggalInputResi: newItem.tanggal,
            jadwalKirim: `1 Bulan setelah input (${testimoniRule.delayValue} ${testimoniRule.delayUnit})`,
            status: isAllowed ? 'Terjadwal' : 'Dilewati',
            alasanStatus: isAllowed
              ? `Terjadwal otomatis 1 bulan setelah input resi untuk ajakan testimoni`
              : `Dilewati: Transaksi via ${detectedVia.namaVia} tidak diaktifkan`,
            timestamp: 'Baru saja',
          });
        }

        if (newLogsToAdd.length > 0) {
          saveChatAutoLogs([...newLogsToAdd, ...existingLogs]);
        }

        // Auto-sync into List PM with the updated resi list
        syncChatAutoRulesToListPM(rules, updated);
      } catch (err) {
        console.warn('Chat auto check error:', err);
      }
    }
    setIsAddEditModalOpen(false);
  };

  // Delete
  const handleDelete = (item: ResiItem) => {
    const updated = resiList.filter((r) => r.id !== item.id);
    setResiList(updated);
    saveResiItems(updated);
    onShowToast(`Resi ${item.resi} berhasil dihapus`);
    setOpenMenuId(null);
  };

  // Copy resi
  const handleCopyResi = (resi: string) => {
    navigator.clipboard?.writeText(resi);
    onShowToast(`Nomor resi ${resi} disalin ke clipboard`);
    setOpenMenuId(null);
  };

  // Suggested / available Transaksi S-SALUR codes
  const availableOrdersList = [
    { kode: '2021 Store 4451003216', label: '2021 Store 4451003216 (Suparman)' },
    { kode: '2021 CC 4451003223', label: '2021 CC 4451003223 (Agus Jaya Putra)' },
    { kode: '2021 Store 4451003217', label: '2021 Store 4451003217 (Ardi)' },
    { kode: '2021 CC 4451003214', label: '2021 CC 4451003214 (Ayadi)' },
    { kode: '2021 CC 4451003221', label: '2021 CC 4451003221 (Kardianto)' },
    { kode: '2021 CC 4451003220', label: '2021 CC 4451003220 (Rudianto)' },
    { kode: '2021 CC 4451003235', label: '2021 CC 4451003235 (Denny Andinata)' },
    { kode: '2021 CC 4451003238', label: '2021 CC 4451003238 (Jessica Chandra)' },
    { kode: '2021 CC 4451003240', label: '2021 CC 4451003240 (Lawrence Anzela)' },
    ...salurOrders.map((o) => ({
      kode: o.orderNumber,
      label: `${o.orderNumber} (${o.alamat?.recipientName || o.customerCode})`,
    })),
  ];

  return (
    <div id="resi-dashboard" className="w-full flex flex-col space-y-6">
      {/* Top Filter and Actions Bar matching screenshot exactly */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        {/* Left Pills: All & Agen Resi */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="pill-filter-all"
            type="button"
            onClick={() => setActivePill('all')}
            className={`px-7 py-2 rounded-full font-medium text-xs sm:text-sm transition-all cursor-pointer shadow-xs ${
              activePill === 'all'
                ? 'bg-[#9ca3af] text-white'
                : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
            }`}
          >
            All
          </button>
          {agens.map((agen) => {
            const isActive = activePill === agen.id || activePill === agen.namaAgen;
            return (
              <button
                key={agen.id}
                id={`pill-filter-${agen.id}`}
                type="button"
                onClick={() => setActivePill(agen.id)}
                className={`px-5 py-2 rounded-full font-medium text-xs sm:text-sm transition-all cursor-pointer shadow-xs ${
                  isActive
                    ? 'bg-[#008d91] text-white'
                    : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {agen.namaAgen}
              </button>
            );
          })}
        </div>

        {/* Right Icon Buttons & + Add Button */}
        <div className="flex items-center gap-4">
          {/* Search Input (expandable) */}
          {isSearchOpen && (
            <div className="relative animate-in fade-in duration-150">
              <input
                id="input-search-resi"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari resi, nama, kode..."
                className="w-48 sm:w-64 pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:border-[#008d91]"
                autoFocus
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Eye Off Icon Button */}
          <button
            id="btn-toggle-mask-resi"
            type="button"
            onClick={() => {
              setIsMasked(!isMasked);
              onShowToast(isMasked ? 'Menampilkan teks lengkap' : 'Sensor data aktif');
            }}
            title={isMasked ? 'Tampilkan teks' : 'Sensor data'}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
          >
            {isMasked ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>

          {/* Search Icon Button */}
          <button
            id="btn-toggle-search-resi"
            type="button"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            title="Cari Data Resi"
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Sliders / Filter Icon Button */}
          <button
            id="btn-filter-sliders-resi"
            type="button"
            onClick={() => onShowToast('Filter ekspedisi & tanggal aktif')}
            title="Filter Lanjutan"
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>

          {/* Chat Auto Khusus S-SALUR Shortcut Button */}
          {onNavigateToChatAutoSalur && (
            <button
              type="button"
              onClick={onNavigateToChatAutoSalur}
              title="Pengaturan Chat Auto Khusus S-SALUR"
              className="px-3 py-2 rounded-lg sm:rounded-xl border border-[#008d91]/30 bg-teal-50/70 text-[#008d91] font-semibold text-xs hover:bg-teal-100/70 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <MessageSquareText className="w-4 h-4" />
              <span className="hidden md:inline">Chat Auto S-SALUR</span>
            </button>
          )}

          {/* + Add Button */}
          <button
            id="btn-add-resi"
            type="button"
            onClick={handleOpenAddModal}
            className="bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-sm px-5 py-2 rounded-lg sm:rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full bg-white rounded-2xl shadow-xs border border-slate-100 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1050px]">
          <thead>
            <tr className="border-b border-slate-100 text-slate-800 font-bold text-sm tracking-tight">
              <th className="py-4.5 pl-6 pr-3 font-semibold text-left">Tanggal</th>
              <th className="py-4.5 px-3 font-semibold text-left">Nama</th>
              <th className="py-4.5 px-3 font-semibold text-left">Ekspedisi</th>
              <th className="py-4.5 px-3 font-semibold text-left">Resi</th>
              <th className="py-4.5 px-3 font-semibold text-left">Tujuan</th>
              <th className="py-4.5 px-3 font-semibold text-center">Berat</th>
              <th className="py-4.5 px-3 font-semibold text-right">Tarif</th>
              <th className="py-4.5 px-3 font-semibold text-left">Kode</th>
              <th className="py-4.5 pr-6 pl-2 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/70 text-sm">
            {filteredList.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  Tidak ada data resi yang ditemukan
                </td>
              </tr>
            ) : (
              filteredList.map((item) => {
                const hasKode = Boolean(item.kode && item.kode.trim());

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Tanggal */}
                    <td className="py-4.5 pl-6 pr-3 text-slate-600 whitespace-nowrap align-top text-[13.5px]">
                      {item.tanggal}
                    </td>

                    {/* Nama */}
                    <td className="py-4.5 px-3 text-slate-800 font-medium whitespace-nowrap align-top text-[13.5px]">
                      {isMasked ? '••••••••' : item.nama}
                    </td>

                    {/* Ekspedisi */}
                    <td className="py-4.5 px-3 text-slate-700 whitespace-nowrap align-top text-[13.5px]">
                      {item.ekspedisi}
                    </td>

                    {/* Resi */}
                    <td className="py-4.5 px-3 text-slate-700 font-normal whitespace-nowrap align-top text-[13.5px]">
                      {isMasked ? '•••••••••••••' : item.resi}
                    </td>

                    {/* Tujuan */}
                    <td className="py-4.5 px-3 text-slate-600 max-w-[320px] leading-relaxed align-top text-[12.5px] uppercase">
                      {isMasked
                        ? '••••••••••••••••••••••••••••••••••••'
                        : item.tujuan}
                    </td>

                    {/* Berat */}
                    <td className="py-4.5 px-3 text-slate-700 text-center whitespace-nowrap align-top text-[13.5px]">
                      {item.berat}
                    </td>

                    {/* Tarif */}
                    <td className="py-4.5 px-3 text-slate-700 text-right whitespace-nowrap align-top text-[13.5px]">
                      {formatRupiahTarif(item.tarif)}
                    </td>

                    {/* Kode - "Kode adalah kode Transaksi S-SALUR" */}
                    <td className="py-4.5 px-3 text-slate-700 whitespace-nowrap align-top text-[13.5px]">
                      {hasKode ? (
                        <span
                          className="font-normal text-slate-700 hover:text-[#008d91] cursor-pointer"
                          onClick={() => handleOpenLinkModal(item)}
                          title="Klik untuk mengubah kode transaksi S-SALUR"
                        >
                          {item.kode}
                        </span>
                      ) : (
                        <button
                          id={`btn-add-transaksi-${item.id}`}
                          type="button"
                          onClick={() => handleOpenLinkModal(item)}
                          className="bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Transaksi</span>
                        </button>
                      )}
                    </td>

                    {/* Action Column */}
                    <td className="py-4.5 pr-6 pl-2 text-center align-top relative">
                      {/* Jessica Chandra (unlinked) does not have dots in screenshot, but we keep it clickable when user has kode or wants options */}
                      {hasKode ? (
                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId(openMenuId === item.id ? null : item.id)
                            }
                            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Opsi"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openMenuId === item.id && (
                            <div className="absolute right-0 top-8 z-30 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100">
                              <button
                                type="button"
                                onClick={() => handleCopyResi(item.resi)}
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                                <span>Salin No. Resi</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenLinkModal(item)}
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Link2 className="w-3.5 h-3.5 text-[#008d91]" />
                                <span>Ubah Kode S-SALUR</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(item)}
                                className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-amber-500" />
                                <span>Edit Resi</span>
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              <button
                                type="button"
                                onClick={() => handleDelete(item)}
                                className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                <span>Hapus Resi</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Hubungkan Transaksi S-SALUR */}
      {isLinkModalOpen && selectedResiForLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-[#008d91] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-white" />
                <h3 className="text-sm font-semibold">Hubungkan Transaksi S-SALUR</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLinkTransaksi} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <p className="text-slate-500">Penerima: <span className="font-semibold text-slate-700">{selectedResiForLink.nama}</span></p>
                <p className="text-slate-500">No. Resi: <span className="font-semibold text-slate-700">{selectedResiForLink.resi}</span></p>
                <p className="text-slate-500">Ekspedisi: <span className="font-semibold text-slate-700">{selectedResiForLink.ekspedisi}</span></p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pilih Kode Transaksi S-SALUR
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputKodeTransaksi}
                    onChange={(e) => setInputKodeTransaksi(e.target.value)}
                    placeholder="Contoh: 2021 CC 4451003238"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-[#008d91]"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Suggestions from existing Transaksi S-SALUR */}
              <div>
                <p className="text-[11px] font-medium text-slate-500 mb-1.5">
                  Atau pilih dari transaksi yang tersedia:
                </p>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {availableOrdersList.map((ord, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setInputKodeTransaksi(ord.kode)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        inputKodeTransaksi === ord.kode
                          ? 'bg-[#008d91]/10 text-[#008d91] font-semibold'
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="truncate">{ord.label}</span>
                      {inputKodeTransaksi === ord.kode && (
                        <Check className="w-3.5 h-3.5 text-[#008d91] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#008d91] hover:bg-[#05828e] rounded-xl shadow-xs cursor-pointer"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Resi */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
            <div className="px-5 py-4 bg-[#008d91] text-white flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {editingResi ? 'Edit Data Resi' : 'Tambah Data Resi Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddEdit} className="p-5 space-y-3.5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="text"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#008d91]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ekspedisi</label>
                  <input
                    type="text"
                    value={formData.ekspedisi}
                    onChange={(e) => setFormData({ ...formData, ekspedisi: e.target.value })}
                    placeholder="Contoh: LION, TIKI, JNE"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#008d91]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Penerima</label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Nama penerima paket"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#008d91]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor Resi</label>
                  <input
                    type="text"
                    value={formData.resi}
                    onChange={(e) => setFormData({ ...formData, resi: e.target.value })}
                    placeholder="Nomor resi pengiriman"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#008d91]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tujuan (Alamat Lengkap)</label>
                <textarea
                  rows={2}
                  value={formData.tujuan}
                  onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                  placeholder="Alamat tujuan pengiriman"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#008d91]"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Berat (Kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.berat}
                    onChange={(e) => setFormData({ ...formData, berat: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tarif (Rp)</label>
                  <input
                    type="number"
                    value={formData.tarif}
                    onChange={(e) => setFormData({ ...formData, tarif: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#008d91]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Drop Point</label>
                  <input
                    type="text"
                    list="agen-resi-datalist"
                    value={formData.dropPoint}
                    onChange={(e) => setFormData({ ...formData, dropPoint: e.target.value })}
                    placeholder={agens[0]?.namaAgen || 'LION Jurang'}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#008d91]"
                  />
                  <datalist id="agen-resi-datalist">
                    {agens.map((a) => (
                      <option key={a.id} value={a.namaAgen} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Transaksi S-SALUR (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.kode}
                  onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                  placeholder="Contoh: 2021 CC 4451003238"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#008d91]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#008d91] hover:bg-[#05828e] rounded-xl shadow-xs cursor-pointer"
                >
                  {editingResi ? 'Simpan Perubahan' : 'Tambah Resi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
