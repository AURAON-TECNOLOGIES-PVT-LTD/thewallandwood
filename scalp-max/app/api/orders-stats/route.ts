import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all orders (limit 1000 — enough for a small store)
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, total, created_at, status')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      console.error('orders-stats fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const allOrders = orders ?? [];

    const totalOrders = allOrders.length;

    const todayOrders = allOrders.filter(
      (o) => new Date(o.created_at) >= startOfToday
    ).length;

    const weekOrders = allOrders.filter(
      (o) => new Date(o.created_at) >= startOfWeek
    ).length;

    const monthOrders = allOrders.filter(
      (o) => new Date(o.created_at) >= startOfMonth
    ).length;

    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total ?? 0), 0);

    const todayRevenue = allOrders
      .filter((o) => new Date(o.created_at) >= startOfToday)
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
