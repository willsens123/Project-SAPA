import React, { useMemo, useState } from 'react';
import {
  ShieldCheck,
  Lock,
  RotateCcw,
  Users,
  Building2,
  Check,
  AlertCircle,
  Info,
} from 'lucide-react';
import {
  DivisionAccessRule,
  KaryawanItem,
  PermissionKey,
  RbacPolicyConfig,
  UserRole,
} from '../types';
import {
  ALL_PERMISSION_KEYS,
  ALL_ROLES,
  PERMISSION_CATALOG,
  ROLE_METADATA,
  createDefaultRbacConfig,
  normalizeRbacConfig,
  resolveEffectiveRole,
} from '../utils/rbacManager';

interface RbacPermissionPanelProps {
  rbacConfig: RbacPolicyConfig;
  onUpdateRbacConfig: (next: RbacPolicyConfig) => void;
  members: KaryawanItem[];
  divisiList: string[];
  canEdit: boolean;
  currentUserName?: string;
  onShowToast?: (message: string) => void;
}

const CATEGORIES: Array<
  'Umum' | 'Identitas & Merge' | 'Audit & Keamanan' | 'Keuangan & Proyek' | 'Administrasi'
> = [
  'Umum',
  'Identitas & Merge',
  'Audit & Keamanan',
  'Keuangan & Proyek',
  'Administrasi',
];

export const RbacPermissionPanel: React.FC<RbacPermissionPanelProps> = ({
  rbacConfig,
  onUpdateRbacConfig,
  members,
  divisiList,
  canEdit,
  currentUserName = 'Super Admin',
  onShowToast,
}) => {
  const normalized = useMemo(() => normalizeRbacConfig(rbacConfig), [rbacConfig]);
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [confirmReset, setConfirmReset] = useState(false);

  const allDivisions = useMemo(() => {
    const map = new Map<string, string>();
    (Object.values(normalized.divisionRules) as DivisionAccessRule[]).forEach((rule) => {
      map.set(rule.divisiKode.toUpperCase(), rule.label || rule.divisiKode.toUpperCase());
    });
    divisiList.forEach((raw) => {
      const code = raw.trim().toUpperCase();
      if (code && !map.has(code)) {
        map.set(code, `Divisi ${code}`);
      }
    });
    members.forEach((m) => {
      const code = (m.divisi || '').trim().toUpperCase();
      if (code && !map.has(code)) {
        map.set(code, `Divisi ${code}`);
      }
    });
    return Array.from(map.entries()).map(([code, label]) => ({ code, label }));
  }, [normalized.divisionRules, divisiList, members]);

  const [selectedDivisi, setSelectedDivisi] = useState<string>(
    allDivisions[0]?.code || 'UMM'
  );

  const memberCountByRole = useMemo(() => {
    const counts: Record<UserRole, number> = {
      super_admin: 0,
      kepala_divisi: 0,
      admin_operasional: 0,
      finance_audit: 0,
      viewer: 0,
    };
    members.forEach((m) => {
      const role = resolveEffectiveRole(m);
      counts[role] = (counts[role] || 0) + 1;
    });
    return counts;
  }, [members]);

  const membersInSelectedRole = useMemo(
    () => members.filter((m) => resolveEffectiveRole(m) === selectedRole),
    [members, selectedRole]
  );

  const selectedRolePerms = normalized.rolePermissions[selectedRole];
  const selectedRoleGrantedCount = ALL_PERMISSION_KEYS.filter(
    (k) => selectedRolePerms[k]
  ).length;

  const currentDivRule: DivisionAccessRule = useMemo(() => {
    const existing = normalized.divisionRules[selectedDivisi];
    if (existing) return existing;
    return {
      divisiKode: selectedDivisi,
      label: `Divisi ${selectedDivisi}`,
      allowedModules: [...ALL_PERMISSION_KEYS],
      restrictToOwnDivisionProjects: false,
    };
  }, [normalized.divisionRules, selectedDivisi]);

  const handleToggleRolePermission = (permKey: PermissionKey) => {
    if (!canEdit) {
      onShowToast?.('Anda tidak memiliki izin untuk mengubah kebijakan hak akses.');
      return;
    }
    if (
      selectedRole === 'super_admin' &&
      (permKey === 'viewHome' || permKey === 'manageAccountsAndRoles')
    ) {
      onShowToast?.('Izin inti Super Admin terkunci demi mencegah terkuncinya sistem.');
      return;
    }

    const nextConfig = normalizeRbacConfig({
      ...normalized,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUserName,
      rolePermissions: {
        ...normalized.rolePermissions,
        [selectedRole]: {
          ...normalized.rolePermissions[selectedRole],
          [permKey]: !normalized.rolePermissions[selectedRole][permKey],
        },
      },
    });
    onUpdateRbacConfig(nextConfig);
  };

  const handleSetAllRolePermissions = (value: boolean) => {
    if (!canEdit) return;
    const updatedRoleMap: Record<PermissionKey, boolean> = {
      ...normalized.rolePermissions[selectedRole],
    };
    ALL_PERMISSION_KEYS.forEach((k) => {
      if (
        selectedRole === 'super_admin' &&
        (k === 'viewHome' || k === 'manageAccountsAndRoles')
      ) {
        updatedRoleMap[k] = true;
      } else {
        updatedRoleMap[k] = value;
      }
    });
    onUpdateRbacConfig(
      normalizeRbacConfig({
        ...normalized,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUserName,
        rolePermissions: {
          ...normalized.rolePermissions,
          [selectedRole]: updatedRoleMap,
        },
      })
    );
    onShowToast?.(
      `Hak akses role ${ROLE_METADATA[selectedRole].label} diperbarui.`
    );
  };

  const handleToggleDivisionModule = (permKey: PermissionKey) => {
    if (!canEdit) {
      onShowToast?.('Anda tidak memiliki izin untuk mengubah aturan divisi.');
      return;
    }
    const exists = currentDivRule.allowedModules.includes(permKey);
    const nextModules = exists
      ? currentDivRule.allowedModules.filter((k) => k !== permKey)
      : [...currentDivRule.allowedModules, permKey];

    onUpdateRbacConfig(
      normalizeRbacConfig({
        ...normalized,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUserName,
        divisionRules: {
          ...normalized.divisionRules,
          [selectedDivisi]: {
            ...currentDivRule,
            allowedModules: nextModules,
          },
        },
      })
    );
  };

  const handleToggleDivisionProjectScope = () => {
    if (!canEdit) return;
    onUpdateRbacConfig(
      normalizeRbacConfig({
        ...normalized,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUserName,
        divisionRules: {
          ...normalized.divisionRules,
          [selectedDivisi]: {
            ...currentDivRule,
            restrictToOwnDivisionProjects: !currentDivRule.restrictToOwnDivisionProjects,
          },
        },
      })
    );
  };

  const handleAllowAllDivisionModules = () => {
    if (!canEdit) return;
    onUpdateRbacConfig(
      normalizeRbacConfig({
        ...normalized,
        updatedAt: new Date().toISOString(),
        updatedBy: currentUserName,
        divisionRules: {
          ...normalized.divisionRules,
          [selectedDivisi]: {
            ...currentDivRule,
            allowedModules: [...ALL_PERMISSION_KEYS],
          },
        },
      })
    );
    onShowToast?.(`Semua modul diizinkan untuk Divisi ${selectedDivisi}.`);
  };

  const handleResetDefaults = () => {
    if (!canEdit) return;
    const def = createDefaultRbacConfig();
    def.updatedBy = currentUserName;
    onUpdateRbacConfig(def);
    setConfirmReset(false);
    onShowToast?.('Kebijakan hak akses dikembalikan ke pengaturan standar.');
  };

  const roleMeta = ROLE_METADATA[selectedRole];

  return (
    <div className="space-y-6">
      {/* Header Summary Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#008d91] dark:text-teal-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Matriks Hak Akses per Peran &amp; Divisi (RBAC)
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Kebijakan izin diterapkan langsung ke navigasi, aksi transaksi, Smart Merge, Rollback Merge, dan Audit Log lintas perangkat.
          </p>
          <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 pt-0.5">
            {ALL_ROLES.length} Role · {allDivisions.length} Divisi · Diperbarui oleh{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {normalized.updatedBy || 'System'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {!canEdit && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              Mode Lihat Saja
            </span>
          )}

          {canEdit &&
            (confirmReset ? (
              <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
                  Reset ke default?
                </span>
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                >
                  Ya, Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Default
              </button>
            ))}
        </div>
      </div>

      {/* Section A: Role Permission Matrix */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#008d91] dark:text-teal-400" />
              <span>Pengaturan Izin per Peran (Role)</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Pilih role admin untuk mengatur kapabilitas operasional dan keamanan.
            </p>
          </div>
          {canEdit && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSetAllRolePermissions(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Aktifkan Semua
              </button>
              {selectedRole !== 'super_admin' && (
                <button
                  type="button"
                  onClick={() => handleSetAllRolePermissions(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Nonaktifkan Semua
                </button>
              )}
            </div>
          )}
        </div>

        {/* Role Selector Tabs */}
        <div className="px-4 sm:px-5 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap gap-2">
          {ALL_ROLES.map((r) => {
            const meta = ROLE_METADATA[r];
            const isSelected = r === selectedRole;
            const permCount = ALL_PERMISSION_KEYS.filter(
              (k) => normalized.rolePermissions[r][k]
            ).length;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRole(r)}
                className={`px-3.5 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#008d91] bg-[#008d91]/10 dark:bg-teal-950/60 text-[#046c76] dark:text-teal-300 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="text-xs font-bold">{meta.label}</div>
                <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 mt-0.5">
                  {memberCountByRole[r]} akun · {permCount}/{ALL_PERMISSION_KEYS.length} izin
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Role Info + Assigned Users */}
        <div className="p-4 sm:p-5 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/70">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-bold ${roleMeta.badgeClass}`}
                >
                  {roleMeta.label}
                </span>
                <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  {selectedRoleGrantedCount} dari {ALL_PERMISSION_KEYS.length} izin aktif
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {roleMeta.description}
              </p>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 shrink-0 max-w-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Anggota ({membersInSelectedRole.length}):
              </span>{' '}
              {membersInSelectedRole.length === 0
                ? 'Belum ada akun'
                : membersInSelectedRole
                    .slice(0, 4)
                    .map((m) => m.namaPanggilan || m.namaLengkap)
                    .join(', ') +
                  (membersInSelectedRole.length > 4
                    ? ` +${membersInSelectedRole.length - 4} lainnya`
                    : '')}
            </div>
          </div>

          {/* Categorized Permission Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATEGORIES.map((category) => {
              const catItems = PERMISSION_CATALOG.filter((p) => p.category === category);
              return (
                <div
                  key={category}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 p-3.5 space-y-2.5"
                >
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-1.5 border-b border-slate-100 dark:border-slate-800">
                    {category}
                  </div>
                  <div className="space-y-2">
                    {catItems.map((perm) => {
                      const checked = Boolean(selectedRolePerms[perm.key]);
                      const isLocked =
                        selectedRole === 'super_admin' &&
                        (perm.key === 'viewHome' ||
                          perm.key === 'manageAccountsAndRoles');
                      const disabled = !canEdit || isLocked;

                      return (
                        <button
                          key={perm.key}
                          type="button"
                          disabled={disabled}
                          onClick={() => handleToggleRolePermission(perm.key)}
                          className={`w-full flex items-start justify-between gap-3 p-2.5 rounded-lg border text-left transition-colors ${
                            checked
                              ? 'border-teal-200 dark:border-teal-800/80 bg-teal-50/40 dark:bg-teal-950/30'
                              : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40'
                          } ${
                            disabled
                              ? 'opacity-75 cursor-not-allowed'
                              : 'hover:border-[#008d91] cursor-pointer'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                              <span>{perm.label}</span>
                              {isLocked && (
                                <Lock
                                  className="w-3 h-3 text-slate-400 shrink-0"
                                  aria-label="Terkunci"
                                />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                              {perm.description}
                            </div>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              checked
                                ? 'bg-[#008d91] border-[#008d91] text-white'
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {checked && <Check className="w-3.5 h-3.5 stroke-[2.8]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section B: Division-Level Access Rules */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#008d91] dark:text-teal-400" />
              <span>Aturan Modul per Divisi</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Membatasi modul yang boleh diakses oleh anggota pada divisi tertentu (kecuali Super Admin).
            </p>
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={handleAllowAllDivisionModules}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer self-start sm:self-auto"
            >
              Izinkan Semua Modul Divisi Ini
            </button>
          )}
        </div>

        {/* Division Selector Tabs */}
        <div className="px-4 sm:px-5 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap gap-2">
          {allDivisions.map((div) => {
            const rule = normalized.divisionRules[div.code];
            const allowedCount = rule
              ? rule.allowedModules.length
              : ALL_PERMISSION_KEYS.length;
            const isSelected = div.code === selectedDivisi;
            return (
              <button
                key={div.code}
                type="button"
                onClick={() => setSelectedDivisi(div.code)}
                className={`px-3.5 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#008d91] bg-[#008d91]/10 dark:bg-teal-950/60 text-[#046c76] dark:text-teal-300 shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="text-xs font-bold font-mono">{div.code}</div>
                <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  {allowedCount}/{ALL_PERMISSION_KEYS.length} modul
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/70">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Divisi {selectedDivisi} · {currentDivRule.label}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 shrink-0 text-[#008d91]" />
                <span>
                  Izin efektif pengguna adalah irisan dari izin Role dan batas modul Divisi.
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={!canEdit}
              onClick={handleToggleDivisionProjectScope}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                currentDivRule.restrictToOwnDivisionProjects
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300'
              } ${!canEdit ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center ${
                  currentDivRule.restrictToOwnDivisionProjects
                    ? 'bg-amber-600 border-amber-600 text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                }`}
              >
                {currentDivRule.restrictToOwnDivisionProjects && (
                  <Check className="w-3 h-3 stroke-[2.8]" />
                )}
              </div>
              <span>Fokus Proyek Divisi Sendiri</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {PERMISSION_CATALOG.map((perm) => {
              const allowed = currentDivRule.allowedModules.includes(perm.key);
              return (
                <button
                  key={perm.key}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => handleToggleDivisionModule(perm.key)}
                  className={`flex items-center justify-between gap-2.5 p-2.5 rounded-xl border text-left transition-colors ${
                    allowed
                      ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 text-slate-800 dark:text-slate-100'
                      : 'border-rose-200/70 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-slate-500 dark:text-slate-400'
                  } ${
                    !canEdit
                      ? 'opacity-75 cursor-not-allowed'
                      : 'hover:border-[#008d91] cursor-pointer'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{perm.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {perm.category}
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                      allowed
                        ? 'bg-[#008d91] border-[#008d91] text-white'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {allowed ? (
                      <Check className="w-3.5 h-3.5 stroke-[2.8]" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
