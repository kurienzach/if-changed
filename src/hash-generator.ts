/**
 * CHECKSUM Generator code
 * The choice of hash function is based on the benchmarks found
 * at https://github.com/joliss/fast-js-hash-benchmark
 */

import { promises as fs } from 'fs';
import { murmurHash } from 'murmurhash-native';
import { IFileToHashMap } from './index';

async function getFileHash(filePath: string) {
  const data = await fs.readFile(filePath);
  return murmurHash(data).toString();
}

async function readHashMapFile(hashMapFile: string) {
  let hashMap: IFileToHashMap;
  try {
    hashMap =  JSON.parse(await fs.readFile(hashMapFile, 'utf8')) as IFileToHashMap;
  } catch {
    hashMap = {};
  }

  return hashMap;
}

export { getFileHash, readHashMapFile };
