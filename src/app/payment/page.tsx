'use client';

import { API_ENDPOINTS } from '@/constants/api';
import { useEffect, useState } from 'react';
import { useUserSession, getUserId } from '@/hooks/useUserSession';
import { redirectToLogin } from '@/utils/authUtils';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Plan {
  id: number;
  plan_name: string;
  plan_title: 'monthly' | 'yearly';
  plan_subscription_id: string;
  plan_amount: string;
  plan_discount: number;
  plan_discount_amount: string;
  status: string;
}

export default function PaymentPage() {
  const router = useRouter();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const { user_id, isLoggedIn } = useUserSession();

  /* --------------------------------------------------------
     AUTH CHECK – BLOCK GUEST USERS
  -------------------------------------------------------- */
  useEffect(() => {
    const checkAuth = async () => {
      // allow hook/localStorage to hydrate
      await new Promise(resolve => setTimeout(resolve, 100));

      const storedLoginStatus =
        typeof window !== 'undefined' &&
        localStorage.getItem('isLoggedIn') === 'true';

      const storedUserSession =
        typeof window !== 'undefined'
          ? localStorage.getItem('userSession')
          : null;

      const isActuallyLoggedIn =
        isLoggedIn || (storedLoginStatus && !!storedUserSession);

      if (!isActuallyLoggedIn) {
        // redirect to login and come back to payment
        redirectToLogin('/payment', router);
        return;
      }

      setAuthChecked(true);
    };

    checkAuth();
  }, [isLoggedIn, router]);

  /* --------------------------------------------------------
     FETCH PLAN DATA (ONLY AFTER AUTH)
  -------------------------------------------------------- */
  useEffect(() => {
    if (!authChecked) return;

    fetch(API_ENDPOINTS.CATEGORY_SETTING)
      .then(res => res.json())
      .then(data => {
        if (data?.plan?.length) {
          const activePlans = data.plan.filter(
            (p: Plan) => p.status === 'Active'
          );
          setPlans(activePlans);
          setSelectedPlan(null);
        }
      })
      .catch(() => setError('Failed to load plans'));
  }, [authChecked]);

  useEffect(() => {
  if (!window.Razorpay) {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }
}, []);

  /* --------------------------------------------------------
     RAZORPAY PAYMENT
  -------------------------------------------------------- */
  const handlePayment = async () => {
    if (!selectedPlan) {
      setError('Please select a plan first.');
      return;
    }

    if (loading) return;

    const userId = user_id || getUserId() || '';
    if (!userId) {
      redirectToLogin('/payment', router);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(API_ENDPOINTS.CREATE_SUBSCRIPTION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          plan_id: selectedPlan.plan_subscription_id,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.subscription_id) {
        alert('Unable to create subscription');
        return;
      }

      const options = {
        key: data.razorpay_key,
        subscription_id: data.subscription_id,
        name: 'GSTV',
        description:
          selectedPlan.plan_title === 'monthly'
            ? 'Monthly Subscription'
            : 'Yearly Subscription',
        handler: function (response: any) {
            console.log('Payment Success Response:', response);
            window.location.href =
            `/payment/success?payment_id=${response.razorpay_payment_id}` +
            `&subscription_id=${response.razorpay_subscription_id}`;
        },
        theme: { color: '#3399cc' },
      };

      new window.Razorpay(options).open();
    } catch (e) {
      alert('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------------
     PREVENT RENDER UNTIL AUTH IS CONFIRMED
  -------------------------------------------------------- */
  if (!authChecked) {
    return null; // or loader
  }

  return (
    <>
      <div className="profilePage">
        <div className="pricing_page">

          <div className="herobanner">
            <a href="#" className="btn_membership">
              <img src="/assets/images/btn_membership.svg" alt="GSTV Premium Membership Button" />
            </a>
          </div>

          <div className="price_list">
            <ul>
              <li>લોક ન્યૂઝ વાંચો વિના અવરોધે</li>
              <li>અનલિમિટેડ ન્યૂઝ 2500+ રિપોર્ટર દ્વારા</li>
              <li>ગુજરાતનાં 40 શહેર અને મુંબઈ નાં ઇ-પેપરનો એક્સેસ</li>
              <li>પ્રીમિયમ ન્યુઝ માત્ર તમારા માટે</li>
            </ul>
          </div>

          <div className="priceOfferBox">
            <div className="poffer_row">
              {plans.map(plan => {
                const amount = plan.plan_discount
                  ? plan.plan_discount_amount
                  : plan.plan_amount;

                return (
                  <label className="radioPrice" key={plan.id}>
                    <input
                      type="radio"
                      name="radio"
                      checked={selectedPlan?.id === plan.id}
                      onChange={() => setSelectedPlan(plan)}
                    />
                    <span className="checkmark"></span>

                    {plan.plan_discount ? (
                      <div className="offBox">{plan.plan_discount}% OFF</div>
                    ) : null}

                    <div className="radioinner">
                      <div className="timePrice">{plan.plan_name}</div>
                      <img
                        src="/assets/images/price_hr_line.svg"
                        className="priceHrLine"
                        alt=""
                      />
                      <div className="pricebox">
                        {plan.plan_discount ? (
                          <>
                            <span className="oprice">₹{amount}</span>
                            <span className="mprice">₹{plan.plan_amount}</span>
                          </>
                        ) : (
                          <span className="oprice">₹{plan.plan_amount}</span>
                        )}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {error && (
              <div
                style={{
                  color: '#870e00',
                  textAlign: 'center',
                  marginBottom: 10,
                }}
              >
                {error}
              </div>
            )}

            <div className="btnPriceBox">
              <button
                className="btn-gstv"
                onClick={handlePayment}
                disabled={!selectedPlan || loading}
              >
                {!selectedPlan ? (
      'પ્લાન પસંદ કરો'
    ) : (
      <>
        ₹
        {selectedPlan.plan_discount
          ? selectedPlan.plan_discount_amount
          : selectedPlan.plan_amount}{' '}
        માં{' '}
        {selectedPlan.plan_title === 'yearly'
          ? 'વર્ષિક'
          : 'માસિક'}{' '}
        પ્રીમિયમ પ્લાન મેળવો
      </>
    )}
              </button>

              {/* <button
    className="btn-gstv"
    onClick={handlePayment}
    disabled={!selectedPlan}
    style={{
      opacity: selectedPlan ? 1 : 0.6,
      cursor: selectedPlan ? 'pointer' : 'not-allowed',
    }}
  >
    {!selectedPlan ? (
      'પ્લાન પસંદ કરો'
    ) : (
      <>
        ₹
        {selectedPlan.plan_discount
          ? selectedPlan.plan_discount_amount
          : selectedPlan.plan_amount}{' '}
        માં{' '}
        {selectedPlan.plan_title === 'yearly'
          ? 'વર્ષિક'
          : 'માસિક'}{' '}
        પ્રીમિયમ પ્લાન મેળવો
      </>
    )}
  </button> */}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
