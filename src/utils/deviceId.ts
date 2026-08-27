/**
 * Device ID Utility
 * Generates and manages persistent device IDs for API calls
 */

/**
 * Generate a persistent device ID based on browser fingerprint
 * This ID will be the same for the same browser/device combination
 * and will persist across browser sessions
 */
export function generatePersistentDeviceId(): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // Server-side fallback
    return 'server_' + Math.random().toString(36).substring(2, 18);
  }

  try {
    // Create a stable fingerprint based on browser characteristics
    const userAgent = navigator.userAgent || 'unknown';
    const screenInfo = `${screen.width}x${screen.height}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const language = navigator.language || 'en';
    const platform = navigator.platform || 'unknown';
    
    // Combine all characteristics into a stable string
    const fingerprintData = `${userAgent}-${screenInfo}-${timezone}-${language}-${platform}`;
    
    // Create a base64 encoded fingerprint and clean it
    const fingerprint = btoa(fingerprintData).replace(/[^a-zA-Z0-9]/g, '');
    
    // Create device ID with prefix and truncated fingerprint
    return 'web_' + fingerprint.substring(0, 16);
  } catch (error) {
    // Fallback to a random but persistent ID
    return 'web_fallback_' + Math.random().toString(36).substring(2, 12);
  }
}

/**
 * Get or create a persistent device ID
 * This function ensures the device ID is stored in localStorage
 * and remains consistent across browser sessions
 */
export function getOrCreateDeviceId(): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return generatePersistentDeviceId();
  }

  try {
    // Try to get existing device ID from localStorage
    let deviceId = localStorage.getItem('device_id');
    
    if (!deviceId) {
      // Generate new persistent device ID
      deviceId = generatePersistentDeviceId();
      localStorage.setItem('device_id', deviceId);
    }
    
    return deviceId;
  } catch (error) {
    // Return a session-based ID if localStorage fails
    return generatePersistentDeviceId();
  }
}

/**
 * Reset device ID (useful for testing or user logout)
 */
export function resetDeviceId(): string {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('device_id');
    } catch (error) {
      // Silent fail
    }
  }
  
  return getOrCreateDeviceId();
}

/**
 * Get current device ID without creating a new one
 * Returns null if no device ID exists
 */
export function getCurrentDeviceId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem('device_id');
  } catch (error) {
    return null;
  }
}
