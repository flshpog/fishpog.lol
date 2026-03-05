import express from "express";
import cors from "cors";
import { initDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import syncRoutes from "./routes/sync.js";

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "yourhorizon-api" });
});

app.use("/auth", authRoutes);
app.use("/sync", syncRoutes);

async function start() {
  try {
    await initDB();
    console.log("Database initialized");

    app.listen(PORT, () => {
      console.log(`YourHorizon API running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start:", err);
    process.exit(1);
  }
}

start();
