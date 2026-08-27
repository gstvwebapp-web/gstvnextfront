'use client';

import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/constants/api';

interface Magazine {
  slug: string;
  name: string;
}

export default function MagazineReviewPage() {
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [magazine, setMagazine] = useState('');
  const [rating, setRating] = useState(0);

  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  /* ------------------------------------
     Fetch magazine list
  ------------------------------------ */
  useEffect(() => {
    const fetchMagazines = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.EPAPER_CATEGORIES);
        const data = await res.json();
        setMagazines(data || []);
      } catch (err) {
        console.error('Magazine API error', err);
      }
    };

    fetchMagazines();
  }, []);

  /* ------------------------------------
     Submit Review
  ------------------------------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullname || !phone || !city || !magazine || !rating || !description) {
      setMessage('કૃપા કરીને બધા ફીલ્ડ ભરો.');
      return;
    }

    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('fullname', fullname);
    formData.append('rating', rating.toString());
    formData.append('phone', phone);
    formData.append('city', city);
    formData.append('magazine', magazine);
    formData.append('description', description);

    try {
      const res = await fetch(API_ENDPOINTS.MAGAZINE_REVIEW,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        setMessage('તમારો રિવ્યૂ સફળતાપૂર્વક સબમિટ થયો!');
        setFullname('');
        setPhone('');
        setCity('');
        setDescription('');
        setMagazine('');
        setRating(0);
      } else {
        setMessage(data.message || 'સબમિટ નિષ્ફળ ગયું.');
      }
    } catch (err) {
      setMessage('સર્વર એરર. ફરી પ્રયાસ કરો.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reviewPage">
      <form className="reviewBox" onSubmit={handleSubmit}>
        <h2>Submit Magazine Review</h2>

        {/* Name + Rating */}
        <div className="row">
          <div className="col">
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
            />
          </div>

          <div className="col">
            <label>Rating</label>
            <div className="ratingStars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= rating ? 'active' : ''}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Phone + City */}
        <div className="row">
          <div className="col">
            <label>Phone Number</label>
            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="col">
            <label>City</label>
            <input
              type="text"
              placeholder="Enter city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>

        {/* Magazine */}
        <label>Select Magazine</label>
        <div className="magazineGrid">
          {magazines.map((m) => (
            <div
              key={m.slug}
              className={`magBox ${magazine === m.slug ? 'selected' : ''}`}
              onClick={() => setMagazine(m.slug)}
            >
              {m.name}
            </div>
          ))}
        </div>

        {/* Message */}
        <label>Brief About You / Message</label>
        <textarea
          placeholder="Enter brief about yourself"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {message && <p className="formMessage">{message}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
