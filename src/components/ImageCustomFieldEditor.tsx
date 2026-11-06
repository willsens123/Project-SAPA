import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Move,
  Type,
  Palette,
  Eye,
  Sliders,
  Sparkles,
  Download,
  RotateCcw,
  Check,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { ImageOverlayField } from '../types';
import { DEFAULT_DHARMA_PATRON_FIELDS } from '../data/defaultImageTemplates';

interface ImageCustomFieldEditorProps {
  imageSrc: string;
  imageName?: string;
  fields: ImageOverlayField[];
  onChangeFields: (fields: ImageOverlayField[]) => void;
  onInsertTagToTemplate?: (tag: string) => void;
}

export const ImageCustomFieldEditor: React.FC<ImageCustomFieldEditorProps> = ({
  imageSrc,
  imageName,
  fields,
  onChangeFields,
  onInsertTagToTemplate,
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    fields[0]?.id || null
  );
  const [previewMode, setPreviewMode] = useState<'sample' | 'tag'>('sample');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null);

  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize selection if fields change
  useEffect(() => {
    if (fields.length > 0 && (!selectedFieldId || !fields.some((f) => f.id === selectedFieldId))) {
      setSelectedFieldId(fields[0].id);
    }
  }, [fields, selectedFieldId]);

  // Add a new custom field
  const handleAddField = (preset?: Partial<ImageOverlayField>) => {
    const newId = `field-${Date.now()}`;
    const newField: ImageOverlayField = {
      id: newId,
      label: preset?.label || `Field Custom ${fields.length + 1}`,
      tag: preset?.tag || `[Field_${fields.length + 1}]`,
      value: preset?.value || 'Contoh Nilai',
      posX: preset?.posX ?? 50,
      posY: preset?.posY ?? 50 + fields.length * 4,
      fontSize: preset?.fontSize ?? 20,
      fontFamily: preset?.fontFamily ?? 'sans',
      color: preset?.color ?? '#e53935',
      isBold: preset?.isBold ?? true,
      isItalic: preset?.isItalic ?? false,
      align: preset?.align ?? 'left',
    };

    const updated = [...fields, newField];
    onChangeFields(updated);
    setSelectedFieldId(newId);
  };

  // Remove field
  const handleRemoveField = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = fields.filter((f) => f.id !== id);
    onChangeFields(updated);
    if (selectedFieldId === id) {
      setSelectedFieldId(updated[0]?.id || null);
    }
  };

  // Update specific field properties
  const handleUpdateField = (id: string, patch: Partial<ImageOverlayField>) => {
    const updated = fields.map((f) => (f.id === id ? { ...f, ...patch } : f));
    onChangeFields(updated);
  };

  // Reset to default Dharma Patron sample fields (Enni Megawati, etc.)
  const handleApplyDharmaPatronPreset = () => {
    onChangeFields(DEFAULT_DHARMA_PATRON_FIELDS);
    setSelectedFieldId(DEFAULT_DHARMA_PATRON_FIELDS[0].id);
  };

  // Dragging logic on the image preview
  const handlePointerDown = (fieldId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedFieldId(fieldId);
    setDraggingFieldId(fieldId);
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !draggingFieldId || !imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    // Calculate percentage (clamped between 2% and 98%)
    let percentX = ((clientX - rect.left) / rect.width) * 100;
    let percentY = ((clientY - rect.top) / rect.height) * 100;

    percentX = Math.max(2, Math.min(98, Math.round(percentX * 10) / 10));
    percentY = Math.max(2, Math.min(98, Math.round(percentY * 10) / 10));

    handleUpdateField(draggingFieldId, { posX: percentX, posY: percentY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      setDraggingFieldId(null);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    }
  };

  // Download rendered canvas as PNG
  const handleDownloadPreview = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 1131;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw base image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw custom fields
      fields.forEach((field) => {
        const x = (field.posX / 100) * canvas.width;
        const y = (field.posY / 100) * canvas.height;

        // Scale font size proportionally to original image width
        const scaleFactor = canvas.width / 600;
        const fontSizePx = Math.round(field.fontSize * scaleFactor);

        let fontStr = '';
        if (field.isItalic) fontStr += 'italic ';
        if (field.isBold) fontStr += 'bold ';

        if (field.fontFamily === 'cursive') {
          fontStr += `${fontSizePx}px 'Dancing Script', cursive`;
        } else if (field.fontFamily === 'serif') {
          fontStr += `${fontSizePx}px Georgia, serif`;
        } else {
          fontStr += `${fontSizePx}px 'Plus Jakarta Sans', sans-serif`;
        }

        ctx.font = fontStr;
        ctx.fillStyle = field.color;
        ctx.textAlign = (field.align || 'left') as CanvasTextAlign;
        ctx.textBaseline = 'middle';

        const textToDraw = previewMode === 'sample' ? field.value : field.tag;
        ctx.fillText(textToDraw, x, y);
      });

      // Export to PNG
      const link = document.createElement('a');
      link.download = `tanda-terima-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = imageSrc;
  };

  const currentField = fields.find((f) => f.id === selectedFieldId) || fields[0];

  const COLOR_PRESETS = [
    { label: 'Merah (Contoh Tanda Terima)', value: '#e53935' },
    { label: 'Toska SAPA', value: '#008d91' },
    { label: 'Hitam Elegan', value: '#0f172a' },
    { label: 'Biru Lamrim', value: '#0288d1' },
    { label: 'Emas Paramita', value: '#d97706' },
  ];

  return (
    <div className="w-full bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-4 sm:p-6 mt-4 space-y-6">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008d91] animate-pulse" />
            <h3 className="text-base font-bold text-slate-800 tracking-tight">
              Field Custom pada Gambar Template
            </h3>
            <span className="bg-[#008d91]/10 text-[#008d91] text-xs font-bold px-2 py-0.5 rounded-full">
              {fields.length} Field Aktif
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tambahkan teks kustom (Nama Donatur, Tanggal, Jumlah, Bulan Donasi) yang akan dicetak di atas gambar template.
          </p>
        </div>

        {/* Top Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Preset Button */}
          <button
            type="button"
            onClick={handleApplyDharmaPatronPreset}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Terapkan preset field persis seperti contoh Tanda Terima Dharma Patron (Enni Megawati)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Preset Dharma Patron</span>
          </button>

          {/* Add Field Button */}
          <button
            type="button"
            onClick={() => handleAddField()}
            className="px-3 py-1.5 rounded-xl bg-[#008d91] hover:bg-[#05828e] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Field Custom</span>
          </button>
        </div>
      </div>

      {/* QUICK CHIP SHORTCUTS FOR COMMON FIELDS */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
        <span className="text-[11px] font-semibold text-slate-400">Pilihan Cepat:</span>
        <button
          type="button"
          onClick={() =>
            handleAddField({
              label: 'Nama Donatur',
              tag: '[Nama Lengkap]',
              value: 'Enni Megawati',
              fontSize: 38,
              fontFamily: 'cursive',
              color: '#e53935',
              isBold: true,
              posX: 50,
              posY: 54.5,
              align: 'center',
            })
          }
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#008d91] hover:text-[#008d91] text-xs font-medium transition-colors cursor-pointer"
        >
          + Nama Donatur (Cursive Red)
        </button>

        <button
          type="button"
          onClick={() =>
            handleAddField({
              label: 'Tanggal Terima',
              tag: '[Tanggal Terima]',
              value: '10 Januari 2025',
              fontSize: 18,
              fontFamily: 'sans',
              color: '#e53935',
              isBold: true,
              posX: 40.5,
              posY: 62.4,
              align: 'left',
            })
          }
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#008d91] hover:text-[#008d91] text-xs font-medium transition-colors cursor-pointer"
        >
          + Tanggal Terima
        </button>

        <button
          type="button"
          onClick={() =>
            handleAddField({
              label: 'Jumlah Donasi',
              tag: '[Jumlah]',
              value: 'Rp50.000',
              fontSize: 18,
              fontFamily: 'sans',
              color: '#e53935',
              isBold: true,
              posX: 40.5,
              posY: 65.5,
              align: 'left',
            })
          }
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#008d91] hover:text-[#008d91] text-xs font-medium transition-colors cursor-pointer"
        >
          + Jumlah Donasi
        </button>

        <button
          type="button"
          onClick={() =>
            handleAddField({
              label: 'Bulan Donasi',
              tag: '[Bulan Donasi]',
              value: 'Januari 2025',
              fontSize: 18,
              fontFamily: 'sans',
              color: '#e53935',
              isBold: true,
              posX: 40.5,
              posY: 68.6,
              align: 'left',
            })
          }
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#008d91] hover:text-[#008d91] text-xs font-medium transition-colors cursor-pointer"
        >
          + Bulan Donasi
        </button>

        <button
          type="button"
          onClick={() =>
            handleAddField({
              label: 'No. Resi / Transaksi',
              tag: '[No Resi]',
              value: 'DP-202501-889',
              fontSize: 16,
              fontFamily: 'sans',
              color: '#008d91',
              isBold: true,
              posX: 40.5,
              posY: 71.5,
              align: 'left',
            })
          }
          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#008d91] hover:text-[#008d91] text-xs font-medium transition-colors cursor-pointer"
        >
          + No Resi
        </button>
      </div>

      {/* TWO-COLUMN LAYOUT: LEFT VISUAL PREVIEW & RIGHT EDITING CONTROLS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: LIVE IMAGE PREVIEW WITH DRAGGABLE OVERLAYS */}
        <div className="lg:col-span-6 flex flex-col items-center">
          {/* Mode Switch & Download Toolbar */}
          <div className="w-full flex items-center justify-between pb-2 text-xs">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => setPreviewMode('sample')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  previewMode === 'sample'
                    ? 'bg-[#008d91] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Contoh Nyata
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('tag')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  previewMode === 'tag'
                    ? 'bg-[#008d91] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tag Variabel
              </button>
            </div>

            <button
              type="button"
              onClick={handleDownloadPreview}
              className="px-3 py-1 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Download gambar yang sudah digabungkan dengan teks kustom"
            >
              <Download className="w-3.5 h-3.5 text-[#008d91]" />
              <span>Unduh PNG</span>
            </button>
          </div>

          {/* Draggable Canvas Box */}
          <div
            ref={imageContainerRef}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="relative w-full max-w-[440px] aspect-[800/1131] rounded-2xl overflow-hidden border-2 border-slate-200 bg-white shadow-md select-none touch-none cursor-crosshair group"
            style={{ touchAction: 'none' }}
          >
            {/* Background Template Image */}
            <img
              src={imageSrc}
              alt="Template PM Preview"
              className="w-full h-full object-contain pointer-events-none"
            />

            {/* Rendered Text Overlays */}
            {fields.map((field) => {
              const isSelected = field.id === selectedFieldId;
              const textContent = previewMode === 'sample' ? field.value : field.tag;

              return (
                <div
                  key={field.id}
                  onPointerDown={(e) => handlePointerDown(field.id, e)}
                  style={{
                    position: 'absolute',
                    left: `${field.posX}%`,
                    top: `${field.posY}%`,
                    transform:
                      field.align === 'center'
                        ? 'translate(-50%, -50%)'
                        : field.align === 'right'
                        ? 'translate(-100%, -50%)'
                        : 'translate(0%, -50%)',
                    fontFamily:
                      field.fontFamily === 'cursive'
                        ? "'Dancing Script', cursive"
                        : field.fontFamily === 'serif'
                        ? 'Georgia, serif'
                        : "'Plus Jakarta Sans', sans-serif",
                    fontSize: `${field.fontSize * 0.75}px`,
                    color: field.color,
                    fontWeight: field.isBold ? 700 : 500,
                    fontStyle: field.isItalic ? 'italic' : 'normal',
                    whiteSpace: 'nowrap',
                    cursor: isDragging && draggingFieldId === field.id ? 'grabbing' : 'grab',
                    zIndex: isSelected ? 30 : 10,
                  }}
                  className={`px-1.5 py-0.5 rounded transition-shadow select-none ${
                    isSelected
                      ? 'ring-2 ring-[#008d91] bg-[#008d91]/15 shadow-sm backdrop-blur-[1px]'
                      : 'hover:ring-1 hover:ring-slate-400/80 hover:bg-white/30'
                  }`}
                  title={`Klik atau geser untuk memposisikan "${field.label}"`}
                >
                  {textContent}
                  {/* Visual Drag Handle when selected */}
                  {isSelected && (
                    <span className="absolute -top-3 -right-3 w-4 h-4 bg-[#008d91] text-white rounded-full flex items-center justify-center text-[9px] shadow-xs">
                      <Move className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              );
            })}

            {/* Instruction Badge at Bottom */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-3 py-1 rounded-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
              💡 Geser teks langsung pada gambar untuk mengatur posisinya
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED CONFIGURATION OF SELECTED / ALL FIELDS */}
        <div className="lg:col-span-6 space-y-4">
          {/* Field Selection Tabs / Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {fields.map((field, idx) => {
              const isSelected = field.id === selectedFieldId;
              return (
                <button
                  key={field.id}
                  type="button"
                  onClick={() => setSelectedFieldId(field.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#008d91] text-white border-[#008d91] shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: field.color }} />
                  <span>{field.label}</span>
                </button>
              );
            })}
          </div>

          {/* ACTIVE FIELD EDITOR CARD */}
          {currentField ? (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#008d91]/10 text-[#008d91] flex items-center justify-center font-bold text-xs">
                    {fields.findIndex((f) => f.id === currentField.id) + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 leading-none">
                      {currentField.label}
                    </h4>
                    <span className="text-[11px] font-mono text-[#008d91] font-semibold">
                      {currentField.tag}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {onInsertTagToTemplate && (
                    <button
                      type="button"
                      onClick={() => onInsertTagToTemplate(currentField.tag)}
                      className="px-2 py-1 text-[11px] rounded-lg bg-[#008d91]/10 hover:bg-[#008d91]/20 text-[#008d91] font-semibold transition-colors cursor-pointer"
                      title="Sisipkan tag ke dalam teks pesan WhatsApp / PM"
                    >
                      Sisipkan ke Pesan
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveField(currentField.id, e)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    title="Hapus field ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Form Input: Label & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Nama / Label Field
                  </label>
                  <input
                    type="text"
                    value={currentField.label}
                    onChange={(e) => handleUpdateField(currentField.id, { label: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#008d91] text-slate-800"
                    placeholder="Contoh: Nama Donatur"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                    Tag Variabel
                  </label>
                  <input
                    type="text"
                    value={currentField.tag}
                    onChange={(e) => handleUpdateField(currentField.id, { tag: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-xl border border-slate-200 focus:outline-none focus:border-[#008d91] text-[#008d91] font-bold"
                    placeholder="[Nama Lengkap]"
                  />
                </div>
              </div>

              {/* Form Input: Nilai Contoh (Sample value for live preview) */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Nilai Contoh (Tampilan Pada Pratinjau Gambar)
                </label>
                <input
                  type="text"
                  value={currentField.value}
                  onChange={(e) => handleUpdateField(currentField.id, { value: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#008d91] text-slate-800"
                  placeholder="Contoh: Enni Megawati / 10 Januari 2025"
                />
              </div>

              {/* Typography Styling Options */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Gaya Tulisan (Typography)</span>
                  <span
                    className="text-xs"
                    style={{
                      fontFamily:
                        currentField.fontFamily === 'cursive'
                          ? "'Dancing Script', cursive"
                          : currentField.fontFamily === 'serif'
                          ? 'Georgia, serif'
                          : 'sans-serif',
                      color: currentField.color,
                      fontWeight: currentField.isBold ? 700 : 500,
                    }}
                  >
                    {currentField.value || 'Contoh Font'}
                  </span>
                </div>

                {/* Font Family Choices */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateField(currentField.id, { fontFamily: 'cursive' })}
                    className={`p-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                      currentField.fontFamily === 'cursive'
                        ? 'border-[#008d91] bg-[#008d91]/10 text-[#008d91] font-bold ring-1 ring-[#008d91]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block font-['Dancing_Script',cursive] text-base leading-none mb-1">
                      Cursive Script
                    </span>
                    <span className="text-[10px] text-slate-400">Seperti Tanda Tangan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateField(currentField.id, { fontFamily: 'sans' })}
                    className={`p-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                      currentField.fontFamily === 'sans'
                        ? 'border-[#008d91] bg-[#008d91]/10 text-[#008d91] font-bold ring-1 ring-[#008d91]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block font-sans text-sm font-bold leading-none mb-1">
                      Sans-Serif
                    </span>
                    <span className="text-[10px] text-slate-400">Modern &amp; Tegak</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateField(currentField.id, { fontFamily: 'serif' })}
                    className={`p-2 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                      currentField.fontFamily === 'serif'
                        ? 'border-[#008d91] bg-[#008d91]/10 text-[#008d91] font-bold ring-1 ring-[#008d91]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block font-serif text-sm font-bold leading-none mb-1">
                      Serif
                    </span>
                    <span className="text-[10px] text-slate-400">Formal &amp; Klasik</span>
                  </button>
                </div>

                {/* Color Palette & Custom Picker */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                    Warna Teks
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {COLOR_PRESETS.map((col) => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => handleUpdateField(currentField.id, { color: col.value })}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                          currentField.color === col.value
                            ? 'border-slate-800 scale-110 shadow-xs'
                            : 'border-white hover:scale-105'
                        }`}
                        style={{ backgroundColor: col.value }}
                        title={col.label}
                      >
                        {currentField.color === col.value && (
                          <Check className="w-3.5 h-3.5 text-white drop-shadow-sm" />
                        )}
                      </button>
                    ))}

                    <div className="flex items-center gap-1.5 ml-2">
                      <input
                        type="color"
                        value={currentField.color}
                        onChange={(e) => handleUpdateField(currentField.id, { color: e.target.value })}
                        className="w-7 h-7 rounded-lg border border-slate-200 cursor-pointer p-0 bg-transparent"
                        title="Pilih warna kustom"
                      />
                      <span className="text-xs font-mono text-slate-600 uppercase">
                        {currentField.color}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Size, Bold, Alignment Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                      <span>Ukuran Font</span>
                      <span className="font-bold text-[#008d91]">{currentField.fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="12"
                      max="60"
                      value={currentField.fontSize}
                      onChange={(e) =>
                        handleUpdateField(currentField.id, { fontSize: Number(e.target.value) })
                      }
                      className="w-full accent-[#008d91] cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                      Format &amp; Rata Teks
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateField(currentField.id, { isBold: !currentField.isBold })
                        }
                        className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition-colors cursor-pointer ${
                          currentField.isBold
                            ? 'bg-[#008d91] text-white border-[#008d91]'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        B
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateField(currentField.id, { isItalic: !currentField.isItalic })
                        }
                        className={`px-2.5 py-1 text-xs rounded-lg font-serif italic border transition-colors cursor-pointer ${
                          currentField.isItalic
                            ? 'bg-[#008d91] text-white border-[#008d91]'
                            : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        I
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateField(currentField.id, { align: 'left' })}
                        className={`px-2 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                          currentField.align === 'left'
                            ? 'bg-[#008d91] text-white border-[#008d91]'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        Kiri
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateField(currentField.id, { align: 'center' })}
                        className={`px-2 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                          currentField.align === 'center'
                            ? 'bg-[#008d91] text-white border-[#008d91]'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        Tengah
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateField(currentField.id, { align: 'right' })}
                        className={`px-2 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                          currentField.align === 'right'
                            ? 'bg-[#008d91] text-white border-[#008d91]'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        Kanan
                      </button>
                    </div>
                  </div>
                </div>

                {/* Coordinate Position Sliders */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                    <span className="flex items-center gap-1">
                      <Move className="w-3 h-3 text-[#008d91]" />
                      <span>Koordinat Posisi Teks:</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      X: {currentField.posX}% | Y: {currentField.posY}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Posisi Horizontal (X)</span>
                      <input
                        type="range"
                        min="2"
                        max="98"
                        step="0.5"
                        value={currentField.posX}
                        onChange={(e) =>
                          handleUpdateField(currentField.id, { posX: Number(e.target.value) })
                        }
                        className="w-full accent-[#008d91] cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">Posisi Vertikal (Y)</span>
                      <input
                        type="range"
                        min="2"
                        max="98"
                        step="0.5"
                        value={currentField.posY}
                        onChange={(e) =>
                          handleUpdateField(currentField.id, { posY: Number(e.target.value) })
                        }
                        className="w-full accent-[#008d91] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400 space-y-2">
              <Layers className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs">Belum ada field custom yang dipilih.</p>
              <button
                type="button"
                onClick={() => handleAddField()}
                className="px-3 py-1.5 rounded-xl bg-[#008d91] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Field Custom Baru</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
