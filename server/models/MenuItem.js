import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const MenuItem = sequelize.define(
  "MenuItem",
  {
    item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    food_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    stock: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "Menu_Item",
    timestamps: false,
  }
);

export default MenuItem;
