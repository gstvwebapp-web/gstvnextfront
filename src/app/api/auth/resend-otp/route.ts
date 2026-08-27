import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
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

    console.log('🔐 Resending OTP to phone:', phone);

    // Prepare request body for external API
    const requestBody = new URLSearchParams({
      phone: phone
    });

    // Call external API
    const response = await fetch(API_ENDPOINTS.RESEND_OTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
      body: requestBody,
    });

    const data = await response.json();
    console.log('🔐 Resend OTP API Response:', data);

    if (data.success || response.ok) {
      return NextResponse.json({
        success: true,
        message: 'OTP resent successfully!',
        data: data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || 'Failed to resend OTP. Please try again.'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('🔐 Resend OTP Error:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
