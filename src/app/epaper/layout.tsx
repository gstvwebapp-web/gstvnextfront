import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Epaper | GSTV',
  description: 'Read the latest epaper editions from GSTV News',
  keywords: 'epaper, newspaper, GSTV, news, Gujarat',
  openGraph: {
    title: 'Epaper | GSTV',
    description: 'Read the latest epaper editions from GSTV News',
    type: 'website',
    images: [
      {
        url: '/assets/images/logo.png',
        width: 800,
        height: 600,
        alt: 'GSTV Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Epaper | GSTV',
    description: 'Read the latest epaper editions from GSTV News',
    images: ['/assets/images/logo.png'],
  },
};

export default function EpaperLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
