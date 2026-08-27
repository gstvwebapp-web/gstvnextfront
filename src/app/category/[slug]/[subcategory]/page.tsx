import type { Metadata } from 'next';
import { API_ENDPOINTS, BASE_URLS } from '@/constants/api';
import SubcategoryPageClient from './SubcategoryPageClient';

interface PageProps {
  params: { slug: string; subcategory: string };
}

// ✅ SERVER-SIDE: Dynamic metadata for subcategory pages
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, subcategory } = params;
  const baseUrl = BASE_URLS.PRODUCTION;

  try {
    const formData = new FormData();
    formData.append('user_id', '');

    const res = await fetch(API_ENDPOINTS.CATEGORY_SETTINGUSER, {
      method: 'POST',
      body: formData,
      next: { revalidate: 600 },
    });

    if (res.ok) {
      const data = await res.json();
      const categories: any[] = data?.category || [];

      // Find the subcategory by its slug
      const cat = categories.find((c: any) => c.slug === subcategory)
        || categories.find((c: any) => c.slug === slug);

      if (cat) {
        const title       = cat.metatitle   || `${cat.category_name_guj || cat.category_name} | GSTV ગુજરાત ન્યૂઝ`;
        const description = cat.metadesc    || `${cat.category_name_guj || cat.category_name} - GSTV Gujarat News`;
        const keywords    = cat.metakeyword || `${cat.category_name}, GSTV, Gujarat News, Gujarati News`;
        const canonicalUrl = `${baseUrl}/category/${slug}/${subcategory}`;
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
    console.error('❌ generateMetadata (subcategory) error:', err);
  }

  // Fallback
  const fallbackName = subcategory.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    title: `${fallbackName} | GSTV ગુજરાત ન્યૂઝ`,
    description: `${fallbackName} - GSTV Gujarat News`,
    keywords: `${fallbackName}, GSTV, Gujarat News, Gujarati News`,
  };
}

export default function SubcategoryPage({ params }: PageProps) {
  return <SubcategoryPageClient slug={params.slug} subcategory={params.subcategory} />;
}
