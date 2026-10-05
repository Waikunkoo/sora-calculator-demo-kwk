import React from 'react';
import { Database, Download, RefreshCw, SlidersHorizontal } from 'lucide-react';

interface HeaderProps {
  activeTab: 'calculator' | 'amortization' | 'compounding' | 'refinance' | 'mas_feed';
  setActiveTab: (tab: 'calculator' | 'amortization' | 'compounding' | 'refinance' | 'mas_feed') => void;
  onOpenBackendModal: () => void;
  onExportSchedule: () => void;
  isBackendConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenBackendModal,
  onExportSchedule,
  isBackendConnected
}) => {
  return (
    <header className="border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element Brand Title */}
        <div className="flex items-center gap-3">
          <a href="#" className="flex items-center gap-2 group">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 group-hover:scale-110 transition-transform"></span>
            <span className="text-base sm:text-lg font-semibold tracking-tight text-white">
              SORA Interest Engine
            </span>
          </a>
          <span className="hidden sm:inline-block text-xs text-neutral-500 font-mono">
            SG · MAS Overnight Conventions
          </span>
        </div>

        {/* Zone 2: 4-6 text navigation links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'calculator'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            Loan Calculator
          </button>
          <button
            onClick={() => setActiveTab('amortization')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'amortization'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            Amortization Schedule
          </button>
          <button
            onClick={() => setActiveTab('compounding')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'compounding'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            Compounding Math
          </button>
          <button
            onClick={() => setActiveTab('refinance')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'refinance'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            Refinancing Savings
          </button>
          <button
            onClick={() => setActiveTab('mas_feed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'mas_feed'
                ? 'bg-neutral-800 text-white'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            MAS Rate Archive
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBackendModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-md transition-colors"
            title="Configure MAS Backend Integration"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">MAS Integration</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-emerald-400' : 'bg-neutral-400'}`} />
          </button>
          <button
            onClick={onExportSchedule}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="flex md:hidden overflow-x-auto border-t border-neutral-800 px-4 py-2 gap-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded font-medium ${
            activeTab === 'calculator' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
          }`}
        >
          Calculator
        </button>
        <button
          onClick={() => setActiveTab('amortization')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded font-medium ${
            activeTab === 'amortization' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
          }`}
        >
          Amortization
        </button>
        <button
          onClick={() => setActiveTab('compounding')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded font-medium ${
            activeTab === 'compounding' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
          }`}
        >
          Compounding Math
        </button>
        <button
          onClick={() => setActiveTab('refinance')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded font-medium ${
            activeTab === 'refinance' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
          }`}
        >
          Refinance
        </button>
        <button
          onClick={() => setActiveTab('mas_feed')}
          className={`px-2.5 py-1 text-xs whitespace-nowrap rounded font-medium ${
            activeTab === 'mas_feed' ? 'bg-neutral-800 text-white' : 'text-neutral-400'
          }`}
        >
          MAS Rates
        </button>
      </div>
    </header>
  );
};
