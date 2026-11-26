import { DonasiOrder } from '../donasiData';
import { IdentitasItem } from '../identitasData';
import { ResiItem } from '../resiData';
import { SalurOrder } from '../salurData';
import { ListPMDetailRow, ListPMItem, ListPMRecipient, OrganisasiItem, WhatsappDispatchLog } from '../types';
import { angkaKeTerbilang } from './terbilang';
import {
  buildWhatsappSendUrl,
  formatBillingTimestamp,
  normalizeWhatsappPhone,
} from './patronWhatsappHelper';

export type WhatsappAutomationKind = 'kwitansi_donasi' | 'resi_salur' | 'customer_direct';
export type WhatsappAutomationTone = 'ramah' | 'formal';
export type CustomerDirectTopic = 'sapaan' | 'konfirmasi_pesanan' | 'terima_kasih' | 'bebas';

export interface ResolvedWhatsappContact {
  phone: string;
  identitasId?: string;
  codeId?: string;
  nama: string;
  panggilan: string;
}

export { buildWhatsappSendUrl, formatBillingTimestamp, normalizeWhatsappPhone };

export function resolveIdentitasContactInfo(
  identitas?: IdentitasItem | null,
  fallback?: {
    identitasId?: string;
    codeId?: string;
    nama?: string;
    panggilan?: string;
    phone?: string;
  }
): ResolvedWhatsappContact {
  const rawPhone =
    (fallback?.phone && fallback.phone.trim() && fallback.phone.trim() !== '-'
      ? fallback.phone.trim()
      : '') || extractPhoneFromIdentitas(identitas || undefined);
  const nama = identitas?.namaLengkap || fallback?.nama || 'Sahabat Dharma';
  const panggilan =
    (identitas?.namaPanggilan && identitas.namaPanggilan !== '-'
      ? identitas.namaPanggilan
      : fallback?.panggilan && fallback.panggilan !== '-'
      ? fallback.panggilan
      : '') || nama;

  return {
    phone: rawPhone,
    identitasId: identitas?.id || fallback?.identitasId,
    codeId: identitas?.codeId || fallback?.codeId,
    nama,
    panggilan,
  };
}

export function getCustomerDirectTopicLabel(topic: CustomerDirectTopic): string {
  switch (topic) {
    case 'sapaan':
      return 'Sapaan & Follow Up';
    case 'konfirmasi_pesanan':
      return 'Konfirmasi Pesanan / Paket';
    case 'terima_kasih':
      return 'Ucapan Terima Kasih';
    case 'bebas':
    default:
      return 'Pesan Bebas';
  }
}

export function generateCustomerDirectWhatsappMessage(params: {
  nama: string;
  panggilan?: string;
  codeId?: string;
  topic: CustomerDirectTopic;
  tone: WhatsappAutomationTone;
  customNote?: string;
}): string {
  const { nama, panggilan, codeId, topic, tone, customNote } = params;
  const sapaan = panggilan?.trim() && panggilan.trim() !== '-' ? panggilan.trim() : nama;
  const noteText = customNote?.trim() || '';

  if (topic === 'bebas') {
    if (noteText) {
      return tone === 'formal'
        ? `Namo Buddhaya, Bapak/Ibu ${nama}.\n\n${noteText}\n\nTerima kasih atas perhatiannya. Anumodana 🙏\n— Tim YPPLN`
        : `Namo Buddhaya, ${sapaan} 🙏\n\n${noteText}\n\nTerima kasih & Anumodana 🙏\n— Tim YPPLN`;
    }
    return tone === 'formal'
      ? `Namo Buddhaya, Bapak/Ibu ${nama}.\n\nPerkenalkan kami dari Tim Yayasan Pelestarian dan Pengembangan Lamrim Nusantara (YPPLN). Mohon izin menghubungi Bapak/Ibu terkait informasi terbaru.\n\n— Tim YPPLN`
      : `Namo Buddhaya, ${sapaan} (${nama}) 🙏\n\nSemoga ${sapaan} selalu sehat dan berbahagia. Kami dari tim YPPLN ingin menyapa ${sapaan}.\n\n— Tim YPPLN`;
  }

  if (topic === 'konfirmasi_pesanan') {
    if (tone === 'formal') {
      return [
        `Namo Buddhaya, Bapak/Ibu ${nama}${codeId ? ` (ID: ${codeId})` : ''}.`,
        ``,
        `Kami dari Tim S-SALUR YPPLN ingin melakukan konfirmasi terkait pesanan/pengiriman Dharma item atas nama Bapak/Ibu agar proses tindak lanjut berjalan lancar.`,
        noteText ? `\nKeterangan: ${noteText}` : null,
        ``,
        `Mohon kesediaan Bapak/Ibu membalas pesan ini apabila membutuhkan informasi nomor resi atau penyesuaian alamat pengiriman.`,
        `— Tim S-SALUR YPPLN`,
      ]
        .filter((l) => l !== null)
        .join('\n');
    }
    return [
      `Namo Buddhaya, ${sapaan} (${nama}) 🙏`,
      ``,
      `Kami dari Tim S-SALUR YPPLN mau follow up terkait pesanan buku/Dharma item ${sapaan}${codeId ? ` (ID: ${codeId})` : ''}.`,
      noteText ? `\n📌 ${noteText}` : null,
      ``,
      `Apakah ada yang bisa kami bantu atau konfirmasikan terkait pengiriman maupun ketersediaan item? Silakan balas pesan ini ya, ${sapaan}. Anumodana 🙏`,
      `— Tim S-SALUR YPPLN`,
    ]
      .filter((l) => l !== null)
      .join('\n');
  }

  if (topic === 'terima_kasih') {
    if (tone === 'formal') {
      return [
        `Namo Buddhaya, Bapak/Ibu ${nama}.`,
        ``,
        `Kami mengucapkan terima kasih yang tulus atas partisipasi dan dukungan Bapak/Ibu dalam mendukung penyebaran Dharma bersama Yayasan Pelestarian dan Pengembangan Lamrim Nusantara (YPPLN).`,
        noteText ? `\nCatatan: ${noteText}` : null,
        ``,
        `Semoga kebajikan ini senantiasa membawa kedamaian dan kesehatan bagi Bapak/Ibu beserta keluarga. Anumodana.`,
        `— Tim YPPLN`,
      ]
        .filter((l) => l !== null)
        .join('\n');
    }
    return [
      `Namo Buddhaya, ${sapaan} (${nama}) 🙏`,
      ``,
      `Terima kasih banyak atas dukungan dan kebajikan ${sapaan} bersama YPPLN selama ini. Semoga ${sapaan} beserta keluarga selalu diberikan kesehatan, kelancaran, dan kebahagiaan.`,
      noteText ? `\n💬 ${noteText}` : null,
      ``,
      `Anumodana & salam hangat dari kami 🙏`,
      `— Tim YPPLN`,
    ]
      .filter((l) => l !== null)
      .join('\n');
  }

  // topic === 'sapaan'
  if (tone === 'formal') {
    return [
      `Namo Buddhaya, Bapak/Ibu ${nama}${codeId ? ` (ID: ${codeId})` : ''}.`,
      ``,
      `Kami dari Tim YPPLN bermaksud menyapa sekaligus melakukan tindak lanjut (follow up) kepada Bapak/Ibu. Apabila terdapat kebutuhan terkait buku Dharma, program donasi, atau kegiatan YPPLN, Bapak/Ibu dapat menghubungi kami melalui pesan ini.`,
      noteText ? `\nCatatan: ${noteText}` : null,
      ``,
      `Terima kasih atas perhatian Bapak/Ibu. Anumodana.`,
      `— Tim YPPLN`,
    ]
      .filter((l) => l !== null)
      .join('\n');
  }

  return [
    `Namo Buddhaya, ${sapaan} (${nama}) 🙏`,
    ``,
    `Apa kabar ${sapaan}? Semoga selalu sehat dan berbahagia ya. Kami dari Tim YPPLN ingin menyapa sekaligus follow up, barangkali ada buku Dharma, informasi kegiatan, atau bantuan yang sedang ${sapaan} butuhkan.`,
    noteText ? `\n💬 ${noteText}` : null,
    ``,
    `Jangan sungkan balas pesan ini kapan saja ya, ${sapaan}. Anumodana 🙏`,
    `— Tim YPPLN`,
  ]
    .filter((l) => l !== null)
    .join('\n');
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    return true;
  } catch {
    return false;
  }
}

export function formatIndonesianTimestamp(date: Date = new Date()): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const d = date.getDate().toString().padStart(2, '0');
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  return `${d} ${m} ${y} ${hh}:${mm}`;
}

export function formatIndonesianDateOnly(date: Date = new Date()): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatKwitansiNumberFromOrder(order: DonasiOrder): string {
  if (order.lastWhatsappKwitansiNumber && order.lastWhatsappKwitansiNumber.trim()) {
    return order.lastWhatsappKwitansiNumber;
  }
  const cleanNum = order.orderNumber.replace(/[^0-9]/g, '').slice(-6) || '000001';
  const year = new Date().getFullYear();
  return `KWT-DN/${year}/${cleanNum}`;
}

function parseCustomerToken(raw?: string): { codeId?: string; namePart?: string } {
  if (!raw || !raw.trim()) return {};
  const trimmed = raw.trim();
  const match = trimmed.match(/^([A-Za-z0-9-]+)\s+(.+)$/);
  if (match && /\d/.test(match[1])) {
    return { codeId: match[1].trim(), namePart: match[2].trim() };
  }
  return { namePart: trimmed };
}

function extractPhoneFromIdentitas(item?: IdentitasItem): string {
  if (!item) return '';
  if (item.nomorHandPhone && item.nomorHandPhone.trim() && item.nomorHandPhone.trim() !== '-') {
    return item.nomorHandPhone.trim();
  }
  const addrPhone = item.alamatList?.find(
    (a) => a.nomorHp && a.nomorHp.trim() && a.nomorHp.trim() !== '-'
  )?.nomorHp;
  return addrPhone ? addrPhone.trim() : '';
}

function findIdentitasMatch(
  identitasList: IdentitasItem[],
  candidates: Array<string | undefined>
): IdentitasItem | undefined {
  if (!identitasList || identitasList.length === 0) return undefined;
  for (const raw of candidates) {
    if (!raw || !raw.trim() || raw.trim() === '-') continue;
    const { codeId, namePart } = parseCustomerToken(raw);
    const rawNorm = raw.trim().toLowerCase();
    const codeNorm = codeId?.toLowerCase();
    const nameNorm = namePart?.toLowerCase();

    const matched = identitasList.find((id) => {
      if (id.id.toLowerCase() === rawNorm) return true;
      if (id.codeId && (id.codeId.toLowerCase() === rawNorm || (codeNorm && id.codeId.toLowerCase() === codeNorm))) {
        return true;
      }
      const fullNorm = id.namaLengkap.trim().toLowerCase();
      if (fullNorm === rawNorm || (nameNorm && fullNorm === nameNorm)) return true;
      return false;
    });
    if (matched) return matched;
  }
  return undefined;
}

function findOrganisasiMatch(
  organisasiList: OrganisasiItem[],
  candidates: Array<string | undefined>
): OrganisasiItem | undefined {
  if (!organisasiList || organisasiList.length === 0) return undefined;
  for (const raw of candidates) {
    if (!raw || !raw.trim() || raw.trim() === '-') continue;
    const { namePart } = parseCustomerToken(raw);
    const rawNorm = raw.trim().toLowerCase();
    const nameNorm = namePart?.toLowerCase();
    const matched = organisasiList.find(
      (org) =>
        org.id.toLowerCase() === rawNorm ||
        org.namaOrg.trim().toLowerCase() === rawNorm ||
        (nameNorm && org.namaOrg.trim().toLowerCase() === nameNorm)
    );
    if (matched) return matched;
  }
  return undefined;
}

export function resolveDonasiContactInfo(
  order: DonasiOrder,
  identitasList: IdentitasItem[] = [],
  organisasiList: OrganisasiItem[] = []
): ResolvedWhatsappContact {
  const token = parseCustomerToken(order.customerId);
  const displayName = order.namaDonatur?.name || token.namePart || order.customerId || 'Donatur';
  const identMatch = findIdentitasMatch(identitasList, [order.customerId, order.namaDonatur?.name]);
  const orgMatch = findOrganisasiMatch(organisasiList, [order.customerId, order.namaDonatur?.name]);

  let phone = '';
  if (order.lastWhatsappSentPhone && normalizeWhatsappPhone(order.lastWhatsappSentPhone)) {
    phone = order.lastWhatsappSentPhone;
  } else if (identMatch) {
    phone = extractPhoneFromIdentitas(identMatch);
  }
  if (!phone && orgMatch) {
    if (orgMatch.hp && orgMatch.hp !== '-') phone = orgMatch.hp.trim();
    else if (orgMatch.picOrgHp && orgMatch.picOrgHp !== '-') phone = orgMatch.picOrgHp.trim();
  }

  return {
    phone,
    identitasId: identMatch?.id || orgMatch?.id,
    codeId: identMatch?.codeId || token.codeId,
    nama: identMatch?.namaLengkap || displayName,
    panggilan:
      identMatch?.namaPanggilan && identMatch.namaPanggilan !== '-'
        ? identMatch.namaPanggilan
        : displayName,
  };
}

export function resolveSalurContactInfo(
  order: SalurOrder,
  identitasList: IdentitasItem[] = [],
  organisasiList: OrganisasiItem[] = []
): ResolvedWhatsappContact {
  const token = parseCustomerToken(order.idPenerima || order.customerCode || order.idPembeli || order.customerId);
  const displayName = order.alamat?.recipientName || token.namePart || 'Sahabat Dharma';
  const identMatch = findIdentitasMatch(identitasList, [
    order.idPenerima,
    order.customerCode,
    order.idPembeli,
    order.customerId,
    order.alamat?.recipientName,
  ]);
  const orgMatch = findOrganisasiMatch(organisasiList, [
    order.idPenerima,
    order.customerCode,
    order.alamat?.recipientName,
  ]);

  let phone = '';
  if (order.lastWhatsappResiSentPhone && normalizeWhatsappPhone(order.lastWhatsappResiSentPhone)) {
    phone = order.lastWhatsappResiSentPhone;
  } else if (order.alamat?.phone && order.alamat.phone.trim() && order.alamat.phone.trim() !== '-') {
    phone = order.alamat.phone.trim();
  } else if (identMatch) {
    phone = extractPhoneFromIdentitas(identMatch);
  }
  if (!phone && orgMatch) {
    if (orgMatch.hp && orgMatch.hp !== '-') phone = orgMatch.hp.trim();
    else if (orgMatch.picOrgHp && orgMatch.picOrgHp !== '-') phone = orgMatch.picOrgHp.trim();
  }

  return {
    phone,
    identitasId: identMatch?.id || orgMatch?.id,
    codeId: identMatch?.codeId || token.codeId,
    nama: displayName,
    panggilan:
      identMatch?.namaPanggilan && identMatch.namaPanggilan !== '-'
        ? identMatch.namaPanggilan
        : displayName,
  };
}

export function findLinkedSalurOrderForResi(
  resiItem: ResiItem,
  salurOrders: SalurOrder[] = []
): SalurOrder | undefined {
  if (!salurOrders || salurOrders.length === 0) return undefined;
  const kodeNorm = (resiItem.kode || '').trim().toLowerCase();
  const resiNorm = (resiItem.resi || '').trim().toLowerCase();

  if (kodeNorm) {
    const byKode = salurOrders.find((o) => {
      const ordNorm = (o.orderNumber || '').trim().toLowerCase();
      return ordNorm === kodeNorm || (ordNorm && (kodeNorm.includes(ordNorm) || ordNorm.includes(kodeNorm)));
    });
    if (byKode) return byKode;
  }

  if (resiNorm) {
    const byResi = salurOrders.find(
      (o) => (o.ekspedisi?.noResi || '').trim().toLowerCase() === resiNorm
    );
    if (byResi) return byResi;
  }

  return undefined;
}

export function resolveResiContactInfo(
  resiItem: ResiItem,
  salurOrders: SalurOrder[] = [],
  identitasList: IdentitasItem[] = [],
  organisasiList: OrganisasiItem[] = []
): { contact: ResolvedWhatsappContact; linkedOrder?: SalurOrder } {
  const linkedOrder = findLinkedSalurOrderForResi(resiItem, salurOrders);
  if (linkedOrder) {
    const orderContact = resolveSalurContactInfo(linkedOrder, identitasList, organisasiList);
    if (resiItem.lastWhatsappSentPhone && normalizeWhatsappPhone(resiItem.lastWhatsappSentPhone)) {
      return {
        contact: { ...orderContact, phone: resiItem.lastWhatsappSentPhone },
        linkedOrder,
      };
    }
    return { contact: orderContact, linkedOrder };
  }

  const identMatch = findIdentitasMatch(identitasList, [resiItem.nama]);
  const orgMatch = findOrganisasiMatch(organisasiList, [resiItem.nama]);
  let phone = resiItem.lastWhatsappSentPhone || '';
  if (!phone && identMatch) phone = extractPhoneFromIdentitas(identMatch);
  if (!phone && orgMatch) phone = orgMatch.hp && orgMatch.hp !== '-' ? orgMatch.hp : orgMatch.picOrgHp || '';

  return {
    contact: {
      phone,
      identitasId: identMatch?.id || orgMatch?.id,
      codeId: identMatch?.codeId,
      nama: resiItem.nama,
      panggilan:
        identMatch?.namaPanggilan && identMatch.namaPanggilan !== '-'
          ? identMatch.namaPanggilan
          : resiItem.nama,
    },
    linkedOrder: undefined,
  };
}

export function generateKwitansiDonasiWhatsappMessage(params: {
  order: DonasiOrder;
  kwitansiNumber: string;
  recipientPanggilan?: string;
  includePelimpahanJasa?: boolean;
  tone: WhatsappAutomationTone;
  customNote?: string;
}): string {
  const {
    order,
    kwitansiNumber,
    recipientPanggilan,
    includePelimpahanJasa = true,
    tone,
    customNote,
  } = params;

  const numericTotal = parseInt((order.totalDana || '').replace(/[^0-9]/g, ''), 10) || 0;
  const terbilangText = angkaKeTerbilang(numericTotal);
  const panggilan = recipientPanggilan?.trim() || order.namaDonatur.name;
  const allItems = [...(order.items || []), ...(order.extraItems || [])];
  const itemLines =
    allItems.length > 0
      ? allItems.map((i) => `• ${i.name} (${i.qtyPrice})`).join('\n')
      : `• ${order.keterangan?.title || 'Donasi YPPLN'}`;
  const pelimpahanNames =
    includePelimpahanJasa && order.pelimpahanJasa?.name
      ? order.pelimpahanJasa.allNames?.join(', ') || order.pelimpahanJasa.name
      : '';

  const isPaid = order.statusBadges.some((b) => b.toLowerCase() === 'paid');
  const statusText = isPaid ? 'LUNAS (PAID)' : 'TERCATAT (MENUNGGU VERIFIKASI)';
  const noteBlock = customNote?.trim() ? `\nCatatan: ${customNote.trim()}` : '';

  if (tone === 'formal') {
    return [
      `*TANDA TERIMA DONASI RESMI*`,
      `*YAYASAN PELESTARIAN DAN PENGEMBANGAN LAMRIM NUSANTARA*`,
      ``,
      `Namo Buddhaya, Bapak/Ibu ${order.namaDonatur.name}.`,
      `Dengan hormat, kami sampaikan konfirmasi penerimaan donasi dengan rincian sebagai berikut:`,
      ``,
      `No. Kwitansi : *${kwitansiNumber}*`,
      `No. Transaksi : ${order.orderNumber}`,
      `Tanggal : ${order.date}`,
      `Donatur : ${order.namaDonatur.name} (${order.customerId})`,
      `Nominal : *${order.totalDana}*`,
      `Terbilang : _${terbilangText}_`,
      `Status : *${statusText}*`,
      ``,
      `Rincian Program/Dana:`,
      itemLines,
      pelimpahanNames ? `\nPelimpahan Jasa:\n${pelimpahanNames}` : null,
      noteBlock ? noteBlock.trim() : null,
      ``,
      `Terima kasih atas dukungan dan kemurahan hati Bapak/Ibu dalam mendukung pelestarian Dharma. Anumodana.`,
      `— Bagian Keuangan & Donasi YPPLN`,
    ]
      .filter((l) => l !== null)
      .join('\n');
  }

  // tone === 'ramah'
  return [
    `Namo Buddhaya, ${panggilan} (${order.namaDonatur.name}) 🙏`,
    ``,
    `Terima kasih banyak atas dana kebajikan yang telah disalurkan melalui Yayasan Pelestarian dan Pengembangan Lamrim Nusantara (YPPLN). Berikut tanda terima donasi digital Anda:`,
    ``,
    `🧾 *No. Kwitansi:* ${kwitansiNumber}`,
    `🔖 *Ref Transaksi:* ${order.orderNumber}`,
    `📅 *Tanggal:* ${order.date}`,
    `💰 *Jumlah Dana:* *${order.totalDana}*`,
    `📝 *Terbilang:* _${terbilangText}_`,
    `✅ *Status:* *${statusText}*`,
    ``,
    `*Program / Keperluan:*`,
    itemLines,
    pelimpahanNames ? `\n🙏 *Pelimpahan Jasa untuk:* ${pelimpahanNames}` : null,
    noteBlock ? noteBlock.trim() : null,
    ``,
    `Semoga benih kebajikan ini berbuah kebahagiaan, kesehatan, dan kedamaian bagi ${panggilan} beserta keluarga serta semua makhluk. Anumodana 🙏`,
    `— Tim Donasi & Keuangan YPPLN`,
  ]
    .filter((l) => l !== null)
    .join('\n');
}

function getCourierTrackingHint(ekspedisi?: string): string {
  const up = (ekspedisi || '').toUpperCase();
  if (up.includes('LION')) return 'Lacak di lionparcel.com/track/stt';
  if (up.includes('TIKI')) return 'Lacak di tiki.id/id/track';
  if (up.includes('JNE')) return 'Lacak di jne.co.id';
  if (up.includes('JNT') || up.includes('J&T')) return 'Lacak di jet.co.id/track';
  if (up.includes('SICEPAT')) return 'Lacak di sicepat.com/checkAwb';
  if (up.includes('POS')) return 'Lacak di posindonesia.co.id';
  if (up.includes('ANTERAJA')) return 'Lacak di anteraja.id/tracking';
  return 'Silakan lacak nomor resi di situs resmi ekspedisi terkait';
}

export function generateResiSalurWhatsappMessage(params: {
  order?: SalurOrder;
  resiItem?: ResiItem;
  noResi?: string;
  ekspedisi?: string;
  recipientPanggilan?: string;
  tone: WhatsappAutomationTone;
  customNote?: string;
}): string {
  const { order, resiItem, recipientPanggilan, tone, customNote } = params;
  const resolvedResi =
    (params.noResi || order?.ekspedisi?.noResi || resiItem?.resi || '').trim();
  const resolvedEkspedisi =
    (params.ekspedisi || order?.ekspedisi?.name || resiItem?.ekspedisi || 'Ekspedisi').trim();
  const recipientName = order?.alamat?.recipientName || resiItem?.nama || 'Sahabat Dharma';
  const panggilan = recipientPanggilan?.trim() || recipientName;
  const orderCode = order?.orderNumber || resiItem?.kode || '-';
  const shipDate = order?.date || resiItem?.tanggal || formatIndonesianDateOnly();
  const addressText = order
    ? [order.alamat?.street, order.alamat?.cityProvince, order.alamat?.postalCode]
        .filter((s) => Boolean(s && s.trim() && s.trim() !== '-'))
        .join(', ')
    : resiItem?.tujuan || '-';

  const itemLines =
    order && order.items && order.items.length > 0
      ? order.items.map((it) => `• ${it.title} (${it.quantity} pcs)`).join('\n')
      : '';

  const trackHint = getCourierTrackingHint(resolvedEkspedisi);
  const noteBlock = customNote?.trim() ? `\nCatatan: ${customNote.trim()}` : '';

  if (tone === 'formal') {
    return [
      `*KONFIRMASI PENGIRIMAN & NOMOR RESI S-SALUR*`,
      `*YAYASAN PELESTARIAN DAN PENGEMBANGAN LAMRIM NUSANTARA*`,
      ``,
      `Namo Buddhaya, Bapak/Ibu ${recipientName}.`,
      `Paket pesanan Anda telah diserahkan ke pihak ekspedisi dengan rincian sebagai berikut:`,
      ``,
      `No. Pesanan : ${orderCode}`,
      `Tanggal : ${shipDate}`,
      `Ekspedisi : *${resolvedEkspedisi}*`,
      `No. Resi : *${resolvedResi || '(Belum tersedia)'}*`,
      `Alamat Tujuan : ${addressText}`,
      itemLines ? `\nDaftar Item:\n${itemLines}` : null,
      noteBlock ? noteBlock.trim() : null,
      ``,
      `Informasi Pelacakan: ${trackHint}.`,
      `Apabila paket telah diterima atau terdapat kendala pengiriman, mohon berkenan menghubungi tim kami.`,
      `— Tim S-SALUR YPPLN`,
    ]
      .filter((l) => l !== null)
      .join('\n');
  }

  // tone === 'ramah'
  return [
    `Namo Buddhaya, ${panggilan} (${recipientName}) 🙏`,
    ``,
    `Kabar baik! Paket S-SALUR YPPLN Anda sudah dikirim oleh tim kami. Berikut detail pengirimannya:`,
    ``,
    `📦 *No. Pesanan:* ${orderCode}`,
    `🚚 *Ekspedisi:* *${resolvedEkspedisi}*`,
    `🔖 *No. Resi:* *${resolvedResi || '(Belum tersedia)'}*`,
    `📍 *Tujuan:* ${addressText}`,
    itemLines ? `\n*Isi Paket:*\n${itemLines}` : null,
    noteBlock ? noteBlock.trim() : null,
    ``,
    `🔎 ${trackHint}.`,
    `Jika paket sudah tiba dengan baik atau ada yang ingin ditanyakan, silakan balas pesan ini ya. Terima kasih & Anumodana 🙏`,
    `— Tim S-SALUR YPPLN`,
  ]
    .filter((l) => l !== null)
    .join('\n');
}

export function buildListPMLogEntryForWhatsapp(params: {
  kind: WhatsappAutomationKind;
  contact: ResolvedWhatsappContact;
  phone: string;
  referenceNumber: string;
  subtitle: string;
  itemStockOrDetail: string;
  proyekKode?: string;
  messageText: string;
  actorName?: string;
  now?: Date;
}): ListPMItem {
  const {
    kind,
    contact,
    phone,
    referenceNumber,
    subtitle,
    itemStockOrDetail,
    proyekKode,
    messageText,
    actorName,
    now = new Date(),
  } = params;

  const sentAtStr = formatIndonesianTimestamp(now);
  const dateOnlyStr = formatIndonesianDateOnly(now);
  const safeRef = (referenceNumber || `${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
  const isDonasi = kind === 'kwitansi_donasi';
  const isCustomerDirect = kind === 'customer_direct';
  const proyekSapa = isDonasi
    ? 'Kirim Kwitansi Donasi'
    : isCustomerDirect
    ? 'Follow Up Customer'
    : 'Kirim Resi';
  const kode = proyekKode || (isDonasi ? 'FUN' : isCustomerDirect ? 'SAPA' : 'MAD');
  const kindSlug = isDonasi ? 'donasi' : isCustomerDirect ? 'cust' : 'resi';
  const initial = (contact.nama || 'A').charAt(0).toUpperCase();
  const cleanPhone = phone.trim() || '-';
  const itemTitle = isDonasi
    ? `Kwitansi ${referenceNumber}`
    : isCustomerDirect
    ? `WA Customer · ${referenceNumber || 'Follow Up'}`
    : `Resi ${referenceNumber}`;

  const recipient: ListPMRecipient = {
    id: `wa-${kindSlug}-${safeRef}-${now.getTime()}`,
    identitasId: contact.identitasId,
    codeId: contact.codeId,
    nama: contact.nama,
    nomorHp: cleanPhone,
    isSent: true,
    sentAt: sentAtStr,
  };

  const detailRow: ListPMDetailRow = {
    id: `wa-dr-${kindSlug}-${safeRef}-${now.getTime()}`,
    deadline: '-',
    identitasId: contact.identitasId,
    codeId: contact.codeId,
    nama: contact.nama,
    nomorHp: cleanPhone,
    avatarInitial: initial,
    avatarBg: 'bg-[#008d91]',
    proyekSapa,
    proyekKode: kode,
    templateName: isDonasi
      ? 'WA Kwitansi Otomatis'
      : isCustomerDirect
      ? 'WA Customer Langsung'
      : 'WA Resi Otomatis',
    templateContent: messageText,
    itemTitle,
    itemSubtitle: subtitle,
    itemStock: itemStockOrDetail,
    status: 'done_teal',
    sentAt: sentAtStr,
    isManualStatus: true,
  };

  return {
    id: `pm-wa-${kindSlug}-${now.getTime()}`,
    proyekSapa,
    proyekKode: kode,
    iconType: isDonasi ? 'creditCard' : isCustomerDirect ? 'rocket' : 'package',
    targetType: 'single',
    targetCount: 1,
    targetAvatars: [{ initial, bg: 'bg-[#008d91]' }],
    singleTarget: {
      identitasId: contact.identitasId,
      codeId: contact.codeId,
      nama: contact.nama,
      nomorHp: cleanPhone,
      avatarInitial: initial,
      avatarBg: 'bg-[#008d91]',
    },
    deadline: '-',
    deadlineColor: 'teal',
    templatePesan: messageText,
    progressPercent: 100,
    recipients: [recipient],
    detailBadge: {
      label: proyekSapa,
      countText: '1 Orang',
    },
    detailRows: [detailRow],
    createdAt: dateOnlyStr,
    tanggalMulaiPM: dateOnlyStr,
    tanggalMulaiDihubungi: dateOnlyStr,
    statusBisaPM: 'sudah',
    dihubungiOleh: actorName || 'Admin YPPLN',
    dihubungiOlehType: 'call_center',
  };
}

export function createWhatsappDispatchLog(params: {
  kind: WhatsappAutomationKind;
  phone: string;
  recipientName: string;
  referenceNumber: string;
  identitasId?: string;
  topicLabel?: string;
  ekspedisi?: string;
  tone: WhatsappAutomationTone;
  messagePreview: string;
  channel: 'whatsapp_open' | 'manual_mark';
  loggedToListPM: boolean;
  sentBy?: string;
}): WhatsappDispatchLog {
  return {
    id: `wa-log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    kind: params.kind,
    sentAt: new Date().toISOString(),
    sentBy: params.sentBy || 'Admin YPPLN',
    phone: params.phone.trim() || '-',
    recipientName: params.recipientName,
    referenceNumber: params.referenceNumber,
    identitasId: params.identitasId,
    topicLabel: params.topicLabel,
    ekspedisi: params.ekspedisi,
    tone: params.tone,
    messagePreview: params.messagePreview,
    channel: params.channel,
    loggedToListPM: params.loggedToListPM,
    listPMProyekSapa:
      params.kind === 'kwitansi_donasi'
        ? 'Kirim Kwitansi Donasi'
        : params.kind === 'customer_direct'
        ? 'Follow Up Customer'
        : 'Kirim Resi',
  };
}
