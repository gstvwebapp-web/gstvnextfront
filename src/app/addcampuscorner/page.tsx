'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Editor } from '@tinymce/tinymce-react';
import { API_ENDPOINTS } from '@/constants/api';
import Script from 'next/script';
import ProFooter from '@/components/ProFooter';
import { useUserSession, getUserId } from '@/hooks/useUserSession';
import { redirectToLogin } from '@/utils/authUtils';

import { useSettings } from '@/hooks/useSettings';

interface FormData {
  name: string;
  title: string;
  description: string;
  city: string;
  school: string;
  agree_status: boolean;
}

interface EditData {
  id: string;
  name: string;
  title: string;
  description: string;
  city: string;
  school: string;
  images?: string[];
  video?: string;
}

const AddCampusCornerPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user_id, isLoggedIn } = useUserSession();

  const editId = searchParams?.get("id") ?? null;
  const isEditMode = !!editId;
  const userId = user_id || getUserId() || '';

  const [formData, setFormData] = useState<FormData>({
    name: '',
    title: '',
    description: '',
    city: '',
    school: '',
    agree_status: false,
  });

  const [imageArray, setImageArray] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [submitMessage, setSubmitMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [imageLimitMsg, setImageLimitMsg] = useState<string>('');
  const [videoLimitMsg, setVideoLimitMsg] = useState<string>('');
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  // Edit mode states
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingVideo, setExistingVideo] = useState<string>('');
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [removeVideoFlag, setRemoveVideoFlag] = useState<boolean>(false);

  // Refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Agreement text from Category Settings (dynamic), with fallback
  const { settings } = useSettings();
  const agreeText = settings?.campus_agree_text || "હું સહમત છું કે મારા દ્વારા અપલોડ કરવામાં આવતી સામગ્રી કોઈપણ પ્રકારની વાંધાજનક, અશ્લીલ, હિંસક કે ગેરકાયદેસર નથી. જો આવી કોઈ સામગ્રી મળશે તો તેની સંપૂર્ણ જવાબદારી મારી રહેશે.";

  // Authentication check - wait for auth state to be properly loaded
  useEffect(() => {
    const checkAuth = async () => {
      // Give time for authentication state to load from localStorage
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check both hook state and localStorage directly
      const storedLoginStatus = typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') === 'true' : false;
      const storedUserSession = typeof window !== 'undefined' ? localStorage.getItem('userSession') : null;
      const isActuallyLoggedIn = isLoggedIn || (storedLoginStatus && !!storedUserSession);

    

      if (!isActuallyLoggedIn) {
        console.log('🔐 User not authenticated, redirecting to login');
        const currentPath = `/addcampuscorner${editId ? `?id=${editId}` : ''}`;
        redirectToLogin(currentPath, router);
        return;
      }

      console.log('✅ User authenticated, proceeding with Campus Corner page');
      setAuthChecked(true);
    };

    checkAuth();
  }, [isLoggedIn, userId, router, editId]);

  // Load edit data
  useEffect(() => {
    if (isEditMode && editId && authChecked) {
      loadEditData();
    }
  }, [isEditMode, editId, authChecked]);

  // Load edit data function
  const loadEditData = async () => {
    try {
      setLoading(true);

      // Get user ID from multiple sources
      const storedUserSession = typeof window !== 'undefined' ? localStorage.getItem('userSession') : null;
      const actualUserId = userId || (storedUserSession ? JSON.parse(storedUserSession).userData?.user_id || JSON.parse(storedUserSession).userData?.id : null);

      

      const response = await fetch(API_ENDPOINTS.CAMPUS_CORNER_EDIT, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: actualUserId,
          campuscornerid: editId
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const entry = result.data;

        setFormData({
          name: entry.name || '',
          title: entry.title || '',
          description: entry.description || '',
          city: entry.city || '',
          school: entry.school || '',
          agree_status: true,
        });

        // Handle existing images
        if (entry.featureImage) {
          let images = [];
          if (typeof entry.featureImage === 'string') {
            try {
              images = JSON.parse(entry.featureImage);
            } catch (e) {
              images = [entry.featureImage];
            }
          } else if (Array.isArray(entry.featureImage)) {
            images = entry.featureImage;
          }
          setExistingImages(images);
        }

        // Handle existing video
        if (entry.video) {
          setExistingVideo(entry.video);
        }
      } else {
        setErrorMessage('કેમ્પસ કોર્નર ડેટા લોડ કરવામાં નિષ્ફળ.');
      }
    } catch (error) {
      
      setErrorMessage('કેમ્પસ કોર્નર ડેટા લોડ કરવામાં નિષ્ફળ.');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle image file changes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxImages = 5;

    setImageLimitMsg('');

    if (imageArray.length + files.length > maxImages) {
      setImageLimitMsg('તમે વધુમાં વધુ 5 છબીઓ અપલોડ કરી શકો છો.');
      return;
    }

    const newImages = [...imageArray];
    for (const file of files) {
      if (newImages.length >= maxImages) break;
      if (!file.type.startsWith('image/')) continue;
      newImages.push(file);
    }

    setImageArray(newImages);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  // Handle video file change
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setVideoLimitMsg('');

    if (!file) {
      setVideoFile(null);
      return;
    }

    if (!['video/mp4', 'video/quicktime'].includes(file.type)) {
      setVideoLimitMsg('ફક્ત MP4 અથવા MOV ને જ મંજૂરી છે.');
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
      setVideoFile(null);
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setVideoLimitMsg('વિડીયો 100MB થી વધુ ન હોવો જોઈએ.');
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
      setVideoFile(null);
      return;
    }

    setVideoFile(file);
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = imageArray.filter((_, i) => i !== index);
    setImageArray(newImages);
  };

  // Remove video
  const removeVideo = () => {
    setVideoFile(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  // Remove existing image
  const removeExistingImage = (imageUrl: string) => {
    setRemovedImages(prev => [...prev, imageUrl]);
    setExistingImages(prev => prev.filter(img => img !== imageUrl));
  };

  // Remove existing video
  const removeExistingVideo = () => {
    setRemoveVideoFlag(true);
    // Don't clear existingVideo state - we need it for API call
    // The display will be hidden by the condition check
  };

  // Validation function
  const validateForm = (): boolean => {
    setError('');

    // Calculate available media after considering removals
    const remainingImages = existingImages.filter(img => !removedImages.includes(img));
    const remainingVideo = existingVideo && !removeVideoFlag ? existingVideo : null;
    const totalAvailableImages = imageArray.length + remainingImages.length;
    const hasAnyMedia = totalAvailableImages > 0 || videoFile || remainingVideo;

    // Debug logging
    console.log('Validation Debug:', {
      isEditMode,
      existingImages: existingImages.length,
      removedImages: removedImages.length,
      remainingImages: remainingImages.length,
      existingVideo: !!existingVideo,
      removeVideoFlag,
      remainingVideo: !!remainingVideo,
      newImages: imageArray.length,
      newVideo: !!videoFile,
      totalAvailableImages,
      hasAnyMedia
    });

    // For new submissions, all fields are required
    // For edit mode, only validate if we're removing all existing data
    const hasRemainingOldData = isEditMode && (remainingImages.length > 0 || remainingVideo);
    const shouldValidateAllFields = !isEditMode || !hasRemainingOldData;

    if (shouldValidateAllFields) {
      if (!formData.name.trim()) {
        setError('તમારું નામ દાખલ કરો.');
        return false;
      }

      if (!formData.title.trim()) {
        setError('કૃપા કરીને ટાઇટલ દાખલ કરો.');
        return false;
      }

      if (!formData.school.trim()) {
        setError('કૃપા કરીને તમારી શાળાનું નામ દાખલ કરો.');
        return false;
      }

      if (!formData.city.trim()) {
        setError('કૃપા કરીને તમારું શહેર દાખલ કરો.');
        return false;
      }

      if (!formData.description.trim()) {
        setError('કૃપા કરીને વર્ણન દાખલ કરો.');
        return false;
      }
    }

    // Agreement is always required
    if (!formData.agree_status) {
      setError('કૃપા કરીને નિયમો અને શરતો સાથે સંમત થાઓ.');
      return false;
    }

    // Media validation: at least one image or video is required
    if (!hasAnyMedia) {
      setError('કૃપા કરીને ઓછામાં ઓછી એક છબી અથવા વિડીયો અપલોડ કરો.');
      return false;
    }

    // For new submissions, ensure we have new media (not just existing)
    if (!isEditMode && imageArray.length === 0 && !videoFile) {
      setError('કૃપા કરીને નવી સબમિશન માટે ઓછામાં ઓછી એક છબી અથવા વિડીયો અપલોડ કરો.');
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check authentication before proceeding - check both hook and localStorage
    const storedLoginStatus = typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') === 'true' : false;
    const storedUserSession = typeof window !== 'undefined' ? localStorage.getItem('userSession') : null;
    const isActuallyLoggedIn = isLoggedIn || (storedLoginStatus && !!storedUserSession);
    const actualUserId = userId || (storedUserSession ? JSON.parse(storedUserSession).userData?.user_id || JSON.parse(storedUserSession).userData?.id : null);

   

    if (!isActuallyLoggedIn || !actualUserId) {
      setErrorMessage('કેમ્પસ કોર્નર એન્ટ્રી સબમિટ કરવા માટે તમારે લોગ ઇન થયેલ હોવું આવશ્યક છે. કૃપા કરીને લોગ ઇન કરો અને ફરી પ્રયાસ કરો.');
      const currentPath = `/addcampuscorner${editId ? `?id=${editId}` : ''}`;
      redirectToLogin(currentPath, router);
      return;
    }

    setLoading(true);
    setError('');
    setErrorMessage('');
    setSubmitMessage('');

    try {
      const submitData = new FormData();

      // Add form fields in the exact order as working Postman example
      submitData.append('name', formData.name.trim());
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('city', formData.city.trim());

      // Add edit mode specific data
      if (isEditMode && editId) {
        submitData.append('campuscornerid', editId);
      }

      // Add new images - ensure at least one image for new submissions
      if (imageArray.length > 0) {
        imageArray.forEach((image, index) => {
          // Use correct field name: uploadimages[] (plural, as expected by API)
          submitData.append('uploadimages[]', image);
        });
      }

      // Add video if present
      if (videoFile) {
        submitData.append('uploadvideo', videoFile);
      }

      // Add remaining fields in correct order (matching Postman example)
      submitData.append('user_id', actualUserId);
      submitData.append('agree_status', formData.agree_status ? '1' : '0');
      submitData.append('school', formData.school.trim());

      // For edit mode, handle existing media and removals
      if (isEditMode) {
        // Send existing images that should be preserved (not removed)
        const preservedImages = existingImages.filter(img => !removedImages.includes(img));
        if (preservedImages.length > 0) {
          submitData.append('oldImages', JSON.stringify(preservedImages));
        }

        // Send existing video if it should be preserved (not removed)
        if (existingVideo && !removeVideoFlag) {
          submitData.append('oldVideo', existingVideo);
        }
      }

      // Use the correct endpoint based on mode
      const endpoint = isEditMode ? API_ENDPOINTS.CAMPUS_CORNER_UPDATE : API_ENDPOINTS.CAMPUS_CORNER_SUBMIT;



      const response = await fetch(endpoint, {
        method: 'POST',
        body: submitData,
      });

     

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
          console.error('📡 HTTP Error Response:', errorText);

          // Check if it's an HTML error page (like Laravel error page)
          if (errorText.includes('<!doctype html>') || errorText.includes('<html')) {
            // Extract error message from HTML if possible
            const errorMatch = errorText.match(/Illuminate\\Database\\QueryException: (.+?) \(/);
            if (errorMatch) {
              setErrorMessage(`Database error: ${errorMatch[1]}`);
            } else {
              setErrorMessage(`Server error: ${response.status}. કૃપા કરીને તમારા ફોર્મ ડેટાને તપાસો અને ફરી પ્રયાસ કરો.`);
            }
          } else {
            // Try to parse as JSON for more details
            try {
              const errorJson = JSON.parse(errorText);
             
              setErrorMessage(`Server error: ${response.status}. ${errorJson.message || errorJson.error || 'Please try again.'}`);
            } catch {
              setErrorMessage(`Server error: ${response.status}. ${errorText || 'ફરી પ્રયાસ કરો.'}`);
            }
          }
        } catch (textError) {
         
          setErrorMessage(`Server error: ${response.status}. ફરી પ્રયાસ કરો.`);
        }
        setLoading(false);
        return;
      }

      const result = await response.json();
     
      if (result.success) {
        
        setSubmitMessage(isEditMode ? 'કેમ્પસ કોર્નર સફળતાપૂર્વક અપડેટ થયું છે!' : 'કેમ્પસ કોર્નર સફળતાપૂર્વક ઉમેર્યું છે!');

        if (!isEditMode) {
          // Reset form only for add mode
          setFormData({
            name: '',
            title: '',
            description: '',
            city: '',
            school: '',
            agree_status: false,
          });
          setImageArray([]);
          setVideoFile(null);
        }

        // Redirect after success
        setTimeout(() => {
          router.push('/getcampuscorner');
        }, 2000);
      } else {
       
        setErrorMessage(result.message || `Failed to ${isEditMode ? 'update' : 'add'} કેમ્પસ કોર્નર. ફરી પ્રયાસ કરો.`);
      }

    } catch (err) {
     
      setErrorMessage(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}. ફરી પ્રયાસ કરો.`);
    } finally {
      setLoading(false);
    }
  };

  // Hide message after timeout
  const hideMessageAfterTimeout = (setter: React.Dispatch<React.SetStateAction<string>>, timeout = 2000) => {
    setTimeout(() => setter(''), timeout);
  };

  useEffect(() => {
    if (submitMessage) {
      hideMessageAfterTimeout(setSubmitMessage);
    }
    if (errorMessage) {
      hideMessageAfterTimeout(setErrorMessage);
    }
  }, [submitMessage, errorMessage]);

  // Show loading while initializing
  if (!authChecked) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column'
        }}
      >
        <div
          className="spinner-border text-danger"
          style={{ width: '3rem', height: '3rem' }}
          role="status"
        >
          <span className="sr-only">લોડ થઈ રહ્યું છે...</span>
        </div>
        <p style={{ marginTop: '10px' }}>લોડ થઈ રહ્યું છે...</p>
      </div>
    );
  }

  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="profilePage">
              <form className="formBox" id="news-form" encType="multipart/form-data" onSubmit={handleSubmit}>
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
                {(errorMessage || error) && (
                  <div id="error-message" className="error-message mb-3 text-center">
                    {errorMessage || error}
                  </div>
                )}

                {/* Name and Title Fields */}
                <div className="row">
                  <div className="col-lg-6 mb-4">
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
                  <div className="col-lg-6 mb-4">
                    <div className="lable">સમાચાર ટાઇટલ</div>
                    <div className="inputOuter">
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="તમારું ટાઇટલ દાખલ કરો"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* School and City Fields */}
                <div className="row">
                  <div className="col-lg-6 mb-4">
                    <div className="lable">શાળા</div>
                    <div className="inputOuter">
                      <input
                        type="text"
                        className="form-control"
                        id="school"
                        name="school"
                        value={formData.school}
                        onChange={handleInputChange}
                        placeholder="તમારી શાળાનું નામ દાખલ કરો"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-6 mb-4">
                    <div className="lable">શહેર</div>
                    <div className="inputOuter">
                      <input
                        type="text"
                        className="form-control"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="તમારું શહેર દાખલ કરો"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Description Field */}
                <div className="row">
                  <div className="col-lg-12 mb-4">
                    <div className="lable">ડિસ્ક્રીપ્શન</div>
                    <div className="inputOuter">
                        <Editor
                        tinymceScriptSrc="/assets/vendor/tinymce/tinymce.min.js"
                        value={formData.description}
                        onEditorChange={(content) => {
                          setFormData(prev => ({
                            ...prev,
                            description: content
                          }));
                        }}
                        init={{
                          height: 300,
                          menubar: true,
                          plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
                            'anchor', 'searchreplace', 'visualblocks', 'fullscreen',
                            'insertdatetime', 'table', 'help', 'wordcount',
                            'image', 'media', 'imagetools'
                          ],
                          toolbar:
                            'undo redo | blocks | bold italic forecolor | alignleft aligncenter ' +
                            'alignright alignjustify | bullist numlist outdent indent | ' +
                            'image media | removeformat | help',
                          branding: false,
                          placeholder: 'વર્ણન દાખલ કરો',

                          /* ⭐ Enables image upload */
                          images_upload_url: '/api/upload/tinymce',

                          /* ⭐ Handle base64 fallback */
                          automatic_uploads: true,
                          images_upload_handler: ((
                        blobInfo: any,
                        success: any,
                        failure: any,
                        progress: any
                      ) => {
                        (async () => {
                          try {
                            const formData = new FormData();
                            formData.append("file", blobInfo.blob(), blobInfo.filename());

                            const res = await fetch("/api/upload/tinymce", {
                              method: "POST",
                              body: formData
                            });

                            const json = await res.json();
                            success(json.location);
                          } catch (err) {
                            failure("Upload failed");
                          }
                        })();
                      }) as any,

                          /* ⭐ Allow video embed */
                          media_live_embeds: true,
                        }}
                      />

                    </div>
                  </div>
                </div>

                {/* Images Upload */}
                <div className="row">
                  <div className="col-lg-12 mb-4">
                    <div className="lable">તસવીરો (ઓછામાં ઓછી ૧, મહત્તમ ૫ છબી અપલોડ)</div>
                    <div className="inputOuter">

                      {/* Existing Images Display */}
                      {isEditMode && existingImages.length > 0 && (
                        <div className="mb-3">
                          <label className="form-label">હાલની છબીઓ:</label>
                          <div className="row">
                            {existingImages.map((imageUrl, index) => (
                              <div key={`existing-${index}`} className="col-6 col-md-3 col-lg-2 thumbOuter">
                                <Image
                                  src={imageUrl}
                                  className="img-thumbnail"
                                  style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                                  alt={`Existing ${index}`}
                                  width={100}
                                  height={80}
                                />
                                <button
                                  type="button"
                                  className="btn btn-danger btnRemove"
                                  style={{ marginTop: '6px' }}
                                  onClick={() => removeExistingImage(imageUrl)}
                                >
                                  <i className="fa fa-trash"></i>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <input
                        type="file"
                        className="form-control"
                        id="uploadimages"
                        name="uploadimages[]"
                        ref={imageInputRef}
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      {imageLimitMsg && (
                        <p className="field-error" style={{ display: 'block' }}>
                          {imageLimitMsg}
                        </p>
                      )}

                      {/* New Image Preview */}
                      <div id="image-preview" className="row">
                        {imageArray.map((file, index) => (
                          <div key={index} className="col-6 col-md-3 col-lg-2 thumbOuter" id={`img-${index}`}>
                            <Image
                              src={URL.createObjectURL(file)}
                              className="img-thumbnail"
                              style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                              alt={`Preview ${index}`}
                              width={100}
                              height={80}
                            />
                            <button
                              type="button"
                              className="btn btn-danger btnRemove"
                              style={{ marginTop: '6px' }}
                              onClick={() => removeImage(index)}
                            >
                              <i className="fa fa-trash"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                      <div id="image-error"></div>
                    </div>
                  </div>
                </div>

                {/* Video Upload */}
                <div className="row">
                  <div className="col-lg-12 mb-4">
                    <div className="lable">વીડિયો (વૈકલ્પિક, ફક્ત mp4/mov, ≤ 100MB)</div>
                    <div className="inputOuter">

                      {/* Existing Video Display */}
                      {isEditMode && existingVideo && !removeVideoFlag && (
                        <div className="mb-3">
                          <label className="form-label">હાલના વિડીયો:</label>
                          <div className="row">
                            <div className="col-12 col-md-4 thumbOuter">
                              <video
                                controls
                                className="img-thumbnail"
                                style={{ width: '100%', height: '120px' }}
                              >
                                <source src={existingVideo} type="video/mp4" />
                              </video>
                              <button
                                type="button"
                                className="btn btn-danger btnRemove"
                                style={{ marginTop: '6px' }}
                                onClick={removeExistingVideo}
                              >
                                <i className="fa fa-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      <input
                        type="file"
                        className="form-control"
                        id="uploadvideo"
                        name="uploadvideo"
                        ref={videoInputRef}
                        accept="video/*"
                        onChange={handleVideoChange}
                      />
                      {videoLimitMsg && (
                        <p className="field-error" style={{ display: 'block' }}>
                          {videoLimitMsg}
                        </p>
                      )}

                      {/* New Video Preview */}
                      <div id="video-preview" className="row">
                        {videoFile && (
                          <div className="col-12 col-md-4 thumbOuter">
                            <video
                              controls
                              className="img-thumbnail"
                              style={{ width: '100%', height: '120px' }}
                            >
                              <source src={URL.createObjectURL(videoFile)} type={videoFile.type} />
                            </video>
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
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <div className="row">
                  <div className="col-lg-12 mb-4">
                    <div className="agree-wrap">
                      <label className="agree-inline">
                        <input
                          type="checkbox"
                          id="agree_status"
                          name="agree_status"
                          checked={formData.agree_status}
                          onChange={handleInputChange}
                        />
                        <div className="agree_checkbox_height" dangerouslySetInnerHTML={{ __html: agreeText }} />
                        {/* <div className="agree_checkbox_height">{agreeText}</div> */}
                      </label>
                    </div>
                    <div id="agree-error"></div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="profileBtn">
                  <button type="submit" className="btn-gstv" disabled={loading}>
                    {loading ? 'અપલોડ થઈ રહ્યું છે...' : 'અપલોડ'}
                  </button>
                </div>
              </div>
            </div>
          </form>
            </div>
          </div>
        </div>
      </div>

      

      {/* Loading Overlay */}
      {loading && (
        <div
          id="loader-overlay"
          style={{
            display: 'block',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255,255,255,0.8)',
            zIndex: 9999,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="spinner-border text-danger"
              style={{ width: '3rem', height: '3rem' }}
              role="status"
            >
              <span className="sr-only">લોડ થઈ રહ્યું છે...</span>
            </div>
            <p style={{ marginTop: '10px' }}>મહેરબાની કરીને રાહ જુઓ...</p>
          </div>
        </div>
      )}
    </>

  );
};

export default AddCampusCornerPage;
