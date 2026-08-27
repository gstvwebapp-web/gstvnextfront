import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageNumber = '1', per_page = '8' } = body;

    const response = await fetch(API_ENDPOINTS.BUDDHIPRAKASHAN, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
      body: JSON.stringify({ pageNumber: String(pageNumber), per_page: String(per_page) }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `External API error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[buddhiprakash] route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const response = await fetch(API_ENDPOINTS.BUDDHIPRAKASHAN, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `External API error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[buddhiprakash] GET route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
