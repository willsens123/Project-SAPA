import {
  JenisPanggilanItem,
  TriyanaItem,
  PekerjaanItem,
  MengenalYpplnItem,
} from './types';

export const INITIAL_JENIS_PANGGILAN: JenisPanggilanItem[] = [
  {
    id: 'jp-1',
    jenisPanggilan: 'Kakak',
    lengkap: 'kakak',
    singkat: 'kak',
    isPrimary: true,
  },
  {
    id: 'jp-2',
    jenisPanggilan: 'Cici',
    lengkap: 'cici',
    singkat: 'ci',
    isPrimary: false,
  },
  {
    id: 'jp-3',
    jenisPanggilan: 'YL',
    lengkap: 'YL',
    singkat: 'YL',
    isPrimary: false,
  },
  {
    id: 'jp-4',
    jenisPanggilan: 'Bude',
    lengkap: 'bude',
    singkat: 'bude',
    isPrimary: false,
  },
];

export const INITIAL_TRIYANA: TriyanaItem[] = [
  {
    id: 'tri-1',
    triyana: 'Theravada',
    keterangan: '-',
  },
  {
    id: 'tri-2',
    triyana: 'Mahayana',
    keterangan: '-',
  },
  {
    id: 'tri-3',
    triyana: 'Tantrayana',
    keterangan: '-',
  },
  {
    id: 'tri-4',
    triyana: 'Non-Buddhis',
    keterangan: '-',
  },
];

export const INITIAL_PEKERJAAN: PekerjaanItem[] = [
  {
    id: 'pek-1',
    namaPekerjaan: 'Karyawan Swasta',
    keterangan: '-',
  },
  {
    id: 'pek-2',
    namaPekerjaan: 'Dokter',
    keterangan: '-',
  },
  {
    id: 'pek-3',
    namaPekerjaan: 'Dokter Hewan',
    keterangan: '-',
  },
];

export const INITIAL_MENGENAL_YPPLN: MengenalYpplnItem[] = [
  {
    id: 'my-1',
    mengenalYppln: 'Teman/Keluarga',
    keterangan: '-',
  },
  {
    id: 'my-2',
    mengenalYppln: 'Media Sosial',
    keterangan: '-',
  },
  {
    id: 'my-3',
    mengenalYppln: '???',
    keterangan: '-',
  },
];
