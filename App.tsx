import React, { useState, useEffect, useRef } from 'react';
import AudioRecorder from './components/AudioRecorder';
import FileUploader from './components/FileUploader';
import YouTubeInput from './components/YouTubeInput';
import YoutubeDownloader from './components/YoutubeDownloader';
import { AudioFile, TranscriptionStatus, TranscriptionResult, MediaSource, YoutubeVideo } from './types';
import { transcribeAudio } from './services/geminiService';
import { exportToTXT, exportToDOCX, exportToSRT, exportToPDF } from './utils/exportUtils';
import { 
  SparklesIcon, 
  TrashIcon, 
  CheckIcon, 
  CopyIcon, 
  FileAudioIcon,
  PlayIcon,
  PauseIcon,
  DownloadIcon,
  TxtIcon,
  WordIcon,
  PdfIcon,
  SrtIcon,
  YoutubeIcon,
  SunIcon,
  MoonIcon,
  MusicIcon,
  UploadIcon,
  MicIcon
} from './components/Icons';

export default function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'record' | 'youtube' | 'download'>('upload');
  const [mediaSource, setMediaSource] = useState<MediaSource | null>(null);
  const [status, setStatus] = useState<TranscriptionStatus>('idle');
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Initialize Dark Mode based on system preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  // Update DOM when dark mode changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Cleanup object URL when audio file changes
  useEffect(() => {
    return () => {
      if (mediaSource?.type === 'file' && mediaSource.data.url) {
        URL.revokeObjectURL(mediaSource.data.url);
      }
    };
  }, [mediaSource]);

  // Click outside to close export menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const processTranscription = async (source: MediaSource) => {
    setStatus('processing');
    try {
      const data = await transcribeAudio(source);
      setResult(data);
      setStatus('completed');
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const handleAudioSet = (file: AudioFile) => {
    const source: MediaSource = { type: 'file', data: file };
    setMediaSource(source);
    setResult(null);
    if (audioRef.current) {
      audioRef.current.load();
    }
    processTranscription(source);
  };

  const handleYoutubeSet = (video: YoutubeVideo) => {
    const source: MediaSource = { type: 'youtube', data: video };
    setMediaSource(source);
    setResult(null);
    processTranscription(source);
  }

  const handleRetry = () => {
    if (!mediaSource) return;
    processTranscription(mediaSource);
  };

  const handleReset = () => {
    setMediaSource(null);
    setResult(null);
    setStatus('idle');
    setIsPlaying(false);
    setShowExportMenu(false);
  };

  const handleCopy = () => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text);
    }
  };

  const handleExport = (format: 'txt' | 'pdf' | 'docx' | 'srt') => {
    if (!result) return;
    
    let filename = 'transcricao';
    if (mediaSource?.type === 'file') {
      filename = mediaSource.data.name.split('.')[0];
    } else if (mediaSource?.type === 'youtube') {
      filename = `youtube-${mediaSource.data.id}`;
    }
    
    switch (format) {
      case 'txt': exportToTXT(result, filename); break;
      case 'pdf': exportToPDF(result, filename); break;
      case 'docx': exportToDOCX(result, filename); break;
      case 'srt': exportToSRT(result, filename); break;
    }
    setShowExportMenu(false);
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-900 dark:to-slate-900 p-4 md:p-8 flex flex-col items-center transition-colors duration-200">
      
      {/* Header */}
      <header className="w-full max-w-4xl mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg shadow-lg">
            <SparklesIcon className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Audio Scribe <span className="text-blue-600 dark:text-blue-400">AI</span></h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            Powered by Gemini 2.5 Flash
          </div>
          
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
            title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
          >
            {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Input & Controls */}
        <div className="flex flex-col gap-6">
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-700 transition-colors duration-200">
            {!mediaSource ? (
              <>
                {/* Tabs */}
                <div className="flex border-b border-slate-100 dark:border-slate-700 overflow-x-auto transition-colors duration-200">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`flex-1 py-4 px-2 text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center gap-2 ${
                      activeTab === 'upload' 
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 border-b-2 border-blue-600 dark:border-blue-500' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <UploadIcon className="w-4 h-4" />
                    Upload
                  </button>
                  <button
                    onClick={() => setActiveTab('record')}
                    className={`flex-1 py-4 px-2 text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center gap-2 ${
                      activeTab === 'record' 
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 border-b-2 border-blue-600 dark:border-blue-500' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <MicIcon className="w-4 h-4" />
                    Gravar
                  </button>
                  <button
                    onClick={() => setActiveTab('youtube')}
                    className={`flex-1 py-4 px-2 text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center gap-2 ${
                      activeTab === 'youtube' 
                        ? 'text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 border-b-2 border-red-600 dark:border-red-500' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <YoutubeIcon className="w-4 h-4" />
                    YouTube
                  </button>
                  <button
                    onClick={() => setActiveTab('download')}
                    className={`flex-1 py-4 px-2 text-sm font-medium transition-colors whitespace-nowrap flex items-center justify-center gap-2 ${
                      activeTab === 'download' 
                        ? 'text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/20 border-b-2 border-purple-600 dark:border-purple-500' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <MusicIcon className="w-4 h-4" />
                    Baixar MP3
                  </button>
                </div>

                {/* Input Area */}
                <div className="p-6 min-h-[300px] flex flex-col justify-center">
                  {activeTab === 'upload' && <FileUploader onAudioSelected={handleAudioSet} />}
                  {activeTab === 'record' && <AudioRecorder onAudioCaptured={handleAudioSet} />}
                  {activeTab === 'youtube' && <YouTubeInput onVideoSelected={handleYoutubeSet} />}
                  {activeTab === 'download' && <YoutubeDownloader />}
                </div>
              </>
            ) : (
              /* Selected Media View */
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Mídia Selecionada</h3>
                  <button 
                    onClick={handleReset}
                    className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    title="Remover"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600 mb-6 flex items-center gap-4 transition-colors duration-200">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${mediaSource.type === 'youtube' ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400' : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'}`}>
                    {mediaSource.type === 'youtube' ? <YoutubeIcon className="w-6 h-6" /> : <FileAudioIcon className="w-6 h-6" />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                      {mediaSource.type === 'file' ? mediaSource.data.name : (mediaSource.data.title || 'Vídeo YouTube')}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 uppercase">
                      {mediaSource.type === 'file' ? (mediaSource.data.mimeType.split('/')[1] || 'AUDIO') : 'YOUTUBE'}
                    </p>
                  </div>
                </div>

                {/* Custom Player Controls */}
                <div className="mb-8 rounded-lg overflow-hidden bg-black">
                  {mediaSource.type === 'file' ? (
                    <div className="bg-slate-50 dark:bg-slate-700 p-4 transition-colors duration-200">
                      <audio 
                        ref={audioRef} 
                        src={mediaSource.data.url} 
                        onEnded={() => setIsPlaying(false)}
                        onPause={() => setIsPlaying(false)}
                        onPlay={() => setIsPlaying(true)}
                        className="hidden"
                      />
                      <button
                        onClick={togglePlayback}
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-600 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        {isPlaying ? (
                          <>
                            <PauseIcon className="w-4 h-4" /> Pausar Preview
                          </>
                        ) : (
                          <>
                            <PlayIcon className="w-4 h-4" /> Ouvir Preview
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="aspect-video w-full">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        src={`https://www.youtube.com/embed/${mediaSource.data.id}`} 
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </div>

                {/* Status / Action Area */}
                <div className="mt-2">
                    {status === 'processing' && (
                        <div className="w-full py-4 rounded-xl font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex items-center justify-center gap-3 animate-pulse transition-colors duration-200">
                            <svg className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {mediaSource.type === 'youtube' ? 'Analisando vídeo...' : 'Transcrevendo áudio...'}
                        </div>
                    )}

                    {status === 'completed' && (
                         <div className="w-full py-4 rounded-xl font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 flex items-center justify-center gap-2 transition-colors duration-200">
                            <CheckIcon className="w-5 h-5" />
                            {mediaSource.type === 'youtube' ? 'Processamento Finalizado' : 'Transcrição Concluída'}
                        </div>
                    )}

                    {status === 'error' && (
                         <button
                            onClick={handleRetry}
                            className="w-full py-4 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                        >
                            Tentar Novamente
                        </button>
                    )}
                </div>
              </div>
            )}
          </div>
          
          {/* Info / Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300 transition-colors duration-200">
            <p className="font-semibold mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full"></span>
              Dica Pro:
            </p>
            <p className="opacity-80 leading-relaxed">
              Para melhores resultados, certifique-se de que o áudio tenha pouco ruído de fundo. Você pode exportar o resultado em PDF, DOCX ou SRT para legendas.
            </p>
          </div>

        </div>

        {/* Right Column: Result */}
        <div className="flex flex-col h-full">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-700 flex-1 flex flex-col h-[500px] lg:h-auto min-h-[500px] transition-colors duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-700/50 rounded-t-2xl transition-colors duration-200">
              <h2 className="font-semibold text-slate-700 dark:text-slate-200">Transcrição</h2>
              <div className="flex items-center gap-2">
                {status === 'completed' && result && result.text && !result.text.includes('[LIMITAÇÃO') && (
                  <>
                    {/* Export Menu Dropdown */}
                    <div className="relative" ref={menuRef}>
                      <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
                          ${showExportMenu ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}
                        `}
                      >
                        <DownloadIcon className="w-4 h-4" />
                        Exportar
                      </button>
                      
                      {showExportMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                          <button onClick={() => handleExport('txt')} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
                            <TxtIcon className="w-4 h-4 text-slate-400" /> TXT (Texto)
                          </button>
                          <button onClick={() => handleExport('docx')} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
                            <WordIcon className="w-4 h-4 text-blue-500" /> DOCX (Word)
                          </button>
                          <button onClick={() => handleExport('pdf')} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
                            <PdfIcon className="w-4 h-4 text-red-500" /> PDF (Documento)
                          </button>
                          <button onClick={() => handleExport('srt')} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left border-t border-slate-100 dark:border-slate-700">
                            <SrtIcon className="w-4 h-4 text-amber-500" /> SRT (Legenda)
                          </button>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={handleCopy}
                      className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/50"
                      title="Copiar texto"
                    >
                      <CopyIcon className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative">
              {status === 'idle' && !result && (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 dark:text-slate-600">
                  <FileAudioIcon className="w-16 h-16 mb-4 opacity-20" />
                  <p>O texto transcrito aparecerá aqui</p>
                </div>
              )}

              {status === 'processing' && (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-4/5"></div>
                  <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-full"></div>
                </div>
              )}

              {status === 'error' && (
                <div className="h-full flex flex-col items-center justify-center text-red-500 dark:text-red-400">
                  <p className="font-medium mb-2">Ops! Ocorreu um erro.</p>
                  <p className="text-sm text-center max-w-xs opacity-80">
                    Não foi possível processar o áudio. Verifique se o arquivo é válido ou tente novamente.
                  </p>
                  <button 
                    onClick={handleRetry}
                    className="mt-4 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}

              {result?.text && status !== 'processing' && (
                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {result.text}
                </div>
              )}
            </div>
            
            {status === 'completed' && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-green-50/50 dark:bg-green-900/20 rounded-b-2xl flex items-center justify-center gap-2 text-green-700 dark:text-green-400 text-sm font-medium transition-colors duration-200">
                <CheckIcon className="w-4 h-4" /> Transcrição Concluída
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}