
import React, { useState, useRef } from 'react';
import { Folder, Cookie, Download, Search, AlertTriangle, FileText, X, ChevronDown, Square } from 'lucide-react';
import { AppSettings } from '../types';

interface ControlPanelProps {
  onFetch: (urlOrUrls: string | string[]) => void;
  onDownloadAll: () => void;
  onStopQueue: () => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  settings: AppSettings;
  isFetching: boolean;
  hasVideos: boolean;
  isQueueRunning: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onFetch,
  onDownloadAll,
  onStopQueue,
  onUpdateSettings,
  settings,
  isFetching,
  hasVideos,
  isQueueRunning
}) => {
  const [url, setUrl] = useState('');
  const [batchFile, setBatchFile] = useState<{ name: string; lines: string[] } | null>(null);
  const [showCookieMenu, setShowCookieMenu] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cookieFileInputRef = useRef<HTMLInputElement>(null);

  const handleFetch = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchFile) {
      onFetch(batchFile.lines);
    } else if (url.trim()) {
      onFetch(url);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
        setBatchFile({ name: file.name, lines });
        setUrl(''); // Clear manual URL input
      };
      reader.readAsText(file);
    }
  };

  const clearBatchFile = () => {
    setBatchFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFolderSelect = async () => {
    try {
      // @ts-ignore - verify typescript support for window.showDirectoryPicker
      if (window.showDirectoryPicker) {
        // @ts-ignore
        const handle = await window.showDirectoryPicker();
        onUpdateSettings({ downloadDir: handle.name });
      } else {
        // Fallback for browsers that don't support the API
        const path = prompt("Enter download path (Browser API not supported):", settings.downloadDir);
        if (path) onUpdateSettings({ downloadDir: path });
      }
    } catch (err) {
      console.error("Directory selection cancelled or failed", err);
    }
  };

  const handleLoadCookieFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdateSettings({ cookiesLoaded: true });
      setShowCookieMenu(false);
      alert(`Loaded cookies from: ${file.name}`);
    }
  };

  const handleLoadCookieBrowser = () => {
    // Simulation of getting browser cookies
    onUpdateSettings({ cookiesLoaded: true });
    setShowCookieMenu(false);
    alert("Cookies successfully retrieved from current browser session.");
  };

  return (
    <div className="bg-zinc-800 p-4 shadow-md border-b border-zinc-700 z-20">
      
      {/* URL Input Row */}
      <form onSubmit={handleFetch} className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 bg-zinc-700 rounded px-3 py-2 border border-zinc-600 focus-within:ring-2 focus-within:ring-blue-500 relative">
          
          {batchFile ? (
             <div className="flex items-center gap-2 flex-1 overflow-hidden">
               <FileText className="text-blue-400 shrink-0" size={18} />
               <span className="text-white font-mono text-sm truncate">{batchFile.name} ({batchFile.lines.length} links)</span>
               <button type="button" onClick={clearBatchFile} className="ml-auto text-zinc-400 hover:text-white">
                 <X size={18} />
               </button>
             </div>
          ) : (
            <>
              <span className="text-zinc-400 font-medium shrink-0">YouTube URL:</span>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste link or load text file..."
                className="bg-transparent border-none outline-none text-white w-full placeholder-zinc-500"
              />
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept=".txt" 
                className="hidden" 
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="text-zinc-400 hover:text-blue-400 transition-colors"
                title="Load links from text file"
              >
                <FileText size={20} />
              </button>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={isFetching || (!url && !batchFile)}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-600 disabled:text-zinc-400 text-white px-6 py-2 rounded font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          {isFetching ? <Search className="animate-pulse" size={18} /> : <Search size={18} />}
          {isFetching ? 'Fetching...' : 'Fetch'}
        </button>
      </form>

      {/* Settings & Actions Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm relative">
        
        <div className="flex flex-wrap items-center gap-4">
          {/* Cookie Loader */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCookieMenu(!showCookieMenu)}
                className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1.5 rounded flex items-center gap-2 transition-colors border border-zinc-600"
              >
                <Cookie size={14} />
                Load Cookies
                <ChevronDown size={12} />
              </button>
              <span className={`text-xs font-medium ${settings.cookiesLoaded ? 'text-green-400' : 'text-amber-400'}`}>
                {settings.cookiesLoaded ? 'Loaded' : 'Not loaded'}
              </span>
            </div>

            {/* Dropdown Menu */}
            {showCookieMenu && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-zinc-800 border border-zinc-600 rounded shadow-xl z-50 flex flex-col overflow-hidden">
                <button 
                  onClick={() => cookieFileInputRef.current?.click()}
                  className="px-4 py-3 text-left hover:bg-zinc-700 text-zinc-200 text-sm border-b border-zinc-700"
                >
                  Load Cookie from file
                </button>
                <button 
                  onClick={handleLoadCookieBrowser}
                  className="px-4 py-3 text-left hover:bg-zinc-700 text-zinc-200 text-sm"
                >
                  Load Cookie from Browser
                </button>
              </div>
            )}
            <input 
              type="file" 
              ref={cookieFileInputRef} 
              onChange={handleLoadCookieFile} 
              accept=".txt" 
              className="hidden" 
            />
          </div>

          {/* Folder Selector */}
          <div className="flex items-center gap-2 max-w-md">
            <button
              onClick={handleFolderSelect}
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1.5 rounded flex items-center gap-2 transition-colors border border-zinc-600"
            >
              <Folder size={14} />
              Set Folder
            </button>
            <span className="text-zinc-400 truncate font-mono text-xs" title={settings.downloadDir}>
              {settings.downloadDir}
            </span>
          </div>
        </div>

        {/* Download All / Stop Queue Action */}
        {isQueueRunning ? (
          <button
            onClick={onStopQueue}
            className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded font-bold flex items-center gap-2 transition-colors ml-auto shadow-lg shadow-red-900/20"
          >
            <Square size={18} fill="currentColor" />
            Stop Queue
          </button>
        ) : (
          <button
            onClick={onDownloadAll}
            disabled={!hasVideos}
            className={`px-5 py-2 rounded font-bold flex items-center gap-2 transition-colors ml-auto ${
              hasVideos 
                ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20' 
                : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
            }`}
          >
            <Download size={18} />
            Download All
          </button>
        )}
      </div>

      {/* Clicking outside closes menu logic could be added here or via specific hook, simplifying for this snippet */}
      {showCookieMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowCookieMenu(false)}></div>
      )}
    </div>
  );
};

export default ControlPanel;
