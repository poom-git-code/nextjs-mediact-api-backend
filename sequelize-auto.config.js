require('dotenv').config();

module.exports = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST || 'localhost',
  dialect: process.env.DB_DIALECT || 'mysql',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  output: './src/models',
  additional: {
    timestamps: true,
    underscored: true,
  },
  lang: 'ts',
};