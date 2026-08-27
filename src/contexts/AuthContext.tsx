'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/*  
|--------------------------------------------------------------------------
| Updated UserData interface
|--------------------------------------------------------------------------
| ✔ Stores full API response
| ✔ Stores userId, profileStatus, epaperUrl, newsUrl
| ✔ Stores rawApiResponse
| ✔ Backward compatible with existing fields
*/
interface UserData {
  mobile: string;
  loginTime: string;

  /* Existing */
  userData?: any;
  user_id?: number | string;

  /* NEW — full response support */
  userId?: number | string;
  rawApiResponse?: any;
  profileStatus?: number;
  epaperUrl?: string;
  newsUrl?: string;

  /* Any other fields */
  [key: string]: any;
}

interface AuthContextType {
  isLoggedIn: boolean;
  userSession: UserData | null;
  login: (userData: UserData) => void;
  logout: () => void;
  checkAuthStatus: () => boolean;
  getUserId: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userSession, setUserSession] = useState<UserData | null>(null);
  const router = useRouter();

  /*  
  |--------------------------------------------------------------------------
  | Check Local Authentication
  |--------------------------------------------------------------------------
  */
  const checkAuthStatus = useCallback((): boolean => {
    if (typeof window !== 'undefined') {
      const storedLoginStatus = localStorage.getItem('isLoggedIn');
      const storedUserSession = localStorage.getItem('userSession');

      if (storedLoginStatus === 'true' && storedUserSession) {
        try {
          const parsedSession = JSON.parse(storedUserSession);
          setIsLoggedIn(true);
          setUserSession(parsedSession);
          return true;
        } catch (error) {
          console.error('Error parsing user session:', error);
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userSession');
          setIsLoggedIn(false);
          setUserSession(null);
          return false;
        }
      }
    }
    return false;
  }, []);

  /*  
  |--------------------------------------------------------------------------
  | LOGIN — Save Full Response
  |--------------------------------------------------------------------------
  | userData coming from login page ALREADY contains:
  | - rawApiResponse
  | - userId / user_id
  | - profileStatus, epaperUrl, newsUrl
  | - ...all fields spread from API
  |
  | Here we ONLY validate & save to localStorage/context
  */
  const login = (userData: UserData) => {
    const actualUserId =
      userData.user_id ||
      userData.userId ||
      userData.userData?.user_id ||
      userData.userData?.id;

    if (!actualUserId) {
      console.error('🔐 AuthContext - No user_id found in userData:', userData);
      throw new Error('Cannot login: User ID is required');
    }

    const enhancedUserData: UserData = {
      ...userData,
      user_id: actualUserId,
      userId: actualUserId,
    };

    console.log('🔐 AuthContext - Saving Full User Session:', enhancedUserData);

    setIsLoggedIn(true);
    setUserSession(enhancedUserData);

    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userSession', JSON.stringify(enhancedUserData));
      window.dispatchEvent(new CustomEvent('authChange'));
    }
  };

  /*  
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */
  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserSession(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userSession');
      localStorage.removeItem('bookmarks');

      window.dispatchEvent(new CustomEvent('authChange'));
    }

    router.push('/');
  }, [router]);

  /*  
  |--------------------------------------------------------------------------
  | Helper: Get User ID
  |--------------------------------------------------------------------------
  */
  const getUserId = (): string | null => {
    if (userSession) {
      return (
        userSession.user_id ||
        userSession.userId ||
        userSession.userData?.user_id ||
        userSession.userData?.id ||
        null
      );
    }

    if (typeof window !== 'undefined') {
      const storedSession = localStorage.getItem('userSession');
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          return (
            session.user_id ||
            session.userId ||
            session.userData?.user_id ||
            session.userData?.id ||
            null
          );
        } catch (error) {
          console.error('🔐 AuthContext - Error parsing stored userSession:', error);
        }
      }
    }

    return null;
  };

  // Load auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const value: AuthContextType = {
    isLoggedIn,
    userSession,
    login,
    logout,
    checkAuthStatus,
    getUserId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
