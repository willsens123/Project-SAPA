import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronDown,
  ArrowRight,
  Plus,
  X,
  EyeOff,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { ItemDonasiEvent, ItemDonasiChild } from '../itemDonasiData';
import {
  SubJenisItemDonasiItem,
  getSubJenisDonasiFromStorage,
} from '../subJenisDonasiData';
import { DivisiItem, ProjectItem } from '../types';
import { INITIAL_DIVISI } from '../divisiData';
import { INITIAL_PROJECTS } from '../data';
import { formatDatePickerValue } from '../utils/datePickerHelper';
import { DateRangePickerPopover } from './DateRangePickerPopover';

interface SalurItemRow {
  id: string;
  itemSalur: string;
  jumlah: string;
}

interface VariableItemForm {
  id: string;
  namaVariable: string;
  harga: string;
  showSalur: boolean;
  salurList: SalurItemRow[];
}

interface FormItemDonasiProps {
  onCancel: () => void;
  onSave: (newEvent: ItemDonasiEvent) => void;
  onShowToast?: (msg: string) => void;
  subJenisList?: SubJenisItemDonasiItem[];
  onNavigateToSubJenis?: () => void;
  divisiList?: DivisiItem[];
  projectsList?: ProjectItem[];
}

export const FormItemDonasi: React.FC<FormItemDonasiProps> = ({
  onCancel,
  onSave,
  onShowToast = (_msg: string) => {},
  subJenisList,
  onNavigateToSubJenis,
  divisiList = INITIAL_DIVISI,
  projectsList = INITIAL_PROJECTS,
}) => {
  // Main form states matching screenshot
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalSelesai, setTanggalSelesai] = useState('');
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false);
  const [proyekSapa, setProyekSapa] = useState('');
  const [isProyekDropdownOpen, setIsProyekDropdownOpen] = useState(false);
  const [pemasukanDivisi, setPemasukanDivisi] = useState('FUN'); // Auto isi sesuai Proyek SAPA, bisa diganti

  const [namaItem, setNamaItem] = useState('');
  const [subNamaItem, setSubNamaItem] = useState('');
  const [subJenisItem, setSubJenisItem] = useState('');
  const [isSubJenisDropdownOpen, setIsSubJenisDropdownOpen] = useState(false);

  // Available division options from master Divisi
  const allDivisiOptions = useMemo(() => {
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
      // Check if project title has division tag (e.g. - MAD, - FUN, - PNB)
      const foundDiv = allDivisiOptions.find((d) => opt.toUpperCase().includes(d.toUpperCase()));
      if (foundDiv) {
        setPemasukanDivisi(foundDiv);
        onShowToast(`Pemasukan Divisi otomatis diset ke "${foundDiv}"`);
      } else if (!pemasukanDivisi) {
        setPemasukanDivisi('FUN');
      }
    }
  };

  // Variable Items state
  const [variableItems, setVariableItems] = useState<VariableItemForm[]>([
    {
      id: 'var-1',
      namaVariable: '',
      harga: '',
      showSalur: true,
      salurList: [{ id: 'salur-1', itemSalur: '', jumlah: '' }],
    },
  ]);

  const [keterangan, setKeterangan] = useState('');
  const [disalurkanKepada, setDisalurkanKepada] = useState('');

  // Proyek SAPA dynamic options combined with live projects
  const proyekOptions = useMemo(() => {
    const list = (projectsList || []).map((p) => `${p.namaKegiatan} - ${p.divisi}`);
    const defaults = [
      'Kathina Dana - MAD',
      'Dharma Patron Non-Rutin - FUN',
      'Event Halloween Party',
      'Pemberdayaan Umat',
      'Pembangunan Vihara',
      'Bantuan Bencana Alam',
    ];
    return Array.from(new Set([...list, ...defaults]));
  }, [projectsList]);

  // Sub-Jenis Item dynamic options connected to Sub-Jenis Item D-DONASI table
  const availableSubJenis = useMemo(() => {
    if (subJenisList && subJenisList.length > 0) return subJenisList;
    return getSubJenisDonasiFromStorage();
  }, [subJenisList]);

  const filteredSubJenisOptions = useMemo(() => {
    if (!subJenisItem.trim()) return availableSubJenis;
    const q = subJenisItem.toLowerCase();
    return availableSubJenis.filter(
      (it) =>
        it.namaSubJenis.toLowerCase().includes(q) ||
        it.kode.toLowerCase().includes(q)
    );
  }, [availableSubJenis, subJenisItem]);

  // Item S-SALUR options
  const itemSalurOptions = [
    'Buku Dharma Ashoka',
    'Buku Dharma Bimbisara',
    'Paket Vitamin & Imun',
    'Jubah Sangha Theravada',
    'Beras Premium 5kg',
    'Minyak Goreng 2L',
  ];

  // Variable item helpers
  const addVariableItem = () => {
    const newId = `var-${Date.now()}`;
    setVariableItems((prev) => [
      ...prev,
      {
        id: newId,
        namaVariable: '',
        harga: '',
        showSalur: true,
        salurList: [{ id: `salur-${Date.now()}`, itemSalur: '', jumlah: '' }],
      },
    ]);
  };

  const removeVariableItem = (varId: string) => {
    if (variableItems.length <= 1) {
      // Clear fields if only 1 item
      setVariableItems([
        {
          id: `var-${Date.now()}`,
          namaVariable: '',
          harga: '',
          showSalur: true,
          salurList: [{ id: `salur-${Date.now()}`, itemSalur: '', jumlah: '' }],
        },
      ]);
      return;
    }
    setVariableItems((prev) => prev.filter((v) => v.id !== varId));
  };

  const updateVariableField = (
    varId: string,
    field: 'namaVariable' | 'harga',
    val: string
  ) => {
    setVariableItems((prev) =>
      prev.map((v) => (v.id === varId ? { ...v, [field]: val } : v))
    );
  };

  const toggleSalurInVar = (varId: string) => {
    setVariableItems((prev) =>
      prev.map((v) => (v.id === varId ? { ...v, showSalur: !v.showSalur } : v))
    );
  };

  const updateSalurItem = (
    varId: string,
    salurId: string,
    field: 'itemSalur' | 'jumlah',
    val: string
  ) => {
    setVariableItems((prev) =>
      prev.map((v) => {
        if (v.id !== varId) return v;
        const updatedList = v.salurList.map((s) =>
          s.id === salurId ? { ...s, [field]: val } : s
        );
        return { ...v, salurList: updatedList };
      })
    );
  };

  const addSalurRow = (varId: string) => {
    setVariableItems((prev) =>
      prev.map((v) => {
        if (v.id !== varId) return v;
        return {
          ...v,
          salurList: [
            ...v.salurList,
            { id: `salur-${Date.now()}`, itemSalur: '', jumlah: '' },
          ],
        };
      })
    );
  };

  const removeSalurRow = (varId: string, salurId: string) => {
    setVariableItems((prev) =>
      prev.map((v) => {
        if (v.id !== varId) return v;
        if (v.salurList.length <= 1) {
          return {
            ...v,
            salurList: [{ id: `salur-${Date.now()}`, itemSalur: '', jumlah: '' }],
          };
        }
        return {
          ...v,
          salurList: v.salurList.filter((s) => s.id !== salurId),
        };
      })
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const title = namaItem.trim() || 'Item D-DONASI Baru';
    const subTitle = subNamaItem.trim() || proyekSapa.trim() || 'Master D-DONASI';

    const childItems: ItemDonasiChild[] = variableItems
      .filter((v) => v.namaVariable.trim() !== '')
      .map((v, idx) => {
        const badgeLetters = ['A', 'B', 'K', 'V', 'M', 'S'];
        const badgeColors = [
          'bg-[#008d91]',
          'bg-[#0F766E]',
          'bg-[#E05D44]',
          'bg-[#E29578]',
          'bg-[#10B981]',
        ];

        // Format price
        let formattedPrice = v.harga.trim();
        if (formattedPrice && !formattedPrice.startsWith('Rp')) {
          const num = parseInt(formattedPrice.replace(/\D/g, ''), 10);
          formattedPrice = !isNaN(num)
            ? `Rp${num.toLocaleString('id-ID')}`
            : `Rp${formattedPrice}`;
        }

        const salurDesc = v.salurList
          .filter((s) => s.itemSalur.trim() || s.jumlah.trim())
          .map((s) => `${s.jumlah || '1'} ${s.itemSalur || 'Item'}`)
          .join(', ');

        return {
          id: `child-${Date.now()}-${idx}`,
          badgeLetter:
            v.namaVariable.trim().charAt(0).toUpperCase() ||
            badgeLetters[idx % badgeLetters.length],
          badgeColor: badgeColors[idx % badgeColors.length],
          name: v.namaVariable.trim(),
          price: formattedPrice || 'Rp100.000',
          description: salurDesc || 'Paket donasi',
          tanggal: '-',
        };
      });

    const dateRange =
      tanggalMulai && tanggalSelesai
        ? `${tanggalMulai} - ${tanggalSelesai}`
        : tanggalMulai || '11 Agu 2021 - 21 Nov 2021';

    const newEvent: ItemDonasiEvent = {
      id: `item-donasi-${Date.now()}`,
      badgeLetter: title.charAt(0).toUpperCase(),
      badgeColor: 'bg-[#008d91]',
      name: title,
      subtitle: subTitle,
      proyekSapa: proyekSapa.trim() || undefined,
      pemasukanDivisi: pemasukanDivisi || 'FUN',
      status: 'Ongoing',
      tanggalRange: dateRange,
      wibTime: '00:00 WIB   23.59 WIB',
      linkText: 'Poster - Website',
      disalurkanKepadaText: disalurkanKepada.trim() || 'Pos Donasi',
      isDisalurkanPill: true,
      children: childItems,
    };

    onSave(newEvent);
    onShowToast(`Item D-DONASI "${title}" berhasil disimpan`);
  };

  const handleResetForm = () => {
    setTanggalMulai('');
    setTanggalSelesai('');
    setProyekSapa('');
    setNamaItem('');
    setSubNamaItem('');
    setSubJenisItem('');
    setVariableItems([
      {
        id: `var-${Date.now()}`,
        namaVariable: '',
        harga: '',
        showSalur: true,
        salurList: [{ id: `salur-${Date.now()}`, itemSalur: '', jumlah: '' }],
      },
    ]);
    setKeterangan('');
    setDisalurkanKepada('');
    onShowToast('Form Item D-DONASI siap diisi');
  };

  return (
    <div className="w-full pb-16 font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-200">
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
          onClick={() => onShowToast('Cari')}
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
      <form onSubmit={handleSave} className="space-y-4 max-w-4xl">
        {/* 1. Tanggal Penggalangan Dana */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Tanggal Penggalangan Dana
          </label>
          <div className="md:col-span-9 flex items-center gap-3 relative">
            <div className="w-48 sm:w-56">
              <input
                type="text"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                onClick={() => setIsDateRangePickerOpen(true)}
                placeholder="Input Date..."
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-[#008d91] transition-colors cursor-pointer"
              />
            </div>
            <span className="text-slate-400 font-medium">-</span>
            <div className="w-48 sm:w-56 relative">
              <input
                type="text"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                onClick={() => setIsDateRangePickerOpen(true)}
                placeholder="Input Date..."
                className="w-full bg-white border border-slate-200 rounded-2xl pl-4 pr-10 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-[#008d91] transition-colors cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setIsDateRangePickerOpen(!isDateRangePickerOpen)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#008d91] hover:text-[#05828e] cursor-pointer"
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

        {/* 2. Proyek SAPA */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Proyek SAPA
          </label>
          <div className="md:col-span-9 relative w-full max-w-md">
            <div
              onClick={() => setIsProyekDropdownOpen(!isProyekDropdownOpen)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center justify-between cursor-pointer focus-within:border-[#008d91]"
            >
              <input
                type="text"
                value={proyekSapa}
                onChange={(e) => setProyekSapa(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden"
              />
              <div className="w-6 h-6 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-2 shadow-xs">
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            {isProyekDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden py-1 max-h-48 overflow-y-auto">
                {proyekOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectProyekSapa(opt)}
                    className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    {opt}
                  </button>
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
          <div className="md:col-span-9 relative w-full max-w-md">
            <select
              value={pemasukanDivisi}
              onChange={(e) => setPemasukanDivisi(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-4 pr-11 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#008d91] transition-colors appearance-none cursor-pointer"
            >
              {allDivisiOptions.map((div) => (
                <option key={div} value={div}>
                  {div}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center shadow-xs">
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* 3. Nama Item */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Nama Item
          </label>
          <div className="md:col-span-9 w-full max-w-md">
            <input
              type="text"
              value={namaItem}
              onChange={(e) => setNamaItem(e.target.value)}
              placeholder="Input Text..."
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-[#008d91] transition-colors"
            />
          </div>
        </div>

        {/* 4. Sub-Nama Item */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Sub-Nama Item
          </label>
          <div className="md:col-span-9 w-full max-w-md">
            <input
              type="text"
              value={subNamaItem}
              onChange={(e) => setSubNamaItem(e.target.value)}
              placeholder="Input Text..."
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-[#008d91] transition-colors"
            />
          </div>
        </div>

        {/* 5. Sub-Jenis Item */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Sub-Jenis Item
          </label>
          <div className="md:col-span-9 relative w-full max-w-md">
            <div
              onClick={() => setIsSubJenisDropdownOpen(!isSubJenisDropdownOpen)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center justify-between cursor-pointer focus-within:border-[#008d91]"
            >
              <input
                type="text"
                value={subJenisItem}
                onChange={(e) => setSubJenisItem(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden"
              />
              <div className="w-6 h-6 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-2 shadow-xs">
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            {isSubJenisDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden py-1 max-h-56 overflow-y-auto">
                {filteredSubJenisOptions.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-400 text-center">
                    Tidak ditemukan sub-jenis item
                  </div>
                ) : (
                  filteredSubJenisOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setSubJenisItem(opt.namaSubJenis);
                        setIsSubJenisDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs sm:text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-md bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          {opt.iconLetter || 'D'}
                        </div>
                        <span className="font-medium">{opt.namaSubJenis}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {opt.kode}
                      </span>
                    </button>
                  ))
                )}
                {onNavigateToSubJenis && (
                  <div className="border-t border-slate-100 mt-1 pt-1 px-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubJenisDropdownOpen(false);
                        onNavigateToSubJenis();
                      }}
                      className="w-full text-left px-2 py-1.5 text-xs text-[#008d91] font-semibold hover:bg-teal-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Buka Tabel Sub-Jenis D-DONASI</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 6. Variable Item Section matching exact layout & colors */}
        <div className="pt-2">
          {variableItems.map((varItem) => (
            <div key={varItem.id} className="mb-4">
              {/* Header tag: (x) Variable Item */}
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => removeVariableItem(varItem.id)}
                  title="Hapus Variable Item"
                  className="w-4 h-4 rounded-full bg-[#e05d44] hover:bg-[#c94b33] flex items-center justify-center text-white shrink-0 cursor-pointer transition-colors"
                >
                  <X className="w-2.5 h-2.5 stroke-[3]" />
                </button>
                <span className="text-[#008d91] font-semibold text-xs sm:text-sm">
                  Variable Item
                </span>
              </div>

              {/* Light Container Card */}
              <div className="bg-[#f0f5f8] rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 max-w-3xl">
                {/* Row: Nama Variable Item */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <label className="sm:col-span-4 text-xs sm:text-sm text-slate-700 font-normal">
                    Nama Variable Item
                  </label>
                  <div className="sm:col-span-8 w-full">
                    <input
                      type="text"
                      value={varItem.namaVariable}
                      onChange={(e) =>
                        updateVariableField(
                          varItem.id,
                          'namaVariable',
                          e.target.value
                        )
                      }
                      placeholder="Input Text..."
                      className="w-full bg-white border border-slate-200/70 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-[#008d91] shadow-2xs transition-colors"
                    />
                  </div>
                </div>

                {/* Row: Harga */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <label className="sm:col-span-4 text-xs sm:text-sm text-slate-700 font-normal">
                    Harga
                  </label>
                  <div className="sm:col-span-8 w-full">
                    <div className="w-full bg-white border border-slate-200/70 rounded-2xl px-4 py-2.5 flex items-center shadow-2xs focus-within:border-[#008d91] transition-colors">
                      <span className="text-[#008d91] font-bold text-xs sm:text-sm mr-2.5 select-none">
                        Rp
                      </span>
                      <input
                        type="text"
                        value={varItem.harga}
                        onChange={(e) =>
                          updateVariableField(varItem.id, 'harga', e.target.value)
                        }
                        placeholder="Input Nominal..."
                        className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-item tag: (x) Add Item S - SALUR */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => toggleSalurInVar(varItem.id)}
                    title={
                      varItem.showSalur
                        ? 'Sembunyikan Item S-SALUR'
                        : 'Tampilkan Item S-SALUR'
                    }
                    className="w-4 h-4 rounded-full bg-[#e05d44] hover:bg-[#c94b33] flex items-center justify-center text-white shrink-0 cursor-pointer transition-colors"
                  >
                    <X className="w-2.5 h-2.5 stroke-[3]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSalurInVar(varItem.id)}
                    className="text-[#008d91] font-semibold text-xs sm:text-sm hover:underline cursor-pointer"
                  >
                    Add Item S - SALUR
                  </button>
                </div>

                {/* Row: Item S - SALUR & Jumlah */}
                {varItem.showSalur && (
                  <div className="space-y-3 pt-1">
                    {varItem.salurList.map((salur) => (
                      <div
                        key={salur.id}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                      >
                        <label className="sm:col-span-4 text-xs sm:text-sm text-slate-700 font-normal">
                          Item S - SALUR & Jumlah
                        </label>
                        <div className="sm:col-span-8 flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                          {/* Search Dropdown for Item S-SALUR */}
                          <div className="w-full sm:w-48 bg-white border border-slate-200/70 rounded-2xl px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-2xs">
                            <input
                              type="text"
                              value={salur.itemSalur}
                              onChange={(e) =>
                                updateSalurItem(
                                  varItem.id,
                                  salur.id,
                                  'itemSalur',
                                  e.target.value
                                )
                              }
                              placeholder="Search..."
                              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden"
                            />
                            <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-1.5">
                              <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                            </div>
                          </div>

                          {/* Right Arrow indicator */}
                          <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 shadow-xs">
                            <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                          </div>

                          {/* Amount Input with clear X and Add + */}
                          <div className="w-full sm:w-48 bg-white border border-slate-200/70 rounded-2xl px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-2xs">
                            <input
                              type="text"
                              value={salur.jumlah}
                              onChange={(e) =>
                                updateSalurItem(
                                  varItem.id,
                                  salur.id,
                                  'jumlah',
                                  e.target.value
                                )
                              }
                              placeholder="Input Text..."
                              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden"
                            />
                            <div className="flex items-center gap-1.5 ml-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  removeSalurRow(varItem.id, salur.id)
                                }
                                title="Hapus / Kosongkan"
                                className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => addSalurRow(varItem.id)}
                                title="Tambah baris item salur"
                                className="w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#007b7e] flex items-center justify-center text-white shrink-0 cursor-pointer shadow-xs transition-colors"
                              >
                                <Plus className="w-3 h-3 stroke-[2.5]" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Button: (+) Variable Item */}
          <div className="pt-1">
            <button
              type="button"
              onClick={addVariableItem}
              className="inline-flex items-center gap-2 text-[#008d91] hover:text-[#007b7e] font-semibold text-xs sm:text-sm cursor-pointer transition-colors"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 shadow-xs">
                <Plus className="w-3 h-3 stroke-[3]" />
              </div>
              <span>Variable Item</span>
            </button>
          </div>
        </div>

        {/* 7. Keterangan */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Keterangan
          </label>
          <div className="md:col-span-9 w-full max-w-md">
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Input Text..."
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-[#008d91] transition-colors"
            />
          </div>
        </div>

        {/* 8. Disalurkan kepada */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Disalurkan kepada
          </label>
          <div className="md:col-span-9 w-full max-w-md">
            <input
              type="text"
              value={disalurkanKepada}
              onChange={(e) => setDisalurkanKepada(e.target.value)}
              placeholder="Input Text..."
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden focus:border-[#008d91] transition-colors"
            />
          </div>
        </div>

        {/* Bottom Actions: Cancel & Save matching exact layout */}
        <div className="pt-8 flex items-center justify-end gap-3 max-w-3xl">
          <button
            type="button"
            onClick={onCancel}
            className="bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 px-8 py-2.5 rounded-2xl font-medium text-xs sm:text-sm transition-colors cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#008d91] hover:bg-[#007b7e] text-white px-8 py-2.5 rounded-2xl font-medium text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};
