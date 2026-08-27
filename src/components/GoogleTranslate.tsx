"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export default function GoogleTranslate() {

  useEffect(() => {

    if (typeof window === "undefined") return;

    // Prevent script loading twice
    if (document.getElementById("google_translate_script")) return;

    window.googleTranslateElementInit = () => {

      // Prevent widget rendering twice
      const el = document.getElementById("google_translate_element");
      if (!el || el.childElementCount > 0) return;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "gu",
          includedLanguages: "gu,en,hi",
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
        },
        "google_translate_element"
      );
    };

    const script = document.createElement("script");
    script.id = "google_translate_script";
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;

    document.body.appendChild(script);

  }, []);

  return <div id="google_translate_element"></div>;
}