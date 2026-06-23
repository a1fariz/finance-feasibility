import React, { useState } from 'react';
import { FeasibilityReports } from '../utils/finance.ts';
import { exportToCSV, exportToPDF } from '../utils/exporter.ts';
import { FileSpreadsheet, Printer } from 'lucide-react';

interface ReportTablesProps {
  report: FeasibilityReports;
  projectName: string;
}

const formatValue = (num: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(num);
};

export const ReportTables: React.FC<ReportTablesProps> = ({ report, projectName }) => {
  const [activeTab, setActiveTab] = useState<'income' | 'balance' | 'cashflow'>('income');

  return (
    <div className="rounded-xl border border-brand-hairline bg-brand-surface-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-brand-hairline pb-4 whitespace-nowrap">
        <div>
          <h3 className="text-lg font-serif font-medium text-brand-ink tracking-tight">Project Financial Projections</h3>
          <p className="text-xs text-brand-body mt-0.5">Calculated over a {report.inputs.analysisYears}-year analysis period</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            onClick={() => exportToCSV(report, projectName)}
            className="inline-flex items-center gap-1.5 rounded-md border border-brand-accent-teal/20 bg-brand-accent-teal/10 px-3 py-1.5 text-xs font-semibold text-brand-accent-teal hover:bg-brand-accent-teal/20 transition cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            Excel (CSV)
          </button>
          
          <button
            onClick={exportToPDF}
            className="inline-flex items-center gap-1.5 rounded-md border border-brand-primary/20 bg-brand-primary/10 px-3 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-primary/20 transition cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            Print PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-brand-hairline print:hidden whitespace-nowrap">
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'income'
              ? 'border-b-2 border-brand-primary text-brand-primary'
              : 'text-brand-muted hover:text-brand-ink'
          }`}
        >
          Income Statement
        </button>
        <button
          onClick={() => setActiveTab('balance')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'balance'
              ? 'border-b-2 border-brand-primary text-brand-primary'
              : 'text-brand-muted hover:text-brand-ink'
          }`}
        >
          Balance Sheet
        </button>
        <button
          onClick={() => setActiveTab('cashflow')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'cashflow'
              ? 'border-b-2 border-brand-primary text-brand-primary'
              : 'text-brand-muted hover:text-brand-ink'
          }`}
        >
          Cash Flow Statement
        </button>
      </div>

      <div className="mt-6 overflow-x-auto max-h-[600px] border border-brand-hairline rounded-md shadow-sm bg-brand-canvas custom-scrollbar whitespace-nowrap">
        {activeTab === 'income' && (
          <table className="w-full text-left font-sans text-[11px] border-collapse">
            <thead className="sticky top-0 z-10 bg-[#f5f0e8] shadow-sm uppercase tracking-wider text-brand-ink font-bold text-[10px]">
              <tr>
                <th className="border border-brand-hairline py-2.5 px-3 whitespace-nowrap">Financial Item</th>
                {report.incomeStatement.map(row => (
                  <th key={row.year} className="border border-brand-hairline py-2.5 px-3 text-right font-mono whitespace-nowrap">Year {row.year}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-brand-body font-normal">
              <tr className="even:bg-brand-surface-soft/30 odd:bg-transparent hover:bg-brand-surface-cream-strong/40 transition-colors">
                <td className="border border-brand-hairline py-2 px-3 font-semibold text-brand-ink text-xs font-serif bg-brand-surface-soft/30 whitespace-nowrap">Gross Revenues</td>
                {report.incomeStatement.map(row => (
                  <td key={row.year} className="border border-brand-hairline py-2 px-3 text-right text-emerald-700 font-mono font-bold whitespace-nowrap">{formatValue(row.revenue)}</td>
                ))}
              </tr>
              <tr className="even:bg-brand-surface-soft/30 odd:bg-transparent hover:bg-brand-surface-cream-strong/40 text-brand-muted transition-colors">
                <td className="border border-brand-hairline py-2 px-3 pl-6 bg-brand-surface-soft/10 whitespace-nowrap">- Operating Costs</td>
                {report.incomeStatement.map(row => (
                  <td key={row.year} className="border border-brand-hairline py-2 px-3 text-right font-mono whitespace-nowrap">({formatValue(row.operatingCost)})</td>
                ))}
              </tr>
              <tr className="even:bg-brand-surface-soft/30 odd:bg-transparent hover:bg-brand-surface-cream-strong/40 text-brand-muted transition-colors">
                <td className="border border-brand-hairline py-2 px-3 pl-6 bg-brand-surface-soft/10 whitespace-nowrap">- Maintenance Overhead</td>
                {report.incomeStatement.map(row => (
                  <td key={row.year} className="border border-brand-hairline py-2 px-3 text-right font-mono whitespace-nowrap">({formatValue(row.maintenanceCost)})</td>
                ))}
              </tr>
              <tr className="hover:bg-brand-surface-cream-strong/40 font-semibold bg-brand-surface-soft/40 text-brand-ink">
                <td className="border border-brand-hairline py-2 px-3 bg-brand-surface-soft/20 whitespace-nowrap">EBITDA</td>
                {report.incomeStatement.map(row => (
                  <td key={row.year} className="border border-brand-hairline py-2 px-3 text-right font-mono whitespace-nowrap">{formatValue(row.ebitda)}</td>
                ))}
              </tr>
              <tr className="even:bg-brand-surface-soft/30 odd:bg-transparent hover:bg-brand-surface-cream-strong/40 text-brand-muted transition-colors">
                <td className="border border-brand-hairline py-2 px-3 pl-6 bg-brand-surface-soft/10 whitespace-nowrap">- Asset Depreciation</td>
                {report.incomeStatement.map(row => (
                  <td key={row.year} className="border border-brand-hairline py-2 px-3 text-right font-mono whitespace-nowrap">({formatValue(row.depreciation)})</td>
                ))}
              </tr>
              <tr className="hover:bg-brand-surface-cream-strong/40 font-semibold text-brand-ink">
                <td className="border border-brand-hairline py-2 px-3 bg-brand-surface-soft/20 whitespace-nowrap">Earnings Before Tax (EBT)</td>
                {report.incomeStatement.map(row => (
                  <td key={row.year} className="border border-brand-hairline py-2 px-3 text-right font-mono whitespace-nowrap">{formatValue(row.ebt)}</td>
                ))}
              </tr>
              <tr className="even:bg-brand-surface-soft/30 odd:bg-transparent hover:bg-brand-surface-cream-strong/40 text-brand-muted transition-colors">
                <td className="border border-brand-hairline py-2 px-3 pl-6 bg-brand-surface-soft/10 whitespace-nowrap">- Corporate Tax ({report.inputs.taxRate}%)</td>
                {report.incomeStatement.map(row => (
                  <td key={row.year} className="border border-brand-hairline py-2 px-3 text-right font-mono whitespace-nowrap">({formatValue(row.tax)})</td>
                ))}
              </tr>
              <tr className="hover:bg-brand-primary/10 font-bold bg-brand-primary/5 text-brand-primary">
                <td className="border border-brand-hairline py-2.5 px-3 text-xs font-serif bg-brand-primary/5 whitespace-nowrap">Net Income (Profits)</td>
                {report.incomeStatement.map(row => (
                  <td key={row.year} className="border border-brand-hairline py-2.5 px-3 text-right text-xs font-mono whitespace-nowrap">{formatValue(row.netIncome)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        )}

        {activeTab === 'balance' && (
          <table className="w-full text-left font-sans text-[11px] border-collapse">
            <thead className="sticky top-0 z-10 bg-[#f5f0e8] shadow-sm uppercase tracking-wider text-brand-ink font-bold text-[10px]">
              <tr>
                <th className="border border-brand-hairline py-2.5 px-3 whitespace-nowrap">Balance Sheet Item</th>
                {report.balanceSheet.map(row => (
                  <th key={row.year} className="border border-brand-hairline py-2.5 px-3 text-right font-mono whitespace-nowrap">{row.year === 0 ? "Year 0" : `Year ${row.year}`}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-brand-body font-normal">
              <tr className="bg-brand-surface-soft/60 font-semibold text-brand-ink">
                <td className="border border-brand-hairline py-2 px-3 font-serif whitespace-nowrap" colSpan={report.balanceSheet.length + 1}>ASSETS:</td>
              </tr>
              <tr className="even:bg-brand-surface-soft/30 odd:bg-transparent hover:bg-brand-surface-cream-strong/40 transition-colors">
                <td className="border border-brand-hairline py-2 px-3 pl-6 text-brand-muted bg-brand-surface-soft/10 whitespace-nowrap">Gross Fixed Assets (Capex)</td>
                {report.balanceSheet.map(row => (
                  <td key={row.year} className="border border-brand-hairline py-2 px-3 text-right font-mono whitespace-nowrap">{formatValue(row.grossFixedAssets)}</td>
                ))}
              </tr>
              <tr className="even:bg-brand-surface-soft/30 odd:bg-transparent hover:bg-brand-surface-cream-strong/40 text-brand-muted transition-colors">
                <td className="border border-brand-hairline py-2 px-3 pl-6 bg-brand-surface-soft/10 whitespace-nowrap">- Accumulated Depreciation</td>
                {report.balanceSheet.map(row => (
                  <td key={row.year} className="border border-brand-hairline py-2 px-3 text-right font-mono whitespace-nowrap">({formatValue(row.accumulatedDepreciation)})</td>
                ))}
              </tr>
              <tr className="hover:bg-brand-surface-cream-strong/40 font-semibold">
                <td className="border border-brand-hairline py-2 px-3 pl-6 text-brand-ink bg-brand-surface-soft/15 whitespace-nowrap">Net Fixed Assets (Book Value)</td>
                {report.balanceSheet.map(row => (
                  <td key={row.year} className="border border-brand-hairline py-2 px-3 text-right font-mono whitespace-nowrap">{formatValue(row.netFixedAssets)}</td>
                ))}
              </tr>
              <tr className="even:bg-brand-surface-soft/30 odd:bg-transparent hover:bg-brand-surface-cream-strong/40 transition-colors">
                <td className="border border-brand-hairline py-2 px-3 pl-6 text-brand-muted bg-brand-surface-soft/10 whitespace-nowrap">Project Cumulative Cash</td>
                {report.balanceSheet.map(row => (
                  <td key={row.year} className="border border-brand-hairline py-2 px-3 text-right text-emerald-700 font-mono font-semibold whitespace-nowrap">{formatValue(row.cumulativeCash)}</td>
                ))}
              </tr>
              <tr className="hover:bg-brand-primary/10 font-bold bg-brand-primary/5 text-brand-primary">
                <td className="border border-brand-hairline py-2.5 px-3 text-xs font-serif pl-6 bg-brand-primary/5 whitespace-nowrap">TOTAL PROJECT ASSETS</td>
                {report.balanceSheet.map(row => (
                  <td key={row.year} className="border border-brand-hairline py-2.5 px-3 text-right text-xs font-mono whitespace-nowrap">{formatValue(row.totalAssets)}</td>
                ))}
              </tr>

              <tr className="bg-brand-surface-soft/60 font-semibold text-brand-ink">
                <td className="border border-brand-hairline py-2 px-3 font-serif whitespace-nowrap" colSpan={report.balanceSheet.length + 1}>EQUITY & CAPITAL:</td>
              </tr>
              <tr className="even:bg-brand-surface-soft/30 odd:bg-transparent hover:bg-brand-surface-cream-strong/40 transition-colors">
                <td className="border border-brand-hairline py-2 px-3 pl-6 text-brand-muted bg-brand-surface-soft/10 whitespace-nowrap">Initial Equity Contribution</td>
                {report.balanceSheet.map(row => (
                  <td key={row.year} className="border border-brand-hairline py-2 px-3 text-right font-mono whitespace-nowrap">{formatValue(row.initialEquity)}</td>
                ))}
              </tr>
              <tr className="even:bg-brand-surface-soft/30 odd:bg-transparent hover:bg-brand-surface-cream-strong/40 transition-colors">
                <td className="border border-brand-hairline py-2 px-3 pl-6 text-brand-muted bg-brand-surface-soft/10 whitespace-nowrap">Retained Project Earnings</td>
                {report.balanceSheet.map(row => (
                  <td key={row.year} className="border border-brand-hairline py-2 px-3 text-right font-mono whitespace-nowrap">{formatValue(row.retainedEarnings)}</td>
                ))}
              </tr>
              <tr className="hover:bg-brand-primary/10 font-bold bg-brand-primary/5 text-brand-primary">
                <td className="border border-brand-hairline py-2.5 px-3 text-xs font-serif pl-6 bg-brand-primary/5 whitespace-nowrap">TOTAL CAPITAL EQUITY</td>
                {report.balanceSheet.map(row => (
                  <td key={row.year} className="border border-brand-hairline py-2.5 px-3 text-right text-xs font-mono whitespace-nowrap">{formatValue(row.totalEquity)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        )}

        {activeTab === 'cashflow' && (
          <table className="w-full text-left font-sans text-[11px] border-collapse">
            <thead className="sticky top-0 z-10 bg-[#f5f0e8] shadow-sm uppercase tracking-wider text-brand-ink font-bold text-[10px]">
              <tr>
                <th className="border border-brand-hairline py-2.5 px-3 whitespace-nowrap">Cash Flow Item</th>
                {report.cashFlowStatement.map(row => (
                  <th key={row.year} className="border border-brand-hairline py-2.5 px-3 text-right font-mono whitespace-nowrap">{row.year === 0 ? "Year 0" : `Year ${row.year}`}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-brand-body font-normal">
              <tr className="even:bg-brand-surface-soft/30 odd:bg-transparent hover:bg-brand-surface-cream-strong/40 transition-colors">
                <td className="border border-brand-hairline py-2 px-3 font-semibold text-brand-ink bg-brand-surface-soft/15 whitespace-nowrap">Operating Cash Inflows</td>
                {report.cashFlowStatement.map(row => (
                  <td key={row.year} className="border border-brand-hairline py-2 px-3 text-right text-emerald-700 font-mono whitespace-nowrap">
                    {row.year === 0 ? "-" : formatValue(row.operatingCashFlow)}
                  </td>
                ))}
              </tr>
              <tr className="even:bg-brand-surface-soft/30 odd:bg-transparent hover:bg-brand-surface-cream-strong/40 transition-colors">
                <td className="border border-brand-hairline py-2 px-3 font-semibold text-brand-ink bg-brand-surface-soft/15 whitespace-nowrap">Capital / Salvage Investments</td>
                {report.cashFlowStatement.map(row => (
                  <td key={row.year} className={`border border-brand-hairline py-2 px-3 text-right font-mono ${row.investingCashFlow < 0 ? 'text-brand-primary font-semibold' : 'text-emerald-700'}`}>
                    {row.investingCashFlow === 0 ? "-" : formatValue(row.investingCashFlow)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-brand-surface-cream-strong/40 font-bold bg-brand-surface-soft/30 text-brand-ink">
                <td className="border border-brand-hairline py-2 px-3 font-serif bg-brand-surface-soft/20 whitespace-nowrap">Net Cash Flow</td>
                {report.cashFlowStatement.map(row => (
                  <td key={row.year} className={`border border-brand-hairline py-2 px-3 text-right font-mono ${row.totalCashFlow < 0 ? 'text-brand-primary font-bold' : 'text-emerald-700'}`}>
                    {formatValue(row.totalCashFlow)}
                  </td>
                ))}
              </tr>
              <tr className="even:bg-brand-surface-soft/30 odd:bg-transparent hover:bg-brand-surface-cream-strong/40 text-brand-muted transition-colors">
                <td className="border border-brand-hairline py-2 px-3 pl-4 font-sans bg-brand-surface-soft/10 whitespace-nowrap">Discount Factor ({report.inputs.discountRate}%)</td>
                {report.cashFlowStatement.map(row => (
                  <td key={row.year} className="border border-brand-hairline py-2 px-3 text-right text-brand-muted font-mono whitespace-nowrap">{row.discountFactor.toFixed(4)}</td>
                ))}
              </tr>
              <tr className="even:bg-brand-surface-soft/30 odd:bg-transparent hover:bg-brand-surface-cream-strong/40 transition-colors">
                <td className="border border-brand-hairline py-2 px-3 pl-4 font-semibold text-brand-ink bg-brand-surface-soft/15 whitespace-nowrap">Discounted Net Cash Flow</td>
                {report.cashFlowStatement.map(row => (
                  <td key={row.year} className={`border border-brand-hairline py-2 px-3 text-right font-mono font-medium ${row.discountedCashFlow < 0 ? 'text-brand-primary' : 'text-brand-primary font-semibold'}`}>
                    {formatValue(row.discountedCashFlow)}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-brand-primary/10 font-bold bg-brand-primary/5 text-brand-primary">
                <td className="border border-brand-hairline py-2.5 px-3 text-xs font-serif bg-brand-primary/5 whitespace-nowrap">Cumulative Project Net balance</td>
                {report.cashFlowStatement.map(row => (
                  <td key={row.year} className={`border border-brand-hairline py-2.5 px-3 text-right text-xs font-mono ${row.cumulativeCashFlow < 0 ? 'text-brand-primary' : 'text-emerald-700 font-bold'}`}>
                    {formatValue(row.cumulativeCashFlow)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
