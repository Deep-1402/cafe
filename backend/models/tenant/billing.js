import { DataTypes } from "sequelize";

const Billing = (sequelize) => {
  return sequelize.define(
    "billing",
    {
      billing_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        // references: {
        //   model: "orders",
        //   key: "order_id",
        // },
      },
      invoice_number: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
        allowNull: false,
        comment: "Unique invoice",
      },

      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.ENUM("cash", "card", "upi", "wallet", "other"),
        allowNull: false,
      },
      payment_status: {
        type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
        defaultValue: "pending",
      },
      date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      paranoid: true,
      timestamps: true,
      initialAutoIncrement: 50001,
    }
  );
};

export default Billing;
