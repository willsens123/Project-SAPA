import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  ChevronDown,
  X,
  Plus,
  Minus,
  XCircle,
  Check,
  Search,
  EyeOff,
  SlidersHorizontal,
} from 'lucide-react';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { IdentitasItem } from '../identitasData';
import { OrganisasiItem } from '../types';
import { ViaTransaksiAjarItem, INITIAL_VIA_TRANSAKSI_AJAR } from '../viaAjarData';
import { ItemAjarEvent, INITIAL_ITEM_AJAR_EVENTS } from '../itemAjarData';
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

export interface SelectedPaketItem {
  id: string;
  name: string;
  price: number;
  formattedPrice: string;
  badgeLetter: string;
  badgeColor: string;
  description: string;
  quantity: number;
}

interface PenerimaBlockData {
  id: string;
  identitasId: string;
  selectedVariables: string[];
  paket: string;
  selectedPakets: SelectedPaketItem[];
}

interface FormTransaksiAjarProps {
  initialData?: TransaksiAjarItem | null;
  existingItems?: TransaksiAjarItem[];
  identitasList?: IdentitasItem[];
  organisasiList?: OrganisasiItem[];
  viaList?: ViaTransaksiAjarItem[];
  itemAjarList?: ItemAjarEvent[];
  onSave: (item: TransaksiAjarItem) => void;
  onCancel: () => void;
  onShowToast?: (msg: string) => void;
  onNavigateView?: (view: 'formIdentitas' | 'formOrganisasi') => void;
}

export const FormTransaksiAjar: React.FC<FormTransaksiAjarProps> = ({
  initialData,
  existingItems = [],
  identitasList = [],
  organisasiList = [],
  viaList = [],
  itemAjarList = [],
  onSave,
  onCancel,
  onShowToast = (_msg: string) => {},
  onNavigateView,
}) => {
  // Available data lists
  const availableVia = useMemo(() => {
    return viaList.length > 0 ? viaList : INITIAL_VIA_TRANSAKSI_AJAR;
  }, [viaList]);

  const availableItemAjar = useMemo(() => {
    return itemAjarList.length > 0 ? itemAjarList : INITIAL_ITEM_AJAR_EVENTS;
  }, [itemAjarList]);

  // Form Fields State
  const [tanggal, setTanggal] = useState<string>(() => {
    if (initialData?.date) return initialData.date;
    const now = new Date();
    return now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  });

  const [via, setVia] = useState<string>(availableVia[0]?.namaVia || 'Call Center');
  const [isViaOpen, setIsViaOpen] = useState(false);
  const [viaSearch, setViaSearch] = useState('');

  // Identitas Pembeli
  const [identitasPembeli, setIdentitasPembeli] = useState<string>(() => {
    if (initialData?.customerId) return initialData.customerId;
    if (identitasList.length > 0) {
      const first = identitasList[0];
      const code = first.codeId || '10001';
      return `${code} - ${first.namaLengkap} (${first.nomorHandPhone || '-'})`;
    }
    return '10001 - Lilo Lucu (08123456789)';
  });
  const [isPembeliOpen, setIsPembeliOpen] = useState(false);
  const [pembeliSearch, setPembeliSearch] = useState('');

  // Checkbox: Pembeli dan Penerima Sama?
  const [isPembeliPenerimaSama, setIsPembeliPenerimaSama] = useState(false);

  // Item A-AJAR
  const [selectedItemAjarName, setSelectedItemAjarName] = useState<string>(() => {
    if (initialData?.eventName) return initialData.eventName;
    return availableItemAjar[0]?.name || 'Indonesia Lamrim Retreat 2021';
  });
  const [isItemAjarOpen, setIsItemAjarOpen] = useState(false);
  const [itemAjarSearch, setItemAjarSearch] = useState('');

  // Get active item A-AJAR event object and its variables
  const activeItemAjar = useMemo(() => {
    return (
      availableItemAjar.find((it) => it.name === selectedItemAjarName) ||
      availableItemAjar[0]
    );
  }, [availableItemAjar, selectedItemAjarName]);

  const activeVariables = useMemo<string[]>(() => {
    if (!activeItemAjar) return [];
    if (activeItemAjar.variables && activeItemAjar.variables.length > 0) {
      return activeItemAjar.variables;
    }
    if (activeItemAjar.children && activeItemAjar.children.length > 0) {
      const varChildren = activeItemAjar.children.filter(
        (c) =>
          c.id.startsWith('child-var') ||
          (!c.id.startsWith('child-paket') &&
            !c.name.toLowerCase().startsWith('paket') &&
            c.badgeLetter !== 'P')
      );
      if (varChildren.length > 0) {
        return varChildren.map((c) => c.name);
      }
    }
    // Jika tidak ada Variable, maka kosong
    return [];
  }, [activeItemAjar]);

  // Available Paket Options
  // User Rule: "'Paket' hanya memunculkan 'Paket' dari Item A-AJAR yang dipilih. Jika tidak ada Variable, maka kosong."
  const availablePaketOptions = useMemo<SelectedPaketItem[]>(() => {
    // 1. Jika tidak ada Variable, maka kosong.
    if (!activeItemAjar || activeVariables.length === 0) {
      return [];
    }

    // 2. Hanya memunculkan Paket dari Item A-AJAR yang dipilih
    if (activeItemAjar.children && activeItemAjar.children.length > 0) {
      const paketChildren = activeItemAjar.children.filter(
        (c) =>
          c.id.startsWith('child-paket') ||
          c.name.toLowerCase().includes('paket') ||
          c.badgeLetter === 'P'
      );

      if (paketChildren.length > 0) {
        return paketChildren.map((c) => {
          let rawPrice = 0;
          if (typeof c.price === 'string') {
            const digits = c.price.replace(/\D/g, '');
            rawPrice = digits ? parseInt(digits, 10) : 0;
          } else if (typeof c.price === 'number') {
            rawPrice = c.price;
          }

          const formatted =
            c.price && c.price !== '0' && c.price !== 'Gratis'
              ? (c.price.startsWith('Rp') ? c.price : `Rp${rawPrice.toLocaleString('id-ID')}`)
              : 'Gratis';

          return {
            id: c.id,
            name: c.name,
            price: rawPrice,
            formattedPrice: formatted,
            badgeLetter: c.badgeLetter || 'P',
            badgeColor: c.badgeColor || 'bg-[#008d91]',
            description: c.description || c.name,
            quantity: 1,
          };
        });
      }
    }

    return [];
  }, [activeItemAjar, activeVariables]);

  // Penerima Blocks
  const [penerimaList, setPenerimaList] = useState<PenerimaBlockData[]>(() => {
    const defaultRecipient =
      identitasList.length > 0
        ? `${identitasList[0].codeId || '10001'} - ${identitasList[0].namaLengkap} (${
            identitasList[0].nomorHandPhone || '-'
          })`
        : '10001 - Lilo Lucu (08123456789)';

    // Jika tidak ada Variable, maka Paket kosong
    const initialPakets: SelectedPaketItem[] =
      activeVariables.length > 0 && initialData?.itemName
        ? [
            {
              id: `init-pkt-${Date.now()}`,
              name: initialData.itemName,
              price: 1200000,
              formattedPrice: 'Rp1.200.000',
              badgeLetter: initialData.badgeLetter || 'P',
              badgeColor: 'bg-[#008d91]',
              description: 'Paket Belajar Mahasiswa / Pelajar',
              quantity: 1,
            },
          ]
        : [];

    return [
      {
        id: 'penerima-1',
        identitasId: defaultRecipient,
        selectedVariables: activeVariables.length > 0 ? [activeVariables[0]] : [],
        paket: initialPakets[0]?.name || availablePaketOptions[0]?.name || '',
        selectedPakets:
          activeVariables.length > 0
            ? initialPakets.length > 0
              ? initialPakets
              : availablePaketOptions.slice(0, 1)
            : [],
      },
    ];
  });

  // Keep Penerima variables and pakets in sync when item A-AJAR changes
  useEffect(() => {
    setPenerimaList((prev) =>
      prev.map((p) => {
        const validVars = p.selectedVariables.filter((v) => activeVariables.includes(v));
        const newSelectedVars =
          validVars.length > 0
            ? validVars
            : activeVariables.length > 0
            ? [activeVariables[0]]
            : [];

        const validPakets = (p.selectedPakets || []).filter((pkt) =>
          availablePaketOptions.some((opt) => opt.name === pkt.name)
        );
        const newSelectedPakets =
          validPakets.length > 0
            ? validPakets
            : availablePaketOptions.length > 0
            ? [availablePaketOptions[0]]
            : [];

        return {
          ...p,
          selectedVariables: newSelectedVars,
          paket: newSelectedPakets[0]?.name || '',
          selectedPakets: newSelectedPakets,
        };
      })
    );
  }, [activeVariables, availablePaketOptions]);

  // Synchronize first recipient if "Pembeli dan Penerima Sama?" is checked
  useEffect(() => {
    if (isPembeliPenerimaSama) {
      setPenerimaList((prev) => {
        if (prev.length === 0) return prev;
        const copy = [...prev];
        copy[0] = {
          ...copy[0],
          identitasId: identitasPembeli,
        };
        return copy;
      });
    }
  }, [isPembeliPenerimaSama, identitasPembeli]);

  // Keterangan: manual input (tidak auto input)
  const [keterangan, setKeterangan] = useState<string>(() => {
    return initialData?.keterangan || '';
  });

  // Dropdown states for each Penerima
  const [activePenerimaDropdown, setActivePenerimaDropdown] = useState<string | null>(null);
  const [penerimaSearchText, setPenerimaSearchText] = useState('');
  const [activePaketDropdown, setActivePaketDropdown] = useState<string | null>(null);
  const [paketSearchText, setPaketSearchText] = useState('');

  const filteredPaketOptions = useMemo(() => {
    if (!paketSearchText.trim()) return availablePaketOptions;
    const q = paketSearchText.toLowerCase().trim();
    return availablePaketOptions.filter(
      (opt) =>
        opt.name.toLowerCase().includes(q) ||
        opt.description.toLowerCase().includes(q) ||
        opt.formattedPrice.toLowerCase().includes(q)
    );
  }, [availablePaketOptions, paketSearchText]);

  // Select a Paket for a recipient
  const handleSelectPaket = (
    penerimaId: string,
    opt: {
      name: string;
      price: number;
      formattedPrice: string;
      badgeLetter: string;
      badgeColor: string;
      description: string;
    }
  ) => {
    setPenerimaList((prev) =>
      prev.map((p) => {
        if (p.id !== penerimaId) return p;
        const currentList = p.selectedPakets || [];
        const existing = currentList.find((it) => it.name === opt.name);
        let updated: SelectedPaketItem[];
        if (existing) {
          updated = currentList.map((it) =>
            it.name === opt.name ? { ...it, quantity: it.quantity + 1 } : it
          );
        } else {
          updated = [
            ...currentList,
            {
              id: `sel-pkt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              name: opt.name,
              price: opt.price,
              formattedPrice: opt.formattedPrice,
              badgeLetter: opt.badgeLetter,
              badgeColor: opt.badgeColor,
              description: opt.description,
              quantity: 1,
            },
          ];
        }
        return {
          ...p,
          paket: updated[0]?.name || '',
          selectedPakets: updated,
        };
      })
    );
    setActivePaketDropdown(null);
    setPaketSearchText('');
    onShowToast(`Paket dipilih: ${opt.name}`);
  };

  const handleUpdatePaketQuantity = (
    penerimaId: string,
    paketItemId: string,
    delta: number
  ) => {
    setPenerimaList((prev) =>
      prev.map((p) => {
        if (p.id !== penerimaId) return p;
        const currentList = p.selectedPakets || [];
        const updated = currentList.map((it) => {
          if (it.id === paketItemId) {
            const nextQty = Math.max(1, it.quantity + delta);
            return { ...it, quantity: nextQty };
          }
          return it;
        });
        return {
          ...p,
          selectedPakets: updated,
        };
      })
    );
  };

  const handleRemovePaket = (penerimaId: string, paketItemId: string) => {
    setPenerimaList((prev) =>
      prev.map((p) => {
        if (p.id !== penerimaId) return p;
        const currentList = p.selectedPakets || [];
        const updated = currentList.filter((it) => it.id !== paketItemId);
        return {
          ...p,
          paket: updated[0]?.name || '',
          selectedPakets: updated,
        };
      })
    );
    onShowToast('Paket dihapus');
  };

  // Available formatted identitas with Code, Nama, and Nomor HP
  const formattedIdentitasList = useMemo(() => {
    if (identitasList.length > 0) {
      return identitasList.map((item, idx) => {
        const code = item.codeId || `1000${idx + 1}`;
        const phone = item.nomorHandPhone || '-';
        return {
          code,
          name: item.namaLengkap,
          phone,
          display: `${code} - ${item.namaLengkap} (${phone})`,
        };
      });
    }
    // Fallback if identitasList is empty
    return [
      { code: '10001', name: 'Lilo Lucu', phone: '08123456789', display: '10001 - Lilo Lucu (08123456789)' },
      { code: '10002', name: 'Budi Santoso', phone: '08139876543', display: '10002 - Budi Santoso (08139876543)' },
      { code: '10003', name: 'Siti Aminah', phone: '08112233445', display: '10003 - Siti Aminah (08112233445)' },
      { code: '10004', name: 'Dewi Lestari', phone: '08567891234', display: '10004 - Dewi Lestari (08567891234)' },
      { code: '10005', name: 'Andi Wijaya', phone: '08781122334', display: '10005 - Andi Wijaya (08781122334)' },
    ];
  }, [identitasList]);

  // Filtered identitas for pembeli search
  const filteredPembeliList = useMemo(() => {
    const q = pembeliSearch.toLowerCase();
    return formattedIdentitasList.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q)
    );
  }, [formattedIdentitasList, pembeliSearch]);

  // Filtered identitas for penerima search
  const filteredPenerimaList = useMemo(() => {
    const q = penerimaSearchText.toLowerCase();
    return formattedIdentitasList.filter(
      (item) =>
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q)
    );
  }, [formattedIdentitasList, penerimaSearchText]);

  // Add Penerima block
  const handleAddPenerima = () => {
    const newId = `penerima-${Date.now()}`;
    const nextRecipient =
      formattedIdentitasList[penerimaList.length % formattedIdentitasList.length]?.display ||
      '10002 - Budi Santoso (08139876543)';

    setPenerimaList((prev) => [
      ...prev,
      {
        id: newId,
        identitasId: nextRecipient,
        selectedVariables: activeVariables.slice(0, 2),
        paket: '',
        selectedPakets: [],
      },
    ]);
    onShowToast('Identitas ID Penerima baru ditambahkan');
  };

  // Remove Penerima block
  const handleRemovePenerima = (id: string) => {
    if (penerimaList.length <= 1) {
      // Clear first block if only 1 exists
      setPenerimaList((prev) => [
        {
          ...prev[0],
          identitasId: '',
          selectedVariables: [],
          paket: '',
          selectedPakets: [],
        },
      ]);
      onShowToast('Data penerima dikosongkan');
      return;
    }
    setPenerimaList((prev) => prev.filter((p) => p.id !== id));
    onShowToast('Identitas ID Penerima dihapus');
  };

  // Toggle variable checkbox for a recipient
  const handleToggleVariable = (penerimaId: string, variable: string) => {
    setPenerimaList((prev) =>
      prev.map((p) => {
        if (p.id !== penerimaId) return p;
        const exists = p.selectedVariables.includes(variable);
        const updated = exists
          ? p.selectedVariables.filter((v) => v !== variable)
          : [...p.selectedVariables, variable];
        return {
          ...p,
          selectedVariables: updated,
        };
      })
    );
  };

  // Toggle Select All variables for a recipient
  const handleToggleSelectAllVariables = (penerimaId: string) => {
    setPenerimaList((prev) =>
      prev.map((p) => {
        if (p.id !== penerimaId) return p;
        const isAllSelected = p.selectedVariables.length === activeVariables.length;
        return {
          ...p,
          selectedVariables: isAllSelected ? [] : [...activeVariables],
        };
      })
    );
  };

  // Save Transaction
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const recipientsClean = penerimaList
      .map((p) => {
        // Extract code and name from formatted string
        const parts = p.identitasId.split(' - ');
        if (parts.length >= 2) {
          const nameClean = parts[1].split(' (')[0];
          return `${parts[0]} ${nameClean}`;
        }
        return p.identitasId;
      })
      .filter(Boolean);

    // Extract customer ID & Name
    const pembeliParts = identitasPembeli.split(' - ');
    const customerDisplay =
      pembeliParts.length >= 2
        ? `${pembeliParts[0]} ${pembeliParts[1].split(' (')[0]}`
        : identitasPembeli;

    // Calculate totalDana and primary item from selectedPakets
    let totalNominal = 0;
    const allSelectedPakets: SelectedPaketItem[] = [];

    penerimaList.forEach((p) => {
      if (p.selectedPakets && p.selectedPakets.length > 0) {
        p.selectedPakets.forEach((pkt) => {
          allSelectedPakets.push(pkt);
          totalNominal += (pkt.price || 0) * (pkt.quantity || 1);
        });
      } else if (p.paket) {
        const found = availablePaketOptions.find((opt) => opt.name === p.paket);
        totalNominal += found ? found.price : 1200000;
      }
    });

    // Primary Paket: "Bagian 'Paket Mahasiswa' adalah 'Paket' yang dipilih"
    let mainItemName = '-';
    let mainBadgeLetter = 'P';
    let mainPrice = 0;
    let mainQty = 1;

    if (allSelectedPakets.length > 0) {
      mainItemName = allSelectedPakets[0].name;
      mainBadgeLetter = allSelectedPakets[0].badgeLetter;
      mainPrice = allSelectedPakets[0].price;
      mainQty = allSelectedPakets[0].quantity;
    } else if (penerimaList[0]?.paket) {
      mainItemName = penerimaList[0].paket;
      const found = availablePaketOptions.find((opt) => opt.name === mainItemName);
      if (found) {
        mainPrice = found.price;
        mainBadgeLetter = found.badgeLetter;
      }
    } else if (availablePaketOptions.length > 0) {
      mainItemName = availablePaketOptions[0].name;
      mainBadgeLetter = availablePaketOptions[0].badgeLetter;
      mainPrice = availablePaketOptions[0].price;
    }

    if (totalNominal === 0 && mainPrice > 0) {
      totalNominal = Math.max(1, penerimaList.length) * mainPrice;
    }

    // Keterangan: input manual user (tidak auto input)
    const finalKeterangan = keterangan.trim() || '-';

    // Sub-products if multiple pakets selected
    const otherProducts = allSelectedPakets.slice(1).map((pkt) => ({
      id: pkt.id,
      name: pkt.name,
      qtyPrice: `${pkt.quantity || 1} x ${pkt.formattedPrice || `Rp${(pkt.price || 0).toLocaleString('id-ID')}`}`,
      badgeLetter: pkt.badgeLetter || 'P',
    }));

    const cleanVia = normalizeVia(via);
    const nextSeq = getUrutanTransaksiPerTahun(existingItems, tanggal);
    const orderNumber =
      initialData?.orderNumber ||
      generateKodeTransaksi('A', cleanVia, tanggal, nextSeq);

    const savedItem: TransaksiAjarItem = {
      id: initialData?.id || `ajar-tx-${Date.now()}`,
      orderNumber,
      kodeTransaksi: orderNumber,
      via: cleanVia,
      eventName: selectedItemAjarName,
      customerId: customerDisplay,
      date: tanggal,
      statusBadges: initialData?.statusBadges || ['Paid', 'Paid'],
      badgeLetter: mainBadgeLetter,
      itemName: mainItemName, // Bagian "Paket Mahasiswa" adalah "Paket" yang dipilih
      qtyPrice: `${mainQty} x Rp${mainPrice.toLocaleString('id-ID')}`,
      otherProducts: otherProducts.length > 0 ? otherProducts : undefined,
      recipientDateBadge: tanggal,
      recipients: recipientsClean.length > 0 ? recipientsClean : ['10001 Lilo Lucu'],
      keterangan: finalKeterangan, // Bagian "Keterangan" adalah "Variable Item A-AJAR" yang dipilih
      totalDana: `Rp${totalNominal.toLocaleString('id-ID')}`,
      notes: initialData?.notes || '',
    };

    onSave(savedItem);
  };

  // Close all open dropdowns on outside click
  const formRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setIsViaOpen(false);
        setIsPembeliOpen(false);
        setIsItemAjarOpen(false);
        setActivePenerimaDropdown(null);
        setActivePaketDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div
      ref={formRef}
      className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-10 font-['Plus_Jakarta_Sans',sans-serif] animate-in fade-in duration-150"
    >
      {/* Top Action Toolbar matching user's image */}
      <div className="flex items-center justify-end gap-3 pb-5 mb-5 border-b border-slate-100">
        <button
          type="button"
          title="Toggle Visibility"
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <EyeOff className="w-5 h-5 stroke-[1.8]" />
        </button>
        <button
          type="button"
          title="Pencarian"
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5 stroke-[1.8]" />
        </button>
        <button
          type="button"
          title="Filter & Pengaturan"
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
        </button>
        <button
          id="btn-add-form-transaksi-ajar"
          type="button"
          onClick={handleAddPenerima}
          title="Tambah Transaksi"
          className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-sm px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        {/* Field 1: Tanggal */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="w-48 sm:w-60 text-sm font-normal text-slate-700 shrink-0">
            Tanggal
          </label>
          <div className="relative w-full max-w-xl">
            <input
              id="input-tanggal-ajar"
              type="text"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              placeholder="Input Date..."
              className="w-full h-11 px-4 pr-11 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] transition-colors"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#008d91]">
              <Calendar className="w-4 h-4 stroke-[1.8]" />
            </div>
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

        {/* Field 2: Via */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 relative">
          <label className="w-48 sm:w-60 text-sm font-normal text-slate-700 shrink-0">
            Via
          </label>
          <div className="relative w-full max-w-xl">
            <button
              id="dropdown-via-ajar"
              type="button"
              onClick={() => {
                setIsViaOpen(!isViaOpen);
                setIsPembeliOpen(false);
                setIsItemAjarOpen(false);
              }}
              className="w-full h-11 px-4 pr-11 text-left text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-700 flex items-center justify-between focus:outline-none focus:border-[#008d91] transition-colors cursor-pointer"
            >
              <span className={via ? 'text-slate-800' : 'text-slate-400'}>
                {via || 'Search...'}
              </span>
              <span className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0">
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            </button>

            {isViaOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-2 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search via..."
                    value={viaSearch}
                    onChange={(e) => setViaSearch(e.target.value)}
                    className="w-full text-xs outline-none text-slate-700"
                    autoFocus
                  />
                </div>
                {availableVia
                  .filter((v) => v.namaVia.toLowerCase().includes(viaSearch.toLowerCase()))
                  .map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setVia(v.namaVia);
                        setIsViaOpen(false);
                        setViaSearch('');
                      }}
                      className={`w-full px-4 py-2 text-left text-xs sm:text-sm hover:bg-slate-50 flex items-center justify-between ${
                        via === v.namaVia ? 'text-[#008d91] font-semibold bg-[#008d91]/5' : 'text-slate-700'
                      }`}
                    >
                      <span>{v.namaVia}</span>
                      {via === v.namaVia && <Check className="w-4 h-4 text-[#008d91]" />}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Field 3: Identitas ID Pembeli (with Nama and Nomor HP) matching image */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 relative">
          <div className="w-48 sm:w-60 flex items-center justify-between shrink-0">
            <label className="text-sm font-normal text-slate-700">
              Identitas ID Pembeli
            </label>
            <button
              type="button"
              onClick={() => {
                setIdentitasPembeli('No Name');
                if (isPembeliPenerimaSama) {
                  setPenerimaList((prev) => {
                    if (prev.length === 0) return prev;
                    const copy = [...prev];
                    copy[0] = { ...copy[0], identitasId: 'No Name' };
                    return copy;
                  });
                }
                onShowToast('ID Pembeli diatur ke "No Name"');
              }}
              className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200/80 transition-colors cursor-pointer"
              title="Pilih opsi No Name (Anonim)"
            >
              + No Name
            </button>
          </div>
          <div className="relative w-full max-w-xl">
            <IdentitasIdSelector
              id="dropdown-identitas-pembeli"
              value={identitasPembeli}
              onSelect={(item: IdentitasIdSelectorItem) => {
                const isNoName = item.id === 'no-name' || item.name.toLowerCase() === 'no name';
                const displayText = isNoName
                  ? 'No Name'
                  : item.code
                  ? `${item.code} - ${item.name}`
                  : item.name;
                setIdentitasPembeli(displayText);
                // If Pembeli dan Penerima Sama is checked, update first recipient too
                if (isPembeliPenerimaSama) {
                  setPenerimaList((prev) => {
                    if (prev.length === 0) return prev;
                    const copy = [...prev];
                    copy[0] = {
                      ...copy[0],
                      identitasId: displayText,
                    };
                    return copy;
                  });
                  onShowToast('Identitas ID Penerima pertama disamakan dengan Pembeli');
                }
              }}
              identitasList={identitasList}
              organisasiList={organisasiList}
              onNavigateView={onNavigateView}
              placeholder="Search..."
            />
          </div>
        </div>

        {/* Field 4: Pembeli dan Penerima Sama? */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="w-48 sm:w-60 text-sm font-normal text-slate-700 shrink-0">
            Pembeli dan Penerima Sama?
          </label>
          <div className="flex items-center">
            <button
              id="checkbox-pembeli-penerima-sama"
              type="button"
              onClick={() => {
                const nextVal = !isPembeliPenerimaSama;
                setIsPembeliPenerimaSama(nextVal);
                if (nextVal && identitasPembeli) {
                  setPenerimaList((prev) => {
                    if (prev.length === 0) return prev;
                    const copy = [...prev];
                    copy[0] = {
                      ...copy[0],
                      identitasId: identitasPembeli,
                    };
                    return copy;
                  });
                  onShowToast('Identitas ID Penerima pertama disamakan dengan Pembeli');
                }
              }}
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer ${
                isPembeliPenerimaSama
                  ? 'border-[#008d91] bg-[#008d91] text-white shadow-2xs'
                  : 'border-slate-300 bg-white hover:border-[#008d91]'
              }`}
            >
              {isPembeliPenerimaSama && <Check className="w-4 h-4 stroke-[3]" />}
            </button>
          </div>
        </div>

        {/* Field 5: Item A-AJAR */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 relative">
          <label className="w-48 sm:w-60 text-sm font-normal text-slate-700 shrink-0">
            Item A-AJAR
          </label>
          <div className="relative w-full max-w-xl">
            <button
              id="dropdown-item-ajar"
              type="button"
              onClick={() => {
                setIsItemAjarOpen(!isItemAjarOpen);
                setIsViaOpen(false);
                setIsPembeliOpen(false);
              }}
              className="w-full h-11 px-4 pr-11 text-left text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-700 flex items-center justify-between focus:outline-none focus:border-[#008d91] transition-colors cursor-pointer"
            >
              <span className={selectedItemAjarName ? 'text-slate-800 truncate' : 'text-slate-400'}>
                {selectedItemAjarName || 'Search...'}
              </span>
              <span className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 ml-2">
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            </button>

            {isItemAjarOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-40 py-2 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search Item A-AJAR..."
                    value={itemAjarSearch}
                    onChange={(e) => setItemAjarSearch(e.target.value)}
                    className="w-full text-xs outline-none text-slate-700"
                    autoFocus
                  />
                </div>
                {availableItemAjar
                  .filter((it) => it.name.toLowerCase().includes(itemAjarSearch.toLowerCase()))
                  .map((it) => {
                    const isSelected = selectedItemAjarName === it.name;
                    return (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => {
                          setSelectedItemAjarName(it.name);
                          setIsItemAjarOpen(false);
                          setItemAjarSearch('');
                          onShowToast(`Item A-AJAR diubah: ${it.name}`);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm hover:bg-slate-50 flex items-center justify-between ${
                          isSelected ? 'text-[#008d91] font-semibold bg-[#008d91]/5' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800">{it.name}</span>
                          <span className="text-xs text-slate-400">{it.subtitle}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#008d91]" />}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Top Tambah Identitas ID Penerima button with red cross as in user's image */}
        <div className="flex items-center pt-2">
          <button
            type="button"
            onClick={() => handleRemovePenerima(penerimaList[0]?.id || 'penerima-1')}
            title="Reset / Hapus Identitas ID Penerima"
            className="inline-flex items-center gap-1.5 text-xs text-[#008d91] hover:underline font-normal cursor-pointer"
          >
            <span className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">
              <X className="w-2.5 h-2.5 stroke-[3]" />
            </span>
            <span>Tambah Identitas ID Penerima</span>
          </button>
        </div>

        {/* Penerima Blocks (Cyan-tinted cards matching exact image) */}
        <div className="flex flex-col gap-5">
          {penerimaList.map((penerima, pIndex) => {
            const isAllSelected =
              activeVariables.length > 0 &&
              penerima.selectedVariables.length === activeVariables.length;

            return (
              <div
                key={penerima.id}
                className="w-full max-w-4xl bg-[#f0f7f9] border border-[#d6ecf2] rounded-2xl p-6 sm:p-7 flex flex-col gap-6"
              >
                {/* Row 1: Indentitas ID Penerima */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-4">
                    <label className="text-sm font-normal text-slate-700">
                      Indentitas ID Penerima
                    </label>
                  </div>
                  <div className="md:col-span-8 flex items-center gap-2 relative">
                    <div className="relative flex-1">
                      <IdentitasIdSelector
                        id={`identitas-id-penerima-ajar-${penerima.id}`}
                        value={penerima.identitasId}
                        onSelect={(item: IdentitasIdSelectorItem) => {
                          const displayText = item.code ? `${item.code} - ${item.name}` : item.name;
                          setPenerimaList((prev) =>
                            prev.map((p) =>
                              p.id === penerima.id ? { ...p, identitasId: displayText } : p
                            )
                          );
                        }}
                        identitasList={identitasList}
                        organisasiList={organisasiList}
                        onNavigateView={onNavigateView}
                        placeholder="Search..."
                      />
                    </div>

                    {/* Clear Button (X) */}
                    <button
                      type="button"
                      onClick={() => {
                        setPenerimaList((prev) =>
                          prev.map((p) => (p.id === penerima.id ? { ...p, identitasId: '' } : p))
                        );
                      }}
                      title="Hapus pilihan"
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Add More Button (+) */}
                    <button
                      type="button"
                      onClick={handleAddPenerima}
                      title="Tambah Penerima"
                      className="w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>

                {/* Row 2: Nama Variable Item A-AJAR */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                  <div className="md:col-span-4 pt-1">
                    <label className="text-sm font-normal text-slate-700">
                      Nama Variable Item A-AJAR
                    </label>
                  </div>
                  <div className="md:col-span-8 flex flex-col gap-3">
                    {/* Select All Checkbox */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleToggleSelectAllVariables(penerima.id)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                          isAllSelected
                            ? 'border-[#008d91] bg-[#008d91] text-white'
                            : 'border-slate-300 bg-white hover:border-[#008d91]'
                        }`}
                      >
                        {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <span className="text-xs sm:text-sm font-medium text-slate-800">
                        Select All
                      </span>
                    </div>

                    {/* Dynamic Variables Checkboxes corresponding to the chosen Item A-AJAR */}
                    <div className="flex flex-col gap-2.5 pt-1">
                      {activeVariables.length === 0 ? (
                        <div className="text-xs text-slate-400 italic py-1">
                          Tidak ada Variable untuk Item A-AJAR ini
                        </div>
                      ) : (
                        activeVariables.map((variable) => {
                          const isChecked = penerima.selectedVariables.includes(variable);
                          return (
                            <div key={variable} className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => handleToggleVariable(penerima.id, variable)}
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                                  isChecked
                                    ? 'border-[#008d91] bg-[#008d91] text-white'
                                    : 'border-slate-300 bg-white hover:border-[#008d91]'
                                }`}
                              >
                                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>
                              <span className="text-xs sm:text-sm font-normal text-slate-700">
                                {variable}
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 3: Paket */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                  <div className="md:col-span-4 pt-2">
                    <label className="text-sm font-normal text-slate-700">
                      Paket
                    </label>
                  </div>
                  <div className="md:col-span-8 flex flex-col gap-3">
                    {/* Search Trigger Button */}
                    <div className="relative max-w-md w-full">
                      <div
                        id={`btn-search-paket-${penerima.id}`}
                        onClick={() => {
                          setActivePaketDropdown(
                            activePaketDropdown === penerima.id ? null : penerima.id
                          );
                          setActivePenerimaDropdown(null);
                        }}
                        className={`w-full bg-white border rounded-xl px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-700 cursor-pointer flex items-center justify-between transition-colors shadow-2xs ${
                          activePaketDropdown === penerima.id
                            ? 'border-[#008d91] ring-1 ring-[#008d91]'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-slate-400">
                          <Search className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>Search Paket...</span>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-[#008d91] flex items-center justify-center text-white shrink-0">
                          <ChevronDown
                            className={`w-3.5 h-3.5 stroke-[2.5] transition-transform duration-200 ${
                              activePaketDropdown === penerima.id ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </div>

                      {/* Dropdown Popover */}
                      {activePaketDropdown === penerima.id && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150">
                          {/* Search Input with Clear Button */}
                          <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              autoFocus
                              placeholder="Cari Paket..."
                              value={paketSearchText}
                              onChange={(e) => setPaketSearchText(e.target.value)}
                              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:bg-white transition-colors"
                            />
                            {paketSearchText && (
                              <button
                                type="button"
                                onClick={() => setPaketSearchText('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Paket Options List */}
                          <div className="max-h-60 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
                            {filteredPaketOptions.length === 0 ? (
                              <div className="py-6 text-center text-xs text-slate-400">
                                {activeVariables.length === 0
                                  ? 'Tidak ada Paket (Item tidak memiliki Variable)'
                                  : 'Paket tidak ditemukan'}
                              </div>
                            ) : (
                              filteredPaketOptions.map((opt) => {
                                const isSelected = (penerima.selectedPakets || []).some(
                                  (it) => it.name === opt.name
                                );
                                return (
                                  <div
                                    key={opt.id}
                                    onClick={() => handleSelectPaket(penerima.id, opt)}
                                    className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                                      isSelected
                                        ? 'bg-teal-50/70 border border-teal-200'
                                        : 'hover:bg-slate-50 border border-transparent'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <div
                                        className={`w-8 h-8 rounded-lg ${opt.badgeColor} text-white flex items-center justify-center font-bold text-sm shrink-0`}
                                      >
                                        {opt.badgeLetter}
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-semibold text-slate-800 truncate">
                                          {opt.name}
                                        </span>
                                        <span className="text-[11px] text-slate-500">
                                          {opt.formattedPrice} • {opt.description}
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
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* List paket yang terpilih di bawahnya (hanya tampil jika sudah ada yang dipilih) */}
                    {(penerima.selectedPakets || []).length > 0 && (
                      <div className="bg-[#f0f9fa] rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-wrap items-center gap-3 sm:gap-4 animate-in fade-in duration-150">
                        {penerima.selectedPakets.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white border border-slate-100/80 rounded-2xl p-3 sm:p-3.5 flex items-center gap-3 sm:gap-4 shadow-2xs hover:shadow-xs transition-shadow shrink-0"
                          >
                            {/* Square Badge */}
                            <div
                              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${item.badgeColor} text-white flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs`}
                            >
                              {item.badgeLetter}
                            </div>

                            {/* Details */}
                            <div className="flex flex-col min-w-[130px] max-w-[210px]">
                              <span className="text-[13.5px] font-bold text-slate-800 leading-snug truncate">
                                {item.name}
                              </span>
                              <span className="text-xs text-slate-500 font-normal mt-0.5">
                                {item.formattedPrice}
                              </span>
                              <span className="text-[11px] text-slate-400 mt-1 truncate">
                                {item.description}
                              </span>
                            </div>

                            {/* Stepper Controls */}
                            <div className="flex items-center gap-1.5 ml-2">
                              <button
                                type="button"
                                onClick={() => handleUpdatePaketQuantity(penerima.id, item.id, -1)}
                                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#008d91] hover:bg-[#007a7e] text-white flex items-center justify-center cursor-pointer transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>

                              <div className="w-7 sm:w-8 h-5 sm:h-6 border border-slate-200 rounded text-center text-xs font-semibold text-slate-700 bg-white flex items-center justify-center">
                                {item.quantity}
                              </div>

                              <button
                                type="button"
                                onClick={() => handleUpdatePaketQuantity(penerima.id, item.id, 1)}
                                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#008d91] hover:bg-[#007a7e] text-white flex items-center justify-center cursor-pointer transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleRemovePaket(penerima.id, item.id)}
                                className="ml-1 text-[#008d91] hover:text-rose-500 p-0.5 cursor-pointer transition-colors"
                                title="Hapus paket"
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
              </div>
            );
          })}
        </div>

        {/* Bottom Tambah Identitas ID Penerima button in teal */}
        <div className="flex items-center">
          <button
            id="btn-tambah-penerima-ajar"
            type="button"
            onClick={handleAddPenerima}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#008d91] hover:underline cursor-pointer"
          >
            <span className="w-4 h-4 rounded-full bg-[#008d91] text-white flex items-center justify-center text-xs">
              <Plus className="w-3 h-3 stroke-[3]" />
            </span>
            <span>Tambah Identitas ID Penerima</span>
          </button>
        </div>

        {/* Field 6: Keterangan (Input Text manual, tidak auto input) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 pt-1">
          <label className="w-48 sm:w-60 text-sm font-normal text-slate-700 shrink-0">
            Keterangan
          </label>
          <div className="w-full max-w-xl">
            <input
              id="input-keterangan-ajar"
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Input Text..."
              className="w-full h-11 px-4 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] transition-colors"
            />
          </div>
        </div>

        {/* Bottom Action Buttons: Cancel and Save */}
        <div className="flex items-center justify-end gap-3 pt-6">
          <button
            id="btn-cancel-transaksi-ajar"
            type="button"
            onClick={onCancel}
            className="w-32 sm:w-36 h-10 text-xs sm:text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-full transition-colors cursor-pointer flex items-center justify-center"
          >
            Cancel
          </button>
          <button
            id="btn-save-transaksi-ajar"
            type="submit"
            className="w-32 sm:w-36 h-10 text-xs sm:text-sm font-medium text-white bg-[#008d91] hover:bg-[#05828e] rounded-full shadow-xs transition-colors cursor-pointer flex items-center justify-center"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};
