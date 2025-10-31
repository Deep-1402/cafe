import { DataTypes } from "sequelize";

const Chat = (sequelize) => {
  return sequelize.define(
    "chats",
    {
      chat_id: {
        type: DataTypes.INTEGER(4),
        primaryKey: true,
        autoIncrement: true,
      },
      sender_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Sender",
      },
      receiver_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: "chats",
      timestamps: true,
      paranoid: true,
      initialAutoIncrement: 1001,
    }
  );
};
export default Chat;
