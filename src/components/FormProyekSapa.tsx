import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, Link2, X, Plus, Check } from 'lucide-react';
import { ProjectItem } from '../types';
import { DateRangePickerPopover } from './DateRangePickerPopover';

interface FormProyekSapaProps {
  initialData?: ProjectItem | null;
  onSave: (project: Omit<ProjectItem, 'id'> | ProjectItem) => void;
  onCancel: () => void;
  jenisProyekOptions?: string[];
  onAddNewJenisProyek?: (name: string) => void;
  divisiOptions?: string[];
}

// Preset options for search/select dropdowns
const DEFAULT_JENIS_PROYEK_OPTIONS = [
  'Penyaluran Item',
  'Buka Stand',
  'Promosi Discount',
  'Donasi Buku Berbayar',
  'G-BGTS',
  'LamTalk',
  'Bedah Buku',
  'Patron Non-Rutin',
  'Patron Rutin',
  'Rekruitment Patriot',
  'Kerja Sama Agen Purna',
  'Promo Buku',
  'Stand',
  'Donasi',
];

const DIVISI_OPTIONS = ['MAD', 'EVE', 'FUN', 'HRD', 'IT', 'FIN', 'OPS', 'MKT'];

const PLATFORM_OPTIONS = [
  'Zoom Meeting',
  'Google Meet',
  'YouTube Live',
  'Instagram Live',
  'Microsoft Teams',
  'Webex',
  'Online',
];

import {
  INDONESIA_KOTA_KABUPATEN_LIST,
  INDONESIA_PROVINSI_LIST,
} from '../indonesiaRegionData';

const KOTA_OPTIONS = INDONESIA_KOTA_KABUPATEN_LIST;

const PROVINSI_OPTIONS = INDONESIA_PROVINSI_LIST;

const TARGET_OPTIONS = [
  'Siswa',
  'Guru',
  'Sekolah',
  'Umum',
  'Komunitas',
  'Umat',
  'Donatur',
  'Orang Tua',
  'Mahasiswa',
];

// Helper search/select input matching the exact UI in screenshots
interface SearchSelectProps {
  id: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

const SearchSelectInput: React.FC<SearchSelectProps> = ({
  id,
  value,
  onChange,
  options,
  placeholder = 'Search...',
  className = 'w-[320px] sm:w-[350px]',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFilterText(value);
  }, [value]);

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
    opt.toLowerCase().includes((filterText || '').toLowerCase())
  );

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between h-[42px] px-3.5 bg-white border border-[#cbd5e1] rounded-xl cursor-pointer hover:border-[#94a3b8] transition-colors shadow-2xs"
      >
        <input
          type="text"
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              if (filterText) {
                onChange(filterText);
                setIsOpen(false);
              }
            }
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-800 placeholder-[#94a3b8] focus:outline-none cursor-pointer"
        />
        {/* Teal circular chevron button matching image */}
        <div className="w-5 h-5 rounded-full bg-[#05828e] flex items-center justify-center text-white shrink-0 ml-2 pointer-events-none">
          <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-30 top-[46px] left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto py-1 text-sm animate-in fade-in zoom-in-95 duration-150">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  onChange(item);
                  setFilterText(item);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer"
              >
                <span>{item}</span>
                {value === item && <Check className="w-4 h-4 text-[#05828e]" />}
              </button>
            ))
          ) : (
            <button
              type="button"
              onClick={() => {
                if (filterText.trim()) {
                  onChange(filterText.trim());
                  setIsOpen(false);
                }
              }}
              className="w-full text-left px-3.5 py-2 text-xs text-[#05828e] hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Gunakan & Tambah "{filterText}"</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const FormProyekSapa: React.FC<FormProyekSapaProps> = ({
  initialData,
  onSave,
  onCancel,
  jenisProyekOptions = DEFAULT_JENIS_PROYEK_OPTIONS,
  onAddNewJenisProyek,
  divisiOptions = DIVISI_OPTIONS,
}) => {
  // Dates
  const [tanggalStart, setTanggalStart] = useState('');
  const [tanggalEnd, setTanggalEnd] = useState('');
  const [isTanggalRangeOpen, setIsTanggalRangeOpen] = useState(false);

  const [persiapanStart, setPersiapanStart] = useState('');
  const [persiapanEnd, setPersiapanEnd] = useState('');
  const [isPersiapanRangeOpen, setIsPersiapanRangeOpen] = useState(false);

  // Fields
  const [namaProyek, setNamaProyek] = useState('');
  const [jenisProyek, setJenisProyek] = useState('');
  const [divisiList, setDivisiList] = useState<string[]>(['']);
  const [isOnline, setIsOnline] = useState(false);

  // Online fields
  const [platform, setPlatform] = useState('');

  // Offline fields
  const [lokasiKegiatan, setLokasiKegiatan] = useState('');
  const [kotaKabupaten, setKotaKabupaten] = useState('');
  const [provinsi, setProvinsi] = useState('');

  // Common fields
  const [keterangan, setKeterangan] = useState('');
  const [linkFotoList, setLinkFotoList] = useState<string[]>(['']);
  const [linkLaporan, setLinkLaporan] = useState('');
  const [targetList, setTargetList] = useState<[string, string]>([
    '',
    '',
  ]);

  // Native date input picker refs
  const tanggalPickerRef = useRef<HTMLInputElement>(null);
  const persiapanPickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      // Parse tanggal
      if (initialData.tanggalStart && initialData.tanggalEnd) {
        setTanggalStart(initialData.tanggalStart);
        setTanggalEnd(initialData.tanggalEnd);
      } else if (initialData.tanggal) {
        const parts = initialData.tanggal.split(' - ');
        setTanggalStart(parts[0] || initialData.tanggal);
        setTanggalEnd(parts[1] || '');
      }

      // Parse persiapan
      if (initialData.persiapanStart && initialData.persiapanEnd) {
        setPersiapanStart(initialData.persiapanStart);
        setPersiapanEnd(initialData.persiapanEnd);
      } else if (initialData.dateRangePersiapan) {
        const parts = initialData.dateRangePersiapan.split(' - ');
        setPersiapanStart(parts[0] || initialData.dateRangePersiapan);
        setPersiapanEnd(parts[1] || '');
      }

      setNamaProyek(initialData.namaKegiatan || '');
      setJenisProyek(initialData.jenisProyek || '');
      setDivisiList(initialData.divisi ? [initialData.divisi] : ['']);
      setIsOnline(
        initialData.isOnline ??
          (initialData.lokasi ? initialData.lokasi.toLowerCase().includes('online') : false)
      );
      setPlatform(initialData.platform || '');
      setLokasiKegiatan(initialData.lokasiKegiatan || initialData.lokasi || '');
      setKotaKabupaten(initialData.kotaKabupaten || '');
      setProvinsi(initialData.provinsi || '');
      setKeterangan(initialData.keterangan || initialData.catatan || '');
      setLinkFotoList(initialData.linkFoto && initialData.linkFoto.length > 0 ? initialData.linkFoto : ['']);
      setLinkLaporan(initialData.linkLaporan || '');
      setTargetList([
        (initialData.target && initialData.target[0]) || '',
        (initialData.target && initialData.target[1]) || '',
      ]);
    } else {
      // Reset form
      setTanggalStart('');
      setTanggalEnd('');
      setPersiapanStart('');
      setPersiapanEnd('');
      setNamaProyek('');
      setJenisProyek('');
      setDivisiList(['']);
      setIsOnline(false);
      setPlatform('');
      setLokasiKegiatan('');
      setKotaKabupaten('');
      setProvinsi('');
      setKeterangan('');
      setLinkFotoList(['']);
      setLinkLaporan('');
      setTargetList(['', '']);
    }
  }, [initialData]);

  const handleAddDivisi = () => {
    setDivisiList([...divisiList, '']);
  };

  const handleRemoveDivisi = (idx: number) => {
    if (divisiList.length > 1) {
      setDivisiList(divisiList.filter((_, i) => i !== idx));
    } else {
      setDivisiList(['']);
    }
  };

  const handleAddLinkFoto = () => {
    setLinkFotoList([...linkFotoList, '']);
  };

  const handleRemoveLinkFoto = (idx: number) => {
    if (linkFotoList.length > 1) {
      setLinkFotoList(linkFotoList.filter((_, i) => i !== idx));
    } else {
      setLinkFotoList(['']);
    }
  };

  const handleResetTarget = () => {
    setTargetList(['', '']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construct tanggal display
    const formattedTanggal =
      tanggalStart && tanggalEnd
        ? `${tanggalStart} - ${tanggalEnd}`
        : tanggalStart || tanggalEnd || '11 Nov 2021';

    // Construct persiapan display
    const formattedPersiapan =
      persiapanStart && persiapanEnd
        ? `${persiapanStart} - ${persiapanEnd}`
        : persiapanStart || persiapanEnd || '-';

    // Construct location display for table
    let formattedLokasi = 'Online';
    if (isOnline) {
      formattedLokasi = platform ? `Online (${platform})` : 'Online';
    } else {
      if (lokasiKegiatan && kotaKabupaten) {
        formattedLokasi = `${lokasiKegiatan}, ${kotaKabupaten}`;
      } else if (lokasiKegiatan) {
        formattedLokasi = lokasiKegiatan;
      } else if (kotaKabupaten) {
        formattedLokasi = kotaKabupaten;
      } else {
        formattedLokasi = 'Offline';
      }
    }

    const payload: Omit<ProjectItem, 'id'> | ProjectItem = {
      ...(initialData ? { id: initialData.id } : {}),
      tanggal: formattedTanggal,
      dateRangePersiapan: formattedPersiapan,
      namaKegiatan: namaProyek || 'Proyek SAPA Baru',
      isNamaBadge: false,
      jenisProyek: jenisProyek || 'Umum',
      divisi: divisiList.filter(Boolean).join(', ') || 'MAD',
      lokasi: formattedLokasi,
      status: initialData?.status || 'Ongoing',
      catatan: keterangan,
      isOnline,
      tanggalStart,
      tanggalEnd,
      persiapanStart,
      persiapanEnd,
      platform,
      lokasiKegiatan,
      kotaKabupaten,
      provinsi,
      keterangan,
      linkFoto: linkFotoList.filter(Boolean),
      linkLaporan,
      target: targetList.filter(Boolean),
    };

    onSave(payload);
  };

  return (
    <div className="w-full flex flex-col py-2 sm:py-4 animate-in fade-in duration-150">
      <form onSubmit={handleSubmit} className="w-full max-w-4xl space-y-4 sm:space-y-5 text-sm text-slate-700">
        
        {/* Row 1: Tanggal */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
          <label className="w-48 text-[15px] text-[#555e69] shrink-0">
            Tanggal
          </label>
          <div className="flex items-center gap-2 relative">
            <input
              id="input-tanggal-start"
              type="text"
              value={tanggalStart}
              onChange={(e) => setTanggalStart(e.target.value)}
              onClick={() => setIsTanggalRangeOpen(true)}
              placeholder="Input Date..."
              className="w-[155px] sm:w-[165px] h-[42px] px-3.5 bg-white border border-[#cbd5e1] rounded-xl text-slate-800 placeholder-[#94a3b8] focus:outline-none focus:border-[#05828e] shadow-2xs transition-colors cursor-pointer"
            />
            <span className="text-slate-400 font-medium">-</span>
            <div className="relative flex items-center">
              <input
                id="input-tanggal-end"
                type="text"
                value={tanggalEnd}
                onChange={(e) => setTanggalEnd(e.target.value)}
                onClick={() => setIsTanggalRangeOpen(true)}
                placeholder="Input Date..."
                className="w-[155px] sm:w-[165px] h-[42px] pl-3.5 pr-9 bg-white border border-[#cbd5e1] rounded-xl text-slate-800 placeholder-[#94a3b8] focus:outline-none focus:border-[#05828e] shadow-2xs transition-colors cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setIsTanggalRangeOpen(!isTanggalRangeOpen)}
                className="absolute right-3 text-[#05828e] hover:text-[#046c76] cursor-pointer"
                title="Pilih Rentang Tanggal"
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>

            {/* Date Range Popover for Proyek Sapa */}
            <DateRangePickerPopover
              isOpen={isTanggalRangeOpen}
              onClose={() => setIsTanggalRangeOpen(false)}
              startDate={tanggalStart}
              endDate={tanggalEnd}
              onSelectRange={(start, end) => {
                setTanggalStart(start);
                setTanggalEnd(end);
              }}
            />
          </div>
        </div>

        {/* Row 2: Date Range Persiapan */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
          <label className="w-48 text-[15px] text-[#555e69] shrink-0">
            Date Range Persiapan
          </label>
          <div className="flex items-center gap-2 relative">
            <input
              id="input-persiapan-start"
              type="text"
              value={persiapanStart}
              onChange={(e) => setPersiapanStart(e.target.value)}
              onClick={() => setIsPersiapanRangeOpen(true)}
              placeholder="Input Date..."
              className="w-[155px] sm:w-[165px] h-[42px] px-3.5 bg-white border border-[#cbd5e1] rounded-xl text-slate-800 placeholder-[#94a3b8] focus:outline-none focus:border-[#05828e] shadow-2xs transition-colors cursor-pointer"
            />
            <span className="text-slate-400 font-medium">-</span>
            <div className="relative flex items-center">
              <input
                id="input-persiapan-end"
                type="text"
                value={persiapanEnd}
                onChange={(e) => setPersiapanEnd(e.target.value)}
                onClick={() => setIsPersiapanRangeOpen(true)}
                placeholder="Input Date..."
                className="w-[155px] sm:w-[165px] h-[42px] pl-3.5 pr-9 bg-white border border-[#cbd5e1] rounded-xl text-slate-800 placeholder-[#94a3b8] focus:outline-none focus:border-[#05828e] shadow-2xs transition-colors cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setIsPersiapanRangeOpen(!isPersiapanRangeOpen)}
                className="absolute right-3 text-[#05828e] hover:text-[#046c76] cursor-pointer"
                title="Pilih Rentang Tanggal Persiapan"
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>

            {/* Date Range Popover for Persiapan */}
            <DateRangePickerPopover
              isOpen={isPersiapanRangeOpen}
              onClose={() => setIsPersiapanRangeOpen(false)}
              startDate={persiapanStart}
              endDate={persiapanEnd}
              onSelectRange={(start, end) => {
                setPersiapanStart(start);
                setPersiapanEnd(end);
              }}
            />
          </div>
        </div>

        {/* Row 3: Nama Proyek SAPA */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
          <label className="w-48 text-[15px] text-[#555e69] shrink-0">
            Nama Proyek SAPA
          </label>
          <div className="w-[320px] sm:w-[350px]">
            <input
              id="input-nama-proyek-sapa"
              type="text"
              value={namaProyek}
              onChange={(e) => setNamaProyek(e.target.value)}
              placeholder="Input Text..."
              required
              className="w-full h-[42px] px-3.5 bg-white border border-[#cbd5e1] rounded-xl text-slate-800 placeholder-[#94a3b8] focus:outline-none focus:border-[#05828e] shadow-2xs transition-colors"
            />
          </div>
        </div>

        {/* Row 4: Jenis Proyek */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
          <label className="w-48 text-[15px] text-[#555e69] shrink-0">
            Jenis Proyek
          </label>
          <SearchSelectInput
            id="select-jenis-proyek"
            value={jenisProyek}
            onChange={(val) => {
              setJenisProyek(val);
              if (val && onAddNewJenisProyek && !jenisProyekOptions.includes(val)) {
                onAddNewJenisProyek(val);
              }
            }}
            options={jenisProyekOptions}
            placeholder="Search..."
          />
        </div>

        {/* Row 5: Divisi */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:pt-1 gap-1.5 sm:gap-4">
          <label className="w-48 text-[15px] text-[#555e69] shrink-0 pt-2">
            Divisi
          </label>
          <div className="space-y-2">
            {divisiList.map((div, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <SearchSelectInput
                  id={`select-divisi-${idx}`}
                  value={div}
                  onChange={(val) => {
                    const next = [...divisiList];
                    next[idx] = val;
                    setDivisiList(next);
                  }}
                  options={divisiOptions}
                  placeholder="Search..."
                />
                <button
                  type="button"
                  id={`btn-remove-divisi-${idx}`}
                  onClick={() => handleRemoveDivisi(idx)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                  title="Hapus"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
                {idx === divisiList.length - 1 && (
                  <button
                    type="button"
                    id="btn-add-divisi"
                    onClick={handleAddDivisi}
                    className="w-5 h-5 rounded-full bg-[#05828e] hover:bg-[#046c76] text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
                    title="Tambah Divisi"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Row 6: Online? Checkbox */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
          <label className="w-48 text-[15px] text-[#555e69] shrink-0">
            Online?
          </label>
          <div className="flex items-center">
            <button
              id="checkbox-online"
              type="button"
              role="checkbox"
              aria-checked={isOnline}
              onClick={() => setIsOnline(!isOnline)}
              className="w-6 h-6 rounded-md border-2 border-[#05828e] flex items-center justify-center cursor-pointer bg-white transition-all shadow-2xs hover:bg-teal-50/30"
            >
              {isOnline && (
                <svg
                  className="w-4 h-4 text-[#05828e]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* CONDITIONAL ROWS: When Online is checked */}
        {isOnline ? (
          <>
            {/* Platform */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 animate-in fade-in duration-200">
              <label className="w-48 text-[15px] text-[#555e69] shrink-0">
                Platform
              </label>
              <SearchSelectInput
                id="select-platform"
                value={platform}
                onChange={setPlatform}
                options={PLATFORM_OPTIONS}
                placeholder="Search..."
              />
            </div>
          </>
        ) : (
          /* CONDITIONAL ROWS: When Online is NOT checked */
          <>
            {/* Lokasi Kegiatan */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 animate-in fade-in duration-200">
              <label className="w-48 text-[15px] text-[#555e69] shrink-0">
                Lokasi Kegiatan
              </label>
              <div className="w-[320px] sm:w-[350px]">
                <input
                  id="input-lokasi-kegiatan"
                  type="text"
                  value={lokasiKegiatan}
                  onChange={(e) => setLokasiKegiatan(e.target.value)}
                  placeholder="Input Text..."
                  className="w-full h-[42px] px-3.5 bg-white border border-[#cbd5e1] rounded-xl text-slate-800 placeholder-[#94a3b8] focus:outline-none focus:border-[#05828e] shadow-2xs transition-colors"
                />
              </div>
            </div>

            {/* Kota/Kabupaten */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 animate-in fade-in duration-200">
              <label className="w-48 text-[15px] text-[#555e69] shrink-0">
                Kota/Kabupaten
              </label>
              <SearchSelectInput
                id="select-kota-kabupaten"
                value={kotaKabupaten}
                onChange={setKotaKabupaten}
                options={KOTA_OPTIONS}
                placeholder="Search..."
              />
            </div>

            {/* Provinsi */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 animate-in fade-in duration-200">
              <label className="w-48 text-[15px] text-[#555e69] shrink-0">
                Provinsi
              </label>
              <SearchSelectInput
                id="select-provinsi"
                value={provinsi}
                onChange={setProvinsi}
                options={PROVINSI_OPTIONS}
                placeholder="Search..."
              />
            </div>
          </>
        )}

        {/* Common Field: Keterangan */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
          <label className="w-48 text-[15px] text-[#555e69] shrink-0">
            Keterangan
          </label>
          <div className="w-[320px] sm:w-[350px]">
            <input
              id="input-keterangan"
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Input Text..."
              className="w-full h-[42px] px-3.5 bg-white border border-[#cbd5e1] rounded-xl text-slate-800 placeholder-[#94a3b8] focus:outline-none focus:border-[#05828e] shadow-2xs transition-colors"
            />
          </div>
        </div>

        {/* Common Field: Link Foto */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:pt-1 gap-1.5 sm:gap-4">
          <label className="w-48 text-[15px] text-[#555e69] shrink-0 pt-2">
            Link Foto
          </label>
          <div className="space-y-2">
            {linkFotoList.map((foto, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="relative w-[320px] sm:w-[350px]">
                  <input
                    id={`input-link-foto-${idx}`}
                    type="text"
                    value={foto}
                    onChange={(e) => {
                      const next = [...linkFotoList];
                      next[idx] = e.target.value;
                      setLinkFotoList(next);
                    }}
                    placeholder="Input Link..."
                    className="w-full h-[42px] pl-3.5 pr-10 bg-white border border-[#cbd5e1] rounded-xl text-slate-800 placeholder-[#94a3b8] focus:outline-none focus:border-[#05828e] shadow-2xs transition-colors"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#05828e] pointer-events-none">
                    <Link2 className="w-4 h-4" />
                  </div>
                </div>
                <button
                  type="button"
                  id={`btn-remove-link-foto-${idx}`}
                  onClick={() => handleRemoveLinkFoto(idx)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                  title="Hapus"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
                {idx === linkFotoList.length - 1 && (
                  <button
                    type="button"
                    id="btn-add-link-foto"
                    onClick={handleAddLinkFoto}
                    className="w-5 h-5 rounded-full bg-[#05828e] hover:bg-[#046c76] text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
                    title="Tambah Link Foto"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Common Field: Link Laporan */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
          <label className="w-48 text-[15px] text-[#555e69] shrink-0">
            Link Laporan
          </label>
          <div className="relative w-[320px] sm:w-[350px]">
            <input
              id="input-link-laporan"
              type="text"
              value={linkLaporan}
              onChange={(e) => setLinkLaporan(e.target.value)}
              placeholder="Input Link..."
              className="w-full h-[42px] pl-3.5 pr-10 bg-white border border-[#cbd5e1] rounded-xl text-slate-800 placeholder-[#94a3b8] focus:outline-none focus:border-[#05828e] shadow-2xs transition-colors"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#05828e] pointer-events-none">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Offline-Only Field: Target (Shown when Online is NOT checked, as per Image 1) */}
        {!isOnline && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 animate-in fade-in duration-200">
            <label className="w-48 text-[15px] text-[#555e69] shrink-0">
              Target
            </label>
            <div className="flex items-center gap-2">
              <SearchSelectInput
                id="select-target-1"
                value={targetList[0]}
                onChange={(val) => setTargetList([val, targetList[1]])}
                options={TARGET_OPTIONS}
                placeholder="Search..."
                className="w-[155px] sm:w-[165px]"
              />
              <SearchSelectInput
                id="select-target-2"
                value={targetList[1]}
                onChange={(val) => setTargetList([targetList[0], val])}
                options={TARGET_OPTIONS}
                placeholder="Search..."
                className="w-[155px] sm:w-[165px]"
              />
              <button
                type="button"
                id="btn-remove-target"
                onClick={handleResetTarget}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition-colors"
                title="Hapus Target"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                type="button"
                id="btn-add-target"
                onClick={() => {
                  // If second is empty, default to one of the options
                  if (!targetList[0]) setTargetList(['Siswa', targetList[1]]);
                  else if (!targetList[1]) setTargetList([targetList[0], 'Umum']);
                }}
                className="w-5 h-5 rounded-full bg-[#05828e] hover:bg-[#046c76] text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
                title="Tambah Target"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons (Bottom Right) */}
        <div className="pt-6 sm:pt-8 flex items-center justify-end gap-3 sm:gap-4 w-[320px] sm:w-[560px]">
          <button
            id="btn-form-cancel"
            type="button"
            onClick={onCancel}
            className="px-7 sm:px-8 py-2 border border-slate-300 rounded-xl text-slate-500 font-medium text-sm hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            id="btn-form-save"
            type="submit"
            className="px-8 sm:px-10 py-2 bg-[#05828e] hover:bg-[#046c76] text-white font-medium text-sm rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            Save
          </button>
        </div>

      </form>
    </div>
  );
};
