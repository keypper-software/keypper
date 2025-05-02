import { getSecrets } from "@/api/workspaces";
import getColor from "@/utils/get-color";
import logger from "@/utils/logger";
import storage from "@/utils/storage";
import { isAxiosError } from "axios";
import { exec } from "node:child_process";

export default async (options: string[]) => {
  // TODO:[]: choose to add workspace config from args
  try {
    const command = options.join(" ");
    const store = await storage();

    const config = await store.getWorkspaceConfig();

    if (
      !config?.identifiers.environmentId ||
      !config?.identifiers.projectId ||
      !config?.identifiers.workspaceId
    ) {
      logger("⚠️- Workspace Idenifiers missing in config", { color: "YELLOW" });

      logger(
        "Run `keypper init` to authenticate or to learn more about Keypper CLI visit https://docs.keypper.co",
        { style: "DIM" }
      );

      process.exit(1);
    }
    const {
      identifiers: { environmentId, projectId, workspaceId },
    } = config;

    const {
      data: { secrets },
    } = await getSecrets({
      environmentId,
      projectId,
      workspaceId,
    });

    const onlyKeyPairs: Record<any, string> = {};
    secrets.map((secret) => {
      onlyKeyPairs[secret.key] = secret.value;
    });

    const child = exec(command, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ...onlyKeyPairs,
      },
    });

    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);

    child.on("exit", (code) => {
      process.exit(code ?? 0);
    });
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
      `⚠️-  ${response?.data?.error || ""} Are you sure you are logged in to the right workspace?`,
      { color: "RED" }
    );
    logger("Run `keypper login` to authenticate.");
    logger("Learn more: https://docs.keypper.co/v1/authenication#login", {
      style: "DIM",
    });
  }

  logger(`⚠️- An unknown error occurred, please try again.`, { color: "RED" });
  process.exit(1);
};
