'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Global counter to track clicks
let CLICK_COUNTER = 0;
let CURRENT_INDEX = 0;

export default function PodcastWithAlertsPage() {
  const params = useParams();
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPodcastIndex, setCurrentPodcastIndex] = useState(0);

  useEffect(() => {
    const mockPodcasts = [
      {
        id: 1,
        podcastTitle: "Podcast 1 - Alert Test",
        podcastDescription: "Click to test auto-trigger detection",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05"
      },
      {
        id: 2,
        podcastTitle: "Podcast 2 - Alert Test",
        podcastDescription: "Click to test auto-trigger detection", 
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05"
      },
      {
        id: 3,
        podcastTitle: "Podcast 3 - Alert Test",
        podcastDescription: "Click to test auto-trigger detection",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", 
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05"
      }
    ];

    setPodcasts(mockPodcasts);
    setLoading(false);
  }, []);

  // ALERT VERSION: Show alerts to detect auto-trigger
  const handlePodcastClick = (index, eventType = 'unknown') => {
    CLICK_COUNTER++;
    const timestamp = new Date().getTime();
    
    console.log(`🎵 CLICK #${CLICK_COUNTER}: Index ${index}, Event: ${eventType}, Time: ${timestamp}`);
    
    // ALERT: Show when click is detected
    alert(`🚨 CLICK DETECTED #${CLICK_COUNTER}
    
Index: ${index}
Event Type: ${eventType}
Time: ${timestamp}
Podcast: ${podcasts[index]?.podcastTitle || 'Unknown'}

If you see this alert multiple times for ONE click, then auto-trigger is happening!`);
    
    // Update states
    setCurrentPodcastIndex(index);
    CURRENT_INDEX = index;
    
    // Play audio
    playPodcastNow(index);
  };

  // Simple play function
  const playPodcastNow = (index) => {
    console.log('🎵 PLAYING: Podcast at index', index);
    
    const audio = document.getElementById('alertAudio');
    if (audio && podcasts[index]) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = podcasts[index].audioclip;
      
      // Simple ended handler
      audio.onended = () => {
        console.log('🎵 ENDED: Audio finished');
        alert(`🎵 AUDIO ENDED: Podcast ${index} finished`);
        
        // Auto-play next
        const nextIndex = (CURRENT_INDEX + 1) < podcasts.length ? (CURRENT_INDEX + 1) : 0;
        setTimeout(() => {
          handlePodcastClick(nextIndex, 'auto-play');
        }, 1000);
      };
      
      audio.play().then(() => {
        console.log('🎵 SUCCESS: Playing index', index);
        alert(`🎵 SUCCESS: Now playing podcast ${index}`);
      }).catch(error => {
        console.log('🎵 ERROR:', error);
        alert(`🎵 ERROR: ${error.message}`);
      });
    }
  };

  // Reset click counter
  const resetCounter = () => {
    CLICK_COUNTER = 0;
    alert('🔄 RESET: Click counter reset to 0');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="blogs-main-section inner">
      <div className="blogs-head-bar inner custom-blog-details">
        <span className="blog-category detail-page-heading">
          <Link href="/">Home</Link> / <span>
            <Link href="/gstv-podcast">GSTV Podcast</Link>
          </span>
        </span>
      </div>

      <div className="row blog-content">
        <div className="col-lg-12">
          <div className="blog-read-content">
            <div className="detail-page">
              <div className="podcast-container">
                <h1>🚨 ALERT VERSION - Auto-Trigger Detection</h1>
                <p><strong>Current Index:</strong> {currentPodcastIndex}</p>
                <p><strong>Global Index:</strong> {CURRENT_INDEX}</p>
                <p><strong>Click Counter:</strong> {CLICK_COUNTER}</p>
                
                <audio 
                  id="alertAudio" 
                  controls 
                  style={{ width: '100%', marginBottom: '20px' }}
                >
                </audio>

                <div style={{ marginBottom: '20px' }}>
                  <button 
                    onClick={() => handlePodcastClick(0, 'button-click')}
                    style={{ 
                      margin: '5px', 
                      padding: '10px 20px', 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    🧪 Test Button Click
                  </button>
                  
                  <button 
                    onClick={resetCounter}
                    style={{ 
                      margin: '5px', 
                      padding: '10px 20px', 
                      backgroundColor: '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Reset Counter
                  </button>
                </div>

                <div className="podcast-list">
                  {podcasts.map((podcast, index) => (
                    <div 
                      key={podcast.id}
                      className={`podcast-item ${index === currentPodcastIndex ? 'active' : ''}`}
                      style={{ 
                        padding: '20px', 
                        margin: '10px 0', 
                        border: '3px solid',
                        borderColor: index === currentPodcastIndex ? '#007bff' : '#ccc',
                        backgroundColor: index === currentPodcastIndex ? '#e3f2fd' : 'white',
                        cursor: 'pointer',
                        borderRadius: '8px'
                      }}
                      onClick={() => handlePodcastClick(index, 'row-click')}
                      onMouseDown={() => handlePodcastClick(index, 'mouse-down')}
                      onMouseUp={() => handlePodcastClick(index, 'mouse-up')}
                      onDoubleClick={() => handlePodcastClick(index, 'double-click')}
                    >
                      <h3 style={{ margin: '0 0 10px 0' }}>
                        #{index + 1} - {podcast.podcastTitle}
                      </h3>
                      <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                        {podcast.podcastDescription}
                      </p>
                      <span style={{ fontSize: '14px', color: '#999' }}>
                        Duration: {podcast.audiocliptime}
                      </span>
                      {index === currentPodcastIndex && (
                        <div style={{ 
                          color: '#007bff', 
                          fontWeight: 'bold', 
                          marginTop: '10px',
                          fontSize: '16px'
                        }}>
                          ▶️ Currently Playing (Click #{CLICK_COUNTER})
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ 
                  marginTop: '30px', 
                  padding: '20px', 
                  backgroundColor: '#fff3cd', 
                  borderRadius: '10px',
                  border: '2px solid #ffc107'
                }}>
                  <h4 style={{ color: '#856404', marginBottom: '15px' }}>🚨 AUTO-TRIGGER DETECTION TEST:</h4>
                  <ol style={{ lineHeight: '1.8' }}>
                    <li><strong>Click any podcast row ONCE</strong></li>
                    <li><strong>Count the alerts</strong> - should be only 1 alert</li>
                    <li><strong>If you see 2+ alerts</strong> - auto-trigger is happening!</li>
                    <li><strong>Check the event types</strong> - in the alert messages</li>
                    <li><strong>Use Reset Counter</strong> - to start fresh</li>
                  </ol>
                  <div style={{ 
                    marginTop: '15px', 
                    padding: '10px', 
                    backgroundColor: '#f8d7da', 
                    borderRadius: '5px',
                    border: '1px solid #f5c6cb'
                  }}>
                    <strong>🚨 IMPORTANT:</strong> If you see multiple alerts for ONE click, then we have confirmed the auto-trigger issue and can fix it specifically!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
