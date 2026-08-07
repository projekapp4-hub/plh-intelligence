/**
 * ============================================================================
 * PLH-INTELLIGENCE - PDF Generator Utility
 * ============================================================================
 * Berkas    : src/utils/createPDF.js
 * Deskripsi : Helper modular untuk mencetak dokumen PDF terstruktur (A4)
 *             berbasis pustaka `jspdf` murni tanpa plugin eksternal.
 * ============================================================================
 */

import { jsPDF } from 'jspdf';

/**
 * Parameter konfigurasi pembuatan dokumen PDF.
 * @typedef {Object} PDFGeneratorOptions
 * @property {string} [title="PLH-INTELLIGENCE REPORT"] - Judul utama pada header laporan.
 * @property {string} [subtitle="Laporan Data Lingkungan Sekolah"] - Sub-judul atau kategori laporan.
 * @property {Array<string|{header: string, dataKey: string, width?: number}>} headers - Definisi kolom tabel.
 * @property {Array<Object|Array>} data - Array data yang akan dimasukkan ke dalam tabel.
 * @property {string} [fileName="Laporan_PLH.pdf"] - Nama berkas keluaran saat diunduh.
 * @property {'portrait'|'landscape'} [orientation="portrait"] - Orientasi kertas (portrait/landscape).
 */

/**
 * Menghasilkan dan memicu unduhan berkas PDF berstandar laporan resmi PLH-Intelligence.
 *
 * @async
 * @function generatePDFReport
 * @param {PDFGeneratorOptions} options - Objek konfigurasi parameter laporan PDF.
 * @returns {Promise<boolean>} Resolves `true` jika eksekusi dan unduhan berhasil.
 * @throws {Error} Jika data tidak valid atau terjadi kegagalan pemrosesan PDF.
 *
 * @example
 * import { generatePDFReport } from './utils/createPDF.js';
 *
 * await generatePDFReport({
 *   title: 'LAPORAN EVALUASI ZONA PIKET',
 *   subtitle: 'SMART Ekselensia Indonesia - Periode Agustus 2026',
 *   headers: [
 *     { header: 'No', dataKey: 'no', width: 15 },
 *     { header: 'Nama Zona', dataKey: 'zona', width: 50 },
 *     { header: 'Skor Kebersihan', dataKey: 'skor', width: 35 },
 *     { header: 'Status Evaluasi', dataKey: 'status', width: 60 }
 *   ],
 *   data: [
 *     { no: '1', zona: 'Zona 1 (Taman Depan)', skor: '88/100', status: 'Sangat Bersih & Terawat' },
 *     { no: '2', zona: 'Zona 2 (Area Kantin)', skor: '65/100', status: 'Perlu Perhatian Khusus pada Pemilahan Sampah Organik' }
 *   ],
 *   fileName: 'Laporan_Piket_Agustus_2026.pdf'
 * });
 */
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

    // Inisialisasi dokumen A4 dengan unit milimeter
    const doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Batas Margin Kertas (mm)
    const marginTop = 18;
    const marginBottom = 20;
    const marginLeft = 14;
    const marginRight = 14;
    const contentWidth = pageWidth - marginLeft - marginRight;

    let currentY = marginTop;

    // ------------------------------------------------------------------------
    // 1. HEADER DOKUMEN (Judul, Subtitle, Timestamp)
    // ------------------------------------------------------------------------
    // Garis Dekoratif Atas (Aksen Hijau Adiwiyata)
    doc.setFillColor(16, 185, 129); // Hex #10B981
    doc.rect(marginLeft, currentY, contentWidth, 2, 'F');
    currentY += 8;

    // Judul Utama Laporan
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42); // Slate 900 (#0F172A)
    doc.text(title.toUpperCase(), marginLeft, currentY);
    currentY += 6;

    // Sub-judul / Kategori
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // Slate 600 (#475569)
    doc.text(subtitle, marginLeft, currentY);

    // Tanggal Waktu Ekspor Otomatis
    const now = new Date();
    const formattedDate = `Dicetak: ${now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })} | ${now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`;

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text(formattedDate, pageWidth - marginRight, currentY, { align: 'right' });

    currentY += 6;

    // Garis Pemisah Header
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.5);
    doc.line(marginLeft, currentY, pageWidth - marginRight, currentY);
    currentY += 8;

    // ------------------------------------------------------------------------
    // 2. STABILISASI & NORMALISASI STRUKTUR KOLOM TABEL
    // ------------------------------------------------------------------------
    /** @type {Array<{header: string, dataKey: string, width: number}>} */
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

    // Penyesuaian proporsional jika total lebar kolom diset manual melebihi contentWidth
    const totalAssignedWidth = normalizedColumns.reduce((sum, col) => sum + col.width, 0);
    const widthRatio = contentWidth / totalAssignedWidth;
    normalizedColumns.forEach((col) => {
      col.width = col.width * widthRatio;
    });

    // ------------------------------------------------------------------------
    // 3. FUNGSI RENDER HEADER TABEL
    // ------------------------------------------------------------------------
    const renderTableHeader = (yPos) => {
      const headerHeight = 8;
      // Background Header Tabel (Slate 800)
      doc.setFillColor(30, 41, 59);
      doc.rect(marginLeft, yPos, contentWidth, headerHeight, 'F');

      let currentX = marginLeft;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255); // Putih

      normalizedColumns.forEach((col) => {
        // Potong teks header jika terlalu panjang
        const truncatedHeader = doc.splitTextToSize(col.header, col.width - 4)[0] || '';
        doc.text(truncatedHeader, currentX + 2, yPos + 5.5);
        currentX += col.width;
      });

      return yPos + headerHeight;
    };

    // Render Header Tabel Pertama Kali
    currentY = renderTableHeader(currentY);

    // ------------------------------------------------------------------------
    // 4. RENDERING BARIS DATA TABEL (DENGAN AUTO PAGE BREAK & WRAPPING)
    // ------------------------------------------------------------------------
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);

    data.forEach((row, rowIndex) => {
      // Hitung baris teks terpanjang dari setiap sel dalam baris ini
      let maxCellLines = 1;
      const cellTexts = normalizedColumns.map((col) => {
        let rawVal = '';
        if (Array.isArray(row)) {
          const colIndex = normalizedColumns.indexOf(col);
          rawVal = row[colIndex] !== undefined ? String(row[colIndex]) : '';
        } else if (typeof row === 'object' && row !== null) {
          rawVal = row[col.dataKey] !== undefined ? String(row[col.dataKey]) : '';
        }

        // Teks Wrapping Otomatis berdasarkan lebar sel
        const wrappedLines = doc.splitTextToSize(rawVal, col.width - 4);
        if (wrappedLines.length > maxCellLines) {
          maxCellLines = wrappedLines.length;
        }
        return wrappedLines;
      });

      const lineHeight = 4.5;
      const rowHeight = Math.max(7, maxCellLines * lineHeight + 3);

      // Cek apakah Y saat ini melebihi batas bawah kertas
      if (currentY + rowHeight > pageHeight - marginBottom) {
        doc.addPage();
        currentY = marginTop;
        currentY = renderTableHeader(currentY); // Render ulang header tabel di halaman baru
      }

      // Zebra Striping Background (Warna berselang-seling)
      if (rowIndex % 2 === 1) {
        doc.setFillColor(248, 250, 252); // Slate 50
        doc.rect(marginLeft, currentY, contentWidth, rowHeight, 'F');
      }

      // Garis Batas Bawah Sel
      doc.setDrawColor(241, 245, 249); // Slate 100
      doc.setLineWidth(0.2);
      doc.line(marginLeft, currentY + rowHeight, pageWidth - marginRight, currentY + rowHeight);

      // Cetak Teks pada Sel
      let currentX = marginLeft;
      doc.setTextColor(51, 65, 85); // Slate 700

      normalizedColumns.forEach((col, colIdx) => {
        const lines = cellTexts[colIdx];
        lines.forEach((lineText, lineIdx) => {
          doc.text(lineText, currentX + 2, currentY + 4.5 + lineIdx * lineHeight);
        });
        currentX += col.width;
      });

      currentY += rowHeight;
    });

    // ------------------------------------------------------------------------
    // 5. FOOTER & PENOMORAN HALAMAN OTOMATIS (PAGE X OF Y)
    // ------------------------------------------------------------------------
    const totalPages = doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      const footerY = pageHeight - 10;

      // Garis Tipis di Atas Footer
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(marginLeft, footerY - 3, pageWidth - marginRight, footerY - 3);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate 400

      // Teks Kiri Footer
      doc.text('PLH-INTELLIGENCE — SMART Ekselensia Indonesia', marginLeft, footerY);

      // Teks Kanan Footer (Halaman X dari Y)
      const pageText = `Halaman ${i} dari ${totalPages}`;
      doc.text(pageText, pageWidth - marginRight, footerY, { align: 'right' });
    }

    // Eksekusi Pemicu Unduhan Berkas PDF
    doc.save(fileName);
    return true;
  } catch (error) {
    console.error('❌ [createPDF.js Error]:', error);
    throw new Error(`Gagal membuat dokumen PDF: ${error.message}`);
  }
}