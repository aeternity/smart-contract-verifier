export type AppConfig = {
  nodeEnv: string;
  workerId: string;
  workerPrivKey: string;
};

export type MqConfig = {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
};

export type GatewayApiConfig = {
  url?: string;
};

export type AllConfigType = {
  app: AppConfig;
  mq: MqConfig;
};
