import { Router } from "express";
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
} from "../controllers/admin-user.controller";
import { authorized, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

router.use(authorized, requireAdmin);
router.get("/", listUsers);
router.post("/", createUser);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
