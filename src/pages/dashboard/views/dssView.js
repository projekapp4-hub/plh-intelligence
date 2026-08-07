/**
 * DSSVIEW.JS - Modul Sistem Pendukung Keputusan (Decision Support System / Page 4)
 * Path: src/pages/dashboard/views/dssView.js
 * 
 * Modul ini mengevaluasi dan meranking area/zona sekolah berdasarkan metode 
 * Multi-Criteria Decision Making (MCDM) - Simple Additive Weighting (SAW) 
 * untuk menentukan prioritas intervensi dan alokasi sumber daya program Adiwiyata.
 */

// Master Bobot Kriteria DSS (Total Bobot = 100% / 1.0)
const DSS_CRITERIA = [
  { id: 'C1', name: 'Kebersihan & Sanitasi WC/Koridor', weight: 0.30, type: 'benefit' },
  { id: 'C2', name: 'Pengelolaan & Pemilahan Sampah', weight: 0.25, type: 'benefit' },
  { id: 'C3', name: 'Pemeliharaan Keanekaragaman Hayati', weight: 0.20, type: 'benefit' },
  { id: 'C4', name: 'Efisiensi Penghematan Energi', weight: 0.125, type: 'benefit' },
  { id: 'C5', name: 'Konservasi & Penghematan Air', weight: 0.125, type: 'benefit' }
];

// Data Evaluasi Awal Per Zona Sekolah
const INITIAL_ZONE_EVALUATIONS = [
  {
    id: 'ZON-01',
    zoneName: 'Zona A - Gedung Utama & Koridor Lt. 1-2',
    scores: { C1: 95, C2: 88, C3: 70, C4: 85, C5: 90 },
    lastEvaluator: 'Ahmad Fauzi, S.Pd.',
    catatan: 'Kebersihan fisik sangat tinggi, perlu peningkatan pemilahan sampah organik.'
  },
  {
    id: 'ZON-02',
    zoneName: 'Zona B - Area Masjid & Fasilitas Wudhu',
    scores: { C1: 90, C2: 75, C3: 65, C4: 92, C5: 60 },
    lastEvaluator: 'Siti Nurhaliza, S.T.',
    catatan: 'Kebocoran minor pada kran wudhu menurunkan nilai efisiensi air.'
  },
  {
    id: 'ZON-03',
    zoneName: 'Zona C - Kantin Sekolah & Bank Sampah',
    scores: { C1: 70, C2: 60, C3: 50, C4: 75, C5: 70 },
    lastEvaluator: 'Hendro Utomo, M.Pd.',
    catatan: 'Volume limbah plastik tinggi, memerlukan intervensi fasilitas pemilahan.'
  },
  {
    id: 'ZON-04',
    zoneName: 'Zona D - Green House, Toren & Taman Belakang',
    scores: { C1: 80, C2: 82, C3: 95, C4: 70, C5: 88 },
    lastEvaluator: 'Ahmad Fauzi, S.Pd.',
    catatan: 'Kondisi tanaman dan vegetasi sangat baik, pemanfaatan air hujan optimal.'
  }
];

// Variable State Modul DSS
let activeZoneData = [];
let calculatedDssResults = [];

/**
 * FUNGSI UTAMA RENDER MODUL DSS (Ekspor Tingkat Teratas untuk Router SPA)
 * @param {HTMLElement} container - Elemen pembungkus #spaCanvas
 */
export function render(container) {
  // 1. Muat Data Evaluasi
  loadDssData();

  // 2. Hitung Ranking DSS Menggunakan Algoritma SAW
  calculateSAW();

  // 3. Injeksi Struktur HTML Lengkap ke Dalam Container
  container.innerHTML = `
    <div class="dss-page-wrapper">
      
      <!-- PAGE HEADER CARD -->
      <header class="dss-header-card">
        <div class="header-title-group">
          <div class="header-icon">🧠</div>
          <div>
            <h1 class="page-title">Sistem Pendukung Keputusan (DSS) Adiwiyata</h1>
            <p class="page-subtitle">Analisis Multi-Kriteria untuk Menentukan Prioritas Intervensi dan Rekomendasi Alokasi Sumber Daya Sekolah.</p>
          </div>
        </div>
        <div class="header-stat-badges">
          <div class="stat-pill">
            <span class="stat-label">Metode:</span>
            <strong class="stat-value">Simple Additive Weighting (SAW)</strong>
          </div>
        </div>
      </header>

      <!-- BAGIAN 1: KARTU STRUKTUR KRITERIA & BOBOT -->
      <section class="dss-card">
        <div class="card-header-title">
          <h3>⚖️ Matriks Kriteria & Bobot Penilaian</h3>
          <span class="badge-info">Total Bobot: 100%</span>
        </div>
        <div class="criteria-grid">
          ${DSS_CRITERIA.map(c => `
            <div class="criteria-pill-card">
              <div class="criteria-code">${c.id}</div>
              <div class="criteria-details">
                <span class="criteria-name">${c.name}</span>
                <span class="criteria-weight">Bobot: <strong>${c.weight * 100}%</strong> (${c.type.toUpperCase()})</span>
              </div>
            </div>
          `).join('')}
        </div>
      </section>

      <!-- BAGIAN 2: TABEL HASIL ANALISIS & RANKING ZONA -->
      <section class="dss-card">
        <div class="card-header-title">
          <h3>🏆 Peringkat Prioritas Zona Sekolah (Hasil Kalkulasi DSS)</h3>
          <button type="button" id="btnRecalculateDss" class="btn-refresh">
            🔄 Hitung Ulang Data
          </button>
        </div>

        <div class="table-responsive-wrapper">
          <table class="dss-table">
            <thead>
              <tr>
                <th class="text-center" style="width: 70px;">Rank</th>
                <th>Kode & Nama Zona</th>
                <th class="text-center">Skor V (SAW)</th>
                <th>Tingkat Kepatuhan</th>
                <th>Rekomendasi Tindakan DSS</th>
                <th class="text-center">Aksi Detail</th>
              </tr>
            </thead>
            <tbody id="dssTableBody">
              <!-- Baris Dirender secara Dinamis -->
            </tbody>
          </table>
        </div>
      </section>

      <!-- BAGIAN 3: RINGKASAN REKOMENDASI AI & STRATEGIS -->
      <section class="dss-card highlight-card">
        <div class="card-header-title">
          <h3>💡 Rekomendasi Strategis Berdasarkan Urutan Prioritas</h3>
        </div>
        <div id="dssStrategicRecommendations" class="recommendations-container">
          <!-- Konten Rekomendasi Dirender Dinamis -->
        </div>
      </section>

      <!-- MODAL DETAIL BREAKDOWN EVALUASI ZONA -->
      <div id="dssDetailModal" class="modal-overlay" aria-hidden="true">
        <div class="modal-card modal-medium">
          <div class="modal-header">
            <h2 class="modal-title" id="dssModalTitle">Detail Matriks Evaluasi Zona</h2>
            <button type="button" id="btnCloseDssModal" class="modal-close-btn">✕</button>
          </div>
          <div class="modal-body" id="dssModalBody">
            <!-- Rincian Matriks Skor Dirender Dinamis -->
          </div>
          <div class="modal-footer">
            <button type="button" id="btnCloseDssFooter" class="btn btn-secondary">Tutup</button>
          </div>
        </div>
      </div>

    </div>

    <!-- STYLING SCOPED UNTUK DSSVIEW MODULE -->
    <style>
      .dss-page-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
        width: 100%;
        padding-bottom: 3rem;
      }

      .dss-header-card, .dss-card {
        background-color: #ffffff;
        border: 1px solid var(--color-border, #e2e8f0);
        border-radius: 12px;
        padding: 1.25rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
      }

      .dss-header-card {
        border-top: 4px solid var(--color-primary, #1b4332);
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      @media (min-width: 640px) {
        .dss-header-card {
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
      }

      .header-title-group {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .header-icon { font-size: 2.2rem; }
      .page-title { margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--color-primary, #1b4332); }
      .page-subtitle { margin: 0.2rem 0 0 0; font-size: 0.8rem; color: #64748b; }

      .stat-pill {
        background-color: #f1f5f9;
        padding: 0.5rem 0.85rem;
        border-radius: 20px;
        font-size: 0.8rem;
        color: #334155;
      }
      .stat-value { color: var(--color-primary, #1b4332); font-weight: 800; }

      .card-header-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .card-header-title h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 800;
        color: var(--color-primary, #1b4332);
      }

      .badge-info {
        font-size: 0.75rem;
        font-weight: 700;
        background-color: #e0f2fe;
        color: #0369a1;
        padding: 0.25rem 0.6rem;
        border-radius: 12px;
      }

      .btn-refresh {
        background-color: #f1f5f9;
        border: 1px solid #cbd5e1;
        padding: 0.4rem 0.8rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
      }
      .btn-refresh:hover { background-color: #e2e8f0; }

      /* Criteria Cards Grid */
      .criteria-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }

      @media (min-width: 640px) {
        .criteria-grid { grid-template-columns: repeat(2, 1fr); }
      }

      @media (min-width: 1024px) {
        .criteria-grid { grid-template-columns: repeat(5, 1fr); }
      }

      .criteria-pill-card {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .criteria-code {
        font-weight: 800;
        font-size: 0.9rem;
        background-color: var(--color-primary, #1b4332);
        color: #ffffff;
        padding: 0.3rem 0.5rem;
        border-radius: 6px;
      }

      .criteria-details {
        display: flex;
        flex-direction: column;
      }

      .criteria-name { font-size: 0.75rem; font-weight: 700; color: #334155; line-height: 1.2; }
      .criteria-weight { font-size: 0.7rem; color: #64748b; margin-top: 0.2rem; }

      /* DSS Table Styling */
      .table-responsive-wrapper { overflow-x: auto; width: 100%; }

      .dss-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
        font-size: 0.85rem;
      }

      .dss-table th {
        background-color: #f8fafc;
        color: #334155;
        font-weight: 700;
        padding: 0.85rem 1rem;
        border-bottom: 2px solid #e2e8f0;
        white-space: nowrap;
      }

      .dss-table td {
        padding: 0.85rem 1rem;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }

      .rank-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        font-weight: 800;
        font-size: 0.9rem;
      }

      .rank-1 { background-color: #fef3c7; color: #d97706; border: 1px solid #fcd34d; }
      .rank-2 { background-color: #e2e8f0; color: #475569; border: 1px solid #cbd5e1; }
      .rank-3 { background-color: #ffedd5; color: #c2410c; border: 1px solid #fed7aa; }
      .rank-other { background-color: #f1f5f9; color: #64748b; }

      .score-value {
        font-family: ui-monospace, monospace;
        font-weight: 800;
        font-size: 0.95rem;
        color: var(--color-primary, #1b4332);
      }

      .status-pill-dss {
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.25rem 0.6rem;
        border-radius: 12px;
        display: inline-block;
      }

      .status-tinggi { background-color: #d1fae5; color: #065f46; }
      .status-sedang { background-color: #dbeafe; color: #1e40af; }
      .status-rendah { background-color: #fee2e2; color: #991b1b; }

      .btn-view-detail {
        background: #ffffff;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        padding: 0.35rem 0.6rem;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.2s;
      }
      .btn-view-detail:hover { background-color: #e0f2fe; border-color: #0284c7; }

      /* Strategic Highlight Box */
      .highlight-card {
        background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
        border: 1px solid #bbf7d0;
      }

      .recommendation-item {
        padding: 0.75rem;
        border-left: 4px solid var(--color-primary, #1b4332);
        background-color: #ffffff;
        border-radius: 0 8px 8px 0;
        margin-bottom: 0.75rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      }

      .recommendation-item:last-child { margin-bottom: 0; }
      .rec-title { font-size: 0.85rem; font-weight: 800; color: #1e293b; }
      .rec-desc { font-size: 0.8rem; color: #475569; margin: 0.2rem 0 0 0; line-height: 1.5; }

      /* Modal Styling */
      .modal-overlay {
        position: fixed;
        top: 0; left: 0; width: 100vw; height: 100vh;
        background-color: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
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
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .modal-medium { max-width: 600px; }

      .modal-header {
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #f8fafc;
      }

      .modal-title { margin: 0; font-size: 1rem; font-weight: 800; color: var(--color-primary, #1b4332); }
      .modal-close-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #64748b; }
      .modal-body { padding: 1.25rem; overflow-y: auto; max-height: 70vh; }
      .modal-footer { padding: 0.85rem 1.25rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; background-color: #f8fafc; }

      .btn { padding: 0.5rem 1rem; font-size: 0.85rem; font-weight: 700; border-radius: 6px; border: none; cursor: pointer; }
      .btn-secondary { background-color: #ffffff; border: 1px solid #cbd5e1; color: #334155; }
      .btn-secondary:hover { background-color: #f1f5f9; }
    </style>
  `;

  // 4. Inisialisasi Logic & Interaktivitas Event Listeners
  initDssPageLogic(container);
}

/**
 * Memuat Data Evaluasi
 */
function loadDssData() {
  const stored = localStorage.getItem('plh_dss_zones');
  if (stored) {
    try {
      activeZoneData = JSON.parse(stored);
    } catch (e) {
      activeZoneData = INITIAL_ZONE_EVALUATIONS;
    }
  } else {
    activeZoneData = INITIAL_ZONE_EVALUATIONS;
    localStorage.setItem('plh_dss_zones', JSON.stringify(INITIAL_ZONE_EVALUATIONS));
  }
}

/**
 * Perhitungan Algoritma SAW (Simple Additive Weighting)
 */
function calculateSAW() {
  // 1. Cari Nilai Max untuk Setiap Kriteria (Normalisasi Benefit)
  const maxScores = {};
  DSS_CRITERIA.forEach(crit => {
    maxScores[crit.id] = Math.max(...activeZoneData.map(zone => zone.scores[crit.id] || 0));
  });

  // 2. Hitung Nilai Ter-normalisasi (R) dan Skor Akhir V (Preferensi)
  calculatedDssResults = activeZoneData.map(zone => {
    let finalV = 0;
    const normalizedScores = {};

    DSS_CRITERIA.forEach(crit => {
      const maxVal = maxScores[crit.id] || 1;
      const rawScore = zone.scores[crit.id] || 0;
      // Rumus Normalisasi Kriteria Benefit: R_ij = X_ij / Max(X_ij)
      const r_ij = rawScore / maxVal;
      normalizedScores[crit.id] = r_ij;

      // Rumus Preferensi V_i = Sum(W_j * R_ij)
      finalV += crit.weight * r_ij;
    });

    return {
      ...zone,
      normalizedScores,
      finalScoreV: Number(finalV.toFixed(4)),
      scorePercentage: Number((finalV * 100).toFixed(1))
    };
  });

  // 3. Urutkan berdasarkan Skor V Tertinggi ke Terendah
  calculatedDssResults.sort((a, b) => b.finalScoreV - a.finalScoreV);
}

/**
 * Mengatur Interaktivitas Halaman dan Event Listener
 * @param {HTMLElement} container 
 */
function initDssPageLogic(container) {
  const dssTableBody = container.querySelector('#dssTableBody');
  const dssStrategicRecommendations = container.querySelector('#dssStrategicRecommendations');
  const btnRecalculateDss = container.querySelector('#btnRecalculateDss');

  // Modal Elements
  const dssDetailModal = container.querySelector('#dssDetailModal');
  const dssModalTitle = container.querySelector('#dssModalTitle');
  const dssModalBody = container.querySelector('#dssModalBody');
  const btnCloseDssModal = container.querySelector('#btnCloseDssModal');
  const btnCloseDssFooter = container.querySelector('#btnCloseDssFooter');

  // Render Tabel Hasil DSS
  function renderTable() {
    if (!dssTableBody) return;

    dssTableBody.innerHTML = calculatedDssResults.map((item, index) => {
      const rank = index + 1;
      let rankClass = 'rank-other';
      if (rank === 1) rankClass = 'rank-1';
      else if (rank === 2) rankClass = 'rank-2';
      else if (rank === 3) rankClass = 'rank-3';

      let statusBadge = '<span class="status-pill-dss status-rendah">⚠️ Prioritas Intervensi</span>';
      let actionRec = 'Memerlukan alokasi tim dan perbaikan mendesak.';

      if (item.scorePercentage >= 85) {
        statusBadge = '<span class="status-pill-dss status-tinggi">🌿 Sangat Optimal</span>';
        actionRec = 'Pertahankan performa dan jadikan percontohan.';
      } else if (item.scorePercentage >= 75) {
        statusBadge = '<span class="status-pill-dss status-sedang">🟡 Cukup Terawat</span>';
        actionRec = 'Lakukan evaluasi berkala pada kriteria terkecil.';
      }

      return `
        <tr>
          <td class="text-center">
            <span class="rank-badge ${rankClass}">${rank}</span>
          </td>
          <td>
            <strong style="color: #1e293b; display: block;">${item.zoneName}</strong>
            <small style="color: #64748b;">Evaluator: ${item.lastEvaluator}</small>
          </td>
          <td class="text-center">
            <span class="score-value">${item.finalScoreV}</span>
            <small style="display: block; color: #64748b;">(${item.scorePercentage}%)</small>
          </td>
          <td>${statusBadge}</td>
          <td style="color: #475569; font-size: 0.8rem;">${actionRec}</td>
          <td class="text-center">
            <button type="button" class="btn-view-detail" data-id="${item.id}">
              🔍 Matriks
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach Event Listener pada Tombol Detail Matriks
    container.querySelectorAll('.btn-view-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const zoneId = btn.getAttribute('data-id');
        openDetailModal(zoneId);
      });
    });
  }

  // Render Rekomendasi Strategis AI/DSS
  function renderRecommendations() {
    if (!dssStrategicRecommendations || calculatedDssResults.length === 0) return;

    const lowestZone = calculatedDssResults[calculatedDssResults.length - 1];
    const highestZone = calculatedDssResults[0];

    dssStrategicRecommendations.innerHTML = `
      <div class="recommendation-item">
        <div class="rec-title">📌 Prioritas Utamakan Perbaikan: ${lowestZone.zoneName}</div>
        <div class="rec-desc">
          Berdasarkan perhitungan DSS SAW, zona ini memperoleh preferensi terendah (Skor: <strong>${lowestZone.finalScoreV}</strong>).
          Catatan Lapangan: <em>"${lowestZone.catatan}"</em>. Direkomendasikan mengarahkan tim piket Adiwiyata tambahan ke lokasi ini.
        </div>
      </div>
      <div class="recommendation-item">
        <div class="rec-title">🌟 Benchmarking Model: ${highestZone.zoneName}</div>
        <div class="rec-desc">
          Zona ini memperoleh preferensi tertinggi (Skor: <strong>${highestZone.finalScoreV}</strong>) dan memenuhi kriteria standar preservasi lingkungan sekolah secara konsisten.
        </div>
      </div>
    `;
  }

  // Modal Functionality
  function openDetailModal(zoneId) {
    const zone = calculatedDssResults.find(z => z.id === zoneId);
    if (!zone) return;

    if (dssModalTitle) dssModalTitle.textContent = `Matriks Detail: ${zone.zoneName}`;

    if (dssModalBody) {
      dssModalBody.innerHTML = `
        <p style="font-size: 0.85rem; color: #475569; margin-top: 0;">
          Rincian nilai mentah (Raw) dan hasil normalisasi (R) kriteria SAW untuk <strong>${zone.id}</strong>:
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; margin-bottom: 1rem;">
          <thead>
            <tr style="background-color: #f8fafc; text-align: left;">
              <th style="padding: 0.5rem; border-bottom: 2px solid #e2e8f0;">Kriteria</th>
              <th style="padding: 0.5rem; border-bottom: 2px solid #e2e8f0;">Nilai Mentah</th>
              <th style="padding: 0.5rem; border-bottom: 2px solid #e2e8f0;">Normalisasi (R)</th>
              <th style="padding: 0.5rem; border-bottom: 2px solid #e2e8f0;">Terbobot (W × R)</th>
            </tr>
          </thead>
          <tbody>
            ${DSS_CRITERIA.map(crit => {
              const raw = zone.scores[crit.id] || 0;
              const norm = zone.normalizedScores[crit.id] || 0;
              const weighted = (crit.weight * norm).toFixed(4);
              return `
                <tr>
                  <td style="padding: 0.5rem; border-bottom: 1px solid #f1f5f9;"><strong>${crit.id}</strong> - ${crit.name}</td>
                  <td style="padding: 0.5rem; border-bottom: 1px solid #f1f5f9;">${raw}</td>
                  <td style="padding: 0.5rem; border-bottom: 1px solid #f1f5f9;">${norm.toFixed(2)}</td>
                  <td style="padding: 0.5rem; border-bottom: 1px solid #f1f5f9; font-weight: 700; color: var(--color-primary, #1b4332);">${weighted}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        <div style="background-color: #f1f5f9; padding: 0.75rem; border-radius: 8px; font-size: 0.8rem; color: #334155;">
          <strong>Catatan Evaluator:</strong> ${zone.catatan || 'Tidak ada catatan.'}
        </div>
      `;
    }

    if (dssDetailModal) dssDetailModal.classList.add('active');
  }

  function closeModal() {
    if (dssDetailModal) dssDetailModal.classList.remove('active');
  }

  if (btnCloseDssModal) btnCloseDssModal.addEventListener('click', closeModal);
  if (btnCloseDssFooter) btnCloseDssFooter.addEventListener('click', closeModal);

  if (btnRecalculateDss) {
    btnRecalculateDss.addEventListener('click', () => {
      loadDssData();
      calculateSAW();
      renderTable();
      renderRecommendations();
    });
  }

  // Execution Initial Render
  renderTable();
  renderRecommendations();
}