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
  Gift,
  PlusCircle,
} from 'lucide-react';
import {
  INITIAL_BOOKS,
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
import { formatDatePickerValue } from '../utils/datePickerHelper';
import { OrganisasiItem, ProjectItem } from '../types';
import { INITIAL_ORGANISASI } from '../organisasiData';

export interface FormTransaksiSalurHadiahProps {
  project: ProjectItem | null;
  projects: ProjectItem[];
  identitasList?: IdentitasItem[];
  organisasiList?: OrganisasiItem[];
  existingOrders?: SalurOrder[];
  onCancel: () => void;
  onSave: (
    newOrder: Partial<SalurOrder>,
    sendNow: boolean,
    pengeluaranData: {
      nominal: number;
      keterangan: string;
      jenisPengeluaranHadiah: string;
      proyekSapa: string;
      tanggal: string;
    }
  ) => void;
  onShowToast: (message: string) => void;
}

const DEFAULT_JENIS_HADIAH = ['hadiah donatur', 'hadiah pembicara'];
const STORAGE_KEY_JENIS_HADIAH = 'yppln_jenis_pengeluaran_hadiah_list';

export const FormTransaksiSalurHadiah: React.FC<FormTransaksiSalurHadiahProps> = ({
  project,
  projects,
  identitasList = INITIAL_IDENTITAS,
  organisasiList = INITIAL_ORGANISASI,
  existingOrders = [],
  onCancel,
  onSave,
  onShowToast,
}) => {
  // Auto input Tanggal from selected project or default
  const [tanggal, setTanggal] = useState<string>(() => {
    if (project?.tanggal) return project.tanggal;
    return '15 Nov 2021';
  });

  // Via S-SALUR
  const [via, setVia] = useState<string>('CC');

  // Identitas / Organisasi Penerima
  const [penerimaSearch, setPenerimaSearch] = useState('');
  const [isPenerimaOpen, setIsPenerimaOpen] = useState(false);
  const [selectedPenerimaCode, setSelectedPenerimaCode] = useState<string>('10001 Lilo');
  const penerimaRef = useRef<HTMLDivElement>(null);

  // Address selection
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr-1');
  const availableAddresses: SalurAddress[] = useMemo(() => {
    return [
      {
        id: 'addr-1',
        title: 'Alamat 1',
        recipientName: 'Lilo',
        phone: '0812-234-569',
        fullAddress: 'Jl. Ahmad Batahar Carry No. 123, kel. ABC, kec. ABC, Kota, Provinsi',
      },
      {
        id: 'addr-2',
        title: 'Alamat 2',
        recipientName: 'Lilo',
        phone: '0812-234-567',
        fullAddress: 'Jl. Ahmad Batahar Carry No. 123, kel. ABC, kec. ABC, Kota, Provinsi',
      },
    ];
  }, []);

  // Transaksi Items (initial matching image: 3 books)
  const [transactionItems, setTransactionItems] = useState<SalurOrderItem[]>([
    {
      id: 'tx-1',
      productId: 'book-1',
      title: 'Jalan Menuju Kemahatahuan',
      price: 125000,
      quantity: 1,
      coverKey: 'jalan-menuju',
    },
    {
      id: 'tx-2',
      productId: 'book-2',
      title: 'Demi Kepentingan Semua Makhluk',
      price: 89000,
      quantity: 1,
      coverKey: 'demi-kepentingan',
    },
    {
      id: 'tx-3',
      productId: 'book-3',
      title: 'Menjadi Buddha di Tempat Kerja',
      price: 125000,
      quantity: 1,
      coverKey: 'menjadi-buddha',
    },
  ]);

  // Jenis Ekspedisi
  const [jenisEkspedisi, setJenisEkspedisi] = useState<string>('TIKI ECO');

  // Jenis Pengeluaran Hadiah
  const [jenisHadiahOptions, setJenisHadiahOptions] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_JENIS_HADIAH);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return Array.from(new Set([...DEFAULT_JENIS_HADIAH, ...parsed]));
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_JENIS_HADIAH;
  });

  const [jenisPengeluaranHadiah, setJenisPengeluaranHadiah] = useState<string>('hadiah donatur');
  const [isAddJenisModalOpen, setIsAddJenisModalOpen] = useState<boolean>(false);
  const [newJenisInput, setNewJenisInput] = useState<string>('');

  // Proyek SAPA - Auto input from selected project
  const [proyekSapa, setProyekSapa] = useState<string>(() => {
    if (project?.namaKegiatan) return project.namaKegiatan;
    return projects[0]?.namaKegiatan || 'Kajian Dhamma & Meditasi Bersama';
  });

  // Keterangan
  const [keterangan, setKeterangan] = useState<string>('');

  // Catalog modal to add more books
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState<boolean>(false);
  const [bookSearchQuery, setBookSearchQuery] = useState<string>('');

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (penerimaRef.current && !penerimaRef.current.contains(e.target as Node)) {
        setIsPenerimaOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recipient list combined from identitas & organisasi
  const recipientEntities = useMemo(() => {
    const idItems = identitasList.map((it, idx) => ({
      code: it.codeId || `1000${idx + 1}`,
      name: it.namaLengkap || 'Penerima',
      phone: it.nomorHandPhone || '0812-000-000',
      type: 'Identitas',
    }));
    const orgItems = organisasiList.map((org, idx) => ({
      code: `ORG-${idx + 1}`,
      name: org.namaOrg || 'Organisasi',
      phone: org.hp || '0812-000-000',
      type: 'Organisasi',
    }));
    return [...idItems, ...orgItems];
  }, [identitasList, organisasiList]);

  const filteredRecipients = useMemo(() => {
    if (!penerimaSearch.trim()) return recipientEntities;
    const q = penerimaSearch.toLowerCase();
    return recipientEntities.filter(
      (r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || r.phone.includes(q)
    );
  }, [recipientEntities, penerimaSearch]);

  const selectedRecipient = useMemo(() => {
    return (
      recipientEntities.find((r) => `${r.code} ${r.name}` === selectedPenerimaCode) ||
      recipientEntities.find((r) => r.code === selectedPenerimaCode) || {
        code: '10001',
        name: 'Lilo',
        phone: '0812-258-1235',
        type: 'Identitas',
      }
    );
  }, [recipientEntities, selectedPenerimaCode]);

  // Stepper handlers
  const handleQuantityChange = (id: string, delta: number) => {
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
    onShowToast('Buku dihapus dari Item Hadiah');
  };

  const handleAddBookToTransaction = (book: SalurProduct) => {
    const existing = transactionItems.find((item) => item.productId === book.id);
    if (existing) {
      handleQuantityChange(existing.id, 1);
      onShowToast(`Kuantitas "${book.title}" bertambah (+1)`);
    } else {
      const newItem: SalurOrderItem = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        productId: book.id,
        title: book.title,
        price: book.price,
        quantity: 1,
        coverKey: book.coverKey,
      };
      setTransactionItems((prev) => [...prev, newItem]);
      onShowToast(`"${book.title}" ditambahkan ke Hadiah`);
    }
  };

  const handleAddNewJenisHadiah = () => {
    const trimmed = newJenisInput.trim().toLowerCase();
    if (!trimmed) {
      onShowToast('Nama jenis pengeluaran hadiah tidak boleh kosong');
      return;
    }
    if (jenisHadiahOptions.includes(trimmed)) {
      setJenisPengeluaranHadiah(trimmed);
      setIsAddJenisModalOpen(false);
      setNewJenisInput('');
      onShowToast(`Jenis "${trimmed}" sudah ada dan dipilih`);
      return;
    }
    const updated = [...jenisHadiahOptions, trimmed];
    setJenisHadiahOptions(updated);
    setJenisPengeluaranHadiah(trimmed);
    try {
      localStorage.setItem(STORAGE_KEY_JENIS_HADIAH, JSON.stringify(updated));
    } catch {
      // ignore
    }
    setIsAddJenisModalOpen(false);
    setNewJenisInput('');
    onShowToast(`Jenis hadiah "${trimmed}" berhasil ditambahkan!`);
  };

  // Save submission
  const handleSubmit = (sendNow: boolean = false) => {
    if (transactionItems.length === 0) {
      onShowToast('Pilih minimal 1 item buku untuk hadiah!');
      return;
    }

    const itemsTotal = transactionItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
    const ongkirNum = 15000;
    const totalCost = itemsTotal + ongkirNum;

    const selectedAddr =
      availableAddresses.find((a) => a.id === selectedAddressId) || availableAddresses[0];

    const targetDate = tanggal || '15 Nov 2021';
    const cleanVia = normalizeVia(via);
    const nextSeq = getUrutanTransaksiPerTahun(existingOrders, targetDate);
    const { orderNumber } = generateSalurOrderNumber(
      cleanVia,
      targetDate,
      nextSeq
    );

    const recipientText = `${selectedRecipient.code} ${selectedRecipient.name}`;

    const newOrder: Partial<SalurOrder> = {
      orderNumber,
      via: cleanVia,
      customerId: recipientText,
      customerCode: recipientText,
      idPembeli: recipientText,
      idPenerima: recipientText,
      date: tanggal || '15 Nov 2021',
      paymentStatus: 'Paid',
      shippingStatus: sendNow ? 'Sudah Dikirim' : 'Belum dikirim',
      statusBadges: ['Paid', 'Hadiah'],
      items: transactionItems,
      alamat: {
        recipientName: selectedAddr.recipientName,
        phone: selectedAddr.phone,
        street: selectedAddr.fullAddress,
        cityProvince: 'Jawa Barat, Indonesia',
        postalCode: '12345',
      },
      ekspedisi: {
        name: jenisEkspedisi.trim(),
        noResi: '-',
        isShipped: sendNow,
      },
      costBreakdown: {
        ongkir: undefined,
      },
      totalDana: `Rp${totalCost.toLocaleString('id-ID')}`,
      keterangan: keterangan
        ? `[Hadiah - ${jenisPengeluaranHadiah}] ${keterangan}`
        : `Hadiah ${jenisPengeluaranHadiah} untuk ${recipientText}`,
      proyekSapa: proyekSapa,
      jenisPengeluaranHadiah: jenisPengeluaranHadiah,
      isHadiah: true,
    };

    onSave(newOrder, sendNow, {
      nominal: totalCost,
      keterangan: `Hadiah ${jenisPengeluaranHadiah} (${proyekSapa}): ${transactionItems
        .map((t) => `${t.title} (${t.quantity}x)`)
        .join(', ')}${keterangan ? ` - ${keterangan}` : ''}`,
      jenisPengeluaranHadiah,
      proyekSapa,
      tanggal,
    });
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-800 animate-in fade-in duration-200">
      {/* Top Toolbar matching Image */}
      <div className="flex items-center justify-end gap-3">
        {/* Eye Off Icon */}
        <button
          id="btn-hadiah-privacy"
          type="button"
          title="Sembunyikan Kolom"
          onClick={() => onShowToast('Mode privasi tampilan')}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <EyeOff className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Search Icon */}
        <button
          id="btn-hadiah-search"
          type="button"
          title="Cari"
          onClick={() => setIsAddBookModalOpen(true)}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* Sliders Icon */}
        <button
          id="btn-hadiah-filters"
          type="button"
          title="Filter & Pengaturan"
          onClick={() => onShowToast('Pengaturan formulir hadiah')}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
        </button>

        {/* + Add Button */}
        <button
          id="btn-hadiah-add-item"
          type="button"
          title="Tambah Buku Hadiah"
          onClick={() => setIsAddBookModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-sm px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Main Form Container matching exact layout in image */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-10 flex flex-col gap-5">
        {/* 1. Tanggal */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Tanggal
          </label>
          <div className="md:col-span-9 max-w-md relative">
            <input
              id="input-hadiah-tanggal"
              type="text"
              placeholder="Input Date..."
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91]"
            />
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const d = now.getDate();
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                const m = months[now.getMonth()];
                const y = now.getFullYear();
                setTanggal(`${d} ${m} ${y}`);
              }}
              title="Set Tanggal Hari Ini"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#008d91] hover:text-[#05828e]"
            >
              <Calendar className="w-4 h-4" />
            </button>
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

        {/* 2. Via S-SALUR */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Via S-SALUR
          </label>
          <div className="md:col-span-9 max-w-md relative">
            <select
              id="select-hadiah-via"
              value={via}
              onChange={(e) => setVia(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] cursor-pointer"
            >
              <option value="CC">CC</option>
              <option value="WA">WA</option>
              <option value="Web">Web</option>
              <option value="Tokopedia">Tokopedia</option>
              <option value="Shopee">Shopee</option>
              <option value="Direct">Direct</option>
              <option value="Admin">Admin</option>
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* 3. Identitas/Organisasi ID Penerima */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Identitas/Organisasi ID Penerima
          </label>
          <div className="md:col-span-9 max-w-md relative" ref={penerimaRef}>
            <div
              id="select-hadiah-penerima"
              onClick={() => setIsPenerimaOpen(!isPenerimaOpen)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-[#008d91] flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="font-semibold text-slate-800">
                  {selectedRecipient.code} {selectedRecipient.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-50 text-[#008d91] border border-teal-200">
                  {selectedRecipient.type}
                </span>
              </div>
              <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 ml-2">
                <ChevronDown
                  className={`w-3.5 h-3.5 stroke-[2.5] transition-transform duration-200 ${
                    isPenerimaOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>

            {/* Dropdown Popover */}
            {isPenerimaOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Cari penerima atau nomor HP..."
                    value={penerimaSearch}
                    onChange={(e) => setPenerimaSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91]"
                  />
                </div>
                <div className="flex flex-col divide-y divide-slate-100">
                  {filteredRecipients.map((r) => (
                    <button
                      key={`${r.code}-${r.name}`}
                      type="button"
                      onClick={() => {
                        setSelectedPenerimaCode(`${r.code} ${r.name}`);
                        setIsPenerimaOpen(false);
                      }}
                      className="text-left py-2 px-2 hover:bg-slate-50 flex items-center justify-between transition-colors rounded-lg"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-slate-800">
                          {r.code} {r.name}
                        </span>
                        <span className="text-[11px] text-slate-400">{r.phone}</span>
                      </div>
                      <span className="text-[10px] text-teal-600 font-medium">{r.type}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Alamat Penerima matching exact Image */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal pt-2">
            Alamat Penerima
          </label>
          <div className="md:col-span-9 flex flex-wrap items-center gap-3">
            {availableAddresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <div
                  key={addr.id}
                  id={`card-address-${addr.id}`}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`relative w-full sm:w-64 bg-[#f8fafc] rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between min-h-[110px] ${
                    isSelected
                      ? 'border-[#008d91] ring-1 ring-[#008d91]/20 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">
                      {addr.title}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-3">
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
            })}

            {/* Address action buttons matching image (Chevron right & Send icon) */}
            <div className="flex items-center gap-2 pl-1">
              <button
                id="btn-hadiah-address-more"
                type="button"
                title="Alamat Lainnya"
                onClick={() => onShowToast('Menampilkan daftar alamat lainnya')}
                className="w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center hover:bg-[#05828e] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <button
                id="btn-hadiah-address-send"
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

        {/* 5. Transaksi (Selected Items Horizontal Row matching Image) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal pt-2">
            Transaksi
          </label>
          <div className="md:col-span-9 flex flex-wrap items-center gap-3">
            {transactionItems.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 flex items-center gap-2">
                <span>Belum ada buku dipilih.</span>
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(true)}
                  className="text-[#008d91] font-semibold hover:underline"
                >
                  + Tambah Buku
                </button>
              </div>
            ) : (
              transactionItems.map((item) => (
                <div
                  key={item.id}
                  id={`item-hadiah-${item.id}`}
                  className="bg-[#f0f4f8] rounded-2xl p-2.5 border border-slate-200/70 flex items-center gap-3 shadow-2xs"
                >
                  <BookCover coverKey={item.coverKey} size="md" />

                  <div className="flex flex-col min-w-[120px] max-w-[160px]">
                    <span className="text-xs font-semibold text-slate-800 leading-tight truncate">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Rp{item.price.toLocaleString('id-ID')}
                    </span>
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
              ))
            )}
          </div>
        </div>

        {/* 6. Jenis Ekspedisi */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Jenis Ekspedisi
          </label>
          <div className="md:col-span-9 max-w-md relative">
            <select
              id="select-hadiah-ekspedisi"
              value={jenisEkspedisi}
              onChange={(e) => setJenisEkspedisi(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] cursor-pointer"
            >
              <option value="TIKI ECO">TIKI ECO</option>
              <option value="TIKI ONS">TIKI ONS</option>
              <option value="JNE REG">JNE REG</option>
              <option value="JNE YES">JNE YES</option>
              <option value="SiCepat REG">SiCepat REG</option>
              <option value="J&T Express">J&T Express</option>
              <option value="Pos Indonesia">Pos Indonesia</option>
              <option value="Ambil Sendiri">Ambil Sendiri</option>
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* 7. Jenis Pengeluaran Hadiah matching exact user prompt requirement */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Jenis Pengeluaran Hadiah
          </label>
          <div className="md:col-span-9 max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <select
                id="select-hadiah-jenis-pengeluaran"
                value={jenisPengeluaranHadiah}
                onChange={(e) => {
                  if (e.target.value === '__add_new__') {
                    setIsAddJenisModalOpen(true);
                  } else {
                    setJenisPengeluaranHadiah(e.target.value);
                  }
                }}
                className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] cursor-pointer"
              >
                {jenisHadiahOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
                <option value="__add_new__">+ Tambah Jenis Baru...</option>
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            <button
              id="btn-tambah-opsi-jenis-hadiah"
              type="button"
              onClick={() => setIsAddJenisModalOpen(true)}
              title="Tambah Opsi Jenis Pengeluaran Hadiah"
              className="px-3 py-2 bg-slate-100 hover:bg-teal-50 hover:text-[#008d91] text-slate-600 rounded-xl border border-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Opsi</span>
            </button>
          </div>
        </div>

        {/* 8. Proyek SAPA - Auto input matching requirement */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Proyek SAPA
          </label>
          <div className="md:col-span-9 max-w-md relative">
            <select
              id="select-hadiah-proyek-sapa"
              value={proyekSapa}
              onChange={(e) => setProyekSapa(e.target.value)}
              className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.namaKegiatan}>
                  {p.namaKegiatan}
                </option>
              ))}
              {!projects.some((p) => p.namaKegiatan === proyekSapa) && (
                <option value={proyekSapa}>{proyekSapa}</option>
              )}
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* 9. Keterangan */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Keterangan
          </label>
          <div className="md:col-span-9 max-w-md">
            <input
              id="input-hadiah-keterangan"
              type="text"
              placeholder="Input Text..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91]"
            />
          </div>
        </div>

        {/* Bottom Actions on Right matching exact image */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <button
            id="btn-hadiah-cancel"
            type="button"
            onClick={onCancel}
            className="px-8 py-2.5 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-600 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="btn-hadiah-save"
            type="button"
            onClick={() => handleSubmit(false)}
            className="px-8 py-2.5 rounded-full border border-[#008d91] text-[#008d91] hover:bg-[#008d91]/5 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Save
          </button>
          <button
            id="btn-hadiah-save-kirim"
            type="button"
            onClick={() => handleSubmit(true)}
            className="px-8 py-2.5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
          >
            Save & Kirim
          </button>
        </div>
      </div>

      {/* Modal: Tambah Opsi Jenis Pengeluaran Hadiah */}
      {isAddJenisModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div
            id="modal-add-jenis-hadiah"
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#008d91]" />
                Tambah Jenis Pengeluaran Hadiah
              </h3>
              <button
                type="button"
                onClick={() => setIsAddJenisModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Masukkan nama jenis pengeluaran hadiah baru (misalnya: hadiah pembicara, hadiah donatur, hadiah relawan, dll).
            </p>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">Nama Jenis Hadiah</label>
              <input
                type="text"
                autoFocus
                placeholder="Contoh: hadiah relawan"
                value={newJenisInput}
                onChange={(e) => setNewJenisInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddNewJenisHadiah();
                }}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#008d91]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddJenisModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAddNewJenisHadiah}
                className="px-5 py-2 rounded-xl text-xs font-medium bg-[#008d91] hover:bg-[#05828e] text-white shadow-xs"
              >
                Simpan Opsi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah Buku / Item Hadiah dari Katalog */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div
            id="modal-add-book-catalog"
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[85vh] shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                  Pilih Buku S-SALUR untuk Hadiah
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-[#008d91] font-medium">
                  {INITIAL_BOOKS.length} Buku Tersedia
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddBookModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari judul buku atau penulis..."
                value={bookSearchQuery}
                onChange={(e) => setBookSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-[#008d91]"
              />
            </div>

            {/* Books List Grid */}
            <div className="overflow-y-auto max-h-[50vh] grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
              {INITIAL_BOOKS.filter((b) =>
                bookSearchQuery ? b.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) : true
              ).map((b) => {
                const isAlreadySelected = transactionItems.some((it) => it.productId === b.id);
                return (
                  <div
                    key={b.id}
                    className="p-3 border border-slate-200 rounded-xl flex items-center gap-3 hover:border-[#008d91] transition-all bg-white shadow-2xs"
                  >
                    <BookCover coverKey={b.coverKey} size="md" />
                    <div className="flex-1 flex flex-col min-w-0">
                      <span className="font-bold text-xs text-slate-800 truncate">{b.title}</span>
                      <span className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        Rp{b.price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-slate-400">Stok: {b.stock}</span>
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleAddBookToTransaction(b);
                          }}
                          className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors flex items-center gap-1 ${
                            isAlreadySelected
                              ? 'bg-teal-50 text-[#008d91] border border-teal-200 hover:bg-teal-100'
                              : 'bg-[#008d91] text-white hover:bg-[#05828e]'
                          }`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>{isAlreadySelected ? 'Tambah (+1)' : 'Pilih Buku'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddBookModalOpen(false)}
                className="px-6 py-2 rounded-xl text-xs font-medium bg-[#008d91] text-white hover:bg-[#05828e]"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
