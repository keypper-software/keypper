import path from "node:path";
import os from "node:os";

export const STORAGE_PATH = path.join(os.homedir(), ".keypper");

export const VERSION = "0.0.0";
export const AUTH_UPDATE_INTERVAL = 5000;
