import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Users, 
  FolderGit, 
  TrendingUp, 
  Percent, 
  ShieldCheck, 
  AlertTriangle,
  UserPlus
} from 'lucide-react';

interface AdminData {
  totalProjects: number;
  totalUsers: number;
  averageROI: number;
  averageIRR: number;
  averageNPV: number;
  feasibleRate: number;
  projects: Array<{
    id: number;
    name: string;
    userEmail: string;
    investmentCost: number;
    createdAt: string;
  }>;
  users: Array<{
    id: number;
    email: string;
    role: string;
    createdAt: string;
  }>;
}

export const AdminPanel: React.FC = () => {
  const { token, syncUserProfile } = useAuth();
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [promoting, setPromoting] = useState(false);

  const fetchAdminAnalytics = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Access Denied: Admin role required.');
        }
        throw new Error('Failed to retrieve system administrative data.');
      }
      const analytics = await res.json();
      setData(analytics);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setData(null); // empty previous cache
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminAnalytics();
  }, [token]);

  const handlePromoteSelf = async () => {
    if (!token) return;
    setPromoting(true);
    try {
      const res = await fetch('/api/admin/make-admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        // Sync fresh local context
        await syncUserProfile(token);
        fetchAdminAnalytics();
      } else {
        throw new Error('Failed to elevate auth credentials.');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPromoting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-brand-surface-card rounded-xl border border-brand-hairline shadow-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-surface-cream border-t-brand-primary"></div>
        <p className="mt-4 text-xs font-sans text-brand-muted">Retrieving administrative statistics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-brand-hairline bg-brand-surface-card p-8 text-center shadow-sm">
        <AlertTriangle className="mx-auto h-12 w-12 text-brand-accent-amber" />
        <h3 className="mt-4 text-base font-serif font-semibold text-brand-ink">Administrative Elevated Access Protected</h3>
        <p className="mt-2 text-xs text-brand-body max-w-md mx-auto leading-relaxed">
          {error || 'You require elevated credentials to view global system diagnostics across all platform workspace accounts.'}
        </p>
        
        {/* Promotion Sandbox helper */}
        <div className="mt-8 rounded-xl border border-brand-hairline bg-brand-canvas p-4 max-w-md mx-auto shadow-inner">
          <ShieldCheck className="mx-auto h-6 w-6 text-brand-accent-teal" />
          <h4 className="mt-2 text-xs font-bold uppercase tracking-wider text-brand-ink font-sans">Interactive Sandbox Developer Tool</h4>
          <p className="mt-1 text-[11px] text-brand-muted leading-relaxed font-sans">
            Instantly promote your local test sandbox credential profile inside PostgreSQL database rows to view mock system statistics.
          </p>
          <button
            onClick={handlePromoteSelf}
            disabled={promoting}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-brand-primary hover:bg-brand-primary-hover px-4 py-2 text-xs font-semibold text-brand-on-primary shadow-sm transition cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" />
            {promoting ? 'Elevating...' : 'Elevate Profile to Admin'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* KPI Stats widgets row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="rounded-xl border border-brand-hairline bg-brand-surface-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-xs font-bold uppercase tracking-wider font-sans">Total Projects</span>
            <FolderGit className="h-4 w-4 text-brand-primary" />
          </div>
          <p className="mt-4 text-2xl font-serif font-semibold text-brand-ink">{data.totalProjects}</p>
          <p className="mt-1 text-[10px] text-brand-muted font-sans">Formulated investment models in DB</p>
        </div>

        <div className="rounded-xl border border-brand-hairline bg-brand-surface-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-xs font-bold uppercase tracking-wider font-sans">Active Users</span>
            <Users className="h-4 w-4 text-brand-accent-teal" />
          </div>
          <p className="mt-4 text-2xl font-serif font-semibold text-brand-ink">{data.totalUsers}</p>
          <p className="mt-1 text-[10px] text-brand-muted font-sans">Synchronized workspace accounts</p>
        </div>

        <div className="rounded-xl border border-brand-hairline bg-brand-surface-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-xs font-bold uppercase tracking-wider font-sans text-brand-primary">Mean System IRR</span>
            <Percent className="h-4 w-4 text-brand-primary" />
          </div>
          <p className="mt-4 text-2xl font-serif font-semibold text-brand-primary">
            {data.averageIRR > 0 ? `${data.averageIRR.toFixed(1)}%` : 'N/A'}
          </p>
          <p className="mt-1 text-[10px] text-brand-muted font-sans">Average internal yield rate output</p>
        </div>

        <div className="rounded-xl border border-brand-hairline bg-brand-surface-card p-5 shadow-sm">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-xs font-bold uppercase tracking-wider font-sans text-brand-accent-teal">Violability Rate</span>
            <TrendingUp className="h-4 w-4 text-brand-accent-teal" />
          </div>
          <p className="mt-4 text-2xl font-serif font-semibold text-brand-accent-teal">{data.feasibleRate.toFixed(1)}%</p>
          <p className="mt-1 text-[10px] text-brand-muted font-sans">Ratio of positive Net Present Value (NPV)</p>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        
        {/* Project table */}
        <div className="rounded-xl border border-brand-hairline bg-brand-surface-card p-6 shadow-sm">
          <h3 className="text-sm font-serif font-medium text-brand-ink tracking-tight">Active Platform Projects</h3>
          <p className="text-xs text-brand-muted mt-0.5">Global audit log of investment feasibility entries</p>
          
          <div className="mt-4 overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="border-b border-brand-hairline uppercase tracking-wider text-brand-muted font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Project Title</th>
                  <th className="py-2.5 px-3">Creator / Owner</th>
                  <th className="py-2.5 px-3 text-right">Capex Outlay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-hairline text-brand-body font-normal">
                {data.projects.map(p => (
                  <tr key={p.id} className="hover:bg-brand-surface-cream transition">
                    <td className="py-3 px-3 font-medium text-brand-ink">{p.name}</td>
                    <td className="py-3 px-3 text-brand-muted">{p.userEmail}</td>
                    <td className="py-3 px-3 text-right text-brand-primary font-mono font-bold">{formatCurrency(p.investmentCost)}</td>
                  </tr>
                ))}
                {data.projects.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-brand-muted italic">No active projects compiled.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users table */}
        <div className="rounded-xl border border-brand-hairline bg-brand-surface-card p-6 shadow-sm">
          <h3 className="text-sm font-serif font-medium text-brand-ink tracking-tight">System User Registrations</h3>
          <p className="text-xs text-brand-muted mt-0.5">Registered credentials database logs</p>
          
          <div className="mt-4 overflow-x-auto max-h-80 overflow-y-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="border-b border-brand-hairline uppercase tracking-wider text-brand-muted font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Email Address</th>
                  <th className="py-2.5 px-3">Privilege Role</th>
                  <th className="py-2.5 px-3">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-hairline text-brand-body font-normal">
                {data.users.map(u => (
                  <tr key={u.id} className="hover:bg-brand-surface-cream transition">
                    <td className="py-3 px-3 text-brand-ink font-medium">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                        u.role === 'admin' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/15' : 'bg-brand-canvas text-brand-muted border-brand-hairline'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-brand-muted font-mono">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
