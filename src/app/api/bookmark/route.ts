import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { news_id, user_id, status, bookmark_type } = body;

    console.log('🔖 Bookmark API Route: Request params:', { news_id, user_id, status, bookmark_type });

    // Validate required parameters
    if (!news_id || !user_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'news_id and user_id are required' 
        },
        { status: 400 }
      );
    }

    // Validate status (1 = bookmark, 0 = unbookmark)
    if (status !== 1 && status !== 0 && status !== '1' && status !== '0') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'status must be 1 (bookmark) or 0 (unbookmark)' 
        },
        { status: 400 }
      );
    }

    // Prepare request body for external API
    const requestBody = new URLSearchParams({
      news_id: news_id.toString(),
      user_id: user_id.toString(),
      status: status.toString(),
      bookmark_type: bookmark_type || 'news' // Default to 'news' if not provided
    });

    console.log('🔖 Bookmark API Route: Making external API call with params:', Object.fromEntries(requestBody));

    // Call external bookmark API
    const response = await fetch(API_ENDPOINTS.NEWS_BOOKMARK, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
      body: requestBody,
    });

    const data = await response.json();
    console.log('🔖 Bookmark API Response:', data);

    if (response.ok && (data.success || data.status === 'success')) {
      // Determine action message
      const action = status === 1 || status === '1' ? 'added' : 'removed';
      const gujaratiMessage = status === 1 || status === '1' 
        ? 'બુકમાર્ક ઉમેરવામાં આવ્યું!' 
        : 'બુકમાર્ક દૂર કરવામાં આવ્યું!';

      return NextResponse.json({
        success: true,
        message: `Bookmark ${action} successfully!`,
        gujaratiMessage,
        data: data,
        bookmarked: status === 1 || status === '1'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || data.error || 'Failed to update bookmark'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('🔖 Bookmark API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error while updating bookmark' 
      },
      { status: 500 }
    );
  }
}
