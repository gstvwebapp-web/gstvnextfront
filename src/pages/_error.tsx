import Link from 'next/link';
import React from 'react';

function ErrorPage({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <h1>Something went wrong</h1>
      <p>{statusCode ? `An error ${statusCode} occurred.` : 'An error occurred on client.'}</p>
      <Link href="/" style={{ color: '#0070f3' }}>Go to Home</Link>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;

