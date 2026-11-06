export interface QuickReplyItem {
  id: string;
  tentang: string;
  quickReply: string;
  gambar?: string;
  isiTeks: string;
  createdAt?: string;
}

export const INITIAL_QUICK_REPLY_LIST: QuickReplyItem[] = [
  {
    id: 'qr-1',
    tentang: 'STORE',
    quickReply: '/STOREorder',
    gambar: '',
    isiTeks: `Untuk data pengiriman, apakah bisa dibantu untuk melengkapi data dibawah ini:
Nama:
Nomor HP:
Email:
Alamat Lengkap:
Kode Pos:`,
    createdAt: '15 Nov 2021',
  },
  {
    id: 'qr-2',
    tentang: 'STORE',
    quickReply: '/STORErek',
    gambar: '',
    isiTeks: `Dana untuk mengundang buku dapat disalurkan via transfer
ke rek BCA no. 0077119888 a.n. Yayasan Pelestarian dan Pengembangan Lamrim Nusantara.
Setelah transfer mohon konfirmasikan ke nomor ini.`,
    createdAt: '15 Nov 2021',
  },
  {
    id: 'qr-3',
    tentang: 'STORE',
    quickReply: '/STOREmasuk pembayaran',
    gambar: '',
    isiTeks: `Baik, terima kasih telah mengundang buku di Lamrimnesia.
Pesanan Anda akan kami kirim secepatnya. Mohon menunggu. 🙏`,
    createdAt: '15 Nov 2021',
  },
  {
    id: 'qr-4',
    tentang: 'Dharma Patron',
    quickReply: '/patronmasukdpr',
    gambar: '',
    isiTeks: `*Konfirmasi dana Dharma Patron Rutin* Anda adalah sebagai berikut:
Format: DP Rutin/Nama Donatur/Nama Rekening/Nominal Donasi/Tgl Transaksi/bln komitmen/Pelimpahan Jasa`,
    createdAt: '15 Nov 2021',
  },
  {
    id: 'qr-5',
    tentang: 'Dharma Patron',
    quickReply: '/patronmudita',
    gambar: '',
    isiTeks: `Turut bermudita atas kontribusi *DHARMA PATRON* Anda dalam pelestarian dan perkembangan Buddhadharma di Nusantara. 😍🙏
Alokasi donasi:
1) Buku Dharma (*S* ALUR)
2) Kegiatan Dharma (*A* JAR & *P* ROMOSI)
3) Mobilisasi Relawan & Operasional (*P* ROMOSI & *A* JAK)`,
    createdAt: '15 Nov 2021',
  },
];

export const TENTANG_OPTIONS = [
  'STORE',
  'Dharma Patron',
  'Lamrimnesia',
  'Ajar',
  'Salur',
  'Donasi',
  'Relawan',
  'Umum',
];

const QUICK_REPLY_STORAGE_KEY = 'sapa_quick_reply_data_v1';

export function loadQuickReplyList(): QuickReplyItem[] {
  try {
    const raw = localStorage.getItem(QUICK_REPLY_STORAGE_KEY);
    if (!raw) {
      saveQuickReplyList(INITIAL_QUICK_REPLY_LIST);
      return INITIAL_QUICK_REPLY_LIST;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_QUICK_REPLY_LIST;
  } catch (e) {
    console.error('Failed to load quick reply list from storage', e);
    return INITIAL_QUICK_REPLY_LIST;
  }
}

export function saveQuickReplyList(items: QuickReplyItem[]): void {
  try {
    localStorage.setItem(QUICK_REPLY_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save quick reply list to storage', e);
  }
}
