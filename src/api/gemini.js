/**
 * ============================================================================
 * PLH-INTELLIGENCE - Gemini API Service Layer
 * ============================================================================
 * Berkas: src/api/gemini.js
 * Deskripsi: Modul integrasi API khusus untuk menangani pengolahan Teks murni
 * dan Data JSON terstruktur antara antarmuka web PLH-INTELLIGENCE dengan Google
 * Gemini API. Modul ini tidak melakukan manipulasi DOM maupun operasi penyimpanan.
 * ============================================================================
 */

import { GoogleGenAI } from '@google/genai';

/**
 * Pengambilan API Key dari variabel lingkungan Vite (.env)
 * @type {string|undefined}
 */
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Validasi awal konfigurasi API Key saat modul pertama kali diimpor
if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
  console.error(
    '❌ [PLH-INTELLIGENCE API ERROR] Variable "VITE_GEMINI_API_KEY" tidak ditemukan di file .env!\n' +
    'Harap pastikan Anda telah mendefinisikan VITE_GEMINI_API_KEY=<API_KEY_ANDA> pada berkas .env di root proyek.'
  );
}

/**
 * Inisialisasi client instance Google Gen AI SDK
 * @type {GoogleGenAI}
 */
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || '' });

/**
 * Model Default yang digunakan dalam sistem PLH-INTELLIGENCE
 */
const DEFAULT_MODEL_FAST = 'gemini-3.5-flash-lite';
const DEFAULT_MODEL_PRO = 'gemini-3.1-flash-lite';

/**
 * Menghasilkan analisis berbasis teks murni dari input prompt yang diberikan.
 *
 * @async
 * @function analyzeText
 * @param {string} promptText - Teks instruksi atau data mentah yang akan dianalisis.
 * @param {string|null} [systemInstruction=null] - Peran/konteks sistem awal (opsional).
 * @param {string} [modelName='gemini-2.5-flash'] - Model Gemini yang digunakan ('gemini-2.5-flash' atau 'gemini-2.5-pro').
 * @returns {Promise<string>} Hasil analisis berupa teks murni dari Gemini API.
 * @throws {Error} Jika API key tidak ada, input tidak valid, kuota habis, atau terjadi kesalahan jaringan.
 * 
 * @example
 * import { analyzeText } from './api/gemini.js';
 * const ringkasan = await analyzeText(
 *   'Evaluasi performa tim piket zona 1 minggu ini.',
 *   'Anda adalah asisten pakar analisis lingkungan PLH-INTELLIGENCE.'
 * );
 */
export async function analyzeText(
  promptText,
  systemInstruction = null,
  modelName = DEFAULT_MODEL_FAST
) {
  validateApiKey();

  if (!promptText || typeof promptText !== 'string' || promptText.trim() === '') {
    throw new Error('[PLH-Gemini] Input promptText wajib diisi dan berupa string.');
  }

  try {
    // Menyusun konfigurasi opsional jika systemInstruction disertakan
    const config = {};
    if (systemInstruction && typeof systemInstruction === 'string' && systemInstruction.trim() !== '') {
      config.systemInstruction = systemInstruction;
    }

    // Pemanggilan endpoint API Gemini
    const response = await ai.models.generateContent({
      model: modelName,
      contents: promptText,
      config: Object.keys(config).length > 0 ? config : undefined
    });

    if (!response || !response.text) {
      throw new Error('Sistem tidak menerima respons teks yang valid dari Gemini API.');
    }

    return response.text;
  } catch (error) {
    console.error('❌ [gemini.js - analyzeText Error]:', error);
    throw new Error(parseGeminiError(error));
  }
}

/**
 * Menerima data JSON/Objek JavaScript dan menghasilkan respons berformat JSON terstruktur yang sudah di-parse.
 *
 * @async
 * @function analyzeJSON
 * @param {Object|Array|string} jsonData - Objek/Array JS atau JSON String yang akan dianalisis oleh Gemini.
 * @param {string} [promptInstruction=''] - Instruksi tambahan untuk mengarahkan pengolahan data.
 * @param {Object|null} [jsonSchema=null] - Skema JSON opsional (Structured Outputs) untuk mengunci struktur respons.
 * @param {string} [modelName='gemini-2.5-flash'] - Model Gemini yang digunakan ('gemini-2.5-flash' atau 'gemini-2.5-pro').
 * @returns {Promise<Object|Array>} Objek JavaScript hasil parsing JSON murni dari Gemini.
 * @throws {Error} Jika gagal melakukan koneksi, validasi gagal, atau output Gemini bukan JSON valid.
 * 
 * @example
 * import { analyzeJSON } from './api/gemini.js';
 * const result = await analyzeJSON(
 *   { zona: 'Taman Depan', skorKerapihan: 60 },
 *   'Berikan saran perbaikan dan tingkat prioritas penanganan.'
 * );
 */
export async function analyzeJSON(
  jsonData,
  promptInstruction = '',
  jsonSchema = null,
  modelName = DEFAULT_MODEL_FAST
) {
  validateApiKey();

  try {
    // Validasi dan pengubahan masukan menjadi string JSON yang terformat rapi
    let formattedJsonString = '';
    if (typeof jsonData === 'object' && jsonData !== null) {
      formattedJsonString = JSON.stringify(jsonData, null, 2);
    } else if (typeof jsonData === 'string' && jsonData.trim() !== '') {
      formattedJsonString = jsonData;
    } else {
      throw new Error('Data masukan (jsonData) harus berupa Objek, Array, atau String JSON yang valid.');
    }

    // Konstruksi prompt terstruktur
    const combinedPrompt = `${promptInstruction.trim()}\n\n[DATA INPUT JSON]:\n${formattedJsonString}`;

    // Konfigurasi khusus agar Gemini wajib mengembalikan respons MIME Type JSON
    const config = {
      responseMimeType: 'application/json'
    };

    // Jika skema JSON disediakan, kunci struktur output sesuai skema tersebut
    if (jsonSchema && typeof jsonSchema === 'object') {
      config.responseSchema = jsonSchema;
    }

    // Eksekusi pemanggilan Gemini API
    const response = await ai.models.generateContent({
      model: modelName,
      contents: combinedPrompt,
      config: config
    });

    const rawResponseText = response.text;
    if (!rawResponseText) {
      throw new Error('Menerima respons kosong dari Gemini API.');
    }

    // Melakukan parsing hasil respons JSON dari Gemini menjadi Objek JS murni
    return JSON.parse(rawResponseText);
  } catch (error) {
    console.error('❌ [gemini.js - analyzeJSON Error]:', error);

    // Penanganan khusus jika kesalahan terjadi pada saat JSON.parse()
    if (error instanceof SyntaxError) {
      throw new Error('Gagal memproses data dari Gemini. Output yang dikembalikan tidak berformat JSON valid.');
    }

    throw new Error(parseGeminiError(error));
  }
}

/**
 * Melakukan validasi ketersediaan API Key sebelum eksekusi request.
 * 
 * @private
 * @throws {Error} Jika API Key belum dikonfigurasi di environment.
 */
function validateApiKey() {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === '') {
    throw new Error(
      'Konfigurasi API Key Google Gemini (VITE_GEMINI_API_KEY) tidak ditemukan. ' +
      'Periksa file .env Anda dan restart server development Vite.'
    );
  }
}

/**
 * Mengubah pesan kesalahan teknis (error log) menjadi pesan yang ramah pengguna.
 * 
 * @private
 * @param {Error|any} error - Objek error yang ditangkap di blok catch.
 * @returns {string} Pesan kesalahan terstruktur dalam Bahasa Indonesia.
 */
function parseGeminiError(error) {
  const errorMessage = error?.message || String(error);

  if (errorMessage.includes('401') || errorMessage.includes('API_KEY_INVALID')) {
    return 'API Key Google Gemini tidak valid atau telah dicabut. Harap periksa kembali kunci API Anda.';
  }

  if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota')) {
    return 'Batas kuota penggunaan (Rate Limit) Gemini API telah tercapai. Silakan coba beberapa saat lagi.';
  }

  if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
    return 'Gagal terhubung ke server Google Gemini. Harap periksa koneksi internet Anda.';
  }

  return errorMessage || 'Terjadi kesalahan tidak terduga saat berkomunikasi dengan sistem AI Gemini.';
}