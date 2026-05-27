import crypto from "crypto";
import { processMarketplaceOrder } from "../services/orderProcessor.js";

// Orders from the Online Store — these already go through the builder, skip them
const ONLINE_STORE_SOURCES = new Set(["web"]);

function verifyWebhook(rawBody, hmacHeader) {
  const digest = crypto
    .createHmac("sha256", process.env.SHOPIFY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("base64");

  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
  } catch {
    // Buffers of different length throw — treat as invalid
    return false;
  }
}

export async function handleOrdersCreate(req, res) {
  const hmac = req.headers["x-shopify-hmac-sha256"];

  if (!hmac || !verifyWebhook(req.body, hmac)) {
    console.warn("[Webhook] Invalid HMAC — request rejected");
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Respond immediately — Shopify retries if it doesn't get 200 within 5s
  res.status(200).json({ received: true });

  const order = JSON.parse(req.body);
  const { name: orderName, source_name: sourceName } = order;

  console.log(`[Webhook] Order ${orderName} | source_name: "${sourceName}"`);

  if (ONLINE_STORE_SOURCES.has(sourceName)) {
    console.log(`[Webhook] Order ${orderName} — Online Store, skipping.`);
    return;
  }

  try {
    await processMarketplaceOrder(order);
  } catch (err) {
    // 200 already sent — log for monitoring (Sentry, Datadog, etc.)
    console.error(`[Webhook] Pipeline error for Order ${orderName}:`, err.message);
  }
}
