import { IdentitasItem } from '../identitasData';
import { DuplicateFieldScore, DuplicatePair } from '../types';

export interface DuplicateDetectionOptions {
  minSimilarity?: number; // Default 80 (strictly > 80% for Smart Match)
  includeExact?: boolean;
  includeFuzzy?: boolean;
}

export const normalizePhone = (phone?: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('62')) return '0' + digits.slice(2);
  if (digits.startsWith('8') && digits.length >= 9) return '0' + digits;
  return digits;
};

export const normalizeStr = (str?: string): string => {
  return (str || '').toLowerCase().trim().replace(/\s+/g, ' ');
};

const cleanNameForFuzzy = (str?: string): string => {
  return normalizeStr(str)
    .replace(/[.,/#!$%^&*;:{}=\-_`~()'"?]/g, ' ')
    .replace(/\b(dr|drs|ir|h|hj|kh|sh|se|st|ko|ci|pak|bu|ibu|bpk|ust|rm|bhante|sucek)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const isMeaningfulValue = (val?: string): boolean => {
  const norm = normalizeStr(val);
  if (!norm || norm === '-' || norm === 'no name' || norm === 'none' || norm === 'n/a') {
    return false;
  }
  return true;
};

/**
 * Levenshtein edit distance between two strings.
 */
export const levenshteinDistance = (a: string, b: string): number => {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);

  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    const chA = a.charCodeAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const cost = chA === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,      // deletion
        curr[j - 1] + 1,  // insertion
        prev[j - 1] + cost // substitution
      );
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
  }

  return prev[n];
};

/**
 * Normalized Levenshtein similarity score in range [0, 100].
 */
export const levenshteinSimilarity = (a: string, b: string): number => {
  if (!a || !b) return 0;
  if (a === b) return 100;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100;
  const dist = levenshteinDistance(a, b);
  return Math.max(0, Math.round(((maxLen - dist) / maxLen) * 1000) / 10);
};

/**
 * Jaro-Winkler similarity score in range [0, 100].
 * Particularly accurate for personal names, spelling variations, and transpositions.
 */
export const jaroWinklerSimilarity = (s1: string, s2: string): number => {
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 100;

  const len1 = s1.length;
  const len2 = s2.length;
  const matchWindow = Math.max(0, Math.floor(Math.max(len1, len2) / 2) - 1);

  const s1Matches = new Array<boolean>(len1).fill(false);
  const s2Matches = new Array<boolean>(len2).fill(false);

  let matches = 0;
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);
    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const jaro =
    (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;

  // Winkler prefix boost up to 4 characters
  let prefix = 0;
  const maxPrefix = Math.min(4, len1, len2);
  for (let i = 0; i < maxPrefix; i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  const jaroWinkler = jaro + prefix * 0.1 * (1 - jaro);
  return Math.min(100, Math.round(jaroWinkler * 1000) / 10);
};

/**
 * Token-sorted + strict pairwise token matching ratio in range [0, 100].
 * Catches swapped name order ("Budi Santoso" vs "Santoso, Budi") and initials ("Agustino Ong" vs "Agustino O."),
 * while avoiding false positives when only one common given name matches ("Karunika Dewi" vs "Dewi Lestari").
 */
export const tokenSetSimilarity = (a: string, b: string): number => {
  const tokensA = a.split(' ').filter(Boolean);
  const tokensB = b.split(' ').filter(Boolean);
  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const sortedA = [...tokensA].sort().join(' ');
  const sortedB = [...tokensB].sort().join(' ');
  const sortedLev = levenshteinSimilarity(sortedA, sortedB);
  const sortedJw = jaroWinklerSimilarity(sortedA, sortedB);
  const sortedBlended = sortedLev * 0.75 + sortedJw * 0.25;

  // Pairwise token comparison using strict Levenshtein per word
  const longer = tokensA.length >= tokensB.length ? tokensA : tokensB;
  const shorter = tokensA.length >= tokensB.length ? tokensB : tokensA;

  let totalBest = 0;
  const used = new Set<number>();

  for (const tShort of shorter) {
    let bestScore = 0;
    let bestIdx = -1;
    for (let idx = 0; idx < longer.length; idx++) {
      if (used.has(idx)) continue;
      const tLong = longer[idx];
      const wordLev = levenshteinSimilarity(tShort, tLong);
      const wordJw = jaroWinklerSimilarity(tShort, tLong);
      let score = wordLev * 0.7 + wordJw * 0.3;

      // Initial matching: e.g. "o" matching "ong"
      if (
        (tShort.length === 1 && tLong.startsWith(tShort)) ||
        (tLong.length === 1 && tShort.startsWith(tLong))
      ) {
        score = Math.max(score, 84);
      }
      if (score > bestScore) {
        bestScore = score;
        bestIdx = idx;
      }
    }
    if (bestIdx >= 0) used.add(bestIdx);
    totalBest += bestScore;
  }

  const lengthPenalty = shorter.length / longer.length;
  const pairwiseAvg = (totalBest / shorter.length) * (0.35 + 0.65 * lengthPenalty);

  return Math.round(Math.max(sortedLev, sortedBlended, pairwiseAvg) * 10) / 10;
};

interface StringComparisonResult {
  score: number;
  algorithm: DuplicateFieldScore['algorithm'];
}

export const compareTextFuzzy = (rawA?: string, rawB?: string): StringComparisonResult => {
  if (!isMeaningfulValue(rawA) || !isMeaningfulValue(rawB)) {
    return { score: 0, algorithm: 'Levenshtein' };
  }
  const normA = normalizeStr(rawA);
  const normB = normalizeStr(rawB);
  if (normA === normB) {
    return { score: 100, algorithm: 'Exact' };
  }

  const cleanA = cleanNameForFuzzy(rawA) || normA;
  const cleanB = cleanNameForFuzzy(rawB) || normB;
  if (cleanA === cleanB) {
    return { score: 98, algorithm: 'Token-Set' };
  }

  const lev = Math.max(levenshteinSimilarity(normA, normB), levenshteinSimilarity(cleanA, cleanB));
  const jwRaw = Math.max(jaroWinklerSimilarity(normA, normB), jaroWinklerSimilarity(cleanA, cleanB));
  // Blend Jaro-Winkler with Levenshtein so prefix coincidence alone doesn't over-score unrelated names
  const jwBlended = jwRaw * 0.6 + lev * 0.4;
  const tok = tokenSetSimilarity(cleanA, cleanB);

  if (tok >= lev && tok >= jwBlended) {
    return { score: Math.min(99, Math.round(tok)), algorithm: 'Token-Set' };
  }
  if (jwBlended >= lev) {
    return { score: Math.min(99, Math.round(jwBlended)), algorithm: 'Jaro-Winkler' };
  }
  return { score: Math.min(99, Math.round(lev)), algorithm: 'Levenshtein' };
};

export const compareEmailFuzzy = (rawA?: string, rawB?: string): StringComparisonResult => {
  if (!isMeaningfulValue(rawA) || !isMeaningfulValue(rawB)) {
    return { score: 0, algorithm: 'Levenshtein' };
  }
  const emailA = normalizeStr(rawA);
  const emailB = normalizeStr(rawB);
  if (!emailA.includes('@') || !emailB.includes('@')) {
    return { score: 0, algorithm: 'Levenshtein' };
  }
  if (emailA === emailB) {
    return { score: 100, algorithm: 'Exact' };
  }

  const [localA, domainA] = emailA.split('@');
  const [localB, domainB] = emailB.split('@');

  const fullLev = levenshteinSimilarity(emailA, emailB);
  const fullJw = jaroWinklerSimilarity(emailA, emailB);

  const localLev = levenshteinSimilarity(localA || '', localB || '');
  const localJw = jaroWinklerSimilarity(localA || '', localB || '');
  const domainScore = domainA === domainB ? 100 : levenshteinSimilarity(domainA || '', domainB || '');

  // If local parts are >= 4 chars, require high local-part similarity so @gmail.com alone doesn't inflate unrelated emails
  const localBest = Math.max(localLev, localJw * 0.65 + localLev * 0.35);
  const composite =
    (localA?.length || 0) >= 4 && (localB?.length || 0) >= 4
      ? localBest * 0.85 + domainScore * 0.15
      : Math.max(fullLev, fullJw * 0.6 + fullLev * 0.4);

  const finalScore = localBest < 55 ? Math.round(localBest) : Math.min(99, Math.round(Math.max(fullLev, composite)));
  return {
    score: finalScore,
    algorithm: fullJw > fullLev ? 'Jaro-Winkler' : 'Levenshtein',
  };
};

export const comparePhoneFuzzy = (rawA?: string, rawB?: string): StringComparisonResult => {
  const phoneA = normalizePhone(rawA);
  const phoneB = normalizePhone(rawB);
  if (phoneA.length < 8 || phoneB.length < 8) {
    return { score: 0, algorithm: 'Digit-Match' };
  }
  if (phoneA === phoneB) {
    return { score: 100, algorithm: 'Exact' };
  }
  const lev = levenshteinSimilarity(phoneA, phoneB);
  return {
    score: Math.min(99, Math.round(lev)),
    algorithm: 'Digit-Match',
  };
};

export interface DuplicateCandidateMatch {
  existingItem: IdentitasItem;
  reason: string;
  similarityScore: number;
  matchType: 'exact' | 'fuzzy';
  fieldScores: DuplicateFieldScore[];
}

export type IdentitasDuplicateCandidate = Partial<IdentitasItem> & {
  extraPhones?: string[];
};

const collectCandidatePhones = (item: IdentitasDuplicateCandidate): string[] => {
  const seen = new Set<string>();
  const rawList: string[] = [];
  const pushPhone = (val?: string) => {
    if (!isMeaningfulValue(val)) return;
    const trimmed = String(val).trim();
    const norm = normalizePhone(trimmed);
    if (norm.length < 8 || seen.has(norm)) return;
    seen.add(norm);
    rawList.push(trimmed);
  };
  pushPhone(item.nomorHandPhone);
  item.extraPhones?.forEach(pushPhone);
  item.alamatList?.forEach((addr) => pushPhone(addr.nomorHp));
  return rawList;
};

const comparePhonesMulti = (
  a: IdentitasDuplicateCandidate,
  b: IdentitasItem
): StringComparisonResult & { matchedValA: string; matchedValB: string } => {
  const phonesA = collectCandidatePhones(a);
  const phonesB = collectCandidatePhones(b);
  let best: StringComparisonResult & { matchedValA: string; matchedValB: string } = {
    score: 0,
    algorithm: 'Digit-Match',
    matchedValA: a.nomorHandPhone || '',
    matchedValB: b.nomorHandPhone || '',
  };

  for (const pa of phonesA) {
    for (const pb of phonesB) {
      const cmp = comparePhoneFuzzy(pa, pb);
      if (cmp.score > best.score) {
        best = { ...cmp, matchedValA: pa, matchedValB: pb };
      }
      if (best.score === 100) return best;
    }
  }
  return best;
};

const compareNamesWithKtp = (
  a: IdentitasDuplicateCandidate,
  b: IdentitasItem
): StringComparisonResult & { matchedValA: string; matchedValB: string } => {
  const namesA = [a.namaLengkap, a.namaLengkapKtp].filter((v): v is string => isMeaningfulValue(v));
  const namesB = [b.namaLengkap, b.namaLengkapKtp].filter((v): v is string => isMeaningfulValue(v));
  let best: StringComparisonResult & { matchedValA: string; matchedValB: string } = {
    score: 0,
    algorithm: 'Levenshtein',
    matchedValA: a.namaLengkap || a.namaLengkapKtp || '',
    matchedValB: b.namaLengkap || b.namaLengkapKtp || '',
  };

  for (const na of namesA) {
    for (const nb of namesB) {
      const cmp = compareTextFuzzy(na, nb);
      if (cmp.score > best.score) {
        best = { ...cmp, matchedValA: na, matchedValB: nb };
      }
      if (best.score === 100) return best;
    }
  }
  return best;
};

export const scoreIdentitasPair = (
  a: IdentitasDuplicateCandidate,
  b: IdentitasItem,
  options: DuplicateDetectionOptions = {}
): {
  matches: boolean;
  reason: string;
  similarityScore: number;
  matchType: 'exact' | 'fuzzy';
  fieldScores: DuplicateFieldScore[];
} | null => {
  const {
    minSimilarity = 80,
    includeExact = true,
    includeFuzzy = true,
  } = options;

  const aName = a.namaLengkap || a.namaLengkapKtp || '';
  const aNick = a.namaPanggilan || '';
  const aPhone = a.nomorHandPhone || collectCandidatePhones(a)[0] || '';
  const aEmail = a.email || '';
  const aKota = a.kota || '';
  const aOrg = a.organisasi || '';

  const nameCmp = compareNamesWithKtp(a, b);
  const nickCmp = compareTextFuzzy(aNick, b.namaPanggilan);
  const phoneCmp = comparePhonesMulti(a, b);
  const emailCmp = compareEmailFuzzy(aEmail, b.email);
  const cityCmp = compareTextFuzzy(aKota, b.kota);
  const orgCmp = compareTextFuzzy(aOrg, b.organisasi);

  const normIdA = (a.nomorIdentitas || '').replace(/[\s\-.]/g, '').toLowerCase();
  const normIdB = (b.nomorIdentitas || '').replace(/[\s\-.]/g, '').toLowerCase();
  const isSameIdDoc =
    normIdA.length >= 6 &&
    normIdB.length >= 6 &&
    normIdA !== '-' &&
    normIdA === normIdB;

  const fieldScores: DuplicateFieldScore[] = [];
  if (isMeaningfulValue(nameCmp.matchedValA) && isMeaningfulValue(nameCmp.matchedValB) && nameCmp.score > 0) {
    fieldScores.push({
      field: 'namaLengkap',
      label: 'Nama Lengkap',
      score: nameCmp.score,
      value1: nameCmp.matchedValA,
      value2: nameCmp.matchedValB,
      algorithm: nameCmp.algorithm,
    });
  }
  if (isMeaningfulValue(phoneCmp.matchedValA) && isMeaningfulValue(phoneCmp.matchedValB) && phoneCmp.score > 0) {
    fieldScores.push({
      field: 'nomorHandPhone',
      label: 'Nomor HP',
      score: phoneCmp.score,
      value1: phoneCmp.matchedValA,
      value2: phoneCmp.matchedValB,
      algorithm: phoneCmp.algorithm,
    });
  }
  if (isMeaningfulValue(aEmail) && isMeaningfulValue(b.email) && emailCmp.score > 0) {
    fieldScores.push({
      field: 'email',
      label: 'Email',
      score: emailCmp.score,
      value1: aEmail || '-',
      value2: b.email || '-',
      algorithm: emailCmp.algorithm,
    });
  }
  if (isMeaningfulValue(aNick) && isMeaningfulValue(b.namaPanggilan) && nickCmp.score >= 60) {
    fieldScores.push({
      field: 'namaPanggilan',
      label: 'Panggilan',
      score: nickCmp.score,
      value1: aNick,
      value2: b.namaPanggilan,
      algorithm: nickCmp.algorithm,
    });
  }
  if (isMeaningfulValue(aKota) && isMeaningfulValue(b.kota) && cityCmp.score >= 70) {
    fieldScores.push({
      field: 'kota',
      label: 'Kota',
      score: cityCmp.score,
      value1: aKota || '-',
      value2: b.kota || '-',
      algorithm: cityCmp.algorithm,
    });
  }
  if (isMeaningfulValue(aOrg) && isMeaningfulValue(b.organisasi) && orgCmp.score >= 70) {
    fieldScores.push({
      field: 'organisasi',
      label: 'Organisasi',
      score: orgCmp.score,
      value1: aOrg,
      value2: b.organisasi,
      algorithm: orgCmp.algorithm,
    });
  }

  // Exact matches (100%)
  const exactReasons: string[] = [];
  if (isSameIdDoc) exactReasons.push('Nomor Identitas sama');
  if (nameCmp.score === 100) exactReasons.push('Nama Lengkap sama');
  if (phoneCmp.score === 100) exactReasons.push('Nomor HandPhone sama');
  if (emailCmp.score === 100) exactReasons.push('Alamat Email sama');

  if (exactReasons.length > 0) {
    if (!includeExact) return null;
    return {
      matches: true,
      reason: exactReasons.join(' & '),
      similarityScore: 100,
      matchType: 'exact',
      fieldScores: fieldScores.sort((x, y) => y.score - x.score),
    };
  }

  if (!includeFuzzy) return null;

  const phoneCorroborated =
    phoneCmp.score >= 88 &&
    (nameCmp.score >= 65 || emailCmp.score >= 70 || nickCmp.score >= 75);

  const effectivePhoneScore = phoneCorroborated ? phoneCmp.score : 0;

  let weightedSum = 0;
  let weightTotal = 0;

  if (isMeaningfulValue(aName) && isMeaningfulValue(b.namaLengkap || b.namaLengkapKtp)) {
    weightedSum += nameCmp.score * 0.5;
    weightTotal += 0.5;
  }
  if (effectivePhoneScore > 0) {
    weightedSum += effectivePhoneScore * 0.22;
    weightTotal += 0.22;
  }
  if (
    isMeaningfulValue(aEmail) &&
    isMeaningfulValue(b.email) &&
    aEmail.includes('@') &&
    (b.email || '').includes('@')
  ) {
    weightedSum += emailCmp.score * 0.16;
    weightTotal += 0.16;
  }
  if (isMeaningfulValue(aNick) && isMeaningfulValue(b.namaPanggilan)) {
    weightedSum += nickCmp.score * 0.06;
    weightTotal += 0.06;
  }
  if (isMeaningfulValue(aKota) && isMeaningfulValue(b.kota)) {
    weightedSum += cityCmp.score * 0.06;
    weightTotal += 0.06;
  }

  const compositeScore = weightTotal > 0 ? Math.round(weightedSum / weightTotal) : 0;
  const peakIdentifierScore = Math.max(nameCmp.score, emailCmp.score, effectivePhoneScore);

  let similarityScore = Math.max(compositeScore, peakIdentifierScore);
  if (similarityScore >= 100) similarityScore = 99;

  const passesThreshold =
    minSimilarity === 80 ? similarityScore > 80 : similarityScore >= minSimilarity;

  if (passesThreshold && peakIdentifierScore > 75) {
    const fuzzyReasons: string[] = [];
    if (nameCmp.score > 80) fuzzyReasons.push(`Nama Lengkap mirip ${nameCmp.score}%`);
    if (emailCmp.score > 80) fuzzyReasons.push(`Email mirip ${emailCmp.score}%`);
    if (effectivePhoneScore > 80) fuzzyReasons.push(`Nomor HP mirip ${effectivePhoneScore}%`);
    if (nickCmp.score > 80 && fuzzyReasons.length === 0) {
      fuzzyReasons.push(`Panggilan mirip ${nickCmp.score}%`);
    }
    if (fuzzyReasons.length === 0) {
      fuzzyReasons.push(`Kemiripan profil gabungan ${similarityScore}%`);
    }

    return {
      matches: true,
      reason: fuzzyReasons.join(' · '),
      similarityScore,
      matchType: 'fuzzy',
      fieldScores: fieldScores.sort((x, y) => y.score - x.score),
    };
  }

  return null;
};

export const findCandidateDuplicates = (
  candidate: IdentitasDuplicateCandidate,
  existingList: IdentitasItem[],
  options: DuplicateDetectionOptions & { excludeId?: string; limit?: number } = {}
): DuplicateCandidateMatch[] => {
  const { excludeId, limit = 5, ...detOptions } = options;
  const normIdLen = (candidate.nomorIdentitas || '').replace(/[\s\-.]/g, '').length;
  const hasMeaningfulInput =
    isMeaningfulValue(candidate.namaLengkap) ||
    isMeaningfulValue(candidate.namaLengkapKtp) ||
    isMeaningfulValue(candidate.email) ||
    collectCandidatePhones(candidate).length > 0 ||
    normIdLen >= 6;

  if (!hasMeaningfulInput) return [];

  const matches: DuplicateCandidateMatch[] = [];
  for (const existing of existingList) {
    if (excludeId && existing.id === excludeId) continue;
    const scored = scoreIdentitasPair(candidate, existing, detOptions);
    if (scored && scored.matches) {
      matches.push({
        existingItem: existing,
        reason: scored.reason,
        similarityScore: scored.similarityScore,
        matchType: scored.matchType,
        fieldScores: scored.fieldScores,
      });
    }
  }

  return matches
    .sort((x, y) => y.similarityScore - x.similarityScore)
    .slice(0, limit);
};

export const findDuplicatePairs = (
  items: IdentitasItem[],
  dismissedPairIds: string[] = [],
  options: DuplicateDetectionOptions = {}
): DuplicatePair[] => {
  const pairs: DuplicatePair[] = [];
  const checkedKeys = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    const a = items[i];
    if (
      !isMeaningfulValue(a.namaLengkap) &&
      !isMeaningfulValue(a.email) &&
      normalizePhone(a.nomorHandPhone).length < 8
    ) {
      continue;
    }

    for (let j = i + 1; j < items.length; j++) {
      const b = items[j];
      if (
        !isMeaningfulValue(b.namaLengkap) &&
        !isMeaningfulValue(b.email) &&
        normalizePhone(b.nomorHandPhone).length < 8
      ) {
        continue;
      }

      const pairKey = [a.id, b.id].sort().join('__');
      if (checkedKeys.has(pairKey)) continue;

      const isDismissed =
        dismissedPairIds.includes(pairKey) ||
        dismissedPairIds.includes(`${a.id}-${b.id}`) ||
        dismissedPairIds.includes(`${b.id}-${a.id}`);
      if (isDismissed) continue;

      const scored = scoreIdentitasPair(a, b, options);
      if (scored && scored.matches) {
        checkedKeys.add(pairKey);
        pairs.push({
          id: pairKey,
          item1: a,
          item2: b,
          reason: scored.reason,
          similarityScore: scored.similarityScore,
          matchType: scored.matchType,
          fieldScores: scored.fieldScores,
        });
      }
    }
  }

  // Sort by highest similarity score first (100% exact -> 99%..81% fuzzy)
  return pairs.sort((p1, p2) => (p2.similarityScore ?? 100) - (p1.similarityScore ?? 100));
};

// Count total unique records involved in duplicates
export const getDuplicateRecordsCount = (pairs: DuplicatePair[]): number => {
  const uniqueIds = new Set<string>();
  pairs.forEach((p) => {
    uniqueIds.add(p.item1.id);
    uniqueIds.add(p.item2.id);
  });
  return uniqueIds.size;
};
