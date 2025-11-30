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
  },
  {
    tableName: "computer",
    timestamps: false,
  }
);

export default Computer;
