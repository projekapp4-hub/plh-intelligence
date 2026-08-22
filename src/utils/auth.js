/**
 * ============================================================================
 * PLH-Intelligence - Modul Otentikasi Terpusat (auth.js)
 * ============================================================================
 * File: src/utils/auth.js
 * Deskripsi: Menyediakan API lengkap untuk manajemen otentikasi pengguna,
 * penyimpanan sesi terenkapsulasi, verifikasi status login, serta
 * mekanisme proteksi rute (Route Guarding) untuk portal PLH-Intelligence.
 * ============================================================================
 */

// Kunci unik penyimpanan sesi pengguna di Storage
const SESSION_KEY = 'plh_user_session';

/**
 * Database Pengguna Lokal (Mock Data)
 * Memuat data akun bawaan untuk pengujian sistem PLH-Intelligence.
 */
const MOCK_USERS = [
  {
    username: 'admin',
    password: 'admin',
    name: 'Administrator PLH',
    role: 'Admin Utama',
    nip: '198501012010011001',
    avatar: 'https://ui-avatars.com/api/?name=Admin+PLH&background=2C5E3B&color=fff'
  }
];

/**
 * Memproses otentikasi login pengguna berbasis kredensial.
 * 
 * @param {string} username - Username atau NIP pengguna.
 * @param {string} password - Kata sandi akun.
 * @param {boolean} rememberMe - Menentukan opsi persitensi sesi (localStorage vs sessionStorage).
 * @returns {Promise<{success: boolean, message: string, user?: object}>} Result objek hasil login.
 */
export async function loginUser(username, password, rememberMe = true) {
  return new Promise((resolve) => {
    // Simulasi responsivitas latensi jaringan (600ms) untuk memberikan feedback UI
    setTimeout(() => {
      const cleanUsername = username.trim().toLowerCase();
      const cleanPassword = password.trim();

      // Pencarian identitas pengguna berdasarkan Username atau NIP
      const user = MOCK_USERS.find(
        (u) => u.username.toLowerCase() === cleanUsername || u.nip === cleanUsername
      );

      // Skenario 1: Pengguna tidak ditemukan dalam sistem
      if (!user) {
        resolve({
          success: false,
          message: 'Pengguna tidak ditemukan. Periksa kembali Username atau NIP Anda.'
        });
        return;
      }

      // Skenario 2: Kata sandi tidak cocok
      if (user.password !== cleanPassword) {
        resolve({
          success: false,
          message: 'Kata sandi yang Anda masukkan tidak sesuai.'
        });
        return;
      }

      // Skenario 3: Otentikasi Berhasil - Konstruksi Payload Sesi
      const sessionData = {
        isLoggedIn: true,
        username: user.username,
        name: user.name,
        role: user.role,
        nip: user.nip,
        avatar: user.avatar,
        loginTime: new Date().toISOString()
      };

      // Tentukan target penyimpanan berbasis parameter 'Ingat Saya'
      const targetStorage = rememberMe ? localStorage : sessionStorage;
      const alternateStorage = rememberMe ? sessionStorage : localStorage;

      // Simpan payload sesi dalam format stringified JSON
      targetStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      
      // Bersihkan lokasi penyimpanan alternatif untuk mencegah redundansi atau konflik sesi
      alternateStorage.removeItem(SESSION_KEY);

      resolve({
        success: true,
        message: 'Otentikasi berhasil! Mengalihkan ke Dashboard...',
        user: sessionData
      });
    }, 600);
  });
}

/**
 * Mengambil data objek sesi pengguna yang sedang aktif saat ini.
 * 
 * @returns {object|null} Mengembalikan data sesi pengguna atau null jika tidak terautentikasi.
 */
export function getCurrentUser() {
  const localData = localStorage.getItem(SESSION_KEY);
  const sessionData = sessionStorage.getItem(SESSION_KEY);

  const activeRawData = localData || sessionData;

  if (!activeRawData) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(activeRawData);
    if (parsedSession && parsedSession.isLoggedIn) {
      return parsedSession;
    }
  } catch (error) {
    console.error('Kesalahan dalam membaca struktur data sesi:', error);
    // Jika data korup, bersihkan seluruh sesi demi keamanan
    logoutUser();
  }

  return null;
}

/**
 * Memeriksa secara pasti apakah ada pengguna yang sedang terautentikasi dalam sesi aktif.
 * 
 * @returns {boolean} True jika terautentikasi, False jika tidak.
 */
export function isAuthenticated() {
  return getCurrentUser() !== null;
}

/**
 * Proteksi Rute Utama (Route Guard)
 * Wajib dipanggil pada halaman terproteksi seperti `dashboard.html`.
 * Apabila pengguna belum melakukan login, sistem secara otomatis mengalihkan navigasi ke `login.html`.
 */
export function requireAuth() {
  if (!isAuthenticated()) {
    const currentPath = window.location.pathname;
    // Mencegah siklus pengalihan tanpa henti (infinite redirect loop)
    if (!currentPath.endsWith('login.html') && !currentPath.endsWith('landing.html') && !currentPath.endsWith('index.html') && currentPath !== '/' && !currentPath.endsWith('/')) {
      window.location.href = 'login.html';
    }
  }
}

/**
 * Proteksi Rute Terbalik (Reverse Route Guard)
 * Wajib dipanggil pada halaman `login.html`.
 * Apabila pengguna yang sudah login mencoba membuka halaman login kembali,
 * secara otomatis akan langsung dialihkan ke `dashboard.html`.
 */
export function redirectIfAuthenticated() {
  if (isAuthenticated()) {
    window.location.href = 'dashboard.html';
  }
}

/**
 * Memproses penghapusan sesi pengguna secara menyeluruh (Logout)
 * dan mengalihkan antarmuka kembali ke halaman login.
 */
export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = 'login.html';
}