import { SayPaidRecord } from './types';

export interface TransaksiAjarSubProduct {
  id: string;
  name: string;
  qtyPrice: string;
  badgeLetter?: string;
}

export interface TransaksiAjarItem {
  id: string;
  orderNumber: string; // e.g. "A-Call Center 26101200001"
  kodeTransaksi?: string;
  via?: string; // e.g. "Call Center"
  eventName: string; // e.g. "Indonesia Lamrim Retreat 2021"
  customerId: string; // e.g. "10001 Lilo"
  date: string; // e.g. "14 Nov 2021"
  statusBadges: string[]; // e.g. ['Paid', 'Paid']
  sayPaidData?: SayPaidRecord[];
  
  // Primary Product Item
  badgeLetter: string; // "P"
  itemName: string; // "Paket Mahasiswa"
  qtyPrice: string; // "4 x Rp1.200.000" or "1 x Rp1.200.000"
  donasiExtra?: string; // "Donasi: Rp100.000"
  otherProducts?: TransaksiAjarSubProduct[];

  // Recipients
  recipientDateBadge: string; // "14 Nov 2021"
  recipients: string[]; // ["10001 Lilo Lucu", "10002 Lilo Lucu", "10003 Lilo Lucu"]
  otherRecipients?: string[]; // additional recipients if expanded

  // Keterangan
  keterangan: string; // "Indonesia Lamrim Retreat 2018"

  // Total
  totalDana: string; // "Rp1.950.000"

  // Input note
  notes?: string;
}

export const INITIAL_TRANSAKSI_AJAR_LIST: TransaksiAjarItem[] = [
  {
    id: 'ajar-tx-1',
    orderNumber: 'A-Call Center 21111400001',
    via: 'Call Center',
    eventName: 'Indonesia Lamrim Retreat 2021',
    customerId: '10001 Lilo',
    date: '14 Nov 2021',
    statusBadges: ['Paid', 'Paid'],
    badgeLetter: 'P',
    itemName: 'Paket Mahasiswa',
    qtyPrice: '4 x Rp1.200.000',
    otherProducts: [
      {
        id: 'p-sub-1',
        name: 'Paket Pemuda Dharma',
        qtyPrice: '1 x Rp750.000',
        badgeLetter: 'P',
      },
      {
        id: 'p-sub-2',
        name: 'Modul Pelatihan A-AJAR',
        qtyPrice: '2 x Rp0 (Gratis)',
        badgeLetter: 'M',
      },
    ],
    recipientDateBadge: '14 Nov 2021',
    recipients: [
      '10001 Lilo Lucu',
      '10002 Lilo Lucu',
      '10003 Lilo Lucu',
    ],
    otherRecipients: [
      '10004 Lilo Lucu',
      '10005 Lilo Lucu',
    ],
    keterangan: 'Indonesia Lamrim Retreat 2018',
    totalDana: 'Rp1.950.000',
    notes: '',
  },
  {
    id: 'ajar-tx-2',
    orderNumber: 'A-Call Center 21111400002',
    via: 'Call Center',
    eventName: 'Indonesia Lamrim Retreat 2021',
    customerId: '10006 Budi Dharma',
    date: '14 Nov 2021',
    statusBadges: ['Paid', 'Paid'],
    badgeLetter: 'P',
    itemName: 'Paket Mahasiswa',
    qtyPrice: '1 x Rp1.200.000',
    donasiExtra: 'Donasi: Rp100.000',
    otherProducts: [
      {
        id: 'p-sub-3',
        name: 'Paket Buku Panduan Sadhana',
        qtyPrice: '1 x Rp200.000',
        badgeLetter: 'B',
      },
    ],
    recipientDateBadge: '14 Nov 2021',
    recipients: [
      '10006 Budi Dharma',
      '10007 Siska Wijaya',
      '10008 Hendra Santoso',
    ],
    otherRecipients: [
      '10009 Citra Dewi',
      '10010 Agus Pratama',
      '10011 Ratna Sari',
      '10012 Kevin Tan',
    ],
    keterangan: 'Indonesia Lamrim Retreat 2021',
    totalDana: 'Rp1.950.000',
    notes: '',
  },
  {
    id: 'ajar-hist-2018-1',
    orderNumber: 'A-Call Center 18111400001',
    via: 'Call Center',
    eventName: 'Indonesia Lamrim Retreat 2018',
    customerId: '10001 Lilo',
    date: '14 Nov 2018',
    statusBadges: ['Paid', 'Paid'],
    badgeLetter: 'P',
    itemName: 'Paket Peserta Retret',
    qtyPrice: '2 x Rp1.200.000',
    donasiExtra: 'Donasi: Rp100.000',
    recipientDateBadge: '14 Nov 2018',
    recipients: ['10001 Lilo Lucu'],
    otherRecipients: [],
    keterangan: 'Indonesia Lamrim Retreat 2018',
    totalDana: 'Rp2.500.000',
    notes: '',
  },
];

export interface AjarParticipant {
  fullCode: string;
  idNumber: number;
  codeId: string;
  name: string;
  eventName: string;
  orderNumber: string;
  role: 'Pembeli' | 'Penerima';
  packageItem?: string;
}

/**
 * Mengambil semua peserta Transaksi A-AJAR berdasarkan nama kegiatan / Proyek SAPA.
 * Mendukung ekstraksi customerId dan daftar penerima (recipients & otherRecipients).
 */
export function getAjarParticipantsByProject(
  projectName: string,
  ajarList: TransaksiAjarItem[] = INITIAL_TRANSAKSI_AJAR_LIST
): AjarParticipant[] {
  if (!projectName || !projectName.trim()) return [];
  const normProject = projectName.toLowerCase().trim();

  // Cocokkan eventName dengan project name (misal: "Indonesia Lamrim Retreat 2021" atau parsial)
  const matchingTx = ajarList.filter((tx) => {
    const normEvent = (tx.eventName || '').toLowerCase().trim();
    return (
      normEvent === normProject ||
      normEvent.includes(normProject) ||
      normProject.includes(normEvent)
    );
  });

  const participantMap = new Map<string, AjarParticipant>();

  const parseCodeAndName = (raw: string): { codeId: string; idNumber: number; name: string } => {
    const trimmed = (raw || '').trim();
    // Format umum: "10001 Lilo Lucu" atau "10001"
    const match = trimmed.match(/^(\d+)\s*(.*)$/);
    if (match) {
      const codeId = match[1];
      const name = match[2]?.trim() || `Peserta ${codeId}`;
      return { codeId, idNumber: parseInt(codeId, 10), name };
    }
    return { codeId: trimmed, idNumber: 0, name: trimmed };
  };

  matchingTx.forEach((tx) => {
    // 1. Customer / Pembeli utama
    if (tx.customerId) {
      const parsed = parseCodeAndName(tx.customerId);
      if (parsed.codeId && !participantMap.has(parsed.codeId)) {
        participantMap.set(parsed.codeId, {
          fullCode: tx.customerId,
          idNumber: parsed.idNumber,
          codeId: parsed.codeId,
          name: parsed.name,
          eventName: tx.eventName,
          orderNumber: tx.orderNumber,
          role: 'Pembeli',
          packageItem: tx.itemName,
        });
      }
    }

    // 2. Daftar Penerima (recipients)
    const allRecipients = [...(tx.recipients || []), ...(tx.otherRecipients || [])];
    allRecipients.forEach((rcp) => {
      const parsed = parseCodeAndName(rcp);
      if (parsed.codeId && !participantMap.has(parsed.codeId)) {
        participantMap.set(parsed.codeId, {
          fullCode: rcp,
          idNumber: parsed.idNumber,
          codeId: parsed.codeId,
          name: parsed.name,
          eventName: tx.eventName,
          orderNumber: tx.orderNumber,
          role: 'Penerima',
          packageItem: tx.itemName,
        });
      }
    });
  });

  return Array.from(participantMap.values()).sort((a, b) => a.idNumber - b.idNumber);
}
