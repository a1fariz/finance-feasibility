/**
 * Financial feasibility calculators for FinanceFeasibility
 */

export interface FinancialInputs {
  investmentCost: number;
  monthlyRevenue: number;
  growthRate: number;      // Revenue annual growth rate as % (e.g., 5.0)
  inflationRate: number;   // Expense annual inflation rate as % (e.g., 2.5)
  maintenanceCost: number; // Annual maintenance fee
  operatingCost: number;   // Monthly operating cost (salaries, utility)
  taxRate: number;         // Tax rate as % (e.g., 20.0)
  residualValue: number;   // Residual/salvage value at the end of lifecycle
  depreciationYears: number; // Straight-line depreciation period in years
  discountRate: number;    // Discount rate or cost of capital as % (e.g., 10.0)
  analysisYears: number;   // Total timeline of analysis in years (e.g., 5)
}

export interface IncomeStatementRow {
  year: number;
  revenue: number;
  operatingCost: number;
  maintenanceCost: number;
  ebitda: number;
  depreciation: number;
  ebt: number;
  tax: number;
  netIncome: number;
}

export interface BalanceSheetRow {
  year: number;
  grossFixedAssets: number;
  accumulatedDepreciation: number;
  netFixedAssets: number;
  cumulativeCash: number;
  totalAssets: number;
  initialEquity: number;
  retainedEarnings: number; // cumulative net income
  totalEquity: number;
}

export interface CashFlowRow {
  year: number;
  operatingCashFlow: number; // NetIncome + Depreciation
  investingCashFlow: number; // -Investment (Year 0), +Residual (Year N)
  totalCashFlow: number;
  cumulativeCashFlow: number;
  discountFactor: number;
  discountedCashFlow: number;
}

export interface SensitivityDataPoint {
  changePercent: number; // e.g. -20, -10, 0, 10, 20
  revenueNPV: number;
  expenseNPV: number;
  inflationNPV: number;
}

export interface FeasibilityReports {
  inputs: FinancialInputs;
  incomeStatement: IncomeStatementRow[];
  balanceSheet: BalanceSheetRow[];
  cashFlowStatement: CashFlowRow[];
  metrics: {
    npv: number;
    irr: number | null;
    roi: number;
    paybackPeriodYears: number;
    paybackPeriodMonths: number;
    paybackFormatted: string;
    isFeasible: boolean;
  };
  depreciationSchedule: { year: number; amount: number; bookValue: number }[];
  sensitivityAnalysis: SensitivityDataPoint[];
}

/**
 * Perform bisection method to find the Internal Rate of Return (IRR)
 */
export function calculateIRR(initialInvestment: number, cashFlows: number[]): number | null {
  let low = -0.99;
  let high = 15.0;
  const tol = 1e-6;
  const maxIterations = 150;
  
  // Quick safety check: do we have both inflows and outflows?
  let hasPositive = false;
  let hasNegative = initialInvestment > 0;
  for (const f of cashFlows) {
    if (f > 0) hasPositive = true;
    if (f < 0) hasNegative = true;
  }
  if (!hasPositive || !hasNegative) return null;

  const npv = (rate: number) => {
    let val = -initialInvestment;
    for (let i = 0; i < cashFlows.length; i++) {
      val += cashFlows[i] / Math.pow(1 + rate, i + 1);
    }
    return val;
  };

  let fLow = npv(low);
  let fHigh = npv(high);

  if (fLow * fHigh > 0) {
    // If rate could be higher than 1500%, let's check or bail
    if (fLow < 0) return null; // Even with -99% rate, NPV is negative
    // Expand high if necessary
    let expanded = false;
    for (let h = 15.0; h <= 100.0; h += 10.0) {
      if (npv(h) < 0) {
        high = h;
        fHigh = npv(h);
        expanded = true;
        break;
      }
    }
    if (!expanded) return null;
  }

  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;
    const fMid = npv(mid);
    
    if (Math.abs(fMid) < tol) {
      return mid * 100;
    }
    
    if (fLow * fMid < 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }
  
  return ((low + high) / 2) * 100;
}

/**
 * Calculates straight line depreciation schedule
 */
export function calculateDepreciation(investmentCost: number, residualValue: number, usefulLife: number, maxYears: number) {
  const depreciationAmount = usefulLife > 0 ? (investmentCost - residualValue) / usefulLife : 0;
  const schedule: { year: number; amount: number; bookValue: number }[] = [];
  
  let currentBookValue = investmentCost;
  for (let t = 1; t <= maxYears; t++) {
    const amount = t <= usefulLife ? depreciationAmount : 0;
    currentBookValue = Math.max(residualValue, currentBookValue - amount);
    schedule.push({ year: t, amount, bookValue: currentBookValue });
  }
  return { annualAmount: depreciationAmount, schedule };
}

/**
 * Comprehensive Feasibility Report Calculator
 */
export function generateFeasibilityReport(inputs: FinancialInputs): FeasibilityReports {
  const {
    investmentCost,
    monthlyRevenue,
    growthRate,
    inflationRate,
    maintenanceCost,
    operatingCost,
    taxRate,
    residualValue,
    depreciationYears,
    discountRate,
    analysisYears
  } = inputs;

  const r = discountRate / 100;
  const g = growthRate / 100;
  const inf = inflationRate / 100;
  const tRate = taxRate / 100;

  // 1. Depreciation Schedule
  const dSched = calculateDepreciation(investmentCost, residualValue, depreciationYears, analysisYears);
  
  // 2. Income Statement
  const incomeStatement: IncomeStatementRow[] = [];
  let cumNetIncome = 0;
  
  for (let t = 1; t <= analysisYears; t++) {
    const revenue = (monthlyRevenue * 12) * Math.pow(1 + g, t - 1);
    const opCost = (operatingCost * 12) * Math.pow(1 + inf, t - 1);
    const maint = maintenanceCost * Math.pow(1 + inf, t - 1);
    const ebitda = revenue - opCost - maint;
    
    const depRow = dSched.schedule.find(s => s.year === t);
    const depreciation = depRow ? depRow.amount : 0;
    
    const ebt = ebitda - depreciation;
    const tax = ebt > 0 ? ebt * tRate : 0;
    const netIncome = ebt - tax;
    
    cumNetIncome += netIncome;
    incomeStatement.push({
      year: t,
      revenue,
      operatingCost: opCost,
      maintenanceCost: maint,
      ebitda,
      depreciation,
      ebt,
      tax,
      netIncome,
    });
  }

  // 3. Cash Flow Projections
  const cashFlowStatement: CashFlowRow[] = [];
  const cashFlowsForIRR: number[] = [];
  let cumCashFlow = -investmentCost;
  
  // Year 0 row
  cashFlowStatement.push({
    year: 0,
    operatingCashFlow: 0,
    investingCashFlow: -investmentCost,
    totalCashFlow: -investmentCost,
    cumulativeCashFlow: -investmentCost,
    discountFactor: 1.0,
    discountedCashFlow: -investmentCost
  });

  for (let t = 1; t <= analysisYears; t++) {
    const row = incomeStatement[t - 1];
    const operatingCF = row.netIncome + row.depreciation;
    
    // final year receives residual/salvage value
    const investingCF = t === analysisYears ? residualValue : 0;
    const totalCF = operatingCF + investingCF;
    cumCashFlow += totalCF;
    
    cashFlowsForIRR.push(totalCF);
    
    const df = 1 / Math.pow(1 + r, t);
    const dcf = totalCF * df;
    
    cashFlowStatement.push({
      year: t,
      operatingCashFlow: operatingCF,
      investingCashFlow: investingCF,
      totalCashFlow: totalCF,
      cumulativeCashFlow: cumCashFlow,
      discountFactor: df,
      discountedCashFlow: dcf
    });
  }

  // 4. Balance Sheet
  const balanceSheet: BalanceSheetRow[] = [];
  let cumulativeCash = 0;
  
  // Year 0 Balance Sheet
  balanceSheet.push({
    year: 0,
    grossFixedAssets: investmentCost,
    accumulatedDepreciation: 0,
    netFixedAssets: investmentCost,
    cumulativeCash: 0,
    totalAssets: investmentCost,
    initialEquity: investmentCost,
    retainedEarnings: 0,
    totalEquity: investmentCost
  });

  for (let t = 1; t <= analysisYears; t++) {
    const row = incomeStatement[t - 1];
    const depRow = dSched.schedule.find(s => s.year === t);
    const netCF = cashFlowStatement.find(cf => cf.year === t)?.totalCashFlow || 0;
    
    // Cumulative cash is the net cash flow after paying the original investment
    // Since Year 0 has investment of -investmentCost, we add Net Operating Cash Flow
    // Cash balance of the isolated project accumulates year by year:
    const opCF = row.netIncome + row.depreciation;
    cumulativeCash += opCF;
    if (t === analysisYears) {
      cumulativeCash += residualValue;
    }
    
    const accDep = dSched.schedule
      .filter(s => s.year <= t)
      .reduce((sum, s) => sum + s.amount, 0);
      
    const netFixedAssets = Math.max(residualValue, investmentCost - accDep);
    const totalAssets = netFixedAssets + cumulativeCash;
    
    const retainedEarn = incomeStatement
      .filter(s => s.year <= t)
      .reduce((sum, s) => sum + s.netIncome, 0);
      
    // Balance Sheet balances: Total Equity = Initial Capital + Retained Earnings
    // Wait, on Year N we sold Assets for Residual Value. Net Fixed Assets becomes Residual Value or 0 depending on sale.
    // Let's ensure Balance Sheet balances:
    const initialEquity = investmentCost;
    const totalEquity = initialEquity + retainedEarn;

    balanceSheet.push({
      year: t,
      grossFixedAssets: investmentCost,
      accumulatedDepreciation: accDep,
      netFixedAssets,
      cumulativeCash,
      totalAssets,
      initialEquity,
      retainedEarnings: retainedEarn,
      totalEquity
    });
  }

  // 5. Calculations for Feasibility Metrics
  // Net Present Value (NPV)
  const npv = cashFlowStatement.reduce((sum, row) => sum + row.discountedCashFlow, 0);
  
  // Internal Rate of Return (IRR)
  const irr = calculateIRR(investmentCost, cashFlowsForIRR);
  
  // ROI
  const roi = (cumNetIncome / investmentCost) * 100;
  
  // Payback Period (Break even month and year)
  let paybackPeriodYears = -1;
  let paybackPeriodMonths = -1;
  let paybackFormatted = "Does not break even";
  
  for (let t = 1; t <= analysisYears; t++) {
    const prevCum = cashFlowStatement[t].cumulativeCashFlow;
    const prevYearCum = cashFlowStatement[t - 1].cumulativeCashFlow;
    
    // Check if it crossed 0
    if (prevYearCum < 0 && prevCum >= 0) {
      const yearFraction = -prevYearCum / (cashFlowStatement[t].totalCashFlow);
      const exactMonths = yearFraction * 12;
      paybackPeriodYears = t - 1;
      paybackPeriodMonths = Math.round(exactMonths);
      
      if (paybackPeriodMonths === 12) {
        paybackPeriodYears += 1;
        paybackPeriodMonths = 0;
      }
      
      const yrText = paybackPeriodYears === 1 ? "1 Year" : `${paybackPeriodYears} Years`;
      const moText = paybackPeriodMonths === 1 ? "1 Month" : `${paybackPeriodMonths} Months`;
      
      paybackFormatted = paybackPeriodMonths === 0 ? yrText : `${yrText}, ${moText}`;
      break;
    } else if (prevCum >= 0 && t === 1) {
      // already broke even in Year 1!
      paybackPeriodYears = 0;
      paybackPeriodMonths = Math.round((investmentCost / cashFlowStatement[1].totalCashFlow) * 12);
      const moText = paybackPeriodMonths === 1 ? "1 Month" : `${paybackPeriodMonths} Months`;
      paybackFormatted = `${moText}`;
      break;
    }
  }

  const isFeasible = npv > 0 && (irr === null || irr > discountRate);

  // 6. Sensitivity Analysis
  // Test impact of -20%, -10%, 0%, 10%, 20% on: Revenue changes, Expense changes, Inflation changes
  const sensitivityAnalysis: SensitivityDataPoint[] = [];
  const changes = [-20, -10, 0, 10, 20];
  
  for (const p of changes) {
    const factor = 1 + p / 100;
    
    // Revenue Sensitivity
    const revInputs = { ...inputs, monthlyRevenue: monthlyRevenue * factor };
    const revNpv = generateReportNPVOnly(revInputs);
    
    // Expense Sensitivity (Operating Cost and Maintenance Cost modified by factor)
    const expInputs = { 
      ...inputs, 
      operatingCost: operatingCost * factor,
      maintenanceCost: maintenanceCost * factor 
    };
    const expNpv = generateReportNPVOnly(expInputs);
    
    // Inflation Sensitivity
    const infInputs = { ...inputs, inflationRate: inflationRate * factor };
    const infNpv = generateReportNPVOnly(infInputs);
    
    sensitivityAnalysis.push({
      changePercent: p,
      revenueNPV: revNpv,
      expenseNPV: expNpv,
      inflationNPV: infNpv
    });
  }

  return {
    inputs,
    incomeStatement,
    balanceSheet,
    cashFlowStatement,
    metrics: {
      npv,
      irr,
      roi,
      paybackPeriodYears,
      paybackPeriodMonths,
      paybackFormatted,
      isFeasible
    },
    depreciationSchedule: dSched.schedule,
    sensitivityAnalysis
  };
}

/**
 * Stripped down fast NPV calculator helper for Sensitivity analysis
 */
function generateReportNPVOnly(inputs: FinancialInputs): number {
  const {
    investmentCost,
    monthlyRevenue,
    growthRate,
    inflationRate,
    maintenanceCost,
    operatingCost,
    taxRate,
    residualValue,
    depreciationYears,
    discountRate,
    analysisYears
  } = inputs;

  const r = discountRate / 100;
  const g = growthRate / 100;
  const inf = inflationRate / 100;
  const tRate = taxRate / 100;
  
  const annualDep = depreciationYears > 0 ? (investmentCost - residualValue) / depreciationYears : 0;
  let npv = -investmentCost;

  for (let t = 1; t <= analysisYears; t++) {
    const revenue = (monthlyRevenue * 12) * Math.pow(1 + g, t - 1);
    const opCost = (operatingCost * 12) * Math.pow(1 + inf, t - 1);
    const maint = maintenanceCost * Math.pow(1 + inf, t - 1);
    const ebitda = revenue - opCost - maint;
    
    const depreciation = t <= depreciationYears ? annualDep : 0;
    const ebt = ebitda - depreciation;
    const tax = ebt > 0 ? ebt * tRate : 0;
    const netIncome = ebt - tax;
    
    const operatingCF = netIncome + depreciation;
    const investingCF = t === analysisYears ? residualValue : 0;
    const totalCF = operatingCF + investingCF;
    
    npv += totalCF / Math.pow(1 + r, t);
  }

  return npv;
}
