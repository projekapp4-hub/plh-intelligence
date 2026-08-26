import { GoogleGenAI } from '@google/genai';

/**
 * Netlify Serverless Function untuk proxy Google Gemini API
 * Menyembunyikan API Key dari bundle front-end.
 */
export default async (req) => {
  // Hanya menerima HTTP POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return new Response(
      JSON.stringify({
        error: 'GEMINI_API_KEY belum dikonfigurasi di Environment Variables server.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const payload = await req.json();
    const { action, promptText, systemInstruction, jsonData, promptInstruction, jsonSchema, modelName } = payload;
    const model = modelName || 'gemini-3.6-flash';

    if (action === 'analyzeText') {
      if (!promptText || typeof promptText !== 'string' || promptText.trim() === '') {
        return new Response(JSON.stringify({ error: 'Input promptText wajib diisi.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const config = {};
      if (systemInstruction && typeof systemInstruction === 'string' && systemInstruction.trim() !== '') {
        config.systemInstruction = systemInstruction;
      }

      const response = await ai.models.generateContent({
        model,
        contents: promptText,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      if (!response || !response.text) {
        throw new Error('Tidak menerima respons teks yang valid dari Gemini API.');
      }

      return new Response(JSON.stringify({ result: response.text }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'analyzeJSON') {
      let formattedJsonString = '';
      if (typeof jsonData === 'object' && jsonData !== null) {
        formattedJsonString = JSON.stringify(jsonData, null, 2);
      } else if (typeof jsonData === 'string' && jsonData.trim() !== '') {
        formattedJsonString = jsonData;
      } else {
        return new Response(
          JSON.stringify({ error: 'Data masukan (jsonData) harus berupa Objek, Array, atau String JSON valid.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const combinedPrompt = `${(promptInstruction || '').trim()}\n\n[DATA INPUT JSON]:\n${formattedJsonString}`;
      const config = {
        responseMimeType: 'application/json',
      };

      if (jsonSchema && typeof jsonSchema === 'object') {
        config.responseSchema = jsonSchema;
      }

      const response = await ai.models.generateContent({
        model,
        contents: combinedPrompt,
        config,
      });

      if (!response || !response.text) {
        throw new Error('Tidak menerima respons teks dari Gemini API.');
      }

      const parsedJSON = JSON.parse(response.text);

      return new Response(JSON.stringify({ result: parsedJSON }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Aksi (action) tidak valid.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ [netlify/functions/gemini error]:', error);
    const message = error?.message || 'Terjadi kesalahan pada server saat memproses permintaan AI.';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
