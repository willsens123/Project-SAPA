export interface AgenResiItem {
  id: string;
  namaAgen: string;
  organisasiId: string; // Connected to Organisasi
  picIdentitasId: string; // Connected to Identitas
  isiEkspedisi: string;
  keterangan: string;
}

export const AGEN_RESI_STORAGE_KEY = 'proyek_sapa_agen_resi_v1';

export const INITIAL_AGEN_RESI_LIST: AgenResiItem[] = [
  {
    id: 'agen-1',
    namaAgen: 'Lion Jurang',
    organisasiId: 'org-1', // Perusahaan A
    picIdentitasId: 'id-3', // 00019 Cindy Budiman
    isiEkspedisi: 'Lion, Wahana',
    keterangan: '-',
  },
];

export function loadAgenResiItems(): AgenResiItem[] {
  try {
    const saved = localStorage.getItem(AGEN_RESI_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (_) {}
  return INITIAL_AGEN_RESI_LIST;
}

export function saveAgenResiItems(items: AgenResiItem[]): void {
  try {
    localStorage.setItem(AGEN_RESI_STORAGE_KEY, JSON.stringify(items));
  } catch (_) {}
}
