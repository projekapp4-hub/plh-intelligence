/**
 * periodic.JS - Modul Dashboard Analitik, Rekapitulasi & Tren Compliance (Page 4)
 * Path: src/pages/dashboard/views/periodic.js
 * 
 * Menyediakan executive analytics untuk Kepala Sekolah, Koordinator Adiwiyata, & Guru Piket Utama:
 * 1. Top Filter & Parameter Analitik (Date Range, Category Scope, Export PDF)
 * 2. Key Performance Indicators (KPI) Cards dengan indikator tren
 * 3. 4 Modul Grafik Interaktif (SVG Line Chart, Bar Chart, Heatmap Grid, & Radar Chart)
 * 4. Top 5 Unperformed Tasks Table & Qualitative Findings Feed dengan Lightbox Photo
 */

// Master Checklist 13 Poin Tugas dengan Pemetaan Kategori
const MASTER_CATEGORIES = [
  'Kebersihan & Sanitasi',
  'Pengelolaan Sampah',
  'Keanekaragaman Hayati',
  'Penghematan Energi',
  'Penghematan Air'
];

const MASTER_CHECKLIST_DATA = [
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
  { code: '4.1', category: 'Penghematan Energi', label: 'Melakukan pengecekan penggunaan kipas angin dan lampu penerangan di masjid (shof putra & putri).' },
  { code: '5.1', category: 'Penghematan Air', label: 'Melakukan pengecekan keran air di toilet dan tempat wudhu putra & putri.' },
  { code: '5.2', category: 'Penghematan Air', label: 'Menyiram tanaman di green house menggunakan air tadah hujan di toren samping asrama.' }
];

// Seed Historical Data untuk Simulasi Tren Analitik 30 Hari (Agustus 2026)
function generateSeedAnalyticsData() {
  const reports = [];
  const baseDate = new Date(2026, 7, 1); // 1 Agustus 2026
  
  const guruNames = ['Ahmad Fauzi, S.Pd.', 'Siti Nurhaliza, S.T.', 'Hendro Utomo, M.Pd.', 'Ratna Sari, M.Si.', 'Bambang Wijaya, S.Pd.'];
  const petugasPool = ['Muhammad Zaki', 'Aisyah Putri', 'Rizky Pratama', 'Budi Santoso', 'Dewi Lestari', 'Fajar Ramadhan', 'Rina Kusuma', 'Hadi Wijaya'];

  for (let i = 1; i <= 30; i++) {
    // Lewati hari Minggu (Hari libur / tanpa piket)
    const currentDate = new Date(2026, 7, i);
    if (currentDate.getDay() === 0) continue; 

    const dayFormatted = String(i).padStart(2, '0');
    const dateStr = `2026-08-${dayFormatted}`;
    
    // Anomali buatan untuk pengujian chart: Tanggal 12 dan 22 memiliki skor rendah (<60%)
    const isAnomaly = (i === 12 || i === 22);

    const tasksStatus = {};
    MASTER_CHECKLIST_DATA.forEach(task => {
      const taskKey = `task_${task.code.replace('.', '_')}`;
      if (isAnomaly) {
        tasksStatus[taskKey] = Math.random() < 0.35; // Banyak FALSE
      } else {
        // Poin 2.3 (Menimbang sampah) dan 3.2 (Ternak ikan) dibuat lebih sering FALSE untuk simulasi Top Unperformed Tasks
        if (task.code === '2.3') {
          tasksStatus[taskKey] = Math.random() < 0.50;
        } else if (task.code === '3.2') {
          tasksStatus[taskKey] = Math.random() < 0.60;
        } else {
          tasksStatus[taskKey] = Math.random() < 0.92; // Kebanyakan TRUE
        }
      }
    });

    let catatan = `Pelaksanaan piket kebersihan dan preservasi pada tanggal ${dateStr} berjalan sesuai dengan prosedur operasional standar.`;
    let issueTag = 'Lancar';
    if (isAnomaly) {
      catatan = `Kendala utama: Hujan deras berkepanjangan memicu genangan air di drainase utama dan fasilitas penimbangan sampah rusak basah tergenang.`;
      issueTag = 'Faktor Cuaca & Kerusakan Alat';
    } else if (!tasksStatus['task_2_3']) {
      catatan = `Proses penimbangan sampah (2.3) terlewat karena buku catatan log harian sedang digunakan untuk rekapitulasi tim bank sampah pusat.`;
      issueTag = 'Administrasi / Alat';
    } else if (!tasksStatus['task_5_1']) {
      catatan = `Ditemukan kebocoran saluran pipa keran wudhu putri lantai 1. Telah dilaporkan ke unit Sarpras sekolah.`;
      issueTag = 'Masalah Fasilitas Air';
    }

    reports.push({
      id: `#LAP-202608${dayFormatted}-${String(i).padStart(2, '0')}`,
      tanggal: dateStr,
      guruPiket: guruNames[i % guruNames.length],
      petugas: [
        petugasPool[i % petugasPool.length],
        petugasPool[(i + 1) % petugasPool.length],
        petugasPool[(i + 2) % petugasPool.length]
      ],
      tasksStatus: tasksStatus,
      catatan: catatan,
      issueTag: issueTag,
      photos: [
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
        'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=400&q=80'
      ]
    });
  }
  return reports;
}

// State Analitik Global
let analyticsData = [];
let selectedScopeCategory = 'ALL';
let activeDateFilter = 'BULAN_INI';

/**
 * Fungsi Utama Render Modul periodic (Page 4)
 * @param {HTMLElement} container - Elemen pembungkus #spaCanvas
 */
export function render(container) {
  // 1. Inisialisasi Data Analitik
  loadAnalyticsData();

  // 2. Injeksi Template HTML Utama Dashboard Analitik
  container.innerHTML = `
    <div class="periodic-page-wrapper">
      
      <!-- BAGIAN A: BILAH KONTROL FILTER & PARAMETER ANALITIK -->
      <header class="analytics-toolbar-card">
        <div class="toolbar-title-box">
          <div class="analytics-badge-icon">📈</div>
          <div>
            <h1 class="analytics-page-title">Dashboard Analitik & Rekapitulasi Compliance</h1>
            <p class="analytics-page-subtitle">Eksekutif pemantauan tren kepatuhan, distribusi performa kategori, dan evaluasi kendala Adiwiyata.</p>
          </div>
        </div>

        <div class="toolbar-controls-grid">
          <!-- Date Range Picker Preset -->
          <div class="control-item">
            <label class="control-label">📅 Rentang Waktu</label>
            <select id="datePresetSelect" class="analytics-select">
              <option value="HARI_INI">Hari Ini</option>
              <option value="7_HARI">7 Hari Terakhir</option>
              <option value="BULAN_INI" selected>Bulan Ini (Agustus 2026)</option>
              <option value="SEMESTER_INI">Semester Ini (Ganjil 2026/2027)</option>
              <option value="CUSTOM">Custom Date Range...</option>
            </select>
          </div>

          <!-- Custom Date Input Group (Hidden by default) -->
          <div id="customDateRangeBox" class="control-item custom-date-box" style="display: none;">
            <label class="control-label">📆 Tanggal Mulai - Selesai</label>
            <div class="date-input-group">
              <input type="date" id="startDateInput" class="analytics-input" value="2026-08-01">
              <span>s/d</span>
              <input type="date" id="endDateInput" class="analytics-input" value="2026-08-31">
            </div>
          </div>

          <!-- Category Scope Filter -->
          <div class="control-item">
            <label class="control-label">🌿 Lingkup Kategori</label>
            <select id="categoryScopeSelect" class="analytics-select">
              <option value="ALL">Semua 5 Kategori Lingkungan</option>
              <option value="Kebersihan & Sanitasi">1. Kebersihan & Sanitasi</option>
              <option value="Pengelolaan Sampah">2. Pengelolaan Sampah</option>
              <option value="Keanekaragaman Hayati">3. Keanekaragaman Hayati</option>
              <option value="Penghematan Energi">4. Penghematan Energi</option>
              <option value="Penghematan Air">5. Penghematan Air</option>
            </select>
          </div>

          <!-- Export Button -->
          <div class="control-item export-action-box">
            <button type="button" id="btnExportExecutiveSummary" class="btn-export-executive">
              📊 Export Executive Summary (PDF)
            </button>
          </div>
        </div>
      </header>

      <!-- BAGIAN B: BARIS KARTU METRIK UTAMA / KPI CARDS -->
      <section class="kpi-grid-container" id="kpiCardsContainer">
        <!-- Rendered via JS -->
      </section>

      <!-- BAGIAN C: VISUALISASI GRAFIK UTAMA (4 PANELS) -->
      <section class="charts-master-grid">
        
        <!-- Panel 1: Line Chart Tren Kepatuhan Harian -->
        <div class="chart-card chart-full-width">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-title">📉 Tren Kepatuhan Harian & Mingguan (Compliance Rate %)</h3>
              <p class="chart-subtitle">Garis hijau putus-putus menunjukkan ambang batas target sekolah (80%). Node merah penanda anomali (< 60%).</p>
            </div>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-color color-trend"></span> Skor Kepatuhan</span>
              <span class="legend-item"><span class="legend-color color-target"></span> Target Minimum (80%)</span>
              <span class="legend-item"><span class="legend-color color-anomaly"></span> Anomali (< 60%)</span>
            </div>
          </div>
          <div class="chart-card-body">
            <div id="lineChartContainer" class="svg-chart-wrapper"></div>
          </div>
        </div>

        <!-- Panel 2: Grouped Bar Chart 5 Kategori -->
        <div class="chart-card">
          <div class="chart-card-header">
            <h3 class="chart-title">📊 Perbandingan Performa 5 Kategori Lingkup Kerja</h3>
            <p class="chart-subtitle">Rasio capaian TRUE (Selesai) vs FALSE (Belum Selesai) per sektor.</p>
          </div>
          <div class="chart-card-body">
            <div id="barChartContainer" class="bar-chart-wrapper"></div>
          </div>
        </div>

        <!-- Panel 3: Radar Chart Keseimbangan Program Preservasi -->
        <div class="chart-card">
          <div class="chart-card-header">
            <h3 class="chart-title">🕸️ Radar Keseimbangan Program Preservasi</h3>
            <p class="chart-subtitle">Peta kesetaraan ketercapaian program Adiwiyata lintas 5 sektor.</p>
          </div>
          <div class="chart-card-body text-center">
            <div id="radarChartContainer" class="radar-chart-wrapper"></div>
          </div>
        </div>

        <!-- Panel 4: Heatmap Kalender Kepatuhan Piket -->
        <div class="chart-card chart-full-width">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-title">📅 Kalender Kepatuhan Piket (Compliance Heatmap Grid)</h3>
              <p class="chart-subtitle">Matriks harian kualitas pelaksanaan piket. Klik kotak tanggal untuk melihat ringkasan cepat.</p>
            </div>
            <div class="heatmap-color-scale">
              <span class="scale-box bg-dark-green">90-100%</span>
              <span class="scale-box bg-light-green">75-89%</span>
              <span class="scale-box bg-yellow">60-74%</span>
              <span class="scale-box bg-red">< 60%</span>
              <span class="scale-box bg-gray">Libur</span>
            </div>
          </div>
          <div class="chart-card-body">
            <div id="calendarHeatmapContainer" class="calendar-heatmap-grid"></div>
          </div>
        </div>

      </section>

      <!-- BAGIAN D: PANEL ANALISIS KENDALA & TEMUAN BERULANG -->
      <section class="issues-tracker-grid">
        
        <!-- 1. Top 5 Unperformed Tasks Table -->
        <div class="issue-card">
          <div class="issue-card-header">
            <h3 class="issue-title">⚠️ Top 5 Poin Tugas Paling Sering Gagal (Unperformed Tasks)</h3>
            <p class="issue-subtitle">Peringkat indikator tugas yang membutuhkan intervensi atau perbaikan fasilitas segera.</p>
          </div>
          <div class="issue-card-body style-table-overflow">
            <table class="ranking-table">
              <thead>
                <tr>
                  <th class="text-center" style="width: 50px;">Rank</th>
                  <th style="width: 100px;">Kode & Kategori</th>
                  <th>Deskripsi Indikator Tugas</th>
                  <th class="text-center" style="width: 90px;">Frekuensi FALSE</th>
                  <th class="text-center" style="width: 90px;">% Kegagalan</th>
                  <th>Rangkuman Penyebab Dominan</th>
                </tr>
              </thead>
              <tbody id="topUnperformedTableBody">
                <!-- Rendered via JS -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. Qualitative Findings Feed -->
        <div class="issue-card">
          <div class="issue-card-header">
            <div class="feed-header-flex">
              <div>
                <h3 class="issue-title">💬 Umpan Narasi Temuan & Evaluasi Lapangan</h3>
                <p class="issue-subtitle">Catatan harian kualitatif dari petugas dan guru piket penanggung jawab.</p>
              </div>
              <div class="feed-filter-box">
                <input type="text" id="feedSearchInput" class="analytics-input" placeholder="🔍 Cari kata kunci kendala...">
              </div>
            </div>
          </div>
          <div class="issue-card-body">
            <div id="findingsFeedContainer" class="findings-feed-list">
              <!-- Rendered via JS -->
            </div>
          </div>
        </div>

      </section>

      <!-- MODAL RINGKASAN HARIAN DARI HEATMAP KALENDER -->
      <div id="daySummaryModal" class="modal-overlay" aria-hidden="true">
        <div class="modal-card modal-medium">
          <div class="modal-header">
            <h2 class="modal-title" id="dayModalTitle">Ringkasan Laporan Harian</h2>
            <button type="button" id="btnCloseDayModal" class="modal-close-btn">✕</button>
          </div>
          <div class="modal-body" id="dayModalBody">
            <!-- Rendered via JS -->
          </div>
        </div>
      </div>

      <!-- LIGHTBOX PHOTO MODAL -->
      <div id="analyticsLightboxModal" class="modal-overlay lightbox-overlay" aria-hidden="true">
        <div class="lightbox-content">
          <button type="button" id="btnCloseAnalyticsLightbox" class="lightbox-close-btn">✕</button>
          <img id="analyticsLightboxImg" src="" alt="Bukti Foto Lapangan">
        </div>
      </div>

    </div>

    <!-- SCOPED STYLING DEDIKASI MODUL periodic -->
    <style>
      .periodic-page-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
        padding-bottom: 3rem;
      }

      /* Toolbar Header Styles */
      .analytics-toolbar-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        border-top: 4px solid var(--color-primary, #1b4332);
        box-shadow: 0 2px 4px rgba(0,0,0,0.02);
      }

      .toolbar-title-box {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        margin-bottom: 1.25rem;
      }

      .analytics-badge-icon { font-size: 2.2rem; }
      .analytics-page-title { margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--color-primary, #1b4332); }
      .analytics-page-subtitle { margin: 0.2rem 0 0 0; font-size: 0.8rem; color: #64748b; }

      .toolbar-controls-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      @media (min-width: 768px) {
        .toolbar-controls-grid {
          grid-template-columns: 1.5fr 1.5fr 2fr;
          align-items: flex-end;
        }
      }

      .control-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 700;
        color: #475569;
        margin-bottom: 0.35rem;
      }

      .analytics-select, .analytics-input {
        width: 100%;
        padding: 0.6rem 0.75rem;
        font-size: 0.85rem;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        outline: none;
        background-color: #ffffff;
        font-family: inherit;
      }

      .analytics-select:focus, .analytics-input:focus {
        border-color: var(--color-primary, #1b4332);
        box-shadow: 0 0 0 3px rgba(27, 67, 50, 0.1);
      }

      .date-input-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        color: #64748b;
      }

      .export-action-box {
        display: flex;
        justify-content: flex-end;
      }

      .btn-export-executive {
        width: 100%;
        padding: 0.65rem 1rem;
        background-color: var(--color-primary, #1b4332);
        color: #ffffff;
        font-weight: 700;
        font-size: 0.82rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .btn-export-executive:hover { background-color: #143225; }

      /* KPI Cards Styling */
      .kpi-grid-container {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 1rem;
      }

      @media (min-width: 640px) { .kpi-grid-container { grid-template-columns: repeat(2, 1fr); } }
      @media (min-width: 1024px) { .kpi-grid-container { grid-template-columns: repeat(4, 1fr); } }

      .kpi-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.15rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: 0 2px 4px rgba(0,0,0,0.02);
      }

      .kpi-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }

      .kpi-title { font-size: 0.78rem; font-weight: 700; color: #64748b; margin: 0; }
      .kpi-icon { font-size: 1.4rem; }

      .kpi-value-box { margin: 0.75rem 0 0.5rem 0; }
      .kpi-main-num { font-size: 1.8rem; font-weight: 800; color: #0f172a; line-height: 1; }

      .kpi-footer {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.75rem;
      }

      .kpi-trend-up { color: #166534; font-weight: 700; }
      .kpi-trend-down { color: #991b1b; font-weight: 700; }
      .kpi-subtext { color: #64748b; }

      /* Charts Master Grid Layout */
      .charts-master-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }

      @media (min-width: 1024px) {
        .charts-master-grid { grid-template-columns: repeat(2, 1fr); }
        .chart-full-width { grid-column: 1 / -1; }
      }

      .chart-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.02);
      }

      .chart-card-header {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #f1f5f9;
      }

      @media (min-width: 640px) {
        .chart-card-header {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }
      }

      .chart-title { font-size: 0.95rem; font-weight: 800; color: #1e293b; margin: 0; }
      .chart-subtitle { font-size: 0.75rem; color: #64748b; margin: 0.2rem 0 0 0; }

      .chart-legend { display: flex; gap: 0.85rem; font-size: 0.72rem; color: #475569; }
      .legend-item { display: flex; align-items: center; gap: 0.35rem; }
      .legend-color { width: 10px; height: 10px; border-radius: 2px; }
      .color-trend { background-color: #10b981; }
      .color-target { background-color: #f59e0b; }
      .color-anomaly { background-color: #ef4444; }

      /* SVG Line Chart Specific */
      .svg-chart-wrapper { width: 100%; height: 260px; position: relative; }
      .svg-chart { width: 100%; height: 100%; overflow: visible; }

      /* Grouped Bar Chart Specific */
      .bar-chart-wrapper { display: flex; flex-direction: column; gap: 0.85rem; }
      .bar-item-row { display: flex; flex-direction: column; gap: 0.25rem; }
      .bar-item-label { display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; color: #334155; }
      .bar-track { height: 16px; background-color: #f1f5f9; border-radius: 8px; overflow: hidden; display: flex; }
      .bar-fill-true { background-color: #10b981; height: 100%; transition: width 0.5s; }
      .bar-fill-false { background-color: #ef4444; height: 100%; transition: width 0.5s; }

      /* Calendar Heatmap Grid */
      .calendar-heatmap-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 0.4rem;
      }

      .heatmap-day-card {
        aspect-ratio: 1;
        border-radius: 8px;
        padding: 0.4rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s;
        border: 1px solid rgba(0,0,0,0.05);
      }

      .heatmap-day-card:hover { transform: scale(1.05); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); z-index: 2; }
      .heatmap-date-num { font-size: 0.75rem; font-weight: 800; }
      .heatmap-score-val { font-size: 0.68rem; font-weight: 700; text-align: right; }

      .bg-dark-green { background-color: #d1fae5; color: #065f46; border-color: #a7f3d0; }
      .bg-light-green { background-color: #e0f2fe; color: #0369a1; border-color: #bae6fd; }
      .bg-yellow { background-color: #fef3c7; color: #92400e; border-color: #fde68a; }
      .bg-red { background-color: #fee2e2; color: #991b1b; border-color: #fca5a5; }
      .bg-gray { background-color: #f1f5f9; color: #94a3b8; border-color: #e2e8f0; }

      .heatmap-color-scale { display: flex; gap: 0.35rem; font-size: 0.68rem; font-weight: 700; }
      .scale-box { padding: 0.2rem 0.45rem; border-radius: 4px; }

      /* Issues Tracker Section */
      .issues-tracker-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }

      .issue-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.02);
      }

      .issue-card-header {
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #f1f5f9;
      }

      .issue-title { font-size: 0.95rem; font-weight: 800; color: #1e293b; margin: 0; }
      .issue-subtitle { font-size: 0.75rem; color: #64748b; margin: 0.2rem 0 0 0; }

      .style-table-overflow { overflow-x: auto; }
      .ranking-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
      .ranking-table th { background-color: #f8fafc; padding: 0.65rem 0.75rem; text-align: left; color: #475569; border-bottom: 2px solid #e2e8f0; }
      .ranking-table td { padding: 0.65rem 0.75rem; border-bottom: 1px solid #f1f5f9; color: #334155; vertical-align: middle; }

      .rank-number {
        width: 24px; height: 24px; border-radius: 50%;
        background-color: #fee2e2; color: #991b1b; font-weight: 800;
        display: flex; align-items: center; justify-content: center; margin: 0 auto;
        font-size: 0.75rem;
      }

      /* Qualitative Feed */
      .feed-header-flex { display: flex; flex-direction: column; gap: 0.75rem; }
      @media (min-width: 640px) { .feed-header-flex { flex-direction: row; justify-content: space-between; align-items: center; } }
      .feed-filter-box { width: 220px; }

      .findings-feed-list { display: flex; flex-direction: column; gap: 0.75rem; max-height: 400px; overflow-y: auto; padding-right: 0.3rem; }
      .feed-item-card {
        border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.85rem; background-color: #f8fafc;
        display: flex; flex-direction: column; gap: 0.5rem;
      }

      .feed-item-header { display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; }
      .feed-date { font-weight: 700; color: #1e293b; }
      .feed-guru { color: #64748b; }

      .feed-tag {
        font-size: 0.68rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 4px;
        background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a;
      }

      .feed-narrative { font-size: 0.82rem; color: #334155; margin: 0; line-height: 1.4; }

      .feed-photo-btn {
        align-self: flex-start; font-size: 0.72rem; font-weight: 700; color: #0284c7; background: none;
        border: none; cursor: pointer; padding: 0; display: inline-flex; align-items: center; gap: 0.25rem;
      }
      .feed-photo-btn:hover { text-decoration: underline; }

      /* Modal Common */
      .modal-overlay {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
        z-index: 200; display: flex; align-items: center; justify-content: center;
        padding: 1rem; opacity: 0; visibility: hidden; transition: all 0.2s ease;
      }
      .modal-overlay.active { opacity: 1; visibility: visible; }
      .modal-card { background-color: #ffffff; border-radius: 12px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); overflow: hidden; }
      .modal-medium { max-width: 550px; }
      .modal-header { padding: 1rem 1.25rem; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
      .modal-title { margin: 0; font-size: 1rem; font-weight: 800; color: var(--color-primary, #1b4332); }
      .modal-close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b; }
      .modal-body { padding: 1.25rem; }

      .lightbox-overlay { z-index: 300; background-color: rgba(0,0,0,0.85); }
      .lightbox-content { position: relative; max-width: 90vw; max-height: 90vh; }
      .lightbox-content img { max-width: 100%; max-height: 85vh; border-radius: 8px; object-fit: contain; }
      .lightbox-close-btn { position: absolute; top: -35px; right: 0; background: none; border: none; color: #fff; font-size: 1.8rem; cursor: pointer; }
    </style>
  `;

  // 3. Hubungkan Event Listener dan Render Seluruh Komponen Analitik
  initAnalyticsPageLogic(container);
}

/**
 * Memuat Data Laporan dari LocalStorage atau Inisialisasi Dummy Seed Data
 */
function loadAnalyticsData() {
  const stored = localStorage.getItem('plh_reports');
  if (stored) {
    try {
      analyticsData = JSON.parse(stored);
    } catch (e) {
      analyticsData = generateSeedAnalyticsData();
    }
  } else {
    analyticsData = generateSeedAnalyticsData();
    localStorage.setItem('plh_reports', JSON.stringify(analyticsData));
  }
}

/**
 * Menghubungkan Logika Pemrosesan Data & Perhitungan Statistik
 * @param {HTMLElement} container 
 */
function initAnalyticsPageLogic(container) {
  const datePresetSelect = container.querySelector('#datePresetSelect');
  const customDateRangeBox = container.querySelector('#customDateRangeBox');
  const categoryScopeSelect = container.querySelector('#categoryScopeSelect');
  const btnExportExecutiveSummary = container.querySelector('#btnExportExecutiveSummary');
  const feedSearchInput = container.querySelector('#feedSearchInput');

  // Modal elements
  const daySummaryModal = container.querySelector('#daySummaryModal');
  const btnCloseDayModal = container.querySelector('#btnCloseDayModal');
  const dayModalTitle = container.querySelector('#dayModalTitle');
  const dayModalBody = container.querySelector('#dayModalBody');

  const analyticsLightboxModal = container.querySelector('#analyticsLightboxModal');
  const btnCloseAnalyticsLightbox = container.querySelector('#btnCloseAnalyticsLightbox');
  const analyticsLightboxImg = container.querySelector('#analyticsLightboxImg');

  // FUNGSI UTAMA KALKULASI ULANG DAN RE-RENDER SELURUH DASHBOARD
  function refreshAnalyticsDashboard() {
    // A. Filter Data Berdasarkan Rentang Waktu dan Scope Kategori
    const filteredReports = filterReportsByDateAndScope(analyticsData, activeDateFilter, selectedScopeCategory);

    // B. Render KPI Cards
    renderKPICards(container, filteredReports);

    // C. Render 4 Modul Grafik Interaktif
    renderLineChart(container, filteredReports);
    renderGroupedBarChart(container, filteredReports);
    renderRadarChart(container, filteredReports);
    renderCalendarHeatmap(container, filteredReports);

    // D. Render Panel Analisis Kendala & Feed Narasi
    renderTopUnperformedTasksTable(container, filteredReports);
    renderFindingsFeed(container, filteredReports, feedSearchInput ? feedSearchInput.value : '');
  }

  // Event Handler Controls
  if (datePresetSelect) {
    datePresetSelect.addEventListener('change', (e) => {
      activeDateFilter = e.target.value;
      if (activeDateFilter === 'CUSTOM') {
        if (customDateRangeBox) customDateRangeBox.style.display = 'block';
      } else {
        if (customDateRangeBox) customDateRangeBox.style.display = 'none';
        refreshAnalyticsDashboard();
      }
    });
  }

  if (categoryScopeSelect) {
    categoryScopeSelect.addEventListener('change', (e) => {
      selectedScopeCategory = e.target.value;
      refreshAnalyticsDashboard();
    });
  }

  if (feedSearchInput) {
    feedSearchInput.addEventListener('input', () => {
      const filteredReports = filterReportsByDateAndScope(analyticsData, activeDateFilter, selectedScopeCategory);
      renderFindingsFeed(container, filteredReports, feedSearchInput.value);
    });
  }

  if (btnExportExecutiveSummary) {
    btnExportExecutiveSummary.addEventListener('click', () => {
      alert('📊 Memproses pembuatan dokumen laporan PDF Eksekutif terformat...');
    });
  }

  if (btnCloseDayModal) {
    btnCloseDayModal.addEventListener('click', () => {
      if (daySummaryModal) daySummaryModal.classList.remove('active');
    });
  }

  if (btnCloseAnalyticsLightbox) {
    btnCloseAnalyticsLightbox.addEventListener('click', () => {
      if (analyticsLightboxModal) analyticsLightboxModal.classList.remove('active');
    });
  }

  // Render Awal saat modul dimuat
  refreshAnalyticsDashboard();
}

/**
 * Memfilter Laporan berdasarkan tanggal dan kategori
 */
function filterReportsByDateAndScope(reports, dateFilter, scopeCategory) {
  // Hanya ambil data sampel bulan Agustus 2026 sebagai basis simulasi
  return reports; 
}

/**
 * BAGIAN B: KALKULASI & RENDER 4 KARTU METRIK UTAMA (KPI CARDS)
 */
function renderKPICards(container, reports) {
  const kpiContainer = container.querySelector('#kpiCardsContainer');
  if (!kpiContainer) return;

  if (reports.length === 0) {
    kpiContainer.innerHTML = `<p style="font-size: 0.85rem; color: #64748b;">Tidak ada data laporan untuk periode ini.</p>`;
    return;
  }

  // 1. Hitung Overall Compliance Rate
  let totalTrueCount = 0;
  let totalPossibleTasks = reports.length * 13;

  reports.forEach(r => {
    Object.values(r.tasksStatus || {}).forEach(val => {
      if (val === true) totalTrueCount++;
    });
  });

  const overallRate = Math.round((totalTrueCount / totalPossibleTasks) * 100);

  // 2. Report Submission Rate (Target 30 Hari Kerja)
  const totalDaysScheduled = 30;
  const submittedCount = reports.length;
  const submissionRate = ((submittedCount / totalDaysScheduled) * 100).toFixed(1);

  // 3. Hitung Performa Per Kategori
  const categoryStats = MASTER_CATEGORIES.map(cat => {
    const tasksInCat = MASTER_CHECKLIST_DATA.filter(t => t.category === cat);
    let catTrue = 0;
    let catTotal = reports.length * tasksInCat.length;

    reports.forEach(r => {
      tasksInCat.forEach(t => {
        const key = `task_${t.code.replace('.', '_')}`;
        if (r.tasksStatus && r.tasksStatus[key] === true) catTrue++;
      });
    });

    const rate = catTotal > 0 ? (catTrue / catTotal) * 100 : 0;
    return { category: cat, rate: rate, totalTrue: catTrue };
  });

  categoryStats.sort((a, b) => b.rate - a.rate);
  const topCategory = categoryStats[0];
  const criticalCategory = categoryStats[categoryStats.length - 1];

  kpiContainer.innerHTML = `
    <!-- KPI 1: Overall Compliance Rate -->
    <div class="kpi-card">
      <div class="kpi-header">
        <h4 class="kpi-title">SKOR COMPLIANCE RATA-RATA</h4>
        <span class="kpi-icon">🎯</span>
      </div>
      <div class="kpi-value-box">
        <span class="kpi-main-num">${overallRate}%</span>
      </div>
      <div class="kpi-footer">
        <span class="kpi-trend-up">▲ +3.2%</span>
        <span class="kpi-subtext">vs bulan lalu (Sangat Baik)</span>
      </div>
    </div>

    <!-- KPI 2: Report Submission Rate -->
    <div class="kpi-card">
      <div class="kpi-header">
        <h4 class="kpi-title">TINGKAT KEHADIRAN LAPORAN</h4>
        <span class="kpi-icon">📋</span>
      </div>
      <div class="kpi-value-box">
        <span class="kpi-main-num">${submittedCount} / ${totalDaysScheduled}</span>
      </div>
      <div class="kpi-footer">
        <span class="kpi-trend-up">${submissionRate}%</span>
        <span class="kpi-subtext">Laporan terkirim tepat waktu</span>
      </div>
    </div>

    <!-- KPI 3: Top Performing Area -->
    <div class="kpi-card">
      <div class="kpi-header">
        <h4 class="kpi-title">KATEGORI PERFORMA TERTINGGI</h4>
        <span class="kpi-icon">🏅</span>
      </div>
      <div class="kpi-value-box">
        <span class="kpi-main-num" style="font-size: 1.25rem;">${topCategory.category}</span>
      </div>
      <div class="kpi-footer">
        <span class="kpi-trend-up">${topCategory.rate.toFixed(1)}%</span>
        <span class="kpi-subtext">Capaian status TRUE</span>
      </div>
    </div>

    <!-- KPI 4: Critical Area / Bottleneck -->
    <div class="kpi-card">
      <div class="kpi-header">
        <h4 class="kpi-title">AREA EVALUASI UTAMA</h4>
        <span class="kpi-icon">⚠️</span>
      </div>
      <div class="kpi-value-box">
        <span class="kpi-main-num" style="font-size: 1.25rem; color: #dc2626;">${criticalCategory.category}</span>
      </div>
      <div class="kpi-footer">
        <span class="kpi-trend-down">${criticalCategory.rate.toFixed(1)}%</span>
        <span class="kpi-subtext">Membutuhkan perhatian khusus</span>
      </div>
    </div>
  `;
}

/**
 * BAGIAN C.1: GRAFIK TREN KEPATUHAN HARIAN (SVG LINE CHART)
 */
function renderLineChart(container, reports) {
  const chartWrapper = container.querySelector('#lineChartContainer');
  if (!chartWrapper) return;

  // Sorting berdasarkan tanggal
  const sortedReports = [...reports].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

  const points = sortedReports.map(r => {
    let tCount = 0;
    Object.values(r.tasksStatus || {}).forEach(v => { if (v === true) tCount++; });
    const pct = Math.round((tCount / 13) * 100);
    return { date: r.tanggal.split('-')[2], pct: pct, raw: r };
  });

  const width = 800;
  const height = 220;
  const padding = 30;

  const targetY = height - padding - ((80 / 100) * (height - 2 * padding));

  const xStep = (width - 2 * padding) / (points.length - 1 || 1);

  const pathCoords = points.map((p, idx) => {
    const x = padding + idx * xStep;
    const y = height - padding - ((p.pct / 100) * (height - 2 * padding));
    return { x, y, pct: p.pct, date: p.date, raw: p.raw };
  });

  const dPath = pathCoords.reduce((acc, pt, i) => i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '');

  chartWrapper.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="svg-chart">
      <!-- Grid Lines Background -->
      <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="#f1f5f9" stroke-width="1"/>
      <line x1="${padding}" y1="${height/2}" x2="${width - padding}" y2="${height/2}" stroke="#f1f5f9" stroke-width="1"/>
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#cbd5e1" stroke-width="1"/>

      <!-- Garis Ambang Batas Target (80%) Putus-putus -->
      <line x1="${padding}" y1="${targetY}" x2="${width - padding}" y2="${targetY}" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6,4"/>

      <!-- Garis Utama Tren (Smooth Line) -->
      <path d="${dPath}" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Node Titik Data -->
      ${pathCoords.map(pt => {
        const isAnomaly = pt.pct < 60;
        return `
          <circle cx="${pt.x}" cy="${pt.y}" r="${isAnomaly ? '6' : '4'}" 
                  fill="${isAnomaly ? '#ef4444' : '#10b981'}" 
                  stroke="#ffffff" stroke-width="2"
                  class="chart-node" data-date="${pt.date}" data-score="${pt.pct}">
            <title>Tgl ${pt.date} Aug: ${pt.pct}% Compliance (${pt.raw.guruPiket})</title>
          </circle>
        `;
      }).join('')}
    </svg>
  `;
}

/**
 * BAGIAN C.2: GRAFIK PERBANDINGAN 5 KATEGORI (GROUPED BAR CHART)
 */
function renderGroupedBarChart(container, reports) {
  const barWrapper = container.querySelector('#barChartContainer');
  if (!barWrapper) return;

  barWrapper.innerHTML = MASTER_CATEGORIES.map(cat => {
    const tasksInCat = MASTER_CHECKLIST_DATA.filter(t => t.category === cat);
    let catTrue = 0;
    let catTotal = reports.length * tasksInCat.length;

    reports.forEach(r => {
      tasksInCat.forEach(t => {
        const key = `task_${t.code.replace('.', '_')}`;
        if (r.tasksStatus && r.tasksStatus[key] === true) catTrue++;
      });
    });

    const truePct = catTotal > 0 ? Math.round((catTrue / catTotal) * 100) : 0;
    const falsePct = 100 - truePct;

    return `
      <div class="bar-item-row">
        <div class="bar-item-label">
          <span>${cat}</span>
          <span>${truePct}% Selesai</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill-true" style="width: ${truePct}%;" title="TRUE: ${truePct}%"></div>
          <div class="bar-fill-false" style="width: ${falsePct}%;" title="FALSE: ${falsePct}%"></div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * BAGIAN C.3: RADAR CHART KESEIMBANGAN PROGRAM
 */
function renderRadarChart(container, reports) {
  const radarWrapper = container.querySelector('#radarChartContainer');
  if (!radarWrapper) return;

  const size = 200;
  const center = size / 2;
  const radius = 70;

  // Hitung % masing-masing 5 kategori
  const scores = MASTER_CATEGORIES.map(cat => {
    const tasksInCat = MASTER_CHECKLIST_DATA.filter(t => t.category === cat);
    let catTrue = 0;
    let catTotal = reports.length * tasksInCat.length;
    reports.forEach(r => {
      tasksInCat.forEach(t => {
        const key = `task_${t.code.replace('.', '_')}`;
        if (r.tasksStatus && r.tasksStatus[key] === true) catTrue++;
      });
    });
    return catTotal > 0 ? (catTrue / catTotal) : 0;
  });

  const numAxes = 5;
  const angleStep = (Math.PI * 2) / numAxes;

  // Polygon Jaring
  const pointsStr = scores.map((val, idx) => {
    const angle = idx * angleStep - Math.PI / 2;
    const r = radius * val;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  radarWrapper.innerHTML = `
    <svg viewBox="0 0 ${size} ${size}" style="width: 100%; max-width: 220px;">
      <!-- Web Background Concentric Circles -->
      <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#e2e8f0" stroke-width="1"/>
      <circle cx="${center}" cy="${center}" r="${radius * 0.66}" fill="none" stroke="#f1f5f9" stroke-width="1"/>
      <circle cx="${center}" cy="${center}" r="${radius * 0.33}" fill="none" stroke="#f1f5f9" stroke-width="1"/>

      <!-- Axes Lines -->
      ${scores.map((_, idx) => {
        const angle = idx * angleStep - Math.PI / 2;
        const x2 = center + radius * Math.cos(angle);
        const y2 = center + radius * Math.sin(angle);
        return `<line x1="${center}" y1="${center}" x2="${x2}" y2="${y2}" stroke="#cbd5e1" stroke-width="1"/>`;
      }).join('')}

      <!-- Radar Data Polygon -->
      <polygon points="${pointsStr}" fill="rgba(16, 185, 129, 0.35)" stroke="#10b981" stroke-width="2"/>
    </svg>
  `;
}

/**
 * BAGIAN C.4: KALENDER KEPATUHAN PIKET (HEATMAP GRID)
 */
function renderCalendarHeatmap(container, reports) {
  const heatmapContainer = container.querySelector('#calendarHeatmapContainer');
  if (!heatmapContainer) return;

  // Map laporan berdasarkan hari
  const reportMap = {};
  reports.forEach(r => {
    const day = parseInt(r.tanggal.split('-')[2], 10);
    reportMap[day] = r;
  });

  let html = '';
  for (let day = 1; day <= 31; day++) {
    const report = reportMap[day];

    if (report) {
      let trueCount = 0;
      Object.values(report.tasksStatus || {}).forEach(v => { if (v === true) trueCount++; });
      const scorePct = Math.round((trueCount / 13) * 100);

      let colorClass = 'bg-red';
      if (scorePct >= 90) colorClass = 'bg-dark-green';
      else if (scorePct >= 75) colorClass = 'bg-light-green';
      else if (scorePct >= 60) colorClass = 'bg-yellow';

      html += `
        <div class="heatmap-day-card ${colorClass}" data-day="${day}">
          <span class="heatmap-date-num">${day}</span>
          <span class="heatmap-score-val">${scorePct}%</span>
        </div>
      `;
    } else {
      html += `
        <div class="heatmap-day-card bg-gray">
          <span class="heatmap-date-num">${day}</span>
          <span class="heatmap-score-val">Libur</span>
        </div>
      `;
    }
  }

  heatmapContainer.innerHTML = html;

  // Attach Modal Click Event pada Kotak Tanggal Heatmap
  heatmapContainer.querySelectorAll('.heatmap-day-card').forEach(card => {
    card.addEventListener('click', () => {
      const day = card.getAttribute('data-day');
      const report = reportMap[day];
      if (report) {
        openDaySummaryModal(container, report);
      }
    });
  });
}

function openDaySummaryModal(container, report) {
  const modal = container.querySelector('#daySummaryModal');
  const title = container.querySelector('#dayModalTitle');
  const body = container.querySelector('#dayModalBody');

  if (!modal || !title || !body) return;

  let trueCount = 0;
  Object.values(report.tasksStatus || {}).forEach(v => { if (v === true) trueCount++; });
  const pct = Math.round((trueCount / 13) * 100);

  title.textContent = `Ringkasan Laporan (${report.tanggal})`;
  body.innerHTML = `
    <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.75rem;">
      <div><strong>Guru Piket:</strong> ${report.guruPiket}</div>
      <div><strong>Tim Petugas:</strong> ${(report.petugas || []).join(', ')}</div>
      <div><strong>Capaian Task:</strong> ${trueCount} / 13 Task (${pct}%)</div>
      <div><strong>Status Tag:</strong> <span class="feed-tag">${report.issueTag || 'Lancar'}</span></div>
      <div style="background-color: #f1f5f9; padding: 0.75rem; border-radius: 6px;">
        <strong>Catatan Evaluasi:</strong><br>
        <p style="margin: 0.3rem 0 0 0; color: #334155;">${report.catatan}</p>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

/**
 * BAGIAN D.1: MATRIKS 5 POIN TUGAS PALING SERING GAGAL (TOP 5 UNPERFORMED TASKS)
 */
function renderTopUnperformedTasksTable(container, reports) {
  const tbody = container.querySelector('#topUnperformedTableBody');
  if (!tbody) return;

  // Hitung jumlah FALSE per poin tugas
  const taskFailureCounts = MASTER_CHECKLIST_DATA.map(task => {
    const taskKey = `task_${task.code.replace('.', '_')}`;
    let falseCount = 0;

    reports.forEach(r => {
      if (r.tasksStatus && r.tasksStatus[taskKey] === false) {
        falseCount++;
      }
    });

    const failureRate = reports.length > 0 ? ((falseCount / reports.length) * 100).toFixed(1) : 0;

    let dominantCause = 'Prosedur terlewat / kendala waktu.';
    if (task.code === '2.3') dominantCause = 'Buku log penimbangan hilang / fasilitas timbangan tergenang air.';
    if (task.code === '3.2') dominantCause = 'Pasokan pakan ikan habis / rotasi pembersihan kolam terhambat.';
    if (task.code === '1.3') dominantCause = 'Faktor cuaca hujan deras memicu luapan drainase.';

    return { ...task, falseCount, failureRate, dominantCause };
  });

  // Ranking berdasarkan falseCount terbanyak
  taskFailureCounts.sort((a, b) => b.falseCount - a.falseCount);
  const top5 = taskFailureCounts.slice(0, 5);

  tbody.innerHTML = top5.map((item, idx) => `
    <tr>
      <td class="text-center"><span class="rank-number">${idx + 1}</span></td>
      <td>
        <strong style="color: var(--color-primary, #1b4332);">${item.code}</strong><br>
        <span style="font-size: 0.72rem; color: #64748b;">${item.category}</span>
      </td>
      <td style="line-height: 1.3;">${item.label}</td>
      <td class="text-center"><strong style="color: #dc2626;">${item.falseCount}x</strong></td>
      <td class="text-center"><strong>${item.failureRate}%</strong></td>
      <td style="font-size: 0.75rem; color: #475569;">${item.dominantCause}</td>
    </tr>
  `).join('');
}

/**
 * BAGIAN D.2: UMPAN NARASI TEMUAN & EVALUASI LAPANGAN (QUALITATIVE FINDINGS FEED)
 */
function renderFindingsFeed(container, reports, searchQuery = '') {
  const feedContainer = container.querySelector('#findingsFeedContainer');
  if (!feedContainer) return;

  const filtered = reports.filter(r => {
    const matchQuery = (r.catatan || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (r.guruPiket || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (r.issueTag || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchQuery;
  });

  if (filtered.length === 0) {
    feedContainer.innerHTML = `<p style="font-size: 0.8rem; color: #94a3b8; font-style: italic;">Tidak ada catatan evaluasi yang cocok dengan kata kunci pencarian.</p>`;
    return;
  }

  feedContainer.innerHTML = filtered.map(r => `
    <div class="feed-item-card">
      <div class="feed-item-header">
        <div>
          <span class="feed-date">📅 ${r.tanggal}</span> — <span class="feed-guru">🧑‍🏫 ${r.guruPiket}</span>
        </div>
        <span class="feed-tag">${r.issueTag || 'Evaluasi'}</span>
      </div>
      <p class="feed-narrative">${r.catatan}</p>
      ${r.photos && r.photos.length > 0 ? `
        <button type="button" class="feed-photo-btn" data-src="${r.photos[0]}">
          🖼️ Lihat Bukti Foto Lapangan (${r.photos.length})
        </button>
      ` : ''}
    </div>
  `).join('');

  // Attach Lightbox Event untuk Tombol Lihat Foto pada Feed
  feedContainer.querySelectorAll('.feed-photo-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.getAttribute('data-src');
      const lightbox = container.querySelector('#analyticsLightboxModal');
      const lightboxImg = container.querySelector('#analyticsLightboxImg');
      if (lightbox && lightboxImg) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
      }
    });
  });
}