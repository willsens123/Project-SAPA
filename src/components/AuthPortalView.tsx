import React, { useState, useEffect, useRef } from 'react';
import {
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  KeyRound,
  User as UserIcon,
  Building2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  AtSign,
  Check,
  Sun,
  Moon,
} from 'lucide-react';
import { KaryawanItem, LoginAuthMethod } from '../types';
import {
  fetchLatestMemberAccountsFromFirestore,
  registerMemberAccountInFirestore,
  upgradeMemberPasswordHashInFirestore,
} from '../firebase/authAccountService';
import { verifyPassword } from '../utils/passwordHash';
import { AppTheme } from '../utils/themeManager';

interface AuthPortalViewProps {
  accounts: KaryawanItem[];
  isLoadingAccounts: boolean;
  initialMode?: 'register' | 'login';
  logoutNotice?: string | null;
  theme?: AppTheme;
  onToggleTheme?: () => void;
  onRegisterSuccess: (createdAccount: KaryawanItem, updatedList: KaryawanItem[]) => void;
  onLoginSuccess: (
    user: KaryawanItem,
    rememberMe?: boolean,
    authMethod?: LoginAuthMethod
  ) => void;
}

const DIVISI_OPTIONS = [
  'UMM',
  'MAD',
  'KEU',
  'FUN',
  'PNB',
  'PRO',
  'MED',
  'OPS',
  'EVE',
  'CPR',
  'MRK',
  'CAM',
  'IT',
];

export const AuthPortalView: React.FC<AuthPortalViewProps> = ({
  accounts,
  isLoadingAccounts,
  initialMode = 'login',
  logoutNotice = null,
  theme = 'light',
  onToggleTheme,
  onRegisterSuccess,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);
  const [logoImgFailed, setLogoImgFailed] = useState(false);
  const [isEnteringWorkspace, setIsEnteringWorkspace] = useState(false);
  const exitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
      }
    };
  }, []);

  // Register form state
  const [regNamaLengkap, setRegNamaLengkap] = useState('');
  const [regNamaPanggilan, setRegNamaPanggilan] = useState('');
  const [regNamaAkun, setRegNamaAkun] = useState('');
  const [regDivisi, setRegDivisi] = useState('UMM');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Login form state
  const [loginAccount, setLoginAccount] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccessBanner, setLoginSuccessBanner] = useState<string | null>(null);

  const completeEnterWorkspace = (
    user: KaryawanItem,
    remember: boolean,
    authMethod: LoginAuthMethod
  ) => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      onLoginSuccess(user, remember, authMethod);
      return;
    }

    setIsEnteringWorkspace(true);
    exitTimerRef.current = window.setTimeout(() => {
      onLoginSuccess(user, remember, authMethod);
    }, 220);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    if (!regNamaLengkap.trim()) {
      setRegisterError('Nama lengkap anggota wajib diisi.');
      return;
    }
    if (!regNamaAkun.trim() || regNamaAkun.trim().length < 3) {
      setRegisterError('Nama akun / email login minimal 3 karakter.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setRegisterError('Password minimal 4 karakter.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegisterError('Konfirmasi password tidak cocok.');
      return;
    }

    setIsRegistering(true);
    try {
      const { created, updatedList } = await registerMemberAccountInFirestore(
        {
          namaLengkap: regNamaLengkap,
          namaPanggilan: regNamaPanggilan,
          namaAkun: regNamaAkun,
          divisi: regDivisi,
          password: regPassword,
        },
        accounts
      );

      onRegisterSuccess(created, updatedList);

      setLoginAccount(created.emailLogin);
      setLoginPassword('');
      setLoginError(null);
      setLoginSuccessBanner(
        `Registrasi "${created.namaLengkap}" berhasil! Akun "${created.emailLogin}" telah tersimpan. Silakan login.`
      );
      setRegNamaLengkap('');
      setRegNamaPanggilan('');
      setRegNamaAkun('');
      setRegPassword('');
      setRegConfirmPassword('');
      setMode('login');
    } catch (err) {
      setRegisterError(
        err instanceof Error ? err.message : 'Gagal mendaftarkan akun ke server.'
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const identifier = loginAccount.trim().toLowerCase();
    if (!identifier) {
      setLoginError('Masukkan nama akun, email, atau kode anggota terlebih dahulu.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Masukkan password akun Anda.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const authoritativeList = await fetchLatestMemberAccountsFromFirestore(accounts);
      if (isLoadingAccounts && authoritativeList.length === 0) {
        setLoginError('Sedang memuat data akun anggota, silakan coba sesaat lagi.');
        return;
      }

      const matched = authoritativeList.find(
        (acc) =>
          (acc.emailLogin || '').trim().toLowerCase() === identifier ||
          (acc.kodeKaryawan || '').trim().toLowerCase() === identifier
      );

      if (!matched) {
        setLoginError(
          `Akun "${loginAccount.trim()}" tidak ditemukan. Silakan periksa nama akun atau daftar di tab Register.`
        );
        return;
      }

      if (matched.aktif === false) {
        setLoginError(
          `Akun "${matched.namaLengkap}" berstatus Tidak Aktif. Hubungi Super Admin.`
        );
        return;
      }

      const pwCheck = await verifyPassword(loginPassword, matched.password);
      if (!pwCheck.valid) {
        setLoginError('Password tidak sesuai. Silakan periksa kembali password akun Anda.');
        return;
      }

      let activeUser = matched;
      if (pwCheck.needsRehash) {
        const migrated = await upgradeMemberPasswordHashInFirestore(
          matched.id,
          loginPassword,
          authoritativeList
        );
        if (migrated) {
          activeUser = migrated.updatedUser;
          onRegisterSuccess(migrated.updatedUser, migrated.updatedList);
        }
      }

      completeEnterWorkspace(activeUser, rememberMe, 'member_credentials');
    } catch (err) {
      setLoginError(
        err instanceof Error
          ? err.message
          : 'Gagal memeriksa kredensial akun anggota. Silakan coba lagi.'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const passwordsMatch =
    regConfirmPassword.length > 0 && regPassword === regConfirmPassword;
  const passwordsMismatch =
    regConfirmPassword.length > 0 && regPassword !== regConfirmPassword;

  return (
    <div
      className={`min-h-screen bg-[#f8fafc] dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] lg:grid lg:grid-cols-12 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
        isEnteringWorkspace
          ? 'opacity-0 scale-[0.985] pointer-events-none'
          : 'animate-sapa-portal-enter'
      }`}
    >
      {/* Left Column: Brand & Workspace Overview */}
      <aside className="hidden lg:flex lg:col-span-6 xl:col-span-7 relative overflow-hidden bg-[#033237] text-white flex-col justify-between p-10 xl:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-20 w-[28rem] h-[28rem] rounded-full bg-[#14b8a6]/20 blur-3xl animate-sapa-drift"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-28 -right-20 w-[30rem] h-[30rem] rounded-full bg-[#05828e]/30 blur-3xl animate-sapa-drift-reverse"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]"
        />

        {/* Top Foundation Lockup */}
        <div className="relative z-10 flex items-center gap-3.5">
          {!logoImgFailed ? (
            <img
              src="/assets/aistudio/image_e94e2d75.png"
              alt="Logo Lamrimnesia"
              referrerPolicy="no-referrer"
              onError={() => setLogoImgFailed(true)}
              className="h-12 w-12 object-contain rounded-xl bg-white/95 p-1 shadow-sm shrink-0"
            />
          ) : (
            <div className="h-12 w-12 rounded-xl bg-[#05828e] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
              YPPLN
            </div>
          )}
          <div>
            <p className="text-base font-bold tracking-tight text-white leading-snug">
              Proyek SAPA
            </p>
            <p className="text-xs text-teal-100/85 font-medium">
              Yayasan Pelestarian dan Pengembangan Lamrim Nusantara
            </p>
          </div>
        </div>

        {/* Bottom Editorial Anchor */}
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-semibold text-teal-200/90 tracking-wide mb-3">
            Sistem Manajemen Operasional &amp; Amanah Terpadu · Audit Terpusat
          </p>
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-[1.18] [text-wrap:balance]">
            Satu ruang kerja terpadu untuk program, arsip, dan amanah yayasan.
          </h1>
          <p className="mt-4 text-sm xl:text-[15px] text-teal-50/85 leading-relaxed max-w-xl">
            Koordinasikan target proyek lintas divisi, pantau arus kas dan jurnal umum
            secara transparan, serta kelola alur distribusi S-SALUR dan donasi
            D-DONASI dengan perlindungan akses berbasis peran.
          </p>

          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-3 gap-6">
            <div>
              <h2 className="text-xs font-bold text-white">Proyek &amp; Agenda</h2>
              <p className="mt-1 text-xs text-teal-100/75 leading-relaxed">
                Timeline program, filter divisi RBAC, dan pengingat tenggat.
              </p>
            </div>
            <div>
              <h2 className="text-xs font-bold text-white">Laporan Keuangan</h2>
              <p className="mt-1 text-xs text-teal-100/75 leading-relaxed">
                Jurnal umum otomatis, piutang Dharma Patron, dan arus kas.
              </p>
            </div>
            <div>
              <h2 className="text-xs font-bold text-white">Keamanan &amp; Audit</h2>
              <p className="mt-1 text-xs text-teal-100/75 leading-relaxed">
                Jejak audit aktor asli, kontrol sesi perangkat, dan sinkronisasi cloud.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Right Column: Clean Auth Workspace */}
      <div className="lg:col-span-6 xl:col-span-5 bg-white dark:bg-slate-950 flex flex-col justify-between min-h-screen p-5 sm:p-8 lg:p-12 xl:p-14 border-l border-slate-200/80 dark:border-slate-800">
        <header className="w-full max-w-md mx-auto">
          <div className="flex lg:hidden items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 min-w-0">
              {!logoImgFailed ? (
                <img
                  src="/assets/aistudio/image_e94e2d75.png"
                  alt="Logo Lamrimnesia"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoImgFailed(true)}
                  className="h-11 w-11 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-white p-1 shrink-0"
                />
              ) : (
                <div className="h-11 w-11 rounded-xl bg-[#05828e] text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                  YPPLN
                </div>
              )}
              <div className="min-w-0">
                <h1 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">
                  Portal Anggota Proyek SAPA
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                  Yayasan Pelestarian dan Pengembangan Lamrim Nusantara
                </p>
              </div>
            </div>
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label={theme === 'dark' ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-[#05828e] flex items-center justify-center shrink-0 cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>

          <div className="hidden lg:flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Portal Anggota Proyek SAPA</span>
            <div className="flex items-center gap-3">
              {onToggleTheme && (
                <button
                  id="btn-auth-toggle-theme"
                  type="button"
                  onClick={onToggleTheme}
                  aria-label={theme === 'dark' ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-[#05828e] transition-colors cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Terang</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-3.5 h-3.5" />
                      <span>Gelap</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Form Area */}
        <main className="w-full max-w-md mx-auto my-auto py-8">
          {/* Interactive Sliding Segmented Mode Switcher */}
          <div
            role="tablist"
            aria-label="Mode Portal Akun"
            className="relative p-1 bg-slate-100 dark:bg-slate-900 rounded-xl grid grid-cols-2 gap-1 mb-6 border border-transparent dark:border-slate-800"
          >
            <div
              aria-hidden="true"
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-white dark:bg-slate-800 shadow-xs transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                mode === 'login' ? 'translate-x-full' : 'translate-x-0'
              }`}
            />
            <button
              id="tab-auth-register"
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => {
                setMode('register');
                setRegisterError(null);
              }}
              className={`relative z-10 min-h-[40px] px-3 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'register'
                  ? 'text-slate-900 dark:text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4 shrink-0 text-[#05828e] dark:text-teal-400" />
              <span>1. Register Anggota</span>
            </button>
            <button
              id="tab-auth-login"
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => {
                setMode('login');
                setLoginError(null);
              }}
              className={`relative z-10 min-h-[40px] px-3 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'login'
                  ? 'text-slate-900 dark:text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 font-semibold hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4 shrink-0 text-[#05828e] dark:text-teal-400" />
              <span>2. Login Anggota</span>
            </button>
          </div>

          {logoutNotice && mode === 'login' && !loginSuccessBanner && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/90 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5 animate-sapa-panel-enter">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold block">Sesi Berakhir</span>
                <span>{logoutNotice}</span>
              </div>
            </div>
          )}

          {mode === 'register' ? (
            <form
              key="register-form"
              onSubmit={handleRegisterSubmit}
              className="space-y-4 animate-sapa-panel-enter"
            >
              <div className="mb-4">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Registrasi Akun Anggota
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Daftarkan akun anggota baru untuk mengakses sistem ERP Proyek SAPA.
                </p>
              </div>

              {registerError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{registerError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label
                    htmlFor="reg-nama-lengkap"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Nama Lengkap <span className="text-rose-600 dark:text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="reg-nama-lengkap"
                      type="text"
                      value={regNamaLengkap}
                      onChange={(e) => setRegNamaLengkap(e.target.value)}
                      placeholder="Budi Santoso"
                      className="w-full h-11 pl-10 pr-3.5 text-sm bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reg-nama-panggilan"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Nama Panggilan
                  </label>
                  <input
                    id="reg-nama-panggilan"
                    type="text"
                    value={regNamaPanggilan}
                    onChange={(e) => setRegNamaPanggilan(e.target.value)}
                    placeholder="Budi (opsional)"
                    className="w-full h-11 px-3.5 text-sm bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="reg-nama-akun"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Nama Akun / Email Login <span className="text-rose-600 dark:text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="reg-nama-akun"
                      type="text"
                      value={regNamaAkun}
                      onChange={(e) => setRegNamaAkun(e.target.value)}
                      placeholder="budi@lamrimnesia.org"
                      className="w-full h-11 pl-10 pr-3.5 text-sm bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reg-divisi"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Divisi <span className="text-rose-600 dark:text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      id="reg-divisi"
                      value={regDivisi}
                      onChange={(e) => setRegDivisi(e.target.value)}
                      className="w-full h-11 pl-9 pr-3 text-sm font-semibold bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 cursor-pointer"
                    >
                      {DIVISI_OPTIONS.map((div) => (
                        <option key={div} value={div}>
                          {div}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Password <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full h-11 pl-10 pr-11 text-sm bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword((prev) => !prev)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label={showRegPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="reg-confirm-password"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Konfirmasi Password <span className="text-rose-600 dark:text-rose-400">*</span>
                  </label>
                  {passwordsMatch && (
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Cocok</span>
                    </span>
                  )}
                  {passwordsMismatch && (
                    <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Belum cocok</span>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-confirm-password"
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Ulangi password Anda"
                    className="w-full h-11 pl-10 pr-11 text-sm bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword((prev) => !prev)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label={
                      showRegConfirmPassword
                        ? 'Sembunyikan konfirmasi password'
                        : 'Tampilkan konfirmasi password'
                    }
                  >
                    {showRegConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="btn-submit-register"
                  type="submit"
                  disabled={isRegistering}
                  className="group w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#05828e] hover:bg-[#046e78] disabled:opacity-60 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">
                    {isRegistering ? 'Menyimpan Akun...' : 'Daftar & Lanjut ke Login'}
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </form>
          ) : (
            <form
              key="login-form"
              onSubmit={handleLoginSubmit}
              className="space-y-4 animate-sapa-panel-enter"
            >
              <div className="mb-4">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Masuk dengan Akun Anggota
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Gunakan nama akun, email login, atau kode anggota beserta password Anda.
                </p>
              </div>

              {loginSuccessBanner && (
                <div
                  role="status"
                  className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 text-xs flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{loginSuccessBanner}</span>
                </div>
              )}

              {loginError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{loginError}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="login-nama-akun"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Nama Akun / Email / Kode Anggota <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-nama-akun"
                    type="text"
                    value={loginAccount}
                    onChange={(e) => setLoginAccount(e.target.value)}
                    placeholder="Masukkan nama akun atau kode"
                    className="w-full h-11 pl-10 pr-3.5 text-sm bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Password <span className="text-rose-600 dark:text-rose-400">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan password akun"
                    className="w-full h-11 pl-10 pr-11 text-sm bg-slate-50/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label={showLoginPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label
                  htmlFor="login-remember-me"
                  className="inline-flex items-center gap-2.5 min-h-[36px] cursor-pointer select-none group"
                >
                  <input
                    id="login-remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <span
                    aria-hidden="true"
                    className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all duration-150 shrink-0 ${
                      rememberMe
                        ? 'bg-[#05828e] border-[#05828e] text-white'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Remember Me
                  </span>
                </label>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Tetap masuk di perangkat ini
                </span>
              </div>

              <div className="pt-1">
                <button
                  id="btn-submit-login"
                  type="submit"
                  disabled={isEnteringWorkspace || isLoggingIn}
                  className="group w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-[#05828e] hover:bg-[#046e78] disabled:opacity-70 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">
                    {isLoggingIn
                      ? 'Memverifikasi Akun...'
                      : isEnteringWorkspace
                      ? 'Membuka Dashboard...'
                      : 'Masuk ke Aplikasi'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </main>

        <footer className="w-full max-w-md mx-auto pt-6 border-t border-slate-100 dark:border-slate-800 text-center lg:text-left text-xs text-slate-400 dark:text-slate-500">
          &copy; {new Date().getFullYear()} Yayasan Pelestarian dan Pengembangan Lamrim Nusantara · Sistem Proyek SAPA
        </footer>
      </div>
    </div>
  );
};
