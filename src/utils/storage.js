/**
 * ============================================================================
 * PLH-INTELLIGENCE - IndexedDB Native Storage Utility Module (Enhanced)
 * ============================================================================
 * Berkas: src/utils/storage.js
 * Deskripsi: Abstraksi penyimpanan data lokal asynchronous berbasis IndexedDB Native.
 * Menyediakan antarmuka CRUD lengkap, penyuntikan mockData otomatis, dan
 * dukungan penyimpanan biner/Base64 untuk foto dokumentasi dari formView.js.
 * ============================================================================
 */

/** Nama Database Utama PLH-Intelligence */
const DB_NAME = 'PLH_Intelligence_DB';

/** Versi Skema Database */
const DB_VERSION = 1;

/** Singleton instance untuk menyimpan koneksi database yang sedang aktif */
let dbInstance = null;

/**
 * Konfigurasi Skema Object Store (Tabel) beserta aturan Primary Key.
 * @type {Object.<string, IDBObjectStoreParameters>}
 */
const STORE_SCHEMAS = {
  gemini_cache: { keyPath: 'id', autoIncrement: true },
  dss_records: { keyPath: 'id' }, // Menggunakan String ID kustom (REP-YYYYMMDD-XXX) atau auto-generated ID
  datasets: { keyPath: 'key' },
  app_settings: { keyPath: 'key' }
};

/**
 * Menginisialisasi dan membuka koneksi ke IndexedDB `PLH_Intelligence_DB`.
 *
 * @async
 * @function initDB
 * @returns {Promise<IDBDatabase>} Promise yang menghasilkan instance koneksi `IDBDatabase`.
 */
export async function initDB() {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      return reject(new Error('Peramban ini tidak mendukung API Native IndexedDB.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      Object.entries(STORE_SCHEMAS).forEach(([storeName, config]) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, config);

          if (config.keyPath === 'id') {
            store.createIndex('createdAt', 'createdAt', { unique: false });
            store.createIndex('tanggal', 'tanggal', { unique: false });
            store.createIndex('scorePercent', 'scorePercent', { unique: false });
          }
        }
      });
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;

      dbInstance.onversionchange = () => {
        dbInstance.close();
        dbInstance = null;
        console.warn('[storage.js] Koneksi IndexedDB ditutup karena ada perubahan versi.');
      };

      dbInstance.onerror = (evt) => {
        console.error('[storage.js] Kesalahan global pada IndexedDB:', evt.target.error);
      };

      resolve(dbInstance);
    };

    request.onerror = (event) => {
      const errorMsg = event.target.error?.message || 'Gagal membuka IndexedDB.';
      console.error('[storage.js] Error Inisialisasi:', errorMsg);
      reject(new Error(`[PLH-Storage] Inisialisasi DB Gagal: ${errorMsg}`));
    };

    request.onblocked = () => {
      console.warn('[storage.js] Inisialisasi IndexedDB terblokir oleh koneksi lain yang masih aktif.');
    };
  });
}

/**
 * Membuka transaksi dan mengembalikan instance Object Store.
 *
 * @private
 * @async
 * @function getStore
 * @param {string} storeName - Nama Object Store.
 * @param {IDBTransactionMode} [mode='readonly'] - Mode transaksi.
 * @returns {Promise<IDBObjectStore>}
 */
async function getStore(storeName, mode = 'readonly') {
  const db = await initDB();

  if (!db.objectStoreNames.contains(storeName)) {
    throw new Error(`[PLH-Storage] Object Store "${storeName}" tidak ditemukan dalam database ${DB_NAME}.`);
  }

  const transaction = db.transaction(storeName, mode);
  return transaction.objectStore(storeName);
}

/**
 * Menyimpan atau memperbarui data entri (`put`) ke dalam Object Store.
 * Mampu menerima objek laporan berisi array foto (baik URL path maupun Base64 Data URL).
 *
 * @async
 * @function saveItem
 * @param {string} storeName - Nama Object Store tujuan.
 * @param {*} value - Objek data yang akan disimpan.
 * @param {IDBValidKey|null} [key=null] - Kunci utama eksplisit.
 * @returns {Promise<IDBValidKey>}
 */
export async function saveItem(storeName, value, key = null) {
  try {
    const store = await getStore(storeName, 'readwrite');

    return new Promise((resolve, reject) => {
      let request;

      if (key !== null && key !== undefined && !store.keyPath) {
        request = store.put(value, key);
      } else {
        request = store.put(value);
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => {
        const err = e.target.error?.message || 'Gagal eksekusi put().';
        reject(new Error(`[PLH-Storage] Gagal menyimpan item ke "${storeName}": ${err}`));
      };
    });
  } catch (error) {
    console.error(`[storage.js] Exception pada saveItem(${storeName}):`, error);
    throw error;
  }
}

/**
 * Mengambil entri data tunggal dari Object Store berdasarkan Primary Key / ID.
 *
 * @async
 * @function getItem
 * @param {string} storeName - Nama Object Store.
 * @param {IDBValidKey} key - Primary Key.
 * @returns {Promise<*|null>}
 */
export async function getItem(storeName, key) {
  try {
    const store = await getStore(storeName, 'readonly');

    return new Promise((resolve, reject) => {
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result !== undefined ? request.result : null);
      };
      request.onerror = (e) => {
        const err = e.target.error?.message || 'Gagal eksekusi get().';
        reject(new Error(`[PLH-Storage] Gagal mengambil item dengan key "${key}" dari "${storeName}": ${err}`));
      };
    });
  } catch (error) {
    console.error(`[storage.js] Exception pada getItem(${storeName}, ${key}):`, error);
    throw error;
  }
}

/**
 * Mengambil seluruh daftar entri data dari sebuah Object Store.
 *
 * @async
 * @function getAllItems
 * @param {string} storeName - Nama Object Store.
 * @returns {Promise<Array<*>>}
 */
export async function getAllItems(storeName) {
  try {
    const store = await getStore(storeName, 'readonly');

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = (e) => {
        const err = e.target.error?.message || 'Gagal eksekusi getAll().';
        reject(new Error(`[PLH-Storage] Gagal mengambil seluruh data dari "${storeName}": ${err}`));
      };
    });
  } catch (error) {
    console.error(`[storage.js] Exception pada getAllItems(${storeName}):`, error);
    throw error;
  }
}

/**
 * Menghapus entri data tunggal dari Object Store.
 *
 * @async
 * @function deleteItem
 * @param {string} storeName - Nama Object Store.
 * @param {IDBValidKey} key - Primary Key.
 * @returns {Promise<boolean>}
 */
export async function deleteItem(storeName, key) {
  try {
    const store = await getStore(storeName, 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => {
        const err = e.target.error?.message || 'Gagal eksekusi delete().';
        reject(new Error(`[PLH-Storage] Gagal menghapus item dengan key "${key}" dari "${storeName}": ${err}`));
      };
    });
  } catch (error) {
    console.error(`[storage.js] Exception pada deleteItem(${storeName}, ${key}):`, error);
    throw error;
  }
}

/**
 * Menghapus seluruh entri data dari sebuah Object Store.
 *
 * @async
 * @function clearStore
 * @param {string} storeName - Nama Object Store.
 * @returns {Promise<boolean>}
 */
export async function clearStore(storeName) {
  try {
    const store = await getStore(storeName, 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.clear();

      request.onsuccess = () => resolve(true);
      request.onerror = (e) => {
        const err = e.target.error?.message || 'Gagal eksekusi clear().';
        reject(new Error(`[PLH-Storage] Gagal mengosongkan store "${storeName}": ${err}`));
      };
    });
  } catch (error) {
    console.error(`[storage.js] Exception pada clearStore(${storeName}):`, error);
    throw error;
  }
}

/**
 * FUNGSI TAMBAHAN 1:
 * Menyuntikkan data dummy dari `mockData.js` ke dalam IndexedDB jika store `dss_records` masih kosong.
 * Digunakan saat inisialisasi aplikasi agar grafik dan tabel langsung memiliki data awal.
 *
 * @async
 * @function seedMockData
 * @param {Array<Object>} mockDataArray - Array berisi 45 objek data dummy dari mockData.js.
 * @param {boolean} [forceReset=false] - Jika true, akan menghapus data lama dan mengisi ulang.
 * @returns {Promise<boolean>} Mengembalikan true jika proses seeding berhasil dijalankan.
 */
export async function seedMockData(mockDataArray, forceReset = false) {
  try {
    const existingItems = await getAllItems('dss_records');

    if (existingItems.length > 0 && !forceReset) {
      console.log(`[storage.js] Seeding dilewati. ${existingItems.length} data sudah ada di dss_records.`);
      return false;
    }

    if (forceReset) {
      await clearStore('dss_records');
    }

    const db = await initDB();
    const transaction = db.transaction('dss_records', 'readwrite');
    const store = transaction.objectStore('dss_records');

    mockDataArray.forEach((report) => {
      store.put(report);
    });

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        console.log(`[storage.js] Berhasil menyuntikkan ${mockDataArray.length} data mock ke dss_records.`);
        resolve(true);
      };
      transaction.onerror = (e) => {
        console.error('[storage.js] Gagal melakukan seeding mock data:', e.target.error);
        reject(e.target.error);
      };
    });
  } catch (error) {
    console.error('[storage.js] Exception pada seedMockData:', error);
    throw error;
  }
}

/**
 * FUNGSI TAMBAHAN 2:
 * Helper utilitas untuk mengonversi berkas gambar (File/Blob) dari `<input type="file">` pada formView.js
 * menjadi String Base64 Data URL agar dapat disimpan dengan aman di IndexedDB.
 *
 * @function convertFileToBase64
 * @param {File|Blob} file - Berkas gambar dari input HTML.
 * @returns {Promise<string>} Promise yang menghasilkan string Base64 (misal: "data:image/jpeg;base64,...").
 */
export function convertFileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}