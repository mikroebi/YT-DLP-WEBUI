import { VideoData } from '../types';

// Mocks the behavior of yt-dlp extraction
export const fetchVideoMetadata = async (url: string): Promise<VideoData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Improved playlist detection: checks for 'list=' param or 'playlist' in path
      // This matches YouTube URL formats like:
      // https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID
      // https://www.youtube.com/playlist?list=PLAYLIST_ID
      const isPlaylist = url.includes('list=') || url.includes('/playlist');
      
      if (isPlaylist) {
        resolve(Array.from({ length: 6 }).map((_, i) => ({
          id: `pl-vid-${i}-${Math.random().toString(36).substring(7)}`,
          title: `Awesome Playlist Track ${i + 1} - Full Version`,
          uploader: 'Music Channel Official',
          thumbnail: `https://picsum.photos/160/90?random=${i + 20}`,
          duration: '3:45',
          status: 'idle',
          progress: 0,
          speed: '0 MB/s',
          format: 'mp4',
          quality: '720p'
        })));
      } else {
        resolve([{
          id: `vid-${Math.random().toString(36).substring(7)}`,
          title: 'Understanding React Hooks in 2024 - Complete Guide',
          uploader: 'Tech Educator',
          thumbnail: 'https://picsum.photos/160/90?random=100',
          duration: '12:30',
          status: 'idle',
          progress: 0,
          speed: '0 MB/s',
          format: 'mp4',
          quality: '1080p'
        }]);
      }
    }, 1500); // Simulate network delay
  });
};