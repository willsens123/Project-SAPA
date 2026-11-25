import { MutasiItem, MutasiLinkedTransaction, PengeluaranItem } from '../types';
import { SalurOrder } from '../salurData';
import { TransaksiAjarItem } from '../transaksiAjarData';
import { DonasiOrder } from '../donasiData';

export interface MutasiMatchSuggestion {
  id: string;
  sourceType: 'salur' | 'ajar' | 'donasi' | 'pengeluaran';
  sourceId: string;
  orderId?: string;
  kode: string;
  dbCr: 'CR' | 'DB';
  nominal: number;
  displayName: string;
  subtitle: string;
  dateStr: string;
  score: number; // 0..100
  confidence: 'tinggi' | 'sedang' | 'rendah';
  reasons: string[];
  alreadyLinkedElsewhere: boolean;
}

export interface MutasiBatchSuggestionEntry {
  mutasi: MutasiItem;
  topSuggestion: MutasiMatchSuggestion;
  allSuggestions: MutasiMatchSuggestion[];
}

export interface AutoMatchSources {
  salurOrders: SalurOrder[];
  transaksiAjarList: TransaksiAjarItem[];
  donasiOrders: DonasiOrder[];
  pengeluaranList: PengeluaranItem[];
  allMutasiItems?: MutasiItem[];
}

const MONTH_MAP: Record<string, number> = {
  jan: 0,
  januari: 0,
  january: 0,
  feb: 1,
  februari: 1,
  february: 1,
  mar: 2,
  maret: 2,
  march: 2,
  apr: 3,
  april: 3,
  mei: 4,
  may: 4,
  jun: 5,
  juni: 5,
  june: 5,
  jul: 6,
  juli: 6,
  july: 6,
  agu: 7,
  agt: 7,
  agustus: 7,
  aug: 7,
  august: 7,
  sep: 8,
  september: 8,
  okt: 9,
  oktober: 9,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  des: 11,
  desember: 11,
  dec: 11,
  december: 11,
};

const BANK_STOP_WORDS = new Set([
  'trsf',
  'transfer',
  'e-banking',
  'ebanking',
  'cr',
  'db',
  'ftscy',
  'switching',
  'bi-fast',
  'bifast',
  'prma',
  'qris',
  'bank',
  'bca',
  'mandiri',
  'bri',
  'bni',
  'dari',
  'ke',
  'untuk',
  'pembayaran',
  'donasi',
  'order',
  'buku',
  'invite',
  'mutasi',
  'rp',
  'idr',
  'no',
  'tgl',
]);

export function parseMoneySafe(val: string | number | undefined): number {
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * Parses flexible date formats into { month (0-11), day (1-31), year? }
 * Handles "1/Nov", "14 Nov 2021", "2021-11-14", "14/11/2021", "10/31", "3010"
 */
function parseSimpleDayMonth(raw?: string): { day: number; month: number; year?: number } | null {
  if (!raw) return null;
  const str = raw.trim().toLowerCase();

  // ISO YYYY-MM-DD
  const iso = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (iso) {
    return {
      year: parseInt(iso[1], 10),
      month: parseInt(iso[2], 10) - 1,
      day: parseInt(iso[3], 10),
    };
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmy = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmy) {
    return {
      day: parseInt(dmy[1], 10),
      month: parseInt(dmy[2], 10) - 1,
      year: parseInt(dmy[3], 10),
    };
  }

  // "1/Nov" or "1 Nov" or "14 Nov 2021"
  const textMatch = str.match(/^(\d{1,2})[\s/\-]+([a-z]+)(?:[\s/\-]+(\d{4}))?/);
  if (textMatch) {
    const day = parseInt(textMatch[1], 10);
    const monStr = textMatch[2];
    const month = MONTH_MAP[monStr] ?? MONTH_MAP[monStr.slice(0, 3)];
    if (month !== undefined && day >= 1 && day <= 31) {
      return {
        day,
        month,
        year: textMatch[3] ? parseInt(textMatch[3], 10) : undefined,
      };
    }
  }

  return null;
}

function getDayDifference(dateA?: string, dateB?: string): number | null {
  const a = parseSimpleDayMonth(dateA);
  const b = parseSimpleDayMonth(dateB);
  if (!a || !b) return null;

  const yearA = a.year || b.year || 2021;
  const yearB = b.year || a.year || 2021;
  const tA = Date.UTC(yearA, a.month, a.day);
  const tB = Date.UTC(yearB, b.month, b.day);
  return Math.round(Math.abs(tA - tB) / (1000 * 60 * 60 * 24));
}

function extractMeaningfulTokens(text?: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((tok) => tok.length >= 3 && !BANK_STOP_WORDS.has(tok) && !/^\d+$/.test(tok));
}

function extractNumericCodes(text?: string): string[] {
  if (!text) return [];
  const matches = text.match(/\d{5,}/g) || [];
  return matches.map((m) => m.replace(/^0+/, '') || m);
}

function scoreCandidateAgainstMutasi(
  mutasi: MutasiItem,
  remainingAmount: number,
  candidate: {
    sourceType: 'salur' | 'ajar' | 'donasi' | 'pengeluaran';
    sourceId: string;
    orderId?: string;
    kode: string;
    dbCr: 'CR' | 'DB';
    nominal: number;
    displayName: string;
    subtitle: string;
    dateStr: string;
    searchableText: string;
  },
  alreadyLinkedKeys: Set<string>,
  currentMutasiLinkedKeys: Set<string>
): MutasiMatchSuggestion | null {
  // 1. Must match CR vs DB direction
  if (candidate.dbCr !== mutasi.type) return null;
  if (candidate.nominal <= 0) return null;

  const candIdKey = `${candidate.sourceType}:${candidate.sourceId}`;
  const candCodeKey = candidate.kode.toLowerCase().trim();
  if (currentMutasiLinkedKeys.has(candIdKey) || currentMutasiLinkedKeys.has(candCodeKey)) {
    return null;
  }

  const alreadyLinkedElsewhere =
    alreadyLinkedKeys.has(candIdKey) || alreadyLinkedKeys.has(candCodeKey);

  let score = 0;
  const reasons: string[] = [];

  // 2. Nominal comparison (against remaining unallocated amount AND total mutasi amount)
  const targetRef = remainingAmount > 0 ? remainingAmount : mutasi.amount;
  const diffRemaining = Math.abs(targetRef - candidate.nominal);
  const diffTotal = Math.abs(mutasi.amount - candidate.nominal);
  const bestDiff = Math.min(diffRemaining, diffTotal);
  const relDiff = candidate.nominal > 0 ? bestDiff / Math.max(candidate.nominal, targetRef) : 1;

  if (bestDiff < 1) {
    score += 55;
    reasons.push('Nominal persis');
  } else if (bestDiff <= 5000 || relDiff <= 0.015) {
    score += 42;
    reasons.push(`Selisih tipis Rp${bestDiff.toLocaleString('id-ID')}`);
  } else if (relDiff <= 0.08) {
    score += 24;
    reasons.push('Nominal mendekati (estimasi fee/kode unik)');
  }

  // 3. Explicit order / reference code in keteranganBank
  const ketLower = (mutasi.keteranganBank || '').toLowerCase();
  const kodeLower = candidate.kode.toLowerCase();
  const candNums = extractNumericCodes(candidate.kode);
  const mutasiNums = extractNumericCodes(mutasi.keteranganBank);
  const hasCodeHit =
    (kodeLower.length >= 4 && ketLower.includes(kodeLower)) ||
    candNums.some((cn) => cn.length >= 5 && mutasiNums.some((mn) => mn.includes(cn) || cn.includes(mn)));

  if (hasCodeHit) {
    score += 35;
    reasons.push('Kode referensi cocok di keterangan');
  }

  // 4. Name & keyword overlap
  const mutasiTokens = extractMeaningfulTokens(mutasi.keteranganBank);
  const candNameTokens = extractMeaningfulTokens(candidate.displayName);
  const candAllTokens = extractMeaningfulTokens(candidate.searchableText);

  const exactNameSub =
    candidate.displayName.trim().length >= 4 &&
    ketLower.includes(candidate.displayName.trim().toLowerCase());

  const nameOverlap = candNameTokens.filter((t) =>
    mutasiTokens.some((mt) => mt === t || (t.length >= 4 && (mt.includes(t) || t.includes(mt))))
  );
  const broadOverlap = candAllTokens.filter((t) => mutasiTokens.includes(t));

  if (exactNameSub || (candNameTokens.length > 0 && nameOverlap.length >= Math.min(2, candNameTokens.length))) {
    score += 30;
    reasons.push('Nama pengirim/penerima cocok');
  } else if (nameOverlap.length > 0) {
    score += 20;
    reasons.push(`Kata kunci nama cocok (${nameOverlap[0]})`);
  } else if (broadOverlap.length > 0) {
    score += 12;
    reasons.push(`Keterangan cocok (${broadOverlap[0]})`);
  }

  // 5. Date proximity bonus
  const dayDiff = getDayDifference(mutasi.date, candidate.dateStr);
  if (dayDiff !== null) {
    if (dayDiff === 0) {
      score += 15;
      reasons.push('Tanggal sama');
    } else if (dayDiff <= 3) {
      score += 10;
      reasons.push(`Tanggal ±${dayDiff} hari`);
    } else if (dayDiff <= 7) {
      score += 4;
    }
  }

  // Require at least nominal closeness or strong code/name hit so unrelated records don't clutter suggestions
  if (bestDiff > 0 && relDiff > 0.15 && !hasCodeHit && nameOverlap.length === 0) {
    return null;
  }

  // Penalize slightly if already connected to another mutasi
  if (alreadyLinkedElsewhere) {
    score = Math.max(0, score - 25);
    reasons.push('Sudah terhubung di mutasi lain');
  }

  const finalScore = Math.min(100, Math.round(score));
  if (finalScore < 45) return null;

  const confidence: MutasiMatchSuggestion['confidence'] =
    finalScore >= 80 ? 'tinggi' : finalScore >= 60 ? 'sedang' : 'rendah';

  return {
    id: `${candidate.sourceType}-${candidate.sourceId}`,
    sourceType: candidate.sourceType,
    sourceId: candidate.sourceId,
    orderId: candidate.orderId,
    kode: candidate.kode,
    dbCr: candidate.dbCr,
    nominal: candidate.nominal,
    displayName: candidate.displayName,
    subtitle: candidate.subtitle,
    dateStr: candidate.dateStr,
    score: finalScore,
    confidence,
    reasons,
    alreadyLinkedElsewhere,
  };
}

function buildAlreadyLinkedSet(allMutasiItems: MutasiItem[]): Set<string> {
  const set = new Set<string>();
  allMutasiItems.forEach((m) => {
    (m.linkedTransactions || []).forEach((l) => {
      if (l.sourceType && l.sourceId) {
        set.add(`${l.sourceType}:${l.sourceId}`);
      }
      if (l.orderId) {
        set.add(`salur:${l.orderId}`);
        set.add(`ajar:${l.orderId}`);
        set.add(`donasi:${l.orderId}`);
      }
      if (l.kode) {
        set.add(l.kode.toLowerCase().trim());
      }
    });
  });
  return set;
}

export function findMutasiMatchSuggestions(
  mutasi: MutasiItem,
  sources: AutoMatchSources,
  options: { limit?: number; minScore?: number; includeAlreadyLinked?: boolean } = {}
): MutasiMatchSuggestion[] {
  const { limit = 5, minScore = 45, includeAlreadyLinked = false } = options;

  const allocated = (mutasi.linkedTransactions || []).reduce(
    (sum, l) => sum + Math.abs(l.nominalAkhir),
    0
  );
  const remainingAmount = Math.max(0, mutasi.amount - allocated);

  const alreadyLinkedKeys = buildAlreadyLinkedSet(sources.allMutasiItems || []);
  const currentMutasiLinkedKeys = new Set<string>();
  (mutasi.linkedTransactions || []).forEach((l) => {
    if (l.sourceType && l.sourceId) {
      currentMutasiLinkedKeys.add(`${l.sourceType}:${l.sourceId}`);
    }
    if (l.kode) {
      currentMutasiLinkedKeys.add(l.kode.toLowerCase().trim());
    }
  });

  const candidates: MutasiMatchSuggestion[] = [];

  if (mutasi.type === 'CR') {
    // 1. S-SALUR
    for (const order of sources.salurOrders) {
      const nominal = parseMoneySafe(order.totalDana);
      const recipient = order.alamat?.recipientName || order.customerId || 'Customer';
      const itemTitle = order.items?.map((i) => i.title).join(', ') || 'Produk S-SALUR';
      const sug = scoreCandidateAgainstMutasi(
        mutasi,
        remainingAmount,
        {
          sourceType: 'salur',
          sourceId: order.id,
          orderId: order.id,
          kode: order.orderNumber || order.id,
          dbCr: 'CR',
          nominal,
          displayName: recipient,
          subtitle: `S-SALUR · ${itemTitle}`,
          dateStr: order.date || '',
          searchableText: `${order.orderNumber} ${order.customerId} ${recipient} ${itemTitle}`,
        },
        alreadyLinkedKeys,
        currentMutasiLinkedKeys
      );
      if (sug) candidates.push(sug);
    }

    // 2. A-AJAR
    for (const item of sources.transaksiAjarList) {
      const nominal = parseMoneySafe(item.totalDana);
      const code = item.orderNumber || item.id;
      const sug = scoreCandidateAgainstMutasi(
        mutasi,
        remainingAmount,
        {
          sourceType: 'ajar',
          sourceId: item.id,
          orderId: item.id,
          kode: `${code} - ${item.customerId}`,
          dbCr: 'CR',
          nominal,
          displayName: item.customerId || 'Peserta A-AJAR',
          subtitle: `A-AJAR · ${item.eventName || item.itemName}`,
          dateStr: item.date || '',
          searchableText: `${code} ${item.customerId} ${item.eventName} ${item.itemName}`,
        },
        alreadyLinkedKeys,
        currentMutasiLinkedKeys
      );
      if (sug) candidates.push(sug);
    }

    // 3. D-DONASI
    for (const order of sources.donasiOrders) {
      const nominal = parseMoneySafe(order.totalDana);
      const donorName = order.namaDonatur?.name || order.customerId || 'Donatur';
      const code = order.orderNumber || order.id;
      const sug = scoreCandidateAgainstMutasi(
        mutasi,
        remainingAmount,
        {
          sourceType: 'donasi',
          sourceId: order.id,
          orderId: order.id,
          kode: `${code} - ${donorName}`,
          dbCr: 'CR',
          nominal,
          displayName: donorName,
          subtitle: `D-DONASI · ${order.keterangan?.title || 'Program Donasi'}`,
          dateStr: order.date || '',
          searchableText: `${code} ${order.customerId} ${donorName} ${order.keterangan?.title || ''} ${order.keterangan?.subtitle || ''}`,
        },
        alreadyLinkedKeys,
        currentMutasiLinkedKeys
      );
      if (sug) candidates.push(sug);
    }
  } else {
    // 4. PENGELUARAN (DB)
    for (const item of sources.pengeluaranList) {
      const nominal = Number(item.nominal || 0);
      const sug = scoreCandidateAgainstMutasi(
        mutasi,
        remainingAmount,
        {
          sourceType: 'pengeluaran',
          sourceId: item.id,
          kode: `No. ${item.no} - ${item.keterangan || item.kebutuhan}`,
          dbCr: 'DB',
          nominal,
          displayName: item.kebutuhan || item.dikeluarkan || 'Pengeluaran',
          subtitle: `${item.divisi} · ${item.keterangan || '-'}`,
          dateStr: item.tanggal || '',
          searchableText: `${item.no} ${item.kebutuhan} ${item.keterangan} ${item.divisi} ${item.dikeluarkan}`,
        },
        alreadyLinkedKeys,
        currentMutasiLinkedKeys
      );
      if (sug) candidates.push(sug);
    }
  }

  return candidates
    .filter((c) => c.score >= minScore && (includeAlreadyLinked || !c.alreadyLinkedElsewhere))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function buildLinkedTransactionFromSuggestion(
  suggestion: MutasiMatchSuggestion
): MutasiLinkedTransaction {
  const absNominal = Math.abs(suggestion.nominal);
  return {
    id: `link-auto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sourceType: suggestion.sourceType,
    sourceId: suggestion.sourceId,
    orderId: suggestion.orderId,
    kode: suggestion.kode,
    dbCr: suggestion.dbCr,
    nominalAkhir: suggestion.dbCr === 'DB' ? -absNominal : absNominal,
    keterangan: `${suggestion.subtitle} (Auto-match skor ${suggestion.score}%)`,
    createdAt: new Date().toISOString(),
  };
}

export function findBatchMutasiSuggestions(
  mutasiList: MutasiItem[],
  sources: Omit<AutoMatchSources, 'allMutasiItems'>,
  options: { minScore?: number } = {}
): MutasiBatchSuggestionEntry[] {
  const { minScore = 60 } = options;
  const fullSources: AutoMatchSources = { ...sources, allMutasiItems: mutasiList };
  const results: MutasiBatchSuggestionEntry[] = [];

  for (const mutasi of mutasiList) {
    const isConnected = Boolean(mutasi.linkedTransactions && mutasi.linkedTransactions.length > 0);
    if (isConnected) continue;

    const suggestions = findMutasiMatchSuggestions(mutasi, fullSources, {
      limit: 3,
      minScore,
      includeAlreadyLinked: false,
    });
    if (suggestions.length > 0) {
      results.push({
        mutasi,
        topSuggestion: suggestions[0],
        allSuggestions: suggestions,
      });
    }
  }

  return results.sort((a, b) => b.topSuggestion.score - a.topSuggestion.score);
}
