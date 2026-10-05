import React, { useState } from 'react';
import { CalculationResult } from '../types/sora';
import { formatSGD, formatSGDExact } from '../utils/soraMath';
import { Download, Search, ChevronRight, Calendar, BarChart3, ListFilter } from 'lucide-react';

interface AmortizationScheduleProps {
  result: CalculationResult;
  onExportCSV: () => void;
}

export const AmortizationSchedule: React.FC<AmortizationScheduleProps> = ({
  result,
  onExportCSV
}) => {
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState<number | 'all'>('all');

  const { yearlyBreakdown, amortizationSchedule } = result;

  // Filtered monthly records
  const filteredMonths = amortizationSchedule.filter((m) => {
    if (selectedYearFilter !== 'all' && m.year !== selectedYearFilter) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        m.dateStr.toLowerCase().includes(term) ||
        m.year.toString().includes(term) ||
        m.month.toString().includes(term)
      );
    }
    return true;
  });

  // Chart helpers: calculate max yearly payment for bar scaling
  const maxAnnualPayment = Math.max(...yearlyBreakdown.map((y) => y.annualPayment), 1);
  const initialPrincipal = result.totalPrincipal;

  return (
    <div className="space-y-6">
      {/* Visual Chart Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-white">Loan Amortization Curve & Payment Trajectory</span>
            <p className="text-xs text-neutral-400">
              Annual Principal vs Interest allocation and balance reduction over tenure
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-neutral-300">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
              Principal Repaid
            </span>
            <span className="flex items-center gap-1.5 text-neutral-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-neutral-600"></span>
              Interest Paid
            </span>
            <span className="flex items-center gap-1.5 text-neutral-400">
              <span className="w-3 h-0.5 bg-amber-400"></span>
              Loan Balance
            </span>
          </div>
        </div>

        {/* SVG Curve Chart */}
        <div className="h-48 sm:h-56 w-full pt-4">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="20" x2="1000" y2="20" stroke="#262626" strokeDasharray="4 4" strokeWidth="1" />
            <line x1="0" y1="80" x2="1000" y2="80" stroke="#262626" strokeDasharray="4 4" strokeWidth="1" />
            <line x1="0" y1="140" x2="1000" y2="140" stroke="#262626" strokeDasharray="4 4" strokeWidth="1" />
            <line x1="0" y1="190" x2="1000" y2="190" stroke="#404040" strokeWidth="1" />

            {/* Bars for each year */}
            {yearlyBreakdown.map((y, index) => {
              const x = (index / Math.max(yearlyBreakdown.length - 1, 1)) * 940 + 30;
              const barWidth = Math.max(12, Math.min(26, 800 / yearlyBreakdown.length));

              const principalHeight = (y.annualPrincipal / maxAnnualPayment) * 150;
              const interestHeight = (y.annualInterest / maxAnnualPayment) * 150;

              return (
                <g key={y.year} className="group cursor-pointer">
                  {/* Interest portion (bottom) */}
                  <rect
                    x={x - barWidth / 2}
                    y={190 - interestHeight}
                    width={barWidth}
                    height={interestHeight}
                    fill="#525252"
                    rx="1"
                    className="group-hover:fill-neutral-400 transition-colors"
                  />
                  {/* Principal portion (stacked above interest) */}
                  <rect
                    x={x - barWidth / 2}
                    y={190 - interestHeight - principalHeight}
                    width={barWidth}
                    height={principalHeight}
                    fill="#10b981"
                    rx="1"
                    className="group-hover:fill-emerald-400 transition-colors"
                  />
                </g>
              );
            })}

            {/* Balance line path */}
            {yearlyBreakdown.length > 1 && (
              <polyline
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={yearlyBreakdown
                  .map((y, idx) => {
                    const x = (idx / (yearlyBreakdown.length - 1)) * 940 + 30;
                    const yPos = 190 - (y.endingBalance / (initialPrincipal || 1)) * 160;
                    return `${x},${yPos}`;
                  })
                  .join(' ')}
              />
            )}
          </svg>
        </div>

        <div className="flex items-center justify-between text-xs text-neutral-500 font-mono pt-1">
          <span>Year 1 ({formatSGD(initialPrincipal)} initial)</span>
          <span>Mid Tenure (Year {Math.round(yearlyBreakdown.length / 2)})</span>
          <span>Year {yearlyBreakdown.length} (SGD 0 Payoff)</span>
        </div>
      </div>

      {/* Amortization Table Card */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 space-y-4">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          {/* View mode toggle */}
          <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-md border border-neutral-800">
            <button
              onClick={() => setViewMode('yearly')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'yearly'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Annual Summary ({yearlyBreakdown.length} Yrs)
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Monthly Breakdown ({amortizationSchedule.length} Mos)
            </button>
          </div>

          {/* Search and Year filter */}
          <div className="flex items-center gap-2">
            {viewMode === 'monthly' && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedYearFilter}
                  onChange={(e) => setSelectedYearFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="px-2.5 py-1 text-xs bg-neutral-950 border border-neutral-800 rounded text-neutral-300"
                >
                  <option value="all">All Years</option>
                  {yearlyBreakdown.map((y) => (
                    <option key={y.year} value={y.year}>Year {y.year}</option>
                  ))}
                </select>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search month/date..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1 text-xs bg-neutral-950 border border-neutral-800 rounded text-neutral-200 w-36 sm:w-44 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <button
              onClick={onExportCSV}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Yearly Summary Table */}
        {viewMode === 'yearly' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-950 text-neutral-400 border-b border-neutral-800">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Year</th>
                  <th className="px-3 py-2.5 font-medium text-right">Avg Rate</th>
                  <th className="px-3 py-2.5 font-medium text-right">Annual Payment</th>
                  <th className="px-3 py-2.5 font-medium text-right text-emerald-400">Principal</th>
                  <th className="px-3 py-2.5 font-medium text-right text-neutral-300">Interest</th>
                  <th className="px-3 py-2.5 font-medium text-right">Ending Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850 text-neutral-300">
                {yearlyBreakdown.map((row) => (
                  <tr key={row.year} className="hover:bg-neutral-850/50">
                    <td className="px-3 py-2 font-semibold text-white">Year {row.year}</td>
                    <td className="px-3 py-2 text-right">{row.effectiveRate.toFixed(4)}%</td>
                    <td className="px-3 py-2 text-right text-white font-medium">
                      {formatSGDExact(row.annualPayment)}
                    </td>
                    <td className="px-3 py-2 text-right text-emerald-400">
                      {formatSGDExact(row.annualPrincipal)}
                    </td>
                    <td className="px-3 py-2 text-right text-neutral-400">
                      {formatSGDExact(row.annualInterest)}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-white">
                      {formatSGDExact(row.endingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Monthly Table */
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-950 text-neutral-400 sticky top-0 border-b border-neutral-800">
                <tr>
                  <th className="px-3 py-2.5 font-medium">Month</th>
                  <th className="px-3 py-2.5 font-medium">Date</th>
                  <th className="px-3 py-2.5 font-medium text-right">Rate</th>
                  <th className="px-3 py-2.5 font-medium text-right">Payment</th>
                  <th className="px-3 py-2.5 font-medium text-right text-emerald-400">Principal</th>
                  <th className="px-3 py-2.5 font-medium text-right text-neutral-300">Interest</th>
                  {result.interestSaved > 0 && (
                    <th className="px-3 py-2.5 font-medium text-right text-amber-400">Prepayment</th>
                  )}
                  <th className="px-3 py-2.5 font-medium text-right">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-850 text-neutral-300">
                {filteredMonths.map((m) => (
                  <tr key={m.month} className="hover:bg-neutral-850/50">
                    <td className="px-3 py-1.5 font-semibold text-white">M{m.month}</td>
                    <td className="px-3 py-1.5 text-neutral-400">{m.dateStr}</td>
                    <td className="px-3 py-1.5 text-right">{m.appliedRate.toFixed(4)}%</td>
                    <td className="px-3 py-1.5 text-right text-white">
                      {formatSGDExact(m.monthlyPayment)}
                    </td>
                    <td className="px-3 py-1.5 text-right text-emerald-400">
                      {formatSGDExact(m.principalPayment)}
                    </td>
                    <td className="px-3 py-1.5 text-right text-neutral-400">
                      {formatSGDExact(m.interestPayment)}
                    </td>
                    {result.interestSaved > 0 && (
                      <td className="px-3 py-1.5 text-right text-amber-400">
                        {m.extraPayment > 0 ? formatSGDExact(m.extraPayment) : '—'}
                      </td>
                    )}
                    <td className="px-3 py-1.5 text-right font-medium text-white">
                      {formatSGDExact(m.remainingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
