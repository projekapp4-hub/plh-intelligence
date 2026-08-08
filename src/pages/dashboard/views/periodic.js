/**
 * PERIODIC.JS - Modul Dashboard Analitik, Rekapitulasi & Tren Compliance
 * Path: src/pages/dashboard/views/periodic.js
 * 
 * Modul analitik eksekutif Vanilla JS murni untuk pemantauan tren kepatuhan,
 * distribusi performa kategori, kalender heatmap harian, serta pelacakan kendala Adiwiyata.
 * Terhubung secara penuh dengan IndexedDB (storage.js) & PDF Generator Utility (createPDF.js).
 */

import { getAllItems, seedMockData } from '../../../utils/storage.js';
import { generatePDFReport } from '../../../utils/createPDF.js';

// ============================================================================
// 1. KAMUS PEMETAAN CHECKLIST LOKAL (LOCAL CHECKLIST MAPPER) & MASTER DATA
// ============================================================================
const CHECKLIST_MAPPER = {
  cat_1: {
    name: "Kebersihan & Sanitasi",
    tasks: {
      task_1_1: "Pembersihan Toilet & Wastafel",
      task_1_2: "Ketersediaan Sabun & Air Clean",
      task_1_3: "Drainase & Bebas Genangan Air"
    }
  },
  cat_2: {
    name: "Pengelolaan Sampah & Kompos",
    tasks: {
      task_2_1: "Pemilahan Sampah Organik & Anorganik",
      task_2_2: "Pengosongan Tempat Sampah Kelas",
      task_2_3: "Pengolahan Komposter & Fermentasi",
      task_2_4: "Pencatatan Penimbangan Bank Sampah"
    }
  },
  cat_3: {
    name: "Penghijauan & Pemeliharaan Tanaman",
    tasks: {
      task_3_1: "Penyiraman Tanaman & Greenhouse",
      task_3_2: "Pembersihan Gulma & Penataan Pot",
      task_3_3: "Perawatan Tanaman Obat Keluarga (TOGA)"
    }
  },
  cat_4: {
    name: "Konservasi & Hemat Energi",
    tasks: {
      task_4_1: "Mematikan Lampu & Elektronik Pasca KBM"
    }
  },
  cat_5: {
    name: "Konservasi Air & Drainase",
    tasks: {
      task_5_1: "Pemeriksaan Kebocoran Keran Air",
      task_5_2: "Pemeliharaan Biopori & Sumur Resapan"
    }
  }
};

const MASTER_CATEGORIES = [
  'Kebersihan & Sanitasi',
  'Pengelolaan Sampah & Kompos',
  'Penghijauan & Pemeliharaan Tanaman',
  'Konservasi & Hemat Energi',
  'Konservasi Air & Drainase'
];

const MASTER_CHECKLIST_DATA = [
  { code: '1.1', catKey: 'cat_1', category: 'Kebersihan & Sanitasi', label: 'Pembersihan Toilet & Wastafel' },
  { code: '1.2', catKey: 'cat_1', category: 'Kebersihan & Sanitasi', label: 'Ketersediaan Sabun & Air Clean' },
  { code: '1.3', catKey: 'cat_1', category: 'Kebersihan & Sanitasi', label: 'Drainase & Bebas Genangan Air' },
  { code: '2.1', catKey: 'cat_2', category: 'Pengelolaan Sampah & Kompos', label: 'Pemilahan Sampah Organik & Anorganik' },
  { code: '2.2', catKey: 'cat_2', category: 'Pengelolaan Sampah & Kompos', label: 'Pengosongan Tempat Sampah Kelas' },
  { code: '2.3', catKey: 'cat_2', category: 'Pengelolaan Sampah & Kompos', label: 'Pengolahan Komposter & Fermentasi' },
  { code: '2.4', catKey: 'cat_2', category: 'Pengelolaan Sampah & Kompos', label: 'Pencatatan Penimbangan Bank Sampah' },
  { code: '3.1', catKey: 'cat_3', category: 'Penghijauan & Pemeliharaan Tanaman', label: 'Penyiraman Tanaman & Greenhouse' },
  { code: '3.2', catKey: 'cat_3', category: 'Penghijauan & Pemeliharaan Tanaman', label: 'Pembersihan Gulma & Penataan Pot' },
  { code: '3.3', catKey: 'cat_3', category: 'Penghijauan & Pemeliharaan Tanaman', label: 'Perawatan Tanaman Obat Keluarga (TOGA)' },
  { code: '4.1', catKey: 'cat_4', category: 'Konservasi & Hemat Energi', label: 'Mematikan Lampu & Elektronik Pasca KBM' },
  { code: '5.1', catKey: 'cat_5', category: 'Konservasi Air & Drainase', label: 'Pemeriksaan Kebocoran Keran Air' },
  { code: '5.2', catKey: 'cat_5', category: 'Konservasi Air & Drainase', label: 'Pemeliharaan Biopori & Sumur Resapan' }
];

// ============================================================================
// 2. STATE GLOBAL MODUL
// ============================================================================
let analyticsData = [];
let selectedScopeCategory = 'ALL';
let activeDateFilter = 'BULAN_INI';

// ============================================================================
// 3. HELPER UTILITAS INTERNAL & DATA LAYER
// ============================================================================

/**
 * Menyaring koleksi laporan berdasarkan rentang tanggal inklusif secara lokal.
 * 
 * @param {Array<Object>} reports - Array data laporan lengkap
 * @param {string} startDate - Tanggal awal "YYYY-MM-DD"
 * @param {string} endDate - Tanggal akhir "YYYY-MM-DD"
 * @returns {Array<Object>}
 */
function filterReportsByDateRange(reports = [], startDate, endDate) {
  if (!startDate || !endDate || !Array.isArray(reports) || reports.length === 0) {
    return reports || [];
  }

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (isNaN(start) || isNaN(end)) return reports;

  return reports.filter((report) => {
    if (!report.tanggal) return false;
    const reportTime = new Date(report.tanggal).getTime();
    return reportTime >= start && reportTime <= end;
  });
}

/**
 * Mengubah elemen DOM berdasarkan objek parameter data KPI
 * 
 * @param {Object} data - Objek nilai hasil kalkulasi KPI
 */
function updateKPIDOM(data) {
  const elCompliance = document.getElementById('kpi-compliance-score');
  const elTrend = document.getElementById('kpi-compliance-trend');
  const elTopTitle = document.getElementById('kpi-top-title');
  const elTopSub = document.getElementById('kpi-top-sub');
  const elTopScore = document.getElementById('kpi-top-score');
  const elBottleneckTitle = document.getElementById('kpi-bottleneck-title');
  const elBottleneckSub = document.getElementById('kpi-bottleneck-sub');
  const elBottleneckScore = document.getElementById('kpi-bottleneck-score');
  const elBottleneckBadge = document.getElementById('kpi-bottleneck-badge');

  if (elCompliance) elCompliance.textContent = data.complianceScore;
  
  if (elTrend) {
    elTrend.textContent = data.complianceTrend;
    elTrend.className = `kpi-trend-badge ${data.complianceTrendClass || 'kpi-trend-neutral'}`;
  }

  if (elTopTitle) elTopTitle.textContent = data.topPerformanceTitle;
  if (elTopSub) elTopSub.textContent = data.topPerformanceSub;
  if (elTopScore) elTopScore.textContent = data.topPerformanceScore;

  if (elBottleneckTitle) elBottleneckTitle.textContent = data.bottleneckTitle;
  if (elBottleneckSub) elBottleneckSub.textContent = data.bottleneckSub;
  if (elBottleneckScore) elBottleneckScore.textContent = data.bottleneckScore;

  if (elBottleneckBadge) {
    elBottleneckBadge.textContent = data.bottleneckStatus;
    
    // Perbarui penamaan kelas status untuk pewarnaan CSS
    elBottleneckBadge.classList.remove('status-critical', 'status-warning', 'status-optimal');
    if (data.bottleneckStatus === 'Critical Bottleneck') {
      elBottleneckBadge.classList.add('status-critical');
    } else if (data.bottleneckStatus === 'Perlu Pemeliharaan') {
      elBottleneckBadge.classList.add('status-warning');
    } else {
      elBottleneckBadge.classList.add('status-optimal');
    }
  }
}

/**
 * Membangun data simulasi acak terstruktur jika penyimpanan lokal kosong.
 */
function generateSeedAnalyticsData() {
  const reports = [];
  const guruNames = ['Ahmad Fauzi, S.Pd.', 'Siti Nurhaliza, S.T.', 'Hendro Utomo, M.Pd.', 'Ratna Sari, M.Si.', 'Bambang Wijaya, S.Pd.'];
  const petugasPool = ['Muhammad Zaki', 'Aisyah Putri', 'Rizky Pratama', 'Budi Santoso', 'Dewi Lestari', 'Fajar Ramadhan', 'Rina Kusuma', 'Hadi Wijaya'];

  for (let i = 1; i <= 31; i++) {
    const currentDate = new Date(2026, 7, i); // Agustus 2026
    
    // Lewati hari Minggu (Hari libur)
    if (currentDate.getDay() === 0) continue; 

    const dayFormatted = String(i).padStart(2, '0');
    const dateStr = `2026-08-${dayFormatted}`;
    
    // Anomali buatan untuk pengujian chart: Tanggal 12 dan 22 memiliki skor rendah (<60%)
    const isAnomaly = (i === 12 || i === 22);

    const checklist = {};
    const tasksStatus = {};

    MASTER_CHECKLIST_DATA.forEach(task => {
      const taskKey = `task_${task.code.replace('.', '_')}`;
      let isTrue = false;

      if (isAnomaly) {
        isTrue = Math.random() < 0.35;
      } else {
        if (task.code === '2.4') {
          isTrue = Math.random() < 0.50;
        } else if (task.code === '3.2') {
          isTrue = Math.random() < 0.60;
        } else {
          isTrue = Math.random() < 0.92;
        }
      }

      checklist[taskKey] = isTrue ? 'TRUE' : 'FALSE';
      tasksStatus[taskKey] = isTrue;
    });

    let catatan = `Pelaksanaan piket kebersihan dan preservasi pada tanggal ${dateStr} berjalan sesuai dengan SOP.`;
    let issueTag = 'Lancar';

    if (isAnomaly) {
      catatan = `Kendala utama: Hujan deras berkepanjangan memicu genangan air di drainase utama dan fasilitas penimbangan sampah rusak tergenang.`;
      issueTag = 'Faktor Cuaca & Kerusakan Alat';
    } else if (checklist['task_2_4'] === 'FALSE') {
      catatan = `Proses penimbangan sampah (2.4) terlewat karena buku catatan log harian sedang digunakan untuk rekapitulasi tim bank sampah pusat.`;
      issueTag = 'Administrasi / Alat';
    } else if (checklist['task_5_1'] === 'FALSE') {
      catatan = `Ditemukan kebocoran saluran pipa keran wudhu putri lantai 1. Telah dilaporkan ke unit Sarpras sekolah.`;
      issueTag = 'Masalah Fasilitas Air';
    }

    let trueCount = 0;
    Object.values(tasksStatus).forEach(v => { if (v === true) trueCount++; });
    const scorePercent = Math.round((trueCount / MASTER_CHECKLIST_DATA.length) * 100);

    reports.push({
      id: `REP-202608${dayFormatted}-${String(i).padStart(2, '0')}`,
      tanggal: dateStr,
      createdAt: new Date(dateStr).toISOString(),
      scorePercent: scorePercent,
      guruPiket: guruNames[i % guruNames.length],
      petugas: [
        petugasPool[i % petugasPool.length],
        petugasPool[(i + 1) % petugasPool.length],
        petugasPool[(i + 2) % petugasPool.length]
      ],
      checklist: checklist,
      tasksStatus: tasksStatus,
      catatanEvaluasi: catatan,
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

/**
 * Pemuatan Data Asinkron dari IndexedDB (storage.js) Store "dss_records"
 */
async function loadAnalyticsData() {
  try {
    let reports = await getAllItems('dss_records');

    if (!reports || reports.length === 0) {
      console.log('[periodic.js] Storage dss_records kosong. Menginisialisasi seed mock data...');
      const seedData = generateSeedAnalyticsData();
      await seedMockData(seedData, true);
      reports = await getAllItems('dss_records');
    }

    // Memastikan atribut checklist terisi jika data dari IDB belum memilikinya
    reports.forEach(report => {
      if (!report.checklist && report.tasksStatus) {
        report.checklist = {};
        Object.keys(report.tasksStatus).forEach(k => {
          report.checklist[k] = report.tasksStatus[k] ? 'TRUE' : 'FALSE';
        });
      }
      if (!report.catatanEvaluasi && report.catatan) {
        report.catatanEvaluasi = report.catatan;
      }
    });

    analyticsData = reports;
    return analyticsData;
  } catch (error) {
    console.error('[periodic.js] Gagal memuat data dari IndexedDB Storage:', error);
    analyticsData = generateSeedAnalyticsData();
    return analyticsData;
  }
}

// ============================================================================
// 4. FUNGSI UTAMA KALKULASI & RENDERING KPI CARDS
// ============================================================================

/**
 * Menghitung dan merender 3 metrik utama KPI pada halaman Laporan Berkala.
 * 
 * @param {Array<Object>} allReports - Seluruh array laporan dari IndexedDB
 * @param {Object} filters - Objek kriteria filter { scopeCategory, startDate, endDate }
 */
export function renderKPICards(allReports = [], filters = {}) {
  const { scopeCategory = 'ALL', startDate, endDate } = filters;

  // Saring data laporan untuk periode aktif saat ini
  const currentReports = filterReportsByDateRange(allReports, startDate, endDate);

  // Penanganan jika data periode aktif kosong
  if (!currentReports || currentReports.length === 0) {
    updateKPIDOM({
      complianceScore: '0.0%',
      complianceTrend: 'Tidak ada data',
      complianceTrendClass: 'kpi-trend-neutral',
      topPerformanceTitle: '-',
      topPerformanceSub: '0/0 Eksekusi Sukses',
      topPerformanceScore: '0.0%',
      bottleneckTitle: '-',
      bottleneckSub: 'Tidak ada kendala tercatat',
      bottleneckScore: '0.0%',
      bottleneckStatus: 'Sangat Optimal'
    });
    return;
  }

  // Menentukan kunci task yang masuk ke dalam cakupan (Scope)
  let targetTaskKeys = [];
  if (scopeCategory === 'ALL') {
    Object.values(CHECKLIST_MAPPER).forEach((cat) => {
      targetTaskKeys.push(...Object.keys(cat.tasks));
    });
  } else if (CHECKLIST_MAPPER[scopeCategory]) {
    targetTaskKeys = Object.keys(CHECKLIST_MAPPER[scopeCategory].tasks);
  }

  const totalPossibleTaskEntries = currentReports.length * targetTaskKeys.length;

  // =========================================================================
  // METRIK 1: SKOR COMPLIANCE RATA-RATA & TREN DELTA PERIODE
  // =========================================================================
  let totalTrueCurrent = 0;
  currentReports.forEach((report) => {
    targetTaskKeys.forEach((key) => {
      if (report.checklist && report.checklist[key] === 'TRUE') {
        totalTrueCurrent++;
      }
    });
  });

  const currentComplianceRate = totalPossibleTaskEntries > 0
    ? (totalTrueCurrent / totalPossibleTaskEntries) * 100
    : 0;

  // Kalkulasi Otomatis Periode Pembanding (Previous Period)
  let trendText = '0.0% vs periode lalu';
  let trendClass = 'kpi-trend-neutral';

  if (startDate && endDate) {
    const startCurr = new Date(startDate);
    const endCurr = new Date(endDate);
    const durationMs = endCurr.getTime() - startCurr.getTime();

    // Hitung tanggal akhir dan awal untuk periode sebelumnya
    const prevEnd = new Date(startCurr.getTime() - 86400000); // 1 hari sebelum startDate
    const prevStart = new Date(prevEnd.getTime() - durationMs);

    const prevStartDateStr = prevStart.toISOString().split('T')[0];
    const prevEndDateStr = prevEnd.toISOString().split('T')[0];

    // Saring laporan periode lalu secara lokal dari array allReports
    const previousReports = filterReportsByDateRange(allReports, prevStartDateStr, prevEndDateStr);

    if (previousReports.length > 0) {
      let totalTruePrev = 0;
      previousReports.forEach((report) => {
        targetTaskKeys.forEach((key) => {
          if (report.checklist && report.checklist[key] === 'TRUE') {
            totalTruePrev++;
          }
        });
      });

      const prevPossibleEntries = previousReports.length * targetTaskKeys.length;
      const prevComplianceRate = prevPossibleEntries > 0 
        ? (totalTruePrev / prevPossibleEntries) * 100 
        : 0;

      const delta = currentComplianceRate - prevComplianceRate;
      const sign = delta >= 0 ? '+' : '';
      trendText = `${sign}${delta.toFixed(1)}% vs periode lalu`;
      trendClass = delta >= 0 ? 'kpi-trend-up' : 'kpi-trend-down';
    }
  }

  // =========================================================================
  // METRIK 2 & 3: KALKULASI DUAL-MODE (PER-KATEGORI VS PER-TASK)
  // =========================================================================
  let topPerfTitle = '';
  let topPerfScore = 0;
  let topPerfSub = '';

  let bottleneckTitle = '';
  let bottleneckScore = 0;
  let bottleneckSub = '';
  let bottleneckStatusTag = '';

  if (scopeCategory === 'ALL') {
    // -----------------------------------------------------------------------
    // MODE A: GLOBAL SCOPE (Menganalisis 5 Kategori Utama)
    // -----------------------------------------------------------------------
    const categoryStats = Object.keys(CHECKLIST_MAPPER).map((catKey) => {
      const catObj = CHECKLIST_MAPPER[catKey];
      const catTasks = Object.keys(catObj.tasks);
      let trueCount = 0;
      const totalCatPossible = currentReports.length * catTasks.length;

      currentReports.forEach((report) => {
        catTasks.forEach((tKey) => {
          if (report.checklist && report.checklist[tKey] === 'TRUE') {
            trueCount++;
          }
        });
      });

      const percentage = totalCatPossible > 0 ? (trueCount / totalCatPossible) * 100 : 0;
      return {
        key: catKey,
        name: catObj.name,
        trueCount,
        totalPossible: totalCatPossible,
        percentage
      };
    });

    // Urutkan kategori berdasarkan persentase capaian
    categoryStats.sort((a, b) => b.percentage - a.percentage);

    const highestCat = categoryStats[0];
    const lowestCat = categoryStats[categoryStats.length - 1];

    topPerfTitle = highestCat.name;
    topPerfScore = highestCat.percentage;
    topPerfSub = `${highestCat.trueCount}/${highestCat.totalPossible} Item Checklist Terpenuhi`;

    bottleneckTitle = lowestCat.name;
    bottleneckScore = lowestCat.percentage;

    // Cari sampel catatan evaluasi kualitatif dari laporan dengan skor terendah
    const lowestReport = [...currentReports]
      .filter((r) => r.scorePercent !== undefined)
      .sort((a, b) => a.scorePercent - b.scorePercent)[0];

    if (lowestReport && lowestReport.catatanEvaluasi) {
      bottleneckSub = `Kendala: "${lowestReport.catatanEvaluasi}"`;
    } else {
      const totalFailedTasks = lowestCat.totalPossible - lowestCat.trueCount;
      bottleneckSub = `${totalFailedTasks} Evaluasi Tugas Belum Terpenuhi`;
    }

  } else {
    // -----------------------------------------------------------------------
    // MODE B: CATEGORY SPECIFIC (Menganalisis Poin Sub-Task dalam Kategori)
    // -----------------------------------------------------------------------
    const currentCatObj = CHECKLIST_MAPPER[scopeCategory];
    const taskStats = Object.keys(currentCatObj.tasks).map((tKey) => {
      let trueCount = 0;
      currentReports.forEach((report) => {
        if (report.checklist && report.checklist[tKey] === 'TRUE') {
          trueCount++;
        }
      });

      const totalTaskPossible = currentReports.length;
      const percentage = totalTaskPossible > 0 ? (trueCount / totalTaskPossible) * 100 : 0;

      return {
        key: tKey,
        name: currentCatObj.tasks[tKey],
        trueCount,
        totalPossible: totalTaskPossible,
        percentage
      };
    });

    // Urutkan sub-task dari persentase tertinggi ke terendah
    taskStats.sort((a, b) => b.percentage - a.percentage);

    const highestTask = taskStats[0];
    const lowestTask = taskStats[taskStats.length - 1];

    topPerfTitle = highestTask.name;
    topPerfScore = highestTask.percentage;
    topPerfSub = `${highestTask.trueCount}/${highestTask.totalPossible} Laporan Terverifikasi Sukses`;

    bottleneckTitle = lowestTask.name;
    bottleneckScore = lowestTask.percentage;
    
    const failedDaysCount = lowestTask.totalPossible - lowestTask.trueCount;
    bottleneckSub = `${failedDaysCount} Hari Terdeteksi Tidak Dilaksanakan`;
  }

  // -------------------------------------------------------------------------
  // PENETAPAN STATUS THRESHOLD BOTTLE-NECK
  // -------------------------------------------------------------------------
  if (bottleneckScore < 75) {
    bottleneckStatusTag = 'Critical Bottleneck';
  } else if (bottleneckScore <= 89) {
    bottleneckStatusTag = 'Perlu Pemeliharaan';
  } else {
    bottleneckStatusTag = 'Sangat Optimal';
  }

  // Kirim data terhitung ke modul pembantu pembaruan UI
  updateKPIDOM({
    complianceScore: `${currentComplianceRate.toFixed(1)}%`,
    complianceTrend: trendText,
    complianceTrendClass: trendClass,
    topPerformanceTitle: topPerfTitle,
    topPerformanceSub: topPerfSub,
    topPerformanceScore: `${topPerfScore.toFixed(1)}%`,
    bottleneckTitle: bottleneckTitle,
    bottleneckSub: bottleneckSub,
    bottleneckScore: `${bottleneckScore.toFixed(1)}%`,
    bottleneckStatus: bottleneckStatusTag
  });
}

// ============================================================================
// 5. TOP-LEVEL EXPORT FUNCTION (UTAMA)
// ============================================================================
export async function render(container) {
  // Render status loading awal
  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 400px; font-family: system-ui, sans-serif; color: #1b4332;">
      <div style="text-align: center;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem; animation: pulse 1.5s infinite;">⚡</div>
        <p style="font-weight: 700; font-size: 1rem;">Memuat Data Analitik dari Storage IndexedDB...</p>
      </div>
    </div>
  `;

  // Memanggil pemuatan data dari IndexedDB
  await loadAnalyticsData();

  // Mengisi container.innerHTML dengan template HTML & CSS internal terisolasi
  container.innerHTML = `
    <div class="periodic-page-wrapper">
      
      <!-- TOOLBAR & FILTER CONTAINER -->
      <header class="analytics-toolbar-card">
        <div class="toolbar-title-box">
          <div class="analytics-badge-icon">📈</div>
          <div>
            <h1 class="analytics-page-title">Dashboard Analitik & Rekapitulasi Compliance</h1>
            <p class="analytics-page-subtitle">Eksekutif pemantauan tren kepatuhan, distribusi performa kategori, dan evaluasi kendala Adiwiyata.</p>
          </div>
        </div>

        <div class="toolbar-controls-grid">
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

          <div id="customDateRangeBox" class="control-item custom-date-box" style="display: none;">
            <label class="control-label">📆 Tanggal Mulai - Selesai</label>
            <div class="date-input-group">
              <input type="date" id="startDateInput" class="analytics-input" value="2026-08-01">
              <span>s/d</span>
              <input type="date" id="endDateInput" class="analytics-input" value="2026-08-31">
            </div>
          </div>

          <div class="control-item">
            <label class="control-label">🌿 Lingkup Kategori</label>
            <select id="categoryScopeSelect" class="analytics-select">
              <option value="ALL">Semua 5 Kategori Lingkungan</option>
              <option value="cat_1">1. Kebersihan & Sanitasi</option>
              <option value="cat_2">2. Pengelolaan Sampah & Kompos</option>
              <option value="cat_3">3. Penghijauan & Pemeliharaan Tanaman</option>
              <option value="cat_4">4. Konservasi & Hemat Energi</option>
              <option value="cat_5">5. Konservasi Air & Drainase</option>
            </select>
          </div>

          <div class="control-item export-action-box">
            <button type="button" id="btnExportExecutiveSummary" class="btn-export-executive">
              📊 Export Executive Summary (PDF)
            </button>
          </div>
        </div>
      </header>

      <!-- METRIK UTAMA / KPI CARDS -->
      <section class="kpi-grid-container" id="kpiCardsContainer">
        
        <!-- CARD 1: COMPLIANCE SCORE -->
        <div class="kpi-card">
          <div class="kpi-header">
            <h4 class="kpi-title">Skor Kepatuhan Rata-Rata</h4>
            <span class="kpi-icon">🎯</span>
          </div>
          <div class="kpi-value-box">
            <span class="kpi-main-num" id="kpi-compliance-score">0.0%</span>
          </div>
          <div class="kpi-footer">
            <span id="kpi-compliance-trend" class="kpi-trend-badge kpi-trend-neutral">0.0% vs periode lalu</span>
          </div>
        </div>

        <!-- CARD 2: TOP PERFORMANCE -->
        <div class="kpi-card">
          <div class="kpi-header">
            <h4 class="kpi-title">Kategori Performa Tertinggi</h4>
            <span class="kpi-icon">🏅</span>
          </div>
          <div class="kpi-value-box">
            <span class="kpi-main-num" id="kpi-top-title" style="font-size: 1.1rem;">-</span>
          </div>
          <div class="kpi-footer" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <span class="kpi-subtext" id="kpi-top-sub">0/0 Item Checklist Terpenuhi</span>
            <strong id="kpi-top-score" style="color: #166534; font-size: 0.85rem;">0.0%</strong>
          </div>
        </div>

        <!-- CARD 3: BOTTLENECK EVALUATION -->
        <div class="kpi-card">
          <div class="kpi-header">
            <h4 class="kpi-title">Area Evaluasi Utama (Bottleneck)</h4>
            <span class="kpi-icon">⚠️</span>
          </div>
          <div class="kpi-value-box" style="display: flex; justify-content: space-between; align-items: center;">
            <span class="kpi-main-num" id="kpi-bottleneck-title" style="font-size: 1.1rem; color: #dc2626;">-</span>
            <span id="kpi-bottleneck-badge" class="kpi-status-badge status-optimal">Sangat Optimal</span>
          </div>
          <div class="kpi-footer" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <span class="kpi-subtext" id="kpi-bottleneck-sub" style="max-width: 75%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">-</span>
            <strong id="kpi-bottleneck-score" style="color: #dc2626; font-size: 0.85rem;">0.0%</strong>
          </div>
        </div>

      </section>

      <!-- VISUALISASI GRAFIK (4 PANELS) -->
      <section class="charts-master-grid">
        
        <!-- Panel 1: SVG Line Chart -->
        <div class="chart-card chart-full-width">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-title">📉 Tren Kepatuhan Harian & Mingguan (Compliance Rate %)</h3>
              <p class="chart-subtitle">Garis kuning putus-putus menunjukkan target minimum (80%). Node merah penanda anomali (&lt; 60%).</p>
            </div>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-color color-trend"></span> Skor Kepatuhan</span>
              <span class="legend-item"><span class="legend-color color-target"></span> Target Minimum (80%)</span>
              <span class="legend-item"><span class="legend-color color-anomaly"></span> Anomali (&lt; 60%)</span>
            </div>
          </div>
          <div class="chart-card-body">
            <div id="lineChartContainer" class="svg-chart-wrapper"></div>
          </div>
        </div>

        <!-- Panel 2: Stacked Bar Chart -->
        <div class="chart-card">
          <div class="chart-card-header">
            <h3 class="chart-title">📊 Perbandingan Performa 5 Kategori Lingkup Kerja</h3>
            <p class="chart-subtitle">Rasio capaian TRUE (Selesai) vs FALSE (Belum) per sektor.</p>
          </div>
          <div class="chart-card-body">
            <div id="barChartContainer" class="bar-chart-wrapper"></div>
          </div>
        </div>

        <!-- Panel 3: Trigonometric Radar Chart -->
        <div class="chart-card">
          <div class="chart-card-header">
            <h3 class="chart-title">🕸️ Radar Keseimbangan Program Preservasi</h3>
            <p class="chart-subtitle">Peta kesetaraan ketercapaian program Adiwiyata lintas 5 sektor.</p>
          </div>
          <div class="chart-card-body text-center">
            <div id="radarChartContainer" class="radar-chart-wrapper"></div>
          </div>
        </div>

        <!-- Panel 4: Heatmap Grid Kalender -->
        <div class="chart-card chart-full-width">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-title">📅 Kalender Kepatuhan Piket (Compliance Heatmap Grid)</h3>
              <p class="chart-subtitle">Matriks harian kualitas pelaksanaan piket. Klik kotak tanggal untuk melihat ringkasan laporan.</p>
            </div>
            <div class="heatmap-color-scale">
              <span class="scale-box bg-dark-green">90-100%</span>
              <span class="scale-box bg-light-green">75-89%</span>
              <span class="scale-box bg-yellow">60-74%</span>
              <span class="scale-box bg-red">&lt; 60%</span>
              <span class="scale-box bg-gray">Libur</span>
            </div>
          </div>
          <div class="chart-card-body">
            <div id="calendarHeatmapContainer" class="calendar-heatmap-grid"></div>
          </div>
        </div>

      </section>

      <!-- PANEL ISSUE TRACKER & QUALITATIVE FEED -->
      <section class="issues-tracker-grid">
        
        <!-- Table Top 5 Unperformed Tasks -->
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
                  <th style="width: 120px;">Kode & Kategori</th>
                  <th>Deskripsi Indikator Tugas</th>
                  <th class="text-center" style="width: 100px;">Frekuensi FALSE</th>
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

        <!-- Qualitative Findings Feed -->
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

      <!-- MODAL RINGKASAN HARIAN -->
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

    <!-- INTERNAL SCOPED STYLING -->
    <style>
      .periodic-page-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
        padding-bottom: 3rem;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      }

      .analytics-toolbar-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        border-top: 4px solid #1b4332;
        box-shadow: 0 2px 4px rgba(0,0,0,0.02);
      }

      .toolbar-title-box {
        display: flex;
        align-items: center;
        gap: 0.85rem;
        margin-bottom: 1.25rem;
      }

      .analytics-badge-icon { font-size: 2.2rem; }
      .analytics-page-title { margin: 0; font-size: 1.25rem; font-weight: 800; color: #1b4332; }
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
        box-sizing: border-box;
      }

      .analytics-select:focus, .analytics-input:focus {
        border-color: #1b4332;
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
        background-color: #1b4332;
        color: #ffffff;
        font-weight: 700;
        font-size: 0.82rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .btn-export-executive:hover { background-color: #143225; }

      /* KPI Grid */
      .kpi-grid-container {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 1rem;
      }

      @media (min-width: 640px) { .kpi-grid-container { grid-template-columns: repeat(2, 1fr); } }
      @media (min-width: 1024px) { .kpi-grid-container { grid-template-columns: repeat(3, 1fr); } }

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

      .kpi-title { font-size: 0.75rem; font-weight: 700; color: #64748b; margin: 0; text-transform: uppercase; }
      .kpi-icon { font-size: 1.4rem; }

      .kpi-value-box { margin: 0.75rem 0 0.5rem 0; }
      .kpi-main-num { font-size: 1.75rem; font-weight: 800; color: #0f172a; line-height: 1; }

      .kpi-footer {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.75rem;
      }

      .kpi-trend-badge {
        display: inline-block;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 700;
      }

      .kpi-trend-up { background-color: #dcfce7; color: #15803d; }
      .kpi-trend-down { background-color: #fee2e2; color: #b91c1c; }
      .kpi-trend-neutral { background-color: #f1f5f9; color: #64748b; }

      .kpi-status-badge {
        font-size: 0.68rem;
        font-weight: 700;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
      }

      .status-critical { background-color: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
      .status-warning { background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
      .status-optimal { background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }

      .kpi-subtext { color: #64748b; font-size: 0.75rem; }

      /* Charts Grid */
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

      .svg-chart-wrapper { width: 100%; height: 260px; position: relative; }
      .svg-chart { width: 100%; height: 100%; overflow: visible; }

      .bar-chart-wrapper { display: flex; flex-direction: column; gap: 0.85rem; }
      .bar-item-row { display: flex; flex-direction: column; gap: 0.25rem; }
      .bar-item-label { display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; color: #334155; }
      .bar-track { height: 16px; background-color: #f1f5f9; border-radius: 8px; overflow: hidden; display: flex; }
      .bar-fill-true { background-color: #10b981; height: 100%; transition: width 0.5s; }
      .bar-fill-false { background-color: #ef4444; height: 100%; transition: width 0.5s; }

      .radar-chart-wrapper { display: flex; justify-content: center; align-items: center; padding: 0.5rem 0; }

      /* Calendar Heatmap */
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
        box-sizing: border-box;
      }

      .heatmap-day-card:hover { transform: scale(1.05); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); z-index: 2; }
      .heatmap-date-num { font-size: 0.75rem; font-weight: 800; }
      .heatmap-score-val { font-size: 0.68rem; font-weight: 700; text-align: right; }

      .bg-dark-green { background-color: #d1fae5; color: #065f46; border-color: #a7f3d0; }
      .bg-light-green { background-color: #e0f2fe; color: #0369a1; border-color: #bae6fd; }
      .bg-yellow { background-color: #fef3c7; color: #92400e; border-color: #fde68a; }
      .bg-red { background-color: #fee2e2; color: #991b1b; border-color: #fca5a5; }
      .bg-gray { background-color: #f1f5f9; color: #94a3b8; border-color: #e2e8f0; }

      .heatmap-color-scale { display: flex; gap: 0.35rem; font-size: 0.68rem; font-weight: 700; flex-wrap: wrap; }
      .scale-box { padding: 0.2rem 0.45rem; border-radius: 4px; }

      /* Issues Tracker */
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

      /* Feed */
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

      /* Modals */
      .modal-overlay {
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background-color: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
        z-index: 200; display: flex; align-items: center; justify-content: center;
        padding: 1rem; opacity: 0; visibility: hidden; transition: all 0.2s ease;
        box-sizing: border-box;
      }
      .modal-overlay.active { opacity: 1; visibility: visible; }
      .modal-card { background-color: #ffffff; border-radius: 12px; width: 100%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); overflow: hidden; }
      .modal-medium { max-width: 550px; }
      .modal-header { padding: 1rem 1.25rem; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
      .modal-title { margin: 0; font-size: 1rem; font-weight: 800; color: #1b4332; }
      .modal-close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b; }
      .modal-body { padding: 1.25rem; }

      .lightbox-overlay { z-index: 300; background-color: rgba(0,0,0,0.85); }
      .lightbox-content { position: relative; max-width: 90vw; max-height: 90vh; }
      .lightbox-content img { max-width: 100%; max-height: 85vh; border-radius: 8px; object-fit: contain; }
      .lightbox-close-btn { position: absolute; top: -35px; right: 0; background: none; border: none; color: #fff; font-size: 1.8rem; cursor: pointer; }
    </style>
  `;

  // Menginisialisasi event listener dan logika render komponen
  initAnalyticsPageLogic(container);
}

// ============================================================================
// 6. EVENT LISTENERS & DASHBOARD LOGIC
// ============================================================================
function initAnalyticsPageLogic(container) {
  const datePresetSelect = container.querySelector('#datePresetSelect');
  const customDateRangeBox = container.querySelector('#customDateRangeBox');
  const categoryScopeSelect = container.querySelector('#categoryScopeSelect');
  const startDateInput = container.querySelector('#startDateInput');
  const endDateInput = container.querySelector('#endDateInput');
  const btnExportExecutiveSummary = container.querySelector('#btnExportExecutiveSummary');
  const feedSearchInput = container.querySelector('#feedSearchInput');

  const daySummaryModal = container.querySelector('#daySummaryModal');
  const btnCloseDayModal = container.querySelector('#btnCloseDayModal');

  const analyticsLightboxModal = container.querySelector('#analyticsLightboxModal');
  const btnCloseAnalyticsLightbox = container.querySelector('#btnCloseAnalyticsLightbox');

  /**
   * Menghitung tanggal awal dan akhir presisi berdasarkan preset dropdown
   */
  function getDateRangeFromPreset(preset) {
    const today = new Date(2026, 7, 8); // 8 Agustus 2026
    const endStr = '2026-08-31';
    let startStr = '2026-08-01';

    if (preset === 'HARI_INI') {
      startStr = '2026-08-08';
      return { startDate: startStr, endDate: '2026-08-08' };
    } else if (preset === '7_HARI') {
      const past = new Date(today);
      past.setDate(past.getDate() - 7);
      startStr = past.toISOString().split('T')[0];
      return { startDate: startStr, endDate: '2026-08-08' };
    } else if (preset === 'BULAN_INI') {
      return { startDate: '2026-08-01', endDate: '2026-08-31' };
    } else if (preset === 'SEMESTER_INI') {
      return { startDate: '2026-07-01', endDate: '2026-12-31' };
    } else if (preset === 'CUSTOM') {
      const startVal = startDateInput ? startDateInput.value : '2026-08-01';
      const endVal = endDateInput ? endDateInput.value : '2026-08-31';
      return { startDate: startVal, endDate: endVal };
    }
    return { startDate: startStr, endDate: endStr };
  }

  function refreshAnalyticsDashboard() {
    const { startDate, endDate } = getDateRangeFromPreset(activeDateFilter);
    const filters = {
      scopeCategory: selectedScopeCategory,
      startDate,
      endDate
    };

    // 1. Eksekusi kalkulasi & render kartu KPI dengan modul terintegrasi
    renderKPICards(analyticsData, filters);

    // 2. Eksekusi render visualisasi pendukung
    const filteredReports = filterReportsByDateRange(analyticsData, startDate, endDate);
    
    renderLineChart(container, filteredReports);
    renderGroupedBarChart(container, filteredReports);
    renderRadarChart(container, filteredReports);
    renderCalendarHeatmap(container, filteredReports);
    renderTopUnperformedTasksTable(container, filteredReports);
    renderFindingsFeed(container, filteredReports, feedSearchInput ? feedSearchInput.value : '');
  }

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

  if (startDateInput) {
    startDateInput.addEventListener('change', () => {
      if (activeDateFilter === 'CUSTOM') refreshAnalyticsDashboard();
    });
  }

  if (endDateInput) {
    endDateInput.addEventListener('change', () => {
      if (activeDateFilter === 'CUSTOM') refreshAnalyticsDashboard();
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
      const { startDate, endDate } = getDateRangeFromPreset(activeDateFilter);
      const filteredReports = filterReportsByDateRange(analyticsData, startDate, endDate);
      renderFindingsFeed(container, filteredReports, feedSearchInput.value);
    });
  }

  if (btnExportExecutiveSummary) {
    btnExportExecutiveSummary.addEventListener('click', async () => {
      const { startDate, endDate } = getDateRangeFromPreset(activeDateFilter);
      const filtered = filterReportsByDateRange(analyticsData, startDate, endDate);
      
      const headers = [
        { header: 'ID Laporan', dataKey: 'id', width: 28 },
        { header: 'Tanggal', dataKey: 'tanggal', width: 22 },
        { header: 'Guru Piket', dataKey: 'guruPiket', width: 35 },
        { header: 'Capaian Compliance', dataKey: 'scorePercent', width: 25 },
        { header: 'Tag Evaluasi', dataKey: 'issueTag', width: 35 },
        { header: 'Catatan Kendala Lapangan', dataKey: 'catatan', width: 45 }
      ];

      const pdfData = filtered.map(item => {
        let trueCount = 0;
        Object.values(item.checklist || {}).forEach(v => { if (v === 'TRUE') trueCount++; });
        const pct = Math.round((trueCount / MASTER_CHECKLIST_DATA.length) * 100);

        return {
          id: item.id || '-',
          tanggal: item.tanggal || '-',
          guruPiket: item.guruPiket || '-',
          scorePercent: `${pct}% Kepatuhan`,
          issueTag: item.issueTag || 'Lancar',
          catatan: item.catatanEvaluasi || item.catatan || '-'
        };
      });

      try {
        await generatePDFReport({
          title: 'PLH-INTELLIGENCE - EXECUTIVE COMPLIANCE REPORT',
          subtitle: `Rekapitulasi Kepatuhan Lingkungan Hidup (${startDate} s/d ${endDate}) - Scope: ${selectedScopeCategory}`,
          headers: headers,
          data: pdfData,
          fileName: `PLH_Executive_Report_${startDate}_${endDate}.pdf`,
          orientation: 'landscape'
        });
      } catch (err) {
        alert(`Gagal mengekspor dokumen PDF: ${err.message}`);
      }
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

  // Render Perdana
  refreshAnalyticsDashboard();
}

// ============================================================================
// 7. SUB-RENDERER VISUALISASI GRAFIK & KOMPONEN PENDUKUNG
// ============================================================================

// VISUALISASI 1: SVG LINE CHART
function renderLineChart(container, reports) {
  const chartWrapper = container.querySelector('#lineChartContainer');
  if (!chartWrapper) return;

  if (reports.length === 0) {
    chartWrapper.innerHTML = `<p style="padding: 2rem; color: #64748b; font-size: 0.85rem; text-align: center;">Data tidak cukup untuk menampilkan grafik garis pada rentang tanggal ini.</p>`;
    return;
  }

  const sortedReports = [...reports].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));

  const points = sortedReports.map(r => {
    let tCount = 0;
    Object.values(r.checklist || {}).forEach(v => { if (v === 'TRUE') tCount++; });
    const pct = Math.round((tCount / MASTER_CHECKLIST_DATA.length) * 100);
    return { date: r.tanggal.split('-')[2] || '01', pct: pct, raw: r };
  });

  const width = 800;
  const height = 220;
  const padding = 30;

  const targetY = height - padding - ((80 / 100) * (height - 2 * padding));
  const xStep = points.length > 1 ? (width - 2 * padding) / (points.length - 1) : 0;

  const pathCoords = points.map((p, idx) => {
    const x = points.length === 1 ? width / 2 : padding + idx * xStep;
    const y = height - padding - ((p.pct / 100) * (height - 2 * padding));
    return { x, y, pct: p.pct, date: p.date, raw: p.raw };
  });

  const dPath = pathCoords.reduce((acc, pt, i) => i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '');

  chartWrapper.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="svg-chart">
      <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="#f1f5f9" stroke-width="1"/>
      <line x1="${padding}" y1="${height/2}" x2="${width - padding}" y2="${height/2}" stroke="#f1f5f9" stroke-width="1"/>
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#cbd5e1" stroke-width="1"/>

      <line x1="${padding}" y1="${targetY}" x2="${width - padding}" y2="${targetY}" stroke="#f59e0b" stroke-width="2" stroke-dasharray="6,4"/>

      ${points.length > 1 ? `<path d="${dPath}" fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` : ''}

      ${pathCoords.map(pt => {
        const isAnomaly = pt.pct < 60;
        return `
          <circle cx="${pt.x}" cy="${pt.y}" r="${isAnomaly ? '6' : '4'}" 
                  fill="${isAnomaly ? '#ef4444' : '#10b981'}" 
                  stroke="#ffffff" stroke-width="2">
            <title>Tgl ${pt.date}: ${pt.pct}% Compliance (${pt.raw.guruPiket || 'Guru Piket'})</title>
          </circle>
        `;
      }).join('')}
    </svg>
  `;
}

// VISUALISASI 2: GROUPED BAR CHART
function renderGroupedBarChart(container, reports) {
  const barWrapper = container.querySelector('#barChartContainer');
  if (!barWrapper) return;

  if (reports.length === 0) {
    barWrapper.innerHTML = `<p style="color: #64748b; font-size: 0.85rem; text-align: center;">Data tidak cukup untuk menampilkan statistik kategori.</p>`;
    return;
  }

  barWrapper.innerHTML = Object.keys(CHECKLIST_MAPPER).map(catKey => {
    const catObj = CHECKLIST_MAPPER[catKey];
    const catTasks = Object.keys(catObj.tasks);
    let catTrue = 0;
    let catTotal = reports.length * catTasks.length;

    reports.forEach(r => {
      catTasks.forEach(tKey => {
        if (r.checklist && r.checklist[tKey] === 'TRUE') catTrue++;
      });
    });

    const truePct = catTotal > 0 ? Math.round((catTrue / catTotal) * 100) : 0;
    const falsePct = 100 - truePct;

    return `
      <div class="bar-item-row">
        <div class="bar-item-label">
          <span>${catObj.name}</span>
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

// VISUALISASI 3: TRIGONOMETRIC RADAR CHART
function renderRadarChart(container, reports) {
  const radarWrapper = container.querySelector('#radarChartContainer');
  if (!radarWrapper) return;

  const size = 200;
  const center = size / 2;
  const radius = 70;

  const catKeys = Object.keys(CHECKLIST_MAPPER);
  const scores = catKeys.map(catKey => {
    const catObj = CHECKLIST_MAPPER[catKey];
    const catTasks = Object.keys(catObj.tasks);
    let catTrue = 0;
    let catTotal = reports.length * catTasks.length;

    reports.forEach(r => {
      catTasks.forEach(tKey => {
        if (r.checklist && r.checklist[tKey] === 'TRUE') catTrue++;
      });
    });
    return catTotal > 0 ? (catTrue / catTotal) : 0;
  });

  const numAxes = catKeys.length;
  const angleStep = (Math.PI * 2) / numAxes;

  const pointsStr = scores.map((val, idx) => {
    const angle = idx * angleStep - Math.PI / 2;
    const r = radius * val;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  radarWrapper.innerHTML = `
    <svg viewBox="0 0 ${size} ${size}" style="width: 100%; max-width: 220px;">
      <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#e2e8f0" stroke-width="1"/>
      <circle cx="${center}" cy="${center}" r="${radius * 0.66}" fill="none" stroke="#f1f5f9" stroke-width="1"/>
      <circle cx="${center}" cy="${center}" r="${radius * 0.33}" fill="none" stroke="#f1f5f9" stroke-width="1"/>

      ${scores.map((_, idx) => {
        const angle = idx * angleStep - Math.PI / 2;
        const x2 = center + radius * Math.cos(angle);
        const y2 = center + radius * Math.sin(angle);
        return `<line x1="${center}" y1="${center}" x2="${x2}" y2="${y2}" stroke="#cbd5e1" stroke-width="1"/>`;
      }).join('')}

      <polygon points="${pointsStr}" fill="rgba(16, 185, 129, 0.35)" stroke="#10b981" stroke-width="2"/>
    </svg>
  `;
}

// VISUALISASI 4: CALENDAR HEATMAP
function renderCalendarHeatmap(container, reports) {
  const heatmapContainer = container.querySelector('#calendarHeatmapContainer');
  if (!heatmapContainer) return;

  const reportMap = {};
  reports.forEach(r => {
    if (r.tanggal) {
      const parts = r.tanggal.split('-');
      const day = parseInt(parts[2], 10);
      reportMap[day] = r;
    }
  });

  let html = '';
  for (let day = 1; day <= 31; day++) {
    const report = reportMap[day];

    if (report) {
      let trueCount = 0;
      Object.values(report.checklist || {}).forEach(v => { if (v === 'TRUE') trueCount++; });
      const scorePct = Math.round((trueCount / MASTER_CHECKLIST_DATA.length) * 100);

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
  Object.values(report.checklist || {}).forEach(v => { if (v === 'TRUE') trueCount++; });
  const pct = Math.round((trueCount / MASTER_CHECKLIST_DATA.length) * 100);

  title.textContent = `Ringkasan Laporan (${report.tanggal})`;
  body.innerHTML = `
    <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.75rem;">
      <div><strong>ID Laporan:</strong> ${report.id || '-'}</div>
      <div><strong>Guru Piket:</strong> ${report.guruPiket || '-'}</div>
      <div><strong>Tim Petugas:</strong> ${(report.petugas || []).join(', ') || '-'}</div>
      <div><strong>Capaian Task:</strong> ${trueCount} / ${MASTER_CHECKLIST_DATA.length} Task (${pct}%)</div>
      <div><strong>Status Tag:</strong> <span class="feed-tag">${report.issueTag || 'Lancar'}</span></div>
      <div style="background-color: #f1f5f9; padding: 0.75rem; border-radius: 6px;">
        <strong>Catatan Evaluasi Lapangan:</strong><br>
        <p style="margin: 0.3rem 0 0 0; color: #334155;">${report.catatanEvaluasi || report.catatan || 'Tidak ada catatan.'}</p>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

// ISSUE TRACKER: TOP 5 UNPERFORMED TASKS TABLE
function renderTopUnperformedTasksTable(container, reports) {
  const tbody = container.querySelector('#topUnperformedTableBody');
  if (!tbody) return;

  if (reports.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 1.5rem; color: #64748b;">Tidak ada data laporan.</td></tr>`;
    return;
  }

  const taskFailureCounts = MASTER_CHECKLIST_DATA.map(task => {
    const taskKey = `task_${task.code.replace('.', '_')}`;
    let falseCount = 0;

    reports.forEach(r => {
      if (r.checklist && r.checklist[taskKey] === 'FALSE') {
        falseCount++;
      }
    });

    const failureRate = reports.length > 0 ? ((falseCount / reports.length) * 100).toFixed(1) : 0;

    let dominantCause = 'Prosedur terlewat / kendala waktu.';
    if (task.code === '2.4') dominantCause = 'Buku log penimbangan hilang / fasilitas timbangan tergenang air.';
    if (task.code === '3.2') dominantCause = 'Pasokan pakan/perawatan tanaman pot terhambat.';
    if (task.code === '1.3') dominantCause = 'Faktor cuaca hujan deras memicu luapan drainase.';

    return { ...task, falseCount, failureRate, dominantCause };
  });

  taskFailureCounts.sort((a, b) => b.falseCount - a.falseCount);
  const top5 = taskFailureCounts.slice(0, 5);

  tbody.innerHTML = top5.map((item, idx) => `
    <tr>
      <td class="text-center"><span class="rank-number">${idx + 1}</span></td>
      <td>
        <strong style="color: #1b4332;">${item.code}</strong><br>
        <span style="font-size: 0.72rem; color: #64748b;">${item.category}</span>
      </td>
      <td style="line-height: 1.3;">${item.label}</td>
      <td class="text-center"><strong style="color: #dc2626;">${item.falseCount}x</strong></td>
      <td class="text-center"><strong>${item.failureRate}%</strong></td>
      <td style="font-size: 0.75rem; color: #475569;">${item.dominantCause}</td>
    </tr>
  `).join('');
}

// ISSUE TRACKER: QUALITATIVE FINDINGS FEED
function renderFindingsFeed(container, reports, searchQuery = '') {
  const feedContainer = container.querySelector('#findingsFeedContainer');
  if (!feedContainer) return;

  const filtered = reports.filter(r => {
    const textToSearch = (r.catatanEvaluasi || r.catatan || '') + ' ' + (r.guruPiket || '') + ' ' + (r.issueTag || '');
    return textToSearch.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (filtered.length === 0) {
    feedContainer.innerHTML = `<p style="font-size: 0.8rem; color: #94a3b8; font-style: italic;">Tidak ada catatan evaluasi yang cocok dengan kata kunci pencarian.</p>`;
    return;
  }

  feedContainer.innerHTML = filtered.map(r => `
    <div class="feed-item-card">
      <div class="feed-item-header">
        <div>
          <span class="feed-date">📅 ${r.tanggal || '-'}</span> — <span class="feed-guru">🧑‍🏫 ${r.guruPiket || '-'}</span>
        </div>
        <span class="feed-tag">${r.issueTag || 'Evaluasi'}</span>
      </div>
      <p class="feed-narrative">${r.catatanEvaluasi || r.catatan || 'Tidak ada catatan.'}</p>
      ${r.photos && r.photos.length > 0 ? `
        <button type="button" class="feed-photo-btn" data-src="${r.photos[0]}">
          🖼️ Lihat Bukti Foto Lapangan (${r.photos.length})
        </button>
      ` : ''}
    </div>
  `).join('');

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