import React, { useState, useEffect } from 'react';
import { MusicIcon, DownloadIcon } from './Icons';
import { getYoutubeVideoId, getYoutubeThumbnail } from '../utils/youtubeUtils';

const YoutubeDownloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'converting' | 'completed'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    setError('');
    
    const id = getYoutubeVideoId(newUrl);
    if (id) {
      setVideoId(id);
    } else {
      setVideoId(null);
    }
  };

  const startDownload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoId) {
      setError('Por favor, insira uma URL válida do YouTube.');
      return;
    }

    setStatus('converting');
    setProgress(0);

    // Simulation of download progress
    // In a real app, this would call a backend endpoint
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus('completed');
          return 100;
        }
        // Random increment
        return prev + Math.floor(Math.random() * 10) + 2;
      });
    }, 200);
  };

  const handleReset = () => {
    setUrl('');
    setVideoId(null);
    setStatus('idle');
    setProgress(0);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors duration-200">
      
      {status === 'idle' ? (
        <>
          <div className="mb-4 bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full text-purple-600 dark:text-purple-400">
            <MusicIcon className="w-8 h-8" />
          </div>
          
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">Baixar Áudio do YouTube</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center max-w-sm">
            Converta vídeos do YouTube e Shorts para MP3 de alta qualidade.
          </p>

          <form onSubmit={startDownload} className="w-full max-w-md">
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={url}
                onChange={handleUrlChange}
                placeholder="Cole o link do vídeo aqui..."
                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm placeholder-slate-400"
              />
              
              {videoId && (
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                  <img 
                    src={getYoutubeThumbnail(videoId)} 
                    alt="Thumbnail" 
                    className="w-16 h-12 object-cover rounded"
                  />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                      Vídeo identificado
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">ID: {videoId}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!videoId}
                className={`
                  w-full py-3 rounded-lg font-medium transition-colors shadow-sm
                  ${videoId 
                    ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'}
                `}
              >
                Converter e Baixar
              </button>
            </div>
            {error && (
              <p className="mt-2 text-xs text-red-500 dark:text-red-400 text-center">{error}</p>
            )}
          </form>
        </>
      ) : (
        <div className="w-full max-w-md flex flex-col items-center">
          {videoId && (
             <img 
                src={getYoutubeThumbnail(videoId)} 
                alt="Thumbnail" 
                className="w-32 h-24 object-cover rounded-lg mb-6 shadow-md"
              />
          )}

          {status === 'converting' ? (
            <div className="w-full text-center">
               <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 font-medium mb-4">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Convertendo... {progress}%
               </div>
               <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                  <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
               </div>
            </div>
          ) : (
            <div className="w-full text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DownloadIcon className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Pronto!</h3>
               <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                 Seu arquivo MP3 está pronto para download.
               </p>
               
               <button 
                onClick={() => alert("Em uma aplicação real com backend, o download do arquivo MP3 iniciaria agora.")}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-md transition-colors mb-3"
               >
                 Baixar MP3 (Demo)
               </button>
               
               <button 
                onClick={handleReset}
                className="text-slate-500 dark:text-slate-400 text-sm hover:underline"
               >
                 Converter outro vídeo
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default YoutubeDownloader;
