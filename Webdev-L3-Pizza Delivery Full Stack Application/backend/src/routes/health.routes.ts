import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

const READY_STATE_LABELS: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Bella Pizza API is running",
    timestamp: new Date().toISOString(),
    database: READY_STATE_LABELS[mongoose.connection.readyState] ?? "unknown",
  });
});

export default router;
