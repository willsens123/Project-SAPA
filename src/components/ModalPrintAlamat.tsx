import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, MoreVertical, X, Printer, Boxes, ChevronDown, Check } from 'lucide-react';
import { SalurOrder, formatCurrentDate } from '../salurData';
import { BookCover } from './BookCover';
import { getAllSalurContainerOptions, SalurContainerOption } from '../stokSalurData';
import { formatDisplayKodeTransaksi } from '../utils/kodeTransaksiHelper';

interface ModalPrintAlamatProps {
  isOpen: boolean;
  onClose: () => void;
  orders: SalurOrder[];
  onShowToast?: (msg: string) => void;
  onConfirmPrint?: (
    printedOrderIds: string[],
    printDate: string,
    stockOutContainer?: string,
    stockOutLokasi?: string
  ) => void;
}

export const ModalPrintAlamat: React.FC<ModalPrintAlamatProps> = ({
  isOpen,
  onClose,
  orders,
  onShowToast = (_msg: string) => {},
  onConfirmPrint,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>(() =>
    orders.map((o) => o.id)
  );

  // Stock Out container options (Default: auto input "Rak")
  const containerOptions = useMemo<SalurContainerOption[]>(() => {
    return getAllSalurContainerOptions();
  }, []);

  const [selectedContainer, setSelectedContainer] = useState<string>('Rak');
  const [selectedLokasi, setSelectedLokasi] = useState<string>('Kantor Bandung');
  const [isContainerDropdownOpen, setIsContainerDropdownOpen] = useState(false);

  // Filter orders by search query
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter((order) => {
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      const matchCustomer = (order.idPembeli || order.customerId || '').toLowerCase().includes(q);
      const matchPenerima = (order.idPenerima || order.customerCode || '').toLowerCase().includes(q);
      const matchRecipient = order.alamat.recipientName.toLowerCase().includes(q);
      const matchStreet = order.alamat.street.toLowerCase().includes(q);
      const matchCourier = (order.ekspedisi.name || '').toLowerCase().includes(q);
      const matchBooks = order.items.some((it) => it.title.toLowerCase().includes(q));
      return (
        matchNumber ||
        matchCustomer ||
        matchPenerima ||
        matchRecipient ||
        matchStreet ||
        matchCourier ||
        matchBooks
      );
    });
  }, [orders, searchQuery]);

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Compute aggregated book totals from selected orders (or all if none selected)
  const activeOrdersForSummary = useMemo(() => {
    const active = orders.filter((o) => selectedOrderIds.includes(o.id));
    return active.length > 0 ? active : orders;
  }, [orders, selectedOrderIds]);

  const aggregatedBooks = useMemo(() => {
    const map = new Map<
      string,
      {
        title: string;
        price: number;
        totalQuantity: number;
        coverKey?: any;
        imageUrl?: string;
      }
    >();

    for (const order of activeOrdersForSummary) {
      for (const item of order.items) {
        const key = item.title;
        if (!map.has(key)) {
          map.set(key, {
            title: item.title,
            price: item.price,
            totalQuantity: item.quantity,
            coverKey: item.coverKey,
            imageUrl: item.imageUrl,
          });
        } else {
          const cur = map.get(key)!;
          cur.totalQuantity += item.quantity;
        }
      }
    }

    return Array.from(map.values());
  }, [activeOrdersForSummary]);

  const handlePrint = () => {
    const targetIds = selectedOrderIds.length > 0 ? selectedOrderIds : orders.map((o) => o.id);
    const count = targetIds.length;
    const printDate = formatCurrentDate();
    if (onConfirmPrint) {
      onConfirmPrint(targetIds, printDate, selectedContainer, selectedLokasi);
    }
    onShowToast(
      `Mencetak label alamat untuk ${count} pesanan (${printDate}) • Stock Out: ${selectedContainer}...`
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="modal-print-alamat-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Outer Card matching image.png */}
      <div
        id="modal-print-alamat-content"
        className="relative w-full max-w-6xl bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-4 sm:p-6 md:p-8 flex flex-col gap-4 max-h-[94vh] overflow-y-auto"
      >
        {/* Top Header Row with Title and Close Button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800">
              Daftar Pesanan untuk Dicetak Alamat
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-medium">
              {filteredOrders.length} Pesanan
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* "Stock Out dari:" Selector with auto-input "Rak" */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-full px-3 py-1 relative">
              <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                Stock Out dari:
              </span>
              <div className="relative">
                <button
                  type="button"
                  id="btn-stock-out-container-picker"
                  onClick={() => setIsContainerDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-white border border-[#008d91]/40 text-[#008d91] hover:bg-[#008d91]/5 transition-colors cursor-pointer shadow-2xs"
                  title="Pilih Container Stok Sumber"
                >
                  <Boxes className="w-3.5 h-3.5 text-[#008d91]" />
                  <span>{selectedContainer}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isContainerDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                      <span>Pilih Container Stok</span>
                      <span className="text-[10px] text-[#008d91] font-medium lowercase">auto: Rak</span>
                    </div>
                    <div className="max-h-56 overflow-y-auto py-1">
                      {containerOptions.map((opt) => {
                        const isSelected = selectedContainer === opt.container;
                        return (
                          <button
                            key={opt.container}
                            type="button"
                            onClick={() => {
                              setSelectedContainer(opt.container);
                              setSelectedLokasi(opt.lokasi);
                              setIsContainerDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                              isSelected ? 'text-[#008d91] font-semibold bg-emerald-50/60' : 'text-slate-700'
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="font-medium">{opt.container}</span>
                              <span className="text-[10px] text-slate-400">{opt.lokasi}</span>
                            </div>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[#008d91]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              id="btn-execute-print-alamat"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full bg-[#008d91] hover:bg-[#00787c] text-white shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Alamat</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Subtle Divider */}
        <div className="border-b border-slate-200 -mt-1" />

        {/* Sub-header row: Search Input (left) and Filter & Urutkan (right) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          {/* Search Here Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-print-alamat"
              type="text"
              placeholder="Search here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-full text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#008d91] focus:ring-1 focus:ring-[#008d91]"
            />
          </div>

          {/* Filter & Urutkan Button */}
          <button
            type="button"
            onClick={() => onShowToast('Filter & Pengurutan alamat pesanan')}
            className="flex items-center gap-1.5 text-xs font-normal text-slate-600 bg-white border border-slate-200 hover:border-slate-300 rounded-full px-4 py-1.5 transition-colors cursor-pointer self-end sm:self-auto shadow-2xs"
          >
            <SlidersHorizontal className="w-3 h-3 text-slate-500" />
            <span>Filter & Urutkan</span>
          </button>
        </div>

        {/* Column Labels: Alamat & Buku */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-[12px] font-medium text-slate-500 pt-1 pb-1.5 border-b border-slate-100">
          <div className="lg:col-span-8 flex items-center">
            <div className="w-1/2 sm:w-7/12 pl-2">Alamat</div>
            <div className="w-1/2 sm:w-5/12 pl-4">Buku</div>
          </div>
          <div className="hidden lg:block lg:col-span-4 pl-3">
            Ringkasan Item
          </div>
        </div>

        {/* Main Content Grid matching image.png */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Orders to Print (Span 8) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-8 text-center text-slate-400 text-sm">
                Tidak ada pesanan yang sesuai pencarian.
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isChecked = selectedOrderIds.includes(order.id);
                const isRedBadge =
                  order.printStatusBadge?.type === 'red' ||
                  order.printStatusBadge?.text?.includes('Nov');

                return (
                  <div
                    key={order.id}
                    id={`print-card-${order.id}`}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow p-4 sm:p-5 flex flex-col gap-3.5"
                  >
                    {/* Top Order Metadata Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2 text-xs text-slate-700 flex-wrap">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="w-4 h-4 rounded text-[#008d91] focus:ring-[#008d91] border-slate-300 cursor-pointer accent-[#008d91]"
                        />
                        <span className="font-normal text-slate-600">Status Pesanan</span>
                        <span className="text-slate-300">/</span>
                        <span className="font-medium text-[#008d91]">{formatDisplayKodeTransaksi('S', order)}</span>
                        <span className="text-slate-300">/</span>
                        <span className="font-normal text-slate-700">
                          {order.idPembeli || order.customerId}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="font-normal text-slate-700">
                          {order.idPenerima || order.customerCode}
                        </span>
                        <span className="text-slate-300">/</span>
                        <span className="font-normal text-slate-700">{order.date}</span>
                      </div>

                      {/* Right Badge */}
                      <span
                        className={`px-3.5 py-1 text-xs font-semibold rounded-full text-white shadow-2xs ${
                          isRedBadge ? 'bg-[#f87171]' : 'bg-[#008d91]'
                        }`}
                      >
                        {order.printStatusBadge?.text || 'Belum diprint'}
                      </span>
                    </div>

                    {/* Body: Alamat (Left) and Buku (Right) */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start pt-1">
                      {/* Left: Alamat (Span 7) */}
                      <div className="sm:col-span-7 flex flex-col text-slate-700 pr-2">
                        <div className="text-[15px] font-normal text-slate-800 leading-snug">
                          {order.alamat.recipientName}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          {order.alamat.phone}
                        </div>
                        <div className="text-sm text-slate-600 mt-1.5 leading-relaxed">
                          {order.alamat.street}
                        </div>
                        <div className="text-sm font-normal text-slate-800 mt-2.5">
                          {order.ekspedisi.name}
                        </div>
                      </div>

                      {/* Right: Buku (Span 5) */}
                      <div className="sm:col-span-5 flex flex-col gap-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="flex items-start justify-between gap-2.5"
                          >
                            <div className="flex items-start gap-3">
                              <BookCover
                                coverKey={item.coverKey}
                                size="md"
                                className="rounded-xl shadow-xs"
                              />
                              <div className="flex flex-col">
                                <h3 className="text-sm font-semibold text-slate-800 leading-snug">
                                  {item.title}
                                </h3>
                                <span className="text-xs text-slate-500 mt-1">
                                  {item.quantity} x Rp{item.price.toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => onShowToast(`Opsi buku: ${item.title}`)}
                              className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                              title="Opsi"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Aggregated Items Summary Card (Span 4) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-5 flex flex-col gap-4 sticky top-4">
            {aggregatedBooks.length === 0 ? (
              <div className="text-slate-400 text-xs text-center py-6">
                Pilih pesanan untuk melihat ringkasan buku.
              </div>
            ) : (
              aggregatedBooks.map((book, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 border-b border-slate-100 last:border-0 pb-3 last:pb-0"
                >
                  <div className="flex items-start gap-3.5">
                    <BookCover
                      coverKey={book.coverKey}
                      size="md"
                      className="rounded-xl shadow-xs"
                    />
                    <div className="flex flex-col">
                      <h4 className="text-sm font-semibold text-slate-800 leading-snug">
                        {book.title}
                      </h4>
                      <span className="text-xs sm:text-sm text-slate-500 mt-1">
                        {book.totalQuantity} x Rp{book.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onShowToast(`Opsi ringkasan: ${book.title}`)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                    title="Opsi"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
