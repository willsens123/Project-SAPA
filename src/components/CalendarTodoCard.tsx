import React from 'react';
import {
  MoreVertical,
  Check,
  Calendar,
  FileEdit,
  RotateCcw,
  Eye,
} from 'lucide-react';
import { KaryawanItem } from '../types';
import { CalendarItemEntry } from './CalendarTodoList';

interface CalendarTodoCardProps {
  item: CalendarItemEntry;
  dateDisplay: string;
  projectName?: string;
  assignedEmp?: KaryawanItem;
  empAvatarInitial?: string;
  isBeingDragged?: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onClickDetail: () => void;
  openMenuCardId: string | null;
  setOpenMenuCardId: (id: string | null) => void;
  onToggleComplete?: (e: React.MouseEvent) => void;
  onSchedule?: () => void;
  onUnassign?: () => void;
  onOpenFormTodoList?: () => void;
  size?: 'compact' | 'standard'; // 'compact' for calendar cell, 'standard' for sidebar
}

export const CalendarTodoCard: React.FC<CalendarTodoCardProps> = ({
  item,
  dateDisplay,
  projectName,
  assignedEmp,
  empAvatarInitial = 'S',
  isBeingDragged = false,
  onDragStart,
  onDragEnd,
  onClickDetail,
  openMenuCardId,
  setOpenMenuCardId,
  onToggleComplete,
  onSchedule,
  onUnassign,
  onOpenFormTodoList,
  size = 'standard',
}) => {
  const isMenuOpen = openMenuCardId === item.id;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClickDetail}
      className={`bg-white border border-slate-300 shadow-2xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing group hover:border-slate-400 flex flex-col justify-between select-none relative ${
        size === 'standard'
          ? 'rounded-[22px] p-4 sm:p-5 gap-3 min-h-[120px]'
          : 'rounded-[18px] sm:rounded-[20px] p-3 gap-2 min-h-[95px]'
      } ${isBeingDragged ? 'opacity-40 ring-2 ring-[#009688]' : ''}`}
    >
      <div>
        {/* Row 1: Tanggal - Nama Proyek SAPA & Titik Tiga (Opsi Menu) */}
        <div className="flex items-start justify-between gap-1.5">
          <p
            className={`font-normal text-slate-500 tracking-tight truncate flex-1 min-w-0 pt-0.5 ${
              size === 'standard' ? 'text-xs sm:text-[13px]' : 'text-[11px] sm:text-xs'
            }`}
          >
            {dateDisplay} - {projectName || 'Nama Proyek SAPA'}
          </p>

          {/* Titik Tiga (More Options Menu) on the right */}
          <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setOpenMenuCardId(isMenuOpen ? null : item.id)}
              className="w-7 h-7 -mr-1 -mt-0.5 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Opsi Menu Kartu"
              aria-label="Opsi Menu Kartu"
            >
              <MoreVertical className={size === 'standard' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30 cursor-default"
                  onClick={() => setOpenMenuCardId(null)}
                />
                <div
                  className="absolute right-0 top-full mt-1 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs font-medium text-slate-700 animate-in fade-in zoom-in-95 duration-100 divide-y divide-slate-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-1">
                    {onToggleComplete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          setOpenMenuCardId(null);
                          onToggleComplete(e);
                        }}
                        className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-teal-50 hover:text-[#009688] transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.completed ? 'Tandai Belum Selesai' : 'Tandai Selesai'}</span>
                      </button>
                    )}

                    {onSchedule && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuCardId(null);
                          onSchedule();
                        }}
                        className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-teal-50 hover:text-[#009688] transition-colors cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#009688]" />
                        <span>Atur Tanggal / Jadwal</span>
                      </button>
                    )}

                    {onOpenFormTodoList && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuCardId(null);
                          onOpenFormTodoList();
                        }}
                        className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-teal-50 hover:text-[#009688] transition-colors cursor-pointer"
                      >
                        <FileEdit className="w-3.5 h-3.5 text-[#009688]" />
                        <span>Edit Form To-Do List</span>
                      </button>
                    )}

                    {onUnassign && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuCardId(null);
                          onUnassign();
                        }}
                        className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-amber-50 text-amber-800 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                        <span>Kembalikan ke Belum Diatur</span>
                      </button>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenuCardId(null);
                        onClickDetail();
                      }}
                      className="w-full px-3.5 py-2 text-left flex items-center gap-2 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Lihat Detail Kartu</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Row 2: To-Do List Title / Nama Item */}
        <h3
          className={`mt-1 font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-[#009688] transition-colors ${
            size === 'standard' ? 'text-base sm:text-[17px]' : 'text-xs sm:text-[14px]'
          } ${item.completed ? 'line-through text-slate-400' : ''}`}
        >
          {item.title}
        </h3>
      </div>

      {/* Row 3: Circular Avatar S */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          <div
            title={assignedEmp ? `PIC: ${assignedEmp.namaLengkap}` : 'SAPA'}
            className={`rounded-full bg-[#657677] text-white font-medium flex items-center justify-center shrink-0 shadow-2xs select-none ${
              size === 'standard' ? 'w-8 h-8 text-sm' : 'w-7 h-7 text-xs'
            }`}
          >
            {empAvatarInitial || 'S'}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {item.completed && (
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Selesai
            </span>
          )}
          {assignedEmp && (
            <span className="font-mono text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
              {assignedEmp.kodeKaryawan}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
