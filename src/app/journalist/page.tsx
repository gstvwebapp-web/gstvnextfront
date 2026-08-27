import React from "react";
import JournalistClient from "./JournalistClient";

// ---------------------------------------------------------
// ✅ SEO Metadata (Server Component)
// ---------------------------------------------------------
export const metadata = {
  title: "GSTV Journalist – Latest Local News Submitted by Citizens",
  description:
    "Real stories submitted by citizen journalists across Gujarat. Upload your news and share what’s happening in your area.",
  keywords:
    "gstv journalist, citizen journalism, gujarat local news, upload news, journalist portal",
  alternates: {
    canonical: "https://www.gstv.in/journalist",
  },
  openGraph: {
    title: "GSTV Journalist – Citizen Submitted News",
    description:
      "Explore latest reports shared by local citizen journalists from across Gujarat.",
    url: "https://www.gstv.in/journalist",
    siteName: "GSTV",
    images: [
      {
        url: "/assets/images/gstvjournalist.png",
        width: 1200,
        height: 630,
        alt: "GSTV Journalist",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GSTV Journalist – Citizen Submitted News",
    description:
      "Explore latest reports shared by local citizen journalists from across Gujarat.",
    images: ["/assets/images/gstvjournalist.png"],
  },
};

// ---------------------------------------------------------
// PAGE (Server Component) → Loads Client Component
// ---------------------------------------------------------
export default function JournalistPage() {
  return <JournalistClient />;
}
