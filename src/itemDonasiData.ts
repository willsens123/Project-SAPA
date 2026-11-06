export interface ItemDonasiChild {
  id: string;
  badgeLetter: string;
  badgeColor: string;
  name: string;
  price: string;
  description: string;
  tanggal: string;
}

export interface ItemDonasiEvent {
  id: string;
  badgeLetter: string;
  badgeColor: string;
  name: string;
  subtitle: string;
  subJenis?: string;
  subJenisItem?: string;
  proyekSapa?: string;
  pemasukanDivisi?: string;
  tandaTerimaTemplateId?: string;
  tandaTerimaTemplateName?: string;
  status: 'Ongoing' | 'Berakhir' | string;
  tanggalRange: string;
  wibTime: string;
  linkText: string;
  linkUrl?: string;
  disalurkanKepadaText: string;
  isDisalurkanPill?: boolean;
  children?: ItemDonasiChild[];
}

export const INITIAL_ITEM_DONASI_EVENTS: ItemDonasiEvent[] = [
  {
    id: 'item-donasi-1',
    badgeLetter: 'K',
    badgeColor: 'bg-[#E05D44]',
    name: 'Kathina 2021',
    subtitle: 'Kathina Dana - MAD',
    subJenis: 'Kathina Dana',
    proyekSapa: 'Kathina Dana - MAD',
    pemasukanDivisi: 'MAD',
    status: 'Ongoing',
    tanggalRange: '11 Agu 2021 - 21 Nov 2021',
    wibTime: '00:00 WIB   23.59 WIB',
    linkText: 'Poster - Website',
    disalurkanKepadaText: '200 Anggota Sangha',
    isDisalurkanPill: true,
    children: [
      {
        id: 'child-1-1',
        badgeLetter: 'A',
        badgeColor: 'bg-[#008d91]',
        name: 'Kathina 2021 - Ashoka',
        price: 'Rp100.777',
        description: '1 buku Dharma',
        tanggal: '-',
      },
      {
        id: 'child-1-2',
        badgeLetter: 'B',
        badgeColor: 'bg-[#0F766E]',
        name: 'Kathina 2021 - Bimbisara',
        price: 'Rp250.777',
        description: '2 buku Dharma, 1 pak vitamin',
        tanggal: '-',
      },
      {
        id: 'child-1-3',
        badgeLetter: 'K',
        badgeColor: 'bg-[#E05D44]',
        name: 'Kathina 2021 - Kosala',
        price: 'Rp500.777',
        description: '3 buku Dharma, 1 pak vitamin, dana kebutuha...',
        tanggal: '-',
      },
      {
        id: 'child-1-4',
        badgeLetter: 'V',
        badgeColor: 'bg-[#E29578]',
        name: 'Kathina 2021 - Visakha',
        price: 'Rp1.118.777',
        description: '7 buku Dharma, dana jubah',
        tanggal: '-',
      },
      {
        id: 'child-1-5',
        badgeLetter: 'A',
        badgeColor: 'bg-[#008d91]',
        name: 'Kathina 2021 - Ananthapindika',
        price: 'Rp5.000.777',
        description: '35 buku Dharma, 4 pak vitamin, dana kebutuha....',
        tanggal: '-',
      },
    ],
  },
  {
    id: 'item-donasi-2',
    badgeLetter: 'E',
    badgeColor: 'bg-[#10B981]',
    name: 'Empat Segel Agung',
    subtitle: 'Dharma Patron Non-Rutin - FUN',
    subJenis: 'Dharma Patron Non-Rutin',
    proyekSapa: 'Dharma Patron Non-Rutin - FUN',
    pemasukanDivisi: 'FUN',
    status: 'Ongoing',
    tanggalRange: '11 Nov 2021 - 21 Des 2021',
    wibTime: '00:00 WIB   23.59 WIB',
    linkText: 'Poster - Website',
    disalurkanKepadaText: 'Pos D. Patron',
    isDisalurkanPill: false,
    children: [],
  },
  {
    id: 'item-donasi-3',
    badgeLetter: 'D',
    badgeColor: 'bg-[#008d91]',
    name: 'Dharma Patron Rutin 2021',
    subtitle: 'Dharma Patron Rutin - FUN',
    subJenis: 'Dharma Patron Rutin',
    proyekSapa: 'Dharma Patron Rutin - FUN',
    pemasukanDivisi: 'FUN',
    status: 'Ongoing',
    tanggalRange: '01 Jan 2021 - 31 Des 2021',
    wibTime: '00:00 WIB   23.59 WIB',
    linkText: 'Poster - Website',
    disalurkanKepadaText: 'Yayasan & Sangha',
    isDisalurkanPill: true,
    children: [],
  },
  {
    id: 'item-donasi-4',
    badgeLetter: 'P',
    badgeColor: 'bg-[#5e35b1]',
    name: 'Donasi Penerbitan Buku Dharma',
    subtitle: 'Donasi Penerbitan Buku - PNB',
    subJenis: 'Donasi Penerbitan Buku',
    proyekSapa: 'Donasi Penerbitan Buku - PNB',
    pemasukanDivisi: 'PNB',
    status: 'Ongoing',
    tanggalRange: '01 Mar 2021 - 30 Des 2021',
    wibTime: '00:00 WIB   23.59 WIB',
    linkText: 'Poster - Website',
    disalurkanKepadaText: 'Komunitas & Perpustakaan',
    isDisalurkanPill: true,
    children: [],
  },
  {
    id: 'item-donasi-5',
    badgeLetter: 'B',
    badgeColor: 'bg-[#008d91]',
    name: 'Donasi Buku Berbayar Siswa Mandiri',
    subtitle: 'Donasi Buku Berbayar - PNB',
    subJenis: 'Donasi Buku Berbayar',
    proyekSapa: 'Donasi Buku Berbayar - PNB',
    pemasukanDivisi: 'PNB',
    status: 'Ongoing',
    tanggalRange: '15 Mei 2021 - 15 Nov 2021',
    wibTime: '00:00 WIB   23.59 WIB',
    linkText: 'Poster - Website',
    disalurkanKepadaText: 'Siswa & Mahasiswa',
    isDisalurkanPill: true,
    children: [],
  },
  {
    id: 'item-donasi-6',
    badgeLetter: 'O',
    badgeColor: 'bg-[#f39c12]',
    name: 'Dana Operasional Pos Pelayanan',
    subtitle: 'Donasi Operasional - UMM',
    subJenis: 'Donasi Operasional',
    proyekSapa: 'Donasi Operasional - UMM',
    pemasukanDivisi: 'UMM',
    status: 'Ongoing',
    tanggalRange: '01 Jan 2021 - 31 Des 2021',
    wibTime: '00:00 WIB   23.59 WIB',
    linkText: 'Poster - Website',
    disalurkanKepadaText: 'Operasional Relawan',
    isDisalurkanPill: false,
    children: [],
  },
  {
    id: 'item-donasi-7',
    badgeLetter: 'E',
    badgeColor: 'bg-[#10B981]',
    name: 'Event XXX',
    subtitle: 'Event - EVE',
    subJenis: 'Event Donasi',
    proyekSapa: 'Event - EVE',
    pemasukanDivisi: 'EVE',
    status: 'Berakhir',
    tanggalRange: '29 Okt 2021 - 30 Okt 2021',
    wibTime: '00:00 WIB   23.59 WIB',
    linkText: 'Poster - Website',
    disalurkanKepadaText: 'Event Halloween Party',
    isDisalurkanPill: true,
    children: [],
  },
];
