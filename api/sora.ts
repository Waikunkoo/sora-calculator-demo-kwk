/**
 * Serverless endpoint for fetching MAS Domestic Interest Rates (Daily SORA & Compounded).
 *
 * MAS Endpoint:
 * https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
 *
 * Required Header for MAS:
 * KeyId: <MAS_KEY_ID>
 *
 * Compatible with both Node.js / Express / Vercel Serverless (req, res)
 * and Web Standard Request/Response runtimes.
 */

const MAS_API_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily';

export default async function handler(req: any, res?: any) {
  // CORS preflight handling
  if (req.method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, KeyId, x-mas-key-id, Authorization');
      return res.status(204).end();
    }
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, KeyId, x-mas-key-id, Authorization'
      }
    });
  }

  // Extract MAS_KEY_ID from environment variable, headers, or query parameters
  const envKey = process.env.MAS_KEY_ID?.trim();
  const headerKey = (
    req.headers?.['keyid'] ||
    req.headers?.['KeyId'] ||
    req.headers?.['x-mas-key-id'] ||
    (typeof req.headers?.get === 'function' ? req.headers.get('keyid') || req.headers.get('KeyId') || req.headers.get('x-mas-key-id') : null)
  );
  
  // Extract query params for limit or key_id
  let queryLimit = '30';
  let queryKey = '';
  if (req.query) {
    queryLimit = req.query.limit || queryLimit;
    queryKey = req.query.key_id || '';
  } else if (req.url) {
    try {
      const parsedUrl = new URL(req.url, 'http://localhost');
      queryLimit = parsedUrl.searchParams.get('limit') || queryLimit;
      queryKey = parsedUrl.searchParams.get('key_id') || '';
    } catch {
      // ignore
    }
  }

  const masKeyId = envKey || headerKey || queryKey;

  // Validation: Do not hardcode keys. Inform user if key is missing.
  if (!masKeyId) {
    const errorResponse = {
      success: false,
      error: 'Missing MAS KeyId',
      message:
        'MAS Domestic Interest Rates API requires a KeyId. Set MAS_KEY_ID in your environment variables (.env file) or provide a KeyId request header.',
      endpoint: MAS_API_ENDPOINT,
      required_header: 'KeyId: <MAS_KEY_ID>'
    };

    if (res && typeof res.status === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(401).json(errorResponse);
    }
    return new Response(JSON.stringify(errorResponse), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  try {
    // Append limit/pagination parameters if MAS endpoint supports it
    const masUrl = new URL(MAS_API_ENDPOINT);
    if (queryLimit) {
      masUrl.searchParams.set('limit', queryLimit);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const upstreamResponse = await fetch(masUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'KeyId': masKeyId
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text().catch(() => '');
      const upstreamError = {
        success: false,
        error: `MAS API returned HTTP ${upstreamResponse.status}: ${upstreamResponse.statusText}`,
        details: errorText,
        upstream_status: upstreamResponse.status
      };

      if (res && typeof res.status === 'function') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(upstreamResponse.status).json(upstreamError);
      }
      return new Response(JSON.stringify(upstreamError), {
        status: upstreamResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const rawData = await upstreamResponse.json();

    // MAS response structure parser
    // Can be an array, or an object with data / result / records
    let rawRecords: any[] = [];
    if (Array.isArray(rawData)) {
      rawRecords = rawData;
    } else if (rawData.data && Array.isArray(rawData.data)) {
      rawRecords = rawData.data;
    } else if (rawData.result && Array.isArray(rawData.result.records)) {
      rawRecords = rawData.result.records;
    } else if (rawData.records && Array.isArray(rawData.records)) {
      rawRecords = rawData.records;
    }

    // Normalize records into standard SORA types
    const parsedRecords = rawRecords.map((r: any) => ({
      date: r.end_of_day || r.date || r.value_date,
      sora_rate: parseFloat(r.sora || r.sora_rate || '0'),
      compounded_1m: parseFloat(r.soracompm1 || r.compounded_1m || r.sora_comp_1m || '0'),
      compounded_3m: parseFloat(r.soracompm3 || r.compounded_3m || r.sora_comp_3m || '0'),
      compounded_6m: parseFloat(r.soracompm6 || r.compounded_6m || r.sora_comp_6m || '0'),
      sora_index: parseFloat(r.soraindex || r.sora_index || '100'),
      aggregate_volume_mil: parseFloat(r.aggregate_volume || r.aggregate_volume_mil || '0'),
      highest_transacted: r.highest_transacted ? parseFloat(r.highest_transacted) : undefined,
      lowest_transacted: r.lowest_transacted ? parseFloat(r.lowest_transacted) : undefined,
      calculation_method: 'MAS Domestic Interest Rates Daily API'
    }));

    const responsePayload = {
      success: true,
      count: parsedRecords.length,
      source: 'Monetary Authority of Singapore (MAS)',
      endpoint: MAS_API_ENDPOINT,
      records: parsedRecords,
      raw: rawData
    };

    if (res && typeof res.status === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).json(responsePayload);
    }

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (err: any) {
    const errorPayload = {
      success: false,
      error: 'Failed to communicate with MAS API',
      message: err.message || 'Unknown network error',
      endpoint: MAS_API_ENDPOINT
    };

    if (res && typeof res.status === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(500).json(errorPayload);
    }

    return new Response(JSON.stringify(errorPayload), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
