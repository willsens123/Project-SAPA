import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  CreditCard,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Building2,
  Calendar,
  Layers,
  Check,
  ChevronRight,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  ModalSalurItem,
  ModalSalurYearGroup,
  ModalSalurConnectedMutasi,
  recalculateModalSalurItem,
} from '../modalSalurData';
import { MutasiItem, MutasiLinkedTransaction } from '../types';
import { BookCover } from './BookCover';

interface ModalTambahkanMutasiModalSalurProps {
  isOpen: boolean;
  onClose: () => void;
  item: ModalSalurItem | null;
  initialYear?: string;
  mutasiItems: MutasiItem[];
  onSave: (updatedItem: ModalSalurItem, updatedMutasiItems: MutasiItem[]) => void;
  onShowToast: (msg: string) => void;
}

export const ModalTambahkanMutasiModalSalur: React.FC<ModalTambahkanMutasiModalSalurProps> = ({
  isOpen,
  onClose,
  item,
  initialYear,
  mutasiItems,
  onSave,
  onShowToast,
}) => {
  if (!isOpen || !item) return null;

  // Selected Year state
  const availableYears = useMemo(() => {
    return item.yearGroups.map((yg) => yg.tahun);
  }, [item]);

  const [selectedYear, setSelectedYear] = useState<string>(() => {
    if (initialYear && availableYears.includes(initialYear)) {
      return initialYear;
    }
    return availableYears.length > 0 ? availableYears[availableYears.length - 1] : '2021';
  });

  // When initialYear changes or modal opens
  useEffect(() => {
    if (initialYear && availableYears.includes(initialYear)) {
      setSelectedYear(initialYear);
    } else if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[availableYears.length - 1]);
    }
  }, [initialYear, availableYears]);

  // Current year group object
  const currentYearGroup = useMemo(() => {
    return item.yearGroups.find((yg) => yg.tahun === selectedYear) || item.yearGroups[0];
  }, [item, selectedYear]);

  // Form states for adding a new year if requested
  const [isAddingNewYear, setIsAddingNewYear] = useState(false);
  const [newYearInput, setNewYearInput] = useState('');

  // Mutasi selection & search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBankFilter, setSelectedBankFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'DB' | 'CR'>('ALL');

  // Chosen mutasi item for connection
  const [chosenMutasi, setChosenMutasi] = useState<MutasiItem | null>(null);
  const [inputKodeMutasi, setInputKodeMutasi] = useState('');
  const [inputNominal, setInputNominal] = useState('');

  // Calculate total allocated on a mutasi
  const calculateAllocated = (mutasi: MutasiItem): number => {
    if (!mutasi.linkedTransactions || mutasi.linkedTransactions.length === 0) return 0;
    return mutasi.linkedTransactions.reduce((acc, lt) => {
      if (lt.dbCr === 'CR') return acc + Math.abs(lt.nominalAkhir);
      if (lt.dbCr === 'DB') return acc - Math.abs(lt.nominalAkhir);
      return acc + lt.nominalAkhir;
    }, 0);
  };

  const getRemainingBalance = (mutasi: MutasiItem): number => {
    const allocated = calculateAllocated(mutasi);
    return Math.max(0, mutasi.amount - allocated);
  };

  // Helper to extract or generate code from mutasi
  const deriveMutasiCode = (m: MutasiItem, yr: string): string => {
    // Try regex for DB.BA... or similar in keterangan
    const match = m.keteranganBank.match(/(DB\.[A-Z0-9.]+)/i);
    if (match) return match[1];

    const bankPart = m.bankAccount.replace(/\s+/g, '');
    const cleanDate = (m.date || '21').replace(/[^\w]/g, '');
    const idSuffix = m.id.replace(/[^\d]/g, '').slice(-4) || '0001';
    return `DB.BA.${bankPart}.01.${yr.slice(-2)}.${idSuffix.padStart(5, '0')}`;
  };

  // Total required for this year group
  const totalRequired = currentYearGroup ? currentYearGroup.yangKitaBayar : 0;

  // Connected mutasi list for current year
  const connectedMutasiList: ModalSalurConnectedMutasi[] = useMemo(() => {
    if (!currentYearGroup) return [];
    if (currentYearGroup.connectedMutasiList && currentYearGroup.connectedMutasiList.length > 0) {
      return currentYearGroup.connectedMutasiList;
    }
    // Fallback if legacy code exists
    if (currentYearGroup.mutasiCode) {
      return [
        {
          id: `legacy-${currentYearGroup.id}`,
          mutasiId: `mutasi-${currentYearGroup.mutasiCode}`,
          mutasiCode: currentYearGroup.mutasiCode,
          bankAccount: 'BCA 388',
          date: `15/Jan/${currentYearGroup.tahun.slice(-2)}`,
          nominal: currentYearGroup.mutasiBadgeColor === 'teal' ? currentYearGroup.yangKitaBayar : currentYearGroup.yangKitaBayar,
          keterangan: `Pembayaran Royalti ${item.title} ${currentYearGroup.tahun}`,
        },
      ];
    }
    return [];
  }, [currentYearGroup, item]);

  const totalPaid = connectedMutasiList.reduce((acc, curr) => acc + curr.nominal, 0);
  const remainingNeeded = Math.max(0, totalRequired - totalPaid);
  const isKurangBayar = totalPaid < totalRequired;

  // Filtered mutasi items from master list
  const filteredMutasiList = useMemo(() => {
    return mutasiItems.filter((m) => {
      if (selectedBankFilter !== 'ALL' && m.bankAccount !== selectedBankFilter) {
        return false;
      }
      if (typeFilter !== 'ALL' && m.type !== typeFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchBank = m.bankAccount.toLowerCase().includes(q);
        const matchKet = m.keteranganBank.toLowerCase().includes(q);
        const matchDate = m.date.toLowerCase().includes(q);
        const matchAmount = m.amount.toString().includes(q);
        return matchBank || matchKet || matchDate || matchAmount;
      }
      return true;
    });
  }, [mutasiItems, selectedBankFilter, typeFilter, searchQuery]);

  // When user selects a mutasi card
  const handleSelectMutasi = (m: MutasiItem) => {
    setChosenMutasi(m);
    const suggestedCode = deriveMutasiCode(m, selectedYear);
    setInputKodeMutasi(suggestedCode);

    // Default nominal: remainingNeeded if > 0, otherwise the mutasi remaining or amount
    const remainingMutasi = getRemainingBalance(m);
    const targetNominal =
      remainingNeeded > 0
        ? Math.min(remainingNeeded, remainingMutasi > 0 ? remainingMutasi : m.amount)
        : remainingMutasi > 0
        ? remainingMutasi
        : m.amount;

    setInputNominal(targetNominal > 0 ? targetNominal.toString() : m.amount.toString());
  };

  // Add connected mutasi
  const handleConnectMutasi = () => {
    if (!chosenMutasi) {
      onShowToast('Pilih salah satu transaksi mutasi terlebih dahulu');
      return;
    }

    const codeToUse = inputKodeMutasi.trim() || deriveMutasiCode(chosenMutasi, selectedYear);
    const nominalNum = parseFloat(inputNominal.replace(/[^\d.]/g, '')) || chosenMutasi.amount;

    if (nominalNum <= 0) {
      onShowToast('Nominal pembayaran mutasi harus lebih dari 0');
      return;
    }

    const newConnection: ModalSalurConnectedMutasi = {
      id: `conn-${Date.now()}`,
      mutasiId: chosenMutasi.id,
      mutasiCode: codeToUse,
      bankAccount: chosenMutasi.bankAccount,
      date: chosenMutasi.date,
      nominal: nominalNum,
      keterangan: chosenMutasi.keteranganBank,
    };

    // Update the item's year groups
    const updatedYearGroups = item.yearGroups.map((yg) => {
      if (yg.tahun !== selectedYear) return yg;

      const existingList = yg.connectedMutasiList && yg.connectedMutasiList.length > 0
        ? yg.connectedMutasiList
        : (yg.mutasiCode ? connectedMutasiList : []);

      const nextList = [...existingList, newConnection];
      const nextCodes = Array.from(new Set(nextList.map((c) => c.mutasiCode)));
      const nextPaid = nextList.reduce((s, c) => s + c.nominal, 0);
      const isStillKurang = nextPaid < yg.yangKitaBayar;
      const diff = yg.yangKitaBayar - nextPaid;

      return {
        ...yg,
        connectedMutasiList: nextList,
        mutasiCodes: nextCodes,
        mutasiCode: nextCodes[0],
        mutasiBadgeColor: (isStillKurang ? 'red' : 'teal') as 'red' | 'teal',
        yangKitaBayarSubtext: isStillKurang && diff > 0 ? `(+${diff.toLocaleString('id-ID')})` : undefined,
      };
    });

    // Update mutasi item linked transactions
    const updatedMutasiItems = mutasiItems.map((m) => {
      if (m.id === chosenMutasi.id) {
        const existingLinks = m.linkedTransactions || [];
        const newLink: MutasiLinkedTransaction = {
          id: `link-modal-${item.id}-${selectedYear}-${Date.now()}`,
          kode: `ROYALTI ${item.title} (${selectedYear})`,
          dbCr: chosenMutasi.type || 'DB',
          nominalAkhir: nominalNum,
          keterangan: `Pembayaran Royalti ${item.title} ${selectedYear}`,
        };
        return {
          ...m,
          linkedTransactions: [...existingLinks, newLink],
        };
      }
      return m;
    });

    const updatedItem = recalculateModalSalurItem({
      ...item,
      yearGroups: updatedYearGroups,
    });

    onSave(updatedItem, updatedMutasiItems);
    onShowToast(`Kode mutasi ${codeToUse} berhasil dihubungkan ke ${item.title} (${selectedYear})`);

    // Reset chosen mutasi form
    setChosenMutasi(null);
    setInputKodeMutasi('');
    setInputNominal('');
  };

  // Remove connected mutasi
  const handleRemoveConnectedMutasi = (connId: string) => {
    const toRemove = connectedMutasiList.find((c) => c.id === connId);
    if (!toRemove) return;

    const updatedYearGroups = item.yearGroups.map((yg) => {
      if (yg.tahun !== selectedYear) return yg;

      const nextList = (yg.connectedMutasiList || connectedMutasiList).filter((c) => c.id !== connId);
      const nextCodes = Array.from(new Set(nextList.map((c) => c.mutasiCode)));
      const nextPaid = nextList.reduce((s, c) => s + c.nominal, 0);
      const isStillKurang = nextPaid < yg.yangKitaBayar;
      const diff = yg.yangKitaBayar - nextPaid;

      return {
        ...yg,
        connectedMutasiList: nextList,
        mutasiCodes: nextCodes,
        mutasiCode: nextCodes[0] || undefined,
        mutasiBadgeColor: (isStillKurang ? 'red' : 'teal') as 'red' | 'teal',
        yangKitaBayarSubtext: isStillKurang && diff > 0 ? `(+${diff.toLocaleString('id-ID')})` : undefined,
      };
    });

    // Remove from mutasi item linked transactions if matched
    const updatedMutasiItems = mutasiItems.map((m) => {
      if (m.id === toRemove.mutasiId) {
        return {
          ...m,
          linkedTransactions: (m.linkedTransactions || []).filter(
            (lt) => !lt.keterangan?.includes(`${item.title} ${selectedYear}`)
          ),
        };
      }
      return m;
    });

    const updatedItem = recalculateModalSalurItem({
      ...item,
      yearGroups: updatedYearGroups,
    });

    onSave(updatedItem, updatedMutasiItems);
    onShowToast(`Koneksi mutasi ${toRemove.mutasiCode} berhasil dihapus`);
  };

  // Add a new Year to the Item
  const handleAddNewYearGroup = () => {
    const yr = newYearInput.trim();
    if (!yr || isNaN(Number(yr)) || yr.length !== 4) {
      onShowToast('Masukkan 4 digit tahun yang valid (contoh: 2022)');
      return;
    }
    if (availableYears.includes(yr)) {
      onShowToast(`Tahun ${yr} sudah ada`);
      setSelectedYear(yr);
      setIsAddingNewYear(false);
      return;
    }

    const newYg: ModalSalurYearGroup = {
      id: `yg-${yr}-${Date.now()}`,
      tahun: yr,
      royalti: item.royalti || '6%',
      jml: 0,
      yangKitaBayar: 0,
      mutasiCode: undefined,
      mutasiCodes: [],
      connectedMutasiList: [],
      mutasiBadgeColor: 'teal',
      variants: [],
    };

    const updatedYgs = [...item.yearGroups, newYg].sort(
      (a, b) => parseInt(a.tahun, 10) - parseInt(b.tahun, 10)
    );

    const updatedItem = recalculateModalSalurItem({
      ...item,
      yearGroups: updatedYgs,
    });

    onSave(updatedItem, mutasiItems);
    setSelectedYear(yr);
    setIsAddingNewYear(false);
    setNewYearInput('');
    onShowToast(`Tahun ${yr} berhasil ditambahkan`);
  };

  const formatRupiah = (num: number) => `Rp${num.toLocaleString('id-ID')}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-linear-to-r from-teal-50/70 to-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#008d91]/15 text-[#008d91] flex items-center justify-center shadow-2xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-base">
                  Tambahkan Kode Mutasi
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 text-[#008d91]">
                  Modal Item S-SALUR
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Koneksikan mutasi bank pembayaran royalti ke katalog Item S-SALUR
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex flex-col gap-5 text-xs text-slate-700">
          {/* Top Info Banner */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-16 rounded-lg overflow-hidden shadow-xs shrink-0 bg-slate-100 flex items-center justify-center border border-slate-200">
                <BookCover coverKey={item.coverKey} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 text-sm">{item.title}</span>
                <span className="text-[11px] text-slate-500 mt-0.5">{item.subtitle}</span>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-600">
                  <span>Stok: <strong>{item.stok}</strong></span>
                  <span>•</span>
                  <span>Royalti: <strong>{item.royalti}</strong></span>
                  <span>•</span>
                  <span>Tahun Aktif: <strong>{item.tahun}</strong></span>
                </div>
              </div>
            </div>

            <div className="bg-teal-50/80 border border-teal-100 rounded-xl px-3.5 py-2 text-right self-end sm:self-auto shrink-0">
              <span className="text-[11px] text-slate-500 block">Total Royalti Semua Tahun:</span>
              <span className="font-bold text-[#008d91] text-sm">
                {formatRupiah(item.yangKitaBayar)}
              </span>
            </div>
          </div>

          {/* SECTION 1: Pilih Tahun Pembayaran Royalti */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#008d91]" />
                <span className="font-bold text-slate-800 text-xs">
                  1. Pilih Tahun Pembayaran Royalti
                </span>
                <span className="text-[11px] text-slate-400 font-normal italic">
                  (Mutasi biasa dibayarkan pertahun)
                </span>
              </div>

              {!isAddingNewYear ? (
                <button
                  type="button"
                  onClick={() => setIsAddingNewYear(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#008d91] hover:text-[#05828e] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Tahun Baru</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 animate-in fade-in">
                  <input
                    type="text"
                    placeholder="2022"
                    maxLength={4}
                    value={newYearInput}
                    onChange={(e) => setNewYearInput(e.target.value)}
                    className="w-20 px-2 py-0.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewYearGroup}
                    className="px-2 py-0.5 bg-[#008d91] text-white rounded-lg text-[11px] font-semibold"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNewYear(false);
                      setNewYearInput('');
                    }}
                    className="px-1.5 py-0.5 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Year Selector Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {availableYears.map((yr) => {
                const isSelected = selectedYear === yr;
                const yg = item.yearGroups.find((g) => g.tahun === yr);
                const isRed = yg?.mutasiBadgeColor === 'red';

                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => {
                      setSelectedYear(yr);
                      setChosenMutasi(null);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#008d91] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    <span>Tahun {yr}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isRed ? 'bg-red-400' : 'bg-emerald-400'
                      }`}
                      title={isRed ? 'Kurang Bayar' : 'Lunas'}
                    />
                  </button>
                );
              })}
            </div>

            {/* Financial Status for Selected Year */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Kewajiban Royalti ({selectedYear}):</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {formatRupiah(totalRequired)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {currentYearGroup?.jml || 0} buku tersebar
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                <span className="text-[11px] text-slate-500 block">Sudah Dibayarkan:</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                  {formatRupiah(totalPaid)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {connectedMutasiList.length} mutasi terhubung
                </span>
              </div>

              <div
                className={`rounded-xl p-2.5 border ${
                  isKurangBayar
                    ? 'bg-red-50/70 border-red-200 text-red-800'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium">Status Pembayaran:</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isKurangBayar
                        ? 'bg-red-100 text-red-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isKurangBayar ? 'Kurang Bayar' : 'Lunas'}
                  </span>
                </div>
                <span className="font-bold text-sm mt-1 block">
                  {isKurangBayar
                    ? `-${formatRupiah(remainingNeeded)}`
                    : 'Rp0 (Terbayar Penuh)'}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 2: Mutasi Yang Sudah Terhubung Pada Tahun Ini */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#008d91]" />
                <span className="font-bold text-slate-800 text-xs">
                  2. Mutasi Terkoneksi (Tahun {selectedYear})
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                  {connectedMutasiList.length} Kode Mutasi
                </span>
              </div>
            </div>

            {connectedMutasiList.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-slate-400">
                Belum ada transaksi mutasi yang dikoneksikan ke royalti tahun {selectedYear}.
                Silakan pilih dari mutasi di bawah.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {connectedMutasiList.map((conn) => (
                  <div
                    key={conn.id}
                    className="p-3 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#008d91]/10 text-[#008d91] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                        DB
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-[#008d91] text-xs">
                            {conn.mutasiCode}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-medium">
                            {conn.bankAccount}
                          </span>
                          <span className="text-[11px] text-slate-400">{conn.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {conn.keterangan || `Pembayaran Royalti ${item.title}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="font-bold text-slate-800 text-xs block">
                          {formatRupiah(conn.nominal)}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-medium">
                          Terkoneksi
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveConnectedMutasi(conn.id)}
                        className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                        title="Hapus / Putus Koneksi Mutasi"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 3: Pilih Mutasi Baru Untuk Dikoneksikan */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3.5">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#008d91]" />
              <span className="font-bold text-slate-800 text-xs">
                3. Pilih Mutasi Bank Untuk Dihubungkan
              </span>
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              {/* Search bar */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kode, bank, tanggal, nominal mutasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91]"
                />
              </div>

              {/* Bank Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar shrink-0">
                {['ALL', 'BCA 388', 'BCA 888', 'Mandiri'].map((bank) => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setSelectedBankFilter(bank)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${
                      selectedBankFilter === bank
                        ? 'bg-[#008d91] text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {bank === 'ALL' ? 'Semua Bank' : bank}
                  </button>
                ))}
              </div>
            </div>

            {/* Mutasi List */}
            <div className="max-h-56 overflow-y-auto custom-scrollbar flex flex-col gap-2 border border-slate-100 rounded-xl p-1.5 bg-slate-50/40">
              {filteredMutasiList.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Tidak ditemukan mutasi yang sesuai pencarian.
                </div>
              ) : (
                filteredMutasiList.map((m) => {
                  const isSelected = chosenMutasi?.id === m.id;
                  const remaining = getRemainingBalance(m);
                  const isDB = m.type === 'DB';

                  return (
                    <div
                      key={m.id}
                      onClick={() => handleSelectMutasi(m)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-[#008d91] bg-teal-50/80 shadow-xs ring-1 ring-[#008d91]'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'border-[#008d91] bg-[#008d91] text-white'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-800 text-xs">
                              {m.bankAccount}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {m.date}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                isDB ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                              }`}
                            >
                              {m.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5">
                            {m.keteranganBank}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-800 text-xs block">
                          {formatRupiah(m.amount)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Sisa: {formatRupiah(remaining)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chosen Mutasi Confirmation & Form Inputs */}
            {chosenMutasi && (
              <div className="bg-teal-50/60 border border-teal-200 rounded-2xl p-4 flex flex-col gap-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#008d91]" />
                    Mutasi Terpilih ({chosenMutasi.bankAccount} - {chosenMutasi.date})
                  </span>
                  <span className="text-xs font-semibold text-[#008d91]">
                    Saldo: {formatRupiah(chosenMutasi.amount)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Kode Mutasi:
                    </label>
                    <input
                      type="text"
                      value={inputKodeMutasi}
                      onChange={(e) => setInputKodeMutasi(e.target.value)}
                      placeholder="Contoh: DB.BA.BCA388.01.21.00015"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-xs text-slate-800 focus:outline-none focus:border-[#008d91]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nominal Pembayaran Royalti (Rp):
                    </label>
                    <input
                      type="number"
                      value={inputNominal}
                      onChange={(e) => setInputNominal(e.target.value)}
                      placeholder="Nominal"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#008d91]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Akan dikoneksikan ke: <strong>{item.title} (Tahun {selectedYear})</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleConnectMutasi}
                    className="px-4 py-2 bg-[#008d91] hover:bg-[#05828e] text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Hubungkan Mutasi Ini</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <span className="text-[11px] text-slate-400">
            Perubahan mutasi dan status lunas / kurang bayar tersimpan secara realtime.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Selesai / Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
