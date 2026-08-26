# PLH Intelligence

Sebuah aplikasi web modern berbasis Vite dan Serverless Architecture yang dirancang untuk performa tinggi, efisiensi pengembangan, keamanan kunci API, dan antarmuka yang responsif.

---

## 📌 Prasyarat Sistem

Sebelum memulai penyiapan proyek di lingkungan lokal, pastikan perangkat komputer Anda telah terpasang perangkat lunak berikut:

* **Node.js**: `v20.x` / `v22.x` / `v24.x` (atau versi LTS terbaru)
* **npm**: Terpasang otomatis bersamaan dengan Node.js
* **Git**: Untuk keperluan verifikasi dan kontrol versi

Untuk memeriksa versi Node.js dan npm yang terinstal di komputer Anda:

```bash
node -v
npm -v
```

---

## 🚀 Langkah-Langkah Instalasi & Penggunaan

### 1. Kloning Repositori

Unduh salinan kode sumber dari repositori GitHub ke komputer lokal Anda:

```bash
git clone https://github.com/projekapp4-hub/plh-intelligence.git
cd plh-intelligence
```

---

### 2. Instalasi Dependensi

Pasang seluruh paket dan modul dependensi:

```bash
npm install
```

---

### 3. Konfigurasi Lingkungan (Environment Variables)

Aplikasi ini menggunakan arsitektur Serverless Function untuk mengamankan Google Gemini API Key agar tidak terekspos ke sisi klien (*browser*).

Buatlah berkas `.env` pada direktori utama (*root directory*) proyek:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Catatan Keamanan:**
> * Gunakan variabel `GEMINI_API_KEY` (tanpa prefix `VITE_`) agar kunci diproses murni di sisi *backend/serverless*.
> * Berkas `.env` telah didaftarkan pada `.gitignore` dan **jangan pernah diunggah ke GitHub**.

---

### 4. Menjalankan Server Pengembangan Lokal

Untuk menjalankan frontend (Vite) beserta Serverless Functions (Netlify) secara bersamaan di lingkungan lokal:

```bash
npm run dev:netlify
```

Buka peramban (*browser*) Anda pada tautan berikut:

```text
http://localhost:8888
```

*(Catatan: Anda juga dapat menjalankan `npm run dev` untuk server Vite murni di port `3000` dengan reverse-proxy aktif).*

---

### 5. Proses Build & Deployment Produksi

#### Kompilasi Frontend
```bash
npm run build
```

#### Deployment ke Netlify (Direkomendasikan via Git)
1. Sambungkan repositori GitHub ini ke dashboard **Netlify**.
2. Netlify akan otomatis membaca konfigurasi `netlify.toml` (Build command: `npm run build`, Publish directory: `dist`, Functions: `netlify/functions`).
3. Tambahkan environment variable pada dashboard Netlify:
   * **Site configuration** > **Environment variables** > **Add a variable**
   * Key: `GEMINI_API_KEY`
   * Value: `[KUNCI_API_GEMINI_ANDA]`
4. Aplikasi siap digunakan dengan endpoint API yang aman.

---

## 📁 Struktur Ringkas Proyek

```text
plh-intelligence/
├── netlify/
│   └── functions/      # Serverless Functions (Backend proxy API Gemini)
├── public/             # Aset statis terbuka
├── src/                # Kode sumber utama aplikasi frontend
│   ├── api/            # Client layer pemanggilan serverless API
│   ├── assets/         # Gambar dan media
│   ├── pages/          # Modul halaman (landing, login, dashboard)
│   ├── style/          # Stylesheet & tema
│   └── utils/          # Helper & storage manager
├── .env                # Variabel lingkungan lokal (dibuat manual)
├── .gitignore          # Daftar berkas/folder yang diabaikan Git
├── netlify.toml        # Konfigurasi routing & dev server Netlify
├── package.json        # Manifest proyek & dependencies
└── vite.config.js      # Konfigurasi bundler Vite
```
