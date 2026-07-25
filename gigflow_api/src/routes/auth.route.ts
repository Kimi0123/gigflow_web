import { Router } from "express";
import {
  deleteUserByIdHandler,
  getUserById,
  login,
  me,
  refreshToken,
  register,
  updatePassword,
  updateProfile,
  updateUserById,
} from "../controllers/auth.controller";
import { authorized } from "../middlewares/auth.middleware";
import { uploadProfileAndCv } from "../middlewares/upload.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", authorized, refreshToken);
router.get("/me", authorized, me);
router.patch("/me", authorized, uploadProfileAndCv, updateProfile);
router.get("/whoami", authorized, me);
router.patch("/update", authorized, uploadProfileAndCv, updateProfile);
router.patch("/update/password", authorized, updatePassword);

// Admin/user management (protected)
router.get("/user/:id", authorized, getUserById);
router.patch("/user/:id", authorized, uploadProfileAndCv, updateUserById);
router.delete("/user/:id", authorized, deleteUserByIdHandler);

export default router;
