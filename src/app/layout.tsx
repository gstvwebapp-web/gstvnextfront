import '../styles/styles.css';
import '../styles/styles_new.css';
import '../styles/topnews.css';
import '../styles/category.css';
import '../styles/VideoCategory.css';
import '../styles/SearchPage.css';
import '../styles/TopVideos.css';
import '../styles/WebStories.css';
import '../styles/news-detail.css';
import '../styles/video-detail.css';
import '../styles/gstv-shatrang.css';
import '../styles/category-dropdown.css';
import '../styles/profile.css';
import '../styles/election.css';
import '../styles/ElectionModule.css';
import '../styles/CookieConsentBanner.css';
import '../styles/accessibility.css';
import '../../public/assets/css/athaitap.css';
import '../../public/assets/css/google-translate.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Script from 'next/script';
import type { Metadata } from 'next';

import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import LayoutWrapper from '@/components/LayoutWrapper';
import ConditionalLayout from '@/components/ConditionalLayout';
import MobileAppPrompt from '@/components/MobileAppPrompt';
import CacheManager from '@/components/CacheManager';
import BackToTop from '@/components/BackToTop';
import PollLoader from '@/components/PollLoader';
import CookieConsentBanner from '@/components/CookieConsentBanner';

import { AuthProvider } from '@/contexts/AuthContext';
import { BookmarkProvider } from '@/contexts/BookmarkContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CategorySettingsProvider } from '@/contexts/CategorySettingsContext';
import GoogleAnalyticsTracker from '@/components/GoogleAnalyticsTracker';

import { API_ENDPOINTS } from '@/constants/api';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(API_ENDPOINTS.CATEGORY_SETTING, { next: { revalidate: 600 } });
    const json = await res.json();
    const obj = json?.settings?.[0] || json?.setting?.[0] || {};

    // Use environment variable for og:image base URL
    const ogImageBase = process.env.NEXT_PUBLIC_OG_IMAGE_BASE || 'https://www.gstv.in';
    const ogImageUrl = `${ogImageBase}/assets/images/gstv-logo-bg.png`;

    const defaultTitle = 'GSTV | Latest Gujarati News — Gujarat, India | Breaking News 24x7';
    const defaultDesc = 'GSTV (Gujarat Samachar TV) delivers 24x7 breaking news, latest updates from Gujarat, India, politics, entertainment, sports, and business in Gujarati.';
    const defaultKeywords = 'GSTV, Gujarat News, Gujarati News, Breaking News, Live TV, India News, Politics, Sports, Business';

    return {
      title: obj.metatitle || defaultTitle,
      description: obj.metadesc || defaultDesc,
      keywords: obj.metakeyword || defaultKeywords,
      icons: {
        icon: '/assets/icons/favicon.ico',
        shortcut: '/assets/icons/favicon.ico',
        apple: '/apple-touch-icon.png',
      },
      openGraph: {
        title: obj.metatitle || defaultTitle,
        description: obj.metadesc || defaultDesc,
        images: [ogImageUrl],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: obj.metatitle || defaultTitle,
        description: obj.metadesc || defaultDesc,
        images: [ogImageUrl],
      },
    };
  } catch {
    const defaultTitle = 'GSTV | Latest Gujarati News — Gujarat, India | Breaking News 24x7';
    const defaultDesc = 'GSTV (Gujarat Samachar TV) delivers 24x7 breaking news, latest updates from Gujarat, India, politics, entertainment, sports, and business in Gujarati.';
    return {
      title: defaultTitle,
      description: defaultDesc,
    };
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        {/* ✅ Preconnect to font origins — zero-cost DNS warmup */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preload" as="image" href="/assets/images/gstv-logo-bg.png" fetchPriority="high" />

        {/* ✅ Font Awesome — kept as blocking link: critical for all icons
             (social share, play buttons, bookmark etc.) */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          crossOrigin="anonymous"
        />

        {/* Select2 CSS */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css"
        />

        {/* City modal CSS */}
        <link rel="stylesheet" href="/assets/css/city-modal.css" />

        {/* Language tag for content identification */}
        <meta httpEquiv="content-language" content="gu-IN" />

        {/* Sitemaps for Search Engines */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="alternate" type="application/xml" href="/sitemap-news-google.xml" title="Google News Sitemap" />
        <link rel="alternate" type="application/xml" href="/sitemap-videos.xml" title="Video Sitemap" />
      </head>
      <body suppressHydrationWarning>
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <GoogleAnalyticsTracker />
        <AuthProvider>
          <BookmarkProvider>
            <SettingsProvider>
              <CategorySettingsProvider>

                <BackToTop />
                <PollLoader />
                <CookieConsentBanner />

                <ConditionalLayout>
                  <LayoutWrapper>
                    <LeftSidebar />
                    <div className="hiddenRightSidebar">
                      <RightSidebar />
                    </div>
                    <main id="main-content">
                      {children}
                    </main>
                  </LayoutWrapper>
                </ConditionalLayout>

                <MobileAppPrompt />
                <CacheManager />

              </CategorySettingsProvider>
            </SettingsProvider>
          </BookmarkProvider>
        </AuthProvider>

        {/* ✅ jQuery — moved from beforeInteractive to afterInteractive
             beforeInteractive blocks ALL rendering until jQuery parses.
             afterInteractive loads after page is interactive — major TBT win. */}
        <Script src="https://code.jquery.com/jquery-3.7.1.min.js" strategy="afterInteractive" />

        {/* Bootstrap JS */}
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" strategy="afterInteractive" />

        {/* Legacy JS */}
        <Script src="/assets/js/api-config.js" strategy="afterInteractive" />
        <Script src="/assets/js/category-modal.js" strategy="afterInteractive" />
        <Script src="/assets/js/city-modal.js" strategy="afterInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.5/jquery.validate.min.js" strategy="afterInteractive" />

        {/* LazySizes */}
        <Script src="/assets/js/lazysizes.min.js" strategy="lazyOnload" />

        {/* ✅ Google Fonts — loaded non-blocking via Script (correct React approach)
             Fonts are cosmetic only; non-critical for LCP/TBT */}
        <Script id="load-google-fonts" strategy="lazyOnload">{`
          (function() {
            var link1 = document.createElement('link');
            link1.rel = 'stylesheet';
            link1.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati&display=swap';
            document.head.appendChild(link1);

            var link2 = document.createElement('link');
            link2.rel = 'stylesheet';
            link2.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
            document.head.appendChild(link2);
          })();
        `}</Script>

        {/* iZooto — lazyOnload */}
        <Script id="izooto-init" strategy="lazyOnload">
          {`window._izq = window._izq || []; window._izq.push(["init"]);`}
        </Script>
        <Script src="https://cdn.izooto.com/scripts/3a920df9584e8422018d0726f191046ee24a934e.js" strategy="lazyOnload" />

        {/* Google Analytics — lazyOnload */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-WNVDG9SXJ0" strategy="lazyOnload"/>

        <Script id="ga4-init" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;

          gtag('js', new Date());

          // ✅ VERY IMPORTANT
          gtag('config', 'G-WNVDG9SXJ0', {
            send_page_view: false
          });
        `}
        </Script>

        {/* Google Publisher Tag — lazyOnload */}
        <Script src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" strategy="lazyOnload" />
       
        {/* GPT SLOT DEFINITIONS — lazyOnload */}
        <Script id="gpt-init" strategy="lazyOnload">
        {`
        window.googletag = window.googletag || { cmd: [] };

        googletag.cmd.push(function () {

          var REFRESH_KEY = 'refresh';
          var REFRESH_VALUE = 'true';
          var SECONDS_TO_WAIT_AFTER_VIEWABILITY = 15;

          var mapping = googletag.sizeMapping()
            .addSize([1024, 0], [[728, 90], [468, 60], [320, 100], [300, 100], [320, 50]])
            .addSize([768, 0], [[728, 90], [728, 250],[468, 60]])
            .addSize([555, 0], [[300, 250], [336, 280], [300, 200], [250, 250]])
            .addSize([320, 0], [[300, 250], [336, 280], [300, 200], [250, 250], [320, 50]])
            .addSize([1, 0], [[300, 250]])
            .build();

          var mapping1 = googletag.sizeMapping()
            .addSize([1024, 0], [[640, 480], [300, 250], [336, 280]])
            .addSize([640, 0], [[640, 480], [300, 250], [336, 280]])
            .addSize([480, 0], [[400, 300], [300, 250], [336, 280]])
            .addSize([1, 1], [[400, 300], [320, 50]])
            .build();

          googletag.defineSlot('/23182996301/gstv/gstvin_footer',
            [[300,100],[320,50],[728,90]],
            'gstvin_footer'
          ).defineSizeMapping(mapping)
          .setTargeting(REFRESH_KEY, REFRESH_VALUE)
          .addService(googletag.pubads());

          googletag.defineSlot('/23182996301/gstv/gstvin_inarticle1',
            [[300,250],[728,90],[400,300],[640,480]],
            'gstvin_inarticle1'
          ).defineSizeMapping(mapping1)
          .setTargeting(REFRESH_KEY, REFRESH_VALUE)
          .addService(googletag.pubads());

          googletag.defineSlot('/23182996301/gstv/gstvin_inarticle2',
            [[300,250],[728,90],[400,300],[640,480]],
            'gstvin_inarticle2'
          ).defineSizeMapping(mapping1)
          .setTargeting(REFRESH_KEY, REFRESH_VALUE)
          .addService(googletag.pubads());

          googletag.defineSlot('/23182996301/gstv/gstvin_sidebar',
            [[300,250],[200,200],[250,250],[336,280]],
            'gstvin_sidebar'
          ).setTargeting(REFRESH_KEY, REFRESH_VALUE)
          .addService(googletag.pubads());

          googletag.defineSlot('/23182996301/gstv/gstvin_top',
            [[300,100],[320,50],[728,90]],
            'gstvin_top'
          ).defineSizeMapping(mapping)
          .setTargeting(REFRESH_KEY, REFRESH_VALUE)
          .addService(googletag.pubads());

          googletag.pubads().addEventListener('impressionViewable', function(event) {
            var slot = event.slot;
            if (slot.getTargeting(REFRESH_KEY).indexOf(REFRESH_VALUE) > -1) {
              setTimeout(function () {
                googletag.pubads().refresh([slot]);
              }, SECONDS_TO_WAIT_AFTER_VIEWABILITY * 1000);
            }
          });

          googletag.pubads().enableSingleRequest();
          googletag.enableServices();
        });
        `}
        </Script>

        {/* AMAZON APS — lazyOnload */}
        <Script id="amazon-aps" strategy="lazyOnload">
        {`
        !function(a9,a,p,s,t,A,g){
        if(a[a9])return;
        function q(c,r){a[a9]._Q.push([c,r])}
        a[a9]={init:function(){q("i",arguments)},fetchBids:function(){q("f",arguments)},setDisplayBids:function(){},_Q:[]};
        A=p.createElement(s);A.async=!0;A.src=t;
        g=p.getElementsByTagName(s)[0];g.parentNode.insertBefore(A,g)
        }("apstag",window,document,"script","//c.amazon-adsystem.com/aax2/apstag.js");

        apstag.init({
          pubID:'d01b77a1-eb2e-40f1-8c68-14ae1eb1dcd9',
          adServer:'googletag',
          bidTimeout:2000
        });

        apstag.fetchBids({
          slots:[
            {slotID:'gstvin_footer',slotName:'/23182996301/gstv/gstvin_footer',sizes:[[300,100],[320,50],[728,90]]},
            {slotID:'gstvin_inarticle1',slotName:'/23182996301/gstv/gstvin_inarticle1',sizes:[[300,250],[728,90],[400,300],[640,480]]},
            {slotID:'gstvin_inarticle2',slotName:'/23182996301/gstv/gstvin_inarticle2',sizes:[[300,250],[728,90],[400,300],[640,480]]},
            {slotID:'gstvin_sidebar',slotName:'/23182996301/gstv/gstvin_sidebar',sizes:[[300,250],[200,200],[250,250],[336,280]]},
            {slotID:'gstvin_top',slotName:'/23182996301/gstv/gstvin_top',sizes:[[300,100],[320,50],[728,90]]}
          ]
        },function(){
          googletag.cmd.push(function(){
            apstag.setDisplayBids();
            googletag.pubads().refresh();
          });
        });
        `}
        </Script>

        {/* Digiad Prebid — lazyOnload */}
        <Script id="digiad-prebid" strategy="lazyOnload">
          {`
            (function() {
                var o = 'script',
                    s = top.document,
                    a = s.createElement(o),
                    m = s.getElementsByTagName(o)[0],
                    d = new Date(),
                    timestamp = "" + d.getDate() + d.getMonth() + d.getHours();
                a.async = 1;
                a.src = "https://ads.digiadglobal.com/prebid_config_1815123388.min.js?t=" + timestamp;
                m.parentNode.insertBefore(a, m);
            })();
          `}
        </Script>

        {/* Inline CSS (unchanged) */}
        <style>{`
          .back-to-top{position:fixed;bottom:60px;right:22px;width:45px;height:45px;background:#8B0000;color:#fff;border-radius:50%;display:none;align-items:center;justify-content:center;z-index:999999}
          .hiddenRightSidebar{display:block}
          .back-to-top.show {display: flex;}
          @media(max-width:768px){
          .hiddenRightSidebar{display:none!important}
          .back-to-top {bottom:72px;}
          }
        `}</style>
      </body>
    </html>
  );
}

