// src/config/default.ts
import path from 'path';

export const defaultConfig: MusicSorterConfig = {
  sourcePath: './music',
  destinationPath: './sorted',
  supportedFormats: ['.mp3', '.flac', '.m4a', '.wav'],
  metadata: {
    preferAlbumArtist: true,
    unknownArtistName: 'Unknown Artist',
    unknownAlbumName: 'Unknown Album'
  },
  logging: {
    level: 'info',
    directory: 'logs'
  }
};
