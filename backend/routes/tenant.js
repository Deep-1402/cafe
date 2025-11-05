import express from "express";
import tenant from "../controllers/tenant/tenant.js";
import authorize from "../middleware/authentication.js";
import Admin from "../middleware/admin.js";
import catagory from "../controllers/tenant/catagory.js";
import menu from "../controllers/tenant/menu.js";
import message from "../controllers/tenant/message.js";

const router = express.Router();

router.post("/login", tenant.login);
router.post("/user/login", tenant.userLogin);
router.post("/user", [authorize, Admin], tenant.createUser);
router.get("/user", [authorize], tenant.getAllUser);

//role
router.post("/role", [authorize, Admin], tenant.createRole);

//module
router.post("/module", [authorize, Admin], tenant.createModule);

//permission
router.post("/permission", [authorize, Admin], tenant.createPermission);
router.get("/permission", authorize, tenant.getPermisionByRoles);

// Catgory
router.post("/catagory", authorize, catagory.createCategory);
router.get("/catagory", authorize, catagory.getAllCategories);
router.get("/catagory/:id", authorize, catagory.getCategoryById);
router.patch("/catagory/:id", authorize, catagory.updateCategory);
router.delete("/catagory/:id", authorize, catagory.deleteCategory);

// Menu
router.post("/menu", authorize, menu.createDish);
router.patch("/menu/:id", authorize, menu.updateDish);
router.delete("/menu/:id", authorize, menu.deleteDish);
router.get("/menu", authorize, menu.getAllAvailableDishes);

// Message
router.post("/message", authorize, message.sendMessage);

export default router;
