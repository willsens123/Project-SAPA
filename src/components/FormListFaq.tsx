import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  ChevronDown,
  Check,
  Trash2,
} from 'lucide-react';
import { FaqItem, TentangFaqItem } from '../faqData';
import { ProjectItem } from '../types';

interface QuestionPair {
  id: string;
  pertanyaan: string;
  jawaban: string;
}

interface FormListFaqProps {
  onCancel: () => void;
  onSave: (items: FaqItem[]) => void;
  editingItem?: FaqItem | null;
  tentangList: TentangFaqItem[];
  projects: ProjectItem[];
  onShowToast?: (msg: string) => void;
}

export const FormListFaq: React.FC<FormListFaqProps> = ({
  onCancel,
  onSave,
  editingItem,
  tentangList,
  projects,
  onShowToast = (_msg: string) => {},
}) => {
  const [tentang, setTentang] = useState('');
  const [proyekId, setProyekId] = useState<string | undefined>(undefined);
  const [isProyekSapa, setIsProyekSapa] = useState<boolean>(false);

  const [tentangSearch, setTentangSearch] = useState('');
  const [tentangDropdownOpen, setTentangDropdownOpen] = useState(false);
  const tentangRef = useRef<HTMLDivElement | null>(null);

  const [mainPertanyaan, setMainPertanyaan] = useState('');
  const [mainJawaban, setMainJawaban] = useState('');

  // Additional Q&A pairs for "+ Add More Pertanyaan"
  const [additionalPairs, setAdditionalPairs] = useState<QuestionPair[]>([]);
  const [error, setError] = useState('');

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (tentangRef.current && !tentangRef.current.contains(e.target as Node)) {
        setTentangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    if (editingItem) {
      setTentang(editingItem.tentang || '');
      setTentangSearch(editingItem.tentang || '');
      setProyekId(editingItem.proyekId);
      setIsProyekSapa(editingItem.isProyekSapa ?? false);
      setMainPertanyaan(editingItem.pertanyaan || '');
      setMainJawaban(editingItem.jawaban || '');
      setAdditionalPairs([]);
    } else {
      setTentang('');
      setTentangSearch('');
      setProyekId(undefined);
      setIsProyekSapa(false);
      setMainPertanyaan('');
      setMainJawaban('');
      setAdditionalPairs([]);
    }
    setError('');
  }, [editingItem]);

  // Combine options from "Tentang List FAQ" and "Proyek SAPA"
  const filteredTentangFaq = useMemo(() => {
    if (!tentangSearch.trim()) return tentangList;
    return tentangList.filter((t) =>
      t.tentang.toLowerCase().includes(tentangSearch.toLowerCase())
    );
  }, [tentangList, tentangSearch]);

  const ongoingProjects = useMemo(() => {
    return projects.filter((p) => p.status !== 'Done');
  }, [projects]);

  const doneProjects = useMemo(() => {
    return projects.filter((p) => p.status === 'Done');
  }, [projects]);

  const filteredOngoingProjects = useMemo(() => {
    if (!tentangSearch.trim()) return ongoingProjects;
    return ongoingProjects.filter(
      (p) =>
        p.namaKegiatan.toLowerCase().includes(tentangSearch.toLowerCase()) ||
        p.jenisProyek.toLowerCase().includes(tentangSearch.toLowerCase())
    );
  }, [ongoingProjects, tentangSearch]);

  const filteredDoneProjects = useMemo(() => {
    if (!tentangSearch.trim()) return doneProjects;
    return doneProjects.filter(
      (p) =>
        p.namaKegiatan.toLowerCase().includes(tentangSearch.toLowerCase()) ||
        p.jenisProyek.toLowerCase().includes(tentangSearch.toLowerCase())
    );
  }, [doneProjects, tentangSearch]);

  const handleSelectTentangFaq = (t: TentangFaqItem) => {
    setTentang(t.tentang);
    setTentangSearch(t.tentang);
    setProyekId(undefined);
    setIsProyekSapa(false);
    setTentangDropdownOpen(false);
  };

  const handleSelectProject = (p: ProjectItem) => {
    setTentang(p.namaKegiatan);
    setTentangSearch(p.namaKegiatan);
    setProyekId(p.id);
    setIsProyekSapa(true);
    setTentangDropdownOpen(false);
  };

  const handleAddMorePertanyaan = () => {
    setAdditionalPairs([
      ...additionalPairs,
      {
        id: `qp-${Date.now()}-${Math.random()}`,
        pertanyaan: '',
        jawaban: '',
      },
    ]);
  };

  const handleRemoveAdditionalPair = (id: string) => {
    setAdditionalPairs(additionalPairs.filter((p) => p.id !== id));
  };

  const handleUpdateAdditionalPair = (
    id: string,
    field: 'pertanyaan' | 'jawaban',
    val: string
  ) => {
    setAdditionalPairs(
      additionalPairs.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!tentang.trim()) {
      setError('Tentang / Proyek SAPA wajib dipilih atau diisi');
      return;
    }

    if (!mainPertanyaan.trim()) {
      setError('Pertanyaan wajib diisi');
      return;
    }

    if (!mainJawaban.trim()) {
      setError('Jawaban wajib diisi');
      return;
    }

    // Build items to save
    const itemsToSave: FaqItem[] = [
      {
        id: editingItem ? editingItem.id : `faq-${Date.now()}`,
        tentang: tentang.trim(),
        proyekId,
        isProyekSapa,
        pertanyaan: mainPertanyaan.trim(),
        jawaban: mainJawaban.trim(),
        createdAt: editingItem?.createdAt || '15 Nov 2021',
      },
    ];

    // Add additional pairs if any
    additionalPairs.forEach((pair, index) => {
      if (pair.pertanyaan.trim() && pair.jawaban.trim()) {
        itemsToSave.push({
          id: `faq-${Date.now()}-${index + 1}`,
          tentang: tentang.trim(),
          proyekId,
          isProyekSapa,
          pertanyaan: pair.pertanyaan.trim(),
          jawaban: pair.jawaban.trim(),
          createdAt: '15 Nov 2021',
        });
      }
    });

    onSave(itemsToSave);
    onShowToast(
      `${itemsToSave.length} FAQ untuk "${tentang}" berhasil ${
        editingItem ? 'diperbarui' : 'disimpan'
      }`
    );
  };

  return (
    <div className="w-full flex flex-col gap-4 text-slate-800 animate-in fade-in duration-200">
      {/* Top Action Toolbar matching Form Transaksi S-SALUR and Form Identitas */}
      <div className="flex items-center justify-end gap-3 mb-2">
        <button
          type="button"
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Sensor / Visibility"
        >
          <EyeOff className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('form-pertanyaan-input');
            if (el) el.focus();
          }}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          title="Fokus Pertanyaan"
        >
          <Search className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          type="button"
          onClick={() => setTentangDropdownOpen(!tentangDropdownOpen)}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            tentangDropdownOpen
              ? 'text-[#008d91] bg-teal-50'
              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
          }`}
          title="Pilih Tentang / Proyek"
        >
          <SlidersHorizontal className="w-5 h-5 stroke-[1.8]" />
        </button>

        <button
          type="button"
          onClick={() => handleSubmit()}
          className="flex items-center gap-1.5 bg-[#008d91] hover:bg-[#05828e] text-white font-medium text-sm px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* Main Form Container matching Form Transaksi S-SALUR and Form Identitas */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-10 flex flex-col gap-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600 animate-in fade-in max-w-xl">
            {error}
          </div>
        )}

        {/* Form Body matching Image 3 */}
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
          {/* 1. Tentang/Proyek SAPA */}
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-2 sm:gap-4">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Tentang/Proyek SAPA
            </label>
            <div className="relative" ref={tentangRef}>
              <div
                onClick={() => setTentangDropdownOpen(!tentangDropdownOpen)}
                className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 flex items-center justify-between cursor-pointer hover:border-slate-300 transition-all shadow-2xs"
              >
                <input
                  type="text"
                  value={tentangDropdownOpen ? tentangSearch : tentang || ''}
                  onChange={(e) => {
                    setTentangSearch(e.target.value);
                    setTentang(e.target.value);
                    // Reset project connection if custom text
                    setProyekId(undefined);
                    setIsProyekSapa(false);
                  }}
                  onFocus={() => setTentangDropdownOpen(true)}
                  placeholder="Search..."
                  className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent cursor-pointer"
                />
                <div className="w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 ml-2 shadow-xs">
                  <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>

              {/* Categorized Dropdown List */}
              {tentangDropdownOpen && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-40 animate-in fade-in zoom-in-95 duration-100 max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {/* Category A: Tentang List FAQ */}
                  <div className="pb-2">
                    <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Tentang List FAQ
                    </div>
                    {filteredTentangFaq.length === 0 ? (
                      <div className="px-3 py-1.5 text-xs text-slate-400 italic">
                        Tidak ada kategori Tentang yang cocok
                      </div>
                    ) : (
                      filteredTentangFaq.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSelectTentangFaq(t)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between transition-colors ${
                            tentang === t.tentang && !isProyekSapa
                              ? 'text-[#008d91] bg-teal-50'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span>{t.tentang}</span>
                          {tentang === t.tentang && !isProyekSapa && (
                            <Check className="w-3.5 h-3.5 text-[#008d91]" />
                          )}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Category B: Proyek SAPA (Ongoing) */}
                  <div className="py-2">
                    <div className="px-3 py-1 text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center justify-between">
                      <span>Proyek SAPA (Ongoing)</span>
                      <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md font-semibold">
                        Berjalan
                      </span>
                    </div>
                    {filteredOngoingProjects.length === 0 ? (
                      <div className="px-3 py-1.5 text-xs text-slate-400 italic">
                        Tidak ada Proyek SAPA ongoing
                      </div>
                    ) : (
                      filteredOngoingProjects.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectProject(p)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between transition-colors ${
                            proyekId === p.id
                              ? 'text-[#008d91] bg-teal-50'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-slate-800">
                              {p.namaKegiatan}
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {p.jenisProyek} • Divisi {p.divisi}
                            </div>
                          </div>
                          {proyekId === p.id && (
                            <Check className="w-3.5 h-3.5 text-[#008d91]" />
                          )}
                        </button>
                      ))
                    )}
                  </div>

                  {/* Category C: Proyek SAPA (Selesai) */}
                  <div className="pt-2">
                    <div className="px-3 py-1 text-[11px] font-bold text-emerald-600 uppercase tracking-wider flex items-center justify-between">
                      <span>Proyek SAPA (Selesai)</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md font-semibold">
                        Selesai
                      </span>
                    </div>
                    {filteredDoneProjects.length === 0 ? (
                      <div className="px-3 py-1.5 text-xs text-slate-400 italic">
                        Tidak ada Proyek SAPA selesai
                      </div>
                    ) : (
                      filteredDoneProjects.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectProject(p)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer flex items-center justify-between transition-colors ${
                            proyekId === p.id
                              ? 'text-[#008d91] bg-teal-50'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-slate-800">
                              {p.namaKegiatan}
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {p.jenisProyek} • Selesai
                            </div>
                          </div>
                          {proyekId === p.id && (
                            <Check className="w-3.5 h-3.5 text-[#008d91]" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Pertanyaan */}
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-center gap-2 sm:gap-4">
            <label className="text-xs sm:text-sm font-medium text-slate-700">
              Pertanyaan
            </label>
            <input
              id="form-pertanyaan-input"
              type="text"
              value={mainPertanyaan}
              onChange={(e) => setMainPertanyaan(e.target.value)}
              placeholder="Input Text..."
              className="w-full bg-white border border-slate-200/90 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] transition-all shadow-2xs"
            />
          </div>

          {/* 3. Jawaban */}
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-start gap-2 sm:gap-4 pt-1">
            <label className="text-xs sm:text-sm font-medium text-slate-700 pt-2">
              Jawaban
            </label>
            <textarea
              rows={5}
              value={mainJawaban}
              onChange={(e) => setMainJawaban(e.target.value)}
              placeholder="Input Text..."
              className="w-full bg-white border border-slate-200/90 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91] transition-all shadow-2xs resize-y min-h-[120px]"
            />
          </div>

          {/* Additional Q&A Pairs (if user clicked Add More Pertanyaan) */}
          {additionalPairs.map((pair, idx) => (
            <div
              key={pair.id}
              className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#008d91]">
                  Pertanyaan Tambahan #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveAdditionalPair(pair.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                  title="Hapus Pertanyaan Ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-center gap-2">
                <label className="text-xs font-medium text-slate-700">
                  Pertanyaan
                </label>
                <input
                  type="text"
                  value={pair.pertanyaan}
                  onChange={(e) =>
                    handleUpdateAdditionalPair(
                      pair.id,
                      'pertanyaan',
                      e.target.value
                    )
                  }
                  placeholder="Input Text..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] items-start gap-2">
                <label className="text-xs font-medium text-slate-700 pt-1.5">
                  Jawaban
                </label>
                <textarea
                  rows={3}
                  value={pair.jawaban}
                  onChange={(e) =>
                    handleUpdateAdditionalPair(
                      pair.id,
                      'jawaban',
                      e.target.value
                    )
                  }
                  placeholder="Input Text..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#008d91]"
                />
              </div>
            </div>
          ))}

          {/* 4. Add More Pertanyaan Button matching Image 3 */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleAddMorePertanyaan}
              className="inline-flex items-center gap-2 text-[#008d91] hover:text-[#007a7e] font-semibold text-xs sm:text-sm cursor-pointer select-none transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shadow-xs">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>Add More Pertanyaan</span>
            </button>
          </div>
        </form>
      </div>

      {/* Bottom Action Buttons matching Form Transaksi S-SALUR and Form Identitas */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-start gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-6 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => handleSubmit()}
          className="rounded-xl px-6 py-2.5 bg-[#008d91] hover:bg-[#05828e] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>{editingItem ? 'Simpan Perubahan' : 'Simpan Data'}</span>
        </button>
      </div>
    </div>
  );
};
