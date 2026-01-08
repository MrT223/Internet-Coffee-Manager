import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Computer = sequelize.define(
  "Computer",
  {
    computer_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    computer_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "May Moi",
    },
    x: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    y: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "bao tri",
    },
    current_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    session_start_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    hourly_rate: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: "computer",
    timestamps: false,
  }
);

export default Computer;
