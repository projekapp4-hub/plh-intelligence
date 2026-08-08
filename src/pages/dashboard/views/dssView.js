/**
 * DSSVIEW.JS - Modul Sistem Pendukung Keputusan (Agregat 30 Hari via Gemini AI)
 * Path: src/pages/dashboard/views/dssView.js
 * 
 * Modul ini menyaring data evaluasi zona dari IndexedDB ('dss_records') 
 * untuk 30 hari terakhir, lalu mengirimkannya ke Gemini AI untuk dianalisis 
 * secara agregat. Output berupa narasi komprehensif dan poin-poin prioritas.
 */

import { getAllItems, getItem, saveItem } from '../../../utils/storage.js';
import { analyzeJSON } from '../../../api/gemini.js';

/** Kunci unik entri cache DSS di store gemini_cache */
const CACHE_KEY_DSS = 'dss_latest_analysis';

/**
 * Fungsi Utama Render Modul DSS untuk SPA Router
 * @param {HTMLElement} container - Elemen pembungkus #spaCanvas
 */
export function render(container) {
  container.innerHTML = `
    <div class="dss-container">
      <header class="dss-header">
        <div class="header-content">
          <h1>🧠 Analisis DSS Adiwiyata</h1>
          <p>Analisis agregat kondisi lingkungan sekolah berdasarkan evaluasi 30 hari terakhir menggunakan Gemini AI.</p>
        </div>
        <button type="button" id="btnAnalyze" class="btn-refresh">
          🔄 Analisis Ulang
        </button>
      </header>

      <main id="dssResultsContainer" class="dss-results-wrapper">
        <div class="loading-state">
          ⏳ Memuat data dan hasil analisis...
        </div>
      </main>
    </div>

    <style>
      .dss-container {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        width: 100%;
        max-width: 1000px;
        margin: 0 auto;
        padding-bottom: 3rem;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .dss-header {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-top: 4px solid #1b4332;
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
      }

      .dss-header h1 {
        margin: 0;
        font-size: 1.35rem;
        font-weight: 800;
        color: #1b4332;
      }

      .dss-header p {
        margin: 0.3rem 0 0 0;
        font-size: 0.85rem;
        color: #64748b;
      }

      .btn-refresh {
        background-color: #1b4332;
        color: #ffffff;
        border: none;
        padding: 0.65rem 1.25rem;
        border-radius: 8px;
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .btn-refresh:hover {
        background-color: #2d6a4f;
      }

      .dss-results-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .dss-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
      }

      .dss-card-title {
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
        font-weight: 800;
        color: #1b4332;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .narrative-text {
        font-size: 0.92rem;
        color: #334155;
        line-height: 1.75;
        white-space: pre-line;
      }

      .priority-list {
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        margin-top: 0.5rem;
      }

      .priority-item {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-left: 4px solid #1b4332;
        border-radius: 0 8px 8px 0;
        padding: 1rem 1.2rem;
      }

      .priority-item.urgency-high {
        border-left-color: #dc2626;
      }

      .priority-item.urgency-medium {
        border-left-color: #d97706;
      }

      .priority-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.4rem;
        gap: 0.5rem;
      }

      .priority-title {
        font-weight: 700;
        font-size: 0.95rem;
        color: #0f172a;
      }

      .priority-badge {
        font-size: 0.7rem;
        font-weight: 800;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        text-transform: uppercase;
      }

      .badge-high { background-color: #fee2e2; color: #991b1b; }
      .badge-medium { background-color: #fef3c7; color: #92400e; }
      .badge-low { background-color: #e0e7ff; color: #3730a3; }

      .priority-target {
        font-size: 0.8rem;
        color: #64748b;
        margin-bottom: 0.4rem;
      }

      .priority-action {
        font-size: 0.88rem;
        color: #334155;
        line-height: 1.5;
      }

      .meta-info {
        font-size: 0.8rem;
        color: #64748b;
        text-align: right;
        margin-top: -0.5rem;
      }

      .loading-state, .error-state {
        text-align: center;
        padding: 3rem 1.5rem;
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        color: #64748b;
        font-size: 0.95rem;
      }

      .error-state {
        color: #b91c1c;
      }
    </style>
  `;

  initDssLogic(container);
}

/**
 * Mengelola Penyaringan Data 30 Hari, Pengecekan Cache, dan Eksekusi AI
 * @param {HTMLElement} container 
 */
async function initDssLogic(container) {
  const btnAnalyze = container.querySelector('#btnAnalyze');
  const dssResultsContainer = container.querySelector('#dssResultsContainer');

  /**
   * Mengambil dan menyaring data 30 hari terakhir dari IndexedDB
   */
  async function getRecentRecords() {
    const allRecords = await getAllItems('dss_records');
    if (!allRecords || allRecords.length === 0) return [];

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // Filter berdasarkan field tanggal/createdAt
    const filtered = allRecords.filter(record => {
      const dateVal = record.tanggal || record.createdAt;
      if (!dateVal) return true; // Jika tidak ada atribut tanggal, sertakan sebagai fallback
      const recordDate = new Date(dateVal);
      return !isNaN(recordDate.getTime()) && recordDate >= thirtyDaysAgo;
    });

    return filtered.length > 0 ? filtered : allRecords;
  }

  /**
   * Merender hasil analisis AI ke tampilan UI (Dengan Pengecekan Aman)
   * @param {Object} analysisData 
   */
  function renderAnalysisUI(analysisData) {
    if (!analysisData) {
      dssResultsContainer.innerHTML = `<div class="error-state">⚠️ Tidak ada data analisis untuk ditampilkan.</div>`;
      return;
    }

    // Normalisasi properti jika AI mengembalikan nama kunci yang bervariasi
    const narrativeSummary = analysisData.narrativeSummary 
      || analysisData.narrative 
      || analysisData.summary 
      || 'Tidak ada narasi ringkasan yang tersedia.';

    const rawPriorityPoints = analysisData.priorityPoints 
      || analysisData.priority_points 
      || analysisData.priorities 
      || [];

    // Pastikan priorityPoints selalu berupa Array
    const priorityPoints = Array.isArray(rawPriorityPoints) ? rawPriorityPoints : [];
    const totalAnalyzed = analysisData.totalAnalyzed || 0;

    dssResultsContainer.innerHTML = `
      ${totalAnalyzed ? `<div class="meta-info">Data yang dianalisis: <strong>${totalAnalyzed} evaluasi</strong> (30 hari terakhir)</div>` : ''}

      <!-- KARTU 1: NARASI KESELURUHAN -->
      <section class="dss-card">
        <h2 class="dss-card-title">📝 Gambaran Umum & Analisis Komprehensif</h2>
        <div class="narrative-text">${narrativeSummary}</div>
      </section>

      <!-- KARTU 2: POIN-POIN PRIORITAS -->
      <section class="dss-card">
        <h2 class="dss-card-title">🎯 Poin-Poin Prioritas Tindakan</h2>
        <div class="priority-list">
          ${priorityPoints.length > 0 ? priorityPoints.map(item => {
            const urgency = (item.urgency || 'NORMAL').toUpperCase();
            const urgencyClass = urgency === 'TINGGI' ? 'urgency-high' 
              : urgency === 'SEDANG' ? 'urgency-medium' : '';
            
            const badgeClass = urgency === 'TINGGI' ? 'badge-high' 
              : urgency === 'SEDANG' ? 'badge-medium' : 'badge-low';

            return `
              <div class="priority-item ${urgencyClass}">
                <div class="priority-header">
                  <span class="priority-title">${item.title || item.judul || 'Tindakan Prioritas'}</span>
                  <span class="priority-badge ${badgeClass}">${urgency}</span>
                </div>
                ${item.targetArea || item.target_area ? `<div class="priority-target">📍 Target Area: ${item.targetArea || item.target_area}</div>` : ''}
                <div class="priority-action">${item.action || item.instruksi || item.deskripsi || '-'}</div>
              </div>
            `;
          }).join('') : '<div style="color: #64748b; font-size: 0.85rem;">Tidak ada poin prioritas khusus yang dicatat.</div>'}
        </div>
      </section>
    `;
  }

  /**
   * Eksekusi Utama Analisis AI
   * @param {boolean} forceRefresh - Mengabaikan cache jika true
   */
  async function runAiAnalysis(forceRefresh = false) {
    try {
      // 1. Cek Cache terlebih dahulu (jika bukan re-analisis paksa)
      if (!forceRefresh) {
        const cachedEntry = await getItem('gemini_cache', CACHE_KEY_DSS);
        if (cachedEntry && cachedEntry.data) {
          renderAnalysisUI(cachedEntry.data);
          return;
        }
      }

      // Tampilkan Indikator Loading
      dssResultsContainer.innerHTML = `
        <div class="loading-state">
          🤖 Gemini AI sedang menganalisis data evaluasi 30 hari terakhir...
        </div>
      `;

      // 2. Ambil data 30 hari terakhir dari IndexedDB
      const recentRecords = await getRecentRecords();

      if (!recentRecords || recentRecords.length === 0) {
        dssResultsContainer.innerHTML = `
          <div class="error-state">
            ⚠️ Tidak ada data evaluasi yang ditemukan dalam 30 hari terakhir.
          </div>
        `;
        return;
      }

      // 3. Prompt & Schema untuk Gemini AI (Analisis Agregat)
      const promptInstruction = `
        Anda adalah pakar audit Sistem Pendukung Keputusan (DSS) Lingkungan Sekolah Adiwiyata.
        Berikut diberikan kumpulan data evaluasi zona/area sekolah selama 30 hari terakhir.
        
        Tugas Anda:
        1. Lakukan ANALISIS AGREGAT dari KESELURUHAN data tersebut (jangan buat analisis per-entri data satu per satu).
        2. Tuliskan "narrativeSummary": Penjelasan narasi komprehensif, panjang, dan jelas yang menggambarkan kondisi umum sekolah, tren permasalahan utama, dan evaluasi menyeluruh.
        3. Buat "priorityPoints": Beberapa poin prioritas tindakan taktis (biasanya 3-5 poin utama) yang paling mendesak dan relevan untuk segera ditindaklanjuti oleh tim sekolah.
      `;

      const jsonSchema = {
        type: "OBJECT",
        description: "Hasil analisis agregat DSS Adiwiyata berdasarkan data 30 hari terakhir",
        properties: {
          narrativeSummary: {
            type: "STRING",
            description: "Penjelasan narasi komprehensif, mendalam, dan rinci mengenai kondisi umum sekolah berdasarkan analisis data 30 hari terakhir"
          },
          priorityPoints: {
            type: "ARRAY",
            description: "Daftar poin-poin prioritas tindakan utama hasil agregasi",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING", description: "Judul poin prioritas" },
                targetArea: { type: "STRING", description: "Area atau zona sasaran utama" },
                urgency: { type: "STRING", description: "Tingkat urgensi: TINGGI, SEDANG, atau KELANJUTAN" },
                action: { type: "STRING", description: "Rincian instruksi tindakan taktis yang disarankan" }
              },
              required: ["title", "urgency", "action"]
            }
          }
        },
        required: ["narrativeSummary", "priorityPoints"]
      };

      // 4. Panggil API Gemini AI
      const aiResponse = await analyzeJSON(recentRecords, promptInstruction, jsonSchema);

      if (!aiResponse) {
        throw new Error('Respons dari API Gemini kosong.');
      }

      // Safe Normalization sebelum disimpan dan dirender
      const normalizedData = {
        narrativeSummary: aiResponse.narrativeSummary || aiResponse.narrative || 'Tidak ada narasi ringkasan.',
        priorityPoints: Array.isArray(aiResponse.priorityPoints) 
          ? aiResponse.priorityPoints 
          : Array.isArray(aiResponse.priority_points) 
            ? aiResponse.priority_points 
            : [],
        totalAnalyzed: recentRecords.length,
        updatedAt: new Date().toISOString()
      };

      // 5. Simpan Hasil ke Cache secara silent
      await saveItem('gemini_cache', {
        id: CACHE_KEY_DSS,
        data: normalizedData
      });

      // Render Hasil ke UI
      renderAnalysisUI(normalizedData);

    } catch (error) {
      console.error('[dssView.js] Terjadi kesalahan saat analisis DSS:', error);
      dssResultsContainer.innerHTML = `
        <div class="error-state">
          ❌ Gagal melakukan analisis AI. Pesan: ${error.message || error}
        </div>
      `;
    }
  }

  // Event Listener Tombol Analisis Ulang
  btnAnalyze.addEventListener('click', () => {
    runAiAnalysis(true);
  });

  // Eksekusi awal
  runAiAnalysis(false);
}