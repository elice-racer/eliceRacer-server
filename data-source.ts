import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import {
  ENV_DB_DATABASE_KEY,
  ENV_DB_HOST_KEY,
  ENV_DB_PASSWORD_KEY,
  ENV_DB_PORT_KEY,
  ENV_DB_USERNAME_KEY,
} from './src/common/const';
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env[ENV_DB_HOST_KEY],
  port: parseInt(process.env[ENV_DB_PORT_KEY], 10),
  username: process.env[ENV_DB_USERNAME_KEY] || '',
  password: process.env[ENV_DB_PASSWORD_KEY] || '',
  database: process.env[ENV_DB_DATABASE_KEY],
  synchronize: false,
  logging: true,
  entities: ['src/modules/**/**/*.entity.ts'],
  migrations: ['src/migration/**/*.ts'],
});

export default AppDataSource;
