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
import { Tenants } from "../../models/master/association.js";
import { tenantSeqelize } from "../../config/config.js";

const getTenantConnection = async (email) => {
  try {
    // Find tenant in master database
    const tenant = await Tenants.findOne({
      where: { email: email },
    });

    if (!tenant) {
      throw new Error("Tenant not found");
    }

    if (!tenant.is_active) {
      throw new Error("Tenant account is suspended. Please contact support.");
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
    const sequelize = tenantSeqelize(dbName);

    // Test connection
    await sequelize.authenticate();
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
      
    };

    // Setup associations
    // setupAssociations();

    // Cache the connection
    const connection = { sequelize, models };

    return { ...connection, tenant };
  } catch (error) {
    throw error;
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get tenant connection
    const { models, tenant } = await getTenantConnection(email);
    const { User, Role, Permission, Module } = models;

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
    //       model: Module,
    //       as: "module",
    //       attributes: ["module_id", "name", "slug"],
    //     },
    //   ],
    // });

    // Format permissions for frontend
    // const userPermissions = permissions.reduce((acc, perm) => {
    //   acc[perm.module.slug] = {
    //     module_id: perm.module_id,
    //     module_name: perm.module.name,
    //     can_create: perm.can_create,
    //     can_view: perm.can_view,
    //     can_edit: perm.can_edit,
    //     can_delete: perm.can_delete,
    //   };
    //   return acc;
    // }, {});

    // JWT Payload
    const payload = {
      user_id: user.user_id,
      email : user.email,
      role_id: user.role_id,
    };

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
        user: user,
        token: token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error,
      message: error.message || error,
    });
  }
};

const createUser = async (req, res) => {
  try {

    const data = req.body;
    // const { username, email, role_id } = req.body;
    const {email} = req.jwtData
    // Get tenant connection
    // const tenantController = await import("./tenant.js");
    const { models, tenant } = await getTenantConnection(email);
    const { User, Role } = models;

    // Check if role exists
    const role = await Role.findByPk(data.role_id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email : data.email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

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

    res.status(201).json({
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

const exportedModules = {
  getTenantConnection,
  login,
  createUser,
};
export default exportedModules;
