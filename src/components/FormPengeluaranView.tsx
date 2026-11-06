import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar,
  ChevronDown,
  Eye,
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  Image as ImageIcon,
  Check,
  X,
  FileText,
  AlertCircle,
  FolderGit2,
} from 'lucide-react';
import { PengeluaranItem, ProjectItem, JenisProyekItem } from '../types';
import { PosPengeluaranGroup } from '../posPengeluaranData';
import { KebutuhanPengeluaranItem } from '../kebutuhanPengeluaranData';
import { KumpulanRekeningItem } from '../kumpulanRekeningData';
import { IdentitasItem } from '../identitasData';
import { getPresetReceipt } from '../utils/receiptGenerator';

interface FormPengeluaranViewProps {
  initialItem?: PengeluaranItem | null;
  initialPerson?: IdentitasItem | null;
  existingItems?: PengeluaranItem[];
  identitasList?: IdentitasItem[];
  projects?: ProjectItem[];
  jenisProyekList?: JenisProyekItem[];
  posPengeluaranList?: PosPengeluaranGroup[];
  kebutuhanPengeluaranList?: KebutuhanPengeluaranItem[];
  kumpulanRekeningList?: KumpulanRekeningItem[];
  divisiPresets?: string[];
  onSave: (savedItem: PengeluaranItem) => void;
  onCancel: () => void;
  onShowToast?: (msg: string) => void;
}

export const FormPengeluaranView: React.FC<FormPengeluaranViewProps> = ({
  initialItem,
  initialPerson,
  existingItems = [],
  identitasList = [],
  projects = [],
  jenisProyekList = [],
  posPengeluaranList = [],
  kebutuhanPengeluaranList = [],
  kumpulanRekeningList = [],
  divisiPresets = ['UMM', 'PNB', 'MAD', 'EVE', 'FIN', 'DIR'],
  onSave,
  onCancel,
  onShowToast,
}) => {
  const [tanggal, setTanggal] = useState('');
  const [proyekSapa, setProyekSapa] = useState('');
  const [rincianProyekSapa, setRincianProyekSapa] = useState('');
  const [divisi, setDivisi] = useState('');
  const [kebutuhan, setKebutuhan] = useState('');
  const [posKeluar, setPosKeluar] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [nominal, setNominal] = useState<number | ''>('');
  const [dikeluarkan, setDikeluarkan] = useState('');
  const [isManualDikeluarkan, setIsManualDikeluarkan] = useState(false);
  const [buktiBonUrl, setBuktiBonUrl] = useState<string>('');
  const [buktiBonFileName, setBuktiBonFileName] = useState<string>('');
  const [no, setNo] = useState('');
  const [jenis, setJenis] = useState('ALL');

  // Mini toolbar states (matching image.png)
  const [isPrivacyMasked, setIsPrivacyMasked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Dropdown open states
  const [isProyekDropdownOpen, setIsProyekDropdownOpen] = useState(false);
  const [isDivisiDropdownOpen, setIsDivisiDropdownOpen] = useState(false);
  const [isKebutuhanDropdownOpen, setIsKebutuhanDropdownOpen] = useState(false);
  const [isPosKeluarDropdownOpen, setIsPosKeluarDropdownOpen] = useState(false);
  const [isDikeluarkanDropdownOpen, setIsDikeluarkanDropdownOpen] = useState(false);

  // Search queries inside dropdowns
  const [proyekSearch, setProyekSearch] = useState('');
  const [kebutuhanSearch, setKebutuhanSearch] = useState('');
  const [dikeluarkanSearch, setDikeluarkanSearch] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initializing state
  useEffect(() => {
    if (initialItem) {
      setTanggal(initialItem.tanggal || '');
      setProyekSapa(initialItem.proyekSapa || '');
      setRincianProyekSapa(initialItem.rincianProyekSapa || '');
      setDivisi(initialItem.divisi || '');
      setKebutuhan(initialItem.kebutuhan || '');
      setPosKeluar(initialItem.posKeluar || '');
      setKeterangan(initialItem.keterangan || '');
      setNominal(initialItem.nominal !== undefined ? initialItem.nominal : '');
      setDikeluarkan(initialItem.dikeluarkan || '');
      setBuktiBonUrl(initialItem.buktiBonUrl || '');
      setBuktiBonFileName(initialItem.buktiBonFileName || '');
      setNo(initialItem.no || '');
      setJenis(initialItem.jenis || 'ALL');
      setIsManualDikeluarkan(false);
    } else {
      // Find highest number in existing items
      const numbers = existingItems
        .map((it) => parseInt(it.no, 10))
        .filter((n) => !isNaN(n));
      const nextNo = numbers.length > 0 ? Math.max(...numbers) + 1 : 196;

      const today = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const formattedDate = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

      setTanggal(formattedDate);
      // Sesuai permintaan pengguna: bagian project SAPA dan rincian project SAPA awalnya dikosongkan
      setProyekSapa('');
      setRincianProyekSapa('');
      setDivisi(initialPerson?.organisasi || divisiPresets[0] || 'UMM');
      setKebutuhan('');
      setPosKeluar('');
      setKeterangan('');
      setNominal('');

      // Jika dibuka dari identitas orang, otomatis isikan orang tersebut pada "Dikeluarkan oleh"
      if (initialPerson) {
        setDikeluarkan(initialPerson.namaLengkap);
      } else {
        const defaultDikeluarkan = kumpulanRekeningList[0]?.atasNama || 'Agustino';
        setDikeluarkan(defaultDikeluarkan);
      }

      setIsManualDikeluarkan(false);
      setBuktiBonUrl('');
      setBuktiBonFileName('');
      setNo(nextNo.toString());
      setJenis('ALL');
    }
    setErrorMsg('');
  }, [initialItem, existingItems, initialPerson]);

  // Determine if the selected Proyek SAPA has a COA
  const selectedProjectObj = projects.find((p) => p.namaKegiatan === proyekSapa);
  const matchedJenisProyek = selectedProjectObj
    ? jenisProyekList.find(
        (jp) =>
          jp.jenisKegiatan.trim().toLowerCase() ===
          (selectedProjectObj.jenisProyek || '').trim().toLowerCase()
      )
    : null;

  const projectCoaAccount =
    matchedJenisProyek && matchedJenisProyek.isCoa && matchedJenisProyek.coaCode
      ? {
          coaCode: matchedJenisProyek.coaCode,
          coaName: matchedJenisProyek.coaName || matchedJenisProyek.jenisKegiatan,
          fullName: `${matchedJenisProyek.coaCode} ${matchedJenisProyek.coaName || matchedJenisProyek.jenisKegiatan}`,
        }
      : null;

  // Determine Pos Keluar options based on Kebutuhan & Proyek SAPA
  const matchedKebutuhanObj = kebutuhanPengeluaranList.find(
    (k) => k.kebutuhan.trim().toLowerCase() === kebutuhan.trim().toLowerCase()
  );
  const posKebutuhan = matchedKebutuhanObj?.posPengeluaran || '';

  // Calculate available Pos Keluar choices
  const availablePosKeluarOptions = React.useMemo(() => {
    const list: { label: string; value: string; type: 'coa-proyek' | 'kebutuhan' | 'standard' }[] = [];

    // 1. If Proyek SAPA has COA:
    if (projectCoaAccount) {
      list.push({
        label: `[COA Proyek] ${projectCoaAccount.fullName}`,
        value: projectCoaAccount.fullName,
        type: 'coa-proyek',
      });
    }

    // 2. If Kebutuhan has mapped Pos Pengeluaran:
    if (posKebutuhan) {
      list.push({
        label: `[Pos Kebutuhan] ${posKebutuhan}`,
        value: posKebutuhan,
        type: 'kebutuhan',
      });
    }

    // 3. Other Pos Pengeluaran groups
    posPengeluaranList.forEach((p) => {
      const val = p.namaPosPengeluaran;
      if (!list.some((it) => it.value === val)) {
        list.push({
          label: val,
          value: val,
          type: 'standard',
        });
      }
    });

    return list;
  }, [projectCoaAccount, posKebutuhan, posPengeluaranList]);

  // Handle Proyek SAPA selection
  const handleSelectProyekSapa = (projName: string) => {
    setProyekSapa(projName);
    setIsProyekDropdownOpen(false);

    const found = projects.find((p) => p.namaKegiatan === projName);
    if (found && found.divisi) {
      setDivisi(found.divisi);
    }

    // Check if newly selected project has COA
    const foundJp = found
      ? jenisProyekList.find(
          (jp) =>
            jp.jenisKegiatan.trim().toLowerCase() ===
            (found.jenisProyek || '').trim().toLowerCase()
        )
      : null;

    if (foundJp && foundJp.isCoa && foundJp.coaCode) {
      const coaFullName = `${foundJp.coaCode} ${foundJp.coaName || foundJp.jenisKegiatan}`;
      // If user hasn't set posKeluar or if they want to default to project's COA
      if (!posKeluar) {
        setPosKeluar(coaFullName);
      }
    }
  };

  // Handle Kebutuhan selection
  const handleSelectKebutuhan = (kebutuhanName: string) => {
    setKebutuhan(kebutuhanName);
    setIsKebutuhanDropdownOpen(false);

    const matched = kebutuhanPengeluaranList.find(
      (k) => k.kebutuhan.trim().toLowerCase() === kebutuhanName.trim().toLowerCase()
    );

    if (matched && matched.posPengeluaran) {
      // If project has COA, keep choice open or prioritize project COA/kebutuhan
      if (projectCoaAccount) {
        // If posKeluar is empty or not matching, default to kebutuhan's posPengeluaran or COA
        if (!posKeluar) {
          setPosKeluar(matched.posPengeluaran);
        }
      } else {
        setPosKeluar(matched.posPengeluaran);
      }
    }
  };

  // Handle Image Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBuktiBonFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setBuktiBonUrl(reader.result as string);
      if (onShowToast) {
        onShowToast(`Gambar bon "${file.name}" berhasil dilampirkan`);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tanggal.trim()) {
      setErrorMsg('Tanggal wajib diisi');
      return;
    }
    if (!posKeluar.trim()) {
      setErrorMsg('Pos Keluar wajib dipilih');
      return;
    }
    if (!kebutuhan.trim()) {
      setErrorMsg('Kebutuhan wajib diisi');
      return;
    }
    if (!keterangan.trim()) {
      setErrorMsg('Keterangan wajib diisi');
      return;
    }
    if (nominal === '' || Number(nominal) <= 0) {
      setErrorMsg('Nominal harus lebih dari 0');
      return;
    }

    const numericNominal = typeof nominal === 'number' ? nominal : parseFloat(nominal);

    // Auto generate receipt if none uploaded
    const finalReceiptUrl =
      buktiBonUrl ||
      getPresetReceipt(
        no || '196',
        keterangan,
        numericNominal,
        tanggal,
        dikeluarkan || 'Agustino'
      );
    const finalReceiptFileName = buktiBonFileName || `struk-pengeluaran-${no || '196'}.png`;

    const saved: PengeluaranItem = {
      id: initialItem ? initialItem.id : `pengeluaran-${Date.now()}`,
      tanggal: tanggal.trim(),
      divisi: divisi.trim() || 'UMM',
      proyekSapa: proyekSapa.trim() || undefined,
      rincianProyekSapa: rincianProyekSapa.trim() || undefined,
      posKeluar: posKeluar.trim(),
      kebutuhan: kebutuhan.trim(),
      keterangan: keterangan.trim(),
      nominal: numericNominal,
      jenis: jenis || 'ALL',
      no: no || '196',
      noBadgeColor: 'teal',
      dikeluarkan: dikeluarkan.trim() || 'Agustino',
      buktiBonUrl: finalReceiptUrl,
      buktiBonFileName: finalReceiptFileName,
      buktiBonUploadedAt: new Date().toISOString(),
      createdAt: initialItem?.createdAt || new Date().toISOString(),
      mutasiId: initialItem?.mutasiId,
      mutasiKode: initialItem?.mutasiKode,
      mutasiKeterangan: initialItem?.mutasiKeterangan,
      mutasiDate: initialItem?.mutasiDate,
      mutasiAmount: initialItem?.mutasiAmount,
    };

    onSave(saved);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsProyekDropdownOpen(false);
        setIsDivisiDropdownOpen(false);
        setIsKebutuhanDropdownOpen(false);
        setIsPosKeluarDropdownOpen(false);
        setIsDikeluarkanDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Filter previous expenses by this person to display the No. badges matching user screenshot (Image 1)
  const personExpenses = React.useMemo(() => {
    if (!dikeluarkan) return [];
    const clean = dikeluarkan.toLowerCase().trim();
    return existingItems.filter(
      (it) => it.dikeluarkan && it.dikeluarkan.toLowerCase().trim().includes(clean)
    );
  }, [dikeluarkan, existingItems]);

  return (
    <div className="w-full max-w-5xl mx-auto py-2 px-3 sm:px-6">
      {/* Mini Action Toolbar matching image.png top-right */}
      <div className="flex items-center justify-end gap-3 mb-6">
        <button
          type="button"
          onClick={() => {
            setIsPrivacyMasked(!isPrivacyMasked);
            if (onShowToast) {
              onShowToast(isPrivacyMasked ? 'Nominal ditampilkan' : 'Nominal disamarkan');
            }
          }}
          title={isPrivacyMasked ? 'Tampilkan' : 'Sembunyikan'}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
        >
          {isPrivacyMasked ? (
            <Eye className="w-5 h-5 text-[#008d91]" />
          ) : (
            <EyeOff className="w-5 h-5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            if (onShowToast) onShowToast('Gunakan kolom isian di bawah untuk mengisi form');
          }}
          title="Search"
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => {
            if (onShowToast) onShowToast('Filter form pengeluaran');
          }}
          title="Filter"
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => {
            // Reset form to clear inputs
            setProyekSapa('');
            setRincianProyekSapa('');
            setKebutuhan('');
            setPosKeluar('');
            setKeterangan('');
            setNominal('');
            setBuktiBonUrl('');
            setBuktiBonFileName('');
            if (onShowToast) onShowToast('Form dikosongkan untuk input baru');
          }}
          className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#007b7f] text-white px-5 py-2 rounded-xl font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Previous expenses badges for this identity matching Image 1: No. 185, 186, 187, 188, 189 */}
      {personExpenses.length > 0 && (
        <div className="mb-5 bg-white rounded-2xl border border-slate-100 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">
              Riwayat Pengeluaran oleh <strong className="text-[#008d91]">{dikeluarkan}</strong>:
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1">No.</span>
            {personExpenses.map((p) => {
              const isTeal = p.noBadgeColor === 'teal' || (p.buktiBonUrl && p.mutasiId);
              const isRed = p.noBadgeColor === 'red' || (p.buktiBonUrl && !p.mutasiId);
              return (
                <span
                  key={p.id}
                  title={`No. ${p.no}: ${p.keterangan} - Rp ${p.nominal.toLocaleString('id-ID')} (${p.tanggal})`}
                  className={`inline-flex items-center justify-center font-semibold text-xs px-3.5 py-1 rounded-full shadow-2xs ${
                    isTeal
                      ? 'bg-[#008d91] text-white'
                      : isRed
                      ? 'bg-[#ef4444] text-white'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {p.no}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form Fields Layout matching image.png exactly */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Row 1: Tanggal */}
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="w-full sm:w-56 text-slate-700 text-sm sm:text-base font-normal mb-1.5 sm:mb-0">
            Tanggal
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              placeholder="Input Date..."
              required
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 sm:py-3.5 pr-12 text-sm sm:text-base text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#008d91] shadow-2xs"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#008d91]">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Row 2: Proyek SAPA */}
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="w-full sm:w-56 text-slate-700 text-sm sm:text-base font-normal mb-1.5 sm:mb-0">
            Proyek SAPA
          </div>
          <div className="flex-1 relative dropdown-container">
            <div
              onClick={() => setIsProyekDropdownOpen(!isProyekDropdownOpen)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 sm:py-3.5 pr-12 text-sm sm:text-base text-slate-700 cursor-pointer flex items-center justify-between shadow-2xs select-none"
            >
              <span className={proyekSapa ? 'text-slate-800 font-medium' : 'text-slate-300'}>
                {proyekSapa || 'Search...'}
              </span>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center pointer-events-none shadow-2xs">
                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>

            {/* Dropdown Menu */}
            {isProyekDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-2 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                <div className="p-1 mb-1">
                  <input
                    type="text"
                    value={proyekSearch}
                    onChange={(e) => setProyekSearch(e.target.value)}
                    placeholder="Ketik untuk mencari Proyek SAPA..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-[#008d91]"
                  />
                </div>
                <div
                  onClick={() => handleSelectProyekSapa('')}
                  className="px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 rounded-xl cursor-pointer"
                >
                  -- Tanpa Proyek SAPA (Pengeluaran Umum) --
                </div>
                {projects
                  .filter((p) =>
                    !proyekSearch ||
                    p.namaKegiatan.toLowerCase().includes(proyekSearch.toLowerCase()) ||
                    p.divisi.toLowerCase().includes(proyekSearch.toLowerCase()) ||
                    (p.jenisProyek && p.jenisProyek.toLowerCase().includes(proyekSearch.toLowerCase()))
                  )
                  .map((p) => {
                    const jp = jenisProyekList.find(
                      (j) => j.jenisKegiatan.trim().toLowerCase() === (p.jenisProyek || '').trim().toLowerCase()
                    );
                    const hasCoa = jp && jp.isCoa && jp.coaCode;

                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectProyekSapa(p.namaKegiatan)}
                        className={`px-3 py-2 text-xs rounded-xl cursor-pointer flex items-center justify-between ${
                          proyekSapa === p.namaKegiatan
                            ? 'bg-teal-50 text-[#008d91] font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            {p.divisi}
                          </span>
                          <span className="truncate">{p.namaKegiatan}</span>
                        </div>
                        {hasCoa && (
                          <span className="shrink-0 text-[10px] font-mono bg-teal-100 text-[#008d91] px-2 py-0.5 rounded-full ml-2">
                            COA: {jp.coaCode}
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Row 2b: Rincian Proyek SAPA */}
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="w-full sm:w-56 text-slate-700 text-sm sm:text-base font-normal mb-1.5 sm:mb-0">
            Rincian Proyek SAPA
          </div>
          <div className="flex-1 relative">
            <input
              type="text"
              value={rincianProyekSapa}
              onChange={(e) => setRincianProyekSapa(e.target.value)}
              placeholder="Input Rincian Proyek SAPA (opsional)..."
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 sm:py-3.5 text-sm sm:text-base text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#008d91] shadow-2xs"
            />
          </div>
        </div>

        {/* Row 3: Divisi */}
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="w-full sm:w-56 text-slate-700 text-sm sm:text-base font-normal mb-1.5 sm:mb-0">
            Divisi
          </div>
          <div className="flex-1 relative dropdown-container">
            <div
              onClick={() => setIsDivisiDropdownOpen(!isDivisiDropdownOpen)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 sm:py-3.5 pr-12 text-sm sm:text-base text-slate-700 cursor-pointer flex items-center justify-between shadow-2xs select-none"
            >
              <span className={divisi ? 'text-slate-800 font-medium' : 'text-slate-300'}>
                {divisi || 'Search...'}
              </span>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center pointer-events-none shadow-2xs">
                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>

            {isDivisiDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="grid grid-cols-3 gap-1.5">
                  {divisiPresets.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDivisi(d);
                        setIsDivisiDropdownOpen(false);
                      }}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                        divisi === d
                          ? 'bg-[#008d91] text-white'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 4: Kebutuhan */}
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="w-full sm:w-56 text-slate-700 text-sm sm:text-base font-normal mb-1.5 sm:mb-0 flex items-center justify-between sm:justify-start gap-2">
            <span>Kebutuhan</span>
            {kebutuhan && (
              <span className="sm:hidden text-[11px] text-[#008d91] font-medium">Auto Pos Keluar</span>
            )}
          </div>
          <div className="flex-1 relative dropdown-container">
            <div
              onClick={() => setIsKebutuhanDropdownOpen(!isKebutuhanDropdownOpen)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 sm:py-3.5 pr-12 text-sm sm:text-base text-slate-700 cursor-pointer flex items-center justify-between shadow-2xs select-none"
            >
              <span className={kebutuhan ? 'text-slate-800 font-medium' : 'text-slate-300'}>
                {kebutuhan || 'Search...'}
              </span>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center pointer-events-none shadow-2xs">
                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>

            {isKebutuhanDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-2 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                <div className="p-1 mb-1">
                  <input
                    type="text"
                    value={kebutuhanSearch}
                    onChange={(e) => setKebutuhanSearch(e.target.value)}
                    placeholder="Cari kebutuhan pengeluaran..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-[#008d91]"
                  />
                </div>
                {kebutuhanPengeluaranList
                  .filter((k) =>
                    !kebutuhanSearch ||
                    k.kebutuhan.toLowerCase().includes(kebutuhanSearch.toLowerCase()) ||
                    k.posPengeluaran.toLowerCase().includes(kebutuhanSearch.toLowerCase()) ||
                    k.kelompokBiaya.toLowerCase().includes(kebutuhanSearch.toLowerCase())
                  )
                  .map((k) => (
                    <div
                      key={k.id}
                      onClick={() => handleSelectKebutuhan(k.kebutuhan)}
                      className={`px-3 py-2 text-xs rounded-xl cursor-pointer flex items-center justify-between ${
                        kebutuhan === k.kebutuhan
                          ? 'bg-teal-50 text-[#008d91] font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {k.noAkunCoa && (
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100/80 text-teal-800 border border-teal-200">
                            #{k.noAkunCoa}
                          </span>
                        )}
                        <span className="font-medium">{k.kebutuhan}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {k.posPengeluaran} • {k.kelompokBiaya}
                      </span>
                    </div>
                  ))}
                <div className="p-2 border-t border-slate-100 mt-1">
                  <input
                    type="text"
                    value={kebutuhan}
                    onChange={(e) => setKebutuhan(e.target.value)}
                    placeholder="Atau ketik kebutuhan manual..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-[#008d91]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 5: Pos Keluar */}
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="w-full sm:w-56 text-slate-700 text-sm sm:text-base font-normal mb-1.5 sm:mb-0">
            Pos Keluar
          </div>
          <div className="flex-1 relative dropdown-container">
            <div
              onClick={() => setIsPosKeluarDropdownOpen(!isPosKeluarDropdownOpen)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 sm:py-3.5 pr-12 text-sm sm:text-base text-slate-700 cursor-pointer flex items-center justify-between shadow-2xs select-none"
            >
              <span className={posKeluar ? 'text-slate-800 font-medium' : 'text-slate-300'}>
                {posKeluar || 'Search...'}
              </span>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center pointer-events-none shadow-2xs">
                <ChevronDown className="w-4 h-4 stroke-[2.5]" />
              </div>
            </div>

            {/* Dropdown Options */}
            {isPosKeluarDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-2 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                {projectCoaAccount && (
                  <div className="mb-2 p-1.5 bg-teal-50/70 border border-teal-100 rounded-xl">
                    <div className="text-[10px] font-semibold text-[#008d91] px-1.5 mb-1 flex items-center gap-1">
                      <FolderGit2 className="w-3 h-3" />
                      COA Proyek SAPA:
                    </div>
                    <div
                      onClick={() => {
                        setPosKeluar(projectCoaAccount.fullName);
                        setIsPosKeluarDropdownOpen(false);
                      }}
                      className={`px-3 py-2 text-xs rounded-lg cursor-pointer flex items-center justify-between font-mono font-medium ${
                        posKeluar === projectCoaAccount.fullName
                          ? 'bg-[#008d91] text-white'
                          : 'bg-white text-teal-800 hover:bg-teal-100/50'
                      }`}
                    >
                      <span>{projectCoaAccount.fullName}</span>
                      <span className="text-[10px] bg-white/30 px-1.5 py-0.5 rounded">Pilihan COA Proyek</span>
                    </div>
                  </div>
                )}

                {posKebutuhan && (
                  <div className="mb-2 p-1.5 bg-slate-50 border border-slate-200/60 rounded-xl">
                    <div className="text-[10px] font-semibold text-slate-500 px-1.5 mb-1">
                      Sesuai Kebutuhan Pengeluaran:
                    </div>
                    <div
                      onClick={() => {
                        setPosKeluar(posKebutuhan);
                        setIsPosKeluarDropdownOpen(false);
                      }}
                      className={`px-3 py-2 text-xs rounded-lg cursor-pointer flex items-center justify-between font-medium ${
                        posKeluar === posKebutuhan
                          ? 'bg-[#008d91] text-white'
                          : 'bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{posKebutuhan}</span>
                      <span className="text-[10px] text-slate-400">Dari Kebutuhan</span>
                    </div>
                  </div>
                )}

                <div className="text-[10px] font-semibold text-slate-400 px-2 py-1">
                  Semua Pos Pengeluaran:
                </div>
                {availablePosKeluarOptions
                  .filter((opt) => opt.type === 'standard')
                  .map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => {
                        setPosKeluar(opt.value);
                        setIsPosKeluarDropdownOpen(false);
                      }}
                      className={`px-3 py-2 text-xs rounded-xl cursor-pointer ${
                        posKeluar === opt.value
                          ? 'bg-teal-50 text-[#008d91] font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {opt.value}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 6: Keterangan */}
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="w-full sm:w-56 text-slate-700 text-sm sm:text-base font-normal mb-1.5 sm:mb-0">
            Keterangan
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Input Text..."
              required
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 sm:py-3.5 text-sm sm:text-base text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#008d91] shadow-2xs"
            />
          </div>
        </div>

        {/* Row 7: Nominal */}
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="w-full sm:w-56 text-slate-700 text-sm sm:text-base font-normal mb-1.5 sm:mb-0">
            Nominal
          </div>
          <div className="flex-1 relative flex items-center">
            <div className="absolute left-4 text-[#008d91] font-semibold text-sm sm:text-base pointer-events-none select-none">
              Rp
            </div>
            <input
              type="text"
              value={
                isPrivacyMasked
                  ? '••••••••'
                  : nominal === ''
                  ? ''
                  : typeof nominal === 'number'
                  ? nominal.toLocaleString('id-ID')
                  : nominal
              }
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                setNominal(raw ? parseInt(raw, 10) : '');
              }}
              placeholder="Input Nominal..."
              required
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#008d91] shadow-2xs"
            />
          </div>
        </div>

        {/* Row 8: Dikeluarkan oleh */}
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="w-full sm:w-56 text-slate-700 text-sm sm:text-base font-normal mb-1.5 sm:mb-0">
            Dikeluarkan oleh
          </div>
          <div className="flex-1 relative dropdown-container">
            {isManualDikeluarkan ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={dikeluarkan}
                  onChange={(e) => setDikeluarkan(e.target.value)}
                  placeholder="Ketik nama / rekening manual..."
                  required
                  autoFocus
                  className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 sm:py-3.5 text-sm sm:text-base text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-[#008d91] shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setIsManualDikeluarkan(false)}
                  className="px-3 py-2 text-xs font-semibold text-[#008d91] bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors cursor-pointer"
                >
                  Pilih Kumpulan Rekening
                </button>
              </div>
            ) : (
              <>
                <div
                  onClick={() => setIsDikeluarkanDropdownOpen(!isDikeluarkanDropdownOpen)}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 sm:py-3.5 pr-12 text-sm sm:text-base text-slate-700 cursor-pointer flex items-center justify-between shadow-2xs select-none"
                >
                  <span className={dikeluarkan ? 'text-slate-800 font-medium' : 'text-slate-300'}>
                    {dikeluarkan || 'Search...'}
                  </span>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center pointer-events-none shadow-2xs">
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>

                {isDikeluarkanDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-2 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1 mb-1">
                      <input
                        type="text"
                        value={dikeluarkanSearch}
                        onChange={(e) => setDikeluarkanSearch(e.target.value)}
                        placeholder="Cari dari kumpulan rekening..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-[#008d91]"
                      />
                    </div>
                    {identitasList && identitasList.length > 0 && (
                      <div className="mb-2">
                        <div className="text-[10px] font-semibold text-slate-400 px-2 py-1">
                          Dari Daftar Identitas Orang:
                        </div>
                        {identitasList
                          .filter((i) =>
                            !dikeluarkanSearch ||
                            i.namaLengkap.toLowerCase().includes(dikeluarkanSearch.toLowerCase()) ||
                            i.namaPanggilan.toLowerCase().includes(dikeluarkanSearch.toLowerCase()) ||
                            (i.codeId && i.codeId.toLowerCase().includes(dikeluarkanSearch.toLowerCase()))
                          )
                          .slice(0, 8)
                          .map((i) => (
                            <div
                              key={i.id}
                              onClick={() => {
                                setDikeluarkan(i.namaLengkap);
                                setIsDikeluarkanDropdownOpen(false);
                              }}
                              className={`px-3 py-2 text-xs rounded-xl cursor-pointer flex items-center justify-between ${
                                dikeluarkan === i.namaLengkap
                                  ? 'bg-teal-50 text-[#008d91] font-semibold'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded-full ${i.avatarBg} text-white text-[10px] flex items-center justify-center font-bold shrink-0`}>
                                  {i.avatarInitial}
                                </div>
                                <span className="font-medium">{i.namaLengkap}</span>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {i.namaPanggilan || i.organisasi}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                    <div className="text-[10px] font-semibold text-slate-400 px-2 py-1 border-t border-slate-100 pt-1.5">
                      Dari Kumpulan Rekening:
                    </div>
                    {kumpulanRekeningList
                      .filter((r) =>
                        !dikeluarkanSearch ||
                        r.atasNama.toLowerCase().includes(dikeluarkanSearch.toLowerCase()) ||
                        r.bank.toLowerCase().includes(dikeluarkanSearch.toLowerCase()) ||
                        r.nomorRekening.toLowerCase().includes(dikeluarkanSearch.toLowerCase()) ||
                        r.idIdentitas.toLowerCase().includes(dikeluarkanSearch.toLowerCase())
                      )
                      .map((r) => {
                        return (
                          <div
                            key={r.id}
                            onClick={() => {
                              setDikeluarkan(r.atasNama);
                              setIsDikeluarkanDropdownOpen(false);
                            }}
                            className={`px-3 py-2 text-xs rounded-xl cursor-pointer flex items-center justify-between ${
                              dikeluarkan === r.atasNama
                                ? 'bg-teal-50 text-[#008d91] font-semibold'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <span className="font-medium">{r.atasNama}</span>
                            <span className="text-[10px] text-slate-400">
                              {r.bank} • {r.nomorRekening}
                            </span>
                          </div>
                        );
                      })}
                    <div className="p-2 border-t border-slate-100 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsManualDikeluarkan(true);
                          setIsDikeluarkanDropdownOpen(false);
                        }}
                        className="w-full py-2 text-xs font-semibold text-[#008d91] hover:bg-teal-50 rounded-xl transition-colors text-center"
                      >
                        + Ketik Nama / Rekening Manual
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Row 9: Bon */}
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="w-full sm:w-56 text-slate-700 text-sm sm:text-base font-normal mb-1.5 sm:mb-0">
            Bon
          </div>
          <div className="flex-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              accept="image/*"
              className="hidden"
            />
            {buktiBonUrl ? (
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-2.5 px-4 max-w-md shadow-2xs">
                <img
                  src={buktiBonUrl}
                  alt="Bukti Bon"
                  className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-800 truncate">
                    {buktiBonFileName || 'struk-bon.png'}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Gambar terlampir
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setBuktiBonUrl('');
                    setBuktiBonFileName('');
                  }}
                  className="text-slate-400 hover:text-red-500 p-1 rounded-lg transition-colors cursor-pointer"
                  title="Hapus Bon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-[#008d91] hover:text-[#007b7f] font-semibold text-sm sm:text-base transition-colors cursor-pointer py-1 select-none"
              >
                <div className="relative">
                  <ImageIcon className="w-6 h-6 stroke-[1.8]" />
                  <div className="absolute -bottom-0.5 -right-0.5 bg-[#008d91] text-white rounded-full p-0.5">
                    <Plus className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                </div>
                <span>Add Image(s)</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Actions: Cancel & Save Buttons matching image.png */}
        <div className="pt-6 sm:pt-8 flex items-center justify-end gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 sm:px-10 py-2.5 sm:py-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-10 sm:px-12 py-2.5 sm:py-3 rounded-full bg-[#008d91] hover:bg-[#007a7e] text-white text-sm font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};
