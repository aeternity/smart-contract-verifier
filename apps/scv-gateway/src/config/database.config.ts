import { registerAs } from '@nestjs/config';
import { DatabaseConfig } from './config.type';

export default registerAs<DatabaseConfig>('database', () => {
  return {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
      ? parseInt(process.env.DB_PORT, 10)
      : 5432,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
  };
});