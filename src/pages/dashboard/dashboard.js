/**
 * DASHBOARD.JS - SPA Canvas Orchestrator & View Loader
 * Aplikasi PLH-Intelligence
 * SMART Ekselensia Indonesia
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inisialisasi Elemen DOM Canvas & Navigasi
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

  // Ambil data sesi dari LocalStorage
  const currentUserSession = JSON.parse(localStorage.getItem('plh_user_session')) || {
    username: 'Santri / Pengawas',
    isLoggedIn: true
  };

  // 2. Format Tanggal Saat Ini di Topbar
  if (currentDateBadge) {
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    currentDateBadge.textContent = new Date().toLocaleDateString('id-ID', options);
  }

  // Tampilkan Identitas Pengguna di Sidebar
  if (userNameElem && currentUserSession.username) {
    userNameElem.textContent = currentUserSession.username;
    if (userAvatarElem) {
      userAvatarElem.textContent = currentUserSession.username.charAt(0).toUpperCase();
    }
  }

  /**
   * 3. Fungsi Utama Pemuat Modul Tampilan (Dynamic View Router)
   * Mengimpor berkas JavaScript secara dinamis dari folder ./views/
   * @param {string} viewName - Nama file JS tanpa ekstensi (misal: 'quickView', 'formView', 'data', 'periodic', 'dssView')
   */
  async function loadViewModule(viewName) {
    if (!spaCanvas) return;

    // Tampilkan indikator pemuatan pada canvas
    spaCanvas.innerHTML = `
      <div class="canvas-loading">
        <span>⏳ Memuat modul <strong>views/${viewName}.js</strong>...</span>
      </div>
    `;

    try {
      // Import modul secara dinamis dari folder ./views/
      const viewModule = await import(`./views/${viewName}.js`);

      // Bersihkan canvas dari status loading
      spaCanvas.innerHTML = '';

      // Eksekusi fungsi render yang diekspor oleh berkas modul view
      if (viewModule && typeof viewModule.render === 'function') {
        viewModule.render(spaCanvas);
      } else if (viewModule && typeof viewModule.default === 'function') {
        viewModule.default(spaCanvas);
      } else {
        spaCanvas.innerHTML = `
          <div class="canvas-error">
            ⚠️ Berkas <strong>views/${viewName}.js</strong> tidak mengekspor fungsi <code>render(container)</code> atau <code>default(container)</code> yang valid.
          </div>
        `;
      }
    } catch (error) {
      console.error(`Gagal mengimpor modul views/${viewName}.js:`, error);
      spaCanvas.innerHTML = `
        <div class="canvas-error">
          ❌ Gagal memuat tampilan. Pastikan berkas <strong>src/pages/dashboard/views/${viewName}.js</strong> sudah tersedia.
        </div>
      `;
    }
  }

  /**
   * 4. Handler Pengalih Navigasi Aktif
   * @param {string} targetView - Nama view tujuan
   * @param {string} pageTitle - Judul yang ditampilkan pada topbar
   */
  function navigateTo(targetView, pageTitle) {
    // Perbarui status kelas aktif tombol navbar
    navButtons.forEach(btn => {
      const isTarget = btn.getAttribute('data-view') === targetView;
      btn.classList.toggle('active', isTarget);
    });

    // Perbarui judul topbar
    if (topbarTitle && pageTitle) {
      topbarTitle.textContent = pageTitle;
    }

    // Tutup sidebar jika dalam mode mobile
    closeMobileSidebar();

    // Muat modul berkas JavaScript dari folder views
    loadViewModule(targetView);
  }

  // 5. Penanganan Event Klik pada Menu Navbar
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      const pageTitle = btn.getAttribute('data-title') || btn.querySelector('.nav-label').textContent;
      navigateTo(targetView, pageTitle);
    });
  });

  // 6. Kontrol Off-Canvas Sidebar Mobile
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

  // 7. Kontrol Keluar Sistem (Logout)
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
        localStorage.removeItem('plh_user_session');
        window.location.href = './login.html';
      }
    });
  }

  // Inisialisasi Tampilan Awal: Memuat quickView.js secara default
  navigateTo('quickView', 'Dashboard');

  console.log('PLH-Intelligence Modular Router Initialized (Views Directory Integration)');
});