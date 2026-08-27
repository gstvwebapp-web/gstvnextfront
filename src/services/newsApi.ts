
import { API_ENDPOINTS, commonApiGet, commonApiPost, DEFAULT_API_PARAMS, CATEGORY_MAPPING } from '@/constants/api';

// News API service functions

export interface NewsItem {
  id: number;
  title: string;
  englishTitle: string;
  slug: string;
  featureImage: string | null;
  imageURL: string;
  videoURL: string | null;
  description: string;
  created_at: string;
  updated_at: string;
  viewer: number;
  category_slugs: string;
  tags: string;
  category_name_guj?: string;
}

export interface TopNewsResponse {
  topnews: NewsItem[];
  livenews: any[];
}

export interface CategorySettingsItem {
  id: number;
  userID: number;
  parentID: number;
  title: string;
  category_name: string;
  category_name_guj: string;
  slug: string;
  featureImage: string | null;
  icon: string;
  description: string | null;
  metatitle: string;
  metakeyword: string;
  metadesc: string;
  catOrder: number;
  eventCat: number;
  setHome: number;
  status: string;
  created_at: string;
  updated_at: string;
  parent_category_name: string | null;
  subcategories?: CategorySettingsItem[];
}

export interface CategorySettingsResponse {
  category: CategorySettingsItem[];
}

export interface CategoryNewsResponse {
  status: 'success' | 'error' | boolean;
  message: string;
  data: {
    current_page: number;
    data: NewsItem[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  category: {
    id: number;
    name: string;
    slug: string;
    icon: string;
    description: string;
  };
}

/**
 * Fetches top news from GSTV API
 * @returns Promise<TopNewsResponse>
 */
export const fetchTopNews = async (): Promise<TopNewsResponse> => {
  try {
    // Use common API utility - but TOP_NEWS is v6, so use full URL
    const response = await fetch(API_ENDPOINTS.TOP_NEWS, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TopNewsResponse = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error fetching top news:', error);
    throw error;
  }
};

/**
 * Fetches news by category using internal API route
 * @param categorySlug - Category slug to filter news
 * @param page - Page number for pagination (default: 1)
 * @returns Promise<CategoryNewsResponse>
 */
export const fetchCategoryNews = async (categorySlug: string, page: number = 1, subslug?: string): Promise<CategoryNewsResponse> => {
  try {
    // Helper function to get appropriate subslug
    const getSubslug = (categorySlug: string, subslug?: string): string => {
      if (subslug) return subslug;

      // For main category pages (no subslug), always return 'undefined' string
      return 'undefined';
    };

    const requestBody = {
      slug: categorySlug,
      pageNumber: page,
      subslug: getSubslug(categorySlug, subslug),
      device_id: DEFAULT_API_PARAMS.device_id,
      user_id: DEFAULT_API_PARAMS.user_id
    };

    // Use common API utility for v5 mobile endpoints
    const response = await commonApiPost('categorynews', requestBody);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[fetchCategoryNews] Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    

    // Transform external API response to match internal format
    const transformedResponse: CategoryNewsResponse = {
      status: 'success',
      message: 'Request successful',
      data: data.news || {
        current_page: 1,
        data: [],
        first_page_url: '',
        from: 1,
        last_page: 1,
        last_page_url: '',
        next_page_url: null,
        path: '',
        per_page: data.news?.per_page,
        prev_page_url: null,
        to: 0,
        total: 0
      },
      category: {
        id: 1,
        name: data.catTitle || categorySlug,
        slug: data.catSlug || categorySlug,
        icon: '',
        description: data.catMetadesc || `Latest news from ${categorySlug}`
      }
    };

   
    return transformedResponse;

  } catch (error) {
  
    throw error;
  }
};

/**
 * Fetches news by category (legacy method)
 * @param categoryId - Category ID to filter news
 * @returns Promise<TopNewsResponse>
 */
export const fetchNewsByCategory = async (categoryId: string): Promise<TopNewsResponse> => {
  try {
    // Use common API utility for v5 mobile endpoints
    const response = await commonApiGet('topnews');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TopNewsResponse = await response.json();
    return data;
  } catch (error) {
    
    throw error;
  }
};

/**
 * Fetches category settings with parent-child relationships - Updated to use external API directly
 * @returns Promise<CategorySettingsResponse>
 */
export const fetchCategorySettings = async (): Promise<CategorySettingsResponse> => {
  try {
    

    const response = await fetch(API_ENDPOINTS.CATEGORY_SETTING, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
      mode: 'cors',
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data: CategorySettingsResponse = await response.json();
    
    // Process the data to organize parent-child relationships
    const processedData = processCategoryHierarchy(data);
    

    return processedData;
  } catch (error) {
    
    throw error;
  }
};

/**
 * Processes category data to organize parent-child relationships
 * @param data - Raw category settings response
 * @returns Processed category settings with nested subcategories
 */
const processCategoryHierarchy = (data: CategorySettingsResponse): CategorySettingsResponse => {
  const categories = data.category;
  const parentCategories: CategorySettingsItem[] = [];
  const childCategories: CategorySettingsItem[] = [];

  // Separate parent and child categories
  categories.forEach(category => {
    if (category.parentID === 0) {
      parentCategories.push({ ...category, subcategories: [] });
    } else {
      childCategories.push(category);
    }
  });

  // Assign child categories to their parents
  childCategories.forEach(child => {
    const parent = parentCategories.find(p => p.id === child.parentID);
    if (parent) {
      parent.subcategories = parent.subcategories || [];
      parent.subcategories.push(child);
    }
  });

  // Sort categories by catOrder
  parentCategories.sort((a, b) => a.catOrder - b.catOrder);
  parentCategories.forEach(parent => {
    if (parent.subcategories) {
      parent.subcategories.sort((a, b) => a.catOrder - b.catOrder);
    }
  });

  return {
    category: parentCategories
  };
};

/**
 * Fetches top videos from the Next.js API route
 * Uses: /api/topVideos (which calls the external API)
 * @returns Promise<CategoryNewsResponse>
 */
export const fetchTopVideos = async (): Promise<CategoryNewsResponse> => {
  try {
    const response = await fetch('/api/topVideos', {
      method: 'GET',
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data: CategoryNewsResponse = await response.json();
    return data;
  } catch (error) {
    
    throw error;
  }
};

// Web Stories API
export interface WebStoryData {
  webimage: string;
  webtitles: string;
}

export interface WebStory {
  id: number;
  userID: number;
  catID: string | null;
  title: string;
  englishTitle: string;
  slug: string;
  Story_data: string; // JSON string
  viewer: number;
  viewer_app: number;
  status: string;
  notification: number;
  webOrder: number;
  metatitle: string;
  metakeyword: string | null;
  metadesc: string;
  created_at: string;
  updated_at: string;
}

export interface TopWebStoriesResponse {
  topwebstory: WebStory[];
}

export const fetchTopWebStories = async (): Promise<TopWebStoriesResponse> => {
  try {
    // Use common API utility for v5 mobile endpoints
    const response = await commonApiGet('topwebstory');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TopWebStoriesResponse = await response.json();

    return data;
  } catch (error) {
    
    throw error;
  }
};

// Top Home Category API
export interface TopHomeCategoryResponse {
  status: string;
  message: string;
  category: any;
  data: {
    current_page: number;
    data: NewsItem[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

// GSTV શતરંગ Category API
export interface SatrangAuthor {
  id: number;
  userID: number;
  parentID: number;
  title: string;
  category_name: string;
  category_name_guj: string;
  slug: string;
  featureImage: string | null;
  icon: string;
  description: string | null;
  metatitle: string;
  metakeyword: string | null;
  metadesc: string;
  catOrder: number;
  eventCat: number;
  setHome: number;
  status: string;
  created_at: string;
  updated_at: string;
  authorName: string;
  parent_category_name: string;
}

export interface SatrangCategoryResponse {
  categorychildQuery: SatrangAuthor[];
}

export const fetchTopHomeCategory = async (pageNumber: number = 1): Promise<TopHomeCategoryResponse> => {
  try {
    
    const response = await fetch(API_ENDPOINTS.TOP_HOME_CATEGORY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        pageNumber: pageNumber
      }),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rawData = await response.json();
    

    // Transform the external API response to match the expected format
    // Extract all news items from all categories in homecategory object
    let newsItems: NewsItem[] = [];
    if (rawData?.homecategory) {
      Object.entries(rawData.homecategory).forEach(([categoryKey, categoryNews]) => {
        if (Array.isArray(categoryNews)) {

          const [, categoryNameGuj] = categoryKey.split('|');

          categoryNews.forEach((news: NewsItem) => {
            newsItems.push({
              ...news,
              category_name_guj: categoryNameGuj, // ✅ added here
            });
          });

        }
      });
    }


    

    // Extract pagination info from the external API response
    const currentPage = rawData.currentPage || pageNumber;
    const totalPages = rawData.totalPages || 1;
    const nextPage = rawData.nextPage || null;
    const hasNextPage = nextPage !== null && currentPage < totalPages;

    const transformedData: TopHomeCategoryResponse = {
      status: 'success',
      message: 'Top home category fetched successfully',
      category: null,
      data: {
        current_page: currentPage,
        data: newsItems,
        first_page_url: '',
        from: (currentPage - 1) * newsItems.length + 1,
        last_page: totalPages,
        last_page_url: '',
        next_page_url: hasNextPage ? `?pageNumber=${nextPage}` : null,
        path: '',
        per_page: newsItems.length,
        prev_page_url: currentPage > 1 ? `?pageNumber=${currentPage - 1}` : null,
        to: currentPage * newsItems.length,
        total: totalPages * newsItems.length
      }
    };

    

    return transformedData;
  } catch (error) {
    
    throw error;
  }
};

/**
 * Fetches GSTV શતરંગ category authors
 * @returns Promise<SatrangCategoryResponse>
 */
export const fetchSatrangCategory = async (): Promise<SatrangCategoryResponse> => {
  try {
    // Use common API utility for v5 mobile endpoints
    const response = await commonApiGet('satrangcategory');

    if (!response.ok) {
      const errorText = await response.text();
    
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data: SatrangCategoryResponse = await response.json();

    return data;
  } catch (error) {
    
    throw error;
  }
};

/**
 * Fetches single news article by slug
 * @param slug - News article slug
 * @returns Promise<NewsItem>
 */
export const fetchNewsBySlug = async (slug: string): Promise<NewsItem> => {
  try {
    // Use common API utility for v5 mobile endpoints
    const response = await commonApiGet(`news/${slug}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: NewsItem = await response.json();
    return data;
  } catch (error) {
    
    throw error;
  }
};

/**
 * Fetches web story details by slug
 * @param slug - Web story slug
 * @returns Promise<WebStoryDetailResponse>
 */
export interface WebStoryDetailResponse {
  webstory: WebStory;
  webstorymore: WebStory[];
}

export const fetchWebStoryDetail = async (slug: string): Promise<WebStoryDetailResponse> => {
  try {
    // Use common API utility for v5 mobile endpoints
    const response = await commonApiGet(`webstorydetail/${slug}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: WebStoryDetailResponse = await response.json();

    return data;
  } catch (error) {
    
    throw error;
  }
};

// Category Setting API (v5)
export interface CategorySettingItem {
  id: number;
  userID: number;
  parentID: number;
  title: string;
  category_name: string;
  category_name_guj: string;
  slug: string;
  featureImage: string | null;
  icon: string;
  description: string | null;
  metatitle: string;
  metakeyword: string | null;
  metadesc: string;
  catOrder: number;
  eventCat: number;
  setHome: number;
  status: string;
  created_at: string;
  updated_at: string;
  parent_category_name: string | null;
}

export interface CategorySettingResponse {
  category: CategorySettingItem[];
  setting: any[];
}

/**
 * Fetches all categories with settings (v5 API) - Updated to use categorysettingbyuser
 * @returns Promise<CategorySettingResponse>
 */
export const fetchCategorySetting = async (): Promise<CategorySettingResponse> => {
  try {


    // Get user ID from localStorage/session
    let userId = '';
    try {
      if (typeof window !== 'undefined') {
        const userSession = localStorage.getItem('userSession');
        if (userSession) {
          const sessionData = JSON.parse(userSession);
          userId = sessionData.userData?.user_id || sessionData.userData?.id || sessionData.user_id || sessionData.id || '';
        }
      }
    } catch (e) {
      console.error('Error parsing user session:', e);
    }

    // Prepare FormData for POST request
    const formData = new FormData();
    formData.append('user_id', userId);

    const response = await fetch(API_ENDPOINTS.CATEGORY_SETTINGUSER, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      const errorText = await response.text();
    
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data: CategorySettingResponse = await response.json();

    return data;
  } catch (error) {
    
    throw error;
  }
};

// Re-export web story functions for convenience
export { fetchWebStories, getSmallImageUrl } from './webStoryApi';
