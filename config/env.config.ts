import * as dotenv from 'dotenv';
import { EnvConfigType } from './types';

dotenv.config();

export const EnvConfig: EnvConfigType = {
  baseUrl: process.env.BASE_URL || 'https://kazis.dev',
  isCI: process.env.CI === 'true',
  slowMo: Number(process.env.SLOW_MO) || 0,
  retries: Number(process.env.RETRIES) || (process.env.CI === 'true' ? 2 : 0),
  workers: Number(process.env.WORKERS) || (process.env.CI === 'true' ? 3 : undefined),
} as const;
