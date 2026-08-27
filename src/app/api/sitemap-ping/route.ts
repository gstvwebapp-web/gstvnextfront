import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gstv.in';
  
  const sitemaps = [
    `${baseUrl}/sitemap.xml`,
    `${baseUrl}/sitemap-news-google.xml`,
    `${baseUrl}/sitemap-category.xml`,
    `${baseUrl}/sitemap-videos.xml`,
    `${baseUrl}/sitemap-webstory.xml`,
  ];

  const results: Array<{ sitemap: string; googleStatus?: number; bingStatus?: number; error?: string }> = [];

  for (const sitemapUrl of sitemaps) {
    try {
      const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
      const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;

      const [googleRes, bingRes] = await Promise.allSettled([
        fetch(googlePingUrl, { method: 'GET' }),
        fetch(bingPingUrl, { method: 'GET' }),
      ]);

      results.push({
        sitemap: sitemapUrl,
        googleStatus: googleRes.status === 'fulfilled' ? googleRes.value.status : 500,
        bingStatus: bingRes.status === 'fulfilled' ? bingRes.value.status : 500,
      });
    } catch (err: any) {
      results.push({
        sitemap: sitemapUrl,
        error: err.message || 'Ping error',
      });
    }
  }

  return NextResponse.json({
    message: 'Sitemaps submitted to search engines successfully',
    timestamp: new Date().toISOString(),
    results,
  });
}
