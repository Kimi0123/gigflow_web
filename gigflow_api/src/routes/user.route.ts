import { Router } from "express";
import {
  getPublicProfileHandler,
  listFreelancersHandler,
} from "../controllers/publicProfile.controller";

const router = Router();

// ─── IMPORTANT: static / more specific routes MUST come before parameterised routes ───

// Public freelancer directory
router.get("/freelancers", listFreelancersHandler);

// Public user profile
router.get("/:userId/public-profile", getPublicProfileHandler);

export default router;
