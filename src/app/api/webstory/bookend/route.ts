import { NextRequest, NextResponse } from 'next/server';
import { fetchTopWebStories } from '@/services/newsApi';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Fetch related web stories from your API
    let relatedStories: any[] = [];
    try {
      const topStoriesData = await fetchTopWebStories();
      relatedStories = topStoriesData.topwebstory.slice(0, 4);
    } catch (error) {
      console.error('Error fetching related stories for bookend:', error);
    }

    const bookendData = {
      "bookendVersion": "v1.0",
      "shareProviders": [
        {
          "provider": "facebook",
          "app-id": "YOUR_FACEBOOK_APP_ID"
        },
        {
          "provider": "twitter"
        },
        {
          "provider": "whatsapp"
        },
        {
          "provider": "email"
        },
        {
          "provider": "system"
        }
      ],
      "components": [
        {
          "type": "heading",
          "text": "More Stories"
        },
        ...relatedStories.map(story => {
          let storyImageData = [];
          try {
            storyImageData = JSON.parse(story.Story_data);
          } catch (e) {
            console.error('Error parsing story data for bookend:', e);
          }
          const firstImage = storyImageData[0]?.webimage || '/assets/images/default-story.jpg';

          return {
            "type": "small",
            "title": story.title,
            "url": `/web-stories/${story.slug}`,
            "image": firstImage
          };
        })
      ]
    };

    return NextResponse.json(bookendData, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error generating bookend:', error);
    return NextResponse.json(
      { error: 'Failed to generate bookend' },
      { status: 500 }
    );
  }
}
