/**
 * ============================================================================
 * PLH-INTELLIGENCE - Image Compressor Utility
 * ============================================================================
 * Berkas    : src/utils/imageCompressor.js
 * Deskripsi : Helper modular untuk mengompresi file gambar di sisi klien (browser)
 *             menggunakan `browser-image-compression` serta helper konversi Base64.
 * ============================================================================
 */

import imageCompression from 'browser-image-compression';

/**
 * Konfigurasi Default Proses Kompresi Gambar
 */
const DEFAULT_COMPRESSION_OPTIONS = {
  maxSizeMB: 1, // Batas ukuran maksimal hasil akhir (1 MB)
  maxWidthOrHeight: 1280, // Resolusi dimensi terbesar (1280px)
  useWebWorker: true, // Menggunakan Web Worker agar tidak membekukan UI Utama
  fileType: 'image/jpeg' // Output format terstandarisasi ke JPEG
};

/**
 * Mengompresi objek `File` atau `Blob` gambar berdasarkan opsi yang disesuaikan.
 *
 * @async
 * @function compressImage
 * @param {File|Blob} file - Objek File/Blob gambar mentah dari input formulir.
 * @param {Object} [customOptions={}] - Opsi khusus untuk menimpa konfigurasi default.
 * @param {number} [customOptions.maxSizeMB] - Ukuran maksimal dalam Megabyte.
 * @param {number} [customOptions.maxWidthOrHeight] - Batas dimensi panjang/lebar pixel.
 * @param {boolean} [customOptions.useWebWorker] - Jalankan di background thread.
 * @param {string} [customOptions.fileType] - Format MIME output gambar.
 * @returns {Promise<File>} Objek `File` baru yang telah terkompresi.
 * @throws {Error} Jika file yang diberikan bukan merupakan format gambar yang valid.
 *
 * @example
 * import { compressImage } from './utils/imageCompressor.js';
 *
 * const compressedFile = await compressImage(fileInput.files[0], {
 *   maxSizeMB: 0.5,
 *   maxWidthOrHeight: 1024
 * });
 * console.log(`Ukuran awal: ${file.size} bytes, Ukuran baru: ${compressedFile.size} bytes`);
 */
export async function compressImage(file, customOptions = {}) {
  try {
    // Validasi Tipe Data Input
    if (!file || !(file instanceof Blob)) {
      throw new Error('[imageCompressor] Parameter "file" harus berupa instance Objek File atau Blob.');
    }

    // Validasi MIME Type Gambar
    if (file.type && !file.type.startsWith('image/')) {
      throw new Error(`[imageCompressor] Tipe berkas "${file.type}" bukan merupakan format gambar yang valid.`);
    }

    // Penggabungan (Merge) Konfigurasi Default dengan Custom Options
    const options = {
      ...DEFAULT_COMPRESSION_OPTIONS,
      ...customOptions
    };

    // Eksekusi Kompresi Asynchronous via browser-image-compression
    const compressedBlob = await imageCompression(file, options);

    // Salin nama berkas asli jika merupakan instance File
    const originalName = file instanceof File ? file.name : 'compressed_image.jpg';
    const sanitizedName = originalName.replace(/\.[^/.]+$/, '') + '.jpg';

    // Bungkus kembali sebagai Objek File resmi
    const compressedFile = new File([compressedBlob], sanitizedName, {
      type: options.fileType,
      lastModified: Date.now()
    });

    return compressedFile;
  } catch (error) {
    console.error('❌ [imageCompressor.js Error]:', error);
    throw new Error(`Proses kompresi gambar gagal: ${error.message}`);
  }
}

/**
 * Mengonversi Objek `File` atau `Blob` menjadi String Base64 Data URL.
 *
 * @function fileToBase64
 * @param {File|Blob} file - Objek berkas gambar yang akan dikonversi.
 * @returns {Promise<string>} String Async Data URL berformat Base64 (`data:image/jpeg;base64,...`).
 * @throws {Error} Jika parameter input tidak valid atau gagal dibaca oleh FileReader.
 *
 * @example
 * import { fileToBase64 } from './utils/imageCompressor.js';
 *
 * const base64String = await fileToBase64(compressedFile);
 * document.getElementById('previewImg').src = base64String;
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof Blob)) {
      return reject(new Error('[fileToBase64] Parameter wajib berupa Objek File atau Blob.'));
    }

    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = (error) => {
      console.error('❌ [fileToBase64 Error]:', error);
      reject(new Error('Gagal membaca dan mengonversi file ke format Base64.'));
    };

    reader.readAsDataURL(file);
  });
}