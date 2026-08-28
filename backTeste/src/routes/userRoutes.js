import { Router } from "express";
import {
  getAllUsers,
  createUser,
  loginUser,
  updateUserTheme,
} from "../controllers/userController.js";

const router = Router();

router.get("/users", getAllUsers);
router.post("/users", createUser);
router.post("/login", loginUser);
router.put("/users/:id/theme", updateUserTheme);

export default router;
