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
  agree_status: boolean;
}

interface EditData {
  id: string;
  name: string;
  title: string;
  description: string;
  city: string;
  images?: string[];
  video?: string;
}

const AddJournalistPage: React.FC = () => {
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
    agree_status: false,
  });

  const [imageArray, setImageArray] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [imageLimitMsg, setImageLimitMsg] = useState<string>('');
  const [videoLimitMsg, setVideoLimitMsg] = useState<string>('');
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingVideo, setExistingVideo] = useState<string>('');
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [removeVideoFlag, setRemoveVideoFlag] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  // Dynamic agreement text from Category Settings, with fallback
  const { settings } = useSettings();
  const agreeText = settings?.gujrat_agree_text || 'હું સંમત છું કે મારા દ્વારા અપલોડ કરવામાં આવતી સામગ્રી સંપૂર્ણપણે સત્ય અને વાસ્તવિક છે. જો કોઈ પણ પ્રકારની ખોટી માહિતી મળશે તો તેની સંપૂર્ણ જવાબદારી મારી રહેશે.';

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<any>(null);

  // Initialize page - no authentication required for viewing
  useEffect(() => {
      const checkAuth = async () => {
        // Give time for authentication state to load from localStorage
        await new Promise(resolve => setTimeout(resolve, 100));
  
        // Check both hook state and localStorage directly
        const storedLoginStatus = typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') === 'true' : false;
        const storedUserSession = typeof window !== 'undefined' ? localStorage.getItem('userSession') : null;
        const isActuallyLoggedIn = isLoggedIn || (storedLoginStatus && !!storedUserSession);
  
       
  
        if (!isActuallyLoggedIn) {
          const currentPath = `/addjournalist${editId ? `?id=${editId}` : ''}`;
          redirectToLogin(currentPath, router);
          return;
        }
  
        setAuthChecked(true);
      };
  
      checkAuth();
    }, [isLoggedIn, userId, router, editId]);

  // Load edit data if in edit mode
  useEffect(() => {
    if (isEditMode && editId) {
      loadEditData(editId);
    }
  }, [isEditMode, editId]);

  const loadEditData = async (id: string) => {
    setLoading(true);
    try {
      // First try the dedicated edit API
      const formDataToSend = new FormData();
      formDataToSend.append('user_id', userId);
      formDataToSend.append('id', id);

      const response = await fetch(API_ENDPOINTS.JOURNALIST_EDIT, {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;
        console.log('Edit data received:', data);

        setFormData({
          name: data.name || '',
          title: data.title || '',
          description: data.description || '',
          city: data.city || '',
          agree_status: true, // Set to true for edit mode
        });

        // Handle existing images
        if (data.images) {
          let images: string[] = [];
          if (typeof data.images === 'string') {
            try {
              images = JSON.parse(data.images);
            } catch {
              images = [data.images];
            }
          } else if (Array.isArray(data.images)) {
            images = data.images;
          }
          console.log('Existing images:', images);
          setExistingImages(images);
        }

        // Handle existing video
        if (data.video) {
          console.log('Existing video:', data.video);
          setExistingVideo(data.video);
        }
      } else {
        // Fallback: Try to get data from the list API
        console.log('Edit API returned no data, trying list API as fallback...');
        await loadEditDataFromList(id);
      }
    } catch (error) {
      console.error('Error loading edit data:', error);
      // Fallback: Try to get data from the list API
      await loadEditDataFromList(id);
    } finally {
      setLoading(false);
    }
  };

  const loadEditDataFromList = async (id: string) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('user_id', userId);
      formDataToSend.append('pageNumber', '1');

      const response = await fetch(API_ENDPOINTS.JOURNAGET_LIST, {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      console.log('List API Response:', result);

      if (result.success && result.data && result.data.data) {
        const entries = result.data.data;
        const entry = entries.find((item: any) => item.id.toString() === id);

        if (entry) {
          console.log('Found entry in list:', entry);

          setFormData({
            name: entry.name || '',
            title: entry.title || '',
            description: entry.description || '',
            city: entry.city || '',
            agree_status: true, // Set to true for edit mode
          });

          // Handle existing images
          if (entry.featureImage) {
            let images: string[] = [];
            if (typeof entry.featureImage === 'string') {
              try {
                images = JSON.parse(entry.featureImage);
              } catch {
                images = entry.featureImage ? [entry.featureImage] : [];
              }
            } else if (Array.isArray(entry.featureImage)) {
              images = entry.featureImage;
            }
            console.log('Existing images from list:', images);
            setExistingImages(images);
          }

          // Handle existing video
          if (entry.video) {
            console.log('Existing video from list:', entry.video);
            setExistingVideo(entry.video);
          }
        } else {
          setErrorMessage('Journalist entry not found.');
        }
      } else {
        setErrorMessage('Failed to load journalist data.');
      }
    } catch (error) {
      console.error('Error loading edit data from list:', error);
      setErrorMessage('Failed to load journalist data.');
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
      setImageLimitMsg('You can upload maximum 5 images.');
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
      setVideoLimitMsg('Only MP4 or MOV allowed.');
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
      setVideoFile(null);
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setVideoLimitMsg('Video must not exceed 100MB.');
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

  // Validation function
  const validateForm = (): boolean => {
    setError('');

    if (!formData.name.trim()) {
      setError('તમારું નામ દાખલ કરો.');
      return false;
    }

    if (!formData.city.trim()) {
      setError('કૃપા કરીને તમારું શહેર દાખલ કરો.');
      return false;
    }

    if (!formData.title.trim()) {
      setError('કૃપા કરીને ટાઇટલ દાખલ કરો.');
      return false;
    }

    // Title word count validation (1-14 words)
    const titleWords = formData.title.trim().split(/\s+/).filter(Boolean);
    if (titleWords.length < 1 || titleWords.length > 14) {
      setError('ટાઇટલ ૧-૧૪ શબ્દોની વચ્ચે હોવું જોઈએ.');
      return false;
    }

    // Description validation
    const descriptionText = editorRef.current ?
      editorRef.current.getContent({ format: 'text' }).trim() :
      formData.description.replace(/<[^>]*>/g, '').trim();

    if (!descriptionText) {
      setError('વર્ણન જરૂરી છે.');
      return false;
    }

    // Description word count validation (10-150 words)
    const descriptionWords = descriptionText.split(/\s+/).filter(Boolean);

    // Media validation - at least 1 image or 1 video
    // In edit mode, consider existing media that hasn't been removed
    const hasExistingImages = isEditMode && existingImages.length > 0;
    const hasExistingVideo = isEditMode && existingVideo && !removeVideoFlag;
    const hasNewMedia = imageArray.length > 0 || videoFile;
    const hasAnyMedia = hasExistingImages || hasExistingVideo || hasNewMedia;

    if (!hasAnyMedia) {
      setError('કૃપા કરીને ઓછામાં ઓછી 1 છબી અથવા 1 વિડીયો અપલોડ કરો.');
      return false;
    }

    if (!formData.agree_status) {
      setError('સબમિટ કરતા પહેલા તમારે સંમત થવું આવશ્યક છે.');
      return false;
    }

    return true;
  };

  // Handle existing image removal
  const removeExistingImage = (imageUrl: string) => {
    setExistingImages(prev => prev.filter(img => img !== imageUrl));
    setRemovedImages(prev => [...prev, imageUrl]);
  };

  // Handle existing video removal
  const removeExistingVideo = () => {
    setExistingVideo('');
    setRemoveVideoFlag(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is logged in before allowing submission
    if (!isLoggedIn || !userId) {
      setErrorMessage('જર્નાલિસ્ટ એન્ટ્રી સબમિટ કરવા માટે તમારે લૉગ ઇન થયેલ હોવું આવશ્યક છે. કૃપા કરીને લૉગ ઇન કરો અને ફરી પ્રયાસ કરો.');
      redirectToLogin('/addjournalist', router);
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSubmitMessage('');
      setErrorMessage('');

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('user_id', userId);
      submitData.append('name', formData.name);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('city', formData.city);
      submitData.append('agree_status', formData.agree_status ? '1' : '0');

      // If edit mode, append the ID
      if (isEditMode && editId) {
        submitData.append('gujaratid', editId);
      }

      // Add new images
      imageArray.forEach((image) => {
        submitData.append('uploadimage[]', image);
      });

      // Add video if present
      if (videoFile) {
        submitData.append('uploadvideo', videoFile);
      }

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

        // Send removal information for debugging (optional)
        if (removedImages.length > 0) {
          submitData.append('removed_images', JSON.stringify(removedImages));
        }
        if (removeVideoFlag) {
          submitData.append('remove_video', '1');
        }
      }

      // Use the correct endpoint based on mode
      const endpoint = isEditMode ? API_ENDPOINTS.JOURNALIST_UPDATE : API_ENDPOINTS.JOURNALIST_SUBMIT;
      const response = await fetch(endpoint, {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setSubmitMessage(isEditMode ? 'જર્નાલિસ્ટ સફળતાપૂર્વક અપડેટ થયો!' : 'જર્નાલિસ્ટ સફળતાપૂર્વક ઉમેરાયો!');

        if (!isEditMode) {
          // Reset form only for add mode
          setFormData({
            name: '',
            title: '',
            description: '',
            city: '',
            agree_status: false,
          });
          setImageArray([]);
          setVideoFile(null);
        }

        // Redirect after success
        setTimeout(() => {
          router.push('/getjournalist');
        }, 2000);
      } else {
        setErrorMessage(result.message || `Failed to ${isEditMode ? 'update' : 'add'} જર્નાલિસ્ટ. કૃપા કરીને ફરી પ્રયાસ કરો.`);
      }

    } catch (err) {
      console.error('Error submitting journalist entry:', err);
      setErrorMessage('ભૂલ આવી છે. કૃપા કરીને ફરી પ્રયાસ કરો..');
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
                    {isEditMode && <small style={{color: '#666'}}>ID સંપાદન: {editId}</small>}
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

                {/* Title Field */}
                <div className="row">
                  <div className="col-lg-12 mb-4">
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

                {/* City Field */}
                <div className="row">
                  <div className="col-lg-12 mb-4">
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
                              <div key={`existing-${index}`} className="col-6 col-md-2 thumbOuter">
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
                          <div key={index} className="col-6 col-md-2 thumbOuter" id={`img-${index}`}>
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
                      {isEditMode && existingVideo && (
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
          </div></div>
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

export default AddJournalistPage;
