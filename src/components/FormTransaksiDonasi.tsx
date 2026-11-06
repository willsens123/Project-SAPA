import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Calendar,
  ChevronDown,
  Plus,
  Minus,
  X,
  EyeOff,
  Search,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import {
  DonasiOrder,
  DonasiItem,
  AVAILABLE_DONASI_PRODUCTS,
  MasterDonasiProduct,
} from '../donasiData';
import { IdentitasItem } from '../identitasData';
import { ViaTransaksiDonasiItem, DharmaPatronRutinItem, OrganisasiItem } from '../types';
import { INITIAL_VIA_TRANSAKSI_DONASI } from '../viaDonasiData';
import { getDharmaPatronFromStorage, INITIAL_DHARMA_PATRON_LIST } from '../dharmaPatronRutinData';
import { formatDatePickerValue } from '../utils/datePickerHelper';
import {
  IdentitasIdSelector,
  IdentitasIdSelectorItem,
  NO_NAME_SELECTOR_ITEM,
} from './IdentitasIdSelector';
import {
  generateKodeTransaksi,
  getUrutanTransaksiPerTahun,
  normalizeVia,
} from '../utils/kodeTransaksiHelper';

interface FormSelectedDonasiItem {
  id: string;
  codeBadge: string;
  codeBadgeColor: string;
  name: string;
  price: number;
  formattedPrice: string;
  category: string;
  quantity: number;
}

interface FormTransaksiDonasiProps {
  onCancel: () => void;
  onSave: (order: Partial<DonasiOrder>) => void;
  onShowToast: (msg: string) => void;
  identitasList?: IdentitasItem[];
  organisasiList?: OrganisasiItem[];
  onNavigateView?: (view: 'formIdentitas' | 'formOrganisasi') => void;
  viaList?: ViaTransaksiDonasiItem[];
  dharmaPatronList?: DharmaPatronRutinItem[];
  initialItems?: FormSelectedDonasiItem[];
  existingOrders?: DonasiOrder[];
}

export const FormTransaksiDonasi: React.FC<FormTransaksiDonasiProps> = ({
  onCancel,
  onSave,
  onShowToast,
  identitasList = [],
  organisasiList = [],
  onNavigateView,
  viaList,
  dharmaPatronList,
  initialItems,
  existingOrders = [],
}) => {
  // Available Via options from dynamic Via Transaksi D-DONASI
  const availableViaItems = useMemo(() => {
    return viaList && viaList.length > 0 ? viaList : INITIAL_VIA_TRANSAKSI_DONASI;
  }, [viaList]);

  const viaOptions = useMemo(() => {
    return Array.from(new Set(availableViaItems.map((v) => v.namaVia)));
  }, [availableViaItems]);

  // Patrons from List Dharma Patron Rutin
  const availablePatrons = useMemo<DharmaPatronRutinItem[]>(() => {
    if (dharmaPatronList && dharmaPatronList.length > 0) return dharmaPatronList;
    return getDharmaPatronFromStorage();
  }, [dharmaPatronList]);

  // Form States
  const [tanggal, setTanggal] = useState('15 Nov 2021');
  const [via, setVia] = useState<string>(() => availableViaItems[0]?.namaVia || 'Call Center');
  const [isViaOpen, setIsViaOpen] = useState(false);

  const [identitasId, setIdentitasId] = useState('10001 Lilo');
  const [selectedIdentitasCode, setSelectedIdentitasCode] = useState('');
  const [selectedIdentitasId, setSelectedIdentitasId] = useState('');
  const [namaDonatur, setNamaDonatur] = useState('');

  // Dropdown & Search state for multiple donatur patron
  const [isDonaturDropdownOpen, setIsDonaturDropdownOpen] = useState(false);
  const [donaturSearchFilter, setDonaturSearchFilter] = useState('');
  const donaturDropdownRef = useRef<HTMLDivElement>(null);

  // Selected Donation Items (empty by default before selection)
  const [selectedItems, setSelectedItems] = useState<FormSelectedDonasiItem[]>(() => {
    if (initialItems && initialItems.length > 0) return initialItems;
    return [];
  });

  // Item D-DONASI Search & Dropdown State
  const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false);
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const itemSearchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (itemSearchRef.current && !itemSearchRef.current.contains(e.target as Node)) {
        setIsItemDropdownOpen(false);
      }
      if (donaturDropdownRef.current && !donaturDropdownRef.current.contains(e.target as Node)) {
        setIsDonaturDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Nama Pelimpahan Jasa
  const [pelimpahanInput, setPelimpahanInput] = useState('');
  const [pelimpahanList, setPelimpahanList] = useState<string[]>(['Suhu Bhadra Ruci']);

  // Info Program Dana
  const [infoProgram, setInfoProgram] = useState('Instagram');
  const [isInfoProgramOpen, setIsInfoProgramOpen] = useState(false);
  const infoProgramOptions = [
    'Instagram',
    'Website YPPLN',
    'WhatsApp Group',
    'Teman / Kerabat',
    'Brosur / Pamflet',
    'Sosial Media Lainnya',
  ];

  // Keterangan
  const [keterangan, setKeterangan] = useState('');

  // Item Stepper logic
  const handleUpdateQuantity = (id: string, delta: number) => {
    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Helper to test if a patron matches the current Identitas ID
  const isPatronMatchingIdentitas = useCallback(
    (patron: DharmaPatronRutinItem, identStr: string, code?: string, id?: string) => {
      if (!identStr || !identStr.trim()) return false;
      const cleanIdent = identStr.trim().toLowerCase();

      // Check identitasId
      if (patron.identitasId) {
        const pIdent = patron.identitasId.trim().toLowerCase();
        if (pIdent) {
          if (cleanIdent === pIdent || cleanIdent.includes(pIdent) || pIdent.includes(cleanIdent)) return true;
          if (code && pIdent === code.trim().toLowerCase()) return true;
          if (id && pIdent === id.trim().toLowerCase()) return true;
        }
      }

      // Check noDonatur (e.g. "00031")
      if (patron.noDonatur) {
        const pNo = patron.noDonatur.trim().toLowerCase();
        if (pNo) {
          if (cleanIdent.startsWith(pNo) || cleanIdent.includes(pNo)) return true;
          if (code && pNo === code.trim().toLowerCase()) return true;
        }
      }

      // Check namaDonatur (if identStr contains patron's donor name)
      if (patron.namaDonatur) {
        const pName = patron.namaDonatur.trim().toLowerCase();
        if (pName && (cleanIdent === pName || cleanIdent.includes(pName))) return true;
      }

      return false;
    },
    []
  );

  // Patrons in List Dharma Patron Rutin registered under current Identitas ID
  const matchingPatronsForIdentitas = useMemo(() => {
    return availablePatrons.filter((p) =>
      isPatronMatchingIdentitas(p, identitasId, selectedIdentitasCode, selectedIdentitasId)
    );
  }, [availablePatrons, identitasId, selectedIdentitasCode, selectedIdentitasId, isPatronMatchingIdentitas]);

  // Is current Identitas ID registered in List Dharma Patron Rutin
  const isIdentitasInDharmaPatron = matchingPatronsForIdentitas.length > 0;

  // Distinct donor names registered under this Identitas ID
  const distinctDonaturNames = useMemo(() => {
    const names = matchingPatronsForIdentitas.map((p) => p.namaDonatur.trim()).filter(Boolean);
    return Array.from(new Set(names));
  }, [matchingPatronsForIdentitas]);

  // Show search button if more than 1 distinct donor name registered for this Identitas ID
  const hasMultipleDonaturs = distinctDonaturNames.length > 1;

  // Helper to find a patron matching current Identitas ID AND a given donor name
  const getMatchedPatronByDonatur = useCallback(
    (donorName: string) => {
      if (!donorName) return undefined;
      const cleanDonor = donorName.trim().toLowerCase();

      // Check within matching patrons for this identitas first
      const foundInIdentitas = matchingPatronsForIdentitas.find(
        (p) => p.namaDonatur.trim().toLowerCase() === cleanDonor
      );
      if (foundInIdentitas) return foundInIdentitas;

      // Fallback: search anywhere in availablePatrons matching both
      return availablePatrons.find(
        (p) =>
          p.namaDonatur.trim().toLowerCase() === cleanDonor &&
          isPatronMatchingIdentitas(p, identitasId, selectedIdentitasCode, selectedIdentitasId)
      );
    },
    [matchingPatronsForIdentitas, availablePatrons, identitasId, selectedIdentitasCode, selectedIdentitasId, isPatronMatchingIdentitas]
  );

  // Sync nominal price and pelimpahan jasa from matched patron
  const syncPatronData = useCallback((targetPatron: DharmaPatronRutinItem) => {
    const newPrice = targetPatron.donasiPerbulan;
    const newFormattedPrice = `Rp${newPrice.toLocaleString('id-ID')}`;

    setSelectedItems((prev) =>
      prev.map((it) => {
        if (it.name === 'Donasi Patron Rutin') {
          return {
            ...it,
            price: newPrice,
            formattedPrice: newFormattedPrice,
          };
        }
        return it;
      })
    );

    if (targetPatron.pelimpahanJasa && targetPatron.pelimpahanJasa.length > 0) {
      setPelimpahanList([...targetPatron.pelimpahanJasa]);
    }
  }, []);

  // Filter for multiple donors search popover
  const filteredDonaturOptions = useMemo(() => {
    if (!donaturSearchFilter.trim()) return matchingPatronsForIdentitas;
    const q = donaturSearchFilter.toLowerCase().trim();
    return matchingPatronsForIdentitas.filter(
      (p) =>
        p.namaDonatur.toLowerCase().includes(q) ||
        p.noDonatur.toLowerCase().includes(q) ||
        (p.panggilan && p.panggilan.toLowerCase().includes(q))
    );
  }, [matchingPatronsForIdentitas, donaturSearchFilter]);

  // When Identitas ID is not in Dharma Patron Rutin, ensure Donasi Patron Rutin is removed from selectedItems
  useEffect(() => {
    if (!isIdentitasInDharmaPatron) {
      setSelectedItems((prev) => prev.filter((it) => it.name !== 'Donasi Patron Rutin'));
    }
  }, [isIdentitasInDharmaPatron]);

  // Selectable items in dropdown
  interface SelectableDonasiItem {
    id: string;
    codeBadge: string;
    codeBadgeColor: string;
    name: string;
    price: number;
    formattedPrice: string;
    category: string;
    patronInfo?: DharmaPatronRutinItem;
  }

  const selectableDonasiProducts = useMemo<SelectableDonasiItem[]>(() => {
    const items: SelectableDonasiItem[] = [];

    // Current matched patron for price and category display
    const activePatron =
      getMatchedPatronByDonatur(namaDonatur) ||
      matchingPatronsForIdentitas[0];

    AVAILABLE_DONASI_PRODUCTS.forEach((prod) => {
      if (prod.name === 'Donasi Patron Rutin') {
        // Point 1: Jika "Identitas ID" pada "Form Transaksi D-DONASI" tidak ada di "List Dharma Patron Rutin":
        // Item D-DONASI "Donasi Patron Rutin" tidak akan muncul di Item D-DONASI.
        if (isIdentitasInDharmaPatron) {
          // Point 3: Nominal harga Dharma Patron Rutin dicari berdasarkan Identitas ID & Nama Donatur
          const patronPrice = activePatron ? activePatron.donasiPerbulan : prod.price;
          items.push({
            id: prod.id,
            codeBadge: prod.codeBadge,
            codeBadgeColor: prod.codeBadgeColor,
            name: prod.name,
            price: patronPrice,
            formattedPrice: `Rp${patronPrice.toLocaleString('id-ID')}`,
            category: activePatron ? `Dharma Patron (${activePatron.namaDonatur})` : 'Dharma Patron',
            patronInfo: activePatron,
          });
        }
      } else {
        items.push({
          id: prod.id,
          codeBadge: prod.codeBadge,
          codeBadgeColor: prod.codeBadgeColor,
          name: prod.name,
          price: prod.price,
          formattedPrice: prod.formattedPrice,
          category: prod.category,
        });
      }
    });

    return items;
  }, [isIdentitasInDharmaPatron, matchingPatronsForIdentitas, namaDonatur, getMatchedPatronByDonatur]);

  const filteredSelectableItems = useMemo(() => {
    if (!itemSearchQuery.trim()) return selectableDonasiProducts;
    const q = itemSearchQuery.toLowerCase().trim();
    return selectableDonasiProducts.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.formattedPrice.toLowerCase().includes(q)
    );
  }, [selectableDonasiProducts, itemSearchQuery]);

  const handleSelectItem = (prod: SelectableDonasiItem) => {
    let itemName = prod.name;
    let itemPrice = prod.price;
    let itemFormattedPrice = prod.formattedPrice;
    let itemCategory = prod.category;

    // Jika memilih Item D-DONASI "Donasi Patron Rutin"
    if (prod.name.includes('Donasi Patron Rutin') || prod.patronInfo) {
      itemName = 'Donasi Patron Rutin';
      itemCategory = 'Dharma Patron';

      const targetPatron =
        getMatchedPatronByDonatur(namaDonatur) ||
        prod.patronInfo ||
        matchingPatronsForIdentitas[0];

      if (targetPatron) {
        setNamaDonatur(targetPatron.namaDonatur);
        itemPrice = targetPatron.donasiPerbulan;
        itemFormattedPrice = `Rp${targetPatron.donasiPerbulan.toLocaleString('id-ID')}`;
        if (targetPatron.pelimpahanJasa && targetPatron.pelimpahanJasa.length > 0) {
          setPelimpahanList([...targetPatron.pelimpahanJasa]);
        }
        onShowToast(
          `Item Donasi Patron Rutin dipilih. Donatur: ${targetPatron.namaDonatur} (Rp${targetPatron.donasiPerbulan.toLocaleString('id-ID')})`
        );
      }
    } else {
      onShowToast(`Item ${prod.name} ditambahkan`);
    }

    // Add or update selectedItems
    setSelectedItems((prev) => {
      const existing = prev.find((it) => it.name === itemName);
      if (existing) {
        return prev.map((it) =>
          it.name === itemName
            ? {
                ...it,
                price: itemPrice,
                formattedPrice: itemFormattedPrice,
                quantity: it.price !== itemPrice ? it.quantity : it.quantity + 1,
              }
            : it
        );
      }
      return [
        ...prev,
        {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          codeBadge: prod.codeBadge,
          codeBadgeColor: prod.codeBadgeColor,
          name: itemName,
          price: itemPrice,
          formattedPrice: itemFormattedPrice,
          category: itemCategory,
          quantity: 1,
        },
      ];
    });

    setIsItemDropdownOpen(false);
    setItemSearchQuery('');
  };

  // When changing Nama Donatur text input
  const handleNamaDonaturChange = (newName: string) => {
    setNamaDonatur(newName);

    // Point 3 & 4: Mencari patron berdasarkan Identitas ID & Nama Donatur
    const matchedPatron = getMatchedPatronByDonatur(newName);
    if (matchedPatron) {
      syncPatronData(matchedPatron);
    }
  };

  // When selecting Identitas ID from selector
  const handleSelectIdentitasItem = (item: IdentitasIdSelectorItem) => {
    const isNoName = item.id === 'no-name' || item.name.toLowerCase() === 'no name';
    const label = isNoName ? 'No Name' : `${item.code} ${item.name}`.trim();
    setIdentitasId(label);
    setSelectedIdentitasCode(isNoName ? 'No Name' : item.code);
    setSelectedIdentitasId(item.id);

    if (isNoName) {
      setNamaDonatur('No Name');
      setSelectedItems((prev) => prev.filter((it) => it.name !== 'Donasi Patron Rutin'));
      onShowToast('Identitas ID & Donatur diatur ke "No Name"');
      return;
    }

    const patrons = availablePatrons.filter((p) =>
      isPatronMatchingIdentitas(p, label, item.code, item.id)
    );

    if (patrons.length > 0) {
      // Point 2: Jika "Identitas ID" pada "Form Transaksi D-DONASI" ada di "List Dharma Patron Rutin":
      // nama donatur akan auto terisi.
      const firstPatron = patrons[0];
      setNamaDonatur(firstPatron.namaDonatur);
      syncPatronData(firstPatron);

      const msg =
        patrons.length > 1
          ? `Identitas ${item.code} memiliki ${patrons.length} donatur patron. Tombol pencarian donatur aktif.`
          : `Identitas ${item.code} terdaftar di Dharma Patron. Donatur otomatis: ${firstPatron.namaDonatur}`;
      onShowToast(msg);
    } else {
      // Point 1: Not in Dharma Patron Rutin
      setNamaDonatur(item.name);
      setSelectedItems((prev) => prev.filter((it) => it.name !== 'Donasi Patron Rutin'));
    }
  };

  // Add pelimpahan jasa name
  const handleAddPelimpahan = () => {
    if (pelimpahanInput.trim()) {
      setPelimpahanList((prev) => [...prev, pelimpahanInput.trim()]);
      setPelimpahanInput('');
    }
  };

  const handleRemovePelimpahan = (index: number) => {
    setPelimpahanList((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Total Nominal Calculation
  const totalNominal = useMemo(() => {
    return selectedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  }, [selectedItems]);

  const formattedTotalNominal = useMemo(() => {
    return `Rp${totalNominal.toLocaleString('id-ID')}`;
  }, [totalNominal]);

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      onShowToast('Pilih minimal 1 item donasi');
      return;
    }

    const donasiItems: DonasiItem[] = selectedItems.map((it) => {
      const isPatron = it.name.includes('Patron') || it.category.includes('Patron');
      return {
        id: `donasi-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        codeBadge: it.codeBadge,
        codeBadgeColor: it.codeBadgeColor,
        name: it.name,
        qtyPrice: `${it.quantity} x ${it.formattedPrice}`,
        category: it.category,
        coaNoAkun: isPatron ? '49997' : undefined,
        coaNamaAkun: isPatron ? 'Pendapatan Dana Dharma Patron' : undefined,
        posPemasukan: isPatron ? 'Pemasukan YPPLN' : undefined,
      };
    });

    const primaryName = pelimpahanList[0] || 'Suhu Bhadra Ruci';
    const remainingCount = pelimpahanList.length > 1 ? `+ ${pelimpahanList.length - 1} Nama` : '';
    const badges = remainingCount ? ['Sudah Dikirim', remainingCount] : ['Sudah Dikirim'];

    const cleanVia = normalizeVia(via);
    const targetDate = tanggal || '15 Nov 2021';
    const nextSeq = getUrutanTransaksiPerTahun(existingOrders, targetDate);
    const orderNumber = generateKodeTransaksi('D', cleanVia, targetDate, nextSeq);

    const activePatron =
      getMatchedPatronByDonatur(namaDonatur) ||
      matchingPatronsForIdentitas[0];

    const isPatronItem = selectedItems.some(
      (it) => it.name.includes('Patron') || it.category.includes('Patron')
    );

    let defaultSubtitle = 'November';
    if (activePatron?.bulanPiutang && activePatron.bulanPiutang !== '-') {
      defaultSubtitle = activePatron.bulanPiutang;
    } else if (targetDate) {
      const parts = targetDate.trim().split(/\s+/);
      if (parts[1]) defaultSubtitle = parts[1];
    }

    const newOrder: Partial<DonasiOrder> = {
      orderNumber,
      via: cleanVia,
      customerId: identitasId || '10001 Lilo',
      date: targetDate,
      statusBadges: ['Paid', 'Paid'],
      items: donasiItems.slice(0, 2),
      extraItems: donasiItems.slice(2),
      namaDonatur: {
        badgeDate: tanggal || '15 Nov 2021',
        name: namaDonatur || 'Lilo',
      },
      keterangan: {
        title: isPatronItem ? 'Dharma Patron Rutin' : (keterangan || 'Donasi Umum'),
        subtitle: (keterangan && keterangan.trim()) ? keterangan.trim() : defaultSubtitle,
      },
      pelimpahanJasa: {
        badges,
        name: primaryName,
        allNames: pelimpahanList.length > 0 ? [...pelimpahanList] : [primaryName],
      },
      totalDana: formattedTotalNominal || 'Rp100.080',
      notesText: '',
    };

    onSave(newOrder);
  };

  return (
    <div className="w-full flex flex-col gap-5 pb-12 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Action Toolbar matching uploaded image */}
      <div className="flex items-center justify-end gap-3 px-1">
        {/* Eye Off Icon */}
        <button
          type="button"
          title="Sembunyikan Kolom"
          onClick={() => onShowToast('Mode privasi tampilan diaktifkan')}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <EyeOff className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Search Toggle Icon */}
        <button
          type="button"
          title="Cari"
          onClick={() => onShowToast('Pencarian form donasi')}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Sliders / Filter Icon */}
        <button
          type="button"
          title="Filter & Pengaturan"
          onClick={() => onShowToast('Filter pengaturan form')}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* + Add Button */}
        <button
          type="button"
          onClick={() => onShowToast('Sedang berada di Form Tambah Transaksi D-DONASI')}
          className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-sm px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSave} className="flex flex-col gap-6 pt-2">
        {/* Row 1: Tanggal */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Tanggal
          </label>
          <div className="md:col-span-9 relative max-w-md w-full">
            <input
              type="text"
              placeholder="Input Date..."
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#008d91] pr-10"
            />
            <Calendar className="w-4 h-4 text-[#008d91] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="date"
              aria-label="Pilih Tanggal"
              title="Pilih Tanggal"
              onClick={(e) => {
                try {
                  (e.currentTarget as HTMLInputElement).showPicker?.();
                } catch (_) {}
              }}
              onChange={(e) => {
                if (e.target.value) {
                  setTanggal(formatDatePickerValue(e.target.value));
                }
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 opacity-0 cursor-pointer z-10"
            />
          </div>
        </div>

        {/* Row 2: Via */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Via
          </label>
          <div className="md:col-span-9 relative max-w-md w-full">
            <div
              onClick={() => setIsViaOpen(!isViaOpen)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 flex items-center justify-between cursor-pointer hover:border-slate-300"
            >
              <span className={via ? 'text-slate-700' : 'text-slate-400'}>
                {via || 'Search...'}
              </span>
              <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {isViaOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                {viaOptions.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      setVia(opt);
                      setIsViaOpen(false);
                    }}
                    className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <span>{opt}</span>
                    {via === opt && <Check className="w-3.5 h-3.5 text-[#008d91]" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 3: Identitas ID matching image (2).png */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-3 flex items-center justify-between pr-2">
            <label className="text-sm text-slate-700 font-normal">
              Identitas ID
            </label>
            <button
              type="button"
              onClick={() => handleSelectIdentitasItem(NO_NAME_SELECTOR_ITEM)}
              className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200/80 transition-colors cursor-pointer"
              title="Pilih opsi No Name (Anonim)"
            >
              + No Name
            </button>
          </div>
          <div className="md:col-span-9 relative max-w-md w-full">
            <IdentitasIdSelector
              id="identitas-id-donasi"
              value={identitasId}
              onSelect={handleSelectIdentitasItem}
              identitasList={identitasList}
              organisasiList={organisasiList}
              onNavigateView={onNavigateView}
            />
          </div>
        </div>

        {/* Row 4: Nama Donatur */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Nama Donatur
          </label>
          <div className="md:col-span-9 relative max-w-md w-full" ref={donaturDropdownRef}>
            <div className="relative w-full">
              <input
                id="input-nama-donatur"
                type="text"
                placeholder="Input Text..."
                value={namaDonatur}
                onChange={(e) => handleNamaDonaturChange(e.target.value)}
                className={`w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#008d91] transition-colors ${
                  hasMultipleDonaturs ? 'pr-11' : ''
                }`}
              />

              {hasMultipleDonaturs && (
                <button
                  type="button"
                  id="btn-search-donatur-patron"
                  title="Pilih Nama Donatur Terdaftar"
                  onClick={() => setIsDonaturDropdownOpen(!isDonaturDropdownOpen)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-[#008d91] hover:bg-[#007579] text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                >
                  <Search className="w-3.5 h-3.5 stroke-[2.2]" />
                </button>
              )}
            </div>

            {/* Dropdown popup when multiple donaturs exist */}
            {hasMultipleDonaturs && isDonaturDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Pilih Donatur Terdaftar ({matchingPatronsForIdentitas.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsDonaturDropdownOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Cari nama donatur..."
                    value={donaturSearchFilter}
                    onChange={(e) => setDonaturSearchFilter(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:bg-white transition-colors"
                  />
                  {donaturSearchFilter && (
                    <button
                      type="button"
                      onClick={() => setDonaturSearchFilter('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="max-h-56 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
                  {filteredDonaturOptions.map((patron) => {
                    const isSelected =
                      namaDonatur.toLowerCase().trim() === patron.namaDonatur.toLowerCase().trim();
                    return (
                      <div
                        key={patron.id}
                        onClick={() => {
                          handleNamaDonaturChange(patron.namaDonatur);
                          syncPatronData(patron);
                          setIsDonaturDropdownOpen(false);
                          setDonaturSearchFilter('');
                          onShowToast(`Donatur dipilih: ${patron.namaDonatur}`);
                        }}
                        className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-teal-50/80 border border-teal-200'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                            style={{ backgroundColor: patron.avatarBg || '#008d91' }}
                          >
                            {patron.avatarLetter || patron.namaDonatur.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-slate-800 truncate">
                                {patron.namaDonatur}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                                {patron.noDonatur}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 truncate">
                              Rp{patron.donasiPerbulan.toLocaleString('id-ID')} / bulan
                              {patron.pelimpahanJasa && patron.pelimpahanJasa.length > 0
                                ? ` • ${patron.pelimpahanJasa.join(', ')}`
                                : ''}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0 ml-2">
                            <Check className="w-3 h-3 stroke-[2.5]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 5: Item D-DONASI matching uploaded screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal pt-2">
            Item D-DONASI
          </label>
          <div className="md:col-span-9 flex flex-col gap-3">
            {/* Search Trigger matching image.png */}
            <div className="relative max-w-md w-full" ref={itemSearchRef}>
              <div
                id="btn-search-item-donasi"
                onClick={() => setIsItemDropdownOpen(!isItemDropdownOpen)}
                className={`w-full bg-white border rounded-xl px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-700 cursor-pointer flex items-center justify-between transition-colors shadow-2xs ${
                  isItemDropdownOpen
                    ? 'border-[#008d91] ring-1 ring-[#008d91]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 text-slate-400">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Search Item D-DONASI...</span>
                </div>
                <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0">
                  <ChevronDown
                    className={`w-3.5 h-3.5 stroke-[2.5] transition-transform duration-200 ${
                      isItemDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Dropdown Popover */}
              {isItemDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150">
                  {/* Search Input with Clear Button */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Cari Item D-DONASI..."
                      value={itemSearchQuery}
                      onChange={(e) => setItemSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:bg-white transition-colors"
                    />
                    {itemSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setItemSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Product List */}
                  <div className="max-h-64 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
                    {filteredSelectableItems.map((prod) => {
                      const isSelected = prod.patronInfo
                        ? selectedItems.some((it) => it.name === 'Donasi Patron Rutin') &&
                          namaDonatur.toLowerCase().trim() === prod.patronInfo.namaDonatur.toLowerCase().trim()
                        : selectedItems.some((it) => it.name === prod.name);
                      return (
                        <div
                          key={prod.id}
                          onClick={() => handleSelectItem(prod)}
                          className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? 'bg-teal-50/70 border border-teal-200' : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8 h-8 rounded-lg ${prod.codeBadgeColor} text-white flex items-center justify-center font-bold text-sm shrink-0`}
                            >
                              {prod.codeBadge}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-semibold text-slate-800 truncate">
                                {prod.name}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {prod.formattedPrice} • {prod.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {isSelected ? (
                              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#008d91] text-white flex items-center gap-1">
                                <Check className="w-3 h-3 stroke-[3]" />
                                <span>Terpilih</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-[#008d91] hover:text-white text-slate-600 flex items-center justify-center transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* List item d-donasi yang terpilih di bawahnya (hanya tampil jika sudah ada yang dipilih) matching image.png */}
            {selectedItems.length > 0 && (
              <div className="bg-[#f0f9fa] rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-wrap items-center gap-3 sm:gap-4">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-100/80 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3 sm:gap-4 shadow-2xs hover:shadow-xs transition-shadow shrink-0"
                  >
                    {/* Square Badge */}
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${item.codeBadgeColor} text-white flex items-center justify-center font-bold text-3xl shrink-0 shadow-xs`}
                    >
                      {item.codeBadge}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col min-w-[140px] max-w-[210px]">
                      <span className="text-[13.5px] font-bold text-slate-800 leading-snug truncate">
                        {item.name}
                      </span>
                      <span className="text-xs text-slate-500 font-normal mt-0.5">
                        {item.formattedPrice}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1 truncate">
                        {item.category}
                      </span>
                    </div>

                    {/* Stepper Controls */}
                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#008d91] hover:bg-[#007a7e] text-white flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>

                      <div className="w-7 sm:w-8 h-5 sm:h-6 border border-slate-200 rounded text-center text-xs font-semibold text-slate-700 bg-white flex items-center justify-center">
                        {item.quantity}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#008d91] hover:bg-[#007a7e] text-white flex items-center justify-center cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="ml-1 text-[#008d91] hover:text-rose-500 p-0.5 cursor-pointer transition-colors"
                        title="Hapus item"
                      >
                        <X className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 6: Nama Pelimpahan Jasa */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Nama Pelimpahan Jasa
          </label>
          <div className="md:col-span-9 flex flex-col gap-2 max-w-md w-full">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Input Text..."
                value={pelimpahanInput}
                onChange={(e) => setPelimpahanInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPelimpahan();
                  }
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#008d91] pr-16"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {pelimpahanInput && (
                  <button
                    type="button"
                    onClick={() => setPelimpahanInput('')}
                    className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAddPelimpahan}
                  className="w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center cursor-pointer transition-colors"
                  title="Tambah Nama"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* List of Pelimpahan Names Pills */}
            {pelimpahanList.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {pelimpahanList.map((name, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs bg-[#e6f4f5] text-[#008d91] font-semibold"
                  >
                    <span>{name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePelimpahan(idx)}
                      className="hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 7: Mendapat Info Mengenai Program Dana */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Mendapat Info Mengenai Program Dana
          </label>
          <div className="md:col-span-9 relative max-w-md w-full">
            <div
              onClick={() => setIsInfoProgramOpen(!isInfoProgramOpen)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 flex items-center justify-between cursor-pointer hover:border-slate-300"
            >
              <span className={infoProgram ? 'text-slate-700' : 'text-slate-400'}>
                {infoProgram || 'Search...'}
              </span>
              <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {isInfoProgramOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                {infoProgramOptions.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      setInfoProgram(opt);
                      setIsInfoProgramOpen(false);
                    }}
                    className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <span>{opt}</span>
                    {infoProgram === opt && (
                      <Check className="w-3.5 h-3.5 text-[#008d91]" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 8: Keterangan */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Keterangan
          </label>
          <div className="md:col-span-9 relative max-w-md w-full">
            <input
              type="text"
              placeholder="Input Text..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#008d91]"
            />
          </div>
        </div>

        {/* Bottom Buttons: Cancel & Save matching exact uploaded screenshot */}
        <div className="flex items-center justify-end gap-3 pt-6 max-w-2xl">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 rounded-xl bg-[#008d91] hover:bg-[#05828e] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};
