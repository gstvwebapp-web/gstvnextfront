'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {API_ENDPOINTS, BASE_URLS} from "@/constants/api";
import Link from 'next/link';

interface MenuItem {
  id: number;
  menu: string;
  menu_guj: string;
  menuicon: string;
  menuaction: string;
  menuactionweb: string | null;
  menuorderweb: number;
  menuweb_status: number;
  menustatus: number;
  loginstatus: number;
  menuorder: number;
  created_at: string;
  updated_at: string;
}

interface ProfileMenuItemsProps {
  onMenuClick?: () => void;
}


const ProfileMenuItems = ({ onMenuClick }: ProfileMenuItemsProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userMobile, setUserMobile] = useState<string>('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [remainingPoints, setRemainingPoints] = useState<number>(0);

  // Close profile dropdown
  const closeProfile = () => {
    setIsProfileOpen(false);
  };
  
  const handleLogout = () => {
   
    //if (confirm('શું તમે ખરેખર લોગઆઉટ કરવા માંગો છો?')) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userSession');
      localStorage.removeItem('bookmarks');
      setIsLoggedIn(false);
      setUsername(null);
      closeProfile(); // Close profile dropdown

      // Dispatch auth change event
      window.dispatchEvent(new CustomEvent('authChange'));
      window.location.href = '/';
      //window.location.reload();
    //}
  };
  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const userSession = localStorage.getItem("userSession");
        if (!userSession) return;
        const sessionData = JSON.parse(userSession);
        console.log("User Session Data:", sessionData);

        // ⭐ Always use rawApiResponse for profile & username
        const userData = sessionData.rawApiResponse || {};


        const userId =  userData.user_id || userData.id || userData.userId || userData.userData?.user_id || userData.userData?.id;
        if (!userId) return; 

        const response = await fetch(API_ENDPOINTS.USER_GETPOINTS, {
          method: "POST",
          cache: 'no-store',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId })
        });

        const data = await response.json();

        if (data && data.remaining_points) {
          setRemainingPoints(data.remaining_points);
        }
      } catch (error) {
        console.error("Error fetching points:", error);
      }
    };

    fetchUserPoints();
  }, []);
  useEffect(() => {
    // Get user mobile from localStorage
    if (typeof window !== 'undefined') {
      const mobile = localStorage.getItem('mobile') || '';
      setUserMobile(mobile);
    }

    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_ENDPOINTS.CATEGORY_SETTING, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.sidemenuweb && Array.isArray(data.sidemenuweb)) {
          // Filter menu items where menuweb_status === 1
          // const filteredMenus = data.sidemenuweb
          //   .filter((item: MenuItem) => item.menuweb_status === 1)
          //   .sort((a: MenuItem, b: MenuItem) => a.menuorder - b.menuorder);

          // setMenuItems(filteredMenus);
          const filteredMenus = data.sidemenuweb
          .filter((item: MenuItem) => item.menuweb_status === 1)
          .sort((a: MenuItem, b: MenuItem) => a.menuorderweb - b.menuorderweb); // ✅ sort by menuorderweb

          setMenuItems(filteredMenus);
        } else {
          console.warn('⚠️ Menu data is incomplete:', data);
          setError('Menu data not available');
        }
      } catch (err) {
        console.error('❌ Error fetching menu data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  // Don't render anything if loading
  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <i className="fa-solid fa-spinner fa-spin"></i>
        <span style={{ marginLeft: '8px' }}>Loading menu...</span>
      </div>
    );
  }

  // Don't render if error or no menu items
  if (error || menuItems.length === 0) {
    return null;
  }

  return (
    <>
      {/* User Mobile Number Display */}
      {userMobile && (
        <div style={{
          background: '#f8f9fa',
          margin: '0 20px 20px 20px',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(217, 185, 99, 0.2)',
            borderRadius: '50%'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d9b963" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
          </div>
          <span style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            fontFamily: "'Noto Sans Gujarati', sans-serif"
          }}>
            {userMobile}
          </span>
        </div>
      )}

      {/* Dynamic Menu Items */}

  {menuItems.map((item) => {
    const isLogout = item.menuactionweb === 'logout';
    const isCategory = item.menuactionweb === 'myCategory';
    const isCity = item.menuactionweb === 'myCity';
    const isSpecial = isLogout || isCategory || isCity;
    const openCategoryModal = () => {};
    const openCityModal = () => {};
    return (
     <Link
      id={item.menuactionweb || undefined}
      key={item.id}
      href={isSpecial ? '/' : `${BASE_URLS.CURRENT}/${item.menuactionweb}`}
      onClick={(e) => {
        if (isLogout) {
          e.preventDefault();
          handleLogout();
          return;
        }

        if (isCategory) {
          e.preventDefault();
          openCategoryModal?.();
          return;
        }

        if (isCity) {
          e.preventDefault();
          openCityModal?.();
          return;
        }

        if (onMenuClick) onMenuClick();
      }}
    >
        <i className='iconBox'>
          {item.menuicon ? (
            <img
              src={item.menuicon}
              alt={item.menu}
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'contain'
              }}
            />
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
          )}
        </i>
        <span className='userNavLable'>
          {item.menu_guj}
          {item.menuactionweb === "userpoint" && (
            <>&nbsp;&nbsp;<b className="upText">{remainingPoints}</b></>
          )}
        </span>
      </Link>
    );
  })}

    </>
  );
};

export default ProfileMenuItems;

