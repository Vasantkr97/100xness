import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prismaClient";

export async function signup(req: Request, res: Response) {
    const { email,username, password } = req.body;
    
    try {
        if (!email || !password || !username) {
            return res.status(400).json({ msg: "All fields are required"})
        }

        const existingUser = await prisma.user.findUnique({where: { email }})
        if (existingUser) {
            return res.status(400).json({ msg: "Email already exists, Please use a different one"})
        }

        const hashedPassword = bcrypt.hash(password, 10)

        const User = await prisma.user.create({
            data: {
                email,
                username,
                password
            }
        })

        const token: string = jwt.sign({ userId: User.id }, process.env.JWT_SECRET as string)
    } catch {

    }
    
}