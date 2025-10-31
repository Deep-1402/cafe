import { DataTypes } from "sequelize";

const Modules = (sequelize) => {
  sequelize.define(
    "modules",
    {
      module_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description : {
        type : DataTypes.TEXT,
        allowNull : false
      }
    },
    {
      paranoid: true,
      timestamps: true,
    }
  );
};

export default Modules;
