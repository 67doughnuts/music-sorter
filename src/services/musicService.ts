import path from 'path';
import { readDirectory, moveFile, createDirectory, getMetadata } from './fileService';
import { configService } from '../config';
import { logger } from '../utils/logger';
import { ICommonTagsResult } from 'music-metadata';
import { 
    FileProcessingError, 
    InvalidFileTypeError,
    MetadataExtractionError 
} from '../errors/AppError';

interface ProcessedFile {
    originalPath: string;
    targetPath: string;
    metadata: {
        albumArtist: string;
        album: string;
    };
}

export class MusicService {
    private config = configService.getConfig();

    private validateFileType(filename: string): void {
        const fileExtension = path.extname(filename).toLowerCase();
        if (!this.config.supportedFormats.includes(fileExtension)) {
            throw new InvalidFileTypeError(fileExtension);
        }
    }

    private normalizeMetadata(metadata: ICommonTagsResult): { albumArtist: string; album: string } {
        // More robust artist detection
        let albumArtist = 'Unknown Artist';
        if (metadata.albumartist?.trim()) {
            albumArtist = metadata.albumartist.trim();
        } else if (metadata.artist?.[0]?.trim()) {
            albumArtist = metadata.artist[0].trim();
        } else if (typeof metadata.artist === 'string' && metadata.artist.trim()) {
            albumArtist = metadata.artist.trim();
        }

        const album = metadata.album?.trim() || 'Unknown Album';

        return { albumArtist, album };
    }

    private sanitizePath(input: string): string {
        // Replace invalid characters with underscore
        return input.replace(/[<>:"/\\|?*]/g, '_');
    }

    private async processFile(
        file: string, 
        sourceDirectory: string
    ): Promise<ProcessedFile> {
        const filePath = path.join(sourceDirectory, file);
        
        // Validate file type
        this.validateFileType(file);

        // Get and normalize metadata
        const metadata = await getMetadata(filePath);
        const { albumArtist, album } = this.normalizeMetadata(metadata);

        // Sanitize paths
        const safeArtist = this.sanitizePath(albumArtist);
        const safeAlbum = this.sanitizePath(album);

        const targetPath = path.join(
            this.config.destinationPath,
            safeArtist,
            safeAlbum
        );

        return {
            originalPath: filePath,
            targetPath,
            metadata: { albumArtist, album }
        };
    }

    public async organizeMusic(
        sourceDirectory: string = this.config.sourcePath,
        targetDirectory: string = this.config.destinationPath
    ): Promise<{ successful: number; failed: number }> {
        logger.info('Starting music organization', {
            sourceDirectory,
            targetDirectory
        });

        const stats = {
            successful: 0,
            failed: 0
        };

        try {
            const files = readDirectory(sourceDirectory);
            logger.info(`Found ${files.length} files to process`);

            for (const file of files) {
                try {
                    const processedFile = await this.processFile(file, sourceDirectory);
                    
                    logger.debug('Processing file', {
                        file,
                        metadata: processedFile.metadata
                    });

                    // Create directory and move file
                    createDirectory(processedFile.targetPath);
                    moveFile(
                        processedFile.originalPath,
                        path.join(processedFile.targetPath, file)
                    );

                    logger.info('Successfully processed file', {
                        file,
                        targetPath: processedFile.targetPath
                    });

                    stats.successful++;
                } catch (error) {
                    stats.failed++;
                    
                    if (error instanceof InvalidFileTypeError) {
                        logger.warn(`Skipping unsupported file: ${file}`);
                        continue;
                    }

                    logger.error(`Failed to process file: ${file}`, {
                        error: error instanceof Error ? error.message : 'Unknown error',
                        stack: error instanceof Error ? error.stack : undefined
                    });
                }
            }

            logger.info('Music organization completed', {
                totalProcessed: files.length,
                successful: stats.successful,
                failed: stats.failed
            });

            return stats;
        } catch (error) {
            logger.error('Failed to organize music', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            });
            throw new FileProcessingError('Failed to organize music collection');
        }
    }
}

export const musicService = new MusicService();
export default musicService;
