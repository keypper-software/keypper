#!/usr/bin/env node

import dotenv from "dotenv";
dotenv.config();
import cli from "./cli";
import login from "@/actions/login";
import { VERSION } from "@/constants";
import logout from "@/actions/logout";
import initWorkspace from "./actions/init-workspace";
import runner from "./actions/runner";

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
  .description("Initialize Keypper configuration in your project")
  .action(initWorkspace);

cli
  .command("run")
  .description("Run a command in the context of your Keypper workspace")
  .option("-c, --no-cache", "Do not use cache", true)
  .option(
    "-i, --ignore",
    "Ignore errors or warnings related to keypper (optional value)",
    false
  )
  .argument("<command...>", "Command to run")
  .action(runner);

cli
  .command("whoami")
  .description("View the current logged in user")
  .action(() => {
    console.log("OriginalTimi-2");
  });

cli.command("logout").description("Logout current session").action(logout);

cli.parse();
