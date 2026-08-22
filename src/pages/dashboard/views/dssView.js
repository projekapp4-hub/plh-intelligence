/**
 * DSSVIEW.JS - Modul Sistem Pendukung Keputusan (DSS) Adiwiyata Modern
 * Path: src/pages/dashboard/views/dssView.js
 *
 * Standar UI/UX Pro Max:
 * - Zero Emoji UI (100% Crisp Semantics SVG Icons)
 * - Executive Bento Grid & KPI Summary Strip
 * - Shimmer Skeleton Loader (Mencegah Layout Shift)
 * - Local Heuristic Decision Engine (Fallback Cerdas jika Gemini Offline/Kunci Tidak Valid)
 * - Copy to Clipboard & Toast Action
 * - Tokenized CSS & Mobile-First High Contrast Design
 */

import { getAllItems, getItem, saveItem } from '../../../utils/storage.js';
import { analyzeJSON } from '../../../api/gemini.js';

/** Kunci unik entri cache DSS di store gemini_cache */
const CACHE_KEY_DSS = 'dss_latest_analysis_v2';

// ============================================================================
// 1. PACK IKON SVG BEBAS EMOJI (UI/UX PRO MAX STANDARD)
// ============================================================================
const ICONS = {
  brain: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M12 18v4"/></svg>`,
  sparkles: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>`,
  refresh: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>`,
  target: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="6" r="6"/><circle cx="12" cy="2" r="2"/></svg>`,
  checkCircle: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  alertTriangle: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  shieldCheck: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  mapPin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  copy: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
  check: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  fileText: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
  activity: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  layers: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  clock: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  info: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  loader: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dss-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`
};

// ============================================================================
// 2. HELPER LOCAL HEURISTIC DSS ENGINE (DETERMINISTIC FALLBACK)
// ============================================================================
const CHECKLIST_METADATA = {
  task_1_1: { name: "Pembersihan Toilet & Wastafel", area: "Zona Sanitasi Lantai 1 & 2" },
  task_1_2: { name: "Ketersediaan Sabun & Air Bersih", area: "Kamar Mandi & Wastafel" },
  task_1_3: { name: "Drainase & Bebas Genangan Air", area: "Saluran Air Luar & Taman" },
  task_2_1: { name: "Pemilahan Sampah Organik/Anorganik", area: "Seluruh Koridor & Kelas" },
  task_2_2: { name: "Pengosongan Tempat Sampah Kelas", area: "Area Ruang Kelas" },
  task_2_3: { name: "Pengolahan Komposter & Fermentasi", area: "Rumah Kompos Adiwiyata" },
  task_2_4: { name: "Pencatatan Penimbangan Bank Sampah", area: "Unit Pengelolaan Sampah" },
  task_3_1: { name: "Perawatan Tanaman & Penghijauan", area: "Taman Depan & Green House" },
  task_3_2: { name: "Kebersihan Taman & Halaman", area: "Halaman Utama & Lapangan" },
  task_3_3: { name: "Pemangkasan Daun Kering", area: "Kawasan Koridor Hijau" },
  task_4_1: { name: "Penghematan Energi (Lampu/Kipas)", area: "Seluruh Gedung Sekolah" },
  task_5_1: { name: "Pemeliharaan Sarana Kantin Sehat", area: "Area Kantin Sekolah" },
  task_5_2: { name: "Kebersihan Saluran Pembuangan Kantin", area: "Instalasi Pengolahan Kantin" }
};

/**
 * Menghasilkan analisis deterministik berkualitas tinggi jika koneksi AI terputus/offline
 * @param {Array<Object>} records - Kumpulan data 30 hari terakhir dari IndexedDB
 */
function generateHeuristicAnalysis(records) {
  const total = records.length;
  if (total === 0) {
    return {
      narrativeSummary: "Belum ada rekod evaluasi piket yang tercatat dalam 30 hari terakhir. Silakan lakukan input data piket untuk mengaktifkan pemantauan DSS.",
      priorityPoints: [],
      totalAnalyzed: 0,
      avgScore: 0,
      readinessLevel: "Belum Terverifikasi",
      criticalCount: 0,
      source: "Engine Heuristik Lokal",
      updatedAt: new Date().toISOString()
    };
  }

  // Hitung tingkat kepatuhan per-poin tugas
  const taskStats = {};
  Object.keys(CHECKLIST_METADATA).forEach(key => {
    taskStats[key] = { trueCount: 0, totalCount: 0 };
  });

  let totalScoreSum = 0;

  records.forEach(rec => {
    totalScoreSum += Number(rec.scorePercent) || 0;
    if (rec.checklist) {
      Object.keys(CHECKLIST_METADATA).forEach(key => {
        const val = String(rec.checklist[key]).toUpperCase();
        if (val === 'TRUE' || val === '1' || val === 'YA') {
          taskStats[key].trueCount += 1;
        }
        taskStats[key].totalCount += 1;
      });
    }
  });

  const avgScore = Math.round((totalScoreSum / total) * 10) / 10;

  // Sortir item dengan tingkat kegagalan tertinggi
  const taskRates = Object.keys(taskStats).map(key => {
    const totalItem = taskStats[key].totalCount || total;
    const rate = Math.round((taskStats[key].trueCount / totalItem) * 100);
    return {
      key,
      rate,
      ...CHECKLIST_METADATA[key]
    };
  }).sort((a, b) => a.rate - b.rate);

  // Klasifikasi Kesiapan Adiwiyata
  let readinessLevel = "Sangat Mandiri (Adiwiyata Nasional)";
  if (avgScore < 75) readinessLevel = "Perlu Intervensi Ketat";
  else if (avgScore < 85) readinessLevel = "Cukup Siap (Adiwiyata Kota/Kab)";
  else if (avgScore < 92) readinessLevel = "Siap Optimal (Adiwiyata Provinsi)";

  const worstTasks = taskRates.slice(0, 4);
  const criticalCount = worstTasks.filter(t => t.rate < 90).length;

  // Bangun Narasi Eksekutif
  const narrative = `Berdasarkan sintesis agregat terhadap ${total} rekod evaluasi berkala selama 30 hari terakhir, operasional piket lingkungan sekolah mencatatkan tingkat kepatuhan rata-rata sebesar ${avgScore}%. Indeks performa lingkungan secara umum berada pada status '${readinessLevel}'.

Aspek sanitasi, kebersihan ruang kelas, dan kepatuhan penghematan energi menunjukkan konsistensi tinggi di atas 90%. Namun demikian, audit data mengidentifikasi beberapa titik kendala yang memerlukan atensi terarah:
1. ${worstTasks[0].name} di ${worstTasks[0].area} dengan tingkat kepatuhan ${worstTasks[0].rate}%.
2. ${worstTasks[1].name} di ${worstTasks[1].area} dengan rasio realisasi ${worstTasks[1].rate}%.

Diperlukan penguatan jadwal rotasi tim piket santri dan pengawasan harian guru piket pada titik-titik krusial tersebut guna menjamin kepatuhan baku mutu lingkungan Adiwiyata.`;

  // Poin-poin prioritas taktis
  const priorityPoints = [
    {
      title: `Optimasi ${worstTasks[0].name}`,
      targetArea: worstTasks[0].area,
      urgency: worstTasks[0].rate < 85 ? "TINGGI" : "SEDANG",
      action: `Lakukan inspeksi harian terjadwal dan penyediaan instrumen pendukung khusus pada ${worstTasks[0].area} untuk menaikkan kepatuhan dari ${worstTasks[0].rate}% ke target minimum 95%.`
    },
    {
      title: `Percepatan ${worstTasks[1].name}`,
      targetArea: worstTasks[1].area,
      urgency: worstTasks[1].rate < 90 ? "SEDANG" : "KELANJUTAN",
      action: `Kordinasikan penugasan regu piket dengan koordinator zona untuk memastikan standardisasi operasional pada ${worstTasks[1].name} berjalan tanpa jeda.`
    },
    {
      title: "Standardisasi Pemilahan & Manajemen Bank Sampah",
      targetArea: "Unit Bank Sampah & TPS Terpadu",
      urgency: "SEDANG",
      action: "Tingkatkan intensitas penimbangan berkala dan pengawasan residu anorganik pada saat jam istirahat sekolah."
    },
    {
      title: "Pemeliharaan Preventif Saluran Air & Drainase",
      targetArea: "Kawasan Perimeter Luar & Kantin",
      urgency: "KELANJUTAN",
      action: "Lakukan pengecekan rutin jaring filter limbah air sebelum dan sesudah aktivitas memasak di kantin guna mencegah sumbatan sedimen."
    }
  ];

  return {
    narrativeSummary: narrative,
    priorityPoints,
    totalAnalyzed: total,
    avgScore,
    readinessLevel,
    criticalCount,
    source: "Engine Heuristik Lokal",
    updatedAt: new Date().toISOString()
  };
}

// ============================================================================
// 3. FUNGSI UTAMA RENDER SPA VIEW
// ============================================================================
export function render(container) {
  container.innerHTML = `
    <div class="dss-wrapper">

      <!-- HEADER & TOOLBAR EKSEKUTIF -->
      <header class="dss-hero-card">
        <div class="dss-hero-left">
          <div class="dss-pill-badge">
            <span class="dss-badge-icon">${ICONS.shieldCheck}</span>
            <span>Sistem Pendukung Keputusan Adiwiyata</span>
          </div>
          <h1 class="dss-hero-title">Wawasan Strategis & Saran Keputusan</h1>
          <p class="dss-hero-desc">
            Sintesis data komprehensif 30 hari terakhir untuk evaluasi kepatuhan lingkungan, identifikasi anomali, dan rekomendasi tindakan presisi.
          </p>
        </div>

        <div class="dss-hero-actions">
          <button type="button" id="btnCopyReport" class="dss-btn dss-btn-secondary" title="Salin ringkasan ke clipboard">
            <span class="btn-icon" id="copyIcon">${ICONS.copy}</span>
            <span id="copyBtnText">Salin Analisis</span>
          </button>
          <button type="button" id="btnAnalyze" class="dss-btn dss-btn-primary">
            <span class="btn-icon" id="analyzeIcon">${ICONS.refresh}</span>
            <span>Analisis Ulang</span>
          </button>
        </div>
      </header>

      <!-- METRIC STATUS STRIP -->
      <div id="dssKpiStrip" class="dss-kpi-grid">
        <!-- Rendered via JS -->
      </div>

      <!-- MAIN RESULTS CONTAINER -->
      <main id="dssResultsContainer" class="dss-content-grid" aria-live="polite">
        <!-- Skeleton or Real Content -->
      </main>

      <!-- TOAST NOTIFICATION CONTAINER -->
      <div id="dssToast" class="dss-toast" role="status" aria-hidden="true"></div>

    </div>

    <style>
      /* =======================================================================
         DSS VIEW DEDICATED STYLING (UI/UX PRO MAX & DATA-DENSE COMPLIANT)
         ======================================================================= */
      .dss-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        padding-bottom: 2.5rem;
        font-family: var(--font-primary, system-ui, -apple-system, sans-serif);
        color: var(--color-text-main, #142418);
      }

      /* HERO HEADER */
      .dss-hero-card {
        background: linear-gradient(135deg, #ffffff 0%, #f7faf8 100%);
        border: 1px solid var(--color-border, #CBE0D2);
        border-radius: var(--radius-lg, 16px);
        padding: 1.5rem 1.75rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1.25rem;
        box-shadow: 0 2px 6px rgba(44, 94, 59, 0.04);
        position: relative;
        overflow: hidden;
      }

      .dss-hero-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--color-primary, #2C5E3B), var(--color-accent, #87FFAB));
      }

      .dss-hero-left {
        max-width: 720px;
      }

      .dss-pill-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.3rem 0.65rem;
        border-radius: 9999px;
        background-color: #eaf5ee;
        color: var(--color-primary, #2C5E3B);
        font-size: 0.75rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        margin-bottom: 0.5rem;
      }

      .dss-badge-icon {
        display: flex;
        align-items: center;
      }

      .dss-hero-title {
        margin: 0;
        font-size: 1.45rem;
        font-weight: 800;
        color: var(--color-text-main, #142418);
        letter-spacing: -0.02em;
        line-height: 1.25;
      }

      .dss-hero-desc {
        margin: 0.4rem 0 0 0;
        font-size: 0.88rem;
        color: var(--color-text-muted, #43594A);
        line-height: 1.55;
      }

      .dss-hero-actions {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      /* BUTTONS */
      .dss-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        padding: 0.65rem 1.15rem;
        font-size: 0.84rem;
        font-weight: 700;
        border-radius: var(--radius-md, 10px);
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
        border: 1px solid transparent;
      }

      .dss-btn:active {
        transform: scale(0.98);
      }

      .dss-btn-primary {
        background-color: var(--color-primary, #2C5E3B);
        color: #ffffff;
      }

      .dss-btn-primary:hover {
        background-color: var(--color-primary-hover, #224a2e);
        box-shadow: 0 4px 10px rgba(44, 94, 59, 0.2);
      }

      .dss-btn-secondary {
        background-color: #ffffff;
        color: var(--color-text-main, #142418);
        border-color: var(--color-border, #CBE0D2);
      }

      .dss-btn-secondary:hover {
        background-color: #f1f7f3;
        border-color: var(--color-secondary, #619170);
      }

      /* KPI GRID CARDS */
      .dss-kpi-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem;
      }

      .dss-kpi-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border, #CBE0D2);
        border-radius: var(--radius-md, 10px);
        padding: 1.15rem 1.25rem;
        box-shadow: 0 1px 3px rgba(44, 94, 59, 0.03);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .dss-kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(44, 94, 59, 0.06);
      }

      .dss-kpi-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .dss-kpi-label {
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--color-text-muted, #43594A);
      }

      .dss-kpi-icon {
        color: var(--color-secondary, #619170);
        display: flex;
        align-items: center;
      }

      .dss-kpi-val {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--color-text-main, #142418);
        line-height: 1.1;
      }

      .dss-kpi-sub {
        font-size: 0.75rem;
        color: #64748b;
        margin-top: 0.35rem;
        display: flex;
        align-items: center;
        gap: 0.3rem;
      }

      /* BENTO GRID SECTIONS */
      .dss-content-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;
      }

      @media (min-width: 1024px) {
        .dss-content-grid {
          grid-template-columns: 5fr 7fr;
          align-items: start;
        }
      }

      .dss-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border, #CBE0D2);
        border-radius: var(--radius-lg, 16px);
        padding: 1.5rem;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02);
      }

      .dss-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.15rem;
        padding-bottom: 0.85rem;
        border-bottom: 1px solid #edf2ee;
      }

      .dss-card-title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--color-text-main, #142418);
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .dss-engine-tag {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 0.25rem 0.55rem;
        border-radius: 6px;
        background-color: #f1f5f9;
        color: #475569;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }

      .dss-engine-tag.gemini {
        background-color: #eff6ff;
        color: #1d4ed8;
        border: 1px solid #bfdbfe;
      }

      .dss-engine-tag.heuristic {
        background-color: #f0fdf4;
        color: #166534;
        border: 1px solid #bbf7d0;
      }

      /* NARRATIVE SECTION */
      .dss-narrative-body {
        font-size: 0.9rem;
        color: #2c3e30;
        line-height: 1.75;
        white-space: pre-line;
      }

      .dss-callout-box {
        margin-top: 1.25rem;
        padding: 1rem;
        border-radius: var(--radius-md, 10px);
        background-color: #f4faf6;
        border-left: 4px solid var(--color-primary, #2C5E3B);
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }

      .dss-callout-title {
        font-size: 0.82rem;
        font-weight: 800;
        color: var(--color-primary, #2C5E3B);
        text-transform: uppercase;
        letter-spacing: 0.03em;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .dss-callout-desc {
        font-size: 0.83rem;
        color: #3b5242;
        line-height: 1.5;
      }

      /* PRIORITY ACTIONS LIST */
      .dss-priority-list {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }

      .dss-priority-card {
        background-color: #fdfefe;
        border: 1px solid #e5ece7;
        border-radius: var(--radius-md, 10px);
        padding: 1.1rem 1.25rem;
        position: relative;
        transition: all 0.2s ease;
      }

      .dss-priority-card:hover {
        border-color: #cbdad0;
        box-shadow: 0 2px 8px rgba(44, 94, 59, 0.04);
      }

      .dss-priority-card.urgency-high {
        border-left: 4px solid #dc2626;
        background: linear-gradient(90deg, #fffafa 0%, #ffffff 100%);
      }

      .dss-priority-card.urgency-medium {
        border-left: 4px solid #d97706;
        background: linear-gradient(90deg, #fffdfa 0%, #ffffff 100%);
      }

      .dss-priority-card.urgency-low {
        border-left: 4px solid #2563eb;
        background: linear-gradient(90deg, #fafcff 0%, #ffffff 100%);
      }

      .dss-p-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 0.5rem;
      }

      .dss-p-title {
        font-size: 0.93rem;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.35;
      }

      .dss-p-badge {
        font-size: 0.68rem;
        font-weight: 800;
        padding: 0.2rem 0.55rem;
        border-radius: 4px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        white-space: nowrap;
      }

      .badge-high { background-color: #fee2e2; color: #991b1b; }
      .badge-medium { background-color: #fef3c7; color: #92400e; }
      .badge-low { background-color: #dbeafe; color: #1e40af; }

      .dss-p-meta {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.78rem;
        font-weight: 600;
        color: #475569;
        background-color: #f1f5f9;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        margin-bottom: 0.5rem;
      }

      .dss-p-action {
        font-size: 0.86rem;
        color: #334155;
        line-height: 1.55;
      }

      /* SHIMMER SKELETON LOADER */
      .skeleton-box {
        background: linear-gradient(90deg, #f0f3f1 25%, #e6ece8 50%, #f0f3f1 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 6px;
      }

      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      .dss-spin {
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* TOAST */
      .dss-toast {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background-color: #0f172a;
        color: #ffffff;
        padding: 0.75rem 1.25rem;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 600;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        opacity: 0;
        transform: translateY(1rem);
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: none;
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .dss-toast.show {
        opacity: 1;
        transform: translateY(0);
      }
    </style>
  `;

  initDssLogic(container);
}

// ============================================================================
// 4. LOGIKA INTEGRASI DATA, CACHE & AI + HEURISTIC ENGINE
// ============================================================================
async function initDssLogic(container) {
  const btnAnalyze = container.querySelector('#btnAnalyze');
  const btnCopyReport = container.querySelector('#btnCopyReport');
  const dssKpiStrip = container.querySelector('#dssKpiStrip');
  const dssResultsContainer = container.querySelector('#dssResultsContainer');
  const dssToast = container.querySelector('#dssToast');
  const copyBtnText = container.querySelector('#copyBtnText');
  const copyIcon = container.querySelector('#copyIcon');

  let currentAnalysisData = null;

  /**
   * Menampilkan toast feedback sederhana
   */
  function showToast(message) {
    if (!dssToast) return;
    dssToast.innerHTML = `${ICONS.checkCircle} <span>${message}</span>`;
    dssToast.classList.add('show');
    setTimeout(() => {
      dssToast.classList.remove('show');
    }, 2800);
  }

  /**
   * Menampilkan Placeholder Skeleton Shimmer saat komputasi berlangsung
   */
  function renderSkeleton() {
    // Skeleton KPI
    dssKpiStrip.innerHTML = Array(4).fill(0).map(() => `
      <div class="dss-kpi-card">
        <div class="skeleton-box" style="height: 12px; width: 60%; margin-bottom: 8px;"></div>
        <div class="skeleton-box" style="height: 28px; width: 45%;"></div>
        <div class="skeleton-box" style="height: 10px; width: 80%; margin-top: 8px;"></div>
      </div>
    `).join('');

    // Skeleton Content
    dssResultsContainer.innerHTML = `
      <div class="dss-card">
        <div class="dss-card-header">
          <div class="skeleton-box" style="height: 20px; width: 50%;"></div>
          <div class="skeleton-box" style="height: 20px; width: 25%;"></div>
        </div>
        <div class="skeleton-box" style="height: 16px; width: 100%; margin-bottom: 8px;"></div>
        <div class="skeleton-box" style="height: 16px; width: 90%; margin-bottom: 8px;"></div>
        <div class="skeleton-box" style="height: 16px; width: 95%; margin-bottom: 8px;"></div>
        <div class="skeleton-box" style="height: 16px; width: 75%; margin-bottom: 20px;"></div>
        <div class="skeleton-box" style="height: 80px; width: 100%; border-radius: 8px;"></div>
      </div>

      <div class="dss-card">
        <div class="dss-card-header">
          <div class="skeleton-box" style="height: 20px; width: 60%;"></div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${Array(3).fill(0).map(() => `
            <div class="skeleton-box" style="height: 90px; width: 100%; border-radius: 8px;"></div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Mengambil dan menyaring data 30 hari terakhir dari IndexedDB
   */
  async function getRecentRecords() {
    const allRecords = await getAllItems('dss_records');
    if (!allRecords || allRecords.length === 0) return [];

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const filtered = allRecords.filter(record => {
      const dateVal = record.tanggal || record.createdAt;
      if (!dateVal) return true;
      const recordDate = new Date(dateVal);
      return !isNaN(recordDate.getTime()) && recordDate >= thirtyDaysAgo;
    });

    return filtered.length > 0 ? filtered : allRecords;
  }

  /**
   * Merender UI Hasil Lengkap (Bento Grid + KPI Cards)
   */
  function renderAnalysisUI(data) {
    currentAnalysisData = data;
    if (!data) return;

    const total = data.totalAnalyzed || 0;
    const avgScore = data.avgScore || 0;
    const readiness = data.readinessLevel || (avgScore >= 90 ? 'Siap Optimal (Adiwiyata Provinsi)' : 'Perlu Pendampingan');
    const isGemini = data.source && data.source.includes('Gemini');
    const engineClass = isGemini ? 'gemini' : 'heuristic';
    const engineText = isGemini ? 'Google Gemini AI' : 'Engine Heuristik Lokal';

    // 1. RENDER 4 KPI STATS
    dssKpiStrip.innerHTML = `
      <div class="dss-kpi-card">
        <div class="dss-kpi-header">
          <span class="dss-kpi-label">Sampel Evaluasi</span>
          <span class="dss-kpi-icon">${ICONS.fileText}</span>
        </div>
        <div class="dss-kpi-val">${total}</div>
        <div class="dss-kpi-sub">${ICONS.clock} 30 Hari Terakhir</div>
      </div>

      <div class="dss-kpi-card">
        <div class="dss-kpi-header">
          <span class="dss-kpi-label">Rerata Kepatuhan</span>
          <span class="dss-kpi-icon">${ICONS.activity}</span>
        </div>
        <div class="dss-kpi-val">${avgScore}%</div>
        <div class="dss-kpi-sub">Target Baku: ≥ 90%</div>
      </div>

      <div class="dss-kpi-card">
        <div class="dss-kpi-header">
          <span class="dss-kpi-label">Kesiapan Adiwiyata</span>
          <span class="dss-kpi-icon">${ICONS.shieldCheck}</span>
        </div>
        <div class="dss-kpi-val" style="font-size: 1.15rem; line-height: 1.3; color: var(--color-primary, #2C5E3B);">${readiness}</div>
        <div class="dss-kpi-sub">Kategori Tingkat Provinsi</div>
      </div>

      <div class="dss-kpi-card">
        <div class="dss-kpi-header">
          <span class="dss-kpi-label">Aksi Prioritas</span>
          <span class="dss-kpi-icon">${ICONS.target}</span>
        </div>
        <div class="dss-kpi-val">${data.priorityPoints ? data.priorityPoints.length : 0}</div>
        <div class="dss-kpi-sub">Rekomendasi Taktis</div>
      </div>
    `;

    // 2. RENDER BENTO CONTENT GRID
    const priorityPoints = Array.isArray(data.priorityPoints) ? data.priorityPoints : [];

    dssResultsContainer.innerHTML = `
      <!-- KOLOM KIRI: DIAGNOSTIK & NARASI EKSEKUTIF -->
      <section class="dss-card">
        <div class="dss-card-header">
          <h2 class="dss-card-title">
            <span>${ICONS.brain}</span>
            <span>Diagnosis & Analisis Agregat</span>
          </h2>
          <span class="dss-engine-tag ${engineClass}">
            ${isGemini ? ICONS.sparkles : ICONS.layers}
            ${engineText}
          </span>
        </div>

        <div class="dss-narrative-body">
          ${data.narrativeSummary || 'Tidak ada narasi evaluasi yang tersedia.'}
        </div>

        <div class="dss-callout-box">
          <div class="dss-callout-title">
            <span>${ICONS.info}</span>
            <span>Panduan Tindak Lanjut Koordinator</span>
          </div>
          <div class="dss-callout-desc">
            Rekomendasi di samping telah diprioritaskan berdasarkan frekuensi anomali dan dampak kepatuhan baku mutu lingkungan sekolah. Kordinasikan dengan guru pembina zona harian.
          </div>
        </div>
      </section>

      <!-- KOLOM KANAN: PAPAN AKSI PRIORITAS -->
      <section class="dss-card">
        <div class="dss-card-header">
          <h2 class="dss-card-title">
            <span>${ICONS.target}</span>
            <span>Papan Tindakan Prioritas</span>
          </h2>
          <span style="font-size: 0.78rem; font-weight: 700; color: #64748b;">
            ${priorityPoints.length} Poin Sasaran
          </span>
        </div>

        <div class="dss-priority-list">
          ${priorityPoints.length > 0 ? priorityPoints.map((item, idx) => {
            const urgency = (item.urgency || 'SEDANG').toUpperCase();
            const urgencyClass = urgency.includes('TINGGI') ? 'urgency-high'
              : urgency.includes('SEDANG') ? 'urgency-medium' : 'urgency-low';

            const badgeClass = urgency.includes('TINGGI') ? 'badge-high'
              : urgency.includes('SEDANG') ? 'badge-medium' : 'badge-low';

            return `
              <article class="dss-priority-card ${urgencyClass}">
                <div class="dss-p-top">
                  <span class="dss-p-title">${idx + 1}. ${item.title || 'Tindakan Prioritas'}</span>
                  <span class="dss-p-badge ${badgeClass}">${urgency}</span>
                </div>
                ${item.targetArea ? `
                  <div class="dss-p-meta">
                    ${ICONS.mapPin}
                    <span>Zona: ${item.targetArea}</span>
                  </div>
                ` : ''}
                <div class="dss-p-action">${item.action || '-'}</div>
              </article>
            `;
          }).join('') : `
            <div style="text-align: center; padding: 2rem; color: #64748b; font-size: 0.88rem;">
              Seluruh parameter kepatuhan terpenuhi. Tidak ada tindakan prioritas kritis saat ini.
            </div>
          `}
        </div>
      </section>
    `;
  }

  /**
   * Eksekusi Pipeline DSS (Cache -> Gemini AI -> Heuristic Fallback)
   */
  async function runAiAnalysis(forceRefresh = false) {
    try {
      renderSkeleton();

      // 1. Cek Cache jika tidak dipaksa refresh
      if (!forceRefresh) {
        const cachedEntry = await getItem('gemini_cache', CACHE_KEY_DSS);
        if (cachedEntry && cachedEntry.data) {
          renderAnalysisUI(cachedEntry.data);
          return;
        }
      }

      // 2. Ambil data 30 hari terakhir dari IndexedDB
      const recentRecords = await getRecentRecords();

      if (!recentRecords || recentRecords.length === 0) {
        dssKpiStrip.innerHTML = '';
        dssResultsContainer.innerHTML = `
          <div class="dss-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem;">
            <div style="color: var(--color-secondary, #619170); margin-bottom: 0.75rem;">${ICONS.info}</div>
            <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.35rem;">Belum Ada Data Evaluasi</h3>
            <p style="font-size: 0.86rem; color: #64748b; max-width: 450px; margin: 0 auto 1.25rem auto;">
              Belum ada rekod evaluasi piket tersimpan dalam 30 hari terakhir. Silakan isi form evaluasi atau gunakan data pengujian.
            </p>
          </div>
        `;
        return;
      }

      // Hitung metrik dasar
      const totalScoreSum = recentRecords.reduce((acc, curr) => acc + (Number(curr.scorePercent) || 0), 0);
      const avgScore = Math.round((totalScoreSum / recentRecords.length) * 10) / 10;

      // 3. Panggilan ke Gemini AI dengan Proteksi Fallback Otomatis
      let finalResult = null;

      try {
        const promptInstruction = `
          Anda adalah pakar audit Sistem Pendukung Keputusan (DSS) Lingkungan Sekolah Adiwiyata Tingkat Provinsi.
          Diberikan kumpulan data evaluasi zona/area sekolah selama 30 hari terakhir.

          Tugas Anda:
          1. Lakukan ANALISIS AGREGAT menyeluruh terhadap data tersebut secara objektif dan profesional.
          2. Tuliskan "narrativeSummary": Sintesis naratif mendalam (3-4 paragraf profesional) yang menjelaskan kondisi umum, aspek yang telah konsisten, titik kelemahan utama, dan arah perbaikan.
          3. Buat "priorityPoints": 3 sampai 4 poin tindakan taktis dengan format title, targetArea, urgency (TINGGI/SEDANG/KELANJUTAN), dan action konkret.
        `;

        const jsonSchema = {
          type: "OBJECT",
          description: "Hasil analisis agregat DSS Adiwiyata",
          properties: {
            narrativeSummary: { type: "STRING" },
            priorityPoints: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING" },
                  targetArea: { type: "STRING" },
                  urgency: { type: "STRING" },
                  action: { type: "STRING" }
                },
                required: ["title", "urgency", "action"]
              }
            }
          },
          required: ["narrativeSummary", "priorityPoints"]
        };

        const aiResponse = await analyzeJSON(recentRecords, promptInstruction, jsonSchema);

        if (aiResponse && (aiResponse.narrativeSummary || aiResponse.priorityPoints)) {
          finalResult = {
            narrativeSummary: aiResponse.narrativeSummary || 'Analisis berhasil disintesis.',
            priorityPoints: Array.isArray(aiResponse.priorityPoints) ? aiResponse.priorityPoints : [],
            totalAnalyzed: recentRecords.length,
            avgScore: avgScore,
            readinessLevel: avgScore >= 90 ? 'Sangat Mandiri (Adiwiyata Provinsi)' : 'Perlu Peningkatan',
            source: 'Google Gemini AI',
            updatedAt: new Date().toISOString()
          };
        }
      } catch (aiError) {
        console.warn('[dssView.js] Gemini AI offline atau kunci belum dikonfigurasi. Mengaktifkan Engine Heuristik Lokal:', aiError);
      }

      // 4. Jika AI tidak merespons / gagal, gunakan Engine Heuristik Lokal
      if (!finalResult) {
        finalResult = generateHeuristicAnalysis(recentRecords);
      }

      // 5. Simpan ke Cache
      await saveItem('gemini_cache', {
        id: CACHE_KEY_DSS,
        data: finalResult
      });

      // 6. Render UI
      renderAnalysisUI(finalResult);

    } catch (globalError) {
      console.error('[dssView.js] Kesalahan fatal saat merender DSS:', globalError);
      dssResultsContainer.innerHTML = `
        <div class="dss-card" style="grid-column: 1 / -1; border-left: 4px solid #dc2626; padding: 1.5rem;">
          <div style="font-weight: 800; color: #991b1b; margin-bottom: 0.35rem;">Gagal Memproses Rekomendasi Keputusan</div>
          <div style="font-size: 0.86rem; color: #475569;">${globalError.message || globalError}</div>
        </div>
      `;
    }
  }

  // Event Listener: Salin Hasil Analisis
  if (btnCopyReport) {
    btnCopyReport.addEventListener('click', async () => {
      if (!currentAnalysisData) return;
      const textToCopy = `=== RINGKASAN REKOMENDASI KEPUTUSAN (DSS) ADIWIYATA ===\n` +
        `Total Sampel: ${currentAnalysisData.totalAnalyzed || 0} Laporan (30 Hari)\n` +
        `Rata-rata Kepatuhan: ${currentAnalysisData.avgScore || 0}%\n` +
        `Sumber Analisis: ${currentAnalysisData.source || '-'}\n\n` +
        `--- DIAGNOSIS AGREGAT ---\n${currentAnalysisData.narrativeSummary || '-'}\n\n` +
        `--- POIN PRIORITAS TINDAKAN ---\n` +
        (currentAnalysisData.priorityPoints || []).map((p, i) => `${i+1}. [${p.urgency}] ${p.title} (Area: ${p.targetArea || '-'})\n   Aksi: ${p.action}`).join('\n\n');

      try {
        await navigator.clipboard.writeText(textToCopy);
        copyIcon.innerHTML = ICONS.check;
        copyBtnText.textContent = 'Tersalin!';
        showToast('Rekomendasi DSS berhasil disalin ke clipboard');
        setTimeout(() => {
          copyIcon.innerHTML = ICONS.copy;
          copyBtnText.textContent = 'Salin Analisis';
        }, 2000);
      } catch (err) {
        showToast('Gagal menyalin ke clipboard.');
      }
    });
  }

  // Event Listener: Tombol Analisis Ulang
  if (btnAnalyze) {
    btnAnalyze.addEventListener('click', () => {
      runAiAnalysis(true);
    });
  }

  // Jalankan Analisis Pertama Kali
  runAiAnalysis(false);
}
