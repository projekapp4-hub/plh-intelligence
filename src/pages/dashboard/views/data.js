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

  // 5. Normalisasi Task Status (13 Poin Checklist) - Mendukung `checklist`, `tasksStatus`, dll.
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
    // Evaluasi toleran terhadap boolean, "TRUE", "true", 1, "1"
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
          <div class="header-icon">📊</div>
          <div>
            <h1 class="page-title">Pusat Data Laporan Kebersihan & Preservasi</h1>
            <p class="page-subtitle">Pemantauan, kontrol kualitas, filter kepatuhan, dan arsip data laporan harian Adiwiyata.</p>
          </div>
        </div>
        <div class="header-stat-badges">
          <div class="stat-pill">
            <span class="stat-label">Total Laporan:</span>
            <strong id="statTotalCount" class="stat-value">0</strong>
          </div>
        </div>
      </header>

      <!-- BILAH ALAT PEMROSESAN DATA -->
      <section class="toolbar-card">
        <div class="toolbar-grid">
          
          <div class="toolbar-item search-box-wrapper">
            <label for="searchInput" class="toolbar-label">🔍 Cari Laporan</label>
            <div class="input-with-icon">
              <span class="search-icon">🔍</span>
              <input type="text" id="searchInput" class="toolbar-input" placeholder="Cari Guru Piket, Petugas, ID Laporan...">
            </div>
          </div>

          <div class="toolbar-item filter-box-wrapper">
            <label for="complianceFilter" class="toolbar-label">🎯 Filter Status Compliance</label>
            <select id="complianceFilter" class="toolbar-select">
              <option value="ALL">Semua Status Kepatuhan</option>
              <option value="SANGAT_BAIK">Sangat Baik (≥ 90%)</option>
              <option value="BAIK">Baik (75% - 89%)</option>
              <option value="PERLU_EVALUASI">Perlu Evaluasi (< 75%)</option>
            </select>
          </div>

          <div class="toolbar-item export-buttons-wrapper">
            <label class="toolbar-label">📥 Ekspor Data Massal</label>
            <div class="export-btn-group">
              <button type="button" id="btnExportExcel" class="btn-export btn-excel">
                📊 Export Excel
              </button>
              <button type="button" id="btnExportPDF" class="btn-export btn-pdf">
                📄 Export PDF
              </button>
            </div>
          </div>

        </div>
      </section>

      <!-- TABEL UTAMA DATA LAPORAN -->
      <section class="table-card">
        <div class="table-responsive-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID Laporan</th>
                <th>Tanggal & Guru Piket</th>
                <th>Tim Petugas</th>
                <th class="text-center">Capaian Poin</th>
                <th>Skor Compliance</th>
                <th class="text-center">Media</th>
                <th>Catatan Evaluasi</th>
                <th class="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody id="reportsTableBody"></tbody>
          </table>
        </div>

        <div id="emptyStateBox" class="empty-state-box" style="display: none;">
          <div class="empty-icon">📂</div>
          <h3 class="empty-title">Data Laporan Tidak Ditemukan</h3>
          <p class="empty-desc">Tidak ada laporan yang cocok dengan kata kunci pencarian atau filter status yang Anda pilih.</p>
        </div>
      </section>

      <!-- MODAL POP-UP DETAIL LAPORAN TERPERINCI -->
      <div id="fullDetailModal" class="modal-overlay" aria-hidden="true">
        <div class="modal-card modal-large">
          
          <div class="modal-header">
            <div class="modal-header-title">
              <h2 class="modal-title">Detail Full Laporan Kebersihan & Preservasi</h2>
              <span id="modalReportIdBadge" class="modal-id-badge">#LAP-00000000-00</span>
            </div>
            <button type="button" id="btnCloseDetailModal" class="modal-close-btn" title="Tutup Modal">✕</button>
          </div>

          <div class="modal-body modal-scrollable" id="modalFullDetailBody"></div>

          <div class="modal-footer">
            <button type="button" id="btnCloseModalFooter" class="btn btn-secondary">Tutup Modal</button>
            <button type="button" id="btnPrintModalPDF" class="btn btn-primary">
              🖨️ Cetak Dokumen PDF
            </button>
          </div>

        </div>
      </div>

      <!-- MODAL LIGHTBOX PHOTO -->
      <div id="photoLightboxModal" class="modal-overlay lightbox-overlay" aria-hidden="true">
        <div class="lightbox-content">
          <button type="button" id="btnCloseLightbox" class="lightbox-close-btn">✕</button>
          <img id="lightboxImage" src="" alt="Foto Pembesaran Dokumentasi Lapangan">
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
        background-color: #ffffff;
        border: 1px solid var(--color-border, #e2e8f0);
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
      }

      .data-header-card {
        padding: 1.25rem;
        border-top: 4px solid var(--color-primary, #1b4332);
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

      .header-title-group { display: flex; align-items: center; gap: 1rem; }
      .header-icon { font-size: 2.2rem; }
      .page-title { margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--color-primary, #1b4332); }
      .page-subtitle { margin: 0.2rem 0 0 0; font-size: 0.8rem; color: #64748b; }

      .stat-pill {
        background-color: #f1f5f9;
        padding: 0.5rem 0.85rem;
        border-radius: 20px;
        font-size: 0.85rem;
        color: #334155;
        display: inline-flex;
        gap: 0.4rem;
        align-items: center;
      }
      .stat-value { color: var(--color-primary, #1b4332); font-weight: 800; }

      .toolbar-card { padding: 1.25rem; }
      .toolbar-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      @media (min-width: 768px) {
        .toolbar-grid {
          grid-template-columns: 2fr 1.5fr 1.5fr;
          align-items: flex-end;
        }
      }

      .toolbar-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        color: #475569;
        margin-bottom: 0.35rem;
      }

      .input-with-icon { position: relative; display: flex; align-items: center; }
      .search-icon { position: absolute; left: 0.75rem; font-size: 0.85rem; color: #94a3b8; }

      .toolbar-input, .toolbar-select {
        width: 100%;
        padding: 0.6rem 0.75rem;
        font-size: 0.85rem;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        outline: none;
        background-color: #ffffff;
        font-family: inherit;
      }

      .toolbar-input { padding-left: 2.2rem; }
      .toolbar-input:focus, .toolbar-select:focus {
        border-color: var(--color-primary, #1b4332);
        box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.1);
      }

      .export-btn-group { display: flex; gap: 0.5rem; }

      .btn-export {
        flex: 1;
        padding: 0.6rem 0.75rem;
        font-size: 0.8rem;
        font-weight: 700;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.3rem;
      }

      .btn-excel { background-color: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
      .btn-excel:hover { background-color: #bbf7d0; }

      .btn-pdf { background-color: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
      .btn-pdf:hover { background-color: #fca5a5; }

      .table-card { overflow: hidden; }
      .table-responsive-wrapper { width: 100%; overflow-x: auto; }

      .data-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: 0.85rem;
      }

      .data-table th {
        background-color: #f8fafc;
        color: #334155;
        font-weight: 700;
        padding: 0.85rem 1rem;
        border-bottom: 2px solid #e2e8f0;
        white-space: nowrap;
      }

      .data-table td {
        padding: 0.85rem 1rem;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
        color: #334155;
      }

      .data-table tbody tr:hover { background-color: #f8fafc; }
      .text-center { text-align: center; }

      .id-code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-weight: 700;
        color: var(--color-primary, #1b4332);
        font-size: 0.8rem;
        background-color: #f1f5f9;
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
      }

      .date-text { font-weight: 700; color: #1e293b; display: block; }
      .guru-text { font-size: 0.75rem; color: #64748b; display: block; margin-top: 0.1rem; }

      .pills-container { display: flex; flex-wrap: wrap; gap: 0.3rem; max-width: 220px; }

      .petugas-pill {
        font-size: 0.7rem;
        background-color: #e0f2fe;
        color: #0369a1;
        padding: 0.15rem 0.45rem;
        border-radius: 12px;
        font-weight: 600;
        white-space: nowrap;
      }

      .task-ratio { font-weight: 700; color: #334155; }

      .status-badge {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 0.25rem 0.55rem;
        border-radius: 12px;
        display: inline-block;
        white-space: nowrap;
      }
      .badge-sangat-baik { background-color: #d1fae5; color: #065f46; }
      .badge-baik { background-color: #dbeafe; color: #1e40af; }
      .badge-evaluasi { background-color: #fee2e2; color: #991b1b; }

      .media-indicator {
        font-size: 0.75rem;
        font-weight: 600;
        color: #475569;
        background-color: #f1f5f9;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        display: inline-block;
      }

      .ellipsis-text {
        max-width: 180px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 0.8rem;
        color: #64748b;
      }

      .action-btn-group { display: flex; gap: 0.35rem; justify-content: center; }

      .btn-action {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: 1px solid #cbd5e1;
        background-color: #ffffff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        transition: all 0.2s;
      }

      .btn-action-view:hover { background-color: #e0f2fe; border-color: #0284c7; color: #0284c7; }
      .btn-action-print:hover { background-color: #fef3c7; border-color: #d97706; color: #d97706; }
      .btn-action-delete:hover { background-color: #fee2e2; border-color: #dc2626; color: #dc2626; }

      .empty-state-box { padding: 3rem 1rem; text-align: center; }
      .empty-icon { font-size: 3rem; margin-bottom: 0.5rem; }
      .empty-title { font-size: 1.05rem; font-weight: 700; color: #334155; margin: 0; }
      .empty-desc { font-size: 0.8rem; color: #64748b; margin: 0.3rem 0 0 0; }

      /* MODAL POP-UP & SCROLLING CONTROLS */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(4px);
        z-index: 200;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.25s ease, visibility 0.25s ease;
      }

      .modal-overlay.active { opacity: 1; visibility: visible; }

      .modal-card {
        background-color: #ffffff;
        border-radius: 12px;
        width: 100%;
        max-width: 850px;
        max-height: 85vh;
        height: auto;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        overflow: hidden;
      }

      .modal-header {
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #f8fafc;
        flex-shrink: 0;
      }

      .modal-header-title { display: flex; align-items: center; gap: 0.75rem; }
      .modal-title { margin: 0; font-size: 1.05rem; font-weight: 800; color: var(--color-primary, #1b4332); }
      
      .modal-id-badge {
        font-family: monospace;
        font-size: 0.8rem;
        font-weight: 700;
        background-color: #e2e8f0;
        color: #334155;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
      }

      .modal-close-btn {
        background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b;
      }

      .modal-scrollable {
        padding: 1.25rem;
        display: block; 
        flex: 1 1 auto;
        min-height: 0; 
        overflow-y: auto;
        overscroll-behavior: contain; 
      }

      .modal-scrollable .detail-section-card {
        margin-bottom: 1.25rem;
      }

      .modal-scrollable .detail-section-card:last-child {
        margin-bottom: 0;
      }

      .modal-footer {
        padding: 1rem 1.25rem;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        background-color: #f8fafc;
        flex-shrink: 0;
      }

      .detail-section-card {
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        overflow: hidden;
      }

      .section-card-header {
        background-color: #f1f5f9;
        padding: 0.65rem 1rem;
        font-weight: 700;
        font-size: 0.85rem;
        color: var(--color-primary, #1b4332);
        border-bottom: 1px solid #e2e8f0;
      }

      .section-card-body { padding: 1rem; }

      .identity-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      @media (min-width: 640px) {
        .identity-grid { grid-template-columns: repeat(3, 1fr); }
      }

      .info-item-label { font-size: 0.75rem; color: #64748b; font-weight: 600; }
      .info-item-value { font-size: 0.9rem; font-weight: 700; color: #1e293b; margin-top: 0.15rem; }

      .uncut-matrix-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.82rem;
      }

      .uncut-matrix-table th {
        background-color: #f8fafc;
        padding: 0.6rem 0.75rem;
        text-align: left;
        border-bottom: 2px solid #e2e8f0;
        color: #475569;
      }

      .uncut-matrix-table td {
        padding: 0.65rem 0.75rem;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }

      .badge-task-true {
        background-color: #d1fae5;
        color: #065f46;
        font-weight: 700;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-size: 0.7rem;
        display: inline-block;
      }

      .badge-task-false {
        background-color: #fee2e2;
        color: #991b1b;
        font-weight: 700;
        padding: 0.2rem 0.5rem;
        border-radius: 6px;
        font-size: 0.7rem;
        display: inline-block;
      }

      .gallery-photo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
        gap: 0.75rem;
      }

      .gallery-photo-item {
        width: 100%;
        height: 100px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #e2e8f0;
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .gallery-photo-item:hover {
        transform: scale(1.03);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }

      .gallery-photo-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .full-narrative-text {
        font-size: 0.85rem;
        line-height: 1.6;
        color: #334155;
        white-space: pre-line;
        margin: 0;
      }

      .lightbox-overlay { z-index: 300; background-color: rgba(0, 0, 0, 0.85); }
      .lightbox-content { position: relative; max-width: 90vw; max-height: 90vh; }
      .lightbox-content img { max-width: 100%; max-height: 85vh; border-radius: 8px; object-fit: contain; }
      .lightbox-close-btn {
        position: absolute; top: -40px; right: 0;
        background: none; border: none; color: #ffffff; font-size: 1.8rem; cursor: pointer;
      }

      .btn {
        padding: 0.65rem 1.25rem; font-size: 0.85rem; font-weight: 700;
        border-radius: 8px; border: none; cursor: pointer; transition: all 0.2s;
        display: inline-flex; align-items: center; gap: 0.5rem;
      }
      .btn-primary { background-color: var(--color-primary, #1b4332); color: #ffffff; }
      .btn-primary:hover { background-color: #143225; }
      .btn-secondary { background-color: #ffffff; border: 1px solid #cbd5e1; color: #334155; }
      .btn-secondary:hover { background-color: #f1f5f9; }
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
  const complianceFilter = container.querySelector('#complianceFilter');
  const btnExportExcel = container.querySelector('#btnExportExcel');
  const btnExportPDF = container.querySelector('#btnExportPDF');
  const reportsTableBody = container.querySelector('#reportsTableBody');
  const emptyStateBox = container.querySelector('#emptyStateBox');
  const statTotalCount = container.querySelector('#statTotalCount');

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
        alert('⚠️ Tidak ada data laporan yang tersedia untuk diekspor.');
        return;
      }

      try {
        btnExportExcel.disabled = true;
        btnExportExcel.textContent = '⏳ Memproses...';

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
        alert(`❌ Gagal mengekspor Excel: ${err.message}`);
      } finally {
        btnExportExcel.disabled = false;
        btnExportExcel.innerHTML = '📊 Export Excel';
      }
    });
  }

  // =========================================================================
  // 2. INTEGRASI EKSPOR PDF MASSAL (.PDF LANDSCAPE)
  // =========================================================================
  if (btnExportPDF) {
    btnExportPDF.addEventListener('click', async () => {
      if (!filteredReportsData || filteredReportsData.length === 0) {
        alert('⚠️ Tidak ada data laporan yang tersedia untuk diekspor.');
        return;
      }

      try {
        btnExportPDF.disabled = true;
        btnExportPDF.textContent = '⏳ Memproses...';

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
        alert(`❌ Gagal mengekspor PDF Massal: ${err.message}`);
      } finally {
        btnExportPDF.disabled = false;
        btnExportPDF.innerHTML = '📄 Export PDF';
      }
    });
  }

  // =========================================================================
  // 3. INTEGRASI CETAK PDF PER-LAPORAN (SINGLE REPORT PDF)
  // =========================================================================
  async function exportSingleReportPDF(reportId) {
    const report = activeReportsData.find(r => r.id === reportId);
    if (!report) {
      alert('⚠️ Data laporan tidak ditemukan.');
      return;
    }

    try {
      const { trueCount, percentage, statusText } = calculateReportScore(report);
      const listPetugas = Array.isArray(report.petugas) ? report.petugas.join(', ') : String(report.petugas || '-');

      // Susun data 13 Poin Task ke dalam format tabel PDF
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
          status: isDone ? '✓ DIKERJAKAN' : '✕ TIDAK DIKERJAKAN'
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
      alert(`❌ Gagal mencetak PDF Laporan: ${err.message}`);
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
      return;
    }

    if (emptyStateBox) emptyStateBox.style.display = 'none';
    if (statTotalCount) statTotalCount.textContent = filteredReportsData.length;

    reportsTableBody.innerHTML = filteredReportsData.map((report) => {
      const { trueCount, percentage, statusClass, statusText } = calculateReportScore(report);
      const photoCount = report.photos ? report.photos.length : (report.photoCount || 0);

      return `
        <tr>
          <td><span class="id-code">${report.id}</span></td>

          <td>
            <span class="date-text">${report.tanggal}</span>
            <span class="guru-text">🧑‍🏫 ${report.guruPiket}</span>
          </td>

          <td>
            <div class="pills-container">
              ${(report.petugas || []).map(p => `<span class="petugas-pill">${p}</span>`).join('')}
            </div>
          </td>

          <td class="text-center">
            <span class="task-ratio">${trueCount} / 13 Task</span>
          </td>

          <td>
            <span class="status-badge ${statusClass}">${percentage}% - ${statusText}</span>
          </td>

          <td class="text-center">
            <span class="media-indicator">📷 ${photoCount} Foto</span>
          </td>

          <td>
            <div class="ellipsis-text" title="${report.catatan || '-'}">
              ${report.catatan || 'Tidak ada catatan.'}
            </div>
          </td>

          <td class="text-center">
            <div class="action-btn-group">
              <button type="button" class="btn-action btn-action-view" data-id="${report.id}" title="Lihat Detail Full Data">
                👁️
              </button>
              <button type="button" class="btn-action btn-action-print" data-id="${report.id}" title="Cetak PDF">
                🖨️
              </button>
              <button type="button" class="btn-action btn-action-delete" data-id="${report.id}" title="Hapus Laporan dari IndexedDB">
                🗑️
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
        <div class="section-card-header">📌 Bagian 1: Identitas Pelaksanaan & Metrik Performa</div>
        <div class="section-card-body">
          <div class="identity-grid">
            <div>
              <span class="info-item-label">Guru Piket Penanggung Jawab:</span>
              <div class="info-item-value">🧑‍🏫 ${report.guruPiket}</div>
            </div>
            <div>
              <span class="info-item-label">Tanggal Pelaksanaan:</span>
              <div class="info-item-value">📅 ${report.tanggal}</div>
            </div>
            <div>
              <span class="info-item-label">Skor Akhir Compliance:</span>
              <div class="info-item-value">
                <span class="status-badge ${statusClass}" style="font-size: 0.85rem; padding: 0.3rem 0.7rem;">
                  ${percentage}% - ${statusText}
                </span>
              </div>
            </div>
            <div style="grid-column: 1 / -1;">
              <span class="info-item-label">Tim Petugas Harian (Piket):</span>
              <div class="info-item-value" style="display: flex; gap: 0.5rem; margin-top: 0.3rem; flex-wrap: wrap;">
                ${(report.petugas || []).map(p => `<span class="petugas-pill" style="font-size: 0.8rem; padding: 0.25rem 0.6rem;">👤 ${p}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="detail-section-card">
        <div class="section-card-header">
          ✅ Bagian 2: Matriks Lengkap Status 13 Poin Tugas Checklist (${trueCount} / 13 Dikerjakan)
        </div>
        <div class="section-card-body" style="padding: 0;">
          <table class="uncut-matrix-table">
            <thead>
              <tr>
                <th style="width: 60px;">No.</th>
                <th style="width: 160px;">Kategori</th>
                <th>Deskripsi Tugas Lengkap</th>
                <th style="width: 130px;" class="text-center">Status Task</th>
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
          📷 Bagian 3: Galeri Bukti Media Foto (${report.photos ? report.photos.length : 0} Foto)
        </div>
        <div class="section-card-body">
          ${report.photos && report.photos.length > 0 ? `
            <div class="gallery-photo-grid">
              ${report.photos.map((photoUrl, idx) => `
                <div class="gallery-photo-item" data-src="${photoUrl}" title="Klik untuk memperbesar foto ${idx + 1}">
                  <img src="${photoUrl}" alt="Bukti Foto ${idx + 1}">
                </div>
              `).join('')}
            </div>
          ` : `
            <p style="font-size: 0.8rem; color: #94a3b8; margin: 0; font-style: italic;">Tidak ada foto lampiran pada laporan ini.</p>
          `}
        </div>
      </section>

      <section class="detail-section-card">
        <div class="section-card-header">📝 Bagian 4: Narasi Catatan Evaluasi Utuh</div>
        <div class="section-card-body">
          <p class="full-narrative-text">${report.catatan || 'Tidak ada catatan evaluasi narasi yang dituliskan.'}</p>
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
          <td style="font-weight: 700; color: var(--color-primary, #1b4332);">${item.code}</td>
          <td style="color: #64748b; font-weight: 600;">${item.category}</td>
          <td style="color: #334155; line-height: 1.4;">${item.label}</td>
          <td class="text-center">
            ${isDone ? `
              <span class="badge-task-true">✓ DIKERJAKAN</span>
            ` : `
              <span class="badge-task-false">✕ TIDAK DIKERJAKAN</span>
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

  renderTableRows();
}