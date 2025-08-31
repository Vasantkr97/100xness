import { NextFunction,Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prismaClient";
import { Decimal } from "@prisma/client/runtime/library";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        username: string;
        balance: Decimal;
    };
}

export async function authentication(req: AuthRequest, res: Response, next: NextFunction) {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: "unauthorized user" });
    try {
        const decodedToken: any = jwt.verify(token, "vasanth");
        if (!decodedToken || !decodedToken.userId) {
            return res.status(401).json({ msg: "invalid token"})
        }

        const user = await prisma.user.findUnique({
            where: { id: decodedToken.userId },
            select: {
                id: true,
                email: true,
                username: true,
                balance: true
            }
        });

        if (!user) {
            res.status(401).json({ stauts: "error", msg: "User not found or inactive" })
            return;
        }

        req.user = user;
        next();
    } catch (e) {
        return res.status(401).json({ error: "Invalid or expired token"})
    }
}