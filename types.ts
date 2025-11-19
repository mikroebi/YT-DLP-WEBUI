
export type Format = 'mp4' | 'mp3';
export type Quality = '480p' | '720p' | '1080p' | '128k' | '192k' | '256k' | '320k';
export type DownloadStatus = 'idle' | 'downloading' | 'paused' | 'finished' | 'error';

export interface VideoData {
  id: string;
  title: string;
  uploader: string;
  thumbnail: string;
  duration: string;
  status: DownloadStatus;
  progress: number; // 0 to 100
  speed: string;
  format: Format;
  quality: Quality;
}

export interface AppSettings {
  downloadDir: string;
  cookiesLoaded: boolean;
}
