import { CoaAccount } from './accountingData';
import { KebutuhanPengeluaranItem } from './kebutuhanPengeluaranData';
import { KelompokBiayaCoaItem } from './kelompokBiayaCoaData';

/**
 * Parses range string such as "60100-60199", "60100 - 60199", or "60100"
 */
export function parseCoaRange(rangeStr?: string): { start: number; end: number } | null {
  if (!rangeStr || !rangeStr.trim()) return null;
  const cleaned = rangeStr.replace(/\s+/g, '');
  const parts = cleaned.split('-');
  if (parts.length === 1) {
    const num = parseInt(parts[0], 10);
    return isNaN(num) ? null : { start: num, end: num };
  }
  const start = parseInt(parts[0], 10);
  const end = parseInt(parts[1], 10);
  if (isNaN(start) || isNaN(end) || start > end) return null;
  return { start, end };
}

/**
 * Determines the proper COA group/kelompok based on the account number
 */
export function determineKelompokForCoa(
  noAkun: string
): 'AKTIVA' | 'KEWAJIBAN' | 'EKUITAS' | 'PENDAPATAN' | 'BIAYA PROGRAM' | 'BIAYA OPERASIONAL' {
  const trimmed = (noAkun || '').trim();
  if (trimmed.startsWith('5')) return 'BIAYA PROGRAM';
  if (trimmed.startsWith('6')) return 'BIAYA OPERASIONAL';
  if (trimmed.startsWith('1')) return 'AKTIVA';
  if (trimmed.startsWith('2')) return 'KEWAJIBAN';
  if (trimmed.startsWith('3')) return 'EKUITAS';
  if (trimmed.startsWith('4')) return 'PENDAPATAN';
  return 'BIAYA OPERASIONAL';
}

/**
 * Finds the next available COA account number strictly within the range of the assigned Kelompok Biaya
 */
export function getNextAvailableKebutuhanCoaNumber(
  rangeStr: string,
  coaList: CoaAccount[] = [],
  existingKebutuhan: KebutuhanPengeluaranItem[] = [],
  excludeKebutuhanId?: string
): string {
  const parsed = parseCoaRange(rangeStr);
  if (!parsed) {
    return '60100';
  }

  const { start, end } = parsed;
  const takenSet = new Set<string>();

  // Accounts in COA list (skip headers like 50000, 60000)
  coaList.forEach((c) => {
    if (!c.isHeader) {
      takenSet.add(c.noAkun);
    }
  });

  // Accounts reserved in other Kebutuhan Pengeluaran
  existingKebutuhan.forEach((keb) => {
    if (keb.id !== excludeKebutuhanId && keb.noAkunCoa) {
      takenSet.add(keb.noAkunCoa);
    }
  });

  // Search sequentially starting from the lowest number in the range
  for (let num = start; num <= end; num++) {
    const candidate = String(num);
    if (!takenSet.has(candidate)) {
      return candidate;
    }
  }

  // Fallback to start
  return String(start);
}

/**
 * Auto-creates or assigns a dedicated COA account for a Kebutuhan Pengeluaran
 */
export function autoCreateCoaForKebutuhan(
  item: KebutuhanPengeluaranItem,
  kelompokList: KelompokBiayaCoaItem[],
  currentCoaList: CoaAccount[],
  allKebutuhan: KebutuhanPengeluaranItem[] = []
): {
  updatedItem: KebutuhanPengeluaranItem;
  newCoaAccount: CoaAccount;
  updatedCoaList: CoaAccount[];
} {
  // Find matching Kelompok Biaya
  const matchedKelompok = kelompokList.find(
    (k) => k.kelompokBiaya.toLowerCase().trim() === item.kelompokBiaya.toLowerCase().trim()
  );
  const rangeCoa = matchedKelompok?.rangeCoa || item.rangeCoa || '60100-60199';
  const parsedRange = parseCoaRange(rangeCoa);

  // Check if item already has a valid noAkunCoa within the target range
  let targetNoAkun = item.noAkunCoa?.trim();
  const currentNum = targetNoAkun ? parseInt(targetNoAkun, 10) : NaN;
  const isWithinRange =
    parsedRange && !isNaN(currentNum) && currentNum >= parsedRange.start && currentNum <= parsedRange.end;

  // Check if another kebutuhan is already using this noAkunCoa
  const isDuplicate =
    targetNoAkun &&
    allKebutuhan.some((k) => k.id !== item.id && k.noAkunCoa === targetNoAkun);

  let updatedCoaList = [...currentCoaList];

  // If number is missing, out of range, or conflicted, generate a new one
  if (!targetNoAkun || !isWithinRange || isDuplicate) {
    // If old account exists and is not shared, we can remove it
    if (item.noAkunCoa && item.noAkunCoa !== targetNoAkun) {
      updatedCoaList = updatedCoaList.filter((c) => c.noAkun !== item.noAkunCoa);
    }
    targetNoAkun = getNextAvailableKebutuhanCoaNumber(
      rangeCoa,
      updatedCoaList,
      allKebutuhan,
      item.id
    );
  }

  const accountName = (item.namaAkunCoa?.trim() || item.kebutuhan.trim()) || 'Biaya Pengeluaran';
  const targetKelompok = determineKelompokForCoa(targetNoAkun);

  // Check if account already exists in COA list
  const existingInCoaIndex = updatedCoaList.findIndex((c) => c.noAkun === targetNoAkun);

  let newCoaAccount: CoaAccount;

  if (existingInCoaIndex >= 0) {
    newCoaAccount = {
      ...updatedCoaList[existingInCoaIndex],
      namaAkun: accountName,
      kelompok: targetKelompok,
    };
    updatedCoaList[existingInCoaIndex] = newCoaAccount;
  } else {
    newCoaAccount = {
      noAkun: targetNoAkun,
      namaAkun: accountName,
      pos: 'D',
      kelompok: targetKelompok,
      isHeader: false,
      saldoAwalDebet: 0,
      saldoAwalKredit: 0,
    };
    updatedCoaList.push(newCoaAccount);
  }

  // Keep COA list sorted by noAkun
  updatedCoaList.sort((a, b) => a.noAkun.localeCompare(b.noAkun));

  const updatedItem: KebutuhanPengeluaranItem = {
    ...item,
    rangeCoa,
    noAkunCoa: targetNoAkun,
    namaAkunCoa: accountName,
  };

  return {
    updatedItem,
    newCoaAccount,
    updatedCoaList,
  };
}

/**
 * Auto-deletes the associated COA account when a Kebutuhan Pengeluaran is deleted
 */
export function autoDeleteCoaForKebutuhan(
  deletedItemId: string,
  allKebutuhan: KebutuhanPengeluaranItem[],
  currentCoaList: CoaAccount[]
): {
  deletedCoaAccount?: CoaAccount;
  updatedCoaList: CoaAccount[];
} {
  const itemToDelete = allKebutuhan.find((k) => k.id === deletedItemId);
  if (!itemToDelete) {
    return { updatedCoaList: currentCoaList };
  }

  const targetNoAkun = itemToDelete.noAkunCoa;
  if (!targetNoAkun) {
    return { updatedCoaList: currentCoaList };
  }

  const accountToDelete = currentCoaList.find(
    (c) => c.noAkun === targetNoAkun && !c.isHeader
  );

  if (accountToDelete) {
    const updatedCoaList = currentCoaList.filter((c) => c.noAkun !== targetNoAkun);
    return {
      deletedCoaAccount: accountToDelete,
      updatedCoaList,
    };
  }

  return { updatedCoaList: currentCoaList };
}

/**
 * When a Kelompok Biaya range or name changes, update all linked Kebutuhan Pengeluaran
 * and their corresponding COA accounts.
 */
export function relinkKebutuhanCoaOnKelompokChange(
  updatedKelompok: KelompokBiayaCoaItem,
  allKelompok: KelompokBiayaCoaItem[],
  allKebutuhan: KebutuhanPengeluaranItem[],
  currentCoaList: CoaAccount[],
  oldKelompok?: KelompokBiayaCoaItem
): {
  updatedKebutuhanList: KebutuhanPengeluaranItem[];
  updatedCoaList: CoaAccount[];
  changedCount: number;
} {
  const oldName = (oldKelompok?.kelompokBiaya || updatedKelompok.kelompokBiaya).toLowerCase().trim();
  const newName = updatedKelompok.kelompokBiaya.trim();
  const newRange = updatedKelompok.rangeCoa.trim();
  const parsedNewRange = parseCoaRange(newRange);

  let coaListWork = [...currentCoaList];
  let changedCount = 0;

  // Identify affected Kebutuhan items
  const affectedKebutuhan = allKebutuhan.filter(
    (k) => k.kelompokBiaya.toLowerCase().trim() === oldName
  );

  if (affectedKebutuhan.length === 0) {
    return {
      updatedKebutuhanList: allKebutuhan,
      updatedCoaList: currentCoaList,
      changedCount: 0,
    };
  }

  // Remove old COA accounts of affected items
  const oldAccountNumbers = new Set(
    affectedKebutuhan.map((k) => k.noAkunCoa).filter(Boolean) as string[]
  );
  coaListWork = coaListWork.filter((c) => !oldAccountNumbers.has(c.noAkun));

  // Map to store new item assignments
  const newAssignments = new Map<string, KebutuhanPengeluaranItem>();

  let nextCandidate = parsedNewRange ? parsedNewRange.start : 60100;

  affectedKebutuhan.forEach((item) => {
    // Pick next free number
    let targetNum = nextCandidate;
    if (parsedNewRange) {
      while (
        targetNum <= parsedNewRange.end &&
        coaListWork.some((c) => c.noAkun === String(targetNum))
      ) {
        targetNum++;
      }
    }
    const targetNoAkun = String(targetNum);
    nextCandidate = targetNum + 1;

    const accountName = item.namaAkunCoa || item.kebutuhan;
    const targetKelompok = determineKelompokForCoa(targetNoAkun);

    // Create new COA account
    const newAccount: CoaAccount = {
      noAkun: targetNoAkun,
      namaAkun: accountName,
      pos: 'D',
      kelompok: targetKelompok,
      isHeader: false,
      saldoAwalDebet: 0,
      saldoAwalKredit: 0,
    };
    coaListWork.push(newAccount);

    const updatedItem: KebutuhanPengeluaranItem = {
      ...item,
      kelompokBiaya: newName,
      rangeCoa: newRange,
      noAkunCoa: targetNoAkun,
      namaAkunCoa: accountName,
    };
    newAssignments.set(item.id, updatedItem);
    changedCount++;
  });

  const updatedKebutuhanList = allKebutuhan.map(
    (k) => newAssignments.get(k.id) || k
  );

  coaListWork.sort((a, b) => a.noAkun.localeCompare(b.noAkun));

  return {
    updatedKebutuhanList,
    updatedCoaList: coaListWork,
    changedCount,
  };
}

/**
 * Synchronizes all Kebutuhan Pengeluaran with the Master COA list:
 * - Ensures each item has `noAkunCoa` and `namaAkunCoa` strictly corresponding to its `kelompokBiaya` range
 * - Registers missing COA accounts into `coaList`
 */
export function syncAllKebutuhanPengeluaranWithCoa(
  kebutuhanList: KebutuhanPengeluaranItem[],
  kelompokList: KelompokBiayaCoaItem[],
  currentCoaList: CoaAccount[]
): {
  syncedKebutuhanList: KebutuhanPengeluaranItem[];
  syncedCoaList: CoaAccount[];
  addedCount: number;
} {
  let updatedCoaList = [...currentCoaList];
  let addedCount = 0;

  // Preset predefined accounts matching user requirements
  // Example: Gaji -> 60100, Air PDAM & Internet -> 60200
  const presetMap: Record<string, { code: string; name: string }> = {
    'gaji': { code: '60100', name: 'Gaji' },
    'operasional kantor': { code: '60101', name: 'Operasional Kantor' },
    'air pdam & internet': { code: '60200', name: 'Air PDAM & Internet' },
    'biaya boost iklan': { code: '60500', name: 'Biaya Boost Iklan' },
    'perlengkapan pengiriman buku berbayar': { code: '60700', name: 'Perlengkapan Pengiriman Buku Berbayar' },
    'cetak buku dharma': { code: '50100', name: 'Cetak Buku Dharma' },
    'biaya event & retret': { code: '50300', name: 'Biaya Event & Retret' },
    'ekspedisi & distribusi': { code: '60600', name: 'Ekspedisi & Distribusi' },
  };

  const syncedKebutuhanList = kebutuhanList.map((item) => {
    const key = (item.kebutuhan || '').toLowerCase().trim();
    const matchedKelompok = kelompokList.find(
      (k) => k.kelompokBiaya.toLowerCase().trim() === item.kelompokBiaya.toLowerCase().trim()
    );
    const range = matchedKelompok?.rangeCoa || item.rangeCoa || '60100-60199';
    const parsedRange = parseCoaRange(range);

    let targetCode = item.noAkunCoa?.trim();
    let targetName = item.namaAkunCoa?.trim() || item.kebutuhan.trim();

    // Check if preset applies
    if (presetMap[key] && (!targetCode || targetCode === '')) {
      targetCode = presetMap[key].code;
      targetName = presetMap[key].name;
    }

    // Validate if current targetCode is within range
    const num = targetCode ? parseInt(targetCode, 10) : NaN;
    const isValid = parsedRange && !isNaN(num) && num >= parsedRange.start && num <= parsedRange.end;

    if (!targetCode || !isValid) {
      targetCode = getNextAvailableKebutuhanCoaNumber(
        range,
        updatedCoaList,
        kebutuhanList,
        item.id
      );
    }

    // Check if this account already exists in COA
    const exists = updatedCoaList.find((c) => c.noAkun === targetCode);
    if (!exists) {
      const newAcc: CoaAccount = {
        noAkun: targetCode,
        namaAkun: targetName,
        pos: 'D',
        kelompok: determineKelompokForCoa(targetCode),
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
      kelompokBiaya: matchedKelompok?.kelompokBiaya || item.kelompokBiaya,
      rangeCoa: range,
      noAkunCoa: targetCode,
      namaAkunCoa: targetName,
    };
  });

  updatedCoaList.sort((a, b) => a.noAkun.localeCompare(b.noAkun));

  return {
    syncedKebutuhanList,
    syncedCoaList: updatedCoaList,
    addedCount,
  };
}
