import indonesiaRegionsJson from './data/indonesiaRegions.json';

export interface IndonesiaRegionsDataset {
  version: string;
  totalProvinces: number;
  totalCities: number;
  provinces: string[];
  citiesByProvince: Record<string, string[]>;
  districtsByCity: Record<string, string[]>;
  villagesByDistrict: Record<string, string[]>;
}

export const INDONESIA_REGIONS_DATASET: IndonesiaRegionsDataset = indonesiaRegionsJson as IndonesiaRegionsDataset;

export const INDONESIA_PROVINSI_LIST: string[] = indonesiaRegionsJson.provinces;

// All 514 Kota & Kabupaten across all 38 provinces of Indonesia
const rawAllCities = Object.values(indonesiaRegionsJson.citiesByProvince).flat();
export const INDONESIA_KOTA_KABUPATEN_LIST: string[] = Array.from(new Set(rawAllCities));


export const INDONESIA_KECAMATAN_LIST: string[] = [
  // Bandung Raya
  'Astanaanyar',
  'Coblong',
  'Sukajadi',
  'Andir',
  'Regol',
  'Lengkong',
  'Sumur Bandung',
  'Bandung Wetan',
  'Cibeunying Kaler',
  'Cibeunying Kidul',
  'Bojongloa Kaler',
  'Bojongloa Kidul',
  'Batununggal',
  'Kiaracondong',
  'Cicendo',
  'Babakan Ciparay',
  'Antapani',
  'Arcamanik',
  'Buahbatu',
  'Rancasari',
  'Gedebage',
  'Cibiru',
  'Ujungberung',
  'Cidadap',
  'Lembang',
  'Parongpong',
  'Cimahi Tengah',
  'Cimahi Utara',
  'Cimahi Selatan',
  'Baleendah',
  'Dayeuhkolot',
  'Soreang',

  // Jakarta Selatan
  'Kebayoran Baru',
  'Kebayoran Lama',
  'Cilandak',
  'Pasar Minggu',
  'Mampang Prapatan',
  'Pancoran',
  'Tebet',
  'Setiabudi',
  'Pesanggrahan',
  'Jagakarsa',

  // Jakarta Pusat
  'Menteng',
  'Gambir',
  'Tanah Abang',
  'Sawah Besar',
  'Senen',
  'Kemayoran',
  'Cempaka Putih',
  'Johar Baru',

  // Jakarta Barat
  'Grogol Petamburan',
  'Palmerah',
  'Kebon Jeruk',
  'Kembangan',
  'Kalideres',
  'Cengkareng',
  'Taman Sari',
  'Tambora',

  // Jakarta Timur
  'Matraman',
  'Jatinegara',
  'Duren Sawit',
  'Kramat Jati',
  'Pasar Rebo',
  'Ciracas',
  'Cipayung',
  'Cakung',
  'Pulo Gadung',
  'Makasar',

  // Jakarta Utara
  'Penjaringan',
  'Pademangan',
  'Tanjung Priok',
  'Koja',
  'Kelapa Gading',
  'Cilincing',

  // Tangerang Raya & Banten
  'Serpong',
  'Serpong Utara',
  'Ciputat',
  'Ciputat Timur',
  'Pondok Aren',
  'Pamulang',
  'Setu',
  'Tangerang',
  'Batuceper',
  'Benda',
  'Cibodas',
  'Ciledug',
  'Cipondoh',
  'Jatiuwung',
  'Karawaci',
  'Periuk',
  'Pinang',
  'Karangtengah',
  'Kelapa Dua',
  'Curug',
  'Cikupa',
  'Balaraja',
  'Serang',
  'Cilegon',

  // Bogor, Depok, Bekasi
  'Bogor Tengah',
  'Bogor Timur',
  'Bogor Barat',
  'Bogor Selatan',
  'Bogor Utara',
  'Tanah Sareal',
  'Cibinong',
  'Pancoran Mas',
  'Sukmajaya',
  'Cimanggis',
  'Beji',
  'Sawangan',
  'Cinere',
  'Bekasi Barat',
  'Bekasi Timur',
  'Bekasi Utara',
  'Bekasi Selatan',
  'Rawalumbu',
  'Pondok Gede',
  'Medansatria',
  'Cikarang Pusat',
  'Cikarang Barat',

  // Jawa Tengah & Solo
  'Semarang Tengah',
  'Semarang Barat',
  'Semarang Timur',
  'Semarang Selatan',
  'Semarang Utara',
  'Candisari',
  'Gajahmungkur',
  'Banyumanik',
  'Pedurungan',
  'Tembalang',
  'Banjarsari',
  'Jebres',
  'Laweyan',
  'Pasar Kliwon',
  'Serengan',
  'Kartasura',
  'Purwokerto Timur',
  'Purwokerto Barat',
  'Magelang Tengah',

  // DI Yogyakarta
  'Gondokusuman',
  'Umbulharjo',
  'Danurejan',
  'Jetis',
  'Kraton',
  'Mantrijeron',
  'Mergangsan',
  'Ngampilan',
  'Pakualaman',
  'Tegalrejo',
  'Wirobrajan',
  'Depok (Sleman)',
  'Mlati',
  'Ngaglik',
  'Gamping',
  'Kasihan',
  'Sewon',
  'Banguntapan',

  // Jawa Timur & Surabaya & Malang
  'Gubeng',
  'Tegalsari',
  'Wonokromo',
  'Genteng',
  'Bubutan',
  'Simokerto',
  'Rungkut',
  'Sukolilo',
  'Tambaksari',
  'Sawahan',
  'Mulyorejo',
  'Sukomanunggal',
  'Wiyung',
  'Dukuh Pakis',
  'Karangpilang',
  'Jambangan',
  'Klojen',
  'Blimbing',
  'Lowokwaru',
  'Sukun',
  'Kedungkandang',
  'Batu',
  'Sidoarjo',
  'Waru',
  'Candi',
  'Gresik',
  'Kebomas',

  // Bali
  'Denpasar Selatan',
  'Denpasar Barat',
  'Denpasar Utara',
  'Denpasar Timur',
  'Kuta',
  'Kuta Selatan',
  'Kuta Utara',
  'Mengwi',
  'Ubud',
  'Sukawati',
  'Gianyar',
  'Kediri (Tabanan)',

  // Sumatera
  'Medan Kota',
  'Medan Baru',
  'Medan Barat',
  'Medan Timur',
  'Medan Petisah',
  'Medan Polonia',
  'Medan Helvetia',
  'Medan Sunggal',
  'Medan Tembung',
  'Medan Amplas',
  'Percut Sei Tuan',
  'Padang Barat',
  'Padang Timur',
  'Padang Utara',
  'Ilir Barat I',
  'Ilir Timur I',
  'Bukit Kecil',
  'Sukarami',
  'Tampan',
  'Marpoyan Damai',
  'Payung Sekaki',
  'Batam Kota',
  'Lubuk Baja',
  'Batu Ampar',
  'Nongsa',
  'Sekupang',
  'Tanjungkarang Pusat',
  'Kedaton',
  'Way Halim',
  'Baiturrahman',
  'Kuta Alam',

  // Kalimantan
  'Banjarmasin Tengah',
  'Banjarmasin Barat',
  'Banjarmasin Timur',
  'Banjarmasin Selatan',
  'Banjarmasin Utara',
  'Pontianak Kota',
  'Pontianak Selatan',
  'Pontianak Barat',
  'Pontianak Tenggara',
  'Balikpapan Kota',
  'Balikpapan Selatan',
  'Balikpapan Tengah',
  'Balikpapan Utara',
  'Samarinda Kota',
  'Samarinda Ulu',
  'Samarinda Ilir',
  'Pahandut',
  'Jekan Raya',

  // Sulawesi
  'Ujung Pandang',
  'Panakkukang',
  'Tamalate',
  'Rappocini',
  'Makassar',
  'Biringkanaya',
  'Mariso',
  'Mamajang',
  'Wanea',
  'Malalayang',
  'Wenang',
  'Sario',
  'Tikala',
  'Palu Timur',
  'Palu Barat',
  'Mandonga',
  'Kadia',

  // Nusa Tenggara, Maluku & Papua
  'Mataram',
  'Ampenan',
  'Cakranegara',
  'Oebobo',
  'Kelapa Lima',
  'Kota Raja',
  'Komodo',
  'Sirimau',
  'Nusaniwe',
  'Ternate Tengah',
  'Jayapura Utara',
  'Jayapura Selatan',
  'Abepura',
  'Heram',
  'Sorong Kota',
  'Mimika Baru',
];

export const INDONESIA_KELURAHAN_LIST: string[] = [
  // Bandung
  'Cibadak',
  'Dago',
  'Pasirkaliki',
  'Sukaraja',
  'Karanganyar',
  'Cihapit',
  'Tamansari',
  'Sadang Serang',
  'Lebak Siliwangi',
  'Braga',
  'Merdeka',
  'Babakan Ciamis',
  'Sukabungah',
  'Sukagalih',
  'Pasteur',
  'Isola',
  'Gegerkalong',
  'Malabar',
  'Burangrang',
  'Turangga',
  'Antapani Kulon',
  'Antapani Tengah',
  'Arcamanik Endah',
  'Cisaranten Kulon',
  'Ciateul',
  'Pungkur',
  'Panjunan',
  'Pelindung Hewan',
  'Nyengseret',

  // Jakarta Selatan & Pusat
  'Senayan',
  'Gondangdia',
  'Menteng',
  'Gambir',
  'Kebon Sirih',
  'Cikini',
  'Pegangsaan',
  'Melawai',
  'Gunung',
  'Kramat Pela',
  'Selong',
  'Rawa Barat',
  'Petogogan',
  'Pulo',
  'Gandaria Utara',
  'Gandaria Selatan',
  'Cipete Utara',
  'Cipete Selatan',
  'Pondok Pinang',
  'Lebak Bulus',
  'Cilandak Barat',
  'Kuningan Barat',
  'Kuningan Timur',
  'Menteng Atas',
  'Karet Semanggi',
  'Karet Kuningan',
  'Tebet Barat',
  'Tebet Timur',
  'Manggarai',
  'Pasar Manggis',

  // Jakarta Barat & Utara & Timur
  'Tomang',
  'Grogol',
  'Tanjung Duren Utara',
  'Tanjung Duren Selatan',
  'Kemanggisan',
  'Slipi',
  'Kedoya Utara',
  'Kedoya Selatan',
  'Meruya Utara',
  'Meruya Selatan',
  'Kembangan Utara',
  'Kembangan Selatan',
  'Pluit',
  'Penjaringan',
  'Pejagalan',
  'Kapuk Muara',
  'Kamal Muara',
  'Ancol',
  'Pademangan Barat',
  'Pademangan Timur',
  'Kelapa Gading Barat',
  'Kelapa Gading Timur',
  'Pegangsaan Dua',
  'Sunter Agung',
  'Sunter Jaya',
  'Rawamangun',
  'Kayu Putih',
  'Pisangan Timur',
  'Jatinegara Kaum',

  // Tangerang Raya & Banten
  'Lengkong Gudang',
  'Lengkong Gudang Timur',
  'Lengkong Karya',
  'Rawa Buntu',
  'Rawa Mekar Jaya',
  'Serpong',
  'Buaran',
  'Ciater',
  'Pondok Jagung',
  'Pondok Jagung Timur',
  'Pakulonan',
  'Pondok Ranji',
  'Bintaro',
  'Cempaka Putih (Ciputat)',
  'Cireundeu',
  'Pisangan',
  'Sukasari',
  'Babakan',
  'Sukarasa',
  'Tanah Tinggi',
  'Buaran Indah',
  'Bencongan',
  'Kelapa Dua',
  'Curug Kulon',

  // Bogor, Depok, Bekasi
  'Babakan Pasar',
  'Paledang',
  'Gudang',
  'Tegallega',
  'Baranangsiang',
  'Bantarjati',
  'Tegal Gundil',
  'Depok',
  'Depok Jaya',
  'Pancoran Mas',
  'Kemiri Muka',
  'Pondok Cina',
  'Beji',
  'Kukusan',
  'Margonda',
  'Bintara',
  'Kranji',
  'Jaka Sampurna',
  'Pekayon Jaya',
  'Kayuringin Jaya',
  'Marga Jaya',
  'Harapan Baru',

  // Jawa Tengah & Solo
  'Simpang Lima',
  'Pleburan',
  'Mugassari',
  'Randusari',
  'Kauman',
  'Sekayu',
  'Pandansari',
  'Banyumanik',
  'Srondol Kulon',
  'Srondol Wetan',
  'Manahan',
  'Kerten',
  'Keprabon',
  'Sriwedari',
  'Timuran',
  'Kampung Baru',
  'Mangkubumen',
  'Purwosari',

  // DI Yogyakarta
  'Kotabaru',
  'Terban',
  'Klitren',
  'Sosromenduran',
  'Suryatmajan',
  'Ngupasan',
  'Prawirodirjan',
  'Wirobrajan',
  'Patangpuluhan',
  'Caturtunggal',
  'Condongcatur',
  'Maguwoharjo',
  'Sinduadi',
  'Sendangadi',
  'Tamantirto',
  'Bangunharjo',

  // Jawa Timur & Surabaya & Malang
  'Gubeng',
  'Airlangga',
  'Kertajaya',
  'Barata Jaya',
  'Keputih',
  'Gebang Putih',
  'Klampis Ngasem',
  'Tegalsari',
  'Dr. Soetomo',
  'Wonorejo',
  'Kedungdoro',
  'Embong Kaliasin',
  'Ketabang',
  'Kapasari',
  'Darmo',
  'Sawahan',
  'Petemon',
  'Kupang Krajan',
  'Banyu Urip',
  'Oro-oro Dowo',
  'Kauman (Malang)',
  'Rampal Celaket',
  'Lowokwaru',
  'Jatimulyo',
  'Ketawanggede',
  'Mojolangu',
  'Tlogomas',

  // Bali
  'Sanur',
  'Sanur Kaja',
  'Sanur Kauh',
  'Renon',
  'Panjer',
  'Sesetan',
  'Sidakarya',
  'Dauh Puri',
  'Dauh Puri Kangin',
  'Dauh Puri Kelod',
  'Pemecutan',
  'Seminyak',
  'Legian',
  'Kuta',
  'Tuban',
  'Jimbaran',
  'Benoa',
  'Kedonganan',
  'Canggu',
  'Kerobokan',
  'Kerobokan Kelod',
  'Tibubeneng',
  'Ubud',
  'Campuhan',
  'Peliatan',

  // Sumatera
  'Kesawan',
  'Kampung Madras',
  'Petisah Tengah',
  'Merdeka',
  'Babura',
  'Padang Bulan',
  'Belawan I',
  'Belawan II',
  'Belakang Pondok',
  'Kampung Pondok',
  'Olo',
  'Purus',
  '20 Ilir D-I',
  '24 Ilir',
  'Demang Lebar Daun',
  'Simpang Baru',
  'Sukajadi (Pekanbaru)',
  'Sungai Panas',
  'Pelita',
  'Kampung Seraya',
  'Enggal',
  'Rawa Laut',
  'Kp. Baru (Banda Aceh)',

  // Kalimantan
  'Kertak Baru Ilir',
  'Kertak Baru Ulu',
  'Melayu',
  'Benua Anyar',
  'Antasan Besar',
  'Benua Melayu Laut',
  'Benua Melayu Darat',
  'Akcaya',
  'Sungai Bangkong',
  'Klandasan Ulu',
  'Klandasan Ilir',
  'Damai',
  'Gunung Sari Ilir',
  'Bugis',
  'Jawa',
  'Pelabuhan',
  'Pasar Pagi',

  // Sulawesi
  'Losari',
  'Maloku',
  'Mangkura',
  'Sawerigading',
  'Mariso',
  'Mattoangin',
  'Bontoala',
  'Pannampu',
  'Malalayang Satu',
  'Malalayang Dua',
  'Wenang Selatan',
  'Wenang Utara',
  'Lolu Utara',
  'Lolu Selatan',
  'Besusu Barat',
  'Kadia',
  'Bende',

  // Nusa Tenggara, Maluku, Papua
  'Mataram Barat',
  'Mataram Timur',
  'Pagesangan',
  'Cakranegara Barat',
  'Oebobo',
  'Oetete',
  'Labuan Bajo',
  'Honipopu',
  'Batu Meja',
  'Uritetu',
  'Gurabesi',
  'Numbay',
  'Koya Barat',
  'Koya Timur',
  'Vim',
  'Wahno',
  'Remu',
  'Remu Selatan',
  'Kwiyani',
];

// Helper to get cities by province
export const getKotaByProvinsi = (provinsi?: string): string[] => {
  if (!provinsi) return INDONESIA_KOTA_KABUPATEN_LIST;
  const match = Object.keys(indonesiaRegionsJson.citiesByProvince).find(
    (p) => p.toLowerCase() === provinsi.trim().toLowerCase()
  );
  return match
    ? (indonesiaRegionsJson.citiesByProvince as Record<string, string[]>)[match]
    : INDONESIA_KOTA_KABUPATEN_LIST;
};

// Helper to get districts by city (with priority for known districts in that city)
export const getKecamatanByKota = (kota?: string): string[] => {
  if (!kota) return INDONESIA_KECAMATAN_LIST;
  const normalizedKota = kota.trim().toLowerCase();
  const districtMap = indonesiaRegionsJson.districtsByCity as Record<string, string[]>;
  const matchKey = Object.keys(districtMap).find(
    (k) =>
      k.toLowerCase() === normalizedKota ||
      normalizedKota.includes(k.toLowerCase()) ||
      k.toLowerCase().includes(normalizedKota)
  );
  if (matchKey) {
    const prioritized = districtMap[matchKey];
    const others = INDONESIA_KECAMATAN_LIST.filter((k) => !prioritized.includes(k));
    return [...prioritized, ...others];
  }
  return INDONESIA_KECAMATAN_LIST;
};

// Helper to get villages by district (with priority for known villages in that district)
export const getKelurahanByKecamatan = (kecamatan?: string): string[] => {
  if (!kecamatan) return INDONESIA_KELURAHAN_LIST;
  const normalizedKec = kecamatan.trim().toLowerCase().replace(/^kecamatan\s+/i, '');
  const villageMap = indonesiaRegionsJson.villagesByDistrict as Record<string, string[]>;
  const matchKey = Object.keys(villageMap).find(
    (k) =>
      k.toLowerCase() === normalizedKec ||
      normalizedKec.includes(k.toLowerCase()) ||
      k.toLowerCase().includes(normalizedKec)
  );
  if (matchKey) {
    const prioritized = villageMap[matchKey];
    const others = INDONESIA_KELURAHAN_LIST.filter((k) => !prioritized.includes(k));
    return [...prioritized, ...others];
  }
  return INDONESIA_KELURAHAN_LIST;
};

// Helper to find province of a city
export const getProvinsiByKota = (kota?: string): string | null => {
  if (!kota) return null;
  const normalizedKota = kota.trim().toLowerCase();
  const citiesMap = indonesiaRegionsJson.citiesByProvince as Record<string, string[]>;
  for (const [prov, cities] of Object.entries(citiesMap)) {
    if (cities.some((c) => c.toLowerCase() === normalizedKota || normalizedKota.includes(c.toLowerCase()))) {
      return prov;
    }
  }
  return null;
};
