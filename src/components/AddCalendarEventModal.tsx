import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Tag, Check, Bell } from 'lucide-react';

export interface CalendarEventItem {
  id: string;
  userId: string;
  type: 'rapat' | 'reminder';
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  locationOrNote?: string;
  completed?: boolean;
}

interface AddCalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  selectedDate?: string;
  onSaveEvent: (event: CalendarEventItem) => void;
}

export const AddCalendarEventModal: React.FC<AddCalendarEventModalProps> = ({
  isOpen,
  onClose,
  userId,
  selectedDate,
  onSaveEvent,
}) => {
  const [type, setType] = useState<'rapat' | 'reminder'>('rapat');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    if (selectedDate) return selectedDate;
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [time, setTime] = useState('09:00');
  const [locationOrNote, setLocationOrNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    const newEvent: CalendarEventItem = {
      id: `cal-evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      type,
      title: title.trim(),
      date,
      time: time.trim() || undefined,
      locationOrNote: locationOrNote.trim() || undefined,
      completed: false,
    };

    onSaveEvent(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-sm ${
              type === 'rapat' ? 'bg-[#9333ea]' : 'bg-[#f59e0b]'
            }`}>
              {type === 'rapat' ? <Calendar className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Tambah {type === 'rapat' ? 'Tanggal Rapat' : 'Reminder Tanggal Pribadi'}
              </h2>
              <p className="text-xs text-slate-500">Khusus untuk ID Login aktif</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Pilih Kategori</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('rapat')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  type === 'rapat'
                    ? 'bg-purple-50 text-purple-700 border-purple-300 ring-2 ring-purple-400/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Tanggal Rapat
              </button>
              <button
                type="button"
                onClick={() => setType('reminder')}
                className={`py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  type === 'reminder'
                    ? 'bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-400/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                Reminder Pribadi
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Judul {type === 'rapat' ? 'Rapat' : 'Reminder'}
            </label>
            <input
              type="text"
              required
              placeholder={type === 'rapat' ? 'Contoh: Rapat Mingguan Divisi MAD' : 'Contoh: Follow up pengiriman buku'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#008d91]"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tanggal</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#008d91]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Waktu / Jam</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#008d91]"
              />
            </div>
          </div>

          {/* Location or Note */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              {type === 'rapat' ? 'Lokasi / Link Rapat' : 'Catatan Tambahan'}
            </label>
            <input
              type="text"
              placeholder={type === 'rapat' ? 'Contoh: Google Meet / Ruang Rapat Lt. 2' : 'Contoh: Jangan lupa konfirmasi resi via WA'}
              value={locationOrNote}
              onChange={(e) => setLocationOrNote(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#008d91]"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#008d91] text-white rounded-xl hover:bg-[#00787c] shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Simpan Jadwal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
