import dotenv from "dotenv";
dotenv.config();
import getUrl from "./utils/get-url";
import cli from "./cli";
import open from "open";
import login from "./actions/login";

cli
  .name("keypper")
  .description(
    "Effortlessly secure and manage tokens, credentials, and encryption keys across all environments — via CLI."
  )
  .version("0.0.1");

cli.command("login").description("Login to your workspace").action(login);

cli
  .command("whoami")
  .description("View the current logged in user")
  .action(() => {
    console.log("OriginalTImi-2");
  });

cli
  .command("logout")
  .description("Logout current session")
  .action(() => {
    console.log("Logged Out");
  });

cli.parse();
