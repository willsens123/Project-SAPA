import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  EyeOff,
  Eye,
  Search,
  SlidersHorizontal,
  Plus,
  ChevronDown,
  Link as LinkIcon,
  Check,
} from 'lucide-react';
import { AccountItem } from '../accountData';
import { getDivisiFromStorage } from '../divisiData';

interface FormListAccountProps {
  onCancel: () => void;
  onSave: (item: AccountItem) => void;
  editingItem?: AccountItem | null;
  onShowToast?: (msg: string) => void;
}

const DEFAULT_DIVISI_OPTIONS = ['EVE', 'UMM', 'FUN', 'PNB', 'PRO', 'MED', 'OPS'];

export const FormListAccount: React.FC<FormListAccountProps> = ({
  onCancel,
  onSave,
  editingItem,
  onShowToast = (_msg: string) => {},
}) => {
  const [divisi, setDivisi] = useState('EVE');
  const [divisiSearch, setDivisiSearch] = useState('');
  const [divisiDropdownOpen, setDivisiDropdownOpen] = useState(false);
  const divisiRef = useRef<HTMLDivElement | null>(null);

  const [linkLogin, setLinkLogin] = useState('');
  const [namaAccount, setNamaAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [jenisAccount, setJenisAccount] = useState('');
  const [pemegang, setPemegang] = useState('');
  const [jenisAdmin, setJenisAdmin] = useState('');
  const [aktif, setAktif] = useState<boolean>(false); // In form mockup, "Tidak Aktif" is selected by default for new form
  const [alasan, setAlasan] = useState('');
  const [error, setError] = useState('');

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (divisiRef.current && !divisiRef.current.contains(e.target as Node)) {
        setDivisiDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    if (editingItem) {
      setDivisi(editingItem.divisi || 'EVE');
      setDivisiSearch(editingItem.divisi || 'EVE');
      setLinkLogin(editingItem.linkLogin || '');
      setNamaAccount(editingItem.namaAccount || '');
      setPassword(editingItem.password || '');
      setJenisAccount(editingItem.jenisAccount || '');
      setPemegang(editingItem.pemegang || '');
      setJenisAdmin(editingItem.jenisAdmin || '');
      setAktif(editingItem.aktif ?? true);
      setAlasan(editingItem.alasanTidakAktif || '');
    } else {
      setDivisi('EVE');
      setDivisiSearch('EVE');
      setLinkLogin('');
      setNamaAccount('');
      setPassword('');
      setJenisAccount('');
      setPemegang('');
      setJenisAdmin('');
      setAktif(false); // In Image mockup, "Tidak Aktif" radio is selected by default
      setAlasan('');
    }
    setError('');
  }, [editingItem]);

  const allDivisions = useMemo(() => {
    const list = getDivisiFromStorage().map((d) => d.namaDivisi);
    DEFAULT_DIVISI_OPTIONS.forEach((d) => {
      if (!list.includes(d)) list.push(d);
    });
    return list;
  }, []);

  const filteredDivisions = allDivisions.filter((d) =>
    d.toLowerCase().includes(divisiSearch.toLowerCase())
  );

  const handleSelectDivisi = (val: string) => {
    setDivisi(val);
    setDivisiSearch(val);
    setDivisiDropdownOpen(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!divisi.trim()) {
      setError('Divisi wajib diisi');
      return;
    }
    if (!namaAccount.trim()) {
      setError('Nama Account wajib diisi');
      return;
    }

    const itemToSave: AccountItem = {
      id: editingItem ? editingItem.id : `acc-${Date.now()}`,
      divisi: divisi.trim().toUpperCase(),
      linkLogin: linkLogin.trim() || undefined,
      namaAccount: namaAccount.trim(),
      password: password.trim() || 'password123',
      jenisAccount: jenisAccount.trim(),
      pemegang: pemegang.trim(),
      jenisAdmin: jenisAdmin.trim(),
      aktif,
      alasanTidakAktif: !aktif && alasan.trim() ? alasan.trim() : undefined,
      createdAt: editingItem?.createdAt || '15 Nov 2021',
    };

    onSave(itemToSave);
    onShowToast(
      `Akun "${itemToSave.namaAccount}" berhasil ${
        editingItem ? 'diperbarui' : 'disimpan'
      }`
    );
  };

  return (
    <div className="w-full bg-white rounded-3xl p-5 sm:p-8 shadow-xs border border-slate-100 min-h-[580px] flex flex-col justify-between transition-all font-['Plus_Jakarta_Sans',sans-serif]">
      <div>
        {/* Top Action Toolbar matching Image */}
        <div className="flex items-center justify-end gap-3 mb-8">
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              showPassword
                ? 'text-[#008d91] bg-teal-50'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title={showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'}
          >
            {showPassword ? (
              <Eye className="w-5 h-5 stroke-[1.8]" />
            ) : (
              <EyeOff className="w-5 h-5 stroke-[1.8]" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('form-nama-account');
              if (el) el.focus();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            title="Pencarian / Fokus Form"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>

          <button
            type="button"
            onClick={() => setDivisiDropdownOpen(!divisiDropdownOpen)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              divisiDropdownOpen
                ? 'text-[#008d91] bg-teal-50'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title="Filter / Pilih Divisi"
          >
            <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
          </button>

          <button
            type="button"
            onClick={() => handleSubmit()}
            className="px-5 py-2 bg-[#008d91] hover:bg-[#007a7e] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-xs shadow-[#008d91]/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-600 animate-in fade-in max-w-xl">
            {error}
          </div>
        )}

        {/* Form Body matching exact layout */}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
          {/* 1. Divisi */}
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2 sm:gap-4">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Divisi
            </label>
            <div className="relative" ref={divisiRef}>
              <div
                onClick={() => setDivisiDropdownOpen(!divisiDropdownOpen)}
                className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-all shadow-2xs"
              >
                <input
                  type="text"
                  value={divisiDropdownOpen ? divisiSearch : divisi || ''}
                  onChange={(e) => {
                    setDivisiSearch(e.target.value);
                    setDivisi(e.target.value);
                  }}
                  onFocus={() => setDivisiDropdownOpen(true)}
                  placeholder="Search..."
                  className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent cursor-pointer"
                />
                <div className="w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 ml-2 shadow-xs">
                  <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>

              {divisiDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-100 max-h-48 overflow-y-auto">
                  {filteredDivisions.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-slate-400">
                      Divisi "{divisiSearch}" tidak ditemukan
                    </div>
                  ) : (
                    filteredDivisions.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleSelectDivisi(d)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between ${
                          divisi === d
                            ? 'text-[#008d91] bg-teal-50'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>Divisi {d}</span>
                        {divisi === d && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 2. Link Login */}
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2 sm:gap-4">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Link Login
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={linkLogin}
                onChange={(e) => setLinkLogin(e.target.value)}
                placeholder="Input Link..."
                className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 pr-10 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] transition-all shadow-2xs"
              />
              <div className="absolute right-3.5 text-[#008d91] pointer-events-none">
                <LinkIcon className="w-4 h-4 stroke-[2]" />
              </div>
            </div>
          </div>

          {/* 3. Nama Account */}
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2 sm:gap-4">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Nama Account
            </label>
            <input
              id="form-nama-account"
              type="text"
              value={namaAccount}
              onChange={(e) => setNamaAccount(e.target.value)}
              placeholder="Input Text..."
              className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] transition-all shadow-2xs"
            />
          </div>

          {/* 4. Password */}
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2 sm:gap-4">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Input Text..."
                className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 pr-10 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] transition-all shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showPassword ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* 5. Jenis Account */}
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2 sm:gap-4">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Jenis Account
            </label>
            <input
              type="text"
              value={jenisAccount}
              onChange={(e) => setJenisAccount(e.target.value)}
              placeholder="Input Text..."
              className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] transition-all shadow-2xs"
            />
          </div>

          {/* 6. Pemegang */}
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2 sm:gap-4">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Pemegang
            </label>
            <input
              type="text"
              value={pemegang}
              onChange={(e) => setPemegang(e.target.value)}
              placeholder="Input Text..."
              className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] transition-all shadow-2xs"
            />
          </div>

          {/* 7. Jenis Admin */}
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2 sm:gap-4">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Jenis Admin
            </label>
            <input
              type="text"
              value={jenisAdmin}
              onChange={(e) => setJenisAdmin(e.target.value)}
              placeholder="Input Text..."
              className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] transition-all shadow-2xs"
            />
          </div>

          {/* 8. Aktif? Radio Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] items-center gap-2 sm:gap-4 pt-1">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Aktif?
            </label>
            <div className="flex items-center gap-6">
              {/* Radio Aktif */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="statusAktif"
                  checked={aktif === true}
                  onChange={() => setAktif(true)}
                  className="w-4 h-4 text-[#008d91] focus:ring-[#008d91] cursor-pointer"
                />
                <span className="text-xs sm:text-sm font-medium text-slate-800">
                  Aktif
                </span>
              </label>

              {/* Radio Tidak Aktif */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="statusAktif"
                  checked={aktif === false}
                  onChange={() => setAktif(false)}
                  className="w-4 h-4 text-[#008d91] focus:ring-[#008d91] cursor-pointer"
                />
                <span className="text-xs sm:text-sm font-medium text-slate-800">
                  Tidak Aktif
                </span>
              </label>
            </div>
          </div>

          {/* 9. Alasan: */}
          <div className="pt-2">
            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-2">
              Alasan:
            </label>
            <input
              type="text"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              placeholder="Input Text..."
              className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] transition-all shadow-2xs"
            />
          </div>
        </form>
      </div>

      {/* Bottom Action Buttons */}
      <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-start gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-6 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => handleSubmit()}
          className="rounded-full px-7 py-2 bg-[#008d91] hover:bg-[#007a7e] text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
        >
          {editingItem ? 'Simpan Perubahan' : 'Simpan Data'}
        </button>
      </div>
    </div>
  );
};
