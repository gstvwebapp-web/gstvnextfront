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

export default function PodcastDetailPage() {
  const params = useParams();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPodcastIndex, setCurrentPodcastIndex] = useState(0);

  const authorId = params?.id as string || '';
  const slug = params?.slug as string || '';

  useEffect(() => {
    console.log('🎙️ Podcast Detail Page: Loaded with authorId:', authorId, 'slug:', slug);
    
    // Mock data for testing
    const mockPodcasts: Podcast[] = [
      {
        id: 1,
        podcastTitle: "Test Podcast 1",
        podcastDescription: "Description 1",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "3:45",
        created_at: "2024-01-01"
      },
      {
        id: 2,
        podcastTitle: "Test Podcast 2", 
        podcastDescription: "Description 2",
        audioclip: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
        audioclipimg: "/assets/images/video-default.png",
        audiocliptime: "4:20",
        created_at: "2024-01-02"
      }
    ];

    setPodcasts(mockPodcasts);
    setLoading(false);
  }, [authorId, slug]);

  const playPodcast = (index: number) => {
    console.log('🎵 Playing podcast at index:', index);
    setCurrentPodcastIndex(index);
    
    // Simple audio play logic
    const audio = document.getElementById('audioPlayer') as HTMLAudioElement;
    if (audio) {
      audio.src = podcasts[index].audioclip;
      audio.play().catch(console.error);
    }
  };

  // Handle case where params might be null
  if (!params || !params.id || !params.slug) {
    return (
      <div className="container">
        <div className="text-center" style={{ padding: '50px 0' }}>
          <p>Podcast not found</p>
        </div>
      </div>
    );
  }

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
                <h1>Podcast Detail Page - Working Version</h1>
                <p>Author ID: {authorId}</p>
                <p>Slug: {slug}</p>
                
                <audio id="audioPlayer" controls style={{ width: '100%', marginBottom: '20px' }}>
                  Your browser does not support the audio element.
                </audio>

                <div className="podcast-list">
                  {podcasts.map((podcast, index) => (
                    <div 
                      key={podcast.id}
                      className={`podcast-item ${index === currentPodcastIndex ? 'active' : ''}`}
                      style={{ 
                        padding: '10px', 
                        margin: '5px 0', 
                        border: '1px solid #ccc',
                        backgroundColor: index === currentPodcastIndex ? '#e3f2fd' : 'white',
                        cursor: 'pointer'
                      }}
                      onClick={() => playPodcast(index)}
                    >
                      <h3>{podcast.podcastTitle}</h3>
                      <p>{podcast.podcastDescription}</p>
                      <span>Duration: {podcast.audiocliptime}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
