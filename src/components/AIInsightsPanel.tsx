import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Sparkles, 
  BrainCircuit, 
  ThumbsUp, 
  AlertOctagon, 
  RefreshCw,
  ShieldAlert,
  Zap
} from 'lucide-react';

interface AIInsightsPanelProps {
  projectId: number;
  triggerRefreshToggle: boolean;
}

interface InsightsData {
  feasibilityStatus: 'Feasible' | 'Unfeasible' | 'Marginal' | string;
  analysisText: string;
  strengths: string[];
  risks: string[];
  recommendations: string[];
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ projectId, triggerRefreshToggle }) => {
  const { token } = useAuth();
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAIInsights = async () => {
    if (!token || !projectId) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/insights`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to retrieve intelligence report from financial engine.');
      }
      const parsed = await res.json();
      setInsights(parsed);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed code analysis fetch.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, [projectId, token, triggerRefreshToggle]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-brand-hairline bg-brand-surface-card shadow-sm">
        <div className="relative flex items-center justify-center">
          <BrainCircuit className="h-10 w-10 text-brand-primary animate-pulse" />
          <div className="absolute h-14 w-14 animate-spin rounded-full border-2 border-dashed border-brand-primary border-t-transparent"></div>
        </div>
        <h4 className="mt-6 text-sm font-serif font-semibold text-brand-ink">Gemini Feasibility Agent Active</h4>
        <p className="mt-2 text-xs text-brand-body text-center max-w-sm leading-relaxed font-sans">
          Running Monte Carlo boundaries, solving IRR bisections, and structuring strategic core advantages, risks, and institutional-level corporate recommendation paths...
        </p>
      </div>
    );
  }

  if (errorMsg || !insights) {
    return (
      <div className="rounded-xl border border-brand-primary/10 bg-brand-surface-card p-8 text-center shadow-sm">
        <ShieldAlert className="mx-auto h-12 w-12 text-brand-primary" />
        <h3 className="mt-4 text-base font-serif font-semibold text-brand-ink">Intelligence Sync Error</h3>
        <p className="mt-2 text-xs text-brand-body max-w-md mx-auto leading-relaxed">{errorMsg || 'Failed to populate structured financial evaluation.'}</p>
        <button
          onClick={fetchAIInsights}
          className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-brand-canvas hover:bg-brand-surface-cream px-4 py-2 text-xs font-semibold text-brand-body border border-brand-hairline transition cursor-pointer shadow-sm"
        >
          <RefreshCw className="h-3 w-3 animate-spin duration-700" />
          Retry Analysis Feed
        </button>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    Feasible: 'bg-brand-accent-teal/10 text-brand-accent-teal border-brand-accent-teal/20',
    Marginal: 'bg-brand-accent-amber/10 text-brand-accent-amber border-brand-accent-amber/20',
    Unfeasible: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
  };

  const currentStatus = insights.feasibilityStatus || 'Marginal';
  const badgeStyle = statusColors[currentStatus] || statusColors.Marginal;

  return (
    <div className="space-y-6">
      
      {/* Overview Block */}
      <div className="rounded-xl border border-brand-hairline bg-brand-surface-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-semibold text-brand-ink leading-tight">AI Generated CFO Feasibility Review</h3>
              <p className="text-xs text-brand-body mt-0.5">Custom real-time strategic assessment curated by Gemini AI</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted font-sans/80">VERDICT VERIFIED:</span>
            <span className={`rounded border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeStyle} shadow-sm`}>
              ● {currentStatus}
            </span>
          </div>
        </div>

        {/* Narrative summary */}
        <div className="mt-6 border-t border-brand-hairline pt-6 text-xs text-brand-body leading-relaxed font-sans">
          <p className="text-[13px] bg-brand-canvas p-4 rounded-xl border border-brand-hairline italic text-brand-body-strong leading-relaxed shadow-sm">
            "{insights.analysisText}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        
        {/* Strengths Section */}
        <div className="rounded-xl border border-brand-accent-teal/20 bg-brand-accent-teal/5 p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-brand-accent-teal/15 pb-3">
            <div className="rounded-lg bg-brand-accent-teal/10 p-1.5 text-brand-accent-teal shadow-xs">
              <ThumbsUp className="h-4 w-4" />
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-accent-teal font-sans">Capital Strengths</h4>
          </div>

          <ul className="mt-4 space-y-3">
            {insights.strengths.map((str, idx) => (
              <li key={idx} className="flex gap-2 text-xs text-brand-body leading-relaxed font-sans">
                <span className="text-brand-accent-teal shrink-0 font-bold font-sans">✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Hazards Section */}
        <div className="rounded-xl border border-brand-primary/20 bg-brand-primary/5 p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-brand-primary/15 pb-3">
            <div className="rounded-lg bg-brand-primary/10 p-1.5 text-brand-primary shadow-xs">
              <AlertOctagon className="h-4 w-4" />
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-primary font-sans">Vulnerabilities & Risks</h4>
          </div>

          <ul className="mt-4 space-y-3">
            {insights.risks.map((risk, idx) => (
              <li key={idx} className="flex gap-2 text-xs text-brand-body leading-relaxed font-sans">
                <span className="text-brand-primary shrink-0 font-bold font-sans">!</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommendations Section */}
        <div className="rounded-xl border border-brand-accent-amber/20 bg-brand-accent-amber/5 p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-brand-accent-amber/15 pb-3">
            <div className="rounded-lg bg-brand-accent-amber/10 p-1.5 text-brand-accent-amber shadow-xs">
              <Zap className="h-4 w-4" />
            </div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-brand-accent-amber font-sans">Strategic Advisory</h4>
          </div>

          <ul className="mt-4 space-y-3">
            {insights.recommendations.map((rec, idx) => (
              <li key={idx} className="flex gap-2 text-xs text-brand-body leading-relaxed font-sans">
                <span className="text-brand-accent-amber shrink-0 font-bold font-sans">→</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      <div className="rounded-xl border border-dashed border-brand-hairline bg-brand-surface-cream-strong/30 p-4 text-center text-[10px] text-brand-muted leading-relaxed font-sans shadow-sm">
        AI consulting analyses do not construct certified legal or accounting tax advice. Verify metrics against local sovereign regulations.
      </div>

    </div>
  );
};
