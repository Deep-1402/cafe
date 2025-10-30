import { DataTypes } from "sequelize";

const Categories = (sequelize) => {
  return sequelize.define(
    "categories",
    {
      category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(255),
      },
    },
    {
      paranoid: true,
      timestamps: true,
    }
  );
};

export default Categories;
