export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 30;

import { NextResponse } from 'next/server';
import { API_ENDPOINTS, MEDIA_BASE_URL } from '@/constants/api';

type NewsItem = {
  slug: string;
  categorySlugs: string;
  updated_at: string;
  catIDs: number[] | string;
};

export async function GET(
  req: Request,
  { params }: { params: { page: string } }
) {
  const { page } = params;

  const BASE_URL = MEDIA_BASE_URL || 'https://www.gstv.in';

  const pageNumber = Number(page) || 1;
  const perPage = 1000;
  const offset = (pageNumber - 1) * perPage;

  try {
    const res = await fetch(
      `${API_ENDPOINTS.SITEMAP_NEWS_SITEMAP}?offset=${offset}&limit=${perPage}`,
      { cache: 'no-store' }
    );

    if (!res.ok) throw new Error('Failed to fetch sitemap data');

    const newsItems: NewsItem[] = await res.json();

    let urls = '';

    for (const news of newsItems) {
      if (!news.slug) continue;

      const catIDs = Array.isArray(news.catIDs)
        ? news.catIDs
        : String(news.catIDs || '').split(',').map(Number);

      const newsUrl = catIDs.includes(9)
        ? `${BASE_URL}/${news.categorySlugs}/${news.slug}`
        : `${BASE_URL}/news/${news.categorySlugs}/${news.slug}`;

      let lastMod = new Date().toISOString();
      try {
        if (news.updated_at) {
          const parsedDate = new Date(news.updated_at);
          if (!isNaN(parsedDate.getTime())) {
            lastMod = parsedDate.toISOString();
          }
        }
      } catch {
        // fallback
      }

      urls += `
<url>
  <loc>${newsUrl}</loc>
  <lastmod>${lastMod}</lastmod>
  <priority>0.7</priority>
</url>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  } catch (e) {
    console.error('sitemap-news page error:', e);
    return new NextResponse('Sitemap error', { status: 500 });
  }
}
