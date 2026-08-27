import { API_ENDPOINTS } from "@/constants/api";
import RashiDetailPage from "./RashiDetailPage";

export const dynamic = "force-dynamic"; // Ensure fresh data each request

async function getRashiSEO(id: string, period: string) {
  try {
    const res = await fetch(API_ENDPOINTS.RASHIFAL_DATA, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rashi_id: id, period }),
        cache: "no-store",
      }
    );

    const data = await res.json();
    return data?.rashifaldata || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: any) {
  const { id, period } = params;

  const rashi = await getRashiSEO(id, period);
  const title = rashi
    ? `${rashi.engtitle} Horoscope: Traits, Predictions & Astrology - GSTV News`
    : "Rashifal Horoscope - GSTV News";

  const description = rashi
    ? `Discover the personality, strengths, weaknesses, and daily horoscope of ${rashi.engtitle}. Get detailed astrology insights and predictions on GSTV News.`
    : "Daily Rashifal predictions, traits & astrology insights.";

  const keywords = rashi
    ? `${rashi.engtitle}, ${rashi.title}, ${rashi.engtitle} horoscope, rashifal`
    : "Rashifal, daily horoscope, Gujarati rashifal";

  const image = rashi?.rashiicon || "/images/default-icon.png";

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: [image],
      url: `https://www.gstv.in/rashifal/rashi/${id}/${period}`,
      siteName: "GSTV",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: `https://www.gstv.in/rashifal/rashi/${id}/${period}`,
    },
  };
}

export default function Page() {
  return <RashiDetailPage />;
}
