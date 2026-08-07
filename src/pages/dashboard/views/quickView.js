/**
 * QUICKVIEW.JS - Modul Tampilan Utama (Dashboard Executive View)
 * Path: src/pages/dashboard/views/quickView.js
 * 
 * Berkas ini bertanggung jawab untuk merender visualisasi ringkas,
 * kartu metrik utama (KPI), dua grafik Chart.js (Line Chart & Doughnut Chart),
 * serta ringkasan wawasan AI dan pintasan navigasi cepat.
 */

// Menyimpan referensi chart agar dapat dihancurkan (destroy) saat re-render
let lineChartInstance = null;
let doughnutChartInstance = null;

/**
 * Fungsi pembantu untuk memastikan Chart.js telah termuat di window.
 * Jika belum, skrip CDN Chart.js v4 akan diinjeksi secara dinamis.
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
 * Fungsi utama render yang diekspor untuk dipanggil oleh router SPA (dashboard.js)
 * @param {HTMLElement} container - Elemen pembungkus #spaCanvas
 */
export async function render(container) {
  // 1. Injeksi Struktur HTML (Mobile-First Layout)
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
            <div class="metric-value">1,482</div>
            <div class="metric-trend trend-up">
              <span>▲ +12%</span> <span class="metric-subtitle">dibanding bulan lalu</span>
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
            <div class="metric-value">94.2%</div>
            <div class="metric-progress-bar">
              <div class="metric-progress-fill" style="width: 94.2%;"></div>
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
            <div class="metric-status-badge badge-sangat-baik">
              <span class="badge-dot"></span>
              Sangat Baik
            </div>
            <span class="metric-subtitle">Evaluasi Adiwiyata Hari Ini</span>
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
              <p class="chart-subtitle">Komparasi Target vs Realita Pelaksanaan Piket</p>
            </div>
            <span class="chart-tag">Mingguan</span>
          </div>
          <div class="chart-container">
            <canvas id="piketTrendChart"></canvas>
          </div>
        </div>

        <!-- Grafik 2: Doughnut Chart Proporsi Kondisi Sekolah Hari Ini -->
        <div class="chart-card">
          <div class="chart-card-header">
            <div>
              <h3 class="chart-title">Proporsi Kondisi Sekolah</h3>
              <p class="chart-subtitle">Rasio Kebersihan & Keasrian Area Hari Ini</p>
            </div>
            <span class="chart-tag">Hari Ini</span>
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
            <span class="ai-timestamp">Diperbarui 10 menit lalu</span>
          </div>
          <div class="ai-card-body">
            <p class="ai-text">
              Berdasarkan pemantauan grafik hari ini, <strong>70% area sekolah teridentifikasi Bersih/Aman</strong> dan kepatuhan jadwal mencapai <strong>94.2%</strong>. Namun, terdapat penurunan kehadiran piket di <em>Zona D (Taman Belakang & Kompos)</em> pada hari Kamis. Direkomendasikan untuk melakukan peninjauan alat kebersihan di area tersebut.
            </p>
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

    <!-- STYLING KHUSUS QUICKVIEW MODULE (Scoped via Inline Style Tag) -->
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

      /* 1. Metrics Grid (Top Section) */
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

      .badge-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #10b981;
      }

      /* 2. Charts Grid (Middle Section) */
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

      /* 3. AI Insight & Quick Actions Grid (Bottom Section) */
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
      }
    </style>
  `;

  // 2. Event Listener Tombol Pintas ke Form Input Data (formView)
  const quickInputBtn = container.querySelector('#quickInputBtn');
  if (quickInputBtn) {
    quickInputBtn.addEventListener('click', () => {
      const formViewBtn = document.querySelector('.spa-nav-btn[data-view="formView"]');
      if (formViewBtn) {
        formViewBtn.click();
      }
    });
  }

  // 3. Pemuatan Dinamis & Inisialisasi Chart.js
  try {
    await ensureChartJSLoaded();
    initCharts(container);
  } catch (err) {
    console.error('Gagal menginisialisasi Chart.js:', err);
  }
}

/**
 * Konfigurasi dan Inisialisasi Grafik Chart.js
 * @param {HTMLElement} container
 */
function initCharts(container) {
  if (!window.Chart) return;

  // Hancurkan instance grafik lama jika ada sebelum membuat baru
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
        labels: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
        datasets: [
          {
            label: 'Target Piket',
            data: [30, 30, 30, 30, 30, 25, 20],
            borderColor: '#94a3b8',
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0.3
          },
          {
            label: 'Realita Piket',
            data: [30, 29, 30, 24, 28, 25, 20],
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
            min: 15,
            max: 35,
            grid: { color: '#f1f5f9' },
            ticks: { font: { family: 'Plus Jakarta Sans', size: 10 } }
          }
        }
      }
    });
  }

  // --- GRAFIK 2: DOUGHNUT CHART PROPORSI KONDISI SEKOLAH HARI INI ---
  const doughnutCtx = container.querySelector('#kondisiProporsiChart');
  if (doughnutCtx) {
    doughnutChartInstance = new window.Chart(doughnutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Bersih / Aman', 'Cukup Terawat', 'Bermasalah / Perlu Action'],
        datasets: [
          {
            data: [70, 20, 10],
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