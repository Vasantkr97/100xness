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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.signin = signin;
exports.logout = logout;
const prismaClient_1 = require("../lib/prismaClient");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function signup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("message from postman");
        const { email, username, password } = req.body;
        try {
            if (!email || !password || !username) {
                return res.status(400).json({ msg: "All fields are required" });
            }
            const existingUser = yield prismaClient_1.prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ msg: "Email already exists, Please use a different one" });
            }
            const User = yield prismaClient_1.prisma.user.create({
                data: {
                    email,
                    username,
                    password
                }
            });
            const token = jsonwebtoken_1.default.sign({ userId: User.id }, "vasanth");
            res.cookie("jwt", token);
            res.json({
                success: true,
                user: { id: User.id, email, username, balance: User.balance }
            });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    });
}
;
function signin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ msg: "email and password are required" });
            }
            const user = yield prismaClient_1.prisma.user.findUnique({
                where: { email }
            });
            if (!user || !(password === user.password)) {
                return res.status(400).json({ message: "Invalid Credentials" });
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, "vasanth");
            res.cookie("jwt", token);
            res.json({
                success: true,
                user: { id: user.id, email: user.email, username: user.username, balance: user.balance }
            });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}
function logout(req, res) {
    res.clearCookie('jwt');
    res.status(200).json({ success: true, msg: "logout successfully" });
}
