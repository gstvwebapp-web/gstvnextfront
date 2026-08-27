// Epaper API Service
import { API_ENDPOINTS, commonApiGet } from '@/constants/api';

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
  thumbnail?: string;   // ✅ ADD TH
  parsedStoryData?: EpaperStoryData[];
}

export interface EpaperResponse {
  status?: boolean;
  message?: string;
  Newspaper?: EpaperItem[] | {
    current_page: number;
    data: EpaperItem[];
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
  epapercity?: {
    Newspaper: EpaperItem[];
  };
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

/**
 * Fetch epaper data with pagination support
 * @param pageNumber - Page number (default: 1)
 * @param perPage - Items per page (default: 10)
 */
export const fetchEpapers = async (pageNumber: number = 1, perPage: number = 10): Promise<EpaperResponse> => {
  try {
    console.log(`🔥 [EpaperAPI] Fetching epapers - Page: ${pageNumber}, Per Page: ${perPage}`);

    // Use Next.js API route for pagination support
    const response = await fetch('/api/epaper', {
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
      throw new Error(`Failed to fetch epapers: ${response.status} ${response.statusText}`);
    }

    const data: EpaperResponse = await response.json();
    console.log(`🔥 [EpaperAPI] Response received:`, data);

    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format');
    }

    // Handle both response formats
    let newspapers: EpaperItem[] = [];
    let paginationInfo = null;

    // Handle the v8 API response structure
    if (data.Newspaper && !Array.isArray(data.Newspaper) && 'data' in data.Newspaper) {
      const paginated = data.Newspaper as { data: EpaperItem[]; current_page: number; per_page: number; total: number; last_page: number };
      // Paginated format: { "Newspaper": { "data": [...], "current_page": 1, ... } }
      console.log('🔥 [EpaperAPI] Found paginated format with', paginated.data.length, 'items');
      newspapers = Array.isArray(paginated.data) ? paginated.data : [];
      paginationInfo = {
        current_page: paginated.current_page,
        per_page: paginated.per_page,
        total: paginated.total,
        last_page: paginated.last_page
      };
    } else if (Array.isArray(data.Newspaper)) {
      // Direct format: { "Newspaper": [...] }
      console.log('🔥 [EpaperAPI] Found direct array format with', data.Newspaper.length, 'items');
      newspapers = data.Newspaper;
    } else if (data.epapercity?.Newspaper && Array.isArray(data.epapercity.Newspaper)) {
      // Nested format: { "epapercity": { "Newspaper": [...] } }
      console.log('🔥 [EpaperAPI] Found nested format with', data.epapercity.Newspaper.length, 'items');
      newspapers = data.epapercity.Newspaper;
    } else {
      console.log('🔥 [EpaperAPI] No newspapers found in response. Data structure:', Object.keys(data));
      console.log('🔥 [EpaperAPI] Newspaper type:', typeof data.Newspaper);
      if (data.Newspaper) {
        console.log('🔥 [EpaperAPI] Newspaper keys:', Object.keys(data.Newspaper));
      }
    }

    // Ensure Story_data is properly handled as array
    newspapers = newspapers.map(epaper => ({
      ...epaper,
      Story_data: Array.isArray(epaper.Story_data) ? epaper.Story_data : [],
      parsedStoryData: Array.isArray(epaper.Story_data) ?
        epaper.Story_data.map(url => ({ image: url })) :
        parseStoryData(epaper.Story_data as any)
    }));

    console.log(`🔥 [EpaperAPI] Processed ${newspapers.length} newspapers`);

    // Return in consistent format with pagination info
    return {
      status: true,
      epapercity: {
        Newspaper: newspapers
      },
      pagination: paginationInfo || data.pagination
    };
  } catch (error) {
    console.error('Error fetching epapers:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch epapers');
  }
};

/**
 * Fetch epaper data for a specific date
 * @param date - Date in DD-MM-YYYY format
 */
export const fetchEpapersByDate = async (date: string): Promise<EpaperResponse> => {
  try {
    // Validate date format
    if (!date || !date.match(/^\d{2}-\d{2}-\d{4}$/)) {
      throw new Error('Invalid date format. Expected DD-MM-YYYY');
    }

    // Use common API utility
    const response = await commonApiGet(`epaper/${date}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch epapers for ${date}: ${response.status} ${response.statusText}`);
    }

    const data: EpaperResponse = await response.json();

    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format');
    }



    // Handle both response formats
    let newspapers: EpaperItem[] = [];

    if (data.Newspaper && Array.isArray(data.Newspaper)) {
      // Direct format: { "Newspaper": [...] }
      newspapers = data.Newspaper;

    } else if (data.epapercity?.Newspaper && Array.isArray(data.epapercity.Newspaper)) {
      // Nested format: { "epapercity": { "Newspaper": [...] } }
      newspapers = data.epapercity.Newspaper;

    } else {

    }

    // Ensure Story_data is properly handled as array
    newspapers = newspapers.map(epaper => ({
      ...epaper,
      Story_data: Array.isArray(epaper.Story_data) ? epaper.Story_data : [],
      parsedStoryData: Array.isArray(epaper.Story_data) ?
        epaper.Story_data.map(url => ({ image: url })) :
        parseStoryData(epaper.Story_data as any)
    }));



    // Return in consistent format
    return {
      status: true,
      epapercity: {
        Newspaper: newspapers
      }
    };
  } catch (error) {
    console.error('Error fetching epapers by date:', error);
    throw new Error(error instanceof Error ? error.message : `Failed to fetch epapers for ${date}`);
  }
};

/**
 * Parse Story_data JSON string
 * @param storyDataString - JSON string from API
 */
export const parseStoryData = (storyDataString: string): EpaperStoryData[] => {
  try {
    return JSON.parse(storyDataString);
  } catch (error) {
    console.error('Error parsing story data:', error);
    return [];
  }
};

/**
 * Fetch epaper detail data for a specific epaper
 * @param slug - Epaper slug (e.g., 'gujarat-smachar-e-paper')
 * @param date - Date in DD-MM-YYYY format
 */
export const fetchEpaperDetail = async (slug: string, date: string): Promise<EpaperItem | null> => {
  try {
    // Validate date format
    if (!date || !date.match(/^\d{2}-\d{2}-\d{4}$/)) {
      throw new Error('Invalid date format. Expected DD-MM-YYYY');
    }

    console.log('📰 [EpaperAPI] Fetching epaper detail:', { slug, date });

    const response = await fetch(API_ENDPOINTS.EPAPER_DETAIL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        slug: slug,
        date: date
      }),
      cache: 'no-store', // Ensure fresh data
    });



    if (!response.ok) {
      throw new Error(`Failed to fetch epaper detail: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();


    // Handle the correct response structure - data is under 'epaper' key
    if (data && data.epaper) {
      const epaper = data.epaper;

      // Ensure Story_data is properly handled as array
      return {
        ...epaper,
        Story_data: Array.isArray(epaper.Story_data) ? epaper.Story_data : [],
        parsedStoryData: Array.isArray(epaper.Story_data) ?
          epaper.Story_data.map((url: string) => ({ image: url })) :
          parseStoryData(epaper.Story_data as any)
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching epaper detail:', error);
    throw new Error(error instanceof Error ? error.message : `Failed to fetch epaper detail for ${slug} on ${date}`);
  }
};

/**
 * Get image URL with small format transformation
 * @param epaper - Epaper item
 */
export const getEpaperImageUrl = (epaper: EpaperItem): string => {
  // Story_data is an array of image URLs, get the first one
  if (epaper.Story_data && Array.isArray(epaper.Story_data) && epaper.Story_data.length > 0) {
    const firstImageUrl = epaper.Story_data[0];
    if (firstImageUrl && typeof firstImageUrl === 'string') {
      return firstImageUrl;
    }
  }

  // Fallback to parsed Story_data if available (for backward compatibility)
  if (epaper.parsedStoryData && epaper.parsedStoryData.length > 0) {
    const imagePath = epaper.parsedStoryData[0]?.image;
    if (imagePath) {
      return imagePath;
    }
  }

  // Default fallback image
  return '/images/news-default.png';
};

/**
 * Format date from YYYY-MM-DD to DD-MM-YYYY
 * @param dateString - Date in YYYY-MM-DD format
 */
export const formatDateToDDMMYYYY = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
};

/**
 * Format date from DD-MM-YYYY to YYYY-MM-DD
 * @param dateString - Date in DD-MM-YYYY format
 */
export const formatDateToYYYYMMDD = (dateString: string): string => {
  const [day, month, year] = dateString.split('-');
  return `${year}-${month}-${day}`;
};

/**
 * Get current date in DD-MM-YYYY format
 */
export const getCurrentDateDDMMYYYY = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
};

/**
 * Get current date in YYYY-MM-DD format
 */
export const getCurrentDateYYYYMMDD = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${year}-${month}-${day}`;
};
