import { Metadata } from 'next';
import { Suspense } from 'react';
import SearchPage from '@/components/SearchPage';
import LoadingSpinner from '@/components/LoadingSpinner';

export const metadata: Metadata = {
  title: 'સર્ચ - GSTV',
  description: 'GSTV પર સમાચાર, વિડિયો અને વધુ શોધો',
  openGraph: {
    title: 'સર્ચ - GSTV',
    description: 'GSTV પર સમાચાર, વિડિયો અને વધુ શોધો',
    images: ['/images/gstv-logo-bg.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'સર્ચ - GSTV',
    description: 'GSTV પર સમાચાર, વિડિયો અને વધુ શોધો',
    images: ['/images/gstv-logo-bg.png'],
  },
};

export default function SearchPageRoute() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SearchPage />
    </Suspense>
  );
}
