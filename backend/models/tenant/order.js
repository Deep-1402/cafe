import { DataTypes } from "sequelize";

const Orders = (sequelize) => {
  sequelize.define(
    "orders",
    {
      order_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_type: {
        type: DataTypes.ENUM("dine-in", "takeaway", "delivery"),
        defaultValue: "dine-in",
      },
      table_no: {
        type: DataTypes.STRING(20),
      },
      waiter_id: {
        type: DataTypes.INTEGER,
        // references: {
        //   model: "users",
        //   key: "user_id",
        // },
      },
      customer_name: {
        type: DataTypes.STRING(30),
      },
      customer_phone: {
        type: DataTypes.STRING(10),
      },
      status: {
        type: DataTypes.ENUM("pending", "preparing", "completed", "billed"),
        defaultValue: "pending",
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      paranoid: true,
      timestamps: true,
    }
  );
};

export default Orders;
