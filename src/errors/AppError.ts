// src/errors/AppError.ts
export class AppError extends Error {
    constructor(message: string, public statusCode: number) {
        super(message);
        this.name = 'AppError';
        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export class FileProcessingError extends AppError {
    constructor(message: string) {
        super(message, 500);
        this.name = 'FileProcessingError';
        Object.setPrototypeOf(this, FileProcessingError.prototype);
    }
}

export class FileNotFoundError extends AppError {
    constructor(path: string) {
        super(`File not found: ${path}`, 404);
        this.name = 'FileNotFoundError';
        Object.setPrototypeOf(this, FileNotFoundError.prototype);
    }
}

export class MetadataExtractionError extends AppError {
    constructor(message: string) {
        super(`Failed to extract metadata: ${message}`, 400);
        this.name = 'MetadataExtractionError';
        Object.setPrototypeOf(this, MetadataExtractionError.prototype);
    }
}

export class InvalidFileTypeError extends AppError {
    constructor(fileType: string) {
        super(`Unsupported file type: ${fileType}`, 400);
        this.name = 'InvalidFileTypeError';
        Object.setPrototypeOf(this, InvalidFileTypeError.prototype);
    }
}

export class ConfigurationError extends AppError {
    constructor(message: string) {
        super(`Configuration error: ${message}`, 500);
        this.name = 'ConfigurationError';
        Object.setPrototypeOf(this, ConfigurationError.prototype);
    }
}

export class DirectoryOperationError extends AppError {
    constructor(message: string) {
        super(`Directory operation failed: ${message}`, 500);
        this.name = 'DirectoryOperationError';
        Object.setPrototypeOf(this, DirectoryOperationError.prototype);
    }
}
