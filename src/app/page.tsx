import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

import SchemaMarkup from '@/components/SchemaMarkup';
import { generateHomepageSchema, generateDefaultGstvFAQSchema } from '@/utils/schemaMarkup';

import BreakingNews from '@/components/BreakingNews';
import TopNews from '@/components/TopNews';
import TrendingBar from '@/components/TrendingBar';

import {
  StockMarketSection,
  LiveNewsIframeSection,
  LiveMatchScoreSection,
} from '@/components/ClientHomeSections';

export const revalidate = 60; // ISR - revalidate every 60 seconds

const nullLoader = () => null;

// Deferred dynamic components
const ElectionResults = dynamic(
  () => import('@/components/ElectionResults'),
  { ssr: false }
);

const ElectionModule = dynamic(
  () => import('@/components/ElectionModule'),
  { ssr: false }
);

const TopVideos = dynamic(
  () => import('@/components/TopVideos')
);

const LiveNews = dynamic(
  () => import('@/components/LiveNews'),
  { loading: nullLoader }
);

const WebStories = dynamic(
  () => import('@/components/WebStories'),
  { loading: nullLoader }
);

const ReligionRashiSlider = dynamic(
  () => import('@/components/ReligionRashiSlider')
);

const GSTVMagazine = dynamic(
  () => import('@/components/GSTVMagazine')
);

const TopHomeCategory = dynamic(
  () => import('@/components/TopHomeCategory')
);

export async function generateMetadata(): Promise<Metadata> {
  const ogImageBase = process.env.NEXT_PUBLIC_OG_IMAGE_BASE || 'https://www.gstv.in';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gstv.in';
  const ogImageUrl = `${ogImageBase}/assets/images/gstv-logo-bg.png`;

  const title = 'GSTV | Latest Gujarati News — Gujarat, India | Breaking News 24x7';
  const description = 'GSTV (Gujarat Samachar TV) delivers 24x7 breaking news, latest updates from Gujarat, India, politics, entertainment, sports, and business in Gujarati.';
  const keywords = 'GSTV, Gujarat News, Gujarati News, Breaking News, Live TV, India News, Politics, Sports, Business';

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      title,
      description,
      url: siteUrl,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: 'GSTV News' }],
      type: 'website',
      siteName: 'GSTV News',
      locale: 'gu_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      site: '@GSTV_News',
    },
  };
}

export default function Home() {
  const homepageSchema = generateHomepageSchema();
  const faqSchema = generateDefaultGstvFAQSchema();

  return (
    <>
      {/* Server-Rendered JSON-LD Schema Markup */}
      <SchemaMarkup schema={homepageSchema} />
      <SchemaMarkup schema={faqSchema} />

      {/* Trending bar — below breaking news */}
      <TrendingBar />

      {/* Breaking News */}
      <BreakingNews />

      {/* Election Results */}
      <ElectionResults />

      {/* Stock Market Section (Client Hook Isolated) */}
      <StockMarketSection />

      {/* Top Videos */}
      <TopVideos />

      {/* Election Module */}
      <ElectionModule />

      {/* Live News Iframe Section */}
      <LiveNewsIframeSection />

      {/* Live News */}
      <LiveNews />

      {/* Top News */}
      <TopNews />

      {/* Live Match Score Section */}
      <LiveMatchScoreSection />

      {/* Religion Rashi Video Slider */}
      <ReligionRashiSlider />

      {/* GSTV Magazine */}
      <GSTVMagazine />

      {/* Top Home Category */}
      <TopHomeCategory />

      {/* Web Stories */}
      <WebStories />
    </>
  );
}
