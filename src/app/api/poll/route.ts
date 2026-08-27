import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS, commonApiPost } from '@/constants/api';

interface PollData {
  id: number;
  userID: number;
  parentID: number;
  question: string;
  answerOption: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface PollApiResponse {
  poll: PollData[];
  status?: boolean;
  message?: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching poll data from external API');

    // Generate a consistent device ID based on user agent (without timestamp)
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const deviceId = 'server_' + Buffer.from(userAgent).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);

    // Make the API call using common API utility
    const response = await commonApiPost(API_ENDPOINTS.POLL, {
      device_id: deviceId
    }, true); // true for form data

    if (!response.ok) {
      console.error('External API error:', response.status, response.statusText);
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Poll not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to fetch poll: ${response.status}` },
        { status: response.status }
      );
    }

    const data: PollApiResponse = await response.json();

    if (!data.poll) {
      return NextResponse.json(
        { error: data.message || 'No poll data found' },
        { status: 404 }
      );
    }

    console.log('Successfully fetched poll data:', data.poll.length, 'polls');

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60', // Cache for 1 minute
      },
    });

  } catch (error) {
    console.error('Error in poll API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
