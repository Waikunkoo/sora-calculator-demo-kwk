import React, { useState } from 'react';
import { MASRateRecord, BackendIntegrationConfig } from '../types/sora';
import { Database, Wifi, RefreshCw, CheckCircle, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react';

interface MasRatesFeedProps {
  rates: MASRateRecord[];
  integrationConfig: BackendIntegrationConfig;
  onUpdateConfig: (config: BackendIntegrationConfig) => void;
  onTestBackend: () => Promise<void>;
  isLoading: boolean;
}

export const MasRatesFeed: React.FC<MasRatesFeedProps> = ({
  rates,
  integrationConfig,
  onUpdateConfig,
  onTestBackend,
  isLoading
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  const filteredRates = rates.filter((r) =>
    r.date.includes(filterQuery) || r.sora_rate.toString().includes(filterQuery)
  );

  const sampleBackendPayload = `// Serverless Endpoints located in /api folder:
// 1. /api/health.ts  -> Health status and configuration check
// 2. /api/sora.ts    -> Proxies to MAS Domestic Interest Rates Daily API

// MAS Gateway Target Endpoint:
// https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
// Required Header: KeyId: <MAS_KEY_ID>

// Usage in .env:
// MAS_KEY_ID="your_mas_key_id_here"`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sampleBackendPayload);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Backend Integration Hub */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-neutral-800 rounded-md border border-neutral-700">
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white block">MAS Backend Integration Bridge</span>
              <span className="text-xs text-neutral-400">
                Configure your server-side proxy or MAS API endpoint
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
              integrationConfig.connectionStatus === 'connected'
                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80'
                : integrationConfig.connectionStatus === 'using_cache'
                ? 'bg-neutral-800 text-neutral-300 border border-neutral-750'
                : 'bg-rose-950/60 text-rose-400 border border-rose-800/80'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                integrationConfig.connectionStatus === 'connected'
                  ? 'bg-emerald-400'
                  : integrationConfig.connectionStatus === 'using_cache'
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`} />
              {integrationConfig.connectionStatus === 'connected'
                ? 'Live Backend Active'
                : integrationConfig.connectionStatus === 'using_cache'
                ? 'Official Baseline Cache'
                : 'Backend Error (Cached Fallback)'}
            </span>
          </div>
        </div>

        {/* Integration Config Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">
              Backend Endpoint URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={integrationConfig.apiUrl}
                onChange={(e) => onUpdateConfig({ ...integrationConfig, apiUrl: e.target.value })}
                placeholder="/api/sora or https://your-server.com/api/sora"
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={onTestBackend}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 hover:text-white rounded text-xs font-medium border border-neutral-700 transition-colors whitespace-nowrap"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-500">
              Default is `/api/sora` (connecting to MAS Domestic Interest Rates API with KeyId header). The app falls back to cached MAS benchmark data if MAS_KEY_ID is not configured yet.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300">Live Backend Hook</label>
            <div className="flex items-center justify-between p-2.5 bg-neutral-950 border border-neutral-800 rounded-md">
              <span className="text-xs text-neutral-400">Toggle Live Fetch</span>
              <button
                onClick={() => onUpdateConfig({ ...integrationConfig, useLiveBackend: !integrationConfig.useLiveBackend })}
                className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors ${
                  integrationConfig.useLiveBackend ? 'bg-emerald-600 justify-end' : 'bg-neutral-800 justify-start'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-white block"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Implementation snippet box */}
        <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400 font-mono">Backend Implementation Guide (MAS Official API):</span>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-white"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode ? 'Copied' : 'Copy Sample Proxy Code'}</span>
            </button>
          </div>
          <pre className="text-[11px] font-mono text-neutral-300 bg-neutral-900/90 p-3 rounded overflow-x-auto border border-neutral-800">
            {sampleBackendPayload}
          </pre>
        </div>
      </div>

      {/* Published Rates Archive Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div>
            <span className="text-xs font-semibold text-white">MAS SORA Benchmark Publication History</span>
            <p className="text-xs text-neutral-400">
              Published at 9:00 AM SGT every Singapore business day by the Monetary Authority of Singapore
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter by date (YYYY-MM)..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="px-3 py-1 text-xs bg-neutral-950 border border-neutral-800 rounded text-neutral-200 w-44 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="px-3 py-2.5 font-medium">Value Date</th>
                <th className="px-3 py-2.5 font-medium text-right text-white">Overnight SORA</th>
                <th className="px-3 py-2.5 font-medium text-right text-emerald-400">1M Compounded</th>
                <th className="px-3 py-2.5 font-medium text-right text-emerald-400">3M Compounded</th>
                <th className="px-3 py-2.5 font-medium text-right text-emerald-400">6M Compounded</th>
                <th className="px-3 py-2.5 font-medium text-right">SORA Index</th>
                <th className="px-3 py-2.5 font-medium text-right">Volume (S$M)</th>
                <th className="px-3 py-2.5 font-medium text-right">Range</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850 text-neutral-300">
              {filteredRates.map((r) => (
                <tr key={r.date} className="hover:bg-neutral-850/50">
                  <td className="px-3 py-2 font-medium text-white">{r.date}</td>
                  <td className="px-3 py-2 text-right font-semibold text-white">
                    {r.sora_rate.toFixed(4)}%
                  </td>
                  <td className="px-3 py-2 text-right text-emerald-400">
                    {r.compounded_1m.toFixed(4)}%
                  </td>
                  <td className="px-3 py-2 text-right text-emerald-400">
                    {r.compounded_3m.toFixed(4)}%
                  </td>
                  <td className="px-3 py-2 text-right text-emerald-400">
                    {r.compounded_6m.toFixed(4)}%
                  </td>
                  <td className="px-3 py-2 text-right text-neutral-400">
                    {r.sora_index.toFixed(4)}
                  </td>
                  <td className="px-3 py-2 text-right text-neutral-200">
                    S${r.aggregate_volume_mil.toLocaleString()}M
                  </td>
                  <td className="px-3 py-2 text-right text-neutral-500">
                    {r.lowest_transacted ? `${r.lowest_transacted}% - ${r.highest_transacted}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
