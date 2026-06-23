import { Request, Response, Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

  res.status(dbState === 1 ? 200 : 503).json({
    success: dbState === 1,
    message:
      dbState === 1
        ? "GigFlow API is healthy"
        : "GigFlow API is running but database is unavailable",
    data: {
      service: "gigflow_api",
      database: dbStatus,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
