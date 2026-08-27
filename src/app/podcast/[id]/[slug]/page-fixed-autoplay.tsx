'use client';

import { useState, useEffect, useRef } from 'react';
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

export default function PodcastDetailPageFixed() {
  const params = useParams();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPodcastIndex, setCurrentPodcastIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Use ref to maintain current index across re-renders
  const currentIndexRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const authorId = params?.id as string;
  const slug = params?.slug as string;

  console.log('🎙️ Fixed Podcast Page: Loaded with authorId:', authorId, 'slug:', slug);

  useEffect(() => {
    // Mock data for testing - replace with actual API call
    const mockPodcasts: Podcast[] = [
      {
        id: 1,
        podcastTitle: "First Podcast - Should Auto-Play to Second",
        podcastDescription: "This should auto-play to the second podcast when finished",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05",
        created_at: "2024-01-01"
      },
      {
        id: 2,
        podcastTitle: "Second Podcast - Should Auto-Play to Third", 
        podcastDescription: "This should auto-play to the third podcast when finished",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05",
        created_at: "2024-01-02"
      },
      {
        id: 3,
        podcastTitle: "Third Podcast - Should Auto-Play to Fourth", 
        podcastDescription: "This should auto-play to the fourth podcast when finished",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05",
        created_at: "2024-01-03"
      },
      {
        id: 4,
        podcastTitle: "Fourth Podcast - Should Loop Back to First", 
        podcastDescription: "This should loop back to the first podcast when finished",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05",
        created_at: "2024-01-04"
      }
    ];

    setPodcasts(mockPodcasts);
    setLoading(false);
  }, [authorId, slug]);

  // ✅ CRITICAL FIX: Proper sequential auto-play
  const playPodcastAtIndex = (index: number) => {
    if (index < 0 || index >= podcasts.length) {
      console.log('🎵 ❌ Invalid index:', index);
      return;
    }

    const podcast = podcasts[index];
    console.log('🎵 🎯 Playing podcast at index:', index, 'Title:', podcast.podcastTitle);
    
    // Update both state and ref immediately
    setCurrentPodcastIndex(index);
    currentIndexRef.current = index;
    
    // Get or create audio element
    let audio = audioRef.current;
    if (!audio) {
      audio = document.getElementById('fixedAudioPlayer') as HTMLAudioElement;
      audioRef.current = audio;
    }

    if (audio) {
      // Stop current audio
      audio.pause();
      audio.currentTime = 0;
      
      // Set new source
      audio.src = podcast.audioclip;
      
      // Remove any existing ended listeners to prevent duplicates
      audio.removeEventListener('ended', handleAudioEnded);
      
      // Add the ended listener
      audio.addEventListener('ended', handleAudioEnded);
      
      // Play the audio
      audio.play().then(() => {
        console.log('🎵 ✅ Audio started playing successfully at index:', index);
        setIsPlaying(true);
      }).catch(error => {
        console.log('🎵 ⚠️ Auto-play prevented:', error);
        setIsPlaying(false);
      });
    }
  };

  // ✅ CRITICAL: Handle audio ended event
  const handleAudioEnded = () => {
    console.log('🎵 🔥 AUDIO ENDED! Current index from ref:', currentIndexRef.current);
    console.log('🎵 📊 Total podcasts:', podcasts.length);
    
    setIsPlaying(false);
    
    // Calculate next index using the ref (not state)
    const nextIndex = (currentIndexRef.current + 1) < podcasts.length 
      ? (currentIndexRef.current + 1) 
      : 0;
    
    console.log('🎵 🚀 Auto-playing NEXT podcast at index:', nextIndex);
    console.log('🎵 🎯 Next podcast title:', podcasts[nextIndex]?.podcastTitle);
    
    // Auto-play next podcast after a short delay
    setTimeout(() => {
      playPodcastAtIndex(nextIndex);
    }, 1000);
  };

  // ✅ Testing function
  const testSequentialPlay = () => {
    console.log('🧪 Testing sequential auto-play...');
    playPodcastAtIndex(0);
  };

  const skipToEnd = () => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      console.log('🧪 Skipping to end of current audio...');
      audio.currentTime = audio.duration - 0.5;
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
                <h1>🔧 FIXED Sequential Auto-Play Version</h1>
                <p>Author ID: {authorId}</p>
                <p>Slug: {slug}</p>
                <p>Current Index: {currentPodcastIndex}</p>
                <p>Is Playing: {isPlaying ? '▶️ Playing' : '⏸️ Stopped'}</p>
                
                <audio 
                  id="fixedAudioPlayer" 
                  controls 
                  style={{ width: '100%', marginBottom: '20px' }}
                >
                  Your browser does not support the audio element.
                </audio>

                <div style={{ marginBottom: '20px' }}>
                  <button 
                    onClick={testSequentialPlay}
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
                    🧪 Test Sequential Auto-Play
                  </button>
                  <button 
                    onClick={skipToEnd}
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
                    ⏭️ Skip to End (Test Auto-Play)
                  </button>
                </div>

                <div className="podcast-list">
                  {podcasts.map((podcast, index) => (
                    <div 
                      key={podcast.id}
                      className={`podcast-item ${index === currentPodcastIndex ? 'active' : ''}`}
                      style={{ 
                        padding: '15px', 
                        margin: '10px 0', 
                        border: '2px solid #ccc',
                        backgroundColor: index === currentPodcastIndex ? '#e3f2fd' : 'white',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        borderColor: index === currentPodcastIndex ? '#007bff' : '#ccc'
                      }}
                      onClick={() => playPodcastAtIndex(index)}
                    >
                      <h3>#{index + 1} - {podcast.podcastTitle}</h3>
                      <p>{podcast.podcastDescription}</p>
                      <span>Duration: {podcast.audiocliptime}</span>
                      {index === currentPodcastIndex && (
                        <div style={{ color: 'blue', fontWeight: 'bold', marginTop: '5px' }}>
                          {isPlaying ? '▶️ Currently Playing' : '⏸️ Selected'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <h4>🧪 How to Test:</h4>
                  <ol>
                    <li>Click "Test Sequential Auto-Play" to start from first podcast</li>
                    <li>Click "Skip to End" to quickly test auto-play to next podcast</li>
                    <li>Watch console logs (F12) to see the progression</li>
                    <li>Expected: 1 → 2 → 3 → 4 → 1 (sequential, not always back to 1)</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
