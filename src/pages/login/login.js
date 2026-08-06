/**
 * LOGIN.JS - Interactive Logic & Authentication Workflow
 * Aplikasi PLH-Intelligence
 * SMART Ekselensia Indonesia
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inisialisasi Elemen DOM
  const loginForm = document.getElementById('loginForm');
  const roleTabs = document.querySelectorAll('.role-tab');
  const userRoleInput = document.getElementById('userRole');
  const usernameLabel = document.getElementById('usernameLabel');
  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
  const btnSpinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;
  const alertContainer = document.getElementById('loginAlert');
  const usernameError = document.getElementById('usernameError');
  const passwordError = document.getElementById('passwordError');

  // 2. Pemetaan Label Berdasarkan Peran Pengguna
  const roleConfig = {
    santri: {
      label: 'Nomor Induk Santri (NIS)',
      placeholder: 'Masukkan NIS santri (contoh: 202601001)...'
    },
    pengawas: {
      label: 'NIP / ID Pengawas PLH',
      placeholder: 'Masukkan NIP atau ID Pengawas...'
    },
    admin: {
      label: 'Username Administrator',
      placeholder: 'Masukkan username admin...'
    }
  };

  // 3. Logika Alih Tab Peran (Role Switcher)
  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Hapus status aktif dari seluruh tab
      roleTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });

      // Aktifkan tab yang diklik
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const selectedRole = tab.getAttribute('data-role');
      if (userRoleInput) {
        userRoleInput.value = selectedRole;
      }

      // Perbarui label dan placeholder sesuai peran
      if (roleConfig[selectedRole] && usernameLabel && usernameInput) {
        usernameLabel.textContent = roleConfig[selectedRole].label;
        usernameInput.placeholder = roleConfig[selectedRole].placeholder;
      }

      // Bersihkan pesan kesalahan saat berpindah peran
      clearErrors();
    });
  });

  // 4. Logika Tampilkan / Sembunyikan Kata Sandi
  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
      togglePasswordBtn.setAttribute('aria-label', isPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi');
    });
  }

  // 5. Fungsi Helper Menampilkan & Membersihkan Pesan Kesalahan
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

  // 6. Validasi Formulir Klien
  function validateForm() {
    clearErrors();
    let isValid = true;

    if (!usernameInput.value.trim()) {
      if (usernameError) usernameError.textContent = 'Bidang ini wajib diisi.';
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

  // 7. Penanganan Pengiriman Formulir (Submit Handler)
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      // Ubah status tombol menjadi Loading
      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Memverifikasi...';
      if (btnSpinner) btnSpinner.style.display = 'inline-block';

      // Simulasi Proses Autentikasi Sistem
      setTimeout(() => {
        const currentRole = userRoleInput ? userRoleInput.value : 'santri';

        // Simpan sesi autentikasi sederhana ke LocalStorage
        const userSession = {
          role: currentRole,
          username: usernameInput.value.trim(),
          isLoggedIn: true,
          loginTime: new Date().toISOString()
        };

        localStorage.setItem('plh_user_session', JSON.stringify(userSession));

        // Tampilkan pesan sukses
        showAlert(`Berhasil masuk sebagai ${currentRole.toUpperCase()}. Mengalihkan ke dashboard...`, 'success');

        // Pengalihan otomatis ke halaman dashboard
        setTimeout(() => {
          window.location.href = './dashboard.html';
        }, 1200);

      }, 1000);
    });
  }

  console.log('PLH-Intelligence Login Logic Initialized - SMART Ekselensia Indonesia');
});