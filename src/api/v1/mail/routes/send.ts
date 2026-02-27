import express from "express";
import { sendMailController } from "../controller/sendMail.controller";
import { verifyApiKey } from "../middleware/auth.middleware";

const router = express.Router();

// Apply API key verification middleware before the controller
router.post("/", verifyApiKey, sendMailController);

export default router;
