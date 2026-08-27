'use client';

import React, { useEffect } from 'react';

const LiveTvPage: React.FC = () => {
  useEffect(() => {
    // Load IMA SDK
    const imaScript = document.createElement('script');
    imaScript.src = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';
    document.head.appendChild(imaScript);

    // Load Livecast Player
    const livecastScript = document.createElement('script');
    livecastScript.src = 'https://playerlivecast.peanutsquare.com/dist/js/livecast_player.min.js';
    livecastScript.async = true;
    document.head.appendChild(livecastScript);

    // Cleanup function
    return () => {
      if (document.head.contains(imaScript)) {
        document.head.removeChild(imaScript);
      }
      if (document.head.contains(livecastScript)) {
        document.head.removeChild(livecastScript);
      }
    };
  }, []);

  return (
    <div className="blogs-main-section">
      <div className="blogs-head-bar first">
        <span className="blog-category">લાઇવ ટીવી</span>
      </div>
      <div className="row blog-content">
        <div className="col-lg-12 p-2 detail-page custom-content-page">
          <div className="blog-read-content">
            
              <div className="lc-embed-responsive lc-embed-responsive-16by9" style={{ minHeight: '400px', background: '#f0f0f0', position: 'relative' }}>
                <div className="livecast_player">
                  <div
                    className="livecast_player_eb cid_21_stream_24_gstv"
                    style={{ height: '100%', width: '100%', minHeight: '400px' }}
                  ></div>
                </div>
            
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTvPage;
