/**
 * Config object
 */

import { LogLevelNames } from 'console-log-level';
import minimist from 'minimist';

const DEFAULT_CONFIG_FILE = './ifc.json';
const DEFAULT_HASHMAP_FILE = 'ifc_hash';

/**
 * CLI Args map interface
 */
interface ICLIArgs {
  c: string;
  o: string;
  v: LogLevelNames;
}

/**
 * Inteface for parsed CLI Args
 */
interface IConfig {
  cmd: string;
  configFilePath: string;
  hashMapFile: string;
  logLevel: LogLevelNames;
}

let env: IConfig;

/**
 * Convert raw CLI args map to intuitive ICLIOpts
 */
const parseArgs = () => {
  const argv = minimist<ICLIArgs>(process.argv.slice(2));

  // Get config file if provided
  const configFilePath = argv.c || DEFAULT_CONFIG_FILE;
  const hashMapFile = argv.o || DEFAULT_HASHMAP_FILE;
  const logLevel = argv.v || 'info';
  const cmd = argv._.join(' ');

  env = {
    cmd,
    configFilePath,
    hashMapFile,
    logLevel,
  };
};

parseArgs();

export { env, IConfig };
