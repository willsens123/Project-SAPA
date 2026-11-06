export interface PercetakanSalurItem {
  id: string;
  namaPercetakan: string;
  kontak: string;
  telepon: string;
  alamat: string;
  keterangan: string;
  createdAt: string;
}

export const PERCETAKAN_SALUR_STORAGE_KEY = 'yppln_percetakan_salur_data';

export const INITIAL_PERCETAKAN_SALUR: PercetakanSalurItem[] = [
  {
    id: 'percetakan-1',
    namaPercetakan: 'Percetakan Surya Gemilang',
    kontak: 'Bpk. Surya Santoso',
    telepon: '0812-3456-7890',
    alamat: 'Jl. Percetakan Negara No. 45, Jakarta Pusat',
    keterangan: 'Spesialis cetak buku saku & soft cover',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'percetakan-2',
    namaPercetakan: 'Percetakan Gramedia',
    kontak: 'Ibu Ratna Dewi',
    telepon: '0813-8899-1122',
    alamat: 'Jl. Palmerah Selatan No. 22-28, Jakarta Barat',
    keterangan: 'Pencetakan skala besar offset berkualitas tinggi',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'percetakan-3',
    namaPercetakan: 'Percetakan Bintang Offset',
    kontak: 'Bpk. Hendra Gunawan',
    telepon: '0818-7766-3344',
    alamat: 'Kawasan Industri Pulo Gadung Blok B-12, Jakarta Timur',
    keterangan: 'Pencetakan kalender, poster dharma, & booklet',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'percetakan-4',
    namaPercetakan: 'Percetakan Kanisius',
    kontak: 'Bpk. FX Yohanes',
    telepon: '0274-888-999',
    alamat: 'Jl. Cempaka 9, Deresan, DIY Yogyakarta',
    keterangan: 'Penerbit & percetakan buku filosofi & teks klasik',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'percetakan-5',
    namaPercetakan: 'Percetakan Mandiri Jaya',
    kontak: 'Ibu Siska Utami',
    telepon: '0819-2233-4455',
    alamat: 'Jl. Soekarno-Hatta No. 120, Bandung',
    keterangan: 'Mitra cetak buku hard cover jilid benang & jilid lem',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'percetakan-6',
    namaPercetakan: 'Percetakan Grafika Indah',
    kontak: 'Bpk. Anton Hartono',
    telepon: '0811-3322-1100',
    alamat: 'Jl. Margomulyo Indah Blok C-5, Surabaya',
    keterangan: 'Pencetakan buku berukuran khusus & sutra lipat',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'percetakan-7',
    namaPercetakan: 'Percetakan Dian Rakyat',
    kontak: 'Ibu Melani Subagio',
    telepon: '0815-9988-7766',
    alamat: 'Jl. Rawa Gelam I No. 4, Kawasan Industri Pulogadung',
    keterangan: 'Pencetakan buku teks, kamus, & literatur Buddhis',
    createdAt: '15 Nov 2021',
  },
];

export function getStoredPercetakanSalur(): PercetakanSalurItem[] {
  try {
    const saved = localStorage.getItem(PERCETAKAN_SALUR_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored PercetakanSalur:', e);
  }
  return INITIAL_PERCETAKAN_SALUR;
}

export function saveStoredPercetakanSalur(items: PercetakanSalurItem[]): void {
  try {
    localStorage.setItem(PERCETAKAN_SALUR_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving PercetakanSalur:', e);
  }
}

export function addPercetakanSalur(
  item: Omit<PercetakanSalurItem, 'id' | 'createdAt'> & { createdAt?: string }
): PercetakanSalurItem {
  const current = getStoredPercetakanSalur();
  const newItem: PercetakanSalurItem = {
    id: `percetakan-${Date.now()}`,
    createdAt: item.createdAt || '15 Nov 2021',
    ...item,
  };
  const updated = [newItem, ...current];
  saveStoredPercetakanSalur(updated);
  return newItem;
}

export function updatePercetakanSalur(item: PercetakanSalurItem): void {
  const current = getStoredPercetakanSalur();
  const updated = current.map((x) => (x.id === item.id ? item : x));
  saveStoredPercetakanSalur(updated);
}

export function deletePercetakanSalur(id: string): void {
  const current = getStoredPercetakanSalur();
  const updated = current.filter((x) => x.id !== id);
  saveStoredPercetakanSalur(updated);
}
