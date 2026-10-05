import React, { useState } from 'react';
import { MASRateRecord } from '../types/sora';
import { calculateCompoundedSoraFromDailyRates } from '../services/masService';
import { Calculator, ArrowRight, CheckCircle2, Sliders, RefreshCw } from 'lucide-react';

interface CompoundingExplainerProps {
  latestRecord: MASRateRecord;
  historicalRates: MASRateRecord[];
}

export const CompoundingExplainer: React.FC<CompoundingExplainerProps> = ({
  latestRecord,
  historicalRates
}) => {
  // Sandbox state: rate shift (+- bps)
  const [rateShiftBps, setRateShiftBps] = useState<number>(0);
  const [lookbackDays, setLookbackDays] = useState<number>(30);

  // Prepare sample daily rates with calendar weighting
  const sampleDailyRates = historicalRates.slice(0, 15).map((r, idx) => {
    const dateObj = new Date(r.date);
    const dayOfWeek = dateObj.getDay(); // 5 = Friday
    // Friday rate carries over Saturday and Sunday (3 days)
    const calendarDays = dayOfWeek === 5 ? 3 : 1;
    const adjustedRate = Math.max(0.1, r.sora_rate + rateShiftBps / 100);
    return {
      date: r.date,
      rate: Number(adjustedRate.toFixed(4)),
      calendarDaysApplied: calendarDays
    };
  });

  const totalCalendarDays = sampleDailyRates.reduce((acc, curr) => acc + (curr.calendarDaysApplied || 1), 0);
  const { compoundedRate, dailyFactors } = calculateCompoundedSoraFromDailyRates(
    sampleDailyRates,
    totalCalendarDays
  );

  return (
    <div className="space-y-6">
      {/* Educational Header Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">MAS Compounded SORA Mathematical Convention</span>
          <span className="text-xs text-neutral-400 font-mono">Actual/365 Money Market Standard</span>
        </div>
        <p className="mt-2 text-xs text-neutral-300 leading-relaxed max-w-3xl">
          Unlike the discontinued SIBOR or SOR (which were forward-looking term rates), SORA is a 
          <strong className="text-white"> backward-looking overnight rate</strong> derived from actual SGD interbank transactions. 
          To determine the floating interest on bank loans, MAS computes the compounded rate over the calculation period using geometric daily compounding.
        </p>

        {/* The Exact MAS Formula */}
        <div className="mt-4 p-4 bg-neutral-950 border border-neutral-800 rounded-md">
          <div className="text-xs text-neutral-400 font-mono mb-2">Official Monetary Authority of Singapore (MAS) Formula:</div>
          <div className="p-3 bg-neutral-900/80 rounded border border-neutral-800/80 overflow-x-auto text-center">
            <span className="font-mono text-sm sm:text-base text-emerald-400 tracking-wide">
              Compounded SORA = [ &prod;<sub>i=1</sub><sup>d<sub>0</sub></sup> ( 1 + (SORA<sub>i</sub> &times; n<sub>i</sub>) / 365 ) &minus; 1 ] &times; (365 / d) &times; 100
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-3 border-t border-neutral-800 text-xs">
            <div>
              <span className="font-mono text-emerald-400 font-semibold">d<sub>0</sub></span>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Number of Singapore business days in the compounding observation window.
              </p>
            </div>
            <div>
              <span className="font-mono text-emerald-400 font-semibold">SORA<sub>i</sub></span>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Published SORA for Singapore business day <em>i</em> (expressed as decimal).
              </p>
            </div>
            <div>
              <span className="font-mono text-emerald-400 font-semibold">n<sub>i</sub></span>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Calendar days rate applies (e.g. 3 days for Friday to cover the weekend).
              </p>
            </div>
            <div>
              <span className="font-mono text-emerald-400 font-semibold">d</span>
              <p className="text-neutral-400 text-[11px] mt-0.5">
                Total calendar days in period (SGD Day Count Actual/365).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive SORA Compounding Simulator */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-800">
          <div>
            <span className="text-xs font-semibold text-white">Daily Compounding Simulator & Stress Lab</span>
            <p className="text-xs text-neutral-400">
              Test how overnight shifts cascade through the geometric compounding product
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-mono">Overnight Shock:</span>
            {[-50, -25, 0, 25, 50, 100].map((bps) => (
              <button
                key={bps}
                onClick={() => setRateShiftBps(bps)}
                className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                  rateShiftBps === bps
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-800 text-neutral-300 hover:text-white'
                }`}
              >
                {bps > 0 ? `+${bps}` : bps} bps
              </button>
            ))}
          </div>
        </div>

        {/* Live Calculation Output Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-md">
            <span className="text-xs text-neutral-400">Published Spot SORA</span>
            <div className="mt-1 text-xl font-mono font-semibold text-white">
              {latestRecord.sora_rate.toFixed(4)}% p.a.
            </div>
            <span className="text-[11px] text-neutral-500 font-mono">Date: {latestRecord.date}</span>
          </div>

          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-md">
            <span className="text-xs text-neutral-400">Compounded Rate (Calculated)</span>
            <div className="mt-1 text-xl font-mono font-semibold text-emerald-400">
              {compoundedRate.toFixed(4)}% p.a.
            </div>
            <span className="text-[11px] text-neutral-500 font-mono">
              Over {sampleDailyRates.length} business days ({totalCalendarDays} cal days)
            </span>
          </div>

          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-md">
            <span className="text-xs text-neutral-400">Official MAS Benchmark</span>
            <div className="mt-1 text-xl font-mono font-semibold text-neutral-200">
              {latestRecord.compounded_1m.toFixed(4)}% p.a.
            </div>
            <span className="text-[11px] text-neutral-500 font-mono">1M Compounded Reference</span>
          </div>
        </div>

        {/* Step-by-step Daily Multiplication Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Daily Compounding Factor Cascade [ (1 + SORA &times; n / 365) ]</span>
            <span className="font-mono">Showing recent 15 business days</span>
          </div>

          <div className="overflow-x-auto border border-neutral-800 rounded-md max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-950 text-neutral-400 sticky top-0 border-b border-neutral-800">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2 text-right">Daily SORA (% p.a.)</th>
                  <th className="px-3 py-2 text-right">Calendar Days (n<sub>i</sub>)</th>
                  <th className="px-3 py-2 text-right">Compounding Factor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850 text-neutral-300">
                {dailyFactors.map((item, idx) => (
                  <tr key={item.date} className="hover:bg-neutral-850/50">
                    <td className="px-3 py-1.5 text-neutral-400">{item.date}</td>
                    <td className="px-3 py-1.5 text-right font-semibold text-white">
                      {item.rate.toFixed(4)}%
                    </td>
                    <td className="px-3 py-1.5 text-right">
                      <span className={item.days > 1 ? 'text-amber-400 font-semibold' : 'text-neutral-400'}>
                        {item.days} {item.days > 1 ? '(Fri/Weekend)' : 'day'}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 text-right text-emerald-400/90">
                      {item.factor.toFixed(8)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Lookback vs Observation Shift Comparison Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-2">
          <span className="text-xs font-semibold text-white">Observation Period Shift (Standard Bank Approach)</span>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Singapore banks (DBS, OCBC, UOB) utilize an Observation Period Shift (typically 2 to 5 Singapore business days). 
            This ensures borrowers receive their exact billing notice and payment amount before the interest payment due date, avoiding billing lag while preserving full economic fidelity.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-2">
          <span className="text-xs font-semibold text-white">Why SORA Stabilizes Mortgage Volatility</span>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Because compounded SORA takes the geometric average of 30, 90, or 180 days of overnight rates, transient single-day spikes (e.g. quarter-end balance sheet turns or liquidity squeezes) are filtered out, creating smooth, predictable resets for Singapore homeowners.
          </p>
        </div>
      </div>
    </div>
  );
};
