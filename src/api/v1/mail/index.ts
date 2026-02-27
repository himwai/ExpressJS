import { Router } from "express";
import SendRouter from "./routes/send";

const router = Router();

router.use('/send', SendRouter);

export default router;
