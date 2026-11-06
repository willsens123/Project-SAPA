import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { DharmaPatronRutinItem } from '../types';
import { validateAndCalculatePatronPiutang } from '../utils/dharmaPatronPiutangHelper';

interface AddEditDharmaPatronModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: DharmaPatronRutinItem) => void;
  editingItem?: DharmaPatronRutinItem | null;
  existingItems?: DharmaPatronRutinItem[];
}

export const AddEditDharmaPatronModal: React.FC<AddEditDharmaPatronModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  existingItems = [],
}) => {
  const [noDonatur, setNoDonatur] = useState('');
  const [namaDonatur, setNamaDonatur] = useState('');
  const [panggilan, setPanggilan] = useState('');
  const [sumber, setSumber] = useState('Brosur DP 1');
  const [groupJarkom, setGroupJarkom] = useState('All DPR 1');
  const [namaRekening, setNamaRekening] = useState('');
  const [donasiPerbulan, setDonasiPerbulan] = useState<number | ''>(100000);
  const [tanggalBergabung, setTanggalBergabung] = useState('');
  const [namaPendek, setNamaPendek] = useState('');
  const [keterangan, setKeterangan] = useState('-');
  const [afiliasiKci, setAfiliasiKci] = useState('MAH');
  const [piutang, setPiutang] = useState<number | ''>(0);
  const [bulanPiutang, setBulanPiutang] = useState('-');
  const [reminder, setReminder] = useState('All');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingItem) {
      setNoDonatur(editingItem.noDonatur);
      setNamaDonatur(editingItem.namaDonatur);
      setPanggilan(editingItem.panggilan);
      setSumber(editingItem.sumber);
      setGroupJarkom(editingItem.groupJarkom);
      setNamaRekening(editingItem.namaRekening);
      setDonasiPerbulan(editingItem.donasiPerbulan);
      setTanggalBergabung(editingItem.tanggalBergabung);
      setNamaPendek(editingItem.namaPendek);
      setKeterangan(editingItem.keterangan);
      setAfiliasiKci(editingItem.afiliasiKci);
      setPiutang(editingItem.piutang);
      setBulanPiutang(editingItem.bulanPiutang);
      setReminder(editingItem.reminder);
      setErrorMsg('');
    } else {
      // Auto increment no donatur
      const numbers = existingItems
        .map((it) => parseInt(it.noDonatur.replace(/\D/g, ''), 10))
        .filter((n) => !isNaN(n));
      const nextNo = numbers.length > 0 ? Math.max(...numbers) + 1 : 36;
      const formattedNo = nextNo.toString().padStart(5, '0');

      const today = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const formattedDate = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;

      setNoDonatur(formattedNo);
      setNamaDonatur('');
      setPanggilan('');
      setSumber('Brosur DP 1');
      setGroupJarkom('All DPR 1');
      setNamaRekening('');
      setDonasiPerbulan(100000);
      setTanggalBergabung(formattedDate);
      setNamaPendek('');
      setKeterangan('-');
      setAfiliasiKci('MAH');
      setPiutang(0);
      setBulanPiutang('-');
      setReminder('All');
      setErrorMsg('');
    }
  }, [editingItem, isOpen, existingItems]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaDonatur.trim()) {
      setErrorMsg('Nama donatur wajib diisi');
      return;
    }
    if (donasiPerbulan === '' || Number(donasiPerbulan) < 0) {
      setErrorMsg('Nominal donasi perbulan tidak valid');
      return;
    }

    const firstLetter = namaDonatur.trim().charAt(0).toUpperCase();

    const saved: DharmaPatronRutinItem = {
      id: editingItem ? editingItem.id : `dpr-${Date.now()}`,
      noDonatur: noDonatur.trim(),
      namaDonatur: namaDonatur.trim(),
      panggilan: panggilan.trim() || namaDonatur.split(' ')[0],
      avatarLetter: firstLetter,
      avatarBg: editingItem?.avatarBg || '#00a896',
      sumber: sumber.trim() || 'Brosur DP 1',
      groupJarkom: groupJarkom.trim() || 'All DPR 1',
      namaRekening: namaRekening.trim() || namaDonatur.trim(),
      donasiPerbulan: Number(donasiPerbulan),
      tanggalBergabung: tanggalBergabung.trim() || '12 Jan 2019',
      namaPendek: namaPendek.trim() || panggilan.trim() || namaDonatur.split(' ')[0],
      keterangan: keterangan.trim() || '-',
      afiliasiKci: afiliasiKci.trim() || 'MAH',
      piutang: 0,
      bulanPiutang: '-',
      reminder: reminder.trim() || 'All',
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    };

    const calculated = validateAndCalculatePatronPiutang(saved, [], []);
    saved.piutang = piutang !== '' ? Number(piutang) : calculated.piutang;
    saved.bulanPiutang = bulanPiutang.trim() && bulanPiutang !== '-' ? bulanPiutang.trim() : calculated.bulanPiutang;

    onSave(saved);
    onClose();
  };

  const sumberPresets = ['Brosur DP 1', 'Brosur DP 2', 'Sosial Media IG', 'Website Lamrim', 'Bedah Buku Online', 'Event Khusus'];
  const groupJarkomPresets = ['All DPR 1', 'All DPR 2', 'All DPR 3', 'DPR Jabodetabek', 'DPR Luar Kota'];
  const afiliasiPresets = ['MAH', 'JKT', 'BDG', 'SBY', 'MDN', 'DPS'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              {editingItem ? 'Edit Dharma Patron Rutin' : 'Tambah Dharma Patron Rutin'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola data donatur tetap, komitmen per bulan, dan status piutang
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* No Donatur */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                No. Donatur
              </label>
              <input
                type="text"
                value={noDonatur}
                onChange={(e) => setNoDonatur(e.target.value)}
                placeholder="00031"
                required
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
              />
            </div>

            {/* Nama Lengkap */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Lengkap Donatur
              </label>
              <input
                type="text"
                value={namaDonatur}
                onChange={(e) => {
                  setNamaDonatur(e.target.value);
                  if (!namaRekening) setNamaRekening(e.target.value);
                  if (!namaPendek) setNamaPendek(e.target.value.split(' ')[0]);
                }}
                placeholder="Contoh: Agustino Ong"
                required
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Panggilan / Alias */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Panggilan
              </label>
              <input
                type="text"
                value={panggilan}
                onChange={(e) => setPanggilan(e.target.value)}
                placeholder="Contoh: Ko Agus"
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
              />
            </div>

            {/* Nama Rekening */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama di Rekening
              </label>
              <input
                type="text"
                value={namaRekening}
                onChange={(e) => setNamaRekening(e.target.value)}
                placeholder="Contoh: Agustino"
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
              />
            </div>

            {/* Nama Pendek Kolom */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Pendek / Display
              </label>
              <input
                type="text"
                value={namaPendek}
                onChange={(e) => setNamaPendek(e.target.value)}
                placeholder="Contoh: Agustino"
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sumber */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sumber Donasi
              </label>
              <select
                value={sumber}
                onChange={(e) => setSumber(e.target.value)}
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
              >
                {sumberPresets.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Group Jarkom */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Group Jarkom
              </label>
              <select
                value={groupJarkom}
                onChange={(e) => setGroupJarkom(e.target.value)}
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
              >
                {groupJarkomPresets.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Donasi Perbulan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Donasi Perbulan (Rp)
              </label>
              <input
                type="number"
                value={donasiPerbulan}
                onChange={(e) => setDonasiPerbulan(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="100000"
                min="0"
                step="10000"
                required
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91] font-semibold"
              />
            </div>

            {/* Tanggal Bergabung */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tanggal Bergabung
              </label>
              <input
                type="text"
                value={tanggalBergabung}
                onChange={(e) => setTanggalBergabung(e.target.value)}
                placeholder="Contoh: 12 Jan 2019"
                required
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
              />
            </div>

            {/* Afiliasi KCI */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Afiliasi KCI
              </label>
              <select
                value={afiliasiKci}
                onChange={(e) => setAfiliasiKci(e.target.value)}
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
              >
                {afiliasiPresets.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Piutang */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Piutang (Rp)
              </label>
              <input
                type="number"
                value={piutang}
                onChange={(e) => setPiutang(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="-100000 atau 0"
                step="10000"
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Gunakan minus (-) jika ada tunggakan
              </span>
            </div>

            {/* Bulan Piutang */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Bulan Piutang
              </label>
              <input
                type="text"
                value={bulanPiutang}
                onChange={(e) => setBulanPiutang(e.target.value)}
                placeholder="Contoh: Oktober atau -"
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
              />
            </div>

            {/* Reminder? */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reminder?
              </label>
              <select
                value={reminder}
                onChange={(e) => setReminder(e.target.value)}
                className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
              >
                <option value="All">All</option>
                <option value="No">No</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Keterangan
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Contoh: Transfer via BCA, Donatur VIP, dll."
              className="w-full text-xs sm:text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 bg-slate-50/60 focus:bg-white outline-none focus:border-[#008d91]"
            />
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
