import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getMessages } from "../controllers/messageController.js";

const router = express.Router();

router.get("/:projectId", protect, getMessages);

export default router;