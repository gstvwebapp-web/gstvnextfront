'use client';

import Link from 'next/link';

export default function ProFooter() {
  return (
    <div id="footerMiddle">
      <div className="row align-items-center">
        <div className="col-lg-6 d-flex justify-content-lg-start justify-content-center">
          © Copyright {new Date().getFullYear()} | GSTV. All rights reserved.
        </div>
        <div className="col-lg-6 d-flex justify-content-lg-end justify-content-center">
          <ul className="custom-address-list">
            <li><Link href="/career">Career</Link></li><span>|</span>
            <li><Link href="/contact-us">Contact us</Link></li><span>|</span>
            <li><Link href="/cookie-policy">Cookie policy</Link></li><span>|</span>
            <li><Link href="/privacy-policy">Privacy policy</Link></li><span>|</span>
            <li><Link href="/refund-policy">Refund policy</Link></li><span>|</span>
            <li><Link href="/terms-condition">Terms & condition</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
