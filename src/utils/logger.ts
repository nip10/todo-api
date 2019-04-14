import winston, { createLogger } from "winston";
import dotenv from "dotenv";

dotenv.config();

const { NODE_ENV } = process.env;
const isProd = NODE_ENV === "production";

const logger = createLogger({
  transports: [
    new winston.transports.Console({ level: isProd ? "info" : "debug" }),
    new winston.transports.File({ filename: "debug.log", level: "debug" })
  ]
});

if (!isProd) {
  logger.debug("Logging initialized at debug level");
}

export default logger;
