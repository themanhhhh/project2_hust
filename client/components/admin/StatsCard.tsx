import { type LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export function StatsCard({ title, value, change, icon: Icon, iconColor, iconBg }: StatsCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="rounded-2xl border border-border bg-sidebar p-6 transition-shadow hover:shadow-lg dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-foreground">{value}</h3>
          <div className="mt-2 flex items-center gap-1 text-sm text-gray-700 dark:text-slate-300">
            {isPositive ? (
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="font-medium">{isPositive ? '+' : ''}{change}%</span>
            <span className="text-muted-foreground">so với tháng trước</span>
          </div>
        </div>
        <div className={`p-4 rounded-2xl ${iconBg}`}>
          <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
