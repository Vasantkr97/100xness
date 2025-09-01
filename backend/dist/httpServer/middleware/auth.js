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
exports.authentication = authentication;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prismaClient_1 = require("../lib/prismaClient");
function authentication(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
        if (!token)
            return res.status(401).json({ error: "unauthorized user" });
        try {
            const decodedToken = jsonwebtoken_1.default.verify(token, "vasanth");
            if (!decodedToken || !decodedToken.userId) {
                return res.status(401).json({ msg: "invalid token" });
            }
            const user = yield prismaClient_1.prisma.user.findUnique({
                where: { id: decodedToken.userId },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    balance: true
                }
            });
            if (!user) {
                res.status(401).json({ stauts: "error", msg: "User not found or inactive" });
                return;
            }
            req.user = user;
            next();
        }
        catch (e) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }
    });
}
