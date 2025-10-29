import { DataTypes } from "sequelize";

const OrderItems = (sequelize) => {
  sequelize.define(
    "order_items",
    {
      order_item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // references: {
        //   model: "orders",
        //   key: "order_id",
        // },
      },
      menu_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // references: {
        //   model: "menus",
        //   key: "menu_id",
        // },
      },
      item_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      special_request: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.ENUM("pending", "preparing", "ready", "served"),
        defaultValue: "pending",
      },
    },
    {
      timestamps: false,
    }
  );
};

export default OrderItems;
