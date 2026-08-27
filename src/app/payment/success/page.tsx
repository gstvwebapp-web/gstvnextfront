'use client';

import { Suspense } from 'react';
import PaymentSuccessContent from '@/components/PaymentSuccessContent';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
