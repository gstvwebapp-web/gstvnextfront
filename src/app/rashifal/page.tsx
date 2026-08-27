import RashifalPage from "./RashifalClient";

export const metadata = {
  title: "12 Zodiac Signs (Rashi) - Traits, Horoscope & Astrology Info | GSTV News",
  description:
    "તમારા દૈનિક રાશિફળ, ભાગ્ય, પ્રેમ, નોખી, આરોગ્ય અને જીવન વિશે વાંચો. આજે તમારી રાશિ માટે શું લખ્યું છે તે જાણો.",
  keywords: [
    "રાશિફળ",
    "daily rashifal",
    "today rashifal",
    "gujarati rashifal",
    "rashifal in gujarati",
    "zodiac prediction"
  ],
  openGraph: {
    title: "12 Zodiac Signs (Rashi) - Traits, Horoscope & Astrology Info | GSTV News",
    description:
      "તમારા દૈનિક રાશિફળ, ભાગ્ય, પ્રેમ, નોખી, આરોગ્ય અને જીવન વિશે વાંચો.",
    url: "https://www.gstv.in/rashifal",
    siteName: "GSTV",
    type: "website",
    images: [
      {
        url: "https://www.gstv.in/public/assets/images/gstv-logo.png",
        width: 1200,
        height: 630,
        alt: "રાશિફળ - Daily Rashifal"
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "12 Zodiac Signs (Rashi) - Traits, Horoscope & Astrology Info | GSTV News",
    description:
      "તમારા દૈનિક રાશિફળ, ભાગ્ય, પ્રેમ, નોખી, આરોગ્ય અને જીવન વિશે વાંચો.",
    images: ["https://www.gstv.in/public/assets/images/gstv-logo.png"],
  },
  alternates: {
    canonical: "https://www.gstv.in/rashifal",
  },
};

export default function Page() {
  return <RashifalPage />;
}
