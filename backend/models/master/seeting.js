import { sequelize } from "../../config/config.js";
import { DataTypes } from "sequelize";
import Tenant from "./tenants.js";

const GlobalSetting = sequelize.define(
  "global_setting",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "tenants",
        key: "id",
      },
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    password_expiry_days: {
      type: DataTypes.INTEGER,
      defaultValue: 90,
      comment: "Force password change after X days",
    },
    session_timeout_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 60,
    },
    max_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    lockout_duration_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
    notification_email: {
      type: DataTypes.STRING(100),
      validate: {
        isEmail: true,
      },
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: "USD",
    },
    tax_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
    },
    custom_settings: {
      type: DataTypes.JSON,
      comment: "Additional custom settings as JSON",
    },
  },
  {
    timestamps: true,
  }
);


export default GlobalSetting;