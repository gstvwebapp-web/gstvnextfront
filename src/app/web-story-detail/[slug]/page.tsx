'use client';

import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import WebStoryDetail from '@/components/WebStoryDetail';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function WebStoryDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  return (
    <div className="web-story-detail-page">
      <Suspense fallback={
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <LoadingSpinner
            message="વેબ સ્ટોરી લોડ થઈ રહી છે..."
            size="large"
            type="dots"
            color="#850E00"
          />
        </div>
      }>
        <WebStoryDetail slug={slug} />
      </Suspense>
    </div>
  );
}
