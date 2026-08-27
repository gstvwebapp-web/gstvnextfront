import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test VideoLike API Route: Processing request');
    
    const body = await request.json();
    console.log('🧪 Request body:', body);
    
    const { video_id, device_id, status, user_id } = body;

    // Prepare request body for external API (form data)
    // Backend expects 'video_id' parameter based on Network tab analysis
    const requestBody = new URLSearchParams({
      video_id: video_id?.toString() || '',
      device_id: device_id?.toString() || '',
      status: status?.toString() || '1'
    });
    
    // Add user_id if provided
    if (user_id) {
      requestBody.append('user_id', user_id.toString());
    }
    
    console.log('🧪 Sending to staging API:', {
      url: API_ENDPOINTS.VIDEOLIKE, 
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: Object.fromEntries(requestBody)
    });
    
    // Call external API
    const response = await fetch(API_ENDPOINTS.VIDEOLIKE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
      body: requestBody,
    });
    
    console.log('🧪 Staging API response status:', response.status);
    console.log('🧪 Staging API response headers:', Object.fromEntries(response.headers.entries()));
    
    let data;
    try {
      data = await response.json();
      console.log('🧪 Staging API response data:', data);
    } catch (parseError) {
      const textResponse = await response.text();
      console.log('🧪 Staging API raw response:', textResponse);
      data = { error: 'Invalid JSON response', raw: textResponse };
    }
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: data,
      requestSent: Object.fromEntries(requestBody)
    });
    
  } catch (error) {
    console.error('🧪 Test VideoLike API Route error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
