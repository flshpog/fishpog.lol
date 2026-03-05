import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import pool from "../db.js";

const router = Router();

// GET /sync - Pull user data from cloud
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT data, updated_at FROM user_data WHERE user_id = $1",
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.json({ data: {}, updatedAt: null });
    }

    const row = result.rows[0];
    res.json({ data: row.data, updatedAt: row.updated_at });
  } catch (err) {
    console.error("Pull error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /sync - Push user data to cloud
router.post("/", authenticate, async (req, res) => {
  try {
    const { data } = req.body;
    if (!data || typeof data !== "object") {
      return res.status(400).json({ error: "Invalid data payload" });
    }

    await pool.query(
      `INSERT INTO user_data (user_id, data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE
       SET data = $2, updated_at = NOW()`,
      [req.userId, JSON.stringify(data)]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Push error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
