import React, { useState, useEffect } from 'react';
import { X, Truck, Hash } from 'lucide-react';
import { SalurOrder } from '../salurData';

interface ModalInputNoResiProps {
  isOpen: boolean;
  order: SalurOrder | null;
  onClose: () => void;
  onSave: (orderId: string, noResi: string) => void;
}

export const ModalInputNoResi: React.FC<ModalInputNoResiProps> = ({
  isOpen,
  order,
  onClose,
  onSave,
}) => {
  const [noResi, setNoResi] = useState('');

  useEffect(() => {
    if (order) {
      const currentResi = order.ekspedisi?.noResi;
      setNoResi(currentResi && currentResi !== '-' ? currentResi : '');
    } else {
      setNoResi('');
    }
  }, [order, isOpen]);

  if (!isOpen || !order) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = noResi.trim();
    onSave(order.id, trimmed !== '' ? trimmed : '-');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="modal-input-no-resi"
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#008d91] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">Input Nomor Resi</h3>
              <p className="text-xs text-white/80 mt-0.5">
                Pengiriman Ekspedisi {order.ekspedisi?.name || '-'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Order Info Summary Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-slate-600">
              <span>No. Pesanan:</span>
              <span className="font-bold text-[#008d91]">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Penerima:</span>
              <span className="font-semibold text-slate-800">{order.alamat?.recipientName}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Ekspedisi:</span>
              <span className="font-medium text-slate-700">{order.ekspedisi?.name}</span>
            </div>
          </div>

          {/* Input field */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="input-no-resi-field" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-[#008d91]" />
              <span>Nomor Resi Pengiriman</span>
            </label>
            <div className="relative">
              <input
                id="input-no-resi-field"
                type="text"
                value={noResi}
                onChange={(e) => setNoResi(e.target.value)}
                placeholder="Masukkan nomor resi (contoh: 88LP12345678)"
                autoFocus
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:ring-2 focus:ring-[#008d91]/20 font-mono"
              />
              {noResi && (
                <button
                  type="button"
                  onClick={() => setNoResi('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Helper action note */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
              <span className="text-slate-500 italic">Harus diinput manual sesuai resi pengiriman</span>
              <span>Kosongkan untuk status &quot;Belum dikirim&quot;</span>
            </div>
          </div>

          {/* Explanation note */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-amber-800 leading-relaxed">
            💡 <strong>Catatan:</strong> Nomor resi tidak dibuat otomatis dan harus diinput manual. Transaksi tanpa nomor resi akan berstatus <strong>&quot;Belum dikirim&quot;</strong>. Jika nomor resi diisi dan disimpan, status otomatis menjadi <strong>&quot;Sudah Dikirim&quot;</strong>.
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#008d91] hover:bg-[#00757a] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Simpan No Resi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
