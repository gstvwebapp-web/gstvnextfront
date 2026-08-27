'use client';

import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/constants/api';
import { useParams } from 'next/navigation';

interface Magazine {
  id: number;
  title: string;
  slug: string;
  icon: string;
  icon_dark?: string;
}

interface FormErrors {
  fullname?: string;
  phone?: string;
  city?: string;
  magazine?: string;
  rating?: string;
  description?: string;
}

export default function ReviewPage() {
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [magazine, setMagazine] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [description, setDescription] = useState('');

  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitMessage, setSubmitMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const params = useParams();
  const magazineSlug = params?.slug as string | undefined;

  /* ----------------------------
     Fetch magazine list
  ---------------------------- */
  useEffect(() => {
  const fetchMagazines = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.EPAPER_CATEGORIES);
      const data = await res.json();

      if (data?.epapercat && Array.isArray(data.epapercat)) {
        setMagazines(data.epapercat);
      }
    } catch (err) {
      console.error('Magazine API error', err);
    }
  };

  fetchMagazines();
}, []);
useEffect(() => {
  if (magazineSlug) {
    setMagazine(magazineSlug);
  }
}, [magazineSlug]);
  /* ----------------------------
     Validation (Career style)
  ---------------------------- */
  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!fullname.trim()) {
      newErrors.fullname = 'કૃપા કરીને તમારું પૂરું નામ દાખલ કરો.';
    }

    if (!phone.trim()) {
      newErrors.phone = 'કૃપા કરીને તમારો ફોન નંબર દાખલ કરો.';
    } else if (!/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone = 'માન્ય મોબાઇલ નંબર દાખલ કરો.';
    }

    // if (!city.trim()) {
    //   newErrors.city = 'કૃપા કરીને શહેર દાખલ કરો.';
    // }

    // if (!magazine) {
    //   newErrors.magazine = 'કૃપા કરીને મેગેઝિન પસંદ કરો.';
    // }

    if (!rating) {
      newErrors.rating = 'કૃપા કરીને રેટિંગ પસંદ કરો.';
    }

    if (!description.trim()) {
      newErrors.description = 'કૃપા કરીને સંદેશ દાખલ કરો.';
    } else if (description.length < 10) {
      newErrors.description = 'સંદેશ ઓછામાં ઓછો 10 અક્ષરોનો હોવો જોઈએ.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ----------------------------
     Submit Review
  ---------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setSubmitMessage('');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('fullname', fullname);
    formData.append('stars', rating.toString());
    formData.append('phone', phone);
    formData.append('city', city);
    formData.append('magazine', magazine);
    formData.append('description', description);

    try {
      const res = await fetch(API_ENDPOINTS.MAGAZINE_REVIEW, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data?.success) {
        setSubmitMessage(data.message || 'તમારો રિવ્યૂ સફળતાપૂર્વક સબમિટ થયો!');
        setFullname('');
        setPhone('');
        setCity('');
        setMagazine('');
        setRating(0);
        setDescription('');
      } else {
        setErrorMessage(data.message || 'સબમિશન નિષ્ફળ ગયું.');
      }
    } catch (err) {
      setErrorMessage('ભૂલ આવી. કૃપા કરીને ફરી પ્રયાસ કરો.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profilePage">
      <form className="formBox" onSubmit={handleSubmit}>
        <div className="pNewsBox">
          <div className="title">
            <h2>મેગેઝિન રિવ્યૂ</h2>
          </div>

          <div className="pnewsContent">
            {submitMessage && (
              <div className="text-success text-center mb-3">{submitMessage}</div>
            )}

            {errorMessage && (
              <div className="text-danger text-center mb-3">{errorMessage}</div>
            )}

            {/* Name + Rating */}
            <div className="row">
              <div className="col-lg-6 mb-4">
                <div className="lable">પૂરું નામ</div>
                <input
                  type="text"
                  className={`form-control ${errors.fullname ? 'is-invalid' : ''}`}
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
                {errors.fullname && <span className="invalid-feedback">{errors.fullname}</span>}
              </div>

              <div className="col-lg-6 mb-4">
                <div className="lable">રેટિંગ</div>
                <div className="rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={
                        star <= (hoverRating || rating) ? 'active' : ''
                      }
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <input type="hidden" name="stars" value={rating} />
                {errors.rating && <span className="text-danger">{errors.rating}</span>}
              </div>
            </div>

            {/* Phone + City */}
            <div className="row">
              <div className="col-lg-6 mb-4">
                <div className="lable">ફોન નંબર</div>
                <input
                  type="text"
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {errors.phone && <span className="invalid-feedback">{errors.phone}</span>}
              </div>

              <div className="col-lg-6 mb-4">
                <div className="lable">શહેર</div>
                <input
                  type="text"
                  className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
                {/* {errors.city && <span className="invalid-feedback">{errors.city}</span>} */}
              </div>
            </div>

            {/* Magazine */}
{/* <div className="lable">મેગેઝિન પસંદ કરો</div> */}
            <div className="row">

<div className="col-lg-12 magazine-review-grid mb-4">
  <div
      key='futuristic'
      className={`magazine-card ${magazine === 'futuristic' ? 'selected' : ''}`}
      onClick={() => setMagazine('futuristic')}
    >
  <img
        src="images/futuristiclogo.png"
        alt="Futuristic Magazine"
        className="magIcon"
      />
     <input
    type="radio"
    name="magazine"
    value="futuristic"
    checked={magazine === 'futuristic'}
    onChange={() => setMagazine('futuristic')}
  />
  </div>
  {/* {magazines.map((m) => (
    <div
      key={m.slug}
      className={`magazine-card ${magazine === m.slug ? 'selected' : ''}`}
      onClick={() => setMagazine(m.slug)}
    >
      <input
    type="radio"
    name="magazine"
    value={m.slug}
    checked={magazine === m.slug}
    onChange={() => setMagazine(m.slug)}
  />
      <img
        src={m.icon}
        alt={m.title}
        className="magIcon"
      />
    </div>
  ))} */}
</div>

{errors.magazine && (
  <div className="text-danger mb-3">{errors.magazine}</div>
)}
</div>

            {/* Message */}
            <div className="row">
            <div className="col-lg-12 mb-4">
            <div className="lable">તમારા મંતવ્ય અથવા સૂચનો લખો</div>
            <textarea
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {errors.description && (
              <span className="invalid-feedback">{errors.description}</span>
            )}
            </div></div>
            {loading && (
              <div className="text-center mt-3">
                <img src="/assets/images/loading.gif" width="30" />
              </div>
            )}

            <div className="profileBtn mt-4">
              <button type="submit" className="btn-gstv" disabled={loading}>
                {loading ? 'સબમિટિંગ...' : 'સબમિટ'}
              </button>
            </div>
          </div>
        </div>
      </form>
      <style jsx>{`
  .magazinelogoreview-item {
   
    max-width: 100px;
    text-align: center;
    display: block;
    margin: 10px;
    float: left; 
}
.rating input {
    display: none;
}

.rating label {
    font-size: 22px;
    color: #ccc;
    cursor: pointer;
}

.rating input {
    display: none;
}

.rating label {
    font-size: 22px;
    color: #ccc;
}

.rating input:checked ~ label,
.rating label:hover,
.rating label:hover ~ label {
    color: gold;
}


.rating {
    display: flex;
    gap: 6px;
    font-size: 22px;
    cursor: pointer;
}

.rating span {
    color: #ccc;
    font-size: xx-large;
    cursor: pointer;
    transition: color 0.2s ease;
}

.rating span.active, .rating span:hover {
    color: #ffd700;
}
.magazine-review-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 20px;
    margin-top: 10px;
}

.magazine-card {
    position: relative;
    text-align: center;
    cursor: pointer;
}

.magazine-card input[type="radio"] {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    width: 16px;
    height: 16px;
    visibility: hidden;
}

.magazine-card img {
    max-width: 100%;
    height: auto;
    /* opacity: 0.5;*/
    transition: all 0.3s ease;
    border-radius: 6px;
}

.magazine-card input[type="radio"]:checked + img {
    opacity: 1;
    border: 2px solid #d32f2f;
    padding: 3px;
}
`}</style>
    </div>
  );
}
