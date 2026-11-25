import {
  getStoredGudangSalurData,
  getStoredStokSalurItems,
  isMatchingSalurItem,
} from '../stokSalurData';
import { SalurProduct } from '../salurData';

export const AUTO_CONTAINER_VALUE = 'AUTO';

export interface SelectableSalurContainerOption {
  value: string;
  container: string;
  lokasi: string;
  label: string;
  isAuto?: boolean;
}

export function encodeContainerChoice(container?: string, lokasi?: string): string {
  const c = (container || '').trim();
  if (!c || c.toUpperCase() === AUTO_CONTAINER_VALUE) {
    return AUTO_CONTAINER_VALUE;
  }
  const l = (lokasi || '').trim();
  return `${c}||${l}`;
}

export function decodeContainerChoice(value?: string): {
  isAuto: boolean;
  container: string;
  lokasi: string;
} {
  const v = (value || '').trim();
  if (!v || v.toUpperCase() === AUTO_CONTAINER_VALUE) {
    return { isAuto: true, container: AUTO_CONTAINER_VALUE, lokasi: '' };
  }
  const [container, lokasi] = v.split('||');
  return {
    isAuto: false,
    container: (container || '').trim(),
    lokasi: (lokasi || '').trim(),
  };
}

export function getSelectableSalurContainerOptions(): SelectableSalurContainerOption[] {
  const options: SelectableSalurContainerOption[] = [
    {
      value: AUTO_CONTAINER_VALUE,
      container: AUTO_CONTAINER_VALUE,
      lokasi: '',
      label: 'Otomatis (Kontainer Stok Terbanyak)',
      isAuto: true,
    },
  ];

  const seen = new Set<string>();
  const pushOpt = (container: string, lokasi: string) => {
    const c = (container || '').trim();
    const l = (lokasi || '').trim() || 'Kantor Bandung';
    if (!c) return;
    const key = `${c.toLowerCase()}||${l.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    options.push({
      value: encodeContainerChoice(c, l),
      container: c,
      lokasi: l,
      label: `${c} · ${l}`,
    });
  };

  pushOpt('Rak', 'Kantor Bandung');

  try {
    const gudangs = getStoredGudangSalurData();
    gudangs.forEach((g) => {
      (g.containers || []).forEach((c) => {
        pushOpt(c.namaContainer, c.lokasiGudang || g.namaLokasi);
      });
    });

    const items = getStoredStokSalurItems();
    items.forEach((it) => {
      (it.containers || []).forEach((c) => {
        pushOpt(c.namaContainer, c.lokasiGudang);
      });
    });
  } catch {
    // fallback safely
  }

  return options;
}

export interface ItemStockInspection {
  itemId: string;
  productId?: string;
  title: string;
  requestedQty: number;
  targetContainer: string;
  targetLokasi: string;
  containerStock: number;
  totalStock: number;
  isInsufficient: boolean;
  isOutOfStock: boolean;
}

export interface OrderStockInspectionResult {
  perItem: ItemStockInspection[];
  warnings: ItemStockInspection[];
  hasInsufficientStock: boolean;
}

export function inspectSalurOrderStock(
  items: Array<{ id?: string; productId?: string; title: string; quantity: number }>,
  selectedChoiceValue?: string,
  catalogProducts: SalurProduct[] = []
): OrderStockInspectionResult {
  const stokItems = getStoredStokSalurItems();
  const gudangs = getStoredGudangSalurData();
  const decoded = decodeContainerChoice(selectedChoiceValue);

  const perItem: ItemStockInspection[] = items.map((ordItem, idx) => {
    const qty = Math.max(1, Number(ordItem.quantity) || 1);
    const matchedStokItem = stokItems.find(
      (si) =>
        (ordItem.productId && si.productId === ordItem.productId) ||
        isMatchingSalurItem(si.namaItem, ordItem.title)
    );

    const catalogMatch = catalogProducts.find(
      (p) =>
        (ordItem.productId && p.id === ordItem.productId) ||
        isMatchingSalurItem(p.title, ordItem.title)
    );

    // Collect container stocks from StokSalurItem + Gudang fallback
    const candidateContainers: Array<{ container: string; lokasi: string; stok: number }> = [];
    if (matchedStokItem?.containers && matchedStokItem.containers.length > 0) {
      matchedStokItem.containers.forEach((c) => {
        candidateContainers.push({
          container: c.namaContainer,
          lokasi: c.lokasiGudang,
          stok: Number(c.stok) || 0,
        });
      });
    } else {
      gudangs.forEach((g) => {
        (g.containers || []).forEach((c) => {
          const itemInCont = (c.items || []).find(
            (ci) =>
              (ordItem.productId && ci.itemId === ordItem.productId) ||
              isMatchingSalurItem(ci.namaItem, ordItem.title)
          );
          if (itemInCont) {
            candidateContainers.push({
              container: c.namaContainer,
              lokasi: c.lokasiGudang || g.namaLokasi,
              stok: Number(itemInCont.stok) || 0,
            });
          }
        });
      });
    }

    const totalFromContainers = candidateContainers.reduce((acc, c) => acc + c.stok, 0);
    const totalStock =
      candidateContainers.length > 0
        ? totalFromContainers
        : matchedStokItem
        ? Number(matchedStokItem.stok) || 0
        : catalogMatch
        ? Number(catalogMatch.stock) || 0
        : 0;

    let targetContainer = 'Rak';
    let targetLokasi = 'Kantor Bandung';
    let containerStock = totalStock;

    if (decoded.isAuto) {
      if (candidateContainers.length > 0) {
        const sorted = [...candidateContainers].sort((a, b) => b.stok - a.stok);
        targetContainer = sorted[0].container;
        targetLokasi = sorted[0].lokasi;
        containerStock = sorted[0].stok;
      }
    } else {
      targetContainer = decoded.container;
      targetLokasi = decoded.lokasi || 'Kantor Bandung';
      const exactMatch = candidateContainers.find(
        (c) =>
          c.container.toLowerCase() === targetContainer.toLowerCase() &&
          (!decoded.lokasi || c.lokasi.toLowerCase() === decoded.lokasi.toLowerCase())
      );
      if (exactMatch) {
        containerStock = exactMatch.stok;
      } else if (candidateContainers.length > 0) {
        containerStock = 0;
      }
    }

    const isOutOfStock = containerStock <= 0;
    const isInsufficient = containerStock < qty;

    return {
      itemId: ordItem.id || `item-${idx}`,
      productId: ordItem.productId,
      title: ordItem.title,
      requestedQty: qty,
      targetContainer,
      targetLokasi,
      containerStock,
      totalStock,
      isInsufficient,
      isOutOfStock,
    };
  });

  const warnings = perItem.filter((it) => it.isInsufficient);
  return {
    perItem,
    warnings,
    hasInsufficientStock: warnings.length > 0,
  };
}
