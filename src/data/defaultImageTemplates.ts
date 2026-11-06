import { ImageOverlayField } from '../types';

// Default sample overlay fields matching "Contoh Tanda Terima Dharma Patron.png"
export const DEFAULT_DHARMA_PATRON_FIELDS: ImageOverlayField[] = [
  {
    id: 'f-nama',
    label: 'Nama Donatur / Penerima',
    tag: '[Nama Lengkap]',
    value: 'Enni Megawati',
    posX: 50,
    posY: 54.5,
    fontSize: 42,
    fontFamily: 'cursive',
    color: '#e53935', // Red from the screenshot
    isBold: true,
    isItalic: false,
    align: 'center',
  },
  {
    id: 'f-tanggal',
    label: 'Tanggal Terima',
    tag: '[Tanggal Terima]',
    value: '10 Januari 2025',
    posX: 40.5,
    posY: 62.4,
    fontSize: 20,
    fontFamily: 'sans',
    color: '#e53935',
    isBold: true,
    isItalic: false,
    align: 'left',
  },
  {
    id: 'f-jumlah',
    label: 'Jumlah Donasi',
    tag: '[Jumlah]',
    value: 'Rp50.000',
    posX: 40.5,
    posY: 65.5,
    fontSize: 20,
    fontFamily: 'sans',
    color: '#e53935',
    isBold: true,
    isItalic: false,
    align: 'left',
  },
  {
    id: 'f-bulan',
    label: 'Bulan Donasi',
    tag: '[Bulan Donasi]',
    value: 'Januari 2025',
    posX: 40.5,
    posY: 68.6,
    fontSize: 20,
    fontFamily: 'sans',
    color: '#e53935',
    isBold: true,
    isItalic: false,
    align: 'left',
  },
];

// High fidelity SVG data URI template reproducing "Template Tanda Terima Dharma Patron.png"
export const DHARMA_PATRON_SVG_TEMPLATE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1131" width="800" height="1131">
  <defs>
    <linearGradient id="hallGlow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8a532"/>
      <stop offset="40%" stop-color="#f37324"/>
      <stop offset="100%" stop-color="#2d1500"/>
    </linearGradient>
    <linearGradient id="tealGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#008d91"/>
      <stop offset="100%" stop-color="#00a3a7"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Background Base White -->
  <rect width="800" height="1131" fill="#ffffff"/>

  <!-- TOP PHOTO CONTAINER (Aspect ratio roughly 800x440) -->
  <g id="topPhoto">
    <rect width="800" height="440" fill="url(#hallGlow)"/>
    
    <!-- Background temple hall pillars and golden curtain draping -->
    <rect x="0" y="0" width="800" height="440" fill="#caa557" opacity="0.15"/>
    <path d="M 0 0 L 800 0 L 800 240 Q 400 280 0 240 Z" fill="#ebaa39" opacity="0.35"/>

    <!-- Decorative silhouettes representing group photo in dharma hall -->
    <g opacity="0.85">
      <!-- Golden Buddha altar in background -->
      <path d="M 360 140 Q 400 60 440 140 Q 450 190 350 190 Z" fill="#ffe277" opacity="0.6"/>
      <circle cx="400" cy="110" r="22" fill="#ffe277"/>

      <!-- Group silhouettes standing in dharma hall -->
      <!-- Back row -->
      <g fill="#422918" opacity="0.85">
        <circle cx="95" cy="130" r="28"/><rect x="65" y="160" width="60" height="130" rx="14"/>
        <circle cx="180" cy="135" r="26"/><rect x="152" y="163" width="56" height="127" rx="14"/>
        <circle cx="260" cy="138" r="27"/><rect x="232" y="167" width="56" height="123" rx="14"/>
        <circle cx="340" cy="142" r="26"/><rect x="312" y="170" width="56" height="120" rx="14"/>
        <circle cx="420" cy="140" r="27"/><rect x="392" y="169" width="56" height="121" rx="14"/>
        <circle cx="500" cy="138" r="27"/><rect x="472" y="167" width="56" height="123" rx="14"/>
        <circle cx="585" cy="135" r="26"/><rect x="557" y="163" width="56" height="127" rx="14"/>
        <circle cx="670" cy="132" r="27"/><rect x="642" y="161" width="56" height="129" rx="14"/>
        <circle cx="740" cy="130" r="28"/><rect x="710" y="160" width="60" height="130" rx="14"/>
      </g>
      <!-- Front row seated/kneeling -->
      <g fill="#31190c" opacity="0.95">
        <circle cx="140" cy="245" r="24"/><rect x="115" y="270" width="50" height="90" rx="12"/>
        <circle cx="215" cy="235" r="25"/><rect x="188" y="262" width="54" height="98" rx="12"/>
        <circle cx="295" cy="245" r="24"/><rect x="270" y="271" width="50" height="89" rx="12"/>
        <circle cx="370" cy="230" r="26"/><rect x="342" y="258" width="56" height="102" rx="12"/>
        <circle cx="445" cy="240" r="25"/><rect x="418" y="267" width="54" height="93" rx="12"/>
        <circle cx="525" cy="235" r="25"/><rect x="498" y="262" width="54" height="98" rx="12"/>
        <circle cx="600" cy="242" r="24"/><rect x="575" y="268" width="50" height="92" rx="12"/>
      </g>
    </g>

    <!-- Lamrimnesia Badge Top Left -->
    <rect x="25" y="16" width="108" height="24" rx="4" fill="#008d91"/>
    <text x="79" y="32" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" font-size="11" text-anchor="middle" letter-spacing="0.5">Lamrimnesia</text>

    <!-- Dark gradient overlay at bottom of photo for quote readability -->
    <rect x="0" y="310" width="800" height="130" fill="url(#hallGlow)" opacity="0.88"/>

    <!-- Left Avatar Circle -->
    <g transform="translate(68, 375)">
      <circle cx="0" cy="0" r="34" fill="#008d91" stroke="#ffffff" stroke-width="3"/>
      <circle cx="0" cy="0" r="29" fill="#fbd148"/>
      <!-- Smiling girl avatar -->
      <circle cx="0" cy="-2" r="16" fill="#fcd7b2"/>
      <ellipse cx="0" cy="-10" rx="18" ry="12" fill="#2d1c14"/>
      <circle cx="-5" cy="-2" r="2" fill="#222"/><circle cx="5" cy="-2" r="2" fill="#222"/>
      <path d="M -5 5 Q 0 9 5 5" stroke="#c0392b" stroke-width="2" fill="none"/>
    </g>

    <!-- Right Avatar Circle -->
    <g transform="translate(732, 375)">
      <circle cx="0" cy="0" r="34" fill="#fbd148" stroke="#ffffff" stroke-width="3"/>
      <circle cx="0" cy="0" r="29" fill="#f3842d"/>
      <!-- Smiling boy monk avatar -->
      <circle cx="0" cy="-2" r="16" fill="#fcd7b2"/>
      <circle cx="0" cy="-10" r="14" fill="#3a1c0d"/>
      <circle cx="-5" cy="-2" r="2" fill="#222"/><circle cx="5" cy="-2" r="2" fill="#222"/>
      <path d="M -5 5 Q 0 9 5 5" stroke="#c0392b" stroke-width="2" fill="none"/>
    </g>

    <!-- Inspirational Quote in photo -->
    <text x="400" y="352" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-style="italic" font-size="12" text-anchor="middle" font-weight="500">
      "Pada Buddha, Dharma, dan Sangha yang mulia, aku berlindung hingga aku mencapai pencerahan.
    </text>
    <text x="400" y="369" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-style="italic" font-size="12" text-anchor="middle" font-weight="500">
      Dengan praktik berdana dan paramita lain yang kulakukan, semoga aku mencapai Kebuddhaan demi kebaikan para makhluk."
    </text>
    <text x="400" y="388" fill="#e0e0e0" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" text-anchor="middle">
      - Bait Berlindung dan Membangkitkan Bodhicitta, Buku Kidung Manggala Bhakti -
    </text>
  </g>

  <!-- TEAL BANNER: TANDA TERIMA DHARMA PATRON -->
  <g id="tealBanner">
    <path d="M 0 440 Q 400 480 800 440 L 800 520 Q 400 560 0 520 Z" fill="url(#tealGrad)"/>
    <text x="400" y="500" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="33" text-anchor="middle" letter-spacing="1">
      TANDA TERIMA DHARMA PATRON
    </text>
  </g>

  <!-- MIDDLE DETAILS LABELS (Cleanly aligned) -->
  <g id="detailsLabels" fill="#008d91" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="20">
    <text x="390" y="706" text-anchor="end">Tanggal Terima:</text>
    <text x="390" y="741" text-anchor="end">Jumlah:</text>
    <text x="390" y="776" text-anchor="end">Bulan Donasi:</text>
  </g>

  <!-- BOTTOM SECTION -->
  <g id="bottomSection">
    <text x="400" y="855" fill="#008d91" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="21" text-anchor="middle">
      Turut bermudita atas partisipasi Anda
    </text>
    <text x="400" y="885" fill="#008d91" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="21" text-anchor="middle">
      sebagai Dharma Patron Lamrimnesia!
    </text>

    <!-- 4 Circular Badges -->
    <g transform="translate(400, 940)">
      <!-- Salur -->
      <g transform="translate(-66, 0)">
        <circle cx="0" cy="0" r="19" fill="#008d91" stroke="#ffffff" stroke-width="2"/>
        <text x="0" y="4" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="bold" text-anchor="middle">SALUR</text>
      </g>
      <!-- Ajar -->
      <g transform="translate(-22, 0)">
        <circle cx="0" cy="0" r="19" fill="#78be20" stroke="#ffffff" stroke-width="2"/>
        <text x="0" y="4" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="bold" text-anchor="middle">AJAR</text>
      </g>
      <!-- Promosi -->
      <g transform="translate(22, 0)">
        <circle cx="0" cy="0" r="19" fill="#e53935" stroke="#ffffff" stroke-width="2"/>
        <text x="0" y="4" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="7" font-weight="bold" text-anchor="middle">PROMOSI</text>
      </g>
      <!-- Ajak -->
      <g transform="translate(66, 0)">
        <circle cx="0" cy="0" r="19" fill="#0288d1" stroke="#ffffff" stroke-width="2"/>
        <text x="0" y="4" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="bold" text-anchor="middle">AJAK</text>
      </g>
    </g>

    <!-- Teal Framed Information Card at the bottom -->
    <rect x="115" y="942" width="570" height="154" rx="10" fill="none" stroke="#008d91" stroke-width="1.6"/>

    <text x="400" y="985" fill="#008d91" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" text-anchor="middle">
      Dana akan disalurkan untuk:
    </text>
    <text x="400" y="1013" fill="#008d91" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="16" text-anchor="middle">
      Penerbitan &amp; Penyaluran Buku Dharma (SALUR)
    </text>
    <text x="400" y="1039" fill="#008d91" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="16" text-anchor="middle">
      Kegiatan Dharma (AJAR &amp; PROMOSI)
    </text>
    <text x="400" y="1065" fill="#008d91" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="16" text-anchor="middle">
      Mobilisasi Relawan &amp; Operasional (PROMOSI &amp; AJAK)
    </text>
  </g>
</svg>
`)}`;
