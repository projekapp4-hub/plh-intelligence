/**
 * ============================================================================
 * PLH-INTELLIGENCE - PDF Generator Utility (FIXED OVERLAP & UNICODE)
 * Berkas    : src/utils/createPDF.js
 * ============================================================================
 */

import { jsPDF } from 'jspdf';

/**
 * Helper Sanitasi Karakter: Membersihkan karakter Unicode/Emoji (seperti ✓ dan ✕)
 * yang tidak didukung font standar Helvetica jsPDF agar tidak merusak layout Y.
 */
function sanitizePdfText(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/[✓✔]/g, '[V]')
    .replace(/[✕✖❌]/g, '[X]')
    .replace(/[^\x00-\x7F]/g, ''); // Hapus karakter Non-ASCII yang tidak terdaftar
}

export async function generatePDFReport({
  title = 'PLH-INTELLIGENCE REPORT',
  subtitle = 'Laporan Data Lingkungan Sekolah',
  headers = [],
  data = [],
  fileName = 'Laporan_PLH.pdf',
  orientation = 'portrait'
}) {
  try {
    if (!Array.isArray(headers) || headers.length === 0) {
      throw new Error('[createPDF] Parameter "headers" wajib diisi dengan Array kolom.');
    }

    if (!Array.isArray(data)) {
      throw new Error('[createPDF] Parameter "data" harus berupa Array.');
    }

    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const marginTop = 16;
    const marginBottom = 18;
    const marginLeft = 14;
    const marginRight = 14;
    const contentWidth = pageWidth - marginLeft - marginRight;

    let currentY = marginTop;

    // ------------------------------------------------------------------------
    // 1. HEADER DOKUMEN & TIMESTAMP
    // ------------------------------------------------------------------------
    // Garis Aksen
    doc.setFillColor(16, 185, 129);
    doc.rect(marginLeft, currentY, contentWidth, 2, 'F');
    currentY += 7;

    // Judul Utama Laporan
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(sanitizePdfText(title).toUpperCase(), marginLeft, currentY);

    // Tanggal Waktu Cetak (Pojok Kanan)
    const now = new Date();
    const formattedDate = `Dicetak: ${now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })} ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(formattedDate, pageWidth - marginRight, currentY, { align: 'right' });

    currentY += 5;

    // Sub-judul / Kategori DENGAN AUTO-WRAPPING AGAR TIDAK TABRAKAN
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);

    const cleanSubtitle = sanitizePdfText(subtitle);
    const subtitleLines = doc.splitTextToSize(cleanSubtitle, contentWidth);
    doc.text(subtitleLines, marginLeft, currentY);

    // Hitung penambahan Y secara dinamis berdasarkan baris subtitle
    currentY += (subtitleLines.length * 4) + 4;

    // Garis Pemisah Header
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
    currentY += 6;

    // ------------------------------------------------------------------------
    // 2. NORMALISASI KOLOM TABEL
    // ------------------------------------------------------------------------
    const normalizedColumns = headers.map((col, index) => {
      if (typeof col === 'string') {
        return {
          header: col,
          dataKey: col.toLowerCase().replace(/\s+/g, '_'),
          width: contentWidth / headers.length
        };
      }
      return {
        header: col.header || `Kolom ${index + 1}`,
        dataKey: col.dataKey || String(index),
        width: col.width || contentWidth / headers.length
      };
    });

    const totalAssignedWidth = normalizedColumns.reduce((sum, col) => sum + col.width, 0);
    const widthRatio = contentWidth / totalAssignedWidth;
    normalizedColumns.forEach((col) => {
      col.width = col.width * widthRatio;
    });

    // ------------------------------------------------------------------------
    // 3. RENDER HEADER TABEL
    // ------------------------------------------------------------------------
    const renderTableHeader = (yPos) => {
      const headerHeight = 7.5;
      doc.setFillColor(30, 41, 59);
      doc.rect(marginLeft, yPos, contentWidth, headerHeight, 'F');

      let currentX = marginLeft;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(255, 255, 255);

      normalizedColumns.forEach((col) => {
        const cleanHeader = sanitizePdfText(col.header);
        const truncatedHeader = doc.splitTextToSize(cleanHeader, col.width - 3)[0] || '';
        doc.text(truncatedHeader, currentX + 2, yPos + 5);
        currentX += col.width;
      });

      return yPos + headerHeight;
    };

    currentY = renderTableHeader(currentY);

    // ------------------------------------------------------------------------
    // 4. RENDER BARIS DATA TABEL
    // ------------------------------------------------------------------------
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    data.forEach((row, rowIndex) => {
      let maxCellLines = 1;

      // Sanitasi & Split Teks Sel
      const cellTexts = normalizedColumns.map((col) => {
        let rawVal = '';
        if (Array.isArray(row)) {
          const colIndex = normalizedColumns.indexOf(col);
          rawVal = row[colIndex] !== undefined ? String(row[colIndex]) : '';
        } else if (typeof row === 'object' && row !== null) {
          rawVal = row[col.dataKey] !== undefined ? String(row[col.dataKey]) : '';
        }

        const cleanVal = sanitizePdfText(rawVal);
        const wrappedLines = doc.splitTextToSize(cleanVal, col.width - 4);
        
        // Memastikan minimal ada 1 baris
        const linesCount = wrappedLines.length > 0 ? wrappedLines.length : 1;
        if (linesCount > maxCellLines) {
          maxCellLines = linesCount;
        }

        return wrappedLines.length > 0 ? wrappedLines : [''];
      });

      const lineHeight = 4;
      const rowHeight = Math.max(6.5, (maxCellLines * lineHeight) + 2.5);

      // Auto Page Break jika mendekati batas bawah halaman
      if (currentY + rowHeight > pageHeight - marginBottom) {
        doc.addPage();
        currentY = marginTop;
        currentY = renderTableHeader(currentY);
      }

      // Zebra Striping
      if (rowIndex % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginLeft, currentY, contentWidth, rowHeight, 'F');
      }

      // Garis Bawah Sel
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.2);
      doc.line(marginLeft, currentY + rowHeight, pageWidth - marginRight, currentY + rowHeight);

      // Cetak Teks Sel
      let currentX = marginLeft;
      doc.setTextColor(51, 65, 85);

      normalizedColumns.forEach((col, colIdx) => {
        const lines = cellTexts[colIdx];
        lines.forEach((lineText, lineIdx) => {
          doc.text(lineText, currentX + 2, currentY + 4 + (lineIdx * lineHeight));
        });
        currentX += col.width;
      });

      currentY += rowHeight;
    });

    // ------------------------------------------------------------------------
    // 5. FOOTER & HALAMAN (PAGE X OF Y)
    // ------------------------------------------------------------------------
    const totalPages = doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const footerY = pageHeight - 8;

      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(marginLeft, footerY - 2, pageWidth - marginRight, footerY - 2);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);

      doc.text('PLH-INTELLIGENCE — SMART Ekselensia Indonesia', marginLeft, footerY);
      doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - marginRight, footerY, { align: 'right' });
    }

    doc.save(fileName);
    return true;
  } catch (error) {
    console.error('❌ [createPDF.js Error]:', error);
    throw new Error(`Gagal membuat dokumen PDF: ${error.message}`);
  }
}