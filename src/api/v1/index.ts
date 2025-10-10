import { Router } from "express";
import AllHostedCheckoutOrderRouter from "./routes/AllHostedCheckoutOrder";

const router = Router();
router.use('/all-hosted-checkout-order', AllHostedCheckoutOrderRouter);
export default router;