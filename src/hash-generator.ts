/**
 * CHECKSUM Generator code
 * The choice of hash function is based on the benchmarks found
 * at https://github.com/joliss/fast-js-hash-benchmark
 */

import { promises as fs } from 'fs';
import { murmurHash } from 'murmurhash-native';
import { logger } from './logger';

/**
 * Interface for File name to HashMap
 */
interface IFileToHashMap {
  [file: string]: string;
}

async function getFileHash(filePath: string) {
  const data = await fs.readFile(filePath);
  return murmurHash(data).toString();
}

async function readHashMapFile(hashMapFile: string) {
  let hashMap: IFileToHashMap;
  try {
    hashMap = JSON.parse(
      await fs.readFile(hashMapFile, 'utf8')
    ) as IFileToHashMap;
  } catch {
    hashMap = {};
  }

  return hashMap;
}

/**
 * Write checksum to file
 * @param fileToHashMap - Hash map JSON
 * @param hashFile - File to write hashMap
 */
const writeHashFile = async (
  fileToHashMap: IFileToHashMap,
  hashFile: string
) => {
  logger.debug('Writing new checksum to file', fileToHashMap);
  return fs.writeFile(hashFile, JSON.stringify(fileToHashMap));
};

export { getFileHash, readHashMapFile, writeHashFile, IFileToHashMap };
