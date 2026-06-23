import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Save } from 'lucide-react';

interface ProjectData {
  id?: number;
  name: string;
  description: string;
  investmentCost: number;
  monthlyRevenue: number;
  growthRate: number;
  inflationRate: number;
  maintenanceCost: number;
  operatingCost: number;
  taxRate: number;
  residualValue: number;
  depreciationYears: number;
  discountRate: number;
  analysisYears: number;
}

interface ProjectFormProps {
  project?: ProjectData | null;
  onSave: (data: Partial<ProjectData>) => Promise<void>;
  onClose: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ project, onSave, onClose }) => {
  const [formData, setFormData] = useState<ProjectData>({
    name: '',
    description: '',
    investmentCost: 150000,
    monthlyRevenue: 20000,
    growthRate: 6.0,
    inflationRate: 3.0,
    maintenanceCost: 3000,
    operatingCost: 6000,
    taxRate: 20.0,
    residualValue: 20000,
    depreciationYears: 5,
    discountRate: 8.5,
    analysisYears: 5,
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        investmentCost: Number(project.investmentCost),
        monthlyRevenue: Number(project.monthlyRevenue),
        growthRate: Number(project.growthRate),
        inflationRate: Number(project.inflationRate),
        maintenanceCost: Number(project.maintenanceCost),
        operatingCost: Number(project.operatingCost),
        taxRate: Number(project.taxRate),
        residualValue: Number(project.residualValue),
        depreciationYears: Math.round(Number(project.depreciationYears)),
        discountRate: Number(project.discountRate),
        analysisYears: Math.round(Number(project.analysisYears || 5)),
      });
    }
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Check if numeric field
    const numericFields = [
      'investmentCost', 'monthlyRevenue', 'growthRate', 'inflationRate', 
      'maintenanceCost', 'operatingCost', 'taxRate', 'residualValue', 
      'depreciationYears', 'discountRate', 'analysisYears'
    ];
    
    setFormData(prev => ({
      ...prev,
      [name]: numericFields.includes(name) ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handlePredefinedTemplate = (type: 'logistics' | 'realestate' | 'saas') => {
    switch(type) {
      case 'logistics':
        setFormData(prev => ({
          ...prev,
          name: 'Delivery Fleet Acquisition',
          description: 'Acquisition of 5 refrigerated delivery trucks for local logistical routes.',
          investmentCost: 220000,
          monthlyRevenue: 35000,
          growthRate: 5.0,
          operatingCost: 12000,
          maintenanceCost: 8000,
          inflationRate: 2.5,
          taxRate: 15.0,
          residualValue: 40000,
          depreciationYears: 5,
          discountRate: 9.0,
          analysisYears: 5
        }));
        break;
      case 'realestate':
        setFormData(prev => ({
          ...prev,
          name: 'Commercial Workspace Purchase',
          description: 'Purchase and fitting of a downtown co-working property asset.',
          investmentCost: 650000,
          monthlyRevenue: 60000,
          growthRate: 4.0,
          operatingCost: 18000,
          maintenanceCost: 12000,
          inflationRate: 2.0,
          taxRate: 20.0,
          residualValue: 500000,
          depreciationYears: 15,
          discountRate: 7.0,
          analysisYears: 10
        }));
        break;
      case 'saas':
        setFormData(prev => ({
          ...prev,
          name: 'SaaS Software Automation Platform',
          description: 'Capitalized development outlay for building an automated customer platform.',
          investmentCost: 120000,
          monthlyRevenue: 22000,
          growthRate: 15.0,
          operatingCost: 8000,
          maintenanceCost: 2000,
          inflationRate: 3.5,
          taxRate: 21.0,
          residualValue: 5000,
          depreciationYears: 3,
          discountRate: 12.0,
          analysisYears: 5
        }));
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('Please specify a valid Project Title.');
      return;
    }
    if (formData.investmentCost <= 0) {
      setErrorMsg('Capex Initial Outlay must be greater than zero.');
      return;
    }
    
    setSaving(true);
    setErrorMsg(null);
    try {
      await onSave(formData);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to persist investment variables.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-ink/40 px-4 py-4 md:py-8 backdrop-blur-sm overflow-y-auto">
      {/* Outer Click Guard & sizing wrapper */}
      <div className="relative w-full max-w-4xl rounded-xl border border-brand-hairline bg-brand-canvas shadow-2xl transition-all flex flex-col max-h-[92vh] md:max-h-[85vh]">
        
        {/* Header - Fixed & Unscrollable */}
        <div className="flex items-center justify-between border-b border-brand-hairline p-5 md:p-6 shrink-0">
          <div>
            <h2 className="text-lg md:text-xl font-serif font-medium text-brand-ink tracking-tight">
              {project ? 'Edit Feasibility Analysis' : 'New Feasibility Project'}
            </h2>
            <p className="text-xs text-brand-body mt-0.5">Configure financial and cost variables for investment benchmarking</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-brand-muted hover:bg-brand-surface-cream-strong hover:text-brand-ink transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Container containing Preset buttons AND Form inputs */}
        <div className="overflow-y-auto p-5 md:p-6 flex-1 space-y-6 animate-fadeIn">
          
          {/* Templates */}
          {!project && (
            <div className="rounded-xl border border-dashed border-brand-hairline bg-brand-surface-card p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-muted font-sans font-medium">Benchmarking Presets:</span>
              <div className="mt-2 flex flex-wrap gap-2">
                <button 
                  type="button"
                  onClick={() => handlePredefinedTemplate('logistics')}
                  className="rounded-md bg-brand-canvas hover:bg-brand-surface-cream px-3 py-1.5 text-xs font-medium text-brand-body-strong border border-brand-hairline transition cursor-pointer"
                >
                  🚚 Logistics (Fleet Purchase)
                </button>
                <button 
                  type="button"
                  onClick={() => handlePredefinedTemplate('realestate')}
                  className="rounded-md bg-brand-canvas hover:bg-brand-surface-cream px-3 py-1.5 text-xs font-medium text-brand-body-strong border border-brand-hairline transition cursor-pointer"
                >
                  🏢 Property Acquisition
                </button>
                <button 
                  type="button"
                  onClick={() => handlePredefinedTemplate('saas')}
                  className="rounded-md bg-brand-canvas hover:bg-brand-surface-cream px-3 py-1.5 text-xs font-medium text-brand-body-strong border border-brand-hairline transition cursor-pointer"
                >
                  💻 Enterprise Tech/SaaS
                </button>
              </div>
            </div>
          )}

          {/* Error notification */}
          {errorMsg && (
            <div className="rounded-lg bg-brand-primary/10 border border-brand-primary/25 px-4 py-3 text-sm text-brand-primary">
              {errorMsg}
            </div>
          )}

          {/* Main Form Fields inside Scroll */}
          <form id="project-feasibility-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* General Description section */}
            <div className="space-y-4 rounded-xl bg-brand-surface-card p-4 border border-brand-hairline shadow-sm">
              <h3 className="text-sm font-serif font-semibold text-brand-primary">1. Project Descriptor</h3>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted font-sans">Project Name / Title</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ford Transit Fleet Expansion"
                  className="mt-1 w-full rounded-md border border-brand-hairline bg-brand-canvas p-2.5 text-xs text-brand-ink focus:border-brand-primary focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted font-sans">Strategic Project Objectives</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Briefly describe the assets acquired, strategic timeline, or market segment..."
                  rows={4}
                  className="mt-1 w-full rounded-md border border-brand-hairline bg-brand-canvas p-2.5 text-xs text-brand-ink focus:border-brand-primary focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-muted font-sans">
                    Timeline (Yrs)
                    <span className="group relative text-brand-muted cursor-help"><HelpCircle className="h-3 w-3" />
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-48 rounded bg-brand-ink p-2 text-[10px] text-brand-canvas leading-normal font-sans">
                        Total timeline years for financial flow calculation.
                      </span>
                    </span>
                  </label>
                  <input
                    type="number"
                    name="analysisYears"
                    value={formData.analysisYears}
                    onChange={handleChange}
                    min={1}
                    max={20}
                    className="mt-1 w-full rounded-md border border-brand-hairline bg-brand-canvas p-2.5 text-xs text-brand-ink focus:border-brand-primary focus:outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-muted font-sans font-sans">
                    Hurdle Rate %
                    <span className="group relative text-brand-muted cursor-help"><HelpCircle className="h-3 w-3" />
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-48 rounded bg-brand-ink p-2 text-[10px] text-brand-canvas leading-normal font-sans">
                        WACC / Hurdle Rate % used as the NPV discount exponent.
                      </span>
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="discountRate"
                    value={formData.discountRate}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-brand-hairline bg-brand-canvas p-2.5 text-xs text-brand-ink focus:border-brand-primary focus:outline-none transition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Capex & Residual section */}
            <div className="space-y-4 rounded-xl bg-brand-surface-card p-4 border border-brand-hairline shadow-sm">
              <h3 className="text-sm font-serif font-semibold text-brand-primary">2. Capital Outlay & Salvage</h3>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted font-sans">Initial Investment (Capex)</label>
                <input
                  type="number"
                  name="investmentCost"
                  value={formData.investmentCost}
                  onChange={handleChange}
                  placeholder="e.g. 185000 (Vehicle Price, Property Price)"
                  className="mt-1 w-full rounded-md border border-brand-hairline bg-brand-canvas p-2.5 text-xs text-brand-ink focus:border-brand-primary focus:outline-none transition"
                  required
                />
                <p className="mt-1 text-[10px] text-brand-muted italic">Asset purchase pricing, machinery, or fit-out outlays.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted font-sans">Salvage ($)</label>
                  <input
                    type="number"
                    name="residualValue"
                    value={formData.residualValue}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-brand-hairline bg-brand-canvas p-2.5 text-xs text-brand-ink focus:border-brand-primary focus:outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted font-sans">Depr. Years</label>
                  <input
                    type="number"
                    name="depreciationYears"
                    value={formData.depreciationYears}
                    onChange={handleChange}
                    min={1}
                    className="mt-1 w-full rounded-md border border-brand-hairline bg-brand-canvas p-2.5 text-xs text-brand-ink focus:border-brand-primary focus:outline-none transition"
                    required
                  />
                </div>
              </div>
              <p className="text-[10px] text-brand-muted italic">Estimated asset salvage at termination. Depreciation runs straight-line.</p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted font-sans">Corporate Tax Rate %</label>
                <input
                  type="number"
                  step="0.1"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-brand-hairline bg-brand-canvas p-2.5 text-xs text-brand-ink focus:border-brand-primary focus:outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Income Operations section */}
            <div className="space-y-4 rounded-xl bg-brand-surface-card p-4 border border-brand-hairline shadow-sm">
              <h3 className="text-sm font-serif font-semibold text-brand-primary">3. Operational Inflows</h3>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted font-sans">Baseline Monthly Revenue ($)</label>
                <input
                  type="number"
                  name="monthlyRevenue"
                  value={formData.monthlyRevenue}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-brand-hairline bg-brand-canvas p-2.5 text-xs text-brand-ink focus:border-brand-primary focus:outline-none transition"
                  required
                />
                <p className="mt-1 text-[10px] text-brand-muted italic">Gross inflows per month during Year 1 operations.</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted font-sans">Annual growth rate %</label>
                <input
                  type="number"
                  step="0.1"
                  name="growthRate"
                  value={formData.growthRate}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-brand-hairline bg-brand-canvas p-2.5 text-xs text-brand-ink focus:border-brand-primary focus:outline-none transition"
                  required
                />
                <p className="mt-1 text-[10px] text-brand-muted italic">Compounding annual growth rate starting Year 2.</p>
              </div>
            </div>

            {/* Operational Expenses section */}
            <div className="space-y-4 rounded-xl bg-brand-surface-card p-4 border border-brand-hairline shadow-sm">
              <h3 className="text-sm font-serif font-semibold text-brand-primary">4. Cost & Inflation</h3>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted font-sans">Monthly Operating cost ($)</label>
                <input
                  type="number"
                  name="operatingCost"
                  value={formData.operatingCost}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-md border border-brand-hairline bg-brand-canvas p-2.5 text-xs text-brand-ink focus:border-brand-primary focus:outline-none transition"
                  required
                />
                <p className="mt-1 text-[10px] text-brand-muted italic font-sans">Operating expenses (salaries, utilities, maintenance, leases).</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted font-sans">Annual Maint ($)</label>
                  <input
                    type="number"
                    name="maintenanceCost"
                    value={formData.maintenanceCost}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-brand-hairline bg-brand-canvas p-2.5 text-xs text-brand-ink focus:border-brand-primary focus:outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted font-sans">Inflation %</label>
                  <input
                    type="number"
                    step="0.1"
                    name="inflationRate"
                    value={formData.inflationRate}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-brand-hairline bg-brand-canvas p-2.5 text-xs text-brand-ink focus:border-brand-primary focus:outline-none transition"
                    required
                  />
                </div>
              </div>
              <p className="text-[10px] text-brand-muted italic font-sans">Macro index. Operating and maintenance costs compound annually by this rate.</p>
            </div>

          </div>
          </form>
        </div>

        {/* Action triggers - Fixed Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-brand-hairline p-5 md:p-6 shrink-0 bg-brand-surface-card rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-brand-canvas hover:bg-brand-surface-cream px-4 py-2.5 text-xs font-semibold text-brand-body border border-brand-hairline transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="project-feasibility-form"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary hover:bg-brand-primary hover:bg-brand-primary-hover px-5 py-2.5 text-xs font-semibold text-brand-on-primary shadow-sm disabled:opacity-50 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Feasibility Analysis'}
          </button>
        </div>

      </div>
    </div>
  );
};
