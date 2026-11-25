import { DharmaPatronRutinItem, OrganisasiItem, RekeningItem } from '../types';
import { IdentitasItem } from '../identitasData';
import { INITIAL_REKENING_ITEMS } from '../rekeningData';

export type WhatsappBillingTone = 'ramah' | 'pengingat' | 'tegas';

export function normalizeWhatsappPhone(rawPhone?: string): string {
  if (!rawPhone) return '';
  const cleaned = rawPhone.replace(/[^\d+]/g, '');
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length < 8) return '';
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `62${digits}`;
  return digits;
}

export function formatDisplayPhone(rawPhone?: string): string {
  if (!rawPhone || rawPhone.trim() === '-') return '';
  return rawPhone.trim();
}

export function resolvePatronContactPhone(
  patron: DharmaPatronRutinItem,
  identitasList: IdentitasItem[] = [],
  organisasiList: OrganisasiItem[] = []
): string {
  if (patron.nomorHp && patron.nomorHp.trim() && patron.nomorHp.trim() !== '-') {
    return patron.nomorHp.trim();
  }

  if (identitasList.length > 0) {
    const matchedIdentitas = identitasList.find(
      (id) =>
        (patron.identitasId &&
          (id.codeId === patron.identitasId || id.id === patron.identitasId)) ||
        id.namaLengkap.toLowerCase().trim() === patron.namaDonatur.toLowerCase().trim()
    );
    if (matchedIdentitas) {
      if (matchedIdentitas.nomorHandPhone && matchedIdentitas.nomorHandPhone !== '-') {
        return matchedIdentitas.nomorHandPhone.trim();
      }
      const addrPhone = matchedIdentitas.alamatList?.find(
        (a) => a.nomorHp && a.nomorHp.trim() && a.nomorHp.trim() !== '-'
      )?.nomorHp;
      if (addrPhone) return addrPhone.trim();
    }
  }

  if (organisasiList.length > 0) {
    const matchedOrg = organisasiList.find(
      (org) =>
        (patron.identitasId &&
          (org.id === patron.identitasId ||
            org.namaOrg.toLowerCase().trim() === patron.identitasId.toLowerCase().trim())) ||
        org.namaOrg.toLowerCase().trim() === patron.namaDonatur.toLowerCase().trim()
    );
    if (matchedOrg?.hp && matchedOrg.hp !== '-') {
      return matchedOrg.hp.trim();
    }
    if (matchedOrg?.picOrgHp && matchedOrg.picOrgHp !== '-') {
      return matchedOrg.picOrgHp.trim();
    }
  }

  return '';
}

export function getDefaultPatronBankAccount(rekeningList: RekeningItem[] = []): RekeningItem {
  const source = rekeningList.length > 0 ? rekeningList : INITIAL_REKENING_ITEMS;
  return (
    source.find((r) => r.nama.toLowerCase().includes('bca 888')) ||
    source.find((r) => r.nama.toLowerCase().includes('bca')) ||
    source[0]
  );
}

export function generatePatronBillingMessage(params: {
  patron: DharmaPatronRutinItem;
  tone: WhatsappBillingTone;
  rekening?: RekeningItem;
  customNote?: string;
}): string {
  const { patron, tone, rekening, customNote } = params;
  const panggilan =
    patron.panggilan && patron.panggilan !== '-'
      ? patron.panggilan
      : patron.namaPendek || patron.namaDonatur;
  const piutangAbs = Math.abs(Number(patron.piutang || 0));
  const donasiBulanan = Number(patron.donasiPerbulan || 0);
  const totalTagihan = piutangAbs > 0 ? piutangAbs : donasiBulanan;
  const bulanPiutang =
    patron.bulanPiutang && patron.bulanPiutang !== '-'
      ? patron.bulanPiutang
      : 'bulan berjalan';

  const nominalStr = `Rp${totalTagihan.toLocaleString('id-ID')}`;
  const rutinStr = `Rp${donasiBulanan.toLocaleString('id-ID')}`;
  const bankInfo = rekening
    ? `${rekening.bankCode || rekening.nama} ${rekening.nomorRekening || ''} a.n. ${
        rekening.atasNama || 'Yayasan Pelestarian dan Pengembangan Lamrim Nusantara'
      }`.trim()
    : 'BCA 0077119888 a.n. Yayasan Pelestarian dan Pengembangan Lamrim Nusantara';

  const noteLine = customNote?.trim() ? `\nCatatan: ${customNote.trim()}\n` : '';

  if (tone === 'ramah') {
    return [
      `Namo Buddhaya, ${panggilan} (${patron.namaDonatur}) 🙏`,
      '',
      `Semoga ${panggilan} beserta keluarga selalu sehat, damai, dan berbahagia.`,
      '',
      `Melalui pesan ini kami bermaksud menyampaikan pengingat lembut terkait komitmen Dana Dharma Patron Rutin (ID Donatur: ${
        patron.noDonatur || '-'
      }) sebesar ${rutinStr}/bulan.`,
      `Berdasarkan pencatatan kami hingga saat ini, terdapat tunggakan untuk periode *${bulanPiutang}* dengan total sebesar *${nominalStr}*.`,
      noteLine ? noteLine.trim() : null,
      '',
      `Dana Dharma Patron dapat disalurkan melalui rekening resmi YPPLN:`,
      `🏦 *${bankInfo}*`,
      '',
      `Apabila ${panggilan} sudah melakukan transfer sebelumnya, mohon berkenan mengirimkan bukti transfer agar segera kami catat di sistem. Jika ada kendala atau penyesuaian jadwal donasi, silakan beri tahu kami ya.`,
      '',
      `Terima kasih atas dukungan dan kebajikan ${panggilan} selama ini. Anumodana 🙏`,
      `— Tim Dharma Patron YPPLN`,
    ]
      .filter((line) => line !== null)
      .join('\n');
  }

  if (tone === 'pengingat') {
    return [
      `Namo Buddhaya, ${panggilan}.`,
      '',
      `Berikut rincian pengingat Dana Dharma Patron Rutin YPPLN:`,
      `• Nama Donatur: ${patron.namaDonatur}`,
      `• ID Donatur: ${patron.noDonatur || '-'}`,
      `• Komitmen Bulanan: ${rutinStr}`,
      `• Periode Belum Tercatat: *${bulanPiutang}*`,
      `• Total Tagihan: *${nominalStr}*`,
      customNote?.trim() ? `• Catatan: ${customNote.trim()}` : null,
      '',
      `Transfer dapat ditujukan ke:`,
      `${bankInfo}`,
      '',
      `Mohon konfirmasi bukti transfer setelah pembayaran dilakukan agar pencatatan mutasi kami mutakhirkan. Terima kasih, Anumodana 🙏`,
    ]
      .filter((line) => line !== null)
      .join('\n');
  }

  // tone === 'tegas'
  return [
    `Namo Buddhaya, Bapak/Ibu ${patron.namaDonatur} (${panggilan}).`,
    '',
    `Sehubungan dengan penutupan rekapitulasi Dana Dharma Patron Rutin (ID: ${
      patron.noDonatur || '-'
    }), kami informasikan bahwa masih terdapat komitmen donasi yang belum terkonfirmasi untuk periode *${bulanPiutang}* senilai *${nominalStr}*.`,
    customNote?.trim() ? `\nCatatan Tambahan: ${customNote.trim()}` : null,
    '',
    `Mohon kesediaan Bapak/Ibu untuk mengonfirmasi status pembayaran atau menyelesaikan transfer ke rekening resmi berikut:`,
    `${bankInfo}`,
    '',
    `Apabila berencana melakukan penyesuaian nominal atau penonaktifan sementara komitmen Dharma Patron, mohon informasikan kepada kami agar status kepesertaan dapat diperbarui dengan tepat.`,
    '',
    `Terima kasih atas perhatian dan kerja samanya. Anumodana 🙏`,
    `— Administrasi Keuangan & Dharma Patron YPPLN`,
  ]
    .filter((line) => line !== null)
    .join('\n');
}

export function buildWhatsappSendUrl(rawPhone: string | undefined, message: string): string {
  const normalized = normalizeWhatsappPhone(rawPhone);
  const encodedMsg = encodeURIComponent(message);
  if (normalized) {
    return `https://wa.me/${normalized}?text=${encodedMsg}`;
  }
  return `https://wa.me/?text=${encodedMsg}`;
}

export function getWhatsappToneLabel(tone: WhatsappBillingTone): string {
  if (tone === 'ramah') return 'Ramah';
  if (tone === 'pengingat') return 'Terstruktur';
  return 'Formal';
}

export function formatBillingTimestamp(iso?: string, compact = false): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (compact) {
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
    });
  }
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export interface PatronBillingStatusSummary {
  hasBeenBilled: boolean;
  isBilledThisMonth: boolean;
  isBilledWithin7Days: boolean;
  lastBilledAt?: string;
  lastBilledBy?: string;
  lastBilledPhone?: string;
  lastBilledAmount?: number;
  lastBilledBulan?: string;
  history: import('../types').PatronWhatsappBillingLog[];
  historyCount: number;
  compactDateLabel: string;
  fullDateLabel: string;
}

export function getPatronBillingStatus(
  patron: DharmaPatronRutinItem,
  referenceDate: Date = new Date()
): PatronBillingStatusSummary {
  const history = Array.isArray(patron.whatsappBillingHistory)
    ? [...patron.whatsappBillingHistory].sort((a, b) =>
        (b.billedAt || '').localeCompare(a.billedAt || '')
      )
    : [];

  const latestFromHistory = history[0];
  const lastBilledAt = patron.lastWhatsappBilledAt || latestFromHistory?.billedAt;
  const lastBilledBy = patron.lastWhatsappBilledBy || latestFromHistory?.billedBy;
  const lastBilledPhone = patron.lastWhatsappBilledPhone || latestFromHistory?.phone;
  const lastBilledAmount =
    patron.lastWhatsappBilledAmount ?? latestFromHistory?.nominalTagihan;
  const lastBilledBulan = patron.lastWhatsappBilledBulan || latestFromHistory?.bulanPiutang;

  let isBilledThisMonth = false;
  let isBilledWithin7Days = false;

  if (lastBilledAt) {
    const billedDate = new Date(lastBilledAt);
    if (!Number.isNaN(billedDate.getTime())) {
      isBilledThisMonth =
        billedDate.getFullYear() === referenceDate.getFullYear() &&
        billedDate.getMonth() === referenceDate.getMonth();
      const diffMs = referenceDate.getTime() - billedDate.getTime();
      isBilledWithin7Days = diffMs >= -86400000 && diffMs <= 7 * 86400000;
    }
  }

  return {
    hasBeenBilled: Boolean(lastBilledAt),
    isBilledThisMonth,
    isBilledWithin7Days,
    lastBilledAt,
    lastBilledBy,
    lastBilledPhone,
    lastBilledAmount,
    lastBilledBulan,
    history,
    historyCount: history.length > 0 ? history.length : lastBilledAt ? 1 : 0,
    compactDateLabel: formatBillingTimestamp(lastBilledAt, true),
    fullDateLabel: formatBillingTimestamp(lastBilledAt, false),
  };
}

