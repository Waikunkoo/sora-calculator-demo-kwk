export type PropertyType = 'HDB' | 'Private_Condo' | 'Landed' | 'Commercial';

export type SoraBenchmark = '1M_SORA' | '3M_SORA' | '6M_SORA' | 'DAILY_COMPOUNDED';

export interface MASRateRecord {
  date: string; // YYYY-MM-DD
  sora_rate: number; // Volume-weighted average overnight rate % p.a. (e.g. 3.2541)
  compounded_1m: number; // 1-month compounded SORA % p.a.
  compounded_3m: number; // 3-month compounded SORA % p.a.
  compounded_6m: number; // 6-month compounded SORA % p.a.
  sora_index: number; // MAS SORA Index
  aggregate_volume_mil: number; // In SGD millions (e.g. 3420)
  highest_transacted?: number;
  lowest_transacted?: number;
  calculation_method: string;
}

export interface LoanConfiguration {
  propertyType: PropertyType;
  propertyValue: number; // SGD
  loanAmount: number; // SGD
  tenureYears: number; // 5 - 35
  selectedBenchmark: SoraBenchmark;
  benchmarkRateOverride?: number; // Optional user override for rate
  bankMargin: number; // % p.a. (e.g. 0.70)
  
  // Hybrid fixed initial period
  isHybridFixed: boolean;
  hybridFixedRate: number; // % p.a. (e.g. 2.50)
  hybridFixedDurationMonths: number; // e.g. 24 or 36 months

  // MAS Regulatory & Affordability Inputs
  monthlyGrossIncome: number; // SGD
  otherMonthlyDebts: number; // SGD (car loans, credit cards, student loans)
  stressTestRate: number; // default 4.0% p.a. per MAS property loan rules

  // Prepayment / Extra repayment
  prepayment: {
    enabled: boolean;
    type: 'lump_sum' | 'monthly_extra';
    amount: number;
    startMonth: number; // Month number when lump sum or extra starts
  };
}

export interface AmortizationMonth {
  month: number;
  year: number;
  monthInYear: number;
  dateStr: string;
  appliedRate: number; // % p.a.
  monthlyPayment: number;
  principalPayment: number;
  interestPayment: number;
  extraPayment: number;
  remainingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

export interface AmortizationYear {
  year: number;
  annualPayment: number;
  annualPrincipal: number;
  annualInterest: number;
  endingBalance: number;
  effectiveRate: number;
}

export interface CalculationResult {
  effectiveRate: number; // % p.a. (SORA + margin or fixed)
  benchmarkRate: number;
  monthlyInstallment: number;
  monthlyInstallmentStressTest: number;
  stressTestRate: number;
  
  totalPrincipal: number;
  totalInterest: number;
  totalCost: number; // Principal + Interest
  
  // MAS Regulatory Compliance
  ltvRatio: number; // % (Loan-to-Value)
  maxAllowedLtv: number; // MAS regulatory cap (e.g. 75% for 1st loan)
  tdsrRatio: number; // Total Debt Servicing Ratio % (cap 55%)
  msrRatio: number | null; // Mortgage Servicing Ratio % (cap 30% for HDB/EC)
  tdsrStatus: 'pass' | 'warning' | 'fail';
  msrStatus: 'pass' | 'warning' | 'fail' | 'not_applicable';
  
  // Schedules
  amortizationSchedule: AmortizationMonth[];
  yearlyBreakdown: AmortizationYear[];
  
  // Payoff details
  actualTenureMonths: number;
  monthsSaved: number;
  interestSaved: number;
}

export interface RefinancingComparison {
  currentLoanBalance: number;
  currentInterestRate: number; // % p.a.
  currentRemainingTenureYears: number;
  currentMonthlyInstallment: number;
  newMonthlyInstallment: number;
  monthlySavings: number;
  annualSavings: number;
  threeYearNetSavings: number;
  legalSubsidy: number; // SGD bank rebate
  valuationAndLegalFees: number; // SGD
  breakEvenMonths: number;
}

export interface BackendIntegrationConfig {
  apiUrl: string;
  useLiveBackend: boolean;
  apiKey?: string;
  lastSyncTime?: string;
  connectionStatus: 'connected' | 'offline' | 'using_cache' | 'error';
  errorMessage?: string;
}
