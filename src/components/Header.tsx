import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal, Check, RefreshCw, Clock, Table, Tags, BarChart3, Users, Menu, Home, Download, History, LogOut, Sun, Moon } from 'lucide-react';
import { AvatarMascot } from './AvatarMascot';
import { ANNOUNCEMENT_MESSAGES } from '../data';

import { AppView, KaryawanItem } from '../types';
import { CloudSyncIndicator } from './CloudSyncIndicator';
import { SyncStatus } from '../firebase/syncService';
import { AppTheme } from '../utils/themeManager';

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
  currentUser?: KaryawanItem | null;
  onLogout?: () => void;
  theme?: AppTheme;
  onToggleTheme?: () => void;
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
  currentUser,
  onLogout,
  theme = 'light',
  onToggleTheme,
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
              className="md:hidden w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#05828e] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <h1
              id="proyek-sapa-title"
              onClick={onBackToTable}
              className={`text-2xl sm:text-[28px] font-bold text-[#555e69] dark:text-slate-100 tracking-tight whitespace-nowrap ${
                onBackToTable ? 'cursor-pointer hover:text-[#05828e] dark:hover:text-teal-400 transition-colors' : ''
              }`}
            >
              {title}
            </h1>
            {onBackToTable && (
              <button
                type="button"
                onClick={onBackToTable}
                className="w-6 h-6 rounded-full bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
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
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#e2e6ea] dark:bg-slate-800 text-[#9ca3af] dark:text-slate-400 hover:text-[#4b5563] dark:hover:text-slate-200 hover:bg-[#d9dee3] dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
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
          className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#e2e6ea] dark:bg-slate-800 text-[#9ca3af] dark:text-slate-400 hover:text-[#4b5563] dark:hover:text-slate-200 hover:bg-[#d9dee3] dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Right Group: Cloud Sync Indicator, Theme Toggle, Download All Data, Clock, Date & Options */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 self-end md:self-auto">
        <CloudSyncIndicator status={syncStatus} onManualSync={onManualSync} />

        {onToggleTheme && (
          <button
            id="btn-header-toggle-theme"
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
            title={theme === 'dark' ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600 text-slate-700 dark:text-slate-200 hover:text-[#008993] dark:hover:text-teal-300 shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden xl:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden xl:inline">Dark</span>
              </>
            )}
          </button>
        )}

        {onDownloadAllData && (
          <button
            type="button"
            onClick={onDownloadAllData}
            title="Unduh & Cadangkan Seluruh Data YPPLN (JSON / CSV)"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600 text-slate-700 dark:text-slate-200 hover:text-[#008993] dark:hover:text-teal-300 shadow-2xs hover:bg-teal-50/50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#008993] dark:text-teal-400" />
            <span>Unduh Semua Data</span>
          </button>
        )}

        {onLogout && (
          <button
            id="btn-header-logout"
            type="button"
            onClick={onLogout}
            title={`Logout dari akun ${currentUser?.namaLengkap || ''}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/70 text-rose-700 dark:text-rose-300 shadow-2xs transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              Logout{currentUser?.namaPanggilan ? ` (${currentUser.namaPanggilan})` : ''}
            </span>
          </button>
        )}

        <div className="flex flex-col items-end">
          <div
            id="header-clock"
            className="text-3xl sm:text-[34px] font-normal leading-none text-[#008993] dark:text-teal-400 tracking-tight tabular-nums"
          >
            {timeString}
          </div>
          <div
            id="header-date"
            className="text-xs sm:text-[13px] font-medium text-[#008993] dark:text-teal-400/90 mt-1"
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
            className="w-8 h-8 rounded-full bg-[#e2e8f0] dark:bg-slate-800 hover:bg-[#cbd5e1] dark:hover:bg-slate-700 text-[#94a3b8] dark:text-slate-400 hover:text-[#64748b] dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>

          {showOptions && (
            <div
              id="header-options-dropdown"
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              {onSelectView && (
                <>
                  <div className="px-4 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Navigasi Halaman
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectView('home');
                      setShowOptions(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                      currentView === 'home' ? 'text-[#05828e] dark:text-teal-400 font-semibold bg-slate-50/50 dark:bg-slate-800/60' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-[#05828e] dark:text-teal-400" />
                      Home Dashboard
                    </span>
                    {currentView === 'home' && <Check className="w-4 h-4 text-[#05828e] dark:text-teal-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectView('table');
                      setShowOptions(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                      currentView === 'table' ? 'text-[#05828e] dark:text-teal-400 font-semibold bg-slate-50/50 dark:bg-slate-800/60' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Table className="w-4 h-4 text-[#05828e] dark:text-teal-400" />
                      Tabel Proyek SAPA
                    </span>
                    {currentView === 'table' && <Check className="w-4 h-4 text-[#05828e] dark:text-teal-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectView('jenisProyek');
                      setShowOptions(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                      currentView === 'jenisProyek' ? 'text-[#05828e] dark:text-teal-400 font-semibold bg-slate-50/50 dark:bg-slate-800/60' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Tags className="w-4 h-4 text-[#05828e] dark:text-teal-400" />
                      Tabel Jenis Proyek
                    </span>
                    {currentView === 'jenisProyek' && <Check className="w-4 h-4 text-[#05828e] dark:text-teal-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectView('report');
                      setShowOptions(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                      currentView === 'report' ? 'text-[#05828e] dark:text-teal-400 font-semibold bg-slate-50/50 dark:bg-slate-800/60' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#05828e] dark:text-teal-400" />
                      Report Proyek
                    </span>
                    {currentView === 'report' && <Check className="w-4 h-4 text-[#05828e] dark:text-teal-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectView('reportCustomerSalur');
                      setShowOptions(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                      currentView === 'reportCustomerSalur' ? 'text-[#05828e] dark:text-teal-400 font-semibold bg-slate-50/50 dark:bg-slate-800/60' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#05828e] dark:text-teal-400" />
                      Report Customer S-SALUR
                    </span>
                    {currentView === 'reportCustomerSalur' && <Check className="w-4 h-4 text-[#05828e] dark:text-teal-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectView('auditLog');
                      setShowOptions(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                      currentView === 'auditLog' ? 'text-[#05828e] dark:text-teal-400 font-semibold bg-slate-50/50 dark:bg-slate-800/60' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <History className="w-4 h-4 text-[#05828e] dark:text-teal-400" />
                      Audit Log Pusat
                    </span>
                    {currentView === 'auditLog' && <Check className="w-4 h-4 text-[#05828e] dark:text-teal-400" />}
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                </>
              )}

              {onToggleTheme && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleTheme();
                    setShowOptions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-slate-500" />
                    )}
                    <span>{theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}</span>
                  </span>
                </button>
              )}

              <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-[#008d91] dark:text-teal-400" />
                  Jam & Tanggal Real-Time
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
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
                  className="w-full text-left px-4 py-2.5 text-sm text-[#008993] dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800 flex items-center justify-between font-semibold border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-[#008993] dark:text-teal-400" />
                    Unduh Semua Data (Backup)
                  </span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-[#008993] dark:text-teal-300">
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
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
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
                  className="w-full text-left px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 mt-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset ke Data Awal
                </button>
              )}

              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setShowOptions(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 mt-1 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout ({currentUser?.namaPanggilan || currentUser?.namaLengkap || 'Akun'})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
