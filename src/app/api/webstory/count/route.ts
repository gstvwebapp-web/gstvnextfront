import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Here you would typically update the view count in your database
    // For now, we'll just log it and return success
    console.log(`Web story view tracked for slug: ${slug}`);

    // You can implement the actual database update here
    // Example:
    // await updateWebStoryViewCount(slug);

    return NextResponse.json(
      { success: true, message: 'View count updated' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error tracking web story view:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
