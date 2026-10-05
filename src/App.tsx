/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  LoanConfiguration,
  CalculationResult,
  SoraBenchmark,
  BackendIntegrationConfig,
  MASRateRecord
} from './types/sora';
import {
  MAS_SORA_HISTORICAL,
  DEFAULT_INTEGRATION_CONFIG,
  getLatestMASRate,
  getBenchmarkRate,
  fetchMASRatesFromBackend
} from './services/masService';
import { calculateLoanDetails } from './utils/soraMath';
import { Header } from './components/Header';
import { RateTicker } from './components/RateTicker';
import { CalculatorInputs } from './components/CalculatorInputs';
import { ResultsOverview } from './components/ResultsOverview';
import { AmortizationSchedule } from './components/AmortizationSchedule';
import { CompoundingExplainer } from './components/CompoundingExplainer';
import { RefinancingComparison } from './components/RefinancingComparison';
import { MasRatesFeed } from './components/MasRatesFeed';

export default function App() {
  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    'calculator' | 'amortization' | 'compounding' | 'refinance' | 'mas_feed'
  >('calculator');

  // Backend Integration State
  const [integrationConfig, setIntegrationConfig] = useState<BackendIntegrationConfig>(() => {
    const saved = localStorage.getItem('sora_backend_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_INTEGRATION_CONFIG;
  });

  const [ratesList, setRatesList] = useState<MASRateRecord[]>(MAS_SORA_HISTORICAL);
  const [isBackendLoading, setIsBackendLoading] = useState<boolean>(false);

  // Default Singapore Loan Configuration
  const [config, setConfig] = useState<LoanConfiguration>({
    propertyType: 'Private_Condo',
    propertyValue: 1800000,
    loanAmount: 1350000, // 75% standard Singapore LTV
    tenureYears: 30,
    selectedBenchmark: '3M_SORA',
    bankMargin: 0.70,
    isHybridFixed: false,
    hybridFixedRate: 2.60,
    hybridFixedDurationMonths: 24,
    monthlyGrossIncome: 18000,
    otherMonthlyDebts: 800,
    stressTestRate: 4.00,
    prepayment: {
      enabled: false,
      type: 'lump_sum',
      amount: 50000,
      startMonth: 24
    }
  });

  // Save backend config changes to localStorage
  useEffect(() => {
    localStorage.setItem('sora_backend_config', JSON.stringify(integrationConfig));
  }, [integrationConfig]);

  // Handle testing/connecting to backend
  const handleTestBackend = async () => {
    setIsBackendLoading(true);
    const { rates, status, message } = await fetchMASRatesFromBackend(integrationConfig);
    setRatesList(rates);
    setIntegrationConfig((prev) => ({
      ...prev,
      connectionStatus: status,
      errorMessage: message,
      lastSyncTime: new Date().toLocaleDateString('en-SG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }));
    setIsBackendLoading(false);
  };

  // Derive latest record and benchmark rate
  const latestRecord = ratesList[0] || getLatestMASRate();
  const benchmarkRate = getBenchmarkRate(latestRecord, config.selectedBenchmark);

  // Recalculate loan results reactively
  const calculationResult: CalculationResult = useMemo(() => {
    return calculateLoanDetails(config, benchmarkRate);
  }, [config, benchmarkRate]);

  // Quick Preset handler
  const handleApplyPreset = (presetName: string) => {
    switch (presetName) {
      case 'hdb':
        setConfig((prev) => ({
          ...prev,
          propertyType: 'HDB',
          propertyValue: 650000,
          loanAmount: 487500, // 75%
          tenureYears: 25,
          selectedBenchmark: '3M_SORA',
          bankMargin: 0.65,
          monthlyGrossIncome: 9500,
          otherMonthlyDebts: 300,
          isHybridFixed: false
        }));
        break;
      case 'condo':
        setConfig((prev) => ({
          ...prev,
          propertyType: 'Private_Condo',
          propertyValue: 2100000,
          loanAmount: 1575000, // 75%
          tenureYears: 30,
          selectedBenchmark: '3M_SORA',
          bankMargin: 0.70,
          monthlyGrossIncome: 22000,
          otherMonthlyDebts: 1000,
          isHybridFixed: false
        }));
        break;
      case 'landed':
        setConfig((prev) => ({
          ...prev,
          propertyType: 'Landed',
          propertyValue: 4500000,
          loanAmount: 3375000, // 75%
          tenureYears: 30,
          selectedBenchmark: '1M_SORA',
          bankMargin: 0.60,
          monthlyGrossIncome: 45000,
          otherMonthlyDebts: 2500,
          isHybridFixed: false
        }));
        break;
      case 'commercial':
        setConfig((prev) => ({
          ...prev,
          propertyType: 'Commercial',
          propertyValue: 3200000,
          loanAmount: 2560000, // 80%
          tenureYears: 25,
          selectedBenchmark: '3M_SORA',
          bankMargin: 0.85,
          monthlyGrossIncome: 35000,
          otherMonthlyDebts: 2000,
          isHybridFixed: false
        }));
        break;
    }
  };

  // Export Amortization Schedule to CSV
  const handleExportCSV = () => {
    const headers = [
      'Month',
      'Year',
      'Date',
      'Effective_Rate_Pct',
      'Monthly_Payment_SGD',
      'Principal_Payment_SGD',
      'Interest_Payment_SGD',
      'Prepayment_SGD',
      'Remaining_Balance_SGD',
      'Cumulative_Interest_SGD'
    ];

    const rows = calculationResult.amortizationSchedule.map((m) => [
      m.month,
      m.year,
      `"${m.dateStr}"`,
      m.appliedRate,
      m.monthlyPayment,
      m.principalPayment,
      m.interestPayment,
      m.extraPayment,
      m.remainingBalance,
      m.cumulativeInterest
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `SORA_Loan_Amortization_${config.propertyType}_${config.tenureYears}Y.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBackendModal={() => setActiveTab('mas_feed')}
        onExportSchedule={handleExportCSV}
        isBackendConnected={integrationConfig.connectionStatus === 'connected'}
      />

      {/* Published Rate Ticker Bar */}
      <RateTicker
        latestRecord={latestRecord}
        selectedBenchmark={config.selectedBenchmark}
        onSelectBenchmark={(benchmark: SoraBenchmark) =>
          setConfig({ ...config, selectedBenchmark: benchmark })
        }
        isBackendConnected={integrationConfig.connectionStatus === 'connected'}
        rateOverrideActive={config.benchmarkRateOverride !== undefined}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Loan Inputs (7 cols on desktop) */}
            <div className="lg:col-span-7">
              <CalculatorInputs
                config={config}
                onChange={setConfig}
                latestRecord={latestRecord}
                onApplyPreset={handleApplyPreset}
              />
            </div>

            {/* Right Column: Results & MAS Affordability (5 cols on desktop) */}
            <div className="lg:col-span-5">
              <ResultsOverview
                result={calculationResult}
                config={config}
                onViewSchedule={() => setActiveTab('amortization')}
                onViewRefinance={() => setActiveTab('refinance')}
              />
            </div>
          </div>
        )}

        {activeTab === 'amortization' && (
          <AmortizationSchedule
            result={calculationResult}
            onExportCSV={handleExportCSV}
          />
        )}

        {activeTab === 'compounding' && (
          <CompoundingExplainer
            latestRecord={latestRecord}
            historicalRates={ratesList}
          />
        )}

        {activeTab === 'refinance' && (
          <RefinancingComparison
            defaultLoanAmount={config.loanAmount}
            defaultTenureYears={config.tenureYears}
            latestRecord={latestRecord}
            selectedBenchmark={config.selectedBenchmark}
            currentBankMargin={config.bankMargin}
          />
        )}

        {activeTab === 'mas_feed' && (
          <MasRatesFeed
            rates={ratesList}
            integrationConfig={integrationConfig}
            onUpdateConfig={setIntegrationConfig}
            onTestBackend={handleTestBackend}
            isLoading={isBackendLoading}
          />
        )}
      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-950 py-6 mt-12 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>SORA Interest Engine</span>
            <span aria-hidden="true">·</span>
            <span>Singapore Monetary Authority Benchmark Standards</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span>Actual/365 SGD Day Count</span>
            <span aria-hidden="true">·</span>
            <span>TDSR 55% & MSR 30% Compliant</span>
            <span aria-hidden="true">·</span>
            <span>MAS Stress Test Floor 4.0%</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
