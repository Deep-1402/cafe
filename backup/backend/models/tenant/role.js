import { DataTypes } from "sequelize";

const Roles = (sequelize) => {
  return sequelize.define(
    "roles",
    {
      role_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      paranoid: true,
      timestamps: true,
    }
  );
};

export default Roles;
