import "dotenv/config";
import express from "express";
import routes from "./src/routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Standard JSON body for non-webhook routes
app.use(express.json());

app.use("/", routes);

app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT} (${process.env.NODE_ENV || "development"})`);
});
