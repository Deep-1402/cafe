import express from "express";
import tenant from "../controllers/tenant/tenant.js";
import authorize from "../middleware/authentication.js";
import Admin from "../middleware/admin.js";
import roles from "../controllers/tenant/roles.js";

const router = express.Router();

router.post("/login", tenant.login);
router.post("/user-create", [authorize, Admin], tenant.createUser);
//role
router.post("/role-create", [authorize, Admin], tenant.createRole);
//module
router.post("/module-create", [authorize, Admin], tenant.createModule);
//permission
router.post("/permission-create", [authorize, Admin], tenant.createPermission);

export default router;
