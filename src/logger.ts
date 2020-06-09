/**
 * Logger instance
 */

import log from 'console-log-level';
import { env } from './env';

const level = env.logLevel;

const logger = log({ level });

export { logger };
