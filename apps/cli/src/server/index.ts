import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { SERVER_AUTH_CALLBACK_URL } from "../constants";
import { serverEvent } from "../events/server-events";

const __DEV__ = process.env.NODE_ENV == "development";
const server = express();

server.use(cors());
server.use(express.json());
server.use(express.urlencoded());
server.use(helmet());
__DEV__ && server.use(morgan("dev"));

server.post(SERVER_AUTH_CALLBACK_URL, async (req: Request, res: Response) => {
  try {
    serverEvent.stop();
    res.end();
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});
export default server;
