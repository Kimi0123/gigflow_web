import { Router } from "express";
import {
  deleteUserByIdHandler,
  forgotPassword,
  getUserById,
  login,
  me,
  refreshToken,
  register,
  registerFcmTokenHandler,
  resetPasswordHandler,
  updatePassword,
  updateProfile,
  updateUserById,
  verifyResetCodeHandler,
} from "../controllers/auth.controller";
import { authorized } from "../middlewares/auth.middleware";
import { uploadProfileAndCv } from "../middlewares/upload.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCodeHandler);
router.post("/reset-password", resetPasswordHandler);
router.post("/refresh", authorized, refreshToken);
router.get("/me", authorized, me);
router.patch("/me", authorized, uploadProfileAndCv, updateProfile);
router.get("/whoami", authorized, me);
router.patch("/update", authorized, uploadProfileAndCv, updateProfile);
router.patch("/update/password", authorized, updatePassword);
router.patch("/fcm-token", authorized, registerFcmTokenHandler);

// Admin/user management (protected)
router.get("/user/:id", authorized, getUserById);
router.patch("/user/:id", authorized, uploadProfileAndCv, updateUserById);
router.delete("/user/:id", authorized, deleteUserByIdHandler);

export default router;
