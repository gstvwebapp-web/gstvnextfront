import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Add Ganapati Utsav | GSTV',
  description: 'Submit your Ganapati Utsav details to GSTV',
  keywords: 'ganapati, utsav, ganesh, festival, submit, gstv',
};

interface AddGanapatiLayoutProps {
  children: React.ReactNode;
}

export default function AddGanapatiLayout({ children }: AddGanapatiLayoutProps) {
  return (
    <>
      {children}
    </>
  );
}
