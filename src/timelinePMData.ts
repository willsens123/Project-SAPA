import { TimelinePMJourney } from './types';

export const STORAGE_KEY_TIMELINE_PM = 'yppln_timeline_pm_journeys_v1';

export const INITIAL_TIMELINE_PM_JOURNEYS: TimelinePMJourney[] = [
  {
    id: 'journey-group-a',
    targetType: 'groupFunneling',
    targetId: 'grp-a',
    targetName: 'Group A',
    audienceCount: 202,
    audienceLabel: '202 orang',
    avatarCluster: [
      { initial: '[', bg: 'bg-[#f59e0b]' }, // Orange
      { initial: 'V', bg: 'bg-[#94a3b8]' }, // Slate / Grey
      { initial: '+200', bg: 'bg-[#008d91]' }, // Teal
    ],
    nodes: [
      {
        id: 'node-a-1',
        type: 'chat',
        icon: 'chat',
        title: 'Chat A',
        subtitle: 'Ajakan A',
        durationAfter: '2 Bulan',
        month: 'Agu',
      },
      {
        id: 'node-a-2',
        type: 'event',
        icon: 'rocket',
        title: 'Promosi Event',
        subtitle: 'Bedah Buku A',
        durationAfter: '3 Bulan',
        month: 'Okt',
        branch: {
          id: 'branch-a-b',
          letter: 'B',
          title: 'Aktivitas Event Bedah Buku A',
          subSteps: [
            {
              id: 'sub-a-b-1',
              icon: 'rocket',
              label: 'Pendaftaran Event',
              subtitle: 'Bedah Buku A',
            },
          ],
        },
        midBranchTransaction: {
          id: 'branch-a-transaksi',
          letter: 'A',
          title: 'Transaksi Penjualan Buku',
          subSteps: [
            {
              id: 'sub-tx-1',
              icon: 'cart',
              label: 'Pembelian Buku',
              subtitle: 'Buku Hidup Bahagia',
              isTransaction: true,
              transactionData: {
                id: 'tx-101',
                orderNumber: 'CC 123456789',
                nominal: 'Rp150.000',
                item: 'Buku Hidup Bahagia (1x)',
                date: '14 Nov 2021',
                pembeli: '10001 Lilo',
                status: 'Paid',
              },
            },
            {
              id: 'sub-tx-2',
              icon: 'document',
              label: 'Kuitansi / Resi Pembayaran',
              subtitle: 'Resi SAPA-MAD-98214',
              isTransaction: true,
              transactionData: {
                id: 'tx-101',
                orderNumber: 'SAPA-MAD-98214',
                nominal: 'Rp150.000',
                item: 'Buku Hidup Bahagia',
                date: '14 Nov 2021',
                status: 'Terverifikasi',
              },
            },
            {
              id: 'sub-tx-3',
              icon: 'user',
              label: 'Verifikasi Penerima Manfaat',
              subtitle: 'Pelimpahan Jasa Donatur',
              isTransaction: true,
              transactionData: {
                id: 'tx-101',
                pembeli: '10001 Lilo',
                date: '15 Nov 2021',
                status: 'Selesai',
              },
            },
          ],
        },
      },
      {
        id: 'node-a-3',
        type: 'buku',
        icon: 'cart',
        title: 'Promosi Buku',
        subtitle: 'Buku Hidup Bahagia',
        durationAfter: '2 Bulan',
        month: 'Nov',
      },
      {
        id: 'node-a-4',
        type: 'dana',
        icon: 'user',
        title: 'Promosi Dana',
        subtitle: 'Dana Banjir',
        month: 'Jan',
      },
    ],
  },
  {
    id: 'journey-group-b',
    targetType: 'groupFunneling',
    targetId: 'grp-b',
    targetName: 'Group B',
    audienceCount: 102,
    audienceLabel: '102 orang',
    avatarCluster: [
      { initial: '[', bg: 'bg-[#ec4899]' }, // Pink / Magenta
      { initial: 'V', bg: 'bg-[#94a3b8]' }, // Slate / Grey
      { initial: '+100', bg: 'bg-[#008d91]' }, // Teal
    ],
    nodes: [
      {
        id: 'node-b-1',
        type: 'chat',
        icon: 'chat',
        title: 'Chat A',
        subtitle: 'Ajakan A',
        durationAfter: '2 Bulan',
        month: 'Agu',
      },
      {
        id: 'node-b-2',
        type: 'event',
        icon: 'rocket',
        title: 'Promosi Event',
        subtitle: 'Bedah Buku A',
        durationAfter: '3 Bulan',
        month: 'Okt',
        branch: {
          id: 'branch-b-b',
          letter: 'B',
          title: 'Aktivitas Event Bedah Buku A',
          subSteps: [
            {
              id: 'sub-b-b-1',
              icon: 'rocket',
              label: 'Pendaftaran Event',
              subtitle: 'Bedah Buku A',
            },
          ],
        },
        midBranchTransaction: {
          id: 'branch-b-transaksi',
          letter: 'A',
          title: 'Transaksi Donasi Event',
          subSteps: [
            {
              id: 'sub-b-tx-1',
              icon: 'cart',
              label: 'Donasi Retreat Lamrim',
              subtitle: 'Paket Mahasiswa',
              isTransaction: true,
              transactionData: {
                id: 'tx-202',
                orderNumber: 'CC 987654321',
                nominal: 'Rp1.200.000',
                item: 'Paket Mahasiswa Retreat',
                date: '14 Nov 2021',
                pembeli: 'Cindy Budiman',
                status: 'Paid',
              },
            },
            {
              id: 'sub-b-tx-2',
              icon: 'document',
              label: 'Kuitansi Donasi',
              subtitle: 'Resi SAPA-EVE-10294',
              isTransaction: true,
              transactionData: {
                id: 'tx-202',
                orderNumber: 'SAPA-EVE-10294',
                nominal: 'Rp1.200.000',
                date: '14 Nov 2021',
                status: 'Terverifikasi',
              },
            },
            {
              id: 'sub-b-tx-3',
              icon: 'user',
              label: 'Konfirmasi Donatur',
              subtitle: 'Ci Pao (Cindy B.)',
              isTransaction: true,
              transactionData: {
                id: 'tx-202',
                pembeli: 'Cindy Budiman (Ci Pao)',
                date: '15 Nov 2021',
                status: 'Selesai',
              },
            },
          ],
        },
      },
      {
        id: 'node-b-3',
        type: 'buku',
        icon: 'cart',
        title: 'Promosi Buku',
        subtitle: 'Buku Hidup Bahagia',
        durationAfter: '2 Bulan',
        month: 'Nov',
      },
      {
        id: 'node-b-4',
        type: 'dana',
        icon: 'user',
        title: 'Promosi Dana',
        subtitle: 'Dana Banjir',
        month: 'Jan',
      },
    ],
  },
  {
    id: 'journey-identitas-1',
    targetType: 'identitas',
    targetId: 'id-1',
    targetName: '00031 - Agustino Ong (Ko Agus)',
    audienceCount: 1,
    audienceLabel: '1 orang',
    avatarCluster: [
      { initial: 'A', bg: 'bg-[#00a89d]' },
    ],
    nodes: [
      {
        id: 'node-id1-1',
        type: 'chat',
        icon: 'chat',
        title: 'Chat Sambutan',
        subtitle: 'Ajakan Gabung Relawan',
        durationAfter: '1 Bulan',
        month: 'Sep',
      },
      {
        id: 'node-id1-2',
        type: 'event',
        icon: 'rocket',
        title: 'Promosi Event',
        subtitle: 'Pelatihan S-SEBAR',
        durationAfter: '2 Bulan',
        month: 'Okt',
        midBranchTransaction: {
          id: 'branch-id1-tx',
          letter: 'A',
          title: 'Transaksi Patron Donasi',
          subSteps: [
            {
              id: 'sub-id1-tx-1',
              icon: 'cart',
              label: 'Donasi Patron Rutin',
              subtitle: 'Patron Madya',
              isTransaction: true,
              transactionData: {
                id: 'tx-301',
                orderNumber: 'CC 445566778',
                nominal: 'Rp500.000',
                item: 'Dharma Patron Rutin',
                date: '14 Nov 2021',
                pembeli: 'Agustino Ong',
                status: 'Paid',
              },
            },
            {
              id: 'sub-id1-tx-2',
              icon: 'document',
              label: 'Resi e-Tanda Terima',
              subtitle: 'DPR-2021-0031',
              isTransaction: true,
              transactionData: {
                id: 'tx-301',
                orderNumber: 'DPR-2021-0031',
                nominal: 'Rp500.000',
                date: '14 Nov 2021',
                status: 'Terverifikasi',
              },
            },
            {
              id: 'sub-id1-tx-3',
              icon: 'user',
              label: 'Relawan Terverifikasi',
              subtitle: 'Ko Agus',
              isTransaction: true,
            },
          ],
        },
      },
      {
        id: 'node-id1-3',
        type: 'buku',
        icon: 'cart',
        title: 'Paket Buku S-SALUR',
        subtitle: 'Jalan Menuju Kemahatahuan',
        month: 'Nov',
      },
    ],
  },
  {
    id: 'journey-organisasi-1',
    targetType: 'organisasi',
    targetId: 'org-1',
    targetName: 'Yayasan Citra Dharma Mandiri',
    audienceCount: 50,
    audienceLabel: '50 anggota',
    avatarCluster: [
      { initial: 'Y', bg: 'bg-[#6366f1]' },
      { initial: 'C', bg: 'bg-[#008d91]' },
    ],
    nodes: [
      {
        id: 'node-org1-1',
        type: 'chat',
        icon: 'chat',
        title: 'Kemitraan Organisasi',
        subtitle: 'MoU Penyaluran Buku',
        durationAfter: '2 Bulan',
        month: 'Sep',
      },
      {
        id: 'node-org1-2',
        type: 'event',
        icon: 'rocket',
        title: 'Program Bersama',
        subtitle: 'Distribusi S-SALUR 2021',
        durationAfter: '1 Bulan',
        month: 'Nov',
        midBranchTransaction: {
          id: 'branch-org1-tx',
          letter: 'A',
          title: 'Transaksi Sponsor Kegiatan',
          subSteps: [
            {
              id: 'sub-org1-tx-1',
              icon: 'cart',
              label: 'Sponsor Buku Cetak',
              subtitle: '100 Eksemplar Lamrim',
              isTransaction: true,
              transactionData: {
                id: 'tx-org-1',
                orderNumber: 'CC 888999111',
                nominal: 'Rp5.000.000',
                item: 'Sponsor 100 Eks Buku Lamrim',
                date: '10 Nov 2021',
                pembeli: 'Yayasan Citra Dharma',
                status: 'Paid',
              },
            },
            {
              id: 'sub-org1-tx-2',
              icon: 'document',
              label: 'Kuitansi Sponsor',
              subtitle: 'SAPA-SPON-2021-08',
              isTransaction: true,
            },
            {
              id: 'sub-org1-tx-3',
              icon: 'user',
              label: 'PIC Mitra',
              subtitle: 'Bpk. Hendra Wijaya',
              isTransaction: true,
            },
          ],
        },
      },
      {
        id: 'node-org1-3',
        type: 'dana',
        icon: 'user',
        title: 'Laporan Penyaluran',
        subtitle: 'Penerima Manfaat 100 Buku',
        month: 'Des',
      },
    ],
  },
];

export function loadTimelinePMJourneys(): TimelinePMJourney[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TIMELINE_PM);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn(e);
  }
  return INITIAL_TIMELINE_PM_JOURNEYS;
}

export function saveTimelinePMJourneys(journeys: TimelinePMJourney[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TIMELINE_PM, JSON.stringify(journeys));
  } catch (e) {
    console.warn(e);
  }
}
