import "dotenv/config";
import express from "express";
import routes from "./src/routes.js";

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
