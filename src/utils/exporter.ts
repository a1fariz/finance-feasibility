import { FeasibilityReports } from './finance.ts';

/**
 * Format helper for currency
 */
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
};

/**
 * Exports feasibility report data as CSV spreadsheet format
 */
export function exportToCSV(report: FeasibilityReports, projectName: string) {
  let content = "data:text/csv;charset=utf-8,";
  
  // Title
  content += `FinanceFeasibility Report - ${projectName}\n`;
  content += `Generated Date: ${new Date().toLocaleDateString()}\n\n`;
  
  // Financial Metrics Summary
  content += "KEY METRICS SUMMARY\n";
  content += `Net Present Value (NPV), ${formatCurrency(report.metrics.npv).replace(/,/g, '')}\n`;
  content += `Internal Rate of Return (IRR), ${report.metrics.irr ? report.metrics.irr.toFixed(2) + '%' : 'N/A'}\n`;
  content += `Return on Investment (ROI), ${report.metrics.roi.toFixed(2)}%\n`;
  content += `Payback Period, ${report.metrics.paybackFormatted.replace(/,/g, '')}\n`;
  content += `Hurdle Discount Rate, ${report.inputs.discountRate}%\n`;
  content += `Feasibility Verdict, ${report.metrics.isFeasible ? 'FEASIBLE' : 'MARGINAL/UNFEASIBLE'}\n\n`;
  
  // Input assumptions
  content += "INPUT ASSUMPTIONS\n";
  content += `Capital Outlay, ${report.inputs.investmentCost}\n`;
  content += `Monthly Baseline Revenue, ${report.inputs.monthlyRevenue}\n`;
  content += `Yearly Revenue Growth Rate %, ${report.inputs.growthRate}%\n`;
  content += `Operating Costs Monthly, ${report.inputs.operatingCost}\n`;
  content += `Annual Maintenance costs, ${report.inputs.maintenanceCost}\n`;
  content += `Cost Inflation Rate %, ${report.inputs.inflationRate}%\n`;
  content += `Tax Bracket %, ${report.inputs.taxRate}%\n`;
  content += `Residual Salvage Value, ${report.inputs.residualValue}\n`;
  content += `Useful Depreciation Period, ${report.inputs.depreciationYears} Years\n`;
  content += `Timeline of Analysis, ${report.inputs.analysisYears} Years\n\n`;

  // Income Statement
  content += "INCOME STATEMENT PROJECTIONS\n";
  content += "Year,Revenue,Operating Cost,Maintenance Overhead,EBITDA,Depreciation,EBT,Corporate Tax,Net Income\n";
  report.incomeStatement.forEach(row => {
    content += `${row.year},${row.revenue.toFixed(2)},${row.operatingCost.toFixed(2)},${row.maintenanceCost.toFixed(2)},${row.ebitda.toFixed(2)},${row.depreciation.toFixed(2)},${row.ebt.toFixed(2)},${row.tax.toFixed(2)},${row.netIncome.toFixed(2)}\n`;
  });
  content += "\n";

  // Cash Flow Statement
  content += "CASH FLOW STATEMENT PROJECTIONS\n";
  content += "Year,Operating Cash Flow,Investing Cash Flow,Total Net Cash Flow,Cumulative Cash Flow,Discount Factor,Discounted Cash Flow\n";
  report.cashFlowStatement.forEach(row => {
    content += `${row.year},${row.operatingCashFlow.toFixed(2)},${row.investingCashFlow.toFixed(2)},${row.totalCashFlow.toFixed(2)},${row.cumulativeCashFlow.toFixed(2)},${row.discountFactor.toFixed(4)},${row.discountedCashFlow.toFixed(2)}\n`;
  });
  content += "\n";

  // Balance Sheet Projections  
  content += "BALANCE SHEET PROJECTIONS\n";
  content += "Year,Gross Fixed Assets,Accumulated Depr,Net Fixed Assets,Cumulative Cash,Total Assets,Initial equity capital,Retained Earnings,Total Equity\n";
  report.balanceSheet.forEach(row => {
    content += `${row.year},${row.grossFixedAssets.toFixed(2)},${row.accumulatedDepreciation.toFixed(2)},${row.netFixedAssets.toFixed(2)},${row.cumulativeCash.toFixed(2)},${row.totalAssets.toFixed(2)},${row.initialEquity.toFixed(2)},${row.retainedEarnings.toFixed(2)},${row.totalEquity.toFixed(2)}\n`;
  });
  
  const encodedUri = encodeURI(content);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Feasibility_Report_${projectName.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Trigger print dialog with specific print CSS stylesheet injection to cleanly
 * export the reports panel as a high resolution vector PDF
 */
export function exportToPDF() {
  window.print();
}
