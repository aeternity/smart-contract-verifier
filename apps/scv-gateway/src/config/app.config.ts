import { registerAs } from '@nestjs/config';
import { AppConfig } from './config.type';

export default registerAs<AppConfig>('app', () => {
  if (!process.env.WORKER_PUB_KEY) {
    throw new Error(
      'WORKER_PUB_KEY env variable must be a valid PEM public key!',
    );
  }

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    aeMdwUrl: process.env.AE_MDW_URL || 'https://mainnet.aeternity.io/mdw',
    workerPubKey: process.env.WORKER_PUB_KEY,
    recaptchaSecret: process.env.RECAPTCHA_SECRET,
  };
});
