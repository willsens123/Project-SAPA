import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  X,
  ChevronDown,
  Calendar,
  Check,
} from 'lucide-react';
import { IdentitasItem, AlamatIdentitas } from '../identitasData';
import {
  JenisPanggilanItem,
  TriyanaItem,
  PekerjaanItem,
  MengenalYpplnItem,
  KaryawanItem,
} from '../types';
import { loadKaryawan } from '../karyawanData';
import { AddJenisPanggilanModal } from './AddJenisPanggilanModal';
import { AddMasterItemModal } from './AddMasterItemModal';
import { formatDatePickerValue } from '../utils/datePickerHelper';

interface FormIdentitasProps {
  initialData?: IdentitasItem | null;
  identitasList?: IdentitasItem[];
  karyawanList?: KaryawanItem[];
  onSave: (data: IdentitasItem) => void;
  onCancel: () => void;
  onShowToast?: (msg: string) => void;
  jenisPanggilanList?: JenisPanggilanItem[];
  triyanaList?: TriyanaItem[];
  pekerjaanList?: PekerjaanItem[];
  mengenalYpplnList?: MengenalYpplnItem[];
  onAddNewJenisPanggilan?: (item: JenisPanggilanItem) => void;
  onAddNewTriyana?: (name: string, keterangan: string) => void;
  onAddNewPekerjaan?: (name: string, keterangan: string) => void;
  onAddNewMengenalYppln?: (name: string, keterangan: string) => void;
}

import {
  INDONESIA_KOTA_KABUPATEN_LIST,
  INDONESIA_KECAMATAN_LIST,
  INDONESIA_KELURAHAN_LIST,
  getKecamatanByKota,
  getKelurahanByKecamatan,
} from '../indonesiaRegionData';

const AGAMA_LIST = ['Buddha', 'Kristen', 'Katolik', 'Islam', 'Hindu', 'Konghucu', 'Lainnya'];
const PIC_YPPLN_LIST = ['Ariel', 'Bhadra', 'Cindy', 'Agustino', 'Silvia', 'Denny', 'Lani'];
const KOTA_KABUPATEN_LIST = INDONESIA_KOTA_KABUPATEN_LIST;
const KECAMATAN_LIST = INDONESIA_KECAMATAN_LIST;
const KELURAHAN_LIST = INDONESIA_KELURAHAN_LIST;
const FOLLOW_UP_CAT_LIST = ['Prospek', 'Aktif', 'Follow Up Rutin', 'Donasi', 'Event', 'Khusus'];
const FOLLOW_UP_DUR_LIST = ['1 Bulan', '2 Bulan', '3 Bulan', '6 Bulan', '1 Tahun', 'Fleksibel'];
const PIC_UMUM_DEPT_LIST = ['Tim Logistik', 'Tim Salur', 'Tim Keuangan', 'Tim Relawan', 'Pusat'];

// Custom Dropdown Selector with Search and Teal Chevron Icon
interface SearchDropdownProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  options: { label: string; value: string }[];
  onAddNew?: () => void;
  addNewLabel?: string;
  allowCustom?: boolean;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  options,
  onAddNew,
  addNewLabel,
  allowCustom = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const hasExactMatch = options.some(
    (opt) =>
      opt.value.toLowerCase() === search.trim().toLowerCase() ||
      opt.label.toLowerCase() === search.trim().toLowerCase()
  );
  const showCustomOption = allowCustom && search.trim().length > 0 && !hasExactMatch;

  const selectedOption = options.find(
    (opt) =>
      opt.value === value ||
      opt.label === value ||
      (value && opt.value.toLowerCase().startsWith(value.toLowerCase())) ||
      (value && opt.label.toLowerCase().includes(value.toLowerCase()))
  );

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-sm text-left flex items-center justify-between hover:border-slate-300 focus:outline-none focus:border-[#05828e] transition-colors"
      >
        <span className={value ? 'text-slate-800 font-normal' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : (value || placeholder)}
        </span>
        <div className="w-5 h-5 rounded-full bg-[#05828e] text-white flex items-center justify-center shrink-0 ml-2">
          <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in-50 duration-100">
          <div className="p-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md border border-slate-200">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari..."
                autoFocus
                className="w-full text-xs bg-transparent outline-none text-slate-700 placeholder-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {showCustomOption && (
              <button
                type="button"
                onClick={() => {
                  onChange(search.trim());
                  setIsOpen(false);
                  setSearch('');
                }}
                className="w-full px-3 py-2 text-left text-xs sm:text-sm font-semibold text-[#05828e] bg-[#f0f7f8] hover:bg-[#e4f1f3] flex items-center gap-1.5 border-b border-slate-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Gunakan &quot;{search.trim()}&quot;</span>
              </button>
            )}
            {filtered.length === 0 && !showCustomOption ? (
              <div className="px-3 py-2 text-xs text-slate-400 text-center">Tidak ada data</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full px-3 py-2 text-left text-xs sm:text-sm hover:bg-[#f0f7f8] flex items-center justify-between ${
                    value === opt.value
                      ? 'text-[#05828e] font-semibold bg-[#f0f7f8]/50'
                      : 'text-slate-700'
                  }`}
                >
                  <span>{opt.label}</span>
                  {value === opt.value && <Check className="w-4 h-4 text-[#05828e]" />}
                </button>
              ))
            )}
            {onAddNew && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onAddNew();
                }}
                className="w-full px-3 py-2 text-left text-xs font-semibold text-[#05828e] hover:bg-[#f0f7f8] border-t border-slate-100 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{addNewLabel || 'Tambah Data Baru...'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const FormIdentitas: React.FC<FormIdentitasProps> = ({
  initialData,
  identitasList = [],
  karyawanList = [],
  onSave,
  onCancel,
  onShowToast = (_msg: string) => {},
  jenisPanggilanList = [],
  triyanaList = [],
  pekerjaanList = [],
  mengenalYpplnList = [],
  onAddNewJenisPanggilan,
  onAddNewTriyana,
  onAddNewPekerjaan,
  onAddNewMengenalYppln,
}) => {
  const activeKaryawan = React.useMemo(() => {
    return karyawanList && karyawanList.length > 0 ? karyawanList : loadKaryawan();
  }, [karyawanList]);

  // Hitung Kode Otomatis 5 angka berdasarkan identitas terdaftar
  const generatedCode = React.useMemo(() => {
    if (initialData?.codeId) {
      return initialData.codeId;
    }
    const existingNums = identitasList
      .map((it) => {
        const m = (it.codeId || '').match(/\d+/);
        return m ? parseInt(m[0], 10) : 0;
      })
      .filter((n) => !isNaN(n) && n > 0);

    const maxCode = existingNums.length > 0 ? Math.max(...existingNums) : 0;
    const nextCodeNum = maxCode + 1;
    return String(nextCodeNum).padStart(5, '0');
  }, [initialData, identitasList]);

  // Form State
  const [nomorIdentitas, setNomorIdentitas] = useState(initialData?.nomorIdentitas || '');
  const [jenisIdentitas, setJenisIdentitas] = useState<'KTP' | 'Passport' | 'Nomor Siswa'>(
    initialData?.jenisIdentitas || 'KTP'
  );
  const [namaLengkapKtp, setNamaLengkapKtp] = useState(initialData?.namaLengkapKtp || '');
  const [namaLengkap, setNamaLengkap] = useState(initialData?.namaLengkap || '');
  const [namaPanggilan, setNamaPanggilan] = useState(initialData?.namaPanggilan || '');
  const [jenisPanggilan, setJenisPanggilan] = useState(initialData?.jenisPanggilan || '');
  const [jenisKelamin, setJenisKelamin] = useState<'Laki-laki' | 'Perempuan'>(
    initialData?.jenisKelamin === 'P' ? 'Perempuan' : 'Laki-laki'
  );
  const [tempatLahir, setTempatLahir] = useState(initialData?.tempatLahir || '');
  const [tanggalLahir, setTanggalLahir] = useState(initialData?.tanggalLahir || '');

  // Phone list (support multiple like in image)
  const [phoneList, setPhoneList] = useState<string[]>(() => {
    if (initialData?.nomorHandPhone && initialData.nomorHandPhone !== '-') {
      return [initialData.nomorHandPhone];
    }
    return [''];
  });

  // Email list
  const [emailList, setEmailList] = useState<string[]>(() => {
    if (initialData?.email && initialData.email !== '-') {
      return [initialData.email];
    }
    return [''];
  });

  const [line, setLine] = useState(initialData?.line || '');
  const [instagram, setInstagram] = useState(initialData?.instagram || '');

  // Alamat State
  const [namaPenerima, setNamaPenerima] = useState(
    initialData?.alamatList?.[0]?.namaPenerima || initialData?.namaLengkap || ''
  );
  const [nomorHpAlamat, setNomorHpAlamat] = useState(
    initialData?.alamatList?.[0]?.nomorHp || initialData?.nomorHandPhone || ''
  );
  const [alamatText, setAlamatText] = useState(
    initialData?.alamatList?.[0]?.alamat ||
      initialData?.tempatTinggal?.alamat?.alamat ||
      initialData?.ktp?.alamatKtp?.alamat ||
      ''
  );
  const [kelurahan, setKelurahan] = useState(
    initialData?.alamatList?.[0]?.kelurahan ||
      initialData?.tempatTinggal?.alamat?.kelurahan ||
      ''
  );
  const [kecamatan, setKecamatan] = useState(
    initialData?.alamatList?.[0]?.kecamatan ||
      initialData?.tempatTinggal?.alamat?.kecamatan ||
      ''
  );
  const [kotaKabupaten, setKotaKabupaten] = useState(
    initialData?.alamatList?.[0]?.kotaKabupaten ||
      initialData?.alamatList?.[0]?.kota ||
      initialData?.tempatTinggal?.alamat?.kota ||
      ''
  );
  const [kodePos, setKodePos] = useState(
    initialData?.alamatList?.[0]?.kodePos ||
      initialData?.tempatTinggal?.alamat?.kodePos ||
      ''
  );
  const [notePengiriman, setNotePengiriman] = useState(
    initialData?.alamatList?.[0]?.notePengiriman || ''
  );
  const [isPrimary, setIsPrimary] = useState(
    initialData?.alamatList?.[0]?.isPrimary ?? true
  );

  // Cascading intelligent region lists based on selected kota & kecamatan
  const availableKecamatanList = useMemo(() => {
    return getKecamatanByKota(kotaKabupaten);
  }, [kotaKabupaten]);

  const availableKelurahanList = useMemo(() => {
    return getKelurahanByKecamatan(kecamatan);
  }, [kecamatan]);

  // Bottom Attributes
  const [jenis, setJenis] = useState<'Umat' | 'Sangha'>(
    initialData?.jenis || (initialData?.bhanteLay === 'Bhante' ? 'Sangha' : 'Umat')
  );
  const [wniStatus, setWniStatus] = useState<'WNI' | 'WNA'>(
    initialData?.wniStatus || 'WNI'
  );
  const [pekerjaan, setPekerjaan] = useState(initialData?.pekerjaan || '');
  const [agama, setAgama] = useState(initialData?.agama || 'Buddha');
  const [triyana, setTriyana] = useState(initialData?.triyana || '');
  const [picYppln, setPicYppln] = useState(
    initialData?.picYppln || initialData?.pic || 'Ariel'
  );
  const [mengenalYppln, setMengenalYppln] = useState(
    initialData?.mengenalYppln || ''
  );

  // Additional Settings
  const [followUpCat, setFollowUpCat] = useState(
    initialData?.followUpList?.[0] || 'Prospek'
  );
  const [followUpDur, setFollowUpDur] = useState(
    initialData?.followUpList?.[1] || '1 Bulan'
  );
  const [picUmumUser, setPicUmumUser] = useState(
    initialData?.picUmumList?.[0] || 'Ariel'
  );
  const [picUmumDept, setPicUmumDept] = useState(
    initialData?.picUmumList?.[1] || 'Tim Logistik'
  );

  const karyawanPicOptions = React.useMemo(() => {
    const opts = activeKaryawan.map((k) => ({
      label: `${k.namaLengkap}${k.namaPanggilan ? ` (${k.namaPanggilan})` : ''} - ${k.divisi}`,
      value: k.namaLengkap,
    }));
    if (picYppln && !opts.some((o) => o.value === picYppln || o.label.startsWith(picYppln))) {
      opts.unshift({ label: picYppln, value: picYppln });
    }
    return opts;
  }, [activeKaryawan, picYppln]);

  const picUmumOptions = React.useMemo(() => {
    const opts = activeKaryawan.map((k) => ({
      label: `${k.namaLengkap}${k.namaPanggilan ? ` (${k.namaPanggilan})` : ''}`,
      value: k.namaLengkap,
    }));
    if (picUmumUser && !opts.some((o) => o.value === picUmumUser || o.label.startsWith(picUmumUser))) {
      opts.unshift({ label: picUmumUser, value: picUmumUser });
    }
    return opts;
  }, [activeKaryawan, picUmumUser]);

  // Modals for adding master records
  const [isAddJenisPanggilanOpen, setIsAddJenisPanggilanOpen] = useState(false);
  const [isAddTriyanaOpen, setIsAddTriyanaOpen] = useState(false);
  const [isAddPekerjaanOpen, setIsAddPekerjaanOpen] = useState(false);
  const [isAddMengenalYpplnOpen, setIsAddMengenalYpplnOpen] = useState(false);

  // When Nama Lengkap changes, if namaPenerima is empty, set it
  const handleNamaLengkapChange = (val: string) => {
    setNamaLengkap(val);
    if (!namaPenerima || namaPenerima === namaLengkap) {
      setNamaPenerima(val);
    }
  };

  // Submit Handler
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!namaLengkap.trim()) {
      onShowToast('Mohon isi Nama Lengkap');
      return;
    }

    const initials = namaLengkap
      .trim()
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');

    const colors = [
      'bg-[#14b8a6]',
      'bg-[#eab308]',
      'bg-[#64748b]',
      'bg-[#0f766e]',
      'bg-[#05828e]',
      'bg-[#f97316]',
      'bg-[#8b5cf6]',
    ];
    const chosenBg =
      initialData?.avatarBg ||
      colors[Math.floor(Math.random() * colors.length)];

    const primaryPhone = phoneList.find((p) => p.trim().length > 0) || '-';
    const primaryEmail = emailList.find((em) => em.trim().length > 0) || '-';

    const alamatItem: AlamatIdentitas = {
      id: initialData?.alamatList?.[0]?.id || `addr-${Date.now()}`,
      namaPenerima: namaPenerima.trim() || namaLengkap.trim(),
      nomorHp: nomorHpAlamat.trim() || primaryPhone,
      alamat: alamatText.trim(),
      kelurahan,
      kecamatan,
      kotaKabupaten,
      kota: kotaKabupaten,
      kodePos: kodePos.trim(),
      notePengiriman: notePengiriman.trim(),
      isPrimary,
    };

    const finalItem: IdentitasItem = {
      id: initialData?.id || `id-${Date.now()}`,
      codeId: generatedCode,
      nomorIdentitas: nomorIdentitas.trim() || undefined,
      jenisIdentitas,
      namaLengkapKtp: namaLengkapKtp.trim() || undefined,
      namaLengkap: namaLengkap.trim(),
      namaPanggilan: namaPanggilan.trim() || namaLengkap.trim().split(' ')[0],
      jenisPanggilan: jenisPanggilan || undefined,
      jenisKelamin: jenisKelamin === 'Perempuan' ? 'P' : 'L',
      tempatLahir: tempatLahir.trim() || undefined,
      tanggalLahir: tanggalLahir.trim() || '01 Jan 1990',
      nomorHandPhone: primaryPhone,
      email: primaryEmail,
      line: line.trim() || undefined,
      instagram: instagram.trim() || undefined,
      bhanteLay: jenis === 'Sangha' ? 'Bhante' : 'Lay',
      jenis,
      wniStatus,
      pekerjaan: pekerjaan || undefined,
      agama: agama || 'Buddha',
      triyana: triyana || undefined,
      picYppln: picYppln || 'Ariel',
      pic: picYppln || 'Ariel',
      mengenalYppln: mengenalYppln || undefined,
      organisasi: initialData?.organisasi || 'YPPLN',
      status: initialData?.status || '-',
      custDuration: initialData?.custDuration || '-',
      lastContacted: initialData?.lastContacted || 'Hari ini',
      avatarInitial: initials || 'ID',
      avatarBg: chosenBg,
      avatarUrl: initialData?.avatarUrl,
      kota: kotaKabupaten || 'Bandung',
      provinsi: 'Jawa Barat',
      alamatList: [alamatItem],
      tempatTinggal: {
        samaDenganKtp: true,
        alamat: alamatItem,
      },
      ktp: {
        nik: nomorIdentitas.trim() || '-',
        alamatKtp: alamatItem,
      },
      followUpList: [followUpCat, followUpDur],
      picUmumList: [picUmumUser, picUmumDept],
    };

    onSave(finalItem);
  };

  // Kode + Nama Lengkap text
  const displayKodeNamaLengkap = namaLengkap.trim()
    ? `${generatedCode} ${namaLengkap.trim()}`
    : 'Auto Input by Apps....';

  return (
    <div className="w-full pb-20 font-sans">
      {/* Top Toolbar matching Image: EyeOff, Search, Sliders, + Add */}
      <div className="flex items-center justify-end gap-3 mb-6">
        <button
          type="button"
          onClick={() => onShowToast('Fitur visibilitas kolom')}
          title="Sembunyikan / Tampilkan"
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
        >
          <EyeOff className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          type="button"
          onClick={() => onShowToast('Pencarian cepat aktif')}
          title="Cari"
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
        >
          <Search className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          type="button"
          onClick={() => onShowToast('Filter form')}
          title="Filter Data"
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          type="button"
          onClick={() => onShowToast('Formulir siap diisi')}
          className="bg-[#05828e] hover:bg-[#046c76] text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer ml-1"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Main Form Fields Container matching screenshot layout */}
      <div className="w-full max-w-4xl space-y-4 px-1 sm:px-4">
        {/* 1. Nomor Identitas */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
            Nomor Identitas
          </label>
          <div className="sm:col-span-8 max-w-md w-full">
            <input
              type="text"
              value={nomorIdentitas}
              onChange={(e) => setNomorIdentitas(e.target.value)}
              placeholder="Input Text..."
              className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
            />
          </div>
        </div>

        {/* 2. Jenis Identitas */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-start pt-1">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal pt-0.5">
            Jenis Identitas
          </label>
          <div className="sm:col-span-8 max-w-md w-full space-y-2.5">
            <div className="flex items-center gap-8">
              <label
                onClick={() => setJenisIdentitas('KTP')}
                className="flex items-center gap-2 cursor-pointer text-sm text-slate-800 select-none"
              >
                <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center transition-colors">
                  {jenisIdentitas === 'KTP' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#05828e]" />
                  )}
                </div>
                <span>KTP</span>
              </label>

              <label
                onClick={() => setJenisIdentitas('Passport')}
                className="flex items-center gap-2 cursor-pointer text-sm text-slate-800 select-none"
              >
                <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center transition-colors">
                  {jenisIdentitas === 'Passport' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#05828e]" />
                  )}
                </div>
                <span>Passport</span>
              </label>
            </div>

            <div>
              <label
                onClick={() => setJenisIdentitas('Nomor Siswa')}
                className="flex items-center gap-2 cursor-pointer text-sm text-slate-800 select-none"
              >
                <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center transition-colors">
                  {jenisIdentitas === 'Nomor Siswa' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#05828e]" />
                  )}
                </div>
                <span>Nomor Siswa</span>
              </label>
            </div>
          </div>
        </div>

        {/* 3. Kode + Nama Lengkap (Auto Input by Apps / 5 digit urutan) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center pt-1">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
            Kode + Nama Lengkap
          </label>
          <div className="sm:col-span-8 max-w-md w-full">
            <div className="w-full h-10 px-3.5 bg-[#b8bec5] rounded-lg text-sm text-slate-700 flex items-center select-none font-normal">
              {displayKodeNamaLengkap}
            </div>
          </div>
        </div>

        {/* 4. Nama Lengkap KTP */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
            Nama Lengkap KTP
          </label>
          <div className="sm:col-span-8 max-w-md w-full">
            <input
              type="text"
              value={namaLengkapKtp}
              onChange={(e) => setNamaLengkapKtp(e.target.value)}
              placeholder="Input Text..."
              className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
            />
          </div>
        </div>

        {/* 5. Nama Lengkap */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
            Nama Lengkap
          </label>
          <div className="sm:col-span-8 max-w-md w-full">
            <input
              type="text"
              value={namaLengkap}
              onChange={(e) => handleNamaLengkapChange(e.target.value)}
              placeholder="Input Text..."
              className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
            />
          </div>
        </div>

        {/* 6. Nama Panggilan */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
            Nama Panggilan
          </label>
          <div className="sm:col-span-8 max-w-md w-full">
            <input
              type="text"
              value={namaPanggilan}
              onChange={(e) => setNamaPanggilan(e.target.value)}
              placeholder="Input Text..."
              className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
            />
          </div>
        </div>

        {/* 7. Jenis Panggilan */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
            Jenis Panggilan
          </label>
          <div className="sm:col-span-8 max-w-md w-full">
            <SearchDropdown
              value={jenisPanggilan}
              onChange={setJenisPanggilan}
              placeholder="Search..."
              options={jenisPanggilanList.map((jp) => ({
                label: jp.jenisPanggilan,
                value: jp.jenisPanggilan,
              }))}
              onAddNew={() => setIsAddJenisPanggilanOpen(true)}
              addNewLabel="+ Tambah Jenis Panggilan..."
            />
          </div>
        </div>

        {/* 8. Jenis Kelamin */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center pt-1">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
            Jenis Kelamin
          </label>
          <div className="sm:col-span-8 max-w-md w-full flex items-center gap-8">
            <label
              onClick={() => setJenisKelamin('Laki-laki')}
              className="flex items-center gap-2 cursor-pointer text-sm text-slate-800 select-none"
            >
              <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center transition-colors">
                {jenisKelamin === 'Laki-laki' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#05828e]" />
                )}
              </div>
              <span>Laki-laki</span>
            </label>

            <label
              onClick={() => setJenisKelamin('Perempuan')}
              className="flex items-center gap-2 cursor-pointer text-sm text-slate-800 select-none"
            >
              <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center transition-colors">
                {jenisKelamin === 'Perempuan' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#05828e]" />
                )}
              </div>
              <span>Perempuan</span>
            </label>
          </div>
        </div>

        {/* 9. Tempat Lahir */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
            Tempat Lahir
          </label>
          <div className="sm:col-span-8 max-w-md w-full">
            <input
              type="text"
              value={tempatLahir}
              onChange={(e) => setTempatLahir(e.target.value)}
              placeholder="Input Text..."
              className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
            />
          </div>
        </div>

        {/* 10. Tanggal Lahir */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
            Tanggal Lahir
          </label>
          <div className="sm:col-span-8 max-w-md w-full relative">
            <input
              type="text"
              value={tanggalLahir}
              onChange={(e) => setTanggalLahir(e.target.value)}
              placeholder="Input Date..."
              className="w-full h-10 px-3.5 pr-10 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
            />
            <div className="absolute right-3 top-2.5 text-[#05828e] pointer-events-none">
              <Calendar className="w-4 h-4 stroke-[2]" />
            </div>
            <input
              type="date"
              aria-label="Pilih Tanggal Lahir"
              title="Pilih Tanggal Lahir"
              onClick={(e) => {
                try {
                  (e.currentTarget as HTMLInputElement).showPicker?.();
                } catch (_) {}
              }}
              onChange={(e) => {
                if (e.target.value) {
                  setTanggalLahir(formatDatePickerValue(e.target.value));
                }
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 opacity-0 cursor-pointer z-10"
            />
          </div>
        </div>

        {/* 11. Nomor Hand Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-start">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal pt-2">
            Nomor Hand Phone
          </label>
          <div className="sm:col-span-8 max-w-md w-full space-y-2">
            {phoneList.map((ph, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={ph}
                  onChange={(e) => {
                    const next = [...phoneList];
                    next[idx] = e.target.value;
                    setPhoneList(next);
                  }}
                  placeholder="Input Text..."
                  className="flex-1 h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (phoneList.length > 1) {
                      setPhoneList(phoneList.filter((_, i) => i !== idx));
                    } else {
                      const next = [...phoneList];
                      next[idx] = '';
                      setPhoneList(next);
                    }
                  }}
                  title="Hapus"
                  className="text-[#05828e] hover:text-[#046c76] p-1 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
                {idx === phoneList.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setPhoneList([...phoneList, ''])}
                    title="Tambah Nomor"
                    className="w-5 h-5 rounded-full bg-[#05828e] hover:bg-[#046c76] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 12. Email */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-start">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal pt-2">
            Email
          </label>
          <div className="sm:col-span-8 max-w-md w-full space-y-2">
            {emailList.map((em, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={em}
                  onChange={(e) => {
                    const next = [...emailList];
                    next[idx] = e.target.value;
                    setEmailList(next);
                  }}
                  placeholder="Input Text..."
                  className="flex-1 h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (emailList.length > 1) {
                      setEmailList(emailList.filter((_, i) => i !== idx));
                    } else {
                      const next = [...emailList];
                      next[idx] = '';
                      setEmailList(next);
                    }
                  }}
                  title="Hapus"
                  className="text-[#05828e] hover:text-[#046c76] p-1 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
                {idx === emailList.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setEmailList([...emailList, ''])}
                    title="Tambah Email"
                    className="w-5 h-5 rounded-full bg-[#05828e] hover:bg-[#046c76] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 13. Line */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
            Line
          </label>
          <div className="sm:col-span-8 max-w-md w-full">
            <input
              type="text"
              value={line}
              onChange={(e) => setLine(e.target.value)}
              placeholder="Input Text..."
              className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
            />
          </div>
        </div>

        {/* 14. Instagram */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
            Instagram
          </label>
          <div className="sm:col-span-8 max-w-md w-full">
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="Input Text..."
              className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
            />
          </div>
        </div>

        {/* 15. ALAMAT SECTION */}
        <div className="pt-2">
          {/* Header Alamat with red cross icon */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-4 h-4 rounded-full bg-[#ef4444] text-white flex items-center justify-center shrink-0">
              <X className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span className="text-[#05828e] font-medium text-sm">Alamat</span>
          </div>

          {/* Light-blue Card Container */}
          <div className="bg-[#f0f6f8] rounded-2xl p-5 sm:p-6 border border-[#e2eef1] space-y-3.5">
            {/* Nama Penerima */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
              <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
                Nama Penerima
              </label>
              <div className="sm:col-span-8 max-w-md w-full">
                <input
                  type="text"
                  value={namaPenerima}
                  onChange={(e) => setNamaPenerima(e.target.value)}
                  placeholder="Input Text..."
                  className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
                />
              </div>
            </div>

            {/* Nomor HP */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
              <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
                Nomor HP
              </label>
              <div className="sm:col-span-8 max-w-md w-full">
                <input
                  type="text"
                  value={nomorHpAlamat}
                  onChange={(e) => setNomorHpAlamat(e.target.value)}
                  placeholder="Input Text..."
                  className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
                />
              </div>
            </div>

            {/* Alamat (Textarea) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-start">
              <label className="sm:col-span-4 text-slate-700 text-sm font-normal pt-2">
                Alamat
              </label>
              <div className="sm:col-span-8 max-w-md w-full">
                <textarea
                  rows={3}
                  value={alamatText}
                  onChange={(e) => setAlamatText(e.target.value)}
                  placeholder="Input Text..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] resize-none transition-colors"
                />
              </div>
            </div>

            {/* Kelurahan */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
              <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
                Kelurahan
              </label>
              <div className="sm:col-span-8 max-w-md w-full">
                <SearchDropdown
                  value={kelurahan}
                  onChange={setKelurahan}
                  placeholder="Search..."
                  options={availableKelurahanList.map((k) => ({ label: k, value: k }))}
                  allowCustom={true}
                />
              </div>
            </div>

            {/* Kecamatan */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
              <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
                Kecamatan
              </label>
              <div className="sm:col-span-8 max-w-md w-full">
                <SearchDropdown
                  value={kecamatan}
                  onChange={setKecamatan}
                  placeholder="Search..."
                  options={availableKecamatanList.map((k) => ({ label: k, value: k }))}
                  allowCustom={true}
                />
              </div>
            </div>

            {/* Kota/Kabupaten */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
              <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
                Kota/Kabupaten
              </label>
              <div className="sm:col-span-8 max-w-md w-full">
                <SearchDropdown
                  value={kotaKabupaten}
                  onChange={setKotaKabupaten}
                  placeholder="Search..."
                  options={KOTA_KABUPATEN_LIST.map((k) => ({ label: k, value: k }))}
                  allowCustom={true}
                />
              </div>
            </div>

            {/* Kode Pos */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
              <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
                Kode Pos
              </label>
              <div className="sm:col-span-8 max-w-md w-full">
                <input
                  type="text"
                  value={kodePos}
                  onChange={(e) => setKodePos(e.target.value)}
                  placeholder="Input Text..."
                  className="w-full h-10 px-3.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
                />
              </div>
            </div>

            {/* Note Pengiriman (Textarea) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-start">
              <label className="sm:col-span-4 text-slate-700 text-sm font-normal pt-2">
                Note Pengiriman
              </label>
              <div className="sm:col-span-8 max-w-md w-full">
                <textarea
                  rows={3}
                  value={notePengiriman}
                  onChange={(e) => setNotePengiriman(e.target.value)}
                  placeholder="Input Text..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] resize-none transition-colors"
                />
              </div>
            </div>

            {/* Primary? */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center pt-1">
              <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
                Primary?
              </label>
              <div className="sm:col-span-8 max-w-md w-full">
                <button
                  type="button"
                  onClick={() => setIsPrimary(!isPrimary)}
                  className="w-5 h-5 rounded border-2 border-[#05828e] bg-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  {isPrimary && <Check className="w-3.5 h-3.5 text-[#05828e] stroke-[3]" />}
                </button>
              </div>
            </div>
          </div>

          {/* + Add Alamat Button */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => onShowToast('Alamat baru ditambahkan')}
              className="inline-flex items-center gap-1.5 text-[#05828e] hover:text-[#046c76] font-medium text-sm transition-colors cursor-pointer"
            >
              <div className="w-4 h-4 rounded-full bg-[#05828e] text-white flex items-center justify-center">
                <Plus className="w-3 h-3 stroke-[3]" />
              </div>
              <span>Add Alamat</span>
            </button>
          </div>
        </div>

        {/* 16. Jenis */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center pt-2">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
            Jenis
          </label>
          <div className="sm:col-span-8 max-w-md w-full flex items-center gap-8">
            <label
              onClick={() => setJenis('Umat')}
              className="flex items-center gap-2 cursor-pointer text-sm text-slate-800 select-none"
            >
              <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center transition-colors">
                {jenis === 'Umat' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#05828e]" />
                )}
              </div>
              <span>Umat</span>
            </label>

            <label
              onClick={() => setJenis('Sangha')}
              className="flex items-center gap-2 cursor-pointer text-sm text-slate-800 select-none"
            >
              <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center transition-colors">
                {jenis === 'Sangha' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#05828e]" />
                )}
              </div>
              <span>Sangha</span>
            </label>
          </div>
        </div>

        {/* 17. WNI/A */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center pt-1">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
            WNI/A
          </label>
          <div className="sm:col-span-8 max-w-md w-full flex items-center gap-8">
            <label
              onClick={() => setWniStatus('WNI')}
              className="flex items-center gap-2 cursor-pointer text-sm text-slate-800 select-none"
            >
              <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center transition-colors">
                {wniStatus === 'WNI' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#05828e]" />
                )}
              </div>
              <span>WNI</span>
            </label>

            <label
              onClick={() => setWniStatus('WNA')}
              className="flex items-center gap-2 cursor-pointer text-sm text-slate-800 select-none"
            >
              <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center transition-colors">
                {wniStatus === 'WNA' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#05828e]" />
                )}
              </div>
              <span>WNA</span>
            </label>
          </div>
        </div>

        {/* 18. Pekerjaan */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
            Pekerjaan
          </label>
          <div className="sm:col-span-8 max-w-md w-full">
            <SearchDropdown
              value={pekerjaan}
              onChange={setPekerjaan}
              placeholder="Search..."
              options={pekerjaanList.map((p) => ({
                label: p.namaPekerjaan,
                value: p.namaPekerjaan,
              }))}
              onAddNew={() => setIsAddPekerjaanOpen(true)}
              addNewLabel="+ Tambah Pekerjaan..."
            />
          </div>
        </div>

        {/* 19. Agama */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
            Agama
          </label>
          <div className="sm:col-span-8 max-w-md w-full">
            <SearchDropdown
              value={agama}
              onChange={setAgama}
              placeholder="Search..."
              options={AGAMA_LIST.map((ag) => ({ label: ag, value: ag }))}
            />
          </div>
        </div>

        {/* 20. Triyana */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
            Triyana
          </label>
          <div className="sm:col-span-8 max-w-md w-full">
            <SearchDropdown
              value={triyana}
              onChange={setTriyana}
              placeholder="Search..."
              options={triyanaList.map((tr) => ({
                label: tr.triyana,
                value: tr.triyana,
              }))}
              onAddNew={() => setIsAddTriyanaOpen(true)}
              addNewLabel="+ Tambah Triyana..."
            />
          </div>
        </div>

        {/* 21. PIC YPPLN */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
            PIC YPPLN
          </label>
          <div className="sm:col-span-8 max-w-md w-full">
            <SearchDropdown
              value={picYppln}
              onChange={setPicYppln}
              placeholder="Search..."
              options={karyawanPicOptions}
            />
          </div>
        </div>

        {/* 22. Mengenal YPPLN */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
          <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
            Mengenal YPPLN
          </label>
          <div className="sm:col-span-8 max-w-md w-full">
            <SearchDropdown
              value={mengenalYppln}
              onChange={setMengenalYppln}
              placeholder="Search..."
              options={mengenalYpplnList.map((m) => ({
                label: m.mengenalYppln,
                value: m.mengenalYppln,
              }))}
              onAddNew={() => setIsAddMengenalYpplnOpen(true)}
              addNewLabel="+ Tambah Mengenal YPPLN..."
            />
          </div>
        </div>

        {/* 23. ADDITIONAL SETTINGS SECTION */}
        <div className="pt-2">
          {/* Header with red cross icon */}
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-4 h-4 rounded-full bg-[#ef4444] text-white flex items-center justify-center shrink-0">
              <X className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span className="text-[#05828e] font-medium text-sm">Additional Settings</span>
          </div>

          <div className="space-y-3.5">
            {/* Follow Up */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
              <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
                Follow Up
              </label>
              <div className="sm:col-span-8 max-w-md w-full flex items-center gap-2">
                <div className="flex-1">
                  <SearchDropdown
                    value={followUpCat}
                    onChange={setFollowUpCat}
                    placeholder="Search..."
                    options={FOLLOW_UP_CAT_LIST.map((c) => ({ label: c, value: c }))}
                  />
                </div>
                <div className="flex-1">
                  <SearchDropdown
                    value={followUpDur}
                    onChange={setFollowUpDur}
                    placeholder="Search..."
                    options={FOLLOW_UP_DUR_LIST.map((d) => ({ label: d, value: d }))}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFollowUpCat('');
                    setFollowUpDur('');
                  }}
                  title="Hapus"
                  className="text-[#05828e] hover:text-[#046c76] p-1 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => onShowToast('Tambah setting follow up')}
                  title="Tambah"
                  className="w-5 h-5 rounded-full bg-[#05828e] hover:bg-[#046c76] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* PIC Umum */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-center">
              <label className="sm:col-span-4 text-slate-700 text-sm font-normal">
                PIC Umum
              </label>
              <div className="sm:col-span-8 max-w-md w-full flex items-center gap-2">
                <div className="flex-1">
                  <SearchDropdown
                    value={picUmumUser}
                    onChange={setPicUmumUser}
                    placeholder="Search..."
                    options={picUmumOptions}
                  />
                </div>
                <div className="flex-1">
                  <SearchDropdown
                    value={picUmumDept}
                    onChange={setPicUmumDept}
                    placeholder="Search..."
                    options={PIC_UMUM_DEPT_LIST.map((dp) => ({ label: dp, value: dp }))}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPicUmumUser('');
                    setPicUmumDept('');
                  }}
                  title="Hapus"
                  className="text-[#05828e] hover:text-[#046c76] p-1 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={() => onShowToast('Tambah PIC Umum')}
                  title="Tambah"
                  className="w-5 h-5 rounded-full bg-[#05828e] hover:bg-[#046c76] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: Cancel & Save matching image position and styling */}
        <div className="flex items-center justify-end gap-3 pt-8 max-w-md sm:max-w-none sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-7 py-2 rounded-lg border border-slate-300 text-slate-600 bg-white hover:bg-slate-50 font-medium text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="px-8 py-2 rounded-lg bg-[#05828e] hover:bg-[#046c76] text-white font-medium text-sm shadow-xs transition-colors cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>

      {/* Modal Tambah Jenis Panggilan */}
      <AddJenisPanggilanModal
        isOpen={isAddJenisPanggilanOpen}
        onClose={() => setIsAddJenisPanggilanOpen(false)}
        onSave={(newItem) => {
          if (onAddNewJenisPanggilan) {
            onAddNewJenisPanggilan(newItem);
          }
          setJenisPanggilan(newItem.jenisPanggilan);
          onShowToast(`Jenis Panggilan "${newItem.jenisPanggilan}" berhasil ditambahkan`);
        }}
      />

      {/* Modal Tambah Pekerjaan */}
      <AddMasterItemModal
        isOpen={isAddPekerjaanOpen}
        onClose={() => setIsAddPekerjaanOpen(false)}
        title="Tambah Pekerjaan"
        nameLabel="Nama Pekerjaan"
        namePlaceholder="Contoh: Karyawan Swasta, Dokter, Guru..."
        onSave={(name, ket) => {
          if (onAddNewPekerjaan) {
            onAddNewPekerjaan(name, ket);
          }
          setPekerjaan(name);
          onShowToast(`Pekerjaan "${name}" berhasil ditambahkan`);
        }}
      />

      {/* Modal Tambah Triyana */}
      <AddMasterItemModal
        isOpen={isAddTriyanaOpen}
        onClose={() => setIsAddTriyanaOpen(false)}
        title="Tambah Triyana"
        nameLabel="Triyana"
        namePlaceholder="Contoh: Theravada, Mahayana, Tantrayana..."
        onSave={(name, ket) => {
          if (onAddNewTriyana) {
            onAddNewTriyana(name, ket);
          }
          setTriyana(name);
          onShowToast(`Triyana "${name}" berhasil ditambahkan`);
        }}
      />

      {/* Modal Tambah Mengenal YPPLN */}
      <AddMasterItemModal
        isOpen={isAddMengenalYpplnOpen}
        onClose={() => setIsAddMengenalYpplnOpen(false)}
        title="Tambah Mengenal YPPLN"
        nameLabel="Mengenal YPPLN"
        namePlaceholder="Contoh: Teman/Keluarga, Media Sosial, Event..."
        onSave={(name, ket) => {
          if (onAddNewMengenalYppln) {
            onAddNewMengenalYppln(name, ket);
          }
          setMengenalYppln(name);
          onShowToast(`Mengenal YPPLN "${name}" berhasil ditambahkan`);
        }}
      />
    </div>
  );
};
