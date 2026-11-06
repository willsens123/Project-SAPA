import { SalurProduct, getStoredSalurProducts } from './salurData';

export interface ContainerItemAllocation {
  id: string;
  namaContainer: string; // e.g. "Container A", "Container B", "Container BDK - 01"
  lokasiGudang: string; // e.g. "Rumah Tsa-Tsa", "Kantor Bandung"
  jenisLokasi: string; // e.g. "Gudang YPPLN"
  stok: number; // e.g. 5, 5, 50, 40
  keterangan: string; // e.g. "-"
  tanggal?: string;
}

export interface StokSalurItem {
  id: string;
  productId: string;
  namaItem: string;
  subtitle: string;
  subJenis?: string;
  tanggal?: string;
  stok: number;
  jumlahLokasi: number;
  jumlahContainer: number;
  keterangan: string;
  coverKey?: 'demi-kepentingan' | 'menjadi-buddha' | 'jalan-menuju' | 'lakon-hidup' | 'intisari-amerta' | 'leaders-way';
  containers: ContainerItemAllocation[];
}

export const STOK_SALUR_STORAGE_KEY = 'yppln_stok_item_salur_data';

export const INITIAL_STOK_SALUR_ITEMS: StokSalurItem[] = [
  {
    id: 'stok-salur-1',
    productId: 'book-2',
    namaItem: 'Demi Kepentingan Semua Makhluk',
    subtitle: 'Buku Berbayar, BSM - 2021',
    subJenis: 'Buku Berbayar',
    tanggal: '15 Nov 2021',
    stok: 100,
    jumlahLokasi: 2,
    jumlahContainer: 4,
    keterangan: '-',
    coverKey: 'demi-kepentingan',
    containers: [
      {
        id: 'cont-1',
        namaContainer: 'Container A',
        lokasiGudang: 'Rumah Tsa-Tsa',
        jenisLokasi: 'Gudang YPPLN',
        stok: 5,
        keterangan: '-',
        tanggal: '15 Nov 2021',
      },
      {
        id: 'cont-2',
        namaContainer: 'Container B',
        lokasiGudang: 'Rumah Tsa-Tsa',
        jenisLokasi: 'Gudang YPPLN',
        stok: 5,
        keterangan: '-',
        tanggal: '15 Nov 2021',
      },
      {
        id: 'cont-3',
        namaContainer: 'Container BDK - 01',
        lokasiGudang: 'Kantor Bandung',
        jenisLokasi: 'Gudang YPPLN',
        stok: 50,
        keterangan: '-',
        tanggal: '15 Nov 2021',
      },
      {
        id: 'cont-4',
        namaContainer: 'Container BDK - 02',
        lokasiGudang: 'Kantor Bandung',
        jenisLokasi: 'Gudang YPPLN',
        stok: 40,
        keterangan: '-',
        tanggal: '15 Nov 2021',
      },
    ],
  },
  {
    id: 'stok-salur-2',
    productId: 'book-2-dup',
    namaItem: 'Demi Kepentingan Semua Makhluk',
    subtitle: 'Buku Berbayar, BSM - 2021',
    stok: 100,
    jumlahLokasi: 2,
    jumlahContainer: 4,
    keterangan: '-',
    coverKey: 'demi-kepentingan',
    containers: [
      {
        id: 'cont-2-1',
        namaContainer: 'Container A',
        lokasiGudang: 'Rumah Tsa-Tsa',
        jenisLokasi: 'Gudang YPPLN',
        stok: 5,
        keterangan: '-',
      },
      {
        id: 'cont-2-2',
        namaContainer: 'Container B',
        lokasiGudang: 'Rumah Tsa-Tsa',
        jenisLokasi: 'Gudang YPPLN',
        stok: 5,
        keterangan: '-',
      },
      {
        id: 'cont-2-3',
        namaContainer: 'Container BDK - 01',
        lokasiGudang: 'Kantor Bandung',
        jenisLokasi: 'Gudang YPPLN',
        stok: 50,
        keterangan: '-',
      },
      {
        id: 'cont-2-4',
        namaContainer: 'Container BDK - 02',
        lokasiGudang: 'Kantor Bandung',
        jenisLokasi: 'Gudang YPPLN',
        stok: 40,
        keterangan: '-',
      },
    ],
  },
  {
    id: 'stok-salur-3',
    productId: 'book-1',
    namaItem: 'Jalan Menuju Kemahatahuan',
    subtitle: 'Buku Berbayar, BJM - 2021',
    stok: 100,
    jumlahLokasi: 1,
    jumlahContainer: 3,
    keterangan: '-',
    coverKey: 'jalan-menuju',
    containers: [
      {
        id: 'cont-3-1',
        namaContainer: 'Container C',
        lokasiGudang: 'Rumah Tsa-Tsa',
        jenisLokasi: 'Gudang YPPLN',
        stok: 30,
        keterangan: '-',
      },
      {
        id: 'cont-3-2',
        namaContainer: 'Container D',
        lokasiGudang: 'Rumah Tsa-Tsa',
        jenisLokasi: 'Gudang YPPLN',
        stok: 40,
        keterangan: '-',
      },
      {
        id: 'cont-3-3',
        namaContainer: 'Container E',
        lokasiGudang: 'Rumah Tsa-Tsa',
        jenisLokasi: 'Gudang YPPLN',
        stok: 30,
        keterangan: '-',
      },
    ],
  },
  {
    id: 'stok-salur-4',
    productId: 'book-3',
    namaItem: 'Menjadi Buddha di Tempat Kerja',
    subtitle: 'Buku Berbayar, BMB - 2021',
    stok: 100,
    jumlahLokasi: 1,
    jumlahContainer: 2,
    keterangan: '-',
    coverKey: 'menjadi-buddha',
    containers: [
      {
        id: 'cont-4-1',
        namaContainer: 'Container BDK - 03',
        lokasiGudang: 'Kantor Bandung',
        jenisLokasi: 'Gudang YPPLN',
        stok: 60,
        keterangan: '-',
      },
      {
        id: 'cont-4-2',
        namaContainer: 'Container F',
        lokasiGudang: 'Rumah Tsa-Tsa',
        jenisLokasi: 'Gudang YPPLN',
        stok: 40,
        keterangan: '-',
      },
    ],
  },
  {
    id: 'stok-salur-5',
    productId: 'book-4',
    namaItem: "The Leader's Way",
    subtitle: 'Buku Berbayar, BLW - 2021',
    subJenis: 'Buku Berbayar',
    stok: 85,
    jumlahLokasi: 1,
    jumlahContainer: 1,
    keterangan: '-',
    coverKey: 'leaders-way',
    containers: [
      {
        id: 'cont-5-1',
        namaContainer: 'Container BDK - 04',
        lokasiGudang: 'Kantor Bandung',
        jenisLokasi: 'Gudang YPPLN',
        stok: 85,
        keterangan: '-',
      },
    ],
  },
  {
    id: 'stok-salur-6',
    productId: 'book-5',
    namaItem: 'Dhammapada Bahasa Indonesia',
    subtitle: 'Buku Tidak Berbayar, DBI - 2021',
    subJenis: 'Buku Tidak Berbayar',
    stok: 150,
    jumlahLokasi: 1,
    jumlahContainer: 1,
    keterangan: '-',
    coverKey: 'jalan-menuju',
    containers: [
      {
        id: 'cont-6-1',
        namaContainer: 'Container G',
        lokasiGudang: 'Rumah Tsa-Tsa',
        jenisLokasi: 'Gudang YPPLN',
        stok: 150,
        keterangan: '-',
      },
    ],
  },
  {
    id: 'stok-salur-7',
    productId: 'book-6',
    namaItem: 'Buku Paritta Suci YPPLN',
    subtitle: 'Buku Tidak Berbayar, BPS - 2021',
    subJenis: 'Buku Tidak Berbayar',
    stok: 200,
    jumlahLokasi: 1,
    jumlahContainer: 1,
    keterangan: '-',
    coverKey: 'jalan-menuju',
    containers: [
      {
        id: 'cont-7-1',
        namaContainer: 'Container H',
        lokasiGudang: 'Rumah Tsa-Tsa',
        jenisLokasi: 'Gudang YPPLN',
        stok: 200,
        keterangan: '-',
      },
    ],
  },
  {
    id: 'stok-salur-8',
    productId: 'cs-1',
    namaItem: 'Lakon Hidup Sang Penerang',
    subtitle: 'Buku Berbayar, BLH - 2021',
    subJenis: 'Buku Berbayar',
    stok: 100,
    jumlahLokasi: 1,
    jumlahContainer: 1,
    keterangan: '-',
    coverKey: 'lakon-hidup',
    containers: [
      {
        id: 'cont-8-1',
        namaContainer: 'Container I',
        lokasiGudang: 'Rumah Tsa-Tsa',
        jenisLokasi: 'Gudang YPPLN',
        stok: 100,
        keterangan: '-',
      },
    ],
  },
  {
    id: 'stok-salur-9',
    productId: 'cs-2',
    namaItem: 'Intisari Amerta',
    subtitle: 'Buku Berbayar, BIA - 2021',
    subJenis: 'Buku Berbayar',
    stok: 100,
    jumlahLokasi: 1,
    jumlahContainer: 1,
    keterangan: '-',
    coverKey: 'intisari-amerta',
    containers: [
      {
        id: 'cont-9-1',
        namaContainer: 'Container J',
        lokasiGudang: 'Rumah Tsa-Tsa',
        jenisLokasi: 'Gudang YPPLN',
        stok: 100,
        keterangan: '-',
      },
    ],
  },
  {
    id: 'stok-salur-10',
    productId: 'cs-3',
    namaItem: 'The Leader’s Way',
    subtitle: 'Buku Berbayar, BLW - 2021',
    subJenis: 'Buku Berbayar',
    stok: 100,
    jumlahLokasi: 1,
    jumlahContainer: 1,
    keterangan: '-',
    coverKey: 'leaders-way',
    containers: [
      {
        id: 'cont-cs3-1',
        namaContainer: 'Container BDK - 04',
        lokasiGudang: 'Kantor Bandung',
        jenisLokasi: 'Gudang YPPLN',
        stok: 100,
        keterangan: '-',
      },
    ],
  },
  {
    id: 'stok-salur-11',
    productId: 'book-7',
    namaItem: 'Buku Panduan Meditasi Praktis',
    subtitle: 'Buku Non-YPPLN, BMP - 2021',
    subJenis: 'Buku Non-YPPLN',
    stok: 45,
    jumlahLokasi: 1,
    jumlahContainer: 1,
    keterangan: '-',
    coverKey: 'menjadi-buddha',
    containers: [
      {
        id: 'cont-7-1',
        namaContainer: 'Container K',
        lokasiGudang: 'Kantor Bandung',
        jenisLokasi: 'Gudang YPPLN',
        stok: 45,
        keterangan: '-',
      },
    ],
  },
  {
    id: 'stok-salur-12',
    productId: 'item-8',
    namaItem: 'T-Shirt Meditasi S-SALUR',
    subtitle: 'Merchandise T-Shirt, TSM - 2021',
    subJenis: 'T-Shirt',
    stok: 50,
    jumlahLokasi: 1,
    jumlahContainer: 1,
    keterangan: '-',
    coverKey: 'demi-kepentingan',
    containers: [
      {
        id: 'cont-8-merch',
        namaContainer: 'Container L',
        lokasiGudang: 'Kantor Bandung',
        jenisLokasi: 'Gudang YPPLN',
        stok: 50,
        keterangan: '-',
      },
    ],
  },
  {
    id: 'stok-salur-13',
    productId: 'item-9',
    namaItem: 'Note Book Sadhana Harian',
    subtitle: 'Merchandise Note Book, NSH - 2021',
    subJenis: 'Note Book',
    stok: 120,
    jumlahLokasi: 1,
    jumlahContainer: 1,
    keterangan: '-',
    coverKey: 'demi-kepentingan',
    containers: [
      {
        id: 'cont-9-merch',
        namaContainer: 'Container M',
        lokasiGudang: 'Rumah Tsa-Tsa',
        jenisLokasi: 'Gudang YPPLN',
        stok: 120,
        keterangan: '-',
      },
    ],
  },
  {
    id: 'stok-salur-14',
    productId: 'item-10',
    namaItem: 'Dupa Aromaterapi Cendana',
    subtitle: 'Lain-lain Non-YPPLN, DAC - 2021',
    subJenis: 'Lain-lain Non-YPPLN',
    stok: 30,
    jumlahLokasi: 1,
    jumlahContainer: 1,
    keterangan: '-',
    coverKey: 'jalan-menuju',
    containers: [
      {
        id: 'cont-10-lain',
        namaContainer: 'Container N',
        lokasiGudang: 'Rumah Tsa-Tsa',
        jenisLokasi: 'Gudang YPPLN',
        stok: 30,
        keterangan: '-',
      },
    ],
  },
  {
    id: 'stok-salur-15',
    productId: 'item-11',
    namaItem: 'E-Book Lamrim Chenmo',
    subtitle: 'Google Play Books Digital, GBO - 2021',
    subJenis: 'Google Books',
    stok: 0,
    jumlahLokasi: 0,
    jumlahContainer: 0,
    keterangan: '-',
    coverKey: 'jalan-menuju',
    containers: [],
  },
];

export function getStoredStokSalurItems(customSalurProducts?: SalurProduct[]): StokSalurItem[] {
  let currentList: StokSalurItem[] = [];
  try {
    const saved = localStorage.getItem(STOK_SALUR_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        currentList = parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored StokSalurItems:', e);
  }

  if (currentList.length === 0) {
    currentList = [...INITIAL_STOK_SALUR_ITEMS];
  }

  // Ambil semua produk Item S-SALUR (agar semua Item S-SALUR muncul pada Stok Item S-SALUR)
  const allSalurProducts =
    customSalurProducts && customSalurProducts.length > 0
      ? customSalurProducts
      : getStoredSalurProducts();

  let hasChanges = false;
  const existingProductIds = new Set(
    currentList.map((p: StokSalurItem) => p.productId).filter(Boolean)
  );
  const existingNames = new Set(
    currentList.map((p: StokSalurItem) => (p.namaItem || '').toLowerCase().trim()).filter(Boolean)
  );

  // Pastikan SEMUA "Item S-SALUR" muncul pada "Stok Item S-SALUR". Jika stok kosong, biarkan 0
  for (const prod of allSalurProducts) {
    const normName = (prod.title || '').toLowerCase().trim();
    if (!existingProductIds.has(prod.id) && !existingNames.has(normName)) {
      const stockVal = typeof prod.stock === 'number' && !isNaN(prod.stock) ? prod.stock : 0;
      const newItem: StokSalurItem = {
        id: `stok-salur-${prod.id}`,
        productId: prod.id,
        namaItem: prod.title,
        subtitle:
          prod.subtitle ||
          `${prod.subJenis || prod.category || 'Buku Berbayar'}, ${prod.code || ''}`,
        subJenis: prod.subJenis || prod.category || 'Buku Berbayar',
        tanggal: '15 Nov 2021',
        stok: stockVal,
        jumlahLokasi: stockVal > 0 ? 1 : 0,
        jumlahContainer: stockVal > 0 ? 1 : 0,
        keterangan: '-',
        coverKey: (prod.coverKey as any) || 'jalan-menuju',
        containers:
          stockVal > 0
            ? [
                {
                  id: `cont-${prod.id}-1`,
                  namaContainer: 'Container A',
                  lokasiGudang: 'Rumah Tsa-Tsa',
                  jenisLokasi: 'Gudang YPPLN',
                  stok: stockVal,
                  keterangan: '-',
                  tanggal: '15 Nov 2021',
                },
              ]
            : [],
      };
      currentList.push(newItem);
      existingProductIds.add(prod.id);
      existingNames.add(normName);
      hasChanges = true;
    }
  }

  // Pastikan seluruh item bawaan INITIAL_STOK_SALUR_ITEMS juga ada
  for (const init of INITIAL_STOK_SALUR_ITEMS) {
    if (!existingProductIds.has(init.productId)) {
      currentList.push(init);
      existingProductIds.add(init.productId);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    try {
      localStorage.setItem(STOK_SALUR_STORAGE_KEY, JSON.stringify(currentList));
    } catch (e) {
      console.error('Error saving updated StokSalurItems:', e);
    }
  }

  return currentList;
}

export function saveStoredStokSalurItems(items: StokSalurItem[]): void {
  try {
    localStorage.setItem(STOK_SALUR_STORAGE_KEY, JSON.stringify(items));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('stok_salur_updated'));
    }
  } catch (e) {
    console.error('Error saving StokSalurItems:', e);
  }
}

/**
 * Mendapatkan stok realtime dari Stok Item S-SALUR untuk suatu produk / item.
 */
export function getRealtimeStockForSalurProduct(
  product: { id: string; title: string; code?: string; stock?: number },
  stokItemsList?: StokSalurItem[]
): number {
  const items = stokItemsList && stokItemsList.length > 0 ? stokItemsList : getStoredStokSalurItems();
  const match = items.find(
    (si) =>
      (si.productId && si.productId === product.id) ||
      (si.namaItem && si.namaItem.toLowerCase().trim() === product.title.toLowerCase().trim()) ||
      (product.code && si.subtitle && si.subtitle.toLowerCase().includes(product.code.toLowerCase()))
  );

  if (match) {
    if (match.containers && match.containers.length > 0) {
      const containerSum = match.containers.reduce((acc, c) => acc + (Number(c.stok) || 0), 0);
      return containerSum;
    }
    return Number(match.stok) || 0;
  }

  // Fallback search in Gudang Location Data
  try {
    const gudangs = getStoredGudangSalurData();
    let gudangTotal = 0;
    let found = false;
    gudangs.forEach((g) => {
      g.containers.forEach((c) => {
        c.items.forEach((it) => {
          if (
            (it.itemId && it.itemId === product.id) ||
            (it.namaItem && it.namaItem.toLowerCase().trim() === product.title.toLowerCase().trim())
          ) {
            gudangTotal += Number(it.stok) || 0;
            found = true;
          }
        });
      });
    });
    if (found) {
      return gudangTotal;
    }
  } catch (e) {
    // Ignore error
  }

  return 0;
}

/**
 * Mendapatkan stok realtime dari container tertentu untuk suatu produk / item S-SALUR.
 */
export function getRealtimeStockForSalurProductInContainer(
  product: { id: string; title: string; code?: string; stock?: number },
  containerName: string,
  stokItemsList?: StokSalurItem[]
): number {
  if (!containerName) return 0;
  const targetCont = containerName.trim().toLowerCase();
  const items =
    stokItemsList && stokItemsList.length > 0 ? stokItemsList : getStoredStokSalurItems();

  const match = items.find(
    (si) =>
      (si.productId && si.productId === product.id) ||
      (si.namaItem && si.namaItem.toLowerCase().trim() === product.title.toLowerCase().trim()) ||
      (product.code && si.subtitle && si.subtitle.toLowerCase().includes(product.code.toLowerCase()))
  );

  if (match && match.containers && match.containers.length > 0) {
    const contAlloc = match.containers.find(
      (c) => (c.namaContainer || '').trim().toLowerCase() === targetCont
    );
    if (contAlloc) {
      return Number(contAlloc.stok) || 0;
    }
  }

  // Fallback search in Gudang Location Data
  try {
    const gudangs = getStoredGudangSalurData();
    let foundStok = 0;
    let found = false;
    gudangs.forEach((g) => {
      g.containers.forEach((c) => {
        if ((c.namaContainer || '').trim().toLowerCase() === targetCont) {
          c.items.forEach((it) => {
            if (
              (it.itemId && it.itemId === product.id) ||
              (it.namaItem && it.namaItem.toLowerCase().trim() === product.title.toLowerCase().trim())
            ) {
              foundStok += Number(it.stok) || 0;
              found = true;
            }
          });
        }
      });
    });
    if (found) {
      return foundStok;
    }
  } catch (e) {
    // Ignore error
  }

  return 0;
}

// -------------------------------------------------------------
// GUDANG TAB HIERARCHY DATA (Gudang -> Containers -> Items)
// -------------------------------------------------------------

export interface ItemInContainer {
  id: string;
  itemId: string;
  namaItem: string;
  subtitle: string;
  stokTotal: number;
  stok: number; // Stok in this specific container
  keterangan: string;
  coverKey?: 'demi-kepentingan' | 'menjadi-buddha' | 'jalan-menuju' | 'lakon-hidup' | 'intisari-amerta' | 'leaders-way';
}

export interface ContainerInGudang {
  id: string;
  namaContainer: string;
  lokasiGudang: string;
  jenisLokasi: string;
  judulItem: number;
  stok: number;
  keterangan: string;
  items: ItemInContainer[];
}

export interface GudangLocationData {
  id: string;
  namaLokasi: string;
  jenisLokasi: string;
  judulItem: number;
  stokDisplay: string;
  stokNumber: number;
  jumlahContainer: number;
  keterangan: string;
  containers: ContainerInGudang[];
}

export const GUDANG_SALUR_STORAGE_KEY = 'yppln_stok_gudang_salur_data';

export const INITIAL_GUDANG_SALUR_DATA: GudangLocationData[] = [
  {
    id: 'gudang-kantor-bandung',
    namaLokasi: 'Kantor Bandung',
    jenisLokasi: 'Gudang YPPLN',
    judulItem: 50,
    stokDisplay: '1.000',
    stokNumber: 1000,
    jumlahContainer: 60,
    keterangan: '-',
    containers: [
      {
        id: 'cont-bdk-rak',
        namaContainer: 'Rak',
        lokasiGudang: 'Kantor Bandung',
        jenisLokasi: 'Gudang YPPLN',
        judulItem: 6,
        stok: 215,
        keterangan: 'Rak Etalase / Stand POS Kasir',
        items: [
          {
            id: 'item-bdk-rak-1',
            itemId: 'book-1',
            namaItem: 'Jalan Menuju Kemahatahuan',
            subtitle: 'Buku Berbayar, BJM - 2021',
            stokTotal: 100,
            stok: 35,
            keterangan: '-',
            coverKey: 'jalan-menuju',
          },
          {
            id: 'item-bdk-rak-2',
            itemId: 'book-2',
            namaItem: 'Demi Kepentingan Semua Makhluk',
            subtitle: 'Buku Berbayar, BSM - 2021',
            stokTotal: 100,
            stok: 25,
            keterangan: '-',
            coverKey: 'demi-kepentingan',
          },
          {
            id: 'item-bdk-rak-3',
            itemId: 'book-3',
            namaItem: 'Menjadi Buddha di Tempat Kerja',
            subtitle: 'Buku Berbayar, BMB - 2021',
            stokTotal: 100,
            stok: 30,
            keterangan: '-',
            coverKey: 'menjadi-buddha',
          },
          {
            id: 'item-bdk-rak-4',
            itemId: 'book-4',
            namaItem: "The Leader's Way",
            subtitle: 'Buku Berbayar, BLW - 2021',
            stokTotal: 85,
            stok: 35,
            keterangan: '-',
            coverKey: 'leaders-way',
          },
          {
            id: 'item-bdk-rak-5',
            itemId: 'book-5',
            namaItem: 'Dhammapada Bahasa Indonesia',
            subtitle: 'Buku Tidak Berbayar, DBI - 2021',
            stokTotal: 150,
            stok: 40,
            keterangan: '-',
            coverKey: 'jalan-menuju',
          },
          {
            id: 'item-bdk-rak-6',
            itemId: 'book-6',
            namaItem: 'Buku Paritta Suci YPPLN',
            subtitle: 'Buku Tidak Berbayar, BPS - 2021',
            stokTotal: 200,
            stok: 50,
            keterangan: '-',
            coverKey: 'jalan-menuju',
          },
        ],
      },
      {
        id: 'cont-bdk-01',
        namaContainer: 'Container BDK - 01',
        lokasiGudang: 'Kantor Bandung',
        jenisLokasi: 'Gudang YPPLN',
        judulItem: 25,
        stok: 500,
        keterangan: '-',
        items: [
          {
            id: 'item-bdk-1',
            itemId: 'book-2',
            namaItem: 'Demi Kepentingan Semua Makhluk',
            subtitle: 'Buku Berbayar, BSM - 2021',
            stokTotal: 100,
            stok: 50,
            keterangan: '-',
            coverKey: 'demi-kepentingan',
          },
          {
            id: 'item-bdk-2',
            itemId: 'book-3',
            namaItem: 'Menjadi Buddha di Tempat Kerja',
            subtitle: 'Buku Berbayar, BMB - 2021',
            stokTotal: 100,
            stok: 60,
            keterangan: '-',
            coverKey: 'menjadi-buddha',
          },
        ],
      },
      {
        id: 'cont-bdk-02',
        namaContainer: 'Container BDK - 02',
        lokasiGudang: 'Kantor Bandung',
        jenisLokasi: 'Gudang YPPLN',
        judulItem: 25,
        stok: 500,
        keterangan: '-',
        items: [
          {
            id: 'item-bdk-3',
            itemId: 'book-2',
            namaItem: 'Demi Kepentingan Semua Makhluk',
            subtitle: 'Buku Berbayar, BSM - 2021',
            stokTotal: 100,
            stok: 40,
            keterangan: '-',
            coverKey: 'demi-kepentingan',
          },
        ],
      },
    ],
  },
  {
    id: 'gudang-rumah-tsatsa',
    namaLokasi: 'Rumah Tsa-tsa',
    jenisLokasi: 'Gudang YPPLN',
    judulItem: 2,
    stokDisplay: '20',
    stokNumber: 20,
    jumlahContainer: 2,
    keterangan: '-',
    containers: [
      {
        id: 'cont-tsatsa-a',
        namaContainer: 'Container A',
        lokasiGudang: 'Rumah Tsa-Tsa',
        jenisLokasi: 'Gudang YPPLN',
        judulItem: 2,
        stok: 10,
        keterangan: '-',
        items: [
          {
            id: 'item-tsatsa-a-1',
            itemId: 'book-2',
            namaItem: 'Demi Kepentingan Semua Makhluk',
            subtitle: 'Buku Berbayar, BSM - 2021',
            stokTotal: 100,
            stok: 5,
            keterangan: '-',
            coverKey: 'demi-kepentingan',
          },
          {
            id: 'item-tsatsa-a-2',
            itemId: 'book-3',
            namaItem: 'Menjadi Buddha di Tempat Kerja',
            subtitle: 'Buku Berbayar, BMB - 2021',
            stokTotal: 100,
            stok: 5,
            keterangan: '-',
            coverKey: 'menjadi-buddha',
          },
        ],
      },
      {
        id: 'cont-tsatsa-b',
        namaContainer: 'Container B',
        lokasiGudang: 'Rumah Tsa-Tsa',
        jenisLokasi: 'Gudang YPPLN',
        judulItem: 1,
        stok: 10,
        keterangan: '-',
        items: [
          {
            id: 'item-tsatsa-b-1',
            itemId: 'book-2',
            namaItem: 'Demi Kepentingan Semua Makhluk',
            subtitle: 'Buku Berbayar, BSM - 2021',
            stokTotal: 100,
            stok: 10,
            keterangan: '-',
            coverKey: 'demi-kepentingan',
          },
        ],
      },
    ],
  },
  {
    id: 'gudang-stand',
    namaLokasi: 'Stand',
    jenisLokasi: 'Kegiatan',
    judulItem: 5,
    stokDisplay: '100',
    stokNumber: 100,
    jumlahContainer: 20,
    keterangan: '-',
    containers: [
      {
        id: 'cont-stand-01',
        namaContainer: 'Container Stand - 01',
        lokasiGudang: 'Stand',
        jenisLokasi: 'Kegiatan',
        judulItem: 3,
        stok: 60,
        keterangan: '-',
        items: [
          {
            id: 'item-stand-1',
            itemId: 'book-2',
            namaItem: 'Demi Kepentingan Semua Makhluk',
            subtitle: 'Buku Berbayar, BSM - 2021',
            stokTotal: 100,
            stok: 20,
            keterangan: '-',
            coverKey: 'demi-kepentingan',
          },
          {
            id: 'item-stand-2',
            itemId: 'book-3',
            namaItem: 'Menjadi Buddha di Tempat Kerja',
            subtitle: 'Buku Berbayar, BMB - 2021',
            stokTotal: 100,
            stok: 20,
            keterangan: '-',
            coverKey: 'menjadi-buddha',
          },
          {
            id: 'item-stand-3',
            itemId: 'book-1',
            namaItem: 'Jalan Menuju Kemahatahuan',
            subtitle: 'Buku Berbayar, BJM - 2021',
            stokTotal: 100,
            stok: 20,
            keterangan: '-',
            coverKey: 'jalan-menuju',
          },
        ],
      },
      {
        id: 'cont-stand-02',
        namaContainer: 'Container Stand - 02',
        lokasiGudang: 'Stand',
        jenisLokasi: 'Kegiatan',
        judulItem: 2,
        stok: 40,
        keterangan: '-',
        items: [
          {
            id: 'item-stand-4',
            itemId: 'book-2',
            namaItem: 'Demi Kepentingan Semua Makhluk',
            subtitle: 'Buku Berbayar, BSM - 2021',
            stokTotal: 100,
            stok: 20,
            keterangan: '-',
            coverKey: 'demi-kepentingan',
          },
          {
            id: 'item-stand-5',
            itemId: 'book-3',
            namaItem: 'Menjadi Buddha di Tempat Kerja',
            subtitle: 'Buku Berbayar, BMB - 2021',
            stokTotal: 100,
            stok: 20,
            keterangan: '-',
            coverKey: 'menjadi-buddha',
          },
        ],
      },
    ],
  },
  {
    id: 'gudang-vihara-vg',
    namaLokasi: 'Vihara VG',
    jenisLokasi: 'Agen Purna',
    judulItem: 2,
    stokDisplay: '40',
    stokNumber: 40,
    jumlahContainer: 2,
    keterangan: '-',
    containers: [
      {
        id: 'cont-vg-01',
        namaContainer: 'Container VG - 01',
        lokasiGudang: 'Vihara VG',
        jenisLokasi: 'Agen Purna',
        judulItem: 2,
        stok: 40,
        keterangan: '-',
        items: [
          {
            id: 'item-vg-1',
            itemId: 'book-2',
            namaItem: 'Demi Kepentingan Semua Makhluk',
            subtitle: 'Buku Berbayar, BSM - 2021',
            stokTotal: 100,
            stok: 20,
            keterangan: '-',
            coverKey: 'demi-kepentingan',
          },
          {
            id: 'item-vg-2',
            itemId: 'book-3',
            namaItem: 'Menjadi Buddha di Tempat Kerja',
            subtitle: 'Buku Berbayar, BMB - 2021',
            stokTotal: 100,
            stok: 20,
            keterangan: '-',
            coverKey: 'menjadi-buddha',
          },
        ],
      },
    ],
  },
  {
    id: 'gudang-perpustakaan-steva',
    namaLokasi: 'Perpustakaan Steva',
    jenisLokasi: 'Agen Purna',
    judulItem: 1,
    stokDisplay: '20',
    stokNumber: 20,
    jumlahContainer: 1,
    keterangan: '-',
    containers: [
      {
        id: 'cont-steva-01',
        namaContainer: 'Container Steva - 01',
        lokasiGudang: 'Perpustakaan Steva',
        jenisLokasi: 'Agen Purna',
        judulItem: 1,
        stok: 20,
        keterangan: '-',
        items: [
          {
            id: 'item-steva-1',
            itemId: 'book-1',
            namaItem: 'Jalan Menuju Kemahatahuan',
            subtitle: 'Buku Berbayar, BJM - 2021',
            stokTotal: 100,
            stok: 20,
            keterangan: '-',
            coverKey: 'jalan-menuju',
          },
        ],
      },
    ],
  },
];

export function getStoredGudangSalurData(): GudangLocationData[] {
  try {
    const saved = localStorage.getItem(GUDANG_SALUR_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasRak = parsed.some((g: GudangLocationData) =>
          (g.containers || []).some(
            (c) => (c.namaContainer || '').trim().toLowerCase() === 'rak'
          )
        );
        if (!hasRak) {
          const kb =
            parsed.find((g: GudangLocationData) =>
              g.namaLokasi.toLowerCase().includes('bandung')
            ) || parsed[0];
          if (kb) {
            const rakTemplate = INITIAL_GUDANG_SALUR_DATA[0]?.containers?.find(
              (c) => c.namaContainer.toLowerCase() === 'rak'
            );
            if (rakTemplate) {
              kb.containers.unshift(rakTemplate);
              saveStoredGudangSalurData(parsed);
            }
          }
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored GudangSalurData:', e);
  }
  return INITIAL_GUDANG_SALUR_DATA;
}

export function saveStoredGudangSalurData(data: GudangLocationData[]): void {
  try {
    localStorage.setItem(GUDANG_SALUR_STORAGE_KEY, JSON.stringify(data));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('stok_salur_updated'));
    }
  } catch (e) {
    console.error('Error saving GudangSalurData:', e);
  }
}

export interface SalurContainerOption {
  container: string;
  lokasi: string;
  jenisLokasi?: string;
  label: string;
}

/**
 * Mengambil seluruh opsi container stok S-SALUR.
 * Selalu menyertakan "Rak" sebagai pilihan utama/default.
 */
export function getAllSalurContainerOptions(): SalurContainerOption[] {
  const gudangs = getStoredGudangSalurData();
  const options: SalurContainerOption[] = [];
  const seen = new Set<string>();

  // Default "Rak" selalu ada di urutan pertama
  options.push({
    container: 'Rak',
    lokasi: 'Kantor Bandung',
    jenisLokasi: 'Gudang YPPLN',
    label: 'Rak (Kantor Bandung)',
  });
  seen.add('rak');

  // Tambahkan semua container dari master gudang
  gudangs.forEach((g) => {
    (g.containers || []).forEach((c) => {
      const name = (c.namaContainer || '').trim();
      if (name && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        const loc = c.lokasiGudang || g.namaLokasi || '-';
        options.push({
          container: name,
          lokasi: loc,
          jenisLokasi: c.jenisLokasi || g.jenisLokasi || 'Gudang YPPLN',
          label: `${name} (${loc})`,
        });
      }
    });
  });

  return options;
}

// -------------------------------------------------------------
// LOKASI STOK ITEM S-SALUR MASTER DATA
// -------------------------------------------------------------

export interface LokasiStokItemSalur {
  id: string;
  lokasi: string;
  jenisLokasi: string;
  keterangan: string;
}

export const LOKASI_STOK_SALUR_STORAGE_KEY = 'yppln_lokasi_stok_item_salur_data';

export const INITIAL_LOKASI_STOK_SALUR: LokasiStokItemSalur[] = [
  {
    id: 'lokasi-1',
    lokasi: 'Kantor Bandung',
    jenisLokasi: 'Gudang YPPLN',
    keterangan: '-',
  },
  {
    id: 'lokasi-2',
    lokasi: 'Rumah Tsa-tsa',
    jenisLokasi: 'Gudang YPPLN',
    keterangan: '-',
  },
  {
    id: 'lokasi-3',
    lokasi: 'Stand',
    jenisLokasi: 'Kegiatan',
    keterangan: '-',
  },
  {
    id: 'lokasi-4',
    lokasi: 'Vihara VG',
    jenisLokasi: 'Agen Purna',
    keterangan: '-',
  },
  {
    id: 'lokasi-5',
    lokasi: 'Perpustakaan Steva',
    jenisLokasi: 'Agen Purna',
    keterangan: '-',
  },
];

export function getStoredLokasiStokSalur(): LokasiStokItemSalur[] {
  try {
    const saved = localStorage.getItem(LOKASI_STOK_SALUR_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored LokasiStokSalur:', e);
  }
  return INITIAL_LOKASI_STOK_SALUR;
}

export function saveStoredLokasiStokSalur(items: LokasiStokItemSalur[]): void {
  try {
    localStorage.setItem(LOKASI_STOK_SALUR_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving LokasiStokSalur:', e);
  }
}

export function addLokasiStokSalur(
  item: Omit<LokasiStokItemSalur, 'id'>
): LokasiStokItemSalur {
  const current = getStoredLokasiStokSalur();
  const newLok: LokasiStokItemSalur = {
    id: `lokasi-${Date.now()}`,
    ...item,
  };
  const updated = [...current, newLok];
  saveStoredLokasiStokSalur(updated);

  // Synchronize with GudangLocationData in Stok Item S-SALUR
  const gudangs = getStoredGudangSalurData();
  const exists = gudangs.some(
    (g) => g.namaLokasi.toLowerCase() === newLok.lokasi.toLowerCase()
  );
  if (!exists) {
    const newGudang: GudangLocationData = {
      id: `gudang-${Date.now()}`,
      namaLokasi: newLok.lokasi,
      jenisLokasi: newLok.jenisLokasi,
      judulItem: 0,
      stokDisplay: '0',
      stokNumber: 0,
      jumlahContainer: 0,
      keterangan: newLok.keterangan || '-',
      containers: [],
    };
    saveStoredGudangSalurData([...gudangs, newGudang]);
  }

  return newLok;
}

export function updateLokasiStokSalur(
  item: LokasiStokItemSalur,
  oldName?: string
): void {
  const current = getStoredLokasiStokSalur();
  const updated = current.map((l) => (l.id === item.id ? item : l));
  saveStoredLokasiStokSalur(updated);

  const prevName = oldName || item.lokasi;

  // Synchronize GudangLocationData
  const gudangs = getStoredGudangSalurData();
  const updatedGudangs = gudangs.map((g) => {
    if (
      g.namaLokasi.toLowerCase() === prevName.toLowerCase() ||
      g.id === item.id
    ) {
      return {
        ...g,
        namaLokasi: item.lokasi,
        jenisLokasi: item.jenisLokasi,
        keterangan: item.keterangan,
        containers: g.containers.map((c) => ({
          ...c,
          lokasiGudang: item.lokasi,
          jenisLokasi: item.jenisLokasi,
        })),
      };
    }
    return g;
  });
  saveStoredGudangSalurData(updatedGudangs);

  // Synchronize StokSalurItems containers allocation
  const stokItems = getStoredStokSalurItems();
  const updatedStokItems = stokItems.map((si) => ({
    ...si,
    containers: si.containers.map((c) => {
      if (c.lokasiGudang.toLowerCase() === prevName.toLowerCase()) {
        return {
          ...c,
          lokasiGudang: item.lokasi,
          jenisLokasi: item.jenisLokasi,
        };
      }
      return c;
    }),
  }));
  saveStoredStokSalurItems(updatedStokItems);
}

export function deleteLokasiStokSalur(id: string, namaLokasi: string): void {
  const current = getStoredLokasiStokSalur();
  const updated = current.filter((l) => l.id !== id);
  saveStoredLokasiStokSalur(updated);

  const gudangs = getStoredGudangSalurData();
  const updatedGudangs = gudangs.filter(
    (g) => g.namaLokasi.toLowerCase() !== namaLokasi.toLowerCase()
  );
  saveStoredGudangSalurData(updatedGudangs);
}

// -------------------------------------------------------------
// STOCK IN/OUT STOK ITEM S-SALUR DATA & MUTATION LOGIC
// -------------------------------------------------------------

export interface StockInOutSalurRecord {
  id: string;
  tanggal: string;
  sumberContainer: string;
  sumberLokasi: string;
  namaItem: string;
  jumlah: number;
  tujuanContainer: string;
  tujuanLokasi: string;
  jenisPerubahan: string; // 'Pindah Rak' | 'Pindah Stock' | 'Penjualan' | 'Stock In' | 'Stock Out'
  keterangan?: string;
  orderId?: string;
  orderNumber?: string;
  noResi?: string;
}

export const STOCK_IN_OUT_SALUR_STORAGE_KEY = 'yppln_stock_in_out_salur_data';

export const INITIAL_STOCK_IN_OUT_SALUR: StockInOutSalurRecord[] = [
  {
    id: 'stock-io-1',
    tanggal: '1 Jan 2021',
    sumberContainer: 'BGL - 001',
    sumberLokasi: 'Kantor Bandung',
    namaItem: "Go Lotsawa's The Blue Annals",
    jumlah: 132,
    tujuanContainer: 'Rak',
    tujuanLokasi: 'Kantor Bandung',
    jenisPerubahan: 'Pindah Rak',
  },
  {
    id: 'stock-io-2',
    tanggal: '1 Jan 2021',
    sumberContainer: 'BJM - 001',
    sumberLokasi: 'Kantor Bandung',
    namaItem: 'Jalan Menuju Kemahatahuan',
    jumlah: 132,
    tujuanContainer: 'Rak',
    tujuanLokasi: 'Kantor Bandung',
    jenisPerubahan: 'Pindah Rak',
  },
  {
    id: 'stock-io-3',
    tanggal: '1 Jan 2021',
    sumberContainer: 'Rak',
    sumberLokasi: 'Kantor Bandung',
    namaItem: 'Demi Kepentingan Semua Makhluk',
    jumlah: 5,
    tujuanContainer: 'Container A',
    tujuanLokasi: 'Rumah Tsa-tsa',
    jenisPerubahan: 'Pindah Stock',
  },
  {
    id: 'stock-io-4',
    tanggal: '1 Jan 2021',
    sumberContainer: 'Rak',
    sumberLokasi: 'Kantor Bandung',
    namaItem: 'Menjadi Buddha di Tempat Kerja',
    jumlah: 5,
    tujuanContainer: 'Container A',
    tujuanLokasi: 'Rumah Tsa-tsa',
    jenisPerubahan: 'Pindah Stock',
  },
  {
    id: 'stock-io-5',
    tanggal: '1 Jan 2021',
    sumberContainer: 'Rak',
    sumberLokasi: 'Kantor Bandung',
    namaItem: 'Demi Kepentingan Semua Makhluk',
    jumlah: 5,
    tujuanContainer: 'Container B',
    tujuanLokasi: 'Rumah Tsa-tsa',
    jenisPerubahan: 'Pindah Stock',
  },
  {
    id: 'stock-io-6',
    tanggal: '1 Jan 2021',
    sumberContainer: 'Rak',
    sumberLokasi: 'Kantor Bandung',
    namaItem: 'Menjadi Buddha di Tempat Kerja',
    jumlah: 5,
    tujuanContainer: 'Container B',
    tujuanLokasi: 'Rumah Tsa-tsa',
    jenisPerubahan: 'Pindah Stock',
  },
  {
    id: 'stock-io-7',
    tanggal: '10 Jan 2021',
    sumberContainer: 'BHW - 001',
    sumberLokasi: 'Kantor Bandung',
    namaItem: 'Harta, Tahta, dan Wanitia dalam Gandhawyuha',
    jumlah: 132,
    tujuanContainer: '-',
    tujuanLokasi: '-',
    jenisPerubahan: 'Penjualan',
  },
];

export function getStoredStockInOutSalur(): StockInOutSalurRecord[] {
  try {
    const saved = localStorage.getItem(STOCK_IN_OUT_SALUR_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored StockInOutSalur:', e);
  }
  return INITIAL_STOCK_IN_OUT_SALUR;
}

export function normalizeSalurItemTitle(title: string): string {
  return (title || '')
    .toLowerCase()
    .replace(/[\u2018\u2019`']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function isMatchingSalurItem(a?: string, b?: string): boolean {
  const nA = normalizeSalurItemTitle(a || '');
  const nB = normalizeSalurItemTitle(b || '');
  if (!nA || !nB) return false;
  return nA === nB || nA.includes(nB) || nB.includes(nA);
}

export function saveStoredStockInOutSalur(items: StockInOutSalurRecord[]): void {
  try {
    localStorage.setItem(STOCK_IN_OUT_SALUR_STORAGE_KEY, JSON.stringify(items));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('stock_in_out_updated'));
      window.dispatchEvent(new Event('stok_salur_updated'));
    }
  } catch (e) {
    console.error('Error saving StockInOutSalur:', e);
  }
}

/**
 * Applies physical stock movement to GudangLocationData & StokSalurItem
 */
export function applyStockMovement(
  record: Omit<StockInOutSalurRecord, 'id'>
): void {
  const qty = Number(record.jumlah) || 0;
  if (qty <= 0) return;

  const gudangs = getStoredGudangSalurData();
  let gudangUpdated = false;

  const srcGudang = record.sumberLokasi.trim();
  const srcCont = record.sumberContainer.trim();
  const destGudang = record.tujuanLokasi.trim();
  const destCont = record.tujuanContainer.trim();
  const itemName = record.namaItem.trim();

  const newGudangs = gudangs.map((g) => {
    let gModified = false;
    let newContainers = [...g.containers];

    // Handle Source Deductions
    if (
      record.jenisPerubahan !== 'Cetak Baru' &&
      srcGudang !== '-' &&
      srcGudang.toLowerCase() !== 'percetakan' &&
      g.namaLokasi.toLowerCase() === srcGudang.toLowerCase()
    ) {
      newContainers = newContainers.map((c) => {
        if (
          srcCont !== '-' &&
          (c.namaContainer.toLowerCase() === srcCont.toLowerCase() ||
            srcCont.toLowerCase() === 'rak' ||
            c.namaContainer.toLowerCase().includes(srcCont.toLowerCase()))
        ) {
          const newItems = c.items.map((it) => {
            if (isMatchingSalurItem(it.namaItem, itemName)) {
              gModified = true;
              return { ...it, stok: Math.max(0, it.stok - qty) };
            }
            return it;
          });
          const newContStok = newItems.reduce((acc, curr) => acc + curr.stok, 0);
          return { ...c, items: newItems, stok: newContStok };
        }
        return c;
      });
    }

    // Handle Destination Additions
    if (
      destGudang !== '-' &&
      g.namaLokasi.toLowerCase() === destGudang.toLowerCase()
    ) {
      const targetContName = destCont !== '-' ? destCont : 'Container A';
      let targetContainerFound = false;
      newContainers = newContainers.map((c) => {
        if (
          c.namaContainer.toLowerCase() === targetContName.toLowerCase() ||
          c.namaContainer.toLowerCase().includes(targetContName.toLowerCase())
        ) {
          targetContainerFound = true;
          let itemFound = false;
          const newItems = c.items.map((it) => {
            if (isMatchingSalurItem(it.namaItem, itemName)) {
              itemFound = true;
              gModified = true;
              return { ...it, stok: it.stok + qty };
            }
            return it;
          });

          if (!itemFound) {
            gModified = true;
            newItems.push({
              id: `item-cont-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              itemId: `book-${Date.now()}`,
              namaItem: itemName,
              subtitle: 'Item S-SALUR',
              stokTotal: qty,
              stok: qty,
              keterangan: '-',
              coverKey: 'demi-kepentingan',
            });
          }

          const newContStok = newItems.reduce((acc, curr) => acc + curr.stok, 0);
          return {
            ...c,
            items: newItems,
            judulItem: newItems.length,
            stok: newContStok,
          };
        }
        return c;
      });

      // If destination container didn't exist in this warehouse, create it
      if (!targetContainerFound && targetContName !== '-') {
        gModified = true;
        newContainers.push({
          id: `cont-${Date.now()}`,
          namaContainer: targetContName,
          lokasiGudang: g.namaLokasi,
          jenisLokasi: g.jenisLokasi,
          judulItem: 1,
          stok: qty,
          keterangan: '-',
          items: [
            {
              id: `item-cont-${Date.now()}`,
              itemId: `book-${Date.now()}`,
              namaItem: itemName,
              subtitle: 'Item S-SALUR',
              stokTotal: qty,
              stok: qty,
              keterangan: '-',
              coverKey: 'demi-kepentingan',
            },
          ],
        });
      }
    }

    if (gModified) {
      gudangUpdated = true;
      const totalStok = newContainers.reduce((acc, c) => acc + c.stok, 0);
      const totalJudul = new Set(
        newContainers.flatMap((c) => c.items.map((it) => it.namaItem))
      ).size;
      return {
        ...g,
        containers: newContainers,
        jumlahContainer: newContainers.length,
        stokNumber: totalStok,
        stokDisplay: String(totalStok),
        judulItem: totalJudul,
      };
    }

    return g;
  });

  if (gudangUpdated) {
    saveStoredGudangSalurData(newGudangs);
  }

  // Also sync with StokSalurItems list (Item view)
  const items = getStoredStokSalurItems();
  let itemsUpdated = false;

  const newItems = items.map((it) => {
    if (
      isMatchingSalurItem(it.namaItem, itemName) ||
      (it.productId && (record as any).productId && it.productId === (record as any).productId)
    ) {
      let itModified = false;
      let newConts = [...(it.containers || [])];

      // Reduce from source
      if (
        record.jenisPerubahan !== 'Cetak Baru' &&
        srcGudang !== '-' &&
        srcGudang.toLowerCase() !== 'percetakan'
      ) {
        let deducted = false;
        newConts = newConts.map((c) => {
          const matchCont =
            srcCont === '-' ||
            srcCont.toLowerCase() === 'rak' ||
            c.namaContainer.toLowerCase() === srcCont.toLowerCase() ||
            c.namaContainer.toLowerCase().includes(srcCont.toLowerCase());
          const matchLoc =
            srcGudang === '-' ||
            c.lokasiGudang.toLowerCase() === srcGudang.toLowerCase();

          if (!deducted && matchCont && matchLoc) {
            deducted = true;
            itModified = true;
            return { ...c, stok: Math.max(0, c.stok - qty) };
          }
          return c;
        });

        // If no container matched by name/loc, deduct from first container with positive stock
        if (!deducted && newConts.length > 0) {
          newConts = newConts.map((c) => {
            if (!deducted && c.stok > 0) {
              deducted = true;
              itModified = true;
              return { ...c, stok: Math.max(0, c.stok - qty) };
            }
            return c;
          });
        }

        if (!itModified && it.stok > 0) {
          itModified = true;
        }
      }

      // Add to destination
      if (destGudang !== '-') {
        const targetContName = destCont !== '-' ? destCont : 'Container A';
        let destFound = false;
        newConts = newConts.map((c) => {
          if (
            c.namaContainer.toLowerCase() === targetContName.toLowerCase() &&
            c.lokasiGudang.toLowerCase() === destGudang.toLowerCase()
          ) {
            destFound = true;
            itModified = true;
            return { ...c, stok: c.stok + qty };
          }
          return c;
        });

        if (!destFound) {
          itModified = true;
          newConts.push({
            id: `cont-alloc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            namaContainer: targetContName,
            lokasiGudang: destGudang,
            jenisLokasi: 'Gudang YPPLN',
            stok: qty,
            keterangan: '-',
          });
        }
      }

      if (itModified) {
        itemsUpdated = true;
        const totalDistinctGudang = new Set(newConts.map((c) => c.lokasiGudang)).size;
        const totalStok = newConts.reduce((acc, c) => acc + (Number(c.stok) || 0), 0);
        return {
          ...it,
          stok: totalStok,
          containers: newConts,
          jumlahContainer: newConts.length,
          jumlahLokasi: totalDistinctGudang,
        };
      }
    }
    return it;
  });

  if (itemsUpdated) {
    saveStoredStokSalurItems(newItems);
  }
}

/**
 * Reverses physical stock movement when a record is deleted or cancelled
 */
export function rollbackStockMovement(
  record: Omit<StockInOutSalurRecord, 'id'>
): void {
  const qty = Number(record.jumlah) || 0;
  if (qty <= 0) return;

  const gudangs = getStoredGudangSalurData();
  let gudangUpdated = false;

  const srcGudang = record.sumberLokasi.trim();
  const srcCont = record.sumberContainer.trim();
  const destGudang = record.tujuanLokasi.trim();
  const destCont = record.tujuanContainer.trim();
  const itemName = record.namaItem.trim();

  // Reverse: Add back to srcGudang / srcCont, deduct from destGudang / destCont (if not '-')
  const newGudangs = gudangs.map((g) => {
    let gModified = false;
    let newContainers = [...g.containers];

    // Restore to source
    if (
      record.jenisPerubahan !== 'Cetak Baru' &&
      srcGudang !== '-' &&
      srcGudang.toLowerCase() !== 'percetakan' &&
      g.namaLokasi.toLowerCase() === srcGudang.toLowerCase()
    ) {
      newContainers = newContainers.map((c) => {
        if (
          srcCont !== '-' &&
          (c.namaContainer.toLowerCase() === srcCont.toLowerCase() ||
            srcCont.toLowerCase() === 'rak' ||
            c.namaContainer.toLowerCase().includes(srcCont.toLowerCase()))
        ) {
          const itemExists = c.items.some((it) => isMatchingSalurItem(it.namaItem, itemName));
          let newItems = [...c.items];
          if (itemExists) {
            newItems = newItems.map((it) =>
              isMatchingSalurItem(it.namaItem, itemName)
                ? { ...it, stok: it.stok + qty }
                : it
            );
          } else {
            newItems.push({
              id: `item-cont-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              itemId: `book-${Date.now()}`,
              namaItem: itemName,
              subtitle: 'Item S-SALUR',
              stokTotal: qty,
              stok: qty,
              keterangan: '-',
            });
          }
          gModified = true;
          return {
            ...c,
            stok: c.stok + qty,
            items: newItems,
          };
        }
        return c;
      });
    }

    // Deduct from dest if dest was not '-'
    if (destGudang !== '-' && g.namaLokasi.toLowerCase() === destGudang.toLowerCase()) {
      newContainers = newContainers.map((c) => {
        if (
          destCont !== '-' &&
          (c.namaContainer.toLowerCase() === destCont.toLowerCase() ||
            c.namaContainer.toLowerCase().includes(destCont.toLowerCase()))
        ) {
          gModified = true;
          const newItems = c.items.map((it) =>
            isMatchingSalurItem(it.namaItem, itemName)
              ? { ...it, stok: Math.max(0, it.stok - qty) }
              : it
          );
          return {
            ...c,
            stok: Math.max(0, c.stok - qty),
            items: newItems,
          };
        }
        return c;
      });
    }

    if (gModified) {
      gudangUpdated = true;
      const totalStok = newContainers.reduce((acc, c) => acc + c.stok, 0);
      const totalJudul = new Set(
        newContainers.flatMap((c) => c.items.map((it) => it.namaItem))
      ).size;
      return {
        ...g,
        containers: newContainers,
        jumlahContainer: newContainers.length,
        stokNumber: totalStok,
        stokDisplay: String(totalStok),
        judulItem: totalJudul,
      };
    }

    return g;
  });

  if (gudangUpdated) {
    saveStoredGudangSalurData(newGudangs);
  }

  // Also sync with StokSalurItems list
  const items = getStoredStokSalurItems();
  let itemsUpdated = false;

  const newItems = items.map((it) => {
    if (
      isMatchingSalurItem(it.namaItem, itemName) ||
      (it.productId && (record as any).productId && it.productId === (record as any).productId)
    ) {
      let itModified = false;
      let newConts = [...(it.containers || [])];

      // Restore to source
      if (
        record.jenisPerubahan !== 'Cetak Baru' &&
        srcGudang !== '-' &&
        srcGudang.toLowerCase() !== 'percetakan'
      ) {
        let restored = false;
        newConts = newConts.map((c) => {
          if (
            (c.namaContainer.toLowerCase() === srcCont.toLowerCase() ||
              srcCont.toLowerCase() === 'rak' ||
              c.namaContainer.toLowerCase().includes(srcCont.toLowerCase())) &&
            (c.lokasiGudang.toLowerCase() === srcGudang.toLowerCase() || srcGudang === '-')
          ) {
            restored = true;
            itModified = true;
            return { ...c, stok: c.stok + qty };
          }
          return c;
        });

        if (!restored && newConts.length > 0) {
          newConts[0].stok += qty;
          itModified = true;
        }
      }

      // Deduct from destination
      if (destCont !== '-' && destGudang !== '-') {
        newConts = newConts.map((c) => {
          if (
            c.namaContainer.toLowerCase() === destCont.toLowerCase() &&
            c.lokasiGudang.toLowerCase() === destGudang.toLowerCase()
          ) {
            itModified = true;
            return { ...c, stok: Math.max(0, c.stok - qty) };
          }
          return c;
        });
      }

      if (itModified) {
        itemsUpdated = true;
        const totalDistinctGudang = new Set(newConts.map((c) => c.lokasiGudang)).size;
        const totalStok = newConts.reduce((acc, c) => acc + (Number(c.stok) || 0), 0);
        return {
          ...it,
          stok: totalStok,
          containers: newConts,
          jumlahContainer: newConts.length,
          jumlahLokasi: totalDistinctGudang,
        };
      }
    }
    return it;
  });

  if (itemsUpdated) {
    saveStoredStokSalurItems(newItems);
  }
}

export function addStockInOutSalur(
  record: Omit<StockInOutSalurRecord, 'id'>,
  applySync = true
): StockInOutSalurRecord {
  const current = getStoredStockInOutSalur();
  const newRecord: StockInOutSalurRecord = {
    id: `stock-io-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ...record,
  };
  const updated = [newRecord, ...current];
  saveStoredStockInOutSalur(updated);

  if (applySync) {
    applyStockMovement(record);
  }

  return newRecord;
}

export function updateStockInOutSalur(
  record: StockInOutSalurRecord
): void {
  const current = getStoredStockInOutSalur();
  const oldRecord = current.find((r) => r.id === record.id);
  if (oldRecord) {
    rollbackStockMovement(oldRecord);
  }
  applyStockMovement(record);
  const updated = current.map((r) => (r.id === record.id ? record : r));
  saveStoredStockInOutSalur(updated);
}

export function deleteStockInOutSalur(id: string): void {
  const current = getStoredStockInOutSalur();
  const target = current.find((r) => r.id === id);
  if (target) {
    rollbackStockMovement(target);
  }
  const updated = current.filter((r) => r.id !== id);
  saveStoredStockInOutSalur(updated);
}

/**
 * Menghapus catatan Stock In/Out untuk pesanan dan mengembalikan mutasi stok
 */
export function removeStockInOutForOrder(orderId: string): void {
  const current = getStoredStockInOutSalur();
  const toRemove = current.filter((r) => r.orderId === orderId);
  if (toRemove.length === 0) return;

  toRemove.forEach((rec) => {
    rollbackStockMovement(rec);
  });

  const updated = current.filter((r) => r.orderId !== orderId);
  saveStoredStockInOutSalur(updated);
}

/**
 * Otomatis menambahkan / memperbarui catatan Stock In/Out saat No. Resi pada Transaksi S-SALUR terisi.
 * - Tanggal stok in/out sesuai tanggal print (jika tidak ada/belum diprint, menggunakan tanggal resi diisi)
 * - Tujuan container: "-"
 * - Tujuan lokasi: "-"
 * - Jenis perubahan: "Penjualan"
 * - Berdasarkan jumlah transaksi untuk setiap item produk S-SALUR
 */
export function syncStockInOutFromSalurOrder(
  order: {
    id: string;
    orderNumber?: string;
    printStatusBadge?: { text?: string; type?: string };
    alamat?: { badgeDate?: string };
    items?: Array<{
      id?: string;
      productId?: string;
      title: string;
      quantity: number;
    }>;
    ekspedisi?: { noResi?: string };
    stockOutContainer?: string;
    stockOutLokasi?: string;
    printDate?: string;
  },
  noResiInput?: string,
  tanggalResiDiisi?: string
): void {
  const resi = (noResiInput || order.ekspedisi?.noResi || '').trim();
  if (!resi || resi === '-') {
    return;
  }

  // 1. Tentukan tanggal mutasi:
  // Tanggal stok in/out sesuai tanggal print alamat jika ada, fallback ke printStatusBadge, atau tanggal resi diisi
  const printText =
    (order.printDate || '').trim() ||
    (order.printStatusBadge?.text || '').trim() ||
    (order.alamat?.badgeDate || '').trim();

  const isPrinted =
    Boolean(printText) &&
    !printText.toLowerCase().includes('belum') &&
    printText !== '-';

  let stockDate = '';
  if (isPrinted) {
    stockDate = printText;
  } else if (tanggalResiDiisi && tanggalResiDiisi.trim() !== '' && tanggalResiDiisi.trim() !== '-') {
    stockDate = tanggalResiDiisi.trim();
  } else {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const now = new Date();
    stockDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  }

  // Tentukan container dan lokasi asal stock out (default "Rak", atau sesuai pilihan user pada print alamat)
  const defaultOption = getAllSalurContainerOptions();
  const chosenContainer = (order.stockOutContainer || 'Rak').trim();
  let chosenLokasi = (order.stockOutLokasi || '').trim();
  if (!chosenLokasi) {
    const matchOpt = defaultOption.find(
      (opt) => opt.container.toLowerCase() === chosenContainer.toLowerCase()
    );
    chosenLokasi = matchOpt ? matchOpt.lokasi : 'Kantor Bandung';
  }

  // 2. Cek apakah sudah pernah tercatat sebelumnya untuk order ini (cocokkan secara ketat dengan orderId unik)
  const currentRecords = getStoredStockInOutSalur();
  const existingForOrder = currentRecords.filter((r) => r.orderId === order.id);

  if (existingForOrder.length > 0) {
    // Perbarui nomor resi & tanggal jika ada perubahan
    let isChanged = false;
    const updatedRecords = currentRecords.map((r) => {
      if (r.orderId === order.id) {
        isChanged = true;
        const contChanged = r.sumberContainer !== chosenContainer || r.sumberLokasi !== chosenLokasi;
        if (contChanged) {
          // Rollback mutasi lama dan terapkan mutasi baru pada container yang baru dipilih
          rollbackStockMovement(r);
        }

        const updatedRec: StockInOutSalurRecord = {
          ...r,
          tanggal: isPrinted ? printText : r.tanggal || stockDate,
          sumberContainer: chosenContainer,
          sumberLokasi: chosenLokasi,
          noResi: resi,
          tujuanContainer: '-',
          tujuanLokasi: '-',
          jenisPerubahan: 'Penjualan',
          keterangan: `Penjualan ${order.orderNumber ? `No. Pesanan ${order.orderNumber}` : ''} - Resi: ${resi}`.trim(),
        };

        if (contChanged) {
          applyStockMovement(updatedRec);
        }

        return updatedRec;
      }
      return r;
    });
    if (isChanged) {
      saveStoredStockInOutSalur(updatedRecords);
    }
    return;
  }

  // 3. Tambahkan catatan mutasi baru untuk setiap item dalam order
  const orderItems =
    order.items && order.items.length > 0
      ? order.items
      : [{ id: 'item-default', productId: 'book-default', title: 'Item S-SALUR', quantity: 1 }];

  const newRecords: StockInOutSalurRecord[] = [];

  orderItems.forEach((it, idx) => {
    const qty = Number(it.quantity) || 1;
    const title = it.title?.trim() || 'Item S-SALUR';

    const newRec: StockInOutSalurRecord = {
      id: `stock-io-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      tanggal: stockDate,
      sumberContainer: chosenContainer,
      sumberLokasi: chosenLokasi,
      namaItem: title,
      jumlah: qty,
      tujuanContainer: '-',
      tujuanLokasi: '-',
      jenisPerubahan: 'Penjualan',
      keterangan: `Penjualan ${order.orderNumber ? `No. Pesanan ${order.orderNumber}` : ''} - Resi: ${resi}`.trim(),
      orderId: order.id,
      orderNumber: order.orderNumber,
      noResi: resi,
    };

    newRecords.push(newRec);
    applyStockMovement(newRec);
  });

  const updatedRecords = [...newRecords, ...currentRecords];
  saveStoredStockInOutSalur(updatedRecords);
}

/**
 * Memperbarui tanggal catatan Stock In/Out saat pesanan dicetak (print alamat / surat jalan)
 */
export function updateStockInOutPrintDate(
  orderId: string,
  newPrintDate: string
): void {
  if (!newPrintDate || newPrintDate.toLowerCase().includes('belum')) return;
  const currentRecords = getStoredStockInOutSalur();
  let changed = false;
  const updated = currentRecords.map((r) => {
    if (r.orderId === orderId) {
      changed = true;
      return {
        ...r,
        tanggal: newPrintDate,
      };
    }
    return r;
  });
  if (changed) {
    saveStoredStockInOutSalur(updated);
  }
}

// -------------------------------------------------------------
// JENIS PERUBAHAN STOCK IN/OUT STOK ITEM S-SALUR DATA
// -------------------------------------------------------------

export interface JenisPerubahanStockSalur {
  id: string;
  jenisPerubahan: string;
  keterangan: string;
}

export const JENIS_PERUBAHAN_SALUR_STORAGE_KEY = 'yppln_jenis_perubahan_salur_data';

export const INITIAL_JENIS_PERUBAHAN_SALUR: JenisPerubahanStockSalur[] = [
  {
    id: 'jp-1',
    jenisPerubahan: 'Buku Masuk',
    keterangan: '-',
  },
  {
    id: 'jp-2',
    jenisPerubahan: 'Penjualan',
    keterangan: 'R. dari Transaksi',
  },
  {
    id: 'jp-3',
    jenisPerubahan: 'Pindah Rak',
    keterangan: '-',
  },
  {
    id: 'jp-4',
    jenisPerubahan: 'Pindah Stock',
    keterangan: '-',
  },
  {
    id: 'jp-5',
    jenisPerubahan: 'Kerja Sama Agen Purna',
    keterangan: '-',
  },
  {
    id: 'jp-6',
    jenisPerubahan: 'Acara Stand',
    keterangan: '-',
  },
  {
    id: 'jp-7',
    jenisPerubahan: 'Retur',
    keterangan: 'Kalau orang balikin cuma kita ga nemu transaksinya',
  },
  {
    id: 'jp-8',
    jenisPerubahan: 'Nemu',
    keterangan: 'Kalau tiba-tiba nemu buku tersebut dmn',
  },
  {
    id: 'jp-9',
    jenisPerubahan: 'Hilang',
    keterangan: 'Kalau hilang di stand',
  },
  {
    id: 'jp-10',
    jenisPerubahan: 'Selisih',
    keterangan: 'Kalau di gudang bukunya selisih (kurang atau tambah)',
  },
  {
    id: 'jp-11',
    jenisPerubahan: 'Cetak Baru',
    keterangan: 'Pemasukan stok dari hasil cetak baru percetakan',
  },
];

export function getStoredJenisPerubahanSalur(): JenisPerubahanStockSalur[] {
  try {
    const saved = localStorage.getItem(JENIS_PERUBAHAN_SALUR_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure 'Cetak Baru' exists
        const hasCetakBaru = parsed.some(
          (jp: JenisPerubahanStockSalur) =>
            jp.jenisPerubahan.toLowerCase() === 'cetak baru'
        );
        if (!hasCetakBaru) {
          const updated = [
            ...parsed,
            {
              id: 'jp-11',
              jenisPerubahan: 'Cetak Baru',
              keterangan: 'Pemasukan stok dari hasil cetak baru percetakan',
            },
          ];
          saveStoredJenisPerubahanSalur(updated);
          return updated;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored JenisPerubahanSalur:', e);
  }
  return INITIAL_JENIS_PERUBAHAN_SALUR;
}

export function saveStoredJenisPerubahanSalur(items: JenisPerubahanStockSalur[]): void {
  try {
    localStorage.setItem(JENIS_PERUBAHAN_SALUR_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving JenisPerubahanSalur:', e);
  }
}

export function addJenisPerubahanSalur(item: Omit<JenisPerubahanStockSalur, 'id'>): JenisPerubahanStockSalur {
  const current = getStoredJenisPerubahanSalur();
  const newItem: JenisPerubahanStockSalur = {
    id: `jp-${Date.now()}`,
    ...item,
  };
  const updated = [newItem, ...current];
  saveStoredJenisPerubahanSalur(updated);
  return newItem;
}

export function updateJenisPerubahanSalur(item: JenisPerubahanStockSalur): void {
  const current = getStoredJenisPerubahanSalur();
  const updated = current.map((x) => (x.id === item.id ? item : x));
  saveStoredJenisPerubahanSalur(updated);
}

export function deleteJenisPerubahanSalur(id: string): void {
  const current = getStoredJenisPerubahanSalur();
  const updated = current.filter((x) => x.id !== id);
  saveStoredJenisPerubahanSalur(updated);
}


