import { promises as fs } from 'fs';

const DEFAULT_CONFIG_FILE = './.ifc.json';

interface IConfig {
  files: string[];
}

const defaultConfig: IConfig = {
  files: [],
};

const parseConfigFile = async (configFilePath?: string): Promise<IConfig> => {
  const configFile = configFilePath || DEFAULT_CONFIG_FILE;

  // Try reading the file
  let config: object;
  try {
    config = JSON.parse(await fs.readFile(configFile, 'utf8'));
  } catch (e) {
    config = defaultConfig;
  }

  return config as IConfig;
};

export { parseConfigFile };
