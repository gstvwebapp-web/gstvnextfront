'use client';

import { API_ENDPOINTS } from '@/constants/api';
import { useEffect, useState } from 'react';

export function useContentLock(userId: number) {
  const [loading, setLoading] = useState(true);
  const [fullLogin, setFullLogin] = useState(0);
  const [fullStatus, setFullStatus] = useState(0);
  const [planActive, SetPlanActiveStatus] = useState(0);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.CATEGORY_SETTING_WITH_PLAN, {
          method: 'POST',
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        });

        const data = await res.json();

        setFullLogin(Number(data.setting.fullcontent_login) || 0);
        setFullStatus(Number(data.setting.fullcontent_status) || 0);
        SetPlanActiveStatus(Number(data.setting.planexist) || 0);
      } catch {
        setFullLogin(0);
        setFullStatus(0);
        SetPlanActiveStatus(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [userId]);
  
  let isLocked = false;
  if(fullStatus && planActive)  {
    isLocked = false;
  } else if(fullStatus === 1 && planActive === 0) {
    isLocked = true;
  } else if(userId === 0 && fullLogin) {
    isLocked = true;    
  }

  return {
    loading,

    // raw API flags
    fullLogin,
    fullStatus,

    // helper flags (optional)
    isLoginLock: fullStatus === 1 && userId === 0,
    isPremiumLock: fullStatus === 1 && userId !== 0,

    // master lock flag
    isLocked,
  };
}
