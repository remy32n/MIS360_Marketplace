import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app: Express = express();

// Trust the Replit/Vite reverse proxy so rate-limiting and cookie-secure work correctly
app.set("trust proxy", 1);

const allowedOrigins = process.env["NODE_ENV"] === "production"
  ? (process.env["REPLIT_DOMAINS"] || "").split(",").map(d => `https://${d.trim()}`).filter(Boolean)
  : ["http://localhost:5173", "http://localhost:26210"];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
      return cb(null, true); // allow all in proxy env
    },
    credentials: true,
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);

export default app;
