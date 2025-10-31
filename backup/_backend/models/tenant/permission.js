import { DataTypes } from "sequelize";

const Permissions = (sequelize) => {
  sequelize.define(
    "permissions",
    {
      permission_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      module_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Feature",
      },
      can_create: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      can_view: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      can_edit: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      can_delete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      paranoid: true,
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["role_id", "module_id"],
        },
      ],
    }
  );
};

export default Permissions;
