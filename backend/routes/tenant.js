import express from "express";
import tenant from "../controllers/tenant/tenant.js";
import authorize from "../middleware/authentication.js";
import Admin from "../middleware/admin.js";

const router = express.Router();

router.post("/login", tenant.login);
router.post("/user/create", [authorize, Admin], tenant.createUser);

export default router;
