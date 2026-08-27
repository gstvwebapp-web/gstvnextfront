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

export default function PodcastManualOnlyPage() {
  const params = useParams();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPodcastIndex, setCurrentPodcastIndex] = useState(-1); // -1 means no podcast selected
  const [isPlaying, setIsPlaying] = useState(false);

  const authorId = params?.id as string;
  const slug = params?.slug as string;

  console.log('🎙️ Manual-Only Podcast Page: Loaded');

  useEffect(() => {
    // Mock data - replace with your actual API call
    const mockPodcasts: Podcast[] = [
      {
        id: 1,
        podcastTitle: "🎵 Podcast 1 - Manual Play Only",
        podcastDescription: "Click to play this podcast. No auto-play to next.",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05",
        created_at: "2024-01-01"
      },
      {
        id: 2,
        podcastTitle: "🎵 Podcast 2 - Manual Play Only",
        podcastDescription: "Click to play this podcast. No auto-play to next.",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05",
        created_at: "2024-01-02"
      },
      {
        id: 3,
        podcastTitle: "🎵 Podcast 3 - Manual Play Only",
        podcastDescription: "Click to play this podcast. No auto-play to next.",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05",
        created_at: "2024-01-03"
      },
      {
        id: 4,
        podcastTitle: "🎵 Podcast 4 - Manual Play Only",
        podcastDescription: "Click to play this podcast. No auto-play to next.",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05",
        created_at: "2024-01-04"
      }
    ];

    setPodcasts(mockPodcasts);
    setLoading(false);
  }, []);

  // ✅ MANUAL PLAY ONLY: Play podcast when user clicks, no auto-play
  const playPodcastAtIndex = (index: number) => {
    console.log('🎵 🎯 MANUAL PLAY: User clicked podcast at index:', index);
    
    if (index < 0 || index >= podcasts.length) {
      console.log('🎵 ❌ Invalid index:', index);
      return;
    }

    const podcast = podcasts[index];
    console.log('🎵 📀 Playing:', podcast.podcastTitle);

    // Update current index and highlight
    setCurrentPodcastIndex(index);
    
    // Get audio element
    const audio = document.getElementById('manualAudio') as HTMLAudioElement;
    
    if (audio) {
      // Stop current audio if playing
      audio.pause();
      audio.currentTime = 0;
      
      // Remove any existing event listeners
      audio.removeEventListener('ended', handleAudioEnded);
      audio.removeEventListener('play', handleAudioPlay);
      audio.removeEventListener('pause', handleAudioPause);
      
      // Set new source
      audio.src = podcast.audioclip;
      
      // Add event listeners for UI updates only (no auto-play)
      audio.addEventListener('ended', handleAudioEnded);
      audio.addEventListener('play', handleAudioPlay);
      audio.addEventListener('pause', handleAudioPause);
      
      // Play audio
      audio.play().then(() => {
        console.log('🎵 ✅ MANUAL PLAY: Audio playing at index:', index);
        setIsPlaying(true);
      }).catch(error => {
        console.log('🎵 ⚠️ Play failed:', error);
        setIsPlaying(false);
      });
    }
  };

  // ✅ Handle audio ended - NO AUTO-PLAY, just update UI
  const handleAudioEnded = () => {
    console.log('🎵 🔥 AUDIO ENDED! No auto-play - user must click next podcast manually');
    setIsPlaying(false);
  };

  // ✅ Handle audio play event
  const handleAudioPlay = () => {
    console.log('🎵 ▶️ Audio started playing');
    setIsPlaying(true);
  };

  // ✅ Handle audio pause event
  const handleAudioPause = () => {
    console.log('🎵 ⏸️ Audio paused');
    setIsPlaying(false);
  };

  // ✅ Stop all audio
  const stopAudio = () => {
    const audio = document.getElementById('manualAudio') as HTMLAudioElement;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      console.log('🎵 ⏹️ Audio stopped manually');
    }
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
                <h1>🎯 Manual Play Only - No Auto-Play</h1>
                <p><strong>Author ID:</strong> {authorId}</p>
                <p><strong>Slug:</strong> {slug}</p>
                <p><strong>Selected Podcast:</strong> {currentPodcastIndex >= 0 ? `#${currentPodcastIndex + 1}` : 'None'}</p>
                <p><strong>Status:</strong> {isPlaying ? '▶️ Playing' : '⏸️ Stopped'}</p>
                
                <audio 
                  id="manualAudio" 
                  controls 
                  style={{ width: '100%', marginBottom: '20px' }}
                >
                  Your browser does not support the audio element.
                </audio>

                <div style={{ marginBottom: '20px' }}>
                  <button 
                    onClick={stopAudio}
                    style={{ 
                      padding: '12px 24px', 
                      backgroundColor: '#dc3545', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ⏹️ Stop Audio
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
                  <h4 style={{ color: '#007bff', marginBottom: '15px' }}>🎯 Manual Play Instructions:</h4>
                  <ul style={{ lineHeight: '1.8' }}>
                    <li><strong>Click any podcast row</strong> - highlights and plays that podcast</li>
                    <li><strong>Audio plays only when clicked</strong> - no automatic progression</li>
                    <li><strong>When audio ends</strong> - stops completely, no auto-play</li>
                    <li><strong>Click another row</strong> - switches to that podcast</li>
                    <li><strong>Use "Stop Audio" button</strong> - stops current playback</li>
                  </ul>
                  <p style={{ 
                    marginTop: '15px', 
                    padding: '10px', 
                    backgroundColor: '#d4edda', 
                    borderRadius: '5px',
                    margin: '15px 0 0 0'
                  }}>
                    <strong>✅ No Auto-Play: Each podcast must be manually clicked to play!</strong>
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
