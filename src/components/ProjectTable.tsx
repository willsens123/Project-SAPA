import React, { useState } from 'react';
import { MoreVertical, Edit2, Trash2, Eye, CheckCircle2, Clock, AlertCircle, BarChart3, ListTodo, Gift } from 'lucide-react';
import { ProjectItem, ColumnVisibility } from '../types';

interface ProjectTableProps {
  projects: ProjectItem[];
  columnVisibility: ColumnVisibility;
  onEditProject: (project: ProjectItem) => void;
  onDeleteProject: (id: string) => void;
  onViewDetail: (project: ProjectItem) => void;
  onUpdateStatus: (id: string, newStatus: string) => void;
  onViewReport?: (project: ProjectItem) => void;
  onOpenTodoList?: (project: ProjectItem) => void;
  onKirimHadiah?: (project: ProjectItem) => void;
}

export const ProjectTable: React.FC<ProjectTableProps> = ({
  projects,
  columnVisibility,
  onEditProject,
  onDeleteProject,
  onViewDetail,
  onUpdateStatus,
  onViewReport,
  onOpenTodoList,
  onKirimHadiah,
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Close menu on click outside
  React.useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Done':
        return (
          <span
            id={`badge-status-done`}
            className="inline-flex items-center justify-center bg-[#05828e] text-white text-sm font-medium px-6 py-1.5 rounded-full shadow-xs tracking-wide min-w-[90px]"
          >
            Done
          </span>
        );
      case 'Waiting Acc':
        return (
          <span
            id={`badge-status-waiting`}
            className="inline-flex items-center justify-center bg-[#f04e4e] text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-xs tracking-wide min-w-[90px]"
          >
            Waiting Acc
          </span>
        );
      case 'Ongoing':
      default:
        return (
          <span
            id={`badge-status-ongoing`}
            className="text-slate-600 text-sm font-normal pl-2"
          >
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full overflow-x-auto pb-8">
      <table className="w-full text-left border-collapse min-w-[950px]">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-slate-200">
            {columnVisibility.tanggal && (
              <th className="py-4 px-4 font-semibold text-slate-700 text-sm sm:text-base whitespace-nowrap">
                Tanggal
              </th>
            )}
            {columnVisibility.dateRangePersiapan && (
              <th className="py-4 px-4 font-semibold text-slate-700 text-sm sm:text-base whitespace-nowrap">
                Date Range Persiapan
              </th>
            )}
            {columnVisibility.namaKegiatan && (
              <th className="py-4 px-4 font-semibold text-slate-700 text-sm sm:text-base whitespace-nowrap">
                Nama Kegiatan
              </th>
            )}
            {columnVisibility.jenisProyek && (
              <th className="py-4 px-4 font-semibold text-slate-700 text-sm sm:text-base whitespace-nowrap">
                Jenis Proyek
              </th>
            )}
            {columnVisibility.divisi && (
              <th className="py-4 px-4 font-semibold text-slate-700 text-sm sm:text-base whitespace-nowrap">
                Divisi
              </th>
            )}
            {columnVisibility.lokasi && (
              <th className="py-4 px-4 font-semibold text-slate-700 text-sm sm:text-base whitespace-nowrap">
                Lokasi
              </th>
            )}
            {columnVisibility.status && (
              <th className="py-4 px-4 font-semibold text-slate-700 text-sm sm:text-base whitespace-nowrap">
                Status
              </th>
            )}
            <th className="py-4 px-2 w-10"></th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100">
          {projects.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="py-12 text-center text-slate-400 text-sm"
              >
                Tidak ada data proyek yang sesuai.
              </td>
            </tr>
          ) : (
            projects.map((project) => (
              <tr
                key={project.id}
                id={`row-project-${project.id}`}
                className="hover:bg-slate-50/60 transition-colors group"
              >
                {/* Tanggal */}
                {columnVisibility.tanggal && (
                  <td className="py-4 px-4 text-slate-700 text-sm sm:text-[15px] whitespace-nowrap">
                    {project.tanggal}
                  </td>
                )}

                {/* Date Range Persiapan */}
                {columnVisibility.dateRangePersiapan && (
                  <td className="py-4 px-4 text-slate-700 text-sm sm:text-[15px] whitespace-nowrap">
                    {project.dateRangePersiapan}
                  </td>
                )}

                {/* Nama Kegiatan */}
                {columnVisibility.namaKegiatan && (
                  <td className="py-4 px-4 text-slate-700 text-sm sm:text-[15px] whitespace-nowrap">
                    {(() => {
                      const s = (project.status || '').toLowerCase().trim();
                      let badgeStyle = 'bg-white text-slate-800 border border-slate-200 shadow-2xs';
                      if (s.includes('waiting') || s === 'waiting acc') {
                        badgeStyle = 'bg-[#05828e] text-white shadow-xs';
                      } else if (s.includes('ongoing')) {
                        badgeStyle = 'bg-[#fbc02d] text-slate-800 shadow-xs';
                      } else if (s.includes('done')) {
                        badgeStyle = 'bg-white text-slate-800 border border-slate-200 shadow-2xs';
                      }

                      return (
                        <span
                          id={`nama-kegiatan-${project.id}`}
                          onClick={() => onViewDetail(project)}
                          title={`Lihat detail: ${project.namaKegiatan}`}
                          className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all hover:opacity-90 ${badgeStyle}`}
                        >
                          {project.namaKegiatan}
                        </span>
                      );
                    })()}
                  </td>
                )}

                {/* Jenis Proyek */}
                {columnVisibility.jenisProyek && (
                  <td className="py-4 px-4 text-slate-700 text-sm sm:text-[15px] whitespace-nowrap">
                    {project.jenisProyek}
                  </td>
                )}

                {/* Divisi */}
                {columnVisibility.divisi && (
                  <td className="py-4 px-4 text-slate-700 text-sm sm:text-[15px] whitespace-nowrap font-normal">
                    {project.divisi}
                  </td>
                )}

                {/* Lokasi */}
                {columnVisibility.lokasi && (
                  <td className="py-4 px-4 text-slate-700 text-sm sm:text-[15px] max-w-xs truncate">
                    {project.lokasi}
                  </td>
                )}

                {/* Status */}
                {columnVisibility.status && (
                  <td className="py-4 px-4 whitespace-nowrap">
                    {renderStatusBadge(project.status)}
                  </td>
                )}

                {/* Action menu */}
                <td className="py-4 px-2 relative text-right whitespace-nowrap">
                  <button
                    id={`btn-row-menu-${project.id}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === project.id ? null : project.id);
                    }}
                    title="Menu Baris"
                    aria-label="Menu Baris"
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuId === project.id && (
                    <div
                      id={`menu-actions-${project.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-2 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs text-left animate-in fade-in zoom-in-95 duration-100"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onViewDetail(project);
                          setActiveMenuId(null);
                        }}
                        className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        Lihat Detail
                      </button>

                      {onViewReport && (
                        <button
                          id={`btn-row-report-${project.id}`}
                          type="button"
                          onClick={() => {
                            onViewReport(project);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-[#05828e]" />
                          Lihat Report
                        </button>
                      )}

                      {onOpenTodoList && (
                        <button
                          id={`btn-row-todo-${project.id}`}
                          type="button"
                          onClick={() => {
                            onOpenTodoList(project);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <ListTodo className="w-3.5 h-3.5 text-[#008d91]" />
                          To-Do List
                        </button>
                      )}

                      {onKirimHadiah && (
                        <button
                          id={`btn-row-kirim-hadiah-${project.id}`}
                          type="button"
                          onClick={() => {
                            onKirimHadiah(project);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                        >
                          <Gift className="w-3.5 h-3.5 text-[#008d91]" />
                          Kirim Hadiah
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onEditProject(project);
                          setActiveMenuId(null);
                        }}
                        className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                        Edit Proyek
                      </button>

                      <div className="border-t border-slate-100 my-1 pt-1">
                        <div className="px-3 py-1 font-semibold text-[10px] text-slate-400 uppercase">
                          Ubah Status
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateStatus(project.id, 'Done');
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#05828e]" />
                          Done
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateStatus(project.id, 'Waiting Acc');
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <AlertCircle className="w-3.5 h-3.5 text-[#f04e4e]" />
                          Waiting Acc
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onUpdateStatus(project.id, 'Ongoing');
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          Ongoing
                        </button>
                      </div>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteProject(project.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
