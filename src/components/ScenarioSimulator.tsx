import React, { useState, useEffect } from 'react';
import { FeasibilityReports, generateFeasibilityReport, FinancialInputs } from '../utils/finance.ts';
import { Sparkles, ArrowRight, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

interface ScenarioSimulatorProps {
  report: FeasibilityReports;
  onApplyInteractiveValues: (adjustedInputs: FinancialInputs) => void;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
};

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ report, onApplyInteractiveValues }) => {
  const [activePreset, setActivePreset] = useState<'normal' | 'best' | 'worst' | 'custom'>('normal');
  
  // Interactive parameters initialized to base report inputs
  const [growthRate, setGrowthRate] = useState(report.inputs.growthRate);
  const [inflationRate, setInflationRate] = useState(report.inputs.inflationRate);
  const [operatingCost, setOperatingCost] = useState(report.inputs.operatingCost);
  const [monthlyRevenue, setMonthlyRevenue] = useState(report.inputs.monthlyRevenue);

  // Monitor base report modifications
  useEffect(() => {
    if (activePreset === 'normal') {
      setGrowthRate(report.inputs.growthRate);
      setInflationRate(report.inputs.inflationRate);
      setOperatingCost(report.inputs.operatingCost);
      setMonthlyRevenue(report.inputs.monthlyRevenue);
    }
  }, [report, activePreset]);

  // Calculate live projections dynamically
  const simulatedInputs: FinancialInputs = {
    ...report.inputs,
    growthRate,
    inflationRate,
    operatingCost,
    monthlyRevenue
  };

  const simulatedReport = generateFeasibilityReport(simulatedInputs);

  const handlePresetChange = (preset: 'normal' | 'best' | 'worst') => {
    setActivePreset(preset);
    if (preset === 'normal') {
      setGrowthRate(report.inputs.growthRate);
      setInflationRate(report.inputs.inflationRate);
      setOperatingCost(report.inputs.operatingCost);
      setMonthlyRevenue(report.inputs.monthlyRevenue);
    } else if (preset === 'best') {
      // Best case: +40% growth, -20% inflation, -15% operating cost, +15% revenue
      setGrowthRate(Number((report.inputs.growthRate * 1.4).toFixed(1)));
      setInflationRate(Number((report.inputs.inflationRate * 0.7).toFixed(1)));
      setOperatingCost(Math.round(report.inputs.operatingCost * 0.85));
      setMonthlyRevenue(Math.round(report.inputs.monthlyRevenue * 1.15));
    } else if (preset === 'worst') {
      // Worst case: half growth, double inflation, +25% operating cost, -20% revenue
      setGrowthRate(Number((report.inputs.growthRate * 0.5).toFixed(1)));
      setInflationRate(Number((report.inputs.inflationRate * 1.8).toFixed(1)));
      setOperatingCost(Math.round(report.inputs.operatingCost * 1.25));
      setMonthlyRevenue(Math.round(report.inputs.monthlyRevenue * 0.8));
    }
  };

  const handleApply = () => {
    onApplyInteractiveValues(simulatedInputs);
  };

  // Compare simulated stats to base report stats
  const npvDifference = simulatedReport.metrics.npv - report.metrics.npv;
  const irrDifference = (simulatedReport.metrics.irr || 0) - (report.metrics.irr || 0);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      
      {/* Simulation variables slider panel */}
      <div className="lg:col-span-1 rounded-xl border border-brand-hairline bg-brand-surface-card p-6 shadow-sm">
        <h3 className="text-lg font-serif font-medium text-brand-ink tracking-tight">Scenario Simulator</h3>
        <p className="text-xs text-brand-body mt-0.5">Tweak macro variables compound over the project lifecycle</p>

        {/* Presets */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => handlePresetChange('normal')}
            className={`flex-1 rounded-md border py-2 text-xs font-semibold transition cursor-pointer ${
              activePreset === 'normal' 
                ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/30' 
                : 'bg-brand-canvas border-brand-hairline text-brand-muted hover:bg-brand-surface-cream'
            }`}
          >
            ⚖️ Base Case
          </button>
          <button
            onClick={() => handlePresetChange('best')}
            className={`flex-1 rounded-md border py-2 text-xs font-semibold transition cursor-pointer ${
              activePreset === 'best' 
                ? 'bg-brand-accent-teal/10 text-brand-accent-teal border-brand-accent-teal/30' 
                : 'bg-brand-canvas border-brand-hairline text-brand-muted hover:bg-brand-surface-cream'
            }`}
          >
            🚀 Best Case
          </button>
          <button
            onClick={() => handlePresetChange('worst')}
            className={`flex-1 rounded-md border py-2 text-xs font-semibold transition cursor-pointer ${
              activePreset === 'worst' 
                ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/30' 
                : 'bg-brand-canvas border-brand-hairline text-brand-muted hover:bg-brand-surface-cream'
            }`}
          >
            ⚠️ Risk Case
          </button>
        </div>

        {/* Sliders */}
        <div className="mt-8 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="font-medium text-brand-body-strong">Monthly Revenue Modifier</span>
              <span className="font-bold text-brand-accent-teal">{formatCurrency(monthlyRevenue)}/mo</span>
            </div>
            <input
              type="range"
              min={Math.round(report.inputs.monthlyRevenue * 0.5)}
              max={Math.round(report.inputs.monthlyRevenue * 1.5)}
              step={100}
              value={monthlyRevenue}
              onChange={(e) => {
                setMonthlyRevenue(Number(e.target.value));
                setActivePreset('custom');
              }}
              className="mt-2 w-full h-1.5 rounded-md bg-brand-canvas accent-brand-primary cursor-pointer border border-brand-hairline"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="font-medium text-brand-body-strong">Annual Growth Rate %</span>
              <span className="font-bold text-brand-accent-teal">{growthRate}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="0.5"
              value={growthRate}
              onChange={(e) => {
                setGrowthRate(Number(e.target.value));
                setActivePreset('custom');
              }}
              className="mt-2 w-full h-1.5 rounded-md bg-brand-canvas accent-brand-primary cursor-pointer border border-brand-hairline"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="font-medium text-brand-body-strong">Operating Cost ($/mo)</span>
              <span className="font-bold text-brand-primary">{formatCurrency(operatingCost)}/mo</span>
            </div>
            <input
              type="range"
              min={Math.round(report.inputs.operatingCost * 0.5)}
              max={Math.round(report.inputs.operatingCost * 1.5)}
              step={100}
              value={operatingCost}
              onChange={(e) => {
                setOperatingCost(Number(e.target.value));
                setActivePreset('custom');
              }}
              className="mt-2 w-full h-1.5 rounded-md bg-brand-canvas accent-brand-primary cursor-pointer border border-brand-hairline"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-sans">
              <span className="font-medium text-brand-body-strong">Cost Inflation %</span>
              <span className="font-bold text-brand-primary">{inflationRate}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.1"
              value={inflationRate}
              onChange={(e) => {
                setInflationRate(Number(e.target.value));
                setActivePreset('custom');
              }}
              className="mt-2 w-full h-1.5 rounded-md bg-brand-canvas accent-brand-primary cursor-pointer border border-brand-hairline"
            />
          </div>
        </div>

        {/* Sync Apply action */}
        <button
          onClick={handleApply}
          disabled={activePreset === 'normal'}
          className="mt-8 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-brand-canvas disabled:opacity-50 hover:bg-brand-surface-cream px-4 py-2.5 text-xs font-semibold text-brand-body-strong border border-brand-hairline transition cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Apply to Database Core
        </button>
      </div>

      {/* Recalculated dynamic visual panel */}
      <div className="lg:col-span-2 rounded-xl border border-brand-hairline bg-brand-surface-card p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-medium text-brand-ink tracking-tight">Interactive Sensitivity Impact Analysis</h3>
            <span className="rounded-full bg-brand-primary/10 border border-brand-primary/20 px-2 py-0.5 text-[10px] font-bold text-brand-primary uppercase">
              Live Feed
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-1">Real-time simulation variance from baseline project database coordinates</p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* NPV card review */}
            <div className="rounded-xl border border-brand-hairline bg-brand-canvas p-4 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted block">SIMULATED NPV</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-2xl font-serif font-medium ${simulatedReport.metrics.npv > 0 ? 'text-brand-accent-teal' : 'text-brand-primary'}`}>
                  {formatCurrency(simulatedReport.metrics.npv)}
                </span>
                <span className={`text-xs font-mono font-bold flex items-center ${npvDifference >= 0 ? 'text-brand-accent-teal' : 'text-brand-primary'}`}>
                  {npvDifference >= 0 ? <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> : <TrendingDown className="h-3.5 w-3.5 mr-0.5" />}
                  {npvDifference >= 0 ? '+' : ''}{Math.round(npvDifference / (report.metrics.npv || 1) * 100)}%
                </span>
              </div>
              <p className="mt-1 text-[10px] font-sans text-brand-muted leading-relaxed">
                Baseline NPV: {formatCurrency(report.metrics.npv)}
              </p>
            </div>

            {/* IRR card review */}
            <div className="rounded-xl border border-brand-hairline bg-brand-canvas p-4 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted block">SIMULATED IRR</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className={`text-2xl font-serif font-medium ${simulatedReport.metrics.isFeasible ? 'text-brand-accent-teal' : 'text-brand-primary'}`}>
                  {simulatedReport.metrics.irr ? `${simulatedReport.metrics.irr.toFixed(1)}%` : 'N/A'}
                </span>
                <span className={`text-xs font-mono font-bold flex items-center ${irrDifference >= 0 ? 'text-brand-accent-teal' : 'text-brand-primary'}`}>
                  {irrDifference >= 0 ? <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> : <TrendingDown className="h-3.5 w-3.5 mr-0.5" />}
                  {irrDifference >= 0 ? '+' : ''}{irrDifference.toFixed(1)}%
                </span>
              </div>
              <p className="mt-1 text-[10px] font-sans text-brand-muted leading-relaxed">
                Baseline IRR: {report.metrics.irr ? `${report.metrics.irr.toFixed(1)}%` : 'N/A'}
              </p>
            </div>

          </div>

          {/* Interactive Verdict Comparison */}
          <div className="mt-6 rounded-xl border border-brand-hairline bg-brand-canvas p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-muted block">Feasibility Shift Comparison</span>
            <div className="mt-3 flex items-center gap-4 text-xs">
              <div className="flex-1 rounded-lg bg-brand-surface-card border border-brand-hairline p-3 text-center shadow-sm">
                <span className="text-brand-muted block text-[9px] uppercase tracking-wider font-bold">Base Verdict</span>
                <span className={`mt-1 inline-block rounded border px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                  report.metrics.isFeasible ? 'bg-brand-accent-teal/10 text-brand-accent-teal border-brand-accent-teal/20' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                }`}>
                  {report.metrics.isFeasible ? 'Feasible' : 'Unfeasible'}
                </span>
              </div>
              
              <ArrowRight className="h-4 w-4 text-brand-muted" />

              <div className="flex-1 rounded-lg bg-brand-surface-card border border-brand-hairline p-3 text-center shadow-sm">
                <span className="text-brand-muted block text-[9px] uppercase tracking-wider font-bold">Simulated Verdict</span>
                <span className={`mt-1 inline-block rounded border px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                  simulatedReport.metrics.isFeasible ? 'bg-brand-accent-teal/10 text-brand-accent-teal border-brand-accent-teal/20' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                }`}>
                  {simulatedReport.metrics.isFeasible ? 'Feasible' : 'Unfeasible'}
                </span>
              </div>
            </div>
            
            <p className="mt-4 text-xs text-brand-body leading-relaxed bg-brand-primary/5 p-3 rounded-lg border border-brand-primary/15 font-sans shadow-sm">
              💡 {simulatedReport.metrics.isFeasible 
                ? `Under these criteria, compounding Year 1 – ${simulatedInputs.analysisYears} operational net inflows provides a positive net present valuation. The numeric discount IRR settles at ${simulatedReport.metrics.irr ? simulatedReport.metrics.irr.toFixed(2)+'%' : 'N/A'}, satisfying project hurdle benchmarks.` 
                : "Warning: These criteria drop cumulative net cashflow curves below WACC cost of capital benchmarks, yielding a negative NPV. Leveraged adjustments or cost reduction measures are strongly recommended to protect capitalization."
              }
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-brand-hairline pt-4 text-[10px] text-brand-muted italic font-sans leading-relaxed">
          <span>Formula basis: NPV & IRR resolved dynamically</span>
          <span>Payback Term: <strong className="text-brand-ink font-serif font-semibold">{simulatedReport.metrics.paybackFormatted}</strong></span>
        </div>

      </div>

    </div>
  );
};
