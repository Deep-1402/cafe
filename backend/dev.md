# Complete Database Models for Multi-Tenant Restaurant SaaS

## 📁 Project Structure

```
backend/
├── config/
│   └── config.js
├── models/
│   ├── master/
│   │   ├── Master.js
│   │   ├── Tenant.js
│   │   ├── Subscription.js
│   │   ├── TenantUser.js
│   │   └── GlobalSetting.js
│   └── tenant/
│       ├── User.js
│       ├── Role.js
│       ├── Permission.js
│       ├── Category.js
│       ├── Menu.js
│       ├── Order.js
│       ├── OrderItem.js
│       ├── Billing.js
│       └── Feedback.js
└── server.js
```

---

## 🗄️ **MASTER DATABASE MODELS**

### **config/config.js**

```javascript
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Master Database Connection
export const sequelize = new Sequelize(
  process.env.MASTER_DB_NAME,
  process.env.MASTER_DB_USER,
  process.env.MASTER_DB_PASSWORD,
  {
    host: process.env.MASTER_DB_HOST,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Function to create tenant database connection
export const createTenantConnection = (dbName) => {
  return new Sequelize(
    dbName,
    process.env.MASTER_DB_USER,
    process.env.MASTER_DB_PASSWORD,
    {
      host: process.env.MASTER_DB_HOST,
      dialect: "mysql",
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );
};
```

---

### **models/master/Master.js**

```javascript
import { sequelize } from "../../config/config.js";
import { DataTypes } from "sequelize";

const Master = sequelize.define(
  "master",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    paranoid: true,
  }
);

export default Master;
```

---

### **models/master/Subscription.js**

```javascript
import { sequelize } from "../../config/config.js";
import { DataTypes } from "sequelize";

const Subscription = sequelize.define(
  "subscription",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.ENUM("Basic", "Standard", "Premium"),
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: "Monthly price in USD",
    },
    description: {
      type: DataTypes.STRING(255),
    },
    max_users: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Maximum users allowed",
    },
    max_orders_per_month: {
      type: DataTypes.INTEGER,
      comment: "Maximum orders per month (null = unlimited)",
    },
    duration_days: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      comment: "Subscription duration in days",
    },
    features: {
      type: DataTypes.JSON,
      comment: "JSON object with features list",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    initialAutoIncrement: 101,
  }
);

export default Subscription;
```

---

### **models/master/Tenant.js**

```javascript
import { sequelize } from "../../config/config.js";
import { DataTypes } from "sequelize";
import Subscription from "./Subscription.js";

const Tenant = sequelize.define(
  "tenant",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    restaurant_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    subdomain: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: "Unique subdomain for tenant (e.g., pizzahut)",
      validate: {
        is: /^[a-z0-9-]+$/i, // Only alphanumeric and hyphens
      },
    },
    db_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: "Tenant's database name",
    },
    owner_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    owner_email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    owner_phone: {
      type: DataTypes.STRING(20),
    },
    subscription_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "subscriptions",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM("trial", "active", "suspended", "cancelled"),
      defaultValue: "trial",
    },
    trial_ends_at: {
      type: DataTypes.DATE,
      comment: "Trial period end date",
    },
    subscription_starts_at: {
      type: DataTypes.DATE,
    },
    subscription_ends_at: {
      type: DataTypes.DATE,
    },
    address: {
      type: DataTypes.TEXT,
    },
    logo_url: {
      type: DataTypes.STRING(255),
    },
    timezone: {
      type: DataTypes.STRING(50),
      defaultValue: "UTC",
    },
  },
  {
    timestamps: true,
    paranoid: true,
    initialAutoIncrement: 1001,
  }
);

// Associations
Tenant.belongsTo(Subscription, {
  foreignKey: "subscription_id",
  as: "subscription",
});

export default Tenant;
```

---

### **models/master/TenantUser.js**

```javascript
import { sequelize } from "../../config/config.js";
import { DataTypes } from "sequelize";
import Tenant from "./Tenant.js";

const TenantUser = sequelize.define(
  "tenant_user",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "tenants",
        key: "id",
      },
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    last_login: {
      type: DataTypes.DATE,
    },
    failed_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    locked_until: {
      type: DataTypes.DATE,
      comment: "Account locked until this date (for security)",
    },
  },
  {
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ["tenant_id", "email"],
      },
    ],
  }
);

// Associations
TenantUser.belongsTo(Tenant, {
  foreignKey: "tenant_id",
  as: "tenant",
});

export default TenantUser;
```

---

### **models/master/GlobalSetting.js**

```javascript
import { sequelize } from "../../config/config.js";
import { DataTypes } from "sequelize";
import Tenant from "./Tenant.js";

const GlobalSetting = sequelize.define(
  "global_setting",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tenant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "tenants",
        key: "id",
      },
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    password_expiry_days: {
      type: DataTypes.INTEGER,
      defaultValue: 90,
      comment: "Force password change after X days",
    },
    session_timeout_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 60,
    },
    max_login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
    },
    lockout_duration_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
    },
    notification_email: {
      type: DataTypes.STRING(100),
      validate: {
        isEmail: true,
      },
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: "USD",
    },
    tax_percentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.00,
    },
    custom_settings: {
      type: DataTypes.JSON,
      comment: "Additional custom settings as JSON",
    },
  },
  {
    timestamps: true,
  }
);

// Associations
GlobalSetting.belongsTo(Tenant, {
  foreignKey: "tenant_id",
  as: "tenant",
});

export default GlobalSetting;
```

---

## 🏪 **TENANT DATABASE MODELS**

### **models/tenant/Role.js**

```javascript
import { DataTypes } from "sequelize";

const Role = (sequelize) => {
  return sequelize.define(
    "role",
    {
      role_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.ENUM("Admin", "Manager", "Chef", "Waiter"),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING(255),
      },
      level: {
        type: DataTypes.INTEGER,
        comment: "Role hierarchy level (4=Admin, 3=Manager, 2=Chef, 1=Waiter)",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      paranoid: true,
      timestamps: true,
    }
  );
};

export default Role;
```

---

### **models/tenant/Permission.js**

```javascript
import { DataTypes } from "sequelize";

const Permission = (sequelize) => {
  return sequelize.define(
    "permission",
    {
      permission_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "roles",
          key: "role_id",
        },
      },
      resource: {
        type: DataTypes.ENUM(
          "menu",
          "category",
          "orders",
          "billing",
          "feedback",
          "users",
          "settings"
        ),
        allowNull: false,
        comment: "Resource/Module name",
      },
      can_view: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      can_create: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      can_edit: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      can_delete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["role_id", "resource"],
        },
      ],
    }
  );
};

export default Permission;
```

---

### **models/tenant/User.js**

```javascript
import { DataTypes } from "sequelize";

const User = (sequelize) => {
  return sequelize.define(
    "user",
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      master_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: "Reference to master.tenant_users.id",
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING(20),
      },
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "roles",
          key: "role_id",
        },
      },
      profile_image: {
        type: DataTypes.STRING(255),
      },
      date_of_birth: {
        type: DataTypes.DATEONLY,
      },
      address: {
        type: DataTypes.TEXT,
      },
      hire_date: {
        type: DataTypes.DATEONLY,
      },
      salary: {
        type: DataTypes.DECIMAL(10, 2),
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      paranoid: true,
      timestamps: true,
    }
  );
};

export default User;
```

---

### **models/tenant/Category.js**

```javascript
import { DataTypes } from "sequelize";

const Category = (sequelize) => {
  return sequelize.define(
    "category",
    {
      category_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
      },
      image_url: {
        type: DataTypes.STRING(255),
      },
      display_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "Order in which categories are displayed",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      paranoid: true,
      timestamps: true,
    }
  );
};

export default Category;
```

---

### **models/tenant/Menu.js**

```javascript
import { DataTypes } from "sequelize";

const Menu = (sequelize) => {
  return sequelize.define(
    "menu",
    {
      menu_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "categories",
          key: "category_id",
        },
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      discount_price: {
        type: DataTypes.DECIMAL(10, 2),
        comment: "Discounted price if any",
      },
      image_url: {
        type: DataTypes.STRING(255),
      },
      preparation_time: {
        type: DataTypes.INTEGER,
        comment: "Time in minutes",
      },
      calories: {
        type: DataTypes.INTEGER,
      },
      ingredients: {
        type: DataTypes.TEXT,
      },
      is_vegetarian: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_spicy: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      paranoid: true,
      timestamps: true,
    }
  );
};

export default Menu;
```

---

### **models/tenant/Order.js**

```javascript
import { DataTypes } from "sequelize";

const Order = (sequelize) => {
  return sequelize.define(
    "order",
    {
      order_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_number: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
        comment: "Human-readable order number (e.g., ORD-2024-001)",
      },
      table_number: {
        type: DataTypes.STRING(20),
      },
      customer_name: {
        type: DataTypes.STRING(100),
      },
      customer_phone: {
        type: DataTypes.STRING(20),
      },
      waiter_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "users",
          key: "user_id",
        },
      },
      order_type: {
        type: DataTypes.ENUM("dine-in", "takeaway", "delivery"),
        defaultValue: "dine-in",
      },
      status: {
        type: DataTypes.ENUM(
          "pending",
          "confirmed",
          "preparing",
          "ready",
          "served",
          "completed",
          "cancelled"
        ),
        defaultValue: "pending",
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      tax_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0.0,
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      special_instructions: {
        type: DataTypes.TEXT,
      },
      delivery_address: {
        type: DataTypes.TEXT,
      },
      estimated_time: {
        type: DataTypes.INTEGER,
        comment: "Estimated preparation time in minutes",
      },
      completed_at: {
        type: DataTypes.DATE,
      },
    },
    {
      paranoid: true,
      timestamps: true,
      initialAutoIncrement: 10001,
    }
  );
};

export default Order;
```

---

### **models/tenant/OrderItem.js**

```javascript
import { DataTypes } from "sequelize";

const OrderItem = (sequelize) => {
  return sequelize.define(
    "order_item",
    {
      order_item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "orders",
          key: "order_id",
        },
      },
      menu_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "menus",
          key: "menu_id",
        },
      },
      item_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        comment: "Snapshot of menu name at order time",
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      unit_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        comment: "Price at the time of order",
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      special_request: {
        type: DataTypes.TEXT,
      },
      status: {
        type: DataTypes.ENUM("pending", "preparing", "ready", "served"),
        defaultValue: "pending",
      },
    },
    {
      timestamps: true,
    }
  );
};

export default OrderItem;
```

---

### **models/tenant/Billing.js**

```javascript
import { DataTypes } from "sequelize";

const Billing = (sequelize) => {
  return sequelize.define(
    "billing",
    {
      billing_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "orders",
          key: "order_id",
        },
      },
      invoice_number: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
        comment: "Unique invoice number (e.g., INV-2024-001)",
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.ENUM("cash", "card", "upi", "wallet", "other"),
        allowNull: false,
      },
      payment_status: {
        type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
        defaultValue: "pending",
      },
      transaction_id: {
        type: DataTypes.STRING(100),
        comment: "Payment gateway transaction ID",
      },
      paid_amount: {
        type: DataTypes.DECIMAL(10, 2),
      },
      change_amount: {
        type: DataTypes.DECIMAL(10, 2),
        comment: "Change returned to customer",
      },
      payment_date: {
        type: DataTypes.DATE,
      },
      notes: {
        type: DataTypes.TEXT,
      },
    },
    {
      paranoid: true,
      timestamps: true,
      initialAutoIncrement: 50001,
    }
  );
};

export default Billing;
```

---

### **models/tenant/Feedback.js**

```javascript
import { DataTypes } from "sequelize";

const Feedback = (sequelize) => {
  return sequelize.define(
    "feedback",
    {
      feedback_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.INTEGER,
        references: {
          model: "orders",
          key: "order_id",
        },
      },
      customer_name: {
        type: DataTypes.STRING(100),
      },
      customer_email: {
        type: DataTypes.STRING(100),
        validate: {
          isEmail: true,
        },
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      food_rating: {
        type: DataTypes.INTEGER,
        validate: {
          min: 1,
          max: 5,
        },
      },
      service_rating: {
        type: DataTypes.INTEGER,
        validate: {
          min: 1,
          max: 5,
        },
      },
      ambiance_rating: {
        type: DataTypes.INTEGER,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: DataTypes.TEXT,
      },
      is_public: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: "Whether to display on website",
      },
      response: {
        type: DataTypes.TEXT,
        comment: "Restaurant's response to feedback",
      },
      responded_at: {
        type: DataTypes.DATE,
      },
    },
    {
      paranoid: true,
      timestamps: true,
    }
  );
};

export default Feedback;
```

---

## 🔗 **Model Associations Setup**

Create a file to set up all tenant model associations:

### **models/tenant/associations.js**

```javascript
export const setupAssociations = (models) => {
  const { Role, Permission, User, Category, Menu, Order, OrderItem, Billing, Feedback } = models;

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
  Menu.hasMany(OrderItem, { foreignKey: "menu_id", as: "orderItems" });
  OrderItem.belongsTo(Menu, { foreignKey: "menu_id", as: "menu" });

  // Order <-> Billing
  Order.hasOne(Billing, { foreignKey: "order_id", as: "billing" });
  Billing.belongsTo(Order, { foreignKey: "order_id", as: "order" });

  // Order <-> Feedback
  Order.hasOne(Feedback, { foreignKey: "order_id", as: "feedback" });
  Feedback.belongsTo(Order, { foreignKey: "order_id", as: "order" });
};
```

---

## ✅ **Next Steps**

Now that you have all models defined, you need:

1. **.env file configuration**
2. **Database sync utilities**
3. **Tenant initialization script**
4. **Middleware for authentication and tenant switching**

Would you like me to provide:
- **Database initialization scripts** (sync master & tenant DBs)?
- **Middleware implementations** (auth, tenant switching, permissions)?
- **.env configuration** and **server.js setup**?

Let me know which part you want next! 🚀
@-------------------------------------------------------- 
# Complete Middleware Implementation for Multi-Tenant SaaS

## 📁 Project Structure

```
backend/
├── middleware/
│   ├── auth.middleware.js
│   ├── tenant.middleware.js
│   ├── permission.middleware.js
│   ├── tenantStatus.middleware.js
│   ├── validation.middleware.js
│   ├── errorHandler.middleware.js
│   └── rateLimiter.middleware.js
├── utils/
│   ├── jwt.util.js
│   ├── tenantDB.util.js
│   └── response.util.js
└── constants/
    └── messages.js
```

---

## 🔧 **Utility Files**

### **utils/jwt.util.js**

```javascript
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || "24h";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || "7d";

// Generate Access Token
export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};

// Generate Refresh Token
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRE,
  });
};

// Verify Access Token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

// Verify Refresh Token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired refresh token");
  }
};

// Decode Token (without verification)
export const decodeToken = (token) => {
  return jwt.decode(token);
};
```

---

### **utils/tenantDB.util.js**

```javascript
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Import Tenant Models
import Role from "../models/tenant/Role.js";
import Permission from "../models/tenant/Permission.js";
import User from "../models/tenant/User.js";
import Category from "../models/tenant/Category.js";
import Menu from "../models/tenant/Menu.js";
import Order from "../models/tenant/Order.js";
import OrderItem from "../models/tenant/OrderItem.js";
import Billing from "../models/tenant/Billing.js";
import Feedback from "../models/tenant/Feedback.js";
import { setupAssociations } from "../models/tenant/associations.js";

dotenv.config();

// Cache for tenant database connections
const tenantConnections = new Map();

/**
 * Create or retrieve cached tenant database connection
 */
export const getTenantConnection = async (dbName) => {
  // Check if connection already exists in cache
  if (tenantConnections.has(dbName)) {
    const cachedConnection = tenantConnections.get(dbName);
    
    // Test if connection is alive
    try {
      await cachedConnection.authenticate();
      return cachedConnection;
    } catch (error) {
      // Connection is dead, remove from cache
      tenantConnections.delete(dbName);
    }
  }

  // Create new connection
  const connection = new Sequelize(
    dbName,
    process.env.MASTER_DB_USER,
    process.env.MASTER_DB_PASSWORD,
    {
      host: process.env.MASTER_DB_HOST,
      dialect: "mysql",
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    }
  );

  try {
    await connection.authenticate();
    console.log(`✅ Connected to tenant database: ${dbName}`);

    // Initialize models
    const models = initializeTenantModels(connection);
    
    // Setup associations
    setupAssociations(models);

    // Cache the connection
    tenantConnections.set(dbName, connection);

    return connection;
  } catch (error) {
    console.error(`❌ Failed to connect to tenant database: ${dbName}`, error);
    throw new Error("Database connection failed");
  }
};

/**
 * Initialize all tenant models on a connection
 */
export const initializeTenantModels = (sequelize) => {
  return {
    Role: Role(sequelize),
    Permission: Permission(sequelize),
    User: User(sequelize),
    Category: Category(sequelize),
    Menu: Menu(sequelize),
    Order: Order(sequelize),
    OrderItem: OrderItem(sequelize),
    Billing: Billing(sequelize),
    Feedback: Feedback(sequelize),
  };
};

/**
 * Get all models from tenant connection
 */
export const getTenantModels = (connection) => {
  return connection.models;
};

/**
 * Close tenant connection
 */
export const closeTenantConnection = async (dbName) => {
  if (tenantConnections.has(dbName)) {
    const connection = tenantConnections.get(dbName);
    await connection.close();
    tenantConnections.delete(dbName);
    console.log(`🔌 Closed tenant database connection: ${dbName}`);
  }
};

/**
 * Close all tenant connections
 */
export const closeAllTenantConnections = async () => {
  for (const [dbName, connection] of tenantConnections) {
    await connection.close();
    console.log(`🔌 Closed tenant database connection: ${dbName}`);
  }
  tenantConnections.clear();
};
```

---

### **utils/response.util.js**

```javascript
/**
 * Success Response
 */
export const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Error Response
 */
export const errorResponse = (res, message, statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

/**
 * Pagination Response
 */
export const paginatedResponse = (res, message, data, pagination) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: pagination.page,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      totalItems: pagination.total,
      itemsPerPage: pagination.limit,
    },
  });
};
```

---

### **constants/messages.js**

```javascript
export const AUTH_MESSAGES = {
  TOKEN_REQUIRED: "Authentication token is required",
  TOKEN_INVALID: "Invalid or expired token",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "You don't have permission to perform this action",
  ACCOUNT_INACTIVE: "Your account is inactive. Please contact support.",
  ACCOUNT_LOCKED: "Your account is locked. Please try again later.",
};

export const TENANT_MESSAGES = {
  NOT_FOUND: "Tenant not found",
  SUSPENDED: "Your subscription is suspended. Please contact support.",
  EXPIRED: "Your subscription has expired. Please renew.",
  TRIAL_EXPIRED: "Your trial period has expired. Please subscribe.",
  DB_CONNECTION_FAILED: "Failed to connect to tenant database",
};

export const PERMISSION_MESSAGES = {
  INSUFFICIENT: "You don't have permission to perform this action",
  RESOURCE_NOT_ALLOWED: "Access to this resource is not allowed",
};
```

---

## 🛡️ **Middleware Implementations**

### **middleware/auth.middleware.js**

```javascript
import { verifyToken } from "../utils/jwt.util.js";
import { errorResponse } from "../utils/response.util.js";
import { AUTH_MESSAGES } from "../constants/messages.js";
import TenantUser from "../models/master/TenantUser.js";

/**
 * Verify JWT Token and Authenticate User
 */
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, AUTH_MESSAGES.TOKEN_REQUIRED, 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return errorResponse(res, AUTH_MESSAGES.TOKEN_REQUIRED, 401);
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return errorResponse(res, AUTH_MESSAGES.TOKEN_INVALID, 401);
    }

    // Check if user exists in master database
    const tenantUser = await TenantUser.findOne({
      where: {
        id: decoded.master_user_id,
        is_active: true,
      },
      attributes: { exclude: ["password"] },
    });

    if (!tenantUser) {
      return errorResponse(res, AUTH_MESSAGES.ACCOUNT_INACTIVE, 403);
    }

    // Check if account is locked
    if (tenantUser.locked_until && new Date(tenantUser.locked_until) > new Date()) {
      return errorResponse(res, AUTH_MESSAGES.ACCOUNT_LOCKED, 403);
    }

    // Attach user info to request
    req.user = {
      master_user_id: decoded.master_user_id,
      tenant_id: decoded.tenant_id,
      user_id: decoded.user_id,
      role_id: decoded.role_id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return errorResponse(res, AUTH_MESSAGES.UNAUTHORIZED, 401);
  }
};

/**
 * Optional Authentication (for public routes that can work with/without auth)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      
      try {
        const decoded = verifyToken(token);
        req.user = {
          master_user_id: decoded.master_user_id,
          tenant_id: decoded.tenant_id,
          user_id: decoded.user_id,
          role_id: decoded.role_id,
          email: decoded.email,
        };
      } catch (error) {
        // Invalid token, but continue as unauthenticated
        req.user = null;
      }
    }

    next();
  } catch (error) {
    next();
  }
};
```

---

### **middleware/tenant.middleware.js**

```javascript
import { getTenantConnection, getTenantModels } from "../utils/tenantDB.util.js";
import { errorResponse } from "../utils/response.util.js";
import { TENANT_MESSAGES } from "../constants/messages.js";
import Tenant from "../models/master/Tenant.js";

/**
 * Load Tenant Database and Models
 */
export const loadTenant = async (req, res, next) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.tenant_id) {
      return errorResponse(res, TENANT_MESSAGES.NOT_FOUND, 404);
    }

    const tenantId = req.user.tenant_id;

    // Get tenant info from master database
    const tenant = await Tenant.findOne({
      where: { id: tenantId },
      include: {
        model: (await import("../models/master/Subscription.js")).default,
        as: "subscription",
      },
    });

    if (!tenant) {
      return errorResponse(res, TENANT_MESSAGES.NOT_FOUND, 404);
    }

    // Store tenant info in request
    req.tenant = tenant;

    try {
      // Connect to tenant's database
      const tenantConnection = await getTenantConnection(tenant.db_name);

      // Get all models
      const models = getTenantModels(tenantConnection);

      // Attach to request
      req.tenantDB = tenantConnection;
      req.models = models;

      next();
    } catch (error) {
      console.error("Tenant DB connection error:", error);
      return errorResponse(res, TENANT_MESSAGES.DB_CONNECTION_FAILED, 500);
    }
  } catch (error) {
    console.error("Load tenant error:", error);
    return errorResponse(res, "Failed to load tenant", 500);
  }
};

/**
 * Load Tenant by Subdomain (for public routes)
 */
export const loadTenantBySubdomain = async (req, res, next) => {
  try {
    // Get subdomain from header or query parameter
    const subdomain = req.headers["x-tenant-subdomain"] || req.query.subdomain;

    if (!subdomain) {
      return errorResponse(res, "Subdomain is required", 400);
    }

    // Find tenant by subdomain
    const tenant = await Tenant.findOne({
      where: { subdomain },
      include: {
        model: (await import("../models/master/Subscription.js")).default,
        as: "subscription",
      },
    });

    if (!tenant) {
      return errorResponse(res, TENANT_MESSAGES.NOT_FOUND, 404);
    }

    req.tenant = tenant;

    // Connect to tenant database
    const tenantConnection = await getTenantConnection(tenant.db_name);
    const models = getTenantModels(tenantConnection);

    req.tenantDB = tenantConnection;
    req.models = models;

    next();
  } catch (error) {
    console.error("Load tenant by subdomain error:", error);
    return errorResponse(res, "Failed to load tenant", 500);
  }
};
```

---

### **middleware/tenantStatus.middleware.js**

```javascript
import { errorResponse } from "../utils/response.util.js";
import { TENANT_MESSAGES } from "../constants/messages.js";

/**
 * Check if tenant subscription is active
 */
export const checkTenantStatus = (req, res, next) => {
  try {
    const tenant = req.tenant;

    if (!tenant) {
      return errorResponse(res, TENANT_MESSAGES.NOT_FOUND, 404);
    }

    // Check tenant status
    if (tenant.status === "suspended") {
      return errorResponse(res, TENANT_MESSAGES.SUSPENDED, 403);
    }

    if (tenant.status === "cancelled") {
      return errorResponse(res, "Your subscription has been cancelled", 403);
    }

    // Check if trial has expired
    if (tenant.status === "trial") {
      const trialEndsAt = new Date(tenant.trial_ends_at);
      if (trialEndsAt < new Date()) {
        return errorResponse(res, TENANT_MESSAGES.TRIAL_EXPIRED, 403);
      }
    }

    // Check if subscription has expired
    if (tenant.status === "active") {
      const subscriptionEndsAt = new Date(tenant.subscription_ends_at);
      if (subscriptionEndsAt < new Date()) {
        return errorResponse(res, TENANT_MESSAGES.EXPIRED, 403);
      }
    }

    next();
  } catch (error) {
    console.error("Check tenant status error:", error);
    return errorResponse(res, "Failed to verify subscription", 500);
  }
};

/**
 * Check subscription limits (e.g., max users)
 */
export const checkSubscriptionLimits = (limitType) => {
  return async (req, res, next) => {
    try {
      const tenant = req.tenant;
      const subscription = tenant.subscription;

      if (limitType === "users") {
        // Count current users
        const userCount = await req.models.User.count({
          where: { is_active: true },
        });

        if (userCount >= subscription.max_users) {
          return errorResponse(
            res,
            `User limit reached. Your plan allows maximum ${subscription.max_users} users.`,
            403
          );
        }
      }

      if (limitType === "orders") {
        // Check monthly order limit
        if (subscription.max_orders_per_month) {
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const orderCount = await req.models.Order.count({
            where: {
              createdAt: {
                [req.tenantDB.Sequelize.Op.gte]: startOfMonth,
              },
            },
          });

          if (orderCount >= subscription.max_orders_per_month) {
            return errorResponse(
              res,
              `Monthly order limit reached. Upgrade your plan for more orders.`,
              403
            );
          }
        }
      }

      next();
    } catch (error) {
      console.error("Check subscription limits error:", error);
      return errorResponse(res, "Failed to verify subscription limits", 500);
    }
  };
};
```

---

### **middleware/permission.middleware.js**

```javascript
import { errorResponse } from "../utils/response.util.js";
import { PERMISSION_MESSAGES } from "../constants/messages.js";

/**
 * Check if user has permission to perform action on resource
 * @param {string} resource - Resource name (menu, orders, etc.)
 * @param {string} action - Action type (view, create, edit, delete)
 */
export const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const { role_id } = req.user;
      const { Permission } = req.models;

      // Find permission for role and resource
      const permission = await Permission.findOne({
        where: {
          role_id,
          resource,
        },
      });

      if (!permission) {
        return errorResponse(
          res,
          PERMISSION_MESSAGES.RESOURCE_NOT_ALLOWED,
          403
        );
      }

      // Check specific action permission
      const permissionField = `can_${action}`;
      
      if (!permission[permissionField]) {
        return errorResponse(
          res,
          `You don't have permission to ${action} ${resource}`,
          403
        );
      }

      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return errorResponse(res, "Permission verification failed", 500);
    }
  };
};

/**
 * Check if user has specific role
 * @param {Array} allowedRoles - Array of role names ['Admin', 'Manager']
 */
export const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { role_id } = req.user;
      const { Role } = req.models;

      // Get user's role
      const role = await Role.findOne({
        where: { role_id },
      });

      if (!role) {
        return errorResponse(res, "Role not found", 404);
      }

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(role.name)) {
        return errorResponse(
          res,
          `This action requires one of these roles: ${allowedRoles.join(", ")}`,
          403
        );
      }

      // Attach role to request for further use
      req.userRole = role;

      next();
    } catch (error) {
      console.error("Role check error:", error);
      return errorResponse(res, "Role verification failed", 500);
    }
  };
};

/**
 * Check if user has minimum role level
 * @param {number} minLevel - Minimum role level (4=Admin, 3=Manager, 2=Chef, 1=Waiter)
 */
export const checkRoleLevel = (minLevel) => {
  return async (req, res, next) => {
    try {
      const { role_id } = req.user;
      const { Role } = req.models;

      const role = await Role.findOne({
        where: { role_id },
      });

      if (!role) {
        return errorResponse(res, "Role not found", 404);
      }

      if (role.level < minLevel) {
        return errorResponse(
          res,
          "You don't have sufficient privileges for this action",
          403
        );
      }

      req.userRole = role;
      next();
    } catch (error) {
      console.error("Role level check error:", error);
      return errorResponse(res, "Role verification failed", 500);
    }
  };
};

/**
 * Check if user can access their own resource or has admin privileges
 */
export const checkOwnershipOrAdmin = async (req, res, next) => {
  try {
    const { user_id, role_id } = req.user;
    const { Role } = req.models;

    // Get user's role
    const role = await Role.findOne({
      where: { role_id },
    });

    // If Admin or Manager, allow access
    if (role.name === "Admin" || role.name === "Manager") {
      req.isAdmin = true;
      return next();
    }

    // Otherwise, check if user is accessing their own resource
    const resourceUserId = req.params.user_id || req.body.user_id;
    
    if (parseInt(resourceUserId) !== parseInt(user_id)) {
      return errorResponse(
        res,
        "You can only access your own resources",
        403
      );
    }

    req.isAdmin = false;
    next();
  } catch (error) {
    console.error("Ownership check error:", error);
    return errorResponse(res, "Authorization failed", 500);
  }
};
```

---

### **middleware/validation.middleware.js**

```javascript
import { validationResult } from "express-validator";
import { errorResponse } from "../utils/response.util.js";

/**
 * Validate request using express-validator
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));

    return errorResponse(res, "Validation failed", 400, formattedErrors);
  }

  next();
};

/**
 * Sanitize request body
 */
export const sanitize = (req, res, next) => {
  // Remove any extra whitespace from string fields
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  next();
};
```

---

### **middleware/rateLimiter.middleware.js**

```javascript
import rateLimit from "express-rate-limit";
import { errorResponse } from "../utils/response.util.js";

/**
 * Rate limiter for login attempts
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: "Too many login attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      "Too many login attempts. Please try again after 15 minutes.",
      429
    );
  },
});

/**
 * Rate limiter for API requests
 */
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: "Too many requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      "Too many requests. Please try again later.",
      429
    );
  },
});

/**
 * Rate limiter for registration
 */
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registration attempts per hour
  message: "Too many registration attempts. Please try again after an hour.",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      "Too many registration attempts. Please try again after an hour.",
      429
    );
  },
});
```

---

### **middleware/errorHandler.middleware.js**

```javascript
import { errorResponse } from "../utils/response.util.js";

/**
 * Global Error Handler
 */
export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  // Sequelize Validation Error
  if (err.name === "SequelizeValidationError") {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return errorResponse(res, "Validation error", 400, errors);
  }

  // Sequelize Unique Constraint Error
  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors[0]?.path || "field";
    return errorResponse(res, `${field} already exists`, 409);
  }

  // Sequelize Foreign Key Constraint Error
  if (err.name === "SequelizeForeignKeyConstraintError") {
    return errorResponse(res, "Invalid reference to related data", 400);
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    return errorResponse(res, "Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    return errorResponse(res, "Token has expired", 401);
  }

  // Default Error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";

  return errorResponse(res, message, statusCode);
};

/**
 * 404 Not Found Handler
 */
export const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};
```

---

## 🎯 **Usage Examples in Routes**

### **Example: Menu Routes with Middleware**

```javascript
import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { loadTenant } from "../middleware/tenant.middleware.js";
import { checkTenantStatus } from "../middleware/tenantStatus.middleware.js";
import { checkPermission, checkRole } from "../middleware/permission.middleware.js";
import * as menuController from "../controllers/menu.controller.js";

const router = express.Router();

// All routes require authentication and tenant context
router.use(authenticate);
router.use(loadTenant);
router.use(checkTenantStatus);

// GET - View menus (all roles can view)
router.get(
  "/",
  checkPermission("menu", "view"),
  menuController.getAllMenus
);

// GET - View single menu
router.get(
  "/:id",
  checkPermission("menu", "view"),
  menuController.getMenuById
);

// POST - Create menu (only Admin and Manager)
router.post(
  "/",
  checkRole(["Admin", "Manager"]),
  checkPermission("menu", "create"),
  menuController.createMenu
);

// PUT - Update menu
router.put(
  "/:id",
  checkPermission("menu", "edit"),
  menuController.updateMenu
);

// DELETE - Delete menu (only Admin)
router.delete(
  "/:id",
  checkRole(["Admin"]),
  checkPermission("menu", "delete"),
  menuController.deleteMenu
);

export default router;
```

### **Example: Order Routes**

```javascript
import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { loadTenant } from "../middleware/tenant.middleware.js";
import { checkTenantStatus, checkSubscriptionLimits } from "../middleware/tenantStatus.middleware.js";
import { checkPermission } from "../middleware/permission.middleware.js";
import * as orderController from "../controllers/order.controller.js";

const router = express.Router();

router.use(authenticate);
router.use(loadTenant);
router.use(checkTenantStatus);

// Create new order (check order limits)
router.post(
  "/",
  checkSubscriptionLimits("orders"),
  checkPermission("orders", "create"),
  orderController.createOrder
);

// View all orders
router.get(
  "/",
  checkPermission("orders", "view"),
  orderController.getAllOrders
);

// Update order status
router.put(
  "/:id/status",
  checkPermission("orders", "edit"),
  orderController.updateOrderStatus
);

export default router;
```

---

## 📝 **Summary of Middleware Chain**

```javascript
// Typical middleware chain for protected tenant routes:
[
  authenticate,           // 1. Verify JWT token
  loadTenant,            // 2. Connect to tenant DB
  checkTenantStatus,     // 3. Verify subscription is active
  checkPermission(),     // 4. Check RBAC permissions
  controller             // 5. Execute business logic
]
```

Would you like me to provide:
1. **Controller implementations** (menu, order, user, etc.)?
2. **Authentication routes** (login, register, refresh token)?
3. **Database initialization scripts**?
4. **Complete server.js setup**?

Let me know what you need next! 🚀
@-------------------------------------------------------- 
# Master Database Controllers & Routes

## 📁 Project Structure

```
backend/
├── controllers/
│   └── master/
│       ├── auth.controller.js
│       ├── subscription.controller.js
│       ├── tenant.controller.js
│       └── dashboard.controller.js
├── routes/
│   └── master/
│       ├── auth.routes.js
│       ├── subscription.routes.js
│       ├── tenant.routes.js
│       └── dashboard.routes.js
├── middleware/
│   └── master/
│       └── masterAuth.middleware.js
├── validators/
│   └── master/
│       ├── subscription.validator.js
│       └── tenant.validator.js
├── utils/
│   ├── tenantDBSetup.util.js
│   └── password.util.js
└── models/
    └── master/
        └── (already created)
```

---

## 🔧 **Utility Files**

### **utils/password.util.js**

```javascript
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * Hash password
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Generate random password
 */
export const generateRandomPassword = (length = 12) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};
```

---

### **utils/tenantDBSetup.util.js**

```javascript
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Import Tenant Models
import Role from "../models/tenant/Role.js";
import Permission from "../models/tenant/Permission.js";
import User from "../models/tenant/User.js";
import Category from "../models/tenant/Category.js";
import Menu from "../models/tenant/Menu.js";
import Order from "../models/tenant/Order.js";
import OrderItem from "../models/tenant/OrderItem.js";
import Billing from "../models/tenant/Billing.js";
import Feedback from "../models/tenant/Feedback.js";
import { setupAssociations } from "../models/tenant/associations.js";

dotenv.config();

/**
 * Create tenant database
 */
export const createTenantDatabase = async (dbName) => {
  const connection = new Sequelize(
    "", // No database selected
    process.env.MASTER_DB_USER,
    process.env.MASTER_DB_PASSWORD,
    {
      host: process.env.MASTER_DB_HOST,
      dialect: "mysql",
      logging: false,
    }
  );

  try {
    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Database '${dbName}' created successfully`);
    await connection.close();
    return true;
  } catch (error) {
    console.error(`❌ Error creating database '${dbName}':`, error);
    await connection.close();
    throw error;
  }
};

/**
 * Initialize tenant database with tables and default data
 */
export const initializeTenantDatabase = async (dbName, ownerData) => {
  const connection = new Sequelize(
    dbName,
    process.env.MASTER_DB_USER,
    process.env.MASTER_DB_PASSWORD,
    {
      host: process.env.MASTER_DB_HOST,
      dialect: "mysql",
      logging: false,
    }
  );

  try {
    // Initialize models
    const models = {
      Role: Role(connection),
      Permission: Permission(connection),
      User: User(connection),
      Category: Category(connection),
      Menu: Menu(connection),
      Order: Order(connection),
      OrderItem: OrderItem(connection),
      Billing: Billing(connection),
      Feedback: Feedback(connection),
    };

    // Setup associations
    setupAssociations(models);

    // Sync all models (create tables)
    await connection.sync({ force: false });
    console.log(`✅ Tables created in database '${dbName}'`);

    // Insert default roles
    const roles = await insertDefaultRoles(models.Role);

    // Insert default permissions
    await insertDefaultPermissions(models.Permission, roles);

    // Create admin user
    await createAdminUser(models.User, roles.Admin, ownerData);

    // Insert default categories
    await insertDefaultCategories(models.Category);

    await connection.close();
    console.log(`✅ Tenant database '${dbName}' initialized successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error initializing tenant database '${dbName}':`, error);
    await connection.close();
    throw error;
  }
};

/**
 * Insert default roles
 */
const insertDefaultRoles = async (RoleModel) => {
  const rolesData = [
    { name: "Admin", description: "Full system access", level: 4 },
    { name: "Manager", description: "Management level access", level: 3 },
    { name: "Chef", description: "Kitchen and order management", level: 2 },
    { name: "Waiter", description: "Order taking and serving", level: 1 },
  ];

  const roles = {};
  for (const roleData of rolesData) {
    const [role] = await RoleModel.findOrCreate({
      where: { name: roleData.name },
      defaults: roleData,
    });
    roles[roleData.name] = role;
  }

  console.log("✅ Default roles inserted");
  return roles;
};

/**
 * Insert default permissions
 */
const insertDefaultPermissions = async (PermissionModel, roles) => {
  const resources = ["menu", "category", "orders", "billing", "feedback", "users", "settings"];

  const permissionsData = [
    // Admin - Full access to everything
    ...resources.map((resource) => ({
      role_id: roles.Admin.role_id,
      resource,
      can_view: true,
      can_create: true,
      can_edit: true,
      can_delete: true,
    })),

    // Manager - Almost full access, limited user management
    ...resources.map((resource) => ({
      role_id: roles.Manager.role_id,
      resource,
      can_view: true,
      can_create: resource !== "settings",
      can_edit: resource !== "settings",
      can_delete: resource === "menu" || resource === "category" || resource === "orders",
    })),

    // Chef - Kitchen focused permissions
    { role_id: roles.Chef.role_id, resource: "menu", can_view: true, can_create: false, can_edit: false, can_delete: false },
    { role_id: roles.Chef.role_id, resource: "category", can_view: true, can_create: false, can_edit: false, can_delete: false },
    { role_id: roles.Chef.role_id, resource: "orders", can_view: true, can_create: true, can_edit: true, can_delete: false },
    { role_id: roles.Chef.role_id, resource: "billing", can_view: false, can_create: false, can_edit: false, can_delete: false },
    { role_id: roles.Chef.role_id, resource: "feedback", can_view: true, can_create: false, can_edit: false, can_delete: false },
    { role_id: roles.Chef.role_id, resource: "users", can_view: false, can_create: false, can_edit: false, can_delete: false },
    { role_id: roles.Chef.role_id, resource: "settings", can_view: false, can_create: false, can_edit: false, can_delete: false },

    // Waiter - Front of house permissions
    { role_id: roles.Waiter.role_id, resource: "menu", can_view: true, can_create: false, can_edit: false, can_delete: false },
    { role_id: roles.Waiter.role_id, resource: "category", can_view: true, can_create: false, can_edit: false, can_delete: false },
    { role_id: roles.Waiter.role_id, resource: "orders", can_view: true, can_create: true, can_edit: false, can_delete: false },
    { role_id: roles.Waiter.role_id, resource: "billing", can_view: false, can_create: false, can_edit: false, can_delete: false },
    { role_id: roles.Waiter.role_id, resource: "feedback", can_view: false, can_create: false, can_edit: false, can_delete: false },
    { role_id: roles.Waiter.role_id, resource: "users", can_view: false, can_create: false, can_edit: false, can_delete: false },
    { role_id: roles.Waiter.role_id, resource: "settings", can_view: false, can_create: false, can_edit: false, can_delete: false },
  ];

  for (const permData of permissionsData) {
    await PermissionModel.findOrCreate({
      where: {
        role_id: permData.role_id,
        resource: permData.resource,
      },
      defaults: permData,
    });
  }

  console.log("✅ Default permissions inserted");
};

/**
 * Create admin user for tenant
 */
const createAdminUser = async (UserModel, adminRole, ownerData) => {
  await UserModel.findOrCreate({
    where: { email: ownerData.email },
    defaults: {
      master_user_id: ownerData.master_user_id,
      name: ownerData.name,
      email: ownerData.email,
      phone: ownerData.phone || null,
      role_id: adminRole.role_id,
      is_active: true,
    },
  });

  console.log("✅ Admin user created");
};

/**
 * Insert default categories
 */
const insertDefaultCategories = async (CategoryModel) => {
  const categories = [
    { name: "Starters", description: "Appetizers and starters", display_order: 1 },
    { name: "Main Course", description: "Main dishes", display_order: 2 },
    { name: "Desserts", description: "Sweet dishes", display_order: 3 },
    { name: "Beverages", description: "Drinks and beverages", display_order: 4 },
  ];

  for (const category of categories) {
    await CategoryModel.findOrCreate({
      where: { name: category.name },
      defaults: category,
    });
  }

  console.log("✅ Default categories inserted");
};

/**
 * Drop tenant database (use with caution!)
 */
export const dropTenantDatabase = async (dbName) => {
  const connection = new Sequelize(
    "",
    process.env.MASTER_DB_USER,
    process.env.MASTER_DB_PASSWORD,
    {
      host: process.env.MASTER_DB_HOST,
      dialect: "mysql",
      logging: false,
    }
  );

  try {
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\`;`);
    console.log(`✅ Database '${dbName}' dropped successfully`);
    await connection.close();
    return true;
  } catch (error) {
    console.error(`❌ Error dropping database '${dbName}':`, error);
    await connection.close();
    throw error;
  }
};
```

---

## 🛡️ **Master Authentication Middleware**

### **middleware/master/masterAuth.middleware.js**

```javascript
import { verifyToken } from "../../utils/jwt.util.js";
import { errorResponse } from "../../utils/response.util.js";
import Master from "../../models/master/Master.js";

/**
 * Authenticate Master Admin
 */
export const authenticateMaster = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, "Authentication token is required", 401);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return errorResponse(res, "Authentication token is required", 401);
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return errorResponse(res, "Invalid or expired token", 401);
    }

    // Check if it's a master token
    if (decoded.type !== "master") {
      return errorResponse(res, "Invalid token type", 401);
    }

    // Check if master exists
    const master = await Master.findOne({
      where: {
        id: decoded.master_id,
        is_active: true,
      },
      attributes: { exclude: ["password"] },
    });

    if (!master) {
      return errorResponse(res, "Master account not found or inactive", 403);
    }

    // Attach master info to request
    req.master = {
      id: decoded.master_id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    console.error("Master authentication error:", error);
    return errorResponse(res, "Authentication failed", 401);
  }
};
```

---

## ✅ **Validators**

### **validators/master/subscription.validator.js**

```javascript
import { body } from "express-validator";

export const createSubscriptionValidator = [
  body("name")
    .isIn(["Basic", "Standard", "Premium"])
    .withMessage("Plan name must be Basic, Standard, or Premium"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("max_users")
    .isInt({ min: 1 })
    .withMessage("Max users must be at least 1"),
  body("max_orders_per_month")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Max orders must be a positive number"),
  body("duration_days")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration must be at least 1 day"),
  body("features")
    .optional()
    .isObject()
    .withMessage("Features must be a JSON object"),
];

export const updateSubscriptionValidator = [
  body("name")
    .optional()
    .isIn(["Basic", "Standard", "Premium"])
    .withMessage("Plan name must be Basic, Standard, or Premium"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string"),
  body("max_users")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Max users must be at least 1"),
  body("max_orders_per_month")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Max orders must be a positive number"),
  body("duration_days")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration must be at least 1 day"),
  body("features")
    .optional()
    .isObject()
    .withMessage("Features must be a JSON object"),
  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active must be boolean"),
];
```

---

### **validators/master/tenant.validator.js**

```javascript
import { body } from "express-validator";

export const createTenantValidator = [
  body("restaurant_name")
    .notEmpty()
    .withMessage("Restaurant name is required")
    .isLength({ min: 3, max: 150 })
    .withMessage("Restaurant name must be between 3-150 characters"),
  body("subdomain")
    .notEmpty()
    .withMessage("Subdomain is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Subdomain must be between 3-50 characters")
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Subdomain can only contain lowercase letters, numbers, and hyphens")
    .custom((value) => {
      const reserved = ["www", "admin", "api", "app", "mail", "ftp", "localhost"];
      if (reserved.includes(value.toLowerCase())) {
        throw new Error("This subdomain is reserved");
      }
      return true;
    }),
  body("owner_name")
    .notEmpty()
    .withMessage("Owner name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Owner name must be between 2-100 characters"),
  body("owner_email")
    .notEmpty()
    .withMessage("Owner email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("owner_phone")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid phone number"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage("Password must contain uppercase, lowercase, number and special character"),
  body("subscription_id")
    .notEmpty()
    .withMessage("Subscription plan is required")
    .isInt()
    .withMessage("Invalid subscription plan"),
  body("address")
    .optional()
    .isString()
    .withMessage("Address must be a string"),
  body("timezone")
    .optional()
    .isString()
    .withMessage("Timezone must be a string"),
];

export const updateTenantValidator = [
  body("restaurant_name")
    .optional()
    .isLength({ min: 3, max: 150 })
    .withMessage("Restaurant name must be between 3-150 characters"),
  body("owner_name")
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage("Owner name must be between 2-100 characters"),
  body("owner_email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("owner_phone")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid phone number"),
  body("subscription_id")
    .optional()
    .isInt()
    .withMessage("Invalid subscription plan"),
  body("status")
    .optional()
    .isIn(["trial", "active", "suspended", "cancelled"])
    .withMessage("Invalid status"),
  body("address")
    .optional()
    .isString()
    .withMessage("Address must be a string"),
  body("timezone")
    .optional()
    .isString()
    .withMessage("Timezone must be a string"),
];
```

---

## 🎮 **Controllers**

### **controllers/master/auth.controller.js**

```javascript
import Master from "../../models/master/Master.js";
import { hashPassword, comparePassword } from "../../utils/password.util.js";
import { generateToken, generateRefreshToken } from "../../utils/jwt.util.js";
import { successResponse, errorResponse } from "../../utils/response.util.js";

/**
 * Master Login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find master
    const master = await Master.findOne({
      where: { email },
    });

    if (!master) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    // Check if account is active
    if (!master.is_active) {
      return errorResponse(res, "Your account is inactive", 403);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, master.password);

    if (!isPasswordValid) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    // Generate tokens
    const tokenPayload = {
      master_id: master.id,
      email: master.email,
      type: "master",
    };

    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Return response
    return successResponse(res, "Login successful", {
      master: {
        id: master.id,
        name: master.name,
        email: master.email,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Master login error:", error);
    return errorResponse(res, "Login failed", 500);
  }
};

/**
 * Create Master Account (Initial Setup - should be protected in production)
 */
export const createMaster = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if master already exists
    const existingMaster = await Master.findOne({ where: { email } });

    if (existingMaster) {
      return errorResponse(res, "Master account already exists", 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create master
    const master = await Master.create({
      name,
      email,
      password: hashedPassword,
    });

    return successResponse(
      res,
      "Master account created successfully",
      {
        id: master.id,
        name: master.name,
        email: master.email,
      },
      201
    );
  } catch (error) {
    console.error("Create master error:", error);
    return errorResponse(res, "Failed to create master account", 500);
  }
};

/**
 * Get Master Profile
 */
export const getProfile = async (req, res) => {
  try {
    const master = await Master.findOne({
      where: { id: req.master.id },
      attributes: { exclude: ["password"] },
    });

    return successResponse(res, "Profile fetched successfully", master);
  } catch (error) {
    console.error("Get master profile error:", error);
    return errorResponse(res, "Failed to fetch profile", 500);
  }
};

/**
 * Update Master Profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const master = await Master.findByPk(req.master.id);

    if (!master) {
      return errorResponse(res, "Master not found", 404);
    }

    // Update fields
    if (name) master.name = name;
    if (email) master.email = email;

    await master.save();

    return successResponse(res, "Profile updated successfully", {
      id: master.id,
      name: master.name,
      email: master.email,
    });
  } catch (error) {
    console.error("Update master profile error:", error);
    return errorResponse(res, "Failed to update profile", 500);
  }
};

/**
 * Change Password
 */
export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    const master = await Master.findByPk(req.master.id);

    if (!master) {
      return errorResponse(res, "Master not found", 404);
    }

    // Verify current password
    const isPasswordValid = await comparePassword(current_password, master.password);

    if (!isPasswordValid) {
      return errorResponse(res, "Current password is incorrect", 401);
    }

    // Hash new password
    const hashedPassword = await hashPassword(new_password);

    // Update password
    master.password = hashedPassword;
    await master.save();

    return successResponse(res, "Password changed successfully");
  } catch (error) {
    console.error("Change password error:", error);
    return errorResponse(res, "Failed to change password", 500);
  }
};
```

---

### **controllers/master/subscription.controller.js**

```javascript
import Subscription from "../../models/master/Subscription.js";
import { successResponse, errorResponse, paginatedResponse } from "../../utils/response.util.js";
import { Op } from "sequelize";

/**
 * Get all subscriptions
 */
export const getAllSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, is_active } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Search filter
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Active filter
    if (is_active !== undefined) {
      where.is_active = is_active === "true";
    }

    const { count, rows: subscriptions } = await Subscription.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["id", "ASC"]],
    });

    return paginatedResponse(
      res,
      "Subscriptions fetched successfully",
      subscriptions,
      {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
      }
    );
  } catch (error) {
    console.error("Get all subscriptions error:", error);
    return errorResponse(res, "Failed to fetch subscriptions", 500);
  }
};

/**
 * Get subscription by ID
 */
export const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      return errorResponse(res, "Subscription not found", 404);
    }

    return successResponse(res, "Subscription fetched successfully", subscription);
  } catch (error) {
    console.error("Get subscription by ID error:", error);
    return errorResponse(res, "Failed to fetch subscription", 500);
  }
};

/**
 * Create subscription
 */
export const createSubscription = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      max_users,
      max_orders_per_month,
      duration_days,
      features,
    } = req.body;

    // Check if plan with same name exists
    const existingPlan = await Subscription.findOne({
      where: { name },
    });

    if (existingPlan) {
      return errorResponse(res, `${name} plan already exists`, 409);
    }

    const subscription = await Subscription.create({
      name,
      price,
      description,
      max_users,
      max_orders_per_month,
      duration_days: duration_days || 30,
      features,
    });

    return successResponse(
      res,
      "Subscription created successfully",
      subscription,
      201
    );
  } catch (error) {
    console.error("Create subscription error:", error);
    return errorResponse(res, "Failed to create subscription", 500);
  }
};

/**
 * Update subscription
 */
export const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      description,
      max_users,
      max_orders_per_month,
      duration_days,
      features,
      is_active,
    } = req.body;

    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      return errorResponse(res, "Subscription not found", 404);
    }

    // Check if name is being changed and already exists
    if (name && name !== subscription.name) {
      const existingPlan = await Subscription.findOne({
        where: {
          name,
          id: { [Op.ne]: id },
        },
      });

      if (existingPlan) {
        return errorResponse(res, `${name} plan already exists`, 409);
      }
    }

    // Update fields
    if (name) subscription.name = name;
    if (price !== undefined) subscription.price = price;
    if (description !== undefined) subscription.description = description;
    if (max_users !== undefined) subscription.max_users = max_users;
    if (max_orders_per_month !== undefined) subscription.max_orders_per_month = max_orders_per_month;
    if (duration_days !== undefined) subscription.duration_days = duration_days;
    if (features !== undefined) subscription.features = features;
    if (is_active !== undefined) subscription.is_active = is_active;

    await subscription.save();

    return successResponse(res, "Subscription updated successfully", subscription);
  } catch (error) {
    console.error("Update subscription error:", error);
    return errorResponse(res, "Failed to update subscription", 500);
  }
};

/**
 * Delete subscription (soft delete)
 */
export const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await Subscription.findByPk(id);

    if (!subscription) {
      return errorResponse(res, "Subscription not found", 404);
    }

    // Check if any tenants are using this subscription
    const Tenant = (await import("../../models/master/Tenant.js")).default;
    const tenantsCount = await Tenant.count({
      where: { subscription_id: id },
    });

    if (tenantsCount > 0) {
      return errorResponse(
        res,
        `Cannot delete subscription. ${tenantsCount} tenant(s) are using this plan.`,
        400
      );
    }

    // Instead of hard delete, deactivate
    subscription.is_active = false;
    await subscription.save();

    return successResponse(res, "Subscription deactivated successfully");
  } catch (error) {
    console.error("Delete subscription error:", error);
    return errorResponse(res, "Failed to delete subscription", 500);
  }
};

/**
 * Get active subscriptions (for tenant registration)
 */
export const getActiveSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.findAll({
      where: { is_active: true },
      order: [["price", "ASC"]],
    });

    return successResponse(res, "Active subscriptions fetched successfully", subscriptions);
  } catch (error) {
    console.error("Get active subscriptions error:", error);
    return errorResponse(res, "Failed to fetch subscriptions", 500);
  }
};
```

---

### **controllers/master/tenant.controller.js**

```javascript
import Tenant from "../../models/master/Tenant.js";
import TenantUser from "../../models/master/TenantUser.js";
import Subscription from "../../models/master/Subscription.js";
import GlobalSetting from "../../models/master/GlobalSetting.js";
import { hashPassword } from "../../utils/password.util.js";
import { successResponse, errorResponse, paginatedResponse } from "../../utils/response.util.js";
import {
  createTenantDatabase,
  initializeTenantDatabase,
  dropTenantDatabase,
} from "../../utils/tenantDBSetup.util.js";
import { Op } from "sequelize";
import nodemailer from "nodemailer";

/**
 * Register new tenant (Restaurant signup)
 */
export const registerTenant = async (req, res) => {
  try {
    const {
      restaurant_name,
      subdomain,
      owner_name,
      owner_email,
      owner_phone,
      password,
      subscription_id,
      address,
      timezone,
    } = req.body;

    // Check if subdomain already exists
    const existingTenant = await Tenant.findOne({
      where: { subdomain },
    });

    if (existingTenant) {
      return errorResponse(res, "Subdomain already taken", 409);
    }

    // Check if email already exists
    const existingUser = await TenantUser.findOne({
      where: { email: owner_email },
    });

    if (existingUser) {
      return errorResponse(res, "Email already registered", 409);
    }

    // Verify subscription exists
    const subscription = await Subscription.findByPk(subscription_id);

    if (!subscription || !subscription.is_active) {
      return errorResponse(res, "Invalid subscription plan", 400);
    }

    // Generate database name
    const db_name = `tenant_${subdomain}`;

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create tenant database
    await createTenantDatabase(db_name);

    // Create tenant record
    const tenant = await Tenant.create({
      restaurant_name,
      subdomain,
      db_name,
      owner_name,
      owner_email,
      owner_phone,
      subscription_id,
      address,
      timezone: timezone || "UTC",
      status: "trial",
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
    });

    // Create tenant user in master DB
    const tenantUser = await TenantUser.create({
      tenant_id: tenant.id,
      email: owner_email,
      password: hashedPassword,
      is_active: true,
    });

    // Initialize tenant database with tables and default data
    await initializeTenantDatabase(db_name, {
      master_user_id: tenantUser.id,
      name: owner_name,
      email: owner_email,
      phone: owner_phone,
    });

    // Create global settings for tenant
    await GlobalSetting.create({
      tenant_id: tenant.id,
      two_factor_enabled: false,
      notification_email: owner_email,
    });

    // TODO: Send welcome email
    // await sendWelcomeEmail(owner_email, owner_name, subdomain);

    return successResponse(
      res,
      "Restaurant registered successfully",
      {
        tenant: {
          id: tenant.id,
          restaurant_name: tenant.restaurant_name,
          subdomain: tenant.subdomain,
          status: tenant.status,
          trial_ends_at: tenant.trial_ends_at,
        },
        login_url: `https://${subdomain}.yoursaas.com`,
      },
      201
    );
  } catch (error) {
    console.error("Register tenant error:", error);
    return errorResponse(res, "Failed to register restaurant", 500);
  }
};

/**
 * Get all tenants
 */
export const getAllTenants = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, subscription_id } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Search filter
    if (search) {
      where[Op.or] = [
        { restaurant_name: { [Op.like]: `%${search}%` } },
        { subdomain: { [Op.like]: `%${search}%` } },
        { owner_email: { [Op.like]: `%${search}%` } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Subscription filter
    if (subscription_id) {
      where.subscription_id = subscription_id;
    }

    const { count, rows: tenants } = await Tenant.findAndCountAll({
      where,
      include: [
        {
          model: Subscription,
          as: "subscription",
          attributes: ["id", "name", "price"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    return paginatedResponse(
      res,
      "Tenants fetched successfully",
      tenants,
      {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
      }
    );
  } catch (error) {
    console.error("Get all tenants error:", error);
    return errorResponse(res, "Failed to fetch tenants", 500);
  }
};

/**
 * Get tenant by ID
 */
export const getTenantById = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await Tenant.findByPk(id, {
      include: [
        {
          model: Subscription,
          as: "subscription",
        },
      ],
    });

    if (!tenant) {
      return errorResponse(res, "Tenant not found", 404);
    }

    return successResponse(res, "Tenant fetched successfully", tenant);
  } catch (error) {
    console.error("Get tenant by ID error:", error);
    return errorResponse(res, "Failed to fetch tenant", 500);
  }
};

/**
 * Update tenant
 */
export const updateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      restaurant_name,
      owner_name,
      owner_email,
      owner_phone,
      subscription_id,
      status,
      address,
      timezone,
      logo_url,
    } = req.body;

    const tenant = await Tenant.findByPk(id);

    if (!tenant) {
      return errorResponse(res, "Tenant not found", 404);
    }

    // If subscription is being changed, verify it exists
    if (subscription_id && subscription_id !== tenant.subscription_id) {
      const subscription = await Subscription.findByPk(subscription_id);
      if (!subscription || !subscription.is_active) {
        return errorResponse(res, "Invalid subscription plan", 400);
      }
    }

    // Update fields
    if (restaurant_name) tenant.restaurant_name = restaurant_name;
    if (owner_name) tenant.owner_name = owner_name;
    if (owner_email) tenant.owner_email = owner_email;
    if (owner_phone) tenant.owner_phone = owner_phone;
    if (subscription_id) tenant.subscription_id = subscription_id;
    if (status) tenant.status = status;
    if (address) tenant.address = address;
    if (timezone) tenant.timezone = timezone;
    if (logo_url) tenant.logo_url = logo_url;

    await tenant.save();

    return successResponse(res, "Tenant updated successfully", tenant);
  } catch (error) {
    console.error("Update tenant error:", error);
    return errorResponse(res, "Failed to update tenant", 500);
  }
};

/**
 * Suspend tenant
 */
export const suspendTenant = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await Tenant.findByPk(id);

    if (!tenant) {
      return errorResponse(res, "Tenant not found", 404);
    }

    tenant.status = "suspended";
    await tenant.save();

    // TODO: Send suspension email

    return successResponse(res, "Tenant suspended successfully", tenant);
  } catch (error) {
    console.error("Suspend tenant error:", error);
    return errorResponse(res, "Failed to suspend tenant", 500);
  }
};

/**
 * Activate tenant
 */
export const activateTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { duration_days } = req.body;

    const tenant = await Tenant.findByPk(id, {
      include: [{ model: Subscription, as: "subscription" }],
    });

    if (!tenant) {
      return errorResponse(res, "Tenant not found", 404);
    }

    const subscriptionDays = duration_days || tenant.subscription.duration_days;

    tenant.status = "active";
    tenant.subscription_starts_at = new Date();
    tenant.subscription_ends_at = new Date(
      Date.now() + subscriptionDays * 24 * 60 * 60 * 1000
    );
    await tenant.save();

    // TODO: Send activation email

    return successResponse(res, "Tenant activated successfully", tenant);
  } catch (error) {
    console.error("Activate tenant error:", error);
    return errorResponse(res, "Failed to activate tenant", 500);
  }
};

/**
 * Delete tenant (DANGEROUS - deletes database)
 */
export const deleteTenant = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirm } = req.body;

    if (confirm !== "DELETE") {
      return errorResponse(
        res,
        'Please confirm deletion by sending {"confirm": "DELETE"}',
        400
      );
    }

    const tenant = await Tenant.findByPk(id);

    if (!tenant) {
      return errorResponse(res, "Tenant not found", 404);
    }

    // Drop tenant database
    await dropTenantDatabase(tenant.db_name);

    // Delete tenant users
    await TenantUser.destroy({
      where: { tenant_id: id },
      force: true,
    });

    // Delete global settings
    await GlobalSetting.destroy({
      where: { tenant_id: id },
      force: true,
    });

    // Delete tenant record
    await tenant.destroy({ force: true });

    return successResponse(res, "Tenant deleted successfully");
  } catch (error) {
    console.error("Delete tenant error:", error);
    return errorResponse(res, "Failed to delete tenant", 500);
  }
};

/**
 * Get tenant statistics
 */
export const getTenantStats = async (req, res) => {
  try {
    const { id } = req.params;

    const tenant = await Tenant.findByPk(id);

    if (!tenant) {
      return errorResponse(res, "Tenant not found", 404);
    }

    // Get tenant database connection
    const { getTenantConnection, getTenantModels } = await import("../../utils/tenantDB.util.js");
    const tenantConnection = await getTenantConnection(tenant.db_name);
    const models = getTenantModels(tenantConnection);

    // Get statistics
    const stats = {
      total_users: await models.User.count(),
      active_users: await models.User.count({ where: { is_active: true } }),
      total_menu_items: await models.Menu.count(),
      available_menu_items: await models.Menu.count({ where: { is_available: true } }),
      total_categories: await models.Category.count(),
      total_orders: await models.Order.count(),
      pending_orders: await models.Order.count({ where: { status: "pending" } }),
      completed_orders: await models.Order.count({ where: { status: "completed" } }),
      total_revenue: await models.Billing.sum("total_amount", {
        where: { payment_status: "paid" },
      }) || 0,
    };

    return successResponse(res, "Tenant statistics fetched successfully", stats);
  } catch (error) {
    console.error("Get tenant stats error:", error);
    return errorResponse(res, "Failed to fetch tenant statistics", 500);
  }
};
```

---

### **controllers/master/dashboard.controller.js**

```javascript
import Tenant from "../../models/master/Tenant.js";
import Subscription from "../../models/master/Subscription.js";
import TenantUser from "../../models/master/TenantUser.js";
import { successResponse, errorResponse } from "../../utils/response.util.js";
import { Op } from "sequelize";

/**
 * Get master dashboard statistics
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Total counts
    const totalTenants = await Tenant.count();
    const activeTenants = await Tenant.count({ where: { status: "active" } });
    const trialTenants = await Tenant.count({ where: { status: "trial" } });
    const suspendedTenants = await Tenant.count({ where: { status: "suspended" } });
    const totalSubscriptions = await Subscription.count({ where: { is_active: true } });
    const totalUsers = await TenantUser.count({ where: { is_active: true } });

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await Tenant.count({
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
    });

    // Expiring trials (next 7 days)
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const expiringTrials = await Tenant.count({
      where: {
        status: "trial",
        trial_ends_at: {
          [Op.between]: [new Date(), sevenDaysFromNow],
        },
      },
    });

    // Expiring subscriptions (next 7 days)
    const expiringSubscriptions = await Tenant.count({
      where: {
        status: "active",
        subscription_ends_at: {
          [Op.between]: [new Date(), sevenDaysFromNow],
        },
      },
    });

    // Subscription distribution
    const subscriptionDistribution = await Tenant.findAll({
      attributes: [
        "subscription_id",
        [Tenant.sequelize.fn("COUNT", Tenant.sequelize.col("id")), "count"],
      ],
      include: [
        {
          model: Subscription,
          as: "subscription",
          attributes: ["name"],
        },
      ],
      group: ["subscription_id"],
    });

    const stats = {
      overview: {
        total_tenants: totalTenants,
        active_tenants: activeTenants,
        trial_tenants: trialTenants,
        suspended_tenants: suspendedTenants,
        total_subscriptions: totalSubscriptions,
        total_users: totalUsers,
      },
      recent: {
        registrations_last_30_days: recentRegistrations,
        expiring_trials: expiringTrials,
        expiring_subscriptions: expiringSubscriptions,
      },
      subscription_distribution: subscriptionDistribution.map((item) => ({
        plan: item.subscription.name,
        count: parseInt(item.dataValues.count),
      })),
    };

    return successResponse(res, "Dashboard statistics fetched successfully", stats);
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return errorResponse(res, "Failed to fetch dashboard statistics", 500);
  }
};

/**
 * Get recent tenants
 */
export const getRecentTenants = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const tenants = await Tenant.findAll({
      include: [
        {
          model: Subscription,
          as: "subscription",
          attributes: ["name", "price"],
        },
      ],
      limit: parseInt(limit),
      order: [["createdAt", "DESC"]],
    });

    return successResponse(res, "Recent tenants fetched successfully", tenants);
  } catch (error) {
    console.error("Get recent tenants error:", error);
    return errorResponse(res, "Failed to fetch recent tenants", 500);
  }
};
```

---

## 🛣️ **Routes**

### **routes/master/auth.routes.js**

```javascript
import express from "express";
import { body } from "express-validator";
import { validate } from "../../middleware/validation.middleware.js";
import { authenticateMaster } from "../../middleware/master/masterAuth.middleware.js";
import * as authController from "../../controllers/master/auth.controller.js";

const router = express.Router();

// Public routes
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password").notEmpty().withMessage("Password is required"),
    validate,
  ],
  authController.login
);

router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
    validate,
  ],
  authController.createMaster
);

// Protected routes
router.get("/profile", authenticateMaster, authController.getProfile);

router.put(
  "/profile",
  authenticateMaster,
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("email").optional().isEmail().withMessage("Invalid email"),
    validate,
  ],
  authController.updateProfile
);

router.post(
  "/change-password",
  authenticateMaster,
  [
    body("current_password").notEmpty().withMessage("Current password is required"),
    body("new_password")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters"),
    validate,
  ],
  authController.changePassword
);

export default router;
```

---

### **routes/master/subscription.routes.js**

```javascript
import express from "express";
import { authenticateMaster } from "../../middleware/master/masterAuth.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import {
  createSubscriptionValidator,
  updateSubscriptionValidator,
} from "../../validators/master/subscription.validator.js";
import * as subscriptionController from "../../controllers/master/subscription.controller.js";

const router = express.Router();

// Get active subscriptions (public - for tenant registration)
router.get("/active", subscriptionController.getActiveSubscriptions);

// All other routes require master authentication
router.use(authenticateMaster);

router.get("/", subscriptionController.getAllSubscriptions);
router.get("/:id", subscriptionController.getSubscriptionById);
router.post(
  "/",
  createSubscriptionValidator,
  validate,
  subscriptionController.createSubscription
);
router.put(
  "/:id",
  updateSubscriptionValidator,
  validate,
  subscriptionController.updateSubscription
);
router.delete("/:id", subscriptionController.deleteSubscription);

export default router;
```

---

### **routes/master/tenant.routes.js**

```javascript
import express from "express";
import { body } from "express-validator";
import { authenticateMaster } from "../../middleware/master/masterAuth.middleware.js";
import { validate } from "../../middleware/validation.middleware.js";
import {
  createTenantValidator,
  updateTenantValidator,
} from "../../validators/master/tenant.validator.js";
import * as tenantController from "../../controllers/master/tenant.controller.js";

const router = express.Router();

// Public route - Restaurant registration
router.post(
  "/register",
  createTenantValidator,
  validate,
  tenantController.registerTenant
);

// All other routes require master authentication
router.use(authenticateMaster);

router.get("/", tenantController.getAllTenants);
router.get("/:id", tenantController.getTenantById);
router.get("/:id/stats", tenantController.getTenantStats);
router.put(
  "/:id",
  updateTenantValidator,
  validate,
  tenantController.updateTenant
);
router.post("/:id/suspend", tenantController.suspendTenant);
router.post(
  "/:id/activate",
  [
    body("duration_days")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Duration must be at least 1 day"),
    validate,
  ],
  tenantController.activateTenant
);
router.delete(
  "/:id",
  [
    body("confirm")
      .equals("DELETE")
      .withMessage('Please confirm deletion with "DELETE"'),
    validate,
  ],
  tenantController.deleteTenant
);

export default router;
```

---

### **routes/master/dashboard.routes.js**

```javascript
import express from "express";
import { authenticateMaster } from "../../middleware/master/masterAuth.middleware.js";
import * as dashboardController from "../../controllers/master/dashboard.controller.js";

const router = express.Router();

// All routes require master authentication
router.use(authenticateMaster);

router.get("/stats", dashboardController.getDashboardStats);
router.get("/recent-tenants", dashboardController.getRecentTenants);

export default router;
```

---

## 🚀 **Main Routes Index**

### **routes/master/index.js**

```javascript
import express from "express";
import authRoutes from "./auth.routes.js";
import subscriptionRoutes from "./subscription.routes.js";
import tenantRoutes from "./tenant.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/subscriptions", subscriptionRoutes);
router.use("/tenants", tenantRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
```

---

## 📝 **Summary**

### **Master API Endpoints:**

```
POST   /api/master/auth/register          - Create master account
POST   /api/master/auth/login             - Master login
GET    /api/master/auth/profile           - Get master profile
PUT    /api/master/auth/profile           - Update master profile
POST   /api/master/auth/change-password   - Change password

GET    /api/master/subscriptions          - Get all subscriptions
GET    /api/master/subscriptions/active   - Get active subscriptions (public)
GET    /api/master/subscriptions/:id      - Get subscription by ID
POST   /api/master/subscriptions          - Create subscription
PUT    /api/master/subscriptions/:id      - Update subscription
DELETE /api/master/subscriptions/:id      - Delete subscription

POST   /api/master/tenants/register       - Register new tenant (public)
GET    /api/master/tenants                - Get all tenants
GET    /api/master/tenants/:id            - Get tenant by ID
GET    /api/master/tenants/:id/stats      - Get tenant statistics
PUT    /api/master/tenants/:id            - Update tenant
POST   /api/master/tenants/:id/suspend    - Suspend tenant
POST   /api/master/tenants/:id/activate   - Activate tenant
DELETE /api/master/tenants/:id            - Delete tenant

GET    /api/master/dashboard/stats        - Get dashboard statistics
GET    /api/master/dashboard/recent-tenants - Get recent tenants
```

Would you like me to provide:
1. **Server.js setup** with all routes integrated?
2. **.env example** file?
3. **Tenant controllers** (menu, orders, users, etc.)?
4. **Database sync script**?

Let me know what you need next! 🚀
@------------------------------------------------------------
# Database Sync Controllers & Scripts

## 📁 Project Structure

```
backend/
├── database/
│   ├── sync/
│   │   ├── masterSync.js
│   │   ├── tenantSync.js
│   │   └── index.js
│   ├── seeders/
│   │   ├── masterSeeder.js
│   │   └── tenantSeeder.js
│   ├── migrations/
│   │   └── createInitialSetup.js
│   └── healthCheck.js
├── scripts/
│   ├── setup.js
│   ├── resetDatabase.js
│   └── createTenant.js
└── config/
    └── database.js
```

---

## 🗄️ **Database Configuration**

### **config/database.js**

```javascript
import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

/**
 * Master Database Configuration
 */
export const masterDBConfig = {
  database: process.env.MASTER_DB_NAME || "saas_master",
  username: process.env.MASTER_DB_USER || "root",
  password: process.env.MASTER_DB_PASSWORD || "",
  host: process.env.MASTER_DB_HOST || "localhost",
  port: process.env.MASTER_DB_PORT || 3306,
  dialect: "mysql",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  timezone: "+00:00",
};

/**
 * Tenant Database Configuration Template
 */
export const tenantDBConfig = (dbName) => ({
  database: dbName,
  username: process.env.MASTER_DB_USER || "root",
  password: process.env.MASTER_DB_PASSWORD || "",
  host: process.env.MASTER_DB_HOST || "localhost",
  port: process.env.MASTER_DB_PORT || 3306,
  dialect: "mysql",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  timezone: "+00:00",
});

/**
 * Root connection (for creating databases)
 */
export const rootConnection = () => {
  return new Sequelize({
    username: process.env.MASTER_DB_USER || "root",
    password: process.env.MASTER_DB_PASSWORD || "",
    host: process.env.MASTER_DB_HOST || "localhost",
    port: process.env.MASTER_DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
  });
};
```

---

## 🔄 **Database Sync Scripts**

### **database/sync/masterSync.js**

```javascript
import { Sequelize } from "sequelize";
import { masterDBConfig, rootConnection } from "../../config/database.js";

// Import Master Models
import Master from "../../models/master/Master.js";
import Subscription from "../../models/master/Subscription.js";
import Tenant from "../../models/master/Tenant.js";
import TenantUser from "../../models/master/TenantUser.js";
import GlobalSetting from "../../models/master/GlobalSetting.js";

/**
 * Create Master Database if not exists
 */
export const createMasterDatabase = async () => {
  const connection = rootConnection();

  try {
    console.log("🔍 Checking if master database exists...");

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${masterDBConfig.database}\` 
       CHARACTER SET utf8mb4 
       COLLATE utf8mb4_unicode_ci;`
    );

    console.log(`✅ Master database '${masterDBConfig.database}' is ready`);
    await connection.close();
    return true;
  } catch (error) {
    console.error("❌ Error creating master database:", error.message);
    await connection.close();
    throw error;
  }
};

/**
 * Sync Master Database Tables
 */
export const syncMasterDatabase = async (options = {}) => {
  const { force = false, alter = false } = options;

  try {
    console.log("🔄 Syncing master database tables...");

    // Get sequelize instance from any model
    const sequelize = Master.sequelize;

    // Test connection
    await sequelize.authenticate();
    console.log("✅ Master database connection established");

    // Sync all models
    await sequelize.sync({ force, alter });

    if (force) {
      console.log("⚠️  All master tables dropped and recreated");
    } else if (alter) {
      console.log("✅ Master tables altered to match models");
    } else {
      console.log("✅ Master tables synced successfully");
    }

    // List all tables
    const tables = await sequelize.query(
      `SHOW TABLES FROM \`${masterDBConfig.database}\``,
      { type: Sequelize.QueryTypes.SHOWTABLES }
    );

    console.log(`📊 Total tables created: ${tables.length}`);
    console.log("📋 Tables:", tables);

    return {
      success: true,
      tables: tables,
      message: "Master database synced successfully",
    };
  } catch (error) {
    console.error("❌ Error syncing master database:", error.message);
    throw error;
  }
};

/**
 * Drop Master Database (DANGEROUS!)
 */
export const dropMasterDatabase = async () => {
  const connection = rootConnection();

  try {
    console.log("⚠️  WARNING: Dropping master database...");

    await connection.query(`DROP DATABASE IF EXISTS \`${masterDBConfig.database}\`;`);

    console.log(`✅ Master database '${masterDBConfig.database}' dropped`);
    await connection.close();
    return true;
  } catch (error) {
    console.error("❌ Error dropping master database:", error.message);
    await connection.close();
    throw error;
  }
};

/**
 * Verify Master Database Structure
 */
export const verifyMasterDatabase = async () => {
  try {
    console.log("🔍 Verifying master database structure...");

    const sequelize = Master.sequelize;

    const requiredTables = [
      "masters",
      "subscriptions",
      "tenants",
      "tenant_users",
      "global_settings",
    ];

    const existingTables = await sequelize.query(
      `SHOW TABLES FROM \`${masterDBConfig.database}\``,
      { type: Sequelize.QueryTypes.SHOWTABLES }
    );

    const missingTables = requiredTables.filter(
      (table) => !existingTables.includes(table)
    );

    if (missingTables.length > 0) {
      console.log("❌ Missing tables:", missingTables);
      return {
        success: false,
        missingTables,
        message: "Some required tables are missing",
      };
    }

    console.log("✅ All required tables exist");

    return {
      success: true,
      tables: existingTables,
      message: "Master database structure is valid",
    };
  } catch (error) {
    console.error("❌ Error verifying master database:", error.message);
    throw error;
  }
};

/**
 * Get Master Database Info
 */
export const getMasterDatabaseInfo = async () => {
  try {
    const sequelize = Master.sequelize;

    // Get table counts
    const masterCount = await Master.count();
    const subscriptionCount = await Subscription.count();
    const tenantCount = await Tenant.count();
    const tenantUserCount = await TenantUser.count();
    const globalSettingCount = await GlobalSetting.count();

    // Get database size
    const [sizeResult] = await sequelize.query(
      `SELECT 
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
      FROM information_schema.TABLES 
      WHERE table_schema = '${masterDBConfig.database}'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    return {
      database: masterDBConfig.database,
      size_mb: sizeResult.size_mb || 0,
      counts: {
        masters: masterCount,
        subscriptions: subscriptionCount,
        tenants: tenantCount,
        tenant_users: tenantUserCount,
        global_settings: globalSettingCount,
      },
      connection: {
        host: masterDBConfig.host,
        port: masterDBConfig.port,
        dialect: masterDBConfig.dialect,
      },
    };
  } catch (error) {
    console.error("❌ Error getting master database info:", error.message);
    throw error;
  }
};
```

---

### **database/sync/tenantSync.js**

```javascript
import { Sequelize } from "sequelize";
import { tenantDBConfig, rootConnection } from "../../config/database.js";

// Import Tenant Models
import Role from "../../models/tenant/Role.js";
import Permission from "../../models/tenant/Permission.js";
import User from "../../models/tenant/User.js";
import Category from "../../models/tenant/Category.js";
import Menu from "../../models/tenant/Menu.js";
import Order from "../../models/tenant/Order.js";
import OrderItem from "../../models/tenant/OrderItem.js";
import Billing from "../../models/tenant/Billing.js";
import Feedback from "../../models/tenant/Feedback.js";
import { setupAssociations } from "../../models/tenant/associations.js";

/**
 * Create Tenant Database
 */
export const createTenantDatabase = async (dbName) => {
  const connection = rootConnection();

  try {
    console.log(`🔍 Creating tenant database: ${dbName}...`);

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` 
       CHARACTER SET utf8mb4 
       COLLATE utf8mb4_unicode_ci;`
    );

    console.log(`✅ Tenant database '${dbName}' created successfully`);
    await connection.close();
    return true;
  } catch (error) {
    console.error(`❌ Error creating tenant database '${dbName}':`, error.message);
    await connection.close();
    throw error;
  }
};

/**
 * Sync Tenant Database Tables
 */
export const syncTenantDatabase = async (dbName, options = {}) => {
  const { force = false, alter = false } = options;

  try {
    console.log(`🔄 Syncing tenant database: ${dbName}...`);

    // Create connection to tenant database
    const config = tenantDBConfig(dbName);
    const sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      config
    );

    // Test connection
    await sequelize.authenticate();
    console.log(`✅ Connected to tenant database: ${dbName}`);

    // Initialize models
    const models = {
      Role: Role(sequelize),
      Permission: Permission(sequelize),
      User: User(sequelize),
      Category: Category(sequelize),
      Menu: Menu(sequelize),
      Order: Order(sequelize),
      OrderItem: OrderItem(sequelize),
      Billing: Billing(sequelize),
      Feedback: Feedback(sequelize),
    };

    // Setup associations
    setupAssociations(models);

    // Sync all models
    await sequelize.sync({ force, alter });

    if (force) {
      console.log(`⚠️  All tables in '${dbName}' dropped and recreated`);
    } else if (alter) {
      console.log(`✅ Tables in '${dbName}' altered to match models`);
    } else {
      console.log(`✅ Tables in '${dbName}' synced successfully`);
    }

    // List all tables
    const tables = await sequelize.query(
      `SHOW TABLES FROM \`${dbName}\``,
      { type: Sequelize.QueryTypes.SHOWTABLES }
    );

    console.log(`📊 Total tables created in '${dbName}': ${tables.length}`);
    console.log("📋 Tables:", tables);

    await sequelize.close();

    return {
      success: true,
      database: dbName,
      tables: tables,
      message: "Tenant database synced successfully",
    };
  } catch (error) {
    console.error(`❌ Error syncing tenant database '${dbName}':`, error.message);
    throw error;
  }
};

/**
 * Drop Tenant Database (DANGEROUS!)
 */
export const dropTenantDatabase = async (dbName) => {
  const connection = rootConnection();

  try {
    console.log(`⚠️  WARNING: Dropping tenant database: ${dbName}...`);

    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\`;`);

    console.log(`✅ Tenant database '${dbName}' dropped`);
    await connection.close();
    return true;
  } catch (error) {
    console.error(`❌ Error dropping tenant database '${dbName}':`, error.message);
    await connection.close();
    throw error;
  }
};

/**
 * Verify Tenant Database Structure
 */
export const verifyTenantDatabase = async (dbName) => {
  try {
    console.log(`🔍 Verifying tenant database structure: ${dbName}...`);

    const config = tenantDBConfig(dbName);
    const sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      config
    );

    const requiredTables = [
      "roles",
      "permissions",
      "users",
      "categories",
      "menus",
      "orders",
      "order_items",
      "billings",
      "feedbacks",
    ];

    const existingTables = await sequelize.query(
      `SHOW TABLES FROM \`${dbName}\``,
      { type: Sequelize.QueryTypes.SHOWTABLES }
    );

    await sequelize.close();

    const missingTables = requiredTables.filter(
      (table) => !existingTables.includes(table)
    );

    if (missingTables.length > 0) {
      console.log(`❌ Missing tables in '${dbName}':`, missingTables);
      return {
        success: false,
        database: dbName,
        missingTables,
        message: "Some required tables are missing",
      };
    }

    console.log(`✅ All required tables exist in '${dbName}'`);

    return {
      success: true,
      database: dbName,
      tables: existingTables,
      message: "Tenant database structure is valid",
    };
  } catch (error) {
    console.error(`❌ Error verifying tenant database '${dbName}':`, error.message);
    throw error;
  }
};

/**
 * Get Tenant Database Info
 */
export const getTenantDatabaseInfo = async (dbName) => {
  try {
    const config = tenantDBConfig(dbName);
    const sequelize = new Sequelize(
      config.database,
      config.username,
      config.password,
      config
    );

    // Initialize models
    const models = {
      Role: Role(sequelize),
      Permission: Permission(sequelize),
      User: User(sequelize),
      Category: Category(sequelize),
      Menu: Menu(sequelize),
      Order: Order(sequelize),
      OrderItem: OrderItem(sequelize),
      Billing: Billing(sequelize),
      Feedback: Feedback(sequelize),
    };

    // Setup associations
    setupAssociations(models);

    // Get counts
    const roleCount = await models.Role.count();
    const permissionCount = await models.Permission.count();
    const userCount = await models.User.count();
    const categoryCount = await models.Category.count();
    const menuCount = await models.Menu.count();
    const orderCount = await models.Order.count();
    const orderItemCount = await models.OrderItem.count();
    const billingCount = await models.Billing.count();
    const feedbackCount = await models.Feedback.count();

    // Get database size
    const [sizeResult] = await sequelize.query(
      `SELECT 
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
      FROM information_schema.TABLES 
      WHERE table_schema = '${dbName}'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    await sequelize.close();

    return {
      database: dbName,
      size_mb: sizeResult.size_mb || 0,
      counts: {
        roles: roleCount,
        permissions: permissionCount,
        users: userCount,
        categories: categoryCount,
        menus: menuCount,
        orders: orderCount,
        order_items: orderItemCount,
        billings: billingCount,
        feedbacks: feedbackCount,
      },
    };
  } catch (error) {
    console.error(`❌ Error getting tenant database info '${dbName}':`, error.message);
    throw error;
  }
};

/**
 * List All Tenant Databases
 */
export const listAllTenantDatabases = async () => {
  const connection = rootConnection();

  try {
    console.log("🔍 Listing all tenant databases...");

    const databases = await connection.query(
      `SHOW DATABASES LIKE 'tenant_%'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const tenantDatabases = databases.map((db) => Object.values(db)[0]);

    console.log(`📊 Found ${tenantDatabases.length} tenant databases`);

    await connection.close();

    return tenantDatabases;
  } catch (error) {
    console.error("❌ Error listing tenant databases:", error.message);
    await connection.close();
    throw error;
  }
};
```

---

### **database/sync/index.js**

```javascript
import {
  createMasterDatabase,
  syncMasterDatabase,
  dropMasterDatabase,
  verifyMasterDatabase,
  getMasterDatabaseInfo,
} from "./masterSync.js";

import {
  createTenantDatabase,
  syncTenantDatabase,
  dropTenantDatabase,
  verifyTenantDatabase,
  getTenantDatabaseInfo,
  listAllTenantDatabases,
} from "./tenantSync.js";

/**
 * Initialize entire system (Master + Sample Tenant)
 */
export const initializeSystem = async (options = {}) => {
  const { force = false, createSampleTenant = false } = options;

  try {
    console.log("\n🚀 ========== SYSTEM INITIALIZATION ==========\n");

    // Step 1: Create Master Database
    console.log("📍 Step 1: Master Database Creation");
    await createMasterDatabase();

    // Step 2: Sync Master Database
    console.log("\n📍 Step 2: Master Database Sync");
    await syncMasterDatabase({ force });

    // Step 3: Verify Master Database
    console.log("\n📍 Step 3: Master Database Verification");
    const masterVerification = await verifyMasterDatabase();

    if (!masterVerification.success) {
      throw new Error("Master database verification failed");
    }

    // Step 4: Create sample tenant (optional)
    if (createSampleTenant) {
      console.log("\n📍 Step 4: Sample Tenant Creation");
      const sampleTenantDB = "tenant_sample_restaurant";

      await createTenantDatabase(sampleTenantDB);
      await syncTenantDatabase(sampleTenantDB, { force });

      const tenantVerification = await verifyTenantDatabase(sampleTenantDB);

      if (!tenantVerification.success) {
        throw new Error("Sample tenant database verification failed");
      }
    }

    console.log("\n✅ ========== SYSTEM INITIALIZED SUCCESSFULLY ==========\n");

    return {
      success: true,
      message: "System initialized successfully",
    };
  } catch (error) {
    console.error("\n❌ ========== SYSTEM INITIALIZATION FAILED ==========");
    console.error("Error:", error.message);
    throw error;
  }
};

/**
 * Reset entire system (DANGEROUS!)
 */
export const resetSystem = async () => {
  try {
    console.log("\n⚠️  ========== SYSTEM RESET ==========\n");
    console.log("⚠️  WARNING: This will delete all data!\n");

    // Drop all tenant databases
    const tenantDatabases = await listAllTenantDatabases();

    console.log(`📊 Found ${tenantDatabases.length} tenant databases to drop`);

    for (const dbName of tenantDatabases) {
      await dropTenantDatabase(dbName);
    }

    // Drop master database
    await dropMasterDatabase();

    console.log("\n✅ ========== SYSTEM RESET COMPLETE ==========\n");

    return {
      success: true,
      message: "System reset successfully",
      dropped: {
        master: true,
        tenants: tenantDatabases.length,
      },
    };
  } catch (error) {
    console.error("\n❌ ========== SYSTEM RESET FAILED ==========");
    console.error("Error:", error.message);
    throw error;
  }
};

/**
 * Get system-wide information
 */
export const getSystemInfo = async () => {
  try {
    console.log("\n📊 ========== SYSTEM INFORMATION ==========\n");

    // Master database info
    const masterInfo = await getMasterDatabaseInfo();
    console.log("Master Database:", masterInfo);

    // Tenant databases info
    const tenantDatabases = await listAllTenantDatabases();
    console.log(`\nTotal Tenant Databases: ${tenantDatabases.length}`);

    const tenantInfos = [];
    for (const dbName of tenantDatabases) {
      const info = await getTenantDatabaseInfo(dbName);
      tenantInfos.push(info);
    }

    console.log("\n✅ ========== SYSTEM INFO RETRIEVED ==========\n");

    return {
      master: masterInfo,
      tenants: tenantInfos,
      summary: {
        total_tenants: tenantDatabases.length,
        total_size_mb:
          masterInfo.size_mb +
          tenantInfos.reduce((sum, t) => sum + t.size_mb, 0),
      },
    };
  } catch (error) {
    console.error("\n❌ Error getting system info:", error.message);
    throw error;
  }
};

export {
  // Master operations
  createMasterDatabase,
  syncMasterDatabase,
  dropMasterDatabase,
  verifyMasterDatabase,
  getMasterDatabaseInfo,

  // Tenant operations
  createTenantDatabase,
  syncTenantDatabase,
  dropTenantDatabase,
  verifyTenantDatabase,
  getTenantDatabaseInfo,
  listAllTenantDatabases,
};
```

---

## 🌱 **Seeders**

### **database/seeders/masterSeeder.js**

```javascript
import Master from "../../models/master/Master.js";
import Subscription from "../../models/master/Subscription.js";
import { hashPassword } from "../../utils/password.util.js";

/**
 * Seed Master Admin
 */
export const seedMasterAdmin = async () => {
  try {
    console.log("🌱 Seeding master admin...");

    const existingMaster = await Master.findOne({
      where: { email: "admin@saas.com" },
    });

    if (existingMaster) {
      console.log("⚠️  Master admin already exists");
      return existingMaster;
    }

    const hashedPassword = await hashPassword("Admin@123");

    const master = await Master.create({
      name: "Master Admin",
      email: "admin@saas.com",
      password: hashedPassword,
      is_active: true,
    });

    console.log("✅ Master admin created");
    console.log("📧 Email: admin@saas.com");
    console.log("🔑 Password: Admin@123");

    return master;
  } catch (error) {
    console.error("❌ Error seeding master admin:", error.message);
    throw error;
  }
};

/**
 * Seed Subscription Plans
 */
export const seedSubscriptionPlans = async () => {
  try {
    console.log("🌱 Seeding subscription plans...");

    const plans = [
      {
        name: "Basic",
        price: 29.99,
        description: "Perfect for small restaurants",
        max_users: 5,
        max_orders_per_month: 500,
        duration_days: 30,
        features: {
          menu_management: true,
          order_management: true,
          basic_reports: true,
          email_support: true,
          advanced_analytics: false,
          priority_support: false,
        },
        is_active: true,
      },
      {
        name: "Standard",
        price: 59.99,
        description: "Great for growing restaurants",
        max_users: 15,
        max_orders_per_month: 2000,
        duration_days: 30,
        features: {
          menu_management: true,
          order_management: true,
          basic_reports: true,
          email_support: true,
          advanced_analytics: true,
          priority_support: true,
          multiple_locations: false,
        },
        is_active: true,
      },
      {
        name: "Premium",
        price: 99.99,
        description: "For large restaurants and chains",
        max_users: 50,
        max_orders_per_month: null, // Unlimited
        duration_days: 30,
        features: {
          menu_management: true,
          order_management: true,
          basic_reports: true,
          email_support: true,
          advanced_analytics: true,
          priority_support: true,
          multiple_locations: true,
          custom_branding: true,
          api_access: true,
        },
        is_active: true,
      },
    ];

    const createdPlans = [];

    for (const plan of plans) {
      const [subscription, created] = await Subscription.findOrCreate({
        where: { name: plan.name },
        defaults: plan,
      });

      if (created) {
        console.log(`✅ Created plan: ${plan.name}`);
      } else {
        console.log(`⚠️  Plan already exists: ${plan.name}`);
      }

      createdPlans.push(subscription);
    }

    return createdPlans;
  } catch (error) {
    console.error("❌ Error seeding subscription plans:", error.message);
    throw error;
  }
};

/**
 * Seed all master data
 */
export const seedMasterData = async () => {
  try {
    console.log("\n🌱 ========== SEEDING MASTER DATABASE ==========\n");

    const master = await seedMasterAdmin();
    const plans = await seedSubscriptionPlans();

    console.log("\n✅ ========== MASTER DATABASE SEEDED ==========\n");

    return {
      master,
      plans,
    };
  } catch (error) {
    console.error("\n❌ Error seeding master data:", error.message);
    throw error;
  }
};
```

---

### **database/seeders/tenantSeeder.js**

```javascript
import { Sequelize } from "sequelize";
import { tenantDBConfig } from "../../config/database.js";

import Role from "../../models/tenant/Role.js";
import Permission from "../../models/tenant/Permission.js";
import User from "../../models/tenant/User.js";
import Category from "../../models/tenant/Category.js";
import Menu from "../../models/tenant/Menu.js";
import { setupAssociations } from "../../models/tenant/associations.js";

/**
 * Get tenant connection
 */
const getTenantConnection = (dbName) => {
  const config = tenantDBConfig(dbName);
  return new Sequelize(config.database, config.username, config.password, config);
};

/**
 * Seed Roles
 */
export const seedRoles = async (sequelize) => {
  try {
    console.log("🌱 Seeding roles...");

    const RoleModel = Role(sequelize);

    const roles = [
      { name: "Admin", description: "Full system access", level: 4 },
      { name: "Manager", description: "Management level access", level: 3 },
      { name: "Chef", description: "Kitchen and order management", level: 2 },
      { name: "Waiter", description: "Order taking and serving", level: 1 },
    ];

    const createdRoles = {};

    for (const role of roles) {
      const [createdRole, created] = await RoleModel.findOrCreate({
        where: { name: role.name },
        defaults: role,
      });

      createdRoles[role.name] = createdRole;

      if (created) {
        console.log(`✅ Created role: ${role.name}`);
      } else {
        console.log(`⚠️  Role already exists: ${role.name}`);
      }
    }

    return createdRoles;
  } catch (error) {
    console.error("❌ Error seeding roles:", error.message);
    throw error;
  }
};

/**
 * Seed Permissions
 */
export const seedPermissions = async (sequelize, roles) => {
  try {
    console.log("🌱 Seeding permissions...");

    const PermissionModel = Permission(sequelize);

    const resources = ["menu", "category", "orders", "billing", "feedback", "users", "settings"];

    const permissions = [
      // Admin - Full access
      ...resources.map((resource) => ({
        role_id: roles.Admin.role_id,
        resource,
        can_view: true,
        can_create: true,
        can_edit: true,
        can_delete: true,
      })),

      // Manager
      ...resources.map((resource) => ({
        role_id: roles.Manager.role_id,
        resource,
        can_view: true,
        can_create: resource !== "settings",
        can_edit: resource !== "settings",
        can_delete: ["menu", "category", "orders"].includes(resource),
      })),

      // Chef
      { role_id: roles.Chef.role_id, resource: "menu", can_view: true, can_create: false, can_edit: false, can_delete: false },
      { role_id: roles.Chef.role_id, resource: "category", can_view: true, can_create: false, can_edit: false, can_delete: false },
      { role_id: roles.Chef.role_id, resource: "orders", can_view: true, can_create: true, can_edit: true, can_delete: false },
      { role_id: roles.Chef.role_id, resource: "billing", can_view: false, can_create: false, can_edit: false, can_delete: false },
      { role_id: roles.Chef.role_id, resource: "feedback", can_view: true, can_create: false, can_edit: false, can_delete: false },
      { role_id: roles.Chef.role_id, resource: "users", can_view: false, can_create: false, can_edit: false, can_delete: false },
      { role_id: roles.Chef.role_id, resource: "settings", can_view: false, can_create: false, can_edit: false, can_delete: false },

      // Waiter
      { role_id: roles.Waiter.role_id, resource: "menu", can_view: true, can_create: false, can_edit: false, can_delete: false },
      { role_id: roles.Waiter.role_id, resource: "category", can_view: true, can_create: false, can_edit: false, can_delete: false },
      { role_id: roles.Waiter.role_id, resource: "orders", can_view: true, can_create: true, can_edit: false, can_delete: false },
      { role_id: roles.Waiter.role_id, resource: "billing", can_view: false, can_create: false, can_edit: false, can_delete: false },
      { role_id: roles.Waiter.role_id, resource: "feedback", can_view: false, can_create: false, can_edit: false, can_delete: false },
      { role_id: roles.Waiter.role_id, resource: "users", can_view: false, can_create: false, can_edit: false, can_delete: false },
      { role_id: roles.Waiter.role_id, resource: "settings", can_view: false, can_create: false, can_edit: false, can_delete: false },
    ];

    let count = 0;

    for (const perm of permissions) {
      const [, created] = await PermissionModel.findOrCreate({
        where: {
          role_id: perm.role_id,
          resource: perm.resource,
        },
        defaults: perm,
      });

      if (created) count++;
    }

    console.log(`✅ Created ${count} permissions`);

    return true;
  } catch (error) {
    console.error("❌ Error seeding permissions:", error.message);
    throw error;
  }
};

/**
 * Seed Categories
 */
export const seedCategories = async (sequelize) => {
  try {
    console.log("🌱 Seeding categories...");

    const CategoryModel = Category(sequelize);

    const categories = [
      {
        name: "Starters",
        description: "Appetizers and starters",
        display_order: 1,
        is_active: true,
      },
      {
        name: "Main Course",
        description: "Main dishes",
        display_order: 2,
        is_active: true,
      },
      {
        name: "Desserts",
        description: "Sweet dishes and desserts",
        display_order: 3,
        is_active: true,
      },
      {
        name: "Beverages",
        description: "Drinks and beverages",
        display_order: 4,
        is_active: true,
      },
      {
        name: "Salads",
        description: "Fresh salads",
        display_order: 5,
        is_active: true,
      },
    ];

    const createdCategories = [];

    for (const category of categories) {
      const [created, isNew] = await CategoryModel.findOrCreate({
        where: { name: category.name },
        defaults: category,
      });

      createdCategories.push(created);

      if (isNew) {
        console.log(`✅ Created category: ${category.name}`);
      } else {
        console.log(`⚠️  Category already exists: ${category.name}`);
      }
    }

    return createdCategories;
  } catch (error) {
    console.error("❌ Error seeding categories:", error.message);
    throw error;
  }
};

/**
 * Seed Sample Menu Items
 */
export const seedMenuItems = async (sequelize, categories) => {
  try {
    console.log("🌱 Seeding sample menu items...");

    const MenuModel = Menu(sequelize);

    const startersCategory = categories.find((c) => c.name === "Starters");
    const mainCourseCategory = categories.find((c) => c.name === "Main Course");
    const dessertsCategory = categories.find((c) => c.name === "Desserts");
    const beveragesCategory = categories.find((c) => c.name === "Beverages");

    const menuItems = [
      // Starters
      {
        category_id: startersCategory.category_id,
        name: "Garlic Bread",
        description: "Freshly baked bread with garlic butter",
        price: 4.99,
        preparation_time: 10,
        is_vegetarian: true,
        is_available: true,
      },
      {
        category_id: startersCategory.category_id,
        name: "Chicken Wings",
        description: "Spicy chicken wings with blue cheese dip",
        price: 8.99,
        preparation_time: 15,
        is_spicy: true,
        is_available: true,
      },

      // Main Course
      {
        category_id: mainCourseCategory.category_id,
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce, mozzarella, and basil",
        price: 12.99,
        preparation_time: 20,
        is_vegetarian: true,
        is_available: true,
      },
      {
        category_id: mainCourseCategory.category_id,
        name: "Grilled Chicken Steak",
        description: "Juicy grilled chicken with vegetables",
        price: 15.99,
        preparation_time: 25,
        is_available: true,
      },

      // Desserts
      {
        category_id: dessertsCategory.category_id,
        name: "Chocolate Brownie",
        description: "Warm chocolate brownie with vanilla ice cream",
        price: 6.99,
        preparation_time: 10,
        is_vegetarian: true,
        is_available: true,
      },

      // Beverages
      {
        category_id: beveragesCategory.category_id,
        name: "Fresh Orange Juice",
        description: "Freshly squeezed orange juice",
        price: 3.99,
        preparation_time: 5,
        is_vegetarian: true,
        is_available: true,
      },
      {
        category_id: beveragesCategory.category_id,
        name: "Cappuccino",
        description: "Italian style cappuccino",
        price: 4.49,
        preparation_time: 5,
        is_vegetarian: true,
        is_available: true,
      },
    ];

    let count = 0;

    for (const item of menuItems) {
      const [, created] = await MenuModel.findOrCreate({
        where: { name: item.name },
        defaults: item,
      });

      if (created) count++;
    }

    console.log(`✅ Created ${count} menu items`);

    return true;
  } catch (error) {
    console.error("❌ Error seeding menu items:", error.message);
    throw error;
  }
};

/**
 * Seed all tenant data
 */
export const seedTenantData = async (dbName, ownerData = null) => {
  try {
    console.log(`\n🌱 ========== SEEDING TENANT: ${dbName} ==========\n`);

    const sequelize = getTenantConnection(dbName);

    // Initialize models
    const models = {
      Role: Role(sequelize),
      Permission: Permission(sequelize),
      User: User(sequelize),
      Category: Category(sequelize),
      Menu: Menu(sequelize),
    };

    setupAssociations(models);

    // Seed data
    const roles = await seedRoles(sequelize);
    await seedPermissions(sequelize, roles);

    // Create admin user if owner data provided
    if (ownerData) {
      const [user, created] = await models.User.findOrCreate({
        where: { email: ownerData.email },
        defaults: {
          master_user_id: ownerData.master_user_id,
          name: ownerData.name,
          email: ownerData.email,
          phone: ownerData.phone || null,
          role_id: roles.Admin.role_id,
          is_active: true,
        },
      });

      if (created) {
        console.log(`✅ Created admin user: ${ownerData.email}`);
      }
    }

    const categories = await seedCategories(sequelize);
    await seedMenuItems(sequelize, categories);

    await sequelize.close();

    console.log(`\n✅ ========== TENANT SEEDED: ${dbName} ==========\n`);

    return true;
  } catch (error) {
    console.error(`\n❌ Error seeding tenant data for '${dbName}':`, error.message);
    throw error;
  }
};
```

---

## 🏥 **Health Check**

### **database/healthCheck.js**

```javascript
import { sequelize } from "../config/config.js";
import { rootConnection } from "../config/database.js";

/**
 * Check Master Database Connection
 */
export const checkMasterConnection = async () => {
  try {
    await sequelize.authenticate();
    return {
      status: "healthy",
      message: "Master database connection is healthy",
    };
  } catch (error) {
    return {
      status: "unhealthy",
      message: "Master database connection failed",
      error: error.message,
    };
  }
};

/**
 * Check MySQL Server Connection
 */
export const checkMySQLConnection = async () => {
  const connection = rootConnection();

  try {
    await connection.authenticate();
    await connection.close();

    return {
      status: "healthy",
      message: "MySQL server is reachable",
    };
  } catch (error) {
    return {
      status: "unhealthy",
      message: "MySQL server is unreachable",
      error: error.message,
    };
  }
};

/**
 * Full database health check
 */
export const performHealthCheck = async () => {
  console.log("\n🏥 ========== DATABASE HEALTH CHECK ==========\n");

  const mysqlCheck = await checkMySQLConnection();
  console.log("MySQL Server:", mysqlCheck.status);

  const masterCheck = await checkMasterConnection();
  console.log("Master Database:", masterCheck.status);

  const isHealthy = mysqlCheck.status === "healthy" && masterCheck.status === "healthy";

  console.log("\n" + (isHealthy ? "✅" : "❌"), "Overall Status:", isHealthy ? "HEALTHY" : "UNHEALTHY");
  console.log("\n===========================================\n");

  return {
    healthy: isHealthy,
    checks: {
      mysql: mysqlCheck,
      master: masterCheck,
    },
  };
};
```

---

## 🔨 **Setup Scripts**

### **scripts/setup.js**

```javascript
#!/usr/bin/env node

import dotenv from "dotenv";
import readline from "readline";
import { initializeSystem } from "../database/sync/index.js";
import { seedMasterData } from "../database/seeders/masterSeeder.js";
import { performHealthCheck } from "../database/healthCheck.js";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const setup = async () => {
  try {
    console.log("\n");
    console.log("╔════════════════════════════════════════════╗");
    console.log("║   Restaurant SaaS - Initial Setup         ║");
    console.log("╚════════════════════════════════════════════╝");
    console.log("\n");

    // Step 1: Health check
    console.log("Step 1: Performing health check...\n");
    const healthCheck = await performHealthCheck();

    if (!healthCheck.healthy) {
      console.log("❌ Database connection failed. Please check your configuration.");
      process.exit(1);
    }

    // Step 2: Confirm setup
    const confirm = await question("\n⚠️  This will create/reset the master database. Continue? (yes/no): ");

    if (confirm.toLowerCase() !== "yes") {
      console.log("\n❌ Setup cancelled.");
      rl.close();
      process.exit(0);
    }

    // Step 3: Ask about force reset
    const forceReset = await question("\n⚠️  Drop existing tables and recreate? (yes/no): ");
    const force = forceReset.toLowerCase() === "yes";

    // Step 4: Ask about sample tenant
    const createSample = await question("\nCreate sample tenant database? (yes/no): ");
    const createSampleTenant = createSample.toLowerCase() === "yes";

    // Step 5: Initialize system
    console.log("\n");
    await initializeSystem({ force, createSampleTenant });

    // Step 6: Seed master data
    console.log("\n");
    await seedMasterData();

    // Step 7: Success message
    console.log("\n");
    console.log("╔════════════════════════════════════════════╗");
    console.log("║   ✅ SETUP COMPLETED SUCCESSFULLY         ║");
    console.log("╚════════════════════════════════════════════╝");
    console.log("\n");
    console.log("📧 Master Admin Email: admin@saas.com");
    console.log("🔑 Master Admin Password: Admin@123");
    console.log("\n⚠️  Please change the default password after first login!");
    console.log("\n");

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Setup failed:", error.message);
    rl.close();
    process.exit(1);
  }
};

setup();
```

---

### **scripts/resetDatabase.js**

```javascript
#!/usr/bin/env node

import dotenv from "dotenv";
import readline from "readline";
import { resetSystem } from "../database/sync/index.js";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const reset = async () => {
  try {
    console.log("\n");
    console.log("╔════════════════════════════════════════════╗");
    console.log("║   ⚠️  DATABASE RESET UTILITY              ║");
    console.log("╚════════════════════════════════════════════╝");
    console.log("\n");

    console.log("⚠️  WARNING: This will delete:");
    console.log("   • Master database");
    console.log("   • All tenant databases");
    console.log("   • ALL DATA WILL BE LOST!");
    console.log("\n");

    const confirm1 = await question("Type 'DELETE ALL DATA' to confirm: ");

    if (confirm1 !== "DELETE ALL DATA") {
      console.log("\n❌ Reset cancelled.");
      rl.close();
      process.exit(0);
    }

    const confirm2 = await question("\nAre you absolutely sure? (yes/no): ");

    if (confirm2.toLowerCase() !== "yes") {
      console.log("\n❌ Reset cancelled.");
      rl.close();
      process.exit(0);
    }

    console.log("\n");
    await resetSystem();

    console.log("✅ Database reset completed.");
    console.log("💡 Run 'npm run setup' to reinitialize the system.\n");

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Reset failed:", error.message);
    rl.close();
    process.exit(1);
  }
};

reset();
```

---

### **scripts/createTenant.js**

```javascript
#!/usr/bin/env node

import dotenv from "dotenv";
import readline from "readline";
import { createTenantDatabase, syncTenantDatabase } from "../database/sync/index.js";
import { seedTenantData } from "../database/seeders/tenantSeeder.js";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createTenant = async () => {
  try {
    console.log("\n");
    console.log("╔════════════════════════════════════════════╗");
    console.log("║   Create Tenant Database                  ║");
    console.log("╚════════════════════════════════════════════╝");
    console.log("\n");

    const subdomain = await question("Enter subdomain (e.g., pizzahut): ");

    if (!subdomain || !/^[a-z0-9-]+$/.test(subdomain)) {
      console.log("\n❌ Invalid subdomain. Use only lowercase letters, numbers, and hyphens.");
      rl.close();
      process.exit(1);
    }

    const dbName = `tenant_${subdomain}`;

    console.log(`\nCreating tenant database: ${dbName}\n`);

    // Create database
    await createTenantDatabase(dbName);

    // Sync tables
    await syncTenantDatabase(dbName);

    // Seed data
    const seedData = await question("\nSeed with sample data? (yes/no): ");

    if (seedData.toLowerCase() === "yes") {
      await seedTenantData(dbName);
    }

    console.log("\n✅ Tenant database created successfully!");
    console.log(`Database: ${dbName}\n`);

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Failed to create tenant:", error.message);
    rl.close();
    process.exit(1);
  }
};

createTenant();
```

---

## 📦 **package.json Scripts**

Add these to your `package.json`:

```json
{
  "scripts": {
    "setup": "node scripts/setup.js",
    "reset-db": "node scripts/resetDatabase.js",
    "create-tenant": "node scripts/createTenant.js",
    "health-check": "node -e \"import('./database/healthCheck.js').then(m => m.performHealthCheck())\"",
    "dev": "nodemon server.js",
    "start": "node server.js"
  }
}
```

---

## 🚀 **Usage**

### **Initial Setup:**
```bash
npm run setup
```

### **Create New Tenant:**
```bash
npm run create-tenant
```

### **Reset Database (DANGEROUS!):**
```bash
npm run reset-db
```

### **Health Check:**
```bash
npm run health-check
```

---

## 📝 **.env Example**

```env
# Server
NODE_ENV=development
PORT=5000

# Master Database
MASTER_DB_HOST=localhost
MASTER_DB_PORT=3306
MASTER_DB_USER=root
MASTER_DB_PASSWORD=your_password
MASTER_DB_NAME=saas_master

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this
JWT_REFRESH_EXPIRE=7d

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

---

## ✅ **What's Next?**

Now you have complete database sync functionality! Would you like me to create:

1. **Tenant Controllers** (Menu, Order, User management)?
2. **Complete server.js** with all routes integrated?
3. **API documentation** (Postman collection)?
4. **Frontend integration guide**?

Let me know! 🚀
@--------------------------------------------------
# Tenant Controllers (Menu, Order, User Management)

## 📁 Project Structure

```
backend/
├── controllers/
│   └── tenant/
│       ├── auth.controller.js
│       ├── user.controller.js
│       ├── role.controller.js
│       ├── category.controller.js
│       ├── menu.controller.js
│       ├── order.controller.js
│       ├── billing.controller.js
│       ├── feedback.controller.js
│       ├── dashboard.controller.js
│       └── settings.controller.js
├── validators/
│   └── tenant/
│       ├── auth.validator.js
│       ├── user.validator.js
│       ├── category.validator.js
│       ├── menu.validator.js
│       ├── order.validator.js
│       └── billing.validator.js
├── routes/
│   └── tenant/
│       ├── auth.routes.js
│       ├── user.routes.js
│       ├── role.routes.js
│       ├── category.routes.js
│       ├── menu.routes.js
│       ├── order.routes.js
│       ├── billing.routes.js
│       ├── feedback.routes.js
│       ├── dashboard.routes.js
│       └── index.js
└── utils/
    ├── orderNumber.util.js
    └── invoiceNumber.util.js
```

---

## 🔧 **Utility Files**

### **utils/orderNumber.util.js**

```javascript
/**
 * Generate unique order number
 * Format: ORD-YYYYMMDD-XXXX
 */
export const generateOrderNumber = async (OrderModel) => {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");

  // Get today's order count
  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));

  const count = await OrderModel.count({
    where: {
      createdAt: {
        [OrderModel.sequelize.Sequelize.Op.between]: [todayStart, todayEnd],
      },
    },
  });

  const sequenceNumber = String(count + 1).padStart(4, "0");
  return `ORD-${dateStr}-${sequenceNumber}`;
};

/**
 * Generate invoice number
 * Format: INV-YYYYMMDD-XXXX
 */
export const generateInvoiceNumber = async (BillingModel) => {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");

  const todayStart = new Date(today.setHours(0, 0, 0, 0));
  const todayEnd = new Date(today.setHours(23, 59, 59, 999));

  const count = await BillingModel.count({
    where: {
      createdAt: {
        [BillingModel.sequelize.Sequelize.Op.between]: [todayStart, todayEnd],
      },
    },
  });

  const sequenceNumber = String(count + 1).padStart(4, "0");
  return `INV-${dateStr}-${sequenceNumber}`;
};
```

---

## 🎮 **Tenant Controllers**

### **controllers/tenant/auth.controller.js**

```javascript
import TenantUser from "../../models/master/TenantUser.js";
import { comparePassword } from "../../utils/password.util.js";
import { generateToken, generateRefreshToken } from "../../utils/jwt.util.js";
import { successResponse, errorResponse } from "../../utils/response.util.js";

/**
 * Tenant User Login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const subdomain = req.headers["x-tenant-subdomain"];

    if (!subdomain) {
      return errorResponse(res, "Subdomain is required", 400);
    }

    // Find tenant user in master DB
    const tenantUser = await TenantUser.findOne({
      where: { email },
      include: [
        {
          model: (await import("../../models/master/Tenant.js")).default,
          as: "tenant",
          where: { subdomain },
        },
      ],
    });

    if (!tenantUser) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    // Check if account is active
    if (!tenantUser.is_active) {
      return errorResponse(res, "Your account is inactive", 403);
    }

    // Check if account is locked
    if (tenantUser.locked_until && new Date(tenantUser.locked_until) > new Date()) {
      return errorResponse(
        res,
        `Account locked until ${tenantUser.locked_until}. Please try again later.`,
        403
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, tenantUser.password);

    if (!isPasswordValid) {
      // Increment failed login attempts
      tenantUser.failed_login_attempts += 1;

      // Lock account after 5 failed attempts
      if (tenantUser.failed_login_attempts >= 5) {
        tenantUser.locked_until = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await tenantUser.save();
        return errorResponse(
          res,
          "Account locked due to multiple failed login attempts. Try again in 30 minutes.",
          403
        );
      }

      await tenantUser.save();
      return errorResponse(res, "Invalid email or password", 401);
    }

    // Get user details from tenant DB
    const { User } = req.models;
    const user = await User.findOne({
      where: { master_user_id: tenantUser.id },
      include: [
        {
          model: req.models.Role,
          as: "role",
          attributes: ["role_id", "name", "level"],
        },
      ],
    });

    if (!user || !user.is_active) {
      return errorResponse(res, "User not found or inactive in tenant database", 403);
    }

    // Reset failed attempts and update last login
    tenantUser.failed_login_attempts = 0;
    tenantUser.locked_until = null;
    tenantUser.last_login = new Date();
    await tenantUser.save();

    // Generate tokens
    const tokenPayload = {
      master_user_id: tenantUser.id,
      tenant_id: tenantUser.tenant_id,
      user_id: user.user_id,
      role_id: user.role_id,
      email: user.email,
      type: "tenant",
    };

    const accessToken = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return successResponse(res, "Login successful", {
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.name,
        role_level: user.role.level,
      },
      tenant: {
        id: tenantUser.tenant.id,
        restaurant_name: tenantUser.tenant.restaurant_name,
        subdomain: tenantUser.tenant.subdomain,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Tenant login error:", error);
    return errorResponse(res, "Login failed", 500);
  }
};

/**
 * Get Current User Profile
 */
export const getProfile = async (req, res) => {
  try {
    const { User, Role } = req.models;

    const user = await User.findByPk(req.user.user_id, {
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["role_id", "name", "description", "level"],
        },
      ],
      attributes: { exclude: ["master_user_id"] },
    });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, "Profile fetched successfully", user);
  } catch (error) {
    console.error("Get profile error:", error);
    return errorResponse(res, "Failed to fetch profile", 500);
  }
};

/**
 * Update Current User Profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, date_of_birth, profile_image } = req.body;
    const { User } = req.models;

    const user = await User.findByPk(req.user.user_id);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (date_of_birth) user.date_of_birth = date_of_birth;
    if (profile_image) user.profile_image = profile_image;

    await user.save();

    return successResponse(res, "Profile updated successfully", user);
  } catch (error) {
    console.error("Update profile error:", error);
    return errorResponse(res, "Failed to update profile", 500);
  }
};

/**
 * Change Password
 */
export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    // Get tenant user from master DB
    const tenantUser = await TenantUser.findByPk(req.user.master_user_id);

    if (!tenantUser) {
      return errorResponse(res, "User not found", 404);
    }

    // Verify current password
    const isPasswordValid = await comparePassword(current_password, tenantUser.password);

    if (!isPasswordValid) {
      return errorResponse(res, "Current password is incorrect", 401);
    }

    // Hash and update new password
    const { hashPassword } = await import("../../utils/password.util.js");
    tenantUser.password = await hashPassword(new_password);
    await tenantUser.save();

    return successResponse(res, "Password changed successfully");
  } catch (error) {
    console.error("Change password error:", error);
    return errorResponse(res, "Failed to change password", 500);
  }
};

/**
 * Logout (Optional - for token blacklisting)
 */
export const logout = async (req, res) => {
  try {
    // TODO: Implement token blacklisting if needed
    return successResponse(res, "Logout successful");
  } catch (error) {
    console.error("Logout error:", error);
    return errorResponse(res, "Logout failed", 500);
  }
};
```

---

### **controllers/tenant/user.controller.js**

```javascript
import TenantUser from "../../models/master/TenantUser.js";
import { hashPassword } from "../../utils/password.util.js";
import { successResponse, errorResponse, paginatedResponse } from "../../utils/response.util.js";
import { Op } from "sequelize";

/**
 * Get all users (staff)
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role_id, is_active } = req.query;
    const { User, Role } = req.models;

    const offset = (page - 1) * limit;
    const where = {};

    // Search filter
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
      ];
    }

    // Role filter
    if (role_id) {
      where.role_id = role_id;
    }

    // Active status filter
    if (is_active !== undefined) {
      where.is_active = is_active === "true";
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["role_id", "name", "level"],
        },
      ],
      attributes: { exclude: ["master_user_id"] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    return paginatedResponse(res, "Users fetched successfully", users, {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return errorResponse(res, "Failed to fetch users", 500);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { User, Role } = req.models;

    const user = await User.findByPk(id, {
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["role_id", "name", "description", "level"],
        },
      ],
      attributes: { exclude: ["master_user_id"] },
    });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, "User fetched successfully", user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    return errorResponse(res, "Failed to fetch user", 500);
  }
};

/**
 * Create new user (staff)
 */
export const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role_id,
      date_of_birth,
      address,
      hire_date,
      salary,
    } = req.body;

    const { User } = req.models;

    // Check if email already exists in tenant
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return errorResponse(res, "Email already exists", 409);
    }

    // Check if email exists in master DB for this tenant
    const existingTenantUser = await TenantUser.findOne({
      where: {
        email,
        tenant_id: req.user.tenant_id,
      },
    });

    if (existingTenantUser) {
      return errorResponse(res, "Email already registered", 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user in master DB
    const tenantUser = await TenantUser.create({
      tenant_id: req.user.tenant_id,
      email,
      password: hashedPassword,
      is_active: true,
    });

    // Create user in tenant DB
    const user = await User.create({
      master_user_id: tenantUser.id,
      name,
      email,
      phone,
      role_id,
      date_of_birth,
      address,
      hire_date: hire_date || new Date(),
      salary,
      is_active: true,
    });

    // Fetch user with role
    const createdUser = await User.findByPk(user.user_id, {
      include: [
        {
          model: req.models.Role,
          as: "role",
          attributes: ["role_id", "name", "level"],
        },
      ],
      attributes: { exclude: ["master_user_id"] },
    });

    return successResponse(res, "User created successfully", createdUser, 201);
  } catch (error) {
    console.error("Create user error:", error);
    return errorResponse(res, "Failed to create user", 500);
  }
};

/**
 * Update user
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      role_id,
      date_of_birth,
      address,
      hire_date,
      salary,
      is_active,
      profile_image,
    } = req.body;

    const { User } = req.models;

    const user = await User.findByPk(id);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (role_id) user.role_id = role_id;
    if (date_of_birth) user.date_of_birth = date_of_birth;
    if (address) user.address = address;
    if (hire_date) user.hire_date = hire_date;
    if (salary !== undefined) user.salary = salary;
    if (is_active !== undefined) user.is_active = is_active;
    if (profile_image) user.profile_image = profile_image;

    await user.save();

    // Fetch updated user with role
    const updatedUser = await User.findByPk(id, {
      include: [
        {
          model: req.models.Role,
          as: "role",
          attributes: ["role_id", "name", "level"],
        },
      ],
      attributes: { exclude: ["master_user_id"] },
    });

    return successResponse(res, "User updated successfully", updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    return errorResponse(res, "Failed to update user", 500);
  }
};

/**
 * Delete user (soft delete)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { User } = req.models;

    const user = await User.findByPk(id);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Don't allow deleting yourself
    if (user.user_id === req.user.user_id) {
      return errorResponse(res, "You cannot delete your own account", 400);
    }

    // Soft delete
    await user.destroy();

    // Also deactivate in master DB
    const tenantUser = await TenantUser.findByPk(user.master_user_id);
    if (tenantUser) {
      tenantUser.is_active = false;
      await tenantUser.save();
    }

    return successResponse(res, "User deleted successfully");
  } catch (error) {
    console.error("Delete user error:", error);
    return errorResponse(res, "Failed to delete user", 500);
  }
};

/**
 * Activate/Deactivate user
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { User } = req.models;

    const user = await User.findByPk(id);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Toggle status
    user.is_active = !user.is_active;
    await user.save();

    // Update in master DB
    const tenantUser = await TenantUser.findByPk(user.master_user_id);
    if (tenantUser) {
      tenantUser.is_active = user.is_active;
      await tenantUser.save();
    }

    return successResponse(
      res,
      `User ${user.is_active ? "activated" : "deactivated"} successfully`,
      user
    );
  } catch (error) {
    console.error("Toggle user status error:", error);
    return errorResponse(res, "Failed to update user status", 500);
  }
};

/**
 * Reset user password (by admin)
 */
export const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;
    const { User } = req.models;

    const user = await User.findByPk(id);

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Hash new password
    const hashedPassword = await hashPassword(new_password);

    // Update password in master DB
    const tenantUser = await TenantUser.findByPk(user.master_user_id);
    if (!tenantUser) {
      return errorResponse(res, "User not found in master database", 404);
    }

    tenantUser.password = hashedPassword;
    tenantUser.failed_login_attempts = 0;
    tenantUser.locked_until = null;
    await tenantUser.save();

    return successResponse(res, "Password reset successfully");
  } catch (error) {
    console.error("Reset user password error:", error);
    return errorResponse(res, "Failed to reset password", 500);
  }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (req, res) => {
  try {
    const { role_name } = req.params;
    const { User, Role } = req.models;

    const users = await User.findAll({
      where: { is_active: true },
      include: [
        {
          model: Role,
          as: "role",
          where: { name: role_name },
          attributes: ["role_id", "name", "level"],
        },
      ],
      attributes: { exclude: ["master_user_id", "salary"] },
    });

    return successResponse(res, `${role_name}s fetched successfully`, users);
  } catch (error) {
    console.error("Get users by role error:", error);
    return errorResponse(res, "Failed to fetch users", 500);
  }
};
```

---

### **controllers/tenant/category.controller.js**

```javascript
import { successResponse, errorResponse, paginatedResponse } from "../../utils/response.util.js";
import { Op } from "sequelize";

/**
 * Get all categories
 */
export const getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, is_active } = req.query;
    const { Category } = req.models;

    const offset = (page - 1) * limit;
    const where = {};

    // Search filter
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Active filter
    if (is_active !== undefined) {
      where.is_active = is_active === "true";
    }

    const { count, rows: categories } = await Category.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["display_order", "ASC"]],
    });

    return paginatedResponse(res, "Categories fetched successfully", categories, {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
    });
  } catch (error) {
    console.error("Get all categories error:", error);
    return errorResponse(res, "Failed to fetch categories", 500);
  }
};

/**
 * Get active categories (for menu display)
 */
export const getActiveCategories = async (req, res) => {
  try {
    const { Category, Menu } = req.models;

    const categories = await Category.findAll({
      where: { is_active: true },
      include: [
        {
          model: Menu,
          as: "menus",
          where: { is_available: true },
          required: false,
          attributes: ["menu_id", "name", "price", "image_url"],
        },
      ],
      order: [
        ["display_order", "ASC"],
        [{ model: Menu, as: "menus" }, "name", "ASC"],
      ],
    });

    return successResponse(res, "Active categories fetched successfully", categories);
  } catch (error) {
    console.error("Get active categories error:", error);
    return errorResponse(res, "Failed to fetch categories", 500);
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { Category, Menu } = req.models;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Menu,
          as: "menus",
          attributes: ["menu_id", "name", "price", "is_available"],
        },
      ],
    });

    if (!category) {
      return errorResponse(res, "Category not found", 404);
    }

    return successResponse(res, "Category fetched successfully", category);
  } catch (error) {
    console.error("Get category by ID error:", error);
    return errorResponse(res, "Failed to fetch category", 500);
  }
};

/**
 * Create category
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description, image_url, display_order } = req.body;
    const { Category } = req.models;

    // Check if category name already exists
    const existingCategory = await Category.findOne({ where: { name } });

    if (existingCategory) {
      return errorResponse(res, "Category name already exists", 409);
    }

    const category = await Category.create({
      name,
      description,
      image_url,
      display_order: display_order || 0,
      is_active: true,
    });

    return successResponse(res, "Category created successfully", category, 201);
  } catch (error) {
    console.error("Create category error:", error);
    return errorResponse(res, "Failed to create category", 500);
  }
};

/**
 * Update category
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url, display_order, is_active } = req.body;
    const { Category } = req.models;

    const category = await Category.findByPk(id);

    if (!category) {
      return errorResponse(res, "Category not found", 404);
    }

    // Check if name is being changed and already exists
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        where: {
          name,
          category_id: { [Op.ne]: id },
        },
      });

      if (existingCategory) {
        return errorResponse(res, "Category name already exists", 409);
      }
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (image_url !== undefined) category.image_url = image_url;
    if (display_order !== undefined) category.display_order = display_order;
    if (is_active !== undefined) category.is_active = is_active;

    await category.save();

    return successResponse(res, "Category updated successfully", category);
  } catch (error) {
    console.error("Update category error:", error);
    return errorResponse(res, "Failed to update category", 500);
  }
};

/**
 * Delete category
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { Category, Menu } = req.models;

    const category = await Category.findByPk(id);

    if (!category) {
      return errorResponse(res, "Category not found", 404);
    }

    // Check if category has menu items
    const menuCount = await Menu.count({ where: { category_id: id } });

    if (menuCount > 0) {
      return errorResponse(
        res,
        `Cannot delete category. It has ${menuCount} menu item(s). Please reassign or delete them first.`,
        400
      );
    }

    await category.destroy();

    return successResponse(res, "Category deleted successfully");
  } catch (error) {
    console.error("Delete category error:", error);
    return errorResponse(res, "Failed to delete category", 500);
  }
};

/**
 * Reorder categories
 */
export const reorderCategories = async (req, res) => {
  try {
    const { categories } = req.body; // Array of { category_id, display_order }
    const { Category } = req.models;

    // Update display order for each category
    for (const item of categories) {
      await Category.update(
        { display_order: item.display_order },
        { where: { category_id: item.category_id } }
      );
    }

    return successResponse(res, "Categories reordered successfully");
  } catch (error) {
    console.error("Reorder categories error:", error);
    return errorResponse(res, "Failed to reorder categories", 500);
  }
};
```

---

### **controllers/tenant/menu.controller.js**

```javascript
import { successResponse, errorResponse, paginatedResponse } from "../../utils/response.util.js";
import { Op } from "sequelize";

/**
 * Get all menu items
 */
export const getAllMenus = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category_id,
      is_available,
      is_vegetarian,
      is_spicy,
      min_price,
      max_price,
    } = req.query;

    const { Menu, Category } = req.models;

    const offset = (page - 1) * limit;
    const where = {};

    // Search filter
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { ingredients: { [Op.like]: `%${search}%` } },
      ];
    }

    // Category filter
    if (category_id) {
      where.category_id = category_id;
    }

    // Availability filter
    if (is_available !== undefined) {
      where.is_available = is_available === "true";
    }

    // Vegetarian filter
    if (is_vegetarian !== undefined) {
      where.is_vegetarian = is_vegetarian === "true";
    }

    // Spicy filter
    if (is_spicy !== undefined) {
      where.is_spicy = is_spicy === "true";
    }

    // Price range filter
    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price[Op.gte] = parseFloat(min_price);
      if (max_price) where.price[Op.lte] = parseFloat(max_price);
    }

    const { count, rows: menus } = await Menu.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["category_id", "name"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["name", "ASC"]],
    });

    return paginatedResponse(res, "Menu items fetched successfully", menus, {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
    });
  } catch (error) {
    console.error("Get all menus error:", error);
    return errorResponse(res, "Failed to fetch menu items", 500);
  }
};

/**
 * Get menu by ID
 */
export const getMenuById = async (req, res) => {
  try {
    const { id } = req.params;
    const { Menu, Category } = req.models;

    const menu = await Menu.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["category_id", "name", "description"],
        },
      ],
    });

    if (!menu) {
      return errorResponse(res, "Menu item not found", 404);
    }

    return successResponse(res, "Menu item fetched successfully", menu);
  } catch (error) {
    console.error("Get menu by ID error:", error);
    return errorResponse(res, "Failed to fetch menu item", 500);
  }
};

/**
 * Create menu item
 */
export const createMenu = async (req, res) => {
  try {
    const {
      category_id,
      name,
      description,
      price,
      discount_price,
      image_url,
      preparation_time,
      calories,
      ingredients,
      is_vegetarian,
      is_spicy,
      is_featured,
    } = req.body;

    const { Menu, Category } = req.models;

    // Verify category exists
    const category = await Category.findByPk(category_id);

    if (!category) {
      return errorResponse(res, "Category not found", 404);
    }

    // Check if menu item name already exists
    const existingMenu = await Menu.findOne({
      where: { name, category_id },
    });

    if (existingMenu) {
      return errorResponse(res, "Menu item with this name already exists in this category", 409);
    }

    const menu = await Menu.create({
      category_id,
      name,
      description,
      price,
      discount_price,
      image_url,
      preparation_time,
      calories,
      ingredients,
      is_vegetarian: is_vegetarian || false,
      is_spicy: is_spicy || false,
      is_featured: is_featured || false,
      is_available: true,
    });

    // Fetch created menu with category
    const createdMenu = await Menu.findByPk(menu.menu_id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["category_id", "name"],
        },
      ],
    });

    return successResponse(res, "Menu item created successfully", createdMenu, 201);
  } catch (error) {
    console.error("Create menu error:", error);
    return errorResponse(res, "Failed to create menu item", 500);
  }
};

/**
 * Update menu item
 */
export const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      description,
      price,
      discount_price,
      image_url,
      preparation_time,
      calories,
      ingredients,
      is_vegetarian,
      is_spicy,
      is_available,
      is_featured,
    } = req.body;

    const { Menu, Category } = req.models;

    const menu = await Menu.findByPk(id);

    if (!menu) {
      return errorResponse(res, "Menu item not found", 404);
    }

    // Verify category if being changed
    if (category_id && category_id !== menu.category_id) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return errorResponse(res, "Category not found", 404);
      }
    }

    // Check if name is being changed and already exists
    if (name && name !== menu.name) {
      const existingMenu = await Menu.findOne({
        where: {
          name,
          category_id: category_id || menu.category_id,
          menu_id: { [Op.ne]: id },
        },
      });

      if (existingMenu) {
        return errorResponse(res, "Menu item with this name already exists in this category", 409);
      }
    }

    // Update fields
    if (category_id) menu.category_id = category_id;
    if (name) menu.name = name;
    if (description !== undefined) menu.description = description;
    if (price) menu.price = price;
    if (discount_price !== undefined) menu.discount_price = discount_price;
    if (image_url !== undefined) menu.image_url = image_url;
    if (preparation_time !== undefined) menu.preparation_time = preparation_time;
    if (calories !== undefined) menu.calories = calories;
    if (ingredients !== undefined) menu.ingredients = ingredients;
    if (is_vegetarian !== undefined) menu.is_vegetarian = is_vegetarian;
    if (is_spicy !== undefined) menu.is_spicy = is_spicy;
    if (is_available !== undefined) menu.is_available = is_available;
    if (is_featured !== undefined) menu.is_featured = is_featured;

    await menu.save();

    // Fetch updated menu with category
    const updatedMenu = await Menu.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["category_id", "name"],
        },
      ],
    });

    return successResponse(res, "Menu item updated successfully", updatedMenu);
  } catch (error) {
    console.error("Update menu error:", error);
    return errorResponse(res, "Failed to update menu item", 500);
  }
};

/**
 * Delete menu item
 */
export const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { Menu } = req.models;

    const menu = await Menu.findByPk(id);

    if (!menu) {
      return errorResponse(res, "Menu item not found", 404);
    }

    // Soft delete
    await menu.destroy();

    return successResponse(res, "Menu item deleted successfully");
  } catch (error) {
    console.error("Delete menu error:", error);
    return errorResponse(res, "Failed to delete menu item", 500);
  }
};

/**
 * Toggle menu availability
 */
export const toggleMenuAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { Menu } = req.models;

    const menu = await Menu.findByPk(id);

    if (!menu) {
      return errorResponse(res, "Menu item not found", 404);
    }

    menu.is_available = !menu.is_available;
    await menu.save();

    return successResponse(
      res,
      `Menu item ${menu.is_available ? "made available" : "made unavailable"}`,
      menu
    );
  } catch (error) {
    console.error("Toggle menu availability error:", error);
    return errorResponse(res, "Failed to update menu availability", 500);
  }
};

/**
 * Get featured menu items
 */
export const getFeaturedMenus = async (req, res) => {
  try {
    const { Menu, Category } = req.models;

    const menus = await Menu.findAll({
      where: {
        is_featured: true,
        is_available: true,
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["category_id", "name"],
        },
      ],
      order: [["name", "ASC"]],
    });

    return successResponse(res, "Featured menu items fetched successfully", menus);
  } catch (error) {
    console.error("Get featured menus error:", error);
    return errorResponse(res, "Failed to fetch featured menu items", 500);
  }
};

/**
 * Bulk update menu availability
 */
export const bulkUpdateAvailability = async (req, res) => {
  try {
    const { menu_ids, is_available } = req.body;
    const { Menu } = req.models;

    await Menu.update(
      { is_available },
      {
        where: {
          menu_id: { [Op.in]: menu_ids },
        },
      }
    );

    return successResponse(
      res,
      `${menu_ids.length} menu items updated successfully`
    );
  } catch (error) {
    console.error("Bulk update availability error:", error);
    return errorResponse(res, "Failed to update menu items", 500);
  }
};
```

---

### **controllers/tenant/order.controller.js**

```javascript
import { successResponse, errorResponse, paginatedResponse } from "../../utils/response.util.js";
import { generateOrderNumber } from "../../utils/orderNumber.util.js";
import { Op } from "sequelize";

/**
 * Get all orders
 */
export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      order_type,
      waiter_id,
      start_date,
      end_date,
      search,
    } = req.query;

    const { Order, User, OrderItem, Menu } = req.models;

    const offset = (page - 1) * limit;
    const where = {};

    // Status filter
    if (status) {
      where.status = status;
    }

    // Order type filter
    if (order_type) {
      where.order_type = order_type;
    }

    // Waiter filter
    if (waiter_id) {
      where.waiter_id = waiter_id;
    }

    // Date range filter
    if (start_date || end_date) {
      where.createdAt = {};
      if (start_date) where.createdAt[Op.gte] = new Date(start_date);
      if (end_date) where.createdAt[Op.lte] = new Date(end_date);
    }

    // Search filter
    if (search) {
      where[Op.or] = [
        { order_number: { [Op.like]: `%${search}%` } },
        { customer_name: { [Op.like]: `%${search}%` } },
        { customer_phone: { [Op.like]: `%${search}%` } },
        { table_number: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "waiter",
          attributes: ["user_id", "name"],
          required: false,
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Menu,
              as: "menu",
              attributes: ["menu_id", "name", "image_url"],
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    return paginatedResponse(res, "Orders fetched successfully", orders, {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    return errorResponse(res, "Failed to fetch orders", 500);
  }
};

/**
 * Get order by ID
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { Order, User, OrderItem, Menu, Billing } = req.models;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: "waiter",
          attributes: ["user_id", "name", "phone"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Menu,
              as: "menu",
              attributes: ["menu_id", "name", "image_url", "category_id"],
            },
          ],
        },
        {
          model: Billing,
          as: "billing",
          required: false,
        },
      ],
    });

    if (!order) {
      return errorResponse(res, "Order not found", 404);
    }

    return successResponse(res, "Order fetched successfully", order);
  } catch (error) {
    console.error("Get order by ID error:", error);
    return errorResponse(res, "Failed to fetch order", 500);
  }
};

/**
 * Create new order
 */
export const createOrder = async (req, res) => {
  const transaction = await req.tenantDB.transaction();

  try {
    const {
      table_number,
      customer_name,
      customer_phone,
      order_type,
      items, // Array of { menu_id, quantity, special_request }
      special_instructions,
      delivery_address,
    } = req.body;

    const { Order, OrderItem, Menu } = req.models;

    // Validate items
    if (!items || items.length === 0) {
      return errorResponse(res, "Order must have at least one item", 400);
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menu = await Menu.findByPk(item.menu_id);

      if (!menu) {
        await transaction.rollback();
        return errorResponse(res, `Menu item ${item.menu_id} not found`, 404);
      }

      if (!menu.is_available) {
        await transaction.rollback();
        return errorResponse(res, `${menu.name} is currently unavailable`, 400);
      }

      const price = menu.discount_price || menu.price;
      const total = price * item.quantity;
      subtotal += total;

      orderItems.push({
        menu_id: item.menu_id,
        item_name: menu.name,
        quantity: item.quantity,
        unit_price: price,
        total_price: total,
        special_request: item.special_request,
        status: "pending",
      });
    }

    // Get tax from global settings (assume 10% for now)
    const tax_percentage = 10;
    const tax_amount = (subtotal * tax_percentage) / 100;
    const total_amount = subtotal + tax_amount;

    // Generate order number
    const order_number = await generateOrderNumber(Order);

    // Calculate estimated time
    const maxPrepTime = Math.max(...(await Promise.all(
      items.map(async (item) => {
        const menu = await Menu.findByPk(item.menu_id);
        return menu.preparation_time || 0;
      })
    )));

    // Create order
    const order = await Order.create(
      {
        order_number,
        table_number,
        customer_name,
        customer_phone,
        waiter_id: req.user.user_id,
        order_type: order_type || "dine-in",
        status: "pending",
        subtotal,
        tax_amount,
        total_amount,
        special_instructions,
        delivery_address,
        estimated_time: maxPrepTime,
      },
      { transaction }
    );

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create(
        {
          order_id: order.order_id,
          ...item,
        },
        { transaction }
      );
    }

    await transaction.commit();

    // Fetch created order with all relations
    const createdOrder = await Order.findByPk(order.order_id, {
      include: [
        {
          model: req.models.User,
          as: "waiter",
          attributes: ["user_id", "name"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Menu,
              as: "menu",
              attributes: ["menu_id", "name", "image_url"],
            },
          ],
        },
      ],
    });

    return successResponse(res, "Order created successfully", createdOrder, 201);
  } catch (error) {
    await transaction.rollback();
    console.error("Create order error:", error);
    return errorResponse(res, "Failed to create order", 500);
  }
};

/**
 * Update order status
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { Order } = req.models;

    const order = await Order.findByPk(id);

    if (!order) {
      return errorResponse(res, "Order not found", 404);
    }

    const validStatuses = ["pending", "confirmed", "preparing", "ready", "served", "completed", "cancelled"];

    if (!validStatuses.includes(status)) {
      return errorResponse(res, "Invalid status", 400);
    }

    order.status = status;

    if (status === "completed") {
      order.completed_at = new Date();
    }

    await order.save();

    return successResponse(res, "Order status updated successfully", order);
  } catch (error) {
    console.error("Update order status error:", error);
    return errorResponse(res, "Failed to update order status", 500);
  }
};

/**
 * Update order item status
 */
export const updateOrderItemStatus = async (req, res) => {
  try {
    const { order_id, item_id } = req.params;
    const { status } = req.body;
    const { OrderItem } = req.models;

    const orderItem = await OrderItem.findOne({
      where: {
        order_item_id: item_id,
        order_id,
      },
    });

    if (!orderItem) {
      return errorResponse(res, "Order item not found", 404);
    }

    const validStatuses = ["pending", "preparing", "ready", "served"];

    if (!validStatuses.includes(status)) {
      return errorResponse(res, "Invalid status", 400);
    }

    orderItem.status = status;
    await orderItem.save();

    return successResponse(res, "Order item status updated successfully", orderItem);
  } catch (error) {
    console.error("Update order item status error:", error);
    return errorResponse(res, "Failed to update order item status", 500);
  }
};

/**
 * Cancel order
 */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const { Order } = req.models;

    const order = await Order.findByPk(id);

    if (!order) {
      return errorResponse(res, "Order not found", 404);
    }

    if (["completed", "cancelled"].includes(order.status)) {
      return errorResponse(res, `Cannot cancel ${order.status} order`, 400);
    }

    order.status = "cancelled";
    order.special_instructions = reason
      ? `${order.special_instructions || ""}\n[CANCELLED]: ${reason}`
      : order.special_instructions;

    await order.save();

    return successResponse(res, "Order cancelled successfully", order);
  } catch (error) {
    console.error("Cancel order error:", error);
    return errorResponse(res, "Failed to cancel order", 500);
  }
};

/**
 * Get today's orders
 */
export const getTodayOrders = async (req, res) => {
  try {
    const { Order, User, OrderItem } = req.models;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Order.findAll({
      where: {
        createdAt: {
          [Op.gte]: today,
        },
      },
      include: [
        {
          model: User,
          as: "waiter",
          attributes: ["user_id", "name"],
        },
        {
          model: OrderItem,
          as: "items",
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const stats = {
      total_orders: orders.length,
      total_revenue: orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0),
      by_status: {},
    };

    // Count by status
    orders.forEach((order) => {
      stats.by_status[order.status] = (stats.by_status[order.status] || 0) + 1;
    });

    return successResponse(res, "Today's orders fetched successfully", {
      orders,
      stats,
    });
  } catch (error) {
    console.error("Get today orders error:", error);
    return errorResponse(res, "Failed to fetch today's orders", 500);
  }
};

/**
 * Get pending orders (for kitchen/chef)
 */
export const getPendingOrders = async (req, res) => {
  try {
    const { Order, User, OrderItem, Menu } = req.models;

    const orders = await Order.findAll({
      where: {
        status: {
          [Op.in]: ["pending", "confirmed", "preparing"],
        },
      },
      include: [
        {
          model: User,
          as: "waiter",
          attributes: ["user_id", "name"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Menu,
              as: "menu",
              attributes: ["menu_id", "name", "preparation_time"],
            },
          ],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    return successResponse(res, "Pending orders fetched successfully", orders);
  } catch (error) {
    console.error("Get pending orders error:", error);
    return errorResponse(res, "Failed to fetch pending orders", 500);
  }
};
```

---

Due to length constraints, I'll continue in the next part with:
- Billing Controller
- Feedback Controller
- Dashboard Controller
- Settings Controller
- Validators
- Routes

Would you like me to continue with the remaining controllers? 🚀