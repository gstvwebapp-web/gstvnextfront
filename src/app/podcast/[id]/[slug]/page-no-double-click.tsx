'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Global variables to prevent double-click and track index
let CURRENT_PLAYING_INDEX = 0;
let IS_PROCESSING_CLICK = false;

export default function PodcastNoDoubleClickPage() {
  const params = useParams();
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPodcastIndex, setCurrentPodcastIndex] = useState(0);

  useEffect(() => {
    // Mock data - replace with your actual API call
    const mockPodcasts = [
      {
        id: 1,
        podcastTitle: "Podcast 1 - No Double Click",
        podcastDescription: "Single click should work properly",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05",
        created_at: "2024-01-01"
      },
      {
        id: 2,
        podcastTitle: "Podcast 2 - No Double Click",
        podcastDescription: "Single click should work properly", 
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05",
        created_at: "2024-01-02"
      },
      {
        id: 3,
        podcastTitle: "Podcast 3 - No Double Click",
        podcastDescription: "Single click should work properly",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", 
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05",
        created_at: "2024-01-03"
      }
    ];

    setPodcasts(mockPodcasts);
    setLoading(false);
  }, []);

  // FIXED: Prevent double-click issue
  const playPodcast = (index, event) => {
    // Prevent default behavior and stop propagation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    console.log('🎵 CLICK DETECTED: Index', index, 'Processing:', IS_PROCESSING_CLICK);
    
    // Prevent double-click by checking if already processing
    if (IS_PROCESSING_CLICK) {
      console.log('🎵 ⚠️ PREVENTED: Double-click detected, ignoring');
      return;
    }
    
    // Set processing flag immediately
    IS_PROCESSING_CLICK = true;
    console.log('🎵 ✅ PROCESSING: Starting to play podcast at index:', index);
    
    // Update both React state and global variable
    setCurrentPodcastIndex(index);
    CURRENT_PLAYING_INDEX = index;
    
    const audio = document.getElementById('noDoubleClickAudio');
    if (audio && podcasts[index]) {
      // Stop current audio first
      audio.pause();
      audio.currentTime = 0;
      
      // Set new source
      audio.src = podcasts[index].audioclip;
      
      // Remove old event listener
      audio.removeEventListener('ended', handleAudioEnded);
      
      // Add new event listener
      audio.addEventListener('ended', handleAudioEnded);
      
      // Play audio
      audio.play().then(() => {
        console.log('🎵 ✅ SUCCESS: Audio started playing at index:', index);
      }).catch(error => {
        console.log('🎵 ❌ FAILED: Play error:', error);
      });
    }
    
    // Clear processing flag after a delay to prevent rapid clicks
    setTimeout(() => {
      IS_PROCESSING_CLICK = false;
      console.log('🎵 🔓 UNLOCKED: Ready for next click');
    }, 500); // 500ms delay to prevent double-click
  };

  // Handle when audio ends - auto-play next
  function handleAudioEnded() {
    console.log('🎵 🔥 AUDIO ENDED at index:', CURRENT_PLAYING_INDEX);
    
    // Calculate next index
    const nextIndex = (CURRENT_PLAYING_INDEX + 1) < podcasts.length ? (CURRENT_PLAYING_INDEX + 1) : 0;
    console.log('🎵 🚀 AUTO-PLAY: Next index will be:', nextIndex);
    
    // Reset processing flag before auto-play
    IS_PROCESSING_CLICK = false;
    
    // Auto-play next podcast
    setTimeout(() => {
      playPodcast(nextIndex, null);
    }, 1000);
  }

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
                <h1>🚫 NO DOUBLE-CLICK ISSUE - FIXED</h1>
                <p><strong>Current Index:</strong> {currentPodcastIndex}</p>
                <p><strong>Global Index:</strong> {CURRENT_PLAYING_INDEX}</p>
                <p><strong>Processing Click:</strong> {IS_PROCESSING_CLICK ? 'YES' : 'NO'}</p>
                
                <audio 
                  id="noDoubleClickAudio" 
                  controls 
                  style={{ width: '100%', marginBottom: '20px' }}
                >
                </audio>

                <div style={{ marginBottom: '20px' }}>
                  <button 
                    onClick={(e) => playPodcast(0, e)}
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
                    🧪 Test: Play First Podcast
                  </button>
                  
                  <button 
                    onClick={() => {
                      IS_PROCESSING_CLICK = false;
                      console.log('🔓 RESET: Processing flag cleared manually');
                    }}
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
                    🔓 Reset Lock
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
                        borderRadius: '8px',
                        userSelect: 'none' // Prevent text selection that can cause double-click
                      }}
                      onClick={(e) => playPodcast(index, e)}
                      onDoubleClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🎵 ⚠️ DOUBLE-CLICK PREVENTED');
                      }}
                    >
                      <h3 style={{ margin: '0 0 10px 0', userSelect: 'none' }}>
                        #{index + 1} - {podcast.podcastTitle}
                      </h3>
                      <p style={{ margin: '0 0 10px 0', color: '#666', userSelect: 'none' }}>
                        {podcast.podcastDescription}
                      </p>
                      <span style={{ fontSize: '14px', color: '#999', userSelect: 'none' }}>
                        Duration: {podcast.audiocliptime}
                      </span>
                      {index === currentPodcastIndex && (
                        <div style={{ 
                          color: '#007bff', 
                          fontWeight: 'bold', 
                          marginTop: '10px',
                          fontSize: '16px',
                          userSelect: 'none'
                        }}>
                          ▶️ Currently Playing
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ 
                  marginTop: '30px', 
                  padding: '20px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: '10px',
                  border: '2px solid #dee2e6'
                }}>
                  <h4 style={{ color: '#007bff', marginBottom: '15px' }}>🚫 Double-Click Prevention:</h4>
                  <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>Single click only</strong> - double-click is prevented</li>
                    <li><strong>Processing lock</strong> - prevents rapid clicks</li>
                    <li><strong>Event prevention</strong> - stops event bubbling</li>
                    <li><strong>Text selection disabled</strong> - prevents accidental double-click</li>
                    <li><strong>Console logging</strong> - shows click detection (F12)</li>
                  </ul>
                  <p style={{ 
                    marginTop: '15px', 
                    padding: '10px', 
                    backgroundColor: '#d4edda', 
                    borderRadius: '5px',
                    margin: '15px 0 0 0'
                  }}>
                    <strong>✅ Fixed: No more automatic double-click triggering!</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
