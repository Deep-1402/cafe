import Sequelize from "sequelize";
import dotenv from "dotenv";
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
const tenantSeqelize = (dbname) => {
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
  return sequelize;
};
const tenantModels = (sequelize, models) => {
  let {
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
  } = models;
  return {
    Role: Roles(sequelize),
    Permission: Permissions(sequelize),
    User: tenantUsers(sequelize),
    Category: Categories(sequelize),
    Dishes: Dishes(sequelize),
    Order: Orders(sequelize),
    OrderItem: OrderItems(sequelize),
    Billing: Billing(sequelize),
    Feedback: Feedback(sequelize),
    Modules: Modules(sequelize),
  };
};

let connectDB = async () => {
  await sequelize.authenticate();
  // await sequelize.sync({alter:true});
};

export { sequelize, connectDB, tenantSeqelize , tenantModels};
