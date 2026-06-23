import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function getDeviceType(ua: string): string {
  if (/mobile/i.test(ua)) return 'Mobile';
  if (/tablet|ipad/i.test(ua)) return 'Tablet';
  return 'Desktop';
}

function getBrowser(ua: string): string {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/chrome/i.test(ua) && !/chromium/i.test(ua)) return 'Chrome';
  if (/firefox/i.test(ua)) return 'Firefox';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
  if (/opr\//i.test(ua)) return 'Opera';
  return 'Other';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const page = body.page || '/';
    const userAgent = req.headers.get('user-agent') || '';
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    const { error } = await supabase.from('page_visits').insert([
      { page, ip, user_agent: userAgent, visited_at: new Date().toISOString() },
    ]);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const { count } = await supabase
      .from('page_visits')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({ success: true, total: count ?? 0 });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET() {
  try {
    const now = new Date();

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);

    const monthStart = new Date(now);
    monthStart.setDate(now.getDate() - 30);

    const hourStart = new Date(now);
    hourStart.setHours(now.getHours() - 1);

    // Run all count queries in parallel
    const [
      { count: total },
      { count: todayCount },
      { count: weekCount },
      { count: monthCount },
      { count: hourCount },
    ] = await Promise.all([
      supabase.from('page_visits').select('*', { count: 'exact', head: true }),
      supabase.from('page_visits').select('*', { count: 'exact', head: true }).gte('visited_at', todayStart.toISOString()),
      supabase.from('page_visits').select('*', { count: 'exact', head: true }).gte('visited_at', weekStart.toISOString()),
      supabase.from('page_visits').select('*', { count: 'exact', head: true }).gte('visited_at', monthStart.toISOString()),
      supabase.from('page_visits').select('*', { count: 'exact', head: true }).gte('visited_at', hourStart.toISOString()),
    ]);

    // Recent visits (last 100)
    const { data: recent } = await supabase
      .from('page_visits')
      .select('*')
      .order('visited_at', { ascending: false })
      .limit(100);

    // All visits for breakdown (last 30 days)
    const { data: allVisits } = await supabase
      .from('page_visits')
      .select('page, user_agent, visited_at')
      .gte('visited_at', monthStart.toISOString())
      .order('visited_at', { ascending: true });

    // Build maps
    const pageMap: Record<string, number> = {};
    const dayMap: Record<string, number> = {};
    const deviceMap: Record<string, number> = { Mobile: 0, Desktop: 0, Tablet: 0 };
    const browserMap: Record<string, number> = {};
    const hourMap: Record<string, number> = {};

    (allVisits || []).forEach((r: { page: string; user_agent: string; visited_at: string }) => {
      // Page
      pageMap[r.page] = (pageMap[r.page] || 0) + 1;

      // Day (last 30 days)
      const day = r.visited_at.split('T')[0];
      dayMap[day] = (dayMap[day] || 0) + 1;

      // Device
      const device = getDeviceType(r.user_agent);
      deviceMap[device] = (deviceMap[device] || 0) + 1;

      // Browser
      const browser = getBrowser(r.user_agent);
      browserMap[browser] = (browserMap[browser] || 0) + 1;
    });

    // Hour-by-hour for today (0–23)
    const todayVisits = (recent || []).filter(
      (r: { visited_at: string }) => new Date(r.visited_at) >= todayStart
    );
    todayVisits.forEach((r: { visited_at: string }) => {
      const h = new Date(r.visited_at).getHours().toString().padStart(2, '0');
      hourMap[h] = (hourMap[h] || 0) + 1;
    });

    return NextResponse.json({
      total: total ?? 0,
      today: todayCount ?? 0,
      thisWeek: weekCount ?? 0,
      thisMonth: monthCount ?? 0,
      lastHour: hourCount ?? 0,
      recent: recent ?? [],
      byPage: pageMap,
      byDay: dayMap,
      byDevice: deviceMap,
      byBrowser: browserMap,
      byHour: hourMap,
    });
  } catch (err) {
    console.error('Dashboard fetch error:', err);
    return NextResponse.json({
      total: 0, today: 0, thisWeek: 0, thisMonth: 0, lastHour: 0,
      recent: [], byPage: {}, byDay: {}, byDevice: {}, byBrowser: {}, byHour: {},
    });
  }
}
