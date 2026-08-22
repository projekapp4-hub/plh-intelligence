/**
 * PERIODIC.JS - Modul Dashboard Analitik, Rekapitulasi & Tren Compliance
 * Path: src/pages/dashboard/views/periodic.js
 *
 * Modul analitik eksekutif Vanilla JS murni untuk pemantauan tren kepatuhan,
 * distribusi performa kategori, kalender heatmap harian, serta pelacakan kendala Adiwiyata.
 * Terhubung secara penuh dengan IndexedDB (storage.js) & PDF Generator Utility (createPDF.js).
 * Mengusung standar UI/UX Pro Max: Bebas AI Slop, Zero-Emoji UI Controls, High Contrast & Data-Dense.
 */

import { getAllItems, seedMockData } from '../../../utils/storage.js';
import { generatePDFReport } from '../../../utils/createPDF.js';

// ============================================================================
// 1. HELPER GENERATOR IKON SVG BEBAS EMOJI (UI/UX PRO MAX STANDARD)
// ============================================================================
const Icons = {
  analytics: (size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`,
  calendar: (size = 15) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  calendarGrid: (size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>`,
  filter: (size = 15) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  layers: (size = 15) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  filePdf: (size = 15) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 12v6"/><path d="M10 15h3a1.5 1.5 0 0 0 0-3h-3"/></svg>`,
  target: (size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  award: (size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>`,
  alertTriangle: (size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  alertCircle: (size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  trendingUp: (size = 14) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  trendingDown: (size = 14) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>`,
  barChart: (size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>`,
  radar: (size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`,
  lineChart: (size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>`,
  messageSquare: (size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  search: (size = 14) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  chevronLeft: (size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevronRight: (size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  user: (size = 13) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  image: (size = 13) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  close: (size = 16) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  checkCircle: (size = 14) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  loader: (size = 28) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`
};

// ============================================================================
// 2. KAMUS PEMETAAN CHECKLIST LOKAL & MASTER DATA
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
// 3. STATE GLOBAL MODUL
// ============================================================================
let analyticsData = [];
let selectedScopeCategory = 'ALL';
let activeDateFilter = 'BULAN_INI';
let currentCalYear = 2026;
let currentCalMonth = 7; // 0-indexed, 7 = Agustus

// ============================================================================
// 4. HELPER UTILITAS INTERNAL & DATA LAYER
// ============================================================================

/**
 * Menyaring koleksi laporan berdasarkan rentang tanggal inklusif secara lokal.
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
    elTrend.innerHTML = `${data.trendIcon || ''} ${data.complianceTrend}`;
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
// 5. FUNGSI UTAMA KALKULASI & RENDERING KPI CARDS
// ============================================================================

export function renderKPICards(allReports = [], filters = {}) {
  const { scopeCategory = 'ALL', startDate, endDate } = filters;

  const currentReports = filterReportsByDateRange(allReports, startDate, endDate);

  if (!currentReports || currentReports.length === 0) {
    updateKPIDOM({
      complianceScore: '0.0%',
      complianceTrend: 'Tidak ada data',
      trendIcon: '',
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

  let targetTaskKeys = [];
  if (scopeCategory === 'ALL') {
    Object.values(CHECKLIST_MAPPER).forEach((cat) => {
      targetTaskKeys.push(...Object.keys(cat.tasks));
    });
  } else if (CHECKLIST_MAPPER[scopeCategory]) {
    targetTaskKeys = Object.keys(CHECKLIST_MAPPER[scopeCategory].tasks);
  }

  const totalPossibleTaskEntries = currentReports.length * targetTaskKeys.length;

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

  let trendText = '0.0% vs periode lalu';
  let trendClass = 'kpi-trend-neutral';
  let trendIcon = '';

  if (startDate && endDate) {
    const sTime = new Date(startDate).getTime();
    const eTime = new Date(endDate).getTime();
    const durationMs = eTime - sTime;

    if (durationMs > 0) {
      const prevEnd = new Date(sTime - 86400000).toISOString().split('T')[0];
      const prevStart = new Date(sTime - 86400000 - durationMs).toISOString().split('T')[0];

      const prevReports = filterReportsByDateRange(allReports, prevStart, prevEnd);
      if (prevReports.length > 0) {
        let prevTrue = 0;
        const prevTotal = prevReports.length * targetTaskKeys.length;
        prevReports.forEach((r) => {
          targetTaskKeys.forEach((k) => {
            if (r.checklist && r.checklist[k] === 'TRUE') prevTrue++;
          });
        });
        const prevRate = prevTotal > 0 ? (prevTrue / prevTotal) * 100 : 0;
        const delta = currentComplianceRate - prevRate;
        const sign = delta >= 0 ? '+' : '';
        trendText = `${sign}${delta.toFixed(1)}% vs periode lalu`;
        if (delta > 0.05) {
          trendClass = 'kpi-trend-up';
          trendIcon = Icons.trendingUp(12);
        } else if (delta < -0.05) {
          trendClass = 'kpi-trend-down';
          trendIcon = Icons.trendingDown(12);
        } else {
          trendClass = 'kpi-trend-neutral';
          trendIcon = '';
        }
      }
    }
  }

  // Metrik 2: Kategori Performa Tertinggi
  const categoryKeys = Object.keys(CHECKLIST_MAPPER);
  const categoryScores = categoryKeys.map((catKey) => {
    const catData = CHECKLIST_MAPPER[catKey];
    const catTaskKeys = Object.keys(catData.tasks);
    let catTrueCount = 0;
    const catTotalPossible = currentReports.length * catTaskKeys.length;

    currentReports.forEach((report) => {
      catTaskKeys.forEach((tKey) => {
        if (report.checklist && report.checklist[tKey] === 'TRUE') {
          catTrueCount++;
        }
      });
    });

    const rate = catTotalPossible > 0 ? (catTrueCount / catTotalPossible) * 100 : 0;
    return {
      key: catKey,
      name: catData.name,
      rate: rate,
      fulfilled: catTrueCount,
      total: catTotalPossible
    };
  });

  categoryScores.sort((a, b) => b.rate - a.rate);
  const topCategory = categoryScores[0] || { name: '-', rate: 0, fulfilled: 0, total: 0 };
  const topPerfTitle = topCategory.name;
  const topPerfScore = topCategory.rate;
  const topPerfSub = `${topCategory.fulfilled}/${topCategory.total} Item Terpenuhi`;

  // Metrik 3: Area Evaluasi Utama (Bottleneck)
  const taskScores = [];
  const relevantTasksMaster = MASTER_CHECKLIST_DATA.filter((item) => {
    const taskKey = `task_${item.code.replace('.', '_')}`;
    return targetTaskKeys.includes(taskKey);
  });

  relevantTasksMaster.forEach((taskMaster) => {
    const taskKey = `task_${taskMaster.code.replace('.', '_')}`;
    let falseCount = 0;

    currentReports.forEach((report) => {
      if (report.checklist && report.checklist[taskKey] === 'FALSE') {
        falseCount++;
      }
    });

    const failRate = currentReports.length > 0 ? (falseCount / currentReports.length) * 100 : 0;
    taskScores.push({
      code: taskMaster.code,
      label: taskMaster.label,
      category: taskMaster.category,
      falseCount: falseCount,
      failRate: failRate
    });
  });

  taskScores.sort((a, b) => b.falseCount - a.falseCount);
  const worstTask = taskScores[0] || { code: '-', label: '-', category: '-', falseCount: 0, failRate: 0 };

  const bottleneckTitle = worstTask.code !== '-' ? `Task ${worstTask.code}` : '-';
  const bottleneckSub = worstTask.label;
  const bottleneckScore = worstTask.failRate;

  let bottleneckStatusTag = 'Sangat Optimal';
  if (worstTask.failRate >= 40) {
    bottleneckStatusTag = 'Critical Bottleneck';
  } else if (worstTask.failRate >= 20) {
    bottleneckStatusTag = 'Perlu Pemeliharaan';
  } else {
    bottleneckStatusTag = 'Sangat Optimal';
  }

  updateKPIDOM({
    complianceScore: `${currentComplianceRate.toFixed(1)}%`,
    complianceTrend: trendText,
    trendIcon: trendIcon,
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
// 6. TOP-LEVEL EXPORT FUNCTION (UTAMA)
// ============================================================================
export async function render(container) {
  // Render status loading awal tanpa emoji
  container.innerHTML = `
    <div style="display: flex; justify-content: center; align-items: center; min-height: 420px; color: var(--color-primary, #2C5E3B);">
      <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
        <div style="color: var(--color-primary, #2C5E3B);">${Icons.loader(36)}</div>
        <p style="font-weight: 600; font-size: 0.95rem; color: var(--color-text-main, #142418);">Memuat Data Analitik & Rekapitulasi...</p>
      </div>
    </div>
  `;

  // Memanggil pemuatan data dari IndexedDB
  await loadAnalyticsData();

  // Mengisi container.innerHTML dengan template HTML modern bebas slop
  container.innerHTML = `
    <div class="periodic-page-wrapper">

      <!-- TOOLBAR & FILTER CONTAINER -->
      <header class="analytics-toolbar-card">
        <div class="toolbar-title-box">
          <div class="analytics-badge-icon" aria-hidden="true">${Icons.analytics(22)}</div>
          <div>
            <h1 class="analytics-page-title">Dashboard Analitik & Rekapitulasi Compliance</h1>
            <p class="analytics-page-subtitle">Eksekutif pemantauan tren kepatuhan, distribusi performa kategori, dan evaluasi kendala Adiwiyata.</p>
          </div>
        </div>

        <div class="toolbar-controls-grid">
          <div class="control-item">
            <label class="control-label" for="datePresetSelect">
              <span class="control-label-icon">${Icons.calendar(14)}</span> Rentang Waktu
            </label>
            <select id="datePresetSelect" class="analytics-select">
              <option value="HARI_INI">Hari Ini</option>
              <option value="7_HARI">7 Hari Terakhir</option>
              <option value="BULAN_INI" selected>Bulan Ini (Agustus 2026)</option>
              <option value="SEMESTER_INI">Semester Ini (Ganjil 2026/2027)</option>
              <option value="CUSTOM">Rentang Kustom...</option>
            </select>
          </div>

          <div id="customDateRangeBox" class="control-item custom-date-box" style="display: none;">
            <label class="control-label" for="startDateInput">
              <span class="control-label-icon">${Icons.calendar(14)}</span> Tanggal Mulai - Selesai
            </label>
            <div class="date-input-group">
              <input type="date" id="startDateInput" class="analytics-input" value="2026-08-01" aria-label="Tanggal Mulai">
              <span class="date-separator">s/d</span>
              <input type="date" id="endDateInput" class="analytics-input" value="2026-08-31" aria-label="Tanggal Selesai">
            </div>
          </div>

          <div class="control-item">
            <label class="control-label" for="categoryScopeSelect">
              <span class="control-label-icon">${Icons.layers(14)}</span> Lingkup Kategori
            </label>
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
              <span class="btn-icon">${Icons.filePdf(15)}</span> Export Executive Summary (PDF)
            </button>
          </div>
        </div>
      </header>

      <!-- METRIK UTAMA / KPI CARDS -->
      <section class="kpi-grid-container" id="kpiCardsContainer" aria-label="Metrik Utama Kepatuhan">

        <!-- CARD 1: COMPLIANCE SCORE -->
        <div class="kpi-card">
          <div class="kpi-header">
            <h4 class="kpi-title">Skor Kepatuhan Rata-Rata</h4>
            <div class="kpi-icon-box" aria-hidden="true">${Icons.target(18)}</div>
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
            <div class="kpi-icon-box kpi-icon-success" aria-hidden="true">${Icons.award(18)}</div>
          </div>
          <div class="kpi-value-box">
            <span class="kpi-main-num kpi-text-truncate" id="kpi-top-title">-</span>
          </div>
          <div class="kpi-footer kpi-footer-split">
            <span class="kpi-subtext" id="kpi-top-sub">0/0 Item Terpenuhi</span>
            <strong id="kpi-top-score" class="kpi-score-highlight">0.0%</strong>
          </div>
        </div>

        <!-- CARD 3: BOTTLENECK EVALUATION -->
        <div class="kpi-card">
          <div class="kpi-header">
            <h4 class="kpi-title">Area Evaluasi Utama (Bottleneck)</h4>
            <div class="kpi-icon-box kpi-icon-warning" aria-hidden="true">${Icons.alertTriangle(18)}</div>
          </div>
          <div class="kpi-value-box kpi-value-split">
            <span class="kpi-main-num kpi-text-danger" id="kpi-bottleneck-title">-</span>
            <span id="kpi-bottleneck-badge" class="kpi-status-badge status-optimal">Sangat Optimal</span>
          </div>
          <div class="kpi-footer kpi-footer-split">
            <span class="kpi-subtext kpi-text-truncate" id="kpi-bottleneck-sub">-</span>
            <strong id="kpi-bottleneck-score" class="kpi-score-danger">0.0%</strong>
          </div>
        </div>

      </section>

      <!-- VISUALISASI GRAFIK (4 PANELS) -->
      <section class="charts-master-grid" aria-label="Visualisasi Tren dan Distribusi">

        <!-- Panel 1: SVG Line Chart -->
        <div class="chart-card chart-full-width">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-title">
                <span class="chart-title-icon">${Icons.lineChart(16)}</span> Tren Kepatuhan Harian (Compliance Rate %)
              </h3>
              <p class="chart-subtitle">Garis putus-putus oranye menunjukkan target minimum (80%). Node merah menandai deviasi (&lt; 60%).</p>
            </div>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-color color-trend"></span> Skor Kepatuhan</span>
              <span class="legend-item"><span class="legend-color color-target"></span> Target Minimum (80%)</span>
              <span class="legend-item"><span class="legend-color color-anomaly"></span> Deviasi (&lt; 60%)</span>
            </div>
          </div>
          <div class="chart-card-body">
            <div id="lineChartContainer" class="svg-chart-wrapper"></div>
          </div>
        </div>

        <!-- Panel 2: Stacked Bar Chart -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-title">
                <span class="chart-title-icon">${Icons.barChart(16)}</span> Distribusi 5 Kategori Lingkungan
              </h3>
              <p class="chart-subtitle">Rasio ketercapaian Selesai (Hijau) vs Belum Selesai (Merah) per sektor.</p>
            </div>
          </div>
          <div class="chart-card-body">
            <div id="barChartContainer" class="bar-chart-wrapper"></div>
          </div>
        </div>

        <!-- Panel 3: Trigonometric Radar Chart -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-title">
                <span class="chart-title-icon">${Icons.radar(16)}</span> Radar Keseimbangan Program
              </h3>
              <p class="chart-subtitle">Peta kesetaraan pemenuhan indikator Adiwiyata lintas 5 sektor preservasi.</p>
            </div>
          </div>
          <div class="chart-card-body chart-card-center">
            <div id="radarChartContainer" class="radar-chart-wrapper"></div>
          </div>
        </div>

        <!-- Panel 4: Heatmap Grid Kalender -->
        <div class="chart-card chart-full-width">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-title">
                <span class="chart-title-icon">${Icons.calendarGrid(16)}</span> Kalender Kepatuhan Piket Harian
              </h3>
              <p class="chart-subtitle">Matriks harian kualitas pelaksanaan piket. Klik kotak tanggal untuk meninjau detail log.</p>
            </div>
            <div class="heatmap-color-scale" aria-label="Legenda Skor Heatmap">
              <span class="scale-box bg-dark-green">90-100% (Optimal)</span>
              <span class="scale-box bg-light-green">75-89% (Baik)</span>
              <span class="scale-box bg-yellow">60-74% (Cukup)</span>
              <span class="scale-box bg-red">&lt; 60% (Evaluasi)</span>
              <span class="scale-box bg-gray">Libur</span>
            </div>
          </div>
          <div class="calendar-nav-toolbar">
            <div class="calendar-month-selector">
              <button type="button" id="btnCalPrevMonth" class="cal-nav-btn" aria-label="Bulan Sebelumnya">
                ${Icons.chevronLeft(16)}
              </button>
              <span id="calMonthYearDisplay" class="cal-month-label">Agustus 2026</span>
              <button type="button" id="btnCalNextMonth" class="cal-nav-btn" aria-label="Bulan Berikutnya">
                ${Icons.chevronRight(16)}
              </button>
            </div>
            <button type="button" id="btnCalToday" class="cal-today-btn">Bulan Ini</button>
          </div>
          <div class="chart-card-body calendar-heatmap-wrapper">
            <div class="calendar-dow-header">
              <span class="dow-cell dow-weekend">Min</span>
              <span class="dow-cell">Sen</span>
              <span class="dow-cell">Sel</span>
              <span class="dow-cell">Rab</span>
              <span class="dow-cell">Kam</span>
              <span class="dow-cell">Jum</span>
              <span class="dow-cell">Sab</span>
            </div>
            <div id="calendarHeatmapContainer" class="calendar-heatmap-grid"></div>
          </div>
        </div>

      </section>

      <!-- PANEL ISSUE TRACKER & QUALITATIVE FEED -->
      <section class="issues-tracker-grid" aria-label="Pelacakan Kendala dan Catatan Evaluasi">

        <!-- Table Top 5 Unperformed Tasks -->
        <div class="issue-card">
          <div class="issue-card-header">
            <h3 class="issue-title">
              <span class="issue-title-icon">${Icons.alertCircle(16)}</span> Top 5 Indikator Tugas Paling Sering Terlewat
            </h3>
            <p class="issue-subtitle">Peringkat indikator tugas yang memerlukan intervensi fasilitas atau peninjauan alur kerja.</p>
          </div>
          <div class="issue-card-body style-table-overflow">
            <table class="ranking-table" aria-label="Tabel Top 5 Indikator Terlewat">
              <thead>
                <tr>
                  <th class="text-center" style="width: 48px;">No</th>
                  <th style="width: 130px;">Kode & Kategori</th>
                  <th>Deskripsi Indikator Tugas</th>
                  <th class="text-center" style="width: 100px;">Frekuensi Belum</th>
                  <th class="text-center" style="width: 90px;">% Kendala</th>
                  <th>Analisis Penyebab Dominan</th>
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
                <h3 class="issue-title">
                  <span class="issue-title-icon">${Icons.messageSquare(16)}</span> Catatan & Umpan Temuan Lapangan
                </h3>
                <p class="issue-subtitle">Log kualitatif harian dari penanggung jawab dan guru piket bertugas.</p>
              </div>
              <div class="feed-filter-box">
                <div class="search-input-wrapper">
                  <span class="search-icon">${Icons.search(14)}</span>
                  <input type="text" id="feedSearchInput" class="analytics-input search-input-with-icon" placeholder="Cari kata kunci kendala..." aria-label="Cari catatan evaluasi">
                </div>
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
      <div id="daySummaryModal" class="modal-overlay" aria-hidden="true" role="dialog" aria-modal="true">
        <div class="modal-card modal-medium">
          <div class="modal-header">
            <h2 class="modal-title" id="dayModalTitle">Ringkasan Laporan Harian</h2>
            <button type="button" id="btnCloseDayModal" class="modal-close-btn" aria-label="Tutup Dialog">${Icons.close(16)}</button>
          </div>
          <div class="modal-body" id="dayModalBody">
            <!-- Rendered via JS -->
          </div>
        </div>
      </div>

      <!-- LIGHTBOX PHOTO MODAL -->
      <div id="analyticsLightboxModal" class="modal-overlay lightbox-overlay" aria-hidden="true" role="dialog" aria-modal="true">
        <div class="lightbox-content">
          <button type="button" id="btnCloseAnalyticsLightbox" class="lightbox-close-btn" aria-label="Tutup Foto">${Icons.close(20)}</button>
          <img id="analyticsLightboxImg" src="" alt="Bukti Foto Dokumentasi Lapangan">
        </div>
      </div>

    </div>

    <!-- INTERNAL SCOPED STYLING DENGAN DESIGN TOKENS GLOBAL -->
    <style>
      .periodic-page-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        overflow-x: hidden;
        padding-bottom: 3rem;
        font-family: var(--font-primary, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
        color: var(--color-text-main, #142418);
      }

      /* Toolbar Header */
      .analytics-toolbar-card {
        background-color: var(--color-surface, #ffffff);
        border: 1px solid var(--color-border, #cbe0d2);
        border-radius: var(--radius-lg, 16px);
        padding: 1.25rem 1.5rem;
        box-shadow: var(--shadow-sm, 0 2px 4px rgba(44, 94, 59, 0.04));
      }

      .toolbar-title-box {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.25rem;
      }

      .analytics-badge-icon {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md, 10px);
        background-color: var(--color-bg-base, #f5f9f6);
        color: var(--color-primary, #2C5E3B);
        border: 1px solid var(--color-border, #cbe0d2);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .analytics-page-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--color-primary, #2C5E3B);
        letter-spacing: -0.01em;
      }

      .analytics-page-subtitle {
        margin: 0.25rem 0 0 0;
        font-size: 0.85rem;
        color: var(--color-text-muted, #43594A);
      }

      .toolbar-controls-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }

      .toolbar-controls-grid > * {
        min-width: 0;
      }

      @media (min-width: 768px) {
        .toolbar-controls-grid {
          grid-template-columns: 1.2fr 1.5fr 1.8fr;
          align-items: flex-end;
        }
      }

      .control-label {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--color-text-main, #142418);
        margin-bottom: 0.4rem;
      }

      .control-label-icon {
        color: var(--color-secondary, #619170);
        display: inline-flex;
        align-items: center;
      }

      .analytics-select, .analytics-input {
        width: 100%;
        padding: 0.6rem 0.85rem;
        font-size: 0.875rem;
        font-family: inherit;
        color: var(--color-text-main, #142418);
        border: 1px solid var(--color-border, #cbe0d2);
        border-radius: var(--radius-md, 10px);
        outline: none;
        background-color: var(--color-surface, #ffffff);
        box-sizing: border-box;
        transition: var(--transition-fast, all 0.15s ease-in-out);
      }

      .analytics-select:focus, .analytics-input:focus {
        border-color: var(--color-primary, #2C5E3B);
        box-shadow: 0 0 0 3px rgba(44, 94, 59, 0.12);
      }

      .date-input-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.8rem;
        color: var(--color-text-muted, #43594A);
      }

      .date-separator {
        font-weight: 600;
        font-size: 0.8rem;
      }

      .export-action-box {
        display: flex;
        justify-content: flex-end;
      }

      .btn-export-executive {
        width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.65rem 1.15rem;
        background-color: var(--color-primary, #2C5E3B);
        color: #ffffff;
        font-family: inherit;
        font-weight: 600;
        font-size: 0.85rem;
        border: none;
        border-radius: var(--radius-md, 10px);
        cursor: pointer;
        transition: var(--transition-fast, all 0.15s ease-in-out);
        box-shadow: 0 2px 4px rgba(44, 94, 59, 0.15);
      }

      .btn-export-executive:hover {
        background-color: var(--color-primary-hover, #224a2e);
      }

      .btn-export-executive:focus-visible {
        outline: 2px solid var(--color-accent, #87FFAB);
        outline-offset: 2px;
      }

      /* KPI Cards Grid */
      .kpi-grid-container {
        display: grid;
        grid-template-columns: repeat(1, 1fr);
        gap: 1.25rem;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }

      @media (min-width: 640px) { .kpi-grid-container { grid-template-columns: repeat(2, 1fr); } }
      @media (min-width: 1024px) { .kpi-grid-container { grid-template-columns: repeat(3, 1fr); } }

      .kpi-card {
        background-color: var(--color-surface, #ffffff);
        border: 1px solid var(--color-border, #cbe0d2);
        border-radius: var(--radius-lg, 16px);
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: var(--shadow-sm, 0 2px 4px rgba(44, 94, 59, 0.04));
        min-width: 0;
        box-sizing: border-box;
      }

      .kpi-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .kpi-title {
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--color-text-muted, #43594A);
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .kpi-icon-box {
        width: 34px;
        height: 34px;
        border-radius: var(--radius-sm, 6px);
        background-color: var(--color-bg-base, #f5f9f6);
        color: var(--color-primary, #2C5E3B);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .kpi-icon-success {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      .kpi-icon-warning {
        background-color: #fff3e0;
        color: #e65100;
      }

      .kpi-value-box {
        margin: 0.85rem 0 0.65rem 0;
      }

      .kpi-value-split {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
      }

      .kpi-main-num {
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--color-text-main, #142418);
        line-height: 1.1;
      }

      .kpi-text-truncate {
        font-size: 1.05rem;
        font-weight: 700;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .kpi-text-danger {
        color: #b91c1c;
      }

      .kpi-footer {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.78rem;
      }

      .kpi-footer-split {
        justify-content: space-between;
        width: 100%;
      }

      .kpi-trend-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
        padding: 0.25rem 0.55rem;
        border-radius: var(--radius-sm, 6px);
        font-size: 0.75rem;
        font-weight: 700;
      }

      .kpi-trend-up {
        background-color: #dcfce7;
        color: #166534;
      }

      .kpi-trend-down {
        background-color: #fee2e2;
        color: #991b1b;
      }

      .kpi-trend-neutral {
        background-color: #f1f5f9;
        color: #475569;
      }

      .kpi-status-badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0.2rem 0.55rem;
        border-radius: var(--radius-sm, 6px);
      }

      .status-critical {
        background-color: #fee2e2;
        color: #991b1b;
        border: 1px solid #fca5a5;
      }

      .status-warning {
        background-color: #fef3c7;
        color: #92400e;
        border: 1px solid #fde68a;
      }

      .status-optimal {
        background-color: #dcfce7;
        color: #166534;
        border: 1px solid #bbf7d0;
      }

      .kpi-subtext {
        color: var(--color-text-muted, #43594A);
        font-size: 0.78rem;
      }

      .kpi-score-highlight {
        color: var(--color-primary, #2C5E3B);
        font-size: 0.85rem;
      }

      .kpi-score-danger {
        color: #b91c1c;
        font-size: 0.85rem;
      }

      /* Charts Master Grid */
      .charts-master-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }

      @media (min-width: 1024px) {
        .charts-master-grid { grid-template-columns: repeat(2, 1fr); }
        .chart-full-width { grid-column: 1 / -1; }
      }

      .chart-card {
        background-color: var(--color-surface, #ffffff);
        border: 1px solid var(--color-border, #cbe0d2);
        border-radius: var(--radius-lg, 16px);
        padding: 1.25rem;
        box-shadow: var(--shadow-sm, 0 2px 4px rgba(44, 94, 59, 0.04));
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }

      .chart-card-header {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-bottom: 1rem;
        padding-bottom: 0.85rem;
        border-bottom: 1px solid var(--color-border, #cbe0d2);
      }

      @media (min-width: 640px) {
        .chart-card-header {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }
      }

      .chart-title {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--color-text-main, #142418);
        margin: 0;
      }

      .chart-title-icon {
        color: var(--color-primary, #2C5E3B);
        display: inline-flex;
      }

      .chart-subtitle {
        font-size: 0.78rem;
        color: var(--color-text-muted, #43594A);
        margin: 0.25rem 0 0 0;
      }

      .chart-legend {
        display: flex;
        gap: 0.85rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-text-muted, #43594A);
        flex-wrap: wrap;
      }

      .legend-item {
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }

      .legend-color {
        width: 10px;
        height: 10px;
        border-radius: 2px;
      }

      .color-trend { background-color: var(--color-primary, #2C5E3B); }
      .color-target { background-color: #d97706; }
      .color-anomaly { background-color: #dc2626; }

      .svg-chart-wrapper {
        width: 100%;
        height: 260px;
        position: relative;
      }

      .svg-chart {
        width: 100%;
        height: 100%;
        overflow: visible;
      }

      .chart-card-center {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .bar-chart-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0.95rem;
      }

      .bar-item-row {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }

      .bar-item-label {
        display: flex;
        justify-content: space-between;
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--color-text-main, #142418);
      }

      .bar-track {
        height: 14px;
        background-color: #f1f5f9;
        border-radius: var(--radius-full, 9999px);
        overflow: hidden;
        display: flex;
      }

      .bar-fill-true {
        background-color: var(--color-primary, #2C5E3B);
        height: 100%;
        transition: width 0.4s ease;
      }

      .bar-fill-false {
        background-color: #ef4444;
        height: 100%;
        transition: width 0.4s ease;
      }

      .radar-chart-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.5rem 0;
      }

      /* Calendar Heatmap Toolbar & Grid */
      .calendar-nav-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.85rem;
        padding-bottom: 0.65rem;
        border-bottom: 1px dashed var(--color-border, #cbe0d2);
      }

      .calendar-month-selector {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .cal-nav-btn {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-sm, 6px);
        border: 1px solid var(--color-border, #cbe0d2);
        background-color: var(--color-bg-base, #f5f9f6);
        color: var(--color-text-main, #142418);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: var(--transition-fast, all 0.15s ease-in-out);
        padding: 0;
      }

      .cal-nav-btn:hover {
        background-color: var(--color-primary, #2C5E3B);
        color: #ffffff;
        border-color: var(--color-primary, #2C5E3B);
      }

      .cal-month-label {
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--color-primary, #2C5E3B);
        min-width: 125px;
        text-align: center;
      }

      .cal-today-btn {
        padding: 0.35rem 0.75rem;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: var(--radius-sm, 6px);
        border: 1px solid var(--color-border, #cbe0d2);
        background-color: var(--color-bg-base, #f5f9f6);
        color: var(--color-primary, #2C5E3B);
        cursor: pointer;
        transition: var(--transition-fast, all 0.15s ease-in-out);
      }

      .cal-today-btn:hover {
        background-color: var(--color-primary, #2C5E3B);
        color: #ffffff;
      }

      .calendar-heatmap-wrapper {
        width: 100%;
        max-width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        padding-bottom: 0.5rem;
        box-sizing: border-box;
      }

      .calendar-dow-header {
        display: grid;
        grid-template-columns: repeat(7, minmax(38px, 1fr));
        gap: 0.4rem;
        min-width: 300px;
        width: 100%;
        margin-bottom: 0.4rem;
        box-sizing: border-box;
      }

      .dow-cell {
        text-align: center;
        font-size: 0.7rem;
        font-weight: 700;
        color: var(--color-text-muted, #43594A);
        text-transform: uppercase;
        letter-spacing: 0.03em;
        padding: 0.25rem 0;
      }

      .dow-weekend {
        color: #dc2626;
      }

      .calendar-heatmap-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(38px, 1fr));
        gap: 0.4rem;
        min-width: 300px;
        width: 100%;
        box-sizing: border-box;
      }

      .heatmap-day-card {
        aspect-ratio: 1;
        border-radius: var(--radius-md, 8px);
        padding: 0.35rem 0.4rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        cursor: pointer;
        transition: var(--transition-fast, all 0.15s ease-in-out);
        border: 1px solid transparent;
        box-sizing: border-box;
        min-height: 44px;
      }

      .heatmap-day-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md, 0 4px 10px rgba(44, 94, 59, 0.12));
        z-index: 2;
      }

      .heatmap-day-empty {
        aspect-ratio: 1;
        background: transparent;
        border: none;
        pointer-events: none;
        min-height: 44px;
      }

      .heatmap-date-num {
        font-size: 0.72rem;
        font-weight: 700;
        line-height: 1;
      }

      .heatmap-score-val {
        font-size: 0.65rem;
        font-weight: 700;
        text-align: right;
        line-height: 1;
      }

      .bg-dark-green {
        background-color: #dcfce7;
        color: #166534;
        border-color: #bbf7d0;
      }

      .bg-light-green {
        background-color: #e0f2fe;
        color: #075985;
        border-color: #bae6fd;
      }

      .bg-yellow {
        background-color: #fef3c7;
        color: #92400e;
        border-color: #fde68a;
      }

      .bg-red {
        background-color: #fee2e2;
        color: #991b1b;
        border-color: #fca5a5;
      }

      .bg-gray {
        background-color: #f8fafc;
        color: #64748b;
        border-color: #e2e8f0;
      }

      .heatmap-color-scale {
        display: flex;
        gap: 0.4rem;
        font-size: 0.72rem;
        font-weight: 600;
        flex-wrap: wrap;
      }

      .scale-box {
        padding: 0.25rem 0.5rem;
        border-radius: var(--radius-sm, 6px);
        border: 1px solid transparent;
      }

      /* Issues Tracker Grid */
      .issues-tracker-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }

      .issue-card {
        background-color: var(--color-surface, #ffffff);
        border: 1px solid var(--color-border, #cbe0d2);
        border-radius: var(--radius-lg, 16px);
        padding: 1.25rem;
        box-shadow: var(--shadow-sm, 0 2px 4px rgba(44, 94, 59, 0.04));
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }

      .issue-card-header {
        margin-bottom: 1rem;
        padding-bottom: 0.85rem;
        border-bottom: 1px solid var(--color-border, #cbe0d2);
      }

      .issue-title {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.95rem;
        font-weight: 700;
        color: var(--color-text-main, #142418);
        margin: 0;
      }

      .issue-title-icon {
        color: var(--color-primary, #2C5E3B);
        display: inline-flex;
      }

      .issue-subtitle {
        font-size: 0.78rem;
        color: var(--color-text-muted, #43594A);
        margin: 0.25rem 0 0 0;
      }

      .style-table-overflow {
        width: 100%;
        max-width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        display: block;
        box-sizing: border-box;
      }

      .ranking-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.82rem;
      }

      .ranking-table th {
        background-color: var(--color-bg-base, #f5f9f6);
        padding: 0.75rem 0.85rem;
        text-align: left;
        color: var(--color-text-muted, #43594A);
        font-weight: 700;
        border-bottom: 1px solid var(--color-border, #cbe0d2);
      }

      .ranking-table td {
        padding: 0.75rem 0.85rem;
        border-bottom: 1px solid #f1f5f9;
        color: var(--color-text-main, #142418);
        vertical-align: middle;
      }

      .rank-number {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background-color: #fee2e2;
        color: #991b1b;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        font-size: 0.78rem;
      }

      /* Feed */
      .feed-header-flex {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      @media (min-width: 640px) {
        .feed-header-flex {
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }
      }

      .feed-filter-box {
        width: 100%;
        max-width: 260px;
      }

      .search-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }

      .search-icon {
        position: absolute;
        left: 0.75rem;
        color: var(--color-text-muted, #43594A);
        display: flex;
        pointer-events: none;
      }

      .search-input-with-icon {
        padding-left: 2.25rem !important;
      }

      .findings-feed-list {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        max-height: 420px;
        overflow-y: auto;
        padding-right: 0.4rem;
      }

      .feed-item-card {
        border: 1px solid var(--color-border, #cbe0d2);
        border-radius: var(--radius-md, 10px);
        padding: 0.95rem;
        background-color: var(--color-bg-base, #f5f9f6);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .feed-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.78rem;
      }

      .feed-meta-flex {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .feed-date, .feed-guru {
        display: inline-flex;
        align-items: center;
        gap: 0.3rem;
      }

      .feed-date {
        font-weight: 700;
        color: var(--color-text-main, #142418);
      }

      .feed-guru {
        color: var(--color-text-muted, #43594A);
      }

      .feed-tag {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0.2rem 0.5rem;
        border-radius: var(--radius-sm, 6px);
        background-color: #fef3c7;
        color: #92400e;
        border: 1px solid #fde68a;
      }

      .feed-narrative {
        font-size: 0.85rem;
        color: var(--color-text-main, #142418);
        margin: 0;
        line-height: 1.45;
      }

      .feed-photo-btn {
        align-self: flex-start;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--color-primary, #2C5E3B);
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }

      .feed-photo-btn:hover {
        text-decoration: underline;
      }

      /* Modals */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(20, 36, 24, 0.55);
        backdrop-filter: blur(4px);
        z-index: 200;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        opacity: 0;
        visibility: hidden;
        transition: var(--transition-normal, all 0.25s ease-in-out);
        box-sizing: border-box;
      }

      .modal-overlay.active {
        opacity: 1;
        visibility: visible;
      }

      .modal-card {
        background-color: var(--color-surface, #ffffff);
        border-radius: var(--radius-lg, 16px);
        width: 100%;
        box-shadow: var(--shadow-lg, 0 12px 24px rgba(44, 94, 59, 0.15));
        overflow: hidden;
        border: 1px solid var(--color-border, #cbe0d2);
      }

      .modal-medium {
        max-width: 550px;
      }

      .modal-header {
        padding: 1.1rem 1.25rem;
        background-color: var(--color-bg-base, #f5f9f6);
        border-bottom: 1px solid var(--color-border, #cbe0d2);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .modal-title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 700;
        color: var(--color-primary, #2C5E3B);
      }

      .modal-close-btn {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--color-text-muted, #43594A);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.35rem;
        border-radius: var(--radius-sm, 6px);
        transition: var(--transition-fast, all 0.15s ease-in-out);
      }

      .modal-close-btn:hover {
        background-color: rgba(0,0,0,0.06);
        color: var(--color-text-main, #142418);
      }

      .modal-body {
        padding: 1.25rem;
      }

      .lightbox-overlay {
        z-index: 300;
        background-color: rgba(0, 0, 0, 0.88);
      }

      .lightbox-content {
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
      }

      .lightbox-content img {
        max-width: 100%;
        max-height: 85vh;
        border-radius: var(--radius-md, 10px);
        object-fit: contain;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      }

      .lightbox-close-btn {
        position: absolute;
        top: -38px;
        right: 0;
        background: none;
        border: none;
        color: #ffffff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .animate-spin {
        animation: spin 1s linear infinite;
      }
    </style>
  `;

  initAnalyticsPageLogic(container);
}

// ============================================================================
// 7. EVENT LISTENERS & DASHBOARD LOGIC
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

    // 1. Eksekusi kalkulasi & render kartu KPI
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

  const btnCalPrevMonth = container.querySelector('#btnCalPrevMonth');
  const btnCalNextMonth = container.querySelector('#btnCalNextMonth');
  const btnCalToday = container.querySelector('#btnCalToday');

  if (btnCalPrevMonth) {
    btnCalPrevMonth.addEventListener('click', () => {
      currentCalMonth--;
      if (currentCalMonth < 0) {
        currentCalMonth = 11;
        currentCalYear--;
      }
      renderCalendarHeatmap(container, analyticsData);
    });
  }

  if (btnCalNextMonth) {
    btnCalNextMonth.addEventListener('click', () => {
      currentCalMonth++;
      if (currentCalMonth > 11) {
        currentCalMonth = 0;
        currentCalYear++;
      }
      renderCalendarHeatmap(container, analyticsData);
    });
  }

  if (btnCalToday) {
    btnCalToday.addEventListener('click', () => {
      currentCalYear = 2026;
      currentCalMonth = 7; // Agustus 2026
      renderCalendarHeatmap(container, analyticsData);
    });
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

  // Close modals on backdrop click
  if (daySummaryModal) {
    daySummaryModal.addEventListener('click', (e) => {
      if (e.target === daySummaryModal) daySummaryModal.classList.remove('active');
    });
  }
  if (analyticsLightboxModal) {
    analyticsLightboxModal.addEventListener('click', (e) => {
      if (e.target === analyticsLightboxModal) analyticsLightboxModal.classList.remove('active');
    });
  }

  // Render Perdana
  refreshAnalyticsDashboard();
}

// ============================================================================
// 8. SUB-RENDERER VISUALISASI GRAFIK & KOMPONEN PENDUKUNG
// ============================================================================

// VISUALISASI 1: SVG LINE CHART
function renderLineChart(container, reports) {
  const chartWrapper = container.querySelector('#lineChartContainer');
  if (!chartWrapper) return;

  if (reports.length === 0) {
    chartWrapper.innerHTML = `<p style="padding: 2.5rem; color: var(--color-text-muted, #43594A); font-size: 0.85rem; text-align: center;">Data tidak cukup untuk menampilkan grafik garis pada rentang tanggal ini.</p>`;
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
      <!-- Grid horizontal background lines -->
      <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3"/>
      <line x1="${padding}" y1="${height/2}" x2="${width - padding}" y2="${height/2}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3"/>
      <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#cbd5e1" stroke-width="1.5"/>

      <!-- Target line 80% -->
      <line x1="${padding}" y1="${targetY}" x2="${width - padding}" y2="${targetY}" stroke="#d97706" stroke-width="1.5" stroke-dasharray="6,4"/>

      <!-- Sparkline path -->
      ${points.length > 1 ? `<path d="${dPath}" fill="none" stroke="#2C5E3B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>` : ''}

      <!-- Interactive Data Points -->
      ${pathCoords.map(pt => {
        const isAnomaly = pt.pct < 60;
        return `
          <circle cx="${pt.x}" cy="${pt.y}" r="${isAnomaly ? '5.5' : '4'}"
                  fill="${isAnomaly ? '#dc2626' : '#2C5E3B'}"
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
    barWrapper.innerHTML = `<p style="color: var(--color-text-muted, #43594A); font-size: 0.85rem; text-align: center;">Data tidak cukup untuk menampilkan statistik kategori.</p>`;
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
          <span><strong>${truePct}%</strong> Selesai</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill-true" style="width: ${truePct}%;" title="Selesai: ${truePct}%"></div>
          <div class="bar-fill-false" style="width: ${falsePct}%;" title="Belum: ${falsePct}%"></div>
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
      <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#cbd5e1" stroke-width="1"/>
      <circle cx="${center}" cy="${center}" r="${radius * 0.66}" fill="none" stroke="#e2e8f0" stroke-width="1"/>
      <circle cx="${center}" cy="${center}" r="${radius * 0.33}" fill="none" stroke="#e2e8f0" stroke-width="1"/>

      ${scores.map((_, idx) => {
        const angle = idx * angleStep - Math.PI / 2;
        const x2 = center + radius * Math.cos(angle);
        const y2 = center + radius * Math.sin(angle);
        return `<line x1="${center}" y1="${center}" x2="${x2}" y2="${y2}" stroke="#cbd5e1" stroke-width="1"/>`;
      }).join('')}

      <polygon points="${pointsStr}" fill="rgba(44, 94, 59, 0.25)" stroke="#2C5E3B" stroke-width="2"/>
    </svg>
  `;
}

// VISUALISASI 4: CALENDAR HEATMAP (DYNAMIC MONTH & YEAR DENSE GRID)
function renderCalendarHeatmap(container, reports) {
  const heatmapContainer = container.querySelector('#calendarHeatmapContainer');
  const monthYearDisplay = container.querySelector('#calMonthYearDisplay');
  if (!heatmapContainer) return;

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  if (monthYearDisplay) {
    monthYearDisplay.textContent = `${monthNames[currentCalMonth]} ${currentCalYear}`;
  }

  // Petakan laporan berdasarkan tanggal YYYY-MM-DD
  const reportMap = {};
  (analyticsData || []).forEach(r => {
    if (r.tanggal) {
      reportMap[r.tanggal] = r;
    }
  });

  const firstDayIndex = new Date(currentCalYear, currentCalMonth, 1).getDay(); // 0 = Minggu, 1 = Senin, ...
  const daysInMonth = new Date(currentCalYear, currentCalMonth + 1, 0).getDate();

  let html = '';

  // 1. Render empty offset boxes for leading days
  for (let i = 0; i < firstDayIndex; i++) {
    html += `<div class="heatmap-day-empty" aria-hidden="true"></div>`;
  }

  // 2. Render actual calendar days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayFormatted = String(day).padStart(2, '0');
    const monthFormatted = String(currentCalMonth + 1).padStart(2, '0');
    const dateStr = `${currentCalYear}-${monthFormatted}-${dayFormatted}`;
    const dateObj = new Date(currentCalYear, currentCalMonth, day);
    const isSunday = dateObj.getDay() === 0;

    const report = reportMap[dateStr];

    if (report) {
      let trueCount = 0;
      Object.values(report.checklist || {}).forEach(v => { if (v === 'TRUE') trueCount++; });
      const scorePct = Math.round((trueCount / MASTER_CHECKLIST_DATA.length) * 100);

      let colorClass = 'bg-red';
      if (scorePct >= 90) colorClass = 'bg-dark-green';
      else if (scorePct >= 75) colorClass = 'bg-light-green';
      else if (scorePct >= 60) colorClass = 'bg-yellow';

      html += `
        <div class="heatmap-day-card ${colorClass}" data-date="${dateStr}" tabindex="0" role="button" aria-label="Tanggal ${day} ${monthNames[currentCalMonth]}: ${scorePct}% kepatuhan">
          <span class="heatmap-date-num">${day}</span>
          <span class="heatmap-score-val">${scorePct}%</span>
        </div>
      `;
    } else {
      const isOff = isSunday;
      html += `
        <div class="heatmap-day-card bg-gray" aria-label="Tanggal ${day} ${monthNames[currentCalMonth]}: ${isOff ? 'Hari Libur' : 'Tidak Ada Data'}">
          <span class="heatmap-date-num" style="${isSunday ? 'color: #dc2626;' : ''}">${day}</span>
          <span class="heatmap-score-val">${isOff ? 'Libur' : '-'}</span>
        </div>
      `;
    }
  }

  heatmapContainer.innerHTML = html;

  heatmapContainer.querySelectorAll('.heatmap-day-card[data-date]').forEach(card => {
    const clickHandler = () => {
      const dateKey = card.getAttribute('data-date');
      const report = reportMap[dateKey];
      if (report) {
        openDaySummaryModal(container, report);
      }
    };

    card.addEventListener('click', clickHandler);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        clickHandler();
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
    <div style="font-size: 0.875rem; display: flex; flex-direction: column; gap: 0.85rem;">
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">
        <span style="color: var(--color-text-muted, #43594A);">ID Laporan:</span>
        <strong style="color: var(--color-primary, #2C5E3B); font-family: monospace;">${report.id || '-'}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">
        <span style="color: var(--color-text-muted, #43594A);">Guru Piket:</span>
        <strong>${report.guruPiket || '-'}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">
        <span style="color: var(--color-text-muted, #43594A);">Tim Petugas:</span>
        <span>${(report.petugas || []).join(', ') || '-'}</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">
        <span style="color: var(--color-text-muted, #43594A);">Capaian Compliance:</span>
        <strong>${trueCount} / ${MASTER_CHECKLIST_DATA.length} Task (${pct}%)</strong>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem;">
        <span style="color: var(--color-text-muted, #43594A);">Status Tag:</span>
        <span class="feed-tag">${report.issueTag || 'Lancar'}</span>
      </div>
      <div style="background-color: var(--color-bg-base, #f5f9f6); padding: 0.85rem; border-radius: var(--radius-md, 10px); border: 1px solid var(--color-border, #cbe0d2);">
        <strong style="font-size: 0.8rem; color: var(--color-primary, #2C5E3B);">Catatan Evaluasi Lapangan:</strong>
        <p style="margin: 0.35rem 0 0 0; color: var(--color-text-main, #142418); line-height: 1.45; font-size: 0.82rem;">${report.catatanEvaluasi || report.catatan || 'Tidak ada catatan khusus untuk hari ini.'}</p>
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
    tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 1.75rem; color: var(--color-text-muted, #43594A);">Tidak ada data laporan tersedia.</td></tr>`;
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

    let dominantCause = 'Prosedur terlewat / keterbatasan durasi jam piket.';
    if (task.code === '2.4') dominantCause = 'Buku log penimbangan hilang / fasilitas timbangan tergenang air.';
    if (task.code === '3.2') dominantCause = 'Pasokan pakan/perawatan tanaman pot terhambat.';
    if (task.code === '1.3') dominantCause = 'Faktor cuaca hujan deras memicu luapan debit air drainase.';

    return { ...task, falseCount, failureRate, dominantCause };
  });

  taskFailureCounts.sort((a, b) => b.falseCount - a.falseCount);
  const top5 = taskFailureCounts.slice(0, 5);

  tbody.innerHTML = top5.map((item, idx) => `
    <tr>
      <td class="text-center"><span class="rank-number">${idx + 1}</span></td>
      <td>
        <strong style="color: var(--color-primary, #2C5E3B); font-family: monospace;">${item.code}</strong><br>
        <span style="font-size: 0.72rem; color: var(--color-text-muted, #43594A);">${item.category}</span>
      </td>
      <td style="line-height: 1.35; font-weight: 500;">${item.label}</td>
      <td class="text-center"><strong style="color: #b91c1c;">${item.falseCount}x</strong></td>
      <td class="text-center"><strong>${item.failureRate}%</strong></td>
      <td style="font-size: 0.78rem; color: var(--color-text-muted, #43594A); line-height: 1.35;">${item.dominantCause}</td>
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
    feedContainer.innerHTML = `<p style="font-size: 0.85rem; color: var(--color-text-muted, #43594A); font-style: italic; padding: 1rem 0;">Tidak ada catatan evaluasi yang cocok dengan kata kunci pencarian.</p>`;
    return;
  }

  feedContainer.innerHTML = filtered.map(r => `
    <div class="feed-item-card">
      <div class="feed-item-header">
        <div class="feed-meta-flex">
          <span class="feed-date">${Icons.calendar(12)} ${r.tanggal || '-'}</span>
          <span class="feed-guru">${Icons.user(12)} ${r.guruPiket || '-'}</span>
        </div>
        <span class="feed-tag">${r.issueTag || 'Evaluasi'}</span>
      </div>
      <p class="feed-narrative">${r.catatanEvaluasi || r.catatan || 'Tidak ada catatan temuan.'}</p>
      ${r.photos && r.photos.length > 0 ? `
        <button type="button" class="feed-photo-btn" data-src="${r.photos[0]}">
          ${Icons.image(13)} Lihat Bukti Foto Lapangan (${r.photos.length})
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
