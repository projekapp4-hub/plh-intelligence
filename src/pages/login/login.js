/**
 * ============================================================================
 * PLH-Intelligence - Skrip Pengontrol Halaman Login (login.js)
 * ============================================================================
 * File: src/pages/login/login.js
 * Deskripsi: Menangani event handler formulir, interaktivitas mata kata sandi,
 * penanganan status indikator pemrosesan, serta pengintegrasian fungsi otentikasi
 * dari modul `src/utils/auth.js`.
 * ============================================================================
 */

import { loginUser, redirectIfAuthenticated } from '../../utils/auth.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Eksekusi Proteksi Rute Terbalik
  // Jika pengguna sudah dalam status terautentikasi, cegah akses login dan lempar ke dashboard
  redirectIfAuthenticated();

  // 2. Inisialisasi dan Pemetaan Elemen DOM (Document Object Model)
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const rememberCheckbox = document.getElementById('rememberMe');
  const submitBtn = document.getElementById('submitBtn');
  const btnSpinner = document.getElementById('btnSpinner');
  const btnText = document.getElementById('btnText');
  const alertContainer = document.getElementById('alertContainer');

  /**
   * Menampilkan komponen alert notifikasi secara dinamis pada antarmuka login.
   * 
   * @param {string} message - Teks pesan yang akan disampaikan kepada pengguna.
   * @param {'danger' | 'success' | 'warning' | 'info'} type - Kategori visual warna alert.
   */
  function showAlert(message, type = 'danger') {
    if (!alertContainer) return;

    alertContainer.className = `alert alert-${type} alert-dismissible fade show role-alert`;
    alertContainer.innerHTML = `
      <div class="alert-content d-flex align-items-center gap-2">
        <span class="alert-icon">${type === 'danger' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️'}</span>
        <span class="alert-message">${message}</span>
      </div>
    `;
    alertContainer.style.display = 'block';
  }

  /**
   * Menyembunyikan dan membersihkan komponen alert notifikasi.
   */
  function hideAlert() {
    if (!alertContainer) return;
    alertContainer.style.display = 'none';
    alertContainer.innerHTML = '';
  }

  /**
   * Mengatur indikator status tombol masuk (State Loading & Disabled).
   * 
   * @param {boolean} isLoading - Menentukan apakah sistem sedang memproses otentikasi.
   */
  function setLoadingState(isLoading) {
    if (!submitBtn) return;

    submitBtn.disabled = isLoading;

    if (isLoading) {
      if (btnSpinner) btnSpinner.style.display = 'inline-flex';
      if (btnText) btnText.textContent = 'Memverifikasi Hak Akses...';
    } else {
      if (btnSpinner) btnSpinner.style.display = 'none';
      if (btnText) btnText.textContent = 'Masuk ke Dashboard';
    }
  }

  // 3. Penanganan Fitur Toggle Visibilitas Kata Sandi (Tampilkan / Sembunyikan Password)
  if (togglePasswordBtn && passwordInput) {
    const eyeOpen = togglePasswordBtn.querySelector('.eye-open');
    const eyeClosed = togglePasswordBtn.querySelector('.eye-closed');

    togglePasswordBtn.addEventListener('click', () => {
      const isPasswordType = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPasswordType ? 'text' : 'password');
      togglePasswordBtn.setAttribute('aria-label', isPasswordType ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi');

      if (eyeOpen && eyeClosed) {
        eyeOpen.style.display = isPasswordType ? 'none' : 'block';
        eyeClosed.style.display = isPasswordType ? 'block' : 'none';
      }
    });
  }

  /**
   * Menjalankan animasi transisi melayang dan membesar (SVG Portal Transition)
   * menuju ke halaman dashboard.html secara mulus.
   */
  function triggerPortalTransition() {
    const portalOverlay = document.getElementById('transitionPortal');
    const portalCircle = document.getElementById('portalCircle');
    const body = document.body;

    if (!portalOverlay || !portalCircle || !submitBtn) {
      window.location.href = 'dashboard.html';
      return;
    }

    // 1. Ambil posisi viewport akurat (mendukung mobile viewport & dynamic scroll)
    const btnRect = submitBtn.getBoundingClientRect();
    const startX = btnRect.left + btnRect.width / 2;
    const startY = btnRect.top + btnRect.height / 2;

    // Viewport center yang presisi di semua perangkat (Desktop, Tablet, Mobile)
    const viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;

    // Kunci scroll layar saat transisi agar tidak bergeser di smartphone
    body.style.overflow = 'hidden';
    submitBtn.style.opacity = '0';
    body.classList.add('is-transitioning');
    portalOverlay.classList.add('active');

    // 2. Set posisi awal portal circle tepat di atas tombol submit menggunakan fixed positioning
    portalCircle.style.position = 'fixed';
    portalCircle.style.left = `${startX}px`;
    portalCircle.style.top = `${startY}px`;
    portalCircle.style.transform = `translate3d(-50%, -50%, 0) scale(0.6)`;
    portalCircle.style.opacity = '1';

    // 3. Fase Melayang ke Titik Tengah Layar (True Screen Center)
    requestAnimationFrame(() => {
      // Trigger reflow
      void portalCircle.offsetWidth;

      setTimeout(() => {
        portalCircle.classList.add('floating-to-center');
        const deltaX = centerX - startX;
        const deltaY = centerY - startY;
        portalCircle.style.transform = `translate3d(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px), 0) scale(1.25)`;

        // 4. Fase Membesar Menyelimuti Seluruh Layar (Expanding Portal Overlay)
        setTimeout(() => {
          portalCircle.classList.add('expanding');
          portalCircle.style.transform = `translate3d(calc(-50% + ${deltaX}px), calc(-50% + ${deltaY}px), 0) scale(60)`;

          // 5. Eksekusi Pengalihan Halaman ke Dashboard
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 450);
        }, 550);
      }, 30);
    });
  }

  // 4. Penanganan Event Submit Formulir Otentikasi
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      hideAlert();

      const usernameValue = usernameInput ? usernameInput.value.trim() : '';
      const passwordValue = passwordInput ? passwordInput.value.trim() : '';
      const isRemembered = rememberCheckbox ? rememberCheckbox.checked : true;

      // Validasi 1: Input Username Kosong
      if (!usernameValue) {
        showAlert('Silakan masukkan Username, NIS, atau NIP Anda.', 'danger');
        if (usernameInput) usernameInput.focus();
        return;
      }

      // Validasi 2: Input Kata Sandi Kosong
      if (!passwordValue) {
        showAlert('Silakan masukkan kata sandi akun Anda.', 'danger');
        if (passwordInput) passwordInput.focus();
        return;
      }

      // Validasi 3: Batas Minimal Karakter Kata Sandi
      if (passwordValue.length < 4) {
        showAlert('Kata sandi harus memiliki panjang minimal 4 karakter.', 'warning');
        if (passwordInput) passwordInput.focus();
        return;
      }

      // Aktifkan indikator proses loading pada tombol submit
      setLoadingState(true);

      try {
        // Eksekusi prosedur otentikasi dari utilitas auth.js
        const authResponse = await loginUser(usernameValue, passwordValue, isRemembered);

        if (authResponse && authResponse.success) {
          showAlert(authResponse.message || 'Login berhasil! Membuka Portal...', 'success');

          // Jalankan animasi transisi melayang dan membesar
          setTimeout(() => {
            triggerPortalTransition();
          }, 350);
        } else {
          // Menampilkan pesan kesalahan resmi dari respons auth.js (misal: "Sandi atau Username Salah")
          const errorMessage = authResponse && authResponse.message
            ? authResponse.message
            : 'Kombinasi username atau kata sandi tidak sesuai.';

          showAlert(errorMessage, 'danger');
          setLoadingState(false);
        }
      } catch (error) {
        console.error('Terjadi Kegagalan pada Proses Otentikasi:', error);
        showAlert('Sistem mengalami gangguan teknis. Silakan coba kembali.', 'danger');
        setLoadingState(false);
      }
    });
  }
});