'use client';

import { useState, useEffect } from 'react';
import { fetchTopWebStories, WebStory, WebStoryData } from '@/services/newsApi';

interface UseWebStoriesReturn {
  webStories: WebStory[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useWebStories = (): UseWebStoriesReturn => {
  const [webStories, setWebStories] = useState<WebStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      console.log('useWebStories: Starting to fetch web stories...');
      setLoading(true);
      setError(null);

      const data = await fetchTopWebStories();
      console.log('useWebStories: Data received:', data);
      setWebStories(data.topwebstory || []);
    } catch (err) {
      console.error('Error in useWebStories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch web stories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useWebStories: useEffect triggered');
    fetchData();
  }, []);

  const refetch = () => {
    fetchData();
  };

  return {
    webStories,
    loading,
    error,
    refetch
  };
};

// Helper function to parse Story_data JSON
export const parseStoryData = (storyDataString: string): WebStoryData[] => {
  try {
    return JSON.parse(storyDataString);
  } catch (error) {
    console.error('Error parsing story data:', error);
    return [];
  }
};

// Helper function to get the first image from story data
export const getFirstStoryImage = (story: WebStory): string => {
  const storyData = parseStoryData(story.Story_data);
  if (storyData.length > 0 && storyData[0].webimage) {
    // Convert to small image format like in Laravel
    return storyData[0].webimage.replace('.webp', '_small.webp');
  }
  return '/images/video-default.png'; // fallback image
};
