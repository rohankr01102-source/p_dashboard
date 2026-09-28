export type AudioFormat = "wav" | "mp3" | "m4a" | "ogg" | "webm" | "flac" | "aac";

export interface AudioUploadMetadata {
  originalName: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  format: AudioFormat;
  duration?: number;
  sampleRate?: number;
  channels?: number;
  bitrate?: number;
}

export interface RecordingCreateDTO {
  userId: string;
  title: string;
  audioUrl: string;
  duration: number;
  fileSize: number;
  format: string;
  sampleRate?: number;
  channels?: number;
  tags?: string[];
}

export interface RecordingUpdateDTO {
  title?: string;
  tags?: string[];
  isArchived?: boolean;
}
