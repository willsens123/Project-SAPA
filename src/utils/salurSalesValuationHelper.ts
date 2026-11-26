import { jsPDF } from 'jspdf';
import { SalurOrder, SalurProduct } from '../salurData';
import {
  INITIAL_MODAL_SALUR_ITEMS,
  MODAL_SALUR_STORAGE_KEY,
  ModalSalurItem,
} from '../modalSalurData';
import {
  getStoredStokSalurItems,
  normalizeSalurItemTitle,
  StokSalurItem,
} from '../stokSalurData';
import { formatIsoDateIndo, isDateInRange } from './financialDateFilter';

export type CostValuationMethod = 'weighted_batch' | 'estimated_ratio' | 'free_item_est';
export type StockHealthStatus = 'habis' | 'menipis' | 'aman' | 'digital';

export interface SalurModalBatchDetail {
  id: string;
  tahun: string;
  jml: number;
  totalModalRp: number;
  unitCostRp: number;
  royalti: string;
  mutasiCode?: string;
}

export interface SalurContainerStockDetail {
  lokasiGudang: string;
  jenisLokasi: string;
  namaContainer: string;
  stok: number;
  valuasiModalRp: number;
  potensiRitelRp: number;
}

export interface SalurOrderLineSample {
  orderId: string;
  orderNumber: string;
  date: string;
  customer: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  category: 'paid' | 'piutang' | 'hadiah';
}

export interface SalurItemSalesValuationRow {
  productId: string;
  title: string;
  subtitle: string;
  code: string;
  subJenis: string;
  coverKey?: SalurProduct['coverKey'];
  hargaJual: number;
  isDigital: boolean;

  // Cost / Modal per unit (Weighted average across batches or fallback estimate)
  unitCostRp: number;
  costMethod: CostValuationMethod;
  costMethodLabel: string;
  totalModalBatchQty: number;
  totalModalBatchRp: number;
  modalBatches: SalurModalBatchDetail[];

  // Current Stock & Valuation
  stokUnit: number;
  valuasiStokModalRp: number;
  potensiNilaiRitelRp: number;
  potensiMarginStokRp: number;
  stockHealth: StockHealthStatus;
  containerBreakdown: SalurContainerStockDetail[];

  // Sales & Distribution Breakdown
  qtyPaid: number;
  omzetPaidRp: number;
  hppPaidRp: number;
  labaKotorPaidRp: number;
  marginPaidPersen: number;

  qtyBelumBayar: number;
  piutangRp: number;
  hppBelumBayarRp: number;

  qtyHadiah: number;
  nilaiRitelHadiahRp: number;
  bebanModalHadiahRp: number;

  totalQtyKeluar: number;
  netKontribusiRp: number; // labaKotorPaidRp - bebanModalHadiahRp
  orderSamples: SalurOrderLineSample[];
}

export interface WarehouseValuationSummary {
  lokasiGudang: string;
  jenisLokasi: string;
  jumlahJudul: number;
  jumlahContainer: number;
  totalUnit: number;
  valuasiModalRp: number;
  potensiRitelRp: number;
  potensiMarginRp: number;
  lowStockItemCount: number;
  outOfStockItemCount: number;
  items: Array<{
    productId: string;
    title: string;
    subJenis: string;
    namaContainer: string;
    stok: number;
    unitCostRp: number;
    valuasiModalRp: number;
    potensiRitelRp: number;
    stockHealth: StockHealthStatus;
  }>;
}

export interface SalurSalesValuationTotals {
  totalSkuCount: number;
  physicalSkuCount: number;
  totalStokUnit: number;
  totalValuasiModalRp: number;
  totalPotensiRitelRp: number;
  totalPotensiMarginStokRp: number;

  qtyPaid: number;
  omzetPaidRp: number;
  hppPaidRp: number;
  labaKotorPaidRp: number;
  marginPaidPersen: number;

  qtyBelumBayar: number;
  piutangRp: number;

  qtyHadiah: number;
  bebanModalHadiahRp: number;
  nilaiRitelHadiahRp: number;

  netKontribusiRp: number;
  ongkirCollectedPaidRp: number;
  donasiExtraPaidRp: number;

  paidOrderCount: number;
  unpaidOrderCount: number;
  hadiahOrderCount: number;

  habisCount: number;
  menipisCount: number;
  amanCount: number;
  batchCostSkuCount: number;
  estimatedCostSkuCount: number;
}

export interface SalurSalesValuationResult {
  rows: SalurItemSalesValuationRow[];
  warehouses: WarehouseValuationSummary[];
  lowStockAlerts: SalurItemSalesValuationRow[];
  totals: SalurSalesValuationTotals;
}

export interface ComputeSalurValuationParams {
  salurItems: SalurProduct[];
  salurOrders: SalurOrder[];
  modalItems?: ModalSalurItem[];
  stokItems?: StokSalurItem[];
  startDate?: string;
  endDate?: string;
  fallbackCostRatioPct?: number; // e.g. 40% of selling price when no batch modal exists
  freeItemFallbackCostRp?: number; // e.g. Rp15.000 for free items without batch modal
  lowStockThreshold?: number; // e.g. 35 units
}

export function formatSalurRupiah(amount: number): string {
  const safe = Math.round(Number.isFinite(amount) ? amount : 0);
  const absFormatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(Math.abs(safe));
  return safe < 0 ? `-Rp${absFormatted}` : `Rp${absFormatted}`;
}

export function getStoredModalSalurItemsSafe(): ModalSalurItem[] {
  try {
    const raw = localStorage.getItem(MODAL_SALUR_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Gagal membaca ModalSalurItem dari localStorage:', err);
  }
  return INITIAL_MODAL_SALUR_ITEMS;
}

function isOrderPaid(order: SalurOrder): boolean {
  const ps = (order.paymentStatus || '').toLowerCase().trim();
  if (ps === 'paid' || ps === 'lunas') return true;
  if (Array.isArray(order.statusBadges)) {
    return order.statusBadges.some(
      (b) => typeof b === 'string' && ['paid', 'lunas'].includes(b.toLowerCase().trim())
    );
  }
  return false;
}

function normalizeWarehouseName(name?: string): string {
  const raw = (name || '').trim();
  if (!raw || raw === '-') return 'Gudang Belum Ditentukan';
  const lower = raw.toLowerCase();
  if (lower === 'rumah tsa-tsa') return 'Rumah Tsa-Tsa';
  if (lower === 'kantor bandung') return 'Kantor Bandung';
  if (lower === 'vihara vg') return 'Vihara VG';
  if (lower === 'perpustakaan steva') return 'Perpustakaan Steva';
  if (lower === 'stand') return 'Stand';
  return raw;
}

function parseOrderBreakdownAmount(text?: string): number {
  if (!text) return 0;
  const rpMatch = text.match(/rp\s*([\d.,]+)/i);
  const target = rpMatch ? rpMatch[1] : text;
  const digits = target.replace(/[^\d]/g, '');
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
}

function isDigitalSalurProduct(prod: Partial<SalurProduct>, stokItem?: StokSalurItem): boolean {
  const sub = `${prod.subJenis || ''} ${prod.subJenisItem || ''} ${prod.category || ''} ${
    stokItem?.subJenis || ''
  } ${prod.coverType || ''}`.toLowerCase();
  return (
    sub.includes('google books') ||
    sub.includes('e-book') ||
    sub.includes('ebook') ||
    sub.includes('digital')
  );
}

function findMatchingModalItem(
  productId: string,
  title: string,
  modalItems: ModalSalurItem[]
): ModalSalurItem | undefined {
  const normTitle = normalizeSalurItemTitle(title);
  const byId = modalItems.find((m) => m.productId && m.productId === productId);
  if (byId) return byId;
  return modalItems.find((m) => {
    const mNorm = normalizeSalurItemTitle(m.title);
    return mNorm === normTitle || (mNorm && normTitle && (mNorm.includes(normTitle) || normTitle.includes(mNorm)));
  });
}

function findMatchingStokItem(
  productId: string,
  title: string,
  code: string | undefined,
  stokItems: StokSalurItem[]
): StokSalurItem | undefined {
  const byId = stokItems.find((s) => s.productId && s.productId === productId);
  if (byId) return byId;
  const normTitle = normalizeSalurItemTitle(title);
  const byName = stokItems.find(
    (s) =>
      s.productId !== 'book-2-dup' &&
      normalizeSalurItemTitle(s.namaItem) === normTitle
  );
  if (byName) return byName;
  if (code) {
    const cleanCode = code.toLowerCase().trim();
    return stokItems.find(
      (s) => s.productId !== 'book-2-dup' && (s.subtitle || '').toLowerCase().includes(cleanCode)
    );
  }
  return undefined;
}

export function computeSalurSalesAndStockValuation(
  params: ComputeSalurValuationParams
): SalurSalesValuationResult {
  const {
    salurItems,
    salurOrders,
    modalItems: providedModalItems,
    stokItems: providedStokItems,
    startDate = '',
    endDate = '',
    fallbackCostRatioPct = 40,
    freeItemFallbackCostRp = 15000,
    lowStockThreshold = 35,
  } = params;

  const modalItems =
    providedModalItems && providedModalItems.length > 0
      ? providedModalItems
      : getStoredModalSalurItemsSafe();

  const stokItems =
    providedStokItems && providedStokItems.length > 0
      ? providedStokItems
      : getStoredStokSalurItems(salurItems);

  // Build unified product map starting from SalurProduct catalog
  const productMap = new Map<string, SalurProduct>();
  salurItems.forEach((item) => {
    productMap.set(item.id, item);
  });

  // Include any historical items present in orders that are not in current catalog
  const titleToProdId = new Map<string, string>();
  salurItems.forEach((p) => {
    titleToProdId.set(normalizeSalurItemTitle(p.title), p.id);
  });

  salurOrders.forEach((ord) => {
    (ord.items || []).forEach((it) => {
      const existingById = it.productId ? productMap.get(it.productId) : undefined;
      const existingIdByTitle = titleToProdId.get(normalizeSalurItemTitle(it.title));
      if (!existingById && !existingIdByTitle) {
        const fallbackId = it.productId || `hist-${normalizeSalurItemTitle(it.title)}`;
        if (!productMap.has(fallbackId)) {
          productMap.set(fallbackId, {
            id: fallbackId,
            title: it.title || 'Item S-SALUR',
            subtitle: it.subJenis || 'Item Arsip S-SALUR',
            price: Number(it.originalPrice || it.price) || 0,
            stock: 0,
            subJenis: it.subJenis || 'Item S-SALUR',
            coverKey: it.coverKey,
          });
          titleToProdId.set(normalizeSalurItemTitle(it.title), fallbackId);
        }
      }
    });
  });

  // Filter orders by date range
  const filteredOrders = salurOrders.filter((ord) =>
    isDateInRange(ord.date, startDate, endDate)
  );

  // Aggregate order metrics per resolved productId
  interface SalesBucket {
    qtyPaid: number;
    omzetPaidRp: number;
    qtyBelumBayar: number;
    piutangRp: number;
    qtyHadiah: number;
    nilaiRitelHadiahRp: number;
    samples: SalurOrderLineSample[];
  }
  const salesMap = new Map<string, SalesBucket>();

  const ensureBucket = (pid: string): SalesBucket => {
    let b = salesMap.get(pid);
    if (!b) {
      b = {
        qtyPaid: 0,
        omzetPaidRp: 0,
        qtyBelumBayar: 0,
        piutangRp: 0,
        qtyHadiah: 0,
        nilaiRitelHadiahRp: 0,
        samples: [],
      };
      salesMap.set(pid, b);
    }
    return b;
  };

  let paidOrderCount = 0;
  let unpaidOrderCount = 0;
  let hadiahOrderCount = 0;
  let ongkirCollectedPaidRp = 0;
  let donasiExtraPaidRp = 0;

  filteredOrders.forEach((ord) => {
    const isHadiah = Boolean(ord.isHadiah);
    const paid = isOrderPaid(ord);

    if (isHadiah) {
      hadiahOrderCount++;
    } else if (paid) {
      paidOrderCount++;
      ongkirCollectedPaidRp += parseOrderBreakdownAmount(ord.costBreakdown?.ongkir);
      donasiExtraPaidRp += parseOrderBreakdownAmount(ord.costBreakdown?.donasi);
    } else {
      unpaidOrderCount++;
    }

    const customerLabel =
      ord.idPembeli || ord.idPenerima || ord.alamat?.recipientName || 'Customer S-SALUR';

    (ord.items || []).forEach((it) => {
      const normTitle = normalizeSalurItemTitle(it.title);
      let resolvedId = it.productId && productMap.has(it.productId) ? it.productId : '';
      if (!resolvedId) {
        resolvedId = titleToProdId.get(normTitle) || '';
      }
      if (!resolvedId) {
        for (const [pNorm, pid] of titleToProdId.entries()) {
          if (pNorm && normTitle && (pNorm.includes(normTitle) || normTitle.includes(pNorm))) {
            resolvedId = pid;
            break;
          }
        }
      }
      if (!resolvedId) return;

      const prod = productMap.get(resolvedId);
      const qty = Math.max(0, Number(it.quantity) || 0);
      const unitPrice = Number(it.price) || 0;
      const lineTotal = qty * unitPrice;
      const retailUnitPrice = Number(it.originalPrice || it.price || prod?.price) || 0;

      const bucket = ensureBucket(resolvedId);

      if (isHadiah) {
        bucket.qtyHadiah += qty;
        bucket.nilaiRitelHadiahRp += qty * retailUnitPrice;
        bucket.samples.push({
          orderId: ord.id,
          orderNumber: ord.orderNumber,
          date: ord.date,
          customer: customerLabel,
          qty,
          unitPrice,
          lineTotal,
          category: 'hadiah',
        });
      } else if (paid) {
        bucket.qtyPaid += qty;
        bucket.omzetPaidRp += lineTotal;
        bucket.samples.push({
          orderId: ord.id,
          orderNumber: ord.orderNumber,
          date: ord.date,
          customer: customerLabel,
          qty,
          unitPrice,
          lineTotal,
          category: 'paid',
        });
      } else {
        bucket.qtyBelumBayar += qty;
        bucket.piutangRp += lineTotal;
        bucket.samples.push({
          orderId: ord.id,
          orderNumber: ord.orderNumber,
          date: ord.date,
          customer: customerLabel,
          qty,
          unitPrice,
          lineTotal,
          category: 'piutang',
        });
      }
    });
  });

  // Build rows & warehouse map
  const rows: SalurItemSalesValuationRow[] = [];
  const warehouseAccumMap = new Map<
    string,
    {
      lokasiGudang: string;
      jenisLokasi: string;
      productIds: Set<string>;
      containerKeys: Set<string>;
      totalUnit: number;
      valuasiModalRp: number;
      potensiRitelRp: number;
      lowStockIds: Set<string>;
      outOfStockIds: Set<string>;
      items: WarehouseValuationSummary['items'];
    }
  >();

  const ratioDecimal = Math.max(0, Math.min(100, fallbackCostRatioPct)) / 100;
  const safeFreeCost = Math.max(0, freeItemFallbackCostRp);
  const safeThreshold = Math.max(1, lowStockThreshold);

  Array.from(productMap.values()).forEach((prod) => {
    const stokItem = findMatchingStokItem(prod.id, prod.title, prod.code, stokItems);
    const modalItem = findMatchingModalItem(prod.id, prod.title, modalItems);
    const isDigital = isDigitalSalurProduct(prod, stokItem);
    const hargaJual = Math.max(0, Number(prod.price) || 0);

    // 1. Weighted average cost from all modal batches
    const batches: SalurModalBatchDetail[] = [];
    let batchQtySum = 0;
    let batchCostSum = 0;

    if (modalItem) {
      if (Array.isArray(modalItem.yearGroups) && modalItem.yearGroups.length > 0) {
        modalItem.yearGroups.forEach((yg) => {
          const ygQty = Number(yg.jml) || 0;
          const ygCost = Number(yg.yangKitaBayar) || 0;
          if (ygQty > 0 || ygCost > 0) {
            batchQtySum += ygQty;
            batchCostSum += ygCost;
            batches.push({
              id: yg.id,
              tahun: yg.tahun || '-',
              jml: ygQty,
              totalModalRp: ygCost,
              unitCostRp: ygQty > 0 ? Math.round(ygCost / ygQty) : 0,
              royalti: yg.royalti || modalItem.royalti || '-',
              mutasiCode: yg.mutasiCode,
            });
          }
        });
      }
      // Fallback to root aggregate if yearGroups were empty
      if (batchQtySum === 0 && (Number(modalItem.jml) || 0) > 0 && (Number(modalItem.yangKitaBayar) || 0) > 0) {
        batchQtySum = Number(modalItem.jml);
        batchCostSum = Number(modalItem.yangKitaBayar);
        batches.push({
          id: modalItem.id,
          tahun: modalItem.tahun || '-',
          jml: batchQtySum,
          totalModalRp: batchCostSum,
          unitCostRp: Math.round(batchCostSum / batchQtySum),
          royalti: modalItem.royalti || '-',
          mutasiCode: modalItem.mutasiSummaryText,
        });
      }
    }

    let unitCostRp = 0;
    let costMethod: CostValuationMethod = 'estimated_ratio';
    let costMethodLabel = `Estimasi ${Math.round(ratioDecimal * 100)}% Harga Jual`;

    if (batchQtySum > 0 && batchCostSum > 0) {
      unitCostRp = Math.round(batchCostSum / batchQtySum);
      costMethod = 'weighted_batch';
      costMethodLabel = `Rata-rata ${batches.length} Batch Modal`;
    } else if (hargaJual > 0) {
      unitCostRp = Math.round(hargaJual * ratioDecimal);
      costMethod = 'estimated_ratio';
      costMethodLabel = `Estimasi ${Math.round(ratioDecimal * 100)}% Harga Jual`;
    } else {
      unitCostRp = isDigital ? 0 : Math.round(safeFreeCost);
      costMethod = 'free_item_est';
      costMethodLabel = isDigital ? 'Produk Digital (Rp0)' : 'Estimasi Cetak Gratis';
    }

    // 2. Stock & container breakdown
    const containerBreakdown: SalurContainerStockDetail[] = [];
    let stokUnit = 0;

    if (!isDigital) {
      if (stokItem && Array.isArray(stokItem.containers) && stokItem.containers.length > 0) {
        stokItem.containers.forEach((c) => {
          const cStok = Math.max(0, Number(c.stok) || 0);
          const lokasi = normalizeWarehouseName(c.lokasiGudang);
          const jenisLokasi = c.jenisLokasi || 'Gudang YPPLN';
          const namaCont = (c.namaContainer || 'Container').trim();
          const valModal = cStok * unitCostRp;
          const potRitel = cStok * hargaJual;
          stokUnit += cStok;

          containerBreakdown.push({
            lokasiGudang: lokasi,
            jenisLokasi,
            namaContainer: namaCont,
            stok: cStok,
            valuasiModalRp: valModal,
            potensiRitelRp: potRitel,
          });
        });
      } else {
        const fallbackStok = Math.max(
          0,
          Number(stokItem?.stok ?? prod.stock) || 0
        );
        stokUnit = fallbackStok;
        if (fallbackStok > 0) {
          containerBreakdown.push({
            lokasiGudang: 'Gudang Utama (Belum Dialokasikan)',
            jenisLokasi: 'Gudang YPPLN',
            namaContainer: 'Stok Umum',
            stok: fallbackStok,
            valuasiModalRp: fallbackStok * unitCostRp,
            potensiRitelRp: fallbackStok * hargaJual,
          });
        }
      }
    }

    const valuasiStokModalRp = stokUnit * unitCostRp;
    const potensiNilaiRitelRp = stokUnit * hargaJual;
    const potensiMarginStokRp = potensiNilaiRitelRp - valuasiStokModalRp;

    let stockHealth: StockHealthStatus = 'aman';
    if (isDigital) {
      stockHealth = 'digital';
    } else if (stokUnit <= 0) {
      stockHealth = 'habis';
    } else if (stokUnit <= safeThreshold) {
      stockHealth = 'menipis';
    }

    // Register into warehouse accumulator
    containerBreakdown.forEach((cb) => {
      let wh = warehouseAccumMap.get(cb.lokasiGudang);
      if (!wh) {
        wh = {
          lokasiGudang: cb.lokasiGudang,
          jenisLokasi: cb.jenisLokasi,
          productIds: new Set(),
          containerKeys: new Set(),
          totalUnit: 0,
          valuasiModalRp: 0,
          potensiRitelRp: 0,
          lowStockIds: new Set(),
          outOfStockIds: new Set(),
          items: [],
        };
        warehouseAccumMap.set(cb.lokasiGudang, wh);
      }
      wh.productIds.add(prod.id);
      wh.containerKeys.add(`${cb.lokasiGudang}::${cb.namaContainer}`);
      wh.totalUnit += cb.stok;
      wh.valuasiModalRp += cb.valuasiModalRp;
      wh.potensiRitelRp += cb.potensiRitelRp;
      if (stockHealth === 'menipis') wh.lowStockIds.add(prod.id);
      if (stockHealth === 'habis') wh.outOfStockIds.add(prod.id);
      wh.items.push({
        productId: prod.id,
        title: prod.title,
        subJenis: prod.subJenis || prod.category || stokItem?.subJenis || 'Item S-SALUR',
        namaContainer: cb.namaContainer,
        stok: cb.stok,
        unitCostRp,
        valuasiModalRp: cb.valuasiModalRp,
        potensiRitelRp: cb.potensiRitelRp,
        stockHealth,
      });
    });

    // 3. Sales, HPP, Margin, Piutang, Hadiah
    const sb = salesMap.get(prod.id);
    const qtyPaid = sb?.qtyPaid || 0;
    const omzetPaidRp = sb?.omzetPaidRp || 0;
    const hppPaidRp = qtyPaid * unitCostRp;
    const labaKotorPaidRp = omzetPaidRp - hppPaidRp;
    const marginPaidPersen =
      omzetPaidRp > 0 ? Number(((labaKotorPaidRp / omzetPaidRp) * 100).toFixed(1)) : 0;

    const qtyBelumBayar = sb?.qtyBelumBayar || 0;
    const piutangRp = sb?.piutangRp || 0;
    const hppBelumBayarRp = qtyBelumBayar * unitCostRp;

    const qtyHadiah = sb?.qtyHadiah || 0;
    const nilaiRitelHadiahRp = sb?.nilaiRitelHadiahRp || 0;
    const bebanModalHadiahRp = qtyHadiah * unitCostRp;

    const totalQtyKeluar = qtyPaid + qtyBelumBayar + qtyHadiah;
    const netKontribusiRp = labaKotorPaidRp - bebanModalHadiahRp;

    rows.push({
      productId: prod.id,
      title: prod.title,
      subtitle: prod.subtitle || stokItem?.subtitle || '-',
      code: prod.code || '-',
      subJenis: prod.subJenis || stokItem?.subJenis || prod.category || 'Item S-SALUR',
      coverKey: prod.coverKey || stokItem?.coverKey,
      hargaJual,
      isDigital,
      unitCostRp,
      costMethod,
      costMethodLabel,
      totalModalBatchQty: batchQtySum,
      totalModalBatchRp: batchCostSum,
      modalBatches: batches,
      stokUnit,
      valuasiStokModalRp,
      potensiNilaiRitelRp,
      potensiMarginStokRp,
      stockHealth,
      containerBreakdown,
      qtyPaid,
      omzetPaidRp,
      hppPaidRp,
      labaKotorPaidRp,
      marginPaidPersen,
      qtyBelumBayar,
      piutangRp,
      hppBelumBayarRp,
      qtyHadiah,
      nilaiRitelHadiahRp,
      bebanModalHadiahRp,
      totalQtyKeluar,
      netKontribusiRp,
      orderSamples: (sb?.samples || []).slice(0, 60),
    });
  });

  // Convert warehouse accumulator to sorted array
  const warehouses: WarehouseValuationSummary[] = Array.from(warehouseAccumMap.values())
    .map((w) => ({
      lokasiGudang: w.lokasiGudang,
      jenisLokasi: w.jenisLokasi,
      jumlahJudul: w.productIds.size,
      jumlahContainer: w.containerKeys.size,
      totalUnit: w.totalUnit,
      valuasiModalRp: w.valuasiModalRp,
      potensiRitelRp: w.potensiRitelRp,
      potensiMarginRp: w.potensiRitelRp - w.valuasiModalRp,
      lowStockItemCount: w.lowStockIds.size,
      outOfStockItemCount: w.outOfStockIds.size,
      items: [...w.items].sort((a, b) => b.valuasiModalRp - a.valuasiModalRp),
    }))
    .sort((a, b) => b.valuasiModalRp - a.valuasiModalRp);

  // Low stock alerts (exclude digital items)
  const lowStockAlerts = rows
    .filter((r) => !r.isDigital && (r.stockHealth === 'habis' || r.stockHealth === 'menipis'))
    .sort((a, b) => a.stokUnit - b.stokUnit || b.totalQtyKeluar - a.totalQtyKeluar);

  // Totals
  const totalStokUnit = rows.reduce((s, r) => s + r.stokUnit, 0);
  const totalValuasiModalRp = rows.reduce((s, r) => s + r.valuasiStokModalRp, 0);
  const totalPotensiRitelRp = rows.reduce((s, r) => s + r.potensiNilaiRitelRp, 0);
  const totalPotensiMarginStokRp = totalPotensiRitelRp - totalValuasiModalRp;

  const qtyPaid = rows.reduce((s, r) => s + r.qtyPaid, 0);
  const omzetPaidRp = rows.reduce((s, r) => s + r.omzetPaidRp, 0);
  const hppPaidRp = rows.reduce((s, r) => s + r.hppPaidRp, 0);
  const labaKotorPaidRp = omzetPaidRp - hppPaidRp;
  const marginPaidPersen =
    omzetPaidRp > 0 ? Number(((labaKotorPaidRp / omzetPaidRp) * 100).toFixed(1)) : 0;

  const qtyBelumBayar = rows.reduce((s, r) => s + r.qtyBelumBayar, 0);
  const piutangRp = rows.reduce((s, r) => s + r.piutangRp, 0);

  const qtyHadiah = rows.reduce((s, r) => s + r.qtyHadiah, 0);
  const bebanModalHadiahRp = rows.reduce((s, r) => s + r.bebanModalHadiahRp, 0);
  const nilaiRitelHadiahRp = rows.reduce((s, r) => s + r.nilaiRitelHadiahRp, 0);

  const netKontribusiRp = labaKotorPaidRp - bebanModalHadiahRp;

  const totals: SalurSalesValuationTotals = {
    totalSkuCount: rows.length,
    physicalSkuCount: rows.filter((r) => !r.isDigital).length,
    totalStokUnit,
    totalValuasiModalRp,
    totalPotensiRitelRp,
    totalPotensiMarginStokRp,
    qtyPaid,
    omzetPaidRp,
    hppPaidRp,
    labaKotorPaidRp,
    marginPaidPersen,
    qtyBelumBayar,
    piutangRp,
    qtyHadiah,
    bebanModalHadiahRp,
    nilaiRitelHadiahRp,
    netKontribusiRp,
    ongkirCollectedPaidRp,
    donasiExtraPaidRp,
    paidOrderCount,
    unpaidOrderCount,
    hadiahOrderCount,
    habisCount: rows.filter((r) => r.stockHealth === 'habis').length,
    menipisCount: rows.filter((r) => r.stockHealth === 'menipis').length,
    amanCount: rows.filter((r) => r.stockHealth === 'aman').length,
    batchCostSkuCount: rows.filter((r) => r.costMethod === 'weighted_batch').length,
    estimatedCostSkuCount: rows.filter((r) => r.costMethod !== 'weighted_batch').length,
  };

  return {
    rows,
    warehouses,
    lowStockAlerts,
    totals,
  };
}

function escapeCsvCell(val: unknown): string {
  const s = String(val ?? '');
  if (s.includes('"') || s.includes(',') || s.includes(';') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function exportSalurSalesValuationCsv(
  rows: SalurItemSalesValuationRow[],
  warehouses: WarehouseValuationSummary[],
  totals: SalurSalesValuationTotals,
  periodLabel: string
): string {
  const lines: string[] = [];

  lines.push(['REKAP PENJUALAN & VALUASI STOK S-SALUR - YPPLN'].map(escapeCsvCell).join(','));
  lines.push(['Periode Penjualan', periodLabel].map(escapeCsvCell).join(','));
  lines.push(
    ['Omzet Penjualan Paid', totals.omzetPaidRp, 'Laba Kotor Paid', totals.labaKotorPaidRp, 'Valuasi Stok (Modal)', totals.totalValuasiModalRp]
      .map(escapeCsvCell)
      .join(',')
  );
  lines.push('');

  lines.push(
    [
      'Produk ID',
      'Nama Item',
      'Sub-Jenis',
      'Harga Jual',
      'Harga Modal/Unit',
      'Metode Harga Modal',
      'Stok Gudang (Unit)',
      'Status Stok',
      'Valuasi Stok (Modal Rp)',
      'Potensi Nilai Ritel (Rp)',
      'Terjual Paid (Unit)',
      'Omzet Paid (Rp)',
      'HPP Paid (Rp)',
      'Laba Kotor Paid (Rp)',
      'Margin (%)',
      'Piutang Belum Bayar (Unit)',
      'Piutang Belum Bayar (Rp)',
      'Item Hadiah (Unit)',
      'Beban Modal Hadiah (Rp)',
      'Kontribusi Bersih (Rp)',
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  rows.forEach((r) => {
    lines.push(
      [
        r.productId,
        r.title,
        r.subJenis,
        r.hargaJual,
        r.unitCostRp,
        r.costMethodLabel,
        r.stokUnit,
        r.stockHealth.toUpperCase(),
        r.valuasiStokModalRp,
        r.potensiNilaiRitelRp,
        r.qtyPaid,
        r.omzetPaidRp,
        r.hppPaidRp,
        r.labaKotorPaidRp,
        `${r.marginPaidPersen}%`,
        r.qtyBelumBayar,
        r.piutangRp,
        r.qtyHadiah,
        r.bebanModalHadiahRp,
        r.netKontribusiRp,
      ]
        .map(escapeCsvCell)
        .join(',')
    );
  });

  lines.push('');
  lines.push(['RINCIAN VALUASI PER LOKASI GUDANG'].map(escapeCsvCell).join(','));
  lines.push(
    [
      'Lokasi Gudang',
      'Jenis Lokasi',
      'Jumlah Judul',
      'Jumlah Container',
      'Total Unit',
      'Valuasi Modal (Rp)',
      'Potensi Ritel (Rp)',
      'Item Menipis',
      'Item Habis',
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  warehouses.forEach((w) => {
    lines.push(
      [
        w.lokasiGudang,
        w.jenisLokasi,
        w.jumlahJudul,
        w.jumlahContainer,
        w.totalUnit,
        w.valuasiModalRp,
        w.potensiRitelRp,
        w.lowStockItemCount,
        w.outOfStockItemCount,
      ]
        .map(escapeCsvCell)
        .join(',')
    );
  });

  const csvContent = `\uFEFF${lines.join('\n')}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const filename = `Rekap_Penjualan_Valuasi_Stok_SSALUR_${stamp}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return filename;
}

export function exportSalurSalesValuationPdf(
  rows: SalurItemSalesValuationRow[],
  warehouses: WarehouseValuationSummary[],
  totals: SalurSalesValuationTotals,
  periodLabel: string
): string {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;

  // Header
  doc.setFillColor(5, 130, 142);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Rekap Penjualan & Valuasi Stok S-SALUR — YPPLN', margin, 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    `Periode: ${periodLabel}  |  Dicetak: ${formatIsoDateIndo(
      new Date().toISOString().split('T')[0]
    )}`,
    margin,
    17
  );

  let y = 30;
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(
    `Omzet Paid: ${formatSalurRupiah(totals.omzetPaidRp)} (${totals.qtyPaid} unit)  |  Laba Kotor: ${formatSalurRupiah(
      totals.labaKotorPaidRp
    )} (${totals.marginPaidPersen}%)  |  Piutang: ${formatSalurRupiah(
      totals.piutangRp
    )}  |  Beban Hadiah: ${formatSalurRupiah(
      totals.bebanModalHadiahRp
    )}  |  Valuasi Stok Modal: ${formatSalurRupiah(totals.totalValuasiModalRp)} (${totals.totalStokUnit} unit)`,
    margin,
    y
  );
  y += 7;

  // Item Table Header
  const cols = [
    { label: 'Nama Item S-SALUR', x: margin, align: 'left' as const },
    { label: 'Modal/Unit', x: 105, align: 'right' as const },
    { label: 'Stok', x: 123, align: 'right' as const },
    { label: 'Valuasi Modal', x: 154, align: 'right' as const },
    { label: 'Paid (Unit)', x: 175, align: 'right' as const },
    { label: 'Omzet Paid', x: 206, align: 'right' as const },
    { label: 'Laba Kotor', x: 236, align: 'right' as const },
    { label: 'Piutang', x: 262, align: 'right' as const },
    { label: 'Hadiah', x: 285, align: 'right' as const },
  ];

  const drawItemHeader = (posY: number) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, posY - 4, pageWidth - margin * 2, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    cols.forEach((c) => doc.text(c.label, c.x, posY, { align: c.align }));
  };

  drawItemHeader(y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);

  rows.forEach((r) => {
    if (y > pageHeight - 16) {
      doc.addPage();
      y = 16;
      drawItemHeader(y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.8);
    }
    const shortTitle = r.title.length > 44 ? `${r.title.slice(0, 42)}..` : r.title;
    doc.text(shortTitle, cols[0].x, y);
    doc.text(formatSalurRupiah(r.unitCostRp), cols[1].x, y, { align: 'right' });
    doc.text(String(r.stokUnit), cols[2].x, y, { align: 'right' });
    doc.text(formatSalurRupiah(r.valuasiStokModalRp), cols[3].x, y, { align: 'right' });
    doc.text(String(r.qtyPaid), cols[4].x, y, { align: 'right' });
    doc.text(formatSalurRupiah(r.omzetPaidRp), cols[5].x, y, { align: 'right' });
    doc.text(formatSalurRupiah(r.labaKotorPaidRp), cols[6].x, y, { align: 'right' });
    doc.text(formatSalurRupiah(r.piutangRp), cols[7].x, y, { align: 'right' });
    doc.text(`${r.qtyHadiah}u`, cols[8].x, y, { align: 'right' });
    y += 5.4;
  });

  // Warehouse summary section
  y += 5;
  if (y > pageHeight - 36) {
    doc.addPage();
    y = 18;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Ringkasan Valuasi Aset Stok per Lokasi Gudang', margin, y);
  y += 6;

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y - 4, pageWidth - margin * 2, 6.5, 'F');
  doc.setFontSize(8);
  doc.text('Lokasi Gudang', margin, y);
  doc.text('Jenis', 85, y);
  doc.text('Judul', 128, y, { align: 'right' });
  doc.text('Container', 150, y, { align: 'right' });
  doc.text('Total Unit', 178, y, { align: 'right' });
  doc.text('Valuasi Modal', 224, y, { align: 'right' });
  doc.text('Potensi Ritel', 268, y, { align: 'right' });
  doc.text('Menipis/Habis', 285, y, { align: 'right' });
  y += 6;

  doc.setFont('helvetica', 'normal');
  warehouses.forEach((w) => {
    if (y > pageHeight - 14) {
      doc.addPage();
      y = 16;
    }
    doc.text(w.lokasiGudang, margin, y);
    doc.text(w.jenisLokasi, 85, y);
    doc.text(String(w.jumlahJudul), 128, y, { align: 'right' });
    doc.text(String(w.jumlahContainer), 150, y, { align: 'right' });
    doc.text(w.totalUnit.toLocaleString('id-ID'), 178, y, { align: 'right' });
    doc.text(formatSalurRupiah(w.valuasiModalRp), 224, y, { align: 'right' });
    doc.text(formatSalurRupiah(w.potensiRitelRp), 268, y, { align: 'right' });
    doc.text(`${w.lowStockItemCount}/${w.outOfStockItemCount}`, 285, y, { align: 'right' });
    y += 5.4;
  });

  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const filename = `Rekap_Penjualan_Valuasi_Stok_SSALUR_${stamp}.pdf`;
  doc.save(filename);
  return filename;
}
