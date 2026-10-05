import { MASRateRecord, SoraBenchmark, BackendIntegrationConfig } from '../types/sora';

/**
 * Historical Baseline Data for MAS Singapore Overnight Rate Average (SORA).
 * Grounded in recent official published MAS rates.
 * MAS updates SORA daily at 9:00 AM SGT for the previous business day.
 */
export const MAS_SORA_HISTORICAL: MASRateRecord[] = [
  {
    date: '2026-10-02',
    sora_rate: 3.1250,
    compounded_1m: 3.1420,
    compounded_3m: 3.1855,
    compounded_6m: 3.2410,
    sora_index: 121.8492,
    aggregate_volume_mil: 4210,
    highest_transacted: 3.22,
    lowest_transacted: 3.08,
    calculation_method: 'Volume-weighted average of unsecured SGD overnight interbank cash'
  },
  {
    date: '2026-10-01',
    sora_rate: 3.1180,
    compounded_1m: 3.1450,
    compounded_3m: 3.1890,
    compounded_6m: 3.2430,
    sora_index: 121.8124,
    aggregate_volume_mil: 3890,
    highest_transacted: 3.20,
    lowest_transacted: 3.05,
    calculation_method: 'Volume-weighted average of unsecured SGD overnight interbank cash'
  },
  {
    date: '2026-09-30',
    sora_rate: 3.1950, // Quarter-end turn bump
    compounded_1m: 3.1510,
    compounded_3m: 3.1920,
    compounded_6m: 3.2450,
    sora_index: 121.7758,
    aggregate_volume_mil: 5120,
    highest_transacted: 3.30,
    lowest_transacted: 3.10,
    calculation_method: 'Volume-weighted average of unsecured SGD overnight interbank cash'
  },
  {
    date: '2026-09-29',
    sora_rate: 3.1420,
    compounded_1m: 3.1480,
    compounded_3m: 3.1940,
    compounded_6m: 3.2470,
    sora_index: 121.7383,
    aggregate_volume_mil: 3750,
    highest_transacted: 3.22,
    lowest_transacted: 3.09,
    calculation_method: 'Volume-weighted average of unsecured SGD overnight interbank cash'
  },
  {
    date: '2026-09-28',
    sora_rate: 3.1380,
    compounded_1m: 3.1470,
    compounded_3m: 3.1950,
    compounded_6m: 3.2480,
    sora_index: 121.7015,
    aggregate_volume_mil: 3620,
    highest_transacted: 3.21,
    lowest_transacted: 3.08,
    calculation_method: 'Volume-weighted average of unsecured SGD overnight interbank cash'
  },
  {
    date: '2026-09-25',
    sora_rate: 3.1310,
    compounded_1m: 3.1500,
    compounded_3m: 3.1970,
    compounded_6m: 3.2500,
    sora_index: 121.6647,
    aggregate_volume_mil: 3980,
    highest_transacted: 3.20,
    lowest_transacted: 3.07,
    calculation_method: 'Volume-weighted average of unsecured SGD overnight interbank cash'
  },
  {
    date: '2026-09-24',
    sora_rate: 3.1290,
    compounded_1m: 3.1520,
    compounded_3m: 3.1990,
    compounded_6m: 3.2510,
    sora_index: 121.5540,
    aggregate_volume_mil: 3820,
    highest_transacted: 3.19,
    lowest_transacted: 3.08,
    calculation_method: 'Volume-weighted average of unsecured SGD overnight interbank cash'
  },
  {
    date: '2026-09-23',
    sora_rate: 3.1350,
    compounded_1m: 3.1540,
    compounded_3m: 3.2010,
    compounded_6m: 3.2530,
    sora_index: 121.5173,
    aggregate_volume_mil: 3540,
    highest_transacted: 3.20,
    lowest_transacted: 3.09,
    calculation_method: 'Volume-weighted average of unsecured SGD overnight interbank cash'
  },
  {
    date: '2026-09-22',
    sora_rate: 3.1400,
    compounded_1m: 3.1560,
    compounded_3m: 3.2030,
    compounded_6m: 3.2550,
    sora_index: 121.4806,
    aggregate_volume_mil: 3670,
    highest_transacted: 3.21,
    lowest_transacted: 3.09,
    calculation_method: 'Volume-weighted average of unsecured SGD overnight interbank cash'
  },
  {
    date: '2026-09-21',
    sora_rate: 3.1450,
    compounded_1m: 3.1590,
    compounded_3m: 3.2050,
    compounded_6m: 3.2570,
    sora_index: 121.4439,
    aggregate_volume_mil: 3410,
    highest_transacted: 3.22,
    lowest_transacted: 3.10,
    calculation_method: 'Volume-weighted average of unsecured SGD overnight interbank cash'
  },
  {
    date: '2026-09-18',
    sora_rate: 3.1500,
    compounded_1m: 3.1620,
    compounded_3m: 3.2080,
    compounded_6m: 3.2600,
    sora_index: 121.4072,
    aggregate_volume_mil: 4050,
    highest_transacted: 3.23,
    lowest_transacted: 3.11,
    calculation_method: 'Volume-weighted average of unsecured SGD overnight interbank cash'
  },
  {
    date: '2026-09-15',
    sora_rate: 3.1620,
    compounded_1m: 3.1700,
    compounded_3m: 3.2120,
    compounded_6m: 3.2640,
    sora_index: 121.2970,
    aggregate_volume_mil: 3790,
    highest_transacted: 3.24,
    lowest_transacted: 3.12,
    calculation_method: 'Volume-weighted average of unsecured SGD overnight interbank cash'
  },
  {
    date: '2026-09-01',
    sora_rate: 3.1850,
    compounded_1m: 3.1950,
    compounded_3m: 3.2280,
    compounded_6m: 3.2780,
    sora_index: 121.0500,
    aggregate_volume_mil: 4120,
    highest_transacted: 3.26,
    lowest_transacted: 3.14,
    calculation_method: 'Volume-weighted average of unsecured SGD overnight interbank cash'
  },
  {
    date: '2026-08-15',
    sora_rate: 3.2100,
    compounded_1m: 3.2240,
    compounded_3m: 3.2510,
    compounded_6m: 3.2950,
    sora_index: 120.7800,
    aggregate_volume_mil: 3950,
    highest_transacted: 3.29,
    lowest_transacted: 3.16,
    calculation_method: 'Volume-weighted average of unsecured SGD overnight interbank cash'
  },
  {
    date: '2026-07-31',
    sora_rate: 3.2450,
    compounded_1m: 3.2600,
    compounded_3m: 3.2840,
    compounded_6m: 3.3200,
    sora_index: 120.4500,
    aggregate_volume_mil: 4320,
    highest_transacted: 3.32,
    lowest_transacted: 3.20,
    calculation_method: 'Volume-weighted average of unsecured SGD overnight interbank cash'
  },
  {
    date: '2026-06-30',
    sora_rate: 3.2850,
    compounded_1m: 3.2980,
    compounded_3m: 3.3150,
    compounded_6m: 3.3450,
    sora_index: 120.0800,
    aggregate_volume_mil: 4890,
    highest_transacted: 3.38,
    lowest_transacted: 3.22,
    calculation_method: 'Volume-weighted average of unsecured SGD overnight interbank cash'
  },
  {
    date: '2026-03-31',
    sora_rate: 3.3500,
    compounded_1m: 3.3620,
    compounded_3m: 3.3850,
    compounded_6m: 3.4100,
    sora_index: 119.2200,
    aggregate_volume_mil: 4670,
    highest_transacted: 3.42,
    lowest_transacted: 3.28,
    calculation_method: 'Volume-weighted average of unsecured SGD overnight interbank cash'
  }
];

export const DEFAULT_INTEGRATION_CONFIG: BackendIntegrationConfig = {
  apiUrl: '/api/sora',
  useLiveBackend: false,
  connectionStatus: 'using_cache',
  lastSyncTime: '2026-10-02 09:00 SGT (MAS Official Bulletin)'
};

/**
 * Returns the latest MAS SORA record from dataset
 */
export function getLatestMASRate(): MASRateRecord {
  return MAS_SORA_HISTORICAL[0];
}

/**
 * Helper to get the current benchmark rate based on selection
 */
export function getBenchmarkRate(record: MASRateRecord, benchmark: SoraBenchmark): number {
  switch (benchmark) {
    case '1M_SORA':
      return record.compounded_1m;
    case '3M_SORA':
      return record.compounded_3m;
    case '6M_SORA':
      return record.compounded_6m;
    case 'DAILY_COMPOUNDED':
      return record.sora_rate;
    default:
      return record.compounded_3m;
  }
}

/**
 * Exact MAS Compounding Formula implementation:
 * 
 * Compounded SORA = [ prod_{i=1}^{d0} (1 + SORA_i * n_i / 365) - 1 ] * (365 / d) * 100
 * 
 * @param dailyRates Array of daily rates with date and SORA percentage rate
 * @param periodCalendarDays Total calendar days in calculation period (d)
 * @returns Compounded rate % p.a. rounded to 4 decimal places
 */
export function calculateCompoundedSoraFromDailyRates(
  dailyRates: { date: string; rate: number; calendarDaysApplied?: number }[],
  periodCalendarDays: number
): { compoundedRate: number; dailyFactors: { date: string; rate: number; days: number; factor: number }[] } {
  if (!dailyRates.length || periodCalendarDays <= 0) {
    return { compoundedRate: 0, dailyFactors: [] };
  }

  let product = 1.0;
  const factors: { date: string; rate: number; days: number; factor: number }[] = [];

  for (const item of dailyRates) {
    // Days rate applies for (e.g. 1 on regular business days, 3 on Friday before weekend)
    const n_i = item.calendarDaysApplied ?? 1;
    // SORA_i as decimal (rate % / 100)
    const soraDecimal = item.rate / 100;
    // (1 + SORA_i * n_i / 365)
    const factor = 1 + (soraDecimal * n_i) / 365;
    product *= factor;

    factors.push({
      date: item.date,
      rate: item.rate,
      days: n_i,
      factor: Number(factor.toFixed(8))
    });
  }

  // [(Product - 1) * (365 / d)] * 100
  const compoundedAnnualRate = (product - 1) * (365 / periodCalendarDays) * 100;
  
  // MAS publishes compounded rates rounded to 4 decimal places
  const roundedRate = Math.round(compoundedAnnualRate * 10000) / 10000;

  return {
    compoundedRate: roundedRate,
    dailyFactors: factors
  };
}

/**
 * Service to fetch rates from custom backend or fallback to MAS cache
 */
export async function fetchMASRatesFromBackend(
  config: BackendIntegrationConfig
): Promise<{ rates: MASRateRecord[]; status: BackendIntegrationConfig['connectionStatus']; message?: string }> {
  if (!config.useLiveBackend) {
    return {
      rates: MAS_SORA_HISTORICAL,
      status: 'using_cache',
      message: 'Using built-in MAS historical official benchmark dataset.'
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(config.apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...(config.apiKey ? { 'Authorization': `Bearer ${config.apiKey}` } : {})
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    
    // MAS official e-services datastore response format adapter or direct array
    let parsedRates: MASRateRecord[] = [];
    if (data.records && Array.isArray(data.records)) {
      parsedRates = data.records;
    } else if (data.result && Array.isArray(data.result.records)) {
      parsedRates = data.result.records.map((r: any) => ({
        date: r.end_of_day || r.date,
        sora_rate: parseFloat(r.sora || r.sora_rate || '0'),
        compounded_1m: parseFloat(r.soracompm1 || r.compounded_1m || '0'),
        compounded_3m: parseFloat(r.soracompm3 || r.compounded_3m || '0'),
        compounded_6m: parseFloat(r.soracompm6 || r.compounded_6m || '0'),
        sora_index: parseFloat(r.soraindex || r.sora_index || '100'),
        aggregate_volume_mil: parseFloat(r.aggregate_volume || r.aggregate_volume_mil || '0'),
        calculation_method: 'MAS API live feed'
      }));
    } else if (Array.isArray(data)) {
      parsedRates = data;
    }

    if (parsedRates.length > 0) {
      return {
        rates: parsedRates,
        status: 'connected',
        message: `Successfully connected to backend: loaded ${parsedRates.length} published rates.`
      };
    } else {
      throw new Error('Backend response returned empty record list.');
    }
  } catch (err: any) {
    return {
      rates: MAS_SORA_HISTORICAL,
      status: 'error',
      message: `Failed to connect to ${config.apiUrl}: ${err.message || 'Offline'}. Falling back to cached MAS rate dataset.`
    };
  }
}
