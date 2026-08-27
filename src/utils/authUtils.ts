/**
 * Authentication utility functions
 */

/**
 * Redirects to login page with return URL
 * @param returnUrl - The URL to redirect to after successful login
 * @param router - Next.js router instance
 */
export const redirectToLogin = (returnUrl: string, router: any) => {
 
  
  // Store the return URL for redirect after login
  if (typeof window !== 'undefined') {
    localStorage.setItem('redirectAfterLogin', returnUrl);
 
  }
  
  router.push('/login');
};

/**
 * Gets the current page path for use as return URL
 * @returns Current page path
 */
export const getCurrentPagePath = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.pathname + window.location.search;
  }
  return '/';
};

/**
 * Clears the stored redirect URL
 */
export const clearRedirectUrl = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('redirectAfterLogin');
   
  }
};

/**
 * Gets the stored redirect URL
 * @returns Stored redirect URL or default '/'
 */
export const getStoredRedirectUrl = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('redirectAfterLogin') || '/';
  }
  return '/';
};
