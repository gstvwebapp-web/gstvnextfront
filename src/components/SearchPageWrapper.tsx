'use client';

import { Suspense } from 'react';
import SearchPage from '@/components/SearchPage';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SearchPage />
    </Suspense>
  );
}