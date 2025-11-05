let db = "qbot_tenant_ymhwda";
// import { Tenants } from "../models/master/association";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Categories from "../../models/tenant/catagories.js";
import OrderItems from "../../models/tenant/orderItems.js";
import Roles from "../../models/tenant/role.js";
import tenantUsers from "../../models/tenant/users.js";
import Permissions from "../../models/tenant/permission.js";
import Dishes from "../../models/tenant/Dishes.js";
import Orders from "../../models/tenant/order.js";
import Modules from "../../models/tenant/module.js";
import Billing from "../../models/tenant/billing.js";
import Feedback from "../../models/tenant/feedback.js";
import { setupAssociations } from "../../models/tenant/associations.js";
import { Subscription, Tenants } from "../../models/master/association.js";
import { tenantSeqelize } from "../../config/config.js";
import { Op } from "sequelize";
import Chat from "../../models/tenant/chat.js";
import Message from "../../models/tenant/message.js";

const getTenantConnection = async (email) => {
  try {
    // extract the subdomain
    const subdomain = email.split("@")[1].split(".")[0];
    // Find tenant in master database
    const tenant = await Tenants.findOne({
      where: { [Op.and]: [{ subdomain }] },
    });
    // console.log(tenant.is_active, !tenant.is_active);
    if (!tenant) {
      throw new Error("Domain not found");
    }

    if (!tenant.is_active) {
      throw new Error("Domain account is suspended. Please contact support.");
    }

    // Check if subscription is active
    // if (tenant.end_date && new Date(tenant.end_date) < new Date()) {
    //   throw new Error("Subscription expired. Please renew your plan.");
    // }

    // // Check if payment is done
    // if (!tenant.is_payment_done) {
    //   throw new Error("Payment pending. Please complete payment to continue.");
    // }

    const dbName = tenant.db_name;

    // Create new connection
    const models = await tenantSeqelize(dbName);
    // console.log(models)
    return { models, tenant };
  } catch (error) {
    throw error;
  }
};
// const getTenantConnection = async (email) => {
//   try {
//     // extract the subdomain
//     const subdomain = email.split("@")[1].split(".")[0];
//     // Find tenant in master database
//     const tenant = await Tenants.findOne({
//       where: { [Op.and]: [{ subdomain  }] },
//     });
//     // console.log(tenant.is_active, !tenant.is_active);
//     if (!tenant) {
//       throw new Error("Domain not found");
//     }

//     if (!tenant.is_active) {
//       throw new Error("Domain account is suspended. Please contact support.");
//     }

//     // Check if subscription is active
//     // if (tenant.end_date && new Date(tenant.end_date) < new Date()) {
//     //   throw new Error("Subscription expired. Please renew your plan.");
//     // }

//     // // Check if payment is done
//     // if (!tenant.is_payment_done) {
//     //   throw new Error("Payment pending. Please complete payment to continue.");
//     // }

//     const dbName = tenant.db_name;

//     // Create new connection
//     const sequelize = tenantSeqelize(dbName);

//     // Test connection
//     // let connected = await sequelize.authenticate();
//     // console.log(sequelize);

//     console.log("Tenent Connected SuccessFully");
//     // Initialize models
//     const models = {
//       Role: Roles(sequelize),
//       Permission: Permissions(sequelize),
//       User: tenantUsers(sequelize),
//       Category: Categories(sequelize),
//       Dishes: Dishes(sequelize),
//       Order: Orders(sequelize),
//       OrderItem: OrderItems(sequelize),
//       Billing: Billing(sequelize),
//       Feedback: Feedback(sequelize),
//       Module: Modules(sequelize),
//       Chat: Chat(sequelize),
//       Message: Message(sequelize),
//     };
//     // console.log(models)
//     // Setup associations
//     // await setupAssociations(models);

//     // await sequelize.sync({ alter: true });
//     // Cache the connection
//     // const connection = { sequelize, models };

//     return { sequelize, models, tenant };
//   } catch (error) {
//     throw error;
//   }
// };

const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    console.log(`\x1b[32m@User Connected: ${email}${password} \x1b[0m`);

    // [email, subdomain] = [subdomain, email];
    // Get tenant connection
    const { models } = await getTenantConnection(email);
    const { User, Role, Permission, Module } = models;
    // [email, subdomain] = [subdomain, email];
    // console.log(email, subdomain);
    // console.log(models, "sfs");

    // Find user by email
    const user = await User.findOne({
      where: { email },
      //   include: [
      //     {
      //       model: Role,
      //       as: "role",
      //       attributes: ["role_id", "name", "description"],
      //     },
      //   ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated. Please contact administrator.",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Get user permissions
    // const permissions = await Permission.findAll({
    //   where: { role_id: user.role_id },
    //   include: [
    //     {
    //       model: Role,
    //       as: "role",
    //       attributes: ["role_id", "name"],
    //     },
    //   ],
    // });

    const permissions = await Permission.findAll({
      where: { role_id: user.role_id },
      include: {
        model: Module,
        attributes: ["name"],
      },

      attributes: [
        "role_id",
        "module_id",
        "can_create",
        "can_view",
        "can_edit",
        "can_delete",
      ],
      // attributes : ["permission_id"]
    });
    // console.log(permissions);

    // JWT Payload
    const payload = {
      user_id: user.user_id,
      email: user.email,
      role_id: user.role_id,
    };
    // console.log(payload)

    // Generate tokens
    let token = jwt.sign(payload, process.env.JWT_TOKEN, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    // Response data
    // const userData = {
    //     userData : user
    // //   user_id: user.user_id,
    // //   username: user.username,
    // //   email: user.email,
    // //   role: {
    // //     role_id: user.role.role_id,
    // //     name: user.role.name,
    // //     description: user.role.description,
    // //   },
    // //   permissions: userPermissions,
    // //   tenant: {
    // //     tenant_id: tenant.tenant_id,
    // //     restaurant_name: tenant.restaurant_name,
    // //     subdomain: tenant.subdomain,
    // //   },
    // };

    res.status(200).json({
      message: `Welcome To, ${user.username}! :)`,
      data: {
        permissions,
        token: token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: error,
      message: error.message,
    });
  }
};

export const getTanantConnection = async () => {
  // Create new connection
  const sequelize = tenantSeqelize(db);

  // Test connection
  await sequelize.authenticate();
  // await sequelize.sync({ alter: true });
  // console.log(sequelize);

  console.log("Tenent Connected SuccessFully");
  // Initialize models
  const models = {
    Role: Roles(sequelize),
    Permission: Permissions(sequelize),
    User: tenantUsers(sequelize),
    Category: Categories(sequelize),
    Dishes: Dishes(sequelize),
    Order: Orders(sequelize),
    OrderItem: OrderItems(sequelize),
    Billing: Billing(sequelize),
    Feedback: Feedback(sequelize),
    Module: Modules(sequelize),
    Chat: Chat(sequelize),
    Message: Message(sequelize),
  };
  // console.log(models)
  // Setup associations
  await setupAssociations(models);
  // await sequelize.sync({alter:true});
  return { models };
};

const userLogin = async (req, res) => {
  try {
    let { email, subdomain, password } = req.body;
    // [email, subdomain] = [subdomain, email];
    // Get tenant connection
    //@@
    const { models } = await getTanantConnection();
    // const { User, Role, Permission, Module } = models;
    //@@

    // const { models, tenant } = await getTenantConnection(email);
    // const { User, Role, Permission, Module } = models;
    // [email, subdomain] = [subdomain, email];
    // console.log(email, subdomain);
    // console.log(models, "sfs");

    // Find user by email
    const user = await models.User.findOne({
      where: { email },
      //   include: [
      //     {
      //       model: Role,
      //       as: "role",
      //       attributes: ["role_id", "name", "description"],
      //     },
      //   ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated. Please contact administrator.",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Get user permissions
    const permissions = await models.Permission.findAll({
      where: { role_id: user.role_id },
      include: [
        {
          model: models.Role,
          as: "role",
          attributes: ["role_id", "name"],
        },
      ],
    });
    // console.log(permissions);

    // JWT Payload
    const payload = {
      user_id: user.user_id,
      email: user.email,
      role_id: user.role_id,
      // subdomain: subdomain,
    };
    // console.log(payload)

    // Generate tokens
    let token = jwt.sign(payload, process.env.JWT_TOKEN, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    // Response data
    // const userData = {
    //     userData : user
    // //   user_id: user.user_id,
    // //   username: user.username,
    // //   email: user.email,
    // //   role: {
    // //     role_id: user.role.role_id,
    // //     name: user.role.name,
    // //     description: user.role.description,
    // //   },
    // //   permissions: userPermissions,
    // //   tenant: {
    // //     tenant_id: tenant.tenant_id,
    // //     restaurant_name: tenant.restaurant_name,
    // //     subdomain: tenant.subdomain,
    // //   },
    // };

    res.status(200).json({
      message: `Welcome To, ${user.username}! :)`,
      data: {
        user: permissions,
        token: token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: error,
      message: error.message,
    });
  }
};

const createUser = async (req, res) => {
  try {
    const data = req.body;
    // const { username, email, role_id } = req.body;
    const { email } = req.jwtData;
    // Get tenant connection
    // const tenantController = await import("./tenant.js");
    const { models, tenant } = await getTenantConnection(email);
    const { User, Role } = models;
    // console.log(Role, User, models);
    // Check if role exists
    const role = await Role.findByPk(data.role_id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const totalUser = await User.count();
    const limit = await Subscription.findByPk(tenant.plan_id);
    if (!limit) {
      return res.status(404).json({
        message: "Subscription not found",
      });
    }
    if (totalUser >= limit.max_users) {
      return res.status(404).json({
        message: "Max User Limit Reached not found",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    data.password = await bcrypt.hash(data.password, 10);

    // Create user
    const newUser = await User.create(data);

    // Send welcome email
    // let emailSent = false;
    // if (send_email) {
    //   emailSent = await sendWelcomeEmail(
    //     email,
    //     username,
    //     tempPassword,
    //     tenant.subdomain,
    //     tenant.restaurant_name
    //   );
    // }

    // Get user with role details
    // const userWithRole = await User.findByPk(newUser.user_id, {
    //   attributes: { exclude: ["password"] },
    //   // include: [
    //   //   {
    //   //     model: Role,
    //   //     as: "role",
    //   //     attributes: ["role_id", "name", "description"],
    //   //   },
    //   // ],
    // });

    res.status(200).json({
      message: `User created successfully`,
      data: {
        user: newUser,
        // ...(send_email ? {} : { temporary_password: tempPassword }),
      },
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create user",
    });
  }
};

const createRole = async (req, res) => {
  try {
    const data = req.body;
    const { models } = await getTenantConnection(req.jwtData.email);
    const { Role } = models;
    // console.log(models, req.jwtData);
    const exists = await Role.findOne({ where: { name: data.name } });
    if (exists) return res.json({ message: "Role already exists" });
    const info = await Role.create(data);
    res.status(200).json({ message: "Role create succesfully" });
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
    res.status(200).json({ message: "Feature create succesfully" });
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
    res.status(200).json({ message: "Permission create succesfully" });
  } catch (error) {
    res.status(500).json({
      message: "Permission creating error",
      error: error.message ?? error,
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const { models } = await getTenantConnection(req.jwtData.email);
    const { User, Role } = models;
    const exists = await User.findAll({
      include: {
        model: Role,
        as: "role",
        attributes: ["name"],
      },
      attributes: ["user_id", "username", "email", "is_active"],
    });
    res.status(200).json({
      message: "All User Fetched Successfully",
      data: exists,
    });
  } catch (error) {
    res.status(500).json({
      message: "User Fetch error",
      error: error.message ?? error,
    });
  }
};

const getPermisionByRoles = async (req, res) => {
  try {
    const { role_id, email } = req.jwtData;
    const { models, tenant } = await getTenantConnection(email);
    const { Permission, Module } = models;
    const permissions = await Permission.findAll({
      where: { role_id },
      include: {
        model: Module,
        attributes: ["name"],
      },

      attributes: [
        "role_id",
        "module_id",
        "can_create",
        "can_view",
        "can_edit",
        "can_delete",
      ],
      // attributes : ["permission_id"]
    });
    res.status(200).json({ message: "Permission by Role", permissions });
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
//     res.status(200).json({ message: "plane update succesfully" });
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

//     res.status(200).json({ message: "plane delete succesfully", deleteplane });
//   } catch (error) {
//     res.status(500).json({ message: "error", error: error.message });
//   }
// };

const exportedModules = {
  login,
  createUser,
  getAllUser,
  createRole,
  createModule,
  createPermission,
  getPermisionByRoles,
  userLogin,
};
export default exportedModules;
export { getTenantConnection };
