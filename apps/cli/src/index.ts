// #!/usr/bin/env node
import dotenv from "dotenv";
dotenv.config();
import cli from "./cli";
import login from "@/actions/login";
import { VERSION } from "@/constants";
import logout from "@/actions/logout";
import selectWorkspace from "./actions/select-workspace";

cli
  .name("keypper")
  .description(
    "Effortlessly secure and manage tokens, credentials, and encryption keys across all environments — via CLI."
  )
  .version(VERSION, "-v, --version", "output the current version");

cli
  .command("login")
  .description("Login to manage your workspace")
  .action(login);

cli
  .command("init")
  .description("Initialize Keypper configuration in your project");

cli
  .command("run")
  .description("Run a command in the context of your Keypper workspace")
  .argument("<command...>", "Command to run");

cli
  .command("workspace")
  .option("-n, --name <name>", "Select a workspace By name")
  .description(
    "Manage your workspace, ignores the workspace defined in the config file"
  )
  .action(selectWorkspace);

cli
  .command("project")
  .description("Select a project from a defined workspace")
  .option("-n, --name <name>", "Select a project By name");

cli
  .command("whoami")
  .description("View the current logged in user")
  .action(() => {
    console.log("OriginalTimi-2");
  });

cli.command("logout").description("Logout current session").action(logout);

cli.parse();
