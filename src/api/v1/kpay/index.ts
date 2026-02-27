import { Router } from "express";
import CheckoutRouter from "./routes/checkout.routes";
import ResultRouter from "./routes/result.routes";
import RefundRouter from "./routes/refund.routes";
import SalesResultRouter from "./routes/salesResult.routes";

const router = Router();

router.use("/checkout", CheckoutRouter);
router.use("/result", ResultRouter);
router.use("/refund", RefundRouter);
router.use("/salesResult", SalesResultRouter);

export default router;
