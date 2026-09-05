import { Router } from "express";
import {
  getAllUsers,
  createUser,
  loginUser,
  heartbeatUser,
  logoutUser,
  getActiveUsers,
  updateUserTheme,
  updateUserProfile,
} from "../controllers/userController.js";

const router = Router();

router.get("/users", getAllUsers);
router.post("/users", createUser);
router.post("/login", loginUser);
router.post("/users/heartbeat", heartbeatUser);
router.post("/users/logout", logoutUser);
router.get("/users/active", getActiveUsers);
router.put("/users/:id/theme", updateUserTheme);
router.put("/users/:id/profile", updateUserProfile);

export default router;
