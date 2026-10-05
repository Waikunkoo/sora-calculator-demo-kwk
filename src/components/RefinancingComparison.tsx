import React, { useState } from 'react';
import { calculateRefinancingSavings, formatSGD, formatSGDExact } from '../utils/soraMath';
import { MASRateRecord, SoraBenchmark } from '../types/sora';
import { ArrowRight, Check, TrendingDown, DollarSign, Calculator } from 'lucide-react';

interface RefinancingComparisonProps {
  defaultLoanAmount: number;
  defaultTenureYears: number;
  latestRecord: MASRateRecord;
  selectedBenchmark: SoraBenchmark;
  currentBankMargin: number;
}

export const RefinancingComparison: React.FC<RefinancingComparisonProps> = ({
  defaultLoanAmount,
  defaultTenureYears,
  latestRecord,
  selectedBenchmark,
  currentBankMargin
}) => {
  const [currentBalance, setCurrentBalance] = useState<number>(defaultLoanAmount);
  const [currentRate, setCurrentRate] = useState<number>(3.85); // typical older rate
  const [remainingTenure, setRemainingTenure] = useState<number>(defaultTenureYears);
  
  // New loan parameters
  const benchmarkRate = selectedBenchmark === '1M_SORA'
    ? latestRecord.compounded_1m
    : selectedBenchmark === '3M_SORA'
    ? latestRecord.compounded_3m
    : selectedBenchmark === '6M_SORA'
    ? latestRecord.compounded_6m
    : latestRecord.sora_rate;

  const [newMargin, setNewMargin] = useState<number>(currentBankMargin || 0.65);
  const [legalSubsidy, setLegalSubsidy] = useState<number>(2000); // S$2,000 legal subsidy standard
  const [fees, setFees] = useState<number>(2200); // legal + valuation

  const savings = calculateRefinancingSavings(
    currentBalance,
    currentRate,
    remainingTenure,
    benchmarkRate,
    newMargin,
    legalSubsidy,
    fees
  );

  const isSaving = savings.monthlySavings > 0;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Mortgage Refinancing & Repricing Analyzer</span>
          <span className="text-xs text-neutral-400 font-mono">Singapore Bank Switching Matrix</span>
        </div>
        <p className="mt-1 text-xs text-neutral-400">
          Evaluate whether switching from an expiring fixed or higher-margin loan package to a live SORA-pegged mortgage produces net positive cashflow after subsidies and fees.
        </p>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5 pt-4 border-t border-neutral-800">
          {/* Current Loan Box */}
          <div className="space-y-3 p-4 bg-neutral-950 border border-neutral-800 rounded-md">
            <span className="text-xs font-semibold text-neutral-300 block">Existing Loan Terms</span>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Outstanding Loan Balance</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-500">S$</span>
                <input
                  type="number"
                  step={10000}
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(Math.max(10000, Number(e.target.value)))}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs font-mono text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Current Interest Rate (% p.a.)</label>
              <div className="relative">
                <input
                  type="number"
                  step={0.05}
                  value={currentRate}
                  onChange={(e) => setCurrentRate(Math.max(0.1, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs font-mono text-white"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-500">%</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Remaining Tenure (Years)</label>
              <input
                type="number"
                min={1}
                max={35}
                value={remainingTenure}
                onChange={(e) => setRemainingTenure(Math.max(1, Number(e.target.value)))}
                className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs font-mono text-white"
              />
            </div>
          </div>

          {/* Proposed SORA Package Box */}
          <div className="space-y-3 p-4 bg-neutral-950 border border-neutral-800 rounded-md">
            <span className="text-xs font-semibold text-emerald-400 block">Proposed New SORA Package</span>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">MAS Benchmark Rate</label>
              <div className="px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs font-mono text-neutral-300">
                {benchmarkRate.toFixed(4)}% p.a. ({selectedBenchmark})
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-400">Proposed Bank Spread</label>
              <div className="relative">
                <input
                  type="number"
                  step={0.05}
                  value={newMargin}
                  onChange={(e) => setNewMargin(Math.max(0, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-800 rounded text-xs font-mono text-white"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-500">% p.a.</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-mono pt-0.5">
                New All-in Rate: {(benchmarkRate + newMargin).toFixed(4)}% p.a.
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Bank Legal Subsidy</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-mono text-neutral-500">S$</span>
                  <input
                    type="number"
                    step={100}
                    value={legalSubsidy}
                    onChange={(e) => setLegalSubsidy(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-6 pr-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-neutral-400">Est. Legal & Valuation Fees</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-mono text-neutral-500">S$</span>
                  <input
                    type="number"
                    step={100}
                    value={fees}
                    onChange={(e) => setFees(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-6 pr-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Metrics Output Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Monthly Installment Comparison */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-1">
          <span className="text-xs text-neutral-400">Monthly Installment</span>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-xs line-through text-neutral-500 font-mono">
              {formatSGDExact(savings.currentMonthlyInstallment)}
            </span>
            <span className="text-lg font-mono font-semibold text-white">
              {formatSGDExact(savings.newMonthlyInstallment)}
            </span>
          </div>
          <span className="text-[11px] text-neutral-500 font-mono block">
            {(currentRate - (benchmarkRate + newMargin)).toFixed(2)}% rate differential
          </span>
        </div>

        {/* Monthly Savings */}
        <div className={`p-4 rounded-lg border ${
          isSaving ? 'bg-emerald-950/20 border-emerald-800/60' : 'bg-neutral-900 border-neutral-800'
        } space-y-1`}>
          <span className="text-xs text-neutral-400">Monthly Cashflow Savings</span>
          <div className="pt-1 text-2xl font-mono font-semibold text-emerald-400">
            {isSaving ? `+${formatSGDExact(savings.monthlySavings)}` : formatSGDExact(savings.monthlySavings)}
          </div>
          <span className="text-[11px] text-neutral-400 font-mono block">
            {formatSGD(savings.annualSavings)} per year
          </span>
        </div>

        {/* 3-Year Lock-In Net Savings */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-1">
          <span className="text-xs text-neutral-400">3-Year Lock-In Net Savings</span>
          <div className="pt-1 text-2xl font-mono font-semibold text-white">
            {formatSGD(savings.threeYearNetSavings)}
          </div>
          <span className="text-[11px] text-neutral-500 font-mono block">
            Includes S${legalSubsidy} bank cash subsidy
          </span>
        </div>

        {/* Break-even timeline */}
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg space-y-1">
          <span className="text-xs text-neutral-400">Break-Even Point</span>
          <div className="pt-1 text-2xl font-mono font-semibold text-neutral-200">
            {savings.breakEvenMonths === 0 ? 'Immediate' : `${savings.breakEvenMonths} Months`}
          </div>
          <span className="text-[11px] text-neutral-500 font-mono block">
            Net switching friction: S${Math.max(0, fees - legalSubsidy)}
          </span>
        </div>
      </div>
    </div>
  );
};
