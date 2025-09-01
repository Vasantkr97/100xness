import { prisma } from "../lib/prismaClient";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { getPrice } from "../subscriber/subBe";


export async function placeOrder(req: Request, res: Response): Promise<void> {
    console.log("message from client to place order")
    try {
        const { userId, symbol, side, quantity, leverage=1 } = req.body;

       if (!userId || !symbol || !side || !quantity) {
            res.status(400).json({
                success: false,
                msg: "Missging required fields: userID, Symbol, quantity, price"
            });
            return
        };

        const user = await prisma.user.findUnique({
            where: {id: userId}
        });

        if (!user) {
            res.status(404).json({
                success: false,
                msg: "User not found"
            })
            return
        }

        const priceData = getPrice(symbol);

        if (!priceData) {
            res.status(400).json({
                success: false,
                msg: "Order cancelled",
            })
            return;
        }

        const curPrice = priceData.price;
        const marginUsed = new Prisma.Decimal((parseFloat(quantity)*curPrice)/leverage);

        if (user.balance.lt(marginUsed)) {
            res.status(400).json({
                success: false,
                message: "Insufficient balance"
            });
            return;
        }
        //creating order
        const order = await prisma.order.create({
            data: {
                userId,
                symbol,
                side,
                quantity: new Prisma.Decimal(quantity),
                entryPrice: new Prisma.Decimal(curPrice),
                leverage,
                marginUsed,
                status: "FILLED"
            },
            include: {
                user: {
                    select: {
                        username: true,
                        email: true
                    }
                }
            }
        })

        //Updating user Balance
        await prisma.user.update({
            where: { id: userId },
            data: {
                balance: user.balance.sub(marginUsed)
            }
        });
        

        res.status(201).json({
            success: true,
            msg: "Order placed successfully",
            data: {
                ...order,
                executionPrice: curPrice,
                marginUsed: marginUsed.toString(),
                executedAt: new Date().toISOString()
            }
        })
    } catch(err) {
        const error = err as Error;
        console.error("Error placing Order:", error.message);
        res.status(500).json({
            success: false,
            msg: "Interval Server Error while placing order",
        })
    }
    
};

export async function userOrders(req: Request, res: Response): Promise<void> {
    try {
        const { userId } = req.body as { userId?: string };

        if (!userId || typeof userId !== "string") {
            res.status(400).json({
                success: false,
                message: "valid userId is required"
            });
        };

        const orders = await prisma.order.findMany({
            where: { userId,
                status: "FILLED"
             },
            orderBy: {
                createdAt: "desc"
            }
        });
        
        res.status(200).json({
            success: true,
            data: orders,
        })
    } catch (err) {
        console.log("Error fetching User Orders:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error while getting all Orders",
        
    })
    }
};


export async function cancelOrder(req: Request, res: Response): Promise<void> {
    try {
        const { orderId } = req.body as { orderId?: string};
        const { userId } = req.body as { userId?: string};

        if (!orderId) {
            res.status(400).json({
                success: false,
                message: "OrderId is required",
            })
        }

        const existingOrder = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId,
            }
        });

        if (!existingOrder) {
            res.status(404).json({
                success: false,
                message: "Order not found or cannot be cancelled"
            });
            return
        }

        const result = await prisma.order.updateMany({
            where: {
                id: orderId,
                userId,
                status: { not: "CANCELLED"}
            },
            data: {
                status: "CANCELLED"
            },
        });

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            data: result
        })
    } catch (err: unknown) {
        const error = err as Error;
        console.error('Error cancelling order:', error);
        res.status(500).json({
            success: false,
            message: "internal server error",
            error: error.message
        })
    }
};

