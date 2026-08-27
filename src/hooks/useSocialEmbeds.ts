'use client';
import { useEffect } from 'react';

/**
 * Auto-initializes embeds for Twitter, Instagram, Facebook, YouTube, Reddit.
 * Call this hook once in your page/component to activate embed rendering.
 */
export function useSocialEmbeds(dependencies: any[] = []) {
  useEffect(() => {
    // ---- Twitter ----
    if (typeof window !== 'undefined') {
      if ((window as any)?.twttr?.widgets) {
        (window as any).twttr.widgets.load();
      } else {
        const twitterScript = document.querySelector('script[src="https://platform.twitter.com/widgets.js"]');
        if (!twitterScript) {
          const script = document.createElement('script');
          script.src = 'https://platform.twitter.com/widgets.js';
          script.async = true;
          document.body.appendChild(script);
        }
      }
    }

    // ---- Instagram ----
    if (typeof window !== 'undefined' && (window as any).instgrm?.Embeds) {
      (window as any).instgrm.Embeds.process();
    } else if (typeof window !== 'undefined') {
      const existing = document.querySelector('script[src="//www.instagram.com/embed.js"]');
      if (!existing) {
        const script = document.createElement('script');
        script.src = '//www.instagram.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }

    // ---- Facebook ----
    if (typeof window !== 'undefined' && (window as any).FB?.XFBML) {
      (window as any).FB.XFBML.parse();
    } else if (typeof window !== 'undefined') {
      const existing = document.querySelector('script[src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v17.0"]');
      if (!existing) {
        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v17.0';
        script.async = true;
        document.body.appendChild(script);
      }
    }

    // ---- Reddit ----
    if (typeof window !== 'undefined') {
      const redditScript = document.querySelector('script[src="https://embed.redditmedia.com/widgets/platform.js"]');
      if (!redditScript) {
        const script = document.createElement('script');
        script.src = 'https://embed.redditmedia.com/widgets/platform.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }

    // ---- YouTube / PDF ----
    // YouTube iframes and PDF embeds auto-render, no SDK needed.
  }, dependencies);
}
