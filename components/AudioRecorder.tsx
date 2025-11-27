import React, { useState, useRef, useEffect } from 'react';
import { MicIcon, StopIcon } from './Icons';
import { blobToBase64, formatTime } from '../utils/audioUtils';
import { AudioFile } from '../types';

interface AudioRecorderProps {
  onAudioCaptured: (file: AudioFile) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioCaptured }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const base64 = await blobToBase64(blob);
        const url = URL.createObjectURL(blob);

        onAudioCaptured({
          blob,
          url,
          base64,
          name: `Gravacao_${new Date().toLocaleTimeString()}.webm`,
          mimeType: 'audio/webm',
        });

        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Não foi possível acessar o microfone. Verifique as permissões.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      <div className="mb-4 text-slate-500 dark:text-slate-400 font-medium">
        {isRecording ? (
          <span className="flex items-center gap-2 text-red-500 animate-pulse">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            Gravando: {formatTime(duration)}
          </span>
        ) : (
          "Clique para gravar um novo áudio"
        )}
      </div>
      
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`
          group relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-lg
          ${isRecording 
            ? 'bg-red-500 hover:bg-red-600 ring-4 ring-red-200 dark:ring-red-900/30' 
            : 'bg-blue-600 hover:bg-blue-700 ring-4 ring-blue-100 dark:ring-blue-900/30 hover:scale-105'}
        `}
      >
        {isRecording ? (
          <StopIcon className="text-white w-8 h-8" />
        ) : (
          <MicIcon className="text-white w-8 h-8" />
        )}
      </button>
      
      <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
        O navegador solicitará permissão para usar o microfone.
      </p>
    </div>
  );
};

export default AudioRecorder;