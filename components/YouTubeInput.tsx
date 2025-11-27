
import React, { useState } from 'react';
import { YoutubeIcon } from './Icons';
import { getYoutubeVideoId } from '../utils/youtubeUtils';
import { YoutubeVideo } from '../types';

interface YouTubeInputProps {
  onVideoSelected: (video: YoutubeVideo) => void;
}

const YouTubeInput: React.FC<YouTubeInputProps> = ({ onVideoSelected }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) return;

    const id = getYoutubeVideoId(url);
    if (!id) {
      setError('Por favor, insira uma URL válida do YouTube.');
      return;
    }

    onVideoSelected({
      id,
      url,
      title: `YouTube Video (${id})` // We can't easily fetch the title without API key
    });
    setUrl('');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors duration-200">
      <div className="mb-4 bg-red-100 dark:bg-red-900/50 p-3 rounded-full text-red-600 dark:text-red-400">
        <YoutubeIcon className="w-8 h-8" />
      </div>
      
      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">Transcrever YouTube / Shorts</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center max-w-sm">
        Cole o link de um vídeo do YouTube ou Shorts para extrair e transcrever o áudio.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/shorts/..."
            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm placeholder-slate-400"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors text-sm shadow-sm"
          >
            Carregar
          </button>
        </div>
        {error && (
          <p className="mt-2 text-xs text-red-500 dark:text-red-400">{error}</p>
        )}
      </form>
    </div>
  );
};

export default YouTubeInput;
