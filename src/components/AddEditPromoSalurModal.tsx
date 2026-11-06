import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Tag } from 'lucide-react';
import { PromoSalurItem } from '../types';
import { formatDatePickerValue } from '../utils/datePickerHelper';
import { DateRangePickerPopover } from './DateRangePickerPopover';

interface AddEditPromoSalurModalProps {
  isOpen: boolean;
  editingItem: PromoSalurItem | null;
  onClose: () => void;
  onSave: (item: PromoSalurItem) => void;
}

export const AddEditPromoSalurModal: React.FC<AddEditPromoSalurModalProps> = ({
  isOpen,
  editingItem,
  onClose,
  onSave,
}) => {
  const [namaPromo, setNamaPromo] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [status, setStatus] = useState<'Ongoing' | 'Coming Soon' | 'Berakhir'>('Ongoing');
  const [tanggalMulai, setTanggalMulai] = useState('12 Nov 2021');
  const [tanggalSelesai, setTanggalSelesai] = useState('21 Nov 2021');
  const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false);
  const [jamMulai, setJamMulai] = useState('00:00 WIB');
  const [jamSelesai, setJamSelesai] = useState('23.59 WIB');
  const [persentaseKuota, setPersentaseKuota] = useState('8/∞');
  const [keterangan, setKeterangan] = useState('-');
  const [channels, setChannels] = useState<string[]>(['whatsapp', 'android', 'amazon', 'web']);
  const [kodePromo, setKodePromo] = useState<string[]>(['amazon', 'eshop']);

  useEffect(() => {
    if (editingItem) {
      setNamaPromo(editingItem.namaPromo || '');
      setSubtitle(editingItem.subtitle || '');
      setStatus(editingItem.status || 'Ongoing');
      setTanggalMulai(editingItem.tanggalMulai || '');
      setTanggalSelesai(editingItem.tanggalSelesai || '');
      setJamMulai(editingItem.jamMulai || '00:00 WIB');
      setJamSelesai(editingItem.jamSelesai || '23.59 WIB');
      setPersentaseKuota(editingItem.persentaseKuota || '-/∞');
      setKeterangan(editingItem.keterangan || '-');
      setChannels(editingItem.channels || ['whatsapp', 'android', 'amazon', 'web']);
      setKodePromo(editingItem.kodePromo || ['amazon', 'eshop']);
    } else {
      setNamaPromo('');
      setSubtitle('');
      setStatus('Ongoing');
      setTanggalMulai('12 Nov 2021');
      setTanggalSelesai('21 Nov 2021');
      setJamMulai('00:00 WIB');
      setJamSelesai('23.59 WIB');
      setPersentaseKuota('8/∞');
      setKeterangan('-');
      setChannels(['whatsapp', 'android', 'amazon', 'web']);
      setKodePromo(['amazon', 'eshop']);
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaPromo.trim()) return;

    const item: PromoSalurItem = {
      id: editingItem ? editingItem.id : `promo-${Date.now()}`,
      namaPromo: namaPromo.trim(),
      subtitle: subtitle.trim() || 'Diskon Spesial',
      status,
      tanggalMulai: tanggalMulai.trim() || '12 Nov 2021',
      tanggalSelesai: tanggalSelesai.trim() || '21 Nov 2021',
      jamMulai: jamMulai.trim() || '00:00 WIB',
      jamSelesai: jamSelesai.trim() || '23.59 WIB',
      persentaseKuota: persentaseKuota.trim() || '8/∞',
      keterangan: keterangan.trim() || '-',
      channels,
      kodePromo,
    };

    onSave(item);
    onClose();
  };

  const toggleChannel = (ch: string) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const toggleKode = (code: string) => {
    setKodePromo((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          type="button"
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#008d91]/10 text-[#008d91] flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {editingItem ? 'Edit Promo S-SALUR' : 'Tambah Promo S-SALUR'}
            </h3>
            <p className="text-xs text-slate-400">
              Kelola informasi dan periode promo S-SALUR
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Promo *
            </label>
            <input
              type="text"
              required
              value={namaPromo}
              onChange={(e) => setNamaPromo(e.target.value)}
              placeholder="Contoh: Promo Event 100th LIOH"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-[#008d91] outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subtitle / Syarat
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Contoh: MI: Rp200.000 atau Cashback 11%"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-[#008d91] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'Ongoing' | 'Coming Soon' | 'Berakhir')
                }
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-[#008d91] outline-none transition-colors bg-white"
              >
                <option value="Ongoing">Ongoing</option>
                <option value="Coming Soon">Coming Soon</option>
                <option value="Berakhir">Berakhir</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 relative">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Mulai
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tanggalMulai}
                  onChange={(e) => setTanggalMulai(e.target.value)}
                  onClick={() => setIsDateRangePickerOpen(true)}
                  placeholder="12 Nov 2021"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-[#008d91] outline-none transition-colors cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setIsDateRangePickerOpen(!isDateRangePickerOpen)}
                  className="w-4 h-4 text-slate-400 hover:text-[#008d91] absolute left-3 top-2.5 cursor-pointer"
                  title="Pilih Rentang Tanggal"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Selesai
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tanggalSelesai}
                  onChange={(e) => setTanggalSelesai(e.target.value)}
                  onClick={() => setIsDateRangePickerOpen(true)}
                  placeholder="21 Nov 2021"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-[#008d91] outline-none transition-colors cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setIsDateRangePickerOpen(!isDateRangePickerOpen)}
                  className="w-4 h-4 text-slate-400 hover:text-[#008d91] absolute left-3 top-2.5 cursor-pointer"
                  title="Pilih Rentang Tanggal"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Date Range Popover */}
            <DateRangePickerPopover
              isOpen={isDateRangePickerOpen}
              onClose={() => setIsDateRangePickerOpen(false)}
              startDate={tanggalMulai}
              endDate={tanggalSelesai}
              onSelectRange={(start, end) => {
                setTanggalMulai(start);
                setTanggalSelesai(end);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jam Berlaku
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={`${jamMulai} - ${jamSelesai}`}
                  onChange={(e) => {
                    const parts = e.target.value.split('-');
                    if (parts[0]) setJamMulai(parts[0].trim());
                    if (parts[1]) setJamSelesai(parts[1].trim());
                  }}
                  placeholder="00:00 WIB - 23.59 WIB"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:border-[#008d91] outline-none transition-colors"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                % / Kuota
              </label>
              <input
                type="text"
                value={persentaseKuota}
                onChange={(e) => setPersentaseKuota(e.target.value)}
                placeholder="Contoh: 8/∞ atau 5/100"
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-[#008d91] outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan
            </label>
            <input
              type="text"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="-"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-xl focus:border-[#008d91] outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Channel Promo
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'whatsapp', label: 'WhatsApp' },
                { id: 'android', label: 'Android' },
                { id: 'amazon', label: 'Amazon' },
                { id: 'web', label: 'E-Shop/Web' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleChannel(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    channels.includes(c.id)
                      ? 'bg-[#008d91]/10 border-[#008d91] text-[#008d91]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kode Promo
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'amazon', label: 'Kode A' },
                { id: 'eshop', label: 'Kode E' },
              ].map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => toggleKode(k.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    kodePromo.includes(k.id)
                      ? 'bg-[#008d91]/10 border-[#008d91] text-[#008d91]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-[#008d91] hover:bg-[#05828e] rounded-xl transition-colors shadow-xs"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
