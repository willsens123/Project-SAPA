import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Plus,
  X,
  EyeOff,
  Eye,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Calendar,
  ArrowRight,
  Check,
  Printer,
} from 'lucide-react';
import {
  getStoredStokSalurItems,
  getStoredGudangSalurData,
  getStoredLokasiStokSalur,
  getStoredJenisPerubahanSalur,
  addStockInOutSalur,
  StokSalurItem,
} from '../stokSalurData';
import {
  getStoredPercetakanSalur,
  addPercetakanSalur,
  PercetakanSalurItem,
} from '../percetakanSalurData';
import { formatDatePickerValue } from '../utils/datePickerHelper';

interface ContainerTransferRow {
  id: string;
  sumberContainer: string;
  sumberLokasi: string;
  jumlah: string;
  tujuanContainer: string;
  tujuanLokasi: string;
}

interface CetakBaruRow {
  id: string;
  namaPercetakan: string;
  jumlahPercetakan: string;
  tujuanContainer: string;
  tujuanLokasi: string;
  jumlahTujuan: string;
}

interface FormStockInOutSalurViewProps {
  onBack: () => void;
  onShowToast?: (msg: string) => void;
  initialNamaItem?: string;
  initialContainer?: string;
  initialLokasi?: string;
  initialPercetakan?: string;
  initialTab?: 'pindah_container' | 'buku_baru_cetak';
  onNavigateToNamaPercetakan?: () => void;
}

export const FormStockInOutSalurView: React.FC<FormStockInOutSalurViewProps> = ({
  onBack,
  onShowToast = (_msg: string) => {},
  initialNamaItem = '',
  initialContainer = '',
  initialLokasi = '',
  initialPercetakan = '',
  initialTab = 'buku_baru_cetak',
  onNavigateToNamaPercetakan,
}) => {
  // Master data
  const masterItems = useMemo(() => getStoredStokSalurItems(), []);
  const masterGudangs = useMemo(() => getStoredGudangSalurData(), []);
  const masterLocations = useMemo(() => getStoredLokasiStokSalur(), []);
  const masterJenisPerubahan = useMemo(() => getStoredJenisPerubahanSalur(), []);
  const [masterPercetakan, setMasterPercetakan] = useState<PercetakanSalurItem[]>(
    () => getStoredPercetakanSalur()
  );

  // Active Tab: 'pindah_container' or 'buku_baru_cetak' matching image.png
  const [activeTab, setActiveTab] = useState<'pindah_container' | 'buku_baru_cetak'>(
    initialTab
  );

  // Form states matching image.png
  const [tanggal, setTanggal] = useState('15 Nov 2021');
  const [namaItem, setNamaItem] = useState(
    initialNamaItem || masterItems[0]?.namaItem || "Go Lotsawa's The Blue Annals"
  );
  const [jenisPerubahan, setJenisPerubahan] = useState('Pindah Stock');

  // Rows of Container Transfer (Pindah Container tab)
  const [transferRows, setTransferRows] = useState<ContainerTransferRow[]>([
    {
      id: 'row-1',
      sumberContainer: initialContainer || 'Container A',
      sumberLokasi: initialLokasi || 'Rumah Tsa-Tsa',
      jumlah: '10',
      tujuanContainer: 'Container B',
      tujuanLokasi: 'Rumah Tsa-Tsa',
    },
  ]);

  // Rows of Cetak Baru (Buku Baru Cetak tab) matching image.png
  const [cetakRows, setCetakRows] = useState<CetakBaruRow[]>([
    {
      id: 'cetak-1',
      namaPercetakan: initialPercetakan || masterPercetakan[0]?.namaPercetakan || '',
      jumlahPercetakan: '',
      tujuanContainer: '',
      tujuanLokasi: '',
      jumlahTujuan: '',
    },
  ]);

  // Dropdown open states
  const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false);
  const [isJenisDropdownOpen, setIsJenisDropdownOpen] = useState(false);
  const [openSourceDropdownId, setOpenSourceDropdownId] = useState<string | null>(null);
  const [openTargetDropdownId, setOpenTargetDropdownId] = useState<string | null>(null);
  const [openPercetakanDropdownId, setOpenPercetakanDropdownId] = useState<string | null>(null);
  const [openCetakTargetDropdownId, setOpenCetakTargetDropdownId] = useState<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Top action bar states
  const [isEyeActive, setIsEyeActive] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Master Percetakan options from table
  const percetakanOptions = useMemo(() => {
    return masterPercetakan.map((p) => p.namaPercetakan);
  }, [masterPercetakan]);

  // Container options compiled from Gudang & Items
  const containerOptions = useMemo(() => {
    const list: { container: string; lokasi: string }[] = [];
    const seen = new Set<string>();

    // Add standard ones
    list.push({ container: 'Rak', lokasi: 'Kantor Bandung' });
    seen.add('rak-kantor bandung');

    masterGudangs.forEach((g) => {
      g.containers.forEach((c) => {
        const key = `${c.namaContainer.toLowerCase()}-${g.namaLokasi.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({
            container: c.namaContainer,
            lokasi: g.namaLokasi,
          });
        }
      });
    });

    masterItems.forEach((it) => {
      it.containers.forEach((c) => {
        const key = `${c.namaContainer.toLowerCase()}-${c.lokasiGudang.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({
            container: c.namaContainer,
            lokasi: c.lokasiGudang,
          });
        }
      });
    });

    // Also add Penjualan / Out option
    list.push({ container: '-', lokasi: '-' });

    return list;
  }, [masterGudangs, masterItems]);

  // Close dropdowns on outside click
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsItemDropdownOpen(false);
        setIsJenisDropdownOpen(false);
        setOpenSourceDropdownId(null);
        setOpenTargetDropdownId(null);
        setOpenPercetakanDropdownId(null);
        setOpenCetakTargetDropdownId(null);
        setIsFilterOpen(false);
        setIsDatePickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync initialPercetakan if provided
  useEffect(() => {
    if (initialPercetakan) {
      setCetakRows((prev) => {
        if (prev.length === 0) {
          return [
            {
              id: 'cetak-1',
              namaPercetakan: initialPercetakan,
              jumlahPercetakan: '',
              tujuanContainer: '',
              tujuanLokasi: '',
              jumlahTujuan: '',
            },
          ];
        }
        return prev.map((r, i) =>
          i === 0 ? { ...r, namaPercetakan: initialPercetakan } : r
        );
      });
      setActiveTab('buku_baru_cetak');
    }
  }, [initialPercetakan]);

  // Refresh master percetakan when dropdown opened
  useEffect(() => {
    if (openPercetakanDropdownId) {
      setMasterPercetakan(getStoredPercetakanSalur());
    }
  }, [openPercetakanDropdownId]);

  // Row management handlers for Pindah Container
  const handleAddRow = () => {
    const newRow: ContainerTransferRow = {
      id: `row-${Date.now()}`,
      sumberContainer: 'Rak',
      sumberLokasi: 'Kantor Bandung',
      jumlah: '5',
      tujuanContainer: 'Container BDK - 01',
      tujuanLokasi: 'Kantor Bandung',
    };
    setTransferRows((prev) => [...prev, newRow]);
  };

  const handleRemoveRow = (id: string) => {
    setTransferRows((prev) => {
      if (prev.length <= 1) {
        onShowToast('Minimal satu baris transfer container diperlukan');
        return prev;
      }
      return prev.filter((r) => r.id !== id);
    });
  };

  const handleUpdateRow = (
    id: string,
    field: keyof ContainerTransferRow,
    value: string
  ) => {
    setTransferRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleSelectSourceContainer = (
    id: string,
    container: string,
    lokasi: string
  ) => {
    setTransferRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, sumberContainer: container, sumberLokasi: lokasi }
          : r
      )
    );
    setOpenSourceDropdownId(null);
  };

  const handleSelectTargetContainer = (
    id: string,
    container: string,
    lokasi: string
  ) => {
    setTransferRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, tujuanContainer: container, tujuanLokasi: lokasi }
          : r
      )
    );
    setOpenTargetDropdownId(null);
  };

  // Row management handlers for Buku Baru Cetak
  const handleAddCetakRow = () => {
    const newRow: CetakBaruRow = {
      id: `cetak-${Date.now()}`,
      namaPercetakan: cetakRows[0]?.namaPercetakan || '',
      jumlahPercetakan: '',
      tujuanContainer: '',
      tujuanLokasi: '',
      jumlahTujuan: '',
    };
    setCetakRows((prev) => [...prev, newRow]);
  };

  const handleRemoveCetakRow = (id: string) => {
    setCetakRows((prev) => {
      if (prev.length <= 1) {
        onShowToast('Minimal satu baris percetakan diperlukan');
        return prev;
      }
      return prev.filter((r) => r.id !== id);
    });
  };

  const handleUpdateCetakRow = (
    id: string,
    field: keyof CetakBaruRow,
    value: string
  ) => {
    setCetakRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        // Sync jumlahTujuan if it was empty or matched
        if (
          field === 'jumlahPercetakan' &&
          (!r.jumlahTujuan || r.jumlahTujuan === r.jumlahPercetakan)
        ) {
          updated.jumlahTujuan = value;
        }
        return updated;
      })
    );
  };

  const handleSelectCetakTargetContainer = (
    id: string,
    container: string,
    lokasi: string
  ) => {
    setCetakRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, tujuanContainer: container, tujuanLokasi: lokasi }
          : r
      )
    );
    setOpenCetakTargetDropdownId(null);
  };

  // Submit / Add handler (Top "+ Add" button)
  const handleSaveForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!namaItem.trim()) {
      onShowToast('Mohon pilih atau masukkan Nama Item');
      return;
    }

    if (!tanggal.trim()) {
      onShowToast('Mohon masukkan Tanggal');
      return;
    }

    // Branch 1: Buku Baru Cetak (jenisPerubahan: 'Cetak Baru')
    if (activeTab === 'buku_baru_cetak') {
      let savedCount = 0;
      for (const row of cetakRows) {
        const qty = Number(row.jumlahTujuan || row.jumlahPercetakan) || 0;
        if (qty <= 0) {
          continue;
        }

        if (!row.tujuanContainer.trim()) {
          onShowToast('Mohon pilih Tujuan Container');
          return;
        }

        // Ensure row.namaPercetakan is recorded in master percetakan if provided
        if (row.namaPercetakan.trim()) {
          const exists = masterPercetakan.some(
            (p) =>
              p.namaPercetakan.toLowerCase() ===
              row.namaPercetakan.trim().toLowerCase()
          );
          if (!exists) {
            addPercetakanSalur({
              namaPercetakan: row.namaPercetakan.trim(),
              kontak: '-',
              telepon: '-',
              alamat: '-',
              keterangan: 'Tersimpan otomatis dari Form Stock In/Out Cetak Baru',
            });
          }
        }

        addStockInOutSalur(
          {
            tanggal: tanggal.trim(),
            namaItem: namaItem.trim(),
            sumberContainer: row.namaPercetakan.trim() || 'Percetakan',
            sumberLokasi: 'Percetakan',
            jumlah: qty,
            tujuanContainer: row.tujuanContainer.trim(),
            tujuanLokasi: row.tujuanLokasi.trim() || 'Rumah Tsa-Tsa',
            jenisPerubahan: 'Cetak Baru', // Automatically "Cetak Baru" as requested
          },
          true // Apply physical stock addition
        );
        savedCount++;
      }

      if (savedCount === 0) {
        onShowToast('Mohon isi jumlah stok cetak baru minimal 1');
        return;
      }

      onShowToast(`Berhasil menambahkan ${savedCount} catatan Buku Baru Cetak (Cetak Baru)`);
      onBack();
      return;
    }

    // Branch 2: Pindah Container
    let savedCount = 0;
    for (const row of transferRows) {
      const qty = Number(row.jumlah) || 0;
      if (qty <= 0) {
        continue;
      }

      addStockInOutSalur(
        {
          tanggal: tanggal.trim(),
          namaItem: namaItem.trim(),
          sumberContainer: row.sumberContainer.trim() || '-',
          sumberLokasi: row.sumberLokasi.trim() || '-',
          jumlah: qty,
          tujuanContainer: row.tujuanContainer.trim() || '-',
          tujuanLokasi: row.tujuanLokasi.trim() || '-',
          jenisPerubahan: jenisPerubahan.trim() || 'Pindah Stock',
        },
        true // Apply physical stock deduction/addition
      );
      savedCount++;
    }

    if (savedCount === 0) {
      onShowToast('Mohon isi jumlah mutasi stok minimal 1');
      return;
    }

    onShowToast(`Berhasil menambahkan ${savedCount} catatan Stock In/Out`);
    onBack();
  };

  return (
    <div
      ref={dropdownRef}
      className="w-full flex flex-col gap-6 text-slate-800 animate-in fade-in duration-200"
    >
      {/* Top Bar with Tab Buttons on the Left and Actions on the Right matching image.png */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tab Pills matching image.png */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="tab-pindah-container"
            onClick={() => setActiveTab('pindah_container')}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'pindah_container'
                ? 'bg-[#008d91] text-white shadow-xs'
                : 'bg-[#9aa0a6] text-white hover:bg-slate-500'
            }`}
          >
            Pindah Container
          </button>
          <button
            type="button"
            id="tab-buku-baru-cetak"
            onClick={() => setActiveTab('buku_baru_cetak')}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'buku_baru_cetak'
                ? 'bg-[#008d91] text-white shadow-xs'
                : 'bg-[#9aa0a6] text-white hover:bg-slate-500'
            }`}
          >
            Buku Baru Cetak
          </button>
        </div>

        {/* Top Action Toolbar matching image.png (Eye, Search, Filter, + Add) */}
        <div className="flex items-center justify-end gap-3 self-end sm:self-auto">
          {/* Search input when open */}
          {isSearchOpen && (
            <div className="relative w-48 sm:w-64 animate-in fade-in slide-in-from-right-2 duration-150">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="Cari item, container..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91]"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Eye Toggle Icon */}
          <button
            type="button"
            id="btn-form-toggle-eye"
            onClick={() => setIsEyeActive(!isEyeActive)}
            title={isEyeActive ? 'Tampilan Ringkas' : 'Tampilan Penuh'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isEyeActive
                ? 'text-[#008d91] bg-teal-50'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {isEyeActive ? (
              <Eye className="w-4.5 h-4.5 stroke-[1.8]" />
            ) : (
              <EyeOff className="w-4.5 h-4.5 stroke-[1.8]" />
            )}
          </button>

          {/* Search Icon */}
          {!isSearchOpen && (
            <button
              type="button"
              id="btn-form-search"
              onClick={() => setIsSearchOpen(true)}
              title="Cari"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-4.5 h-4.5 stroke-[1.8]" />
            </button>
          )}

          {/* Filter / Sliders Icon */}
          <div className="relative">
            <button
              type="button"
              id="btn-form-filter"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              title="Filter Opsi"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isFilterOpen
                  ? 'text-[#008d91] bg-teal-50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <SlidersHorizontal className="w-4.5 h-4.5 stroke-[1.8]" />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-30 animate-in fade-in zoom-in-95">
                <div className="text-xs font-semibold text-slate-700 mb-2">
                  Opsi Jenis Perubahan
                </div>
                <div className="flex flex-col gap-1 text-xs max-h-48 overflow-y-auto">
                  {masterJenisPerubahan.map((jp) => (
                    <button
                      key={jp.id}
                      type="button"
                      onClick={() => {
                        setJenisPerubahan(jp.jenisPerubahan);
                        setIsFilterOpen(false);
                      }}
                      className={`text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        jenisPerubahan === jp.jenisPerubahan
                          ? 'bg-teal-50 text-[#008d91] font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {jp.jenisPerubahan}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* + Add Button matching image.png */}
          <button
            type="button"
            id="btn-submit-stock-in-out"
            onClick={() => handleSaveForm()}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#008d91] hover:bg-[#007b7e] text-white rounded-xl text-sm font-semibold transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Add
          </button>
        </div>
      </div>

      {/* Main Form Fields Layout strictly matching image.png */}
      <form
        onSubmit={handleSaveForm}
        className="w-full flex flex-col gap-5 sm:gap-6 pt-2"
      >
        {/* 1. Tanggal */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="text-slate-700 text-sm sm:text-base font-normal w-40 sm:w-48 shrink-0">
            Tanggal
          </label>
          <div className="relative flex-1 max-w-md">
            <input
              id="input-form-tanggal"
              type="text"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              placeholder="Input Date..."
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-11 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
            />
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#008d91] hover:text-[#007b7e] transition-colors cursor-pointer"
              title="Pilih Tanggal Cepat"
            >
              <Calendar className="w-4.5 h-4.5" />
            </button>

            {isDatePickerOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsDatePickerOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2.5 z-30 animate-in fade-in zoom-in-95">
                  <div className="text-xs font-semibold text-slate-500 px-2 py-1">
                    Pilihan Tanggal
                  </div>
                  {['Hari ini (15 Nov 2021)', '1 Jan 2021', '10 Jan 2021', '21 Nov 2021', '1 Des 2021'].map(
                    (d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setTanggal(d.replace(/ \(.*\)/, ''));
                          setIsDatePickerOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-slate-700 hover:bg-teal-50 hover:text-[#008d91] transition-colors cursor-pointer"
                      >
                        {d}
                      </button>
                    )
                  )}
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-semibold text-slate-400 px-1 mb-1">
                      Pilih Tanggal Lain:
                    </div>
                    <input
                      type="date"
                      onChange={(e) => {
                        if (e.target.value) {
                          setTanggal(formatDatePickerValue(e.target.value));
                          setIsDatePickerOpen(false);
                        }
                      }}
                      className="w-full text-xs p-1.5 border border-slate-200 rounded-lg text-slate-600 focus:outline-hidden cursor-pointer"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 2. Item S-SALUR */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="text-slate-700 text-sm sm:text-base font-normal w-40 sm:w-48 shrink-0">
            Item S-SALUR
          </label>
          <div className="relative flex-1 max-w-md">
            <input
              id="input-form-item-salur"
              type="text"
              value={namaItem}
              onChange={(e) => setNamaItem(e.target.value)}
              onFocus={() => setIsItemDropdownOpen(true)}
              placeholder="Search..."
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-11 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
            />
            <button
              type="button"
              onClick={() => setIsItemDropdownOpen(!isItemDropdownOpen)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#007b7e] text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Daftar Item"
            >
              <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            {isItemDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 max-h-60 overflow-y-auto z-30 animate-in fade-in zoom-in-95">
                <div className="text-xs font-semibold text-slate-400 px-2 py-1">
                  Pilih Item S-SALUR
                </div>
                {masterItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setNamaItem(item.namaItem);
                      setIsItemDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      namaItem === item.namaItem
                        ? 'bg-teal-50 text-[#008d91] font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{item.namaItem}</div>
                      <div className="text-[11px] text-slate-400">{item.subtitle}</div>
                    </div>
                    {namaItem === item.namaItem && (
                      <Check className="w-3.5 h-3.5 text-[#008d91]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. Container & Jumlah Rows based on Active Tab */}
        {activeTab === 'buku_baru_cetak' ? (
          /* BUKU BARU CETAK ROWS strictly matching image.png */
          <div className="flex flex-col gap-4">
            {cetakRows.map((row, index) => (
              <div
                key={row.id}
                className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-6"
              >
                {/* Left label alignment spacer matching image.png */}
                <div className="w-40 sm:w-48 shrink-0 hidden sm:block" />

                {/* Columns: Nama Percetakan -> Jumlah -> [Arrow] -> Tujuan Container -> Jumlah -> [Actions] */}
                <div className="flex-1 flex flex-wrap lg:flex-nowrap items-end gap-3 sm:gap-4 max-w-5xl">
                  {/* Column 1: Nama Percetakan */}
                  <div className="flex-1 min-w-[180px] max-w-xs flex flex-col gap-1.5">
                    {index === 0 && (
                      <label className="text-slate-700 text-sm sm:text-base font-normal">
                        Nama Percetakan
                      </label>
                    )}
                    <div className="relative">
                      <input
                        type="text"
                        value={row.namaPercetakan}
                        onChange={(e) =>
                          handleUpdateCetakRow(row.id, 'namaPercetakan', e.target.value)
                        }
                        onFocus={() => setOpenPercetakanDropdownId(row.id)}
                        placeholder="Search..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-11 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setOpenPercetakanDropdownId(
                            openPercetakanDropdownId === row.id ? null : row.id
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#007b7e] text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Pilih Nama Percetakan"
                      >
                        <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      {openPercetakanDropdownId === row.id && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-2 max-h-60 overflow-y-auto z-30 animate-in fade-in zoom-in-95">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-2 py-1 mb-1 border-b border-slate-100">
                            <span>Pilih Nama Percetakan</span>
                            {onNavigateToNamaPercetakan && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenPercetakanDropdownId(null);
                                  onNavigateToNamaPercetakan();
                                }}
                                className="text-[#008d91] hover:underline font-medium text-[11px] cursor-pointer"
                              >
                                Kelola Tabel ↗
                              </button>
                            )}
                          </div>
                          {(() => {
                            const query = (row.namaPercetakan || '').toLowerCase().trim();
                            const filtered = percetakanOptions.filter((opt) =>
                              opt.toLowerCase().includes(query)
                            );
                            const exactMatch = percetakanOptions.some(
                              (opt) => opt.toLowerCase() === query
                            );

                            return (
                              <>
                                {filtered.length === 0 && (
                                  <div className="text-xs text-slate-400 px-2 py-2 text-center">
                                    Tidak ditemukan percetakan "{row.namaPercetakan}"
                                  </div>
                                )}
                                {filtered.map((opt) => (
                                  <button
                                    key={`percetakan-${opt}`}
                                    type="button"
                                    onClick={() => {
                                      handleUpdateCetakRow(row.id, 'namaPercetakan', opt);
                                      setOpenPercetakanDropdownId(null);
                                    }}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                      row.namaPercetakan === opt
                                        ? 'bg-teal-50 text-[#008d91] font-semibold'
                                        : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span>{opt}</span>
                                    {row.namaPercetakan === opt && (
                                      <Check className="w-3.5 h-3.5 text-[#008d91]" />
                                    )}
                                  </button>
                                ))}
                                {query && !exactMatch && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newName = row.namaPercetakan.trim();
                                      const added = addPercetakanSalur({
                                        namaPercetakan: newName,
                                        kontak: '-',
                                        telepon: '-',
                                        alamat: '-',
                                        keterangan: 'Ditambahkan dari Form Stock In/Out',
                                      });
                                      setMasterPercetakan(getStoredPercetakanSalur());
                                      handleUpdateCetakRow(row.id, 'namaPercetakan', added.namaPercetakan);
                                      setOpenPercetakanDropdownId(null);
                                      onShowToast(`Percetakan "${added.namaPercetakan}" ditambahkan ke Tabel Master`);
                                    }}
                                    className="w-full mt-1 text-left px-2.5 py-1.5 rounded-lg text-xs text-[#008d91] hover:bg-teal-50 font-medium transition-colors border-t border-slate-100 flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Tambahkan "{row.namaPercetakan}" ke Tabel Master</span>
                                  </button>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 2: Jumlah */}
                  <div className="w-32 sm:w-44 flex flex-col gap-1.5">
                    {index === 0 && (
                      <label className="text-slate-700 text-sm sm:text-base font-normal">
                        Jumlah
                      </label>
                    )}
                    <input
                      type="number"
                      min="1"
                      value={row.jumlahPercetakan}
                      onChange={(e) =>
                        handleUpdateCetakRow(row.id, 'jumlahPercetakan', e.target.value)
                      }
                      placeholder="Input Text..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
                    />
                  </div>

                  {/* Arrow Icon matching image.png */}
                  <div className="h-10 flex items-center justify-center shrink-0">
                    <div className="w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center shadow-xs">
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>

                  {/* Column 3: Tujuan Container */}
                  <div className="flex-1 min-w-[180px] max-w-xs flex flex-col gap-1.5">
                    {index === 0 && (
                      <label className="text-slate-700 text-sm sm:text-base font-normal">
                        Tujuan Container
                      </label>
                    )}
                    <div className="relative">
                      <input
                        type="text"
                        value={row.tujuanContainer}
                        onChange={(e) =>
                          handleUpdateCetakRow(row.id, 'tujuanContainer', e.target.value)
                        }
                        onFocus={() => setOpenCetakTargetDropdownId(row.id)}
                        placeholder="Search..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-11 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setOpenCetakTargetDropdownId(
                            openCetakTargetDropdownId === row.id ? null : row.id
                          )
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#007b7e] text-white flex items-center justify-center transition-colors cursor-pointer"
                        title="Pilih Container Tujuan"
                      >
                        <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
                      </button>

                      {openCetakTargetDropdownId === row.id && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 max-h-56 overflow-y-auto z-30 animate-in fade-in zoom-in-95">
                          <div className="text-xs font-semibold text-slate-400 px-2 py-1">
                            Pilih Container Tujuan
                          </div>
                          {containerOptions
                            .filter((opt) => opt.container !== '-')
                            .map((opt, i) => (
                              <button
                                key={`dest-cetak-${i}-${opt.container}`}
                                type="button"
                                onClick={() =>
                                  handleSelectCetakTargetContainer(
                                    row.id,
                                    opt.container,
                                    opt.lokasi
                                  )
                                }
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                  row.tujuanContainer === opt.container
                                    ? 'bg-teal-50 text-[#008d91] font-semibold'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span>{opt.container}</span>
                                <span className="text-[10px] text-slate-400">
                                  {opt.lokasi}
                                </span>
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 4: Jumlah */}
                  <div className="w-32 sm:w-44 flex flex-col gap-1.5">
                    {index === 0 && (
                      <label className="text-slate-700 text-sm sm:text-base font-normal">
                        Jumlah
                      </label>
                    )}
                    <input
                      type="number"
                      min="1"
                      value={row.jumlahTujuan}
                      onChange={(e) =>
                        handleUpdateCetakRow(row.id, 'jumlahTujuan', e.target.value)
                      }
                      placeholder="Input Text..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
                    />
                  </div>

                  {/* Action Icons matching image.png (X delete and + add row) */}
                  <div className="h-10 flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveCetakRow(row.id)}
                      title="Hapus baris ini"
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      <X className="w-4.5 h-4.5 stroke-[2]" />
                    </button>

                    <button
                      type="button"
                      onClick={handleAddCetakRow}
                      title="Tambah baris cetak baru"
                      className="w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#007b7e] text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* PINDAH CONTAINER ROWS matching existing layout */
          <>
            <div className="flex flex-col gap-4">
              {transferRows.map((row, index) => (
                <div
                  key={row.id}
                  className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-6"
                >
                  {/* Left label alignment spacer (hidden on mobile) */}
                  <div className="w-40 sm:w-48 shrink-0 hidden sm:block" />

                  {/* Three Columns: Sumber Container -> Jumlah -> Tujuan Container */}
                  <div className="flex-1 flex flex-wrap sm:flex-nowrap items-end gap-3 sm:gap-4 max-w-4xl">
                    {/* Column 1: Sumber Container */}
                    <div className="flex-1 min-w-[170px] max-w-xs flex flex-col gap-1.5">
                      {index === 0 && (
                        <label className="text-slate-700 text-sm sm:text-base font-normal">
                          Sumber Container
                        </label>
                      )}
                      <div className="relative">
                        <input
                          type="text"
                          value={row.sumberContainer}
                          onChange={(e) =>
                            handleUpdateRow(row.id, 'sumberContainer', e.target.value)
                          }
                          onFocus={() => setOpenSourceDropdownId(row.id)}
                          placeholder="Search..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-11 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setOpenSourceDropdownId(
                              openSourceDropdownId === row.id ? null : row.id
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#007b7e] text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Pilih Container Sumber"
                        >
                          <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        {openSourceDropdownId === row.id && (
                          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 max-h-56 overflow-y-auto z-30 animate-in fade-in zoom-in-95">
                            <div className="text-xs font-semibold text-slate-400 px-2 py-1">
                              Pilih Container Sumber
                            </div>
                            {containerOptions.map((opt, i) => (
                              <button
                                key={`src-${i}-${opt.container}`}
                                type="button"
                                onClick={() =>
                                  handleSelectSourceContainer(
                                    row.id,
                                    opt.container,
                                    opt.lokasi
                                  )
                                }
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                  row.sumberContainer === opt.container
                                    ? 'bg-teal-50 text-[#008d91] font-semibold'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span>{opt.container}</span>
                                <span className="text-[10px] text-slate-400">
                                  {opt.lokasi}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 2: Jumlah */}
                    <div className="w-32 sm:w-44 flex flex-col gap-1.5">
                      {index === 0 && (
                        <label className="text-slate-700 text-sm sm:text-base font-normal">
                          Jumlah
                        </label>
                      )}
                      <input
                        type="number"
                        min="1"
                        value={row.jumlah}
                        onChange={(e) =>
                          handleUpdateRow(row.id, 'jumlah', e.target.value)
                        }
                        placeholder="Input Text..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
                      />
                    </div>

                    {/* Middle Right Arrow Icon matching image.png */}
                    <div className="h-10 flex items-center justify-center shrink-0">
                      <div className="w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center shadow-xs">
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>

                    {/* Column 3: Tujuan Container */}
                    <div className="flex-1 min-w-[170px] max-w-xs flex flex-col gap-1.5">
                      {index === 0 && (
                        <label className="text-slate-700 text-sm sm:text-base font-normal">
                          Tujuan Container
                        </label>
                      )}
                      <div className="relative">
                        <input
                          type="text"
                          value={row.tujuanContainer}
                          onChange={(e) =>
                            handleUpdateRow(row.id, 'tujuanContainer', e.target.value)
                          }
                          onFocus={() => setOpenTargetDropdownId(row.id)}
                          placeholder="Search..."
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-11 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setOpenTargetDropdownId(
                              openTargetDropdownId === row.id ? null : row.id
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#007b7e] text-white flex items-center justify-center transition-colors cursor-pointer"
                          title="Pilih Container Tujuan"
                        >
                          <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
                        </button>

                        {openTargetDropdownId === row.id && (
                          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 max-h-56 overflow-y-auto z-30 animate-in fade-in zoom-in-95">
                            <div className="text-xs font-semibold text-slate-400 px-2 py-1">
                              Pilih Container Tujuan
                            </div>
                            {containerOptions.map((opt, i) => (
                              <button
                                key={`dest-${i}-${opt.container}`}
                                type="button"
                                onClick={() =>
                                  handleSelectTargetContainer(
                                    row.id,
                                    opt.container,
                                    opt.lokasi
                                  )
                                }
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                                  row.tujuanContainer === opt.container
                                    ? 'bg-teal-50 text-[#008d91] font-semibold'
                                    : 'text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span>{opt.container}</span>
                                <span className="text-[10px] text-slate-400">
                                  {opt.lokasi}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Icons matching image.png (X delete and + add row) */}
                    <div className="h-10 flex items-center gap-2 shrink-0">
                      {/* Remove row button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        title="Hapus baris ini"
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      >
                        <X className="w-4.5 h-4.5 stroke-[2]" />
                      </button>

                      {/* Add another container transfer row button */}
                      <button
                        type="button"
                        onClick={handleAddRow}
                        title="Tambah baris transfer container"
                        className="w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#007b7e] text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 4. Jenis Perubahan (for Pindah Container) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <label className="text-slate-700 text-sm sm:text-base font-normal w-40 sm:w-48 shrink-0">
                Jenis Perubahan
              </label>
              <div className="relative flex-1 max-w-md">
                <input
                  id="input-form-jenis-perubahan"
                  type="text"
                  value={jenisPerubahan}
                  onChange={(e) => setJenisPerubahan(e.target.value)}
                  onFocus={() => setIsJenisDropdownOpen(true)}
                  placeholder="Search..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-11 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setIsJenisDropdownOpen(!isJenisDropdownOpen)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#007b7e] text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Daftar Jenis Perubahan"
                >
                  <ChevronDown className="w-3.5 h-3.5 stroke-[3]" />
                </button>

                {isJenisDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 max-h-56 overflow-y-auto z-30 animate-in fade-in zoom-in-95">
                    <div className="text-xs font-semibold text-slate-400 px-2 py-1">
                      Pilih Jenis Perubahan
                    </div>
                    {masterJenisPerubahan.map((jp) => (
                      <button
                        key={jp.id}
                        type="button"
                        onClick={() => {
                          setJenisPerubahan(jp.jenisPerubahan);
                          setIsJenisDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          jenisPerubahan === jp.jenisPerubahan
                            ? 'bg-teal-50 text-[#008d91] font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{jp.jenisPerubahan}</span>
                        <span className="text-[10px] text-slate-400">
                          {jp.arahTipe}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* 5. Bottom "+ Add Item S-SALUR" Button matching image.png */}
        <div className="pt-2">
          <button
            type="button"
            id="btn-add-item-salur-row"
            onClick={() => {
              if (activeTab === 'buku_baru_cetak') {
                handleAddCetakRow();
                onShowToast('Baris cetak baru ditambahkan');
              } else {
                handleAddRow();
                onShowToast('Baris mutasi container ditambahkan');
              }
            }}
            className="inline-flex items-center gap-2 text-[#008d91] hover:text-[#007b7e] font-semibold text-sm transition-colors cursor-pointer"
          >
            <span className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
            </span>
            <span>Add Item S-SALUR</span>
          </button>
        </div>
      </form>
    </div>
  );
};
