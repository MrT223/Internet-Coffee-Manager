import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";
import Computer from "./Computer.js";

const SessionHistory = sequelize.define(
  "SessionHistory",
  {
    session_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },
    computer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Computer,
        key: "computer_id",
      },
    },
    computer_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    start_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_cost: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hourly_rate: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "session_history",
    timestamps: false,
  }
);

// Associations
SessionHistory.belongsTo(User, { foreignKey: "user_id", as: "user" });
SessionHistory.belongsTo(Computer, { foreignKey: "computer_id", as: "computer" });

export default SessionHistory;
