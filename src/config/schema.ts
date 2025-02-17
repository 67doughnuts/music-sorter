// src/config/schema.ts
import { z } from 'zod';

export const configSchema = z.object({
  sourcePath: z.string(),
  destinationPath: z.string(),
  supportedFormats: z.array(z.string()),
  metadata: z.object({
    preferAlbumArtist: z.boolean(),
    unknownArtistName: z.string(),
    unknownAlbumName: z.string()
  }),
  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']),
    directory: z.string()
  })
});
