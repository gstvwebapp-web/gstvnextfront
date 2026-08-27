import type { Metadata } from 'next';
import { API_ENDPOINTS, COMMON_API_BASE_URL, BASE_URLS } from '@/constants/api';
import CategoryPageClient from './CategoryPageClient';

interface PageProps {
  params: { slug: string };
}

// ✅ SERVER-SIDE: Runs at request time — real <title> and <meta> for crawlers
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = params.slug;
  const baseUrl = BASE_URLS.PRODUCTION;

  try {
    // Fetch category settings from API
    const formData = new FormData();
    formData.append('user_id', '');

    const res = await fetch(API_ENDPOINTS.CATEGORY_SETTINGUSER, {
      method: 'POST',
      body: formData,
      next: { revalidate: 600 }, // Cache for 10 minutes
    });

    if (res.ok) {
      const data = await res.json();
      const categories: any[] = data?.category || [];

      // Find the matching category by slug
      const cat = categories.find((c: any) => c.slug === slug);

      if (cat) {
        const title       = cat.metatitle   || `${cat.category_name_guj || cat.category_name} | GSTV ગુજરાત ન્યૂઝ`;
        const description = cat.metadesc    || `${cat.category_name_guj || cat.category_name} - GSTV Gujarat News`;
        const keywords    = cat.metakeyword || `${cat.category_name}, GSTV, Gujarat News, Gujarati News`;
        const canonicalUrl = `${baseUrl}/category/${slug}`;
        const ogImage = `${baseUrl}/assets/images/gstv-logo-bg.png`;

        return {
          title,
          description,
          keywords,
          openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: 'GSTV ગુજરાત ન્યૂઝ',
            images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
            locale: 'gu_IN',
            type: 'website',
          },
          twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage],
            site: '@GSTV_News',
          },
          alternates: {
            canonical: canonicalUrl,
          },
        };
      }
    }
  } catch (err) {
    console.error('❌ generateMetadata (category) error:', err);
  }

  // Fallback if API fails
  const fallbackName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    title: `${fallbackName} | GSTV ગુજરાત ન્યૂઝ`,
    description: `${fallbackName} - GSTV Gujarat News - Latest Gujarati News`,
    keywords: `${fallbackName}, GSTV, Gujarat News, Gujarati News`,
  };
}

// ✅ SERVER COMPONENT wrapper — delegates rendering to the client component
export default function CategoryPage({ params }: PageProps) {
  return <CategoryPageClient slug={params.slug} />;
}
