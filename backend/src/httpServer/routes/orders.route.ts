

import express from "express";
import { cancelOrder, getPositions, orderDetails, orderStatus, placeOrder, userOrders } from "../controllers/orders.controller";
import { authentication } from "../middleware/auth";

const router = express.Router();

//router.use(authentication)

router.post("/place", placeOrder);
router.get('/allOrders', userOrders);


router.get('/positions', getPositions);


router.get('/:orderId', orderDetails);
router.get('/:orderId/status', orderStatus);
router.delete('/:orderId', cancelOrder);


export default router;