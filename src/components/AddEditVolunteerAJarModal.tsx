import React, { useState, useEffect } from 'react';
import { X, User, ExternalLink, Link as LinkIcon, Sparkles } from 'lucide-react';
import { VolunteerAJarItem } from '../types';
import { VOLUNTEER_AJAR_SKILL_ROLES, SKILL_LEVEL_OPTIONS } from '../volunteerAJarData';

interface AddEditVolunteerAJarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: VolunteerAJarItem) => void;
  editingItem?: VolunteerAJarItem | null;
  existingCount?: number;
}

const AVATAR_COLORS = [
  '#0d9488', // teal
  '#eab308', // yellow
  '#64748b', // slate
  '#0f766e', // deep teal
  '#3b82f6', // blue
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#f97316', // orange
  '#10b981', // emerald
];

export const AddEditVolunteerAJarModal: React.FC<AddEditVolunteerAJarModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingItem,
  existingCount = 0,
}) => {
  const [kode, setKode] = useState('');
  const [nama, setNama] = useState('');
  const [panggilan, setPanggilan] = useState('');
  const [status, setStatus] = useState('Volunteer');
  const [isAktif, setIsAktif] = useState(true);
  const [periodeAktif, setPeriodeAktif] = useState('1 Jan 2021 - 15 Nov 2021');
  const [noHp, setNoHp] = useState('');
  const [email, setEmail] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [catatan, setCatatan] = useState('');
  const [avatarBg, setAvatarBg] = useState('#0d9488');
  const [skills, setSkills] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingItem) {
      setKode(editingItem.kode);
      setNama(editingItem.nama);
      setPanggilan(editingItem.panggilan || '');
      setStatus(editingItem.status || 'Volunteer');
      setIsAktif(editingItem.isAktif !== false);
      setPeriodeAktif(editingItem.periodeAktif || '1 Jan 2021 - 15 Nov 2021');
      setNoHp(editingItem.noHp || '');
      setEmail(editingItem.email || '');
      setCvUrl(editingItem.cvUrl || '');
      setCatatan(editingItem.catatan || '');
      setAvatarBg(editingItem.avatarBg || '#0d9488');
      setSkills(editingItem.skills || {});
    } else {
      const nextNum = String(existingCount + 1).padStart(5, '0');
      setKode(nextNum);
      setNama('');
      setPanggilan('');
      setStatus('Volunteer');
      setIsAktif(true);
      setPeriodeAktif('1 Jan 2021 - 15 Nov 2021');
      setNoHp('');
      setEmail('');
      setCvUrl('');
      setCatatan('');
      setAvatarBg(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
      setSkills({
        pengajarMateri: 'Beginner',
        fasilitatorKelas: '-',
      });
    }
    setError('');
  }, [editingItem, isOpen, existingCount]);

  if (!isOpen) return null;

  const handleSkillChange = (key: string, level: string) => {
    setSkills((prev) => ({
      ...prev,
      [key]: level,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      setError('Nama relawan/volunteer A-JAR harus diisi');
      return;
    }

    const initial = nama.trim().charAt(0).toUpperCase() || 'V';

    const itemToSave: VolunteerAJarItem = {
      id: editingItem ? editingItem.id : `vol-ajar-${Date.now()}`,
      kode: kode.trim() || String(existingCount + 1).padStart(5, '0'),
      nama: nama.trim(),
      panggilan: panggilan.trim() || nama.trim(),
      avatarLetter: initial,
      avatarBg,
      status,
      isAktif,
      periodeAktif,
      noHp: noHp.trim(),
      email: email.trim(),
      skills,
      catatan: catatan.trim(),
      cvUrl: cvUrl.trim(),
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    };

    onSave(itemToSave);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-5 sm:p-7 shadow-2xl w-full max-w-2xl border border-slate-100 max-h-[92vh] flex flex-col my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-xs"
              style={{ backgroundColor: avatarBg }}
            >
              {nama ? nama.charAt(0).toUpperCase() : <User className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">
                {editingItem ? 'Edit Volunteer A-AJAK A-JAR' : 'Tambah Volunteer A-AJAK A-JAR'}
              </h3>
              <p className="text-xs text-slate-400">Database Personil & Pengajar A-JAR</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 pr-1 space-y-4 py-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* Row 1: Kode, Nama, Panggilan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Kode / No <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                placeholder="00101"
                required
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#008d91]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nama Lengkap <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="cth. Bhadra Virya"
                required
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#008d91]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nama Panggilan
              </label>
              <input
                type="text"
                value={panggilan}
                onChange={(e) => setPanggilan(e.target.value)}
                placeholder="cth. Ko Bhadra"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#008d91]"
              />
            </div>
          </div>

          {/* Row 2: Status, Keaktifan, Periode Aktif */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#008d91] bg-white"
              >
                <option value="Volunteer">Volunteer</option>
                <option value="Freelancer">Freelancer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status Keaktifan</label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setIsAktif(true)}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors border ${
                    isAktif
                      ? 'bg-teal-50 border-[#008d91] text-[#008d91]'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Aktif
                </button>
                <button
                  type="button"
                  onClick={() => setIsAktif(false)}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors border ${
                    !isAktif
                      ? 'bg-rose-50 border-rose-300 text-rose-600'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  Non-Aktif
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Periode Aktif</label>
              <input
                type="text"
                value={periodeAktif}
                onChange={(e) => setPeriodeAktif(e.target.value)}
                placeholder="1 Jan 2021 - 15 Nov 2021"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#008d91]"
              />
            </div>
          </div>

          {/* Row 3: Kontak (No HP & Email) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nomor WhatsApp / HP</label>
              <input
                type="text"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="081234567890"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#008d91]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@example.com"
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#008d91]"
              />
            </div>
          </div>

          {/* Row 4: Link CV */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-[#008d91]" />
                Link Dokumen CV / Portofolio
              </span>
              {cvUrl && (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#008d91] hover:underline flex items-center gap-1 font-normal"
                >
                  <ExternalLink className="w-3 h-3" />
                  Buka Link
                </a>
              )}
            </label>
            <input
              type="url"
              value={cvUrl}
              onChange={(e) => setCvUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/... atau https://linkedin.com/in/..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#008d91]"
            />
          </div>

          {/* Row 5: Keahlian A-JAR */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#008d91]" />
                Tingkat Keahlian Peran A-JAR
              </label>
              <span className="text-[10px] text-slate-400">Pilih level kemahiran untuk setiap peran</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-2 bg-slate-50/70 rounded-2xl border border-slate-100">
              {VOLUNTEER_AJAR_SKILL_ROLES.map((role) => {
                const currentVal = skills[role.key] || '-';
                return (
                  <div
                    key={role.key}
                    className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200/80"
                  >
                    <span className="text-xs text-slate-700 font-medium truncate" title={role.label}>
                      {role.label}
                    </span>
                    <select
                      value={currentVal}
                      onChange={(e) => handleSkillChange(role.key, e.target.value)}
                      className={`text-[11px] font-semibold border rounded-lg px-2 py-1 outline-none ${
                        currentVal === '-'
                          ? 'text-slate-400 border-slate-200 bg-white'
                          : currentVal === 'Beginner'
                          ? 'text-amber-700 bg-amber-50 border-amber-200'
                          : currentVal === 'Intermediate'
                          ? 'text-blue-700 bg-blue-50 border-blue-200'
                          : currentVal === 'Advanced'
                          ? 'text-teal-700 bg-teal-50 border-teal-200'
                          : 'text-purple-700 bg-purple-50 border-purple-200'
                      }`}
                    >
                      {SKILL_LEVEL_OPTIONS.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 6: Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Catatan Tambahan</label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan mengenai jadwal, spesialisasi mengajar, dll..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#008d91]"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 rounded-xl text-xs font-bold bg-[#008d91] hover:bg-[#007b7e] text-white shadow-xs transition-colors"
          >
            {editingItem ? 'Simpan Perubahan' : 'Tambah Volunteer'}
          </button>
        </div>
      </div>
    </div>
  );
};
