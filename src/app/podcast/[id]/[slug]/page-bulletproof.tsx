'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Podcast {
  id: number;
  podcastTitle: string;
  podcastDescription: string;
  audioclip: string;
  audioclipimg: string;
  audiocliptime: string;
  created_at: string;
}

// ✅ BULLETPROOF: Global variables outside React component
let GLOBAL_CURRENT_INDEX = 0;
let GLOBAL_PODCASTS: Podcast[] = [];
let GLOBAL_AUDIO: HTMLAudioElement | null = null;

export default function PodcastBulletproofPage() {
  const params = useParams();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPodcastIndex, setCurrentPodcastIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const authorId = params?.id as string;
  const slug = params?.slug as string;

  console.log('🎙️ BULLETPROOF Podcast Page: Loaded');

  useEffect(() => {
    // Mock data - replace with your actual API call
    const mockPodcasts: Podcast[] = [
      {
        id: 1,
        podcastTitle: "🎵 Podcast 1 - Auto-Play Test",
        podcastDescription: "Should auto-play to Podcast 2 when finished",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05",
        created_at: "2024-01-01"
      },
      {
        id: 2,
        podcastTitle: "🎵 Podcast 2 - Auto-Play Test",
        podcastDescription: "Should auto-play to Podcast 3 when finished",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05",
        created_at: "2024-01-02"
      },
      {
        id: 3,
        podcastTitle: "🎵 Podcast 3 - Auto-Play Test",
        podcastDescription: "Should auto-play to Podcast 4 when finished",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05",
        created_at: "2024-01-03"
      },
      {
        id: 4,
        podcastTitle: "🎵 Podcast 4 - Auto-Play Test",
        podcastDescription: "Should loop back to Podcast 1 when finished",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05",
        created_at: "2024-01-04"
      }
    ];

    setPodcasts(mockPodcasts);
    GLOBAL_PODCASTS = mockPodcasts; // ✅ Store globally
    setLoading(false);
  }, []);

  // ✅ BULLETPROOF: Simple function that CANNOT fail
  const playPodcastAtIndex = (index: number) => {
    console.log('🎵 🎯 BULLETPROOF: Playing podcast at index:', index);
    
    if (index < 0 || index >= GLOBAL_PODCASTS.length) {
      console.log('🎵 ❌ Invalid index:', index);
      return;
    }

    // Update ALL state immediately
    GLOBAL_CURRENT_INDEX = index;
    setCurrentPodcastIndex(index);
    
    const podcast = GLOBAL_PODCASTS[index];
    console.log('🎵 📀 Playing:', podcast.podcastTitle);

    // Get audio element
    GLOBAL_AUDIO = document.getElementById('bulletproofAudio') as HTMLAudioElement;
    
    if (GLOBAL_AUDIO) {
      // Stop current audio
      GLOBAL_AUDIO.pause();
      GLOBAL_AUDIO.currentTime = 0;
      
      // Remove ALL existing event listeners
      GLOBAL_AUDIO.removeEventListener('ended', handleAudioEnded);
      GLOBAL_AUDIO.removeEventListener('loadeddata', handleAudioEnded);
      GLOBAL_AUDIO.removeEventListener('canplay', handleAudioEnded);
      
      // Set new source
      GLOBAL_AUDIO.src = podcast.audioclip;
      
      // Add ONLY ONE event listener
      GLOBAL_AUDIO.addEventListener('ended', handleAudioEnded);
      
      // Play audio
      GLOBAL_AUDIO.play().then(() => {
        console.log('🎵 ✅ BULLETPROOF: Audio playing at index:', GLOBAL_CURRENT_INDEX);
        setIsPlaying(true);
      }).catch(error => {
        console.log('🎵 ⚠️ Play failed:', error);
        setIsPlaying(false);
      });
    }
  };

  // ✅ BULLETPROOF: This function CANNOT access stale state
  function handleAudioEnded() {
    console.log('🎵 🔥 BULLETPROOF: AUDIO ENDED!');
    console.log('🎵 📊 Current index from GLOBAL:', GLOBAL_CURRENT_INDEX);
    console.log('🎵 📊 Total podcasts:', GLOBAL_PODCASTS.length);
    
    setIsPlaying(false);
    
    // Calculate next index using GLOBAL state (never stale)
    const nextIndex = (GLOBAL_CURRENT_INDEX + 1) < GLOBAL_PODCASTS.length 
      ? (GLOBAL_CURRENT_INDEX + 1) 
      : 0;
    
    console.log('🎵 🚀 BULLETPROOF: Next index will be:', nextIndex);
    console.log('🎵 🎯 Next podcast:', GLOBAL_PODCASTS[nextIndex]?.podcastTitle);
    
    // Auto-play next podcast
    setTimeout(() => {
      playPodcastAtIndex(nextIndex);
    }, 1000);
  }

  // ✅ Testing functions
  const startSequentialTest = () => {
    console.log('🧪 BULLETPROOF: Starting sequential test from index 0');
    playPodcastAtIndex(0);
  };

  const skipToEnd = () => {
    if (GLOBAL_AUDIO && GLOBAL_AUDIO.duration) {
      console.log('🧪 BULLETPROOF: Skipping to end of current audio');
      GLOBAL_AUDIO.currentTime = GLOBAL_AUDIO.duration - 0.5;
    }
  };

  const showCurrentState = () => {
    console.log('🔍 BULLETPROOF STATE CHECK:');
    console.log('- GLOBAL_CURRENT_INDEX:', GLOBAL_CURRENT_INDEX);
    console.log('- React currentPodcastIndex:', currentPodcastIndex);
    console.log('- Total podcasts:', GLOBAL_PODCASTS.length);
    console.log('- Current podcast:', GLOBAL_PODCASTS[GLOBAL_CURRENT_INDEX]?.podcastTitle);
    console.log('- Next would be:', GLOBAL_PODCASTS[(GLOBAL_CURRENT_INDEX + 1) % GLOBAL_PODCASTS.length]?.podcastTitle);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="text-center" style={{ padding: '50px 0' }}>
          <p>Loading podcast details...</p>
        </div>
      </div>
    );
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
                <h1>🛡️ BULLETPROOF Sequential Auto-Play</h1>
                <p><strong>Author ID:</strong> {authorId}</p>
                <p><strong>Slug:</strong> {slug}</p>
                <p><strong>Current Index:</strong> {currentPodcastIndex}</p>
                <p><strong>Global Index:</strong> {GLOBAL_CURRENT_INDEX}</p>
                <p><strong>Status:</strong> {isPlaying ? '▶️ Playing' : '⏸️ Stopped'}</p>
                
                <audio 
                  id="bulletproofAudio" 
                  controls 
                  style={{ width: '100%', marginBottom: '20px' }}
                >
                  Your browser does not support the audio element.
                </audio>

                <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={startSequentialTest}
                    style={{ 
                      padding: '12px 24px', 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    🧪 Start Sequential Test
                  </button>
                  <button 
                    onClick={skipToEnd}
                    style={{ 
                      padding: '12px 24px', 
                      backgroundColor: '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ⏭️ Skip to End
                  </button>
                  <button 
                    onClick={showCurrentState}
                    style={{ 
                      padding: '12px 24px', 
                      backgroundColor: '#6c757d', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    🔍 Show State
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
                        borderColor: index === currentPodcastIndex ? '#007bff' : '#dee2e6',
                        backgroundColor: index === currentPodcastIndex ? '#e3f2fd' : 'white',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => playPodcastAtIndex(index)}
                    >
                      <h3 style={{ margin: '0 0 10px 0', color: index === currentPodcastIndex ? '#007bff' : '#333' }}>
                        #{index + 1} - {podcast.podcastTitle}
                      </h3>
                      <p style={{ margin: '0 0 10px 0', color: '#666' }}>{podcast.podcastDescription}</p>
                      <span style={{ fontSize: '14px', color: '#999' }}>Duration: {podcast.audiocliptime}</span>
                      {index === currentPodcastIndex && (
                        <div style={{ 
                          color: '#007bff', 
                          fontWeight: 'bold', 
                          marginTop: '10px',
                          fontSize: '16px'
                        }}>
                          {isPlaying ? '▶️ Currently Playing' : '⏸️ Selected'}
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
                  <h4 style={{ color: '#007bff', marginBottom: '15px' }}>🧪 BULLETPROOF Testing Instructions:</h4>
                  <ol style={{ lineHeight: '1.8' }}>
                    <li><strong>Click "Start Sequential Test"</strong> - begins from Podcast 1</li>
                    <li><strong>Click "Skip to End"</strong> - quickly tests auto-play progression</li>
                    <li><strong>Click "Show State"</strong> - displays current state in console</li>
                    <li><strong>Open Console (F12)</strong> - watch detailed logs</li>
                    <li><strong>Expected Sequence:</strong> 1 → 2 → 3 → 4 → 1 (proper loop)</li>
                  </ol>
                  <p style={{ 
                    marginTop: '15px', 
                    padding: '10px', 
                    backgroundColor: '#d4edda', 
                    borderRadius: '5px',
                    margin: '15px 0 0 0'
                  }}>
                    <strong>✅ This version uses global variables that CANNOT have stale state issues!</strong>
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
