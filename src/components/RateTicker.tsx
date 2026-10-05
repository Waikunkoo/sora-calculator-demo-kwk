import React from 'react';
import { MASRateRecord, SoraBenchmark } from '../types/sora';
import { Clock, TrendingUp, CheckCircle, Info } from 'lucide-react';

interface RateTickerProps {
  latestRecord: MASRateRecord;
  selectedBenchmark: SoraBenchmark;
  onSelectBenchmark: (benchmark: SoraBenchmark) => void;
  isBackendConnected: boolean;
  rateOverrideActive: boolean;
}

export const RateTicker: React.FC<RateTickerProps> = ({
  latestRecord,
  selectedBenchmark,
  onSelectBenchmark,
  isBackendConnected,
  rateOverrideActive
}) => {
  const benchmarks: { id: SoraBenchmark; label: string; rate: number; subtitle: string }[] = [
    {
      id: '1M_SORA',
      label: '1-Month SORA',
      rate: latestRecord.compounded_1m,
      subtitle: 'Most responsive to rate cuts'
    },
    {
      id: '3M_SORA',
      label: '3-Month SORA',
      rate: latestRecord.compounded_3m,
      subtitle: 'Singapore standard package'
    },
    {
      id: '6M_SORA',
      label: '6-Month SORA',
      rate: latestRecord.compounded_6m,
      subtitle: 'Smoother, longer resets'
    },
    {
      id: 'DAILY_COMPOUNDED',
      label: 'Daily Overnight',
      rate: latestRecord.sora_rate,
      subtitle: 'In-Arrears Lookback base'
    }
  ];

  return (
    <div className="bg-neutral-900 border-b border-neutral-800 text-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Status info line */}
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 text-neutral-300 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              MAS Official Benchmark
            </span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span className="font-mono">Date: {latestRecord.date}</span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span className="hidden sm:inline font-mono">
              Aggregate Volume: S${(latestRecord.aggregate_volume_mil / 1000).toFixed(2)}B
            </span>
            <span aria-hidden="true" className="hidden sm:inline text-neutral-700">·</span>
            <span className="hidden md:flex items-center gap-1 font-mono text-neutral-400">
              <Clock className="w-3 h-3 text-neutral-500" />
              Published 9:00 AM SGT
            </span>
          </div>

          {/* Quick Benchmark selector tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-neutral-400 shrink-0 mr-1 hidden sm:inline">Active Benchmark:</span>
            {benchmarks.map((b) => {
              const isSelected = selectedBenchmark === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => onSelectBenchmark(b.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-all ${
                    isSelected
                      ? 'bg-neutral-800 text-white ring-1 ring-emerald-500/50 shadow-sm'
                      : 'bg-neutral-950/60 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                  }`}
                >
                  <span className="font-medium whitespace-nowrap">{b.label}</span>
                  <span className="font-mono tabular-nums font-semibold text-emerald-400">
                    {b.rate.toFixed(4)}%
                  </span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
