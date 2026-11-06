import { ListPMItem, ListPMDetailRow } from './types';
import { IdentitasItem, INITIAL_IDENTITAS } from './identitasData';

const STORAGE_KEY = 'sapa_list_pm_data_v2';

export const INITIAL_LIST_PM: ListPMItem[] = [
  {
    id: 'pm-1',
    proyekSapa: 'Kirim Resi',
    proyekKode: 'MAD',
    iconType: 'package',
    targetType: 'multiple',
    targetCount: 10,
    targetAvatars: [
      { initial: 'H', bg: 'bg-[#d94819]' },
      { initial: 'T', bg: 'bg-[#d9659b]' },
      { initial: '+', bg: 'bg-[#2295d8]' },
    ],
    deadline: '-',
    deadlineColor: 'teal',
    progressPercent: 10,
    statusBisaPM: 'sudah',
    tanggalMulaiPM: '10 Nov 2021',
    templatePesan:
      'Namo Buddhaya {Nama},\n\nTerima kasih banyak atas partisipasinya dalam Proyek SAPA ({ProyekKode}). Paket Buku "{ItemTitle}" sedang dalam proses pengiriman dengan No. Resi: SAPA-MAD-98214.\n\nAnda dapat melacak status paket melalui link berikut: https://sapa.org/resi/SAPA-MAD-98214\n\nSemoga kebajikan ini membawa kebahagiaan bagi Anda dan keluarga. 🙏',
    detailBadge: {
      label: 'Kirim Resi',
      countText: '10 buah',
    },
    detailRows: [
      {
        id: 'dr-1-cindy',
        deadline: '16 Nov 2021',
        identitasId: 'id-3',
        codeId: '00019',
        nama: 'Cindy Budiman',
        nomorHp: '08123456789',
        avatarInitial: 'C',
        avatarBg: 'bg-[#008d91]',
        proyekSapa: 'Tanda Terima Dharma Patron',
        proyekKode: 'MAD',
        templateName: 'Template MAD',
        templateContent:
          'Namo Buddhaya Cindy Budiman,\n\nTerima kasih banyak atas partisipasinya dalam Proyek SAPA (MAD). Buku "Empat Segel Agung" telah kami siapkan sebagai Tanda Terima Dharma Patron, MAD - 2021. Semoga kebajikan ini membawa kebahagiaan bagi Anda dan keluarga. 🙏',
        itemTitle: 'Empat Segel Agung',
        itemSubtitle: 'Tanda Terima Dharma Patron, MAD - 2021',
        itemStock: 'Stok: 100',
        status: 'done_gray',
        sentAt: '16 Nov 2021 10:30',
      },
      {
        id: 'dr-1-1',
        deadline: '16 Nov 2021',
        identitasId: 'id-1',
        codeId: '00031',
        nama: 'Agustino Ong',
        nomorHp: '081234567898',
        avatarInitial: 'A',
        avatarBg: 'bg-[#00a89d]',
        templateName: 'Template A',
        templateContent:
          'Namo Buddhaya Agustino Ong,\n\nTerima kasih banyak atas partisipasinya dalam Proyek SAPA (MAD). Paket Buku "Jalan Menuju Kemahatahuan" telah kami kirimkan dengan No. Resi: SAPA-MAD-98214. Semoga bermanfaat. 🙏',
        itemTitle: 'Jalan Menuju Kemahatahuan',
        itemSubtitle: 'Buku Berbayar, BJM - 2021',
        itemStock: 'Stok: 100',
        status: 'done_teal',
        sentAt: '15 Nov 2021 09:12',
      },
      {
        id: 'dr-1-2',
        deadline: '16 Nov 2021',
        identitasId: 'id-2',
        codeId: '00035',
        nama: 'Hendra Tanujaya',
        nomorHp: '081398765432',
        avatarInitial: 'H',
        avatarBg: 'bg-[#d94819]',
        templateName: 'Template A',
        templateContent:
          'Namo Buddhaya Hendra Tanujaya,\n\nTerima kasih banyak atas partisipasinya dalam Proyek SAPA (MAD). Paket Buku "Jalan Menuju Kemahatahuan" sedang dalam proses pengiriman. Semoga bermanfaat. 🙏',
        itemTitle: 'Jalan Menuju Kemahatahuan',
        itemSubtitle: 'Buku Berbayar, BJM - 2021',
        itemStock: 'Stok: 100',
        status: 'pending',
      },
      {
        id: 'dr-1-3',
        deadline: '16 Nov 2021',
        identitasId: 'id-3',
        codeId: '00042',
        nama: 'Teresa Lim',
        nomorHp: '081122334455',
        avatarInitial: 'T',
        avatarBg: 'bg-[#d9659b]',
        templateName: 'Template A',
        templateContent:
          'Namo Buddhaya Teresa Lim,\n\nTerima kasih banyak atas partisipasinya dalam Proyek SAPA (MAD). Paket Buku "Jalan Menuju Kemahatahuan" sedang dalam proses pengiriman. Semoga bermanfaat. 🙏',
        itemTitle: 'Jalan Menuju Kemahatahuan',
        itemSubtitle: 'Buku Berbayar, BJM - 2021',
        itemStock: 'Stok: 100',
        status: 'pending',
      },
      {
        id: 'dr-1-4',
        deadline: '16 Nov 2021',
        identitasId: 'id-4',
        codeId: '00055',
        nama: 'Budi Santoso',
        nomorHp: '085712345678',
        avatarInitial: 'B',
        avatarBg: 'bg-[#0f8b8d]',
        templateName: 'Template A',
        templateContent:
          'Namo Buddhaya Budi Santoso,\n\nTerima kasih banyak atas partisipasinya dalam Proyek SAPA (MAD). Paket Buku "Jalan Menuju Kemahatahuan" sedang dalam proses pengiriman. Semoga bermanfaat. 🙏',
        itemTitle: 'Jalan Menuju Kemahatahuan',
        itemSubtitle: 'Buku Berbayar, BJM - 2021',
        itemStock: 'Stok: 100',
        status: 'pending',
      },
      {
        id: 'dr-1-5',
        deadline: '16 Nov 2021',
        identitasId: 'id-5',
        codeId: '00063',
        nama: 'Willy Wijaya',
        nomorHp: '087812349988',
        avatarInitial: 'W',
        avatarBg: 'bg-[#7a8a68]',
        templateName: 'Template A',
        templateContent:
          'Namo Buddhaya Willy Wijaya,\n\nTerima kasih banyak atas partisipasinya dalam Proyek SAPA (MAD). Paket Buku "Jalan Menuju Kemahatahuan" sedang dalam proses pengiriman. Semoga bermanfaat. 🙏',
        itemTitle: 'Jalan Menuju Kemahatahuan',
        itemSubtitle: 'Buku Berbayar, BJM - 2021',
        itemStock: 'Stok: 100',
        status: 'pending',
      },
      {
        id: 'dr-1-6',
        deadline: '16 Nov 2021',
        identitasId: 'id-6',
        codeId: '00078',
        nama: 'Meiliana Chandra',
        nomorHp: '081299887766',
        avatarInitial: 'M',
        avatarBg: 'bg-[#2295d8]',
        templateName: 'Template A',
        templateContent:
          'Namo Buddhaya Meiliana Chandra,\n\nTerima kasih banyak atas partisipasinya dalam Proyek SAPA (MAD). Paket Buku "Jalan Menuju Kemahatahuan" sedang dalam proses pengiriman. Semoga bermanfaat. 🙏',
        itemTitle: 'Jalan Menuju Kemahatahuan',
        itemSubtitle: 'Buku Berbayar, BJM - 2021',
        itemStock: 'Stok: 100',
        status: 'pending',
      },
      {
        id: 'dr-1-7',
        deadline: '16 Nov 2021',
        identitasId: 'id-7',
        codeId: '00084',
        nama: 'Dewi Kurnia',
        nomorHp: '081377665544',
        avatarInitial: 'D',
        avatarBg: 'bg-[#e05d44]',
        templateName: 'Template A',
        templateContent:
          'Namo Buddhaya Dewi Kurnia,\n\nTerima kasih banyak atas partisipasinya dalam Proyek SAPA (MAD). Paket Buku "Jalan Menuju Kemahatahuan" sedang dalam proses pengiriman. Semoga bermanfaat. 🙏',
        itemTitle: 'Jalan Menuju Kemahatahuan',
        itemSubtitle: 'Buku Berbayar, BJM - 2021',
        itemStock: 'Stok: 100',
        status: 'pending',
      },
      {
        id: 'dr-1-8',
        deadline: '16 Nov 2021',
        identitasId: 'id-8',
        codeId: '00091',
        nama: 'Kevin Surya',
        nomorHp: '085611223344',
        avatarInitial: 'K',
        avatarBg: 'bg-[#00a89d]',
        templateName: 'Template A',
        templateContent:
          'Namo Buddhaya Kevin Surya,\n\nTerima kasih banyak atas partisipasinya dalam Proyek SAPA (MAD). Paket Buku "Jalan Menuju Kemahatahuan" sedang dalam proses pengiriman. Semoga bermanfaat. 🙏',
        itemTitle: 'Jalan Menuju Kemahatahuan',
        itemSubtitle: 'Buku Berbayar, BJM - 2021',
        itemStock: 'Stok: 100',
        status: 'pending',
      },
      {
        id: 'dr-1-9',
        deadline: '16 Nov 2021',
        identitasId: 'id-9',
        codeId: '00102',
        nama: 'Siti Rahmawati',
        nomorHp: '081833445566',
        avatarInitial: 'S',
        avatarBg: 'bg-[#d94819]',
        templateName: 'Template A',
        templateContent:
          'Namo Buddhaya Siti Rahmawati,\n\nTerima kasih banyak atas partisipasinya dalam Proyek SAPA (MAD). Paket Buku "Jalan Menuju Kemahatahuan" sedang dalam proses pengiriman. Semoga bermanfaat. 🙏',
        itemTitle: 'Jalan Menuju Kemahatahuan',
        itemSubtitle: 'Buku Berbayar, BJM - 2021',
        itemStock: 'Stok: 100',
        status: 'pending',
      },
      {
        id: 'dr-1-10',
        deadline: '16 Nov 2021',
        identitasId: 'id-10',
        codeId: '00118',
        nama: 'Rudy Hartono',
        nomorHp: '081255667788',
        avatarInitial: 'R',
        avatarBg: 'bg-[#2295d8]',
        templateName: 'Template A',
        templateContent:
          'Namo Buddhaya Rudy Hartono,\n\nTerima kasih banyak atas partisipasinya dalam Proyek SAPA (MAD). Paket Buku "Jalan Menuju Kemahatahuan" sedang dalam proses pengiriman. Semoga bermanfaat. 🙏',
        itemTitle: 'Jalan Menuju Kemahatahuan',
        itemSubtitle: 'Buku Berbayar, BJM - 2021',
        itemStock: 'Stok: 100',
        status: 'pending',
      },
    ],
    recipients: [
      {
        id: 'rec-1-cindy',
        identitasId: 'id-3',
        codeId: '00019',
        nama: 'Cindy Budiman',
        nomorHp: '08123456789',
        isSent: true,
        sentAt: '16 Nov 2021 10:30',
      },
      {
        id: 'rec-1-1',
        identitasId: 'id-1',
        codeId: '00031',
        nama: 'Agustino Ong',
        nomorHp: '081234567898',
        isSent: true,
        sentAt: '15 Nov 2021 09:12',
      },
      {
        id: 'rec-1-2',
        identitasId: 'id-2',
        codeId: '00035',
        nama: 'Hendra Tanujaya',
        nomorHp: '081398765432',
        isSent: false,
      },
      {
        id: 'rec-1-3',
        identitasId: 'id-3',
        codeId: '00042',
        nama: 'Teresa Lim',
        nomorHp: '081122334455',
        isSent: false,
      },
      {
        id: 'rec-1-4',
        identitasId: 'id-4',
        codeId: '00055',
        nama: 'Budi Santoso',
        nomorHp: '085712345678',
        isSent: false,
      },
      {
        id: 'rec-1-5',
        identitasId: 'id-5',
        codeId: '00063',
        nama: 'Willy Wijaya',
        nomorHp: '087812349988',
        isSent: false,
      },
      {
        id: 'rec-1-6',
        identitasId: 'id-6',
        codeId: '00078',
        nama: 'Meiliana Chandra',
        nomorHp: '081299887766',
        isSent: false,
      },
      {
        id: 'rec-1-7',
        identitasId: 'id-7',
        codeId: '00084',
        nama: 'Dewi Kurnia',
        nomorHp: '081377665544',
        isSent: false,
      },
      {
        id: 'rec-1-8',
        identitasId: 'id-8',
        codeId: '00091',
        nama: 'Kevin Surya',
        nomorHp: '085611223344',
        isSent: false,
      },
      {
        id: 'rec-1-9',
        identitasId: 'id-9',
        codeId: '00102',
        nama: 'Siti Rahmawati',
        nomorHp: '081833445566',
        isSent: false,
      },
      {
        id: 'rec-1-10',
        identitasId: 'id-10',
        codeId: '00118',
        nama: 'Rudy Hartono',
        nomorHp: '081255667788',
        isSent: false,
      },
    ],
    createdAt: '2021-11-10',
  },
  {
    id: 'pm-2',
    proyekSapa: 'Ajakan Event',
    proyekKode: 'EVE',
    iconType: 'rocket',
    targetType: 'multiple',
    targetCount: 30,
    targetAvatars: [
      { initial: 'W', bg: 'bg-[#7a8a68]' },
      { initial: 'B', bg: 'bg-[#0f8b8d]' },
      { initial: '+', bg: 'bg-[#2295d8]' },
    ],
    deadline: '16 Nov 2021',
    deadlineColor: 'red',
    progressPercent: 60,
    statusBisaPM: 'belum',
    tanggalMulaiPM: '15 Nov 2021',
    tanggalMulaiDihubungi: '15 Nov 2021',
    templatePesan:
      'Namo Buddhaya {Nama},\n\nKami mengundang Saudara/i terkasih untuk bergabung dalam kegiatan Event Amal SAPA ({ProyekKode}) yang akan diselenggarakan pada akhir pekan ini.\n\nInformasi & Konfirmasi: https://sapa.org/event-eve-2021\n\nKehadiran dan dukungan Saudara/i sangat berarti. Anumodana. 🙏',
    detailBadge: {
      label: 'Ajakan Event',
      countText: '30 peserta',
    },
    detailRows: [
      {
        id: 'dr-2-1',
        deadline: '16 Nov 2021',
        identitasId: 'id-5',
        codeId: '00063',
        nama: 'Willy Wijaya',
        nomorHp: '087812349988',
        avatarInitial: 'W',
        avatarBg: 'bg-[#7a8a68]',
        templateName: 'Template Event A',
        templateContent:
          'Namo Buddhaya Willy Wijaya,\n\nKami mengundang Saudara/i untuk hadir dalam Seminar Dharma & Meditasi Nusantara pada 20 Nov 2021. Konfirmasi kehadiran: https://sapa.org/event. Terima kasih! 🙏',
        itemTitle: 'Seminar Meditasi & Mindfulness',
        itemSubtitle: 'Event Terbuka, EVE - 2021',
        itemStock: 'Kuota: 50',
        status: 'done_teal',
        sentAt: '14 Nov 2021 10:15',
      },
      {
        id: 'dr-2-2',
        deadline: '16 Nov 2021',
        identitasId: 'id-4',
        codeId: '00055',
        nama: 'Budi Santoso',
        nomorHp: '085712345678',
        avatarInitial: 'B',
        avatarBg: 'bg-[#0f8b8d]',
        templateName: 'Template Event A',
        templateContent:
          'Namo Buddhaya Budi Santoso,\n\nKami mengundang Saudara/i untuk hadir dalam Seminar Dharma & Meditasi Nusantara pada 20 Nov 2021. Konfirmasi kehadiran: https://sapa.org/event. Terima kasih! 🙏',
        itemTitle: 'Seminar Meditasi & Mindfulness',
        itemSubtitle: 'Event Terbuka, EVE - 2021',
        itemStock: 'Kuota: 50',
        status: 'done_teal',
        sentAt: '14 Nov 2021 11:30',
      },
      {
        id: 'dr-2-3',
        deadline: '16 Nov 2021',
        identitasId: 'id-2',
        codeId: '00035',
        nama: 'Hendra Tanujaya',
        nomorHp: '081398765432',
        avatarInitial: 'H',
        avatarBg: 'bg-[#d94819]',
        templateName: 'Template Event A',
        templateContent:
          'Namo Buddhaya Hendra Tanujaya,\n\nKami mengundang Saudara/i untuk hadir dalam Seminar Dharma & Meditasi Nusantara pada 20 Nov 2021. Konfirmasi kehadiran: https://sapa.org/event. Terima kasih! 🙏',
        itemTitle: 'Seminar Meditasi & Mindfulness',
        itemSubtitle: 'Event Terbuka, EVE - 2021',
        itemStock: 'Kuota: 50',
        status: 'menolak',
      },
      {
        id: 'dr-2-4',
        deadline: '16 Nov 2021',
        identitasId: 'id-3',
        codeId: '00042',
        nama: 'Teresa Lim',
        nomorHp: '081122334455',
        avatarInitial: 'T',
        avatarBg: 'bg-[#d9659b]',
        templateName: 'Template Event A',
        templateContent:
          'Namo Buddhaya Teresa Lim,\n\nKami mengundang Saudara/i untuk hadir dalam Seminar Dharma & Meditasi Nusantara pada 20 Nov 2021. Konfirmasi kehadiran: https://sapa.org/event. Terima kasih! 🙏',
        itemTitle: 'Seminar Meditasi & Mindfulness',
        itemSubtitle: 'Event Terbuka, EVE - 2021',
        itemStock: 'Kuota: 50',
        status: 'pending',
      },
    ],
    recipients: Array.from({ length: 30 }, (_, i) => ({
      id: `rec-2-${i + 1}`,
      identitasId: `id-gen-${i + 1}`,
      codeId: `000${(20 + i).toString().padStart(2, '0')}`,
      nama: [
        'Willy Wijaya',
        'Budi Santoso',
        'Agustino Ong',
        'Hendra Tanujaya',
        'Teresa Lim',
        'Jessica Tan',
        'Raymond Tan',
        'Silvia Hartono',
        'Denny Setiawan',
        'Fanny Halim',
        'Gunawan Sasmita',
        'Hanny Wijaya',
        'Ivan Gunawan',
        'Jenny Suryadi',
        'Kurniawan Li',
        'Livia Chandra',
        'Michael Lie',
        'Novita Sari',
        'Oscar Pratama',
        'Patricia Dewi',
      ][i % 20] + (i >= 20 ? ` #${i + 1}` : ''),
      nomorHp: `0812${(10000000 + i * 12345).toString().slice(0, 8)}`,
      isSent: i < 18, // 18/30 = 60%
      sentAt: i < 18 ? '14 Nov 2021 14:20' : undefined,
    })),
    createdAt: '2021-11-12',
  },
  {
    id: 'pm-3',
    proyekSapa: 'Ajakan Donasi',
    proyekKode: 'FUN',
    iconType: 'creditCard',
    targetType: 'single',
    singleTarget: {
      identitasId: 'id-1',
      codeId: '00031',
      nama: 'Agustino Ong',
      nomorHp: '081234567898',
      avatarInitial: 'A',
      avatarBg: 'bg-[#14b8a6]',
    },
    deadline: '26 Nov 2021',
    deadlineColor: 'teal',
    progressPercent: 0,
    statusBisaPM: 'belum',
    tanggalMulaiPM: '15 Nov 2021',
    tanggalMulaiDihubungi: '15 Nov 2021',
    templatePesan:
      'Namo Buddhaya Bapak/Ibu {Nama} ({CodeID}),\n\nSemoga selalu dalam lindungan Tiratana. Kami dari Tim SAPA Fundraising ({ProyekKode}) ingin mengonfirmasikan program donasi rutin bulan ini.\n\nDonasi dapat disalurkan melalui Rekening BCA 123-456-7890 a/n Yayasan Dana SAPA.\n\nTerima kasih banyak atas kemurahan hati Bapak/Ibu. Sabbe satta bhavantu sukhitatta. 🙏',
    detailBadge: {
      label: 'Ajakan Donasi',
      countText: '1 donatur',
    },
    detailRows: [
      {
        id: 'dr-3-1',
        deadline: '26 Nov 2021',
        identitasId: 'id-1',
        codeId: '00031',
        nama: 'Agustino Ong',
        nomorHp: '081234567898',
        avatarInitial: 'A',
        avatarBg: 'bg-[#14b8a6]',
        templateName: 'Template Donasi Rutin',
        templateContent:
          'Namo Buddhaya Bapak/Ibu Agustino Ong (00031),\n\nKami mengonfirmasikan program donasi Dharma Patron Rutin bulan ini. Transfer dapat dilakukan ke Rek. BCA 123-456-7890 a/n SAPA. Anumodana. 🙏',
        itemTitle: 'Dharma Patron Rutin Bulanan',
        itemSubtitle: 'Paket Donasi Rutin, FUN - 2021',
        itemStock: 'Target: Rp 500.000',
        status: 'pending',
      },
    ],
    recipients: [
      {
        id: 'rec-3-1',
        identitasId: 'id-1',
        codeId: '00031',
        nama: 'Agustino Ong',
        nomorHp: '081234567898',
        isSent: false,
      },
    ],
    createdAt: '2021-11-13',
  },
  {
    id: 'pm-4',
    proyekSapa: 'Ajakan Penyaluran',
    proyekKode: 'MAD',
    iconType: 'shoppingCart',
    targetType: 'multiple',
    targetCount: 300,
    targetAvatars: [
      { initial: 'A', bg: 'bg-[#10b981]' },
      { initial: 'B', bg: 'bg-[#0d9488]' },
      { initial: '+', bg: 'bg-[#2295d8]' },
    ],
    deadline: '26 Nov 2021',
    deadlineColor: 'teal',
    progressPercent: 25,
    statusBisaPM: 'belum',
    tanggalMulaiPM: '15 Nov 2021',
    tanggalMulaiDihubungi: '15 Nov 2021',
    templatePesan:
      'Namo Buddhaya {Nama},\n\nKabar gembira! Penyaluran amanah donasi sembako & buku Dharma ({ProyekKode}) tahap ke-4 akan segera dilaksanakan di berbagai vihara & panti binaan.\n\nBagi Saudara/i yang ingin berpartisipasi langsung sebagai relawan lapangan, silakan konfirmasi melalui tautan: https://sapa.org/salur-mad-vol\n\nAnumodana. 🙏',
    detailBadge: {
      label: 'Ajakan Penyaluran',
      countText: '300 paket',
    },
    detailRows: [
      {
        id: 'dr-4-1',
        deadline: '26 Nov 2021',
        identitasId: 'id-1',
        codeId: '00031',
        nama: 'Agustino Ong',
        nomorHp: '081234567898',
        avatarInitial: 'A',
        avatarBg: 'bg-[#10b981]',
        templateName: 'Template Relawan A',
        templateContent:
          'Namo Buddhaya Agustino Ong,\n\nPenyaluran sembako & buku tahap 4 akan dilaksanakan akhir pekan ini. Terima kasih atas partisipasi aktif Anda. 🙏',
        itemTitle: 'Paket Sembako & Buku Dharma',
        itemSubtitle: 'Bakti Sosial Salur, MAD - 2021',
        itemStock: 'Stok: 300 paket',
        status: 'done_teal',
        sentAt: '12 Nov 2021 15:30',
      },
      {
        id: 'dr-4-2',
        deadline: '26 Nov 2021',
        identitasId: 'id-2',
        codeId: '00035',
        nama: 'Hendra Tanujaya',
        nomorHp: '081398765432',
        avatarInitial: 'H',
        avatarBg: 'bg-[#0d9488]',
        templateName: 'Template Relawan A',
        templateContent:
          'Namo Buddhaya Hendra Tanujaya,\n\nPenyaluran sembako & buku tahap 4 akan dilaksanakan akhir pekan ini. Terima kasih atas partisipasi aktif Anda. 🙏',
        itemTitle: 'Paket Sembako & Buku Dharma',
        itemSubtitle: 'Bakti Sosial Salur, MAD - 2021',
        itemStock: 'Stok: 300 paket',
        status: 'done_gray',
        sentAt: '12 Nov 2021 16:00',
      },
      {
        id: 'dr-4-3',
        deadline: '26 Nov 2021',
        identitasId: 'id-3',
        codeId: '00042',
        nama: 'Teresa Lim',
        nomorHp: '081122334455',
        avatarInitial: 'T',
        avatarBg: 'bg-[#d9659b]',
        templateName: 'Template Relawan A',
        templateContent:
          'Namo Buddhaya Teresa Lim,\n\nPenyaluran sembako & buku tahap 4 akan dilaksanakan akhir pekan ini. Terima kasih atas partisipasi aktif Anda. 🙏',
        itemTitle: 'Paket Sembako & Buku Dharma',
        itemSubtitle: 'Bakti Sosial Salur, MAD - 2021',
        itemStock: 'Stok: 300 paket',
        status: 'pending',
      },
    ],
    recipients: Array.from({ length: 300 }, (_, i) => ({
      id: `rec-4-${i + 1}`,
      identitasId: `id-salur-${i + 1}`,
      codeId: `00${(100 + i).toString().padStart(3, '0')}`,
      nama: `Relawan Simpatisan SAPA #${i + 1}`,
      nomorHp: `0813${(20000000 + i * 3421).toString().slice(0, 8)}`,
      isSent: i < 75, // 75/300 = 25%
      sentAt: i < 75 ? '13 Nov 2021 11:00' : undefined,
    })),
    createdAt: '2021-11-08',
  },
  {
    id: 'pm-5',
    proyekSapa: 'Sapa Donatur Rutin',
    proyekKode: 'FUN',
    iconType: 'creditCard',
    targetType: 'multiple',
    targetCount: 20,
    targetAvatars: [
      { initial: 'S', bg: 'bg-[#0f8b8d]' },
      { initial: 'D', bg: 'bg-[#d94819]' },
      { initial: '+', bg: 'bg-[#2295d8]' },
    ],
    deadline: '20 Nov 2021',
    deadlineColor: 'teal',
    progressPercent: 75,
    statusBisaPM: 'sudah',
    tanggalMulaiPM: '11 Nov 2021',
    templatePesan:
      'Namo Buddhaya {Nama},\n\nTerima kasih atas konsistensi kebajikan Anda dalam mendukung program rutin SAPA. Semoga kebajikan ini melimpahkan berkah dan kebahagiaan. 🙏',
    detailBadge: {
      label: 'Sapa Donatur',
      countText: '20 donatur',
    },
    detailRows: Array.from({ length: 20 }, (_, i) => ({
      id: `dr-5-${i + 1}`,
      deadline: '20 Nov 2021',
      identitasId: `id-d-${i + 1}`,
      codeId: `00${(140 + i).toString().padStart(3, '0')}`,
      nama: `Donatur Rutin #${i + 1}`,
      nomorHp: `0812${(30000000 + i * 4521).toString().slice(0, 8)}`,
      avatarInitial: 'D',
      avatarBg: i % 2 === 0 ? 'bg-[#0f8b8d]' : 'bg-[#d94819]',
      templateName: 'Template Donatur Rutin',
      templateContent:
        `Namo Buddhaya Donatur Rutin #${i + 1},\n\nTerima kasih atas konsistensi kebajikan Anda dalam mendukung program donasi rutin SAPA. Semoga kebajikan ini melimpahkan berkah dan kebahagiaan. 🙏`,
      itemTitle: 'Dharma Patron Rutin Bulanan',
      itemSubtitle: 'Paket Donasi Rutin, FUN - 2021',
      itemStock: 'Target: Rp 500.000',
      status: i < 15 ? ('done_teal' as const) : ('pending' as const),
      sentAt: i < 15 ? '11 Nov 2021 10:00' : undefined,
    })),
    recipients: Array.from({ length: 20 }, (_, i) => ({
      id: `rec-5-${i + 1}`,
      identitasId: `id-d-${i + 1}`,
      codeId: `00${(140 + i).toString().padStart(3, '0')}`,
      nama: `Donatur Rutin #${i + 1}`,
      nomorHp: `0812${(30000000 + i * 4521).toString().slice(0, 8)}`,
      isSent: i < 15,
    })),
    createdAt: '2021-11-11',
  },
  {
    id: 'pm-6',
    proyekSapa: 'Konfirmasi Penerimaan Paket',
    proyekKode: 'MAD',
    iconType: 'package',
    targetType: 'multiple',
    targetCount: 15,
    targetAvatars: [
      { initial: 'A', bg: 'bg-[#008d91]' },
      { initial: 'K', bg: 'bg-[#d94819]' },
      { initial: '+', bg: 'bg-[#2295d8]' },
    ],
    deadline: '-',
    deadlineColor: 'teal',
    progressPercent: 100,
    statusBisaPM: 'sudah_dihubungi',
    tanggalMulaiPM: '05 Nov 2021',
    templatePesan:
      'Namo Buddhaya {Nama},\n\nKami mengonfirmasikan bahwa paket buku pesanan Anda telah berhasil terkirim dan diterima dengan baik. Terima kasih banyak atas partisipasinya dalam Proyek SAPA ({ProyekKode}). Semoga kebajikan ini membawa kebahagiaan. Anumodana. 🙏',
    detailBadge: {
      label: 'Konfirmasi Paket',
      countText: '15 penerima',
    },
    detailRows: [
      {
        id: 'dr-6-1',
        deadline: '-',
        identitasId: 'id-1',
        codeId: '00031',
        nama: 'Agustino Ong',
        nomorHp: '081234567898',
        avatarInitial: 'A',
        avatarBg: 'bg-[#00a89d]',
        templateName: 'Template Konfirmasi',
        templateContent:
          'Namo Buddhaya Agustino Ong, paket buku telah terkirim dan diterima dengan baik. Terima kasih! 🙏',
        itemTitle: 'Jalan Menuju Kemahatahuan',
        itemSubtitle: 'Buku Berbayar, BJM - 2021',
        itemStock: 'Stok: 100',
        status: 'done_teal',
        sentAt: '10 Nov 2021 14:10',
      },
      {
        id: 'dr-6-2',
        deadline: '-',
        identitasId: 'id-2',
        codeId: '00035',
        nama: 'Hendra Tanujaya',
        nomorHp: '081398765432',
        avatarInitial: 'H',
        avatarBg: 'bg-[#d94819]',
        templateName: 'Template Konfirmasi',
        templateContent:
          'Namo Buddhaya Hendra Tanujaya, paket buku telah terkirim dan diterima dengan baik. Terima kasih! 🙏',
        itemTitle: 'Jalan Menuju Kemahatahuan',
        itemSubtitle: 'Buku Berbayar, BJM - 2021',
        itemStock: 'Stok: 100',
        status: 'done_teal',
        sentAt: '10 Nov 2021 14:25',
      },
    ],
    recipients: Array.from({ length: 15 }, (_, i) => ({
      id: `rec-6-${i + 1}`,
      identitasId: `id-konf-${i + 1}`,
      codeId: `00${(160 + i).toString().padStart(3, '0')}`,
      nama: [
        'Agustino Ong',
        'Hendra Tanujaya',
        'Teresa Lim',
        'Budi Santoso',
        'Willy Wijaya',
        'Meiliana Chandra',
        'Dewi Kurnia',
        'Kevin Surya',
        'Siti Rahmawati',
        'Rudy Hartono',
        'Jessica Tan',
        'Raymond Tan',
        'Silvia Hartono',
        'Denny Setiawan',
        'Fanny Halim',
      ][i],
      nomorHp: `0812${(40000000 + i * 3821).toString().slice(0, 8)}`,
      isSent: true,
      sentAt: '10 Nov 2021 15:00',
    })),
    createdAt: '2021-11-05',
  },
  {
    id: 'pm-0',
    proyekSapa: 'Sosialisasi Paket Dharma Oktober',
    proyekKode: 'MAD',
    iconType: 'package',
    targetType: 'multiple',
    targetCount: 40,
    targetAvatars: [
      { initial: 'S', bg: 'bg-[#00a89d]' },
      { initial: 'H', bg: 'bg-[#d94819]' },
      { initial: '+', bg: 'bg-[#2295d8]' },
    ],
    deadline: '28 Okt 2021',
    deadlineColor: 'teal',
    progressPercent: 100,
    statusBisaPM: 'sudah_dihubungi',
    tanggalMulaiPM: '25 Okt 2021',
    templatePesan:
      'Namo Buddhaya {Nama},\n\nTerima kasih banyak atas partisipasinya dalam sosialisasi program Dharma edisi Oktober. Semoga berkah kebajikan senantiasa menyertai kita. 🙏',
    detailBadge: {
      label: 'Sosialisasi Dharma',
      countText: '40 umat',
    },
    recipients: Array.from({ length: 40 }, (_, i) => ({
      id: `rec-0-${i + 1}`,
      identitasId: `id-okt-${i + 1}`,
      codeId: `00${(50 + i).toString().padStart(3, '0')}`,
      nama: `Penerima Paket Oktober #${i + 1}`,
      nomorHp: `0812${(11000000 + i * 2911).toString().slice(0, 8)}`,
      isSent: true,
      sentAt: '26 Okt 2021 10:00',
    })),
    createdAt: '2021-10-25',
  },
  {
    id: 'pm-7',
    proyekSapa: 'Follow Up & Testimoni Buku Salur',
    proyekKode: 'MAD',
    iconType: 'package',
    targetType: 'multiple',
    targetCount: 25,
    targetAvatars: [
      { initial: 'A', bg: 'bg-[#14b8a6]' },
      { initial: 'H', bg: 'bg-[#00a896]' },
      { initial: '+', bg: 'bg-[#2295d8]' },
    ],
    deadline: '22 Des 2021',
    deadlineColor: 'teal',
    progressPercent: 0,
    statusBisaPM: 'belum',
    tanggalMulaiPM: '15 Des 2021',
    tanggalMulaiDihubungi: '15 Des 2021',
    isWaitingJeda: true,
    jedaUnit: 'bulan',
    jedaValue: 1,
    availableDate: '2021-12-15',
    autoResiTrigger: 'Follow-up Testimoni 1 Bulan dari No Resi',
    itemTitle: 'Jalan Menuju Kemahatahuan',
    templatePesan:
      'Namo Buddhaya {Nama},\n\nSudah 1 bulan sejak paket buku "{ItemTitle}" diterima. Bagaimana pengalaman membaca Saudara/i? Kami sangat berbahagia bila Saudara/i berkenan membagikan testimoni singkat melalui tautan: https://sapa.org/testimoni-buku\n\nTerima kasih atas kebersamaan dan dukungannya. 🙏',
    detailBadge: {
      label: 'Follow Up Testimoni',
      countText: '25 pembaca',
    },
    recipients: Array.from({ length: 25 }, (_, i) => ({
      id: `rec-7-${i + 1}`,
      identitasId: `id-fu-${i + 1}`,
      codeId: `00${(180 + i).toString().padStart(3, '0')}`,
      nama: `Pembaca Buku Salur #${i + 1}`,
      nomorHp: `0813${(45000000 + i * 4123).toString().slice(0, 8)}`,
      isSent: false,
    })),
    createdAt: '2021-11-15',
  },
  {
    id: 'pm-8',
    proyekSapa: 'Sapa Donatur Rutin Periode Desember',
    proyekKode: 'FUN',
    iconType: 'creditCard',
    targetType: 'multiple',
    targetCount: 20,
    targetAvatars: [
      { initial: 'S', bg: 'bg-[#0f8b8d]' },
      { initial: 'D', bg: 'bg-[#d94819]' },
      { initial: '+', bg: 'bg-[#2295d8]' },
    ],
    deadline: '27 Des 2021',
    deadlineColor: 'teal',
    progressPercent: 0,
    statusBisaPM: 'belum',
    tanggalMulaiPM: '20 Des 2021',
    tanggalMulaiDihubungi: '20 Des 2021',
    isWaitingJeda: true,
    availableDate: '2021-12-20',
    tabType: 'rutin',
    berkalaMode: 'setiap_bulan' as any,
    templatePesan:
      'Namo Buddhaya {Nama},\n\nMenjelang penutupan tahun, kami mengucapkan anumodana atas konsistensi kebajikan Anda dalam mendukung program Dharma Patron Rutin SAPA ({ProyekKode}). Semoga kebajikan ini melimpahkan kesehatan dan kedamaian di tahun mendatang. 🙏',
    detailBadge: {
      label: 'Donatur Rutin Des',
      countText: '20 donatur',
    },
    recipients: Array.from({ length: 20 }, (_, i) => ({
      id: `rec-8-${i + 1}`,
      identitasId: `id-drdes-${i + 1}`,
      codeId: `00${(210 + i).toString().padStart(3, '0')}`,
      nama: `Donatur Rutin Desember #${i + 1}`,
      nomorHp: `0812${(50000000 + i * 3612).toString().slice(0, 8)}`,
      isSent: false,
    })),
    createdAt: '2021-11-20',
  },
  {
    id: 'pm-9',
    proyekSapa: 'Kirim Kalender & Paket Dharma Awal Tahun',
    proyekKode: 'MAD',
    iconType: 'package',
    targetType: 'multiple',
    targetCount: 50,
    targetAvatars: [
      { initial: 'K', bg: 'bg-[#2295d8]' },
      { initial: 'A', bg: 'bg-[#00a89d]' },
      { initial: '+', bg: 'bg-[#d94819]' },
    ],
    deadline: '18 Jan 2022',
    deadlineColor: 'teal',
    progressPercent: 0,
    statusBisaPM: 'belum',
    tanggalMulaiPM: '10 Jan 2022',
    tanggalMulaiDihubungi: '10 Jan 2022',
    isWaitingJeda: true,
    availableDate: '2022-01-10',
    templatePesan:
      'Namo Buddhaya {Nama},\n\nMenyambut tahun baru 2022, SAPA mempersembahkan Kalender Meja Dharma 2022 dan Buku Inspirasi Kehidupan. Paket sedang dipersiapkan untuk dikirimkan kepada Anda. Semoga membawa berkah sepanjang tahun. Anumodana! 🙏',
    detailBadge: {
      label: 'Kalender 2022',
      countText: '50 paket',
    },
    recipients: Array.from({ length: 50 }, (_, i) => ({
      id: `rec-9-${i + 1}`,
      identitasId: `id-jan-${i + 1}`,
      codeId: `00${(240 + i).toString().padStart(3, '0')}`,
      nama: `Penerima Kalender 2022 #${i + 1}`,
      nomorHp: `0818${(60000000 + i * 3819).toString().slice(0, 8)}`,
      isSent: false,
    })),
    createdAt: '2021-11-25',
  },
  {
    id: 'pm-10',
    proyekSapa: 'Undangan Syukuran Imlek & Baksos Bersama',
    proyekKode: 'EVE',
    iconType: 'rocket',
    targetType: 'multiple',
    targetCount: 80,
    targetAvatars: [
      { initial: 'I', bg: 'bg-[#e05d44]' },
      { initial: 'B', bg: 'bg-[#10b981]' },
      { initial: '+', bg: 'bg-[#2295d8]' },
    ],
    deadline: '12 Feb 2022',
    deadlineColor: 'teal',
    progressPercent: 0,
    statusBisaPM: 'belum',
    tanggalMulaiPM: '05 Feb 2022',
    tanggalMulaiDihubungi: '05 Feb 2022',
    isWaitingJeda: true,
    availableDate: '2022-02-05',
    templatePesan:
      'Namo Buddhaya {Nama},\n\nKami mengundang Saudara/i untuk hadir dalam Perayaan Syukuran Kebersamaan Imlek & Bakti Sosial SAPA yang akan diadakan pada pertengahan Februari 2022. Info selengkapnya: https://sapa.org/imlek-2022. Semoga damai dan bahagia selalu. 🙏',
    detailBadge: {
      label: 'Syukuran Imlek',
      countText: '80 undangan',
    },
    recipients: Array.from({ length: 80 }, (_, i) => ({
      id: `rec-10-${i + 1}`,
      identitasId: `id-feb-${i + 1}`,
      codeId: `00${(300 + i).toString().padStart(3, '0')}`,
      nama: `Undangan Imlek #${i + 1}`,
      nomorHp: `0856${(70000000 + i * 2918).toString().slice(0, 8)}`,
      isSent: false,
    })),
    createdAt: '2021-11-28',
  },
];

export function calculateProgressPercent(recipients?: Array<{ isSent: boolean }>): number {
  if (!recipients || recipients.length === 0) return 0;
  const sentCount = recipients.filter((r) => r.isSent).length;
  return Math.round((sentCount / recipients.length) * 100);
}

/**
 * Parses a date string into a Date object.
 * Supports:
 * - "15 Nov 2021", "28 Sep 2026", "15 November 2021"
 * - "2021-11-15", "2026-09-28"
 * - "15/11/2021", "28/09/2026"
 * - ISO formats
 */
export function parseDateString(dateStr?: string): Date | null {
  if (!dateStr || !dateStr.trim() || dateStr.trim() === '-') return null;
  const s = dateStr.trim();

  // YYYY-MM-DD or ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(s)) {
    const parts = s.split(/[\/\-]/);
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    return new Date(y, m, d);
  }

  // Indonesian / English month names, e.g. "14 Nov 2021", "15 November 2021", "28 Sep 2026"
  const monthMap: Record<string, number> = {
    jan: 0, januari: 0, january: 0,
    feb: 1, februari: 1, february: 1,
    mar: 2, maret: 2, march: 2,
    apr: 3, april: 3,
    mei: 4, may: 4,
    jun: 5, juni: 5, june: 5,
    jul: 6, juli: 6, july: 6,
    agu: 7, ags: 7, agustus: 7, aug: 7, august: 7,
    sep: 8, september: 8,
    okt: 9, oktober: 9, oct: 9, october: 9,
    nov: 10, november: 10,
    des: 11, desember: 11, dec: 11, december: 11,
  };

  const parts = s.split(/[\s-]+/);
  if (parts.length >= 3) {
    const day = parseInt(parts[0].replace(/\D/g, ''), 10);
    const mStr = parts[1].toLowerCase();
    const year = parseInt(parts[2].replace(/\D/g, ''), 10);
    const month = monthMap[mStr];
    if (month !== undefined && !isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }

  const fallback = new Date(s);
  return isNaN(fallback.getTime()) ? null : fallback;
}

/**
 * Calculates badge color for Deadline and Tanggal mulai PM on List PM:
 * - 'red': jika sudah melewati (deadline atau tanggal mulai PM) atau 2 hari lagi akan (deadline atau tanggal mulai PM) (diffDays <= 2)
 * - 'yellow': jika masih 5 hari lagi (diffDays > 2 && diffDays <= 5)
 * - 'teal': jika lebih dari 5 hari (diffDays > 5)
 */
export function getDateBadgeColor(dateStr?: string, customRefDate?: Date): 'red' | 'yellow' | 'teal' {
  if (!dateStr || !dateStr.trim() || dateStr.trim() === '-') {
    return 'teal';
  }

  const targetDate = parseDateString(dateStr);
  if (!targetDate) {
    return 'teal';
  }

  // Determine reference date:
  // If target date year is 2021 (the mock data timeline centered around 15 Nov 2021),
  // compare against 15 Nov 2021.
  // Otherwise compare against current system date.
  let ref: Date;
  if (customRefDate) {
    ref = customRefDate;
  } else if (targetDate.getFullYear() === 2021) {
    ref = new Date(2021, 10, 15);
  } else {
    ref = new Date();
  }

  const targetMidnight = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
  const refMidnight = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate()).getTime();

  const diffMs = targetMidnight - refMidnight;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 2) {
    return 'red';
  } else if (diffDays <= 5) {
    return 'yellow';
  } else {
    return 'teal';
  }
}

/**
 * Checks whether "Tanggal mulai PM" is smaller than or equal to today's date.
 * If true, it should move to tab "Sudah bisa di-PM".
 */
export function isTanggalMulaiPMDue(dateStr?: string, refDate: Date = new Date()): boolean {
  if (!dateStr || !dateStr.trim() || dateStr.trim() === '-') {
    return true; // No start date specified means immediately ready
  }
  const itemDate = parseDateString(dateStr);
  if (!itemDate) return true;

  // End of today
  const todayEnd = new Date(
    refDate.getFullYear(),
    refDate.getMonth(),
    refDate.getDate(),
    23,
    59,
    59,
    999
  );

  return itemDate.getTime() <= todayEnd.getTime();
}

/**
 * Returns the effective status: if tanggal mulai PM <= today, automatically 'sudah'
 */
export function getEffectiveStatusBisaPM(item: ListPMItem, refDate: Date = new Date()): 'sudah' | 'belum' {
  if (item.statusBisaPM === 'sudah') return 'sudah';
  const dateStr = item.tanggalMulaiPM || item.tanggalMulaiDihubungi;
  if (isTanggalMulaiPMDue(dateStr, refDate)) {
    return 'sudah';
  }
  return 'belum';
}

export interface MonthOption {
  key: string; // e.g. "2021-11"
  label: string; // e.g. "Nov 2021"
  fullLabel: string; // e.g. "November 2021"
  year: number;
  monthIndex: number; // 0-11
}

export type PipelineStage =
  | 'upcoming' // List PM Mendatang & Menunggu Jeda
  | 'belum' // Belum Bisa di-PM (Pra-PM / Belum Waktunya)
  | 'sudah' // Sudah Bisa di-PM (Siap Broadcast)
  | 'in_progress' // Sedang Dihubungi (Progress 1 - 99%)
  | 'selesai'; // Selesai (Progress 100% / Sudah Dihubungi)

export const PIPELINE_STAGE_CONFIG: Record<
  PipelineStage,
  {
    label: string;
    description: string;
    color: string;
    headerBg: string;
    borderCol: string;
    badgeBg: string;
    textColor: string;
    countColor: string;
  }
> = {
  upcoming: {
    label: 'List PM Mendatang',
    description: 'Terjadwal & Menunggu Jeda / Berkala',
    color: 'indigo',
    headerBg: 'bg-indigo-50/90',
    borderCol: 'border-indigo-200',
    badgeBg: 'bg-indigo-100 text-indigo-700',
    textColor: 'text-indigo-900',
    countColor: 'bg-indigo-600 text-white',
  },
  belum: {
    label: 'Belum Bisa di-PM',
    description: 'Menunggu Jadwal Mulai PM',
    color: 'amber',
    headerBg: 'bg-amber-50/90',
    borderCol: 'border-amber-200',
    badgeBg: 'bg-amber-100 text-amber-800',
    textColor: 'text-amber-900',
    countColor: 'bg-amber-600 text-white',
  },
  sudah: {
    label: 'Sudah Bisa di-PM',
    description: 'Siap Eksekusi & Kirim Broadcast',
    color: 'teal',
    headerBg: 'bg-teal-50/90',
    borderCol: 'border-teal-200',
    badgeBg: 'bg-teal-100 text-teal-800',
    textColor: 'text-teal-900',
    countColor: 'bg-[#00897b] text-white',
  },
  in_progress: {
    label: 'Sedang Dihubungi',
    description: 'Dalam Proses Pengiriman (1-99%)',
    color: 'cyan',
    headerBg: 'bg-cyan-50/90',
    borderCol: 'border-cyan-200',
    badgeBg: 'bg-cyan-100 text-cyan-800',
    textColor: 'text-cyan-900',
    countColor: 'bg-cyan-600 text-white',
  },
  selesai: {
    label: 'Sudah Dihubungi',
    description: 'Selesai 100% Terkirim',
    color: 'emerald',
    headerBg: 'bg-emerald-50/90',
    borderCol: 'border-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    textColor: 'text-emerald-900',
    countColor: 'bg-emerald-600 text-white',
  },
};

export function extractItemMonth(item: ListPMItem): MonthOption {
  const d =
    parseDateString(
      item.tanggalMulaiPM ||
        item.tanggalMulaiDihubungi ||
        item.createdAt ||
        item.availableDate ||
        item.deadline
    ) || new Date(2021, 10, 15);
  const monthNamesShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ];
  const monthNamesFull = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const y = d.getFullYear();
  const m = d.getMonth();
  const padM = (m + 1).toString().padStart(2, '0');
  return {
    key: `${y}-${padM}`,
    label: `${monthNamesShort[m]} ${y}`,
    fullLabel: `${monthNamesFull[m]} ${y}`,
    year: y,
    monthIndex: m,
  };
}

export function isUpcomingPM(item: ListPMItem): boolean {
  // If explicitly waiting for jeda
  if (item.isWaitingJeda) return true;
  // If has availableDate in future
  if (item.availableDate) {
    const avail = new Date(item.availableDate).getTime();
    if (!isNaN(avail) && avail > new Date(2021, 10, 16).getTime()) {
      return true;
    }
  }
  // If tanggalMulaiPM is in future month (> Nov 2021)
  const d = parseDateString(item.tanggalMulaiPM || item.tanggalMulaiDihubungi);
  if (d) {
    const ref = new Date(2021, 10, 16);
    if (d.getTime() > ref.getTime() + 15 * 86400000) {
      return true;
    }
  }
  return false;
}

export function getPipelineStage(item: ListPMItem): PipelineStage {
  if (item.progressPercent >= 100 || item.statusBisaPM === 'sudah_dihubungi') {
    return 'selesai';
  }
  if (item.progressPercent > 0 && item.progressPercent < 100) {
    return 'in_progress';
  }
  if (isUpcomingPM(item)) {
    return 'upcoming';
  }
  const eff = getEffectiveStatusBisaPM(item);
  if (eff === 'sudah' || item.statusBisaPM === 'sudah') {
    return 'sudah';
  }
  return 'belum';
}

const AVATAR_BG_COLORS = [
  'bg-[#00a89d]',
  'bg-[#d94819]',
  'bg-[#d9659b]',
  'bg-[#2295d8]',
  'bg-[#0f8b8d]',
  'bg-[#7a8a68]',
  'bg-[#10b981]',
  'bg-[#e05d44]',
];

/**
 * Ensures all recipients/targets that need to be contacted are present in detailRows
 * so they appear in Pop up "Kirim Chat / Kelola PM".
 */
export function ensureAllRecipientsInDetailRows(item: ListPMItem): ListPMDetailRow[] {
  const existingRows = item.detailRows ? [...item.detailRows] : [];

  // Default item and template metadata
  const defaultTemplateName =
    existingRows[0]?.templateName ||
    (item.proyekKode ? `Template ${item.proyekKode}` : 'Template A');
  const defaultItemTitle =
    item.itemTitle ||
    existingRows[0]?.itemTitle ||
    (item.iconType === 'rocket'
      ? 'Seminar Meditasi & Mindfulness'
      : item.iconType === 'creditCard'
      ? 'Dharma Patron Rutin Bulanan'
      : item.iconType === 'shoppingCart'
      ? 'Paket Sembako & Buku Dharma'
      : 'Jalan Menuju Kemahatahuan');
  const defaultItemSubtitle =
    existingRows[0]?.itemSubtitle ||
    `${item.proyekSapa}, ${item.proyekKode || 'MAD'} - 2021`;
  const defaultItemStock =
    existingRows[0]?.itemStock ||
    (item.iconType === 'rocket'
      ? 'Kuota: 50'
      : item.iconType === 'creditCard'
      ? 'Target: Rp 500.000'
      : 'Stok: 100');
  const defaultDeadline =
    item.deadline && item.deadline !== '-'
      ? item.deadline
      : '16 Nov 2021';

  // 1. If item has recipients list, ensure EVERY recipient has a row
  if (item.recipients && item.recipients.length > 0) {
    item.recipients.forEach((rec, idx) => {
      // Check if recipient is already in existingRows
      const exists = existingRows.some(
        (r) =>
          (r.identitasId && rec.identitasId && r.identitasId === rec.identitasId) ||
          (r.nomorHp && rec.nomorHp && r.nomorHp === rec.nomorHp) ||
          (r.codeId && rec.codeId && r.codeId === rec.codeId) ||
          (r.nama && rec.nama && r.nama.toLowerCase().trim() === rec.nama.toLowerCase().trim())
      );

      if (!exists) {
        const avatarInitial = (rec.nama || 'A').charAt(0).toUpperCase();
        const avatarBg = AVATAR_BG_COLORS[idx % AVATAR_BG_COLORS.length];

        let templateContent = item.templatePesan || '';
        if (templateContent) {
          templateContent = templateContent
            .replace(/{Nama}/g, rec.nama)
            .replace(/\[Nama Lengkap\]/g, rec.nama)
            .replace(/{CodeID}/g, rec.codeId || '')
            .replace(/{NomorHP}/g, rec.nomorHp)
            .replace(/{ItemTitle}/g, defaultItemTitle)
            .replace(/{ProyekKode}/g, item.proyekKode || 'MAD');
        } else {
          templateContent = `Namo Buddhaya ${rec.nama},\n\nTerima kasih banyak atas partisipasinya dalam Proyek SAPA (${item.proyekKode || 'MAD'}).`;
        }

        existingRows.push({
          id: `dr-${item.id}-${rec.id || idx + 1}`,
          deadline: defaultDeadline,
          identitasId: rec.identitasId,
          codeId: rec.codeId,
          nama: rec.nama,
          nomorHp: rec.nomorHp,
          avatarInitial,
          avatarBg,
          proyekSapa: item.proyekSapa,
          proyekKode: item.proyekKode,
          templateName: defaultTemplateName,
          templateContent,
          itemTitle: defaultItemTitle,
          itemSubtitle: defaultItemSubtitle,
          itemStock: defaultItemStock,
          status: rec.isSent ? 'done_teal' : 'pending',
          sentAt: rec.sentAt || (rec.isSent ? '14 Nov 2021 10:00' : undefined),
        });
      }
    });
  } else if (item.singleTarget && existingRows.length === 0) {
    const target = item.singleTarget;
    let templateContent = item.templatePesan || '';
    if (templateContent) {
      templateContent = templateContent
        .replace(/{Nama}/g, target.nama)
        .replace(/\[Nama Lengkap\]/g, target.nama)
        .replace(/{CodeID}/g, target.codeId || '')
        .replace(/{NomorHP}/g, target.nomorHp)
        .replace(/{ItemTitle}/g, defaultItemTitle)
        .replace(/{ProyekKode}/g, item.proyekKode || 'MAD');
    } else {
      templateContent = `Namo Buddhaya ${target.nama},\n\nTerima kasih atas partisipasinya dalam Proyek SAPA (${item.proyekKode || 'MAD'}).`;
    }

    existingRows.push({
      id: `dr-${item.id}-1`,
      deadline: defaultDeadline,
      identitasId: target.identitasId,
      codeId: target.codeId,
      nama: target.nama,
      nomorHp: target.nomorHp,
      avatarInitial: target.avatarInitial || (target.nama || 'A').charAt(0).toUpperCase(),
      avatarBg: target.avatarBg || 'bg-[#00a89d]',
      proyekSapa: item.proyekSapa,
      proyekKode: item.proyekKode,
      templateName: defaultTemplateName,
      templateContent,
      itemTitle: defaultItemTitle,
      itemSubtitle: defaultItemSubtitle,
      itemStock: defaultItemStock,
      status: item.progressPercent === 100 ? 'done_teal' : 'pending',
    });
  }

  // Ensure each row has proyekSapa and proyekKode
  return existingRows.map((r) => ({
    ...r,
    proyekSapa: r.proyekSapa || item.proyekSapa || 'Proyek SAPA',
    proyekKode: r.proyekKode || item.proyekKode || 'MAD',
  }));
}

export function loadListPM(): ListPMItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const processedInitial = INITIAL_LIST_PM.map((item) => {
        const fullItem: ListPMItem = {
          ...item,
          statusBisaPM: getEffectiveStatusBisaPM(item),
        };
        return {
          ...fullItem,
          detailRows: ensureAllRecipientsInDetailRows(fullItem),
        };
      });
      saveListPM(processedInitial);
      return processedInitial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge with initial detailRows, detailBadge, statusBisaPM, and tanggalMulaiPM
      const merged: ListPMItem[] = parsed.map((item: ListPMItem) => {
        const initialMatch = INITIAL_LIST_PM.find((init) => init.id === item.id);
        const detailBadge =
          item.detailBadge ||
          initialMatch?.detailBadge || {
            label: item.proyekSapa,
            countText: item.targetCount ? `${item.targetCount} buah` : '1 buah',
          };
        let detailRows =
          item.detailRows && item.detailRows.length > 0
            ? [...item.detailRows]
            : initialMatch?.detailRows || [];

        // Ensure Cindy Budiman row from attachment is in pm-1
        if (item.id === 'pm-1') {
          const hasCindy = detailRows.some(
            (r) => r.id === 'dr-1-cindy' || r.nama.includes('Cindy Budiman')
          );
          if (!hasCindy) {
            const initialCindy = initialMatch?.detailRows?.find((r) => r.id === 'dr-1-cindy');
            if (initialCindy) {
              detailRows.unshift(initialCindy);
            }
          }
        }

        detailRows = detailRows.map((r) => ({
          ...r,
          proyekSapa: r.proyekSapa || item.proyekSapa || 'Proyek SAPA',
          proyekKode: r.proyekKode || item.proyekKode || 'MAD',
        }));

        const tanggalMulaiPM =
          item.tanggalMulaiPM ||
          item.tanggalMulaiDihubungi ||
          initialMatch?.tanggalMulaiPM ||
          '15 Nov 2021';

        let statusBisaPM = item.statusBisaPM || initialMatch?.statusBisaPM || 'sudah';
        // If tanggal mulai PM is smaller than or equal to today, move to 'sudah'
        if (isTanggalMulaiPMDue(tanggalMulaiPM)) {
          statusBisaPM = 'sudah';
        }

        const fullItem: ListPMItem = {
          ...item,
          detailBadge,
          detailRows,
          statusBisaPM,
          tanggalMulaiPM,
        };

        return {
          ...fullItem,
          detailRows: ensureAllRecipientsInDetailRows(fullItem),
        };
      });
      // Ensure initial items like pm-6 (100% progress) are present if missing from storage
      INITIAL_LIST_PM.forEach((initItem) => {
        if (!merged.some((m: ListPMItem) => m.id === initItem.id)) {
          const fullItem: ListPMItem = {
            ...initItem,
            statusBisaPM: getEffectiveStatusBisaPM(initItem),
          };
          merged.push({
            ...fullItem,
            detailRows: ensureAllRecipientsInDetailRows(fullItem),
          });
        }
      });
      saveListPM(merged);
      return merged;
    }
    return INITIAL_LIST_PM.map((item) => {
      const fullItem: ListPMItem = {
        ...item,
        statusBisaPM: getEffectiveStatusBisaPM(item),
      };
      return {
        ...fullItem,
        detailRows: ensureAllRecipientsInDetailRows(fullItem),
      };
    });
  } catch (err) {
    console.warn('Error loading List PM from localStorage, using initial data:', err);
    return INITIAL_LIST_PM.map((item) => {
      const fullItem: ListPMItem = {
        ...item,
        statusBisaPM: getEffectiveStatusBisaPM(item),
      };
      return {
        ...fullItem,
        detailRows: ensureAllRecipientsInDetailRows(fullItem),
      };
    });
  }
}

export function saveListPM(items: ListPMItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Error saving List PM to localStorage:', err);
  }
}

export type PMSearchScope = 'all' | 'project' | 'target';

export interface PMSearchResult {
  matches: boolean;
  matchType?: 'project' | 'target';
  matchedTargetName?: string;
  matchedTargetCode?: string;
}

export function searchListPMItem(
  item: ListPMItem,
  query: string,
  scope: PMSearchScope = 'all',
  identitasList?: IdentitasItem[]
): PMSearchResult {
  if (!query || !query.trim()) {
    return { matches: true };
  }
  const q = query.toLowerCase().trim();

  // 1. Check Project match
  const matchProject =
    item.proyekSapa.toLowerCase().includes(q) ||
    item.proyekKode.toLowerCase().includes(q) ||
    (item.itemTitle && item.itemTitle.toLowerCase().includes(q)) ||
    (item.detailBadge?.label && item.detailBadge.label.toLowerCase().includes(q));

  if (scope === 'project') {
    return {
      matches: !!matchProject,
      matchType: matchProject ? 'project' : undefined,
    };
  }

  // 2. Check Target recipient match
  let matchedTargetName: string | undefined = undefined;
  let matchedTargetCode: string | undefined = undefined;

  // Check singleTarget
  if (item.singleTarget) {
    const st = item.singleTarget;
    if (
      st.nama.toLowerCase().includes(q) ||
      st.nomorHp.includes(q) ||
      (st.codeId && st.codeId.toLowerCase().includes(q))
    ) {
      matchedTargetName = st.nama;
      matchedTargetCode = st.codeId;
    }
  }

  // Check recipients
  if (!matchedTargetName && item.recipients && item.recipients.length > 0) {
    const found = item.recipients.find(
      (r) =>
        r.nama.toLowerCase().includes(q) ||
        r.nomorHp.includes(q) ||
        (r.codeId && r.codeId.toLowerCase().includes(q))
    );
    if (found) {
      matchedTargetName = found.nama;
      matchedTargetCode = found.codeId;
    }
  }

  // Check detailRows (where initial items store recipients)
  if (!matchedTargetName && item.detailRows && item.detailRows.length > 0) {
    const found = item.detailRows.find(
      (dr) =>
        dr.nama.toLowerCase().includes(q) ||
        dr.nomorHp.includes(q) ||
        (dr.codeId && dr.codeId.toLowerCase().includes(q))
    );
    if (found) {
      matchedTargetName = found.nama;
      matchedTargetCode = found.codeId;
    }
  }

  // Check targetAvatars (if name stored in avatar object)
  if (!matchedTargetName && item.targetAvatars && item.targetAvatars.length > 0) {
    const found = item.targetAvatars.find(
      (a: any) => a.name && a.name.toLowerCase().includes(q)
    );
    if (found) {
      matchedTargetName = (found as any).name;
    }
  }

  // Check targetSourceName (e.g. Group Funneling, Organisasi)
  if (!matchedTargetName && item.targetSourceName && item.targetSourceName.toLowerCase().includes(q)) {
    matchedTargetName = item.targetSourceName;
  }

  // Lookup referenced identitas from identitasList
  if (!matchedTargetName && identitasList && identitasList.length > 0) {
    const ids = new Set<string>();
    if (item.singleTarget?.identitasId) ids.add(item.singleTarget.identitasId);
    if (item.recipients) item.recipients.forEach((r) => r.identitasId && ids.add(r.identitasId));
    if (item.detailRows) item.detailRows.forEach((dr) => dr.identitasId && ids.add(dr.identitasId));

    if (ids.size > 0) {
      const foundIdent = identitasList.find(
        (id) =>
          ids.has(id.id) &&
          (id.namaLengkap.toLowerCase().includes(q) ||
            (id.namaPanggilan && id.namaPanggilan.toLowerCase().includes(q)) ||
            (id.nomorIdentitas && id.nomorIdentitas.toLowerCase().includes(q)) ||
            (id.nomorHandPhone && id.nomorHandPhone.includes(q)))
      );
      if (foundIdent) {
        matchedTargetName = foundIdent.namaLengkap;
        matchedTargetCode = foundIdent.nomorIdentitas;
      }
    }
  }

  const matchTarget = !!matchedTargetName;

  if (scope === 'target') {
    return {
      matches: matchTarget,
      matchType: matchTarget ? 'target' : undefined,
      matchedTargetName,
      matchedTargetCode,
    };
  }

  // scope === 'all'
  if (matchTarget) {
    return {
      matches: true,
      matchType: 'target',
      matchedTargetName,
      matchedTargetCode,
    };
  }

  if (matchProject) {
    return {
      matches: true,
      matchType: 'project',
    };
  }

  return { matches: false };
}
