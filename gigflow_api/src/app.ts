import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.route";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3005",
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "GigFlow Auth API is running",
  });
});

app.use("/api/auth", authRoutes);

app.use(errorMiddleware);

export default app;
