'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { GridContainer, BlogGridItem } from '@/components/common/GridComponents';
import {
  performSearch,
  getSearchSuggestions,
  validateSearchQuery,
  getSearchStats,
  buildSearchUrl,
  extractSearchQuery,
  trackSearchAnalytics,
  debounce,
  SearchItem
} from '@/services/searchApi';
import { COMMON_CLASSES, LOADING_MESSAGES } from '@/utils/uiUtils';
import Link from 'next/link';

// Using SearchItem and SearchResponse from searchApi service

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Get initial search query from URL
  useEffect(() => {
    if (searchParams) {
      const query = extractSearchQuery(searchParams);
      if (query) {
        setSearchQuery(query);
        handlePerformSearch(query, 1, false);
      }
    }
  }, [searchParams]);

  // Perform search using the search service
  const handlePerformSearch = useCallback(async (query: string, page: number = 1, append: boolean = false) => {
    // Validate search query
    const validation = validateSearchQuery(query);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid search query');
      return;
    }

    try {
      if (page === 1) {
        setLoading(true);
        setError(null);
        setHasSearched(true);
      } else {
        setLoadingMore(true);
      }

     

      const result = await performSearch({
        txtSearch: query,
        pageNumber: page,
        user_id: ''
      });

    
      // Handle both successful and failed responses
      if (result.status && result.data) {
        const newResults = result.data.data || [];

        if (append && page > 1) {
          setSearchResults(prev => [...prev, ...newResults]);
        } else {
          setSearchResults(newResults);
        }

        // Update pagination info
        setCurrentPage(result.data.current_page);
        setHasMoreData(!!result.data.next_page_url && newResults.length > 0);
        setTotalResults(result.data.total);

        // Track analytics
        trackSearchAnalytics(query, result.data.total);
      } else {
        // Handle failed search with empty results
        if (result.data && result.data.data) {
          setSearchResults([]);
          setCurrentPage(1);
          setHasMoreData(false);
          setTotalResults(0);
        }

        // Show user-friendly error message
        const errorMessage = result.message || 'શોધ પરિણામો મેળવવામાં નિષ્ફળ';
        throw new Error(errorMessage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Load more results for infinite scroll
  const loadMoreResults = useCallback(async () => {
    if (!loadingMore && hasMoreData && searchQuery) {
      await handlePerformSearch(searchQuery, currentPage + 1, true);
    }
  }, [handlePerformSearch, searchQuery, currentPage, loadingMore, hasMoreData]);

  // Set up infinite scroll
  useInfiniteScroll({
    hasNextPage: hasMoreData,
    loading: loadingMore,
    onLoadMore: loadMoreResults,
    threshold: 300
  });

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Update URL with search query
      router.push(buildSearchUrl(searchQuery.trim()));
      setSearchResults([]);
      setCurrentPage(1);
      setHasMoreData(true);
      handlePerformSearch(searchQuery.trim(), 1, false);
    }
  };

  return (
    <div className="search-page">
      {/* Search Header */}
     
        
          <div className="blogs-main-section-inner searchPage">
             
              <div className="blogs-head-bar first">
                <form onSubmit={handleSearch} id='searchForm'>
                <div className='colSearch'>
                <div className='citySearchBox'>
                 
                
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="સમાચાર, વિડિયો અને વધુ શોધો..."
                />
                <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0px', margin: '-2px 0 0 0px' }}>
                  <img 
                  src="/images/search_icon.svg" 
                  alt="Search" 
                  width={20} 
                  height={20}
                />
                </button>
                
                </div>
                </div>
                </form>
              </div>
           
          
    

      {/* Search Results */}
      <div className="search-results-section">
     
          {/* Results Header */}
          {hasSearched && (
           <>             
              {totalResults > 0 && (
                <p className="results-count" style={{ textAlign: 'right', color: '#666', fontSize: '14px' }}>
                  કુલ {totalResults} પરિણામો મળ્યા
                </p>
              )}
            </>
          )}

          
 <div className="search-suggestion">
              <ul>
                {getSearchSuggestions().slice(0, 10).map((suggestion, index) => (
                  <li key={index}>
                    <Link href={buildSearchUrl(suggestion.term)}>
                      {suggestion.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          {/* Error state */}
          {error && searchResults.length === 0 && (
            <ErrorMessage
              error={error}
              onRetry={() => searchQuery && handlePerformSearch(searchQuery, 1, false)}
            />
          )}
          {loading && searchResults.length === 0 && (
               
                  <div className={COMMON_CLASSES.LOADING_CONTAINER}>
                    <LoadingSpinner
                      message={LOADING_MESSAGES.LOADING}
                      size="large"
                      color="#850E00"
                    />
                  </div>
               
            )}
          
          {/* No results */}
          {!loading && hasSearched && searchResults.length === 0 && !error && (
            <div className="no-results">
              <h3>કોઈ પરિણામો મળ્યા નથી</h3>
              <p>કૃપા કરીને અલગ કીવર્ડ્સ સાથે ફરીથી પ્રયાસ કરો</p>
            </div>
          )}


          {/* Search Results Grid */}
          {searchResults.length > 0 && (
            <>
             <div className="search-results-grid-cls">
                <GridContainer>
                  {searchResults.map((item, index) => (
                    <BlogGridItem 
                      key={`${item.id}-${index}`} 
                      news={item} 
                      currentCategory=""
                    />
                  ))}
                </GridContainer>
              </div>
            </>
          )}
          {loadingMore && (
                  <LoadingSpinner
                    message="વધુ પરિણામો લોડ કરી રહ્યા છીએ..."
                    size="small"
                    color="#850E00"
                    compact={true}
                  />
                )}
          

          {/* End of Data Indicator */}
          {!hasMoreData && searchResults.length > 0 && (
            <div className="end-of-results">
              <p>તમે બધા પરિણામો જોઈ લીધા છે.</p>
            </div>
          )}
        </div>
      
    </div>
    </div>
  );
}
