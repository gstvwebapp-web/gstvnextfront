import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    const { user_id, category_id } = await request.json();

    if (!user_id || !category_id) {
      return NextResponse.json(
        { success: false, error: 'User ID and Category IDs are required' },
        { status: 400 }
      );
    }

    console.log('🔍 Updating user categories for user ID:', user_id, 'Categories:', category_id);

    // Prepare request body for external API
    const formData = new FormData();
    formData.append('user_id', user_id.toString());
    formData.append('category_id', JSON.stringify(category_id));

    // Call external API
    const response = await fetch(API_ENDPOINTS.USER_CATEGORY, {
      method: 'POST',
      cache: 'no-store',
      body: formData,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
    });

    const data = await response.json();
    console.log('🔍 Update User Categories API Response:', data);

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: 'Categories updated successfully!',
        data: data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || 'Failed to update categories'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('🔍 Update User Categories Error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while updating categories' },
      { status: 500 }
    );
  }
}
