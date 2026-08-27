import { Metadata } from 'next';
import { Suspense } from 'react';
import NewsDetailClientWrapper from '@/components/NewsDetailClientWrapper';
import LoadingSpinner from '@/components/LoadingSpinner';
import { generateNewsDetailSEO } from '@/utils/seoUtils';
import { API_ENDPOINTS, DEFAULT_API_PARAMS, BASE_URLS } from '@/constants/api';
import {
  generateNewsArticleSchema,
  generateBreadcrumbSchema,
  generateFAQPageSchema,
  extractFaqsFromArticle,
} from '@/utils/schemaMarkup';


// Fetch news data for metadata generation
async function fetchNewsData(newsSlug: string, hasSubcategory: boolean = false) {
  try {
    const apiEndpoint = API_ENDPOINTS.NEWS_NEXT_CONTENT;

    let response: Response | null = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; GSTV-Bot/1.0)',
          },
          body: new URLSearchParams({
            slug: newsSlug,
            user_id: DEFAULT_API_PARAMS.user_id,
            device_id: DEFAULT_API_PARAMS.device_id,
            loadedSlugs: '',
            categoryIds: '',
          }),
          cache: 'no-store',
          signal: AbortSignal.timeout(8000),
        });

        if (response.ok) break;
      } catch (err) {
        if (attempts >= maxAttempts) throw err;
        await new Promise(r => setTimeout(r, 300 * attempts));
      }
    }

    if (!response || !response.ok) return null;

    const data = await response.json();

    if (data?.newsDetail) {
      return Array.isArray(data.newsDetail) ? data.newsDetail[0] : data.newsDetail;
    }

    if (Array.isArray(data?.data) && data.data.length > 0) {
      return data.data[0];
    }

    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }

    return null;
  } catch (error) {
    console.error('[fetchNewsData] Error:', error);
    return null;
  }
}

// Generate metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const { category: categorySlug, slug: slugArray } = resolvedParams;

  const hasSubcategory = slugArray.length === 2;
  const subcategorySlug = hasSubcategory ? slugArray[0] : undefined;
  const newsSlug = hasSubcategory ? slugArray[1] : slugArray[0];

  const canonicalUrl = hasSubcategory
    ? `https://www.gstv.in/news/${categorySlug}/${subcategorySlug}/${newsSlug}`
    : `https://www.gstv.in/news/${categorySlug}/${newsSlug}`;

  try {
    // Get og:image base URL from environment
    const ogImageBase = process.env.NEXT_PUBLIC_OG_IMAGE_BASE || 'https://www.gstv.in';
    const fallbackImage = `${ogImageBase}/images/logo.png`;

    const newsData = await fetchNewsData(newsSlug, hasSubcategory);

    if (!newsData || !newsData.title) {
      return {
        title: 'GSTV News',
        description: 'Latest Gujarati News from GSTV',
        openGraph: {
          type: 'article',
          title: 'GSTV News',
          description: 'Latest Gujarati News from GSTV',
          url: canonicalUrl,
          siteName: 'GSTV',
          images: [
            {
              url: fallbackImage,
              width: 1200,
              height: 630,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          images: [fallbackImage],
        },
        alternates: {
          canonical: canonicalUrl,
        },
      };
    }

    const seoData = generateNewsDetailSEO(newsData, categorySlug);

    const ogImage =
      seoData.ogImage && seoData.ogImage.startsWith('http')
        ? seoData.ogImage
        : fallbackImage;

    return {
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords,
      openGraph: {
        type: 'article',
        title: seoData.ogTitle,
        description: seoData.ogDescription,
        url: canonicalUrl,
        siteName: 'GSTV',
        locale: 'gu_IN',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: seoData.ogTitle,
          },
        ],
        publishedTime: seoData.publishedTime,
        modifiedTime: seoData.modifiedTime,
        authors: [seoData.author || 'GSTV Team'],
        section: seoData.section,
      },
      twitter: {
        card: 'summary_large_image',
        title: seoData.ogTitle,
        description: seoData.ogDescription,
        images: [ogImage],
      },
      alternates: {
        canonical: canonicalUrl,
      },
    };
  } catch (error) {
    console.error('[generateMetadata] Error:', error);

    // Get og:image base URL from environment
    const ogImageBase = process.env.NEXT_PUBLIC_OG_IMAGE_BASE || 'https://www.gstv.in';
    const fallbackImage = `${ogImageBase}/images/logo.png`;

    return {
      title: 'GSTV News',
      description: 'Latest Gujarati News from GSTV',
      openGraph: {
        type: 'article',
        title: 'GSTV News',
        description: 'Latest Gujarati News from GSTV',
        url: canonicalUrl,
        siteName: 'GSTV',
        images: [
          {
            url: fallbackImage,
            width: 1200,
            height: 630,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        images: [fallbackImage],
      },
    };
  }
}

interface NewsDetailPageProps {
  params: Promise<{
    category: string;
    slug: string[];
  }>;
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const resolvedParams = await params;
  const categorySlug = resolvedParams.category;
  const slugArray = resolvedParams.slug;

  const hasSubcategory = slugArray.length === 2;
  const subcategorySlug = hasSubcategory ? slugArray[0] : undefined;
  const newsSlug = hasSubcategory ? slugArray[1] : slugArray[0];
 

  if (!categorySlug || !newsSlug) {
    return <div style={{ padding: 40 }}>News article not found</div>;
  }

  // Fetch news data for schema markup
  let newsData = null;
  let newsArticleSchema = null;
  let breadcrumbSchema = null;
  let faqSchema = null;

  try {
    newsData = await fetchNewsData(newsSlug, hasSubcategory);

    if (newsData) {
      const baseUrl: string = BASE_URLS.PRODUCTION;

      // Generate NewsArticle schema
      newsArticleSchema = generateNewsArticleSchema({
        headline: newsData.title,
        description: newsData.metadesc || newsData.description?.substring(0, 160) || newsData.title,
        image: newsData.featureImage || `${baseUrl}/assets/images/gstv-logo-bg.png`,
        datePublished: newsData.created_at,
        dateModified: newsData.updated_at,
        author: {
          name: newsData.author || newsData.journalist_name || 'GSTV News',
          url: baseUrl
        },
        articleBody: newsData.description?.substring(0, 500),
        keywords: newsData.tags ? newsData.tags.split(',').map((t: string) => t.trim()) : [],
        articleSection: newsData.category_name_guj || 'News'
      });

      // Generate BreadcrumbList schema
      const breadcrumbs = [
        { name: 'હોમ', url: baseUrl },
        { name: newsData.category_name_guj || categorySlug, url: `${baseUrl}/category/${categorySlug}` }
      ];

      if (subcategorySlug && subcategorySlug !== categorySlug) {
        breadcrumbs.push({
          name: subcategorySlug,
          url: `${baseUrl}/category/${categorySlug}/${subcategorySlug}`
        });
      }

      const canonicalUrl = hasSubcategory
        ? `${baseUrl}/news/${categorySlug}/${subcategorySlug}/${newsSlug}`
        : `${baseUrl}/news/${categorySlug}/${newsSlug}`;

      breadcrumbs.push({
        name: newsData.englishTitle || newsData.title,
        url: canonicalUrl
      });

      breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

      // Generate FAQPage schema if FAQs present
      const faqs = extractFaqsFromArticle(newsData);
      if (faqs.length > 0) {
        faqSchema = generateFAQPageSchema(faqs);
      }
    }
  } catch (error) {
    console.error('[NewsDetailPage] Error generating schema:', error);
  }
  return (
    <div className="news-detail-page blogs-main-section inner custom-blog-details" lang="gu">
      {/* Schema Markup (JSON-LD) */}
      {newsArticleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(newsArticleSchema)
          }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbSchema)
          }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema)
          }}
        />
      )}
      
      <NewsDetailClientWrapper
        initialCategorySlug={categorySlug}
        initialNewsSlug={newsSlug}
        initialSubcategorySlug={subcategorySlug}
        initialNewsData={newsData}
      />
    </div>
  );
}
