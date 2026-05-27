import crypto from "crypto";

const TOKEN_EXPIRY_HOURS = 72;

export function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function generateExpiresAt(hours = TOKEN_EXPIRY_HOURS) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + hours);
  return expiresAt.toISOString();
}

export function buildCustomizationLink(token, orderId) {
  const base = process.env.SHOP_URL;
  const url = new URL("/pages/customize", base);
  url.searchParams.set("token", token);
  url.searchParams.set("order_id", orderId);
  return url.toString();
}

export function createTokenPayload(orderId) {
  const token = generateToken();
  const expiresAt = generateExpiresAt();
  const link = buildCustomizationLink(token, orderId);

  return {
    token,
    customization_link: link,
    status: "pending",
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  };
}
