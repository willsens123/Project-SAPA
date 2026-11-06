import React, { useState } from 'react';
import { X, Check, Search, User, Plus, Building2, Sparkles } from 'lucide-react';
import { KaryawanItem } from '../types';
import { loadKaryawan } from '../karyawanData';
import { getDivisiFromStorage } from '../divisiData';

interface ChangeLoginUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: KaryawanItem;
  currentDivisi: string;
  onSelectUser: (user: KaryawanItem, divisi: string) => void;
}

export const ChangeLoginUserModal: React.FC<ChangeLoginUserModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentDivisi,
  onSelectUser,
}) => {
  const [karyawanList] = useState<KaryawanItem[]>(() => loadKaryawan());
  const [divisiList] = useState(() => getDivisiFromStorage());
  const [search, setSearch] = useState('');
  const [selectedKaryawanId, setSelectedKaryawanId] = useState(currentUser.id);
  const [selectedDivisi, setSelectedDivisi] = useState(currentDivisi || currentUser.divisi || 'MAD');

  // Custom User Mode
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customKode, setCustomKode] = useState('');
  const [customNama, setCustomNama] = useState('');
  const [customPanggilan, setCustomPanggilan] = useState('');

  if (!isOpen) return null;

  const filtered = karyawanList.filter((k) => {
    const q = search.toLowerCase();
    return (
      k.namaLengkap.toLowerCase().includes(q) ||
      k.namaPanggilan.toLowerCase().includes(q) ||
      k.kodeKaryawan.toLowerCase().includes(q) ||
      k.divisi.toLowerCase().includes(q)
    );
  });

  const handleConfirm = () => {
    if (isCustomMode) {
      if (!customNama.trim()) return;
      const newUser: KaryawanItem = {
        id: `custom-${Date.now()}`,
        kodeKaryawan: customKode.trim() || '00999',
        namaLengkap: customNama.trim(),
        namaPanggilan: customPanggilan.trim() || customNama.trim().split(' ')[0],
        divisi: selectedDivisi,
        emailLogin: `${customNama.toLowerCase().replace(/\s+/g, '')}@sapa.org`,
        password: 'password123',
        avatarInitial: customNama.trim().charAt(0).toUpperCase(),
        avatarBg: 'bg-[#008d91]',
        aktif: true,
      };
      onSelectUser(newUser, selectedDivisi);
    } else {
      const selected = karyawanList.find((k) => k.id === selectedKaryawanId) || currentUser;
      onSelectUser(selected, selectedDivisi);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#008d91] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Ubah ID Login</h2>
              <p className="text-xs text-slate-500">Pilih ID Login & Divisi yang aktif untuk halaman Home</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setIsCustomMode(false)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                !isCustomMode ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pilih dari Karyawan SAPA
            </button>
            <button
              type="button"
              onClick={() => setIsCustomMode(true)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isCustomMode ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              + Input ID Custom
            </button>
          </div>

          {!isCustomMode ? (
            <>
              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama, kode ID, atau divisi..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#008d91] transition-all"
                />
              </div>

              {/* Karyawan List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {filtered.map((item) => {
                  const isSelected = selectedKaryawanId === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedKaryawanId(item.id);
                        if (item.divisi) setSelectedDivisi(item.divisi);
                      }}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#008d91] bg-teal-50/60 shadow-xs'
                          : 'border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-xs ${
                            item.avatarBg || 'bg-[#008d91]'
                          }`}
                        >
                          {item.avatarInitial || item.namaLengkap.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-800">{item.namaLengkap}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                              ID: {item.kodeKaryawan}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>Panggilan: {item.namaPanggilan}</span>
                            <span>•</span>
                            <span className="font-semibold text-[#008d91]">Divisi: {item.divisi}</span>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Kode / ID Login</label>
                <input
                  type="text"
                  placeholder="Contoh: 00031"
                  value={customKode}
                  onChange={(e) => setCustomKode(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  placeholder="Contoh: Agustino Ong"
                  value={customNama}
                  onChange={(e) => setCustomNama(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nama Panggilan</label>
                <input
                  type="text"
                  placeholder="Contoh: Ko Agus"
                  value={customPanggilan}
                  onChange={(e) => setCustomPanggilan(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#008d91]"
                />
              </div>
            </div>
          )}

          {/* Divisi Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
              <Building2 className="w-3.5 h-3.5 text-[#008d91]" />
              Pilih Divisi yang Aktif untuk Home
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {['MAD', 'UMM', 'PNB', 'FUN', 'EVE', 'CPR', 'MRK', 'CAM', 'OPS', 'PRO', 'MED', 'IT'].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDivisi(d)}
                  className={`py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    selectedDivisi === d
                      ? 'bg-[#008d91] text-white border-[#008d91] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 text-xs font-bold bg-[#008d91] text-white rounded-xl hover:bg-[#00787c] shadow-sm transition-all cursor-pointer"
          >
            Terapkan & Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
