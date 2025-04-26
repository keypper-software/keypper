import ora from "ora";
import getColor from "../utils/get-color";
import getUrl from "../utils/get-url";
import open from "open";
import server from "../server";
import { SERVER_PORT } from "../constants";
import { log } from "../cli";
import { serverEvent } from "../events/server-events";

export default async () => {
  log.text = getColor({ text: "Opening the Browser", color: "CYAN" });
  log.start();
  try {
    const url = getUrl(`auth/session?mode=terminal&now=${Date.now()}`);
    await open(url, {
      wait: true,
    });
    serverEvent.start();
  } catch (error) {
    log.text = getColor({ text: "Authentcation Timeout", color: "RED" });
    log.clear()
    log.stop();
    process.exit(1);
  } finally {
  }
};
