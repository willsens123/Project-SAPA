import React, { useState, useEffect } from 'react';
import { X, User, Sparkles } from 'lucide-react';
import { VolunteerSSebarItem } from '../types';
import { VOLUNTEER_SKILL_ROLES, SKILL_LEVEL_OPTIONS } from '../volunteerSSebarData';

interface AddEditVolunteerSSebarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: VolunteerSSebarItem) => void;
  editingItem?: VolunteerSSebarItem | null;
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

export const AddEditVolunteerSSebarModal: React.FC<AddEditVolunteerSSebarModalProps> = ({
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
  const [activeCategory, setActiveCategory] = useState<'semua' | 'desain' | 'tulisan' | 'terjemahan'>('semua');

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
        layout: '-',
        coverDesign: '-',
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
      setError('Nama relawan/volunteer harus diisi');
      return;
    }

    const initial = nama.trim().charAt(0).toUpperCase() || 'V';

    const item: VolunteerSSebarItem = {
      id: editingItem ? editingItem.id : `vol-${Date.now()}`,
      kode: kode.trim() || String(existingCount + 1).padStart(5, '0'),
      nama: nama.trim(),
      panggilan: panggilan.trim(),
      avatarLetter: initial,
      avatarBg: avatarBg,
      status: status,
      isAktif: isAktif,
      periodeAktif: periodeAktif.trim(),
      noHp: noHp.trim(),
      email: email.trim(),
      cvUrl: cvUrl.trim(),
      skills: skills,
      catatan: catatan.trim(),
      createdAt: editingItem ? editingItem.createdAt : new Date().toISOString(),
    };

    onSave(item);
    onClose();
  };

  const filteredRoles = VOLUNTEER_SKILL_ROLES.filter((role) => {
    if (activeCategory === 'desain') {
      return ['layout', 'coverDesign', 'illustrator'].includes(role.key);
    }
    if (activeCategory === 'tulisan') {
      return ['penulisArtikel', 'penyuntingJunior', 'penyuntingAkhir', 'pemeriksaIndInd'].includes(role.key);
    }
    if (activeCategory === 'terjemahan') {
      return [
        'penerjemah',
        'penerjemahIndJawa',
        'penyuntingIndJawa',
        'penerjemahIndHokian',
        'penyalarasIndHokian',
        'penerjemahMandInd',
        'penerjemahIndBali',
        'penerjemahIndSunda',
      ].includes(role.key);
    }
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-[1px] animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-5 sm:p-8 shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in-95 duration-150 relative border border-slate-100 my-8"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-2xs"
              style={{ backgroundColor: avatarBg }}
            >
              {nama.trim() ? nama.trim().charAt(0).toUpperCase() : <User className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                {editingItem ? 'Edit Volunteer A-AJAK Item S-SEBAR' : 'Tambah Volunteer A-AJAK Item S-SEBAR'}
              </h3>
              <p className="text-xs text-slate-500">Database Volunteer pembuatan Item S-SEBAR</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Identitas Volunteer */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <label className="block text-slate-700 font-medium text-xs mb-1">
                Kode / No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={kode}
                onChange={(e) => setKode(e.target.value)}
                placeholder="00031"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#008d91]"
              />
            </div>

            <div className="sm:col-span-8">
              <label className="block text-slate-700 font-medium text-xs mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Agustino Ong"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#008d91]"
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-slate-700 font-medium text-xs mb-1">
                Nama Panggilan / Alias
              </label>
              <input
                type="text"
                value={panggilan}
                onChange={(e) => setPanggilan(e.target.value)}
                placeholder="Contoh: Ko Agus"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#008d91]"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-slate-700 font-medium text-xs mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#008d91]"
              >
                <option value="Volunteer">Volunteer</option>
                <option value="Freelancer">Freelancer</option>
                <option value="Intern">Intern</option>
                <option value="Pengurus">Pengurus</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-slate-700 font-medium text-xs mb-1">Aktif / Tidak?</label>
              <select
                value={isAktif ? 'Aktif' : 'Tidak Aktif'}
                onChange={(e) => setIsAktif(e.target.value === 'Aktif')}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#008d91]"
              >
                <option value="Aktif">Aktif</option>
                <option value="Tidak Aktif">Tidak Aktif</option>
              </select>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-slate-700 font-medium text-xs mb-1">Periode Aktif</label>
              <input
                type="text"
                value={periodeAktif}
                onChange={(e) => setPeriodeAktif(e.target.value)}
                placeholder="1 Jan 2021 - 15 Nov 2021"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#008d91]"
              />
            </div>

            <div className="sm:col-span-12">
              <label className="block text-slate-700 font-medium text-xs mb-1">
                Link Dokumen CV
              </label>
              <input
                type="url"
                value={cvUrl}
                onChange={(e) => setCvUrl(e.target.value)}
                placeholder="https://drive.google.com/... (Link Google Drive, LinkedIn, PDF)"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#008d91]"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Tautan publik ke dokumen CV atau portofolio volunteer.
              </p>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-slate-700 font-medium text-xs mb-1">Warna Profil</label>
              <div className="flex items-center gap-2 pt-1">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setAvatarBg(c)}
                    className={`w-6 h-6 rounded-full border transition-transform ${
                      avatarBg === c ? 'scale-125 ring-2 ring-offset-1 ring-[#008d91]' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Section: Keahlian / Kontribusi Pembuatan Item S-SEBAR */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#008d91]" />
                <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                  Keahlian & Peran Bantuan S-SEBAR
                </span>
              </div>
              {/* Category tabs */}
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setActiveCategory('semua')}
                  className={`px-2 py-0.5 rounded-lg transition-colors ${
                    activeCategory === 'semua'
                      ? 'bg-[#008d91] text-white font-medium'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('desain')}
                  className={`px-2 py-0.5 rounded-lg transition-colors ${
                    activeCategory === 'desain'
                      ? 'bg-[#008d91] text-white font-medium'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Desain
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('tulisan')}
                  className={`px-2 py-0.5 rounded-lg transition-colors ${
                    activeCategory === 'tulisan'
                      ? 'bg-[#008d91] text-white font-medium'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Tulisan & Sunting
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory('terjemahan')}
                  className={`px-2 py-0.5 rounded-lg transition-colors ${
                    activeCategory === 'terjemahan'
                      ? 'bg-[#008d91] text-white font-medium'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Terjemahan
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto p-1 bg-slate-50/70 rounded-2xl border border-slate-100">
              {filteredRoles.map((role) => {
                const currentVal = skills[role.key] || '-';
                return (
                  <div
                    key={role.key}
                    className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs"
                  >
                    <span className="text-xs font-medium text-slate-700 truncate" title={role.label}>
                      {role.label}
                    </span>
                    <select
                      value={currentVal}
                      onChange={(e) => handleSkillChange(role.key, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-lg border outline-none font-medium transition-colors ${
                        currentVal !== '-'
                          ? 'border-[#008d91] text-[#008d91] bg-[#008d91]/5'
                          : 'border-slate-200 text-slate-400 bg-white'
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

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-6 py-2 border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full px-6 py-2 bg-[#008d91] hover:bg-[#05828e] active:bg-[#046c76] text-white text-sm font-medium transition-colors shadow-2xs"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
