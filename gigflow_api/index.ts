import dotenv from "dotenv";
import app from "./src/app";
import { connectDB } from "./src/database/mongodb";

dotenv.config();

const port = Number(process.env.PORT) || 5000;

const startServer = async () => {
  await connectDB();

app.listen(port, "0.0.0.0", () => {
  console.log(`GigFlow API running on ${port}`);
});
};

startServer().catch((error) => {
  console.error("Failed to start GigFlow API:", error);
  process.exit(1);
});
