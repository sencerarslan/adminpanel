'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import {
    Download, FileText, ArrowUpRight, ArrowDownRight,
    TrendingUp, ShoppingCart, Users, DollarSign, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false });
const Sector = dynamic(() => import('recharts').then(m => m.Sector), { ssr: false });
const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false });
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(m => m.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });

// ── MOCK DATA ─────────────────────────────────────────────────────────────

const revenueData = [
    { name: 'Oca', gelir: 85000, satis: 64000 },
    { name: 'Şub', gelir: 92000, satis: 71000 },
    { name: 'Mar', gelir: 115000, satis: 85000 },
    { name: 'Nis', gelir: 104000, satis: 76000 },
    { name: 'May', gelir: 138000, satis: 96000 },
    { name: 'Haz', gelir: 165000, satis: 112000 },
    { name: 'Tem', gelir: 182000, satis: 125000 },
    { name: 'Ağu', gelir: 194000, satis: 132000 },
    { name: 'Eyl', gelir: 175000, satis: 118000 },
    { name: 'Eki', gelir: 212000, satis: 145000 },
    { name: 'Kas', gelir: 245000, satis: 172000 },
    { name: 'Ara', gelir: 288000, satis: 201000 },
];

const categoryData = [
    { name: 'Elektronik', value: 45, color: '#3b82f6' },
    { name: 'Giyim', value: 25, color: '#ec4899' },
    { name: 'Ev & Yaşam', value: 15, color: '#10b981' },
    { name: 'Spor', value: 10, color: '#f59e0b' },
    { name: 'Diğer', value: 5, color: '#8b5cf6' },
];

const visitorData = [
    { gun: 'Pzt', ziyaretci: 4200, aktif: 1800 },
    { gun: 'Sal', ziyaretci: 4800, aktif: 2200 },
    { gun: 'Çar', ziyaretci: 3900, aktif: 1600 },
    { gun: 'Per', ziyaretci: 5100, aktif: 2400 },
    { gun: 'Cum', ziyaretci: 6200, aktif: 3100 },
    { gun: 'Cmt', ziyaretci: 8500, aktif: 4500 },
    { gun: 'Paz', ziyaretci: 7800, aktif: 4100 },
];

const kpiData = [
    { key: 'totalRevenue', val: '₺2.1M', change: '+14.5%', trend: 'up', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { key: 'totalSales', val: '45,231', change: '+8.2%', trend: 'up', icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { key: 'activeVisitors', val: '12,400', change: '-2.1%', trend: 'down', icon: Users, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { key: 'avgOrderValue', val: '₺1,450', change: '+5.4%', trend: 'up', icon: TrendingUp, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

function formatCurrency(n: number): string {
    if (n >= 1_000_000) return `₺${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `₺${(n / 1_000).toFixed(0)}K`;
    return `₺${n}`;
}

export function ReportsOverview(): React.JSX.Element {
    const t = useTranslations('reports');
    const [dateRange, setDateRange] = useState<'last7Days' | 'last30Days' | 'yearToDate'>('yearToDate');

    return (
        <div className="space-y-6">

            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card border border-border rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div className="flex bg-muted rounded-lg p-1">
                        {(['last7Days', 'last30Days', 'yearToDate'] as const).map(range => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={cn(
                                    'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors',
                                    dateRange === range
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {t(range)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 w-full sm:w-auto">
                                <Download className="h-4 w-4" />
                                {t('exportFormat')}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="cursor-pointer gap-2">
                                <FileText className="h-4 w-4" /> {t('exportPdf')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button className="gap-2 w-full sm:w-auto">
                        {t('generateReport')}
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiData.map(kpi => {
                    const Icon = kpi.icon;
                    const isUp = kpi.trend === 'up';
                    return (
                        <div key={kpi.key} className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">{t(`metrics.${kpi.key}` as any)}</p>
                                    <h3 className="text-2xl font-bold tracking-tight">{kpi.val}</h3>
                                </div>
                                <div className={cn('p-2.5 rounded-xl', kpi.bg)}>
                                    <Icon className={cn('h-5 w-5', kpi.color)} />
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-sm">
                                <span className={cn(
                                    'flex items-center gap-0.5 font-semibold',
                                    isUp ? 'text-emerald-500' : 'text-red-500'
                                )}>
                                    {isUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                    {kpi.change}
                                </span>
                                <span className="text-muted-foreground text-xs">vs {t('last30Days')}</span>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                        </div>
                    );
                })}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-xl shadow-sm p-6 lg:col-span-2">
                    <div className="mb-4">
                        <h3 className="font-semibold text-lg">{t('revenueOverview')}</h3>
                        <p className="text-sm text-muted-foreground">{t('revenueOverviewDesc')}</p>
                    </div>
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorGelir" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorSatis" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}
                                    formatter={(val: any) => typeof val === 'number' ? formatCurrency(val) : val}
                                />
                                <Area type="monotone" dataKey="gelir" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorGelir)" />
                                <Area type="monotone" dataKey="satis" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSatis)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                    <div className="mb-4 text-center">
                        <h3 className="font-semibold text-lg">{t('categoryPerformance')}</h3>
                        <p className="text-sm text-muted-foreground">{t('categoryPerformanceDesc')}</p>
                    </div>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                    shape={(props) => <Sector {...props} fill={props.color} />}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any, name: any) => [`${value}%`, name]}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-2 flex flex-col gap-2">
                        {categoryData.map(c => (
                            <div key={c.name} className="flex justify-between text-sm items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                                    <span>{c.name}</span>
                                </div>
                                <span className="font-semibold">{c.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="bg-card border border-border rounded-xl shadow-sm p-6">
                <div className="mb-4">
                    <h3 className="font-semibold text-lg">{t('visitorTrends')}</h3>
                    <p className="text-sm text-muted-foreground">{t('visitorTrendsDesc')}</p>
                </div>
                <div className="h-[280px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={visitorData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <XAxis dataKey="gun" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <Tooltip
                                cursor={{ fill: 'var(--color-accent)' }}
                                contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="ziyaretci" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            <Bar dataKey="aktif" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
}
