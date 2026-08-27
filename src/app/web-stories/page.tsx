import { Metadata } from 'next';
import WebStoriesListPage from '@/components/WebStoriesPage';

export const metadata: Metadata = {
  title: 'Web Stories - GSTV',
  description: 'Web Stories',
  openGraph: {
    title: 'Web Stories - GSTV',
    description: 'Web Stories',
    images: ['/assets/images/gstv-logo-bg.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Web Stories - GSTV',
    description: 'Web Stories',
    images: ['/assets/images/gstv-logo-bg.png'],
  },
};

export default function WebStoriesPageRoute() {
  return (
      <WebStoriesListPage />
  );
}
