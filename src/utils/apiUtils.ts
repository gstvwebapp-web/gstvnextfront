/**
 * Common API Utility Functions
 * Centralized API calls and common patterns
 */

import { API_ENDPOINTS, DEFAULT_API_PARAMS, API_METHODS, API_REQUEST_TYPES, CATEGORY_MAPPING } from '@/constants/api';

// Common API Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  current_page: number;
  data: T[];
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
}

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  featureImage: string | null;
  imageURL: string;
  description: string;
  created_at: string;
  updated_at: string;
  catID: string;
  category_slugs: string;
  viewer: number;
  tags: string;
  is_breaking: number;
  is_live_news: number;
  videoURL?: string;
  is_vertical_video?: number;
}

// Generic API Request Function
export async function makeApiRequest<T = any>(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    params?: Record<string, any>;
  } = {}
): Promise<ApiResponse<T>> {
  try {
    const {
      method = API_METHODS.GET,
      headers = {},
      body,
      params = {}
    } = options;

    // Build URL with query parameters for GET requests
    let requestUrl = url;
    if (method === API_METHODS.GET && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      requestUrl += `?${searchParams.toString()}`;
    }

    // Prepare request configuration
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': API_REQUEST_TYPES.JSON,
        ...headers,
      },
    };

    // Add body for POST/PUT requests
    if (method !== API_METHODS.GET && body) {
      if (body instanceof FormData) {
        config.body = body;
        // Remove Content-Type header for FormData (browser will set it with boundary)
        delete (config.headers as Record<string, string>)['Content-Type'];
      } else if (body instanceof URLSearchParams) {
        config.body = body;
        (config.headers as Record<string, string>)['Content-Type'] = API_REQUEST_TYPES.FORM_DATA;
      } else {
        config.body = JSON.stringify(body);
      }
    }

    const response = await fetch(requestUrl, config);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      status: 'success',
      message: 'Request successful',
      data
    };

  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Common News API Functions
export const commonNewsApi = {
  /**
   * Fetch top news with pagination
   */
  fetchTopNews: async (page: number = 1): Promise<ApiResponse<PaginatedResponse<NewsItem>>> => {
    const params = {
      ...DEFAULT_API_PARAMS,
      pageNumber: page.toString()
    };
    
    return makeApiRequest(API_ENDPOINTS.TOP_NEWS, {
      method: API_METHODS.POST,
      body: new URLSearchParams(params as Record<string, string>)
    });
  },

  /**
   * Fetch category news with pagination
   */
  fetchCategoryNews: async (
    categorySlug: string,
    page: number = 1,
    subslug?: string
  ): Promise<ApiResponse<PaginatedResponse<NewsItem>>> => {
    // Helper function to get appropriate subslug
    const getSubslug = (categorySlug: string, subslug?: string): string => {
      if (subslug) return subslug;

      // For main category pages (no subslug), always return 'undefined' string
      return 'undefined';
    };

    const params = {
      ...DEFAULT_API_PARAMS,
      slug: categorySlug,
      pageNumber: page.toString(),
      subslug: getSubslug(categorySlug, subslug)
    };

    return makeApiRequest(API_ENDPOINTS.CATEGORY_NEWS, {
      method: API_METHODS.POST,
      body: new URLSearchParams(params as Record<string, string>)
    });
  },

  /**
   * Fetch subcategory news with pagination
   */
  fetchSubcategoryNews: async (
    categorySlug: string,
    subcategorySlug: string,
    page: number = 1
  ): Promise<ApiResponse<PaginatedResponse<NewsItem>>> => {
    try {
    

      // Helper function to get fallback subslug
      const getFallbackSubslug = (categorySlug: string): string => {
        // For topic categories, use default location
        if (CATEGORY_MAPPING.TOPIC_CATEGORIES.includes(categorySlug as any)) {
          return CATEGORY_MAPPING.DEFAULT_LOCATION;
        }

        // For location categories, use the category itself
        if (CATEGORY_MAPPING.LOCATION_CATEGORIES.includes(categorySlug as any)) {
          return categorySlug;
        }

        // Default fallback
        return CATEGORY_MAPPING.DEFAULT_LOCATION;
      };

      // Helper function to make API request
      const makeApiRequest = async (subslug: string) => {
        const formData = new FormData();
        formData.append('slug', categorySlug);
        formData.append('subslug', subslug);
        formData.append('pageNumber', page.toString());
        formData.append('device_id', DEFAULT_API_PARAMS.device_id);
        formData.append('user_id', DEFAULT_API_PARAMS.user_id);

        

        return fetch(API_ENDPOINTS.CATEGORY_NEWS, {
          method: 'POST',
          cache: 'no-store',
          body: formData
        });
      };

      // Try with requested subslug first
     
      let response = await makeApiRequest(subcategorySlug);
     

      // If 404, try with fallback subslug
      if (!response.ok && response.status === 404) {
        const fallbackSubslug = getFallbackSubslug(categorySlug);
     
        response = await makeApiRequest(fallbackSubslug);
     
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
     

      // Transform the response to match expected format
      const result: ApiResponse<PaginatedResponse<NewsItem>> = {
        status: 'success' as const,
        message: 'Request successful',
        data: data.news // data.news contains the paginated response
      };

     
      return result;
    } catch (error) {
     
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Fetch tag news with pagination
   */
  fetchTagNews: async (
    tagSlug: string,
    page: number = 1
  ): Promise<ApiResponse<PaginatedResponse<NewsItem>>> => {
    const params = {
      slug: tagSlug.replace(/-/g, " "),
      subslug: CATEGORY_MAPPING.DEFAULT_LOCATION,
      pageNumber: page.toString()
    };

    return makeApiRequest(API_ENDPOINTS.TAG_DETAIL, {
      method: API_METHODS.POST,
      headers: {
        'Content-Type': API_REQUEST_TYPES.JSON
      },
      body: JSON.stringify(params)
    });
  },

  /**
   * Fetch top home category news with pagination
   */
  fetchTopHomeCategory: async (page: number = 1): Promise<ApiResponse<any>> => {
    const params = {
      ...DEFAULT_API_PARAMS,
      pageNumber: page.toString()
    };

    return makeApiRequest(API_ENDPOINTS.TOP_HOME_CATEGORY, {
      method: API_METHODS.POST,
      body: new URLSearchParams(params as Record<string, string>)
    });
  },

  /**
   * Fetch top videos with pagination
   */
  fetchTopVideos: async (page: number = 1): Promise<ApiResponse<NewsItem[]>> => {
    const params = {
      ...DEFAULT_API_PARAMS,
      pageNumber: page.toString()
    };

    return makeApiRequest(API_ENDPOINTS.TOP_VIDEOS, {
      method: API_METHODS.GET,
      params
    });
  },

  /**
   * Fetch top web stories
   */
  fetchTopWebStories: async (): Promise<ApiResponse<any>> => {
    return makeApiRequest(API_ENDPOINTS.TOP_WEB_STORY, {
      method: API_METHODS.GET
    });
  },

  /**
   * Fetch news detail
   */
  fetchNewsDetail: async (slug: string, userId: string = '1'): Promise<ApiResponse<any>> => {
    const params = {
      slug,
      user_id: userId
    };

    return makeApiRequest(API_ENDPOINTS.NEWS_DETAIL, {
      method: API_METHODS.POST,
      body: JSON.stringify(params)
    });
  },

  /**
   * Fetch category settings
   */
  fetchCategorySettings: async (): Promise<ApiResponse<any>> => {
    return makeApiRequest(API_ENDPOINTS.CATEGORY_SETTING, {
      method: API_METHODS.GET
    });
  }
};

// Common Error Handler
export function handleApiError(error: any): string {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'કંઈક ખોટું થયું છે. કૃપા કરીને ફરી પ્રયાસ કરો.'; // Something went wrong. Please try again.
}

// Build API URL with parameters
export function buildApiUrl(endpoint: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  return `${endpoint}?${searchParams.toString()}`;
}
