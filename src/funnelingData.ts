export interface JenisGroupFunnelingItem {
  id: string;
  namaJenisGroup: string;
  aktif: boolean; // true = Yes / Aktif, false = No / Tidak Aktif
  uniqueId: boolean; // true = Yes, false = No
  keterangan?: string;
}

export interface FunnelingGroupCard {
  id: string;
  name: string; // e.g. "Group A"
  count: number; // e.g. 600
  countLabel: string; // e.g. "600 orang"
  icon: 'cart' | 'globe' | string;
  jenisGroup?: string; // e.g. "Funneling Donasi"
  identitasIds?: string[];
  aktif?: boolean;
}

export interface FunnelingMemberItem {
  id: string;
  identitasId?: string;
  codeId: string; // e.g. "00031"
  nama: string; // e.g. "Agustino Ong"
  namaPanggilan: string; // e.g. "Ko Agus"
  avatarInitial: string; // e.g. "A"
  avatarBg: string; // e.g. "bg-[#00a89d]"
  groupA: boolean; // "V" if true, "-" if false
  groupB: boolean; // "V" if true, "-" if false
  category: string; // e.g. 'All' | 'Funneling Donasi'
  jenisGroup?: string; // e.g. 'Funneling Donasi'
  groupNames?: string[]; // e.g. ['Group A', 'Group B']
}

export const INITIAL_JENIS_GROUP_FUNNELING: JenisGroupFunnelingItem[] = [
  {
    id: 'jgf-1',
    namaJenisGroup: 'Funneling Donasi',
    aktif: true,
    uniqueId: true,
    keterangan: 'Group funneling untuk donatur dan patron donasi',
  },
  {
    id: 'jgf-2',
    namaJenisGroup: 'Funneling Relawan / S-SEBAR',
    aktif: true,
    uniqueId: false,
    keterangan: 'Group relawan dan mitra pelaksana S-SEBAR',
  },
  {
    id: 'jgf-3',
    namaJenisGroup: 'Funneling Penerima Manfaat (PM)',
    aktif: true,
    uniqueId: true,
    keterangan: 'Database penerima manfaat terdaftar',
  },
  {
    id: 'jgf-4',
    namaJenisGroup: 'Funneling Anggota Baru',
    aktif: true,
    uniqueId: true,
    keterangan: 'Orientasi anggota baru',
  },
  {
    id: 'jgf-5',
    namaJenisGroup: 'Funneling Patron Rutin',
    aktif: true,
    uniqueId: true,
    keterangan: 'Dharma patron donasi rutin bulanan',
  },
  {
    id: 'jgf-6',
    namaJenisGroup: 'Funneling Umum',
    aktif: true,
    uniqueId: false,
    keterangan: 'Partisipan dan publik umum',
  },
  {
    id: 'jgf-7',
    namaJenisGroup: 'Group Promosi 2020',
    aktif: false,
    uniqueId: false,
    keterangan: 'Group promosi tahun 2020 (arsip/tidak aktif)',
  },
];

const DUMMY_600_IDS_A = Array.from({ length: 600 }, (_, i) => `id-grpA-${i + 1}`);
const DUMMY_300_IDS_B = Array.from({ length: 300 }, (_, i) => `id-grpB-${i + 1}`);
const DUMMY_50_IDS_RELAWAN = Array.from({ length: 50 }, (_, i) => `id-relawan-${i + 1}`);
const DUMMY_100_IDS_C = Array.from({ length: 100 }, (_, i) => `id-grpC-${i + 1}`);

export const INITIAL_FUNNELING_GROUPS: FunnelingGroupCard[] = [
  {
    id: 'grp-a',
    name: 'Group A',
    count: 600,
    countLabel: '600 orang',
    icon: 'cart',
    jenisGroup: 'Funneling Donasi',
    identitasIds: DUMMY_600_IDS_A,
    aktif: true,
  },
  {
    id: 'grp-b',
    name: 'Group B',
    count: 300,
    countLabel: '300 orang',
    icon: 'globe',
    jenisGroup: 'Funneling Donasi',
    identitasIds: DUMMY_300_IDS_B,
    aktif: true,
  },
  {
    id: 'grp-donasi-a',
    name: 'Funneling Donasi A',
    count: 1,
    countLabel: '1 orang',
    icon: 'cart',
    jenisGroup: 'Funneling Donasi',
    identitasIds: ['id-1'],
    aktif: true,
  },
  {
    id: 'grp-relawan-1',
    name: 'Group Relawan S-SEBAR',
    count: 50,
    countLabel: '50 orang',
    icon: 'globe',
    jenisGroup: 'Funneling Relawan / S-SEBAR',
    identitasIds: DUMMY_50_IDS_RELAWAN,
    aktif: true,
  },
  {
    id: 'grp-c',
    name: 'Group C',
    count: 100,
    countLabel: '100 orang',
    icon: 'globe',
    jenisGroup: 'Group Promosi 2020',
    identitasIds: DUMMY_100_IDS_C,
    aktif: false,
  },
  {
    id: 'grp-pm-1',
    name: 'Group PM Sejahtera',
    count: 35,
    countLabel: '35 orang',
    icon: 'globe',
    jenisGroup: 'Funneling Penerima Manfaat (PM)',
    identitasIds: [],
    aktif: true,
  },
  {
    id: 'grp-baru-1',
    name: 'Group Onboarding Baru',
    count: 20,
    countLabel: '20 orang',
    icon: 'cart',
    jenisGroup: 'Funneling Anggota Baru',
    identitasIds: [],
    aktif: true,
  },
  {
    id: 'grp-patron-1',
    name: 'Group Patron Rutin',
    count: 45,
    countLabel: '45 orang',
    icon: 'cart',
    jenisGroup: 'Funneling Patron Rutin',
    identitasIds: [],
    aktif: true,
  },
  {
    id: 'grp-umum-1',
    name: 'Group Publik Umum',
    count: 80,
    countLabel: '80 orang',
    icon: 'globe',
    jenisGroup: 'Funneling Umum',
    identitasIds: [],
    aktif: true,
  },
];

export const INITIAL_FUNNELING_MEMBERS: FunnelingMemberItem[] = [
  {
    id: 'fn-1',
    identitasId: 'id-1',
    codeId: '00031',
    nama: 'Agustino Ong',
    namaPanggilan: 'Ko Agus',
    avatarInitial: 'A',
    avatarBg: 'bg-[#14b8a6]', // Teal/Green as in image
    groupA: true,
    groupB: false,
    category: 'All',
    jenisGroup: 'Funneling Donasi',
    groupNames: ['Group A'],
  },
  {
    id: 'fn-2',
    identitasId: 'id-3',
    codeId: '00019',
    nama: 'Cindy Budiman',
    namaPanggilan: 'Ci Pao',
    avatarInitial: 'C',
    avatarBg: 'bg-[#eab308]', // Yellow
    groupA: true,
    groupB: true,
    category: 'All',
    jenisGroup: 'Funneling Donasi',
    groupNames: ['Group A', 'Group B'],
  },
  {
    id: 'fn-3',
    identitasId: 'id-5',
    codeId: '00018',
    nama: 'Silvia Fukada',
    namaPanggilan: 'Ci Silvia',
    avatarInitial: 'S',
    avatarBg: 'bg-[#64748b]', // Slate
    groupA: true,
    groupB: false,
    category: 'All',
    jenisGroup: 'Funneling Donasi',
    groupNames: ['Group A'],
  },
  {
    id: 'fn-4',
    identitasId: 'id-4',
    codeId: '00800',
    nama: 'Bhadra Ksanti',
    namaPanggilan: 'Sucek Shi Xian Jen',
    avatarInitial: 'B',
    avatarBg: 'bg-[#0f766e]', // Dark teal
    groupA: false,
    groupB: true,
    category: 'Funneling Donasi',
    jenisGroup: 'Funneling Donasi',
    groupNames: ['Group B'],
  },
];

const STORAGE_KEY_MEMBERS = 'yppln_funneling_members_v1';
const STORAGE_KEY_GROUPS = 'yppln_funneling_groups_v1';
const STORAGE_KEY_JENIS_GROUP = 'yppln_funneling_jenis_group_v1';

export function loadJenisGroupFunneling(): JenisGroupFunnelingItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_JENIS_GROUP);
    if (!data) {
      saveJenisGroupFunneling(INITIAL_JENIS_GROUP_FUNNELING);
      return INITIAL_JENIS_GROUP_FUNNELING;
    }
    const parsed: JenisGroupFunnelingItem[] = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure Group Donasi & Group Promosi 2020 exist
      let updated = [...parsed];
      let changed = false;
      INITIAL_JENIS_GROUP_FUNNELING.forEach((init) => {
        if (!updated.some((item) => item.namaJenisGroup.toLowerCase() === init.namaJenisGroup.toLowerCase())) {
          updated.push(init);
          changed = true;
        }
      });
      if (changed) {
        saveJenisGroupFunneling(updated);
      }
      return updated;
    }
    return INITIAL_JENIS_GROUP_FUNNELING;
  } catch (err) {
    console.warn('Error loading jenis group funneling:', err);
    return INITIAL_JENIS_GROUP_FUNNELING;
  }
}

export function saveJenisGroupFunneling(items: JenisGroupFunnelingItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_JENIS_GROUP, JSON.stringify(items));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('funneling_data_changed'));
    }
  } catch (err) {
    console.warn('Error saving jenis group funneling:', err);
  }
}

export function loadFunnelingMembers(): FunnelingMemberItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_MEMBERS);
    if (!data) {
      saveFunnelingMembers(INITIAL_FUNNELING_MEMBERS);
      return INITIAL_FUNNELING_MEMBERS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FUNNELING_MEMBERS;
  } catch (err) {
    console.warn('Error loading funneling members:', err);
    return INITIAL_FUNNELING_MEMBERS;
  }
}

export function saveFunnelingMembers(items: FunnelingMemberItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(items));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('funneling_data_changed'));
    }
  } catch (err) {
    console.warn('Error saving funneling members:', err);
  }
}

export function loadFunnelingGroups(): FunnelingGroupCard[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_GROUPS);
    if (!data) {
      saveFunnelingGroups(INITIAL_FUNNELING_GROUPS);
      return INITIAL_FUNNELING_GROUPS;
    }
    const parsed: FunnelingGroupCard[] = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      let updated = [...parsed];
      let changed = false;
      INITIAL_FUNNELING_GROUPS.forEach((init) => {
        const existing = updated.find((g) => g.name.toLowerCase() === init.name.toLowerCase());
        if (!existing) {
          updated.push(init);
          changed = true;
        } else {
          if (existing.name === 'Group A' && existing.count === 100) {
            existing.count = 600;
            existing.countLabel = '600 orang';
            existing.identitasIds = DUMMY_600_IDS_A;
            changed = true;
          }
          if (existing.name === 'Group B' && existing.count === 100) {
            existing.count = 300;
            existing.countLabel = '300 orang';
            existing.identitasIds = DUMMY_300_IDS_B;
            changed = true;
          }
        }
      });
      if (changed) {
        saveFunnelingGroups(updated);
      }
      return updated;
    }
    return INITIAL_FUNNELING_GROUPS;
  } catch (err) {
    console.warn('Error loading funneling groups:', err);
    return INITIAL_FUNNELING_GROUPS;
  }
}

export function saveFunnelingGroups(items: FunnelingGroupCard[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_GROUPS, JSON.stringify(items));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('funneling_data_changed'));
    }
  } catch (err) {
    console.warn('Error saving funneling groups:', err);
  }
}

/**
 * Real-time calculate number of Identitas IDs joined in a funneling group
 */
export function countIdentitasInGroup(
  group: FunnelingGroupCard,
  members: FunnelingMemberItem[] = []
): number {
  const ids = new Set<string>();
  if (group.identitasIds && Array.isArray(group.identitasIds)) {
    group.identitasIds.forEach((id) => {
      if (id && id.trim()) ids.add(id.trim());
    });
  }
  members.forEach((m) => {
    const isInGroup =
      (m.groupNames && m.groupNames.includes(group.name)) ||
      (group.name === 'Group A' && m.groupA) ||
      (group.name === 'Group B' && m.groupB);
    if (isInGroup) {
      const idVal = m.identitasId || m.codeId || m.id;
      if (idVal) ids.add(idVal);
    }
  });

  if (ids.size > 0) return ids.size;
  return group.count ?? 0;
}
