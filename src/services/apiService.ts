/**
 * Common API Service
 */

import { API_ENDPOINTS, DEFAULT_API_PARAMS, API_METHODS, HTTP_STATUS } from '@/constants/api';

// Generic API Response Type
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  error?: string;
}

// Generic API Request Options
interface ApiRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}

// Generic API Request Function
export async function apiRequest<T = any>(
  url: string,
  options: ApiRequestOptions = {}
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
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    // Add body for POST/PUT requests
    if (method !== API_METHODS.GET && body) {
      if (body instanceof FormData || body instanceof URLSearchParams) {
        config.body = body;
        // Remove Content-Type header for FormData (browser will set it with boundary)
        if (body instanceof FormData) {
          delete (config.headers as Record<string, string>)['Content-Type'];
        } else {
          (config.headers as Record<string, string>)['Content-Type'] = 'application/x-www-form-urlencoded';
        }
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
    console.error('API Request Error:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// News API Functions
export const newsApi = {
  // Get Top News
  getTopNews: async (page: number = 1) => {
    const params = {
      ...DEFAULT_API_PARAMS,
      pageNumber: page.toString()
    };

    return apiRequest(API_ENDPOINTS.TOP_NEWS, {
      method: API_METHODS.POST,
      body: new URLSearchParams(params as Record<string, string>)
    });
  },

  // Get Category News
  getCategoryNews: async (categorySlug: string, page: number = 1, subslug?: string) => {
    const params = {
      ...DEFAULT_API_PARAMS,
      slug: categorySlug,
      pageNumber: page.toString()
    };

    if (subslug) {
      (params as any).subslug = subslug;
    }

    return apiRequest(API_ENDPOINTS.CATEGORY_NEWS, {
      method: API_METHODS.POST,
      body: new URLSearchParams(params as Record<string, string>)
    });
  },

  // Get Top Home Category
  getTopHomeCategory: async (page: number = 1) => {
    const params = {
      ...DEFAULT_API_PARAMS,
      pageNumber: page.toString()
    };

    return apiRequest(API_ENDPOINTS.TOP_HOME_CATEGORY, {
      method: API_METHODS.POST,
      body: new URLSearchParams(params as Record<string, string>)
    });
  },

  // Get Top Videos
  getTopVideos: async (page: number = 1) => {
    const params = {
      ...DEFAULT_API_PARAMS,
      pageNumber: page.toString()
    };

    return apiRequest(API_ENDPOINTS.TOP_VIDEOS, {
      method: API_METHODS.GET,
      params
    });
  },

  // Get Top Web Stories
  getTopWebStories: async (page: number = 1) => {
    const params = {
      ...DEFAULT_API_PARAMS,
      pageNumber: page
    };

    return apiRequest(API_ENDPOINTS.TOP_WEB_STORY, {
      method: API_METHODS.GET,
      params
    });
  },

  // Get Category Settings
  getCategorySettings: async () => {
    return apiRequest(API_ENDPOINTS.CATEGORY_SETTING, {
      method: API_METHODS.GET
    });
  }
};

// Utility function to build API URL
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

// Utility function to handle API errors
export function handleApiError(error: any): string {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}
