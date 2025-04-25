import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "crypto";

/**
 * Encrypts a text string using AES-256-CTR encryption
 * @param text The text to encrypt
 * @param secretKey The secret key used for encryption
 * @returns The encrypted text in the format "iv:encryptedText"
 */
export function encrypt(text: string, secretKey: string): string {
  const iv = randomBytes(16);
  const key = scryptSync(secretKey, "salt", 32);
  const cipher = createCipheriv("aes-256-ctr", key, iv);
  const encryptedText = Buffer.concat([cipher.update(text), cipher.final()]);
  return `${iv.toString("hex")}:${encryptedText.toString("hex")}`;
}

/**
 * Decrypts an encrypted text string using AES-256-CTR decryption
 * @param text The encrypted text in the format "iv:encryptedText"
 * @param secretKey The secret key used for decryption
 * @returns The decrypted text
 */
export function decrypt(text: string, secretKey: string): string {
  const [iv, encryptedText] = text.split(":");
  const key = scryptSync(secretKey, "salt", 32);
  const decipher = createDecipheriv("aes-256-ctr", key, Buffer.from(iv, "hex"));
  const decryptedText = Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "hex")),
    decipher.final(),
  ]);
  return decryptedText.toString();
}
