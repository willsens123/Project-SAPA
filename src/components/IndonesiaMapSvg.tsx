import React, { useState } from 'react';
import {
  MapPin,
  Users,
  Building,
  CheckCircle2,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

interface IndonesiaMapProps {
  className?: string;
  onSelectRegion?: (regionName: string) => void;
}

interface RegionInfo {
  id: string;
  name: string;
  island: 'Sumatera' | 'Jawa' | 'Kalimantan' | 'Sulawesi' | 'Bali-NusaTenggara' | 'Maluku' | 'Papua';
  citiesCount: number;
  customerCount: number;
  status: 'Tinggi' | 'Sedang' | 'Berkembang';
  color: string;
  description: string;
}

const REGION_DATA: Record<string, RegionInfo> = {
  // Sumatera
  aceh_sumut: {
    id: 'aceh_sumut',
    name: 'Aceh & Sumatera Utara',
    island: 'Sumatera',
    citiesCount: 8,
    customerCount: 1420,
    status: 'Tinggi',
    color: '#05828e',
    description: 'Medan, Banda Aceh, Pematangsiantar, Binjai, Lhokseumawe',
  },
  riau_sumbar: {
    id: 'riau_sumbar',
    name: 'Riau, Kep. Riau & Sumatera Barat',
    island: 'Sumatera',
    citiesCount: 7,
    customerCount: 980,
    status: 'Sedang',
    color: '#05828e',
    description: 'Padang, Pekanbaru, Batam, Tanjungpinang, Bukittinggi',
  },
  sumsel_lampung: {
    id: 'sumsel_lampung',
    name: 'Sumatera Selatan, Jambi & Lampung',
    island: 'Sumatera',
    citiesCount: 9,
    customerCount: 1250,
    status: 'Tinggi',
    color: '#05828e',
    description: 'Palembang, Bandar Lampung, Jambi, Lubuklinggau, Metro',
  },
  bangka_belitung: {
    id: 'bangka_belitung',
    name: 'Kepulauan Bangka Belitung',
    island: 'Sumatera',
    citiesCount: 3,
    customerCount: 320,
    status: 'Berkembang',
    color: '#f59e0b',
    description: 'Pangkalpinang, Tanjung Pandan, Sungailiat',
  },

  // Jawa
  dki_banten: {
    id: 'dki_banten',
    name: 'DKI Jakarta & Banten',
    island: 'Jawa',
    citiesCount: 11,
    customerCount: 4200,
    status: 'Tinggi',
    color: '#05828e',
    description: 'Jakarta Pusat, Selatan, Barat, Tangerang, Tangerang Selatan, Serang',
  },
  jabar: {
    id: 'jabar',
    name: 'Jawa Barat',
    island: 'Jawa',
    citiesCount: 12,
    customerCount: 2850,
    status: 'Tinggi',
    color: '#05828e',
    description: 'Bandung, Bekasi, Bogor, Depok, Cirebon, Sukabumi, Tasikmalaya',
  },
  jateng_diy: {
    id: 'jateng_diy',
    name: 'Jawa Tengah & D.I. Yogyakarta',
    island: 'Jawa',
    citiesCount: 14,
    customerCount: 2450,
    status: 'Tinggi',
    color: '#05828e',
    description: 'Semarang, Surakarta (Solo), Yogyakarta, Magelang, Purwokerto',
  },
  jatim_madura: {
    id: 'jatim_madura',
    name: 'Jawa Timur & Madura',
    island: 'Jawa',
    citiesCount: 16,
    customerCount: 3100,
    status: 'Tinggi',
    color: '#05828e',
    description: 'Surabaya, Malang, Kediri, Madiun, Jember, Banyuwangi, Pamekasan',
  },

  // Kalimantan
  kalbar: {
    id: 'kalbar',
    name: 'Kalimantan Barat',
    island: 'Kalimantan',
    citiesCount: 4,
    customerCount: 650,
    status: 'Sedang',
    color: '#05828e',
    description: 'Pontianak, Singkawang, Sambas, Ketapang',
  },
  kalteng_kalsel: {
    id: 'kalteng_kalsel',
    name: 'Kalimantan Tengah & Selatan',
    island: 'Kalimantan',
    citiesCount: 6,
    customerCount: 780,
    status: 'Sedang',
    color: '#f59e0b',
    description: 'Banjarmasin, Banjarbaru, Palangkaraya, Sampit',
  },
  kaltim_kaltara: {
    id: 'kaltim_kaltara',
    name: 'Kalimantan Timur & Utara (IKN)',
    island: 'Kalimantan',
    citiesCount: 5,
    customerCount: 920,
    status: 'Tinggi',
    color: '#05828e',
    description: 'Samarinda, Balikpapan, Bontang, Tarakan, Penajam Paser Utara',
  },

  // Sulawesi
  sulsel_sulbar: {
    id: 'sulsel_sulbar',
    name: 'Sulawesi Selatan & Barat',
    island: 'Sulawesi',
    citiesCount: 7,
    customerCount: 980,
    status: 'Tinggi',
    color: '#05828e',
    description: 'Makassar, Parepare, Palopo, Mamuju, Bone',
  },
  sulteng_sultra: {
    id: 'sulteng_sultra',
    name: 'Sulawesi Tengah & Tenggara',
    island: 'Sulawesi',
    citiesCount: 6,
    customerCount: 560,
    status: 'Sedang',
    color: '#f59e0b',
    description: 'Palu, Kendari, Baubau, Luwuk, Kolaka',
  },
  sulut_gorontalo: {
    id: 'sulut_gorontalo',
    name: 'Sulawesi Utara & Gorontalo',
    island: 'Sulawesi',
    citiesCount: 5,
    customerCount: 680,
    status: 'Sedang',
    color: '#05828e',
    description: 'Manado, Tomohon, Bitung, Gorontalo, Kotamobagu',
  },

  // Bali & Nusa Tenggara
  bali: {
    id: 'bali',
    name: 'Bali',
    island: 'Bali-NusaTenggara',
    citiesCount: 4,
    customerCount: 950,
    status: 'Tinggi',
    color: '#05828e',
    description: 'Denpasar, Badung, Gianyar, Singaraja, Tabanan',
  },
  ntb: {
    id: 'ntb',
    name: 'Nusa Tenggara Barat',
    island: 'Bali-NusaTenggara',
    citiesCount: 4,
    customerCount: 420,
    status: 'Sedang',
    color: '#f59e0b',
    description: 'Mataram, Bima, Sumbawa Besar, Praya',
  },
  ntt: {
    id: 'ntt',
    name: 'Nusa Tenggara Timur',
    island: 'Bali-NusaTenggara',
    citiesCount: 5,
    customerCount: 480,
    status: 'Sedang',
    color: '#05828e',
    description: 'Kupang, Labuan Bajo, Ende, Maumere, Waingapu',
  },

  // Maluku
  maluku_utara: {
    id: 'maluku_utara',
    name: 'Maluku Utara',
    island: 'Maluku',
    citiesCount: 3,
    customerCount: 220,
    status: 'Berkembang',
    color: '#cbd5e1',
    description: 'Ternate, Tidore, Sofifi, Tobelo',
  },
  maluku_selatan: {
    id: 'maluku_selatan',
    name: 'Maluku',
    island: 'Maluku',
    citiesCount: 3,
    customerCount: 260,
    status: 'Berkembang',
    color: '#cbd5e1',
    description: 'Ambon, Tual, Masohi, Saumlaki',
  },

  // Papua
  papua_barat: {
    id: 'papua_barat',
    name: 'Papua Barat & Papua Barat Daya',
    island: 'Papua',
    citiesCount: 3,
    customerCount: 310,
    status: 'Berkembang',
    color: '#cbd5e1',
    description: 'Sorong, Manokwari, Fakfak, Raja Ampat',
  },
  papua_induk: {
    id: 'papua_induk',
    name: 'Papua, Papua Tengah & Selatan',
    island: 'Papua',
    citiesCount: 5,
    customerCount: 450,
    status: 'Berkembang',
    color: '#cbd5e1',
    description: 'Jayapura, Timika, Merauke, Nabire, Wamena',
  },
};

// Major key cities coordinates in SVG viewBox (1000 x 440)
const MAJOR_CITIES = [
  { name: 'Banda Aceh', x: 80, y: 75, region: 'aceh_sumut' },
  { name: 'Medan', x: 110, y: 110, region: 'aceh_sumut' },
  { name: 'Pekanbaru', x: 170, y: 175, region: 'riau_sumbar' },
  { name: 'Batam', x: 220, y: 170, region: 'riau_sumbar' },
  { name: 'Padang', x: 145, y: 215, region: 'riau_sumbar' },
  { name: 'Palembang', x: 215, y: 260, region: 'sumsel_lampung' },
  { name: 'Bandar Lampung', x: 235, y: 315, region: 'sumsel_lampung' },
  { name: 'Jakarta', x: 295, y: 350, region: 'dki_banten' },
  { name: 'Bandung', x: 330, y: 365, region: 'jabar' },
  { name: 'Semarang', x: 410, y: 360, region: 'jateng_diy' },
  { name: 'Yogyakarta', x: 405, y: 380, region: 'jateng_diy' },
  { name: 'Surabaya', x: 475, y: 360, region: 'jatim_madura' },
  { name: 'Malang', x: 470, y: 385, region: 'jatim_madura' },
  { name: 'Denpasar (Bali)', x: 535, y: 380, region: 'bali' },
  { name: 'Mataram (Lombok)', x: 565, y: 382, region: 'ntb' },
  { name: 'Kupang (Timor)', x: 740, y: 410, region: 'ntt' },
  { name: 'Pontianak', x: 345, y: 215, region: 'kalbar' },
  { name: 'Banjarmasin', x: 470, y: 275, region: 'kalteng_kalsel' },
  { name: 'Balikpapan', x: 495, y: 230, region: 'kaltim_kaltara' },
  { name: 'Samarinda', x: 505, y: 205, region: 'kaltim_kaltara' },
  { name: 'Makassar', x: 570, y: 300, region: 'sulsel_sulbar' },
  { name: 'Palu', x: 585, y: 195, region: 'sulteng_sultra' },
  { name: 'Kendari', x: 635, y: 265, region: 'sulteng_sultra' },
  { name: 'Manado', x: 655, y: 105, region: 'sulut_gorontalo' },
  { name: 'Ambon', x: 755, y: 255, region: 'maluku_selatan' },
  { name: 'Sorong', x: 805, y: 195, region: 'papua_barat' },
  { name: 'Jayapura', x: 965, y: 235, region: 'papua_induk' },
  { name: 'Timika', x: 900, y: 295, region: 'papua_induk' },
];

export const IndonesiaMapSvg: React.FC<IndonesiaMapProps> = ({
  className = '',
  onSelectRegion,
}) => {
  const [selectedIsland, setSelectedIsland] = useState<string>('SEMUA');
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [activeRegionId, setActiveRegionId] = useState<string>('dki_banten');
  const [showCityPins, setShowCityPins] = useState<boolean>(true);

  const activeRegion = REGION_DATA[activeRegionId] || REGION_DATA.dki_banten;
  const hoveredRegion = hoveredRegionId ? REGION_DATA[hoveredRegionId] : null;

  const handleRegionClick = (id: string) => {
    setActiveRegionId(id);
    if (onSelectRegion && REGION_DATA[id]) {
      onSelectRegion(REGION_DATA[id].name);
    }
  };

  const getRegionFill = (id: string) => {
    const data = REGION_DATA[id];
    if (!data) return '#cbd5e1';

    // If island filter active
    if (selectedIsland !== 'SEMUA') {
      const islandMap: Record<string, string> = {
        SUMATERA: 'Sumatera',
        JAWA: 'Jawa',
        KALIMANTAN: 'Kalimantan',
        SULAWESI: 'Sulawesi',
        NUSA_TENGGARA: 'Bali-NusaTenggara',
        MALUKU: 'Maluku',
        PAPUA: 'Papua',
      };
      if (data.island !== islandMap[selectedIsland]) {
        return '#f1f5f9';
      }
    }

    if (id === activeRegionId) return '#046c76';
    if (id === hoveredRegionId) return '#01b5a2';
    return data.color;
  };

  return (
    <div className={`w-full flex flex-col bg-slate-50/50 rounded-2xl border border-slate-200/80 p-3 sm:p-5 ${className}`}>
      {/* Top Filter Bar: Island tabs & Toggle City Pins */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-200/70">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
          {[
            { id: 'SEMUA', label: 'Semua Pulau' },
            { id: 'SUMATERA', label: 'Sumatera' },
            { id: 'JAWA', label: 'Jawa' },
            { id: 'KALIMANTAN', label: 'Kalimantan' },
            { id: 'SULAWESI', label: 'Sulawesi' },
            { id: 'NUSA_TENGGARA', label: 'Bali & Nusra' },
            { id: 'MALUKU', label: 'Maluku' },
            { id: 'PAPUA', label: 'Papua' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedIsland(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedIsland === tab.id
                  ? 'bg-[#05828e] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCityPins(!showCityPins)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
              showCityPins
                ? 'bg-teal-50 text-[#05828e] border-teal-200'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
            }`}
            title="Tampilkan / Sembunyikan Titik Kota"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Titik Kota</span>
          </button>
        </div>
      </div>

      {/* Main Interactive SVG Map */}
      <div className="relative w-full h-[280px] sm:h-[380px] md:h-[420px] my-2 bg-gradient-to-b from-sky-50/40 via-white to-slate-50/60 rounded-xl overflow-hidden flex items-center justify-center p-1 sm:p-2">
        <svg
          viewBox="0 0 1000 450"
          className="w-full h-full max-h-[420px] select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="indonesia-shadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.08" />
            </filter>
            <radialGradient id="pin-pulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#05828e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#05828e" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ocean Watermark Background / Equator Line */}
          <line
            x1="30"
            y1="210"
            x2="970"
            y2="210"
            stroke="#94a3b8"
            strokeDasharray="4 6"
            strokeWidth="0.8"
            strokeOpacity="0.35"
          />
          <text
            x="45"
            y="204"
            fill="#94a3b8"
            fontSize="9"
            fontWeight="bold"
            letterSpacing="1"
            fillOpacity="0.5"
          >
            KHATULISTIWA (EQUATOR 0°)
          </text>

          {/* ============================================================== */}
          {/* 1. SUMATERA (Real Curvilinear Archipelago Path)                */}
          {/* ============================================================== */}
          <g filter="url(#indonesia-shadow)">
            {/* Aceh & Sumut */}
            <path
              id="geo-aceh-sumut"
              d="M 52,68 C 65,55 85,50 105,62 C 125,75 145,105 158,135 C 150,148 135,160 115,152 C 95,145 75,115 60,95 Z"
              fill={getRegionFill('aceh_sumut')}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="cursor-pointer transition-colors duration-150 hover:brightness-105"
              onMouseEnter={() => setHoveredRegionId('aceh_sumut')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('aceh_sumut')}
            >
              <title>Aceh & Sumatera Utara</title>
            </path>

            {/* Nias & Mentawai Island Chains */}
            <ellipse cx="78" cy="148" rx="7" ry="14" transform="rotate(-30 78 148)" fill={getRegionFill('aceh_sumut')} stroke="#ffffff" strokeWidth="1" />
            <ellipse cx="118" cy="225" rx="6" ry="18" transform="rotate(-35 118 225)" fill={getRegionFill('riau_sumbar')} stroke="#ffffff" strokeWidth="1" />

            {/* Riau & Sumatera Barat */}
            <path
              id="geo-riau-sumbar"
              d="M 135,142 C 155,130 178,145 195,165 C 205,185 200,210 182,225 C 165,240 145,235 132,205 C 125,180 128,155 135,142 Z"
              fill={getRegionFill('riau_sumbar')}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="cursor-pointer transition-colors duration-150 hover:brightness-105"
              onMouseEnter={() => setHoveredRegionId('riau_sumbar')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('riau_sumbar')}
            >
              <title>Riau & Sumatera Barat</title>
            </path>

            {/* Kepulauan Riau (Batam, Bintan, Natuna) */}
            <ellipse cx="218" cy="165" rx="6" ry="5" fill={getRegionFill('riau_sumbar')} stroke="#ffffff" strokeWidth="1" />
            <ellipse cx="232" cy="172" rx="5" ry="4" fill={getRegionFill('riau_sumbar')} stroke="#ffffff" strokeWidth="1" />
            <ellipse cx="265" cy="120" rx="6" ry="5" fill={getRegionFill('riau_sumbar')} stroke="#ffffff" strokeWidth="1" />

            {/* Sumsel, Jambi & Lampung */}
            <path
              id="geo-sumsel-lampung"
              d="M 182,225 C 200,210 225,225 240,248 C 255,270 258,295 245,320 C 235,335 220,330 210,310 C 195,285 180,260 175,238 Z"
              fill={getRegionFill('sumsel_lampung')}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="cursor-pointer transition-colors duration-150 hover:brightness-105"
              onMouseEnter={() => setHoveredRegionId('sumsel_lampung')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('sumsel_lampung')}
            >
              <title>Sumatera Selatan, Jambi & Lampung</title>
            </path>

            {/* Bangka & Belitung */}
            <path
              id="geo-bangka-belitung"
              d="M 252,245 C 258,235 268,238 272,252 C 275,268 265,280 255,275 Z"
              fill={getRegionFill('bangka_belitung')}
              stroke="#ffffff"
              strokeWidth="1"
              className="cursor-pointer transition-colors duration-150 hover:brightness-105"
              onMouseEnter={() => setHoveredRegionId('bangka_belitung')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('bangka_belitung')}
            >
              <title>Bangka</title>
            </path>
            <ellipse
              cx="290"
              cy="275"
              rx="9"
              ry="8"
              fill={getRegionFill('bangka_belitung')}
              stroke="#ffffff"
              strokeWidth="1"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredRegionId('bangka_belitung')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('bangka_belitung')}
            >
              <title>Belitung</title>
            </ellipse>
          </g>

          {/* ============================================================== */}
          {/* 2. KALIMANTAN (Borneo Indonesian Territory)                    */}
          {/* ============================================================== */}
          <g filter="url(#indonesia-shadow)">
            {/* Kalbar */}
            <path
              id="geo-kalbar"
              d="M 335,190 C 350,165 385,160 410,175 C 418,195 410,225 395,242 C 375,255 350,245 338,225 Z"
              fill={getRegionFill('kalbar')}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="cursor-pointer transition-colors duration-150 hover:brightness-105"
              onMouseEnter={() => setHoveredRegionId('kalbar')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('kalbar')}
            >
              <title>Kalimantan Barat</title>
            </path>

            {/* Kalteng & Kalsel */}
            <path
              id="geo-kalteng-kalsel"
              d="M 395,242 C 410,225 435,215 455,230 C 475,245 485,275 470,295 C 445,302 415,290 395,265 Z"
              fill={getRegionFill('kalteng_kalsel')}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="cursor-pointer transition-colors duration-150 hover:brightness-105"
              onMouseEnter={() => setHoveredRegionId('kalteng_kalsel')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('kalteng_kalsel')}
            >
              <title>Kalimantan Tengah & Selatan</title>
            </path>

            {/* Kaltim & Kaltara */}
            <path
              id="geo-kaltim-kaltara"
              d="M 410,175 C 435,160 470,120 495,110 C 510,135 515,180 500,215 C 480,230 455,230 435,215 C 420,195 415,185 410,175 Z"
              fill={getRegionFill('kaltim_kaltara')}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="cursor-pointer transition-colors duration-150 hover:brightness-105"
              onMouseEnter={() => setHoveredRegionId('kaltim_kaltara')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('kaltim_kaltara')}
            >
              <title>Kalimantan Timur & Utara (IKN)</title>
            </path>
          </g>

          {/* ============================================================== */}
          {/* 3. JAWA & MADURA (Java Elongated Strip)                        */}
          {/* ============================================================== */}
          <g filter="url(#indonesia-shadow)">
            {/* DKI Jakarta & Banten */}
            <path
              id="geo-dki-banten"
              d="M 262,342 C 275,338 295,338 310,345 C 310,360 295,365 272,365 C 260,358 258,348 262,342 Z"
              fill={getRegionFill('dki_banten')}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="cursor-pointer transition-colors duration-150 hover:brightness-105"
              onMouseEnter={() => setHoveredRegionId('dki_banten')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('dki_banten')}
            >
              <title>DKI Jakarta & Banten</title>
            </path>

            {/* Jawa Barat */}
            <path
              id="geo-jabar"
              d="M 310,345 C 330,342 355,345 372,352 C 370,370 345,378 320,372 C 310,365 308,355 310,345 Z"
              fill={getRegionFill('jabar')}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="cursor-pointer transition-colors duration-150 hover:brightness-105"
              onMouseEnter={() => setHoveredRegionId('jabar')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('jabar')}
            >
              <title>Jawa Barat</title>
            </path>

            {/* Jawa Tengah & DIY */}
            <path
              id="geo-jateng-diy"
              d="M 372,352 C 395,348 425,350 442,358 C 438,375 415,385 385,380 C 375,372 370,362 372,352 Z"
              fill={getRegionFill('jateng_diy')}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="cursor-pointer transition-colors duration-150 hover:brightness-105"
              onMouseEnter={() => setHoveredRegionId('jateng_diy')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('jateng_diy')}
            >
              <title>Jawa Tengah & D.I. Yogyakarta</title>
            </path>

            {/* Jawa Timur */}
            <path
              id="geo-jatim-madura"
              d="M 442,358 C 465,355 495,358 518,368 C 510,385 480,392 450,385 C 440,375 438,365 442,358 Z"
              fill={getRegionFill('jatim_madura')}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="cursor-pointer transition-colors duration-150 hover:brightness-105"
              onMouseEnter={() => setHoveredRegionId('jatim_madura')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('jatim_madura')}
            >
              <title>Jawa Timur</title>
            </path>

            {/* Madura */}
            <ellipse
              cx="490"
              cy="348"
              rx="22"
              ry="7"
              transform="rotate(-5 490 348)"
              fill={getRegionFill('jatim_madura')}
              stroke="#ffffff"
              strokeWidth="1"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredRegionId('jatim_madura')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('jatim_madura')}
            >
              <title>Pulau Madura</title>
            </ellipse>
          </g>

          {/* ============================================================== */}
          {/* 4. BALI, NTB, NTT (Sunda Kecil Archipelagic Arc)               */}
          {/* ============================================================== */}
          <g filter="url(#indonesia-shadow)">
            {/* Bali */}
            <path
              id="geo-bali"
              d="M 526,370 C 532,365 544,368 546,376 C 544,384 532,386 526,380 Z"
              fill={getRegionFill('bali')}
              stroke="#ffffff"
              strokeWidth="1.2"
              className="cursor-pointer transition-colors duration-150 hover:brightness-105"
              onMouseEnter={() => setHoveredRegionId('bali')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('bali')}
            >
              <title>Bali</title>
            </path>

            {/* Lombok & Sumbawa (NTB) */}
            <ellipse cx="560" cy="378" rx="9" ry="8" fill={getRegionFill('ntb')} stroke="#ffffff" strokeWidth="1" />
            <path
              id="geo-sumbawa"
              d="M 578,375 C 595,370 615,372 628,382 C 620,392 590,392 578,382 Z"
              fill={getRegionFill('ntb')}
              stroke="#ffffff"
              strokeWidth="1"
              className="cursor-pointer transition-colors duration-150 hover:brightness-105"
              onMouseEnter={() => setHoveredRegionId('ntb')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('ntb')}
            >
              <title>Nusa Tenggara Barat (Lombok & Sumbawa)</title>
            </path>

            {/* Flores, Sumba & Timor (NTT) */}
            <path
              id="geo-flores"
              d="M 640,375 C 665,370 695,374 712,382 C 700,390 660,390 640,382 Z"
              fill={getRegionFill('ntt')}
              stroke="#ffffff"
              strokeWidth="1"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredRegionId('ntt')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('ntt')}
            >
              <title>Flores (NTT)</title>
            </path>
            <ellipse cx="665" cy="405" rx="18" ry="9" fill={getRegionFill('ntt')} stroke="#ffffff" strokeWidth="1" />
            <path
              id="geo-timor"
              d="M 725,395 C 745,385 765,395 770,410 C 755,420 735,415 725,405 Z"
              fill={getRegionFill('ntt')}
              stroke="#ffffff"
              strokeWidth="1"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredRegionId('ntt')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('ntt')}
            >
              <title>Timor Barat & Rote (NTT)</title>
            </path>
          </g>

          {/* ============================================================== */}
          {/* 5. SULAWESI (The Iconic 4-Armed Orchid/K Shape)                */}
          {/* ============================================================== */}
          <g filter="url(#indonesia-shadow)">
            {/* North Sulawesi & Gorontalo (Northern Arm) */}
            <path
              id="geo-sulut-gorontalo"
              d="M 570,150 C 585,130 620,110 655,95 C 668,105 660,122 638,125 C 605,132 585,148 570,150 Z"
              fill={getRegionFill('sulut_gorontalo')}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="cursor-pointer transition-colors duration-150 hover:brightness-105"
              onMouseEnter={() => setHoveredRegionId('sulut_gorontalo')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('sulut_gorontalo')}
            >
              <title>Sulawesi Utara & Gorontalo</title>
            </path>

            {/* Central & Southeast Sulawesi (Eastern & SE Arms) */}
            <path
              id="geo-sulteng-sultra"
              d="M 570,150 C 595,165 625,185 648,195 C 640,210 610,210 595,195 C 580,205 600,235 635,260 C 625,275 605,275 590,250 C 580,230 572,205 570,175 Z"
              fill={getRegionFill('sulteng_sultra')}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="cursor-pointer transition-colors duration-150 hover:brightness-105"
              onMouseEnter={() => setHoveredRegionId('sulteng_sultra')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('sulteng_sultra')}
            >
              <title>Sulawesi Tengah & Tenggara</title>
            </path>
            {/* Buton & Muna Islands */}
            <ellipse cx="640" cy="285" rx="8" ry="14" fill={getRegionFill('sulteng_sultra')} stroke="#ffffff" strokeWidth="1" />

            {/* South & West Sulawesi (Southwestern Arm) */}
            <path
              id="geo-sulsel-sulbar"
              d="M 565,195 C 578,215 585,245 582,285 C 570,305 558,295 552,265 C 548,235 555,208 565,195 Z"
              fill={getRegionFill('sulsel_sulbar')}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="cursor-pointer transition-colors duration-150 hover:brightness-105"
              onMouseEnter={() => setHoveredRegionId('sulsel_sulbar')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('sulsel_sulbar')}
            >
              <title>Sulawesi Selatan & Barat</title>
            </path>
          </g>

          {/* ============================================================== */}
          {/* 6. MALUKU & MALUKU UTARA                                       */}
          {/* ============================================================== */}
          <g filter="url(#indonesia-shadow)">
            {/* Halmahera (Mini-Sulawesi Shape) */}
            <path
              id="geo-maluku-utara"
              d="M 705,120 C 720,105 738,115 742,135 C 730,145 715,150 710,165 C 700,160 702,135 705,120 Z"
              fill={getRegionFill('maluku_utara')}
              stroke="#ffffff"
              strokeWidth="1.2"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredRegionId('maluku_utara')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('maluku_utara')}
            >
              <title>Maluku Utara (Halmahera & Ternate)</title>
            </path>

            {/* Seram, Buru & Ambon */}
            <ellipse cx="710" cy="240" rx="14" ry="10" fill={getRegionFill('maluku_selatan')} stroke="#ffffff" strokeWidth="1" />
            <path
              id="geo-seram"
              d="M 740,230 C 765,225 795,232 805,245 C 785,255 755,250 740,240 Z"
              fill={getRegionFill('maluku_selatan')}
              stroke="#ffffff"
              strokeWidth="1"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredRegionId('maluku_selatan')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('maluku_selatan')}
            >
              <title>Pulau Seram & Ambon</title>
            </path>
            {/* Kei & Aru Islands */}
            <ellipse cx="820" cy="305" rx="7" ry="10" fill={getRegionFill('maluku_selatan')} stroke="#ffffff" strokeWidth="1" />
            <ellipse cx="838" cy="325" rx="10" ry="16" fill={getRegionFill('maluku_selatan')} stroke="#ffffff" strokeWidth="1" />
          </g>

          {/* ============================================================== */}
          {/* 7. PAPUA (The Majestic Bird-of-Paradise Shape)                 */}
          {/* ============================================================== */}
          <g filter="url(#indonesia-shadow)">
            {/* Kepala Burung (Doberai / Papua Barat & Raja Ampat) */}
            <path
              id="geo-papua-barat"
              d="M 780,185 C 800,165 830,170 842,192 C 840,210 820,225 795,220 C 780,210 775,195 780,185 Z"
              fill={getRegionFill('papua_barat')}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="cursor-pointer transition-colors duration-150 hover:brightness-105"
              onMouseEnter={() => setHoveredRegionId('papua_barat')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('papua_barat')}
            >
              <title>Papua Barat & Barat Daya (Kepala Burung)</title>
            </path>
            {/* Raja Ampat Islands */}
            <ellipse cx="765" cy="172" rx="6" ry="5" fill={getRegionFill('papua_barat')} stroke="#ffffff" strokeWidth="1" />
            <ellipse cx="778" cy="162" rx="5" ry="4" fill={getRegionFill('papua_barat')} stroke="#ffffff" strokeWidth="1" />

            {/* Papua Induk, Tengah, Pegunungan & Selatan */}
            <path
              id="geo-papua-induk"
              d="M 842,192 C 865,195 895,215 975,225 L 975,340 C 930,345 890,320 865,275 C 855,250 835,230 842,192 Z"
              fill={getRegionFill('papua_induk')}
              stroke="#ffffff"
              strokeWidth="1.5"
              className="cursor-pointer transition-colors duration-150 hover:brightness-105"
              onMouseEnter={() => setHoveredRegionId('papua_induk')}
              onMouseLeave={() => setHoveredRegionId(null)}
              onClick={() => handleRegionClick('papua_induk')}
            >
              <title>Papua, Papua Tengah & Papua Selatan</title>
            </path>

            {/* Biak & Yapen Islands */}
            <ellipse cx="850" cy="178" rx="10" ry="5" fill={getRegionFill('papua_induk')} stroke="#ffffff" strokeWidth="1" />
            <ellipse cx="858" cy="195" rx="14" ry="4" fill={getRegionFill('papua_induk')} stroke="#ffffff" strokeWidth="1" />
          </g>

          {/* ============================================================== */}
          {/* 8. MAJOR CITIES PINS & GLOWING PULSES                           */}
          {/* ============================================================== */}
          {showCityPins && (
            <g className="transition-opacity duration-200">
              {MAJOR_CITIES.map((city) => {
                const isCityRegionActive =
                  city.region === activeRegionId || city.region === hoveredRegionId;
                return (
                  <g
                    key={city.name}
                    className="group cursor-pointer"
                    onClick={() => handleRegionClick(city.region)}
                  >
                    {/* Pulsing ring for active city region */}
                    {isCityRegionActive && (
                      <circle
                        cx={city.x}
                        cy={city.y}
                        r="8"
                        fill="none"
                        stroke="#05828e"
                        strokeWidth="1.5"
                        className="animate-ping opacity-60"
                      />
                    )}

                    {/* Outer Dot */}
                    <circle
                      cx={city.x}
                      cy={city.y}
                      r={isCityRegionActive ? 3.5 : 2.5}
                      fill={isCityRegionActive ? '#ffffff' : '#05828e'}
                      stroke={isCityRegionActive ? '#05828e' : '#ffffff'}
                      strokeWidth="1.2"
                      className="transition-all"
                    />

                    {/* City Name label on hover or if primary */}
                    <text
                      x={city.x}
                      y={city.y - 5}
                      textAnchor="middle"
                      fill="#1e293b"
                      fontSize={isCityRegionActive ? '9' : '7.5'}
                      fontWeight={isCityRegionActive ? 'bold' : '600'}
                      className={`pointer-events-none select-none drop-shadow-2xs transition-all ${
                        isCityRegionActive
                          ? 'opacity-100 fill-[#05828e]'
                          : 'opacity-70 group-hover:opacity-100'
                      }`}
                    >
                      {city.name}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* Hover Floating Tooltip */}
        {hoveredRegion && (
          <div className="absolute top-3 left-3 bg-slate-900/90 text-white px-3 py-2 rounded-xl text-xs shadow-lg backdrop-blur-xs border border-slate-700 pointer-events-none animate-in fade-in duration-100 max-w-xs">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <span>{hoveredRegion.name}</span>
            </div>
            <div className="text-[11px] text-slate-200 mt-0.5">
              <span className="font-semibold text-white">{hoveredRegion.citiesCount} Kota</span> •{' '}
              <span className="font-semibold text-emerald-300">
                {hoveredRegion.customerCount.toLocaleString('id-ID')} Partisipan
              </span>
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-1">
              {hoveredRegion.description}
            </div>
          </div>
        )}
      </div>

      {/* Region Detail Card at bottom of map */}
      <div className="mt-2 p-3 sm:p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#05828e] flex items-center justify-center shrink-0 border border-teal-200/60 font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                {activeRegion.name}
              </h4>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeRegion.status === 'Tinggi'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : activeRegion.status === 'Sedang'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Distribusi {activeRegion.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cakupan: {activeRegion.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-2 md:pt-0 md:pl-4 shrink-0">
          <div>
            <span className="text-[10.5px] text-slate-400 block font-medium">Jangkauan Kota</span>
            <span className="text-sm font-bold text-slate-800">
              {activeRegion.citiesCount} Kota / Kab
            </span>
          </div>
          <div>
            <span className="text-[10.5px] text-slate-400 block font-medium">Total Partisipan</span>
            <span className="text-sm font-bold text-[#05828e]">
              {activeRegion.customerCount.toLocaleString('id-ID')} Orang
            </span>
          </div>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2 text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#05828e]" />
            <span className="font-medium text-slate-700">Verifikasi Tinggi / Utama</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#f59e0b]" />
            <span className="font-medium text-slate-700">Dalam Proses / Sedang</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#cbd5e1]" />
            <span className="font-medium text-slate-600">Wilayah Rintisan</span>
          </div>
        </div>

        <div className="text-[11px] font-semibold text-[#05828e]">
          Total Nasional: 60 Kota, 30 Provinsi (14.050 Partisipan)
        </div>
      </div>
    </div>
  );
};
