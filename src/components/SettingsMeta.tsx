"use client";

import Head from "next/head";
import { useSettings } from "@/hooks/useSettings";

export default function SettingsMeta() {
  const { settings } = useSettings();

  const title = settings?.metatitle || "GSTV Gujarati News";
  const description = settings?.metadesc || "GSTV Gujarati News";
  const keywords = settings?.metakeyword || "GSTV, Gujarat, News, Samachar, TV, Gujarati News";

  // Keep a conservative default image to avoid broken OG previews
  const ogImage = "/assets/images/gstv-logo-bg.png";

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="GSTV" />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Head>
  );
}

