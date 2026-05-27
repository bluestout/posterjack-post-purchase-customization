import { Router } from "express";
import { handleOrdersCreate } from "./webhooks/ordersCreate.js";

const router = Router();

// Raw body needed for HMAC verification
router.post(
  "/webhooks/orders-create",
  (req, res, next) => {
    let data = [];
    req.on("data", (chunk) => data.push(chunk));
    req.on("end", () => {
      req.rawBody = Buffer.concat(data);
      next();
    });
  },
  handleOrdersCreate
);

// Health check for uptime monitoring
router.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

export default router;
