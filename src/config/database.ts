import { Sequelize, Dialect } from 'sequelize';
import config from './config';

export const sequelize = new Sequelize({
  database: config.db.DB_NAME,
  username: config.db.DB_USER,
  password: config.db.DB_PASS,
  host: config.db.DB_HOST,
  dialect: config.db.DB_DIALECT as Dialect,
  port: parseInt(config.db.DB_PORT),
  logging: false,
  timezone: '+07:00',
  dialectOptions: {
    timezone: 'local', // ใช้ timezone ของเครื่อง server
    dateStrings: true,
    typeCast: function (field: any, next: any) {
      // ถ้าเป็น DATETIME, TIMESTAMP ให้ส่งเป็น string
      if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
        return field.string();
      }
      return next();
    }
  },
});