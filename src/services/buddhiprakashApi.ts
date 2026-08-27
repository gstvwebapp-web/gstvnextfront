/**
 * Buddhi Prakashan API Service
 *
 * API response shape:
 * {
 *   "Buddhiprakash": {
 *     "current_page": 1,
 *     "data": [ { id, ecatslug, Story_data, newspaperdate, ... } ],
 *     "last_page": 1,
 *     "per_page": 8,
 *     "total": 1
 *   },
 *   "buddhiprakashlist": [ { title, slug } ]
 * }
 */

import { MEDIA_BASE_URL } from '@/constants/api';

export interface BuddhiItem {
  id: number;
  title?: string;
  etitle?: string;
  engtitle?: string;
  ecatslug?: string;
  slug?: string;
  cattype?: string;
  userID?: number;
  ecatID?: number;
  newspaperdate: string;
  pdf?: string;
  Story_data: string[];   // array of image URLs
  thumbnail?: string | null;
  viewer?: number;
  viewer_app?: number;
  metatitle?: string;
  metakeyword?: string | null;
  metadesc?: string | null;
  notification?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BuddhiPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

// ── Fetch list ────────────────────────────────────────────────────────────────

export const fetchBuddhiPrakashan = async (
  pageNumber = 1,
  perPage = 8
): Promise<{ items: BuddhiItem[]; pagination: BuddhiPagination | null }> => {

  const res = await fetch('/api/buddhiprakash', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ pageNumber: String(pageNumber), per_page: String(perPage) }),
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`Buddhi Prakashan API error: ${res.status}`);

  const data = await res.json();

  let items: BuddhiItem[] = [];
  let pagination: BuddhiPagination | null = null;

  // ── Primary shape: { "Buddhiprakash": { data: [...], current_page, ... } }
  if (data?.Buddhiprakash?.data && Array.isArray(data.Buddhiprakash.data)) {
    const p = data.Buddhiprakash;
    items = p.data;
    pagination = {
      current_page: p.current_page,
      per_page:     p.per_page,
      total:        p.total,
      last_page:    p.last_page,
    };
  }
  // ── Direct array inside Buddhiprakash
  else if (Array.isArray(data?.Buddhiprakash)) {
    items = data.Buddhiprakash;
  }
  // ── Fallback shapes (magazine / epaper style)
  else if (Array.isArray(data?.buddhiprakash))      { items = data.buddhiprakash; }
  else if (Array.isArray(data?.data))               { items = data.data; }
  else if (Array.isArray(data?.Newspaper))          { items = data.Newspaper; }
  else if (data?.Newspaper?.data)                   { items = data.Newspaper.data; }
  else if (data?.epapercity?.Newspaper)             { items = data.epapercity.Newspaper; }

  if (data?.pagination) pagination = data.pagination;

  // Normalise Story_data to array
  items = items.map(item => ({
    ...item,
    Story_data: Array.isArray(item.Story_data) ? item.Story_data : [],
  }));

  return { items, pagination };
};

// ── Fetch single item by slug (used on detail page) ───────────────────────────

export const fetchBuddhiDetail = async (slug: string): Promise<BuddhiItem | null> => {
  try {
    const { items } = await fetchBuddhiPrakashan(1, 50);
    return (
      items.find(item => (item.ecatslug || item.slug || String(item.id)) === slug)
      ?? items[0]
      ?? null
    );
  } catch {
    return null;
  }
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Cover image URL — first Story_data image, then thumbnail, then fallback */
export const getBuddhiImageUrl = (item: BuddhiItem): string => {
  if (item.Story_data?.length > 0) {
    const url = item.Story_data[0];
    if (url.startsWith('http')) return url;
    return `${MEDIA_BASE_URL}${url}`;
  }
  if (item.thumbnail) {
    if (item.thumbnail.startsWith('http')) return item.thumbnail;
    return `${MEDIA_BASE_URL}${item.thumbnail}`;
  }
  return '/images/news-default.png';
};

/** YYYY-MM-DD → DD/MM/YYYY */
export const formatBuddhiDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

/** YYYY-MM-DD → DD-MM-YYYY (for URLs) */
export const formatBuddhiDateUrl = (dateStr: string): string =>
  formatBuddhiDate(dateStr).replace(/\//g, '-');
