// src/utils/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from './logger.js';

interface ErrorResponse {
    message: string;
    status: number;
    stack?: string;
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let errorResponse: ErrorResponse;

    if (err instanceof AppError) {
        // Log AppError with its specific details
        logger.error(`${err.name}: ${err.message}`, {
            statusCode: err.statusCode,
            path: req.path,
            method: req.method,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });

        errorResponse = {
            message: err.message,
            status: err.statusCode
        };
    } else {
        // Log unknown errors
        logger.error('Unexpected error occurred', {
            error: err.message,
            path: req.path,
            method: req.method,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });

        errorResponse = {
            message: 'Internal Server Error',
            status: 500
        };
    }

    // Add stack trace in development environment
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }

    // Send response
    res.status(errorResponse.status).json(errorResponse);
};

// Async error wrapper to catch promise rejections
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const error = new AppError(`Route not found: ${req.originalUrl}`, 404);
    next(error);
};
