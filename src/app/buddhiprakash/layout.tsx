import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'બુદ્ધિપ્રકાશ | GSTV',
  description: 'Read the latest Buddhi Prakashan editions from GSTV',
  keywords: 'buddhiprakash, buddhi prakash, GSTV, Gujarat, magazine',
  openGraph: {
    title: 'બુદ્ધિપ્રકાશ | GSTV',
    description: 'Read the latest Buddhi Prakashan editions from GSTV',
    type: 'website',
    images: [{ url: '/assets/images/logo.png', width: 800, height: 600, alt: 'GSTV Logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'બુદ્ધિપ્રકાશ | GSTV',
    description: 'Read the latest Buddhi Prakashan editions from GSTV',
    images: ['/assets/images/logo.png'],
  },
};

export default function BuddhiPrakashLayout({ children }: { children: React.ReactNode }) {
  return children;
}
