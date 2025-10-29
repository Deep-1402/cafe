import express from "express";
import authorize from "../middleware/authentication.js";
import master from "../controllers/master/master.js";

const router = express.Router();

router.post("/signup", authorize, master.signUp);
router.post("/login", master.login);

export default router;
