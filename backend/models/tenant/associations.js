// export const setupAssociations = (models) => {
//   // const {
//   //   // Role ,
//   //   // Permission,
//   //   // User,
//   //   // Category,
//   //   // Dishes,
//   //   // Order,
//   //   // OrderItem,
//   //   // Billing,
//   //   // Feedback,
//   //   // Modules
//     Roles,
//     Billing,
//     Categories,
//     Feedback,
//     Modules,
//     Orders,
//     OrderItems,
//     tenantUsers,
//     Dishes,
//     Permission,
//   // } = models;
  
//   // const { Role, Permission, User, Category, Menu, Order, OrderItem, Billing, Feedback } = models;

//   console.log("dd")
//   // Role <-> Permissions
//   Roles.hasMany(Permission, { foreignKey: "role_id", as: "permissions" });
//   Permission.belongsTo(Roles, { foreignKey: "role_id", as: "role" });
//   // Role <-> User
//   Roles.hasMany(tenantUsers, { foreignKey: "role_id", as: "users" });
//   tenantUsers.belongsTo(Roles, { foreignKey: "role_id", as: "role" });

//   // Category <-> Menu
//   Categories.hasMany(Dishes, { foreignKey: "category_id", as: "menus" });
//   Dishes.belongsTo(Categories, { foreignKey: "category_id", as: "category" });

//   // User <-> Order (Waiter)
//   tenantUsers.hasMany(Orders, { foreignKey: "waiter_id", as: "orders" });
//   Orders.belongsTo(User, { foreignKey: "waiter_id", as: "waiter" });

//   // Order <-> OrderItem
//   Orders.hasMany(OrderItems, { foreignKey: "order_id", as: "items" });
//   OrderItems.belongsTo(Orders, { foreignKey: "order_id", as: "order" });

//   // Menu <-> OrderItem
//   Dishes.hasMany(OrderItems, { foreignKey: "menu_id", as: "orderItems" });
//   OrderItems.belongsTo(Dishes, { foreignKey: "menu_id", as: "menu" });

//   // Order <-> Billing
//   Orders.hasOne(Billing, { foreignKey: "order_id", as: "billing" });
//   Billing.belongsTo(Orders, { foreignKey: "order_id", as: "order" });

//   // Order <-> Feedback
//   Orders.hasOne(Feedback, { foreignKey: "order_id", as: "feedback" });
//   Feedback.belongsTo(Orders, { foreignKey: "order_id", as: "order" });

//   // modules <-> Permmisssions
//   Modules.hasMany(Permission, { foreignKey: "module_id"});
//   Permission.belongsTo(Modules, { foreignKey: "module_id"});
// };




export const setupAssociations = (models) => {
  const {
    Role,
    Permission,
    User,
    Category,
    Dishes,
    Order,
    OrderItem,
    Billing,
    Feedback,
    Modules
  } = models;

  // Role <-> Permission
  Role.hasMany(Permission, { foreignKey: "role_id", as: "permissions" });
  Permission.belongsTo(Role, { foreignKey: "role_id", as: "role" });

  // Role <-> User
  Role.hasMany(User, { foreignKey: "role_id", as: "users" });
  User.belongsTo(Role, { foreignKey: "role_id", as: "role" });

  // Category <-> Menu
  Category.hasMany(Menu, { foreignKey: "category_id", as: "menus" });
  Menu.belongsTo(Category, { foreignKey: "category_id", as: "category" });

  // User <-> Order (Waiter)
  User.hasMany(Order, { foreignKey: "waiter_id", as: "orders" });
  Order.belongsTo(User, { foreignKey: "waiter_id", as: "waiter" });

  // Order <-> OrderItem
  Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
  OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });

  // Menu <-> OrderItem
  Dishes.hasMany(OrderItem, { foreignKey: "menu_id", as: "orderItems" });
  OrderItem.belongsTo(Dishes, { foreignKey: "menu_id", as: "menu" });

  // Order <-> Billing
  Order.hasOne(Billing, { foreignKey: "order_id", as: "billing" });
  Billing.belongsTo(Order, { foreignKey: "order_id", as: "order" });

  // Order <-> Feedback
  Order.hasOne(Feedback, { foreignKey: "order_id", as: "feedback" });
  Feedback.belongsTo(Order, { foreignKey: "order_id", as: "order" });

  // modules <-> Permmisssions
  Modules.hasMany(Permission, { foreignKey: "module_id"});
  Permission.belongsTo(Modules, { foreignKey: "module_id"});
}
