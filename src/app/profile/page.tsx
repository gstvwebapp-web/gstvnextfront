'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ProFooter from '@/components/ProFooter';
import { API_ENDPOINTS, MEDIA_BASE_URL } from '@/constants/api';

interface UserProfile {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  mpin: string;
  gender: string;
  profileImg: string;
  mobile: string;
  city: {
    id: number | null;
    title: string;
  };
  birthdate: string;
  bdaytime: string;
  bdaytimeampm: string;
  birthdateplace: string;
  profileSts: number;
  user_points: number;
  latitude: string;
  longitude: string;
  referralcode: string;
  status: string;
}

interface City {
  id: number;
  title: string;
  category_name: string;
  category_name_guj: string;
  slug: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState<string>('/images/avatar_male.png');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Form state
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    city: '',
    email: '',
    birthdate: '',          // will be kept as DD-MM-YYYY in state
    bdaytime: '',
    bdaytimeampm: 'am',
    birthdateplace: '',
    gender: 'male',
    mpin: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const userSession = localStorage.getItem('userSession');

      const storedMobile = localStorage.getItem('mobile');
      if (storedMobile) setMobileNumber(storedMobile);

      if (isLoggedIn !== 'true' || !userSession) {
        router.push('/login');
        return;
      }

      try {
        const session = JSON.parse(userSession);
        let userId = session.userData?.user_id || session.userData?.id;

        if (!userId) {
          userId = session.user_id || session.id || session.userData?.id;
        }

        if (!userId) {
          setError('User ID not found in session. Please login again.');
          return;
        }

        fetchProfile(userId);
        fetchCities();
      } catch (error) {
        console.log('🔧 [TESTING] Session parse error, using mock session for testing...');
      }
    };

    checkAuth();
  }, [router]);

  const fetchCities = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CATEGORY_SETTING, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'GSTV-NextJS-App/1.0'
        }
      });
      const result = await response.json();

      if (result.category && Array.isArray(result.category)) {
        const activeCities = result.category.filter((city: any) => {
          return city.parentID === 1 && city.status === 'Active';
        });
        setCities(activeCities);
      } else {
        setCities([]);
      }
    } catch (error) {
      console.error('🔧 [PROFILE] Cities fetch error:', error);
      setCities([]);
    }
  };

  // YYYY-MM-DD -> DD-MM-YYYY (for showing in form)
  const formatToDisplay = (value: string) => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    const [y, m, d] = parts;
    return `${d}-${m}-${y}`;
  };

  // DD-MM-YYYY -> YYYY-MM-DD (for sending to API)
  const formatToISO = (value: string) => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length !== 3) return value;
    const [d, m, y] = parts;
    return `${y}-${m}-${d}`;
  };

  const fetchProfile = async (userId: string) => {
    try {
      setLoading(true);

      const response = await fetch(API_ENDPOINTS.VIEW_PROFILE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });

      const result = await response.json();

      let userData = result;
      if (result.id && result.firstname) {
        userData = result;
      } else if (result.success && result.data) {
        userData = result.data;
      }

      if (userData) {
        setProfile(userData);

        if (userData.mobile) setMobileNumber(userData.mobile);

        setFormData({
          firstname: userData.firstname || '',
          lastname: userData.lastname || '',
          city: userData.city?.id?.toString() || '',
          email: userData.email || '',
          // convert API (YYYY-MM-DD) -> DD-MM-YYYY for form display
          birthdate: userData.birthdate ? formatToDisplay(userData.birthdate) : '',
          bdaytime: userData.bdaytime || '',
          bdaytimeampm: userData.bdaytimeampm || 'am',
          birthdateplace: userData.birthdateplace || '',
          gender: userData.gender || 'male',
          mpin: userData.mpin?.toString() || '',
          latitude: userData.latitude || '',
          longitude: userData.longitude || ''
        });

        if (userData.profileImg) {
          const imageUrl = userData.profileImg.startsWith('http')
            ? userData.profileImg
            : `${MEDIA_BASE_URL}/uploads/profile/${userData.profileImg}`;
          setPreviewImage(imageUrl);
        } else {
          setPreviewImage(
            userData.gender === 'female'
              ? '/images/avatar_female.png'
              : '/images/avatar_male.png'
          );
        }
      } else {
        setError('Failed to load profile data');
      }
    } catch (error: any) {
      console.error('🔧 [PROFILE] Profile fetch error:', error);
      setError('An error occurred while loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const hideMessage = (type: 'message' | 'error', timeout = 3000) => {
    setTimeout(() => {
      if (type === 'message') setMessage('');
      else setError('');
    }, timeout);
  };

  const handleDeleteAccount = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
  e?.stopPropagation();
    const confirmed = confirm(
      'શું તમે ખરેખર તમારું એકાઉન્ટ કાઢી નાખવા માંગો છો? આ ક્રિયા પૂર્વવત્ કરી શકાતી નથી અને તમે તમારો બધો ડેટા ગુમાવશો.'
    );
    if (!confirmed) return;

    setDeleteLoading(true);
    setMessage('');
    setError('');

    try {
      const userSession = localStorage.getItem('userSession');
      let userId = '';

      if (userSession) {
        const session = JSON.parse(userSession);
        userId = session.userData?.user_id || session.userData?.id;

        if (!userId) {
          userId = session.user_id || session.id || session.userData?.id;
        }

        if (!userId) {
          setError('User ID not found in session. Please login again.');
          setSubmitLoading(false);
          return;
        }
      } else {
        setError('Session not found. Please login again.');
        setSubmitLoading(false);
        return;
      }

      const requestBody = new URLSearchParams({ user_id: userId.toString() });

      const response = await fetch(API_ENDPOINTS.USER_DELETEACCOUNT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
          'User-Agent': 'GSTV-NextJS-App/1.0'
        },
        body: requestBody
      });

      const result = await response.json();

      if (result.success || response.ok) {
        setMessage('Account deleted successfully! Redirecting to homepage...');

        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userSession');

        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'isLoggedIn',
            oldValue: 'true',
            newValue: null,
            storageArea: localStorage
          })
        );
        window.dispatchEvent(new CustomEvent('authChange'));

        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError(result.message || 'Failed to delete account. Please try again.');
      }
    } catch (error) {
      setError('An error occurred while deleting account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
  e?.stopPropagation();
    setSaveLoading(true);
    setMessage('');
    setError('');

    try {
      const formDataToSend = new FormData();

      const userSession = localStorage.getItem('userSession');
      let userId = '';
      if (userSession) {
        const session = JSON.parse(userSession);
        userId = session.userData?.user_id || session.userData?.id;

        if (!userId) {
          userId = session.user_id || session.id || session.userData?.id;
        }

        formDataToSend.append('user_id', userId);

        if (!userId) {
          setError('User ID not found in session. Please login again.');
          setSubmitLoading(false);
          return;
        }
      }

      formDataToSend.append('firstname', formData.firstname);
      formDataToSend.append('lastname', formData.lastname);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('email', formData.email);
      // Convert DD-MM-YYYY from form -> YYYY-MM-DD for API
      formDataToSend.append('birthdate', formatToISO(formData.birthdate));
      formDataToSend.append('bdaytime', formData.bdaytime);
      formDataToSend.append('bdaytimeampm', formData.bdaytimeampm);
      formDataToSend.append('birthdateplace', formData.birthdateplace);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('mpin', formData.mpin);
      formDataToSend.append('latitude', formData.latitude);
      formDataToSend.append('longitudee', formData.longitude);

      const fileInput = document.getElementById('profileImg') as HTMLInputElement;
      if (fileInput?.files?.[0]) {
        formDataToSend.append('profileImg', fileInput.files[0]);
      }

      const response = await fetch(API_ENDPOINTS.UPDATE_PROFILE, {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (result.success === true || (response.ok && response.status === 200)) {
  setMessage("પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થઈ ગયી છે!");
  hideMessage("message");

  // ⭐ Update image preview instantly
  if (result.user?.profileImg) {
    setPreviewImage(result.user.profileImg);
  }

  // ⭐ Update session
  const userSessionString = localStorage.getItem("userSession");
  if (userSessionString) {
    const session = JSON.parse(userSessionString);
    const raw = session.rawApiResponse || {};

    const updatedFields = {
      firstname: result.user.firstname,
      lastname: result.user.lastname,
      profileImg: result.user.profileImg  // FULL URL
    };

    const newSession = {
      ...session,
      rawApiResponse: {
        ...raw,
        ...updatedFields
      }
    };

    localStorage.setItem("userSession", JSON.stringify(newSession));
  }

  // ⭐ Notify header
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent("profileUpdated"));
  }, 100);
} else {
        let errorMessage = 'Failed to update profile';

        if (result.message) errorMessage = result.message;
        else if (result.error) errorMessage = result.error;
        else if (result.errors) {
          if (typeof result.errors === 'object') {
            const errorKeys = Object.keys(result.errors);
            if (errorKeys.length > 0) {
              errorMessage =
                result.errors[errorKeys[0]][0] || result.errors[errorKeys[0]];
            }
          } else {
            errorMessage = result.errors;
          }
        }

        setError(errorMessage);
        hideMessage('error');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      hideMessage('error');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="contents-main-div" id="middlePage">
        <div className="profilePage">
          <div className="text-center" style={{ padding: '50px' }}>
            <div className="spinner-border" role="status">
              <span className="visually-hidden">લોડ કરી રહ્યું છે...</span>
            </div>
            <p style={{ marginTop: '20px' }}>પ્રોફાઇલ લોડ કરી રહ્યું છે...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="profilePage">
        {/* <form
          className="formBox"
          id="profile-form"
          onSubmit={(e) => e.preventDefault()}
        > */}
        <div className="formBox" id="profile-form">
          <div className="photoSec">
            <div className="photoInner">
              <Image
                src={previewImage}
                alt="Photo"
                className="img-fluid"
                id="proimg"
                width={114}
                height={114}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
              />
            </div>
            <div id="btnImportData" className="editPhoto">
              <Image
                src="/images/ico-edit-photo.svg"
                alt="Edit Photo"
                width={19}
                height={17}
              />
              <input
                type="file"
                name="profileImg"
                id="profileImg"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="title">
            <h2>આપનું સ્વાગત છે</h2>
          </div>

          {message && (
            <div
              id="submit-message"
              className="submit-message mb-3 text-center"
              style={{ color: 'green' }}
            >
              {message}
            </div>
          )}

          {error && (
            <div
              id="error-message"
              className="error-message mb-3 text-center"
              style={{ color: 'red' }}
            >
              {error}
            </div>
          )}

          <div className="row">
            <div className="col-lg-6 mb-2">
              <div className="lable">પ્રથમ નામ</div>
              <div className="inputOuter">
                <input
                  type="text"
                  className="form-control"
                  id="firstname"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleInputChange}
                  placeholder="તમારું પ્રથમ નામ દાખલ કરો"
                  required
                />
              </div>
            </div>
            <div className="col-lg-6 mb-2">
              <div className="lable">લાસ્ટ નામ</div>
              <div className="inputOuter">
                <input
                  type="text"
                  className="form-control"
                  id="lastname"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleInputChange}
                  placeholder="તમારું લાસ્ટ નામ દાખલ કરો"
                  required
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-6 mb-2">
              <div className="lable">શહેર</div>
              <div className="inputOuter">
                <select
                  className="form-control"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">તમારું શહેર પસંદ કરો</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id.toString()}>
                      {city.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="col-lg-6 mb-2">
              <div className="lable">મોબાઈલ નંબર</div>
              <div className="inputOuter">
                <input
                  type="tel"
                  name="mobile"
                  value={mobileNumber}
                  readOnly
                  placeholder="તમારો મોબાઈલ નંબર દાખલ કરો"
                  id="mobile"
                  className="form-control"
                  required
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-6 mb-2">
              <div className="lable">ઇમેલ એડ્રેસ</div>
              <div className="inputOuter">
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="તમારું ઇમેલ એડ્રેસ દાખલ કરો"
                  required
                />
              </div>
            </div>

            <div className="col-lg-6 mb-2">
              <div className="lable">જન્મ તારીખ</div>
              <div className="inputOuter">
             <div
  className="date-input-wrapper"
  style={{ position: "relative", cursor: "pointer" }}
  onClick={() => (document.getElementById("hiddenDate") as HTMLInputElement)?.showPicker?.()}
>
  {/* Display formatted date: DD-MM-YYYY */}
  <input
    type="text"
    className="form-control"
    placeholder="DD-MM-YYYY"
    value={formData.birthdate}
    readOnly
    style={{ paddingRight: "40px", cursor: "pointer" }}
  />

  {/* Calendar icon */}
  <span
    style={{
      position: "absolute",
      right: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: "18px",
      pointerEvents: "none"
    }}
  >
    📅
  </span>

  {/* Hidden REAL date picker */}
  <input
    type="date"
    id="hiddenDate"
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      opacity: 0,
      height: "100%",
      width: "100%",
      cursor: "pointer",
    }}
    max={new Date().toISOString().split("T")[0]} // 👈 Disable future dates
    value={formatToISO(formData.birthdate)}
    onChange={(e) => {
      const isoValue = e.target.value;
      const today = new Date().toISOString().split("T")[0];

      // 🔒 extra validation stop using script or Safari
      if (isoValue > today) {
        alert("Future date not allowed!");
        e.target.value = today;
        setFormData(prev => ({
          ...prev,
          birthdate: formatToDisplay(today)
        }));
        return;
      }

      // Normal flow: convert and show dd-mm-yyyy
      const displayValue = formatToDisplay(isoValue);
      setFormData(prev => ({
        ...prev,
        birthdate: displayValue
      }));
    }}
  />
</div>

              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4 mb-2">
              <div className="lable">જન્મ સમય</div>
              <div className="inputOuter">
                <input
                  type="text"
                  className="form-control"
                  id="bdaytime"
                  name="bdaytime"
                  value={formData.bdaytime}
                  onChange={handleInputChange}
                  placeholder="જન્મ સમય દાખલ કરો (HH:MM)"
                />
              </div>
            </div>
            <div className="col-lg-2 mb-2">
              <div className="lable">AM/PM</div>
              <div className="inputOuter">
                <select
                  className="form-control"
                  id="bdaytimeampm"
                  name="bdaytimeampm"
                  value={formData.bdaytimeampm}
                  onChange={handleInputChange}
                >
                  <option value="am">AM</option>
                  <option value="pm">PM</option>
                </select>
              </div>
            </div>
            <div className="col-lg-6 mb-2">
              <div className="lable">જન્મ સ્થળ</div>
              <div className="inputOuter">
                <input
                  type="text"
                  className="form-control"
                  id="birthdateplace"
                  name="birthdateplace"
                  value={formData.birthdateplace}
                  onChange={handleInputChange}
                  placeholder="તમારું જન્મ સ્થળ દાખલ કરો"
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-6 mb-2">
              <div className="lable">
                સેટ મ-પિન{' '}
                <span
                  style={{
                    fontSize: '12px',
                    color: '#6b6b6b',
                    fontWeight: 'normal'
                  }}
                >
                  (6 digits required)
                </span>
              </div>
              <div className="inputOuter">
                <input
                  type="text"
                  className="form-control"
                  id="mpin"
                  name="mpin"
                  pattern="[0-9]{1,6}"
                  maxLength={6}
                  minLength={6}
                  value={formData.mpin}
                  onChange={handleInputChange}
                  placeholder="તમારો 6 અંકનો મ-પિન દાખલ કરો"
                  required
                />
              </div>
            </div>
            <div className="col-lg-6" />
          </div>

          <div className="d-flex genderBox">
            <label className="innerGender">
              <div className="nameBox">
                <Image src="/images/ico-man.svg" alt="Male gender option" width={20} height={20} />{' '}
                પુરુષ
              </div>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={handleInputChange}
              />
              <span className="checkmark"></span>
            </label>
            <label className="innerGender">
              <div className="nameBox">
                <Image
                  src="/images/ico-female.svg"
                  alt="Female gender option"
                  width={20}
                  height={20}
                />{' '}
                સ્ત્રી
              </div>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={handleInputChange}
              />
              <span className="checkmark"></span>
            </label>
            <label className="innerGender">
              <div className="nameBox">
                <Image
                  src="/images/ico-lesbian.svg"
                  alt="Other gender option"
                  width={20}
                  height={20}
                />{' '}
                અન્ય
              </div>
              <input
                type="radio"
                name="gender"
                value="other"
                checked={formData.gender === 'other'}
                onChange={handleInputChange}
              />
              <span className="checkmark"></span>
            </label>
          </div>

          <div className="profileBtn">
            <button
  type="button"
  className="btn-gstv"
  onClick={handleSubmit}
  disabled={saveLoading}
>
  {saveLoading ? "સેવિંગ..." : "સેવ પ્રોફાઇલ"}
</button>

<button
  type="button"
  className="btn-gstv btn-danger"
  onClick={handleDeleteAccount}
  disabled={deleteLoading}
>
  {deleteLoading ? "ડેલેટિંગ..." : "ડિલીટ એકાઉન્ટ"}
</button>
          </div>
        </div>
      </div>

    </>
  );
}
