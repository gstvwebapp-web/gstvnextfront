'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSettings } from '@/hooks/useSettings';
import dynamic from 'next/dynamic';
import { useStockmarketSiteSetting } from '@/hooks/useStockmarketSiteSetting';
import { MEDIA_BASE_URL, API_ENDPOINTS } from '@/constants/api';
import ProfileMenuItems from './ProfileMenuItems';
// import GoogleTranslate from "@/components/GoogleTranslate";
import Link from 'next/link';

function resolveUrl(url?: string): string {
  if (!url || url.trim() === '') return '/images/logo.png';
  const val = url.trim();
  if (val.startsWith('http://') || val.startsWith('https://')) return val;
  if (val.startsWith('/')) return `${MEDIA_BASE_URL}${val}`;
  return `${MEDIA_BASE_URL}/${val}`;
}

interface BreakingNewsItem {
  id: number;
  title: string;
  slug: string;
  category_slugs?: string;
}

interface BreakingNewsData {
  breakingnews: BreakingNewsItem[];
  newsflash: string;
}

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('User');
  const [userImage, setUserImage] = useState<string>('/images/avatar_male.png');
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const [breakingNewsData, setBreakingNewsData] = useState<BreakingNewsData | null>(null);
  const [showBreakingNews, setShowBreakingNews] = useState<boolean>(false);
  const { settings } = useSettings();
  const DEFAULT_LOGO = "/assets/images/logo.png";
  const [logoImage, setLogoImage] = useState<string>(DEFAULT_LOGO);
  const { PodcastEnabled } = useStockmarketSiteSetting();
  // const logoSrc = resolveUrl(settings?.logo);
  useEffect(() => {
  const resolvedLogo = resolveUrl(settings?.logo);
  setLogoImage(resolvedLogo || DEFAULT_LOGO);
}, [settings]);

  // Fetch Breaking News
  useEffect(() => {
    const fetchBreakingNews = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.BREAKING_NEWS, {
          method: 'GET',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          const hasBreakingNews =
            data.breakingnews && Array.isArray(data.breakingnews) && data.breakingnews.length > 0;
          const hasNewsflash = data.newsflash && data.newsflash.trim() !== '';

          if (hasBreakingNews || hasNewsflash) {
            setBreakingNewsData(data);
            setShowBreakingNews(true);
          } else {
            setShowBreakingNews(false);
          }
        }
      } catch (error) {
        console.error('Error fetching breaking news:', error);
      }
    };

    fetchBreakingNews();
  }, []);

  // Check Login and Load User Data
  useEffect(() => {
  const checkLoginStatus = () => {
    const isUserLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const userSession = localStorage.getItem("userSession");

    if (isUserLoggedIn && userSession) {
      try {
        const sessionData = JSON.parse(userSession);
        console.log("User Session Data:", sessionData);

        // ⭐ Always use rawApiResponse for profile & username
        const userData = sessionData.rawApiResponse || {};

        setIsLoggedIn(true);

        // ⭐ Profile Image
        if (userData.profileImg) {
          setUserImage(userData.profileImg);   // FULL URL → no changes
        } else {
          setUserImage("/images/avatar_male.png");
        }

        // ⭐ Username
        if (userData.firstname && userData.lastname) {
          setUsername(`${userData.firstname} ${userData.lastname}`);
        } else if (userData.firstname) {
          setUsername(userData.firstname);
        } else if (sessionData.mobile) {
          setUsername('');
        } else {
          setUsername("User");
        }

      } catch (error) {
        console.error("Error parsing user session:", error);
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userSession");
        setIsLoggedIn(false);
        setUsername("User");
        setUserImage("/images/avatar_male.png");
      }
    } else {
      setIsLoggedIn(false);
      setUsername("User");
      setUserImage("/images/avatar_male.png");
    }
  };

  // ⭐ Run immediately on mount
  checkLoginStatus();

  // ⭐ Listen for login/logout and profile update events
  window.addEventListener("storage", checkLoginStatus);
  window.addEventListener("authChange", checkLoginStatus);
  window.addEventListener("profileUpdated", checkLoginStatus);

  return () => {
    window.removeEventListener("storage", checkLoginStatus);
    window.removeEventListener("authChange", checkLoginStatus);
    window.removeEventListener("profileUpdated", checkLoginStatus);
  };
}, []);



  // Profile dropdown toggle
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);
  const closeProfile = () => setIsProfileOpen(false);

  // Close on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        isProfileOpen &&
        !target.closest('.profile-dropdown') &&
        !target.closest('.user-profile-trigger')
      ) {
        closeProfile();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeProfile();
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isProfileOpen]);

  return (
    <nav className="navbar navbar-expand-lg bg-white fixed-top custom-header">
      <div className="container-fluid">
        <div className="row w-100 align-items-center">
          {/* Logo */}
          <div className="col-lg-2 col-md-2 col-sm-6 col-6 p-0 d-flex align-items-center gap-2">
            {/* Hamburger — mobile only, before logo */}
            <button
              className="hdr-hamburger d-lg-none"
              aria-label="Open menu"
              onClick={() => window.dispatchEvent(new CustomEvent('toggleMobileMenu'))}
              style={{
                background: 'none',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                padding: '4px 6px',
                cursor: 'pointer',
                color: '#333',
                fontSize: '22px',
                lineHeight: 1,
                flexShrink: 0,
                WebkitAppearance: 'none',
                MozAppearance: 'none',
              } as React.CSSProperties}
            >
              <i className="fa-solid fa-bars"></i>
            </button>
            <Link href="/" className="navbar-brand mb-0">
              <Image
                key={logoImage}
                src={logoImage}
                alt="GSTV.in"
                className="logo Image-fluid"
                width={120}
                height={25}
                priority
                unoptimized
                onError={() => setLogoImage(DEFAULT_LOGO)}
              />
            </Link>
          </div>

          {/* Nav Links */}
          <div className="col-lg-6 col-md-6 custom-navbar p-0">
            {/* <div className="navbar-collapse">
              <div className="navbar-nav">
                <Link className="nav-item nav-link" href="/">
                  <Image src="/assets/icons/header-home.svg" alt="હોમ" width={25} height={25} />
                  <p className="main-header-title custom-gujrati-font">હોમ</p>
                </Link>
                <Link className="nav-item nav-link" href="/web-stories">
                  <Image src="/assets/icons/header-webstorys.svg" alt="વેબ સ્ટોરીઝ" width={25} height={25} />
                  <p className="main-header-title custom-gujrati-font">વેબ સ્ટોરીઝ</p>
                </Link>
                <Link className="nav-item nav-link" href="/category/videos">
                  <Image src="/assets/icons/header-video.svg" alt="વીડિયો" width={25} height={25} />
                  <p className="main-header-title custom-gujrati-font">વીડિયો</p>
                </Link>
                <Link className="nav-item nav-link" href="/category/entertainment">
                  <Image src="/assets/icons/header-entertainment.svg" alt="એન્ટરટેઇનમેન્ટ" width={25} height={25} />
                  <p className="main-header-title custom-gujrati-font">એન્ટરટેઇનમેન્ટ</p>
                </Link>
                <Link className="nav-item nav-link" href="/livetv">
                  <Image src="/assets/icons/livetv.svg" alt="લાઇવ ટીવી" width={25} height={25} />
                  <p className="main-header-title custom-gujrati-font">લાઇવ ટીવી</p>
                </Link>
              </div>
            </div> */}
          </div>

          {/* Right side icons and profile */}
          <div className="col-lg-4 col-md-4  col-sm-6 col-6 p-0">
            <div className='custom-navbar'>
            <div className="navbar-collapse">
              <div className="navbar-nav">
                {PodcastEnabled && (
                  <Link className="nav-item nav-link" href="/gstv-podcast">
                    <Image src="/assets/images/ico_pod.svg" alt="હોમ" width={25} height={25} />
                    <p className="main-header-title custom-gujrati-font">પોડકાસ્ટ</p>
                  </Link>
                )} 
                <Link className="nav-item nav-link" href="/search">
                  <Image src="/assets/images/search_icon.svg" alt="વેબ સ્ટોરીઝ" width={25} height={25} />
                  <p className="main-header-title custom-gujrati-font">સર્ચ</p>
                </Link>
                <Link className="nav-item nav-link" href="/epaper">
                  <Image src="/assets/icons/e-news-paper.svg" alt="વીડિયો" width={25} height={25} />
                  <p className="main-header-title custom-gujrati-font">ઈ-પેપર</p>
                </Link>
                {isLoggedIn ? (
                <>
                  <div
                    className="user-profile user-profile-trigger"
                    onClick={toggleProfile}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Image
                      src={userImage}
                      alt="User Profile"
                      className="user-avatar"
                      width={40}
                      height={40}
                      style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0' }}
                      onError={(e) => { e.currentTarget.src = '/images/avatar_male.png'; }}
                    />
                    <span className='userName'>
                      {username} 
                    </span> <Image
                      src="/images/arrow-drop1.svg"
                      alt="User Profile"
                      width={24}
                      height={24}
                    />
                  </div>

                  <div className={`profile-dropdown profileTopBox ${isProfileOpen ? 'active' : ''}`}>
                    <div className="profile-sidebar">
                      <div className="profileTitle">
                        <button className="backProfile" onClick={closeProfile} id="backProfile">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div className="title">મારી પ્રોફાઇલ</div>
                      </div>
                      <div className="userNav">
                        <ProfileMenuItems onMenuClick={closeProfile} />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Link href="/login" className='nav-item nav-link loginclsheader' >
                  
                  <span className="btnLogin"><Image src="/assets/images/user-icon.svg" className='user-icon' alt="user-icon" width={35} height={35} /> લોગિન</span>
                </Link>
              )}
              </div>
            </div>
            </div>
            <div className="profile-icons custom-profile-icons">
              {/* Google Translate Button */}
              {/* <GoogleTranslate /> */}


              {PodcastEnabled && (
                 <Link href="/gstv-podcast" className="e-news-paper searchNews mobile-header-menu">
                <Image src="/assets/images/ico_pod.svg" alt="પોડકાસ્ટ" width={21} height={21} />
                <span className="hrader-title-text">પોડકાસ્ટ</span>
              </Link>
              )} 

              <Link href="/search" className="e-news-paper searchNews mobile-header-menu ">
                <Image src="/assets/images/search_icon.svg" alt="Search" width={21} height={21} />
                <span className="hrader-title-text">સર્ચ</span>
              </Link>

              <Link href="/epaper" className="e-news-paper epapercls mobiledisplay mobile-header-menu">
                <Image src="/assets/icons/e-news-paper.svg" alt="E-news-paper" width={21} height={21} />
                <span className="hrader-title-text">ઈ-પેપર</span>
              </Link>

              

              {isLoggedIn ? (
                <>
                  <div
                    className="user-profile user-profile-trigger "
                    onClick={toggleProfile}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Image
                      src={userImage}
                      alt="User Profile"
                      className="user-avatar"
                      width={40}
                      height={40}
                      style={{ borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0' }}
                      onError={(e) => { e.currentTarget.src = '/images/avatar_male.png'; }}
                    />
                    <span className='userName'>
                      {username} 
                    </span> <Image
                      src="/images/arrow-drop1.svg"
                      alt="User Profile"
                      width={24}
                      height={24}
                    />
                  </div>

                  <div className={`profile-dropdown profileTopBox ${isProfileOpen ? 'active' : ''}`}>
                    <div className="profile-sidebar">
                      <div className="profileTitle">
                        <button className="backProfile" onClick={closeProfile} id="backProfile">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <div className="title">મારી પ્રોફાઇલ</div>
                      </div>
                      <div className="userNav">
                        <ProfileMenuItems onMenuClick={closeProfile} />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <Link href="/login" className="btnLogin mobile-header-menu">
                  <Image src="/assets/images/user-icon.svg" className='user-icon' alt="user-icon" width={35} height={35} />
                  <span>લોગિન</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* City Selection Modal */}
    <div
      className="modal fade"
      id="myCityModal"
      tabIndex={-1}
      aria-labelledby="myCityModalLabel"
      aria-hidden="true"
      style={{
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 1050
      }}
    >
      <div className="modal-dialog modal-lg" style={{maxWidth: '900px', margin: '20px auto'}}>
        <div
          className="modal-content"
          style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}
        >
          <form method="POST" id="cityForm">
            {/* Modal Header */}
            <div
              className="modal-header"
              style={{
                backgroundColor: '#d4a574',
                borderRadius: '15px 15px 0 0',
                padding: '20px 30px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div className="colTitle">
                <h4
                  className="modal-title"
                  style={{
                    margin: 0,
                    fontSize: '22px',
                    fontWeight: '600',
                    color: 'white',
                    fontFamily: "'Noto Sans Gujarati', sans-serif"
                  }}
                >
                  શહેર પસંદ કરો
                </h4>
              </div>

              <div style={{ flex: 1, maxWidth: '400px' }}>
                  <div style={{ position: 'relative', margin: '0px 10px' }}>

                  <input
                    type="text"
                    id="citySearch"
                    placeholder="સર્ચ યોર સિટી"
                    style={{
                      width: '100%',
                      padding: '12px 45px 12px 20px',
                      borderRadius: '25px',
                      border: 'none',
                      fontSize: '16px',
                      outline: 'none',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                    }}
                  />
                  <button
                    type="button"
                    className="btnSearch"
                    style={{
                      position: 'absolute',
                      right: '15px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '5px'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                style={{
                  background: 'white',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div
              className="modal-body"
              style={{
                padding: '30px 30px',
                backgroundColor: '#f8f9fa',
                minHeight: '300px'
              }}
            >
              <div className="cityList"></div>
              <div className="no-results" style={{display: 'none', textAlign: 'center', padding: '40px', color: '#666', fontSize: '18px', fontFamily: "'Noto Sans Gujarati', sans-serif"}}>
                શહેર મળ્યું નથી
              </div>
            </div>

            {/* Modal footer */}
            <div
              className="modal-footer"
              style={{
                padding: '25px 30px',
                backgroundColor: '#8B0000',
                borderRadius: '0 0 15px 15px',
                border: 'none',
                textAlign: 'center'
              }}
            >
              <button
                type="button"
                className="btnSubmitCity"
                id="btnSubmitCity"
                data-bs-dismiss="modal"
                style={{
                  backgroundColor: 'white',
                  color: '#8B0000',
                  border: 'none',
                  padding: '15px 40px',
                  borderRadius: '25px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontFamily: "'Noto Sans Gujarati', sans-serif",
                  minWidth: '200px'
                }}
              >
                આગળ વધો
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    {/* Category Selection Modal */}

      <div
      className="modal fade"
      id="myCategoryModal"
      tabIndex={-1}
      aria-labelledby="myCategoryModalLabel"
      aria-hidden="true"
      style={{
        backgroundColor: 'rgba(0,0,0,0.6)',
        zIndex: 1050
      }}
    >
      <div className="modal-dialog modal-lg" style={{maxWidth: '900px', margin: '20px auto'}}>
        <div
          className="modal-content"
          style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            border: 'none',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}
        >
          <form method="POST" id="categoryForm">
            {/* Modal Header */}
            <div
              className="modal-header"
              style={{
                backgroundColor: '#b1974f',
                borderRadius: '15px 15px 0 0',
                padding: '15px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                <h4
                  className="modal-title"
                  id="myCategoryModalLabel"
                  style={{
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    margin: 0,
                    fontFamily: '"Hind Vadodara", sans-serif'
                  }}
                >
                  કેટેગરી પસંદ કરો
                </h4>

                <div style={{ flex: 1, maxWidth: '400px' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      id="categorySearch"
                      placeholder="સર્ચ યોર કેટેગરી"
                      style={{
                        width: '100%',
                        padding: '12px 45px 12px 20px',
                        borderRadius: '25px',
                        border: 'none',
                        fontSize: '16px',
                        outline: 'none',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                      }}
                    />
                    <button
                      type="button"
                      className="btnSearch"
                      style={{
                        position: 'absolute',
                        right: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '5px'
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                style={{
                  background: 'white',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div
              className="modal-body"
              style={{
                padding: '30px 30px 0',
                backgroundColor: 'white',
                
                overflowY: 'auto'
              }}
            >
              <div
                className="categorydataList"
                style={{
                  display: 'grid',
                }}
              ></div>
              <div
                className="no-resultscat"
                style={{
                  display: 'none',
                  textAlign: 'center',
                  padding: '60px 20px',
                  fontSize: '18px',
                  color: '#666',
                  fontFamily: '"Hind Vadodara", sans-serif'
                }}
              >
                કેટેગરી મળ્યું નથી
              </div>
              <div
                className="loading-categories"
                style={{
                  display: 'none',
                  textAlign: 'center',
                  padding: '60px 20px',
                  fontSize: '16px',
                  color: '#999',
                  fontFamily: '"Hind Vadodara", sans-serif'
                }}
              >
                <div style={{ marginBottom: '15px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #d4a574',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto'
                  }}></div>
                </div>
                કેટેગરી લોડ થઈ રહી છે...
              </div>
            </div>

            {/* Modal footer */}
            <div
              className="modal-footer"
              style={{
                backgroundColor: '#8B0000',
                borderRadius: '0 0 15px 15px',
                padding: '20px 30px',
                border: 'none',
                justifyContent: 'center',
                display: 'flex'
              }}
            >
              <button
                type="button"
                className="btnSubmitCategory"
                id="btnSubmitCategory"
                data-bs-dismiss="modal"
                style={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '2px solid white',
                  padding: '12px 50px',
                  borderRadius: '25px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontFamily: '"Hind Vadodara", sans-serif',
                  transition: 'all 0.3s ease',
                  minWidth: '150px'
                }}
              >
                આગળ વધો
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
     <style jsx global>{`
/* Hide Google translate top bar */
.goog-te-banner-frame, .VIpgJd-ZVi9od-ORHb-OEVmcd {
  display: none !important;
  visibility: hidden !important;
}

iframe.goog-te-banner-frame {
  display: none !important;
}

/* Prevent page shifting */
body {
  top: 0px !important;
  position: static !important;
}

/* Hide google branding text */
.goog-logo-link {
  display: none !important;
}

.goog-te-gadget span {
  display: none !important;
}

/* ── Mobile hamburger in header ── */
.hdr-hamburger {
  display: none;
  background: none !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
  padding: 4px 6px;
  cursor: pointer;
  color: #333;
  font-size: 22px;
  line-height: 1;
  flex-shrink: 0;
}
.hdr-hamburger:focus,
.hdr-hamburger:focus-visible,
.hdr-hamburger:active {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

@media (max-width: 991px) {
  .hdr-hamburger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  /* Hide the old fixed-position hamburger from LeftSidebar */
  .mobile-menu-btn {
    display: none !important;
  }
}
`}</style>
    </nav>
  );
}
