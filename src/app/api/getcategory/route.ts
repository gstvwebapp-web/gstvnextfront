import { NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export async function GET() {
  try {
    console.log('🔍 Fetching categories from staging API...');

    // Call staging API using common utility (but CATEGORY_SETTING is v6, so use full URL)
    const response = await fetch(API_ENDPOINTS.CATEGORY_SETTING, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('🔍 Raw API Response:', data);

    if (data && data.category && Array.isArray(data.category)) {
      // Filter categories with parentID = 0 and status = 'Active'
      const filteredCategories = data.category.filter((cat: { title: string; parentID: number; status: string }) => {
        console.log(`Category: ${cat.title}, parentID: ${cat.parentID}, status: ${cat.status}`);
        return cat.parentID === 0 && cat.status === 'Active';
      });

      console.log('🔍 Filtered categories count:', filteredCategories.length);
      console.log('🔍 Filtered categories:', filteredCategories.map((cat: { title: string }) => cat.title));

      // Get user's selected categories from session/localStorage
      // For now, we'll return empty array for userwisecity
      const userSelectedCategories: string[] = [];

      return NextResponse.json({
        success: true,
        catCity: filteredCategories,
        userwisecity: userSelectedCategories
      });
    } else {
      console.error('🔍 Invalid API response structure:', data);
      return NextResponse.json({
        success: false,
        error: 'Invalid API response structure'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('🔍 Get Categories Error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while fetching categories' },
      { status: 500 }
    );
  }
}
