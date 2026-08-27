// Web Story API Service
import { API_V5_BASE_URL } from '@/constants/api';
export interface WebStoryPageData {
  webimage: string;
  webtitles: string;
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
  parsedStoryData?: WebStoryPageData[];
}

export interface WebStoryPageResponse {
  status: boolean;
  message: string;
  webstory: {
    current_page: number;
    data: WebStoryItem[];
    first_page_url?: string;
    from?: number;
    last_page: number;
    last_page_url?: string;
    next_page_url: string | null;
    path?: string;
    per_page?: number;
    prev_page_url: string | null;
    to?: number;
    total?: number;
  };
}

/**
 * Fetch web stories with pagination
 * @param page - Page number for pagination (default: 1)
 * @returns Promise<WebStoryPageResponse>
 */
export const fetchWebStories = async (page: number = 1): Promise<WebStoryPageResponse> => {
  try {
    const apiUrl = `${API_V5_BASE_URL}/webstory/${page}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });

    if (response.ok) {
      const data = await response.json();

      // Parse Story_data for each web story
      if (data.webstory && data.webstory.data) {
        data.webstory.data = data.webstory.data.map((story: WebStoryItem) => {
          try {
            story.parsedStoryData = JSON.parse(story.Story_data);
          } catch (error) {
            console.error('Error parsing Story_data for story:', story.id, error);
            story.parsedStoryData = [];
          }
          return story;
        });
      }

      return {
        status: true,
        message: 'Success',
        webstory: data.webstory || {
          current_page: 1,
          data: [],
          last_page: 1,
          next_page_url: null,
          prev_page_url: null,
          total: 0
        }
      };
    } else {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error fetching web stories:', error);
    return {
      status: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      webstory: {
        current_page: 1,
        data: [],
        last_page: 1,
        next_page_url: null,
        prev_page_url: null,
        total: 0
      }
    };
  }
};

/**
 * Get the small image URL for web story
 * @param imageUrl - Original image URL
 * @returns Small image URL
 */
export const getSmallImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '/public/assets/images/video-default.png';
  return imageUrl.replace('.webp', '_small.webp');
};

/**
 * Get the default image URL
 * @returns Default image URL
 */
export const getDefaultImageUrl = (): string => {
  return '/images/video-default.png';
};
