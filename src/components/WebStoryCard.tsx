'use client';

import { useState } from 'react';
import { WebStoryItem, getDefaultImageUrl } from '@/services/webStoryApi';
import Link from 'next/link';

interface WebStoryCardProps {
  webStory: WebStoryItem;
}

export default function WebStoryCard({ webStory }: WebStoryCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getImageUrl = () => {
    if (imageError || !webStory.parsedStoryData || webStory.parsedStoryData.length === 0) {
      return getDefaultImageUrl();
    }

    const firstStoryData = webStory.parsedStoryData[0];
    if (firstStoryData && firstStoryData.webimage) {
      // Use the original image URL directly (no need for _small transformation)
      return firstStoryData.webimage;
    }

    return getDefaultImageUrl();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className="col-lg-3 col-sm-4 col-6 web-story-card p-2">
      <Link 
        className="popupbtn"
        href={`/web-stories/${webStory.slug}`}
      >
        <div className="custom-webstory-image">
          {!imageLoaded && (
            <div className="image-placeholder">
              <img
                src={getDefaultImageUrl()}
                className="blog-featured-img img-fluid placeholder-img"
                alt={webStory.title}
                style={{ height: '100%' }}
              />
            </div>
          )}
          <img
            src={getImageUrl()}
            className={`blog-featured-img img-fluid ${imageLoaded ? 'loaded' : 'loading'}`}
            alt={webStory.title}
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ 
              height: '100%',
              display: imageLoaded ? 'block' : 'none'
            }}
          />
        </div>
        <div className="webstory-title-content custom-gujrati-font">
          <h4>{webStory.title}</h4>
        </div>
      </Link>
    </div>
  );
}
