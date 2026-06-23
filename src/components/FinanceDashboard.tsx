import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { generateFeasibilityReport, FinancialInputs } from '../utils/finance.ts';
import { MetricCard } from './MetricCard.tsx';
import { ReportTables } from './ReportTables.tsx';
import { FeasibilityCharts } from './FeasibilityCharts.tsx';
import { ScenarioSimulator } from './ScenarioSimulator.tsx';
import { AIInsightsPanel } from './AIInsightsPanel.tsx';
import { ProjectForm } from './ProjectForm.tsx';
import { AdminPanel } from './AdminPanel.tsx';
import { 
  FolderGit, 
  Plus, 
  Trash2, 
  Copy, 
  Edit3, 
  TrendingUp, 
  Percent, 
  CreditCard,
  DollarSign, 
  ArrowLeft,
  Calendar,
  Sparkles,
  Settings,
  HelpCircle,
  Clock,
  ShieldCheck,
  Award
} from 'lucide-react';

interface Project {
  id: number;
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
  createdAt: string;
}

export const FinanceDashboard: React.FC = () => {
  const { token, user, logout } = useAuth();
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  // Dashboard view selection: 'project-dashboard' (listing) vs 'project-workspace' vs 'admin'
  const [viewState, setViewState] = useState<'listings' | 'workspace' | 'admin'>('listings');
  
  // Tab inside workspace
  const [workspaceTab, setWorkspaceTab] = useState<'metrics' | 'statements' | 'charts' | 'scenario' | 'ai'>('metrics');
  const [insightToggle, setInsightToggle] = useState(false);

  const fetchProjects = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/projects', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const list = await res.json();
        setProjectsList(list);
      }
    } catch (err) {
      console.error('Failed to retrieve projects list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [token]);

  const handleCreateOrUpdateProject = async (data: Partial<Project>) => {
    if (!token) return;
    try {
      const method = editingProject ? 'PUT' : 'POST';
      const path = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
      
      const res = await fetch(path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        const savedProject = await res.json();
        await fetchProjects();
        setShowFormModal(false);
        setEditingProject(null);
        
        // If we edited the active project, keep workspace synced!
        if (selectedProjectId === savedProject.id && viewState === 'workspace') {
          // Keep looking at it
        }
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to persist investment metrics.');
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteProject = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    if (!confirm('Are you absolutely sure you want to delete this feasibility project? This is irreversible.')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setProjectsList(prev => prev.filter(p => p.id !== id));
        if (selectedProjectId === id) {
          setSelectedProjectId(null);
          setViewState('listings');
        }
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const handleDuplicateProject = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;
    try {
      const res = await fetch(`/api/projects/${id}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        await fetchProjects();
      }
    } catch (err) {
      console.error('Failed to duplicate project:', err);
    }
  };

  const handleApplySimulatedValues = async (adjustedInputs: FinancialInputs) => {
    if (!token || !selectedProjectId) return;
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(adjustedInputs)
      });
      if (res.ok) {
        await fetchProjects();
        // Trigger AI insights update
        setInsightToggle(prev => !prev);
        alert('Simulated scenario parameters written successfully into database core coordinates!');
      }
    } catch (err) {
      console.error('Failed to save simulation parameters:', err);
    }
  };

  // Find currently selected project
  const selectedProject = projectsList.find(p => p.id === selectedProjectId);
  
  // Calculate aggregated stats for first landing listings dashboard
  let totalProjects = projectsList.length;
  let activeAnalysisCount = projectsList.length; // standard count of active analysis models
  let averageROI = 0;
  let averageIRR = 0;
  let validIRRCount = 0;

  projectsList.forEach(p => {
    const rep = generateFeasibilityReport({
      investmentCost: p.investmentCost,
      monthlyRevenue: p.monthlyRevenue,
      growthRate: p.growthRate,
      inflationRate: p.inflationRate,
      maintenanceCost: p.maintenanceCost,
      operatingCost: p.operatingCost,
      taxRate: p.taxRate,
      residualValue: p.residualValue,
      depreciationYears: p.depreciationYears,
      discountRate: p.discountRate,
      analysisYears: p.analysisYears,
    });
    averageROI += rep.metrics.roi;
    if (rep.metrics.irr !== null) {
      averageIRR += rep.metrics.irr;
      validIRRCount++;
    }
  });

  if (totalProjects > 0) {
    averageROI = averageROI / totalProjects;
  }
  if (validIRRCount > 0) {
    averageIRR = averageIRR / validIRRCount;
  }

  // Calculate stats for specifically selected project
  const activeReport = selectedProject ? generateFeasibilityReport({
    investmentCost: selectedProject.investmentCost,
    monthlyRevenue: selectedProject.monthlyRevenue,
    growthRate: selectedProject.growthRate,
    inflationRate: selectedProject.inflationRate,
    maintenanceCost: selectedProject.maintenanceCost,
    operatingCost: selectedProject.operatingCost,
    taxRate: selectedProject.taxRate,
    residualValue: selectedProject.residualValue,
    depreciationYears: selectedProject.depreciationYears,
    discountRate: selectedProject.discountRate,
    analysisYears: selectedProject.analysisYears,
  }) : null;

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-body font-sans">
      
      {/* Top Navigation banner */}
      <nav className="border-b border-brand-hairline bg-brand-surface-card sticky top-0 z-40 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setViewState('listings'); setSelectedProjectId(null); }}>
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-brand-primary" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2a1 1 0 0 1 1 1v6.59l4.66-4.66a1 1 0 1 1 1.42 1.42L14.41 11H21a1 1 0 1 1 0 2h-6.59l4.66 4.66a1 1 0 0 1-1.42 1.42L13 14.41V21a1 1 0 1 1-2 0v-6.59l-4.66 4.66a1 1 0 0 1-1.42-1.42L9.59 13H3a1 1 0 1 1 0-2h6.59L4.93 6.34a1 1 0 0 1 1.42-1.42L11 9.59V3a1 1 0 0 1 1-1z"/>
              </svg>
              <div>
                <span className="text-lg font-serif font-semibold text-brand-ink tracking-tight">FinanceFeasibility</span>
                <span className="ml-2 rounded-full bg-brand-primary/10 border border-brand-primary/30 px-2 py-0.5 text-[9px] font-bold text-brand-primary tracking-wider uppercase font-sans">
                  PRO
                </span>
              </div>
            </div>

            {/* Profile Options and toggle */}
            <div className="flex items-center gap-4">
              
              {/* Role Toggle shortcut */}
              {user?.role === 'admin' && (
                <button
                  onClick={() => setViewState(viewState === 'admin' ? 'listings' : 'admin')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                    viewState === 'admin' 
                      ? 'bg-brand-primary text-brand-on-primary border-brand-primary-active' 
                      : 'bg-brand-canvas border-brand-hairline text-brand-body-strong hover:bg-brand-surface-card'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  System Admin Panel
                </button>
              )}

              {/* User badge */}
              <div className="hidden sm:flex items-center gap-2 rounded-lg bg-brand-canvas p-1.5 border border-brand-hairline">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="p" className="h-6 w-6 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-brand-surface-card text-brand-ink flex items-center justify-center text-[10px] font-bold border border-brand-hairline">
                    {user?.displayName ? user.displayName[0].toUpperCase() : 'U'}
                  </div>
                )}
                <div className="text-left leading-none px-1">
                  <span className="block text-[9px] text-brand-muted uppercase font-semibold">User:</span>
                  <span className="block text-xs font-bold text-brand-ink max-w-28 truncate">{user?.displayName || user?.email}</span>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="rounded-md border border-brand-hairline bg-brand-canvas px-3.5 py-1.5 text-xs font-semibold text-brand-body-strong transition hover:bg-brand-surface-card cursor-pointer"
              >
                Logout
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Main Workspace Frame container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Loading overlay */}
        {loading && projectsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-sky-500"></div>
            <p className="mt-4 text-xs text-slate-400 font-medium">Synchronizing investment projects with Cloud Run container...</p>
          </div>
        ) : (
          <>
            
            {/* View State Router */}
            
            {viewState === 'admin' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setViewState('listings')}
                    className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-canvas border border-brand-hairline text-brand-body hover:bg-brand-surface-card transition cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <h2 className="text-xl font-serif font-medium text-brand-ink tracking-tight">System Administrative Hub</h2>
                    <p className="text-xs text-brand-muted">Administrative oversight auditing total models and active account telemetry</p>
                  </div>
                </div>
                <AdminPanel />
              </div>
            )}

            {viewState === 'listings' && (
              <div className="space-y-8">
                
                {/* Aggregate Header stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-brand-hairline bg-brand-surface-card p-5 shadow-sm">
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-brand-muted">Total Projects Created</span>
                    <p className="mt-2 text-2xl font-serif font-medium text-brand-ink">{totalProjects}</p>
                    <p className="mt-1 text-[10px] font-mono text-brand-muted">Relational DB records</p>
                  </div>
                  <div className="rounded-xl border border-brand-hairline bg-brand-surface-card p-5 shadow-sm">
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-brand-muted">Active Analysis Models</span>
                    <p className="mt-2 text-2xl font-serif font-medium text-brand-ink">{activeAnalysisCount}</p>
                    <p className="mt-1 text-[10px] font-mono text-brand-muted">Running scenario simulators</p>
                  </div>
                  <div className="rounded-xl border border-brand-hairline bg-brand-surface-card p-5 shadow-sm">
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-brand-primary">Average ROI</span>
                    <p className="mt-2 text-2xl font-serif font-medium text-brand-primary">{averageROI.toFixed(1)}%</p>
                    <p className="mt-1 text-[10px] font-mono text-brand-muted">Composite return yield</p>
                  </div>
                  <div className="rounded-xl border border-brand-hairline bg-brand-surface-card p-5 shadow-sm">
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-brand-accent-teal">Average Composite IRR</span>
                    <p className="mt-2 text-2xl font-serif font-medium text-brand-accent-teal">{averageIRR > 0 ? `${averageIRR.toFixed(1)}%` : 'N/A'}</p>
                    <p className="mt-1 text-[10px] font-mono text-brand-muted">Mean yield against capital cost</p>
                  </div>
                </div>

                {/* Main panel listings */}
                <div className="rounded-xl border border-brand-hairline bg-brand-surface-card p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-brand-hairline pb-4">
                    <div>
                      <h2 className="text-lg font-serif font-medium text-brand-ink tracking-tight">Investment Feasibility Projects</h2>
                      <p className="text-xs text-brand-body">Manage capital evaluations, scenario structures, and AI-driven insights</p>
                    </div>
                    
                    <button
                      onClick={() => { setEditingProject(null); setShowFormModal(true); }}
                      className="inline-flex items-center gap-1.5 rounded-md bg-brand-primary hover:bg-brand-primary-active px-4 py-2 text-xs font-semibold text-brand-on-primary shadow-sm transition cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      Create New Evaluation
                    </button>
                  </div>

                  {/* List grids */}
                  {projectsList.length === 0 ? (
                    <div className="text-center py-24 select-none">
                      <FolderGit className="mx-auto h-12 w-12 text-brand-primary animate-bounce" />
                      <h3 className="mt-4 text-sm font-serif font-medium text-brand-ink">No Feasibility Projects Yet</h3>
                      <p className="mt-2 text-xs text-brand-body max-w-sm mx-auto">
                        Get started by constructing a project with customized capex, revenue inflation, and useful asset life.
                      </p>
                      <button
                        onClick={() => { setEditingProject(null); setShowFormModal(true); }}
                        className="mt-6 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-brand-primary text-brand-on-primary rounded-md hover:bg-brand-primary-active transition shadow-sm cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Create First Project
                      </button>
                    </div>
                  ) : (
                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {projectsList.map(p => {
                        const rep = generateFeasibilityReport({
                          investmentCost: p.investmentCost,
                          monthlyRevenue: p.monthlyRevenue,
                          growthRate: p.growthRate,
                          inflationRate: p.inflationRate,
                          maintenanceCost: p.maintenanceCost,
                          operatingCost: p.operatingCost,
                          taxRate: p.taxRate,
                          residualValue: p.residualValue,
                          depreciationYears: p.depreciationYears,
                          discountRate: p.discountRate,
                          analysisYears: p.analysisYears,
                        });

                        return (
                          <div
                            key={p.id}
                            onClick={() => { setSelectedProjectId(p.id); setViewState('workspace'); }}
                            className="group relative cursor-pointer overflow-hidden rounded-xl border border-brand-hairline bg-brand-canvas p-5 transition-all duration-300 hover:border-brand-primary hover:bg-brand-surface-cream-strong hover:scale-[1.01] hover:shadow-md"
                          >
                            <div className="flex items-start justify-between">
                              <div className="truncate">
                                <h3 className="text-sm font-serif font-medium text-brand-ink group-hover:text-brand-primary transition">{p.name}</h3>
                                <p className="mt-1 text-[11px] text-brand-muted select-none truncate max-w-56">{p.description || "No description set."}</p>
                              </div>

                              {/* Badges for fast verdict profiling */}
                              <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase ${
                                rep.metrics.isFeasible 
                                  ? 'bg-brand-accent-teal/10 text-brand-accent-teal border-brand-accent-teal/30' 
                                  : 'bg-brand-primary/10 text-brand-primary border-brand-primary/30'
                              }`}>
                                {rep.metrics.isFeasible ? 'FEASIBLE' : 'MARGINAL'}
                              </span>
                            </div>

                            {/* Stat block */}
                            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-b border-brand-hairline py-3 text-xs select-none">
                              <div>
                                <span className="block text-[10px] font-bold text-brand-muted uppercase tracking-wider">CAPEX OUTLAY</span>
                                <span className="font-serif font-medium text-brand-ink text-sm">${p.investmentCost.toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] font-bold text-brand-muted uppercase tracking-wider">IRR YIELD</span>
                                <span className="font-serif font-semibold text-brand-primary text-sm">
                                  {rep.metrics.irr ? `${rep.metrics.irr.toFixed(1)}%` : 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="block text-[10px] font-bold text-brand-muted uppercase tracking-wider">NET PRESENT VALUE</span>
                                <span className={`font-serif font-medium text-sm ${rep.metrics.npv > 0 ? 'text-brand-accent-teal' : 'text-brand-primary'}`}>
                                  ${Math.round(rep.metrics.npv).toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className="block text-[10px] font-bold text-brand-muted uppercase tracking-wider">PAYBACK TERM</span>
                                <span className="font-medium text-brand-body">{rep.metrics.paybackFormatted}</span>
                              </div>
                            </div>

                            {/* Options toolbar */}
                            <div className="mt-4 flex items-center justify-between">
                              <span className="inline-flex items-center gap-1 text-[10px] text-brand-muted font-mono">
                                <Clock className="h-3 w-3 text-brand-muted" />
                                {new Date(p.createdAt).toLocaleDateString()}
                              </span>
                              
                              <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition">
                                <button
                                  onClick={(e) => { e.stopPropagation(); setEditingProject(p); setShowFormModal(true); }}
                                  className="rounded p-1.5 text-brand-muted hover:bg-brand-primary/10 hover:text-brand-primary transition"
                                  title="Edit Parameters"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleDuplicateProject(p.id, e)}
                                  className="rounded p-1.5 text-brand-muted hover:bg-brand-primary/10 hover:text-brand-primary transition"
                                  title="Duplicate Project"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteProject(p.id, e)}
                                  className="rounded p-1.5 text-brand-primary hover:bg-brand-primary/20 transition"
                                  title="Delete Project"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Individual active project workspace workspace */}
            
            {viewState === 'workspace' && selectedProject && activeReport && (
              <div className="space-y-6">
                
                {/* Back button and profile header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setViewState('listings'); setSelectedProjectId(null); }}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-brand-canvas border border-brand-hairline text-brand-body hover:bg-brand-surface-card transition cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-serif font-medium text-brand-ink tracking-tight">{selectedProject.name}</h2>
                        <button
                          onClick={() => { setEditingProject(selectedProject); setShowFormModal(true); }}
                          className="rounded p-1 text-brand-muted hover:text-brand-primary transition cursor-pointer"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-brand-body mt-0.5 truncate max-w-xl">{selectedProject.description || "Interactive dynamic model editor workspace."}</p>
                    </div>
                  </div>

                  <div className="flex select-none flex-wrap gap-2 items-center">
                    <span className="text-xs font-bold text-brand-muted uppercase tracking-wider font-sans">Scenario Verdict:</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-bold tracking-wide shadow-sm ${
                      activeReport.metrics.isFeasible 
                        ? 'bg-brand-accent-teal/10 text-brand-accent-teal border-brand-accent-teal/20' 
                        : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
                    }`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        activeReport.metrics.isFeasible ? 'bg-brand-accent-teal animate-pulse' : 'bg-brand-primary'
                      }`}></span>
                      {activeReport.metrics.isFeasible ? 'FEASIBLE INVESTMENT' : 'NOT FEASIBLE / MARGINAL'}
                    </span>
                  </div>
                </div>

                {/* Dynamic workspaces core indicators */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <MetricCard
                    title="Net Present Value (NPV)"
                    value={`$${Math.round(activeReport.metrics.npv).toLocaleString()}`}
                    badgeText={activeReport.metrics.npv > 0 ? "Positive" : "Negative"}
                    badgeType={activeReport.metrics.npv > 0 ? "success" : "error"}
                    icon={DollarSign}
                    description={`Present value discounted using WACC hurdle rate of ${selectedProject.discountRate}%`}
                  />
                  <MetricCard
                    title="Internal Rate of Return (IRR)"
                    value={activeReport.metrics.irr ? `${activeReport.metrics.irr.toFixed(2)}%` : 'N/A'}
                    badgeText={activeReport.metrics.irr ? (activeReport.metrics.irr > selectedProject.discountRate ? "Feasible" : "Insufficient") : "N/A"}
                    badgeType={activeReport.metrics.irr && activeReport.metrics.irr > selectedProject.discountRate ? "success" : "error"}
                    icon={Percent}
                    description={`Project yield. Hurdle hurdle cutoff is ${selectedProject.discountRate}%`}
                  />
                  <MetricCard
                    title="Estimated ROI"
                    value={`${activeReport.metrics.roi.toFixed(1)}%`}
                    badgeText="Composite"
                    badgeType="info"
                    icon={TrendingUp}
                    description="Total cumulative profit return relative to initial investment cost"
                  />
                  <MetricCard
                    title="Payback Period"
                    value={activeReport.metrics.paybackFormatted}
                    badgeText="Timing"
                    badgeType="warning"
                    icon={Clock}
                    description="Time required to break-even and recover initial outlays"
                  />
                </div>

                {/* Workspace navigation tabs */}
                <div className="flex border border-brand-hairline bg-brand-surface-card p-1 rounded-lg overflow-x-auto gap-0.5">
                  <button
                    onClick={() => setWorkspaceTab('metrics')}
                    className={`shrink-0 rounded-md px-4 py-2 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      workspaceTab === 'metrics' 
                        ? 'bg-brand-primary text-brand-on-primary shadow-sm' 
                        : 'text-brand-body hover:bg-brand-surface-cream-strong'
                    }`}
                  >
                    ⚖️ Feasibility Report
                  </button>
                  <button
                    onClick={() => setWorkspaceTab('statements')}
                    className={`shrink-0 rounded-md px-4 py-2 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      workspaceTab === 'statements' 
                        ? 'bg-brand-primary text-brand-on-primary shadow-sm' 
                        : 'text-brand-body hover:bg-brand-surface-cream-strong'
                    }`}
                  >
                    📊 Financial Statements
                  </button>
                  <button
                    onClick={() => setWorkspaceTab('charts')}
                    className={`shrink-0 rounded-md px-4 py-2 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      workspaceTab === 'charts' 
                        ? 'bg-brand-primary text-brand-on-primary shadow-sm' 
                        : 'text-brand-body hover:bg-brand-surface-cream-strong'
                    }`}
                  >
                    📈 Visual Charts
                  </button>
                  <button
                    onClick={() => setWorkspaceTab('scenario')}
                    className={`shrink-0 rounded-md px-4 py-2 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      workspaceTab === 'scenario' 
                        ? 'bg-brand-primary text-brand-on-primary shadow-sm font-sans' 
                        : 'text-brand-body hover:bg-brand-surface-cream-strong'
                    }`}
                  >
                    🎛️ Scenario Simulation
                  </button>
                  <button
                    onClick={() => setWorkspaceTab('ai')}
                    className={`shrink-0 inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-bold tracking-wide transition-all cursor-pointer ${
                      workspaceTab === 'ai' 
                        ? 'bg-brand-primary text-brand-on-primary shadow-sm' 
                        : 'text-brand-primary hover:bg-brand-primary/10'
                    }`}
                  >
                    <Sparkles className="h-3 w-3" />
                     Gemini AI Insights
                  </button>
                </div>

                {/* Workspace content section */}
                <div className="mt-4 transition-all duration-300">
                  
                  {workspaceTab === 'metrics' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Left: inputs summary list */}
                      <div className="lg:col-span-1 rounded-xl border border-brand-hairline bg-brand-surface-card p-6 shadow-sm">
                        <h3 className="text-sm font-serif font-medium text-brand-ink tracking-tight">Active Financial Inputs</h3>
                        <p className="text-xs text-brand-muted mt-1">Underlying variable parameters registered in database tables</p>
                        
                        <div className="mt-5 space-y-4 divide-y divide-brand-hairline text-xs font-sans">
                          <div className="flex items-center justify-between py-2">
                            <span className="text-brand-muted">Capital Outlay (Capex)</span>
                            <span className="font-bold text-brand-ink font-mono">${selectedProject.investmentCost.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex items-center justify-between py-2">
                            <span className="text-brand-muted">Baseline Monthly Revenue</span>
                            <span className="font-bold text-brand-ink font-mono">${selectedProject.monthlyRevenue.toLocaleString()}</span>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <span className="text-brand-muted">Annual Growth trajectory</span>
                            <span className="font-bold text-emerald-700 font-mono">{selectedProject.growthRate}%</span>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <span className="text-brand-muted">Monthly Operating Expenses</span>
                            <span className="font-bold text-brand-ink font-mono">${selectedProject.operatingCost.toLocaleString()}</span>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <span className="text-brand-muted">Annual Maintenance Overhead</span>
                            <span className="font-bold text-brand-ink font-mono">${selectedProject.maintenanceCost.toLocaleString()}</span>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <span className="text-brand-muted">Cost Inflation Drift</span>
                            <span className="font-bold text-rose-700 font-mono">{selectedProject.inflationRate}%</span>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <span className="text-brand-muted">Tax rate</span>
                            <span className="font-bold text-brand-ink font-mono">{selectedProject.taxRate}%</span>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <span className="text-brand-muted">Salvage value</span>
                            <span className="font-bold text-brand-ink font-mono">${selectedProject.residualValue.toLocaleString()}</span>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <span className="text-brand-muted">Useful Depreciation span</span>
                            <span className="font-bold text-brand-ink font-mono">{selectedProject.depreciationYears} Yrs</span>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <span className="text-brand-muted">Discount hurdle (WACC)</span>
                            <span className="font-bold text-sky-700 font-mono">{selectedProject.discountRate}%</span>
                          </div>

                          <div className="flex items-center justify-between py-2">
                            <span className="text-brand-muted">Analysis Years</span>
                            <span className="font-medium text-brand-ink font-mono">{selectedProject.analysisYears} Years</span>
                          </div>

                        </div>
                        
                        <button
                          onClick={() => { setEditingProject(selectedProject); setShowFormModal(true); }}
                          className="mt-6 w-full py-2.5 text-xs font-semibold bg-brand-canvas hover:bg-brand-surface-cream text-brand-ink border border-brand-hairline rounded-md transition cursor-pointer"
                        >
                          Modify Core Variables
                        </button>
                      </div>

                      {/* Right: brief feasibility text analysis */}
                      <div className="lg:col-span-2 rounded-xl border border-brand-hairline bg-brand-surface-card p-6 shadow-sm flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-serif font-medium text-brand-ink tracking-tight">CFO Feasibility Overview</h3>
                          <p className="text-xs text-brand-muted mt-1">Quantitative viability indicators computed from current projection sheets</p>
                          
                          <div className="mt-5 space-y-4 text-xs leading-relaxed text-brand-body font-sans">
                            <p>
                              The Net Present Value (NPV) calculation of <strong className="text-brand-primary">${Math.round(activeReport.metrics.npv).toLocaleString()}</strong> indicates that the project 
                              is <span className={`font-semibold inline-block px-2 py-0.5 rounded border text-[10px] uppercase ${activeReport.metrics.isFeasible ? 'text-brand-accent-teal bg-brand-accent-teal/10 border-brand-accent-teal/20' : 'text-brand-primary bg-brand-primary/10 border-brand-primary/20'}`}>{activeReport.metrics.isFeasible ? 'financially feasible' : 'financially unfeasible or marginal'}</span>. 
                              The NPV discounts compiled Year 1 to Year {selectedProject.analysisYears} operational cash flows down at a composite capital hazard cost of <strong>{selectedProject.discountRate}%</strong>.
                            </p>
                            
                            <p>
                              Our Internal Rate of Return (IRR) bisection algorithm resolved a yield of <strong className="text-brand-primary">{activeReport.metrics.irr ? `${activeReport.metrics.irr.toFixed(2)}%` : 'N/A'}</strong>. 
                              Because our cost of capital hurdle benchmarks stand at <strong>{selectedProject.discountRate}%</strong>, 
                              the investment is predicted to generate an economic profit margin of <strong className="text-brand-accent-teal">{activeReport.metrics.irr ? `${(activeReport.metrics.irr - selectedProject.discountRate).toFixed(2)}%` : 'N/A'}</strong> above basic finance hurdles.
                            </p>

                            <p>
                              The Initial capital outlay recovery is estimated to complete in <strong className="text-brand-accent-amber">{activeReport.metrics.paybackFormatted}</strong> from operational start, 
                              making it an opportunity of <span className="font-semibold text-brand-ink">{activeReport.metrics.roi > 100 ? 'high liquidity and compounding velocity' : 'extended baseline liquidity cycle'}</span>.
                            </p>
                          </div>

                          <div className="mt-8 rounded-lg bg-brand-primary/5 border border-brand-primary/15 p-4">
                            <h4 className="text-xs font-bold text-brand-primary inline-flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5" />
                              AI Insights Recommendation Available
                            </h4>
                            <p className="text-[11px] text-brand-body mt-1 leading-relaxed">
                              Gemini has generated structural recommendations on how to protect margins, handle compounding inflation at {selectedProject.inflationRate}%, and optimization paths. Proceed to the "Gemini AI Insights" tab.
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-brand-hairline text-[10px] text-brand-muted font-mono items-center justify-between">
                          <span>Verified: Straight-Line Asset Depreciation applied</span>
                          <span>Formula validation: Cumulative CF = Capex + ΣOprCash</span>
                        </div>
                      </div>

                    </div>
                  )}

                  {workspaceTab === 'statements' && (
                    <ReportTables report={activeReport} projectName={selectedProject.name} />
                  )}

                  {workspaceTab === 'charts' && (
                    <FeasibilityCharts report={activeReport} />
                  )}

                  {workspaceTab === 'scenario' && (
                    <ScenarioSimulator report={activeReport} onApplyInteractiveValues={handleApplySimulatedValues} />
                  )}

                  {workspaceTab === 'ai' && (
                    <AIInsightsPanel projectId={selectedProject.id} triggerRefreshToggle={insightToggle} />
                  )}

                </div>

              </div>
            )}

          </>
        )}

      </main>

      {/* Workspace Footer */}
      <footer className="mt-16 border-t border-white/5 py-8 text-center text-xs text-slate-500 font-mono">
        <div className="container mx-auto px-4">
          <p>FinanceFeasibility Platform © 2026</p>
          <p className="mt-2 text-[10px] text-slate-650">Securely running with Node.js, Express, PostgreSQL, Drizzle ORM, and Gemini API.</p>
        </div>
      </footer>

      {/* Edit Form Modal window */}
      {showFormModal && (
        <ProjectForm
          project={editingProject}
          onSave={handleCreateOrUpdateProject}
          onClose={() => { setShowFormModal(false); setEditingProject(null); }}
        />
      )}

    </div>
  );
};
