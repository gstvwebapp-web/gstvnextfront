import { Metadata } from "next";
import { fetchEpaperDetail } from "@/services/epaperApi";
import EpaperClient from "./EpaperClient";

type Props = {
  params: {
    city: string;
    date: string;
  };
};

/* ---------------- Base URL ---------------- */
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.gstv.in";

/* ---------------- Dynamic Metadata ---------------- */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const epaper = await fetchEpaperDetail(params.city, params.date);

    if (!epaper) {
      return {
        title: "Epaper | GSTV",
        description: "Read the latest epaper editions from GSTV News",
      };
    }

    /* ---------- Thumbnail Fix ---------- */
    let thumbnailimg =
  epaper.thumbnail && epaper.thumbnail !== ""
    ? epaper.thumbnail
    : "/assets/images/logo.png";

    // Convert relative → absolute URL
    if (!thumbnailimg.startsWith("http")) {
      thumbnailimg = `${BASE_URL}${thumbnailimg}`;
    }

    return {
      title: `${epaper.etitle} | GSTV`,
      description: `Read GSTV epaper for ${epaper.etitle}`,

      openGraph: {
        title: `${epaper.etitle} | GSTV`,
        description: `Read GSTV epaper for ${epaper.etitle}`,
        type: "article",
        images: [
          {
            url: thumbnailimg,
            width: 1200,
            height: 630,
            alt: epaper.etitle,
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title: `${epaper.etitle} | GSTV`,
        description: `Read GSTV epaper for ${epaper.etitle}`,
        images: [thumbnailimg],
      },
    };

  } catch (error) {
    return {
      title: "Epaper | GSTV",
    };
  }
}

/* ---------------- Page ---------------- */
export default function Page() {
  return <EpaperClient />;
}
