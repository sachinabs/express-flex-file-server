import crypto from "crypto";

export function generatePrefix(type = "id") {
  if (type === "uuid") return crypto.randomUUID();
  if (type === "timestamp") return Date.now().toString();
  return crypto.randomBytes(6).toString("hex");
}
