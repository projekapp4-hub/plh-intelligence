/**
 * FORMVIEW.JS - Modul Form Input Data Laporan Kebersihan & Preservasi (Modern Enterprise Adiwiyata)
 * Path: src/pages/dashboard/views/formView.js
 *
 * Mengimplementasikan arsitektur Single Page Application (SPA),
 * Live Compliance Engine dengan Floating Glassmorphism HUD, Segmented Pill Toggles,
 * Modern Drag & Drop Media Dropzone, Modal Quick Preview,
 * Kompresi Gambar Otomatis (imageCompressor.js), serta Penyimpanan Asinkron IndexedDB (dss_records).
 */

import { compressImage, fileToBase64 } from '../../../utils/imageCompressor.js';
import { saveItem } from '../../../utils/storage.js';

// SVG Icon Pack (Lucide style, zero emojis)
const ICONS = {
  clipboard: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="m9 14 2 2 4-4"></path></svg>`,
  user: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  calendar: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>`,
  sparkles: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path></svg>`,
  trash2: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`,
  sprout: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"></path><path d="M10 20c5.5-2.5.8-6.4 3-13"></path><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"></path><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"></path></svg>`,
  zap: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  droplet: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>`,
  uploadCloud: `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m16 16-4-4-4 4"></path></svg>`,
  check: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  x: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  refresh: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path><path d="M16 21h5v-5"></path></svg>`,
  eye: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  save: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>`,
  alertTriangle: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  checkCircle: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
  camera: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>`,
  users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  listCheck: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 17 2 2 4-4"></path><path d="m3 7 2 2 4-4"></path><path d="M13 6h8"></path><path d="M13 12h8"></path><path d="M13 18h8"></path></svg>`,
  fileText: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>`
};

// Data Struktur 13 Poin Tugas Checklist dalam 5 Kategori
const CHECKLIST_CATEGORIES = [
  {
    id: 'kat_1',
    code: 'KAT-1',
    title: 'Kebersihan dan Sanitasi',
    iconSvg: ICONS.sparkles,
    badgeColor: 'emerald',
    items: [
      { id: 'task_1_1', code: '1.1', label: 'Menyikat dan membersihkan WC lantai 1 dan lantai 2 sekolah.' },
      { id: 'task_1_2', code: '1.2', label: 'Menyapu dan mengepel koridor lantai 1 dan lantai 2 sekolah.' },
      { id: 'task_1_3', code: '1.3', label: 'Mengecek dan membersihkan drainase di lingkungan sekolah.' }
    ]
  },
  {
    id: 'kat_2',
    code: 'KAT-2',
    title: 'Pengelolaan Sampah',
    iconSvg: ICONS.trash2,
    badgeColor: 'amber',
    items: [
      { id: 'task_2_1', code: '2.1', label: 'Membawa sampah ke bank sampah.' },
      { id: 'task_2_2', code: '2.2', label: 'Memilah sampah organik, unorganik, dan residu.' },
      { id: 'task_2_3', code: '2.3', label: 'Menimbang dan mencatat pada buku laporan jumlah sampah organik, unorganik, dan residu.' },
      { id: 'task_2_4', code: '2.4', label: 'Memasukkan sampah organik ke lubang biopori.' }
    ]
  },
  {
    id: 'kat_3',
    code: 'KAT-3',
    title: 'Keanekaragaman Hayati',
    iconSvg: ICONS.sprout,
    badgeColor: 'teal',
    items: [
      { id: 'task_3_1', code: '3.1', label: 'Berkebun di green house (mengolah lahan, menanam, merawat, memanen, atau memasarkan).' },
      { id: 'task_3_2', code: '3.2', label: 'Beternak ikan (merawat, memanen, atau memasarkan).' },
      { id: 'task_3_3', code: '3.3', label: 'Merawat tanaman pot siswi (mencabut gulma, menyiram, memanen, memasarkan, atau mengolah).' }
    ]
  },
  {
    id: 'kat_4',
    code: 'KAT-4',
    title: 'Penghematan Energi',
    iconSvg: ICONS.zap,
    badgeColor: 'yellow',
    items: [
      { id: 'task_4_1', code: '4.1', label: 'Melakukan pengecekan penggunaan kipas angin dan lampu penerangan di masjid (shof putra & putri). Mematikan peralatan listrik jika tidak digunakan dan melapor ke guru piket.' }
    ]
  },
  {
    id: 'kat_5',
    code: 'KAT-5',
    title: 'Penghematan Air',
    iconSvg: ICONS.droplet,
    badgeColor: 'sky',
    items: [
      { id: 'task_5_1', code: '5.1', label: 'Melakukan pengecekan keran air di toilet dan tempat wudhu. Melaporkan ke guru piket jika terjadi kebocoran atau pemborosan air.' },
      { id: 'task_5_2', code: '5.2', label: 'Menyiram tanaman di green house menggunakan air tadah hujan di toren penampungan samping asrama.' }
    ]
  }
];

// Array Penampung Berkas Foto yang Diunggah ({ file, src })
let uploadedPhotos = [];

/**
 * Fungsi Utama Render Modul Form
 * @param {HTMLElement} container - Elemen pembungkus #spaCanvas
 */
export function render(container) {
  const todayISO = new Date().toISOString().split('T')[0];

  // 1. Injeksi Struktur Markup HTML
  container.innerHTML = `
    <div class="form-wrapper">

      <!-- HEADER FORM DENGAN ENTERPRISE BRANDING -->
      <header class="form-header-card">
        <div class="header-main-row">
          <div class="identity-badge-icon">
            ${ICONS.clipboard}
          </div>
          <div class="identity-text-group">
            <div class="identity-meta-row">
              <span class="compliance-tag">Adiwiyata Compliance</span>
              <span class="version-tag">Instrumen Standar Mutu</span>
            </div>
            <h1 class="form-title">Form Laporan Kebersihan & Preservasi Lingkungan</h1>
            <p class="form-subtitle">Instrumen digital evaluasi harian kepatuhan pemeliharaan lingkungan sekolah berbasis data.</p>
          </div>
        </div>

        <!-- FLOATING LIVE COMPLIANCE HUD BAR -->
        <div class="floating-hud-bar" id="stickyScoreBar">
          <div class="hud-main-grid">

            <div class="hud-stat-item">
              <span class="hud-stat-label">Kelengkapan Form</span>
              <div class="hud-stat-val-group">
                <strong id="completionText" class="hud-stat-value">0 / 13</strong>
                <span class="hud-stat-unit">Tugas Terisi</span>
              </div>
            </div>

            <div class="hud-stat-divider"></div>

            <div class="hud-stat-item">
              <span class="hud-stat-label">Skor Kepatuhan</span>
              <div class="hud-stat-val-group">
                <span id="scorePercentage" class="hud-score-pct">0%</span>
                <span id="statusBadge" class="hud-badge badge-neutral">Belum Lengkap</span>
              </div>
            </div>

            <div class="hud-stat-divider"></div>

            <!-- PANEL AKSI CEPAT (BULK ACTIONS) -->
            <div class="hud-actions-group">
              <button type="button" id="btnMarkAllTrue" class="hud-action-btn btn-action-true" title="Tandai seluruh tugas dengan status TRUE">
                <span class="btn-icon-svg">${ICONS.check}</span> Semua TRUE
              </button>
              <button type="button" id="btnMarkAllFalse" class="hud-action-btn btn-action-false" title="Tandai seluruh tugas dengan status FALSE">
                <span class="btn-icon-svg">${ICONS.x}</span> Semua FALSE
              </button>
              <button type="button" id="btnResetForm" class="hud-action-btn btn-action-reset" title="Kosongkan seluruh isian form">
                <span class="btn-icon-svg">${ICONS.refresh}</span> Reset
              </button>
            </div>

          </div>

          <!-- Progress Bar Track -->
          <div class="hud-progress-container" aria-label="Progress kelengkapan form">
            <div id="progressFill" class="hud-progress-bar" style="width: 0%;"></div>
          </div>
        </div>
      </header>

      <!-- FORM UTAMA -->
      <form id="plhReportForm" class="report-form" novalidate>

        <!-- BAGIAN 1: INFORMASI PETUGAS & PELAKSANAAN -->
        <section class="section-card">
          <div class="section-header">
            <div class="section-number-badge">01</div>
            <div class="section-title-wrap">
              <h2 class="section-title">Informasi Petugas & Pelaksanaan</h2>
              <p class="section-subtitle">Data administratif penanggung jawab dan tim pelaksana piket harian.</p>
            </div>
          </div>

          <div class="section-body">
            <!-- Grid Baris 1: Guru Piket & Tanggal -->
            <div class="form-grid grid-cols-2">
              <div class="form-field-group">
                <label for="guruPiket" class="field-label">Guru Piket Penanggung Jawab <span class="req-star">*</span></label>
                <div class="field-input-wrap">
                  <span class="field-icon">${ICONS.user}</span>
                  <input type="text" id="guruPiket" name="guruPiket" class="form-input" placeholder="Masukkan nama lengkap guru piket" required autocomplete="off">
                </div>
                <span class="field-error-text" id="err-guruPiket">Nama guru piket wajib diisi</span>
              </div>

              <div class="form-field-group">
                <label for="tanggalPiket" class="field-label">Tanggal Pelaksanaan <span class="req-star">*</span></label>
                <div class="field-input-wrap">
                  <span class="field-icon">${ICONS.calendar}</span>
                  <input type="date" id="tanggalPiket" name="tanggalPiket" class="form-input" value="${todayISO}" required>
                </div>
                <span class="field-error-text" id="err-tanggalPiket">Tanggal pelaksanaan wajib dipilih</span>
              </div>
            </div>

            <!-- Grid Baris 2: Tim Petugas (3 Kolom) -->
            <div class="form-grid grid-cols-3">
              <div class="form-field-group">
                <label for="petugas1" class="field-label">Petugas 1 <span class="req-star">*</span></label>
                <div class="field-input-wrap">
                  <span class="field-icon">${ICONS.user}</span>
                  <input type="text" id="petugas1" name="petugas1" class="form-input" placeholder="Nama petugas 1" required autocomplete="off">
                </div>
                <span class="field-error-text" id="err-petugas1">Petugas 1 wajib diisi</span>
              </div>

              <div class="form-field-group">
                <label for="petugas2" class="field-label">Petugas 2 <span class="req-star">*</span></label>
                <div class="field-input-wrap">
                  <span class="field-icon">${ICONS.user}</span>
                  <input type="text" id="petugas2" name="petugas2" class="form-input" placeholder="Nama petugas 2" required autocomplete="off">
                </div>
                <span class="field-error-text" id="err-petugas2">Petugas 2 wajib diisi</span>
              </div>

              <div class="form-field-group">
                <label for="petugas3" class="field-label">Petugas 3 <span class="req-star">*</span></label>
                <div class="field-input-wrap">
                  <span class="field-icon">${ICONS.user}</span>
                  <input type="text" id="petugas3" name="petugas3" class="form-input" placeholder="Nama petugas 3" required autocomplete="off">
                </div>
                <span class="field-error-text" id="err-petugas3">Petugas 3 wajib diisi</span>
              </div>
            </div>
          </div>
        </section>

        <!-- BAGIAN 2: EVALUASI 13 POIN TUGAS CHECKLIST (5 KATEGORI) -->
        <section class="section-card">
          <div class="section-header">
            <div class="section-number-badge">02</div>
            <div class="section-title-wrap">
              <h2 class="section-title">Evaluasi 13 Poin Checklist Kepatuhan</h2>
              <p class="section-subtitle">Tentukan status keterlaksanaan untuk setiap indikator tugas pemeliharaan lingkungan.</p>
            </div>
          </div>

          <div class="section-body categories-wrapper">
            ${renderCategoriesMarkup()}
          </div>
        </section>

        <!-- BAGIAN 3: DOKUMENTASI MEDIA & CATATAN EVALUASI -->
        <section class="section-card">
          <div class="section-header">
            <div class="section-number-badge">03</div>
            <div class="section-title-wrap">
              <h2 class="section-title">Dokumentasi Foto & Narasi Lapangan</h2>
              <p class="section-subtitle">Lampirkan bukti visual fisik kegiatan dan catatan observasi evaluatif.</p>
            </div>
          </div>

          <div class="section-body">
            <!-- Modern Drag & Drop Zone -->
            <div class="form-field-group">
              <div class="field-label-with-meta">
                <label class="field-label">Unggah Foto Dokumentasi Kegiatan</label>
                <span class="meta-limit-badge">Maksimal 5 Foto • Auto Kompresi &lt; 1MB</span>
              </div>

              <div id="dropzone" class="modern-dropzone" tabindex="0" role="button" aria-label="Dropzone upload foto kegiatan">
                <div class="dropzone-inner" id="dropzoneContent">
                  <div class="dropzone-icon-circle">
                    ${ICONS.uploadCloud}
                  </div>
                  <div class="dropzone-text-group">
                    <p class="dropzone-primary-text">
                      <strong>Tarik & letakkan foto di sini</strong>, atau <span class="text-accent">telusuri berkas</span>
                    </p>
                    <p class="dropzone-secondary-text">Format: JPG, PNG, WEBP (Otomatis dikompresi ke 1280px WebP/JPEG)</p>
                  </div>
                </div>
                <input type="file" id="fileInput" accept="image/jpeg,image/png,image/webp" multiple class="file-input-hidden">
              </div>

              <!-- State Loading Kompresi -->
              <div id="uploadStatusText" class="upload-processing-indicator" style="display: none;">
                <span class="processing-spinner"></span>
                <span>Memproses dan mengompresi gambar otomatis...</span>
              </div>

              <!-- Grid Pratinjau Foto Thumbnail -->
              <div id="photoPreviewGrid" class="photo-preview-grid"></div>
            </div>

            <!-- Kolom Catatan & Evaluasi Narasi -->
            <div class="form-field-group mt-4">
              <label for="catatanEvaluasi" class="field-label">Catatan & Evaluasi Narasi Lapangan <span class="optional-tag">(Opsional)</span></label>
              <textarea id="catatanEvaluasi" name="catatanEvaluasi" class="form-input textarea-input" rows="4" placeholder="Tuliskan temuan lapangan, kendala teknis, klarifikasi jika ada tugas yang FALSE, atau rekomendasi tindak lanjut..."></textarea>
            </div>
          </div>
        </section>

        <!-- PANEL VALIDASI & ACTIONS FOOTER -->
        <div class="form-footer-actions">

          <!-- Validation Warning Banner -->
          <div id="validationAlert" class="validation-banner">
            <span class="banner-icon">${ICONS.alertTriangle}</span>
            <div class="banner-text">
              <strong>Formulir Belum Lengkap:</strong> Harap isi seluruh data petugas dan tentukan status pada 13 poin checklist untuk mengaktifkan tombol penyimpanan.
            </div>
          </div>

          <div class="actions-button-row">
            <button type="button" id="btnQuickPreview" class="btn-action btn-secondary-preview">
              <span class="btn-icon">${ICONS.eye}</span>
              <span>Quick Preview</span>
            </button>
            <button type="submit" id="btnSubmitForm" class="btn-action btn-primary-submit" disabled>
              <span class="btn-icon">${ICONS.save}</span>
              <span>Simpan Laporan Data</span>
            </button>
          </div>

        </div>

      </form>

      <!-- JENDELA MODAL QUICK PREVIEW -->
      <div id="previewModal" class="modal-backdrop" aria-hidden="true">
        <div class="modal-dialog-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <div class="modal-dialog-header">
            <div class="modal-header-left">
              <span class="modal-icon-badge">${ICONS.fileText}</span>
              <h3 id="modalTitle" class="modal-heading">Pratinjau Ringkasan Laporan</h3>
            </div>
            <button type="button" id="btnCloseModal" class="modal-close-button" aria-label="Tutup pratinjau">
              ${ICONS.x}
            </button>
          </div>

          <div class="modal-dialog-body" id="modalPreviewBody">
            <!-- Konten pratinjau dirender secara dinamis -->
          </div>

          <div class="modal-dialog-footer">
            <button type="button" id="btnBackEdit" class="modal-btn modal-btn-secondary">Kembali Edit</button>
            <button type="button" id="btnConfirmSave" class="modal-btn modal-btn-primary" disabled>
              <span class="btn-icon">${ICONS.save}</span>
              <span>Konfirmasi & Simpan</span>
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- SCOPED ENTERPRISE CSS -->
    <style>
      .form-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
        max-width: 1080px;
        margin: 0 auto;
        padding-bottom: 4rem;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        color: #1e293b;
      }

      /* Form Header Card */
      .form-header-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 1.5rem;
        box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.05);
      }

      .header-main-row {
        display: flex;
        align-items: flex-start;
        gap: 1.25rem;
        margin-bottom: 1.5rem;
      }

      .identity-badge-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: #ecfdf5;
        color: #065f46;
        border: 1px solid #a7f3d0;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .identity-text-group {
        flex: 1;
      }

      .identity-meta-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.35rem;
      }

      .compliance-tag {
        font-size: 0.72rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 0.15rem 0.55rem;
        border-radius: 6px;
        background: #065f46;
        color: #ffffff;
      }

      .version-tag {
        font-size: 0.72rem;
        font-weight: 600;
        color: #64748b;
        background: #f1f5f9;
        padding: 0.15rem 0.55rem;
        border-radius: 6px;
      }

      .form-title {
        margin: 0;
        font-size: 1.28rem;
        font-weight: 800;
        color: #0f172a;
        letter-spacing: -0.01em;
      }

      .form-subtitle {
        margin: 0.3rem 0 0 0;
        font-size: 0.84rem;
        color: #64748b;
        line-height: 1.45;
      }

      /* Floating Glassmorphism Compliance HUD */
      .floating-hud-bar {
        position: sticky;
        top: 1rem;
        z-index: 50;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        padding: 0.85rem 1.15rem;
        box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04);
        transition: box-shadow 0.2s ease;
      }

      .hud-main-grid {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      @media (min-width: 768px) {
        .hud-main-grid {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
      }

      .hud-stat-item {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }

      .hud-stat-label {
        font-size: 0.72rem;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .hud-stat-val-group {
        display: flex;
        align-items: center;
        gap: 0.45rem;
      }

      .hud-stat-value {
        font-size: 1.15rem;
        font-weight: 800;
        color: #0f172a;
      }

      .hud-stat-unit {
        font-size: 0.8rem;
        color: #64748b;
        font-weight: 500;
      }

      .hud-score-pct {
        font-size: 1.15rem;
        font-weight: 800;
        color: #065f46;
      }

      .hud-stat-divider {
        display: none;
        width: 1px;
        height: 28px;
        background: #e2e8f0;
      }

      @media (min-width: 768px) {
        .hud-stat-divider {
          display: block;
        }
      }

      .hud-badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0.2rem 0.6rem;
        border-radius: 9999px;
        letter-spacing: 0.02em;
      }

      .badge-neutral { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
      .badge-success { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
      .badge-info { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
      .badge-warning { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }

      /* Bulk Action Buttons */
      .hud-actions-group {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.4rem;
      }

      .hud-action-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.74rem;
        font-weight: 600;
        padding: 0.35rem 0.7rem;
        border-radius: 8px;
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 0.15s ease;
        background: #ffffff;
      }

      .btn-icon-svg {
        display: flex;
        align-items: center;
      }

      .btn-action-true {
        background: #f0fdf4;
        color: #15803d;
        border-color: #bbf7d0;
      }
      .btn-action-true:hover {
        background: #dcfce7;
        border-color: #86efac;
      }

      .btn-action-false {
        background: #fff1f2;
        color: #be123c;
        border-color: #fecdd3;
      }
      .btn-action-false:hover {
        background: #ffe4e6;
        border-color: #fda4af;
      }

      .btn-action-reset {
        background: #f8fafc;
        color: #475569;
        border-color: #cbd5e1;
      }
      .btn-action-reset:hover {
        background: #f1f5f9;
        color: #1e293b;
      }

      /* Progress Bar */
      .hud-progress-container {
        width: 100%;
        height: 6px;
        background: #f1f5f9;
        border-radius: 9999px;
        overflow: hidden;
        margin-top: 0.75rem;
      }

      .hud-progress-bar {
        height: 100%;
        background: linear-gradient(90deg, #10b981, #059669);
        border-radius: 9999px;
        transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      /* Section Cards */
      .section-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04);
        overflow: hidden;
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        padding: 1.15rem 1.5rem;
        background: #fafafa;
        border-bottom: 1px solid #f1f5f9;
      }

      .section-number-badge {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: #065f46;
        color: #ffffff;
        font-size: 0.76rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .section-title-wrap {
        flex: 1;
      }

      .section-title {
        margin: 0;
        font-size: 0.98rem;
        font-weight: 700;
        color: #0f172a;
      }

      .section-subtitle {
        margin: 0.15rem 0 0 0;
        font-size: 0.78rem;
        color: #64748b;
      }

      .section-body {
        padding: 1.5rem;
      }

      /* Grid System */
      .form-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }

      @media (min-width: 640px) {
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
      }

      .grid-cols-3 {
        margin-top: 1.25rem;
      }

      /* Form Fields */
      .form-field-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .field-label {
        font-size: 0.82rem;
        font-weight: 600;
        color: #334155;
      }

      .field-label-with-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.2rem;
      }

      .meta-limit-badge {
        font-size: 0.72rem;
        color: #64748b;
        background: #f1f5f9;
        padding: 0.15rem 0.45rem;
        border-radius: 4px;
        font-weight: 500;
      }

      .req-star {
        color: #e11d48;
      }

      .optional-tag {
        font-size: 0.74rem;
        font-weight: 400;
        color: #94a3b8;
      }

      .field-input-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }

      .field-icon {
        position: absolute;
        left: 0.85rem;
        color: #94a3b8;
        display: flex;
        align-items: center;
        pointer-events: none;
      }

      .form-input {
        width: 100%;
        padding: 0.65rem 0.85rem 0.65rem 2.45rem;
        font-size: 0.86rem;
        color: #0f172a;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        outline: none;
        transition: all 0.15s ease;
        font-family: inherit;
      }

      .form-input:focus {
        border-color: #059669;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
      }

      .textarea-input {
        padding: 0.75rem;
        resize: vertical;
        min-height: 90px;
        line-height: 1.5;
      }

      .field-error-text {
        font-size: 0.72rem;
        color: #e11d48;
        display: none;
        font-weight: 500;
      }

      .form-field-group.has-error .field-error-text {
        display: block;
      }

      .form-field-group.has-error .form-input {
        border-color: #e11d48;
        background-color: #fff1f2;
      }

      /* Checklist Categories Container */
      .categories-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
      }

      .category-card {
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        background: #ffffff;
        overflow: hidden;
      }

      .category-header-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.85rem 1.15rem;
        background: #f8fafc;
        border-bottom: 1px solid #f1f5f9;
      }

      .category-brand {
        display: flex;
        align-items: center;
        gap: 0.65rem;
      }

      .category-icon-box {
        width: 30px;
        height: 30px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #ecfdf5;
        color: #065f46;
        border: 1px solid #a7f3d0;
      }

      .category-name {
        font-size: 0.88rem;
        font-weight: 700;
        color: #1e293b;
      }

      .category-badge-pill {
        font-size: 0.72rem;
        font-weight: 700;
        color: #64748b;
        background: #e2e8f0;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
      }

      .category-tasks-list {
        display: flex;
        flex-direction: column;
      }

      .task-row {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        padding: 1rem 1.15rem;
        border-bottom: 1px solid #f1f5f9;
        transition: background-color 0.15s ease;
      }

      .task-row:last-child {
        border-bottom: none;
      }

      .task-row:hover {
        background-color: #fafbfc;
      }

      @media (min-width: 640px) {
        .task-row {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
      }

      .task-content-group {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        flex: 1;
      }

      .task-code-pill {
        font-size: 0.74rem;
        font-weight: 800;
        color: #065f46;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        padding: 0.15rem 0.45rem;
        border-radius: 6px;
        min-width: 32px;
        text-align: center;
        flex-shrink: 0;
      }

      .task-text-label {
        font-size: 0.84rem;
        color: #334155;
        line-height: 1.45;
      }

      /* Segmented Toggle Control for TRUE / FALSE */
      .segmented-toggle-control {
        display: flex;
        align-items: center;
        background: #f1f5f9;
        padding: 0.25rem;
        border-radius: 10px;
        gap: 0.25rem;
        min-width: 220px;
      }

      .toggle-option-item {
        flex: 1;
        position: relative;
      }

      .toggle-option-item input[type="radio"] {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
        pointer-events: none;
      }

      .toggle-label {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        padding: 0.45rem 0.75rem;
        font-size: 0.78rem;
        font-weight: 700;
        border-radius: 8px;
        cursor: pointer;
        color: #64748b;
        background: transparent;
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        user-select: none;
      }

      .toggle-label:hover {
        color: #1e293b;
      }

      /* Radio TRUE Checked State */
      .toggle-true input[type="radio"]:checked + .toggle-label {
        background: #ffffff;
        color: #065f46;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 1px #a7f3d0;
      }

      /* Radio FALSE Checked State */
      .toggle-false input[type="radio"]:checked + .toggle-label {
        background: #ffffff;
        color: #be123c;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 1px #fecdd3;
      }

      /* Modern Dropzone Area */
      .modern-dropzone {
        border: 2px dashed #cbd5e1;
        border-radius: 14px;
        padding: 2rem 1.5rem;
        text-align: center;
        background: #f8fafc;
        cursor: pointer;
        outline: none;
        transition: all 0.2s ease;
      }

      .modern-dropzone:hover, .modern-dropzone.dragover, .modern-dropzone:focus {
        border-color: #059669;
        background: #f0fdf4;
      }

      .dropzone-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.65rem;
      }

      .dropzone-icon-circle {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        color: #059669;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
      }

      .dropzone-primary-text {
        margin: 0;
        font-size: 0.86rem;
        color: #334155;
      }

      .text-accent {
        color: #059669;
        font-weight: 600;
        text-decoration: underline;
      }

      .dropzone-secondary-text {
        margin: 0.2rem 0 0 0;
        font-size: 0.74rem;
        color: #94a3b8;
      }

      .file-input-hidden { display: none; }

      /* Upload Processing Spinner */
      .upload-processing-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.65rem;
        padding: 0.6rem 0.85rem;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        border-radius: 8px;
        font-size: 0.78rem;
        color: #065f46;
        font-weight: 600;
      }

      .processing-spinner {
        width: 14px;
        height: 14px;
        border: 2px solid #a7f3d0;
        border-top-color: #065f46;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      /* Photo Thumbnail Grid */
      .photo-preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(95px, 1fr));
        gap: 0.85rem;
        margin-top: 1rem;
      }

      .photo-thumb-card {
        position: relative;
        width: 100%;
        height: 95px;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid #e2e8f0;
        background: #f1f5f9;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }

      .photo-thumb-card img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.2s ease;
      }

      .photo-thumb-card:hover img {
        transform: scale(1.04);
      }

      .photo-delete-btn {
        position: absolute;
        top: 5px;
        right: 5px;
        background: rgba(15, 23, 42, 0.75);
        color: #ffffff;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s ease;
      }

      .photo-delete-btn:hover {
        background: #e11d48;
      }

      /* Form Footer & Validation Banner */
      .form-footer-actions {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        margin-top: 0.5rem;
      }

      .validation-banner {
        background: #fffbeb;
        border: 1px solid #fde68a;
        border-radius: 10px;
        padding: 0.85rem 1.15rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.82rem;
        color: #92400e;
        line-height: 1.4;
      }

      .banner-icon {
        color: #d97706;
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      .actions-button-row {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      @media (min-width: 640px) {
        .actions-button-row {
          flex-direction: row;
        }
      }

      .btn-action {
        flex: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.85rem 1.25rem;
        font-size: 0.88rem;
        font-weight: 700;
        border-radius: 10px;
        border: none;
        cursor: pointer;
        transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .btn-secondary-preview {
        background: #ffffff;
        color: #334155;
        border: 1px solid #cbd5e1;
      }
      .btn-secondary-preview:hover {
        background: #f8fafc;
        border-color: #94a3b8;
      }

      .btn-primary-submit {
        background: #065f46;
        color: #ffffff;
        box-shadow: 0 2px 4px rgba(6, 95, 70, 0.15);
      }
      .btn-primary-submit:hover:not(:disabled) {
        background: #044e39;
        box-shadow: 0 4px 8px rgba(6, 95, 70, 0.25);
      }
      .btn-primary-submit:disabled {
        background: #cbd5e1;
        color: #94a3b8;
        cursor: not-allowed;
        box-shadow: none;
      }

      /* Modal Backdrop & Dialog */
      .modal-backdrop {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        opacity: 0;
        visibility: hidden;
        transition: all 0.2s ease;
      }

      .modal-backdrop.active {
        opacity: 1;
        visibility: visible;
      }

      .modal-dialog-card {
        background: #ffffff;
        border-radius: 16px;
        width: 100%;
        max-width: 620px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25);
        overflow: hidden;
      }

      .modal-dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.15rem 1.5rem;
        background: #fafafa;
        border-bottom: 1px solid #f1f5f9;
      }

      .modal-header-left {
        display: flex;
        align-items: center;
        gap: 0.65rem;
      }

      .modal-icon-badge {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: #ecfdf5;
        color: #065f46;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .modal-heading {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 700;
        color: #0f172a;
      }

      .modal-close-button {
        background: transparent;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.15s ease;
      }

      .modal-close-button:hover {
        color: #0f172a;
      }

      .modal-dialog-body {
        padding: 1.5rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        font-size: 0.85rem;
      }

      .modal-dialog-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1rem 1.5rem;
        background: #fafafa;
        border-top: 1px solid #f1f5f9;
      }

      .modal-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.65rem 1.15rem;
        font-size: 0.84rem;
        font-weight: 700;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .modal-btn-secondary {
        background: #ffffff;
        color: #334155;
        border: 1px solid #cbd5e1;
      }
      .modal-btn-secondary:hover {
        background: #f1f5f9;
      }

      .modal-btn-primary {
        background: #065f46;
        color: #ffffff;
      }
      .modal-btn-primary:hover:not(:disabled) {
        background: #044e39;
      }
      .modal-btn-primary:disabled {
        background: #cbd5e1;
        color: #94a3b8;
        cursor: not-allowed;
      }

      /* Modal Custom Content */
      .modal-preview-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.85rem;
        background: #f8fafc;
        padding: 1rem;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
      }

      .preview-stat-card {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
      }

      .preview-stat-label {
        font-size: 0.72rem;
        color: #64748b;
        font-weight: 600;
        text-transform: uppercase;
      }

      .preview-stat-value {
        font-size: 0.92rem;
        font-weight: 700;
        color: #0f172a;
      }

      .preview-alert-list {
        background: #fff1f2;
        border: 1px solid #fecdd3;
        border-radius: 10px;
        padding: 0.85rem 1.15rem;
      }

      .preview-alert-title {
        font-size: 0.8rem;
        font-weight: 700;
        color: #be123c;
        margin-bottom: 0.4rem;
      }

      .preview-alert-items {
        padding-left: 1.25rem;
        margin: 0;
        color: #9f1239;
        font-size: 0.78rem;
        line-height: 1.5;
      }

      .preview-success-callout {
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        border-radius: 10px;
        padding: 0.85rem 1.15rem;
        color: #065f46;
        font-size: 0.82rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    </style>
  `;

  // 2. Inisialisasi Event Listener Logic
  initFormLogic(container);
}

/**
 * Membangun Markup HTML untuk 5 Kategori Tugas Checklist
 */
function renderCategoriesMarkup() {
  return CHECKLIST_CATEGORIES.map(category => `
    <div class="category-card">
      <div class="category-header-bar">
        <div class="category-brand">
          <div class="category-icon-box">
            ${category.iconSvg}
          </div>
          <span class="category-name">${category.title}</span>
        </div>
        <span class="category-badge-pill">${category.items.length} Poin Indikator</span>
      </div>

      <div class="category-tasks-list">
        ${category.items.map(task => `
          <div class="task-row">
            <div class="task-content-group">
              <span class="task-code-pill">${task.code}</span>
              <span class="task-text-label">${task.label}</span>
            </div>

            <div class="segmented-toggle-control" role="radiogroup" aria-label="Status tugas ${task.code}">
              <div class="toggle-option-item toggle-true">
                <input type="radio" id="${task.id}_true" name="${task.id}" value="TRUE">
                <label for="${task.id}_true" class="toggle-label">
                  <span class="btn-icon-svg">${ICONS.check}</span> TRUE
                </label>
              </div>

              <div class="toggle-option-item toggle-false">
                <input type="radio" id="${task.id}_false" name="${task.id}" value="FALSE">
                <label for="${task.id}_false" class="toggle-label">
                  <span class="btn-icon-svg">${ICONS.x}</span> FALSE
                </label>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

/**
 * Menghubungkan Semua Event Handlers, Logika Validasi, Kompresi Foto, dan Simpan Ke IndexedDB
 * @param {HTMLElement} container
 */
function initFormLogic(container) {
  const form = container.querySelector('#plhReportForm');
  const btnMarkAllTrue = container.querySelector('#btnMarkAllTrue');
  const btnMarkAllFalse = container.querySelector('#btnMarkAllFalse');
  const btnResetForm = container.querySelector('#btnResetForm');
  const dropzone = container.querySelector('#dropzone');
  const fileInput = container.querySelector('#fileInput');
  const photoPreviewGrid = container.querySelector('#photoPreviewGrid');
  const uploadStatusText = container.querySelector('#uploadStatusText');
  const btnSubmitForm = container.querySelector('#btnSubmitForm');
  const btnQuickPreview = container.querySelector('#btnQuickPreview');
  const validationAlert = container.querySelector('#validationAlert');

  // Modal Elements
  const previewModal = container.querySelector('#previewModal');
  const btnCloseModal = container.querySelector('#btnCloseModal');
  const btnBackEdit = container.querySelector('#btnBackEdit');
  const btnConfirmSave = container.querySelector('#btnConfirmSave');
  const modalPreviewBody = container.querySelector('#modalPreviewBody');

  // Input Teks Header
  const textInputs = ['guruPiket', 'tanggalPiket', 'petugas1', 'petugas2', 'petugas3'];

  // A. FUNGSI UNTUK MENGHITUNG DAN MENGUPDATE SKOR COMPLIANCE ENGINE
  function updateComplianceEngine() {
    let answeredCount = 0;
    let trueCount = 0;

    CHECKLIST_CATEGORIES.forEach(cat => {
      cat.items.forEach(task => {
        const selected = form.querySelector(`input[name="${task.id}"]:checked`);
        if (selected) {
          answeredCount++;
          if (selected.value === 'TRUE') {
            trueCount++;
          }
        }
      });
    });

    // 1. Update Bilah Kemajuan (Progress Bar)
    const progressPercent = Math.round((answeredCount / 13) * 100);
    const progressFill = container.querySelector('#progressFill');
    const completionText = container.querySelector('#completionText');
    if (progressFill) progressFill.style.width = `${progressPercent}%`;
    if (completionText) completionText.textContent = `${answeredCount} / 13`;

    // 2. Hitung Persentase Skor Capaian Kepatuhan
    const scorePercent = Math.round((trueCount / 13) * 100);
    const scorePercentageElem = container.querySelector('#scorePercentage');
    if (scorePercentageElem) scorePercentageElem.textContent = `${scorePercent}%`;

    // 3. Update Badge Status Kepatuhan
    const statusBadge = container.querySelector('#statusBadge');
    if (statusBadge) {
      statusBadge.className = 'hud-badge';
      if (answeredCount < 13) {
        statusBadge.textContent = 'Belum Lengkap';
        statusBadge.classList.add('badge-neutral');
      } else if (scorePercent >= 90) {
        statusBadge.textContent = 'Sangat Baik';
        statusBadge.classList.add('badge-success');
      } else if (scorePercent >= 75) {
        statusBadge.textContent = 'Baik';
        statusBadge.classList.add('badge-info');
      } else {
        statusBadge.textContent = 'Perlu Evaluasi';
        statusBadge.classList.add('badge-warning');
      }
    }

    // 4. Cek Validitas Form Seluruhnya
    validateFormCompleteness(answeredCount);
  }

  // B. FUNGSI LOGIKA VALIDASI INPUT HEADER & SUBMIT STATE
  function validateFormCompleteness(answeredCount) {
    let isHeaderValid = true;

    textInputs.forEach(id => {
      const field = form.querySelector(`#${id}`);
      if (!field || !field.value.trim()) {
        isHeaderValid = false;
      }
    });

    const isFullyValid = isHeaderValid && (answeredCount === 13);

    if (btnSubmitForm) btnSubmitForm.disabled = !isFullyValid;
    if (btnConfirmSave) btnConfirmSave.disabled = !isFullyValid;
    if (validationAlert) validationAlert.style.display = isFullyValid ? 'none' : 'flex';
  }

  // C. EVENT LISTENERS PERUBAHAN INPUT
  form.addEventListener('change', updateComplianceEngine);
  textInputs.forEach(id => {
    const input = form.querySelector(`#${id}`);
    if (input) {
      input.addEventListener('input', () => {
        const parent = input.closest('.form-field-group');
        if (input.value.trim()) {
          if (parent) parent.classList.remove('has-error');
        }
        updateComplianceEngine();
      });
    }
  });

  // D. BULK ACTION CONTROLS (PANEL AKSI CEPAT)
  if (btnMarkAllTrue) {
    btnMarkAllTrue.addEventListener('click', () => {
      CHECKLIST_CATEGORIES.forEach(cat => {
        cat.items.forEach(task => {
          const radioTrue = form.querySelector(`#${task.id}_true`);
          if (radioTrue) radioTrue.checked = true;
        });
      });
      updateComplianceEngine();
    });
  }

  if (btnMarkAllFalse) {
    btnMarkAllFalse.addEventListener('click', () => {
      CHECKLIST_CATEGORIES.forEach(cat => {
        cat.items.forEach(task => {
          const radioFalse = form.querySelector(`#${task.id}_false`);
          if (radioFalse) radioFalse.checked = true;
        });
      });
      updateComplianceEngine();
    });
  }

  if (btnResetForm) {
    btnResetForm.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin mengosongkan seluruh isian form?')) {
        form.reset();
        uploadedPhotos = [];
        renderPhotoThumbnails();
        updateComplianceEngine();
      }
    });
  }

  // E. LOGIKA DRAG & DROP FOTO DROPZONE + KOMPRESI GAMBAR (imageCompressor.js)
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
      }
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const files = Array.from(e.dataTransfer.files);
      handlePhotoUploads(files);
    });

    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      handlePhotoUploads(files);
    });
  }

  /**
   * Mengolah file yang diunggah, mengompresinya secara asinkron, dan menyimpannya ke uploadedPhotos
   * @param {File[]} files
   */
  async function handlePhotoUploads(files) {
    const validFiles = files.filter(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type));

    if (validFiles.length === 0) return;

    if (uploadedPhotos.length + validFiles.length > 5) {
      alert('Maksimal foto yang dapat diunggah adalah 5 foto.');
      return;
    }

    if (uploadStatusText) uploadStatusText.style.display = 'flex';

    for (const rawFile of validFiles) {
      try {
        // 1. Eksekusi Kompresi Gambar menggunakan imageCompressor.js
        const compressedFile = await compressImage(rawFile, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
          fileType: 'image/jpeg'
        });

        // 2. Konversi Hasil Kompresi ke Format Base64 Data URL
        const base64Src = await fileToBase64(compressedFile);

        // 3. Simpan ke penampung uploadedPhotos
        uploadedPhotos.push({
          file: compressedFile,
          src: base64Src
        });
      } catch (err) {
        console.error('Gagal mengompresi foto:', err);
        alert(`Gagal memproses berkas foto "${rawFile.name}": ${err.message}`);
      }
    }

    if (uploadStatusText) uploadStatusText.style.display = 'none';
    fileInput.value = ''; // Reset input file
    renderPhotoThumbnails();
  }

  function renderPhotoThumbnails() {
    if (!photoPreviewGrid) return;
    photoPreviewGrid.innerHTML = uploadedPhotos.map((photo, index) => `
      <div class="photo-thumb-card">
        <img src="${photo.src}" alt="Pratinjau Foto ${index + 1}">
        <button type="button" class="photo-delete-btn" data-index="${index}" title="Hapus foto" aria-label="Hapus foto ${index + 1}">
          ${ICONS.x}
        </button>
      </div>
    `).join('');

    // Attach event listener hapus foto
    photoPreviewGrid.querySelectorAll('.photo-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        uploadedPhotos.splice(idx, 1);
        renderPhotoThumbnails();
      });
    });
  }

  // F. LOGIKA MODAL QUICK PREVIEW
  if (btnQuickPreview) {
    btnQuickPreview.addEventListener('click', () => {
      generateQuickPreviewData();
      if (previewModal) previewModal.classList.add('active');
    });
  }

  function closeModal() {
    if (previewModal) previewModal.classList.remove('active');
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
  if (btnBackEdit) btnBackEdit.addEventListener('click', closeModal);

  // Close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && previewModal && previewModal.classList.contains('active')) {
      closeModal();
    }
  });

  function generateQuickPreviewData() {
    const guru = form.querySelector('#guruPiket').value || '-';
    const tanggal = form.querySelector('#tanggalPiket').value || '-';
    const p1 = form.querySelector('#petugas1').value || '-';
    const p2 = form.querySelector('#petugas2').value || '-';
    const p3 = form.querySelector('#petugas3').value || '-';
    const catatan = form.querySelector('#catatanEvaluasi').value || 'Tidak ada catatan khusus.';

    let trueTasks = [];
    let falseTasks = [];
    let answeredCount = 0;

    CHECKLIST_CATEGORIES.forEach(cat => {
      cat.items.forEach(task => {
        const selected = form.querySelector(`input[name="${task.id}"]:checked`);
        if (selected) {
          answeredCount++;
          if (selected.value === 'TRUE') {
            trueTasks.push(`${task.code} ${task.label}`);
          } else {
            falseTasks.push(`${task.code} ${task.label}`);
          }
        }
      });
    });

    const isHeaderValid = textInputs.every(id => {
      const field = form.querySelector(`#${id}`);
      return field && field.value.trim() !== '';
    });
    const isFullyValid = isHeaderValid && (answeredCount === 13);

    if (btnConfirmSave) {
      btnConfirmSave.disabled = !isFullyValid;
    }

    const score = Math.round((trueTasks.length / 13) * 100);

    modalPreviewBody.innerHTML = `
      ${!isFullyValid ? `
        <div class="validation-banner" style="background: #fff1f2; border-color: #fecdd3; color: #9f1239;">
          <span class="banner-icon" style="color: #e11d48;">${ICONS.alertTriangle}</span>
          <div><strong>Formulir Belum Lengkap:</strong> Lengkapi data petugas dan 13 poin checklist untuk mengaktifkan tombol konfirmasi simpan.</div>
        </div>
      ` : ''}

      <div class="modal-preview-grid">
        <div class="preview-stat-card">
          <span class="preview-stat-label">Guru Piket</span>
          <span class="preview-stat-value">${guru}</span>
        </div>
        <div class="preview-stat-card">
          <span class="preview-stat-label">Tanggal Pelaksanaan</span>
          <span class="preview-stat-value">${tanggal}</span>
        </div>
        <div class="preview-stat-card" style="grid-column: span 2;">
          <span class="preview-stat-label">Tim Petugas Piket</span>
          <span class="preview-stat-value">${p1}, ${p2}, ${p3}</span>
        </div>
      </div>

      <div class="modal-preview-grid">
        <div class="preview-stat-card">
          <span class="preview-stat-label">Kelengkapan</span>
          <span class="preview-stat-value">${answeredCount} / 13 Checklist</span>
        </div>
        <div class="preview-stat-card">
          <span class="preview-stat-label">Skor Kepatuhan</span>
          <span class="preview-stat-value" style="color: #065f46;">${score}%</span>
        </div>
        <div class="preview-stat-card">
          <span class="preview-stat-label">Tugas Dikerjakan (TRUE)</span>
          <span class="preview-stat-value" style="color: #15803d;">${trueTasks.length} Poin</span>
        </div>
        <div class="preview-stat-card">
          <span class="preview-stat-label">Tugas Terlewat (FALSE)</span>
          <span class="preview-stat-value" style="color: #be123c;">${falseTasks.length} Poin</span>
        </div>
      </div>

      ${falseTasks.length > 0 ? `
        <div class="preview-alert-list">
          <div class="preview-alert-title">Daftar Poin Berstatus FALSE (${falseTasks.length}):</div>
          <ul class="preview-alert-items">
            ${falseTasks.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      ` : (answeredCount === 13 ? `
        <div class="preview-success-callout">
          ${ICONS.checkCircle}
          <span>Seluruh 13 indikator tugas berstatus TRUE (Dikerjakan). Mutu kepatuhan 100%.</span>
        </div>
      ` : '')}

      <div class="form-field-group">
        <span class="field-label">Catatan & Evaluasi Lapangan</span>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.82rem; color: #334155; line-height: 1.5; white-space: pre-line;">
          ${catatan}
        </div>
      </div>

      <div class="form-field-group">
        <span class="field-label">Lampiran Foto Dokumentasi</span>
        <div style="font-size: 0.82rem; color: #64748b;">
          ${uploadedPhotos.length > 0 ? `${uploadedPhotos.length} foto terkompresi siap disimpan ke database.` : 'Tidak ada foto dokumentasi yang dilampirkan.'}
        </div>
      </div>
    `;
  }

  // G. SUBMIT FORM & SIMPAN KE INDEXEDDB VIA STORAGE.JS
  if (btnConfirmSave) {
    btnConfirmSave.addEventListener('click', executeSubmitForm);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    executeSubmitForm();
  });

  /**
   * Eksekusi Penyimpanan Laporan Lengkap ke Object Store 'dss_records' di IndexedDB
   */
  async function executeSubmitForm() {
    let answeredCount = 0;
    let trueCount = 0;
    let falseCount = 0;
    const checklistDetails = {};

    CHECKLIST_CATEGORIES.forEach(cat => {
      cat.items.forEach(task => {
        const selected = form.querySelector(`input[name="${task.id}"]:checked`);
        if (selected) {
          answeredCount++;
          checklistDetails[task.id] = selected.value;
          if (selected.value === 'TRUE') {
            trueCount++;
          } else {
            falseCount++;
          }
        }
      });
    });

    const isHeaderValid = textInputs.every(id => {
      const field = form.querySelector(`#${id}`);
      return field && field.value.trim() !== '';
    });

    if (!isHeaderValid || answeredCount < 13) {
      alert('Gagal menyimpan. Harap lengkapi seluruh field data petugas dan 13 poin checklist!');
      return;
    }

    closeModal();

    // Disable tombol submit selama transaksi penyimpanan
    if (btnSubmitForm) {
      btnSubmitForm.disabled = true;
      btnSubmitForm.innerHTML = `<span class="btn-icon">${ICONS.loader || ''}</span><span>Menyimpan ke Database...</span>`;
    }

    try {
      const scorePercent = Math.round((trueCount / 13) * 100);
      const photoBase64Array = uploadedPhotos.map(item => item.src);

      // Membangun Objek Data Laporan Utuh
      const reportData = {
        id: 'REP-' + Date.now(),
        guruPiket: form.querySelector('#guruPiket').value.trim(),
        tanggal: form.querySelector('#tanggalPiket').value.trim(),
        petugas: [
          form.querySelector('#petugas1').value.trim(),
          form.querySelector('#petugas2').value.trim(),
          form.querySelector('#petugas3').value.trim()
        ],
        checklist: checklistDetails,
        trueCount: trueCount,
        falseCount: falseCount,
        scorePercent: scorePercent,
        catatan: form.querySelector('#catatanEvaluasi').value.trim(),
        photos: photoBase64Array,
        photoCount: photoBase64Array.length,
        createdAt: new Date().toISOString()
      };

      // Simpan ke IndexedDB Object Store 'dss_records' via storage.js
      await saveItem('dss_records', reportData);

      alert('Laporan Kebersihan & Preservasi Lingkungan berhasil disimpan ke Database!');

      // Navigasi ke Tampilan Cek Data (data.js) via SPA Router
      const cekDataBtn = document.querySelector('.spa-nav-btn[data-view="data"]');
      if (cekDataBtn) {
        cekDataBtn.click();
      }
    } catch (error) {
      console.error('Error penyimpanan ke IndexedDB:', error);
      alert(`Gagal menyimpan laporan ke database: ${error.message}`);
    } finally {
      if (btnSubmitForm) {
        btnSubmitForm.disabled = false;
        btnSubmitForm.innerHTML = `<span class="btn-icon">${ICONS.save}</span><span>Simpan Laporan Data</span>`;
      }
    }
  }

  // Inisialisasi awal saat form dimuat
  updateComplianceEngine();
}
