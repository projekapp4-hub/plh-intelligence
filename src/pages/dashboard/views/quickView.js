/**
 * QUICKVIEW.JS - Modul Tampilan Utama (Dashboard Executive View)
 * Path: src/pages/dashboard/views/quickView.js
 * 
 * Berkas ini bertanggung jawab untuk merender visualisasi ringkas,
 * kartu metrik utama (KPI) berbasis data IndexedDB, dua grafik Chart.js,
 * serta ringkasan wawasan AI (JSON) yang terintegrasi dengan storage dan Gemini API.
 */

import { getAllItems, getItem, saveItem } from '../../../utils/storage.js';
import { analyzeJSON } from '../../../api/gemini.js';

// Menyimpan referensi chart agar dapat dihancurkan (destroy) saat re-render
let lineChartInstance = null;
let doughnutChartInstance = null;

/**
 * Memastikan CDN Chart.js v4 siap digunakan
 */
async function ensureChartJSLoaded() {
  if (window.Chart) return true;

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Gagal memuat Chart.js dari CDN'));
    document.head.appendChild(script);
  });
}

/**
 * Memproses data mentah dss_records dari storage.js menjadi statistik dan agregasi siap pakai
 * @param {Array<Object>} records - Daftar laporan dari IndexedDB
 */
function processDatabaseMetrics(records) {
  // 1. Penanganan awal jika database kosong
  if (!records || records.length === 0) {
    const daysOfWeekFallback = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const today = new Date();
    const fallbackLabels = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateNum = String(d.getDate()).padStart(2, '0');
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      fallbackLabels.push(`${daysOfWeekFallback[d.getDay()]} (${dateNum}/${monthNum})`);
    }

    return {
      totalPiket: 0,
      avgScore: 0,
      overallStatus: 'Belum Ada Data',
      badgeClass: 'badge-cukup',
      trendData: { 
        labels: fallbackLabels, 
        target: [13, 13, 13, 13, 13, 13, 13], 
        realita: [0, 0, 0, 0, 0, 0, 0] 
      },
      proporsiData: [0, 0, 0]
    };
  }

  // 2. Total Piket Terlaksana
  const totalPiket = records.length;

  // 3. Rata-Rata Kepatuhan Jadwal / Skor (%)
  const totalScore = records.reduce((acc, curr) => acc + (Number(curr.scorePercent) || 0), 0);
  const avgScore = Math.round((totalScore / totalPiket) * 10) / 10;

  // 4. Status Kondisi Sekolah Berdasarkan Rata-Rata Skor Database
  let overallStatus = 'Sangat Baik';
  let badgeClass = 'badge-sangat-baik';

  if (avgScore < 60) {
    overallStatus = 'Perlu Perhatian';
    badgeClass = 'badge-kurang';
  } else if (avgScore < 80) {
    overallStatus = 'Cukup Baik';
    badgeClass = 'badge-cukup';
  }

  // 5. Agregasi Tren 7 Hari Terakhir Secara Dinamis (Rolling 7 Days dari Hari Ini)
  const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const today = new Date();
  
  const last7DaysMap = new Map();
  const trendLabels = [];
  const targetData = [];

  // Membuat daftar 7 hari terakhir (H-6 sampai Hari Ini H-0)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    d.setHours(0, 0, 0, 0);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dateNum = String(d.getDate()).padStart(2, '0');
    
    // Key unik berbasis tanggal (YYYY-MM-DD)
    const dateKey = `${year}-${month}-${dateNum}`;
    const dayName = daysOfWeek[d.getDay()];
    const displayLabel = `${dayName} (${dateNum}/${month})`;

    // Inisialisasi data harian: Target diset ke 13 poin piket harian
    last7DaysMap.set(dateKey, {
      realitaPoin: 0,
      targetPoin: 13
    });

    trendLabels.push(displayLabel);
    targetData.push(13);
  }

  // Memfilter & Menjumlahkan Poin Realita Laporan yang masuk dalam 7 hari terakhir saja
  records.forEach(rec => {
    const rawDate = rec.tanggal || rec.createdAt;
    if (rawDate) {
      const dateObj = new Date(rawDate);
      if (!isNaN(dateObj)) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dateNum = String(dateObj.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${dateNum}`;

        if (last7DaysMap.has(dateKey)) {
          const currentDayData = last7DaysMap.get(dateKey);

          // Kalkulasi Poin Realita:
          // Memeriksa properti totalPoin/poin; jika tidak ada, mengonversi scorePercent ke skala 13 poin
          let poinDiperoleh = 0;
          if (rec.totalPoin !== undefined && rec.totalPoin !== null) {
            poinDiperoleh = Number(rec.totalPoin) || 0;
          } else if (rec.poin !== undefined && rec.poin !== null) {
            poinDiperoleh = Number(rec.poin) || 0;
          } else if (rec.scorePercent !== undefined) {
            poinDiperoleh = Math.round(((Number(rec.scorePercent) || 0) / 100) * 13);
          } else {
            poinDiperoleh = 13; // Fallback default
          }

          currentDayData.realitaPoin += poinDiperoleh;
        }
      }
    }
  });

  const realitaData = Array.from(last7DaysMap.values()).map(item => item.realitaPoin);

  // 6. Agregasi Grafik Donat: Proporsi Kondisi (Bersih / Cukup / Bermasalah) dari Database
  let bersihCount = 0;
  let cukupCount = 0;
  let masalahCount = 0;

  records.forEach(rec => {
    const score = Number(rec.scorePercent) || 0;
    if (score >= 80) {
      bersihCount++;
    } else if (score >= 60) {
      cukupCount++;
    } else {
      masalahCount++;
    }
  });

  const totalProp = totalPiket || 1;
  const proporsiData = [
    Math.round((bersihCount / totalProp) * 100),
    Math.round((cukupCount / totalProp) * 100),
    Math.round((masalahCount / totalProp) * 100)
  ];

  return {
    totalPiket,
    avgScore,
    overallStatus,
    badgeClass,
    trendData: {
      labels: trendLabels,
      target: targetData,
      realita: realitaData
    },
    proporsiData
  };
}

/**
 * Fungsi Utama Render Modul QuickView
 * @param {HTMLElement} container - Elemen pembungkus #spaCanvas
 */
export async function render(container) {
  // 1. Ambil data aktual dari IndexedDB via storage.js
  let dssRecords = [];
  try {
    dssRecords = await getAllItems('dss_records');
  } catch (err) {
    console.error('[quickView.js] Gagal mengambil data dss_records:', err);
  }

  // 2. Hitung statistik dan metrik
  const metrics = processDatabaseMetrics(dssRecords);

  // 3. Ambil cache AI Brief jika tersedia
  let cachedAiBrief = null;
  try {
    cachedAiBrief = await getItem('gemini_cache', 'quickview_brief');
  } catch (err) {
    console.warn('[quickView.js] Belum ada cache AI brief:', err);
  }

  // 4. Injeksi Struktur HTML
  container.innerHTML = `
    <div class="quickview-wrapper">
      
      <!-- SECTION 1: TOP METRIC CARDS (KPIs) -->
      <section class="quickview-section metrics-grid">
        
        <!-- Card 1: Total Piket Terlaksana -->
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-icon">🧹</span>
            <span class="metric-title">Total Piket Terlaksana</span>
          </div>
          <div class="metric-body">
            <div class="metric-value" id="kpiTotalPiket">${metrics.totalPiket.toLocaleString('id-ID')}</div>
            <div class="metric-trend trend-up">
              <span>▲ Real-time</span> <span class="metric-subtitle">data dari Database</span>
            </div>
          </div>
        </div>

        <!-- Card 2: Persentase Kepatuhan Piket -->
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-icon">🎯</span>
            <span class="metric-title">Kepatuhan Jadwal</span>
          </div>
          <div class="metric-body">
            <div class="metric-value" id="kpiKepatuhan">${metrics.avgScore}%</div>
            <div class="metric-progress-bar">
              <div class="metric-progress-fill" style="width: ${Math.min(metrics.avgScore, 100)}%;"></div>
            </div>
            <span class="metric-subtitle">Target minimum sekolah: 90%</span>
          </div>
        </div>

        <!-- Card 3: Status Kondisi Sekolah -->
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-icon">🏫</span>
            <span class="metric-title">Status Kondisi Sekolah</span>
          </div>
          <div class="metric-body">
            <div class="metric-status-badge ${metrics.badgeClass}" id="kpiStatusBadge">
              <span class="badge-dot"></span>
              <span id="kpiStatusText">${metrics.overallStatus}</span>
            </div>
            <span class="metric-subtitle">Evaluasi Otomatis Kebersihan</span>
          </div>
        </div>

      </section>

      <!-- SECTION 2: MIDDLE VISUAL CHARTS (Chart.js) -->
      <section class="quickview-section charts-grid">
        
        <!-- Grafik 1: Line Chart Tren Piket 7 Hari Terakhir -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-title">Tren Piket 7 Hari Terakhir</h3>
              <p class="chart-subtitle">Komparasi Target Poin (13 Poin) vs Realita Pelaksanaan</p>
            </div>
            <span class="chart-tag">Mingguan</span>
          </div>
          <div class="chart-container">
            <canvas id="piketTrendChart"></canvas>
          </div>
        </div>

        <!-- Grafik 2: Doughnut Chart Proporsi Kondisi Sekolah -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-title">Proporsi Kondisi Sekolah</h3>
              <p class="chart-subtitle">Rasio Kebersihan & Keasrian Area Saat Ini</p>
            </div>
            <span class="chart-tag">Real-Time</span>
          </div>
          <div class="chart-container chart-container-doughnut">
            <canvas id="kondisiProporsiChart"></canvas>
          </div>
        </div>

      </section>

      <!-- SECTION 3: BOTTOM AI INSIGHT & QUICK ACTIONS -->
      <section class="quickview-section bottom-grid">
        
        <!-- Box AI Insight -->
        <div class="ai-insight-card">
          <div class="ai-card-header">
            <div class="ai-badge">
              <span class="ai-icon">🤖</span>
              <span class="ai-badge-text">Brief AI Insight</span>
            </div>
            <span class="ai-timestamp" id="aiBriefTimestamp">
              ${cachedAiBrief?.timestamp ? cachedAiBrief.timestamp : 'Belum dianalisis'}
            </span>
          </div>
          <div class="ai-card-body">
            <div class="ai-text" id="aiBriefContent">
              ${cachedAiBrief?.briefText ? `
                <p>${cachedAiBrief.briefText}</p>
                ${cachedAiBrief.recommendation ? `<p><strong>Rekomendasi:</strong> ${cachedAiBrief.recommendation}</p>` : ''}
              ` : `
                <p>Klik tombol <strong>Analisis</strong> di bawah untuk memicu AI menganalisis data kebersihan dan kepatuhan piket terbaru dari database.</p>
              `}
            </div>
            
            <!-- Tombol Analisis untuk Reset / Trigger Ulang AI Brief -->
            <div class="ai-action-wrapper">
              <button id="reanalyzeAiBtn" class="btn-analisis">
                <span class="analisis-icon">⚡</span>
                <span class="analisis-btn-text">Analisis</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Actions Card -->
        <div class="quick-action-card">
          <h3 class="action-title">Aksi Cepat</h3>
          <p class="action-subtitle">Langsung catat hasil observasi atau evaluasi kebersihan terbaru.</p>
          
          <button id="quickInputBtn" class="btn btn-primary action-btn">
            <span>📝 Input Data Piket Sekarang</span>
            <span class="btn-arrow">→</span>
          </button>
        </div>

      </section>

    </div>

    <!-- STYLING KHUSUS QUICKVIEW MODULE -->
    <style>
      .quickview-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        width: 100%;
      }

      .quickview-section {
        width: 100%;
      }

      /* 1. Metrics Grid */
      .metrics-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      @media (min-width: 640px) {
        .metrics-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (min-width: 1024px) {
        .metrics-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }

      .metric-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border, #e2e8f0);
        border-radius: 12px;
        padding: 1.25rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .metric-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }

      .metric-icon {
        font-size: 1.25rem;
      }

      .metric-title {
        font-size: 0.85rem;
        font-weight: 600;
        color: #64748b;
      }

      .metric-value {
        font-size: 1.85rem;
        font-weight: 800;
        color: var(--color-primary, #1b4332);
        line-height: 1.1;
        margin-bottom: 0.5rem;
      }

      .metric-subtitle {
        font-size: 0.75rem;
        color: #94a3b8;
      }

      .metric-trend {
        font-size: 0.75rem;
        font-weight: 700;
      }

      .trend-up {
        color: #10b981;
      }

      .metric-progress-bar {
        width: 100%;
        height: 6px;
        background-color: #e2e8f0;
        border-radius: 3px;
        overflow: hidden;
        margin-bottom: 0.5rem;
      }

      .metric-progress-fill {
        height: 100%;
        background-color: var(--color-primary, #1b4332);
        border-radius: 3px;
      }

      .metric-status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.4rem 0.85rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
        width: fit-content;
      }

      .badge-sangat-baik {
        background-color: #d1fae5;
        color: #065f46;
      }

      .badge-cukup {
        background-color: #fef3c7;
        color: #92400e;
      }

      .badge-kurang {
        background-color: #fee2e2;
        color: #991b1b;
      }

      .badge-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: currentColor;
      }

      /* 2. Charts Grid */
      .charts-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }

      @media (min-width: 1024px) {
        .charts-grid {
          grid-template-columns: 3fr 2fr;
        }
      }

      .chart-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border, #e2e8f0);
        border-radius: 12px;
        padding: 1.25rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
        display: flex;
        flex-direction: column;
      }

      .chart-card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
      }

      .chart-title {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-primary, #1b4332);
      }

      .chart-subtitle {
        margin: 0.2rem 0 0 0;
        font-size: 0.75rem;
        color: #64748b;
      }

      .chart-tag {
        font-size: 0.7rem;
        font-weight: 600;
        background-color: #f1f5f9;
        color: #475569;
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
      }

      .chart-container {
        position: relative;
        width: 100%;
        min-height: 240px;
        max-height: 320px;
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .chart-container-doughnut {
        min-height: 220px;
        max-height: 280px;
      }

      /* 3. AI Insight & Quick Actions Grid */
      .bottom-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }

      @media (min-width: 1024px) {
        .bottom-grid {
          grid-template-columns: 3fr 2fr;
        }
      }

      .ai-insight-card {
        background: linear-gradient(135deg, #f0fdf4 0%, #e8f5ed 100%);
        border: 1px solid #bbf7d0;
        border-radius: 12px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .ai-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }

      .ai-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        background-color: #ffffff;
        padding: 0.3rem 0.75rem;
        border-radius: 20px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      }

      .ai-badge-text {
        font-size: 0.75rem;
        font-weight: 800;
        color: var(--color-primary, #1b4332);
      }

      .ai-timestamp {
        font-size: 0.7rem;
        color: #64748b;
      }

      .ai-card-body .ai-text {
        margin: 0;
        font-size: 0.85rem;
        line-height: 1.6;
        color: #1e293b;
      }

      .ai-action-wrapper {
        margin-top: 1rem;
        display: flex;
        justify-content: flex-end;
      }

      .btn-analisis {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background-color: var(--color-primary, #1b4332);
        color: #ffffff;
        border: none;
        padding: 0.5rem 1rem;
        font-size: 0.8rem;
        font-weight: 700;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        box-shadow: 0 2px 4px rgba(27, 67, 50, 0.2);
      }

      .btn-analisis:hover {
        background-color: #2d6a4f;
        transform: translateY(-1px);
        box-shadow: 0 4px 6px rgba(27, 67, 50, 0.3);
      }

      .btn-analisis:active {
        transform: translateY(0);
      }

      .btn-analisis:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .quick-action-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border, #e2e8f0);
        border-radius: 12px;
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .action-title {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-primary, #1b4332);
      }

      .action-subtitle {
        margin: 0.25rem 0 1rem 0;
        font-size: 0.75rem;
        color: #64748b;
      }

      .action-btn {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.75rem 1rem;
        font-weight: 700;
        font-size: 0.85rem;
        border-radius: 8px;
        cursor: pointer;
        background-color: var(--color-primary, #1b4332);
        color: #ffffff;
        border: none;
      }
    </style>
  `;

  // 5. Event Listener Tombol Akses Form Input
  const quickInputBtn = container.querySelector('#quickInputBtn');
  if (quickInputBtn) {
    quickInputBtn.addEventListener('click', () => {
      const formViewBtn = document.querySelector('.spa-nav-btn[data-view="formView"]');
      if (formViewBtn) {
        formViewBtn.click();
      }
    });
  }

  // 6. Event Listener Tombol 'Analisis' (Reset AI Brief)
  const reanalyzeAiBtn = container.querySelector('#reanalyzeAiBtn');
  if (reanalyzeAiBtn) {
    reanalyzeAiBtn.addEventListener('click', () => {
      executeAiAnalysis(dssRecords, container);
    });
  }

  // 7. Inisialisasi Chart.js
  try {
    await ensureChartJSLoaded();
    initCharts(container, metrics);
  } catch (err) {
    console.error('Gagal menginisialisasi Chart.js:', err);
  }
}

/**
 * Mengirim data database ke Google Gemini API via gemini.js dan memperbarui UI & Storage
 * @param {Array<Object>} dssRecords - Laporan mentah dari IndexedDB
 * @param {HTMLElement} container - Container UI
 */
async function executeAiAnalysis(dssRecords, container) {
  const btn = container.querySelector('#reanalyzeAiBtn');
  const briefContent = container.querySelector('#aiBriefContent');
  const briefTimestamp = container.querySelector('#aiBriefTimestamp');

  if (btn) btn.disabled = true;
  if (briefContent) {
    briefContent.innerHTML = `
      <p>⏳ <em>Sedang mengumpulkan data dari database dan meminta analisis terbaru dari Gemini AI...</em></p>
    `;
  }

  try {
    // A. Kemas Data Database ke format JSON
    const summaryData = processDatabaseMetrics(dssRecords);
    const sampleRecords = dssRecords.slice(-10).map(r => ({
      tanggal: r.tanggal || r.createdAt,
      lokasi: r.lokasi || r.zona,
      skor: r.scorePercent,
      catatan: r.catatan || r.keterangan || '-'
    }));

    const jsonPayload = {
      totalPiket: summaryData.totalPiket,
      kepatuhanRataRata: `${summaryData.avgScore}%`,
      statusKondisi: summaryData.overallStatus,
      proporsiKondisi: {
        bersihAman: `${summaryData.proporsiData[0]}%`,
        cukupTerawat: `${summaryData.proporsiData[1]}%`,
        perluTindakan: `${summaryData.proporsiData[2]}%`
      },
      sampelLaporanTerakhir: sampleRecords
    };

    // B. Instruksi Prompt AI
    const promptInstruction = `
      Anda adalah Eksekutif Asisten AI PLH-Intelligence.
      Analisis data JSON kebersihan dan kepatuhan piket sekolah di bawah ini.
      Berikan ringkasan eksekutif padat yang mencakup tren utama, area bermasalah (jika ada), dan rekomendasi konkret.
    `;

    // C. Schema Output JSON Gemini
    const responseSchema = {
      type: "OBJECT",
      properties: {
        briefText: { type: "STRING" },
        statusGrade: { type: "STRING" },
        recommendation: { type: "STRING" }
      },
      required: ["briefText", "recommendation"]
    };

    // D. Panggil Gemini API via gemini.js menggunakan model aktif 'gemini-2.0-flash'
    const aiResult = await analyzeJSON(
      jsonPayload,
      promptInstruction,
      responseSchema,
    );

    const nowFormatted = new Date().toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const cacheObj = {
      id: 'quickview_brief',
      briefText: aiResult.briefText || 'Analisis berhasil dibuat.',
      recommendation: aiResult.recommendation || '',
      timestamp: `Diperbarui ${nowFormatted}`
    };

    // E. Simpan Hasil ke IndexedDB (gemini_cache)
    await saveItem('gemini_cache', cacheObj);

    // F. Perbarui UI Halaman
    if (briefContent) {
      briefContent.innerHTML = `
        <p>${cacheObj.briefText}</p>
        ${cacheObj.recommendation ? `<p><strong>Rekomendasi:</strong> ${cacheObj.recommendation}</p>` : ''}
      `;
    }
    if (briefTimestamp) {
      briefTimestamp.textContent = cacheObj.timestamp;
    }

  } catch (error) {
    console.error('[quickView.js] Gagal menjalankan analisis AI:', error);
    if (briefContent) {
      briefContent.innerHTML = `
        <p style="color: #ef4444;">❌ Gagal memproses analisis AI: ${error.message}</p>
      `;
    }
  } finally {
    if (btn) btn.disabled = false;
  }
}

/**
 * Konfigurasi dan Inisialisasi Grafik Chart.js dari Data Dinamis Database
 * @param {HTMLElement} container
 * @param {Object} metrics - Hasil olahan data dari database
 */
function initCharts(container, metrics) {
  if (!window.Chart) return;

  // Hancurkan instance lama jika ada
  if (lineChartInstance) {
    lineChartInstance.destroy();
    lineChartInstance = null;
  }
  if (doughnutChartInstance) {
    doughnutChartInstance.destroy();
    doughnutChartInstance = null;
  }

  // --- GRAFIK 1: LINE CHART TREN PIKET 7 HARI TERAKHIR ---
  const lineCtx = container.querySelector('#piketTrendChart');
  if (lineCtx) {
    lineChartInstance = new window.Chart(lineCtx, {
      type: 'line',
      data: {
        labels: metrics.trendData.labels,
        datasets: [
          {
            label: 'Target Poin (13 Poin)',
            data: metrics.trendData.target,
            borderColor: '#94a3b8',
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0.3
          },
          {
            label: 'Realita Poin Piket',
            data: metrics.trendData.realita,
            borderColor: '#1b4332',
            backgroundColor: 'rgba(27, 67, 50, 0.08)',
            borderWidth: 3,
            pointBackgroundColor: '#1b4332',
            pointRadius: 4,
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 12,
              font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            padding: 10,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 10 } }
          },
          y: {
            beginAtZero: true,
            suggestedMax: 15,
            grid: { color: '#f1f5f9' },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 10 } }
          }
        }
      }
    });
  }

  // --- GRAFIK 2: DOUGHNUT CHART PROPORSI KONDISI SEKOLAH ---
  const doughnutCtx = container.querySelector('#kondisiProporsiChart');
  if (doughnutCtx) {
    doughnutChartInstance = new window.Chart(doughnutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Bersih / Aman', 'Cukup Terawat', 'Bermasalah / Perlu Action'],
        datasets: [
          {
            data: metrics.proporsiData,
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              padding: 15,
              font: { family: 'Plus Jakarta Sans', size: 10, weight: '600' }
            }
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return ` ${context.label}: ${context.raw}%`;
              }
            }
          }
        },
        cutout: '70%'
      }
    });
  }
}