# Rencana Implementasi: Otomatisasi Jurnal Umum Terintegrasi Berbasis Mutasi Bank

Logika otomatis pembuatan Jurnal Umum yang komprehensif dari Mutasi Bank, menghubungkan seluruh modul yang telah dibangun: **Kebutuhan Pengeluaran dengan Akun COA mandiri**, **Alokasi Pos Keuangan & Pos Pemasukan/Pengeluaran**, **Transaksi S-SALUR**, **Donasi Patron Rutin/Non-Rutin**, dan **Kegiatan Ajar**.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> Pertimbangan arsitektur utama yang diterapkan berdasarkan best practices akuntansi yayasan & data master yang telah dibangun:
> - **Mutasi DB (Uang Keluar / Pengeluaran)**: Akun Debet otomatis diprioritaskan mengambil dari **No Akun COA & Nama Akun COA Kebutuhan Pengeluaran** (misal `60100` Gaji, `60200` Air PDAM & Internet, `50100` Cetak Buku Dharma, dsb.) atau Akun Aktiva Proyek jika terkait proyek spesifik.
> - **Mutasi CR (Uang Masuk / Salur & Donasi)**: Akun Kredit mengambil pendapatan per item buku/donasi, dan Kas Debet otomatis displit sesuai persentase **Pos Keuangan Alokasi** (20% Penerbitan, 20% Retret, 30% Ops Dharma, 30% Ops Non-Dharma).
> - **Multi-Linked Transactions**: Jika satu baris mutasi terhubung ke beberapa transaksi (baik multiple Pengeluaran atau multiple Salur/Donasi/Fee), dibuatkan **jurnal multi-line proporsional** yang menjamin $\sum \text{Debet} = \sum \text{Kredit}$ (Balanced).
> - **Status Default**: Otomatis berstatus **Disetujui** (*Approved*) saat sinkronisasi mutasi, dengan log audit lengkap.

---

### 1. Overview & Core Concept

- **What It Does**: Membangun engine generasi jurnal otomatis (`generateJournalsFromMutasi`) yang cerdas dan menyeluruh, di mana setiap perubahan pada Mutasi Bank (CR/DB), penambahan kode mutasi pada Pengeluaran, atau transaksi S-SALUR/Donasi langsung menghasilkan entri Jurnal Umum yang seimbang (*balanced double-entry*) dan merefleksikan saldo real-time pada seluruh menu laporan akuntansi (Jurnal Umum, Buku Besar, Neraca, dan Laba Rugi).
- **Target Audience**: Tim Keuangan, Akuntan Yayasan, dan Manajemen YPPLN.
- **Key Value**: Menghilangkan entri manual jurnal, mencegah selisih pembukuan, dan menjamin 100% konsistensi antara Mutasi Bank, Pengeluaran, Salur, Donasi, dan Chart of Accounts (COA).

---

### 2. User Experience & Visual Design

- **Alur Pengguna**:
  1. Pengguna menghubungkan Mutasi pada menu Pengeluaran (melalui "Tambahkan Kode Mutasi" DB) atau transaksi S-SALUR/Donasi (CR).
  2. Sistem secara instan memperbarui Jurnal Umum tanpa perlu input manual.
  3. Pada tab **Jurnal Umum** di Laporan Keuangan, setiap baris jurnal menampilkan detail sumber transaksi, nomor mutasi referensi, program/kegiatan, serta rincian baris debet & kredit lengkap dengan nomor akun COA resmi.
  4. Pada **COA View** dan **Laporan Keuangan**, saldo akun kas dan beban terupdate secara dinamis dan presisi.

- **Desain & Tipografi**:
  - Format angka monospaced (`font-mono tabular-nums`) untuk nominal Debet & Kredit.
  - Badge sumber transaksi berwarna lembut: Hijau tosca untuk Pengeluaran terverifikasi, Biru untuk S-SALUR, Ungu untuk Donasi Patron, Amber untuk Kegiatan Ajar.
  - Indikator balance $\Delta = 0$ berwarna hijau emerald.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Resolusi Akun Beban dari Kebutuhan Pengeluaran Terhubung**
  - *Pendekatan*: Setiap mutasi DB mencari kecocokan data `Pengeluaran` (melalui `p.mutasiId` atau `mutasi.linkedTransactions` dengan `sourceType === 'pengeluaran'`). Dari sana, sistem membaca objek `kebutuhanPengeluaranList` untuk mengambil `noAkunCoa` dan `namaAkunCoa` yang sah.
  - *Rasional*: Memastikan konsistensi dengan fitur COA Kebutuhan Pengeluaran yang baru saja dibuat (misal Gaji `60100`, PDAM `60200`).
  - *Alternatif*: Hardcode string berbasis kata kunci teks bank dianggap usang (*deprecated*) dan hanya menjadi fallback lapis terakhir jika mutasi DB belum terhubung ke pengeluaran mana pun.

- **Decision 2: Resolusi Multi-Item & Alokasi Pos Keuangan untuk CR**
  - *Pendekatan*: Transaksi S-SALUR dan Donasi memecah kas masuk ke beberapa akun kas (`10001`, `10002`, `10003`, `10004`, `10202`) sesuai aturan alokasi Pos Pemasukan/Pos Keuangan (20:20:30:30), sementara fee marketplace (misal Tokopedia) otomatis didebetkan ke COA `69999`.
  - *Rasional*: Mencerminkan kepatuhan terhadap alokasi dana yayasan (Dana Terikat vs Dana Operasional).

- **Decision 3: Multi-Pengeluaran dalam 1 Mutasi Bank**
  - *Pendekatan*: Jika 1 transfer bank DB menanggung 2 atau lebih bon pengeluaran, dibuat baris multi-line Debet per pengeluaran dengan nominal masing-masing, dan 1 baris Kredit Bank senilai total mutasi.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          MUTASI BANK (CR / DB)                         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
         ┌─────────────────────────┴────────────────────────┐
         ▼                                                  ▼
┌──────────────────┐                               ┌──────────────────┐
│    TIPE 'DB'     │                               │    TIPE 'CR'     │
│  (Uang Keluar)   │                               │   (Uang Masuk)   │
└────────┬─────────┘                               └────────┬─────────┘
         │                                                  │
         ├─► Cocokkan Pengeluaran (mutasiId/linkedTrans)     ├─► S-SALUR Items (COA 40002-49990)
         ├─► Ambil noAkunCoa Kebutuhan (60100, 60200, dll)   ├─► Ongkir (60600) & Donasi (49998)
         ├─► Ambil Bank Account (10001/10002/10003/10004)   ├─► Donasi Patron (49997)
         │                                                  ├─► Alokasi Kas (20% Retret, 30% Ops, dll)
         ▼                                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│            ENGINE GENERASI JURNAL (generateJournalsFromMutasi)         │
│  - Debet Lines & Kredit Lines                                          │
│  - Balanced Check (Total Debet == Total Kredit)                        │
│  - Dynamic COA Name Resolution (coaMap)                                │
│  - Reversal Tracking Support                                           │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                HASIL JURNAL UMUM & LAPORAN REAL-TIME                   │
│  - Buku Jurnal Umum (JournalEntry[])                                   │
│  - Saldo COA Dinamis (CoaView & LaporanKeuanganView)                   │
│  - Laporan Neraca & Laba Rugi Otomatis Terhubung                       │
└────────────────────────────────────────────────────────────────────────┘
```

#### Komponen Teknis yang Dimodifikasi:
1. `src/accountingData.ts`:
   - Menyempurnakan parameter `generateJournalsFromMutasi` agar menerima `kebutuhanPengeluaranList: KebutuhanPengeluaranItem[]` dan `posPengeluaranList: PosPengeluaranGroup[]`.
   - Mengganti logika mutasi `DB` dari hardcoded text matching ke integrasi langsung dengan `kebutuhanPengeluaranList` (`noAkunCoa`, `namaAkunCoa`).
   - Menghubungkan mutasi `DB` multi-transaksi dari `linkedTransactions` yang berasal dari fitur *Tambahkan Kode Mutasi* Pengeluaran.
   - Memastikan akun kas bank kredit (`bankCoaCode`) tepat sesuai rekening bank pada mutasi (`10001`, `10002`, `10003`, `10004`, `10202`, `10205`).
2. `src/components/LaporanKeuanganView.tsx`:
   - Meneruskan `kebutuhanPengeluaranList` dan `posPengeluaranList` ke pemanggilan `generateJournalsFromMutasi`.
3. `src/components/CoaView.tsx`:
   - Meneruskan `kebutuhanPengeluaranList` ke kalkulasi saldo mutasi COA real-time.
4. `src/App.tsx`:
   - Memastikan seluruh view yang memproses jurnal menerima data kebutuhan pengeluaran terupdate.

---

### Verifikasi & Pengujian
1. **Uji Mutasi DB Pengeluaran Tunggal**: Mutasi DB terhubung ke Pengeluaran dengan kebutuhan "Gaji" menghasilkan Debet `60100` Gaji dan Kredit Bank yang seimbang. [SUDAH DITERAPKAN]
2. **Uji Mutasi DB dengan Pengeluaran PDAM & Internet**: Menghasilkan Debet `60200` Air PDAM & Internet secara otomatis dari pemetaan Kebutuhan Pengeluaran. [SUDAH DITERAPKAN]
3. **Uji Mutasi DB Multi-Pengeluaran**: 1 Mutasi DB terhubung ke beberapa pengeluaran menghasilkan baris-baris debet proporsional dan 1 baris kredit bank. [SUDAH DITERAPKAN]
4. **Uji Mutasi CR S-SALUR & Donasi**: Menghasilkan kredit pendapatan buku/donasi dan debet kas terpecah sesuai alokasi pos keuangan 20:20:30:30 ke `10001 Kas BCA Penerbitan`, `10002 Kas BCA Kegiatan Retret`, `10003 Kas BCA Operasional Dharma`, dan `10004 Kas BCA Operasional Non-Dharma`. [SUDAH DITERAPKAN]
5. **Uji Mutasi CR A-AJAR**: Menghasilkan kredit `40301` Pendapatan Kegiatan Ajar dan debet `10002 Kas BCA Kegiatan Retret`. [SUDAH DITERAPKAN]
6. **Uji Migrasi 10202 ke 10001**: Seluruh referensi `10202 Kas BCA Teks Dharma` telah berhasil diubah menjadi `10001 Kas BCA Penerbitan` (termasuk saldo awal Rp 641.221.612, alokasi jurnal mutasi, dan migrasi localStorage). [SUDAH DITERAPKAN]
7. **Uji Validasi Balance**: Semua jurnal memiliki total debet = total kredit ($\Delta = 0$). [SUDAH DITERAPKAN]
8. **Uji Laporan Keuangan**: Saldo di COA View, Manajemen COA, dan Laba Rugi mencerminkan jurnal mutasi secara real-time. [SUDAH DITERAPKAN]
9. **Kompilasi & Lint**: TypeScript `tsc --noEmit` & Vite `build` 100% lulus tanpa error. [SUDAH DIVERIFIKASI]
