/**
 * API Configuration and Constants
 */

// Base URLs Configuration
export const BASE_URLS = {
  get PRODUCTION() {
    return process.env.NEXT_PUBLIC_SITE_URL || 'https://www.gstv.in';
  },
  DEVELOPMENT: 'http://localhost:3004',

  get CURRENT() {
    return process.env.NODE_ENV === 'production' ? this.PRODUCTION : this.DEVELOPMENT;
  }
} as const;

// Common API Base URL - Change this single variable to switch environments

export const COMMON_API_BASE_URL = 'https://www.gstv.in/backend2/api/v18/mobile';


// Base URLs derived from common base
export const API_BASE_URL = 'https://www.gstv.in/backend2/api';
export const API_V5_BASE_URL = COMMON_API_BASE_URL;

export const API_V6_BASE_URL = 'https://www.gstv.in/backend2/api/v18/mobile';
export const MEDIA_BASE_URL = 'https://www.gstv.in';

// Media/Upload paths
export const UPLOAD_PATHS = {
  GUJARAT: `${MEDIA_BASE_URL}/backend/public/uploads/gujarat`,
  GUJARAT_V2: `${MEDIA_BASE_URL}/backend2/public/uploads/gujarat`,
  CAMPUSCORNER: `${MEDIA_BASE_URL}/backend/public/uploads/campuscorner`,
  EKASANA: `${MEDIA_BASE_URL}/public/uploads/ekasana`,
  GANAPATI: `${MEDIA_BASE_URL}/public/uploads/ganapati`,
  PUBLIC_ASSETS: `${MEDIA_BASE_URL}/public/assets`,
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // News APIs (v6)
  TOP_NEWS: `${API_V5_BASE_URL}/topnewsweb`,
  CATEGORY_NEWS: `${API_V5_BASE_URL}/categorynews`,
  TOP_HOME_CATEGORY: `${API_V5_BASE_URL}/tophomecategoryweb`,
  TOP_VIDEOS: `${API_V5_BASE_URL}/topVideos`,
  TOP_VIDEOS_GROUPED: `${API_V5_BASE_URL}/topVideos`,
  TOP_VIDEOS_BY_SLUG: `${API_V5_BASE_URL}/topVideosBySlug`,
  NEWS_DETAIL: `${API_V5_BASE_URL}/newsnextContent`,
  VIDEOLIKE: `${API_V5_BASE_URL}/videolike`,
  ELECTIONRESULTS: `${API_V5_BASE_URL}/getElectionResultsApi`,
  ELECTION_MODULE: `${API_V5_BASE_URL}/electionmodule`,
  BUDDHIPRAKASHAN: `${API_V5_BASE_URL}/buddhiprakash`,
  EPAPERRIGHTSIDEBAR: `${API_V5_BASE_URL}/epaperrigthsidebar`,
  GETEPAPERCAT: `${API_V5_BASE_URL}/getepapercat`,
  VIDEODETAIL:`${API_V5_BASE_URL}/videoDetail`,
  GET_STATIC_MENU_HOME_PAGE: `${API_V5_BASE_URL}/getStaticMenuHomepage`,
  GET_YOUTUBE_SHORTS: `${API_V5_BASE_URL}/getYoutubeShorts`,
  GET_RELIGION_RASHI: `${API_V5_BASE_URL}/getReligionWithRashi`,

  RASHIFAL_DATA: `${API_V5_BASE_URL}/rashifaldata`,
  GSTV_MAGAZINE_NEWSDATA: `${API_V5_BASE_URL}/gstvmagazinenews`,
  GSTV_SATRANG_NEWSDATA: `${API_V5_BASE_URL}/getTopSatrangCategories`,
  MAGAZINE_REVIEW: `${API_V5_BASE_URL}/magazinereviewsubmit`,

  // Profile APIs
  UPDATE_PROFILE: `${API_V5_BASE_URL}/updateprofile`,
  VIEW_PROFILE: `${API_V5_BASE_URL}/viewProfile`,
  USER_DELETEACCOUNT: `${API_V5_BASE_URL}/deleteAccount`,
  USER_GETPOINTS: `${API_V5_BASE_URL}/getUserPoints`,

  // Location APIs
  CITIES: `${API_V5_BASE_URL}/citylist`,
  GET_ALL_CITY: `${API_V5_BASE_URL}/getallCity`,
  // Web Story APIs (v6)
  TOP_WEB_STORY: `${API_V5_BASE_URL}/topwebstory`,
  WEB_STORY_DETAIL: `${API_V5_BASE_URL}/webstorydetail`,
  WEB_STORY_LIST: `${API_V5_BASE_URL}/webstory`,

  // Epaper APIs (v8)
  EPAPER_LIST: `${API_V5_BASE_URL}/epaper`, // with pagination support
  EPAPER_DETAIL: `${API_V5_BASE_URL}/epaperdetail`,
  EPAPER_DETAIL_V6: `${API_V6_BASE_URL}/epaperdetail`, // v6 endpoint
  EPAPER_BY_DATE: `${API_V5_BASE_URL}/epaper`, // with date parameter
  EPAPER_CATEGORIES: `${API_V5_BASE_URL}/getepapercat`, // Magazine categories

   // Sitemap APIs (v8)
  SITEMAP_NEWS_COUNT: `${API_V5_BASE_URL}/newscount`, // with pagination support
  SITEMAP_NEWS_SITEMAP: `${API_V5_BASE_URL}/newssitemap`,
  SITEMAP_WEBSTORY: `${API_V6_BASE_URL}/webstorysitemap`, // v6 endpoint
  SITEMAP_CATEGORIES: `${API_V5_BASE_URL}/categoriessitemap`, // with date parameter

  // Magazine APIs (v8)
  MAGAZINE: `${API_V5_BASE_URL}/magazine`,

  // Category APIs (v6)
  CATEGORY_SETTING: `${API_V5_BASE_URL}/categorysettingweb`,
  CATEGORY_SETTINGUSER: `${API_V5_BASE_URL}/categorysettingbyuser`,

  // Career API (v9)
  CAREER_SUBMIT: `${API_V5_BASE_URL}/careersubmit`,

  // Search APIs (v6)
  SEARCH: `${API_V5_BASE_URL}/search`,
  SEARCH_RESULT: `${API_V5_BASE_URL}/searchresult`,

  // User APIs (v6)
  BOOKMARK: `${API_V5_BASE_URL}/bookmarklist`,
  NEWS_BOOKMARK: `${API_V5_BASE_URL}/newsbookmark`,
  BOOKMARKWITHPAGINATION: `${API_V5_BASE_URL}/bookmarklistWithpagination`,
  REMOVE_BOOKMARK: `${API_V5_BASE_URL}/removebookmark`,
  SHARE: `${API_V5_BASE_URL}/share`,
  USER_CATEGORY: `${API_V5_BASE_URL}/usercategory`,
  USER_CITY: `${API_V5_BASE_URL}/usercity`,
  GET_CATEGORY_CITY: `${API_V5_BASE_URL}/getcategorycity`,
  CATEGORY_SETTING_TOP_MENU: `${API_V5_BASE_URL}/categorysettingwebForTopMenu`,

  // Authentication APIs
  SEND_OTP: `${API_V5_BASE_URL}/sendotp`,
  VERIFY_OTP: `${API_V5_BASE_URL}/verifyotp`,
  RESEND_OTP: `${API_V5_BASE_URL}/resendotp`,
  VERIFY_MPIN: `${API_V5_BASE_URL}/verifyMPIN`,

  // Poll APIs
  POLL: `${API_V5_BASE_URL}/poll`,
  POLL_SUBMIT: `${API_V5_BASE_URL}/submitpoll`,
  POLL_VOTE_SUBMIT: `${API_V5_BASE_URL}/poll/submit`,
  POLL_RESULTS: `${API_V5_BASE_URL}/pollResults`,
  POLL_RESULTS_SUBMIT: `${API_V5_BASE_URL}/pollresult`,
  POLL_DRAW_WINNER: `${API_V5_BASE_URL}/submitdrawpoll`,

  // Athaitap APIs (v8)
  ATHAITAP_LIST: `${API_V5_BASE_URL}/athaitaplist`,
  ATHAITAP_DETAILS: `${API_V5_BASE_URL}/athaitapdetails`,
  ATHAITAP_GET_USER_ENTRIES: `${API_V5_BASE_URL}/getekasana`,
  ATHAITAP_SUBMIT: `${API_V5_BASE_URL}/submitekasana`,
  ATHAITAP_EDIT: `${API_V5_BASE_URL}/editekasana`,
  ATHAITAP_UPDATE: `${API_V5_BASE_URL}/updateekasana`,

  // Ganeshutsav APIs (v8)
  GANAPATI_GET_LIST: `${API_V5_BASE_URL}/getganapati`,
  GANESHUTSAV_LIST: `${API_V5_BASE_URL}/ganapatilist`,
  GANESHUTSAV_DETAILS: `${API_V5_BASE_URL}/ganapatidetails`,
  GANESHUTSAV_SUBMIT: `${API_V5_BASE_URL}/submitganapati`,
  GANAPATI_EDIT: `${API_V5_BASE_URL}/editganapati`,
  GANAPATI_UPDATE: `${API_V5_BASE_URL}/updateganapati`,
  EKASANA_SUBMIT: `${API_V5_BASE_URL}/submitekasana`,
  EKASANA_EDIT: `${API_V5_BASE_URL}/editekasana`,
  EKASANA_UPDATE: `${API_V5_BASE_URL}/updateekasana`,

  // Journalist APIs (v8)
  JOURNAGET_LIST: `${API_V5_BASE_URL}/getmarugujarat`,
  JOURNALIST_LIST: `${API_V5_BASE_URL}/marugujaratlist`,
  JOURNALIST_DETAILS: `${API_V5_BASE_URL}/marugujaratdetails`,
  JOURNALIST_SUBMIT: `${API_V5_BASE_URL}/submitmarugujarat`,
  JOURNALIST_EDIT: `${API_V5_BASE_URL}/editmarugujarat`,
  JOURNALIST_UPDATE: `${API_V5_BASE_URL}/updatemarugujarat`,

  // Campus Corner APIs (v8)
  CAMPUS_CORNER_GET_LIST: `${API_V5_BASE_URL}/getcampuscorner`,
  CAMPUS_CORNER_LIST: `${API_V5_BASE_URL}/campuscornerlist`,
  CAMPUS_CORNER_DETAILS: `${API_V5_BASE_URL}/campuscornerdetails`,
  CAMPUS_CORNER_SUBMIT: `${API_V5_BASE_URL}/submitcampuscorner`,
  CAMPUS_CORNER_EDIT: `${API_V5_BASE_URL}/editcampuscorner`,
  CAMPUS_CORNER_UPDATE: `${API_V5_BASE_URL}/updatecampuscorner`,

  // payment APIS
  CREATE_SUBSCRIPTION: `${API_V5_BASE_URL}/createSubscription`,
  PAYMENT_HISTORY: `${API_V5_BASE_URL}/paymenthistory`,
  PAYMENT_SUCCESS: `${API_V5_BASE_URL}/adduserplansubscribe`,
  CATEGORY_SETTING_WITH_PLAN: `${API_V5_BASE_URL}/categorysettingwithplan`,

// Cricket live match score
  LIVE_CRICKET_SCORE: `${API_V5_BASE_URL}/livecricket`,

  // Legacy APIs (v5)
  TAG_DETAIL: `${API_V5_BASE_URL}/tagdetail`,
  WEB_STORY: `${API_V5_BASE_URL}/webstory`,
  GSTV_FAST_TRACK: `${API_V5_BASE_URL}/gstvfasttrack`,
  NEWS_NEXT_CONTENT: `${API_V5_BASE_URL}/newsnextContent`, // News detail API with loadedSlugs for infinite scroll
  NEWS_NEXT_CONTENT_WEB: `${API_V5_BASE_URL}/newsnextContentweb`, // Web version
  SATRANG_CATEGORY: `${API_V5_BASE_URL}/satrangcategory`,
  BREAKING_NEWS: `${API_V5_BASE_URL}/breakingnews`, // Breaking news and newsflash API
} as const;

// Default API Parameters
export const DEFAULT_API_PARAMS = {
  device_id: '', // Default device ID for www
  user_id: '', // Default user ID for www
  pageNumber: '1',
} as const;

// API Request Types
export const API_REQUEST_TYPES = {
  FORM_DATA: 'application/x-www-form-urlencoded',
  JSON: 'application/json',
  MULTIPART: 'multipart/form-data',
} as const;

// API Methods
export const API_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  DEFAULT_PAGE: 1,
} as const;

// Image Constants
export const IMAGE_CONSTANTS = {
  DEFAULT_NEWS_IMAGE: '/images/gstv-logo-bg.png',
  SMALL_IMAGE_SUFFIX: '_small',
  VIDEO_GIF_SUFFIX: '_video.webp',
} as const;

// Category Mapping for API
export const CATEGORY_MAPPING = {
  // Location-based categories
  LOCATION_CATEGORIES: ['gujarat', 'ahmedabad', 'surat', 'vadodara', 'rajkot', 'bhavnagar', 'jamnagar'],

  // Topic-based categories
  TOPIC_CATEGORIES: ['business', 'entertainment', 'sports', 'politics', 'technology', 'health', 'world', 'india'],

  // Default location for topic categories
  DEFAULT_LOCATION: 'ahmedabad',
} as const;

// Category ID Mapping based on API structure
export const CATEGORY_ID_MAPPING = {
  // Parent categories (main categories)
  PARENT_CATEGORIES: {
    'gujarat': '1',
    'india': '47',
    'world': '3',
    'business': '4',
    'entertainment': '5',
    'sports': '6',
    'auto-tech': '7',
    'lifestyle': '8',
    'career': '9',
    'trending': '10',
    'videos': '11',
    'politics': '12',
    'technology': '13',
    'health': '14'
  },

  // Subcategories (child categories) - Gujarat subcategories
  SUBCATEGORIES: {
    'gujarat': {
      'ahmedabad': '15',
      'surat': '16',
      'vadodara': '17',
      'rajkot': '18',
      'bhavnagar': '19',
      'jamnagar': '20',
      'gandhinagar': '21',
      'junagadh': '22',
      'anand': '23',
      'mehsana': '24',
      'morbi': '25',
      'navsari': '26',
      'bharuch': '27',
      'kutch': '28'
    },
    // Add other parent categories' subcategories as needed
    'india': {
      'delhi': '48',
      'mumbai': '49',
      'bangalore': '50',
      'chennai': '51',
      'kolkata': '52',
      'hyderabad': '53',
      'pune': '54'
    }
  }
} as const;

/**
 * Get category IDs based on URL structure
 * @param categorySlug - Parent category slug (e.g., 'gujarat')
 * @param subcategorySlug - Subcategory slug (e.g., 'ahmedabad') - optional
 * @returns Comma-separated category IDs string
 */
export const getCategoryIds = (categorySlug: string, subcategorySlug?: string): string => {
  const parentId = CATEGORY_ID_MAPPING.PARENT_CATEGORIES[categorySlug as keyof typeof CATEGORY_ID_MAPPING.PARENT_CATEGORIES];

  if (!parentId) {
    console.warn(`Unknown parent category: ${categorySlug}, using default`);
    return '1'; // Default to Gujarat
  }

  if (subcategorySlug) {
    // 3-segment URL: return both parent and subcategory IDs
    const subcategories = CATEGORY_ID_MAPPING.SUBCATEGORIES[categorySlug as keyof typeof CATEGORY_ID_MAPPING.SUBCATEGORIES];
    const subcategoryId = subcategories?.[subcategorySlug as keyof typeof subcategories];

    if (subcategoryId) {
      return `${parentId},${subcategoryId}`;
    } else {
      console.warn(`Unknown subcategory: ${subcategorySlug} for category: ${categorySlug}`);
      return parentId; // Return only parent ID if subcategory not found
    }
  } else {
    // 2-segment URL: return only parent category ID
    return parentId;
  }
};

// Response Status
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
} as const;

// Common API Fetch Utility
export const commonApiFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = endpoint.startsWith('http') ? endpoint : `${COMMON_API_BASE_URL}/${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers: defaultHeaders,
  });
};

// Common API POST Utility (for form data)
export const commonApiPost = async (
  endpoint: string,
  data: Record<string, any> = {},
  isFormData: boolean = true
): Promise<Response> => {
  const url = endpoint.startsWith('http') ? endpoint : `${COMMON_API_BASE_URL}/${endpoint}`;

  const body = isFormData
    ? new URLSearchParams(data as Record<string, string>)
    : JSON.stringify(data);

  const headers = isFormData
    ? { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' }
    : { 'Content-Type': 'application/json', 'Accept': 'application/json' };

  return fetch(url, {
    method: 'POST',
    headers,
    body,
  });
};

// Common API GET Utility
export const commonApiGet = async (
  endpoint: string,
  params: Record<string, any> = {}
): Promise<Response> => {
  const url = endpoint.startsWith('http') ? endpoint : `${COMMON_API_BASE_URL}/${endpoint}`;
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const finalUrl = searchParams.toString() ? `${url}?${searchParams.toString()}` : url;

  return fetch(finalUrl, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Helper functions for constructing URLs
/**
 * Get full image URL for Gujarat uploads (backend v1)
 * @param imagePath - Relative or absolute image path
 * @returns Full image URL
 */
export const getGujaratImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  return imagePath.startsWith('http') ? imagePath : `${UPLOAD_PATHS.GUJARAT}/${imagePath}`;
};

/**
 * Get full image URL for Gujarat uploads (backend v2)
 * @param imagePath - Relative or absolute image path
 * @returns Full image URL
 */
export const getGujaratImageUrlV2 = (imagePath: string): string => {
  if (!imagePath) return '';
  return imagePath.startsWith('http') ? imagePath : `${UPLOAD_PATHS.GUJARAT_V2}/${imagePath}`;
};

export const getcampuscornerImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  return imagePath.startsWith('http') ? imagePath : `${UPLOAD_PATHS.CAMPUSCORNER}/${imagePath}`;
};
/**
 * Get full image URL for Ekasana uploads
 * @param imagePath - Relative or absolute image path
 * @returns Full image URL
 */
export const getEkasanaImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  return imagePath.startsWith('http') ? imagePath : `${UPLOAD_PATHS.EKASANA}/${imagePath}`;
};

/**
 * Get full image URL for Ganapati uploads
 * @param imagePath - Relative or absolute image path
 * @returns Full image URL
 */
export const getGanapatiImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  return imagePath.startsWith('http') ? imagePath : `${UPLOAD_PATHS.GANAPATI}/${imagePath}`;
};

/**
 * Get full media URL (for any path starting with /)
 * @param path - Relative or absolute path
 * @returns Full URL
 */
export const getMediaUrl = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${MEDIA_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};
