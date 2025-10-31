import Sequelize from "sequelize";
import dotenv from "dotenv";

import Categories from "../models/tenant/catagories.js";
import OrderItems from "../models/tenant/orderItems.js";
import Roles from "../models/tenant/role.js";
import tenantUsers from "../models/tenant/users.js";
import Permissions from "../models/tenant/permission.js";
import Dishes from "../models/tenant/Dishes.js";
import Orders from "../models/tenant/order.js";
import Modules from "../models/tenant/module.js";
import Billing from "../models/tenant/billing.js";
import Feedback from "../models/tenant/feedback.js";
import Chat from "../models/tenant/chat.js";
import Message from "../models/tenant/message.js";
import { setupAssociations } from "../models/tenant/associations.js";

dotenv.config({ quiet: true });

// Master
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    define: {
      timestamps: true,
      freezeTableName: true,
    },
  }
);

// Tenant
const tenantConnections = {};
// const tenantSeqelize = async (dbname) => {
//   if (tenantConnections.hasOwnProperty(dbname)) {
//     const connection = tenantConnections[dbname];
//     try {
//       await connection.authenticate();
//       return connection;
//     } catch (error) {
//       console.log(`⚠️  Reconnecting to ${dbname}...`);
//       delete tenantConnections[dbname];
//     }
//   }

//   try {
//     // ✅ Create a new Sequelize instance
//     const sequelize = new Sequelize(
//       dbname,
//       process.env.DB_USER,
//       process.env.DB_PASSWORD,
//       {
//         host: process.env.DB_HOST,
//         dialect: "mysql",
//         define: {
//           timestamps: true,
//           freezeTableName: true,
//         },
//         pool: {
//           max: 5,
//           min: 0,
//           acquire: 30000,
//           idle: 10000,
//         },
//         logging: false,
//       }
//     );

//     // ✅ Test connection
//     await sequelize.authenticate();
//     console.log(`✅ Tenant DB "${dbname}" connected successfully!`);

//     // ✅ Initialize models
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

//     // ✅ Setup associations
//     // await setupAssociations(models);

//     // ✅ Sync tables
//     // await sequelize.sync({ alter: true });
//     // console.log(`✅ Models synced for tenant DB: ${dbname}`);

//     // ✅ Cache connection
//     tenantConnections[dbname] = sequelize;

//     return models;
//   } catch (error) {
//     console.error(`❌ Error connecting to tenant DB ${dbname}:`, error);
//     throw new Error(`Failed to connect to tenant database: ${error.message}`);
//   }
// };

const tenantSeqelize = async (dbname) => {
  const sequelize = new Sequelize(
    dbname,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: "mysql",
      define: {
        timestamps: true,
        freezeTableName: true,
      },
    }
  );

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

  // // Test connection
  // await sequelize.authenticate();
  // // console.log(sequelize);
  // await sequelize.sync({ alter: true });

  return models;
};
// const tenantModels = (sequelize, models) => {
//   let {
//     Roles,
//     Billing,
//     Categories,
//     Feedback,
//     Modules,
//     Orders,
//     OrderItems,
//     tenantUsers,
//     Dishes,
//     Permissions,
//   } = models;
//   return {
//     Role: Roles(sequelize),
//     Permission: Permissions(sequelize),
//     User: tenantUsers(sequelize),
//     Category: Categories(sequelize),
//     Dishes: Dishes(sequelize),
//     Order: Orders(sequelize),
//     OrderItem: OrderItems(sequelize),
//     Billing: Billing(sequelize),
//     Feedback: Feedback(sequelize),
//     Modules: Modules(sequelize),
//   };
// };

let connectDB = async () => {
  await sequelize.authenticate();
  // await sequelize.sync({alter:true});
};

export { sequelize, connectDB, tenantSeqelize };
