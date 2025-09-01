"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.placeOrder = placeOrder;
exports.userOrders = userOrders;
exports.orderDetails = orderDetails;
exports.orderStatus = orderStatus;
exports.cancelOrder = cancelOrder;
exports.getPositions = getPositions;
const prismaClient_1 = require("../lib/prismaClient");
const client_1 = require("@prisma/client");
function placeOrder(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("message from client to place order");
        try {
            const { userId, symbol, side, quantity, price, leverage = 1 } = req.body;
            if (!userId || !symbol || !side || !quantity || !price) {
                res.status(400).json({
                    success: false,
                    msg: "Missgin required fields: userID, Symbol, quantity, price"
                });
                return;
            }
            ;
            const user = yield prismaClient_1.prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user) {
                res.status(404).json({
                    success: false,
                    msg: "User not found"
                });
                return;
            }
            const marginUsed = new client_1.Prisma.Decimal((parseFloat(quantity) * parseFloat(price)) / leverage);
            if (user.balance < marginUsed) {
                res.status(400).json({
                    success: false,
                    message: "Insufficient balance"
                });
                return;
            }
            //creating the order
            const order = yield prismaClient_1.prisma.order.create({
                data: {
                    userId,
                    symbol,
                    side,
                    quantity: new client_1.Prisma.Decimal(quantity),
                    price: new client_1.Prisma.Decimal(price),
                    leverage,
                    status: "PENDING"
                },
                include: {
                    user: {
                        select: {
                            username: true,
                            email: true
                        }
                    }
                }
            });
            res.status(201).json({
                success: true,
                msg: "Order placed successfully",
                data: order
            });
        }
        catch (err) {
            console.error("Error placing Order:", err);
            res.status(500).json({
                success: false,
                msg: "Interval Server Error while placing order",
            });
        }
    });
}
;
function userOrders() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
;
function orderDetails() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
;
function orderStatus() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
;
function cancelOrder() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
;
function getPositions() {
    return __awaiter(this, void 0, void 0, function* () {
    });
}
;
