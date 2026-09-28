export interface IRecordingEntity {
  id: string;
  userId: string;
  title: string;
  audioUrl: string;
  duration: number; // in seconds
  uploadDate: Date;
  fileSize: number; // in bytes
  format: string;
  sampleRate: number;
  channels: number;
  bitrate?: number;
  tags: string[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}
