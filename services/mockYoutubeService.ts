import { VideoData } from '../types';

// Mocks the behavior of yt-dlp extraction
export const fetchVideoMetadata = async (url: string): Promise<VideoData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Regex to detect playlist ID in standard or embedded URLs
      // Matches ?list=ID or &list=ID
      const listMatch = url.match(/[?&]list=([^&]+)/);
      const isPlaylist = !!listMatch || url.includes('/playlist');
      
      if (isPlaylist) {
        // Generate deterministic mock data so thumbnails don't change on refresh
        resolve(Array.from({ length: 6 }).map((_, i) => {
          // Use a fixed seed based on index for consistency
          const seed = i + 45; 
          return {
            id: `pl-vid-${i}-${seed}`,
            title: `Complete Python Course 2024 - Lesson ${i + 1}`,
            uploader: 'Programming Academy',
            // Use specific ID-based unsplash/picsum images for consistency
            thumbnail: `https://picsum.photos/id/${seed + 10}/320/180`,
            duration: `${3 + i}:45`,
            status: 'idle',
            progress: 0,
            speed: '0 MB/s',
            format: 'mp4',
            quality: '720p'
          };
        }));
      } else {
        resolve([{
          id: `vid-${Math.random().toString(36).substring(7)}`,
          title: 'Understanding React Hooks in 2024 - Complete Guide',
          uploader: 'Tech Educator',
          thumbnail: 'https://picsum.photos/id/237/320/180',
          duration: '12:30',
          status: 'idle',
          progress: 0,
          speed: '0 MB/s',
          format: 'mp4',
          quality: '1080p'
        }]);
      }
    }, 1000); // Simulate network delay
  });
};