import { STORAGE_PATH, TEMP_PATH } from "@/constants";
import path from "node:path";
import fs from "fs/promises";

export interface StorageOBJ {
  _auth: {
    preId?: string;
    phrase?: string;
    exTimestamp?: string | number;
    timestamp?: string | number;
    session?: {
      id: string;
      expireAt?: string;
      version?: string;
    };
  };
}

export default async () => {
  try {
    await fs.mkdir(STORAGE_PATH, { recursive: true });
    const storage1 = path.join(STORAGE_PATH, "keep.json");
    const storage2 = path.join(TEMP_PATH, "log.txt");
    const storage3 = path.join(TEMP_PATH, "network.json");

    const checkFile = async (path: string) => {
      try {
        await fs.access(path);
      } catch (error) {
        await fs.writeFile(path, JSON.stringify({}, null, 2), "utf-8");
      }
    };

    await checkFile(storage1);

    const writeToStore = async (data: Partial<StorageOBJ>) => {
      try {
        await fs.writeFile(storage1, JSON.stringify(data, null, 2), "utf-8");
      } catch (error) {
        throw error;
      }
    };

    const readFromStore = async () => {
      try {
        return JSON.parse((await readFromFile(storage1)) || "{}") as StorageOBJ;
      } catch (error) {
        throw error;
      }
    };

    const readFromFile = async (filePath: string) => {
      try {
        return await fs.readFile(filePath, "utf-8");
      } catch (error) {
        throw error;
      }
    };

    const initLogs = async () => {
      await fs.mkdir(TEMP_PATH, { recursive: true });

      await checkFile(storage2);
      await checkFile(storage3);
    };

    return {
      writeToStore,
      readFromStore,
      initLogs,
      // readFromFile,
      checkFile,
      paths: {
        store: storage1,
        logs: storage2,
      },
    };
  } catch (error) {
    throw error;
  }
};
