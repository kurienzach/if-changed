import { getFileHash, readHashMapFile, writeHashFile, IFileToHashMap } from './hash-generator';
import { logger } from './logger';
import { runCmd } from './spawn';


/**
 * Check if checksums for files match
 * @param files - List of files to compute hash
 * @param prevHashMap - Previous saved checksums
 */
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

/**
 * Run command ONLY if dependencies have changed
 * @param files - List of files to checksum
 * @param prevHashMap - Previous hashMap of files
 * @param cmd - Command to execute if checksums don't mach
 */
const runIfc = async (
  files: string[],
  hashMapFile: string,
  cmd: string,
) => {
  logger.debug('Files to compute checksum for');
  logger.debug(files);
  logger.debug('Previous checksum');
  const prevHashMap = await readHashMapFile(hashMapFile);
  logger.debug(prevHashMap);
  const [needsRun, newHashMap] = await shouldRun(files, prevHashMap);
  if (needsRun) {
    logger.info(`Checksums do not match, running cmd '${cmd}'`);
    runCmd(cmd)
      .then(async ret => {
        if (ret === 0) {
          await writeHashFile(newHashMap, hashMapFile);
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
