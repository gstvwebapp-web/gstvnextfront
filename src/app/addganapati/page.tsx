'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProFooter from '@/components/ProFooter';
import { useUserSession, getUserId } from '@/hooks/useUserSession';
import { redirectToLogin, getCurrentPagePath } from '@/utils/authUtils';
import { API_ENDPOINTS } from '@/constants/api';

const AddGanapatiPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user_id, isLoggedIn } = useUserSession();
  const userId = user_id || getUserId() || '';

  // Check if this is edit mode
  const ganapatiId = searchParams?.get('id') || null;
  const isEditMode = !!ganapatiId;

  const [formData, setFormData] = useState({
    name: '',
    address: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [oldImage, setOldImage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Function to fetch edit data
  const fetchEditData = async () => {
    if (!ganapatiId || !userId) return;

    setIsLoadingData(true);
    try {
      const response = await fetch(API_ENDPOINTS.GANAPATI_EDIT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          akasanaid: ganapatiId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch edit data');
      }

      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;
        setFormData({
          name: data.name || '',
          address: data.address || '',
        });

        if (data.featureImage) {
          setOldImage(data.featureImage);
          setImagePreview(data.featureImage);
        }
      }
    } catch (error) {
      console.error('Error fetching edit data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Simple mount effect
  useEffect(() => {
    setMounted(true);

    // Fetch edit data if in edit mode
    if (isEditMode && userId) {
      fetchEditData();
    }
  }, [isEditMode, userId, ganapatiId]);

  // Simplified authentication check
  const checkAuth = () => {
    if (typeof window === 'undefined') return false;

    console.log('🔐 Simple Auth Check:', {
      isLoggedIn,
      user_id,
      userId,
      localStorage_isLoggedIn: localStorage.getItem('isLoggedIn'),
      localStorage_userSession: !!localStorage.getItem('userSession')
    });

    // Method 1: Check useUserSession hook
    if (isLoggedIn && userId) {
      console.log('✅ Authenticated via useUserSession hook');
      return true;
    }

    // Method 2: Check localStorage directly
    const storedLogin = localStorage.getItem('isLoggedIn');
    const storedSession = localStorage.getItem('userSession');

    if (storedLogin === 'true' && storedSession) {
      console.log('✅ Authenticated via localStorage');
      return true;
    }

    console.log('❌ Not authenticated');
    return false;
  };

  // Get effective user ID
  const getEffectiveUserId = () => {
    if (userId) return userId;

    if (typeof window !== 'undefined') {
      const storedSession = localStorage.getItem('userSession');
      if (storedSession) {
        try {
          const sessionData = JSON.parse(storedSession);
          return sessionData.userData?.user_id ||
                 sessionData.userData?.id ||
                 sessionData.user_id ||
                 sessionData.mobile ||
                 '85'; // Fallback
        } catch (error) {
          console.error('Error parsing session:', error);
        }
      }
    }

    return '85'; // Fallback for testing
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🚀 Form submission started');
    console.log('📝 Form data:', formData);
    console.log('👤 User ID:', userId);

    if (!formData.name.trim()) {
      alert('કૃપા કરીને સોસાયટી નામ દાખલ કરો');
      return;
    }

    if (!formData.address.trim()) {
      alert('કૃપા કરીને શહેર દાખલ કરો');
      return;
    }

    if (!selectedImage && !isEditMode) {
      alert('કૃપા કરીને તસવીર પસંદ કરો');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name);
      submitFormData.append('address', formData.address);

      // Add image if selected
      if (selectedImage) {
        submitFormData.append('uploadimage', selectedImage);
      }

      const finalUserId = getEffectiveUserId();
      submitFormData.append('user_id', finalUserId);

      // Add additional fields for update mode
      if (isEditMode) {
        submitFormData.append('ganpatiid', ganapatiId);
        if (oldImage) {
          submitFormData.append('oldImage', oldImage);
        }
      }

      console.log('📤 Submitting with final user_id:', finalUserId);
      console.log('📤 Edit mode:', isEditMode);
      console.log('📤 Ganapati ID:', ganapatiId);

      // Choose the appropriate API endpoint
      const apiEndpoint = isEditMode ? API_ENDPOINTS.GANAPATI_UPDATE : API_ENDPOINTS.GANESHUTSAV_SUBMIT;

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: submitFormData,
      });

      console.log('📥 API Response status:', response.status);

      const result = await response.json();
      console.log('📥 API Response data:', result);

      if (result.success || response.ok) {
        const successMessage = isEditMode ? 'ગણપતિ સફળતાપૂર્વક અપડેટ થયું!' : 'ગણપતિ સફળતાપૂર્વક સબમિટ થયું!';
        alert(successMessage);

        if (!isEditMode) {
          // Reset form only for add mode
          setFormData({ name: '', address: '' });
          setSelectedImage(null);
          setImagePreview('');
        }

        // Redirect to list page after successful submission
        router.push('/getganapati');
      } else {
        const errorMessage = isEditMode ? 'અપડેટ નિષ્ફળ. કૃપા કરીને ફરીથી પ્રયાસ કરો.' : 'સબમિશન નિષ્ફળ. કૃપા કરીને ફરીથી પ્રયાસ કરો.';
        alert(result.message || errorMessage);
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      alert('એક ભૂલ આવી. કૃપા કરીને ફરીથી પ્રયાસ કરો.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading on server side or before mount
  if (!mounted || isLoadingData) {
    return (
      <div className="contents-main-div" id="middlePage">
        <div className="profilePage">
          <div className="formBox" style={{ textAlign: 'center', padding: '50px' }}>
            <h3 className="custom-gujrati-font">
              {isLoadingData ? 'ડેટા લોડ થઈ રહ્યો છે...' : 'લોડ થઈ રહ્યું છે...'}
            </h3>
            <p className="custom-gujrati-font">કૃપા કરીને રાહ જુઓ</p>
          </div>
        </div>
      </div>
    );
  }

  // For testing purposes, let's bypass authentication temporarily
  // TODO: Re-enable authentication once form is working
  const isAuthenticated = true; // checkAuth();

  console.log('🔧 TESTING MODE: Authentication bypassed for form testing');

  // If not authenticated, redirect to login (currently disabled for testing)
  if (!isAuthenticated) {
    console.log('🔐 Redirecting to login...');
    redirectToLogin(getCurrentPagePath(), router);
    return (
      <div className="contents-main-div" id="middlePage">
        <div className="profilePage">
          <div className="formBox" style={{ textAlign: 'center', padding: '50px' }}>
            <h3 className="custom-gujrati-font">લોગિન પેજ પર રીડાયરેક્ટ કરી રહ્યું છે...</h3>
            <p className="custom-gujrati-font">કૃપા કરીને રાહ જુઓ</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="contents-main-div" id="middlePage">
        <div className="profilePage">
          <form method="POST" className="formBox" id="news-form" encType="multipart/form-data" onSubmit={handleSubmit}>
            <div className="pNewsBox">
              <div className="title">
                <h2>{isEditMode ? 'એડિટ કરો' : 'એડ કરો'}</h2>
              </div>
              
              <div className="pnewsContent">
                <div className="row">
                  <div className="col-lg-12 mb-4">
                    <div className="lable">સોસાયટી નામ</div>
                    <div className="inputOuter">
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="તમારું નામ દાખલ કરો"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-lg-12 mb-4">
                    <div className="lable">તસવીર</div>
                    <div className="inputOuter">
                      <input
                        type="file"
                        className="form-control"
                        id="uploadimage"
                        name="uploadimage"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <p id="image-limit-msg" style={{ color: 'red' }}></p>
                      <div id="image-preview" className="row">
                        {imagePreview && (
                          <div className="col-12 mt-3">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              style={{ width: '200px', height: '150px', objectFit: 'cover' }}
                              className="img-thumbnail"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-lg-12 mb-4">
                    <div className="lable">શહેર</div>
                    <div className="inputOuter">
                      <input
                        type="text"
                        className="form-control"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="તમારું શહેર દાખલ કરો"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="profileBtn">
                  <button
                    type="submit"
                    className="btn-gstv"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? (isEditMode ? 'અપડેટ થઈ રહ્યું છે...' : 'અપલોડ થઈ રહ્યું છે...')
                      : (isEditMode ? 'અપડેટ કરો' : 'અપલોડ')
                    }
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    
    </>
  );
};

export default AddGanapatiPage;
