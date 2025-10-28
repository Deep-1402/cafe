// import { sequelize } from "./index.js";
import { DataTypes } from "sequelize";

const User = (sequelize) =>
  sequelize.define(
    "users",
    {
      user_id: {
        type: DataTypes.INTEGER(3),
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          isEmail: {
            msg: "Invalid Email Format",
          },
        },
        unique: {
          msg: "You're Email Already Exist!!!",
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "users",
      timestamps: true,
      paranoid: true,
      initialAutoIncrement: 101,
    }
  );

export default User;
