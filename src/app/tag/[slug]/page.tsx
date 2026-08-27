'use client';

import { useParams } from 'next/navigation';
import TagNews from '@/components/TagNews';
import SEOHead from '@/components/SEOHead';
import { generateTagSEO } from '@/utils/seoUtils';

export default function TagPage() {
  const params = useParams();

  // Handle case where params might be null
  if (!params || !params.slug) {
    return <div>Tag not found</div>;
  }

  const slug = params.slug as string;
  
  // Generate SEO data for tag page
  const seoData = generateTagSEO(slug);

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead seoData={seoData} pageType="website" />

      <div className="tag-page">
        <TagNews tagSlug={slug} />
      </div>
    </>
  );
}
