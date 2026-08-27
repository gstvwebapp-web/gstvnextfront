import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

// Server-side resolver for a single magazine issue by slug and date
// It proxies the v8 magazine endpoint and filters the response.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, date } = body || {};

    if (!slug || !date) {
      return NextResponse.json({ error: 'Slug and date are required' }, { status: 400 });
    }

    // Helper: normalize various date formats to DD-MM-YYYY for comparison
    const toDDMMYYYY = (d: string): string => {
      if (!d) return '';
      // If already DD-MM-YYYY
      if (/^\d{2}-\d{2}-\d{4}$/.test(d)) return d;
      // If YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        const [y, m, dd] = d.split('-');
        return `${dd}-${m}-${y}`;
      }
      // Try Date parse fallback
      const dt = new Date(d);
      if (!isNaN(dt.getTime())) {
        const dd = String(dt.getDate()).padStart(2, '0');
        const m = String(dt.getMonth() + 1).padStart(2, '0');
        const y = dt.getFullYear();
        return `${dd}-${m}-${y}`;
      }
      return d;
    };

    const reqBody = {
      pageNumber: '1',
      per_page: '50',
      epaper_cat: String(slug),
    } as Record<string, string>;

    const upstream = await fetch(API_ENDPOINTS.MAGAZINE, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(reqBody),
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `External API error: ${upstream.status}` },
        { status: upstream.status }
      );
    }

    const data = await upstream.json();

    // Extract array of magazines from possible shapes
    const collectMagazines = (payload: any): any[] => {
      if (!payload) return [];
      if (Array.isArray(payload.Magazine)) return payload.Magazine;
      if (payload.Magazine && Array.isArray(payload.Magazine.data)) return payload.Magazine.data;
      if (payload.magazinecity?.Magazine && Array.isArray(payload.magazinecity.Magazine)) return payload.magazinecity.Magazine;
      return [];
    };

    const magazines: any[] = collectMagazines(data) || [];
    const wantDate = toDDMMYYYY(String(date));

    // Try to find by either ecatslug or slug, and date match
    const match = magazines.find((m: any) => {
      const mSlug = m?.ecatslug || m?.slug || '';
      const mDate = toDDMMYYYY(String(m?.newspaperdate || ''));
      return mSlug === slug && mDate === wantDate;
    });

    if (!match) {
      return NextResponse.json({ magazine: null, magazinlist: data?.magazinlist || [] }, { status: 404 });
    }

    // Ensure Story_data is an array (some payloads may vary)
    const storyData = Array.isArray(match.Story_data) ? match.Story_data : [];

    return NextResponse.json({ magazine: { ...match, Story_data: storyData }, magazinlist: data?.magazinlist || [] });
  } catch (error) {
    console.error('📖 Magazine Detail API Route Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

