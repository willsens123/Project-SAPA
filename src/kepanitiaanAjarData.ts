import { IdentitasItem, INITIAL_IDENTITAS } from './identitasData';

export type TingkatJabatan = 'pimpinan' | 'divisi' | 'staff';

export interface PanitiaNode {
  id: string;
  posisi: string;
  divisi: string;
  tingkat: TingkatJabatan;
  parentId?: string | null;
  identitasId?: string; // id from IdentitasItem
  identitasIds?: string[]; // multiple people assigned to this role
  tugasDanTanggungJawab?: string;
}

export const DIVISI_PRESETS = [
  'Pimpinan Inti',
  'Divisi Acara',
  'Divisi Kesekretariatan',
  'Divisi Konsumsi',
  'Divisi Publikasi & Desain',
  'Divisi Logistik & Perlengkapan',
  'Divisi Dana & Hubungan Umat',
];

export const getDefaultKepanitiaanNodes = (_eventName: string): PanitiaNode[] => {
  // Find Agustino Ong (codeId 00031) as shown in the screenshot
  const agus = INITIAL_IDENTITAS.find(
    (i) => i.codeId === '00031' || i.namaLengkap.includes('Agustino')
  );
  const agusId = agus ? agus.id : 'id-1';

  return [
    // 1. Top Level: Ketua Panitia
    {
      id: 'panitia-node-1',
      posisi: 'Ketua Panitia',
      divisi: 'Pimpinan Inti',
      tingkat: 'pimpinan',
      parentId: null,
      identitasId: agusId,
      identitasIds: [agusId],
      tugasDanTanggungJawab:
        'Bertanggung jawab penuh atas keseluruhan perencanaan dan pelaksanaan acara.',
    },
    // 2. Wakil Ketua
    {
      id: 'panitia-node-2',
      posisi: 'Wakil Ketua',
      divisi: 'Pimpinan Inti',
      tingkat: 'pimpinan',
      parentId: 'panitia-node-1',
      identitasId: agusId,
      identitasIds: [agusId],
      tugasDanTanggungJawab:
        'Membantu ketua dan mengoordinasikan operasional lintas divisi.',
    },
    // 3. Sekertaris
    {
      id: 'panitia-node-3',
      posisi: 'Sekertaris',
      divisi: 'Divisi Kesekretariatan',
      tingkat: 'divisi',
      parentId: 'panitia-node-2',
      identitasId: agusId,
      identitasIds: [agusId],
      tugasDanTanggungJawab:
        'Mengelola administrasi kepanitiaan, surat-menyurat, dan koordinasi internal.',
    },
    // 4. Koordinator Acara
    {
      id: 'panitia-node-4',
      posisi: 'Koordinator Acara',
      divisi: 'Divisi Acara',
      tingkat: 'divisi',
      parentId: 'panitia-node-2',
      identitasId: agusId,
      identitasIds: [agusId],
      tugasDanTanggungJawab:
        'Menyusun rundown acara, briefing pembicara, dan kelancaran sesi materi.',
    },
    // 5. Staff Acara (under Koordinator Acara)
    {
      id: 'panitia-node-5',
      posisi: 'Staff Acara',
      divisi: 'Divisi Acara',
      tingkat: 'staff',
      parentId: 'panitia-node-4',
      identitasId: agusId,
      identitasIds: [agusId, agusId],
      tugasDanTanggungJawab:
        'Pelaksana teknis rundown, moderator, dan pendamping peserta.',
    },
  ];
};

const STORAGE_PREFIX = 'yppln_kepanitiaan_ajar_';

export const loadStrukturKepanitiaan = (eventId: string, eventName: string): PanitiaNode[] => {
  try {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}${eventId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Fix legacy initial data where Sekertaris and Koordinator were incorrectly siblings of Wakil Ketua under Ketua Panitia
        const hasNode2 = parsed.some(
          (n: PanitiaNode) => n.id === 'panitia-node-2' && n.posisi.toLowerCase().includes('wakil')
        );
        if (hasNode2) {
          const migrated = parsed.map((n: PanitiaNode) => {
            if (
              (n.id === 'panitia-node-3' || n.id === 'panitia-node-4') &&
              n.parentId === 'panitia-node-1'
            ) {
              return { ...n, parentId: 'panitia-node-2' };
            }
            return n;
          });
          return migrated;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading struktur kepanitiaan:', e);
  }
  return getDefaultKepanitiaanNodes(eventName);
};

export const saveStrukturKepanitiaan = (eventId: string, nodes: PanitiaNode[]): void => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${eventId}`, JSON.stringify(nodes));
  } catch (e) {
    console.error('Error saving struktur kepanitiaan:', e);
  }
};
