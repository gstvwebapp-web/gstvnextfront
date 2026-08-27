'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProFooter from '@/components/ProFooter';
import { API_ENDPOINTS } from '@/constants/api';
import Link from 'next/link';

interface BookmarkItem {
  news_id: number;
  bookmark_type: string;
  created_at: string | null;
  newsTitle: string;
  newsSlug: string;
  description: string;
  featureImage: string;
  videoURL: string | null;
  catTitle: string;
  catSlug: string;
  catID: string;
  imageURL: string;
}

interface BookmarkResponse {
  bookmarklist: BookmarkItem[];
}

// ------------------------------------------------------
// SAFE USER SESSION PARSER (prevents redirect to HOME)
// ------------------------------------------------------
const getUserId = () => {
  const raw = localStorage.getItem("userSession");
  if (!raw) return null;

  try {
    const s = JSON.parse(raw);

    return (
      s?.userData?.user_id ||
      s?.userData?.id ||
      s?.user_id ||
      s?.id ||
      null
    );
  } catch (e) {
    console.error("❌ Invalid session JSON", e);
    return null;
  }
};

export default function BookmarkListPage() {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [flashMessage, setFlashMessage] = useState('');
  const [flashType, setFlashType] = useState<'success' | 'error'>('success');

  // ------------------------------------------------------
  // LOGIN CHECK (crash-proof)
  // ------------------------------------------------------
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isLoggedIn !== 'true') {
      router.push('/login');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      router.push('/login');
      return;
    }

    fetchBookmarks(userId, 1);
  }, [router]);

  // ------------------------------------------------------
  // FETCH BOOKMARK API
  // ------------------------------------------------------
  const fetchBookmarks = async (userId: string, pageNumber: number) => {
    try {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await fetch(API_ENDPOINTS.BOOKMARKWITHPAGINATION, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': 'GSTV-NextJS-App/1.0'
        },
        body: new URLSearchParams({
          user_id: userId.toString(),
          pageNumber: pageNumber.toString()
        })
      });

      const data: BookmarkResponse = await response.json();
      console.log("Bookmark API Response:", data);

      if (response.ok && data.bookmarklist) {
        if (pageNumber === 1) {
          setBookmarks(data.bookmarklist);
        } else {
          setBookmarks((prev) => [...prev, ...data.bookmarklist]);
        }

        const ITEMS_PER_PAGE = 10;
        setHasMorePages(data.bookmarklist.length === ITEMS_PER_PAGE);
        setCurrentPage(pageNumber);
      } else {
        setError('Failed to fetch bookmarks');
      }
    } catch (error) {
      console.error(error);
      setError('Failed to fetch bookmarks');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // ------------------------------------------------------
  // LOAD MORE USING SAFE USER ID
  // ------------------------------------------------------
  const loadMoreBookmarks = () => {
    if (!loadingMore && hasMorePages) {
      const userId = getUserId();
      if (!userId) return;

      fetchBookmarks(userId, currentPage + 1);
    }
  };

  // SCROLL EVENT
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        loadMoreBookmarks();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMorePages, currentPage]);

  // ------------------------------------------------------
  // REMOVE BOOKMARK
  // ------------------------------------------------------
  const removeBookmark = async (bookmarkId: number) => {
  const userId = getUserId();
  if (!userId) return;

  try {
    // STEP 1: CALL YOUR handleBookmark() TO UPDATE LOCALSTORAGE + ICON SYNC
    const { handleBookmark } = await import('@/utils/commonUtils');

    // This removes bookmark from API + localStorage
    await handleBookmark({
      id: bookmarkId,
      type: "news",
      user_id: userId
    } as any);

    // STEP 2: UPDATE BOOKMARK LIST PAGE UI
    setBookmarks((prev) => prev.filter((b) => b.news_id !== bookmarkId));

    // STEP 3 (IMPORTANT): FIRE STORAGE EVENT → UPDATE GridComponents ICON
    window.dispatchEvent(new Event("storage"));

    // STEP 4: Show message
    setFlashMessage('Bookmark removed successfully!');
    setFlashType('success');
    setTimeout(() => setFlashMessage(''), 4000);

  } catch (error) {
    console.error("❌ Remove bookmark error:", error);
    setFlashMessage('Failed to remove bookmark');
    setFlashType('error');
    setTimeout(() => setFlashMessage(''), 4000);
  }
};


  // ------------------------------------------------------
  // LOADING UI
  // ------------------------------------------------------
  if (loading) {
    return (
      <div className="bookmark_list">
        <h3>બુકમાર્ક લિસ્ટ</h3>
        <div className="text-center">લોડ થઈ રહ્યું છે...</div>
      </div>
    );
  }

  // ------------------------------------------------------
  // MAIN UI
  // ------------------------------------------------------
  return (
    <>
      <div className="bookmark_list">
        <h3>બુકમાર્ક લિસ્ટ</h3>

        {flashMessage && (
          <div className={`flash-message ${flashType === 'error' ? 'error' : ''}`}>
            {flashMessage}
          </div>
        )}

        <div className="bookmarklisting">
          {error && <p className="text-center" style={{ color: 'red' }}>{error}</p>}

          {!error && bookmarks.length === 0 && (
            <p className="text-center" style={{ color: 'red' }}>કોઈ બુકમાર્ક્સ ઉપલબ્ધ નથી.</p>
          )}

          {bookmarks.length > 0 && (
            <>
              <ul id="bookmark-list">
                {bookmarks.map((bookmark) => {
                  const isVideo = bookmark.catID.split(',').includes('9');
                  const fixedCatSlug = bookmark.catSlug.replace(/,/g, '/');

                  const linkUrl = isVideo
                    ? `/${fixedCatSlug}/${bookmark.newsSlug}`
                    : `/news/${fixedCatSlug}/${bookmark.newsSlug}`;

                  // const linkUrl = isVideo
                  //   ? `/${bookmark.catSlug}/${bookmark.newsSlug}`
                  //   : `/news/${bookmark.catSlug}/${bookmark.newsSlug}`;

                  return (
                    <li key={bookmark.news_id}>
                      <Link href={linkUrl} className="title">
                        {bookmark.newsTitle}
                      </Link>

                      <div className="catDate">
                        {/* <span>કેટેગરી: {bookmark.bookmark_type || bookmark.catTitle}</span> */}
                        <span>
                          કેટેગરી: {bookmark.bookmark_type === 'video' ? 'વિડીયો' : 'સમાચાર'}
                        </span>
                        તારીખ:{' '}
                        {new Date(bookmark.created_at || '').toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}

                        <button
                          className="remove-bookmark"
                          onClick={() => removeBookmark(bookmark.news_id)}
                        >
                          ડિલીટ
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {loadingMore && <div className="text-center">લોડ થઈ રહ્યું છે...</div>}

              {!loadingMore && hasMorePages && (
                <div className="text-center mt-3">
                  <button className="btnloadmorecls" onClick={loadMoreBookmarks}>
                    વધુ લોડ કરો
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </>
  );
}
