import { CoaAccount } from './accountingData';
import { SalurProduct } from './salurData';

export const SALUR_COA_MIN_NUMBER = 40002;
export const SALUR_COA_MAX_NUMBER = 49990;
export const COA_PENDAPATAN_LAIN_LAIN = '49999';
export const COA_PENDAPATAN_LAIN_LAIN_NAMA = 'Pendapatan Lain-Lain';
export const COA_PENDAPATAN_DANA_DHARMA_PATRON = '49997';
export const COA_PENDAPATAN_DANA_DHARMA_PATRON_NAMA = 'Pendapatan Dana Dharma Patron';
export const COA_PENDAPATAN_DONASI = '49998';
export const COA_PENDAPATAN_DONASI_NAMA = 'Pendapatan Donasi';
export const COA_BIAYA_PENGIRIMAN = '60600';
export const COA_BIAYA_PENGIRIMAN_NAMA = 'Biaya Pengiriman';

/**
 * Checks if a product/item in S-SALUR is an unpaid book (Buku Tidak Berbayar)
 */
export function isBukuTidakBerbayarSalur(item: Partial<SalurProduct>): boolean {
  if (!item) return false;
  const subLower = (item.subtitle || '').toLowerCase();
  const subJenisLower = (item.subJenis || '').toLowerCase();
  if (subLower.includes('tidak berbayar') || subJenisLower.includes('tidak berbayar')) {
    return true;
  }
  return item.price !== undefined && item.price <= 0;
}

/**
 * Checks if a product/item in S-SALUR is a paid book published by YPPLN (Buku Berbayar)
 */
export function isBukuBerbayarSalur(item: Partial<SalurProduct>): boolean {
  if (!item) return false;
  // If price is 0 or less, it's not a paid book
  if (item.price !== undefined && item.price <= 0) return false;
  if (isBukuTidakBerbayarSalur(item)) return false;

  const subLower = (item.subtitle || '').toLowerCase();
  const subJenisLower = (item.subJenis || '').toLowerCase();

  // Non-buku items (Buku Non-YPPLN, T-Shirt, Note Book, Lain-lain Non-YPPLN, etc.)
  if (
    subJenisLower.includes('non-yppln') ||
    subJenisLower.includes('t-shirt') ||
    subJenisLower.includes('note book') ||
    subLower.includes('non-yppln') ||
    subLower.includes('merchandise') ||
    subLower.includes('t-shirt') ||
    subLower.includes('note book')
  ) {
    return false;
  }

  // If subJenis or subtitle is explicitly Buku Berbayar
  if (
    subJenisLower === 'buku berbayar' ||
    subLower.includes('buku berbayar') ||
    subJenisLower.includes('berbayar')
  ) {
    return true;
  }

  // If no explicit subJenis but is categorized as buku and not merchandise
  if (!item.subJenis && (item.price || 0) > 0) {
    return true;
  }

  return false;
}

/**
 * Checks if an item is a non-book item in S-SALUR (besides buku berbayar & buku tidak berbayar)
 */
export function isNonBukuItemSalur(item: Partial<SalurProduct>): boolean {
  return !isBukuBerbayarSalur(item) && !isBukuTidakBerbayarSalur(item);
}

/**
 * Finds the next available COA account number strictly within 40002 - 49990
 */
export function getNextAvailableSalurCoaNumber(coaList: CoaAccount[]): string {
  const existingSet = new Set(coaList.map((c) => c.noAkun));
  for (let num = SALUR_COA_MIN_NUMBER; num <= SALUR_COA_MAX_NUMBER; num++) {
    const candidate = String(num);
    if (!existingSet.has(candidate)) {
      return candidate;
    }
  }
  return String(SALUR_COA_MIN_NUMBER);
}

/**
 * Format standard account name for a paid Salur book
 */
export function formatSalurCoaAccountName(title: string): string {
  const cleanTitle = (title || 'Buku S-SALUR').trim();
  return `Pendapatan Salur - ${cleanTitle}`;
}

/**
 * Auto-creates or assigns a COA account for an item S-SALUR:
 * - Buku Berbayar -> COA 40002-49990 (Pendapatan Salur - [Title])
 * - Non-buku items (selain buku berbayar & buku tidak berbayar) -> COA 49999 (Pendapatan Lain-Lain)
 * - Buku Tidak Berbayar -> No COA
 */
export function autoCreateCoaForSalurItem(
  item: SalurProduct,
  currentCoaList: CoaAccount[]
): {
  updatedItem: SalurProduct;
  newCoaAccount?: CoaAccount;
  updatedCoaList: CoaAccount[];
} {
  // 1. Buku Tidak Berbayar: No COA
  if (isBukuTidakBerbayarSalur(item)) {
    return {
      updatedItem: { ...item, coaNoAkun: undefined, coaNamaAkun: undefined },
      updatedCoaList: currentCoaList,
    };
  }

  // 2. Non-Buku items (Buku Non-YPPLN, T-Shirt, Note Book, Lain-lain, etc.): COA 49999
  if (isNonBukuItemSalur(item)) {
    const existing49999 = currentCoaList.find((c) => c.noAkun === COA_PENDAPATAN_LAIN_LAIN);
    let updatedCoaList = currentCoaList;
    let newCoaAccount: CoaAccount | undefined = undefined;

    if (!existing49999) {
      newCoaAccount = {
        noAkun: COA_PENDAPATAN_LAIN_LAIN,
        namaAkun: COA_PENDAPATAN_LAIN_LAIN_NAMA,
        pos: 'K',
        kelompok: 'PENDAPATAN',
        isHeader: false,
        saldoAwalDebet: 0,
        saldoAwalKredit: 0,
      };
      updatedCoaList = [...currentCoaList, newCoaAccount].sort((a, b) => a.noAkun.localeCompare(b.noAkun));
    }

    return {
      updatedItem: {
        ...item,
        coaNoAkun: COA_PENDAPATAN_LAIN_LAIN,
        coaNamaAkun: COA_PENDAPATAN_LAIN_LAIN_NAMA,
      },
      newCoaAccount,
      updatedCoaList,
    };
  }

  // 3. Buku Berbayar: Allocate within 40002 - 49990
  let targetNoAkun = item.coaNoAkun;
  const existingInCoa = targetNoAkun ? currentCoaList.find((c) => c.noAkun === targetNoAkun) : null;

  if (existingInCoa) {
    const expectedName = formatSalurCoaAccountName(item.title);
    if (existingInCoa.namaAkun !== expectedName) {
      const updatedCoaList = currentCoaList.map((c) =>
        c.noAkun === targetNoAkun ? { ...c, namaAkun: expectedName } : c
      );
      return {
        updatedItem: { ...item, coaNoAkun: targetNoAkun, coaNamaAkun: expectedName },
        newCoaAccount: { ...existingInCoa, namaAkun: expectedName },
        updatedCoaList,
      };
    }
    return {
      updatedItem: { ...item, coaNoAkun: targetNoAkun, coaNamaAkun: existingInCoa.namaAkun },
      updatedCoaList: currentCoaList,
    };
  }

  // Allocate next available number between 40002 and 49990
  const allocatedNo = getNextAvailableSalurCoaNumber(currentCoaList);
  const accountName = formatSalurCoaAccountName(item.title);

  const newAccount: CoaAccount = {
    noAkun: allocatedNo,
    namaAkun: accountName,
    pos: 'K',
    kelompok: 'PENDAPATAN',
    isHeader: false,
    saldoAwalDebet: 0,
    saldoAwalKredit: 0,
  };

  const updatedCoaList = [...currentCoaList, newAccount].sort((a, b) => a.noAkun.localeCompare(b.noAkun));
  const updatedItem: SalurProduct = {
    ...item,
    coaNoAkun: allocatedNo,
    coaNamaAkun: accountName,
  };

  return {
    updatedItem,
    newCoaAccount: newAccount,
    updatedCoaList,
  };
}

/**
 * Auto-deletes the associated COA account when an item S-SALUR is deleted
 * (Only deletes book accounts in 40002-49990, does not delete shared 49999)
 */
export function autoDeleteCoaForSalurItem(
  deletedItemId: string,
  allSalurItems: SalurProduct[],
  currentCoaList: CoaAccount[]
): {
  deletedCoaAccount?: CoaAccount;
  updatedCoaList: CoaAccount[];
} {
  const itemToDelete = allSalurItems.find((it) => it.id === deletedItemId);

  let targetNoAkun = itemToDelete?.coaNoAkun;
  // Shared account 49999 should NOT be deleted
  if (targetNoAkun === COA_PENDAPATAN_LAIN_LAIN) {
    return { updatedCoaList: currentCoaList };
  }

  let accountToDelete = targetNoAkun ? currentCoaList.find((c) => c.noAkun === targetNoAkun) : null;

  // Fallback: match by title if not found by coaNoAkun
  if (!accountToDelete && itemToDelete) {
    const expectedName = formatSalurCoaAccountName(itemToDelete.title).toLowerCase();
    const itemTitleLower = itemToDelete.title.toLowerCase().trim();
    accountToDelete = currentCoaList.find((c) => {
      const num = parseInt(c.noAkun, 10);
      if (isNaN(num) || num < SALUR_COA_MIN_NUMBER || num > SALUR_COA_MAX_NUMBER) return false;
      const cName = c.namaAkun.toLowerCase();
      return cName === expectedName || cName.includes(itemTitleLower);
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
 * Synchronize all existing Salur products with COA accounts:
 * - Paid books: distinct account in 40002-49990
 * - Non-book items (Buku Non-YPPLN, T-Shirt, Note Book, etc.): COA 49999 "Pendapatan Lain-Lain"
 * - Free books: no COA
 */
export function syncAllSalurItemsWithCoa(
  salurItems: SalurProduct[],
  currentCoaList: CoaAccount[]
): {
  syncedItems: SalurProduct[];
  syncedCoaList: CoaAccount[];
  addedAccountsCount: number;
} {
  let coaList = [...currentCoaList];
  let addedAccountsCount = 0;

  // Ensure 49999 exists in COA
  if (!coaList.some((c) => c.noAkun === COA_PENDAPATAN_LAIN_LAIN)) {
    coaList.push({
      noAkun: COA_PENDAPATAN_LAIN_LAIN,
      namaAkun: COA_PENDAPATAN_LAIN_LAIN_NAMA,
      pos: 'K',
      kelompok: 'PENDAPATAN',
      isHeader: false,
      saldoAwalDebet: 0,
      saldoAwalKredit: 0,
    });
    addedAccountsCount++;
  }

  const syncedItems = salurItems.map((item) => {
    // 1. Buku Tidak Berbayar -> No COA
    if (isBukuTidakBerbayarSalur(item)) {
      return {
        ...item,
        coaNoAkun: undefined,
        coaNamaAkun: undefined,
      };
    }

    // 2. Non-book items -> COA 49999 Pendapatan Lain-Lain
    if (isNonBukuItemSalur(item)) {
      return {
        ...item,
        coaNoAkun: COA_PENDAPATAN_LAIN_LAIN,
        coaNamaAkun: COA_PENDAPATAN_LAIN_LAIN_NAMA,
      };
    }

    // 3. Paid books (Buku Berbayar) -> COA 40002 - 49990
    let existingAcc = item.coaNoAkun ? coaList.find((c) => c.noAkun === item.coaNoAkun) : null;

    if (!existingAcc) {
      const expectedName = formatSalurCoaAccountName(item.title);
      existingAcc = coaList.find((c) => {
        const n = parseInt(c.noAkun, 10);
        return (
          !isNaN(n) &&
          n >= SALUR_COA_MIN_NUMBER &&
          n <= SALUR_COA_MAX_NUMBER &&
          (c.namaAkun.toLowerCase() === expectedName.toLowerCase() ||
           c.namaAkun.toLowerCase().includes(item.title.toLowerCase().trim()))
        );
      });
    }

    if (existingAcc) {
      return {
        ...item,
        coaNoAkun: existingAcc.noAkun,
        coaNamaAkun: existingAcc.namaAkun,
      };
    }

    // Otherwise, allocate a new COA account for this paid book
    const allocatedNo = getNextAvailableSalurCoaNumber(coaList);
    const accountName = formatSalurCoaAccountName(item.title);
    const newAcc: CoaAccount = {
      noAkun: allocatedNo,
      namaAkun: accountName,
      pos: 'K',
      kelompok: 'PENDAPATAN',
      isHeader: false,
      saldoAwalDebet: 0,
      saldoAwalKredit: 0,
    };

    coaList.push(newAcc);
    addedAccountsCount++;

    return {
      ...item,
      coaNoAkun: allocatedNo,
      coaNamaAkun: accountName,
    };
  });

  coaList.sort((a, b) => a.noAkun.localeCompare(b.noAkun));

  return {
    syncedItems,
    syncedCoaList: coaList,
    addedAccountsCount,
  };
}

