import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract all form fields
    const user_id = formData.get('user_id') as string;
    const firstname = formData.get('firstname') as string;
    const lastname = formData.get('lastname') as string;
    const city = formData.get('city') as string;
    const email = formData.get('email') as string;
    const birthdate = formData.get('birthdate') as string;
    const bdaytime = formData.get('bdaytime') as string;
    const bdaytimeampm = formData.get('bdaytimeampm') as string;
    const birthdateplace = formData.get('birthdateplace') as string;
    const gender = formData.get('gender') as string;
    const mpin = formData.get('mpin') as string;
    const latitude = formData.get('latitude') as string;
    const longitudee = formData.get('longitudee') as string;
    const profileImg = formData.get('profileImg') as File;
    const action = formData.get('action') as string;

    if (!user_id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('📝 Updating profile for user ID:', user_id, 'Action:', action);

    // Prepare request body for external API
    const apiFormData = new FormData();
    apiFormData.append('user_id', user_id);
    
    if (action === 'delete') {
      apiFormData.append('action', 'delete');
    } else {
      // Update profile fields
      if (firstname) apiFormData.append('firstname', firstname);
      if (lastname) apiFormData.append('lastname', lastname);
      if (city) apiFormData.append('city', city);
      if (email) apiFormData.append('email', email);
      if (birthdate) apiFormData.append('birthdate', birthdate);
      if (bdaytime) apiFormData.append('bdaytime', bdaytime);
      if (bdaytimeampm) apiFormData.append('bdaytimeampm', bdaytimeampm);
      if (birthdateplace) apiFormData.append('birthdateplace', birthdateplace);
      if (gender) apiFormData.append('gender', gender);
      if (mpin) apiFormData.append('mpin', mpin);
      if (latitude) apiFormData.append('latitude', latitude);
      if (longitudee) apiFormData.append('longitudee', longitudee);
      
      // Handle profile image upload
      if (profileImg && profileImg.size > 0) {
        apiFormData.append('profileImg', profileImg);
      }
    }

    // Call external API
    const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
      body: apiFormData,
    });

    const data = await response.json();
    console.log('📝 Update Profile API Response:', data);

    if (data.success || response.ok) {
      return NextResponse.json({
        success: true,
        message: action === 'delete' ? 'Account deleted successfully!' : 'Profile updated successfully!',
        data: data,
        profileImgUrl: data.profileImgUrl || null
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || (action === 'delete' ? 'Failed to delete account' : 'Failed to update profile')
      }, { status: 400 });
    }

  } catch (error) {
    console.error('📝 Update Profile Error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while updating profile' },
      { status: 500 }
    );
  }
}
