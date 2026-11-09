import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal, Check, RefreshCw, Clock, Table, Tags, BarChart3, Users, Menu, Home, Download } from 'lucide-react';
import { AvatarMascot } from './AvatarMascot';
import { ANNOUNCEMENT_MESSAGES } from '../data';

import { AppView } from '../types';
import { CloudSyncIndicator } from './CloudSyncIndicator';
import { SyncStatus } from '../firebase/syncService';

interface HeaderProps {
  title?: string;
  currentView?: AppView;
  onSelectView?: (view: AppView) => void;
  onBackToTable?: () => void;
  onResetData?: () => void;
  onExportData?: () => void;
  onDownloadAllData?: () => void;
  onToggleMobileSidebar?: () => void;
  syncStatus?: SyncStatus;
  onManualSync?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Proyek SAPA',
  currentView = 'table',
  onSelectView,
  onBackToTable,
  onResetData,
  onExportData,
  onDownloadAllData,
  onToggleMobileSidebar,
  syncStatus = 'synced',
  onManualSync,
}) => {
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  React.useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePrevAnnouncement = () => {
    setAnnouncementIndex((prev) => (prev > 0 ? prev - 1 : ANNOUNCEMENT_MESSAGES.length - 1));
  };

  const handleNextAnnouncement = () => {
    setAnnouncementIndex((prev) => (prev < ANNOUNCEMENT_MESSAGES.length - 1 ? prev + 1 : 0));
  };

  // Indonesian localized day and month names
  const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const INDONESIAN_MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  // Format real-time clock (HH:mm) and date (Hari, DD Bulan YYYY)
  const hours = String(currentTime.getHours()).padStart(2, '0');
  const minutes = String(currentTime.getMinutes()).padStart(2, '0');
  const timeString = `${hours}:${minutes}`;

  const dayName = INDONESIAN_DAYS[currentTime.getDay()];
  const dayNum = currentTime.getDate();
  const monthName = INDONESIAN_MONTHS[currentTime.getMonth()];
  const year = currentTime.getFullYear();
  const dateString = `${dayName}, ${dayNum} ${monthName} ${year}`;

  const currentAnnouncement = React.useMemo(() => {
    const raw = ANNOUNCEMENT_MESSAGES[announcementIndex] || '';
    if (currentView === 'reportNamaPelimpahanJasaDonasi') {
      return raw.replace(/Proyek SAPA/g, 'Report Nama Pelimpahan Jasa D-DONASI');
    }
    return raw;
  }, [announcementIndex, currentView]);

  return (
    <header className="w-full flex flex-col md:flex-row items-center justify-between gap-4 py-3 px-2 sm:px-4">
      {/* Left and Center Group */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full md:w-auto">
        {/* Title & Mobile Sidebar Toggle */}
        <div className="flex items-center gap-2.5">
          {onToggleMobileSidebar && (
            <button
              id="btn-mobile-sidebar-toggle"
              type="button"
              onClick={onToggleMobileSidebar}
              title="Buka Menu"
              aria-label="Buka Menu"
              className="md:hidden w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-[#05828e] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <h1
              id="proyek-sapa-title"
              onClick={onBackToTable}
              className={`text-2xl sm:text-[28px] font-bold text-[#555e69] tracking-tight whitespace-nowrap ${
                onBackToTable ? 'cursor-pointer hover:text-[#05828e] transition-colors' : ''
              }`}
            >
              {title}
            </h1>
            {onBackToTable && (
              <button
                type="button"
                onClick={onBackToTable}
                className="w-6 h-6 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                title="Kembali"
              >
                <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        {/* Carousel Prev Button */}
        <button
          id="btn-carousel-prev"
          type="button"
          onClick={handlePrevAnnouncement}
          title="Pengumuman Sebelumnya"
          aria-label="Pengumuman Sebelumnya"
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#e2e6ea] text-[#9ca3af] hover:text-[#4b5563] hover:bg-[#d9dee3] flex items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Mascot Avatar & Speech Bubble */}
        <div className="flex items-center relative group">
          {/* Avatar */}
          <div className="relative z-10 cursor-pointer hover:scale-105 transition-transform">
            <AvatarMascot className="w-12 h-12 sm:w-14 sm:h-14" />
          </div>

          {/* Speech Bubble Arrow Tail */}
          <div
            className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[12px] border-r-[#05828e] -mr-1 z-10"
            style={{ marginLeft: '-6px' }}
          />

          {/* Speech Bubble Body */}
          <div
            id="mascot-speech-bubble"
            className="h-11 sm:h-12 min-w-[200px] sm:min-w-[280px] md:min-w-[360px] lg:min-w-[440px] bg-[#05828e] rounded-xl flex items-center px-4 shadow-sm text-white overflow-hidden relative cursor-default"
          >
            <div className="text-xs sm:text-sm font-medium tracking-wide text-white/95 truncate">
              {currentAnnouncement}
            </div>
          </div>
        </div>

        {/* Carousel Next Button */}
        <button
          id="btn-carousel-next"
          type="button"
          onClick={handleNextAnnouncement}
          title="Pengumuman Berikutnya"
          aria-label="Pengumuman Berikutnya"
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#e2e6ea] text-[#9ca3af] hover:text-[#4b5563] hover:bg-[#d9dee3] flex items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Right Group: Cloud Sync Indicator, Download All Data, Clock, Date & Options */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 self-end md:self-auto">
        <CloudSyncIndicator status={syncStatus} onManualSync={onManualSync} />

        {onDownloadAllData && (
          <button
            type="button"
            onClick={onDownloadAllData}
            title="Unduh & Cadangkan Seluruh Data YPPLN (JSON / CSV)"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-slate-200/90 hover:border-teal-400 text-slate-700 hover:text-[#008993] shadow-2xs hover:bg-teal-50/50 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#008993]" />
            <span>Unduh Semua Data</span>
          </button>
        )}

        <div className="flex flex-col items-end">
          <div
            id="header-clock"
            className="text-3xl sm:text-[34px] font-normal leading-none text-[#008993] tracking-tight tabular-nums"
          >
            {timeString}
          </div>
          <div
            id="header-date"
            className="text-xs sm:text-[13px] font-medium text-[#008993] mt-1"
          >
            {dateString}
          </div>
        </div>

        {/* More Options Button */}
        <div className="relative">
          <button
            id="btn-header-options"
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            aria-label="Menu Opsi"
            className="w-8 h-8 rounded-full bg-[#e2e8f0] hover:bg-[#cbd5e1] text-[#94a3b8] hover:text-[#64748b] flex items-center justify-center transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showOptions && (
            <div
              id="header-options-dropdown"
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              {onSelectView && (
                <>
                  <div className="px-4 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Navigasi Halaman
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectView('home');
                      setShowOptions(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      currentView === 'home' ? 'text-[#05828e] font-semibold bg-slate-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-[#05828e]" />
                      Home Dashboard
                    </span>
                    {currentView === 'home' && <Check className="w-4 h-4 text-[#05828e]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectView('table');
                      setShowOptions(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      currentView === 'table' ? 'text-[#05828e] font-semibold bg-slate-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-[#05828e]" />
                      Tabel Proyek SAPA
                    </span>
                    {currentView === 'table' && <Check className="w-4 h-4 text-[#05828e]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectView('jenisProyek');
                      setShowOptions(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      currentView === 'jenisProyek' ? 'text-[#05828e] font-semibold bg-slate-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Tags className="w-4 h-4 text-[#05828e]" />
                      Tabel Jenis Proyek
                    </span>
                    {currentView === 'jenisProyek' && <Check className="w-4 h-4 text-[#05828e]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectView('report');
                      setShowOptions(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      currentView === 'report' ? 'text-[#05828e] font-semibold bg-slate-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#05828e]" />
                      Report Proyek
                    </span>
                    {currentView === 'report' && <Check className="w-4 h-4 text-[#05828e]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectView('reportCustomerSalur');
                      setShowOptions(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                      currentView === 'reportCustomerSalur' ? 'text-[#05828e] font-semibold bg-slate-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#05828e]" />
                      Report Customer S-SALUR
                    </span>
                    {currentView === 'reportCustomerSalur' && <Check className="w-4 h-4 text-[#05828e]" />}
                  </button>

                  <div className="my-1 border-t border-slate-100" />
                </>
              )}

              <div className="px-4 py-2 text-xs text-slate-500 border-t border-slate-100 flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-[#008d91]" />
                  Jam & Tanggal Real-Time
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Aktif
                </span>
              </div>

              {onDownloadAllData && (
                <button
                  type="button"
                  onClick={() => {
                    onDownloadAllData();
                    setShowOptions(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#008993] hover:bg-teal-50 flex items-center justify-between font-semibold border-t border-slate-100 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-[#008993]" />
                    Unduh Semua Data (Backup)
                  </span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-teal-100 text-[#008993]">
                    JSON / CSV
                  </span>
                </button>
              )}

              {onExportData && (
                <button
                  type="button"
                  onClick={() => {
                    onExportData();
                    setShowOptions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Ekspor Data Proyek SAPA (CSV)
                </button>
              )}

              {onResetData && (
                <button
                  type="button"
                  onClick={() => {
                    onResetData();
                    setShowOptions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 mt-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset ke Data Awal
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
