// src/config/types.ts
export interface SortingRule {
  pattern: string;
  destination: string;
}

export interface MusicSorterConfig {
  sourcePath: string;
  destinationPath: string;
  supportedFormats: string[];
  metadata: {
    preferAlbumArtist: boolean;
    unknownArtistName: string;
    unknownAlbumName: string;
  };
  logging: {
    level: string;
    directory: string;
  };
}
