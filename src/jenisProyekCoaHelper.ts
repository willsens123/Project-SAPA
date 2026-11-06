import { CoaAccount } from './accountingData';
import { JenisProyekItem } from './types';

export const JENIS_PROYEK_COA_MIN_NUMBER = 10101;
export const JENIS_PROYEK_COA_MAX_NUMBER = 10299;

// System / pre-assigned accounts to avoid collision
export const RESERVED_COA_NUMBERS = new Set(['10205']);

/**
 * Finds the next available COA account number strictly within 10101 - 10299
 */
export function getNextAvailableJenisProyekCoaNumber(
  coaList: CoaAccount[],
  existingJenisProyek: JenisProyekItem[] = []
): string {
  const existingSet = new Set<string>();

  coaList.forEach((c) => existingSet.add(c.noAkun));
  existingJenisProyek.forEach((jp) => {
    if (jp.isCoa && jp.coaCode && jp.coaCode !== '10100 - 10299') {
      existingSet.add(jp.coaCode);
    }
  });
  RESERVED_COA_NUMBERS.forEach((r) => existingSet.add(r));

  for (let num = JENIS_PROYEK_COA_MIN_NUMBER; num <= JENIS_PROYEK_COA_MAX_NUMBER; num++) {
    const candidate = String(num);
    if (!existingSet.has(candidate)) {
      return candidate;
    }
  }

  return String(JENIS_PROYEK_COA_MIN_NUMBER);
}

/**
 * Auto-creates or assigns a dedicated Aktiva COA account (10101 - 10299) for a Jenis Proyek
 */
export function autoCreateCoaForJenisProyek(
  item: JenisProyekItem,
  currentCoaList: CoaAccount[],
  allJenisProyek: JenisProyekItem[] = []
): {
  updatedItem: JenisProyekItem;
  newCoaAccount?: CoaAccount;
  updatedCoaList: CoaAccount[];
} {
  // If COA is unchecked, remove associated COA account if one existed
  if (!item.isCoa) {
    let updatedCoaList = currentCoaList;
    if (item.coaCode && item.coaCode !== '10100 - 10299') {
      updatedCoaList = currentCoaList.filter((c) => c.noAkun !== item.coaCode);
    }
    return {
      updatedItem: {
        ...item,
        isCoa: false,
        coaCode: undefined,
        coaName: undefined,
      },
      updatedCoaList,
    };
  }

  // If COA is checked:
  const itemTitle = (item.jenisKegiatan || 'Jenis Proyek').trim();
  const accountName = item.coaName?.trim() || itemTitle;

  // Determine target account number
  let targetNoAkun = item.coaCode;
  const numVal = targetNoAkun ? parseInt(targetNoAkun, 10) : NaN;
  const isValidNum =
    !isNaN(numVal) &&
    numVal >= JENIS_PROYEK_COA_MIN_NUMBER &&
    numVal <= JENIS_PROYEK_COA_MAX_NUMBER &&
    !RESERVED_COA_NUMBERS.has(targetNoAkun!);

  if (!isValidNum || targetNoAkun === '10100 - 10299') {
    targetNoAkun = getNextAvailableJenisProyekCoaNumber(
      currentCoaList,
      allJenisProyek.filter((jp) => jp.id !== item.id)
    );
  }

  const existingInCoa = currentCoaList.find((c) => c.noAkun === targetNoAkun);

  if (existingInCoa) {
    let updatedCoaList = currentCoaList;
    if (existingInCoa.namaAkun !== accountName) {
      updatedCoaList = currentCoaList.map((c) =>
        c.noAkun === targetNoAkun ? { ...c, namaAkun: accountName } : c
      );
    }
    return {
      updatedItem: {
        ...item,
        isCoa: true,
        coaCode: targetNoAkun,
        coaName: accountName,
      },
      newCoaAccount: { ...existingInCoa, namaAkun: accountName },
      updatedCoaList,
    };
  }

  // Create new Aktiva COA account
  const newAccount: CoaAccount = {
    noAkun: targetNoAkun,
    namaAkun: accountName,
    pos: 'D',
    kelompok: 'AKTIVA',
    isHeader: false,
    saldoAwalDebet: 0,
    saldoAwalKredit: 0,
  };

  const updatedCoaList = [...currentCoaList, newAccount].sort((a, b) =>
    a.noAkun.localeCompare(b.noAkun)
  );

  return {
    updatedItem: {
      ...item,
      isCoa: true,
      coaCode: targetNoAkun,
      coaName: accountName,
    },
    newCoaAccount: newAccount,
    updatedCoaList,
  };
}

/**
 * Auto-deletes the associated COA account when a Jenis Proyek is deleted
 */
export function autoDeleteCoaForJenisProyek(
  deletedItemId: string,
  allJenisProyek: JenisProyekItem[],
  currentCoaList: CoaAccount[]
): {
  deletedCoaAccount?: CoaAccount;
  updatedCoaList: CoaAccount[];
} {
  const itemToDelete = allJenisProyek.find((jp) => jp.id === deletedItemId);
  if (!itemToDelete) {
    return { updatedCoaList: currentCoaList };
  }

  let targetNoAkun = itemToDelete.coaCode;
  let accountToDelete = targetNoAkun
    ? currentCoaList.find((c) => c.noAkun === targetNoAkun)
    : null;

  // Fallback match by name if within 10101 - 10299
  if (!accountToDelete && itemToDelete.isCoa) {
    const titleLower = itemToDelete.jenisKegiatan.toLowerCase().trim();
    accountToDelete =
      currentCoaList.find((c) => {
        const num = parseInt(c.noAkun, 10);
        if (
          isNaN(num) ||
          num < JENIS_PROYEK_COA_MIN_NUMBER ||
          num > JENIS_PROYEK_COA_MAX_NUMBER ||
          RESERVED_COA_NUMBERS.has(c.noAkun)
        ) {
          return false;
        }
        return c.namaAkun.toLowerCase().trim() === titleLower;
      }) || null;

    if (accountToDelete) {
      targetNoAkun = accountToDelete.noAkun;
    }
  }

  if (accountToDelete && !accountToDelete.isHeader) {
    const updatedCoaList = currentCoaList.filter((c) => c.noAkun !== targetNoAkun);
    return {
      deletedCoaAccount: accountToDelete,
      updatedCoaList,
    };
  }

  return { updatedCoaList: currentCoaList };
}

/**
 * Synchronize all Jenis Proyek with COA accounts:
 * - Items with isCoa=true ensure they have dedicated COA accounts starting from 10101
 * - Auto-migrates legacy placeholder "10100 - 10299"
 */
export function syncAllJenisProyekWithCoa(
  items: JenisProyekItem[],
  currentCoaList: CoaAccount[]
): {
  syncedItems: JenisProyekItem[];
  syncedCoaList: CoaAccount[];
  addedCount: number;
} {
  let updatedCoaList = [...currentCoaList];
  let addedCount = 0;

  // Standard preset map for well-known initial items
  const presetMap: Record<string, { code: string; name: string }> = {
    'donasi buku berbayar': { code: '10101', name: 'Donasi Buku Berbayar' },
    'patron non-rutin': { code: '10102', name: 'Patron Non-Rutin' },
    'patron rutin': { code: '10103', name: 'Patron Rutin' },
    'donasi': { code: '10104', name: 'Donasi' },
  };

  const syncedItems: JenisProyekItem[] = items.map((item) => {
    if (!item.isCoa) {
      return item;
    }

    const key = (item.jenisKegiatan || '').toLowerCase().trim();
    let targetCode = item.coaCode;
    let targetName = item.coaName || item.jenisKegiatan;

    if (presetMap[key] && (!targetCode || targetCode === '10100 - 10299')) {
      targetCode = presetMap[key].code;
      targetName = presetMap[key].name;
    }

    if (!targetCode || targetCode === '10100 - 10299') {
      targetCode = getNextAvailableJenisProyekCoaNumber(updatedCoaList, items);
      targetName = item.jenisKegiatan;
    }

    const exists = updatedCoaList.find((c) => c.noAkun === targetCode);
    if (!exists) {
      const newAcc: CoaAccount = {
        noAkun: targetCode,
        namaAkun: targetName,
        pos: 'D',
        kelompok: 'AKTIVA',
        isHeader: false,
        saldoAwalDebet: 0,
        saldoAwalKredit: 0,
      };
      updatedCoaList.push(newAcc);
      addedCount++;
    } else if (exists.namaAkun !== targetName) {
      exists.namaAkun = targetName;
    }

    return {
      ...item,
      isCoa: true,
      coaCode: targetCode,
      coaName: targetName,
    };
  });

  updatedCoaList.sort((a, b) => a.noAkun.localeCompare(b.noAkun));

  return {
    syncedItems,
    syncedCoaList: updatedCoaList,
    addedCount,
  };
}
