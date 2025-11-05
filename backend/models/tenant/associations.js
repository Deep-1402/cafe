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
    Module,
    Chat,
    Message
  } = models;

  // Role <-> User
  Role.hasMany(User, { foreignKey: "role_id", as: "users" });
  User.belongsTo(Role, { foreignKey: "role_id", as: "role" });

  // Role <-> Permission
  Role.hasMany(Permission, { foreignKey: "role_id", as: "permissions" });
  Permission.belongsTo(Role, { foreignKey: "role_id", as: "role" });
  // Category <-> Menu
  Category.hasMany(Dishes, { foreignKey: "category_id", as: "menus" });
  Dishes.belongsTo(Category, { foreignKey: "category_id", as: "category" });

  // User <-> Order (Waiter)
  User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
  Order.belongsTo(User, { foreignKey: "user_id", as: "waiter" });

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
  Module.hasMany(Permission, { foreignKey: "module_id" });
  Permission.belongsTo(Module, { foreignKey: "module_id" });

  // Chat <-> Message
  Chat.hasMany(Message, { foreignKey: "chat_id" });
  Message.belongsTo(Chat, { foreignKey: "chat_id" });

  // Chat <-> User
  User.hasMany(Chat, { foreignKey: "sender_id" });
  Chat.belongsTo(User, { foreignKey: "sender_id" });
  User.hasMany(User, { foreignKey: "receiver_id" });
  Chat.belongsTo(User, { foreignKey: "receiver_id" });
};
