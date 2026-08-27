import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

interface SubmitPollRequest {
  pollID: string;
  selectedAnswer: string;
  device_id: string;
  user_id?: string; // optional: include if available
}

interface SubmitPollResponse {
  success: boolean;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('Submitting poll vote...');

    const body: SubmitPollRequest = await request.json();
    const { pollID, selectedAnswer, device_id, user_id } = body;

    if (!pollID || !selectedAnswer || !device_id) {
      return NextResponse.json(
        { error: 'Missing required fields: pollID, selectedAnswer, device_id' },
        { status: 400 }
      );
    }

    console.log('Poll submission data:', { pollID, selectedAnswer, device_id, user_id });

    // Prepare URL-encoded form body
    const params = new URLSearchParams({
      pollID: pollID,                 // Field name: pollID (e.g., 25)
      selectedAnswer: selectedAnswer, // Field name: selectedAnswer (e.g., 541)
      device_id: device_id            // Field name: device_id (e.g., web_...)
    });
    // Include user identifier when available for vote table attribution
    if (user_id) {
      params.append('user_id', user_id);
      params.append('userID', user_id); // for backward compatibility with legacy field name
    }

    // Make the API call to the backend
    const response = await fetch(API_ENDPOINTS.POLL_SUBMIT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params,
    });

    console.log('Submit poll API response status:', response.status);

    if (!response.ok) {
      console.error('External API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Failed to submit poll: ${response.status}` },
        { status: response.status }
      );
    }

    const data: SubmitPollResponse = await response.json();
    console.log('Submit poll API response data:', data);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store', // Don't cache poll submissions
      },
    });

  } catch (error) {
    console.error('Error in poll submit API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
