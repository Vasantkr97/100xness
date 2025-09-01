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
                price: new Prisma.Decimal(curPrice),
                leverage,
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
        console.error("Error placing Order:",err);
        res.status(500).json({
            success: false,
            msg: "Interval Server Error while placing order",
        })
    }
    
};

export async function userOrders(req: Request, res: Response): Promise<void> {
    try {
        const { userId } = req.body;

        if (!userId) {
            res.status(400).json({
                success: false,
                message: "userId is required"
            });
        };

        const orders = await prisma.order.findMany({
            where: { userId },
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

export async function orderDetails(req: Request, res: Response ): Promise<void> {
    
};

export async function orderStatus(): Promise<void> {

};

export async function cancelOrder(req: Request, res: Response): Promise<void> {
};

export async function getPositions(): Promise<void> {

};