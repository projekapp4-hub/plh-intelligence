/**
 * ============================================================================
 * DASHBOARD.JS - SPA Canvas Orchestrator & View Loader (IndexedDB Ready)
 * Aplikasi PLH-Intelligence
 * SMART Ekselensia Indonesia
 * ============================================================================
 */

// 1. Import Modul Otentikasi Terpusat
import { requireAuth, getCurrentUser, logoutUser } from '../../utils/auth.js';

// 2. Import Modul Storage IndexedDB & Mock Data (Sesuai export di storage.js)
import { seedMockData, getAllItems } from '../../utils/storage.js';
import { getMockReports } from '../../utils/mockData.js';

/**
 * Memeriksa dan menyuntikkan mock data ke dalam IndexedDB (store: dss_records)
 * apabila peranti / PC baru belum memiliki rekaman data laporan.
 */
async function initStorageWithMockData() {
  try {
    // Ambil data laporan dari store 'dss_records' di IndexedDB
    const currentReports = await getAllItems('dss_records');

    // Jika Storage IndexedDB masih kosong
    if (!currentReports || currentReports.length === 0) {
      const mockData = getMockReports();
      
      // Gunakan fungsi seedMockData asynchronous dari storage.js
      await seedMockData(mockData);
      console.log(`[PLH-Storage] Berhasil menyuntikkan ${mockData.length} mock data laporan awal ke IndexedDB.`);
    } else {
      console.log(`[PLH-Storage] Data laporan terdeteksi di IndexedDB (${currentReports.length} laporan siap digunakan).`);
    }
  } catch (error) {
    console.error('[PLH-Storage] Gagal menginisialisasi mock data pada IndexedDB:', error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // 0. Proteksi Rute (Route Guarding)
  requireAuth();

  // 1. Inisialisasi Storage Async (IndexedDB)
  await initStorageWithMockData();

  // 2. Inisialisasi Elemen DOM Canvas & Navigasi
  const spaCanvas = document.getElementById('spaCanvas');
  const navButtons = document.querySelectorAll('.spa-nav-btn');
  const topbarTitle = document.getElementById('topbarTitle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const currentDateBadge = document.getElementById('currentDateBadge');
  const logoutBtn = document.getElementById('logoutBtn');

  // Elemen Sesi Pengguna
  const userNameElem = document.getElementById('userName');
  const userAvatarElem = document.getElementById('userAvatar');

  // Ambil data sesi pengguna
  const currentUserSession = getCurrentUser() || {
    name: 'Santri / Pengawas',
    username: 'guest'
  };

  // 3. Format Tanggal Saat Ini di Topbar
  if (currentDateBadge) {
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    currentDateBadge.textContent = new Date().toLocaleDateString('id-ID', options);
  }

  // Tampilkan Identitas Pengguna di Sidebar
  const displayName = currentUserSession.name || currentUserSession.username;
  if (userNameElem && displayName) {
    userNameElem.textContent = displayName;
    if (userAvatarElem) {
      userAvatarElem.textContent = displayName.charAt(0).toUpperCase();
    }
  }

  /**
   * 4. Fungsi Utama Pemuat Modul Tampilan (Dynamic View Router)
   */
  async function loadViewModule(viewName) {
    if (!spaCanvas) return;

    // Indikator pemuatan skeleton shimmer modern
    spaCanvas.innerHTML = `
      <div class="canvas-skeleton" aria-busy="true" aria-label="Memuat konten...">
        <!-- Skeleton Header Bar -->
        <div class="skeleton-header-row">
          <div style="display: flex; flex-direction: column; gap: 8px; width: 45%;">
            <div class="skeleton-box" style="height: 24px; width: 60%;"></div>
            <div class="skeleton-box" style="height: 14px; width: 90%;"></div>
          </div>
          <div class="skeleton-box" style="height: 36px; width: 140px; border-radius: 8px;"></div>
        </div>

        <!-- Skeleton KPI Cards Grid -->
        <div class="skeleton-kpi-grid">
          <div class="skeleton-card">
            <div class="skeleton-box" style="height: 14px; width: 50%; margin-bottom: 12px;"></div>
            <div class="skeleton-box" style="height: 32px; width: 70%; margin-bottom: 8px;"></div>
            <div class="skeleton-box" style="height: 12px; width: 85%;"></div>
          </div>
          <div class="skeleton-card">
            <div class="skeleton-box" style="height: 14px; width: 55%; margin-bottom: 12px;"></div>
            <div class="skeleton-box" style="height: 32px; width: 65%; margin-bottom: 8px;"></div>
            <div class="skeleton-box" style="height: 12px; width: 75%;"></div>
          </div>
          <div class="skeleton-card">
            <div class="skeleton-box" style="height: 14px; width: 60%; margin-bottom: 12px;"></div>
            <div class="skeleton-box" style="height: 32px; width: 80%; margin-bottom: 8px;"></div>
            <div class="skeleton-box" style="height: 12px; width: 70%;"></div>
          </div>
          <div class="skeleton-card">
            <div class="skeleton-box" style="height: 14px; width: 45%; margin-bottom: 12px;"></div>
            <div class="skeleton-box" style="height: 32px; width: 60%; margin-bottom: 8px;"></div>
            <div class="skeleton-box" style="height: 12px; width: 80%;"></div>
          </div>
        </div>

        <!-- Skeleton Content Panels -->
        <div class="skeleton-main-grid">
          <div class="skeleton-card" style="min-height: 280px; display: flex; flex-direction: column; gap: 14px;">
            <div class="skeleton-box" style="height: 20px; width: 40%;"></div>
            <div class="skeleton-box" style="height: 16px; width: 75%;"></div>
            <div class="skeleton-box" style="height: 180px; width: 100%; border-radius: 8px; margin-top: auto;"></div>
          </div>
          <div class="skeleton-card" style="min-height: 280px; display: flex; flex-direction: column; gap: 14px;">
            <div class="skeleton-box" style="height: 20px; width: 60%;"></div>
            <div class="skeleton-box" style="height: 14px; width: 90%;"></div>
            <div class="skeleton-box" style="height: 48px; width: 100%; border-radius: 8px;"></div>
            <div class="skeleton-box" style="height: 48px; width: 100%; border-radius: 8px;"></div>
            <div class="skeleton-box" style="height: 48px; width: 100%; border-radius: 8px;"></div>
          </div>
        </div>
      </div>
    `;

    try {
      // Import modul secara dinamis
      const viewModule = await import(`./views/${viewName}.js`);

      // Bersihkan canvas
      spaCanvas.innerHTML = '';

      // Eksekusi fungsi render dengan try-catch internal
      try {
        if (viewModule && typeof viewModule.render === 'function') {
          await viewModule.render(spaCanvas);
        } else if (viewModule && typeof viewModule.default === 'function') {
          await viewModule.default(spaCanvas);
        } else {
          spaCanvas.innerHTML = `
            <div class="canvas-error">
              ⚠️ Berkas <strong>views/${viewName}.js</strong> tidak mengekspor fungsi <code>render(container)</code> yang valid.
            </div>
          `;
        }
      } catch (renderError) {
        console.error(`Error saat mengeksekusi render pada views/${viewName}.js:`, renderError);
        spaCanvas.innerHTML = `
          <div class="canvas-error">
            ❌ Terjadi kesalahan saat merender tampilan <strong>${viewName}</strong>: <br>
            <code>${renderError.message}</code>
          </div>
        `;
      }

    } catch (importError) {
      console.error(`Gagal mengimpor modul views/${viewName}.js:`, importError);
      spaCanvas.innerHTML = `
        <div class="canvas-error">
          ❌ Gagal memuat tampilan. Pastikan berkas <strong>src/pages/dashboard/views/${viewName}.js</strong> sudah tersedia.
        </div>
      `;
    }
  }

  /**
   * 5. Handler Pengalih Navigasi
   */
  function navigateTo(targetView, pageTitle) {
    navButtons.forEach(btn => {
      const isTarget = btn.getAttribute('data-view') === targetView;
      btn.classList.toggle('active', isTarget);
    });

    if (topbarTitle && pageTitle) {
      topbarTitle.textContent = pageTitle;
    }

    closeMobileSidebar();
    loadViewModule(targetView);
  }

  // 6. Penanganan Event Klik Navigasi
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      const pageTitle = btn.getAttribute('data-title') || btn.querySelector('.nav-label')?.textContent;
      navigateTo(targetView, pageTitle);
    });
  });

  // 7. Kontrol Off-Canvas Sidebar Mobile
  function openMobileSidebar() {
    if (sidebar) sidebar.classList.add('active');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
  }

  function closeMobileSidebar() {
    if (sidebar) sidebar.classList.remove('active');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
  }

  if (sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', openMobileSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeMobileSidebar);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeMobileSidebar);

  // 8. Kontrol Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
        logoutUser();
      }
    });
  }

  // Inisialisasi Tampilan Awal
  navigateTo('quickView', 'Dashboard');

  console.log('PLH-Intelligence Router Initialized with IndexedDB Support');
});