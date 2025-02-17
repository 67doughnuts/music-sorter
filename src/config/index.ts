// src/config/index.ts
import fs from 'fs';
import path from 'path';
import { defaultConfig } from './default';
import { configSchema } from './schema';
import { MusicSorterConfig } from './types';
import { logger } from '../utils/logger';
import { ConfigurationError } from '../errors/AppError';

export class ConfigService {
  private static instance: ConfigService;
  private config: MusicSorterConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadEnvConfig(): Partial<MusicSorterConfig> {
    return {
      sourcePath: process.env.MUSIC_SORTER_SOURCE_PATH,
      destinationPath: process.env.MUSIC_SORTER_DESTINATION_PATH,
      logging: {
        level: process.env.MUSIC_SORTER_LOG_LEVEL as any,
        directory: process.env.MUSIC_SORTER_LOG_DIR
      }
    };
  }

  private loadFileConfig(): Partial<MusicSorterConfig> {
    const configPath = process.env.CONFIG_PATH || path.join(process.cwd(), 'config.json');
    
    try {
      if (fs.existsSync(configPath)) {
        const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        return fileConfig;
      }
    } catch (error) {
      logger.warn(`Failed to load configuration file: ${configPath}`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    return {};
  }

  private loadConfig(): MusicSorterConfig {
    try {
      // Layer configurations
      const config = {
        ...defaultConfig,
        ...this.loadFileConfig(),
        ...this.loadEnvConfig()
      };

      // Remove undefined values
      Object.keys(config).forEach(key => {
        if (config[key] === undefined) {
          delete config[key];
        }
      });

      // Validate configuration
      const validationResult = configSchema.safeParse(config);

      if (!validationResult.success) {
        throw new ConfigurationError(
          `Invalid configuration: ${validationResult.error.message}`
        );
      }

      // Resolve paths
      config.sourcePath = path.resolve(config.sourcePath);
      config.destinationPath = path.resolve(config.destinationPath);
      config.logging.directory = path.resolve(config.logging.directory);

      logger.info('Configuration loaded successfully', {
        sourcePath: config.sourcePath,
        destinationPath: config.destinationPath
      });

      return config;
    } catch (error) {
      throw new ConfigurationError(
        `Failed to load configuration: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  public getConfig(): MusicSorterConfig {
    return { ...this.config };
  }

  public get<K extends keyof MusicSorterConfig>(key: K): MusicSorterConfig[K] {
    return this.config[key];
  }
}

export const configService = ConfigService.getInstance();
export default configService;
