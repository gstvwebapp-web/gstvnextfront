'use client';

import SubcategoryNews from '@/components/SubcategoryNews';

interface SubcategoryPageClientProps {
  slug: string;
  subcategory: string;
}

export default function SubcategoryPageClient({ slug, subcategory }: SubcategoryPageClientProps) {
  return (
    <div className="subcategory-page">
      <SubcategoryNews
        categorySlug={slug}
        subcategorySlug={subcategory}
      />
    </div>
  );
}
