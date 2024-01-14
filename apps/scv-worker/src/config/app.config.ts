import { registerAs } from '@nestjs/config';
import { AppConfig } from './config.type';

export default registerAs<AppConfig>('app', () => {
  if (!process.env.WORKER_PRIV_KEY) {
    throw new Error(
      'WORKER_PRIV_KEY env variable must be a valid PEM private key!',
    );
  }

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    workerId: process.env.WORKER_ID || 'unidentified-worker',
    workerPrivKey: process.env.WORKER_PRIV_KEY,
  };
});
