'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserSessionData {
  user_id: string | null;
  mobile: string | null;
  loginTime: string | null;
  userData: any;
  isLoggedIn: boolean;
}

/**
 * Custom hook to manage user session data and provide easy access to user_id
 * Handles both localStorage and AuthContext synchronization
 */
export const useUserSession = (): UserSessionData => {
  const { isLoggedIn, userSession } = useAuth();
  const [sessionData, setSessionData] = useState<UserSessionData>({
    user_id: null,
    mobile: null,
    loginTime: null,
    userData: null,
    isLoggedIn: false,
  });

  useEffect(() => {
    const updateSessionData = () => {
      if (typeof window !== 'undefined') {
        try {
          // Get data from localStorage as backup
          const storedSession = localStorage.getItem('userSession');
          const storedLoginStatus = localStorage.getItem('isLoggedIn') === 'true';
          
          let parsedSession = null;
          if (storedSession) {
            parsedSession = JSON.parse(storedSession);
          }

          // Prefer AuthContext data, fallback to localStorage
          const sessionSource = userSession || parsedSession;
          const loginStatus = isLoggedIn || storedLoginStatus;

          if (loginStatus && sessionSource) {
            // Extract user_id from multiple possible locations
            const userData = sessionSource.userData || {};
            const user_id = 
              userData.user_id || 
              userData.id || 
              sessionSource.user_id || 
              sessionSource.id || 
              sessionSource.mobile; // Fallback to mobile as identifier

            console.log('🔍 UserSession Hook - Extracted user_id:', user_id);
            console.log('🔍 UserSession Hook - Full userData:', userData);

            setSessionData({
              user_id: user_id?.toString() || null,
              mobile: sessionSource.mobile || null,
              loginTime: sessionSource.loginTime || null,
              userData: userData,
              isLoggedIn: loginStatus,
            });
          } else {
            // Clear session data if not logged in
            setSessionData({
              user_id: null,
              mobile: null,
              loginTime: null,
              userData: null,
              isLoggedIn: false,
            });
          }
        } catch (error) {
          console.error('🔍 UserSession Hook - Error parsing session:', error);
          setSessionData({
            user_id: null,
            mobile: null,
            loginTime: null,
            userData: null,
            isLoggedIn: false,
          });
        }
      }
    };

    // Update on mount
    updateSessionData();

    // Listen for auth changes
    const handleAuthChange = () => {
      updateSessionData();
    };

    window.addEventListener('authChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [isLoggedIn, userSession]);

  return sessionData;
};

/**
 * Utility function to get user_id directly from localStorage
 * Useful for API calls where you just need the user_id
 */
export const getUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) return null;
    
    const session = JSON.parse(userSession);
    const userData = session.userData || {};
    
    return (
      userData.user_id || 
      userData.id || 
      session.user_id || 
      session.id || 
      session.mobile
    )?.toString() || null;
  } catch (error) {
    console.error('🔍 getUserId - Error:', error);
    return null;
  }
};

/**
 * Utility function to get mobile number from session
 */
export const getUserMobile = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) return null;
    
    const session = JSON.parse(userSession);
    return session.mobile || null;
  } catch (error) {
    console.error('🔍 getUserMobile - Error:', error);
    return null;
  }
};

/**
 * Utility function to check if user is logged in
 */
export const isUserLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userSession = localStorage.getItem('userSession');
  
  return isLoggedIn && !!userSession;
};

/**
 * Utility function to get full user data from session
 */
export const getUserData = (): any => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userSession = localStorage.getItem('userSession');
    if (!userSession) return null;
    
    const session = JSON.parse(userSession);
    return session.userData || null;
  } catch (error) {
    console.error('🔍 getUserData - Error:', error);
    return null;
  }
};
