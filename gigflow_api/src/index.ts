import dotenv from "dotenv";
import app from "./app";
import { connectDB } from "./database/mongodb";

dotenv.config();

const port = Number(process.env.PORT) || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(port, () => {
    console.log(`GigFlow API running on http://localhost:${port}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start GigFlow API:", error);
  process.exit(1);
});
