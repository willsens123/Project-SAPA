import React, { useState, useRef, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  EyeOff,
  Search,
  SlidersHorizontal,
  Plus,
  Image as ImageIcon,
  MoreHorizontal,
  X,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { TemplatePMItem, ProjectItem, ImageOverlayField } from '../types';
import { ImageCustomFieldEditor } from './ImageCustomFieldEditor';
import {
  DHARMA_PATRON_SVG_TEMPLATE,
  DEFAULT_DHARMA_PATRON_FIELDS,
} from '../data/defaultImageTemplates';

interface FormTemplatePMProps {
  initialItem?: TemplatePMItem | null;
  projects?: ProjectItem[];
  onSave: (item: TemplatePMItem) => void;
  onCancel: () => void;
  onShowToast?: (message: string) => void;
}

interface CustomTagDefinition {
  category: 'Identitas' | 'Organisasi' | 'Proyek SAPA' | 'Transaksi' | 'Item';
  tag: string;
  label: string;
  defaultCustomValue: string;
}

const ALL_CUSTOM_TAGS: CustomTagDefinition[] = [
  // Identitas
  { category: 'Identitas', tag: '[Nama Lengkap]', label: '+ Nama Lengkap', defaultCustomValue: 'Budi Santoso' },
  { category: 'Identitas', tag: '[Nama Panggilan]', label: '+ Nama Panggilan', defaultCustomValue: 'Budi' },
  { category: 'Identitas', tag: '[Jenis Panggilan]', label: '+ Jenis Panggilan', defaultCustomValue: 'Bpk/Ibu' },
  // Organisasi
  { category: 'Organisasi', tag: '[Nama Organisasi]', label: '+ Nama Organisasi', defaultCustomValue: 'Yayasan Peduli Insan' },
  { category: 'Organisasi', tag: '[Nama Sub Organisasi]', label: '+ Nama Sub Organisasi', defaultCustomValue: 'Divisi Relawan' },
  // Proyek SAPA
  { category: 'Proyek SAPA', tag: '[Nama Proyek SAPA]', label: '+ Nama Proyek SAPA', defaultCustomValue: 'Save Nomor HP Donatur SAPA' },
  // Transaksi
  { category: 'Transaksi', tag: '[Promo]', label: '+ Promo', defaultCustomValue: 'PROMO-BERKAH' },
  // Item
  { category: 'Item', tag: '[Nama Item]', label: '+ Nama Item', defaultCustomValue: 'Buku Kisah Dhamma' },
  { category: 'Item', tag: '[Sub-Jenis Item]', label: '+ Sub-Jenis Item', defaultCustomValue: 'Buku Anak' },
  { category: 'Item', tag: '[Kategori Item]', label: '+ Kategori Item', defaultCustomValue: 'Dharma Kit' },
];

export const FormTemplatePM: React.FC<FormTemplatePMProps> = ({
  initialItem,
  projects = [],
  onSave,
  onCancel,
  onShowToast = (_message: string) => {},
}) => {
  // Form States
  const [namaTemplate, setNamaTemplate] = useState<string>(initialItem?.namaTemplate || '');
  const [proyekSapa, setProyekSapa] = useState<string>(initialItem?.kegiatan || '');
  const [isProyekDropdownOpen, setIsProyekDropdownOpen] = useState(false);
  const [hitungRate, setHitungRate] = useState<boolean>(false);
  const [hasImage, setHasImage] = useState<boolean>(Boolean(initialItem?.hasImage));
  const [imageName, setImageName] = useState<string>(
    initialItem?.hasImage ? 'template-banner.jpg' : ''
  );
  const [imageSrc, setImageSrc] = useState<string>(
    initialItem?.imageUrl || (initialItem?.hasImage ? DHARMA_PATRON_SVG_TEMPLATE : '')
  );
  const [imageOverlayFields, setImageOverlayFields] = useState<ImageOverlayField[]>(
    initialItem?.imageOverlayFields && initialItem.imageOverlayFields.length > 0
      ? initialItem.imageOverlayFields
      : initialItem?.hasImage
      ? DEFAULT_DHARMA_PATRON_FIELDS
      : []
  );
  const [showCustomMessage, setShowCustomMessage] = useState<boolean>(true);

  // Selected custom field values that the user has added and can customize
  const [customFields, setCustomFields] = useState<{ tag: string; label: string; value: string }[]>([
    { tag: '[Nama Lengkap]', label: 'Nama Lengkap', value: 'Budi Santoso' },
    { tag: '[Nama Item]', label: 'Nama Item', value: 'Buku Kisah Dhamma' },
  ]);

  const [isiTemplate, setIsiTemplate] = useState<string>(
    initialItem?.isiPesan ||
      'Namo Buddhaya [Nama Lengkap],\n\nTerima kasih telah berpartisipasi dalam kegiatan [Nama Proyek SAPA]. Paket [Nama Item] dengan kode [Promo] sedang kami siapkan untuk Anda.\n\nSemoga kebajikan ini membawa sukacita dan kebahagiaan bagi Anda sekeluarga. 🙏'
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Proyek SAPA dropdown filter
  const filteredProjects = useMemo(() => {
    if (!proyekSapa.trim()) return projects.slice(0, 8);
    return projects
      .filter((p) => p.namaKegiatan.toLowerCase().includes(proyekSapa.toLowerCase()))
      .slice(0, 8);
  }, [projects, proyekSapa]);

  // Handle inserting tag into Isi Template
  const handleInsertTag = (tag: string, label: string, defaultValue: string) => {
    // Add to customFields if not exists
    if (!customFields.some((f) => f.tag === tag)) {
      setCustomFields((prev) => [...prev, { tag, label: label.replace(/^\+\s*/, ''), value: defaultValue }]);
    }

    // Insert into textarea at current cursor or end
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart || isiTemplate.length;
      const end = textarea.selectionEnd || isiTemplate.length;
      const textBefore = isiTemplate.substring(0, start);
      const textAfter = isiTemplate.substring(end);
      const newText = textBefore + tag + textAfter;
      setIsiTemplate(newText);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + tag.length, start + tag.length);
      }, 50);
    } else {
      setIsiTemplate((prev) => `${prev} ${tag}`);
    }

    onShowToast(`Tag ${tag} berhasil disisipkan ke pesan`);
  };

  // Remove tag from customFields
  const handleRemoveCustomField = (tagToRemove: string) => {
    setCustomFields((prev) => prev.filter((f) => f.tag !== tagToRemove));
  };

  // Update customized value for tag
  const handleUpdateCustomValue = (tag: string, newValue: string) => {
    setCustomFields((prev) =>
      prev.map((f) => (f.tag === tag ? { ...f, value: newValue } : f))
    );
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImageSrc(result);
        setImageName(file.name);
        setHasImage(true);
        if (imageOverlayFields.length === 0) {
          setImageOverlayFields(DEFAULT_DHARMA_PATRON_FIELDS);
        }
        onShowToast(`Gambar "${file.name}" berhasil dipilih. Pilihan kustomisasi field aktif.`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick preset: Dharma Patron template
  const handleSelectDharmaPatronPreset = () => {
    setImageSrc(DHARMA_PATRON_SVG_TEMPLATE);
    setImageName('Template Tanda Terima Dharma Patron.png');
    setHasImage(true);
    if (imageOverlayFields.length === 0) {
      setImageOverlayFields(DEFAULT_DHARMA_PATRON_FIELDS);
    }
    onShowToast('Template Tanda Terima Dharma Patron berhasil dipilih.');
  };

  // Handle Save
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaTemplate.trim()) {
      onShowToast('Mohon isi Nama Template');
      return;
    }

    const saved: TemplatePMItem = {
      id: initialItem?.id || `tpl-${Date.now()}`,
      namaTemplate: namaTemplate.trim(),
      subTitle: 'Template',
      kegiatan: proyekSapa.trim() || 'Proyek SAPA',
      itemTerkait: customFields.find((f) => f.tag === '[Nama Item]')?.value || initialItem?.itemTerkait || '',
      avatarInitial: namaTemplate[0]?.toUpperCase() || 'T',
      avatarBg: initialItem?.avatarBg || 'bg-[#008d91]',
      aktif: initialItem ? initialItem.aktif : true,
      isiPesan: isiTemplate,
      hasImage,
      imageUrl: hasImage ? imageSrc : undefined,
      imageOverlayFields: hasImage ? imageOverlayFields : undefined,
    };

    onSave(saved);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-slate-100/80 min-h-screen text-slate-800">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* TOP HEADER MATCHING USER SCREENSHOT */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-8 border-b border-slate-100">
        {/* Left Header: Title, Back Button, Monk Avatar, Speech Bubble, Next Button */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Form Template PM
          </h1>

          {/* Circular Left Arrow Button */}
          <button
            type="button"
            onClick={onCancel}
            title="Kembali ke Template PM"
            className="w-8 h-8 rounded-full bg-slate-200/90 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Cartoon Character Avatar (Yellow circle background with anime/chibi monk) */}
          <div className="w-11 h-11 rounded-full bg-[#f6ba33] border-2 border-white shadow-xs overflow-hidden flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-10 h-10">
              {/* Head / Face */}
              <circle cx="50" cy="52" r="32" fill="#ffd9b3" />
              {/* Hair / Headband */}
              <path
                d="M20 42 C 22 20, 78 20, 80 42 C 80 28, 70 14, 50 14 C 30 14, 20 28, 20 42 Z"
                fill="#4a2c16"
              />
              <path
                d="M32 18 C 36 6, 64 6, 68 18 C 62 10, 38 10, 32 18 Z"
                fill="#4a2c16"
              />
              {/* Eyes */}
              <ellipse cx="38" cy="50" rx="4" ry="5.5" fill="#222" />
              <ellipse cx="62" cy="50" rx="4" ry="5.5" fill="#222" />
              <circle cx="36.5" cy="48" r="1.5" fill="#fff" />
              <circle cx="60.5" cy="48" r="1.5" fill="#fff" />
              {/* Eyebrows */}
              <path d="M33 42 Q 38 39 43 43" stroke="#4a2c16" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <path d="M57 43 Q 62 39 67 42" stroke="#4a2c16" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Cheeks Blush */}
              <ellipse cx="32" cy="58" rx="4.5" ry="2.5" fill="#ff9999" opacity="0.6" />
              <ellipse cx="68" cy="58" rx="4.5" ry="2.5" fill="#ff9999" opacity="0.6" />
              {/* Smiling Open Mouth */}
              <path d="M42 58 Q 50 67 58 58 Z" fill="#d32f2f" />
              <path d="M45 59 Q 50 63 55 59" fill="#fff" />
            </svg>
          </div>

          {/* Teal Speech Bubble with left tail */}
          <div className="relative bg-[#008d91] rounded-2xl h-10 px-5 flex items-center min-w-[200px] sm:min-w-[320px] shadow-xs">
            {/* Triangular left tail */}
            <div
              className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[8px] border-r-[#008d91]"
            />
            <span className="text-white text-xs sm:text-sm font-medium tracking-wide">
              {namaTemplate || 'Form Pembuatan & Kustomisasi Pesan Template PM'}
            </span>
          </div>

          {/* Circular Right Arrow Button */}
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-slate-200/90 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Right Header: Time, Date, and Three-dot Menu */}
        <div className="flex items-center gap-4 self-end lg:self-auto">
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-light text-[#008d91] leading-none tracking-tight">
              09:59
            </div>
            <div className="text-xs font-semibold text-[#008d91] mt-1">
              Senin, 15 November 2021
            </div>
          </div>
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ACTION TOOLBAR: EyeOff, Search, Sliders, + Add */}
      <div className="flex justify-end items-center gap-3 mt-4 mb-8">
        <button
          type="button"
          title="Sembunyikan Data Sensitif"
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <EyeOff className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Pencarian"
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          type="button"
          title="Filter Form"
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => {
            setNamaTemplate('');
            setProyekSapa('');
            setIsiTemplate('');
            onShowToast('Form Template PM baru siap diisi');
          }}
          className="bg-[#008d91] hover:bg-[#05828e] text-white px-5 py-2 rounded-xl font-semibold text-xs sm:text-sm shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add</span>
        </button>
      </div>

      {/* FORM BODY */}
      <form onSubmit={handleFormSubmit} className="space-y-6 max-w-5xl">
        {/* ROW 1: Nama Template */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-4 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Nama Template
          </label>
          <div className="md:col-span-9 max-w-xl">
            <input
              type="text"
              value={namaTemplate}
              onChange={(e) => setNamaTemplate(e.target.value)}
              placeholder="Input Text..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#008d91] bg-white transition-colors"
            />
          </div>
        </div>

        {/* ROW 2: Proyek SAPA */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-4 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Proyek SAPA
          </label>
          <div className="md:col-span-9 max-w-xl relative">
            <div className="relative">
              <input
                type="text"
                value={proyekSapa}
                onChange={(e) => {
                  setProyekSapa(e.target.value);
                  setIsProyekDropdownOpen(true);
                }}
                onFocus={() => setIsProyekDropdownOpen(true)}
                placeholder="Search..."
                className="w-full px-4 py-2.5 pr-12 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#008d91] bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => setIsProyekDropdownOpen(!isProyekDropdownOpen)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#008d91] text-white flex items-center justify-center hover:bg-[#05828e] transition-colors cursor-pointer shadow-xs"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dropdown Suggestions */}
            {isProyekDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-40 max-h-56 overflow-y-auto">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((proj) => (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => {
                        setProyekSapa(proj.namaKegiatan);
                        setIsProyekDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#f0f6fa] hover:text-[#008d91] transition-colors flex items-center justify-between"
                    >
                      <span>{proj.namaKegiatan}</span>
                      <span className="text-[10px] text-slate-400">{proj.divisi}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-xs text-slate-400">
                    Gunakan "{proyekSapa}" sebagai nama kegiatan baru
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ROW 3: Hitung Rate? */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-4 items-center">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal">
            Hitung Rate?
          </label>
          <div className="md:col-span-9 flex items-center gap-8 text-sm text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="hitungRate"
                checked={!hitungRate}
                onChange={() => setHitungRate(false)}
                className="w-4 h-4 accent-[#008d91] cursor-pointer"
              />
              <span>Tidak</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="radio"
                name="hitungRate"
                checked={hitungRate}
                onChange={() => setHitungRate(true)}
                className="w-4 h-4 accent-[#008d91] cursor-pointer"
              />
              <span>Ya</span>
            </label>
          </div>
        </div>

        {/* ROW 4: Gambar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-4 items-start">
          <label className="md:col-span-3 text-sm text-slate-700 font-normal pt-2">
            Gambar
          </label>
          <div className="md:col-span-9 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-[#008d91] font-semibold text-sm hover:text-[#05828e] transition-colors cursor-pointer group"
              >
                <div className="relative inline-flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-[#008d91]" />
                  <Plus className="w-3.5 h-3.5 text-[#008d91] absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-xs" />
                </div>
                <span className="group-hover:underline">Add Image(s)</span>
              </button>

              {/* Preset Template Quick Button */}
              <button
                type="button"
                onClick={handleSelectDharmaPatronPreset}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Gunakan contoh Template Tanda Terima Dharma Patron"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Pilih Template Dharma Patron</span>
              </button>

              {imageName && (
                <div className="flex items-center gap-2 bg-[#f0f6fa] text-[#008d91] px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200/60">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span className="max-w-[200px] truncate">{imageName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setImageName('');
                      setImageSrc('');
                      setHasImage(false);
                    }}
                    title="Hapus gambar"
                    className="text-slate-400 hover:text-red-500 transition-colors p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* CONDITIONAL: SETELAH GAMBAR DIPILIH -> PILIHAN TAMBAH FIELD CUSTOM */}
            {hasImage && imageSrc && (
              <ImageCustomFieldEditor
                imageSrc={imageSrc}
                imageName={imageName}
                fields={imageOverlayFields}
                onChangeFields={setImageOverlayFields}
                onInsertTagToTemplate={(tag) => handleInsertTag(tag, tag, '')}
              />
            )}
          </div>
        </div>

        {/* ROW 5: TAMBAH CUSTOM MESSAGE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Left Column: ▼ Tambah custom message & customizable fields/preview box */}
          <div className="lg:col-span-4 flex flex-col">
            <button
              type="button"
              onClick={() => setShowCustomMessage(!showCustomMessage)}
              className="flex items-center gap-2 text-[#008d91] font-bold text-sm mb-3 cursor-pointer text-left select-none"
            >
              <span className="text-xs">{showCustomMessage ? '▼' : '▶'}</span>
              <span>Tambah custom message</span>
            </button>

            {/* Rounded light container on the left under Tambah custom message */}
            <div className="w-full rounded-2xl bg-[#f0f6fa] border border-slate-100 p-4 min-h-[300px] flex flex-col justify-between">
              {customFields.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Field Kustom Aktif</span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded-md text-[#008d91] font-bold border border-slate-100">
                      {customFields.length} Variabel
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {customFields.map((field) => (
                      <div
                        key={field.tag}
                        className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#008d91]">
                            {field.tag}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomField(field.tag)}
                            title="Hapus field kustom"
                            className="text-slate-300 hover:text-red-500 transition-colors p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => handleUpdateCustomValue(field.tag, e.target.value)}
                          placeholder={`Nilai kustom ${field.label}...`}
                          className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#008d91] text-slate-700"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 text-[#008d91]/50" />
                  <p className="text-xs leading-relaxed">
                    Klik tombol variabel di sebelah kanan untuk menambahkan isi form aplikasi yang dapat dikustomisasi.
                  </p>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200/50 mt-auto">
                <span className="text-[11px] text-slate-400">
                  Variabel dalam teks akan digantikan dengan data saat pengiriman pesan.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Categories with dashed pill buttons matching screenshot */}
          <div className="lg:col-span-8">
            <div className="w-full rounded-2xl bg-[#f0f6fa] border border-slate-100 p-6 space-y-5">
              {/* Category 1: Identitas */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-[#008d91] font-bold text-sm">
                  <span className="text-[10px]">▶</span>
                  <span>Identitas</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {ALL_CUSTOM_TAGS.filter((t) => t.category === 'Identitas').map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => handleInsertTag(item.tag, item.label, item.defaultCustomValue)}
                      className="bg-white border-2 border-dashed border-slate-300 hover:border-[#008d91] hover:text-[#008d91] text-slate-700 px-4 py-2 rounded-2xl text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category 2: Organisasi */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-[#008d91] font-bold text-sm">
                  <span className="text-[10px]">▶</span>
                  <span>Organisasi</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {ALL_CUSTOM_TAGS.filter((t) => t.category === 'Organisasi').map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => handleInsertTag(item.tag, item.label, item.defaultCustomValue)}
                      className="bg-white border-2 border-dashed border-slate-300 hover:border-[#008d91] hover:text-[#008d91] text-slate-700 px-4 py-2 rounded-2xl text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category 3: Proyek SAPA */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-[#008d91] font-bold text-sm">
                  <span className="text-[10px]">▶</span>
                  <span>Proyek SAPA</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {ALL_CUSTOM_TAGS.filter((t) => t.category === 'Proyek SAPA').map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => handleInsertTag(item.tag, item.label, item.defaultCustomValue)}
                      className="bg-white border-2 border-dashed border-slate-300 hover:border-[#008d91] hover:text-[#008d91] text-slate-700 px-4 py-2 rounded-2xl text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category 4: Transaksi */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-[#008d91] font-bold text-sm">
                  <span className="text-[10px]">▼</span>
                  <span>Transaksi</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {ALL_CUSTOM_TAGS.filter((t) => t.category === 'Transaksi').map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => handleInsertTag(item.tag, item.label, item.defaultCustomValue)}
                      className="bg-white border-2 border-dashed border-slate-300 hover:border-[#008d91] hover:text-[#008d91] text-slate-700 px-4 py-2 rounded-2xl text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category 5: Item */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-[#008d91] font-bold text-sm">
                  <span className="text-[10px]">▼</span>
                  <span>Item</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {ALL_CUSTOM_TAGS.filter((t) => t.category === 'Item').map((item) => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => handleInsertTag(item.tag, item.label, item.defaultCustomValue)}
                      className="bg-white border-2 border-dashed border-slate-300 hover:border-[#008d91] hover:text-[#008d91] text-slate-700 px-4 py-2 rounded-2xl text-xs font-semibold shadow-2xs transition-all cursor-pointer active:scale-95"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 6: Isi Template */}
        <div className="space-y-2 pt-2">
          <label className="block text-sm text-slate-700 font-normal">
            Isi Template
          </label>
          <textarea
            ref={textareaRef}
            rows={7}
            value={isiTemplate}
            onChange={(e) => setIsiTemplate(e.target.value)}
            placeholder="Input Text..."
            className="w-full rounded-2xl border border-slate-200 p-4 text-sm focus:outline-none focus:border-[#008d91] bg-white transition-colors leading-relaxed"
          />
        </div>

        {/* ROW 7: Bottom Action Buttons (Cancel and Save) */}
        <div className="flex items-center justify-end gap-3 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-10 py-2.5 rounded-xl bg-[#008d91] hover:bg-[#05828e] text-white text-sm font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};
