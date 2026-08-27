"use client";

import { useEffect } from "react";
import Link from "next/link";

/* INTERFACES */
interface RelatedNewsItem {
  id: number;
  title?: string;
  slug?: string;
  category_slugs?: string;
  featureImage?: string;
  videoURL?: string;
}

interface RelatedNewsProps {
  items: RelatedNewsItem[];
}

export default function RelatedNews({ items = [] }: RelatedNewsProps) {
  /* IMAGE PROCESSING */
  const processImage = (news: RelatedNewsItem) => {
    if (news.featureImage && news.featureImage !== "") {
      const ext = news.featureImage.split(".").pop()?.toLowerCase() || "";
      return news.featureImage.replace(`.${ext}`, `_small.${ext}`);
    }

    if (news.videoURL) {
      const ext = news.videoURL.split(".").pop()?.toLowerCase() || "";
      return news.videoURL.replace(`.${ext}`, `_video.webp`);
    }

    return "/assets/images/gstv-logo-bg.png";
  };

  /* DRAG SCROLL */
  useEffect(() => {
    const boxes = document.querySelectorAll(
      ".related-news-scroll"
    ) as NodeListOf<HTMLElement>;

    const listeners: Array<() => void> = [];

    boxes.forEach((scrollBox) => {
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;

      const mouseDown = (e: MouseEvent) => {
        isDown = true;
        scrollBox.classList.add("grabbing");
        startX = e.pageX - scrollBox.getBoundingClientRect().left;
        scrollLeft = scrollBox.scrollLeft;
      };

      const mouseLeave = () => {
        isDown = false;
        scrollBox.classList.remove("grabbing");
      };

      const mouseUp = () => {
        isDown = false;
        scrollBox.classList.remove("grabbing");
      };

      const mouseMove = (e: MouseEvent) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scrollBox.getBoundingClientRect().left;
        scrollBox.scrollLeft = scrollLeft - (x - startX) * 1.2;
      };

      scrollBox.addEventListener("mousedown", mouseDown);
      scrollBox.addEventListener("mouseleave", mouseLeave);
      scrollBox.addEventListener("mouseup", mouseUp);
      scrollBox.addEventListener("mousemove", mouseMove);

      listeners.push(() => {
        scrollBox.removeEventListener("mousedown", mouseDown);
        scrollBox.removeEventListener("mouseleave", mouseLeave);
        scrollBox.removeEventListener("mouseup", mouseUp);
        scrollBox.removeEventListener("mousemove", mouseMove);
      });
    });

    return () => {
      listeners.forEach((cleanup) => cleanup());
    };
  }, []);

  /* MOVE THIS CHECK AFTER HOOK */
  if (!items || items.length === 0) return null;

  /* JSX */
  return (
    <div className="blogs-main-section relatedNewsBox">
      <div className="blogs-head-bar first">
        <span className="blog-category">રિલેટેડ ન્યૂઝ</span>
      </div>

      <div className="related-news-wrapper">
        <div className="related-news-scroll">
          {items.map((news) => {
            const newFeatureImage = processImage(news);

            return (
              <div className="news-card" key={news.id}>
                <div className="blog-read-content related-blog">
                  <Link
                    href={`/news/${news.category_slugs}/${news.slug}`}
                    className="flexAlink"
                  >
                    <h4 className="related-blog-title">{news.title}</h4>

                    <div className="hover-image">
                      <div className="lazyload-wrapper">
                        <img
                          src="/assets/images/gstv-logo-bg.png"
                          data-srcset={`${newFeatureImage} 480w, ${newFeatureImage} 800w`}
                          data-sizes="auto"
                          className="lazyload gridimg custom-image"
                          alt={news.title || ""}
                        />
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .related-news-wrapper {
          overflow: hidden;
          position: relative;
        }

        .related-news-scroll {
          display: flex;
          overflow-x: auto;
          gap: 20px;
          padding: 20px;
          scroll-behavior: smooth;
          cursor: grab;
        }

        .related-news-scroll.grabbing {
          cursor: grabbing;
        }

        .related-news-scroll::-webkit-scrollbar {
          display: none;
        }

        .news-card {
          flex: 0 0 auto;
          width: 280px;
          border: 1px solid var(--primary-color);
          border-radius: 5px;
          background: var(--white-color);
          height: 220px;
        }

        .related-blog-title {
          font-size: 16px;
          text-align: center;
          padding: 10px;
          height: 65px;
          overflow: hidden;
          color: var(--primary-color);
          line-height: 28px;
        }
          .related-blog {
            display: contents;
            padding: 0px !important;
        }

        @media (max-width: 767px) {
          .news-card {
            width: 150px;
            height: 150px;
          }
          .related-blog-title {
            font-size: 13px;
            height: 55px;
          }
        }
      `}</style>
    </div>
  );
}
