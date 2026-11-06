import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Image as ImageIcon,
  Calendar,
  ChevronDown,
  Check,
  Search,
} from 'lucide-react';
import { SayPaidRecord, RekeningItem } from '../types';
import { INITIAL_REKENING_ITEMS } from '../rekeningData';

export interface GenericSayPaidOrder {
  id: string;
  orderNumber?: string;
  totalDana?: string;
  sayPaidData?: SayPaidRecord[];
  [key: string]: any;
}

interface ModalSayPaidProps {
  isOpen: boolean;
  onClose: () => void;
  order: GenericSayPaidOrder | any | null;
  rekeningList?: RekeningItem[];
  onSave: (orderId: string, records: SayPaidRecord[]) => void;
}

export const ModalSayPaid: React.FC<ModalSayPaidProps> = ({
  isOpen,
  onClose,
  order,
  rekeningList = [],
  onSave,
}) => {
  const [entries, setEntries] = useState<SayPaidRecord[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Get effective rekening list (fallback to localStorage or initial)
  const getEffectiveRekeningList = (): RekeningItem[] => {
    if (rekeningList && rekeningList.length > 0) return rekeningList;
    try {
      const saved = localStorage.getItem('proyek_sapa_rekening_list_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_REKENING_ITEMS;
  };

  const activeRekeningList = getEffectiveRekeningList();

  // Initialize form entries when modal opens or order changes
  useEffect(() => {
    if (!isOpen) return;

    const currentRekening = getEffectiveRekeningList();

    if (order?.sayPaidData && order.sayPaidData.length > 0) {
      setEntries(JSON.parse(JSON.stringify(order.sayPaidData)));
    } else {
      // Default single entry
      const initialNominal = order?.totalDana
        ? parseFloat(String(order.totalDana).replace(/[^\d]/g, '')) || ''
        : '';

      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      const formattedDate = `${dd}/${mm}/${yyyy}`;

      setEntries([
        {
          id: `sp-${Date.now()}-1`,
          buktiFotoUrls: [],
          rekening: currentRekening.length > 0 ? currentRekening[0].keteranganLengkap || currentRekening[0].nama : '',
          tanggalPembayaran: formattedDate,
          nominal: initialNominal,
        },
      ]);
    }
  }, [isOpen, order, rekeningList]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!isOpen || !order) return null;

  // Format currency helper
  const formatNominalDisplay = (val: number | string) => {
    if (val === '' || val === undefined || val === null) return '';
    const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^\d]/g, ''));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const handleAddEntry = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const formattedDate = `${dd}/${mm}/${yyyy}`;

    const newEntry: SayPaidRecord = {
      id: `sp-${Date.now()}-${entries.length + 1}`,
      buktiFotoUrls: [],
      rekening: activeRekeningList.length > 0 ? activeRekeningList[0].keteranganLengkap || activeRekeningList[0].nama : '',
      tanggalPembayaran: formattedDate,
      nominal: '',
    };
    setEntries((prev) => [...prev, newEntry]);
  };

  const handleRemoveEntry = (id: string) => {
    if (entries.length === 1) {
      // Clear data instead of removing entirely, or allow removing and click + Say Paid to restore
      setEntries([
        {
          id: `sp-${Date.now()}`,
          buktiFotoUrls: [],
          rekening: '',
          tanggalPembayaran: '',
          nominal: '',
        },
      ]);
    } else {
      setEntries((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleUpdateField = (id: string, field: keyof SayPaidRecord, value: any) => {
    setEntries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result as string;
        if (result) {
          setEntries((prev) =>
            prev.map((item) => {
              if (item.id === id) {
                const currentUrls = item.buktiFotoUrls || [];
                return {
                  ...item,
                  buktiFotoUrls: [...currentUrls, result],
                };
              }
              return item;
            })
          );
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset file input value so same file can be re-uploaded if needed
    e.target.value = '';
  };

  const handleRemoveImage = (entryId: string, imgIdx: number) => {
    setEntries((prev) =>
      prev.map((item) => {
        if (item.id === entryId) {
          const currentUrls = item.buktiFotoUrls || [];
          return {
            ...item,
            buktiFotoUrls: currentUrls.filter((_, idx) => idx !== imgIdx),
          };
        }
        return item;
      })
    );
  };

  const handleSave = () => {
    onSave(order.id, entries);
    onClose();
  };

  // Filtered rekening options
  const filteredRekening = activeRekeningList.filter((r) => {
    if (!dropdownSearch.trim()) return true;
    const q = dropdownSearch.toLowerCase();
    return (
      r.nama.toLowerCase().includes(q) ||
      (r.nomorRekening && r.nomorRekening.toLowerCase().includes(q)) ||
      (r.atasNama && r.atasNama.toLowerCase().includes(q)) ||
      (r.keteranganLengkap && r.keteranganLengkap.toLowerCase().includes(q))
    );
  });

  return (
    <div
      id="modal-say-paid-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="modal-say-paid-container"
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl p-6 sm:p-10 relative animate-in zoom-in-95 duration-150 my-auto border border-slate-100"
      >
        {/* Entries list */}
        <div className="flex flex-col gap-6">
          {entries.map((entry) => (
            <div key={entry.id} className="flex flex-col">
              {/* Top Header: red round X button + 'Say Paid' text */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  id={`btn-remove-say-paid-${entry.id}`}
                  onClick={() => handleRemoveEntry(entry.id)}
                  className="w-5 h-5 rounded-full bg-[#ef4444] hover:bg-[#dc2626] text-white flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
                  title="Hapus Say Paid"
                >
                  <X className="w-3 h-3 stroke-[3]" />
                </button>
                <span className="text-[#008d91] font-semibold text-sm">
                  Say Paid
                </span>
              </div>

              {/* Form Container: Two Columns matching exact image */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-stretch">
                {/* Left Card: 4 Labels */}
                <div className="md:col-span-5 bg-[#edf4f8] rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4">
                  <div className="min-h-[42px] flex items-center text-[13.5px] sm:text-[14.5px] text-slate-600 font-normal">
                    Bukti Foto Pembayaran
                  </div>
                  <div className="min-h-[42px] flex items-center text-[13.5px] sm:text-[14.5px] text-slate-600 font-normal">
                    Rekening
                  </div>
                  <div className="min-h-[42px] flex items-center text-[13.5px] sm:text-[14.5px] text-slate-600 font-normal">
                    Tanggal Pembayaran
                  </div>
                  <div className="min-h-[42px] flex items-center text-[13.5px] sm:text-[14.5px] text-slate-600 font-normal">
                    Bukti Pembayaran
                  </div>
                </div>

                {/* Right Card: 4 Controls */}
                <div className="md:col-span-7 bg-[#edf4f8] rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4">
                  {/* 1. Bukti Foto Pembayaran -> Add Image(s) */}
                  <div className="min-h-[42px] flex items-center flex-wrap gap-3">
                    <label className="flex items-center gap-2 text-[#008d91] font-semibold text-sm cursor-pointer hover:opacity-80 transition-opacity">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileUpload(entry.id, e)}
                        className="hidden"
                      />
                      <div className="relative inline-flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-[#008d91]" />
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#008d91] text-white flex items-center justify-center text-[9px] font-bold">
                          +
                        </span>
                      </div>
                      <span>Add Image(s)</span>
                    </label>

                    {/* Previews if uploaded */}
                    {entry.buktiFotoUrls && entry.buktiFotoUrls.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {entry.buktiFotoUrls.map((url, imgIdx) => (
                          <div
                            key={imgIdx}
                            className="relative group w-9 h-9 rounded-lg overflow-hidden border border-slate-200 shadow-2xs"
                          >
                            <img
                              src={url}
                              alt={`Bukti ${imgIdx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(entry.id, imgIdx)}
                              className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Hapus foto"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. Rekening -> Search... with teal circular chevron down */}
                  <div className="relative">
                    <div
                      id={`rekening-select-${entry.id}`}
                      onClick={() => {
                        setOpenDropdownId((prev) => (prev === entry.id ? null : entry.id));
                        setDropdownSearch('');
                      }}
                      className="min-h-[42px] bg-white rounded-xl border border-slate-200/80 px-4 py-2 flex items-center justify-between shadow-2xs cursor-pointer hover:border-slate-300 transition-colors"
                    >
                      <span
                        className={`text-sm truncate mr-2 ${
                          entry.rekening ? 'text-slate-800 font-medium' : 'text-slate-400 font-normal'
                        }`}
                      >
                        {entry.rekening || 'Search...'}
                      </span>
                      <div className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Rekening dropdown panel */}
                    {openDropdownId === entry.id && (
                      <div
                        ref={dropdownRef}
                        className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 max-h-52 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
                      >
                        <div className="p-2 border-b border-slate-100">
                          <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-200">
                            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <input
                              type="text"
                              placeholder="Cari rekening..."
                              value={dropdownSearch}
                              onChange={(e) => setDropdownSearch(e.target.value)}
                              className="w-full text-xs text-slate-700 placeholder-slate-400 bg-transparent focus:outline-none"
                              autoFocus
                            />
                          </div>
                        </div>

                        {filteredRekening.length === 0 ? (
                          <div className="px-3 py-3 text-xs text-slate-400 text-center">
                            Rekening tidak ditemukan
                          </div>
                        ) : (
                          filteredRekening.map((rek) => (
                            <button
                              key={rek.id}
                              type="button"
                              onClick={() => {
                                handleUpdateField(
                                  entry.id,
                                  'rekening',
                                  rek.keteranganLengkap || rek.nama
                                );
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-3.5 py-2 text-xs hover:bg-[#008d91]/5 flex items-center justify-between text-slate-700 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-semibold text-slate-800">{rek.nama}</span>
                                {rek.nomorRekening && (
                                  <span className="text-slate-500 font-mono text-[11px]">
                                    ({rek.nomorRekening})
                                  </span>
                                )}
                              </div>
                              {entry.rekening === (rek.keteranganLengkap || rek.nama) && (
                                <Check className="w-3.5 h-3.5 text-[#008d91] shrink-0" />
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* 3. Tanggal Pembayaran -> Input Date... with teal Calendar icon */}
                  <div className="relative min-h-[42px] bg-white rounded-xl border border-slate-200/80 px-4 py-2 flex items-center justify-between shadow-2xs">
                    <input
                      type="text"
                      placeholder="Input Date..."
                      value={entry.tanggalPembayaran || ''}
                      onChange={(e) =>
                        handleUpdateField(entry.id, 'tanggalPembayaran', e.target.value)
                      }
                      className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                    />
                    <label
                      onClick={(e) => {
                        const inp = e.currentTarget.querySelector('input[type="date"]') as HTMLInputElement;
                        try {
                          inp?.showPicker?.();
                        } catch (_) {}
                      }}
                      className="cursor-pointer text-[#008d91] hover:opacity-80 transition-opacity ml-2 shrink-0"
                    >
                      <Calendar className="w-5 h-5 text-[#008d91]" />
                      <input
                        type="date"
                        onChange={(e) => {
                          if (e.target.value) {
                            const [year, month, day] = e.target.value.split('-');
                            handleUpdateField(
                              entry.id,
                              'tanggalPembayaran',
                              `${day}/${month}/${year}`
                            );
                          }
                        }}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  {/* 4. Bukti Pembayaran -> Rp Input Nominal... */}
                  <div className="min-h-[42px] bg-white rounded-xl border border-slate-200/80 px-4 py-2 flex items-center shadow-2xs">
                    <span className="text-[#008d91] font-bold text-sm mr-2 shrink-0 select-none">
                      Rp
                    </span>
                    <input
                      type="text"
                      placeholder="Input Nominal..."
                      value={formatNominalDisplay(entry.nominal)}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d]/g, '');
                        handleUpdateField(entry.id, 'nominal', raw ? parseInt(raw, 10) : '');
                      }}
                      className="w-full text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Left: '+' Say Paid Button */}
        <button
          type="button"
          id="btn-add-say-paid"
          onClick={handleAddEntry}
          className="flex items-center gap-2 text-[#008d91] font-semibold text-sm cursor-pointer hover:opacity-80 transition-opacity mt-5 select-none"
        >
          <span className="w-5 h-5 rounded-full bg-[#008d91] text-white flex items-center justify-center text-xs font-bold leading-none shadow-2xs">
            +
          </span>
          <span>Say Paid</span>
        </button>

        {/* Bottom Right: Cancel & Save Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-4">
          <button
            type="button"
            id="btn-say-paid-cancel"
            onClick={onClose}
            className="px-8 py-2.5 rounded-full border border-slate-300/90 bg-white text-slate-500 hover:bg-slate-50 text-sm font-medium transition-colors shadow-2xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="btn-say-paid-save"
            onClick={handleSave}
            className="px-8 py-2.5 rounded-full bg-[#008d91] hover:bg-[#007a7e] text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
