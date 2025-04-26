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
  });
});

serverEvent.on("stop-server", (token) => {
  log.text = getColor({ text: "Authentcation Successfull", color: "GREEN" });
  log.spinner = cliSpinners.smiley;
  setTimeout(() => {
    expressServer?.close?.();
    serverEvent.removeAllListeners();

    log.text = getColor({ text: "", color: "GREEN" });
    log.clear()
    log.stop();

    console.log("Save to file", token);
    process.exit(0);
  }, 1000);
});
export default cli;
