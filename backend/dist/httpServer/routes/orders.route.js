"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const orders_controller_1 = require("../controllers/orders.controller");
const router = express_1.default.Router();
//router.use(authentication)
router.post("/place", orders_controller_1.placeOrder);
router.get('/allOrders', orders_controller_1.userOrders);
router.get('/positions', orders_controller_1.getPositions);
router.get('/:orderId', orders_controller_1.orderDetails);
router.get('/:orderId/status', orders_controller_1.orderStatus);
router.delete('/:orderId', orders_controller_1.cancelOrder);
exports.default = router;
