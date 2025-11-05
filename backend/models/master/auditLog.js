import { DataTypes } from "sequelize";
import { sequelize } from "../../config/config.js";

const AuditLog = sequelize.define(
  "AuditLog", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tenant_id: {
    type: DataTypes.INTEGER,
  },
  action: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});
export default AuditLog;