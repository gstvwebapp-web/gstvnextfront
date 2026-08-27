'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function PodcastDetailPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Podcast page loaded with params:', params);
    setLoading(false);
  }, [params]);

  // Handle case where params might be null
  if (!params || !params.id || !params.slug) {
    return <div>Podcast not found</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Podcast Detail Page</h1>
      <p>Author ID: {params.id}</p>
      <p>Slug: {params.slug}</p>
      <p>This is a simplified version to test compilation.</p>
    </div>
  );
}
