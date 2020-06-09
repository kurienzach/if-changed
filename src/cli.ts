/**
 * if-changed CLI Script
 * Author: Kurien Zacharia
 *
 * Usage: ifc < -c configFilePath > < -o outputHashFilePath > cmd_to_execute
 * Defaults:
 *  - configFilePath - ./ifc.json
 *  - outputHashFilePath - ./ifc_hash
 */

import { LogLevelNames } from "console-log-level";
import glob from "glob";
import minimist from "minimist";
import { runIfc } from ".";
import { parseConfigFile } from "./config-parser";
import { readHashMapFile } from "./hash-generator";

/************************************************
 *              CONSTANTS & TYPES
 ************************************************/

const DEFAULT_CONFIG_FILE = "./ifc.json";
const DEFAULT_HASHMAP_FILE = "ifc_hash";

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
interface ICLIOpts {
  cmd: string;
  configFilePath: string;
  hashMapFile: string;
  logLevel: LogLevelNames;
}

/**
 * Convert raw CLI args map to intuitive ICLIOpts
 */
const parseArgs = (): ICLIOpts => {
  const argv = minimist<ICLIArgs>(process.argv.slice(2));
  console.log(argv);

  // Get config file if provided
  const configFilePath = argv.c || DEFAULT_CONFIG_FILE;
  const hashMapFile = argv.o || DEFAULT_HASHMAP_FILE;
  const logLevel = argv.v || "error";
  const cmd = argv._.join(' ');

  return {
    cmd,
    configFilePath,
    hashMapFile,
    logLevel,
  };
};

/************************************************
 *                  SCRIPT START
 ************************************************/

(async () => {
  const opts = parseArgs();
  const config = await parseConfigFile(opts.configFilePath);
  const files = (
    await Promise.all(
      config.files.map(
        (file): Promise<string[]> => {
          return new Promise((resolve, reject) => {
            glob(file, (err, res) => {
              if (err) {
                reject(err);
              }
              resolve(res);
            });
          });
        }
      )
    )
  ).flat();

  const prevHashMap = await readHashMapFile(opts.hashMapFile);

  runIfc(files, prevHashMap, opts.cmd, opts);
})();

export { ICLIOpts };
