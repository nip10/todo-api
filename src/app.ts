import bodyParser from "body-parser";
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import _ from "lodash";
import helmet from "helmet";
import cors, { CorsOptions } from "cors";

import user from "./routes/user";
import todo from "./routes/todo";
import index from "./routes/index";

import logger from "./utils/logger";

dotenv.config();

const { PORT, NODE_ENV } = process.env;
const PORT_N = Number.parseInt(PORT, 10);

if (!_.isFinite(PORT_N)) {
  logger.log("error", "You need to set a PORT in the .env file");
  process.exit(1);
}

if (_.isNil(NODE_ENV)) {
  logger.log("error", "You need to set a NODE_ENV in the .env file");
  process.exit(1);
}

const isProd = NODE_ENV === "production";

const app = express();

const whitelist = [
  "http://localhost:3000"
  // `http://localhost:${CLIENT_DEV_PORT}`,
  // `https://${BASE_URL}`,
  // `https://www.${BASE_URL}`
];
const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  exposedHeaders: ["x-auth"]
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", index);
app.use("/users", user);
app.use("/todos", todo);

// Handle 404s
app.use((req: Request, res: Response) => {
  const err = new Error("Page Not Found.");
  return res.status(404).json({ error: err.message });
});

// Handle server errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }
  return res.status(500).json({ error: isProd ? "Server error" : err });
});

app.listen(PORT_N, () => {
  logger.info(`Started on port ${PORT_N} in ${NODE_ENV} mode`);
});

export default app;
