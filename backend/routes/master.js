import express from "express";
import authorize from "../middleware/authentication.js";
import master from "../controllers/master/master.js";
import subscription from "../controllers/master/subscription.js"

const router = express.Router();

router.post("/signup", authorize, master.signUp);
router.post("/login", master.login);

// Subscription
router.post("/subscription", authorize, subscription.createSubscription)

export default router;
