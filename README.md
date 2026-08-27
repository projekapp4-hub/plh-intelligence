<div align="center">  
    
  # PLH-Intelligence   
  ### Data Tepat, Aksi Cepat, Lingkungan Terawat  
    
  [![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Visit_Site-success?style=for-the-badge)](https://plh-intelligence.netlify.app/)  
  [![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/projekapp4-hub/plh-intelligence)  
  [![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)  
    
  **Submission for ITECHNO CUP 2026 - Web Development**  
    
  **By SMAS SMART Ekselensia Indonesia**  
    
</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)  
- [Fitur Unggulan](#-fitur-unggulan)  
- [Demo & Screenshot](#-demo--screenshot)  
- [Teknologi](#-teknologi)  
- [Arsitektur Sistem](#-arsitektur-sistem)  
- [Instalasi & Setup](#-instalasi--setup)  
- [Penggunaan](#-penggunaan)  
- [API Documentation](#-api-documentation)  
- [Testing](#-testing)  
- [Tim Developer](#-tim-pengembang)  
- [Lisensi](#-lisensi)

---

## 👥 Tim Developer

| Nama | Peran | GitHub |  
|------|-------|--------|  
| **Al Musawiru** | Project Lead & Full Stack Developer | [GitHub](https://github.com/projekapp4-hub/) |  
| **Gilang Al Farizi Khasafi** | UI/UX designer | Kosong|  
| **Mujahid Kayyis** | Software Tester | Kosong|  

---

## 🎯 Tentang Proyek

### Latar Belakang

Pencatatan piket dan kebersihan di lingkungan sekolah umumnya masih dilakukan secara manual menggunakan kertas. Metode konvensional ini rentan terhadap kehilangan lembar data, kerusakan fisik, serta menyulitkan proses rekapitulasi dan evaluasi berkala saat arsip catatan mulai menumpuk.

### Solusi yang Ditawarkan

**PLH-Intelligence** mendigitalkan seluruh alur pencatatan dan rekapitulasi data piket secara real-time dan terorganisir. Aplikasi ini juga dilengkapi integrasi AI serta fitur *Decision Support System* (DSS) untuk menganalisis data kebersihan secara otomatis dan memberikan rekomendasi evaluasi yang tepat.

### Tujuan Proyek

- 🎯 **Tujuan Utama**: Menyediakan platform digital praktis untuk pencatatan, rekapitulasi otomatis, dan analisis evaluasi piket kebersihan lingkungan.
- 📊 **Target Pengguna**: Pihak sekolah (guru, koordinator piket, staf, siswa) serta instansi pendidikan atau organisasi yang mengelola kebersihan berkala.
- 💡 **Value Proposition**: Rekapitulasi instan bebas kertas yang dipadukan dengan DSS dan analitik cerdas untuk mempermudah pengambilan keputusan.

---

## ✨ Fitur Unggulan

### Fitur Utama

| Fitur | Deskripsi | Keunggulan |  
|----------|--------------|---------------|  
| **Pencatatan Piket & Rekap Online** | Input formulir piket berbasis 13 indikator Adiwiyata (5 kategori) secara digital dan terpusat. | Bebas kertas (*paperless*), data otomatis tersimpan di Database secara terstruktur dan aman. |  
| **Decision Support System (DSS) AI** | Analisis evaluasi kebersihan cerdas berbasis agregat 30 hari menggunakan Gemini AI. | Memberikan rekomendasi tindakan preventif, skor kepatuhan, dan identifikasi area kritis secara objektif. |  
| **Ekspor PDF (Per Piket & Massal)** | Cetak laporan formal berformat PDF baik per entri piket tunggal maupun rekapitulasi data massal. | Layout rapi, siap cetak untuk arsip sekolah dengan sanitasi teks otomatis via `jspdf`. |  
| **Ekspor Data Spreadsheet (Excel)** | Unduh seluruh rekapitulasi data laporan kebersihan ke dalam format `.xlsx`. | Memudahkan analisis lanjutan dan pengolahan data administratif menggunakan `exceljs`. |  
| **Cetak Lembar Form Piket Kosong** | Fitur cetak format formulir blangko fisik siap pakai langsung dari aplikasi. | Fleksibel digunakan sebagai cadangan saat dibutuhkan pencatatan luring di lapangan. |  

### Fitur Tambahan

- **Visualisasi Data & Tren Interaktif** - Grafik kepatuhan harian dan distribusi kategori kebersihan secara visual menggunakan `Chart.js`.
- **Kompresi Gambar Otomatis di Klien** - Optimasi ukuran foto dokumentasi piket sebelum disimpan menggunakan `browser-image-compression` agar efisien memori.
- **Antarmuka Responsif & Modern** - Desain SPA (*Single Page Application*) Vanilla JS dengan sistem ikon SVG semantik yang ringan dan bersih.

---

## 📸 Demo & Screenshot

### Live Demo

🔗 **[Kunjungi Website](https://plh-intelligence.netlify.app/)**

### Screenshot Aplikasi

<div align="center">  
  <img src="[URL_SCREENSHOT_1]" alt="Homepage" width="800"/>  
  <p><em>Homepage - Tampilan utama aplikasi</em></p>  
    
  <img src="[URL_SCREENSHOT_2]" alt="Dashboard" width="800"/>  
  <p><em>Dashboard - Panel kontrol pengguna</em></p>  
    
  <img src="[URL_SCREENSHOT_3]" alt="Feature" width="800"/>  
  <p><em>[Nama Fitur] - [Deskripsi screenshot]</em></p>  
</div>

### Video Demo

📹 **[Link Video Demo](https://drive.google.com/file/d/1mJ_dNP-68NWdAIWv_HYY3yvFTr5RNJIR/view?usp=sharing)** _(opsional)_

---

## 🛠️ Teknologi

### Tech Stack

#### Frontend  
```  
Framework    : [React / Next.js / Vue / dll]  
UI Library   : [Tailwind CSS / Material-UI / Chakra UI / dll]  
State Mgmt   : [Redux / Zustand / Context API / dll]  
Validation   : [Zod / Yup / React Hook Form / dll]  
```

#### Backend  
```  
Runtime      : [Node.js / Bun / Deno / dll]  
Framework    : [Express / Fastify / Hono / dll]  
Database     : [PostgreSQL / MongoDB / MySQL / dll]  
ORM          : [Prisma / Drizzle / TypeORM / dll]  
Auth         : [JWT / NextAuth / Clerk / dll]  
```

#### DevOps & Tools  
```  
Deployment   : [Vercel / Netlify / Railway / dll]  
CI/CD        : [GitHub Actions / Vercel / dll]  
Testing      : [Jest / Vitest / Playwright / dll]  
Monitoring   : [Sentry / LogRocket / dll]  
```

### Alasan Pemilihan Teknologi

| Teknologi | Alasan Pemilihan |  
|-----------|------------------|  
| **[Tech 1]** | [Jelaskan mengapa memilih teknologi ini, keunggulannya untuk proyek ini] |  
| **[Tech 2]** | [Jelaskan mengapa memilih teknologi ini, keunggulannya untuk proyek ini] |  
| **[Tech 3]** | [Jelaskan mengapa memilih teknologi ini, keunggulannya untuk proyek ini] |

### Dependencies Utama

```json  
{  
  "dependencies": {  
    "[package-1]": "^x.x.x",  
    "[package-2]": "^x.x.x",  
    "[package-3]": "^x.x.x"  
  }  
}  
```

---

## 🏗️ Arsitektur Sistem

### System Architecture

```  
[Tambahkan diagram arsitektur sistem - bisa menggunakan Mermaid atau gambar]  
```

### Database Schema

```  
[Tambahkan diagram ERD atau schema database]  
```

### Folder Structure

```  
project-root/  
├── src/  
│   ├── components/     # Reusable components  
│   ├── pages/          # Page components  
│   ├── hooks/          # Custom hooks  
│   ├── utils/          # Utility functions  
│   ├── services/       # API services  
│   ├── store/          # State management  
│   └── types/          # TypeScript types  
├── public/             # Static assets  
├── tests/              # Test files  
└── docs/               # Documentation  
```

---

## ⚙️ Instalasi & Setup

### Prerequisites

Pastikan Anda telah menginstall:  
- **Node.js** (v18.x atau lebih tinggi)  
- **npm** / **yarn** / **pnpm**  
- **[Database]** (jika diperlukan)  
- **Git**

### Langkah Instalasi

#### 1️⃣ Clone Repository

```bash  
git clone https://github.com/[username]/[repo-name].git  
cd [repo-name]  
```

#### 2️⃣ Install Dependencies

```bash  
# Menggunakan npm  
npm install

# Atau menggunakan yarn  
yarn install

# Atau menggunakan pnpm  
pnpm install  
```

#### 3️⃣ Setup Environment Variables

Buat file `.env` di root directory:

```env  
# Database  
DATABASE_URL="[connection_string]"

# Authentication  
JWT_SECRET="[your_jwt_secret]"  
NEXTAUTH_SECRET="[your_nextauth_secret]"

# API Keys  
API_KEY="[your_api_key]"

# Other configs  
NODE_ENV="development"  
PORT=3000  
```

#### 4️⃣ Setup Database

```bash  
# Jalankan migrasi database  
npm run db:migrate

# Seed data (opsional)  
npm run db:seed  
```

#### 5️⃣ Run Development Server

```bash  
npm run dev  
```

Aplikasi akan berjalan di `http://localhost:3000`

---

## 🚀 Penggunaan

### Menjalankan Aplikasi

```bash  
# Development mode  
npm run dev

# Production build  
npm run build  
npm run start

# Run tests  
npm run test

# Linting  
npm run lint  
```

### User Guide

#### Untuk Pengguna Umum

1. **Registrasi/Login**: [Jelaskan cara mendaftar atau login]  
2. **[Fitur 1]**: [Jelaskan cara menggunakan fitur ini]  
3. **[Fitur 2]**: [Jelaskan cara menggunakan fitur ini]

#### Untuk Admin

1. **Akses Admin Panel**: [Jelaskan cara mengakses]  
2. **[Fungsi Admin 1]**: [Jelaskan cara menggunakan]  
3. **[Fungsi Admin 2]**: [Jelaskan cara menggunakan]

---

## 📚 API Documentation

### Base URL

```  
Development: http://localhost:3000/api  
Production:  https://[domain]/api  
```

### Endpoints

#### Authentication

```http  
POST /api/auth/register  
POST /api/auth/login  
POST /api/auth/logout  
GET  /api/auth/me  
```

#### [Resource 1]

```http  
GET    /api/[resource]       # Get all  
GET    /api/[resource]/:id   # Get by ID  
POST   /api/[resource]       # Create  
PUT    /api/[resource]/:id   # Update  
DELETE /api/[resource]/:id   # Delete  
```

### Example Request

```javascript  
// Login  
const response = await fetch('/api/auth/login', {  
  method: 'POST',  
  headers: { 'Content-Type': 'application/json' },  
  body: JSON.stringify({  
    email: 'user@example.com',  
    password: 'password123'  
  })  
});  
```

📖 **[Dokumentasi API Lengkap](./docs/API.md)** _(opsional)_

---

## 🧪 Testing

### Running Tests

```bash  
# Unit tests  
npm run test

# Integration tests  
npm run test:integration

# E2E tests  
npm run test:e2e

# Test coverage  
npm run test:coverage  
```

### Test Coverage

```  
Statements   : XX%  
Branches     : XX%  
Functions    : XX%  
Lines        : XX%  
```

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE) - lihat file LICENSE untuk detail lebih lanjut.

---

<div align="center">

  **Made with ❤️ by [Nama Tim] for ITECHNO CUP 2026**

    
</div>  
