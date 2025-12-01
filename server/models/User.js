import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Role from "./Role.js";

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
    },
    user_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Role,
        key: "role_id",
      },
    },
    balance: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "User",
    timestamps: false,
  }
);

export default User;
