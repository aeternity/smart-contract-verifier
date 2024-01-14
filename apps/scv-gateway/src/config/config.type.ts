export type AppConfig = {
  nodeEnv: string;
  aeMdwUrl: string;
  workerPubKey: string;
};

export type DatabaseConfig = {
  host?: string;
  port?: number;
  password?: string;
  name?: string;
  username?: string;
  synchronize?: boolean;
};

export type MqConfig = {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
};

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
  mq: MqConfig;
};
