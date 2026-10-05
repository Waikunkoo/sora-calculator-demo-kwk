import type { Request, Response } from 'express';

/**
 * Health check endpoint for the serverless API.
 * Supports both standard Node/Express/Vercel (req, res) and Web Request/Response.
 */
export default async function handler(req: any, res?: any) {
  const masKeyConfigured = Boolean(process.env.MAS_KEY_ID && process.env.MAS_KEY_ID.trim().length > 0);

  const payload = {
    status: 'healthy',
    service: 'MAS SORA API Gateway',
    timestamp: new Date().toISOString(),
    mas_key_configured: masKeyConfigured,
    endpoints: {
      health: '/api/health',
      sora: '/api/sora'
    },
    version: '1.0.0'
  };

  // If running in Express / Node HTTP / Vercel Serverless environment
  if (res && typeof res.status === 'function') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(200).json(payload);
  }

  // If running in Edge / Web Standard Request/Response runtime
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
