import React, { useState, useRef } from 'react';
import { Folder, Cookie, Download, Search, AlertTriangle, FileText, X, ChevronDown, Square, Settings } from 'lucide-react';
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
        setUrl('');
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
      // @ts-ignore 
      if (window.showDirectoryPicker) {
        // @ts-ignore
        const handle = await window.showDirectoryPicker();
        onUpdateSettings({ downloadDir: handle.name });
      }
    } catch (err) {
      console.error("Directory selection cancelled", err);
    }
  };

  const handleLoadCookieFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdateSettings({ cookiesLoaded: true });
      setShowCookieMenu(false);
    }
  };

  const handleLoadCookieBrowser = () => {
    onUpdateSettings({ cookiesLoaded: true });
    setShowCookieMenu(false);
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
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 text-sm">
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          
          {/* Browser Selector (for command generation) */}
          <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded border border-zinc-600">
            <label className="text-xs text-zinc-400 pl-2">Browser:</label>
            <select 
              value={settings.browser || 'firefox'}
              onChange={(e) => onUpdateSettings({ browser: e.target.value })}
              className="bg-zinc-700 text-white text-xs rounded border-none py-1 px-2 cursor-pointer"
            >
              <option value="firefox">Firefox</option>
              <option value="chrome">Chrome</option>
              <option value="edge">Edge</option>
            </select>
          </div>

          {/* Cookie Loader */}
          <div className="relative">
            <button
              onClick={() => setShowCookieMenu(!showCookieMenu)}
              className={`px-3 py-1.5 rounded flex items-center gap-2 transition-colors border border-zinc-600 ${settings.cookiesLoaded ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-zinc-700 hover:bg-zinc-600 text-white'}`}
            >
              <Cookie size={14} />
              {settings.cookiesLoaded ? 'Cookies Active' : 'Load Cookies'}
              <ChevronDown size={12} />
            </button>

            {showCookieMenu && (
              <div className="absolute top-full left-0 mt-2 w-60 bg-zinc-800 border border-zinc-600 rounded shadow-xl z-50 flex flex-col overflow-hidden">
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
            <input type="file" ref={cookieFileInputRef} onChange={handleLoadCookieFile} accept=".txt" className="hidden" />
          </div>

          {/* Manual Folder Input */}
          <div className="flex items-center gap-2 flex-1 xl:flex-none min-w-[250px]">
            <div className="flex items-center bg-zinc-700 rounded border border-zinc-600 overflow-hidden flex-1">
              <button onClick={handleFolderSelect} className="px-3 py-2 hover:bg-zinc-600 border-r border-zinc-600 text-zinc-300">
                <Folder size={16} />
              </button>
              <input 
                type="text" 
                value={settings.downloadDir}
                onChange={(e) => onUpdateSettings({ downloadDir: e.target.value })}
                className="bg-transparent border-none text-white text-xs px-2 py-1.5 w-full outline-none font-mono"
                placeholder="Set Download Folder..."
              />
            </div>
          </div>

        </div>

        {/* Download All / Stop Queue Action */}
        {isQueueRunning ? (
          <button
            onClick={onStopQueue}
            className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded font-bold flex items-center gap-2 transition-colors xl:ml-auto shadow-lg shadow-red-900/20 w-full xl:w-auto justify-center"
          >
            <Square size={18} fill="currentColor" />
            Stop Queue
          </button>
        ) : (
          <button
            onClick={onDownloadAll}
            disabled={!hasVideos}
            className={`px-5 py-2 rounded font-bold flex items-center gap-2 transition-colors xl:ml-auto w-full xl:w-auto justify-center ${
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

      {showCookieMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setShowCookieMenu(false)}></div>
      )}
    </div>
  );
};

export default ControlPanel;