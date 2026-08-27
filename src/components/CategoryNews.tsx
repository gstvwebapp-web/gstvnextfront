'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NewsGrid, CategoryHeader } from '@/components/common/NewsComponents';
import { COMMON_CLASSES } from '@/utils/uiUtils';
import GSTVShatrangLayout from './GSTVShatrangLayout';
import CategoryHeaderWithDropdown from './CategoryHeaderWithDropdown';
import { fetchCategoryNews, fetchCategorySetting, CategorySettingItem } from '@/services/newsApi';

interface CategoryNewsProps {
  categorySlug: string;
}

export default function CategoryNews({ categorySlug }: CategoryNewsProps) {
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryInfo, setCategoryInfo] = useState<any>(null);
  const [categoryDetails, setCategoryDetails] = useState<CategorySettingItem | null>(null);
  const [shouldShowDropdown, setShouldShowDropdown] = useState(false);
  const [gujReady, setGujReady] = useState(false);

  const [newsData, setNewsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const isVideos = categorySlug === 'videos';
  const INITIAL_PAGES = isVideos ? 2 : 1;

  const totalPagesRef = useRef<number>(0);

  // =========================
  // Fetch News Data (FIXED)
  // =========================
  const fetchNewsData = async (
    startPage: number,
    pagesToLoad: number,
    isLoadingMore = false
  ) => {
    if (!categorySlug) return;

    isLoadingMore ? setLoadingMore(true) : setLoading(true);

    try {
      let collectedData: any[] = [];
      let lastPage = totalPagesRef.current || Infinity;
      let finalPage = startPage;

      for (let i = 0; i < pagesToLoad; i++) {
        const page = startPage + i;
        if (page > lastPage) break;

        const response = await fetch('/api/categorynews', {
          method: 'POST',
          cache: "no-store",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category_slug: categorySlug, page }),
        });

        if (!response.ok) break;

        const result = await response.json();

        if (result?.status === 'success' && result.data) {
          collectedData.push(...(result.data.data || []));
          lastPage = result.data.last_page;
          finalPage = result.data.current_page;
        }
      }

      totalPagesRef.current = lastPage;
      setTotalPages(lastPage);
      setCurrentPage(finalPage);
      setHasMoreData(finalPage < lastPage);

      setNewsData(prev =>
        isLoadingMore ? [...prev, ...collectedData] : collectedData
      );
    } catch (err) {
      console.error('❌ Category fetch error:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // =========================
  // Initial Load
  // =========================
  useEffect(() => {
    setNewsData([]);
    setCurrentPage(1);
    setHasMoreData(true);
    setTotalPages(0);
    totalPagesRef.current = 0;
    setError(null);

    fetchNewsData(1, INITIAL_PAGES, false);
  }, [categorySlug]);

  // =========================
  // Infinite Scroll (UNCHANGED)
  // =========================
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (
        scrollTop + windowHeight >= documentHeight - 100 &&
        !loadingMore &&
        hasMoreData &&
        currentPage < totalPages
      ) {
        fetchNewsData(currentPage + 1, 1, true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMoreData, currentPage, totalPages]);

  // =========================
  // Refresh
  // =========================
  const refresh = () => {
    setNewsData([]);
    setCurrentPage(1);
    setHasMoreData(true);
    setTotalPages(0);
    totalPagesRef.current = 0;
    setLoading(true);
    setError(null);
    fetchNewsData(1, INITIAL_PAGES, false);
  };

  // =========================
  // Category Info (UNCHANGED)
  // =========================
  useEffect(() => {
    const fetchCategoryInfo = async () => {
      try {
        const response = await fetchCategoryNews(categorySlug, 1);
        if (response.category) {
          setCategoryId(response.category.id);
          setCategoryInfo(response.category);
        }
      } catch (error) {
        console.error('❌ Category info error:', error);
      }
    };

    if (categorySlug) fetchCategoryInfo();
  }, [categorySlug]);

  // =========================
  // Category Setting (SAFE)
  // =========================
  useEffect(() => {
    const initCategorySetting = async () => {
      try {
        const response = await fetchCategorySetting();
        if (!response.category) return;

        const currentCat = response.category.find(cat => cat.slug === categorySlug);
        if (!currentCat) return;

        setCategoryDetails(currentCat);
        setGujReady(true);

        const hasParent = currentCat.parentID !== 0;
        const hasChildren = response.category.some(
          cat => cat.parentID === currentCat.id && cat.status === 'Active'
        );

        setShouldShowDropdown(hasParent || hasChildren || categorySlug === 'videos');
      } catch (err) {
        console.error('❌ Category setting error:', err);
      }
    };

    if (categorySlug) initCategorySetting();
  }, [categorySlug]);

  // =========================
  // Special Layout
  // =========================
  if (categorySlug === 'gstv-satrang') {
    return <GSTVShatrangLayout categorySlug={categorySlug} />;
  }

  // =========================
  // Render
  // =========================
  return (
    <div className={COMMON_CLASSES.MAIN_SECTION}>
      {gujReady && categoryDetails && (
        shouldShowDropdown ? (
          <CategoryHeaderWithDropdown
            categoryName={categoryDetails.category_name_guj}
            categorySlug={categorySlug}
            categoryId={categoryDetails.id}
            showViewAll={false}
          />
        ) : (
          <CategoryHeader
            categoryName={categoryDetails.category_name_guj}
            categorySlug={categorySlug}
            showViewAll={false}
          />
        )
      )}

      <NewsGrid
        newsData={newsData}
        loading={loading}
        loadingMore={loadingMore}
        error={error}
        hasMoreData={hasMoreData}
        currentCategory={categorySlug}
        onRetry={refresh}
        showEndMessage={true}
      />
    </div>
  );
}
