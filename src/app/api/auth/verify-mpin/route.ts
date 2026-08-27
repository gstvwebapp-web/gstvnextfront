import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    const { phone, mpin } = await request.json();

    if (!phone || !mpin) {
      return NextResponse.json(
        { success: false, error: 'Phone number and M-PIN are required' },
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

    // Validate M-PIN format
    const mpinRegex = /^\d{6}$/;
    if (!mpin.match(mpinRegex)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 6-digit M-PIN.' },
        { status: 400 }
      );
    }

    console.log('🔐 Verifying M-PIN for phone:', phone, 'M-PIN:', mpin);

    // Prepare request body for external API
    const requestBody = new URLSearchParams({
      phone: phone,
      mpin: mpin
    });

    // Call external API
    const response = await fetch(API_ENDPOINTS.VERIFY_MPIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'User-Agent': 'GSTV-NextJS-App/1.0',
      },
      body: requestBody,
    });

    const data = await response.json();
    console.log('🔐 Verify M-PIN API Response:', data);

    if (data.success || response.ok) {
      // Ensure user_id is available in the response data
      const responseData = {
        ...data,
        id: data.id || data.user_id || phone, // Ensure id field exists
        user_id: data.user_id || data.id || phone, // Ensure user_id field exists
      };

      console.log('🔐 Verify M-PIN - Enhanced response data with user_id:', responseData.user_id);

      return NextResponse.json({
        success: true,
        message: 'એમ-પિન સફળતાપૂર્વક વેરિફાય થઈ ગયું છે!',
        data: responseData,
        id: responseData.id,
        user_id: responseData.user_id,
        epaperurl: data.epaperurl || '',
        newsurl: data.newsurl || '',
        profileSts: data.profileSts || 0
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data.message || 'અમાન્ય એમ-પિન. કૃપા કરીને ફરી પ્રયાસ કરો..'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('🔐 Verify M-PIN Error:', error);
    return NextResponse.json(
      { success: false, error: 'અમાન્ય એમ-પિન. કૃપા કરીને ફરી પ્રયાસ કરો.' },
      { status: 500 }
    );
  }
}
