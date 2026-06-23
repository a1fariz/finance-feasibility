import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { FinanceDashboard } from './components/FinanceDashboard.tsx';
import { 
  Building, 
  Sparkles, 
  LineChart, 
  FileSpreadsheet, 
  BrainCircuit, 
  ShieldCheck, 
  TrendingUp,
  Database
} from 'lucide-react';

const BrandSpikeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-brand-primary animate-[spin_40s_linear_infinite]" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2a1 1 0 0 1 1 1v6.59l4.66-4.66a1 1 0 1 1 1.42 1.42L14.41 11H21a1 1 0 1 1 0 2h-6.59l4.66 4.66a1 1 0 0 1-1.42 1.42L13 14.41V21a1 1 0 1 1-2 0v-6.59l-4.66 4.66a1 1 0 0 1-1.42-1.42L9.59 13H3a1 1 0 1 1 0-2h6.59L4.93 6.34a1 1 0 0 1 1.42-1.42L11 9.59V3a1 1 0 0 1 1-1z"/>
  </svg>
);

export function FinanceFeasibilityApp() {
  const { user, loading, signInWithGoogle, signInAsSandboxDemo } = useAuth();
  const [authError, setAuthError] = React.useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Google SSO Failure caught in App UI:", err);
      const errStr = err?.message || String(err);
      if (errStr.includes('popup-closed-by-user') || errStr.includes('popup-blocked')) {
        setAuthError("Google Sign-In popup was closed or blocked. Browsers frequently restrict authentication popups inside nested iframe previews. Please use the sandbox login button below to bypass this.");
      } else {
        setAuthError(`Sign-in error: ${errStr}. Please use the sandbox demo option below.`);
      }
    }
  };

  const handleDemoSignIn = async () => {
    setAuthError(null);
    try {
      await signInAsSandboxDemo();
    } catch (err: any) {
      console.error(err);
      setAuthError("Failed sandbox login.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-brand-canvas text-brand-body font-sans">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-hairline border-t-brand-primary"></div>
        <p className="mt-4 text-xs font-serif italic text-brand-muted">Feasibility Core Initializing...</p>
      </div>
    );
  }

  // Secure Landing & Sign-In Screen (Claude warm editorial style)
  if (!user) {
    return (
      <div className="min-h-screen bg-brand-canvas flex flex-col justify-between overflow-hidden text-brand-body font-sans">
        
        {/* Header */}
        <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-brand-hairline relative z-10">
          <div className="flex items-center gap-2">
            <BrandSpikeIcon />
            <span className="text-xl font-serif font-semibold text-brand-ink tracking-tight">FinanceFeasibility</span>
          </div>
          <span className="text-xs font-semibold text-brand-primary uppercase tracking-widest flex items-center gap-1.5 font-sans">
            <span className="h-2 w-2 rounded-full bg-brand-accent-teal animate-pulse"></span>
            Cloud Feasibility Pro
          </span>
        </header>

        {/* Hero Section & Sign-In Card */}
        <main className="w-full max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10 my-auto">
          
          {/* Left Text Pitch */}
          <div className="flex-1 space-y-6 text-left max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-surface-card border border-brand-hairline px-3 py-1 text-xs font-semibold text-brand-primary tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              INTELLIGENT CAPITAL MODELLING
            </span>
            
            <h1 className="text-4xl sm:text-5xl font-serif font-medium tracking-tight text-brand-ink leading-[1.1]">
              Capital investment analysis, <span className="text-brand-primary italic">reimagined.</span>
            </h1>

            <p className="text-base text-brand-body leading-relaxed mt-4">
              Instantly evaluate enterprise feasibility projects. Formulate robust WACC discount models, capex recovery, margin curves, multi-variable index taxations, and dynamic cash flow projections:
            </p>

            {/* Platform metrics lists */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-brand-hairline select-none font-sans">
              <div className="flex items-start gap-2.5">
                <div className="rounded-lg bg-brand-surface-card border border-brand-hairline p-1.5 text-brand-primary">
                  <LineChart className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-brand-ink">NPV & IRR Simulation</span>
                  <span className="block text-[11px] text-brand-muted">Bisection yield curve models</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="rounded-lg bg-brand-surface-card border border-brand-hairline p-1.5 text-brand-accent-teal">
                  <FileSpreadsheet className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-brand-ink">Corporate Sheets</span>
                  <span className="block text-[11px] text-brand-muted">Income, Capex & Cash Forecasts</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="rounded-lg bg-brand-surface-card border border-brand-hairline p-1.5 text-brand-accent-amber">
                  <BrainCircuit className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-brand-ink">Gemini Strategic Review</span>
                  <span className="block text-[11px] text-brand-muted">Automated business consultancy</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="rounded-lg bg-brand-surface-card border border-brand-hairline p-1.5 text-brand-body-strong">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-brand-ink">Relational Persistence</span>
                  <span className="block text-[11px] text-brand-muted">Secure Cloud SQL regional tables</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card Google Login */}
          <div className="w-full max-w-md rounded-xl border border-brand-hairline bg-brand-surface-card p-8 shadow-sm relative overflow-hidden text-center">
            <div className="absolute top-0 inset-x-0 h-1 bg-brand-primary"></div>

            <div className="mx-auto h-12 w-12 rounded-full bg-brand-canvas border border-brand-hairline flex items-center justify-center text-brand-primary">
              <Building className="h-6 w-6" />
            </div>
            
            <h2 className="mt-6 text-xl font-serif font-medium tracking-tight text-brand-ink">Institutional Workspace</h2>
            <p className="mt-2 text-xs text-brand-muted leading-normal max-w-sm mx-auto">
              Evaluate multi-scenario matrices, sensitivity parameter tables, and publish presentation-ready investment analyses.
            </p>

            {authError && (
              <div className="mt-4 p-3 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-lg text-xs leading-relaxed text-left">
                <span className="font-bold uppercase tracking-wider block mb-1">⚠️ Preview Frame Limitation</span>
                {authError}
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              className="mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-md bg-brand-primary hover:bg-brand-primary-active active:scale-[0.99] px-4 py-3 text-sm font-semibold text-brand-on-primary shadow-sm transition-all duration-200 cursor-pointer"
            >
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" width="24" height="24">
                <g transform="matrix(1, 0, 0, 1, 0, 0)">
                  <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.47C21.68,11.77 21.56,11.4 21.35,11.1z" fill="currentColor" />
                  <path d="M12,20.68c2.43,0 4.47,-0.81 5.96,-2.2l-3.3,-2.57c-0.91,0.61 -2.08,0.98 -3.3,0.98 -2.35,0 -4.33,-1.58 -5.04,-3.72H2.9v2.66C4.38,18.77 7.91,20.68 12,20.68z" fill="currentColor" />
                  <path d="M6.96,13.17a5.21,5.21 0 0 1 0,-3.34V7.17H2.9a8.68,8.68 0 0 0 0,7.66l4.06,-3.16z" fill="currentColor" />
                  <path d="M12,6.12c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,3.48 14.42,2.68 12,2.68c-4.09,0 -7.62,1.91 -9.1,4.49l4.06,3.16c0.71,-2.14 2.69,-3.72 5.04,-3.72z" fill="currentColor" />
                </g>
              </svg>
              Sign In with Google Account
            </button>

            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-brand-hairline"></div>
              <span className="flex-shrink mx-4 text-[10px] text-brand-muted font-mono tracking-wider uppercase">or</span>
              <div className="flex-grow border-t border-brand-hairline"></div>
            </div>

            <button
              onClick={handleDemoSignIn}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-brand-primary/30 bg-brand-canvas hover:bg-brand-primary/10 active:scale-[0.99] px-4 py-3 text-sm font-semibold text-brand-primary shadow-sm transition-all duration-200 cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              Interactive Sandbox Demo Login
            </button>

            <p className="mt-4 text-[10px] text-brand-muted leading-normal max-w-xs mx-auto text-left">
              💡 <strong className="text-brand-body-strong">Notice for Preview:</strong> If third-party storage policies block Google SSO in this frame, use the <strong className="text-brand-primary">Demo Login</strong> to instantly access secure Cloud SQL workspace tables.
            </p>

            <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-brand-muted font-mono border-t border-brand-hairline pt-4">
              <ShieldCheck className="h-4 w-4 text-brand-accent-teal" />
              Authenticated Session via Firebase Auth
            </div>
          </div>

        </main>

        {/* Footer */}
        <footer className="w-full border-t border-brand-hairline py-6 text-center text-[10px] text-brand-muted font-mono bg-brand-surface-card">
          Analyst Tooling for Feasibility Benchmarking. Validated with straight-line asset depreciation.
        </footer>

      </div>
    );
  }

  // Active user workspace
  return <FinanceDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <FinanceFeasibilityApp />
    </AuthProvider>
  );
}
