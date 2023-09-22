export type AppConfig = {
  nodeEnv: string;
};

export type DatabaseConfig = {
  host?: string;
  port?: number;
  password?: string;
  name?: string;
  username?: string;
  synchronize?: boolean;
};

export type AllConfigType = {
  app: AppConfig;
  database: DatabaseConfig;
};