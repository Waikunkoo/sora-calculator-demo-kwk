import React from 'react';
import { PropertyType, SoraBenchmark, LoanConfiguration, MASRateRecord } from '../types/sora';
import { formatSGD, getBenchmarkLabel } from '../utils/soraMath';
import { Building2, Home, Landmark, Briefcase, Sparkles, DollarSign, Percent, ShieldAlert } from 'lucide-react';

interface CalculatorInputsProps {
  config: LoanConfiguration;
  onChange: (newConfig: LoanConfiguration) => void;
  latestRecord: MASRateRecord;
  onApplyPreset: (presetName: string) => void;
}

export const CalculatorInputs: React.FC<CalculatorInputsProps> = ({
  config,
  onChange,
  latestRecord,
  onApplyPreset
}) => {
  const propertyTypes: { id: PropertyType; label: string; icon: React.ReactNode; maxTenure: number; ltvCap: number }[] = [
    { id: 'HDB', label: 'HDB Flat', icon: <Home className="w-3.5 h-3.5" />, maxTenure: 25, ltvCap: 75 },
    { id: 'Private_Condo', label: 'Private Condo', icon: <Building2 className="w-3.5 h-3.5" />, maxTenure: 30, ltvCap: 75 },
    { id: 'Landed', label: 'Landed Home', icon: <Landmark className="w-3.5 h-3.5" />, maxTenure: 35, ltvCap: 75 },
    { id: 'Commercial', label: 'Commercial', icon: <Briefcase className="w-3.5 h-3.5" />, maxTenure: 30, ltvCap: 80 }
  ];

  const handlePropertyTypeChange = (type: PropertyType) => {
    let maxTenure = 30;
    if (type === 'HDB') maxTenure = 25;
    if (type === 'Landed') maxTenure = 35;

    const newTenure = Math.min(config.tenureYears, maxTenure);
    onChange({
      ...config,
      propertyType: type,
      tenureYears: newTenure
    });
  };

  const handleLtvClick = (ltvPct: number) => {
    const calculatedLoan = Math.round((config.propertyValue * ltvPct) / 100);
    onChange({
      ...config,
      loanAmount: calculatedLoan
    });
  };

  const currentBenchmarkRate = config.benchmarkRateOverride !== undefined
    ? config.benchmarkRateOverride
    : (config.selectedBenchmark === '1M_SORA'
        ? latestRecord.compounded_1m
        : config.selectedBenchmark === '3M_SORA'
        ? latestRecord.compounded_3m
        : config.selectedBenchmark === '6M_SORA'
        ? latestRecord.compounded_6m
        : latestRecord.sora_rate);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-6">
      {/* Top Presets Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white">Loan Parameters</span>
          <span className="text-xs text-neutral-400">Singapore MAS Conventions</span>
        </div>
        
        {/* Preset quick buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-neutral-400 mr-1">Presets:</span>
          <button
            onClick={() => onApplyPreset('hdb')}
            className="px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 rounded border border-neutral-700/60 transition-colors"
          >
            HDB 5-Room
          </button>
          <button
            onClick={() => onApplyPreset('condo')}
            className="px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 rounded border border-neutral-700/60 transition-colors"
          >
            Condo S$2.1M
          </button>
          <button
            onClick={() => onApplyPreset('landed')}
            className="px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 rounded border border-neutral-700/60 transition-colors"
          >
            Landed S$4.5M
          </button>
          <button
            onClick={() => onApplyPreset('commercial')}
            className="px-2.5 py-1 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 rounded border border-neutral-700/60 transition-colors"
          >
            Commercial
          </button>
        </div>
      </div>

      {/* Property Type Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-neutral-300">Property Category</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {propertyTypes.map((pt) => {
            const isSelected = config.propertyType === pt.id;
            return (
              <button
                key={pt.id}
                onClick={() => handlePropertyTypeChange(pt.id)}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-md text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-neutral-800 border-emerald-500/80 text-white shadow-sm'
                    : 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                {pt.icon}
                <span>{pt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Property Valuation & Loan Amount Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Property Value */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="text-neutral-300 font-medium">Property Value / Purchase Price</label>
            <span className="font-mono text-neutral-400">{formatSGD(config.propertyValue)}</span>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">S$</span>
            <input
              type="number"
              min={100000}
              step={10000}
              value={config.propertyValue}
              onChange={(e) => {
                const val = Math.max(0, Number(e.target.value));
                // auto adjust loan amount if exceeds 75%
                const maxLoan = Math.round(val * 0.75);
                onChange({
                  ...config,
                  propertyValue: val,
                  loanAmount: config.loanAmount > val ? maxLoan : config.loanAmount
                });
              }}
              className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-sm font-mono tabular-nums text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Loan Amount */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="text-neutral-300 font-medium">Loan Financing Amount</label>
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-emerald-400 font-semibold">
                {((config.loanAmount / (config.propertyValue || 1)) * 100).toFixed(1)}% LTV
              </span>
            </div>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">S$</span>
            <input
              type="number"
              min={50000}
              step={10000}
              value={config.loanAmount}
              onChange={(e) => onChange({ ...config, loanAmount: Math.max(0, Number(e.target.value)) })}
              className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-sm font-mono tabular-nums text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          {/* Quick LTV triggers */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="text-[11px] text-neutral-400">Quick LTV:</span>
            {[55, 70, 75, 80].map((ltv) => (
              <button
                key={ltv}
                onClick={() => handleLtvClick(ltv)}
                className="px-2 py-0.5 text-[11px] font-mono rounded bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/50"
              >
                {ltv}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loan Tenure */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label className="text-neutral-300 font-medium">Loan Tenure</label>
          <span className="font-mono text-emerald-400 font-semibold text-sm">
            {config.tenureYears} Years ({config.tenureYears * 12} Months)
          </span>
        </div>
        <input
          type="range"
          min={5}
          max={config.propertyType === 'HDB' ? 25 : config.propertyType === 'Landed' ? 35 : 30}
          step={1}
          value={config.tenureYears}
          onChange={(e) => onChange({ ...config, tenureYears: Number(e.target.value) })}
          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span>5 yrs</span>
          <span>15 yrs</span>
          <span>20 yrs</span>
          <span>25 yrs (HDB Max)</span>
          <span>30 yrs (Condo)</span>
          {config.propertyType === 'Landed' && <span>35 yrs</span>}
        </div>
      </div>

      {/* SORA Benchmark Package & Spread Settings */}
      <div className="pt-2 border-t border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white">SORA Benchmark & Bank Spread</span>
          <span className="text-xs font-mono text-neutral-400">
            {getBenchmarkLabel(config.selectedBenchmark)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Benchmark selection */}
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-300 font-medium">Benchmark Reference</label>
            <select
              value={config.selectedBenchmark}
              onChange={(e) => onChange({ ...config, selectedBenchmark: e.target.value as SoraBenchmark })}
              className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="1M_SORA">1-Month Compounded SORA ({latestRecord.compounded_1m.toFixed(4)}%)</option>
              <option value="3M_SORA">3-Month Compounded SORA ({latestRecord.compounded_3m.toFixed(4)}%)</option>
              <option value="6M_SORA">6-Month Compounded SORA ({latestRecord.compounded_6m.toFixed(4)}%)</option>
              <option value="DAILY_COMPOUNDED">Daily Overnight SORA In-Arrears ({latestRecord.sora_rate.toFixed(4)}%)</option>
            </select>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
              <span>MAS published rate:</span>
              <span className="font-mono text-neutral-200">{currentBenchmarkRate.toFixed(4)}% p.a.</span>
            </div>
          </div>

          {/* Bank Spread / Margin */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-neutral-300 font-medium">Bank Spread / Margin</label>
              <span className="font-mono text-neutral-200">+{config.bankMargin.toFixed(2)}% p.a.</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step={0.05}
                min={0}
                max={5}
                value={config.bankMargin}
                onChange={(e) => onChange({ ...config, bankMargin: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-md text-sm font-mono tabular-nums text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">% p.a.</span>
            </div>
            <div className="flex items-center gap-1 pt-1">
              <span className="text-[11px] text-neutral-400">Typical:</span>
              {[0.60, 0.70, 0.75, 0.85].map((s) => (
                <button
                  key={s}
                  onClick={() => onChange({ ...config, bankMargin: s })}
                  className="px-1.5 py-0.5 text-[11px] font-mono rounded bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700/50"
                >
                  +{s.toFixed(2)}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rate Override / Simulation Accordion */}
        <div className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-300 font-medium">Benchmark Rate Stress Simulation</span>
            <button
              onClick={() => {
                if (config.benchmarkRateOverride !== undefined) {
                  onChange({ ...config, benchmarkRateOverride: undefined });
                } else {
                  onChange({ ...config, benchmarkRateOverride: currentBenchmarkRate });
                }
              }}
              className="text-xs font-mono text-emerald-400 hover:underline"
            >
              {config.benchmarkRateOverride !== undefined ? 'Reset to MAS Live' : 'Simulate Custom Rate'}
            </button>
          </div>
          {config.benchmarkRateOverride !== undefined && (
            <div className="flex items-center gap-3 pt-1">
              <input
                type="number"
                step={0.05}
                min={0}
                max={15}
                value={config.benchmarkRateOverride}
                onChange={(e) => onChange({ ...config, benchmarkRateOverride: Number(e.target.value) })}
                className="w-32 px-2.5 py-1 text-xs font-mono bg-neutral-900 border border-neutral-700 rounded text-white"
              />
              <span className="text-xs text-neutral-400">Simulating hypothetical SORA rate</span>
            </div>
          )}
        </div>
      </div>

      {/* Hybrid Initial Fixed Period (Optional) */}
      <div className="pt-2 border-t border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-semibold text-white flex items-center gap-2">
              <span>Hybrid Initial Fixed Rate</span>
              <span className="text-[11px] font-normal text-neutral-400">e.g. 2-Year Lock-in Fixed</span>
            </label>
          </div>
          <button
            onClick={() => onChange({ ...config, isHybridFixed: !config.isHybridFixed })}
            className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors ${
              config.isHybridFixed ? 'bg-emerald-600 justify-end' : 'bg-neutral-800 justify-start'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-white block"></span>
          </button>
        </div>

        {config.isHybridFixed && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-neutral-950/60 border border-neutral-800 rounded-md">
            <div className="space-y-1">
              <label className="text-xs text-neutral-300 font-medium">Initial Fixed Rate</label>
              <div className="relative">
                <input
                  type="number"
                  step={0.05}
                  min={0.5}
                  max={10}
                  value={config.hybridFixedRate}
                  onChange={(e) => onChange({ ...config, hybridFixedRate: Number(e.target.value) })}
                  className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-xs font-mono text-white"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">% p.a.</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-neutral-300 font-medium">Fixed Period Duration</label>
              <select
                value={config.hybridFixedDurationMonths}
                onChange={(e) => onChange({ ...config, hybridFixedDurationMonths: Number(e.target.value) })}
                className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-xs text-white"
              >
                <option value={12}>1 Year (12 Months)</option>
                <option value={24}>2 Years (24 Months)</option>
                <option value={36}>3 Years (36 Months)</option>
                <option value={60}>5 Years (60 Months)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* MAS Affordability & Stress Test (TDSR 55% / MSR 30%) */}
      <div className="pt-2 border-t border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white">MAS Affordability & Regulatory Ratios</span>
          <span className="text-xs text-neutral-400 font-mono">TDSR 55% · MSR 30%</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-neutral-300">Gross Monthly Income</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">S$</span>
              <input
                type="number"
                step={500}
                min={1000}
                value={config.monthlyGrossIncome}
                onChange={(e) => onChange({ ...config, monthlyGrossIncome: Math.max(0, Number(e.target.value)) })}
                className="w-full pl-8 pr-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs font-mono text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-300">Other Monthly Debts</label>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">S$</span>
              <input
                type="number"
                step={100}
                min={0}
                value={config.otherMonthlyDebts}
                onChange={(e) => onChange({ ...config, otherMonthlyDebts: Math.max(0, Number(e.target.value)) })}
                className="w-full pl-8 pr-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs font-mono text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-neutral-300">MAS Stress Test Floor</label>
            <div className="relative">
              <input
                type="number"
                step={0.1}
                min={3.0}
                max={8.0}
                value={config.stressTestRate}
                onChange={(e) => onChange({ ...config, stressTestRate: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 bg-neutral-950 border border-neutral-800 rounded text-xs font-mono text-white"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">% p.a.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Prepayment / Extra Repayment Simulator */}
      <div className="pt-2 border-t border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-white flex items-center gap-2">
            <span>Prepayment & Lump Sum Simulator</span>
            <span className="text-[11px] font-normal text-neutral-400">Shorten tenure & save interest</span>
          </label>
          <button
            onClick={() => onChange({
              ...config,
              prepayment: { ...config.prepayment, enabled: !config.prepayment.enabled }
            })}
            className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors ${
              config.prepayment.enabled ? 'bg-emerald-600 justify-end' : 'bg-neutral-800 justify-start'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-white block"></span>
          </button>
        </div>

        {config.prepayment.enabled && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-neutral-950/60 border border-neutral-800 rounded-md">
            <div className="space-y-1">
              <label className="text-xs text-neutral-300">Repayment Type</label>
              <select
                value={config.prepayment.type}
                onChange={(e) => onChange({
                  ...config,
                  prepayment: { ...config.prepayment, type: e.target.value as 'lump_sum' | 'monthly_extra' }
                })}
                className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-xs text-white"
              >
                <option value="lump_sum">One-Time Lump Sum</option>
                <option value="monthly_extra">Recurring Monthly Extra</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-300">Amount (SGD)</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400">S$</span>
                <input
                  type="number"
                  step={1000}
                  min={100}
                  value={config.prepayment.amount}
                  onChange={(e) => onChange({
                    ...config,
                    prepayment: { ...config.prepayment, amount: Math.max(0, Number(e.target.value)) }
                  })}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-xs font-mono text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-neutral-300">Execute on Month</label>
              <input
                type="number"
                min={1}
                max={config.tenureYears * 12}
                value={config.prepayment.startMonth}
                onChange={(e) => onChange({
                  ...config,
                  prepayment: { ...config.prepayment, startMonth: Math.max(1, Number(e.target.value)) }
                })}
                className="w-full px-2.5 py-1.5 bg-neutral-900 border border-neutral-700 rounded text-xs font-mono text-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
