"use client";

export type TotpAlgorithm = "SHA-1" | "SHA-256" | "SHA-512";

export type TotpEntry = {
  id: string;
  issuer: string;
  account: string;
  secret: string;
  digits: 6 | 8;
  period: number;
  algorithm: TotpAlgorithm;
  createdAt: string;
};

export function decodeBase32(value: string) {
  const normalized = value.toUpperCase().replace(/[\s-]/g, "").replace(/=+$/, "");
  if (!normalized || /[^A-Z2-7]/.test(normalized)) throw new Error("The TOTP key must be Base32.");
  let bits = "";
  for (const character of normalized) bits += "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".indexOf(character).toString(2).padStart(5, "0");
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let index = 0; index < bytes.length; index += 1) bytes[index] = Number.parseInt(bits.slice(index * 8, index * 8 + 8), 2);
  if (!bytes.length) throw new Error("The TOTP key is empty.");
  return bytes;
}

export function normalizeSecret(secret: string) {
  decodeBase32(secret);
  return secret.toUpperCase().replace(/[\s-]/g, "").replace(/=+$/, "");
}

export async function getTotpCode(entry: Pick<TotpEntry, "secret" | "digits" | "period" | "algorithm">, now = Date.now()) {
  const counter = Math.floor(now / 1000 / entry.period);
  const message = new Uint8Array(8);
  for (let index = 7; index >= 0; index -= 1) message[index] = Math.floor(counter / 256 ** (7 - index)) % 256;
  const key = await crypto.subtle.importKey("raw", decodeBase32(entry.secret), { name: "HMAC", hash: entry.algorithm }, false, ["sign"]);
  const digest = new Uint8Array(await crypto.subtle.sign("HMAC", key, message));
  const offset = digest[digest.length - 1] & 0x0f;
  const value = ((digest[offset] & 0x7f) << 24) | (digest[offset + 1] << 16) | (digest[offset + 2] << 8) | digest[offset + 3];
  return String(value % 10 ** entry.digits).padStart(entry.digits, "0");
}
