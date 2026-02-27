import express from "express";
import { salesResultController } from "../controller/salesResult.controller";

const router = express.Router();
router.post("/", salesResultController);

export default router;
