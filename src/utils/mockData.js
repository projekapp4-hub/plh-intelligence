/**
 * ============================================================================
 * PLH-INTELLIGENCE - Mock Data Utility Module
 * ============================================================================
 * Berkas    : src/utils/mockData.js
 * Deskripsi : Penyedia data dummy terstruktur (45 laporan) untuk pengujian
 *             analisis statistik, visualisasi Chart.js, Decision Support System
 *             (dssView.js), dan laporan ringkasan berkala (periodic.js).
 * ============================================================================
 */

/**
 * Daftar 45 Rekod Laporan Kebersihan dan Lingkungan Hidup PLH-INTELLIGENCE
 * @type {Array<Object>}
 */
export const mockReports = [
  // --------------------------------------------------------------------------
  // KATEGORI 1: SANGAT BAIK (20 Data: Skor 92% - 100%)
  // --------------------------------------------------------------------------
  {
    id: "REP-20260808-001",
    guruPiket: "Ust. Ahmad Fauzi, S.Pd.",
    tanggal: "2026-08-08",
    petugas: ["Ahmad", "Budi", "Candra"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 100,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Seluruh area sanitasi dan pemilahan sampah berada dalam kondisi sangat bersih. Tidak ditemukan genangan air.",
    photos: ["src/assets/1.jpg", "src/assets/2.jpg"],
    createdAt: "2026-08-08T08:30:00.000Z"
  },
  {
    id: "REP-20260807-002",
    guruPiket: "Ust. Hendra Wijaya, M.Pd.",
    tanggal: "2026-08-07",
    petugas: ["Dafa", "Eko", "Fahri"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 100,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Piket berjalan sangat efektif. Pemilahan organik dan anorganik terlaksana sempurna di bank sampah.",
    photos: ["src/assets/3.jpg", "src/assets/4.jpg", "src/assets/5.jpg"],
    createdAt: "2026-08-07T08:15:00.000Z"
  },
  {
    id: "REP-20260806-003",
    guruPiket: "Ustdh. Siti Rahmawati, S.Si.",
    tanggal: "2026-08-06",
    petugas: ["Gilang", "Hafiz", "Irfan"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "FALSE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 92,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Pengosongan tong komposter terhambat karena volume sampah daun basah menumpuk pasca hujan deras.",
    photos: ["src/assets/6.jpg"],
    createdAt: "2026-08-06T09:00:00.000Z"
  },
  {
    id: "REP-20260805-004",
    guruPiket: "Ust. Bambang Suryono, S.T.",
    tanggal: "2026-08-05",
    petugas: ["Jamal", "Kurnia", "Luqman"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 100,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Kondisi kebersihan kelas dan koridor terjaga rapi. Penyiraman tanaman greenhouse selesai tepat waktu.",
    photos: ["src/assets/7.jpg", "src/assets/8.jpg"],
    createdAt: "2026-08-05T08:20:00.000Z"
  },
  {
    id: "REP-20260804-005",
    guruPiket: "Ust. Muhammad Rizky, M.Env.",
    tanggal: "2026-08-04",
    petugas: ["Maulana", "Naufal", "Okta"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "FALSE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 92,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Pembersihan gulma di taman toga sedikit terlambat karena keterbatasan persediaan alat cangkul kecil.",
    photos: ["src/assets/9.jpg", "src/assets/10.jpg", "src/assets/11.jpg"],
    createdAt: "2026-08-04T08:45:00.000Z"
  },
  {
    id: "REP-20260803-006",
    guruPiket: "Ustdh. Nurul Hidayah, S.Pd.",
    tanggal: "2026-08-03",
    petugas: ["Putra", "Qori", "Rian"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 100,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Fasilitas sanitasi bersih mengkilap. Seluruh lampu ruang kelas telah dimatikan tepat pukul 07:00.",
    photos: ["src/assets/12.jpg", "src/assets/13.jpg"],
    createdAt: "2026-08-03T07:45:00.000Z"
  },
  {
    id: "REP-20260802-007",
    guruPiket: "Ust. Dedi Kurniawan, S.Si.",
    tanggal: "2026-08-02",
    petugas: ["Sandi", "Taufik", "Umar"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 100,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Monitoring energi dan sistem drainase sempurna. Pasokan air resapan mengalir lancar.",
    photos: ["src/assets/14.jpg", "src/assets/15.jpg", "src/assets/16.jpg", "src/assets/17.jpg"],
    createdAt: "2026-08-02T08:10:00.000Z"
  },
  {
    id: "REP-20260801-008",
    guruPiket: "Ust. Ahmad Fauzi, S.Pd.",
    tanggal: "2026-08-01",
    petugas: ["Vino", "Wahyu", "Xavier"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "FALSE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 92,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Pencatatan timbangan sampah kering ditunda ke sore hari karena petugas lapangan sedang rapat dinas.",
    photos: ["src/assets/18.jpg"],
    createdAt: "2026-08-01T08:50:00.000Z"
  },
  {
    id: "REP-20260731-009",
    guruPiket: "Ust. Hendra Wijaya, M.Pd.",
    tanggal: "2026-07-31",
    petugas: ["Yusuf", "Zainal", "Ahmad"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 100,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Sistem konservasi air bekerja sangat presisi. Seluruh toilet dalam kondisi higienis.",
    photos: ["src/assets/19.jpg", "src/assets/20.jpg"],
    createdAt: "2026-07-31T08:00:00.000Z"
  },
  {
    id: "REP-20260730-010",
    guruPiket: "Ustdh. Siti Rahmawati, S.Si.",
    tanggal: "2026-07-30",
    petugas: ["Budi", "Candra", "Dafa"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 100,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Penyiraman otomatis vegetasi sekolah berjalan lancar. Tidak ada temuan kendala teknis.",
    photos: ["src/assets/21.jpg", "src/assets/22.jpg", "src/assets/23.jpg"],
    createdAt: "2026-07-30T08:15:00.000Z"
  },
  {
    id: "REP-20260729-011",
    guruPiket: "Ust. Bambang Suryono, S.T.",
    tanggal: "2026-07-29",
    petugas: ["Eko", "Fahri", "Gilang"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "FALSE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 92,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Wastafel blok C habis sabun cuci tangan cair, namun langsung diisi ulang oleh petugas operasional.",
    photos: ["src/assets/24.jpg"],
    createdAt: "2026-07-29T09:10:00.000Z"
  },
  {
    id: "REP-20260728-012",
    guruPiket: "Ust. Muhammad Rizky, M.Env.",
    tanggal: "2026-07-28",
    petugas: ["Hafiz", "Irfan", "Jamal"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 100,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Kebersihan lingkungan luar biasa, integrasi bank sampah dan pemanfaatan pupuk kompos maksimal.",
    photos: ["src/assets/25.jpg", "src/assets/26.jpg"],
    createdAt: "2026-07-28T08:05:00.000Z"
  },
  {
    id: "REP-20260727-013",
    guruPiket: "Ustdh. Nurul Hidayah, S.Pd.",
    tanggal: "2026-07-27",
    petugas: ["Kurnia", "Luqman", "Maulana"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 100,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Program hemat energi berjalan baik. Seluruh perangkat elektronik dalam posisi mati setelah KBM.",
    photos: ["src/assets/27.jpg", "src/assets/28.jpg", "src/assets/29.jpg"],
    createdAt: "2026-07-27T08:30:00.000Z"
  },
  {
    id: "REP-20260726-014",
    guruPiket: "Ust. Dedi Kurniawan, S.Si.",
    tanggal: "2026-07-26",
    petugas: ["Naufal", "Okta", "Putra"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 100,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Pikett harian sangat rapi. Area pembibitan pohon buah terlaksana dengan perawatan menyeluruh.",
    photos: ["src/assets/30.jpg"],
    createdAt: "2026-07-26T08:40:00.000Z"
  },
  {
    id: "REP-20260725-015",
    guruPiket: "Ust. Ahmad Fauzi, S.Pd.",
    tanggal: "2026-07-25",
    petugas: ["Qori", "Rian", "Sandi"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "FALSE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 92,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Lampu penerangan lapangan belum sempat dimatikan pada pagi hari karena penyesuaian sakelar otomatis.",
    photos: ["src/assets/31.jpg", "src/assets/32.jpg"],
    createdAt: "2026-07-25T07:50:00.000Z"
  },
  {
    id: "REP-20260724-016",
    guruPiket: "Ust. Hendra Wijaya, M.Pd.",
    tanggal: "2026-07-24",
    petugas: ["Taufik", "Umar", "Vino"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 100,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Piket kebersihan lingkungan mencapai efisiensi maksimal. Semua instrumen diperiksa dengan teliti.",
    photos: ["src/assets/33.jpg", "src/assets/34.jpg", "src/assets/35.jpg"],
    createdAt: "2026-07-24T08:25:00.000Z"
  },
  {
    id: "REP-20260723-017",
    guruPiket: "Ustdh. Siti Rahmawati, S.Si.",
    tanggal: "2026-07-23",
    petugas: ["Wahyu", "Xavier", "Yusuf"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 100,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Tanaman obat keluarga (TOGA) bertumbuh subur. Drainase area dapur utama mengalir tanpa celah.",
    photos: ["src/assets/36.jpg"],
    createdAt: "2026-07-23T08:15:00.000Z"
  },
  {
    id: "REP-20260722-018",
    guruPiket: "Ust. Bambang Suryono, S.T.",
    tanggal: "2026-07-22",
    petugas: ["Zainal", "Ahmad", "Budi"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "FALSE", task_5_2: "TRUE"
    },
    scorePercent: 92,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Pemeriksaan filter sumur resapan memerlukan pembersihan ekstra dari endapan lumpur halus.",
    photos: ["src/assets/37.jpg", "src/assets/38.jpg"],
    createdAt: "2026-07-22T09:00:00.000Z"
  },
  {
    id: "REP-20260721-019",
    guruPiket: "Ust. Muhammad Rizky, M.Env.",
    tanggal: "2026-07-21",
    petugas: ["Candra", "Dafa", "Eko"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 100,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Dokumentasi kebersihan dan pemilahan sampah sangat lengkap. Seluruh santri piket disiplin.",
    photos: ["src/assets/39.jpg", "src/assets/40.jpg", "src/assets/41.jpg"],
    createdAt: "2026-07-21T08:10:00.000Z"
  },
  {
    id: "REP-20260720-020",
    guruPiket: "Ustdh. Nurul Hidayah, S.Pd.",
    tanggal: "2026-07-20",
    petugas: ["Fahri", "Gilang", "Hafiz"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 100,
    statusBadge: "Sangat Baik",
    catatanEvaluasi: "Kondisi fisik sanitasi lingkungan sempurna, seluruh indikator tugas tercapai 100%.",
    photos: ["src/assets/42.jpg", "src/assets/43.jpg"],
    createdAt: "2026-07-20T08:20:00.000Z"
  },

  // --------------------------------------------------------------------------
  // KATEGORI 2: BAIK (18 Data: Skor 77% - 85%)
  // --------------------------------------------------------------------------
  {
    id: "REP-20260719-021",
    guruPiket: "Ust. Dedi Kurniawan, S.Si.",
    tanggal: "2026-07-19",
    petugas: ["Irfan", "Jamal", "Kurnia"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "FALSE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "FALSE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 85,
    statusBadge: "Baik",
    catatanEvaluasi: "Pembersihan komposter tertunda dan stok sabun di toilet selatan habis belum sempat diganti.",
    photos: ["src/assets/44.jpg", "src/assets/45.jpg"],
    createdAt: "2026-07-19T08:30:00.000Z"
  },
  {
    id: "REP-20260718-022",
    guruPiket: "Ust. Ahmad Fauzi, S.Pd.",
    tanggal: "2026-07-18",
    petugas: ["Luqman", "Maulana", "Naufal"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "FALSE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "FALSE",
      task_3_1: "TRUE", task_3_2: "FALSE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 77,
    statusBadge: "Baik",
    catatanEvaluasi: "Lantai toilet asrama agak licin. Data penimbangan bank sampah belum lengkap karena kendala timbangan.",
    photos: ["src/assets/46.jpg"],
    createdAt: "2026-07-18T08:50:00.000Z"
  },
  {
    id: "REP-20260717-023",
    guruPiket: "Ust. Hendra Wijaya, M.Pd.",
    tanggal: "2026-07-17",
    petugas: ["Okta", "Putra", "Qori"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "FALSE", task_2_3: "FALSE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 85,
    statusBadge: "Baik",
    catatanEvaluasi: "Pengangkutan sampah plastik terkendala jadwal kendaraan umum. Komposter perlu tambahan starter mikroba.",
    photos: ["src/assets/47.jpg", "src/assets/48.jpg"],
    createdAt: "2026-07-17T08:15:00.000Z"
  },
  {
    id: "REP-20260716-024",
    guruPiket: "Ustdh. Siti Rahmawati, S.Si.",
    tanggal: "2026-07-16",
    petugas: ["Rian", "Sandi", "Taufik"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "FALSE", task_3_2: "FALSE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 85,
    statusBadge: "Baik",
    catatanEvaluasi: "Tanaman di pot depan lab IPA layu karena penyiraman pagi terlewat akibat bentrok acara sosialisasi.",
    photos: ["src/assets/49.jpg", "src/assets/50.jpg", "src/assets/1.jpg"],
    createdAt: "2026-07-16T09:00:00.000Z"
  },
  {
    id: "REP-20260715-025",
    guruPiket: "Ust. Bambang Suryono, S.T.",
    tanggal: "2026-07-15",
    petugas: ["Umar", "Vino", "Wahyu"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "FALSE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "FALSE",
      task_4_1: "FALSE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 77,
    statusBadge: "Baik",
    catatanEvaluasi: "Beberapa kipas angin di aula lupa dimatikan seusai kegiatan ekstrakurikuler siang.",
    photos: ["src/assets/2.jpg"],
    createdAt: "2026-07-15T08:40:00.000Z"
  },
  {
    id: "REP-20260714-026",
    guruPiket: "Ust. Muhammad Rizky, M.Env.",
    tanggal: "2026-07-14",
    petugas: ["Xavier", "Yusuf", "Zainal"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "FALSE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "FALSE", task_5_2: "TRUE"
    },
    scorePercent: 85,
    statusBadge: "Baik",
    catatanEvaluasi: "Debit air wudhu masjid agak kecil karena penyumbatan kotoran di pipa filter utama.",
    photos: ["src/assets/3.jpg", "src/assets/4.jpg"],
    createdAt: "2026-07-14T08:05:00.000Z"
  },
  {
    id: "REP-20260713-027",
    guruPiket: "Ustdh. Nurul Hidayah, S.Pd.",
    tanggal: "2026-07-13",
    petugas: ["Ahmad", "Budi", "Candra"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "FALSE", task_2_2: "TRUE", task_2_3: "FALSE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "FALSE"
    },
    scorePercent: 77,
    statusBadge: "Baik",
    catatanEvaluasi: "Pemilahan sampah di kantin kurang ketat. Bak penampungan air hujan meluap sedikit akibat tersumbat daun.",
    photos: ["src/assets/5.jpg", "src/assets/6.jpg", "src/assets/7.jpg"],
    createdAt: "2026-07-13T08:25:00.000Z"
  },
  {
    id: "REP-20260712-028",
    guruPiket: "Ust. Dedi Kurniawan, S.Si.",
    tanggal: "2026-07-12",
    petugas: ["Dafa", "Eko", "Fahri"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "FALSE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "FALSE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 85,
    statusBadge: "Baik",
    catatanEvaluasi: "Penataan pot bibit di nursery kurang rapi. Kantong sampah Anorganik belum dipindahkan ke TPS pusat.",
    photos: ["src/assets/8.jpg"],
    createdAt: "2026-07-12T08:45:00.000Z"
  },
  {
    id: "REP-20260711-029",
    guruPiket: "Ust. Ahmad Fauzi, S.Pd.",
    tanggal: "2026-07-11",
    petugas: ["Gilang", "Hafiz", "Irfan"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "FALSE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "FALSE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "FALSE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 77,
    statusBadge: "Baik",
    catatanEvaluasi: "Pembersihan sarang laba-laba di langit-langit toilet terlewat. Pencatatan rekap bank sampah belum final.",
    photos: ["src/assets/9.jpg", "src/assets/10.jpg"],
    createdAt: "2026-07-11T09:15:00.000Z"
  },
  {
    id: "REP-20260710-030",
    guruPiket: "Ust. Hendra Wijaya, M.Pd.",
    tanggal: "2026-07-10",
    petugas: ["Jamal", "Kurnia", "Luqman"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "FALSE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "FALSE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 85,
    statusBadge: "Baik",
    catatanEvaluasi: "Komposter bau asam karena kelembaban tinggi. Pemangkasan ranting pohon kering di halaman ditunda.",
    photos: ["src/assets/11.jpg", "src/assets/12.jpg", "src/assets/13.jpg"],
    createdAt: "2026-07-10T08:10:00.000Z"
  },
  {
    id: "REP-20260709-031",
    guruPiket: "Ustdh. Siti Rahmawati, S.Si.",
    tanggal: "2026-07-09",
    petugas: ["Maulana", "Naufal", "Okta"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "FALSE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "FALSE",
      task_5_1: "TRUE", task_5_2: "FALSE"
    },
    scorePercent: 77,
    statusBadge: "Baik",
    catatanEvaluasi: "Keran air wudhu bagian luar sedikit menetes. Lampu teras belakang lupa dimatikan sampai jam 9 pagi.",
    photos: ["src/assets/14.jpg"],
    createdAt: "2026-07-09T08:35:00.000Z"
  },
  {
    id: "REP-20260708-032",
    guruPiket: "Ust. Bambang Suryono, S.T.",
    tanggal: "2026-07-08",
    petugas: ["Putra", "Qori", "Rian"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "FALSE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "FALSE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 85,
    statusBadge: "Baik",
    catatanEvaluasi: "Penyiraman rumput taman belum merata. Pengangkutan daur ulang sampah kertas menunggu penimbangan.",
    photos: ["src/assets/15.jpg", "src/assets/16.jpg"],
    createdAt: "2026-07-08T08:00:00.000Z"
  },
  {
    id: "REP-20260707-033",
    guruPiket: "Ust. Muhammad Rizky, M.Env.",
    tanggal: "2026-07-07",
    petugas: ["Sandi", "Taufik", "Umar"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "FALSE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "FALSE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "FALSE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 77,
    statusBadge: "Baik",
    catatanEvaluasi: "Terdapat sisa dedaunan kering belum tersapu di sudut gazebo. Pengisian logbook piket belum ditandatangani.",
    photos: ["src/assets/17.jpg", "src/assets/18.jpg", "src/assets/19.jpg"],
    createdAt: "2026-07-07T08:50:00.000Z"
  },
  {
    id: "REP-20260706-034",
    guruPiket: "Ustdh. Nurul Hidayah, S.Pd.",
    tanggal: "2026-07-06",
    petugas: ["Vino", "Wahyu", "Xavier"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "FALSE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "FALSE", task_5_2: "TRUE"
    },
    scorePercent: 85,
    statusBadge: "Baik",
    catatanEvaluasi: "Proses pembalikan tumpukan pupuk organik belum dikerjakan. Saluran biopori perlu dibersihkan dari kerikil.",
    photos: ["src/assets/20.jpg"],
    createdAt: "2026-07-06T08:15:00.000Z"
  },
  {
    id: "REP-20260705-035",
    guruPiket: "Ust. Dedi Kurniawan, S.Si.",
    tanggal: "2026-07-05",
    petugas: ["Yusuf", "Zainal", "Ahmad"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "FALSE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "FALSE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "FALSE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 77,
    statusBadge: "Baik",
    catatanEvaluasi: "Tong sampah anorganik di koridor B penuh. Sakelar pendingin ruangan di lab komputer lupa dimatikan.",
    photos: ["src/assets/21.jpg", "src/assets/22.jpg"],
    createdAt: "2026-07-05T09:05:00.000Z"
  },
  {
    id: "REP-20260704-036",
    guruPiket: "Ust. Ahmad Fauzi, S.Pd.",
    tanggal: "2026-07-04",
    petugas: ["Budi", "Candra", "Dafa"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "FALSE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "FALSE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 85,
    statusBadge: "Baik",
    catatanEvaluasi: "Tempat sabun di toilet guru patah. Pemangkasan tanaman rambat di pagar depan belum sempat dirapikan.",
    photos: ["src/assets/23.jpg", "src/assets/24.jpg", "src/assets/25.jpg"],
    createdAt: "2026-07-04T08:20:00.000Z"
  },
  {
    id: "REP-20260703-037",
    guruPiket: "Ust. Hendra Wijaya, M.Pd.",
    tanggal: "2026-07-03",
    petugas: ["Eko", "Fahri", "Gilang"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "FALSE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "TRUE", task_2_3: "FALSE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "FALSE", task_5_2: "TRUE"
    },
    scorePercent: 77,
    statusBadge: "Baik",
    catatanEvaluasi: "Keran air di tempat wudhu santri longgar. Pengolahan komposter terhambat karena kekurangan larutan serabut.",
    photos: ["src/assets/26.jpg"],
    createdAt: "2026-07-03T08:40:00.000Z"
  },
  {
    id: "REP-20260702-038",
    guruPiket: "Ustdh. Siti Rahmawati, S.Si.",
    tanggal: "2026-07-02",
    petugas: ["Hafiz", "Irfan", "Jamal"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "FALSE", task_2_3: "TRUE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "FALSE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 85,
    statusBadge: "Baik",
    catatanEvaluasi: "Pembersihan kolam ikan hidroponik kurang maksimal karena pompa air sempat mati kendala arus listrik.",
    photos: ["src/assets/27.jpg", "src/assets/28.jpg"],
    createdAt: "2026-07-02T08:10:00.000Z"
  },

  // --------------------------------------------------------------------------
  // KATEGORI 3: PERLU EVALUASI (7 Data: Skor < 75%)
  // --------------------------------------------------------------------------
  {
    id: "REP-20260701-039",
    guruPiket: "Ust. Bambang Suryono, S.T.",
    tanggal: "2026-07-01",
    petugas: ["Kurnia", "Luqman", "Maulana"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "FALSE", task_1_3: "FALSE",
      task_2_1: "FALSE", task_2_2: "TRUE", task_2_3: "FALSE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "FALSE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "FALSE"
    },
    scorePercent: 54,
    statusBadge: "Perlu Evaluasi",
    catatanEvaluasi: "Banyak catatan teknis: Kunci pintu toilet rusak, sampah tercampur di 3 titik, keran air bocor deras, dan bibit tanaman mengering.",
    photos: ["src/assets/29.jpg", "src/assets/30.jpg", "src/assets/31.jpg"],
    createdAt: "2026-07-01T09:20:00.000Z"
  },
  {
    id: "REP-20260630-040",
    guruPiket: "Ust. Muhammad Rizky, M.Env.",
    tanggal: "2026-06-30",
    petugas: ["Naufal", "Okta", "Putra"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "FALSE",
      task_2_1: "FALSE", task_2_2: "FALSE", task_2_3: "FALSE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "FALSE", task_3_3: "TRUE",
      task_4_1: "FALSE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 54,
    statusBadge: "Perlu Evaluasi",
    catatanEvaluasi: "Pemilahan sampah tidak berjalan sama sekali. AC dan lampu di 2 ruang kelas menyala tanpa penghuni pasca KBM.",
    photos: ["src/assets/32.jpg", "src/assets/33.jpg"],
    createdAt: "2026-06-30T08:30:00.000Z"
  },
  {
    id: "REP-20260629-041",
    guruPiket: "Ustdh. Nurul Hidayah, S.Pd.",
    tanggal: "2026-06-29",
    petugas: ["Qori", "Rian", "Sandi"],
    checklist: {
      task_1_1: "FALSE", task_1_2: "FALSE", task_1_3: "TRUE",
      task_2_1: "TRUE", task_2_2: "FALSE", task_2_3: "FALSE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "TRUE", task_3_3: "FALSE",
      task_4_1: "TRUE",
      task_5_1: "FALSE", task_5_2: "TRUE"
    },
    scorePercent: 54,
    statusBadge: "Perlu Evaluasi",
    catatanEvaluasi: "Kebersihan lantai toilet buruk, bak sampah meluap hingga berceceran di koridor utama. Pipa air resapan tersumbat total.",
    photos: ["src/assets/34.jpg"],
    createdAt: "2026-06-29T08:45:00.000Z"
  },
  {
    id: "REP-20260628-042",
    guruPiket: "Ust. Dedi Kurniawan, S.Si.",
    tanggal: "2026-06-28",
    petugas: ["Taufik", "Umar", "Vino"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "FALSE",
      task_2_1: "FALSE", task_2_2: "TRUE", task_2_3: "FALSE", task_2_4: "FALSE",
      task_3_1: "FALSE", task_3_2: "TRUE", task_3_3: "TRUE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "FALSE"
    },
    scorePercent: 54,
    statusBadge: "Perlu Evaluasi",
    catatanEvaluasi: "Petugas piket terlambat bertugas. Bank sampah tutup karena kunci hilang. Hujan deras menyebabkan banjir genangan lokal.",
    photos: ["src/assets/35.jpg", "src/assets/36.jpg", "src/assets/37.jpg"],
    createdAt: "2026-06-28T09:30:00.000Z"
  },
  {
    id: "REP-20260627-043",
    guruPiket: "Ust. Ahmad Fauzi, S.Pd.",
    tanggal: "2026-06-27",
    petugas: ["Wahyu", "Xavier", "Yusuf"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "FALSE", task_1_3: "FALSE",
      task_2_1: "TRUE", task_2_2: "FALSE", task_2_3: "FALSE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "FALSE", task_3_3: "TRUE",
      task_4_1: "FALSE",
      task_5_1: "TRUE", task_5_2: "FALSE"
    },
    scorePercent: 46,
    statusBadge: "Perlu Evaluasi",
    catatanEvaluasi: "Pelanggaran piket meluas: Sanitasi kotor, sampah tidak dipilah, komposter berbau menyengat, dan air kran terus mengalir.",
    photos: ["src/assets/38.jpg", "src/assets/39.jpg"],
    createdAt: "2026-06-27T08:50:00.000Z"
  },
  {
    id: "REP-20260626-044",
    guruPiket: "Ust. Hendra Wijaya, M.Pd.",
    tanggal: "2026-06-26",
    petugas: ["Zainal", "Ahmad", "Budi"],
    checklist: {
      task_1_1: "TRUE", task_1_2: "TRUE", task_1_3: "FALSE",
      task_2_1: "FALSE", task_2_2: "TRUE", task_2_3: "FALSE", task_2_4: "FALSE",
      task_3_1: "FALSE", task_3_2: "TRUE", task_3_3: "FALSE",
      task_4_1: "TRUE",
      task_5_1: "TRUE", task_5_2: "TRUE"
    },
    scorePercent: 54,
    statusBadge: "Perlu Evaluasi",
    catatanEvaluasi: "Tanaman obat banyak yang mati kekeringan. Bak sampah organik pecah dan belum diganti dengan wadah baru.",
    photos: ["src/assets/40.jpg", "src/assets/41.jpg", "src/assets/42.jpg", "src/assets/43.jpg"],
    createdAt: "2026-06-26T08:15:00.000Z"
  },
  {
    id: "REP-20260625-045",
    guruPiket: "Ustdh. Siti Rahmawati, S.Si.",
    tanggal: "2026-06-25",
    petugas: ["Candra", "Dafa", "Eko"],
    checklist: {
      task_1_1: "FALSE", task_1_2: "TRUE", task_1_3: "FALSE",
      task_2_1: "TRUE", task_2_2: "FALSE", task_2_3: "FALSE", task_2_4: "TRUE",
      task_3_1: "TRUE", task_3_2: "FALSE", task_3_3: "TRUE",
      task_4_1: "FALSE",
      task_5_1: "FALSE", task_5_2: "TRUE"
    },
    scorePercent: 46,
    statusBadge: "Perlu Evaluasi",
    catatanEvaluasi: "Kinerja piket perlu pembinaan khusus. Keran utama bocor, sampah menumpuk di zona kantin, dan daya listrik terbuang.",
    photos: ["src/assets/44.jpg", "src/assets/45.jpg"],
    createdAt: "2026-06-25T08:40:00.000Z"
  }
];

// ============================================================================
// HELPER FUNCTIONS (EXPORTED UTILITIES)
// ============================================================================

/**
 * Mengembalikan seluruh koleksi data laporan mock.
 * 
 * @function getMockReports
 * @returns {Array<Object>} Array dari 45 objek laporan lengkap.
 * 
 * @example
 * import { getMockReports } from './utils/mockData.js';
 * const reports = getMockReports();
 * console.log('Total laporan:', reports.length); // 45
 */
export function getMockReports() {
  return mockReports;
}

/**
 * Mengambil satu objek laporan berdasarkan atribut ID unik.
 * 
 * @function getReportById
 * @param {string} id - ID laporan yang dicari (contoh: "REP-20260808-001").
 * @returns {Object|null} Objek laporan jika ditemukan, atau null jika tidak ada.
 * 
 * @example
 * import { getReportById } from './utils/mockData.js';
 * const report = getReportById('REP-20260808-001');
 * console.log(report?.guruPiket);
 */
export function getReportById(id) {
  if (!id || typeof id !== 'string') return null;
  return mockReports.find((report) => report.id === id) || null;
}

/**
 * Menyaring daftar laporan berdasarkan rentang tanggal tertentu (inklusif).
 * 
 * @function getReportsByDateRange
 * @param {string} startDate - Tanggal awal rentang dalam format ISO "YYYY-MM-DD".
 * @param {string} endDate - Tanggal akhir rentang dalam format ISO "YYYY-MM-DD".
 * @returns {Array<Object>} Array laporan yang berada di dalam rentang tanggal tersebut.
 * 
 * @example
 * import { getReportsByDateRange } from './utils/mockData.js';
 * const julyReports = getReportsByDateRange('2026-07-01', '2026-07-31');
 * console.log('Laporan bulan Juli:', julyReports.length);
 */
export function getReportsByDateRange(startDate, endDate) {
  if (!startDate || !endDate) return [];

  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  if (isNaN(start) || isNaN(end)) {
    console.error('[mockData.js] Format tanggal tidak valid pada getReportsByDateRange.');
    return [];
  }

  return mockReports.filter((report) => {
    const reportTime = new Date(report.tanggal).getTime();
    return reportTime >= start && reportTime <= end;
  });
}