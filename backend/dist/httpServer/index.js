"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
// import candlesRoutes from "./routes/candles.route"
// import authRoutes from "./routes/auth.route"
const orders_route_1 = __importDefault(require("./routes/orders.route"));
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "https://localhost:5173"],
    credentials: true,
}));
app.use(express_1.default.json());
// app.use("/api/candles", candlesRoutes);
// app.use("/api/auth", authRoutes);
// app.use("/api/orders", orderRoutes)
// console.log("Orders routes registered");
// app.use('*', (req, res) => {
//     console.log(`Unmarched route: ${req.method} ${req.originalUrl}`);
//     res.status(404).json({
//         error: 'Route not Found',
//         method: req.method,
//         url: req.originalUrl
//     })
// })
console.log("About to register orders routes...");
app.use("/api/orders", orders_route_1.default);
console.log("Orders routes registered successfully");
app.get('/', (req, res) => {
    res.send("Exness");
});
// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working with orders routes only!' });
});
app.listen(PORT, () => {
    console.log(`http server is running on port ${PORT}`);
});
