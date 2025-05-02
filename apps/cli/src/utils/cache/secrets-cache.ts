import { Secret } from "@/api/workspaces";
import getMachineInfo from "../get-machine-info";
import storage from "../storage";
import path from "path";
import { STORAGE_PATH } from "@/constants";
import crypto from "crypto";
import fs from "fs/promises";
import { decrypt, encrypt } from "../encryption";
import logger from "../logger";
interface Params {
  workspaceId: string;
  environmentId: string;
  projectId: string;
}

export default async ({ workspaceId, environmentId, projectId }: Params) => {
  const cwd = process.cwd();
  const { user, machine } = getMachineInfo();
  const CACHE_INDEX = Date.now();
  const KEY = `${user}|${machine}`;
  const CACHE_RAW_HASH = `${cwd}|${machine}|${user}|${workspaceId}|${projectId}|${environmentId}`;
  const CACHE_HASH = crypto
    .createHash("sha256")
    .update(CACHE_RAW_HASH)
    .digest("hex");

  const generateCache = async (data: Secret[]) => {
    try {
      const CACHE_FILE = path.join(
        STORAGE_PATH,
        ".keypper-cache",
        CACHE_HASH,
        `${CACHE_INDEX}.cache`
      );
      await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
      const cacheContent = encrypt(JSON.stringify(data), KEY);
      await fs.writeFile(CACHE_FILE, cacheContent, "utf-8");
      console.log("> cached created", CACHE_INDEX);
    } catch (error) {
      logger("cached missed", { style: "DIM" });
    }
  };

  const getCache = async () => {
    const CACHE_DIR = path.join(STORAGE_PATH, ".keypper-cache", CACHE_HASH);
    await fs.mkdir(CACHE_DIR, { recursive: true });
    try {
      const dirs = await fs.readdir(CACHE_DIR, { recursive: true });

      const validDirs = dirs.filter((d) => {
        const key = Number(d.split(".")[0]);
        if (key) return true;
        return;
      });

      if (validDirs.length == 0)
        return logger(`No cache >> proceeding execution`, { style: "DIM" });

      const latestCache = validDirs[validDirs.length - 1];
      const cacheContent = await fs.readFile(
        path.join(CACHE_DIR, latestCache),
        "utf-8"
      );
      if (!cacheContent) return;
      const decrypted = decrypt(cacheContent, KEY);
      if (!decrypted) {
        return;
      }
      logger(`using cache >> ${latestCache.replace(".cache", "")}`, {
        style: "DIM",
      });
      return JSON.parse(decrypted) || [];
    } catch (error) {
      logger("cache missed", { style: "DIM" });
      return [];
    }
  };

  return {
    generateCache,
    getCache,
  };
};
