import { getSecrets, Secret } from "@/api/workspaces";
import secretsCache from "@/utils/cache/secrets-cache";
import logger from "@/utils/logger";
import storage from "@/utils/storage";
import { isAxiosError } from "axios";
import { exec } from "node:child_process";

interface RunnerArgs {
  ignore?: boolean;
  cache?: boolean;
}

export default async (options: string[], args: RunnerArgs) => {
  try {
    const ignoreErrors = !!args?.ignore;
    const allowCache = !!args.cache;
    const command = options.join(" ");

    const store = await storage();

    const config = await store.getWorkspaceConfig().catch((err) => {
      if (ignoreErrors) {
        return null;
      } else {
        throw err;
      }
    });

    if (
      !config?.identifiers?.environmentId ||
      !config?.identifiers?.projectId ||
      !config?.identifiers?.workspaceId
    ) {
      logger("⚠️- Keypper workspace Identifiers missing in config", {
        color: "YELLOW",
      });

      logger(
        "Run `keypper init` to initialize or visit https://docs.keypper.co to learn more about Keypper CLI ",
        { style: "DIM" }
      );

      if (!ignoreErrors) process.exit(1);
      logger("⚠️- skipping keypper errors/warnings due to --ignore flag", {
        color: "YELLOW",
      });
      startChildProcess(command);
      return;
    }

    const {
      identifiers: { environmentId, projectId, workspaceId },
    } = config;

    let cached: Secret[];
    
    if (allowCache) {
      const cache = await secretsCache({
        environmentId,
        projectId,
        workspaceId,
      });
      cached = await cache.getCache();
    }

    const {
      data: { secrets },
    } = await getSecrets({
      environmentId,
      projectId,
      workspaceId,
    }).catch((err) => {
      if (ignoreErrors) {
        logger("⚠️- skipping keypper errors/warnings due to --ignore flag", {
          color: "YELLOW",
        });
        return { data: { secrets: [] } };
      }

      if (cached) {
        logger("Using cached secrets", { style: "DIM" });
        return {
          data: {
            secrets: cached,
          },
        };
      }
      throw err;
    });

    const envVars = Object.fromEntries(
      secrets.map((secret: any) => [secret.key, secret.value])
    );

    startChildProcess(command, envVars);
  } catch (error) {
    handleError(error);
  }
};

const handleError = (error: any) => {
  console.clear();

  if (isAxiosError(error)) {
    const { response } = error;
    if (response?.status == 401) {
      logger("⚠️- Unauthorized. Please log in first.", { color: "RED" });
    }
    logger(
      `⚠️- ${response?.data?.error || ""} Are you sure you are logged in to the right workspace?`,
      { color: "RED" }
    );
    logger("Run `keypper login` to authenticate.");
    logger("Learn more: https://docs.keypper.co/v1/authenication#login", {
      style: "DIM",
    });
    process.exit(1);
  }

  logger(error, { style: "DIM" });
  if (String(error).includes("no such file or directory")) {
    logger("⚠️- Keypper config missing", {
      color: "YELLOW",
    });

    logger(
      "Run `keypper init` to initialize or visit https://docs.keypper.co to learn more about Keypper CLI ",
      { style: "DIM" }
    );
    process.exit(1);
  }

  logger(error, { style: "DIM" });
  logger(`⚠️- An unknown error occurred, please try again.`, { color: "RED" });
  process.exit(1);
};

const startChildProcess = (command: string, envVars = {}) => {
  const child = exec(command, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ...envVars,
    },
  });

  child.stdout?.pipe(process.stdout);
  child.stderr?.pipe(process.stderr);

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
};
