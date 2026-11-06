import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  EyeOff,
  Eye,
  Search,
  SlidersHorizontal,
  Plus,
  MoreVertical,
  ChevronDown,
  Calendar as CalendarIcon,
  Check,
  X,
  ArrowLeft,
} from 'lucide-react';
import { DharmaPatronRutinItem, OrganisasiItem, MutasiItem } from '../types';
import { IdentitasItem, INITIAL_IDENTITAS } from '../identitasData';
import { DonasiOrder, INITIAL_DONASI_ORDERS } from '../donasiData';
import { formatDatePickerValue } from '../utils/datePickerHelper';
import { IdentitasIdSelector, IdentitasIdSelectorItem } from './IdentitasIdSelector';
import { validateAndCalculatePatronPiutang, PatronPiutangValidationResult } from '../utils/dharmaPatronPiutangHelper';

interface FormListDharmaPatronRutinProps {
  onCancel: () => void;
  onSave: (item: DharmaPatronRutinItem) => void;
  editingItem?: DharmaPatronRutinItem | null;
  existingItems?: DharmaPatronRutinItem[];
  identitasList?: IdentitasItem[];
  organisasiList?: OrganisasiItem[];
  donasiOrders?: DonasiOrder[];
  mutasiItems?: MutasiItem[];
  onNavigateView?: (view: 'formIdentitas' | 'formOrganisasi') => void;
  onShowToast?: (message: string) => void;
}

export const FormListDharmaPatronRutin: React.FC<FormListDharmaPatronRutinProps> = ({
  onCancel,
  onSave,
  editingItem,
  existingItems = [],
  identitasList,
  organisasiList,
  donasiOrders,
  mutasiItems = [],
  onNavigateView,
  onShowToast,
}) => {
  const allIdentitas = identitasList && identitasList.length > 0 ? identitasList : INITIAL_IDENTITAS;

  // Selected Identitas
  const [selectedIdentitasId, setSelectedIdentitasId] = useState<string>('');
  const [isIdentitasDropdownOpen, setIsIdentitasDropdownOpen] = useState(false);
  const [identitasSearchQuery, setIdentitasSearchQuery] = useState('');

  // Auto-filled / derived fields from Identitas
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nomorHp, setNomorHp] = useState('');
  const [email, setEmail] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [pekerjaan, setPekerjaan] = useState('');

  // Form input fields
  const [namaDonatur, setNamaDonatur] = useState('');
  const [namaRekening, setNamaRekening] = useState('');
  const [pelimpahanJasaList, setPelimpahanJasaList] = useState<string[]>(['']);
  const [donasiPerbulan, setDonasiPerbulan] = useState<string>('');
  const [bulanMulaiDonasi, setBulanMulaiDonasi] = useState<string>('');
  const [isBulanDatePickerOpen, setIsBulanDatePickerOpen] = useState(false);
  const [penerimaBukuGratis, setPenerimaBukuGratis] = useState(false);
  const [idAlamat, setIdAlamat] = useState('');
  const [isAlamatDropdownOpen, setIsAlamatDropdownOpen] = useState(false);
  const [reminder, setReminder] = useState('');
  const [isReminderDropdownOpen, setIsReminderDropdownOpen] = useState(false);
  const [statusAktif, setStatusAktif] = useState<'Aktif' | 'Tidak Aktif'>('Aktif');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Top action bar states
  const [isPrivacyMasked, setIsPrivacyMasked] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const identitasRef = useRef<HTMLDivElement>(null);
  const alamatRef = useRef<HTMLDivElement>(null);
  const reminderRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Effective orders from prop or localStorage
  const effectiveDonasiOrders = useMemo<DonasiOrder[]>(() => {
    let list: DonasiOrder[] = [];
    if (donasiOrders && donasiOrders.length > 0) {
      list = donasiOrders;
    } else {
      try {
        const saved = localStorage.getItem('transaksi_donasi_orders_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    const map = new Map<string, DonasiOrder>();
    INITIAL_DONASI_ORDERS.forEach((o) => map.set(o.id, o));
    list.forEach((o) => map.set(o.id, o));
    return Array.from(map.values());
  }, [donasiOrders]);

  // Validasi otomatis piutang dari tanggal bergabung hingga bulan berjalan
  const liveValidation = useMemo<PatronPiutangValidationResult | null>(() => {
    const rawNominal = donasiPerbulan ? parseInt(donasiPerbulan.replace(/\D/g, ''), 10) : 100000;
    const targetDate = bulanMulaiDonasi.trim() || editingItem?.tanggalBergabung || '';
    if (!targetDate) return null;

    const mockPatron: DharmaPatronRutinItem = {
      id: editingItem?.id || 'temp',
      noDonatur: editingItem?.noDonatur || '00000',
      namaDonatur: namaDonatur.trim() || namaLengkap.trim() || 'Donatur',
      panggilan: '',
      avatarLetter: 'D',
      sumber: '',
      groupJarkom: '',
      namaRekening: namaRekening.trim(),
      donasiPerbulan: rawNominal,
      tanggalBergabung: targetDate,
      bulanMulaiDonasi: targetDate,
      namaPendek: '',
      keterangan: '',
      afiliasiKci: '',
      piutang: 0,
      bulanPiutang: '-',
      reminder: '',
      statusAktif: statusAktif,
      bulanDiputihkan: editingItem?.bulanDiputihkan,
      jenisPerubahanDonasi: editingItem?.jenisPerubahanDonasi,
      bulanMulaiPerubahanDonasi: editingItem?.bulanMulaiPerubahanDonasi,
      identitasId: selectedIdentitasId,
    };

    return validateAndCalculatePatronPiutang(mockPatron, effectiveDonasiOrders, mutasiItems);
  }, [
    bulanMulaiDonasi,
    donasiPerbulan,
    namaDonatur,
    namaLengkap,
    namaRekening,
    statusAktif,
    editingItem,
    selectedIdentitasId,
    effectiveDonasiOrders,
    mutasiItems,
  ]);

  // Prepopulate if editing
  useEffect(() => {
    if (editingItem) {
      setSelectedIdentitasId(editingItem.identitasId || '');
      setNamaDonatur(editingItem.namaDonatur || '');
      setNamaRekening(editingItem.namaRekening || '');
      if (editingItem.donasiPerbulan) {
        setDonasiPerbulan(new Intl.NumberFormat('id-ID').format(editingItem.donasiPerbulan));
      } else {
        setDonasiPerbulan('');
      }
      setBulanMulaiDonasi(editingItem.bulanMulaiDonasi || editingItem.tanggalBergabung || '');
      setPenerimaBukuGratis(!!editingItem.penerimaBukuGratis);
      setIdAlamat(editingItem.idAlamat || '');
      setReminder(editingItem.reminder || 'All');
      setStatusAktif(editingItem.statusAktif || (editingItem.jenisPerubahanDonasi?.toLowerCase() === 'berhenti' ? 'Tidak Aktif' : 'Aktif'));

      if (editingItem.pelimpahanJasa && editingItem.pelimpahanJasa.length > 0) {
        setPelimpahanJasaList(editingItem.pelimpahanJasa);
      } else if (editingItem.keterangan && editingItem.keterangan !== '-') {
        setPelimpahanJasaList([editingItem.keterangan]);
      } else {
        setPelimpahanJasaList(['']);
      }

      // If matched with identity
      const matched = allIdentitas.find((id) => id.id === editingItem.identitasId);
      if (matched) {
        setNamaLengkap(matched.namaLengkap);
        setNomorHp(matched.nomorHandPhone || '-');
        setEmail(matched.email || '-');
        setTanggalLahir(matched.tanggalLahir || '-');
        setPekerjaan(matched.pekerjaan || '-');
      } else {
        setNamaLengkap(editingItem.namaDonatur);
        setNomorHp(editingItem.nomorHp || '');
        setEmail(editingItem.email || '');
        setTanggalLahir(editingItem.tanggalLahir || '');
        setPekerjaan(editingItem.pekerjaan || '');
      }
    }
  }, [editingItem, allIdentitas]);

  // Handle Identity selection
  const handleSelectIdentity = (identity: IdentitasItem) => {
    setSelectedIdentitasId(identity.id);
    setNamaLengkap(identity.namaLengkap);
    setNomorHp(identity.nomorHandPhone || '-');
    setEmail(identity.email || '-');
    setTanggalLahir(identity.tanggalLahir || '-');
    setPekerjaan(identity.pekerjaan || '-');

    if (!namaDonatur) {
      setNamaDonatur(identity.namaLengkap);
    }
    if (!namaRekening) {
      setNamaRekening(identity.namaLengkap);
    }
    if (identity.alamatList && identity.alamatList.length > 0 && !idAlamat) {
      setIdAlamat(identity.alamatList[0].alamat || identity.alamatList[0].id || 'Alamat Utama');
    }
    setIsIdentitasDropdownOpen(false);
  };

  // Handle selection from unified IdentitasIdSelector
  const handleSelectIdentitasItem = (item: IdentitasIdSelectorItem) => {
    setSelectedIdentitasId(item.code || item.id);
    setNamaLengkap(item.name);
    setNamaDonatur(item.name);

    if (!namaRekening) {
      setNamaRekening(item.name);
    }

    if (item.rawIdentitas) {
      const id = item.rawIdentitas;
      setNomorHp(id.nomorHandPhone || '-');
      setEmail(id.email || '-');
      setTanggalLahir(id.tanggalLahir || '-');
      setPekerjaan(id.pekerjaan || '-');
      if (id.alamatList && id.alamatList.length > 0 && !idAlamat) {
        setIdAlamat(id.alamatList[0].alamat || id.alamatList[0].id || 'Alamat Utama');
      }
    } else if (item.rawOrganisasi) {
      const org = item.rawOrganisasi;
      setNomorHp(org.hp || '-');
      setEmail('-');
      setTanggalLahir('-');
      setPekerjaan(org.jenisOrg || 'Organisasi');
      if (org.kota) {
        setIdAlamat(`${org.kota}, ${org.provinsi || ''}`);
      }
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (identitasRef.current && !identitasRef.current.contains(e.target as Node)) {
        setIsIdentitasDropdownOpen(false);
      }
      if (alamatRef.current && !alamatRef.current.contains(e.target as Node)) {
        setIsAlamatDropdownOpen(false);
      }
      if (reminderRef.current && !reminderRef.current.contains(e.target as Node)) {
        setIsReminderDropdownOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Filtered identities for dropdown
  const filteredIdentitas = allIdentitas.filter((item) => {
    if (!identitasSearchQuery.trim()) return true;
    const q = identitasSearchQuery.toLowerCase();
    return (
      item.namaLengkap.toLowerCase().includes(q) ||
      (item.id && item.id.toLowerCase().includes(q)) ||
      (item.nomorIdentitas && item.nomorIdentitas.toLowerCase().includes(q)) ||
      (item.nomorHandPhone && item.nomorHandPhone.toLowerCase().includes(q))
    );
  });

  // Pelimpahan jasa handlers
  const handlePelimpahanChange = (index: number, val: string) => {
    const next = [...pelimpahanJasaList];
    next[index] = val;
    setPelimpahanJasaList(next);
  };

  const handleAddPelimpahan = () => {
    setPelimpahanJasaList([...pelimpahanJasaList, '']);
  };

  const handleClearPelimpahan = (index: number) => {
    if (pelimpahanJasaList.length === 1) {
      setPelimpahanJasaList(['']);
    } else {
      setPelimpahanJasaList(pelimpahanJasaList.filter((_, i) => i !== index));
    }
  };

  // Format currency input
  const handleDonasiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setDonasiPerbulan('');
      return;
    }
    const num = parseInt(raw, 10);
    setDonasiPerbulan(new Intl.NumberFormat('id-ID').format(num));
  };

  // Save handler
  const handleSave = () => {
    if (!namaRekening.trim()) {
      setErrorMessage('Nama rekening* wajib diisi.');
      return;
    }

    const effectiveNama = namaDonatur.trim() || namaLengkap.trim();

    // Ensure nama donatur is connected with Identitas or Organisasi
    let connectedIdentId = selectedIdentitasId.trim();
    if (!connectedIdentId) {
      const matchId = allIdentitas.find(
        (id) =>
          id.namaLengkap.toLowerCase().trim() === effectiveNama.toLowerCase().trim() ||
          (id.codeId && id.codeId === selectedIdentitasId)
      );
      if (matchId) {
        connectedIdentId = matchId.codeId || matchId.id;
        setSelectedIdentitasId(connectedIdentId);
      } else {
        const matchOrg = organisasiList.find(
          (org) =>
            org.namaOrg.toLowerCase().trim() === effectiveNama.toLowerCase().trim() ||
            org.id === selectedIdentitasId
        );
        if (matchOrg) {
          connectedIdentId = matchOrg.id;
          setSelectedIdentitasId(connectedIdentId);
        }
      }
    }

    if (!connectedIdentId) {
      setErrorMessage(
        'Semua nama donatur pada List Dharma Patron Rutin harus terkoneksi dengan Identitas atau Organisasi. Silakan pilih Identitas ID.'
      );
      return;
    }

    // Parse donasi
    const nominal = donasiPerbulan ? parseInt(donasiPerbulan.replace(/\D/g, ''), 10) : 100000;

    // Auto next number
    const numbers = existingItems
      .map((it) => parseInt(it.noDonatur.replace(/\D/g, ''), 10))
      .filter((n) => !isNaN(n));
    const nextNo = numbers.length > 0 ? Math.max(...numbers) + 1 : 36;
    const formattedNo = editingItem ? editingItem.noDonatur : nextNo.toString().padStart(5, '0');

    const today = new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const formattedDate = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

    const cleanPelimpahan = pelimpahanJasaList.filter((p) => p.trim().length > 0);

    const saved: DharmaPatronRutinItem = {
      id: editingItem ? editingItem.id : `dpr-${Date.now()}`,
      noDonatur: formattedNo,
      namaDonatur: effectiveNama || 'Donatur Baru',
      panggilan: effectiveNama.split(' ')[0],
      avatarLetter: effectiveNama.charAt(0).toUpperCase(),
      avatarBg: editingItem?.avatarBg || '#00a896',
      sumber: editingItem?.sumber || 'Brosur DP 1',
      groupJarkom: editingItem?.groupJarkom || 'All DPR 1',
      namaRekening: namaRekening.trim(),
      donasiPerbulan: nominal,
      tanggalBergabung: bulanMulaiDonasi.trim() || editingItem?.tanggalBergabung || formattedDate,
      namaPendek: effectiveNama.split(' ')[0],
      keterangan: cleanPelimpahan.length > 0 ? cleanPelimpahan.join(', ') : '-',
      afiliasiKci: editingItem?.afiliasiKci || 'MAH',
      piutang: liveValidation ? liveValidation.piutang : (editingItem ? editingItem.piutang : 0),
      bulanPiutang: liveValidation ? liveValidation.bulanPiutang : (editingItem ? editingItem.bulanPiutang : '-'),
      reminder: reminder.trim() || 'All',
      statusAktif: statusAktif,
      tanggalBerhenti: statusAktif === 'Tidak Aktif' ? (editingItem?.tanggalBerhenti || formattedDate) : undefined,
      jenisPerubahanDonasi: statusAktif === 'Tidak Aktif' ? (editingItem?.jenisPerubahanDonasi || 'Berhenti') : editingItem?.jenisPerubahanDonasi,
      identitasId: connectedIdentId,
      nomorHp: nomorHp || undefined,
      email: email || undefined,
      tanggalLahir: tanggalLahir || undefined,
      pekerjaan: pekerjaan || undefined,
      pelimpahanJasa: cleanPelimpahan,
      bulanMulaiDonasi: bulanMulaiDonasi || formattedDate,
      penerimaBukuGratis: penerimaBukuGratis,
      idAlamat: idAlamat || undefined,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    };

    onSave(saved);
  };

  const selectedIdentityObj = allIdentitas.find((id) => id.id === selectedIdentitasId);

  // Address options
  const addressOptions = selectedIdentityObj?.alamatList && selectedIdentityObj.alamatList.length > 0
    ? selectedIdentityObj.alamatList.map((a, idx) => a.alamat || `Alamat ${idx + 1}`)
    : ['Alamat Utama (KTP)', 'Alamat Domisili', 'Alamat Kantor'];

  const reminderOptions = ['All', 'No', 'Pending', 'Khusus WhatsApp', 'Email Saja'];

  return (
    <div className="w-full pb-16 animate-in fade-in duration-150">
      {/* Top Action Toolbar matching Image: EyeOff, Search, Sliders, + Add */}
      <div className="flex items-center justify-end gap-3 mb-8">
        <button
          type="button"
          onClick={() => {
            setIsPrivacyMasked(!isPrivacyMasked);
            if (onShowToast) {
              onShowToast(isPrivacyMasked ? 'Nominal ditampilkan' : 'Nominal disembunyikan');
            }
          }}
          title={isPrivacyMasked ? 'Tampilkan Nominal' : 'Sembunyikan Nominal'}
          aria-label={isPrivacyMasked ? 'Tampilkan Nominal' : 'Sembunyikan Nominal'}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
        >
          {isPrivacyMasked ? (
            <Eye className="w-5 h-5 stroke-[1.8] text-[#008d91]" />
          ) : (
            <EyeOff className="w-5 h-5 stroke-[1.8]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsSearchOpen(!isSearchOpen)}
          title="Cari"
          aria-label="Cari"
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          type="button"
          onClick={() => setFilterActive(!filterActive)}
          title="Filter"
          aria-label="Filter"
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            filterActive ? 'text-[#008d91]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          id="btn-form-save-dpr"
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] active:bg-[#046c76] text-white px-5 py-2 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl font-medium max-w-2xl">
          {errorMessage}
        </div>
      )}

      {/* Form Fields matching the exact layout of image.png */}
      <div className="space-y-4 max-w-4xl">
        {/* 1. Identitas ID matching image (2).png */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-10">
          <label className="sm:w-72 md:w-80 shrink-0 text-slate-700 font-normal text-sm sm:text-base">
            Identitas ID
          </label>
          <div className="relative w-full max-w-[420px]">
            <IdentitasIdSelector
              id="identitas-id-dpr"
              value={selectedIdentitasId ? `${selectedIdentitasId} ${namaLengkap || ''}`.trim() : ''}
              onSelect={handleSelectIdentitasItem}
              identitasList={identitasList}
              organisasiList={organisasiList}
              onNavigateView={onNavigateView}
            />
          </div>
        </div>

        {/* 2. Nama */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-10">
          <label className="sm:w-72 md:w-80 shrink-0 text-slate-700 font-normal text-sm sm:text-base">
            Nama
          </label>
          <div className="w-full max-w-[420px] bg-[#fff8f0] border border-[#fde6d2] rounded-2xl px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-2xs">
            <span className="text-xs sm:text-sm text-slate-700 font-normal truncate">
              {namaLengkap ? namaLengkap : 'Auto Input Berdasarkan data Form Identitas'}
            </span>
            <MoreVertical className="w-4 h-4 text-[#f59e0b] shrink-0 ml-2" />
          </div>
        </div>

        {/* 3. Nomor HP */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-10">
          <label className="sm:w-72 md:w-80 shrink-0 text-slate-700 font-normal text-sm sm:text-base">
            Nomor HP
          </label>
          <div className="w-full max-w-[420px] bg-[#fff8f0] border border-[#fde6d2] rounded-2xl px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-2xs">
            <span className="text-xs sm:text-sm text-slate-700 font-normal truncate">
              {nomorHp ? nomorHp : 'Auto Input Berdasarkan data Form Identitas'}
            </span>
            <MoreVertical className="w-4 h-4 text-[#f59e0b] shrink-0 ml-2" />
          </div>
        </div>

        {/* 4. Email */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-10">
          <label className="sm:w-72 md:w-80 shrink-0 text-slate-700 font-normal text-sm sm:text-base">
            Email
          </label>
          <div className="w-full max-w-[420px] bg-[#fff8f0] border border-[#fde6d2] rounded-2xl px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-2xs">
            <span className="text-xs sm:text-sm text-slate-700 font-normal truncate">
              {email ? email : 'Auto Input Berdasarkan data Form Identitas'}
            </span>
            <MoreVertical className="w-4 h-4 text-[#f59e0b] shrink-0 ml-2" />
          </div>
        </div>

        {/* 5. Tanggal Lahir */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-10">
          <label className="sm:w-72 md:w-80 shrink-0 text-slate-700 font-normal text-sm sm:text-base">
            Tanggal Lahir
          </label>
          <div className="w-full max-w-[420px] bg-[#fff8f0] border border-[#fde6d2] rounded-2xl px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-2xs">
            <span className="text-xs sm:text-sm text-slate-700 font-normal truncate">
              {tanggalLahir ? tanggalLahir : 'Auto Input Berdasarkan data Form Identitas'}
            </span>
            <MoreVertical className="w-4 h-4 text-[#f59e0b] shrink-0 ml-2" />
          </div>
        </div>

        {/* 6. Pekerjaan */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-10">
          <label className="sm:w-72 md:w-80 shrink-0 text-slate-700 font-normal text-sm sm:text-base">
            Pekerjaan
          </label>
          <div className="w-full max-w-[420px] bg-[#fff8f0] border border-[#fde6d2] rounded-2xl px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-2xs">
            <span className="text-xs sm:text-sm text-slate-700 font-normal truncate">
              {pekerjaan ? pekerjaan : 'Auto Input Berdasarkan data Form Identitas'}
            </span>
            <MoreVertical className="w-4 h-4 text-[#f59e0b] shrink-0 ml-2" />
          </div>
        </div>

        {/* 7. Nama donatur */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-10">
          <label className="sm:w-72 md:w-80 shrink-0 text-slate-700 font-normal text-sm sm:text-base">
            Nama donatur
          </label>
          <div className="w-full max-w-[420px]">
            <input
              id="input-form-nama-donatur"
              type="text"
              value={namaDonatur}
              onChange={(e) => setNamaDonatur(e.target.value)}
              placeholder="Input Text..."
              className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#008d91] shadow-2xs transition-colors"
            />
          </div>
        </div>

        {/* 8. Nama rekening* */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-10">
          <label className="sm:w-72 md:w-80 shrink-0 text-slate-700 font-normal text-sm sm:text-base">
            Nama rekening*
          </label>
          <div className="w-full max-w-[420px]">
            <input
              id="input-form-nama-rekening"
              type="text"
              value={namaRekening}
              onChange={(e) => setNamaRekening(e.target.value)}
              placeholder="Input Text..."
              required
              className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#008d91] shadow-2xs transition-colors"
            />
          </div>
        </div>

        {/* 9. Pelimpahan Jasa */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-start gap-2 sm:gap-10">
          <label className="sm:w-72 md:w-80 shrink-0 text-slate-700 font-normal text-sm sm:text-base pt-2.5">
            Pelimpahan Jasa
          </label>
          <div className="w-full max-w-[420px] space-y-2">
            {pelimpahanJasaList.map((pelimpahan, index) => (
              <div key={index} className="relative flex items-center">
                <input
                  type="text"
                  value={pelimpahan}
                  onChange={(e) => handlePelimpahanChange(index, e.target.value)}
                  placeholder="Input Text..."
                  className="w-full bg-white border border-slate-200/90 rounded-2xl pl-4 pr-16 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#008d91] shadow-2xs transition-colors"
                />
                <div className="absolute right-3.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleClearPelimpahan(index)}
                    className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 cursor-pointer"
                    title="Hapus"
                  >
                    <X className="w-4 h-4 stroke-[2]" />
                  </button>
                  {index === pelimpahanJasaList.length - 1 && (
                    <button
                      type="button"
                      onClick={handleAddPelimpahan}
                      className="w-5 h-5 rounded-full bg-[#008d91] hover:bg-[#04777b] text-white flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                      title="Tambah Pelimpahan"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 10. Donasi/bulan */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-10">
          <label className="sm:w-72 md:w-80 shrink-0 text-slate-700 font-normal text-sm sm:text-base">
            Donasi/bulan
          </label>
          <div className="w-full max-w-[420px] bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 sm:py-3 flex items-center shadow-2xs focus-within:border-[#008d91] transition-colors">
            <span className="text-[#008d91] font-bold text-xs sm:text-sm mr-2 select-none">
              Rp
            </span>
            <input
              id="input-form-donasi-bulan"
              type="text"
              value={isPrivacyMasked && donasiPerbulan ? '••••••••' : donasiPerbulan}
              onChange={handleDonasiChange}
              disabled={isPrivacyMasked}
              placeholder="Input Nominal..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none"
            />
          </div>
        </div>

        {/* 11. Bulan mulai donasi */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-10">
          <label className="sm:w-72 md:w-80 shrink-0 text-slate-700 font-normal text-sm sm:text-base">
            Bulan mulai donasi
          </label>
          <div className="relative w-full max-w-[420px]">
            <div className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-2xs focus-within:border-[#008d91] transition-colors">
              <input
                id="input-form-bulan-mulai"
                type="text"
                value={bulanMulaiDonasi}
                onChange={(e) => setBulanMulaiDonasi(e.target.value)}
                placeholder="Input Date..."
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none"
              />
              <button
                type="button"
                onClick={() => setIsBulanDatePickerOpen(!isBulanDatePickerOpen)}
                className="text-[#008d91] hover:text-[#04777b] p-0.5 cursor-pointer ml-2"
                title="Pilih Tanggal"
              >
                <CalendarIcon className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* Quick date picker presets */}
            {isBulanDatePickerOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 animate-in fade-in duration-150">
                <span className="block text-[11px] font-semibold text-slate-400 mb-2">PILIH BULAN CEPAT</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {['Jan 2021', 'Feb 2021', 'Mar 2021', 'Apr 2021', 'Mei 2021', 'Jun 2021', 'Jul 2021', 'Agu 2021', 'Sep 2021', 'Okt 2021', 'Nov 2021', 'Des 2021'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setBulanMulaiDonasi(m);
                        setIsBulanDatePickerOpen(false);
                      }}
                      className="px-2.5 py-1.5 rounded-lg text-xs hover:bg-[#008d91]/10 hover:text-[#008d91] text-slate-700 transition-colors text-center"
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-100">
                  <span className="block text-[11px] font-semibold text-slate-400 mb-1">Pilih Tanggal / Bulan Lain:</span>
                  <input
                    type="date"
                    onChange={(e) => {
                      if (e.target.value) {
                        setBulanMulaiDonasi(formatDatePickerValue(e.target.value));
                        setIsBulanDatePickerOpen(false);
                      }
                    }}
                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg text-slate-600 focus:outline-hidden cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Validasi Piutang Otomatis (Real-time dari Tanggal Bergabung s/d Bulan Berjalan) */}
        {liveValidation && (
          <div className="flex flex-col sm:flex-row sm:items-start justify-start gap-2 sm:gap-10">
            <span className="sm:w-72 md:w-80 shrink-0 text-slate-500 font-medium text-xs sm:text-sm pt-1">
              Validasi Piutang Otomatis
            </span>
            <div className="w-full max-w-[420px] bg-gradient-to-br from-teal-50/40 via-white to-slate-50 border border-teal-200/80 rounded-2xl p-4 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  Status Piutang Berjalan:
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    liveValidation.piutang < 0
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {liveValidation.piutang < 0
                    ? `-Rp${Math.abs(liveValidation.piutang).toLocaleString('id-ID')}`
                    : 'Rp0 (Lunas)'}
                </span>
              </div>

              <div className="text-[11px] text-slate-600 space-y-1.5 pt-1.5 border-t border-teal-100/80">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Periode Komitmen:</span>
                  <span className="font-semibold text-slate-800">
                    {liveValidation.startMonthName} s/d {liveValidation.currentMonthName} {liveValidation.currentYear} ({liveValidation.totalExpectedMonths} bulan)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Transaksi Lunas (Mutasi):</span>
                  <span className="font-semibold text-emerald-700">
                    {liveValidation.totalPaidMonths} bulan {liveValidation.paidMonths.length > 0 ? `(${liveValidation.paidMonths.join(', ')})` : ''}
                  </span>
                </div>
                {liveValidation.totalDiputihkanMonths > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Bulan Diputihkan:</span>
                    <span className="font-semibold text-amber-700">
                      {liveValidation.totalDiputihkanMonths} bulan ({liveValidation.diputihkanMonths.join(', ')})
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center font-bold pt-1.5 border-t border-teal-100/80">
                  <span className="text-slate-700">Bulan Menunggak:</span>
                  <span className={liveValidation.totalUnpaidMonths > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                    {liveValidation.bulanPiutang} ({liveValidation.totalUnpaidMonths} bulan)
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                *Dihitung otomatis sejak bulan tanggal bergabung hingga bulan berjalan dengan mempertimbangkan transaksi D-DONASI lunas dan pemutihan donasi.
              </p>
            </div>
          </div>
        )}

        {/* 12. Menjadi Penerima Buku Tidak Berbayar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-10">
          <label className="sm:w-72 md:w-80 shrink-0 text-slate-700 font-normal text-sm sm:text-base">
            Menjadi Penerima Buku Tidak Berbayar
          </label>
          <div className="w-full max-w-[420px] flex items-center">
            <button
              id="chk-penerima-buku"
              type="button"
              onClick={() => setPenerimaBukuGratis(!penerimaBukuGratis)}
              className={`w-6 h-6 rounded-md border-2 border-[#008d91] flex items-center justify-center transition-all cursor-pointer ${
                penerimaBukuGratis ? 'bg-[#008d91] text-white shadow-2xs' : 'bg-white hover:bg-[#008d91]/5'
              }`}
              title="Centang jika penerima buku tidak berbayar"
            >
              {penerimaBukuGratis && <Check className="w-4 h-4 stroke-[3]" />}
            </button>
          </div>
        </div>

        {/* 13. ID Alamat */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-10">
          <label className="sm:w-72 md:w-80 shrink-0 text-slate-700 font-normal text-sm sm:text-base">
            ID Alamat
          </label>
          <div ref={alamatRef} className="relative w-full max-w-[420px]">
            <div
              onClick={() => setIsAlamatDropdownOpen(!isAlamatDropdownOpen)}
              className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
            >
              <span className={`text-xs sm:text-sm truncate ${idAlamat ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                {idAlamat || 'Search...'}
              </span>
              <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 shadow-2xs ml-2">
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            {isAlamatDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 max-h-52 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                {addressOptions.map((addr) => (
                  <button
                    key={addr}
                    type="button"
                    onClick={() => {
                      setIdAlamat(addr);
                      setIsAlamatDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 text-slate-700 transition-colors truncate"
                  >
                    {addr}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 14. Reminder? */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-10">
          <label className="sm:w-72 md:w-80 shrink-0 text-slate-700 font-normal text-sm sm:text-base">
            Reminder?
          </label>
          <div ref={reminderRef} className="relative w-full max-w-[420px]">
            <div
              onClick={() => setIsReminderDropdownOpen(!isReminderDropdownOpen)}
              className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
            >
              <span className={`text-xs sm:text-sm truncate ${reminder ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                {reminder || 'Search...'}
              </span>
              <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 shadow-2xs ml-2">
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            {isReminderDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150">
                {reminderOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setReminder(opt);
                      setIsReminderDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 15. Aktif/Tidak */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-start gap-2 sm:gap-10">
          <label className="sm:w-72 md:w-80 shrink-0 text-slate-700 font-normal text-sm sm:text-base">
            Aktif/Tidak
          </label>
          <div ref={statusRef} className="relative w-full max-w-[420px]">
            <div
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 sm:py-3 flex items-center justify-between shadow-2xs hover:border-slate-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center justify-center text-xs font-semibold px-3 py-0.5 rounded-full text-white shadow-2xs ${
                    statusAktif === 'Aktif' ? 'bg-[#008d91]' : 'bg-rose-600'
                  }`}
                >
                  {statusAktif}
                </span>
                <span className="text-xs text-slate-500">
                  {statusAktif === 'Aktif' ? '(Highlight Tosca)' : '(Highlight Merah)'}
                </span>
              </div>
              <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 shadow-2xs ml-2">
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            {isStatusDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setStatusAktif('Aktif');
                    setIsStatusDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold text-teal-800">Aktif</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#008d91] text-white">
                    Tosca
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusAktif('Tidak Aktif');
                    setIsStatusDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-slate-50 flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold text-rose-800">Tidak Aktif (Berhenti)</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white">
                    Merah
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions for Mobile & Quick Save */}
        <div className="pt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke List</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#008d91] hover:bg-[#05828e] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Simpan Donatur</span>
          </button>
        </div>
      </div>
    </div>
  );
};
