export interface FaqItem {
  id: string;
  tentang: string;
  proyekId?: string;
  isProyekSapa?: boolean;
  pertanyaan: string;
  jawaban: string;
  keterangan?: string;
  createdAt?: string;
}

export interface TentangFaqItem {
  id: string;
  tentang: string;
  keterangan?: string;
}

export const INITIAL_TENTANG_FAQ_LIST: TentangFaqItem[] = [
  { id: 'tf-1', tentang: 'LAMRIM', keterangan: '-' },
  { id: 'tf-2', tentang: 'YPPLN', keterangan: '-' },
  { id: 'tf-3', tentang: 'YPPLN dan KCI', keterangan: '-' },
  { id: 'tf-4', tentang: 'FUN', keterangan: '-' },
  { id: 'tf-5', tentang: 'MAD', keterangan: '-' },
];

export const INITIAL_FAQ_LIST: FaqItem[] = [
  {
    id: 'faq-1',
    tentang: 'LAMRIM',
    pertanyaan: 'Apa itu Lamrim?',
    jawaban: `Lamrim secara harfiah berarti ‘Tahapan Jalan Menuju Pencerahan’. Ajaran ini berasal dari karya Guru Atisha yang berjudul Bodhipatapradipam atau  Pelita Sang Jalan Menuju Pencerahan yang berisi intisari semua kitab ajaran Buddha yang lengkap dan disusun secara sistematis sehingga mudah dipahami.`,
    createdAt: '15 Nov 2021',
  },
  {
    id: 'faq-2',
    tentang: 'YPPLN',
    pertanyaan: 'Apa saja kegiatan YPPLN?',
    jawaban: `Kegiatan YPPLN meliputi penyelenggaraan retret dan pengajaran Lamrim oleh guru-guru silsilah Lamrim yang otentik, penerbitan buku-buku Lamrim, penyebaran transkrip ajaran, serta kampanye untuk memperkenalkan Lamrim kepada masyarakat umum.`,
    createdAt: '15 Nov 2021',
  },
  {
    id: 'faq-3',
    tentang: 'YPPLN dan KCI',
    pertanyaan: 'Apakah YPPLN memiliki kaitan dengan KCI?',
    jawaban: `YPPLN dan KCI memiliki guru pembimbing utama yang sama, yaitu Yang Mulia Dagpo Rinpoche. YPPLN juga sedang bekerja sama dengan KCI untuk menyelenggarakan rangkaian pengajaran Lamrim oleh Yang MuliaDrepung Tripa Khenzur Rinpoche selama bulan Maret.`,
    createdAt: '15 Nov 2021',
  },
  {
    id: 'faq-4',
    tentang: 'FUN',
    pertanyaan: 'Apa itu Dharma Patron?',
    jawaban: `Dharma Patron: Dharma Patron adalah program penyokongan biaya seluruh aktivitas Lamrimnesia untuk pelestarian dan pengembangan Buddha Dharma di Nusantara. Untuk programnya bisa rutin atau bisa sesekali.`,
    createdAt: '15 Nov 2021',
  },
  {
    id: 'faq-5',
    tentang: 'MAD',
    pertanyaan: 'Apakah ada tata cara penulisan yang harus diikuti?',
    jawaban: `Ada. Kami akan menyediakan istilah-istilah untuk memastikan terjemahan yang Anda pilih sesuai dengan definisinya dan cara penulisan judul teks yang benar. Selain itu, hal ini untuk menjaga konsistensi pada karya yang dihasilkan.`,
    createdAt: '15 Nov 2021',
  },
  {
    id: 'faq-6',
    tentang: 'Stand Vihara Buddhayana',
    proyekId: 'proj-3',
    isProyekSapa: true,
    pertanyaan: 'Kapan jadwal penjagaan Stand di Vihara Buddhayana?',
    jawaban: 'Stand dibuka pada tanggal 15 November 2021 mulai pukul 08.00 hingga 16.00 WIB bersama tim relawan MAD.',
    createdAt: '15 Nov 2021',
  },
  {
    id: 'faq-7',
    tentang: 'Promo 11.11',
    proyekId: 'proj-1',
    isProyekSapa: true,
    pertanyaan: 'Berapa diskon buku selama event Promo 11.11?',
    jawaban: 'Diskon khusus 20% untuk semua buku terbitan Lamrimnesia selama periode 11 November 2021.',
    createdAt: '11 Nov 2021',
  },
];

const FAQ_STORAGE_KEY = 'sapa_faq_data_v1';
const TENTANG_FAQ_STORAGE_KEY = 'sapa_tentang_faq_data_v1';

export function loadFaqList(): FaqItem[] {
  try {
    const raw = localStorage.getItem(FAQ_STORAGE_KEY);
    if (!raw) {
      saveFaqList(INITIAL_FAQ_LIST);
      return INITIAL_FAQ_LIST;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_FAQ_LIST;
  } catch (e) {
    console.error('Failed to load FAQ list', e);
    return INITIAL_FAQ_LIST;
  }
}

export function saveFaqList(items: FaqItem[]): void {
  try {
    localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save FAQ list', e);
  }
}

export function loadTentangFaqList(): TentangFaqItem[] {
  try {
    const raw = localStorage.getItem(TENTANG_FAQ_STORAGE_KEY);
    if (!raw) {
      saveTentangFaqList(INITIAL_TENTANG_FAQ_LIST);
      return INITIAL_TENTANG_FAQ_LIST;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_TENTANG_FAQ_LIST;
  } catch (e) {
    console.error('Failed to load Tentang FAQ list', e);
    return INITIAL_TENTANG_FAQ_LIST;
  }
}

export function saveTentangFaqList(items: TentangFaqItem[]): void {
  try {
    localStorage.setItem(TENTANG_FAQ_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save Tentang FAQ list', e);
  }
}
