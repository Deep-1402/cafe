import express from "express";
import authorize from "../middleware/authentication.js";
import master from "../controllers/master/master.js";
import subscription from "../controllers/master/subscription.js";

const router = express.Router();

router.post("/signup", authorize, master.signUp);
router.post("/login", master.login);

// Subscription
router.post("/subscription", authorize, subscription.createSubscription);
router.get("/subscription", authorize, subscription.getAllSubscription);
router.get("/subscription/:id", authorize, subscription.getSubscriptionById);
router.patch("/subscription/:id", authorize, subscription.updateSubscription);
router.delete("/subscription/:id", authorize, subscription.deleteSubscription);

export default router;
