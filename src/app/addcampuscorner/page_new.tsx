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

  // Agreement text
  const agreeText = "હું સહમત છું કે મારા દ્વારા અપલોડ કરવામાં આવતી સામગ્રી કોઈપણ પ્રકારની વાંધાજનક, અશ્લીલ, હિંસક કે ગેરકાયદેસર નથી. જો આવી કોઈ સામગ્રી મળશે તો તેની સંપૂર્ણ જવાબદારી મારી રહેશે.";

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoggedIn) {
        redirectToLogin('/addcampuscorner', router);
        return;
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, [isLoggedIn]);

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
      
      const response = await fetch(API_ENDPOINTS.CAMPUS_CORNER_LIST, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageNumber: '1'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data && result.data.data) {
        const entries = result.data.data;
        const entry = entries.find((item: any) => item.id === editId);
        
        if (entry) {
          setFormData({
            name: entry.name || '',
            title: entry.title || '',
            description: entry.description || '',
            city: entry.city || '',
            school: entry.school || '',
            agree_status: true,
          });

          // Handle existing images
          if (entry.images && Array.isArray(entry.images)) {
            setExistingImages(entry.images);
          }

          // Handle existing video
          if (entry.video) {
            setExistingVideo(entry.video);
          }
        } else {
          setErrorMessage('Campus Corner entry not found.');
        }
      } else {
        setErrorMessage('Failed to load campus corner data.');
      }
    } catch (error) {
      console.error('Error loading edit data:', error);
      setErrorMessage('Failed to load campus corner data.');
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

  // Remove existing image
  const removeExistingImage = (imageUrl: string) => {
    setRemovedImages(prev => [...prev, imageUrl]);
    setExistingImages(prev => prev.filter(img => img !== imageUrl));
  };

  // Remove existing video
  const removeExistingVideo = () => {
    setRemoveVideoFlag(true);
    setExistingVideo('');
  };

  // Validation function
  const validateForm = (): boolean => {
    setError('');

    if (!formData.name.trim()) {
      setError('Please enter your name.');
      return false;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title.');
      return false;
    }

    if (!formData.school.trim()) {
      setError('Please enter your school name.');
      return false;
    }

    if (!formData.city.trim()) {
      setError('Please enter your city.');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Please enter a description.');
      return false;
    }

    if (!formData.agree_status) {
      setError('Please agree to the terms and conditions.');
      return false;
    }

    // Check if at least one image is provided (new or existing)
    const totalImages = imageArray.length + existingImages.length;
    if (totalImages === 0) {
      setError('Please upload at least one image.');
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

    setLoading(true);
    setError('');
    setErrorMessage('');
    setSubmitMessage('');

    try {
      const submitData = new FormData();
      
      // Add form fields
      submitData.append('user_id', userId);
      submitData.append('name', formData.name);
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('city', formData.city);
      submitData.append('school', formData.school);
      submitData.append('agree_status', formData.agree_status ? '1' : '0');

      // Add edit mode specific data
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
      const endpoint = isEditMode ? API_ENDPOINTS.CAMPUS_CORNER_UPDATE : API_ENDPOINTS.CAMPUS_CORNER_SUBMIT;
      const response = await fetch(endpoint, {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setSubmitMessage(isEditMode ? 'Campus Corner updated successfully!' : 'Campus Corner added successfully!');

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
          router.push('/campuscorner');
        }, 2000);
      } else {
        setErrorMessage(result.message || `Failed to ${isEditMode ? 'update' : 'add'} Campus Corner. Please try again.`);
      }

    } catch (err) {
      console.error('Error submitting campus corner entry:', err);
      setErrorMessage('An error occurred. Please try again.');
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
          <span className="sr-only">Loading...</span>
        </div>
        <p style={{ marginTop: '10px' }}>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10 col-12">
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
                        placeholder="Enter your title"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* School Field */}
                <div className="row">
                  <div className="col-lg-12 mb-4">
                    <div className="lable">શાળા</div>
                    <div className="inputOuter">
                      <input
                        type="text"
                        className="form-control"
                        id="school"
                        name="school"
                        value={formData.school}
                        onChange={handleInputChange}
                        placeholder="Enter your School"
                        required
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
                        placeholder="Enter your City"
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
                        apiKey="rhj2c0k09ri26va7i6nkcfonpi47z65r5002fjx66qczjh91"
                        value={formData.description}
                        onEditorChange={(content) => {
                          setFormData(prev => ({
                            ...prev,
                            description: content
                          }));
                        }}
                        init={{
                          height: 300,
                          menubar: false,
                          plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
                            'anchor', 'searchreplace', 'visualblocks', 'fullscreen',
                            'insertdatetime', 'table', 'help', 'wordcount'
                          ],
                          toolbar: 'undo redo | blocks | ' +
                            'bold italic forecolor | alignleft aligncenter ' +
                            'alignright alignjustify | bullist numlist outdent indent | ' +
                            'removeformat | help',
                          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                          placeholder: 'Enter description',
                          branding: false,
                          setup: (editor) => {
                            editor.on('init', () => {
                              editor.getContainer().style.transition = "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out";
                            });
                          }
                        }}
                      />

                    </div>
                  </div>
                </div>

                {/* Images Upload */}
                <div className="row">
                  <div className="col-lg-12 mb-4">
                    <div className="lable">તસવીરો (min 1, max 5 image upload)</div>
                    <div className="inputOuter">

                      {/* Existing Images Display */}
                      {isEditMode && existingImages.length > 0 && (
                        <div className="mb-3">
                          <label className="form-label">Existing Images:</label>
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
                    <div className="lable">વીડિયો (optional, only mp4/mov, ≤ 100MB)</div>
                    <div className="inputOuter">

                      {/* Existing Video Display */}
                      {isEditMode && existingVideo && (
                        <div className="mb-3">
                          <label className="form-label">Existing Video:</label>
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
                        <div className="agree_checkbox_height">{agreeText}</div>
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
              <span className="sr-only">Loading...</span>
            </div>
            <p style={{ marginTop: '10px' }}>Please wait...</p>
          </div>
        </div>
      )}
    </>

  );
};

export default AddCampusCornerPage;
