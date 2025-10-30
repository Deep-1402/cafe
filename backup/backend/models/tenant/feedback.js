import { DataTypes } from "sequelize";

const Feedback = (sequelize) => {
  return sequelize.define(
    "feedback",
    {
      feedback_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.INTEGER,
        // references: {
        //   model: "orders",
        //   key: "order_id",
        // },
      },
      customer_name: {
        type: DataTypes.STRING(100),
      },
      customer_email: {
        type: DataTypes.STRING(100),
        validate: {
          isEmail: true,
        },
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      food_rating: {
        type: DataTypes.INTEGER,
        validate: {
          min: 1,
          max: 5,
        },
      },
      service_rating: {
        type: DataTypes.INTEGER,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: DataTypes.TEXT,
      },
      is_public: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: "Whether to display on website",
      },
    },
    {
      paranoid: true,
      timestamps: true,
    }
  );
};

export default Feedback;