import express from "express";
import tenant from "../controllers/tenant/tenant.js";
import authorize from "../middleware/authentication.js";
import Admin from "../middleware/admin.js";


const router = express.Router();

router.post("/login", tenant.login);
router.post("/user", [authorize, Admin], tenant.createUser);
//role
router.post("/role", [authorize, Admin], tenant.createRole);
//module
router.post("/module", [authorize, Admin], tenant.createModule);
//permission
router.post("/permission", [authorize, Admin], tenant.createPermission);

// Catgory
router.post("/catagory", authorize,  )

// Menu

export default router;
