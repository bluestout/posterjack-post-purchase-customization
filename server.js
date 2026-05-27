import "dotenv/config";
import express from "express";
import routes from "./src/routes.js";

const REQUIRED_ENV = [
  "SHOP_DOMAIN",
  "SHOP_URL",
  "SHOPIFY_ACCESS_TOKEN",
  "SHOPIFY_WEBHOOK_SECRET",
];

const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`[Server] Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Raw buffer for webhook routes (needed for HMAC verification)
app.use("/webhooks", express.raw({ type: "application/json" }));

// Standard JSON body for all other routes
app.use(express.json());

app.use("/", routes);

app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT} (${process.env.NODE_ENV || "development"})`);
});
