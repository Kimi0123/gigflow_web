import cors from "cors";
import express from "express";
import path from "path";
import routes from "./routes/index";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3005",
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "GigFlow Auth API is running",
    data: {
      docs: "/api/health",
      auth: {
        register: "POST /api/v1/register",
        login: "POST /api/v1/login",
        me: "GET /api/v1/auth/me",
        whoami: "GET /api/v1/auth/whoami",
        refresh: "POST /api/v1/refresh",
        updateProfile: "PATCH /api/v1/auth/update",
        updatePassword: "PATCH /api/v1/auth/update/password",
      },
    },
  });
});

app.use("/api/v1", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
