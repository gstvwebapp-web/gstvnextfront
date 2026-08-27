import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const response = await fetch(API_ENDPOINTS.ELECTION_MODULE, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
    });

    if (!response.ok) {
      console.warn(`[electionmodule] API returned ${response.status}`);
      return NextResponse.json({ status: false, data: [] });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[electionmodule] Fetch error:', error);
    return NextResponse.json({ status: false, data: [] });
  }
}
