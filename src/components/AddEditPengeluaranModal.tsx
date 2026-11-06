import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Calendar, DollarSign, Tag, User, Building, Layers, Upload, Link2, FileImage, Trash2, FolderGit2 } from 'lucide-react';
import { PengeluaranItem, MutasiItem, ProjectItem } from '../types';
import { getPresetReceipt } from '../utils/receiptGenerator';
import { PosPengeluaranGroup } from '../posPengeluaranData';
import { KebutuhanPengeluaranItem } from '../kebutuhanPengeluaranData';

interface AddEditPengeluaranModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: PengeluaranItem) => void;
  editingItem?: PengeluaranItem | null;
  existingItems?: PengeluaranItem[];
  divisiPresets?: string[];
  mutasiList?: MutasiItem[];
  projects?: ProjectItem[];
  posPengeluaranList?: PosPengeluaranGroup[];
  kebutuhanPengeluaranList?: KebutuhanPengeluaranItem[];
}

export const AddEditPengeluaranModal: React.FC<AddEditPengeluaranModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  existingItems = [],
  divisiPresets: customDivisiPresets,
  mutasiList = [],
  projects = [],
  posPengeluaranList = [],
  kebutuhanPengeluaranList = [],
}) => {
  const [tanggal, setTanggal] = useState('');
  const [divisi, setDivisi] = useState('UMM');
  const [proyekSapa, setProyekSapa] = useState('');
  const [posKeluar, setPosKeluar] = useState('Pengeluaran YPPLN');
  const [kebutuhan, setKebutuhan] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [nominal, setNominal] = useState<number | ''>('');
  const [jenis, setJenis] = useState('ALL');
  const [no, setNo] = useState('');
  const [noBadgeColor, setNoBadgeColor] = useState<'teal' | 'red' | 'plain'>('teal');
  const [dikeluarkan, setDikeluarkan] = useState('');
  const [buktiBonUrl, setBuktiBonUrl] = useState<string>('');
  const [buktiBonFileName, setBuktiBonFileName] = useState<string>('');
  const [selectedMutasiId, setSelectedMutasiId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto calculate next number if adding new
  useEffect(() => {
    if (editingItem) {
      setTanggal(editingItem.tanggal);
      setDivisi(editingItem.divisi);
      setProyekSapa(editingItem.proyekSapa || '');
      setPosKeluar(editingItem.posKeluar);
      setKebutuhan(editingItem.kebutuhan);
      setKeterangan(editingItem.keterangan);
      setNominal(editingItem.nominal);
      setJenis(editingItem.jenis);
      setNo(editingItem.no);
      setNoBadgeColor(editingItem.noBadgeColor || 'plain');
      setDikeluarkan(editingItem.dikeluarkan);
      setBuktiBonUrl(editingItem.buktiBonUrl || '');
      setBuktiBonFileName(editingItem.buktiBonFileName || '');
      setSelectedMutasiId(editingItem.mutasiId || '');
      setErrorMsg('');
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
      setDivisi('UMM');
      setProyekSapa('');
      setPosKeluar(posPengeluaranList[0]?.namaPosPengeluaran || 'Pengeluaran YPPLN');
      setKebutuhan('');
      setKeterangan('');
      setNominal('');
      setJenis('ALL');
      setNo(nextNo.toString());
      setNoBadgeColor('teal');
      setDikeluarkan('Agustino');
      setBuktiBonUrl('');
      setBuktiBonFileName('');
      setSelectedMutasiId('');
      setErrorMsg('');
    }
  }, [editingItem, isOpen, existingItems]);

  // Sync badge color when receipt or mutasi changes
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      setBuktiBonUrl(url);
      setBuktiBonFileName(file.name);
      // Auto compute badge: if mutasi linked -> teal, else -> red
      if (selectedMutasiId) {
        setNoBadgeColor('teal');
      } else {
        setNoBadgeColor('red');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleUseSampleBon = () => {
    const sample = getPresetReceipt(
      no || '196',
      keterangan || 'Operasional',
      Number(nominal) || 100000,
      tanggal || '1 Nov 2021',
      dikeluarkan || 'Staff'
    );
    setBuktiBonUrl(sample);
    setBuktiBonFileName(`sample-bon-${no || '196'}.png`);
    if (selectedMutasiId) {
      setNoBadgeColor('teal');
    } else {
      setNoBadgeColor('red');
    }
  };

  const handleRemoveBon = () => {
    setBuktiBonUrl('');
    setBuktiBonFileName('');
    setNoBadgeColor('plain');
  };

  const handleMutasiChange = (mutasiId: string) => {
    setSelectedMutasiId(mutasiId);
    if (buktiBonUrl || noBadgeColor !== 'plain') {
      if (mutasiId) {
        setNoBadgeColor('teal'); // Ada bukti bon & link mutasi -> Tosca
      } else {
        setNoBadgeColor('red'); // Ada bukti bon & belum link mutasi -> Merah
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keterangan.trim()) {
      setErrorMsg('Keterangan pengeluaran wajib diisi');
      return;
    }
    if (nominal === '' || Number(nominal) <= 0) {
      setErrorMsg('Nominal harus lebih besar dari 0');
      return;
    }
    if (!no.trim()) {
      setErrorMsg('Nomor pengeluaran wajib diisi');
      return;
    }

    const matchedMutasi = mutasiList.find((m) => m.id === selectedMutasiId);

    const saved: PengeluaranItem = {
      id: editingItem ? editingItem.id : `pengeluaran-${Date.now()}`,
      tanggal: tanggal.trim() || '1 Nov 2021',
      divisi: divisi.trim() || 'UMM',
      proyekSapa: proyekSapa.trim() || undefined,
      posKeluar: posKeluar.trim() || 'Ops Dharma',
      kebutuhan: kebutuhan.trim() || 'Operasional',
      keterangan: keterangan.trim(),
      nominal: Number(nominal),
      jenis: jenis.trim() || 'ALL',
      no: no.trim(),
      noBadgeColor,
      dikeluarkan: dikeluarkan.trim() || 'Staff',
      createdAt: editingItem?.createdAt || new Date().toISOString(),
      buktiBonUrl: buktiBonUrl || undefined,
      buktiBonFileName: buktiBonFileName || undefined,
      mutasiId: selectedMutasiId || undefined,
      mutasiKode: matchedMutasi ? `${matchedMutasi.bankAccount} - ${matchedMutasi.date}` : undefined,
      mutasiKeterangan: matchedMutasi?.keteranganBank || undefined,
      mutasiDate: matchedMutasi?.date || undefined,
      mutasiAmount: matchedMutasi?.amount || undefined,
    };

    onSave(saved);
    onClose();
  };

  const divisiPresets =
    customDivisiPresets && customDivisiPresets.length > 0
      ? customDivisiPresets
      : ['UMM', 'CAM', 'MAD', 'EVE', 'FIN', 'DIR'];
  const posKeluarPresets =
    posPengeluaranList && posPengeluaranList.length > 0
      ? posPengeluaranList.map((p) => p.namaPosPengeluaran)
      : ['Pengeluaran YPPLN', 'Pengeluaran Khusus Operasional', 'Pengeluaran Khusus Penerbitan'];

  const handleSelectKebutuhan = (val: string) => {
    setKebutuhan(val);
    const matched = kebutuhanPengeluaranList.find(
      (k) => k.kebutuhan.trim().toLowerCase() === val.trim().toLowerCase()
    );
    if (matched && matched.posPengeluaran) {
      setPosKeluar(matched.posPengeluaran);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              {editingItem ? 'Edit Data Pengeluaran' : 'Tambah Pengeluaran Baru'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Catatan transaksi pengeluaran dan alokasi dana
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tanggal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tanggal
              </label>
              <input
                type="text"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                placeholder="Contoh: 1 Nov 2021"
                required
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
              />
            </div>

            {/* Divisi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Divisi
              </label>
              <div className="flex gap-1.5 mb-1.5">
                {divisiPresets.slice(0, 4).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDivisi(d)}
                    className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                      divisi === d
                        ? 'bg-[#008d91] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={divisi}
                onChange={(e) => setDivisi(e.target.value)}
                placeholder="Kode Divisi"
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
              />
            </div>
          </div>

          {/* Proyek SAPA */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-[#008d91]" />
                Proyek SAPA
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Terkoneksi database Proyek SAPA</span>
            </label>
            <select
              value={proyekSapa}
              onChange={(e) => {
                const val = e.target.value;
                setProyekSapa(val);
                if (val && projects.length > 0) {
                  const targetP = projects.find((p) => p.namaKegiatan === val);
                  if (targetP && targetP.divisi) {
                    setDivisi(targetP.divisi);
                  }
                }
              }}
              className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91] cursor-pointer"
            >
              <option value="">-- Tanpa Proyek SAPA (Pengeluaran Umum) --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.namaKegiatan}>
                  [{p.divisi}] {p.namaKegiatan} ({p.status || 'Ongoing'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Pos Keluar */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Pos Keluar
              </label>
              <select
                value={posKeluar}
                onChange={(e) => setPosKeluar(e.target.value)}
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
              >
                {posKeluarPresets.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Kebutuhan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Kebutuhan</span>
                {kebutuhanPengeluaranList.length > 0 && (
                  <span className="text-[10px] text-teal-600 font-medium">Auto Pos Keluar</span>
                )}
              </label>
              {kebutuhanPengeluaranList.length > 0 ? (
                <div className="space-y-1.5">
                  <select
                    value={kebutuhanPengeluaranList.some((k) => k.kebutuhan === kebutuhan) ? kebutuhan : (kebutuhan ? '__custom__' : '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '__custom__') {
                        // User will enter manually
                      } else {
                        handleSelectKebutuhan(val);
                      }
                    }}
                    className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91] cursor-pointer"
                  >
                    <option value="">-- Pilih Kebutuhan Pengeluaran --</option>
                    {kebutuhanPengeluaranList.map((k) => (
                      <option key={k.id} value={k.kebutuhan}>
                        {k.kebutuhan} ({k.posPengeluaran})
                      </option>
                    ))}
                    <option value="__custom__">+ Input Nama Kebutuhan Lainnya...</option>
                  </select>
                  {(!kebutuhanPengeluaranList.some((k) => k.kebutuhan === kebutuhan) || !kebutuhan) && (
                    <input
                      type="text"
                      value={kebutuhan}
                      onChange={(e) => handleSelectKebutuhan(e.target.value)}
                      placeholder="Atau ketik kebutuhan manual..."
                      required
                      className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={kebutuhan}
                  onChange={(e) => setKebutuhan(e.target.value)}
                  placeholder="Contoh: Operasional Kantor, Boost Iklan"
                  required
                  className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
                />
              )}
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Keterangan Rinci
            </label>
            <textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Air PDAM, Lakban Bening 1 inch (2 x 12 buah)"
              rows={2}
              required
              className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nominal */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nominal (Rp)
              </label>
              <input
                type="number"
                value={nominal}
                onChange={(e) => setNominal(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="48800"
                min="0"
                step="100"
                required
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91] font-medium"
              />
            </div>

            {/* Jenis */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Jenis
              </label>
              <input
                type="text"
                value={jenis}
                onChange={(e) => setJenis(e.target.value)}
                placeholder="ALL"
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* No. */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                No. Pengeluaran
              </label>
              <input
                type="text"
                value={no}
                onChange={(e) => setNo(e.target.value)}
                placeholder="Contoh: 185"
                required
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
              />
            </div>

            {/* Dikeluarkan Oleh */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Dikeluarkan Oleh
              </label>
              <input
                type="text"
                value={dikeluarkan}
                onChange={(e) => setDikeluarkan(e.target.value)}
                placeholder="Nama PIC / Staff"
                required
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
              />
            </div>
          </div>

          {/* Upload Bukti Bon */}
          <div className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileImage className="w-3.5 h-3.5 text-[#008d91]" />
                Gambar Bukti Bon (Struk / Invoice)
              </label>
              {buktiBonUrl && (
                <button
                  type="button"
                  onClick={handleRemoveBon}
                  className="text-xs text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Hapus Bon
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:border-[#008d91] rounded-lg text-xs font-medium text-slate-700 shadow-2xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>{buktiBonUrl ? 'Ganti Gambar Bon' : 'Pilih File Gambar'}</span>
              </button>

              <button
                type="button"
                onClick={handleUseSampleBon}
                className="inline-flex items-center gap-1 text-xs text-[#008d91] hover:underline cursor-pointer"
              >
                Gunakan Contoh Struk Bon
              </button>
            </div>

            {buktiBonUrl && (
              <div className="mt-2.5 flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                <img
                  src={buktiBonUrl}
                  alt="Bukti Bon Preview"
                  className="w-12 h-12 object-cover rounded border border-slate-200"
                />
                <div className="text-xs min-w-0">
                  <p className="font-semibold text-slate-800 truncate">
                    {buktiBonFileName || `Bukti Bon No. ${no}`}
                  </p>
                  <p className="text-slate-400 text-[11px]">Gambar bon siap disimpan</p>
                </div>
              </div>
            )}
          </div>

          {/* Hubungkan ke Mutasi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[#008d91]" />
              Hubungkan ke Transaksi Mutasi Bank
            </label>
            <select
              value={selectedMutasiId}
              onChange={(e) => handleMutasiChange(e.target.value)}
              className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
            >
              <option value="">-- Belum Dihubungkan ke Mutasi --</option>
              {mutasiList.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.bankAccount} ({m.date}) - Rp {m.amount.toLocaleString('id-ID')} - {m.keteranganBank.slice(0, 45)}...
                </option>
              ))}
            </select>
          </div>

          {/* Badge Color for No. */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Status Tampilan Kolom No.
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setNoBadgeColor('teal')}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                  noBadgeColor === 'teal'
                    ? 'border-[#008d91] bg-teal-50/60 text-slate-800 ring-1 ring-[#008d91]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-[#008d91] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-xs block text-[#008d91]">Buletan Tosca</span>
                  <span className="text-[11px] text-slate-500 leading-tight block">Ada bukti bon &amp; sudah link mutasi</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setNoBadgeColor('red')}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                  noBadgeColor === 'red'
                    ? 'border-[#f04e4e] bg-red-50/60 text-slate-800 ring-1 ring-[#f04e4e]'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-[#f04e4e] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-xs block text-[#f04e4e]">Buletan Merah</span>
                  <span className="text-[11px] text-slate-500 leading-tight block">Ada bukti bon, belum link mutasi</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setNoBadgeColor('plain')}
                className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                  noBadgeColor === 'plain'
                    ? 'border-slate-400 bg-slate-100 text-slate-800 ring-1 ring-slate-400'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-xs block text-slate-700">Tanpa Buletan</span>
                  <span className="text-[11px] text-slate-500 leading-tight block">Belum di-upload bukti bon</span>
                </div>
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#008d91] hover:bg-[#05828e] text-white shadow-xs transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Simpan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
