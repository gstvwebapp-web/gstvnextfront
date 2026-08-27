import { NextRequest, NextResponse } from 'next/server';
import { commonApiGet } from '@/constants/api';

export const dynamic = 'force-dynamic';

interface VoteResult {
  selectedAnswer: string;
  answerCount: number;
  percentage: number;
}

interface PollResult {
  id: number;
  question: string;
  answerOption: string;
  selectedresult: VoteResult[];
}

interface PollResultsApiResponse {
  pollresults: PollResult[];
  status?: boolean;
  message?: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching poll results from external API');
    // Device ID generation for future use if needed
    // const deviceId = 'server_' + Buffer.from(userAgent).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);

    // Make the API call using common API utility
    const response = await commonApiGet('pollresult');

    console.log('Poll results API response status:', response.status);

    if (!response.ok) {
      console.error('External API error:', response.status, response.statusText);
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Poll results not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to fetch poll results: ${response.status}` },
        { status: response.status }
      );
    }

    const data: PollResultsApiResponse = await response.json();

    if (!data.pollresults) {
      return NextResponse.json(
        { error: data.message || 'No poll results found' },
        { status: 404 }
      );
    }

    console.log('Successfully fetched poll results:', data.pollresults.length, 'polls');

    // Transform the data to match the expected structure for the frontend
    const transformedData = {
      pollresults: data.pollresults,
      voteresults: data.pollresults.reduce((acc, poll) => {
        acc[poll.id] = poll.selectedresult.map(result => ({
          selectedAnswer: result.selectedAnswer,
          answerCount: result.answerCount,
          percentage: result.percentage.toString()
        }));
        return acc;
      }, {} as { [key: number]: { selectedAnswer: string; answerCount: number; percentage: string }[] })
    };

    return NextResponse.json(transformedData, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Cache for 5 minutes
      },
    });

  } catch (error) {
    console.error('Error in poll results API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
