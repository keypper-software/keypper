import getColor from "@/utils/get-color";
import getUrl from "@/utils/get-url";
import open from "open";
import { log } from "../cli";
import { initializeLogin, verifyLogin } from "@/api/auth";
import getMachineInfo from "@/utils/get-machine-info";
import { isAxiosError } from "axios";
import storage from "@/utils/storage";
import { VERSION, AUTH_UPDATE_INTERVAL } from "@/constants/index";
import clipboardy from "clipboardy";
import logger from "@/utils/logger";
export default async () => {
  log.text = "Initializing authentication";
  log.start();

  try {
    console.clear();

    const store = await storage();

    const { os, user, machine } = getMachineInfo();

    const { data: initLogin } = await initializeLogin({
      machineName: machine,
      operatingSystem: os,
      userName: user,
    });

    if (!initLogin || !initLogin.id || !initLogin.phrase) {
      throw new Error(
        "Failed to initialize login: Invalid response from server"
      );
    }

    await store.writeToStore({
      _auth: {
        preId: initLogin.id,
        phrase: initLogin.phrase,
        exTimestamp: Date.parse(initLogin.expiresAt),
        timestamp: Date.now(),
      },
    });

    console.clear();
    logger("Paste these phrase to authenticate:");
    logger(initLogin.phrase, { color: "GREEN" });
    const url = getUrl(
      `auth/cli?medium=cli&phrase=${encodeURIComponent(initLogin.phrase)}`
    );
    logger(`you can also open this URL manually:\n ${url} to authenticate`, {
      style: "DIM",
    });
    log.text = "Opening browser for authentication";

    try {
      await clipboardy.write(initLogin.phrase);
      await open(url, { wait: false });

      // throw new Error("Browser opening is disabled for testing purposes");
    } catch (openError) {
      logger("⚠️ Could not automatically open browser", { color: "YELLOW" });
      logger(`Please open this URL manually: ${url}`);
    }

    log.text = getColor({
      text: "Waiting for authentication...",
      color: "CYAN",
    });

    const expiresAt = new Date(initLogin.expiresAt);
    let authVerified = false;

    const updates = setInterval(async () => {
      try {
        // Check if auth has expired
        const now = new Date();
        if (now > expiresAt) {
          clearInterval(updates);
          throw new Error("Authentication timeout - please try again");
        }

        const readStore = await store.readFromStore();
        if (!readStore?._auth?.preId) {
          clearInterval(updates);
          throw new Error("Invalid authorization state");
        }

        const { data: credentials } = await verifyLogin({
          auth_phrase_id: readStore._auth.preId,
        });

        if (!credentials || !credentials.token) {
          return;
        }

        authVerified = true;
        clearInterval(updates);

        await store.writeToStore({
          ...readStore,
          _auth: {
            ...readStore._auth,
            session: {
              id: credentials.token,
              version: VERSION,
            },
            timestamp: Date.now(),
          },
        });

        log.stop();
        console.clear();
        logger("✅ Authentication successful", {
          color: "GREEN",
        });

        logger(
          "Run `keypper init` to initialize Keypper with your project, visit https://docs.keypper.co to learn more about Keypper CLI"
        );

        process.exit(0);
      } catch (pollError: any) {
        if (
          pollError?.message.includes("timeout") ||
          pollError?.message.includes("Invalid authorization")
        ) {
          clearInterval(updates);
          handleError(pollError);
        }
      }
    }, AUTH_UPDATE_INTERVAL);
  } catch (error) {
    handleError(error);
  }
};

// LOGIN SPECIFICA ERRORS HANDLING
function handleError(error: any) {
  log.stop();
  console.clear();

  logger("❌ Authentication failed", { color: "RED" });

  const errorMessage = isAxiosError(error)
    ? error?.response?.data?.error || "Server connection error"
    : error?.message || "Unknown error occurred";

  console.log("REASON:", errorMessage);

  if (
    errorMessage.includes("timeout") ||
    errorMessage.includes("Authentication timeout")
  ) {
    logger(
      "For help visit: https://docs.keypper.co/v1/cli?troubleshoot=cli-authentication-timeout"
    );
  } else if (errorMessage.includes("connection") || isAxiosError(error)) {
    logger(
      "Check your internet connection or visit: https://docs.keypper.co/v1/cli?troubleshoot=connection-issues"
    );
  }

  process.exit(1);
}
