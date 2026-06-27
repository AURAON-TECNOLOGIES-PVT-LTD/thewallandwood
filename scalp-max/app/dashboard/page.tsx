'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

interface Visit {
  id: number;
  page: string;
  ip: string;
  user_agent: string;
  visited_at: string;
}

interface DashboardData {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  lastHour: number;
  recent: Visit[];
  byPage: Record<string, number>;
  byDay: Record<string, number>;
  byDevice: Record<string, number>;
  byBrowser: Record<string, number>;
  byHour: Record<string, number>;
}

interface OrderStats {
  totalOrders: number;
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
  totalRevenue: number;
  todayRevenue: number;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function getDeviceEmoji(ua: string) {
  if (/mobile/i.test(ua)) return '📱';
  if (/tablet|ipad/i.test(ua)) return '📟';
  return '🖥️';
}

const DEVICE_COLORS: Record<string, string> = {
  Desktop: '#2BA8A8',
  Mobile: '#F5A623',
  Tablet: '#6366F1',
};

const BROWSER_COLORS: Record<string, string> = {
  Chrome: '#4285F4',
  Safari: '#1D9BF0',
  Firefox: '#FF7139',
  Edge: '#0078D4',
  Opera: '#FF1B2D',
  Other: '#BBBBBB',
};

function downloadCSV(data: Visit[]) {
  const headers = ['ID', 'Page', 'IP', 'Device', 'Time'];
  const rows = data.map((v) => {
    const device = /mobile/i.test(v.user_agent) ? 'Mobile' : /tablet|ipad/i.test(v.user_agent) ? 'Tablet' : 'Desktop';
    return [v.id, v.page, v.ip, device, new Date(v.visited_at).toLocaleString('en-IN')];
  });
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `visits_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'traffic' | 'visitors' | 'log'>('overview');
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [visitsRes, ordersRes] = await Promise.all([
        fetch('/api/track-visit'),
        fetch('/api/orders-stats'),
      ]);
      const json = await visitsRes.json();
      const ordersJson = await ordersRes.json();
      setData(json);
      setOrderStats(ordersJson);
      setLastRefresh(new Date());
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleLogout = async () => {
    await fetch('/api/dashboard-auth', { method: 'DELETE' });
    router.push('/dashboard/login');
  };

  // Last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });

  // Last 7 days for overview
  const last7Days = last30Days.slice(-7);

  // Hours 0-23
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

  const maxDay = data ? Math.max(...last30Days.map((d) => data.byDay[d] ?? 0), 1) : 1;
  const maxPage = data ? Math.max(...Object.values(data.byPage), 1) : 1;
  const maxHour = data ? Math.max(...hours.map((h) => data.byHour[h] ?? 0), 1) : 1;
  const totalDevice = data ? Object.values(data.byDevice).reduce((a, b) => a + b, 0) || 1 : 1;
  const totalBrowser = data ? Object.values(data.byBrowser).reduce((a, b) => a + b, 0) || 1 : 1;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '◉' },
    { id: 'traffic', label: 'Traffic', icon: '↗' },
    { id: 'visitors', label: 'Visitors', icon: '◎' },
    { id: 'log', label: 'Activity Log', icon: '≡' },
  ] as const;

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <div className={styles.logoMark}>SM</div>
            <div className={styles.logoInfo}>
              <span className={styles.logoText}>SCALP MAX<sup>®</sup></span>
              <span className={styles.logoBadge}>Analytics</span>
            </div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav className={styles.tabNav}>
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`${styles.tabBtn} ${activeTab === t.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <span className={styles.tabIcon}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className={styles.headerRight}>
          <div className={styles.livePill}>
            <span className={styles.liveDot} />
            Live
          </div>
          <button className={styles.refreshBtn} onClick={fetchData} disabled={loading} id="dashboard-refresh">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
            </svg>
          </button>
          <button className={styles.exportBtn} onClick={() => data && downloadCSV(data.recent)} id="dashboard-export">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span className={styles.btnLabel}>Export</span>
          </button>
          <a href="/" className={styles.siteBtn} id="dashboard-home">Site</a>
          <button className={styles.logoutBtn} onClick={handleLogout} id="dashboard-logout">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>

          {/* Mobile menu */}
          <button className={styles.menuBtn} onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Mobile Tab Drawer */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`${styles.mobileTab} ${activeTab === t.id ? styles.mobileTabActive : ''}`}
              onClick={() => { setActiveTab(t.id); setMenuOpen(false); }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Mobile tab strip */}
      <div className={styles.mobileTabStrip}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`${styles.mobileStripBtn} ${activeTab === t.id ? styles.mobileStripActive : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            <span className={styles.stripIcon}>{t.icon}</span>
            <span className={styles.stripLabel}>{t.label}</span>
          </button>
        ))}
      </div>

      <main className={styles.main}>
        {loading && !data ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading analytics…</p>
          </div>
        ) : (
          <>
            {/* Refreshed at */}
            <div className={styles.refreshMeta}>
              Updated {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <>
                {/* Visit Stat Cards */}
                <div className={styles.sectionLabel}>📊 Website Traffic</div>
                <div className={styles.statsGrid}>
                  {[
                    { id: 'total', label: 'All Time', value: data?.total ?? 0, color: '#2BA8A8', bg: 'rgba(43,168,168,0.1)',
                      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2BA8A8" strokeWidth="1.7"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>, pulse: true },
                    { id: 'today', label: 'Today', value: data?.today ?? 0, color: '#F5A623', bg: 'rgba(245,166,35,0.1)',
                      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="1.7"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg> },
                    { id: 'week', label: 'This Week', value: data?.thisWeek ?? 0, color: '#6366F1', bg: 'rgba(99,102,241,0.1)',
                      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.7"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
                    { id: 'month', label: 'This Month', value: data?.thisMonth ?? 0, color: '#10B981', bg: 'rgba(16,185,129,0.1)',
                      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.7"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg> },
                    { id: 'hour', label: 'Last Hour', value: data?.lastHour ?? 0, color: '#EC4899', bg: 'rgba(236,72,153,0.1)',
                      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="1.7"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg> },
                    { id: 'pages', label: 'Pages Tracked', value: Object.keys(data?.byPage ?? {}).length, color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)',
                      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.7"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> },
                  ].map((s) => (
                    <div className={styles.statCard} key={s.id} id={`stat-${s.id}`}>
                      <div className={styles.statIcon} style={{ background: s.bg }}>{s.icon}</div>
                      <div className={styles.statBody}>
                        <span className={styles.statLabel}>{s.label}</span>
                        <span className={styles.statValue} style={{ color: s.color }}>
                          {s.value.toLocaleString('en-IN')}
                        </span>
                      </div>
                      {s.pulse && <div className={styles.statPulse} />}
                    </div>
                  ))}
                </div>

                {/* Order Stat Cards */}
                <div className={styles.sectionLabel}>🛒 Orders</div>
                <div className={styles.statsGrid}>
                  {[
                    { id: 'ord-total', label: 'Total Orders', value: orderStats?.totalOrders ?? 0, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', prefix: '',
                      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.7"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>, pulse: true },
                    { id: 'ord-today', label: "Today's Orders", value: orderStats?.todayOrders ?? 0, color: '#34D399', bg: 'rgba(52,211,153,0.1)', prefix: '',
                      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.7"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg> },
                    { id: 'ord-week', label: 'This Week', value: orderStats?.weekOrders ?? 0, color: '#818CF8', bg: 'rgba(129,140,248,0.1)', prefix: '',
                      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="1.7"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
                    { id: 'ord-month', label: 'This Month', value: orderStats?.monthOrders ?? 0, color: '#60A5FA', bg: 'rgba(96,165,250,0.1)', prefix: '',
                      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="1.7"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg> },
                    { id: 'ord-revenue', label: 'Total Revenue', value: orderStats?.totalRevenue ?? 0, color: '#C9A84C', bg: 'rgba(201,168,76,0.1)', prefix: '₹',
                      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.7"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
                    { id: 'ord-today-rev', label: "Today's Revenue", value: orderStats?.todayRevenue ?? 0, color: '#F472B6', bg: 'rgba(244,114,182,0.1)', prefix: '₹',
                      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F472B6" strokeWidth="1.7"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg> },
                  ].map((s) => (
                    <div className={styles.statCard} key={s.id} id={`stat-${s.id}`}>
                      <div className={styles.statIcon} style={{ background: s.bg }}>{s.icon}</div>
                      <div className={styles.statBody}>
                        <span className={styles.statLabel}>{s.label}</span>
                        <span className={styles.statValue} style={{ color: s.color }}>
                          {s.prefix}{s.value.toLocaleString('en-IN')}
                        </span>
                      </div>
                      {s.pulse && <div className={styles.statPulse} />}
                    </div>
                  ))}
                </div>

                {/* Mini 7-day chart + top pages */}
                <div className={styles.overviewRow}>
                  <div className={styles.chartCard}>
                    <h2 className={styles.chartTitle}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>
                      Last 7 Days
                    </h2>
                    <div className={styles.barChart}>
                      {last7Days.map((day) => {
                        const count = data?.byDay[day] ?? 0;
                        const pct = (count / maxDay) * 100;
                        const label = new Date(day + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short' });
                        return (
                          <div key={day} className={styles.barGroup}>
                            <span className={styles.barValue}>{count > 0 ? count : ''}</span>
                            <div className={styles.barTrack}>
                              <div className={styles.bar} style={{ height: `${Math.max(pct, count > 0 ? 5 : 0)}%` }} />
                            </div>
                            <span className={styles.barLabel}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={styles.chartCard}>
                    <h2 className={styles.chartTitle}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>
                      Top Pages
                    </h2>
                    <div className={styles.pageList}>
                      {Object.entries(data?.byPage ?? {}).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([page, count]) => (
                        <div key={page} className={styles.pageRow}>
                          <div className={styles.pageRowTop}>
                            <span className={styles.pageName}>{page || '/'}</span>
                            <span className={styles.pageCount}>{count}</span>
                          </div>
                          <div className={styles.pageTrack}>
                            <div className={styles.pageBar} style={{ width: `${Math.round((count / maxPage) * 100)}%` }} />
                          </div>
                        </div>
                      ))}
                      {!data?.byPage || Object.keys(data.byPage).length === 0 && <p className={styles.emptyNote}>No data yet</p>}
                    </div>
                  </div>
                </div>

                {/* Device + Browser */}
                <div className={styles.overviewRow}>
                  <div className={styles.chartCard}>
                    <h2 className={styles.chartTitle}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                      Device Breakdown
                    </h2>
                    <div className={styles.breakdownList}>
                      {Object.entries(data?.byDevice ?? {}).sort((a, b) => b[1] - a[1]).map(([device, count]) => {
                        const pct = Math.round((count / totalDevice) * 100);
                        return (
                          <div key={device} className={styles.breakdownRow}>
                            <div className={styles.breakdownLabel}>
                              <span className={styles.breakdownDot} style={{ background: DEVICE_COLORS[device] || '#ccc' }} />
                              <span>{device}</span>
                            </div>
                            <div className={styles.breakdownTrack}>
                              <div className={styles.breakdownBar} style={{ width: `${pct}%`, background: DEVICE_COLORS[device] || '#ccc' }} />
                            </div>
                            <span className={styles.breakdownPct}>{pct}%</span>
                            <span className={styles.breakdownCount}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={styles.chartCard}>
                    <h2 className={styles.chartTitle}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                      Browser Breakdown
                    </h2>
                    <div className={styles.breakdownList}>
                      {Object.entries(data?.byBrowser ?? {}).sort((a, b) => b[1] - a[1]).map(([browser, count]) => {
                        const pct = Math.round((count / totalBrowser) * 100);
                        return (
                          <div key={browser} className={styles.breakdownRow}>
                            <div className={styles.breakdownLabel}>
                              <span className={styles.breakdownDot} style={{ background: BROWSER_COLORS[browser] || '#ccc' }} />
                              <span>{browser}</span>
                            </div>
                            <div className={styles.breakdownTrack}>
                              <div className={styles.breakdownBar} style={{ width: `${pct}%`, background: BROWSER_COLORS[browser] || '#ccc' }} />
                            </div>
                            <span className={styles.breakdownPct}>{pct}%</span>
                            <span className={styles.breakdownCount}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── TRAFFIC TAB ── */}
            {activeTab === 'traffic' && (
              <>
                <div className={styles.chartCardFull}>
                  <h2 className={styles.chartTitle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg>
                    Daily Visits — Last 30 Days
                  </h2>
                  <div className={styles.barChartWide}>
                    {last30Days.map((day) => {
                      const count = data?.byDay[day] ?? 0;
                      const pct = (count / maxDay) * 100;
                      const label = new Date(day + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                      return (
                        <div key={day} className={styles.barGroupThin}>
                          <div className={styles.barTrack}>
                            <div className={styles.bar} style={{ height: `${Math.max(pct, count > 0 ? 3 : 0)}%` }}
                              title={`${label}: ${count} visits`} />
                          </div>
                          <span className={styles.barLabelThin}>{count > 0 ? label : ''}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.chartCardFull}>
                  <h2 className={styles.chartTitle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                    Visits by Hour — Today
                  </h2>
                  <div className={styles.barChartWide}>
                    {hours.map((h) => {
                      const count = data?.byHour[h] ?? 0;
                      const pct = (count / maxHour) * 100;
                      return (
                        <div key={h} className={styles.barGroupThin}>
                          <div className={styles.barTrack}>
                            <div className={styles.barHour} style={{ height: `${Math.max(pct, count > 0 ? 3 : 0)}%` }}
                              title={`${h}:00 — ${count} visits`} />
                          </div>
                          <span className={styles.barLabelThin}>{parseInt(h) % 4 === 0 ? `${h}h` : ''}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.chartCardFull}>
                  <h2 className={styles.chartTitle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    All Pages — Visit Count
                  </h2>
                  <div className={styles.pageListFull}>
                    {Object.entries(data?.byPage ?? {}).sort((a, b) => b[1] - a[1]).map(([page, count], i) => (
                      <div key={page} className={styles.pageRowFull}>
                        <span className={styles.pageRank}>#{i + 1}</span>
                        <span className={styles.pageNameFull}>{page || '/'}</span>
                        <div className={styles.pageTrackFull}>
                          <div className={styles.pageBarFull} style={{ width: `${Math.round((count / maxPage) * 100)}%` }} />
                        </div>
                        <span className={styles.pageCountFull}>{count} visits</span>
                      </div>
                    ))}
                    {Object.keys(data?.byPage ?? {}).length === 0 && <p className={styles.emptyNote}>No data yet</p>}
                  </div>
                </div>
              </>
            )}

            {/* ── VISITORS TAB ── */}
            {activeTab === 'visitors' && (
              <div className={styles.overviewRow}>
                <div className={styles.chartCard}>
                  <h2 className={styles.chartTitle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                    Device Type
                  </h2>
                  <div className={styles.breakdownList}>
                    {Object.entries(data?.byDevice ?? {}).sort((a, b) => b[1] - a[1]).map(([device, count]) => {
                      const pct = Math.round((count / totalDevice) * 100);
                      return (
                        <div key={device} className={styles.breakdownRowLarge}>
                          <div className={styles.breakdownTop}>
                            <div className={styles.breakdownLabel}>
                              <span className={styles.breakdownDotLg} style={{ background: DEVICE_COLORS[device] || '#ccc' }} />
                              <span className={styles.breakdownName}>{device}</span>
                            </div>
                            <span className={styles.breakdownBig}>{pct}%</span>
                          </div>
                          <div className={styles.breakdownTrackLg}>
                            <div className={styles.breakdownBar} style={{ width: `${pct}%`, background: DEVICE_COLORS[device] || '#ccc' }} />
                          </div>
                          <span className={styles.breakdownSub}>{count} visits</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.chartCard}>
                  <h2 className={styles.chartTitle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                    Browser Used
                  </h2>
                  <div className={styles.breakdownList}>
                    {Object.entries(data?.byBrowser ?? {}).sort((a, b) => b[1] - a[1]).map(([browser, count]) => {
                      const pct = Math.round((count / totalBrowser) * 100);
                      return (
                        <div key={browser} className={styles.breakdownRowLarge}>
                          <div className={styles.breakdownTop}>
                            <div className={styles.breakdownLabel}>
                              <span className={styles.breakdownDotLg} style={{ background: BROWSER_COLORS[browser] || '#ccc' }} />
                              <span className={styles.breakdownName}>{browser}</span>
                            </div>
                            <span className={styles.breakdownBig}>{pct}%</span>
                          </div>
                          <div className={styles.breakdownTrackLg}>
                            <div className={styles.breakdownBar} style={{ width: `${pct}%`, background: BROWSER_COLORS[browser] || '#ccc' }} />
                          </div>
                          <span className={styles.breakdownSub}>{count} visits</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── ACTIVITY LOG TAB ── */}
            {activeTab === 'log' && (
              <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                  <h2 className={styles.chartTitle}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    Activity Log — Last 100 Visits
                  </h2>
                  <button className={styles.exportBtnSm} onClick={() => data && downloadCSV(data.recent)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download CSV
                  </button>
                </div>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr><th>#</th><th>Page</th><th>Device</th><th>Browser</th><th>IP</th><th>Time</th></tr>
                    </thead>
                    <tbody>
                      {(data?.recent ?? []).map((v, i) => {
                        const ua = v.user_agent;
                        const device = /mobile/i.test(ua) ? 'Mobile' : /tablet|ipad/i.test(ua) ? 'Tablet' : 'Desktop';
                        const browser = /edg\//i.test(ua) ? 'Edge' : /chrome/i.test(ua) && !/chromium/i.test(ua) ? 'Chrome' : /firefox/i.test(ua) ? 'Firefox' : /safari/i.test(ua) && !/chrome/i.test(ua) ? 'Safari' : 'Other';
                        return (
                          <tr key={v.id}>
                            <td className={styles.tdNum}>{i + 1}</td>
                            <td><span className={styles.pagePill}>{v.page || '/'}</span></td>
                            <td>
                              <span className={styles.deviceChip} style={{ background: `${DEVICE_COLORS[device]}18`, color: DEVICE_COLORS[device], borderColor: `${DEVICE_COLORS[device]}33` }}>
                                {getDeviceEmoji(ua)} {device}
                              </span>
                            </td>
                            <td>
                              <span className={styles.browserChip} style={{ background: `${BROWSER_COLORS[browser]}18`, color: BROWSER_COLORS[browser], borderColor: `${BROWSER_COLORS[browser]}33` }}>
                                {browser}
                              </span>
                            </td>
                            <td className={styles.tdIp}>{v.ip}</td>
                            <td className={styles.tdTime}>{timeAgo(v.visited_at)}</td>
                          </tr>
                        );
                      })}
                      {(data?.recent ?? []).length === 0 && (
                        <tr><td colSpan={6} className={styles.emptyRow}>No visits yet. Browse the site to see data.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
