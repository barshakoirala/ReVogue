import "dotenv/config";

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/revogue",
  jwtSecret: process.env.JWT_SECRET || "revogue-dev-secret-change-in-production",
};
