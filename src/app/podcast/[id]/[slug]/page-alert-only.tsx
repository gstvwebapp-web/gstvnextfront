'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Global counter
let alertCount = 0;

export default function PodcastAlertOnlyPage() {
  const params = useParams();
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPodcastIndex, setCurrentPodcastIndex] = useState(0);

  useEffect(() => {
    const mockPodcasts = [
      {
        id: 1,
        podcastTitle: "Podcast 1 - Alert Test",
        podcastDescription: "Click to see alerts",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05"
      },
      {
        id: 2,
        podcastTitle: "Podcast 2 - Alert Test",
        podcastDescription: "Click to see alerts", 
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05"
      },
      {
        id: 3,
        podcastTitle: "Podcast 3 - Alert Test",
        podcastDescription: "Click to see alerts",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", 
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05"
      }
    ];

    setPodcasts(mockPodcasts);
    setLoading(false);
  }, []);

  // ALERT ONLY - Like your getPodcastDetail function
  const getPodcastDetail = (id: any, title: any, description: any, image: any, date: any, audioUrl: any) => {
    alertCount++;
    
    // ONLY ALERT - NO CONSOLE
    alert(`🚨 ALERT #${alertCount}

FUNCTION CALLED: getPodcastDetail

PODCAST: ${title}
ID: ${id}

⚠️ COUNT THIS ALERT!
If you see 2 alerts for 1 click = DOUBLE CALL!`);
    
    // Update current index
    const index = podcasts.findIndex(p => p.id.toString() === id.toString());
    if (index !== -1) {
      setCurrentPodcastIndex(index);
    }
    
    // Play audio
    const audio = document.getElementById('alertAudio') as HTMLAudioElement;
    if (audio) {
      audio.src = audioUrl;
      audio.play();
    }
  };

  // Row click handler
  const handleRowClick = (podcast: any, index: any) => {
    // ALERT when row is clicked
    alert(`🎵 ROW CLICKED!

Podcast: ${podcast.podcastTitle}
Index: ${index}

Now calling getPodcastDetail...`);
    
    // Call getPodcastDetail exactly like your Laravel code
    getPodcastDetail(
      podcast.id.toString(),
      podcast.podcastTitle,
      podcast.podcastDescription,
      podcast.audioclipimg,
      new Date().toLocaleDateString(),
      podcast.audioclip
    );
  };

  // Reset counter
  const resetCounter = () => {
    alertCount = 0;
    alert('🔄 COUNTER RESET TO 0');
  };

  if (loading) {
    return <div>લોડ થઈ રહ્યું છે...</div>;
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
                <h1>🚨 ALERT ONLY - Double Call Test</h1>
                <p><strong>Current Index:</strong> {currentPodcastIndex}</p>
                <p><strong>Alert Counter:</strong> {alertCount}</p>
                
                <audio 
                  id="alertAudio" 
                  controls 
                  style={{ width: '100%', marginBottom: '20px' }}
                >
                </audio>

                <div style={{ marginBottom: '20px' }}>
                  <button 
                    onClick={resetCounter}
                    style={{ 
                      padding: '15px 30px', 
                      backgroundColor: '#dc3545', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    🔄 RESET COUNTER
                  </button>
                </div>

                <div className="podcast-list">
                  {podcasts.map((podcast, index) => (
                    <div 
                      key={podcast.id}
                      className={`podcast-item ${index === currentPodcastIndex ? 'active' : ''}`}
                      style={{ 
                        padding: '25px', 
                        margin: '15px 0', 
                        border: '4px solid',
                        borderColor: index === currentPodcastIndex ? '#007bff' : '#ccc',
                        backgroundColor: index === currentPodcastIndex ? '#e3f2fd' : 'white',
                        cursor: 'pointer',
                        borderRadius: '10px'
                      }}
                      onClick={() => handleRowClick(podcast, index)}
                    >
                      <h2 style={{ margin: '0 0 15px 0', color: '#333' }}>
                        #{index + 1} - {podcast.podcastTitle}
                      </h2>
                      <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '16px' }}>
                        {podcast.podcastDescription}
                      </p>
                      <span style={{ fontSize: '14px', color: '#999' }}>
                        Duration: {podcast.audiocliptime}
                      </span>
                      {index === currentPodcastIndex && (
                        <div style={{ 
                          color: '#007bff', 
                          fontWeight: 'bold', 
                          marginTop: '15px',
                          fontSize: '18px'
                        }}>
                          ▶️ Currently Playing
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ 
                  marginTop: '30px', 
                  padding: '25px', 
                  backgroundColor: '#fff3cd', 
                  borderRadius: '10px',
                  border: '3px solid #ffc107'
                }}>
                  <h3 style={{ color: '#856404', marginBottom: '20px' }}>🚨 DOUBLE CALL TEST INSTRUCTIONS:</h3>
                  <div style={{ fontSize: '18px', lineHeight: '1.8' }}>
                    <p><strong>1. Click "RESET COUNTER" button</strong></p>
                    <p><strong>2. Click any podcast row ONCE</strong></p>
                    <p><strong>3. Count the alerts you see:</strong></p>
                    <ul style={{ marginLeft: '20px' }}>
                      <li><strong>NORMAL:</strong> 2 alerts total
                        <ul style={{ marginLeft: '20px' }}>
                          <li>Alert 1: "ROW CLICKED!"</li>
                          <li>Alert 2: "ALERT #1 FUNCTION CALLED"</li>
                        </ul>
                      </li>
                      <li><strong>DOUBLE CALL PROBLEM:</strong> 3+ alerts total
                        <ul style={{ marginLeft: '20px' }}>
                          <li>Alert 1: "ROW CLICKED!"</li>
                          <li>Alert 2: "ALERT #1 FUNCTION CALLED"</li>
                          <li>Alert 3: "ALERT #2 FUNCTION CALLED" ← PROBLEM!</li>
                        </ul>
                      </li>
                    </ul>
                  </div>
                  <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    backgroundColor: '#f8d7da', 
                    borderRadius: '5px',
                    border: '2px solid #f5c6cb'
                  }}>
                    <strong style={{ fontSize: '18px' }}>🚨 IF YOU SEE "ALERT #2" AFTER ONE CLICK = DOUBLE CALL CONFIRMED!</strong>
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
