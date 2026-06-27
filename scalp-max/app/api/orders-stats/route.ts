import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// IST is UTC+5:30 = 330 minutes ahead
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function toIST(date: Date): Date {
  return new Date(date.getTime() + IST_OFFSET_MS);
}

function startOfDayIST(): Date {
  const ist = toIST(new Date());
  // Zero out hours in IST, then convert back to UTC for comparison
  const istMidnight = new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), 0, 0, 0));
  return new Date(istMidnight.getTime() - IST_OFFSET_MS);
}

function startOfWeekIST(): Date {
  const ist = toIST(new Date());
  const dayOfWeek = ist.getUTCDay(); // 0=Sun
  const istWeekStart = new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() - dayOfWeek, 0, 0, 0));
  return new Date(istWeekStart.getTime() - IST_OFFSET_MS);
}

function startOfMonthIST(): Date {
  const ist = toIST(new Date());
  const istMonthStart = new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), 1, 0, 0, 0));
  return new Date(istMonthStart.getTime() - IST_OFFSET_MS);
}

export async function GET() {
  try {
    // Fetch only PAID orders — pending/failed orders are excluded from all stats
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, total, created_at, status')
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('orders-stats fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const allOrders = orders ?? [];

    // Time boundaries in IST-corrected UTC timestamps
    const todayStart = startOfDayIST();
    const weekStart = startOfWeekIST();
    const monthStart = startOfMonthIST();

    const totalOrders = allOrders.length;

    const todayOrders = allOrders.filter(
      (o) => new Date(o.created_at) >= todayStart
    ).length;

    const weekOrders = allOrders.filter(
      (o) => new Date(o.created_at) >= weekStart
    ).length;

    const monthOrders = allOrders.filter(
      (o) => new Date(o.created_at) >= monthStart
    ).length;

    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total ?? 0), 0);

    const todayRevenue = allOrders
      .filter((o) => new Date(o.created_at) >= todayStart)
      .reduce((sum, o) => sum + (o.total ?? 0), 0);

    return NextResponse.json({
      totalOrders,
      todayOrders,
      weekOrders,
      monthOrders,
      totalRevenue,
      todayRevenue,
    });
  } catch (err) {
    console.error('orders-stats error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
