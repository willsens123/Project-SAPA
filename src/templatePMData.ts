import { TemplatePMItem, ListPMItem } from './types';
import { SalurOrder } from './salurData';
import {
  DHARMA_PATRON_SVG_TEMPLATE,
  DEFAULT_DHARMA_PATRON_FIELDS,
} from './data/defaultImageTemplates';

const STORAGE_KEY = 'sapa_template_pm_data_v1';

export const INITIAL_TEMPLATE_PM: TemplatePMItem[] = [
  {
    id: 'tpm-kathina-2021',
    namaTemplate: 'Tanda Terima Kathina Dana 2021',
    subTitle: 'Template',
    kegiatan: 'Kathina Dana',
    proyekSapa: 'Kathina Dana - MAD',
    itemTerkait: 'Kathina 2021',
    avatarInitial: 'K',
    avatarBg: 'bg-[#e05d44]',
    aktif: true,
    baseSentCount: 180,
    baseRatePercent: 95,
    isiPesan:
      'Namo Buddhaya [Nama Lengkap],\n\nTerima kasih dan turut bermudita atas partisipasi donasi Kathina Anda sebesar [Jumlah] untuk kegiatan Kathina Dana 2021.\nBerikut terlampir e-Tanda Terima Resmi Kathina Dana untuk periode [Bulan Donasi].\n\nSemoga kebajikan mulia ini membawa kebahagiaan, kesehatan prima, dan kemakmuran batin bagi Anda sekeluarga. 🙏✨',
    hasImage: true,
    imageUrl: DHARMA_PATRON_SVG_TEMPLATE,
    imageOverlayFields: DEFAULT_DHARMA_PATRON_FIELDS,
  },
  {
    id: 'tpm-dharma-patron',
    namaTemplate: 'Tanda Terima Dharma Patron',
    subTitle: 'Template',
    kegiatan: 'Dharma Patron',
    proyekSapa: 'Dharma Patron Non-Rutin - FUN',
    itemTerkait: 'Empat Segel Agung',
    avatarInitial: 'D',
    avatarBg: 'bg-[#008d91]',
    aktif: true,
    baseSentCount: 250,
    baseRatePercent: 92,
    isiPesan:
      'Namo Buddhaya [Nama Lengkap],\n\nTerima kasih dan turut bermudita atas partisipasi Anda sebagai Dharma Patron Lamrimnesia.\nBerikut terlampir e-Tanda Terima Dharma Patron Anda untuk periode [Bulan Donasi] sebesar [Jumlah].\n\nSemoga kebajikan ini membawa kebahagiaan, kesehatan, dan kemajuan batin bagi Anda sekeluarga. 🙏✨',
    hasImage: true,
    imageUrl: DHARMA_PATRON_SVG_TEMPLATE,
    imageOverlayFields: DEFAULT_DHARMA_PATRON_FIELDS,
  },
  {
    id: 'tpm-1',
    namaTemplate: 'Ajakan Save Nomor',
    subTitle: 'Template',
    kegiatan: 'Save Nomor HP',
    proyekSapa: 'Save Nomor HP',
    itemTerkait: 'Buku Jalan Menuju Kemahatahuan',
    avatarInitial: 'A',
    avatarBg: 'bg-[#008d91]',
    aktif: true,
    baseSentCount: 100,
    baseRatePercent: 10,
    isiPesan:
      'Namo Buddhaya {Nama},\n\nTerima kasih telah bergabung bersama keluarga besar SAPA. Mohon kesediaannya untuk menyimpan nomor resmi Customer Care SAPA ini (+62 812-3456-7898) di kontak Saudara/i agar tidak ketinggalan informasi penyaluran dan kegiatan kebajikan lainnya. 🙏',
    hasImage: false,
  },
  {
    id: 'tpm-2',
    namaTemplate: 'Kirim Resi',
    subTitle: 'Template',
    kegiatan: 'Penyaluran',
    proyekSapa: 'Kirim Resi',
    itemTerkait: 'Jalan Menuju Kemahatahuan',
    avatarInitial: 'K',
    avatarBg: 'bg-[#d94819]',
    aktif: true,
    baseSentCount: 300,
    baseRatePercent: undefined,
    isiPesan:
      'Namo Buddhaya {Nama},\n\nTerima kasih atas partisipasinya dalam kegiatan Penyaluran Buku & Sembako. Paket telah kami kirimkan dengan nomor resi SAPA-MAD-98214. Semoga bermanfaat dan membawa berkah. 🙏',
    hasImage: false,
  },
  {
    id: 'tpm-3',
    namaTemplate: 'Approval Kerja Sama',
    subTitle: 'Template',
    kegiatan: 'Media Partner',
    proyekSapa: 'Approval Kerja Sama',
    avatarInitial: 'X',
    avatarBg: 'bg-[#a88241]',
    aktif: true,
    baseSentCount: 300,
    baseRatePercent: undefined,
    isiPesan:
      'Terima kasih telah memberi kesempatan pada Lamrimnesia untuk menjadi media partner acara [Nama Acara] [Nama Organisasi].\nBerikut adalah bentuk promosi yang kami usulkan:\n1. 1x post bahan promosi acara di feed instagram & facebook Lamrimnesia dan 2x di Instagram & Facebook story\n2. Pemasangan press release acara (jika ada) di lamrimnesia.org dan dishare di feed instagram & facebook Lamrimnesia\n3. 1x post foto-foto liputan saat hari H acara di story instagram & facebook Lamrimnesia\n4. Pembuatan & pemasangan berita liputan acara lamrimnesia.org dan dishare di story instagram & facebook Lamrimnesia paling lambat H+7 setelah acara\n*Semua bahan promosi, press release acara, foto liputan, dan berita liputan acara disediakan oleh panitia\n\nUntuk promosi, nanti bisa langsung menghubungi Campaigner kami, Melyana di +62 878-8788-8531\n\nNanti bisa langsung kasi poster atau bahan promosinya ke beliau, dan diskusi tanggal kapan saja [Nama Acara] ingin dipromosikan. 😊🙏',
    hasImage: true,
  },
  {
    id: 'tpm-4',
    namaTemplate: 'Ajakan Invite Promo 8.8',
    subTitle: 'Template',
    kegiatan: 'Promo 8.8',
    proyekSapa: 'Promo 8.8',
    itemTerkait: 'Paket Promo 8.8',
    avatarInitial: 'A',
    avatarBg: 'bg-[#008d91]',
    aktif: false,
    baseSentCount: 300,
    baseRatePercent: undefined,
    isiPesan:
      'Namo Buddhaya {Nama},\n\nJangan lewatkan berkah Promo Spesial 8.8 Buku Dharma Lamrimnesia! Dapatkan potongan donasi penggantian ongkir serta bonus pembatas buku eksklusif untuk setiap pemesanan pada 8 Agustus. Klik link berikut untuk info lengkap: https://sapa.org/promo-88. Anumodana. 🙏',
    hasImage: false,
  },
  {
    id: 'tpm-testimoni-salur',
    namaTemplate: 'Ajakan Testimoni S-SALUR (1 Bulan)',
    subTitle: 'Template',
    kegiatan: 'Testimoni',
    proyekSapa: 'Testimoni Penerima Paket S-SALUR',
    itemTerkait: 'Penyaluran Buku & Sembako',
    avatarInitial: 'T',
    avatarBg: 'bg-[#00897b]',
    aktif: true,
    baseSentCount: 220,
    baseRatePercent: 88,
    isiPesan:
      'Namo Buddhaya {Nama},\n\nSemoga selalu dalam keadaan sehat dan berbahagia.\n\nPaket buku "{ItemTitle}" telah dikirimkan sekitar 1 bulan yang lalu dengan resi {NomorResi} via {Ekspedisi}.\n\nBagaimana pengalaman Saudara/i membaca buku tersebut? Kami sangat mengharapkan masukan dan testimoni singkat dari Saudara/i untuk terus meningkatkan pelayanan Dharma kita bersama:\n👉 https://sapa.org/testimoni-salur\n\nTerima kasih banyak atas dukungannya. Anumodana. 🙏✨',
    hasImage: false,
  },
  {
    id: 'tpm-followup-paket',
    namaTemplate: 'Konfirmasi Penerimaan Paket S-SALUR',
    subTitle: 'Template',
    kegiatan: 'Follow Up',
    proyekSapa: 'Konfirmasi Penerimaan Paket',
    itemTerkait: 'Penyaluran Paket',
    avatarInitial: 'C',
    avatarBg: 'bg-[#2295d8]',
    aktif: true,
    baseSentCount: 150,
    baseRatePercent: 80,
    isiPesan:
      'Namo Buddhaya {Nama},\n\nSalam kebajikan. Kami dari Tim Pelayanan SAPA ingin memastikan apakah kiriman paket "{ItemTitle}" dengan nomor resi {NomorResi} telah tiba dengan selamat di alamat Saudara/i?\n\nJika ada kendala paket atau kerusakan, mohon beri tahu kami agar dapat segera dibantu. Semoga buku ini membawa manfaat batin yang luas. 🙏',
    hasImage: false,
  },
];

export function loadTemplatePM(): TemplatePMItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveTemplatePM(INITIAL_TEMPLATE_PM);
      return INITIAL_TEMPLATE_PM;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge default templates if not present
      const existingIds = new Set(parsed.map((item: TemplatePMItem) => item.id));
      const missingDefaults = INITIAL_TEMPLATE_PM.filter((d) => !existingIds.has(d.id));
      if (missingDefaults.length > 0) {
        const merged = [...missingDefaults, ...parsed];
        saveTemplatePM(merged);
        return merged;
      }
      return parsed;
    }
    return INITIAL_TEMPLATE_PM;
  } catch (err) {
    console.warn('Error loading Template PM from localStorage:', err);
    return INITIAL_TEMPLATE_PM;
  }
}

export function saveTemplatePM(items: TemplatePMItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Error saving Template PM to localStorage:', err);
  }
}

export interface TemplatePMRateResult {
  sentCount: number;
  transactingCount: number;
  ratePercent: number | null;
  displayText: string;
}

/**
 * Calculates Pesan Terkirim (%Rate) based on user specification:
 * - Pesan Terkirim: seberapa banyak Template PM yang sudah dikirim pada "List PM"
 * - (%Rate): perbandingan [jumlah template List PM yang dikirim] dengan [Identitas ID melakukan transaksi item yang sama dengan item List PM yang dikirimkan kepada Identitas tersebut]
 */
export function calculateTemplatePMRate(
  template: TemplatePMItem,
  listPMItems: ListPMItem[] = [],
  salurOrders: SalurOrder[] = []
): TemplatePMRateResult {
  // 1. Gather all sent recipients and item association from List PM matching this template
  let dynamicSentCount = 0;
  const sentRecipientsWithItems: Array<{ identitasId?: string; nama: string; itemTitle?: string }> = [];

  const templateNameLower = template.namaTemplate.toLowerCase().trim();
  const kegiatanLower = template.kegiatan.toLowerCase().trim();
  const proyekSapaLower = (template.proyekSapa || '').toLowerCase().trim();

  listPMItems.forEach((pm) => {
    const pmProyekLower = pm.proyekSapa.toLowerCase().trim();
    const isMatchingPM =
      pmProyekLower === templateNameLower ||
      pmProyekLower === kegiatanLower ||
      (proyekSapaLower && pmProyekLower === proyekSapaLower);

    // From detailRows
    if (pm.detailRows && pm.detailRows.length > 0) {
      pm.detailRows.forEach((row) => {
        const rowTemplateLower = (row.templateName || '').toLowerCase().trim();
        const matchesTemplate =
          rowTemplateLower === templateNameLower ||
          isMatchingPM ||
          rowTemplateLower.includes(templateNameLower) ||
          templateNameLower.includes(rowTemplateLower);

        const isSent = row.status === 'done_teal' || row.status === 'done_gray';
        if (matchesTemplate && isSent) {
          dynamicSentCount++;
          sentRecipientsWithItems.push({
            identitasId: row.identitasId,
            nama: row.nama,
            itemTitle: row.itemTitle || template.itemTerkait,
          });
        }
      });
    } else if (isMatchingPM && pm.recipients && pm.recipients.length > 0) {
      // From recipients list
      pm.recipients.forEach((rec) => {
        if (rec.isSent) {
          dynamicSentCount++;
          sentRecipientsWithItems.push({
            identitasId: rec.identitasId,
            nama: rec.nama,
            itemTitle: template.itemTerkait || pm.proyekSapa,
          });
        }
      });
    }
  });

  // Effective sentCount: use dynamic if messages were recorded, otherwise baseSentCount
  const effectiveSentCount = dynamicSentCount > 0 ? dynamicSentCount : (template.baseSentCount ?? 0);

  // 2. Check how many of these recipients performed a transaction with the same item
  const matchingTransactingIdentitas = new Set<string>();

  sentRecipientsWithItems.forEach((recipient) => {
    const recId = recipient.identitasId?.toLowerCase().trim();
    const recName = recipient.nama.toLowerCase().trim();
    const targetItem = (recipient.itemTitle || template.itemTerkait || '').toLowerCase().trim();

    const hasTransaction = salurOrders.some((order) => {
      // Match recipient identity
      const custId = (order.customerId || order.idPembeli || '').toLowerCase().trim();
      const custCode = (order.customerCode || order.idPenerima || '').toLowerCase().trim();
      const penerima = (order.alamat?.recipientName || '').toLowerCase().trim();

      const isSamePerson =
        (recId && (custId.includes(recId) || custCode.includes(recId))) ||
        (recName && (custId.includes(recName) || custCode.includes(recName) || penerima.includes(recName)));

      if (!isSamePerson) return false;

      // Match item if targetItem specified
      if (targetItem) {
        const orderHasItem = order.items.some((it) => {
          const itemTitleLower = it.title.toLowerCase().trim();
          return itemTitleLower.includes(targetItem) || targetItem.includes(itemTitleLower);
        });
        return orderHasItem;
      }

      return true;
    });

    if (hasTransaction) {
      matchingTransactingIdentitas.add(recId || recName);
    }
  });

  const dynamicTransactingCount = matchingTransactingIdentitas.size;

  // Calculate rate percentage
  let ratePercent: number | null = null;
  if (dynamicSentCount > 0 && dynamicTransactingCount > 0) {
    ratePercent = Math.round((dynamicTransactingCount / dynamicSentCount) * 100);
  } else if (template.baseRatePercent !== undefined && dynamicSentCount === 0) {
    ratePercent = template.baseRatePercent;
  }

  // Display text: e.g. "100 (10%)" or "300"
  let displayText = `${effectiveSentCount}`;
  if (ratePercent !== null && ratePercent > 0) {
    displayText = `${effectiveSentCount} (${ratePercent}%)`;
  }

  return {
    sentCount: effectiveSentCount,
    transactingCount: dynamicTransactingCount,
    ratePercent,
    displayText,
  };
}
