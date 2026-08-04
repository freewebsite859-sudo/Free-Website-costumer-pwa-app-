import type { IncomingMessage, ServerResponse } from 'node:http';
import { GoogleGenAI } from '@google/genai';

/**
 * Vercel Serverless Function — POST /api/suggest-times
 * Mirrors the previous Express route in server.ts so the client's
 * relative fetch('/api/suggest-times') keeps working on Vercel.
 * Request body: { appointmentHistory: [...] }
 * Response:     { suggestions: string }
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ suggestions: '' }));
    return;
  }

  let body: { appointmentHistory?: unknown } = {};
  try {
    const raw = await readBody(req);
    body = raw ? JSON.parse(raw) : {};
  } catch {
    body = {};
  }

  const appointmentHistory = body.appointmentHistory;

  if (!process.env.GEMINI_API_KEY) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        suggestions: 'Suggested times: 10:00 AM, 2:30 PM, 6:00 PM (Popular peak booking hours).',
      }),
    );
    return;
  }

  try {
    const prompt = `Analyze this user's appointment history and suggest 3 optimal times for a next appointment. History: ${JSON.stringify(
      appointmentHistory,
    )}`;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        suggestions: response.text || 'Suggested times: 10:00 AM, 2:30 PM, 6:00 PM.',
      }),
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('Gemini API notice (rate limit or connection):', message);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        suggestions: 'Suggested optimal times: 10:00 AM, 2:30 PM, 6:00 PM (Based on peak salon slots).',
      }),
    );
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer | string) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
