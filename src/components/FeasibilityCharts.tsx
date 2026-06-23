import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  LineChart, 
  AreaChart,
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  Line, 
  Bar, 
  Area 
} from 'recharts';
import { FeasibilityReports } from '../utils/finance.ts';

interface FeasibilityChartsProps {
  report: FeasibilityReports;
}

const formatCurrencyTooltip = (val: any) => {
  if (typeof val === 'number') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  }
  return val;
};

export const FeasibilityCharts: React.FC<FeasibilityChartsProps> = ({ report }) => {
  const [activeChart, setActiveChart] = useState<'cashflow' | 'growth' | 'depreciation' | 'sensitivity'>('cashflow');

  // Prepared data
  // 1. Cash flow series
  const cashFlowData = report.cashFlowStatement.map(row => ({
    name: row.year === 0 ? 'Year 0' : `Year ${row.year}`,
    'Net Cash Flow': row.totalCashFlow,
    'Cumulative Cash Balance': row.cumulativeCashFlow,
    'Discounted Cash Flow': row.discountedCashFlow
  }));

  // 2. Growth series
  const growthData = report.incomeStatement.map(row => ({
    name: `Year ${row.year}`,
    'Gross Revenues': row.revenue,
    'Operating Expenses': row.operatingCost + row.maintenanceCost,
    'Net Profits': row.netIncome
  }));

  // 3. Depreciation series
  const deprData = [{ name: 'Year 0', 'Book value': report.inputs.investmentCost, 'Depr Amount': 0 }];
  report.depreciationSchedule.forEach(row => {
    deprData.push({
      name: `Year ${row.year}`,
      'Book value': row.bookValue,
      'Depr Amount': row.amount
    });
  });

  // 4. Sensitivity series
  const sensData = report.sensitivityAnalysis.map(row => ({
    name: `${row.changePercent > 0 ? '+' : ''}${row.changePercent}%`,
    'Revenue changes NPV': row.revenueNPV,
    'Expense changes NPV': row.expenseNPV,
    'Inflation changes NPV': row.inflationNPV
  }));

  // Styling guides matching our theme
  const chartPalette = {
    primary: '#c85a53', // Warm Coral
    teal: '#3a8d8f', // Sage Teal
    amber: '#d7853b', // Amber/Yellow
    body: '#4a3e3d', // Deep body gray
    muted: '#8c7c7a', // Warm muted gray
    hairline: 'rgba(74, 62, 61, 0.08)', // subtle grid lines
    tooltipBackground: '#fdfbf7', // Warm canvas background
    tooltipBorder: '#e3dec3' // Hairline beige borders
  };

  return (
    <div className="rounded-xl border border-brand-hairline bg-brand-surface-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-brand-hairline pb-4">
        <div>
          <h3 className="text-lg font-serif font-medium text-brand-ink tracking-tight">Advanced Financial Visualizations</h3>
          <p className="text-xs text-brand-body mt-0.5">Interactive projections showing compounding curves and sensitivities</p>
        </div>
        
        {/* Chart Selectors */}
        <div className="flex flex-wrap gap-1 rounded-md bg-brand-canvas p-1 border border-brand-hairline">
          <button
            onClick={() => setActiveChart('cashflow')}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeChart === 'cashflow' 
                ? 'bg-brand-primary text-brand-on-primary shadow-sm' 
                : 'text-brand-muted hover:text-brand-ink'
            }`}
          >
            Cash Flow Trend
          </button>
          <button
            onClick={() => setActiveChart('growth')}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeChart === 'growth' 
                ? 'bg-brand-primary text-brand-on-primary shadow-sm' 
                : 'text-brand-muted hover:text-brand-ink'
            }`}
          >
            Revenues vs Expenses
          </button>
          <button
            onClick={() => setActiveChart('depreciation')}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeChart === 'depreciation' 
                ? 'bg-brand-primary text-brand-on-primary shadow-sm' 
                : 'text-brand-muted hover:text-brand-ink'
            }`}
          >
            Asset Depreciation
          </button>
          <button
            onClick={() => setActiveChart('sensitivity')}
            className={`rounded px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
              activeChart === 'sensitivity' 
                ? 'bg-brand-primary text-brand-on-primary shadow-sm' 
                : 'text-brand-muted hover:text-brand-ink'
            }`}
          >
            NPV Sensitivity Axis
          </button>
        </div>
      </div>

      <div className="mt-8 h-80 w-full font-sans text-[11px]">
        {activeChart === 'cashflow' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={cashFlowData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.hairline} />
              <XAxis dataKey="name" stroke={chartPalette.muted} tick={{ fontSize: 10 }} />
              <YAxis stroke={chartPalette.muted} tickFormatter={(v) => `$${v / 1000}k`} tick={{ fontSize: 10 }} />
              <Tooltip 
                formatter={formatCurrencyTooltip} 
                contentStyle={{ 
                  backgroundColor: chartPalette.tooltipBackground, 
                  border: `1px solid ${chartPalette.tooltipBorder}`, 
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
                labelStyle={{ fontWeight: 'bold', color: '#4a3e3d', fontFamily: 'serif', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="Net Cash Flow" name="Net Annual Cash Inflows" fill={chartPalette.teal} opacity={0.65} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Discounted Cash Flow" name="Discounted NPV Value" fill={chartPalette.primary} opacity={0.7} radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="Cumulative Cash Balance" name="Cumulative Balance Curve" stroke={chartPalette.amber} strokeWidth={3} dot={{ r: 4, fill: chartPalette.amber }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'growth' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.hairline} />
              <XAxis dataKey="name" stroke={chartPalette.muted} tick={{ fontSize: 10 }} />
              <YAxis stroke={chartPalette.muted} tickFormatter={(v) => `$${v / 1000}k`} tick={{ fontSize: 10 }} />
              <Tooltip 
                formatter={formatCurrencyTooltip} 
                contentStyle={{ 
                  backgroundColor: chartPalette.tooltipBackground, 
                  border: `1px solid ${chartPalette.tooltipBorder}`, 
                  borderRadius: '6px'
                }}
                labelStyle={{ fontWeight: 'bold', color: '#4a3e3d', fontFamily: 'serif', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Area type="monotone" dataKey="Gross Revenues" fill={`${chartPalette.teal}15`} stroke={chartPalette.teal} strokeWidth={2} />
              <Area type="monotone" dataKey="Operating Expenses" fill={`${chartPalette.primary}15`} stroke={chartPalette.primary} strokeWidth={2} />
              <Line type="monotone" dataKey="Net Profits" name="Net Corporate profit" stroke={chartPalette.amber} strokeWidth={2.5} dot={{ r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'depreciation' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={deprData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.hairline} />
              <XAxis dataKey="name" stroke={chartPalette.muted} tick={{ fontSize: 10 }} />
              <YAxis stroke={chartPalette.muted} tickFormatter={(v) => `$${v / 1000}k`} tick={{ fontSize: 10 }} />
              <Tooltip 
                formatter={formatCurrencyTooltip} 
                contentStyle={{ 
                  backgroundColor: chartPalette.tooltipBackground, 
                  border: `1px solid ${chartPalette.tooltipBorder}`, 
                  borderRadius: '6px'
                }}
                labelStyle={{ fontWeight: 'bold', color: '#4a3e3d', fontFamily: 'serif', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="Depr Amount" name="Straight-Line Depreciation" fill={chartPalette.primary} opacity={0.6} radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="Book value" name="Restant Book Value" stroke={chartPalette.teal} strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {activeChart === 'sensitivity' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sensData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartPalette.hairline} />
              <XAxis dataKey="name" stroke={chartPalette.muted} tick={{ fontSize: 10 }} />
              <YAxis stroke={chartPalette.muted} tickFormatter={(v) => `$${v / 1000}k`} tick={{ fontSize: 10 }} />
              <Tooltip 
                formatter={formatCurrencyTooltip} 
                contentStyle={{ 
                  backgroundColor: chartPalette.tooltipBackground, 
                  border: `1px solid ${chartPalette.tooltipBorder}`, 
                  borderRadius: '6px'
                }}
                labelStyle={{ fontWeight: 'bold', color: '#4a3e3d', fontFamily: 'serif', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              {/* Sensitivity curves */}
              <Line type="monotone" dataKey="Revenue changes NPV" name=" NPV: Revenue % variations" stroke={chartPalette.teal} strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Expense changes NPV" name=" NPV: OpEx % variations" stroke={chartPalette.primary} strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Inflation changes NPV" name=" NPV: Cost Inflation % variations" stroke={chartPalette.amber} strokeWidth={2} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      
      <p className="mt-4 text-[11px] text-center text-brand-body italic leading-relaxed">
        {activeChart === 'sensitivity' && "Hedge guidelines: Revenue fluctuations have positive slopes, whereas OpEx and Inflation drifts carry negative slope correlations."}
        {activeChart === 'cashflow' && "Discounted cash flow factors represent the compounding cost of capital (WACC) discounted Year-on-Year."}
        {activeChart === 'growth' && "Profit lines expand as cumulative compound organic revenues begin to pull away from fixed inflation structures."}
        {activeChart === 'depreciation' && "Book asset value decreases straight-line, flattening out once salvage threshold floor limits are satisfied."}
      </p>
    </div>
  );
};
