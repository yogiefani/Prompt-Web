"use client";

import { useMemo } from "react";
import { BarChart3, TrendingUp, Users, PieChart as PieChartIcon } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FadeIn } from "@/components/motion-primitives";
import type { PromptInsightView, AccessGrantView } from "@/lib/prompt-data";

type PromptAnalyticsPanelProps = {
  insights: PromptInsightView[];
  grants: AccessGrantView[];
};

// Colors matching our CSS variables for recharts
const CHART_COLORS = {
  blue: "#2563EB",     // electric-blue
  orange: "#EA580C",   // zesty-orange
  teal: "#0D9488",     // teal-600
  purple: "#7C3AED",   // purple-600
  pink: "#DB2777",     // pink-600
  gray: "#9CA3AF",     // gray-400
};

const PIE_COLORS = [
  CHART_COLORS.blue,
  CHART_COLORS.orange,
  CHART_COLORS.teal,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
];

export function PromptAnalyticsPanel({ insights, grants }: PromptAnalyticsPanelProps) {
  // Aggregate user growth
  const growthData = useMemo(() => {
    const countsByDate: Record<string, number> = {};
    const sortedGrants = [...grants].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    let cumulative = 0;
    sortedGrants.forEach((grant) => {
      const date = new Date(grant.createdAt).toLocaleDateString("id-ID", { month: "short", day: "numeric" });
      cumulative += 1;
      countsByDate[date] = cumulative;
    });

    return Object.entries(countsByDate).map(([date, users]) => ({ date, users }));
  }, [grants]);

  // Aggregate Top Prompts
  const topPromptsData = useMemo(() => {
    return insights.map((i) => ({
      name: i.title.length > 20 ? i.title.substring(0, 20) + "..." : i.title,
      fullTitle: i.title,
      copies: i.copyCount,
    }));
  }, [insights]);

  // Aggregate Categories
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    insights.forEach((i) => {
      counts[i.category] = (counts[i.category] || 0) + i.copyCount;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [insights]);

  return (
    <FadeIn className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-whisper-fade-yellow)] px-4 py-2 text-xs font-semibold text-[var(--color-sunburst-yellow)]">
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
            Product Ops & Analytics
          </span>
          <h2 className="mt-4 font-aeonik text-3xl tracking-[-0.02em] text-[var(--color-obsidian)]">Dasbor Analitik</h2>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-[var(--color-silver-pine)]">
            Visualisasi aktivitas member, tren penggunaan prompt, dan kategori terpopuler.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 1: User Growth */}
        <div className="rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-6 shadow-[var(--shadow-lg)] border border-white/50">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-whisper-fade-orange)] text-[var(--color-zesty-orange)]">
              <Users className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-aeonik text-xl text-[var(--color-obsidian)]">Pertumbuhan Member</h3>
              <p className="text-xs font-semibold text-[var(--color-silver-pine)]">Total akses dari waktu ke waktu</p>
            </div>
          </div>
          <div className="h-[250px] w-full">
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.orange} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.orange} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-200 dark:text-white/10" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--color-silver-pine)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "var(--color-silver-pine)" }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'var(--shadow-lg)', backgroundColor: 'var(--color-canvas-white)', color: 'var(--color-obsidian)' }}
                    itemStyle={{ color: CHART_COLORS.orange, fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="users" name="Total Member" stroke={CHART_COLORS.orange} strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[var(--color-silver-pine)]">Belum ada data member.</div>
            )}
          </div>
        </div>

        {/* Chart 2: Top Categories */}
        <div className="rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-6 shadow-[var(--shadow-lg)] border border-white/50">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-whisper-fade-blue)] text-[var(--color-electric-blue)]">
              <PieChartIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-aeonik text-xl text-[var(--color-obsidian)]">Kategori Terpopuler</h3>
              <p className="text-xs font-semibold text-[var(--color-silver-pine)]">Distribusi copy prompt per kategori</p>
            </div>
          </div>
          <div className="h-[250px] w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'var(--shadow-lg)', backgroundColor: 'var(--color-canvas-white)', color: 'var(--color-obsidian)' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[var(--color-silver-pine)]">Belum ada data kategori.</div>
            )}
          </div>
          {categoryData.length > 0 && (
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-silver-pine)]">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                  {entry.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart 3: Top Prompts (Full width) */}
        <div className="lg:col-span-2 rounded-[32px] bg-white dark:bg-[var(--color-canvas-white)] dark:border-white/10 p-6 shadow-[var(--shadow-lg)] border border-white/50">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-sky-wash)] text-[var(--color-electric-blue)]">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-aeonik text-xl text-[var(--color-obsidian)]">Tren Copy Prompt</h3>
              <p className="text-xs font-semibold text-[var(--color-silver-pine)]">Prompt yang paling sering disalin bulan ini</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            {topPromptsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPromptsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="currentColor" className="text-gray-200 dark:text-white/10" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "var(--color-silver-pine)" }} axisLine={false} tickLine={false} width={150} />
                  <Tooltip 
                    cursor={{ fill: 'currentColor', opacity: 0.05 }}
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: 'var(--shadow-lg)', backgroundColor: 'var(--color-canvas-white)', color: 'var(--color-obsidian)' }}
                    itemStyle={{ color: CHART_COLORS.blue, fontWeight: 'bold' }}
                  />
                  <Bar dataKey="copies" name="Jumlah Copy" fill={CHART_COLORS.blue} radius={[0, 4, 4, 0]} barSize={24}>
                    {topPromptsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? CHART_COLORS.blue : CHART_COLORS.teal} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[var(--color-silver-pine)]">Belum ada data copy bulan ini.</div>
            )}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
