import {
  getEnvs,
  getSecrets,
  getWorkspaceProjects,
  getWorkspaces,
} from "@/api/workspaces";
import { log } from "@/cli";
import secretsCache from "@/utils/cache/secrets-cache";
import getColor from "@/utils/get-color";
import logger from "@/utils/logger";
import storage from "@/utils/storage";
import { isAxiosError } from "axios";
import inquirer from "inquirer";
export interface SelectWorkspaceOptions {
  name?: string;
}

export default async (options: SelectWorkspaceOptions) => {
  try {
    // TODO[]: CHECK KEYPPER CONFIG BEFORE OVERWRITT
    const store = await storage();
    const { data: allWorkspace } = await getWorkspaces();

    if (allWorkspace.length == 0) {
      isEmptyMessage("⚠️- Looks like you don't have any workspace.");
      process.exit(1);
    }

    const { selectedWorkspace } = await inquirer.prompt({
      type: "list",
      name: "selectedWorkspace",
      message: "Select a workspace to continue:",
      choices: allWorkspace.map((w) => ({
        name: w.name,
        value: w.id,
      })),
    });

    const { data: allProjects } = await getWorkspaceProjects({
      workspaceId: selectedWorkspace,
    });

    if (allProjects.length == 0) {
      isEmptyMessage(`⚠️- There are no projects this workspace.`);
      process.exit(1);
    }

    const { selectedProject } = await inquirer.prompt({
      type: "list",
      name: "selectedProject",
      message: "Select a project to continue:",
      choices: allProjects.map((w) => ({
        name: w.name,
        value: w.id,
      })),
    });

    const {
      data: { environments: allEnvs },
    } = await getEnvs({
      projectId: selectedProject,
      workspaceId: selectedWorkspace,
    });

    if (allEnvs.length == 0) {
      isEmptyMessage(`⚠️- There are no environments in the selected projects.`);
      process.exit(1);
    }

    const { selectedEnv } = await inquirer.prompt({
      type: "list",
      name: "selectedEnv",

      message: "Select an environment to continue:",
      choices: allEnvs.map((w) => ({
        name: w.name,
        value: w.id,
      })),
    });

    const {
      data: { secrets: allSecrets, count: secretsCount },
    } = await getSecrets({
      environmentId: selectedEnv,
      projectId: selectedProject,
      workspaceId: selectedWorkspace,
    });

    if (!secretsCount || allSecrets?.length == 0) {
      isEmptyMessage(`⚠️- There are no secrets in the selected environments.`);
      const { confirmEmptyEnv } = await inquirer.prompt({
        type: "confirm",
        name: "confirmEmptyEnv",
        message: "Did you wish to continue without secrets?",
        default: false,
      });

      !confirmEmptyEnv && process.exit(1);
    }
    const cache = await secretsCache({
      environmentId: selectedEnv,
      projectId: selectedProject,
      workspaceId: selectedWorkspace,
    });
    
    await cache.generateCache(allSecrets);

    await store.createWorkspaceConfig({
      identifiers: {
        environmentId: selectedEnv,
        projectId: selectedProject,
        workspaceId: selectedWorkspace,
      },
    });

    // dump to temp
    // TODO:[] work on offline mode
    console.clear();

    logger("✅ Keypper config has been initialized at the current directory.");
    logger(
      " Run `Keypper run [command] to use environments visit docs.keypper.co/commands#run to learn more",
      { style: "DIM" }
    );

    process.exit(0);
  } catch (error) {
    handleError(error);
  }
};

const handleError = (error: any) => {
  log.clear();
  log.stopAndPersist();
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

const isEmptyMessage = (message: string) => {
  console.clear();
  logger(message, { color: "YELLOW" });

  logger(
    "Visit: https://keypper.co to create manage workspaces, projects, environments and secrets.",
    { style: "DIM" }
  );
};
