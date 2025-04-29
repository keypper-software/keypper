// #!/usr/bin/env node
import dotenv from "dotenv";
dotenv.config();
import cli from "./cli";
import login from "./actions/login";
import { VERSION } from "./constants";
import logout from "./actions/logout";

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
  .command("whoami")
  .description("View the current logged in user")
  .action(() => {
    console.log("OriginalTimi-2");
  });

cli.command("logout").description("Logout current session").action(logout);

cli.parse();
