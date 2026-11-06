import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  Plus,
  Minus,
  X,
  ChevronRight,
  Send,
  EyeOff,
  Search,
  SlidersHorizontal,
  Check,
  User,
  Building2,
  Phone,
  MapPin,
  RotateCcw,
  Tag,
  Percent,
  Sparkles,
} from 'lucide-react';
import {
  INITIAL_BOOKS,
  CROSS_SELLING_BOOKS,
  SAMPLE_ADDRESSES,
  SalurOrder,
  SalurOrderItem,
  SalurProduct,
  SalurAddress,
  generateSalurOrderNumber,
} from '../salurData';
import { getUrutanTransaksiPerTahun, normalizeVia } from '../utils/kodeTransaksiHelper';
import { BookCover } from './BookCover';
import { IdentitasItem, INITIAL_IDENTITAS } from '../identitasData';
import { OrganisasiItem, ViaTransaksiSalurItem } from '../types';
import { INITIAL_ORGANISASI } from '../organisasiData';
import { INITIAL_VIA_TRANSAKSI_SALUR } from '../viaSalurData';
import { formatDatePickerValue } from '../utils/datePickerHelper';
import {
  IdentitasIdSelector,
  IdentitasIdSelectorItem,
  NO_NAME_SELECTOR_ITEM,
} from './IdentitasIdSelector';
import { PromoSalurItem, loadPromoSalur, PromoDiscountEntry } from '../promoSalurData';

export interface TransaksiEntityItem {
  id: string;
  type: 'identitas' | 'organisasi';
  code: string;
  name: string;
  secondaryName?: string;
  phone: string;
  city?: string;
  addresses: SalurAddress[];
  avatarInitial: string;
  avatarBg?: string;
}

interface FormTransaksiSalurProps {
  onCancel: () => void;
  onSave: (order: Partial<SalurOrder>, sendNow?: boolean) => void;
  onShowToast?: (msg: string) => void;
  identitasList?: IdentitasItem[];
  organisasiList?: OrganisasiItem[];
  existingOrders?: SalurOrder[];
  promoList?: PromoSalurItem[];
  viaList?: ViaTransaksiSalurItem[];
  initialOrder?: SalurOrder | null;
  onNavigateView?: (view: 'formIdentitas' | 'formOrganisasi') => void;
}

export const FormTransaksiSalur: React.FC<FormTransaksiSalurProps> = ({
  onCancel,
  onSave,
  onShowToast = (_msg: string) => {},
  identitasList,
  organisasiList,
  existingOrders,
  promoList,
  viaList,
  initialOrder,
  onNavigateView,
}) => {
  const availableViaList = useMemo(() => {
    return viaList && viaList.length > 0 ? viaList : INITIAL_VIA_TRANSAKSI_SALUR;
  }, [viaList]);
  // Convert and unify Identitas & Organisasi into searchable entities
  const allEntities = useMemo<TransaksiEntityItem[]>(() => {
    const listIdentitas =
      identitasList && identitasList.length > 0 ? identitasList : INITIAL_IDENTITAS;
    const listOrganisasi =
      organisasiList && organisasiList.length > 0 ? organisasiList : INITIAL_ORGANISASI;

    const idEntities: TransaksiEntityItem[] = listIdentitas.map((item, idx) => {
      const code = item.codeId || `1000${idx + 1}`;
      const addrs: SalurAddress[] = [];

      if (item.alamat) {
        addrs.push({
          id: `addr-${item.id}-main`,
          title: 'Alamat Utama',
          recipientName: item.namaLengkap,
          phone: item.nomorHandPhone,
          fullAddress: `${item.alamat}${item.kelurahan ? `, Kel. ${item.kelurahan}` : ''}${
            item.kecamatan ? `, Kec. ${item.kecamatan}` : ''
          }${item.kotaKabupaten || item.kota ? `, ${item.kotaKabupaten || item.kota}` : ''}${
            item.provinsi ? `, ${item.provinsi}` : ''
          }`,
        });
      }
      if (item.alamatList && item.alamatList.length > 0) {
        item.alamatList.forEach((al, aIdx) => {
          addrs.push({
            id: `addr-${item.id}-${al.id || aIdx}`,
            title: al.namaPenerima ? `Alamat: ${al.namaPenerima}` : `Alamat Kirim #${aIdx + 1}`,
            recipientName: al.namaPenerima || item.namaLengkap,
            phone: al.nomorHp || item.nomorHandPhone,
            fullAddress: `${al.alamat}${al.kelurahan ? `, Kel. ${al.kelurahan}` : ''}${
              al.kecamatan ? `, Kec. ${al.kecamatan}` : ''
            }${al.kotaKabupaten || al.kota ? `, ${al.kotaKabupaten || al.kota}` : ''}`,
          });
        });
      }
      if (addrs.length === 0) {
        addrs.push({
          id: `addr-${item.id}-default`,
          title: 'Alamat Utama',
          recipientName: item.namaLengkap,
          phone: item.nomorHandPhone,
          fullAddress: item.alamat || 'Jl. Bandung Barat tengah No.123, Cibadak, Bandung',
        });
      }

      return {
        id: item.id,
        type: 'identitas',
        code,
        name: item.namaLengkap,
        secondaryName: item.namaPanggilan,
        phone: item.nomorHandPhone || '-',
        city: item.kotaKabupaten || item.kota,
        addresses: addrs,
        avatarInitial: item.avatarInitial || item.namaLengkap.charAt(0).toUpperCase() || 'I',
        avatarBg: item.avatarBg || 'bg-[#008d91]',
      };
    });

    const orgEntities: TransaksiEntityItem[] = listOrganisasi.map((org, idx) => {
      const code = org.picOrgCode || `ORG-${String(idx + 1).padStart(2, '0')}`;
      const addrs: SalurAddress[] = [];

      if (org.alamat) {
        addrs.push({
          id: `addr-${org.id}-main`,
          title: org.namaOrg,
          recipientName: org.picOrgNama || org.namaOrg,
          phone: org.hp || '-',
          fullAddress: `${org.alamat}${org.kota ? `, ${org.kota}` : ''}${
            org.provinsi ? `, ${org.provinsi}` : ''
          }`,
        });
      }
      if (org.alamatList && org.alamatList.length > 0) {
        org.alamatList.forEach((al, aIdx) => {
          addrs.push({
            id: `addr-${org.id}-${al.id || aIdx}`,
            title: al.namaPenerima || `Alamat Kirim #${aIdx + 1}`,
            recipientName: al.namaPenerima || org.namaOrg,
            phone: al.nomorHp || org.hp || '-',
            fullAddress: `${al.alamat}${al.kelurahan ? `, Kel. ${al.kelurahan}` : ''}${
              al.kecamatan ? `, Kec. ${al.kecamatan}` : ''
            }${al.kotaKabupaten ? `, ${al.kotaKabupaten}` : ''}`,
          });
        });
      }
      if (addrs.length === 0) {
        addrs.push({
          id: `addr-${org.id}-default`,
          title: org.namaOrg,
          recipientName: org.picOrgNama || org.namaOrg,
          phone: org.hp || '-',
          fullAddress: org.alamat || 'Jl. Vihara Dharma No. 8, Bandung',
        });
      }

      return {
        id: org.id,
        type: 'organisasi',
        code,
        name: org.namaOrg,
        secondaryName: org.subOrg || org.jenisOrg,
        phone: org.hp || org.picOrgHp || '-',
        city: org.kota,
        addresses: addrs,
        avatarInitial: org.avatarInitial || org.namaOrg.charAt(0).toUpperCase() || 'O',
        avatarBg: org.avatarBg || 'bg-[#e05244]',
      };
    });

    return [...idEntities, ...orgEntities];
  }, [identitasList, organisasiList]);

  // Helper to format today's date (e.g. "6 Okt 2026")
  const getTodayFormattedDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return formatDatePickerValue(`${yyyy}-${mm}-${dd}`);
  };

  // Form State: Tanggal auto isi tanggal hari ini, tapi bisa diganti jika di klik
  const [tanggal, setTanggal] = useState(() => initialOrder?.date || getTodayFormattedDate());
  // Via auto isi Call Center
  const [via, setVia] = useState(() => {
    if (initialOrder?.via) return initialOrder.via;
    const foundCC = availableViaList.find(
      (v) => v.namaVia.toLowerCase() === 'call center'
    );
    return foundCC?.namaVia || 'Call Center';
  });

  // Pembeli State: Identitas ID Pembeli dikosongkan saat dibuka
  const [selectedPembeli, setSelectedPembeli] = useState<TransaksiEntityItem | null>(() => {
    if (initialOrder?.idPembeli) {
      return (
        allEntities.find(
          (e) =>
            e.id === initialOrder.idPembeli ||
            `${e.code} ${e.name}`.toLowerCase() === initialOrder.idPembeli?.toLowerCase()
        ) || null
      );
    }
    return null;
  });
  const [idPembeli, setIdPembeli] = useState(() => initialOrder?.idPembeli || '');
  const [isPembeliOpen, setIsPembeliOpen] = useState(false);
  const [pembeliSearch, setPembeliSearch] = useState('');
  const [pembeliFilter, setPembeliFilter] = useState<'all' | 'identitas' | 'organisasi'>('all');

  // Checklist "Pembeli dan Penerima tidak Sama?" State
  // When checked: Identitas ID Penerima langsung sama dengan Identitas ID Pembeli!
  const [isChecklistActive, setIsChecklistActive] = useState(false);

  // Penerima State: Identitas ID Penerima dikosongkan saat dibuka
  const [selectedPenerima, setSelectedPenerima] = useState<TransaksiEntityItem | null>(() => {
    if (initialOrder?.idPenerima) {
      return (
        allEntities.find(
          (e) =>
            e.id === initialOrder.idPenerima ||
            `${e.code} ${e.name}`.toLowerCase() === initialOrder.idPenerima?.toLowerCase()
        ) || null
      );
    }
    return null;
  });
  const [idPenerima, setIdPenerima] = useState(() => initialOrder?.idPenerima || '');
  const [isPenerimaOpen, setIsPenerimaOpen] = useState(false);
  const [penerimaSearch, setPenerimaSearch] = useState('');
  const [penerimaFilter, setPenerimaFilter] = useState<'all' | 'identitas' | 'organisasi'>('all');

  // Refs for click outside
  const pembeliRef = useRef<HTMLDivElement>(null);
  const penerimaRef = useRef<HTMLDivElement>(null);
  const itemSearchRef = useRef<HTMLDivElement>(null);
  const promoRef = useRef<HTMLDivElement>(null);
  const datePickerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pembeliRef.current && !pembeliRef.current.contains(event.target as Node)) {
        setIsPembeliOpen(false);
      }
      if (penerimaRef.current && !penerimaRef.current.contains(event.target as Node)) {
        setIsPenerimaOpen(false);
      }
      if (itemSearchRef.current && !itemSearchRef.current.contains(event.target as Node)) {
        setIsItemSearchOpen(false);
      }
      if (promoRef.current && !promoRef.current.contains(event.target as Node)) {
        setIsPromoSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter entities based on search (by Name, HP, Code)
  const filterEntities = (searchQuery: string, typeFilter: 'all' | 'identitas' | 'organisasi') => {
    const q = searchQuery.trim().toLowerCase();
    const qDigits = searchQuery.replace(/\D/g, '');

    return allEntities.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (!q) return true;

      const nameMatch = item.name.toLowerCase().includes(q);
      const secNameMatch = item.secondaryName?.toLowerCase().includes(q);
      const codeMatch = item.code.toLowerCase().includes(q);
      const cityMatch = item.city?.toLowerCase().includes(q);

      // Phone match (either direct substring or normalized digits)
      const phoneDigits = item.phone.replace(/\D/g, '');
      const phoneMatch =
        item.phone.toLowerCase().includes(q) ||
        (qDigits.length > 2 && phoneDigits.includes(qDigits));

      return nameMatch || secNameMatch || codeMatch || cityMatch || phoneMatch;
    });
  };

  const filteredPembeliList = useMemo(
    () => filterEntities(pembeliSearch, pembeliFilter),
    [allEntities, pembeliSearch, pembeliFilter]
  );

  const filteredPenerimaList = useMemo(
    () => filterEntities(penerimaSearch, penerimaFilter),
    [allEntities, penerimaSearch, penerimaFilter]
  );

  // Addresses derived from selected Penerima (or fallback to Pembeli)
  const availableAddresses = useMemo<SalurAddress[]>(() => {
    if (selectedPenerima && selectedPenerima.addresses && selectedPenerima.addresses.length > 0) {
      return selectedPenerima.addresses;
    }
    if (selectedPembeli && selectedPembeli.addresses && selectedPembeli.addresses.length > 0) {
      return selectedPembeli.addresses;
    }
    return [];
  }, [selectedPenerima, selectedPembeli]);

  // Identitas ID Alamat Penerima dikosongkan saat dibuka
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');

  useEffect(() => {
    if (availableAddresses.length > 0) {
      if (!selectedAddressId || !availableAddresses.some((a) => a.id === selectedAddressId)) {
        setSelectedAddressId(availableAddresses[0].id);
      }
    } else {
      setSelectedAddressId('');
    }
  }, [availableAddresses]);

  // Handle Checklist Toggle
  const handleToggleChecklist = () => {
    const nextVal = !isChecklistActive;
    setIsChecklistActive(nextVal);

    if (nextVal) {
      // Di-checklist: Identitas ID Penerima langsung sama dengan Identitas ID Pembeli!
      setSelectedPenerima(selectedPembeli);
      if (selectedPembeli) {
        setIdPenerima(`${selectedPembeli.code} ${selectedPembeli.name}`);
        if (selectedPembeli.addresses && selectedPembeli.addresses.length > 0) {
          setSelectedAddressId(selectedPembeli.addresses[0].id);
        }
      } else {
        setIdPenerima(idPembeli);
      }
      onShowToast('Identitas ID Penerima langsung sama dengan Identitas ID Pembeli');
    } else {
      onShowToast('Penerima dapat dipilih berbeda dari pembeli');
    }
  };

  // Select Pembeli
  const handleSelectPembeli = (entity: TransaksiEntityItem) => {
    setSelectedPembeli(entity);
    const displayText = `${entity.code} ${entity.name}`;
    setIdPembeli(displayText);
    setIsPembeliOpen(false);

    // Jika checklist aktif: Identitas ID Penerima langsung sama dengan Identitas ID Pembeli
    if (isChecklistActive) {
      setSelectedPenerima(entity);
      setIdPenerima(displayText);
      if (entity.addresses && entity.addresses.length > 0) {
        setSelectedAddressId(entity.addresses[0].id);
      }
    }
  };

  // Select Pembeli from IdentitasIdSelector matching image
  const handleSelectPembeliItem = (item: IdentitasIdSelectorItem) => {
    const isNoName = item.id === 'no-name' || item.name.toLowerCase() === 'no name';
    const displayText = isNoName ? 'No Name' : (item.code ? `${item.code} ${item.name}` : item.name);
    setIdPembeli(displayText);

    const defaultAddresses = isNoName
      ? [
          {
            id: 'addr-no-name-1',
            title: 'Ambil di Tempat / Stand',
            recipientName: 'No Name',
            phone: '-',
            fullAddress: 'Ambil di Tempat / Stand',
          },
        ]
      : [];

    const rawAddrs =
      item.rawIdentitas?.alamatList && item.rawIdentitas.alamatList.length > 0
        ? item.rawIdentitas.alamatList.map((al, idx) => ({
            id: `addr-${item.id}-${al.id || idx}`,
            title: al.namaPenerima || `Alamat #${idx + 1}`,
            recipientName: al.namaPenerima || item.name,
            phone: al.nomorHp || item.subtitle,
            fullAddress: `${al.alamat}${al.kelurahan ? `, Kel. ${al.kelurahan}` : ''}${al.kecamatan ? `, Kec. ${al.kecamatan}` : ''}${al.kotaKabupaten ? `, ${al.kotaKabupaten}` : ''}`,
          }))
        : defaultAddresses;

    const matchEntity = allEntities.find((e) => e.id === item.id) || {
      id: item.id,
      type: item.type,
      code: item.code,
      name: item.name,
      phone: item.subtitle,
      addresses: rawAddrs,
      avatarInitial: item.avatarInitial,
      avatarBg: item.avatarBg,
    };
    setSelectedPembeli(matchEntity);
    if (matchEntity.addresses && matchEntity.addresses.length > 0) {
      setSelectedAddressId(matchEntity.addresses[0].id);
    }

    // Jika checklist aktif: Identitas ID Penerima langsung sama dengan Identitas ID Pembeli
    if (isChecklistActive) {
      setSelectedPenerima(matchEntity);
      setIdPenerima(displayText);
      if (matchEntity.addresses && matchEntity.addresses.length > 0) {
        setSelectedAddressId(matchEntity.addresses[0].id);
      }
    }
  };

  // Select Penerima
  const handleSelectPenerima = (entity: TransaksiEntityItem) => {
    setSelectedPenerima(entity);
    const displayText = `${entity.code} ${entity.name}`;
    setIdPenerima(displayText);
    setIsPenerimaOpen(false);

    if (entity.addresses && entity.addresses.length > 0) {
      setSelectedAddressId(entity.addresses[0].id);
    }

    // Jika memilih penerima yang berbeda dari pembeli saat checklist aktif, non-aktifkan checklist
    if (selectedPembeli && (entity.id !== selectedPembeli.id || entity.type !== selectedPembeli.type)) {
      setIsChecklistActive(false);
    }
  };

  // Select Penerima from IdentitasIdSelector matching image
  const handleSelectPenerimaItem = (item: IdentitasIdSelectorItem) => {
    const displayText = item.code ? `${item.code} ${item.name}` : item.name;
    setIdPenerima(displayText);

    const matchEntity = allEntities.find((e) => e.id === item.id) || {
      id: item.id,
      type: item.type,
      code: item.code,
      name: item.name,
      phone: item.subtitle,
      addresses: item.rawIdentitas?.alamatList?.map((al, idx) => ({
        id: `addr-${item.id}-${al.id || idx}`,
        title: al.namaPenerima || `Alamat #${idx + 1}`,
        recipientName: al.namaPenerima || item.name,
        phone: al.nomorHp || item.subtitle,
        fullAddress: `${al.alamat}${al.kelurahan ? `, Kel. ${al.kelurahan}` : ''}${al.kecamatan ? `, Kec. ${al.kecamatan}` : ''}${al.kotaKabupaten ? `, ${al.kotaKabupaten}` : ''}`,
      })) || [],
      avatarInitial: item.avatarInitial,
      avatarBg: item.avatarBg,
    };
    setSelectedPenerima(matchEntity);

    if (matchEntity.addresses && matchEntity.addresses.length > 0) {
      setSelectedAddressId(matchEntity.addresses[0].id);
    }

    if (selectedPembeli && (item.id !== selectedPembeli.id || item.type !== selectedPembeli.type)) {
      setIsChecklistActive(false);
    }
  };

  // Item S-SALUR search & dropdown state
  const [isItemSearchOpen, setIsItemSearchOpen] = useState(false);
  const [itemQuery, setItemQuery] = useState('');

  // Selected Transaction Items (empty before being filled, or loaded from initialOrder)
  const [transactionItems, setTransactionItems] = useState<SalurOrderItem[]>(() => {
    if (initialOrder?.items && initialOrder.items.length > 0) {
      return initialOrder.items;
    }
    return [];
  });

  const allAvailableProducts = useMemo<SalurProduct[]>(() => {
    return [...INITIAL_BOOKS, ...CROSS_SELLING_BOOKS];
  }, []);

  // Promo State & Handlers
  const allPromos = useMemo(() => {
    return promoList && promoList.length > 0 ? promoList : loadPromoSalur();
  }, [promoList]);

  const [selectedPromo, setSelectedPromo] = useState<PromoSalurItem | null>(null);
  const [isPromoSearchOpen, setIsPromoSearchOpen] = useState(false);
  const [promoSearchQuery, setPromoSearchQuery] = useState('');

  // Helper to calculate discounted item price
  const calculateItemPromoPrice = (
    title: string,
    originalPrice: number,
    promo: PromoSalurItem | null
  ): { price: number; originalPrice: number; promoDiscountText?: string } => {
    if (!promo) {
      return { price: originalPrice, originalPrice };
    }

    let discount: PromoDiscountEntry | undefined;
    if (promo.discounts && promo.discounts.length > 0) {
      discount = promo.discounts.find(
        (d) =>
          d.itemSalur &&
          (d.itemSalur.toLowerCase().trim() === title.toLowerCase().trim() ||
            title.toLowerCase().includes(d.itemSalur.toLowerCase().trim()) ||
            d.itemSalur.toLowerCase().includes(title.toLowerCase().trim()))
      );

      if (!discount) {
        discount = promo.discounts.find(
          (d) => !d.itemSalur || d.itemSalur.toLowerCase().trim() === 'all'
        );
      }
    }

    let discountAmount = 0;
    let discountText = '';

    if (discount && discount.nominal) {
      const nominalNum = parseFloat(discount.nominal.replace(/[^\d.]/g, '')) || 0;
      if (discount.unit === '%') {
        discountAmount = Math.round((originalPrice * nominalNum) / 100);
        discountText = `-${nominalNum}%`;
      } else {
        discountAmount = nominalNum;
        discountText = `-Rp${nominalNum.toLocaleString('id-ID')}`;
      }
    } else if (promo.subtitle) {
      const pctMatch = promo.subtitle.match(/(\d+)\s*%/);
      if (pctMatch) {
        const pct = parseInt(pctMatch[1], 10);
        discountAmount = Math.round((originalPrice * pct) / 100);
        discountText = `-${pct}%`;
      } else {
        const rpMatch = promo.subtitle.match(/Rp\s*([\d.]+)/i);
        if (rpMatch) {
          const rp = parseInt(rpMatch[1].replace(/\./g, ''), 10);
          discountAmount = rp;
          discountText = `-Rp${rp.toLocaleString('id-ID')}`;
        }
      }
    }

    const finalPrice = Math.max(0, originalPrice - discountAmount);
    return {
      price: finalPrice,
      originalPrice,
      promoDiscountText: discountText || undefined,
    };
  };

  // Eligibility check according to user requirements:
  // 1. Identitas ID Pembeli must match Target Promo
  // 2. Via must match Channel Promo
  // 3. Identitas ID Pembeli has not exceeded Limit Promo
  const isPromoEligible = (promo: PromoSalurItem): { eligible: boolean; reason?: string } => {
    if (promo.status === 'Berakhir') {
      return { eligible: false, reason: 'Promo sudah berakhir' };
    }

    // Condition 1: Identitas ID Pembeli vs Target Promo
    if (promo.targetEntries && promo.targetEntries.length > 0) {
      const isTargetAll = promo.targetEntries.some(
        (t) => t.targetType === 'all' || t.label.toLowerCase().includes('all')
      );
      if (!isTargetAll) {
        const buyerCode = (selectedPembeli?.code || '').trim().toLowerCase();
        const buyerName = (selectedPembeli?.name || '').trim().toLowerCase();
        const buyerIdStr = idPembeli.trim().toLowerCase();
        const buyerType = selectedPembeli?.type;

        const matchesAnyTarget = promo.targetEntries.some((t) => {
          const labelLower = t.label.toLowerCase();
          const valLower = (t.targetValue || '').toLowerCase();

          if (t.targetType === 'identitas') {
            return (
              (buyerCode && (labelLower.includes(buyerCode) || valLower.includes(buyerCode))) ||
              (buyerName && (labelLower.includes(buyerName) || valLower.includes(buyerName))) ||
              (buyerIdStr && labelLower.includes(buyerIdStr)) ||
              (t.id && selectedPembeli?.id === t.id)
            );
          }

          if (t.targetType === 'organisasi') {
            if (buyerType !== 'organisasi') return false;
            return (
              (buyerName && (labelLower.includes(buyerName) || valLower.includes(buyerName))) ||
              (buyerCode && (labelLower.includes(buyerCode) || valLower.includes(buyerCode))) ||
              (t.id && selectedPembeli?.id === t.id)
            );
          }

          if (t.targetType === 'karyawan') {
            return (
              (buyerCode && labelLower.includes(buyerCode)) ||
              (buyerName && labelLower.includes(buyerName))
            );
          }

          return (
            (buyerCode && labelLower.includes(buyerCode)) ||
            (buyerName && labelLower.includes(buyerName))
          );
        });

        if (!matchesAnyTarget) {
          return {
            eligible: false,
            reason: 'Identitas ID Pembeli tidak sesuai dengan Target Promo',
          };
        }
      }
    }

    // Condition 2: Via vs Channel Promo
    const currentViaNorm = via.trim().toLowerCase();
    let matchesChannel = false;

    if (promo.channelEntries && promo.channelEntries.length > 0) {
      matchesChannel = promo.channelEntries.some((ch) => {
        const chNorm = ch.viaName.trim().toLowerCase();
        return (
          chNorm === currentViaNorm ||
          currentViaNorm.includes(chNorm) ||
          chNorm.includes(currentViaNorm)
        );
      });
    }

    if (!matchesChannel && promo.channels && promo.channels.length > 0) {
      matchesChannel = promo.channels.some((ch) => {
        const chNorm = ch.trim().toLowerCase();
        return (
          chNorm === currentViaNorm ||
          currentViaNorm.includes(chNorm) ||
          chNorm.includes(currentViaNorm)
        );
      });
    }

    if (!matchesChannel) {
      return {
        eligible: false,
        reason: 'Via tidak sesuai dengan Channel Promo',
      };
    }

    // Condition 3: Limit Promo
    const limitStr = (promo.limitPromo || '').toLowerCase();
    const hasLimit =
      limitStr.includes('satu id') ||
      limitStr.includes('satu buah') ||
      limitStr.includes('limit');

    if (hasLimit) {
      const promoItemNames = (promo.discounts || [])
        .map((d) => d.itemSalur.trim().toLowerCase())
        .filter(Boolean);

      const buyerIdentifier = (selectedPembeli?.code || selectedPembeli?.name || idPembeli)
        .toLowerCase()
        .trim();

      const previousBuyerOrders = (existingOrders || []).filter((ord) => {
        const ordBuyer = (ord.idPembeli || ord.customerId || '').toLowerCase().trim();
        return (
          ordBuyer.includes(buyerIdentifier) ||
          buyerIdentifier.includes(ordBuyer) ||
          (selectedPembeli?.code && ordBuyer.includes(selectedPembeli.code.toLowerCase()))
        );
      });

      for (const ord of previousBuyerOrders) {
        for (const it of ord.items || []) {
          const itTitle = it.title.toLowerCase().trim();
          const isPromoItem =
            promoItemNames.length === 0 ||
            promoItemNames.some((pin) => pin === 'all' || itTitle.includes(pin) || pin.includes(itTitle));

          if (isPromoItem && it.quantity >= 1) {
            return {
              eligible: false,
              reason: `Identitas ID Pembeli sudah melebihi Limit Promo untuk "${it.title}" (maksimal 1 buah)`,
            };
          }
        }
      }

      for (const it of transactionItems) {
        const itTitle = it.title.toLowerCase().trim();
        const isPromoItem =
          promoItemNames.length === 0 ||
          promoItemNames.some((pin) => pin === 'all' || itTitle.includes(pin) || pin.includes(itTitle));

        if (isPromoItem && it.quantity > 1) {
          return {
            eligible: false,
            reason: `Kuantitas "${it.title}" (${it.quantity}) melebihi Limit Promo (maksimal 1 buah)`,
          };
        }
      }
    }

    return { eligible: true };
  };

  const filteredPromos = useMemo(() => {
    return allPromos.filter((promo) => {
      const { eligible } = isPromoEligible(promo);
      if (!eligible) return false;

      if (promoSearchQuery.trim()) {
        const q = promoSearchQuery.toLowerCase().trim();
        const matchName = promo.namaPromo.toLowerCase().includes(q);
        const matchSub = (promo.subtitle || '').toLowerCase().includes(q);
        const matchCodes = (promo.kodePromo || []).some((c) => c.toLowerCase().includes(q));
        return matchName || matchSub || matchCodes;
      }
      return true;
    });
  }, [allPromos, selectedPembeli, idPembeli, via, existingOrders, transactionItems, promoSearchQuery]);

  const handleSelectPromo = (promo: PromoSalurItem) => {
    setSelectedPromo(promo);
    setIsPromoSearchOpen(false);
    setPromoSearchQuery('');

    // Apply promo discount to all items
    setTransactionItems((prev) =>
      prev.map((item) => {
        const catalogBook = allAvailableProducts.find(
          (p) => p.id === item.productId || p.title === item.title
        );
        const basePrice = catalogBook?.price || item.originalPrice || item.price;
        const disc = calculateItemPromoPrice(item.title, basePrice, promo);
        return {
          ...item,
          originalPrice: disc.originalPrice,
          price: disc.price,
          promoDiscountText: disc.promoDiscountText,
        };
      })
    );

    onShowToast(`Promo "${promo.namaPromo}" berhasil diterapkan`);
  };

  const handleRemovePromo = () => {
    setSelectedPromo(null);
    setIsPromoSearchOpen(false);
    setPromoSearchQuery('');

    // Restore original prices
    setTransactionItems((prev) =>
      prev.map((item) => {
        const catalogBook = allAvailableProducts.find(
          (p) => p.id === item.productId || p.title === item.title
        );
        const basePrice = catalogBook?.price || item.originalPrice || item.price;
        return {
          ...item,
          price: basePrice,
          originalPrice: undefined,
          promoDiscountText: undefined,
        };
      })
    );
  };

  // Re-validate promo when buyer or via changes
  useEffect(() => {
    if (selectedPromo) {
      const { eligible, reason } = isPromoEligible(selectedPromo);
      if (!eligible) {
        handleRemovePromo();
        onShowToast(`Promo "${selectedPromo.namaPromo}" dibatalkan: ${reason || 'tidak memenuhi syarat'}`);
      }
    }
  }, [selectedPembeli, idPembeli, via]);

  const filteredProducts = useMemo(() => {
    if (!itemQuery.trim()) return allAvailableProducts;
    const q = itemQuery.toLowerCase().trim();
    return allAvailableProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.author && p.author.toLowerCase().includes(q))
    );
  }, [allAvailableProducts, itemQuery]);

  const handleSelectItemProduct = (book: SalurProduct) => {
    const existing = transactionItems.find(
      (item) => item.productId === book.id || item.title === book.title
    );
    if (existing) {
      handleQuantityChange(existing.id, 1);
      onShowToast(`Kuantitas "${book.title}" bertambah (+1)`);
    } else {
      const disc = calculateItemPromoPrice(book.title, book.price, selectedPromo);
      const newItem: SalurOrderItem = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: book.id,
        title: book.title,
        price: disc.price,
        originalPrice: selectedPromo && disc.price !== disc.originalPrice ? disc.originalPrice : undefined,
        promoDiscountText: selectedPromo ? disc.promoDiscountText : undefined,
        quantity: 1,
        coverKey: (book.coverKey as any) || 'demi-kepentingan',
        berat: book.berat !== undefined ? book.berat : 0.4,
      };
      setTransactionItems((prev) => [...prev, newItem]);
      onShowToast(`"${book.title}" ditambahkan ke Item S-SALUR`);
    }
  };

  const [jenisEkspedisi, setJenisEkspedisi] = useState('');
  const [ongkosKirim, setOngkosKirim] = useState('');
  const [donasi, setDonasi] = useState('');
  const [keteranganDonasi, setKeteranganDonasi] = useState('');
  const [kodeUnik, setKodeUnik] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [proyekSapa, setProyekSapa] = useState('');

  // Helper to compute weight in kg for each item
  const getItemWeightKg = (item: SalurOrderItem): number => {
    if (item.berat !== undefined) {
      if (typeof item.berat === 'number') return item.berat;
      const parsed = parseFloat(String(item.berat).replace(/[^\d.]/g, ''));
      if (!isNaN(parsed)) {
        if (String(item.berat).toLowerCase().includes('gr') || String(item.berat).toLowerCase().includes('gram')) {
          return parsed / 1000;
        }
        return parsed;
      }
    }
    const book = allAvailableProducts.find((p) => p.id === item.productId || p.title === item.title);
    if (book && book.berat !== undefined) {
      const b = book.berat;
      if (typeof b === 'number') return b;
      const parsed = parseFloat(String(b).replace(/[^\d.]/g, ''));
      if (!isNaN(parsed)) {
        if (String(b).toLowerCase().includes('gr') || String(b).toLowerCase().includes('gram')) {
          return parsed / 1000;
        }
        return parsed;
      }
    }
    const title = (item.title || '').toLowerCase();
    if (title.includes('kemahatahuan')) return 0.5;
    if (title.includes('kepentingan')) return 0.3;
    if (title.includes('menjadi buddha')) return 0.4;
    if (title.includes('lakon')) return 0.3;
    if (title.includes('amerta')) return 0.4;
    if (title.includes('leader')) return 0.5;
    return 0.4;
  };

  // Total weight in kg
  const totalWeightKg = useMemo(() => {
    if (transactionItems.length === 0) return 0;
    const sum = transactionItems.reduce((acc, it) => acc + getItemWeightKg(it) * it.quantity, 0);
    return Math.round(sum * 100) / 100;
  }, [transactionItems, allAvailableProducts]);

  // Formatted display (e.g. "2.7kg", "1kg")
  const totalWeightDisplay = useMemo(() => {
    if (transactionItems.length === 0) return '';
    const formattedNum = Number.isInteger(totalWeightKg)
      ? `${totalWeightKg}`
      : `${totalWeightKg.toString()}`;
    return `${formattedNum}kg`;
  }, [transactionItems, totalWeightKg]);

  // Stepper handlers
  const handleQuantityChange = (id: string, delta: number) => {
    if (selectedPromo) {
      const limitStr = (selectedPromo.limitPromo || '').toLowerCase();
      const hasLimit =
        limitStr.includes('satu id') ||
        limitStr.includes('satu buah') ||
        limitStr.includes('limit');

      if (hasLimit && delta > 0) {
        const targetItem = transactionItems.find((it) => it.id === id);
        if (targetItem && targetItem.quantity >= 1) {
          onShowToast(`Tidak dapat menambah: Promo "${selectedPromo.namaPromo}" dibatasi maksimal 1 buah per item`);
          return;
        }
      }
    }

    setTransactionItems((prev) =>
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
    setTransactionItems((prev) => prev.filter((item) => item.id !== id));
    onShowToast('Buku dihapus dari Item S-SALUR');
  };

  const handleAddCrossSelling = (book: SalurProduct) => {
    const existing = transactionItems.find((item) => item.productId === book.id);
    if (existing) {
      handleQuantityChange(existing.id, 1);
      onShowToast(`Kuantitas "${book.title}" bertambah (+1)`);
    } else {
      const disc = calculateItemPromoPrice(book.title, book.price, selectedPromo);
      const newItem: SalurOrderItem = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: book.id,
        title: book.title,
        price: disc.price,
        originalPrice: selectedPromo && disc.price !== disc.originalPrice ? disc.originalPrice : undefined,
        promoDiscountText: selectedPromo ? disc.promoDiscountText : undefined,
        quantity: 1,
        coverKey: book.coverKey,
        berat: book.berat !== undefined ? book.berat : 0.4,
      };
      setTransactionItems((prev) => [...prev, newItem]);
      onShowToast(`"${book.title}" ditambahkan ke Item S-SALUR`);
    }
  };

  const handleSubmit = (sendNow: boolean = false) => {
    // Calculate total
    const itemsTotal = transactionItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const ongkirRaw = ongkosKirim.trim().replace(/\D/g, '');
    const ongkirNum = ongkirRaw ? Number(ongkirRaw) : 0;
    const donasiRaw = donasi.trim().replace(/\D/g, '');
    const donasiNum = donasiRaw ? Number(donasiRaw) : 0;
    const kodeUnikRaw = kodeUnik.trim().replace(/\D/g, '');
    const kodeUnikNum = kodeUnikRaw ? Number(kodeUnikRaw) : 0;
    const total = itemsTotal + ongkirNum + donasiNum + kodeUnikNum;

    const selectedAddr =
      availableAddresses.find((a) => a.id === selectedAddressId) ||
      availableAddresses[0] ||
      SAMPLE_ADDRESSES[0];

    const targetDate = tanggal || getTodayFormattedDate();
    const cleanVia = normalizeVia(via);
    const nextSeq = getUrutanTransaksiPerTahun(existingOrders || [], targetDate);
    const { orderNumber } = generateSalurOrderNumber(
      cleanVia,
      targetDate,
      nextSeq
    );

    const enrichedItems: SalurOrderItem[] = transactionItems.map((it) => ({
      ...it,
      promo: it.promoDiscountText || (selectedPromo ? (selectedPromo.subtitle || selectedPromo.namaPromo) : '-'),
    }));

    const newOrder: Partial<SalurOrder> = {
      orderNumber,
      via: cleanVia,
      customerId: idPembeli || '10001 Lilo',
      customerCode: idPenerima || '10001 Lilo',
      idPembeli: idPembeli || '10001 Lilo',
      idPenerima: idPenerima || '10001 Lilo',
      date: tanggal || getTodayFormattedDate(),
      paymentStatus: 'Paid',
      shippingStatus: sendNow ? 'Sudah Dikirim' : 'Belum dikirim',
      statusBadges: ['Paid', 'Paid'],
      promo: selectedPromo ? (selectedPromo.subtitle || selectedPromo.namaPromo) : undefined,
      promoName: selectedPromo?.namaPromo,
      items: enrichedItems,
      alamat: {
        recipientName: selectedAddr.recipientName,
        phone: selectedAddr.phone,
        street: selectedAddr.fullAddress.split(',')[0] || 'Jl. Bandung Barat tengah No.123',
        cityProvince: 'Jawa Barat, Indonesia',
        postalCode: '12345',
      },
      ekspedisi: {
        name: jenisEkspedisi.trim(),
        noResi: '-',
        isShipped: sendNow,
      },
      costBreakdown: {
        ongkir:
          ongkirNum > 0
            ? totalWeightDisplay
              ? `Ongkos Kirim (${totalWeightDisplay}): Rp${ongkirNum.toLocaleString('id-ID')}`
              : `Ongkos Kirim: Rp${ongkirNum.toLocaleString('id-ID')}`
            : undefined,
        donasi: donasiNum > 0 ? `Donasi: Rp${donasiNum.toLocaleString('id-ID')}` : undefined,
        kodeUnik: kodeUnikNum > 0 ? `Kode Unik: Rp${kodeUnikNum.toLocaleString('id-ID')}` : undefined,
      },
      totalDana: `Rp${total.toLocaleString('id-ID')}`,
      keterangan,
    };

    onSave(newOrder, sendNow);
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-800 animate-in fade-in duration-200">
      {/* Top Toolbar matching Image 2 */}
      <div className="flex items-center justify-end gap-3">
        {/* Eye Off Icon */}
        <button
          type="button"
          title="Sembunyikan Kolom"
          onClick={() => onShowToast('Mode privasi tampilan')}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <EyeOff className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Search Icon */}
        <button
          type="button"
          title="Cari"
          onClick={() => onShowToast('Fitur pencarian Item S-SALUR')}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Sliders Icon */}
        <button
          type="button"
          title="Filter & Pengaturan"
          onClick={() => onShowToast('Pengaturan filter formulir')}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* + Add Button */}
        <button
          type="button"
          title="Tambah Transaksi S-SALUR"
          onClick={() => onShowToast('Formulir Transaksi S-SALUR sudah terbuka')}
          className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-sm px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Main Form Container matching exact layout in Image 2 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-10 flex flex-col gap-5">
        {/* 1. Tanggal */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Tanggal
          </label>
          <div className="md:col-span-9 max-w-md relative">
            <input
              type="text"
              placeholder="Input Date..."
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              onClick={() => {
                try {
                  datePickerInputRef.current?.showPicker?.();
                } catch (_) {}
              }}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 pr-10 py-2.5 text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] cursor-pointer"
            />
            <button
              type="button"
              onClick={() => {
                try {
                  datePickerInputRef.current?.showPicker?.();
                } catch (_) {}
              }}
              title="Pilih Tanggal"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#008d91] hover:text-[#05828e] cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <input
              ref={datePickerInputRef}
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
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 opacity-0 cursor-pointer z-10"
            />
          </div>
        </div>

        {/* 2. Via */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Via
          </label>
          <div className="md:col-span-9 max-w-md relative">
            <select
              value={via}
              onChange={(e) => setVia(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] cursor-pointer"
            >
              {!availableViaList.some((v) => v.namaVia.toLowerCase() === 'call center') && (
                <option value="Call Center">Call Center</option>
              )}
              {availableViaList.map((v) => (
                <option key={v.id} value={v.namaVia}>
                  {v.namaVia}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* 3. Identitas ID Pembeli matching image */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-3 flex items-center justify-between pr-2">
            <label className="text-sm text-slate-700 font-normal">
              Identitas ID Pembeli
            </label>
            <button
              type="button"
              onClick={() => handleSelectPembeliItem(NO_NAME_SELECTOR_ITEM)}
              className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200/80 transition-colors cursor-pointer"
              title="Pilih opsi No Name (Anonim)"
            >
              + No Name
            </button>
          </div>
          <div className="md:col-span-9 max-w-md relative">
            <IdentitasIdSelector
              id="identitas-id-pembeli-salur"
              value={idPembeli}
              onSelect={handleSelectPembeliItem}
              identitasList={identitasList}
              organisasiList={organisasiList}
              onNavigateView={onNavigateView}
              placeholder="Search..."
            />
          </div>
        </div>

        {/* 4. Pembeli dan Penerima Tidak Sama? */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Pembeli dan Penerima Tidak Sama?
          </label>
          <div className="md:col-span-9 flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleChecklist}
              title="Centang untuk menyamakan Identitas Penerima dengan Pembeli"
              className={`w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                isChecklistActive
                  ? 'border-[#008d91] bg-[#008d91] text-white shadow-2xs'
                  : 'border-slate-300 bg-white text-transparent hover:border-slate-400'
              }`}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>

            {isChecklistActive && (
              <span className="text-xs font-medium text-[#008d91] bg-teal-50 border border-teal-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-in fade-in duration-150">
                <Check className="w-3 h-3 stroke-[2.5]" /> Penerima Langsung Disamakan dengan Pembeli
              </span>
            )}
          </div>
        </div>

        {/* 5. Identitas ID Penerima matching image */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Identitas ID Penerima
          </label>
          <div className="md:col-span-9 max-w-md relative">
            <IdentitasIdSelector
              id="identitas-id-penerima-salur"
              value={idPenerima}
              onSelect={handleSelectPenerimaItem}
              identitasList={identitasList}
              organisasiList={organisasiList}
              onNavigateView={onNavigateView}
              placeholder="Search..."
            />
          </div>
        </div>

        {/* 6. Identitas ID Alamat Penerima */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal pt-2">
            Identitas ID Alamat Penerima
          </label>
          <div className="md:col-span-9 flex flex-wrap items-center gap-3">
            {availableAddresses.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-2">
                Pilih Identitas ID Penerima terlebih dahulu untuk menampilkan alamat
              </div>
            ) : (
              availableAddresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`relative w-full sm:w-60 bg-[#f8fafc] rounded-2xl p-3.5 border transition-all cursor-pointer flex flex-col justify-between min-h-[115px] ${
                      isSelected
                        ? 'border-[#008d91] ring-1 ring-[#008d91]/20 shadow-xs'
                        : 'border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-xs sm:text-sm">
                        {addr.title}
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5">{addr.phone}</span>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed line-clamp-3">
                        {addr.fullAddress}
                      </p>
                    </div>

                    {/* Radio Indicator Button in bottom right */}
                    <div className="self-end mt-2">
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full border-2 border-[#008d91] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#008d91]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300" />
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Address action buttons matching image (Chevron right & Send icon) */}
            <div className="flex items-center gap-2 pl-1">
              <button
                type="button"
                title="Alamat Lainnya"
                onClick={() => onShowToast('Menampilkan daftar alamat lainnya')}
                className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center hover:bg-[#05828e] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <button
                type="button"
                title="Kirim Alamat"
                onClick={() => onShowToast('Alamat penerima dikonfirmasi')}
                className="text-[#008d91] hover:text-[#05828e] p-1 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
          </div>
        </div>

        {/* 7. Promo matching List Promo S-SALUR */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal flex items-center gap-1.5">
            <span>Promo</span>
            {selectedPromo && (
              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded-full">
                Aktif
              </span>
            )}
          </label>
          <div className="md:col-span-9 max-w-md relative" ref={promoRef}>
            {/* Promo Trigger */}
            <div
              id="btn-search-promo-salur"
              onClick={() => setIsPromoSearchOpen(!isPromoSearchOpen)}
              className={`w-full bg-white border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-700 cursor-pointer flex items-center justify-between transition-colors shadow-2xs ${
                isPromoSearchOpen
                  ? 'border-[#008d91] ring-1 ring-[#008d91]'
                  : selectedPromo
                  ? 'border-rose-300 bg-rose-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {selectedPromo ? (
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                    <Percent className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div className="flex flex-col min-w-0 truncate">
                    <span className="font-semibold text-slate-800 text-xs sm:text-sm truncate">
                      {selectedPromo.namaPromo}
                    </span>
                    <span className="text-[11px] text-rose-600 font-medium truncate">
                      {selectedPromo.subtitle}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-400">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Search Promo...</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {selectedPromo && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePromo();
                    }}
                    title="Batalkan Promo"
                    className="w-5 h-5 rounded-full bg-slate-200 hover:bg-rose-500 hover:text-white text-slate-600 flex items-center justify-center transition-colors cursor-pointer mr-1"
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </button>
                )}
                <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0">
                  <ChevronDown
                    className={`w-3.5 h-3.5 stroke-[2.5] transition-transform duration-200 ${
                      isPromoSearchOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Promo Popover Dropdown */}
            {isPromoSearchOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Cari promo..."
                    value={promoSearchQuery}
                    onChange={(e) => setPromoSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:bg-white transition-colors"
                  />
                  {promoSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setPromoSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Info */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100 flex-wrap">
                  <span>Filter:</span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-700">
                    Pembeli: {selectedPembeli?.name || idPembeli}
                  </span>
                  <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-medium text-slate-700">
                    Via: {via}
                  </span>
                </div>

                {/* List of Eligible Promos */}
                <div className="max-h-60 overflow-y-auto flex flex-col gap-1.5 pr-1 custom-scrollbar">
                  {filteredPromos.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center gap-1.5">
                      <p className="font-semibold text-slate-600">Tidak ada promo yang tersedia</p>
                      <p className="text-[11px] text-slate-400 max-w-xs">
                        Promo hanya muncul jika sesuai dengan Target Pembeli, Channel Via ({via}), dan tidak melebihi Limit Promo.
                      </p>
                    </div>
                  ) : (
                    filteredPromos.map((promo) => {
                      const isCurrent = selectedPromo?.id === promo.id;
                      return (
                        <div
                          key={promo.id}
                          onClick={() => handleSelectPromo(promo)}
                          className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors border ${
                            isCurrent
                              ? 'bg-rose-50/70 border-rose-200'
                              : 'hover:bg-slate-50 border-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                              %
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-800 truncate">
                                  {promo.namaPromo}
                                </span>
                                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                                  {promo.subtitle}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                <span>Limit: {promo.limitPromo || 'Tidak ada limit'}</span>
                                {promo.channels && promo.channels.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>Channel: {promo.channels.slice(0, 2).join(', ')}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0 ml-2">
                            {isCurrent ? (
                              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-rose-500 text-white flex items-center gap-1">
                                <Check className="w-3 h-3 stroke-[3]" /> Terpilih
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-[11px] font-semibold text-[#008d91] bg-teal-50 hover:bg-[#008d91] hover:text-white rounded-lg transition-colors">
                                Gunakan
                              </span>
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
        </div>

        {/* 8. Item S-SALUR */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal pt-2">
            Item S-SALUR
          </label>
          <div className="md:col-span-9 flex flex-col gap-3">
            {/* Search Button / Trigger Field */}
            <div className="max-w-md relative" ref={itemSearchRef}>
              <div
                id="btn-search-item-salur"
                onClick={() => setIsItemSearchOpen(!isItemSearchOpen)}
                className={`w-full bg-white border rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-700 cursor-pointer flex items-center justify-between transition-colors shadow-2xs ${
                  isItemSearchOpen
                    ? 'border-[#008d91] ring-1 ring-[#008d91]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 text-slate-400">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Search Item S-SALUR...</span>
                </div>
                <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0">
                  <ChevronDown
                    className={`w-3.5 h-3.5 stroke-[2.5] transition-transform duration-200 ${
                      isItemSearchOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Dropdown Popover */}
              {isItemSearchOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150">
                  {/* Search Input with Clear Button */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Cari judul buku atau kode..."
                      value={itemQuery}
                      onChange={(e) => setItemQuery(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:bg-white transition-colors"
                    />
                    {itemQuery && (
                      <button
                        type="button"
                        onClick={() => setItemQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* List of Products */}
                  <div className="max-h-64 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
                    {filteredProducts.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        Tidak ada buku atau item yang cocok
                      </div>
                    ) : (
                      filteredProducts.map((prod) => {
                        const existing = transactionItems.find(
                          (ti) => ti.productId === prod.id || ti.title === prod.title
                        );
                        return (
                          <div
                            key={prod.id}
                            onClick={() => handleSelectItemProduct(prod)}
                            className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                              existing
                                ? 'bg-teal-50/70 border border-teal-200'
                                : 'hover:bg-slate-50 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <BookCover coverKey={prod.coverKey} size="sm" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-semibold text-slate-800 truncate">
                                  {prod.title}
                                </span>
                                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                  {(() => {
                                    const disc = calculateItemPromoPrice(prod.title, prod.price, selectedPromo);
                                    const isDiscounted = selectedPromo && disc.price !== prod.price;
                                    return isDiscounted ? (
                                      <>
                                        <span className="text-slate-400 line-through">
                                          Rp{prod.price.toLocaleString('id-ID')}
                                        </span>
                                        <span className="font-bold text-rose-600">
                                          Rp{disc.price.toLocaleString('id-ID')}
                                        </span>
                                        <span className="text-[9px] font-bold text-rose-500 bg-rose-50 border border-rose-200 px-1 py-0.2 rounded">
                                          {disc.promoDiscountText}
                                        </span>
                                      </>
                                    ) : (
                                      <span>Rp{prod.price.toLocaleString('id-ID')}</span>
                                    );
                                  })()}
                                  <span className="text-slate-300">•</span>
                                  <span className="text-slate-400">Stok: {prod.stock || 100}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              {existing ? (
                                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#008d91] text-white flex items-center gap-1">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                  <span>{existing.quantity}x</span>
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

            {/* List item s-salur yang terpilih di bawahnya (hanya tampil jika sudah ada yang dipilih) */}
            {transactionItems.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {transactionItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#f0f4f8] rounded-2xl p-2.5 border border-slate-200/70 flex items-center gap-3 shadow-2xs"
                >
                  <BookCover coverKey={item.coverKey} size="md" />

                  <div className="flex flex-col min-w-[120px] max-w-[190px]">
                    <span className="text-xs font-semibold text-slate-800 leading-tight truncate">
                      {item.title}
                    </span>
                    {item.originalPrice && item.originalPrice !== item.price ? (
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span className="text-[11px] text-slate-400 line-through">
                          Rp{item.originalPrice.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[11px] font-bold text-rose-600">
                          Rp{item.price.toLocaleString('id-ID')}
                        </span>
                        {item.promoDiscountText && (
                          <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-1 py-0.2 rounded">
                            {item.promoDiscountText}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 mt-0.5">
                        Rp{item.price.toLocaleString('id-ID')}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 mt-1">Stok: 100</span>
                  </div>

                  {/* Quantity Stepper: - 1 + and remove x */}
                  <div className="flex items-center gap-1.5 ml-2">
                    {/* Minus button */}
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className="w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Minus className="w-3 h-3 stroke-[2.5]" />
                    </button>

                    {/* Quantity Display Box */}
                    <div className="w-7 h-5 rounded bg-white border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center">
                      {item.quantity}
                    </div>

                    {/* Plus button */}
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                    </button>

                    {/* Remove cross */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      title="Hapus"
                      className="ml-1 text-[#008d91] hover:text-red-500 transition-colors p-0.5 cursor-pointer"
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

        {/* 8. Jenis Ekspedisi */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Jenis Ekspedisi
          </label>
          <div className="md:col-span-9 max-w-md relative">
            <select
              value={jenisEkspedisi}
              onChange={(e) => setJenisEkspedisi(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] cursor-pointer"
            >
              <option value="">Search...</option>
              <option value="TIKI ECO">TIKI ECO</option>
              <option value="TIKI ONS">TIKI ONS</option>
              <option value="JNE REG">JNE REG</option>
              <option value="SiCepat Gokil">SiCepat Gokil</option>
              <option value="J&T Express">J&T Express</option>
              <option value="Anteraja">Anteraja</option>
              <option value="Ambil Sendiri">Ambil Sendiri</option>
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* 9. Ongkos Kirim */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Ongkos Kirim{transactionItems.length > 0 ? ` (${totalWeightDisplay})` : ''}
          </label>
          <div className="md:col-span-9 max-w-md relative flex items-center">
            <span className="absolute left-4 font-bold text-xs sm:text-sm text-[#008d91]">
              Rp
            </span>
            <input
              type="text"
              placeholder="Input Nominal..."
              value={ongkosKirim}
              onChange={(e) => setOngkosKirim(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91]"
            />
          </div>
        </div>

        {/* 10. Donasi */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Donasi
          </label>
          <div className="md:col-span-9 max-w-md relative flex items-center">
            <span className="absolute left-4 font-bold text-xs sm:text-sm text-[#008d91]">
              Rp
            </span>
            <input
              type="text"
              placeholder="Input Nominal..."
              value={donasi}
              onChange={(e) => setDonasi(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91]"
            />
          </div>
        </div>

        {/* 11. Keterangan Donasi */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Keterangan Donasi
          </label>
          <div className="md:col-span-9 max-w-md relative">
            <select
              value={keteranganDonasi}
              onChange={(e) => setKeteranganDonasi(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] cursor-pointer"
            >
              <option value="">Search...</option>
              <option value="Donasi Umum">Donasi Umum</option>
              <option value="Donasi Cetak Buku">Donasi Cetak Buku</option>
              <option value="Donasi Operasional Proyek">Donasi Operasional Proyek</option>
              <option value="Dana Punna Meditasi">Dana Punna Meditasi</option>
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* 12. Kode Unik */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Kode Unik
          </label>
          <div className="md:col-span-9 max-w-md relative flex items-center">
            <span className="absolute left-4 font-bold text-xs sm:text-sm text-[#008d91]">
              Rp
            </span>
            <input
              type="text"
              placeholder="Input Nominal..."
              value={kodeUnik}
              onChange={(e) => setKodeUnik(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91]"
            />
          </div>
        </div>

        {/* 13. Rekomendasi Cross-Selling */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal pt-2">
            Rekomendasi Cross-Selling:
          </label>
          <div className="md:col-span-9 flex flex-wrap items-center gap-3">
            {CROSS_SELLING_BOOKS.map((book) => (
              <div
                key={book.id}
                className="w-36 bg-[#f0f4f8] rounded-2xl p-3 border border-slate-200/70 flex flex-col items-center justify-between min-h-[190px] shadow-2xs"
              >
                <BookCover coverKey={book.coverKey} size="md" className="mb-2" />

                <div className="w-full text-left">
                  <h4 className="text-[11.5px] font-bold text-slate-800 leading-snug line-clamp-2">
                    {book.title}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                    Rp{book.price.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="w-full flex items-center justify-between mt-3 pt-1 border-t border-slate-200/50">
                  <span className="px-2.5 py-0.5 text-[10px] font-medium rounded-full bg-slate-200 text-slate-600">
                    {book.category}
                  </span>

                  {/* Add button */}
                  <button
                    type="button"
                    onClick={() => handleAddCrossSelling(book)}
                    title={`Tambah ${book.title}`}
                    className="w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            ))}

            {/* Share / Send icon on right */}
            <div className="pl-1">
              <button
                type="button"
                title="Kirim Rekomendasi ke Pembeli"
                onClick={() => onShowToast('Rekomendasi buku siap dikirim ke pembeli')}
                className="text-[#008d91] hover:text-[#05828e] p-1 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
          </div>
        </div>

        {/* 14. Keterangan */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Keterangan
          </label>
          <div className="md:col-span-9 max-w-md">
            <input
              type="text"
              placeholder="Input Text..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91]"
            />
          </div>
        </div>

        {/* 15. Proyek SAPA */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Proyek SAPA
          </label>
          <div className="md:col-span-9 max-w-md relative">
            <select
              value={proyekSapa}
              onChange={(e) => setProyekSapa(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] cursor-pointer"
            >
              <option value="">Search...</option>
              <option value="Kajian Dhamma & Meditasi Bersama">Kajian Dhamma & Meditasi Bersama</option>
              <option value="Bazar Amal Waisak 2024">Bazar Amal Waisak 2024</option>
              <option value="Penerbitan Buku Dharma S-SALUR">Penerbitan Buku Dharma S-SALUR</option>
              <option value="Bakti Sosial Peduli Sesama">Bakti Sosial Peduli Sesama</option>
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* 16. Invoice */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Invoice
          </label>
          <div className="md:col-span-9 max-w-md">
            {/* Clean empty field matching screenshot */}
            <div className="h-6" />
          </div>
        </div>

        {/* 17. Bottom Actions on Right matching Image 2 */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-2.5 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-600 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="px-8 py-2.5 rounded-full border border-[#008d91] text-[#008d91] hover:bg-[#008d91]/5 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="px-8 py-2.5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
          >
            Save & Kirim
          </button>
        </div>
      </div>
    </div>
  );
};
