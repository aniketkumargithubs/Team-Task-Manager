const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "change-this-in-production",
  databaseUrl: process.env.DATABASE_URL || "sqlite:./database.sqlite",
  nodeEnv: process.env.NODE_ENV || "development",
};
