import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, FileText, DollarSign, Building } from 'lucide-react';
import { MutasiItem } from '../types';
import { BANK_ACCOUNTS } from '../mutasiData';

interface AddEditMutasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: MutasiItem | null;
  defaultBank?: string;
  onSave: (item: MutasiItem) => void;
}

export const AddEditMutasiModal: React.FC<AddEditMutasiModalProps> = ({
  isOpen,
  onClose,
  initialData,
  defaultBank = 'BCA 888',
  onSave,
}) => {
  const [bankAccount, setBankAccount] = useState(defaultBank);
  const [date, setDate] = useState('1/Nov');
  const [keteranganBank, setKeteranganBank] = useState('');
  const [branch, setBranch] = useState('0');
  const [amount, setAmount] = useState<number | ''>('');
  const [type, setType] = useState<'CR' | 'DB'>('CR');
  const [balance, setBalance] = useState<number | ''>('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setBankAccount(initialData.bankAccount || defaultBank);
        setDate(initialData.date || '1/Nov');
        setKeteranganBank(initialData.keteranganBank || '');
        setBranch(String(initialData.branch ?? '0'));
        setAmount(initialData.amount ?? '');
        setType(initialData.type || 'CR');
        setBalance(initialData.balance ?? '');
      } else {
        setBankAccount(defaultBank);
        setDate(
          new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
          })
        );
        setKeteranganBank('');
        setBranch('0');
        setAmount('');
        setType('CR');
        setBalance('');
      }
    }
  }, [isOpen, initialData, defaultBank]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keteranganBank.trim()) {
      alert('Mohon isi Keterangan Bank');
      return;
    }

    const numericAmount = typeof amount === 'number' ? amount : parseFloat(String(amount)) || 0;
    const numericBalance = typeof balance === 'number' ? balance : parseFloat(String(balance)) || 0;

    const item: MutasiItem = {
      id: initialData ? initialData.id : `mutasi-${Date.now()}`,
      bankAccount,
      date: date.trim() || '1/Nov',
      keteranganBank: keteranganBank.trim(),
      branch: branch.trim() || '0',
      amount: numericAmount,
      type,
      balance: numericBalance,
    };

    onSave(item);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00899B]/10 text-[#00899B] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {initialData ? 'Edit Data Mutasi' : 'Tambah Mutasi Bank'}
              </h2>
              <p className="text-xs text-slate-400">
                {initialData ? 'Perbarui informasi transaksi mutasi bank' : 'Catat transaksi rekening mutasi bank baru'}
              </p>
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

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Bank Account */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              Pilih Rekening Bank <span className="text-red-500">*</span>
            </label>
            <select
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00899B]/30 focus:border-[#00899B]"
            >
              {BANK_ACCOUNTS.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Branch */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <span className="relative inline-flex items-center">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="date"
                    aria-label="Pilih Tanggal Mutasi"
                    title="Pilih Tanggal"
                    onClick={(e) => {
                      try {
                        (e.currentTarget as HTMLInputElement).showPicker?.();
                      } catch (_) {}
                    }}
                    onChange={(e) => {
                      if (e.target.value) {
                        const parts = e.target.value.split('-');
                        if (parts.length === 3) {
                          const year = parseInt(parts[0], 10);
                          const month = parseInt(parts[1], 10) - 1;
                          const day = parseInt(parts[2], 10);
                          const d = new Date(year, month, day);
                          const mName = d.toLocaleDateString('id-ID', { month: 'short' });
                          setDate(`${day}/${mName}`);
                        }
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                </span>
                Date (Tanggal) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Contoh: 1/Nov"
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00899B]/30 focus:border-[#00899B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Branch (Cabang)
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00899B]/30 focus:border-[#00899B]"
              />
            </div>
          </div>

          {/* Keterangan Bank */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Keterangan Bank <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={keteranganBank}
              onChange={(e) => setKeteranganBank(e.target.value)}
              placeholder="Contoh: TRSF E-BANKING CR 3010/FTSCY/WS95011 95000.00 Invite Buku DKSM AMRI..."
              required
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00899B]/30 focus:border-[#00899B]"
            />
          </div>

          {/* Type (CB/CR) & Amount */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Tipe (CB/CR)
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'CR' | 'DB')}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00899B]/30 focus:border-[#00899B]"
              >
                <option value="CR">CR (Kredit / Masuk)</option>
                <option value="DB">DB (Debet / Keluar)</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                Amount (Nominal) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="Contoh: 95000"
                required
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00899B]/30 focus:border-[#00899B]"
              />
            </div>
          </div>

          {/* Balance */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Balance (Saldo Akhir)
            </label>
            <input
              type="number"
              step="any"
              value={balance}
              onChange={(e) => setBalance(e.target.value === '' ? '' : parseFloat(e.target.value))}
              placeholder="Contoh: 331641624.28"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00899B]/30 focus:border-[#00899B]"
            />
          </div>

          {/* Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-[#00899B] hover:bg-[#007b8c] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {initialData ? 'Simpan Perubahan' : 'Tambah Mutasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
