import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { organizeMusic } from './services/musicService.js';
import { AppError } from './errors/AppError.js';
import { errorHandler } from './utils/errorHandler.js';
import { logger } from './utils/logger.js';
import config from '../config.json' assert { type: 'json' };

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/organize', (req: Request, res: Response, next: NextFunction) => {
    try {
        const sourceDirectory = req.query.source as string || config.sourceDirectory;
        const targetDirectory = req.query.target as string || config.targetDirectory;

        if (!sourceDirectory || !targetDirectory) {
            throw new AppError('Source and target directories are required', 400);
        }

        organizeMusic(sourceDirectory, targetDirectory);
        res.status(200).json({ message: 'Music files organized successfully' });
    } catch (error) {
        next(error);
    }
});

// Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});

