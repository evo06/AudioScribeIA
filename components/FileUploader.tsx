import React, { useRef } from 'react';
import { UploadIcon, FileAudioIcon } from './Icons';
import { blobToBase64 } from '../utils/audioUtils';
import { AudioFile } from '../types';

interface FileUploaderProps {
  onAudioSelected: (file: AudioFile) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onAudioSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await blobToBase64(file);
      const url = URL.createObjectURL(file);

      onAudioSelected({
        blob: file,
        url,
        base64,
        name: file.name,
        mimeType: file.type || 'audio/mp3', // Fallback if type is missing
      });
    } catch (error) {
      console.error("Error processing file:", error);
      alert("Erro ao processar o arquivo de áudio.");
    }
    
    // Reset input so same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*"
        className="hidden"
      />
      <button
        onClick={handleButtonClick}
        className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-slate-500 transition-all group"
      >
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <UploadIcon className="w-6 h-6" />
        </div>
        <span className="text-slate-700 dark:text-slate-200 font-medium mb-1">Carregar arquivo de áudio</span>
        <span className="text-slate-400 dark:text-slate-500 text-xs">MP3, WAV, M4A, OGG (Max 20MB recomendado)</span>
      </button>
    </div>
  );
};

export default FileUploader;