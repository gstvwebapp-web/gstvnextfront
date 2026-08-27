import { commonApiGet, API_ENDPOINTS } from '@/constants/api';

export async function GET() {
  try {
    const response = await commonApiGet(API_ENDPOINTS.GET_RELIGION_RASHI, {});
    
    if (!response.ok) {
      console.error(`Religion Rashi API returned ${response.status}`);
      return Response.json(
        { status: false, data: [], error: `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Ensure response has correct structure
    if (!data) {
      return Response.json(
        { status: false, data: [], error: 'Empty response' },
        { status: 200 }
      );
    }

    return Response.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Religion Rashi API error:', error);
    return Response.json(
      { status: false, data: [], error: 'Failed to fetch religion rashi data' },
      { status: 500 }
    );
  }
}
