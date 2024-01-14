import { registerAs } from '@nestjs/config';
import { GatewayApiConfig } from './config.type';

export default registerAs<GatewayApiConfig>('gateway-api', () => {
  return {
    url: process.env.GATEWAY_API_URL,
  };
});
