import { NextRequest, NextResponse } from 'next/server';
import { fetchWebStoryDetail, fetchTopWebStories } from '@/services/newsApi';

interface StoryPageData {
  webimage: string;
  webtitles: string;
  webtitlescredit?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const data = await fetchWebStoryDetail(slug);
    
    if (!data || !data.webstory) {
      return new NextResponse('Web story not found', { status: 404 });
    }

    let storyData: StoryPageData[] = [];
    try {
      storyData = JSON.parse(data.webstory.Story_data);
    } catch (error) {
      console.error('Error parsing story data:', error);
      return new NextResponse('Invalid story data', { status: 400 });
    }

    // Fetch related stories for the last slide
    let relatedStories: any[] = [];
    try {
      if (data.webstorymore && data.webstorymore.length > 0) {
        relatedStories = data.webstorymore.slice(0, 4);
      } else {
        // Fallback to top web stories if no related stories
        const topStoriesData = await fetchTopWebStories();
        relatedStories = topStoriesData.topwebstory.slice(0, 4);
      }
    } catch (error) {
      console.error('Error fetching related stories:', error);
    }

    const storyTitle = data.webstory.title || 'Web Story';
    const posterImage = storyData.length > 0 ? storyData[0].webimage : '';
    const storyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/web-stories/${slug}`;

    // Escape HTML content to prevent XSS
    const escapeHtml = (text: string) => {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    // Helper function to detect language and return appropriate CSS class
    const getLanguageClass = (text: string): string => {
      // Gujarati Unicode range: U+0A80-U+0AFF
      const gujaratiRegex = /[\u0A80-\u0AFF]/;
      return gujaratiRegex.test(text) ? 'gujarati-text' : 'english-text';
    };

    // Generate AMP HTML
    const ampHTML = `<!doctype html>
<html ⚡ lang="en">
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
  <script async custom-element="amp-video" src="https://cdn.ampproject.org/v0/amp-video-0.1.js"></script>
  
  <title>${escapeHtml(storyTitle)}</title>
  <meta name="description" content="Read ${escapeHtml(storyTitle)} - An interactive web story">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  
  <link rel="canonical" href="${storyUrl}">
  
  <meta property="og:title" content="${escapeHtml(storyTitle)}">
  <meta property="og:description" content="Read ${escapeHtml(storyTitle)} - An interactive web story">
  <meta property="og:image" content="${posterImage}">
  <meta property="og:url" content="${storyUrl}">
  <meta property="og:type" content="article">
  
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(storyTitle)}">
  <meta name="twitter:description" content="Read ${escapeHtml(storyTitle)} - An interactive web story">
  <meta name="twitter:image" content="${posterImage}">
  
  <meta name="amp-story-generator-name" content="GSTV News">
  <meta name="amp-story-generator-version" content="1.0.0">

  <!-- Font imports -->
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <script>
  window._izq = window._izq || [];
  window._izq.push(["init"]);
</script>
        <script async src="https://cdn.izooto.com/scripts/3a920df9584e8422018d0726f191046ee24a934e.js"></script>
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
  <noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  
  <style amp-custom>
    /* Font face definitions for Hind Vadodara */
    @font-face {
      font-family: "Hind Vadodara";
      font-weight: normal;
      src: url("/fonts/HindVadodara-Regular.ttf") format("truetype");
    }
    @font-face {
      font-family: "Hind Vadodara";
      font-weight: 500;
      src: url("/fonts/HindVadodara-Medium.ttf") format("truetype");
    }
    @font-face {
      font-family: "Hind Vadodara";
      font-weight: 600;
      src: url("/fonts/HindVadodara-SemiBold.ttf") format("truetype");
    }
    @font-face {
      font-family: "Hind Vadodara";
      font-weight: bold;
      src: url("/fonts/HindVadodara-Bold.ttf") format("truetype");
    }

    amp-story {
      font-family: 'Poppins', sans-serif;
    }

    amp-story-page {
      background-color: #000;
    }



    /* Play icon styling - triangle like in image */
    .play-icon {
      width: 0;
      height: 0;
      border-left: 7px solid white;
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      margin-left: 1px;
    }

    .story-text-overlay {
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
      padding: 30px 20px 20px 30px;
      color: white;
      text-align: left;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      backdrop-filter: blur(2px);
    }

    .story-text-overlay::before {
      content: '';
      position: absolute;
      left: 20px;
      top: 30px;
      bottom: 20px;
      width: 4px;
      background-color: #FFD700;
    }

    /* Font classes for different languages */
    .gujarati-text {
      font-family: "Hind Vadodara", sans-serif !important;
    }

    .english-text {
      font-family: "Poppins", sans-serif !important;
    }

    .story-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 8px 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
      line-height: 1.3;
      color: #ffffff;
      font-family: "Hind Vadodara", sans-serif; /* Default to Gujarati font */
    }

    .story-credit {
      font-size: 11px;
      margin: 0;
      opacity: 0.8;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
      color: #827f7f;
      font-family: "Hind Vadodara", sans-serif; /* Default to Gujarati font */
      text-align: right;
      font-style: italic;
    }

    .more-stories-container {
      height: 100vh;
      padding: 0;
      display: flex;
      flex-direction: column;
    }

    .more-stories-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: 15px;
      height: calc(100vh - 40px);
      width: calc(100vw - 40px);
      margin: 20px;
      box-sizing: border-box;
      position: absolute;
      top: 0;
      left: 0;
    }

    .more-story-item {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s ease;
      text-decoration: none;
      color: inherit;
      display: block;
      background: #000;
      border-radius: 12px;
      aspect-ratio: 9/16;
      min-height: 200px;
    }

    .more-story-item:hover {
      transform: scale(1.02);
    }

    .more-story-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      border-radius: 12px;
    }

    .more-story-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
      color: white;
      padding: 15px;
      text-align: left;
      border-radius: 0 0 12px 12px;
    }

    .more-story-title {
      font-size: 16px;
      font-weight: 600;
      margin: 0;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
      line-height: 1.3;
      font-family: "Hind Vadodara", sans-serif; /* Default to Gujarati font */
    }

    /* Pause/Play icons on grid items like in your design */
    .grid-item-icon {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 28px;
      height: 28px;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 10px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      z-index: 10;
    }

    .grid-pause-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
    }

    .grid-pause-bar {
      width: 2px;
      height: 8px;
      background: white;
      border-radius: 1px;
    }

    .more-story-title {
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Back button styling */
    .back-btn {
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1000;
    }

    .backvideoicon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 35px;
      height: 35px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      color: white;
      text-decoration: none;
      font-size: 16px;
      transition: all 0.3s ease;
      border: 2px solid rgba(255, 255, 255, 0.3);
      position: relative;
    }

    .backvideoicon::before {
      content: '';
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      border: 2px solid #0b1013;
      border-radius: 50%;
      opacity: 0.7;
      animation: pulse 2s infinite;
    }

    .backvideoicon:hover {
      background: rgba(255, 255, 255, 0.9);
      color: #333;
      transform: scale(1.1);
      border: 2px solid rgba(0, 0, 0, 0.1);
    }

    .backvideoicon i {
      font-size: 18px;
    }

    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 0.7;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.4;
      }
      100% {
        transform: scale(1);
        opacity: 0.7;
      }
    }

    @media (max-width: 768px) {
      .story-title {
        font-size: 20px;
      }

      .story-credit {
        font-size: 11px;
      }

      .more-story-title {
        font-size: 11px;
      }

      .more-stories-container {
        padding: 0;
      }

      /* Mobile back button adjustments */
      .back-btn {
        top: 15px;
        left: 15px;
      }

      .backvideoicon {
        width: 30px;
        height: 30px;
        font-size: 14px;
      }

      .more-stories-grid {
        gap: 6px;
        margin: 15px;
        width: calc(100vw - 30px);
        height: calc(100vh - 30px);
      }

      .grid-item-icon {
        top: 8px;
        right: 8px;
        width: 24px;
        height: 24px;
      }

      .grid-pause-bar {
        width: 1.5px;
        height: 6px;
      }
    }
  </style>

  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>

  <!-- Font Awesome for icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>

<body>
  <!-- Back Button -->
  <div class="back-btn">
    <a href="/web-stories" class="backvideoicon"><i class="fa fa-chevron-left"></i></a>
  </div>

  <amp-story
    standalone
    title="${escapeHtml(storyTitle)}"
    publisher="GSTV News"
    publisher-logo-src="/assets/images/logo.png"
    poster-portrait-src="${posterImage}"
    poster-square-src="${posterImage}"
    poster-landscape-src="${posterImage}"
    auto-advance-after="5s">



    ${storyData.map((page, index) => `
      <amp-story-page id="page-${index + 1}" auto-advance-after="5s">
        <amp-story-grid-layer template="fill">
          <amp-img
            src="${page.webimage}"
            width="720"
            height="1280"
            layout="responsive"
            alt="${escapeHtml(page.webtitles || `Story page ${index + 1}`)}">
          </amp-img>
        </amp-story-grid-layer>
        
        ${page.webtitles ? `
          <amp-story-grid-layer template="vertical">
            <div class="story-text-overlay">
              <h2 class="story-title ${getLanguageClass(page.webtitles)}">${escapeHtml(page.webtitles)}</h2>
              ${page.webtitlescredit ? `<p class="story-credit ${getLanguageClass(page.webtitlescredit)}"><b>સોર્સ :</b> ${escapeHtml(page.webtitlescredit)}</p>` : ''}
            </div>
          </amp-story-grid-layer>
        ` : ''}
      </amp-story-page>
    `).join('')}

    ${relatedStories.length > 0 ? `
      <amp-story-page id="more-stories">
        <amp-story-grid-layer template="fill">
          <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); height: 100%;"></div>
        </amp-story-grid-layer>

        <amp-story-grid-layer template="vertical">
          <div class="more-stories-container">
            <div class="more-stories-grid">
              ${relatedStories.map((story, index) => {
                let storyImageData = [];
                try {
                  storyImageData = JSON.parse(story.Story_data);
                } catch (e) {
                  console.error('Error parsing story data for related story:', e);
                }
                const firstImage = storyImageData[0]?.webimage;
                return `
                  <a href="/web-stories/${story.slug}" class="more-story-item">
                    <amp-img
                      src="${firstImage}"
                      width="200"
                      height="300"
                      layout="responsive"
                      alt="${escapeHtml(story.title)}">
                    </amp-img>
                    <div class="grid-item-icon">
                      <div class="grid-pause-icon">
                        <div class="grid-pause-bar"></div>
                        <div class="grid-pause-bar"></div>
                      </div>
                    </div>
                    <div class="more-story-overlay">
                      <h3 class="more-story-title ${getLanguageClass(story.title)}">${escapeHtml(story.title)}</h3>
                    </div>
                  </a>
                `;
              }).join('')}
            </div>
          </div>
        </amp-story-grid-layer>
      </amp-story-page>
    ` : ''}

    <amp-story-bookend
      src="/api/webstory/bookend"
      layout="nodisplay">
    </amp-story-bookend>
  </amp-story>

  <script>
    // Initialize story with autoplay enabled
    document.addEventListener('DOMContentLoaded', function() {
      const story = document.querySelector('amp-story');

      // Start autoplay immediately
      if (story) {
        story.play();
      }
    });
  </script>
</body>
</html>`;

    return new NextResponse(ampHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      },
    });
  } catch (error) {
    console.error('Error loading web story:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
