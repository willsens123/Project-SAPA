import { ViaTransaksiSalurItem, INITIAL_VIA_TRANSAKSI_SALUR } from './viaSalurData';
import { ResiItem } from './resiData';

export type ChatAutoTriggerType =
  | 'saat_input_resi'
  | 'setelah_resi_diinput'
  | 'pesanan_selesai';

export type ChatAutoDelayUnit = 'menit' | 'jam' | 'hari' | 'minggu' | 'bulan';

export type ChatAutoTargetType = 'pembeli' | 'penerima' | 'keduanya';

export interface ChatAutoRule {
  id: string;
  namaAturan: string;
  deskripsi: string;
  pemicu: ChatAutoTriggerType;
  delayValue: number; // e.g. 0 for immediate, 1 for 1 month, 7 for 7 days
  delayUnit: ChatAutoDelayUnit;
  templatePmId: string;
  templatePmName: string;
  semuaVia: boolean; // true = semua via; false = hanya via yang dipilih
  viaIds: string[]; // List of ViaTransaksiSalurItem IDs (e.g. ['vts-1'])
  targetPenerima: ChatAutoTargetType;
  aktif: boolean;
  totalTerkirim: number;
  totalTertunda: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatAutoLogItem {
  id: string;
  ruleId: string;
  ruleNama: string;
  resi: string;
  namaPenerima: string;
  nomorHp: string;
  ekspedisi: string;
  kodeTransaksi: string;
  viaNama: string;
  templatePmId: string;
  templatePmName: string;
  isiPesan: string;
  tanggalInputResi: string;
  jadwalKirim: string;
  status: 'Terkirim' | 'Terjadwal' | 'Dilewati' | 'Gagal';
  alasanStatus: string;
  timestamp: string;
}

const RULES_STORAGE_KEY = 'sapa_chat_auto_salur_rules_v1';
const LOGS_STORAGE_KEY = 'sapa_chat_auto_salur_logs_v1';

export const INITIAL_CHAT_AUTO_RULES: ChatAutoRule[] = [
  {
    id: 'rule-resi-diinput',
    namaAturan: 'Pemberitahuan Resi Saat Diinput',
    deskripsi:
      'Setiap nomor resi diinput ke sistem, otomatis menghubungi penerima/pembeli dengan template pemberitahuan resi (Hanya via yang diizinkan, e.g. Call Center ya, Tokopedia tidak).',
    pemicu: 'saat_input_resi',
    delayValue: 0,
    delayUnit: 'menit',
    templatePmId: 'tpm-resi-salur',
    templatePmName: 'Pemberitahuan Resi S-SALUR',
    semuaVia: false,
    // CC, Kezya, Website Store, Form, Sosmed AKTIF.
    // Tokopedia (vts-2) & Shopee (vts-3) TIDAK PERLU (sesuai contoh instruksi).
    viaIds: ['vts-1', 'vts-4', 'vts-6', 'vts-7', 'vts-8', 'vts-9', 'vts-10', 'vts-13'],
    targetPenerima: 'keduanya',
    aktif: true,
    totalTerkirim: 142,
    totalTertunda: 0,
    createdAt: '01 Nov 2021',
    updatedAt: '10 Nov 2021',
  },
  {
    id: 'rule-ajakan-testimoni',
    namaAturan: 'Ajakan Testimoni & Ulasan (1 Bulan)',
    deskripsi:
      'Jika sudah 1 bulan nomor resi diinput, otomatis dihubungi untuk ajakan memberikan testimoni dan ulasan pengalaman membaca buku S-SALUR.',
    pemicu: 'setelah_resi_diinput',
    delayValue: 1,
    delayUnit: 'bulan',
    templatePmId: 'tpm-testimoni-salur',
    templatePmName: 'Ajakan Testimoni S-SALUR',
    semuaVia: false,
    viaIds: ['vts-1', 'vts-4', 'vts-6', 'vts-8', 'vts-9', 'vts-10'],
    targetPenerima: 'pembeli',
    aktif: true,
    totalTerkirim: 89,
    totalTertunda: 23,
    createdAt: '01 Nov 2021',
    updatedAt: '10 Nov 2021',
  },
  {
    id: 'rule-konfirmasi-paket',
    namaAturan: 'Follow Up Konfirmasi Penerimaan (7 Hari)',
    deskripsi:
      '7 hari setelah nomor resi diinput, hubungi penerima untuk menanyakan kabar dan memastikan paket buku telah sampai dengan selamat.',
    pemicu: 'setelah_resi_diinput',
    delayValue: 7,
    delayUnit: 'hari',
    templatePmId: 'tpm-konfirmasi-salur',
    templatePmName: 'Konfirmasi Penerimaan Paket S-SALUR',
    semuaVia: false,
    viaIds: ['vts-1', 'vts-6'],
    targetPenerima: 'penerima',
    aktif: true,
    totalTerkirim: 64,
    totalTertunda: 8,
    createdAt: '01 Nov 2021',
    updatedAt: '10 Nov 2021',
  },
  {
    id: 'rule-repeat-order',
    namaAturan: 'Sapaan & Rekomendasi Buku Baru (3 Bulan)',
    deskripsi:
      '3 bulan setelah pengiriman resi, kirim sapaan berkala dan rekomendasi bacaan Dharma lanjutan untuk pembeli setia.',
    pemicu: 'setelah_resi_diinput',
    delayValue: 3,
    delayUnit: 'bulan',
    templatePmId: 'tpm-1',
    templatePmName: 'Ajakan Save Nomor & Rekomendasi',
    semuaVia: false,
    viaIds: ['vts-1'],
    targetPenerima: 'pembeli',
    aktif: false,
    totalTerkirim: 0,
    totalTertunda: 15,
    createdAt: '05 Nov 2021',
    updatedAt: '10 Nov 2021',
  },
];

export const INITIAL_CHAT_AUTO_LOGS: ChatAutoLogItem[] = [
  {
    id: 'log-1',
    ruleId: 'rule-resi-diinput',
    ruleNama: 'Pemberitahuan Resi Saat Diinput',
    resi: '11LP1636545419847',
    namaPenerima: 'Agus Jaya Putra',
    nomorHp: '+62 812-9901-2245',
    ekspedisi: 'LION',
    kodeTransaksi: '2021 CC 4451003223',
    viaNama: 'Call Center',
    templatePmId: 'tpm-resi-salur',
    templatePmName: 'Pemberitahuan Resi S-SALUR',
    isiPesan:
      'Namo Buddhaya Agus Jaya Putra,\n\nPesanan S-SALUR Anda telah kami serahkan ke pihak ekspedisi LION dengan No. Resi: 11LP1636545419847.\n\n📍 Tujuan: MORES DUSUN GERENGGENG DESA SAMAGUNA KEC TANJUNG LOMBOK UTARA\n\nTerima kasih atas kepercayaannya. 🙏✨',
    tanggalInputResi: '10 Nov 2021 14:20',
    jadwalKirim: 'Langsung (10 Nov 2021 14:20)',
    status: 'Terkirim',
    alasanStatus: 'Berhasil dikirim via WhatsApp (Via Call Center aktif)',
    timestamp: '10 Nov 2021 14:20',
  },
  {
    id: 'log-2',
    ruleId: 'rule-ajakan-testimoni',
    ruleNama: 'Ajakan Testimoni & Ulasan (1 Bulan)',
    resi: '11LP1636545419847',
    namaPenerima: 'Agus Jaya Putra',
    nomorHp: '+62 812-9901-2245',
    ekspedisi: 'LION',
    kodeTransaksi: '2021 CC 4451003223',
    viaNama: 'Call Center',
    templatePmId: 'tpm-testimoni-salur',
    templatePmName: 'Ajakan Testimoni S-SALUR',
    isiPesan:
      'Namo Buddhaya Agus Jaya Putra,\n\nSehubungan dengan pesanan buku S-SALUR Anda (No. Resi: 11LP1636545419847), kami ingin mendengar kesan membaca Anda setelah 1 bulan.\n\nSudikah kiranya membagikan testimoni di: https://lamrimnesia.org/testimoni-salur. Terima kasih! 🙏🌿',
    tanggalInputResi: '10 Nov 2021',
    jadwalKirim: '10 Des 2021 10:00 (1 Bulan setelah resi diinput)',
    status: 'Terjadwal',
    alasanStatus: 'Menunggu waktu jeda 1 bulan',
    timestamp: '10 Nov 2021 14:20',
  },
  {
    id: 'log-3',
    ruleId: 'rule-resi-diinput',
    ruleNama: 'Pemberitahuan Resi Saat Diinput',
    resi: '11LP1636545612169',
    namaPenerima: 'Ayadi',
    nomorHp: '+62 813-8820-1190',
    ekspedisi: 'LION',
    kodeTransaksi: '2021 CC 4451003214',
    viaNama: 'Call Center',
    templatePmId: 'tpm-resi-salur',
    templatePmName: 'Pemberitahuan Resi S-SALUR',
    isiPesan:
      'Namo Buddhaya Ayadi,\n\nPesanan S-SALUR Anda telah diserahkan ke LION dengan No. Resi: 11LP1636545612169. Kode Transaksi: 2021 CC 4451003214. Semoga paket segera tiba dengan selamat. Anumodana 🙏',
    tanggalInputResi: '10 Nov 2021 15:05',
    jadwalKirim: 'Langsung (10 Nov 2021 15:05)',
    status: 'Terkirim',
    alasanStatus: 'Berhasil dikirim via WhatsApp (Via Call Center aktif)',
    timestamp: '10 Nov 2021 15:05',
  },
  {
    id: 'log-4',
    ruleId: 'rule-resi-diinput',
    ruleNama: 'Pemberitahuan Resi Saat Diinput',
    resi: '11LP1636545251274',
    namaPenerima: 'Suparman',
    nomorHp: '+62 811-3344-5566',
    ekspedisi: 'LION',
    kodeTransaksi: '2021 Store 4451003216',
    viaNama: 'Website Store',
    templatePmId: 'tpm-resi-salur',
    templatePmName: 'Pemberitahuan Resi S-SALUR',
    isiPesan:
      'Namo Buddhaya Suparman,\n\nPesanan S-SALUR Anda telah diserahkan ke LION dengan No. Resi: 11LP1636545251274. Kode: 2021 Store 4451003216.',
    tanggalInputResi: '10 Nov 2021 15:30',
    jadwalKirim: 'Langsung (10 Nov 2021 15:30)',
    status: 'Terkirim',
    alasanStatus: 'Berhasil dikirim via WhatsApp (Via Website Store aktif)',
    timestamp: '10 Nov 2021 15:30',
  },
  {
    id: 'log-5',
    ruleId: 'rule-resi-diinput',
    ruleNama: 'Pemberitahuan Resi Saat Diinput',
    resi: 'TKP-2021-9988112',
    namaPenerima: 'Budi Hartono',
    nomorHp: '+62 817-4455-6677',
    ekspedisi: 'JNE Reguler',
    kodeTransaksi: '2021 Tokopedia 887711',
    viaNama: 'Tokopedia',
    templatePmId: 'tpm-resi-salur',
    templatePmName: 'Pemberitahuan Resi S-SALUR',
    isiPesan: '-',
    tanggalInputResi: '10 Nov 2021 16:10',
    jadwalKirim: 'Dilewati',
    status: 'Dilewati',
    alasanStatus: 'Dilewati sesuai aturan: Transaksi via Tokopedia tidak dikirimkan pemberitahuan resi',
    timestamp: '10 Nov 2021 16:10',
  },
];

export function loadChatAutoRules(): ChatAutoRule[] {
  try {
    const raw = localStorage.getItem(RULES_STORAGE_KEY);
    if (!raw) {
      saveChatAutoRules(INITIAL_CHAT_AUTO_RULES);
      return INITIAL_CHAT_AUTO_RULES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_CHAT_AUTO_RULES;
  } catch (err) {
    console.warn('Error loading chat auto rules:', err);
    return INITIAL_CHAT_AUTO_RULES;
  }
}

export function saveChatAutoRules(rules: ChatAutoRule[]): void {
  try {
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
  } catch (err) {
    console.error('Failed to save chat auto rules:', err);
  }
}

export function loadChatAutoLogs(): ChatAutoLogItem[] {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!raw) {
      saveChatAutoLogs(INITIAL_CHAT_AUTO_LOGS);
      return INITIAL_CHAT_AUTO_LOGS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_CHAT_AUTO_LOGS;
  } catch (err) {
    console.warn('Error loading chat auto logs:', err);
    return INITIAL_CHAT_AUTO_LOGS;
  }
}

export function saveChatAutoLogs(logs: ChatAutoLogItem[]): void {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (err) {
    console.error('Failed to save chat auto logs:', err);
  }
}

export function renderTemplateMessage(
  templateContent: string,
  params: {
    nama?: string;
    resi?: string;
    ekspedisi?: string;
    kode?: string;
    tujuan?: string;
    tanggal?: string;
    linkTestimoni?: string;
  }
): string {
  if (!templateContent) return '';
  const nama = params.nama || 'Bapak/Ibu';
  const resi = params.resi || '-';
  const ekspedisi = params.ekspedisi || 'Ekspedisi';
  const kode = params.kode || '-';
  const tujuan = params.tujuan || '-';
  const tanggal = params.tanggal || new Date().toLocaleDateString('id-ID');
  const linkTestimoni = params.linkTestimoni || 'https://lamrimnesia.org/testimoni-salur';

  let msg = templateContent;
  msg = msg.replace(/\[Nama Lengkap\]|\[Nama\]|\{Nama\}/gi, nama);
  msg = msg.replace(/\[No Resi\]|\[Nomor Resi\]|\[No\. Resi\]|\{Resi\}|\{NoResi\}/gi, resi);
  msg = msg.replace(/\[Ekspedisi\]|\{Ekspedisi\}/gi, ekspedisi);
  msg = msg.replace(/\[Kode Transaksi\]|\[Kode\]|\{Kode\}/gi, kode);
  msg = msg.replace(/\[Alamat Tujuan\]|\[Alamat\]|\[Tujuan\]|\{Alamat\}|\{Tujuan\}/gi, tujuan);
  msg = msg.replace(/\[Tanggal\]|\{Tanggal\}/gi, tanggal);
  msg = msg.replace(/\[Link Testimoni\]|\[Link\]|\{Link\}/gi, linkTestimoni);

  return msg;
}

/**
 * Detects the Via from a kode transaction string (e.g. "2021 CC 4451003223" -> Call Center)
 */
export function detectViaFromKode(
  kode?: string,
  viaList: ViaTransaksiSalurItem[] = INITIAL_VIA_TRANSAKSI_SALUR
): ViaTransaksiSalurItem {
  if (!kode) return viaList[0];
  const upper = kode.toUpperCase();

  if (upper.includes('CC') || upper.includes('CALL CENTER')) {
    const found = viaList.find((v) => v.id === 'vts-1' || v.namaVia.toLowerCase().includes('call center'));
    if (found) return found;
  }
  if (upper.includes('TOKOPEDIA') || upper.includes('TKP')) {
    const found = viaList.find((v) => v.id === 'vts-2' || v.namaVia.toLowerCase().includes('tokopedia'));
    if (found) return found;
  }
  if (upper.includes('SHOPEE') || upper.includes('SHP')) {
    const found = viaList.find((v) => v.id === 'vts-3' || v.namaVia.toLowerCase().includes('shopee'));
    if (found) return found;
  }
  if (upper.includes('STORE') || upper.includes('WEB')) {
    const found = viaList.find((v) => v.id === 'vts-6' || v.namaVia.toLowerCase().includes('website'));
    if (found) return found;
  }
  if (upper.includes('KEZYA')) {
    const found = viaList.find((v) => v.id === 'vts-4');
    if (found) return found;
  }
  if (upper.includes('IG') || upper.includes('INSTAGRAM')) {
    const found = viaList.find((v) => v.id === 'vts-9');
    if (found) return found;
  }
  if (upper.includes('FB') || upper.includes('FACEBOOK')) {
    const found = viaList.find((v) => v.id === 'vts-8');
    if (found) return found;
  }
  if (upper.includes('TIKTOK')) {
    const found = viaList.find((v) => v.id === 'vts-10');
    if (found) return found;
  }

  // Default match by any via name
  for (const v of viaList) {
    if (upper.includes(v.namaVia.toUpperCase())) {
      return v;
    }
  }

  // Fallback to Call Center
  return viaList[0];
}

/**
 * Check if a Via is allowed by the Chat Auto rule
 */
export function isViaAllowedByRule(
  rule: ChatAutoRule,
  via: ViaTransaksiSalurItem
): boolean {
  if (!rule.aktif) return false;
  if (rule.semuaVia) return true;
  return rule.viaIds.includes(via.id);
}

/**
 * Formats duration text nicely in Indonesian
 */
export function formatDelayText(value: number, unit: ChatAutoDelayUnit): string {
  if (value === 0) return 'Langsung saat diinput';
  const unitMap: Record<ChatAutoDelayUnit, string> = {
    menit: 'Menit',
    jam: 'Jam',
    hari: 'Hari',
    minggu: 'Minggu',
    bulan: 'Bulan',
  };
  return `${value} ${unitMap[unit] || unit}`;
}

import { ListPMItem, ListPMRecipient, ListPMDetailRow } from './types';
import { loadListPM, saveListPM } from './listPMData';
import { loadTemplatePM } from './templatePMData';

/**
 * Builds or updates a ListPMItem corresponding to a ChatAutoRule.
 * Ensures the List PM project reflects:
 * - Title: e.g. "Kirim Resi S-SALUR" or "Ajakan Testimoni S-SALUR"
 * - Subtitle / Code: e.g. "SALUR" / "S-SALUR"
 * - Icon: "package" for resi / "rocket" / "shoppingCart"
 * - Target: Recipients extracted from matching real Resi items
 * - Deadline: "-" for immediate, or "+1 Bulan" for scheduled rules
 * - Progress & Detail Rows matching the recipients
 */
export function buildListPMItemFromRule(
  rule: ChatAutoRule,
  resiList: ResiItem[] = []
): ListPMItem {
  const templates = loadTemplatePM();
  const template = templates.find((t) => t.id === rule.templatePmId) || templates[0];
  const templateContent = template?.isiPesan || '';

  // Determine allowed resi items based on the rule's via configuration
  const matchingResis = resiList.filter((resi) => {
    const via = detectViaFromKode(resi.kode);
    return isViaAllowedByRule(rule, via);
  });

  const isImmediate = rule.pemicu === 'saat_input_resi';
  const deadlineText = isImmediate
    ? '-'
    : `+${rule.delayValue} ${rule.delayUnit === 'bulan' ? 'Bulan' : rule.delayUnit}`;

  // Build recipients
  const recipients: ListPMRecipient[] = matchingResis.map((r, idx) => ({
    id: `rec-ca-${rule.id}-${r.id || idx}`,
    codeId: r.kode?.split(' ')?.[2] || `00${(30 + idx).toString().padStart(3, '0')}`,
    nama: r.nama,
    nomorHp: '+62812' + (34567890 + idx * 1111).toString().slice(0, 8),
    isSent: isImmediate ? true : false,
    sentAt: isImmediate ? `${r.tanggal} 14:20` : undefined,
  }));

  // Build detail rows
  const detailRows: ListPMDetailRow[] = matchingResis.map((r, idx) => {
    const msg = renderTemplateMessage(templateContent, {
      nama: r.nama,
      resi: r.resi,
      ekspedisi: r.ekspedisi,
      kode: r.kode,
      tujuan: r.tujuan,
      tanggal: r.tanggal,
    });

    const isSent = isImmediate;

    return {
      id: `dr-ca-${rule.id}-${r.id || idx}`,
      deadline: isImmediate ? r.tanggal || '10 Nov 2021' : '10 Des 2021',
      identitasId: `id-salur-${idx + 1}`,
      codeId: r.kode || `CC-445100${idx}`,
      nama: r.nama,
      nomorHp: '+62812' + (34567890 + idx * 1111).toString().slice(0, 8),
      avatarInitial: r.nama?.charAt(0)?.toUpperCase() || 'P',
      avatarBg: idx % 3 === 0 ? 'bg-[#008d91]' : idx % 3 === 1 ? 'bg-[#d94819]' : 'bg-[#2295d8]',
      proyekSapa: 'Penyaluran S-SALUR',
      proyekKode: 'SAL',
      templateName: rule.templatePmName || template?.namaTemplate || 'Template S-SALUR',
      templateContent: msg,
      itemTitle: 'Buku Dharma Penyaluran S-SALUR',
      itemSubtitle: `Ekspedisi: ${r.ekspedisi} · Resi: ${r.resi}`,
      itemStock: `Via: ${detectViaFromKode(r.kode).namaVia}`,
      status: isSent ? 'done_teal' : 'pending',
      sentAt: isSent ? `${r.tanggal} 14:20` : undefined,
    };
  });

  const sentCount = recipients.filter((r) => r.isSent).length;
  const progressPercent = recipients.length > 0
    ? Math.round((sentCount / recipients.length) * 100)
    : (isImmediate ? 100 : 0);

  const avatars = matchingResis.slice(0, 3).map((r, i) => ({
    initial: r.nama?.charAt(0)?.toUpperCase() || 'S',
    bg: i === 0 ? 'bg-[#008d91]' : i === 1 ? 'bg-[#d94819]' : 'bg-[#2295d8]',
  }));
  if (avatars.length === 0) {
    avatars.push({ initial: 'S', bg: 'bg-[#008d91]' });
  }

  const iconType = isImmediate ? 'package' : 'rocket';

  return {
    id: `pm-autochat-${rule.id}`,
    proyekSapa: rule.namaAturan,
    proyekKode: 'S-SALUR',
    iconType,
    targetType: 'multiple',
    targetCount: matchingResis.length > 0 ? matchingResis.length : 1,
    targetAvatars: avatars,
    deadline: deadlineText,
    deadlineColor: isImmediate ? 'teal' : 'amber',
    templatePesan: templateContent,
    progressPercent,
    recipients,
    detailBadge: {
      label: rule.namaAturan,
      countText: `${matchingResis.length > 0 ? matchingResis.length : 1} buah`,
    },
    detailRows,
    createdAt: rule.createdAt || '2021-11-10',
    tabType: 'non-rutin',
    itemTitle: 'Buku Dharma Penyaluran S-SALUR',
    dihubungiOleh: 'Call Center S-SALUR',
    dihubungiOlehType: 'call_center',
    targetSourceType: 'identitas',
    targetSourceName: 'Penerima Resi S-SALUR',
    isChatAutoSalur: true,
    sourceRuleId: rule.id,
    autoResiTrigger: rule.pemicu,
  };
}

/**
 * Synchronizes all active Chat Auto rules into List PM.
 * Automatically called on app launch, resi save, and rule change.
 */
export function syncChatAutoRulesToListPM(
  rules: ChatAutoRule[] = loadChatAutoRules(),
  resiList: ResiItem[] = []
): ListPMItem[] {
  try {
    const currentListPM = loadListPM();

    // Map existing items
    const nonAutoItems = currentListPM.filter(
      (item) => !item.isChatAutoSalur && !item.id.startsWith('pm-autochat-')
    );

    // Only process rules that are active
    const autoListPMItems = rules
      .filter((r) => r.aktif)
      .map((r) => buildListPMItemFromRule(r, resiList));

    // Combine: Auto items on top or integrated
    const merged = [...autoListPMItems, ...nonAutoItems];
    saveListPM(merged);
    return merged;
  } catch (err) {
    console.error('Failed to sync chat auto rules to list PM:', err);
    return loadListPM();
  }
}

