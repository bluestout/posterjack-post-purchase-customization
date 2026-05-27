import { Router } from "express";
import { handleOrdersCreate } from "./webhooks/ordersCreate.js";

const router = Router();

router.post("/webhooks/orders-create", handleOrdersCreate);

// Health check for uptime monitoring
router.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

export default router;
