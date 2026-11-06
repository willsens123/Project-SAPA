// Utility to generate realistic SVG receipts for demonstration and sample data

export function generateSampleReceiptSvg(options: {
  storeName: string;
  storeAddress?: string;
  storePhone?: string;
  invoiceNo: string;
  date: string;
  cashier: string;
  items: Array<{ name: string; qty: number; price: number }>;
  total: number;
  paymentMethod?: string;
  notes?: string;
  isPaid?: boolean;
}): string {
  const {
    storeName,
    storeAddress = 'Jl. Supratman No. 42, Bandung',
    storePhone = 'Telp: (022) 720-1923',
    invoiceNo,
    date,
    cashier,
    items,
    total,
    paymentMethod = 'TRANSFER / E-BANKING',
    notes = 'Terima kasih atas kunjungan Anda',
    isPaid = true,
  } = options;

  const formatRupiah = (val: number) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  const itemRowsSvg = items
    .map((item, idx) => {
      const y = 220 + idx * 36;
      return `
      <text x="30" y="${y}" font-family="Courier, monospace" font-size="13" font-weight="600" fill="#1e293b">${item.name}</text>
      <text x="30" y="${y + 16}" font-family="Courier, monospace" font-size="12" fill="#64748b">${item.qty} x ${formatRupiah(item.price)}</text>
      <text x="350" y="${y + 16}" text-anchor="end" font-family="Courier, monospace" font-size="13" font-weight="600" fill="#0f172a">${formatRupiah(item.qty * item.price)}</text>
    `;
    })
    .join('');

  const separatorY = 230 + items.length * 36;
  const totalY = separatorY + 30;
  const paymentY = totalY + 28;
  const notesY = paymentY + 45;
  const barcodeY = notesY + 35;
  const totalHeight = barcodeY + 90;

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 ${totalHeight}" width="100%" height="100%" style="background-color: #f8fafc; font-family: monospace;">
    <!-- Paper background with shadow -->
    <defs>
      <filter id="receipt-shadow" x="-5%" y="-2%" width="110%" height="105%" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-opacity="0.12" flood-color="#0f172a" />
      </filter>
    </defs>

    <g filter="url(#receipt-shadow)">
      <!-- Main Paper -->
      <path d="M 20 15 
               L 360 15 
               L 360 ${totalHeight - 20} 
               L 350 ${totalHeight - 12} 
               L 340 ${totalHeight - 20} 
               L 330 ${totalHeight - 12} 
               L 320 ${totalHeight - 20} 
               L 310 ${totalHeight - 12} 
               L 300 ${totalHeight - 20} 
               L 290 ${totalHeight - 12} 
               L 280 ${totalHeight - 20} 
               L 270 ${totalHeight - 12} 
               L 260 ${totalHeight - 20} 
               L 250 ${totalHeight - 12} 
               L 240 ${totalHeight - 20} 
               L 230 ${totalHeight - 12} 
               L 220 ${totalHeight - 20} 
               L 210 ${totalHeight - 12} 
               L 200 ${totalHeight - 20} 
               L 190 ${totalHeight - 12} 
               L 180 ${totalHeight - 20} 
               L 170 ${totalHeight - 12} 
               L 160 ${totalHeight - 20} 
               L 150 ${totalHeight - 12} 
               L 140 ${totalHeight - 20} 
               L 130 ${totalHeight - 12} 
               L 120 ${totalHeight - 20} 
               L 110 ${totalHeight - 12} 
               L 100 ${totalHeight - 20} 
               L 90 ${totalHeight - 12} 
               L 80 ${totalHeight - 20} 
               L 70 ${totalHeight - 12} 
               L 60 ${totalHeight - 20} 
               L 50 ${totalHeight - 12} 
               L 40 ${totalHeight - 20} 
               L 30 ${totalHeight - 12} 
               L 20 ${totalHeight - 20} Z" 
            fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    </g>

    <!-- Header -->
    <text x="190" y="48" text-anchor="middle" font-family="'Courier New', Courier, monospace" font-size="16" font-weight="bold" fill="#0f172a" letter-spacing="1.5">${storeName.toUpperCase()}</text>
    <text x="190" y="68" text-anchor="middle" font-family="'Courier New', Courier, monospace" font-size="11" fill="#64748b">${storeAddress}</text>
    <text x="190" y="84" text-anchor="middle" font-family="'Courier New', Courier, monospace" font-size="11" fill="#64748b">${storePhone}</text>

    <!-- Divider dashed -->
    <line x1="30" y1="102" x2="350" y2="102" stroke="#94a3b8" stroke-dasharray="4 3" stroke-width="1.2" />

    <!-- Meta Details -->
    <text x="30" y="125" font-family="Courier, monospace" font-size="11" fill="#475569">No. Struk</text>
    <text x="120" y="125" font-family="Courier, monospace" font-size="11" font-weight="600" fill="#0f172a">: ${invoiceNo}</text>

    <text x="30" y="145" font-family="Courier, monospace" font-size="11" fill="#475569">Tanggal</text>
    <text x="120" y="145" font-family="Courier, monospace" font-size="11" fill="#0f172a">: ${date}</text>

    <text x="30" y="165" font-family="Courier, monospace" font-size="11" fill="#475569">Kasir/PIC</text>
    <text x="120" y="165" font-family="Courier, monospace" font-size="11" fill="#0f172a">: ${cashier}</text>

    <!-- Divider dashed -->
    <line x1="30" y1="185" x2="350" y2="185" stroke="#94a3b8" stroke-dasharray="4 3" stroke-width="1.2" />

    <!-- Items -->
    ${itemRowsSvg}

    <!-- Total divider -->
    <line x1="30" y1="${separatorY}" x2="350" y2="${separatorY}" stroke="#94a3b8" stroke-dasharray="4 3" stroke-width="1.2" />

    <!-- Total Amount -->
    <text x="30" y="${totalY}" font-family="Courier, monospace" font-size="14" font-weight="bold" fill="#0f172a">TOTAL</text>
    <text x="350" y="${totalY}" text-anchor="end" font-family="Courier, monospace" font-size="16" font-weight="bold" fill="#008d91">${formatRupiah(total)}</text>

    <!-- Payment info -->
    <text x="30" y="${paymentY}" font-family="Courier, monospace" font-size="11" fill="#64748b">Metode</text>
    <text x="350" y="${paymentY}" text-anchor="end" font-family="Courier, monospace" font-size="11" font-weight="600" fill="#334155">${paymentMethod}</text>

    <!-- Stamp Lunas / Verified if paid -->
    ${
      isPaid
        ? `
      <g transform="translate(230, ${separatorY - 50}) rotate(-12)">
        <rect x="0" y="0" width="96" height="34" rx="6" fill="#008d91" fill-opacity="0.12" stroke="#008d91" stroke-width="2" stroke-dasharray="4 2" />
        <text x="48" y="22" text-anchor="middle" font-family="'Courier New', Courier, monospace" font-size="14" font-weight="bold" fill="#008d91" letter-spacing="1">LUNAS</text>
      </g>
    `
        : ''
    }

    <!-- Notes -->
    <text x="190" y="${notesY}" text-anchor="middle" font-family="'Courier New', Courier, monospace" font-size="11" fill="#64748b" font-style="italic">${notes}</text>

    <!-- Fake barcode lines -->
    <g transform="translate(60, ${barcodeY})">
      <rect x="0" y="0" width="3" height="35" fill="#1e293b" />
      <rect x="5" y="0" width="1.5" height="35" fill="#1e293b" />
      <rect x="9" y="0" width="4" height="35" fill="#1e293b" />
      <rect x="16" y="0" width="2" height="35" fill="#1e293b" />
      <rect x="20" y="0" width="5" height="35" fill="#1e293b" />
      <rect x="28" y="0" width="2" height="35" fill="#1e293b" />
      <rect x="33" y="0" width="3" height="35" fill="#1e293b" />
      <rect x="40" y="0" width="1" height="35" fill="#1e293b" />
      <rect x="44" y="0" width="4" height="35" fill="#1e293b" />
      <rect x="51" y="0" width="2" height="35" fill="#1e293b" />
      <rect x="56" y="0" width="6" height="35" fill="#1e293b" />
      <rect x="65" y="0" width="2" height="35" fill="#1e293b" />
      <rect x="70" y="0" width="4" height="35" fill="#1e293b" />
      <rect x="78" y="0" width="1" height="35" fill="#1e293b" />
      <rect x="82" y="0" width="5" height="35" fill="#1e293b" />
      <rect x="90" y="0" width="2" height="35" fill="#1e293b" />
      <rect x="95" y="0" width="4" height="35" fill="#1e293b" />
      <rect x="103" y="0" width="3" height="35" fill="#1e293b" />
      <rect x="109" y="0" width="1.5" height="35" fill="#1e293b" />
      <rect x="114" y="0" width="5" height="35" fill="#1e293b" />
      <rect x="122" y="0" width="2" height="35" fill="#1e293b" />
      <rect x="127" y="0" width="4" height="35" fill="#1e293b" />
      <rect x="134" y="0" width="1" height="35" fill="#1e293b" />
      <rect x="138" y="0" width="6" height="35" fill="#1e293b" />
      <rect x="147" y="0" width="3" height="35" fill="#1e293b" />
      <rect x="153" y="0" width="1.5" height="35" fill="#1e293b" />
      <rect x="158" y="0" width="4" height="35" fill="#1e293b" />
      <rect x="165" y="0" width="2" height="35" fill="#1e293b" />
      <rect x="170" y="0" width="5" height="35" fill="#1e293b" />
      <rect x="178" y="0" width="1" height="35" fill="#1e293b" />
      <rect x="182" y="0" width="4" height="35" fill="#1e293b" />
      <rect x="189" y="0" width="3" height="35" fill="#1e293b" />
      <rect x="195" y="0" width="6" height="35" fill="#1e293b" />
      <rect x="204" y="0" width="2" height="35" fill="#1e293b" />
      <rect x="209" y="0" width="4" height="35" fill="#1e293b" />
      <rect x="216" y="0" width="1.5" height="35" fill="#1e293b" />
      <rect x="221" y="0" width="5" height="35" fill="#1e293b" />
      <rect x="229" y="0" width="3" height="35" fill="#1e293b" />
      <rect x="235" y="0" width="2" height="35" fill="#1e293b" />
      <rect x="240" y="0" width="4" height="35" fill="#1e293b" />
      <rect x="247" y="0" width="3" height="35" fill="#1e293b" />
      <rect x="253" y="0" width="6" height="35" fill="#1e293b" />
      <text x="130" y="48" text-anchor="middle" font-family="'Courier New', Courier, monospace" font-size="9" fill="#94a3b8" letter-spacing="3">* ${invoiceNo} *</text>
    </g>
  </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Preset generator for default sample receipts
export function getPresetReceipt(no: string, keterangan: string, nominal: number, tanggal: string, pic: string): string {
  if (no === '185') {
    return generateSampleReceiptSvg({
      storeName: 'PERUMDA TIRTA RAHARJA',
      storeAddress: 'Jl. Kolonel Masturi No. 71, Bandung',
      storePhone: 'Call Center: (022) 665-2980',
      invoiceNo: 'PDAM-2021-11-0185',
      date: tanggal || '01/11/2021 09:14',
      cashier: pic || 'Agustino',
      items: [
        { name: 'Pemakaian Air PDAM Okt', qty: 1, price: 42000 },
        { name: 'Biaya Administrasi & Pemeliharaan', qty: 1, price: 6800 },
      ],
      total: nominal || 48800,
      paymentMethod: 'BCA Auto-Debet / Transfer',
      notes: 'Bukti Pembayaran Tagihan Air Sah',
      isPaid: true,
    });
  }

  if (no === '186') {
    return generateSampleReceiptSvg({
      storeName: 'MEGAVISION FIBER INTERNET',
      storeAddress: 'Jl. Dr. Setiabudi No. 128, Bandung',
      storePhone: 'Customer Care: (022) 204-1888',
      invoiceNo: 'INV-MV-2021-10-0186',
      date: tanggal || '30/10/2021 14:22',
      cashier: pic || 'Agustino',
      items: [
        { name: 'Internet Dedicated 50 Mbps Nov', qty: 1, price: 230364 },
        { name: 'PPN 10%', qty: 1, price: 23036 },
      ],
      total: nominal || 253400,
      paymentMethod: 'BCA Virtual Account',
      notes: 'Terima kasih telah berlangganan Megavision',
      isPaid: true,
    });
  }

  if (no === '187') {
    return generateSampleReceiptSvg({
      storeName: 'META ADS / FACEBOOK IRELAND',
      storeAddress: 'Grand Canal Square, Dublin 2, Ireland',
      storePhone: 'VAT: IE9692928F • VAT Invoice',
      invoiceNo: 'FB-ADS-2021-10-0187',
      date: tanggal || '29/10/2021 21:05',
      cashier: pic || 'Agustino',
      items: [
        { name: 'Instagram & FB Boost Post Kabar Dharma', qty: 1, price: 420909 },
        { name: 'PPN 10% (Pajak Pertambahan Nilai)', qty: 1, price: 42091 },
      ],
      total: nominal || 463000,
      paymentMethod: 'Kartu Kredit / Debit BCA',
      notes: 'Campaign: Giveaway Promosi Kabar Dharma',
      isPaid: true,
    });
  }

  if (no === '188') {
    return generateSampleReceiptSvg({
      storeName: 'TOKO ATK & PACKING SINAR MAKMUR',
      storeAddress: 'Jl. Cibadak No. 89, Bandung',
      storePhone: 'Telp: (022) 420-5512',
      invoiceNo: 'NOTA-SM-2021-10-0188',
      date: tanggal || '21/10/2021 11:30',
      cashier: pic || 'Karunika',
      items: [
        { name: 'Lakban Bening 1 inch (Daimaru)', qty: 24, price: 6320.83 },
      ],
      total: nominal || 151700,
      paymentMethod: 'Tunai / Kasbon Karunika',
      notes: 'Perlengkapan Pengiriman Buku Berbayar',
      isPaid: true,
    });
  }

  if (no === '190') {
    return generateSampleReceiptSvg({
      storeName: 'LAMSTORE ADVERTISING NETWORK',
      storeAddress: 'Gedung KCI Lt. 3, Jakarta',
      storePhone: 'Telp: (021) 582-0199',
      invoiceNo: 'ADS-LS-2021-11-0190',
      date: tanggal || '04/11/2021 10:00',
      cashier: pic || 'Vioni',
      items: [
        { name: 'Promosi Buku & Suvenir Ads Nov', qty: 1, price: 220000 },
      ],
      total: nominal || 220000,
      paymentMethod: 'BCA Transfer',
      notes: 'Campaign Ads Lamstore Nov 2021',
      isPaid: true,
    });
  }

  if (no === '191' || no === '192' || no === '193') {
    return generateSampleReceiptSvg({
      storeName: 'BUKTI TANDA TERIMA APRESIASI NARASUMBER',
      storeAddress: 'Yayasan Pelestarian & Pengembangan Lamrim Nusantara',
      storePhone: 'Sekretariat Event YPPLN',
      invoiceNo: `APR-HTW-2021-11-0${no}`,
      date: tanggal || '01/11/2021 16:30',
      cashier: pic || 'Agustino',
      items: [
        { name: keterangan || 'Apresiasi Buku Harta Tahta Wanita', qty: 1, price: nominal },
      ],
      total: nominal,
      paymentMethod: 'Transfer BCA 888 (Batch 191,192,193)',
      notes: 'Telah diserahterimakan kepada narasumber/moderator',
      isPaid: true,
    });
  }

  if (no === '195') {
    return generateSampleReceiptSvg({
      storeName: 'TOKO KERTAS & ATK JAYA ABADI',
      storeAddress: 'Jl. Astana Anyar No. 104, Bandung',
      storePhone: 'Telp: (022) 520-3341',
      invoiceNo: 'STRUK-JA-2021-11-0195',
      date: tanggal || '24/11/2021 13:45',
      cashier: pic || 'Karunika',
      items: [
        { name: 'Amplop Coklat Seal 1/2 Folio (Neuro)', qty: 4, price: 27555 },
      ],
      total: nominal || 110220,
      paymentMethod: 'Tunai Kasbon (Belum Reimburse Mutasi)',
      notes: 'Untuk packing kiriman buku berbayar',
      isPaid: true,
    });
  }

  // Generic fallback
  return generateSampleReceiptSvg({
    storeName: 'BUKTI PENGELUARAN BON / STRUK',
    storeAddress: 'Kantor Operasional YPPLN',
    storePhone: 'Verifikasi Keuangan Internal',
    invoiceNo: `BON-${no}-${Date.now().toString().slice(-4)}`,
    date: tanggal,
    cashier: pic || 'Staff',
    items: [
      { name: keterangan || 'Pengeluaran Operasional', qty: 1, price: nominal },
    ],
    total: nominal,
    paymentMethod: 'Kas / Transfer Rekening',
    notes: 'Bukti pengeluaran telah diarsipkan secara digital',
    isPaid: true,
  });
}
