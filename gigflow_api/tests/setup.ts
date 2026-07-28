import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

// Set environment variables BEFORE any application module is imported
process.env.JWT_SECRET = "test-jwt-secret-key-1234567890";
process.env.JWT_EXPIRES_IN = "1d";
process.env.SMTP_HOST = "smtp.gmail.com";
process.env.SMTP_PORT = "587";
process.env.SMTP_USER = "test@example.com";
process.env.SMTP_PASS = "testpass";
process.env.GEMINI_API_KEY = "test-gemini-api-key";
process.env.CLIENT_URL = "http://localhost:3000";


let mongoServer: MongoMemoryServer;

export const setupTestDB = () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    process.env.MONGODB_URI = uri;

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(uri);
  }, 120000);

  beforeEach(async () => {
    if (mongoose.connection.readyState !== 0) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
    }
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  }, 120000);
};
