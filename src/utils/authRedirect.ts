export function requireLogin(targetPath: string) {
  if (typeof window === 'undefined') return;

  let loggedIn = false;

  try {
    const session = localStorage.getItem('userSession');
    if (session) {
      const data = JSON.parse(session);
      loggedIn = !!data?.userId;
    }
  } catch (e) {}

  // ✅ NOT LOGGED IN → Send to login
  if (!loggedIn) {
    localStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
    window.location.href = '/login';
    return;
  }

  // ✅ LOGGED IN → Go to target page
  window.location.href = targetPath;
}
