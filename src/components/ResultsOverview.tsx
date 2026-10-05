import React from 'react';
import { CalculationResult, LoanConfiguration } from '../types/sora';
import { formatSGD, formatSGDExact, getBenchmarkLabel } from '../utils/soraMath';
import { ShieldCheck, ShieldAlert, AlertTriangle, ArrowRight, TrendingDown, DollarSign } from 'lucide-react';

interface ResultsOverviewProps {
  result: CalculationResult;
  config: LoanConfiguration;
  onViewSchedule: () => void;
  onViewRefinance: () => void;
}

export const ResultsOverview: React.FC<ResultsOverviewProps> = ({
  result,
  config,
  onViewSchedule,
  onViewRefinance
}) => {
  const principalRatio = (result.totalPrincipal / (result.totalCost || 1)) * 100;
  const interestRatio = (result.totalInterest / (result.totalCost || 1)) * 100;
  const stressDelta = result.monthlyInstallmentStressTest - result.monthlyInstallment;

  return (
    <div className="space-y-4">
      {/* Primary Payment Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-neutral-400">Monthly Installment</span>
              <span className="text-xs text-neutral-500 font-mono">
                {result.effectiveRate.toFixed(4)}% p.a.
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-white font-mono tabular-nums">
                {formatSGDExact(result.monthlyInstallment)}
              </span>
              <span className="text-xs text-neutral-400">/ month</span>
            </div>
            <p className="mt-1 text-xs text-neutral-400">
              {config.isHybridFixed ? (
                <span>
                  Initial Fixed Rate for {config.hybridFixedDurationMonths} mos, then reverts to SORA + {config.bankMargin.toFixed(2)}%
                </span>
              ) : (
                <span>
                  {getBenchmarkLabel(config.selectedBenchmark)} ({result.benchmarkRate.toFixed(4)}%) + {config.bankMargin.toFixed(2)}% bank margin
                </span>
              )}
            </p>
          </div>

          {/* MAS Regulatory Stress Test Box */}
          <div className="bg-neutral-950/70 border border-neutral-800 rounded-md p-3 sm:text-right min-w-[200px]">
            <div className="flex sm:justify-end items-center gap-1.5 text-xs text-neutral-400">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>MAS Stress Test (Floor {result.stressTestRate.toFixed(2)}%)</span>
            </div>
            <div className="mt-1 text-lg font-mono font-semibold text-neutral-200 tabular-nums">
              {formatSGDExact(result.monthlyInstallmentStressTest)}
              <span className="text-xs font-normal text-neutral-400">/mo</span>
            </div>
            <div className="text-[11px] font-mono text-amber-400/90 mt-0.5">
              +{formatSGDExact(stressDelta)}/mo safety buffer
            </div>
          </div>
        </div>

        {/* Cost Breakdown Progress Bar */}
        <div className="mt-5 pt-4 border-t border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
              Principal: <strong className="font-mono text-white">{formatSGD(result.totalPrincipal)}</strong> ({principalRatio.toFixed(1)}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-neutral-600"></span>
              Total Interest: <strong className="font-mono text-white">{formatSGD(result.totalInterest)}</strong> ({interestRatio.toFixed(1)}%)
            </span>
          </div>

          <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${principalRatio}%` }}
              className="bg-emerald-500 transition-all duration-300"
            />
            <div
              style={{ width: `${interestRatio}%` }}
              className="bg-neutral-600 transition-all duration-300"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-500 pt-1 font-mono">
            <span>Total Loan Lifetime Outlay:</span>
            <span className="text-neutral-300 font-semibold">{formatSGD(result.totalCost)}</span>
          </div>
        </div>
      </div>

      {/* MAS Regulatory Assessment Matrix (TDSR / MSR / LTV) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white">MAS Regulatory Eligibility & Stress Metrics</span>
          <span className="text-[11px] text-neutral-500">Monetary Authority of Singapore Rules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* TDSR Card */}
          <div className={`p-3 rounded-md border ${
            result.tdsrStatus === 'pass'
              ? 'bg-neutral-950/40 border-neutral-800'
              : result.tdsrStatus === 'warning'
              ? 'bg-amber-950/20 border-amber-800/60'
              : 'bg-rose-950/20 border-rose-800/60'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">TDSR (Total Debt)</span>
              <span className={`text-[11px] font-medium ${
                result.tdsrStatus === 'pass'
                  ? 'text-emerald-400'
                  : result.tdsrStatus === 'warning'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}>
                {result.tdsrStatus === 'pass' ? 'PASSED' : result.tdsrStatus === 'warning' ? 'BORDERLINE' : 'EXCEEDED'}
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-mono font-semibold text-white tabular-nums">
                {result.tdsrRatio}%
              </span>
              <span className="text-xs text-neutral-500 font-mono">Cap 55%</span>
            </div>
            {/* mini bar */}
            <div className="mt-2 h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (result.tdsrRatio / 55) * 100)}%` }}
                className={`h-full ${
                  result.tdsrStatus === 'pass'
                    ? 'bg-emerald-500'
                    : result.tdsrStatus === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
            </div>
          </div>

          {/* MSR Card (for HDB/EC) */}
          <div className={`p-3 rounded-md border ${
            result.msrStatus === 'not_applicable'
              ? 'bg-neutral-950/30 border-neutral-850'
              : result.msrStatus === 'pass'
              ? 'bg-neutral-950/40 border-neutral-800'
              : 'bg-rose-950/20 border-rose-800/60'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">MSR (HDB Mortgage)</span>
              <span className="text-[11px] font-medium text-neutral-400">
                {result.msrStatus === 'not_applicable' ? 'N/A (Private)' : result.msrStatus === 'pass' ? 'PASSED' : 'EXCEEDED'}
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-mono font-semibold text-white tabular-nums">
                {result.msrRatio !== null ? `${result.msrRatio}%` : '—'}
              </span>
              <span className="text-xs text-neutral-500 font-mono">Cap 30%</span>
            </div>
            <div className="mt-2 h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${result.msrRatio !== null ? Math.min(100, (result.msrRatio / 30) * 100) : 0}%` }}
                className="h-full bg-emerald-500"
              />
            </div>
          </div>

          {/* LTV Card */}
          <div className="p-3 rounded-md border bg-neutral-950/40 border-neutral-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">LTV Ratio</span>
              <span className="text-[11px] font-medium text-emerald-400">
                {result.ltvRatio <= result.maxAllowedLtv ? 'COMPLIANT' : 'OVER LIMIT'}
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-lg font-mono font-semibold text-white tabular-nums">
                {result.ltvRatio}%
              </span>
              <span className="text-xs text-neutral-500 font-mono">Max {result.maxAllowedLtv}%</span>
            </div>
            <div className="mt-2 h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (result.ltvRatio / result.maxAllowedLtv) * 100)}%` }}
                className="h-full bg-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Prepayment Savings Callout (if active) */}
      {config.prepayment.enabled && result.monthsSaved > 0 && (
        <div className="p-4 bg-emerald-950/20 border border-emerald-800/50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-900/40 rounded border border-emerald-700/40">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">Prepayment Acceleration Impact</span>
              <p className="text-xs text-emerald-300/90 font-mono mt-0.5">
                Saved {formatSGD(result.interestSaved)} in interest · Repaid {Math.floor(result.monthsSaved / 12)} years {result.monthsSaved % 12} months earlier!
              </p>
            </div>
          </div>
          <button
            onClick={onViewSchedule}
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 underline"
          >
            Inspect Schedule
          </button>
        </div>
      )}

      {/* Action cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={onViewSchedule}
          className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-md text-left transition-colors group flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-medium text-white block group-hover:text-emerald-400 transition-colors">
              Full Amortization Schedule
            </span>
            <span className="text-[11px] text-neutral-400">
              View month-by-month principal vs interest breakdown
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
        </button>

        <button
          onClick={onViewRefinance}
          className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-md text-left transition-colors group flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-medium text-white block group-hover:text-emerald-400 transition-colors">
              Refinancing & Repricing Tool
            </span>
            <span className="text-[11px] text-neutral-400">
              Compare current loan rate against SORA package
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
        </button>
      </div>
    </div>
  );
};
