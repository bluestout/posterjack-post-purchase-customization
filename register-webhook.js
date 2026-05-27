/**
 * Run once to register the orders/create webhook with Shopify.
 * Usage: node register-webhook.js <your-server-url>
 * Example: node register-webhook.js https://posterjack-backend.railway.app
 */

import "dotenv/config";

const serverUrl = process.argv[2];

if (!serverUrl) {
  console.error("Usage: node register-webhook.js <server-url>");
  console.error("Example: node register-webhook.js https://your-server.railway.app");
  process.exit(1);
}

const webhookAddress = `${serverUrl}/webhooks/orders-create`;

const res = await fetch(
  `https://${process.env.SHOP_DOMAIN}/admin/api/2025-01/webhooks.json`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
    },
    body: JSON.stringify({
      webhook: {
        topic: "orders/create",
        address: webhookAddress,
        format: "json",
      },
    }),
  }
);

const data = await res.json();

if (data.webhook) {
  console.log(`Webhook registered successfully!`);
  console.log(`  ID      : ${data.webhook.id}`);
  console.log(`  Topic   : ${data.webhook.topic}`);
  console.log(`  Address : ${data.webhook.address}`);
} else {
  console.error("Failed to register webhook:", JSON.stringify(data, null, 2));
  process.exit(1);
}
