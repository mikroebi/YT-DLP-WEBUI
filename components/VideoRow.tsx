
import React, { memo } from 'react';
import { VideoData, Format, Quality } from '../types';
import { Download, Play, RefreshCw, FileAudio, FileVideo, Pause } from 'lucide-react';

interface VideoRowProps {
  video: VideoData;
  onUpdateFormat: (id: string, format: Format) => void;
  onUpdateQuality: (id: string, quality: Quality) => void;
  onDownload: (id: string) => void;
  onTogglePause: (id: string) => void;
  onOpen: (id: string) => void;
}

const VideoRow: React.FC<VideoRowProps> = memo(({ video, onUpdateFormat, onUpdateQuality, onDownload, onTogglePause, onOpen }) => {
  
  const isAudio = video.format === 'mp3';
  const qualityOptions = isAudio 
    ? ['128k', '192k', '256k', '320k'] 
    : ['480p', '720p', '1080p'];

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value as Format;
    onUpdateFormat(video.id, newFormat);
    // Reset quality to default for new format
    onUpdateQuality(video.id, newFormat === 'mp3' ? '192k' : '720p');
  };

  // Determine button content based on status
  const renderActionButton = () => {
    if (video.status === 'finished') {
      return (
        <button
          onClick={() => onOpen(video.id)}
          className="flex items-center gap-2 px-4 py-2 rounded font-medium text-sm bg-zinc-700 hover:bg-zinc-600 text-white transition-colors border border-zinc-600"
        >
          <Play size={16} /> Open
        </button>
      );
    }

    if (video.status === 'downloading') {
      return (
        <button
          onClick={() => onTogglePause(video.id)}
          className="flex items-center gap-2 px-4 py-2 rounded font-medium text-sm bg-amber-600 hover:bg-amber-500 text-white transition-colors"
        >
          <Pause size={16} /> Pause
        </button>
      );
    }

    if (video.status === 'paused') {
      return (
        <button
          onClick={() => onTogglePause(video.id)}
          className="flex items-center gap-2 px-4 py-2 rounded font-medium text-sm bg-green-600 hover:bg-green-500 text-white transition-colors"
        >
          <Play size={16} /> Resume
        </button>
      );
    }

    // Idle or Error
    return (
      <button
        onClick={() => onDownload(video.id)}
        className={`flex items-center gap-2 px-4 py-2 rounded font-medium text-sm transition-colors ${
          video.status === 'error' 
            ? 'bg-red-600 hover:bg-red-500 text-white' 
            : 'bg-blue-600 hover:bg-blue-500 text-white'
        }`}
      >
        {video.status === 'error' ? <RefreshCw size={16} /> : <Download size={16} />}
        {video.status === 'error' ? 'Retry' : 'Download'}
      </button>
    );
  };

  return (
    <div className="relative w-full bg-zinc-800 border border-zinc-700 rounded-md overflow-hidden shadow-sm mb-3 group hover:border-zinc-600 transition-colors">
      
      {/* Background Progress Bar (Behind UI Widgets) */}
      <div 
        className={`absolute top-0 bottom-0 left-0 transition-all duration-300 ease-out z-0 ${video.status === 'paused' ? 'bg-amber-600/20' : 'bg-blue-600/20'}`}
        style={{ width: `${video.progress}%` }}
      />
      
      {/* Main Content */}
      <div className="relative z-10 p-3 flex flex-col sm:flex-row items-center gap-4">
        
        {/* Thumbnail */}
        <div className="relative shrink-0">
          <img 
            src={video.thumbnail} 
            alt="thumbnail" 
            className="w-40 h-24 object-cover rounded-sm bg-black/50"
          />
          <div className="absolute bottom-1 right-1 bg-black/80 text-xs px-1 rounded text-white font-mono">
            {video.duration}
          </div>
        </div>

        {/* Info & Controls */}
        <div className="flex-1 w-full min-w-0 flex flex-col justify-between h-24 py-1">
          <div>
            <h3 className="text-white font-bold text-lg truncate leading-tight" title={video.title}>
              {video.title}
            </h3>
            <p className="text-zinc-400 text-sm italic truncate">{video.uploader}</p>
          </div>

          {/* Config Row */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded">
              <label className="text-xs text-zinc-400 flex items-center gap-1">
                {isAudio ? <FileAudio size={14} /> : <FileVideo size={14} />}
                Fmt:
              </label>
              <select 
                value={video.format}
                onChange={handleFormatChange}
                disabled={video.status !== 'idle' && video.status !== 'error'}
                className="bg-zinc-700 text-white text-xs rounded border-none focus:ring-1 focus:ring-blue-500 py-1 px-2 cursor-pointer disabled:opacity-50"
              >
                <option value="mp4">MP4</option>
                <option value="mp3">MP3</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded">
              <label className="text-xs text-zinc-400">Qual:</label>
              <select 
                value={video.quality}
                onChange={(e) => onUpdateQuality(video.id, e.target.value as Quality)}
                disabled={video.status !== 'idle' && video.status !== 'error'}
                className="bg-zinc-700 text-white text-xs rounded border-none focus:ring-1 focus:ring-blue-500 py-1 px-2 cursor-pointer disabled:opacity-50"
              >
                {qualityOptions.map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>
            
            <div className="text-xs text-zinc-500 font-mono">
               {video.status === 'downloading' && `${Math.round(video.progress)}% @ ${video.speed}`}
               {video.status === 'paused' && <span className="text-amber-400">Paused ({Math.round(video.progress)}%)</span>}
               {video.status === 'finished' && <span className="text-green-400">Done</span>}
               {video.status === 'error' && <span className="text-red-400">Failed</span>}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          {renderActionButton()}
        </div>
      </div>
    </div>
  );
});

export default VideoRow;
