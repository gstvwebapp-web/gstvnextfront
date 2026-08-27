'use client';

import React, { useState, useEffect } from 'react';
import { useSubcategoryNews } from '@/hooks/useNewsData';
import { NewsGrid } from '@/components/common/NewsComponents';
import { COMMON_CLASSES } from '@/utils/uiUtils';
import CategoryHeaderWithDropdown from './CategoryHeaderWithDropdown';
import { fetchCategorySetting, CategorySettingItem } from '@/services/newsApi';


interface SubcategoryNewsProps {
  categorySlug: string;
  subcategorySlug: string;
}

export default function SubcategoryNews({ categorySlug, subcategorySlug }: SubcategoryNewsProps) {
 
  const [subcategoryDetails, setSubcategoryDetails] = useState<CategorySettingItem | null>(null);

  // Use the common news data hook with infinite scroll enabled
  const {
    newsData,
    loading,
    loadingMore,
    error,
    hasMoreData,
    refresh
  } = useSubcategoryNews(categorySlug, subcategorySlug, {
    autoLoad: true,
    enableInfiniteScroll: true,
    scrollThreshold: 100,
    scrollDelay: 100,
     initialPages: categorySlug === 'videos' ? 2 : 1 
  });
 const categoryTitle =
  subcategoryDetails?.category_name_guj ||
  subcategoryDetails?.title ||
  '\u00A0';
  // Fetch subcategory details for dropdown
  useEffect(() => {
    const fetchSubcategoryDetails = async () => {
      try {
       
        const response = await fetchCategorySetting();

        if (response.category && Array.isArray(response.category)) {
          const subcategory = response.category.find(cat => cat.slug === subcategorySlug);
          if (subcategory) {
            setSubcategoryDetails(subcategory);
           
          }
        }
      } catch (error) {
        console.error('❌ [SubcategoryNews] Error fetching subcategory details:', error);
      }
    };

    if (subcategorySlug) {
      fetchSubcategoryDetails();
    }
  }, [subcategorySlug]);

  

  return (
    <>
      <div className={COMMON_CLASSES.MAIN_SECTION}>
        {subcategoryDetails ? (
          <CategoryHeaderWithDropdown
            categoryName={subcategoryDetails.category_name_guj || subcategoryDetails.title}
            categorySlug={subcategorySlug}
            categoryId={subcategoryDetails.id}
            showViewAll={false}
          />
        ) : (
          <div className="blogs-head-bar first">
            <span className="blog-category">
              {categoryTitle}
            </span>
          </div>
        )}
        <NewsGrid
          newsData={newsData}
          loading={loading}
          loadingMore={loadingMore}
          error={error}
          hasMoreData={hasMoreData}
          currentCategory={categorySlug}
          currentSubcategory={subcategorySlug}
          onRetry={refresh}
          showEndMessage={true}
        />
      </div>
    </>
  );
}
