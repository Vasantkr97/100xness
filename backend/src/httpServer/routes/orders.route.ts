import express from "express";
import { cancelOrder, getPositions, orderDetails, orderStatus, placeOrder, userOrders } from "../controllers/orders.controller";

const router = express.Router();

router.post("/place", placeOrder);

router.get('/allOrders', userOrders);

router.get('/:orderId', orderDetails);

router.get('/:orderId/status', orderStatus);

router.delete('/:orderId', cancelOrder);

router.get('/positions', getPositions);


export default router;