import { ListPMItem, TemplatePMItem } from './types';
import { SalurOrder } from './salurData';
import { getEffectiveStatusBisaPM, ensureAllRecipientsInDetailRows } from './listPMData';

export interface AutoInputSalurRule {
  id: string;
  namaAturan: string;
  keterangan?: string;
  aktif: boolean;
  triggerEvent: 'input_no_resi'; // Saat nomor resi diinput

  // Target Tab di List PM:
  targetTab: 'sudah' | 'belum'; // "Sudah bisa di-PM" vs "Belum bisa di-PM"

  // Jeda waktu / Delay:
  delayType: 'langsung' | 'custom_delay';
  delayAmount: number; // e.g. 0, 1, 14, 30
  delayUnit: 'hari' | 'minggu' | 'bulan' | 'tahun';

  // Filter Via Transaksi S-SALUR:
  applyToAllVia: boolean;
  viaTransaksiSalur: string[]; // e.g. ['Call Center', 'Website Store']

  // Template PM terkait:
  templatePMId: string;
  customTemplateText?: string;

  // Metadata List PM:
  proyekSapa: string;
  proyekKode: string;
  dihubungiOleh: string;
  dihubungiOlehType: 'call_center' | 'pic_yppln' | 'karyawan';

  createdAt: string;
}

export interface AutoInputSalurLog {
  id: string;
  timestamp: string; // ISO
  tanggalInput: string; // e.g. "15 Nov 2021"
  orderNumber: string;
  orderVia: string;
  penerimaNama: string;
  penerimaHp: string;
  noResi: string;
  ekspedisi: string;
  ruleId: string;
  ruleNama: string;
  targetTab: 'sudah' | 'belum';
  tanggalMulaiPM: string;
  generatedPMId: string;
}

const RULES_STORAGE_KEY = 'sapa_auto_input_salur_rules_v1';
const LOGS_STORAGE_KEY = 'sapa_auto_input_salur_logs_v1';

export const INITIAL_AUTO_INPUT_SALUR_RULES: AutoInputSalurRule[] = [
  {
    id: 'rule-resi-1',
    namaAturan: 'Pemberitahuan Nomor Resi Pengiriman',
    keterangan: 'Saat no resi diinput, langsung masuk List PM tab "Sudah bisa di-PM" untuk dikirim pemberitahuan resi (Khusus Via Call Center, Website, dll; Tokopedia & Shopee dikecualikan)',
    aktif: true,
    triggerEvent: 'input_no_resi',
    targetTab: 'sudah',
    delayType: 'langsung',
    delayAmount: 0,
    delayUnit: 'hari',
    applyToAllVia: false,
    viaTransaksiSalur: [
      'Call Center',
      'Website Store',
      'Form Buku Tidak Berbayar',
      'Facebook',
      'Instagram',
      'Tiktok',
      'Agen Purna',
      'Stand',
      'YPPLN',
    ], // Tokopedia and Shopee excluded as user specified!
    templatePMId: 'tpm-2',
    proyekSapa: 'Kirim Resi',
    proyekKode: 'MAD',
    dihubungiOleh: 'Call Center SAPA',
    dihubungiOlehType: 'call_center',
    createdAt: '2021-11-10',
  },
  {
    id: 'rule-testimoni-1',
    namaAturan: 'Ajakan Testimoni Pengiriman (1 Bulan)',
    keterangan: 'Jika sudah 1 bulan no resi diinput, masuk List PM tab "Belum bisa di-PM" untuk dikirim ajakan testimoni dengan tanggal mulai dihubungi 1 bulan dari no resi diinput',
    aktif: true,
    triggerEvent: 'input_no_resi',
    targetTab: 'belum',
    delayType: 'custom_delay',
    delayAmount: 1,
    delayUnit: 'bulan',
    applyToAllVia: false,
    viaTransaksiSalur: [
      'Call Center',
      'Website Store',
      'Form Buku Tidak Berbayar',
      'Agen Purna',
    ],
    templatePMId: 'tpm-testimoni-salur',
    proyekSapa: 'Testimoni Penerima Paket S-SALUR',
    proyekKode: 'MAD',
    dihubungiOleh: 'Call Center SAPA',
    dihubungiOlehType: 'call_center',
    createdAt: '2021-11-10',
  },
  {
    id: 'rule-followup-2minggu',
    namaAturan: 'Konfirmasi Penerimaan Paket (2 Minggu)',
    keterangan: 'Follow-up otomatis setelah 2 minggu no resi diinput, masuk List PM tab "Belum bisa di-PM"',
    aktif: false,
    triggerEvent: 'input_no_resi',
    targetTab: 'belum',
    delayType: 'custom_delay',
    delayAmount: 2,
    delayUnit: 'minggu',
    applyToAllVia: false,
    viaTransaksiSalur: ['Call Center', 'Agen Purna'],
    templatePMId: 'tpm-followup-paket',
    proyekSapa: 'Konfirmasi Penerimaan Paket',
    proyekKode: 'MAD',
    dihubungiOleh: 'Call Center SAPA',
    dihubungiOlehType: 'call_center',
    createdAt: '2021-11-10',
  },
];

export function loadAutoInputSalurRules(): AutoInputSalurRule[] {
  try {
    const raw = localStorage.getItem(RULES_STORAGE_KEY);
    if (!raw) {
      saveAutoInputSalurRules(INITIAL_AUTO_INPUT_SALUR_RULES);
      return INITIAL_AUTO_INPUT_SALUR_RULES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Migrate rule-resi-1 to 'Kirim Resi' if it was 'Penyaluran Buku & Sembako'
      const updated = parsed.map((r: AutoInputSalurRule) => {
        if (
          r.id === 'rule-resi-1' &&
          (r.proyekSapa === 'Penyaluran Buku & Sembako' || !r.proyekSapa)
        ) {
          return { ...r, proyekSapa: 'Kirim Resi' };
        }
        return r;
      });
      return updated;
    }
    return INITIAL_AUTO_INPUT_SALUR_RULES;
  } catch (e) {
    console.error('Error loading auto input salur rules:', e);
    return INITIAL_AUTO_INPUT_SALUR_RULES;
  }
}

export function saveAutoInputSalurRules(rules: AutoInputSalurRule[]): void {
  try {
    localStorage.setItem(RULES_STORAGE_KEY, JSON.stringify(rules));
  } catch (e) {
    console.error('Error saving auto input salur rules:', e);
  }
}

export function loadAutoInputSalurLogs(): AutoInputSalurLog[] {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading auto input salur logs:', e);
    return [];
  }
}

export function saveAutoInputSalurLogs(logs: AutoInputSalurLog[]): void {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, 100))); // keep latest 100
  } catch (e) {
    console.error('Error saving auto input salur logs:', e);
  }
}

/**
 * Format a Date object to Indonesian date string "15 Nov 2021"
 */
export function formatIndonesianDate(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Calculate target date from base date and delay
 */
export function calculateTargetDate(
  baseDate: Date,
  delayType: 'langsung' | 'custom_delay',
  amount: number,
  unit: 'hari' | 'minggu' | 'bulan' | 'tahun'
): Date {
  const result = new Date(baseDate.getTime());
  if (delayType === 'langsung' || amount <= 0) {
    return result;
  }

  if (unit === 'hari') {
    result.setDate(result.getDate() + amount);
  } else if (unit === 'minggu') {
    result.setDate(result.getDate() + amount * 7);
  } else if (unit === 'bulan') {
    result.setMonth(result.getMonth() + amount);
  } else if (unit === 'tahun') {
    result.setFullYear(result.getFullYear() + amount);
  }
  return result;
}

/**
 * Check if order's via matches rule's via selection
 */
export function isViaMatched(order: SalurOrder, rule: AutoInputSalurRule): boolean {
  if (rule.applyToAllVia) return true;
  if (!rule.viaTransaksiSalur || rule.viaTransaksiSalur.length === 0) return true;

  const orderVia = (order.via || '').trim().toLowerCase();
  const orderNumber = (order.orderNumber || '').trim().toLowerCase();

  return rule.viaTransaksiSalur.some((v) => {
    const vLower = v.toLowerCase().trim();
    if (orderVia && orderVia.includes(vLower)) return true;
    if (orderNumber && orderNumber.includes(vLower)) return true;

    // Special match for 'CC' <=> 'Call Center'
    if (vLower.includes('call center') || vLower === 'cc') {
      if (orderVia === 'cc' || orderVia.includes('call center')) return true;
      if (orderNumber.startsWith('cc') || orderNumber.includes('cc ')) return true;
    }

    // Special match for 'tokopedia'
    if (vLower.includes('tokopedia') || vLower.includes('toped')) {
      if (orderVia.includes('tokopedia') || orderVia.includes('toped')) return true;
      if (orderNumber.includes('tokopedia') || orderNumber.includes('toped')) return true;
    }

    // Special match for 'shopee'
    if (vLower.includes('shopee')) {
      if (orderVia.includes('shopee')) return true;
      if (orderNumber.includes('shopee')) return true;
    }

    // Special match for 'website' / 'store'
    if (vLower.includes('website') || vLower.includes('store')) {
      if (orderVia.includes('website') || orderVia.includes('store')) return true;
      if (orderNumber.includes('store') || orderNumber.includes('web')) return true;
    }

    return false;
  });
}

/**
 * Generates ListPMItem and Log for an order according to matched rules
 */
export function executeAutoInputSalurRules(
  order: SalurOrder,
  noResi: string,
  rules: AutoInputSalurRule[],
  templatePMList: TemplatePMItem[],
  baseDate: Date = new Date()
): { items: ListPMItem[]; logs: AutoInputSalurLog[] } {
  const generatedItems: ListPMItem[] = [];
  const generatedLogs: AutoInputSalurLog[] = [];

  const recipientName = order.alamat?.recipientName || 'Bapak/Ibu';
  const recipientPhone = order.alamat?.phone || '';
  const recipientStreet = order.alamat?.street || '';
  const courierName = order.ekspedisi?.name || 'Ekspedisi';
  const itemTitle =
    order.items && order.items.length > 0
      ? order.items.map((i) => i.title).join(', ')
      : 'Paket Buku & Sembako';

  const orderViaDisplay =
    order.via || (order.orderNumber.startsWith('CC') || order.orderNumber.toLowerCase().includes('call center') ? 'Call Center' : order.orderNumber.replace(/^[SAD]-/, '').split(' ')[0] || 'S-SALUR');

  for (const rule of rules) {
    if (!rule.aktif) continue;
    if (rule.triggerEvent !== 'input_no_resi') continue;
    if (!isViaMatched(order, rule)) continue;

    // Calculate dates
    const targetDateObj = calculateTargetDate(
      baseDate,
      rule.delayType,
      rule.delayAmount,
      rule.delayUnit
    );
    const targetDateFormatted = formatIndonesianDate(targetDateObj);
    const todayFormatted = formatIndonesianDate(baseDate);

    // Resolve template text
    const matchedTemplate = templatePMList.find((t) => t.id === rule.templatePMId);
    let templateText =
      rule.customTemplateText ||
      matchedTemplate?.isiPesan ||
      'Namo Buddhaya {Nama},\n\nTerima kasih atas partisipasinya. Paket telah kami kirimkan dengan nomor resi {NomorResi} via {Ekspedisi}. 🙏';

    // Replace placeholders
    templateText = templateText
      .replace(/{Nama}/g, recipientName)
      .replace(/\[Nama Lengkap\]/g, recipientName)
      .replace(/{NomorResi}/g, noResi)
      .replace(/{NoResi}/g, noResi)
      .replace(/\[Nomor Resi\]/g, noResi)
      .replace(/{Ekspedisi}/g, courierName)
      .replace(/\[Ekspedisi\]/g, courierName)
      .replace(/{ItemTitle}/g, itemTitle)
      .replace(/{Alamat}/g, recipientStreet)
      .replace(/{ProyekKode}/g, rule.proyekKode || 'MAD')
      .replace(/{Kode}/g, order.orderNumber);

    const isKirimResi =
      (rule.proyekSapa || '').toLowerCase().includes('kirim resi') ||
      rule.id === 'rule-resi-1' ||
      rule.namaAturan.toLowerCase().includes('nomor resi');

    const resolvedProyekSapa = isKirimResi ? 'Kirim Resi' : rule.proyekSapa || 'Penyaluran Buku & Sembako';
    const resolvedProyekKode = isKirimResi ? 'MAD' : rule.proyekKode || 'MAD';
    const resolvedDeadline = isKirimResi ? '-' : targetDateFormatted;
    const resolvedDeadlineColor = isKirimResi ? 'teal' : rule.targetTab === 'belum' ? 'red' : 'teal';

    const pmId = `pm-auto-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newItem: ListPMItem = {
      id: pmId,
      proyekSapa: resolvedProyekSapa,
      proyekKode: resolvedProyekKode,
      iconType: isKirimResi ? 'package' : 'truck',
      targetType: 'single',
      singleTarget: {
        identitasId: order.customerId || '',
        nama: recipientName,
        nomorHp: recipientPhone,
        codeId: order.customerId || order.orderNumber,
        avatarInitial: recipientName.charAt(0).toUpperCase() || 'P',
        avatarBg: 'bg-[#008d91]',
      },
      deadline: resolvedDeadline,
      deadlineColor: resolvedDeadlineColor,
      progressPercent: 0,
      statusBisaPM: rule.targetTab,
      tanggalMulaiPM: targetDateFormatted,
      tanggalMulaiDihubungi: targetDateFormatted,
      templatePesan: templateText,
      detailBadge: {
        label: resolvedProyekSapa,
        countText: '1 Orang',
      },
      recipients: [
        {
          id: `rec-auto-${pmId}`,
          identitasId: order.customerId || '',
          codeId: order.customerId || order.orderNumber,
          nama: recipientName,
          nomorHp: recipientPhone,
          isSent: false,
        },
      ],
      detailRows: [
        {
          id: `dr-${pmId}-1`,
          deadline: resolvedDeadline,
          identitasId: order.customerId || '',
          codeId: order.customerId || order.orderNumber,
          nama: recipientName,
          nomorHp: recipientPhone,
          avatarInitial: recipientName.charAt(0).toUpperCase() || 'P',
          avatarBg: 'bg-[#00a89d]',
          templateName: matchedTemplate?.namaTemplate || 'Template Kirim Resi',
          templateContent: templateText,
          itemTitle: itemTitle,
          itemSubtitle: `Ekspedisi: ${courierName} • Resi: ${noResi}`,
          itemStock: 'Stok: 100',
          status: 'pending',
        },
      ],
      dihubungiOleh: rule.dihubungiOleh || 'Call Center SAPA',
      dihubungiOlehType: rule.dihubungiOlehType || 'call_center',
      createdAt: new Date().toISOString(),
    };

    generatedItems.push(newItem);

    generatedLogs.push({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      tanggalInput: todayFormatted,
      orderNumber: order.orderNumber,
      orderVia: orderViaDisplay,
      penerimaNama: recipientName,
      penerimaHp: recipientPhone,
      noResi: noResi,
      ekspedisi: courierName,
      ruleId: rule.id,
      ruleNama: rule.namaAturan,
      targetTab: rule.targetTab,
      tanggalMulaiPM: targetDateFormatted,
      generatedPMId: pmId,
    });
  }

  return { items: generatedItems, logs: generatedLogs };
}

/**
 * Merges incoming ListPMItem(s) into existing ListPMItem list.
 * If an item with the same Proyek SAPA already exists, they are combined into ONE single row.
 * - Identitas ID column will show:
 *   - 1 person: single person's details
 *   - More than 1 person: "XX Orang" with combined avatars
 * - All people will be accessible in the pop up "Kirim Chat / Kelola PM" (detailRows)
 * - Deadline for "Kirim Resi" is strictly '-'
 */
export function mergeListPMItemsByProyekSapa(
  existingList: ListPMItem[],
  incomingItems: ListPMItem[]
): ListPMItem[] {
  let result = [...existingList];

  for (const incoming of incomingItems) {
    const isKirimResi = incoming.proyekSapa.trim().toLowerCase() === 'kirim resi';
    if (isKirimResi) {
      incoming.deadline = '-';
      incoming.deadlineColor = 'teal';
    }

    // Match by id or proyekSapa (case-insensitive) and tab status (sudah vs belum)
    const matchIndex = result.findIndex(
      (item) =>
        item.id === incoming.id ||
        (item.proyekSapa.trim().toLowerCase() === incoming.proyekSapa.trim().toLowerCase() &&
          getEffectiveStatusBisaPM(item) === getEffectiveStatusBisaPM(incoming))
    );

    if (matchIndex >= 0) {
      const existing = result[matchIndex];

      // Existing recipients
      const existingRecipients = existing.recipients ? [...existing.recipients] : [];
      if (existingRecipients.length === 0 && existing.singleTarget) {
        existingRecipients.push({
          id: `rec-${existing.id}-1`,
          identitasId: existing.singleTarget.identitasId || '',
          codeId: existing.singleTarget.codeId || '',
          nama: existing.singleTarget.nama,
          nomorHp: existing.singleTarget.nomorHp,
          isSent: existing.progressPercent === 100,
        });
      }

      // Incoming recipients
      const incomingRecipients = incoming.recipients ? [...incoming.recipients] : [];
      if (incomingRecipients.length === 0 && incoming.singleTarget) {
        incomingRecipients.push({
          id: `rec-${incoming.id}-1`,
          identitasId: incoming.singleTarget.identitasId || '',
          codeId: incoming.singleTarget.codeId || '',
          nama: incoming.singleTarget.nama,
          nomorHp: incoming.singleTarget.nomorHp,
          isSent: false,
        });
      }

      // Merge recipients without exact duplicate phone/name
      for (const rec of incomingRecipients) {
        const existingIdx = existingRecipients.findIndex(
          (r) =>
            (r.nomorHp && rec.nomorHp && r.nomorHp === rec.nomorHp) ||
            r.nama.toLowerCase().trim() === rec.nama.toLowerCase().trim()
        );
        if (existingIdx >= 0) {
          existingRecipients[existingIdx] = {
            ...existingRecipients[existingIdx],
            ...rec,
          };
        } else {
          existingRecipients.push(rec);
        }
      }

      // Combine detailRows
      const existingRows = existing.detailRows ? [...existing.detailRows] : [];
      const incomingRows = incoming.detailRows ? [...incoming.detailRows] : [];

      for (const inRow of incomingRows) {
        const rowMatchIdx = existingRows.findIndex(
          (r) =>
            (r.nomorHp && inRow.nomorHp && r.nomorHp === inRow.nomorHp) ||
            r.nama.toLowerCase().trim() === inRow.nama.toLowerCase().trim()
        );
        if (rowMatchIdx >= 0) {
          existingRows[rowMatchIdx] = {
            ...existingRows[rowMatchIdx],
            ...inRow,
          };
        } else {
          existingRows.push(inRow);
        }
      }

      const totalCount = existingRecipients.length;

      // Build target avatars
      const colorPalette = ['bg-[#d94819]', 'bg-[#d9659b]', 'bg-[#2295d8]', 'bg-[#0f8b8d]', 'bg-[#e05d44]'];
      const targetAvatars = existingRecipients.slice(0, 3).map((r, i) => ({
        initial: (r.nama || 'A').charAt(0).toUpperCase(),
        bg: colorPalette[i % colorPalette.length],
      }));
      if (totalCount > 3) {
        targetAvatars.push({ initial: '+', bg: 'bg-[#2295d8]' });
      }

      const mergedItem: ListPMItem = {
        ...existing,
        deadline: isKirimResi ? '-' : existing.deadline,
        deadlineColor: 'teal',
        targetType: totalCount > 1 ? 'multiple' : 'single',
        targetCount: totalCount,
        targetAvatars: totalCount > 1 ? targetAvatars : existing.targetAvatars,
        singleTarget:
          totalCount === 1
            ? {
                identitasId: existingRecipients[0].identitasId,
                codeId: existingRecipients[0].codeId,
                nama: existingRecipients[0].nama,
                nomorHp: existingRecipients[0].nomorHp,
                avatarInitial: (existingRecipients[0].nama || 'A').charAt(0).toUpperCase(),
                avatarBg: 'bg-[#008d91]',
              }
            : undefined,
        detailBadge: {
          label: existing.proyekSapa,
          countText: `${totalCount} Orang`,
        },
        recipients: existingRecipients,
        detailRows: existingRows,
      };

      mergedItem.detailRows = ensureAllRecipientsInDetailRows(mergedItem);
      result[matchIndex] = mergedItem;
    } else {
      if (isKirimResi) {
        incoming.deadline = '-';
        incoming.deadlineColor = 'teal';
      }
      incoming.detailRows = ensureAllRecipientsInDetailRows(incoming);
      result = [incoming, ...result];
    }
  }

  return result;
}

/**
 * Consolidates any duplicate Proyek SAPA in an existing ListPMItem array
 */
export function consolidateListPMByProyekSapa(items: ListPMItem[]): ListPMItem[] {
  const merged: ListPMItem[] = [];

  for (const item of items) {
    const isKirimResi = item.proyekSapa.trim().toLowerCase() === 'kirim resi';
    if (isKirimResi) {
      item.deadline = '-';
      item.deadlineColor = 'teal';
    }

    const existingIdx = merged.findIndex(
      (m) =>
        m.proyekSapa.trim().toLowerCase() === item.proyekSapa.trim().toLowerCase() &&
        getEffectiveStatusBisaPM(m) === getEffectiveStatusBisaPM(item)
    );

    if (existingIdx >= 0) {
      const existing = merged[existingIdx];
      const existingRecs = existing.recipients ? [...existing.recipients] : [];
      const itemRecs = item.recipients ? [...item.recipients] : [];

      for (const r of itemRecs) {
        if (!existingRecs.some((er) => er.nama.toLowerCase() === r.nama.toLowerCase())) {
          existingRecs.push(r);
        }
      }

      const existingRows = existing.detailRows ? [...existing.detailRows] : [];
      const itemRows = item.detailRows ? [...item.detailRows] : [];
      for (const r of itemRows) {
        if (!existingRows.some((er) => er.nama.toLowerCase() === r.nama.toLowerCase())) {
          existingRows.push(r);
        }
      }

      const totalCount = existingRecs.length;
      const colorPalette = ['bg-[#d94819]', 'bg-[#d9659b]', 'bg-[#2295d8]', 'bg-[#0f8b8d]', 'bg-[#e05d44]'];
      const targetAvatars = existingRecs.slice(0, 3).map((r, i) => ({
        initial: (r.nama || 'A').charAt(0).toUpperCase(),
        bg: colorPalette[i % colorPalette.length],
      }));
      if (totalCount > 3) {
        targetAvatars.push({ initial: '+', bg: 'bg-[#2295d8]' });
      }

      const mergedItem: ListPMItem = {
        ...existing,
        deadline: isKirimResi ? '-' : existing.deadline,
        deadlineColor: 'teal',
        targetType: totalCount > 1 ? 'multiple' : 'single',
        targetCount: totalCount,
        targetAvatars: totalCount > 1 ? targetAvatars : existing.targetAvatars,
        detailBadge: {
          label: existing.proyekSapa,
          countText: `${totalCount} Orang`,
        },
        recipients: existingRecs,
        detailRows: existingRows,
      };
      mergedItem.detailRows = ensureAllRecipientsInDetailRows(mergedItem);
      merged[existingIdx] = mergedItem;
    } else {
      item.detailRows = ensureAllRecipientsInDetailRows(item);
      merged.push(item);
    }
  }

  return merged;
}
