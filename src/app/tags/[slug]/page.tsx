import { Metadata } from 'next';
import { Suspense } from 'react';
import TagNews from '@/components/TagNews';
import LoadingSpinner from '@/components/LoadingSpinner';
import { generateTagSEO } from '@/utils/seoUtils';

// Generate metadata for the page
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const seoData = generateTagSEO(slug);

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    openGraph: {
      type: 'website',
      title: seoData.ogTitle,
      description: seoData.ogDescription,
      images: seoData.ogImage ? [seoData.ogImage] : [],
      url: seoData.ogUrl,
      siteName: 'GSTV Gujarat News',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoData.ogTitle,
      description: seoData.ogDescription,
      images: seoData.ogImage ? [seoData.ogImage] : [],
    },
    alternates: {
      canonical: seoData.canonicalUrl,
    },
  };
}

export default async function TagsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <div className="tags-page">
      <Suspense fallback={
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <LoadingSpinner />
          <p style={{ marginTop: '20px', color: '#666' }}>
            Loading tag page...
          </p>
        </div>
      }>
        <TagNews tagSlug={slug} />
      </Suspense>
    </div>
  );
}
