'use client';

import React, { useState } from 'react';
import styles from './LoginOtpModal.module.css';
import { API_ENDPOINTS } from '@/constants/api';

interface LoginOtpModalProps {
  isOpen: boolean;
  pollData: { pollID: string; voteId: string } | null;
  onClose: () => void;
  onSuccess: (userId: string) => void;
}

const LoginOtpModal: React.FC<LoginOtpModalProps> = ({ isOpen, pollData, onClose, onSuccess }) => {

  const [step] = useState<'login'>('login'); // UI unchanged
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');

  const [errors, setErrors] = useState({
    firstName: '',
    city: '',
    phone: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const clearErrorAfterTimeout = (field: keyof typeof errors) => {
    setTimeout(() => setErrors(prev => ({ ...prev, [field]: '' })), 5000);
  };

  const validatePhone = (phoneNumber: string): boolean => /^[6-9]\d{9}$/.test(phoneNumber);

  // ✅ SUBMIT FORM TO DRAW API
  const handleSendOTP = async () => {

    setErrors({ firstName: '', city: '', phone: '' });
    setSuccessMessage('');

    let valid = true;
    const cleanPhone = phone.replace(/\D/g, '');

    if (firstName.trim().length < 3) {
      setErrors(p => ({ ...p, firstName: 'કૃપા કરીને તમારું નામ દાખલ કરો (ઓછામાં ઓછા 3 અક્ષરો)' }));
      clearErrorAfterTimeout('firstName');
      valid = false;
    }

    if (city.trim().length < 3) {
      setErrors(p => ({ ...p, city: 'કૃપા કરીને તમારું શહેર દાખલ કરો (ઓછામાં ઓછા 3 અક્ષરો)' }));
      clearErrorAfterTimeout('city');
      valid = false;
    }

    if (!validatePhone(cleanPhone)) {
      setErrors(p => ({ ...p, phone: 'કૃપા કરીને માન્ય 10-અંકનો ફોન નંબર દાખલ કરો' }));
      clearErrorAfterTimeout('phone');
      valid = false;
    }

    if (!valid) return;

    if (!pollData?.pollID || !pollData?.voteId) {
      setSuccessMessage('વોટની માહિતી ખૂટે છે. કૃપા કરીને ફરીથી વોટ કરો.');
      return;
    }

    setIsLoading(true);

    try {

      const response = await fetch(API_ENDPOINTS.POLL_DRAW_WINNER, {
        method: 'POST',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: cleanPhone,
          firstname: firstName,
          lastname: lastName,
          address: city,
          pollID: pollData.pollID,
          voteId: pollData.voteId
        })
      });

      const data = await response.json();

      if (!response.ok || data.status === false) {
        throw new Error(data.message || 'સબમિશન નિષ્ફળ થયું');
      }

      setSuccessMessage('ફોર્મ સફળતાપૂર્વક સબમિટ કર્યું!');

      setTimeout(() => {
        onSuccess(cleanPhone);
        handleClose();
      }, 1000);

    } catch (error: any) {
      setSuccessMessage(error.message || 'સબમિશન નિષ્ફળ થયું');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFirstName('');
    setLastName('');
    setCity('');
    setPhone('');
    setErrors({ firstName: '', city: '', phone: '' });
    setSuccessMessage('');
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={`${styles.modalOverlay} modal fade show`} onClick={handleClose}>
      <div className={`${styles.modalDialog} modal-dialog modal-dialog-centered`} onClick={(e) => e.stopPropagation()}>
        <div className={`${styles.modalContent} modal-content`}>
          <div className={`${styles.modalHeader} modal-header`}>
            <h4 className={`${styles.modalTitle} modal-title`}>ડ્રો મા ભાગ લેવા આ ફોર્મ ફરજિયાત ભરો.</h4>
            <button type="button" className={`{styles.closeButton} colSearch btn-close`} onClick={handleClose}></button>
          </div>

          <div className={`${styles.modalBody} modal-body loginBox popuplogincls `}>

            <div className={`${styles.loginSec} loginSec`}>

              <div className={`${styles.inputOuter} inputOuter mb-3`}>
                <input
                  type="text"
                  placeholder="Enter your first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={styles.formControl}
                />
              </div>
              {errors.firstName && <div className={styles.errorMessage}>{errors.firstName}</div>}

              <div className={`${styles.inputOuter} inputOuter mb-3`}>
                <input
                  type="text"
                  placeholder="Enter your last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={styles.formControl}
                />
              </div>

              <div className={`${styles.inputOuter} inputOuter mb-3`}>
                <input
                  type="text"
                  placeholder="Enter your City/Village/Town"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={styles.formControl}
                />
              </div>
              {errors.city && <div className={styles.errorMessage}>{errors.city}</div>}

              <div className={`${styles.inputOuter} inputOuter mb-3 d-flex`}>
                <span className={styles.countryCode}>+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="તમારો મોબાઈલ નંબર દાખલ કરો"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={styles.formControl}
                  maxLength={10}
                />
              </div>
              {errors.phone && <div className={styles.errorMessage}>{errors.phone}</div>}

              {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

              <div>
                <img src="/assets/images/privacy_lock.png" alt="Privacy" width="25" />
                <small>
                  <strong>તમારી પર્સનલ માહિતી સુરક્ષિત છે.</strong>
                  તમારો નંબર માત્ર અકાઉન્ટ વેરિફાય કરવા માટે જ લઈ રહ્યા છીએ.
                </small>
              </div>

              <button
                className={styles.btnPrimary}
                onClick={handleSendOTP}
                disabled={isLoading}
              >
                {isLoading ? 'પ્રક્રિયા ચાલી રહી છે...' : 'સબમિટ કરો'}
              </button>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginOtpModal;
