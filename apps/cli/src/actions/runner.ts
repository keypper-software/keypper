import { getSecrets } from "@/api/workspaces";
import getColor from "@/utils/get-color";
import storage from "@/utils/storage";
import { exec } from "node:child_process";

export default async (options: string[]) => {
  // TODO:[]: choose to add workspace config from args
  const command = options.join(" ");
  const store = await storage();

  const config = await store.getWorkspaceConfig();

  if (
    !config?.identifiers.environmentId ||
    !config?.identifiers.projectId ||
    !config?.identifiers.workspaceId
  ) {
    console.log(
      getColor({
        text: "⚠️- Workspace Idenifiers missing in config",
        color: "YELLOW",
      })
    );

    console.log(
      getColor({
        style: "DIM",
        text: "Run `keypper init` to authenticate or to learn more about Keypper CLI visit https://docs.keypper.dev",
      })
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
};
