import { sequelize } from "../../config/config.js";
import { DataTypes } from "sequelize";

const Subscription = sequelize.define(
  "subscription",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.ENUM("Basic", "Standard", "Premium"),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment : "Monthly"
    },
    description: {
      type: DataTypes.STRING(255),
    },
    max_users: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    initialAutoIncrement : 101
  }
);

export default Subscription;
