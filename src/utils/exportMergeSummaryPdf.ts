import jsPDF from 'jspdf';
import { MergeSessionRecord } from '../types';

export interface MergeSummaryPdfParams {
  records: MergeSessionRecord[];
  sessionStartedAt: string;
  similarityThreshold: number;
  adminName?: string;
  adminEmail?: string;
  remainingDuplicatesCount?: number;
}

const formatDateId = (isoOrDate: string | Date): string => {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const formatTimeId = (isoOrDate: string | Date): string => {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

export function generateMergeSummaryPdf({
  records,
  sessionStartedAt,
  similarityThreshold,
  adminName = 'Admin Identitas YPPLN',
  adminEmail = '-',
  remainingDuplicatesCount = 0,
}: MergeSummaryPdfParams): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm
  const now = new Date();

  const docNumber = `BA-MERGE-${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(
    2,
    '0'
  )}${String(now.getMinutes()).padStart(2, '0')}`;

  // Aggregates
  const totals = records.reduce(
    (acc, r) => {
      acc.mergedProfiles += 1;
      acc.fieldsEnriched += r.transferredData.fieldsEnriched;
      acc.addressesMoved += r.transferredData.addressesMoved;
      acc.projectsUpdated += r.transferredData.projectsUpdated;
      acc.salurOrdersUpdated += r.transferredData.salurOrdersUpdated;
      acc.totalDataPointsMoved += r.transferredData.totalDataPointsMoved;
      if (r.matchType === 'fuzzy') acc.fuzzyCount += 1;
      else acc.exactCount += 1;
      return acc;
    },
    {
      mergedProfiles: 0,
      fieldsEnriched: 0,
      addressesMoved: 0,
      projectsUpdated: 0,
      salurOrdersUpdated: 0,
      totalDataPointsMoved: 0,
      fuzzyCount: 0,
      exactCount: 0,
    }
  );

  let currentY = 14;

  const drawHeader = (isContinuation = false) => {
    // Brand top stripe (#05828e)
    doc.setFillColor(5, 130, 142);
    doc.rect(0, 0, pageWidth, 4, 'F');

    currentY = 14;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('YAYASAN PELESTARIAN DAN PENGEMBANGAN LAMRIM NUSANTARA', marginX, currentY);

    currentY += 5;
    doc.setFontSize(9.5);
    doc.setTextColor(5, 130, 142);
    doc.text(
      isContinuation
        ? 'LAMPIRAN RINCIAN PENGGABUNGAN DATA IDENTITAS (LANJUTAN)'
        : 'BERITA ACARA & RINGKASAN HASIL MERGE DATA IDENTITAS',
      marginX,
      currentY
    );

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`No. Dokumen: ${docNumber}`, pageWidth - marginX, 14, { align: 'right' });
    doc.text(`Dicetak: ${formatDateId(now)} · ${formatTimeId(now)} WIB`, pageWidth - marginX, 19, {
      align: 'right',
    });

    currentY += 3.5;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.35);
    doc.line(marginX, currentY, pageWidth - marginX, currentY);
    currentY += 6;
  };

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      drawHeader(true);
    }
  };

  drawHeader(false);

  // 1. Metadata Sesi Administrasi
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, currentY, contentWidth, 21, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('INFORMASI SESI ADMIN', marginX + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`Admin Pelaksana : ${adminName} (${adminEmail})`, marginX + 4, currentY + 11);
  doc.text(
    `Mulai Sesi       : ${formatDateId(sessionStartedAt)} pukul ${formatTimeId(sessionStartedAt)}`,
    marginX + 4,
    currentY + 16.5
  );

  doc.text(
    `Ambang Smart Match : ${similarityThreshold === 80 ? '> 80%' : `>= ${similarityThreshold}%`}`,
    marginX + contentWidth / 2 + 6,
    currentY + 11
  );
  doc.text(
    `Sisa Antrean Duplikat : ${remainingDuplicatesCount} pasangan`,
    marginX + contentWidth / 2 + 6,
    currentY + 16.5
  );

  currentY += 27;

  // 2. Ringkasan Eksekutif (4 KPI Boxes)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('I. RINGKASAN EKSEKUTIF SESI MERGE', marginX, currentY);
  currentY += 4;

  const boxGap = 3.5;
  const boxWidth = (contentWidth - boxGap * 3) / 4;
  const boxHeight = 20;

  const kpiBoxes = [
    {
      label: 'Profil Digabungkan',
      value: `${totals.mergedProfiles} Profil`,
      sub: `${totals.exactCount} Eksak · ${totals.fuzzyCount} Fuzzy`,
    },
    {
      label: 'Total Data Dipindahkan',
      value: `${totals.totalDataPointsMoved} Item`,
      sub: 'Atribut, Alamat & Relasi',
    },
    {
      label: 'Atribut & Alamat',
      value: `${totals.fieldsEnriched + totals.addressesMoved} Data`,
      sub: `${totals.fieldsEnriched} Field · ${totals.addressesMoved} Alamat`,
    },
    {
      label: 'Relasi Dialihkan',
      value: `${totals.projectsUpdated + totals.salurOrdersUpdated} Ref`,
      sub: `${totals.projectsUpdated} Proyek · ${totals.salurOrdersUpdated} Salur`,
    },
  ];

  kpiBoxes.forEach((box, idx) => {
    const bx = marginX + idx * (boxWidth + boxGap);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(bx, currentY, boxWidth, boxHeight, 1.8, 1.8, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(box.label, bx + 3, currentY + 5.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(5, 130, 142);
    doc.text(box.value, bx + 3, currentY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text(box.sub, bx + 3, currentY + 17);
  });

  currentY += boxHeight + 9;

  // 3. Tabel Rincian Setiap Penggabungan
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`II. RINCIAN PENGGABUNGAN DATA (${records.length} OPERASI)`, marginX, currentY);
  currentY += 4;

  // Table columns (total 182mm):
  // No (8) | Waktu (16) | Profil Utama (44) | Profil Digabung (44) | Skor & Metode (26) | Data Dipindahkan (44)
  const colWidths = [8, 16, 44, 44, 26, 44];

  const drawTableHeader = () => {
    doc.setFillColor(5, 130, 142);
    doc.rect(marginX, currentY, contentWidth, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(255, 255, 255);

    const headers = [
      'No',
      'Waktu',
      'Profil Utama (Dipertahankan)',
      'Profil Sekunder (Dilebur)',
      'Skor / Tipe',
      'Data Dipindahkan',
    ];
    let xCursor = marginX;
    headers.forEach((h, idx) => {
      doc.text(h, xCursor + 2, currentY + 5);
      xCursor += colWidths[idx];
    });
    currentY += 7.5;
  };

  drawTableHeader();

  if (records.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, currentY, contentWidth, 12, 'F');
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Belum ada operasi penggabungan profil yang tercatat pada sesi ini.', marginX + 4, currentY + 7.5);
    currentY += 12;
  } else {
    records.forEach((rec, index) => {
      const primaryText = `${rec.primaryCodeId || '-'} ${rec.primaryName}`;
      const secondaryText = `${rec.secondaryCodeId || '-'} ${rec.secondaryName}`;
      const methodLabel =
        rec.method === 'curated'
          ? 'Terkurasi'
          : rec.method === 'batch'
          ? 'Batch'
          : 'Cepat';
      const scoreText = `${rec.similarityScore}% (${
        rec.matchType === 'fuzzy' ? 'Fuzzy' : 'Eksak'
      })\n${methodLabel}`;

      const movedParts: string[] = [];
      if (rec.transferredData.fieldsEnriched > 0) {
        movedParts.push(
          `${rec.transferredData.fieldsEnriched} Field (${rec.transferredData.fieldsList.join(', ')})`
        );
      }
      if (rec.transferredData.addressesMoved > 0) {
        movedParts.push(`${rec.transferredData.addressesMoved} Alamat`);
      }
      if (rec.transferredData.projectsUpdated > 0) {
        movedParts.push(`${rec.transferredData.projectsUpdated} Proyek`);
      }
      if (rec.transferredData.salurOrdersUpdated > 0) {
        movedParts.push(`${rec.transferredData.salurOrdersUpdated} Salur`);
      }
      const movedText =
        movedParts.length > 0
          ? movedParts.join('; ')
          : 'Konsolidasi profil (tidak ada field baru)';

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);

      const primaryLines = doc.splitTextToSize(primaryText, colWidths[2] - 4);
      const secondaryLines = doc.splitTextToSize(secondaryText, colWidths[3] - 4);
      const scoreLines = doc.splitTextToSize(scoreText, colWidths[4] - 4);
      const movedLines = doc.splitTextToSize(movedText, colWidths[5] - 4);

      const maxLines = Math.max(
        1,
        primaryLines.length,
        secondaryLines.length,
        scoreLines.length,
        movedLines.length
      );
      const rowHeight = Math.max(8, maxLines * 3.6 + 4);

      if (currentY + rowHeight > pageHeight - 24) {
        doc.addPage();
        drawHeader(true);
        drawTableHeader();
      }

      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginX, currentY, contentWidth, rowHeight, 'F');
      }
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(marginX, currentY + rowHeight, marginX + contentWidth, currentY + rowHeight);

      let xCursor = marginX;
      doc.setTextColor(51, 65, 85);
      doc.text(String(index + 1), xCursor + 2, currentY + 4.5);
      xCursor += colWidths[0];

      doc.text(formatTimeId(rec.mergedAt).slice(0, 5), xCursor + 2, currentY + 4.5);
      xCursor += colWidths[1];

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(primaryLines, xCursor + 2, currentY + 4.5);
      xCursor += colWidths[2];

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(secondaryLines, xCursor + 2, currentY + 4.5);
      xCursor += colWidths[3];

      doc.text(scoreLines, xCursor + 2, currentY + 4.5);
      xCursor += colWidths[4];

      doc.text(movedLines, xCursor + 2, currentY + 4.5);

      currentY += rowHeight;
    });
  }

  currentY += 10;
  checkPageBreak(44);

  // 4. Pernyataan Resmi & Kolom Tanda Tangan Admin
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, currentY, contentWidth, 14, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  const statementLines = doc.splitTextToSize(
    'Dokumen ini diterbitkan secara resmi dari sistem administrasi identitas YPPLN. Seluruh penggabungan profil duplikat beserta pemindahan atribut, alamat, relasi proyek, dan transaksi salur telah tercatat pada Audit Log Pusat.',
    contentWidth - 8
  );
  doc.text(statementLines, marginX + 4, currentY + 5);

  currentY += 21;

  const sigLeftX = marginX + 10;
  const sigRightX = pageWidth - marginX - 58;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Dibuat & Disahkan Oleh,', sigLeftX, currentY);
  doc.text(`Tanggal, ${formatDateId(now)}`, sigRightX, currentY);
  doc.text('Mengetahui / Penanggung Jawab Data,', sigRightX, currentY + 4.5);

  currentY += 20;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(sigLeftX, currentY, sigLeftX + 52, currentY);
  doc.line(sigRightX, currentY, sigRightX + 52, currentY);

  currentY += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(adminName, sigLeftX, currentY);
  doc.text('Koordinator Data & Arsip YPPLN', sigRightX, currentY);

  // Page numbers footer across all pages
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${docNumber} · Dokumen Resmi Administrasi YPPLN`,
      marginX,
      pageHeight - 8
    );
    doc.text(`Halaman ${p} dari ${pageCount}`, pageWidth - marginX, pageHeight - 8, {
      align: 'right',
    });
  }

  const fileDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(
    2,
    '0'
  )}${String(now.getMinutes()).padStart(2, '0')}`;
  const fileName = `Ringkasan_Hasil_Merge_Identitas_${fileDate}.pdf`;
  doc.save(fileName);
  return fileName;
}
