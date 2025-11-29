import { DataTypes } from "sequelize";
import sequelize from "../config/database.js"; // File kết nối DB

const User = sequelize.define("User", {
  user_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role_id: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
  // ...
});

export default User;
