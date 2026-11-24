import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { KaryawanItem } from '../types';
import { changeMemberPasswordInFirestore } from '../firebase/authAccountService';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: KaryawanItem | null;
  accounts: KaryawanItem[];
  onPasswordChanged: (updatedUser: KaryawanItem, updatedList: KaryawanItem[]) => void;
}

function getPasswordStrength(pw: string): {
  label: string;
  barClass: string;
  textClass: string;
  widthPercent: string;
} {
  if (!pw) {
    return { label: '', barClass: 'bg-slate-200', textClass: 'text-slate-400', widthPercent: '0%' };
  }
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) {
    return {
      label: 'Lemah',
      barClass: 'bg-rose-500',
      textClass: 'text-rose-600 dark:text-rose-400',
      widthPercent: '33%',
    };
  }
  if (score <= 2) {
    return {
      label: 'Sedang',
      barClass: 'bg-amber-500',
      textClass: 'text-amber-600 dark:text-amber-400',
      widthPercent: '66%',
    };
  }
  return {
    label: 'Kuat',
    barClass: 'bg-emerald-500',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    widthPercent: '100%',
  };
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  accounts,
  onPasswordChanged,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
      setErrorMsg(null);
    }
  }, [isOpen]);

  if (!isOpen || !currentUser) return null;

  const strength = getPasswordStrength(newPassword);
  const isConfirmMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const isConfirmMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentPassword) {
      setErrorMsg('Masukkan password Anda saat ini terlebih dahulu.');
      return;
    }
    if (!newPassword || newPassword.trim().length < 4) {
      setErrorMsg('Password baru minimal 4 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password baru tidak cocok.');
      return;
    }
    if (newPassword === currentPassword) {
      setErrorMsg('Password baru harus berbeda dari password saat ini.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { updatedUser, updatedList } = await changeMemberPasswordInFirestore(
        currentUser.id,
        currentPassword,
        newPassword.trim(),
        accounts
      );
      onPasswordChanged(updatedUser, updatedList);
      onClose();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Gagal memperbarui password akun.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 font-['Plus_Jakarta_Sans',sans-serif]"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-7 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-[#05828e] dark:text-teal-400 flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Ganti Password Akun
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentUser.namaLengkap} ({currentUser.kodeKaryawan})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal ganti password"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Note */}
        <div className="mt-4 p-3 rounded-xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/60 flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
          <ShieldCheck className="w-4 h-4 text-[#05828e] dark:text-teal-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            Password disimpan dalam format terenkripsi (salted SHA-256) dan langsung disinkronkan ke seluruh perangkat.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {errorMsg && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Password Saat Ini */}
          <div>
            <label
              htmlFor="change-pw-current"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Password Saat Ini <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                id="change-pw-current"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan password saat ini"
                className="w-full h-11 pl-3.5 pr-11 text-sm bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#05828e]"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowCurrent((p) => !p)}
                aria-label={showCurrent ? 'Sembunyikan password saat ini' : 'Tampilkan password saat ini'}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Baru */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="change-pw-new"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Password Baru <span className="text-rose-600">*</span>
              </label>
              {strength.label && (
                <span className={`text-[11px] font-bold ${strength.textClass}`}>
                  Kekuatan: {strength.label}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="change-pw-new"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 4 karakter (kombinasi huruf & angka disarankan)"
                className="w-full h-11 pl-3.5 pr-11 text-sm bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#05828e]"
              />
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                aria-label={showNew ? 'Sembunyikan password baru' : 'Tampilkan password baru'}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword.length > 0 && (
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-200 ${strength.barClass}`}
                  style={{ width: strength.widthPercent }}
                />
              </div>
            )}
          </div>

          {/* Konfirmasi Password Baru */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="change-pw-confirm"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Konfirmasi Password Baru <span className="text-rose-600">*</span>
              </label>
              {isConfirmMatch && (
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Cocok</span>
                </span>
              )}
              {isConfirmMismatch && (
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Belum cocok</span>
                </span>
              )}
            </div>
            <div className="relative">
              <input
                id="change-pw-confirm"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full h-11 pl-3.5 pr-11 text-sm bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#05828e]"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                aria-label={showConfirm ? 'Sembunyikan konfirmasi password' : 'Tampilkan konfirmasi password'}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              id="btn-save-new-password"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#05828e] hover:bg-[#046e78] disabled:opacity-60 shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Password Baru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
