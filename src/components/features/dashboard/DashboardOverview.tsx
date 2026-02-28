'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import {
    Users, ShoppingCart, Package, TrendingUp, TrendingDown,
    ArrowUpRight, ArrowDownRight, Eye, Star, Clock, Zap,
    MoreHorizontal, ChevronUp, ChevronDown, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Dynamic imports for chart components ──────────────────────────────────────
const AreaChart = dynamic(() => import('recharts').then(m => m.AreaChart), { ssr: false });
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false });
const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false });
const Sector = dynamic(() => import('recharts').then(m => m.Sector), { ssr: false });
const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false });
const RadialBarChart = dynamic(() => import('recharts').then(m => m.RadialBarChart), { ssr: false });
const RadialBar = dynamic(() => import('recharts').then(m => m.RadialBar), { ssr: false });
const Area = dynamic(() => import('recharts').then(m => m.Area), { ssr: false });
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false });
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });
const Legend = dynamic(() => import('recharts').then(m => m.Legend), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });

// ── Mock Data ─────────────────────────────────────────────────────────────────

const revenueData = [
    { month: 'Oca', gelir: 142000, gider: 89000, kar: 53000 },
    { month: 'Şub', gelir: 168000, gider: 95000, kar: 73000 },
    { month: 'Mar', gelir: 195000, gider: 102000, kar: 93000 },
    { month: 'Nis', gelir: 178000, gider: 98000, kar: 80000 },
    { month: 'May', gelir: 231000, gider: 118000, kar: 113000 },
    { month: 'Haz', gelir: 267000, gider: 125000, kar: 142000 },
    { month: 'Tem', gelir: 298000, gider: 134000, kar: 164000 },
    { month: 'Ağu', gelir: 312000, gider: 141000, kar: 171000 },
    { month: 'Eyl', gelir: 285000, gider: 128000, kar: 157000 },
    { month: 'Eki', gelir: 334000, gider: 152000, kar: 182000 },
    { month: 'Kas', gelir: 358000, gider: 165000, kar: 193000 },
    { month: 'Ara', gelir: 412000, gider: 178000, kar: 234000 },
];

const orderData = [
    { gun: 'Pzt', sipariş: 142, iptal: 8, iade: 5 },
    { gun: 'Sal', sipariş: 198, iptal: 12, iade: 7 },
    { gun: 'Çar', sipariş: 167, iptal: 9, iade: 4 },
    { gun: 'Per', sipariş: 224, iptal: 15, iade: 11 },
    { gun: 'Cum', sipariş: 289, iptal: 18, iade: 9 },
    { gun: 'Cmt', sipariş: 348, iptal: 22, iade: 14 },
    { gun: 'Paz', sipariş: 276, iptal: 14, iade: 8 },
];

const categoryData = [
    { name: 'Elektronik', value: 38, color: '#3b82f6' },
    { name: 'Giyim', value: 24, color: '#ec4899' },
    { name: 'Ev & Yaşam', value: 18, color: '#10b981' },
    { name: 'Spor', value: 12, color: '#f59e0b' },
    { name: 'Diğer', value: 8, color: '#8b5cf6' },
];

const trafficData = [
    { name: 'Organik', value: 45, fill: '#6366f1' },
    { name: 'Sosyal', value: 28, fill: '#8b5cf6' },
    { name: 'Direkt', value: 18, fill: '#a78bfa' },
    { name: 'E-posta', value: 9, fill: '#c4b5fd' },
];

const topProducts = [
    { rank: 1, name: 'Samsung Galaxy S25 Ultra', category: 'Elektronik', sales: 4821, revenue: '₺28.4M', trend: 'up', change: '+18%' },
    { rank: 2, name: 'Sony WH-1000XM6', category: 'Elektronik', sales: 3204, revenue: '₺12.8M', trend: 'up', change: '+12%' },
    { rank: 3, name: 'Nike Air Max 2025', category: 'Spor', sales: 2987, revenue: '₺8.9M', trend: 'down', change: '-3%' },
    { rank: 4, name: 'iPad Pro M4', category: 'Elektronik', sales: 2541, revenue: '₺22.1M', trend: 'up', change: '+9%' },
    { rank: 5, name: 'Dyson V15 Detect', category: 'Ev & Yaşam', sales: 1893, revenue: '₺11.3M', trend: 'up', change: '+21%' },
];

const recentOrders = [
    { id: '#58291', customer: 'Ahmet Yılmaz', product: 'iPhone 16 Pro', amount: '₺52.999', status: 'tamamlandı', time: '2 dk' },
    { id: '#58290', customer: 'Fatma Kaya', product: 'MacBook Pro M4', amount: '₺89.999', status: 'işlemde', time: '8 dk' },
    { id: '#58289', customer: 'Mehmet Demir', product: 'Sony PS5 Slim', amount: '₺18.999', status: 'kargoda', time: '15 dk' },
    { id: '#58288', customer: 'Ayşe Çelik', product: 'Dyson Airwrap', amount: '₺24.999', status: 'tamamlandı', time: '32 dk' },
    { id: '#58287', customer: 'Ali Arslan', product: 'Samsung OLED 65"', amount: '₺74.999', status: 'iptal', time: '1 sa' },
    { id: '#58286', customer: 'Zeynep Şahin', product: 'Nike Air Jordan 1', amount: '₺8.999', status: 'tamamlandı', time: '2 sa' },
];

const conversionFunnel = [
    { labelKey: 'Ziyaretçi', value: 124500, pct: 100, color: '#6366f1' },
    { labelKey: 'Ürün Görüntü', value: 68200, pct: 54.8, color: '#8b5cf6' },
    { labelKey: 'Sepete Ekle', value: 18400, pct: 14.8, color: '#a78bfa' },
    { labelKey: 'Ödeme', value: 8920, pct: 7.2, color: '#c4b5fd' },
    { labelKey: 'Sipariş', value: 4280, pct: 3.4, color: '#ddd6fe' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(n: number): string {
    if (n >= 1_000_000) return `₺${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `₺${(n / 1_000).toFixed(0)}K`;
    return `₺${n}`;
}

const STATUS_STYLES: Record<string, string> = {
    tamamlandı: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    işlemde: 'bg-blue-100    text-blue-700    dark:bg-blue-900/40    dark:text-blue-400',
    kargoda: 'bg-amber-100   text-amber-700   dark:bg-amber-900/40   dark:text-amber-400',
    iptal: 'bg-red-100     text-red-700     dark:bg-red-900/40     dark:text-red-400',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function KPICard({
    label, value, change, trend, icon: Icon, gradient, sublabel,
}: {
    label: string; value: string; change: string; trend: 'up' | 'down';
    icon: React.ElementType; gradient: string; sublabel?: string;
}): React.JSX.Element {
    const isUp = trend === 'up';
    return (
        <div className={cn(
            'relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl',
            gradient,
        )}>
            {/* Background decoration */}
            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -right-4 h-36 w-36 rounded-full bg-white/5" />

            <div className="relative z-10">
                <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                    </div>
                    <span className={cn(
                        'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                        isUp ? 'bg-white/20 text-white' : 'bg-white/20 text-white',
                    )}>
                        {isUp ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {change}
                    </span>
                </div>

                <div className="mt-4">
                    <p className="text-3xl font-bold tracking-tight">{value}</p>
                    <p className="mt-1 text-sm font-medium text-white/80">{label}</p>
                    {sublabel && (
                        <p className="mt-0.5 text-xs text-white/60">{sublabel}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function SectionCard({
    title, subtitle, children, className, action,
}: {
    title: string; subtitle?: string; children: React.ReactNode;
    className?: string; action?: React.ReactNode;
}): React.JSX.Element {
    const t = useTranslations('dashboard');
    return (
        <div className={cn('rounded-2xl border border-border bg-card shadow-sm', className)}>
            <div className="flex items-start justify-between border-b border-border px-6 py-4">
                <div>
                    <h2 className="text-base font-semibold text-foreground">{title}</h2>
                    {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
                </div>
                {action ?? (
                    <button
                        type="button"
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        aria-label={t('moreOptions')}
                    >
                        <MoreHorizontal className="h-4 w-4" />
                    </button>
                )}
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

// ── Sparkline mini-chart for secondary metrics ─────────────────────────────────

const sparkData = [
    { v: 40 }, { v: 55 }, { v: 48 }, { v: 62 }, { v: 58 }, { v: 71 }, { v: 85 }, { v: 79 }, { v: 92 },
];

function SparkCard({
    label, value, change, trend, color,
}: {
    label: string; value: string; change: string; trend: 'up' | 'down'; color: string;
}): React.JSX.Element {
    const isUp = trend === 'up';
    return (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <span className={cn(
                    'flex items-center gap-0.5 text-xs font-semibold',
                    isUp ? 'text-emerald-500' : 'text-red-500',
                )}>
                    {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {change}
                </span>
            </div>
            <p className="text-xl font-bold text-foreground">{value}</p>
            <div className="h-10 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkData}>
                        <Line
                            type="monotone"
                            dataKey="v"
                            stroke={color}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }): React.JSX.Element | null {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-sm">
            <p className="mb-2 text-xs font-semibold text-foreground">{label}</p>
            {payload.map((p) => (
                <div key={p.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                    <span className="capitalize">{p.name}:</span>
                    <span className="font-semibold text-foreground">{formatCurrency(p.value)}</span>
                </div>
            ))}
        </div>
    );
}

function OrderTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }): React.JSX.Element | null {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-sm">
            <p className="mb-2 text-xs font-semibold text-foreground">{label}</p>
            {payload.map((p) => (
                <div key={p.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                    <span className="capitalize">{p.name}:</span>
                    <span className="font-semibold text-foreground">{p.value}</span>
                </div>
            ))}
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function DashboardOverview(): React.JSX.Element {
    const t = useTranslations('dashboard');
    const [revenueRange, setRevenueRange] = useState<'3ay' | '6ay' | '12ay'>('12ay');

    const slicedRevenue =
        revenueRange === '3ay' ? revenueData.slice(-3) :
            revenueRange === '6ay' ? revenueData.slice(-6) :
                revenueData;

    const totalRevenue = revenueData.reduce((s, d) => s + d.gelir, 0);
    const totalProfit = revenueData.reduce((s, d) => s + d.kar, 0);

    return (
        <div className="space-y-6">

            {/* ── KPI Cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KPICard
                    label={t('totalRevenue')}
                    value={formatCurrency(totalRevenue)}
                    change="+18.2%"
                    trend="up"
                    icon={TrendingUp}
                    gradient="bg-gradient-to-br from-violet-600 to-indigo-600"
                    sublabel={t('lastYear')}
                />
                <KPICard
                    label={t('totalOrders')}
                    value="18,492"
                    change="+8.4%"
                    trend="up"
                    icon={ShoppingCart}
                    gradient="bg-gradient-to-br from-blue-600 to-cyan-600"
                    sublabel={t('thisYear')}
                />
                <KPICard
                    label={t('activeUsers')}
                    value="2,847"
                    change="+12.1%"
                    trend="up"
                    icon={Users}
                    gradient="bg-gradient-to-br from-emerald-600 to-teal-600"
                    sublabel={t('monthlyActive')}
                />
                <KPICard
                    label={t('productCount')}
                    value="1,204"
                    change="-2.3%"
                    trend="down"
                    icon={Package}
                    gradient="bg-gradient-to-br from-orange-500 to-rose-500"
                    sublabel={t('inStock')}
                />
            </div>

            {/* ── Secondary Spark Cards ──────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <SparkCard label={t('conversionRate')} value="3.4%" change="+0.8%" trend="up" color="#6366f1" />
                <SparkCard label={t('avgOrder')} value="₺1,847" change="+5.2%" trend="up" color="#8b5cf6" />
                <SparkCard label={t('returnRate')} value="2.1%" change="-0.3%" trend="down" color="#10b981" />
                <SparkCard label={t('customerSatisfaction')} value="4.8 / 5" change="+0.2" trend="up" color="#f59e0b" />
            </div>

            {/* ── Revenue Chart + Pie ────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Revenue / Cost / Profit — Area Chart */}
                <SectionCard
                    title={t('revenueAndProfitTitle')}
                    subtitle={t('totalNetProfit', { value: formatCurrency(totalProfit) })}
                    className="lg:col-span-2"
                    action={
                        <div className="flex gap-1 rounded-lg border border-border p-0.5">
                            {(['3ay', '6ay', '12ay'] as const).map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRevenueRange(r)}
                                    className={cn(
                                        'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                                        revenueRange === r
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    }
                >
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={slicedRevenue} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <defs>
                                <linearGradient id="gradGelir" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradKar" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.6} />
                            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₺${(v / 1000).toFixed(0)}K`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                            <Area type="monotone" dataKey="gelir" name="Gelir" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradGelir)" dot={false} activeDot={{ r: 5 }} />
                            <Area type="monotone" dataKey="gider" name="Gider" stroke="#f59e0b" strokeWidth={2} fill="none" strokeDasharray="5 3" dot={false} activeDot={{ r: 4 }} />
                            <Area type="monotone" dataKey="kar" name="Kâr" stroke="#10b981" strokeWidth={2.5} fill="url(#gradKar)" dot={false} activeDot={{ r: 5 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </SectionCard>

                {/* Category Pie */}
                <SectionCard title={t('categoryDistribution')} subtitle={t('bySalesRate')}>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={85}
                                paddingAngle={3}
                                dataKey="value"
                                shape={(props) => <Sector {...props} fill={props.color} />}
                            >
                                {categoryData.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: any, name: any) => [`${value}%`, name]} />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div className="mt-3 space-y-2">
                        {categoryData.map((c) => (
                            <div key={c.name} className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                                    {c.name}
                                </span>
                                <span className="font-semibold text-foreground">{c.value}%</span>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* ── Orders Bar + Traffic Radial ────────────────────────────── */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Weekly Orders */}
                <SectionCard
                    title={t('weeklyOrders')}
                    subtitle={t('last7Days')}
                    className="lg:col-span-2"
                >
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={orderData} barGap={4} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" strokeOpacity={0.6} vertical={false} />
                            <XAxis dataKey="gun" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<OrderTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                            <Bar dataKey="sipariş" name="Sipariş" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={44} />
                            <Bar dataKey="iptal" name="İptal" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={44} />
                            <Bar dataKey="iade" name="İade" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={44} />
                        </BarChart>
                    </ResponsiveContainer>
                </SectionCard>

                {/* Traffic Sources */}
                <SectionCard title={t('trafficSources')} subtitle={t('thisMonth')}>
                    <ResponsiveContainer width="100%" height={180}>
                        <RadialBarChart
                            cx="50%"
                            cy="50%"
                            innerRadius={20}
                            outerRadius={85}
                            barSize={12}
                            data={trafficData}
                            startAngle={90}
                            endAngle={-270}
                        >
                            <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'var(--color-border)' }} />
                            <Tooltip formatter={(value: any, name: any) => [`${value}%`, name]} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="mt-2 space-y-2.5">
                        {trafficData.map((t) => (
                            <div key={t.name} className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: t.fill }} />
                                    {t.name}
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                                        <div className="h-full rounded-full" style={{ width: `${t.value}%`, background: t.fill }} />
                                    </div>
                                    <span className="w-8 text-right font-semibold text-foreground">{t.value}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionCard>
            </div>

            {/* ── Conversion Funnel ─────────────────────────────────────── */}
            <SectionCard title={t('conversionFunnel')} subtitle={t('visitorToOrder')}>
                <div className="flex flex-col sm:flex-row gap-3 items-end justify-center">
                    {conversionFunnel.map((step, i) => (
                        <div key={step.labelKey} className="flex-1 flex flex-col items-center gap-2">
                            <div className="text-center">
                                <p className="text-lg font-bold text-foreground">
                                    {step.value.toLocaleString('tr-TR')}
                                </p>
                                <p className="text-[10px] text-muted-foreground">{step.pct}%</p>
                            </div>
                            <div
                                className="w-full rounded-lg transition-all duration-500"
                                style={{
                                    height: `${Math.max(20, step.pct * 1.6)}px`,
                                    background: step.color,
                                    opacity: 1 - i * 0.12,
                                }}
                            />
                            <p className="text-xs font-medium text-muted-foreground text-center">{step.labelKey}</p>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* ── Bottom: Top Products + Recent Orders ──────────────────── */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

                {/* Top Products */}
                <SectionCard title={t('topSellingProducts')} subtitle={t('topSellingSubtitle')}>
                    <div className="space-y-3">
                        {topProducts.map((p) => (
                            <div
                                key={p.rank}
                                className="flex items-center gap-4 rounded-xl border border-border p-3 hover:bg-accent/50 transition-colors"
                            >
                                <div className={cn(
                                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white',
                                    p.rank === 1 ? 'bg-yellow-500' :
                                        p.rank === 2 ? 'bg-slate-400' :
                                            p.rank === 3 ? 'bg-amber-600' : 'bg-muted text-muted-foreground',
                                )}>
                                    {p.rank === 1 ? <Star className="h-4 w-4" /> : p.rank}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                                    <p className="text-xs text-muted-foreground">{p.category}</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-sm font-bold text-foreground">{p.revenue}</p>
                                    <p className="text-xs text-muted-foreground">{p.sales.toLocaleString('tr-TR')} {t('pieces')}</p>
                                </div>
                                <span className={cn(
                                    'flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
                                    p.trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
                                )}>
                                    {p.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                    {p.change}
                                </span>
                            </div>
                        ))}
                    </div>
                </SectionCard>

                {/* Recent Orders */}
                <SectionCard title={t('recentOrders')} subtitle={t('realTime')}>
                    <div className="space-y-2">
                        {recentOrders.map((o) => (
                            <div
                                key={o.id}
                                className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-accent/50 transition-colors"
                            >
                                {/* Avatar placeholder */}
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
                                    {o.customer.charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-foreground">{o.customer}</p>
                                    <p className="truncate text-[10px] text-muted-foreground">{o.product}</p>
                                </div>
                                <div className="shrink-0 text-right">
                                    <p className="text-xs font-bold text-foreground">{o.amount}</p>
                                    <span className={cn(
                                        'rounded-full px-2 py-0.5 text-[10px] font-medium',
                                        STATUS_STYLES[o.status] ?? 'bg-muted text-muted-foreground',
                                    )}>
                                        {o.status}
                                    </span>
                                </div>
                                <div className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    {o.time}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Live indicator */}
                    <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        </span>
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            {t('liveTracking')}
                        </span>
                    </div>
                </SectionCard>
            </div>

            {/* ── Quick Stats Row ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* Server health */}
                <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                        <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">{t('systemStatus')}</p>
                        <p className="text-xs text-muted-foreground">API <span className="text-emerald-500 font-medium">99.98%</span> uptime · 42ms</p>
                    </div>
                </div>
                {/* Page views */}
                <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                        <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">{t('pageViews')}</p>
                        <p className="text-xs text-muted-foreground"><span className="text-blue-500 font-medium">124,500</span> {t('thisMonth')} · +31%</p>
                    </div>
                </div>
                {/* Alerts */}
                <div className="flex items-center gap-4 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/10 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">{t('lowStockAlert')}</p>
                        <p className="text-xs text-muted-foreground">{t('lowStockDescription', { count: 14 })}</p>
                    </div>
                </div>
            </div>

        </div>
    );
}
