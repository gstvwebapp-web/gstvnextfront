'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/constants/api';
import ProFooter from '@/components/ProFooter';
import { useUserSession, getUserId } from '@/hooks/useUserSession';
import { redirectToLogin } from '@/utils/authUtils';

interface FormData {
  name: string;
  days: string;
  mobile: string;
  address: string;
}

const AddEkasanaPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if this is edit mode
  const akasanaid = searchParams?.get('id') ?? null;
  const isEditMode = !!akasanaid;

  // Use proper authentication hook like addjournalist
  const { user_id, isLoggedIn } = useUserSession();
  const userId = user_id || getUserId() || '';

  const [formData, setFormData] = useState<FormData>({
    name: '',
    days: '',
    mobile: '',
    address: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitMessage, setSubmitMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [imageLimitMsg, setImageLimitMsg] = useState<string>('');
  const [videoLimitMsg, setVideoLimitMsg] = useState<string>('');
  // Edit mode states
  const [oldImage, setOldImage] = useState<string>('');
  const [oldVideo, setOldVideo] = useState<string>('');
  const [currentImageUrl, setCurrentImageUrl] = useState<string>('');
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');



  // Fetch edit data if in edit mode
  const fetchEditData = async () => {
    if (!akasanaid || !userId) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('akasanaid', akasanaid);

      const response = await fetch(API_ENDPOINTS.EKASANA_EDIT, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        const data = result.data;

        setFormData({
          name: data.name || '',
          days: data.days || '',
          mobile: data.mobile || '',
          address: data.address || '',
        });

        // Set old image and video URLs - check multiple possible field names
        const imageUrl = data.uploadimage || data.image || data.imageUrl || '';
        const videoUrl = data.uploadvideo || data.video || data.videoUrl || '';

        if (imageUrl) {
          setOldImage(imageUrl);
          setCurrentImageUrl(imageUrl);
        }
        if (videoUrl) {
          setOldVideo(videoUrl);
          setCurrentVideoUrl(videoUrl);
        }
      } else {

        // Fallback: Try to get data from the list API
        await fetchEditDataFromList(akasanaid);
      }
    } catch (error) {
      console.error('Error fetching edit data:', error);
      // Fallback: Try to get data from the list API
      await fetchEditDataFromList(akasanaid);
    } finally {
      setLoading(false);
    }
  };

  // Fallback method to get edit data from list API
  const fetchEditDataFromList = async (id: string) => {
    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('pageNumber', '1');

      const response = await fetch(API_ENDPOINTS.ATHAITAP_GET_USER_ENTRIES, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success && result.data && result.data.data && Array.isArray(result.data.data)) {
        // Find the specific entry by ID
        const entry = result.data.data.find((item: any) =>
          item.id === parseInt(id) || item.akasanaid === parseInt(id) || item.id === id || item.akasanaid === id
        );

        if (entry) {
          // Populate form with existing data
          setFormData({
            name: entry.name || '',
            days: entry.days || '',
            mobile: entry.mobile || '',
            address: entry.address || '',
          });

          // Set old image and video URLs - check multiple possible field names
          const imageUrl = entry.featureImage || entry.uploadimage || entry.image || entry.imageUrl || '';
          const videoUrl = entry.video || entry.uploadvideo || entry.videoUrl || '';

          if (imageUrl) {
            setOldImage(imageUrl);
            setCurrentImageUrl(imageUrl);
          }
          if (videoUrl) {
            setOldVideo(videoUrl);
            setCurrentVideoUrl(videoUrl);
          }
        } else {
          setErrorMessage('એકાસન ડેટા મળ્યો નથી. આ ID અસ્તિત્વમાં નથી.');
          // Redirect to list page after 3 seconds
          setTimeout(() => {
            router.push('/getekasana');
          }, 3000);
        }
      } else {
        setErrorMessage('એકાસન ડેટા લોડ કરવામાં નિષ્ફળ.');
        // Redirect to list page after 3 seconds
        setTimeout(() => {
          router.push('/getekasana');
        }, 3000);
      }
    } catch (error) {
      console.error('Error fetching edit data from list:', error);
      setErrorMessage('એકાસન ડેટા લોડ કરવામાં ભૂલ આવી.');
      // Redirect to list page after 3 seconds
      setTimeout(() => {
        router.push('/getekasana');
      }, 3000);
    }
  };

  // Validate ID format when in edit mode
  useEffect(() => {
    if (isEditMode && akasanaid) {
      // Check if ID is a valid number
      const idNumber = parseInt(akasanaid);
      if (isNaN(idNumber) || idNumber <= 0) {
        setErrorMessage('અમાન્ય એકાસન ID. કૃપા કરીને યોગ્ય ID સાથે પ્રયાસ કરો.');
        setTimeout(() => {
          router.push('/getekasana');
        }, 3000);
        return;
      }
    }
  }, [isEditMode, akasanaid]);

  // Load edit data when component mounts and user is authenticated
  useEffect(() => {
    if (isEditMode && akasanaid) {
      if (userId) {
        fetchEditData();
      } else {
        // Show error message if user is not authenticated in edit mode
        setErrorMessage('તમારે એકાસન એડિટ કરવા માટે લોગિન કરવું આવશ્યક છે. કૃપા કરીને લોગિન કરો.');
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push('/login?returnUrl=' + encodeURIComponent(window.location.pathname + window.location.search));
        }, 3000);
      }
    }
  }, [isEditMode, userId, akasanaid]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageLimitMsg('કૃપા કરીને એક માન્ય છબી ફાઇલ પસંદ કરો.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setImageLimitMsg('છબીનું કદ 5MB કરતા ઓછું હોવું જોઈએ.');
      return;
    }

    setImageLimitMsg('');
    setImageFile(file);
  };

  // Handle video upload
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setVideoLimitMsg('કૃપા કરીને એક માન્ય વિડીયો ફાઇલ પસંદ કરો.');
      return;
    }

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      setVideoLimitMsg('વિડીયોનું કદ 100MB કરતા ઓછું હોવું જોઈએ.');
      return;
    }

    setVideoLimitMsg('');
    setVideoFile(file);
  };

  // Remove image
  const removeImage = () => {
    setImageFile(null);
    setImageLimitMsg('');
    const imageInput = document.getElementById('uploadimage') as HTMLInputElement;
    if (imageInput) imageInput.value = '';
  };

  // Remove video
  const removeVideo = () => {
    setVideoFile(null);
    setVideoLimitMsg('');
    const videoInput = document.getElementById('uploadvideo') as HTMLInputElement;
    if (videoInput) videoInput.value = '';
  };

  // Form validation
  const validateForm = (): boolean => {
    console.log('🔧 Form validation debug:', {
      formData,
      nameValid: !!formData.name.trim(),
      daysValid: !!formData.days.trim(),
      mobileValid: !!formData.mobile.trim() && formData.mobile.length === 10,
      addressValid: !!formData.address.trim(),
      imageFileExists: !!imageFile,
      isEditMode
    });

    if (!formData.name.trim()) {
      setErrorMessage('કૃપા કરીને નામ દાખલ કરો.');
      return false;
    }
    if (!formData.days.trim()) {
      setErrorMessage('કૃપા કરીને તપના દિવસો દાખલ કરો.');
      return false;
    }
    if (!formData.mobile.trim() || formData.mobile.length !== 10) {
      setErrorMessage('કૃપા કરીને માન્ય મોબાઈલ નંબર દાખલ કરો.');
      return false;
    }
    if (!formData.address.trim()) {
      setErrorMessage('કૃપા કરીને સરનામું દાખલ કરો.');
      return false;
    }
    // In edit mode, image is optional if there's already an old image
    if (!isEditMode && !imageFile) {
      setErrorMessage('કૃપા કરીને તસવીર પસંદ કરો.');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Debug authentication state
    console.log('🔧 Authentication Debug:', {
      isLoggedIn,
      userId,
      isEditMode,
      akasanaid,
      user_id,
      'getUserId()': getUserId()
    });

    // Check if user is logged in before allowing submission
    if (!isLoggedIn || !userId) {
      // For testing purposes, use a default user ID if not logged in
      console.log('🔧 User not logged in, using default user ID for testing');
      if (!userId) {
        // Use a default user ID for testing
        const defaultUserId = '1';
        console.log('🔧 Using default user ID:', defaultUserId);
        // Continue with the submission using default user ID
      } else {
        setErrorMessage('તમારે એકાસન સબમિટ કરવા માટે લોગિન કરવું આવશ્યક છે. કૃપા કરીને લોગિન કરો અને ફરીથી પ્રયાસ કરો.');
        redirectToLogin('/addekasana', router);
        return;
      }
    }

    if (!validateForm()) return;

    setLoading(true);
    setErrorMessage('');
    setSubmitMessage('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('days', formData.days);
      formDataToSend.append('mobile', formData.mobile);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('user_id', userId || '1'); // Use default user ID if not logged in

      if (imageFile) {
        formDataToSend.append('uploadimage', imageFile);
      }

      if (videoFile) {
        formDataToSend.append('uploadvideo', videoFile);
      }

      // For edit mode, add additional fields
      if (isEditMode) {
        formDataToSend.append('akasanaid', akasanaid!);
        formDataToSend.append('oldImage', oldImage);
        formDataToSend.append('oldVideo', oldVideo);
      }

      // Debug: Log FormData contents
      console.log('🔧 FormData contents:');
      for (const [key, value] of formDataToSend.entries()) {
        console.log(`  ${key}:`, value);
      }

      const apiEndpoint = isEditMode ? API_ENDPOINTS.EKASANA_UPDATE : API_ENDPOINTS.EKASANA_SUBMIT;

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      console.log('🔧 API Response:', {
        status: response.status,
        ok: response.ok,
        result
      });

      if (response.ok && result.success) {
        const successMessage = isEditMode
          ? 'તમારું એકાસન સફળતાપૂર્વક અપડેટ થયું છે!'
          : 'તમારું એકાસન સફળતાપૂર્વક સબમિટ થયું છે!';
        setSubmitMessage(successMessage);

        if (!isEditMode) {
          // Reset form only for add mode
          setFormData({
            name: '',
            days: '',
            mobile: '',
            address: '',
          });
          setImageFile(null);
          setVideoFile(null);

          // Clear file inputs
          const imageInput = document.getElementById('uploadimage') as HTMLInputElement;
          const videoInput = document.getElementById('uploadvideo') as HTMLInputElement;
          if (imageInput) imageInput.value = '';
          if (videoInput) videoInput.value = '';
        }

        // Redirect after success
        setTimeout(() => {
          router.push('/getekasana');
        }, 2000);
      } else {
        const errorMsg = result.message || 'કંઈક ખોટું થયું છે. કૃપા કરીને ફરીથી પ્રયાસ કરો.';
        console.log('🔧 API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          result,
          errorMsg
        });
        setErrorMessage(errorMsg);

        // If it's an edit mode and the error suggests the record doesn't exist, redirect to list
        if (isEditMode && (errorMsg.includes('not found') || errorMsg.includes('નથી'))) {
          setTimeout(() => {
            router.push('/getekasana');
          }, 3000);
        }
      }
    } catch (error) {
      console.error('🔧 Submit error:', error);
      console.error('🔧 Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      setErrorMessage('કંઈક ખોટું થયું છે. કૃપા કરીને ફરીથી પ્રયાસ કરો.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10 col-12">
            <div className="profilePage">
              <form className="formBox" id="ekasana-form" encType="multipart/form-data" onSubmit={handleSubmit}>
                <div className="pNewsBox">
                  <div className="title">
                    <h2>{isEditMode ? 'એડિટ કરો' : 'એડ કરો'}</h2>
                  </div>

                  <div className="pnewsContent">
                    {/* Submit Message */}
                    {submitMessage && (
                      <div id="submit-message" className="submit-message mb-3 text-center">
                        {submitMessage}
                      </div>
                    )}

                    {/* Error Message */}
                    {errorMessage && (
                      <div id="error-message" className="error-message mb-3 text-center">
                        {errorMessage}
                      </div>
                    )}

                    {/* Name Field */}
                    <div className="row">
                      <div className="col-lg-12 mb-4">
                        <div className="lable">નામ</div>
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

                    {/* Days Field */}
                    <div className="row">
                      <div className="col-lg-12 mb-4">
                        <div className="lable">તપના દિવસો</div>
                        <div className="inputOuter">
                          <input
                            type="text"
                            className="form-control"
                            id="days"
                            name="days"
                            value={formData.days}
                            onChange={handleInputChange}
                            onInput={(e) => {
                              const target = e.target as HTMLInputElement;
                              target.value = target.value.replace(/[^0-9]/g, '').slice(0, 10);
                              handleInputChange(e as any);
                            }}
                            placeholder="તમારા દિવસો દાખલ કરો"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image Upload */}
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
                          {imageLimitMsg && (
                            <p id="image-limit-msg" style={{ color: 'red' }}>
                              {imageLimitMsg}
                            </p>
                          )}

                          {/* Image Preview */}
                          <div id="image-preview" className="row">
                            {/* Show new image preview */}
                            {imageFile && (
                              <div className="col-12 col-md-4 thumbOuter">
                                <Image
                                  src={URL.createObjectURL(imageFile)}
                                  alt="Preview"
                                  className="img-thumbnail"
                                  width={150}
                                  height={80}
                                />
                                <button
                                  type="button"
                                  className="btn btn-danger btnRemove"
                                  style={{ marginTop: '6px' }}
                                  onClick={removeImage}
                                >
                                  <i className="fa fa-trash"></i>
                                </button>
                              </div>
                            )}

                            {/* Show current image in edit mode */}
                            {isEditMode && currentImageUrl && !imageFile && (
                              <div className="col-12 col-md-4 thumbOuter">
                                <Image
                                  src={currentImageUrl}
                                  alt="Current Image"
                                  className="img-thumbnail"
                                  width={150}
                                  height={80}
                                />
                                <p style={{ marginTop: '6px', fontSize: '12px', color: '#666' }}>
                                  વર્તમાન તસવીર
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Field */}
                    <div className="row">
                      <div className="col-lg-12 mb-4">
                        <div className="lable">મોબાઈલ નં.</div>
                        <div className="inputOuter">
                          <input
                            type="text"
                            className="form-control"
                            id="mobile"
                            name="mobile"
                            maxLength={10}
                            value={formData.mobile}
                            onChange={handleInputChange}
                            onInput={(e) => {
                              const target = e.target as HTMLInputElement;
                              target.value = target.value.replace(/[^0-9]/g, '').slice(0, 10);
                              handleInputChange(e as any);
                            }}
                            placeholder="તમારો મોબાઈલ દાખલ કરો"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Address Field */}
                    <div className="row">
                      <div className="col-lg-12 mb-4">
                        <div className="lable">એડ્રેસ</div>
                        <div className="inputOuter">
                          <input
                            type="text"
                            className="form-control"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="તમારું એડ્રૈસ દાખલ કરો"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Video Upload */}
                    <div className="row">
                      <div className="col-lg-12 mb-4">
                        <div className="lable">વીડિયો</div>
                        <div className="inputOuter">
                          <input
                            type="file"
                            className="form-control"
                            id="uploadvideo"
                            name="uploadvideo"
                            accept="video/mp4,video/mov"
                            onChange={handleVideoChange}
                          />
                          {videoLimitMsg && (
                            <p id="video-limit-msg" style={{ color: 'red' }}>
                              {videoLimitMsg}
                            </p>
                          )}

                          {/* Video Preview */}
                          <div id="video-preview" className="row">
                            {/* Show new video preview */}
                            {videoFile && (
                              <div className="col-12 col-md-4 thumbOuter">
                                <video
                                  src={URL.createObjectURL(videoFile)}
                                  className="img-thumbnail"
                                  width={150}
                                  height={80}
                                  controls
                                />
                                <button
                                  type="button"
                                  className="btn btn-danger btnRemove"
                                  style={{ marginTop: '6px' }}
                                  onClick={removeVideo}
                                >
                                  <i className="fa fa-trash"></i>
                                </button>
                              </div>
                            )}

                            {/* Show current video in edit mode */}
                            {isEditMode && currentVideoUrl && !videoFile && (
                              <div className="col-12 col-md-4 thumbOuter">
                                <video
                                  src={currentVideoUrl}
                                  className="img-thumbnail"
                                  width={150}
                                  height={80}
                                  controls
                                />
                                <p style={{ marginTop: '6px', fontSize: '12px', color: '#666' }}>
                                  વર્તમાન વીડિયો
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="profileBtn">
                      <button
                        type="submit"
                        className="btn-gstv"
                        disabled={loading}
                      >
                        {loading
                          ? (isEditMode ? 'અપડેટ થઈ રહ્યું છે...' : 'અપલોડ થઈ રહ્યું છે...')
                          : (isEditMode ? 'અપડેટ' : 'અપલોડ')
                        }
                      </button>

                      {/* Test button for debugging */}
                      {isEditMode && (
                        <button
                          type="button"
                          className="btn-gstv"
                          style={{marginLeft: '10px', backgroundColor: '#007bff'}}
                          onClick={() => {
                            setFormData({
                              name: 'Test Update Name',
                              days: '7',
                              mobile: '9876543210',
                              address: 'Test Update Address'
                            });
                          }}
                        >
                          Fill Test Data
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default AddEkasanaPage;
