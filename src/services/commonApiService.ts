/**
 * Common API Service
 * Centralized API functions for news, web stories, and epaper
 */

import { API_ENDPOINTS, DEFAULT_API_PARAMS, API_METHODS } from '@/constants/api';

// Common interfaces
export interface ApiResponse<T> {
  status: string;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

// News interfaces
export interface NewsItem {
  id: number;
  title: string;
  englishTitle: string;
  slug: string;
  featureImage: string | null;
  imageURL: string;
  videoURL: string | null;
  description: string;
  content?: string;
  created_at: string;
  updated_at: string;
  viewer: number;
  viewer_app: number;
  category_slugs: string;
  tags: string;
  is_live_news?: number;
  is_breaking?: number;
  metatitle?: string;
  metakeyword?: string;
  metadesc?: string;
}

export interface NewsDetailResponse {
  newsDetail: NewsItem;
  nextNews?: NewsItem[];
  bookmark?: number;
}

// Web Story interfaces
export interface WebStoryData {
  webimage: string;
  webtitles: string;
  webtitlescredit?: string;
}

export interface WebStoryItem {
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
  parsedStoryData?: WebStoryData[];
}

// Epaper interfaces
export interface EpaperStoryData {
  image: string;
}

export interface EpaperItem {
  id: number;
  title?: string;
  cattype?: string;
  ecatslug?: string;
  userID: number;
  ecatID: number;
  etitle: string;
  engtitle?: string;
  slug?: string;
  newspaperdate: string;
  pdf: string;
  Story_data: string[]; // Array of image URLs
  viewer: number;
  viewer_app: number;
  epaper: number;
  metatitle: string;
  metakeyword: string | null;
  metadesc: string | null;
  notification: number;
  status: string;
  created_at: string;
  updated_at: string;
  parsedStoryData?: EpaperStoryData[];
}
function normalizeSlug(slug: string) {
  return slug.replace(/[–—]/g, '-').trim();
}
/**
 * Make API request with error handling
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @returns Promise with API response
 */
const makeApiRequest = async <T>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
};


/**
 * News API Functions
 */
export const newsApi = {
  /**
   * Fetch news detail by slug
   * @param slug - News slug
   * @param userId - User ID (optional)
   * @returns Promise<NewsDetailResponse>
   */
  getNewsDetail: async (slug: string, userId: string = '1'): Promise<ApiResponse<NewsDetailResponse>> => {
    const formData = new URLSearchParams({
      ...DEFAULT_API_PARAMS,
      slug,
      user_id: userId
    });

    return makeApiRequest<NewsDetailResponse>(API_ENDPOINTS.NEWS_DETAIL, {
      method: API_METHODS.POST,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });
  },

  /**
   * Fetch top news with pagination
   * @param page - Page number
   * @returns Promise<PaginatedResponse<NewsItem>>
   */
  getTopNews: async (page: number = 1): Promise<ApiResponse<PaginatedResponse<NewsItem>>> => {
    const params = {
      ...DEFAULT_API_PARAMS,
      pageNumber: page.toString()
    };
    
    return makeApiRequest<PaginatedResponse<NewsItem>>(API_ENDPOINTS.TOP_NEWS, {
      method: API_METHODS.POST,
      body: new URLSearchParams(params as Record<string, string>)
    });
  },


  
  /**
   * Fetch category news with pagination
   * @param categorySlug - Category slug
   * @param page - Page number
   * @param subcategorySlug - Subcategory slug (optional)
   * @returns Promise<PaginatedResponse<NewsItem>>
   */
  getCategoryNews: async (
    categorySlug: string, 
    page: number = 1, 
    subcategorySlug?: string
  ): Promise<ApiResponse<{ news: PaginatedResponse<NewsItem> }>> => {
    const params = {
      ...DEFAULT_API_PARAMS,
      slug: categorySlug,
      pageNumber: page.toString(),
      ...(subcategorySlug && { subslug: normalizeSlug(subcategorySlug) })
    };

    return makeApiRequest<{ news: PaginatedResponse<NewsItem> }>(API_ENDPOINTS.CATEGORY_NEWS, {
      method: API_METHODS.POST,
      body: new URLSearchParams(params as Record<string, string>)
    });
  },

  /**
   * Search news
   * @param query - Search query
   * @param page - Page number
   * @returns Promise<PaginatedResponse<NewsItem>>
   */
  searchNews: async (query: string, page: number = 1): Promise<ApiResponse<PaginatedResponse<NewsItem>>> => {
    const params = {
      ...DEFAULT_API_PARAMS,
      query,
      pageNumber: page.toString()
    };

    return makeApiRequest<PaginatedResponse<NewsItem>>(API_ENDPOINTS.SEARCH_RESULT, {
      method: API_METHODS.POST,
      body: new URLSearchParams(params as Record<string, string>)
    });
  }
};

/**
 * Web Story API Functions
 */
export const webStoryApi = {
  /**
   * Fetch top web stories
   * @returns Promise<WebStoryItem[]>
   */
  getTopWebStories: async (): Promise<ApiResponse<{ topwebstory: WebStoryItem[] }>> => {
    return makeApiRequest<{ topwebstory: WebStoryItem[] }>(API_ENDPOINTS.TOP_WEB_STORY, {
      method: API_METHODS.GET
    });
  },

  /**
   * Fetch web story detail by slug
   * @param slug - Web story slug
   * @returns Promise<WebStoryItem>
   */
  getWebStoryDetail: async (slug: string): Promise<ApiResponse<{ webstory: WebStoryItem }>> => {
    return makeApiRequest<{ webstory: WebStoryItem }>(`${API_ENDPOINTS.WEB_STORY_DETAIL}/${slug}`, {
      method: API_METHODS.GET
    });
  },

  /**
   * Fetch web stories with pagination
   * @param page - Page number
   * @returns Promise<PaginatedResponse<WebStoryItem>>
   */
  getWebStories: async (page: number = 1): Promise<ApiResponse<PaginatedResponse<WebStoryItem>>> => {
    const params = {
      ...DEFAULT_API_PARAMS,
      pageNumber: page.toString()
    };

    return makeApiRequest<PaginatedResponse<WebStoryItem>>(API_ENDPOINTS.WEB_STORY_LIST, {
      method: API_METHODS.POST,
      body: new URLSearchParams(params as Record<string, string>)
    });
  }
};

/**
 * Epaper API Functions
 */
export const epaperApi = {
  /**
   * Fetch current epapers
   * @returns Promise<EpaperItem[]>
   */
  getCurrentEpapers: async (): Promise<ApiResponse<{ epapercity: { Newspaper: EpaperItem[] } }>> => {
    return makeApiRequest<{ epapercity: { Newspaper: EpaperItem[] } }>(API_ENDPOINTS.EPAPER_LIST, {
      method: API_METHODS.GET
    });
  },

  /**
   * Fetch epapers by date
   * @param date - Date in DD-MM-YYYY format
   * @returns Promise<EpaperItem[]>
   */
  getEpapersByDate: async (date: string): Promise<ApiResponse<{ epapercity: { Newspaper: EpaperItem[] } }>> => {
    return makeApiRequest<{ epapercity: { Newspaper: EpaperItem[] } }>(`${API_ENDPOINTS.EPAPER_BY_DATE}/${date}`, {
      method: API_METHODS.GET
    });
  },

  /**
   * Fetch epaper detail
   * @param slug - Epaper slug
   * @param date - Date in DD-MM-YYYY format
   * @returns Promise<EpaperItem>
   */
  getEpaperDetail: async (slug: string, date: string): Promise<ApiResponse<EpaperItem>> => {
    return makeApiRequest<EpaperItem>(API_ENDPOINTS.EPAPER_DETAIL, {
      method: API_METHODS.POST,
      body: JSON.stringify({
        slug,
        date
      })
    });
  }
};

/**
 * User interaction API Functions
 */
export const userApi = {
  /**
   * Bookmark/unbookmark item
   * @param itemId - Item ID
   * @param itemType - Item type ('news', 'webstory', 'epaper')
   * @param action - Action ('add' or 'remove')
   * @returns Promise<boolean>
   */
  toggleBookmark: async (
    itemId: number, 
    itemType: 'news' | 'webstory' | 'epaper', 
    action: 'add' | 'remove'
  ): Promise<ApiResponse<{ bookmarked: boolean }>> => {
    const params = {
      ...DEFAULT_API_PARAMS,
      item_id: itemId.toString(),
      item_type: itemType,
      action
    };

    return makeApiRequest<{ bookmarked: boolean }>(API_ENDPOINTS.BOOKMARK, {
      method: API_METHODS.POST,
      body: new URLSearchParams(params as Record<string, string>)
    });
  },

  /**
   * Share item
   * @param itemId - Item ID
   * @param itemType - Item type
   * @param platform - Share platform
   * @returns Promise<boolean>
   */
  shareItem: async (
    itemId: number, 
    itemType: 'news' | 'webstory' | 'epaper',
    platform: string = 'web'
  ): Promise<ApiResponse<{ shared: boolean }>> => {
    const params = {
      ...DEFAULT_API_PARAMS,
      item_id: itemId.toString(),
      item_type: itemType,
      platform
    };

    return makeApiRequest<{ shared: boolean }>(API_ENDPOINTS.SHARE, {
      method: API_METHODS.POST,
      body: new URLSearchParams(params as Record<string, string>)
    });
  }
};

// Export all APIs as a single object
export const commonApi = {
  news: newsApi,
  webStory: webStoryApi,
  epaper: epaperApi,
  user: userApi
};
