import React, { useState, useRef } from 'react';
import {
  Plus,
  X,
  EyeOff,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Calendar,
  Link as LinkIcon,
  Image as ImageIcon,
  Check,
  BookOpen,
} from 'lucide-react';
import { SalurProduct } from '../salurData';
import {
  JenisItemSalurItem,
  SubJenisItemSalurItem,
  JenisKategoriItemSalurItem,
  KategoriItemSalurItem,
  DivisiItem,
  ProjectItem,
} from '../types';
import {
  INITIAL_JENIS_ITEM_SALUR,
  INITIAL_SUB_JENIS_ITEM_SALUR,
  INITIAL_JENIS_KATEGORI_ITEM_SALUR,
  INITIAL_KATEGORI_ITEM_SALUR,
} from '../salurMasterData';
import { INITIAL_DIVISI } from '../divisiData';
import { formatDatePickerValue } from '../utils/datePickerHelper';
import { DateRangePickerPopover } from './DateRangePickerPopover';
import { CoaAccount } from '../accountingData';
import {
  getNextAvailableSalurCoaNumber,
  isBukuBerbayarSalur,
  isBukuTidakBerbayarSalur,
  isNonBukuItemSalur,
  COA_PENDAPATAN_LAIN_LAIN,
  COA_PENDAPATAN_LAIN_LAIN_NAMA,
} from '../salurCoaHelper';

interface FormItemSalurProps {
  onCancel: () => void;
  onSave: (item: SalurProduct) => void;
  onShowToast?: (msg: string) => void;
  coaList?: CoaAccount[];
  jenisItemList?: JenisItemSalurItem[];
  subJenisItemList?: SubJenisItemSalurItem[];
  jenisKategoriItemList?: JenisKategoriItemSalurItem[];
  kategoriItemListData?: KategoriItemSalurItem[];
  divisiList?: DivisiItem[];
  projectsList?: ProjectItem[];
  onAddNewJenisItem?: (item: JenisItemSalurItem) => void;
  onAddNewSubJenisItem?: (item: SubJenisItemSalurItem) => void;
  onAddNewJenisKategori?: (item: JenisKategoriItemSalurItem) => void;
  onAddNewKategoriItem?: (item: KategoriItemSalurItem) => void;
}

interface VariableItemRow {
  id: string;
  namaVariable: string;
  harga: string;
}

interface MultiFieldRow {
  id: string;
  value: string;
}

interface MultiDoubleSelectRow {
  id: string;
  value1: string;
  value2: string;
}

export const FormItemSalur: React.FC<FormItemSalurProps> = ({
  onCancel,
  onSave,
  onShowToast = (_msg: string) => {},
  coaList = [],
  jenisItemList = INITIAL_JENIS_ITEM_SALUR,
  subJenisItemList = INITIAL_SUB_JENIS_ITEM_SALUR,
  jenisKategoriItemList = INITIAL_JENIS_KATEGORI_ITEM_SALUR,
  kategoriItemListData = INITIAL_KATEGORI_ITEM_SALUR,
  divisiList = INITIAL_DIVISI,
  projectsList = [],
}) => {
  // Main form fields
  const [namaItem, setNamaItem] = useState('');

  // Auto-calculated predicted COA account number for paid book item S-SALUR
  const predictedCoaNumber = React.useMemo(() => {
    return getNextAvailableSalurCoaNumber(coaList);
  }, [coaList]);
  const [subNamaItem, setSubNamaItem] = useState('');
  const [kodeItem, setKodeItem] = useState('');
  const [jenisItem, setJenisItem] = useState('');
  const [subJenisItem, setSubJenisItem] = useState('');
  const [pemasukanDivisi, setPemasukanDivisi] = useState('MAD'); // Default auto-fill MAD
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);

  // Available division options from master Divisi
  const allDivisiOptions = React.useMemo(() => {
    if (divisiList && divisiList.length > 0) {
      return Array.from(new Set(divisiList.map((d) => d.namaDivisi).filter(Boolean)));
    }
    return INITIAL_DIVISI.map((d) => d.namaDivisi);
  }, [divisiList]);

  // Variable Item rows
  const [variableItems, setVariableItems] = useState<VariableItemRow[]>([
    { id: 'var-1', namaVariable: '', harga: '' },
  ]);

  const [harga, setHarga] = useState('');
  const [keterangan, setKeterangan] = useState('');

  // Collapsible section states (open by default matching screenshot)
  const [isKeteranganItemOpen, setIsKeteranganItemOpen] = useState(true);
  const [isModalItemOpen, setIsModalItemOpen] = useState(true);
  const [isStrategiPromosiOpen, setIsStrategiPromosiOpen] = useState(true);

  // Keterangan Item fields
  const [statusItem, setStatusItem] = useState('');
  const [penulisList, setPenulisList] = useState<MultiFieldRow[]>([
    { id: 'penulis-1', value: '' },
  ]);
  const [penerbit, setPenerbit] = useState('');
  const [dharmaPatriotList, setDharmaPatriotList] = useState<MultiDoubleSelectRow[]>([
    { id: 'dp-1', value1: '', value2: '' },
  ]);
  const [sinopsis, setSinopsis] = useState('');
  const [cetakanKe, setCetakanKe] = useState('');
  const [berat, setBerat] = useState('');
  const [ukuran, setUkuran] = useState('');
  const [jumlahHalaman, setJumlahHalaman] = useState('');
  const [jenisKover, setJenisKover] = useState('');
  const [tahunTerbit, setTahunTerbit] = useState('');
  const [masaBerlakuIzin, setMasaBerlakuIzin] = useState('');
  const [isMasaBerlakuRangeOpen, setIsMasaBerlakuRangeOpen] = useState(false);
  const [judulAsli, setJudulAsli] = useState('');
  const [penerbitSumber, setPenerbitSumber] = useState('');
  const [mou, setMou] = useState('');
  const [isbn, setIsbn] = useState('');

  // Modal Item fields
  const [hargaCopyright, setHargaCopyright] = useState('');
  const [royalti, setRoyalti] = useState('');
  const [jadwalPembayaranRoyalti, setJadwalPembayaranRoyalti] = useState('');
  const [biayaMobilisasi, setBiayaMobilisasi] = useState('');
  const [rincianMobilisasiList, setRincianMobilisasiList] = useState<MultiFieldRow[]>([
    { id: 'rm-1', value: '' },
  ]);
  const [totalCetak, setTotalCetak] = useState('');
  const [hargaCetakEks, setHargaCetakEks] = useState('');
  const [hargaOngkirEks, setHargaOngkirEks] = useState('');

  // Strategi Promosi fields
  const [targetUsiaIsbn, setTargetUsiaIsbn] = useState('');
  const [genreBukuIsbn, setGenreBukuIsbn] = useState('');
  const [targetPersonaList, setTargetPersonaList] = useState<MultiFieldRow[]>([
    { id: 'tp-1', value: '' },
  ]);
  const [kategoriItemList, setKategoriItemList] = useState<MultiDoubleSelectRow[]>([
    { id: 'cat-1', value1: '', value2: '' },
  ]);
  const [aliranList, setAliranList] = useState<MultiFieldRow[]>([
    { id: 'aliran-1', value: '' },
  ]);
  const [deskripsi, setDeskripsi] = useState('');
  const [shortPositioning, setShortPositioning] = useState('');
  const [detailedPositioning, setDetailedPositioning] = useState('');
  const [keunggulanProdukList, setKeunggulanProdukList] = useState<MultiFieldRow[]>([
    { id: 'kp-1', value: '' },
  ]);

  // Dynamic dropdown options connected to S-SALUR master tables
  const jenisItemOptions = Array.from(
    new Set([
      ...jenisItemList.map((j) => j.namaJenis),
      'Buku',
      'Merchandise',
      'Lain-lain',
    ])
  );

  const subJenisItemOptions = Array.from(
    new Set([
      ...(jenisItem
        ? subJenisItemList
            .filter((s) => s.namaJenis.toLowerCase() === jenisItem.toLowerCase())
            .map((s) => s.namaSubJenis)
        : []),
      ...subJenisItemList.map((s) => s.namaSubJenis),
      'Buku Berbayar',
      'Buku Tidak Berbayar',
      'Buku Non-YPPLN',
      'Google Books',
      'T-Shirt',
      'Note Book',
      'Lain-lain Non-YPPLN',
    ])
  );

  const statusItemOptions = ['Aktif', 'Pre-Order', 'Draft', 'Discontinue', 'Habis'];
  const penerbitOptions = ['Penerbit Karaniya', 'Penerbit Ehipassiko', 'YPPLN Press', 'Kadam Choeling', 'Dian Dharma'];
  const jenisKoverOptions = ['Soft Cover', 'Hard Cover', 'Jilid Spiral', 'Jaket Kover'];
  const peranDharmaPatriot = ['Penyelaras Bahasa', 'Penerjemah', 'Editor', 'Desainer Sampul', 'Layout'];
  const namaDharmaPatriot = ['Suwarno', 'Budi Santoso', 'Siti Rahma', 'Kurniawan', 'Dewi Lestari'];

  // Kategori Item options connected to Jenis Kategori and Kategori Item tables
  const kategoriItemOptions1 = Array.from(
    new Set([
      ...jenisKategoriItemList.map((jk) => jk.namaJenisKategori),
      'Umur',
      'Isi?',
      'Triyana',
      'Bahasa',
    ])
  );

  const getKategoriItemOptions2 = (selectedJenisKategori: string) => {
    if (selectedJenisKategori) {
      const filtered = kategoriItemListData
        .filter((k) => k.namaJenisKategori.toLowerCase() === selectedJenisKategori.toLowerCase())
        .map((k) => k.namaKategori);
      if (filtered.length > 0) {
        return Array.from(new Set(filtered));
      }
    }
    return Array.from(
      new Set([
        ...kategoriItemListData.map((k) => k.namaKategori),
        'Dewasa',
        'Remaja',
        'Anak-anak',
        'Lamrim',
        'TJMP',
        'Welas Asih',
      ])
    );
  };

  // File input ref for foto
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFotoUrl(url);
      onShowToast('Foto item berhasil diunggah');
    }
  };

  // Variable Item Handlers
  const handleAddVariableItem = () => {
    setVariableItems((prev) => [
      ...prev,
      { id: `var-${Date.now()}`, namaVariable: '', harga: '' },
    ]);
  };

  const handleRemoveVariableItem = (id: string) => {
    if (variableItems.length === 1) {
      setVariableItems([{ id: `var-${Date.now()}`, namaVariable: '', harga: '' }]);
    } else {
      setVariableItems((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const handleUpdateVariableItem = (id: string, field: 'namaVariable' | 'harga', val: string) => {
    setVariableItems((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: val } : v))
    );
  };

  // Multi row handlers
  const handleAddRow = (
    setter: React.Dispatch<React.SetStateAction<MultiFieldRow[]>>,
    prefix: string
  ) => {
    setter((prev) => [...prev, { id: `${prefix}-${Date.now()}`, value: '' }]);
  };

  const handleRemoveRow = (
    setter: React.Dispatch<React.SetStateAction<MultiFieldRow[]>>,
    id: string,
    prefix: string
  ) => {
    setter((prev) => {
      if (prev.length === 1) {
        return [{ id: `${prefix}-${Date.now()}`, value: '' }];
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleUpdateRow = (
    setter: React.Dispatch<React.SetStateAction<MultiFieldRow[]>>,
    id: string,
    val: string
  ) => {
    setter((prev) => prev.map((item) => (item.id === id ? { ...item, value: val } : item)));
  };

  // Double select multi row handlers
  const handleAddDoubleRow = (
    setter: React.Dispatch<React.SetStateAction<MultiDoubleSelectRow[]>>,
    prefix: string
  ) => {
    setter((prev) => [...prev, { id: `${prefix}-${Date.now()}`, value1: '', value2: '' }]);
  };

  const handleRemoveDoubleRow = (
    setter: React.Dispatch<React.SetStateAction<MultiDoubleSelectRow[]>>,
    id: string,
    prefix: string
  ) => {
    setter((prev) => {
      if (prev.length === 1) {
        return [{ id: `${prefix}-${Date.now()}`, value1: '', value2: '' }];
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleUpdateDoubleRow = (
    setter: React.Dispatch<React.SetStateAction<MultiDoubleSelectRow[]>>,
    id: string,
    field: 'value1' | 'value2',
    val: string
  ) => {
    setter((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaItem.trim()) {
      onShowToast('Mohon masukkan Nama Item');
      return;
    }

    const priceNum = Number(harga.replace(/\D/g, '')) || 100000;
    const firstAuthor =
      penulisList.find((p) => p.value.trim())?.value.trim() || 'Penulis S-SALUR';
    const categoriesFromForm = kategoriItemList
      .map((k) => k.value2.trim() || k.value1.trim())
      .filter(Boolean);

    const tempCheckItem: Partial<SalurProduct> = {
      title: namaItem.trim(),
      subtitle: subNamaItem,
      subJenis: subJenisItem,
      price: priceNum,
      category: jenisItem,
    };

    let allocatedCoaNo: string | undefined = undefined;
    let allocatedCoaNama: string | undefined = undefined;

    if (isBukuTidakBerbayarSalur(tempCheckItem)) {
      allocatedCoaNo = undefined;
      allocatedCoaNama = undefined;
    } else if (isBukuBerbayarSalur(tempCheckItem)) {
      allocatedCoaNo = predictedCoaNumber;
      allocatedCoaNama = `Pendapatan Salur - ${namaItem.trim()}`;
    } else {
      // Selain buku berbayar dan buku tidak berbayar -> COA 49999 Pendapatan Lain-Lain
      allocatedCoaNo = COA_PENDAPATAN_LAIN_LAIN;
      allocatedCoaNama = COA_PENDAPATAN_LAIN_LAIN_NAMA;
    }

    const newItem: SalurProduct = {
      id: kodeItem ? `item-${kodeItem}` : `item-${Date.now()}`,
      title: namaItem.trim(),
      subtitle: subNamaItem
        ? `${subNamaItem}, ${kodeItem || '2021'}`
        : `Buku Berbayar, ${kodeItem || '2021'}`,
      code: kodeItem || '2021',
      price: priceNum,
      stock: Number(totalCetak) || 100,
      printedCount: Number(totalCetak) || 700,
      author: firstAuthor,
      publisher: penerbit || 'Penerbit Kadam Choeling',
      category: jenisItem || 'Buku Utama',
      categories:
        categoriesFromForm.length > 0
          ? categoriesFromForm
          : ['TJMP', 'Welas Asih'],
      pageCount: jumlahHalaman ? `${jumlahHalaman} hlm` : 'X+200 hlm',
      coverType: jenisKover || 'Soft Cover',
      coverKey: 'jalan-menuju',
      imageUrl: fotoUrl || undefined,
      pemasukanDivisi: pemasukanDivisi || 'MAD',
      coaNoAkun: allocatedCoaNo,
      coaNamaAkun: allocatedCoaNama,
      detailedInfo: {
        fullTitle: subNamaItem
          ? `${namaItem.trim()}: ${subNamaItem.trim()}`
          : namaItem.trim(),
        author: firstAuthor,
        publisher:
          penerbit ||
          'Penerbit Yayasan Pengembangan dan Pelestarian Lamrim Nusantara',
        dimensions: ukuran || '21 x 14.8 x 1.2 mm',
        pages: jumlahHalaman || 'xvii+137',
        cover: jenisKover || 'Soft Cover',
        isbn: isbn || '978-623-6632-06-2',
        year: tahunTerbit || '2021',
        priceFormatted: `Rp${priceNum.toLocaleString('id-ID')}`,
        quote: sinopsis ? `”${sinopsis.slice(0, 160)}...”` : undefined,
        description: deskripsi || sinopsis || keterangan || undefined,
      },
    };

    onSave(newItem);
    onShowToast(`Item "${namaItem}" berhasil disimpan!`);
  };

  const handleResetForm = () => {
    setNamaItem('');
    setSubNamaItem('');
    setKodeItem('');
    setJenisItem('');
    setSubJenisItem('');
    setFotoUrl(null);
    setHarga('');
    setKeterangan('');
    onShowToast('Form direset, siap input item baru');
  };

  return (
    <div className="w-full pb-20 animate-in fade-in duration-150">
      {/* Top Toolbar: EyeOff, Search, Sliders, + Add */}
      <div className="flex items-center justify-end gap-3.5 mb-8">
        <button
          type="button"
          onClick={() => onShowToast('Fitur visibilitas kolom')}
          title="Sembunyikan / Tampilkan"
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
        >
          <EyeOff className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          type="button"
          onClick={() => onShowToast('Fitur pencarian form')}
          title="Cari"
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
        >
          <Search className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          type="button"
          onClick={() => onShowToast('Filter form')}
          title="Filter"
          className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          id="btn-toolbar-add-item"
          type="button"
          onClick={handleResetForm}
          className="bg-[#008d91] text-white px-4 py-1.5 rounded-lg font-semibold text-sm hover:bg-[#05828e] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
        {/* 1. Nama Item */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
            Nama Item
          </label>
          <div className="flex-1 max-w-xl">
            <input
              id="input-nama-item"
              type="text"
              value={namaItem}
              onChange={(e) => setNamaItem(e.target.value)}
              placeholder="Input Text..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
            />
          </div>
        </div>

        {/* 2. Sub-Nama Item */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
            Sub-Nama Item
          </label>
          <div className="flex-1 max-w-xl">
            <input
              type="text"
              value={subNamaItem}
              onChange={(e) => setSubNamaItem(e.target.value)}
              placeholder="Input Text..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
            />
          </div>
        </div>

        {/* 3. Kode Item */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
            Kode Item
          </label>
          <div className="flex-1 max-w-xl">
            <input
              type="text"
              value={kodeItem}
              onChange={(e) => setKodeItem(e.target.value)}
              placeholder="Input Text..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
            />
          </div>
        </div>

        {/* 4. Jenis Item (Dropdown with teal circle chevron) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
            Jenis Item
          </label>
          <div className="flex-1 max-w-xl relative">
            <select
              value={jenisItem}
              onChange={(e) => setJenisItem(e.target.value)}
              className="w-full border border-slate-200 rounded-xl pl-4 pr-11 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#008d91] transition-colors bg-white appearance-none cursor-pointer"
            >
              <option value="" disabled hidden>
                Search...
              </option>
              {jenisItemOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* 5. Sub-Jenis Item (Dropdown with teal circle chevron) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
            Sub-Jenis Item
          </label>
          <div className="flex-1 max-w-xl relative">
            <select
              value={subJenisItem}
              onChange={(e) => setSubJenisItem(e.target.value)}
              className="w-full border border-slate-200 rounded-xl pl-4 pr-11 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#008d91] transition-colors bg-white appearance-none cursor-pointer"
            >
              <option value="" disabled hidden>
                Search...
              </option>
              {subJenisItemOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Pemasukan Divisi (Auto isi MAD, opsi dari master Divisi, bisa diganti) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
            Pemasukan Divisi
          </label>
          <div className="flex-1 max-w-xl relative">
            <select
              value={pemasukanDivisi}
              onChange={(e) => setPemasukanDivisi(e.target.value)}
              className="w-full border border-slate-200 rounded-xl pl-4 pr-11 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#008d91] transition-colors bg-white appearance-none cursor-pointer"
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

        {/* 6. Foto */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
            Foto
          </label>
          <div className="flex-1 max-w-xl flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-[#008d91] hover:text-[#05828e] font-medium text-sm transition-colors cursor-pointer py-1.5"
            >
              {/* Camera/Image with plus badge icon */}
              <div className="relative">
                <svg
                  className="w-6 h-6 stroke-current"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 rounded-full bg-[#008d91] text-white flex items-center justify-center text-[10px] font-bold">
                  +
                </div>
              </div>
              <span>Add Image(s)</span>
            </button>

            {fotoUrl && (
              <div className="relative group w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shadow-2xs">
                <img src={fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFotoUrl(null)}
                  className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 7. Variable Item Card Block */}
        {variableItems.map((varItem, idx) => (
          <div key={varItem.id} className="space-y-2 pt-1">
            {/* Header: Red (X) and Teal 'Variable Item' */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleRemoveVariableItem(varItem.id)}
                className="w-4 h-4 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Hapus Variable Item"
              >
                <X className="w-2.5 h-2.5 stroke-[3]" />
              </button>
              <span className="text-sm font-semibold text-[#008d91]">Variable Item</span>
            </div>

            {/* Grayish card block matching image */}
            <div className="bg-[#f8fafc] border border-slate-100/90 rounded-2xl p-5 sm:p-6 space-y-4 max-w-3xl">
              {/* Nama Variable */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-52 sm:w-60 shrink-0">
                  Nama Variable
                </label>
                <div className="flex-1 max-w-xl">
                  <input
                    type="text"
                    value={varItem.namaVariable}
                    onChange={(e) =>
                      handleUpdateVariableItem(varItem.id, 'namaVariable', e.target.value)
                    }
                    placeholder="Input Text..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                  />
                </div>
              </div>

              {/* Harga Variable */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-52 sm:w-60 shrink-0">
                  Harga
                </label>
                <div className="flex-1 max-w-xl relative flex items-center">
                  <div className="absolute left-3.5 text-xs font-semibold text-[#008d91]">Rp</div>
                  <input
                    type="text"
                    value={varItem.harga}
                    onChange={(e) =>
                      handleUpdateVariableItem(varItem.id, 'harga', e.target.value)
                    }
                    placeholder="Input Nominal..."
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* + Variable Item Button below the card */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleAddVariableItem}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#008d91] hover:text-[#05828e] transition-colors cursor-pointer"
          >
            <div className="w-4 h-4 rounded-full bg-[#008d91] text-white flex items-center justify-center">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Variable Item</span>
          </button>
        </div>

        {/* 8. Harga* */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
            Harga*
          </label>
          <div className="flex-1 max-w-xl relative flex items-center">
            <div className="absolute left-3.5 text-xs font-semibold text-[#008d91]">Rp</div>
            <input
              type="text"
              value={harga}
              onChange={(e) => setHarga(e.target.value)}
              placeholder="Input Nominal..."
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
            />
          </div>
        </div>

        {/* Auto COA Indicator for Paid Book Item S-SALUR */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:items-center gap-2 sm:gap-6">
          <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#008d91]" />
            <span>Akun COA Pendapatan</span>
          </label>
          <div className="flex-1 max-w-xl">
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="font-mono font-bold text-sm text-emerald-800 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-300 shadow-2xs shrink-0">
                  {predictedCoaNumber}
                </span>
                <span className="text-xs text-emerald-950 font-semibold truncate">
                  Pendapatan Salur - {namaItem.trim() || 'Nama Buku'}
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-full border border-emerald-200 shrink-0 ml-2">
                Auto Input (40002-49990)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Buku berbayar S-SALUR otomatis dialokasikan no Akun COA tersendiri (range 40002-49990) dan otomatis dihapus jika item S-SALUR dihapus.
            </p>
          </div>
        </div>

        {/* 9. Keterangan */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
            Keterangan
          </label>
          <div className="flex-1 max-w-xl">
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Input Text..."
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: ▼ Keterangan Item */}
        {/* ========================================================================= */}
        <div className="pt-4 border-t border-slate-200/70 space-y-4 sm:space-y-5">
          {/* Collapsible Section Header */}
          <button
            type="button"
            onClick={() => setIsKeteranganItemOpen(!isKeteranganItemOpen)}
            className="flex items-center gap-2 text-[#008d91] hover:text-[#05828e] font-bold text-sm sm:text-base transition-colors cursor-pointer"
          >
            <span className="text-xs">▼</span>
            <span>Keterangan Item</span>
          </button>

          {isKeteranganItemOpen && (
            <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-100">
              {/* Status Item */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Status Item
                </label>
                <div className="flex-1 max-w-xl relative">
                  <select
                    value={statusItem}
                    onChange={(e) => setStatusItem(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-4 pr-11 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#008d91] transition-colors bg-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled hidden>
                      Search...
                    </option>
                    {statusItemOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
                    <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
              </div>

              {/* Penulis (multi-row with dropdown, X, +) */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0 pt-2.5">
                  Penulis
                </label>
                <div className="flex-1 max-w-xl space-y-2.5">
                  {penulisList.map((p, idx) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={p.value}
                          onChange={(e) => handleUpdateRow(setPenulisList, p.id, e.target.value)}
                          placeholder="Search..."
                          className="w-full border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
                          <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(setPenulisList, p.id, 'penulis')}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title="Hapus Penulis"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {idx === penulisList.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleAddRow(setPenulisList, 'penulis')}
                          className="w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Tambah Penulis"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Penerbit */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Penerbit
                </label>
                <div className="flex-1 max-w-xl relative">
                  <select
                    value={penerbit}
                    onChange={(e) => setPenerbit(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-4 pr-11 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#008d91] transition-colors bg-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled hidden>
                      Search...
                    </option>
                    {penerbitOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
                    <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
              </div>

              {/* Dharma Patriot (Two side-by-side dropdowns + X + +) */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0 pt-2.5">
                  Dharma Patriot
                </label>
                <div className="flex-1 max-w-xl space-y-2.5">
                  {dharmaPatriotList.map((dp, idx) => (
                    <div key={dp.id} className="flex items-center gap-2">
                      {/* Select 1: Peran */}
                      <div className="flex-1 relative">
                        <select
                          value={dp.value1}
                          onChange={(e) =>
                            handleUpdateDoubleRow(setDharmaPatriotList, dp.id, 'value1', e.target.value)
                          }
                          className="w-full border border-slate-200 rounded-xl pl-3 pr-9 py-2.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-[#008d91] transition-colors bg-white appearance-none cursor-pointer"
                        >
                          <option value="" disabled hidden>
                            Search...
                          </option>
                          {peranDharmaPatriot.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 rounded-full bg-[#008d91] text-white flex items-center justify-center">
                          <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                        </div>
                      </div>

                      {/* Select 2: Nama */}
                      <div className="flex-1 relative">
                        <select
                          value={dp.value2}
                          onChange={(e) =>
                            handleUpdateDoubleRow(setDharmaPatriotList, dp.id, 'value2', e.target.value)
                          }
                          className="w-full border border-slate-200 rounded-xl pl-3 pr-9 py-2.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-[#008d91] transition-colors bg-white appearance-none cursor-pointer"
                        >
                          <option value="" disabled hidden>
                            Search...
                          </option>
                          {namaDharmaPatriot.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 rounded-full bg-[#008d91] text-white flex items-center justify-center">
                          <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                        </div>
                      </div>

                      {/* X button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveDoubleRow(setDharmaPatriotList, dp.id, 'dp')}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title="Hapus Baris"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* + button */}
                      {idx === dharmaPatriotList.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleAddDoubleRow(setDharmaPatriotList, 'dp')}
                          className="w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Tambah Baris"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Sinopsis (textarea) */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0 pt-2.5">
                  Sinopsis
                </label>
                <div className="flex-1 max-w-xl">
                  <textarea
                    rows={3}
                    value={sinopsis}
                    onChange={(e) => setSinopsis(e.target.value)}
                    placeholder="Input Text..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white resize-y"
                  />
                </div>
              </div>

              {/* Cetakan ke Berapa */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Cetakan ke Berapa
                </label>
                <div className="flex-1 max-w-xl">
                  <input
                    type="text"
                    value={cetakanKe}
                    onChange={(e) => setCetakanKe(e.target.value)}
                    placeholder="Input Text..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                  />
                </div>
              </div>

              {/* Berat */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Berat
                </label>
                <div className="flex-1 max-w-xl">
                  <input
                    type="text"
                    value={berat}
                    onChange={(e) => setBerat(e.target.value)}
                    placeholder="Input Text..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                  />
                </div>
              </div>

              {/* Ukuran */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Ukuran
                </label>
                <div className="flex-1 max-w-xl">
                  <input
                    type="text"
                    value={ukuran}
                    onChange={(e) => setUkuran(e.target.value)}
                    placeholder="Input Text..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                  />
                </div>
              </div>

              {/* Jumlah Halaman */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Jumlah Halaman
                </label>
                <div className="flex-1 max-w-xl">
                  <input
                    type="text"
                    value={jumlahHalaman}
                    onChange={(e) => setJumlahHalaman(e.target.value)}
                    placeholder="Input Text..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                  />
                </div>
              </div>

              {/* Jenis Kover */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Jenis Kover
                </label>
                <div className="flex-1 max-w-xl relative">
                  <select
                    value={jenisKover}
                    onChange={(e) => setJenisKover(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-4 pr-11 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#008d91] transition-colors bg-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled hidden>
                      Search...
                    </option>
                    {jenisKoverOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
                    <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
              </div>

              {/* Tahun Terbit */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Tahun Terbit
                </label>
                <div className="flex-1 max-w-xl relative">
                  <input
                    type="text"
                    value={tahunTerbit}
                    onChange={(e) => setTahunTerbit(e.target.value)}
                    placeholder="Input Date..."
                    className="w-full border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#008d91]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    aria-label="Pilih Tahun Terbit"
                    title="Pilih Tanggal / Tahun"
                    onClick={(e) => {
                      try {
                        (e.currentTarget as HTMLInputElement).showPicker?.();
                      } catch (_) {}
                    }}
                    onChange={(e) => {
                      if (e.target.value) {
                        setTahunTerbit(formatDatePickerValue(e.target.value));
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 opacity-0 cursor-pointer z-10"
                  />
                </div>
              </div>

              {/* Masa Berlaku Izin */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Masa Berlaku Izin
                </label>
                <div className="flex-1 max-w-xl relative">
                  <input
                    type="text"
                    value={masaBerlakuIzin}
                    onChange={(e) => setMasaBerlakuIzin(e.target.value)}
                    onClick={() => setIsMasaBerlakuRangeOpen(true)}
                    placeholder="Input Date..."
                    className="w-full border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={() => setIsMasaBerlakuRangeOpen(!isMasaBerlakuRangeOpen)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#008d91] hover:text-[#007b7e] cursor-pointer"
                    title="Pilih Masa Berlaku Izin"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <DateRangePickerPopover
                    isOpen={isMasaBerlakuRangeOpen}
                    onClose={() => setIsMasaBerlakuRangeOpen(false)}
                    startDate={masaBerlakuIzin.includes('-') ? masaBerlakuIzin.split('-')[0].trim() : masaBerlakuIzin}
                    endDate={masaBerlakuIzin.includes('-') ? masaBerlakuIzin.split('-')[1].trim() : masaBerlakuIzin}
                    onSelectRange={(start, end) => {
                      if (start && end && start !== end) {
                        setMasaBerlakuIzin(`${start} - ${end}`);
                      } else {
                        setMasaBerlakuIzin(start);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Judul Asli */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Judul Asli
                </label>
                <div className="flex-1 max-w-xl">
                  <input
                    type="text"
                    value={judulAsli}
                    onChange={(e) => setJudulAsli(e.target.value)}
                    placeholder="Input Text..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                  />
                </div>
              </div>

              {/* Penerbit Sumber */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Penerbit Sumber
                </label>
                <div className="flex-1 max-w-xl relative">
                  <select
                    value={penerbitSumber}
                    onChange={(e) => setPenerbitSumber(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl pl-4 pr-11 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#008d91] transition-colors bg-white appearance-none cursor-pointer"
                  >
                    <option value="" disabled hidden>
                      Search...
                    </option>
                    {penerbitOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center">
                    <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                </div>
              </div>

              {/* MoU */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  MoU
                </label>
                <div className="flex-1 max-w-xl relative">
                  <input
                    type="text"
                    value={mou}
                    onChange={(e) => setMou(e.target.value)}
                    placeholder="Input Link..."
                    className="w-full border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#008d91]">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* ISBN */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  ISBN
                </label>
                <div className="flex-1 max-w-xl">
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="Input Text..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: ▼ Modal Item */}
        {/* ========================================================================= */}
        <div className="pt-4 border-t border-slate-200/70 space-y-4 sm:space-y-5">
          {/* Collapsible Section Header */}
          <button
            type="button"
            onClick={() => setIsModalItemOpen(!isModalItemOpen)}
            className="flex items-center gap-2 text-[#008d91] hover:text-[#05828e] font-bold text-sm sm:text-base transition-colors cursor-pointer"
          >
            <span className="text-xs">▼</span>
            <span>Modal Item</span>
          </button>

          {isModalItemOpen && (
            <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-100">
              {/* Harga Copyright */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Harga Copyright
                </label>
                <div className="flex-1 max-w-xl relative flex items-center">
                  <div className="absolute left-3.5 text-xs font-semibold text-[#008d91]">Rp</div>
                  <input
                    type="text"
                    value={hargaCopyright}
                    onChange={(e) => setHargaCopyright(e.target.value)}
                    placeholder="Input Nominal..."
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                  />
                </div>
              </div>

              {/* Royalti */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Royalti
                </label>
                <div className="flex-1 max-w-xl relative flex items-center">
                  <div className="absolute left-3.5 text-xs font-semibold text-[#008d91]">%</div>
                  <input
                    type="text"
                    value={royalti}
                    onChange={(e) => setRoyalti(e.target.value)}
                    placeholder="Input Nominal..."
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                  />
                </div>
              </div>

              {/* Jadwal Pembayaran Royalti */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Jadwal Pembayaran Royalti
                </label>
                <div className="flex-1 max-w-xl relative">
                  <input
                    type="text"
                    value={jadwalPembayaranRoyalti}
                    onChange={(e) => setJadwalPembayaranRoyalti(e.target.value)}
                    placeholder="Input Date..."
                    className="w-full border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#008d91]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    aria-label="Pilih Jadwal Pembayaran Royalti"
                    title="Pilih Tanggal"
                    onClick={(e) => {
                      try {
                        (e.currentTarget as HTMLInputElement).showPicker?.();
                      } catch (_) {}
                    }}
                    onChange={(e) => {
                      if (e.target.value) {
                        setJadwalPembayaranRoyalti(formatDatePickerValue(e.target.value));
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 opacity-0 cursor-pointer z-10"
                  />
                </div>
              </div>

              {/* Biaya Mobilisasi */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Biaya Mobilisasi
                </label>
                <div className="flex-1 max-w-xl relative flex items-center">
                  <div className="absolute left-3.5 text-xs font-semibold text-[#008d91]">Rp</div>
                  <input
                    type="text"
                    value={biayaMobilisasi}
                    onChange={(e) => setBiayaMobilisasi(e.target.value)}
                    placeholder="Input Nominal..."
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                  />
                </div>
              </div>

              {/* Rincian Mobilisasi (multi-row with input, X, +) */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0 pt-2.5">
                  Rincian Mobilisasi
                </label>
                <div className="flex-1 max-w-xl space-y-2.5">
                  {rincianMobilisasiList.map((rm, idx) => (
                    <div key={rm.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={rm.value}
                          onChange={(e) =>
                            handleUpdateRow(setRincianMobilisasiList, rm.id, e.target.value)
                          }
                          placeholder="Input Text..."
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveRow(setRincianMobilisasiList, rm.id, 'rm')
                        }
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title="Hapus Rincian"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {idx === rincianMobilisasiList.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleAddRow(setRincianMobilisasiList, 'rm')}
                          className="w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Tambah Rincian"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Cetak */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Total Cetak
                </label>
                <div className="flex-1 max-w-xl">
                  <input
                    type="text"
                    value={totalCetak}
                    onChange={(e) => setTotalCetak(e.target.value)}
                    placeholder="Input Text..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                  />
                </div>
              </div>

              {/* Harga Cetak/eks */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Harga Cetak/eks
                </label>
                <div className="flex-1 max-w-xl relative flex items-center">
                  <div className="absolute left-3.5 text-xs font-semibold text-[#008d91]">Rp</div>
                  <input
                    type="text"
                    value={hargaCetakEks}
                    onChange={(e) => setHargaCetakEks(e.target.value)}
                    placeholder="Input Nominal..."
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                  />
                </div>
              </div>

              {/* Harga Ongkir/eks */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Harga Ongkir/eks
                </label>
                <div className="flex-1 max-w-xl relative flex items-center">
                  <div className="absolute left-3.5 text-xs font-semibold text-[#008d91]">Rp</div>
                  <input
                    type="text"
                    value={hargaOngkirEks}
                    onChange={(e) => setHargaOngkirEks(e.target.value)}
                    placeholder="Input Nominal..."
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: ▼ Strategi Promosi */}
        {/* ========================================================================= */}
        <div className="pt-4 border-t border-slate-200/70 space-y-4 sm:space-y-5">
          {/* Collapsible Section Header */}
          <button
            type="button"
            onClick={() => setIsStrategiPromosiOpen(!isStrategiPromosiOpen)}
            className="flex items-center gap-2 text-[#008d91] hover:text-[#05828e] font-bold text-sm sm:text-base transition-colors cursor-pointer"
          >
            <span className="text-xs">▼</span>
            <span>Strategi Promosi</span>
          </button>

          {isStrategiPromosiOpen && (
            <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-100">
              {/* Target Usia ISBN */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Target Usia ISBN
                </label>
                <div className="flex-1 max-w-xl">
                  <input
                    type="text"
                    value={targetUsiaIsbn}
                    onChange={(e) => setTargetUsiaIsbn(e.target.value)}
                    placeholder="Input Text..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                  />
                </div>
              </div>

              {/* Genre Buku ISBN */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0">
                  Genre Buku ISBN
                </label>
                <div className="flex-1 max-w-xl">
                  <input
                    type="text"
                    value={genreBukuIsbn}
                    onChange={(e) => setGenreBukuIsbn(e.target.value)}
                    placeholder="Input Text..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                  />
                </div>
              </div>

              {/* Target Persona (Numbered prefix 1. Input Text... + X + +) */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0 pt-2.5">
                  Target Persona
                </label>
                <div className="flex-1 max-w-xl space-y-2.5">
                  {targetPersonaList.map((tp, idx) => (
                    <div key={tp.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={tp.value}
                          onChange={(e) =>
                            handleUpdateRow(setTargetPersonaList, tp.id, e.target.value)
                          }
                          placeholder={`${idx + 1}. Input Text...`}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(setTargetPersonaList, tp.id, 'tp')}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title="Hapus Target Persona"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {idx === targetPersonaList.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleAddRow(setTargetPersonaList, 'tp')}
                          className="w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Tambah Target Persona"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Kategori Item (Two side-by-side dropdowns + X + +) */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0 pt-2.5">
                  Kategori Item
                </label>
                <div className="flex-1 max-w-xl space-y-2.5">
                  {kategoriItemList.map((cat, idx) => (
                    <div key={cat.id} className="flex items-center gap-2">
                      {/* Select 1 */}
                      <div className="flex-1 relative">
                        <select
                          value={cat.value1}
                          onChange={(e) =>
                            handleUpdateDoubleRow(setKategoriItemList, cat.id, 'value1', e.target.value)
                          }
                          className="w-full border border-slate-200 rounded-xl pl-3 pr-9 py-2.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-[#008d91] transition-colors bg-white appearance-none cursor-pointer"
                        >
                          <option value="" disabled hidden>
                            Search...
                          </option>
                          {kategoriItemOptions1.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 rounded-full bg-[#008d91] text-white flex items-center justify-center">
                          <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                        </div>
                      </div>

                      {/* Select 2 */}
                      <div className="flex-1 relative">
                        <select
                          value={cat.value2}
                          onChange={(e) =>
                            handleUpdateDoubleRow(setKategoriItemList, cat.id, 'value2', e.target.value)
                          }
                          className="w-full border border-slate-200 rounded-xl pl-3 pr-9 py-2.5 text-xs sm:text-sm text-slate-700 focus:outline-none focus:border-[#008d91] transition-colors bg-white appearance-none cursor-pointer"
                        >
                          <option value="" disabled hidden>
                            Search...
                          </option>
                          {getKategoriItemOptions2(cat.value1).map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 rounded-full bg-[#008d91] text-white flex items-center justify-center">
                          <ChevronDown className="w-3 h-3 stroke-[2.5]" />
                        </div>
                      </div>

                      {/* X button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveDoubleRow(setKategoriItemList, cat.id, 'cat')}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title="Hapus Kategori"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* + button */}
                      {idx === kategoriItemList.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleAddDoubleRow(setKategoriItemList, 'cat')}
                          className="w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Tambah Kategori"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Aliran (Numbered prefix 1. Input Text... + X + +) */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0 pt-2.5">
                  Aliran
                </label>
                <div className="flex-1 max-w-xl space-y-2.5">
                  {aliranList.map((al, idx) => (
                    <div key={al.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={al.value}
                          onChange={(e) =>
                            handleUpdateRow(setAliranList, al.id, e.target.value)
                          }
                          placeholder={`${idx + 1}. Input Text...`}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(setAliranList, al.id, 'aliran')}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title="Hapus Aliran"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {idx === aliranList.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleAddRow(setAliranList, 'aliran')}
                          className="w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Tambah Aliran"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Deskripsi (textarea) */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0 pt-2.5">
                  Deskripsi
                </label>
                <div className="flex-1 max-w-xl">
                  <textarea
                    rows={3}
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    placeholder="Input Text..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white resize-y"
                  />
                </div>
              </div>

              {/* Short Positioning Statement (textarea) */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0 pt-2.5">
                  Short Positioning Statement
                </label>
                <div className="flex-1 max-w-xl">
                  <textarea
                    rows={3}
                    value={shortPositioning}
                    onChange={(e) => setShortPositioning(e.target.value)}
                    placeholder="Input Text..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white resize-y"
                  />
                </div>
              </div>

              {/* Detailed Positioning Statement (textarea) */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0 pt-2.5">
                  Detailed Positioning Statement
                </label>
                <div className="flex-1 max-w-xl">
                  <textarea
                    rows={3}
                    value={detailedPositioning}
                    onChange={(e) => setDetailedPositioning(e.target.value)}
                    placeholder="Input Text..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white resize-y"
                  />
                </div>
              </div>

              {/* Keunggulan Produk (input + X + +) */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6">
                <label className="text-slate-700 text-sm sm:text-base font-normal w-56 sm:w-64 md:w-72 shrink-0 pt-2.5">
                  Keunggulan Produk
                </label>
                <div className="flex-1 max-w-xl space-y-2.5">
                  {keunggulanProdukList.map((kp, idx) => (
                    <div key={kp.id} className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={kp.value}
                          onChange={(e) =>
                            handleUpdateRow(setKeunggulanProdukList, kp.id, e.target.value)
                          }
                          placeholder="Input Text..."
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#008d91] transition-colors bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveRow(setKeunggulanProdukList, kp.id, 'kp')
                        }
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        title="Hapus Keunggulan"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {idx === keunggulanProdukList.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleAddRow(setKeunggulanProdukList, 'kp')}
                          className="w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#05828e] text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title="Tambah Keunggulan"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons: Cancel and Save (Bottom Right) */}
        <div className="flex items-center justify-end gap-3.5 pt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-10 py-2.5 text-sm font-semibold rounded-xl bg-[#008d91] hover:bg-[#05828e] text-white shadow-xs transition-colors cursor-pointer"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};
