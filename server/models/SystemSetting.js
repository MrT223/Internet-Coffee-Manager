import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SystemSetting = sequelize.define(
  "SystemSetting",
  {
    setting_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    setting_key: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    setting_value: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "system_setting",
    timestamps: false,
  }
);

export default SystemSetting;
