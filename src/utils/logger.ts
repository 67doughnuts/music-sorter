// src/utils/logger.ts
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.join(__dirname, '../../logs');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Custom format for detailed logging
const detailedFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${message}`;
    
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    
    return msg;
});

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Create logger instance
export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        // Console transport with colored output
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple(),
                detailedFormat
            )
        }),
        // Error log file
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: detailedFormat
        }),
        // Combined log file
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: detailedFormat
        })
    ],
    exitOnError: false
});

// Helper methods for structured logging
export const loggers = {
    error: (message: string, metadata?: any) => {
        logger.error(message, metadata);
    },
    warn: (message: string, metadata?: any) => {
        logger.warn(message, metadata);
    },
    info: (message: string, metadata?: any) => {
        logger.info(message, metadata);
    },
    debug: (message: string, metadata?: any) => {
        logger.debug(message, metadata);
    },
    http: (message: string, metadata?: any) => {
        logger.http(message, metadata);
    }
};

// HTTP request logger middleware
export const requestLogger = (req: any, res: any, next: any) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.http(`${req.method} ${req.originalUrl}`, {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            userAgent: req.get('user-agent') || '',
            ip: req.ip
        });
    });
    next();
};

// Stream for Morgan integration (if needed)
export const stream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};

// Test logger configuration
if (process.env.NODE_ENV === 'test') {
    logger.transports.forEach((t) => {
        if (t instanceof winston.transports.File) {
            t.silent = true;
        }
    });
}
