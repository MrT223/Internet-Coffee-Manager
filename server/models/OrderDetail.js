import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const OrderDetail = sequelize.define(
  "OrderDetail",
  {
    detail_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      // Liên kết với FoodOrder
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    item_id: {
      // Liên kết với MenuItem
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "order_details",
    timestamps: false,
  }
);

export default OrderDetail;
