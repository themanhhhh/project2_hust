'use client';

import { useMemo, useState } from 'react';
import { formatPrice } from '@/lib/productMapper';

export interface RevenueChartPoint {
  label: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  data: RevenueChartPoint[];
}

const CHART_HEIGHT = 260;
const CHART_WIDTH = 760;
const PADDING_TOP = 20;
const PADDING_RIGHT = 16;
const PADDING_BOTTOM = 36;
const PADDING_LEFT = 16;

export function RevenueChart({ data }: RevenueChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const maxRevenue = useMemo(() => Math.max(...data.map((point) => point.revenue), 1), [data]);

  const innerWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const innerHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const step = data.length > 1 ? innerWidth / (data.length - 1) : innerWidth;

  const chartPoints = data.map((point, index) => {
    const x = PADDING_LEFT + step * index;
    const y = PADDING_TOP + innerHeight - (point.revenue / maxRevenue) * innerHeight;
    return { ...point, x, y };
  });

  const linePath = chartPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  const areaPath = `${linePath} L ${PADDING_LEFT + innerWidth} ${PADDING_TOP + innerHeight} L ${PADDING_LEFT} ${PADDING_TOP + innerHeight} Z`;

  const activePoint = activeIndex !== null ? chartPoints[activeIndex] : chartPoints[chartPoints.length - 1];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Tổng doanh thu</div>
          <div className="mt-2 text-lg font-semibold text-slate-950">{formatPrice(data.reduce((sum, point) => sum + point.revenue, 0))}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Tổng đơn</div>
          <div className="mt-2 text-lg font-semibold text-slate-950">{data.reduce((sum, point) => sum + point.orders, 0)}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Tháng nổi bậttheo</div>
          <div className="mt-2 text-lg font-semibold text-slate-950">
            {[...data].sort((a, b) => b.revenue - a.revenue)[0]?.label || '--'}
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-[linear-gradient(180deg,_#ffffff,_#f8fafc)] p-4">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-slate-950">Revenue flow</div>
            <div className="text-xs text-slate-500">Theo dõi doanh thu từng tháng từ đơn hàng không bị hủy</div>
          </div>
          {activePoint && (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">
              <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{activePoint.label}</div>
              <div className="mt-1 text-sm font-semibold text-slate-950">{formatPrice(activePoint.revenue)}</div>
              <div className="mt-1 text-xs text-slate-500">{activePoint.orders} đơn hàng</div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="h-[260px] min-w-[720px] w-full">
            <defs>
              <linearGradient id="revenueArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.04" />
              </linearGradient>
            </defs>

            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = PADDING_TOP + innerHeight * ratio;
              return (
                <line
                  key={ratio}
                  x1={PADDING_LEFT}
                  x2={PADDING_LEFT + innerWidth}
                  y1={y}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 8"
                />
              );
            })}

            <path d={areaPath} fill="url(#revenueArea)" />
            <path d={linePath} fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {chartPoints.map((point, index) => (
              <g key={point.label} onMouseEnter={() => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(null)}>
                <line x1={point.x} x2={point.x} y1={point.y} y2={PADDING_TOP + innerHeight} stroke={activeIndex === index ? '#0f172a' : 'transparent'} strokeDasharray="4 6" />
                <circle cx={point.x} cy={point.y} r={activeIndex === index ? 7 : 5} fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
                <rect
                  x={point.x - Math.max(step / 2, 24)}
                  y={PADDING_TOP}
                  width={Math.max(step, 48)}
                  height={innerHeight}
                  fill="transparent"
                />
                <text x={point.x} y={CHART_HEIGHT - 10} textAnchor="middle" fontSize="12" fill="#64748b">
                  {point.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
