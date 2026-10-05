import {
  LoanConfiguration,
  CalculationResult,
  AmortizationMonth,
  AmortizationYear,
  RefinancingComparison,
  SoraBenchmark
} from '../types/sora';

/**
 * Calculates standard monthly mortgage payment using the annuity formula
 */
export function calculateMonthlyPayment(principal: number, annualRatePct: number, totalMonths: number): number {
  if (principal <= 0 || totalMonths <= 0) return 0;
  if (annualRatePct <= 0) return principal / totalMonths;

  const monthlyRate = annualRatePct / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, totalMonths);
  return (principal * (monthlyRate * factor)) / (factor - 1);
}

/**
 * Computes full loan metrics, MAS TDSR / MSR compliance, and amortization schedule
 */
export function calculateLoanDetails(
  config: LoanConfiguration,
  benchmarkRate: number
): CalculationResult {
  const effectiveBenchmarkRate = config.benchmarkRateOverride !== undefined 
    ? config.benchmarkRateOverride 
    : benchmarkRate;

  // Floating rate = Benchmark (e.g. 3M SORA) + Bank Margin
  const floatingEffectiveRate = effectiveBenchmarkRate + config.bankMargin;

  // Active rate for initial month
  const initialEffectiveRate = config.isHybridFixed
    ? config.hybridFixedRate
    : floatingEffectiveRate;

  const totalTenureMonths = Math.max(1, Math.round(config.tenureYears * 12));

  // MAS regulatory stress test rate (normally 4.0% p.a. floor)
  const effectiveStressRate = Math.max(config.stressTestRate, floatingEffectiveRate);
  const monthlyInstallmentStressTest = calculateMonthlyPayment(
    config.loanAmount,
    effectiveStressRate,
    totalTenureMonths
  );

  // Initial standard monthly payment
  const initialMonthlyPayment = calculateMonthlyPayment(
    config.loanAmount,
    initialEffectiveRate,
    totalTenureMonths
  );

  // Build month-by-month amortization schedule
  let balance = config.loanAmount;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  const amortizationSchedule: AmortizationMonth[] = [];

  const now = new Date();
  let actualPayoffMonth = totalTenureMonths;

  // If hybrid fixed, recalculate monthly installment when shifting from fixed to floating
  let currentFixedPhase = config.isHybridFixed;
  let currentMonthlyPayment = initialMonthlyPayment;

  for (let m = 1; m <= totalTenureMonths; m++) {
    if (balance <= 0.01) {
      actualPayoffMonth = m - 1;
      break;
    }

    // Determine current interest rate
    let appliedRate = floatingEffectiveRate;
    if (config.isHybridFixed && m <= config.hybridFixedDurationMonths) {
      appliedRate = config.hybridFixedRate;
      currentFixedPhase = true;
    } else {
      if (currentFixedPhase) {
        // Just transitioned from fixed to floating: recalculate standard installment for remaining balance & tenure
        const remainingMonths = totalTenureMonths - m + 1;
        currentMonthlyPayment = calculateMonthlyPayment(balance, appliedRate, remainingMonths);
        currentFixedPhase = false;
      }
      appliedRate = floatingEffectiveRate;
    }

    const monthlyInterestRate = appliedRate / 100 / 12;
    const interestPayment = balance * monthlyInterestRate;

    // Normal scheduled principal
    let scheduledPrincipal = currentMonthlyPayment - interestPayment;
    if (scheduledPrincipal > balance) {
      scheduledPrincipal = balance;
    }

    // Extra prepayment if configured
    let extraPayment = 0;
    if (config.prepayment.enabled) {
      if (config.prepayment.type === 'lump_sum' && m === config.prepayment.startMonth) {
        extraPayment = Math.min(config.prepayment.amount, balance - scheduledPrincipal);
      } else if (config.prepayment.type === 'monthly_extra' && m >= config.prepayment.startMonth) {
        extraPayment = Math.min(config.prepayment.amount, balance - scheduledPrincipal);
      }
    }

    const totalPrincipalThisMonth = scheduledPrincipal + extraPayment;
    balance = Math.max(0, balance - totalPrincipalThisMonth);
    cumulativeInterest += interestPayment;
    cumulativePrincipal += totalPrincipalThisMonth;

    // Format date string for this month
    const monthDate = new Date(now.getFullYear(), now.getMonth() + m, 1);
    const dateStr = monthDate.toLocaleDateString('en-SG', { year: 'numeric', month: 'short' });

    amortizationSchedule.push({
      month: m,
      year: Math.ceil(m / 12),
      monthInYear: ((m - 1) % 12) + 1,
      dateStr,
      appliedRate: Number(appliedRate.toFixed(4)),
      monthlyPayment: Number((scheduledPrincipal + interestPayment).toFixed(2)),
      principalPayment: Number(totalPrincipalThisMonth.toFixed(2)),
      interestPayment: Number(interestPayment.toFixed(2)),
      extraPayment: Number(extraPayment.toFixed(2)),
      remainingBalance: Number(balance.toFixed(2)),
      cumulativeInterest: Number(cumulativeInterest.toFixed(2)),
      cumulativePrincipal: Number(cumulativePrincipal.toFixed(2))
    });

    if (balance <= 0.01) {
      actualPayoffMonth = m;
      break;
    }
  }

  // Yearly aggregates
  const yearlyMap = new Map<number, { principal: number; interest: number; balance: number; rates: number[] }>();
  for (const m of amortizationSchedule) {
    const yr = m.year;
    if (!yearlyMap.has(yr)) {
      yearlyMap.set(yr, { principal: 0, interest: 0, balance: 0, rates: [] });
    }
    const entry = yearlyMap.get(yr)!;
    entry.principal += m.principalPayment;
    entry.interest += m.interestPayment;
    entry.balance = m.remainingBalance;
    entry.rates.push(m.appliedRate);
  }

  const yearlyBreakdown: AmortizationYear[] = Array.from(yearlyMap.entries()).map(([year, val]) => {
    const avgRate = val.rates.reduce((a, b) => a + b, 0) / val.rates.length;
    return {
      year,
      annualPayment: Number((val.principal + val.interest).toFixed(2)),
      annualPrincipal: Number(val.principal.toFixed(2)),
      annualInterest: Number(val.interest.toFixed(2)),
      endingBalance: Number(val.balance.toFixed(2)),
      effectiveRate: Number(avgRate.toFixed(4))
    };
  });

  // Calculate baseline without prepayments for savings delta
  const baselineTotalInterest = (initialMonthlyPayment * totalTenureMonths) - config.loanAmount;
  const interestSaved = Math.max(0, baselineTotalInterest - cumulativeInterest);
  const monthsSaved = Math.max(0, totalTenureMonths - actualPayoffMonth);

  // MAS Regulatory Compliance Calculations
  const ltvRatio = config.propertyValue > 0 ? (config.loanAmount / config.propertyValue) * 100 : 0;
  
  // MAS LTV caps
  let maxAllowedLtv = 75;
  if (config.propertyType === 'Commercial') {
    maxAllowedLtv = 80;
  }

  // Total Debt Servicing Ratio (TDSR)
  // TDSR = (Stress Test Installment + Other Debts) / Gross Monthly Income
  const totalMonthlyCommitments = monthlyInstallmentStressTest + config.otherMonthlyDebts;
  const tdsrRatio = config.monthlyGrossIncome > 0
    ? (totalMonthlyCommitments / config.monthlyGrossIncome) * 100
    : 0;

  let tdsrStatus: 'pass' | 'warning' | 'fail' = 'pass';
  if (tdsrRatio > 55) {
    tdsrStatus = 'fail';
  } else if (tdsrRatio > 50) {
    tdsrStatus = 'warning';
  }

  // Mortgage Servicing Ratio (MSR) - only for HDB properties in Singapore (cap 30%)
  let msrRatio: number | null = null;
  let msrStatus: 'pass' | 'warning' | 'fail' | 'not_applicable' = 'not_applicable';

  if (config.propertyType === 'HDB') {
    msrRatio = config.monthlyGrossIncome > 0
      ? (monthlyInstallmentStressTest / config.monthlyGrossIncome) * 100
      : 0;
    
    if (msrRatio > 30) {
      msrStatus = 'fail';
    } else if (msrRatio > 27) {
      msrStatus = 'warning';
    } else {
      msrStatus = 'pass';
    }
  }

  return {
    effectiveRate: Number(initialEffectiveRate.toFixed(4)),
    benchmarkRate: Number(effectiveBenchmarkRate.toFixed(4)),
    monthlyInstallment: Number(initialMonthlyPayment.toFixed(2)),
    monthlyInstallmentStressTest: Number(monthlyInstallmentStressTest.toFixed(2)),
    stressTestRate: Number(effectiveStressRate.toFixed(2)),
    totalPrincipal: config.loanAmount,
    totalInterest: Number(cumulativeInterest.toFixed(2)),
    totalCost: Number((config.loanAmount + cumulativeInterest).toFixed(2)),
    ltvRatio: Number(ltvRatio.toFixed(1)),
    maxAllowedLtv,
    tdsrRatio: Number(tdsrRatio.toFixed(1)),
    msrRatio: msrRatio !== null ? Number(msrRatio.toFixed(1)) : null,
    tdsrStatus,
    msrStatus,
    amortizationSchedule,
    yearlyBreakdown,
    actualTenureMonths: actualPayoffMonth,
    monthsSaved,
    interestSaved: Number(interestSaved.toFixed(2))
  };
}

/**
 * Calculates refinancing savings comparing an existing loan package with a new SORA loan
 */
export function calculateRefinancingSavings(
  currentBalance: number,
  currentRatePct: number,
  remainingTenureYears: number,
  newSoraRatePct: number,
  bankMarginPct: number,
  legalSubsidy: number = 2000,
  valuationAndLegalFees: number = 2500
): RefinancingComparison {
  const totalMonths = remainingTenureYears * 12;
  const currentMonthly = calculateMonthlyPayment(currentBalance, currentRatePct, totalMonths);
  
  const newEffectiveRate = newSoraRatePct + bankMarginPct;
  const newMonthly = calculateMonthlyPayment(currentBalance, newEffectiveRate, totalMonths);

  const monthlySavings = currentMonthly - newMonthly;
  const annualSavings = monthlySavings * 12;

  // 3-Year Lock-in net savings = (36 months * monthly savings) + Legal Subsidy - Fees
  const threeYearGrossSavings = monthlySavings * 36;
  const netSwitchingCost = valuationAndLegalFees - legalSubsidy;
  const threeYearNetSavings = threeYearGrossSavings - netSwitchingCost;

  const breakEvenMonths = monthlySavings > 0
    ? Math.max(0, Math.ceil(Math.max(0, netSwitchingCost) / monthlySavings))
    : 999;

  return {
    currentLoanBalance: currentBalance,
    currentInterestRate: currentRatePct,
    currentRemainingTenureYears: remainingTenureYears,
    currentMonthlyInstallment: Number(currentMonthly.toFixed(2)),
    newMonthlyInstallment: Number(newMonthly.toFixed(2)),
    monthlySavings: Number(monthlySavings.toFixed(2)),
    annualSavings: Number(annualSavings.toFixed(2)),
    threeYearNetSavings: Number(threeYearNetSavings.toFixed(2)),
    legalSubsidy,
    valuationAndLegalFees,
    breakEvenMonths
  };
}

export function formatSGD(amount: number): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatSGDExact(amount: number): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function getBenchmarkLabel(benchmark: SoraBenchmark): string {
  switch (benchmark) {
    case '1M_SORA':
      return '1-Month Compounded SORA';
    case '3M_SORA':
      return '3-Month Compounded SORA';
    case '6M_SORA':
      return '6-Month Compounded SORA';
    case 'DAILY_COMPOUNDED':
      return 'Daily Overnight SORA (In-Arrears)';
  }
}
