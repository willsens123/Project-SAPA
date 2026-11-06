import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  Plus,
  X,
  EyeOff,
  Search,
  SlidersHorizontal,
  ArrowRight,
  Check,
  Building2,
  Users,
  User,
  Layers,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { PromoSalurItem } from '../types';
import { INITIAL_VIA_TRANSAKSI_SALUR } from '../viaSalurData';
import { INITIAL_KARYAWAN } from '../karyawanData';
import { INITIAL_IDENTITAS } from '../identitasData';
import { INITIAL_ORGANISASI } from '../organisasiData';
import { INITIAL_JENIS_GROUP_FUNNELING, INITIAL_FUNNELING_GROUPS } from '../funnelingData';
import { INITIAL_BOOKS } from '../salurData';
import { formatDatePickerValue } from '../utils/datePickerHelper';
import { DateRangePickerPopover } from './DateRangePickerPopover';

interface FormListPromoSalurProps {
  editingPromo?: PromoSalurItem | null;
  onCancel: () => void;
  onSave: (promo: PromoSalurItem) => void;
  onShowToast: (msg: string) => void;
}

interface ChannelRow {
  id: string;
  viaName: string;
  kodePromo: string;
}

interface TargetRow {
  id: string;
  category: 'all' | 'karyawan' | 'identitas' | 'organisasi' | 'funneling' | 'sub-organisasi';
  label: string;
}

interface DiscountRow {
  id: string;
  unit: '%' | 'Rp';
  nominal: string;
  itemSalur: string;
}

interface BundleRow {
  id: string;
  bundleName: string;
  itemSalur: string;
  nominal: string;
}

export const FormListPromoSalur: React.FC<FormListPromoSalurProps> = ({
  editingPromo,
  onCancel,
  onSave,
  onShowToast,
}) => {
  // Form fields
  const [namaPromo, setNamaPromo] = useState(editingPromo?.namaPromo || '');
  const [tanggalMulai, setTanggalMulai] = useState(editingPromo?.tanggalMulai || '');
  const [tanggalSelesai, setTanggalSelesai] = useState(editingPromo?.tanggalSelesai || '');
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false);

  // Channel Promo rows
  const [channelRows, setChannelRows] = useState<ChannelRow[]>(() => {
    if (editingPromo?.channelEntries && editingPromo.channelEntries.length > 0) {
      return editingPromo.channelEntries.map((c, i) => ({
        id: `ch-${i}`,
        viaName: c.viaName,
        kodePromo: c.kodePromo,
      }));
    }
    return [{ id: 'ch-1', viaName: '', kodePromo: '' }];
  });

  // Target Promo rows
  const [targetRows, setTargetRows] = useState<TargetRow[]>(() => {
    if (editingPromo?.targetEntries && editingPromo.targetEntries.length > 0) {
      return editingPromo.targetEntries.map((t, i) => ({
        id: `tg-${i}`,
        category: t.targetType,
        label: t.label,
      }));
    }
    return [{ id: 'tg-1', category: 'all', label: '' }];
  });

  // Limit Promo: 'Tidak ada limit' | 'Satu ID Pembeli hanya bisa pesan satu buah per Nama Item'
  const [limitPromo, setLimitPromo] = useState<string>(
    editingPromo?.limitPromo || 'Tidak ada limit'
  );
  const [limitPromoDropdownOpen, setLimitPromoDropdownOpen] = useState(false);

  // Kuota Pemakaian
  const [kuotaPemakaian, setKuotaPemakaian] = useState(
    editingPromo?.kuotaPemakaian || editingPromo?.persentaseKuota || ''
  );

  // Discount configuration
  const [isDiscountActive, setIsDiscountActive] = useState(
    !!(editingPromo?.discounts && editingPromo.discounts.length > 0)
  );
  const [discountRows, setDiscountRows] = useState<DiscountRow[]>(() => {
    if (editingPromo?.discounts && editingPromo.discounts.length > 0) {
      return editingPromo.discounts.map((d, i) => ({
        id: `disc-${i}`,
        unit: d.unit || '%',
        nominal: String(d.nominal || ''),
        itemSalur: d.itemSalur || '',
      }));
    }
    return [{ id: 'disc-1', unit: '%', nominal: '', itemSalur: '' }];
  });

  // Bundle configuration
  const [isBundleActive, setIsBundleActive] = useState(
    !!(editingPromo?.bundles && editingPromo.bundles.length > 0)
  );
  const [bundleRows, setBundleRows] = useState<BundleRow[]>(() => {
    if (editingPromo?.bundles && editingPromo.bundles.length > 0) {
      return editingPromo.bundles.map((b, i) => ({
        id: `bun-${i}`,
        bundleName: b.namaBundle || '',
        itemSalur: b.itemSalur || '',
        nominal: String(b.nominal || ''),
      }));
    }
    return [{ id: 'bun-1', bundleName: '', itemSalur: '', nominal: '' }];
  });

  // Dropdown states
  const [activeChannelDropdownIdx, setActiveChannelDropdownIdx] = useState<number | null>(null);
  const [channelSearchQuery, setChannelSearchQuery] = useState('');

  const [activeTargetDropdownIdx, setActiveTargetDropdownIdx] = useState<number | null>(null);
  const [targetCategoryTab, setTargetCategoryTab] = useState<
    'all' | 'karyawan' | 'identitas' | 'organisasi' | 'funneling' | 'sub-organisasi'
  >('all');
  const [targetSearchQuery, setTargetSearchQuery] = useState('');

  const [activeItemDropdownIdx, setActiveItemDropdownIdx] = useState<number | null>(null);
  const [itemSearchQuery, setItemSearchQuery] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveChannelDropdownIdx(null);
        setActiveTargetDropdownIdx(null);
        setActiveItemDropdownIdx(null);
        setLimitPromoDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered Via Transaksi S-SALUR for Channel Promo
  const filteredViaList = INITIAL_VIA_TRANSAKSI_SALUR.filter((via) => {
    const q = channelSearchQuery.toLowerCase();
    return !q || via.namaVia.toLowerCase().includes(q) || via.jenisVia.toLowerCase().includes(q);
  });

  // Target Promo options by category
  const targetOptions = React.useMemo(() => {
    const q = targetSearchQuery.toLowerCase().trim();

    if (targetCategoryTab === 'all') {
      return [{ id: 'all-1', label: 'All (Semua Pengguna)', category: 'all' as const }];
    }

    if (targetCategoryTab === 'karyawan') {
      const list = [
        { id: 'karyawan-all', label: 'Semua Karyawan', category: 'karyawan' as const },
        ...INITIAL_KARYAWAN.map((k) => ({
          id: k.id,
          label: `${k.kodeKaryawan} ${k.namaLengkap} (${k.divisi})`,
          category: 'karyawan' as const,
        })),
      ];
      return list.filter((item) => !q || item.label.toLowerCase().includes(q));
    }

    if (targetCategoryTab === 'identitas') {
      return INITIAL_IDENTITAS.map((idItem) => ({
        id: idItem.id,
        label: `${idItem.codeId || idItem.id} ${idItem.namaLengkap} (${idItem.namaPanggilan})`,
        category: 'identitas' as const,
      })).filter((item) => !q || item.label.toLowerCase().includes(q));
    }

    if (targetCategoryTab === 'organisasi') {
      return INITIAL_ORGANISASI.map((org) => ({
        id: org.id,
        label: `${org.namaOrg} (${org.jenisOrg})`,
        category: 'organisasi' as const,
      })).filter((item) => !q || item.label.toLowerCase().includes(q));
    }

    if (targetCategoryTab === 'funneling') {
      const groups = INITIAL_JENIS_GROUP_FUNNELING.map((g) => ({
        id: g.id,
        label: g.namaJenisGroup,
        category: 'funneling' as const,
      }));
      const extraCards = INITIAL_FUNNELING_GROUPS.map((c) => ({
        id: c.id,
        label: c.name,
        category: 'funneling' as const,
      }));
      const combined = [...groups, ...extraCards];
      return combined.filter((item) => !q || item.label.toLowerCase().includes(q));
    }

    if (targetCategoryTab === 'sub-organisasi') {
      const subOrgSet = new Set<string>();
      INITIAL_ORGANISASI.forEach((org) => {
        if (org.subOrg) {
          org.subOrg.split(',').forEach((s) => {
            const trimmed = s.trim();
            if (trimmed) subOrgSet.add(trimmed);
          });
        }
      });
      // Add standard sub-organisasi options
      ['Sumati Kirti', 'MAH', 'SAyS', 'Pustaka Lamrim', 'Dharma Centre Bali'].forEach((s) =>
        subOrgSet.add(s)
      );

      return Array.from(subOrgSet).map((sub, idx) => ({
        id: `sub-${idx}`,
        label: `Sub-Org: ${sub}`,
        category: 'sub-organisasi' as const,
      })).filter((item) => !q || item.label.toLowerCase().includes(q));
    }

    return [];
  }, [targetCategoryTab, targetSearchQuery]);

  // S-SALUR Items
  const filteredItemList = React.useMemo(() => {
    const q = itemSearchQuery.toLowerCase().trim();
    const allItems = [
      { id: 'all-items', title: 'Semua Item S-SALUR' },
      ...INITIAL_BOOKS.map((b) => ({ id: b.id, title: b.title })),
    ];
    return allItems.filter((i) => !q || i.title.toLowerCase().includes(q));
  }, [itemSearchQuery]);

  // Channel row handlers
  const handleAddChannelRow = () => {
    setChannelRows((prev) => [
      ...prev,
      { id: `ch-${Date.now()}`, viaName: '', kodePromo: '' },
    ]);
  };

  const handleRemoveChannelRow = (idx: number) => {
    if (channelRows.length <= 1) {
      setChannelRows([{ id: 'ch-1', viaName: '', kodePromo: '' }]);
      return;
    }
    setChannelRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateChannel = (idx: number, field: 'viaName' | 'kodePromo', value: string) => {
    setChannelRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );
  };

  // Target row handlers
  const handleAddTargetRow = () => {
    setTargetRows((prev) => [
      ...prev,
      { id: `tg-${Date.now()}`, category: 'all', label: '' },
    ]);
  };

  const handleRemoveTargetRow = (idx: number) => {
    if (targetRows.length <= 1) {
      setTargetRows([{ id: 'tg-1', category: 'all', label: '' }]);
      return;
    }
    setTargetRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSelectTarget = (idx: number, opt: { label: string; category: any }) => {
    setTargetRows((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, label: opt.label, category: opt.category } : row
      )
    );
    setActiveTargetDropdownIdx(null);
  };

  // Discount handlers
  const handleToggleDiscountUnit = (idx: number) => {
    setDiscountRows((prev) =>
      prev.map((row, i) =>
        i === idx ? { ...row, unit: row.unit === '%' ? 'Rp' : '%' } : row
      )
    );
  };

  const handleAddDiscountRow = () => {
    setDiscountRows((prev) => [
      ...prev,
      { id: `disc-${Date.now()}`, unit: '%', nominal: '', itemSalur: '' },
    ]);
    setIsDiscountActive(true);
  };

  const handleRemoveDiscountRow = (idx: number) => {
    if (discountRows.length <= 1) {
      setIsDiscountActive(false);
      setDiscountRows([{ id: 'disc-1', unit: '%', nominal: '', itemSalur: '' }]);
    } else {
      setDiscountRows((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const handleUpdateDiscount = (
    idx: number,
    field: 'nominal' | 'itemSalur',
    val: string
  ) => {
    setDiscountRows((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: val } : row))
    );
  };

  // Save Promo Submission
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!namaPromo.trim()) {
      onShowToast('Nama Promo wajib diisi');
      const el = document.getElementById('input-nama-promo');
      el?.focus();
      return;
    }

    const channels = channelRows
      .map((c) => c.viaName.trim())
      .filter(Boolean);

    const kodePromo = channelRows
      .map((c) => c.kodePromo.trim())
      .filter(Boolean);

    // Build subtitle summary
    let subtitle = '';
    if (isDiscountActive && discountRows.length > 0 && discountRows[0].nominal) {
      const d = discountRows[0];
      subtitle = d.unit === '%' ? `Diskon ${d.nominal}%` : `Diskon Rp ${d.nominal}`;
    } else if (channelRows[0]?.kodePromo) {
      subtitle = `Kode: ${channelRows[0].kodePromo}`;
    } else {
      subtitle = 'Promo Khusus S-SALUR';
    }

    // Determine status
    let status: 'Ongoing' | 'Coming Soon' | 'Berakhir' = 'Ongoing';
    if (editingPromo?.status) {
      status = editingPromo.status;
    }

    const newPromo: PromoSalurItem = {
      id: editingPromo?.id || `promo-${Date.now()}`,
      namaPromo: namaPromo.trim(),
      subtitle,
      status,
      tanggalMulai: tanggalMulai.trim() || '15 Nov 2021',
      tanggalSelesai: tanggalSelesai.trim() || '30 Nov 2021',
      jamMulai: editingPromo?.jamMulai || '00:00 WIB',
      jamSelesai: editingPromo?.jamSelesai || '23.59 WIB',
      persentaseKuota: kuotaPemakaian ? `0/${kuotaPemakaian}` : '-/∞',
      keterangan: editingPromo?.keterangan || '-',
      channels: channels,
      kodePromo: kodePromo,
      channelEntries: channelRows
        .filter((c) => c.viaName.trim() || c.kodePromo.trim())
        .map((c, i) => ({
          id: c.id || `ch-${i}`,
          viaName: c.viaName.trim(),
          kodePromo: c.kodePromo.trim(),
        })),
      targetEntries: targetRows.filter((t) => t.label),
      limitPromo: limitPromo || 'Tidak ada limit',
      kuotaPemakaian: kuotaPemakaian.trim(),
      discounts: isDiscountActive
        ? discountRows.filter((d) => d.nominal || d.itemSalur)
        : [],
      bundles: isBundleActive ? bundleRows : [],
    };

    onSave(newPromo);
    onShowToast(`Promo "${newPromo.namaPromo}" berhasil disimpan`);
  };

  return (
    <div className="w-full flex flex-col gap-6 pb-20 select-none">
      {/* Top Action Bar (Above main card) matching Screenshot 1 & 2 */}
      <div className="flex items-center justify-end gap-3 px-2 sm:px-4">
        {/* Eye Off Icon */}
        <button
          type="button"
          title="Sembunyikan Kolom / Mode Privasi"
          onClick={() => onShowToast('Mode privasi tampilan diaktifkan')}
          className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <EyeOff className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Search Toggle Icon */}
        <button
          type="button"
          title="Fokus Pencarian"
          onClick={() => {
            const el = document.getElementById('input-nama-promo');
            el?.focus();
          }}
          className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Sliders / Settings Icon */}
        <button
          type="button"
          title="Pengaturan Form"
          onClick={() => onShowToast('Pengaturan form promo')}
          className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* + Add Button */}
        <button
          id="btn-submit-form-promo-salur"
          type="button"
          onClick={() => handleSubmit()}
          title="Simpan Promo S-SALUR"
          className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Form Body - Pristine Layout Matching Screenshots */}
      <div className="w-full px-2 sm:px-6 pt-4 max-w-4xl" ref={dropdownRef}>
        <div className="flex flex-col gap-6">
          {/* Row 1: Nama Promo */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="w-40 sm:w-48 shrink-0 text-[#555e69] text-sm sm:text-base font-normal">
              Nama Promo
            </label>
            <div className="flex-1 max-w-md">
              <input
                id="input-nama-promo"
                type="text"
                value={namaPromo}
                onChange={(e) => setNamaPromo(e.target.value)}
                placeholder="Input Text..."
                className="w-full h-11 px-4 border border-slate-200/90 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#008d91] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Row 2: Tanggal Berlaku */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="w-40 sm:w-48 shrink-0 text-[#555e69] text-sm sm:text-base font-normal">
              Tanggal Berlaku
            </label>
            <div className="flex-1 max-w-md flex items-center gap-3 relative">
              {/* Tanggal Mulai */}
              <input
                type="text"
                value={tanggalMulai}
                onChange={(e) => setTanggalMulai(e.target.value)}
                onClick={() => setIsDateRangePickerOpen(true)}
                placeholder="Input Date..."
                className="w-1/2 h-11 px-4 border border-slate-200/90 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#008d91] outline-none transition-colors cursor-pointer"
              />

              <span className="text-slate-400 font-bold">-</span>

              {/* Tanggal Selesai with Calendar Icon inside */}
              <div className="relative w-1/2">
                <input
                  type="text"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  onClick={() => setIsDateRangePickerOpen(true)}
                  placeholder="Input Date..."
                  className="w-full h-11 pl-4 pr-10 border border-slate-200/90 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#008d91] outline-none transition-colors cursor-pointer"
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

          {/* Row 3: Channel Promo (Via Transaksi S-SALUR ➔ Kode Promo) */}
          {channelRows.map((chRow, idx) => (
            <div
              key={chRow.id}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6"
            >
              <label className="w-40 sm:w-48 shrink-0 text-[#555e69] text-sm sm:text-base font-normal">
                {idx === 0 ? 'Channel Promo' : ''}
              </label>

              <div className="flex-1 max-w-md flex items-center gap-2 sm:gap-3">
                {/* Search Via Transaksi S-SALUR Dropdown */}
                <div className="relative w-[180px] sm:w-[200px] shrink-0">
                  <input
                    type="text"
                    value={chRow.viaName}
                    onChange={(e) => {
                      handleUpdateChannel(idx, 'viaName', e.target.value);
                      setActiveChannelDropdownIdx(idx);
                      setChannelSearchQuery(e.target.value);
                    }}
                    onFocus={() => {
                      setActiveChannelDropdownIdx(idx);
                      setChannelSearchQuery('');
                    }}
                    placeholder="Search..."
                    className="w-full h-11 pl-4 pr-9 border border-slate-200/90 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#008d91] outline-none transition-colors"
                  />
                  {/* Teal Circular Chevron Button matching screenshot */}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveChannelDropdownIdx(
                        activeChannelDropdownIdx === idx ? null : idx
                      )
                    }
                    className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2 hover:bg-[#05828e] cursor-pointer transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>

                  {/* Dropdown Options Popover */}
                  {activeChannelDropdownIdx === idx && (
                    <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200/80 p-2 z-50 max-h-60 overflow-y-auto">
                      <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                        Pilih Via Transaksi S-SALUR
                      </div>
                      {filteredViaList.length === 0 ? (
                        <div className="text-xs text-slate-400 p-2">Tidak ditemukan</div>
                      ) : (
                        filteredViaList.map((via) => (
                          <button
                            key={via.id}
                            type="button"
                            onClick={() => {
                              handleUpdateChannel(idx, 'viaName', via.namaVia);
                              setActiveChannelDropdownIdx(null);
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-[#008d91]/10 hover:text-[#008d91] flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="font-medium">{via.namaVia}</span>
                            <span className="text-[10px] text-slate-400">{via.jenisVia}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Arrow Icon matching screenshot */}
                <div className="w-5 h-5 flex items-center justify-center text-[#008d91] shrink-0">
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </div>

                {/* Kode Promo Input */}
                <input
                  type="text"
                  value={chRow.kodePromo}
                  onChange={(e) => handleUpdateChannel(idx, 'kodePromo', e.target.value)}
                  placeholder="Input Text..."
                  className="flex-1 h-11 px-4 border border-slate-200/90 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#008d91] outline-none transition-colors"
                />

                {/* Close (X) Icon */}
                <button
                  type="button"
                  title="Hapus baris channel"
                  onClick={() => handleRemoveChannelRow(idx)}
                  className="w-5 h-5 flex items-center justify-center text-[#008d91] hover:text-rose-500 cursor-pointer transition-colors shrink-0"
                >
                  <X className="w-4 h-4 stroke-[2]" />
                </button>

                {/* Plus (+) Icon */}
                <button
                  type="button"
                  title="Tambah channel promo"
                  onClick={handleAddChannelRow}
                  className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center hover:bg-[#05828e] cursor-pointer transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          ))}

          {/* Row 4: Target Promo */}
          {targetRows.map((tgRow, idx) => (
            <div
              key={tgRow.id}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6"
            >
              <label className="w-40 sm:w-48 shrink-0 text-[#555e69] text-sm sm:text-base font-normal">
                {idx === 0 ? 'Target Promo' : ''}
              </label>

              <div className="flex-1 max-w-md flex items-center gap-2 sm:gap-3">
                {/* Search Target Promo Dropdown */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={tgRow.label}
                    onChange={(e) => {
                      setTargetRows((prev) =>
                        prev.map((r, i) => (i === idx ? { ...r, label: e.target.value } : r))
                      );
                      setActiveTargetDropdownIdx(idx);
                      setTargetSearchQuery(e.target.value);
                    }}
                    onFocus={() => {
                      setActiveTargetDropdownIdx(idx);
                      setTargetSearchQuery('');
                    }}
                    placeholder="Search..."
                    className="w-full h-11 pl-4 pr-9 border border-slate-200/90 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#008d91] outline-none transition-colors"
                  />

                  {/* Teal Circular Chevron Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setActiveTargetDropdownIdx(
                        activeTargetDropdownIdx === idx ? null : idx
                      )
                    }
                    className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2 hover:bg-[#05828e] cursor-pointer transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>

                  {/* Target Options Popover with Categories */}
                  {activeTargetDropdownIdx === idx && (
                    <div className="absolute left-0 top-full mt-1.5 w-80 bg-white rounded-xl shadow-xl border border-slate-200/80 p-2.5 z-50">
                      {/* Target Categories Nav */}
                      <div className="flex flex-wrap gap-1 pb-2 border-b border-slate-100">
                        {(
                          [
                            { key: 'all', label: 'All' },
                            { key: 'karyawan', label: 'Karyawan' },
                            { key: 'identitas', label: 'Identitas' },
                            { key: 'organisasi', label: 'Organisasi' },
                            { key: 'funneling', label: 'Funneling' },
                            { key: 'sub-organisasi', label: 'Sub-Org' },
                          ] as const
                        ).map((tab) => (
                          <button
                            key={tab.key}
                            type="button"
                            onClick={() => {
                              setTargetCategoryTab(tab.key);
                              setTargetSearchQuery('');
                            }}
                            className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${
                              targetCategoryTab === tab.key
                                ? 'bg-[#008d91] text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Items list */}
                      <div className="max-h-48 overflow-y-auto mt-2 space-y-1">
                        {targetOptions.length === 0 ? (
                          <div className="text-xs text-slate-400 p-2">Tidak ditemukan</div>
                        ) : (
                          targetOptions.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSelectTarget(idx, opt)}
                              className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-[#008d91]/10 hover:text-[#008d91] transition-colors cursor-pointer flex items-center justify-between"
                            >
                              <span>{opt.label}</span>
                              {tgRow.label === opt.label && (
                                <Check className="w-3.5 h-3.5 text-[#008d91]" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Close (X) Icon */}
                <button
                  type="button"
                  title="Hapus baris target"
                  onClick={() => handleRemoveTargetRow(idx)}
                  className="w-5 h-5 flex items-center justify-center text-[#008d91] hover:text-rose-500 cursor-pointer transition-colors shrink-0"
                >
                  <X className="w-4 h-4 stroke-[2]" />
                </button>

                {/* Plus (+) Icon */}
                <button
                  type="button"
                  title="Tambah target promo"
                  onClick={handleAddTargetRow}
                  className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center hover:bg-[#05828e] cursor-pointer transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          ))}

          {/* Row: Limit Promo (di atas Kuota Pemakaian) */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="w-40 sm:w-48 shrink-0 text-[#555e69] text-sm sm:text-base font-normal">
              Limit Promo
            </label>
            <div className="flex-1 max-w-md relative">
              <div
                onClick={() => setLimitPromoDropdownOpen(!limitPromoDropdownOpen)}
                className="w-full h-11 pl-4 pr-10 border border-slate-200/90 rounded-xl text-sm text-slate-700 bg-white flex items-center justify-between focus-within:border-[#008d91] cursor-pointer select-none transition-colors"
              >
                <span className="truncate">
                  {limitPromo || 'Tidak ada limit'}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLimitPromoDropdownOpen(!limitPromoDropdownOpen);
                  }}
                  className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2 hover:bg-[#05828e] cursor-pointer transition-colors"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 stroke-[2.5] transition-transform ${
                      limitPromoDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {/* Limit Promo Options Popover */}
              {limitPromoDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-xl border border-slate-200/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider mb-1">
                    Pilih Limit Promo
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLimitPromo('Tidak ada limit');
                      setLimitPromoDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      limitPromo === 'Tidak ada limit'
                        ? 'bg-teal-50 text-[#008d91] font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Tidak ada limit</span>
                    {limitPromo === 'Tidak ada limit' && (
                      <Check className="w-4 h-4 text-[#008d91]" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLimitPromo('Satu ID Pembeli hanya bisa pesan satu buah per Nama Item');
                      setLimitPromoDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-between cursor-pointer ${
                      limitPromo === 'Satu ID Pembeli hanya bisa pesan satu buah per Nama Item'
                        ? 'bg-teal-50 text-[#008d91] font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>Satu ID Pembeli hanya bisa pesan satu buah per Nama Item</span>
                    {limitPromo === 'Satu ID Pembeli hanya bisa pesan satu buah per Nama Item' && (
                      <Check className="w-4 h-4 text-[#008d91] shrink-0 ml-2" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Row 5: Kuota Pemakaian */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="w-40 sm:w-48 shrink-0 text-[#555e69] text-sm sm:text-base font-normal">
              Kuota Pemakaian
            </label>
            <div className="flex-1 max-w-md">
              <input
                type="text"
                value={kuotaPemakaian}
                onChange={(e) => setKuotaPemakaian(e.target.value)}
                placeholder="Input Text..."
                className="w-full h-11 px-4 border border-slate-200/90 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#008d91] outline-none transition-colors"
              />
            </div>
          </div>

          {/* Row 6: Discount Section - Toggle & Inputs matching Screenshot 1, 2, 3 */}
          <div>
            {!isDiscountActive ? (
              /* Inactive: Teal Plus Circle with Discount Label matching image 1 & 2 */
              <button
                type="button"
                onClick={() => setIsDiscountActive(true)}
                className="flex items-center gap-2.5 text-[#008d91] hover:text-[#05828e] cursor-pointer transition-colors py-1"
              >
                <span className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
                <span className="text-sm sm:text-base font-medium">Discount</span>
              </button>
            ) : (
              /* Active: Red Minus Circle with Discount Label matching image 3 */
              <div className="flex flex-col gap-6">
                <button
                  type="button"
                  onClick={() => setIsDiscountActive(false)}
                  className="flex items-center gap-2.5 text-[#008d91] hover:text-[#05828e] cursor-pointer transition-colors py-1"
                >
                  <span className="w-5 h-5 rounded-full bg-[#ef4444] text-white flex items-center justify-center">
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                  <span className="text-sm sm:text-base font-medium">Discount</span>
                </button>

                {/* Discount details */}
                {discountRows.map((discRow, idx) => (
                  <div key={discRow.id} className="flex flex-col gap-6">
                    {/* Discount Input: [ % / Rp Input Nominal... ] */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <label className="w-40 sm:w-48 shrink-0 text-[#555e69] text-sm sm:text-base font-normal">
                        Discount
                      </label>
                      <div className="flex-1 max-w-md relative flex items-center">
                        {/* % / Rp Toggle Badge inside input box */}
                        <div className="relative w-full">
                          <input
                            type="text"
                            value={discRow.nominal}
                            onChange={(e) =>
                              handleUpdateDiscount(idx, 'nominal', e.target.value)
                            }
                            placeholder="Input Nominal..."
                            className={`w-full h-11 pr-4 border border-slate-200/90 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#008d91] outline-none transition-colors ${
                              discRow.unit === 'Rp' ? 'pl-12' : 'pl-10'
                            }`}
                          />
                          <button
                            type="button"
                            title="Klik untuk ubah antara % atau Rp"
                            onClick={() => handleToggleDiscountUnit(idx)}
                            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#008d91] hover:bg-[#008d91]/10 px-1.5 py-0.5 rounded cursor-pointer transition-colors flex items-center gap-0.5"
                          >
                            <span>{discRow.unit}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Item S-SALUR Input: [ Search... ⌄ ] ✕ ⊕ */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <label className="w-40 sm:w-48 shrink-0 text-[#555e69] text-sm sm:text-base font-normal">
                        Item S-SALUR
                      </label>
                      <div className="flex-1 max-w-md flex items-center gap-2 sm:gap-3">
                        {/* Search Item Dropdown */}
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={discRow.itemSalur}
                            onChange={(e) => {
                              handleUpdateDiscount(idx, 'itemSalur', e.target.value);
                              setActiveItemDropdownIdx(idx);
                              setItemSearchQuery(e.target.value);
                            }}
                            onFocus={() => {
                              setActiveItemDropdownIdx(idx);
                              setItemSearchQuery('');
                            }}
                            placeholder="Search..."
                            className="w-full h-11 pl-4 pr-9 border border-slate-200/90 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#008d91] outline-none transition-colors"
                          />

                          {/* Circular Chevron Button */}
                          <button
                            type="button"
                            onClick={() =>
                              setActiveItemDropdownIdx(
                                activeItemDropdownIdx === idx ? null : idx
                              )
                            }
                            className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center absolute right-2.5 top-1/2 -translate-y-1/2 hover:bg-[#05828e] cursor-pointer transition-colors"
                          >
                            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>

                          {/* Item S-SALUR Dropdown Menu */}
                          {activeItemDropdownIdx === idx && (
                            <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-xl border border-slate-200/80 p-2 z-50 max-h-56 overflow-y-auto">
                              <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                                Pilih Item S-SALUR
                              </div>
                              {filteredItemList.map((it) => (
                                <button
                                  key={it.id}
                                  type="button"
                                  onClick={() => {
                                    handleUpdateDiscount(idx, 'itemSalur', it.title);
                                    setActiveItemDropdownIdx(null);
                                  }}
                                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-[#008d91]/10 hover:text-[#008d91] flex items-center justify-between transition-colors cursor-pointer"
                                >
                                  <span>{it.title}</span>
                                  {discRow.itemSalur === it.title && (
                                    <Check className="w-3.5 h-3.5 text-[#008d91]" />
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Close (X) Icon */}
                        <button
                          type="button"
                          title="Hapus item S-SALUR"
                          onClick={() => handleRemoveDiscountRow(idx)}
                          className="w-5 h-5 flex items-center justify-center text-[#008d91] hover:text-rose-500 cursor-pointer transition-colors shrink-0"
                        >
                          <X className="w-4 h-4 stroke-[2]" />
                        </button>

                        {/* Plus (+) Icon */}
                        <button
                          type="button"
                          title="Tambah item diskon"
                          onClick={handleAddDiscountRow}
                          className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center hover:bg-[#05828e] cursor-pointer transition-colors shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Additional Discount button below active discounts matching image 3 */}
                <button
                  type="button"
                  onClick={handleAddDiscountRow}
                  className="flex items-center gap-2.5 text-[#008d91] hover:text-[#05828e] cursor-pointer transition-colors py-1"
                >
                  <span className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                  <span className="text-sm sm:text-base font-medium">Discount</span>
                </button>
              </div>
            )}
          </div>

          {/* Row 7: Bundle Section */}
          <div>
            {!isBundleActive ? (
              <button
                type="button"
                onClick={() => setIsBundleActive(true)}
                className="flex items-center gap-2.5 text-[#008d91] hover:text-[#05828e] cursor-pointer transition-colors py-1"
              >
                <span className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
                <span className="text-sm sm:text-base font-medium">Bundle</span>
              </button>
            ) : (
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => setIsBundleActive(false)}
                  className="flex items-center gap-2.5 text-[#008d91] hover:text-[#05828e] cursor-pointer transition-colors py-1"
                >
                  <span className="w-5 h-5 rounded-full bg-[#ef4444] text-white flex items-center justify-center">
                    <X className="w-3.5 h-3.5 stroke-[2.5]" />
                  </span>
                  <span className="text-sm sm:text-base font-medium">Bundle</span>
                </button>

                {/* Bundle rows */}
                {bundleRows.map((bun, idx) => (
                  <div key={bun.id} className="flex flex-col gap-3 pl-4 border-l-2 border-[#008d91]/30">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                      <label className="w-36 sm:w-44 text-[#555e69] text-xs sm:text-sm">
                        Nama Bundle
                      </label>
                      <input
                        type="text"
                        value={bun.bundleName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBundleRows((prev) =>
                            prev.map((r, i) => (i === idx ? { ...r, bundleName: val } : r))
                          );
                        }}
                        placeholder="Contoh: Paket 3 Buku Spesial..."
                        className="flex-1 max-w-md h-10 px-4 border border-slate-200/90 rounded-xl text-sm text-slate-700 outline-none focus:border-[#008d91]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Actions: Cancel and Save buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200/80 mt-6">
            <button
              id="btn-cancel-bottom-form-promo-salur"
              type="button"
              onClick={onCancel}
              className="px-8 py-2.5 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-600 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-save-bottom-form-promo-salur"
              type="button"
              onClick={() => handleSubmit()}
              className="px-8 py-2.5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
