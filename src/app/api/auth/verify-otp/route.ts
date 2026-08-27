import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone.match(phoneRegex)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit phone number.' },
        { status: 400 }
      );
    }

    // Validate OTP format
    const otpRegex = /^\d{6}$/;
    if (!otp.match(otpRegex)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 6-digit OTP.' },
        { status: 400 }
      );
    }

    console.log('🔐 Verifying OTP for phone:', phone, 'OTP:', otp);

    // Prepare request body for external API
    const requestBody = new URLSearchParams({
      phone: phone,
      otp: otp
    });

    // Call external API
    const response = await fetch(API_ENDPOINTS.VERIFY_OTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
      body: requestBody,
    });

    const data = await response.json();
    console.log('🔐 Verify OTP API Response:', data);

    if (data.success || response.ok) {
      // Ensure user_id is available in the response data
      const responseData = {
        ...data,
        id: data.id || data.user_id || phone, // Ensure id field exists
        user_id: data.user_id || data.id || phone, // Ensure user_id field exists
      };

      console.log('🔐 Verify OTP - Enhanced response data with user_id:', responseData.user_id);

      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully!',
        data: responseData,
        id: responseData.id,
        user_id: responseData.user_id,
        userId: responseData.user_id || responseData.id, // Add userId for compatibility
        epaperurl: data.epaperurl || '',
        newsurl: data.newsurl || '',
        profileSts: data.profileSts || 0
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || 'Invalid OTP. Please try again.'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('🔐 Verify OTP Error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid OTP. Please try again.' },
      { status: 500 }
    );
  }
}
