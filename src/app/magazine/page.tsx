"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import "@/styles/profile.css";
import "@/styles/styles.css";
import "@/styles/styles_new.css";
import {
  fetchMagazines,
  MagazineResponse,
  MagazineItem,
  getMagazineImageUrl,
  formatDateToDDMMYYYY,
  getCurrentDateDDMMYYYY,
} from "@/services/magazineApi";
import ProFooter from "@/components/ProFooter";
import MagazineLogoStrip from "@/components/MagazineLogoStrip";
import EpaperCalendar from "@/components/EpaperCalendar";
import Link from "next/link";

const MagazinePageContent: React.FC = () => {
  const [magazines, setMagazines] = useState<MagazineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDateDDMMYYYY());
  const [sharePopupId, setSharePopupId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(8);

  const router = useRouter();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    setCurrentPage(1);
    setMagazines([]);
    setHasMorePages(true);
    loadMagazines(selectedDate, 1, true);
  }, []);

  /* ---------------- BODY ATTR ---------------- */
  useEffect(() => {
    document.body.setAttribute("data-page", "magazine");
    return () => {
      document.body.removeAttribute("data-page");
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  /* ---------------- FETCH ---------------- */
  const loadMagazines = async (date?: string, page = 1, reset = false) => {
    if (isLoadingRef.current && !reset) return;

    try {
      isLoadingRef.current = true;
      reset ? setLoading(true) : setLoadingMore(true);
      setError(null);

      const response: MagazineResponse = await fetchMagazines(page, perPage);

      if (response.magazinecity?.Magazine) {
        const items = response.magazinecity.Magazine;

        setMagazines((prev) => (reset ? items : [...prev, ...items]));

        if (response.pagination) {
          setTotalItems(response.pagination.total);
          setCurrentPage(response.pagination.current_page);
          setHasMorePages(
            response.pagination.current_page < response.pagination.last_page
          );
        } else {
          setHasMorePages(items.length >= perPage);
        }
      } else {
        if (reset) setMagazines([]);
        setHasMorePages(false);
      }
    } catch (err) {
      console.error("[Magazine] Error loading:", err);
      setError("મેગેઝિન લોડ કરવામાં તકલીફ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  };

  /* ---------------- INFINITE SCROLL ---------------- */
  const loadMoreMagazines = useCallback(() => {
    if (!loadingMore && hasMorePages && selectedDate === getCurrentDateDDMMYYYY() && !loading) {
      loadMagazines(selectedDate, currentPage + 1, false);
    }
  }, [loadingMore, hasMorePages, currentPage, selectedDate, loading]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMoreMagazines();
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);

    return () => observerRef.current?.disconnect();
  }, [loadMoreMagazines]);

  /* ---------------- SHARE ---------------- */
  const getShareUrl = (mag: MagazineItem) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/magazine/${mag.ecatslug}/${formatDateToDDMMYYYY(
      mag.newspaperdate
    )}`;
  };

  const shareMagazine = async (mag: MagazineItem) => {
    const title = mag.title || mag.etitle || "Magazine";
    const url = getShareUrl(mag);

    if (navigator.share) {
      try {
        await navigator.share({ title, text: title, url });
      } catch (e) {
        console.error("Share failed", e);
      }
    } else {
      setSharePopupId((prev) => (prev === mag.id ? null : mag.id));
    }
  };

  const copyLink = async (url: string) => {
    await navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
    setSharePopupId(null);
  };

  /* ---------------- DATE FORMAT ---------------- */
  const formatDisplayDate = (dateString: string) =>
    new Date(dateString)
      .toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

  const formatDisplayDateUrl = (dateString: string) =>
    formatDisplayDate(dateString).replace(/\//g, "-");

  /* ---------------- LOADER ---------------- */
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>મેગેઝિન લોડ કરી રહ્યા છીએ...</p>
      </div>
    );
  }

  /* ---------------- RENDER ---------------- */
  return (
    <div className="container-fluid epaper-page-container" data-page="magazine">
      <div className="epaperTopFixed">
        <div className="filterTAbEpaper">
          <Link className="tab-link" href="/epaper">ન્યૂઝ પેપર</Link>
          <Link className="tab-link active-link" href="/magazine">મેગેઝિન</Link>
          {/* <Link className="tab-link" href="/buddhiprakash">બુદ્ધિપ્રકાશ</Link> */}
        </div>
      </div>

      <div className="epapperPage">
        <MagazineLogoStrip />

        <div className="epapperFlex">
          {magazines.map((mag) => {
            const shareUrl = getShareUrl(mag);

            return (
              <div key={mag.id} className="epapperBox">
                <div className="imageBox">
                  <Link href={`/magazine/${mag.ecatslug}/${formatDisplayDateUrl(mag.newspaperdate)}`}>
                    <img
                      src={getMagazineImageUrl(mag)}
                      alt={mag.title || mag.etitle || "Magazine"}
                      className="imgEpapper"
                      loading="lazy"
                      onError={(e) =>
                        ((e.target as HTMLImageElement).src =
                          "/images/default-magazine.png")
                      }
                    />
                  </Link>
                </div>

                <div className="dateShareFlex">
                  <div className="date">{formatDisplayDate(mag.newspaperdate)}</div>

                  <div className={`shareIcon sharemag${mag.id}`} onClick={() => shareMagazine(mag)}>
                    <i className="fa-solid fa-share-nodes"></i>
                  </div>

                  {sharePopupId === mag.id && (
                    <div className={`sharenews${mag.id} sharenewscls`}>
                      <Link href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" className="facebook">
                        <i className="fab fa-facebook"></i><span>Facebook</span>
                      </Link>

                      <Link href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" className="twitter">
                        <i className="fab fa-twitter"></i><span>Twitter</span>
                      </Link>

                      <Link href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`} target="_blank" className="whatsApp">
                        <i className="fab fa-whatsapp"></i><span>WhatsApp</span>
                      </Link>

                      <button onClick={() => copyLink(shareUrl)} className="copyLink">
                        <i className="fa fa-link"></i><span>Copy Link</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div ref={loadMoreRef} style={{ height: "80px" }} />
      </div>
    </div>
  );
};

export default function MagazinePage() {
  return <MagazinePageContent />;
}
