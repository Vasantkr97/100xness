import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prismaClient";
import jwt from "jsonwebtoken";

export async function signup(req: Request, res: Response) {
    console.log("message from postman")
    const { email,username, password } = req.body;
    
    try {
        if (!email || !password || !username) {
            return res.status(400).json({ msg: "All fields are required"})
        }

        const existingUser = await prisma.user.findUnique({where: { email }})
        if (existingUser) {
            return res.status(400).json({ msg: "Email already exists, Please use a different one"})
        }

        const User = await prisma.user.create({
            data: {
                email,
                username,
                password
            }
        })

        const token = jwt.sign({ userId: User.id }, "vasanth")

        res.cookie("jwt", token)

        res.json({
            success: true,
            user: { id: User.id, email, username, balance: User.balance}
        })
    } catch(error: any) {
        res.status(400).json({ error: error.message})
    }   
};



export async function signin(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ msg: "email and password are required"})
        }

        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user || !(password === user.password)) {
            return res.status(400).json({ message: "Invalid Credentials"});
        }

        const token = jwt.sign({ userId: user.id }, "vasanth");

        res.cookie("jwt", token)

        res.json({
            success: true,
            user: { id: user.id, email: user.email, username: user.username, balance: user.balance }
        })
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}

export function logout(req: any, res: any) {
    res.clearCookie('jwt')
    res.status(200).json({ success: true, msg: "logout successfully"});
}