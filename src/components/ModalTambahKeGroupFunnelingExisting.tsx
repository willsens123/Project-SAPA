import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  Users,
  FolderPlus,
  Check,
  CheckCircle2,
  FolderInput,
  Info,
} from 'lucide-react';
import {
  loadFunnelingGroups,
  saveFunnelingGroups,
  loadFunnelingMembers,
  saveFunnelingMembers,
  FunnelingGroupCard,
  FunnelingMemberItem,
} from '../funnelingData';
import { IdentitasItem } from '../identitasData';

export interface TargetMemberItem {
  id: string;
  nama: string;
  codeId?: string;
  identitasId?: string;
  nomorHp?: string;
}

interface ModalTambahKeGroupFunnelingExistingProps {
  isOpen: boolean;
  onClose: () => void;
  targetMembers: TargetMemberItem[];
  identitasList?: IdentitasItem[];
  onSuccess?: (groupName: string, countAdded: number) => void;
  onShowToast?: (msg: string) => void;
  onNavigateToCreateNewGroup?: () => void;
}

export const ModalTambahKeGroupFunnelingExisting: React.FC<ModalTambahKeGroupFunnelingExistingProps> = ({
  isOpen,
  onClose,
  targetMembers,
  identitasList = [],
  onSuccess,
  onShowToast = (_msg: string) => {},
  onNavigateToCreateNewGroup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // Load latest groups
  const groups: FunnelingGroupCard[] = useMemo(() => {
    if (!isOpen) return [];
    return loadFunnelingGroups();
  }, [isOpen]);

  // Filter groups
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;
    const q = searchQuery.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.jenisGroup && g.jenisGroup.toLowerCase().includes(q))
    );
  }, [groups, searchQuery]);

  if (!isOpen) return null;

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  const handleConfirm = () => {
    if (!selectedGroup) {
      onShowToast('Silakan pilih salah satu Group Funneling tujuan');
      return;
    }

    if (targetMembers.length === 0) {
      onShowToast('Tidak ada data identitas yang dipilih');
      return;
    }

    try {
      const currentGroups = loadFunnelingGroups();
      const currentMembers = loadFunnelingMembers();

      const targetGroupIndex = currentGroups.findIndex((g) => g.id === selectedGroup.id);
      if (targetGroupIndex === -1) {
        onShowToast('Group tujuan tidak ditemukan');
        return;
      }

      const existingGroup = { ...currentGroups[targetGroupIndex] };
      const existingIds = new Set<string>(existingGroup.identitasIds || []);

      let countNewAdded = 0;
      const targetIdentitasIds: string[] = [];

      targetMembers.forEach((tm) => {
        const idToAdd = tm.identitasId || tm.id;
        if (idToAdd) {
          targetIdentitasIds.push(idToAdd);
          if (!existingIds.has(idToAdd)) {
            existingIds.add(idToAdd);
            countNewAdded++;
          }
        }
      });

      // Update group card
      const updatedIdentitasIds = Array.from(existingIds);
      existingGroup.identitasIds = updatedIdentitasIds;
      existingGroup.count = updatedIdentitasIds.length;
      existingGroup.countLabel = `${updatedIdentitasIds.length} orang`;

      currentGroups[targetGroupIndex] = existingGroup;
      saveFunnelingGroups(currentGroups);

      // Update Funneling members
      const updatedMembers = [...currentMembers];

      targetMembers.forEach((tm) => {
        const identitasId = tm.identitasId || tm.id;
        const matchingIdentitas = identitasList.find((i) => i.id === identitasId || i.codeId === tm.codeId);

        const memberIdx = updatedMembers.findIndex(
          (m) =>
            m.identitasId === identitasId ||
            (tm.codeId && m.codeId === tm.codeId) ||
            m.nama.toLowerCase() === tm.nama.toLowerCase()
        );

        const isGroupA = existingGroup.name === 'Group A';
        const isGroupB = existingGroup.name === 'Group B';

        if (memberIdx >= 0) {
          const m = updatedMembers[memberIdx];
          const groupNames = m.groupNames ? [...m.groupNames] : [];
          if (!groupNames.includes(existingGroup.name)) {
            groupNames.push(existingGroup.name);
          }
          updatedMembers[memberIdx] = {
            ...m,
            groupNames,
            groupA: isGroupA ? true : m.groupA,
            groupB: isGroupB ? true : m.groupB,
          };
        } else {
          // Create new member item
          const newMember: FunnelingMemberItem = {
            id: `fn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            identitasId: identitasId,
            codeId: tm.codeId || matchingIdentitas?.codeId || '00000',
            nama: tm.nama || matchingIdentitas?.namaLengkap || 'Anggota Baru',
            namaPanggilan: matchingIdentitas?.namaPanggilan || '-',
            avatarInitial: (tm.nama || matchingIdentitas?.namaLengkap || 'A').charAt(0).toUpperCase(),
            avatarBg: matchingIdentitas?.avatarBg || 'bg-[#008d91]',
            groupA: isGroupA,
            groupB: isGroupB,
            category: existingGroup.jenisGroup || 'All',
            jenisGroup: existingGroup.jenisGroup || 'Group Donasi',
            groupNames: [existingGroup.name],
          };
          updatedMembers.unshift(newMember);
        }
      });

      saveFunnelingMembers(updatedMembers);

      // Fire custom event so views know funneling groups have updated
      window.dispatchEvent(new CustomEvent('funneling_groups_updated'));

      onShowToast(
        `Berhasil menambahkan ${targetMembers.length} identitas ke "${existingGroup.name}"`
      );

      if (onSuccess) {
        onSuccess(existingGroup.name, targetMembers.length);
      }
      onClose();
    } catch (err) {
      console.error('Failed to add members to existing group:', err);
      onShowToast('Gagal menambahkan ke group funneling');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-[#008d91] flex items-center justify-center shadow-xs">
              <FolderInput className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Tambah ke Group Funneling Existing
              </h2>
              <p className="text-xs text-slate-500">
                Pilih Group Funneling tujuan untuk {targetMembers.length} identitas terpilih
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Targets Preview Chips */}
        <div className="px-5 pt-3.5 pb-2 border-b border-slate-100 bg-slate-50/30">
          <div className="text-[11px] font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#008d91]" />
            <span>Target Identitas ({targetMembers.length}):</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
            {targetMembers.slice(0, 6).map((tm, idx) => (
              <span
                key={tm.id || idx}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-white border border-slate-200 text-slate-700 shadow-2xs"
              >
                <span className="w-2 h-2 rounded-full bg-[#008d91]" />
                <span className="font-medium truncate max-w-[140px]">{tm.nama}</span>
                {tm.codeId && <span className="text-[10px] text-slate-400">({tm.codeId})</span>}
              </span>
            ))}
            {targetMembers.length > 6 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-[#008d91] border border-teal-200">
                +{targetMembers.length - 6} lainnya
              </span>
            )}
          </div>
        </div>

        {/* Search Groups */}
        <div className="p-4 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau jenis group..."
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#008d91]/20 focus:border-[#008d91] transition-all"
            />
          </div>
        </div>

        {/* Group List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Info className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs">Tidak ada Group Funneling yang sesuai pencarian.</p>
              {onNavigateToCreateNewGroup && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToCreateNewGroup();
                  }}
                  className="mt-3 text-xs text-[#008d91] hover:underline font-semibold"
                >
                  + Buat Group Funneling Baru
                </button>
              )}
            </div>
          ) : (
            filteredGroups.map((group) => {
              const isSelected = selectedGroupId === group.id;
              const memberCount = group.identitasIds?.length ?? group.count ?? 0;

              return (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#008d91] bg-teal-50/40 shadow-xs ring-1 ring-[#008d91]'
                      : 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center shrink-0">
                      {isSelected ? (
                        <img
                          src="/assets/aistudio/image_d9f24bf9.png"
                          alt="Checklist"
                          className="w-5 h-5 object-contain"
                        />
                      ) : (
                        <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 bg-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                        <span>{group.name}</span>
                        {group.jenisGroup && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            {group.jenisGroup}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {memberCount} orang terdaftar
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-[#008d91] bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                      Pilih
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            {onNavigateToCreateNewGroup && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToCreateNewGroup();
                }}
                className="text-xs text-[#008d91] hover:underline font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Create Group Baru</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={!selectedGroupId}
              onClick={handleConfirm}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ${
                selectedGroupId
                  ? 'bg-[#008d91] hover:bg-[#00787c] active:bg-[#006568]'
                  : 'bg-slate-300 cursor-not-allowed opacity-60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Tambahkan ke Group</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
