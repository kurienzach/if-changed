import log, { Logger } from 'console-log-level';
import { promises as fs } from 'fs';
import { ICLIOpts } from './cli';
import { getFileHash } from './hash-generator';
import { runCmd } from './spawn';

interface IFileToHashMap {
  [file: string]: string;
}

let logger: Logger;

const writeHashFile = async (
  fileToHashMap: IFileToHashMap,
  hashFile: string
) => {
  logger.debug('Writing new checksum to file', fileToHashMap);
  return fs.writeFile(hashFile, JSON.stringify(fileToHashMap));
};

const shouldRun = async (
  files: string[],
  prevHashMap: IFileToHashMap
): Promise<[boolean, IFileToHashMap]> => {
  const newHashMap = (await Promise.all(files.map(getFileHash))).reduce<
    IFileToHashMap
  >((map, hash, index) => {
    map[files[index]] = hash;
    return map;
  }, {});

  if (files.length !== Object.values(prevHashMap).length) {
    return [true, newHashMap];
  }

  const needsRun = files.some((file): boolean | void => {
    logger.debug(
      `Comparing hash map for ${file}, Old: ${prevHashMap[file]} New: ${newHashMap[file]}`
    );
    if (prevHashMap[file] !== newHashMap[file]) {
      return true;
    }
    return false;
  });

  return [needsRun, newHashMap];
};

const runIfc = async (
  files: string[],
  prevHashMap: IFileToHashMap,
  cmd: string,
  opts: ICLIOpts
) => {
  logger = log({ level: opts.logLevel });
  logger.debug('Files to compute checksum for');
  logger.debug(files);
  logger.debug('Previous checksum');
  logger.debug(prevHashMap);
  const [needsRun, newHashMap] = await shouldRun(files, prevHashMap);
  if (needsRun) {
    logger.info(`Checksums do not match, running cmd '${cmd}'`);
    runCmd(cmd)
      .then(async ret => {
        if (ret === 0) {
          await writeHashFile(newHashMap, opts.hashMapFile);
        } else {
          logger.debug(`${cmd} returned ${ret}, not updating checksum file`);
        }
      })
      .catch(() => {
        logger.debug(`${cmd} failed, not updating checksum file`);
      });
  } else {
    logger.info(`Checksums match, not running cmd '${cmd}'`);
  }
};

export { runIfc, IFileToHashMap };
