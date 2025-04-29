import {
  randomBytes,
  scryptSync,
  createCipheriv,
  createDecipheriv,
  createHash,
} from "crypto";

type EncryptedPayload = {
  salt: string;
  iv: string;
  authTag: string;
  ciphertext: string;
};

export function encrypt(text: string, secretKey: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(secretKey, salt, 32);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  const payload: EncryptedPayload = {
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
    ciphertext: encrypted.toString("hex"),
  };

  return JSON.stringify(payload);
}

export function decrypt(payloadString: string, secretKey: string): string {
  const payload: EncryptedPayload = JSON.parse(payloadString);

  const salt = Buffer.from(payload.salt, "hex");
  const iv = Buffer.from(payload.iv, "hex");
  const authTag = Buffer.from(payload.authTag, "hex");
  const ciphertext = Buffer.from(payload.ciphertext, "hex");

  const key = scryptSync(secretKey, salt, 32);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export function hash(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}
