# PLH Intelligence

Sebuah aplikasi web modern berbasis Vite yang dirancang untuk performa tinggi, efisiensi pengembangan, dan antarmuka yang responsif.

---

## 📌 Prasyarat Sistem

Sebelum memulai penyiapan proyek di lingkungan lokal, pastikan perangkat komputer Anda telah terpasang perangkat lunak berikut:

* **Node.js**: `v24.13.0` (atau versi LTS/terbaru yang kompatibel)
* **npm**: Terpasang otomatis bersamaan dengan Node.js
* **Git**: Untuk keperluan verifikasi dan kontrol versi

Untuk memeriksa versi Node.js dan npm yang terinstal di komputer Anda, jalankan perintah berikut di terminal:

```bash
node -v
npm -v
```
---

## 🚀 Langkah-Langkah Instalasi & Penggunaan

Ikuti urutan langkah berikut untuk mengkloning, memasang dependensi, dan menjalankan proyek di mesin lokal Anda:

### 1. Kloning Repositori

Unduh salinan kode sumber dari repositori GitHub ke komputer lokal Anda:

```bash
git clone [https://github.com/projekapp4-hub/plh-intelligence.git](https://github.com/projekapp4-hub/plh-intelligence.git)

```

Setelah proses pengunduhan selesai, masuk ke dalam direktori proyek:

```bash
cd plh-intelligence

```

---

### 2. Instalasi Dependensi

Pasang seluruh paket dan modul dependensi yang tercantum di dalam berkas `package.json`:

```bash
npm install

```

---

### 3. Konfigurasi Lingkungan (Environment Variables)

Proyek ini memerlukan konfigurasi variabel lingkungan khusus untuk mendukung fungsionalitas.

Buatlah berkas bernama `.env` secara manual pada direktori utama (*root directory*) proyek Anda, lalu isi dengan kunci dan nilai konfigurasi yang diperlukan.

> **Catatan Penting:**
> * Selalu gunakan awalan `VITE_` pada nama variabel lingkungan agar dapat diakses di dalam kode frontend Vite (contoh: `VITE_API_BASE_URL=https://api.example.com`).
> * Pastikan berkas `.env` **tidak pernah diunggah** ke GitHub demi menjaga kerahasiaan kunci API atau data sensitif lainnya.
> * Variabel yang dibuat adalah `VITE_GEMINI_API_KEY=`
> 

---

### 4. Menjalankan Server Pengembangan (Development Server)

Setelah seluruh dependensi terpasang dan konfigurasi `.env` siap, jalankan server lokal Vite dengan fitur *Hot Module Replacement* (HMR):

```bash
npm run dev

```

Secara *default*, server akan berjalan pada alamat lokal berikut:

```text
http://localhost:3000

```

Buka tautan di atas melalui peramban (*browser*) Anda untuk melihat aplikasi secara langsung.

---

## 📁 Struktur Ringkas Proyek

```text
plh-intelligence/
├── node_modules/       # Modul dependensi proyek (diabaikan oleh Git)
├── public/             # Aset statis terbuka (favicon, gambar umum, dll.)
├── src/                # Kode sumber utama aplikasi (komponen, halaman, gaya)
├── .env                # File variabel lingkungan lokal (dibuat manual)
├── .gitignore          # Daftar berkas/folder yang diabaikan Git
├── index.html          # File entri utama HTML untuk Vite
├── package.json        # Manifest proyek dan daftar dependensi npm
├── package-lock.json   # Rekaman versi pasti dari dependensi terinstal
└── vite.config.js      # Konfigurasi utama bundler Vite

```
