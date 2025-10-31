import { Op } from "sequelize";
// import { getTenantConnection } from "./tenant.js";
const createRole = async (req, res) => {
  try {
    const data = req.body;
    const { models } = await getTenantConnection(req.jwtData.email);
    const { Role } = models;
    // console.log(models, req.jwtData);
    const exists = await Role.findOne({ where: { name: data.name } });
    if (exists) return res.json({ message: "Role already exists" });
    const info = await Role.create(data);
    res.status(201).json({ message: "Role create succesfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Role creating error", error: error.message });
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
  createRole,
  createModule,
  createPermission,
  //   updatePlane,
  //   deletePlane,
};
