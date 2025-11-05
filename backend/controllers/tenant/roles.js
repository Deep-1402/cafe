import { Op } from "sequelize";
import { getTanantConnection } from "./tenant.js";
// import { getTenantConnection } from "./tenant.js";
export const createMessage = async (data) => {
  try {
    console.log(data)
    // const data = req.body;
    const { models } = await getTanantConnection();
    const { Message, Chat } = models;
    // console.log(models, req.jwtData);
    let exists = await Chat.findOne({
      where: {
        [Op.and]: [{ receiver_id: data.sender }, { sender_id: data.receiver }],
      },
    });
    if (!exists) {
      exists = await Chat.create({
        receiver_id: data.sender,
        sender_id: data.receiver,
      });
    }
    const info = await Message.create({chat_id : exists.chat_id , message : data.message});
    console.log("Message Sent", exists.chat_id)
    return exists.chat_id
    // res.status(201).json({ message: "Messege Sent create succesfully" });
  } catch (error) {
    console.log("Message error", error)
  }
};
const createModule = async (req, res) => {
  try {
    const data = req.body;
    const { models, tenant } = await getTenantConnection(req.jwtData.email);
    const { Module } = models;
    const exists = await Module.findOne({ where: { name: data.name } });
    if (exists) return res.json({ message: "Feature already exists" });
    const info = await Module.create(data);
    res.status(201).json({ message: "Feature create succesfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Feature creating error", error: error.message });
  }
};
const createPermission = async (req, res) => {
  try {
    const data = req.body;
    const { models, tenant } = await getTenantConnection(req.jwtData.email);
    const { Permission } = models;
    const exists = await Permission.findOne({
      where: {
        [Op.and]: [{ role_id: data.role_id }, { module_id: data.module_id }],
      },
    });
    if (exists)
      return res.json({ message: "Permission For That ROle already exists" });
    const info = await Permission.create(data);
    res.status(201).json({ message: "Permission create succesfully" });
  } catch (error) {
    res.status(500).json({
      message: "Permission creating error",
      error: error.message ?? error,
    });
  }
};

// const updatePlane = async (req, res) => {
//   try {
//     const { price, durationInday, features } = req.body;
//     const update = await _update(
//       {
//         price,
//         durationInday,
//         features,
//       },
//       {
//         where: {
//           id: req.params.id,
//         },
//       }
//     );
//     res.status(201).json({ message: "plane update succesfully" });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "plane updating error", error: error.message });
//   }
// };

// const deletePlane = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deleteplane = await destroy({ where: { id: id } });
//     if (!deletePlane) return res.json({ message: "plane not found " });

//     res.status(201).json({ message: "plane delete succesfully", deleteplane });
//   } catch (error) {
//     res.status(500).json({ message: "error", error: error.message });
//   }
// };
export default {
  
  createModule,
  createPermission,
  //   updatePlane,
  //   deletePlane,
};
