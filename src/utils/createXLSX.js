/**
 * ============================================================================
 * PLH-INTELLIGENCE - Excel Generator Utility
 * ============================================================================
 * Berkas    : src/utils/createXLSX.js
 * Deskripsi : Helper modular untuk mengekspor data terstruktur ke format berkas
 *             Spreadsheet (.xlsx) berbasis pustaka `exceljs`.
 * ============================================================================
 */

import ExcelJS from 'exceljs';

/**
 * Parameter konfigurasi pembuatan berkas Excel.
 * @typedef {Object} ExcelColumnDefinition
 * @property {string} header - Teks judul header kolom.
 * @property {string} key - Key properti objek yang dipetakan dari data.
 * @property {number} [width] - Lebar kolom opsional (jika tidak diisi, dihitung otomatis).
 */

/**
 * @typedef {Object} ExcelReportOptions
 * @property {string} [sheetName="Data Laporan"] - Nama lembar kerja (worksheet).
 * @property {Array<ExcelColumnDefinition>} columns - Definisi daftar kolom spreadsheet.
 * @property {Array<Object>} data - Array objek data yang akan dimasukkan ke baris tabel.
 * @property {string} [fileName="Laporan_PLH.xlsx"] - Nama file hasil ekspor (.xlsx).
 */

/**
 * Menghasilkan dan memicu unduhan berkas Excel (.xlsx) dengan penataan gaya profesional.
 *
 * @async
 * @function generateExcelReport
 * @param {ExcelReportOptions} options - Objek parameter pembuatan spreadsheet.
 * @returns {Promise<boolean>} Resolves `true` jika eksekusi dan unduhan berhasil.
 * @throws {Error} Jika data masukan tidak valid atau pemrosesan buffer Excel gagal.
 *
 * @example
 * import { generateExcelReport } from './utils/createXLSX.js';
 *
 * await generateExcelReport({
 *   sheetName: 'Kriteria DSS',
 *   columns: [
 *     { header: 'ID Zona', key: 'id', width: 12 },
 *     { header: 'Nama Lokasi', key: 'nama_lokasi' },
 *     { header: 'Indeks Kebersihan', key: 'indeks' }
 *   ],
 *   data: [
 *     { id: 'Z01', nama_lokasi: 'Taman Depan Sekolah', indeks: 95 },
 *     { id: 'Z02', nama_lokasi: 'Laboratorium IPA', indeks: 82 }
 *   ],
 *   fileName: 'Data_Kriteria_PLH.xlsx'
 * });
 */
export async function generateExcelReport({
  sheetName = 'Data Laporan',
  columns = [],
  data = [],
  fileName = 'Laporan_PLH.xlsx'
}) {
  try {
    if (!Array.isArray(columns) || columns.length === 0) {
      throw new Error('[createXLSX] Parameter "columns" wajib diisi dengan definisi kolom.');
    }

    if (!Array.isArray(data)) {
      throw new Error('[createXLSX] Parameter "data" harus berupa Array.');
    }

    // 1. Inisialisasi Workbook & Worksheet Baru
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'PLH-INTELLIGENCE System';
    workbook.lastModifiedBy = 'PLH-INTELLIGENCE System';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ showGridLines: true }]
    });

    // 2. Kalkulasi Lebar Kolom Dinamis (Auto-Fit Column Widths)
    const formattedColumns = columns.map((col) => {
      const headerText = col.header || '';
      const dataKey = col.key || '';

      // Cari teks terpanjang dari data pada kolom ini
      let maxContentLength = headerText.length;

      data.forEach((row) => {
        const val = row[dataKey];
        if (val !== null && val !== undefined) {
          const strVal = String(val);
          if (strVal.length > maxContentLength) {
            maxContentLength = strVal.length;
          }
        }
      });

      // Tambahkan padding ekstra (4 karakter) agar teks tidak terpotong
      const calculatedWidth = Math.max(col.width || 0, maxContentLength + 5, 12);

      return {
        header: headerText,
        key: dataKey,
        width: calculatedWidth
      };
    });

    worksheet.columns = formattedColumns;

    // 3. Penataan Gaya (Styling) pada Baris Header (Row 1)
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;

    headerRow.eachCell((cell) => {
      // Font Header
      cell.font = {
        name: 'Segoe UI',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFF' } // Warna Teks Putih
      };

      // Fill Background Solid (Biru Slate Gelap #1E293B)
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '1E293B' }
      };

      // Alignment Teks Rata Tengah Vertical & Horizontal
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true
      };

      // Border Sel Header
      cell.border = {
        top: { style: 'medium', color: { argb: '0F172A' } },
        left: { style: 'thin', color: { argb: '334155' } },
        bottom: { style: 'medium', color: { argb: '0F172A' } },
        right: { style: 'thin', color: { argb: '334155' } }
      };
    });

    // 4. Memasukkan Baris Data
    data.forEach((item) => {
      worksheet.addRow(item);
    });

    // 5. Penataan Gaya Baris Data (Alignment, Font, & Gridlines)
    worksheet.eachRow((row, rowNumber) => {
      // Lewati baris header
      if (rowNumber === 1) return;

      row.height = 20;

      row.eachCell((cell) => {
        cell.font = {
          name: 'Segoe UI',
          size: 10,
          color: { argb: '334155' } // Slate 700
        };

        cell.alignment = {
          vertical: 'middle',
          horizontal: typeof cell.value === 'number' ? 'right' : 'left'
        };

        // Gridlines Tipis di Setiap Sel Data
        cell.border = {
          top: { style: 'thin', color: { argb: 'E2E8F0' } },
          left: { style: 'thin', color: { argb: 'E2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
          right: { style: 'thin', color: { argb: 'E2E8F0' } }
        };
      });
    });

    // 6. Mengonversi Workbook Menjadi Buffer Array & Blob Browser
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    // 7. Memicu Pemasangan Elemen Anchor Sementara untuk Mengunduh File
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;

    document.body.appendChild(anchor);
    anchor.click();

    // Pembersihan Alokasi Memori
    document.body.removeChild(anchor);
    URL.revokeObjectURL(downloadUrl);

    return true;
  } catch (error) {
    console.error('❌ [createXLSX.js Error]:', error);
    throw new Error(`Gagal mengekspor data ke Excel: ${error.message}`);
  }
}