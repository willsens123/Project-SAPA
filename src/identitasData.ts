export interface AlamatIdentitas {
  id?: string;
  namaPenerima?: string;
  nomorHp?: string;
  alamat: string;
  provinsi?: string;
  kota?: string;
  kecamatan?: string;
  kelurahan?: string;
  kotaKabupaten?: string;
  rt?: string;
  rw?: string;
  kodePos?: string;
  notePengiriman?: string;
  isPrimary?: boolean;
}

export interface IdentitasItem {
  id: string;
  nomorIdentitas?: string;
  jenisIdentitas?: 'KTP' | 'Passport' | 'Nomor Siswa';
  namaLengkapKtp?: string;
  namaLengkap: string;
  namaPanggilan: string;
  codeId?: string;
  jenisPanggilan?: string;
  jenisKelamin: 'L' | 'P';
  tempatLahir?: string;
  tanggalLahir: string;
  nomorHandPhone: string;
  email?: string;
  line?: string;
  instagram?: string;
  bhanteLay: 'Bhante' | 'Lay';
  organisasi: string;
  status: 'VIP' | 'Blacklist' | '-' | string;
  custDuration: '3 Bulan' | '2 Bulan' | '1 Bulan' | '-' | string;
  lastContacted: string;
  pic: string;
  avatarInitial: string;
  avatarBg: string;
  avatarUrl?: string;
  isStarred?: boolean;
  kota?: string;
  provinsi?: string;
  // Detail form fields
  alamatList?: AlamatIdentitas[];
  tempatTinggal?: {
    samaDenganKtp: boolean;
    alamat: AlamatIdentitas;
  };
  ktp?: {
    nik: string;
    alamatKtp: AlamatIdentitas;
  };
  bank?: string;
  nomorRekening?: string;
  keterangan?: string;
  jenis?: 'Umat' | 'Sangha';
  wniStatus?: 'WNI' | 'WNA';
  pekerjaan?: string;
  agama?: string;
  triyana?: string;
  picYppln?: string;
  mengenalYppln?: string;
  followUpList?: string[];
  picUmumList?: string[];
  cvUrl?: string;
}

export const INITIAL_IDENTITAS: IdentitasItem[] = [
  {
    id: 'id-noname',
    codeId: 'No Name',
    namaLengkap: 'No Name',
    namaPanggilan: 'No Name',
    avatarInitial: 'NN',
    avatarBg: 'bg-slate-500',
    jenisKelamin: 'L',
    tanggalLahir: '-',
    bhanteLay: 'Lay',
    organisasi: '-',
    nomorHandPhone: '-',
    status: '-',
    custDuration: '-',
    lastContacted: '-',
    pic: '-',
    alamatList: [
      {
        id: 'addr-noname-1',
        namaPenerima: 'No Name',
        nomorHp: '-',
        alamat: 'Ambil di Tempat / Stand',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'id-1',
    codeId: '00031',
    namaLengkap: 'Agustino Ong',
    namaPanggilan: 'Ko Agus',
    avatarInitial: 'A',
    avatarBg: 'bg-[#14b8a6]', // Teal
    jenisKelamin: 'L',
    tanggalLahir: '02 Nov 1990',
    bhanteLay: 'Lay',
    organisasi: 'YPPLN, MAH',
    nomorHandPhone: '+6281234567890',
    email: 'agustino@gmail.com',
    kota: 'Bandung, Jawa Barat',
    status: 'VIP',
    custDuration: '3 Bulan',
    lastContacted: '14 Nov 2021',
    pic: 'Agustino',
    jenisIdentitas: 'KTP',
    jenis: 'Umat',
    wniStatus: 'WNI',
    agama: 'Buddha',
    pekerjaan: 'Wiraswasta',
    alamatList: [
      {
        id: 'addr-1',
        namaPenerima: 'Agustino Ong',
        nomorHp: '+6281234567890',
        alamat: 'Jl. Surya Kencana No. 12',
        kelurahan: 'Cibadak',
        kecamatan: 'Astanaanyar',
        kotaKabupaten: 'Kota Bandung',
        kodePos: '40241',
        notePengiriman: 'Titip di satpam',
        isPrimary: true,
      },
    ],
  },
  {
    id: 'id-2',
    codeId: '00035',
    namaLengkap: 'Stanley Khu',
    namaPanggilan: 'Pak Stanley',
    avatarInitial: 'S',
    avatarBg: 'bg-[#00a896]', // Teal
    jenisKelamin: 'L',
    tanggalLahir: '10 Jan 1985',
    bhanteLay: 'Lay',
    organisasi: 'YPPLN, VIP Patron',
    nomorHandPhone: '+6281890123456',
    email: 'stanley@gmail.com',
    kota: 'Jakarta Barat, DKI Jakarta',
    status: 'VIP',
    custDuration: '3 Bulan',
    lastContacted: '10 Jan 2021',
    pic: 'Stanley',
    jenisIdentitas: 'KTP',
    jenis: 'Umat',
    wniStatus: 'WNI',
    agama: 'Buddha',
    pekerjaan: 'Pengusaha',
  },
  {
    id: 'id-6',
    codeId: '00036',
    namaLengkap: 'Sherly Ong',
    namaPanggilan: 'Sherly',
    avatarInitial: 'S',
    avatarBg: 'bg-[#0d9488]', // Dark Teal
    jenisKelamin: 'P',
    tanggalLahir: '15 Jan 1993',
    bhanteLay: 'Lay',
    organisasi: 'YPPLN, MAH',
    nomorHandPhone: '+6281312345678',
    email: 'sherly@gmail.com',
    kota: 'Bandung, Jawa Barat',
    status: 'VIP',
    custDuration: '1 Bulan',
    lastContacted: '15 Jan 2021',
    pic: 'Agustino',
    jenisIdentitas: 'KTP',
    jenis: 'Umat',
    wniStatus: 'WNI',
    agama: 'Buddha',
    pekerjaan: 'Wiraswasta',
  },
  {
    id: 'id-7',
    codeId: '00032',
    namaLengkap: 'Karunika Dewi',
    namaPanggilan: 'Ci Karun',
    avatarInitial: 'K',
    avatarBg: 'bg-[#00a896]', // Teal
    jenisKelamin: 'P',
    tanggalLahir: '15 Mar 1991',
    bhanteLay: 'Lay',
    organisasi: 'YPPLN',
    nomorHandPhone: '+6281298765432',
    email: 'karunika@gmail.com',
    kota: 'Jakarta Utara, DKI Jakarta',
    status: 'VIP',
    custDuration: '3 Bulan',
    lastContacted: '15 Mar 2019',
    pic: 'Karunika',
    jenisIdentitas: 'KTP',
    jenis: 'Umat',
    wniStatus: 'WNI',
    agama: 'Buddha',
    pekerjaan: 'Profesional',
  },
  {
    id: 'id-8',
    codeId: '00033',
    namaLengkap: 'Vioni Hartono',
    namaPanggilan: 'Vioni',
    avatarInitial: 'V',
    avatarBg: 'bg-[#00a896]', // Teal
    jenisKelamin: 'P',
    tanggalLahir: '04 Jun 1992',
    bhanteLay: 'Lay',
    organisasi: 'KCI Bandung',
    nomorHandPhone: '+6281345678901',
    email: 'vioni@gmail.com',
    kota: 'Bandung, Jawa Barat',
    status: '-',
    custDuration: '2 Bulan',
    lastContacted: '04 Jun 2020',
    pic: 'Vioni',
    jenisIdentitas: 'KTP',
    jenis: 'Umat',
    wniStatus: 'WNI',
    agama: 'Buddha',
    pekerjaan: 'Karyawan',
  },
  {
    id: 'id-9',
    codeId: '00034',
    namaLengkap: 'Melyana Tan',
    namaPanggilan: 'Mely',
    avatarInitial: 'M',
    avatarBg: 'bg-[#00a896]', // Teal
    jenisKelamin: 'P',
    tanggalLahir: '20 Agu 1989',
    bhanteLay: 'Lay',
    organisasi: 'MAH',
    nomorHandPhone: '+6281567890123',
    email: 'melyana@gmail.com',
    kota: 'Bandung, Jawa Barat',
    status: '-',
    custDuration: '1 Bulan',
    lastContacted: '20 Agu 2020',
    pic: 'Melyana',
    jenisIdentitas: 'KTP',
    jenis: 'Umat',
    wniStatus: 'WNI',
    agama: 'Buddha',
    pekerjaan: 'Wiraswasta',
  },
  {
    id: 'id-3',
    codeId: '00019',
    namaLengkap: 'Cindy Budiman',
    namaPanggilan: 'Ci Pao',
    avatarInitial: 'C',
    avatarBg: 'bg-[#eab308]', // Yellow
    jenisKelamin: 'P',
    tanggalLahir: '10 Nov 1990',
    bhanteLay: 'Bhante',
    organisasi: 'YWSN, Sumarti Kirti',
    nomorHandPhone: '+6281234567890',
    email: 'cindy@gmail.com',
    kota: 'Bandung, Jawa Barat',
    status: '-',
    custDuration: '-',
    lastContacted: '14 Nov 2021',
    pic: 'Cindy',
    jenisIdentitas: 'KTP',
    jenis: 'Sangha',
    wniStatus: 'WNI',
    agama: 'Buddha',
  },
  {
    id: 'id-4',
    codeId: '00800',
    namaLengkap: 'Bhadra Ksanti',
    namaPanggilan: 'Sucek Shi Xian Jen',
    avatarInitial: 'B',
    avatarBg: 'bg-[#0f766e]', // Dark Teal/Emerald
    jenisKelamin: 'P',
    tanggalLahir: '16 Mar 1986',
    bhanteLay: 'Lay',
    organisasi: 'Vihara XXX',
    nomorHandPhone: '+6281355588899',
    email: 'bhadra@gmail.com',
    kota: 'Medan, Sumatera Utara',
    status: 'VIP',
    custDuration: '-',
    lastContacted: '-',
    pic: 'Cindy',
    jenisIdentitas: 'Passport',
    jenis: 'Umat',
    wniStatus: 'WNI',
    agama: 'Buddha',
  },
  {
    id: 'id-5',
    codeId: '00018',
    namaLengkap: 'Silvia Fukada',
    namaPanggilan: 'Ci Silvia',
    avatarInitial: 'S',
    avatarBg: 'bg-[#64748b]', // Slate
    jenisKelamin: 'L',
    tanggalLahir: '12 Jan 2003',
    bhanteLay: 'Bhante',
    organisasi: '-',
    nomorHandPhone: '+6281987654321',
    email: 'silvia@gmail.com',
    kota: 'Bandung, Jawa Barat',
    status: '-',
    custDuration: '2 Bulan',
    lastContacted: '1 Jan 2021',
    pic: 'Cindy',
    jenisIdentitas: 'KTP',
    jenis: 'Sangha',
    wniStatus: 'WNI',
    agama: 'Buddha',
  },
  {
    id: 'id-10003',
    codeId: '10003',
    namaLengkap: 'Dewi Lestari',
    namaPanggilan: 'Dewi',
    avatarInitial: 'D',
    avatarBg: 'bg-[#e05244]', // Coral/Red
    jenisKelamin: 'P',
    tanggalLahir: '24 Apr 1991',
    bhanteLay: 'Lay',
    organisasi: 'YPPLN',
    nomorHandPhone: '+6281310098765',
    email: 'dewi.lestari@gmail.com',
    kota: 'Jakarta Selatan, DKI Jakarta',
    status: 'VIP',
    custDuration: '2 Bulan',
    lastContacted: '12 Nov 2021',
    pic: 'Dewi',
    bank: 'Mandiri',
    nomorRekening: '1310098765432',
    keterangan: 'Kasbon Operasional Kegiatan Dharma',
  },
  {
    id: 'id-10004',
    codeId: '10004',
    namaLengkap: 'Budi Santoso',
    namaPanggilan: 'Pak Budi',
    avatarInitial: 'B',
    avatarBg: 'bg-[#0d9488]', // Teal
    jenisKelamin: 'L',
    tanggalLahir: '15 Sep 1982',
    bhanteLay: 'Lay',
    organisasi: 'YPPLN',
    nomorHandPhone: '+6281234567891',
    email: 'budi.santoso@gmail.com',
    kota: 'Surabaya, Jawa Timur',
    status: 'VIP',
    custDuration: '3 Bulan',
    lastContacted: '10 Nov 2021',
    pic: 'Budi',
    bank: 'BNI',
    nomorRekening: '0234567891',
    keterangan: 'Pengeluaran Logistik & Penerbitan',
  },
  {
    id: 'id-10005',
    codeId: '10005',
    namaLengkap: 'Siti Rahmawati',
    namaPanggilan: 'Ibu Siti',
    avatarInitial: 'S',
    avatarBg: 'bg-[#64748b]', // Slate
    jenisKelamin: 'P',
    tanggalLahir: '08 Mei 1988',
    bhanteLay: 'Lay',
    organisasi: 'YPPLN',
    nomorHandPhone: '+6281120100234',
    email: 'siti.rahmawati@gmail.com',
    kota: 'Bandung, Jawa Barat',
    status: '-',
    custDuration: '1 Bulan',
    lastContacted: '08 Nov 2021',
    pic: 'Cindy',
    bank: 'BRI',
    nomorRekening: '011201002345501',
    keterangan: 'Reimburse Transport & Konsumsi Acara',
  },
];

export const INITIAL_CHANGE_LOGS = [
  {
    id: 'log-1',
    identitasId: 'id-1',
    codeId: '00031',
    namaLengkap: 'Agustino Ong',
    timestamp: 'Senin, 15 Nov 2021 09:30',
    field: 'Nomor HandPhone',
    oldValue: '08123456780',
    newValue: '+6281234567890',
    alasan: 'Perubahan nomor HP WhatsApp aktif',
    actionType: 'Ubah' as const,
  },
  {
    id: 'log-2',
    identitasId: 'id-1',
    codeId: '00031',
    namaLengkap: 'Agustino Ong',
    timestamp: 'Senin, 15 Nov 2021 08:45',
    field: 'Status',
    oldValue: '-',
    newValue: 'VIP',
    alasan: 'Update status donatur aktif VIP',
    actionType: 'Ubah' as const,
  },
  {
    id: 'log-3',
    identitasId: 'id-3',
    codeId: '00019',
    namaLengkap: 'Cindy Budiman',
    timestamp: 'Minggu, 14 Nov 2021 16:20',
    field: 'Organisasi',
    oldValue: 'YWSN',
    newValue: 'YWSN, Sumarti Kirti',
    alasan: 'Penambahan organisasi keanggotaan baru',
    actionType: 'Ubah' as const,
  },
];
