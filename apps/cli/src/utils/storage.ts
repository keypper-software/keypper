import { STORAGE_PATH } from "../constants";
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

    try {
      await fs.access(storage1);
    } catch (error) {
      await fs.writeFile(storage1, JSON.stringify({}, null, 2), "utf-8");
    }

    const store = ((await fs.readFile(storage1, "utf-8")) || {}) as StorageOBJ;

    const writeToStore = async (data: Partial<StorageOBJ>) => {
      try {
        await fs.writeFile(storage1, JSON.stringify(data, null, 2), "utf-8");
      } catch (error) {
        throw error;
      }
    };
    const readFromStore = async () => {
      try {
        return JSON.parse(
          (await fs.readFile(storage1, "utf-8")) || "{}"
        ) as StorageOBJ;
      } catch (error) {
        throw error;
      }
    };

    return {
      writeToStore,
      readFromStore,
    };
  } catch (error) {
    throw error;
  }
};
