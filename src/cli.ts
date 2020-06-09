/**
 * if-changed CLI Script
 *
 * Usage: ifc < -c configFilePath > < -o outputHashFilePath > cmd_to_execute
 * Defaults:
 *  - configFilePath - ./ifc.json
 *  - outputHashFilePath - ./ifc_hash
 */

import glob from 'glob';
import { runIfc } from '.';
import { parseConfigFile } from './config-parser';
import { env } from './env';


/************************************************
 *                  SCRIPT START
 ************************************************/

(async () => {
  const config = await parseConfigFile(env.configFilePath);
  console.log(config.files);
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


  runIfc(files, env.hashMapFile, env.cmd);
})();

