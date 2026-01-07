import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const FoodOrder = sequelize.define(
  "FoodOrder",
  {
    bill_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "completed", "cancelled"),
      defaultValue: "pending",
    },
    payment_method: {
      type: DataTypes.ENUM("balance", "cash"),
      defaultValue: "balance",
    },
    order_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "food_order",
    timestamps: false,
  }
);

export default FoodOrder;
