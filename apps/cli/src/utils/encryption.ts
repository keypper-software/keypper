import crypto from "crypto";
const IV = Buffer.alloc(16);

export const encrypt = (text: string, key: string): string => {
  const ENCRYPTION_KEY = crypto.createHash("sha256").update(key).digest();
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, IV);
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

export const decrypt = (encryptedText: string, key: string): string => {
  const ENCRYPTION_KEY = crypto.createHash("sha256").update(key).digest();
  const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, IV);
  let decrypted = decipher.update(encryptedText, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};
