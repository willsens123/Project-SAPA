import { IdentitasItem } from '../identitasData';
import { DuplicatePair } from '../types';

export const normalizePhone = (phone?: string): string => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('62')) return '0' + digits.slice(2);
  return digits;
};

export const normalizeStr = (str?: string): string => {
  return (str || '').toLowerCase().trim();
};

export const findDuplicatePairs = (
  items: IdentitasItem[],
  dismissedPairIds: string[] = []
): DuplicatePair[] => {
  const pairs: DuplicatePair[] = [];
  const checkedKeys = new Set<string>();

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];

      // Key to avoid duplicate pairs
      const pairKey = [a.id, b.id].sort().join('__');
      if (checkedKeys.has(pairKey)) continue;

      const isDismissed =
        dismissedPairIds.includes(pairKey) ||
        dismissedPairIds.includes(`${a.id}-${b.id}`) ||
        dismissedPairIds.includes(`${b.id}-${a.id}`);
      if (isDismissed) continue;

      const nameA = normalizeStr(a.namaLengkap);
      const nameB = normalizeStr(b.namaLengkap);

      const phoneA = normalizePhone(a.nomorHandPhone);
      const phoneB = normalizePhone(b.nomorHandPhone);

      const emailA = normalizeStr(a.email);
      const emailB = normalizeStr(b.email);

      let reason = '';

      if (nameA && nameB && nameA === nameB) {
        reason = 'Nama Lengkap sama';
      } else if (phoneA && phoneB && phoneA === phoneB && phoneA.length >= 8) {
        reason = 'Nomor HandPhone sama';
      } else if (emailA && emailB && emailA === emailB && emailA.includes('@')) {
        reason = 'Alamat Email sama';
      }

      if (reason) {
        checkedKeys.add(pairKey);
        pairs.push({
          id: pairKey,
          item1: a,
          item2: b,
          reason,
        });
      }
    }
  }

  return pairs;
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
