import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('API Route: Fetching top home category from tophomecategory endpoint');

    // Get pageNumber from query parameters
    const pageNumber = parseInt(request.nextUrl.searchParams.get('pageNumber') || '1');

    console.log('API Route: Requested page number:', pageNumber);
    
    const response = await fetch(API_ENDPOINTS.TOP_HOME_CATEGORY, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        pageNumber: pageNumber
      })
    });

    console.log('API Route: Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
   
    // Transform the data to match the expected format
    // Extract the news items from the homecategory object
    let newsItems: any[] = [];
    if (data && data.homecategory) {
      // Get all news items from all categories
      Object.values(data.homecategory).forEach((categoryNews: any) => {
        if (Array.isArray(categoryNews)) {
          newsItems.push(...categoryNews);
        }
      });
    }

    // Extract pagination info from the external API response
    const currentPage = data.currentPage || pageNumber;
    const totalPages = data.totalPages || 1;
    const nextPage = data.nextPage || null;
    const hasNextPage = nextPage !== null && currentPage < totalPages;

    const transformedData = {
      status: 'success',
      message: 'Top home category fetched successfully',
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

    

    return NextResponse.json(transformedData);

  } catch (error) {
    console.error('API Route: Error fetching top home category:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to fetch top home category',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
