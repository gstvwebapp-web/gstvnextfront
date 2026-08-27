'use client';

import React, { useState, useEffect } from 'react';
import ProFooter from '@/components/ProFooter';
import { API_ENDPOINTS } from '@/constants/api';

interface FormData {
  fullname: string;
  email: string;
  phone: string;
  post: string;
  experience: string;
  message: string;
  cv: File | null;
}

interface FormErrors {
  fullname?: string;
  email?: string;
  phone?: string;
  post?: string;
  experience?: string;
  message?: string;
  cv?: string;
}

export default function CareerPage() {
  const [formData, setFormData] = useState<FormData>({
    fullname: '',
    email: '',
    phone: '',
    post: '',
    experience: '',
    message: '',
    cv: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitMessage, setSubmitMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [applyPosts, setApplyPosts] = useState<string[]>([]);

  // Add mounted state to track component lifecycle
  useEffect(() => {
    console.log('🚀 CareerPage component mounted');
    return () => {
      console.log('💀 CareerPage component unmounted');
    };
  }, []);

  // Fetch apply posts from category settings
  useEffect(() => {
    const fetchApplyPosts = async () => {
      try {
        console.log('🔍 Fetching apply posts from API...');
        const response = await fetch(API_ENDPOINTS.CATEGORY_SETTING, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error('❌ API Response not OK:', response.status, response.statusText);
          return;
        }

        const data = await response.json();

        if (data.setting && data.setting.length > 0) {
          const settings = data.setting[0];


          if (settings.applypost) {
            // Handle both string and array formats
            let posts: string[] = [];

            if (typeof settings.applypost === 'string') {
              // Split by comma and trim each post
              posts = settings.applypost
                .split(',')
                .map((post: string) => post.trim())
                .filter((post: string) => post.length > 0);
            } else if (Array.isArray(settings.applypost)) {
              posts = settings.applypost;
            }


            setApplyPosts(posts);
          }
        } else {
          console.warn('⚠️ Invalid API response structure');
          console.warn('⚠️ Response data:', data);
        }
      } catch (error) {
        console.error('❌ Error fetching apply posts:', error);
      }
    };

    fetchApplyPosts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      cv: file
    }));
    // Clear error for this field
    if (errors.cv) {
      setErrors(prev => ({
        ...prev,
        cv: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Full name validation
    if (!formData.fullname.trim()) {
      newErrors.fullname = 'કૃપા કરીને તમારું પૂરું નામ દાખલ કરો.';
    } else if (formData.fullname.trim().length < 3) {
      newErrors.fullname = 'Full name must be at least 3 characters.';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'કૃપા કરીને તમારું ઇમેઇલ દાખલ કરો.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'કૃપા કરીને તમારો ફોન નંબર દાખલ કરો.';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits.';
    }

    // Post validation
    if (!formData.post) {
      newErrors.post = 'કૃપા કરીને તમે જે પદ માટે અરજી કરી રહ્યા છો તે પસંદ કરો.';
    }

    // Experience validation
    if (!formData.experience.trim()) {
      newErrors.experience = 'કૃપા કરીને તમારા વર્ષોનો અનુભવ દાખલ કરો.';
    } else if (isNaN(Number(formData.experience)) || Number(formData.experience) < 0) {
      newErrors.experience = 'અનુભવ માટે કૃપા કરીને માન્ય નંબર દાખલ કરો.';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'કૃપા કરીને તમારા વિશે ટૂંકો સંદેશ દાખલ કરો.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'સંદેશ ઓછામાં ઓછો 10 અક્ષરોનો હોવો જોઈએ.';
    } else if (formData.message.trim().length > 500) {
      newErrors.message = 'સંદેશ 500 અક્ષરોથી વધુ ન હોઈ શકે.';
    }

    // CV validation
    if (!formData.cv) {
      newErrors.cv = 'કૃપા કરીને તમારો સીવી અથવા રિઝ્યુમ અપલોડ કરો.';
    } else {
      const allowedExtensions = ['pdf', 'doc', 'docx'];
      const fileExtension = formData.cv.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        newErrors.cv = 'ફક્ત PDF, DOC, અથવા DOCX ફાઇલોને જ મંજૂરી છે.';
      } else if (formData.cv.size > 5000000) {
        newErrors.cv = 'ફાઇલનું સાઈજ 5 MB થી વધુ ન હોવું જોઈએ.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hideMessageAfterTimeout = (setter: React.Dispatch<React.SetStateAction<string>>, timeout = 3000) => {
    setTimeout(() => {
      setter('');
    }, timeout);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitMessage('');
    setErrorMessage('');

    const formDataToSend = new FormData();
    formDataToSend.append('fullname', formData.fullname);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('post', formData.post);
    formDataToSend.append('experience', formData.experience);
    formDataToSend.append('message', formData.message);
    if (formData.cv) {
      formDataToSend.append('cv', formData.cv);
    }

    try {
      const response = await fetch(API_ENDPOINTS.CAREER_SUBMIT, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        setSubmitMessage(data.message || 'Application submitted successfully!');
        // Reset form
        setFormData({
          fullname: '',
          email: '',
          phone: '',
          post: '',
          experience: '',
          message: '',
          cv: null,
        });
        // Reset file input
        const fileInput = document.getElementById('cv-input') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        hideMessageAfterTimeout(setSubmitMessage);
      } else {
        setErrorMessage(data.message || 'સબમિશન નિષ્ફળ ગયું. કૃપા કરીને ફરી પ્રયાસ કરો.');
        hideMessageAfterTimeout(setErrorMessage);
      }
    } catch (error) {
      console.error('કેરીયર ફોર્મ સબમિટ કરવામાં ભૂલ:', error);
      setErrorMessage('ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.');
      hideMessageAfterTimeout(setErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="">
        <div className="justify-content-center">
          <div className="">
            <div className="profilePage">
              <form className="formBox" id="career-form" encType="multipart/form-data" onSubmit={handleSubmit}>
                <div className="pNewsBox">
                  <div className="title">
                    <h2>કેરીયર At GSTV</h2>
                  </div>


                  <div className="pnewsContent">
                    {/* Submit Message */}
                    {submitMessage && (
                      <div className="text-success mt-2 mb-3 text-center" style={{ fontWeight: 'bold' }}>
                        {submitMessage}
                      </div>
                    )}

                    {/* Error Message */}
                    {errorMessage && (
                      <div className="text-danger mt-2 mb-3 text-center" style={{ fontWeight: 'bold' }}>
                        {errorMessage}
                      </div>
                    )}

                    <div className="row">
                      <div className="col-lg-6 mb-4">
                        <div className="lable">પૂરું નામ</div>
                        <div className="inputOuter">
                          <input
                            type="text"
                            name="fullname"
                            className={`form-control ${errors.fullname ? 'is-invalid' : ''}`}
                            placeholder="તમારું પૂરું નામ દાખલ કરો"
                            value={formData.fullname}
                            onChange={handleInputChange}
                          />
                          {errors.fullname && (
                            <span className="invalid-feedback">{errors.fullname}</span>
                          )}
                        </div>
                      </div>

                      <div className="col-lg-6 mb-4">
                        <div className="lable">ઈમેલ</div>
                        <div className="inputOuter">
                          <input
                            type="email"
                            name="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="તમારો ઈમેલ દાખલ કરો"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                          {errors.email && (
                            <span className="invalid-feedback">{errors.email}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-lg-6 mb-4">
                        <div className="lable">ફોન નંબર</div>
                        <div className="inputOuter">
                          <input
                            type="text"
                            name="phone"
                            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                            placeholder="ફોન નંબર દાખલ કરો"
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                          {errors.phone && (
                            <span className="invalid-feedback">{errors.phone}</span>
                          )}
                        </div>
                      </div>

                      <div className="col-lg-6 mb-4">
                        <div className="lable">કઈ પોસ્ટ માટે એપ્લાય કરી રહ્યા છો?</div>
                        <div className="inputOuter">
                          <select
                            name="post"
                            className={`form-control ${errors.post ? 'is-invalid' : ''}`}
                            value={formData.post}
                            onChange={handleInputChange}
                          >
                            <option value="">
                              {applyPosts.length === 0 ? 'લોડ કરી રહ્યા છીએ ...' : 'પોસ્ટ પસંદ કરો'}
                            </option>
                            {applyPosts.length > 0 ? (
                              applyPosts.map((post, index) => (
                                <option key={index} value={post}>
                                  {post}
                                </option>
                              ))
                            ) : null}
                          </select>
                          {errors.post && (
                            <span className="invalid-feedback">{errors.post}</span>
                          )}

                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-lg-6 mb-4">
                        <div className="lable">વર્ષોનો અનુભવ</div>
                        <div className="inputOuter">
                          <input
                            type="text"
                            name="experience"
                            className={`form-control ${errors.experience ? 'is-invalid' : ''}`}
                            placeholder="અનુભવના વર્ષો દાખલ કરો"
                            value={formData.experience}
                            onChange={handleInputChange}
                          />
                          {errors.experience && (
                            <span className="invalid-feedback">{errors.experience}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-lg-12 mb-4">
                        <div className="lable">તમારા વિશે સંક્ષિપ્તમા લખો.</div>
                        <div className="inputOuter">
                          <textarea
                            name="message"
                            className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                            rows={4}
                            placeholder="તમારા વિશે સંક્ષિપ્તમા લખો."
                            value={formData.message}
                            onChange={handleInputChange}
                          />
                          {errors.message && (
                            <span className="invalid-feedback">{errors.message}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-lg-12 mb-4">
                        <div className="lable">સીવી / રેઝ્યૂમે જોડો</div>
                        <div className="inputOuter">
                          <input
                            type="file"
                            id="cv-input"
                            name="cv"
                            className={`form-control ${errors.cv ? 'is-invalid' : ''}`}
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                          />
                          {errors.cv && (
                            <span className="invalid-feedback">{errors.cv}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {loading && (
                      <div className="text-center position-relative">
                        <div style={{ marginBottom: '10px', color: '#ff0000', fontWeight: 'bold' }}>
                          <img src="/assets/images/loading.gif" alt="લોડ થઈ રહ્યું છે..." style={{ width: '30px', verticalAlign: 'middle' }} />
                        </div>
                      </div>
                    )}

                  <div className="profileBtn">
                    <button type="submit" className="btn-gstv" disabled={loading}>
                      {loading ? 'સબમિટિંગ...' : 'સબમિટ'}
                    </button>
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
}
