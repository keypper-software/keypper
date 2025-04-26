import { serverEvent } from "./events/server-events";
import { Command } from "commander";
import ora from "ora";
import server from "./server";
import { SERVER_PORT } from "./constants";
import getColor from "./utils/get-color";
import { GracefulShutdownManager } from "@moebius/http-graceful-shutdown";
import cliSpinners from "cli-spinners";
const cli = new Command();
export const log = ora({});

let expressServer: any;
serverEvent.on("start-server", () => {
  expressServer = server.listen(SERVER_PORT, () => {
    log.text = getColor({
      text: "Waiting For Authentication",
      color: "CYAN",
    });
    // console.log("Server started", SERVER_PORT);
  });
});

serverEvent.on("stop-server", () => {
  console.log(expressServer);
  log.text = getColor({ text: "Authentcation Successfull", color: "GREEN" });
  log.spinner = cliSpinners.smiley;
  setTimeout(() => {
    const shutdownManager = new GracefulShutdownManager(expressServer);
    shutdownManager.terminate(() => {});
    expressServer?.close?.();
    log.stop();
    const gracefulExit = () => {
      expressServer?.close?.();
    };
    process.on("SIGTERM", gracefulExit);
    process.on("SIGINT", gracefulExit);
    console.log("exit")
    // process.exit(0);
  }, 1000);
});
export default cli;
