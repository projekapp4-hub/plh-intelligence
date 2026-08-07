/**
 * FORMVIEW.JS - Modul Form Input Data Laporan Kebersihan & Preservasi
 * Path: src/pages/dashboard/views/formView.js
 * 
 * Mengimplementasikan arsitektur Single Page Application (SPA) card-based,
 * Live Compliance Engine, Bulk Action Controls, Drag & Drop Dropzone, 
 * serta Modal Quick Preview dengan proteksi tombol simpan terikat validasi.
 */

// Data Struktur 13 Poin Tugas Checklist dalam 5 Kategori
const CHECKLIST_CATEGORIES = [
  {
    id: 'kat_1',
    title: 'Kategori 1: Kebersihan dan Sanitasi',
    icon: '🧹',
    colorTheme: 'teal',
    items: [
      { id: 'task_1_1', code: '1.1', label: 'Menyikat dan membersihkan WC lantai 1 dan lantai 2 sekolah.' },
      { id: 'task_1_2', code: '1.2', label: 'Menyapu dan mengepel koridor lantai 1 dan lantai 2 sekolah.' },
      { id: 'task_1_3', code: '1.3', label: 'Mengecek dan membersihkan drainase di lingkungan sekolah.' }
    ]
  },
  {
    id: 'kat_2',
    title: 'Kategori 2: Pengelolaan Sampah',
    icon: '♻️',
    colorTheme: 'amber',
    items: [
      { id: 'task_2_1', code: '2.1', label: 'Membawa sampah ke bank sampah.' },
      { id: 'task_2_2', code: '2.2', label: 'Memilah sampah organik, unorganik, dan residu.' },
      { id: 'task_2_3', code: '2.3', label: 'Menimbang dan mencatat pada buku laporan jumlah sampah organik, unorganik, dan residu.' },
      { id: 'task_2_4', code: '2.4', label: 'Memasukkan sampah organik ke lubang biopori.' }
    ]
  },
  {
    id: 'kat_3',
    title: 'Kategori 3: Keanekaragaman Hayati',
    icon: '🌱',
    colorTheme: 'emerald',
    items: [
      { id: 'task_3_1', code: '3.1', label: 'Berkebun di green house (mengolah lahan, menanam, merawat, memanen, atau memasarkan).' },
      { id: 'task_3_2', code: '3.2', label: 'Beternak ikan (merawat, memanen, atau memasarkan).' },
      { id: 'task_3_3', code: '3.3', label: 'Merawat tanaman pot siswi (mencabut gulma, menyiram, memanen, memasarkan, atau mengolah).' }
    ]
  },
  {
    id: 'kat_4',
    title: 'Kategori 4: Penghematan Energi',
    icon: '⚡',
    colorTheme: 'yellow',
    items: [
      { id: 'task_4_1', code: '4.1', label: 'Melakukan pengecekan penggunaan kipas angin dan lampu penerangan di masjid (shof putra & putri). Mematikan kipas angin serta lampu penerangan jika tidak ada yang menggunakan dan melaporkan ke guru piket.' }
    ]
  },
  {
    id: 'kat_5',
    title: 'Kategori 5: Penghematan Air',
    icon: '💧',
    colorTheme: 'blue',
    items: [
      { id: 'task_5_1', code: '5.1', label: 'Melakukan pengecekan keran air di toilet dan di tempat wudhu putra & putri. Melaporkan ke guru piket jika ada kebocoran/kerusakan ataupun jika ada keran air yang dibiarkan mengalir tanpa digunakan.' },
      { id: 'task_5_2', code: '5.2', label: 'Menyiram tanaman di green house menggunakan air tadah hujan di toren samping asrama.' }
    ]
  }
];

// Array Penampung Berkas Foto yang Diunggah
let uploadedPhotos = [];

/**
 * Fungsi Utama Render Modul Form
 * @param {HTMLElement} container - Elemen pembungkus #spaCanvas
 */
export function render(container) {
  // Format Tanggal Hari Ini (YYYY-MM-DD)
  const todayISO = new Date().toISOString().split('T')[0];

  // 1. Injeksi Struktur Markup HTML
  container.innerHTML = `
    <div class="form-wrapper">
      
      <!-- HEADER FORM & STICKY LIVE SCORING DASHBOARD -->
      <header class="form-header-card">
        <div class="header-identity">
          <div class="identity-icon">📋</div>
          <div class="identity-text">
            <h1 class="form-title">Form Laporan Kebersihan & Preservasi Lingkungan</h1>
            <p class="form-subtitle">Lembar kerja digital pengisian evaluasi harian piket lingkungan Adiwiyata sekolah.</p>
          </div>
        </div>

        <!-- STICKY LIVE SCORING BAR -->
        <div class="sticky-score-bar" id="stickyScoreBar">
          <div class="score-bar-top">
            <div class="completion-info">
              <span class="completion-label">Kelengkapan Form:</span>
              <strong id="completionText" class="completion-count">0 dari 13 Tugas Terisi</strong>
            </div>
            <div class="score-badge-wrapper">
              <span class="score-label">Skor Capaian:</span>
              <span id="scorePercentage" class="score-value">0%</span>
              <span id="statusBadge" class="status-badge badge-gray">Belum Lengkap</span>
            </div>
          </div>

          <!-- Progress Bar Visual -->
          <div class="progress-track">
            <div id="progressFill" class="progress-fill" style="width: 0%;"></div>
          </div>

          <!-- PANEL AKSI CEPAT CHECKLIST (BULK ACTIONS) -->
          <div class="bulk-actions-panel">
            <span class="bulk-label">Aksi Cepat Checklist:</span>
            <div class="bulk-buttons">
              <button type="button" id="btnMarkAllTrue" class="btn-bulk btn-bulk-true">
                ✓ Tandai Semua TRUE
              </button>
              <button type="button" id="btnMarkAllFalse" class="btn-bulk btn-bulk-false">
                ✕ Tandai Semua FALSE
              </button>
              <button type="button" id="btnResetForm" class="btn-bulk btn-bulk-reset">
                🔄 Reset Form
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- FORM UTAMA -->
      <form id="plhReportForm" class="report-form" novalidate>
        
        <!-- BAGIAN FORM 1: INFORMASI PETUGAS & PELAKSANAAN -->
        <section class="form-card">
          <div class="card-header">
            <h2 class="card-title">👤 Bagian 1: Informasi Petugas & Pelaksanaan</h2>
            <p class="card-subtitle">Masukkan data administratif penanggung jawab dan tim piket harian.</p>
          </div>
          <div class="card-body">
            
            <!-- Grid Baris 1: Guru Piket & Tanggal (2 Kolom Desktop) -->
            <div class="form-grid grid-2-col">
              <div class="form-group">
                <label for="guruPiket" class="form-label">Guru Piket Penanggung Jawab <span class="required">*</span></label>
                <div class="input-icon-wrapper">
                  <span class="input-icon">🧑‍🏫</span>
                  <input type="text" id="guruPiket" name="guruPiket" class="form-control" placeholder="Nama lengkap guru piket" required>
                </div>
                <span class="error-msg" id="err-guruPiket">Wajib diisi</span>
              </div>

              <div class="form-group">
                <label for="tanggalPiket" class="form-label">Tanggal Pelaksanaan <span class="required">*</span></label>
                <div class="input-icon-wrapper">
                  <span class="input-icon">📅</span>
                  <input type="date" id="tanggalPiket" name="tanggalPiket" class="form-control" value="${todayISO}" required>
                </div>
                <span class="error-msg" id="err-tanggalPiket">Tanggal wajib dipilih</span>
              </div>
            </div>

            <!-- Grid Baris 2: Petugas 1, 2, 3 (3 Kolom Desktop) -->
            <div class="form-grid grid-3-col">
              <div class="form-group">
                <label for="petugas1" class="form-label">Petugas 1 <span class="required">*</span></label>
                <input type="text" id="petugas1" name="petugas1" class="form-control" placeholder="Nama santri/petugas 1" required>
                <span class="error-msg" id="err-petugas1">Wajib diisi</span>
              </div>

              <div class="form-group">
                <label for="petugas2" class="form-label">Petugas 2 <span class="required">*</span></label>
                <input type="text" id="petugas2" name="petugas2" class="form-control" placeholder="Nama santri/petugas 2" required>
                <span class="error-msg" id="err-petugas2">Wajib diisi</span>
              </div>

              <div class="form-group">
                <label for="petugas3" class="form-label">Petugas 3 <span class="required">*</span></label>
                <input type="text" id="petugas3" name="petugas3" class="form-control" placeholder="Nama santri/petugas 3" required>
                <span class="error-msg" id="err-petugas3">Wajib diisi</span>
              </div>
            </div>

          </div>
        </section>

        <!-- BAGIAN FORM 2: EVALUASI 13 POIN TUGAS CHECKLIST (5 KATEGORI) -->
        <section class="form-card">
          <div class="card-header">
            <h2 class="card-title">✅ Bagian 2: Evaluasi 13 Poin Tugas Checklist</h2>
            <p class="card-subtitle">Pilih status keterlaksanaan untuk setiap indikator tugas harian.</p>
          </div>
          <div class="card-body categories-container">
            ${renderCategoriesMarkup()}
          </div>
        </section>

        <!-- BAGIAN FORM 3: LAMPIRAN MEDIA FOTO & NARASI EVALUASI -->
        <section class="form-card">
          <div class="card-header">
            <h2 class="card-title">📷 Bagian 3: Dokumentasi Foto & Narasi Evaluasi</h2>
            <p class="card-subtitle">Unggah bukti fisik foto kegiatan dan tuliskan catatan observasi harian.</p>
          </div>
          <div class="card-body">
            
            <!-- Area Unggah Drag & Drop -->
            <div class="form-group">
              <label class="form-label">Unggah Foto Dokumentasi (Maksimal 5 Foto)</label>
              <div id="dropzone" class="dropzone-area">
                <div class="dropzone-content">
                  <span class="dropzone-icon">☁️📷</span>
                  <p class="dropzone-text"><strong>Tarik & lepas file foto di sini</strong>, atau klik untuk memilih</p>
                  <p class="dropzone-hint">Format yang didukung: JPG, PNG, WEBP (Maksimal 5 Foto)</p>
                </div>
                <input type="file" id="fileInput" accept="image/jpeg,image/png,image/webp" multiple class="file-input-hidden">
              </div>

              <!-- Grid Pratinjau Foto Thumbnail -->
              <div id="photoPreviewGrid" class="photo-preview-grid"></div>
            </div>

            <!-- Kolom Catatan & Evaluasi Narasi -->
            <div class="form-group">
              <label for="catatanEvaluasi" class="form-label">Catatan & Evaluasi Narasi (Opsional)</label>
              <textarea id="catatanEvaluasi" name="catatanEvaluasi" class="form-control textarea-control" rows="4" placeholder="Tuliskan temuan khusus, kendala teknis di lapangan, alasan tugas FALSE, atau saran perbaikan..."></textarea>
            </div>

          </div>
        </section>

        <!-- PANEL VALIDASI & ACTION BUTTONS -->
        <div class="form-actions-wrapper">
          
          <!-- Validation Alert Box -->
          <div id="validationAlert" class="validation-alert-box">
            <span class="alert-icon">⚠️</span>
            <span class="alert-text">Lengkapi seluruh data petugas dan 13 poin checklist untuk mengaktifkan tombol simpan.</span>
          </div>

          <div class="action-buttons-group">
            <button type="button" id="btnQuickPreview" class="btn btn-secondary btn-preview">
              👁️ Quick Preview
            </button>
            <button type="submit" id="btnSubmitForm" class="btn btn-primary btn-submit" disabled>
              💾 Simpan Laporan Data
            </button>
          </div>
        </div>

      </form>

      <!-- JENDELA MODAL QUICK PREVIEW -->
      <div id="previewModal" class="modal-overlay" aria-hidden="true">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title">👁️ Pratinjau Ringkasan Laporan</h3>
            <button type="button" id="btnCloseModal" class="modal-close-btn">✕</button>
          </div>
          <div class="modal-body" id="modalPreviewBody">
            <!-- Konten pratinjau dirender secara dinamis melalui JavaScript -->
          </div>
          <div class="modal-footer">
            <button type="button" id="btnBackEdit" class="btn btn-secondary">Kembali Edit</button>
            <button type="button" id="btnConfirmSave" class="btn btn-primary" disabled>Konfirmasi & Simpan</button>
          </div>
        </div>
      </div>

    </div>

    <!-- STYLING SCOPED UNTUK FORMVIEW MODULE -->
    <style>
      .form-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        width: 100%;
        padding-bottom: 3rem;
      }

      /* Card Common Style */
      .form-header-card, .form-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border, #e2e8f0);
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        overflow: hidden;
      }

      .form-header-card {
        padding: 1.25rem;
        border-top: 4px solid var(--color-primary, #1b4332);
      }

      .header-identity {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 1.25rem;
      }

      .identity-icon {
        font-size: 2.2rem;
        line-height: 1;
      }

      .form-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--color-primary, #1b4332);
      }

      .form-subtitle {
        margin: 0.25rem 0 0 0;
        font-size: 0.8rem;
        color: #64748b;
      }

      /* Sticky Score Bar */
      .sticky-score-bar {
        position: sticky;
        top: 64px;
        z-index: 70;
        background-color: #f8fafc;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        padding: 1rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      }

      .score-bar-top {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }

      @media (min-width: 640px) {
        .score-bar-top {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }
      }

      .completion-info {
        font-size: 0.85rem;
        color: #334155;
      }

      .completion-count {
        color: var(--color-primary, #1b4332);
      }

      .score-badge-wrapper {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
      }

      .score-value {
        font-weight: 800;
        font-size: 1.1rem;
        color: var(--color-primary, #1b4332);
      }

      /* Status Badges */
      .status-badge {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.25rem 0.6rem;
        border-radius: 12px;
        text-transform: uppercase;
      }
      .badge-gray { background-color: #e2e8f0; color: #475569; }
      .badge-green { background-color: #d1fae5; color: #065f46; }
      .badge-blue { background-color: #dbeafe; color: #1e40af; }
      .badge-yellow { background-color: #fef3c7; color: #92400e; }

      .progress-track {
        width: 100%;
        height: 8px;
        background-color: #e2e8f0;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.85rem;
      }

      .progress-fill {
        height: 100%;
        background-color: var(--color-primary, #1b4332);
        transition: width 0.3s ease;
      }

      /* Bulk Actions Panel */
      .bulk-actions-panel {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-top: 0.75rem;
        border-top: 1px solid #e2e8f0;
      }

      @media (min-width: 640px) {
        .bulk-actions-panel {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
      }

      .bulk-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: #64748b;
      }

      .bulk-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .btn-bulk {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.4rem 0.75rem;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
      }

      .btn-bulk-true { background-color: #d1fae5; color: #065f46; }
      .btn-bulk-true:hover { background-color: #a7f3d0; }
      
      .btn-bulk-false { background-color: #fee2e2; color: #991b1b; }
      .btn-bulk-false:hover { background-color: #fca5a5; }

      .btn-bulk-reset { background-color: #f1f5f9; color: #475569; }
      .btn-bulk-reset:hover { background-color: #e2e8f0; }

      /* Form Cards Body */
      .card-header {
        padding: 1rem 1.25rem;
        background-color: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
      }

      .card-title {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-primary, #1b4332);
      }

      .card-subtitle {
        margin: 0.2rem 0 0 0;
        font-size: 0.75rem;
        color: #64748b;
      }

      .card-body {
        padding: 1.25rem;
      }

      /* Form Controls Layout */
      .form-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      @media (min-width: 640px) {
        .grid-2-col { grid-template-columns: repeat(2, 1fr); }
        .grid-3-col { grid-template-columns: repeat(3, 1fr); }
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .form-label {
        font-size: 0.8rem;
        font-weight: 700;
        color: #334155;
      }

      .required { color: #ef4444; }

      .input-icon-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .input-icon {
        position: absolute;
        left: 0.75rem;
        font-size: 1rem;
      }

      .form-control {
        width: 100%;
        padding: 0.65rem 0.75rem;
        font-size: 0.85rem;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-family: inherit;
        outline: none;
        transition: border-color 0.2s;
      }

      .input-icon-wrapper .form-control {
        padding-left: 2.4rem;
      }

      .form-control:focus {
        border-color: var(--color-primary, #1b4332);
        box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.1);
      }

      .textarea-control {
        resize: vertical;
        min-height: 90px;
      }

      .error-msg {
        font-size: 0.7rem;
        color: #dc2626;
        display: none;
      }

      .form-group.has-error .error-msg {
        display: block;
      }

      .form-group.has-error .form-control {
        border-color: #ef4444;
      }

      /* Category & Checklist Items */
      .categories-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .category-block {
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        overflow: hidden;
      }

      .category-header {
        padding: 0.75rem 1rem;
        background-color: #f1f5f9;
        font-weight: 700;
        font-size: 0.9rem;
        color: #1e293b;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .task-list {
        display: flex;
        flex-direction: column;
      }

      .task-item-row {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        padding: 1rem;
        border-bottom: 1px solid #f1f5f9;
      }

      .task-item-row:last-child {
        border-bottom: none;
      }

      @media (min-width: 640px) {
        .task-item-row {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
      }

      .task-info {
        display: flex;
        gap: 0.75rem;
        flex: 1;
      }

      .task-code {
        font-weight: 800;
        font-size: 0.85rem;
        color: var(--color-primary, #1b4332);
        min-width: 28px;
      }

      .task-label {
        font-size: 0.85rem;
        color: #334155;
        line-height: 1.4;
      }

      /* Custom Radio Options Cards */
      .radio-options-group {
        display: flex;
        gap: 0.5rem;
        min-width: 200px;
      }

      .radio-card {
        flex: 1;
        position: relative;
      }

      .radio-card input[type="radio"] {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
      }

      .radio-btn-label {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        padding: 0.5rem;
        font-size: 0.8rem;
        font-weight: 700;
        border-radius: 8px;
        border: 2px solid #cbd5e1;
        cursor: pointer;
        background-color: #ffffff;
        transition: all 0.2s ease;
        user-select: none;
      }

      /* Radio TRUE State */
      .radio-card-true .radio-btn-label { border-color: #a7f3d0; color: #065f46; }
      .radio-card-true input[type="radio"]:checked + .radio-btn-label {
        background-color: #d1fae5;
        border-color: #10b981;
        box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
      }

      /* Radio FALSE State */
      .radio-card-false .radio-btn-label { border-color: #fca5a5; color: #991b1b; }
      .radio-card-false input[type="radio"]:checked + .radio-btn-label {
        background-color: #fee2e2;
        border-color: #ef4444;
        box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
      }

      /* Dropzone Area */
      .dropzone-area {
        border: 2px dashed #cbd5e1;
        border-radius: 10px;
        padding: 1.5rem;
        text-align: center;
        background-color: #f8fafc;
        cursor: pointer;
        transition: border-color 0.2s, background-color 0.2s;
      }

      .dropzone-area:hover, .dropzone-area.dragover {
        border-color: var(--color-primary, #1b4332);
        background-color: #f0fdf4;
      }

      .file-input-hidden { display: none; }

      .dropzone-icon { font-size: 2rem; }
      .dropzone-text { margin: 0.5rem 0 0.2rem 0; font-size: 0.85rem; color: #334155; }
      .dropzone-hint { margin: 0; font-size: 0.75rem; color: #94a3b8; }

      /* Photo Grid Preview */
      .photo-preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
        gap: 0.75rem;
        margin-top: 1rem;
      }

      .photo-thumb-card {
        position: relative;
        width: 100%;
        height: 90px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #e2e8f0;
      }

      .photo-thumb-card img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .photo-delete-btn {
        position: absolute;
        top: 4px;
        right: 4px;
        background: rgba(239, 68, 68, 0.9);
        color: #ffffff;
        border: none;
        border-radius: 50%;
        width: 22px;
        height: 22px;
        font-size: 0.75rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Validation Alert & Buttons */
      .form-actions-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-top: 1rem;
      }

      .validation-alert-box {
        background-color: #fef3c7;
        border: 1px solid #fde68a;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        color: #92400e;
        font-weight: 600;
      }

      .modal-incomplete-warning {
        background-color: #fee2e2;
        border: 1px solid #fca5a5;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        color: #991b1b;
        font-weight: 600;
      }

      .action-buttons-group {
        display: flex;
        gap: 0.75rem;
      }

      .btn {
        flex: 1;
        padding: 0.85rem 1rem;
        font-size: 0.9rem;
        font-weight: 700;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
      }

      .btn-primary {
        background-color: var(--color-primary, #1b4332);
        color: #ffffff;
      }

      .btn-primary:hover:not(:disabled) {
        background-color: #143225;
      }

      .btn-primary:disabled {
        background-color: #cbd5e1;
        color: #94a3b8;
        cursor: not-allowed;
      }

      .btn-secondary {
        background-color: #ffffff;
        border: 1px solid #cbd5e1;
        color: #334155;
      }

      .btn-secondary:hover { background-color: #f1f5f9; }

      /* Modal Style */
      .modal-overlay {
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background-color: rgba(15, 23, 42, 0.5);
        backdrop-filter: blur(3px);
        z-index: 200;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        opacity: 0;
        visibility: hidden;
        transition: all 0.25s ease;
      }

      .modal-overlay.active { opacity: 1; visibility: visible; }

      .modal-card {
        background-color: #ffffff;
        border-radius: 12px;
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }

      .modal-header {
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .modal-title { margin: 0; font-size: 1.05rem; font-weight: 800; color: var(--color-primary, #1b4332); }
      .modal-close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b; }

      .modal-body {
        padding: 1.25rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        font-size: 0.85rem;
      }

      .modal-footer {
        padding: 1rem 1.25rem;
        border-top: 1px solid #e2e8f0;
        display: flex;
        gap: 0.75rem;
        background-color: #f8fafc;
      }

      .preview-section-title {
        font-weight: 700;
        color: var(--color-primary, #1b4332);
        margin-bottom: 0.35rem;
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 0.2rem;
      }

      .preview-list { padding-left: 1.2rem; margin: 0.3rem 0; }
      .preview-list li { margin-bottom: 0.25rem; }
    </style>
  `;

  // 2. Inisialisasi Event Listener Logic
  initFormLogic(container);
}

/**
 * Membangun Markup HTML untuk 5 Kategori Tugas
 */
function renderCategoriesMarkup() {
  return CHECKLIST_CATEGORIES.map(category => `
    <div class="category-block">
      <div class="category-header">
        <span>${category.icon}</span>
        <span>${category.title}</span>
      </div>
      <div class="task-list">
        ${category.items.map(task => `
          <div class="task-item-row">
            <div class="task-info">
              <span class="task-code">${task.code}</span>
              <span class="task-label">${task.label}</span>
            </div>
            <div class="radio-options-group">
              <div class="radio-card radio-card-true">
                <input type="radio" id="${task.id}_true" name="${task.id}" value="TRUE">
                <label for="${task.id}_true" class="radio-btn-label">
                  <span>✓</span> TRUE
                </label>
              </div>
              <div class="radio-card radio-card-false">
                <input type="radio" id="${task.id}_false" name="${task.id}" value="FALSE">
                <label for="${task.id}_false" class="radio-btn-label">
                  <span>✕</span> FALSE
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
 * Menghubungkan Semua Event Handlers & Logika Validasi Real-time
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
    if (completionText) completionText.textContent = `${answeredCount} dari 13 Tugas Terisi`;

    // 2. Hitung Persentase Skor Capaian
    const scorePercent = Math.round((trueCount / 13) * 100);
    const scorePercentageElem = container.querySelector('#scorePercentage');
    if (scorePercentageElem) scorePercentageElem.textContent = `${scorePercent}%`;

    // 3. Update Badge Status
    const statusBadge = container.querySelector('#statusBadge');
    if (statusBadge) {
      statusBadge.className = 'status-badge';
      if (answeredCount < 13) {
        statusBadge.textContent = 'Belum Lengkap';
        statusBadge.classList.add('badge-gray');
      } else if (scorePercent >= 90) {
        statusBadge.textContent = 'Sangat Baik';
        statusBadge.classList.add('badge-green');
      } else if (scorePercent >= 75) {
        statusBadge.textContent = 'Baik';
        statusBadge.classList.add('badge-blue');
      } else {
        statusBadge.textContent = 'Perlu Evaluasi';
        statusBadge.classList.add('badge-yellow');
      }
    }

    // 4. Cek Validitas Form Seluruhnya
    validateFormCompleteness(answeredCount);
  }

  // B. FUNGSI LOGIKA VALIDASI INPUT HEADER & SUBMIT STATE (TERMASUK TOMBOL SIMPAN DI MODAL)
  function validateFormCompleteness(answeredCount) {
    let isHeaderValid = true;

    textInputs.forEach(id => {
      const field = form.querySelector(`#${id}`);
      if (!field || !field.value.trim()) {
        isHeaderValid = false;
      }
    });

    const isFullyValid = isHeaderValid && (answeredCount === 13);

    // Kunci atau aktifkan tombol simpan form utama & tombol konfirmasi modal
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
        const parent = input.closest('.form-group');
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

  // E. LOGIKA DRAG & DROP FOTO DROPZONE
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

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

  function handlePhotoUploads(files) {
    const validFiles = files.filter(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type));
    
    if (uploadedPhotos.length + validFiles.length > 5) {
      alert('Maksimal foto yang dapat diunggah adalah 5 foto.');
      return;
    }

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedPhotos.push({ file, src: e.target.result });
        renderPhotoThumbnails();
      };
      reader.readAsDataURL(file);
    });
  }

  function renderPhotoThumbnails() {
    if (!photoPreviewGrid) return;
    photoPreviewGrid.innerHTML = uploadedPhotos.map((photo, index) => `
      <div class="photo-thumb-card">
        <img src="${photo.src}" alt="Pratinjau Foto ${index + 1}">
        <button type="button" class="photo-delete-btn" data-index="${index}" title="Hapus foto">✕</button>
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

    // Pengecekan Kualifikasi Keabsahan Form
    const isHeaderValid = textInputs.every(id => {
      const field = form.querySelector(`#${id}`);
      return field && field.value.trim() !== '';
    });
    const isFullyValid = isHeaderValid && (answeredCount === 13);

    // Set Status Tombol Simpan Modal Berdasarkan Validitas Form
    if (btnConfirmSave) {
      btnConfirmSave.disabled = !isFullyValid;
    }

    const score = Math.round((trueTasks.length / 13) * 100);

    modalPreviewBody.innerHTML = `
      ${!isFullyValid ? `
        <div class="modal-incomplete-warning">
          <span>⚠️</span>
          <span><strong>Form Belum Lengkap:</strong> Isilah seluruh data petugas dan 13 poin checklist untuk mengaktifkan tombol simpan.</span>
        </div>
      ` : ''}

      <div>
        <div class="preview-section-title">📌 Informasi Header</div>
        <p><strong>Guru Piket:</strong> ${guru}</p>
        <p><strong>Tanggal:</strong> ${tanggal}</p>
        <p><strong>Tim Petugas:</strong> ${p1}, ${p2}, ${p3}</p>
      </div>

      <div>
        <div class="preview-section-title">📊 Statistik Capaian</div>
        <p><strong>Status Kelengkapan:</strong> ${answeredCount} dari 13 Checklist Terisi</p>
        <p><strong>Jumlah Tugas Dikerjakan (TRUE):</strong> ${trueTasks.length} / 13</p>
        <p><strong>Jumlah Tugas Tidak Dikerjakan (FALSE):</strong> ${falseTasks.length} / 13</p>
        <p><strong>Skor Kepatuhan:</strong> ${score}%</p>
      </div>

      ${falseTasks.length > 0 ? `
        <div>
          <div class="preview-section-title" style="color: #dc2626;">⚠️ Daftar Poin Berstatus FALSE</div>
          <ul class="preview-list" style="color: #dc2626;">
            ${falseTasks.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      ` : (answeredCount === 13 ? `
        <div style="color: #065f46; font-weight: 600;">
          🎉 Luar biasa! Seluruh 13 poin tugas berstatus TRUE (Dikerjakan).
        </div>
      ` : '')}

      <div>
        <div class="preview-section-title">📝 Catatan Evaluasi Narasi</div>
        <p style="white-space: pre-line;">${catatan}</p>
      </div>

      <div>
        <div class="preview-section-title">🖼️ Lampiran Dokumentasi</div>
        <p>${uploadedPhotos.length} Foto diunggah.</p>
      </div>
    `;
  }

  // G. SUBMIT FORM & SIMPAN KE LOCALSTORAGE
  if (btnConfirmSave) {
    btnConfirmSave.addEventListener('click', executeSubmitForm);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    executeSubmitForm();
  });

  function executeSubmitForm() {
    // Validasi ulang sebelum mengeksekusi
    let answeredCount = 0;
    CHECKLIST_CATEGORIES.forEach(cat => {
      cat.items.forEach(task => {
        if (form.querySelector(`input[name="${task.id}"]:checked`)) answeredCount++;
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

    // Buat Objek Laporan
    const reportData = {
      id: 'REP-' + Date.now(),
      guruPiket: form.querySelector('#guruPiket').value,
      tanggal: form.querySelector('#tanggalPiket').value,
      petugas: [
        form.querySelector('#petugas1').value,
        form.querySelector('#petugas2').value,
        form.querySelector('#petugas3').value
      ],
      catatan: form.querySelector('#catatanEvaluasi').value,
      photoCount: uploadedPhotos.length,
      createdAt: new Date().toISOString()
    };

    // Simpan data ke LocalStorage
    const existingReports = JSON.parse(localStorage.getItem('plh_reports') || '[]');
    existingReports.push(reportData);
    localStorage.setItem('plh_reports', JSON.stringify(existingReports));

    alert('✅ Laporan Kebersihan & Preservasi Lingkungan berhasil disimpan!');

    // Pindah Tampilan ke Cek Data (data.js) via SPA Router
    const cekDataBtn = document.querySelector('.spa-nav-btn[data-view="data"]');
    if (cekDataBtn) {
      cekDataBtn.click();
    }
  }

  // Inisialisasi awal saat form dimuat
  updateComplianceEngine();
}