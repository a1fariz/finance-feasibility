import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'error' | 'info';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  badgeText,
  badgeType = 'info'
}) => {
  const badgeColors = {
    success: 'bg-brand-accent-teal/10 text-brand-accent-teal border-brand-accent-teal/20',
    warning: 'bg-brand-accent-amber/14 text-brand-accent-amber border-brand-accent-amber/30',
    error: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
    info: 'bg-brand-body/10 text-brand-body-strong border-brand-hairline'
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-brand-hairline bg-brand-surface-card p-6 transition-all hover:bg-brand-surface-cream-strong shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-brand-muted">{title}</span>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-canvas border border-brand-hairline text-brand-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-serif font-medium tracking-tight text-brand-ink">{value}</span>
        {badgeText && (
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${badgeColors[badgeType]}`}>
            {badgeText}
          </span>
        )}
      </div>
      
      <p className="mt-2 text-xs text-brand-body leading-relaxed">{description}</p>
    </div>
  );
};
