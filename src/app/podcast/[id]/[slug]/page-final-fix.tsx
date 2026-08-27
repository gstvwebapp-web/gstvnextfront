'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// SIMPLE: One global variable to track current playing index
let CURRENT_PLAYING_INDEX = 0;

export default function PodcastFinalPage() {
  const params = useParams();
  const [podcasts, setPodcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPodcastIndex, setCurrentPodcastIndex] = useState(0);

  useEffect(() => {
    // Your actual API call here - I'm using mock data
    const mockPodcasts = [
      {
        id: 1,
        podcastTitle: "Podcast 1",
        podcastDescription: "Description 1",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05",
        created_at: "2024-01-01"
      },
      {
        id: 2,
        podcastTitle: "Podcast 2",
        podcastDescription: "Description 2", 
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05",
        created_at: "2024-01-02"
      },
      {
        id: 3,
        podcastTitle: "Podcast 3",
        podcastDescription: "Description 3",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav", 
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "0:05",
        created_at: "2024-01-03"
      }
    ];

    setPodcasts(mockPodcasts);
    setLoading(false);
  }, []);

  // SIMPLE: Play podcast function
  const playPodcast = (index: any) => {
    console.log('Playing podcast at index:', index);
    
    // Update both React state and global variable
    setCurrentPodcastIndex(index);
    CURRENT_PLAYING_INDEX = index;
    
    const audio = document.getElementById('simpleAudio') as HTMLAudioElement;
    if (audio && podcasts[index]) {
      audio.src = podcasts[index].audioclip;
      
      // Remove old event listener
      audio.removeEventListener('ended', handleAudioEnded);
      
      // Add new event listener
      audio.addEventListener('ended', handleAudioEnded);
      
      audio.play();
    }
  };

  // SIMPLE: Handle when audio ends
  function handleAudioEnded() {
    console.log('Audio ended at index:', CURRENT_PLAYING_INDEX);
    
    // Calculate next index
    const nextIndex = (CURRENT_PLAYING_INDEX + 1) < podcasts.length ? (CURRENT_PLAYING_INDEX + 1) : 0;
    console.log('Playing next at index:', nextIndex);
    
    // Play next podcast
    setTimeout(() => {
      playPodcast(nextIndex);
    }, 500);
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
                <h1>FINAL SIMPLE FIX</h1>
                <p>Current Index: {currentPodcastIndex}</p>
                <p>Global Index: {CURRENT_PLAYING_INDEX}</p>
                
                <audio 
                  id="simpleAudio" 
                  controls 
                  style={{ width: '100%', marginBottom: '20px' }}
                >
                </audio>

                <button 
                  onClick={() => playPodcast(0)}
                  style={{ margin: '5px', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
                >
                  Test: Play First Podcast
                </button>

                <div className="podcast-list">
                  {podcasts.map((podcast, index) => (
                    <div 
                      key={podcast.id}
                      className={`podcast-item ${index === currentPodcastIndex ? 'active' : ''}`}
                      style={{ 
                        padding: '15px', 
                        margin: '10px 0', 
                        border: '2px solid',
                        borderColor: index === currentPodcastIndex ? '#007bff' : '#ccc',
                        backgroundColor: index === currentPodcastIndex ? '#e3f2fd' : 'white',
                        cursor: 'pointer',
                        borderRadius: '8px'
                      }}
                      onClick={() => playPodcast(index)}
                    >
                      <h3>#{index + 1} - {podcast.podcastTitle}</h3>
                      <p>{podcast.podcastDescription}</p>
                      <span>Duration: {podcast.audiocliptime}</span>
                      {index === currentPodcastIndex && (
                        <div style={{ color: 'blue', fontWeight: 'bold', marginTop: '5px' }}>
                          ▶️ Currently Playing
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                  <h4>🧪 Test Instructions:</h4>
                  <ol>
                    <li>Click "Test: Play First Podcast" button</li>
                    <li>Let it finish (5 seconds) - should auto-play Podcast 2</li>
                    <li>Let Podcast 2 finish - should auto-play Podcast 3</li>
                    <li>Watch console logs (F12) to see progression</li>
                  </ol>
                  <p><strong>Expected:</strong> 1 → 2 → 3 → 1 (proper sequence)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
