/**
 * DSSVIEW.JS - Modul Sistem Pendukung Keputusan (DSS) Agregat 30 Hari via Gemini AI
 * Path: src/pages/dashboard/views/dssView.js
 *
 * Standar UI/UX Pro Max:
 * - Zero Emoji UI (100% Crisp Semantics SVG Icons)
 * - Executive Bento Grid & KPI Summary Strip
 * - Shimmer Skeleton Loader (Mencegah Layout Shift)
 * - Error Banner Ramah Pengguna Awam jika Gemini AI tidak dapat diakses
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
  sparkles: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3 1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/></svg>`,
  refresh: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>`,
  target: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="6" r="6"/><circle cx="12" cy="2" r="2"/></svg>`,
  checkCircle: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  alertTriangle: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  shieldCheck: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  mapPin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  copy: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
  check: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  fileText: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
  activity: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  info: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  key: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>`,
  wifiOff: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.58 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>`,
  sliders: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="1" x2="7" y1="14" y2="14"/><line x1="9" x2="15" y1="8" y2="8"/><line x1="17" x2="23" y1="16" y2="16"/></svg>`,
  leaf: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
  droplets: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>`,
  zap: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  recycle: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 5.8 9.5l3.226-5.59a1.83 1.83 0 0 1 1.57-.882h4.808a1.83 1.83 0 0 1 1.57.882l1.6 2.772"/><path d="m10.5 7.5 3-3-3-3"/><path d="m18.5 15.5 3.5-3.5-3.5-3.5"/></svg>`,
  award: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  trendingUp: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>`
};

// ============================================================================
// 2. FUNGSI UTAMA RENDER SPA VIEW
// ============================================================================
export function render(container) {
  container.innerHTML = `
    <div class="dss-wrapper">

      <!-- HEADER & TOOLBAR EKSEKUTIF -->
      <header class="dss-hero-card">
        <div class="dss-hero-left">
          <div class="dss-pill-badge">
            <span class="dss-badge-icon">${ICONS.sparkles}</span>
            <span>Kecerdasan Buatan (AI) Adiwiyata</span>
          </div>
          <h1 class="dss-hero-title">Wawasan Strategis & Saran Keputusan</h1>
          <p class="dss-hero-desc">
            Sintesis agregat data evaluasi 30 hari terakhir untuk evaluasi kepatuhan lingkungan dan rekomendasi tindakan taktis via Google Gemini AI.
          </p>
        </div>

        <div class="dss-hero-actions">
          <button type="button" id="btnCopyReport" class="dss-btn dss-btn-secondary" title="Salin ringkasan ke clipboard" style="display: none;">
            <span class="btn-icon" id="copyIcon">${ICONS.copy}</span>
            <span id="copyBtnText">Salin Analisis</span>
          </button>
          <button type="button" id="btnAnalyze" class="dss-btn dss-btn-primary">
            <span class="btn-icon" id="analyzeIcon">${ICONS.refresh}</span>
            <span>Analisis Ulang AI</span>
          </button>
        </div>
      </header>

      <!-- METRIC STATUS STRIP -->
      <div id="dssKpiStrip" class="dss-kpi-grid">
        <!-- Rendered via JS -->
      </div>

      <!-- MAIN RESULTS CONTAINER -->
      <main id="dssResultsContainer" class="dss-content-grid" aria-live="polite">
        <!-- Skeleton, Error, or Real Content -->
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
        box-sizing: border-box;
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
        box-sizing: border-box;
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
        min-width: 0;
        flex: 1 1 300px;
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
        max-width: 100%;
        box-sizing: border-box;
      }

      .dss-badge-icon {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      .dss-hero-title {
        margin: 0;
        font-size: 1.45rem;
        font-weight: 800;
        color: var(--color-text-main, #142418);
        letter-spacing: -0.02em;
        line-height: 1.25;
        overflow-wrap: anywhere;
      }

      .dss-hero-desc {
        margin: 0.4rem 0 0 0;
        font-size: 0.88rem;
        color: var(--color-text-muted, #43594A);
        line-height: 1.55;
        overflow-wrap: anywhere;
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
        min-height: 44px;
        font-size: 0.84rem;
        font-weight: 700;
        border-radius: var(--radius-md, 10px);
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
        border: 1px solid transparent;
        box-sizing: border-box;
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

      .dss-btn-primary:disabled {
        background-color: #94a3b8;
        cursor: not-allowed;
        box-shadow: none;
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
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        width: 100%;
        box-sizing: border-box;
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
        box-sizing: border-box;
        min-width: 0;
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
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .dss-kpi-icon {
        color: var(--color-secondary, #619170);
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      .dss-kpi-val {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--color-text-main, #142418);
        line-height: 1.1;
        overflow-wrap: anywhere;
      }

      .dss-kpi-sub {
        font-size: 0.75rem;
        color: #64748b;
        margin-top: 0.35rem;
        display: flex;
        align-items: center;
        gap: 0.3rem;
        overflow-wrap: anywhere;
      }

      /* BENTO GRID SECTIONS */
      .dss-content-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.25rem;
        width: 100%;
        box-sizing: border-box;
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
        box-sizing: border-box;
        min-width: 0;
      }

      .dss-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.15rem;
        padding-bottom: 0.85rem;
        border-bottom: 1px solid #edf2ee;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .dss-card-title {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--color-text-main, #142418);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 0;
      }

      .dss-engine-tag {
        font-size: 0.7rem;
        font-weight: 700;
        padding: 0.25rem 0.55rem;
        border-radius: 6px;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        background-color: #eff6ff;
        color: #1d4ed8;
        border: 1px solid #bfdbfe;
        white-space: nowrap;
      }

      /* NARRATIVE SECTION */
      .dss-narrative-body {
        font-size: 0.9rem;
        color: #2c3e30;
        line-height: 1.75;
        white-space: pre-line;
        overflow-wrap: anywhere;
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
        box-sizing: border-box;
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
        overflow-wrap: anywhere;
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
        box-sizing: border-box;
        min-width: 0;
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
        overflow-wrap: anywhere;
      }

      .dss-p-badge {
        font-size: 0.68rem;
        font-weight: 800;
        padding: 0.2rem 0.55rem;
        border-radius: 4px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        white-space: nowrap;
        flex-shrink: 0;
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
        max-width: 100%;
        box-sizing: border-box;
      }

      .dss-p-action {
        font-size: 0.86rem;
        color: #334155;
        line-height: 1.55;
        overflow-wrap: anywhere;
      }

      /* USER-FRIENDLY ERROR STATE CARD */
      .dss-error-card {
        grid-column: 1 / -1;
        background: #ffffff;
        border: 1px solid #fee2e2;
        border-top: 4px solid #ef4444;
        border-radius: var(--radius-lg, 16px);
        padding: 2.25rem 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.05);
        box-sizing: border-box;
      }

      .dss-error-icon-box {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        background-color: #fef2f2;
        color: #dc2626;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
        border: 1px solid #fecdd3;
        flex-shrink: 0;
      }

      .dss-error-title {
        font-size: 1.2rem;
        font-weight: 800;
        color: #991b1b;
        margin: 0 0 0.5rem 0;
        overflow-wrap: anywhere;
      }

      .dss-error-message {
        font-size: 0.92rem;
        color: #475569;
        max-width: 580px;
        line-height: 1.6;
        margin: 0 0 1.25rem 0;
        overflow-wrap: anywhere;
      }

      .dss-error-hint-box {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: var(--radius-md, 10px);
        padding: 1rem 1.25rem;
        text-align: left;
        max-width: 580px;
        width: 100%;
        margin-bottom: 1.5rem;
        box-sizing: border-box;
      }

      .dss-error-hint-title {
        font-size: 0.8rem;
        font-weight: 700;
        color: #334155;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        margin-bottom: 0.4rem;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .dss-error-hint-list {
        margin: 0;
        padding-left: 1.2rem;
        font-size: 0.84rem;
        color: #64748b;
        line-height: 1.55;
        overflow-wrap: anywhere;
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
        max-width: calc(100vw - 2rem);
        box-sizing: border-box;
      }

      .dss-toast.show {
        opacity: 1;
        transform: translateY(0);
      }

      /* =======================================================================
         POLICY SANDBOX SIMULATOR DEDICATED STYLES
         ======================================================================= */
      .dss-sandbox-card {
        grid-column: 1 / -1;
        background: #ffffff;
        border: 1px solid var(--color-border, #CBE0D2);
        border-radius: var(--radius-lg, 16px);
        padding: 1.5rem 1.75rem;
        box-shadow: 0 4px 16px rgba(44, 94, 59, 0.05);
        box-sizing: border-box;
        min-width: 0;
      }

      .dss-sandbox-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 1rem;
        padding-bottom: 1.25rem;
        border-bottom: 1px solid #eef4f0;
        margin-bottom: 1.25rem;
        width: 100%;
        box-sizing: border-box;
      }

      .dss-sandbox-header-info {
        flex: 1 1 280px;
        min-width: 0;
      }

      .dss-sandbox-presets {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: #f1f7f3;
        padding: 0.3rem;
        border-radius: var(--radius-md, 10px);
        border: 1px solid var(--color-border, #CBE0D2);
        max-width: 100%;
        box-sizing: border-box;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
      }

      .dss-sandbox-presets::-webkit-scrollbar {
        display: none;
      }

      .dss-preset-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.35rem;
        padding: 0.5rem 0.85rem;
        min-height: 38px;
        font-size: 0.78rem;
        font-weight: 700;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: var(--color-text-muted, #43594A);
        cursor: pointer;
        transition: all 0.18s ease;
        white-space: nowrap;
        flex-shrink: 0;
        box-sizing: border-box;
      }

      .dss-preset-btn:hover {
        color: var(--color-primary, #2C5E3B);
      }

      .dss-preset-btn.active {
        background: #ffffff;
        color: var(--color-primary, #2C5E3B);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
      }

      .dss-sandbox-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        width: 100%;
        box-sizing: border-box;
      }

      @media (min-width: 1024px) {
        .dss-sandbox-grid {
          grid-template-columns: 6fr 6fr;
          gap: 2rem;
        }
      }

      .dss-sandbox-controls {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        min-width: 0;
      }

      .dss-control-header {
        display: flex;
        justify-content: space-between;
        font-size: 0.78rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text-muted, #43594A);
        padding-bottom: 0.25rem;
      }

      .dss-slider-group {
        background: #fafcfb;
        border: 1px solid #e2eee6;
        border-radius: var(--radius-md, 10px);
        padding: 0.75rem 0.95rem;
        display: flex;
        flex-direction: column;
        gap: 0.45rem;
        transition: border-color 0.2s ease, background-color 0.2s ease;
        min-width: 0;
        box-sizing: border-box;
      }

      .dss-slider-group:focus-within {
        border-color: var(--color-secondary, #619170);
        background: #ffffff;
      }

      .dss-slider-label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
        min-width: 0;
      }

      .dss-slider-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        min-width: 0;
        overflow: hidden;
      }

      .dss-slider-icon {
        color: var(--color-primary, #2C5E3B);
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      .dss-slider-name {
        font-size: 0.86rem;
        font-weight: 700;
        color: var(--color-text-main, #142418);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .dss-weight-tag {
        font-size: 0.7rem;
        font-weight: 700;
        color: #64748b;
        background: #edf3f0;
        padding: 0.1rem 0.4rem;
        border-radius: 4px;
        flex-shrink: 0;
      }

      .dss-slider-val {
        font-size: 0.92rem;
        font-weight: 800;
        color: var(--color-primary, #2C5E3B);
        font-variant-numeric: tabular-nums;
        flex-shrink: 0;
      }

      .dss-range-input {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 8px;
        border-radius: 999px;
        background: #d8e8dc;
        outline: none;
        margin: 0.4rem 0 0.15rem 0;
        cursor: pointer;
        box-sizing: border-box;
      }

      .dss-range-input::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--color-primary, #2C5E3B);
        border: 2px solid #ffffff;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
        cursor: pointer;
        transition: transform 0.15s ease, background-color 0.15s ease;
      }

      .dss-range-input::-webkit-slider-thumb:hover {
        transform: scale(1.15);
        background: var(--color-primary-hover, #224a2e);
      }

      .dss-range-input::-moz-range-thumb {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--color-primary, #2C5E3B);
        border: 2px solid #ffffff;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
        cursor: pointer;
      }

      .dss-sandbox-hud {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-width: 0;
      }

      .dss-hud-score-card {
        background: linear-gradient(135deg, #1d4029 0%, #2c5e3b 100%);
        color: #ffffff;
        border-radius: var(--radius-md, 12px);
        padding: 1.35rem 1.5rem;
        box-shadow: 0 6px 20px rgba(44, 94, 59, 0.2);
        box-sizing: border-box;
        min-width: 0;
      }

      .dss-hud-score-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.35rem;
        gap: 0.5rem;
      }

      .dss-hud-label {
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: #a8d5b8;
        overflow-wrap: anywhere;
      }

      .dss-hud-delta {
        font-size: 0.82rem;
        font-weight: 800;
        padding: 0.2rem 0.55rem;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;
        transition: all 0.2s ease;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .dss-hud-delta.positive {
        background: #87FFAB;
        color: #0d381e;
      }

      .dss-hud-delta.neutral {
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;
      }

      .dss-hud-delta.negative {
        background: #fca5a5;
        color: #7f1d1d;
      }

      .dss-hud-score-val {
        font-size: 2.6rem;
        font-weight: 900;
        letter-spacing: -0.03em;
        line-height: 1.1;
        font-variant-numeric: tabular-nums;
        margin-bottom: 0.5rem;
      }

      .dss-hud-readiness {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.88rem;
        font-weight: 700;
        color: #e2f5e8;
        overflow-wrap: anywhere;
      }

      .dss-hud-eco-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
        gap: 0.75rem;
        width: 100%;
        box-sizing: border-box;
      }

      .dss-eco-card {
        background: #fafcfb;
        border: 1px solid #e2eee6;
        border-radius: var(--radius-md, 10px);
        padding: 0.85rem;
        display: flex;
        align-items: center;
        gap: 0.65rem;
        min-width: 0;
        box-sizing: border-box;
      }

      .dss-eco-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .dss-eco-icon.co2 {
        background: #eafaf1;
        color: #1e7e34;
      }

      .dss-eco-icon.water {
        background: #e8f4fd;
        color: #0284c7;
      }

      .dss-eco-icon.energy {
        background: #fef9e7;
        color: #d97706;
      }

      .dss-eco-body {
        min-width: 0;
        flex: 1;
        overflow: hidden;
      }

      .dss-eco-val {
        font-size: 1rem;
        font-weight: 800;
        color: var(--color-text-main, #142418);
        font-variant-numeric: tabular-nums;
        line-height: 1.2;
        overflow-wrap: anywhere;
      }

      .dss-eco-lbl {
        font-size: 0.7rem;
        color: var(--color-text-muted, #43594A);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      /* =======================================================================
         MOBILE-FIRST RESPONSIVE BREAKPOINTS (UI/UX PRO MAX OVERFLOW-SAFE)
         ======================================================================= */
      @media (max-width: 768px) {
        .dss-hero-card {
          padding: 1.25rem 1rem;
        }

        .dss-hero-title {
          font-size: 1.25rem;
        }

        .dss-hero-actions {
          width: 100%;
        }

        .dss-hero-actions .dss-btn {
          flex: 1 1 auto;
        }

        .dss-kpi-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .dss-card {
          padding: 1.15rem 1rem;
        }

        .dss-sandbox-card {
          padding: 1.15rem 1rem;
        }

        .dss-hud-score-val {
          font-size: 2.2rem;
        }
      }

      @media (max-width: 480px) {
        .dss-kpi-grid {
          grid-template-columns: 1fr;
        }

        .dss-hud-eco-grid {
          grid-template-columns: 1fr;
        }

        .dss-sandbox-presets {
          width: 100%;
        }

        .dss-preset-btn {
          padding: 0.45rem 0.65rem;
          font-size: 0.75rem;
        }

        .dss-hero-title {
          font-size: 1.15rem;
        }

        .dss-hud-score-card {
          padding: 1.15rem 1rem;
        }

        .dss-hud-score-val {
          font-size: 1.9rem;
        }

        .dss-toast {
          left: 1rem;
          right: 1rem;
          bottom: 1rem;
          font-size: 0.8rem;
        }
      }
    </style>
  `;

  initDssLogic(container);
}

// ============================================================================
// 3. LOGIKA INTEGRASI DATA, CACHE & AI GEMINI
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
   * Menampilkan Placeholder Skeleton Shimmer saat pengolahan AI berlangsung
   */
  function renderSkeleton() {
    if (btnAnalyze) btnAnalyze.disabled = true;
    if (btnCopyReport) btnCopyReport.style.display = 'none';

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
   * Menghitung nilai kepatuhan dasar (baseline) 5 Pilar Adiwiyata dari data riil IndexedDB
   */
  function calculateBaselinePillars(records) {
    if (!records || records.length === 0) {
      return { B1: 80, B2: 80, B3: 80, B4: 80, B5: 80, overallAvg: 80 };
    }

    const pillarTasks = {
      B1: ['task_1_1', 'task_1_2', 'task_1_3'],
      B2: ['task_2_1', 'task_2_2', 'task_2_3', 'task_2_4'],
      B3: ['task_3_1', 'task_3_2', 'task_3_3'],
      B4: ['task_4_1'],
      B5: ['task_5_1', 'task_5_2']
    };

    const sums = {
      B1: { trueCount: 0, total: 0 },
      B2: { trueCount: 0, total: 0 },
      B3: { trueCount: 0, total: 0 },
      B4: { trueCount: 0, total: 0 },
      B5: { trueCount: 0, total: 0 }
    };

    records.forEach(r => {
      const cl = r.checklist || {};
      for (const [pillar, tasks] of Object.entries(pillarTasks)) {
        tasks.forEach(t => {
          if (cl[t] !== undefined) {
            sums[pillar].total += 1;
            if (cl[t] === true || cl[t] === 'TRUE' || cl[t] === 'true') {
              sums[pillar].trueCount += 1;
            }
          }
        });
      }
    });

    const getAvg = (pillar) => {
      if (sums[pillar].total === 0) return 80;
      return Math.round((sums[pillar].trueCount / sums[pillar].total) * 1000) / 10;
    };

    const B1 = getAvg('B1');
    const B2 = getAvg('B2');
    const B3 = getAvg('B3');
    const B4 = getAvg('B4');
    const B5 = getAvg('B5');

    // Skor kepatuhan agregat terbobot (20%, 25%, 20%, 15%, 20%)
    const overallAvg = Math.round((B1 * 0.20 + B2 * 0.25 + B3 * 0.20 + B4 * 0.15 + B5 * 0.20) * 10) / 10;

    return { B1, B2, B3, B4, B5, overallAvg };
  }

  /**
   * Menghitung Proyeksi Real-time Simulasi Kebijakan Adiwiyata & Eco-Impact
   */
  function calculateProjections(inputs, baselines) {
    const { I1, I2, I3, I4, I5 } = inputs;
    const { B1, B2, B3, B4, B5, overallAvg } = baselines;

    const S_proj = Math.round((I1 * 0.20 + I2 * 0.25 + I3 * 0.20 + I4 * 0.15 + I5 * 0.20) * 10) / 10;
    const deltaScore = Math.round((S_proj - overallAvg) * 10) / 10;

    let readiness = 'Perlu Intervensi Ketat';
    if (S_proj >= 90) {
      readiness = 'Adiwiyata Mandiri (Sangat Siap)';
    } else if (S_proj >= 80) {
      readiness = 'Adiwiyata Nasional (Optimal)';
    } else if (S_proj >= 70) {
      readiness = 'Adiwiyata Provinsi (Cukup Baik)';
    }

    // Perhitungan Metrik Dampak Lingkungan Nyata (Eco-Impact)
    const deltaI2 = Math.max(0, I2 - B2);
    const deltaI4 = Math.max(0, I4 - B4);
    const deltaI5 = Math.max(0, I5 - B5);

    const carbonReduction = Math.round((deltaI2 * 0.45 + deltaI4 * 0.85) * 10) / 10;
    const waterSaved = Math.round(deltaI5 * 32);
    const energySaved = Math.round(deltaI4 * 1.85 * 10) / 10;

    return {
      S_proj,
      deltaScore,
      readiness,
      carbonReduction,
      waterSaved,
      energySaved
    };
  }

  /**
   * Setup Event Binding & Reaktivitas Policy Sandbox Simulator
   */
  function setupSandboxInteractions(baselines, priorityPoints) {
    const s1 = container.querySelector('#sliderI1');
    const s2 = container.querySelector('#sliderI2');
    const s3 = container.querySelector('#sliderI3');
    const s4 = container.querySelector('#sliderI4');
    const s5 = container.querySelector('#sliderI5');

    const v1 = container.querySelector('#valSliderI1');
    const v2 = container.querySelector('#valSliderI2');
    const v3 = container.querySelector('#valSliderI3');
    const v4 = container.querySelector('#valSliderI4');
    const v5 = container.querySelector('#valSliderI5');

    const hudScore = container.querySelector('#hudProjectedScore');
    const hudDelta = container.querySelector('#hudDeltaBadge');
    const hudReadiness = container.querySelector('#hudReadinessLevel');
    const hudCarbon = container.querySelector('#hudCarbonVal');
    const hudWater = container.querySelector('#hudWaterVal');
    const hudEnergy = container.querySelector('#hudEnergyVal');

    const btnStatusQuo = container.querySelector('#btnPresetStatusQuo');
    const btnMandiri = container.querySelector('#btnPresetMandiri');
    const btnAi = container.querySelector('#btnPresetAi');

    if (!s1 || !s2 || !s3 || !s4 || !s5) return;

    function updateSimulation() {
      const inputs = {
        I1: Number(s1.value),
        I2: Number(s2.value),
        I3: Number(s3.value),
        I4: Number(s4.value),
        I5: Number(s5.value)
      };

      // Update nilai label slider
      if (v1) v1.textContent = `${inputs.I1}%`;
      if (v2) v2.textContent = `${inputs.I2}%`;
      if (v3) v3.textContent = `${inputs.I3}%`;
      if (v4) v4.textContent = `${inputs.I4}%`;
      if (v5) v5.textContent = `${inputs.I5}%`;

      // Hitung proyeksi
      const proj = calculateProjections(inputs, baselines);

      if (hudScore) hudScore.textContent = `${proj.S_proj}%`;
      if (hudReadiness) hudReadiness.textContent = proj.readiness;
      if (hudCarbon) hudCarbon.textContent = `+${proj.carbonReduction} kg`;
      if (hudWater) hudWater.textContent = `+${proj.waterSaved} L`;
      if (hudEnergy) hudEnergy.textContent = `+${proj.energySaved} kWh`;

      if (hudDelta) {
        const sign = proj.deltaScore > 0 ? '+' : '';
        hudDelta.textContent = `${sign}${proj.deltaScore}%`;
        hudDelta.className = `dss-hud-delta ${proj.deltaScore > 0 ? 'positive' : proj.deltaScore < 0 ? 'negative' : 'neutral'}`;
      }
    }

    [s1, s2, s3, s4, s5].forEach(slider => {
      slider.addEventListener('input', () => {
        // Reset state preset button saat pengguna custom geser
        [btnStatusQuo, btnMandiri, btnAi].forEach(b => b?.classList.remove('active'));
        updateSimulation();
      });
    });

    // Preset 1: Status Quo
    if (btnStatusQuo) {
      btnStatusQuo.addEventListener('click', () => {
        [btnStatusQuo, btnMandiri, btnAi].forEach(b => b?.classList.remove('active'));
        btnStatusQuo.classList.add('active');

        s1.value = Math.round(baselines.B1);
        s2.value = Math.round(baselines.B2);
        s3.value = Math.round(baselines.B3);
        s4.value = Math.round(baselines.B4);
        s5.value = Math.round(baselines.B5);

        updateSimulation();
      });
    }

    // Preset 2: Target Adiwiyata Mandiri
    if (btnMandiri) {
      btnMandiri.addEventListener('click', () => {
        [btnStatusQuo, btnMandiri, btnAi].forEach(b => b?.classList.remove('active'));
        btnMandiri.classList.add('active');

        s1.value = 95;
        s2.value = 96;
        s3.value = 92;
        s4.value = 90;
        s5.value = 95;

        updateSimulation();
      });
    }

    // Preset 3: Skenario Rekomendasi AI
    if (btnAi) {
      btnAi.addEventListener('click', () => {
        [btnStatusQuo, btnMandiri, btnAi].forEach(b => b?.classList.remove('active'));
        btnAi.classList.add('active');

        // Analisis prioritas temuan AI untuk meningkatkan pilar terkait
        let targetI1 = Math.max(Math.round(baselines.B1), 88);
        let targetI2 = Math.max(Math.round(baselines.B2), 90);
        let targetI3 = Math.max(Math.round(baselines.B3), 88);
        let targetI4 = Math.max(Math.round(baselines.B4), 85);
        let targetI5 = Math.max(Math.round(baselines.B5), 90);

        const aiContext = JSON.stringify(priorityPoints).toLowerCase();
        if (aiContext.includes('sampah') || aiContext.includes('organik') || aiContext.includes('anorganik') || aiContext.includes('biopori')) {
          targetI2 = 98;
        }
        if (aiContext.includes('wc') || aiContext.includes('toilet') || aiContext.includes('drainase') || aiContext.includes('kebersihan')) {
          targetI1 = 96;
        }
        if (aiContext.includes('green house') || aiContext.includes('tanaman') || aiContext.includes('ikan') || aiContext.includes('rth')) {
          targetI3 = 94;
        }
        if (aiContext.includes('listrik') || aiContext.includes('lampu') || aiContext.includes('energi') || aiContext.includes('kipas')) {
          targetI4 = 92;
        }
        if (aiContext.includes('air') || aiContext.includes('keran') || aiContext.includes('wudhu') || aiContext.includes('toren')) {
          targetI5 = 96;
        }

        s1.value = targetI1;
        s2.value = targetI2;
        s3.value = targetI3;
        s4.value = targetI4;
        s5.value = targetI5;

        updateSimulation();
      });
    }

    // Inisialisasi awal kalkulasi HUD
    updateSimulation();
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
   * Menampilkan pesan error yang jelas dan mudah dipahami oleh orang awam
   */
  function renderFriendlyError(rawError) {
    if (btnAnalyze) btnAnalyze.disabled = false;
    if (btnCopyReport) btnCopyReport.style.display = 'none';
    dssKpiStrip.innerHTML = '';

    const errStr = (rawError?.message || String(rawError)).toLowerCase();
    let headline = 'Layanan AI Tidak Dapat Diakses';
    let friendlyMessage = 'Sistem tidak dapat terhubung ke server Google Gemini AI untuk memproses saran keputusan saat ini.';
    let hints = [
      'Pastikan perangkat terhubung dengan jaringan internet yang stabil.',
      'Periksa apakah Kunci Akses (API Key) telah terpasang dengan benar di konfigurasi sistem (.env).',
      'Jika kuota harian telah habis, silakan coba kembali beberapa saat lagi.'
    ];

    if (errStr.includes('api key') || errStr.includes('vite_gemini_api_key') || errStr.includes('401') || errStr.includes('tidak ditemukan')) {
      headline = 'Kunci Akses AI Belum Dikonfigurasi';
      friendlyMessage = 'Fitur Analisis AI membutuhkan API Key Google Gemini yang valid agar dapat membaca data dan menyusun rekomendasi secara otomatis.';
      hints = [
        'Hubungi administrator sistem untuk memperbaiki galat.',
        'Muat ulang halaman setelah konfigurasi kunci selesai diperbarui.'
      ];
    } else if (errStr.includes('kuota') || errStr.includes('quota') || errStr.includes('429') || errStr.includes('resource_exhausted')) {
      headline = 'Batas Penggunaan AI Tercapai';
      friendlyMessage = 'Permintaan analisis melebihi batas kuota harian gratis dari Google Gemini AI.';
      hints = [
        'Tunggu beberapa menit sebelum menekan tombol Analisis Ulang.',
        'Sistem akan otomatis dapat digunakan kembali saat kuota disegarkan.'
      ];
    } else if (errStr.includes('internet') || errStr.includes('network') || errStr.includes('failed to fetch')) {
      headline = 'Koneksi Internet Terputus';
      friendlyMessage = 'Perangkat Anda gagal menghubungi server cloud AI. Periksa sambungan Wi-Fi atau data seluler Anda.';
      hints = [
        'Pastikan browser tidak dalam mode offline.',
        'Coba refresh halaman atau ganti jaringan koneksi internet Anda.'
      ];
    }

    dssResultsContainer.innerHTML = `
      <div class="dss-error-card">
        <div class="dss-error-icon-box">
          ${ICONS.alertTriangle}
        </div>
        <h2 class="dss-error-title">${headline}</h2>
        <p class="dss-error-message">${friendlyMessage}</p>

        <div class="dss-error-hint-box">
          <div class="dss-error-hint-title">
            ${ICONS.info}
            <span>Langkah yang Disarankan:</span>
          </div>
          <ul class="dss-error-hint-list">
            ${hints.map(h => `<li>${h}</li>`).join('')}
          </ul>
        </div>

        <button type="button" class="dss-btn dss-btn-primary" onclick="document.getElementById('btnAnalyze').click()">
          <span class="btn-icon">${ICONS.refresh}</span>
          <span>Coba Hubungkan Kembali</span>
        </button>
      </div>
    `;
  }

  /**
   * Merender UI Hasil Lengkap (Bento Grid + KPI Cards + Policy Sandbox)
   */
  function renderAnalysisUI(data, baselineData) {
    if (btnAnalyze) btnAnalyze.disabled = false;
    currentAnalysisData = data;
    if (!data) return;

    if (btnCopyReport) btnCopyReport.style.display = 'inline-flex';

    const total = data.totalAnalyzed || 0;
    const avgScore = data.avgScore || 0;
    const readiness = data.readinessLevel || (avgScore >= 90 ? 'Sangat Mandiri (Adiwiyata Nasional)' : 'Perlu Pendampingan');

    // 1. RENDER 4 KPI STATS
    dssKpiStrip.innerHTML = `
      <div class="dss-kpi-card">
        <div class="dss-kpi-header">
          <span class="dss-kpi-label">Sampel Evaluasi</span>
          <span class="dss-kpi-icon">${ICONS.fileText}</span>
        </div>
        <div class="dss-kpi-val">${total}</div>
        <div class="dss-kpi-sub">${ICONS.sparkles} 30 Hari Terakhir</div>
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
        <div class="dss-kpi-sub">Kategori Tingkat Adiwiyata</div>
      </div>

      <div class="dss-kpi-card">
        <div class="dss-kpi-header">
          <span class="dss-kpi-label">Aksi Prioritas</span>
          <span class="dss-kpi-icon">${ICONS.target}</span>
        </div>
        <div class="dss-kpi-val">${data.priorityPoints ? data.priorityPoints.length : 0}</div>
        <div class="dss-kpi-sub">Rekomendasi Taktis AI</div>
      </div>
    `;

    // 2. RENDER BENTO CONTENT GRID + POLICY SANDBOX
    const priorityPoints = Array.isArray(data.priorityPoints) ? data.priorityPoints : [];
    const base = baselineData || { B1: 85, B2: 80, B3: 85, B4: 82, B5: 88, overallAvg: avgScore };

    dssResultsContainer.innerHTML = `
      <!-- KOLOM KIRI: DIAGNOSTIK & NARASI EKSEKUTIF -->
      <section class="dss-card">
        <div class="dss-card-header">
          <h2 class="dss-card-title">
            <span>${ICONS.brain}</span>
            <span>Diagnosis & Analisis Agregat AI</span>
          </h2>
          <span class="dss-engine-tag">
            ${ICONS.sparkles}
            Google Gemini AI
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
            Rekomendasi di samping telah diprioritaskan oleh AI berdasarkan pola kelemahan lapangan dan dampak kepatuhan baku mutu lingkungan sekolah. Kordinasikan dengan guru pembina zona harian.
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

      <!-- POLICY SANDBOX SIMULATOR (FULL-WIDTH BENTO CARD) -->
      <section class="dss-card dss-sandbox-card" id="policySandboxSection">
        <div class="dss-sandbox-header">
          <div class="dss-sandbox-header-info">
            <div class="dss-pill-badge" style="background: #e6f4ea; color: #1e7e34; margin-bottom: 0.35rem;">
              <span class="dss-badge-icon">${ICONS.sliders}</span>
              <span>Decision Simulator</span>
            </div>
            <h2 class="dss-card-title" style="font-size: 1.25rem;">
              <span>Interactive Policy Sandbox Simulator</span>
            </h2>
            <p class="dss-hero-desc" style="font-size: 0.82rem; margin-top: 0.2rem;">
              Eksplorasi skenario intervensi 5 Pilar Adiwiyata untuk melihat proyeksi kepatuhan dan dampak lingkungan secara langsung.
            </p>
          </div>

          <div class="dss-sandbox-presets">
            <button type="button" id="btnPresetStatusQuo" class="dss-preset-btn active" title="Kembalikan ke performa riil sekolah">
              Status Quo
            </button>
            <button type="button" id="btnPresetMandiri" class="dss-preset-btn" title="Target Adiwiyata Mandiri (Semua ≥92%)">
              Adiwiyata Mandiri
            </button>
            <button type="button" id="btnPresetAi" class="dss-preset-btn" title="Optimalisasi berdasarkan rekomendasi AI">
              ${ICONS.sparkles} Rekomendasi AI
            </button>
          </div>
        </div>

        <div class="dss-sandbox-grid">
          <!-- LEFT: 5 SLIDERS -->
          <div class="dss-sandbox-controls">
            <div class="dss-control-header">
              <span>Target Intervensi Kebijakan</span>
              <span class="dss-control-sub">Bobot (%)</span>
            </div>

            <!-- I1 -->
            <div class="dss-slider-group">
              <div class="dss-slider-label-row">
                <div class="dss-slider-info">
                  <span class="dss-slider-icon">${ICONS.sparkles}</span>
                  <span class="dss-slider-name">Kebersihan & Sanitasi</span>
                  <span class="dss-weight-tag">20%</span>
                </div>
                <span class="dss-slider-val" id="valSliderI1">${base.B1}%</span>
              </div>
              <input type="range" id="sliderI1" class="dss-range-input" min="0" max="100" step="1" value="${Math.round(base.B1)}" />
            </div>

            <!-- I2 -->
            <div class="dss-slider-group">
              <div class="dss-slider-label-row">
                <div class="dss-slider-info">
                  <span class="dss-slider-icon">${ICONS.recycle}</span>
                  <span class="dss-slider-name">Pengelolaan Sampah</span>
                  <span class="dss-weight-tag">25%</span>
                </div>
                <span class="dss-slider-val" id="valSliderI2">${base.B2}%</span>
              </div>
              <input type="range" id="sliderI2" class="dss-range-input" min="0" max="100" step="1" value="${Math.round(base.B2)}" />
            </div>

            <!-- I3 -->
            <div class="dss-slider-group">
              <div class="dss-slider-label-row">
                <div class="dss-slider-info">
                  <span class="dss-slider-icon">${ICONS.leaf}</span>
                  <span class="dss-slider-name">Keanekaragaman Hayati</span>
                  <span class="dss-weight-tag">20%</span>
                </div>
                <span class="dss-slider-val" id="valSliderI3">${base.B3}%</span>
              </div>
              <input type="range" id="sliderI3" class="dss-range-input" min="0" max="100" step="1" value="${Math.round(base.B3)}" />
            </div>

            <!-- I4 -->
            <div class="dss-slider-group">
              <div class="dss-slider-label-row">
                <div class="dss-slider-info">
                  <span class="dss-slider-icon">${ICONS.zap}</span>
                  <span class="dss-slider-name">Efisiensi Energi</span>
                  <span class="dss-weight-tag">15%</span>
                </div>
                <span class="dss-slider-val" id="valSliderI4">${base.B4}%</span>
              </div>
              <input type="range" id="sliderI4" class="dss-range-input" min="0" max="100" step="1" value="${Math.round(base.B4)}" />
            </div>

            <!-- I5 -->
            <div class="dss-slider-group">
              <div class="dss-slider-label-row">
                <div class="dss-slider-info">
                  <span class="dss-slider-icon">${ICONS.droplets}</span>
                  <span class="dss-slider-name">Konservasi Air</span>
                  <span class="dss-weight-tag">20%</span>
                </div>
                <span class="dss-slider-val" id="valSliderI5">${base.B5}%</span>
              </div>
              <input type="range" id="sliderI5" class="dss-range-input" min="0" max="100" step="1" value="${Math.round(base.B5)}" />
            </div>
          </div>

          <!-- RIGHT: LIVE PROJECTION HUD -->
          <div class="dss-sandbox-hud">
            <div class="dss-hud-score-card">
              <div class="dss-hud-score-header">
                <span class="dss-hud-label">Proyeksi Skor Kepatuhan</span>
                <span id="hudDeltaBadge" class="dss-hud-delta neutral">+0.0%</span>
              </div>
              <div class="dss-hud-score-val" id="hudProjectedScore">${base.overallAvg}%</div>
              <div class="dss-hud-readiness">
                ${ICONS.award}
                <span id="hudReadinessLevel">Adiwiyata Nasional (Optimal)</span>
              </div>
            </div>

            <!-- ECO-KPI IMPACT CARDS -->
            <div class="dss-hud-eco-grid">
              <div class="dss-eco-card">
                <div class="dss-eco-icon co2">${ICONS.leaf}</div>
                <div class="dss-eco-body">
                  <div class="dss-eco-val" id="hudCarbonVal">+0.0 kg</div>
                  <div class="dss-eco-lbl">Reduksi CO₂e / bln</div>
                </div>
              </div>

              <div class="dss-eco-card">
                <div class="dss-eco-icon water">${ICONS.droplets}</div>
                <div class="dss-eco-body">
                  <div class="dss-eco-val" id="hudWaterVal">+0 L</div>
                  <div class="dss-eco-lbl">Konservasi Air / hari</div>
                </div>
              </div>

              <div class="dss-eco-card">
                <div class="dss-eco-icon energy">${ICONS.zap}</div>
                <div class="dss-eco-body">
                  <div class="dss-eco-val" id="hudEnergyVal">+0.0 kWh</div>
                  <div class="dss-eco-lbl">Hemat Listrik / bln</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    // Pasang Event Binding & Reactivity Policy Sandbox
    setupSandboxInteractions(base, priorityPoints);
  }

  /**
   * Eksekusi Utama Pengiriman Data ke Gemini AI
   */
  async function runAiAnalysis(forceRefresh = false) {
    try {
      renderSkeleton();

      // 1. Ambil data 30 hari terakhir dari IndexedDB
      const recentRecords = await getRecentRecords();
      const calculatedBaseline = calculateBaselinePillars(recentRecords);

      // 2. Cek Cache jika tidak dipaksa refresh
      if (!forceRefresh) {
        const cachedEntry = await getItem('gemini_cache', CACHE_KEY_DSS);
        if (cachedEntry && cachedEntry.data) {
          renderAnalysisUI(cachedEntry.data, calculatedBaseline);
          return;
        }
      }

      if (!recentRecords || recentRecords.length === 0) {
        if (btnAnalyze) btnAnalyze.disabled = false;
        dssKpiStrip.innerHTML = '';
        dssResultsContainer.innerHTML = `
          <div class="dss-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem;">
            <div style="color: var(--color-secondary, #619170); margin-bottom: 0.75rem;">${ICONS.info}</div>
            <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.35rem;">Belum Ada Data Evaluasi</h3>
            <p style="font-size: 0.86rem; color: #64748b; max-width: 450px; margin: 0 auto 1.25rem auto;">
              Belum ada rekod evaluasi piket tersimpan dalam 30 hari terakhir. Silakan isi form evaluasi atau gunakan data pengujian terlebih dahulu.
            </p>
          </div>
        `;
        return;
      }

      // Hitung metrik dasar
      const totalScoreSum = recentRecords.reduce((acc, curr) => acc + (Number(curr.scorePercent) || 0), 0);
      const avgScore = Math.round((totalScoreSum / recentRecords.length) * 10) / 10;

      // 3. Kemas payload data terstruktur untuk dikirim ke Gemini AI
      const jsonPayload = {
        metadata: {
          periode: "30 Hari Terakhir",
          totalEvaluasi: recentRecords.length,
          rataRataKepatuhan: `${avgScore}%`,
          tanggalAnalisis: new Date().toISOString().split('T')[0]
        },
        evaluasiSampel: recentRecords.slice(-15).map(r => ({
          tanggal: r.tanggal || r.createdAt,
          guruPiket: r.guruPiket,
          skor: `${r.scorePercent}%`,
          tugasTerlewati: r.falseCount || 0,
          checklist: r.checklist || {},
          catatanLapangan: r.catatan || '-'
        }))
      };

      const promptInstruction = `
        Anda adalah pakar audit Sistem Pendukung Keputusan (DSS) Lingkungan Sekolah Adiwiyata Tingkat Nasional.
        Diberikan data agregat evaluasi kebersihan, sanitasi, pemilahan sampah, dan konservasi sekolah selama 30 hari terakhir.

        Tugas Anda:
        1. Lakukan ANALISIS AGREGAT menyeluruh terhadap data operasional tersebut secara objektif, mendalam, dan profesional.
        2. Tuliskan "narrativeSummary": Sintesis naratif mendalam (3-4 paragraf terstruktur) yang menjelaskan kondisi umum sekolah, tren positif, titik kelemahan utama, dan evaluasi kesiapan standar Adiwiyata.
        3. Buat "priorityPoints": 3 sampai 4 poin tindakan taktis yang paling mendesak dengan format title, targetArea, urgency (TINGGI/SEDANG/KELANJUTAN), dan action konkret.
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

      // 4. Kirim ke API Gemini melalui Service Layer
      const aiResponse = await analyzeJSON(jsonPayload, promptInstruction, jsonSchema);

      if (!aiResponse || (!aiResponse.narrativeSummary && !aiResponse.priorityPoints)) {
        throw new Error('Menerima format data kosong dari layanan AI Gemini.');
      }

      const finalResult = {
        narrativeSummary: aiResponse.narrativeSummary || 'Analisis berhasil disintesis oleh AI.',
        priorityPoints: Array.isArray(aiResponse.priorityPoints) ? aiResponse.priorityPoints : [],
        totalAnalyzed: recentRecords.length,
        avgScore: avgScore,
        readinessLevel: avgScore >= 90 ? 'Sangat Mandiri (Adiwiyata Nasional)' : 'Perlu Pendampingan',
        source: 'Google Gemini AI',
        updatedAt: new Date().toISOString()
      };

      // 5. Simpan Hasil ke Cache
      await saveItem('gemini_cache', {
        id: CACHE_KEY_DSS,
        data: finalResult
      });

      // 6. Render Hasil ke Tampilan UI
      renderAnalysisUI(finalResult, calculatedBaseline);

    } catch (error) {
      console.error('[dssView.js] Kesalahan saat memanggil AI Gemini:', error);
      renderFriendlyError(error);
    }
  }

  // Event Listener: Salin Hasil Analisis
  if (btnCopyReport) {
    btnCopyReport.addEventListener('click', async () => {
      if (!currentAnalysisData) return;
      const textToCopy = `=== RINGKASAN REKOMENDASI KEPUTUSAN (DSS) ADIWIYATA ===\n` +
        `Total Sampel: ${currentAnalysisData.totalAnalyzed || 0} Laporan (30 Hari)\n` +
        `Rata-rata Kepatuhan: ${currentAnalysisData.avgScore || 0}%\n` +
        `Sumber Analisis: ${currentAnalysisData.source || 'Google Gemini AI'}\n\n` +
        `--- DIAGNOSIS AGREGAT AI ---\n${currentAnalysisData.narrativeSummary || '-'}\n\n` +
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
