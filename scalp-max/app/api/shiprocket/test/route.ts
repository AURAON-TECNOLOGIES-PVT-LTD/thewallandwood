import { NextResponse } from 'next/server';

// GET /api/shiprocket/test
// Use this to verify Shiprocket credentials are correctly set in Vercel env vars
export async function GET() {
  const email = process.env.SHIPROCKET_API_EMAIL?.trim();
  const password = process.env.SHIPROCKET_API_PASSWORD?.trim();
  const channelId = process.env.SHIPROCKET_CHANNEL_ID?.trim();

  // Check if credentials exist
  if (!email || !password) {
    return NextResponse.json({
      status: 'error',
      message: 'SHIPROCKET_API_EMAIL or SHIPROCKET_API_PASSWORD is missing from environment variables.',
      hint: 'Go to Vercel → Settings → Environment Variables and add them, then redeploy.',
    }, { status: 500 });
  }

  // Try to login
  const authRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const authData = await authRes.json();

  if (!authRes.ok || !authData.token) {
    return NextResponse.json({
      status: 'error',
      message: 'Shiprocket login failed.',
      details: authData,
      configuredEmail: email,
      channelId,
    }, { status: 500 });
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Shiprocket credentials are working correctly.',
    configuredEmail: email,
    channelId,
    tokenPreview: authData.token.substring(0, 15) + '...',
  });
}
