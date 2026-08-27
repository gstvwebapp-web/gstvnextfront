import { NextRequest, NextResponse } from 'next/server';
import { commonApiPost } from '@/constants/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageNumber = '1', per_page = '10' } = body;

    console.log('📰 Epaper API Route: Request params:', { pageNumber, per_page });

    const requestData = {
      pageNumber: pageNumber.toString(),
      per_page: per_page.toString()
    };

   
    // Use common API utility for epaper endpoint
    const response = await commonApiPost('epaper', requestData, true);

   
    if (!response.ok) {
      return NextResponse.json(
        { error: `External API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
   
    return NextResponse.json(data);
  } catch (error) {
  
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
