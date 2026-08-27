/**
 * Schema.org Structured Data Generator
 * Generates JSON-LD structured data for various page types
 */

import { BASE_URLS } from '@/constants/api';

const getBaseUrl = (): string => process.env.NEXT_PUBLIC_SITE_URL || BASE_URLS.PRODUCTION;

// ============================================
// 1. NewsArticle Schema (CRITICAL & Item 8 Person Schema)
// ============================================
export interface NewsArticleSchemaProps {
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author?: {
    name: string;
    url?: string;
  };
  articleBody?: string;
  keywords?: string[];
  articleSection?: string;
}

export function generateNewsArticleSchema(props: NewsArticleSchemaProps) {
  const baseUrl = getBaseUrl();
  const authorName = props.author?.name || 'GSTV Team';
  const authorUrl = props.author?.url || `${baseUrl}/about-us`;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'inLanguage': 'gu-IN',
    headline: props.headline,
    description: props.description,
    image: props.image ? [props.image] : [`${baseUrl}/assets/images/gstv-logo-bg.png`],
    datePublished: props.datePublished,
    dateModified: props.dateModified || props.datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
      url: authorUrl
    },
    articleBody: props.articleBody,
    keywords: props.keywords?.join(','),
    articleSection: props.articleSection || 'News',
    isPartOf: {
      '@type': 'WebSite',
      name: 'GSTV News',
      url: baseUrl
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'GSTV News',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/assets/images/gstv-logo-bg.png`,
        width: 250,
        height: 60
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': typeof window !== 'undefined' ? window.location.href : baseUrl
    }
  };
}

// ============================================
// 2. Organization Schema (HIGH)
// ============================================
export function generateOrganizationSchema() {
  const baseUrl = getBaseUrl();
  const logoUrl = `${baseUrl}/assets/images/gstv-logo-bg.png`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GSTV News',
    alternateName: 'GSTV',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: logoUrl,
      width: 250,
      height: 60
    },
    image: logoUrl,
    description: 'GSTV (Gujarat Samachar TV) delivers 24x7 breaking news, latest updates from Gujarat, India, politics, entertainment, sports, and business in Gujarati.',
    inLanguage: 'gu-IN',
    sameAs: [
      'https://www.facebook.com/gstvnews',
      'https://twitter.com/gstvnews',
      'https://www.instagram.com/gstvnews'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'gstvwebsite@gmail.com',
      telephone: '+91 98254 93898'
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Nr. ISCKON Temple, S. G Highway',
      addressLocality: 'Ahmedabad',
      addressRegion: 'Gujarat',
      postalCode: '380015',
      addressCountry: 'IN'
    },
    foundingDate: '2018',
    areaServed: 'IN',
    availableLanguage: 'gu-IN'
  };
}

// ============================================
// 3. WebSite + SearchAction Schema (HIGH)
// ============================================
export function generateWebSiteSchema() {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GSTV News',
    url: baseUrl,
    description: 'Latest Gujarati news, breaking news from Gujarat and India in Gujarati language',
    inLanguage: 'gu-IN',
    image: {
      '@type': 'ImageObject',
      url: `${baseUrl}/assets/images/gstv-logo-bg.png`,
      width: 250,
      height: 60
    },
    publisher: {
      '@type': 'Organization',
      name: 'GSTV News',
      url: baseUrl
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

// ============================================
// 4. BreadcrumbList Schema (HIGH)
// ============================================
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

// ============================================
// 5. VideoObject Schema (HIGH)
// ============================================
export interface VideoObjectSchemaProps {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
  viewCount?: number;
  url?: string;
  contentUrl?: string;
}

export function generateVideoObjectSchema(props: VideoObjectSchemaProps) {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    'inLanguage': 'gu-IN',
    name: props.name,
    description: props.description,
    thumbnailUrl: [props.thumbnailUrl],
    uploadDate: props.uploadDate,
    duration: props.duration || 'PT5M',
    viewCount: props.viewCount || 0,
    url: props.url,
    contentUrl: props.contentUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'GSTV News',
      url: baseUrl
    },
    publisher: {
      '@type': 'Organization',
      name: 'GSTV News',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/assets/images/gstv-logo-bg.png`
      }
    }
  };
}

// ============================================
// 6. FAQPage Schema (MEDIUM - Item 7)
// ============================================
export interface FAQItem {
  question: string;
  answer: string;
}

export function generateFAQPageSchema(items: FAQItem[]) {
  if (!items || items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

export function extractFaqsFromArticle(newsData: any): FAQItem[] {
  if (!newsData) return [];

  if (Array.isArray(newsData.faqs) && newsData.faqs.length > 0) {
    return newsData.faqs.map((f: any) => ({
      question: f.question || f.q || f.title || '',
      answer: f.answer || f.a || f.description || '',
    })).filter((f: FAQItem) => f.question && f.answer);
  }

  const content = newsData.description || newsData.content || '';
  if (!content) return [];

  const faqs: FAQItem[] = [];
  const qnaRegex = /(?:<h[2-4][^>]*>|<strong>|<p>)\s*(?:Q\d*[:.]?|Question[:.]?|પ્રશ્ન[:.]?)\s*([^<]+)(?:<\/h[2-4]>|<\/strong>|<\/p>)\s*(?:<p>|<div>)?\s*(?:A\d*[:.]?|Answer[:.]?|જવાબ[:.]?)?\s*([^<]+)/gi;

  let match;
  while ((match = qnaRegex.exec(content)) !== null) {
    const q = match[1]?.trim();
    const a = match[2]?.trim();
    if (q && a && q.length > 5 && a.length > 5) {
      faqs.push({ question: q, answer: a });
    }
  }

  return faqs;
}

export function generateDefaultGstvFAQSchema() {
  return generateFAQPageSchema([
    {
      question: 'GSTV News શું છે?',
      answer: 'GSTV (Gujarat Samachar TV) એ ગુજરાત, ભારત અને વિશ્વભરના 24x7 તાજા અને વિશ્વસનીય સમાચાર આપતું ડિજિટલ ન્યુઝ પોર્ટલ છે.'
    },
    {
      question: 'GSTV પર લાઈવ ન્યુઝ કઈ રીતે જોઈ શકાય?',
      answer: 'તમે GSTV ની અધિકૃત વેબસાઇટ gstv.in અને GSTV યુટ્યુબ ચેનલ પરથી 24x7 લાઇવ ટીવી સમાચાર જોઈ શકો છો.'
    },
    {
      question: 'GSTV News મુખ્યત્વે કઈ ભાષામાં સમાચાર આપે છે?',
      answer: 'GSTV તમામ સમાચાર અને વિડીયો કવરેજ ગુજરાતી ભાષામાં પ્રદાન કરે છે.'
    }
  ]);
}

// ============================================
// 7. Person Schema (MEDIUM - Item 8)
// ============================================
export interface PersonSchemaProps {
  name: string;
  url: string;
  image?: string;
  description?: string;
  affiliation?: string;
  jobTitle?: string;
}

export function generatePersonSchema(props: PersonSchemaProps) {
  const baseUrl = getBaseUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: props.name,
    url: props.url || baseUrl,
    image: props.image,
    description: props.description,
    jobTitle: props.jobTitle || 'Journalist',
    worksFor: {
      '@type': 'Organization',
      name: props.affiliation || 'GSTV News',
      url: baseUrl
    }
  };
}

// ============================================
// 8. ImageObject Schema (MEDIUM)
// ============================================
export interface ImageObjectSchemaProps {
  url: string;
  name: string;
  description?: string;
  width?: number;
  height?: number;
  uploadDate?: string;
}

export function generateImageObjectSchema(props: ImageObjectSchemaProps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    url: props.url,
    name: props.name,
    description: props.description,
    width: props.width,
    height: props.height,
    uploadDate: props.uploadDate,
    author: {
      '@type': 'Organization',
      name: 'GSTV News'
    }
  };
}

// ============================================
// Homepage Combined Schema
// ============================================
export function generateHomepageSchema() {
  return [
    generateOrganizationSchema(),
    generateWebSiteSchema()
  ];
}

// ============================================
// Helper: Convert schema to JSON-LD string
// ============================================
export function schemaToJSON(schema: any): string {
  const cleanSchema = JSON.parse(JSON.stringify(schema));
  return JSON.stringify(cleanSchema);
}

// ============================================
// Helper: Create script tag for React
// ============================================
export function createSchemaScript(schema: any): string {
  return `<script type="application/ld+json">${schemaToJSON(schema)}</script>`;
}
