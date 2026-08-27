import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID parameter is required' },
        { status: 400 }
      );
    }

    console.log(`📚 Campus Corner API: Fetching details for ID ${id}`);

    // Try v9 API first (POST method with campuscornerid parameter)
    try {
      const v9Response = await fetch(API_ENDPOINTS.CAMPUS_CORNER_DETAILS, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'GSTV-NextJS-App/1.0',
        },
        body: new URLSearchParams({
          campuscornerid: id
        }),
      });

      if (v9Response.ok) {
        const v9Data = await v9Response.json();
        console.log(`📚 v9 API Response for ID ${id}:`, v9Data);

        if (v9Data.success && v9Data.data) {
          return NextResponse.json(v9Data);
        }
      }
    } catch (v9Error) {
      console.warn(`📚 v9 API failed for ID ${id}:`, v9Error);
    }

    // Fallback to v5 API
    console.log(`📚 Falling back to v5 API for ID ${id}`);
    const v5Response = await fetch(API_ENDPOINTS.CAMPUS_CORNER_DETAILS, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
      body: new URLSearchParams({
        campuscornerid: id
      }),
    });

    if (!v5Response.ok) {
      throw new Error(`v5 API HTTP error! status: ${v5Response.status}`);
    }

    const v5Data = await v5Response.json();
    console.log(`📚 v5 API Response for ID ${id}:`, v5Data);

    if (!v5Data.success || !v5Data.data) {
      // If this ID doesn't exist, return a 404 response to indicate no more content
      console.log(`📚 ❌ ID ${id} not found - no more campus corner entries available`);
      return NextResponse.json(
        { success: false, error: 'Campus corner entry not found', last_id: null },
        { status: 404 }
      );
    }

    // Transform v5 response to match v9 format (add mock last_id)
    const transformedData = {
      success: true,
      data: v5Data.data,
      last_id: parseInt(id) - 1 > 0 ? parseInt(id) - 1 : null // Mock last_id for infinite scroll
    };

    console.log(`📚 ✅ Returning data for ID ${id} with last_id: ${transformedData.last_id}`);
    return NextResponse.json(transformedData);

  } catch (error) {
    const { id } = await params;
    console.error(`📚 Campus Corner API Error for ID ${id}:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch campus corner details'
      },
      { status: 500 }
    );
  }
}
