import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, CreditCard, Building2, User, Search, ChevronDown, Check, ChevronUp, Sparkles } from 'lucide-react';
import { KumpulanRekeningItem } from '../kumpulanRekeningData';
import { IdentitasItem } from '../identitasData';
import { OrganisasiItem } from '../types';

interface AddEditKumpulanRekeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: KumpulanRekeningItem) => void;
  editingItem?: KumpulanRekeningItem | null;
  identitasList?: IdentitasItem[];
  organisasiList?: OrganisasiItem[];
}

interface EntityOption {
  id: string;
  type: 'identitas' | 'organisasi';
  code: string;
  name: string;
  subtitle: string;
  avatarInitial: string;
  avatarBg: string;
  bank?: string;
  nomorRekening?: string;
  keterangan?: string;
}

export const AddEditKumpulanRekeningModal: React.FC<AddEditKumpulanRekeningModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  identitasList = [],
  organisasiList = [],
}) => {
  const [selectedEntity, setSelectedEntity] = useState<EntityOption | null>(null);
  const [idIdentitas, setIdIdentitas] = useState('10001');
  const [namaIdentitas, setNamaIdentitas] = useState('');
  const [bank, setBank] = useState('BCA');
  const [nomorRekening, setNomorRekening] = useState('');
  const [atasNama, setAtasNama] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Selector Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'identitas' | 'organisasi'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const bankPresets = ['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'Permata', 'Danamon', 'BSI', 'Bank Jago', 'OCBC NISP', 'Lainnya'];

  // Build unified options from identitas and organisasi
  const allEntityOptions = useMemo<EntityOption[]>(() => {
    const list: EntityOption[] = [];

    // 1. Identitas list
    identitasList.forEach((it) => {
      // Map avatar background
      let bg = it.avatarBg || 'bg-[#10b981]';
      if (it.codeId === '00031' || it.namaLengkap.toLowerCase().includes('agustino')) {
        bg = 'bg-[#10b981]'; // Emerald/Teal green from reference image
      }

      list.push({
        id: it.id,
        type: 'identitas',
        code: it.codeId || it.id,
        name: it.namaLengkap,
        subtitle: it.namaPanggilan || it.nomorHandPhone || 'Identitas',
        avatarInitial: (it.avatarInitial || it.namaLengkap.charAt(0) || 'A').toUpperCase(),
        avatarBg: bg,
        bank: it.bank,
        nomorRekening: it.nomorRekening,
        keterangan: it.keterangan,
      });
    });

    // 2. Organisasi list
    organisasiList.forEach((org, idx) => {
      list.push({
        id: org.id,
        type: 'organisasi',
        code: org.picOrgCode || `ORG-0${idx + 1}`,
        name: org.namaOrg,
        subtitle: org.jenisOrg || 'Organisasi',
        avatarInitial: (org.avatarInitial || org.namaOrg.charAt(0) || 'O').toUpperCase(),
        avatarBg: org.avatarBg || 'bg-[#008d91]',
        bank: undefined,
        nomorRekening: undefined,
        keterangan: org.subOrg,
      });
    });

    return list;
  }, [identitasList, organisasiList]);

  // Filtered entities for dropdown
  const filteredEntities = useMemo(() => {
    let list = allEntityOptions;
    if (activeTab === 'identitas') {
      list = list.filter((e) => e.type === 'identitas');
    } else if (activeTab === 'organisasi') {
      list = list.filter((e) => e.type === 'organisasi');
    }

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.code.toLowerCase().includes(q) ||
        e.subtitle.toLowerCase().includes(q)
    );
  }, [allEntityOptions, activeTab, searchQuery]);

  // Sync state on open/edit
  useEffect(() => {
    if (editingItem) {
      setIdIdentitas(editingItem.idIdentitas || '');
      setNamaIdentitas(editingItem.namaIdentitas || '');
      setBank(editingItem.bank || 'BCA');
      setNomorRekening(editingItem.nomorRekening || '');
      setAtasNama(editingItem.atasNama || '');
      setKeterangan(editingItem.keterangan || '');

      // Try to find matching entity
      const matched = allEntityOptions.find(
        (e) =>
          e.code === editingItem.idIdentitas ||
          e.name.toLowerCase() === (editingItem.namaIdentitas || '').toLowerCase() ||
          e.id === editingItem.idIdentitas
      );

      if (matched) {
        setSelectedEntity(matched);
      } else {
        setSelectedEntity({
          id: editingItem.idIdentitas,
          type: editingItem.tipeIdentitas || 'identitas',
          code: editingItem.idIdentitas,
          name: editingItem.namaIdentitas || editingItem.atasNama,
          subtitle: editingItem.subtitleIdentitas || (editingItem.tipeIdentitas === 'organisasi' ? 'Organisasi' : 'Identitas'),
          avatarInitial: editingItem.avatarInitial || (editingItem.namaIdentitas || editingItem.atasNama || 'A').charAt(0).toUpperCase(),
          avatarBg: editingItem.avatarBg || 'bg-[#10b981]',
        });
      }
    } else {
      // Default: pick Agustino or first entity
      const defaultEntity =
        allEntityOptions.find((e) => e.name.toLowerCase().includes('agustino') || e.code === '00031') ||
        allEntityOptions[0];

      if (defaultEntity) {
        setSelectedEntity(defaultEntity);
        setIdIdentitas(defaultEntity.code === '00031' ? '10001' : defaultEntity.code);
        setNamaIdentitas(defaultEntity.name);
        setAtasNama(defaultEntity.name);
        setBank(defaultEntity.bank || 'BCA');
        setNomorRekening(defaultEntity.nomorRekening || '');
      } else {
        setSelectedEntity(null);
        setIdIdentitas('10001');
        setNamaIdentitas('Agustino');
        setAtasNama('Agustino');
        setBank('BCA');
        setNomorRekening('');
      }
      setKeterangan('');
    }
    setErrorMsg('');
    setIsDropdownOpen(false);
    setSearchQuery('');
  }, [editingItem, isOpen, allEntityOptions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isDropdownOpen]);

  const handleSelectEntity = (entity: EntityOption) => {
    setSelectedEntity(entity);
    setIdIdentitas(entity.code);
    setNamaIdentitas(entity.name);

    // Auto populate atas nama if blank or matches previous entity name
    if (!atasNama || (selectedEntity && atasNama === selectedEntity.name)) {
      setAtasNama(entity.name);
    }

    // Auto populate bank details if entity has them recorded
    if (entity.bank) {
      setBank(entity.bank);
    }
    if (entity.nomorRekening) {
      setNomorRekening(entity.nomorRekening);
    }

    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idIdentitas.trim()) {
      setErrorMsg('ID Identitas wajib diisi.');
      return;
    }
    if (!bank.trim()) {
      setErrorMsg('Bank wajib diisi.');
      return;
    }
    if (!nomorRekening.trim()) {
      setErrorMsg('Nomor Rekening wajib diisi.');
      return;
    }
    if (!atasNama.trim()) {
      setErrorMsg('Atas Nama wajib diisi.');
      return;
    }

    const saved: KumpulanRekeningItem = {
      id: editingItem ? editingItem.id : `rek-${Date.now()}`,
      idIdentitas: idIdentitas.trim(),
      namaIdentitas: (namaIdentitas.trim() || selectedEntity?.name || atasNama).trim(),
      tipeIdentitas: selectedEntity?.type || 'identitas',
      subtitleIdentitas: selectedEntity?.subtitle,
      avatarInitial: selectedEntity?.avatarInitial || (namaIdentitas || atasNama || 'A').charAt(0).toUpperCase(),
      avatarBg: selectedEntity?.avatarBg || 'bg-[#10b981]',
      bank: bank.trim(),
      nomorRekening: nomorRekening.trim(),
      atasNama: atasNama.trim(),
      keterangan: keterangan.trim(),
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    };

    onSave(saved);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              {editingItem ? 'Edit Kumpulan Rekening' : 'Tambah Kumpulan Rekening'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hubungkan rekening dengan data Master Identitas atau Organisasi
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {/* Section: ID Identitas (From Identitas or Organisasi) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#008d91]" />
                ID Identitas
              </label>
              <span className="text-[10px] text-[#008d91] font-semibold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                Pilih dari Identitas / Organisasi
              </span>
            </div>

            {/* Selected Card matching exact format of uploaded image (image_43b217d9.png) */}
            <div ref={dropdownRef} className="relative">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between shadow-2xs select-none ${
                  isDropdownOpen
                    ? 'border-[#008d91] ring-2 ring-[#008d91]/20 bg-teal-50/20'
                    : 'border-slate-200 hover:border-[#008d91]/60 bg-white'
                }`}
              >
                {selectedEntity ? (
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar circle matching uploaded reference image */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0 shadow-2xs ${
                        selectedEntity.avatarBg || 'bg-[#10b981]'
                      }`}
                    >
                      {selectedEntity.avatarInitial}
                    </div>

                    {/* Two-line text: Top = 00031 Agustino Ong, Bottom = Ko Agus */}
                    <div className="flex flex-col min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm leading-snug truncate">
                          {selectedEntity.code ? `${selectedEntity.code} ` : ''}
                          {selectedEntity.name}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-md font-semibold uppercase tracking-wider shrink-0 ${
                            selectedEntity.type === 'organisasi'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {selectedEntity.type}
                        </span>
                      </div>
                      <span className="text-[11px] sm:text-xs text-slate-400 font-normal leading-tight mt-0.5 truncate">
                        {selectedEntity.subtitle}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm py-1">
                    <User className="w-4 h-4 text-slate-300" />
                    <span>Klik untuk memilih Identitas atau Organisasi...</span>
                  </div>
                )}

                <div className="w-7 h-7 rounded-full bg-slate-100 hover:bg-teal-50 text-slate-500 hover:text-[#008d91] flex items-center justify-center shrink-0 ml-2 transition-colors">
                  {isDropdownOpen ? (
                    <ChevronUp className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  )}
                </div>
              </div>

              {/* Dropdown Popover with Tabs (All, Identitas, Organisasi) */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-3xl shadow-2xl p-3 sm:p-4 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-3">
                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setActiveTab('all')}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === 'all'
                          ? 'bg-[#008d91] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All ({allEntityOptions.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('identitas')}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === 'identitas'
                          ? 'bg-[#008d91] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Identitas ({allEntityOptions.filter((e) => e.type === 'identitas').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('organisasi')}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        activeTab === 'organisasi'
                          ? 'bg-[#008d91] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Organisasi ({allEntityOptions.filter((e) => e.type === 'organisasi').length})
                    </button>
                  </div>

                  {/* Search input */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari ID, nama, panggilan, atau organisasi..."
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:bg-white transition-colors"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Options List */}
                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {filteredEntities.length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        Tidak ada data yang cocok dengan "{searchQuery}"
                      </div>
                    ) : (
                      filteredEntities.map((item) => {
                        const isSelected = selectedEntity?.id === item.id;
                        return (
                          <div
                            key={`${item.type}-${item.id}`}
                            onClick={() => handleSelectEntity(item)}
                            className={`flex items-center justify-between p-2.5 rounded-2xl transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-teal-50 border border-teal-200'
                                : 'hover:bg-slate-50 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Avatar circle */}
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-2xs ${
                                  item.avatarBg || 'bg-[#10b981]'
                                }`}
                              >
                                {item.avatarInitial}
                              </div>

                              {/* Two line text */}
                              <div className="flex flex-col min-w-0 text-left">
                                <span className="font-bold text-slate-800 text-xs sm:text-sm leading-snug truncate">
                                  {item.code ? `${item.code} ` : ''}
                                  {item.name}
                                </span>
                                <span className="text-[11px] text-slate-400 leading-tight mt-0.5 truncate">
                                  {item.subtitle}
                                </span>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 ml-2">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Code Badge Field & Live Preview of Table View */}
            <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500 font-medium">
                  Kode Badge ID:
                </span>
                <input
                  type="text"
                  value={idIdentitas}
                  onChange={(e) => setIdIdentitas(e.target.value)}
                  placeholder="e.g. 10001"
                  required
                  className="w-28 text-center font-mono font-bold text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-[#008d91] focus:outline-none focus:border-[#008d91]"
                />
              </div>

              {/* Live Preview matching uploaded image (image_90342d2d.png) */}
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">
                  Tampilan di Tabel:
                </span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-[7px] bg-[#e6fbf7] border border-[#a1e7de] text-[#008d91] font-bold text-xs shrink-0 tracking-wide font-mono">
                    {idIdentitas || '10001'}
                  </span>
                  <span className="text-slate-800 text-xs font-normal max-w-[170px] truncate">
                    {namaIdentitas || atasNama || 'Nama Lengkap'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bank */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#008d91]" />
                Bank
              </span>
              <span className="text-[10px] text-slate-400">Pilih atau ketik</span>
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                {bankPresets.slice(0, 5).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBank(b)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      bank.toUpperCase() === b.toUpperCase()
                        ? 'bg-[#008d91] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="Nama Bank (misal: BCA, Mandiri, dll)..."
                required
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
              />
            </div>
          </div>

          {/* Nomor Rekening */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#008d91]" />
              Nomor Rekening
            </label>
            <input
              type="text"
              value={nomorRekening}
              onChange={(e) => {
                const clean = e.target.value.replace(/[^\d-]/g, '');
                setNomorRekening(clean);
              }}
              placeholder="Contoh: 8880123456"
              required
              className="w-full font-mono text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
            />
          </div>

          {/* Atas Nama */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#008d91]" />
              Atas Nama
            </label>
            <input
              type="text"
              value={atasNama}
              onChange={(e) => setAtasNama(e.target.value)}
              placeholder="Nama pemilik rekening bank..."
              required
              className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
            />
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Keterangan
            </label>
            <textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Rekening Operasional & Pengeluaran Kantor..."
              rows={2}
              className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91] resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#008d91] hover:bg-[#007b7f] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Simpan Rekening
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
