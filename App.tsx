
import React, { useState, useCallback, useEffect } from 'react';
import ControlPanel from './components/ControlPanel';
import VideoRow from './components/VideoRow';
import { VideoData, AppSettings, Format, Quality } from './types';
import { fetchVideoMetadata } from './services/mockYoutubeService';

const App: React.FC = () => {
  // State
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    downloadDir: '/home/user/Downloads/YouTube Downloader',
    cookiesLoaded: false,
  });
  
  // Queue Management State
  const [activeDownloadId, setActiveDownloadId] = useState<string | null>(null);
  const [queue, setQueue] = useState<string[]>([]);

  // Simulate Download Process
  useEffect(() => {
    let progressInterval: number;

    if (activeDownloadId) {
      progressInterval = window.setInterval(() => {
        setVideos((prevVideos) => {
          return prevVideos.map((vid) => {
            if (vid.id !== activeDownloadId) return vid;
            
            // Do not progress if paused
            if (vid.status === 'paused') return vid;

            const newProgress = vid.progress + (Math.random() * 5 + 1);
            
            if (newProgress >= 100) {
              // Finished
              return { ...vid, progress: 100, status: 'finished', speed: '0 MB/s' };
            }
            
            // Update speed randomly
            const speeds = ['2.5 MB/s', '5.1 MB/s', '8.4 MB/s', '12.0 MB/s'];
            const randomSpeed = speeds[Math.floor(Math.random() * speeds.length)];
            
            return { ...vid, progress: newProgress, speed: randomSpeed };
          });
        });
      }, 500);
    }

    return () => clearInterval(progressInterval);
  }, [activeDownloadId]);

  // Monitor completion to trigger next in queue
  useEffect(() => {
    if (!activeDownloadId) return;

    const activeVideo = videos.find(v => v.id === activeDownloadId);
    
    // Check if current download is finished
    if (activeVideo?.status === 'finished') {
      setActiveDownloadId(null);
      // Check queue
      if (queue.length > 0) {
        const [nextId, ...remainingQueue] = queue;
        setQueue(remainingQueue);
        startDownload(nextId);
      }
    }
  }, [videos, activeDownloadId, queue]);


  // Handlers
  const handleFetch = async (urlOrUrls: string | string[]) => {
    setIsFetching(true);
    setVideos([]); // Clear previous results
    
    try {
      let newVideos: VideoData[] = [];
      
      if (Array.isArray(urlOrUrls)) {
        // Batch processing for text file lines
        for (const url of urlOrUrls) {
          if (!url.trim()) continue;
          const result = await fetchVideoMetadata(url);
          // Ensure IDs are unique when adding multiple
          const timestampedResult = result.map(v => ({...v, id: v.id + '-' + Date.now() + Math.random()}));
          newVideos = [...newVideos, ...timestampedResult];
        }
      } else {
        // Single URL processing
        newVideos = await fetchVideoMetadata(urlOrUrls);
      }
      
      setVideos(newVideos);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch video metadata");
    } finally {
      setIsFetching(false);
    }
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateFormat = useCallback((id: string, format: Format) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, format } : v));
  }, []);

  const updateQuality = useCallback((id: string, quality: Quality) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, quality } : v));
  }, []);

  const startDownload = (id: string) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, status: 'downloading', progress: 0 } : v));
    setActiveDownloadId(id);
  };

  const handleTogglePause = (id: string) => {
    setVideos(prev => prev.map(v => {
      if (v.id !== id) return v;
      
      // Toggle between downloading and paused
      if (v.status === 'downloading') {
        return { ...v, status: 'paused' };
      } else if (v.status === 'paused') {
        return { ...v, status: 'downloading' };
      }
      return v;
    }));
  };

  const handleSingleDownload = (id: string) => {
    if (activeDownloadId) {
      // Add to queue if something is already downloading
      setQueue(prev => [...prev, id]);
      // Visual cue could be added for 'queued'
    } else {
      startDownload(id);
    }
  };

  const handleDownloadAll = () => {
    const idleVideoIds = videos
      .filter(v => v.status === 'idle' || v.status === 'error')
      .map(v => v.id);
    
    if (idleVideoIds.length === 0) return;

    const [first, ...rest] = idleVideoIds;
    setQueue(rest);
    startDownload(first);
  };

  const handleStopQueue = () => {
    setQueue([]); // Clear queue
    // The active download continues until finished, but no new ones start
  };

  const handleOpen = (id: string) => {
    alert(`Opening file for video ID: ${id}\nPath: ${settings.downloadDir}`);
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white font-sans">
      <ControlPanel 
        onFetch={handleFetch}
        onDownloadAll={handleDownloadAll}
        onStopQueue={handleStopQueue}
        onUpdateSettings={updateSettings}
        settings={settings}
        isFetching={isFetching}
        hasVideos={videos.length > 0}
        isQueueRunning={queue.length > 0}
      />

      <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
        {videos.length === 0 && !isFetching && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-4">
            <div className="p-6 rounded-full bg-zinc-800/50 border-4 border-zinc-800">
               <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
            </div>
            <p className="text-lg font-medium">Enter a YouTube URL or load a text file to begin</p>
          </div>
        )}

        {isFetching && (
           <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-3">
             <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             <p>Analyzing...</p>
           </div>
        )}

        <div className="max-w-5xl mx-auto">
          {videos.map(video => (
            <VideoRow 
              key={video.id}
              video={video}
              onUpdateFormat={updateFormat}
              onUpdateQuality={updateQuality}
              onDownload={handleSingleDownload}
              onTogglePause={handleTogglePause}
              onOpen={handleOpen}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
