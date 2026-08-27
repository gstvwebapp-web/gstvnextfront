'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCategorySettings } from '@/hooks/useCategorySettings';
import { useCategorySettingsTopMenu } from '@/hooks/useCategorySettingsTopMenu';
import { useStockmarketSiteSetting } from '@/hooks/useStockmarketSiteSetting';
import { CategorySettingsItem } from '@/services/newsApi';
import { API_ENDPOINTS, MEDIA_BASE_URL } from '@/constants/api';
import { useUserSession } from '@/hooks/useUserSession';
import '@/styles/sidebar.css';


interface UserCategoryPreferences {
  category: number[];
  city: number[];
}

export default function LeftSidebar() {
  // Row 1: Top menu using CATEGORY_SETTING_TOP_MENU endpoint
  const { categories: topMenuCategories, loading: topMenuLoading, error: topMenuError } = useCategorySettingsTopMenu();
  
  // Row 2: Full categories using CATEGORY_SETTING endpoint (unchanged)
  const { categories, loading, error } = useCategorySettings();
  const { isLoggedIn, user_id } = useUserSession();
  const pathname = usePathname();

  const [openSubmenu, setOpenSubmenu] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [moreMenuPos, setMoreMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [moreStripOpen, setMoreStripOpen] = useState(false);
  const [moreStripPos, setMoreStripPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [hoveredCatId, setHoveredCatId] = useState<number | null>(null);
  // Stable gujarat subcategories — never resets to empty once populated
  const [gujaratSubs, setGujaratSubs] = useState<any[]>([]);
  const MAX_VISIBLE = 17;
  // Responsive MAX_STRIP_VISIBLE based on screen width
  // Desktop: 14, Smaller screens: 12, Tablets: 10
  const getMaxStripVisible = () => {
    if (typeof window === 'undefined') return 14;
    const width = window.innerWidth;
    if (width >= 1400) return 17;      // Desktop
    if (width >= 1024) return 15;      // Small Desktop
    if (width >= 768) return 10;       // Tablet (but mobile menu used instead)
    return 14;                         // Fallback
  };
  const MAX_STRIP_VISIBLE = getMaxStripVisible();
  const [userCategoryPreferences, setUserCategoryPreferences] =
    useState<UserCategoryPreferences | null>(null);
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [preferencesError, setPreferencesError] = useState(false);
  const { RashiEnabled } = useStockmarketSiteSetting();
  /* =========================
     MOUNT
  ========================= */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /* =========================
     FETCH USER PREFS (UNCHANGED LOGIC)
  ========================= */
  useEffect(() => {
    const fetchUserCategoryPreferences = async () => {
      if (!isLoggedIn || !user_id) {
        setUserCategoryPreferences(null);
        return;
      }

      setLoadingPreferences(true);
      setPreferencesError(false);

      try {
        const response = await fetch(API_ENDPOINTS.GET_CATEGORY_CITY, {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id }),
        });

        const data = await response.json();

        if (data?.category && Array.isArray(data.category)) {
          setUserCategoryPreferences({
            category: data.category.map(Number),
            city: (data.city || []).map(Number),
          });
        } else {
          setUserCategoryPreferences(null);
        }
      } catch {
        setPreferencesError(true);
        setUserCategoryPreferences(null);
      } finally {
        setLoadingPreferences(false);
      }
    };

    fetchUserCategoryPreferences();
  }, [isLoggedIn, user_id]);

  /* =========================
     CONSTANTS
  ========================= */
  const ALWAYS_VISIBLE_SLUGS = useMemo(
    () => ['campuscorner', 'journalist', 'rashifal', 'web-stories', 'livetv'],
    []
  );

  /* =========================
     FILTERED CATEGORIES (MEMOIZED)
     SAME LOGIC
  ========================= */
  const filteredCategories = useMemo(() => {
    // Always show all categories - don't filter by user preferences for main menu
    // User preferences are only applied to the mobile menu via GET_CATEGORY_CITY
    
    if (!categories || categories.length === 0) {
      return categories;
    }

    // For logged-in users with city preferences, optionally filter Gujarat subcategories
    // But ALWAYS ensure Gujarat and its subcategories are present for Row 2
    if (isLoggedIn && userCategoryPreferences?.city && userCategoryPreferences.city.length > 0) {
      const allowedCategoryIds = userCategoryPreferences.category;
      const allowedCityIds = userCategoryPreferences.city;

      return categories
        .filter(
          cat =>
            ALWAYS_VISIBLE_SLUGS.includes(cat.slug) ||
            allowedCategoryIds.includes(cat.id) ||
            cat.slug === 'gujarat' // Always include Gujarat
        )
        .map(cat => {
          // Apply city filter to Gujarat if user has selected specific cities
          if (cat.slug === 'gujarat' && cat.subcategories && allowedCityIds.length > 0) {
            return {
              ...cat,
              subcategories: cat.subcategories.filter(
                (sub: any) => sub?.id && allowedCityIds.includes(Number(sub.id))
              ),
            };
          }
          return cat;
        });
    }

    // If not logged in or no preferences, return all categories as-is
    return categories;
  }, [categories, isLoggedIn, userCategoryPreferences, ALWAYS_VISIBLE_SLUGS]);

  /* =========================
     POPULATE GUJARAT SUBS — direct API fetch, independent of context
  ========================= */
  useEffect(() => {
    // Already have data — don't re-fetch
    if (gujaratSubs.length > 0) return;

    const fetchGujaratSubs = async () => {
      try {
        const res = await fetch('/api/categorysetting', { method: 'GET', cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const allCats: any[] = data.category || [];
        // Find gujarat parent
        const gujarat = allCats.find((c: any) => c.slug === 'gujarat' && c.parentID === 0);
        if (!gujarat) return;
        // Get its children
        const subs = allCats.filter((c: any) => c.parentID === gujarat.id);
        if (!subs.length) return;
        // Sort by catOrder
        subs.sort((a: any, b: any) => (a.catOrder ?? 0) - (b.catOrder ?? 0));
        setGujaratSubs(subs);
      } catch (e) {
        console.error('Gujarat subs fetch failed', e);
      }
    };

    fetchGujaratSubs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetch once on mount

  /* =========================
     CLOSE MORE MENU ON OUTSIDE CLICK
  ========================= */
  useEffect(() => {
    if (!moreMenuOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const btn = document.querySelector('.more-menu-btn');
      const dropdown = document.querySelector('.more-dropdown-fixed');
      if (btn && !btn.contains(target) && dropdown && !dropdown.contains(target)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreMenuOpen]);

  useEffect(() => {
    if (!moreStripOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const btn = document.querySelector('.more-strip-btn');
      const dropdown = document.querySelector('.more-strip-dropdown');
      if (btn && !btn.contains(target) && dropdown && !dropdown.contains(target)) {
        setMoreStripOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [moreStripOpen]);

  /* =========================
     MOBILE MENU TOGGLE
  ========================= */
  useEffect(() => {
    const handleToggleMobileMenu = () =>
      setIsMobileMenuOpen(prev => !prev);

    window.addEventListener('toggleMobileMenu', handleToggleMobileMenu);
    return () =>
      window.removeEventListener('toggleMobileMenu', handleToggleMobileMenu);
  }, []);

  /* =========================
     AUTO OPEN SUBMENU FROM URL
  ========================= */
  useEffect(() => {
    if (!pathname || !filteredCategories.length) return;

    const parts = pathname.split('/');
    if (parts[1] === 'category' && parts.length >= 4) {
      const slug = parts[2];
      const category = filteredCategories.find(c => c.slug === slug);
      if (category?.subcategories?.length) {
        setOpenSubmenu(category.id);
      }
    }
  }, [pathname, filteredCategories]);

  /* =========================
     CLICK / ESC HANDLERS
  ========================= */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('.mobile-sidebar-menu');
      const menuToggle = document.querySelector('.mobile-menu-toggle');

      if (
        isMobileMenuOpen &&
        sidebar &&
        !sidebar.contains(event.target as Node) &&
        menuToggle &&
        !menuToggle.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  /* =========================
     HELPERS (STABLE)
  ========================= */
  const toggleSubmenu = useCallback((id: number) => {
    setOpenSubmenu(prev => (prev === id ? null : id));
  }, []);

  const isActiveCategory = useCallback(
    (slug: string, id: number) =>
      id <= 0 ? pathname === `/${slug}` : pathname === `/category/${slug}`,
    [pathname]
  );

  const isActiveSubcategory = useCallback(
    (c: string, s: string) =>
      pathname === `/category/${c}/${s}`,
    [pathname]
  );

  const renderCategoryIcon = useCallback((category: CategorySettingsItem) => {
    if (category.icon) {
      return (
        <Image
          src={category.icon}
          alt={category.category_name}
          width={25}
          height={25}
          onError={e => ((e.currentTarget as any).src = '/images/category_icon.svg')}
        />
      );
    }
    return <i className="fa-solid fa-folder"></i>;
  }, []);

  const getCategoryPath = useCallback(
    (slug: string, id: number) => (id <= 0 ? `/${slug}` : `/category/${slug}`),
    []
  );

  const getSubcategoryPath = useCallback(
    (c: string, s: string) => `/category/${c}/${s}`,
    []
  );
  
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="col-lg-2 mb-1 col-md-2 d-lg-none" style={{ zIndex: 999 }}>
        <button
          className="mobile-menu-btn d-lg-none"
          onClick={() => window.dispatchEvent(new CustomEvent('toggleMobileMenu'))}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 12px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#333',
            fontSize: '12px',
            fontFamily: "'Hind Vadodara', sans-serif",
            minWidth: '60px',
            top: '56px',
            position: 'fixed',
            left: '0px',
            zIndex: '1000',
          }}
        >
          <i className="fa-solid fa-bars" style={{ fontSize: '20px', marginBottom: '2px' }}></i>
        </button>
         <div className="nav-list custom-sidebar scrollarea" style={{display: 'none' }}>
            <ul className="sidebar-menu">
              <li className=" allcatshow catMobileshow">
                <Link href="/category/gstv-satrang" className="">
                  <img src="/assets/icons/gstv_satrang.svg" alt="GSTV શતરંગ"/>
                  <span>GSTV શતરંગ</span>
                </Link>
              </li>
              {RashiEnabled && (
              <li className=" allcatshow catMobileshow">
                <Link href="/rashifal" className="">
                  <img src={`${MEDIA_BASE_URL}/backend/public/uploads/category/icon/rashifal.svg`} alt="રાશિફળ"/>
                  <span>રાશિફળ</span>
                </Link>
              </li>
             )}

              <li className="allcatshow catMobileshow">
                <Link href="/livetv" className="">
                  <img src={`${MEDIA_BASE_URL}/public/assets/icons/icon-live.svg`} alt="લાઇવ ટીવી"/>
                  <span>લાઇવ ટીવી</span>
                </Link>
              </li>
            </ul>
          </div>
      </div>
      {/* Desktop Top Menu */}
<div className="desktop-top-menu d-lg-block">

    {/* Row 1: Main Categories (Gujarat excluded) - Using CATEGORY_SETTING_TOP_MENU */}
    <div className="desktop-menu-scroll">

        <Link href="/" className="menu-home">
            <i className="fa-solid fa-house"></i>
        </Link>

        {!isMounted && <span className="menu-loading">કેટેગરી લોડ થઈ રહી છે...</span>}
        {isMounted && topMenuLoading && <span className="menu-loading">કેટેગરી લોડ થઈ રહી છે...</span>}
        {isMounted && topMenuError && <span className="menu-loading text-danger">Error loading categories</span>}

        {isMounted && !topMenuLoading && !topMenuError && (() => {
            // Use topMenuCategories for Row 1
            const nonGujaratCats = topMenuCategories.filter(c => c.slug !== 'gujarat');
            const visibleCats = nonGujaratCats.slice(0, MAX_VISIBLE);
            const moreCats = nonGujaratCats.slice(MAX_VISIBLE);
            const hasMore = moreCats.length > 0;

            return (
                <>
                    {visibleCats.map((category, index) => {
                        const hasSub = (category.subcategories?.length ?? 0) > 0;
                        const isHovered = hoveredCatId === category.id;
                        return (
                            <div
                                className={`desktop-menu-item${isHovered ? ' hovered' : ''}`}
                                key={`${category.id}-${index}`}
                                // onMouseEnter={() => hasSub ? setHoveredCatId(category.id) : setHoveredCatId(null)}
                                // onMouseLeave={() => setHoveredCatId(null)}
                            >
                                <Link
                                    href={getCategoryPath(category.slug, category.id)}
                                    className={`desktop-menu-link ${isActiveCategory(category.slug, category.id) ? 'active' : ''}`}
                                >
                                    {category.category_name_guj}
                                    {/* {hasSub && <i className="fa-solid fa-chevron-down sub-arrow"></i>} */}
                                </Link>
                            </div>
                        );
                    })}

                    {hasMore && (
                        <div className="desktop-menu-item more-menu-wrapper">
                            <button
                                className="desktop-menu-link more-menu-btn"
                                onClick={e => {
                                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                    setMoreMenuPos({ top: rect.bottom, left: rect.left });
                                    setMoreMenuOpen(prev => !prev);
                                }}
                                aria-expanded={moreMenuOpen}
                            >
                                વધુ <i className={`fa-solid fa-chevron-${moreMenuOpen ? 'up' : 'down'}`} style={{ fontSize: '11px', marginLeft: '4px' }}></i>
                            </button>
                        </div>
                    )}

                    {hasMore && moreMenuOpen && (
                        <ul
                            className="desktop-submenu-fixed more-dropdown-fixed"
                            style={{ top: moreMenuPos.top, left: moreMenuPos.left }}
                        >
                            {moreCats.map((category, index) => (
                                <li key={`more-${category.id}-${index}`}>
                                    <Link
                                        href={getCategoryPath(category.slug, category.id)}
                                        className={isActiveCategory(category.slug, category.id) ? 'active' : ''}
                                        onClick={() => setMoreMenuOpen(false)}
                                    >
                                        {category.category_name_guj}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            );
        })()}
    </div>

    {/* Row 2: Gujarat subcategories strip — always visible once data loads */}
    {gujaratSubs.length > 0 && (() => {
        const hoveredCat = hoveredCatId !== null
            ? (filteredCategories ?? categories)?.find((c: any) => c.id === hoveredCatId)
            : null;

        const stripSubs: any[] = hoveredCat?.subcategories?.length ? hoveredCat.subcategories : gujaratSubs;
        const stripSlug: string = hoveredCat?.subcategories?.length ? hoveredCat.slug : 'gujarat';
        const isGujarat = stripSlug === 'gujarat';

        const visibleSubs = stripSubs.slice(0, MAX_STRIP_VISIBLE);
        const moreSubs    = stripSubs.slice(MAX_STRIP_VISIBLE);
        const hasMoreSubs = moreSubs.length > 0;

        return (
            <div
                className={`desktop-subcat-strip${isGujarat ? ' gujarat-strip' : ''}`}
                onMouseEnter={() => hoveredCat && setHoveredCatId(hoveredCat.id)}
                onMouseLeave={() => setHoveredCatId(null)}
            >
                {isGujarat && (
                    <Link href="/category/gujarat" className="strip-category-label">
                        <img src="/assets/icons/gujarat.webp" alt="ગુજરાત" className="strip-gujarat-icon" />
                    </Link>
                )}
                {visibleSubs.map((sub: any, i: number) => (
                    <Link
                        key={i}
                        href={getSubcategoryPath(stripSlug, sub.slug)}
                        className={`subcat-strip-link ${isActiveSubcategory(stripSlug, sub.slug) ? 'active' : ''}`}
                    >
                        {sub.category_name_guj}
                    </Link>
                ))}

                {hasMoreSubs && (
                    <>
                        <button
                            className="subcat-strip-link more-strip-btn"
                            onClick={e => {
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                const viewportWidth = window.innerWidth;
                                const dropdownWidth = 260;
                                let leftPos = rect.left;
                                if (leftPos + dropdownWidth > viewportWidth - 20) {
                                  leftPos = viewportWidth - dropdownWidth - 20;
                                }
                                leftPos = Math.max(10, leftPos);
                                setMoreStripPos({ top: rect.bottom, left: leftPos });
                                setMoreStripOpen(prev => !prev);
                            }}
                        >
                            વધુ <i className={`fa-solid fa-chevron-${moreStripOpen ? 'up' : 'down'}`} style={{ fontSize: '10px', marginLeft: '3px' }}></i>
                        </button>

                        {moreStripOpen && (
                            <ul
                                className="desktop-submenu-fixed more-strip-dropdown"
                                style={{ top: moreStripPos.top, left: moreStripPos.left }}
                            >
                                {moreSubs.map((sub: any, i: number) => (
                                    <li key={`strip-more-${i}`}>
                                        <Link
                                            href={getSubcategoryPath(stripSlug, sub.slug)}
                                            className={isActiveSubcategory(stripSlug, sub.slug) ? 'active' : ''}
                                            onClick={() => setMoreStripOpen(false)}
                                        >
                                            {sub.category_name_guj}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </div>
        );
    })()}

</div>


      {/* Mobile Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)} />

      {/* Mobile Menu */}
      <div className={`mobile-sidebar-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <button className="back-arrow-btn" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/images/arrow-backProfile.svg" alt="Back" className="back-arrow" />
          </button>
          <span className="menu-title">All Categories</span>
        </div>

        <div className="mobile-menu-content">
          <ul className="mobile-menu-list">
            {!isMounted && (
              <li className="mobile-menu-item">
                <div style={{ padding: '15px', textAlign: 'center', color: '#666' }}>
                  કેટેગરી લોડ થઈ રહી છે...
                </div>
              </li>
            )}

            {isMounted && loading && (
              <li className="mobile-menu-item">
                <div style={{ padding: '15px', textAlign: 'center', color: '#666' }}>
                  કેટેગરી લોડ થઈ રહી છે...
                </div>
              </li>
            )}

            {isMounted && error && (
              <li className="mobile-menu-item">
                <div style={{ padding: '15px', color: '#dc3545', fontSize: '14px' }}>
                  Error loading categories
                </div>
              </li>
            )}

            {isMounted && !loading && !error &&
              filteredCategories.map((category, index) => {
                const hasSub = category.subcategories?.length > 0;
                return (
                  <li key={`mobile-${category.id}-${category.slug}-${index}`} className="mobile-menu-item">
                    <div className="mobile-category-item">
                      <Link
                        href={getCategoryPath(category.slug, category.id)}
                        className={`mobile-category-link ${isActiveCategory(category.slug, category.id) ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {renderCategoryIcon(category)}
                        <span>{category.category_name_guj}</span>
                      </Link>

                      {hasSub && (
                        <button className="mobile-submenu-toggle" onClick={() => toggleSubmenu(category.id)}>
                          <i className={`fa-solid ${openSubmenu === category.id ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                        </button>
                      )}
                    </div>

                    {hasSub && (
                      <ul className={`mobile-submenu ${openSubmenu === category.id ? 'show' : ''}`}>
                        {category.subcategories!.map((sub: any, subIndex: number) => (
                          <li key={`mobile-sub-${category.id}-${sub.slug}-${subIndex}`} className="mobile-subcategory-item">
                            <Link
                              href={`/category/${category.slug}/${sub.slug}`}
                              className={`mobile-subcategory-link ${isActiveSubcategory(category.slug, sub.slug) ? 'active' : ''}`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {renderCategoryIcon(sub)}
                              <span>{sub.category_name_guj}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      </div>

    </>
  );
}
