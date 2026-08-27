"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/constants/api";

interface BookmarkItem {
  id: number;
  title?: string;
  slug?: string;
  type: "news" | "video";
}

interface BookmarkContextType {
  bookmarks: BookmarkItem[];
  isBookmarked: (id: number) => boolean;
  toggleBookmark: (item: BookmarkItem) => Promise<void>;
  removeBookmark: (id: number, type?: "news" | "video") => Promise<void>;
  reloadBookmarks: () => void;
  userId: string | null;
}

const BookmarkContext = createContext<BookmarkContextType | null>(null);
export const useBookmarks = () => useContext(BookmarkContext)!;

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  // Load logged-in user ID
  useEffect(() => {
    const s = localStorage.getItem("userSession");
    if (!s) return setUserId(null);

    try {
      const parsed = JSON.parse(s);
      const uid =
        parsed?.userData?.user_id ||
        parsed?.userData?.id ||
        parsed?.id ||
        parsed?.user_id ||
        null;

      setUserId(uid);
    } catch {
      setUserId(null);
    }
  }, []);

  // Load user bookmarks
  const loadUserBookmarks = () => {
    if (!userId) return setBookmarks([]);

    const stored = JSON.parse(localStorage.getItem(`bookmarks_${userId}`) || "[]");
    setBookmarks(stored);
  };

  useEffect(() => {
    loadUserBookmarks();
  }, [userId]);

  // Save bookmarks to localStorage
  useEffect(() => {
    if (!userId) return;

    localStorage.setItem(`bookmarks_${userId}`, JSON.stringify(bookmarks));

    // Notify other components
    window.dispatchEvent(new Event("storage"));
  }, [bookmarks, userId]);

  // Check status
  const isBookmarked = (id: number) => bookmarks.some((b) => b.id === id);

  // Add or Remove Bookmark via API
  const toggleBookmark = async (item: BookmarkItem) => {
    if (!userId) {
      alert("Please login to bookmark.");
      return;
    }

    const isAlready = isBookmarked(item.id);

    // API call
    const res = await fetch(API_ENDPOINTS.REMOVE_BOOKMARK, {
      method: "POST",
      cache: 'no-store',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        user_id: userId,
        news_id: item.id.toString(),
      }),
    });

    // Local update
    if (isAlready) {
      setBookmarks((prev) => prev.filter((b) => b.id !== item.id));
    } else {
      setBookmarks((prev) => [...prev, item]);
    }
  };

  // Force remove bookmark
  const removeBookmark = async (id: number, type: "news" | "video" = "news") => {
    if (!userId) return;

    await fetch(API_ENDPOINTS.REMOVE_BOOKMARK, {
      method: "POST",
      cache: 'no-store',
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        user_id: userId,
        news_id: id.toString(),
      }),
    });

    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <BookmarkContext.Provider
      value={{
        bookmarks,
        isBookmarked,
        toggleBookmark,
        removeBookmark,
        reloadBookmarks: loadUserBookmarks,
        userId,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}
