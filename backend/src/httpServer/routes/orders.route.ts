

import express from "express";
import { cancelOrder, placeOrder, userOrders } from "../controllers/orders.controller";
import { authentication } from "../middleware/auth";

const router = express.Router();

//router.use(authentication)

router.post("/place", placeOrder);

router.get('/allOrders', userOrders);

router.post('/cancelOrder', cancelOrder);



export default router;