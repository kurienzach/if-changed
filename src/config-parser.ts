/**
 * Reads and parses config files
 * Does auto detection of source files from tsconfig if enabled in config
 */

import { promises as fs } from 'fs';
import { logger } from './logger';

const DEFAULT_CONFIG_FILE = './.ifc.json';

interface IConfig {
  files: string[];
  tsconfigPath?: string;
}

const defaultConfig: IConfig = {
  files: [],
  tsconfigPath: undefined,
};

const parseConfigFile = async (configFilePath?: string): Promise<IConfig> => {
  const configFile = configFilePath || DEFAULT_CONFIG_FILE;

  // Try reading the file
  let config: IConfig;
  try {
    config = JSON.parse(await fs.readFile(configFile, 'utf8'));
  } catch (e) {
    config = defaultConfig;
  }

  // Read file paths from tsconfig if enabled in config
  if (config.tsconfigPath !== undefined) {
    let tsconfig;
    try {
      tsconfig = JSON.parse(await fs.readFile(config.tsconfigPath, 'utf8'));
    } catch (e) {
      logger.error(`Cannot read tsconfig at ${config.tsconfigPath}`);
    }
    if (tsconfig.include) {
      config.files = config.files.concat(tsconfig.include);
    }
    if (tsconfig.filesGlob) {
      config.files = config.files.concat(tsconfig.filesGlob);
    }
    if (tsconfig.files) {
      config.files = config.files.concat(tsconfig.files);
    }
    if (tsconfig.exclude) {
      config.files = config.files.concat(
        tsconfig.exclude.map((path: string) => `!${path}`)
      );
    }
  }

  return config as IConfig;
};

export { parseConfigFile };
