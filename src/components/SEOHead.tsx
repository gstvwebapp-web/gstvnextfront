'use client';

import Head from 'next/head';
import { SEOData } from '@/utils/seoUtils';
import { MEDIA_BASE_URL, BASE_URLS } from '@/constants/api';

interface SEOHeadProps {
  seoData: SEOData;
  pageType?: 'website' | 'article';
}

export default function SEOHead({ seoData, pageType = 'website' }: SEOHeadProps) {
  const baseUrl: string = BASE_URLS.PRODUCTION;

  // Extract path from canonical URL for hreflang
  const getPathFromUrl = (url?: string): string => {
    if (!url) return '/';
    try {
      const urlObj = new URL(url);
      return urlObj.pathname + urlObj.search;
    } catch {
      return '/';
    }
  };

  const currentPath = getPathFromUrl(seoData.canonicalUrl);

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <meta name="keywords" content={seoData.keywords} />
      
      {/* Canonical URL */}
      {seoData.canonicalUrl && (
        <link rel="canonical" href={seoData.canonicalUrl} />
      )}

      {/* hreflang Tags for Language Targeting */}
      {/* Gujarati (gu) - Primary Language */}
      <link rel="alternate" hrefLang="gu" href={`${baseUrl}${currentPath}`} />
      <link rel="alternate" hrefLang="gu-IN" href={`${baseUrl}${currentPath}`} />
      
      {/* English (en) - Alternative Language */}
      <link rel="alternate" hrefLang="en" href={`${baseUrl}${currentPath}?lang=en`} />
      <link rel="alternate" hrefLang="en-IN" href={`${baseUrl}${currentPath}?lang=en`} />
      
      {/* Default x-default hreflang */}
      <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${currentPath}`} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={pageType} />
      <meta property="og:title" content={seoData.ogTitle || seoData.title} />
      <meta property="og:description" content={seoData.ogDescription || seoData.description} />
      <meta property="og:site_name" content="GSTV Gujarat News" />
      <meta property="og:locale" content="gu_IN" />
      <meta property="og:locale:alternate" content="en_IN" />

      {seoData.ogImage && (
        <>
          <meta property="og:image" content={seoData.ogImage} />
          <meta property="og:image:secure_url" content={seoData.ogImage} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={seoData.ogTitle || seoData.title} />
          <meta property="og:image:type" content="image/jpeg" />
        </>
      )}

      {seoData.ogUrl && (
        <meta property="og:url" content={seoData.ogUrl} />
      )}

      {/* Additional OG Tags for News Articles */}
      {pageType === 'article' && (
        <>
          <meta property="article:publisher" content={seoData.author || "GSTV News"} />
          <meta property="article:author" content={seoData.author || "GSTV News"} />
          <meta property="article:section" content={seoData.section || "News"} />
          {seoData.publishedTime && (
            <meta property="article:published_time" content={seoData.publishedTime} />
          )}
          {seoData.modifiedTime && (
            <meta property="article:modified_time" content={seoData.modifiedTime} />
          )}
        </>
      )}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoData.ogTitle || seoData.title} />
      <meta name="twitter:description" content={seoData.ogDescription || seoData.description} />
      <meta name="twitter:site" content="@GSTV_News" />
      <meta name="twitter:creator" content="@GSTV_News" />
      <meta name="twitter:domain" content="gstv.in" />

      {seoData.ogImage && (
        <>
          <meta name="twitter:image" content={seoData.ogImage} />
          <meta name="twitter:image:alt" content={seoData.ogTitle || seoData.title} />
        </>
      )}

      {seoData.ogUrl && (
        <meta name="twitter:url" content={seoData.ogUrl} />
      )}

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      <meta name="author" content="GSTV News" />
      <meta name="publisher" content="GSTV News" />
      <meta name="copyright" content="GSTV News" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="Gujarati" />

      {/* Language and Locale */}
      <meta property="og:locale" content="gu_IN" />
      <meta property="og:locale:alternate" content="en_IN" />
      <meta httpEquiv="content-language" content="gu-IN" />

      {/* Mobile Optimization */}
      <meta name="format-detection" content="telephone=no" />

      {/* Theme Color */}
      <meta name="theme-color" content="#dc3545" />
      <meta name="msapplication-TileColor" content="#dc3545" />
      
      {/* Favicon */}
      <link rel="icon" href="/assets/icons/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      
      {/* Structured Data for News Articles */}
      KKKKK----{pageType}
      {pageType === 'article' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              "headline": seoData.ogTitle || seoData.title,
              "description": seoData.ogDescription || seoData.description,
              "image": seoData.ogImage,
              "url": seoData.canonicalUrl,
              "publisher": {
                "@type": "Organization",
                "name": "GSTV News",
                "logo": {
                  "@type": "ImageObject",
                  "url": "/assets/images/gstv-logo-bg.png"
                }
              },
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": seoData.canonicalUrl
              }
            })
          }}
        />
      )}

      {/* Structured Data for Website */}
      {pageType === 'website' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "GSTV News",
              "url": MEDIA_BASE_URL,
              "description": "Gujarat's leading news portal for latest Gujarati news, breaking news, politics, sports, entertainment, and business updates.",
              "publisher": {
                "@type": "Organization",
                "name": "GSTV News",
                "logo": {
                  "@type": "ImageObject",
                  "url": "/assets/images/gstv-logo-bg.png"
                }
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      )}
    </Head>
  );
}
