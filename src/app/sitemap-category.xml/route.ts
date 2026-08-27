import { NextResponse } from 'next/server';
import { API_ENDPOINTS,MEDIA_BASE_URL } from '@/constants/api';

type Category = {
  slugPath: string;
  updated_at: string;
};

export async function GET(): Promise<NextResponse> {
  const BASE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || MEDIA_BASE_URL || 'https://www.gstv.in';

  try {
    const res = await fetch(API_ENDPOINTS.SITEMAP_CATEGORIES, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch category sitemap data');
    }

    const categories: Category[] = await res.json();

    let urls = '';

    for (const cat of categories) {
      urls += `
<url>
  <loc>${BASE_URL}/category/${cat.slugPath}</loc>
  <lastmod>${new Date(cat.updated_at).toISOString()}</lastmod>
  <priority>1.0</priority>
</url>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    return new NextResponse('Category sitemap error', { status: 500 });
  }
}
