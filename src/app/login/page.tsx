'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/constants/api';
import MobileInput from "@/components/MobileInput";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn, login } = useAuth();
  const [mobile, setMobile] = useState('');
  const [mpinMobile, setMpinMobile] = useState('');
  // NEW STATE FOR DYNAMIC LOGO
  const [logoUrl, setLogoUrl] = useState('/images/logo.png');
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'mpin'
  const [currentView, setCurrentView] = useState('mobile'); // 'mobile', 'otp', 'mpin'
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [returnUrl, setReturnUrl] = useState('/');
  const [windowWidth, setWindowWidth] = useState(1024); // Default to desktop to avoid hydration mismatch
  const [isMounted, setIsMounted] = useState(false); // Track if component is mounted on client

   /* FETCH LOGO FROM API */
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch(
          `${API_ENDPOINTS.CATEGORY_SETTING}`
        );

        const data = await response.json();
        if (data?.setting?.length > 0) {
          setLogoUrl(data.setting[0].logo);
        }
      } catch (error) {
      }
    };
    fetchLogo();
  }, []);

  const handleBack = () => {
    const back = localStorage.getItem('redirectAfterLogin') || '/';
    window.location.href = "/";
  };

  useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Backspace') return;

    const active = document.activeElement as HTMLInputElement;

    if (
      !active?.classList.contains('otp-input-login') &&
      !active?.classList.contains('otp-input-mpin')
    ) {
      return;
    }

    e.preventDefault();

    const selector = active.classList.contains('otp-input-login')
      ? '.otp-input-login'
      : '.otp-input-mpin';

    const inputs = document.querySelectorAll(selector) as NodeListOf<HTMLInputElement>;

    inputs.forEach(i => (i.value = ''));

    inputs[0]?.focus();
  };

  document.addEventListener('keydown', handleKeyDown);

  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);

  // Initialize return URL from search params or localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParam = searchParams?.get('returnUrl');
      const storedUrl = localStorage.getItem('redirectAfterLogin');
      const pendingAction = localStorage.getItem('pendingBookmarkAction');
      const finalUrl = urlParam || storedUrl || '/';

      

      setReturnUrl(finalUrl);
    }
  }, [searchParams]);

  useEffect(() => {
  setTimeout(() => {
    // MOBILE LOGIN INPUT
    if (currentView === 'mobile') {
      const mobileInput = document.querySelector(
        'input[autocomplete="tel"][inputmode="numeric"]'
      ) as HTMLInputElement | null;

      mobileInput?.focus();
    }

    // M-PIN MOBILE INPUT
    if (currentView === 'mpin') {
      const mpinMobileInput = document.querySelector(
        'input[autocomplete="tel"][inputmode="numeric"]'
      ) as HTMLInputElement | null;

      mpinMobileInput?.focus();
    }
  }, 0);
}, [currentView]);

  // Window resize handler for responsive design (fix hydration error)
  useEffect(() => {
    // Set mounted state to true after hydration
    setIsMounted(true);

    // Set initial window width
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Get return URL function
  const getReturnUrl = () => {
    return returnUrl?.startsWith('/') ? returnUrl : '/';
  };

 

useEffect(() => {
  return () => {
    sessionStorage.removeItem('loginRedirected');
  };
}, []);

  // Timer effect for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // OTP Input handling effect
  useEffect(() => {
    const handleOtpInput = (className: string) => {
      const elements = document.querySelectorAll(className) as NodeListOf<HTMLInputElement>;

      elements.forEach((element, index, array) => {
        // Input handler
        const inputHandler = (event: Event) => {
          const target = event.target as HTMLInputElement;
          let inputValue = target.value;
          inputValue = inputValue.replace(/[^0-9]/g, '');
          target.value = inputValue;

          if (inputValue && index < array.length - 1) {
            array[index + 1].focus();
          }
        };

        // Blur handler
        // const blurHandler = () => {
        //   if (element.value === '' && index > 0) {
        //     array[index - 1].focus();
        //   }
        // };

        // Add event listeners
        element.addEventListener('input', inputHandler);
        //element.addEventListener('blur', blurHandler);
      });
    };

    // Apply to both OTP and MPIN inputs
    handleOtpInput('.otp-input-login');
    handleOtpInput('.otp-input-mpin');
  }, [currentView]); // Re-run when view changes

  // Format timer display
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `(${mins}:${secs.toString().padStart(2, '0')})`;
  };

  // Hide messages after timeout
  const hideMessageAfterTimeout = (type: 'error' | 'success', timeout = 3000) => {
    setTimeout(() => {
      if (type === 'error') {
        setError('');
      } else {
        setSuccess('');
      }
    }, timeout);
  };
  
  // Handle signup/login toggle
  const handleAuthToggle = (type: 'signup' | 'login') => {
    setIsSignup(type === 'signup');
    setCurrentView('mobile');
    setActiveTab('login');
    setMobile('');
    setMpinMobile('');
    clearOtpInputs();
    clearMpinInputs();
    setError('');
    setSuccess('');
  };

  // Handle tab switching
  const handleTabSwitch = (tab: 'login' | 'mpin') => {
    setActiveTab(tab);
    if (tab === 'mpin') {
      setCurrentView('mpin');
    } else {
      setCurrentView('mobile');
    }
    setError('');
    setSuccess('');
  };

  // Handle mobile number submission
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔐 Sending OTP to:', mobile);

      const response = await fetch(API_ENDPOINTS.SEND_OTP, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: mobile
        }),
      });

      const data = await response.json();
      console.log('🔐 Send OTP Response:', data);

      if (data) {
        setCurrentView('otp');
        setSuccess('OTP સક્સેસ ફુલ્લી સેંટ થઈ ગયો છે!');
        setOtpTimer(300); // 5 minutes
      } else {
        setError(data.error || 'OTP મોકલવામાં નિષ્ફળ ગયા છો. કૃપા કરીને ફરી પ્રયાસ કરો.');
        hideMessageAfterTimeout('error');
      }
    } catch (error) {
      console.error('🔐 Send OTP Error:', error);
      setError('ભૂલ આવી છે . કૃપા કરીને ફરી પ્રયાસ કરો.');
      hideMessageAfterTimeout('error');
    } finally {
      setLoading(false);
    }
  };

  // Get OTP values from DOM
  const getOtpValues = () => {
    const inputs = document.querySelectorAll('.otp-input-login') as NodeListOf<HTMLInputElement>;
    return Array.from(inputs).map(input => input.value).join('');
  };

  // Get MPIN values from DOM
  const getMpinValues = () => {
    const inputs = document.querySelectorAll('.otp-input-mpin') as NodeListOf<HTMLInputElement>;
    return Array.from(inputs).map(input => input.value).join('');
  };

  // Clear OTP inputs
  const clearOtpInputs = () => {
    const inputs = document.querySelectorAll('.otp-input-login') as NodeListOf<HTMLInputElement>;
    inputs.forEach(input => input.value = '');
  };

  // Clear MPIN inputs
  const clearMpinInputs = () => {
    const inputs = document.querySelectorAll('.otp-input-mpin') as NodeListOf<HTMLInputElement>;
    inputs.forEach(input => input.value = '');
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    const otpString = getOtpValues();

    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
   

      const response = await fetch(API_ENDPOINTS.VERIFY_OTP, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: mobile,
          otp: otpString
        }),
      });

      const data = await response.json();
     

      if (data) {
        // Set user session using AuthContext
        const actualUserId = data.user_id || data.id || data.data?.user_id || data.data?.id;

        if (!actualUserId) {
          setError('તમારો મોબાઈલ નંબર એંડ એમ પિન ચકાસો.');
          console.error('🔐 No user_id in OTP verification response:', data);
          return;
        }

        // ⭐ Save FULL API response in session
        const userSession = {
          mobile,
          loginTime: new Date().toISOString(),
          userId: actualUserId,
          rawApiResponse: data,          // ⭐ full API response
          profileStatus: data.profileSts,
          epaperUrl: data.epaperurl,
          newsUrl: data.newsurl,
          ...data.data                   // ⭐ spread all nested fields (token, name, etc.)
        };

       

        // Set user session using AuthContext
        login(userSession);
        setSuccess('OTP verified successfully!');

        // Handle different redirect scenarios based on API response
        setTimeout(() => {
          if (data.epaperurl && data.epaperurl !== "") {
            window.location.href = data.epaperurl;
          } else if (data.newsurl && data.newsurl !== "") {
            window.location.href = data.newsurl;
          } else {
            // Get return URL before clearing localStorage
            const redirectUrl = getReturnUrl();
            const storedUrl = localStorage.getItem('redirectAfterLogin');

          

            // Clear any stored redirect URL since we're about to redirect
            if (typeof window !== 'undefined') {
              localStorage.removeItem('redirectAfterLogin');
            }

            if (Number(data.profileSts) === 1) {
              window.location.href = redirectUrl;
            } else {
              router.push('/profile');
            }
          }
        }, 1500);
      } else {
        setError(data.error || 'Invalid OTP. Please try again.');
        clearOtpInputs();
      }
    } catch (error) {
     
      setError('Invalid OTP. Please try again.');
      clearOtpInputs();
    } finally {
      setLoading(false);
    }
  };

  // Handle MPIN verification
  const handleVerifyMpin = async () => {
   
    if (!mpinMobile || mpinMobile.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    const mpinString = getMpinValues();

    if (mpinString.length !== 6) {
      setError('Please enter a valid 6-digit M-PIN.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔐 Verifying M-PIN:', mpinString, 'for phone:', mpinMobile);

      const response = await fetch(API_ENDPOINTS.VERIFY_MPIN, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: mpinMobile,
          mpin: mpinString
        }),
      });

      const data = await response.json();
      console.log('🔐 Verify M-PIN Response:', data);

      if (data) {
        // Set user session using AuthContext
        const actualUserId = data.user_id || data.id || data.data?.user_id || data.data?.id;

        if (!actualUserId) {
          setError('તમારો મોબાઈલ નંબર એંડ એમ પિન ચકાસો.');
          console.error('🔐 No user_id in MPIN verification response:', data);
          return;
        }

        // Set user session using AuthContext
        // const userDataWithId = {
        //   ...data.data,
        //   user_id: actualUserId
        // };

        const userSession = {
          mobile: mpinMobile,
          loginTime: new Date().toISOString(),
          userId: actualUserId,
          rawApiResponse: data,          // ⭐ store full response
          profileStatus: data.profileSts,
          epaperUrl: data.epaperurl,
          newsUrl: data.newsurl,
          ...data.data                   // ⭐ include nested user fields
        };

        console.log('🔐 Setting full user session (MPIN):', userSession);

        // Set user session using AuthContext
        login(userSession);
        setSuccess('એમ-પિન સફળતાપૂર્વક વેરિફાય થઈ ગયું છે!');

        // Handle different redirect scenarios based on API response
        setTimeout(() => {
          if (data.epaperurl && data.epaperurl !== "") {
            window.location.href = data.epaperurl;
          } else if (data.newsurl && data.newsurl !== "") {
            window.location.href = data.newsurl;
          } else {
            // Get return URL before clearing localStorage
            const redirectUrl = getReturnUrl();
            const storedUrl = localStorage.getItem('redirectAfterLogin');

            console.log('🎉 MPIN Success, redirect details:', {
              redirectUrl,
              storedUrl,
              returnUrlState: returnUrl,
              profileSts: data.profileSts,
              willRedirectTo: data.profileSts === 1 ? redirectUrl : '/profile'
            });

            // Clear any stored redirect URL since we're about to redirect
            if (typeof window !== 'undefined') {
              localStorage.removeItem('redirectAfterLogin');
            }

            if (data.profileSts === 1) {
              window.location.href = redirectUrl;
            } else {
              
              router.push('/profile');
            }
          }
        }, 1500);
      } else {
        setError(data.error || 'Invalid M-PIN. Please try again.');
        clearMpinInputs();
      }
    } catch (error) {
      console.error('🔐 Verify M-PIN Error:', error);
      setError('Invalid M-PIN. Please try again.');
      clearMpinInputs();
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔐 Resending OTP to:', mobile);

      const response = await fetch(API_ENDPOINTS.RESEND_OTP, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: mobile
        }),
      });

      const data = await response.json();
      console.log('🔐 Resend OTP Response:', data);

      if (data) {
        setSuccess('OTP resent successfully!');
        setOtpTimer(300); // Reset timer to 5 minutes
        clearOtpInputs();
      } else {
        setError(data.error || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('🔐 Resend OTP Error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginOuter">
      
      <div className="loginBox">
        <div className="logo">
          <Link href="/">
           <Image
            src={logoUrl || "/images/logo.png"}
            alt="GSTV.in"
            width={180}
            height={40}
            className="img-fluid"
            priority
          />
          </Link>
        </div>

        {/* Signup/Login Toggle */}
        <div className="signuplogin">
          <Link
            href="javascript:void(0);"
            onClick={() => handleAuthToggle('signup')}
            style={{ color: isSignup ? '#850E00' : '#000' }}
          >
            સાઇન અપ 
          </Link>
          {' | '}
          <Link
            href="javascript:void(0);"
            onClick={() => handleAuthToggle('login')}
            style={{ color: !isSignup ? '#850E00' : '#000' }}
          >
            લોગિન
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="row mpinbtn">
          <div
            className={`col text-center pincls loginSectab ${activeTab === 'login' ? 'pinactive' : ''}`}
            onClick={() => handleTabSwitch('login')}
          >
            {isSignup ? 'સાઇન અપ' : 'મોબાઈલ OTP'}
          </div>
          <div
            className={`col text-center pincls mpinclstab ${activeTab === 'mpin' ? 'pinactive' : ''}`}
            onClick={() => handleTabSwitch('mpin')}
          >
           એમ-પિન 
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="loginerror-message" style={{ marginBottom: '15px' }}>
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="sucerror-message" style={{ marginBottom: '15px' }}>
            {success}
          </div>
        )}

        {/* M-PIN Section */}
        {currentView === 'mpin' && (
          <div className="mpincls">
            <MobileInput value={mpinMobile} onChange={setMpinMobile} />
            {/* <div className="inputOuter">
              <span>+91</span>
              <input
                type="tel"
                placeholder="તમારો મોબાઈલ નંબર દાખલ કરો"
                value={mpinMobile}
                onChange={(e) => setMpinMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
              />
            </div> */}

            <h2>એમ-પિન</h2>

            <div className="otp-wrapper">
              {Array.from({ length: 6 }, (_, index) => (
                // <input
                //   key={index}
                //   type="text"
                //   name={`mpin-${index}`}
                //   className="otp-input-mpin text-[32px] text-center form-input"
                //   maxLength={1}
                //   placeholder="0"
                // />

                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="one-time-code"
                    name={`mpin-${index}`}
                    className="otp-input-mpin text-[32px] text-center form-input"
                    maxLength={1}
                    placeholder="0"
                  />
              ))}
            </div>

            <button
              className="LoginBtn"
              onClick={handleVerifyMpin}
              disabled={loading}
            >
              {loading ? 'વેરિફાય કરી રહ્યા છીએ...' : 'વેરિફાય કરો'}
            </button>
          </div>
        )}

        {/* Mobile Number Section */}
        {currentView === 'mobile' && (
          <div className="loginSec">
            <h2 className="logintext">
              {isSignup ? 'મોબાઈલ નંબર વડે સાઇનઅપ કરો' : 'મોબાઈલ નંબર વડે લોગીન કરો'}
            </h2>
<MobileInput value={mobile} onChange={setMobile} />
            {/* <div className="inputOuter">
              <span>+91</span>
              
              <input
                type="tel"
                placeholder="તમારો મોબાઈલ નંબર દાખલ કરો"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                maxLength={10}
              />
            </div> */}

            <div className="Login_component">
              <Image
                src="/assets/images/privacy_lock.png"
                alt="Privacy"
                width={20}
                height={20}
                className="img-fluid"
              />
              <span>
                <strong>તમારી પર્સનલ માહિતી સુરક્ષિત છે. </strong>
                તમારો નંબર માત્ર અકાઉન્ટ વેરિફાય કરવા માટે જ લઈ રહ્યા છીએ.
              </span>
            </div>

            <button
              className="LoginBtn"
              onClick={() => handleSendOtp()}
              disabled={loading || mobile.length !== 10}
            >
              {loading ? 'મોકલી રહ્યા છીએ...' : 'ચાલુ રાખો'}
            </button>
          </div>
        )}
        {/* OTP Verification Section */}
        {currentView === 'otp' && (
          <div className="otpSec">
            <h2>વેરિફાય OTP</h2>
            <p className="lineNumber">
              +91-{mobile} પર મોકલેલો 6 આંકડાનો કોડ એન્ટર કરો
            </p>
            <p className="lineChangeNumber">
              <Link href="#" onClick={() => setCurrentView('mobile')}>
                મોબાઇલ નંબર બદલો
              </Link>
            </p>

            <div className="otp-wrapper">
              {Array.from({ length: 6 }, (_, index) => (
                // <input
                //   key={index}
                //   type="text"
                //   name={`otp-${index}`}
                //   className="otp-input-login text-[32px] text-center form-input"
                //   maxLength={1}
                //   placeholder="0"
                // />
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  name={`otp-${index}`}
                  className="otp-input-login text-[32px] text-center form-input"
                  maxLength={1}
                  placeholder="0"
                />
              ))}
            </div>

            {otpTimer > 0 ? (
              <p id="otp-timer">
                OTP ફરીથી મોકલો <span>{formatTimer(otpTimer)}</span>
              </p>
            ) : (
              <p className="lineChangeNumber">
                <Link href="#" onClick={handleResendOtp}>
                  OTP ફરીથી મોકલો
                </Link>
              </p>
            )}

            <button
              className="LoginBtn"
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? 'વેરિફાય કરી રહ્યા છીએ...' : 'વેરિફાય કરો'}
            </button>
          </div>
        )} 
        <a
  className="back-link"
  onClick={() => {
    const back = localStorage.getItem('redirectAfterLogin') || '/';
    window.location.href = back;
  }}
>
   <button
      type="button"
      className="back-link-btn"
      title="પાછા જાઓ"
      onClick={handleBack}
    >
      <i className="fas fa-arrow-left"></i>
      
    </button>
<span> વેબસાઇટ પર પાછા જાઓ</span>
</a>
      </div>
    </div>
  );
}
