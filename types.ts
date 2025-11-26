export interface FileData {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface GenerationResult {
  originalImage: string;
  generatedImage: string;
}

export interface GalleryItem {
  id: string;
  timestamp: number;
  resultImage: string; // Base64 or URL
  originalImagePreview: string; // For reference
}

export interface StyleSuggestion {
  id: string;
  title: string;
  description: string;
  color: string;
  reasoning: string;
}