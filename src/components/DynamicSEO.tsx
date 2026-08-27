'use client';

import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';

interface DynamicSEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

export default function DynamicSEO({ title, description, keywords }: DynamicSEOProps) {
  const { settings, loading, error } = useSettings();

  useEffect(() => {
    if (!loading && settings) {
      // Update document title
      const pageTitle = title || settings.metatitle || 'GSTV';
      document.title = pageTitle;

      // Update meta description
      const metaDescription = description || settings.metadesc || '';
      let descriptionMeta = document.querySelector('meta[name="description"]');
      if (!descriptionMeta) {
        descriptionMeta = document.createElement('meta');
        descriptionMeta.setAttribute('name', 'description');
        document.head.appendChild(descriptionMeta);
      }
      descriptionMeta.setAttribute('content', metaDescription);

      // Update meta keywords
      const metaKeywords = keywords || settings.metakeyword || '';
      let keywordsMeta = document.querySelector('meta[name="keywords"]');
      if (!keywordsMeta) {
        keywordsMeta = document.createElement('meta');
        keywordsMeta.setAttribute('name', 'keywords');
        document.head.appendChild(keywordsMeta);
      }
      keywordsMeta.setAttribute('content', metaKeywords);

      // Update Open Graph meta tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', pageTitle);
      } else {
        const newOgTitle = document.createElement('meta');
        newOgTitle.setAttribute('property', 'og:title');
        newOgTitle.setAttribute('content', pageTitle);
        document.head.appendChild(newOgTitle);
      }

      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', metaDescription);
      } else {
        const newOgDescription = document.createElement('meta');
        newOgDescription.setAttribute('property', 'og:description');
        newOgDescription.setAttribute('content', metaDescription);
        document.head.appendChild(newOgDescription);
      }

      // Update Twitter Card meta tags
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute('content', pageTitle);
      } else {
        const newTwitterTitle = document.createElement('meta');
        newTwitterTitle.setAttribute('name', 'twitter:title');
        newTwitterTitle.setAttribute('content', pageTitle);
        document.head.appendChild(newTwitterTitle);
      }

      const twitterDescription = document.querySelector('meta[name="twitter:description"]');
      if (twitterDescription) {
        twitterDescription.setAttribute('content', metaDescription);
      } else {
        const newTwitterDescription = document.createElement('meta');
        newTwitterDescription.setAttribute('name', 'twitter:description');
        newTwitterDescription.setAttribute('content', metaDescription);
        document.head.appendChild(newTwitterDescription);
      }
    }
  }, [settings, loading, title, description, keywords]);

  // This component doesn&apos;t render anything visible
  return null;
}
