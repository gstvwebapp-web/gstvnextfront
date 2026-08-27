"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "@/styles/profile.css";
import "@/styles/styles.css";
import "@/styles/styles_new.css";
import {
  fetchMagazinesBySlug,
  MagazineItem,
  getMagazineImageUrl,
  formatDateToDDMMYYYY,
  getCurrentDateDDMMYYYY,
} from "@/services/magazineApi";
import ProFooter from "@/components/ProFooter";
import MagazineLogoStrip from "@/components/MagazineLogoStrip";
import EpaperCalendar from "@/components/EpaperCalendar";
import Link from "next/link";

const MagazineListBySlugPage: React.FC = () => {
  const params = useParams();
  const slug = (params?.slug as string) || "";

  const [items, setItems] = useState<MagazineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDateDDMMYYYY());
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [perPage] = useState(8);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isLoadingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    document.body.setAttribute("data-page", "magazine");
    return () => {
      document.body.removeAttribute("data-page");
    };
  }, []);

  useEffect(() => {
    // When slug changes, reset and load first page
    setItems([]);
    setCurrentPage(1);
    setHasMorePages(true);
    loadMagazines(1, true);
  }, [slug]);

  const loadMagazines = async (page: number = 1, reset: boolean = false) => {
    if (!slug) return;
    if (isLoadingRef.current && !reset) return;

    try {
      isLoadingRef.current = true;
      if (reset) setLoading(true); else setLoadingMore(true);
      setError(null);

      const response = await fetchMagazinesBySlug(slug, page, perPage);
      const list = response.magazinecity?.Magazine ?? [];

      if (list.length > 0) {
        if (reset) setItems(list); else setItems((prev) => [...prev, ...list]);

        if (response.pagination) {
          setTotalItems(response.pagination.total);
          setCurrentPage(response.pagination.current_page);
          const hasMore = response.pagination.current_page < response.pagination.last_page;
          setHasMorePages(hasMore);
        } else {
          // Infer hasMore by batch size
          const inferredHasMore = list.length >= perPage;
          setHasMorePages(inferredHasMore);
        }
      } else {
        if (reset) setItems([]);
        setHasMorePages(false);
      }
    } catch (err) {
      console.error("Error loading magazines by slug:", err);
      setError("મેગેઝિન લોડ કરવામાં તકલીફ આવી. ફરી પ્રયાસ કરો.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  };
  const handleDateChange = (date: string) => {
  console.log("Date changed to:", date);

  const today = getCurrentDateDDMMYYYY();

  if (date !== today) {
    // Redirect to magazine/{slug}/{date}
    router.push(`/magazine/${slug}/${date}`);
  } else {
    // Stay on the same slug and reload today’s data
    setSelectedDate(date);
    setCurrentPage(1);
    setHasMorePages(true);
    loadMagazines(1, true);
  }
};
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMorePages && !loading) {
      const next = currentPage + 1;
      loadMagazines(next, false);
    }
  }, [loadingMore, hasMorePages, loading, currentPage]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loadingMore && hasMorePages && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loadMore, loadingMore, hasMorePages, loading]);

  const renderCard = (mag: MagazineItem) => {
    const img = getMagazineImageUrl(mag);
    const displayDate = formatDateToDDMMYYYY(mag.newspaperdate);
    const detailUrl = `/magazine/${slug}/${displayDate}`;

    return (
      <div key={mag.id} className="epapperBox">
        <div className="imageBox">
          <Link href={detailUrl}>
            <img
              src={img}
              alt={`${mag.title || mag.etitle} - ${displayDate}`}
              className="imgEpapper"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/default-magazine.png";
              }}
            />
          </Link>
        </div>
        <div className="dateShareFlex">
          <div className="date">{displayDate}</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>મેગેઝિન લોડ કરી રહ્યા છીએ...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid epaper-page-container" data-page="magazine">
      <div className="epaperTopFixed">
        <div className="filterTAbEpaper">
          <Link className="tab-link" href="/epaper">ન્યૂઝ પેપર</Link>
          <Link className="tab-link active-link" href="/magazine">મેગેઝિન</Link>
        </div>
        {/* <div style={{ padding: "10px 15px", fontWeight: 600 }}>
          {slug.charAt(0).toUpperCase() + slug.slice(1)}
        </div> */}
        <EpaperCalendar
          currentDate={selectedDate}
          onDateChange={handleDateChange}
        />
      </div>

      <div className="epapperPage">
        <MagazineLogoStrip currentSlug={slug} />
        <div id="magazinedata" className="active">
          {error ? (
            <div className="error-message">
              <p>{error}</p>
              <button onClick={() => loadMagazines(1, true)} className="retry-button">Retry</button>
            </div>
          ) : (
            <div className="epapperFlex">
              {items.length > 0 ? (
                items.map((m) => renderCard(m))
              ) : (
                <div className="no-data">
                  <p>કોઈ મેગેઝિન મળ્યાં નથી.</p>
                </div>
              )}
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          {!loading && !error && items.length > 0 && (hasMorePages || loadingMore) && (
            <div
              ref={loadMoreRef}
              className="load-more-trigger"
              style={{ height: "80px", display: "flex", alignItems: "center", justifyContent: "center", marginTop: "30px", marginBottom: "30px", padding: "20px" }}
            >
              {loadingMore ? (
                <div className="loading-more" style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "10px" }}>
                  <div className="loading-spinner" style={{ width: "40px", height: "40px" }}></div>
                  <span style={{ fontSize: "16px", color: "#666", fontFamily: "Noto Sans Gujarati, sans-serif" }}>
                    વધુ લોડ કરી રહ્યા છીએ...
                  </span>
                </div>
              ) : (
                <div style={{ height: "1px", width: "100%" }}>
                  {/* Invisible trigger */}
                </div>
              )}
            </div>
          )}

          {/* End of content indicator */}
          {!loading && !error && items.length > 0 && !hasMorePages && (
            <div style={{ textAlign: "center", padding: "20px", color: "#666", fontSize: "14px", fontFamily: "Noto Sans Gujarati, sans-serif" }}>
              બધાં મેગેઝિન લોડ થઈ ગયા છે
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default function MagazineBySlugPage() {
  return <MagazineListBySlugPage />;
}

