import { DonasiOrder } from './donasiData';

export interface PelimpahanJasaDonaturRecord {
  id: string;
  orderId?: string;
  orderNumber?: string;
  avatarLetter: string;
  avatarColor: string;
  customerId: string;
  customerCode?: string;
  customerName?: string;
  nickname: string;
  names: string[];
}

export interface PelimpahanJasaItemSummary {
  id: string;
  itemEventId?: string;
  badgeLetter: string;
  badgeColor: string;
  name: string;
  subtitle: string;
  status: 'Ongoing' | 'Berakhir' | string;
  totalNamaCount: number;
  subtextNamaCount?: string;
  donaturs: PelimpahanJasaDonaturRecord[];
  nameDownloadDates?: Record<string, string | null>;
  jumlahDanaText?: string;
  jumlahDonaturText?: string;
  periodeText?: string;
}

export interface CarouselStatCard {
  id: string;
  title: string; // Nama Item D-DONASI
  jumlahDownloaded: number; // Jumlah nama pelimpahan jasa yang sudah di-download
  jumlahBelumDownload: number; // Jumlah nama pelimpahan jasa yang belum di-download
  satuan: string; // 'paket' | 'buku' | 'buah' | 'nama' dll
  iconType: string; // 'cart' | 'globe' | 'book' | 'pill' | 'sparkles' dll
  iconBg?: string; // background color, default '#008d91'
  logoUrl?: string; // custom image url jika ada
  linkedItemId?: string; // link opsional ke item pelimpahan jasa
}

export const CAROUSEL_STATS_STORAGE_KEY = 'yppln_report_pelimpahan_jasa_carousel_stats_v3';

export const FORBIDDEN_CAROUSEL_TITLES = [
  'paket yang terundang',
  'buku yang terundang',
  'vitamin c yang terundang',
  'dana jubah yang terundang',
];

export function isForbiddenCarouselCard(title: string): boolean {
  const t = (title || '').toLowerCase().trim();
  return FORBIDDEN_CAROUSEL_TITLES.some((forbidden) => t.includes(forbidden));
}

export const INITIAL_CAROUSEL_STATS: CarouselStatCard[] = [
  {
    id: 'stat-patron',
    title: 'Donasi Patron Rutin',
    jumlahDownloaded: 100,
    jumlahBelumDownload: 0,
    satuan: 'Nama',
    iconType: 'cart',
    iconBg: '#F59E0B',
    linkedItemId: 'item-pelimpahan-1',
  },
  {
    id: 'stat-kathina',
    title: 'Kathina 2021',
    jumlahDownloaded: 30,
    jumlahBelumDownload: 10,
    satuan: 'Nama',
    iconType: 'globe',
    iconBg: '#E05D44',
    linkedItemId: 'item-pelimpahan-2',
  },
  {
    id: 'stat-makan-sangha',
    title: 'Donasi Dana Makan Sangha',
    jumlahDownloaded: 1,
    jumlahBelumDownload: 0,
    satuan: 'Nama',
    iconType: 'globe',
    iconBg: '#008d91',
    linkedItemId: 'item-pelimpahan-3',
  },
];

export function loadCarouselStats(): CarouselStatCard[] {
  try {
    const saved = localStorage.getItem(CAROUSEL_STATS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const loaded: CarouselStatCard[] = parsed
          .filter((item: any) => !isForbiddenCarouselCard(item.title || item.name || ''))
          .map((item: any, idx: number) => ({
            id: item.id || `stat-${idx + 1}`,
            title: item.title || item.name || 'Item D-DONASI',
            jumlahDownloaded: typeof item.jumlahDownloaded === 'number' ? item.jumlahDownloaded : (item.value ? parseInt(item.value.replace(/\D/g, ''), 10) || 0 : 0),
            jumlahBelumDownload: typeof item.jumlahBelumDownload === 'number' ? item.jumlahBelumDownload : (item.subtext ? parseInt(item.subtext.replace(/\D/g, ''), 10) || 0 : 0),
            satuan: item.satuan || (item.value ? item.value.replace(/[\d.,\s+]/g, '') : 'Nama') || 'Nama',
            iconType: item.iconType || (idx === 0 ? 'cart' : 'globe'),
            iconBg: item.iconBg || '#008d91',
            logoUrl: item.logoUrl,
            linkedItemId: item.linkedItemId,
          }));

        // Ensure user examples exist in loaded list
        INITIAL_CAROUSEL_STATS.forEach((init) => {
          const idx = loaded.findIndex((l) => l.title.toLowerCase() === init.title.toLowerCase());
          if (idx === -1) {
            loaded.push(init);
          }
        });
        return loaded;
      }
    }
  } catch (e) {
    console.error('Failed to load carousel stats', e);
  }
  return INITIAL_CAROUSEL_STATS;
}

export function saveCarouselStats(stats: CarouselStatCard[]): void {
  try {
    localStorage.setItem(CAROUSEL_STATS_STORAGE_KEY, JSON.stringify(stats));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('report_pelimpahan_carousel_updated'));
    }
  } catch (e) {
    console.error('Failed to save carousel stats', e);
  }
}

export const INITIAL_PELIMPAHAN_JASA_ITEMS: PelimpahanJasaItemSummary[] = [
  {
    id: 'item-pelimpahan-1',
    itemEventId: 'item-patron',
    badgeLetter: 'D',
    badgeColor: 'bg-[#F59E0B]',
    name: 'Donasi Patron Rutin',
    subtitle: 'Dharma Patron Rutin - FUN',
    status: 'Ongoing',
    totalNamaCount: 100,
    subtextNamaCount: '',
    jumlahDanaText: 'Rp3.000.000',
    jumlahDonaturText: '100 orang',
    periodeText: '1 Jan 2021 - 31 Des 2021',
    nameDownloadDates: {
      'Suhu Bhadra Ruci': '12 Nov 2021',
      'Orang Tua & Leluhur': '12 Nov 2021',
      'Keluarga Besar Lilo': '12 Nov 2021',
      'Semua Makhluk': '12 Nov 2021',
      'Para Guru Spiritual': '12 Nov 2021',
      'Bhadra Foundation': '12 Nov 2021',
    },
    donaturs: [
      {
        id: 'donatur-lilo-1',
        orderId: 'donasi-1',
        orderNumber: 'D-Call Center 21111400005',
        avatarLetter: 'L',
        avatarColor: 'bg-[#008d91]',
        customerId: '10001 Lilo',
        customerCode: '10001',
        customerName: 'Lilo',
        nickname: 'Lilo',
        names: [
          'Suhu Bhadra Ruci',
          'Orang Tua & Leluhur',
          'Keluarga Besar Lilo',
          'Semua Makhluk',
          'Para Guru Spiritual',
          'Bhadra Foundation',
        ],
      },
      {
        id: 'donatur-lilo-2',
        orderId: 'donasi-2',
        orderNumber: 'D-Call Center 21111400006',
        avatarLetter: 'L',
        avatarColor: 'bg-[#008d91]',
        customerId: '10001 Lilo',
        customerCode: '10001',
        customerName: 'Lilo',
        nickname: 'Lilo',
        names: [
          'Suhu Bhadra Ruci',
          'Keluarga Besar Dharma',
          'Para Leluhur',
          'Semua Makhluk Hidup',
        ],
      },
      {
        id: 'donatur-ag-patron',
        orderId: 'donasi-agustino',
        orderNumber: 'D-Call Center 21111400001',
        avatarLetter: 'A',
        avatarColor: 'bg-[#008d91]',
        customerId: '00031 Agustino Ong',
        customerCode: '00031',
        customerName: 'Agustino Ong',
        nickname: 'Ko Agus',
        names: ['Suhu Bhadra Ruci', 'Semua Makhluk'],
      },
    ],
  },
  {
    id: 'item-pelimpahan-2',
    itemEventId: 'item-kathina-2021',
    badgeLetter: 'K',
    badgeColor: 'bg-[#E05D44]',
    name: 'Kathina 2021',
    subtitle: 'Kathina Dana - MAD',
    status: 'Ongoing',
    totalNamaCount: 40,
    subtextNamaCount: '(+10 Nama)',
    jumlahDanaText: 'Rp5.504.662',
    jumlahDonaturText: '300 orang',
    periodeText: '1 Jan 2021 - 15 Nov 2021',
    nameDownloadDates: {
      'Suhu Bhadra Ruci': '12 Nov 2021',
      'Semua Makhluk': '12 Nov 2021',
      'Cindy Budiman': '14 Nov 2021',
      'Cindy Pao Budiman': null, // NEW - belum di-download (10 nama baru)
      'Silvia Fukada': '14 Nov 2021',
    },
    donaturs: [
      {
        id: 'donatur-1',
        orderId: 'donasi-agustino',
        orderNumber: 'D-Call Center 21111400001',
        avatarLetter: 'A',
        avatarColor: 'bg-[#008d91]',
        customerId: '00031 Agustino Ong',
        customerCode: '00031',
        customerName: 'Agustino Ong',
        nickname: 'Ko Agus',
        names: ['Suhu Bhadra Ruci', 'Semua Makhluk'],
      },
      {
        id: 'donatur-2',
        orderId: 'donasi-cindy',
        orderNumber: 'D-Call Center 21111400002',
        avatarLetter: 'C',
        avatarColor: 'bg-[#FACC15]',
        customerId: '00019 Cindy Budiman',
        customerCode: '00019',
        customerName: 'Cindy Budiman',
        nickname: 'Ci Pao',
        names: ['Suhu Bhadra Ruci', 'Cindy Budiman', 'Semua Makhluk'],
      },
      {
        id: 'donatur-3',
        orderId: 'donasi-silvia',
        orderNumber: 'D-Call Center 21111400003',
        avatarLetter: 'S',
        avatarColor: 'bg-[#64748B]',
        customerId: '00018 Silvia Fukada',
        customerCode: '00018',
        customerName: 'Silvia Fukada',
        nickname: 'Ci Silvia',
        names: ['Suhu Bhadra Ruci', 'Cindy Pao Budiman', 'Silvia Fukada'],
      },
    ],
  },
  {
    id: 'item-pelimpahan-3',
    itemEventId: 'item-makan-sangha',
    badgeLetter: 'M',
    badgeColor: 'bg-[#008d91]',
    name: 'Donasi Dana Makan Sangha',
    subtitle: 'Dana Makan Sangha - FUN',
    status: 'Ongoing',
    totalNamaCount: 1,
    subtextNamaCount: '',
    jumlahDanaText: 'Rp150.000',
    jumlahDonaturText: '2 orang',
    periodeText: '1 Nov 2021 - 30 Nov 2021',
    nameDownloadDates: {
      'Keluarga Besar Tan': '14 Nov 2021',
    },
    donaturs: [
      {
        id: 'donatur-makan-1',
        orderId: 'donasi-tan',
        orderNumber: 'D-Call Center 21111400004',
        avatarLetter: 'T',
        avatarColor: 'bg-[#008d91]',
        customerId: '00088 Tan Wijaya',
        customerCode: '00088',
        customerName: 'Tan Wijaya',
        nickname: 'Pak Tan',
        names: ['Keluarga Besar Tan'],
      },
    ],
  },
];

export const PELIMPAHAN_JASA_STORAGE_KEY = 'yppln_report_pelimpahan_jasa_data_v3';

/**
 * Normalizes a string for comparison: lowercase, remove special characters, trim multiple spaces
 */
export function normalizeName(name: string): string {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Levenshtein distance calculation between two normalized strings
 */
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Checks if two non-identical names are similar (e.g., 'Cindy Budiman' and 'Cindy Pao Budiman',
 * or slight typo / nickname variation)
 */
export function areNamesSimilar(nameA: string, nameB: string): boolean {
  const normA = normalizeName(nameA);
  const normB = normalizeName(nameB);

  // Exact match is treated as duplicate, not similarity
  if (!normA || !normB || normA === normB) return false;

  const wordsA = normA.split(' ').filter(Boolean);
  const wordsB = normB.split(' ').filter(Boolean);

  // Set intersection of words
  const setB = new Set(wordsB);
  const intersection = wordsA.filter((w) => setB.has(w));
  const minWords = Math.min(wordsA.length, wordsB.length);

  // Condition 1: Substring / subset match (e.g. "Cindy Budiman" in "Cindy Pao Budiman")
  if (intersection.length >= 2 && intersection.length / minWords >= 0.66) {
    return true;
  }

  // Condition 2: 1-word common with short 2-word names
  if (minWords === 1 && intersection.length === 1 && Math.max(wordsA.length, wordsB.length) <= 2) {
    return true;
  }

  // Condition 3: Jaccard similarity of words
  const union = new Set([...wordsA, ...wordsB]);
  if (union.size > 0 && intersection.length / union.size >= 0.5) {
    return true;
  }

  // Condition 4: Levenshtein distance for spelling variations (e.g. Silvia vs Sylvia)
  const levDist = levenshteinDistance(normA, normB);
  const maxLen = Math.max(normA.length, normB.length);
  if (maxLen > 4 && levDist <= 2) return true;
  if (maxLen > 8 && levDist <= 3) return true;

  return false;
}

export type NameHighlightStatus = 'duplicate' | 'similar' | 'unique';

/**
 * Evaluates all names within a specific Item group.
 * Rule:
 * - Duplicate (sama): appears more than once -> 'duplicate' (highlight red)
 * - Similar (mirip): similar to another name -> 'similar' (highlight yellow)
 * - Unique: normal text
 */
export function getNameHighlightStatuses(
  allNamesInGroup: string[]
): Record<string, NameHighlightStatus> {
  const normCounts: Record<string, number> = {};
  allNamesInGroup.forEach((n) => {
    const norm = normalizeName(n);
    normCounts[norm] = (normCounts[norm] || 0) + 1;
  });

  const statuses: Record<string, NameHighlightStatus> = {};

  allNamesInGroup.forEach((name) => {
    const norm = normalizeName(name);

    // Exact duplicate check
    if (normCounts[norm] > 1) {
      statuses[name] = 'duplicate';
      return;
    }

    // Similarity check against all other distinct names
    const isSimilar = allNamesInGroup.some((other) => {
      const otherNorm = normalizeName(other);
      if (otherNorm === norm) return false;
      return areNamesSimilar(name, other);
    });

    if (isSimilar) {
      statuses[name] = 'similar';
    } else {
      statuses[name] = 'unique';
    }
  });

  return statuses;
}

/**
 * Synchronizes and aggregates pelimpahan jasa names from live Transaksi D-DONASI orders
 * grouped by Item D-DONASI.
 */
export function syncPelimpahanJasaWithOrders(
  baseItems: PelimpahanJasaItemSummary[],
  orders: DonasiOrder[]
): PelimpahanJasaItemSummary[] {
  const cleanBase = (baseItems || []).filter((it) => !isForbiddenCarouselCard(it.name));
  if (!orders || orders.length === 0) return cleanBase;

  // Clone base items so we don't mutate state directly
  const result: PelimpahanJasaItemSummary[] = cleanBase.map((it) => ({
    ...it,
    donaturs: [...it.donaturs],
    nameDownloadDates: { ...(it.nameDownloadDates || {}) },
  }));

  orders.forEach((order) => {
    // Collect pelimpahan names for this order
    const names: string[] = [];
    if (order.pelimpahanJasa?.allNames && order.pelimpahanJasa.allNames.length > 0) {
      names.push(...order.pelimpahanJasa.allNames);
    } else if (order.pelimpahanJasa?.name) {
      names.push(order.pelimpahanJasa.name);
    }

    if (names.length === 0) return;

    // All items in this order
    const allOrderItems = [...(order.items || []), ...(order.extraItems || [])];

    allOrderItems.forEach((oi) => {
      if (isForbiddenCarouselCard(oi.name)) return;

      // Group matching
      let targetItem = result.find((it) => {
        const itName = it.name.toLowerCase();
        const oiName = oi.name.toLowerCase();
        if (oiName.includes('kathina') && itName.includes('kathina')) return true;
        if (oiName.includes('patron') && itName.includes('patron')) return true;
        if (oiName.includes('makan') && itName.includes('makan')) return true;
        return (
          itName.includes(oiName) ||
          oiName.includes(itName) ||
          (it.subtitle && it.subtitle.toLowerCase().includes(oi.category?.toLowerCase() || ''))
        );
      });

      // If no matching item exists, create a new item group
      if (!targetItem) {
        const badgeColor = oi.codeBadgeColor || 'bg-[#008d91]';
        const badgeLetter = oi.codeBadge || (oi.name.charAt(0).toUpperCase() || 'D');
        targetItem = {
          id: `item-pelimpahan-${oi.id || Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          badgeLetter,
          badgeColor: badgeColor.startsWith('bg-') ? badgeColor : `bg-[#008d91]`,
          name: oi.name,
          subtitle: oi.category || 'Item D-DONASI',
          status: 'Ongoing',
          totalNamaCount: 0,
          subtextNamaCount: '',
          nameDownloadDates: {},
          donaturs: [],
        };
        result.push(targetItem);
      }

      // Check if this order is already in this item's donaturs
      const existingDonaturIdx = targetItem.donaturs.findIndex(
        (d) => d.orderId === order.id || d.orderNumber === order.orderNumber
      );

      const customerCode = order.customerId.match(/^\d+/)?.[0] || '';
      const customerName =
        order.namaDonatur?.name || order.customerId.replace(/^\d+\s*/, '') || 'Donatur';
      const avatarLetter = (customerName.charAt(0) || 'D').toUpperCase();

      if (existingDonaturIdx >= 0) {
        const existing = targetItem.donaturs[existingDonaturIdx];
        const mergedNames = Array.from(new Set([...existing.names, ...names]));
        targetItem.donaturs[existingDonaturIdx] = {
          ...existing,
          names: mergedNames,
        };
      } else {
        targetItem.donaturs.push({
          id: `donatur-${order.id}`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          avatarLetter,
          avatarColor: 'bg-[#008d91]',
          customerId: order.customerId,
          customerCode,
          customerName,
          nickname: order.namaDonatur?.name || customerName,
          names,
        });
      }

      // Sync name download dates (new names start with null = NEW)
      const currentDates = { ...(targetItem.nameDownloadDates || {}) };
      names.forEach((n) => {
        if (currentDates[n] === undefined) {
          currentDates[n] = null;
        }
      });
      targetItem.nameDownloadDates = currentDates;
    });
  });

  // Re-calculate dynamic counts for each item
  return result.map((it) => {
    const dates = it.nameDownloadDates || {};
    const dateEntries = Object.entries(dates);
    const undownloadedCount = dateEntries.filter(([, d]) => !d).length;

    const totalFromDonaturs = it.donaturs.reduce((acc, d) => acc + d.names.length, 0);
    const total = Math.max(it.totalNamaCount || 0, totalFromDonaturs);

    let subtext = '';
    if (undownloadedCount > 0) {
      subtext = `(+${undownloadedCount} Nama)`;
    } else if (it.name.toLowerCase().includes('kathina') && undownloadedCount === 0 && it.subtextNamaCount?.includes('+10')) {
      subtext = '(+10 Nama)';
    }

    return {
      ...it,
      totalNamaCount: total,
      subtextNamaCount: subtext,
    };
  });
}

