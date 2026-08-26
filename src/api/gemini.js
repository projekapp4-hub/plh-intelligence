/**
 * ============================================================================
 * PLH-INTELLIGENCE - Gemini API Client Layer (Frontend)
 * ============================================================================
 * Berkas: src/api/gemini.js
 * Deskripsi: Front-end client yang memanggil Netlify Serverless Function (/api/gemini).
 * Tidak mengekspos API Key ke bundle front-end.
 * ============================================================================
 */

const API_ENDPOINT = '/api/gemini';
const DEFAULT_MODEL_FAST = 'gemini-3.6-flash';

/**
 * Menghasilkan analisis berbasis teks murni melalui Serverless Function.
 *
 * @async
 * @param {string} promptText
 * @param {string|null} [systemInstruction=null]
 * @param {string} [modelName='gemini-3.6-flash']
 * @returns {Promise<string>}
 */
export async function analyzeText(
  promptText,
  systemInstruction = null,
  modelName = DEFAULT_MODEL_FAST
) {
  if (!promptText || typeof promptText !== 'string' || promptText.trim() === '') {
    throw new Error('[PLH-Gemini] Input promptText wajib diisi dan berupa string.');
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'analyzeText',
      promptText,
      systemInstruction,
      modelName,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Terjadi kesalahan saat memproses analisis teks.');
  }

  return data.result;
}

/**
 * Menghasilkan respons berformat JSON terstruktur melalui Serverless Function.
 *
 * @async
 * @param {Object|Array|string} jsonData
 * @param {string} [promptInstruction='']
 * @param {Object|null} [jsonSchema=null]
 * @param {string} [modelName='gemini-3.6-flash']
 * @returns {Promise<Object|Array>}
 */
export async function analyzeJSON(
  jsonData,
  promptInstruction = '',
  jsonSchema = null,
  modelName = DEFAULT_MODEL_FAST
) {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'analyzeJSON',
      jsonData,
      promptInstruction,
      jsonSchema,
      modelName,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Terjadi kesalahan saat memproses analisis data JSON.');
  }

  return data.result;
}
