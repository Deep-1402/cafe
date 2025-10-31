import { createMessage } from "../controllers/tenant/roles.js";

const Sockets = (io) => {
  io.on("connection", (socket) => {
    //@@
    console.log(`\x1b[32m@User Connected: ${socket.id} \x1b[0m`);
    socket.on("join_room", (chat_id) => {
      //@@
      chat_id = parseInt(chat_id);
      socket.join(chat_id); // @@
      console.info(
        `\x1b[32m@User with ID: ${socket.id} joined room: ${chat_id} \x1b[0m`
      );
    });

    socket.on("send_message", async(data) => {
      //@@
      console.log(data,"dd")
      
      data.chat_id = await createMessage(data)
      console.log(data.chat_id)
      socket.emit("join_room", data.chat_id)
      socket.to(data.chat_id).emit("send_message", data); //@@
      // io.to(data.chat_id).emit("send_message", data); //@@
      // console.log(data, typeof data.chat_id);
      console.log(
        `\x1b[32m@chat_id: ${data.chat_id} 'Message': ${JSON.stringify(
          data
        )}\x1b[0m`
      );
    });

    socket.on("logout", () => {
      console.log(
        `\x1b[32mUser with socket ID ${socket.id} logged out.\x1b[0m`
      );
      socket.disconnect();
    });

    socket.on("disconnect", () => {
      console.log(`\x1b[32mUser Disconnected: ${socket.id}\x1b[0m`);
    });
  });
  // @@ Socket
};

export default Sockets;
// i built chat web app using node express and react with socket.io & socket.io-client and i use context in react js so in context i have

/*
const { Server } = require("socket.io");
const { createSequelizeInstance, allModelAndAssociate } = require("./config");
const MerchantModel = require("../models/paycentralOrganization/merchantModel");
// const corporationModel = require("../models/paycentralMaster/corporationModel");
const { allMerchantModelAndAssociate } = require("./merchantConfig");
 
let io;
const initSocket = async (server) => {
    io = new Server(server, {
        cors: {
            origin: "*",
        },
    });
 
    io.on("connection", (socket) => {
        // console.log(`A user connected: ${socket.id}`);
 
        // Listen for a 'join' event and let the user join a room based on their userId
        socket.on("join", async (userId, domainUrl) => {
            socket.join(userId);
            socket.join(domainUrl);
            console.log(`User with ID ${userId} joined room`);
            let req = {};
            try {
                const checkDomain = await MerchantModel.findOne({
                    where: {
                        domainUrl: domainUrl,
                        // isActive: true,
                        isDeleted: false,
                    },
                });
                if (checkDomain) {
                    await createSequelizeInstance(
                        checkDomain.databaseName
                    ).then(async (res) => {
                        req.clientUser = checkDomain;
                        req.sequelize = res;
                        await allMerchantModelAndAssociate(req);
                    });
 
                    // Emit all notifications for the user
                    const allNotifications =
                        await req.notificationModel.findAll({
                            where: {
                                toUser: userId,
                            },
                            order: [["id", "DESC"]],
                        });
                    socket.emit("allNotifications", allNotifications, userId);
                }
            } catch (error) {
                console.log(error);
            }
        });
 
        socket.on(
            "markNotificationsRead",
            async ({ userId, notificationIds, domainUrl }) => {
                let req = {};
                try {
                    const checkDomain = await MerchantModel.findOne({
                        where: {
                            domainUrl: domainUrl,
                            // isActive: true,
                            isDeleted: false,
                        },
                    });
                    if (checkDomain) {
                        await createSequelizeInstance(
                            checkDomain.databaseName
                        ).then(async (res) => {
                            req.clientUser = checkDomain;
                            req.sequelize = res;
                            await allMerchantModelAndAssociate(req);
                        });
                    }
                } catch (error) {
                    console.error(
                        "Error marking notifications as read:",
                        error.message
                    );
                }
                try {
                    if (!notificationIds || !Array.isArray(notificationIds)) {
                        return res
                            .status(400)
                            .json({ message: "Invalid IDs provided." });
                    }
 
                    for (const ids of notificationIds) {
                        await req.notificationModel.update(
                            { isRead: 1 },
                            { where: { id: ids } }
                        );
                    }
                } catch (error) {
                    console.error(
                        "Error marking notifications as read:",
                        error.message
                    );
                }
            }
        );
 
        socket.on("leave", (userId, domainUrl) => {
            console.log(`User with ID ${userId} leaved room`);
            socket.leave(userId);
            socket.leave(domainUrl);
        });
 
        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });
 
    return io;
};
 
const emitNotification = (
    userId,
    notificationData,
    pushNotification,
    domainURL
) => {
    if (typeof io === "undefined" || !io) {
        console.error("Socket.IO is not initialized or undefined");
        return;
    }
    // io.emit("newNotification", notificationData, pushNotification);
    io.to(domainURL).emit("newNotification", notificationData);
};
 
// const emitMemberUpload = (userId, uploadPercentage, responseMessage) => {
//     [uploadPercentage];
//     if (typeof io === "undefined" || !io) {
//         console.error("Socket.IO is not initialized or undefined");
//         return;
//     }
//     io.emit("uploadingProgressMessage", uploadPercentage);
 
//     // Emit upload completion status
//     if (uploadPercentage == "100.00") {
//         console.log("reached here");
//         io.emit("uploadDoneStatus", "Members are uploaded successfully");
//     }
// };
 
// const emitInternalSources = (userId, uploadPercentage, responseMessage) => {
//     [responseMessage];
//     if (typeof io === "undefined" || !io) {
//         console.error("Socket.IO is not initialized or undefined");
//         return;
//     }
//     io.emit(
//         "uploadingProgressInternalSources",
//         uploadPercentage,
//         responseMessage
//     );
// };
 
// const emitInprogressReport = (userId, responseMessage) => {
//     if (typeof io === "undefined" || !io) {
//         console.error("Socket.IO is not initialized or undefined");
//         return;
//     }
//     io.emit("progressReport", userId, responseMessage);
// };
 
module.exports = {
    initSocket,
    emitNotification,
    // emitMemberUpload,
    // emitInternalSources,
    // emitInprogressReport,
};
*/
