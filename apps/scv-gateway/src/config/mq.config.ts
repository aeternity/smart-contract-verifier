import { registerAs } from '@nestjs/config';
import { MqConfig } from './config.type';

export default registerAs<MqConfig>('mq', () => {
  return {
    host: process.env.MQ_HOST,
    port: process.env.MQ_PORT ? parseInt(process.env.MQ_PORT, 10) : 5672,
    password: process.env.MQ_PASSWORD,
    username: process.env.MQ_USERNAME,
    verificationQueue:
      process.env.MQ_VERIFICATION_QUEUE || 'verification_queue',
  };
});
