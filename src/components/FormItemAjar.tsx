import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  ChevronDown,
  Plus,
  X,
  EyeOff,
  Search,
  SlidersHorizontal,
  Link2,
  Check,
} from 'lucide-react';
import { ItemAjarEvent, ItemAjarChild } from '../itemAjarData';
import { SubJenisItemAjarItem, getSubJenisAjarFromStorage } from '../subJenisAjarData';
import { JenisAcaraItemAjarItem, getJenisAcaraAjarFromStorage } from '../jenisAcaraAjarData';
import { DivisiItem, ProjectItem } from '../types';
import { INITIAL_DIVISI } from '../divisiData';
import { INITIAL_PROJECTS } from '../data';
import { formatDatePickerValue } from '../utils/datePickerHelper';
import { DateRangePickerPopover } from './DateRangePickerPopover';

interface VariableItemRow {
  id: string;
  namaVariable: string;
  jenisAcara: string;
  topik: string;
  identitasPengisi1: string;
  identitasPengisi2: string;
  tanggal: string;
  jam: string;
  isOnline: boolean;
  lokasiKegiatan: string;
  kotaKabupaten: string;
  provinsi: string;
  platform: string;
}

interface PaketItemRow {
  id: string;
  namaPaket: string;
  isiPaket1: string;
  isiPaket2: string;
  harga: string;
  identitasId: string;
}

interface FormItemAjarProps {
  onCancel: () => void;
  onSave: (newEvent: ItemAjarEvent) => void;
  onShowToast?: (msg: string) => void;
  subJenisList?: SubJenisItemAjarItem[];
  jenisAcaraList?: JenisAcaraItemAjarItem[];
  onNavigateToSubJenis?: () => void;
  onNavigateToJenisAcara?: () => void;
  divisiList?: DivisiItem[];
  projectsList?: ProjectItem[];
}

export const FormItemAjar: React.FC<FormItemAjarProps> = ({
  onCancel,
  onSave,
  onShowToast = (_msg: string) => {},
  subJenisList,
  jenisAcaraList,
  onNavigateToSubJenis,
  onNavigateToJenisAcara,
  divisiList = INITIAL_DIVISI,
  projectsList = INITIAL_PROJECTS,
}) => {
  const effectiveSubJenisList =
    subJenisList && subJenisList.length > 0 ? subJenisList : getSubJenisAjarFromStorage();

  const effectiveJenisAcaraList =
    jenisAcaraList && jenisAcaraList.length > 0 ? jenisAcaraList : getJenisAcaraAjarFromStorage();
  // 1. Top Level Fields
  const [proyekSapa, setProyekSapa] = useState('');
  const [isProyekDropdownOpen, setIsProyekDropdownOpen] = useState(false);
  const [pemasukanDivisi, setPemasukanDivisi] = useState('EVE'); // Auto isi sesuai Proyek SAPA, bisa diganti
  const [namaItem, setNamaItem] = useState('');
  const [subNamaItem, setSubNamaItem] = useState('');
  const [subJenisItem, setSubJenisItem] = useState('');
  const [isSubJenisDropdownOpen, setIsSubJenisDropdownOpen] = useState(false);

  // Available division options from master Divisi
  const allDivisiOptions = React.useMemo(() => {
    if (divisiList && divisiList.length > 0) {
      return Array.from(new Set(divisiList.map((d) => d.namaDivisi).filter(Boolean)));
    }
    return INITIAL_DIVISI.map((d) => d.namaDivisi);
  }, [divisiList]);

  // Handler selecting Proyek SAPA -> auto sets Pemasukan Divisi
  const handleSelectProyekSapa = (opt: string) => {
    setProyekSapa(opt);
    setIsProyekDropdownOpen(false);

    // Look up project division from projectsList
    const matched = (projectsList || []).find(
      (p) =>
        p.namaKegiatan.toLowerCase().trim() === opt.toLowerCase().trim() ||
        opt.toLowerCase().includes(p.namaKegiatan.toLowerCase())
    );
    if (matched && matched.divisi) {
      setPemasukanDivisi(matched.divisi);
      onShowToast(`Pemasukan Divisi otomatis diset ke "${matched.divisi}"`);
    } else {
      const foundDiv = allDivisiOptions.find((d) => opt.toUpperCase().includes(d.toUpperCase()));
      if (foundDiv) {
        setPemasukanDivisi(foundDiv);
        onShowToast(`Pemasukan Divisi otomatis diset ke "${foundDiv}"`);
      } else if (!pemasukanDivisi) {
        setPemasukanDivisi('EVE');
      }
    }
  };

  // Proyek SAPA options combined with live projects
  const sampleProyekOptions = React.useMemo(() => {
    const list = (projectsList || []).map((p) => `${p.namaKegiatan} - ${p.divisi}`);
    const defaults = [
      'Indonesia Lamrim Retreat 2021',
      'SEALF 2022',
      'NDBF 2022',
      'Lam-Talk 2021',
      'NOBARBEKU',
      'Program Edukasi Dhamma Online',
    ];
    return Array.from(new Set([...list, ...defaults]));
  }, [projectsList]);

  // 2. Variable Items (Matches screenshot with 2 default items: 1st offline, 2nd online)
  const [variableItems, setVariableItems] = useState<VariableItemRow[]>([
    {
      id: 'var-1',
      namaVariable: '',
      jenisAcara: '',
      topik: '',
      identitasPengisi1: '',
      identitasPengisi2: '',
      tanggal: '',
      jam: '',
      isOnline: false,
      lokasiKegiatan: '',
      kotaKabupaten: '',
      provinsi: '',
      platform: '',
    },
    {
      id: 'var-2',
      namaVariable: '',
      jenisAcara: '',
      topik: '',
      identitasPengisi1: '',
      identitasPengisi2: '',
      tanggal: '',
      jam: '',
      isOnline: true,
      lokasiKegiatan: '',
      kotaKabupaten: '',
      provinsi: '',
      platform: '',
    },
  ]);

  // 3. Paket Items
  const [paketItems, setPaketItems] = useState<PaketItemRow[]>([
    {
      id: 'paket-1',
      namaPaket: '',
      isiPaket1: '',
      isiPaket2: '',
      harga: '',
      identitasId: '',
    },
  ]);

  // 4. Middle Fields
  const [keterangan, setKeterangan] = useState('');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false);

  // 5. Collapsible Sections
  const [isKeteranganOpen, setIsKeteranganOpen] = useState(true);
  const [isModalItemOpen, setIsModalItemOpen] = useState(false);
  const [isStrategiOpen, setIsStrategiOpen] = useState(true);

  // Keterangan Item Fields
  const [dharmaPatriot1, setDharmaPatriot1] = useState('');
  const [dharmaPatriot2, setDharmaPatriot2] = useState('');
  const [kerjaSama, setKerjaSama] = useState('');
  const [mediaPartner, setMediaPartner] = useState('');
  const [linkFoto, setLinkFoto] = useState('');
  const [linkLaporan, setLinkLaporan] = useState('');
  const [target1, setTarget1] = useState('');
  const [target2, setTarget2] = useState('');

  // Modal Item Fields (when expanded)
  const [modalNamaBiaya, setModalNamaBiaya] = useState('');
  const [modalNominal, setModalNominal] = useState('');

  // Strategi Promosi Fields
  const [targetPersona, setTargetPersona] = useState('');
  const [kategoriItem1, setKategoriItem1] = useState('');
  const [kategoriItem2, setKategoriItem2] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [shortPositioning, setShortPositioning] = useState('');
  const [detailedPositioning, setDetailedPositioning] = useState('');
  const [keunggulanProduk, setKeunggulanProduk] = useState('');

  // Predefined options
  const sampleSubJenisOptions = [
    'Kelas Dharma Dasar',
    'Meditasi & Mindfulness',
    'Workshop Kepemimpinan Buddhis',
    'Bimbingan Rohani & Konseling',
    'Pelatihan Guru Sekolah Minggu',
  ];

  const sampleJenisAcara = [
    'Webinar Interaktif',
    'Workshop Praktik',
    'Kelas Rutin Mingguan',
    'Seminar Nasional',
    'Retreat Meditasi',
    'Bimbingan Rohani',
  ];

  const samplePlatformOptions = [
    'Zoom Meeting',
    'Google Meet',
    'YouTube Live',
    'Microsoft Teams',
    'Discord Channel',
  ];

  const sampleKotaOptions = [
    'Jakarta Pusat',
    'Jakarta Barat',
    'Bandung',
    'Surabaya',
    'Semarang',
    'Medan',
    'Denpasar',
  ];

  const sampleProvinsiOptions = [
    'DKI Jakarta',
    'Jawa Barat',
    'Jawa Timur',
    'Jawa Tengah',
    'Sumatera Utara',
    'Bali',
  ];

  // Handlers for Variable Items
  const addVariableItem = () => {
    const newId = `var-${Date.now()}`;
    setVariableItems((prev) => [
      ...prev,
      {
        id: newId,
        namaVariable: '',
        jenisAcara: '',
        topik: '',
        identitasPengisi1: '',
        identitasPengisi2: '',
        tanggal: '',
        jam: '',
        isOnline: false,
        lokasiKegiatan: '',
        kotaKabupaten: '',
        provinsi: '',
        platform: '',
      },
    ]);
  };

  const removeVariableItem = (id: string) => {
    if (variableItems.length <= 1) {
      setVariableItems([
        {
          id: `var-${Date.now()}`,
          namaVariable: '',
          jenisAcara: '',
          topik: '',
          identitasPengisi1: '',
          identitasPengisi2: '',
          tanggal: '',
          jam: '',
          isOnline: false,
          lokasiKegiatan: '',
          kotaKabupaten: '',
          provinsi: '',
          platform: '',
        },
      ]);
      return;
    }
    setVariableItems((prev) => prev.filter((v) => v.id !== id));
  };

  const updateVariableItem = <K extends keyof VariableItemRow>(
    id: string,
    key: K,
    val: VariableItemRow[K]
  ) => {
    setVariableItems((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [key]: val } : v))
    );
  };

  // Handlers for Paket Items
  const addPaket = () => {
    const newId = `paket-${Date.now()}`;
    setPaketItems((prev) => [
      ...prev,
      {
        id: newId,
        namaPaket: '',
        isiPaket1: '',
        isiPaket2: '',
        harga: '',
        identitasId: '',
      },
    ]);
  };

  const removePaket = (id: string) => {
    if (paketItems.length <= 1) {
      setPaketItems([
        {
          id: `paket-${Date.now()}`,
          namaPaket: '',
          isiPaket1: '',
          isiPaket2: '',
          harga: '',
          identitasId: '',
        },
      ]);
      return;
    }
    setPaketItems((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePaket = <K extends keyof PaketItemRow>(
    id: string,
    key: K,
    val: PaketItemRow[K]
  ) => {
    setPaketItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [key]: val } : p))
    );
  };

  // Reset form
  const handleResetForm = () => {
    setProyekSapa('');
    setNamaItem('');
    setSubNamaItem('');
    setSubJenisItem('');
    setVariableItems([
      {
        id: `var-${Date.now()}`,
        namaVariable: '',
        jenisAcara: '',
        topik: '',
        identitasPengisi1: '',
        identitasPengisi2: '',
        tanggal: '',
        jam: '',
        isOnline: false,
        lokasiKegiatan: '',
        kotaKabupaten: '',
        provinsi: '',
        platform: '',
      },
      {
        id: `var-${Date.now() + 1}`,
        namaVariable: '',
        jenisAcara: '',
        topik: '',
        identitasPengisi1: '',
        identitasPengisi2: '',
        tanggal: '',
        jam: '',
        isOnline: true,
        lokasiKegiatan: '',
        kotaKabupaten: '',
        provinsi: '',
        platform: '',
      },
    ]);
    setPaketItems([
      {
        id: `paket-${Date.now()}`,
        namaPaket: '',
        isiPaket1: '',
        isiPaket2: '',
        harga: '',
        identitasId: '',
      },
    ]);
    setKeterangan('');
    setTanggalMulai('');
    setTanggalSelesai('');
    onShowToast('Form Item A-AJAR siap diisi');
  };

  // Save form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const title = namaItem.trim() || 'Item A-AJAR Baru';
    const subTitle = subNamaItem.trim() || proyekSapa.trim() || 'Program Pengajaran A-AJAR';

    // Construct child items from variable items & paket items
    const childItems: ItemAjarChild[] = [];

    variableItems
      .filter((v) => v.namaVariable.trim() !== '')
      .forEach((v, idx) => {
        childItems.push({
          id: `child-var-${Date.now()}-${idx}`,
          badgeLetter: v.namaVariable.trim().charAt(0).toUpperCase() || 'M',
          badgeColor: idx % 2 === 0 ? 'bg-[#008d91]' : 'bg-[#0F766E]',
          name: v.namaVariable.trim(),
          price: v.isOnline ? 'Online (Gratis)' : 'Tatap Muka',
          description: v.topik.trim() || v.jenisAcara || 'Modul Pembelajaran',
          tanggal: v.tanggal || '-',
        });
      });

    paketItems
      .filter((p) => p.namaPaket.trim() !== '')
      .forEach((p, idx) => {
        let priceStr = p.harga.trim();
        if (priceStr && !priceStr.startsWith('Rp')) {
          const num = parseInt(priceStr.replace(/\D/g, ''), 10);
          priceStr = !isNaN(num) ? `Rp${num.toLocaleString('id-ID')}` : `Rp${priceStr}`;
        }
        childItems.push({
          id: `child-paket-${Date.now()}-${idx}`,
          badgeLetter: p.namaPaket.trim().charAt(0).toUpperCase() || 'P',
          badgeColor: 'bg-[#E05D44]',
          name: p.namaPaket.trim(),
          price: priceStr || 'Gratis',
          description: p.isiPaket1 || 'Paket Materi & Konsultasi',
          tanggal: '-',
        });
      });

    const dateRange =
      tanggalMulai && tanggalSelesai
        ? `${tanggalMulai} - ${tanggalSelesai}`
        : '01 Jan 2022 - 31 Des 2022';

    const newEvent: ItemAjarEvent = {
      id: `item-ajar-${Date.now()}`,
      badgeLetter: title.charAt(0).toUpperCase() || 'A',
      badgeColor: 'bg-[#008d91]',
      name: title,
      subtitle: subTitle,
      subJenis: subJenisItem.trim() || undefined,
      subJenisItem: subJenisItem.trim() || undefined,
      proyekSapa: proyekSapa || undefined,
      pemasukanDivisi: pemasukanDivisi || 'EVE',
      status: 'Ongoing',
      tanggalRange: dateRange,
      wibTime: '09:00 WIB   17.00 WIB',
      linkText: 'Silabus - Modul',
      disalurkanKepadaText: '100 Peserta Belajar',
      isDisalurkanPill: true,
      variables: variableItems
        .filter((v) => v.namaVariable.trim() !== '')
        .map((v) => v.namaVariable.trim()),
      children:
        childItems.length > 0
          ? childItems
          : [
              {
                id: `child-init-${Date.now()}`,
                badgeLetter: 'M',
                badgeColor: 'bg-[#008d91]',
                name: 'Modul Pengantar',
                price: 'Gratis',
                description: 'Materi Pembelajaran A-AJAR',
                tanggal: '-',
              },
            ],
    };

    onSave(newEvent);
  };

  return (
    <div className="w-full pb-20 font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200">
      {/* Top Action Toolbar matching uploaded image */}
      <div className="flex items-center justify-end gap-3 mb-6 px-1">
        {/* Eye Off Icon */}
        <button
          type="button"
          title="Sembunyikan Kolom"
          onClick={() => onShowToast('Mode tampilan privasi')}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <EyeOff className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Search Toggle Icon */}
        <button
          type="button"
          title="Cari"
          onClick={() => onShowToast('Pencarian form')}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Sliders / Filter Icon */}
        <button
          type="button"
          title="Filter & Pengaturan"
          onClick={() => onShowToast('Pengaturan form')}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* + Add Button */}
        <button
          type="button"
          onClick={handleResetForm}
          className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#007b7e] text-white font-medium text-sm px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Main Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl">
        {/* 1. Proyek SAPA */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Proyek SAPA
          </label>
          <div className="md:col-span-9 relative">
            <div
              onClick={() => setIsProyekDropdownOpen(!isProyekDropdownOpen)}
              className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm cursor-pointer hover:border-slate-300 transition-colors"
            >
              <span className={proyekSapa ? 'text-slate-800' : 'text-slate-400'}>
                {proyekSapa || 'Search...'}
              </span>
              <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-2">
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            {isProyekDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-48 overflow-y-auto">
                {sampleProyekOptions.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => handleSelectProyekSapa(opt)}
                    className="px-3.5 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-[#008d91] cursor-pointer"
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pemasukan Divisi (Auto isi sesuai Proyek SAPA, opsi dari master Divisi, bisa diganti) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Pemasukan Divisi
          </label>
          <div className="md:col-span-9 relative">
            <select
              value={pemasukanDivisi}
              onChange={(e) => setPemasukanDivisi(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-3.5 pr-10 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#008d91] transition-colors appearance-none cursor-pointer"
            >
              {allDivisiOptions.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* 2. Nama Item */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Nama Item
          </label>
          <div className="md:col-span-9">
            <input
              type="text"
              value={namaItem}
              onChange={(e) => setNamaItem(e.target.value)}
              placeholder="Input Text..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
            />
          </div>
        </div>

        {/* 3. Sub-Nama Item */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Sub-Nama Item
          </label>
          <div className="md:col-span-9">
            <input
              type="text"
              value={subNamaItem}
              onChange={(e) => setSubNamaItem(e.target.value)}
              placeholder="Input Text..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
            />
          </div>
        </div>

        {/* 4. Sub-Jenis Item */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Sub-Jenis Item
          </label>
          <div className="md:col-span-9 relative">
            <div
              onClick={() => setIsSubJenisDropdownOpen(!isSubJenisDropdownOpen)}
              className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm cursor-pointer hover:border-slate-300 transition-colors"
            >
              <span className={subJenisItem ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                {subJenisItem || 'Search...'}
              </span>
              <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-2">
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            {isSubJenisDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-56 overflow-y-auto">
                {effectiveSubJenisList.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-400 text-center">
                    Belum ada sub-jenis item
                  </div>
                ) : (
                  effectiveSubJenisList.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSubJenisItem(opt.namaSubJenis);
                        setIsSubJenisDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 hover:bg-teal-50/60 flex items-center justify-between transition-colors cursor-pointer border-b border-slate-50 last:border-0"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-6 h-6 rounded-lg text-white font-bold text-[11px] flex items-center justify-center shrink-0 shadow-2xs"
                          style={{ backgroundColor: opt.iconBg || '#5A6D7C' }}
                        >
                          {opt.iconLetter || opt.namaSubJenis.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-800">{opt.namaSubJenis}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {opt.kode}
                      </span>
                    </button>
                  ))
                )}
                {onNavigateToSubJenis && (
                  <div className="border-t border-slate-100 p-2 bg-slate-50/50">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubJenisDropdownOpen(false);
                        onNavigateToSubJenis();
                      }}
                      className="w-full text-left px-2 py-1.5 text-xs text-[#008d91] font-semibold hover:bg-teal-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Kelola / Tambah Sub-Jenis Item A-AJAR</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 5. Variable Items List */}
        <div className="space-y-4 pt-2">
          {variableItems.map((varItem) => (
            <div key={varItem.id} className="space-y-2">
              {/* Header with Red X and Variable Item label */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => removeVariableItem(varItem.id)}
                  title="Hapus Variable Item"
                  className="w-4 h-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold leading-none cursor-pointer transition-colors"
                >
                  ✕
                </button>
                <span className="text-xs font-semibold text-[#008d91]">
                  Variable Item
                </span>
              </div>

              {/* Variable Item Card Box */}
              <div className="bg-[#f8fafc] border border-slate-100 rounded-2xl p-4 sm:p-5 space-y-3.5">
                {/* Nama Variable Item */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                    Nama Variable Item
                  </label>
                  <div className="md:col-span-9">
                    <input
                      type="text"
                      value={varItem.namaVariable}
                      onChange={(e) =>
                        updateVariableItem(varItem.id, 'namaVariable', e.target.value)
                      }
                      placeholder="Input Text..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
                    />
                  </div>
                </div>

                {/* Jenis Acara */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                    Jenis Acara
                  </label>
                  <div className="md:col-span-9">
                    <div className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm hover:border-slate-300 transition-colors">
                      <select
                        value={varItem.jenisAcara}
                        onChange={(e) => {
                          if (e.target.value === '__manage_jenis_acara__' && onNavigateToJenisAcara) {
                            onNavigateToJenisAcara();
                          } else {
                            updateVariableItem(varItem.id, 'jenisAcara', e.target.value);
                          }
                        }}
                        className="w-full bg-transparent text-sm text-slate-800 outline-none cursor-pointer appearance-none"
                      >
                        <option value="">Search...</option>
                        {effectiveJenisAcaraList.map((j) => (
                          <option key={j.id} value={j.namaJenisAcara}>
                            {j.namaJenisAcara} {j.kode && j.kode !== '?' ? `(${j.kode})` : ''}
                          </option>
                        ))}
                        {onNavigateToJenisAcara && (
                          <option value="__manage_jenis_acara__" className="text-[#008d91] font-semibold">
                            + Kelola / Tambah Jenis Acara Item A-AJAR
                          </option>
                        )}
                      </select>
                      <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-2 pointer-events-none">
                        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Topik */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                    Topik
                  </label>
                  <div className="md:col-span-9">
                    <input
                      type="text"
                      value={varItem.topik}
                      onChange={(e) =>
                        updateVariableItem(varItem.id, 'topik', e.target.value)
                      }
                      placeholder="Input Text..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
                    />
                  </div>
                </div>

                {/* Identitas ID Pengisi Acara (Two inputs side-by-side with X and +) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                    Identitas ID Pengisi Acara
                  </label>
                  <div className="md:col-span-9 flex items-center gap-2">
                    <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm cursor-pointer">
                      <input
                        type="text"
                        value={varItem.identitasPengisi1}
                        onChange={(e) =>
                          updateVariableItem(
                            varItem.id,
                            'identitasPengisi1',
                            e.target.value
                          )
                        }
                        placeholder="Search..."
                        className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
                      />
                      <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-1.5">
                        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>

                    <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm cursor-pointer">
                      <input
                        type="text"
                        value={varItem.identitasPengisi2}
                        onChange={(e) =>
                          updateVariableItem(
                            varItem.id,
                            'identitasPengisi2',
                            e.target.value
                          )
                        }
                        placeholder="Search..."
                        className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
                      />
                      <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-1.5">
                        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        updateVariableItem(varItem.id, 'identitasPengisi1', '');
                        updateVariableItem(varItem.id, 'identitasPengisi2', '');
                      }}
                      className="p-1 text-[#008d91] hover:text-[#007376] cursor-pointer"
                      title="Hapus"
                    >
                      <X className="w-4 h-4 stroke-[2]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onShowToast('Tambah pengisi acara')}
                      className="w-4 h-4 rounded-full bg-[#008d91] hover:bg-[#007376] text-white flex items-center justify-center cursor-pointer transition-colors"
                      title="Tambah"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Tanggal */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                    Tanggal
                  </label>
                  <div className="md:col-span-9">
                    <div className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm relative">
                      <input
                        type="text"
                        value={varItem.tanggal}
                        onChange={(e) =>
                          updateVariableItem(varItem.id, 'tanggal', e.target.value)
                        }
                        placeholder="Input Date..."
                        className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400 pr-7"
                      />
                      <Calendar className="w-4 h-4 text-[#008d91] shrink-0 ml-2 pointer-events-none" />
                      <input
                        type="date"
                        aria-label="Pilih Tanggal Sesi"
                        title="Pilih Tanggal"
                        onClick={(e) => {
                          try {
                            (e.currentTarget as HTMLInputElement).showPicker?.();
                          } catch (_) {}
                        }}
                        onChange={(e) => {
                          if (e.target.value) {
                            updateVariableItem(
                              varItem.id,
                              'tanggal',
                              formatDatePickerValue(e.target.value)
                            );
                          }
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 opacity-0 cursor-pointer z-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Jam */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                    Jam
                  </label>
                  <div className="md:col-span-9 flex items-center gap-2">
                    <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm">
                      <input
                        type="text"
                        value={varItem.jam}
                        onChange={(e) =>
                          updateVariableItem(varItem.id, 'jam', e.target.value)
                        }
                        placeholder="Input Time..."
                        className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
                      />
                      <Clock className="w-4 h-4 text-[#008d91] shrink-0 ml-2" />
                    </div>

                    <button
                      type="button"
                      onClick={() => updateVariableItem(varItem.id, 'jam', '')}
                      className="p-1 text-[#008d91] hover:text-[#007376] cursor-pointer"
                      title="Hapus"
                    >
                      <X className="w-4 h-4 stroke-[2]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onShowToast('Tambah waktu jam')}
                      className="w-4 h-4 rounded-full bg-[#008d91] hover:bg-[#007376] text-white flex items-center justify-center cursor-pointer transition-colors"
                      title="Tambah"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Online? Checkbox */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                    Online?
                  </label>
                  <div className="md:col-span-9">
                    <button
                      type="button"
                      onClick={() =>
                        updateVariableItem(varItem.id, 'isOnline', !varItem.isOnline)
                      }
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer ${
                        varItem.isOnline
                          ? 'border-[#008d91] bg-teal-50'
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                    >
                      {varItem.isOnline && (
                        <Check className="w-3.5 h-3.5 text-[#008d91] stroke-[3]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Conditional Fields based on Online? */}
                {!varItem.isOnline ? (
                  <>
                    {/* Lokasi Kegiatan */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                        Lokasi Kegiatan
                      </label>
                      <div className="md:col-span-9">
                        <input
                          type="text"
                          value={varItem.lokasiKegiatan}
                          onChange={(e) =>
                            updateVariableItem(
                              varItem.id,
                              'lokasiKegiatan',
                              e.target.value
                            )
                          }
                          placeholder="Input Text..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Kota/Kabupaten */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                        Kota/Kabupaten
                      </label>
                      <div className="md:col-span-9">
                        <div className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm cursor-pointer hover:border-slate-300 transition-colors">
                          <select
                            value={varItem.kotaKabupaten}
                            onChange={(e) =>
                              updateVariableItem(
                                varItem.id,
                                'kotaKabupaten',
                                e.target.value
                              )
                            }
                            className="w-full bg-transparent text-sm text-slate-800 outline-none cursor-pointer appearance-none"
                          >
                            <option value="">Search...</option>
                            {sampleKotaOptions.map((k) => (
                              <option key={k} value={k}>
                                {k}
                              </option>
                            ))}
                          </select>
                          <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-2 pointer-events-none">
                            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Provinsi */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                      <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                        Provinsi
                      </label>
                      <div className="md:col-span-9">
                        <div className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm cursor-pointer hover:border-slate-300 transition-colors">
                          <select
                            value={varItem.provinsi}
                            onChange={(e) =>
                              updateVariableItem(
                                varItem.id,
                                'provinsi',
                                e.target.value
                              )
                            }
                            className="w-full bg-transparent text-sm text-slate-800 outline-none cursor-pointer appearance-none"
                          >
                            <option value="">Search...</option>
                            {sampleProvinsiOptions.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                          <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-2 pointer-events-none">
                            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Platform (when Online is checked) */
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                      Platform
                    </label>
                    <div className="md:col-span-9">
                      <div className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm cursor-pointer hover:border-slate-300 transition-colors">
                        <select
                          value={varItem.platform}
                          onChange={(e) =>
                            updateVariableItem(
                              varItem.id,
                              'platform',
                              e.target.value
                            )
                          }
                          className="w-full bg-transparent text-sm text-slate-800 outline-none cursor-pointer appearance-none"
                        >
                          <option value="">Search...</option>
                          {samplePlatformOptions.map((pl) => (
                            <option key={pl} value={pl}>
                              {pl}
                            </option>
                          ))}
                        </select>
                        <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-2 pointer-events-none">
                          <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* + Variable Item Button */}
          <div>
            <button
              type="button"
              onClick={addVariableItem}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#008d91] hover:text-[#007376] cursor-pointer transition-colors"
            >
              <span className="w-4 h-4 rounded-full bg-[#008d91] text-white flex items-center justify-center text-[11px] font-bold leading-none">
                +
              </span>
              <span>Variable Item</span>
            </button>
          </div>
        </div>

        {/* 6. Paket Section */}
        <div className="space-y-4 pt-2">
          {paketItems.map((paket) => (
            <div key={paket.id} className="space-y-2">
              {/* Header with Red X and Paket label */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => removePaket(paket.id)}
                  title="Hapus Paket"
                  className="w-4 h-4 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] font-bold leading-none cursor-pointer transition-colors"
                >
                  ✕
                </button>
                <span className="text-xs font-semibold text-[#008d91]">Paket</span>
              </div>

              {/* Paket Card Box */}
              <div className="bg-[#f8fafc] border border-slate-100 rounded-2xl p-4 sm:p-5 space-y-3.5">
                {/* Nama Paket Item */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                    Nama Paket Item
                  </label>
                  <div className="md:col-span-9">
                    <input
                      type="text"
                      value={paket.namaPaket}
                      onChange={(e) =>
                        updatePaket(paket.id, 'namaPaket', e.target.value)
                      }
                      placeholder="Input Text..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
                    />
                  </div>
                </div>

                {/* Isi Paket */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                    Isi Paket
                  </label>
                  <div className="md:col-span-9 flex items-center gap-2">
                    <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm cursor-pointer">
                      <input
                        type="text"
                        value={paket.isiPaket1}
                        onChange={(e) =>
                          updatePaket(paket.id, 'isiPaket1', e.target.value)
                        }
                        placeholder="Search..."
                        className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
                      />
                      <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-1.5">
                        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>

                    <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm cursor-pointer">
                      <input
                        type="text"
                        value={paket.isiPaket2}
                        onChange={(e) =>
                          updatePaket(paket.id, 'isiPaket2', e.target.value)
                        }
                        placeholder="Search..."
                        className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
                      />
                      <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-1.5">
                        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        updatePaket(paket.id, 'isiPaket1', '');
                        updatePaket(paket.id, 'isiPaket2', '');
                      }}
                      className="p-1 text-[#008d91] hover:text-[#007376] cursor-pointer"
                      title="Hapus"
                    >
                      <X className="w-4 h-4 stroke-[2]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onShowToast('Tambah isi paket')}
                      className="w-4 h-4 rounded-full bg-[#008d91] hover:bg-[#007376] text-white flex items-center justify-center cursor-pointer transition-colors"
                      title="Tambah"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Harga */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                    Harga
                  </label>
                  <div className="md:col-span-9">
                    <div className="w-full flex items-center bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus-within:border-[#008d91] transition-colors">
                      <span className="text-sm font-bold text-[#008d91] mr-2 shrink-0">
                        Rp
                      </span>
                      <input
                        type="text"
                        value={paket.harga}
                        onChange={(e) =>
                          updatePaket(paket.id, 'harga', e.target.value)
                        }
                        placeholder="Input Nominal..."
                        className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400 bg-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Identitas ID */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                    Identitas ID
                  </label>
                  <div className="md:col-span-9 flex items-center gap-2">
                    <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm cursor-pointer">
                      <input
                        type="text"
                        value={paket.identitasId}
                        onChange={(e) =>
                          updatePaket(paket.id, 'identitasId', e.target.value)
                        }
                        placeholder="Search..."
                        className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
                      />
                      <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-1.5">
                        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => updatePaket(paket.id, 'identitasId', '')}
                      className="p-1 text-[#008d91] hover:text-[#007376] cursor-pointer"
                      title="Hapus"
                    >
                      <X className="w-4 h-4 stroke-[2]" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onShowToast('Tambah Identitas ID')}
                      className="w-4 h-4 rounded-full bg-[#008d91] hover:bg-[#007376] text-white flex items-center justify-center cursor-pointer transition-colors"
                      title="Tambah"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* + Paket Button */}
          <div>
            <button
              type="button"
              onClick={addPaket}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#008d91] hover:text-[#007376] cursor-pointer transition-colors"
            >
              <span className="w-4 h-4 rounded-full bg-[#008d91] text-white flex items-center justify-center text-[11px] font-bold leading-none">
                +
              </span>
              <span>Paket</span>
            </button>
          </div>
        </div>

        {/* 7. Keterangan */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Keterangan
          </label>
          <div className="md:col-span-9">
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Input Text..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
            />
          </div>
        </div>

        {/* 8. Tanggal Transaksi Berlangsung */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Tanggal Transaksi Berlangsung
          </label>
          <div className="md:col-span-9 flex items-center gap-2 relative">
            <div className="flex-1">
              <input
                type="text"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                onClick={() => setIsDateRangePickerOpen(true)}
                placeholder="Input Date..."
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors cursor-pointer"
              />
            </div>
            <span className="text-slate-400 text-sm">-</span>
            <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm relative">
              <input
                type="text"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                onClick={() => setIsDateRangePickerOpen(true)}
                placeholder="Input Date..."
                className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400 pr-7 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setIsDateRangePickerOpen(!isDateRangePickerOpen)}
                className="text-[#008d91] hover:text-[#05828e] cursor-pointer ml-2 shrink-0"
                title="Pilih Rentang Tanggal"
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>

            {/* Date Range Popover */}
            <DateRangePickerPopover
              isOpen={isDateRangePickerOpen}
              onClose={() => setIsDateRangePickerOpen(false)}
              startDate={tanggalMulai}
              endDate={tanggalSelesai}
              onSelectRange={(start, end) => {
                setTanggalMulai(start);
                setTanggalSelesai(end);
              }}
            />
          </div>
        </div>

        {/* 9. Collapsible Section: Keterangan Item */}
        <div className="space-y-3 pt-3">
          <button
            type="button"
            onClick={() => setIsKeteranganOpen(!isKeteranganOpen)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#008d91] hover:text-[#007376] cursor-pointer transition-colors"
          >
            <span className="text-[10px]">{isKeteranganOpen ? '▼' : '▶'}</span>
            <span>Keterangan Item</span>
          </button>

          {isKeteranganOpen && (
            <div className="space-y-3 pl-0 sm:pl-1">
              {/* Identitas ID Dharma Patriot + Divisi Patriot */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                  Identitas ID Dharma Patriot + Divisi Patriot
                </label>
                <div className="md:col-span-9 flex items-center gap-2">
                  <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm cursor-pointer">
                    <input
                      type="text"
                      value={dharmaPatriot1}
                      onChange={(e) => setDharmaPatriot1(e.target.value)}
                      placeholder="Search..."
                      className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
                    />
                    <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-1.5">
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm cursor-pointer">
                    <input
                      type="text"
                      value={dharmaPatriot2}
                      onChange={(e) => setDharmaPatriot2(e.target.value)}
                      placeholder="Search..."
                      className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
                    />
                    <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-1.5">
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setDharmaPatriot1('');
                      setDharmaPatriot2('');
                    }}
                    className="p-1 text-[#008d91] hover:text-[#007376] cursor-pointer"
                    title="Hapus"
                  >
                    <X className="w-4 h-4 stroke-[2]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onShowToast('Tambah Dharma Patriot')}
                    className="w-4 h-4 rounded-full bg-[#008d91] hover:bg-[#007376] text-white flex items-center justify-center cursor-pointer transition-colors"
                    title="Tambah"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Kerja Sama */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                  Kerja Sama
                </label>
                <div className="md:col-span-9 flex items-center gap-2">
                  <input
                    type="text"
                    value={kerjaSama}
                    onChange={(e) => setKerjaSama(e.target.value)}
                    placeholder="Input Text..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setKerjaSama('')}
                    className="p-1 text-[#008d91] hover:text-[#007376] cursor-pointer"
                    title="Hapus"
                  >
                    <X className="w-4 h-4 stroke-[2]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowToast('Tambah kerja sama')}
                    className="w-4 h-4 rounded-full bg-[#008d91] hover:bg-[#007376] text-white flex items-center justify-center cursor-pointer transition-colors"
                    title="Tambah"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Media Partner */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                  Media Partner
                </label>
                <div className="md:col-span-9 flex items-center gap-2">
                  <input
                    type="text"
                    value={mediaPartner}
                    onChange={(e) => setMediaPartner(e.target.value)}
                    placeholder="Input Text..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setMediaPartner('')}
                    className="p-1 text-[#008d91] hover:text-[#007376] cursor-pointer"
                    title="Hapus"
                  >
                    <X className="w-4 h-4 stroke-[2]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowToast('Tambah media partner')}
                    className="w-4 h-4 rounded-full bg-[#008d91] hover:bg-[#007376] text-white flex items-center justify-center cursor-pointer transition-colors"
                    title="Tambah"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Link Foto */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                  Link Foto
                </label>
                <div className="md:col-span-9 flex items-center gap-2">
                  <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm">
                    <input
                      type="text"
                      value={linkFoto}
                      onChange={(e) => setLinkFoto(e.target.value)}
                      placeholder="Input Link..."
                      className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
                    />
                    <Link2 className="w-4 h-4 text-[#008d91] shrink-0 ml-2" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setLinkFoto('')}
                    className="p-1 text-[#008d91] hover:text-[#007376] cursor-pointer"
                    title="Hapus"
                  >
                    <X className="w-4 h-4 stroke-[2]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowToast('Tambah link foto')}
                    className="w-4 h-4 rounded-full bg-[#008d91] hover:bg-[#007376] text-white flex items-center justify-center cursor-pointer transition-colors"
                    title="Tambah"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Link Laporan */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                  Link Laporan
                </label>
                <div className="md:col-span-9">
                  <div className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm">
                    <input
                      type="text"
                      value={linkLaporan}
                      onChange={(e) => setLinkLaporan(e.target.value)}
                      placeholder="Input Link..."
                      className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
                    />
                    <Link2 className="w-4 h-4 text-[#008d91] shrink-0 ml-2" />
                  </div>
                </div>
              </div>

              {/* Target */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                  Target
                </label>
                <div className="md:col-span-9 flex items-center gap-2">
                  <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm cursor-pointer">
                    <input
                      type="text"
                      value={target1}
                      onChange={(e) => setTarget1(e.target.value)}
                      placeholder="Search..."
                      className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
                    />
                    <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-1.5">
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm cursor-pointer">
                    <input
                      type="text"
                      value={target2}
                      onChange={(e) => setTarget2(e.target.value)}
                      placeholder="Search..."
                      className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
                    />
                    <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-1.5">
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setTarget1('');
                      setTarget2('');
                    }}
                    className="p-1 text-[#008d91] hover:text-[#007376] cursor-pointer"
                    title="Hapus"
                  >
                    <X className="w-4 h-4 stroke-[2]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onShowToast('Tambah target')}
                    className="w-4 h-4 rounded-full bg-[#008d91] hover:bg-[#007376] text-white flex items-center justify-center cursor-pointer transition-colors"
                    title="Tambah"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 10. Collapsible Section: Modal Item */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => setIsModalItemOpen(!isModalItemOpen)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#008d91] hover:text-[#007376] cursor-pointer transition-colors"
          >
            <span className="text-[10px]">{isModalItemOpen ? '▼' : '▶'}</span>
            <span>Modal Item</span>
          </button>

          {isModalItemOpen && (
            <div className="space-y-3 pl-0 sm:pl-1 bg-[#f8fafc] border border-slate-100 rounded-2xl p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                  Nama Biaya Modal
                </label>
                <div className="md:col-span-9">
                  <input
                    type="text"
                    value={modalNamaBiaya}
                    onChange={(e) => setModalNamaBiaya(e.target.value)}
                    placeholder="Input Text..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                  Nominal Modal
                </label>
                <div className="md:col-span-9">
                  <div className="w-full flex items-center bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus-within:border-[#008d91]">
                    <span className="text-sm font-bold text-[#008d91] mr-2 shrink-0">
                      Rp
                    </span>
                    <input
                      type="text"
                      value={modalNominal}
                      onChange={(e) => setModalNominal(e.target.value)}
                      placeholder="Input Nominal..."
                      className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 11. Collapsible Section: Strategi Promosi */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={() => setIsStrategiOpen(!isStrategiOpen)}
            className="flex items-center gap-1.5 text-xs font-bold text-[#008d91] hover:text-[#007376] cursor-pointer transition-colors"
          >
            <span className="text-[10px]">{isStrategiOpen ? '▼' : '▶'}</span>
            <span>Strategi Promosi</span>
          </button>

          {isStrategiOpen && (
            <div className="space-y-3 pl-0 sm:pl-1">
              {/* Target Persona */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                  Target Persona
                </label>
                <div className="md:col-span-9 flex items-center gap-2">
                  <input
                    type="text"
                    value={targetPersona}
                    onChange={(e) => setTargetPersona(e.target.value)}
                    placeholder="Input Text..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setTargetPersona('')}
                    className="p-1 text-[#008d91] hover:text-[#007376] cursor-pointer"
                    title="Hapus"
                  >
                    <X className="w-4 h-4 stroke-[2]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowToast('Tambah target persona')}
                    className="w-4 h-4 rounded-full bg-[#008d91] hover:bg-[#007376] text-white flex items-center justify-center cursor-pointer transition-colors"
                    title="Tambah"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Kategori Item */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                  Kategori Item
                </label>
                <div className="md:col-span-9 flex items-center gap-2">
                  <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm cursor-pointer">
                    <input
                      type="text"
                      value={kategoriItem1}
                      onChange={(e) => setKategoriItem1(e.target.value)}
                      placeholder="Search..."
                      className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
                    />
                    <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-1.5">
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>

                  <div className="flex-1 flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm cursor-pointer">
                    <input
                      type="text"
                      value={kategoriItem2}
                      onChange={(e) => setKategoriItem2(e.target.value)}
                      placeholder="Search..."
                      className="w-full text-sm outline-none text-slate-800 placeholder:text-slate-400"
                    />
                    <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-1.5">
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setKategoriItem1('');
                      setKategoriItem2('');
                    }}
                    className="p-1 text-[#008d91] hover:text-[#007376] cursor-pointer"
                    title="Hapus"
                  >
                    <X className="w-4 h-4 stroke-[2]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onShowToast('Tambah kategori')}
                    className="w-4 h-4 rounded-full bg-[#008d91] hover:bg-[#007376] text-white flex items-center justify-center cursor-pointer transition-colors"
                    title="Tambah"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                <label className="md:col-span-3 text-sm text-slate-700 font-normal pt-2">
                  Deskripsi
                </label>
                <div className="md:col-span-9">
                  <textarea
                    rows={4}
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    placeholder="Input Text..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors resize-y"
                  />
                </div>
              </div>

              {/* Short Positioning Statement */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                <label className="md:col-span-3 text-sm text-slate-700 font-normal pt-2">
                  Short Positioning Statement
                </label>
                <div className="md:col-span-9">
                  <textarea
                    rows={3}
                    value={shortPositioning}
                    onChange={(e) => setShortPositioning(e.target.value)}
                    placeholder="Input Text..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors resize-y"
                  />
                </div>
              </div>

              {/* Detailed Positioning Statement */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                <label className="md:col-span-3 text-sm text-slate-700 font-normal pt-2">
                  Detailed Positioning Statement
                </label>
                <div className="md:col-span-9">
                  <textarea
                    rows={3}
                    value={detailedPositioning}
                    onChange={(e) => setDetailedPositioning(e.target.value)}
                    placeholder="Input Text..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors resize-y"
                  />
                </div>
              </div>

              {/* Keunggulan Produk */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <label className="md:col-span-3 text-sm text-slate-700 font-normal">
                  Keunggulan Produk
                </label>
                <div className="md:col-span-9 flex items-center gap-2">
                  <input
                    type="text"
                    value={keunggulanProduk}
                    onChange={(e) => setKeunggulanProduk(e.target.value)}
                    placeholder="Input Text..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setKeunggulanProduk('')}
                    className="p-1 text-[#008d91] hover:text-[#007376] cursor-pointer"
                    title="Hapus"
                  >
                    <X className="w-4 h-4 stroke-[2]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onShowToast('Tambah keunggulan produk')}
                    className="w-4 h-4 rounded-full bg-[#008d91] hover:bg-[#007376] text-white flex items-center justify-center cursor-pointer transition-colors"
                    title="Tambah"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Actions matching uploaded image */}
        <div className="flex items-center justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-2 border border-slate-200 text-slate-600 rounded-full hover:bg-slate-50 text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-2 bg-[#008d91] hover:bg-[#00797d] text-white rounded-xl text-sm font-medium transition-colors shadow-xs cursor-pointer"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};
