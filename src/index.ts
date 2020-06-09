import log, { Logger } from "console-log-level";
import { promises as fs } from "fs";
import { ICLIOpts } from "./cli";
import { getFileHash } from "./hash-generator";
import { runCmd } from "./spawn";

interface IFileToHashMap {
  [file: string]: string;
}

let logger: Logger;

const writeHashFile = async (
  fileToHashMap: IFileToHashMap,
  hashFile: string
) => {
  logger.debug("Writing to file", fileToHashMap);
  return fs.writeFile(hashFile, JSON.stringify(fileToHashMap));
};

const shouldRun = async (
  files: string[],
  prevHashMap: IFileToHashMap,
  opts: ICLIOpts
): Promise<boolean> => {
  const newHashMap = (await Promise.all(files.map(getFileHash))).reduce<
    IFileToHashMap
  >((map, hash, index) => {
    map[files[index]] = hash;
    return map;
  }, {});

  await writeHashFile(newHashMap, opts.hashMapFile);

  if (files.length !== Object.values(prevHashMap).length) {
    return true;
  }

  return files.some((file): boolean | void => {
    console.log(file, prevHashMap[file], newHashMap[file]);
    if (prevHashMap[file] !== newHashMap[file]) {
      return true;
    }
    return false;
  });
};

const runIfc = async (
  files: string[],
  prevHashMap: IFileToHashMap,
  cmd: string,
  opts: ICLIOpts
) => {
  logger = log({ level: opts.logLevel });
  logger.debug(files, prevHashMap, cmd, opts);
  const needsRun = await shouldRun(files, prevHashMap, opts);
  logger.debug(needsRun);
  if (needsRun) {
    runCmd(cmd);
  }
};

export { runIfc, IFileToHashMap };
