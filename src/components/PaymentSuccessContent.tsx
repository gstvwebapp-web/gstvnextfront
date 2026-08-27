'use client';

import { API_ENDPOINTS } from '@/constants/api';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const calledRef = useRef(false);

  useEffect(() => {
    if (!searchParams || calledRef.current) return;

    const payment_id = searchParams.get('payment_id');
    const subscription_id = searchParams.get('subscription_id');
    const user_id = localStorage.getItem('user_id'); // 👈 get user id

    if (!payment_id || !subscription_id || !user_id) return;

    calledRef.current = true;

    fetch(API_ENDPOINTS.PAYMENT_SUCCESS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id,
        payment_id,
        subscription_id,
        payment_status: 'success',
        platform: 'web',
      }),
    }).catch(console.error);
  }, [searchParams]);

  return (
    <>
      {/* ===== INLINE STYLES (same as your CSS) ===== */}
      <style jsx>{`
        .thankyouPage h2 {
          font-size: 40px;
          color: green;
          margin: 10px 30px 20px 30px;
          line-height: 40px;
          text-transform: uppercase;
          font-weight: 600;
        }
        .thankyouPage h2 span {
          font-size: 30px;
          text-transform: capitalize;
          font-weight: 500;
        }
        .thankyouPage.profilePage {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 76vh;
        }
        .thankyouPage {
          text-align: center;
          background-color: #fff;
          border-radius: 30px;
          padding: 40px 80px;
          display: flex;
          flex-direction: column;
        }
        .thankyouPage .checkRight-circle {
          text-align: center;
          overflow: hidden;
          opacity: 0.8;
          margin-bottom: 20px;
        }
        .thankyouPage .checkRight-circle img {
          max-width: 100%;
        }

        @media only screen and (max-width: 767px) {
          .thankyouPage {
            padding: 10px 20px;
          }
          .thankyouPage h2 {
            font-size: 30px;
            margin: 10px 0;
            line-height: 26px;
          }
          .thankyouPage h2 span {
            font-size: 20px;
          }
          .thankyouPage .checkRight-circle {
            max-width: 80px;
            margin: 0 auto 15px;
          }
        }
      `}</style>

      {/* ===== PAGE CONTENT ===== */}
      <div className="profilePage thankyouPage">
        <div className="checkRight-circle">
          <img
            src="/assets/images/thank-you.gif"
            alt="Thank You!"
          />
        </div>

        <div>
          <h2>
            <span>Your payment was successful</span>
          </h2>
          <p>
            We appreciate your purchase and support. A confirmation email has
            been sent to your registered email address. If you have any
            questions or need assistance, feel free to contact our support
            team.
          </p>
        </div>
      </div>
    </>
  );
}