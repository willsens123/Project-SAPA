import React from 'react';
import { X, Calendar, MapPin, Building2, Tag, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ProjectItem } from '../types';

interface ProjectDetailModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onEdit: (project: ProjectItem) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  onEdit,
}) => {
  if (!project) return null;

  return (
    <div
      id="modal-backdrop-detail"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="modal-dialog-detail"
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-[#05828e] uppercase">
              Rincian Proyek SAPA
            </span>
            <h2 className="text-xl font-bold text-slate-800 mt-1">
              {project.namaKegiatan}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-sm text-slate-700">
          {/* Status badge */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
            <span className="text-xs font-semibold text-slate-500">Status Kegiatan</span>
            {project.status === 'Done' ? (
              <span className="inline-flex items-center gap-1.5 bg-[#05828e] text-white text-xs font-medium px-4 py-1.5 rounded-full shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Done
              </span>
            ) : project.status === 'Waiting Acc' ? (
              <span className="inline-flex items-center gap-1.5 bg-[#f04e4e] text-white text-xs font-medium px-4 py-1.5 rounded-full shadow-xs">
                <AlertCircle className="w-3.5 h-3.5" />
                Waiting Acc
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-slate-200 text-slate-700 text-xs font-medium px-4 py-1.5 rounded-full shadow-xs">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {project.status}
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Tanggal Kegiatan</p>
                <p className="font-medium text-slate-800">{project.tanggal}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Date Range Persiapan</p>
                <p className="font-medium text-slate-800">{project.dateRangePersiapan}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Tag className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Jenis Proyek</p>
                <p className="font-medium text-slate-800">{project.jenisProyek}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Divisi Pelaksana</p>
                <p className="font-medium text-slate-800">{project.divisi}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">Lokasi</p>
                <p className="font-medium text-slate-800">{project.lokasi}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={() => {
              onEdit(project);
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium bg-[#05828e] hover:bg-[#046c76] text-white rounded-lg shadow-sm transition-colors"
          >
            Edit Proyek
          </button>
        </div>
      </div>
    </div>
  );
};
