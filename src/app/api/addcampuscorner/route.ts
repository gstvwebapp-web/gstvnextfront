import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract form fields for validation
    const name = formData.get('name') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const city = formData.get('city') as string;
    const school = formData.get('school') as string; // New field for campus corner
    const agreeStatus = formData.get('agree_status') as string;
    const gujaratId = formData.get('gujaratid') as string; // For edit mode

    // Extract files
    const images = formData.getAll('uploadimage[]') as File[];
    const video = formData.get('uploadvideo') as File | null;

    // Extract existing media information (for edit mode)
    const oldImages = formData.get('oldImages') as string;
    const oldVideo = formData.get('oldVideo') as string;
    const removedImages = formData.get('removed_images') as string;
    const removeVideoFlag = formData.get('remove_video') as string;

    // Determine if this is edit mode
    const isEditMode = !!gujaratId;

    // Validate required fields (including school)
    if (!name || !title || !description || !city || !school) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be filled.' },
        { status: 400 }
      );
    }

    // Validate media - at least 1 image or 1 video (considering existing media in edit mode)
    const hasNewImages = images.length > 0;
    const hasNewVideo = video && video.size > 0;
    const hasExistingImages = isEditMode && oldImages && JSON.parse(oldImages).length > 0;
    const hasExistingVideo = isEditMode && oldVideo && removeVideoFlag !== '1';
    const hasAnyMedia = hasNewImages || hasNewVideo || hasExistingImages || hasExistingVideo;

    if (!hasAnyMedia) {
      return NextResponse.json(
        { success: false, message: 'Please upload at least 1 image or 1 video.' },
        { status: 400 }
      );
    }

    // Validate agreement
    if (agreeStatus !== '1') {
      return NextResponse.json(
        { success: false, message: 'You must agree to the terms and conditions.' },
        { status: 400 }
      );
    }

    // Determine the correct API endpoint
    const apiUrl = isEditMode
      ? API_ENDPOINTS.CAMPUS_CORNER_UPDATE
      : API_ENDPOINTS.CAMPUS_CORNER_SUBMIT;

    // Forward the request to the staging API
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData, // Forward the entire FormData as-is
    });

    const responseData = await response.json();

    // Return the response from the staging API
    return NextResponse.json(responseData, { status: response.status });

  } catch (error) {
    console.error('Error processing campus corner application:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while processing your submission. Please try again.'
      },
      { status: 500 }
    );
  }
}
