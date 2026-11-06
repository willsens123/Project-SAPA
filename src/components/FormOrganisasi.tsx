import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  EyeOff,
  Plus,
  X,
  ChevronDown,
  Calendar,
  Check,
} from 'lucide-react';
import { OrganisasiItem, TriyanaItem, PicOrgEntry, AlamatOrgItem, TanggalPentingItem, KaryawanItem } from '../types';
import { IdentitasItem } from '../identitasData';
import { loadKaryawan } from '../karyawanData';
import { formatDatePickerValue } from '../utils/datePickerHelper';

interface FormOrganisasiProps {
  initialData?: OrganisasiItem | null;
  identitasList: IdentitasItem[];
  triyanaList?: TriyanaItem[];
  karyawanList?: KaryawanItem[];
  onSave: (data: OrganisasiItem) => void;
  onCancel: () => void;
  onShowToast?: (msg: string) => void;
}

const DEFAULT_JENIS_ORG_OPTIONS = [
  'Bank',
  'Dharma Center',
  'Organisasi Buddhis',
  'Vihara',
  'Vihara, Cetya',
  'Sekolah',
  'Yayasan',
  'Komunitas',
  'Perusahaan / Corporate',
  'Media / Publikasi',
  'Pemerintahan',
  'Lainnya',
];

const DEFAULT_PIC_ROLE_OPTIONS = [
  'Call Center',
  'Direktur',
  'Sales',
  'Ketua',
  'Wakil Ketua',
  'Sekretaris',
  'Bendahara',
  'Koordinator',
  'Humas',
  'Penasihat',
  'PIC Kegiatan',
  'Admin',
];

const DEFAULT_PIC_INTERNAL_OPTIONS = [
  'Agustino',
  'Cindy',
  'Silvi',
  'Ariel',
  'Bhadra',
  'Denny',
  'Lani',
];

import {
  INDONESIA_KOTA_KABUPATEN_LIST,
  INDONESIA_KECAMATAN_LIST,
  INDONESIA_KELURAHAN_LIST,
  getKecamatanByKota,
  getKelurahanByKecamatan,
} from '../indonesiaRegionData';

const getCardKecamatanOptions = (kota?: string) => {
  const kecs = getKecamatanByKota(kota);
  return [
    ...kecs.map((k) => `Kecamatan ${k}`),
    ...kecs,
  ];
};

const getCardKelurahanOptions = (kec?: string) => {
  const kels = getKelurahanByKecamatan(kec);
  return [
    ...kels.map((k) => `Kelurahan ${k}`),
    ...kels,
  ];
};

const DEFAULT_KELURAHAN_OPTIONS = [
  ...INDONESIA_KELURAHAN_LIST.map((k) => `Kelurahan ${k}`),
  ...INDONESIA_KELURAHAN_LIST,
];

const DEFAULT_KECAMATAN_OPTIONS = [
  ...INDONESIA_KECAMATAN_LIST.map((k) => `Kecamatan ${k}`),
  ...INDONESIA_KECAMATAN_LIST,
];

const DEFAULT_KOTA_OPTIONS = INDONESIA_KOTA_KABUPATEN_LIST;

export const FormOrganisasi: React.FC<FormOrganisasiProps> = ({
  initialData,
  identitasList,
  triyanaList = [],
  karyawanList = [],
  onSave,
  onCancel,
  onShowToast = (_msg: string) => {},
}) => {
  const isEditing = !!initialData;

  const activeKaryawan = karyawanList && karyawanList.length > 0 ? karyawanList : loadKaryawan();

  // Nama Organisasi
  const [namaOrg, setNamaOrg] = useState(initialData?.namaOrg || '');

  // Jenis Organisasi
  const [jenisOrg, setJenisOrg] = useState(initialData?.jenisOrg || '');
  const [isJenisOrgOpen, setIsJenisOrgOpen] = useState(false);
  const [jenisOrgSearch, setJenisOrgSearch] = useState('');
  const jenisOrgRef = useRef<HTMLDivElement>(null);

  // Sub-Organisasi (List of strings)
  const [subOrgList, setSubOrgList] = useState<string[]>(() => {
    if (initialData?.subOrgList && initialData.subOrgList.length > 0) {
      return initialData.subOrgList;
    }
    if (initialData?.subOrg) {
      return [initialData.subOrg];
    }
    return [''];
  });

  // Triyana
  const [triyana, setTriyana] = useState(initialData?.triyana || '');
  const [isTriyanaOpen, setIsTriyanaOpen] = useState(false);
  const [triyanaSearch, setTriyanaSearch] = useState('');
  const triyanaRef = useRef<HTMLDivElement>(null);

  // Media Partner (Radio: Yes / No)
  const [mediaPartner, setMediaPartner] = useState<boolean>(initialData?.mediaPartner ?? false);

  // PIC Org (Connected to Identitas Database)
  // Search 1: Peran/Jabatan PIC (Call Center, Direktur, Sales, Ketua, dll)
  // Search 2: Nama dan HP dari database Identitas
  const [picOrgRows, setPicOrgRows] = useState<PicOrgEntry[]>(() => {
    if (initialData?.picOrgEntries && initialData.picOrgEntries.length > 0) {
      return initialData.picOrgEntries;
    }
    if (initialData?.picOrgId || initialData?.picOrgNama) {
      return [
        {
          id: `pic-${Date.now()}`,
          role: initialData.picOrgRole || 'Call Center',
          identitasId: initialData.picOrgId || '',
          identitasCode: initialData.picOrgCode || '',
          identitasNama: initialData.picOrgNama || '',
          identitasHp: initialData.picOrgHp || initialData.hp || '',
        },
      ];
    }
    return [
      {
        id: `pic-${Date.now()}`,
        role: '',
        identitasId: '',
        identitasCode: '',
        identitasNama: '',
        identitasHp: '',
      },
    ];
  });

  // Active dropdown states for PIC Org rows
  const [openPicRoleRowIndex, setOpenPicRoleRowIndex] = useState<number | null>(null);
  const [openPicIdentitasRowIndex, setOpenPicIdentitasRowIndex] = useState<number | null>(null);
  const [picRoleSearch, setPicRoleSearch] = useState('');
  const [picIdentitasSearch, setPicIdentitasSearch] = useState('');
  const picRoleRef = useRef<HTMLDivElement>(null);
  const picIdentitasRef = useRef<HTMLDivElement>(null);

  // Nomor Hand Phone Organisasi
  const [hp, setHp] = useState(initialData?.hp || '');

  // Email
  const [email, setEmail] = useState(initialData?.email || '');

  // Instagram
  const [instagram, setInstagram] = useState(initialData?.instagram || '');

  // Alamat Cards
  const [alamatCards, setAlamatCards] = useState<AlamatOrgItem[]>(() => {
    if (initialData?.alamatList && initialData.alamatList.length > 0) {
      return initialData.alamatList;
    }
    return [
      {
        id: `alamat-${Date.now()}`,
        namaPenerima: '',
        nomorHp: '',
        alamat: initialData?.alamat || '',
        kelurahan: '',
        kecamatan: '',
        kotaKabupaten: initialData?.kota || '',
        kodePos: '',
        notePengiriman: '',
        isPrimary: false,
      },
    ];
  });

  // Dropdown states for Alamat
  const [openKelurahanIdx, setOpenKelurahanIdx] = useState<number | null>(null);
  const [openKecamatanIdx, setOpenKecamatanIdx] = useState<number | null>(null);
  const [openKotaIdx, setOpenKotaIdx] = useState<number | null>(null);
  const [kelurahanSearch, setKelurahanSearch] = useState('');
  const [kecamatanSearch, setKecamatanSearch] = useState('');
  const [kotaSearch, setKotaSearch] = useState('');
  const kelurahanRef = useRef<HTMLDivElement>(null);
  const kecamatanRef = useRef<HTMLDivElement>(null);
  const kotaRef = useRef<HTMLDivElement>(null);

  // Tanggal Penting
  const [tanggalPentingRows, setTanggalPentingRows] = useState<TanggalPentingItem[]>(() => {
    if (initialData?.tanggalPentingList && initialData.tanggalPentingList.length > 0) {
      return initialData.tanggalPentingList;
    }
    return [
      {
        id: `tp-${Date.now()}`,
        date: '',
        label: '',
      },
    ];
  });

  // PIC YPPLN (Dipilih dari Karyawan)
  const [picYppln, setPicYppln] = useState(
    initialData?.picYppln || initialData?.pic || ''
  );
  const [isPicOpen, setIsPicOpen] = useState(false);
  const [picSearch, setPicSearch] = useState('');
  const picRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (jenisOrgRef.current && !jenisOrgRef.current.contains(target)) {
        setIsJenisOrgOpen(false);
      }
      if (triyanaRef.current && !triyanaRef.current.contains(target)) {
        setIsTriyanaOpen(false);
      }
      if (picRoleRef.current && !picRoleRef.current.contains(target)) {
        setOpenPicRoleRowIndex(null);
      }
      if (picIdentitasRef.current && !picIdentitasRef.current.contains(target)) {
        setOpenPicIdentitasRowIndex(null);
      }
      if (kelurahanRef.current && !kelurahanRef.current.contains(target)) {
        setOpenKelurahanIdx(null);
      }
      if (kecamatanRef.current && !kecamatanRef.current.contains(target)) {
        setOpenKecamatanIdx(null);
      }
      if (kotaRef.current && !kotaRef.current.contains(target)) {
        setOpenKotaIdx(null);
      }
      if (picRef.current && !picRef.current.contains(target)) {
        setIsPicOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sub-Organisasi handlers
  const handleAddSubOrg = () => {
    setSubOrgList((prev) => [...prev, '']);
  };
  const handleRemoveSubOrg = (idx: number) => {
    if (subOrgList.length === 1) {
      setSubOrgList(['']);
    } else {
      setSubOrgList((prev) => prev.filter((_, i) => i !== idx));
    }
  };
  const handleUpdateSubOrg = (idx: number, val: string) => {
    setSubOrgList((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  // PIC Org handlers
  const handleAddPicOrgRow = () => {
    setPicOrgRows((prev) => [
      ...prev,
      {
        id: `pic-${Date.now()}`,
        role: '',
        identitasId: '',
        identitasCode: '',
        identitasNama: '',
        identitasHp: '',
      },
    ]);
  };

  const handleRemovePicOrgRow = (idx: number) => {
    if (picOrgRows.length === 1) {
      setPicOrgRows([
        {
          id: `pic-${Date.now()}`,
          role: '',
          identitasId: '',
          identitasCode: '',
          identitasNama: '',
          identitasHp: '',
        },
      ]);
    } else {
      setPicOrgRows((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleSelectPicIdentitas = (idx: number, item: IdentitasItem) => {
    setPicOrgRows((prev) => {
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        identitasId: item.id,
        identitasCode: item.codeId || '',
        identitasNama: item.namaLengkap,
        identitasHp: item.nomorHandPhone,
      };
      return next;
    });
    // Auto-fill org HP if currently empty
    if (!hp.trim() && item.nomorHandPhone) {
      setHp(item.nomorHandPhone);
    }
    setOpenPicIdentitasRowIndex(null);
  };

  const handleSelectPicRole = (idx: number, roleName: string) => {
    setPicOrgRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], role: roleName };
      return next;
    });
    setOpenPicRoleRowIndex(null);
  };

  // Alamat Cards handlers
  const handleAddAlamatCard = () => {
    setAlamatCards((prev) => [
      ...prev,
      {
        id: `alamat-${Date.now()}`,
        namaPenerima: '',
        nomorHp: '',
        alamat: '',
        kelurahan: '',
        kecamatan: '',
        kotaKabupaten: '',
        kodePos: '',
        notePengiriman: '',
        isPrimary: false,
      },
    ]);
  };

  const handleRemoveAlamatCard = (idx: number) => {
    if (alamatCards.length === 1) {
      setAlamatCards([
        {
          id: `alamat-${Date.now()}`,
          namaPenerima: '',
          nomorHp: '',
          alamat: '',
          kelurahan: '',
          kecamatan: '',
          kotaKabupaten: '',
          kodePos: '',
          notePengiriman: '',
          isPrimary: false,
        },
      ]);
    } else {
      setAlamatCards((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleUpdateAlamatCard = (idx: number, field: keyof AlamatOrgItem, value: any) => {
    setAlamatCards((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  // Tanggal Penting handlers
  const handleAddTanggalPenting = () => {
    setTanggalPentingRows((prev) => [
      ...prev,
      {
        id: `tp-${Date.now()}`,
        date: '',
        label: '',
      },
    ]);
  };

  const handleRemoveTanggalPenting = (idx: number) => {
    if (tanggalPentingRows.length === 1) {
      setTanggalPentingRows([
        {
          id: `tp-${Date.now()}`,
          date: '',
          label: '',
        },
      ]);
    } else {
      setTanggalPentingRows((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleUpdateTanggalPenting = (idx: number, field: 'date' | 'label', val: string) => {
    setTanggalPentingRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  // Save handler
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaOrg.trim()) {
      onShowToast('Nama Organisasi wajib diisi');
      return;
    }

    const primaryPic = picOrgRows.find((p) => p.identitasId) || picOrgRows[0];
    const primaryAlamat = alamatCards.find((a) => a.isPrimary) || alamatCards[0];

    const initial = namaOrg.trim().charAt(0).toUpperCase();

    const savedOrg: OrganisasiItem = {
      id: initialData?.id || `org-${Date.now()}`,
      namaOrg: namaOrg.trim(),
      jenisOrg: jenisOrg || 'Organisasi',
      avatarInitial: initial,
      avatarBg: initialData?.avatarBg || 'bg-[#05828e]',
      subOrg: subOrgList.filter((s) => s.trim()).join(', '),
      subOrgList: subOrgList.filter((s) => s.trim()),
      triyana: triyana || 'Mahayana',
      mediaPartner,
      picOrgEntries: picOrgRows.filter((p) => p.role || p.identitasNama),
      picOrgId: primaryPic?.identitasId || '',
      picOrgCode: primaryPic?.identitasCode || '',
      picOrgNama: primaryPic?.identitasNama || '',
      picOrgRole: primaryPic?.role || '',
      picOrgHp: primaryPic?.identitasHp || '',
      hp: hp.trim() || primaryPic?.identitasHp || '-',
      email: email.trim(),
      instagram: instagram.trim(),
      alamatList: alamatCards,
      alamat: primaryAlamat?.alamat || '',
      kota: primaryAlamat?.kotaKabupaten || '',
      provinsi: '',
      tanggalPentingList: tanggalPentingRows.filter((t) => t.date || t.label),
      status: initialData?.status || '-',
      isCust: initialData?.isCust ?? true,
      pic: picYppln || (activeKaryawan[0]?.namaLengkap || 'Agustino Ong'),
      picYppln: picYppln || (activeKaryawan[0]?.namaLengkap || 'Agustino Ong'),
      catatan: initialData?.catatan || '',
    };

    onSave(savedOrg);
  };

  // Filtered Identitas for PIC Org search
  const filteredIdentitas = identitasList.filter((item) => {
    if (!picIdentitasSearch.trim()) return true;
    const q = picIdentitasSearch.toLowerCase();
    return (
      item.namaLengkap.toLowerCase().includes(q) ||
      (item.codeId && item.codeId.toLowerCase().includes(q)) ||
      (item.namaPanggilan && item.namaPanggilan.toLowerCase().includes(q)) ||
      item.nomorHandPhone.toLowerCase().includes(q)
    );
  });

  // Triyana options (from triyanaList or default)
  const triyanaOptions =
    triyanaList.length > 0
      ? triyanaList.map((t) => t.triyana)
      : ['Mahayana', 'Theravada', 'Vajrayana', 'Non-Sektarian', 'Lainnya'];

  return (
    <div className="w-full pb-20">
      {/* Top Toolbar matching Image: EyeOff, Search, Sliders, + Add */}
      <div className="flex items-center justify-end gap-3.5 mb-8">
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
          onClick={() => onShowToast('Fitur pencarian form')}
          title="Cari"
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
        >
          <Search className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          type="button"
          onClick={() => onShowToast('Filter form')}
          title="Filter"
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          id="btn-toolbar-add"
          type="button"
          onClick={() => {
            setNamaOrg('');
            setHp('');
            setEmail('');
            setInstagram('');
            onShowToast('Form siap untuk input organisasi baru');
          }}
          className="bg-[#05828e] text-white px-4 py-1.5 rounded-lg font-semibold text-sm hover:bg-[#046c76] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      <form onSubmit={handleSaveForm} className="space-y-5">
        {/* 1. Nama Organisasi */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
            Nama Organisasi
          </label>
          <div className="flex-1 max-w-xl">
            <input
              id="input-nama-organisasi"
              type="text"
              value={namaOrg}
              onChange={(e) => setNamaOrg(e.target.value)}
              placeholder="Input Text..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
            />
          </div>
        </div>

        {/* 2. Jenis Organisasi */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6" ref={jenisOrgRef}>
          <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
            Jenis Organisasi
          </label>
          <div className="flex-1 max-w-xl relative">
            <div
              id="select-jenis-organisasi"
              onClick={() => setIsJenisOrgOpen(!isJenisOrgOpen)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 flex items-center justify-between cursor-pointer bg-white hover:border-slate-300 transition-colors"
            >
              <span className={jenisOrg ? 'text-slate-800' : 'text-slate-400'}>
                {jenisOrg || 'Search...'}
              </span>
              <div className="w-6 h-6 rounded-full bg-[#05828e] flex items-center justify-center text-white shrink-0 shadow-xs">
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            {isJenisOrgOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in duration-100">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={jenisOrgSearch}
                    onChange={(e) => setJenisOrgSearch(e.target.value)}
                    placeholder="Cari jenis organisasi..."
                    autoFocus
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#05828e]"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {DEFAULT_JENIS_ORG_OPTIONS.filter((opt) =>
                    opt.toLowerCase().includes(jenisOrgSearch.toLowerCase())
                  ).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setJenisOrg(opt);
                        setIsJenisOrgOpen(false);
                        setJenisOrgSearch('');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        jenisOrg === opt
                          ? 'bg-[#05828e]/10 text-[#05828e] font-semibold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      {jenisOrg === opt && <Check className="w-3.5 h-3.5 text-[#05828e]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Sub-Organisasi (Multi-row with X and +) */}
        {subOrgList.map((sub, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
              {idx === 0 ? 'Sub-Organisasi' : ''}
            </label>
            <div className="flex-1 max-w-xl flex items-center gap-3">
              <input
                type="text"
                value={sub}
                onChange={(e) => handleUpdateSubOrg(idx, e.target.value)}
                placeholder="Input Text..."
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
              />
              <button
                type="button"
                onClick={() => handleRemoveSubOrg(idx)}
                title="Hapus / Reset"
                className="text-[#05828e] hover:text-[#046c76] p-1 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
              {idx === subOrgList.length - 1 && (
                <button
                  type="button"
                  onClick={handleAddSubOrg}
                  title="Tambah Sub-Organisasi"
                  className="w-6 h-6 rounded-full bg-[#05828e] text-white flex items-center justify-center hover:bg-[#046c76] transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* 4. Triyana */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6" ref={triyanaRef}>
          <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
            Triyana
          </label>
          <div className="flex-1 max-w-xl relative">
            <div
              id="select-triyana"
              onClick={() => setIsTriyanaOpen(!isTriyanaOpen)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 flex items-center justify-between cursor-pointer bg-white hover:border-slate-300 transition-colors"
            >
              <span className={triyana ? 'text-slate-800' : 'text-slate-400'}>
                {triyana || 'Search...'}
              </span>
              <div className="w-6 h-6 rounded-full bg-[#05828e] flex items-center justify-center text-white shrink-0 shadow-xs">
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            {isTriyanaOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in duration-100">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={triyanaSearch}
                    onChange={(e) => setTriyanaSearch(e.target.value)}
                    placeholder="Cari triyana..."
                    autoFocus
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#05828e]"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {triyanaOptions
                    .filter((opt) => opt.toLowerCase().includes(triyanaSearch.toLowerCase()))
                    .map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          setTriyana(opt);
                          setIsTriyanaOpen(false);
                          setTriyanaSearch('');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                          triyana === opt
                            ? 'bg-[#05828e]/10 text-[#05828e] font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt}</span>
                        {triyana === opt && <Check className="w-3.5 h-3.5 text-[#05828e]" />}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 5. Media Partner (Radio: Yes / No) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
            Media Partner
          </label>
          <div className="flex-1 max-w-xl flex items-center gap-8 py-1">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer font-medium">
              <input
                type="radio"
                name="mediaPartner"
                checked={mediaPartner === true}
                onChange={() => setMediaPartner(true)}
                className="w-4 h-4 text-[#05828e] accent-[#05828e] cursor-pointer"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer font-medium">
              <input
                type="radio"
                name="mediaPartner"
                checked={mediaPartner === false}
                onChange={() => setMediaPartner(false)}
                className="w-4 h-4 text-[#05828e] accent-[#05828e] cursor-pointer"
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {/* 6. PIC Org. (Terkoneksi dengan Database Identitas) */}
        {/* Search 1: Peran/Jabatan (Call Center, Direktur, Sales, dll) */}
        {/* Search 2: Nama & HP dari Database Identitas */}
        {picOrgRows.map((picRow, idx) => (
          <div key={picRow.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
              {idx === 0 ? 'PIC Org.' : ''}
            </label>
            <div className="flex-1 max-w-xl flex items-center gap-3">
              {/* Search 1: Peran / Jabatan PIC */}
              <div
                className="flex-1 relative"
                ref={openPicRoleRowIndex === idx ? picRoleRef : undefined}
              >
                <div
                  id={`select-pic-role-${idx}`}
                  onClick={() =>
                    setOpenPicRoleRowIndex(openPicRoleRowIndex === idx ? null : idx)
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm text-slate-700 flex items-center justify-between cursor-pointer bg-white hover:border-slate-300 transition-colors"
                >
                  <span className={picRow.role ? 'text-slate-800 truncate' : 'text-slate-400'}>
                    {picRow.role || 'Search...'}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-[#05828e] flex items-center justify-center text-white shrink-0 ml-1 shadow-xs">
                    <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>

                {openPicRoleRowIndex === idx && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in duration-100">
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={picRoleSearch}
                        onChange={(e) => setPicRoleSearch(e.target.value)}
                        placeholder="Cari / ketik peran..."
                        autoFocus
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#05828e]"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {DEFAULT_PIC_ROLE_OPTIONS.filter((r) =>
                        r.toLowerCase().includes(picRoleSearch.toLowerCase())
                      ).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => handleSelectPicRole(idx, r)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                            picRow.role === r
                              ? 'bg-[#05828e]/10 text-[#05828e] font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{r}</span>
                          {picRow.role === r && <Check className="w-3.5 h-3.5 text-[#05828e]" />}
                        </button>
                      ))}
                      {picRoleSearch.trim() &&
                        !DEFAULT_PIC_ROLE_OPTIONS.some(
                          (r) => r.toLowerCase() === picRoleSearch.trim().toLowerCase()
                        ) && (
                          <button
                            type="button"
                            onClick={() => handleSelectPicRole(idx, picRoleSearch.trim())}
                            className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-[#05828e] font-medium hover:bg-teal-50 border-t border-slate-100 mt-1"
                          >
                            + Gunakan "{picRoleSearch.trim()}"
                          </button>
                        )}
                    </div>
                  </div>
                )}
              </div>

              {/* Search 2: Nama & HP dari Database Identitas */}
              <div
                className="flex-1 relative"
                ref={openPicIdentitasRowIndex === idx ? picIdentitasRef : undefined}
              >
                <div
                  id={`select-pic-identitas-${idx}`}
                  onClick={() =>
                    setOpenPicIdentitasRowIndex(openPicIdentitasRowIndex === idx ? null : idx)
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 text-sm text-slate-700 flex items-center justify-between cursor-pointer bg-white hover:border-slate-300 transition-colors"
                >
                  <span
                    className={
                      picRow.identitasNama ? 'text-slate-800 truncate' : 'text-slate-400'
                    }
                  >
                    {picRow.identitasNama
                      ? `${picRow.identitasNama} ${picRow.identitasHp ? `- ${picRow.identitasHp}` : ''}`
                      : 'Search...'}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-[#05828e] flex items-center justify-center text-white shrink-0 ml-1 shadow-xs">
                    <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>

                {openPicIdentitasRowIndex === idx && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in duration-100 min-w-[280px]">
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={picIdentitasSearch}
                        onChange={(e) => setPicIdentitasSearch(e.target.value)}
                        placeholder="Cari nama, kode, nomor HP..."
                        autoFocus
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#05828e]"
                      />
                    </div>
                    <div className="text-[11px] font-semibold text-slate-400 px-2 pb-1">
                      Data dari Database Identitas ({filteredIdentitas.length})
                    </div>
                    <div className="max-h-52 overflow-y-auto space-y-1">
                      {filteredIdentitas.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">
                          Identitas tidak ditemukan
                        </div>
                      ) : (
                        filteredIdentitas.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectPicIdentitas(idx, item)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                              picRow.identitasId === item.id
                                ? 'bg-[#05828e]/10 text-[#05828e] font-semibold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="truncate">
                              <span className="font-semibold text-slate-800">
                                {item.codeId || item.id.slice(0, 5)} {item.namaLengkap}
                              </span>
                              {item.nomorHandPhone && (
                                <span className="text-slate-400 block text-[11px]">
                                  HP: {item.nomorHandPhone}
                                </span>
                              )}
                            </div>
                            {picRow.identitasId === item.id && (
                              <Check className="w-3.5 h-3.5 text-[#05828e] shrink-0 ml-1" />
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: X and + */}
              <button
                type="button"
                onClick={() => handleRemovePicOrgRow(idx)}
                title="Hapus / Reset Baris PIC"
                className="text-[#05828e] hover:text-[#046c76] p-1 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
              {idx === picOrgRows.length - 1 && (
                <button
                  type="button"
                  onClick={handleAddPicOrgRow}
                  title="Tambah Baris PIC Org"
                  className="w-6 h-6 rounded-full bg-[#05828e] text-white flex items-center justify-center hover:bg-[#046c76] transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* 7. Nomor Hand Phone Organisasi */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
            Nomor Hand Phone Organisasi
          </label>
          <div className="flex-1 max-w-xl">
            <input
              id="input-hp-organisasi"
              type="text"
              value={hp}
              onChange={(e) => setHp(e.target.value)}
              placeholder="Input Text..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
            />
          </div>
        </div>

        {/* 8. Email */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
            Email
          </label>
          <div className="flex-1 max-w-xl">
            <input
              id="input-email-organisasi"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Input Text..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
            />
          </div>
        </div>

        {/* 9. Instagram */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
            Instagram
          </label>
          <div className="flex-1 max-w-xl">
            <input
              id="input-instagram-organisasi"
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="Input Text..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
            />
          </div>
        </div>

        {/* 10. Alamat Section (Red X circle + Alamat label, followed by Card in bg-[#f0f9fa]) */}
        <div className="pt-2">
          {/* Section Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
              <X className="w-3 h-3 stroke-[3]" />
            </div>
            <span className="text-[#05828e] font-semibold text-sm sm:text-base">Alamat</span>
          </div>

          {/* Alamat Cards */}
          <div className="space-y-4">
            {alamatCards.map((card, cIdx) => {
              const cardKecamatanOptions = getCardKecamatanOptions(card.kotaKabupaten);
              const cardKelurahanOptions = getCardKelurahanOptions(card.kecamatan);

              return (
              <div
                key={card.id}
                className="bg-[#f0f9fa] rounded-2xl p-5 sm:p-7 space-y-4 relative border border-teal-50"
              >
                {alamatCards.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAlamatCard(cIdx)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-1 transition-colors"
                    title="Hapus alamat ini"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Nama Penerima */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 shrink-0">
                    Nama Penerima
                  </label>
                  <div className="flex-1 max-w-xl">
                    <input
                      type="text"
                      value={card.namaPenerima}
                      onChange={(e) =>
                        handleUpdateAlamatCard(cIdx, 'namaPenerima', e.target.value)
                      }
                      placeholder="Input Text..."
                      className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
                    />
                  </div>
                </div>

                {/* Nomor HP */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 shrink-0">
                    Nomor HP
                  </label>
                  <div className="flex-1 max-w-xl">
                    <input
                      type="text"
                      value={card.nomorHp}
                      onChange={(e) =>
                        handleUpdateAlamatCard(cIdx, 'nomorHp', e.target.value)
                      }
                      placeholder="Input Text..."
                      className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
                    />
                  </div>
                </div>

                {/* Alamat (Textarea) */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                  <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 shrink-0 pt-2">
                    Alamat
                  </label>
                  <div className="flex-1 max-w-xl">
                    <textarea
                      rows={3}
                      value={card.alamat}
                      onChange={(e) =>
                        handleUpdateAlamatCard(cIdx, 'alamat', e.target.value)
                      }
                      placeholder="Input Text..."
                      className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Kelurahan */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6"
                  ref={openKelurahanIdx === cIdx ? kelurahanRef : undefined}
                >
                  <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 shrink-0">
                    Kelurahan
                  </label>
                  <div className="flex-1 max-w-xl relative">
                    <div
                      onClick={() =>
                        setOpenKelurahanIdx(openKelurahanIdx === cIdx ? null : cIdx)
                      }
                      className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm text-slate-700 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
                    >
                      <span className={card.kelurahan ? 'text-slate-800' : 'text-slate-400'}>
                        {card.kelurahan || 'Search...'}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#05828e] flex items-center justify-center text-white shrink-0 shadow-xs">
                        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>

                    {openKelurahanIdx === cIdx && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in duration-100">
                        <div className="relative mb-2">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={kelurahanSearch}
                            onChange={(e) => setKelurahanSearch(e.target.value)}
                            placeholder="Cari kelurahan..."
                            autoFocus
                            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#05828e]"
                          />
                        </div>
                        <div className="max-h-52 overflow-y-auto space-y-1">
                          {kelurahanSearch.trim() &&
                            !cardKelurahanOptions.some(
                              (k) => k.toLowerCase() === kelurahanSearch.trim().toLowerCase()
                            ) && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateAlamatCard(cIdx, 'kelurahan', kelurahanSearch.trim());
                                  setOpenKelurahanIdx(null);
                                  setKelurahanSearch('');
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-[#05828e] bg-[#f0f7f8] hover:bg-[#e4f1f3] flex items-center gap-1.5 transition-colors border-b border-slate-100"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Gunakan &quot;{kelurahanSearch.trim()}&quot;</span>
                              </button>
                            )}
                          {cardKelurahanOptions.filter((k) =>
                            k.toLowerCase().includes(kelurahanSearch.toLowerCase())
                          ).slice(0, 50).map((k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => {
                                handleUpdateAlamatCard(cIdx, 'kelurahan', k);
                                setOpenKelurahanIdx(null);
                                setKelurahanSearch('');
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              {k}
                            </button>
                          ))}
                          {cardKelurahanOptions.filter((k) =>
                            k.toLowerCase().includes(kelurahanSearch.toLowerCase())
                          ).length === 0 &&
                            !kelurahanSearch.trim() && (
                              <div className="px-3 py-2 text-xs text-slate-400 text-center">
                                Tidak ada data
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kecamatan */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6"
                  ref={openKecamatanIdx === cIdx ? kecamatanRef : undefined}
                >
                  <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 shrink-0">
                    Kecamatan
                  </label>
                  <div className="flex-1 max-w-xl relative">
                    <div
                      onClick={() =>
                        setOpenKecamatanIdx(openKecamatanIdx === cIdx ? null : cIdx)
                      }
                      className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm text-slate-700 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
                    >
                      <span className={card.kecamatan ? 'text-slate-800' : 'text-slate-400'}>
                        {card.kecamatan || 'Search...'}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#05828e] flex items-center justify-center text-white shrink-0 shadow-xs">
                        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>

                    {openKecamatanIdx === cIdx && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in duration-100">
                        <div className="relative mb-2">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={kecamatanSearch}
                            onChange={(e) => setKecamatanSearch(e.target.value)}
                            placeholder="Cari kecamatan..."
                            autoFocus
                            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#05828e]"
                          />
                        </div>
                        <div className="max-h-52 overflow-y-auto space-y-1">
                          {kecamatanSearch.trim() &&
                            !cardKecamatanOptions.some(
                              (k) => k.toLowerCase() === kecamatanSearch.trim().toLowerCase()
                            ) && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateAlamatCard(cIdx, 'kecamatan', kecamatanSearch.trim());
                                  setOpenKecamatanIdx(null);
                                  setKecamatanSearch('');
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-[#05828e] bg-[#f0f7f8] hover:bg-[#e4f1f3] flex items-center gap-1.5 transition-colors border-b border-slate-100"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Gunakan &quot;{kecamatanSearch.trim()}&quot;</span>
                              </button>
                            )}
                          {cardKecamatanOptions.filter((k) =>
                            k.toLowerCase().includes(kecamatanSearch.toLowerCase())
                          ).slice(0, 50).map((k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => {
                                handleUpdateAlamatCard(cIdx, 'kecamatan', k);
                                setOpenKecamatanIdx(null);
                                setKecamatanSearch('');
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              {k}
                            </button>
                          ))}
                          {cardKecamatanOptions.filter((k) =>
                            k.toLowerCase().includes(kecamatanSearch.toLowerCase())
                          ).length === 0 &&
                            !kecamatanSearch.trim() && (
                              <div className="px-3 py-2 text-xs text-slate-400 text-center">
                                Tidak ada data
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kota/Kabupaten */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6"
                  ref={openKotaIdx === cIdx ? kotaRef : undefined}
                >
                  <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 shrink-0">
                    Kota/Kabupaten
                  </label>
                  <div className="flex-1 max-w-xl relative">
                    <div
                      onClick={() => setOpenKotaIdx(openKotaIdx === cIdx ? null : cIdx)}
                      className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm text-slate-700 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-colors"
                    >
                      <span className={card.kotaKabupaten ? 'text-slate-800' : 'text-slate-400'}>
                        {card.kotaKabupaten || 'Search...'}
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#05828e] flex items-center justify-center text-white shrink-0 shadow-xs">
                        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>

                    {openKotaIdx === cIdx && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in duration-100">
                        <div className="relative mb-2">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={kotaSearch}
                            onChange={(e) => setKotaSearch(e.target.value)}
                            placeholder="Cari kota/kabupaten..."
                            autoFocus
                            className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#05828e]"
                          />
                        </div>
                        <div className="max-h-52 overflow-y-auto space-y-1">
                          {kotaSearch.trim() &&
                            !DEFAULT_KOTA_OPTIONS.some(
                              (k) => k.toLowerCase() === kotaSearch.trim().toLowerCase()
                            ) && (
                              <button
                                type="button"
                                onClick={() => {
                                  handleUpdateAlamatCard(cIdx, 'kotaKabupaten', kotaSearch.trim());
                                  setOpenKotaIdx(null);
                                  setKotaSearch('');
                                }}
                                className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-[#05828e] bg-[#f0f7f8] hover:bg-[#e4f1f3] flex items-center gap-1.5 transition-colors border-b border-slate-100"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Gunakan &quot;{kotaSearch.trim()}&quot;</span>
                              </button>
                            )}
                          {DEFAULT_KOTA_OPTIONS.filter((k) =>
                            k.toLowerCase().includes(kotaSearch.toLowerCase())
                          ).slice(0, 50).map((k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => {
                                handleUpdateAlamatCard(cIdx, 'kotaKabupaten', k);
                                setOpenKotaIdx(null);
                                setKotaSearch('');
                              }}
                              className="w-full text-left px-3 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                              {k}
                            </button>
                          ))}
                          {DEFAULT_KOTA_OPTIONS.filter((k) =>
                            k.toLowerCase().includes(kotaSearch.toLowerCase())
                          ).length === 0 &&
                            !kotaSearch.trim() && (
                              <div className="px-3 py-2 text-xs text-slate-400 text-center">
                                Tidak ada data
                              </div>
                            )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Kode Pos */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 shrink-0">
                    Kode Pos
                  </label>
                  <div className="flex-1 max-w-xl">
                    <input
                      type="text"
                      value={card.kodePos}
                      onChange={(e) =>
                        handleUpdateAlamatCard(cIdx, 'kodePos', e.target.value)
                      }
                      placeholder="Input Text..."
                      className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
                    />
                  </div>
                </div>

                {/* Note Pengiriman */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                  <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 shrink-0 pt-2">
                    Note Pengiriman
                  </label>
                  <div className="flex-1 max-w-xl">
                    <textarea
                      rows={3}
                      value={card.notePengiriman}
                      onChange={(e) =>
                        handleUpdateAlamatCard(cIdx, 'notePengiriman', e.target.value)
                      }
                      placeholder="Input Text..."
                      className="w-full border border-slate-200 bg-white rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Primary? */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 shrink-0">
                    Primary?
                  </label>
                  <div className="flex-1 max-w-xl">
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateAlamatCard(cIdx, 'isPrimary', !card.isPrimary)
                      }
                      className={`w-6 h-6 rounded-md border-2 border-[#05828e] flex items-center justify-center transition-colors ${
                        card.isPrimary ? 'bg-[#05828e] text-white' : 'bg-white'
                      }`}
                    >
                      {card.isPrimary && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          </div>

          {/* + Add Alamat Button */}
          <div className="mt-3">
            <button
              id="btn-add-alamat"
              type="button"
              onClick={handleAddAlamatCard}
              className="flex items-center gap-2 text-[#05828e] hover:text-[#046c76] transition-colors font-medium text-sm cursor-pointer py-1"
            >
              <div className="w-5 h-5 rounded-full bg-[#05828e] text-white flex items-center justify-center shadow-xs">
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span>Add Alamat</span>
            </button>
          </div>
        </div>

        {/* 11. Tanggal Penting */}
        {tanggalPentingRows.map((tp, idx) => (
          <div key={tp.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 pt-2">
            <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
              {idx === 0 ? 'Tanggal Penting' : ''}
            </label>
            <div className="flex-1 max-w-xl flex items-center gap-3">
              {/* Input Date with Calendar icon */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={tp.date}
                  onChange={(e) => handleUpdateTanggalPenting(idx, 'date', e.target.value)}
                  placeholder="Input Date..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors pr-10"
                />
                <Calendar className="w-4 h-4 text-[#05828e] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  aria-label="Pilih Tanggal Penting"
                  title="Pilih Tanggal"
                  onClick={(e) => {
                    try {
                      (e.currentTarget as HTMLInputElement).showPicker?.();
                    } catch (_) {}
                  }}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleUpdateTanggalPenting(idx, 'date', formatDatePickerValue(e.target.value));
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 opacity-0 cursor-pointer z-10"
                />
              </div>

              {/* Input Label */}
              <div className="flex-1">
                <input
                  type="text"
                  value={tp.label}
                  onChange={(e) => handleUpdateTanggalPenting(idx, 'label', e.target.value)}
                  placeholder="Input Label..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#05828e] transition-colors"
                />
              </div>

              {/* X and + Buttons */}
              <button
                type="button"
                onClick={() => handleRemoveTanggalPenting(idx)}
                title="Hapus baris tanggal"
                className="text-[#05828e] hover:text-[#046c76] p-1 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
              {idx === tanggalPentingRows.length - 1 && (
                <button
                  type="button"
                  onClick={handleAddTanggalPenting}
                  title="Tambah Tanggal Penting"
                  className="w-6 h-6 rounded-full bg-[#05828e] text-white flex items-center justify-center hover:bg-[#046c76] transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* 12. PIC YPPLN (Internal) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 pt-2" ref={picRef}>
          <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
            PIC YPPLN
          </label>
          <div className="flex-1 max-w-xl relative">
            <div
              id="select-pic-yppln"
              onClick={() => setIsPicOpen(!isPicOpen)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 flex items-center justify-between cursor-pointer bg-white hover:border-slate-300 transition-colors"
            >
              <span className={picYppln ? 'text-slate-800' : 'text-slate-400'}>
                {picYppln || 'Search...'}
              </span>
              <div className="w-6 h-6 rounded-full bg-[#05828e] flex items-center justify-center text-white shrink-0 shadow-xs">
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            {isPicOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in duration-100">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={picSearch}
                    onChange={(e) => setPicSearch(e.target.value)}
                    placeholder="Cari Karyawan / PIC YPPLN..."
                    autoFocus
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#05828e]"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {activeKaryawan
                    .filter((k) => {
                      const q = picSearch.toLowerCase();
                      return (
                        k.namaLengkap.toLowerCase().includes(q) ||
                        (k.namaPanggilan && k.namaPanggilan.toLowerCase().includes(q)) ||
                        (k.kodeKaryawan && k.kodeKaryawan.toLowerCase().includes(q)) ||
                        (k.divisi && k.divisi.toLowerCase().includes(q))
                      );
                    })
                    .map((k) => {
                      const isSelected =
                        picYppln === k.namaLengkap ||
                        picYppln === k.namaPanggilan ||
                        (picYppln && k.namaLengkap.toLowerCase().startsWith(picYppln.toLowerCase()));
                      return (
                        <button
                          key={k.id}
                          type="button"
                          onClick={() => {
                            setPicYppln(k.namaLengkap);
                            setIsPicOpen(false);
                            setPicSearch('');
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#05828e]/10 text-[#05828e] font-semibold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded-full ${k.avatarBg || 'bg-[#05828e]'} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>
                              {k.avatarInitial || k.namaLengkap.charAt(0)}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-medium text-slate-800">{k.namaLengkap}</span>
                              {k.namaPanggilan && (
                                <span className="text-slate-400 text-[11px]">({k.namaPanggilan})</span>
                              )}
                            </div>
                            <span className="ml-auto mr-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                              {k.divisi}
                            </span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#05828e] shrink-0" />}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 13. Cancel & Save Buttons (Bottom Right matching image) */}
        <div className="flex items-center justify-end gap-4 pt-8 border-t border-slate-100">
          <button
            id="btn-cancel-organisasi"
            type="button"
            onClick={onCancel}
            className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 font-medium px-8 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-save-organisasi"
            type="submit"
            className="bg-[#05828e] hover:bg-[#046c76] text-white font-medium px-8 py-2.5 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};
