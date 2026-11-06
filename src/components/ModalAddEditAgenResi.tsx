import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Check, ChevronDown, Building2, User } from 'lucide-react';
import { AgenResiItem } from '../agenResiData';
import { OrganisasiItem } from '../types';
import { IdentitasItem } from '../identitasData';

interface ModalAddEditAgenResiProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: AgenResiItem) => void;
  initialData?: AgenResiItem | null;
  organisasiList: OrganisasiItem[];
  identitasList: IdentitasItem[];
}

export const ModalAddEditAgenResi: React.FC<ModalAddEditAgenResiProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  organisasiList,
  identitasList,
}) => {
  const [namaAgen, setNamaAgen] = useState('');
  const [organisasiId, setOrganisasiId] = useState('');
  const [picIdentitasId, setPicIdentitasId] = useState('');
  const [isiEkspedisi, setIsEkspedisi] = useState('');
  const [keterangan, setKeterangan] = useState('-');

  // Dropdown open states
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const orgRef = useRef<HTMLDivElement>(null);

  const [isPicDropdownOpen, setIsPicDropdownOpen] = useState(false);
  const [picSearchQuery, setPicSearchQuery] = useState('');
  const picRef = useRef<HTMLDivElement>(null);

  // Quick courier chips
  const quickCouriers = ['Lion', 'Wahana', 'JNE', 'SiCepat', 'TIKI', 'J&T', 'POS', 'AnterAja'];

  useEffect(() => {
    if (initialData) {
      setNamaAgen(initialData.namaAgen);
      setOrganisasiId(initialData.organisasiId);
      setPicIdentitasId(initialData.picIdentitasId);
      setIsEkspedisi(initialData.isiEkspedisi);
      setKeterangan(initialData.keterangan || '-');
    } else {
      setNamaAgen('');
      setOrganisasiId(organisasiList[0]?.id || '');
      setPicIdentitasId(identitasList[0]?.id || '');
      setIsEkspedisi('Lion, Wahana');
      setKeterangan('-');
    }
    setIsOrgDropdownOpen(false);
    setIsPicDropdownOpen(false);
    setOrgSearchQuery('');
    setPicSearchQuery('');
  }, [initialData, isOpen, organisasiList, identitasList]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (orgRef.current && !orgRef.current.contains(e.target as Node)) {
        setIsOrgDropdownOpen(false);
      }
      if (picRef.current && !picRef.current.contains(e.target as Node)) {
        setIsPicDropdownOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedOrg = organisasiList.find(
    (o) => o.id === organisasiId || o.namaOrg === organisasiId
  );
  const selectedPic = identitasList.find(
    (i) => i.id === picIdentitasId || i.codeId === picIdentitasId || i.namaLengkap === picIdentitasId
  );

  const filteredOrganisasi = organisasiList.filter((org) => {
    if (!orgSearchQuery.trim()) return true;
    const q = orgSearchQuery.toLowerCase();
    return (
      org.namaOrg.toLowerCase().includes(q) ||
      (org.jenisOrg || '').toLowerCase().includes(q) ||
      (org.kota || '').toLowerCase().includes(q)
    );
  });

  const filteredIdentitas = identitasList.filter((idItem) => {
    if (!picSearchQuery.trim()) return true;
    const q = picSearchQuery.toLowerCase();
    return (
      idItem.namaLengkap.toLowerCase().includes(q) ||
      (idItem.codeId || '').toLowerCase().includes(q) ||
      (idItem.namaPanggilan || '').toLowerCase().includes(q) ||
      (idItem.nomorHandPhone || '').toLowerCase().includes(q)
    );
  });

  const handleToggleCourierChip = (name: string) => {
    const list = isiEkspedisi
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.includes(name)) {
      setIsEkspedisi(list.filter((s) => s !== name).join(', '));
    } else {
      setIsEkspedisi([...list, name].join(', '));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaAgen.trim()) {
      return;
    }

    const item: AgenResiItem = {
      id: initialData ? initialData.id : `agen-${Date.now()}`,
      namaAgen: namaAgen.trim(),
      organisasiId: organisasiId || organisasiList[0]?.id || '',
      picIdentitasId: picIdentitasId || identitasList[0]?.id || '',
      isiEkspedisi: isiEkspedisi.trim() || '-',
      keterangan: keterangan.trim() || '-',
    };

    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              {initialData ? 'Edit Agen Resi' : 'Tambah Agen Resi'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Organisasi ID terkoneksi dengan Organisasi & PIC terkoneksi dengan Identitas
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
          {/* Field 1: Nama Agen */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Nama Agen <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={namaAgen}
              onChange={(e) => setNamaAgen(e.target.value)}
              placeholder="Contoh: Lion Jurang"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:bg-white transition-colors"
            />
          </div>

          {/* Field 2: Organisasi ID (Connected to Organisasi) */}
          <div className="flex flex-col gap-1.5" ref={orgRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#008d91]" />
                Organisasi ID <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.2 rounded-full font-medium">
                Terkoneksi Organisasi
              </span>
            </div>

            {/* Custom Selector Trigger */}
            <div
              onClick={() => {
                setIsOrgDropdownOpen(!isOrgDropdownOpen);
                setIsPicDropdownOpen(false);
              }}
              className={`w-full bg-white border rounded-xl px-3 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors shadow-2xs ${
                isOrgDropdownOpen
                  ? 'border-[#008d91] ring-1 ring-[#008d91]'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {selectedOrg ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-2xs ${
                      selectedOrg.avatarBg || 'bg-[#10b981]'
                    }`}
                  >
                    {selectedOrg.avatarInitial || selectedOrg.namaOrg.charAt(0) || 'A'}
                  </div>
                  <div className="flex flex-col min-w-0 truncate">
                    <span className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
                      {selectedOrg.namaOrg}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate">
                      {selectedOrg.jenisOrg || 'Organisasi'}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-slate-400 text-xs sm:text-sm">Pilih Organisasi...</span>
              )}

              <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 ml-2">
                <ChevronDown
                  className={`w-3.5 h-3.5 stroke-[2.5] transition-transform duration-200 ${
                    isOrgDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>

            {/* Dropdown Options */}
            {isOrgDropdownOpen && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 flex flex-col gap-2 mt-1 animate-in fade-in duration-100">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Cari organisasi..."
                    value={orgSearchQuery}
                    onChange={(e) => setOrgSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-[#008d91]"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
                  {filteredOrganisasi.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      Organisasi tidak ditemukan
                    </div>
                  ) : (
                    filteredOrganisasi.map((org) => {
                      const isCurrent = (selectedOrg && selectedOrg.id === org.id) || organisasiId === org.id;
                      return (
                        <div
                          key={org.id}
                          onClick={() => {
                            setOrganisasiId(org.id);
                            setIsOrgDropdownOpen(false);
                            setOrgSearchQuery('');
                          }}
                          className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                            isCurrent
                              ? 'bg-teal-50 border border-teal-200 font-medium'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                                org.avatarBg || 'bg-[#10b981]'
                              }`}
                            >
                              {org.avatarInitial || org.namaOrg.charAt(0)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold text-slate-800 truncate">
                                {org.namaOrg}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate">
                                {org.jenisOrg || 'Organisasi'}
                              </span>
                            </div>
                          </div>
                          {isCurrent && <Check className="w-4 h-4 text-[#008d91]" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Field 3: PIC (Connected to Identitas) */}
          <div className="flex flex-col gap-1.5" ref={picRef}>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#eab308]" />
                PIC <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.2 rounded-full font-medium">
                Terkoneksi Identitas
              </span>
            </div>

            {/* Custom Selector Trigger */}
            <div
              onClick={() => {
                setIsPicDropdownOpen(!isPicDropdownOpen);
                setIsOrgDropdownOpen(false);
              }}
              className={`w-full bg-white border rounded-xl px-3 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors shadow-2xs ${
                isPicDropdownOpen
                  ? 'border-[#008d91] ring-1 ring-[#008d91]'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {selectedPic ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-2xs ${
                      selectedPic.avatarBg || 'bg-[#eab308]'
                    }`}
                  >
                    {selectedPic.avatarInitial || selectedPic.namaLengkap.charAt(0) || 'C'}
                  </div>
                  <div className="flex flex-col min-w-0 truncate">
                    <span className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
                      {selectedPic.codeId ? `${selectedPic.codeId} ` : ''}
                      {selectedPic.namaLengkap}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate">
                      {selectedPic.namaPanggilan || selectedPic.nomorHandPhone || '-'}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-slate-400 text-xs sm:text-sm">Pilih PIC Identitas...</span>
              )}

              <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 ml-2">
                <ChevronDown
                  className={`w-3.5 h-3.5 stroke-[2.5] transition-transform duration-200 ${
                    isPicDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>

            {/* Dropdown Options */}
            {isPicDropdownOpen && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-2.5 flex flex-col gap-2 mt-1 animate-in fade-in duration-100">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Cari nama, ID, atau no HP..."
                    value={picSearchQuery}
                    onChange={(e) => setPicSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none focus:border-[#008d91]"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
                  {filteredIdentitas.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      Identitas tidak ditemukan
                    </div>
                  ) : (
                    filteredIdentitas.map((idItem) => {
                      const isCurrent = (selectedPic && selectedPic.id === idItem.id) || picIdentitasId === idItem.id;
                      return (
                        <div
                          key={idItem.id}
                          onClick={() => {
                            setPicIdentitasId(idItem.id);
                            setIsPicDropdownOpen(false);
                            setPicSearchQuery('');
                          }}
                          className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                            isCurrent
                              ? 'bg-amber-50/80 border border-amber-200 font-medium'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 ${
                                idItem.avatarBg || 'bg-[#eab308]'
                              }`}
                            >
                              {idItem.avatarInitial || idItem.namaLengkap.charAt(0)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold text-slate-800 truncate">
                                {idItem.codeId ? `${idItem.codeId} ` : ''}
                                {idItem.namaLengkap}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate">
                                {idItem.namaPanggilan || idItem.nomorHandPhone || '-'}
                              </span>
                            </div>
                          </div>
                          {isCurrent && <Check className="w-4 h-4 text-[#eab308]" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Field 4: Isi Ekspedisi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Isi Ekspedisi
            </label>
            <input
              type="text"
              value={isiEkspedisi}
              onChange={(e) => setIsEkspedisi(e.target.value)}
              placeholder="Contoh: Lion, Wahana"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:bg-white transition-colors"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="text-[10px] text-slate-400">Pilih cepat:</span>
              {quickCouriers.map((courier) => {
                const isSelected = isiEkspedisi
                  .split(',')
                  .map((s) => s.trim().toLowerCase())
                  .includes(courier.toLowerCase());
                return (
                  <button
                    key={courier}
                    type="button"
                    onClick={() => handleToggleCourierChip(courier)}
                    className={`px-2 py-0.5 text-[11px] rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 border-[#008d91] text-[#008d91] font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {courier}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field 5: Keterangan */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Keterangan
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: -"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:bg-white transition-colors"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 mt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#008d91] hover:bg-[#05828e] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
