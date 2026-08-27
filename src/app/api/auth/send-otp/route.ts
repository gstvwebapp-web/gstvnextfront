import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    const { phone, name, last_name, city, token } = await request.json();
    const path = request.nextUrl.pathname;
    alert(path);
    if (path === "/login" || path.includes("login")) {
      if (!phone) {
        return NextResponse.json(
          { success: false, error: 'Phone number is required' },
          { status: 400 }
        );
      }
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phone.match(phoneRegex)) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid 10-digit phone number.' },
          { status: 400 }
        );
      }
    } else {
      if (!phone) {
        return NextResponse.json(
          { success: false, error: 'Phone number is required' },
          { status: 400 }
        );
      }
      if (!name || name.length < 3) {
        return NextResponse.json(
          { success: false, error: 'Name is required (at least 3 characters)' },
          { status: 400 }
        );
      }

      if (!city || city.length < 3) {
        return NextResponse.json(
          { success: false, error: 'City is required (at least 3 characters)' },
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
    }
    console.log('🔐 Sending OTP to phone:', phone, 'name:', name, 'city:', city);

    // Prepare request body for external API
    const requestBody = new URLSearchParams({
      phone: phone,
      token: token || 'S1d593',
      name: name,
      last_name: last_name || '',
      city: city
    });

    // Call external API
    const response = await fetch(API_ENDPOINTS.SEND_OTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
      body: requestBody,
    });

    const data = await response.json();
    console.log('🔐 Send OTP API Response:', data);

    if (data.success || response.ok) {
      return NextResponse.json({
        success: true,
        message: 'OTP સક્સેસ ફુલ્લી સેંટ થઈ ગયો છે !',
        data: data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || 'OTP મોકલવામાં નિષ્ફળ ગયા છો. કૃપા કરીને ફરી પ્રયાસ કરો.'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('🔐 Send OTP Error:', error);
    return NextResponse.json(
      { success: false, error: 'ભૂલ આવી છે . કૃપા કરીને ફરી પ્રયાસ કરો.' },
      { status: 500 }
    );
  }
}
