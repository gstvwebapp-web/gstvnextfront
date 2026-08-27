export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 60;

import { NextResponse } from 'next/server';
import { API_ENDPOINTS, MEDIA_BASE_URL } from '@/constants/api';

type SitemapCountResponse = {
  total: number;
};

export async function GET(): Promise<NextResponse> {
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || MEDIA_BASE_URL || 'https://www.gstv.in';

  try {
    // Fetch total news count
    const res = await fetch(API_ENDPOINTS.SITEMAP_NEWS_COUNT, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch sitemap count');
    }

    const data: SitemapCountResponse = await res.json();
    const { total } = data;

    const perPage = 1000;
    const totalPages = Math.ceil(total / perPage);

    let sitemaps = '';
    const nowIso = new Date().toISOString();

    // News sitemaps
    for (let i = 1; i <= totalPages; i++) {
      sitemaps += `
<sitemap>
  <loc>${BASE_URL}/sitemap-news-${i}.xml</loc>
  <lastmod>${nowIso}</lastmod>
</sitemap>`;
    }

    // Category, Webstory, Videos & Google News sitemaps
    sitemaps += `
<sitemap>
  <loc>${BASE_URL}/sitemap-category.xml</loc>
  <lastmod>${nowIso}</lastmod>
</sitemap>
<sitemap>
  <loc>${BASE_URL}/sitemap-webstory.xml</loc>
  <lastmod>${nowIso}</lastmod>
</sitemap>
<sitemap>
  <loc>${BASE_URL}/sitemap-videos.xml</loc>
  <lastmod>${nowIso}</lastmod>
</sitemap>
<sitemap>
  <loc>${BASE_URL}/sitemap-news-google.xml</loc>
  <lastmod>${nowIso}</lastmod>
</sitemap>`;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    return new NextResponse('Sitemap error', { status: 500 });
  }
}