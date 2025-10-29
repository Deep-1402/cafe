import AuditLog from "./auditLog.js";
import Subscription from "./subscription.js";
import Tenants from "./tenants.js";
import Users from "./user.js";

Subscription.hasMany(Tenants, { foreignKey: "plan_id" });
Tenants.belongsTo(Subscription, { foreignKey: "plan_id" });

Tenants.hasMany(AuditLog, { foreignKey: "tenant_id" });
AuditLog.belongsTo(Tenants, { foreignKey: "tenant_id" });

export {AuditLog, Subscription, Tenants, Users} 