/**
 * LOGIN.JS - Logic & Authentication Workflow
 * Aplikasi PLH-Intelligence
 * SMART Ekselensia Indonesia
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inisialisasi Elemen DOM
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  const btnSpinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;
  const alertContainer = document.getElementById('loginAlert');
  const usernameError = document.getElementById('usernameError');
  const passwordError = document.getElementById('passwordError');

  // 2. Logika Tampilkan / Sembunyikan Kata Sandi
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
      togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi');
    });
  }

  // 3. Helper Menampilkan & Membersihkan Pesan Kesalahan
  function clearErrors() {
    if (usernameError) usernameError.textContent = '';
    if (passwordError) passwordError.textContent = '';
    if (alertContainer) alertContainer.innerHTML = '';
  }

  function showAlert(message, type = 'danger') {
    if (!alertContainer) return;

    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    alertContainer.innerHTML = `
      <div class="alert ${alertClass}">
        <span>${message}</span>
      </div>
    `;
  }

  // 4. Validasi Formulir Klien
  function validateForm() {
    clearErrors();
    let isValid = true;

    if (!usernameInput.value.trim()) {
      if (usernameError) usernameError.textContent = 'NIS, NIP, atau Username wajib diisi.';
      isValid = false;
    }

    if (!passwordInput.value) {
      if (passwordError) passwordError.textContent = 'Kata sandi wajib diisi.';
      isValid = false;
    } else if (passwordInput.value.length < 4) {
      if (passwordError) passwordError.textContent = 'Kata sandi minimal terdiri dari 4 karakter.';
      isValid = false;
    }

    return isValid;
  }

  // 5. Penanganan Pengiriman Formulir (Submit Handler)
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      // Status tombol menjadi Loading
      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Memverifikasi...';
      if (btnSpinner) btnSpinner.style.display = 'inline-block';

      // Simulasi Autentikasi Sederhana
      setTimeout(() => {
        const userSession = {
          username: usernameInput.value.trim(),
          isLoggedIn: true,
          loginTime: new Date().toISOString()
        };

        localStorage.setItem('plh_user_session', JSON.stringify(userSession));

        showAlert('Berhasil masuk. Mengalihkan ke dashboard...', 'success');

        // Pengalihan ke dashboard
        setTimeout(() => {
          window.location.href = './dashboard.html';
        }, 800);

      }, 800);
    });
  }

  console.log('PLH-Intelligence Login Logic Initialized - SMART Ekselensia Indonesia');
});