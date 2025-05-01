import path from "node:path";
import os from "node:os";

export const STORAGE_PATH = path.join(os.homedir(), ".keypper");
export const TEMP_PATH = path.join(STORAGE_PATH, "temp");

export const VERSION = "0.0.0";
export const AUTH_UPDATE_INTERVAL = 5000;
export const BASE_URL = "http://localhost:3000";
