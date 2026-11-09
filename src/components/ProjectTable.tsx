import React, { useState, useMemo } from 'react';
import {
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  ListTodo,
  Gift,
  TrendingUp,
  ShoppingBag,
  HeartHandshake,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
} from 'lucide-react';
import { ProjectItem, ColumnVisibility } from '../types';
import { SalurOrder, SalurProduct } from '../salurData';
import { DonasiOrder } from '../donasiData';
import {
  calculateAllProjectsRevenue,
  ProjectRevenueProjection,
} from '../utils/projectRevenueHelper';

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
  salurOrders?: SalurOrder[];
  salurProducts?: SalurProduct[];
  donasiOrders?: DonasiOrder[];
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
  salurOrders = [],
  salurProducts = [],
  donasiOrders = [],
}) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showSummaryCards, setShowSummaryCards] = useState<boolean>(true);
  const [selectedProjection, setSelectedProjection] = useState<ProjectRevenueProjection | null>(null);

  // Close menu on click outside
  React.useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Calculate real-time projected revenue based on historical S-SALUR and D-DONASI data
  const { projections, summary } = useMemo(() => {
    return calculateAllProjectsRevenue(projects, salurOrders, salurProducts, donasiOrders);
  }, [projects, salurOrders, salurProducts, donasiOrders]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Done':
        return (
          <span
            id="badge-status-done"
            className="inline-flex items-center justify-center bg-[#05828e] text-white text-sm font-medium px-6 py-1.5 rounded-full shadow-xs tracking-wide min-w-[90px]"
          >
            Done
          </span>
        );
      case 'Waiting Acc':
        return (
          <span
            id="badge-status-waiting"
            className="inline-flex items-center justify-center bg-[#f04e4e] text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-xs tracking-wide min-w-[90px]"
          >
            Waiting Acc
          </span>
        );
      case 'Ongoing':
      default:
        return (
          <span
            id="badge-status-ongoing"
            className="text-slate-600 text-sm font-normal pl-2"
          >
            {status}
          </span>
        );
    }
  };

  // Count visible columns for colSpan
  const visibleColumnCount =
    (columnVisibility.tanggal ? 1 : 0) +
    (columnVisibility.dateRangePersiapan ? 1 : 0) +
    (columnVisibility.namaKegiatan ? 1 : 0) +
    (columnVisibility.jenisProyek ? 1 : 0) +
    (columnVisibility.divisi ? 1 : 0) +
    (columnVisibility.lokasi ? 1 : 0) +
    (columnVisibility.status ? 1 : 0) +
    (columnVisibility.projectedRevenue !== false ? 1 : 0) +
    1; // menu column

  return (
    <div className="w-full flex flex-col gap-4 pb-8">
      {/* SECTION: Ringkasan Proyeksi Pendapatan Berdasarkan Riwayat S-SALUR & D-DONASI */}
      {columnVisibility.projectedRevenue !== false && (
        <div className="w-full bg-linear-to-br from-teal-50/50 via-white to-slate-50 border border-teal-100/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-teal-100/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#05828e] text-white flex items-center justify-center shadow-xs">
                <TrendingUp className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                  <span>Ringkasan Proyeksi Pendapatan</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#05828e] bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                    S-SALUR + D-DONASI
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dihitung otomatis dari riwayat volume penjualan produk S-SALUR dan mutasi donasi D-DONASI yang tertaut.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSummaryCards(!showSummaryCards)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-[#05828e] px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-teal-300 transition-colors cursor-pointer"
            >
              <span>{showSummaryCards ? 'Sembunyikan Kartu' : 'Tampilkan Kartu'}</span>
              {showSummaryCards ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {showSummaryCards && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4">
              {/* Card 1: Total Proyeksi */}
              <div className="bg-white border border-teal-200/90 rounded-xl p-3.5 sm:p-4 shadow-xs relative overflow-hidden group hover:border-[#05828e] transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Proyeksi
                  </span>
                  <span className="p-1.5 rounded-lg bg-teal-50 text-[#05828e]">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-2 font-bold text-lg sm:text-xl text-[#05828e] tracking-tight">
                  Rp {summary.totalProjectedRevenue.toLocaleString('id-ID')}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span>Dari {summary.totalProjects} proyek kegiatan</span>
                </div>
              </div>

              {/* Card 2: S-SALUR */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs group hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    S-SALUR (Penjualan)
                  </span>
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <ShoppingBag className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-2 font-bold text-lg sm:text-xl text-slate-800 tracking-tight">
                  Rp {summary.totalSalurRevenue.toLocaleString('id-ID')}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="font-semibold text-emerald-600">{summary.salurItemCount} item</span>
                  <span>buku/produk tersalurkan</span>
                </div>
              </div>

              {/* Card 3: D-DONASI */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs group hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    D-DONASI (Pemasukan)
                  </span>
                  <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                    <HeartHandshake className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-2 font-bold text-lg sm:text-xl text-slate-800 tracking-tight">
                  Rp {summary.totalDonasiRevenue.toLocaleString('id-ID')}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="font-semibold text-amber-600">{summary.donasiOrderCount} transaksi</span>
                  <span>donasi donatur & patron</span>
                </div>
              </div>

              {/* Card 4: Rata-rata per Proyek */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs group hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Rata-Rata / Proyek
                  </span>
                  <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                    <Sparkles className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-2 font-bold text-lg sm:text-xl text-slate-800 tracking-tight">
                  Rp {summary.averageProjectedRevenue.toLocaleString('id-ID')}
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span>Estimasi benchmark run-rate divisi</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Table */}
      <div className="w-full overflow-x-auto">
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
              {columnVisibility.projectedRevenue !== false && (
                <th className="py-4 px-4 font-semibold text-slate-700 text-sm sm:text-base whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Proyeksi Pendapatan</span>
                    <span
                      title="Proyeksi gabungan riwayat transaksi S-SALUR dan D-DONASI"
                      className="text-[10px] font-semibold text-[#05828e] bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded cursor-help"
                    >
                      S & D
                    </span>
                  </div>
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
                  colSpan={visibleColumnCount}
                  className="py-12 text-center text-slate-400 text-sm"
                >
                  Tidak ada data proyek yang sesuai.
                </td>
              </tr>
            ) : (
              projects.map((project) => {
                const projData = projections.get(project.id);
                const projectedAmount = projData?.projectedRevenue ?? 0;
                const salurPart = projData?.historicalSalurRevenue ?? 0;
                const donasiPart = projData?.historicalDonasiRevenue ?? 0;

                return (
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

                    {/* Projected Revenue */}
                    {columnVisibility.projectedRevenue !== false && (
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => projData && setSelectedProjection(projData)}
                          title="Klik untuk rincian sumber S-SALUR & D-DONASI"
                          className="text-right group/rev cursor-pointer hover:opacity-90 inline-block focus:outline-hidden"
                        >
                          <div className="font-bold text-slate-800 text-sm sm:text-[15px] group-hover/rev:text-[#05828e] transition-colors">
                            Rp {projectedAmount.toLocaleString('id-ID')}
                          </div>
                          <div className="flex items-center justify-end gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <span className="text-[#05828e] font-medium" title="S-SALUR">
                              S: Rp {salurPart.toLocaleString('id-ID')}
                            </span>
                            <span>•</span>
                            <span className="text-amber-700 font-medium" title="D-DONASI">
                              D: Rp {donasiPart.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </button>
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

                          {projData && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProjection(projData);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <TrendingUp className="w-3.5 h-3.5 text-[#05828e]" />
                              Rincian Proyeksi
                            </button>
                          )}

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
                );
              })
            )}
          </tbody>

          {/* Table Footer: Totals */}
          {projects.length > 0 && columnVisibility.projectedRevenue !== false && (
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50/80 font-semibold text-slate-700">
                <td
                  colSpan={visibleColumnCount - 2}
                  className="py-3 px-4 text-xs sm:text-sm uppercase tracking-wider text-slate-500 font-bold"
                >
                  Total Proyeksi ({projects.length} Proyek Tampil)
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div className="font-bold text-[#05828e] text-sm sm:text-base">
                    Rp {summary.totalProjectedRevenue.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                    S-SALUR: Rp {summary.totalSalurRevenue.toLocaleString('id-ID')} • D-DONASI: Rp {summary.totalDonasiRevenue.toLocaleString('id-ID')}
                  </div>
                </td>
                <td className="py-3 px-2"></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* MODAL: Detail Rincian Sumber Proyeksi Pendapatan */}
      {selectedProjection && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#05828e] text-white flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Rincian Proyeksi Pendapatan
                  </h4>
                  <p className="text-xs text-slate-500 truncate max-w-xs">
                    {selectedProjection.projectName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProjection(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4 text-xs sm:text-sm">
              {/* Highlight Card */}
              <div className="bg-linear-to-r from-teal-50 to-emerald-50/40 border border-teal-100 rounded-xl p-4">
                <div className="text-xs text-slate-500 font-medium">
                  Total Estimasi Proyeksi Pendapatan
                </div>
                <div className="text-2xl font-bold text-[#05828e] mt-1">
                  Rp {selectedProjection.projectedRevenue.toLocaleString('id-ID')}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-white text-slate-700 border border-teal-200">
                    Tingkat Keyakinan: {selectedProjection.confidenceScore}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-white text-slate-700 border border-slate-200">
                    Status: {selectedProjection.status}
                  </span>
                </div>
              </div>

              {/* Breakdown Rows */}
              <div className="space-y-2 border border-slate-100 rounded-xl p-3 bg-slate-50/40">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>Riwayat S-SALUR (Penjualan Buku/Item)</span>
                  </div>
                  <span className="font-semibold text-slate-800">
                    Rp {selectedProjection.historicalSalurRevenue.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 text-slate-700">
                    <HeartHandshake className="w-4 h-4 text-amber-600" />
                    <span>Riwayat D-DONASI (Donasi & Dana Terikat)</span>
                  </div>
                  <span className="font-semibold text-slate-800">
                    Rp {selectedProjection.historicalDonasiRevenue.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Linked Items List */}
              <div>
                <div className="font-semibold text-xs text-slate-600 uppercase tracking-wider mb-1.5">
                  Item & Transaksi Tertaut ({selectedProjection.linkedItemsSummary.length})
                </div>
                {selectedProjection.linkedItemsSummary.length === 0 ? (
                  <div className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                    Tidak ada transaksi riwayat dengan tautan kata kunci langsung. Nilai dihitung menggunakan benchmark historis divisi {selectedProjection.divisi}.
                  </div>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {selectedProjection.linkedItemsSummary.map((itemStr, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-slate-700 flex items-center gap-2 bg-white px-2.5 py-1.5 rounded border border-slate-200/70"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#05828e]" />
                        <span className="truncate">{itemStr}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed bg-amber-50/60 border border-amber-100 rounded-lg p-2.5">
                <span className="font-semibold text-amber-800">Metodologi: </span>
                Untuk proyek berstatus Done, proyeksi mencerminkan realisasi aktual. Untuk proyek Ongoing atau Waiting Acc, proyeksi menerapkan run-rate faktor (1.25x - 1.5x) dari riwayat penjualan dan donasi terhubung.
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedProjection(null)}
                className="bg-[#05828e] hover:bg-[#046c76] text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
