/**
 * Magazine API Service
 * Handles fetching magazine/epaper category data and magazine listings
 */

import { API_ENDPOINTS, MEDIA_BASE_URL } from '@/constants/api';

// TypeScript interface for Magazine Category
export interface MagazineCategory {
  id: number;
  title: string;
  cattype: string;
  featureImage: string;
  icon: string;
  icon_dark: string;
  slug: string;
  engtitle: string;
}

// TypeScript interface for Magazine Story Data
export interface MagazineStoryData {
  image: string;
}

// TypeScript interface for Magazine Item (similar to EpaperItem)
export interface MagazineItem {
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
  thumbnail?: string;
  parsedStoryData?: MagazineStoryData[];
}

// API Response interface for categories
export interface MagazineCategoriesResponse {
  epapercat: MagazineCategory[];
}

// API Response interface for magazine listings
export interface MagazineResponse {
  status?: boolean;
  message?: string;
  Magazine?: MagazineItem[] | {
    current_page: number;
    data: MagazineItem[];
    per_page: number;
    total: number;
    last_page: number;
    first_page_url?: string;
    from?: number;
    last_page_url?: string;
    links?: any[];
    next_page_url?: string;
    path?: string;
    prev_page_url?: string;
    to?: number;
  };
  date?: string | null;
  magazinecity?: {
    Magazine: MagazineItem[];
  };
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

/**
 * Fetch magazine categories from API
 * @returns Promise<MagazineCategoriesResponse>
 */
export const fetchMagazineCategories = async (): Promise<MagazineCategoriesResponse> => {
  try {
    console.log('🔄 Fetching magazine categories from:', API_ENDPOINTS.EPAPER_CATEGORIES);

    const response = await fetch(API_ENDPOINTS.EPAPER_CATEGORIES, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: MagazineCategoriesResponse = await response.json();

    console.log('✅ Magazine categories fetched successfully:', {
      count: data.epapercat?.length || 0,
      categories: data.epapercat?.slice(0, 3).map(cat => cat.title) || []
    });

    return data;
  } catch (error) {
    console.error('❌ Error fetching magazine categories:', error);
    throw error;
  }
};

/**
 * Fetch magazines with pagination support
 * @param pageNumber - Page number (default: 1)
 * @param perPage - Items per page (default: 8)
 */
export const fetchMagazines = async (pageNumber: number = 1, perPage: number = 8): Promise<MagazineResponse> => {
  try {
    console.log(`🔥 [MagazineAPI] Fetching magazines - Page: ${pageNumber}, Per Page: ${perPage}`);

    // Use Next.js API route for pagination support
    const response = await fetch('/api/magazine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        pageNumber: pageNumber.toString(),
        per_page: perPage.toString()
      }),
      cache: 'no-store', // Ensure fresh data for pagination
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch magazines: ${response.status} ${response.statusText}`);
    }

    const data: any = await response.json();
    console.log('🔥 [MagazineAPI] Raw response:', data);

    // Handle different response formats
    let magazines: MagazineItem[] = [];
    let paginationInfo: any = null;

    if (data.Magazine && Array.isArray(data.Magazine)) {
      // Direct format: { "Magazine": [...] }
      magazines = data.Magazine;
      console.log('🔥 [MagazineAPI] Direct format detected');
    } else if (data.Magazine && typeof data.Magazine === 'object' && data.Magazine.data) {
      // Paginated format: { "Magazine": { "data": [...], "current_page": 1, ... } }
      magazines = data.Magazine.data || [];
      paginationInfo = {
        current_page: data.Magazine.current_page || 1,
        per_page: data.Magazine.per_page || perPage,
        total: data.Magazine.total || 0,
        last_page: data.Magazine.last_page || 1
      };
      console.log('🔥 [MagazineAPI] Paginated format detected');
    } else if (data.magazinecity?.Magazine && Array.isArray(data.magazinecity.Magazine)) {
      // Nested format: { "magazinecity": { "Magazine": [...] } }
      magazines = data.magazinecity.Magazine;
      console.log('🔥 [MagazineAPI] Nested format detected');
    } else {
      console.log('🔥 [MagazineAPI] Unknown format, checking for Magazine key');
      if (data.Magazine) {
        console.log('🔥 [MagazineAPI] Magazine keys:', Object.keys(data.Magazine));
      }
    }

    // Ensure Story_data is properly handled as array
    magazines = magazines.map(magazine => ({
      ...magazine,
      Story_data: Array.isArray(magazine.Story_data) ? magazine.Story_data : [],
      parsedStoryData: Array.isArray(magazine.Story_data) ?
        magazine.Story_data.map(url => ({ image: url })) :
        parseStoryData(magazine.Story_data as any)
    }));

    console.log(`🔥 [MagazineAPI] Processed ${magazines.length} magazines`);

    // Return in consistent format with pagination info
    return {
      status: true,
      magazinecity: {
        Magazine: magazines
      },
      pagination: paginationInfo || data.pagination
    };
  } catch (error) {
    console.error('🔥 [MagazineAPI] Error fetching magazines:', error);
    throw error;
  }
};

/**
 * Fetch magazines for a specific slug (category) with pagination
 */
export const fetchMagazinesBySlug = async (slug: string, pageNumber: number = 1, perPage: number = 8): Promise<MagazineResponse> => {
  try {
    if (!slug) throw new Error('Slug is required');

    const response = await fetch('/api/magazine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ pageNumber: pageNumber.toString(), per_page: perPage.toString(), epaper_cat: slug }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch magazines for ${slug}: ${response.status} ${response.statusText}`);
    }

    const data: any = await response.json();

    let magazines: MagazineItem[] = [];
    let paginationInfo: any = null;

    if (data.Magazine && Array.isArray(data.Magazine)) {
      magazines = data.Magazine;
    } else if (data.Magazine && typeof data.Magazine === 'object' && Array.isArray(data.Magazine.data)) {
      magazines = data.Magazine.data;
      paginationInfo = {
        current_page: data.Magazine.current_page || 1,
        per_page: data.Magazine.per_page || perPage,
        total: data.Magazine.total || 0,
        last_page: data.Magazine.last_page || 1
      };
    } else if (data.magazinecity?.Magazine && Array.isArray(data.magazinecity.Magazine)) {
      magazines = data.magazinecity.Magazine;
    }

    magazines = magazines.map(magazine => ({
      ...magazine,
      Story_data: Array.isArray(magazine.Story_data) ? magazine.Story_data : [],
      parsedStoryData: Array.isArray(magazine.Story_data)
        ? magazine.Story_data.map((url: string) => ({ image: url }))
        : parseStoryData(magazine.Story_data as any)
    }));

    return {
      status: true,
      magazinecity: { Magazine: magazines },
      pagination: paginationInfo || data.pagination
    };
  } catch (error) {
    console.error('🔥 [MagazineAPI] Error fetching magazines by slug:', error);
    throw error;
  }
};


/**
 * Parse story data from string format
 * @param storyData - Story data in string format
 * @returns Array of story data objects
 */
const parseStoryData = (storyData: any): MagazineStoryData[] => {
  if (typeof storyData === 'string') {
    try {
      const parsed = JSON.parse(storyData);
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({ image: item }));
      }
    } catch (e) {
      console.warn('Failed to parse story data:', e);
    }
  }
  return [];
};

/**
 * Get magazine image URL with proper base URL
 * @param magazine - Magazine item
 * @returns Full image URL
 */
export const getMagazineImageUrl = (magazine: MagazineItem): string => {
  if (!magazine.Story_data || magazine.Story_data.length === 0) {
    return '/images/default-magazine.png';
  }

  const imageUrl = magazine.Story_data[0];

  // If URL is already absolute, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Otherwise, prepend the media base URL
  return `${MEDIA_BASE_URL}${imageUrl}`;
};

/**
 * Format date to DD-MM-YYYY format
 * @param dateString - Date string in various formats
 * @returns Formatted date string
 */
export const formatDateToDDMMYYYY = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Get current date in DD-MM-YYYY format
 * @returns Current date string
 */
export const getCurrentDateDDMMYYYY = (): string => {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Filter magazines by category type
 * @param categories - Array of magazine categories
 * @param cattype - Category type to filter by (default: 'Magazine')
 * @returns Filtered array of magazine categories
 */
export const filterMagazinesByType = (
  categories: MagazineCategory[],
  cattype: string = 'Magazine'
): MagazineCategory[] => {
  return categories.filter(category => category.cattype === cattype);
};


// Detail fetch for a specific magazine issue
export interface MagazineDetailResponse {
  magazine: MagazineItem | null;
  magazinlist: Array<{ title?: string; slug?: string; ecatslug?: string; engtitle?: string }>;
}

export const fetchMagazineDetail = async (
  slug: string,
  date: string
): Promise<MagazineDetailResponse> => {

  if (!slug || !date) {
    throw new Error('Slug and date required');
  }

  // normalize date to DD-MM-YYYY
  const toDDMMYYYY = (d: string): string => {
    if (/^\d{2}-\d{2}-\d{4}$/.test(d)) return d;
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
      const [y, m, dd] = d.split('-');
      return `${dd}-${m}-${y}`;
    }
    return d;
  };

  const wantDate = toDDMMYYYY(date);

  const reqBody = {
    pageNumber: '1',
    per_page: '50',
    epaper_cat: slug,
  };

  // 👉 CALL LARAVEL DIRECTLY (NOT /api/magazinedetail)
  const upstream = await fetch(API_ENDPOINTS.MAGAZINE, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(reqBody),
  });

  if (!upstream.ok) {
    throw new Error(`External API error ${upstream.status}`);
  }

  const data = await upstream.json();

  const list =
    Array.isArray(data?.Magazine) ? data.Magazine :
    Array.isArray(data?.Magazine?.data) ? data.Magazine.data :
    Array.isArray(data?.magazinecity?.Magazine) ? data.magazinecity.Magazine :
    [];

  const match = list.find((m: any) => {
    const mSlug = m.ecatslug || m.slug;
    const mDate = toDDMMYYYY(m.newspaperdate);
    return mSlug === slug && mDate === wantDate;
  });

  const magazine = match
    ? {
        ...match,
        Story_data: Array.isArray(match.Story_data) ? match.Story_data : [],
      }
    : null;

  return {
    magazine,
    magazinlist: data?.magazinlist || [],
  };
};
