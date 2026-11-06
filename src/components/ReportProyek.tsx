import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Eye,
  Users,
  FolderGit2,
  BookOpen,
  Clock,
  Rocket,
  ShoppingCart,
  User,
  MessageSquare,
  Building2,
  Tag,
  Calendar,
} from 'lucide-react';
import { ProjectItem } from '../types';
import { IndonesiaMapSvg } from './IndonesiaMapSvg';
import { BookCover } from './BookCover';

interface ReportProyekProps {
  project?: ProjectItem | null;
  onBack: () => void;
}

interface SectionCollapseProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const SectionCollapse: React.FC<SectionCollapseProps> = ({
  title,
  isOpen,
  onToggle,
  children,
}) => {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 text-[#05828e] hover:text-[#046c76] text-[17px] sm:text-lg font-bold tracking-tight text-left cursor-pointer transition-colors"
      >
        <span
          className={`inline-block transition-transform duration-200 text-xs sm:text-sm ${
            isOpen ? 'rotate-0' : '-rotate-90'
          }`}
        >
          ▼
        </span>
        <span>{title}</span>
      </button>

      {isOpen && (
        <div className="flex flex-col gap-4 animate-in fade-in duration-150">
          {children}
        </div>
      )}
    </div>
  );
};

interface CardToolbarHeaderProps {
  title: React.ReactNode;
  onFilterClick?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

const CardToolbarHeader: React.FC<CardToolbarHeaderProps> = ({
  title,
  onFilterClick,
  onPrev,
  onNext,
}) => {
  return (
    <div className="flex items-center justify-between gap-2 pb-3 mb-1 border-b border-slate-100">
      <div className="text-sm sm:text-[14px] font-semibold text-slate-800">
        {title}
      </div>
      <div className="flex items-center gap-2 text-[#05828e]">
        <button
          type="button"
          onClick={onFilterClick}
          title="Filter"
          aria-label="Filter"
          className="p-1 rounded-md hover:bg-slate-100 text-[#05828e] transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 rotate-90" />
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            title="Sebelumnya"
            aria-label="Sebelumnya"
            className="w-5 h-5 rounded-full bg-[#05828e] text-white flex items-center justify-center hover:bg-[#046c76] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3 h-3 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={onNext}
            title="Berikutnya"
            aria-label="Berikutnya"
            className="w-5 h-5 rounded-full bg-[#05828e] text-white flex items-center justify-center hover:bg-[#046c76] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ReportProyek: React.FC<ReportProyekProps> = ({ project, onBack }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TEAMS' | 'PROJECTS'>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');

  // Collapsible section states matching user's reference image exactly
  const [openSections, setOpenSections] = useState({
    detailPm: true,
    realisasiSalur: true,
    customerAjak: true,
    realisasiDonasi: true,
    demografiCustomer: true,
    rincianPemasukan: true,
    rincianPengeluaran: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Month navigation for PM timeline in Section 1
  const monthsList = ['Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des', 'Jan', 'Feb'];
  const [selectedMonth, setSelectedMonth] = useState('Nov');

  const handlePrevMonth = () => {
    const idx = monthsList.indexOf(selectedMonth);
    if (idx > 0) setSelectedMonth(monthsList[idx - 1]);
    else setSelectedMonth(monthsList[monthsList.length - 1]);
  };

  const handleNextMonth = () => {
    const idx = monthsList.indexOf(selectedMonth);
    if (idx < monthsList.length - 1) setSelectedMonth(monthsList[idx + 1]);
    else setSelectedMonth(monthsList[0]);
  };

  const projectName = project?.namaKegiatan || 'Event 100th LIOH';
  const projectDivisi = project?.divisi || 'EVE';
  const projectFirstLetter = projectName.trim().charAt(0).toUpperCase() || 'E';

  return (
    <div className="w-full flex flex-col gap-6 pb-16 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Banner Card */}
      <div className="w-full rounded-3xl overflow-hidden shadow-xs relative bg-gradient-to-r from-[#00b4b8] via-[#01b5a2] to-[#04c4b5]">
        {/* Subtle wavy decorative vector lines */}
        <div className="absolute inset-0 opacity-25 pointer-events-none overflow-hidden">
          <svg
            className="w-full h-full object-cover"
            viewBox="0 0 1200 240"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M-50 160 C 200 40, 450 240, 750 110 C 1000 0, 1150 180, 1300 90"
              stroke="#ffffff"
              strokeWidth="24"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M-30 200 C 250 80, 500 280, 800 150 C 1050 40, 1200 220, 1350 130"
              stroke="#ffffff"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Banner Inner Content */}
        <div className="relative z-10 p-6 sm:p-8 flex flex-col justify-between min-h-[190px] sm:min-h-[220px]">
          {/* Top Row: Back button & Search Box */}
          <div className="flex items-center justify-between gap-4 w-full">
            <button
              id="btn-back-to-table"
              type="button"
              onClick={onBack}
              title="Kembali ke Tabel Proyek"
              aria-label="Kembali ke Tabel Proyek"
              className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 shadow-sm flex items-center justify-center transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="relative max-w-xs sm:max-w-sm w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search here..."
                className="w-full pl-9 pr-4 py-2 bg-white rounded-full text-xs sm:text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/80 shadow-xs transition-all"
              />
            </div>
          </div>

          {/* Bottom Row: Project Details & Navigation Tabs */}
          <div className="flex flex-wrap items-end justify-between gap-4 mt-8">
            {/* Left: Project Avatar & Name */}
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#00d084] shadow-md flex items-center justify-center text-white text-2xl font-bold">
                {projectFirstLetter}
              </div>
              <div className="text-white">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight drop-shadow-xs">
                  {projectName}
                </h2>
                <div className="text-xs text-white/80 font-medium">
                  {projectDivisi}/KIV
                </div>
              </div>
            </div>

            {/* Right: Pill Navigation Tabs */}
            <div className="flex items-center gap-2 bg-white/20 p-1 rounded-full backdrop-blur-xs">
              <button
                type="button"
                onClick={() => setActiveTab('OVERVIEW')}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'OVERVIEW'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                OVERVIEW
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('TEAMS')}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'TEAMS'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                TEAMS
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('PROJECTS')}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'PROJECTS'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                PROJECTS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1: Posisi Keuangan */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-4">
              Posisi Keuangan
            </h3>
            <div className="flex flex-col gap-2.5 text-xs sm:text-[13px]">
              <div className="flex items-center justify-between text-slate-600">
                <span>Pemasukan</span>
                <span className="font-medium text-slate-800">Rp10.000.000</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Pengeluaran (Item)</span>
                <span className="font-medium text-slate-800">Rp7.000.000</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Pengeluaran</span>
                <span className="font-medium text-slate-800">Rp2.000.000</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-bold text-slate-900 text-sm">
                <span>Saldo Akhir</span>
                <span>Rp1.000.000</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 mt-4 leading-normal">
            *Saldo Akhir disalurkan ke dalam Pos Pemasukan YPPLN.
            <br />
            (20% Penerbitan, 20% Kegiatan, 30% Operasional Dharma, 30% Operasional Non-Dharma)
          </p>
        </div>

        {/* Card 2: Realisasi Lainnya */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">
            Realisasi Lainnya
          </h3>
          <div className="flex flex-col gap-2.5 text-xs sm:text-[13px]">
            <div className="flex items-center justify-between text-slate-600">
              <span>Customer</span>
              <div>
                <span className="font-medium text-slate-800">100 orang</span>
                <span className="text-[#05828e] ml-1.5 font-medium">(+50 orang)</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Donatur</span>
              <div>
                <span className="font-medium text-slate-800">100 orang</span>
                <span className="text-[#05828e] ml-1.5 font-medium">(+50 orang)</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Item</span>
              <span className="font-medium text-slate-800">100 buah</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Promo Terpakai</span>
              <span className="font-medium text-slate-800">20x</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Orang dihubungi</span>
              <span className="font-medium text-slate-800">200 orang</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>% Rate</span>
              <span className="font-medium text-slate-800">20%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Informasi Kegiatan */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">
            Informasi Kegiatan
          </h3>
          <div className="flex flex-col gap-2.5 text-xs sm:text-[13px]">
            <div className="flex items-center justify-between text-slate-600">
              <span>Divisi</span>
              <span className="font-medium text-slate-800">{project?.divisi || 'EVE'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Tanggal</span>
              <span className="font-medium text-slate-800">
                {project?.tanggal || '11 Nov 2021 - 12 Nov 2021'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Date Range Persiapan</span>
              <span className="font-medium text-slate-800">
                {project?.dateRangePersiapan || '5 Nov 2021 - 13 Nov 2021'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Detail Lokasi</span>
              <span className="font-medium text-slate-800">{project?.lokasi || 'Online'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Keterangan</span>
              <span className="font-medium text-slate-800">{project?.keterangan || '-'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Link Foto</span>
              <span className="font-medium text-slate-700">drive.google.com/foto</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Link Laporan</span>
              <span className="font-medium text-slate-700">drive.google.com/lapor</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Acc by</span>
              <span className="font-medium text-slate-800">Agustino - 15 Nov 2021</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 1: Detail PM & Rincian Proyek SAPA (Matching Uploaded Image)
         ========================================================================= */}
      <SectionCollapse
        title="Detail PM & Rincian Proyek SAPA"
        isOpen={openSections.detailPm}
        onToggle={() => toggleSection('detailPm')}
      >
        <div className="flex flex-col gap-4">
          {/* Card 1: PM Timeline with Month Selector & Milestones */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-xs">
            <CardToolbarHeader
              title={<span className="font-semibold text-slate-800 text-sm sm:text-base">PM</span>}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
            />

            {/* Horizontal Month Pills */}
            <div className="mt-4 flex items-center justify-between gap-1 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-5 h-5 rounded-full bg-teal-50 hover:bg-teal-100 text-[#05828e] flex items-center justify-center text-xs font-bold shrink-0 transition-colors cursor-pointer"
                title="Bulan sebelumnya"
              >
                ‹
              </button>
              <div className="flex items-center gap-1.5 sm:gap-2 justify-center flex-wrap">
                {monthsList.map((m) => {
                  const isSelected = m === selectedMonth;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMonth(m)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#008d91] text-white shadow-2xs scale-105'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-5 h-5 rounded-full bg-teal-50 hover:bg-teal-100 text-[#05828e] flex items-center justify-center text-xs font-bold shrink-0 transition-colors cursor-pointer"
                title="Bulan berikutnya"
              >
                ›
              </button>
            </div>

            {/* Milestone Connecting Timeline */}
            <div className="mt-8 px-4 sm:px-10 py-4">
              <div className="relative flex items-center justify-between">
                {/* Connecting Teal Line */}
                <div className="absolute left-8 right-8 top-5 h-1 bg-[#008d91] rounded-full z-0" />

                {/* Node 1: WhatsApp / Message Icon */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#008d91] text-white flex items-center justify-center shadow-md border-2 border-white">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                  </div>
                  <div className="text-center mt-2.5">
                    <div className="text-xs font-bold text-slate-800">Judul</div>
                    <div className="text-[10px] text-slate-400">Judul Kecil</div>
                  </div>
                </div>

                {/* Duration Badge 1: 2 Bulan */}
                <div className="relative z-10 -mt-7 bg-white border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 shadow-2xs">
                  <Clock className="w-3 h-3 text-[#008d91]" />
                  <span>2 Bulan</span>
                </div>

                {/* Node 2: Rocket Icon */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#008d91] text-white flex items-center justify-center shadow-md border-2 border-white">
                    <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-center mt-2.5">
                    <div className="text-xs font-bold text-slate-800">Judul</div>
                    <div className="text-[10px] text-slate-400">Judul Kecil</div>
                  </div>
                </div>

                {/* Duration Badge 2: 3 Bulan */}
                <div className="relative z-10 -mt-7 bg-white border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 shadow-2xs">
                  <Clock className="w-3 h-3 text-[#008d91]" />
                  <span>3 Bulan</span>
                </div>

                {/* Node 3: Shopping Cart Icon */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#008d91] text-white flex items-center justify-center shadow-md border-2 border-white">
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-center mt-2.5">
                    <div className="text-xs font-bold text-slate-800">Judul</div>
                    <div className="text-[10px] text-slate-400">Judul Kecil</div>
                  </div>
                </div>

                {/* Duration Badge 3: 2 Bulan */}
                <div className="relative z-10 -mt-7 bg-white border border-slate-200 text-slate-600 px-2.5 py-0.5 rounded-full text-[11px] font-medium flex items-center gap-1 shadow-2xs">
                  <Clock className="w-3 h-3 text-[#008d91]" />
                  <span>2 Bulan</span>
                </div>

                {/* Node 4: User / Person Icon */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#008d91] text-white flex items-center justify-center shadow-md border-2 border-white">
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-center mt-2.5">
                    <div className="text-xs font-bold text-slate-800">Judul</div>
                    <div className="text-[10px] text-slate-400">Judul Kecil</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Template - PM (4 buah) */}
          <div className="max-w-md bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <CardToolbarHeader
              title={
                <span>
                  Template - PM{' '}
                  <span className="text-[#008d91] font-semibold">(4 buah)</span>
                </span>
              }
            />
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-medium border-b border-slate-100 text-[11px]">
                    <th className="py-2.5 px-2">Tanggal</th>
                    <th className="py-2.5 px-2">Nama Item</th>
                    <th className="py-2.5 px-2 text-center">% Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-2 text-slate-600 whitespace-nowrap">15 Okt 2021</td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#e83e8c] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          T
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Template A</div>
                          <div className="text-[10px] text-slate-400">Template</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-medium text-slate-700">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2 text-slate-600 whitespace-nowrap">16 Okt 2021</td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#e83e8c] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          T
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Template B</div>
                          <div className="text-[10px] text-slate-400">Template</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-medium text-slate-700">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2 text-slate-600 whitespace-nowrap">15 Nov 2021</td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#e83e8c] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          T
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Template C</div>
                          <div className="text-[10px] text-slate-400">Template</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-400">-</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2 text-slate-600 whitespace-nowrap">15 Nov 2021</td>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#e83e8c] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          T
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px]">Template D</div>
                          <div className="text-[10px] text-slate-400">Template</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-400">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SectionCollapse>

      {/* =========================================================================
          SECTION 2: Detail Realisasi S - SALUR (3 Cards in 1 Row)
         ========================================================================= */}
      <SectionCollapse
        title="Detail Realisasi S - SALUR"
        isOpen={openSections.realisasiSalur}
        onToggle={() => toggleSection('realisasiSalur')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Traksaksi - Item (100 buah - RpXXXXXXX) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <CardToolbarHeader
              title={
                <span>
                  Traksaksi - Item{' '}
                  <span className="text-[#008d91] font-semibold">(100 buah - RpXXXXXXX)</span>
                </span>
              }
            />
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-medium border-b border-slate-100 text-[11px]">
                    <th className="py-2.5 px-2">Nama Item</th>
                    <th className="py-2.5 px-2 text-center">Tersalur</th>
                    <th className="py-2.5 px-2 text-right">Tersalur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <BookCover coverKey="jalan-menuju" size="sm" className="!w-9 !h-11 shrink-0 rounded" />
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            Jalan Menuju Kemahatahuan
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Rp125.000 <span className="mx-1">•</span> Stok 100
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-medium whitespace-nowrap">1 buah</td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">RpXXXX</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <BookCover coverKey="demi-kepentingan" size="sm" className="!w-9 !h-11 shrink-0 rounded" />
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            Demi Kepentingan Semua Makhluk
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Rp89.000 <span className="mx-1">•</span> Stok 100
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-medium whitespace-nowrap">2 buah</td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">RpXXXXX</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <BookCover coverKey="menjadi-buddha" size="sm" className="!w-9 !h-11 shrink-0 rounded" />
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            Menjadi Buddha di Tempat Kerja
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Rp125.000 <span className="mx-1">•</span> Stok 100
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-medium whitespace-nowrap">1 buah</td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">RpXXXX</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 2: Traksaksi - Promo (20 buah) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <CardToolbarHeader
              title={
                <span>
                  Traksaksi - Promo{' '}
                  <span className="text-[#008d91] font-semibold">(20 buah)</span>
                </span>
              }
            />
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-medium border-b border-slate-100 text-[11px]">
                    <th className="py-2.5 px-2">Nama Item</th>
                    <th className="py-2.5 px-2 text-right">Tersalur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#334155] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          P
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            Promo Event 100th LIOH
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-slate-400">Mf: Rp200.000</span>
                            <span className="px-1.5 py-0.2 bg-teal-50 text-[#008d91] rounded text-[9px] font-semibold">
                              Ongoing
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">2x</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Hadiah - Item (100 buah) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <CardToolbarHeader
              title={
                <span>
                  Hadiah - Item{' '}
                  <span className="text-[#008d91] font-semibold">(100 buah)</span>
                </span>
              }
            />
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-medium border-b border-slate-100 text-[11px]">
                    <th className="py-2.5 px-2">Nama Item</th>
                    <th className="py-2.5 px-2 text-right">Tersalur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <BookCover coverKey="jalan-menuju" size="sm" className="!w-9 !h-11 shrink-0 rounded" />
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            Jalan Menuju Kemahatahuan
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Rp125.000 <span className="mx-1">•</span> Stok 100
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">1 buah</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <BookCover coverKey="demi-kepentingan" size="sm" className="!w-9 !h-11 shrink-0 rounded" />
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            Demi Kepentingan Semua Makhluk
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Rp89.000 <span className="mx-1">•</span> Stok 100
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">2 buah</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <BookCover coverKey="menjadi-buddha" size="sm" className="!w-9 !h-11 shrink-0 rounded" />
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            Menjadi Buddha di Tempat Kerja
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Rp125.000 <span className="mx-1">•</span> Stok 100
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">1 buah</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SectionCollapse>

      {/* =========================================================================
          SECTION 3: Detail Realisasi Customer - Ajak (3 Cards in 1 Row)
         ========================================================================= */}
      <SectionCollapse
        title="Detail Realisasi Customer - Ajak"
        isOpen={openSections.customerAjak}
        onToggle={() => toggleSection('customerAjak')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Traksaksi - Item (100 buah - RpXXXXXXX) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <CardToolbarHeader
              title={
                <span>
                  Traksaksi - Item{' '}
                  <span className="text-[#008d91] font-semibold">(100 buah - RpXXXXXXX)</span>
                </span>
              }
            />
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-medium border-b border-slate-100 text-[11px]">
                    <th className="py-2.5 px-2">Nama Item</th>
                    <th className="py-2.5 px-2 text-center">Tersalur</th>
                    <th className="py-2.5 px-2 text-right">Tersalur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#64748b] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          S
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            South East Asia Lamrim Festival 2021
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Rp125.000 <span className="mx-1">•</span> Stok 100
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-medium whitespace-nowrap">1 buah</td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">RpXXXXXXXXX</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#64748b] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          S
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            South East Asia Lamrim Festival 2021
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Rp125.000 <span className="mx-1">•</span> Stok 100
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-medium whitespace-nowrap">1 buah</td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">RpXXXXXXXXX</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 2: Kerja Sama Ajar (100 buah) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <CardToolbarHeader
              title={
                <span>
                  Kerja Sama Ajar{' '}
                  <span className="text-[#008d91] font-semibold">(100 buah)</span>
                </span>
              }
            />
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-medium border-b border-slate-100 text-[11px]">
                    <th className="py-2.5 px-2">Nama Item</th>
                    <th className="py-2.5 px-2 text-right">Tersalur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#64748b] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          S
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            South East Asia Lamrim Festival 2021
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Rp125.000 <span className="mx-1">•</span> Stok 100
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">1 buah</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#64748b] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          S
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            South East Asia Lamrim Festival 2021
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Rp125.000 <span className="mx-1">•</span> Stok 100
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">1 buah</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Media Partner (100 buah) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <CardToolbarHeader
              title={
                <span>
                  Media Partner{' '}
                  <span className="text-[#008d91] font-semibold">(100 buah)</span>
                </span>
              }
            />
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-medium border-b border-slate-100 text-[11px]">
                    <th className="py-2.5 px-2">Nama Item</th>
                    <th className="py-2.5 px-2 text-right">Tersalur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#64748b] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          S
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            South East Asia Lamrim Festival 2021
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Rp125.000 <span className="mx-1">•</span> Stok 100
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">1 buah</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#64748b] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          S
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            South East Asia Lamrim Festival 2021
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Rp125.000 <span className="mx-1">•</span> Stok 100
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">1 buah</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SectionCollapse>

      {/* =========================================================================
          SECTION 4: Detail Realisasi D - DONASI (3 Cards in 1 Row)
         ========================================================================= */}
      <SectionCollapse
        title="Detail Realisasi D - DONASI"
        isOpen={openSections.realisasiDonasi}
        onToggle={() => toggleSection('realisasiDonasi')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Traksaksi - Item (100 buah - RpXXXXXXX) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <CardToolbarHeader
              title={
                <span>
                  Traksaksi - Item{' '}
                  <span className="text-[#008d91] font-semibold">(100 buah - RpXXXXXXX)</span>
                </span>
              }
            />
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-medium border-b border-slate-100 text-[11px]">
                    <th className="py-2.5 px-2">Nama Item</th>
                    <th className="py-2.5 px-2 text-center">Tersalur</th>
                    <th className="py-2.5 px-2 text-right">Tersalur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#f59e0b] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          D
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            Donasi Patron Rutin
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            (Sesuai Komitmen)
                          </div>
                          <div className="text-[9px] text-[#008d91] font-semibold">
                            Dharma Patron
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-medium whitespace-nowrap">1 buah</td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">RpXXXXXXX</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#f59e0b] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          D
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            Donasi Buku Berbayar
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Donasi Buku Berbayar - MAD
                          </div>
                          <div className="mt-0.5">
                            <span className="px-1.5 py-0.2 bg-teal-50 text-[#008d91] rounded text-[9px] font-semibold">
                              Ongoing
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-medium whitespace-nowrap">2 buah</td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">RpXXXXXXX</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#10b981] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          E
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            Empat Segel Agung
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Dharma Patron Non-Rutin - PLN
                          </div>
                          <div className="mt-0.5">
                            <span className="px-1.5 py-0.2 bg-teal-50 text-[#008d91] rounded text-[9px] font-semibold">
                              Ongoing
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-medium whitespace-nowrap">1 buah</td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">RpXXXXXXX</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 2: Kerja Sama Donasi (100 buah - RpXXXXXXXXX) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <CardToolbarHeader
              title={
                <span>
                  Kerja Sama Donasi{' '}
                  <span className="text-[#008d91] font-semibold">(100 buah - RpXXXXXXXXX)</span>
                </span>
              }
            />
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-medium border-b border-slate-100 text-[11px]">
                    <th className="py-2.5 px-2">Nama Item</th>
                    <th className="py-2.5 px-2 text-center">Hasil</th>
                    <th className="py-2.5 px-2 text-right">Hasil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#8b5cf6] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          M
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            Magha Puja 2021
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Magha Puja Dana - MAD
                          </div>
                          <div className="mt-0.5">
                            <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 rounded text-[9px] font-semibold">
                              Rutin
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-medium whitespace-nowrap">200 buah</td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">RpXXXXXXX</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 3: Sponsor (RpXXXXXXXX) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <CardToolbarHeader
              title={
                <span>
                  Sponsor{' '}
                  <span className="text-[#008d91] font-semibold">(RpXXXXXXXX)</span>
                </span>
              }
            />
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-medium border-b border-slate-100 text-[11px]">
                    <th className="py-2.5 px-2">Nama Item</th>
                    <th className="py-2.5 px-2 text-center">Tersalur</th>
                    <th className="py-2.5 px-2 text-right">Tersalur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#f59e0b] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          D
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            Donasi Patron Rutin
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            (Sesuai Komitmen)
                          </div>
                          <div className="text-[9px] text-[#008d91] font-semibold">
                            Dharma Patron
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-medium whitespace-nowrap">1 buah</td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">RpXXXXXXX</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#f59e0b] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          D
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            Donasi Buku Berbayar
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Donasi Buku Berbayar - MAD
                          </div>
                          <div className="mt-0.5">
                            <span className="px-1.5 py-0.2 bg-teal-50 text-[#008d91] rounded text-[9px] font-semibold">
                              Ongoing
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-medium whitespace-nowrap">2 buah</td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">RpXXXXXXX</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#10b981] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          E
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-[11px] leading-tight">
                            Empat Segel Agung
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Dharma Patron Non-Rutin - PLN
                          </div>
                          <div className="mt-0.5">
                            <span className="px-1.5 py-0.2 bg-teal-50 text-[#008d91] rounded text-[9px] font-semibold">
                              Ongoing
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-medium whitespace-nowrap">1 buah</td>
                    <td className="py-2.5 px-2 text-right font-medium text-slate-800 whitespace-nowrap">RpXXXXXXX</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SectionCollapse>

      {/* =========================================================================
          SECTION 5: Demografi Customer & Sebaran Lokasi
         ========================================================================= */}
      <SectionCollapse
        title="Demografi Customer & Sebaran Lokasi"
        isOpen={openSections.demografiCustomer}
        onToggle={() => toggleSection('demografiCustomer')}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Customer Table */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <CardToolbarHeader
              title={
                <span>
                  Customer - Ajak{' '}
                  <span className="text-[#05828e] font-semibold">(150 orang)</span>
                </span>
              }
            />
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-medium border-b border-slate-50 text-[11px]">
                    <th className="py-2.5 px-2">Nama Customer</th>
                    <th className="py-2.5 px-2">Variable Item</th>
                    <th className="py-2.5 px-2">Terverifikasi</th>
                    <th className="py-2.5 px-2">New Customer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#05828e] text-white flex items-center justify-center font-bold text-xs">
                          A
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-[11px]">
                            00031 Agustino Ong
                          </div>
                          <div className="text-[10px] text-slate-400">Ko Agus</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2">Ikut Acara B</td>
                    <td className="py-2.5 px-2">Yes</td>
                    <td className="py-2.5 px-2">No</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#f5b041] text-white flex items-center justify-center font-bold text-xs">
                          C
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-[11px]">
                            00019 Cindy Budiman
                          </div>
                          <div className="text-[10px] text-slate-400">Ci Pao</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2">Ikut Acara A</td>
                    <td className="py-2.5 px-2">No</td>
                    <td className="py-2.5 px-2">Yes</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#64748b] text-white flex items-center justify-center font-bold text-xs">
                          S
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-[11px]">
                            00018 Silvia Fukada
                          </div>
                          <div className="text-[10px] text-slate-400">Ci Silvia</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2">Ikut Acara B</td>
                    <td className="py-2.5 px-2">Yes</td>
                    <td className="py-2.5 px-2">Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Range Usia */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <CardToolbarHeader title="Range Usia" />
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-medium border-b border-slate-50 text-[11px]">
                    <th className="py-2.5 px-2">Usia</th>
                    <th className="py-2.5 px-2">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-2">&lt; 20 tahun</td>
                    <td className="py-2.5 px-2">50 orang</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2">21 - 30 tahun</td>
                    <td className="py-2.5 px-2">50 orang</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2">31 - 40 tahun</td>
                    <td className="py-2.5 px-2">50 orang</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pekerjaan */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
            <CardToolbarHeader title="Pekerjaan" />
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 font-medium border-b border-slate-50 text-[11px]">
                    <th className="py-2.5 px-2">Pekerjaan</th>
                    <th className="py-2.5 px-2">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-2">Karyawan Swasta</td>
                    <td className="py-2.5 px-2">50 orang</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2">Dokter</td>
                    <td className="py-2.5 px-2">50 orang</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-2">Ibu Rumah Tangga</td>
                    <td className="py-2.5 px-2">50 orang</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Indonesia Map */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-xs mt-2">
          <CardToolbarHeader title="Chart - Customer" />
          <div className="mt-3">
            <div className="text-sm font-semibold text-slate-700 mb-2">
              <span className="text-[#05828e] font-bold">60 Kota, 30 Provinsi</span> in 2021
            </div>
            <IndonesiaMapSvg className="mt-2" />
          </div>
        </div>
      </SectionCollapse>

      {/* =========================================================================
          SECTION 6: Rincian Pemasukan
         ========================================================================= */}
      <SectionCollapse
        title="Rincian Pemasukan"
        isOpen={openSections.rincianPemasukan}
        onToggle={() => toggleSection('rincianPemasukan')}
      >
        <div className="max-w-md bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
          <CardToolbarHeader
            title={
              <span>
                Pemasukan{' '}
                <span className="text-[#05828e] font-semibold">(RpXXXXXXXX)</span>
              </span>
            }
          />
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-medium border-b border-slate-50 text-[11px]">
                  <th className="py-2.5 px-2">DB</th>
                  <th className="py-2.5 px-2">Divisi</th>
                  <th className="py-2.5 px-2">Kebutuhan</th>
                  <th className="py-2.5 px-2">Keterangan Akun</th>
                  <th className="py-2.5 px-2 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                <tr>
                  <td className="py-2.5 px-2 font-medium text-slate-600">DB</td>
                  <td className="py-2.5 px-2">{project?.divisi || 'EVE'}</td>
                  <td className="py-2.5 px-2">Pemasukan Peserta</td>
                  <td className="py-2.5 px-2">Beli Paket Kegiatan</td>
                  <td className="py-2.5 px-2 text-right font-medium text-slate-800">
                    RpXXXXXX
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </SectionCollapse>

      {/* =========================================================================
          SECTION 7: Rincian Pengeluaran
         ========================================================================= */}
      <SectionCollapse
        title="Rincian Pengeluaran"
        isOpen={openSections.rincianPengeluaran}
        onToggle={() => toggleSection('rincianPengeluaran')}
      >
        <div className="max-w-md bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
          <CardToolbarHeader
            title={
              <span>
                Pengeluaran{' '}
                <span className="text-[#05828e] font-semibold">(RpXXXXXXXX)</span>
              </span>
            }
          />
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-medium border-b border-slate-50 text-[11px]">
                  <th className="py-2.5 px-2">CR</th>
                  <th className="py-2.5 px-2">Divisi</th>
                  <th className="py-2.5 px-2">Kebutuhan</th>
                  <th className="py-2.5 px-2">Keterangan Akun</th>
                  <th className="py-2.5 px-2 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                <tr>
                  <td className="py-2.5 px-2 font-medium text-slate-600">CR</td>
                  <td className="py-2.5 px-2">{project?.divisi || 'EVE'}</td>
                  <td className="py-2.5 px-2">Hadiah</td>
                  <td className="py-2.5 px-2">Hadiah Pembicara</td>
                  <td className="py-2.5 px-2 text-right font-medium text-slate-800">
                    RpXXXXXX
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </SectionCollapse>
    </div>
  );
};
