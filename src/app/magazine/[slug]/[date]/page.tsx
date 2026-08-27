import { Metadata } from "next";
import { fetchMagazineDetail } from "@/services/magazineApi";
import MagazineClient from "./MagazineClient";

type Props = {
  params: {
    slug: string;
    date: string;
  };
};

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.gstv.in";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetchMagazineDetail(params.slug, params.date);
    const magazine = res?.magazine;

    if (!magazine) {
      return {
        title: "Magazine | GSTV",
        description: "Read GSTV Magazine",
      };
    }

     let thumbnail =
      magazine.thumbnail && magazine.thumbnail !== ""
        ? magazine.thumbnail
        : "/assets/images/logo.png";

    // convert relative → absolute
    if (!thumbnail.startsWith("http")) {
      thumbnail = `${BASE_URL}${thumbnail}`;
    }
    const title = `${magazine.etitle || magazine.title} | GSTV`;
    const description = `Read GSTV Magazine - ${magazine.etitle || magazine.title}`;

     return {
      title,
      description,

      openGraph: {
        title,
        description,
        url: `${BASE_URL}/magazine/${params.slug}/${params.date}`,
        type: "article",
        images: [
          {
            url: thumbnail,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [thumbnail],
      },
    };
  } catch {
    return { title: "Magazine | GSTV" };
  }
}

export default function Page() {
  return <MagazineClient />;
}
