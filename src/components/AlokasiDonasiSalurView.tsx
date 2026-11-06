import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  PackageCheck,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  Truck,
  Building2,
  User,
  Phone,
  MapPin,
  Tag,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Receipt,
  FileText,
  Calendar,
  ChevronDown,
  Check,
  Sparkles,
} from 'lucide-react';
import { ItemDonasiEvent, ItemDonasiChild } from '../itemDonasiData';
import { SalurProduct, SalurOrder, SalurOrderItem, generateSalurOrderNumber } from '../salurData';
import { IdentitasItem } from '../identitasData';
import {
  AlokasiDonasiSalurRecord,
  AlokasiSalurItemRow,
  loadAlokasiDonasiSalurHistory,
  saveAlokasiDonasiSalurHistory,
} from '../alokasiDonasiSalurData';

interface AlokasiDonasiSalurViewProps {
  itemDonasi: ItemDonasiEvent;
  allItemDonasiEvents: ItemDonasiEvent[];
  selectedChild?: ItemDonasiChild | null;
  salurItems: SalurProduct[];
  identitasList: IdentitasItem[];
  existingSalurOrders: SalurOrder[];
  onSaveAlokasi: (order: SalurOrder, alokasiRecord: AlokasiDonasiSalurRecord) => void;
  onCancel: () => void;
  onNavigateToTransaksiSalur: () => void;
  onShowToast: (msg: string) => void;
}

export const AlokasiDonasiSalurView: React.FC<AlokasiDonasiSalurViewProps> = ({
  itemDonasi: initialItemDonasi,
  allItemDonasiEvents,
  selectedChild,
  salurItems,
  identitasList,
  existingSalurOrders,
  onSaveAlokasi,
  onCancel,
  onNavigateToTransaksiSalur,
  onShowToast,
}) => {
  // Currently selected item donasi event
  const [selectedEvent, setSelectedEvent] = useState<ItemDonasiEvent>(initialItemDonasi);

  // Allocation history
  const [history, setHistory] = useState<AlokasiDonasiSalurRecord[]>(() => {
    return loadAlokasiDonasiSalurHistory();
  });

  // Base Pemasukan Donasi for this event (can be customized or calculated)
  const [pemasukanDonasi, setPemasukanDonasi] = useState<number>(() => {
    if (selectedEvent.id === 'item-donasi-1') return 25000000;
    if (selectedEvent.id === 'item-donasi-2') return 18500000;
    return 15000000;
  });

  // Calculate total pengeluaran from past allocations for this event
  const totalPengeluaranAlokasiLalu = useMemo(() => {
    return history
      .filter((h) => h.itemDonasiId === selectedEvent.id)
      .reduce((acc, curr) => acc + (curr.grandTotal || 0), 0);
  }, [history, selectedEvent.id]);

  // Recipient form state
  const [selectedIdentitasId, setSelectedIdentitasId] = useState<string>('');
  const [namaPenerima, setNamaPenerima] = useState<string>(
    selectedChild ? `Penerima Paket ${selectedChild.name}` : ''
  );
  const [noTelepon, setNoTelepon] = useState<string>('');
  const [alamatLengkap, setAlamatLengkap] = useState<string>('');
  const [kota, setKota] = useState<string>('');
  const [provinsi, setProvinsi] = useState<string>('');
  const [kodePos, setKodePos] = useState<string>('');
  const [catatanPenyaluran, setCatatanPenyaluran] = useState<string>(
    selectedChild
      ? `Alokasi dari ${selectedEvent.name} - ${selectedChild.name} (${selectedChild.description})`
      : `Alokasi bantuan buku Dharma dari program ${selectedEvent.name}`
  );

  // Items to donate
  const [allocatedItems, setAllocatedItems] = useState<AlokasiSalurItemRow[]>(() => {
    const defaultProduct = salurItems[0] || {
      id: 'book-1',
      title: 'Jalan Menuju Kemahatahuan',
      code: 'JMK - 2021',
      price: 125000,
      stock: 100,
    };
    return [
      {
        productId: defaultProduct.id,
        title: defaultProduct.title,
        code: defaultProduct.code || 'JMK - 2021',
        coverKey: defaultProduct.coverKey || 'jalan-menuju',
        price: defaultProduct.price || 125000,
        quantity: 10,
        needDiscount: false,
        discountType: 'percentage',
        discountValue: 0,
        discountReason: '',
        subtotal: (defaultProduct.price || 125000) * 10,
      },
    ];
  });

  // Shipping (ongkir) state
  const [ekspedisi, setEkspedisi] = useState<string>('TIKI ECO');
  const [ongkirBiaya, setOngkirBiaya] = useState<number>(45000);
  const [ongkirKeterangan, setOngkirKeterangan] = useState<string>('Estimasi paket buku 8kg');

  // Handle Identitas selection
  const handleSelectIdentitas = (id: string) => {
    setSelectedIdentitasId(id);
    if (!id) return;
    const found = identitasList.find((i) => i.id === id);
    if (found) {
      setNamaPenerima(found.namaLengkap || found.namaPanggilan || '');
      setNoTelepon(found.nomorHp || '');
      setAlamatLengkap(found.alamat || found.kotaKabupaten || '');
      setKota(found.kotaKabupaten || '');
      setProvinsi(found.provinsi || '');
    }
  };

  // Add Item row
  const handleAddItemRow = () => {
    const defaultProduct = salurItems[0];
    const newRow: AlokasiSalurItemRow = {
      productId: defaultProduct ? defaultProduct.id : `book-${Date.now()}`,
      title: defaultProduct ? defaultProduct.title : 'Item S-SALUR',
      code: defaultProduct?.code || 'SS-01',
      coverKey: defaultProduct?.coverKey || 'jalan-menuju',
      price: defaultProduct ? defaultProduct.price : 100000,
      quantity: 5,
      needDiscount: false,
      discountType: 'percentage',
      discountValue: 0,
      discountReason: '',
      subtotal: (defaultProduct ? defaultProduct.price : 100000) * 5,
    };
    setAllocatedItems((prev) => [...prev, newRow]);
  };

  // Remove Item row
  const handleRemoveItemRow = (index: number) => {
    if (allocatedItems.length <= 1) {
      onShowToast('Minimal satu item S-SALUR harus dipilih.');
      return;
    }
    setAllocatedItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update item row field
  const handleUpdateItemRow = (index: number, updates: Partial<AlokasiSalurItemRow>) => {
    setAllocatedItems((prev) => {
      const next = [...prev];
      const target = { ...next[index], ...updates };

      // If productId changed, update title & base price
      if (updates.productId) {
        const prod = salurItems.find((p) => p.id === updates.productId);
        if (prod) {
          target.title = prod.title;
          target.code = prod.code || '';
          target.price = prod.price;
          target.coverKey = prod.coverKey || 'jalan-menuju';
        }
      }

      // Recompute subtotal
      const qty = Math.max(1, target.quantity || 1);
      const unitPrice = target.price || 0;
      let cutPerUnit = 0;

      if (target.needDiscount) {
        if (target.discountType === 'percentage') {
          const pct = Math.min(100, Math.max(0, target.discountValue || 0));
          cutPerUnit = (unitPrice * pct) / 100;
        } else {
          // Nominal cut per unit
          cutPerUnit = Math.min(unitPrice, Math.max(0, target.discountValue || 0));
        }
      }

      const netUnitPrice = Math.max(0, unitPrice - cutPerUnit);
      target.subtotal = netUnitPrice * qty;

      next[index] = target;
      return next;
    });
  };

  // Calculations for current allocation
  const totalBukuNormal = useMemo(() => {
    return allocatedItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  }, [allocatedItems]);

  const totalBukuNet = useMemo(() => {
    return allocatedItems.reduce((acc, item) => acc + (item.subtotal || 0), 0);
  }, [allocatedItems]);

  const totalPotonganHarga = Math.max(0, totalBukuNormal - totalBukuNet);
  const grandTotalAlokasi = totalBukuNet + (ongkirBiaya || 0);

  // Remaining budget
  const sisaSaldoSebelumnya = Math.max(0, pemasukanDonasi - totalPengeluaranAlokasiLalu);
  const sisaSaldoSetelahAlokasi = sisaSaldoSebelumnya - grandTotalAlokasi;
  const isSaldoCukup = sisaSaldoSetelahAlokasi >= 0;

  // Validation & Submit to Transaksi S-SALUR
  const handleKonfirmasiAlokasi = () => {
    if (!namaPenerima.trim()) {
      onShowToast('Mohon isi nama penerima donasi.');
      return;
    }

    if (allocatedItems.length === 0) {
      onShowToast('Pilih minimal satu item S-SALUR yang ingin didanakan.');
      return;
    }

    // Generate Salur Order Number
    const nextSeq = existingSalurOrders.length + 1;
    const todayStr = '15 Nov 2021';
    const gen = generateSalurOrderNumber('DNS', todayStr, nextSeq);

    // Map items to SalurOrderItem format
    const salurOrderItems: SalurOrderItem[] = allocatedItems.map((item, idx) => ({
      id: `salur-item-${Date.now()}-${idx}`,
      productId: item.productId,
      title: item.title,
      price: item.needDiscount
        ? Math.round(item.subtotal / (item.quantity || 1))
        : item.price,
      quantity: item.quantity,
      coverKey: (item.coverKey as any) || 'jalan-menuju',
    }));

    // Create SalurOrder
    const newSalurOrder: SalurOrder = {
      id: `order-salur-${Date.now()}`,
      orderNumber: gen.orderNumber,
      via: 'DNS',
      customerId: `D-DONASI: ${selectedEvent.name}`,
      customerCode: namaPenerima,
      idPembeli: `Program Donasi: ${selectedEvent.name}`,
      idPenerima: namaPenerima,
      date: todayStr,
      paymentStatus: 'Paid',
      shippingStatus: 'Belum dikirim',
      statusBadges: ['Paid', 'Alokasi Donasi'],
      items: salurOrderItems,
      alamat: {
        recipientName: namaPenerima,
        phone: noTelepon || '-',
        street: alamatLengkap || 'Alamat penerima',
        cityProvince: `${kota ? kota + ', ' : ''}${provinsi || 'Indonesia'}`,
        postalCode: kodePos || '-',
      },
      ekspedisi: {
        name: ekspedisi,
        noResi: '-',
        isShipped: false,
      },
      costBreakdown: {
        ongkir: `Rp${(ongkirBiaya || 0).toLocaleString('id-ID')}`,
        donasi: `Rp${totalBukuNet.toLocaleString('id-ID')}`,
        kodeUnik: `Diskon: Rp${totalPotonganHarga.toLocaleString('id-ID')}`,
      },
      totalDana: `Rp${grandTotalAlokasi.toLocaleString('id-ID')}`,
      keterangan: `Alokasi D-DONASI dari ${selectedEvent.name}. ${catatanPenyaluran}`,
      proyekSapa: selectedEvent.proyekSapa || selectedEvent.subtitle || selectedEvent.name,
    };

    // Create Alokasi history record
    const newAlokasiRecord: AlokasiDonasiSalurRecord = {
      id: `alk-${Date.now()}`,
      alokasiNumber: `ALK-211115-${String(history.length + 1).padStart(3, '0')}`,
      itemDonasiId: selectedEvent.id,
      itemDonasiName: selectedEvent.name,
      itemDonasiSubtitle: selectedEvent.subtitle,
      proyekSapa: selectedEvent.proyekSapa,
      penerima: {
        identitasId: selectedIdentitasId || undefined,
        nama: namaPenerima,
        telepon: noTelepon,
        alamat: alamatLengkap,
        kota,
        provinsi,
        kodepos: kodePos,
        catatan: catatanPenyaluran,
      },
      items: allocatedItems,
      ongkir: {
        ekspedisi,
        biaya: ongkirBiaya,
        keterangan: ongkirKeterangan,
      },
      totalBukuNormal,
      totalPotongan: totalPotonganHarga,
      totalBukuNet,
      totalOngkir: ongkirBiaya,
      grandTotal: grandTotalAlokasi,
      tanggal: todayStr,
      status: 'Ditandai & Masuk Transaksi',
      salurOrderId: newSalurOrder.id,
      salurOrderNumber: newSalurOrder.orderNumber,
      createdAt: new Date().toISOString(),
    };

    // Save to history state & persistence
    const updatedHistory = [newAlokasiRecord, ...history];
    setHistory(updatedHistory);
    saveAlokasiDonasiSalurHistory(updatedHistory);

    // Call save callback which updates salurOrders in App.tsx and navigates to 'transaksiSalur'
    onSaveAlokasi(newSalurOrder, newAlokasiRecord);
    onShowToast(`Alokasi berhasil ditandai dan diterbitkan ke Transaksi S-SALUR (${newSalurOrder.orderNumber})!`);
  };

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-150">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title & Back button */}
          <div className="flex items-start sm:items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer shrink-0 mt-0.5 sm:mt-0"
              title="Kembali ke Item D-DONASI"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#008d91]/10 text-[#008d91] font-bold text-xs px-2.5 py-0.5 rounded-full">
                  D-DONASI → S-SALUR
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Manajemen Alokasi & Penyaluran Buku
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mt-1">
                Alokasi D-DONASI ke Item S-SALUR
              </h2>
            </div>
          </div>

          {/* Event Selector Dropdown */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <div
              className={`w-8 h-8 rounded-lg ${selectedEvent.badgeColor} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs`}
            >
              {selectedEvent.badgeLetter}
            </div>
            <div className="min-w-0 pr-2">
              <label className="block text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Sumber Item D-DONASI
              </label>
              <select
                value={selectedEvent.id}
                onChange={(e) => {
                  const target = allItemDonasiEvents.find((it) => it.id === e.target.value);
                  if (target) setSelectedEvent(target);
                }}
                className="text-xs sm:text-sm font-bold text-slate-800 bg-transparent border-none outline-hidden cursor-pointer p-0"
              >
                {allItemDonasiEvents.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.name} ({evt.subtitle})
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </div>
        </div>

        {/* Selected Event Context Pill Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Proyek SAPA:</span>
            <span className="font-semibold text-slate-800">
              {selectedEvent.proyekSapa || selectedEvent.subtitle}
            </span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Target Salur:</span>
            <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
              {selectedEvent.disalurkanKepadaText || 'Anggota Sangha & Wihara'}
            </span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Periode:</span>
            <span className="font-medium text-slate-700">{selectedEvent.tanggalRange}</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Status:</span>
            <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              {selectedEvent.status}
            </span>
          </div>
        </div>
      </div>

      {/* 4 Financial Metric Cards: Pemasukan + Pengeluaran + Sisa Saldo + Alokasi Ini */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Pemasukan Donasi */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Total Pemasukan Donasi
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Rp{pemasukanDonasi.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Dana terhimpun & terverifikasi</span>
          </div>
        </div>

        {/* Card 2: Pengeluaran / Alokasi Terpakai */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Pengeluaran Alokasi Lalu
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Rp{totalPengeluaranAlokasiLalu.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span>
              {history.filter((h) => h.itemDonasiId === selectedEvent.id).length} transaksi alokasi
              sebelumnya
            </span>
          </div>
        </div>

        {/* Card 3: Sisa Saldo Tersedia */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Sisa Saldo Siap Salur
            </span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#008d91] flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#008d91] mt-2">
            Rp{sisaSaldoSebelumnya.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <span>Saldo tersedia untuk didanakan</span>
          </div>
        </div>

        {/* Card 4: Estimasi Alokasi Saat Ini */}
        <div
          className={`rounded-2xl border p-4 shadow-xs relative overflow-hidden ${
            isSaldoCukup ? 'bg-teal-900 text-white border-teal-800' : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
              Total Rencana Alokasi Ini
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isSaldoCukup ? 'bg-white/10 text-white' : 'bg-red-100 text-red-600'
              }`}
            >
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold mt-2">
            Rp{grandTotalAlokasi.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs opacity-90">
            {isSaldoCukup ? (
              <span>Sisa setelah alokasi: Rp{sisaSaldoSetelahAlokasi.toLocaleString('id-ID')}</span>
            ) : (
              <span className="font-semibold text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Melebihi saldo Rp{Math.abs(sisaSaldoSetelahAlokasi).toLocaleString('id-ID')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Form Layout: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (Penerima Donasi & Perkiraan Ongkir) - 5 cols */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card: Set Penerima Donasi */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#008d91] flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                1. Set Penerima Donasi
              </h3>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              {/* Quick Select from Identitas */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Pilih dari Database Identitas (Opsional)
                </label>
                <select
                  value={selectedIdentitasId}
                  onChange={(e) => handleSelectIdentitas(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-[#008d91] transition-colors"
                >
                  <option value="">-- Pilih identitas terdaftar atau isi manual di bawah --</option>
                  {identitasList.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.namaLengkap} {item.namaPanggilan ? `(${item.namaPanggilan})` : ''} -{' '}
                      {item.kotaKabupaten || item.nomorHp || 'Identitas'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nama Penerima */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Penerima Donasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={namaPenerima}
                  onChange={(e) => setNamaPenerima(e.target.value)}
                  placeholder="Misal: Bhikkhu Sangha Kadam Choeling / Wihara Dharma Surya"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-[#008d91] transition-colors font-medium"
                />
              </div>

              {/* Telepon */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nomor HP / Telepon Penerima
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={noTelepon}
                    onChange={(e) => setNoTelepon(e.target.value)}
                    placeholder="Misal: 0812-3456-7890"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-[#008d91] transition-colors"
                  />
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Alamat Lengkap */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Alamat Pengiriman Lengkap
                </label>
                <textarea
                  rows={2}
                  value={alamatLengkap}
                  onChange={(e) => setAlamatLengkap(e.target.value)}
                  placeholder="Nama jalan, nomor, RT/RW, kelurahan, kecamatan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-[#008d91] transition-colors resize-none"
                />
              </div>

              {/* Kota & Provinsi */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kota/Kabupaten</label>
                  <input
                    type="text"
                    value={kota}
                    onChange={(e) => setKota(e.target.value)}
                    placeholder="Misal: Jakarta Barat"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-[#008d91] transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Provinsi</label>
                  <input
                    type="text"
                    value={provinsi}
                    onChange={(e) => setProvinsi(e.target.value)}
                    placeholder="Misal: DKI Jakarta"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-[#008d91] transition-colors"
                  />
                </div>
              </div>

              {/* Catatan Penyaluran */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Keterangan / Pelimpahan Jasa
                </label>
                <input
                  type="text"
                  value={catatanPenyaluran}
                  onChange={(e) => setCatatanPenyaluran(e.target.value)}
                  placeholder="Misal: Bantuan buku perpustakaan / Pelimpahan jasa para donatur"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-[#008d91] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Card: Set Perkiraan Ongkos Kirim (Ongkir) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#008d91] flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                2. Set Perkiraan Ongkir
              </h3>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Kurir / Ekspedisi</label>
                <select
                  value={ekspedisi}
                  onChange={(e) => setEkspedisi(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-[#008d91] transition-colors"
                >
                  <option value="TIKI ECO">TIKI ECO (Ekonomis)</option>
                  <option value="TIKI ONS">TIKI ONS (Over Night Service)</option>
                  <option value="JNE REG">JNE Regular</option>
                  <option value="JNE YES">JNE YES</option>
                  <option value="Pos Indonesia">Pos Indonesia Kilat Khusus</option>
                  <option value="SiCepat Gokil">SiCepat Gokil (Kargo)</option>
                  <option value="Logistik Internal YPPLN">Mobil Operasional / Logistik YPPLN</option>
                  <option value="Ambil di Tempat">Ambil di Gudang Pusat</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Biaya Perkiraan Ongkir (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={ongkirBiaya}
                    onChange={(e) => setOngkirBiaya(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:border-[#008d91] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Catatan Ekspedisi / Berat Paket
                </label>
                <input
                  type="text"
                  value={ongkirKeterangan}
                  onChange={(e) => setOngkirKeterangan(e.target.value)}
                  placeholder="Misal: Paket 8kg, packing kardus dan bubble wrap"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-[#008d91] transition-colors"
                />
              </div>

              <div className="p-2.5 bg-teal-50/60 rounded-xl border border-teal-100 text-[11px] text-[#008d91] flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-[#008d91]" />
                <span>Ongkir ini didanai langsung dari saldo item donasi {selectedEvent.name}.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Item S-SALUR & Potongan Harga & Aksi) - 7 cols */}
        <div className="lg:col-span-7 space-y-5">
          {/* Card: Set Item S-SALUR & Potongan Harga */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#008d91] flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                    3. Item S-SALUR yang Ingin Didanakan
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Pilih buku dan atur potongan harga / subsidi jika diperlukan
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddItemRow}
                className="inline-flex items-center gap-1.5 bg-[#008d91] hover:bg-[#007477] text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Item</span>
              </button>
            </div>

            {/* List of Allocated Items */}
            <div className="space-y-4">
              {allocatedItems.map((item, index) => {
                const selectedProd = salurItems.find((p) => p.id === item.productId);
                return (
                  <div
                    key={index}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-teal-200 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#008d91] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </span>
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">
                          Pilih Produk S-SALUR
                        </span>
                      </div>

                      {allocatedItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(index)}
                          className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Hapus baris item ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Product Selection & Qty */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Product Selector */}
                      <div className="sm:col-span-8">
                        <select
                          value={item.productId}
                          onChange={(e) => handleUpdateItemRow(index, { productId: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-hidden focus:border-[#008d91]"
                        >
                          {salurItems.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.title} ({prod.code || 'Buku'}) - Rp{prod.price.toLocaleString('id-ID')} | Stok: {prod.stock}
                            </option>
                          ))}
                        </select>
                        {selectedProd && (
                          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                            <span>Kategori: {selectedProd.categories?.join(', ') || 'Dharma'}</span>
                            <span>•</span>
                            <span className="font-medium text-teal-700">
                              Stok Tersedia: {selectedProd.stock} eks
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quantity */}
                      <div className="sm:col-span-4">
                        <div className="flex items-center gap-1">
                          <label className="text-xs text-slate-500 font-medium shrink-0">Qty:</label>
                          <input
                            type="number"
                            min={1}
                            max={selectedProd ? selectedProd.stock : 999}
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItemRow(index, {
                                quantity: Math.max(1, parseInt(e.target.value, 10) || 1),
                              })
                            }
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 text-center focus:outline-hidden focus:border-[#008d91]"
                          />
                          <span className="text-xs text-slate-400 shrink-0">eks</span>
                        </div>
                      </div>
                    </div>

                    {/* Potongan Harga / Subsidi Box */}
                    <div className="p-3 bg-white rounded-xl border border-slate-200/90 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={item.needDiscount}
                            onChange={(e) =>
                              handleUpdateItemRow(index, {
                                needDiscount: e.target.checked,
                                discountValue: e.target.checked ? (item.discountValue || 20) : 0,
                                discountReason: e.target.checked
                                  ? (item.discountReason || 'Subsidi Khusus Program Donasi')
                                  : '',
                              })
                            }
                            className="w-4 h-4 rounded text-[#008d91] focus:ring-[#008d91] cursor-pointer"
                          />
                          <span className="text-xs font-bold text-slate-800">
                            Butuh Potongan Harga untuk Item Ini?
                          </span>
                        </label>

                        {item.needDiscount && (
                          <span className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 font-semibold px-2 py-0.5 rounded-full">
                            Diskon Aktif
                          </span>
                        )}
                      </div>

                      {/* Expanded Discount Form */}
                      {item.needDiscount && (
                        <div className="pt-2 border-t border-slate-100 space-y-2 animate-in fade-in duration-100">
                          <div className="flex flex-wrap items-center gap-3">
                            {/* Discount Type Toggle */}
                            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                              <button
                                type="button"
                                onClick={() => handleUpdateItemRow(index, { discountType: 'percentage' })}
                                className={`px-2.5 py-1 rounded-md transition-colors ${
                                  item.discountType === 'percentage'
                                    ? 'bg-white text-[#008d91] shadow-xs'
                                    : 'text-slate-600'
                                }`}
                              >
                                Persen (%)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateItemRow(index, { discountType: 'nominal' })}
                                className={`px-2.5 py-1 rounded-md transition-colors ${
                                  item.discountType === 'nominal'
                                    ? 'bg-white text-[#008d91] shadow-xs'
                                    : 'text-slate-600'
                                }`}
                              >
                                Nominal (Rp)
                              </button>
                            </div>

                            {/* Discount Input */}
                            <div className="flex items-center gap-1.5">
                              {item.discountType === 'percentage' ? (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={item.discountValue}
                                    onChange={(e) =>
                                      handleUpdateItemRow(index, {
                                        discountValue: Math.min(
                                          100,
                                          Math.max(0, parseInt(e.target.value, 10) || 0)
                                        ),
                                      })
                                    }
                                    className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-center focus:bg-white"
                                  />
                                  <span className="text-xs text-slate-500 font-semibold">%</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-slate-400 font-bold">Rp</span>
                                  <input
                                    type="number"
                                    min={0}
                                    max={item.price}
                                    step={1000}
                                    value={item.discountValue}
                                    onChange={(e) =>
                                      handleUpdateItemRow(index, {
                                        discountValue: Math.max(0, parseInt(e.target.value, 10) || 0),
                                      })
                                    }
                                    className="w-28 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-right focus:bg-white"
                                  />
                                  <span className="text-[11px] text-slate-400">/eks</span>
                                </div>
                              )}
                            </div>

                            {/* Quick Percent Pills */}
                            {item.discountType === 'percentage' && (
                              <div className="flex items-center gap-1 text-[11px]">
                                {[10, 20, 30, 50, 100].map((p) => (
                                  <button
                                    key={p}
                                    type="button"
                                    onClick={() => handleUpdateItemRow(index, { discountValue: p })}
                                    className={`px-2 py-0.5 rounded-md border font-medium cursor-pointer ${
                                      item.discountValue === p
                                        ? 'bg-[#008d91] text-white border-[#008d91]'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                                  >
                                    {p === 100 ? '100% Free' : `${p}%`}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Reason for discount */}
                          <div>
                            <input
                              type="text"
                              value={item.discountReason || ''}
                              onChange={(e) =>
                                handleUpdateItemRow(index, { discountReason: e.target.value })
                              }
                              placeholder="Alasan potongan harga (misal: Subsidi Program Donasi / Diskon Wihara)"
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-700 placeholder-slate-400 focus:bg-white"
                            />
                          </div>
                        </div>
                      )}

                      {/* Subtotal preview for this item row */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                          {item.quantity} eks × Rp{item.price.toLocaleString('id-ID')}
                          {item.needDiscount && (
                            <span className="text-amber-600 font-medium ml-1">
                              (Potongan{' '}
                              {item.discountType === 'percentage'
                                ? `${item.discountValue}%`
                                : `Rp${item.discountValue.toLocaleString('id-ID')}`}
                              )
                            </span>
                          )}
                        </span>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 mr-1">Subtotal:</span>
                          <span className="font-bold text-slate-900 text-sm">
                            Rp{item.subtotal.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card: Summary, Balance Validation, and Primary Action Button */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base pb-3 border-b border-slate-100">
              4. Rekapitulasi Alokasi & Pengesahan
            </h3>

            {/* Breakdown table */}
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Total Nilai Buku Normal ({allocatedItems.reduce((a, b) => a + b.quantity, 0)} eksemplar)</span>
                <span className="font-medium text-slate-800">
                  Rp{totalBukuNormal.toLocaleString('id-ID')}
                </span>
              </div>

              {totalPotonganHarga > 0 && (
                <div className="flex items-center justify-between text-amber-700">
                  <span>Total Potongan Harga / Subsidi Donasi (-)</span>
                  <span className="font-bold">
                    -Rp{totalPotonganHarga.toLocaleString('id-ID')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal Buku Setelah Diskon</span>
                <span className="font-semibold text-slate-800">
                  Rp{totalBukuNet.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Perkiraan Biaya Ongkos Kirim ({ekspedisi})</span>
                <span className="font-semibold text-slate-800">
                  +Rp{ongkirBiaya.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="h-px bg-slate-200 my-2" />

              <div className="flex items-center justify-between text-base font-bold text-slate-900">
                <span>Grand Total Alokasi</span>
                <span className="text-xl text-[#008d91]">
                  Rp{grandTotalAlokasi.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Saldo Warning / Info */}
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                isSaldoCukup
                  ? 'bg-teal-50/80 border-teal-200 text-teal-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              {isSaldoCukup ? (
                <CheckCircle2 className="w-4 h-4 text-[#008d91] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">
                  {isSaldoCukup
                    ? 'Saldo Donasi Mencukupi'
                    : 'Peringatan: Alokasi Melebihi Saldo'}
                </div>
                <div className="text-[11px] mt-0.5 text-slate-600">
                  {isSaldoCukup
                    ? `Setelah transaksi ini disahkan, sisa saldo donasi ${selectedEvent.name} adalah Rp${sisaSaldoSetelahAlokasi.toLocaleString('id-ID')}.`
                    : `Total alokasi melebihi sisa saldo sebesar Rp${Math.abs(sisaSaldoSetelahAlokasi).toLocaleString('id-ID')}. Anda tetap dapat mengesahkan jika terdapat penambahan donasi.`}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleKonfirmasiAlokasi}
                className="w-full sm:flex-1 bg-[#008d91] hover:bg-[#007477] text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
              >
                <PackageCheck className="w-5 h-5" />
                <span>Tandai & Masuk ke Transaksi S-SALUR</span>
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Riwayat Alokasi D-DONASI ke Item S-SALUR Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Riwayat Alokasi D-DONASI ke Item S-SALUR
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar penyaluran yang telah ditandai dan diterbitkan ke Transaksi S-SALUR untuk {selectedEvent.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onNavigateToTransaksiSalur}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#008d91] hover:underline cursor-pointer"
          >
            <span>Buka Dashboard Transaksi S-SALUR</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">No. Alokasi / Salur</th>
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Penerima</th>
                <th className="py-2.5 px-3">Item S-SALUR</th>
                <th className="py-2.5 px-3">Diskon</th>
                <th className="py-2.5 px-3">Ongkir</th>
                <th className="py-2.5 px-3 text-right">Total Dana</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history
                .filter((h) => h.itemDonasiId === selectedEvent.id)
                .map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{row.alokasiNumber}</div>
                      <div className="text-[11px] text-[#008d91] font-semibold mt-0.5">
                        {row.salurOrderNumber || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {row.tanggal}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{row.penerima.nama}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {row.penerima.kota ? `${row.penerima.kota}, ` : ''}{row.penerima.provinsi}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        {row.items.map((it, i) => (
                          <div key={i} className="text-slate-700">
                            <span className="font-medium">{it.title}</span>{' '}
                            <span className="text-slate-400">({it.quantity} eks)</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {row.totalPotongan > 0 ? (
                        <span className="inline-block bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                          -Rp{row.totalPotongan.toLocaleString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <div>Rp{row.totalOngkir.toLocaleString('id-ID')}</div>
                      <div className="text-[10px] text-slate-400">{row.ongkir.ekspedisi}</div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="font-bold text-[#008d91] text-sm">
                        Rp{row.grandTotal.toLocaleString('id-ID')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                        <Check className="w-3 h-3" />
                        <span>Transaksi S-SALUR</span>
                      </span>
                    </td>
                  </tr>
                ))}

              {history.filter((h) => h.itemDonasiId === selectedEvent.id).length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    Belum ada riwayat alokasi untuk item donasi ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
