import express from "express";
import master from "./master.js";
import tenant from "./tenant.js";

const router = express.Router();

router.use("/master", master);
router.use("/tenant", tenant);

export default router;
