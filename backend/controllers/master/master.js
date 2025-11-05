import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import { Tenant, User, Products } from "../models/association.js";
// import { Tenant } from "../models/association.js";
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
import { sequelize, tenantSeqelize } from "../../config/config.js";
import Users from "../../models/master/user.js";
import { setupAssociations } from "../../models/tenant/associations.js";
import Tenents from "../../models/master/tenants.js";
import sendEmail from "../../config/mail.js";
import Chat from "../../models/tenant/chat.js";
import Message from "../../models/tenant/message.js";
// import sendEmail from "../../config/mail.js";
// let signUp = async (req, res) => {
//   try {
//     let data = req.body;
//     const dbname = `Qbot_tenant_${Buffer.from(data.subdomain)
//       .toString("base64url")
//       .replace(/[-_]/g, "")}`;
//     data.db_name = dbname;
//     let info = await Tenents.create(data, { logging: console.log });
//     // let random = (Math.random() * 100).toString(36);

//     console.log(dbname);
//     let db = await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${dbname}`);
//     let tenatSequlize = await tenantSeqelize(dbname);
//     const dbSchemas = [
//       Roles,
//       Billing,
//       Categories,
//       Feedback,
//       Modules,
//       Orders,
//       OrderItems,
//       tenantUsers,
//       Dishes,
//       Permissions,
//     ];

//     for (let table of dbSchemas) {
//       await table(tenatSequlize);
//     }
//     // const models = {
//     //   Role: Roles(sequelize),
//     //   Permission: Permissions(sequelize),
//     //   User: tenantUsers(sequelize),
//     //   Category: Categories(sequelize),
//     //   Dishes: Dishes(sequelize),
//     //   Order: Orders(sequelize),
//     //   OrderItem: OrderItems(sequelize),
//     //   Billing: Billing(sequelize),
//     //   Feedback: Feedback(sequelize),
//     //   Modules: Modules(sequelize),
//     // };
//     // console.log("dd");
//     // await setupAssociations(models);
//     await tenatSequlize.sync({ force: false });

//     // const instance = new Sequelize(
//     //   dbname,
//     //   process.env.DB_USER,
//     //   process.env.DB_PASSWORD,
//     //   {
//     //     host: process.env.DB_HOST,
//     //     dialect: "mysql",
//     //     define: {
//     //       timestamps: true,
//     //       freezeTableName: true,
//     //     },
//     //   }
//     // );

//     // for (const table of tables) {
//     // const temp = await table(instance);
//     // Orders(instance);
//     // await instance.sync();
//     // }

//     res.status(200).json({
//       log: "Tenat SucessFully Created",
//       data: info ?? null,
//       database: db,
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: error.message ?? error,
//     });
//   }
// };

const signUp = async (req, res) => {
  try {
    let data = req.body;

    // Generate database name
    const dbname = `Qbot_tenant_${Buffer.from(data.subdomain)
      .toString("base64url")
      .replace(/[-_]/g, "")}`;

    data.db_name = dbname;

    data.password = await bcrypt.hash(data.password, 10);
    console.log(data);
    const found = await Tenents.findOne({
      where: { subdomain: data.subdomain },
    });
    if (found) {
      return res.status(500).json({
        message: "Tenant Alredy Exist",
      });
    } else {
      // Create tenant record in master DB
      let tenant = await Tenents.create(data);

      //@@ Tenanat Db Creation PHAse
      // Create tenant database
      await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${dbname}`);

      // Connect to tenant database
      let models =await tenantSeqelize(dbname);
      console.log(models)
      // Initialize models
      // const models = {
      //   Role: Roles(tenantSequelize),
      //   Permission: Permissions(tenantSequelize),
      //   User: tenantUsers(tenantSequelize),
      //   Category: Categories(tenantSequelize),
      //   Dishes: Dishes(tenantSequelize),
      //   Order: Orders(tenantSequelize),
      //   OrderItem: OrderItems(tenantSequelize),
      //   Billing: Billing(tenantSequelize),
      //   Feedback: Feedback(tenantSequelize),
      //   Module: Modules(tenantSequelize),
      //   Chat: Chat(tenantSequelize),
      //   Message: Message(tenantSequelize),
      // };
      // console.log(models);
      // // Setup associations
      // await setupAssociations(models);

      // Sync database
      // await tenantSequelize.sync({ force: false });
      // @@ Tanant Db Creation Phase OVer

      //@ Send OTP via email
      // const message = `
      //   Thank you for registering your company:${data.restaurant_name},
      // `;
      let message = `<!DOCTYPE html>
                  <html lang="en">
                  <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Subscription Activated</title>
                  </head>
                  <body style="margin:0;padding:0;background-color:#f4f6fa;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f6fa;padding:30px 0;">
                      <tr>
                        <td align="center">
                          <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 5px 15px rgba(0,0,0,0.08);">
                            
                            <!-- Header -->
                            <tr>
                              <td style="background:linear-gradient(90deg,#ff7a18,#ffb347);padding:20px 30px;text-align:center;color:#fff;">
                                <h1 style="margin:0;font-size:22px;">Welcome to NetCafeteria 🎉:)</h1>
                              </td>
                            </tr>
                            
                            <!-- Body -->
                            <tr>
                              <td style="padding:30px;">
                                <h2 style="margin:0 0 10px 0;font-size:20px;color:#222;"> <span style="color:#ff7a18;">${data.restaurant_name}</span>,</h2>
                                <p style="margin:0 0 16px 0;color:#555;font-size:15px;line-height:1.6;">
                                  We’re excited to have you onboard! Your subscription plan is now <strong style="color:#16a34a;">active</strong>.
                                </p>

                                <p style="margin:0 0 16px 0;color:#555;font-size:15px;line-height:1.6;">
                                  You can start managing your restaurant right away from your dashboard.
                                </p>

                        

                                <table role="presentation" width="100%" style="background:#f7fafc;border-radius:8px;padding:14px;border:1px solid #e5e7eb;margin-top:15px;">
                                  <tr>
                                    <td>
                                      <div style="font-size:14px;color:#374151;line-height:1.5;">
                                        <strong>Restaurant Name:</strong> ${data.restaurant_name}<br/>
                                        <strong>Subdomain:</strong> <a href="${data.subdomain}" style="color:#0b74de;text-decoration:none;">${data.subdomain}</a><br/>
                                        <strong>Status:</strong> Activated
                                      </div>
                                    </td>
                                  </tr>
                                </table>

                                <p style="margin-top:20px;font-size:14px;color:#666;">
                                  Thank you for choosing <strong>NetCafeteria</strong>! We’re here to help your restaurant grow.
                                </p>
                              </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                              <td style="background:#f9fafb;padding:15px 30px;text-align:center;color:#888;font-size:13px;border-top:1px solid #e5e7eb;">
                                © 2025 NetCafeteria. All rights reserved. <br>
                                <a href="mailto:support@yourapp.com" style="color:#0b74de;text-decoration:none;">Contact Support</a>
                              </td>
                            </tr>

                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                  </html>`;

      // console.log("ee");
      //@ Send OTP via email
      // let mail = await sendEmail(
      //   data.email,
      //   `Welcome to ${data.restaurant_name}`,
      //   message
      // );
      // console.log(info)
      // await models.Role.create({ role_id: 1, name: "Super Admin" });
      // let info = await models.User.create({
      //   username: data.restaurant_name,
      //   email: data.email,
      //   password: data.password,
      //   role_id: 1,
      // });
      // console.log("ee");
      //@ Send OTP via email
      // let mail = await sendEmail(
      //   data.email,
      //   `Welcome to ${data.restaurant_name}`,
      //   message
      // );
      // console.log(info)
      //@ Send OTP via email
      res.status(201).json({
        message: "Tenant created successfully",
        data: {
          tenant_id: tenant.tenant_id,
          restaurant_name: tenant.restaurant_name,
          subdomain: tenant.subdomain,
          db_name: tenant.db_name,
          // mail: mail,
        },
      });
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      error: error.message,
      e: error,
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
    let match = await bcrypt.compare(password, found.password);
    // let match = password == found.password;
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

const exportedModules = {
  signUp,
  login,
};

export default exportedModules;
