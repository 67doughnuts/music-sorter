import fs from 'fs';
import path from 'path';
import { parseFile, ICommonTagsResult } from 'music-metadata';
import { logger } from '../utils/logger';
import {
    FileNotFoundError,
    MetadataExtractionError,
    DirectoryOperationError,
    FileProcessingError,
    AppError
} from '../errors/AppError';

// Type guard for AppError
function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}

// Read directory contents
export const readDirectory = (directoryPath: string): string[] => {
    try {
        if (!fs.existsSync(directoryPath)) {
            logger.error(`Directory not found: ${directoryPath}`);
            throw new DirectoryOperationError(`Unable to read directory: ${directoryPath}`);
        }
        return fs.readdirSync(directoryPath);
    } catch (error: unknown) {
        if (error instanceof DirectoryOperationError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        logger.error(`Failed to read directory ${directoryPath}:`, {
            error: errorMessage,
            stack: errorStack
        });
        throw new DirectoryOperationError(`Unable to read directory: ${directoryPath}`);
    }
};

// Check if file exists
export const fileExists = (filePath: string): boolean => {
    try {
        return fs.existsSync(filePath);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        logger.error(`Failed to check file existence ${filePath}:`, {
            error: errorMessage,
            stack: errorStack
        });
        throw new FileProcessingError(`Unable to check file existence: ${filePath}`);
    }
};

// Create a directory if it doesn't exist
export const createDirectory = (directoryPath: string): void => {
    try {
        if (!fs.existsSync(directoryPath)) {
            fs.mkdirSync(directoryPath, { recursive: true });
            logger.info(`Created directory: ${directoryPath}`, {
                path: directoryPath,
                operation: 'create'
            });
        }
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        logger.error(`Failed to create directory ${directoryPath}:`, {
            error: errorMessage,
            stack: errorStack
        });
        throw new DirectoryOperationError(`Unable to create directory: ${directoryPath}`);
    }
};

// Move file
export const moveFile = (oldPath: string, newPath: string): void => {
    try {
        if (!fs.existsSync(oldPath)) {
            logger.error(`Source file not found: ${oldPath}`);
            throw new FileProcessingError(`Unable to move file from ${oldPath} to ${newPath}`);
        }

        // Ensure target directory exists
        const targetDir = path.dirname(newPath);
        createDirectory(targetDir);

        fs.renameSync(oldPath, newPath);
        logger.info(`Moved file successfully`, {
            from: oldPath,
            to: newPath,
            operation: 'move'
        });
    } catch (error: unknown) {
        if (error instanceof FileProcessingError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        logger.error(`Failed to move file:`, {
            from: oldPath,
            to: newPath,
            error: errorMessage,
            stack: errorStack
        });
        throw new FileProcessingError(`Unable to move file from ${oldPath} to ${newPath}`);
    }
};

// Get metadata of an audio file
export const getMetadata = async (filePath: string): Promise<ICommonTagsResult> => {
    try {
        if (!fs.existsSync(filePath)) {
            logger.error(`File not found: ${filePath}`);
            throw new FileNotFoundError(filePath);
        }

        const metadata = await parseFile(filePath);
        logger.debug(`Extracted metadata successfully`, {
            file: filePath,
            metadata: metadata.common
        });
        return metadata.common;
    } catch (error: unknown) {
        if (error instanceof FileNotFoundError) {
            throw error;
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorStack = error instanceof Error ? error.stack : undefined;
        
        logger.error(`Failed to extract metadata:`, {
            file: filePath,
            error: errorMessage,
            stack: errorStack
        });
        throw new MetadataExtractionError(`Unable to extract metadata from ${filePath}`);
    }
};

// Optional: Add new utility function for file validation
export const validateAudioFile = (filePath: string): void => {
    const supportedExtensions = ['.mp3', '.flac', '.m4a', '.wav'];
    const extension = path.extname(filePath).toLowerCase();

    if (!supportedExtensions.includes(extension)) {
        throw new FileProcessingError(`Unsupported file type: ${extension}`);
    }

    if (!fs.existsSync(filePath)) {
        throw new FileNotFoundError(filePath);
    }
};
