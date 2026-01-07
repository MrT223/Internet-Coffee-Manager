import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    logging: false,
    timezone: "+07:00", 
    dialectOptions: {
      useUTC: false,
      ssl: process.env.DB_SSL === "true" 
        ? { require: true, rejectUnauthorized: false } 
        : false,
    },
    define: {
      timestamps: true,
    },
  }
);

export default sequelize;