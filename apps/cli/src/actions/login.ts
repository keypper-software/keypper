import getColor from "../utils/get-color";
import getUrl from "../utils/get-url";
import open from "open";
import { log } from "../cli";
import { serverEvent } from "../events/server-events";
import generatePhrase from "../utils/generate-phrase";

export default async () => {
  const words = generatePhrase({ length: 6 });
  log.text = getColor({ text: "Opening the Browser", color: "CYAN" });
  log.start();
  try {
    console.clear()
    console.log(
      getColor({ text: "Paste these words to Authenticate:", color: "CYAN" })
    );
    console.log(
      getColor({ text: words, color: "GREEN" })
    );
    const url = getUrl(`auth/session?mode=terminal&now=${Date.now()}`);
    await open(url, {
      wait: true,
    });
    serverEvent.start();
  } catch (error) {
    log.text = getColor({ text: "Authentcation Timeout", color: "RED" });
    log.clear();
    log.stop();
    process.exit(1);
  } finally {
  }
};
