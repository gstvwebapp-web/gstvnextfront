'use client';

import { useEffect, useState } from 'react';
import CategoryNews from '@/components/CategoryNews';

interface CategoryPageClientProps {
  slug: string;
}

export default function CategoryPageClient({ slug }: CategoryPageClientProps) {
  return (
    <div className="subcategory-page">
      <CategoryNews categorySlug={slug} />
    </div>
  );
}
