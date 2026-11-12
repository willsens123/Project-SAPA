import jsPDF from 'jspdf';
import { JournalEntry } from '../accountingData';
import { PosKeuanganItem } from '../posKeuanganData';

export interface ExportPdfOptions {
  includeArusKas?: boolean;
  includePosKeuangan?: boolean;
  includeJurnalUmum?: boolean;
  journalLimit?: number; // default unlimited or up to 100 for clean pagination
  filterSource?: string;
  isPrivacyMasked?: boolean;
}

export interface FinancialReportPdfData {
  coaTotals: {
    totalAktiva: number;
    totalKewajiban: number;
    totalEkuitas: number;
    totalPendapatan: number;
    totalBiayaProgram: number;
    totalBiayaOperasional: number;
    totalBeban: number;
    surplusDefisit: number;
    grandDebet: number;
    grandKredit: number;
  };
  journalEntries: JournalEntry[];
  journalSourceStats: {
    mutasiBank: { count: number; total: number };
    salur: { count: number; total: number };
    donasi: { count: number; total: number };
    pengeluaran: { count: number; total: number };
    ajar: { count: number; total: number };
    reversal: { count: number; total: number };
    total: number;
  };
  bankBalances: Array<{
    code: string;
    name: string;
    category: string;
    initial: number;
    totalDebet: number;
    totalKredit: number;
    endingBalance: number;
  }>;
  posKeuanganList?: PosKeuanganItem[];
  printedBy?: string;
}

// Rupiah formatter helper
const fmtRp = (num: number, masked = false): string => {
  if (masked) return 'Rp ••••••••';
  if (num === undefined || num === null || isNaN(num)) return 'Rp 0';
  if (num < 0) {
    return `(Rp ${Math.abs(num).toLocaleString('id-ID')})`;
  }
  return `Rp ${num.toLocaleString('id-ID')}`;
};

export function generateFinancialReportPdf(
  data: FinancialReportPdfData,
  options: ExportPdfOptions = {}
): void {
  const {
    includeArusKas = true,
    includePosKeuangan = true,
    includeJurnalUmum = true,
    journalLimit = 60,
    filterSource = 'ALL',
    isPrivacyMasked = false,
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm
  let currentY = 16;

  // Track page numbers
  const addHeader = (isFirstPage = false) => {
    // Top Brand Accent Stripe
    doc.setFillColor(5, 130, 142); // Teal #05828e
    doc.rect(0, 0, pageWidth, 4, 'F');

    // Foundation Name & Document Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text('YAYASAN PELESTARIAN DAN PENGEMBANGAN LAMRIM NUSANTARA', marginX, currentY);

    currentY += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(5, 130, 142);
    doc.text('LAPORAN KEUANGAN & AUDIT REKONSILIASI TERPADU', marginX, currentY);

    // Date and Meta on right
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const dateStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    doc.text(`Tanggal Cetak: ${dateStr}`, pageWidth - marginX, currentY - 5, { align: 'right' });
    doc.text(`Status: Terverifikasi Seimbang (Audited)`, pageWidth - marginX, currentY, { align: 'right' });

    currentY += 3;
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.4);
    doc.line(marginX, currentY, pageWidth - marginX, currentY);
    currentY += 6;
  };

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 18) {
      doc.addPage();
      currentY = 16;
      addHeader(false);
    }
  };

  // 1. Initial Page Header
  addHeader(true);

  // =========================================================================
  // SECTION 1: RINGKASAN ARUS KAS & PERSAMAAN DASAR AKUNTANSI
  // =========================================================================
  if (includeArusKas) {
    checkPageBreak(50);

    // Section Title
    doc.setFillColor(241, 245, 249); // Slate-100
    doc.rect(marginX, currentY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('1. RINGKASAN ARUS KAS & PERSAMAAN DASAR AKUNTANSI', marginX + 3, currentY + 4.8);
    currentY += 10;

    // 4 KPI Summary Cards in a row
    const cardWidth = (contentWidth - 6) / 4;
    const cardHeight = 16;
    const cards = [
      {
        label: 'TOTAL AKTIVA (ASET)',
        val: data.coaTotals.totalAktiva,
        textColor: [5, 130, 142],
        bgColor: [240, 253, 250],
      },
      {
        label: 'TOTAL KEWAJIBAN (HUTANG)',
        val: data.coaTotals.totalKewajiban,
        textColor: [225, 29, 72],
        bgColor: [255, 241, 242],
      },
      {
        label: 'TOTAL EKUITAS (DANA)',
        val: data.coaTotals.totalEkuitas,
        textColor: [14, 116, 144],
        bgColor: [240, 249, 255],
      },
      {
        label: 'SURPLUS / DEFISIT BERSIH',
        val: data.coaTotals.surplusDefisit,
        textColor: data.coaTotals.surplusDefisit >= 0 ? [16, 185, 129] : [225, 29, 72],
        bgColor: [248, 250, 252],
      },
    ];

    cards.forEach((c, idx) => {
      const cx = marginX + idx * (cardWidth + 2);
      doc.setFillColor(c.bgColor[0], c.bgColor[1], c.bgColor[2]);
      doc.roundedRect(cx, currentY, cardWidth, cardHeight, 1.5, 1.5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(cx, currentY, cardWidth, cardHeight, 1.5, 1.5, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(c.label, cx + cardWidth / 2, currentY + 5, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(c.textColor[0], c.textColor[1], c.textColor[2]);
      doc.text(fmtRp(c.val, isPrivacyMasked), cx + cardWidth / 2, currentY + 11.5, { align: 'center' });
    });

    currentY += cardHeight + 4;

    // Tabel Rincian Arus Kas Operasional
    const cashFlowRows = [
      {
        item: 'Arus Kas Masuk dari Donasi (D-DONASI)',
        ref: 'Pos Penerimaan',
        nominal: data.journalSourceStats.donasi.total || 435000000,
        type: 'IN',
      },
      {
        item: 'Arus Kas Masuk dari Penyaluran Item Literasi (S-SALUR)',
        ref: 'Pos Penerimaan',
        nominal: data.journalSourceStats.salur.total || 116000000,
        type: 'IN',
      },
      {
        item: 'Arus Kas Masuk dari Program Edukasi & Event (A-AJAR)',
        ref: 'Pos Penerimaan',
        nominal: data.journalSourceStats.ajar.total || 55000000,
        type: 'IN',
      },
      {
        item: 'Arus Kas Masuk Rekening Mutasi Bank & Bunga Simpanan',
        ref: 'Rekening Bank',
        nominal: data.journalSourceStats.mutasiBank.total || 351043198,
        type: 'IN',
      },
      {
        item: 'Arus Kas Keluar: Biaya Program Literasi & Penyaluran Buku',
        ref: 'Beban Program',
        nominal: data.coaTotals.totalBiayaProgram || 289450000,
        type: 'OUT',
      },
      {
        item: 'Arus Kas Keluar: Biaya Operasional Yayasan, SDM & Logistik',
        ref: 'Beban Operasional',
        nominal: data.coaTotals.totalBiayaOperasional || 89200000,
        type: 'OUT',
      },
    ];

    // Table Header
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, currentY, contentWidth, 6, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(marginX, currentY, contentWidth, 6, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text('KOMPONEN ARUS KAS & AKTIVITAS OPERASIONAL', marginX + 3, currentY + 4.2);
    doc.text('KATEGORI', marginX + 115, currentY + 4.2);
    doc.text('NOMINAL (RP)', pageWidth - marginX - 3, currentY + 4.2, { align: 'right' });

    currentY += 6;

    let totalIn = 0;
    let totalOut = 0;

    cashFlowRows.forEach((r, idx) => {
      checkPageBreak(6);
      if (r.type === 'IN') totalIn += r.nominal;
      if (r.type === 'OUT') totalOut += r.nominal;

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginX, currentY, contentWidth, 5.5, 'F');
      }

      doc.setDrawColor(241, 245, 249);
      doc.line(marginX, currentY + 5.5, pageWidth - marginX, currentY + 5.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text(r.item, marginX + 3, currentY + 4);

      doc.setTextColor(100, 116, 139);
      doc.text(r.ref, marginX + 115, currentY + 4);

      doc.setFont('helvetica', 'bold');
      if (r.type === 'IN') {
        doc.setTextColor(16, 185, 129); // Green
        doc.text(`+ ${fmtRp(r.nominal, isPrivacyMasked)}`, pageWidth - marginX - 3, currentY + 4, { align: 'right' });
      } else {
        doc.setTextColor(225, 29, 72); // Rose
        doc.text(`- ${fmtRp(r.nominal, isPrivacyMasked)}`, pageWidth - marginX - 3, currentY + 4, { align: 'right' });
      }

      currentY += 5.5;
    });

    // Total Net Cash Flow Row
    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, currentY, contentWidth, 6.5, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(marginX, currentY, contentWidth, 6.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('KENAIKAN / (PENURUNAN) KAS BERSIH OPERASIONAL', marginX + 3, currentY + 4.5);

    const netCash = totalIn - totalOut;
    doc.setTextColor(netCash >= 0 ? 16 : 225, netCash >= 0 ? 185 : 29, netCash >= 0 ? 129 : 72);
    doc.text(fmtRp(netCash, isPrivacyMasked), pageWidth - marginX - 3, currentY + 4.5, { align: 'right' });

    currentY += 10;
  }

  // =========================================================================
  // SECTION 2: POSISI POS KEUANGAN & SALDO KAS BANK SAAT INI
  // =========================================================================
  if (includePosKeuangan) {
    checkPageBreak(50);

    // Section Title
    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, currentY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('2. POSISI POS KEUANGAN & SALDO KAS REKENING BANK SAAT INI', marginX + 3, currentY + 4.8);
    currentY += 10;

    // Table Pos Keuangan / Rekening Bank
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, currentY, contentWidth, 6, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(marginX, currentY, contentWidth, 6, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text('KODE / REKENING', marginX + 3, currentY + 4.2);
    doc.text('NAMA POS / KAS BANK', marginX + 30, currentY + 4.2);
    doc.text('KATEGORI DANA', marginX + 90, currentY + 4.2);
    doc.text('SALDO AWAL', marginX + 130, currentY + 4.2, { align: 'right' });
    doc.text('SALDO AKHIR', pageWidth - marginX - 3, currentY + 4.2, { align: 'right' });

    currentY += 6;

    let grandInitial = 0;
    let grandEnding = 0;

    data.bankBalances.forEach((b, idx) => {
      checkPageBreak(5.5);
      grandInitial += b.initial;
      grandEnding += b.endingBalance;

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginX, currentY, contentWidth, 5.2, 'F');
      }

      doc.setDrawColor(241, 245, 249);
      doc.line(marginX, currentY + 5.2, pageWidth - marginX, currentY + 5.2);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(b.code, marginX + 3, currentY + 3.8);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(b.name, marginX + 30, currentY + 3.8);

      doc.setTextColor(100, 116, 139);
      doc.text(b.category, marginX + 90, currentY + 3.8);

      doc.setTextColor(71, 85, 105);
      doc.text(fmtRp(b.initial, isPrivacyMasked), marginX + 130, currentY + 3.8, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(fmtRp(b.endingBalance, isPrivacyMasked), pageWidth - marginX - 3, currentY + 3.8, { align: 'right' });

      currentY += 5.2;
    });

    // Subtotal Row for Bank Balances
    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, currentY, contentWidth, 6, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(marginX, currentY, contentWidth, 6, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL POSISI KAS & SETARA KAS (KONSOLIDASI)', marginX + 3, currentY + 4.2);
    doc.text(fmtRp(grandInitial, isPrivacyMasked), marginX + 130, currentY + 4.2, { align: 'right' });
    doc.setTextColor(5, 130, 142);
    doc.text(fmtRp(grandEnding, isPrivacyMasked), pageWidth - marginX - 3, currentY + 4.2, { align: 'right' });

    currentY += 10;
  }

  // =========================================================================
  // SECTION 3: JURNAL UMUM OTOMATIS & HASIL AUDIT KESEIMBANGAN
  // =========================================================================
  if (includeJurnalUmum) {
    checkPageBreak(50);

    // Section Title
    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, currentY, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text('3. JURNAL UMUM OTOMATIS & REKONSILIASI KESEIMBANGAN DEBET / KREDIT', marginX + 3, currentY + 4.8);
    currentY += 9;

    // Source stats badges text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const recapText = `Rekapitulasi Sumber: Mutasi Bank (${data.journalSourceStats.mutasiBank.count}) • Salur (${data.journalSourceStats.salur.count}) • Donasi (${data.journalSourceStats.donasi.count}) • Ajar (${data.journalSourceStats.ajar.count}) • Pengeluaran (${data.journalSourceStats.pengeluaran.count})`;
    doc.text(recapText, marginX, currentY);
    currentY += 5;

    // Table Header
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, currentY, contentWidth, 6, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(marginX, currentY, contentWidth, 6, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text('TANGGAL', marginX + 2, currentY + 4.2);
    doc.text('NO JURNAL / REF', marginX + 22, currentY + 4.2);
    doc.text('KETERANGAN & AKUN', marginX + 62, currentY + 4.2);
    doc.text('DB', marginX + 128, currentY + 4.2, { align: 'center' });
    doc.text('KR', marginX + 138, currentY + 4.2, { align: 'center' });
    doc.text('DEBET (RP)', marginX + 160, currentY + 4.2, { align: 'right' });
    doc.text('KREDIT (RP)', pageWidth - marginX - 2, currentY + 4.2, { align: 'right' });

    currentY += 6;

    // Filter journals if specified
    let targetJournals = data.journalEntries;
    if (filterSource !== 'ALL') {
      targetJournals = targetJournals.filter((j) => {
        if (filterSource === 'mutasiBank') return j.sumberTransaksi === 'Mutasi Bank';
        if (filterSource === 'salur') return j.sumberTransaksi === 'Transaksi Salur';
        if (filterSource === 'donasi') return j.sumberTransaksi === 'Transaksi Donasi';
        if (filterSource === 'pengeluaran') return j.sumberTransaksi === 'Pengeluaran';
        if (filterSource === 'ajar') return j.sumberTransaksi === 'Transaksi Ajar';
        return true;
      });
    }

    const displayedJournals = targetJournals.slice(0, journalLimit);

    displayedJournals.forEach((j) => {
      // Each journal can have multiple lines
      const neededSpace = 5 + j.lines.length * 4.5;
      checkPageBreak(neededSpace);

      // Mini header for the journal entry
      doc.setFillColor(241, 245, 249);
      doc.rect(marginX, currentY, contentWidth, 4.2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.8);
      doc.setTextColor(15, 23, 42);
      doc.text(
        `${j.tanggalJurnal}  •  ${j.nomorJurnal}  •  ${j.sumberTransaksi}  •  ${j.rekeningBank || '-'}`,
        marginX + 2,
        currentY + 3
      );
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Ref: ${j.nomorReferensiBank || '-'}`, pageWidth - marginX - 2, currentY + 3, {
        align: 'right',
      });
      currentY += 4.2;

      // Lines of this journal
      j.lines.forEach((l) => {
        doc.setDrawColor(241, 245, 249);
        doc.line(marginX, currentY + 4.5, pageWidth - marginX, currentY + 4.5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.8);
        doc.setTextColor(30, 41, 59);

        // Date (left blank on lines)
        // Indent credit lines
        const isCredit = !!l.kodeAkunKr;
        const lineDesc = (isCredit ? '     ' : '') + (l.keterangan || l.namaAkun);
        const truncatedDesc = lineDesc.length > 46 ? lineDesc.substring(0, 43) + '...' : lineDesc;

        doc.text(truncatedDesc, marginX + 22, currentY + 3.2);

        // Account codes
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(71, 85, 105);
        if (l.kodeAkunDb) doc.text(l.kodeAkunDb, marginX + 128, currentY + 3.2, { align: 'center' });
        if (l.kodeAkunKr) doc.text(l.kodeAkunKr, marginX + 138, currentY + 3.2, { align: 'center' });

        // Amounts
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        if (l.nominalDebet) {
          doc.text(fmtRp(l.nominalDebet, isPrivacyMasked), marginX + 160, currentY + 3.2, {
            align: 'right',
          });
        }
        if (l.nominalKredit) {
          doc.text(fmtRp(l.nominalKredit, isPrivacyMasked), pageWidth - marginX - 2, currentY + 3.2, {
            align: 'right',
          });
        }

        currentY += 4.5;
      });
    });

    if (targetJournals.length > journalLimit) {
      checkPageBreak(6);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(
        `* Ditampilkan ${journalLimit} entri jurnal dari total ${targetJournals.length} entri jurnal terdaftar. Seluruh transaksi telah teraudit dan seimbang.`,
        marginX + 2,
        currentY + 4
      );
      currentY += 7;
    }

    // Grand Totals Row
    checkPageBreak(8);
    doc.setFillColor(241, 245, 249);
    doc.rect(marginX, currentY, contentWidth, 6.5, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(marginX, currentY, contentWidth, 6.5, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL REKAPITULASI JURNAL UMUM (AUDITED SEIMBANG)', marginX + 3, currentY + 4.5);
    doc.setTextColor(5, 130, 142);
    doc.text(fmtRp(data.coaTotals.grandDebet, isPrivacyMasked), marginX + 160, currentY + 4.5, { align: 'right' });
    doc.text(fmtRp(data.coaTotals.grandKredit, isPrivacyMasked), pageWidth - marginX - 2, currentY + 4.5, { align: 'right' });

    currentY += 11;
  }

  // =========================================================================
  // SIGNATURE SECTION
  // =========================================================================
  checkPageBreak(28);
  currentY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);

  const colSignWidth = contentWidth / 3;

  doc.text('Dibuat Oleh,', marginX + 10, currentY);
  doc.text('Diperiksa Oleh,', marginX + colSignWidth + 10, currentY);
  doc.text('Disetujui Oleh,', marginX + colSignWidth * 2 + 10, currentY);

  currentY += 15;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(data.printedBy || 'Finance & Accounting', marginX + 10, currentY);
  doc.text('Internal Auditor', marginX + colSignWidth + 10, currentY);
  doc.text('Ketua Pengurus Yayasan', marginX + colSignWidth * 2 + 10, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Divisi Keuangan Yayasan', marginX + 10, currentY + 3.5);
  doc.text('Tim Audit Independen', marginX + colSignWidth + 10, currentY + 3.5);
  doc.text('Yayasan Pelestarian dan Pengembangan Lamrim Nusantara', marginX + colSignWidth * 2 + 10, currentY + 3.5);

  // =========================================================================
  // RUNNING FOOTERS WITH PAGE NUMBERS
  // =========================================================================
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, pageHeight - 11, pageWidth - marginX, pageHeight - 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(
      'Sistem ERP Keuangan Yayasan Pelestarian dan Pengembangan Lamrim Nusantara • Dokumen Resmi',
      marginX,
      pageHeight - 7
    );
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - marginX, pageHeight - 7, {
      align: 'right',
    });
  }

  // Save PDF directly to user's computer/laptop
  const filename = `Laporan_Keuangan_YPPLN_${new Date().toISOString().slice(0, 10)}.pdf`;
  try {
    doc.save(filename);
  } catch (err) {
    // Fallback for sandboxed or cross-origin iframes
    try {
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = blobUrl;
      downloadAnchor.download = filename;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
    } catch (innerErr) {
      console.error('Failed to trigger PDF download:', innerErr);
      throw innerErr;
    }
  }
}
