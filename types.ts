export interface AudioFile {
  blob: Blob;
  url: string;
  name: string;
  mimeType: string;
  base64?: string; // Raw base64 string without data URI prefix
}

export interface YoutubeVideo {
  id: string;
  url: string;
  title?: string;
}

export type MediaSource = 
  | { type: 'file'; data: AudioFile }
  | { type: 'youtube'; data: YoutubeVideo };

export type TranscriptionStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface TranscriptionSegment {
  startTime: string;
  endTime: string;
  text: string;
}

export interface TranscriptionResult {
  text: string;
  segments?: TranscriptionSegment[];
  timestamp: number;
}
