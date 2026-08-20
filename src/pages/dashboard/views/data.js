/**
 * data.js - Modul Tabel Data Laporan & Detail View (Page 3)
 * Path: src/pages/dashboard/views/data.js
 *
 * Menyediakan tabel data laporan interaktif, pencarian real-time,
 * filter status compliance, ekspor data (Excel & PDF Massal/Single),
 * serta modal detail terperinci (Full Data View).
 * Terintegrasi secara asynchronous dengan Native IndexedDB via storage.js (Store: dss_records).
 */

import { getAllItems, deleteItem, seedMockData } from '../../../utils/storage.js';
import { generateExcelReport } from '../../../utils/createXLSX.js';
import { generatePDFReport } from '../../../utils/createPDF.js';

// Master Data Struktur 13 Poin Tugas Checklist untuk Referensi Detail Modal & Cetak PDF Single
const MASTER_CHECKLIST_ITEMS = [
  { code: '1.1', category: 'Kebersihan & Sanitasi', label: 'Menyikat dan membersihkan WC lantai 1 dan lantai 2 sekolah.' },
  { code: '1.2', category: 'Kebersihan & Sanitasi', label: 'Menyapu dan mengepel koridor lantai 1 dan lantai 2 sekolah.' },
  { code: '1.3', category: 'Kebersihan & Sanitasi', label: 'Mengecek dan membersihkan drainase di lingkungan sekolah.' },
  { code: '2.1', category: 'Pengelolaan Sampah', label: 'Membawa sampah ke bank sampah.' },
  { code: '2.2', category: 'Pengelolaan Sampah', label: 'Memilah sampah organik, unorganik, dan residu.' },
  { code: '2.3', category: 'Pengelolaan Sampah', label: 'Menimbang dan mencatat pada buku laporan jumlah sampah organik, unorganik, dan residu.' },
  { code: '2.4', category: 'Pengelolaan Sampah', label: 'Memasukkan sampah organik ke lubang biopori.' },
  { code: '3.1', category: 'Keanekaragaman Hayati', label: 'Berkebun di green house (mengolah lahan, menanam, merawat, memanen, atau memasarkan).' },
  { code: '3.2', category: 'Keanekaragaman Hayati', label: 'Beternak ikan (merawat, memanen, atau memasarkan).' },
  { code: '3.3', category: 'Keanekaragaman Hayati', label: 'Merawat tanaman pot siswi (mencabut gulma, menyiram, memanen, memasarkan, atau mengolah).' },
  { code: '4.1', category: 'Penghematan Energi', label: 'Melakukan pengecekan penggunaan kipas angin dan lampu penerangan di masjid (shof putra & putri). Mematikan kipas angin serta lampu penerangan jika tidak ada yang menggunakan dan melaporkan ke guru piket.' },
  { code: '5.1', category: 'Penghematan Air', label: 'Melakukan pengecekan keran air di toilet dan di tempat wudhu putra & putri. Melaporkan ke guru piket jika ada kebocoran/kerusakan ataupun jika ada keran air yang dibiarkan mengalir tanpa digunakan.' },
  { code: '5.2', category: 'Penghematan Air', label: 'Menyiram tanaman di green house menggunakan air tadah hujan di toren samping asrama.' }
];

// Helper Generator Ikon SVG Bebas Emoji (Standard UI/UX Pro Max)
const Icons = {
  database: (size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
  search: (size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  filter: (size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  fileSpreadsheet: (size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/></svg>`,
  filePdf: (size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12v6"/><path d="M10 15h3a1.5 1.5 0 0 0 0-3h-3"/></svg>`,
  printer: (size = 15) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>`,
  eye: (size = 15) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  trash: (size = 15) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
  image: (size = 14) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  check: (size = 14) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  cross: (size = 14) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  close: (size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  user: (size = 13) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  calendar: (size = 13) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  checkCircle: (size = 14) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  refresh: (size = 14) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
  documentText: (size = 14) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`
};

// Variable State Modul DataView
let activeReportsData = [];
let filteredReportsData = [];

/**
 * HELPER HITUNG SKOR & KATEGORI COMPLIANCE
 */
function calculateReportScore(report) {
  let trueCount = 0;
  const tasks = report.tasksStatus || {};

  Object.keys(tasks).forEach(key => {
    const val = tasks[key];
    const strVal = String(val).trim().toLowerCase();
    if (val === true || strVal === 'true' || val === 1 || strVal === '1') {
      trueCount++;
    }
  });

  const percentage = Math.round((trueCount / 13) * 100);
  let statusClass = 'badge-evaluasi';
  let statusText = 'Perlu Evaluasi';
  let filterCategory = 'PERLU_EVALUASI';

  if (percentage >= 90) {
    statusClass = 'badge-sangat-baik';
    statusText = 'Sangat Baik';
    filterCategory = 'SANGAT_BAIK';
  } else if (percentage >= 75) {
    statusClass = 'badge-baik';
    statusText = 'Baik';
    filterCategory = 'BAIK';
  }

  return { trueCount, percentage, statusClass, statusText, filterCategory };
}

/**
 * HELPER PENYIAPAN DATA EKSPOR MASSAL
 * Mengonversi struktur objek laporan yang kompleks menjadi format rata (flat) untuk tabel.
 */
function prepareExportData(reportsList) {
  return reportsList.map((report, idx) => {
    const { trueCount, percentage, statusText } = calculateReportScore(report);
    const listPetugas = Array.isArray(report.petugas) ? report.petugas.join(', ') : String(report.petugas || '-');

    return {
      no: idx + 1,
      id: report.id || '-',
      tanggal: report.tanggal || '-',
      guru_piket: report.guruPiket || '-',
      petugas: listPetugas,
      capaian: `${trueCount} / 13 Task`,
      compliance: `${percentage}% (${statusText})`,
      catatan: report.catatan || 'Tidak ada catatan.'
    };
  });
}

/**
 * HELPER NORMALISASI DATA
 * Memastikan toleransi penuh terhadap variasi nama properti (alias) serta format boolean ("TRUE", true, 1).
 */
function normalizeReportData(rawReport) {
  if (!rawReport || typeof rawReport !== 'object') return null;

  // 1. Normalisasi ID Laporan
  const id = rawReport.id || rawReport._id || rawReport.key || '#LAP-UNKNOWN';

  // 2. Normalisasi Guru Piket
  const guruPiket = rawReport.guruPiket || rawReport.guru_piket || rawReport.penanggungJawab || rawReport.guru || 'Tidak Diketahui';

  // 3. Normalisasi Tanggal Pelaksanaan
  const tanggal = rawReport.tanggal || rawReport.tanggal_piket || rawReport.date || (rawReport.createdAt ? rawReport.createdAt.split('T')[0] : '1970-01-01');

  // 4. Normalisasi Daftar Petugas (Array)
  let petugas = [];
  if (Array.isArray(rawReport.petugas)) {
    petugas = rawReport.petugas;
  } else if (Array.isArray(rawReport.tim_petugas)) {
    petugas = rawReport.tim_petugas;
  } else if (typeof rawReport.petugas === 'string') {
    petugas = rawReport.petugas.split(',').map(s => s.trim()).filter(Boolean);
  } else if (typeof rawReport.tim_petugas === 'string') {
    petugas = rawReport.tim_petugas.split(',').map(s => s.trim()).filter(Boolean);
  }

  // 5. Normalisasi Task Status (13 Poin Checklist)
  const rawTasks = rawReport.tasksStatus || rawReport.tasks || rawReport.checklist || rawReport.checklistData || {};
  const tasksStatus = {};

  const keyMapping = {
    '1.1': 'task_1_1', '1.2': 'task_1_2', '1.3': 'task_1_3',
    '2.1': 'task_2_1', '2.2': 'task_2_2', '2.3': 'task_2_3', '2.4': 'task_2_4',
    '3.1': 'task_3_1', '3.2': 'task_3_2', '3.3': 'task_3_3',
    '4.1': 'task_4_1',
    '5.1': 'task_5_1', '5.2': 'task_5_2'
  };

  Object.entries(keyMapping).forEach(([codeKey, taskKey]) => {
    const val = rawTasks[taskKey] !== undefined ? rawTasks[taskKey] : rawTasks[codeKey];
    const strVal = String(val).trim().toLowerCase();
    tasksStatus[taskKey] = (val === true || strVal === 'true' || val === 1 || strVal === '1');
  });

  // 6. Normalisasi Foto Lampiran
  let photos = [];
  if (Array.isArray(rawReport.photos)) {
    photos = rawReport.photos;
  } else if (Array.isArray(rawReport.foto)) {
    photos = rawReport.foto;
  } else if (Array.isArray(rawReport.images)) {
    photos = rawReport.images;
  } else if (typeof rawReport.photos === 'string' && rawReport.photos) {
    photos = [rawReport.photos];
  } else if (typeof rawReport.foto === 'string' && rawReport.foto) {
    photos = [rawReport.foto];
  }

  // 7. Normalisasi Catatan Evaluasi
  const catatan = rawReport.catatan || rawReport.catatanEvaluasi || rawReport.notes || rawReport.keterangan || 'Tidak ada catatan.';

  // 8. Normalisasi Waktu Pembuatan (createdAt)
  const createdAt = rawReport.createdAt || rawReport.created_at || (tanggal !== '1970-01-01' ? new Date(tanggal).toISOString() : new Date(0).toISOString());

  return {
    ...rawReport,
    id,
    guruPiket,
    tanggal,
    petugas,
    tasksStatus,
    photos,
    catatan,
    createdAt
  };
}

/**
 * Memuat Data dari IndexedDB (Store: dss_records) secara Asynchronous.
 */
async function loadInitialReportsData() {
  try {
    let items = await getAllItems('dss_records');
    if (!items || items.length === 0) {
      console.log('[data.js] Object Store dss_records di IndexedDB kosong. Mengisikan mock data awal...');
      await seedMockData([], true);
      items = await getAllItems('dss_records');
    }

    const normalizedItems = (items || []).map(item => normalizeReportData(item)).filter(Boolean);

    // Urutkan data terkini ke terlama (Descending)
    normalizedItems.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.tanggal).getTime();
      const timeB = new Date(b.createdAt || b.tanggal).getTime();
      return timeB - timeA;
    });

    activeReportsData = normalizedItems;
  } catch (error) {
    console.error('[data.js] Gagal mengambil data dari IndexedDB via storage.js:', error);
    activeReportsData = [];
  }
  filteredReportsData = [...activeReportsData];
}

/**
 * Fungsi Utama Render Modul DataView (Page 3)
 * @param {HTMLElement} container - Elemen pembungkus #spaCanvas
 */
export async function render(container) {
  await loadInitialReportsData();

  container.innerHTML = `
    <div class="data-page-wrapper">

      <!-- PAGE HEADER CARD -->
      <header class="data-header-card">
        <div class="header-title-group">
          <div class="header-icon-wrapper">
            ${Icons.database(24)}
          </div>
          <div>
            <h1 class="page-title">Pusat Data Laporan Kebersihan & Preservasi</h1>
            <p class="page-subtitle">Pemantauan, kontrol kualitas, filter kepatuhan, dan arsip data laporan harian Adiwiyata.</p>
          </div>
        </div>
        <div class="header-stat-badges">
          <div class="stat-pill">
            <span class="stat-indicator-dot"></span>
            <span class="stat-label">Total Arsip:</span>
            <strong id="statTotalCount" class="stat-value">0</strong>
            <span class="stat-unit">Laporan</span>
          </div>
        </div>
      </header>

      <!-- BILAH ALAT PEMROSESAN DATA -->
      <section class="toolbar-card" aria-label="Toolbar Pengolahan Data">
        <div class="toolbar-grid">

          <div class="toolbar-item search-box-wrapper">
            <label for="searchInput" class="toolbar-label">Pencarian Laporan</label>
            <div class="input-with-icon">
              <span class="input-icon-slot" aria-hidden="true">${Icons.search(16)}</span>
              <input type="text" id="searchInput" class="toolbar-input" placeholder="Cari Guru Piket, Nama Petugas, atau ID..." autocomplete="off">
              <button type="button" id="btnClearSearch" class="btn-clear-input" aria-label="Bersihkan pencarian" style="display: none;">
                ${Icons.close(14)}
              </button>
            </div>
          </div>

          <div class="toolbar-item filter-box-wrapper">
            <label for="complianceFilter" class="toolbar-label">Status Kepatuhan (Compliance)</label>
            <div class="select-with-icon">
              <span class="select-icon-slot" aria-hidden="true">${Icons.filter(15)}</span>
              <select id="complianceFilter" class="toolbar-select">
                <option value="ALL">Semua Tingkat Kepatuhan</option>
                <option value="SANGAT_BAIK">Sangat Baik (≥ 90%)</option>
                <option value="BAIK">Baik (75% - 89%)</option>
                <option value="PERLU_EVALUASI">Perlu Evaluasi (&lt; 75%)</option>
              </select>
            </div>
          </div>

          <div class="toolbar-item export-buttons-wrapper">
            <label class="toolbar-label">Ekspor Data Massal</label>
            <div class="export-btn-group">
              <button type="button" id="btnExportExcel" class="btn-export btn-excel" title="Ekspor seluruh data tersaring ke Excel (.xlsx)">
                ${Icons.fileSpreadsheet(16)}
                <span>Excel</span>
              </button>
              <button type="button" id="btnExportPDF" class="btn-export btn-pdf" title="Ekspor seluruh data tersaring ke PDF Dokumen Cetak">
                ${Icons.filePdf(16)}
                <span>PDF Rekap</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      <!-- TABEL UTAMA DATA LAPORAN -->
      <section class="table-card" aria-label="Tabel Data Laporan">
        <div class="table-meta-bar">
          <div class="table-meta-info" id="tableMetaInfo">
            Menampilkan data laporan Adiwiyata aktif
          </div>
        </div>

        <div class="table-responsive-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th scope="col" style="width: 140px;">ID Laporan</th>
                <th scope="col" style="min-width: 170px;">Tanggal & Guru</th>
                <th scope="col" style="min-width: 180px;">Tim Petugas</th>
                <th scope="col" class="text-center" style="width: 120px;">Capaian</th>
                <th scope="col" style="width: 150px;">Status Kepatuhan</th>
                <th scope="col" class="text-center" style="width: 110px;">Media</th>
                <th scope="col" style="min-width: 180px;">Catatan Lapangan</th>
                <th scope="col" class="text-center" style="width: 130px;">Aksi</th>
              </tr>
            </thead>
            <tbody id="reportsTableBody"></tbody>
          </table>
        </div>

        <div id="emptyStateBox" class="empty-state-box" style="display: none;">
          <div class="empty-icon-wrapper">
            ${Icons.search(36)}
          </div>
          <h3 class="empty-title">Data Laporan Tidak Ditemukan</h3>
          <p class="empty-desc">Tidak ada arsip yang cocok dengan kata kunci atau filter status yang dipilih.</p>
          <button type="button" id="btnResetFilterEmpty" class="btn btn-secondary btn-sm" style="margin-top: 0.75rem;">
            ${Icons.refresh(14)}
            <span>Reset Pencarian & Filter</span>
          </button>
        </div>
      </section>

      <!-- MODAL POP-UP DETAIL LAPORAN TERPERINCI -->
      <div id="fullDetailModal" class="modal-overlay" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="modalDetailTitle">
        <div class="modal-card modal-large">

          <div class="modal-header">
            <div class="modal-header-title">
              <div class="modal-icon-badge">
                ${Icons.documentText(18)}
              </div>
              <div>
                <h2 id="modalDetailTitle" class="modal-title">Detail Lengkap Laporan Kebersihan & Preservasi</h2>
                <span id="modalReportIdBadge" class="modal-id-badge">#LAP-00000000-00</span>
              </div>
            </div>
            <button type="button" id="btnCloseDetailModal" class="modal-close-btn" aria-label="Tutup jendela detail">
              ${Icons.close(18)}
            </button>
          </div>

          <div class="modal-body modal-scrollable" id="modalFullDetailBody"></div>

          <div class="modal-footer">
            <button type="button" id="btnCloseModalFooter" class="btn btn-secondary">Tutup</button>
            <button type="button" id="btnPrintModalPDF" class="btn btn-primary">
              ${Icons.printer(16)}
              <span>Cetak PDF Laporan</span>
            </button>
          </div>

        </div>
      </div>

      <!-- MODAL LIGHTBOX PHOTO -->
      <div id="photoLightboxModal" class="modal-overlay lightbox-overlay" aria-hidden="true" role="dialog" aria-modal="true">
        <div class="lightbox-content">
          <button type="button" id="btnCloseLightbox" class="lightbox-close-btn" aria-label="Tutup foto perbesaran">
            ${Icons.close(22)}
          </button>
          <img id="lightboxImage" src="" alt="Dokumentasi Visual Kegiatan Lingkungan Hidup">
        </div>
      </div>

    </div>

    <style>
      .data-page-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        width: 100%;
        padding-bottom: 3rem;
      }

      .data-header-card, .toolbar-card, .table-card {
        background-color: var(--color-surface, #ffffff);
        border: 1px solid var(--color-border, #e2e8f0);
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
      }

      /* HEADER CARD */
      .data-header-card {
        padding: 1.25rem 1.5rem;
        border-left: 4px solid var(--color-primary, #2C5E3B);
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      @media (min-width: 640px) {
        .data-header-card {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
      }

      .header-title-group {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .header-icon-wrapper {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background-color: #f0fdf4;
        color: var(--color-primary, #2C5E3B);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #bbf7d0;
        flex-shrink: 0;
      }

      .page-title {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 700;
        color: #1e293b;
        letter-spacing: -0.01em;
      }

      .page-subtitle {
        margin: 0.2rem 0 0 0;
        font-size: 0.82rem;
        color: #64748b;
        line-height: 1.4;
      }

      .stat-pill {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 0.45rem 0.85rem;
        border-radius: 20px;
        font-size: 0.82rem;
        color: #475569;
        display: inline-flex;
        gap: 0.4rem;
        align-items: center;
      }

      .stat-indicator-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #10b981;
      }

      .stat-value {
        color: #1e293b;
        font-weight: 700;
        font-family: var(--font-primary, inherit);
      }

      .stat-unit {
        color: #64748b;
      }

      /* TOOLBAR */
      .toolbar-card {
        padding: 1.25rem 1.5rem;
      }

      .toolbar-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      @media (min-width: 768px) {
        .toolbar-grid {
          grid-template-columns: 2fr 1.5fr 1.3fr;
          align-items: flex-end;
        }
      }

      .toolbar-label {
        display: block;
        font-size: 0.76rem;
        font-weight: 600;
        color: #475569;
        margin-bottom: 0.4rem;
        letter-spacing: 0.02em;
        text-transform: uppercase;
      }

      .input-with-icon, .select-with-icon {
        position: relative;
        display: flex;
        align-items: center;
      }

      .input-icon-slot, .select-icon-slot {
        position: absolute;
        left: 0.85rem;
        display: flex;
        align-items: center;
        color: #64748b;
        pointer-events: none;
      }

      .btn-clear-input {
        position: absolute;
        right: 0.75rem;
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
      }

      .btn-clear-input:hover {
        color: #475569;
        background-color: #f1f5f9;
      }

      .toolbar-input, .toolbar-select {
        width: 100%;
        padding: 0.65rem 0.85rem 0.65rem 2.4rem;
        font-size: 0.84rem;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        outline: none;
        background-color: #ffffff;
        color: #1e293b;
        font-family: inherit;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }

      .toolbar-input:focus, .toolbar-select:focus {
        border-color: var(--color-primary, #2C5E3B);
        box-shadow: 0 0 0 3px rgba(44, 94, 59, 0.12);
      }

      .export-btn-group {
        display: flex;
        gap: 0.5rem;
      }

      .btn-export {
        flex: 1;
        padding: 0.65rem 0.85rem;
        font-size: 0.82rem;
        font-weight: 600;
        border-radius: 8px;
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 0.15s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
      }

      .btn-excel {
        background-color: #f0fdf4;
        color: #166534;
        border-color: #bbf7d0;
      }
      .btn-excel:hover {
        background-color: #dcfce7;
        border-color: #86efac;
        transform: translateY(-1px);
      }

      .btn-pdf {
        background-color: #fef2f2;
        color: #991b1b;
        border-color: #fecaca;
      }
      .btn-pdf:hover {
        background-color: #fee2e2;
        border-color: #fca5a5;
        transform: translateY(-1px);
      }

      /* TABLE COMPONENT */
      .table-card {
        overflow: hidden;
      }

      .table-meta-bar {
        padding: 0.75rem 1.25rem;
        background-color: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .table-meta-info {
        font-size: 0.78rem;
        color: #64748b;
        font-weight: 500;
      }

      .table-responsive-wrapper {
        width: 100%;
        overflow-x: auto;
      }

      .data-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: 0.84rem;
      }

      .data-table th {
        background-color: #f8fafc;
        color: #475569;
        font-weight: 600;
        font-size: 0.76rem;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 0.85rem 1rem;
        border-bottom: 1px solid #e2e8f0;
        white-space: nowrap;
      }

      .data-table td {
        padding: 0.85rem 1rem;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
        color: #334155;
      }

      .data-table tbody tr {
        transition: background-color 0.15s ease;
      }

      .data-table tbody tr:hover {
        background-color: #f8fafc;
      }

      .text-center { text-align: center; }

      .id-code-badge {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-weight: 600;
        color: var(--color-primary, #2C5E3B);
        font-size: 0.78rem;
        background-color: #f0fdf4;
        border: 1px solid #dcfce7;
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        display: inline-block;
      }

      .date-text {
        font-weight: 600;
        color: #1e293b;
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }

      .date-text svg {
        color: #64748b;
      }

      .guru-text {
        font-size: 0.76rem;
        color: #64748b;
        display: flex;
        align-items: center;
        gap: 0.35rem;
        margin-top: 0.2rem;
      }

      .guru-text svg {
        color: #94a3b8;
      }

      .pills-container {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }

      .petugas-tag {
        font-size: 0.72rem;
        background-color: #f1f5f9;
        color: #334155;
        border: 1px solid #e2e8f0;
        padding: 0.15rem 0.5rem;
        border-radius: 6px;
        font-weight: 500;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
      }

      .petugas-tag svg {
        color: #64748b;
      }

      .task-ratio {
        font-weight: 600;
        color: #334155;
        font-size: 0.8rem;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        display: inline-block;
      }

      /* COMPLIANCE STATUS BADGES */
      .status-badge {
        font-size: 0.74rem;
        font-weight: 600;
        padding: 0.25rem 0.6rem;
        border-radius: 20px;
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        white-space: nowrap;
        border: 1px solid transparent;
      }

      .status-badge-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }

      .badge-sangat-baik {
        background-color: #ecfdf5;
        color: #065f46;
        border-color: #a7f3d0;
      }
      .badge-sangat-baik .status-badge-dot {
        background-color: #10b981;
      }

      .badge-baik {
        background-color: #f0fdf4;
        color: #166534;
        border-color: #bbf7d0;
      }
      .badge-baik .status-badge-dot {
        background-color: #22c55e;
      }

      .badge-evaluasi {
        background-color: #fef2f2;
        color: #991b1b;
        border-color: #fecaca;
      }
      .badge-evaluasi .status-badge-dot {
        background-color: #ef4444;
      }

      .media-indicator {
        font-size: 0.74rem;
        font-weight: 500;
        color: #475569;
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }

      .media-indicator svg {
        color: #64748b;
      }

      .ellipsis-text {
        max-width: 220px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 0.8rem;
        color: #64748b;
      }

      /* ACTION BUTTONS */
      .action-btn-group {
        display: flex;
        gap: 0.4rem;
        justify-content: center;
      }

      .btn-action {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: 1px solid #cbd5e1;
        background-color: #ffffff;
        color: #475569;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
      }

      .btn-action-view:hover {
        background-color: #f0fdf4;
        border-color: #86efac;
        color: var(--color-primary, #2C5E3B);
        transform: translateY(-1px);
      }

      .btn-action-print:hover {
        background-color: #eff6ff;
        border-color: #93c5fd;
        color: #1d4ed8;
        transform: translateY(-1px);
      }

      .btn-action-delete:hover {
        background-color: #fef2f2;
        border-color: #fca5a5;
        color: #dc2626;
        transform: translateY(-1px);
      }

      /* EMPTY STATE */
      .empty-state-box {
        padding: 3.5rem 1rem;
        text-align: center;
      }

      .empty-icon-wrapper {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background-color: #f1f5f9;
        color: #94a3b8;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0.75rem;
      }

      .empty-title {
        font-size: 1rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
      }

      .empty-desc {
        font-size: 0.82rem;
        color: #64748b;
        margin: 0.35rem 0 0 0;
      }

      /* MODAL DIALOG */
      .modal-overlay {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        z-index: 200;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem 1rem;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .modal-overlay.active {
        opacity: 1;
        visibility: visible;
      }

      .modal-card {
        background-color: #ffffff;
        border-radius: 14px;
        width: 100%;
        max-width: 860px;
        height: 88vh;
        max-height: 88vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05);
        overflow: hidden;
        border: 1px solid #e2e8f0;
      }

      .modal-header {
        padding: 1.1rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #f8fafc;
        flex-shrink: 0;
      }

      .modal-header-title {
        display: flex;
        align-items: center;
        gap: 0.85rem;
      }

      .modal-icon-badge {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background-color: #f0fdf4;
        color: var(--color-primary, #2C5E3B);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #bbf7d0;
      }

      .modal-title {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
        color: #1e293b;
      }

      .modal-id-badge {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.74rem;
        font-weight: 600;
        background-color: #e2e8f0;
        color: #334155;
        padding: 0.15rem 0.45rem;
        border-radius: 4px;
        display: inline-block;
        margin-top: 0.2rem;
      }

      .modal-close-btn {
        background: none;
        border: none;
        color: #64748b;
        cursor: pointer;
        padding: 6px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.15s ease, color 0.15s ease;
      }

      .modal-close-btn:hover {
        background-color: #e2e8f0;
        color: #1e293b;
      }

      .modal-scrollable {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        flex: 1 1 0px;
        min-height: 0;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
      }

      /* Custom Smooth Scrollbar for Data-Dense Modal */
      .modal-scrollable::-webkit-scrollbar {
        width: 8px;
      }

      .modal-scrollable::-webkit-scrollbar-track {
        background: #f8fafc;
        border-radius: 4px;
      }

      .modal-scrollable::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
      }

      .modal-scrollable::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }

      .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        background-color: #f8fafc;
        flex-shrink: 0;
      }

      /* DETAIL CARDS */
      .detail-section-card {
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
        background-color: #ffffff;
        flex-shrink: 0;
        width: 100%;
      }

      .section-card-header {
        background-color: #f8fafc;
        padding: 0.75rem 1rem;
        font-weight: 600;
        font-size: 0.82rem;
        color: #334155;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        gap: 0.45rem;
      }

      .section-card-body {
        padding: 1rem;
      }

      .identity-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      @media (min-width: 640px) {
        .identity-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      .info-item-label {
        font-size: 0.74rem;
        color: #64748b;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.02em;
        display: block;
      }

      .info-item-value {
        font-size: 0.88rem;
        font-weight: 600;
        color: #1e293b;
        margin-top: 0.25rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .uncut-matrix-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.82rem;
      }

      .uncut-matrix-table th {
        background-color: #f8fafc;
        padding: 0.65rem 0.85rem;
        text-align: left;
        border-bottom: 1px solid #e2e8f0;
        color: #475569;
        font-weight: 600;
        font-size: 0.76rem;
      }

      .uncut-matrix-table td {
        padding: 0.65rem 0.85rem;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }

      .badge-task-status {
        font-size: 0.72rem;
        font-weight: 600;
        padding: 0.2rem 0.55rem;
        border-radius: 6px;
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
      }

      .badge-task-true {
        background-color: #ecfdf5;
        color: #065f46;
        border: 1px solid #a7f3d0;
      }

      .badge-task-false {
        background-color: #fef2f2;
        color: #991b1b;
        border: 1px solid #fecaca;
      }

      .gallery-photo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
        gap: 0.75rem;
      }

      .gallery-photo-item {
        position: relative;
        width: 100%;
        height: 110px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #e2e8f0;
        cursor: pointer;
        transition: transform 0.15s ease, box-shadow 0.15s ease;
        background-color: #f1f5f9;
      }

      .gallery-photo-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }

      .gallery-photo-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .full-narrative-box {
        background-color: #f8fafc;
        border-left: 3px solid var(--color-primary, #2C5E3B);
        padding: 0.85rem 1rem;
        border-radius: 0 6px 6px 0;
      }

      .full-narrative-text {
        font-size: 0.84rem;
        line-height: 1.6;
        color: #334155;
        white-space: pre-line;
        margin: 0;
      }

      /* LIGHTBOX */
      .lightbox-overlay {
        z-index: 300;
        background-color: rgba(0, 0, 0, 0.85);
      }

      .lightbox-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
      }

      .lightbox-content img {
        max-width: 100%;
        max-height: 85vh;
        border-radius: 8px;
        object-fit: contain;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      }

      .lightbox-close-btn {
        position: absolute;
        top: -40px;
        right: 0;
        background: none;
        border: none;
        color: #ffffff;
        cursor: pointer;
        padding: 4px;
      }

      .btn {
        padding: 0.6rem 1.15rem;
        font-size: 0.84rem;
        font-weight: 600;
        border-radius: 8px;
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 0.15s ease;
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
      }

      .btn-sm {
        padding: 0.45rem 0.85rem;
        font-size: 0.78rem;
      }

      .btn-primary {
        background-color: var(--color-primary, #2C5E3B);
        color: #ffffff;
      }

      .btn-primary:hover {
        background-color: var(--color-primary-hover, #224a2e);
        transform: translateY(-1px);
      }

      .btn-secondary {
        background-color: #ffffff;
        border-color: #cbd5e1;
        color: #334155;
      }

      .btn-secondary:hover {
        background-color: #f1f5f9;
        border-color: #94a3b8;
      }
    </style>
  `;

  initDataPageLogic(container);
}

/**
 * Inisialisasi Event Listener & Logika Integrasi Ekspor Modul
 * @param {HTMLElement} container
 */
function initDataPageLogic(container) {
  const searchInput = container.querySelector('#searchInput');
  const btnClearSearch = container.querySelector('#btnClearSearch');
  const complianceFilter = container.querySelector('#complianceFilter');
  const btnExportExcel = container.querySelector('#btnExportExcel');
  const btnExportPDF = container.querySelector('#btnExportPDF');
  const reportsTableBody = container.querySelector('#reportsTableBody');
  const emptyStateBox = container.querySelector('#emptyStateBox');
  const statTotalCount = container.querySelector('#statTotalCount');
  const tableMetaInfo = container.querySelector('#tableMetaInfo');
  const btnResetFilterEmpty = container.querySelector('#btnResetFilterEmpty');

  // Modal Elements
  const fullDetailModal = container.querySelector('#fullDetailModal');
  const btnCloseDetailModal = container.querySelector('#btnCloseDetailModal');
  const btnCloseModalFooter = container.querySelector('#btnCloseModalFooter');
  const btnPrintModalPDF = container.querySelector('#btnPrintModalPDF');
  const modalReportIdBadge = container.querySelector('#modalReportIdBadge');
  const modalFullDetailBody = container.querySelector('#modalFullDetailBody');

  // Lightbox Elements
  const photoLightboxModal = container.querySelector('#photoLightboxModal');
  const lightboxImage = container.querySelector('#lightboxImage');
  const btnCloseLightbox = container.querySelector('#btnCloseLightbox');

  // =========================================================================
  // 1. INTEGRASI EKSPOR EXCEL MASSAL (.XLSX)
  // =========================================================================
  if (btnExportExcel) {
    btnExportExcel.addEventListener('click', async () => {
      if (!filteredReportsData || filteredReportsData.length === 0) {
        alert('Tidak ada data laporan yang tersedia untuk diekspor.');
        return;
      }

      try {
        btnExportExcel.disabled = true;
        btnExportExcel.innerHTML = `<span>Memproses...</span>`;

        const exportRows = prepareExportData(filteredReportsData);

        await generateExcelReport({
          sheetName: 'Laporan Kebersihan PLH',
          columns: [
            { header: 'No', key: 'no', width: 8 },
            { header: 'ID Laporan', key: 'id', width: 18 },
            { header: 'Tanggal', key: 'tanggal', width: 15 },
            { header: 'Guru Piket', key: 'guru_piket', width: 22 },
            { header: 'Tim Petugas', key: 'petugas', width: 30 },
            { header: 'Capaian Task', key: 'capaian', width: 15 },
            { header: 'Skor Compliance', key: 'compliance', width: 22 },
            { header: 'Catatan Evaluasi', key: 'catatan', width: 45 }
          ],
          data: exportRows,
          fileName: `Laporan_PLH_Massal_${new Date().toISOString().split('T')[0]}.xlsx`
        });

      } catch (err) {
        alert(`Gagal mengekspor Excel: ${err.message}`);
      } finally {
        btnExportExcel.disabled = false;
        btnExportExcel.innerHTML = `${Icons.fileSpreadsheet(16)}<span>Excel</span>`;
      }
    });
  }

  // =========================================================================
  // 2. INTEGRASI EKSPOR PDF MASSAL (.PDF LANDSCAPE)
  // =========================================================================
  if (btnExportPDF) {
    btnExportPDF.addEventListener('click', async () => {
      if (!filteredReportsData || filteredReportsData.length === 0) {
        alert('Tidak ada data laporan yang tersedia untuk diekspor.');
        return;
      }

      try {
        btnExportPDF.disabled = true;
        btnExportPDF.innerHTML = `<span>Memproses...</span>`;

        const exportRows = prepareExportData(filteredReportsData);

        await generatePDFReport({
          title: 'LAPORAN EVALUASI KEBERSIHAN & PRESERVASI LINGKUNGAN',
          subtitle: 'Rekapitulasi Data Pelaksanaan Piket Adiwiyata (PLH-Intelligence)',
          orientation: 'landscape',
          headers: [
            { header: 'No', dataKey: 'no', width: 10 },
            { header: 'ID Laporan', dataKey: 'id', width: 30 },
            { header: 'Tanggal', dataKey: 'tanggal', width: 22 },
            { header: 'Guru Piket', dataKey: 'guru_piket', width: 35 },
            { header: 'Tim Petugas', dataKey: 'petugas', width: 45 },
            { header: 'Capaian', dataKey: 'capaian', width: 20 },
            { header: 'Compliance', dataKey: 'compliance', width: 32 },
            { header: 'Catatan Evaluasi', dataKey: 'catatan', width: 75 }
          ],
          data: exportRows,
          fileName: `Laporan_PLH_Massal_${new Date().toISOString().split('T')[0]}.pdf`
        });

      } catch (err) {
        alert(`Gagal mengekspor PDF Massal: ${err.message}`);
      } finally {
        btnExportPDF.disabled = false;
        btnExportPDF.innerHTML = `${Icons.filePdf(16)}<span>PDF Rekap</span>`;
      }
    });
  }

  // =========================================================================
  // 3. INTEGRASI CETAK PDF PER-LAPORAN (SINGLE REPORT PDF)
  // =========================================================================
  async function exportSingleReportPDF(reportId) {
    const report = activeReportsData.find(r => r.id === reportId);
    if (!report) {
      alert('Data laporan tidak ditemukan.');
      return;
    }

    try {
      const { trueCount, percentage, statusText } = calculateReportScore(report);
      const listPetugas = Array.isArray(report.petugas) ? report.petugas.join(', ') : String(report.petugas || '-');

      const keyMap = {
        '1.1': 'task_1_1', '1.2': 'task_1_2', '1.3': 'task_1_3',
        '2.1': 'task_2_1', '2.2': 'task_2_2', '2.3': 'task_2_3', '2.4': 'task_2_4',
        '3.1': 'task_3_1', '3.2': 'task_3_2', '3.3': 'task_3_3',
        '4.1': 'task_4_1',
        '5.1': 'task_5_1', '5.2': 'task_5_2'
      };

      const taskTableRows = MASTER_CHECKLIST_ITEMS.map(item => {
        const taskKey = keyMap[item.code];
        const val = report.tasksStatus[taskKey] !== undefined ? report.tasksStatus[taskKey] : report.tasksStatus[item.code];
        const strVal = String(val).trim().toLowerCase();
        const isDone = (val === true || strVal === 'true' || val === 1 || strVal === '1');

        return {
          code: item.code,
          category: item.category,
          label: item.label,
          status: isDone ? 'DIKERJAKAN' : 'TIDAK DIKERJAKAN'
        };
      });

      await generatePDFReport({
        title: `DOKUMEN EVALUASI LAPORAN ${report.id}`,
        subtitle: `Guru Piket: ${report.guruPiket} | Tanggal: ${report.tanggal} | Petugas: ${listPetugas} | Skor: ${percentage}% (${statusText})`,
        orientation: 'portrait',
        headers: [
          { header: 'No', dataKey: 'code', width: 15 },
          { header: 'Kategori Indikator', dataKey: 'category', width: 45 },
          { header: 'Deskripsi Detail Indikator Tugas', dataKey: 'label', width: 90 },
          { header: 'Status Task', dataKey: 'status', width: 32 }
        ],
        data: taskTableRows,
        fileName: `Detail_${report.id.replace('#', '')}.pdf`
      });

    } catch (err) {
      alert(`Gagal mencetak PDF Laporan: ${err.message}`);
    }
  }

  // Listener Tombol Cetak PDF pada Modal
  if (btnPrintModalPDF) {
    btnPrintModalPDF.addEventListener('click', () => {
      const reportId = modalReportIdBadge ? modalReportIdBadge.textContent : null;
      if (reportId) {
        exportSingleReportPDF(reportId);
      }
    });
  }

  // =========================================================================
  // 4. RENDER TABEL & ACTION LISTENERS
  // =========================================================================
  function renderTableRows() {
    if (!reportsTableBody) return;

    if (filteredReportsData.length === 0) {
      reportsTableBody.innerHTML = '';
      if (emptyStateBox) emptyStateBox.style.display = 'block';
      if (statTotalCount) statTotalCount.textContent = '0';
      if (tableMetaInfo) tableMetaInfo.textContent = 'Tidak ada data laporan ditemukan';
      return;
    }

    if (emptyStateBox) emptyStateBox.style.display = 'none';
    if (statTotalCount) statTotalCount.textContent = filteredReportsData.length;
    if (tableMetaInfo) tableMetaInfo.textContent = `Menampilkan ${filteredReportsData.length} laporan Adiwiyata`;

    reportsTableBody.innerHTML = filteredReportsData.map((report) => {
      const { trueCount, percentage, statusClass, statusText } = calculateReportScore(report);
      const photoCount = report.photos ? report.photos.length : (report.photoCount || 0);

      return `
        <tr>
          <td>
            <span class="id-code-badge">${report.id}</span>
          </td>

          <td>
            <div class="date-text">
              ${Icons.calendar(13)}
              <span>${report.tanggal}</span>
            </div>
            <div class="guru-text">
              ${Icons.user(12)}
              <span>${report.guruPiket}</span>
            </div>
          </td>

          <td>
            <div class="pills-container">
              ${(report.petugas || []).map(p => `
                <span class="petugas-tag">
                  ${Icons.user(11)}
                  <span>${p}</span>
                </span>
              `).join('')}
            </div>
          </td>

          <td class="text-center">
            <span class="task-ratio">${trueCount} / 13</span>
          </td>

          <td>
            <span class="status-badge ${statusClass}">
              <span class="status-badge-dot"></span>
              <span>${percentage}% · ${statusText}</span>
            </span>
          </td>

          <td class="text-center">
            <span class="media-indicator">
              ${Icons.image(13)}
              <span>${photoCount}</span>
            </span>
          </td>

          <td>
            <div class="ellipsis-text" title="${report.catatan || '-'}">
              ${report.catatan || 'Tidak ada catatan.'}
            </div>
          </td>

          <td class="text-center">
            <div class="action-btn-group">
              <button type="button" class="btn-action btn-action-view" data-id="${report.id}" title="Lihat Detail Lengkap" aria-label="Lihat Detail ${report.id}">
                ${Icons.eye(15)}
              </button>
              <button type="button" class="btn-action btn-action-print" data-id="${report.id}" title="Cetak Dokumen PDF" aria-label="Cetak PDF ${report.id}">
                ${Icons.printer(15)}
              </button>
              <button type="button" class="btn-action btn-action-delete" data-id="${report.id}" title="Hapus Laporan" aria-label="Hapus Laporan ${report.id}">
                ${Icons.trash(15)}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    attachTableActionEvents();
  }

  function applySearchAndFilter() {
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const filterVal = complianceFilter ? complianceFilter.value : 'ALL';

    if (btnClearSearch) {
      btnClearSearch.style.display = query.length > 0 ? 'flex' : 'none';
    }

    filteredReportsData = activeReportsData.filter(report => {
      const guruMatch = (report.guruPiket || '').toLowerCase().includes(query);
      const petugasMatch = Array.isArray(report.petugas)
        ? report.petugas.some(p => String(p).toLowerCase().includes(query))
        : String(report.petugas || '').toLowerCase().includes(query);
      const idMatch = (report.id || '').toLowerCase().includes(query);
      const matchesSearch = guruMatch || petugasMatch || idMatch;

      const { filterCategory } = calculateReportScore(report);
      const matchesFilter = (filterVal === 'ALL') || (filterCategory === filterVal);

      return matchesSearch && matchesFilter;
    });

    renderTableRows();
  }

  if (searchInput) searchInput.addEventListener('input', applySearchAndFilter);
  if (complianceFilter) complianceFilter.addEventListener('change', applySearchAndFilter);

  if (btnClearSearch) {
    btnClearSearch.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      applySearchAndFilter();
    });
  }

  if (btnResetFilterEmpty) {
    btnResetFilterEmpty.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (complianceFilter) complianceFilter.value = 'ALL';
      applySearchAndFilter();
    });
  }

  function attachTableActionEvents() {
    container.querySelectorAll('.btn-action-view').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openFullDetailModal(id);
      });
    });

    container.querySelectorAll('.btn-action-print').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        exportSingleReportPDF(id);
      });
    });

    container.querySelectorAll('.btn-action-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (confirm(`Apakah Anda yakin ingin menghapus laporan ${id} dari database IndexedDB? Data yang dihapus tidak dapat dikembalikan.`)) {
          await deleteReportItem(id);
        }
      });
    });
  }

  async function deleteReportItem(id) {
    try {
      await deleteItem('dss_records', id);
      activeReportsData = activeReportsData.filter(r => r.id !== id);
      applySearchAndFilter();
      console.log(`[data.js] Berhasil menghapus laporan ${id} dari IndexedDB.`);
    } catch (error) {
      console.error(`[data.js] Gagal menghapus laporan ${id} dari IndexedDB:`, error);
      alert(`Gagal menghapus laporan dari database: ${error.message}`);
    }
  }

  // =========================================================================
  // 5. MODAL DETAIL FULL DATA
  // =========================================================================
  function openFullDetailModal(reportId) {
    const report = activeReportsData.find(r => r.id === reportId);
    if (!report) return;

    const { trueCount, percentage, statusClass, statusText } = calculateReportScore(report);

    if (modalReportIdBadge) modalReportIdBadge.textContent = report.id;

    modalFullDetailBody.innerHTML = `
      <section class="detail-section-card">
        <div class="section-card-header">
          ${Icons.checkCircle(15)}
          <span>Identitas Pelaksanaan & Metrik Kepatuhan</span>
        </div>
        <div class="section-card-body">
          <div class="identity-grid">
            <div>
              <span class="info-item-label">Guru Piket Penanggung Jawab</span>
              <div class="info-item-value">
                ${Icons.user(14)}
                <span>${report.guruPiket}</span>
              </div>
            </div>
            <div>
              <span class="info-item-label">Tanggal Pelaksanaan</span>
              <div class="info-item-value">
                ${Icons.calendar(14)}
                <span>${report.tanggal}</span>
              </div>
            </div>
            <div>
              <span class="info-item-label">Skor Kepatuhan Akhir</span>
              <div class="info-item-value" style="margin-top: 0.35rem;">
                <span class="status-badge ${statusClass}">
                  <span class="status-badge-dot"></span>
                  <span>${percentage}% · ${statusText}</span>
                </span>
              </div>
            </div>
            <div style="grid-column: 1 / -1;">
              <span class="info-item-label">Tim Petugas Harian</span>
              <div class="info-item-value" style="display: flex; gap: 0.4rem; margin-top: 0.35rem; flex-wrap: wrap;">
                ${(report.petugas || []).map(p => `
                  <span class="petugas-tag">
                    ${Icons.user(12)}
                    <span>${p}</span>
                  </span>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="detail-section-card">
        <div class="section-card-header">
          ${Icons.documentText(15)}
          <span>Matriks 13 Poin Indikator Adiwiyata (${trueCount} / 13 Terpenuhi)</span>
        </div>
        <div class="section-card-body" style="padding: 0;">
          <table class="uncut-matrix-table">
            <thead>
              <tr>
                <th style="width: 50px;">Kode</th>
                <th style="width: 170px;">Kategori Indikator</th>
                <th>Deskripsi Tugas Pelaksanaan</th>
                <th style="width: 150px;" class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${renderUncutTaskMatrix(report.tasksStatus)}
            </tbody>
          </table>
        </div>
      </section>

      <section class="detail-section-card">
        <div class="section-card-header">
          ${Icons.image(15)}
          <span>Dokumentasi Lapangan (${report.photos ? report.photos.length : 0} Foto)</span>
        </div>
        <div class="section-card-body">
          ${report.photos && report.photos.length > 0 ? `
            <div class="gallery-photo-grid">
              ${report.photos.map((photoUrl, idx) => `
                <div class="gallery-photo-item" data-src="${photoUrl}" title="Klik untuk memperbesar foto ${idx + 1}">
                  <img src="${photoUrl}" alt="Dokumentasi ${idx + 1}" loading="lazy">
                </div>
              `).join('')}
            </div>
          ` : `
            <p style="font-size: 0.82rem; color: #94a3b8; margin: 0; font-style: italic;">Tidak ada foto dokumentasi pada laporan ini.</p>
          `}
        </div>
      </section>

      <section class="detail-section-card">
        <div class="section-card-header">
          ${Icons.documentText(15)}
          <span>Catatan & Rekomendasi Evaluasi</span>
        </div>
        <div class="section-card-body">
          <div class="full-narrative-box">
            <p class="full-narrative-text">${report.catatan || 'Tidak ada catatan narasi khusus yang dicantumkan.'}</p>
          </div>
        </div>
      </section>
    `;

    modalFullDetailBody.querySelectorAll('.gallery-photo-item').forEach(item => {
      item.addEventListener('click', () => {
        const src = item.getAttribute('data-src');
        if (lightboxImage) lightboxImage.src = src;
        if (photoLightboxModal) photoLightboxModal.classList.add('active');
      });
    });

    if (fullDetailModal) {
      fullDetailModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function renderUncutTaskMatrix(tasksStatus = {}) {
    const keyMap = {
      '1.1': 'task_1_1', '1.2': 'task_1_2', '1.3': 'task_1_3',
      '2.1': 'task_2_1', '2.2': 'task_2_2', '2.3': 'task_2_3', '2.4': 'task_2_4',
      '3.1': 'task_3_1', '3.2': 'task_3_2', '3.3': 'task_3_3',
      '4.1': 'task_4_1',
      '5.1': 'task_5_1', '5.2': 'task_5_2'
    };

    return MASTER_CHECKLIST_ITEMS.map((item) => {
      const taskKey = keyMap[item.code];
      const val = tasksStatus[taskKey] !== undefined ? tasksStatus[taskKey] : tasksStatus[item.code];

      const strVal = String(val).trim().toLowerCase();
      const isDone = (val === true || strVal === 'true' || val === 1 || strVal === '1');

      return `
        <tr>
          <td><span class="id-code-badge" style="font-size: 0.72rem;">${item.code}</span></td>
          <td style="color: #64748b; font-weight: 500;">${item.category}</td>
          <td style="color: #334155; line-height: 1.45;">${item.label}</td>
          <td class="text-center">
            ${isDone ? `
              <span class="badge-task-status badge-task-true">
                ${Icons.check(12)}
                <span>Dikerjakan</span>
              </span>
            ` : `
              <span class="badge-task-status badge-task-false">
                ${Icons.cross(12)}
                <span>Tidak Dikerjakan</span>
              </span>
            `}
          </td>
        </tr>
      `;
    }).join('');
  }

  function closeDetailModal() {
    if (fullDetailModal) {
      fullDetailModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (btnCloseDetailModal) btnCloseDetailModal.addEventListener('click', closeDetailModal);
  if (btnCloseModalFooter) btnCloseModalFooter.addEventListener('click', closeDetailModal);

  if (btnCloseLightbox) {
    btnCloseLightbox.addEventListener('click', () => {
      if (photoLightboxModal) photoLightboxModal.classList.remove('active');
    });
  }

  // Keyboard Navigation: Escape to close modals
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (photoLightboxModal && photoLightboxModal.classList.contains('active')) {
        photoLightboxModal.classList.remove('active');
      } else if (fullDetailModal && fullDetailModal.classList.contains('active')) {
        closeDetailModal();
      }
    }
  });

  renderTableRows();
}
