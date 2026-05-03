const { Sequelize } = require("sequelize");
const { databaseUrl, nodeEnv } = require("./env");

const isSqlite = databaseUrl.startsWith("sqlite:");

const sequelize = isSqlite
  ? new Sequelize({
      dialect: "sqlite",
      storage: databaseUrl.replace("sqlite:", ""),
      logging: false,
    })
  : new Sequelize(databaseUrl, {
      dialect: "postgres",
      protocol: "postgres",
      logging: false,
      dialectOptions:
        nodeEnv === "production"
          ? {
              ssl: { require: true, rejectUnauthorized: false },
            }
          : {},
    });

module.exports = sequelize;
