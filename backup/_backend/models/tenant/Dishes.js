import { DataTypes } from "sequelize";

const Dishes = (sequelize) => {
  return sequelize.define(
    "menu",
    {
      menu_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "categories",
          key: "category_id",
        },
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      discount_price: {
        type: DataTypes.DECIMAL(10, 2),
        comment: "Discounted price if any",
      },
      image_url: {
        type: DataTypes.STRING(255),
      },
      preparation_time: {
        type: DataTypes.INTEGER,
        comment: "Time in minutes",
      },
      calories: {
        type: DataTypes.INTEGER,
      },
      ingredients: {
        type: DataTypes.TEXT,
      },
      is_vegetarian: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_spicy: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      paranoid: true,
      timestamps: true,
    }
  );
};

export default Dishes;