import React from "react";
import CampusCornerClient from "./CampusCornerClient";

// ----------------------------
// ✅ WORKING NEXT.JS METADATA
// ----------------------------
export const metadata = {
  title: "Campus Corner – Student Activities, School Events & Campus News",
  description:
    "Latest student stories, school activities, campus events uploaded by students across Gujarat.",
  keywords:
    "campus corner, school news, student journalism, Gujarat schools, campus events",
  alternates: {
    canonical: "https://www.gstv.in/campuscorner",
  },
  openGraph: {
    title: "Campus Corner – School News & Student Stories",
    description:
      "Explore the latest uploads from students — campus activities, school events, competitions and more.",
    url: "https://www.gstv.in/campuscorner",
    siteName: "GSTV",
    images: [
      {
        url: "/assets/images/gstv-logo-bg.png",
        width: 1200,
        height: 630,
        alt: "GSTV – Campus Corner",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Corner – School News & Student Stories",
    description:
      "Explore the latest uploads from students — campus activities, school events, competitions and more.",
    images: ["/assets/images/gstv-logo-bg.png"],
  },
};

// ----------------------------
// PAGE — SERVER COMPONENT
// ----------------------------
export default function Page() {
  return <CampusCornerClient />;
}
