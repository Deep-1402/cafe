import { sequelize } from "../../config/config.js";

import { DataTypes } from "sequelize";

const Tenents = sequelize.define(
  "tenents",
  {
    tenant_id: {
      type: DataTypes.INTEGER(3),
      primaryKey: true,
      autoIncrement: true,
    },
    restaurant_name: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    subdomain: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
      unique: {
        msg: "This Domain Is Reserved!! Try Another One",
      },
    },
    email: {
      type: DataTypes.STRING(30),
      validate: {
        isEmail: true,
        isEmail: {
          msg: "Invalid Email Format",
        },
      },
      allowNull: false,
      comment: "Admin",
    },
    password : {
      type : DataTypes.STRING(100),
      allowNull : true
    },  
    plan_id: {
      type: DataTypes.INTEGER(3),
      comment: "Subscription",
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      comment: "Subscription",
      allowNull : true
    },
    is_payment_done: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    db_name: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    notified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "by mail",
    },
    is_first_login: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    initialAutoIncrement: 101,
    paranoid: true,
  }
);

export default Tenents;
