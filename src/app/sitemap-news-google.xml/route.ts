export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 30;

import { NextResponse } from 'next/server';
import { API_ENDPOINTS, MEDIA_BASE_URL } from '@/constants/api';

type NewsItem = {
  slug: string;
  categorySlugs: string;
  title: string;
  created_at: string;
  updated_at: string;
  catIDs: number[] | string;
};

export async function GET(req: Request) {
  const BASE_URL = MEDIA_BASE_URL || 'https://www.gstv.in';
  const PUBLICATION_NAME = 'GSTV - Gujarat Samachar';
  const PUBLICATION_LANG = 'gu';

  try {
    // Fetch latest news (last 2 days for Google News)
    const res = await fetch(`${API_ENDPOINTS.SITEMAP_NEWS_SITEMAP}?offset=0&limit=5000`, {
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('Failed to fetch news data');

    const newsItems: NewsItem[] = await res.json();
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    // Filter news from last 2 days, fallback to top 50 latest articles if empty
    let recentNews = newsItems.filter((news) => {
      try {
        const rawDate = news.updated_at || news.created_at;
        if (!rawDate) return false;
        const isoStr = String(rawDate).trim().replace(' ', 'T');
        const newsDate = new Date(isoStr);
        return !isNaN(newsDate.getTime()) && newsDate >= twoDaysAgo;
      } catch {
        return false;
      }
    });

    if (recentNews.length === 0) {
      recentNews = newsItems.slice(0, 50);
    }

    let urls = '';

    for (const news of recentNews) {
      if (!news.slug) continue;

      const catIDs = Array.isArray(news.catIDs)
        ? news.catIDs
        : String(news.catIDs || '').split(',').map(Number);

      const newsUrl = catIDs.includes(9)
        ? `${BASE_URL}/${news.categorySlugs}/${news.slug}`
        : `${BASE_URL}/news/${news.categorySlugs}/${news.slug}`;

      let publicationDate = new Date().toISOString();
      try {
        const rawDate = news.updated_at || news.created_at;
        if (rawDate) {
          const parsed = new Date(String(rawDate).trim().replace(' ', 'T'));
          if (!isNaN(parsed.getTime())) {
            publicationDate = parsed.toISOString();
          }
        }
      } catch {
        // fallback to current ISO
      }

      // Title formatting
      const titleText = news.title || news.slug.replace(/-/g, ' ');

      urls += `
<url>
  <loc>${newsUrl}</loc>
  <news:news>
    <news:publication>
      <news:name>${PUBLICATION_NAME}</news:name>
      <news:language>${PUBLICATION_LANG}</news:language>
    </news:publication>
    <news:publication_date>${publicationDate}</news:publication_date>
    <news:title>${escapeXml(titleText)}</news:title>
  </news:news>
</url>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  } catch (e) {
    console.error('Google News Sitemap error:', e);
    return new NextResponse('Sitemap error', { status: 500 });
  }
}

/**
 * Escape special XML characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
