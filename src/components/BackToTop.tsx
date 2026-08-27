'use client';

import { useEffect, useState } from 'react';

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const container = document.getElementById('middlePage');

    const onWindowScroll = () => {
      setShow(window.scrollY > 200);
    };

    const onContainerScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      setShow(target.scrollTop > 200);
    };
    // Attach listeners
    window.addEventListener('scroll', onWindowScroll);
    container?.addEventListener('scroll', onContainerScroll);

    return () => {
      window.removeEventListener('scroll', onWindowScroll);
      container?.removeEventListener('scroll', onContainerScroll);
    };
  }, []);

  const scrollToTop = () => {
    const container = document.getElementById('middlePage');

    if (container && container.scrollTop > 0) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      id="backToTop"
      className={`back-to-top ${show ? 'show' : ''}`}
      onClick={scrollToTop}
      style={{ cursor: 'pointer' }}
    >
      <i className="fa fa-arrow-up" />
    </div>
  );
}
