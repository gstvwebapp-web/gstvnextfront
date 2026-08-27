import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

interface SearchRequestBody {
  txtSearch: string;
  pageNumber?: number;
  user_id?: string;
}

interface SearchResponse {
  status: boolean;
  message: string;
  data: {
    current_page: number;
    data: Array<{
      id: number;
      title: string;
      description: string;
      slug: string;
      featureImage?: string;
      videoURL?: string;
      created_at: string;
      updated_at: string;
      catID?: string;
      is_vertical_video?: number;
      categories?: Array<{
        id: number;
        title: string;
        slug: string;
      }>;
    }>;
    last_page: number;
    next_page_url: string | null;
    total: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequestBody = await request.json();
    
    console.log('🔍 Search API Request:', body);

    // Validate required fields
    if (!body.txtSearch || body.txtSearch.trim() === '') {
      return NextResponse.json(
        { 
          status: false,
          error: 'txtSearch parameter is required and cannot be empty' 
        },
        { status: 400 }
      );
    }

    // Prepare request body for external API
    const requestBody = new URLSearchParams({
      txtSearch: body.txtSearch.trim(),
      pageNumber: (body.pageNumber || 1).toString()
     // user_id: body.user_id || '85', // Default user_id as shown in the image
    //  device_id: '172.70.111.140' // Add device_id as used in other APIs
    });

    console.log('🔍 Sending request to external API:', requestBody.toString());

    // Make request to external API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response: Response;
    try {
      response = await fetch(API_ENDPOINTS.SEARCH_RESULT, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'GSTV-NextJS-App/1.0',
        },
        body: requestBody,
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('🔍 Network error:', fetchError);

      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Search request timed out. Please try again.');
      }

      // For development: Return mock data if external API is unavailable
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Using mock search data for development');
        const mockResponse: SearchResponse = {
          status: true,
          message: 'Mock search results',
          data: {
            current_page: body.pageNumber || 1,
            data: [
              {
                id: 1,
                title: `Mock search result for "${body.txtSearch}"`,
                description: 'This is a mock search result for development purposes.',
                slug: 'mock-search-result-1',
                featureImage: '/images/gstv-logo-bg.png',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                catID: '1,2',
              },
              {
                id: 2,
                title: `Another mock result for "${body.txtSearch}"`,
                description: 'This is another mock search result for testing.',
                slug: 'mock-search-result-2',
                featureImage: '/images/gstv-logo-bg.png',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                catID: '1,9',
                videoURL: '/videos/mock-video.mp4',
              }
            ],
            last_page: 1,
            next_page_url: null,
            total: 2
          }
        };

        return NextResponse.json(mockResponse, {
          headers: {
            'Cache-Control': 'no-cache', // Don't cache mock data
          },
        });
      }

      throw new Error(`Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }

    clearTimeout(timeoutId);

    console.log('🔍 External API response status:', response.status);

    if (!response.ok) {
      console.error('🔍 External API error:', response.status, response.statusText);
      throw new Error(`External API error: ${response.status} ${response.statusText}`);
    }

    // Get response text first to debug
    const responseText = await response.text();
    console.log('🔍 Raw external API response:', responseText);

    let data: any;
    try {
      data = JSON.parse(responseText);
      console.log('🔍 Parsed external API response data:', data);
    } catch (parseError) {
      console.error('🔍 JSON parse error:', parseError);
      throw new Error(`Invalid JSON response from external API: ${responseText.substring(0, 200)}`);
    }

    // Handle the actual API response format with 'news' key
    let formattedResponse: SearchResponse;

    if (data && typeof data === 'object') {
      // Handle the actual API format with 'news' key
      if (data.news && typeof data.news === 'object') {
        const newsData = data.news;
        formattedResponse = {
          status: true,
          message: 'Success',
          data: {
            current_page: newsData.current_page || 1,
            data: newsData.data || [],
            last_page: newsData.last_page || 1,
            next_page_url: newsData.next_page_url || null,
            total: newsData.total || 0
          }
        };
      }
      // Check if it's already in the expected format (fallback)
      else if (typeof data.status !== 'undefined' && data.data) {
        formattedResponse = data as SearchResponse;
      }
      // Handle direct data array response (fallback)
      else if (Array.isArray(data)) {
        formattedResponse = {
          status: true,
          message: 'Success',
          data: {
            current_page: 1,
            data: data,
            last_page: 1,
            next_page_url: null,
            total: data.length
          }
        };
      }
      // Handle Laravel pagination format (fallback)
      else if (data.data && Array.isArray(data.data)) {
        formattedResponse = {
          status: true,
          message: 'Success',
          data: {
            current_page: data.current_page || 1,
            data: data.data,
            last_page: data.last_page || 1,
            next_page_url: data.next_page_url || null,
            total: data.total || data.data.length
          }
        };
      }
      // Handle empty or error responses
      else {
        formattedResponse = {
          status: true,
          message: 'No results found',
          data: {
            current_page: 1,
            data: [],
            last_page: 1,
            next_page_url: null,
            total: 0
          }
        };
      }
    } else {
      throw new Error(`Invalid response format from external API: ${typeof data}`);
    }

    // Return the formatted response
    return NextResponse.json(formattedResponse, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60', // Cache for 1 minute
      },
    });

  } catch (error) {
    // Return a more user-friendly error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Check if it's a network/timeout error and provide fallback
    if (errorMessage.includes('Network error') || errorMessage.includes('timed out')) {
      return NextResponse.json(
        {
          status: false,
          error: 'Search service is temporarily unavailable',
          message: 'કૃપા કરીને થોડી વાર પછી ફરીથી પ્રયાસ કરો',
          data: {
            current_page: 1,
            data: [],
            last_page: 1,
            next_page_url: null,
            total: 0
          }
        },
        { status: 503 } // Service Unavailable
      );
    }

    return NextResponse.json(
      {
        status: false,
        error: 'Failed to fetch search results',
        message: errorMessage,
        data: {
          current_page: 1,
          data: [],
          last_page: 1,
          next_page_url: null,
          total: 0
        }
      },
      { status: 500 }
    );
  }
}

// Also support GET method for testing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const txtSearch = searchParams.get('txtSearch');
    const pageNumber = parseInt(searchParams.get('pageNumber') || '1');
    const user_id = searchParams.get('user_id') || '';

    if (!txtSearch) {
      return NextResponse.json(
        { 
          status: false,
          error: 'txtSearch parameter is required' 
        },
        { status: 400 }
      );
    }

    // Call the POST method internally
    const postResponse = await POST(new NextRequest(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txtSearch, pageNumber, user_id })
    }));

    return postResponse;

  } catch (error) {
    console.error('🔍 Search API Route (GET) Error:', error);
    return NextResponse.json(
      { 
        status: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
