'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/constants/api';
import { useUserSession, getUserId } from '@/hooks/useUserSession';
import { redirectToLogin } from '@/utils/authUtils';

interface PaymentHistory {
  plan: string;
  plan_amount: string;
  plan_status: 'Active' | 'Inactive';
  plan_expire: string;
}

export default function PaymentHistoryPage() {
  const router = useRouter();

  const { user_id, isLoggedIn } = useUserSession();

  const [authChecked, setAuthChecked] = useState(false);
  const [history, setHistory] = useState<PaymentHistory[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
console.log('Selected Plan:', history);
  /* --------------------------------------------------------
     AUTH CHECK – BLOCK GUEST USERS
  -------------------------------------------------------- */
  useEffect(() => {
    const checkAuth = async () => {
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
        redirectToLogin('/paymenthistory', router);
        return;
      }

      setAuthChecked(true);
    };

    checkAuth();
  }, [isLoggedIn, router]);

  useEffect(() => {
  if (!authChecked) return;

  fetch(API_ENDPOINTS.CATEGORY_SETTING)
    .then(res => res.json())
    .then(data => {
      const activePlans = data?.plan?.filter(
        (p: any) => p.status === 'Active'
      );
      setPlans(activePlans || []);
    });
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
     FETCH PAYMENT HISTORY
  -------------------------------------------------------- */
  useEffect(() => {
    if (!authChecked) return;

    const userId = user_id || getUserId();
    if (!userId) return;

    fetch(API_ENDPOINTS.PAYMENT_HISTORY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    })
      .then(res => res.json())
      .then(data => {
        setHistory(data?.paymenthistory || []);
      })
      .finally(() => setLoading(false));
  }, [authChecked, user_id]);

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
console.log('Create Subscription Response:', data);
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
     BLOCK RENDER UNTIL AUTH IS CONFIRMED
  -------------------------------------------------------- */
  if (!authChecked) return null;

  return (
    
      <div className="profilePage">
        <div className="pricing_page paymentHistoryPage">

        {/* ================= PLAN SELECTION ================= */}
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

  <div className="btnPriceBox">
    {/* <button
      className="btn-gstv"
      disabled={!selectedPlan}
      onClick={() => router.push('/payment')}
    >
      {selectedPlan ? 'રિન્યૂ / ઉપગ્રડે પ્લાન' : 'પ્લાન પસંદ કરો'}
    </button> */}
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
  </div>
</div>


          <hr />

          {/* ================= PAYMENT HISTORY TABLE ================= */}
          <div className="paymentHistoryBlock">
            <h3>પ્લાન હિસ્ટ્રી</h3>

            <div className="table-responsive">
              <table  className="table table-bordered">
                  <thead>
                    <tr>
                    <th>પેમેન્ટ ટાઈપ</th>
                    <th>અમાઉન્ટ</th>
                    <th>સ્ટેટ્સ</th>
                    <th>સમાપ્તિ તારીખ</th>
                  </tr></thead>
                   <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : history.length > 0 ? (
                    history.map((payment, index) => (
                      <tr
                        key={index}
                        className={
                          payment.plan_status === 'Active' ? 'active' : ''
                        }
                      >
                        <td>{payment.plan}</td>
                        <td>₹ {payment.plan_amount}</td>
                        <td>
                          {payment.plan_status === 'Active'
                            ? 'Subscribe'
                            : 'Expire'}
                        </td>
                        <td>
                          {new Date(payment.plan_expire).toLocaleDateString(
                            'en-GB',
                            {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center">
                        કોઈ ચુકવણી ઇતિહાસ ઉપલબ્ધ નથી.
                      </td>
                    </tr>
                  )}
                </tbody>
                </table>
            
            </div>

          </div>
        </div>
         <style jsx>{`
        .paymentHistoryBlock h3 {
  color: #000;
  position: relative;
  padding-bottom: 10px;
  margin-bottom: 20px;
  text-align: center;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
}
.paymentHistoryBlock h3::after {
  content: '';
  width: 50px;
  height: 3px;
  background-color: #820d00;
  display: block;
  position: absolute;
  bottom: 0;
}
tbody, td, tfoot, th, thead, tr {
    border-color: inherit;
    border-style: solid;
    border-width: 0;
    padding: .5rem .5rem !important;
}
    .table-bordered tbody td {
    padding: 5px 10px;
    text-align: center;
    font-weight: 500;
    border: 1px solid #dee2e6;
        text-transform: capitalize;
}
.paymentHistoryBlock table th {
  background-color: #cdad51;
    color: #fff;
    font-weight: 500;
}

.paymentHistoryBlock table tbody tr {
  opacity: 0.6;
}

.paymentHistoryBlock table tbody tr.active {
  background-color: #f9f4e6;
  color: #000;
  opacity: 1;
}
      `}</style>
      </div>
    
  );
}
