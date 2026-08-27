'use client';

import { useState, useEffect } from 'react';
import '../styles/CookieConsentBanner.css';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true - cannot be disabled
    analytics: true,
    marketing: true,
    personalization: true,
  });

  useEffect(() => {
    // Check if user has already given consent
    const saved = localStorage.getItem('cookieConsent');
    if (!saved) {
      setShowBanner(true);
    } else {
      try {
        const savedPrefs = JSON.parse(saved);
        setPreferences(savedPrefs);
      } catch {
        setShowBanner(true);
      }
    }
  }, []);

  const saveCookieConsent = (prefs: CookiePreferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    localStorage.setItem('cookieConsentTime', new Date().toISOString());
    setPreferences(prefs);
    setShowBanner(false);
    setShowSettings(false);

    // Trigger analytics if enabled
    if (prefs.analytics && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        'analytics_storage': prefs.analytics ? 'granted' : 'denied',
      });
    }
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };
    saveCookieConsent(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyEssential: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false,
    };
    saveCookieConsent(onlyEssential);
  };

  const handleSavePreferences = () => {
    saveCookieConsent(preferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return; // Essential cannot be toggled
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Main Banner */}
      {!showSettings && (
        <div className="cookie-consent-banner" role="dialog" aria-label="Cookie Consent">
          <div className="cookie-banner-content">
            <div className="cookie-banner-text">
              <h2>🍪 Cookie Policy</h2>
              <p>
                We use cookies to enhance your experience, analyze traffic, and serve personalized content. 
                By accepting, you agree to our use of cookies as described in our{' '}
                <a href="/cookie-policy" target="_blank" rel="noopener noreferrer">Cookie Policy</a>.
              </p>
            </div>

            <div className="cookie-banner-buttons">
              <button
                className="cookie-btn cookie-btn-accept"
                onClick={handleAcceptAll}
                aria-label="Accept all cookies"
              >
                Accept All
              </button>
              <button
                className="cookie-btn cookie-btn-settings"
                onClick={() => setShowSettings(true)}
                aria-label="Customize cookie settings"
              >
                Customize
              </button>
              <button
                className="cookie-btn cookie-btn-reject"
                onClick={handleRejectAll}
                aria-label="Reject non-essential cookies"
              >
                Reject All
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            className="cookie-banner-close"
            onClick={handleRejectAll}
            aria-label="Close cookie banner"
            title="Close (Reject All)"
          >
            ×
          </button>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="cookie-settings-modal" role="dialog" aria-label="Cookie Settings">
          <div className="cookie-settings-content">
            <div className="cookie-settings-header">
              <h2>Cookie Settings</h2>
              <button
                className="cookie-settings-close"
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
              >
                ×
              </button>
            </div>

            <div className="cookie-settings-body">
              <p className="cookie-settings-intro">
                Manage your cookie preferences below. Essential cookies cannot be disabled as they are required 
                for the website to function properly.
              </p>

              {/* Essential Cookies */}
              <div className="cookie-category">
                <div className="cookie-category-header">
                  <div className="cookie-category-info">
                    <h3>🔒 Essential Cookies</h3>
                    <p className="cookie-category-desc">
                      Required for website functionality, security, and compliance. These cannot be disabled.
                    </p>
                  </div>
                  <label className="cookie-toggle disabled">
                    <input
                      type="checkbox"
                      checked={preferences.essential}
                      disabled
                      aria-label="Essential cookies (always enabled)"
                    />
                    <span className="toggle-switch"></span>
                  </label>
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="cookie-category">
                <div className="cookie-category-header">
                  <div className="cookie-category-info">
                    <h3>📊 Analytics Cookies</h3>
                    <p className="cookie-category-desc">
                      Help us understand how visitors interact with our website to improve user experience.
                    </p>
                  </div>
                  <label className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => togglePreference('analytics')}
                      aria-label="Analytics cookies"
                    />
                    <span className="toggle-switch"></span>
                  </label>
                </div>
              </div>

              {/* Marketing Cookies */}
              <div className="cookie-category">
                <div className="cookie-category-header">
                  <div className="cookie-category-info">
                    <h3>📢 Marketing Cookies</h3>
                    <p className="cookie-category-desc">
                      Used to track visitors and display personalized advertisements from our partners.
                    </p>
                  </div>
                  <label className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => togglePreference('marketing')}
                      aria-label="Marketing cookies"
                    />
                    <span className="toggle-switch"></span>
                  </label>
                </div>
              </div>

              {/* Personalization Cookies */}
              <div className="cookie-category">
                <div className="cookie-category-header">
                  <div className="cookie-category-info">
                    <h3>⭐ Personalization Cookies</h3>
                    <p className="cookie-category-desc">
                      Remember your preferences and customize content based on your interests.
                    </p>
                  </div>
                  <label className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={preferences.personalization}
                      onChange={() => togglePreference('personalization')}
                      aria-label="Personalization cookies"
                    />
                    <span className="toggle-switch"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="cookie-settings-footer">
              <button
                className="cookie-btn cookie-btn-secondary"
                onClick={handleRejectAll}
              >
                Reject All
              </button>
              <button
                className="cookie-btn cookie-btn-accept"
                onClick={handleSavePreferences}
              >
                Save Preferences
              </button>
            </div>

            {/* Links */}
            <div className="cookie-settings-links">
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
              <span className="separator">•</span>
              <a href="/cookie-policy" target="_blank" rel="noopener noreferrer">
                Cookie Policy
              </a>
              <span className="separator">•</span>
              <a href="/terms-condition" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for modal */}
      {showSettings && (
        <div
          className="cookie-modal-backdrop"
          onClick={() => setShowSettings(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
