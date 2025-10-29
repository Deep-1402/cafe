import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import { Tenant, User, Products } from "../models/association.js";
// import { Tenant } from "../models/association.js";
import Categories from "../models/tenant/catagories.js";
import Feedbacks from "../models/tenant/feedback.js";
import OrderItems from "../models/tenant/orderItems.js";
import Roles from "../models/tenant/role.js";
import tenantUsers from "../models/tenant/users.js";
import Permissions from "../models/tenant/permission.js";
import Dishes from "../models/tenant/Dishes.js";
import Orders from "../models/tenant/order.js";

import { sequelize, tenantSeqelize } from "../config/config.js";
import Users from "../models/master/user.js";
import Billing from "../models/tenant/billing.js";
import Feedback from "../models/tenant/feedback.js";
import Modules from "../models/tenant/module.js";
import { setupAssociations } from "../models/tenant/associations.js";
import Tenents from "../models/master/tenants.js";

let signUp = async (req, res) => {
  try {
    let data = req.body;
    const dbname = `Qbot_tenant_${Buffer.from(data.subdomain)
      .toString("base64url")
      .replace(/[-_]/g, "")}`;
    data.db_name = dbname;
    let info = await Tenents.create(data, { logging: console.log });
    // let random = (Math.random() * 100).toString(36);

    console.log(dbname);
    let db = await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${dbname}`);
    let tenatSequlize = await tenantSeqelize(dbname);
    const dbSchemas = [
      Roles,
      Billing,
      Categories,
      Feedback,
      Modules,
      Orders,
      OrderItems,
      tenantUsers,
      Dishes,
      Permissions,
    ];

    for (let table of dbSchemas) {
      await table(tenatSequlize);
    }
    // const models = {
    //   Role: Roles(sequelize),
    //   Permission: Permissions(sequelize),
    //   User: tenantUsers(sequelize),
    //   Category: Categories(sequelize),
    //   Dishes: Dishes(sequelize),
    //   Order: Orders(sequelize),
    //   OrderItem: OrderItems(sequelize),
    //   Billing: Billing(sequelize),
    //   Feedback: Feedback(sequelize),
    //   Modules: Modules(sequelize),
    // };
    // console.log("dd");
    // await setupAssociations(models);
    await tenatSequlize.sync({ force: false });

    // const instance = new Sequelize(
    //   dbname,
    //   process.env.DB_USER,
    //   process.env.DB_PASSWORD,
    //   {
    //     host: process.env.DB_HOST,
    //     dialect: "mysql",
    //     define: {
    //       timestamps: true,
    //       freezeTableName: true,
    //     },
    //   }
    // );

    // for (const table of tables) {
    // const temp = await table(instance);
    // Orders(instance);
    // await instance.sync();
    // }

    res.status(200).json({
      log: "Tenat SucessFully Created",
      data: info ?? null,
      database: db,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message ?? error,
    });
  }
};

let login = async (req, res) => {
  try {
    let { email, password } = req.body;
    console.log(email, password);
    const found = await Users.findOne({
      where: {
        email: email,
      },
    });
    if (!found) {
      res.status(500).json({
        log: "Invalid Email!! Try Again",
      });
    }
    // let match = await bcrypt.compare(password, found.password);
    let match = password == found.password;
    if (!match) {
      res.status(500).json({
        log: "Invalid Password!!Try Again",
      });
    } else {
      let paylode = {
        id: found.user_id,
        role: found.role_id,
        status: found.status,
      };
      let token = jwt.sign(paylode, process.env.JWT_TOKEN, {
        expiresIn: process.env.JWT_EXPIRE,
      });
      res.status(200).send({
        log: `Successfully Logged In '${found.name}' :) `,
        token: token,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message ?? error,
      // error: error,
    });
  }
};

let getProducts = async (req, res) => {
  try {
    let data = await Products.findAll({
      attributes: ["name", "details", "image"],
      include: {
        as: "attributes",
        model: Attributes,
        attributes: ["name"],
        include: {
          as: "values",
          model: Varient,
          attributes: ["name", "price", "qunatity"],
        },
      },
    });
    res.status(200).json({
      log: "All Products with Available ",
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message ?? error,
    });
  }
};

// Add
let addVarients = async (req, res) => {
  try {
    let data = req.body;
    let found = await Attributes.findByPk(data.varient_id);
    if (!found) {
      res.status(500).json({
        log: `Attribute Not found At ypur Specific id ${data.product_id}`,
      });
    }
    // value, price, quantity
    let info = await Varient.create(data);
    res.status(200).json({
      log: `'${info.name}' Varient Is Created for '${found.varient_id}'`,
      data: info,
    });
  } catch (error) {
    res.status(500).json({
      log: error.message ?? error,
    });
  }
};

const exportedModules = {
  signUp,
  login,

  //get
  getProducts,

  //add
  addVarients,
};

export default exportedModules;
