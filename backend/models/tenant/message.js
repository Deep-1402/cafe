import { DataTypes } from "sequelize";

const Message = (sequelize) => {
  return sequelize.define(
    "messages",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      chat_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      message : {
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

export default Message;
