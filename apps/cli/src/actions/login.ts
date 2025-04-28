import getColor from "../utils/get-color";
import getUrl from "../utils/get-url";
import open from "open";
import { log } from "../cli";
import { initializeLogin, verifyLogin } from "../api/auth";
import getMachineInfo from "../utils/get-machine-info";
import { isAxiosError } from "axios";
import storage from "../utils/storage";
import { VERSION, AUTH_UPDATE_INTERVAL } from "../constants/index";

export default async () => {
  log.text = "Please wait";
  log.start();
  try {
    const store = await storage();
    console.clear();
    const { os, user, machine } = getMachineInfo();
    const { data: initLogin } = await initializeLogin({
      machineName: machine,
      operatingSystem: os,
      userName: user,
    });
    log.text = "Opening the Browser";
    await store.writeToStore({
      _auth: {
        preId: initLogin.id,
        phrase: initLogin.phrase, // TODO:[]:encrypt:
        // IDEA:
        // ENCRYPT THE PHRASE USING THE ID or prease
        exTimestamp: Date.parse(initLogin.expiresAt),
        timestamp: Date.now(),
      },
    });
    console.clear();
    console.log(
      getColor({ text: "Paste these words to Authenticate:", color: "WHITE" })
    );
    console.log(getColor({ text: initLogin.phrase, color: "GREEN" }));
    const url = getUrl(`auth/cli?medium=cli&phrase=${initLogin.phrase}`);
    await open(url, {
      wait: true,
    });

    log.text = getColor({
      text: "Waiting for Authentication",
      color: "CYAN",
    });

    // CHECK FOR UPDATE;
    let expires = new Date(initLogin.expiresAt);
    const updates = setInterval(async () => {
      try {
        let now = new Date();
        if (now > expires) {
          clearInterval(updates);
          log.clear();
          log.stop();
          log.stopAndPersist();
          console.clear();
          console.log(
            getColor({
              text: "❌ Authentication Timeout",
              color: "RED",
            })
          );
          console.log(
            "REASON: Authentication Timeout, Make you paste the phrase in the opened browser tab or visit https://docs.keypper.dev/v1/cli?troubleshoot=cli-authentication-timeout"
          );
          throw new Error("Authentication Timeout");
        }
        // console.log(expires, count)
        log.text = getColor({
          text: `Waiting for Authentication`,
          color: "CYAN",
        });
        const readStore = await store.readFromStore();
        if (!readStore?._auth?.preId) {
          clearInterval(updates);
          throw new Error("Invalid Authorization");
        }

        const { data: credentials } = await verifyLogin({
          auth_phrase_id: readStore._auth.preId,
        });

        await store.writeToStore({
          ...readStore,
          _auth: {
            ...readStore?._auth,
            session: {
              id: credentials.token,
              version: VERSION,
            },
          },
        });
        log.clear();
        log.stop();
        log.stopAndPersist();
        console.clear();
        console.log(
          getColor({
            text: "✅ Authentication Successful",
            color: "GREEN",
          })
        );
        console.log(
          "Run keypper --help to learn more about Keypper cli or visit https://docs.keypper.dev"
        );
        clearInterval(updates);
        process.exit(0);
      } catch (error: any) {
        // console.log(error)
      }
    }, AUTH_UPDATE_INTERVAL);
  } catch (error) {
    log.text = getColor({ text: "❌ Authentication Cancel", color: "RED" });
    console.log(
      "REASON:",
      isAxiosError(error)
        ? error?.response?.data?.error
        : "Failed to connect to the server"
    );
    process.exit(0);
  } finally {
    log.clear();
  }
};
